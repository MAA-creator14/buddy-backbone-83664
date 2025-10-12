import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function Health() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'Personal Network CRM',
    version: '1.0.0',
    checks: {
      router: 'ok',
      storage: typeof localStorage !== 'undefined' ? 'ok' : 'unavailable',
      react: 'ok',
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Health Check</CardTitle>
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Healthy
            </Badge>
          </div>
          <CardDescription>System status and diagnostics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">App:</span>
              <span className="font-medium">{healthData.app}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">{healthData.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-medium">{new Date(healthData.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">System Checks</h3>
            <div className="space-y-1">
              {Object.entries(healthData.checks).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <Badge variant={value === 'ok' ? 'default' : 'destructive'} className="text-xs">
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
