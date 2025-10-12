import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Disable sourcemaps to prevent eval-like behavior
    minify: 'esbuild', // Use esbuild (no eval) instead of terser
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Prevent code splitting issues
      },
    },
  },
}));
