# GrinLife

Three products — **Grin Legacy**, **GrinSocial** and **Serendipity** — run as a relay, not a race.

This repository holds the working websites for that portfolio and the shared spine they are
built on. The strategy itself lives in `Demo/DOCS/`; `ROADMAP.md` records the audit of what
was here before and the plan this build followed.

---

## Run it

```bash
npm install
npm run dev        # the website on :3000 + status API on :3010 (Vite proxies /api)
```

Production:

```bash
npm run build      # the app and its Express server
npm start          # serves the site and the status API from the build
```

Checks:

```bash
npm run typecheck  # tsc --noEmit across every package and the app
npm test           # 93 tests: content, gate logic, API, components, routes, source scanning
npm run verify     # typecheck + test + build
```

One site, eight routes:

| Route | What it is |
| --- | --- |
| `/` | The portfolio argument and the three doors |
| `/products/legacy` | Grin Legacy — the case for the product, then its plan |
| `/products/social` | GrinSocial — the case for the product, then its plan |
| `/products/serendipity` | Serendipity — the case for the product, then its plan |
| `/roadmap` | The relay: waves, gates, the fork, anti-drift |
| `/gates` | Live gate measurement against the status API |
| `/spine` | The codebase spine — who owns which file |
| `/docs` | The source documents |

## Layout

```
packages/
  grin-ui/       the design system — Lantern Trail tokens, 14 primitives, 17 patterns, 5 hooks
  grin-content/  the content layer — every plan, phase, gate, price and risk as typed data
  grin-api/      the status API — persisted gate measurement, mountable by any front-end
apps/
  grinlife/               the website — one app, eight routes
    src/pages/            the eight routes
    src/sections/         per-product marketing sections, one folder per product
    server/               Express host for the status API
Demo/
  DOCS/                   the five source documents — the authoritative record
  design-notes/           the design rationale extracted from the archives, now readable
  *.zip                   the four original site archives, superseded and documented
scripts/dev.mjs           dev launcher — API + front-ends behind one origin
tests/                    monorepo-wide checks
```

## The rule this codebase follows

The portfolio plan requires it in §4 and §7: *"micro-apps are fine as long as they share the
same code base"*, and *"Codebases: 1 monorepo, 3 front-ends."*

So **no route contains a component of its own.** Everything imports `@grin/ui` and
`@grin/content` and composes them — 55 package source files carry the design system, the
content and the gate logic; 28 app source files carry composition. `ProductSite` renders an
entire multi-section product website from one `Product` record, so adding a product means
adding data, a `sections/<product>/` folder and a route.

All three products now live on that one site. Each product route renders two things: the
`landing` sections that make the case for the product, then the phase plan, metrics, risks and
compliance that `ProductSite` derives from data. The three standalone landing apps this
replaced are in git history at `86fb7d0`.

The four archives in `Demo/` are the counter-example: 76 files duplicated verbatim between
them, including 53 design-system components copied four times.

## Live gate measurement

`/gates` is not a static checklist. Each criterion takes a real number — 250 customers, 50%
margin, ≤1 engineer — and the verdict only clears when every one is met, because the plan
allows no partial pass. Measurements are stored by `@grin/api` in
`apps/grinlife/data/gate-status.json` (gitignored, written atomically via a temp file). If the
API is unreachable, the page falls back to browser-local storage and says so on screen.

The evaluation logic is pure and lives in `@grin/content`, so the server and the browser run
the same rule and cannot disagree.

## Brand quarantine — deliberately weakened, and asserted as far as it still holds

The plan's brand architecture keeps Serendipity in a separate legal entity with nothing
public-facing in common with Grin. **Putting it on this site breaks that**, because the header
now says GrinLife and the domain is shared. That was an explicit instruction and it is
recorded as a deviation in `ROADMAP.md`, not absorbed silently.

What is still enforceable is asserted against the rendered DOM in
`apps/grinlife/src/ProductPages.test.tsx`: Serendipity's own copy contains no Grin reference,
and the rename row from the plan is never published on any page. If the quarantine has to be
restored for real, `ProductSite`'s `landing` prop makes the split reversible — move
`sections/serendipity/` into its own app and the same components ship under the other brand.

## Content fidelity

Every number, price, gate criterion, phase exit condition and risk is transcribed from
`Demo/DOCS/`. `packages/grin-content/src/content.test.ts` asserts the structure holds —
contiguous phase numbering, one value per metric column, at most one track in build per
timeline column, gates that resolve to a real product, document paths that really exist — so
the sites cannot quietly drift from the plan they render.
