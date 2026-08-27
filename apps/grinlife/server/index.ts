import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { routes } from "@grin/content";
import { GateStore, createApiRouter } from "@grin/api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Production server for the GrinLife front-end.
 *
 * Serves the Vite build, answers the routes the app actually has so deep links such
 * as /products/legacy resolve on a hard reload, and mounts the status API so gate
 * measurements persist server-side instead of in one person's browser.
 *
 * The same module is imported by `server/dev.ts` to run the API alone during
 * development, so everything that needs the build is conditional on the build
 * existing.
 */
export function createApp(
  dataFile: string = process.env.GRIN_DATA_FILE ?? path.resolve(__dirname, "..", "data", "gate-status.json"),
) {
  const app = express();
  const publicDir = path.resolve(__dirname, "public");
  const indexFile = path.join(publicDir, "index.html");
  const hasBuild = fs.existsSync(indexFile);

  // `__dirname` is `server/` in dev and `dist/` in production; both resolve to
  // apps/grinlife/data, so measurements survive a rebuild instead of being
  // written into the directory the build wipes.

  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));

  app.use("/api", createApiRouter(new GateStore(dataFile)));

  if (hasBuild) {
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

    // Route-aware fallback: a known route gets the shell with 200 so the client
    // renders it, anything else gets the shell with 404 so the client renders its
    // not-found page *and* crawlers see the truth.
    const known = new Set(routes.filter((route) => route !== "/404"));
    app.get("*", (req, res) => {
      const pathname = req.path.split("?")[0]!;
      res.status(known.has(pathname) ? 200 : 404).sendFile(indexFile);
    });
  } else {
    app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  }

  // Last resort. Express's default handler prints the failing path, which leaks the
  // server's directory layout, so errors are answered with a shape and nothing else.
  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const isApi = req.originalUrl.startsWith("/api");
    const message = err instanceof Error && process.env.NODE_ENV !== "production" ? err.message : undefined;
    if (isApi) {
      res.status(400).json({ error: "Bad request", ...(message ? { detail: message } : {}) });
      return;
    }
    res.status(400).type("text/plain").send("Bad request");
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
