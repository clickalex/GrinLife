import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Production static server for the GrinSocial front-end. */
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

const port = Number(process.env.PORT ?? 3002);

app.listen(port, "0.0.0.0", () => {
  console.log(`GrinSocial serving ${publicDir} on http://0.0.0.0:${port}/`);
});
