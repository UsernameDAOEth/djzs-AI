import { djzsLogicAuditSchema, type DJZSLogicAudit, type AuditRequest, type AuditTier } from "@shared/audit-schema";
import { DJZS_CORE_IDENTITY } from "./ai-identity";
import { createHash, randomUUID } from "crypto";

const VENICE_API_BASE = "https://api.venice.ai/api/v1";

const TIER_PROMPTS: Record<AuditTier, { preamble: string; temperature: number; maxTokens: number }> = {
  micro: {
    preamble: `ZONE: Micro-Zone (Operational Ledger)
EXECUTION MODE: Fast, constrained sanity check. Binary risk scoring.
DEPTH: Surface-level logic scan. Identify the single most dangerous assumption and the primary emotional driver. Do not over-analyze — speed is the value proposition.
MAX FLAWS TO REPORT: 3`,
    temperature: 0.3,
    maxTokens: 1200,
  },
  founder: {
    preamble: `ZONE: Founder Zone (Strategic Roadmap Ledger)
EXECUTION MODE: Deep narrative-focused audit. Cross-reference against historical startup failure modes.
DEPTH: Full roadmap analysis. Isolate the thesis from ego. Detect pivot-chasing, narrative drift, and confirmation bias in strategic decisions. Compare stated goals against actual moves.
MAX FLAWS TO REPORT: 6`,
    temperature: 0.4,
    maxTokens: 2000,
  },
  treasury: {
    preamble: `ZONE: Treasury Zone (Governance Ledger)
EXECUTION MODE: Exhaustive adversarial breakdown. This is the most rigorous audit tier — capital deployment depends on this verdict.
DEPTH: Full multi-vector stress test. Attack every assumption. Model failure scenarios. Identify systemic risks, liquidity traps, governance capture vectors, and emotional reasoning masquerading as strategy. Leave nothing unexamined.
MAX FLAWS TO REPORT: unlimited`,
    temperature: 0.5,
    maxTokens: 4000,
  },
};

const AUDIT_JSON_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  required: ["risk_score", "primary_bias_detected", "logic_flaws", "structural_recommendations"],
  properties: {
    risk_score: { type: "number", minimum: 0, maximum: 100 },
    primary_bias_detected: {
      type: "string",
      enum: ["FOMO", "Sunk_Cost", "Narrative_Reaction", "Authority_Bias", "Confirmation_Bias", "Recency_Bias", "None"],
    },
    logic_flaws: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["flaw_type", "severity", "explanation"],
        properties: {
          flaw_type: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "critical"] },
          explanation: { type: "string" },
        },
      },
    },
    structural_recommendations: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function buildAuditSystemPrompt(auditType: string, tier: AuditTier): string {
  const typeInstructions: Record<string, string> = {
    treasury: `AUDIT TYPE: DAO Treasury Stress-Test.
Focus on: capital allocation logic, yield assumptions, liquidity risk, governance proposal quality, emotional vs. structural reasoning behind treasury moves.`,
    founder_drift: `AUDIT TYPE: Founder Drift Audit.
Focus on: alignment between original vision and current actions, pivot-chasing behavior, narrative dependency, strategic integrity over time.`,
    strategy: `AUDIT TYPE: Strategy Stress-Test.
Focus on: assumption validity, competitive moat analysis, market timing dependency, resource allocation logic, survivability under adverse conditions.`,
    general: `AUDIT TYPE: General Logic Audit.
Focus on: reasoning quality, assumption identification, bias detection, logical consistency, evidence strength.`,
  };

  const tierConfig = TIER_PROMPTS[tier];

  return `${DJZS_CORE_IDENTITY}

---

You are operating as DJZS AI — an autonomous auditing agent in the Agent-to-Agent (A2A) economy. You are deployed inside the ${tier === "micro" ? "Micro-Zone" : tier === "founder" ? "Founder Zone" : "Treasury Zone"}.

${tierConfig.preamble}

${typeInstructions[auditType] || typeInstructions.general}

Your job is to be adversarial. Try to kill the thesis. Find where the logic breaks. Identify what bias is driving the decision. Score the risk ruthlessly — 0 means perfect logic with no detectable flaws, 100 means the reasoning is critically compromised.

Rules:
- No first-person language ("I think/notice/see")
- No validation of weak reasoning
- No softening language
- Be precise about what specific bias is present
- Every flaw must include why it fails under stress
- Recommendations must be concrete and actionable, not generic advice

IMPORTANT: Respond with valid JSON only. No markdown, no explanation outside the JSON structure.
{
  "risk_score": <0-100>,
  "primary_bias_detected": "<FOMO|Sunk_Cost|Narrative_Reaction|Authority_Bias|Confirmation_Bias|Recency_Bias|None>",
  "logic_flaws": [{"flaw_type": "...", "severity": "low|medium|critical", "explanation": "..."}],
  "structural_recommendations": ["...", "..."]
}`;
}

export async function runLogicAuditAgent(
  request: AuditRequest,
  tier: AuditTier = "micro",
  apiKeyOverride?: string
): Promise<DJZSLogicAudit> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;

  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const tierConfig = TIER_PROMPTS[tier];
  const auditId = randomUUID();
  const timestamp = new Date().toISOString();
  const inputHash = createHash("sha256").update(request.strategy_memo).digest("hex");

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: buildAuditSystemPrompt(request.audit_type, tier) },
        {
          role: "user",
          content: `STRATEGY MEMO FOR AUDIT:\n\n${request.strategy_memo}\n\n---\nPerform a full logic audit. Score the risk. Identify bias. Find the flaws. Be adversarial.`,
        },
      ],
      temperature: tierConfig.temperature,
      max_tokens: tierConfig.maxTokens,
      venice_parameters: {
        include_venice_system_prompt: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Venice API error during audit:", response.status, errorText);
    throw new Error(`Venice API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in Venice response for audit");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Audit agent did not return valid JSON");
  }

  const sanitizedContent = jsonMatch[0].replace(
    /[\x00-\x1F\x7F]/g,
    (ch: string) => (ch === "\n" || ch === "\r" || ch === "\t" ? ch : " ")
  );
  const parsed = JSON.parse(sanitizedContent);

  const fullAudit: DJZSLogicAudit = {
    audit_id: auditId,
    timestamp,
    tier,
    risk_score: parsed.risk_score,
    primary_bias_detected: parsed.primary_bias_detected,
    logic_flaws: parsed.logic_flaws || [],
    structural_recommendations: parsed.structural_recommendations || [],
    cryptographic_hash: inputHash,
  };

  const validated = djzsLogicAuditSchema.parse(fullAudit);
  return validated;
}
