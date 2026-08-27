/**
 * `@grin/api` — persisted gate measurement.
 *
 * The status API and its store. Kept in a package rather than inside one app so
 * any Grin front-end (or a future ops dashboard) can mount the same endpoint and
 * read the same record.
 */
export { GateStore } from "./store";
export { createApiRouter } from "./router";
