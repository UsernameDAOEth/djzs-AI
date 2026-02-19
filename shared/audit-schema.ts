import { z } from "zod";

export const djzsLogicAuditSchema = z.object({
  audit_id: z.string().uuid(),
  timestamp: z.string().datetime(),
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
