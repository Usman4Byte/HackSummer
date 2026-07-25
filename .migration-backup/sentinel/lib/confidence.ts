import { callLLM, hasLLMKey } from "./llm";
import type { Claim, ClaimLevel } from "./types";

const CLAIM_WEIGHTS: Record<ClaimLevel, number> = {
  grounded: 1.0,
  inference: 0.45,
  speculation: 0.0,
};

export function scoreClaims(claims: Claim[]): number {
  if (claims.length === 0) return 0;
  const total = claims.reduce((s, c) => s + (CLAIM_WEIGHTS[c.level] ?? 0), 0);
  return Math.round((total / claims.length) * 100);
}

/**
 * Cost-optimized: one Gemini call that decomposes AND classifies the whole
 * answer at once. Returns [{text, level}] per sentence.
 *
 * Previously did 1 decompose + (N claims × 4 self-consistency samples) ≈ 17 calls
 * for a 4-claim answer. This is 1 call regardless of claim count.
 */
export async function analyzeAnswer(
  answer: string,
  contextSources: string[]
): Promise<Claim[]> {
  const sentences = splitSentences(answer);
  if (sentences.length === 0) return [];

  if (!hasLLMKey()) {
    return sentences.map((text) => ({ text, level: "inference" as ClaimLevel }));
  }

  const context = contextSources.join("\n---\n").slice(0, 4000);
  const hasSources = contextSources.some((s) => s && s.trim().length > 0);
  const prompt = `You are grading an assistant's answer for a trust display.
For each sentence below, output ONE of these labels:
- "grounded"    — ${hasSources
    ? "directly supported by the source material, OR uncontroversial common knowledge (medical, scientific, everyday facts) stated plainly"
    : "uncontroversial common knowledge (medical, scientific, everyday facts) stated plainly and correctly"}
- "inference"   — reasonable interpretation, hedged wording ("likely", "probably"), or moderate uncertainty
- "speculation" — unsupported specific claim, likely wrong, or clearly a guess

Be fair: a plainly-correct common-knowledge statement is "grounded" even if no source is cited.
Only mark "speculation" if the claim is dubious, invented, or contradicted.

${hasSources ? `Sources:\n"""\n${context}\n"""\n` : "No external sources were consulted; grade against your own knowledge.\n"}
Sentences (JSON array, same order as input):
${JSON.stringify(sentences)}

Reply with ONLY a JSON array of objects in the same order, like:
[{"level":"grounded"},{"level":"inference"}, ...]
Nothing else.`;

  const res = await callLLM({
    messages: [
      { role: "system", content: "You output only compact JSON. No prose." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    jsonMode: true,
    maxOutputTokens: Math.min(80 + sentences.length * 20, 400),
  });

  if (!res.ok) {
    return sentences.map((text) => ({ text, level: "inference" as ClaimLevel }));
  }

  try {
    const parsed = JSON.parse(res.text);
    if (Array.isArray(parsed) && parsed.length === sentences.length) {
      return sentences.map((text, i) => ({
        text,
        level: normalizeLevel(parsed[i]?.level),
      }));
    }
  } catch {
    // fall through
  }
  return sentences.map((text) => ({ text, level: "inference" as ClaimLevel }));
}

function normalizeLevel(v: unknown): ClaimLevel {
  const s = String(v || "").toLowerCase();
  if (s === "grounded") return "grounded";
  if (s === "speculation") return "speculation";
  return "inference";
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
