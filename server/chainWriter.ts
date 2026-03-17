import { createPublicClient, createWalletClient, http, type Hex, type Address } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const trustScoreAbi = [
  {
    type: "function" as const,
    name: "updateScore" as const,
    inputs: [
      { name: "agent", type: "address" as const },
      { name: "riskScore", type: "uint256" as const },
      { name: "verdict", type: "string" as const },
      { name: "flags", type: "string[]" as const },
      { name: "irysTxId", type: "string" as const },
    ],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
  {
    type: "function" as const,
    name: "getLatestScore" as const,
    inputs: [
      { name: "agent", type: "address" as const },
    ],
    outputs: [
      { name: "riskScore", type: "uint256" as const },
      { name: "verdict", type: "string" as const },
      { name: "timestamp", type: "uint256" as const },
      { name: "totalAudits", type: "uint256" as const },
    ],
    stateMutability: "view" as const,
  },
  {
    type: "event" as const,
    name: "ScoreUpdated" as const,
    inputs: [
      { name: "agent", type: "address" as const, indexed: true },
      { name: "riskScore", type: "uint256" as const, indexed: false },
      { name: "verdict", type: "string" as const, indexed: false },
      { name: "flags", type: "string[]" as const, indexed: false },
      { name: "irysTxId", type: "string" as const, indexed: false },
      { name: "timestamp", type: "uint256" as const, indexed: false },
    ],
  },
] as const;

export interface ChainWriterInput {
  agentAddress: string;
  verdict: string;
  riskScore: number;
  flags: string[];
  irysTxId: string;
}

export interface ChainWriterResult {
  trust_score_tx_hash: string | null;
  trust_score_error?: string;
}

function getTrustScoreContractAddress(): Address {
  const addr = process.env.TRUST_SCORE_CONTRACT_ADDRESS;
  if (!addr) {
    throw new Error("TRUST_SCORE_CONTRACT_ADDRESS environment variable is required for on-chain trust score writes");
  }
  return addr as Address;
}

function getChainWriterWalletClient() {
  const rawKey = process.env.SETTLEMENT_PRIVATE_KEY;
  if (!rawKey) {
    throw new Error("SETTLEMENT_PRIVATE_KEY environment variable is required for chain writer transactions");
  }
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL environment variable is required for chain writer transactions");
  }
  const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(privateKey as Hex);
  return createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
}

function getChainWriterPublicClient() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    throw new Error("BASE_RPC_URL environment variable is required for on-chain trust score reads");
  }
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
}

export async function writeTrustScore(input: ChainWriterInput): Promise<ChainWriterResult> {
  try {
    const contractAddress = getTrustScoreContractAddress();
    const walletClient = getChainWriterWalletClient();

    const agentAddr = input.agentAddress as Address;
    const riskScore = BigInt(Math.min(100, Math.max(0, Math.round(input.riskScore))));
    const flagCodes = input.flags.length > 0 ? input.flags : [];

    console.log(
      `[ChainWriter] Writing trust score for agent ${agentAddr}: ` +
      `verdict=${input.verdict}, risk_score=${riskScore}, flags=[${flagCodes.join(",")}], irys=${input.irysTxId}`
    );

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: trustScoreAbi,
      functionName: "updateScore",
      args: [agentAddr, riskScore, input.verdict, flagCodes, input.irysTxId],
    });

    console.log(`[ChainWriter] Trust score tx: ${txHash}`);

    return { trust_score_tx_hash: txHash };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown chain writer error";
    console.error("[ChainWriter] Failed to write trust score:", msg);
    return {
      trust_score_tx_hash: null,
      trust_score_error: msg,
    };
  }
}

export async function readLatestTrustScore(agentAddress: string) {
  const contractAddress = getTrustScoreContractAddress();
  const client = getChainWriterPublicClient();

  const result = await client.readContract({
    address: contractAddress,
    abi: trustScoreAbi,
    functionName: "getLatestScore",
    args: [agentAddress as Address],
  });

  const [riskScore, verdict, timestamp, totalAudits] = result;

  return {
    riskScore: Number(riskScore),
    verdict,
    timestamp: Number(timestamp),
    totalAudits: Number(totalAudits),
  };
}

if (!process.env.TRUST_SCORE_CONTRACT_ADDRESS) {
  console.warn("[chainWriter] TRUST_SCORE_CONTRACT_ADDRESS not set — on-chain trust score writes will be skipped");
}
