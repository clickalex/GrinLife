import type { GateInput } from "./types";
import { gates } from "./portfolio";

/**
 * Each gate criterion, expressed as something that can be measured.
 *
 * The plan states the thresholds in prose ("250+ paying customers", "≤1 engineer").
 * These are the same numbers in a form a dashboard can compare against — the prose
 * in `Gate.criteria` stays the human-facing statement, this is the machine check.
 */
export const gateInputs: Record<string, GateInput[]> = {
  "gate-1": [
    {
      n: "1",
      label: "Paying Legacy customers",
      kind: "numeric",
      target: 250,
      unit: "customers",
      direction: "at-least",
    },
    {
      n: "2",
      label: "Gross margin after print and fulfilment",
      kind: "numeric",
      target: 50,
      unit: "%",
      direction: "at-least",
    },
    {
      n: "3",
      label: "Storytellers completing 20+ stories",
      kind: "numeric",
      target: 60,
      unit: "%",
      direction: "at-least",
    },
    {
      n: "4",
      label: "Engineers on ongoing Legacy attention",
      kind: "numeric",
      target: 1,
      unit: "engineers",
      direction: "at-most",
    },
  ],
  "gate-2": [
    { n: "1", label: "Legacy profitable and self-running", kind: "boolean" },
    {
      n: "2",
      label: "GrinSocial D30 retention",
      kind: "numeric",
      target: 25,
      unit: "%",
      direction: "at-least",
    },
    { n: "3", label: "Moderation tooling handling real abuse reports at acceptable cost", kind: "boolean" },
    { n: "4", label: "Budget for a dedicated trust & safety hire", kind: "boolean" },
    { n: "5", label: "Written legal opinion on age assurance in every launch market", kind: "boolean" },
  ],
};

/** Every gate id in plan order. */
export const gateIds = gates.map((gate) => gate.id);

export function inputsForGate(gateId: string): GateInput[] {
  return gateInputs[gateId] ?? [];
}
