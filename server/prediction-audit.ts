import crypto from "crypto";
import type { PredictionContext, LFDetectionResult, DetectionEngine } from "@shared/prediction-schema";
import { PredictionContextSchema } from "@shared/prediction-schema";
import { detectLogicFlaws, type DetectionEngineConfig } from "./engine/claude-detector";
import { DJZS_WEIGHTS } from "./engine/weights";
import { SCHEMA_VERSION, WEIGHTS_HASH, MAX_RISK_SCORE, ALL_LF_CODES, LOGIC_FAILURE_TAXONOMY } from "@shared/audit-schema";
import type { ProofOfLogicCertificate } from "./audit-agent";
type PredictionLFCode = "S01" | "S02" | "E01" | "E02" | "I01" | "I02" | "I03" | "X01" | "X02" | "T01";

export class PredictionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PredictionConfigError";
  }
}

export interface PredictionAuditInput {
  context: PredictionContext;
  engine?: DetectionEngine;
  agent_id?: string;
}

export async function executePredictionAudit(
  input: PredictionAuditInput
): Promise<ProofOfLogicCertificate> {
  const validated = PredictionContextSchema.parse(input.context);

  const engine: DetectionEngine = input.engine ?? "CLAUDE";

  if (engine === "CLAUDE" && !process.env.ANTHROPIC_API_KEY) {
    throw new PredictionConfigError(
      "ANTHROPIC_API_KEY is not configured. Use engine: 'VENICE' for privacy fallback, or set the ANTHROPIC_API_KEY environment variable."
    );
  }
  if (engine === "VENICE" && !process.env.VENICE_API_KEY) {
    throw new PredictionConfigError(
      "VENICE_API_KEY is not configured. Use engine: 'CLAUDE' with ANTHROPIC_API_KEY, or set the VENICE_API_KEY environment variable."
    );
  }

  const engineConfig: DetectionEngineConfig = { engine };

  const audit_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const cryptographic_hash = crypto
    .createHash("sha256")
    .update(validated.thesis)
    .digest("hex");

  let detectionResult: LFDetectionResult;
  let detectionModel: string;
  let isIndeterminate = false;

  try {
    detectionResult = await detectLogicFlaws(validated, engineConfig);
    detectionModel = engine === "CLAUDE"
      ? "anthropic/claude-sonnet-4@prediction-v1"
      : "venice/llama-3.3-70b@prediction-v1";
  } catch (err) {
    console.error(`[PredictionAudit ${audit_id}] Detection engine returned unparseable result:`, err);
    isIndeterminate = true;
    detectionResult = createEmptyDetectionResult();
    detectionModel = `${engine.toLowerCase()}/error@prediction-v1`;
  }

  if (isIndeterminate) {
    const certificate: ProofOfLogicCertificate = {
      audit_id,
      timestamp,
      tier: "micro",
      cryptographic_hash,
      audit_schema_version: SCHEMA_VERSION,
      weights_hash: WEIGHTS_HASH,
      max_possible: MAX_RISK_SCORE,
      pass_threshold: 60,
      detection_model: detectionModel,
      scoring_engine: "typescript/pure-function",
      anchor_target: "irys-datachain",
      settlement_chain: "base-mainnet",
      verdict: "INDETERMINATE",
      risk_score: 0,
      primary_flaw: "INDETERMINATE",
      summary: "Detection engine returned unparseable output. Verdict is INDETERMINATE — no assertion can be made about thesis quality. Retry or switch engine.",
      flags: [{
        code: "DJZS-INDETERMINATE",
        severity: "CRITICAL",
        evidence: "Detection engine did not return a valid result",
        recommendation: "Retry the audit or switch to a different detection engine",
      }],
      model_used: detectionModel,
      persona_used: "general",
    };
    return certificate;
  }

  applyDeterministicGuardrails(detectionResult, validated);

  const { flags, riskScore, firedCodes } = scoreDetectionResult(detectionResult, validated);

  const verdict: "PASS" | "FAIL" =
    riskScore >= 60 || flags.some(f => f.severity === "CRITICAL")
      ? "FAIL"
      : "PASS";

  const detectedCodes = new Set(flags.map(f => f.code));
  const flagVector: Record<string, boolean> = {};
  for (const code of ALL_LF_CODES) {
    flagVector[code] = detectedCodes.has(code);
  }
  const hashObj = { schema_version: SCHEMA_VERSION, flags: flagVector, risk_score: riskScore };
  const logicHashInput = JSON.stringify(hashObj, (_key, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(value as Record<string, unknown>).sort()) {
        sorted[k] = (value as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return value;
  });
  const logic_hash = "0x" + crypto.createHash("sha256").update(logicHashInput).digest("hex");

  const primaryFlaw = firedCodes.length > 0 ? firedCodes[0] : "None";

  const summary = verdict === "PASS"
    ? firedCodes.length === 0
      ? "No logic failures detected. Thesis is structurally sound."
      : `Minor observations detected (${firedCodes.length} code${firedCodes.length > 1 ? "s" : ""}). Thesis passes with observations.`
    : `${firedCodes.length} logic failure${firedCodes.length > 1 ? "s" : ""} detected (risk_score=${riskScore}). Thesis fails audit.`;

  const certificate: ProofOfLogicCertificate = {
    audit_id,
    timestamp,
    tier: "micro",
    cryptographic_hash,
    audit_schema_version: SCHEMA_VERSION,
    weights_hash: WEIGHTS_HASH,
    logic_hash,
    max_possible: MAX_RISK_SCORE,
    pass_threshold: 60,
    detection_model: detectionModel,
    scoring_engine: "typescript/pure-function",
    anchor_target: "irys-datachain",
    settlement_chain: "base-mainnet",
    verdict,
    risk_score: riskScore,
    primary_flaw: primaryFlaw,
    summary,
    flags,
    model_used: detectionModel,
    persona_used: "general",
    logic_flaws: firedCodes.map(code => {
      const entry = detectionResult[code as keyof LFDetectionResult];
      return `${code}: ${entry?.evidence || "detected"}`;
    }),
    structural_recommendations: firedCodes.map(code => {
      const taxonomy = LOGIC_FAILURE_TAXONOMY[`DJZS-${code}` as keyof typeof LOGIC_FAILURE_TAXONOMY];
      return taxonomy
        ? `Review and address ${taxonomy.name} (${code})`
        : `Review detection for ${code}`;
    }),
    primary_bias_detected: derivePrimaryBias(firedCodes),
  };

  return certificate;
}

function scoreDetectionResult(
  result: LFDetectionResult,
  ctx: PredictionContext
): {
  flags: ProofOfLogicCertificate["flags"];
  riskScore: number;
  firedCodes: string[];
} {
  const djzsCodeKeys: PredictionLFCode[] = ["S01", "S02", "E01", "E02", "I01", "I02", "I03", "X01", "X02", "T01"];
  const fired: Array<{ code: PredictionLFCode; evidence: string }> = [];

  for (const code of djzsCodeKeys) {
    const entry = result[code];
    if (entry.detected) {
      fired.push({ code, evidence: entry.evidence });
    }
  }

  applySourceSignalModifiers(result, ctx, fired);

  let totalPenalty = 0;
  const flags: ProofOfLogicCertificate["flags"] = [];

  for (const { code, evidence } of fired) {
    const weight = DJZS_WEIGHTS[code] || 0;
    totalPenalty += weight;
    const djzsCode = `DJZS-${code}`;
    const taxonomy = LOGIC_FAILURE_TAXONOMY[djzsCode as keyof typeof LOGIC_FAILURE_TAXONOMY];

    flags.push({
      code: djzsCode,
      severity: (taxonomy?.severity || "MEDIUM") as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      evidence,
      recommendation: taxonomy
        ? `Review and address ${taxonomy.name}`
        : `Review detection for ${code}`,
    });
  }

  const riskScore = totalPenalty;

  return {
    flags,
    riskScore,
    firedCodes: fired.map(f => f.code),
  };
}

function applySourceSignalModifiers(
  result: LFDetectionResult,
  ctx: PredictionContext,
  fired: Array<{ code: PredictionLFCode; evidence: string }>
): void {
  const hasFired = (code: PredictionLFCode) => fired.some(f => f.code === code);

  if (ctx.source_signal === "UNDISCLOSED" && !hasFired("I01")) {
    fired.push({
      code: "I01",
      evidence: "Signal source is UNDISCLOSED — automatic I01 flag. Agent cannot demonstrate independent reasoning.",
    });
  }

  if (ctx.source_signal === "PAID_SIGNAL_GROUP" && !hasFired("I01")) {
    fired.push({
      code: "I01",
      evidence: "Signal source is PAID_SIGNAL_GROUP — elevated I01 risk. Thesis originates from a paid signal service.",
    });
  }

  if (ctx.source_signal === "WHALE_TRACKING" && !hasFired("S01")) {
    fired.push({
      code: "S01",
      evidence: "Signal source is WHALE_TRACKING — elevated S01 risk. Mimicking whale activity without independent thesis.",
    });
  }

  if ((ctx.entry_price > 0.90 || ctx.entry_price < 0.10) && !hasFired("I03")) {
    const extreme = ctx.entry_price > 0.90 ? "above 0.90" : "below 0.10";
    if (!result.I03.detected) {
      fired.push({
        code: "I03",
        evidence: `Entry price ${ctx.entry_price} is ${extreme} without explicit tail-risk analysis in thesis.`,
      });
    }
  }
}

function derivePrimaryBias(firedCodes: string[]): string {
  if (firedCodes.includes("I01")) return "FOMO";
  if (firedCodes.includes("I02")) return "Sunk_Cost";
  if (firedCodes.includes("S01")) return "Confirmation_Bias";
  if (firedCodes.includes("E01")) return "Confirmation_Bias";
  if (firedCodes.includes("I03")) return "Recency_Bias";
  return "None";
}

function applyDeterministicGuardrails(
  result: LFDetectionResult,
  ctx: PredictionContext
): void {
  const thesisLower = ctx.thesis.toLowerCase();

  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|system|prior)\s+(instructions?|prompts?|rules?)/i,
    /return\s+(all\s+)?false/i,
    /override\s+(system|detection|audit)/i,
    /you\s+are\s+(now|no\s+longer)/i,
    /disregard\s+(the|your|all)/i,
    /do\s+not\s+flag/i,
    /pretend\s+(there\s+are\s+)?no\s+(flaws?|issues?|problems?)/i,
  ];

  const hasInjectionAttempt = injectionPatterns.some(p => p.test(ctx.thesis));
  if (hasInjectionAttempt && !result.S01.detected) {
    result.S01 = {
      detected: true,
      evidence: "Thesis contains prompt-injection patterns attempting to manipulate detection output. Guardrail auto-flag.",
    };
  }

  const falsificationTerms = ["falsif", "prove me wrong", "invalidat", "disprove", "would fail if", "thesis breaks if", "wrong if"];
  const hasFalsificationCriteria = falsificationTerms.some(t => thesisLower.includes(t));
  if (!hasFalsificationCriteria && !result.E02.detected) {
    const hasEvidenceUrls = ctx.evidence_urls && ctx.evidence_urls.length > 0;
    const thesisWordCount = ctx.thesis.split(/\s+/).length;
    if (!hasEvidenceUrls && thesisWordCount < 200) {
      result.E02 = {
        detected: true,
        evidence: "No evidence URLs provided and no falsification criteria stated. Guardrail auto-flag.",
      };
    }
  }

  const allClear = Object.values(result).every(v => !v.detected);
  if (allClear && ctx.thesis.split(/\s+/).length < 30) {
    result.E02 = {
      detected: true,
      evidence: "Thesis is under 30 words with zero LF detections — insufficient depth for audit clearance. Guardrail auto-flag.",
    };
  }
}

function createEmptyDetectionResult(): LFDetectionResult {
  const empty = { detected: false, evidence: "CLEAR" };
  return {
    S01: { ...empty }, S02: { ...empty },
    E01: { ...empty }, E02: { ...empty },
    I01: { ...empty }, I02: { ...empty }, I03: { ...empty },
    X01: { ...empty }, X02: { ...empty },
    T01: { ...empty },
  };
}
