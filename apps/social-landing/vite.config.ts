import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

/**
 * GrinSocial front-end — built from the shared spine, containing no components of its own.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@grin/ui", "@grin/content"],
  },
  server: {
    host: "0.0.0.0",
    port: 3002,
    strictPort: false,
    allowedHosts: true,
    fs: { allow: [monorepoRoot] },
  },
  preview: {
    host: "0.0.0.0",
    port: 3102,
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
