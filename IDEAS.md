# Ideas that fit this project

Proposals, not a backlog — none of this is built. Each one is judged against what the plan
actually asks for, what it costs, and what it needs before it can exist.

The filter applied to every idea here: does it make a **gate decision easier to make**, or
does it make the **relay hand-off cheaper**? Anything that only makes the site prettier is
left out, because the site is not the product — it is the argument for three products that
have not been built yet.

---

## 1. Gate decision history — the anti-drift rule needs it

**The gap.** The plan's anti-drift rule is: 0 gate failures → proceed, 1 → retry once,
2 → kill the product. `@grin/content` exports `antiDriftState`, and the site renders it.
But `@grin/api` stores only the _current_ value of each criterion. Nothing records that a
gate was measured, missed, and re-measured. So the one rule that decides whether a product
lives cannot currently be evaluated from data — it can only be asserted by hand.

**What to build.** An append-only record: every `PATCH` writes `{ gateId, n, value, verdict,
at }` to a history file alongside the current state. `GET /api/gates/history` returns it,
`antiDriftState` computes from it, and `/gates` renders a timeline: _measured 14 Mar, missed
by 40 customers; re-measured 2 Jun, cleared._

**Cost.** Small. `GateStore` already writes atomically; this adds a second file and one
route. The evaluation logic is pure and already tested.

**Why it fits.** It is the only feature on this list that closes a rule the plan states and
the codebase currently only half-implements.

---

## 2. Fake-door intent capture — Gate 1's 250 customers has no counter

**The gap.** Gate 1's first criterion is 250 paying customers. Phase 0 is deliberately
concierge: the CTAs are `mailto:` links. There is no record anywhere of how many people
asked. So the criterion that gates the entire portfolio is measured by someone counting
emails.

**What to build.** `POST /api/intent { product, source, note? }` with a per-product counter,
and a line on each product page: _"43 families have asked for this. The gate needs 250."_
One field, no account, no PII beyond what the mailto already asks for — and the count is
published, which is the honest version of a waitlist.

**Cost.** Small, and it reuses the existing store, router and badge patterns verbatim.

**Watch out.** Publishing a low number is worse than publishing none. Gate it behind a
threshold, or show progress rather than absolute counts until it clears.

---

## 3. Cost-model calculator — make the relay argument testable

**The gap.** `costComparison` is six static rows transcribed from the plan. The argument it
makes — _"Legacy funds Social, Social funds Serendipity, and the relay breaks if a margin
slips"_ — is asserted, not demonstrated. A reader cannot ask "what if the print cost rises
12%?"

**What to build.** A section on `/roadmap` with three or four sliders (books per month,
print margin, moderation cost per 1,000 conversations, city launch cost) that recompute the
existing table live and mark the row where the relay breaks. Same data, same components —
`DataTable` plus a few controlled inputs.

**Cost.** Medium. The interesting work is deciding which assumptions are honest to expose;
the code is a day.

**Why it fits.** The whole site is an argument about numbers under uncertainty. Letting
someone stress the numbers is the most in-character thing it could do.

---

## 4. GrinSocial city readiness — operationalising Gate 2

**The gap.** The plan sets ~500 waitlist per city, a 1,500-user launch, one city at a time.
Gate 2 currently records five booleans. There is no place where "which city, how far along,
is a moderator actually on shift" lives.

**What to build.** A `cities` record in `@grin/content` — city, waitlist count, moderator
coverage, target date, state — rendered as a table on `/products/social` and wired to Gate 2
criteria. Adding a city becomes a data edit.

**Cost.** Small to build, but it needs real data, which does not exist yet. Build the shape
when the first city is chosen, not before.

---

## 5. Sitemap, robots and Open Graph — the site is public now

**The gap.** Eight routes, per-route titles and descriptions, and still no `sitemap.xml`, no
`robots.txt`, and no Open Graph tags. Sharing `/products/legacy` produces a bare link with no
title or image. For a site whose entire job is to be read and forwarded, that is a real miss.

**What to build.** All three are derivable from data that already exists: `routes` and
`pageMeta` give the sitemap and the OG title/description; a per-product accent-coloured SVG
gives the image without adding a single raster asset.

**Cost.** Small. Roughly an hour, no new dependencies.

**Why it is last on this list despite being cheapest.** It helps strangers find the argument.
It does not help make a gate decision.

---

## 6. A print sheet for the Legacy brief

**The gap.** Grin Legacy's Phase-0 brief is one page: sample stories, one price, one CTA,
concierge. In practice someone forwards it to a family, and a family prints it. The screen
layout prints badly — the sticky rail, the reveal animations and the comparison grids all
come out wrong.

**What to build.** An `@media print` block in `tokens.css` that drops the header, rail and
footer, forces the sample stories onto one page, and keeps the price and the contact line
together at the bottom. Plus a "Print this page" button on the Legacy route only.

**Cost.** Small, and it is the one purely presentational item here that earns its place
because the product's sales motion is literally paper.

---

## 7. Content provenance — prove the transcription still matches

**The gap.** Every string in `@grin/content` is transcribed from `Demo/DOCS/`. The tests
check that the _structure_ holds and that the files exist. Nothing checks that the numbers
still agree. If someone edits a source document, the site drifts silently.

**What to build.** A `sourceRef` on each record (`{ doc, section }`), and an audit check that
greps the referenced document for the key figures — prices, gate thresholds, dates — and
fails if they no longer appear. Not a full diff; just the load-bearing numbers.

**Cost.** Medium, and it will produce false positives until the refs are precise. Worth it
only if the documents are expected to change; if they are frozen, skip it.

---

## 8. Publish the accessibility position

**The gap.** The audit asserts one `h1` per page, no duplicate ids, alt text, table captions,
heading order, a skip link, `aria-current`, and reduced-motion support. That is real work,
and none of it is visible to the people it protects.

**What to build.** A short `/accessibility` page: what is guaranteed, what is known to be
imperfect (the reveal animations, the dual-view toggle on small screens), and an address to
report a problem to. Generated from the same audit data where possible, so it cannot drift.

**Cost.** Small.

---

## What I would do first, and why

**1 → 2 → 5.** The gate history closes a rule the plan states and the code only half-honours.
Intent capture gives Gate 1's headline number a counter instead of an inbox. Both are small,
both reuse the existing API and components without extending them, and both make the site do
the thing it claims to do: measure rather than assert. The sitemap is cheap and it makes the
argument reachable, so it goes in the same pass.

Everything else waits for a reason to exist — real city data for 4, an expectation that the
documents will change for 7, and a reader who needs 6 before it is worth the CSS.

## What I would deliberately not build

- **A dashboard.** The gates page already is one. A second view of nine numbers is a cost
  with no decision attached.
- **Auth and user accounts.** Nothing here needs to know who you are. Adding identity to a
  portfolio site would create a DPDP obligation where none currently exists.
- **An AI persona or voice feature.** The plan bans AI persona chatbots of the deceased
  outright. It is not a backlog item; it is a red line.
- **Analytics.** A counter on intent is measurement the plan asks for. Behavioural tracking
  of readers is not, and would sit badly next to a privacy-first product story.
