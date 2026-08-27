# GrinLife — Engineering Roadmap

*Written 27 August 2026 from a full audit of every file in this repository.*

---

## Part 1 — What is actually in this repository today

### Inventory (complete)

| Path | What it is |
|---|---|
| `README.md` | 11 bytes. The single line `# GrinLife`. |
| `Demo/README.MD` | Empty (0 bytes of content). |
| `Demo/DOCS/` | 7 files: 5 strategy/plan HTML docs, `README.html` (document index), `main.pdf` (203 KB), `Readme.md` (1 byte). |
| `Demo/Grinrex Legacy.zip` | 97 files — a complete Vite + React 19 + Tailwind 4 + shadcn scaffold for the Legacy site. |
| `Demo/grinlife_roadmap.zip` | 92 files — the umbrella "Lantern Trail" roadmap site. |
| `Demo/grinluck.zip` | 95 files — the GrinLuck site. |
| `Demo/grinsocial-roadmap.zip` | 97 files — the GrinSocial site. |

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

**P4 — Referenced images do not exist in the repository.** `Home.tsx` points at `/manus-storage/grinlife-lantern-trail-hero_0072f464.jpg` and three others. Those paths were served by a Manus storage proxy configured in `vite.config.ts` with `BUILT_IN_FORGE_API_KEY`; outside that platform the proxy returns *"Storage proxy not configured"* and every hero image renders broken.

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

### Stage 0 — Make the repository real *(this build)*

- npm-workspaces monorepo at the repository root: `packages/*` + `apps/*`.
- One design system package, one content package, two front-end apps.
- Remove the platform coupling (P5); no patches, no telemetry plugins, no missing remote images (P4).
- `Demo/` left untouched as the authoritative source of record.

### Stage 1 — Extract the reusable assets *(this build)*

| Asset | Package | Purpose |
|---|---|---|
| Design tokens | `@grin/ui` | The Lantern Trail palette already chosen in `grinlife_roadmap/ideas.md`: parchment, ink, sunlit coral, moss, twilight violet, honey. |
| Primitives | `@grin/ui` | Container, Section, Eyebrow, Heading, Prose, Button, Badge, Card, Callout, DataTable, Stat, Accordion, Tabs, SkipLink. |
| Patterns | `@grin/ui` | SiteHeader, SiteFooter, PageHero, SectionRail (scroll-spy trail), Lantern, DualView (child/parent), GateCard, PhaseCard, RelayChart, SpineMatrix, MetricTable, RiskTable, PricingTable, ProductSite. |
| Hooks | `@grin/ui` | `useScrollSpy`, `useReducedMotion`, `useLocalStorage`, `useMediaQuery`. |
| Content model | `@grin/content` | Typed single source of truth for portfolio, waves, phases, gates, spine, pricing, metrics, compliance, risks, brand. |

### Stage 2 — Build websites out of those assets *(this build)*

| App | What it is | Built from |
|---|---|---|
| `apps/grinlife` | The portfolio site: hub + a complete roadmap site for each of the three products. | `@grin/ui` + `@grin/content` only |
| `apps/legacy-landing` | The Wave-1 Phase-0 conversion page the Legacy plan asks for verbatim: *"One page. Sample book photos, 3 sample stories, one price, one CTA."* | `@grin/ui` + `@grin/content` only |

Both apps consume the same two packages and contain no duplicated components. That is the reuse claim, and it is the thing the tests check.

### Stage 3 — Later (out of scope for this build, recorded so it is not lost)

1. Replace the static content package with an API once the plan needs live gate status.
2. Add the GrinSocial and Serendipity landing apps when their gates pass — each should be ~a data file plus a route, because the components already exist.
3. Wire the gate checklists to real metrics rather than documented targets.
4. Retire `Demo/*.zip` once the monorepo supersedes them; keep `Demo/DOCS/` as the source of record.

### Verification gates for this build

| Gate | Command | Requirement |
|---|---|---|
| Types | `npm run typecheck` | `tsc --noEmit` clean across all packages and apps. |
| Tests | `npm test` | Content-integrity tests + component render tests pass. |
| Build | `npm run build` | Both apps produce production bundles; the Express server bundles. |
| Serve | `npm start` | Production server returns 200 and the SPA shell on deep links. |

---

## Part 3 — What was built, and what was verified

### What shipped

| Asset | Count | Notes |
|---|---|---|
| `packages/grin-ui` primitives | 14 | Container, Section, Typography, Button, Badge, Card, Callout, DataTable, Stat, Accordion, Tabs, SkipLink, Reveal, ErrorBoundary |
| `packages/grin-ui` patterns | 16 | SiteHeader, SiteFooter, PageHero, SectionRail + SectionChips, Lantern, DualView, GateCard, PhaseCard, RelayChart, SpineMatrix, MetricTable, RiskTable, PricingTable, ProductCard, ProductSite, Sources |
| `packages/grin-ui` hooks | 5 | useScrollSpy, useReducedMotion, useLocalStorage, useMediaQuery, useInView |
| `packages/grin-content` modules | 6 | portfolio, legacy, social, serendipity, types, index |
| `apps/grinlife` routes | 9 | `/`, `/roadmap`, `/gates`, `/spine`, `/docs`, three product routes, 404 |
| `apps/legacy-landing` | 1 page | The Phase-0 brief: one page, three sample stories, one price, one CTA |

Neither app contains a component of its own. Both compose `@grin/ui` from `@grin/content` data.
46 package source files, 25 app source files.

### Verification results, as run

| Check | Result |
|---|---|
| `npm install` | 270 packages, workspaces linked (`node_modules/@grin/{ui,content,app-grinlife,app-legacy-landing}`) |
| `tsc --noEmit -p tsconfig.json` | exit 0, no diagnostics, across both packages and both apps |
| `vitest run` | **64 passed, 0 failed**, 5 test files |
| `npm run build` | grinlife: 39.09 kB CSS + 337.55 kB JS (106.61 kB gzip); legacy-landing: 38.23 kB CSS + 286.07 kB JS (92.33 kB gzip); both Express servers bundled |
| `npm start` (both apps) | 200 on `/`, `/roadmap`, `/products/serendipity`, `/docs`, and an unknown path (SPA fallback); CSS asset 200 as `text/css` |
| Dev servers | both 200 on `0.0.0.0:3000` and `0.0.0.0:3001`; `@grin/ui` resolves over `/@fs/…/packages/grin-ui/src` |

### What the tests actually exercise

- `content.test.ts` (21) — reads the data model and, for the document index, opens the real
  files in `Demo/DOCS/` to confirm the paths resolve.
- `ui.test.tsx` (12) — renders the real shared components: RelayChart, GateCard, DualView,
  Tabs, SpineMatrix, SectionRail, ProductSite.
- `App.test.tsx` (18) — renders the real `App` at every route through the real router, and
  asserts each route renders a *distinct* page rather than the home page nine times.
- `App.test.tsx` for the landing page (4) — including a check that no `<img>` points at a
  remote host, which is defect P4 above.
- `tests/sources.test.ts` (9) — for every app, resolves each `@source` glob in its CSS to a
  real directory and asserts both shared packages are scanned.

### One defect found and fixed during verification

The first build produced 17.22 kB of CSS containing only four accent utilities. Cause: the
`@source` paths in `apps/*/src/styles/app.css` were off by one directory level, so Tailwind
never scanned `packages/grin-ui/src` and silently purged every utility used inside a shared
component — while the build still succeeded. After correcting the paths the CSS is 39.09 kB
and contains the full accent set (`bg-coral`, `bg-moss`, `bg-violet`, `bg-honey` and their
soft/ink variants). `tests/sources.test.ts` exists so this cannot recur unnoticed.

### Still open

- The `Demo/*.zip` archives are unreferenced by the monorepo. Retiring them is a separate
  decision — they are the only record of the four original designs.
- Gate checklists persist to `localStorage` only; wiring them to real metrics needs an API.
- The GrinSocial and Serendipity landing apps are not built. When their gates pass they should
  be roughly a data file and a route each, because the components already exist.
