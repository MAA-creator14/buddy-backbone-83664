import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  current: number;
  minimum: number;
  maximum: number;
}

export const ProgressIndicator = ({ current, minimum, maximum }: ProgressIndicatorProps) => {
  const progress = Math.min((current / maximum) * 100, 100);
  const canProceed = current >= minimum;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {current} of {maximum} contacts added
        </span>
        {canProceed && current < maximum && (
          <span className="text-primary font-medium">
            You can proceed or add {maximum - current} more
          </span>
        )}
        {!canProceed && (
          <span className="text-muted-foreground">
            {minimum - current} more to continue
          </span>
        )}
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
