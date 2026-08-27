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
import { GateStore } from "./store";
import { createApiRouter } from "./router";

const dir = mkdtempSync(resolve(tmpdir(), "grin-api-"));
const filePath = resolve(dir, "nested/gate-status.json");
const store = new GateStore(filePath);

let server: Server;
let base = "";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRouter(store));
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
    let body: any;
    for (let i = 0; i < values.length; i++) {
      const res = await fetch(`${base}/api/gates/gate-1/criteria/${i + 1}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: values[i] }),
      });
      expect(res.status).toBe(200);
      body = await res.json();
    }
    const gate1 = body.verdicts.find((v: { gateId: string }) => v.gateId === "gate-1");
    expect(gate1.metCount).toBe(4);
    expect(gate1.clear).toBe(true);
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

describe("reset endpoints", () => {
  it("resets one gate, then all", async () => {
    const one = await (
      await fetch(`${base}/api/gates/gate-1/reset`, { method: "POST" })
    ).json();
    expect(one.verdicts[0].metCount).toBe(0);
    expect(one.verdicts[1].metCount).toBeGreaterThan(0);

    const all = await (await fetch(`${base}/api/gates/reset`, { method: "POST" })).json();
    expect(all.verdicts.every((v: { metCount: number }) => v.metCount === 0)).toBe(true);
  });
});
