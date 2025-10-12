import { Interaction } from "@/store/contactStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Coffee, MessageSquare, Mail, Linkedin, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InteractionFeedProps {
  interactions: Interaction[];
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

export const InteractionFeed = ({ interactions }: InteractionFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {interactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No interactions logged yet. Start by logging your first interaction!
          </p>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => {
              const Icon = interactionIcons[interaction.type];
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
                        {interactionLabels[interaction.type]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(interaction.timestamp), "PPp")}
                      </span>
                      {interaction.isAutoLogged && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="gap-1">
                                <Sparkles className="h-3 w-3" />
                                Auto-logged
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Automatically detected from LinkedIn</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {interaction.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {interaction.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
