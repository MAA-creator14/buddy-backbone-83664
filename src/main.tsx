import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// CSP Violation and Error Detection
window.addEventListener('securitypolicyviolation', (e) => {
  console.error('🔒 CSP Violation Detected:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    effectiveDirective: e.effectiveDirective,
    originalPolicy: e.originalPolicy,
    sourceFile: e.sourceFile,
    lineNumber: e.lineNumber,
    columnNumber: e.columnNumber,
  });
  
  // Store violation for debugging
  try {
    const violations = JSON.parse(sessionStorage.getItem('csp-violations') || '[]');
    violations.push({
      timestamp: new Date().toISOString(),
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      sourceFile: e.sourceFile,
    });
    sessionStorage.setItem('csp-violations', JSON.stringify(violations));
  } catch (err) {
    console.error('Failed to store CSP violation:', err);
  }
});

window.addEventListener('error', (e) => {
  console.error('🚨 Global Error:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    error: e.error,
  });
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🚨 Unhandled Promise Rejection:', e.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
