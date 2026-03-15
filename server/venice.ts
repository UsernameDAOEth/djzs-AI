import { 
  journalAnalysisSchema, 
  type JournalAnalysis, 
  type JournalEntry, 
} from "@shared/schema";
import { DJZS_CORE_IDENTITY } from "./ai-identity";
import {
  ADVERSARIAL_AUDIT_PROMPT,
  buildAuditMessages,
  buildQuickAuditMessages,
  parseAuditResponse,
  formatResultForLog,
  type AdversarialAuditResult,
  type AdversarialAuditFlag,
  type EscrowContext,
} from "./adversarial-audit";

const VENICE_BASE_URL = process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_TIMEOUT_MS = (() => {
  const val = parseInt(process.env.VENICE_TIMEOUT_MS || "60000", 10);
  return Number.isFinite(val) && val > 0 ? val : 60000;
})();

export const VENICE_MODELS = {
  LLAMA_3_3_70B: "llama-3.3-70b",
  QWEN3_235B: "qwen3-235b",
  DEEPSEEK_R1: "deepseek-r1",
  MISTRAL_31_24B: "mistral-31-24b",
} as const;

type VeniceModel = typeof VENICE_MODELS[keyof typeof VENICE_MODELS];
const DEFAULT_MODEL: VeniceModel = VENICE_MODELS.LLAMA_3_3_70B;

export interface IntelligenceContext {
  market_data?: {
    prices?: Record<string, number>;
    volumes?: Record<string, number>;
    sentiment?: string;
    timestamp?: string;
  };
  risk_parameters?: {
    max_drawdown?: number;
    position_limit?: number;
    stop_loss?: number;
    leverage_cap?: number;
  };
  historical_context?: {
    prior_audits?: { audit_id: string; verdict: string; risk_score: number }[];
    performance_history?: { period: string; return_pct: number }[];
    notes?: string;
  };
  custom?: Record<string, unknown>;
}

export type AdversarialPersona = 
  | "logic_auditor"
  | "regime_detector"
  | "backtest_skeptic"
  | "risk_hunter"
  | "general";

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

  general: ADVERSARIAL_AUDIT_PROMPT
};

function getPersonaModel(persona: AdversarialPersona): VeniceModel {
  const envKey = `VENICE_MODEL_${persona.toUpperCase()}`;
  const envVal = process.env[envKey];
  if (envVal) return envVal as VeniceModel;

  const globalOverride = process.env.VENICE_DEFAULT_MODEL;
  if (globalOverride) return globalOverride as VeniceModel;

  const defaults: Record<AdversarialPersona, VeniceModel> = {
    logic_auditor: VENICE_MODELS.LLAMA_3_3_70B,
    regime_detector: VENICE_MODELS.QWEN3_235B,
    backtest_skeptic: VENICE_MODELS.DEEPSEEK_R1,
    risk_hunter: VENICE_MODELS.LLAMA_3_3_70B,
    general: VENICE_MODELS.LLAMA_3_3_70B,
  };
  return defaults[persona];
}

const RETRY_DELAYS_MS = [2000, 4000, 8000, 12000];
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403]);

function isRetryableError(err: unknown, statusCode?: number): boolean {
  if (statusCode !== undefined) {
    if (NON_RETRYABLE_STATUS_CODES.has(statusCode)) return false;
    if (RETRYABLE_STATUS_CODES.has(statusCode)) return true;
  }
  if (err instanceof Error) {
    if (err.name === "AbortError") return false;
    if (err.message.includes("Venice API error 4") && !err.message.includes("Venice API error 429")) return false;
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  primary_flaw: string;
  summary: string;
  flags: {
    code: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
    evidence: string;
    recommendation: string;
    description?: string;
  }[];
  confidence?: number;
  primary_bias_detected?: string;
  logic_flaws?: string[];
  scenarios?: {
    name: string;
    outcome: string;
    estimated_impact: string;
  }[];
  structural_recommendations?: string[];
  action_items?: string[];
  model_used: string;
  persona_used: AdversarialPersona;
}

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
    temperature: number = 0.2,
    options?: { responseFormat?: object; timeoutMs?: number }
  ): Promise<string> {
    const timeoutMs = options?.timeoutMs || VENICE_TIMEOUT_MS;
    const maxRetries = RETRY_DELAYS_MS.length;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const body: Record<string, unknown> = {
          model,
          messages,
          max_tokens: 2048,
          temperature,
          venice_parameters: {
            include_venice_system_prompt: false,
          },
        };

        if (options?.responseFormat) {
          body.response_format = options.responseFormat;
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          const err = new Error(`Venice API error ${response.status}: ${errorText}`);

          if (attempt < maxRetries && isRetryableError(err, response.status)) {
            console.warn(`[Venice] Attempt ${attempt + 1}/${maxRetries + 1} failed (${response.status}), retrying in ${RETRY_DELAYS_MS[attempt]}ms...`);
            lastError = err;
            clearTimeout(timer);
            await sleep(RETRY_DELAYS_MS[attempt]);
            continue;
          }
          throw err;
        }

        const data: VeniceResponse = await response.json();
        return data.choices[0]?.message?.content || "";
      } catch (err: unknown) {
        clearTimeout(timer);

        if (err instanceof Error && err.name === "AbortError") {
          const timeoutErr = new Error(`Venice API timed out after ${timeoutMs / 1000}s (model: ${model})`);
          if (attempt < maxRetries) {
            console.warn(`[Venice] Attempt ${attempt + 1}/${maxRetries + 1} timed out, retrying in ${RETRY_DELAYS_MS[attempt]}ms...`);
            lastError = timeoutErr;
            await sleep(RETRY_DELAYS_MS[attempt]);
            continue;
          }
          throw timeoutErr;
        }

        if (attempt < maxRetries && isRetryableError(err)) {
          console.warn(`[Venice] Attempt ${attempt + 1}/${maxRetries + 1} failed (${(err as Error).message}), retrying in ${RETRY_DELAYS_MS[attempt]}ms...`);
          lastError = err as Error;
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw err;
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError || new Error("Venice API request failed after all retries");
  }

  async audit(
    strategyMemo: string,
    persona: AdversarialPersona = "general",
    metadata?: { tier?: string; auditType?: string; targetSystem?: string; intelligenceContext?: string | IntelligenceContext; tradeParams?: Record<string, unknown>; escrowContext?: EscrowContext }
  ): Promise<AuditResult> {
    const model = getPersonaModel(persona);

    let messages: VeniceMessage[];

    if (persona === "general") {
      const escrowCtx = metadata?.escrowContext;
      if (escrowCtx || (metadata?.tier && metadata.tier !== "micro")) {
        messages = buildAuditMessages(strategyMemo, escrowCtx) as VeniceMessage[];
      } else {
        messages = buildQuickAuditMessages(strategyMemo) as VeniceMessage[];
      }
    } else {
      const systemPrompt = PERSONA_SYSTEM_PROMPTS[persona];

      let userPrompt = `<strategy_memo>\n${strategyMemo}\n</strategy_memo>`;

      if (metadata?.intelligenceContext) {
        const ctxStr = typeof metadata.intelligenceContext === "string"
          ? metadata.intelligenceContext
          : JSON.stringify(metadata.intelligenceContext, null, 2);
        userPrompt += `\n\n<intelligence_brief>\n${ctxStr}\n</intelligence_brief>`;
      }

      if (metadata?.tradeParams) {
        userPrompt += `\n\n<trade_params>\n${JSON.stringify(metadata.tradeParams, null, 2)}\n</trade_params>`;
      }

      userPrompt += `\n\nReturn JSON with: verdict ("PASS"/"FAIL"), risk_score (0-100), primary_flaw, summary, flags (array with code/severity/evidence/recommendation).`;
      if (metadata?.intelligenceContext) userPrompt += " Factor the intelligence brief into your analysis.";
      if (metadata?.tradeParams) userPrompt += " Cross-reference trade_params against strategy_memo — flag parameter/narrative mismatches.";

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
    }

    const content = await this.chat(messages, model, 0);

    const parsed = parseAuditResponse(content);

    return {
      ...parsed,
      flags: parsed.flags.map(f => ({ ...f, description: f.evidence })),
      model_used: model,
      persona_used: persona,
    };
  }
}

let defaultClient: VeniceClient | null = null;

export function getVeniceClient(apiKeyOverride?: string): VeniceClient {
  if (apiKeyOverride) {
    return new VeniceClient(apiKeyOverride);
  }
  if (!defaultClient) {
    defaultClient = new VeniceClient();
  }
  return defaultClient;
}

export async function runAudit(
  strategyMemo: string,
  persona: AdversarialPersona = "general"
): Promise<AuditResult> {
  return getVeniceClient().audit(strategyMemo, persona);
}

const DJZS_JOURNAL_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "djzs_journal_v1",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "insight", "question"],
      properties: {
        summary: { type: "string", minLength: 10, maxLength: 600 },
        insight: { type: "string", minLength: 10, maxLength: 500 },
        question: { type: "string", minLength: 10, maxLength: 500 },
      }
    }
  }
};

function buildJournalSystemPrompt(): string {
  return `${DJZS_CORE_IDENTITY}

---

You are DJZS — a sharp, no-bullshit adversarial oracle built for founders, traders, and builders operating in volatile markets.

You exist to cut through noise, not add to it. You are not a therapist, coach, or cheerleader. You are the voice in the room that says what everyone else is too polite to say.

Your role:

1. SUMMARY: State plainly what the user actually said — and what they might be avoiding saying. Strip the narrative. Get to the core.

2. INSIGHT: Identify the one thing that matters most. Apply the Evasion Defense Execution Pipeline:
   - STRIP the text to raw premises — ignore rhetoric, jargon, formatting.
   - INVERT — what is the most likely catastrophic failure scenario? If not hedged, it is a fatal flaw.
   - TRACE — who benefits financially or strategically regardless of success?
   - CLASSIFY — evaluate strictly against the 7 DJZS-LF codes (S01, S02, E01, E02, I01, I02, X01). Diagnosis only, no fix advice.
   Look for:
   - Is this thinking driven by strategy or by emotion (FOMO, fear, ego, social pressure)?
   - Contradictions between stated goals and actual behavior
   - Assumptions that haven't been stress-tested
   - Narrative dependency — are they thinking independently or echoing Twitter/community consensus?

3. QUESTION: Ask one question designed to make them uncomfortable in a productive way. Good questions:
   - Force them to confront what they're avoiding
   - Challenge the real motivation behind a decision
   - Expose the gap between conviction and evidence
   - Ask "would you still do this if nobody was watching?"

Be direct. Be precise. Don't soften to be liked. If the reasoning is sound, say so briefly. If it's not — say that too, clearly. No padding. No filler. No "great insight."

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation. Use this exact format:
{"summary": "...", "insight": "...", "question": "..."}`;
}

function buildUserPrompt(
  entry: string,
  recentEntries: JournalEntry[],
): string {
  let prompt = "";

  if (recentEntries.length > 0) {
    prompt += "## Recent Entries\n";
    recentEntries.forEach((e) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      prompt += `### ${date}\n${e.content.slice(0, 500)}${e.content.length > 500 ? "..." : ""}\n\n`;
    });
  }

  prompt += "## Today's Entry\n";
  prompt += entry;
  prompt += "\n\n---\nAnalyze this entry in context of my recent writing.";

  return prompt;
}

export async function analyzeJournalEntry(
  entry: string,
  recentEntries: JournalEntry[],
  apiKeyOverride?: string
): Promise<JournalAnalysis> {
  const client = getVeniceClient(apiKeyOverride);

  const messages: VeniceMessage[] = [
    { role: "system", content: buildJournalSystemPrompt() },
    { role: "user", content: buildUserPrompt(entry, recentEntries) },
  ];

  const content = await client.chat(messages, DEFAULT_MODEL, 0.7, {
    responseFormat: DJZS_JOURNAL_SCHEMA,
    timeoutMs: 60_000,
  });

  const sanitized = content.replace(/[\x00-\x1F\x7F]/g, (ch: string) =>
    ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' '
  );

  const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Journal analysis did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return journalAnalysisSchema.parse(parsed);
}

export { PERSONA_SYSTEM_PROMPTS, getPersonaModel, DEFAULT_MODEL };
