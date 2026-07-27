interface SessionStats {
  totalQueries: number;
  avgScore: number | null;
  blockedActions: number;
  injectionsFound: number;
}

interface ActivityEvent {
  kind: "sent" | "blocked" | "injection" | "scored" | "clean";
  label: string;
  ts: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  stats: SessionStats;
  activity: ActivityEvent[];
  sentinelOn: boolean;
}

const TRUST_LAYERS = [
  {
    icon: (
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: "#D4503A",
    bg: "rgba(212,80,58,0.10)",
    label: "Input Shield",
    desc: "Scans every source the agent reads for injected instructions before they reach the LLM.",
  },
  {
    icon: (
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    color: "#E0912F",
    bg: "rgba(224,145,47,0.10)",
    label: "Action Firewall",
    desc: "Every tool call the agent attempts is checked against an allowlist. Suspicious calls are blocked.",
  },
  {
    icon: (
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10} />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: "#2FA36B",
    bg: "rgba(47,163,107,0.10)",
    label: "Confidence Meter",
    desc: "Each claim in the response is scored: grounded, inference, or speculation — colour-coded inline.",
  },
];

const EVENT_META: Record<ActivityEvent["kind"], { dot: string; label: string }> = {
  sent:      { dot: "#6B6455", label: "Query" },
  blocked:   { dot: "#D4503A", label: "Blocked" },
  injection: { dot: "#D4503A", label: "Injection" },
  scored:    { dot: "#2FA36B", label: "Scored" },
  clean:     { dot: "#2FA36B", label: "Clean" },
};

export function Sidebar({ open, onClose, stats, activity, sentinelOn }: Props) {
  const scoreColor =
    stats.avgScore == null ? "#6B6455"
    : stats.avgScore >= 80 ? "#2FA36B"
    : stats.avgScore >= 55 ? "#E0912F"
    : "#D4503A";

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(33,30,25,0.32)", backdropFilter: "blur(2px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className="fixed left-0 top-0 z-30 flex h-full w-[272px] flex-col overflow-y-auto transition-transform duration-300"
        style={{
          background: "rgba(253,247,242,0.96)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderRight: "1px solid rgba(255,255,255,0.75)",
          boxShadow: "4px 0 24px rgba(120,90,60,0.09)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <div
            className="relative flex h-8 w-8 flex-none items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg,#211E19,#3a342b)" }}
          >
            <div className="h-3 w-3 rounded-sm bg-accent" style={{ transform: "rotate(45deg)" }} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Verity</div>
            <div className="text-[11px] text-muted">Intelligence Panel</div>
          </div>
          {/* Close on mobile */}
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg lg:hidden"
            style={{ background: "rgba(107,100,85,0.08)" }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#6B6455" strokeWidth={2.2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 px-4 pb-8">

          {/* Session stats */}
          <section>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted opacity-70">
                Session
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: sentinelOn ? "rgba(47,163,107,0.12)" : "rgba(212,80,58,0.10)",
                  color: sentinelOn ? "#1f7a4e" : "#a03a29",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: sentinelOn ? "#2FA36B" : "#D4503A" }}
                />
                {sentinelOn ? "Governed" : "Raw"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatTile
                label="Queries"
                value={String(stats.totalQueries)}
                sub="this session"
                color="#6B6455"
              />
              <StatTile
                label="Avg Score"
                value={stats.avgScore != null ? `${stats.avgScore}` : "—"}
                sub="out of 100"
                color={scoreColor}
              />
              <StatTile
                label="Blocked"
                value={String(stats.blockedActions)}
                sub="tool calls"
                color={stats.blockedActions > 0 ? "#D4503A" : "#6B6455"}
              />
              <StatTile
                label="Injections"
                value={String(stats.injectionsFound)}
                sub="detected"
                color={stats.injectionsFound > 0 ? "#D4503A" : "#6B6455"}
              />
            </div>
          </section>

          <Divider />

          {/* Trust layers */}
          <section>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted opacity-70">
              Trust Layers
            </div>
            <div className="flex flex-col gap-2">
              {TRUST_LAYERS.map((layer) => (
                <div
                  key={layer.label}
                  className="flex gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg"
                    style={{ background: layer.bg, color: layer.color }}
                  >
                    {layer.icon}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold" style={{ color: "#211E19" }}>
                      {layer.label}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-[1.5] text-muted">{layer.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* Activity feed */}
          <section>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted opacity-70">
              Live Activity
            </div>
            {activity.length === 0 ? (
              <div
                className="rounded-xl px-3 py-4 text-center text-[12px] text-muted"
                style={{ background: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.6)" }}
              >
                No activity yet.
                <br />
                <span className="opacity-60">Try a scenario below.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {activity.map((ev, i) => {
                  const meta = EVENT_META[ev.kind];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.50)", border: "1px solid rgba(255,255,255,0.65)" }}
                    >
                      <span
                        className="mt-[5px] inline-block h-1.5 w-1.5 flex-none rounded-full"
                        style={{ background: meta.dot }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium" style={{ color: meta.dot }}>
                          {meta.label}
                        </div>
                        <div className="truncate text-[11px] text-muted">{ev.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <Divider />

          {/* Footer note */}
          <div className="text-center text-[11px] leading-relaxed text-muted opacity-60">
            Stats are local to this session
            <br />
            and reset when you clear the chat.
          </div>
        </div>
      </aside>
    </>
  );
}

function StatTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className="flex flex-col rounded-xl px-3 py-2.5"
      style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.72)" }}
    >
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-0.5 text-[22px] font-semibold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted opacity-70">{sub}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(107,100,85,0.10)" }} />;
}
