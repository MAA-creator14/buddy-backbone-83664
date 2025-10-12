import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddInteraction } from "@/hooks/useInteractions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const interactionSchema = z.object({
  type: z.enum(["call", "coffee", "message", "email", "linkedin"]),
  timestamp: z.string(),
  notes: z.string().optional(),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  contactId: string;
}

export const InteractionForm = ({ contactId }: InteractionFormProps) => {
  const addInteractionMutation = useAddInteraction();

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: "call",
      timestamp: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  const onSubmit = (data: InteractionFormValues) => {
    addInteractionMutation.mutate({
      contact_id: contactId,
      type: data.type,
      date: new Date(data.timestamp).toISOString(),
      notes: data.notes || undefined,
    });

    form.reset({
      type: "call",
      timestamp: new Date().toISOString().slice(0, 16),
      notes: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Interaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="coffee">Coffee Meeting</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this interaction..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={addInteractionMutation.isPending}>
              {addInteractionMutation.isPending ? "Logging..." : "Log Interaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
