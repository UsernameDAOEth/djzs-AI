import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import { Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

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
  const { address } = useAccount();
  const { toast } = useToast();
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const form = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      to: "",
      amount: "",
      token: "ETH" as const,
      note: "",
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    if (!address) {
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

    try {
      if (data.token === "ETH") {
        sendTransaction({
          to: data.to as `0x${string}`,
          value: parseEther(data.amount),
        });
      } else {
        toast({
          title: "Coming Soon",
          description: "USDC payments will be available soon",
        });
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (isSuccess && txHash) {
    const formData = form.getValues();
    setTimeout(() => {
      onSuccess?.(txHash, { to: formData.to, amount: formData.amount, token: formData.token, note: formData.note });
      form.reset();
    }, 1000);
    
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-green-600/50 text-center">
        <div className="w-12 h-12 rounded-full bg-green-600/30 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-white font-semibold mb-2">Payment Sent!</h3>
        <a
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:underline"
        >
          View transaction →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

          <Button
            type="submit"
            disabled={isSending || isConfirming}
            className="w-full bg-green-600 hover:bg-green-700"
            data-testid="button-submit-payment"
          >
            {isSending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSending ? "Confirm in Wallet..." : "Confirming..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Payment
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
