/**
 * Operating records — the numbers and procedures the plan states in prose.
 *
 * Everything in this file exists to make a stated commitment *checkable*: a margin
 * that can be recomputed instead of typed, a kill decision that has owners before it
 * is needed, a hand-off that says what the receiving wave is entitled to expect.
 *
 * Honesty rule for this file: no number here is a measurement. Prices and gate
 * thresholds are transcribed from `Demo/DOCS/`; every cost is a planning estimate and
 * carries a `basis` field saying so, so it can be replaced with a real quote without
 * anyone having to work out which figures were invented.
 */

/* ---------------------------------------------------------------------------
 * 9 — Unit economics behind Gate 1's margin criterion.
 * ------------------------------------------------------------------------- */

export interface UnitCostLine {
  label: string;
  /** Rupees per book. */
  amountInr: number;
  /** Where the figure comes from, so an estimate can be replaced with a quote. */
  basis: string;
}

export interface UnitEconomicsInput {
  tier: string;
  priceInr: number;
  /** Where the price is transcribed from. */
  priceBasis: string;
  lines: UnitCostLine[];
}

export interface UnitEconomics extends UnitEconomicsInput {
  costInr: number;
  marginInr: number;
  /** Percent, 0–100. Derived — never typed. */
  marginPct: number;
}

/** The margin is computed from its parts, so it cannot drift from them. */
export function deriveUnitEconomics(input: UnitEconomicsInput): UnitEconomics {
  const costInr = input.lines.reduce((total, line) => total + line.amountInr, 0);
  const marginInr = input.priceInr - costInr;
  return {
    ...input,
    costInr,
    marginInr,
    marginPct: input.priceInr === 0 ? 0 : (marginInr / input.priceInr) * 100,
  };
}

/**
 * Grin Legacy's Book tier — the tier Gate 1's margin criterion is actually measured on.
 *
 * Every cost line is an estimate, deliberately conservative. The point of publishing
 * the arithmetic is not that these figures are right; it is that Gate 1's "50% margin"
 * becomes something a supplier quote can be checked against instead of a percentage
 * typed into a box.
 */
export const legacyBookEconomics: UnitEconomics = deriveUnitEconomics({
  tier: "Book (₹6,999)",
  priceInr: 6999,
  priceBasis: "Demo/DOCS — Grin Legacy pricing table, Book tier",
  lines: [
    {
      label: "Printing and binding",
      amountInr: 1450,
      basis: "Estimate — 120pp hardcover, single copy, no volume discount yet",
    },
    {
      label: "Shipping and packaging",
      amountInr: 320,
      basis: "Estimate — domestic courier plus protective packaging",
    },
    {
      label: "Payment processing",
      amountInr: 140,
      basis: "2.0% of the tier price — the one line that is not an estimate",
    },
    {
      label: "Transcription and editing",
      amountInr: 900,
      basis: "Estimate — outsourced per book at concierge volume",
    },
    {
      label: "Editorial labour",
      amountInr: 400,
      basis: "Estimate — prompt design and audio editing, founder time costed",
    },
  ],
});

/** Gate 1's margin criterion, as a number rather than an assertion. */
export const gateOneMarginFloorPct = 50;

/**
 * The pricing note promises "≥55% after print and shipping". These estimates land
 * between that promise and Gate 1's floor, which is the finding the table exists to
 * surface — not a number to be tuned until it looks comfortable.
 */
export const marginTargetPct = 55;

export const unitEconomicsNote =
  "Every cost line is a planning estimate with its basis shown. The margin is derived from " +
  "them, so replacing an estimate with a supplier quote moves the percentage without anyone " +
  "editing the percentage.";

/* ---------------------------------------------------------------------------
 * 3 — Cost model. The relay argument, made stress-testable.
 *
 * `costComparison` is transcribed prose ("2–3 people", "Moderate"). It cannot be
 * recomputed. This is a separate, explicit model of the one claim the prose makes:
 * that Legacy's margin funds GrinSocial, and GrinSocial funds Serendipity.
 * ------------------------------------------------------------------------- */

export interface CostAssumption {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** The plan's own assumption, used as the slider's starting position. */
  baseline: number;
  basis: string;
}

export const costAssumptions: CostAssumption[] = [
  {
    id: "booksPerMonth",
    label: "Books shipped per month",
    unit: "books",
    min: 10,
    max: 400,
    step: 10,
    baseline: 120,
    basis: "Plan: 250 customers by month 12, concierge build before that",
  },
  {
    id: "marginPct",
    label: "Legacy gross margin",
    unit: "%",
    min: 20,
    max: 75,
    step: 1,
    baseline: Math.round(legacyBookEconomics.marginPct),
    basis: "Derived from the unit economics above",
  },
  {
    id: "moderationPer1k",
    label: "Moderation cost per 1,000 conversations / month",
    unit: "INR",
    min: 2000,
    max: 40000,
    step: 500,
    baseline: 12000,
    basis:
      "Estimate — at 12k conversations a month this is roughly one moderator's salary plus tooling. " +
      "Anything much below this is automated review pretending to be moderation.",
  },
  {
    id: "cityLaunchCost",
    label: "Cost to launch one city",
    unit: "INR",
    min: 50000,
    max: 2000000,
    step: 50000,
    baseline: 400000,
    basis: "Estimate — local moderation staffing plus launch marketing",
  },
];

/** The plan's launch size for a GrinSocial city, held constant rather than slid. */
export const launchUsers = 1500;

/** Conversations per month a launched city generates, at `launchUsers`. */
export const launchConversations = 12000;

export type CostAssumptionValues = Record<string, number>;

export const baselineCostValues: CostAssumptionValues = Object.fromEntries(
  costAssumptions.map((assumption) => [assumption.id, assumption.baseline]),
);

export interface CostModelRow {
  label: string;
  /** Formatted for display, including its unit. */
  value: string;
  /** Raw number, for the break test. */
  raw: number;
  note: string;
  /** True when this is the first row that breaks the relay. */
  breaks: boolean;
}

export interface CostModelResult {
  rows: CostModelRow[];
  /** Null while the relay holds; the reason it fails otherwise. */
  breakPoint: string | null;
}

const inr = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

/**
 * Runs the relay arithmetic against a set of assumptions.
 *
 * The relay holds while Legacy's monthly contribution covers GrinSocial's moderation.
 * The first row that fails is the one marked, because that is the assumption worth
 * arguing about — everything after it is downstream of it.
 */
export function runCostModel(values: CostAssumptionValues = baselineCostValues): CostModelResult {
  const booksPerMonth = values.booksPerMonth ?? 120;
  const marginPct = values.marginPct ?? 50;
  const moderationPer1k = values.moderationPer1k ?? 1200;
  const cityLaunchCost = values.cityLaunchCost ?? 400000;

  const contribution = booksPerMonth * legacyBookEconomics.priceInr * (marginPct / 100);
  const moderation = (launchConversations / 1000) * moderationPer1k;
  const surplus = contribution - moderation;
  const monthsToNextCity = surplus > 0 ? Math.ceil(cityLaunchCost / surplus) : Infinity;

  // `raw` is the magnitude of each row, and `fails` is decided per row. They must be
  // kept apart: moderation is a cost, so its value is negative in the arithmetic, and
  // treating "non-positive" as "broken" would fail the relay at the plan's own numbers.
  const rows: CostModelRow[] = [
    {
      label: "Legacy contribution per month",
      value: inr(contribution),
      raw: contribution,
      note: `${booksPerMonth} books × ₹${legacyBookEconomics.priceInr} × ${marginPct}%`,
      breaks: contribution <= 0,
    },
    {
      label: "GrinSocial moderation per month",
      value: inr(moderation),
      raw: moderation,
      note: `${(launchConversations / 1000).toFixed(0)}k conversations × ${inr(moderationPer1k)} per 1,000`,
      breaks: false,
    },
    {
      label: "Surplus left to fund Wave 3",
      value: inr(surplus),
      raw: surplus,
      note: surplus > 0 ? "The relay holds at these assumptions" : "Legacy no longer funds the next wave",
      breaks: surplus <= 0,
    },
    {
      label: "Months to fund the next city",
      value: Number.isFinite(monthsToNextCity) ? `${monthsToNextCity} months` : "never",
      raw: monthsToNextCity,
      note: `${inr(cityLaunchCost)} per city`,
      breaks: !Number.isFinite(monthsToNextCity),
    },
  ];

  const firstFailure = rows.find((row) => row.breaks);

  return {
    rows,
    breakPoint: firstFailure
      ? firstFailure.label === "Months to fund the next city"
        ? "The relay holds but never funds a third product at these assumptions."
        : `The relay breaks at "${firstFailure.label}": Legacy's margin no longer covers GrinSocial's moderation.`
      : null,
  };
}

/* ---------------------------------------------------------------------------
 * 11 — Killing a product, as a procedure.
 *
 * Written before it is needed, on purpose. The plan is honest that products die
 * after two gate failures; the failure mode is not the decision but executing it
 * badly at 2am by someone who has never rehearsed it.
 * ------------------------------------------------------------------------- */

export interface KillStep {
  order: number;
  action: string;
  detail: string;
  /** A role, not a name — the checklist has to survive staff changes. */
  owner: string;
  /** What proves the step happened. */
  evidence: string;
}

export const killProcedure: KillStep[] = [
  {
    order: 1,
    action: "Stop spend the same day",
    detail:
      "Freeze all paid acquisition, contractor work and infrastructure that only this product uses. Nothing is committed before the post-mortem is written.",
    owner: "Founder",
    evidence: "Dated commit freezing the spend list",
  },
  {
    order: 2,
    action: "Record the decision with a date",
    detail:
      "The anti-drift rule requires the kill be written down. A paused product is worse than a dead one, so the record says killed, not paused.",
    owner: "Founder",
    evidence: "Entry in the gate history naming the gate and the failure count",
  },
  {
    order: 3,
    action: "Notify everyone who paid, with a real refund route",
    detail:
      "Individual messages, not a banner. State what happens to their data and give a refund address that a human reads.",
    owner: "Founder",
    evidence: "Sent-messages log plus the refund address in the notice",
  },
  {
    order: 4,
    action: "Honour every deletion request",
    detail:
      "DPDP erasure obligations outlive the product. Anything not deleted within the retention window is a live liability, not an archive.",
    owner: "Founder",
    evidence: "Deletion log with timestamps per record",
  },
  {
    order: 5,
    action: "Archive the repository, do not delete it",
    detail:
      "The code is the cheapest part of the product and the next wave may need it. Tag the final commit and mark the repo read-only.",
    owner: "Founder",
    evidence: "Tag name and the read-only setting on the repository",
  },
  {
    order: 6,
    action: "Sunset the domain with a forwarding notice",
    detail:
      "A dead domain that 404s strands people mid-grief. Redirect to a page that says what happened and where the data went.",
    owner: "Founder",
    evidence: "The sunset page, live at the old domain",
  },
  {
    order: 7,
    action: "Publish the post-mortem",
    detail:
      "What was believed, what was measured, which criterion failed and by how much. The portfolio's next gate decision is only as good as this document.",
    owner: "Founder",
    evidence: "Published page linked from the roadmap",
  },
];

/** The trigger, restated so the checklist cannot be read as advice. */
export const killTrigger =
  "Two gate failures on the same gate. Not two bad months, not a missed forecast — two recorded " +
  "failures of the same gate, which is what `antiDriftState` returns as killed.";

/* ---------------------------------------------------------------------------
 * 12 — The relay hand-off contract.
 *
 * `handsNextWave` says what a wave hands on. This says what the receiving wave is
 * entitled to expect, and what would count as evidence that it arrived.
 * ------------------------------------------------------------------------- */

export interface HandoffItem {
  id: string;
  obligation: string;
  from: string;
  to: string;
  /** What the receiving wave can point at to prove the obligation was met. */
  evidence: string;
  status: "owed" | "in-flight" | "delivered";
}

export const handoffContract: HandoffItem[] = [
  {
    id: "verified-adult",
    obligation: "A verified-adult pipeline that GrinSocial can reuse rather than rebuild",
    from: "Wave 1 · Grin Legacy",
    to: "Wave 2 · GrinSocial",
    evidence: "The 18+ check runs in shared code, and Wave 2 calls it instead of writing its own",
    status: "owed",
  },
  {
    id: "payment-rails",
    obligation: "Payment rails that already handle Indian pricing, tax and refunds",
    from: "Wave 1 · Grin Legacy",
    to: "Wave 2 · GrinSocial",
    evidence: "A second product takes payment without a new processor integration",
    status: "owed",
  },
  {
    id: "moderation-staffing",
    obligation: "Moderation staffing and an escalation path that exists before launch, not after",
    from: "Wave 1 · Grin Legacy",
    to: "Wave 2 · GrinSocial",
    evidence: "A named rota covering the launch window, and one rehearsed abuse escalation",
    status: "owed",
  },
  {
    id: "trust-safety-budget",
    obligation: "A funded trust-and-safety line in the budget, not a hope",
    from: "Wave 2 · GrinSocial",
    to: "Wave 3 · Serendipity",
    evidence: "Gate 2 criterion 4 is met with a real number attached",
    status: "owed",
  },
  {
    id: "age-assurance-opinion",
    obligation: "A written legal opinion on age assurance in every launch market",
    from: "Wave 2 · GrinSocial",
    to: "Wave 3 · Serendipity",
    evidence: "The opinion document, dated, naming the markets it covers",
    status: "owed",
  },
  {
    id: "shared-spine",
    obligation: "One monorepo that a new front-end inherits instead of copying",
    from: "Wave 1 · Grin Legacy",
    to: "Every later wave",
    evidence: "`packages/` holds identity, UI and API; a new app imports them",
    status: "delivered",
  },
];

/** A hand-off with nothing owed is a claim, not a contract. */
export function handoffOutstanding(items: HandoffItem[] = handoffContract): HandoffItem[] {
  return items.filter((item) => item.status !== "delivered");
}

/* ---------------------------------------------------------------------------
 * 4 — City readiness, operationalising Gate 2.
 * ------------------------------------------------------------------------- */

export type CityState = "candidate" | "waitlist-open" | "launching" | "live";

export interface CityReadiness {
  city: string;
  state: CityState;
  /** Zero until the waitlist actually opens — never an invented number. */
  waitlist: number;
  /** Moderators confirmed for the launch window. */
  moderators: number;
  targetMonth: number | null;
  note: string;
}

/** The plan's threshold: ~500 waitlist per city before it launches. */
export const cityWaitlistTarget = 500;

/**
 * No city has been chosen. These are the candidates the plan's market reasoning
 * implies, each with a waitlist of zero, because a table of invented waitlist
 * numbers would be exactly the fudging the gates exist to prevent.
 */
export const launchCities: CityReadiness[] = [
  {
    city: "Bengaluru",
    state: "candidate",
    waitlist: 0,
    moderators: 0,
    targetMonth: null,
    note: "Largest concentration of the plan's assumed early adopters; highest moderation cost.",
  },
  {
    city: "Pune",
    state: "candidate",
    waitlist: 0,
    moderators: 0,
    targetMonth: null,
    note: "Second choice — similar demographics, cheaper to staff a launch weekend.",
  },
  {
    city: "Delhi NCR",
    state: "candidate",
    waitlist: 0,
    moderators: 0,
    targetMonth: null,
    note: "Largest absolute market, but spread across satellite cities that behave differently.",
  },
];

/** True only when a city has earned its launch, by the plan's own number. */
export function cityReady(city: CityReadiness): boolean {
  return city.waitlist >= cityWaitlistTarget && city.moderators > 0;
}

/* ---------------------------------------------------------------------------
 * 10 — The consent artefact Legacy owes a family.
 *
 * The compliance table lists DPDP as an obligation. This is the form that
 * discharges it: printed per order, signed, dated, and kept.
 * ------------------------------------------------------------------------- */

export interface ConsentField {
  collected: string;
  why: string;
  retention: string;
  deletionRoute: string;
}

export interface ConsentArtefact {
  title: string;
  preamble: string;
  fields: ConsentField[];
  retentionWindow: string;
  deletionRoute: string;
  /** The questions the plan's compliance rows force an answer to. */
  undertakings: string[];
  signatureLines: string[];
}

export const consentArtefact: ConsentArtefact = {
  title: "Consent and retention record",
  preamble:
    "Grin Legacy records a living relative speaking about a person who may no longer be living. " +
    "This sheet records what was consented to, what is stored, for how long, and how it is " +
    "deleted. It is completed once per order, signed, dated, and kept for as long as the " +
    "recordings are.",
  fields: [
    {
      collected: "Storyteller's first name and preferred language",
      why: "To write prompts the storyteller can answer without help",
      retention: "Life of the archive, then 12 months",
      deletionRoute: "Written request to the address below",
    },
    {
      collected: "Voice recordings, unedited",
      why: "Transcription into the book, and the QR-linked audio the family keeps",
      retention: "Life of the archive; not used for training anything",
      deletionRoute: "Written request deletes the audio and every copy within 30 days",
    },
    {
      collected: "Transcribed and edited text",
      why: "The book itself, and the family archive",
      retention: "Life of the archive",
      deletionRoute: "Written request deletes the text and every copy within 30 days",
    },
    {
      collected: "Order contact details",
      why: "Delivery, and nothing else — no marketing without a separate consent",
      retention: "7 years, for tax records",
      deletionRoute: "Written request; statutory records may be retained longer",
    },
  ],
  retentionWindow:
    "Recordings and text are kept for the life of the family archive. Order records are kept " +
    "for seven years because tax law requires it. Nothing is kept longer than the longer of " +
    "those two, and nothing is sold.",
  deletionRoute:
    "Any family member named on the order may request deletion in writing. Deletion is " +
    "confirmed in writing within 30 days, naming what was deleted.",
  undertakings: [
    "The person signing is 18 or older, and consents on their own behalf.",
    "Where the storyteller is not the person signing, the signer confirms they may lawfully " +
      "share those recordings.",
    "No recording will be used to train a model, generate a synthetic voice, or impersonate " +
      "anyone living or dead.",
    "Who controls the archive after the storyteller dies is named here, in writing, before " +
      "the first prompt is sent.",
  ],
  signatureLines: [
    "Name of person consenting",
    "Relationship to the storyteller",
    "Who controls the archive after the storyteller dies",
    "Signature",
    "Date",
  ],
};
