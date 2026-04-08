import { createPublicClient, http, decodeEventLog, type Hex } from "viem";
import { base } from "viem/chains";
import type { AuditTier } from "@shared/audit-schema";

const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

const USDC_DECIMALS = 6;

const TIER_PRICES_USDC: Record<AuditTier, bigint> = {
  micro: 100_000n,
  founder: 1_000_000n,
  treasury: 10_000_000n,
};

const erc20TransferAbi = [
  {
    type: "event" as const,
    name: "Transfer" as const,
    inputs: [
      { name: "from", type: "address" as const, indexed: true },
      { name: "to", type: "address" as const, indexed: true },
      { name: "value", type: "uint256" as const, indexed: false },
    ],
  },
] as const;

function getBaseClient() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL environment variable is required for on-chain payment verification");
  }
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
}

function formatUsdcAmount(value: bigint): string {
  const whole = value / 1_000_000n;
  const fractional = value % 1_000_000n;
  const paddedFractional = fractional.toString().padStart(6, "0").slice(0, 2);
  return `${whole}.${paddedFractional}`;
}

export interface PaymentVerificationResult {
  verified: boolean;
  error?: string;
  from?: string;
  to?: string;
  amount?: string;
  txHash?: string;
}

export async function verifyUsdcPayment(
  txHash: string,
  tier: AuditTier,
  treasuryWallet: string
): Promise<PaymentVerificationResult> {
  const client = getBaseClient();
  const expectedAmount = TIER_PRICES_USDC[tier];
  const normalizedTreasury = treasuryWallet.toLowerCase();

  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash as Hex,
    });

    if (!receipt) {
      return { verified: false, error: "Transaction not found on Base Mainnet" };
    }

    if (receipt.status !== "success") {
      return { verified: false, error: "Transaction failed on-chain" };
    }

    const usdcLogs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()
    );

    if (usdcLogs.length === 0) {
      return { verified: false, error: "No USDC transfer found in transaction" };
    }

    for (const log of usdcLogs) {
      try {
        const decoded = decodeEventLog({
          abi: erc20TransferAbi,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName !== "Transfer") continue;

        const { from, to, value } = decoded.args;
        const toNormalized = to.toLowerCase();

        if (toNormalized === normalizedTreasury && value >= expectedAmount) {
          return {
            verified: true,
            from: from.toLowerCase(),
            to: toNormalized,
            amount: formatUsdcAmount(value),
            txHash,
          };
        }
      } catch {
        continue;
      }
    }

    const tierPrice = formatUsdcAmount(expectedAmount);
    return {
      verified: false,
      error: `No USDC transfer of $${tierPrice} to treasury wallet found in transaction`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { verified: false, error: `Failed to verify transaction: ${message}` };
  }
}
