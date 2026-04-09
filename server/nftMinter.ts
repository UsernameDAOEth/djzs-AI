/**
 * NFT Minter — stores full ProofOfLogic certificate data on-chain.
 *
 * Founder/Treasury: auto-mint server-side (treasury pays gas).
 * Micro: mint via POST /api/audit/mint-nft (server relays, treasury pays gas).
 *
 * Requires: NFT_CONTRACT_ADDRESS, SETTLEMENT_PRIVATE_KEY, BASE_RPC_URL
 */

import { createPublicClient, createWalletClient, http, type Hex, type Address } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// ─── ABI ─────────────────────────────────────────────────────────────

export const proofOfLogicNftAbi = [
  {
    type: "function" as const,
    name: "mint" as const,
    inputs: [
      { name: "recipient", type: "address" as const },
      { name: "auditId", type: "string" as const },
      { name: "timestamp", type: "string" as const },
      { name: "tier", type: "string" as const },
      { name: "riskScore", type: "uint256" as const },
      { name: "verdict", type: "string" as const },
      { name: "flagsJson", type: "string" as const },
      { name: "cryptographicHash", type: "string" as const },
      { name: "irysTxId", type: "string" as const },
      { name: "irysUrl", type: "string" as const },
      { name: "certificateJson", type: "string" as const },
    ],
    outputs: [{ name: "tokenId", type: "uint256" as const }],
    stateMutability: "nonpayable" as const,
  },
  {
    type: "function" as const,
    name: "getTokenByIrys" as const,
    inputs: [{ name: "irysTxId", type: "string" as const }],
    outputs: [{ name: "", type: "uint256" as const }],
    stateMutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "getRawCertificate" as const,
    inputs: [{ name: "tokenId", type: "uint256" as const }],
    outputs: [{ name: "", type: "string" as const }],
    stateMutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "totalMinted" as const,
    inputs: [],
    outputs: [{ name: "", type: "uint256" as const }],
    stateMutability: "view" as const,
  },
  {
    type: "event" as const,
    name: "ProofMinted" as const,
    inputs: [
      { name: "tokenId", type: "uint256" as const, indexed: true },
      { name: "recipient", type: "address" as const, indexed: true },
      { name: "auditId", type: "string" as const, indexed: false },
      { name: "irysTxId", type: "string" as const, indexed: false },
      { name: "tier", type: "string" as const, indexed: false },
      { name: "riskScore", type: "uint256" as const, indexed: false },
    ],
  },
] as const;

// ─── Types ───────────────────────────────────────────────────────────

export interface NftMintInput {
  recipient: string;
  auditId: string;
  timestamp: string;
  tier: string;
  riskScore: number;
  verdict: string;
  flags: string[];
  cryptographicHash: string;
  irysTxId: string;
  irysUrl: string;
  certificateJson: string; // Full raw certificate JSON
}

export interface NftMintResult {
  nft_tx_hash: string | null;
  nft_token_id: number | null;
  nft_error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getNftContractAddress(): Address {
  const addr = process.env.NFT_CONTRACT_ADDRESS;
  if (!addr) throw new Error("NFT_CONTRACT_ADDRESS not set");
  return addr as Address;
}

function getNftWalletClient() {
  const rawKey = process.env.SETTLEMENT_PRIVATE_KEY;
  if (!rawKey) throw new Error("SETTLEMENT_PRIVATE_KEY not set");
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) throw new Error("BASE_RPC_URL not set");
  const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(privateKey as Hex);
  return createWalletClient({ account, chain: base, transport: http(rpcUrl) });
}

function getNftPublicClient() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) throw new Error("BASE_RPC_URL not set");
  return createPublicClient({ chain: base, transport: http(rpcUrl) });
}

// ─── Server-Side Mint ────────────────────────────────────────────────

/**
 * Mint a ProofOfLogic NFT with the full certificate stored on-chain.
 * Used for Founder/Treasury (auto) and Micro (via /api/audit/mint-nft).
 */
export async function mintProofOfLogicNft(input: NftMintInput): Promise<NftMintResult> {
  try {
    const contractAddress = getNftContractAddress();
    const walletClient = getNftWalletClient();

    const recipient = input.recipient as Address;
    const riskScore = BigInt(Math.min(100, Math.max(0, Math.round(input.riskScore))));
    const flagsJson = JSON.stringify(input.flags);

    console.log(
      `[NftMinter] Minting ProofOfLogic NFT for ${recipient}: ` +
      `audit=${input.auditId}, irys=${input.irysTxId}, tier=${input.tier}, ` +
      `risk=${riskScore}, certSize=${input.certificateJson.length}bytes`
    );

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: proofOfLogicNftAbi,
      functionName: "mint",
      args: [
        recipient,
        input.auditId,
        input.timestamp,
        input.tier,
        riskScore,
        input.verdict,
        flagsJson,
        input.cryptographicHash,
        input.irysTxId,
        input.irysUrl,
        input.certificateJson,
      ],
    });

    console.log(`[NftMinter] ProofOfLogic NFT tx: ${txHash}`);

    let tokenId: number | null = null;
    try {
      const publicClient = getNftPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
          try {
            const { decodeEventLog } = await import("viem");
            const decoded = decodeEventLog({
              abi: proofOfLogicNftAbi,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "ProofMinted" && decoded.args && "tokenId" in decoded.args) {
              tokenId = Number(decoded.args.tokenId);
              break;
            }
          } catch (_) {}
        }
      }
      if (tokenId === null) {
        tokenId = await getTokenByIrys(input.irysTxId) || null;
      }
    } catch (logError) {
      console.warn("[NftMinter] Could not parse tokenId from receipt:", logError);
    }

    return { nft_tx_hash: txHash, nft_token_id: tokenId };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown NFT mint error";
    console.error("[NftMinter] Failed:", msg);
    return { nft_tx_hash: null, nft_token_id: null, nft_error: msg };
  }
}

// ─── Read Helpers ────────────────────────────────────────────────────

export async function getTokenByIrys(irysTxId: string): Promise<number> {
  const client = getNftPublicClient();
  const tokenId = await client.readContract({
    address: getNftContractAddress(),
    abi: proofOfLogicNftAbi,
    functionName: "getTokenByIrys",
    args: [irysTxId],
  });
  return Number(tokenId);
}

export async function getRawCertificate(tokenId: number): Promise<string> {
  const client = getNftPublicClient();
  const cert = await client.readContract({
    address: getNftContractAddress(),
    abi: proofOfLogicNftAbi,
    functionName: "getRawCertificate",
    args: [BigInt(tokenId)],
  });
  return cert as string;
}

export async function getTotalMinted(): Promise<number> {
  const client = getNftPublicClient();
  const total = await client.readContract({
    address: getNftContractAddress(),
    abi: proofOfLogicNftAbi,
    functionName: "totalMinted",
    args: [],
  });
  return Number(total);
}

// ─── Build full certificate JSON for mint ────────────────────────────

/**
 * Constructs the NftMintInput from an audit result + Irys result.
 * Call this in routes.ts to prepare the mint payload.
 */
export function buildNftMintInput(
  audit: {
    audit_id: string;
    timestamp: string;
    verdict: string;
    risk_score: number;
    flags: Array<{ code: string; severity?: string; message?: string }>;
    cryptographic_hash: string;
    [key: string]: any;
  },
  irys: { irys_tx_id: string; irys_url: string },
  tier: string,
  recipient: string
): NftMintInput {
  // Build the full certificate JSON that gets stored on-chain
  const certificateJson = JSON.stringify({
    audit_id: audit.audit_id,
    timestamp: audit.timestamp,
    tier,
    verdict: audit.verdict,
    risk_score: audit.risk_score,
    flags: audit.flags,
    cryptographic_hash: audit.cryptographic_hash,
    provenance_provider: "IRYS_DATACHAIN",
    irys_tx_id: irys.irys_tx_id,
    irys_url: irys.irys_url,
    ...(audit.logic_flaws && { logic_flaws: audit.logic_flaws }),
    ...(audit.structural_recommendations && { structural_recommendations: audit.structural_recommendations }),
    ...(audit.primary_bias_detected && { primary_bias_detected: audit.primary_bias_detected }),
  });

  return {
    recipient,
    auditId: audit.audit_id,
    timestamp: audit.timestamp,
    tier,
    riskScore: audit.risk_score,
    verdict: audit.verdict,
    flags: audit.flags.map((f: any) => f.code || "").filter(Boolean),
    cryptographicHash: audit.cryptographic_hash,
    irysTxId: irys.irys_tx_id,
    irysUrl: irys.irys_url,
    certificateJson,
  };
}

// ─── Startup ─────────────────────────────────────────────────────────

if (!process.env.NFT_CONTRACT_ADDRESS) {
  console.warn("[NftMinter] NFT_CONTRACT_ADDRESS not set — ProofOfLogic NFT minting will be skipped");
}
