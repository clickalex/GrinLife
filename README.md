# GrinLife

Three products — **Grin Legacy**, **GrinSocial** and **Serendipity** — run as a relay, not a race.

This repository holds the working websites for that portfolio, built on one shared spine.
The strategy itself lives in `Demo/DOCS/`; `ROADMAP.md` records the audit of what was here
before and the plan this build followed.

---

## Run it

```bash
npm install          # installs both apps and both shared packages
npm run dev          # GrinLife portfolio site  → http://localhost:3000
npm run dev:landing  # Grin Legacy landing page → http://localhost:3001
```

Production:

```bash
npm run build        # builds both apps and their Express servers
npm start            # serves the portfolio site from the production build
```

Checks:

```bash
npm run typecheck    # tsc --noEmit across every package and app
npm test             # 64 tests: content integrity, components, routes, source scanning
npm run verify       # typecheck + test + build
```

## Layout

```
packages/
  grin-ui/        the design system — Lantern Trail tokens, 14 primitives, 16 patterns, 5 hooks
  grin-content/   the content layer — every plan, phase, gate, price and risk as typed data
apps/
  grinlife/        the portfolio site: hub, 36-month roadmap, three product sites, spine, gates, docs
  legacy-landing/  the Wave-1 Phase-0 page: one page, three sample stories, one price, one CTA
Demo/
  DOCS/            the five source documents — the authoritative record
  *.zip            the four original site archives, kept for reference
tests/             monorepo-wide checks
```

## The rule this codebase follows

The portfolio plan requires it in §4 and §7: *"micro-apps are fine as long as they share the
same code base"*, and *"Codebases: 1 monorepo, 3 front-ends."*

So neither app contains a component of its own. Both import `@grin/ui` and `@grin/content` and
compose them. `ProductSite` renders an entire multi-section product website from a `Product`
record — adding a fourth product means adding data and one route, not copying markup.

The four archives in `Demo/` are the counter-example: 76 files duplicated verbatim between
them, including 53 design-system components copied four times.

## Content fidelity

Every number, price, gate criterion, phase exit condition and risk on these sites is
transcribed from `Demo/DOCS/`. `packages/grin-content/src/content.test.ts` asserts the
structure holds — contiguous phase numbering, one value per metric column, at most one track
in build per timeline column, gates that resolve to a real product — so the sites cannot
quietly drift away from the plan they render.
