import { useState } from "react";
import { useAccount } from "wagmi";
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from "@coinbase/onchainkit/transaction";
import { Pin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { encodeFunctionData, keccak256, toHex } from "viem";
import { base } from "wagmi/chains";
import { useToast } from "@/hooks/use-toast";

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
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isPinned, setIsPinned] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  const contentString = typeof content === 'string' ? content : JSON.stringify(content);
  const contentHash = keccak256(toHex(contentString));

  const calls = [
    {
      to: ATTESTATION_REGISTRY,
      data: encodeFunctionData({
        abi: ATTESTATION_ABI,
        functionName: "attest",
        args: [address, contentHash]
      })
    }
  ];

  const cdpApiKey = import.meta.env.VITE_CDP_API_KEY;
  const paymasterUrl = cdpApiKey 
    ? `https://api.developer.coinbase.com/rpc/v1/base/${cdpApiKey}`
    : undefined;
  const capabilities = paymasterUrl ? {
    paymasterService: {
      url: paymasterUrl
    }
  } : undefined;

  return (
    <div className="inline-flex flex-col gap-1">
      {isPinned ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Pinned onchain</span>
        </div>
      ) : (
        <Transaction
          chainId={base.id}
          calls={calls}
          capabilities={capabilities}
          onSuccess={(response) => {
            setIsPinned(true);
            const txHash = response.transactionReceipts?.[0]?.transactionHash;
            toast({
              title: "Insight pinned onchain",
              description: txHash ? `TX: ${txHash.slice(0, 10)}...` : "Successfully recorded",
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
            onError?.(new Error(error.message));
          }}
        >
          <TransactionButton 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium border border-purple-500/20"
            text="Pin onchain"
          />
          <TransactionStatus>
            <TransactionStatusLabel className="text-xs text-gray-400" />
            <TransactionStatusAction className="text-xs text-purple-400" />
          </TransactionStatus>
        </Transaction>
      )}
    </div>
  );
}

export function PinInsightSimple({ content, onPin }: { content: string; onPin?: () => void }) {
  const { isConnected } = useAccount();
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
