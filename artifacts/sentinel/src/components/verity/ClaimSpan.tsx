import type { Claim, ClaimLevel } from "@/lib/types";

interface Style { bg: string; fg: string; dot: string; label: string; }

const LEVEL: Record<ClaimLevel, Style> = {
  grounded:    { bg: "#E4F4EC", fg: "#1f7a4e", dot: "#2FA36B", label: "grounded" },
  inference:   { bg: "#FBEFD9", fg: "#8a5a12", dot: "#E0912F", label: "inference" },
  speculation: { bg: "#FBE6E1", fg: "#a03a29", dot: "#D4503A", label: "speculation" },
};

export function ClaimSpans({ claims, painted }: { claims: Claim[]; painted: boolean }) {
  return (
    <>
      {claims.map((c, i) => {
        const isLast = i === claims.length - 1;
        if (!painted) {
          return (
            <span
              key={i}
              className="sentinel-sentence"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {c.text}{!isLast ? " " : ""}
            </span>
          );
        }
        const st = LEVEL[c.level];
        return (
          <span
            key={i}
            className="sentinel-sentence"
            title={st.label}
            style={{
              animationDelay: `${i * 90}ms`,
              background: st.bg,
              color: st.fg,
              padding: "2px 6px",
              borderRadius: 6,
              marginRight: 2,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: st.dot,
                marginRight: 6,
                verticalAlign: "0.05em",
              }}
            />
            {c.text}
            {!isLast ? " " : ""}
          </span>
        );
      })}
    </>
  );
}
