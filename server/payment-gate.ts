import type { AuditTier } from "@shared/audit-schema";
import { verifyUsdcPayment, type PaymentVerificationResult } from "./payment-verifier";

export type PaymentTier = AuditTier | "proxy";

export interface TierPricing {
  tier: PaymentTier;
  price: string;
  priceUsdc: number;
  memoLimit: number | null;
  label: string;
}

export const TIER_PRICING: Record<PaymentTier, TierPricing> = {
  proxy: { tier: "proxy", price: "$0.01", priceUsdc: 0.01, memoLimit: 500, label: "Proxy Zone" },
  micro: { tier: "micro", price: "$0.10", priceUsdc: 0.10, memoLimit: 1000, label: "Micro Zone" },
  founder: { tier: "founder", price: "$1.00", priceUsdc: 1.00, memoLimit: 5000, label: "Founder Zone" },
  treasury: { tier: "treasury", price: "$10.00", priceUsdc: 10.00, memoLimit: null, label: "Treasury Zone" },
};

export type PricingMode = "production" | "demo";

const PRICING_MODE: PricingMode = (process.env.DJZS_PRICING_MODE as PricingMode) || "production";

export interface PaymentVerifyRequest {
  tier: PaymentTier;
  txHash?: string;
  apiKey?: string;
  walletAddress?: string;
  treasuryWallet?: string;
}

export interface PaymentGateResult {
  verified: boolean;
  error?: string;
  from?: string;
  to?: string;
  amount?: string;
  txHash?: string;
  gateName: string;
}

export interface PaymentGate {
  readonly name: string;
  verify(req: PaymentVerifyRequest): Promise<PaymentGateResult>;
}

export class NoOpGate implements PaymentGate {
  readonly name = "NoOpGate";

  async verify(_req: PaymentVerifyRequest): Promise<PaymentGateResult> {
    return { verified: true, gateName: this.name };
  }
}

export class X402Gate implements PaymentGate {
  readonly name = "X402Gate";

  async verify(req: PaymentVerifyRequest): Promise<PaymentGateResult> {
    if (!req.txHash) {
      const pricing = TIER_PRICING[req.tier];
      return {
        verified: false,
        error: `Payment Required. Send ${pricing.price} USDC on Base Mainnet and provide TX hash.`,
        gateName: this.name,
      };
    }

    if (!req.treasuryWallet) {
      return {
        verified: false,
        error: "Payment verification not configured. TREASURY_WALLET_ADDRESS required.",
        gateName: this.name,
      };
    }

    const auditTier = req.tier === "proxy" ? "micro" : req.tier;
    const result: PaymentVerificationResult = await verifyUsdcPayment(
      req.txHash,
      auditTier,
      req.treasuryWallet
    );

    return {
      verified: result.verified,
      error: result.error,
      from: result.from,
      to: result.to,
      amount: result.amount,
      txHash: result.txHash,
      gateName: this.name,
    };
  }
}

export class CredentialedGate implements PaymentGate {
  readonly name = "CredentialedGate";
  private validKeys: Set<string>;

  constructor(validKeys: string[] = []) {
    this.validKeys = new Set(validKeys);
  }

  async verify(req: PaymentVerifyRequest): Promise<PaymentGateResult> {
    if (!req.apiKey) {
      return {
        verified: false,
        error: "API key required. Provide a valid DJZS API key in the x-api-key header.",
        gateName: this.name,
      };
    }

    if (!this.validKeys.has(req.apiKey)) {
      return {
        verified: false,
        error: "Invalid API key.",
        gateName: this.name,
      };
    }

    return { verified: true, gateName: this.name };
  }

  addKey(key: string): void {
    this.validKeys.add(key);
  }

  removeKey(key: string): void {
    this.validKeys.delete(key);
  }
}

export interface DeferredCharge {
  tier: PaymentTier;
  amount: number;
  walletAddress: string;
  auditId: string;
  timestamp: string;
}

export class DeferredGate implements PaymentGate {
  readonly name = "DeferredGate";
  private pendingCharges: DeferredCharge[] = [];

  async verify(req: PaymentVerifyRequest): Promise<PaymentGateResult> {
    if (!req.walletAddress) {
      return {
        verified: false,
        error: "Wallet address required for deferred billing.",
        gateName: this.name,
      };
    }

    return { verified: true, gateName: this.name };
  }

  recordCharge(charge: DeferredCharge): void {
    this.pendingCharges.push(charge);
  }

  getPendingCharges(): DeferredCharge[] {
    return [...this.pendingCharges];
  }

  clearCharges(): DeferredCharge[] {
    const charges = [...this.pendingCharges];
    this.pendingCharges = [];
    return charges;
  }
}

export function shouldUploadToIrys(tier: PaymentTier): boolean {
  return tier !== "proxy";
}

export function getGateForTier(tier: PaymentTier): PaymentGate {
  if (PRICING_MODE === "demo") {
    return new NoOpGate();
  }

  switch (tier) {
    case "proxy":
      return new DeferredGate();
    case "micro":
    case "founder":
    case "treasury":
      return new X402Gate();
    default:
      return new X402Gate();
  }
}

export function getPricingMode(): PricingMode {
  return PRICING_MODE;
}
