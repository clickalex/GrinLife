import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GateStore, createApiRouter } from "@grin/api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Production server for the GrinLife front-end.
 *
 * Serves the Vite build, falls back to index.html so deep links such as
 * /products/legacy resolve on a hard reload, and mounts the status API so gate
 * measurements persist server-side instead of in one person's browser.
 */
export function createApp(dataFile: string = path.resolve(__dirname, "../data/gate-status.json")) {
  const app = express();
  const publicDir = path.resolve(__dirname, "public");

  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));

  app.use("/api", createApiRouter(new GateStore(dataFile)));

  app.use(
    express.static(publicDir, {
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      },
    }),
  );

  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  return app;
}

const isMain = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (isMain) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, "0.0.0.0", () => {
    console.log(`GrinLife serving ${path.resolve(__dirname, "public")} on http://0.0.0.0:${port}/`);
  });
}
