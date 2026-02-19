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

export const djzsLogicAuditSchema = z.object({
  audit_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  tier: auditTierSchema,
  risk_score: z.number().min(0).max(100),
  primary_bias_detected: z.enum([
    "FOMO",
    "Sunk_Cost",
    "Narrative_Reaction",
    "Authority_Bias",
    "Confirmation_Bias",
    "Recency_Bias",
    "None",
  ]),
  logic_flaws: z.array(z.object({
    flaw_type: z.string(),
    severity: z.enum(["low", "medium", "critical"]),
    explanation: z.string(),
  })).min(0),
  structural_recommendations: z.array(z.string()),
  cryptographic_hash: z.string(),
});

export type DJZSLogicAudit = z.infer<typeof djzsLogicAuditSchema>;

export const auditRequestSchema = z.object({
  strategy_memo: z.string().min(20, "Strategy memo must be at least 20 characters"),
  audit_type: z.enum(["treasury", "founder_drift", "strategy", "general"]).default("general"),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

export function createTieredRequestSchema(tier: AuditTier) {
  const config = TIER_CONFIG[tier];
  const base = z.object({
    strategy_memo: z.string().min(20, "Strategy memo must be at least 20 characters"),
    audit_type: z.enum(["treasury", "founder_drift", "strategy", "general"]).default("general"),
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
