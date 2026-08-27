import type { GateInput, CriterionState, GateStatusRecord, GateVerdict } from "./types";
import { gates } from "./portfolio";
import { inputsForGate } from "./gateInputs";

/**
 * Gate evaluation — pure, shared by the API and by every front-end.
 *
 * Keeping this out of the server means the client can evaluate the same rule
 * offline (or before the API responds) and never disagree with it.
 */

export function evaluateCriterion(input: GateInput, state: CriterionState | undefined): boolean {
  if (input.kind === "boolean") return state?.confirmed === true;
  if (typeof state?.value !== "number" || Number.isNaN(state.value)) return false;
  if (typeof input.target !== "number") return false;
  return input.direction === "at-most" ? state.value <= input.target : state.value >= input.target;
}

/** Progress toward a numeric target, clamped to 0–1. Boolean criteria are 0 or 1. */
export function criterionProgress(input: GateInput, state: CriterionState | undefined): number {
  if (input.kind === "boolean") return state?.confirmed ? 1 : 0;
  if (typeof state?.value !== "number" || typeof input.target !== "number" || input.target === 0) return 0;
  const ratio = state.value / input.target;
  return Math.max(0, Math.min(1, ratio));
}

export function evaluateGate(gateId: string, status: GateStatusRecord): GateVerdict {
  const inputs = inputsForGate(gateId);
  const gateStatus = status[gateId] ?? {};

  const criteria = inputs.map((input) => {
    const state = gateStatus[input.n];
    return {
      input,
      state,
      met: evaluateCriterion(input, state),
      progress: criterionProgress(input, state),
    };
  });

  const metCount = criteria.filter((c) => c.met).length;

  return {
    gateId,
    criteria,
    metCount,
    total: criteria.length,
    clear: criteria.length > 0 && metCount === criteria.length,
  };
}

export function evaluateAll(status: GateStatusRecord): GateVerdict[] {
  return gates.map((gate) => evaluateGate(gate.id, status));
}

/** A gate that has failed twice in a row is killed, not paused — the anti-drift rule. */
export function antiDriftState(failures: number): "clear" | "retry" | "killed" {
  if (failures >= 2) return "killed";
  if (failures === 1) return "retry";
  return "clear";
}
