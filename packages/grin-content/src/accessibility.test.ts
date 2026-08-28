/**
 * The accessibility page must not drift from the suite that enforces it.
 *
 * Every guarantee published on `/accessibility` names the test or audit check that
 * enforces it. If that name disappears, the page would be promising something nothing
 * checks — which is worse than not publishing it. So the names are verified here, in
 * the same suite they refer to.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  accessibilityContact,
  accessibilityGuarantees,
  accessibilityKnownIssues,
  accessibilityStandard,
} from "./accessibility";

const root = resolve(__dirname, "../../..");
const appTests = readFileSync(resolve(root, "apps/grinlife/src/audit.test.tsx"), "utf-8");
const auditScript = readFileSync(resolve(root, "scripts/audit.mjs"), "utf-8");

describe("the published accessibility position", () => {
  it("publishes guarantees, not silence", () => {
    expect(accessibilityGuarantees.length).toBeGreaterThanOrEqual(6);
    for (const guarantee of accessibilityGuarantees) {
      expect(guarantee.guarantee.trim().length).toBeGreaterThan(0);
      expect(guarantee.enforcedBy.length, guarantee.guarantee).toBeGreaterThan(0);
    }
  });

  it("names a test or check that actually exists for every guarantee", () => {
    for (const guarantee of accessibilityGuarantees) {
      for (const name of guarantee.enforcedBy) {
        const found = appTests.includes(name) || auditScript.includes(name);
        expect(found, `nothing enforces "${name}" (${guarantee.guarantee})`).toBe(true);
      }
    }
  });

  it("is honest about what is not guaranteed", () => {
    // A page that claims perfection is not telling the truth about accessibility.
    expect(accessibilityKnownIssues.length).toBeGreaterThan(0);
    for (const issue of accessibilityKnownIssues) {
      expect(issue.issue.trim().length).toBeGreaterThan(0);
      expect(issue.workaround.trim().length, issue.issue).toBeGreaterThan(0);
    }
    // Colour contrast is not machine-verified, and the page says so.
    expect(accessibilityKnownIssues.map((issue) => issue.issue).join(" ")).toMatch(/contrast/i);
  });

  it("makes a claim about the standard and a route to report a problem", () => {
    expect(accessibilityStandard).toMatch(/WCAG/);
    // No certification is claimed.
    expect(accessibilityStandard).toMatch(/not been audited|no\s+conformance/i);
    expect(accessibilityContact).toMatch(/@/);
  });
});
