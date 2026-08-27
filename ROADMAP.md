# GrinLife — Engineering Roadmap

_Written 27 August 2026 from a full audit of every file in this repository._

---

## Part 1 — What is actually in this repository today

### Inventory (complete)

| Path                          | What it is                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `README.md`                   | 11 bytes. The single line `# GrinLife`.                                                                        |
| `Demo/README.MD`              | Empty (0 bytes of content).                                                                                    |
| `Demo/DOCS/`                  | 7 files: 5 strategy/plan HTML docs, `README.html` (document index), `main.pdf` (203 KB), `Readme.md` (1 byte). |
| `Demo/Grinrex Legacy.zip`     | 97 files — a complete Vite + React 19 + Tailwind 4 + shadcn scaffold for the Legacy site.                      |
| `Demo/grinlife_roadmap.zip`   | 92 files — the umbrella "Lantern Trail" roadmap site.                                                          |
| `Demo/grinluck.zip`           | 95 files — the GrinLuck site.                                                                                  |
| `Demo/grinsocial-roadmap.zip` | 97 files — the GrinSocial site.                                                                                |

### The five strategy documents, in reading order

1. `README.html` — index. Verdict: build **C first**, scoring 7.7 vs 4.2 and 3.6.
2. `Grin-Three-Product-Plan.html` — the portfolio structure: relay vs parallel, shared spine, brand architecture, capital plan, two kill gates.
3. `1-Grin-Legacy-Phase-Plan.html` — Wave 1. WhatsApp voice memoirs → hardcover books. Phases 0–3.
4. `2-GrinSocial-Phase-Plan.html` — Wave 2. Feed-free matching, one city at a time. Blocked on Gate 1.
5. `3-Serendipity-Phase-Plan.html` — Wave 3. Random pseudonymous chat, separate legal entity. Conditional on Gate 2.

`Grin-Three-Product-Plan 2.html` is a byte-identical duplicate of `Grin-Three-Product-Plan.html` (verified with `diff -q`).

### The problems this audit found

**P1 — Nothing in this repository runs.** There is no `package.json`, no `tsconfig.json`, no build config and no source at the repository root. Every line of code that exists is inside four `.zip` files. `npm install` / `npm run dev` at the root fail because there is nothing to install or run.

**P2 — The four archives duplicate 76 files between them, verbatim.** Measured by md5: **76 files appear byte-identically in all four archives**. The largest block is the design system — each archive carries **53 shadcn UI components**, and the four `client/src/components/ui/` directories are **byte-identical sets** (same aggregate md5 `62d8fca…`). That is 212 copies of 53 components, and every future fix has to be applied four times.

**P3 — The one site that unifies the portfolio is a single 697-line file.** `grinlife_roadmap/client/src/pages/Home.tsx` holds all copy, all data structures, all styling and all logic inline. There is no content layer, no component reuse, and no way to render a second site from the same material.

**P4 — Referenced images do not exist in the repository.** `Home.tsx` points at `/manus-storage/grinlife-lantern-trail-hero_0072f464.jpg` and three others. Those paths were served by a Manus storage proxy configured in `vite.config.ts` with `BUILT_IN_FORGE_API_KEY`; outside that platform the proxy returns _"Storage proxy not configured"_ and every hero image renders broken.

**P5 — The build depends on platform-specific plugins.** `vite-plugin-manus-runtime`, `@builder.io/vite-plugin-jsx-loc`, a hand-rolled debug-log collector, a storage proxy, and a `patches/wouter@3.7.1.patch`. The patch was inspected: it only pushes route paths into `window.__WOUTER_ROUTES__` for telemetry. None of it is needed, and all of it blocks a clean build off-platform.

**P6 — The content is authoritative but only readable as prose.** The five docs contain the whole business case — 36-month relay, two kill gates with hard numbers, a 10-row shared-spine matrix, three pricing tables, four compliance regimes, fifteen risks with mitigations. None of it is machine-readable, so no page, chart or gate-checklist can be generated from it.

### The key strategic fact this codebase must respect

The portfolio plan's own §4 says three products are affordable only if the spine is built once:

> "Three products does not have to mean three codebases. The one caveat in the 'don't build two products' literature is telling: **micro-apps are fine as long as they share the same code base**."

And §7, on cost:

> "Codebases: **1 monorepo, 3 front-ends**."

P2 is the codebase violating its own strategy. The fix below is not a stylistic preference — it is the same discipline the business plan is built on.

---

## Part 2 — The roadmap

### Stage 0 — Make the repository real _(this build)_

- npm-workspaces monorepo at the repository root: `packages/*` + `apps/*`.
- One design system package, one content package, two front-end apps.
- Remove the platform coupling (P5); no patches, no telemetry plugins, no missing remote images (P4).
- `Demo/` left untouched as the authoritative source of record.

### Stage 1 — Extract the reusable assets _(this build)_

| Asset         | Package         | Purpose                                                                                                                                                                                              |
| ------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design tokens | `@grin/ui`      | The Lantern Trail palette already chosen in `grinlife_roadmap/ideas.md`: parchment, ink, sunlit coral, moss, twilight violet, honey.                                                                 |
| Primitives    | `@grin/ui`      | Container, Section, Eyebrow, Heading, Prose, Button, Badge, Card, Callout, DataTable, Stat, Accordion, Tabs, SkipLink.                                                                               |
| Patterns      | `@grin/ui`      | SiteHeader, SiteFooter, PageHero, SectionRail (scroll-spy trail), Lantern, DualView (child/parent), GateCard, PhaseCard, RelayChart, SpineMatrix, MetricTable, RiskTable, PricingTable, ProductSite. |
| Hooks         | `@grin/ui`      | `useScrollSpy`, `useReducedMotion`, `useLocalStorage`, `useMediaQuery`.                                                                                                                              |
| Content model | `@grin/content` | Typed single source of truth for portfolio, waves, phases, gates, spine, pricing, metrics, compliance, risks, brand.                                                                                 |

### Stage 2 — Build websites out of those assets _(this build)_

| App             | What it is                                                                                                                                                    | Built from                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/grinlife` | **One website.** Hub + roadmap + live gates + spine + docs, and three product routes that each carry the marketing case for the product _and_ its phase plan. | `@grin/ui` + `@grin/content` + `@grin/api` only |

The three products were first built as separate front-ends (`apps/legacy-landing`,
`apps/social-landing`, `apps/serendipity-landing`) and then merged into this single site at the
owner's request. The merge is the right call for reuse — one bundle, one design system, one
content package, zero duplicated sections — and it costs one thing, recorded below under
_Deliberate deviation_. The pre-merge state is preserved at commit `86fb7d0`.

Every product route is one `<ProductSite product={...} phases={...} landing={...} />` call.
`landing` holds the sections that argue for the product (`src/sections/<product>/Overview.tsx`
plus its siblings); everything below it — phases, metrics, risks, compliance, pricing, sources
— is derived from the `Product` record. The reuse claim is that no route contains a component
of its own, and that is what the tests check.

### Stage 3 — Later (out of scope for this build, recorded so it is not lost)

1. Replace the static content package with an API once the plan needs live gate status.
2. ~~Add the GrinSocial and Serendipity landing apps when their gates pass.~~ Done, and then
   superseded: all three products are routes on one site. Re-splitting a product into its own
   front-end is still cheap if the brand architecture ever needs it — move its
   `sections/<product>/` folder into a new app and pass the same components to `ProductSite`.
3. Wire the gate checklists to real metrics rather than documented targets.
4. Retire `Demo/*.zip` once the monorepo supersedes them; keep `Demo/DOCS/` as the source of record.

### Verification gates for this build

| Gate  | Command             | Requirement                                                       |
| ----- | ------------------- | ----------------------------------------------------------------- |
| Types | `npm run typecheck` | `tsc --noEmit` clean across all packages and apps.                |
| Tests | `npm test`          | Content-integrity tests + component render tests pass.            |
| Build | `npm run build`     | The app produces a production bundle; the Express server bundles. |
| Serve | `npm start`         | Production server returns 200 and the SPA shell on deep links.    |

---

---

## Part 3 — What was built, and what was verified

### What shipped

| Asset                           | Count   | Notes                                                                                                                                                                                                             |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/grin-ui` primitives   | 14      | Container, Section, Typography, Button, Badge, Card, Callout, DataTable, Stat, Accordion, Tabs, SkipLink, Reveal, ErrorBoundary                                                                                   |
| `packages/grin-ui` patterns     | 17      | SiteHeader, SiteFooter, PageHero, SectionRail + SectionChips, Lantern, DualView, GateCard, GateBoard, PhaseCard, RelayChart, SpineMatrix, MetricTable, RiskTable, PricingTable, ProductCard, ProductSite, Sources |
| `packages/grin-ui` hooks        | 5       | useScrollSpy, useReducedMotion, useLocalStorage, useMediaQuery, useInView                                                                                                                                         |
| `packages/grin-content` modules | 8       | portfolio, legacy, social, serendipity, gateInputs, gateStatus, types, index                                                                                                                                      |
| `packages/grin-api`             | 2       | `GateStore` (atomic JSON persistence) and the Express router that mounts it                                                                                                                                       |
| `apps/grinlife` routes          | 8 + 404 | `/`, `/roadmap`, `/gates`, `/spine`, `/docs`, and the three product routes                                                                                                                                        |
| `sections/legacy/`              | 6 files | Overview, HowItWorks, SampleStories, Occasions, Included, Order — the Phase-0 brief: one page, three sample stories, one price, one CTA                                                                           |
| `sections/social/`              | 3 files | Overview, Safety, Waitlist — feed-free matching, one city at a time, city waitlist                                                                                                                                |
| `sections/serendipity/`         | 3 files | Overview, Safety, Beta — text-only, Permanent button, closed beta                                                                                                                                                 |

55 package source files carry the design system, content model and API. 28 app source files
carry composition. **No route contains a component of its own.**

### Verification results, as run

| Check                                       | Result                                                                                                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`                               | Workspaces linked: `@grin/{ui,content,api}` and the app; the three removed apps unlinked (`removed 3 packages`)                                                                  |
| `npm run verify`                            | exit 0 — typecheck, tests and build in one pass                                                                                                                                  |
| `tsc --noEmit -p tsconfig.json`             | exit 0, no diagnostics, across three packages and the app                                                                                                                        |
| `vitest run`                                | **93 passed, 0 failed**, 7 test files                                                                                                                                            |
| `npm run build`                             | 40.75 kB CSS (7.88 kB gzip) and 381.64 kB JS (**119.44 kB gzip**); the server bundle is 48.5 kB because it embeds the API                                                        |
| Live dev server                             | One site on `:3000`, API on `:3010`. All 8 routes + the 404 path → 200                                                                                                           |
| API through the browser's origin            | `GET /api/health` → `{"ok":true,"service":"grin-status","gates":2}` via the Vite proxy on `:3000`                                                                                |
| Gate round-trip                             | 4× `PATCH /api/gates/gate-1/criteria/n` → 200; verdict `4/4 clear=true`; file `apps/grinlife/data/gate-status.json` written; `POST /api/gates/reset` → back to `0/4 clear=false` |
| Bundle actually contains all three products | `"One beautiful book"`, `"No follower count"` and `"waiting for the other person"` each present in `dist/public/assets/index-*.js`                                               |
| Tailwind purge guard                        | `bg-coral`, `bg-moss`, `bg-violet`, `bg-honey` all present in the built CSS                                                                                                      |

The bundle cost of merging is real and worth stating: 108.76 kB → 119.44 kB gzipped JS, because
one file now carries three products' worth of copy instead of one. That is the trade for one
origin, one header, one design system and no duplicated sections. If first paint on a product
route ever needs to be cheaper, `React.lazy` on the three product pages is a contained fix.

### What the tests actually exercise

- `content.test.ts` (21) — reads the data model and opens the real files in `Demo/DOCS/` to
  confirm the document index resolves.
- `gateStatus.test.ts` (12) — the gate arithmetic both server and browser run: threshold at
  exactly the target, `≤1 engineer` failing at 2, an unrecorded value counting as _not met_
  rather than as zero, and no clear on a partial pass.
- `api.test.ts` (14) — store behaviour plus real HTTP round-trips against a listening Express
  server, including 400s for a number sent to a boolean criterion and 404s for unknown gates.
- `ui.test.tsx` (12) — renders the real shared components: RelayChart, GateCard, DualView,
  Tabs, SpineMatrix, SectionRail, ProductSite.
- `App.test.tsx` for grinlife (19) — renders the real `App` at every route through the real
  router, asserts each route renders a _distinct_ page, and asserts the gates page falls back
  to browser-local storage when the API is unreachable.
- `ProductPages.test.tsx` (10) — the tests that came across with the three landing apps, now
  run against the merged routes. They assert each product page really does carry _both_ halves:
  the marketing content (sample stories, the book illustration, the tier tables, the Permanent
  button mock) and the plan-derived content (`#legacy-phases`, `#serendipity-overview`, every
  compliance obligation). Also the no-remote-`<img>` check (defect P4) and the
  brand-quarantine assertions for Serendipity.
- `tests/sources.test.ts` (5) — resolves each `@source` glob in the app's CSS to a real
  directory and asserts both shared packages are scanned. It was 17 while there were four
  apps; the assertions are per-app, so merging removed twelve of them without removing
  coverage of the one CSS file that now exists.

### Three defects found and fixed during verification

1. **Purged design system.** The first build produced 17.22 kB of CSS containing four accent
   utilities. The `@source` paths in `apps/*/src/styles/app.css` were off by one directory
   level, so Tailwind never scanned `packages/grin-ui/src` and silently dropped every utility
   used inside a shared component — while the build still succeeded. Corrected, the CSS is
   39.46 kB with the full accent set (`bg-coral`, `bg-moss`, `bg-violet`, `bg-honey` and their
   soft/ink variants), and 40.75 kB today with all three products merged into it.
   `tests/sources.test.ts` exists so this cannot recur unnoticed.
2. **A route test that passed for the wrong reason.** The first version rendered each route
   with wouter's `ssrPath`, which jsdom ignores — so all nine routes silently rendered the
   home page and every assertion passed. Rewritten to drive the History API, plus an explicit
   assertion that the nine routes produce nine distinct headings.
3. **A shipped-but-missing script.** `npm run dev:all` pointed at `scripts/dev-all.mjs`, which
   did not exist. Replaced by `scripts/dev.mjs`, which now launches the status API and the
   front-ends behind one origin.

### Deliberate deviation: Serendipity's brand quarantine

The plan's brand architecture keeps Serendipity in a separate legal entity with _nothing_
public-facing in common with Grin, on its own domain. **Putting it on this site breaks that
rule**, because the shared header says GrinLife and the origin is shared. This was an explicit
instruction from the owner, so it is implemented — but it is recorded here rather than absorbed
silently, and the enforcement was rescoped rather than deleted:

| Was                                                                                              | Now                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serendipity-landing/src/App.test.tsx` failed if the word "Grin" appeared _anywhere in the page_ | That assertion cannot hold on a shared site — the header is Grin. It now runs against `#serendipity-overview`, Serendipity's own copy, which must contain no Grin reference |
| The rename row from the plan is never published                                                  | Still asserted, page-wide: `nonNegotiables[3].original` must not appear in the rendered DOM                                                                                 |

One honest limit on that second guarantee: `"GrinLuck"` still ships inside the JS bundle,
because it is content data (`serendipity.formerName`, `nonNegotiables[3].original`, and the
brand-architecture row in `portfolio.ts`). No page renders it, and the test proves that, but a
determined reader could find it in the bundle source. Making that true in the strong sense
means either splitting the front-end back out or keeping the pre-rename name out of the shipped
content package.

### Closed from the original open list

| Was open                                                    | Now                                                                                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Gate checklists persist to `localStorage` only"            | `@grin/api` persists measurements server-side; the browser fallback remains and is labelled on screen                                                                            |
| "The GrinSocial and Serendipity landing apps are not built" | Built as separate apps, then merged into one site — both products now have a route, built from the shared spine, with page tests                                                 |
| "The `Demo/*.zip` archives are unreferenced"                | `Demo/README.MD` documents all four with the duplication measurements; their eleven design notes are extracted to `Demo/design-notes/` so the rationale is readable and diffable |

The archives themselves are deliberately **not** deleted — they remain the only record of the
four original implementations. Removing them is a one-line change if that is wanted.

### Still open

- Gate targets are the plan's numbers; wiring them to real Stripe, print-fulfilment and
  retention feeds is the next step, and needs those systems to exist.
- The product pages use `mailto:` for their CTAs. Phase 0 is concierge by design, but a real
  checkout belongs there once the fake-door test has run.
- The Serendipity quarantine described above. Restoring it is a small, well-defined change:
  move `sections/serendipity/` into its own app and drop the `landing` prop.
- No CI. `npm run verify` is the whole gate and it is run by hand.

## Part 4 — The hundred-check audit

`scripts/audit.mjs` runs the numbered checks listed in `AUDIT.md` over the repository, the build, the
live production server and the content model, printing the value each one observed.
`npm run verify` now ends with it, so a regression in any of the 105 fails the gate.
`AUDIT.md` is the last run and carries the authoritative check count.

### Six behavioural defects it found, and the fixes

| #   | Defect                                                                                                               | Why it mattered                                                                                 | Fix                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | No route set `document.title`                                                                                        | Eight routes shared one `<title>`, so every tab, bookmark and search result said the same thing | `pageMeta` + `pageTitleFor` in `@grin/content`, applied by a new `useDocumentHead` hook in `@grin/ui`          |
| 2   | The header styled the active nav link but never marked it                                                            | Sighted users could see where they were; screen-reader users could not                          | `SiteHeader` now passes `aria-current="page"`, and the injected `Link` contract carries it                     |
| 3   | The footer claimed Serendipity has _"no public affiliation to Grin"_                                                 | After the merge the same footer links to it — the site was contradicting itself in one sentence | Copy corrected to say what is true: planned as a separate entity, plan published here                          |
| 4   | Any unmatched `/api/*` route returned HTML that printed `/home/user/GrinLife/apps/grinlife/server/public/index.html` | An information-disclosure bug reachable by anyone with the URL                                  | JSON 404 inside the API router, plus an error handler that answers with a shape and never a path               |
| 5   | Unknown page paths returned `200`                                                                                    | Crawlers would index every typo as a duplicate of the home page                                 | Route-aware fallback: known route → 200, unknown → 404 with the shell, so the client still renders its own 404 |
| 6   | Production wrote gate measurements to `dist/data/`                                                                   | Every rebuild wiped the record of a gate decision — the one thing the API exists to keep        | Path resolves to `apps/grinlife/data` from both dev and prod; overridable with `GRIN_DATA_FILE`                |

Defect 4 was found by the audit's live-server group, which boots the real built server on
`:4321` and probes it. It is asserted twice now: `api.test.ts` covers the paths `fetch` can
express, and check 83 sends a raw `--path-as-is` traversal with curl, because the URL parser
resolves encoded dot segments before the request leaves the test.

### Three hygiene items fixed alongside

- The root `package.json` still described the project as _"two front-ends"_.
- `let body: any` in `api.test.ts` was masking two real strict-null errors; typing it
  properly surfaced `TS2454` and `TS18048`.
- The branch had no upstream, so `git status` could not report ahead/behind.

### What the audit deliberately does not claim

- It checks that the rendered DOM has one `h1`, no duplicate ids, no anchor pointing at
  nothing, alt text on every image, a caption on every table and no placeholder copy
  (`audit.test.tsx`, 99 assertions across the eight routes). It does **not** judge whether
  the design is good.
- `npm audit` reports 0 vulnerabilities today. That is a snapshot of the dependency tree at
  the time of the run, not a guarantee.
- The only external origin the site talks to is `fonts.googleapis.com` / `fonts.gstatic.com`.
  Offline, the site still works and falls back to the system stack; it just loses Fraunces.

### Verification results, as run

| Check                    | Result                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `npm run verify`         | exit 0 — typecheck, tests, build and the full audit in one pass                              |
| `vitest run`             | **194 passed, 0 failed**, 8 test files                                                       |
| `node scripts/audit.mjs` | **every check passes**                                                                       |
| `npm run audit:streak`   | **10 consecutive clean passes + confirmation**, 11 clean audits in a row (`AUDIT-STREAK.md`) |
| `npm run build`          | 40.75 kB CSS (7.88 kB gzip), 383.26 kB JS (**119.94 kB gzip**), server bundle 50.8 kB        |
| Live production server   | `:4321` — 8 routes 200, unknown path 404, deep links resolve, gate round-trip 4/4 then reset |

## Part 5 — Repeated audit, and what repetition is worth

`npm run audit:streak [target] [maxAttempts]` runs the whole audit — typecheck, the test
suite, a production build and a live server — until it records the target number of
consecutive clean passes. Any failing attempt resets the streak to zero rather than being
skipped. It has been run to 10 and then to 20.

**Latest result: 20 consecutive clean passes, plus a confirmation run — 21 clean audits in a
row, 116/116 checks each, 37–41 s per attempt (811 s total).** That is also 21 consecutive
passes of the 201-test suite and 21 clean production builds. `AUDIT-STREAK.md` is the log.
The first streak, at 105 checks and 194 tests, reached 10 consecutive passes.

The harness now runs one extra audit _after_ writing its own report, because the first version
did not and that turned out to matter.

What repetition actually bought, and what it did not:

| Finding                                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The streak harness poisoned the next audit | The first version wrote `AUDIT-STREAK.md` after its runs and then reported success — but the report is unformatted markdown in the tree, so audit check 30 failed on every subsequent run. Ten passes had been recorded against a _stale_ report file. Fixed by ignoring the generated report and adding a confirmation run that has to pass with the report in place; the streak was then re-run from scratch. |
| A leaked child process                     | An interrupted audit left its server listening on `:4321`. Every later run then probed that stale process and could pass for the wrong reason. Cleanup now runs on every exit path, and a busy port is a hard failure. Verified by holding the port and watching check 75 fail.                                                                                                                                 |
| Dead code in the public API                | `useReducedMotion` was exported and consumed by nothing. `Reveal` now uses it, so a visitor who asks for no motion never receives the animation node at all rather than a 0.001 ms one.                                                                                                                                                                                                                         |
| Nothing else                               | The remaining runs were equivalent in outcome. That is the useful result: the checks are deterministic, so a future failure means a regression and not a race.                                                                                                                                                                                                                                                  |

### The 20-pass run was a fixed point, not a repeat

The rule for that run was stricter than "audit until it is green": audit, and **fix or add
anything the pass turns up; every fix or addition resets the counter to zero**. The loop only
ends when a pass finds nothing left to change. It took one batch of work before the counter
could start — five defects and eight additions:

| Change                                          | Kind    | Why it was wrong or missing                                                                                                                                                                                                                          |
| ----------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gate measurements vanished when the API dropped | bug     | Four `setOnline(false)` sites flipped the page to browser-local storage that had never been populated, so everything the reader had typed disappeared. Fixed with a `latest` ref merged into local storage in `goOffline()`.                         |
| Deep links shipped with no security headers     | bug     | `express.static` set `nosniff` and `Referrer-Policy` on the files it served, but the single-page fallback writes the shell itself and set nothing — so every route except `/` was served bare. The audit only probed `/`, which is why it missed it. |
| Open Graph tags were invisible to crawlers      | bug     | The tags were added in the browser. Crawlers and link unfurlers do not run JavaScript, so the feature did nothing for the readers it exists for. Now injected into the shell server-side, per route, with `twitter:card` and a canonical link.       |
| Reduced-motion users saw one frame of animation | bug     | `useReducedMotion` initialised to `false` and only read `matchMedia` after mount. Now a lazy initialiser.                                                                                                                                            |
| A dead `eslint-disable` comment                 | bug     | The repository runs no linter, so the suppression was text pretending to be a directive.                                                                                                                                                             |
| Measurement timestamps on the gates page        | feature | `updatedAt` was stored by the API and rendered nowhere, so a decision could not be audited later.                                                                                                                                                    |
| `sitemap.xml` and `robots.txt`                  | feature | Generated from the same `routes` table the client router uses, so the two cannot disagree.                                                                                                                                                           |
| Server-side per-route head                      | feature | Title, description, OG and canonical for all eight routes, plus `noindex` on the 404 shell.                                                                                                                                                          |
| A print stylesheet, and a way to reach it       | feature | `@media print` in `tokens.css` plus a shared `PrintButton` primitive offered on the Legacy brief, whose sales motion is literally paper.                                                                                                             |
| The criterion seam test                         | feature | `Seam.test.tsx` walks all 9 criteria through define → render → measure → verdict across three packages.                                                                                                                                              |

Five of those are guarded by new audit checks (106–107, 112–116), and two by new tests. Each
was proven to fail without its fix by stashing the fix and re-running.

**What the streak does not prove.** It shows the checks as they stand are stable and that nothing
regressed across twenty-one full build-test-serve cycles. It says nothing about defects the checks
do not look for. Ten passes of a blind spot is still a blind spot — and the harness defect
above is the concrete example: every one of those runs was clean while the repository was, in
fact, in a state that failed.

### Five checks added before the streak, so the streak meant more

| #   | Check                                               | Why                                                                      |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 101 | Every `@grin/ui` export is referenced somewhere     | This is what caught `useReducedMotion`                                   |
| 102 | Reduced motion honoured in CSS _and_ in a component | A global CSS rule alone would have hidden the dead hook                  |
| 103 | No `console.log` in the shipped bundle              | Source-level greps miss what the bundler inlines                         |
| 104 | Every price in the content model is well-formed     | ₹ strings appear in marketing copy, tables and the plan                  |
| 105 | Every browser-storage key is namespaced             | Three keys, all `grinlife:`; a fourth from a shared domain would collide |

### Ideas, not a backlog

`IDEAS.md` proposes eight features, each judged against the plan rather than against what is
easy, and closes with what would deliberately _not_ be built. The short version: gate decision
history, fake-door intent capture, then a sitemap — because the first two make a gate decision
easier to make and the third makes the argument reachable.
