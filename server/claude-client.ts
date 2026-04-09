const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export function shouldUseClaude(): boolean {
  return !!ANTHROPIC_API_KEY;
}

export interface ClaudeAuditClient {
  audit(strategyMemo: string, tier: string): Promise<{
    verdict: "PASS" | "FAIL";
    risk_score: number;
    primary_flaw: string;
    summary: string;
    flags: {
      code: string;
      severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
      evidence: string;
      recommendation: string;
    }[];
    model_used: string;
  }>;
}

class ClaudeClient implements ClaudeAuditClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async audit(strategyMemo: string, tier: string) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0,
        system: `You are DJZS Logic Auditor — an adversarial AI that detects reasoning flaws in financial strategy memos. You apply the DJZS-LF v1.0 taxonomy (11 codes: S01-S03, E01-E02, I01-I03, X01-X02, T01). Return valid JSON only with: verdict ("PASS"/"FAIL"), risk_score (0-200), primary_flaw, summary, flags (array with code/severity/evidence/recommendation). Tier: ${tier}.`,
        messages: [
          {
            role: "user",
            content: `<strategy_memo>\n${strategyMemo}\n</strategy_memo>\n\nAnalyze this strategy memo for logic failures. Return JSON only.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Claude did not return valid JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      verdict: parsed.verdict || "FAIL",
      risk_score: parsed.risk_score || 0,
      primary_flaw: parsed.primary_flaw || "None",
      summary: parsed.summary || "",
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      model_used: "claude-sonnet-4-20250514",
    };
  }
}

let cachedClient: ClaudeAuditClient | null = null;

export function getClaudeAuditClient(): ClaudeAuditClient {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  if (!cachedClient) {
    cachedClient = new ClaudeClient(ANTHROPIC_API_KEY);
  }
  return cachedClient;
}
