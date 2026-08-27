import type {
  DocumentEntry,
  Gate,
  RelayTrack,
  SpineRow,
  TermDetail,
} from "./types";

/**
 * Portfolio-level content, transcribed from `Demo/DOCS/Grin-Three-Product-Plan.html`.
 */

export const portfolio = {
  name: "GrinLife",
  headline: "Three products, three paths — run as a relay, not a race.",
  lede: "You can ship all three as separate products. The decision that determines whether this works is not which products — it is whether they run in parallel or in staggered waves with kill gates. One of those is survivable. The other has a well-documented failure rate.",
  documentDate: "14 August 2026",
  scope: "Three-track portfolio structure, shared spine, brand architecture, capital plan",
  brandEssence:
    "GrinLife is a safe, growing home for friendships, joyful chance, and family memories — built one thoughtful step at a time.",
  personality: ["kind", "curious", "dependable"],
};

/** The single sentence the whole portfolio discipline rests on. */
export const relayRule = {
  rule: "Never more than one product in active build at a time.",
  gloss:
    "A product in market is allowed; a product in construction is not. Treat any exception as a formal decision with a written rationale, not a busy week.",
  evidence:
    "A census of small US software firms found follow-on products die in R&D at a 45% higher rate than all other project types — not because they are harder or the team lacks skill, but because of extemporary decisions to alter manpower allocations. Whichever product has paying customers pulls every engineer toward itself, continuously, and the other products quietly starve.",
  failureNote:
    "The failure is not dramatic. Nobody decides to kill track two. It just never ships, over and over, for eighteen months.",
};

/** §1 — The Fork. Two ways to run three products. */
export const fork = {
  parallel: {
    name: "Model 1 · Parallel",
    subtitle: "Three tracks live at once",
    points: [
      "Needs ~3 dedicated teams, or it degrades instantly",
      "Three go-to-markets, three support burdens, three brands to fund",
      "Context-switching tax on every founder decision",
      "Revenue product cannibalises the others' resources",
      "Realistic outcome: one mediocre product, two abandoned",
    ],
  },
  relay: {
    name: "Model 2 · Relay",
    subtitle: "Staggered launches, shared spine, kill gates",
    points: [
      "One track in Build, one in Grow, one in Idle — never two builds",
      "Each launch reuses ~60% of the previous track's code",
      "Track N's revenue funds Track N+1",
      "Explicit gate: a track only starts when the prior one hits its number",
      "Realistic outcome: 3 products live by month 30",
    ],
  },
};

/** §3 — Timeline. Six 6-month columns across 36 months. */
export const relayColumns = ["M0–6", "M6–12", "M12–18", "M18–24", "M24–30", "M30–36"];

export const relayLegend: { state: RelayTrack["cells"][number]["state"]; label: string }[] = [
  { state: "build", label: "Build" },
  { state: "grow", label: "Grow / operate" },
  { state: "idle", label: "Idle / maintenance only" },
  { state: "gate", label: "Kill gate" },
];

export const relayTracks: RelayTrack[] = [
  {
    product: "legacy",
    name: "Grin Legacy",
    wave: "Wave 1",
    cells: [
      { state: "build", label: "Build" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
    ],
  },
  {
    product: "social",
    name: "GrinSocial",
    wave: "Wave 2",
    cells: [
      { state: "idle", label: "—" },
      { state: "gate", label: "Gate 1" },
      { state: "build", label: "Build" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
      { state: "grow", label: "Grow" },
    ],
  },
  {
    product: "serendipity",
    name: "Serendipity",
    wave: "Wave 3 · separate entity",
    cells: [
      { state: "idle", label: "—" },
      { state: "idle", label: "—" },
      { state: "idle", label: "—" },
      { state: "gate", label: "Gate 2" },
      { state: "build", label: "Build" },
      { state: "grow", label: "Grow" },
    ],
  },
];

/** §4 — Shared Spine. */
export const spineIntro =
  "Three products does not have to mean three codebases. The one caveat in the \"don't build two products\" literature is telling: micro-apps are fine as long as they share the same code base. The portfolio only works if you build the spine once, deliberately, in Wave 1.";

export const spineRows: SpineRow[] = [
  { service: "Identity & auth", legacy: true, social: true, luck: true, builtIn: "Wave 1" },
  { service: "Messaging / realtime", legacy: true, social: true, luck: true, builtIn: "Wave 1" },
  { service: "Media pipeline (voice, transcode)", legacy: true, social: true, luck: false, builtIn: "Wave 1" },
  { service: "Transcription + LLM shaping", legacy: true, social: false, luck: false, builtIn: "Wave 1" },
  { service: "Billing & subscriptions", legacy: true, social: true, luck: true, builtIn: "Wave 1" },
  { service: "Consent / permanence engine", legacy: true, social: true, luck: true, builtIn: "Wave 1" },
  { service: "Groups & membership lifecycle", legacy: true, social: true, luck: false, builtIn: "Wave 2" },
  { service: "Matching engine (tag → random)", legacy: false, social: true, luck: true, builtIn: "Wave 2" },
  { service: "Trust & safety / moderation", legacy: true, social: true, luck: true, builtIn: "Wave 2, hardened in 3" },
  { service: "Age assurance", legacy: false, social: true, luck: true, builtIn: "Wave 2" },
];

export const spinePayoff =
  "By the time you build Serendipity in Wave 3, the matching engine, messaging, consent logic, moderation tooling and age assurance all already exist and are battle-tested by real users. Wave 3 becomes maybe eight weeks of work instead of six months. That is why the order matters more than the count.";

/** §5 — Brand Architecture. */
export const brandArchitecture = {
  intro:
    "Pure branded-house is cheapest and best for SEO and trust transfer, but it concentrates reputational risk — and one of your products is a reputational hazard. Pure house-of-brands isolates risk but triples marketing cost. So: hybrid.",
  endorsed: {
    heading: "Endorsed — shared equity",
    products: "Grin Legacy & GrinSocial",
    detail:
      "Same parent name, shared design system, one domain with subpaths, one SEO footprint, one support brand. Trust earned by Legacy flows straight into Social — and both are trust-positive categories, so the flow is safe in both directions.",
    domain: "grin.com/legacy · grin.com/social",
  },
  quarantined: {
    heading: "Quarantined — zero shared equity",
    products: "Serendipity (not \"GrinLuck\")",
    detail:
      "Separate legal entity, separate domain, separate company page, no shared founder bios, no cross-links, no \"a Grin company\" footer. Reuses the private codebase; shares nothing public-facing.",
    domain: "serendipity.app — unaffiliated in public",
  },
  holdFirm:
    "The name \"GrinLuck\" is the problem — it does exactly what risk isolation must prevent, by advertising the family connection in the product name itself. Drop the Grin prefix on Product A entirely.",
};

/** §6 — Gates. */
export const gates: Gate[] = [
  {
    id: "gate-1",
    month: 12,
    question: "May we start building GrinSocial?",
    unlocks: "social",
    criteria: [
      { n: "1", text: "250+ paying Legacy customers" },
      { n: "2", text: "Gross margin ≥ 50% after print and fulfilment" },
      { n: "3", text: "≥60% of storytellers complete 20+ stories" },
      { n: "4", text: "Legacy runs on ≤1 engineer's ongoing attention" },
    ],
    ifNotMet:
      "Do not start Wave 2. Spend another 6 months on Legacy or kill the company.",
    fudgeWarning:
      "Criterion 4 is the one founders fudge. If Legacy still eats the whole team, you do not have a product, you have a job.",
  },
  {
    id: "gate-2",
    month: 24,
    question: "May we start building Serendipity?",
    unlocks: "serendipity",
    criteria: [
      { n: "1", text: "Legacy profitable and self-running" },
      { n: "2", text: "GrinSocial D30 retention ≥ 25%" },
      { n: "3", text: "Moderation tooling handling real abuse reports at acceptable cost" },
      { n: "4", text: "Budget for a dedicated trust & safety hire" },
      { n: "5", text: "Written legal opinion on age assurance in every launch market" },
    ],
    ifNotMet:
      "Skip Wave 3 permanently. Nothing depends on it. A two-product company that is profitable beats a three-product company in litigation.",
  },
];

export const antiDriftRule = {
  rule: "Any track that fails its gate twice in a row gets killed, not paused.",
  gloss:
    "Paused products are worse than dead ones: they consume planning attention, roadmap space and founder guilt while producing nothing. Write the kill decision down with a date.",
};

/** §7 — Cost. */
export const costComparison: { line: string; relay: string; parallel: string }[] = [
  { line: "Team at month 6", relay: "2–3 people", parallel: "7–9 people" },
  { line: "Team at month 24", relay: "5–7 people", parallel: "12–15 people" },
  { line: "Capital to 3 products live", relay: "Largely self-funded after M12", parallel: "$1.5–3M up front" },
  { line: "Distinct brands to fund", relay: "2 (one endorsed pair + 1 isolated)", parallel: "3 full identities" },
  { line: "Codebases", relay: "1 monorepo, 3 front-ends", parallel: "3 diverging stacks" },
  { line: "Probability all 3 ship", relay: "Moderate", parallel: "Low" },
];

export const costClosing =
  "The relay isn't the cautious option — it's the one that actually gets you three products. Parallel feels faster for about four months and then permanently isn't.";

/** Document index, transcribed from `Demo/DOCS/README.html`. */
export const documents: DocumentEntry[] = [
  {
    order: 0,
    file: "Demo/DOCS/Grin-Three-Product-Plan.html",
    title: "Grin — Three-Product Portfolio Plan",
    kind: "Strategy · read second",
    wave: "Portfolio",
    summary:
      "The portfolio structure: relay vs parallel, the shared spine, brand architecture, capital plan, and the two kill gates that hold the whole thing together.",
  },
  {
    order: 1,
    file: "Demo/DOCS/1-Grin-Legacy-Phase-Plan.html",
    title: "Grin Legacy — Phase-Wise Product Plan",
    kind: "Wave 1 · Months 0–36 · Build now",
    wave: "Wave 1",
    summary:
      "WhatsApp voice memoirs → hardcover books. Phases 0–3, pricing in ₹ and $, completion levers, DPDP compliance, metrics to month 36. Gate 1 at M12: 250 customers · 50% margin · 60% completion · ≤1 engineer.",
  },
  {
    order: 2,
    file: "Demo/DOCS/2-GrinSocial-Phase-Plan.html",
    title: "GrinSocial — Phase-Wise Product Plan",
    kind: "Wave 2 · Months 12–36 · Blocked until Gate 1",
    wave: "Wave 2",
    summary:
      "Feed-free matching, one city at a time. Manual validation first, geo-locked launch, IT Rules 2021 intermediary duties, monetization without ads. Gate 2 at M24.",
  },
  {
    order: 3,
    file: "Demo/DOCS/3-Serendipity-Phase-Plan.html",
    title: "Serendipity — Phase-Wise Product Plan",
    kind: "Wave 3 · Months 24–36 · Conditional, skippable",
    wave: "Wave 3",
    summary:
      "Random pseudonymous chat, rebranded and quarantined in a separate legal entity. Safety layer built before the product. Four non-negotiable changes to the original spec. Skip permanently if Gate 2 is anything short of a clear pass.",
  },
  {
    order: 4,
    file: "Demo/DOCS/README.html",
    title: "Grin — Document Index",
    kind: "Index",
    wave: "Portfolio",
    summary:
      "Five documents. Two strategic, three operational. Verdict: C first, scoring 7.7 vs 4.2 and 3.6.",
  },
];

/** Sources cited by the portfolio plan. */
export const portfolioSources: string[] = [
  "Census of small/new US software firms: follow-on products complete R&D at a rate 45% below plan vs other project types, driven by manpower reallocation under customer pressure (Journal of Small Business Strategy)",
  "David Cummings on two products in one startup, incl. the \"shared code base\" exception and the recommendation to spin out with a dedicated team",
  "Casey Winters on second-product failure modes",
  "EasyBib/EasyResu.me post-mortem: 10 months and $25k lost to a parallel second product",
  "Brand architecture models and risk isolation (Vivaldi, Embark, Inkbot)",
  "A.M. v. Omegle; UK Online Safety Act age assurance (Ofcom, from 25 July 2025); digital-legacy startup mortality",
];

/** Reusable "short answer" framing used on the hub page. */
export const shortAnswer: TermDetail[] = [
  {
    term: "The case for three",
    detail:
      "Three independent shots at product-market fit instead of one. A merged plan has a single point of failure: if families don't buy memoir books, the whole thesis dies and the other two were never tested. Each product also gets its own correct business model instead of forcing a free mechanic and a paid artifact onto one pricing page.",
  },
  {
    term: "The case against three",
    detail:
      "Three products in parallel is the single most reliable way to get zero products. The mechanism is documented and boring: resources drift toward whichever product has paying customers.",
  },
  {
    term: "The resolution",
    detail:
      "Ship all three, but as a relay with hard gates. You still end up with three products — the gates only remove the mechanism that kills portfolios.",
  },
];
