export function WelcomeHero() {
  return (
    <div className="glass rounded-glass px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted sm:text-[12px]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-good" />
        Trust engine ready
      </div>
      <h1 className="mb-1.5 mt-2.5 text-[22px] font-semibold tracking-tight sm:text-[26px]">
        Chat with an agent you can verify.
      </h1>
      <p className="m-0 mb-3.5 text-[14px] leading-relaxed text-muted sm:text-[15px]">
        Every answer is scored for confidence, the sources it read are checked for
        prompt injection, and every tool the agent tries to run passes through a
        firewall. Toggle Verity off to see the raw agent for contrast.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[rgba(107,100,85,0.08)] px-2.5 py-1.5 text-[12px] text-muted">
          try a scenario below ↓
        </span>
      </div>
    </div>
  );
}
