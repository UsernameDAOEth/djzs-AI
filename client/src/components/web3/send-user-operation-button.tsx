import { useState, useCallback, useEffect, ReactNode } from "react";
import { useSendUserOperation, useEvmSmartAccounts, useWaitForUserOperation } from "@coinbase/cdp-hooks";
import type { EvmCall } from "@coinbase/cdp-core";
import { Loader2 } from "lucide-react";

interface SendUserOperationButtonProps {
  network: "base" | "base-sepolia";
  calls: EvmCall[];
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function SendUserOperationButton({
  network,
  calls,
  children,
  className,
  pendingLabel = "Processing...",
  onSuccess,
  onError,
  disabled,
}: SendUserOperationButtonProps) {
  const { evmSmartAccounts } = useEvmSmartAccounts();
  const smartAccount = evmSmartAccounts?.[0];
  const { sendUserOperation } = useSendUserOperation();
  const [isPending, setIsPending] = useState(false);
  const [submittedOpHash, setSubmittedOpHash] = useState<`0x${string}` | undefined>(undefined);
  const [hasCompleted, setHasCompleted] = useState(false);

  const isWaitEnabled = !!submittedOpHash && !!smartAccount && !hasCompleted;
  
  const { status: waitStatus, data: opData, error: waitError } = useWaitForUserOperation({
    userOperationHash: submittedOpHash,
    evmSmartAccount: smartAccount?.address as `0x${string}`,
    network: network,
    enabled: isWaitEnabled,
  });

  useEffect(() => {
    console.log("[SendUserOp] waitStatus:", waitStatus, "opData:", opData, "isWaitEnabled:", isWaitEnabled);
  }, [waitStatus, opData, isWaitEnabled]);

  useEffect(() => {
    if (!isWaitEnabled) return;
    
    if (waitStatus === "success" && opData) {
      setHasCompleted(true);
      setIsPending(false);
      const txHash = (opData as any).receipts?.[0]?.transactionHash || submittedOpHash;
      console.log("[SendUserOp] Success! txHash:", txHash);
      onSuccess?.(txHash);
      setSubmittedOpHash(undefined);
    } else if (waitStatus === "error" && waitError) {
      setHasCompleted(true);
      setIsPending(false);
      console.error("[SendUserOp] Error:", waitError);
      onError?.(waitError);
      setSubmittedOpHash(undefined);
    }
  }, [waitStatus, opData, waitError, isWaitEnabled, onSuccess, onError, submittedOpHash]);

  const handleClick = useCallback(async () => {
    if (!smartAccount || isPending) return;

    setIsPending(true);
    setHasCompleted(false);
    try {
      console.log("[SendUserOp] Submitting user operation...");
      const result = await sendUserOperation({
        evmSmartAccount: smartAccount.address as `0x${string}`,
        network,
        calls,
        useCdpPaymaster: true,
      });
      console.log("[SendUserOp] Submitted! userOpHash:", result.userOperationHash);
      setSubmittedOpHash(result.userOperationHash);
    } catch (err) {
      setIsPending(false);
      console.error("[SendUserOp] Submission failed:", err);
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [smartAccount, calls, network, sendUserOperation, onError, isPending]);

  if (!smartAccount) {
    return (
      <button className={className} disabled>
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isPending}
      className={className}
      data-testid="button-send-user-operation"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
