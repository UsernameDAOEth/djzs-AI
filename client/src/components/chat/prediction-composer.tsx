import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const predictionFormSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters"),
  endsAt: z.string().min(1, "End date is required"),
  notes: z.string().optional(),
});

type PredictionFormData = z.infer<typeof predictionFormSchema>;

interface PredictionComposerProps {
  onSubmit: (data: PredictionFormData) => void;
  isSubmitting?: boolean;
}

export function PredictionComposer({ onSubmit, isSubmitting }: PredictionComposerProps) {
  const form = useForm<PredictionFormData>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      question: "",
      endsAt: "",
      notes: "",
    },
  });

  const handleSubmit = (data: PredictionFormData) => {
    onSubmit(data);
    form.reset();
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Prediction Question</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Will BTC hit $100k by end of Q1 2025?"
                    className="bg-muted border-border text-foreground resize-none"
                    rows={2}
                    data-testid="input-prediction-question"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Voting Ends</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="datetime-local"
                      min={minDate}
                      className="bg-muted border-border text-foreground pl-10"
                      data-testid="input-prediction-ends"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Context (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Additional context or criteria..."
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
            className="w-full bg-blue-600 hover:bg-blue-700"
            data-testid="button-submit-prediction"
          >
            <Send className="w-4 h-4 mr-2" />
            Create Prediction
          </Button>
        </form>
      </Form>
    </div>
  );
}
