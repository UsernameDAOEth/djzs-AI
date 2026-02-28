import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  startsAt: z.string().min(1, "Start time is required"),
  locationOrLink: z.string().optional(),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventComposerProps {
  onSubmit: (data: EventFormData) => void;
  isSubmitting?: boolean;
}

export function EventComposer({ onSubmit, isSubmitting }: EventComposerProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      startsAt: "",
      locationOrLink: "",
      description: "",
    },
  });

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
    form.reset();
  };

  const now = new Date().toISOString().slice(0, 16);

  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Event Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Weekly Trading Call"
                    className="bg-muted border-border text-foreground"
                    data-testid="input-event-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Date & Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="datetime-local"
                      min={now}
                      className="bg-muted border-border text-foreground pl-10"
                      data-testid="input-event-starts"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationOrLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Location or Link</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="https://meet.google.com/... or NYC"
                      className="bg-muted border-border text-foreground pl-10"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="What will we cover..."
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
            data-testid="button-submit-event"
          >
            <Send className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </form>
      </Form>
    </div>
  );
}
