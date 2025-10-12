import { Button } from "@/components/ui/button";
import { isSafeModeEnabled, enableSafeMode, disableSafeMode } from "@/lib/safeMode";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function PreviewToolbar() {
  const [visible, setVisible] = useState(false);
  const [safe, setSafe] = useState(isSafeModeEnabled());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(typeof window !== 'undefined' && window.location.search.includes('__lovable_token'));
  }, [location]);

  if (!visible) return null;

  return (
    <div className="fixed top-3 right-3 z-50 flex gap-2 bg-background/80 backdrop-blur border rounded-md p-2 shadow-sm">
      <Button size="sm" variant="outline" onClick={() => navigate('/onboarding')}>Onboarding</Button>
      <Button size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
      <Button
        size="sm"
        variant={safe ? 'secondary' : 'outline'}
        onClick={() => {
          if (safe) {
            disableSafeMode();
          } else {
            enableSafeMode();
          }
        }}
      >
        {safe ? 'Safe Mode: On' : 'Safe Mode: Off'}
      </Button>
    </div>
  );
}
