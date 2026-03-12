import crypto from "crypto";
import type { Hex } from "viem";
import { callSettleEscrow } from "./escrow-contract";
import type { ProofOfLogicCertificate } from "./audit-agent";
import type { IrysUploadResult } from "./irys";
import type { ChainWriterResult } from "./chainWriter";

const DEFAULT_TRUST_THRESHOLD = 40;

export interface EscrowGateContext {
  escrowId: number;
  creator?: string;
  recipient?: string;
  amount?: bigint | number;
}

export interface EscrowGateInput {
  audit: ProofOfLogicCertificate;
  irysResult: IrysUploadResult;
  chainWriteResult?: ChainWriterResult;
  escrowContext: EscrowGateContext;
}

export type EscrowAction = "RELEASE" | "LOCK";

export interface EscrowGateEvent {
  event: "escrow_gate_decision";
  escrow_id: number;
  verdict: "PASS" | "FAIL";
  trust_score: number;
  threshold: number;
  action_taken: EscrowAction;
  tx_hash: string | null;
  irys_tx_id: string | null;
  certificate_hash: string;
  timestamp: string;
  error?: string;
}

export interface EscrowGateResult {
  action: EscrowAction;
  settlement_tx_hash: string | null;
  settlement_error: string | null;
  gate_event: EscrowGateEvent;
}

function getTrustThreshold(): number {
  const envVal = process.env.ESCROW_TRUST_THRESHOLD;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      return parsed;
    }
    console.warn(`[escrowGate] Invalid ESCROW_TRUST_THRESHOLD="${envVal}", using default ${DEFAULT_TRUST_THRESHOLD}`);
  }
  return DEFAULT_TRUST_THRESHOLD;
}

function computeTrustScore(riskScore: number): number {
  return Math.max(0, Math.min(100, 100 - riskScore));
}

function computeCertificateHash(audit: ProofOfLogicCertificate): string {
  const payload = JSON.stringify({
    audit_id: audit.audit_id,
    verdict: audit.verdict,
    risk_score: audit.risk_score,
    cryptographic_hash: audit.cryptographic_hash,
    keccak256_hash: audit.keccak256_hash,
    timestamp: audit.timestamp,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function determineAction(verdict: string, trustScore: number, threshold: number): EscrowAction {
  if (verdict === "PASS" && trustScore >= threshold) {
    return "RELEASE";
  }
  return "LOCK";
}

export async function evaluateEscrowGate(input: EscrowGateInput): Promise<EscrowGateResult> {
  const { audit, irysResult, chainWriteResult, escrowContext } = input;
  const threshold = getTrustThreshold();
  const trustScore = computeTrustScore(audit.risk_score);
  const certificateHash = computeCertificateHash(audit);
  const action = determineAction(audit.verdict, trustScore, threshold);
  const timestamp = new Date().toISOString();

  let settlementTxHash: string | null = null;
  let settlementError: string | null = null;

  if (!irysResult.irys_tx_id) {
    settlementError = "Irys upload failed — settlement deferred until certificate is permanently stored";
    console.warn(`[escrowGate] Escrow ${escrowContext.escrowId}: ${settlementError}`);
  } else if (chainWriteResult && !chainWriteResult.trust_score_tx_hash && chainWriteResult.trust_score_error) {
    settlementError = `Chain write failed — settlement deferred until trust score is recorded on-chain: ${chainWriteResult.trust_score_error}`;
    console.warn(`[escrowGate] Escrow ${escrowContext.escrowId}: ${settlementError}`);
  } else {
    try {
      const escrowIdBigInt = BigInt(escrowContext.escrowId);
      const passed = action === "RELEASE";
      console.log(`[escrowGate] Escrow ${escrowContext.escrowId}: action=${action} passed=${passed} trustScore=${trustScore} threshold=${threshold} irisTxId=${irysResult.irys_tx_id}`);
      const txHash = await callSettleEscrow(escrowIdBigInt, passed, irysResult.irys_tx_id);
      settlementTxHash = txHash;
      console.log(`[escrowGate] Escrow ${escrowContext.escrowId}: settlement tx=${txHash}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      settlementError = msg;
      console.error(`[escrowGate] Escrow ${escrowContext.escrowId}: settlement failed: ${msg}`);
    }
  }

  const gateEvent: EscrowGateEvent = {
    event: "escrow_gate_decision",
    escrow_id: escrowContext.escrowId,
    verdict: audit.verdict as "PASS" | "FAIL",
    trust_score: trustScore,
    threshold,
    action_taken: action,
    tx_hash: settlementTxHash,
    irys_tx_id: irysResult.irys_tx_id,
    certificate_hash: certificateHash,
    timestamp,
    ...(settlementError && { error: settlementError }),
  };

  console.log(JSON.stringify(gateEvent));

  return {
    action,
    settlement_tx_hash: settlementTxHash,
    settlement_error: settlementError,
    gate_event: gateEvent,
  };
}

export { computeTrustScore, computeCertificateHash, determineAction, getTrustThreshold };
