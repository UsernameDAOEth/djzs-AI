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

export const Severity = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  INFO: "INFO",
} as const;

export type SeverityType = typeof Severity[keyof typeof Severity];

export const Verdict = {
  PASS: "PASS",
  FAIL: "FAIL",
} as const;

export type VerdictType = typeof Verdict[keyof typeof Verdict];

export const logicFailureCodeSchema = z.enum([
  "DJZS-S01",
  "DJZS-S02",
  "DJZS-E01",
  "DJZS-E02",
  "DJZS-I01",
  "DJZS-I02",
  "DJZS-X01",
  "DJZS-X02",
  "DJZS-X03",
  "DJZS-T01",
  "DJZS-T02",
]);
export type LogicFailureCode = z.infer<typeof logicFailureCodeSchema>;

export const LOGIC_FAILURE_TAXONOMY: Record<LogicFailureCode, {
  category: string;
  name: string;
  severity: SeverityType;
  autoAbort: boolean;
  description: string;
  riskPoints: number;
}> = {
  "DJZS-S01": { category: "Structural", name: "CIRCULAR_LOGIC", severity: Severity.CRITICAL, autoAbort: true, description: "Conclusion is used as a premise. The reasoning loop references itself without external validation.", riskPoints: 40 },
  "DJZS-S02": { category: "Structural", name: "MISSING_FALSIFIABILITY", severity: Severity.CRITICAL, autoAbort: true, description: "No failure condition defined. The thesis cannot be disproven, making it unfalsifiable and therefore unauditable.", riskPoints: 40 },
  "DJZS-E01": { category: "Epistemic", name: "CONFIRMATION_TUNNEL", severity: Severity.HIGH, autoAbort: true, description: "Evidence selection is asymmetric. Only confirming data is cited; disconfirming signals are absent or dismissed.", riskPoints: 25 },
  "DJZS-E02": { category: "Epistemic", name: "AUTHORITY_SUBSTITUTION", severity: Severity.HIGH, autoAbort: true, description: "Argument depends on authority or reputation rather than structural evidence. Removes the reasoning from audit.", riskPoints: 25 },
  "DJZS-I01": { category: "Incentive", name: "MISALIGNED_INCENTIVE", severity: Severity.MEDIUM, autoAbort: false, description: "The proposed action benefits the proposer disproportionately relative to stated stakeholders.", riskPoints: 10 },
  "DJZS-I02": { category: "Incentive", name: "NARRATIVE_DEPENDENCY", severity: Severity.MEDIUM, autoAbort: false, description: "Strategy survival depends on a specific narrative remaining true. No hedge against narrative collapse.", riskPoints: 10 },
  "DJZS-X01": { category: "Execution", name: "UNHEDGED_EXECUTION", severity: Severity.CRITICAL, autoAbort: true, description: "No risk bounds defined. Unlimited downside exposure. No stop-loss, position sizing, or max drawdown.", riskPoints: 40 },
  "DJZS-X02": { category: "Execution", name: "LIQUIDITY_RISK", severity: Severity.HIGH, autoAbort: true, description: "Strategy assumes liquidity that may not exist. Position may not be exitable at stated price.", riskPoints: 25 },
  "DJZS-X03": { category: "Execution", name: "SLIPPAGE_EXPOSURE", severity: Severity.MEDIUM, autoAbort: false, description: "Strategy ignores execution costs that could erode returns.", riskPoints: 10 },
  "DJZS-T01": { category: "Temporal", name: "STALE_DATA_DEPENDENCY", severity: Severity.HIGH, autoAbort: true, description: "Strategy relies on data that may no longer be current.", riskPoints: 25 },
  "DJZS-T02": { category: "Temporal", name: "RACE_CONDITION_RISK", severity: Severity.MEDIUM, autoAbort: false, description: "Assumes sequential execution but could be front-run.", riskPoints: 10 },
};

export const VALID_FAILURE_CODES = Object.keys(LOGIC_FAILURE_TAXONOMY) as LogicFailureCode[];

export const AUTO_ABORT_CODES = VALID_FAILURE_CODES.filter(
  code => LOGIC_FAILURE_TAXONOMY[code].autoAbort
);

export const auditFlagSeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "INFO"]);
export type AuditFlagSeverity = z.infer<typeof auditFlagSeveritySchema>;

export const auditFlagSchema = z.object({
  code: z.string(),
  severity: auditFlagSeveritySchema,
  message: z.string().optional(),
  evidence: z.string().optional(),
  recommendation: z.string().optional(),
  description: z.string().optional(),
});
export type AuditFlag = z.infer<typeof auditFlagSchema>;

export const verdictSchema = z.enum(["PASS", "FAIL"]);

export const auditResultSchema = z.object({
  verdict: verdictSchema,
  risk_score: z.number().min(0).max(100),
  flags: z.array(auditFlagSchema),
  primary_flaw: z.string(),
  summary: z.string(),
});

export const escrowContextSchema = z.object({
  escrow_id: z.number().int().positive(),
  amount: z.number(),
  tier: z.string(),
  creator: z.string().optional(),
  recipient: z.string().optional(),
});

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
  ]).optional(),
  primary_flaw: z.string().optional(),
  summary: z.string().optional(),
  flags: z.array(auditFlagSchema).default([]),
  logic_flaws: z.array(z.object({
    flaw_type: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    explanation: z.string(),
  })).optional(),
  structural_recommendations: z.array(z.string()).optional(),
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
  escrow_id: z.number().int().positive().optional(),
  escrow_context: escrowContextSchema.optional(),
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
    escrow_id: z.number().int().positive().optional(),
    escrow_context: escrowContextSchema.optional(),
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

export function shouldAutoAbort(code: string): boolean {
  return AUTO_ABORT_CODES.includes(code as LogicFailureCode);
}

export function hasAutoAbortFlags(flags: AuditFlag[]): boolean {
  return flags.some(flag => shouldAutoAbort(flag.code));
}

export function getRiskPoints(code: string): number {
  const def = LOGIC_FAILURE_TAXONOMY[code as LogicFailureCode];
  return def?.riskPoints ?? 10;
}

export function calculateRiskScore(flags: AuditFlag[]): number {
  if (flags.length === 0) return 0;

  let score = 0;
  flags.forEach((flag, index) => {
    score += getRiskPoints(flag.code);
    if (index > 0) score += 5;
  });

  return Math.min(score, 100);
}

export function determineVerdict(flags: AuditFlag[], riskScore: number): VerdictType {
  if (hasAutoAbortFlags(flags)) return Verdict.FAIL;
  if (riskScore >= 60) return Verdict.FAIL;
  if (flags.length >= 3) return Verdict.FAIL;

  const hasCriticalOrHigh = flags.some(f =>
    f.severity === "CRITICAL" || f.severity === "HIGH"
  );
  if (hasCriticalOrHigh) return Verdict.FAIL;

  return Verdict.PASS;
}

export function getFailureDefinition(code: string) {
  return LOGIC_FAILURE_TAXONOMY[code as LogicFailureCode] ?? null;
}

export const escrowAuditRequestSchema = z.object({
  escrow_id: z.number().int().positive(),
  escrow_tx_hash: z.string().regex(/^0x[0-9a-fA-F]+$/, "Must be a valid hex string"),
  strategy_memo: z.string().min(20, "Strategy memo must be at least 20 characters"),
  audit_type: z.enum(["treasury", "founder_drift", "strategy", "general"]).default("general").optional(),
  intelligence_context: z.string().optional(),
  trade_params: tradeParamsSchema.optional(),
  agent_id: z.string().optional(),
});

export type EscrowAuditRequest = z.infer<typeof escrowAuditRequestSchema>;

export function validateMemoLength(memo: string, tier: AuditTier): boolean {
  const config = TIER_CONFIG[tier];
  if (config.maxMemoLength === Infinity) return true;
  return memo.length <= config.maxMemoLength;
}
