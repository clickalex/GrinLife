# GrinLife

Three products — **Grin Legacy**, **GrinSocial** and **Serendipity** — run as a relay, not a race.

This repository holds the working websites for that portfolio and the shared spine they are
built on. The strategy itself lives in `Demo/DOCS/`; `ROADMAP.md` records the audit of what
was here before and the plan this build followed.

---

## Run it

```bash
npm install
npm run dev        # portfolio site :3000 + status API :3010 (Vite proxies /api)
npm run dev:all    # everything: API + all four front-ends (:3000–:3003)
```

Individual front-ends:

```bash
npm run dev --workspace @grin/app-grinlife           # :3000  portfolio + roadmaps
npm run dev --workspace @grin/app-legacy-landing     # :3001  Grin Legacy landing
npm run dev --workspace @grin/app-social-landing     # :3002  GrinSocial landing
npm run dev --workspace @grin/app-serendipity-landing # :3003 Serendipity landing
```

Production:

```bash
npm run build      # all four apps + their Express servers
npm start          # serves the portfolio site and the status API from the build
```

Checks:

```bash
npm run typecheck  # tsc --noEmit across every package and app
npm test           # 110 tests: content, gate logic, API, components, routes, source scanning
npm run verify     # typecheck + test + build
```

## Layout

```
packages/
  grin-ui/       the design system — Lantern Trail tokens, 14 primitives, 17 patterns, 5 hooks
  grin-content/  the content layer — every plan, phase, gate, price and risk as typed data
  grin-api/      the status API — persisted gate measurement, mountable by any front-end
apps/
  grinlife/               portfolio site: hub, roadmap, three product sites, spine, live gates, docs
  legacy-landing/         Wave-1 Phase-0 page: one page, three sample stories, one price, one CTA
  social-landing/         Wave-2 page: feed-free matching, one city at a time, city waitlist
  serendipity-landing/    Wave-3 page: quarantined brand, text-only, closed beta
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

So **no app contains a component of its own.** All four import `@grin/ui` and `@grin/content`
and compose them — 54 package source files carry the design system and the content, 41 app
source files carry composition. `ProductSite` renders an entire multi-section product website
from one `Product` record, so adding a product means adding data and a route.

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

## Brand quarantine, enforced by a test

Serendipity runs in a separate legal entity and shares nothing public-facing with Grin. That
is a rule about output, so it is asserted against the rendered DOM:
`apps/serendipity-landing/src/App.test.tsx` fails if the word "Grin" appears anywhere in the
page, if any link points at a Grin property, or if the rename row from the plan is published.

## Content fidelity

Every number, price, gate criterion, phase exit condition and risk is transcribed from
`Demo/DOCS/`. `packages/grin-content/src/content.test.ts` asserts the structure holds —
contiguous phase numbering, one value per metric column, at most one track in build per
timeline column, gates that resolve to a real product, document paths that really exist — so
the sites cannot quietly drift from the plan they render.
