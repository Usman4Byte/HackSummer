import type { ToolAction } from "@/lib/types";

interface Props { action: ToolAction }

export function BlockedAlert({ action }: Props) {
  return (
    <div
      className="sentinel-blocked-pulse mx-3.5 mb-3 flex items-start gap-3.5 rounded-2xl px-4 py-3.5"
      style={{ background: "#1C1A17", color: "#F7F4ED" }}
    >
      <div
        className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px]"
        style={{
          background: "rgba(212,80,58,0.22)",
          border: "1px solid rgba(212,80,58,0.5)",
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#D4503A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 2 22h20L12 2z" />
          <path d="M12 9v5" />
          <circle cx={12} cy={18} r={0.8} fill="#D4503A" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-[0.06em]" style={{ color: "#D4503A" }}>
          action firewall · blocked
        </div>
        <div className="mt-0.5 text-[14px] font-medium">
          {action.tool} — outbound request blocked
        </div>
        <div
          className="mt-1.5 break-all font-mono text-[12px]"
          style={{ color: "#A69B87" }}
        >
          {action.target}
        </div>
        <div className="mt-1.5 text-[12px]" style={{ color: "#C7BEA8" }}>
          Rule: <span className="font-medium" style={{ color: "#F7F4ED" }}>{action.reason}</span>
        </div>
      </div>
    </div>
  );
}
