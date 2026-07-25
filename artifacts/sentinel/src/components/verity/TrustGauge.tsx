interface Props { score: number }

function colorFor(score: number): string {
  if (score < 40) return "#D4503A";
  if (score < 75) return "#E0912F";
  return "#2FA36B";
}

function labelFor(score: number): string {
  if (score < 40) return "low · handle with care";
  if (score < 75) return "mixed · verify";
  return "high confidence";
}

export function TrustGauge({ score }: Props) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, score)) / 100 * c;
  const dash = `${filled} ${c - filled}`;
  const color = colorFor(score);
  return (
    <div className="flex flex-none items-center gap-2.5">
      <div className="relative h-[52px] w-[52px]">
        <svg width={52} height={52} viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(107,100,85,0.14)" strokeWidth={5} />
          <circle
            cx={26}
            cy={26}
            r={22}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={dash}
            style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.2,0.8,0.2,1)" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold"
          style={{ color }}
        >
          {score}
        </div>
      </div>
      <div className="text-[11px] leading-tight text-muted">
        <div className="font-semibold text-ink">Trust</div>
        <div>{labelFor(score)}</div>
      </div>
    </div>
  );
}
