import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  evaluateEscrowGate,
  computeTrustScore,
  computeCertificateHash,
  determineAction,
  getTrustThreshold,
  type EscrowGateInput,
  type EscrowAction,
} from "./escrowGate";
import type { ProofOfLogicCertificate } from "./audit-agent";
import type { IrysUploadResult } from "./irys";

vi.mock("./escrow-contract", () => ({
  callSettleEscrow: vi.fn(),
}));

import { callSettleEscrow } from "./escrow-contract";
const mockCallSettleEscrow = vi.mocked(callSettleEscrow);

function makeCertificate(overrides: Partial<ProofOfLogicCertificate> = {}): ProofOfLogicCertificate {
  return {
    audit_id: "test-audit-001",
    timestamp: "2026-03-12T00:00:00.000Z",
    tier: "micro",
    cryptographic_hash: "abc123",
    keccak256_hash: "0xdef456",
    verdict: "PASS",
    risk_score: 20,
    flags: [],
    primary_flaw: "None",
    summary: "Audit passed",
    model_used: "test-model",
    primary_bias_detected: "None",
    ...overrides,
  } as ProofOfLogicCertificate;
}

function makeIrysResult(overrides: Partial<IrysUploadResult> = {}): IrysUploadResult {
  return {
    irys_tx_id: "irys-tx-test-001",
    irys_url: "https://gateway.irys.xyz/irys-tx-test-001",
    ...overrides,
  };
}

describe("escrowGate unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ESCROW_TRUST_THRESHOLD;
  });

  describe("computeTrustScore", () => {
    it("converts risk_score 0 to trust_score 100", () => {
      expect(computeTrustScore(0)).toBe(100);
    });

    it("converts risk_score 100 to trust_score 0", () => {
      expect(computeTrustScore(100)).toBe(0);
    });

    it("converts risk_score 35 to trust_score 65", () => {
      expect(computeTrustScore(35)).toBe(65);
    });

    it("clamps negative values", () => {
      expect(computeTrustScore(150)).toBe(0);
    });
  });

  describe("determineAction", () => {
    it("returns RELEASE for PASS verdict with trust >= threshold", () => {
      expect(determineAction("PASS", 80, 40)).toBe("RELEASE");
    });

    it("returns LOCK for FAIL verdict regardless of trust score", () => {
      expect(determineAction("FAIL", 80, 40)).toBe("LOCK");
    });

    it("returns LOCK for PASS verdict with trust < threshold", () => {
      expect(determineAction("PASS", 30, 40)).toBe("LOCK");
    });

    it("returns RELEASE when trust equals threshold exactly", () => {
      expect(determineAction("PASS", 40, 40)).toBe("RELEASE");
    });
  });

  describe("computeCertificateHash", () => {
    it("returns consistent hash for same input", () => {
      const cert = makeCertificate();
      const hash1 = computeCertificateHash(cert);
      const hash2 = computeCertificateHash(cert);
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns different hash for different audit_id", () => {
      const cert1 = makeCertificate({ audit_id: "id-1" });
      const cert2 = makeCertificate({ audit_id: "id-2" });
      expect(computeCertificateHash(cert1)).not.toBe(computeCertificateHash(cert2));
    });
  });

  describe("getTrustThreshold", () => {
    it("returns default 40 when env var not set", () => {
      expect(getTrustThreshold()).toBe(40);
    });

    it("reads from ESCROW_TRUST_THRESHOLD env var", () => {
      process.env.ESCROW_TRUST_THRESHOLD = "60";
      expect(getTrustThreshold()).toBe(60);
    });

    it("falls back to default for invalid env var", () => {
      process.env.ESCROW_TRUST_THRESHOLD = "not-a-number";
      expect(getTrustThreshold()).toBe(40);
    });
  });
});

describe("escrowGate integration scenarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ESCROW_TRUST_THRESHOLD;
  });

  it("PASS path: low risk audit releases escrow", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xsettlement_pass_001" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 15 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-pass-001" }),
      escrowContext: { escrowId: 1, creator: "0xCreator1", recipient: "0xRecipient1" },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.settlement_tx_hash).toBe("0xsettlement_pass_001");
    expect(result.settlement_error).toBeNull();
    expect(result.gate_event.verdict).toBe("PASS");
    expect(result.gate_event.trust_score).toBe(85);
    expect(result.gate_event.action_taken).toBe("RELEASE");
    expect(result.gate_event.irys_tx_id).toBe("irys-pass-001");
    expect(result.gate_event.certificate_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(1n, true, "irys-pass-001");
  });

  it("PASS path 2: moderate risk still passes threshold", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xsettlement_pass_002" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 45 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-pass-002" }),
      escrowContext: { escrowId: 2, creator: "0xCreator2", recipient: "0xRecipient2" },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.gate_event.trust_score).toBe(55);
    expect(result.gate_event.threshold).toBe(40);
    expect(result.gate_event.action_taken).toBe("RELEASE");
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(2n, true, "irys-pass-002");
  });

  it("FAIL path: high risk audit locks escrow", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xsettlement_fail_001" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({
        verdict: "FAIL",
        risk_score: 85,
        flags: [
          { code: "DJZS-S01", severity: "CRITICAL", evidence: "Circular reasoning", recommendation: "Restructure" },
          { code: "DJZS-X01", severity: "CRITICAL", evidence: "No stop-loss", recommendation: "Add bounds" },
        ],
      }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-fail-001" }),
      escrowContext: { escrowId: 3, creator: "0xCreator3", recipient: "0xRecipient3" },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("LOCK");
    expect(result.gate_event.verdict).toBe("FAIL");
    expect(result.gate_event.trust_score).toBe(15);
    expect(result.gate_event.action_taken).toBe("LOCK");
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(3n, false, "irys-fail-001");
  });

  it("FAIL path 2: medium risk FAIL verdict locks escrow", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xsettlement_fail_002" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({
        verdict: "FAIL",
        risk_score: 60,
        flags: [
          { code: "DJZS-E01", severity: "HIGH", evidence: "Confirmation bias detected", recommendation: "Review" },
        ],
      }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-fail-002" }),
      escrowContext: { escrowId: 4, creator: "0xCreator4", recipient: "0xRecipient4" },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("LOCK");
    expect(result.gate_event.trust_score).toBe(40);
    expect(result.gate_event.action_taken).toBe("LOCK");
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(4n, false, "irys-fail-002");
  });

  it("Edge case: PASS verdict but trust below threshold locks escrow", async () => {
    process.env.ESCROW_TRUST_THRESHOLD = "70";
    mockCallSettleEscrow.mockResolvedValue("0xsettlement_edge_001" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 55 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-edge-001" }),
      escrowContext: { escrowId: 5, creator: "0xCreator5", recipient: "0xRecipient5" },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("LOCK");
    expect(result.gate_event.verdict).toBe("PASS");
    expect(result.gate_event.trust_score).toBe(45);
    expect(result.gate_event.threshold).toBe(70);
    expect(result.gate_event.action_taken).toBe("LOCK");
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(5n, false, "irys-edge-001");
  });

  it("handles Irys upload failure gracefully", async () => {
    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 10 }),
      irysResult: makeIrysResult({ irys_tx_id: null, irys_url: null, irys_error: "Upload failed" }),
      escrowContext: { escrowId: 6 },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.settlement_tx_hash).toBeNull();
    expect(result.settlement_error).toContain("Irys upload failed");
    expect(mockCallSettleEscrow).not.toHaveBeenCalled();
  });

  it("defers settlement when chain write fails", async () => {
    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 10 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-chain-fail" }),
      chainWriteResult: { trust_score_tx_hash: null, trust_score_error: "TRUST_SCORE_CONTRACT_ADDRESS not configured" },
      escrowContext: { escrowId: 9 },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.settlement_tx_hash).toBeNull();
    expect(result.settlement_error).toContain("Chain write failed");
    expect(result.settlement_error).toContain("trust score is recorded on-chain");
    expect(mockCallSettleEscrow).not.toHaveBeenCalled();
  });

  it("proceeds with settlement when chain write succeeds", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xchain_write_ok" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 10 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-chain-ok" }),
      chainWriteResult: { trust_score_tx_hash: "0xtrust_score_tx" },
      escrowContext: { escrowId: 10 },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.settlement_tx_hash).toBe("0xchain_write_ok");
    expect(result.settlement_error).toBeNull();
    expect(mockCallSettleEscrow).toHaveBeenCalledWith(10n, true, "irys-chain-ok");
  });

  it("handles settlement contract failure gracefully", async () => {
    mockCallSettleEscrow.mockRejectedValue(new Error("Contract reverted"));

    const input: EscrowGateInput = {
      audit: makeCertificate({ verdict: "PASS", risk_score: 10 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-contract-err" }),
      escrowContext: { escrowId: 7 },
    };

    const result = await evaluateEscrowGate(input);

    expect(result.action).toBe("RELEASE");
    expect(result.settlement_tx_hash).toBeNull();
    expect(result.settlement_error).toBe("Contract reverted");
    expect(result.gate_event.error).toBe("Contract reverted");
  });

  it("emits structured gate event with all required fields", async () => {
    mockCallSettleEscrow.mockResolvedValue("0xstructured_event_tx" as `0x${string}`);

    const input: EscrowGateInput = {
      audit: makeCertificate({ audit_id: "structured-test", verdict: "PASS", risk_score: 20 }),
      irysResult: makeIrysResult({ irys_tx_id: "irys-structured" }),
      escrowContext: { escrowId: 8, creator: "0xC", recipient: "0xR" },
    };

    const result = await evaluateEscrowGate(input);
    const evt = result.gate_event;

    expect(evt.event).toBe("escrow_gate_decision");
    expect(evt.escrow_id).toBe(8);
    expect(evt.verdict).toBe("PASS");
    expect(evt.trust_score).toBe(80);
    expect(evt.threshold).toBe(40);
    expect(evt.action_taken).toBe("RELEASE");
    expect(evt.tx_hash).toBe("0xstructured_event_tx");
    expect(evt.irys_tx_id).toBe("irys-structured");
    expect(evt.certificate_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(evt.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(evt.error).toBeUndefined();
  });
});
