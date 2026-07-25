import { useState } from "react";

interface Props {
  sentinelOn: boolean;
  onSend: (text: string) => void;
  onScenario: (kind: "injection" | "truth") => void;
  onClear: () => void;
  busy: boolean;
}

export function Composer({ sentinelOn, onSend, onScenario, onClear, busy }: Props) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !busy;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[15] px-5 pb-5 pt-3.5"
      style={{
        background:
          "linear-gradient(180deg, rgba(253,246,239,0) 0%, rgba(253,246,239,0.85) 60%)",
      }}
    >
      <div className="mx-auto max-w-[820px]">
        <div className="mb-2.5 flex flex-wrap gap-2">
          <button
            onClick={() => onScenario("injection")}
            disabled={busy}
            className="glass-strong flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium shadow-glassSm disabled:opacity-60"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-bad" />
            Injection attack
            <span className="text-[11px] font-normal text-muted">demo</span>
          </button>
          <button
            onClick={() => onScenario("truth")}
            disabled={busy}
            className="glass-strong flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium shadow-glassSm disabled:opacity-60"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-warn" />
            Truth check
            <span className="text-[11px] font-normal text-muted">demo</span>
          </button>
          <button
            onClick={onClear}
            className="ml-auto rounded-full px-3 py-2 text-[12px] text-muted"
            style={{ background: "transparent", border: "1px solid rgba(107,100,85,0.2)" }}
          >
            Clear chat
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSend) return;
            onSend(draft.trim());
            setDraft("");
          }}
          className="glass-strong flex items-center gap-2.5 rounded-glass pl-4"
        >
          <input
            type="text"
            aria-label="Message"
            placeholder="Ask the agent anything…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 border-0 bg-transparent px-0 py-2.5 text-[15px] outline-none"
            style={{ color: "inherit" }}
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            className="my-2 mr-2 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[14px] font-medium text-white transition-colors"
            style={{
              background: canSend ? "#EC7C43" : "#E9BFA6",
              boxShadow: "0 4px 14px rgba(236,124,67,0.30)",
              opacity: canSend ? 1 : 0.9,
            }}
          >
            Send
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </form>
        <div className="mt-2 text-center text-[11px] text-muted">
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
