interface Props {
  sentinelOn: boolean;
  onToggle: () => void;
  onMenuOpen: () => void;
}

export function Header({ sentinelOn, onToggle, onMenuOpen }: Props) {
  const label = sentinelOn ? "on" : "off";
  const toggleBg = sentinelOn ? "rgba(228,244,236,0.85)" : "rgba(251,230,225,0.85)";
  const toggleBorder = sentinelOn ? "rgba(47,163,107,0.30)" : "rgba(212,80,58,0.30)";
  const toggleLabelColor = sentinelOn ? "#1f7a4e" : "#a03a29";
  const toggleTrack = sentinelOn ? "#2FA36B" : "#c99b8f";
  const knobLeft = sentinelOn ? 16 : 2;

  return (
    <header className="sticky top-0 z-20 px-3 py-2.5 sm:px-5 sm:py-3.5">
      <div
        className="glass mx-auto flex items-center gap-2 rounded-glass px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
        style={{ maxWidth: 1180 }}
      >
        {/* Hamburger — always visible, opens sidebar */}
        <button
          aria-label="Open sidebar"
          onClick={onMenuOpen}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-xl transition-colors"
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#211E19" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1={3} y1={6} x2={21} y2={6} />
            <line x1={3} y1={12} x2={21} y2={12} />
            <line x1={3} y1={18} x2={21} y2={18} />
          </svg>
        </button>

        {/* Brand */}
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="relative flex h-7 w-7 flex-none items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg,#211E19,#3a342b)" }}
          >
            <div className="h-2.5 w-2.5 rounded-sm bg-accent" style={{ transform: "rotate(45deg)" }} />
          </div>
          <div className="text-[15px] font-semibold tracking-tight sm:text-[16px]">Verity</div>
          <div className="hidden rounded-full bg-[rgba(107,100,85,0.08)] px-2 py-[3px] text-[11px] font-medium text-muted sm:block">
            trust layer · demo
          </div>
        </div>

        <div className="flex-1" />

        {/* Verity toggle */}
        <button
          role="switch"
          aria-checked={sentinelOn}
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onToggle();
            }
          }}
          className="flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors sm:gap-2.5 sm:px-3"
          style={{ background: toggleBg, border: `1px solid ${toggleBorder}` }}
        >
          <span
            className="hidden text-[13px] font-medium sm:inline"
            style={{ color: toggleLabelColor }}
          >
            Verity:
          </span>
          <span
            className="text-[12px] font-medium sm:text-[13px]"
            style={{ color: toggleLabelColor }}
          >
            {label}
          </span>
          <span
            className="relative inline-block h-5 w-[34px] flex-none rounded-full transition-colors"
            style={{ background: toggleTrack }}
          >
            <span
              className="absolute top-[2px] h-4 w-4 rounded-full bg-white transition-[left] duration-150"
              style={{ left: knobLeft, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}
            />
          </span>
        </button>

        {/* Settings — hidden on xs */}
        <button
          aria-label="Settings"
          className="hidden h-9 w-9 items-center justify-center rounded-xl sm:flex"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#211E19" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={3} />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[12px] font-semibold text-white sm:h-9 sm:w-9 sm:text-[13px]"
          style={{
            background: "linear-gradient(135deg,#EC7C43,#E0912F)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          AV
        </div>
      </div>
    </header>
  );
}
