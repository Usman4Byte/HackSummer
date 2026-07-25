import type { ToolAction } from "@/lib/types";

interface Props { actions: ToolAction[] }

export function ActionFirewallPanel({ actions }: Props) {
  const allowed = actions.filter((a) => a.decision === "allowed").length;
  const blocked = actions.filter((a) => a.decision === "blocked").length;

  return (
    <div className="glass-soft rounded-2xl px-4 py-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-warnBg">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#E0912F" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <rect x={3} y={4} width={18} height={16} rx={2} />
            <path d="M3 10h18M9 4v16" />
          </svg>
        </div>
        <div className="text-[13px] font-semibold">Action Firewall</div>
        <div className="text-[11px] text-muted">every tool the agent attempted</div>
        <span className="flex-1" />
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span
            className="inline-block h-3 w-6 rounded-sm"
            style={{
              background:
                "repeating-linear-gradient(45deg, #2FA36B 0 4px, #4ab682 4px 8px)",
            }}
          />
          <span className="text-goodText">{allowed} allowed</span>
          {blocked > 0 && (
            <>
              <span
                className="ml-1.5 inline-block h-3 w-6 rounded-sm"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, #D4503A 0 4px, #e26856 4px 8px)",
                }}
              />
              <span className="text-badText">{blocked} blocked</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {actions.length === 0 && (
          <div className="text-[12px] italic text-muted">
            The agent didn&apos;t attempt any tool calls.
          </div>
        )}
        {actions.map((a, i) => {
          const isBlocked = a.decision === "blocked";
          const bg = isBlocked ? "#FBE6E1" : "#E4F4EC";
          const border = isBlocked ? "rgba(212,80,58,0.25)" : "rgba(47,163,107,0.22)";
          const dot = isBlocked ? "#D4503A" : "#2FA36B";
          const textColor = isBlocked ? "#a03a29" : "#1f7a4e";
          const pillBg = isBlocked ? "#1C1A17" : "#E4F4EC";
          const pillColor = isBlocked ? "#F7F4ED" : "#1f7a4e";
          const reasonColor = isBlocked ? "#a03a29" : "#6B6455";
          return (
            <div
              key={i}
              className="grid items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{
                gridTemplateColumns: "auto 1fr auto",
                background: bg,
                border: `1px solid ${border}`,
              }}
            >
              <div className="flex items-center gap-2 font-mono text-[12px]">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: dot }}
                />
                <span className="font-medium" style={{ color: textColor }}>
                  {a.tool}
                </span>
              </div>
              <div
                className="truncate font-mono text-[12px]"
                style={{ color: "#3a342b" }}
                title={a.target}
              >
                → {a.target}{" "}
                <span className="text-muted">· {a.payloadSummary}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
                  style={{ background: pillBg, color: pillColor }}
                >
                  <span
                    className="inline-block h-[5px] w-[5px] rounded-full"
                    style={{ background: dot }}
                  />
                  {a.decision}
                </span>
              </div>
              <div
                className="pl-4 text-[11px]"
                style={{ gridColumn: "1 / -1", color: reasonColor }}
              >
                {a.reason}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
