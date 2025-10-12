import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractionSuggestion, useContactStore } from "@/store/contactStore";
import { format } from "date-fns";
import { toast } from "sonner";

const editSchema = z.object({
  type: z.enum(["call", "coffee", "message", "email", "linkedin"]),
  timestamp: z.string(),
  notes: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditSuggestionDialogProps {
  suggestion: InteractionSuggestion;
  isOpen: boolean;
  onClose: () => void;
}

export const EditSuggestionDialog = ({ suggestion, isOpen, onClose }: EditSuggestionDialogProps) => {
  const { editSuggestion, acceptSuggestion } = useContactStore();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      type: suggestion.type,
      timestamp: format(suggestion.timestamp, "yyyy-MM-dd'T'HH:mm"),
      notes: suggestion.notes || "",
    },
  });

  const handleSubmit = (data: EditFormValues) => {
    editSuggestion(suggestion.id, {
      type: data.type,
      timestamp: new Date(data.timestamp),
      notes: data.notes,
    });
    acceptSuggestion(suggestion.id);
    toast.success("Interaction updated and logged");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Interaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      placeholder="Add any additional context..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Save & Accept
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
