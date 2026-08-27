import type { Phase, PricingTier, Product } from "./types";

/**
 * Wave 1 — Grin Legacy.
 * Transcribed from `Demo/DOCS/1-Grin-Legacy-Phase-Plan.html`.
 */

export const legacy: Product = {
  id: "legacy",
  name: "Grin Legacy",
  tagline: "Guided family storytelling that ends in a beautiful printed book.",
  pitch:
    "A weekly prompt arrives on WhatsApp. A parent or grandparent answers by voice. AI transcribes and lightly shapes it into prose. After ~30 stories, the family receives a hardcover book with QR codes that play the original voice.",
  wave: 1,
  months: "0–36",
  status: "build-now",
  statusLabel: "Build first · funds Waves 2 and 3",
  accent: "honey",
  route: "/products/legacy",
  brand: "endorsed",
  domain: "grin.com/legacy",
  whyHere: "Only one that bills a customer with zero network. Funds everything else.",
  handsNextWave:
    "Cash + the shared spine (auth, media pipeline, transcription, billing, storage) + families already inviting relatives.",
  coreRisk:
    "Completion, not acquisition. If storytellers quit at story #6, you ship no books and refunds spike. Every phase is designed around completion rate.",
  onePage: [
    {
      term: "What it is",
      detail:
        "A weekly prompt arrives on WhatsApp. A parent or grandparent answers by voice. AI transcribes and lightly shapes it into prose. After ~30 stories, the family receives a hardcover book with QR codes that play the original voice.",
    },
    {
      term: "Who buys",
      detail:
        "An adult child aged 35–55, buying for a parent aged 60–85. Buyer ≠ user. This is a gift purchase with an emotional trigger and a deadline.",
    },
    {
      term: "Trigger events",
      detail:
        "Birthdays (esp. 60/70/75/80), Diwali, retirement, a diagnosis, a grandchild's birth, a death in the extended family, NRI children visiting home.",
    },
    {
      term: "Why it wins",
      detail:
        "Full value delivered to user #1 with an empty network. Competitors charge $59–$1,500 today, proving willingness to pay. WhatsApp-voice + Indian-language delivery is a genuine, unserved wedge.",
    },
    {
      term: "Core risk",
      detail:
        "Completion, not acquisition. If storytellers quit at story #6, you ship no books and refunds spike.",
    },
  ],
  metrics: {
    columns: ["M6", "M12", "M24", "M36"],
    rows: [
      { metric: "Paying customers (cumulative)", values: ["75", "250", "1,200", "3,500"] },
      { metric: "Story-20 completion rate", values: ["50%", "60%", "70%", "75%"] },
      { metric: "Gross margin", values: ["45%", "50%", "58%", "62%"] },
      { metric: "Extra-copy attach rate", values: ["—", "30%", "40%", "45%"] },
      { metric: "Referral-driven share of new sales", values: ["—", "15%", "30%", "40%"] },
    ],
  },
  risks: [
    {
      risk: "Storyteller abandons",
      severity: "Most likely failure",
      mitigation:
        "All four completion levers in Phase 2. Also: promise the book at 20 stories, not 52 — a shippable artifact beats a perfect one.",
    },
    {
      risk: "Print quality disappoints",
      severity: "High",
      mitigation:
        "The artifact is the product. Order samples from 3 printers before launch. Every book human-reviewed pre-print through at least the first 200.",
    },
    {
      risk: "AI mangles dialect",
      severity: "High",
      mitigation:
        "Whisper is weak on Awadhi/Bhojpuri. Budget human transcription for Indic languages initially — and price that in rather than shipping garbage.",
    },
    {
      risk: "Storyteller dies mid-project",
      severity: "Certain",
      mitigation:
        "It will happen. Have a compassionate protocol: pause billing immediately, offer to produce the book from whatever exists, free of charge. Handled well, these become your most powerful advocates.",
    },
    {
      risk: "WhatsApp policy change",
      severity: "Medium",
      mitigation:
        "Platform dependency is real. Keep an SMS + email + voice-call fallback path working from month 6.",
    },
  ],
  compliance: [
    {
      obligation: "DPDP Act 2023",
      detail:
        "Full compliance required by 13 May 2027 under the phased rollout. Needed: clear consent notice (available in relevant Eighth Schedule languages), purpose limitation, breach notification, and honouring erasure requests. Penalties reach ₹250 crore for security failures.",
    },
    {
      obligation: "Children's data",
      detail:
        "A \"child\" is anyone under 18 and requires verifiable parental consent. Family archives contain grandchildren — so gate any under-18 contributor behind a parent account. Simplest v1 answer: contributors must be 18+.",
    },
    {
      obligation: "Deceased persons",
      detail:
        "DPDP is largely silent here. Get contractual clarity in your ToS on who controls an archive after the storyteller dies — this is where family disputes will land.",
    },
    {
      obligation: "Not an intermediary",
      detail:
        "Legacy is private, not user-to-user public content, so IT Rules 2021 intermediary duties largely don't bite. This changes completely in Wave 2.",
    },
  ],
  sources: [
    "StoryWorth/Remento/KindredTales pricing benchmarks",
    "DPDP Act 2023 & DPDP Rules 2025 (MeitY, phased to 13 May 2027)",
    "Digital-legacy startup mortality (The Digital Beyond)",
    "Consumer cloud shutdown post-mortems",
  ],
};

export const legacyPhases: Phase[] = [
  {
    id: "legacy-phase-0",
    product: "legacy",
    index: 0,
    label: "Phase 0",
    window: "Weeks 1–3",
    title: "Sell it before you build it",
    kidWords: "Before we build anything, we ask real families whether they want it — and whether they will pay.",
    summary:
      "Zero code. The goal is a signed rupee, not a working product. If you cannot sell this manually to warm contacts, no amount of engineering fixes it.",
    blocks: [
      {
        kind: "table",
        heading: "Build",
        head: ["Item", "Detail"],
        rows: [
          {
            term: "Landing page",
            detail:
              "One page. Sample book photos, 3 sample stories, one price, one CTA. Razorpay/Stripe checkout. Carrd or a static page — no framework.",
          },
          {
            term: "Fake-door test",
            detail:
              "Run ₹15–25k of Meta/Instagram ads at NRI + tier-1 Indian audiences. Measure checkout-start rate, not clicks.",
          },
          {
            term: "Concierge delivery",
            detail:
              "First 10 customers served entirely by hand. You personally WhatsApp the prompts, download the voice notes, run Whisper, edit the prose. Manual is the point — it's how you learn the prompts.",
          },
          {
            term: "Prompt library v1",
            detail:
              "52 questions, culturally specific. Not \"describe your childhood\" but \"What did your mother cook on festival days, and who helped her?\"",
          },
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "10 paid orders from warm outreach",
      "At least 3 from strangers via ads",
      "CAC under ₹2,000",
      "You have personally heard 30+ voice notes",
    ],
    killSignal:
      "Fewer than 4 paid orders in 3 weeks. Retest the positioning once (gift vs self-purchase), then stop.",
  },
  {
    id: "legacy-phase-1",
    product: "legacy",
    index: 1,
    label: "Phase 1",
    window: "Months 1–6",
    title: "Automate only what hurt",
    kidWords: "Now we build the machines for the boring parts — and the parts every later product will need too.",
    summary:
      "You now know exactly which manual steps consumed your time. Automate those and nothing else. This phase also builds the shared spine that Waves 2 and 3 inherit.",
    blocks: [
      {
        kind: "table",
        heading: "Stack & vendors",
        head: ["App", "Choice"],
        rows: [
          {
            term: "App",
            detail:
              "Next.js + Postgres + S3-compatible object storage. Monorepo from day one — this becomes all three products.",
          },
          {
            term: "Messaging",
            detail:
              "WhatsApp Business API via Meta BSP. Budget conversation-template costs per user per week.",
          },
          {
            term: "AI",
            detail:
              "Whisper (or Indic ASR for Hindi/Bhojpuri/Awadhi) + an LLM pass. Always human-reviewed before print.",
          },
          {
            term: "Print",
            detail:
              "Local Indian POD partner for domestic; Lulu/Blurb API for international. Never hold inventory.",
          },
        ],
      },
    ],
    sprints: [
      { sprint: "M1", ships: "WhatsApp Business API + scheduled prompt engine", reuse: "Messaging layer", shared: true },
      { sprint: "M2", ships: "Voice ingest, storage, Whisper transcription", reuse: "Media pipeline", shared: true },
      { sprint: "M3", ships: "LLM prose shaping + human review queue", reuse: "Legacy-only", shared: false },
      {
        sprint: "M4",
        ships: "Family web archive, auth, contributor invites",
        reuse: "Identity + consent engine",
        shared: true,
      },
      { sprint: "M5", ships: "Book layout engine → print-ready PDF + QR audio links", reuse: "Legacy-only", shared: false },
      { sprint: "M6", ships: "Billing, subscriptions, refunds, print partner integration", reuse: "Billing", shared: true },
    ],
    exitCriteria: [
      "75+ paying customers",
      "≥50% reach story #20",
      "20 books physically delivered",
      "Gross margin ≥50%",
      "<10% refund rate",
    ],
  },
  {
    id: "legacy-phase-2",
    product: "legacy",
    index: 2,
    label: "Phase 2",
    window: "Months 6–12",
    title: "Fix completion, then scale acquisition",
    kidWords: "First make sure people finish their book. Only then tell more people about it.",
    summary:
      "In that order. Spending on ads while completion is at 40% is pouring money into a leaking bucket.",
    blocks: [
      {
        kind: "list",
        heading: "Completion levers (build first)",
        items: [
          "Nudge ladder — missed prompt triggers a gentle re-ask at 48h, then a different easier question at day 5. Never guilt.",
          "Family cheerleading — when a story lands, notify relatives; their reactions go back to the storyteller. This is the single strongest completion lever.",
          "Voice-call fallback — for storytellers who don't take to WhatsApp, a scheduled phone call where a human (later, an AI voice agent) asks the question.",
          "Progress artifact — show the book filling up. Ten stories in, email a 10-page preview PDF. Loss aversion does the rest.",
        ],
      },
      {
        kind: "table",
        heading: "Acquisition channels, in priority order",
        head: ["Channel", "Why / how"],
        rows: [
          {
            term: "NRI diaspora",
            detail:
              "Highest willingness to pay, sharpest emotional trigger (distance + ageing parents), pays in USD/GBP/AED while your cost base is INR. Target US/UK/UAE/Canada Indian communities.",
          },
          {
            term: "Gifting seasons",
            detail:
              "Diwali, Father's/Mother's Day, Christmas. Expect 3–4× baseline. Build gift-card flow so buying doesn't require the parent's phone number up front.",
          },
          {
            term: "The book as marketing",
            detail:
              "Every delivered book is seen by 10–30 relatives. Include a card with a referral code. This should become your cheapest channel by month 10.",
          },
          {
            term: "Partnerships",
            detail: "Senior-living communities, wealth advisors, hospices, ancestry groups. Slow but high-trust.",
          },
        ],
      },
    ],
    sprints: [],
    exitCriteria: ["Gate 1 criteria met at month 12 — see the Gates page"],
  },
  {
    id: "legacy-phase-3",
    product: "legacy",
    index: 3,
    label: "Phase 3",
    window: "Months 12–24",
    title: "Now — and only now — add the vault",
    kidWords: "Only after families love the book do we offer the bigger memory room.",
    summary:
      "These are the Grinrex features cut from v1. They become viable once you have customers who have already paid you and cried at the result. Upsell to trust you've earned; never lead with them.",
    blocks: [
      {
        kind: "list",
        heading: "Still cut — do not revisit before month 30",
        items: [
          "Blockchain provenance.",
          "\"Perpetual\" storage promises.",
          "Engraved drives and memory capsules.",
          "AI persona chatbots of deceased relatives — an ethical minefield that terrifies exactly the demographic you're selling to, and would poison the trust the rest of the product depends on.",
        ],
      },
    ],
    sprints: [],
    exitCriteria: [
      "Add-on attach rate tracked per tier",
      "No cut feature reintroduced before month 30",
    ],
  },
];

/** Phase 1 pricing, in ₹ and $. */
export const legacyPricing: PricingTier[] = [
  { name: "Digital", india: "₹2,499", international: "$59", includes: "52 prompts, archive, PDF export" },
  {
    name: "Book",
    featured: true,
    india: "₹6,999",
    international: "$149",
    includes: "Above + 1 hardcover with voice QR codes",
  },
  {
    name: "Family",
    india: "₹12,999",
    international: "$249",
    includes: "Multi-storyteller, 3 copies, priority editing",
  },
];

export const legacyPricingNote =
  "Extra copies ₹1,499/$35 — historically a strong attach because books get gifted to siblings. Target blended gross margin ≥55% after print and shipping.";

/** Phase 3 add-ons. */
export const legacyAddOns: { name: string; price: string; note: string }[] = [
  {
    name: "Family Vault",
    price: "₹1,999/yr",
    note: "Photos, documents, video. 10-year terms, not \"forever.\" Free full export always available.",
  },
  { name: "Additional volumes", price: "₹4,999", note: "Year two of prompts → volume II. Natural renewal path." },
  {
    name: "Voice preservation",
    price: "₹2,999",
    note: "Cleaned, archival-quality audio of every story. Not a synthetic voice clone.",
  },
  {
    name: "Legacy release",
    price: "₹3,999",
    note: "Named recipients receive access after death verification. Requires legal counsel first.",
  },
  {
    name: "Corporate / institutional",
    price: "₹50k+",
    note: "Founder histories, trust and family-office archives, temple/community records. High margin, low volume.",
  },
];
