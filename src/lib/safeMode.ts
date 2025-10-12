/**
 * Safe Mode Utility
 * When enabled, disables all LinkedIn sync features to isolate CSP issues
 */

export function isSafeModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const safeModeParam = urlParams.get('safe');
  const safeModeStorage = sessionStorage.getItem('safe-mode');
  
  return safeModeParam === '1' || safeModeStorage === 'true';
}

export function enableSafeMode(): void {
  sessionStorage.setItem('safe-mode', 'true');
  window.location.reload();
}

export function disableSafeMode(): void {
  sessionStorage.removeItem('safe-mode');
  window.location.reload();
}

export function getCspViolations(): Array<{
  timestamp: string;
  blockedURI: string;
  violatedDirective: string;
  sourceFile?: string;
}> {
  try {
    const violations = sessionStorage.getItem('csp-violations');
    return violations ? JSON.parse(violations) : [];
  } catch {
    return [];
  }
}

export function clearCspViolations(): void {
  sessionStorage.removeItem('csp-violations');
}
