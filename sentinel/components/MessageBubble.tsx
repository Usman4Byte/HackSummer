"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";
import { ClaimSpans } from "./ClaimSpan";
import { TrustGauge } from "./TrustGauge";
import { BlockedAlert } from "./BlockedAlert";
import { InputShieldPanel } from "./InputShieldPanel";
import { ActionFirewallPanel } from "./ActionFirewallPanel";
import { AuditTrailPanel } from "./AuditTrailPanel";

interface Props { msg: Message }

export function MessageBubble({ msg }: Props) {
  const isUser = msg.role === "user";
  if (isUser) return <UserBubble text={msg.text} />;
  return <AgentBubble msg={msg} />;
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex w-full flex-col items-end">
      <div
        className="max-w-[78%] px-4 py-3 text-[15px] leading-relaxed"
        style={{
          background: "linear-gradient(135deg, rgba(252,224,205,0.7), rgba(248,208,180,0.55))",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          backdropFilter: "blur(22px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.75)",
          borderRadius: "20px 20px 6px 20px",
          boxShadow: "0 8px 24px rgba(200,120,70,0.10)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function AgentBubble({ msg }: { msg: Message }) {
  const [expanded, setExpanded] = useState(false);
  const trust = msg.trust;
  const sentinelOn = !!msg.sentinelOn;
  const hasTrust = !!trust && sentinelOn;
  const claims = trust?.claims ?? [];
  const reads = trust?.reads ?? [];
  const actions = trust?.actions ?? [];
  const audit = trust?.audit ?? [];
  const blocked = actions.filter((a) => a.decision === "blocked");
  const hasFlagged = reads.some((r) => r.flaggedSpans && r.flaggedSpans.length > 0);

  const displayClaims = claims.length > 0 ? claims : msg.text ? [{ text: msg.text, level: "grounded" as const }] : [];

  return (
    <div className="flex w-full flex-col items-start">
      <div
        className="w-full max-w-[92%] overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.65)",
          WebkitBackdropFilter: "blur(22px) saturate(140%)",
          backdropFilter: "blur(22px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.75)",
          borderRadius: "20px 20px 20px 6px",
          boxShadow: "0 8px 32px rgba(120,90,60,0.10)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-2 pt-3.5">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-ink">
            <div className="h-[9px] w-[9px] rounded-sm bg-accent" style={{ transform: "rotate(45deg)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">Agent</div>
            <div className="text-[11px] text-muted">
              {hasTrust ? (
                <>Sentinel governed · {claims.length} claims · {reads.length} sources · {actions.length} tool calls</>
              ) : (
                "Raw response"
              )}
            </div>
          </div>
          {hasTrust && <TrustGauge score={trust!.score} />}
        </div>

        {/* Answer */}
        <div className="px-4 pb-3.5 text-[15px] leading-[1.65]">
          <ClaimSpans claims={displayClaims} painted={hasTrust} />
        </div>

        {/* Blocked alert */}
        {blocked.length > 0 && <BlockedAlert action={blocked[0]} />}

        {/* Expander */}
        {hasTrust && (
          <div style={{ borderTop: "1px solid rgba(120,90,60,0.10)", background: "rgba(255,255,255,0.35)" }}>
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[12px] font-medium text-muted"
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: `rotate(${expanded ? 90 : 0}deg)`, transition: "transform 180ms ease" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Trust details
              <span className="font-semibold text-ink">·</span>
              <span>Input Shield</span>
              <span className="font-semibold text-ink">·</span>
              <span>Action Firewall</span>
              <span className="font-semibold text-ink">·</span>
              <span>Audit trail</span>
              <span className="flex-1" />
              {hasFlagged && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-badBg px-2 py-0.5 text-[11px] font-medium text-badText">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-bad" />
                  1 injection flagged
                </span>
              )}
            </button>
            {expanded && (
              <div className="flex flex-col gap-3 px-3.5 pb-4 pt-1.5">
                <InputShieldPanel reads={reads} />
                <ActionFirewallPanel actions={actions} />
                <AuditTrailPanel audit={audit} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
