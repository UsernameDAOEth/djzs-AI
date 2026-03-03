import crypto from "crypto";
import { 
  VeniceClient, 
  getVeniceClient,
  type AuditResult,
  type AdversarialPersona,
} from "./venice";
import type { AuditTier } from "@shared/audit-schema";
import {
  verifyTraceHash,
  computeTraceHash,
  mapToLegacyFormat,
  shouldAbort as shouldAbortResult,
  formatResultForLog,
  getAbortTriggers,
  type EscrowContext,
} from "./adversarial-audit";

export interface AuditInput {
  strategy_memo: string;
  audit_type?: "treasury" | "founder_drift" | "strategy" | "general";
  target_system?: string;
  tier?: AuditTier;
  persona?: AdversarialPersona;
  intelligence_context?: string;
  trade_params?: Record<string, unknown>;
  agent_id?: string;
  escrow_id?: number;
  escrow_context?: EscrowContext;
  execution_trace_hash?: `0x${string}`;
}

export interface ProofOfLogicCertificate extends AuditResult {
  audit_id: string;
  timestamp: string;
  tier: AuditTier;
  cryptographic_hash: string;
  keccak256_hash?: string;
  
  provenance_provider?: "IRYS_DATACHAIN";
  irys_tx_id?: string;
  irys_url?: string;
  
  should_abort?: boolean;
  abort_reasons?: string[];
}

const TIER_CONFIG: Record<AuditTier, {
  price_usd: number;
  memo_limit: number;
  default_persona: AdversarialPersona;
}> = {
  micro: {
    price_usd: 2.50,
    memo_limit: 1000,
    default_persona: "general",
  },
  founder: {
    price_usd: 5.00,
    memo_limit: 5000,
    default_persona: "logic_auditor",
  },
  treasury: {
    price_usd: 50.00,
    memo_limit: Infinity,
    default_persona: "risk_hunter",
  },
};

export async function executeAudit(
  input: AuditInput,
  client?: VeniceClient
): Promise<ProofOfLogicCertificate> {
  const veniceClient = client || getVeniceClient();
  
  const {
    strategy_memo,
    audit_type = "general",
    target_system = "Unknown",
    tier = "micro",
    persona,
    intelligence_context,
    trade_params,
    escrow_id,
    escrow_context,
    execution_trace_hash,
  } = input;

  const tierConfig = TIER_CONFIG[tier];
  if (strategy_memo.length > tierConfig.memo_limit) {
    throw new Error(
      `Strategy memo exceeds ${tier} tier limit of ${tierConfig.memo_limit} characters`
    );
  }

  const audit_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (execution_trace_hash) {
    const hashValid = verifyTraceHash(strategy_memo, execution_trace_hash);
    if (!hashValid) {
      throw new Error("Hash mismatch — strategy memo has been tampered");
    }
    console.log(`[Audit ${audit_id}] Hash verification passed`);
  }

  const selectedPersona = persona || tierConfig.default_persona;

  const cryptographic_hash = crypto
    .createHash("sha256")
    .update(strategy_memo)
    .digest("hex");

  const keccak256_hash = computeTraceHash(strategy_memo);

  const resolvedEscrowContext = escrow_context || (escrow_id ? {
    escrow_id,
    amount: 0,
    tier,
  } : undefined);

  const result = await veniceClient.audit(
    strategy_memo,
    selectedPersona,
    { tier, auditType: audit_type, targetSystem: target_system, intelligenceContext: intelligence_context, tradeParams: trade_params, escrowContext: resolvedEscrowContext }
  );

  console.log(`[Audit ${audit_id}] ${formatResultForLog(result)}`);

  const abortTriggers = getAbortTriggers(result);
  const abort = shouldAbortResult(result);
  const abortReasons = abortTriggers.map(f => `${f.code} (${f.severity}): ${f.evidence}`);

  const certificate: ProofOfLogicCertificate = {
    audit_id,
    timestamp,
    tier,
    cryptographic_hash,
    keccak256_hash,
    should_abort: abort,
    abort_reasons: abortReasons.length > 0 ? abortReasons : undefined,
    ...result,
  };

  return certificate;
}

export type MessagePrefix = "Thinking:" | "Journal:" | "Audit:" | "Risk:";

export function parseAndRoute(rawMessage: string): {
  content: string;
  persona: AdversarialPersona;
} {
  if (rawMessage.startsWith("Risk:")) {
    return {
      content: rawMessage.slice(5).trim(),
      persona: "risk_hunter",
    };
  }
  
  if (rawMessage.startsWith("Backtest:")) {
    return {
      content: rawMessage.slice(9).trim(),
      persona: "backtest_skeptic",
    };
  }
  
  if (rawMessage.startsWith("Regime:")) {
    return {
      content: rawMessage.slice(7).trim(),
      persona: "regime_detector",
    };
  }
  
  if (rawMessage.startsWith("Logic:")) {
    return {
      content: rawMessage.slice(6).trim(),
      persona: "logic_auditor",
    };
  }

  for (const prefix of ["Thinking:", "Audit:"]) {
    if (rawMessage.startsWith(prefix)) {
      return {
        content: rawMessage.slice(prefix.length).trim(),
        persona: "general",
      };
    }
  }

  return {
    content: rawMessage.trim(),
    persona: "general",
  };
}

export async function handleXMTPMessage(
  rawMessage: string,
  client?: VeniceClient
): Promise<string> {
  const { content, persona } = parseAndRoute(rawMessage);
  
  const certificate = await executeAudit({
    strategy_memo: content,
    tier: "micro",
    persona,
  }, client);

  return JSON.stringify(certificate, null, 2);
}

export function shouldAutoAbort(cert: ProofOfLogicCertificate): boolean {
  if (cert.should_abort) return true;
  return shouldAbortResult(cert);
}

export interface LegacyAuditLog {
  auditId: string;
  tier: AuditTier;
  verdict: string;
  riskScore: number;
  strategyMemo?: string;
  auditType: string;
  primaryBiasDetected: string;
  flags: { code: string; severity: string; message: string }[];
  logicFlaws: { flaw_type: string; severity: string; explanation: string }[];
  structuralRecommendations: string[];
  cryptographicHash: string;
  walletAddress?: string | null;
  irysTxId?: string | null;
}

export function mapToLegacyAuditLog(
  cert: ProofOfLogicCertificate,
  extras?: { strategyMemo?: string; auditType?: string; walletAddress?: string | null; irysTxId?: string | null }
): LegacyAuditLog {
  const legacy = mapToLegacyFormat(cert);

  return {
    auditId: cert.audit_id,
    tier: cert.tier,
    verdict: cert.verdict,
    riskScore: cert.risk_score,
    strategyMemo: extras?.strategyMemo,
    auditType: extras?.auditType || "general",
    primaryBiasDetected: cert.primary_bias_detected || legacy.primaryBiasDetected || cert.primary_flaw || "None",
    flags: cert.flags.map(f => ({ code: f.code, severity: f.severity, message: f.description || f.evidence || "" })),
    logicFlaws: (cert.logic_flaws || legacy.logicFlaws).map(f =>
      typeof f === "string" ? { flaw_type: "detected", severity: "medium", explanation: f } : f as any
    ),
    structuralRecommendations: cert.structural_recommendations || legacy.structuralRecommendations,
    cryptographicHash: cert.cryptographic_hash,
    walletAddress: extras?.walletAddress,
    irysTxId: extras?.irysTxId,
  };
}

export async function runLogicAuditAgent(
  request: { strategy_memo: string; audit_type?: string; intelligence_context?: string; trade_params?: Record<string, unknown>; agent_id?: string },
  tier: AuditTier = "micro",
  apiKeyOverride?: string
): Promise<ProofOfLogicCertificate> {
  const client = apiKeyOverride ? new VeniceClient(apiKeyOverride) : undefined;
  return executeAudit({
    strategy_memo: request.strategy_memo,
    audit_type: (request.audit_type as AuditInput["audit_type"]) || "general",
    tier,
    intelligence_context: request.intelligence_context,
    trade_params: request.trade_params,
    agent_id: request.agent_id,
  }, client);
}

export { TIER_CONFIG as AUDIT_TIER_CONFIG };
