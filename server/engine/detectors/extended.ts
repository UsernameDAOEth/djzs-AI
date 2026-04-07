import type { ToolCall, Detection } from "../types";
import { matchesRegex } from "../utils/analysis";

export function detectX01(call: ToolCall): Detection {
  const code = "X01" as const;
  const label = "CONTEXT_COLLAPSE";

  if (!call.context || call.context.length < 2) {
    return { code, label, fired: false, confidence: 1, evidence: "Insufficient context to evaluate" };
  }

  const userMessages = call.context
    .filter((c) => c.role === "user")
    .map((c) => c.content.toLowerCase());

  const reasoning = (call.reasoning || "").toLowerCase();
  const paramText = JSON.stringify(call.params).toLowerCase();

  const constraintPatterns = [
    /\b(?:don't|do not|never|no more than|max(?:imum)?|at most|under|below|limit)\s+(.+)/gi,
    /\b(?:only|just|exclusively|nothing (?:but|except))\s+(.+)/gi,
  ];

  for (const msg of userMessages) {
    for (const pattern of constraintPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(msg)) !== null) {
        const constraint = match[1].substring(0, 50).trim();
        if (constraint.length > 3 && !reasoning.includes(constraint.substring(0, 15))) {
          const negationWords = ["don't", "do not", "never", "no"];
          const hasNegation = negationWords.some((w) => msg.includes(w));
          if (hasNegation) {
            return {
              code, label, fired: true, confidence: 1,
              evidence: `User constraint "${msg.substring(0, 80)}" not acknowledged in reasoning`,
            };
          }
        }
      }
    }
  }

  const priorResults = call.context
    .filter((c) => c.role === "tool_result")
    .map((c) => c.content.toLowerCase());

  for (const result of priorResults) {
    const failureSignals = ["error", "failed", "denied", "rejected", "insufficient", "reverted"];
    const hasFailure = failureSignals.some((s) => result.includes(s));
    if (hasFailure) {
      const retriesOk = reasoning.includes("retry") || reasoning.includes("try again");
      if (!retriesOk) {
        return {
          code, label, fired: true, confidence: 1,
          evidence: `Prior tool call returned failure signal but agent proceeds without acknowledgment`,
        };
      }
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "No context collapse detected" };
}

export function detectX02(call: ToolCall): Detection {
  const code = "X02" as const;
  const label = "SURVIVORSHIP_FILTER";
  const text = call.reasoning || "";

  const successPatterns = [
    /\b(?:guaranteed|certain|sure|definitely|always)\s+(?:profit|return|gain|success|win)\b/i,
    /\b(?:everyone|all|every)\s+(?:who|that)\s+(?:did|tried|invested)\b.*\b(?:succeeded|profited|gained|won)\b/i,
    /\b(?:no|zero) (?:risk|downside|chance of (?:loss|failure))\b/i,
    /\b(?:can't|cannot|impossible to) (?:lose|fail|go wrong)\b/i,
    /\b100%\s+(?:success|safe|guaranteed|secure)\b/i,
  ];

  const successHits = matchesRegex(text, successPatterns);

  if (successHits.length > 0) {
    const riskAcknowledgment = [
      /\b(?:however|but|although|caveat|warning|note that)\b/i,
      /\b(?:could (?:also )?(?:lose|fail|drop|decline))\b/i,
      /\b(?:not guaranteed|past performance)\b/i,
      /\b(?<!no\s)(?<!zero\s)(?<!without\s)risk(?:s|y)?\b(?!\s*-?\s*free)/i,
      /\bdownside\b(?!\s*(?:is\s+)?(?:zero|none|nil|nothing|minimal))/i,
    ];

    const hasBalance = matchesRegex(text, riskAcknowledgment).length > 0;
    if (!hasBalance) {
      return {
        code, label, fired: true, confidence: 1,
        evidence: `${successHits.length} absolute success claims with no risk acknowledgment`,
      };
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "No survivorship filter detected" };
}
