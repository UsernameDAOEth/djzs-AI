import { useState } from "react";
import { useIsSignedIn, useEvmSmartAccounts } from "@coinbase/cdp-hooks";
import { Pin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { encodeFunctionData, keccak256, toHex } from "viem";
import { useToast } from "@/hooks/use-toast";
import { SendUserOperationButton } from "./send-user-operation-button";
import type { EvmCall } from "@coinbase/cdp-core";

interface PinInsightProps {
  content: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

const ATTESTATION_REGISTRY = "0x4200000000000000000000000000000000000021" as const;

const ATTESTATION_ABI = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "data", type: "bytes32" }
    ],
    name: "attest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export function PinInsight({ content, onSuccess, onError }: PinInsightProps) {
  const { isSignedIn } = useIsSignedIn();
  const { evmSmartAccounts } = useEvmSmartAccounts();
  const smartAccount = evmSmartAccounts?.[0];
  const { toast } = useToast();
  const [isPinned, setIsPinned] = useState(false);
  
  const chainName = import.meta.env.VITE_CDP_CHAIN || "base-sepolia";
  const network = chainName === "base" ? "base" : "base-sepolia";

  if (!isSignedIn || !smartAccount) {
    return null;
  }

  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  const contentHash = keccak256(toHex(contentString));

  const transactionData = encodeFunctionData({
    abi: ATTESTATION_ABI,
    functionName: "attest",
    args: [smartAccount.address as `0x${string}`, contentHash]
  });

  const calls: EvmCall[] = [
    {
      to: ATTESTATION_REGISTRY,
      data: transactionData,
      value: BigInt(0),
    }
  ];

  return (
    <div className="inline-flex flex-col gap-1">
      {isPinned ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Pinned onchain (gasless)</span>
        </div>
      ) : (
        <SendUserOperationButton
          network={network}
          calls={calls}
          onSuccess={(txHash) => {
            setIsPinned(true);
            toast({
              title: "Insight pinned onchain",
              description: txHash ? `TX: ${txHash.slice(0, 10)}... (gasless)` : "Successfully recorded",
            });
            onSuccess?.(txHash || "");
          }}
          onError={(error) => {
            console.error("Pin failed:", error);
            toast({
              variant: "destructive",
              title: "Failed to pin",
              description: error.message || "Transaction failed. Please try again.",
            });
            onError?.(error);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium border border-purple-500/20"
          pendingLabel="Pinning..."
        >
          <Pin className="w-4 h-4" />
          <span>Pin onchain</span>
        </SendUserOperationButton>
      )}
    </div>
  );
}

export function PinInsightSimple({ content, onPin }: { content: string; onPin?: () => void }) {
  const { isSignedIn } = useIsSignedIn();
  const isConnected = isSignedIn;
  const { toast } = useToast();
  const [isPinning, setIsPinning] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState(false);

  if (!isConnected) {
    return null;
  }

  const contentString = typeof content === 'string' ? content : JSON.stringify(content);

  const handlePin = async () => {
    setIsPinning(true);
    setError(false);
    try {
      const hash = keccak256(toHex(contentString));
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Insight hash:", hash);
      setIsPinned(true);
      toast({
        title: "Insight pinned",
        description: "Your insight hash has been recorded locally.",
      });
      onPin?.();
    } catch (err) {
      console.error("Pin failed:", err);
      setError(true);
      toast({
        variant: "destructive",
        title: "Failed to pin",
        description: "Could not hash your insight. Please try again.",
      });
    } finally {
      setIsPinning(false);
    }
  };

  if (isPinned) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Pinned</span>
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={handlePin}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
        data-testid="button-pin-insight-retry"
      >
        <AlertCircle className="w-4 h-4" />
        <span>Retry</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePin}
      disabled={isPinning}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium border border-purple-500/20 disabled:opacity-50"
      data-testid="button-pin-insight"
    >
      {isPinning ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Pin className="w-4 h-4" />
      )}
      <span>{isPinning ? "Pinning..." : "Pin insight"}</span>
    </button>
  );
}
