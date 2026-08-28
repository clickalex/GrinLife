# Ideas that fit this project

Proposals, not a backlog — none of this is built. Each one is judged against what the plan
actually asks for, what it costs, and what it needs before it can exist.

The filter applied to every idea here: does it make a **gate decision easier to make**, or
does it make the **relay hand-off cheaper**? Anything that only makes the site prettier is
left out, because the site is not the product — it is the argument for three products that
have not been built yet.

---

## 1. Gate decision history — the anti-drift rule needs it

> **Implemented.** Every `PATCH` appends to an append-only history file; `POST /api/gates/:id/assess`
> records a dated verdict, and only an assessment counts as a failure — editing a criterion twelve
> times records twelve measurements and no failures. `antiDriftFromHistory` computes the verdict
> and `/gates` renders the timeline. Covered by audit checks 117–118.

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

> **Implemented.** `POST /api/intent` counts an ask per product and stores **no contact details**,
> so it creates no personal data and no DPDP obligation. Published as progress toward 250 rather
> than a bare count, and only on the three product pages. Covered by audit checks 119–120.

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

> **Implemented** as `CostCalculator` on `/roadmap`: four sliders recompute the relay arithmetic and
> mark the row where it breaks. `costComparison` is transcribed prose and cannot be recomputed, so
> this is an explicit model beside it, with every assumption's basis printed. Two defects were found
> building it: the break test treated a cost row as a failure, and the moderation baseline was so low
> the relay could never break.

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

> **Implemented**, with the honesty constraint the proposal raised. The shape is built and rendered
> on `/products/social`; every waitlist reads **zero**, because no city has been chosen and a table of
> plausible numbers would be exactly the fudging the gates exist to prevent.

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

> **Implemented.** `/sitemap.xml` and `/robots.txt` are generated from `routes`; per-route
> `og:title`/`og:description`/`og:type`/`og:url`/`og:site_name`, `twitter:card` and
> `rel="canonical"` are injected into the shell **server-side**, because crawlers and link
> unfurlers do not run JavaScript. Covered by audit checks 106, 107 and 112–114.

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

> **Implemented**, both halves. An `@media print` block in `tokens.css` drops the
> header, footer, rail and skip link, goes black-on-white at 11pt, keeps blocks together with
> `break-inside: avoid`, and prints external hrefs after their links. The Legacy-only
> affordance is shipped too, as the shared `PrintButton` primitive.

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

> **Implemented** as `provenance.ts` + `provenance.test.ts`: ten load-bearing figures, each paired
> with the document it came from, and derived from the content model where they also live there — so
> the check fails if the document changes _or_ if the package drifts away from the document. Runs
> inside the test suite, which the audit runs, so it is part of every audit.

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

> **Implemented** as the `/accessibility` route. Ten guarantees, each naming the test that enforces
> it; `accessibility.test.ts` and audit check 121 fail if any of those names stops existing. Three
> known imperfections are published, including that colour contrast is not machine-verified.

**The gap.** The audit asserts one `h1` per page, no duplicate ids, alt text, table captions,
heading order, a skip link, `aria-current`, and reduced-motion support. That is real work,
and none of it is visible to the people it protects.

**What to build.** A short `/accessibility` page: what is guaranteed, what is known to be
imperfect (the reveal animations, the dual-view toggle on small screens), and an address to
report a problem to. Generated from the same audit data where possible, so it cannot drift.

**Cost.** Small.

---

## Round two

A second pass, deliberately avoiding the eight above. The filter is unchanged: does it make a
gate decision easier to make, or the relay hand-off cheaper?

---

## 9. Unit economics behind Gate 1's margin criterion

> **Implemented** as `UnitEconomicsTable` on `/products/legacy`. The margin is derived from five cost
> lines, each with its basis. On these estimates it lands at **54.1%** — clearing Gate 1's 50% floor
> but missing the 55% the pricing note promises, which is the finding the table exists to surface.

**The gap.** Gate 1 has three numeric criteria: 250 customers, **50% margin**, 60% repeat-or-referral.
The site publishes the price (₹6,999 and the add-ons) but not what a book costs to make. So the
margin criterion — the one that decides whether Legacy funds the next wave — is entered by hand as
a percentage, with no arithmetic behind it that anyone can check.

**What to build.** A `unitEconomics` record in `@grin/content`: price, print, binding, shipping,
payment fees, and the derived margin. Rendered as a small table on `/products/legacy`, and the
Gate 1 margin input pre-fills from it rather than being typed blind.

**Cost.** Small — one data record, one `DataTable`, one wiring change in `Gates.tsx`.

**Why it fits.** It is distinct from the cost-model calculator (#3): that one stress-tests the
whole relay; this one makes a single gate criterion arithmetically honest.

---

## 10. The consent artefact Legacy actually owes a family

> **Implemented** as `ConsentSheet`, printable, on `/products/legacy`: what is collected, why, for how
> long, how it is deleted, four undertakings, and a signature block. The retention wording is a legal
> question and is written as a starting point, not as advice.

**The gap.** The compliance table lists DPDP obligations as things that must be live at launch.
But Grin Legacy collects a dead person's voice and stories from a living relative. That needs a
signed, dated, per-order record of what was consented to, what is stored, for how long, and how it
gets deleted. Nothing in the repo produces one.

**What to build.** A printable consent-and-retention sheet generated per order: the fields, the
retention window, the deletion route, and a signature block. Same print machinery as #6, and the
text comes from the existing compliance data rather than being written twice.

**Cost.** Small to build. The hard part is getting the retention wording right, which is a legal
question rather than a code one.

**Why it is on this list at all.** It is the cheapest item here that converts a stated obligation
into an artefact that exists. Everything else in the compliance table is a promise; this is a form.

---

## 11. Make "kill the product" a procedure, not a slogan

> **Implemented** as `ProcedureChecklist` on `/roadmap`: seven steps, each with an owner and the
> evidence it leaves. `operations.test.ts` fails the build if a step appears without an owner.
> Deliberately not interactive — a kill decision is a human one.

**The gap.** The plan is unusually honest that products get killed after two gate failures, and the
site renders `antiDriftState` prominently. But nowhere defines what killing a product _means_
operationally. When the day comes, that decision gets made under stress by people who have never
rehearsed it.

**What to build.** A `killProcedure` record — stop spend, notify the waitlist with a real refund
route, archive the repo, sunset the domain, publish the post-mortem — rendered on `/roadmap` as a
checklist, with an audit check that every step has an owner field filled in.

**Cost.** Small. The value is that it is written _before_ it is needed.

**Watch out.** Do not automate it. A kill decision is a human one; the checklist exists so the
human can execute it cleanly at 2am.

---

## 12. The relay hand-off contract

> **Implemented** as a table on `/spine`: six obligations with from/to/evidence/status, five still
> owed and one delivered (the monorepo itself).

**The gap.** `handsNextWave` is a field on every product, and the roadmap site renders it. It says
_what_ each wave hands on. It does not say what the receiving wave is entitled to expect, or how
anyone would know the hand-off happened.

**What to build.** An explicit contract per hand-off — Wave 1 must deliver a verified-adult
pipeline, payment rails and moderation staffing before Wave 2 may start — as a `SpineRow`-shaped
table on `/spine` with a status per item. Wave 2's gate then references the contract instead of
re-deriving it.

**Cost.** Medium. Mostly a decision about what belongs in the contract; the rendering is a table
that already exists.

**Why it fits.** The whole portfolio thesis is that the waves share one spine. A contract is how a
shared spine survives contact with three separate teams.

---

## 13. Hindi, for the market the prices already assume

> **Partly implemented, at the boundary the proposal drew.** The mechanism is built — a typed locale
> layer, a shared store, a `<select>` in the header, and `<html lang>` following the choice, which
> matters because screen readers pick a voice from it. Hindi covers navigation, the portfolio hero,
> the shared chrome, the gate labels and Legacy's marketing layer. The plan-facing chapters stay
> English on purpose: mistranslating a gate threshold is worse than not translating it, and the
> proposal's own advice — do not start before 250 customers — still applies to the rest.

**The gap.** Every price is in rupees, the governing law is the DPDP Act, and the compliance rows
cite Indian regulators — but all copy is English. Grin Legacy sells memory books to families, which
in India means vernacular-first or it means a much narrower market than the plan assumes.

**What to build.** A `locale` layer in `@grin/content`: every user-facing string keyed, `en` plus
`hi` to start, with the route-level language switch reusing the `useLocalStorage` pattern already
behind the dual-view toggle. Marketing sections first; the plan-facing chapters can stay English
longer, because their readers are different people.

**Cost.** The largest item on either list. Translation of ~40 pages of considered copy is not a
weekend, and machine translation of grief-adjacent marketing is worse than none.

**Honest recommendation.** Do not start this until Legacy has 250 customers. Before that it is
spending against a product the gates have not endorsed.

---

## 14. A seam test between the content, API and gate UI

> **Implemented** as `apps/grinlife/src/Seam.test.tsx`: for all 9 criteria across both gates it
> asserts the page renders a control, that a PATCH is accepted with 200, and that the verdict
> then counts every one as met. Verified to fail when the DOM id contract is renamed.

**The gap.** Three packages have to agree on criterion identity: `inputsForGate` in `@grin/content`
defines them, `@grin/api` validates a PATCH against them, and `/gates` renders an input for each.
Nothing asserts all three are in step. Add a criterion to the data and the UI can silently render
nine inputs while the API accepts ten.

**What to build.** One test: for every input of every gate, assert it renders on `/gates`, that a
PATCH for it returns 200, and that the verdict moves. Roughly twenty lines, and it closes the seam
the whole shared-spine argument depends on.

**Cost.** Small. Probably the best value-per-line on either list.

---

## What I would do first, and why

Across both rounds, the order is **14 → 1 → 2 → 9 → 5**.

14 first because it is twenty lines and it guards the seam the entire shared-spine argument rests
on. Then 1, because gate history closes a rule the plan states and the code only half-honours. Then
2, because Gate 1's headline number deserves a counter rather than an inbox. Then 9, because a
margin criterion typed in by hand is not a measurement. The sitemap (5) rides along in the same
pass because it is cheap and it makes the argument reachable.

10 and 11 go together the moment Legacy takes its first real order: one produces the artefact the
law expects, the other makes the worst-case decision executable.

Everything else waits for a reason to exist — real city data for 4, an expectation that the source
documents will change for 7, a reader who needs 6, and 250 customers before 13.

## What I would deliberately not build

- **A dashboard.** The gates page already is one. A second view of nine numbers is a cost
  with no decision attached.
- **Auth and user accounts.** Nothing here needs to know who you are. Adding identity to a
  portfolio site would create a DPDP obligation where none currently exists.
- **An AI persona or voice feature.** The plan bans AI persona chatbots of the deceased
  outright. It is not a backlog item; it is a red line.
- **Analytics.** A counter on intent is measurement the plan asks for. Behavioural tracking
  of readers is not, and would sit badly next to a privacy-first product story.
