import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";

interface SuggestionsBannerProps {
  suggestionCount: number;
  onViewSuggestions: () => void;
}

export const SuggestionsBanner = ({ suggestionCount, onViewSuggestions }: SuggestionsBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (suggestionCount === 0 || isDismissed) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              New LinkedIn Interactions Detected
            </h3>
            <p className="text-sm text-muted-foreground">
              We found {suggestionCount} new interaction{suggestionCount > 1 ? 's' : ''} from your LinkedIn activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onViewSuggestions}>
            Review Suggestions
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
