import type { Phase, Product } from "./types";

/**
 * Wave 3 — Serendipity (formerly "GrinLuck").
 * Transcribed from `Demo/DOCS/3-Serendipity-Phase-Plan.html`.
 */

export const serendipity: Product = {
  id: "serendipity",
  name: "Serendipity",
  formerName: "GrinLuck",
  tagline: "Conversation before identity.",
  pitch:
    "Strangers matched at random for short, pseudonymous chats that vanish unless both choose to keep them.",
  wave: 3,
  months: "24–36",
  status: "conditional",
  statusLabel: "Conditional · build only if Gate 2 passes · safe to skip forever",
  accent: "violet",
  route: "/products/serendipity",
  brand: "quarantined",
  domain: "serendipity.app — unaffiliated in public",
  whyHere:
    "Highest legal exposure, zero proven revenue. Goes last, when you can fund trust & safety properly.",
  handsNextWave:
    "Nothing — and that's deliberate. Nothing downstream may depend on it, so it can be killed at any moment without collateral damage.",
  coreRisk:
    "You would be building the design the courts just declined to immunize. The downside isn't \"we wasted a year\" — it's a headline with your name in it.",
  readThisFirst: {
    heading: "Read this first — it is the whole document",
    body: [
      "This is the easiest product to build and by far the most dangerous to own.",
      "Omegle ran for 14 years, deployed AI filters and human moderators, cooperated with law enforcement — and still shut down on 8 November 2023. Not for lack of users. In A.M. v. Omegle, a court allowed product-design claims to proceed, treating the pairing mechanism itself as the platform's own conduct rather than third-party content. That crack in the liability shield, plus a settlement, ended a 14-year-old company run by one person who wrote that it was no longer sustainable \"financially nor psychologically.\"",
      "You would be building the design the courts just declined to immunize. That is not a reason to never do it — it is a reason to do it last, with money in the bank, with real safety infrastructure, in a separate legal entity, and with the option to walk away intact.",
      "Standing recommendation: if Gate 2 is anything short of a clear pass, skip this product permanently. Nothing else in the portfolio depends on it. A profitable two-product company beats a three-product company in court.",
    ],
  },
  onePage: [
    {
      term: "What it is",
      detail:
        "Strangers matched at random for short, pseudonymous chats that vanish unless both choose to keep them. Text only. Verified 18+ behind the scenes.",
    },
    {
      term: "The best mechanic",
      detail:
        "The mutual-consent Permanent button: both parties tap it and the chat persists into both accounts. Otherwise it's gone from user view at session end. Preserve it exactly as designed.",
    },
    {
      term: "Why last",
      detail:
        "Buildability is the least important variable here. This is a weekend of engineering and a decade of liability. Building it first means carrying A.M. v. Omegle-shaped risk and UK Online Safety Act age-assurance costs before you have a single rupee of revenue to defend yourself with.",
    },
    {
      term: "Core risk",
      detail:
        "Legal exposure and moderation cost. Easy to build ≠ cheap to own.",
    },
  ],
  metrics: {
    columns: ["Beta (M30)", "Open (M36)"],
    rows: [
      { metric: "Serious incidents", values: ["0", "0"] },
      { metric: "Median time-to-action on reports", values: ["<2h", "<1h"] },
      { metric: "Classifier recall, red-line categories", values: [">95%", ">98%"] },
      { metric: "Moderation cost / 1,000 chats", values: ["measured", "< revenue/1,000"] },
      { metric: "Users", values: ["5,000 capped", "50,000"] },
      { metric: "\"Permanent\" rate per chat pair", values: ["measure", ">4%"] },
    ],
  },
  risks: [
    {
      risk: "Minor accesses platform",
      severity: "Existential",
      mitigation:
        "Real age assurance, not self-declaration. Text-only. Paid entry as a friction layer. Immediate shutdown protocol if it happens anyway.",
    },
    {
      risk: "Moderation cost outruns revenue",
      severity: "High",
      mitigation:
        "Paid entry from day one. Cap growth rate deliberately. Measure cost per 1,000 chats monthly and treat it as the primary business metric.",
    },
    {
      risk: "Founder burnout",
      severity: "High",
      mitigation:
        "Take this seriously — Omegle's founder cited the psychological toll explicitly. Never let one person review abuse reports alone. Rotate duty, fund counselling, cap exposure hours.",
    },
    {
      risk: "Brand contamination",
      severity: "Medium",
      mitigation:
        "Separate entity, separate name, zero public linkage. Verify quarterly that no press, footer, or app-store listing connects the two.",
    },
    {
      risk: "No moat",
      severity: "Accepted",
      mitigation:
        "Accept it. A competent developer clones the mechanic in a weekend. Your only durable advantage is being the safe, trusted, moderated option — which is precisely what the safety-first build order buys you.",
    },
  ],
  compliance: [
    {
      obligation: "All IT Rules 2021 duties",
      detail:
        "Grievance Officer, 24h acknowledgement, 15-day resolution, 24h takedown for intimate imagery and impersonation, 180-day retention of removed content, published policies.",
    },
    {
      obligation: "Age assurance, seriously",
      detail:
        "Under-18s are children under the DPDP Act. A date-of-birth field is not compliance. Use ID, payment, or biometric estimation — and accept the conversion loss as the cost of operating legally.",
    },
    {
      obligation: "UK / EU exposure",
      detail:
        "If you accept UK users, the Online Safety Act's \"highly effective age assurance\" applies, with penalties to £18M or 10% of global turnover. Simplest answer: geo-block the UK and EU at launch. Serve India first.",
    },
    {
      obligation: "Mandated reporting",
      detail:
        "A documented, tested CSAM detection and reporting pipeline with law-enforcement contacts established before launch. This is not a feature to add later.",
    },
  ],
  sources: [
    "A.M. v. Omegle — product-design claims allowed past §230, settled Nov 2023; Omegle shut down 8 November 2023",
    "Leif K-Brooks farewell statement on financial and psychological unsustainability",
    "UK Online Safety Act age assurance from 25 July 2025, penalties to £18M or 10% global turnover (Ofcom)",
    "IT Rules 2021 intermediary duties (MeitY/PIB)",
    "DPDP Act 2023 & Rules 2025, under-18 threshold",
  ],
};

/** §1 — Four non-negotiable changes. */
export const nonNegotiables: { original: string; replace: string; why: string }[] = [
  {
    original: "Full anonymity — no signup",
    replace: "Pseudonymity — anonymous to each other, known to you",
    why:
      "Users still talk to \"Stranger.\" But every account is verified 18+ behind the scenes, so bad actors are traceable and bannable. Removes the largest single category of risk at almost no cost to the experience.",
  },
  {
    original: "RAM-only chats — no logs ever",
    replace: "Ephemeral to users — short encrypted safety log",
    why:
      "\"No logs\" means no evidence, no actionable reports, no law-enforcement cooperation — exactly the fact pattern regulators call negligent design. And it's incompatible with India's 180-day retention duty for removed content.",
  },
  {
    original: "Video roulette",
    replace: "Text only. Voice much later, if ever.",
    why:
      "Live video abuse happens in real time and cannot be reviewed after the fact. Text is machine-scannable before delivery. This single choice removes most of Omegle's actual harm surface.",
  },
  {
    original: "Name \"GrinLuck\"",
    replace: "\"Serendipity\" — no Grin prefix",
    why:
      "Risk isolation is the entire reason to run a separate brand. A shared prefix advertises the family connection in the product name and throws that isolation away for free.",
  },
];

/** §2 — Structure. */
export const structure: { item: string; detail: string }[] = [
  {
    item: "Separate company",
    detail:
      "Its own private limited company. Licenses the shared codebase from the parent on arm's-length terms. Liability does not flow to the entity holding your paying Legacy customers.",
  },
  {
    item: "No public linkage",
    detail:
      "Separate domain, separate support, separate social accounts. No \"a Grin company\" footer, no shared founder bios, no cross-promotion, no shared app-store developer account.",
  },
  {
    item: "Own insurance",
    detail:
      "Tech E&O and media liability, priced for this category specifically. Get quotes before you build — the premium is itself a useful signal about whether this is viable.",
  },
  {
    item: "Own kill switch",
    detail:
      "Documented plan to shut down in 48 hours: user notification, data deletion, law-enforcement contact, public statement. Write it before launch, while you're calm.",
  },
];

export const serendipityPhases: Phase[] = [
  {
    id: "serendipity-phase-1",
    product: "serendipity",
    index: 1,
    label: "Phase 1",
    window: "Months 24–26",
    title: "Safety first, literally",
    kidWords: "We build the safety net before we let anyone climb.",
    summary:
      "Inverted build order on purpose. The matching and chat are a fortnight's work — most of it inherited from GrinSocial. The safety infrastructure is the actual product, and it must exist before the first user.",
    blocks: [
      {
        kind: "list",
        heading: "Why the product itself is cheap",
        items: [
          "Because Waves 1 and 2 built messaging, matching, consent, moderation and age assurance, Serendipity is roughly 8 weeks of work instead of 6 months.",
          "That's the entire argument for building it last rather than first.",
        ],
      },
    ],
    sprints: [
      { sprint: "1st", ships: "Age assurance — verified 18+ at signup", reuse: "Inherited from Wave 2", shared: true },
      {
        sprint: "2nd",
        ships: "Real-time text classification before delivery",
        reuse: "New — the core safety asset",
        shared: false,
      },
      {
        sprint: "3rd",
        ships: "In-chat report button + human review queue",
        reuse: "Inherited from Wave 2",
        shared: true,
      },
      {
        sprint: "4th",
        ships: "Grievance Officer workflow, 24h ack / 15-day resolve",
        reuse: "Inherited from Wave 2",
        shared: true,
      },
      {
        sprint: "5th",
        ships: "Device/IP ban infrastructure that survives re-signup",
        reuse: "New",
        shared: false,
      },
      {
        sprint: "6th",
        ships: "CSAM hash-matching + mandated reporting pipeline",
        reuse: "New — non-negotiable",
        shared: false,
      },
      {
        sprint: "Only then",
        ships: "Random matching + ephemeral chat + Permanent button",
        reuse: "~2 weeks, mostly inherited",
        shared: true,
      },
    ],
    exitCriteria: ["Every safety layer live and tested before the first user is admitted"],
  },
  {
    id: "serendipity-phase-2",
    product: "serendipity",
    index: 2,
    label: "Phase 2",
    window: "Months 26–30",
    title: "Small, invite-only, watched closely",
    kidWords: "We open to a few thousand people and watch every conversation carefully.",
    summary:
      "Do not open this to the public on day one. You are measuring one thing: what fraction of conversations go wrong, and what does it cost to catch them?",
    blocks: [
      {
        kind: "list",
        heading: "Beta constraints",
        items: [
          "Cap at 5,000 invited users. Recruit from GrinSocial's existing verified adults — already age-verified and accountable.",
          "Text only, English + Hindi. Your classifier must actually work in the languages you allow. Do not enable a language you cannot moderate.",
          "Operating hours at first. Matching live only when a human moderator is on shift. Unglamorous and enormously protective.",
          "The Permanent button. Both parties tap it → the chat persists into both accounts. Otherwise it's gone from user view at session end. This is the one mechanic worth preserving exactly as designed.",
          "Instrument everything. Reports per 1,000 chats, time-to-action, classifier precision/recall, repeat-offender rate, moderator cost per 1,000 conversations.",
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "Serious-incident rate below your pre-set threshold",
      "Median time-to-action under 2 hours",
      "Moderation cost per 1,000 chats known and affordable",
      "Zero CSAM incidents mishandled",
      "Classifier recall >95% on your red-line categories",
    ],
    killSignal:
      "Any single incident involving a minor, or moderation cost exceeding plausible lifetime revenue per user, ends the product. Not a pause — a shutdown, using the kill-switch plan you wrote in Phase 1.",
  },
  {
    id: "serendipity-phase-3",
    product: "serendipity",
    index: 3,
    label: "Phase 3",
    window: "Months 30–36",
    title: "Open carefully, monetize honestly",
    kidWords: "We charge a small amount so the helpers can keep everyone safe.",
    summary:
      "Omegle never solved the revenue problem in 14 years. It was free and ad-supported, advertisers refused the category, and there was no subscription revenue to fund moderation or legal defence. You must have an answer before you scale, because scale increases your costs faster than your revenue.",
    blocks: [
      {
        kind: "table",
        heading: "Revenue models",
        head: ["Model", "Assessment"],
        rows: [
          {
            term: "Paid entry · ₹49 one-time",
            detail:
              "Best option. A tiny fee is a serious quality filter — it deters throwaway accounts, funds moderation, and creates a payment trail that makes bans stick. Frame it as \"we don't sell your data; this keeps it safe.\"",
          },
          {
            term: "Subscription · ₹99/mo",
            detail:
              "Viable for extras: interest-filtered matching, more daily chats, keeping more permanent connections.",
          },
          {
            term: "Advertising",
            detail:
              "Rule it out. Advertisers abandoned Omegle as its reputation deteriorated; the category is uninsurable from a brand-safety perspective.",
          },
          {
            term: "Free at scale",
            detail:
              "The trap that killed Omegle. Free + anonymous + huge = unbounded moderation cost against zero revenue. Never let usage grow faster than your ability to moderate it.",
          },
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "Moderation cost per 1,000 chats below revenue per 1,000",
      "\"Permanent\" rate >4% per chat pair",
      "Zero serious incidents",
    ],
  },
];

export const serendipityClosing =
  "Serendipity is the most emotionally compelling idea of the three. \"Conversation before identity\" is a genuinely good insight, and the mutual-consent Permanent button is the single best mechanic in all the original documents. Build it third, build it small, build it safe, and keep the door open to never building it at all. That option to walk away is worth more than the product.";
