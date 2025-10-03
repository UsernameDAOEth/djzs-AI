import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { writeContract } from "@wagmi/core";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, SUBSCRIBE_ABI, SUBSCRIBE_PRICE_ETH, wagmiConfig } from "@/lib/wagmi-config";
import { useToast } from "@/hooks/use-toast";

export function MintButton() {
  const { address, chainId } = useAccount();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { toast } = useToast();
  const price = useMemo(() => parseEther(SUBSCRIBE_PRICE_ETH as `${number}`), []);

  const isContractConfigured = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  async function handleMint() {
    if (!address || !isContractConfigured) return;

    try {
      setMinting(true);
      setTxHash(null);

      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: SUBSCRIBE_ABI,
        functionName: "mint",
        value: price,
        chainId: chainId as 8453 | 84532 | undefined,
      });

      setTxHash(hash);
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });
    } catch (error) {
      console.error("Minting error:", error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "An error occurred while minting",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleMint}
        disabled={!address || minting || !isContractConfigured}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-primary to-secondary px-6 py-3.5 font-semibold text-white shadow-lg backdrop-blur transition hover:shadow-xl hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-mint-nft"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>
          {minting ? "Minting…" : `Mint Subscribe NFT ${Number(SUBSCRIBE_PRICE_ETH) > 0 ? `• ${SUBSCRIBE_PRICE_ETH} ETH` : "• Free"}`}
        </span>
      </button>

      {txHash && (
        <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3" data-testid="text-tx-success">
          <p className="text-sm text-emerald-300">
            ✓ Transaction submitted:{" "}
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono underline hover:text-emerald-200"
              data-testid="link-tx-hash"
            >
              {txHash}
            </a>
          </p>
        </div>
      )}

      {!isContractConfigured && (
        <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4" data-testid="text-contract-warning">
          <div className="flex gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-300">Contract Not Configured</p>
              <p className="mt-1 text-sm text-amber-200/80">
                Add your deployed contract address to{" "}
                <code className="rounded bg-black/30 px-1 py-0.5 font-mono text-xs">VITE_SUBSCRIBE_NFT_ADDRESS</code>{" "}
                to enable minting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
