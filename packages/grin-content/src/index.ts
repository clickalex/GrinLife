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
];

/** Every route the GrinLife app serves — used by tests and by the sitemap. */
export const routes: string[] = ["/", "/roadmap", "/gates", "/spine", "/docs", "/404"].concat(
  products.map((p) => p.route),
);

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
