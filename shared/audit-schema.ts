import { z } from "zod";
import { createHash } from "crypto";

export type LFCode =
  | "DJZS-S01" | "DJZS-S02" | "DJZS-S03"
  | "DJZS-E01" | "DJZS-E02"
  | "DJZS-I01" | "DJZS-I02" | "DJZS-I03"
  | "DJZS-X01" | "DJZS-X02"
  | "DJZS-T01";

export type LogicFailureCode = LFCode;

export type LFCategory = "Structural" | "Epistemic" | "Incentive" | "Execution" | "Temporal";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type AuditVerdict = "PASS" | "FAIL";

export interface LFDefinition {
  code: LFCode;
  name: string;
  category: LFCategory;
  weight: number;
  severity: Severity;
  description: string;
  riskPoints: number;
  autoAbort: boolean;
}

export interface DetectionFlag {
  present: boolean;
  evidence: string | null;
}

export type DetectionResult = Record<LFCode, DetectionFlag>;

export interface AuditCertificate {
  audit_id: string;
  audit_verdict: AuditVerdict;
  risk_score: number;
  max_possible: number;
  pass_threshold: number;
  failure_flags: LFCode[];
  logic_hash: string;
  weights_hash: string;
  audit_schema_version: string;
  threshold_block: number;
  detection_model: string;
  scoring_engine: string;
  anchor_target: string;
  settlement_chain: string;
  timestamp: string;
}

export const LOGIC_FAILURE_TAXONOMY: Record<LFCode, LFDefinition> = {
  "DJZS-S01": {
    code: "DJZS-S01",
    name: "CIRCULAR_LOGIC",
    category: "Structural",
    weight: 30,
    severity: "CRITICAL",
    description: "Reasoning chain references its own conclusion as premise",
    riskPoints: 30,
    autoAbort: true,
  },
  "DJZS-S02": {
    code: "DJZS-S02",
    name: "LAYER_INVERSION",
    category: "Structural",
    weight: 25,
    severity: "HIGH",
    description: "Verification layer depends on unverified upstream data",
    riskPoints: 25,
    autoAbort: true,
  },
  "DJZS-S03": {
    code: "DJZS-S03",
    name: "DEPENDENCY_GHOST",
    category: "Structural",
    weight: 18,
    severity: "MEDIUM",
    description: "References external dependency that cannot be resolved",
    riskPoints: 18,
    autoAbort: false,
  },

  "DJZS-E01": {
    code: "DJZS-E01",
    name: "ORACLE_UNVERIFIED",
    category: "Epistemic",
    weight: 25,
    severity: "HIGH",
    description: "External data source cited without provenance verification",
    riskPoints: 25,
    autoAbort: true,
  },
  "DJZS-E02": {
    code: "DJZS-E02",
    name: "CONFIDENCE_INFLATION",
    category: "Epistemic",
    weight: 18,
    severity: "MEDIUM",
    description: "Stated certainty exceeds evidential basis",
    riskPoints: 18,
    autoAbort: false,
  },

  "DJZS-I01": {
    code: "DJZS-I01",
    name: "FOMO_LOOP",
    category: "Incentive",
    weight: 16,
    severity: "MEDIUM",
    description: "Decision driven by social signal rather than verified data",
    riskPoints: 16,
    autoAbort: false,
  },
  "DJZS-I02": {
    code: "DJZS-I02",
    name: "MISALIGNED_REWARD",
    category: "Incentive",
    weight: 16,
    severity: "MEDIUM",
    description: "Optimization target diverges from stated objective",
    riskPoints: 16,
    autoAbort: false,
  },
  "DJZS-I03": {
    code: "DJZS-I03",
    name: "DATA_UNVERIFIED",
    category: "Incentive",
    weight: 16,
    severity: "MEDIUM",
    description: "Numerical claims lack verifiable source attribution",
    riskPoints: 16,
    autoAbort: false,
  },

  "DJZS-X01": {
    code: "DJZS-X01",
    name: "EXECUTION_UNBOUND",
    category: "Execution",
    weight: 36,
    severity: "CRITICAL",
    description: "No halt condition or resource ceiling defined",
    riskPoints: 36,
    autoAbort: true,
  },
  "DJZS-X02": {
    code: "DJZS-X02",
    name: "RACE_CONDITION",
    category: "Execution",
    weight: 24,
    severity: "HIGH",
    description: "Temporal dependency creates non-deterministic outcome",
    riskPoints: 24,
    autoAbort: true,
  },

  "DJZS-T01": {
    code: "DJZS-T01",
    name: "STALE_REFERENCE",
    category: "Temporal",
    weight: 12,
    severity: "LOW",
    description: "Data reference exceeds freshness threshold",
    riskPoints: 12,
    autoAbort: false,
  },
} as const;

export const MAX_RISK_SCORE = Object.values(LOGIC_FAILURE_TAXONOMY)
  .reduce((sum, def) => sum + def.weight, 0);

export const ALL_LF_CODES = Object.keys(LOGIC_FAILURE_TAXONOMY) as LFCode[];
export const VALID_FAILURE_CODES = ALL_LF_CODES;

export const SCHEMA_VERSION = "DJZS-LF-v1.0";

if (MAX_RISK_SCORE !== 200) {
  throw new Error(
    `[DJZS FATAL] Taxonomy weights sum to ${MAX_RISK_SCORE}, expected 200. ` +
    `Weight table integrity compromised.`
  );
}

export const AUTO_ABORT_CODES = VALID_FAILURE_CODES.filter(
  code => LOGIC_FAILURE_TAXONOMY[code].autoAbort
);

function sha256(input: string): string {
  return "0x" + createHash("sha256").update(input).digest("hex");
}

function canonicalize(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export const WEIGHTS_HASH: string = sha256(
  canonicalize(
    Object.fromEntries(
      Object.entries(LOGIC_FAILURE_TAXONOMY).map(([k, v]) => [k, v.weight])
    )
  )
);

export function calculateRiskScore(flags: DetectionResult): number {
  return Object.entries(flags)
    .filter(([_, v]) => (v as DetectionFlag).present)
    .reduce((sum, [code]) => {
      const def = LOGIC_FAILURE_TAXONOMY[code as LFCode];
      return sum + (def?.weight ?? 0);
    }, 0);
}

export function determineVerdict(riskScore: number, threshold: number): AuditVerdict {
  return riskScore < threshold ? "PASS" : "FAIL";
}

export function computeVerdictHash(
  flags: DetectionResult,
  riskScore: number
): string {
  const booleanOnly: Record<string, boolean> = {};
  for (const code of ALL_LF_CODES) {
    booleanOnly[code] = flags[code]?.present ?? false;
  }

  const hashInput = canonicalize({
    schema_version: SCHEMA_VERSION,
    flags: booleanOnly,
    risk_score: riskScore,
  });

  return sha256(hashInput);
}

export interface VerdictInput {
  flags: DetectionResult;
  threshold: number;
  thresholdBlock: number;
  auditId: string;
}

export function computeVerdict(input: VerdictInput): AuditCertificate {
  const { flags, threshold, thresholdBlock, auditId } = input;

  const riskScore = calculateRiskScore(flags);
  const verdict = determineVerdict(riskScore, threshold);
  const logicHash = computeVerdictHash(flags, riskScore);

  const failureFlags = ALL_LF_CODES.filter((code) => flags[code]?.present);

  return {
    audit_id: auditId,
    audit_verdict: verdict,
    risk_score: riskScore,
    max_possible: MAX_RISK_SCORE,
    pass_threshold: threshold,
    failure_flags: failureFlags,
    logic_hash: logicHash,
    weights_hash: WEIGHTS_HASH,
    audit_schema_version: SCHEMA_VERSION,
    threshold_block: thresholdBlock,
    detection_model: "venice/llama-3.3-70b@temp=0",
    scoring_engine: "typescript/pure-function",
    anchor_target: "irys-datachain",
    settlement_chain: "base-mainnet",
    timestamp: new Date().toISOString(),
  };
}

export const detectionFlagSchema = z.object({
  present: z.boolean(),
  evidence: z.string().nullable(),
});

export const detectionResultSchema = z.record(
  z.enum(ALL_LF_CODES as [string, ...string[]]),
  detectionFlagSchema
);

export const auditCertificateSchema = z.object({
  audit_id: z.string(),
  audit_verdict: z.enum(["PASS", "FAIL"]),
  risk_score: z.number().min(0).max(200),
  max_possible: z.literal(200),
  pass_threshold: z.number().min(0).max(200),
  failure_flags: z.array(z.string()),
  logic_hash: z.string(),
  weights_hash: z.string(),
  audit_schema_version: z.literal(SCHEMA_VERSION),
  threshold_block: z.number(),
  detection_model: z.string(),
  scoring_engine: z.string(),
  anchor_target: z.string(),
  settlement_chain: z.string(),
  timestamp: z.string(),
});

export const auditTierSchema = z.enum(["micro", "founder", "treasury"]);
export type AuditTier = z.infer<typeof auditTierSchema>;

export const TIER_CONFIG = {
  micro: {
    name: "The Micro-Zone",
    price: "$0.10",
    maxMemoLength: 1000,
    description: "High-frequency operational ledger and sanity check. Binary risk scoring.",
    endpoint: "/api/audit/micro",
  },
  founder: {
    name: "The Founder Zone",
    price: "$1.00",
    maxMemoLength: 5000,
    description: "Strategic roadmap diligence. Detects narrative drift and confirmation bias.",
    endpoint: "/api/audit/founder",
  },
  treasury: {
    name: "The Treasury Zone",
    price: "$10.00",
    maxMemoLength: Infinity,
    description: "Exhaustive adversarial stress-test for capital deployment proposals.",
    endpoint: "/api/audit/treasury",
  },
} as const;

export type SeverityType = Severity;

export const Verdict = {
  PASS: "PASS",
  FAIL: "FAIL",
} as const;

export type VerdictType = typeof Verdict[keyof typeof Verdict];

export const logicFailureCodeSchema = z.enum(ALL_LF_CODES as [string, ...string[]]);

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
  risk_score: z.number().min(0).max(200),
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
  risk_score: z.number().min(0).max(200),
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
  return def?.weight ?? 0;
}

export function calculateLegacyRiskScore(flags: AuditFlag[]): number {
  if (flags.length === 0) return 0;
  return flags.reduce((sum, flag) => sum + getRiskPoints(flag.code), 0);
}

export function determineLegacyVerdict(flags: AuditFlag[], riskScore: number): VerdictType {
  if (hasAutoAbortFlags(flags)) return Verdict.FAIL;
  if (riskScore >= 60) return Verdict.FAIL;
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
