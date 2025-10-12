import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Settings, X } from "lucide-react";
import { isSafeModeEnabled, enableSafeMode, disableSafeMode, getCspViolations, clearCspViolations } from "@/lib/safeMode";

export const DiagnosticsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [violations, setViolations] = useState(getCspViolations());
  const safeMode = isSafeModeEnabled();

  const refreshViolations = () => {
    setViolations(getCspViolations());
  };

  const handleClearViolations = () => {
    clearCspViolations();
    setViolations([]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] overflow-hidden">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Diagnostics</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Debug CSP issues and app errors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
          {/* Safe Mode Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {safeMode ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium">Safe Mode</span>
              </div>
              <Badge variant={safeMode ? "default" : "secondary"}>
                {safeMode ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {safeMode
                ? "LinkedIn sync disabled for testing"
                : "All features enabled"}
            </p>
            <Button
              variant={safeMode ? "outline" : "default"}
              size="sm"
              onClick={safeMode ? disableSafeMode : enableSafeMode}
              className="w-full"
            >
              {safeMode ? "Disable Safe Mode" : "Enable Safe Mode"}
            </Button>
          </div>

          {/* CSP Violations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">CSP Violations</span>
              <Badge variant={violations.length > 0 ? "destructive" : "secondary"}>
                {violations.length}
              </Badge>
            </div>
            
            {violations.length > 0 && (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {violations.map((v, i) => (
                    <div key={i} className="text-xs p-2 bg-destructive/10 rounded border">
                      <div className="font-mono truncate">
                        <span className="font-semibold">Directive:</span> {v.violatedDirective}
                      </div>
                      <div className="font-mono truncate text-muted-foreground">
                        <span className="font-semibold">Blocked:</span> {v.blockedURI}
                      </div>
                      {v.sourceFile && (
                        <div className="font-mono truncate text-muted-foreground">
                          <span className="font-semibold">Source:</span> {v.sourceFile}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-1">
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshViolations}
                    className="flex-1"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearViolations}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}

            {violations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No CSP violations detected
              </p>
            )}
          </div>

          {/* Environment Info */}
          <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
            <div>Browser: {navigator.userAgent.split(' ').slice(-2).join(' ')}</div>
            <div>Storage: {localStorage.getItem('contact-storage') ? 'Has data' : 'Empty'}</div>
            <div>URL: {window.location.hash || '/'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
