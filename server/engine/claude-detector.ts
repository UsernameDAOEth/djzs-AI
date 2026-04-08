import Anthropic from "@anthropic-ai/sdk";
import type { PredictionContext, LFDetectionResult, DetectionEngine, SignalSource } from "@shared/prediction-schema";
import { LFDetectionResultSchema } from "@shared/prediction-schema";

export interface DetectionEngineConfig {
  engine: DetectionEngine;
  anthropic_api_key?: string;
  venice_api_key?: string;
  model?: string;
  max_tokens?: number;
}

const PREDICTION_SYSTEM_PROMPT = `You are the DJZS Adversarial Logic Firewall — a deterministic detection engine for the DJZS Protocol. You evaluate prediction market position theses against the DJZS-LF failure taxonomy.

You are NOT an advisor. You do NOT predict outcomes. You detect logical failures in reasoning.

## DJZS-LF FAILURE TAXONOMY — PREDICTION MARKET DEFINITIONS

### Structural (S)
S01 (CIRCULAR_LOGIC): The thesis uses the market price, volume, or momentum as evidence for the position. "It's at 0.85 so it will resolve YES" is circular — the market price IS the collective thesis, not independent evidence. Whale purchases, trading volume spikes, and "smart money is buying" are all S01 when presented as the thesis rather than supplementary context.

S02 (FALSE_EQUIVALENCE): The thesis draws parallels between the current market and a historical precedent without accounting for material differences. "Last time X happened, Y resolved YES" fails S02 when the thesis does not address why the current context is sufficiently similar.

### Epistemic (E)
E01 (CHERRY_PICKING): The thesis selectively cites evidence favoring the position while omitting known contradicting evidence. For prediction markets, this includes: citing polls that favor the position while ignoring polls that don't; citing one expert while ignoring the consensus; citing a single data point from a noisy dataset.

E02 (MISSING_EVIDENCE): The thesis fails to state its own falsification criteria. Every legitimate prediction thesis must answer: "What observable event before resolution would prove me wrong?" Absence of this answer is an automatic E02 flag. Additionally, making verifiable factual claims without any source constitutes E02.

### Incentive (I)
I01 (FOMO_LOOP): The thesis is driven by social pressure, herd behavior, or urgency rather than independent analysis. Key indicators: "everyone is buying," "the signal group says," "price is pumping," "don't miss this," temporal urgency without logical basis. The source_signal field is the primary I01 input — PAID_SIGNAL_GROUP and UNDISCLOSED sources receive automatic I01 flags unless the thesis demonstrates independent reasoning beyond the signal.

I02 (SUNK_COST): The thesis references a prior position, prior losses, or a desire to "average down" or "make back" previous losses. Any reference to a prior position as justification for the current position is I02.

I03 (ANCHORING_BIAS): The thesis is anchored to a specific price, probability, or reference point without justification. Key indicators: buying YES at >0.90 or NO at <0.10 without explicit tail-risk analysis; "it was at 0.50 last week so 0.75 is still cheap"; fixation on entry price rather than resolution probability.

### Execution (X)
X01 (EXECUTION_DRIFT): The proposed position contradicts the thesis. Example: thesis argues the event is unlikely but position is YES. Or thesis argues for a small exploratory position but size_usdc is disproportionately large relative to stated confidence.

X02 (SCOPE_CREEP): The thesis argues about something adjacent to but NOT the actual resolution question. The market asks "Will X happen by Y date?" but the thesis argues about Z. Common in political markets where the thesis argues about general sentiment rather than the specific resolution criteria.

### Temporal (T)
T01 (STALE_DATA): The thesis relies on data, events, or conditions that have materially changed or are likely to change before the market resolves. Citing polls from months ago in a fast-moving political market, or using yesterday's on-chain data for a market resolving in hours.

## OUTPUT CONTRACT

Return ONLY a JSON object with this exact shape. No preamble, no markdown fencing, no commentary:

{
  "S01": { "detected": <boolean>, "evidence": "<string>" },
  "S02": { "detected": <boolean>, "evidence": "<string>" },
  "E01": { "detected": <boolean>, "evidence": "<string>" },
  "E02": { "detected": <boolean>, "evidence": "<string>" },
  "I01": { "detected": <boolean>, "evidence": "<string>" },
  "I02": { "detected": <boolean>, "evidence": "<string>" },
  "I03": { "detected": <boolean>, "evidence": "<string>" },
  "X01": { "detected": <boolean>, "evidence": "<string>" },
  "X02": { "detected": <boolean>, "evidence": "<string>" },
  "T01": { "detected": <boolean>, "evidence": "<string>" }
}

Rules:
- "detected": true means the flaw IS present in the thesis.
- "detected": false means no evidence of this flaw.
- "evidence": when detected=true, quote or paraphrase the specific part of the thesis that triggered the flag. When detected=false, write "CLEAR".
- Be aggressive. A weak thesis should fail multiple codes. You are a firewall, not an advisor.
- Never return detected=false out of politeness. If the reasoning is bad, say so.`;

const SOURCE_RISK_NOTES: Record<SignalSource, string> = {
  INDEPENDENT_RESEARCH:
    ">> No automatic risk modifier. Evaluate thesis on its own merits.",
  AGGREGATED_CONSENSUS:
    ">> Check S01 — consensus-as-evidence is circular when the consensus IS the market price.",
  SOCIAL_SIGNAL:
    ">> ELEVATED I01 RISK. Verify thesis contains independent reasoning beyond sentiment.",
  PAID_SIGNAL_GROUP:
    ">> HIGHEST I01 RISK. Agent is paying for someone else's thesis. If the thesis is just 'the group says buy,' that is textbook FOMO_LOOP — flag I01.",
  WHALE_TRACKING:
    ">> ELEVATED S01 RISK. 'A large wallet bought' is not a thesis — it's mimicry. Flag S01 unless the thesis explains WHY the whale's reasoning is sound.",
  COUNTER_CONSENSUS:
    ">> Lower I01 risk but ELEVATED E01 RISK. Contrarian positions that cherry-pick while ignoring consensus evidence fail E01.",
  MODEL_OUTPUT:
    ">> ELEVATED S02 RISK. 'GPT-4 says YES' is false equivalence between model confidence and prediction accuracy. Flag S02 unless thesis validates the model's reasoning independently.",
  UNDISCLOSED:
    ">> AUTOMATIC I01 FLAG. Agent refuses to disclose signal source. Cannot demonstrate independent reasoning. Flag I01 unconditionally.",
};

export function buildPredictionUserMessage(ctx: PredictionContext): string {
  const sourceRiskNote = SOURCE_RISK_NOTES[ctx.source_signal];

  return `AUDIT REQUEST — Prediction Market Position

MARKET QUESTION (exact resolution criteria):
"${ctx.market_question}"

CATEGORY: ${ctx.category}

POSITION: ${ctx.position} @ ${ctx.entry_price} | SIZE: $${ctx.size_usdc} USDC

SIGNAL SOURCE: ${ctx.source_signal}
${sourceRiskNote}

THESIS:
"${ctx.thesis}"

${ctx.evidence_urls?.length ? `EVIDENCE URLS:\n${ctx.evidence_urls.map((u, i) => `  ${i + 1}. ${u}`).join("\n")}` : "NO EVIDENCE URLS PROVIDED."}

Evaluate now. Return only the JSON object.`;
}

export async function detectLogicFlaws(
  ctx: PredictionContext,
  config: DetectionEngineConfig
): Promise<LFDetectionResult> {
  if (config.engine === "VENICE") {
    return detectViaVenice(ctx, config);
  }

  const apiKey = config.anthropic_api_key ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is required for Claude detection engine. " +
      "Set the environment variable or use engine: 'VENICE' for privacy fallback."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: config.model ?? "claude-sonnet-4-20250514",
    max_tokens: config.max_tokens ?? 1024,
    temperature: 0,
    system: PREDICTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildPredictionUserMessage(ctx),
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();

  const parsed = JSON.parse(cleaned);
  return LFDetectionResultSchema.parse(parsed);
}

async function detectViaVenice(
  ctx: PredictionContext,
  config: DetectionEngineConfig
): Promise<LFDetectionResult> {
  const apiKey = config.venice_api_key ?? process.env.VENICE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VENICE_API_KEY is required for Venice detection engine."
    );
  }

  const baseUrl = process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1";
  const model = config.model ?? "llama-3.3-70b";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: PREDICTION_SYSTEM_PROMPT },
          { role: "user", content: buildPredictionUserMessage(ctx) },
        ],
        max_tokens: 1024,
        temperature: 0,
        venice_parameters: { include_venice_system_prompt: false },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Venice API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const text = data.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return LFDetectionResultSchema.parse(parsed);
  } finally {
    clearTimeout(timer);
  }
}

export { PREDICTION_SYSTEM_PROMPT };
