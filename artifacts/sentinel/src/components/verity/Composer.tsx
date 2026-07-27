import { useState } from "react";

interface Props {
  sentinelOn: boolean;
  onSend: (text: string) => void;
  onScenario: (kind: "injection" | "truth") => void;
  onClear: () => void;
  busy: boolean;
  sidebarOpen?: boolean;
}

export function Composer({ sentinelOn, onSend, onScenario, onClear, busy, sidebarOpen }: Props) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !busy;

  return (
    <div
      className={`fixed bottom-0 right-0 z-[15] px-3 pb-[env(safe-area-inset-bottom,12px)] pt-3 sm:px-5 sm:pb-5 sm:pt-3.5 transition-[left] duration-300 ${sidebarOpen ? "left-[272px]" : "left-0"}`}
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom, 0px) + 12px, 12px)`,
        background:
          "linear-gradient(180deg, rgba(253,246,239,0) 0%, rgba(253,246,239,0.88) 55%, rgba(253,246,239,0.98) 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-[820px]">
        {/* Scenario buttons row */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onScenario("injection")}
              disabled={busy}
              className="glass-strong flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium shadow-glassSm disabled:opacity-60 sm:gap-2 sm:px-3.5 sm:text-[13px]"
            >
              <span className="inline-block h-2 w-2 flex-none rounded-full bg-bad" />
              Injection attack
              <span className="text-[11px] font-normal text-muted">demo</span>
            </button>
            <button
              onClick={() => onScenario("truth")}
              disabled={busy}
              className="glass-strong flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium shadow-glassSm disabled:opacity-60 sm:gap-2 sm:px-3.5 sm:text-[13px]"
            >
              <span className="inline-block h-2 w-2 flex-none rounded-full bg-warn" />
              Truth check
              <span className="text-[11px] font-normal text-muted">demo</span>
            </button>
          </div>
          <button
            onClick={onClear}
            className="ml-auto flex-none rounded-full px-3 py-2 text-[11px] text-muted sm:text-[12px]"
            style={{ background: "transparent", border: "1px solid rgba(107,100,85,0.2)" }}
          >
            Clear
          </button>
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSend) return;
            onSend(draft.trim());
            setDraft("");
          }}
          className="glass-strong flex items-center gap-2 rounded-glass pl-4 pr-2 sm:gap-2.5"
        >
          <input
            type="text"
            aria-label="Message"
            placeholder="Ask the agent anything…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 border-0 bg-transparent py-3 text-[15px] outline-none sm:py-2.5"
            style={{ color: "inherit", fontSize: "16px" /* prevents iOS zoom */ }}
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            className="my-1.5 flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium text-white transition-colors sm:my-2 sm:gap-2 sm:px-4"
            style={{
              background: canSend ? "#EC7C43" : "#E9BFA6",
              boxShadow: canSend ? "0 4px 14px rgba(236,124,67,0.30)" : "none",
              opacity: canSend ? 1 : 0.9,
            }}
          >
            <span className="hidden sm:inline">Send</span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </form>

        {/* Status line */}
        <div className="mt-1.5 text-center text-[11px] text-muted">
          Verity is {sentinelOn ? "on" : "off"} ·{" "}
          {sentinelOn ? (
            <span className="font-medium text-good">answers are governed &amp; scored</span>
          ) : (
            <span className="font-medium text-bad">raw agent — no protection</span>
          )}
        </div>
      </div>
    </div>
  );
}
