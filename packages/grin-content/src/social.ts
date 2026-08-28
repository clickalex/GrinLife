import type { Phase, PricingTier, Product } from "./types";

/**
 * Wave 2 — GrinSocial.
 * Transcribed from `Demo/DOCS/2-GrinSocial-Phase-Plan.html`.
 */

export const social: Product = {
  id: "social",
  name: "GrinSocial",
  tagline: "Preference-driven, feed-free connection.",
  pitch:
    "No infinite scroll, no follower counts — just capped matching and purpose-built groups that clean themselves up.",
  wave: 2,
  months: "12–36",
  status: "blocked",
  statusLabel: "Blocked until Gate 1 passes · do not start early",
  accent: "moss",
  route: "/products/social",
  brand: "endorsed",
  domain: "grin.com/social",
  whyHere: "Needs seeded density to not feel empty. Wave 1 supplies the seed population.",
  handsNextWave:
    "The matching engine + group system + moderation tooling — which is roughly 80% of Product A's backend.",
  coreRisk:
    "Empty-room problem. Followed closely by weak monetization — platonic matching has no deadline and no urgency, unlike dating.",
  readThisFirst: {
    heading: "Read this before anything else",
    body: [
      "This is the hardest of the three products, and its difficulty is invisible.",
      "Legacy is hard to operate but easy to validate: someone pays or they don't. GrinSocial is easy to build and brutally hard to make work, because it needs local density before it delivers any value at all. 1,000 users spread across India produces zero good matches. 1,000 users in Lucknow produces a product.",
      "Bumble spun BFF into a standalone app and users describe it as barren — waves sent with no reciprocation, no matches, nobody knowing how to use it. That's a company with a global brand and enormous budget failing at exactly this. Your only real advantage is that Wave 1 hands you a warm, geographically clustered seed population. Do not squander it by launching everywhere at once.",
    ],
  },
  onePage: [
    {
      term: "What it is",
      detail:
        "You set preferences — interests, sport, city, travel plans. The system matches you with 5–10 people a week via tag overlap. No feed, no scroll, no profiles to perform. Groups are purpose-built (location, sport, trip) and auto-archive when their purpose ends.",
    },
    {
      term: "Who it's for",
      detail:
        "Adults 25–45 who've moved city for work or study, are past the swipe-app phase, and want a small number of real connections rather than a feed to consume.",
    },
    {
      term: "Wedge",
      detail:
        "One city, one vertical, at a time. Start where Wave 1 already gave you users and where you personally have ground presence.",
    },
    {
      term: "Core risk",
      detail:
        "Empty-room problem. Followed closely by weak monetization — platonic matching has no deadline and no urgency, unlike dating.",
    },
  ],
  metrics: {
    columns: ["M18", "M24", "M36"],
    rows: [
      { metric: "Cities live", values: ["1", "3", "8"] },
      { metric: "Users", values: ["1,500", "10,000", "60,000"] },
      { metric: "D30 retention", values: ["20%", "25%", "32%"] },
      { metric: "Match→reply rate", values: ["55%", "60%", "65%"] },
      { metric: "Grievance SLA compliance", values: ["100%", "100%", "100%"] },
      { metric: "Paid conversion", values: ["—", "3%", "6%"] },
    ],
  },
  risks: [
    {
      risk: "Empty room",
      severity: "Most likely failure",
      mitigation:
        "Geo-lock, waitlist gating, relaxed early caps, never show an empty week, events to manufacture density.",
    },
    {
      risk: "Gender imbalance",
      severity: "High",
      mitigation:
        "Platonic apps in India skew heavily male and become unusable for women. Consider women-only matching options, women-first group seeding, and strict verification. Monitor ratio weekly from day one.",
    },
    {
      risk: "Becomes a dating app",
      severity: "High",
      mitigation:
        'Every platonic app drifts this way. Explicit community standards, an "intent" preference, fast enforcement on unwanted romantic advances.',
    },
    {
      risk: "Moderation cost",
      severity: "Medium",
      mitigation:
        "Track cost per user monthly. If it exceeds revenue per user at scale, the model is broken — find out at 10,000 users, not 500,000.",
    },
    {
      risk: "Safe-harbour loss",
      severity: "Medium",
      mitigation:
        "Missing grievance SLAs risks intermediary protection. Automate acknowledgement within minutes; never let the 24-hour clock depend on someone remembering.",
    },
  ],
  compliance: [
    {
      obligation: "Grievance Officer — IT Rules 2021, Rule 3(2)",
      detail:
        "Named officer with published contact details. Acknowledge complaints within 24 hours, resolve within 15 days. Must exist before your first user. This is a hard SLA — missing it repeatedly risks safe-harbour protection.",
    },
    {
      obligation: "24-hour takedown",
      detail:
        "Non-consensual intimate imagery, morphed images and impersonation must be removed within 24 hours of complaint. You need an on-call human, not just a queue.",
    },
    {
      obligation: "Published policies",
      detail:
        "ToS, privacy policy and community standards, in English and relevant Eighth Schedule languages. Content categories must be spelled out.",
    },
    {
      obligation: "Age assurance — DPDP Act",
      detail:
        "A child is anyone under 18, requiring verifiable parental consent plus a ban on behavioural tracking and targeted ads for minors. Practically: make GrinSocial 18+ and verify it. A birth-date field does not comply.",
    },
    {
      obligation: "Data retention",
      detail:
        'Removed content and related records retained 180 days for law enforcement. Note the tension with "ephemeral by default" — see below.',
    },
    {
      obligation: "SSMI threshold",
      detail:
        "At 5 million registered Indian users you must appoint a Chief Compliance Officer, a 24×7 Nodal Contact Person and a Resident Grievance Officer, all India-resident, plus monthly public compliance reports. A good problem — but plan the org for it.",
    },
  ],
  sources: [
    "IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021 — Grievance Officer, 24h acknowledgement / 15-day resolution, 24h takedown, 180-day retention, 5M-user SSMI threshold (MeitY/PIB)",
    "DPDP Act 2023 & Rules 2025 — under-18 definition, verifiable parental consent, ban on targeted ads to minors",
    "Bumble BFF standalone-app user reports 2025–26",
    "Andrew Chen on local network saturation and why big unfocused launches fail",
  ],
};

export const socialPhases: Phase[] = [
  {
    id: "social-phase-0",
    product: "social",
    index: 0,
    label: "Phase 0",
    window: "Months 12–13",
    title: "Run it manually in one city first",
    kidWords: "We match people by hand first, to learn what makes a good match before a computer tries.",
    summary:
      "Before writing a line of matching code, prove people want the match. This is a WhatsApp-and-spreadsheet exercise.",
    blocks: [
      {
        kind: "table",
        heading: "Steps",
        head: ["Step", "Detail"],
        rows: [
          {
            term: "Recruit 100 people",
            detail:
              "One city (Lucknow or your densest Wave-1 cluster). Google Form for preferences. Recruit from Legacy customers' adult children, local running/cycling/book groups, coworking spaces.",
          },
          {
            term: "Match by hand",
            detail:
              "You personally pair people weekly and introduce them over WhatsApp. 6 weeks. Painful and irreplaceable — you learn what actually predicts a good match.",
          },
          {
            term: "Measure honestly",
            detail:
              "What % of intros produce a reply? A conversation past 10 messages? A real-world meeting? If hand-picked matches by a human who knows both parties don't convert, an algorithm will do worse.",
          },
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "≥40% of intros get a reply",
      "≥20% reach a real conversation",
      "≥8% meet in person",
      "≥30 of the 100 ask you to keep going when you stop",
    ],
    killSignal:
      "Below those numbers, do not build. Redirect the engineering into Legacy's Phase 3 add-ons, which have proven demand.",
  },
  {
    id: "social-phase-1",
    product: "social",
    index: 1,
    label: "Phase 1",
    window: "Months 13–18",
    title: "Ship to a single city, deliberately",
    kidWords: "We open in one city only. Too many empty rooms at once is how these apps die.",
    summary:
      "Geo-lock the product. Yes, really — refuse signups outside the launch city. Local network saturation is the proven answer to cold start; a big unfocused launch lowers density and kills you.",
    blocks: [
      {
        kind: "list",
        heading: "Design decisions that determine survival",
        items: [
          "Relax the cap at launch — 5–10 matches/week is correct at maturity and fatal at launch. Start at 10–15 and tighten as density grows. An empty week is the #1 churn event.",
          "Never show an empty week — if no good match exists, surface a group, a local event, or an honest \"the city's still filling up — here's who joined this week.\" Silence reads as abandonment.",
          'Kill the ghosting spiral — Bumble BFF\'s "both must speak in 72h or it expires" mechanic was widely hated. Use gentle expiry with a one-tap "still interested" instead of a hard clock.',
          "Events beat matching — the two patterns that actually work for friendship are events and pre-existing communities. Build a lightweight local-event layer early; it creates density that pure matching cannot.",
        ],
      },
      {
        kind: "list",
        heading: "The ephemerality conflict — resolve it now",
        items: [
          'Product A\'s "chats live in RAM only, never touch a database" cannot coexist with a 24-hour takedown duty, a 15-day grievance process and 180-day retention of removed content.',
          "Resolution: chats are ephemeral to users — auto-deleted from their view unless both consent to persist — while a short-window encrypted server-side log exists solely for safety and legal response, with retention stated plainly in the privacy policy.",
          "Users get the ephemeral experience; you keep the ability to answer a court order.",
        ],
      },
    ],
    sprints: [
      {
        sprint: "M13",
        ships: "Preference model, tag taxonomy, onboarding",
        reuse: "Auth, identity",
        shared: true,
      },
      {
        sprint: "M14",
        ships: "Matching engine — tag overlap + geo + weekly cap",
        reuse: "New (Wave 3 inherits this)",
        shared: true,
      },
      {
        sprint: "M15",
        ships: "1:1 messaging with mutual-consent persistence",
        reuse: "Messaging + consent engine",
        shared: true,
      },
      {
        sprint: "M16",
        ships: "Groups: location / sport / journey + auto-archive",
        reuse: "Group lifecycle from family circles",
        shared: true,
      },
      {
        sprint: "M17",
        ships: "Trust & safety: reporting, blocking, grievance workflow",
        reuse: "New — legally mandatory",
        shared: true,
      },
      {
        sprint: "M18",
        ships: "Preference evolution + grace periods, age assurance",
        reuse: "New (Wave 3 inherits)",
        shared: true,
      },
    ],
    exitCriteria: [
      "1,500 users in one city",
      "≥60% receive a match they reply to in week 1",
      "D30 retention ≥20%",
      "At least 25 active groups",
    ],
  },
  {
    id: "social-phase-2",
    product: "social",
    index: 2,
    label: "Phase 2",
    window: "Months 18–24",
    title: "Only expand after city one is genuinely alive",
    kidWords: "The first city has to feel busy before we open the second door.",
    summary:
      "The temptation to open nationally will be enormous. Resist it. A second city only opens when the first hits its density and retention numbers — then use the exact same playbook, which you now have written down.",
    blocks: [
      {
        kind: "list",
        heading: "Expansion rules",
        items: [
          "Waitlist by city. Collect signups from everywhere; activate a city only at ~500 waitlisted. Scarcity also creates launch energy.",
          'Vertical density beats geographic spread. "Runners in Lucknow" works at 300 people. "Everyone in North India" fails at 3,000.',
          "Groups become the retention engine. 1:1 matching brings people in; groups keep them. Track group health, not just match counts.",
          "Journey groups are your differentiator. Trip-specific groups that auto-archive are genuinely novel — lean into travel as a wedge vertical.",
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "3 cities live",
      "10,000 total users",
      "D30 retention ≥25%",
      "Moderation cost per user tracked and sustainable",
      "Abuse report rate stable",
    ],
  },
  {
    id: "social-phase-3",
    product: "social",
    index: 3,
    label: "Phase 3",
    window: "Months 24–36",
    title: "Charge without a feed to sell ads against",
    kidWords: "We do not sell attention. People pay for the good parts instead.",
    summary:
      "You removed the feed, so advertising is out — which is a feature, not a bug, but it means subscription and transaction revenue must carry the product.",
    blocks: [
      {
        kind: "list",
        heading: "Honest expectation",
        items: [
          "GrinSocial will likely be the least profitable of the three for a long time.",
          "Its strategic value is that it builds the matching engine, moderation tooling and age assurance that Wave 3 inherits — and it creates a large top-of-funnel that Legacy can sell into.",
          "Judge it on retention and infrastructure, not on early revenue.",
        ],
      },
    ],
    sprints: [],
    exitCriteria: ["Paid conversion ≥6% by M36", "Events revenue the largest single line"],
  },
];

export const socialPricing: PricingTier[] = [
  {
    name: "Free tier",
    featured: true,
    india: "₹0",
    international: "Free",
    includes: "Matching + groups. Density is the product; never paywall the core.",
  },
  {
    name: "GrinSocial+",
    india: "₹199/mo",
    international: "Subscription",
    includes:
      "Create unlimited groups, travel-mode matching ahead of a trip, finer preference control, see who joined your city.",
  },
  {
    name: "Events",
    india: "10–15% fee",
    international: "Take rate",
    includes:
      "Paid local meetups — dinners, runs, treks. Timeleft proved people pay for structured IRL. Likely your best revenue line.",
  },
  {
    name: "Verified communities",
    india: "₹5k+/mo",
    international: "B2B2C",
    includes:
      "Running clubs, alumni bodies, coworking spaces pay for a managed group with tools. Far better unit economics than consumer subs.",
  },
];
