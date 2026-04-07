import type { ToolCall, Detection } from "../types";
import { matchesRegex, extractNumbers } from "../utils/analysis";

export function detectT01(call: ToolCall): Detection {
  const code = "T01" as const;
  const label = "TEMPORAL_MISMATCH";
  const text = call.reasoning || "";
  const now = Date.now();

  const datePatterns = [
    /\b(?:as of|data from|reported on|updated?)\s+(\w+\s+\d{1,2},?\s+\d{4})/gi,
    /\b(\d{4}-\d{2}-\d{2})\b/g,
    /\b(?:Q[1-4])\s+(\d{4})\b/gi,
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/gi,
  ];

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
        const dateStr = match[1] || match[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          const ageMs = now - parsedDate.getTime();
          const ageDays = ageMs / (1000 * 60 * 60 * 24);

          if (ageDays > 30) {
            return {
              code, label, fired: true, confidence: 1,
              evidence: `Reasoning references data from ${dateStr} (${Math.round(ageDays)} days old)`,
            };
          }
        }
      } catch {
      }
    }
  }

  const shortTermData = [
    /\b(?:today|yesterday|this (?:hour|morning)|past (?:24|48) hours?|last (?:hour|day))\b/i,
  ];
  const longTermClaims = [
    /\b(?:long.?term|over (?:the )?(?:next |coming )?\d+\s*(?:months?|years?))\b/i,
    /\b(?:retirement|estate|generational|decade|multi.?year)\b/i,
  ];

  const hasShortData = matchesRegex(text, shortTermData).length > 0;
  const hasLongClaim = matchesRegex(text, longTermClaims).length > 0;

  if (hasShortData && hasLongClaim) {
    return {
      code, label, fired: true, confidence: 1,
      evidence: `Short-term data used to justify long-term action (temporal horizon mismatch)`,
    };
  }

  if (call.params) {
    const priceKeys = ["price", "rate", "value", "quote", "oracle_price"];
    for (const key of priceKeys) {
      if (key in call.params) {
        const timestampKeys = ["timestamp", "updated_at", "as_of", "price_timestamp"];
        const hasTimestamp = timestampKeys.some((tk) => tk in call.params);
        if (!hasTimestamp) {
          return {
            code, label, fired: true, confidence: 1,
            evidence: `Price/rate parameter "${key}" has no associated timestamp — staleness unverifiable`,
          };
        }
      }
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "No temporal mismatch detected" };
}
