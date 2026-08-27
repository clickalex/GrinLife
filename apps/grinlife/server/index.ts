import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageDescriptionFor, pageTitleFor, portfolio, routes } from "@grin/content";
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

  /**
   * Sitemap and robots, generated from the same `routes` table the client router uses,
   * so the two cannot disagree about which pages exist. Registered before the
   * single-page fallback because they are not client routes.
   */
  const originOf = (req: express.Request) =>
    (process.env.GRIN_SITE_URL ?? `${req.protocol}://${req.get("host") ?? "localhost"}`).replace(/\/$/, "");

  app.get("/sitemap.xml", (req, res) => {
    const origin = originOf(req);
    const served = routes.filter((route) => route !== "/404");
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...served.flatMap((route) => [
        "  <url>",
        `    <loc>${origin}${route === "/" ? "/" : route}</loc>`,
        `    <priority>${route === "/" ? "1.0" : route.startsWith("/products/") ? "0.9" : "0.6"}</priority>`,
        "  </url>",
      ]),
      "</urlset>",
      "",
    ].join("\n");
    res.type("application/xml").send(body);
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: ${originOf(req)}/sitemap.xml\n`);
  });

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

    /**
     * Per-route `<head>`, injected into the shell server-side.
     *
     * `useDocumentHead` keeps the head in step in the browser, but crawlers and link
     * unfurlers do not run JavaScript, so a head set only on the client is invisible to
     * the readers it exists for: without this, every deep link unfurls with the home
     * page's title and no Open Graph data at all.
     */
    const shell = fs.readFileSync(indexFile, "utf8");
    const attr = (value: string) =>
      value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

    const renderShell = (pathname: string, origin: string, isKnown: boolean) => {
      const path = isKnown ? pathname : "/404";
      const title = pageTitleFor(path);
      const description = pageDescriptionFor(path);
      const url = `${origin}${path}`;
      const head = [
        `<meta property="og:title" content="${attr(title)}" />`,
        `<meta property="og:description" content="${attr(description)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:url" content="${attr(url)}" />`,
        `<meta property="og:site_name" content="${attr(portfolio.name)}" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<link rel="canonical" href="${attr(url)}" />`,
        // The shell is real HTML at a URL that does not exist, so keep it out of the index.
        ...(isKnown ? [] : [`<meta name="robots" content="noindex, follow" />`]),
      ];

      return shell
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${attr(title)}</title>`)
        .replace(
          /<meta\s+name="description"[\s\S]*?\/>/,
          `<meta name="description" content="${attr(description)}" />`,
        )
        .replace("</head>", `${head.map((tag) => `    ${tag}`).join("\n")}\n  </head>`);
    };

    app.get("*", (req, res) => {
      const pathname = req.path.split("?")[0]!;
      const isKnown = known.has(pathname);
      // `express.static` sets these on the files it serves, but this branch writes the
      // shell itself, so deep links would otherwise ship with none of them.
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res
        .status(isKnown ? 200 : 404)
        .type("html")
        .send(renderShell(pathname, originOf(req), isKnown));
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
