/**
 * `@grin/content` — the typed single source of truth for GrinLife.
 *
 * Every string here is transcribed from the strategy documents in `Demo/DOCS/`.
 * Front-ends render this data through `@grin/ui`; they never hard-code copy.
 */

import { legacy, legacyAddOns, legacyPhases, legacyPricing, legacyPricingNote } from "./legacy";
import {
  antiDriftRule,
  brandArchitecture,
  costClosing,
  costComparison,
  documents,
  fork,
  gates,
  portfolio,
  portfolioSources,
  relayColumns,
  relayLegend,
  relayRule,
  relayTracks,
  shortAnswer,
  spineIntro,
  spinePayoff,
  spineRows,
} from "./portfolio";
import { serendipity, serendipityClosing, serendipityPhases, nonNegotiables, structure } from "./serendipity";
import { social, socialPhases, socialPricing } from "./social";
import type { AccentId, Phase, Product, ProductId } from "./types";

export * from "./types";

// Operating records, gate history, the published accessibility position and the locale
// layer. Each is its own module so a front-end can import one without pulling the rest.
export * from "./operations";
export * from "./history";
export * from "./accessibility";
export * from "./locale";
export * from "./provenance";

export { gateInputs, gateIds, inputsForGate } from "./gateInputs";
export {
  evaluateCriterion,
  criterionProgress,
  evaluateGate,
  evaluateAll,
  antiDriftState,
} from "./gateStatus";

export {
  antiDriftRule,
  brandArchitecture,
  costClosing,
  costComparison,
  documents,
  fork,
  gates,
  legacy,
  legacyAddOns,
  legacyPhases,
  legacyPricing,
  legacyPricingNote,
  nonNegotiables,
  portfolio,
  portfolioSources,
  relayColumns,
  relayLegend,
  relayRule,
  relayTracks,
  serendipity,
  serendipityClosing,
  serendipityPhases,
  shortAnswer,
  social,
  socialPhases,
  socialPricing,
  spineIntro,
  spinePayoff,
  spineRows,
  structure,
};

/** The three products, in wave order. */
export const products: Product[] = [legacy, social, serendipity];

/** Phases per product, in build order. */
export const phasesByProduct: Record<ProductId, Phase[]> = {
  legacy: legacyPhases,
  social: socialPhases,
  serendipity: serendipityPhases,
};

/** Every phase in the portfolio, ordered by wave then index. */
export const allPhases: Phase[] = products.flatMap((p) => phasesByProduct[p.id]);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getPhases(id: ProductId): Phase[] {
  return phasesByProduct[id];
}

export function getPhase(phaseId: string): Phase | undefined {
  return allPhases.find((p) => p.id === phaseId);
}

/** Primary navigation shared by every Grin front-end. */
export const primaryNav: { label: string; href: string }[] = [
  { label: "Portfolio", href: "/" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Legacy", href: "/products/legacy" },
  { label: "Social", href: "/products/social" },
  { label: "Serendipity", href: "/products/serendipity" },
  { label: "Shared spine", href: "/spine" },
  { label: "Gates", href: "/gates" },
  { label: "Docs", href: "/docs" },
  { label: "Accessibility", href: "/accessibility" },
];

/** Every route the GrinLife app serves — used by tests and by the sitemap. */
export const routes: string[] = [
  "/",
  "/roadmap",
  "/gates",
  "/spine",
  "/docs",
  "/accessibility",
  "/404",
].concat(products.map((p) => p.route));

/** `<title>` and meta description for one route. */
export interface PageMeta {
  title: string;
  description: string;
}

/**
 * Per-route document metadata.
 *
 * One site now carries eight routes. A single `<title>` in `index.html` would make
 * every tab, bookmark and search result say the same thing, so the head is data
 * like everything else — and it lives next to `routes` so the two cannot drift.
 */
const staticPageMeta: Record<string, PageMeta> = {
  "/": {
    title: "Three products, run as a relay",
    description:
      "Grin Legacy, GrinSocial and Serendipity — one shared spine, two kill gates and a 36-month relay instead of a race.",
  },
  "/roadmap": {
    title: "The 36-month relay",
    description:
      "Wave by wave: what gets built, what each wave hands the next, and the fork that decides whether GrinSocial and Serendipity happen at all.",
  },
  "/gates": {
    title: "The two kill gates",
    description:
      "Gate 1 and Gate 2, measured. Every criterion takes a real number and the verdict only clears when all of them are met.",
  },
  "/spine": {
    title: "The shared spine",
    description:
      "The one monorepo behind every product: what each service owns, and why a new front-end inherits it instead of copying it.",
  },
  "/docs": {
    title: "Source documents",
    description:
      "The documents this site is transcribed from, with the duplication audit of the archives they replaced.",
  },
  "/accessibility": {
    title: "Accessibility",
    description:
      "What this site guarantees about keyboard, screen-reader and motion support, what is known to be imperfect, and how to report a barrier.",
  },
  "/404": {
    title: "This stop does not exist",
    description: "That trail stop is not on the map.",
  },
};

export const pageMeta: Record<string, PageMeta> = {
  ...staticPageMeta,
  ...Object.fromEntries(
    products.map((product) => [product.route, { title: product.name, description: product.pitch }]),
  ),
};

/** Document title for a path; unknown paths get the 404 wording rather than a blank tab. */
export function pageTitleFor(path: string): string {
  const meta = pageMeta[path] ?? pageMeta["/404"]!;
  return `${meta.title} · ${portfolio.name}`;
}

/** Meta description for a path. */
export function pageDescriptionFor(path: string): string {
  return (pageMeta[path] ?? pageMeta["/404"]!).description;
}

/**
 * How this repository implements the portfolio's own §4 "shared spine" rule.
 * The plan demands "1 monorepo, 3 front-ends"; these are the code-level equivalents.
 */
export const codebaseSpine: { service: string; asset: string; detail: string }[] = [
  {
    service: "Identity & auth",
    asset: "packages/grin-content",
    detail: "Product identity, routing and brand tier live in data, so a new front-end inherits them.",
  },
  {
    service: "Messaging / realtime",
    asset: "packages/grin-ui · patterns",
    detail: "SiteHeader, SiteFooter, SectionRail and PageHero are shared by both apps.",
  },
  {
    service: "Media pipeline",
    asset: "packages/grin-ui · Lantern",
    detail: "All visuals are generated SVG/CSS. No remote image dependency, so nothing can 404.",
  },
  {
    service: "Transcription + LLM shaping",
    asset: "packages/grin-content · Phase",
    detail: "One phase schema renders Legacy sprints, Social sprints and Serendipity safety order alike.",
  },
  {
    service: "Billing & subscriptions",
    asset: "packages/grin-ui · PricingTable",
    detail: "Legacy and Social pricing tables are the same component with different data.",
  },
  {
    service: "Consent / permanence engine",
    asset: "packages/grin-ui · DualView",
    detail: "The child/parent view switch is one component driven by a `kidWords` field on every phase.",
  },
];

/** Accent → the product it belongs to. Used for legends and cross-links. */
export const accentOwner: Record<AccentId, ProductId | null> = {
  honey: "legacy",
  moss: "social",
  violet: "serendipity",
  coral: null,
};
