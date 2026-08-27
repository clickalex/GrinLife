/**
 * Content integrity.
 *
 * `@grin/content` is the single source of truth for every Grin front-end, so a
 * malformed entry does not fail loudly at runtime — it renders a page with a hole
 * in it. These tests fail at the data layer instead.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  allPhases,
  documents,
  gates,
  getPhases,
  getProduct,
  phasesByProduct,
  primaryNav,
  products,
  relayColumns,
  relayLegend,
  relayTracks,
  routes,
  spineRows,
} from "./index";
import type { AccentId, ProductId } from "./types";

const repoRoot = resolve(import.meta.dirname, "../../..");
const validAccents: AccentId[] = ["coral", "moss", "violet", "honey"];

describe("products", () => {
  it("has exactly the three products from the portfolio plan, in wave order", () => {
    expect(products.map((p) => p.id)).toEqual(["legacy", "social", "serendipity"]);
    expect(products.map((p) => p.wave)).toEqual([1, 2, 3]);
  });

  it("gives every product a unique route, accent and status", () => {
    const ids = new Set(products.map((p) => p.id));
    const routeList = products.map((p) => p.route);
    expect(ids.size).toBe(products.length);
    expect(new Set(routeList).size).toBe(products.length);
    for (const product of products) {
      expect(validAccents).toContain(product.accent);
      expect(["build-now", "blocked", "conditional"]).toContain(product.status);
      expect(["endorsed", "quarantined"]).toContain(product.brand);
      expect(product.pitch.length).toBeGreaterThan(40);
      expect(product.onePage.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("quarantines Serendipity, exactly as the brand architecture requires", () => {
    const serendipity = getProduct("serendipity");
    expect(serendipity?.brand).toBe("quarantined");
    expect(serendipity?.formerName).toBe("GrinLuck");
    expect(products.filter((p) => p.brand === "endorsed").map((p) => p.id)).toEqual(["legacy", "social"]);
  });

  it("reports metrics with one value per column", () => {
    for (const product of products) {
      expect(product.metrics.columns.length).toBeGreaterThan(1);
      for (const row of product.metrics.rows) {
        expect(row.values, `${product.id} / ${row.metric}`).toHaveLength(product.metrics.columns.length);
      }
    }
  });
});

describe("phases", () => {
  it("gives every product at least three phases, numbered contiguously", () => {
    for (const product of products) {
      const phases = getPhases(product.id);
      expect(phases.length, product.id).toBeGreaterThanOrEqual(3);
      // Contiguous, but not necessarily from zero: Legacy and GrinSocial have a
      // Phase 0 validation sprint, while Serendipity's plan starts at Phase 1
      // because its safety layer is the first thing built.
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i]!.index, `${product.id} phase ${i}`).toBe(phases[i - 1]!.index + 1);
      }
    }
  });

  it("starts Legacy and GrinSocial at Phase 0, and Serendipity at Phase 1", () => {
    expect(phasesByProduct.legacy[0]?.index).toBe(0);
    expect(phasesByProduct.social[0]?.index).toBe(0);
    expect(phasesByProduct.serendipity[0]?.index).toBe(1);
  });

  it("keeps every phase id unique and owned by the right product", () => {
    const ids = allPhases.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const phase of allPhases) {
      expect(phase.id.startsWith(`${phase.product}-`)).toBe(true);
      expect(phasesByProduct[phase.product as ProductId]).toContain(phase);
    }
  });

  it("gives every phase a child-facing translation and at least one exit criterion", () => {
    for (const phase of allPhases) {
      expect(phase.kidWords.length, phase.id).toBeGreaterThan(20);
      expect(phase.summary.length, phase.id).toBeGreaterThan(20);
      expect(phase.exitCriteria.length, phase.id).toBeGreaterThan(0);
      expect(phase.window.length, phase.id).toBeGreaterThan(0);
    }
  });

  it("keeps kill signals on the validation phases, where the plan puts them", () => {
    expect(getProduct("legacy") && phasesByProduct.legacy[0]?.killSignal).toBeTruthy();
    expect(phasesByProduct.social[0]?.killSignal).toBeTruthy();
    expect(phasesByProduct.serendipity[1]?.killSignal).toBeTruthy();
  });

  it("labels the sprints that build the shared spine", () => {
    const legacyShared = phasesByProduct.legacy[1]?.sprints.filter((s) => s.shared) ?? [];
    expect(legacyShared.length).toBeGreaterThanOrEqual(4);
    const serendipityInherited = phasesByProduct.serendipity[0]?.sprints.filter((s) => s.shared) ?? [];
    expect(serendipityInherited.length).toBeGreaterThanOrEqual(3);
  });
});

describe("gates", () => {
  it("defines Gate 1 at month 12 and Gate 2 at month 24", () => {
    expect(gates.map((g) => [g.id, g.month])).toEqual([
      ["gate-1", 12],
      ["gate-2", 24],
    ]);
  });

  it("numbers criteria sequentially and resolves the product each gate unlocks", () => {
    for (const gate of gates) {
      expect(gate.criteria.map((c) => c.n)).toEqual(gate.criteria.map((_, i) => String(i + 1)));
      expect(gate.criteria.length).toBeGreaterThanOrEqual(4);
      expect(getProduct(gate.unlocks)?.id).toBe(gate.unlocks);
      expect(gate.ifNotMet.length).toBeGreaterThan(20);
    }
  });

  it("warns about the criterion founders fudge", () => {
    const warning = gates[0]?.fudgeWarning ?? "";
    expect(warning).toContain("fudge");
    expect(warning).toContain("you have a job");
  });
});

describe("relay timeline", () => {
  it("gives every track one cell per timeline column", () => {
    expect(relayColumns).toHaveLength(6);
    for (const track of relayTracks) {
      expect(track.cells, track.name).toHaveLength(relayColumns.length);
      for (const cell of track.cells) {
        expect(relayLegend.map((l) => l.state)).toContain(cell.state);
      }
    }
  });

  it("never has two tracks in build during the same column — the relay rule", () => {
    for (let column = 0; column < relayColumns.length; column++) {
      const building = relayTracks.filter((track) => track.cells[column]?.state === "build");
      expect(building.length, `column ${relayColumns[column]}`).toBeLessThanOrEqual(1);
    }
  });

  it("puts a gate immediately before each later wave's build", () => {
    const social = relayTracks.find((t) => t.product === "social");
    const serendipity = relayTracks.find((t) => t.product === "serendipity");
    const gateBefore = (states: string[]) => {
      const build = states.indexOf("build");
      return states[build - 1];
    };
    expect(gateBefore((social?.cells ?? []).map((c) => c.state))).toBe("gate");
    expect(gateBefore((serendipity?.cells ?? []).map((c) => c.state))).toBe("gate");
  });
});

describe("shared spine", () => {
  it("assigns every service a building wave", () => {
    for (const row of spineRows) {
      expect(row.builtIn).toMatch(/^Wave [123]/);
    }
  });

  it("leaves Wave 3 with almost nothing new to build", () => {
    const inherited = spineRows.filter((row) => row.luck);
    expect(inherited.length).toBeGreaterThanOrEqual(7);
    expect(inherited.every((row) => !row.builtIn.startsWith("Wave 3"))).toBe(true);
  });
});

describe("routing", () => {
  it("lists every product route and no duplicates", () => {
    expect(new Set(routes).size).toBe(routes.length);
    for (const product of products) {
      expect(routes).toContain(product.route);
    }
  });

  it("links primary navigation only to real routes", () => {
    for (const link of primaryNav) {
      expect(routes, link.href).toContain(link.href);
    }
  });
});

describe("document index", () => {
  it("points at files that actually exist in Demo/DOCS", () => {
    for (const doc of documents) {
      const content = readFileSync(resolve(repoRoot, doc.file), "utf-8");
      expect(content.length, doc.file).toBeGreaterThan(1000);
    }
  });
});
