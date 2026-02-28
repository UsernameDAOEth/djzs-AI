import { z } from "zod";

export const auditTierSchema = z.enum(["micro", "founder", "treasury"]);
export type AuditTier = z.infer<typeof auditTierSchema>;

export const TIER_CONFIG = {
  micro: {
    name: "The Micro-Zone",
    price: "$2.50",
    maxMemoLength: 1000,
    description: "High-frequency operational ledger and sanity check. Binary risk scoring.",
    endpoint: "/api/audit/micro",
  },
  founder: {
    name: "The Founder Zone",
    price: "$5.00",
    maxMemoLength: 5000,
    description: "Strategic roadmap diligence. Detects narrative drift and confirmation bias.",
    endpoint: "/api/audit/founder",
  },
  treasury: {
    name: "The Treasury Zone",
    price: "$50.00",
    maxMemoLength: Infinity,
    description: "Exhaustive adversarial stress-test for capital deployment proposals.",
    endpoint: "/api/audit/treasury",
  },
} as const;

export const logicFailureCodeSchema = z.enum([
  "DJZS-S01",
  "DJZS-S02",
  "DJZS-E01",
  "DJZS-E02",
  "DJZS-I01",
  "DJZS-I02",
  "DJZS-X01",
]);
export type LogicFailureCode = z.infer<typeof logicFailureCodeSchema>;

export const LOGIC_FAILURE_TAXONOMY: Record<LogicFailureCode, { category: string; name: string; description: string }> = {
  "DJZS-S01": { category: "Structural", name: "CIRCULAR_LOGIC", description: "Conclusion is used as a premise. The reasoning loop references itself without external validation." },
  "DJZS-S02": { category: "Structural", name: "MISSING_FALSIFIABILITY", description: "No failure condition defined. The thesis cannot be disproven, making it unfalsifiable and therefore unauditable." },
  "DJZS-E01": { category: "Epistemic", name: "CONFIRMATION_TUNNEL", description: "Evidence selection is asymmetric. Only confirming data is cited; disconfirming signals are absent or dismissed." },
  "DJZS-E02": { category: "Epistemic", name: "AUTHORITY_SUBSTITUTION", description: "Argument depends on authority or reputation rather than structural evidence. Removes the reasoning from audit." },
  "DJZS-I01": { category: "Incentive", name: "MISALIGNED_INCENTIVE", description: "The proposed action benefits the proposer disproportionately relative to stated stakeholders." },
  "DJZS-I02": { category: "Incentive", name: "NARRATIVE_DEPENDENCY", description: "Strategy survival depends on a specific narrative remaining true. No hedge against narrative collapse." },
  "DJZS-X01": { category: "Execution", name: "UNHEDGED_EXECUTION", description: "No fallback plan. Single point of failure in execution with no contingency or abort conditions defined." },
};

export const auditFlagSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type AuditFlagSeverity = z.infer<typeof auditFlagSeveritySchema>;

export const auditFlagSchema = z.object({
  code: logicFailureCodeSchema,
  severity: auditFlagSeveritySchema,
  message: z.string(),
});
export type AuditFlag = z.infer<typeof auditFlagSchema>;

export const verdictSchema = z.enum(["PASS", "FAIL"]);
export type Verdict = z.infer<typeof verdictSchema>;

export const djzsLogicAuditSchema = z.object({
  audit_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  tier: auditTierSchema,
  risk_score: z.number().min(0).max(100),
  verdict: verdictSchema,
  primary_bias_detected: z.enum([
    "FOMO",
    "Sunk_Cost",
    "Narrative_Reaction",
    "Authority_Bias",
    "Confirmation_Bias",
    "Recency_Bias",
    "None",
  ]),
  flags: z.array(auditFlagSchema).default([]),
  logic_flaws: z.array(z.object({
    flaw_type: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    explanation: z.string(),
  })).min(0),
  structural_recommendations: z.array(z.string()),
  cryptographic_hash: z.string(),
});

export type DJZSLogicAudit = z.infer<typeof djzsLogicAuditSchema>;

export const tradeParamsSchema = z.object({
  protocol: z.string().optional(),
  pair: z.string().optional(),
  direction: z.enum(["long", "short", "neutral"]).optional(),
  leverage: z.number().min(1).max(200).optional(),
  notional_usd: z.number().min(0).optional(),
  stop_loss_pct: z.number().min(0).max(100).optional(),
  take_profit_pct: z.number().min(0).max(1000).optional(),
  entry_price: z.number().min(0).optional(),
  timeframe: z.string().optional(),
});
export type TradeParams = z.infer<typeof tradeParamsSchema>;

export const auditRequestSchema = z.object({
  strategy_memo: z.string().min(20, "Strategy memo must be at least 20 characters"),
  audit_type: z.enum(["treasury", "founder_drift", "strategy", "general"]).default("general"),
  intelligence_context: z.string().optional(),
  trade_params: tradeParamsSchema.optional(),
  agent_id: z.string().optional(),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

export function createTieredRequestSchema(tier: AuditTier) {
  const config = TIER_CONFIG[tier];
  const base = z.object({
    strategy_memo: z.string().min(20, "Strategy memo must be at least 20 characters"),
    audit_type: z.enum(["treasury", "founder_drift", "strategy", "general"]).default("general"),
    intelligence_context: z.string().optional(),
    trade_params: tradeParamsSchema.optional(),
    agent_id: z.string().optional(),
  });

  if (config.maxMemoLength !== Infinity) {
    return base.extend({
      strategy_memo: z.string()
        .min(20, "Strategy memo must be at least 20 characters")
        .max(config.maxMemoLength, `${config.name} memo limit: ${config.maxMemoLength} characters`),
    });
  }

  return base;
}
