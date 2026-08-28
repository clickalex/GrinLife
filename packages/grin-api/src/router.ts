import { Router, type Request, type Response } from "express";
import {
  antiDriftFromHistory,
  evaluateAll,
  gates,
  inputsForGate,
  intentLine,
  intentProgress,
  intentTarget,
  type GateStatusRecord,
  type ProductId,
} from "@grin/content";
import type { GateStore, IntentStore } from "./store";

/**
 * The Grin status API.
 *
 * Mounted by any Grin front-end's server. Deliberately small: it stores measured
 * values for the two kill gates and returns the plan's verdict, so a gate decision
 * is recorded once, server-side, instead of living in one person's browser.
 */
export function createApiRouter(store: GateStore, intent: IntentStore): Router {
  const router = Router();

  const payload = (status: GateStatusRecord) => {
    const history = store.history();
    return {
      gates: gates.map((gate) => ({
        id: gate.id,
        month: gate.month,
        question: gate.question,
        unlocks: gate.unlocks,
      })),
      status,
      verdicts: evaluateAll(status),
      // The anti-drift verdict, computed from the record rather than asserted by hand,
      // plus the raw log the timeline renders. Formatting belongs to the client.
      antiDrift: Object.fromEntries(gates.map((gate) => [gate.id, antiDriftFromHistory(history, gate.id)])),
      history,
    };
  };

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

  /** The append-only record behind the anti-drift rule. */
  router.get("/gates/history", (req: Request, res: Response) => {
    const { gateId } = req.query as { gateId?: string };
    const history = store.history();
    res.json({ history: gateId ? history.filter((entry) => entry.gateId === gateId) : history });
  });

  /**
   * A dated verdict on a gate. This is what constitutes a failure: editing a criterion
   * records a measurement, assessing the gate and finding it short records a failure.
   */
  router.post("/gates/:gateId/assess", (req: Request, res: Response) => {
    const { gateId } = req.params as { gateId?: string };
    if (!gateId || !store.knownGates().includes(gateId)) {
      res.status(404).json({ error: `Unknown gate: ${gateId}` });
      return;
    }
    const assessed = store.assess(gateId);
    res.json({ ...payload(assessed.status), assessed });
  });

  /** Published intent counts — Gate 1's 250 customers, counted instead of emailed. */
  router.get("/intent", (_req: Request, res: Response) => {
    const counts = intent.counts();
    res.json({
      target: intentTarget,
      counts,
      lines: Object.fromEntries(
        Object.entries(counts).map(([product, count]) => [product, intentLine(count)]),
      ),
      progress: Object.fromEntries(
        Object.entries(counts).map(([product, count]) => [product, intentProgress(count)]),
      ),
    });
  });

  router.post("/intent", (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const product = body.product;
    if (typeof product !== "string" || !intent.knownProducts().includes(product)) {
      res.status(400).json({ error: `product must be one of: ${intent.knownProducts().join(", ")}` });
      return;
    }
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : "site";
    if (typeof body.note === "string" && body.note.length > 200) {
      res.status(400).json({ error: "note must be 200 characters or fewer" });
      return;
    }
    // No contact details are accepted, so none can be stored: an ask is a count, a
    // product and a source. The DPDP obligation only exists once there is personal data.
    const log = intent.record(
      product as ProductId,
      source,
      typeof body.note === "string" ? body.note : undefined,
    );
    const counts = intent.counts();
    res.status(201).json({
      recorded: { product, source, at: log[log.length - 1]?.at },
      target: intentTarget,
      counts,
      lines: Object.fromEntries(Object.entries(counts).map(([id, count]) => [id, intentLine(count)])),
    });
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
