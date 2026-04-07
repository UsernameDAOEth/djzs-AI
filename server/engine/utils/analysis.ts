export function matchesRegex(text: string, patterns: RegExp[]): string[] {
  const results: string[] = [];
  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g";
    const globalPattern = new RegExp(pattern.source, flags);
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      results.push(match[0]);
      if (!flags.includes("g")) break;
    }
  }
  return results;
}

export function matchesAny(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      hits.push(kw);
    }
  }
  return hits;
}

export function extractNumbers(text: string): number[] {
  const pattern = /(?<!\w)-?\d+(?:,\d{3})*(?:\.\d+)?/g;
  const results: number[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const cleaned = match[0].replace(/,/g, "");
    const num = parseFloat(cleaned);
    if (!isNaN(num) && isFinite(num)) {
      results.push(num);
    }
  }
  return results;
}

export function detectSelfReference(text: string): { found: boolean; evidence: string } {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const a = sentences[i].toLowerCase();
      const b = sentences[j].toLowerCase();

      const aWords = new Set(a.split(/\s+/).filter(w => w.length > 3));
      const bWords = new Set(b.split(/\s+/).filter(w => w.length > 3));

      if (aWords.size === 0 || bWords.size === 0) continue;

      let overlap = 0;
      for (const w of aWords) {
        if (bWords.has(w)) overlap++;
      }

      const similarity = overlap / Math.min(aWords.size, bWords.size);
      if (similarity > 0.7 && aWords.size >= 3) {
        return {
          found: true,
          evidence: `Reasoning references its own conclusion: "${sentences[i].substring(0, 60)}..." ≈ "${sentences[j].substring(0, 60)}..."`,
        };
      }
    }
  }

  const becausePattern = /\b(we should|should|must|need to)\s+(.{10,50})\b.*\bbecause\b.*\b(we should|should|must|need to)\s+(.{10,50})/i;
  const becauseMatch = text.match(becausePattern);
  if (becauseMatch) {
    return {
      found: true,
      evidence: `Circular justification: action justified by restating the action`,
    };
  }

  return { found: false, evidence: "" };
}

export function paramOverflowRatio(
  params: Record<string, unknown>,
  schema: { type: string; properties?: Record<string, unknown>; required?: string[] }
): { actual: number; expected: number; overflow: boolean } {
  const actual = Object.keys(params).length;
  const expected = schema.properties ? Object.keys(schema.properties).length : 0;
  return {
    actual,
    expected,
    overflow: expected > 0 && actual > expected,
  };
}

export function flattenParams(params: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenParams(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}
