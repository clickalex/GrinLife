import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

/**
 * Grin Legacy landing page — the second front-end built on the shared spine.
 * It imports `@grin/ui` and `@grin/content` and contains no components of its own.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@grin/ui", "@grin/content"],
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: false,
    allowedHosts: true,
    fs: { allow: [monorepoRoot] },
  },
  preview: {
    host: "0.0.0.0",
    port: 4174,
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
