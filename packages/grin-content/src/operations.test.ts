/**
 * The operating records have to hold up as data, not just render.
 *
 * A kill step with no owner is a hope. A margin that is typed instead of derived can
 * drift from the costs beside it. A hand-off with no evidence is not a contract. These
 * are the assertions that make those records mean something.
 */
import { describe, expect, it } from "vitest";
import {
  baselineCostValues,
  cityReady,
  cityWaitlistTarget,
  costAssumptions,
  consentArtefact,
  deriveUnitEconomics,
  gateOneMarginFloorPct,
  handoffContract,
  handoffOutstanding,
  killProcedure,
  launchCities,
  legacyBookEconomics,
  marginTargetPct,
  runCostModel,
  unitEconomicsNote,
} from "./operations";

describe("the kill procedure", () => {
  it("gives every step an owner and a way to prove it happened", () => {
    for (const step of killProcedure) {
      expect(step.owner.trim().length, `${step.action} has no owner`).toBeGreaterThan(0);
      expect(step.evidence.trim().length, `${step.action} has no evidence`).toBeGreaterThan(0);
      expect(step.detail.trim().length, `${step.action} has no detail`).toBeGreaterThan(0);
    }
  });

  it("numbers its steps in order, so it can be executed at 2am", () => {
    expect(killProcedure.map((step) => step.order)).toEqual(killProcedure.map((_, i) => i + 1));
  });

  it("includes the steps the plan's own failure mode requires", () => {
    const actions = killProcedure.map((step) => step.action).join(" ");
    expect(actions).toMatch(/spend/i);
    expect(actions).toMatch(/refund/i);
    expect(actions).toMatch(/deletion/i);
    expect(actions).toMatch(/post-mortem/i);
  });
});

describe("unit economics", () => {
  it("derives the margin from its parts rather than typing it", () => {
    const cost = legacyBookEconomics.lines.reduce((total, line) => total + line.amountInr, 0);
    expect(legacyBookEconomics.costInr).toBe(cost);
    expect(legacyBookEconomics.marginInr).toBe(legacyBookEconomics.priceInr - cost);
    expect(legacyBookEconomics.marginPct).toBeCloseTo(
      ((legacyBookEconomics.priceInr - cost) / legacyBookEconomics.priceInr) * 100,
      6,
    );
  });

  it("gives every cost line a basis, so an estimate can be replaced", () => {
    for (const line of legacyBookEconomics.lines) {
      expect(line.basis.trim().length, `${line.label} has no basis`).toBeGreaterThan(0);
      expect(line.amountInr, line.label).toBeGreaterThan(0);
    }
  });

  it("recomputes when a quote changes", () => {
    const cheaper = deriveUnitEconomics({
      ...legacyBookEconomics,
      lines: legacyBookEconomics.lines.map((line) =>
        line.label === "Printing and binding" ? { ...line, amountInr: line.amountInr - 500 } : line,
      ),
    });
    expect(cheaper.marginPct).toBeGreaterThan(legacyBookEconomics.marginPct);
  });

  it("publishes criteria that are actually different numbers", () => {
    expect(gateOneMarginFloorPct).toBe(50);
    expect(marginTargetPct).toBeGreaterThan(gateOneMarginFloorPct);
    expect(unitEconomicsNote.length).toBeGreaterThan(0);
  });
});

describe("the cost model", () => {
  it("holds at the plan's assumptions", () => {
    const result = runCostModel(baselineCostValues);
    expect(result.breakPoint).toBeNull();
    expect(result.rows).toHaveLength(4);
    expect(result.rows.every((row) => !row.breaks)).toBe(true);
  });

  it("marks where the relay breaks when volume collapses", () => {
    // Ten books a month at a 20% margin cannot pay for moderation, and the model says so.
    const result = runCostModel({ ...baselineCostValues, booksPerMonth: 10, marginPct: 20 });
    expect(result.breakPoint).toMatch(/relay breaks/i);
    expect(result.rows.filter((row) => row.breaks).length).toBeGreaterThan(0);
    // The contribution row is still positive; it is the surplus that goes under, and
    // that is the row the model marks.
    expect(result.rows[0]!.breaks).toBe(false);
    expect(result.rows[2]!.breaks).toBe(true);
  });

  it("marks the break when moderation cost outruns the contribution", () => {
    const result = runCostModel({ ...baselineCostValues, moderationPer1k: 40000 });
    expect(result.breakPoint).toMatch(/relay breaks/i);
    expect(result.rows[2]!.breaks).toBe(true);
  });

  it("marks the relay as holding but unaffordable when a city costs too much", () => {
    const result = runCostModel({ ...baselineCostValues, cityLaunchCost: 2000000 });
    // The surplus is still positive, so nothing "breaks" — but the third product is
    // years away, which is a different finding and gets its own wording.
    expect(result.rows[2]!.breaks).toBe(false);
    // ₹20,00,000 against a monthly surplus of about ₹3.1 lakh is seven months, which is
    // a delay rather than a break — and the distinction is the point of the wording.
    expect(Number(result.rows[3]!.raw)).toBeGreaterThan(6);
  });

  it("gives every slider a range that contains its baseline", () => {
    expect(costAssumptions).toHaveLength(Object.keys(baselineCostValues).length);
    for (const assumption of costAssumptions) {
      const baseline = baselineCostValues[assumption.id]!;
      expect(baseline, `${assumption.id} baseline`).toBe(assumption.baseline);
      expect(baseline, `${assumption.id} below its own minimum`).toBeGreaterThanOrEqual(assumption.min);
      expect(baseline, `${assumption.id} above its own maximum`).toBeLessThanOrEqual(assumption.max);
      expect(assumption.step, `${assumption.id} step`).toBeGreaterThan(0);
      expect(assumption.basis.trim().length, `${assumption.id} has no basis`).toBeGreaterThan(0);
    }
  });
});

describe("city readiness", () => {
  it("refuses to invent waitlist numbers", () => {
    // No city has been chosen, so every count is zero. A table of plausible numbers
    // would be exactly the fudging the gates exist to prevent.
    for (const city of launchCities) {
      expect(city.waitlist, `${city.city} claims a waitlist before one opened`).toBe(0);
      expect(cityReady(city), `${city.city} reads as ready with no waitlist`).toBe(false);
    }
  });

  it("measures readiness against the plan's own threshold", () => {
    expect(cityWaitlistTarget).toBe(500);
    expect(cityReady({ ...launchCities[0]!, waitlist: 500, moderators: 2 })).toBe(true);
    expect(cityReady({ ...launchCities[0]!, waitlist: 500, moderators: 0 })).toBe(false);
  });
});

describe("the hand-off contract", () => {
  it("gives every obligation a direction and a way to check it", () => {
    for (const item of handoffContract) {
      expect(item.from.trim().length, `${item.id} has no sending wave`).toBeGreaterThan(0);
      expect(item.to.trim().length, `${item.id} has no receiving wave`).toBeGreaterThan(0);
      expect(item.evidence.trim().length, `${item.id} has no evidence`).toBeGreaterThan(0);
    }
  });

  it("has unique ids, so a status can be updated without ambiguity", () => {
    const ids = handoffContract.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("still has obligations outstanding, because the waves have not run yet", () => {
    expect(handoffOutstanding().length).toBeGreaterThan(0);
    expect(handoffOutstanding().length).toBeLessThanOrEqual(handoffContract.length);
  });
});

describe("the consent artefact", () => {
  it("answers retention and deletion for everything it collects", () => {
    expect(consentArtefact.fields.length).toBeGreaterThan(0);
    for (const field of consentArtefact.fields) {
      expect(field.retention.trim().length, `${field.collected} has no retention`).toBeGreaterThan(0);
      expect(field.deletionRoute.trim().length, `${field.collected} has no deletion route`).toBeGreaterThan(
        0,
      );
    }
  });

  it("answers the question the plan says family disputes land on", () => {
    expect(consentArtefact.undertakings.join(" ")).toMatch(/after the storyteller dies/);
    expect(consentArtefact.signatureLines.join(" ")).toMatch(/after the storyteller dies/);
  });

  it("is signable — it has a signature and a date", () => {
    const lines = consentArtefact.signatureLines.join(" ").toLowerCase();
    expect(lines).toContain("signature");
    expect(lines).toContain("date");
  });
});
