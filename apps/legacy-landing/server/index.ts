import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Production static server for the Grin Legacy landing page.
 * Single-page site, so the fallback only has to serve index.html.
 */
const app = express();
const publicDir = path.resolve(__dirname, "public");

app.disable("x-powered-by");
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

const port = Number(process.env.PORT ?? 3001);

app.listen(port, "0.0.0.0", () => {
  console.log(`Grin Legacy serving ${publicDir} on http://0.0.0.0:${port}/`);
});
