import type { ToolCall, Detection } from "../types";
import { detectSelfReference, matchesAny, matchesRegex } from "../utils/analysis";

export function detectS01(call: ToolCall): Detection {
  const code = "S01" as const;
  const label = "CIRCULAR_LOGIC";

  if (!call.reasoning) {
    return { code, label, fired: false, confidence: 1, evidence: "No reasoning provided" };
  }

  const selfRef = detectSelfReference(call.reasoning);
  if (selfRef.found) {
    return { code, label, fired: true, confidence: 1, evidence: selfRef.evidence };
  }

  const tautologyPatterns = [
    /\b(\w+)\s+(?:is|are)\s+(?:good|recommended|optimal)\s+because\s+(?:it's|they're|it is)\s+(?:beneficial|advantageous|the best)\b/i,
    /\brecommend(?:ed|ing)?\b.*\bbecause\s+(?:it's?|it is|this is)\s+(?:the\s+)?recommend(?:ed|ing)?\b/i,
    /\bshould\b.*\bbecause\s+(?:you|we)\s+should\b/i,
    /\b(\w+ed)\b.{1,30}\bbecause\b.{1,30}\b\1\b/i,
  ];

  const tautMatches = matchesRegex(call.reasoning, tautologyPatterns);
  if (tautMatches.length > 0) {
    return {
      code, label, fired: true, confidence: 1,
      evidence: `Tautological justification detected in reasoning`,
    };
  }

  return { code, label, fired: false, confidence: 1, evidence: "No circular logic detected" };
}

export function detectS02(call: ToolCall): Detection {
  const code = "S02" as const;
  const label = "FALSE_DICHOTOMY";
  const text = call.reasoning || "";

  const dichotomyPatterns = [
    /\b(?:either)\s+.{5,60}\s+(?:or)\s+.{5,60}(?:no other|only two|only option)/i,
    /\b(?:you (?:must|have to)|we (?:must|have to))\s+(?:either)\b/i,
    /\b(?:the only (?:two|2) (?:options|choices|paths))\b/i,
    /\b(?:there(?:'s| is) no (?:middle ground|third option|alternative))\b/i,
    /\b(?:it's (?:this|either) or nothing)\b/i,
    /\b(?:do this now or (?:lose|miss|fail))\b/i,
  ];

  const matches = matchesRegex(text, dichotomyPatterns);
  if (matches.length > 0) {
    return {
      code, label, fired: true, confidence: 1,
      evidence: `False dichotomy framing: ${matches.length} binary-forcing pattern(s) found`,
    };
  }

  return { code, label, fired: false, confidence: 1, evidence: "No false dichotomy detected" };
}

export function detectS03(call: ToolCall): Detection {
  const code = "S03" as const;
  const label = "HIDDEN_ASSUMPTION";
  const text = call.reasoning || "";

  if (call.context && call.context.length > 0) {
    const userMessages = call.context
      .filter((c) => c.role === "user")
      .map((c) => c.content.toLowerCase())
      .join(" ");

    const paramText = JSON.stringify(call.params).toLowerCase();

    const specificValuePatterns = [
      /0x[a-f0-9]{40}/gi,
      /\b\d+\.?\d*\s*(?:eth|btc|usdc|usdt|sol|matic)\b/gi,
    ];

    for (const pattern of specificValuePatterns) {
      const paramMatches = paramText.match(pattern) || [];
      for (const match of paramMatches) {
        if (!userMessages.includes(match.toLowerCase())) {
          return {
            code, label, fired: true, confidence: 1,
            evidence: `Parameter contains specific value "${match}" not found in user's request`,
          };
        }
      }
    }
  }

  return { code, label, fired: false, confidence: 1, evidence: "No hidden assumptions detected" };
}
