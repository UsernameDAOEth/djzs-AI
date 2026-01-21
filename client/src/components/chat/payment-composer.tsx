import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsSignedIn, useEvmSmartAccounts } from "@coinbase/cdp-hooks";
import { parseEther, isAddress } from "viem";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { SendUserOperationButton } from "@/components/web3/send-user-operation-button";
import type { EvmCall } from "@coinbase/cdp-core";

const paymentFormSchema = z.object({
  to: z.string().min(1, "Address is required"),
  amount: z.string().min(1, "Amount is required"),
  token: z.enum(["ETH", "USDC"]),
  note: z.string().optional(),
});

type PaymentFormData = {
  to: string;
  amount: string;
  token: "ETH" | "USDC";
  note?: string;
};

interface PaymentComposerProps {
  onSuccess?: (txHash: string, data: { to: string; amount: string; token: string; note?: string }) => void;
}

export function PaymentComposer({ onSuccess }: PaymentComposerProps) {
  const { isSignedIn } = useIsSignedIn();
  const { evmSmartAccounts } = useEvmSmartAccounts();
  const smartAccount = evmSmartAccounts?.[0];
  const { toast } = useToast();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSendButton, setShowSendButton] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentFormData | null>(null);
  
  const chainName = import.meta.env.VITE_CDP_CHAIN || "base-sepolia";
  const network = chainName === "base" ? "base" : "base-sepolia";

  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      to: "",
      amount: "",
      token: "ETH" as const,
      note: "",
    },
  });

  const handleValidate = (data: PaymentFormData) => {
    if (!smartAccount) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!isAddress(data.to)) {
      toast({
        title: "Error",
        description: "Invalid recipient address",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error", 
        description: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    if (data.token === "USDC") {
      toast({
        title: "Coming Soon",
        description: "USDC payments will be available soon",
      });
      return;
    }

    setPendingPayment(data);
    setShowSendButton(true);
  };

  const getCalls = (): EvmCall[] => {
    if (!pendingPayment) return [];
    return [
      {
        to: pendingPayment.to as `0x${string}`,
        value: parseEther(pendingPayment.amount),
        data: "0x" as `0x${string}`,
      }
    ];
  };

  if (isSuccess && txHash) {
    const formData = form.getValues();
    setTimeout(() => {
      onSuccess?.(txHash, { to: formData.to, amount: formData.amount, token: formData.token, note: formData.note });
      form.reset();
      setIsSuccess(false);
      setTxHash(null);
      setShowSendButton(false);
      setPendingPayment(null);
    }, 1000);
    
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-green-600/50 text-center">
        <div className="w-12 h-12 rounded-full bg-green-600/30 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-white font-semibold mb-2">Payment Confirmed (gasless)</h3>
        <p className="text-gray-400 text-xs mb-2">
          TX: {txHash.slice(0, 10)}...{txHash.slice(-6)}
        </p>
        <a
          href={`https://${chainName === "base" ? "basescan.org" : "sepolia.basescan.org"}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:underline"
        >
          View on Basescan →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleValidate)} className="space-y-4">
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-400 text-xs">Recipient Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="0x..."
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    data-testid="input-payment-to"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400 text-xs">Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.1"
                      className="bg-gray-800 border-gray-700 text-white"
                      data-testid="input-payment-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400 text-xs">Token</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid="select-token">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-400 text-xs">Note (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="What's this for?"
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                    rows={2}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {showSendButton && pendingPayment && smartAccount ? (
            <SendUserOperationButton
              network={network}
              calls={getCalls()}
              onSuccess={(hash) => {
                setTxHash(hash);
                setIsSuccess(true);
                toast({
                  title: "Payment sent!",
                  description: `TX: ${hash.slice(0, 10)}... (gasless)`,
                });
              }}
              onError={(error) => {
                toast({
                  title: "Transaction Failed",
                  description: error.message || "Unknown error",
                  variant: "destructive",
                });
                setShowSendButton(false);
                setPendingPayment(null);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
              pendingLabel="Sending..."
            >
              <Send className="w-4 h-4" />
              Confirm & Send Payment (gasless)
            </SendUserOperationButton>
          ) : (
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-submit-payment"
            >
              <Send className="w-4 h-4 mr-2" />
              Prepare Payment
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
