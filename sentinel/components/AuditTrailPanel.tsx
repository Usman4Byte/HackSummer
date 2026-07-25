import type { AuditEvent } from "@/lib/types";

interface Props { audit: AuditEvent[] }

function colorsFor(kind: AuditEvent["kind"]) {
  if (kind === "read") return { dot: "#2FA36B", color: "#1f7a4e" };
  if (kind === "attempt") return { dot: "#E0912F", color: "#8a5a12" };
  return { dot: "#D4503A", color: "#a03a29" };
}

export function AuditTrailPanel({ audit }: Props) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px]"
          style={{ background: "rgba(28,26,23,0.08)" }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#211E19" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={9} />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div className="text-[13px] font-semibold">Audit trail</div>
        <div className="text-[11px] text-muted">chronological read → attempt → decision</div>
      </div>
      <div className="flex flex-col">
        {audit.length === 0 ? (
          <div className="text-[12px] italic text-muted">
            No governance events recorded — Sentinel was off.
          </div>
        ) : (
          audit.map((e, i) => {
            const { dot, color } = colorsFor(e.kind);
            return (
              <div
                key={i}
                className="grid gap-2.5 px-1 py-1.5 font-mono text-[12px]"
                style={{
                  gridTemplateColumns: "70px 90px 1fr",
                  borderBottom: "1px dashed rgba(120,90,60,0.10)",
                }}
              >
                <span className="text-muted">{e.ts}</span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: dot }}
                  />
                  <span className="font-medium" style={{ color }}>{e.kind}</span>
                </span>
                <span className="break-words" style={{ color: "#3a342b" }}>{e.detail}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
