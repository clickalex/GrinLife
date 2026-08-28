/**
 * The seam the shared-spine argument rests on.
 *
 * Three packages have to agree on what a criterion *is*: `@grin/content` defines the
 * inputs, `@grin/api` validates a measurement against them, and `/gates` renders a
 * control for each. Every pair has its own tests, but nothing asserted all three at
 * once — so a criterion added to the data could be accepted by the API and never
 * appear on screen, or render an input the API refuses. This walks the full round
 * trip: define → render → measure → verdict.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { render, screen, waitFor } from "@testing-library/react";
import { evaluateAll, gates, inputsForGate, type GateStatusRecord } from "@grin/content";
import { GateStore, IntentStore, createApiRouter } from "@grin/api";
import App from "./App";

const realFetch = globalThis.fetch;
const dir = mkdtempSync(resolve(tmpdir(), "grin-seam-"));

let server: Server;
let base = "";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use(
    "/api",
    createApiRouter(
      new GateStore(resolve(dir, "gate-status.json")),
      new IntentStore(resolve(dir, "intent.json")),
    ),
  );
  server = app.listen(0);
  await new Promise<void>((done) => server.once("listening", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server?.close();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function payloadFor(status: GateStatusRecord) {
  return {
    gates: gates.map((gate) => ({
      id: gate.id,
      month: gate.month,
      question: gate.question,
      unlocks: gate.unlocks,
    })),
    status,
    verdicts: evaluateAll(status),
  };
}

/** The page talks to `/api/gates`; answer it from a fixture so the render is stable. */
function stubAppFetch(status: GateStatusRecord = {}) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/api/gates")) return json(payloadFor(status));
    if (init?.method === "PATCH") return json(payloadFor(status));
    return json(payloadFor(status));
  }) as unknown as typeof fetch;
}

async function renderGates() {
  window.history.pushState({}, "", "/gates");
  render(<App />);
  await waitFor(() => expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0));
}

const allInputs = gates.flatMap((gate) => inputsForGate(gate.id).map((input) => ({ gate, input })));

describe("the criterion seam", () => {
  it("renders a control for every criterion the content model defines", async () => {
    stubAppFetch();
    await renderGates();

    for (const { gate, input } of allInputs) {
      const note = document.getElementById(`${gate.id}-${input.n}-note`);
      expect(note, `${gate.id}/${input.n} renders no note field`).not.toBeNull();

      if (input.kind === "numeric") {
        expect(
          document.getElementById(`${gate.id}-${input.n}-value`),
          `${gate.id}/${input.n} renders no number input`,
        ).not.toBeNull();
      } else {
        const confirm = note?.closest("li")?.querySelector("button[aria-pressed]");
        expect(confirm, `${gate.id}/${input.n} renders no confirm control`).not.toBeNull();
      }
    }
  });

  it("renders no control for a criterion the content model does not define", async () => {
    stubAppFetch();
    await renderGates();

    const defined = new Set(allInputs.map(({ gate, input }) => `${gate.id}-${input.n}`));
    const rendered = [...document.querySelectorAll("[id$='-note']")].map((element) =>
      element.id.replace(/-note$/, ""),
    );
    expect(rendered.filter((id) => !defined.has(id))).toEqual([]);
    expect(rendered).toHaveLength(defined.size);
  });

  it("accepts a passing measurement for every criterion, and the verdict moves", async () => {
    // A value equal to the target satisfies both `at-least` and `at-most`.
    for (const { gate, input } of allInputs) {
      const body = input.kind === "numeric" ? { value: input.target ?? 0 } : { confirmed: true };
      const response = await realFetch(`${base}/api/gates/${gate.id}/criteria/${input.n}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      expect(response.status, `the API rejected ${gate.id}/${input.n}`).toBe(200);
    }

    const stored = (await (await realFetch(`${base}/api/gates`)).json()) as {
      status: GateStatusRecord;
    };
    const criteria = evaluateAll(stored.status).flatMap((verdict) => verdict.criteria);
    expect(criteria).toHaveLength(allInputs.length);
    for (const criterion of criteria) {
      expect(criterion.met, `${criterion.input.n} is not met after a passing measurement`).toBe(true);
    }
  });
});
