import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddInteraction } from "@/hooks/useInteractions";
import { Contact } from "@/hooks/useContacts";

const interactionSchema = z.object({
  contactId: z.string().min(1, "Please select a contact"),
  type: z.enum(["call", "coffee", "message", "email", "linkedin"]),
  timestamp: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

interface DashboardInteractionFormProps {
  contacts: Contact[];
}

export const DashboardInteractionForm = ({ contacts }: DashboardInteractionFormProps) => {
  const addInteractionMutation = useAddInteraction();

  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      contactId: "",
      type: "call",
      timestamp: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  const onSubmit = (data: InteractionFormValues) => {
    addInteractionMutation.mutate(
      {
        contact_id: data.contactId,
        type: data.type,
        date: new Date(data.timestamp).toISOString(),
        notes: data.notes || null,
      },
      {
        onSuccess: () => {
          form.reset({
            contactId: "",
            type: "call",
            timestamp: new Date().toISOString().slice(0, 16),
            notes: "",
          });
        },
      }
    );
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
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                      placeholder="Add any relevant details about this interaction..."
                      className="resize-none"
                      rows={3}
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
