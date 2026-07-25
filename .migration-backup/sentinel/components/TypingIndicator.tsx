interface Props { label: string }

export function TypingIndicator({ label }: Props) {
  return (
    <div
      className="glass-strong flex max-w-[80%] items-center gap-2.5 self-start rounded-glass px-4 py-3.5"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink">
        <div className="h-2 w-2 rounded-sm bg-accent" style={{ transform: "rotate(45deg)" }} />
      </div>
      <div className="text-[13px] text-muted">
        <span className="font-medium text-ink">{label}</span>
        <span className="sentinel-typing-dot ml-1" />
        <span className="sentinel-typing-dot" />
        <span className="sentinel-typing-dot" />
      </div>
    </div>
  );
}
