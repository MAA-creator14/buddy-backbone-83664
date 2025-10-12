import { useState } from "react";
import { useContactStore, InteractionSuggestion } from "@/store/contactStore";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Edit, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { EditSuggestionDialog } from "./EditSuggestionDialog";
import { toast } from "sonner";

interface SuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const interactionLabels = {
  call: "Phone Call",
  coffee: "Coffee Meeting",
  message: "Message",
  email: "Email",
  linkedin: "LinkedIn Message",
};

export const SuggestionsPanel = ({ isOpen, onClose }: SuggestionsPanelProps) => {
  const { getPendingSuggestions, acceptSuggestion, dismissSuggestion } = useContactStore();
  const [editingSuggestion, setEditingSuggestion] = useState<InteractionSuggestion | null>(null);
  
  const suggestions = getPendingSuggestions();

  const handleAccept = (suggestionId: string) => {
    acceptSuggestion(suggestionId);
    toast.success("Interaction logged successfully");
  };

  const handleDismiss = (suggestionId: string) => {
    dismissSuggestion(suggestionId);
    toast("Suggestion dismissed");
  };

  const handleEdit = (suggestion: InteractionSuggestion) => {
    setEditingSuggestion(suggestion);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              LinkedIn Interaction Suggestions
            </SheetTitle>
            <SheetDescription>
              Review and approve interactions detected from your LinkedIn activity
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {suggestions.length === 0 ? (
              <Card className="p-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No pending suggestions</p>
                  <p className="text-sm text-muted-foreground">
                    New LinkedIn interactions will appear here for review
                  </p>
                </div>
              </Card>
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {suggestion.contactName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {interactionLabels[suggestion.type]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(suggestion.timestamp, "PPp")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {suggestion.notes && (
                      <p className="text-sm text-muted-foreground">
                        {suggestion.notes}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(suggestion.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(suggestion)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(suggestion.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {editingSuggestion && (
        <EditSuggestionDialog
          suggestion={editingSuggestion}
          isOpen={!!editingSuggestion}
          onClose={() => setEditingSuggestion(null)}
        />
      )}
    </>
  );
};
