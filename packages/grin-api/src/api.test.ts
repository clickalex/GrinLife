/**
 * Status API tests — store behaviour and real HTTP round-trips.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { GateStore, IntentStore } from "./store";
import { createApiRouter } from "./router";

const dir = mkdtempSync(resolve(tmpdir(), "grin-api-"));
const filePath = resolve(dir, "nested/gate-status.json");
const store = new GateStore(filePath);
const intent = new IntentStore(resolve(dir, "intent.json"));

let server: Server;
let base = "";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRouter(store, intent));
  server = app.listen(0);
  await new Promise<void>((done) => server.once("listening", done));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server?.close();
});

describe("GateStore", () => {
  it("returns an empty record before anything is written", () => {
    expect(new GateStore(resolve(dir, "missing.json")).read()).toEqual({});
  });

  it("survives a corrupt file instead of throwing", () => {
    const broken = resolve(dir, "broken.json");
    new GateStore(broken).write({ "gate-1": { "1": { value: 10 } } });
    // Overwrite with garbage, then read through a fresh store instance.
    writeFileSync(broken, "{not json", "utf-8");
    expect(new GateStore(broken).read()).toEqual({});
  });

  it("writes through a temp file and re-reads what it stored", () => {
    const status = store.update("gate-1", "1", { value: 250 });
    expect(status["gate-1"]?.["1"]?.value).toBe(250);
    expect(existsSync(filePath)).toBe(true);
    expect(existsSync(`${filePath}.tmp`)).toBe(false);
    expect(JSON.parse(readFileSync(filePath, "utf-8"))["gate-1"]["1"].value).toBe(250);
  });

  it("resets one gate without touching the other", () => {
    store.update("gate-2", "2", { value: 30 });
    store.reset("gate-1");
    const status = store.read();
    expect(status["gate-1"]).toBeUndefined();
    expect(status["gate-2"]?.["2"]?.value).toBe(30);
  });
});

describe("GET /api", () => {
  it("reports health and the gate list", async () => {
    const health = await (await fetch(`${base}/api/health`)).json();
    expect(health).toMatchObject({ ok: true, service: "grin-status", gates: 2 });
  });

  it("returns status and a verdict for every gate", async () => {
    const body = await (await fetch(`${base}/api/gates`)).json();
    expect(body.gates.map((g: { id: string }) => g.id)).toEqual(["gate-1", "gate-2"]);
    expect(body.verdicts).toHaveLength(2);
    expect(body.verdicts[0]).toMatchObject({ gateId: "gate-1", total: 4, clear: false });
    expect(body.verdicts[1]).toMatchObject({ gateId: "gate-2", total: 5 });
  });
});

describe("PATCH /api/gates/:gateId/criteria/:n", () => {
  it("records a numeric measurement and clears the gate at threshold", async () => {
    const values = [250, 50, 60, 1];
    let body: { verdicts: { gateId: string; metCount: number; total: number; clear: boolean }[] } = {
      verdicts: [],
    };
    for (let i = 0; i < values.length; i++) {
      const res = await fetch(`${base}/api/gates/gate-1/criteria/${i + 1}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: values[i] }),
      });
      expect(res.status).toBe(200);
      body = await res.json();
    }
    const gate1 = body.verdicts.find((v) => v.gateId === "gate-1");
    expect(gate1?.metCount).toBe(4);
    expect(gate1?.clear).toBe(true);
  });

  it("rejects a partial pass — 3 of 4 is not clear", async () => {
    await fetch(`${base}/api/gates/gate-1/criteria/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 249 }),
    });
    const body = await (await fetch(`${base}/api/gates`)).json();
    const gate1 = body.verdicts.find((v: { gateId: string }) => v.gateId === "gate-1");
    expect(gate1.metCount).toBe(3);
    expect(gate1.clear).toBe(false);
  });

  it("enforces direction — '≤1 engineer' fails at 2", async () => {
    await fetch(`${base}/api/gates/gate-1/criteria/4`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 2 }),
    });
    const body = await (await fetch(`${base}/api/gates`)).json();
    const engineers = body.verdicts[0].criteria[3];
    expect(engineers.met).toBe(false);
  });

  it("records boolean criteria", async () => {
    const res = await fetch(`${base}/api/gates/gate-2/criteria/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmed: true }),
    });
    const body = await res.json();
    const criterion = body.verdicts[1].criteria[0];
    expect(criterion.met).toBe(true);
    expect(criterion.progress).toBe(1);
  });

  it("rejects a number sent to a boolean criterion", async () => {
    const res = await fetch(`${base}/api/gates/gate-2/criteria/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 1 }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects a boolean sent to a numeric criterion", async () => {
    const res = await fetch(`${base}/api/gates/gate-1/criteria/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmed: true }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects non-finite values and unknown gates", async () => {
    const bad = await fetch(`${base}/api/gates/gate-1/criteria/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "many" }),
    });
    expect(bad.status).toBe(400);

    const unknownGate = await fetch(`${base}/api/gates/gate-9/criteria/1`, { method: "PATCH" });
    expect(unknownGate.status).toBe(404);

    const unknownCriterion = await fetch(`${base}/api/gates/gate-1/criteria/99`, { method: "PATCH" });
    expect(unknownCriterion.status).toBe(404);
  });
});

describe("unmatched API routes", () => {
  it("answers in JSON rather than falling through to the host app", async () => {
    const response = await fetch(`${base}/api/definitely-not-a-route`);
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("No API route");
  });

  it("does not leak the server's filesystem in an error", async () => {
    // Percent-encoded dot segments are resolved by the URL parser before the request
    // is sent, so the probes that actually reach the router are plain unknown paths.
    // The raw-socket traversal case is covered live by scripts/audit.mjs.
    for (const probe of ["/api/../../etc/passwd", "/api/gates/gate-1/../../secret", "/api/health/extra"]) {
      const response = await fetch(`${base}${probe}`, { redirect: "manual" });
      const text = await response.text();
      expect(text, probe).not.toMatch(/\/home\/|\/Users\/|[A-Z]:\\/);
      expect(response.status, probe).toBe(404);
    }
  });
});

describe("reset endpoints", () => {
  it("resets one gate, then all", async () => {
    const one = await (await fetch(`${base}/api/gates/gate-1/reset`, { method: "POST" })).json();
    expect(one.verdicts[0].metCount).toBe(0);
    expect(one.verdicts[1].metCount).toBeGreaterThan(0);

    const all = await (await fetch(`${base}/api/gates/reset`, { method: "POST" })).json();
    expect(all.verdicts.every((v: { metCount: number }) => v.metCount === 0)).toBe(true);
  });
});

const jsonPatch = (body: unknown) => ({
  method: "PATCH",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const jsonPost = (body: unknown) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("gate history and the anti-drift rule", () => {
  it("records a measurement for every patch", async () => {
    await fetch(`${base}/api/gates/gate-1/criteria/1`, jsonPatch({ value: 120 }));

    const body = (await (await fetch(`${base}/api/gates/history?gateId=gate-1`)).json()) as {
      history: { kind: string; n?: string; value?: number }[];
    };
    const measurements = body.history.filter((entry) => entry.kind === "measurement");
    expect(measurements.length).toBeGreaterThan(0);
    expect(measurements.at(-1)).toMatchObject({ kind: "measurement", n: "1", value: 120 });
  });

  it("counts an assessment as a failure, and two of them kill the product", async () => {
    // Gate 1 has 120 of the 250 customers it needs, so assessing it must fail.
    await fetch(`${base}/api/gates/gate-1/assess`, { method: "POST" });
    await fetch(`${base}/api/gates/gate-1/assess`, { method: "POST" });

    const payload = (await (await fetch(`${base}/api/gates`)).json()) as {
      antiDrift: Record<string, string>;
      history: { gateId: string; kind: string; clear?: boolean }[];
    };
    expect(payload.antiDrift["gate-1"]).toBe("killed");
    const failures = payload.history.filter(
      (entry) => entry.gateId === "gate-1" && entry.kind === "assessment" && entry.clear === false,
    );
    expect(failures.length).toBeGreaterThanOrEqual(2);
  });

  it("does not let editing a criterion count as a failure", async () => {
    for (const value of [10, 20, 30, 40]) {
      await fetch(`${base}/api/gates/gate-2/criteria/2`, jsonPatch({ value }));
    }
    const payload = (await (await fetch(`${base}/api/gates`)).json()) as {
      antiDrift: Record<string, string>;
      history: { gateId: string; kind: string }[];
    };
    // Gate 2 has never been assessed, so four edits must leave it "clear", not killed.
    expect(payload.antiDrift["gate-2"]).toBe("clear");
    expect(
      payload.history.filter((entry) => entry.gateId === "gate-2" && entry.kind === "assessment"),
    ).toHaveLength(0);
  });
});

describe("intent capture", () => {
  it("counts an ask per product and publishes progress against the gate", async () => {
    for (let i = 0; i < 3; i += 1) {
      const response = await fetch(`${base}/api/intent`, jsonPost({ product: "legacy", source: "site" }));
      expect(response.status).toBe(201);
    }
    const body = (await (await fetch(`${base}/api/intent`)).json()) as {
      target: number;
      counts: Record<string, number>;
      lines: Record<string, string>;
    };
    expect(body.target).toBe(250);
    expect(body.counts).toMatchObject({ legacy: 3, social: 0, serendipity: 0 });
    expect(body.lines.legacy).toContain("250");
  });

  it("rejects a product the portfolio does not have", async () => {
    const response = await fetch(`${base}/api/intent`, jsonPost({ product: "nope" }));
    expect(response.status).toBe(400);
  });

  it("stores no contact details, because it accepts none", async () => {
    await fetch(
      `${base}/api/intent`,
      jsonPost({
        product: "social",
        source: "email",
        note: "asked about Pune",
        email: "someone@example.com",
      }),
    );
    const raw = readFileSync(resolve(dir, "intent.json"), "utf-8");
    expect(raw).not.toContain("someone@example.com");
    expect(raw).toContain("asked about Pune");
  });
});
