import { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { CONTRACT_ADDRESS, SUBSCRIBE_ABI, wagmiConfig } from "@/lib/wagmi-config";

export function useSupply() {
  const [supply, setSupply] = useState<{ total: bigint; max: bigint } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSupply() {
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setError("Contract not configured");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [total, max] = await Promise.all([
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: SUBSCRIBE_ABI,
            functionName: "totalSupply",
          }),
          readContract(wagmiConfig, {
            address: CONTRACT_ADDRESS,
            abi: SUBSCRIBE_ABI,
            functionName: "maxNumberOfKeys",
          }),
        ]) as [bigint, bigint];

        if (!cancelled) {
          setSupply({ total, max });
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching supply:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch supply");
          setLoading(false);
        }
      }
    }

    fetchSupply();

    const interval = setInterval(fetchSupply, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { supply, loading, error };
}
