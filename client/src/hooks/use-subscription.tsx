import { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { isAddress } from "viem";
import { CONTRACT_ADDRESS, SUBSCRIBE_ABI, wagmiConfig } from "@/lib/wagmi-config";

export function useIsSubscribed(address?: `0x${string}` | undefined) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supply, setSupply] = useState<{ total: bigint; max: bigint } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      if (!address || !isAddress(address)) {
        setSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [bal, total, max] = await Promise.all([
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: SUBSCRIBE_ABI,
            functionName: "balanceOf",
            args: [address],
          }) as Promise<bigint>,
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: SUBSCRIBE_ABI,
            functionName: "totalMinted",
          }) as Promise<bigint>,
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: SUBSCRIBE_ABI,
            functionName: "maxSupply",
          }) as Promise<bigint>,
        ]);

        if (!cancelled) {
          setSubscribed(bal > 0n);
          setSupply({ total, max });
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        if (!cancelled) {
          setSubscribed(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { subscribed, loading, supply };
}
