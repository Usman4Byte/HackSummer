import type { ReadSource } from "@/lib/types";

interface Props { reads: ReadSource[] }

function renderContent(r: ReadSource) {
  if (!r.flaggedSpans.length) return r.content;
  const span = r.flaggedSpans[0];
  const before = r.content.slice(0, span.start);
  const inj = r.content.slice(span.start, span.end);
  const after = r.content.slice(span.end);
  return (
    <>
      {before}
      <mark
        style={{
          background: "#FBE6E1",
          color: "#a03a29",
          padding: "1px 3px",
          borderRadius: 4,
          border: "1px dashed rgba(212,80,58,0.5)",
        }}
      >
        {inj}
      </mark>
      {after}
    </>
  );
}

export function InputShieldPanel({ reads }: Props) {
  return (
    <div className="glass-soft rounded-2xl px-4 py-3.5">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-goodBg">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#2FA36B" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3z" />
          </svg>
        </div>
        <div className="text-[13px] font-semibold">Input Shield</div>
        <div className="text-[11px] text-muted">
          what the agent read · scanned for injected instructions
        </div>
      </div>
      {reads.length === 0 ? (
        <div className="text-[12px] italic text-muted">No external sources were read.</div>
      ) : (
        reads.map((r, idx) => {
          const flagged = r.flaggedSpans.length > 0;
          return (
            <div key={idx} className="mt-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                <span className="font-mono text-[12px] font-medium text-ink">{r.source}</span>
                {flagged ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-badBg px-2 py-0.5 text-[11px] font-medium text-badText">
                    <span className="inline-block h-[5px] w-[5px] rounded-full bg-bad" />
                    injection flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-goodBg px-2 py-0.5 text-[11px] font-medium text-goodText">
                    <span className="inline-block h-[5px] w-[5px] rounded-full bg-good" />
                    clean
                  </span>
                )}
              </div>
              <pre
                className="mt-2 rounded-xl px-3.5 py-3 font-mono text-[12px] leading-relaxed"
                style={{
                  background: "rgba(28,26,23,0.03)",
                  border: "1px solid rgba(120,90,60,0.10)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#3a342b",
                }}
              >
                {renderContent(r)}
              </pre>
              {flagged && (
                <div className="mt-1.5 text-[11px] text-badText">
                  ↑ span {r.flaggedSpans[0].start}–{r.flaggedSpans[0].end} · {r.flaggedSpans[0].reason}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
