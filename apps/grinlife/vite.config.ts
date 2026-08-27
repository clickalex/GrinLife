import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const monorepoRoot = path.resolve(import.meta.dirname, "../..");

/**
 * GrinLife front-end.
 *
 * Deliberately free of the platform plugins the original `Demo/*.zip` scaffold
 * needed (manus-runtime, jsx-loc, a debug-log collector, a storage proxy and a
 * wouter patch). Nothing here requires a hosted environment to build or run.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // `@grin/ui` and `@grin/content` resolve through npm workspaces + their `exports`
  // maps, and ship TypeScript source directly — so they are excluded from prebundling.
  optimizeDeps: {
    exclude: ["@grin/ui", "@grin/content"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
    // Accept any host so the app works behind a proxy or preview domain.
    allowedHosts: true,
    fs: {
      allow: [monorepoRoot],
    },
    // The browser only ever talks to this origin; /api is proxied to the status
    // API process so nothing in the client needs to know a second port exists.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3010",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
