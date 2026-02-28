import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const tradeFormSchema = z.object({
  asset: z.string().min(1, "Asset is required"),
  direction: z.enum(["long", "short"]),
  entry: z.string().min(1, "Entry price is required"),
  invalidation: z.string().min(1, "Invalidation is required"),
  timeframe: z.string().optional(),
  leverage: z.string().optional(),
  notes: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeFormSchema>;

interface TradeComposerProps {
  onSubmit: (data: TradeFormData & { tp: string[] }) => void;
  isSubmitting?: boolean;
}

export function TradeComposer({ onSubmit, isSubmitting }: TradeComposerProps) {
  const [tpTargets, setTpTargets] = useState<string[]>([""]);

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      asset: "",
      direction: "long",
      entry: "",
      invalidation: "",
      timeframe: "",
      leverage: "",
      notes: "",
    },
  });

  const addTpTarget = () => {
    if (tpTargets.length < 5) {
      setTpTargets([...tpTargets, ""]);
    }
  };

  const removeTpTarget = (index: number) => {
    if (tpTargets.length > 1) {
      setTpTargets(tpTargets.filter((_, i) => i !== index));
    }
  };

  const updateTpTarget = (index: number, value: string) => {
    const newTargets = [...tpTargets];
    newTargets[index] = value;
    setTpTargets(newTargets);
  };

  const handleSubmit = (data: TradeFormData) => {
    const validTpTargets = tpTargets.filter(t => t.trim() !== "");
    if (validTpTargets.length === 0) {
      return;
    }
    onSubmit({ ...data, tp: validTpTargets });
    form.reset();
    setTpTargets([""]);
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Asset</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="BTC, ETH, SOL..."
                      className="bg-muted border-border text-foreground"
                      data-testid="input-trade-asset"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Direction</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-muted border-border text-foreground" data-testid="select-direction">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="entry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Entry Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="$45,000"
                      className="bg-muted border-border text-foreground"
                      data-testid="input-entry"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invalidation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Stop Loss</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="$43,500"
                      className="bg-muted border-border text-foreground"
                      data-testid="input-invalidation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs">Take Profit Targets</span>
              {tpTargets.length < 5 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTpTarget}
                  className="h-6 text-xs text-purple-400"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add TP
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {tpTargets.map((target, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={target}
                    onChange={(e) => updateTpTarget(idx, e.target.value)}
                    placeholder={`TP${idx + 1}: $48,000`}
                    className="bg-muted border-border text-foreground"
                    data-testid={`input-tp-${idx}`}
                  />
                  {tpTargets.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTpTarget(idx)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Timeframe (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="4H, 1D..."
                      className="bg-muted border-border text-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leverage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs">Leverage (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="10x"
                      className="bg-muted border-border text-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Analysis notes..."
                    className="bg-muted border-border text-foreground resize-none"
                    rows={2}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700"
            data-testid="button-submit-trade"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Trade Signal
          </Button>
        </form>
      </Form>
    </div>
  );
}
