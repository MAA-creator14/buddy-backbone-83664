import { Interaction } from "@/hooks/useInteractions";
import { useDeleteInteraction } from "@/hooks/useInteractions";
import { Contact } from "@/hooks/useContacts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Coffee, MessageSquare, Mail, Linkedin, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface DashboardActivityFeedProps {
  interactions: Interaction[];
  contacts: Contact[];
}

const interactionIcons = {
  call: Phone,
  coffee: Coffee,
  message: MessageSquare,
  email: Mail,
  linkedin: Linkedin,
};

const interactionLabels = {
  call: "Phone Call",
  coffee: "Coffee Meeting",
  message: "Message",
  email: "Email",
  linkedin: "LinkedIn Message",
};

export const DashboardActivityFeed = ({ interactions, contacts }: DashboardActivityFeedProps) => {
  const deleteInteractionMutation = useDeleteInteraction();

  const handleDelete = (interactionId: string, contactId: string) => {
    deleteInteractionMutation.mutate({ id: interactionId, contactId });
  };

  const getContactName = (contactId: string) => {
    return contacts.find(c => c.id === contactId)?.name || "Unknown";
  };

  // Sort interactions by date (most recent first)
  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedInteractions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No interactions logged yet. Start by logging your first interaction!
          </p>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {sortedInteractions.map((interaction) => {
              const Icon = interactionIcons[interaction.type as keyof typeof interactionIcons];
              const contactName = getContactName(interaction.contact_id);
              
              return (
                <div
                  key={interaction.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="capitalize">
                        {interactionLabels[interaction.type as keyof typeof interactionLabels]}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {contactName}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(interaction.date), "PPp")}
                    </span>
                    {interaction.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {interaction.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(interaction.id, interaction.contact_id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
