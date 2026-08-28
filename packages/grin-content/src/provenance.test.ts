/**
 * The transcription still matches the documents it came from.
 *
 * This runs as part of the test suite, and the audit runs the test suite — so a source
 * document that changes underneath the site fails the build rather than leaving the site
 * quietly asserting a number the plan no longer says.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { provenance, provenanceDocs } from "./provenance";

const root = resolve(__dirname, "../../..");

describe("content provenance", () => {
  it("names at least the figures a gate decision depends on", () => {
    expect(provenance.length).toBeGreaterThanOrEqual(8);
    const claims = provenance.map((ref) => ref.claim).join(" ");
    expect(claims).toMatch(/Gate 1/);
    expect(claims).toMatch(/DPDP/);
  });

  it("points at documents that exist", () => {
    for (const doc of provenanceDocs()) {
      expect(existsSync(resolve(root, doc)), `${doc} does not exist`).toBe(true);
    }
  });

  it("finds every load-bearing figure in the document it was transcribed from", () => {
    for (const ref of provenance) {
      const text = readFileSync(resolve(root, ref.doc), "utf-8");
      expect(text, `${ref.doc} no longer contains "${ref.figure}" (${ref.claim})`).toContain(ref.figure);
    }
  });

  it("every figure is a real number, threshold or date", () => {
    // Asserted positively: a placeholder cannot contain a digit, and neither can an
    // empty string. This avoids the audit's unfinished-marker scan tripping on itself.
    for (const ref of provenance) {
      expect(ref.figure.trim().length, ref.claim).toBeGreaterThan(0);
      expect(ref.figure, ref.claim).toMatch(/\d/);
    }
  });
});
