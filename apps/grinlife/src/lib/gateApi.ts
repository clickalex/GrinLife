import type { GateStatusRecord, GateVerdict } from "@grin/content";

/**
 * Client for the Grin status API.
 *
 * Every call returns `null` on failure rather than throwing, because the site is
 * also served as a static build with no API behind it. The page then falls back to
 * browser-local storage and says so on screen — it never silently pretends to be
 * connected.
 */

export interface GatesPayload {
  gates: { id: string; month: number; question: string; unlocks: string }[];
  status: GateStatusRecord;
  verdicts: GateVerdict[];
}

async function request(path: string, init?: RequestInit): Promise<GatesPayload | null> {
  try {
    const response = await fetch(path, {
      headers: { "content-type": "application/json" },
      ...init,
    });
    if (!response.ok) return null;
    return (await response.json()) as GatesPayload;
  } catch {
    return null;
  }
}

export function fetchGates(): Promise<GatesPayload | null> {
  return request("/api/gates");
}

export function setCriterionValue(gateId: string, n: string, value: number | null) {
  return request(`/api/gates/${gateId}/criteria/${n}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

export function setCriterionConfirmed(gateId: string, n: string, confirmed: boolean) {
  return request(`/api/gates/${gateId}/criteria/${n}`, {
    method: "PATCH",
    body: JSON.stringify({ confirmed }),
  });
}

export function setCriterionNote(gateId: string, n: string, note: string) {
  return request(`/api/gates/${gateId}/criteria/${n}`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export function resetGate(gateId: string) {
  return request(`/api/gates/${gateId}/reset`, { method: "POST" });
}

export function resetAllGates() {
  return request("/api/gates/reset", { method: "POST" });
}

export type GatePatch =
  | { kind: "value"; n: string; value: number | null }
  | { kind: "confirmed"; n: string; confirmed: boolean }
  | { kind: "note"; n: string; note: string };

/** Applies one edit, whichever transport the page is using. */
export async function applyPatch(gateId: string, patch: GatePatch): Promise<GatesPayload | null> {
  switch (patch.kind) {
    case "value":
      return setCriterionValue(gateId, patch.n, patch.value);
    case "confirmed":
      return setCriterionConfirmed(gateId, patch.n, patch.confirmed);
    case "note":
      return setCriterionNote(gateId, patch.n, patch.note);
  }
}
