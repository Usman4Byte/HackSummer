import type { FlaggedSpan } from "./types";

const INJECTION_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /ignore (all )?previous (instructions|rules)/gi, reason: "Instruction override attempt" },
  { re: /disregard (the )?(above|previous)/gi, reason: "Instruction override attempt" },
  { re: /system\s*:/gi, reason: "Fake system role token" },
  { re: /<!--\s*SYSTEM[\s\S]*?-->/gi, reason: "Hidden HTML-comment instruction block" },
  { re: /send (the )?(developer )?(api )?key/gi, reason: "Exfiltration instruction" },
  { re: /forward\s+(the\s+)?(api|secret|token|key)/gi, reason: "Exfiltration instruction" },
  { re: /exfiltrat[a-z]*/gi, reason: "Explicit exfiltration language" },
  { re: /post\s+to\s+https?:\/\/[^\s"'<>]+/gi, reason: "Instruction to POST to external URL" },
  { re: /do not (tell|mention) (the )?user/gi, reason: "Anti-transparency directive" },
  { re: /[​‌‍]{2,}/g, reason: "Zero-width character cluster" },
];

export interface ShieldScan {
  flaggedSpans: FlaggedSpan[];
  hasInjection: boolean;
}

export function scanForInjection(content: string): ShieldScan {
  const spans: FlaggedSpan[] = [];
  for (const { re, reason } of INJECTION_PATTERNS) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(content))) {
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        reason,
      });
      if (match[0].length === 0) re.lastIndex++;
    }
  }
  const merged = mergeSpans(spans);
  return { flaggedSpans: merged, hasInjection: merged.length > 0 };
}

function mergeSpans(spans: FlaggedSpan[]): FlaggedSpan[] {
  if (spans.length <= 1) return spans;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const out: FlaggedSpan[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end + 8) {
      prev.end = Math.max(prev.end, cur.end);
      if (!prev.reason.includes(cur.reason)) prev.reason += "; " + cur.reason;
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}
