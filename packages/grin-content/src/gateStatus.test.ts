/**
 * Gate evaluation — the arithmetic behind a kill-gate decision.
 *
 * This is the logic both the API and the front-end run, so a disagreement between
 * them would mean the dashboard shows a gate as passed that the server disagrees
 * with. It is pure, so it is tested directly.
 */
import { describe, expect, it } from "vitest";
import {
  antiDriftState,
  criterionProgress,
  evaluateAll,
  evaluateCriterion,
  evaluateGate,
  inputsForGate,
  type GateStatusRecord,
} from "./index";

const numeric = { n: "1", label: "Customers", kind: "numeric" as const, target: 250, unit: "customers", direction: "at-least" as const };
const ceiling = { n: "4", label: "Engineers", kind: "numeric" as const, target: 1, unit: "engineers", direction: "at-most" as const };
const yesno = { n: "1", label: "Legal opinion", kind: "boolean" as const };

describe("evaluateCriterion", () => {
  it("passes a numeric threshold at exactly the target", () => {
    expect(evaluateCriterion(numeric, { value: 250 })).toBe(true);
    expect(evaluateCriterion(numeric, { value: 249 })).toBe(false);
    expect(evaluateCriterion(numeric, { value: 400 })).toBe(true);
  });

  it("respects direction — '≤1 engineer' fails at 2", () => {
    expect(evaluateCriterion(ceiling, { value: 1 })).toBe(true);
    expect(evaluateCriterion(ceiling, { value: 0 })).toBe(true);
    expect(evaluateCriterion(ceiling, { value: 2 })).toBe(false);
  });

  it("treats an unrecorded value as not met rather than as zero", () => {
    expect(evaluateCriterion(numeric, undefined)).toBe(false);
    expect(evaluateCriterion(numeric, {})).toBe(false);
    expect(evaluateCriterion(numeric, { value: Number.NaN })).toBe(false);
  });

  it("requires explicit confirmation for boolean criteria", () => {
    expect(evaluateCriterion(yesno, { confirmed: true })).toBe(true);
    expect(evaluateCriterion(yesno, { confirmed: false })).toBe(false);
    expect(evaluateCriterion(yesno, { value: 1 })).toBe(false);
  });
});

describe("criterionProgress", () => {
  it("clamps to 0–1", () => {
    expect(criterionProgress(numeric, { value: 125 })).toBe(0.5);
    expect(criterionProgress(numeric, { value: 900 })).toBe(1);
    expect(criterionProgress(numeric, { value: -10 })).toBe(0);
    expect(criterionProgress(numeric, undefined)).toBe(0);
  });

  it("reports boolean criteria as 0 or 1", () => {
    expect(criterionProgress(yesno, { confirmed: true })).toBe(1);
    expect(criterionProgress(yesno, { confirmed: false })).toBe(0);
  });
});

describe("evaluateGate", () => {
  it("knows the real criterion counts — 4 at Gate 1, 5 at Gate 2", () => {
    const empty: GateStatusRecord = {};
    expect(evaluateGate("gate-1", empty).total).toBe(4);
    expect(evaluateGate("gate-2", empty).total).toBe(5);
    expect(inputsForGate("gate-9")).toEqual([]);
  });

  it("does not clear on a partial pass — the whole point of the gate", () => {
    const threeOfFour: GateStatusRecord = {
      "gate-1": {
        "1": { value: 250 },
        "2": { value: 50 },
        "3": { value: 60 },
        "4": { value: 3 },
      },
    };
    const verdict = evaluateGate("gate-1", threeOfFour);
    expect(verdict.metCount).toBe(3);
    expect(verdict.clear).toBe(false);
  });

  it("clears only when every criterion is met", () => {
    const allMet: GateStatusRecord = {
      "gate-1": {
        "1": { value: 250 },
        "2": { value: 55 },
        "3": { value: 61 },
        "4": { value: 1 },
      },
    };
    const verdict = evaluateGate("gate-1", allMet);
    expect(verdict.metCount).toBe(4);
    expect(verdict.clear).toBe(true);
  });

  it("ignores measurements recorded against the wrong gate", () => {
    const misfiled: GateStatusRecord = { "gate-2": { "1": { value: 999 } } };
    expect(evaluateGate("gate-1", misfiled).metCount).toBe(0);
  });

  it("evaluates every gate the plan defines", () => {
    const verdicts = evaluateAll({});
    expect(verdicts.map((verdict) => verdict.gateId)).toEqual(["gate-1", "gate-2"]);
    expect(verdicts.every((verdict) => verdict.clear === false)).toBe(true);
  });
});

describe("antiDriftState", () => {
  it("kills a track that fails its gate twice, rather than pausing it", () => {
    expect(antiDriftState(0)).toBe("clear");
    expect(antiDriftState(1)).toBe("retry");
    expect(antiDriftState(2)).toBe("killed");
    expect(antiDriftState(5)).toBe("killed");
  });
});
