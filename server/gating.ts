import { createPublicClient, http, isAddress } from "viem";
import { base, baseSepolia } from "viem/chains";

const SUBSCRIBE_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const contractAddress = process.env.VITE_SUBSCRIBE_NFT_ADDRESS as `0x${string}`;
const useMainnet = process.env.NODE_ENV === "production";
const chain = useMainnet ? base : baseSepolia;

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

/**
 * Check if an address owns a Subscribe NFT (server-side verification)
 * @param address - Ethereum address to check
 * @returns true if the address owns at least one Subscribe NFT
 */
export async function requirePass(address: string): Promise<boolean> {
  if (!address || !isAddress(address)) {
    return false;
  }

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    console.warn("Subscribe NFT contract not configured");
    return false;
  }

  try {
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi: SUBSCRIBE_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });

    return balance > 0n;
  } catch (error) {
    console.error("Error checking NFT balance:", error);
    return false;
  }
}

/**
 * Express middleware to require Subscribe NFT ownership
 * Expects { address: string } in request body
 */
export function requireSubscribeNFT(req: any, res: any, next: any) {
  const { address } = req.body || {};
  
  requirePass(address).then((hasPass) => {
    if (!hasPass) {
      return res.status(403).json({ 
        error: "pass_required", 
        message: "Subscribe NFT required to access this endpoint" 
      });
    }
    next();
  }).catch((error) => {
    console.error("Gating middleware error:", error);
    res.status(500).json({ error: "Failed to verify subscription" });
  });
}
