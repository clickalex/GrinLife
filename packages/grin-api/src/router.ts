import { Router, type Request, type Response } from "express";
import { evaluateAll, gates, inputsForGate, type GateStatusRecord } from "@grin/content";
import type { GateStore } from "./store";

/**
 * The Grin status API.
 *
 * Mounted by any Grin front-end's server. Deliberately small: it stores measured
 * values for the two kill gates and returns the plan's verdict, so a gate decision
 * is recorded once, server-side, instead of living in one person's browser.
 */
export function createApiRouter(store: GateStore): Router {
  const router = Router();

  const payload = (status: GateStatusRecord) => ({
    gates: gates.map((gate) => ({
      id: gate.id,
      month: gate.month,
      question: gate.question,
      unlocks: gate.unlocks,
    })),
    status,
    verdicts: evaluateAll(status),
  });

  router.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true, service: "grin-status", gates: store.knownGates().length });
  });

  router.get("/gates", (_req: Request, res: Response) => {
    res.json(payload(store.read()));
  });

  router.patch("/gates/:gateId/criteria/:n", (req: Request, res: Response) => {
    const { gateId, n } = req.params as { gateId?: string; n?: string };

    if (!gateId || !store.knownGates().includes(gateId)) {
      res.status(404).json({ error: `Unknown gate: ${gateId}` });
      return;
    }
    const input = inputsForGate(gateId).find((candidate) => candidate.n === n);
    if (!input) {
      res.status(404).json({ error: `Unknown criterion ${n} on ${gateId}` });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if ("value" in body) {
      if (input.kind !== "numeric") {
        res.status(400).json({ error: `Criterion ${gateId}/${n} is boolean; send { confirmed }` });
        return;
      }
      if (body.value === null) patch.value = undefined;
      else if (typeof body.value !== "number" || !Number.isFinite(body.value)) {
        res.status(400).json({ error: `value must be a finite number for ${input.label}` });
        return;
      } else patch.value = body.value;
    }

    if ("confirmed" in body) {
      if (input.kind !== "boolean") {
        res.status(400).json({ error: `Criterion ${gateId}/${n} is numeric; send { value }` });
        return;
      }
      if (typeof body.confirmed !== "boolean") {
        res.status(400).json({ error: "confirmed must be a boolean" });
        return;
      }
      patch.confirmed = body.confirmed;
    }

    if ("note" in body) {
      if (typeof body.note !== "string" || body.note.length > 500) {
        res.status(400).json({ error: "note must be a string of 500 characters or fewer" });
        return;
      }
      patch.note = body.note;
    }

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Send at least one of: value, confirmed, note" });
      return;
    }

    const status = store.update(gateId, input.n, patch);
    res.json(payload(status));
  });

  router.post("/gates/:gateId/reset", (req: Request, res: Response) => {
    const { gateId } = req.params as { gateId?: string };
    if (!gateId || !store.knownGates().includes(gateId)) {
      res.status(404).json({ error: `Unknown gate: ${gateId}` });
      return;
    }
    res.json(payload(store.reset(gateId)));
  });

  router.post("/gates/reset", (_req: Request, res: Response) => {
    res.json(payload(store.reset()));
  });

  /**
   * Anything under /api that is not one of the routes above is a 404 *in JSON*.
   *
   * Without this the request falls through to the host app's single-page fallback,
   * which answers an API call with HTML — and, when the build is absent, with
   * Express's default error page, which prints an absolute server path.
   */
  router.use((req: Request, res: Response) => {
    res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
  });

  return router;
}
