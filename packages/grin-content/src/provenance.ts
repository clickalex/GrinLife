/**
 * Content provenance — the load-bearing figures, and where each one came from.
 *
 * Every string in this package is transcribed from `Demo/DOCS/`. The tests check that
 * the *structure* holds; nothing checked that the numbers still agree, so editing a
 * source document would let the site drift silently.
 *
 * This is not a full diff. It is the figures a decision depends on — gate thresholds,
 * prices, a legal deadline, a launch size — each paired with the document it came from.
 * `provenance.test.ts` reads that document and fails if the figure is no longer there.
 *
 * Where a figure also lives in the content model it is *derived* from the model rather
 * than typed again, so the check fails in both directions: if the document changes, and
 * if this package changes away from the document.
 */
import { cityWaitlistTarget, launchUsers } from "./operations";
import { legacyPricing } from "./legacy";

export interface ProvenanceRef {
  /** Repo-relative path to the source document. */
  doc: string;
  /** The figure exactly as it appears in that document — matched literally. */
  figure: string;
  /** What depends on it, so a failure explains itself instead of just naming a number. */
  claim: string;
}

/** "₹6,999" → "6,999", so the price is read from the pricing table, not retyped. */
const rupees = (price: string) => price.replace(/[^\d,.]/g, "");

const bookTier = legacyPricing.find((tier) => tier.featured) ?? legacyPricing[1]!;
const digitalTier = legacyPricing[0]!;
const familyTier = legacyPricing[2]!;

export const provenance: ProvenanceRef[] = [
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: "250",
    claim: "Gate 1's first criterion — 250 paying customers",
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: "50%",
    claim: "Gate 1's margin floor, the criterion `legacyBookEconomics` is checked against",
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: "60%",
    claim: "Gate 1's completion / repeat-or-referral threshold",
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: rupees(bookTier.india),
    claim: `The ${bookTier.name} tier price, which is also the price the unit economics are built on`,
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: rupees(digitalTier.india),
    claim: `The ${digitalTier.name} tier price`,
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: rupees(familyTier.india),
    claim: `The ${familyTier.name} tier price`,
  },
  {
    doc: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    figure: "13 May 2027",
    claim: "The DPDP compliance deadline the consent artefact is written against",
  },
  {
    doc: "Demo/DOCS/2-GrinSocial-Phase-Plan.html",
    figure: launchUsers.toLocaleString("en-IN"),
    claim: "GrinSocial's launch size, held constant by the cost model",
  },
  {
    doc: "Demo/DOCS/2-GrinSocial-Phase-Plan.html",
    figure: cityWaitlistTarget.toLocaleString("en-IN"),
    claim: "The per-city waitlist threshold the city-readiness table measures against",
  },
  {
    doc: "Demo/DOCS/Grin-Three-Product-Plan.html",
    figure: "250",
    claim: "Gate 1 restated in the portfolio plan — the two documents must not disagree",
  },
];

/** Every document a figure is claimed from, so a missing file is reported once, not per figure. */
export function provenanceDocs(refs: ProvenanceRef[] = provenance): string[] {
  return [...new Set(refs.map((ref) => ref.doc))];
}
