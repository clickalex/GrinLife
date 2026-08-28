import { createApp } from "./index";

/**
 * API-only server for development. Vite proxies /api here, so the browser talks
 * to one origin and nothing in the client needs to know a second port exists.
 */
const port = Number(process.env.PORT ?? 3010);

createApp().listen(port, "0.0.0.0", () => {
  console.log(`GrinLife status API on http://0.0.0.0:${port}/api`);
});
