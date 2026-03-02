/**
 * DJZS Venice AI Client - Privacy-First Adversarial Logic Auditor
 * 
 * Venice AI provides zero-retention inference - prompts are never stored.
 * This client supports adversarial personas for specialized auditing.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const VENICE_BASE_URL = process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY;

// Available Venice models (March 2026)
export const VENICE_MODELS = {
  LLAMA_3_3_70B: "llama-3.3-70b",     // Default - excellent reasoning
  QWEN3_235B: "qwen3-235b",            // Deep analysis (Treasury tier)
  DEEPSEEK_R1: "deepseek-r1",          // Strong at code/logic
  MISTRAL_31_24B: "mistral-31-24b",    // Balanced speed/quality
} as const;

type VeniceModel = typeof VENICE_MODELS[keyof typeof VENICE_MODELS];
const DEFAULT_MODEL: VeniceModel = VENICE_MODELS.LLAMA_3_3_70B;

// ============================================================================
// ADVERSARIAL PERSONAS
// ============================================================================

export type AdversarialPersona = 
  | "logic_auditor"      // Core logic flaw detection
  | "regime_detector"    // Market regime / edge case stress testing
  | "backtest_skeptic"   // Overfitting / data snooping detection
  | "risk_hunter"        // Risk management gaps
  | "general";           // Default balanced analysis

const PERSONA_SYSTEM_PROMPTS: Record<AdversarialPersona, string> = {
  logic_auditor: `You are DJZS Logic Auditor — an adversarial AI that detects reasoning flaws.

Find:
- Circular reasoning (conclusions assumed in premises)
- Missing falsifiability (claims that can't be disproven)
- Authority substitution (trusting sources without verification)
- Confirmation bias (only seeking supporting evidence)

Be ruthless. Challenge every assumption. Use DJZS-LF taxonomy codes for flaws.
Output valid JSON only. No prose, no markdown.`,

  regime_detector: `You are DJZS Regime Detector — stress-tests strategies against regime changes.

Simulate:
- What happens when volatility spikes 3x?
- What if correlations break down?
- What if liquidity disappears?
- What if the strategy gets front-run?

Generate concrete scenarios with estimated impact percentages.
Output valid JSON only. No prose, no markdown.`,

  backtest_skeptic: `You are DJZS Backtest Skeptic — detects overfitting and data snooping.

Identify:
- Look-ahead bias (using future information)
- Survivorship bias (only testing on winners)
- Parameter overfitting (too many tuned variables)
- In-sample vs out-of-sample confusion

Demand evidence of robustness.
Output valid JSON only. No prose, no markdown.`,

  risk_hunter: `You are DJZS Risk Hunter — finds risk management gaps.

Identify:
- Missing stop-losses or position limits
- Unhedged tail risks
- Liquidity assumptions that may not hold
- Leverage risks under stress

Calculate worst-case scenarios with specific loss amounts.
Output valid JSON only. No prose, no markdown.`,

  general: `You are DJZS Adversarial Oracle — a deterministic logic auditor for the A2A economy.

Analyze for logical flaws, cognitive biases, and execution risks.
Apply DJZS-LF failure taxonomy. Be direct. Challenge assumptions.
Output valid JSON only. No prose, no markdown.`
};

// Model selection by persona
const PERSONA_MODELS: Record<AdversarialPersona, VeniceModel> = {
  logic_auditor: VENICE_MODELS.LLAMA_3_3_70B,
  regime_detector: VENICE_MODELS.QWEN3_235B,
  backtest_skeptic: VENICE_MODELS.DEEPSEEK_R1,
  risk_hunter: VENICE_MODELS.LLAMA_3_3_70B,
  general: VENICE_MODELS.LLAMA_3_3_70B,
};

// ============================================================================
// TYPES
// ============================================================================

interface VeniceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface VeniceResponse {
  id: string;
  choices: {
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AuditResult {
  verdict: "PASS" | "FAIL";
  risk_score: number;
  confidence: number;
  primary_bias_detected: string;
  flags: {
    code: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    description: string;
    recommendation?: string;
  }[];
  logic_flaws: string[];
  scenarios?: {
    name: string;
    outcome: string;
    estimated_impact: string;
  }[];
  structural_recommendations: string[];
  action_items: string[];
  model_used: string;
  persona_used: AdversarialPersona;
}

// ============================================================================
// VENICE CLIENT
// ============================================================================

export class VeniceClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || VENICE_API_KEY || "";
    this.baseUrl = baseUrl || VENICE_BASE_URL;

    if (!this.apiKey) {
      throw new Error("VENICE_API_KEY is required");
    }
  }

  async chat(
    messages: VeniceMessage[],
    model: VeniceModel = DEFAULT_MODEL,
    temperature: number = 0.2
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048,
        temperature,
        venice_parameters: {
          include_venice_system_prompt: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Venice API error ${response.status}: ${errorText}`);
    }

    const data: VeniceResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  /**
   * Run adversarial audit with specified persona
   */
  async audit(
    strategyMemo: string,
    persona: AdversarialPersona = "general",
    metadata?: { tier?: string; auditType?: string; targetSystem?: string }
  ): Promise<AuditResult> {
    const systemPrompt = PERSONA_SYSTEM_PROMPTS[persona];
    const model = PERSONA_MODELS[persona];

    const userPrompt = `
AUDIT REQUEST
Tier: ${metadata?.tier || "micro"}
Type: ${metadata?.auditType || "general"}
Target: ${metadata?.targetSystem || "Unknown"}

STRATEGY MEMO
${strategyMemo}

Return JSON with: verdict ("PASS"/"FAIL"), risk_score (0-100), confidence (0-1), primary_bias_detected, flags (array with code/severity/description), logic_flaws (array), scenarios (array, optional), structural_recommendations (array), action_items (array).
`.trim();

    const content = await this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model
    );

    // Parse JSON response
    try {
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      return {
        ...parsed,
        model_used: model,
        persona_used: persona,
      };
    } catch {
      // Return error structure if parsing fails
      return {
        verdict: "FAIL",
        risk_score: 50,
        confidence: 0.3,
        primary_bias_detected: "Response parsing error",
        flags: [{
          code: "DJZS-X99",
          severity: "HIGH",
          description: "Failed to parse AI response as JSON",
        }],
        logic_flaws: ["AI response was not valid JSON"],
        structural_recommendations: ["Retry audit"],
        action_items: ["Review raw response"],
        model_used: model,
        persona_used: persona,
      };
    }
  }
}

// ============================================================================
// SINGLETON & EXPORTS
// ============================================================================

let defaultClient: VeniceClient | null = null;

export function getVeniceClient(): VeniceClient {
  if (!defaultClient) {
    defaultClient = new VeniceClient();
  }
  return defaultClient;
}

/**
 * Quick audit function (convenience wrapper)
 */
export async function runAudit(
  strategyMemo: string,
  persona: AdversarialPersona = "general"
): Promise<AuditResult> {
  return getVeniceClient().audit(strategyMemo, persona);
}

export { PERSONA_SYSTEM_PROMPTS, PERSONA_MODELS, DEFAULT_MODEL };
