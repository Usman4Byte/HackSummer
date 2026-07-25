import type {
  AuditEvent,
  Claim,
  ReadSource,
  RunResponse,
  Scenario,
  ToolAction,
  TrustReport,
} from "./types";
import { planAgentTurn, classifyPrompt, type ProposedToolCall } from "./agent";
import { evaluate } from "./firewall";
import {
  poisonedReadmeSource,
  NASA_SOURCE,
  WIKI_SOURCE,
  KB_CACHE_SOURCE,
  INJECTION_CLAIMS_SAFE,
  TRUTH_CLAIMS,
  FREE_CLAIMS_FALLBACK,
} from "./fixtures";
import { analyzeAnswer, scoreClaims } from "./confidence";
import { hasLLMKey } from "./llm";
import { appendAudit } from "./db";

function ts(offsetMs: number): string {
  const s = (offsetMs / 1000).toFixed(2);
  return `T+${s}s`;
}

function readsForScenario(scenario: Scenario, hasLLM: boolean): ReadSource[] {
  if (scenario === "injection") return [poisonedReadmeSource()];
  if (scenario === "truth") return [NASA_SOURCE, WIKI_SOURCE];
  return hasLLM ? [] : [KB_CACHE_SOURCE];
}

export async function runTurn(
  input: { prompt?: string; scenario?: Scenario; sentinelOn: boolean }
): Promise<RunResponse> {
  const prompt = (input.prompt || "").trim();
  const scenario: Scenario = input.scenario || classifyPrompt(prompt);
  const sentinelOn = !!input.sentinelOn;

  const plan = await planAgentTurn(prompt || scenario, scenario);
  const reads = readsForScenario(scenario, hasLLMKey());

  const audit: AuditEvent[] = [];
  let clock = 20;

  for (const r of reads) {
    audit.push({
      ts: ts(clock),
      kind: "read",
      detail: `fetched ${r.source} (${Math.max(1, Math.round(r.content.length / 100)) / 10} KB)`,
    });
    clock += 90;
    if (sentinelOn && r.flaggedSpans.length > 0) {
      const span = r.flaggedSpans[0];
      audit.push({
        ts: ts(clock),
        kind: "attempt",
        detail: `detected embedded instruction span (chars ${span.start}–${span.end})`,
      });
      clock += 30;
    }
  }

  const actions: ToolAction[] = [];
  for (const call of plan.proposedCalls) {
    const dec = sentinelOn
      ? evaluate({
          tool: call.tool,
          target: call.target,
          payload: call.payload,
          method: call.method,
        })
      : rawAllow(call);
    const outbound =
      call.tool.startsWith("http.") ||
      call.target.startsWith("http://") ||
      call.target.startsWith("https://");
    if (outbound && call.payload) {
      audit.push({
        ts: ts(clock),
        kind: "attempt",
        detail: `${call.tool} → ${strippedHost(call.target)} (${dec.payloadSummary})`,
      });
      clock += 30;
    }
    actions.push({
      tool: call.tool,
      target: call.target,
      payloadSummary: dec.payloadSummary,
      decision: dec.allow ? "allowed" : "blocked",
      reason: dec.reason,
    });
    if (!dec.allow) {
      audit.push({
        ts: ts(clock),
        kind: "decision",
        detail: `BLOCKED · rule ${dec.rule}`,
      });
      clock += 30;
    } else if (!sentinelOn && outbound && call.payload) {
      audit.push({
        ts: ts(clock),
        kind: "decision",
        detail: "ALLOWED · no policy engine active",
      });
      clock += 20;
    }
  }

  const anyBlocked = actions.some((a) => a.decision === "blocked");
  const answer = sentinelOn ? plan.safeAnswer : plan.rawAnswer;

  let claims: Claim[];
  if (!sentinelOn) {
    claims = splitToConfidentClaims(answer);
  } else if (scenario === "injection") {
    claims = INJECTION_CLAIMS_SAFE;
  } else if (scenario === "truth") {
    claims = TRUTH_CLAIMS;
  } else if (hasLLMKey()) {
    const contextTexts = reads.map((r) => `[${r.source}]\n${r.content}`);
    try {
      claims = await analyzeAnswer(answer, contextTexts);
      if (claims.length === 0) claims = FREE_CLAIMS_FALLBACK;
    } catch {
      claims = FREE_CLAIMS_FALLBACK;
    }
  } else {
    claims = FREE_CLAIMS_FALLBACK;
  }

  const score = sentinelOn ? scoreForScenario(scenario, claims, anyBlocked) : 0;

  if (sentinelOn) {
    const spec = claims.filter((c) => c.level === "speculation").length;
    const inf = claims.filter((c) => c.level === "inference").length;
    const gr = claims.filter((c) => c.level === "grounded").length;
    audit.push({
      ts: ts(clock),
      kind: "decision",
      detail: `calibrated score ${score} — ${gr} grounded, ${inf} inference, ${spec} speculation`,
    });
  }

  const trust: TrustReport = {
    score,
    claims,
    reads: sentinelOn ? reads.map((r) => ({ ...r })) : reads.map(stripFlags),
    actions,
    audit: sentinelOn ? audit : rawAudit(audit),
  };

  appendAudit({ scenario, sentinelOn, events: trust.audit }).catch(() => {});

  return {
    scenario,
    answer,
    trust,
  };
}

function rawAllow(call: ProposedToolCall) {
  const outbound =
    call.tool.startsWith("http.") ||
    call.target.startsWith("http://") ||
    call.target.startsWith("https://");
  const payloadSummary = call.payload
    ? `${call.method || "POST"} body includes secret token sk-live-…`
    : call.method || "GET";
  return {
    allow: true,
    reason: outbound ? "raw mode — no policy engine" : "read-only",
    rule: "raw-mode",
    payloadSummary: call.payload && call.payload.includes("sk-live") ? payloadSummary : `${call.method || "GET"}`,
  };
}

function scoreForScenario(scenario: Scenario, claims: Claim[], anyBlocked: boolean): number {
  if (scenario === "injection") return anyBlocked ? 92 : 18;
  if (scenario === "truth") return scoreClaims(claims);
  return scoreClaims(claims);
}

function splitToConfidentClaims(answer: string): Claim[] {
  return answer
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text, level: "grounded" as const }));
}

function stripFlags(r: ReadSource): ReadSource {
  return { ...r, flaggedSpans: [] };
}

function rawAudit(audit: AuditEvent[]): AuditEvent[] {
  return audit.filter((e) => e.kind === "read" || e.detail.includes("ALLOWED"));
}

function strippedHost(target: string): string {
  try {
    if (target.startsWith("http")) return new URL(target).host + new URL(target).pathname;
  } catch {}
  return target;
}
