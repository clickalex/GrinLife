/**
 * Gate page behaviour that only shows up when the network misbehaves.
 *
 * The page has two sources of truth — the status API and browser-local storage — and
 * the interesting failure is the transition between them: a reader who has entered
 * four measurements and then loses the API must not watch them disappear.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { evaluateAll, gates, type GateStatusRecord } from "@grin/content";

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

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
});

function renderGates() {
  window.history.pushState({}, "", "/gates");
  return render(<App />);
}

describe("the status API dropping mid-session", () => {
  it("keeps measurements the reader already entered", async () => {
    const recorded: GateStatusRecord = { "gate-1": { "1": { value: 300 } } };
    let healthy = true;

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = JSON.stringify(payloadFor(recorded));
      if (url.endsWith("/api/gates")) {
        return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
      }
      if (init?.method === "PATCH") {
        return healthy
          ? new Response(body, { status: 200, headers: { "content-type": "application/json" } })
          : new Response("gone", { status: 503 });
      }
      return new Response("nope", { status: 404 });
    }) as unknown as typeof fetch;

    renderGates();

    await waitFor(() => expect(screen.getByText(/Connected to the status API/)).toBeTruthy());
    const input = screen.getAllByRole("spinbutton")[0]!;
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("300");

    // The API goes away, then the reader touches a control.
    healthy = false;
    fireEvent.change(input, { target: { value: "310" } });

    await waitFor(() => expect(screen.getByText(/No status API — browser-local/)).toBeTruthy());

    // Before the fix this rendered an empty board: flipping offline switched the source
    // to browser-local storage, which had never been told about the server's values.
    const after = screen.getAllByRole("spinbutton")[0] as HTMLInputElement;
    expect(after.value).not.toBe("");
    expect(Number(after.value)).toBeGreaterThanOrEqual(300);
  });
});

describe("recording a decision", () => {
  it("shows when each measurement was taken", async () => {
    const recorded: GateStatusRecord = {
      "gate-1": { "1": { value: 300, updatedAt: "2026-03-14T10:00:00.000Z" } },
    };

    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify(payloadFor(recorded)), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    renderGates();

    await waitFor(() => expect(screen.getByText(/Connected to the status API/)).toBeTruthy());
    // A gate decision without a date cannot be audited later.
    expect(screen.getAllByText(/14 Mar 2026|2026-03-14|Mar 2026/).length).toBeGreaterThan(0);
  });
});
