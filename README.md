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
npm test           # 254 tests: content, gate logic, API, components, routes, site audit
npm run audit      # 127 checks over the repo, the build, the live server and the content model
npm run audit:md   # the same 127 checks, written to AUDIT.md
npm run audit:streak  # run until 10 consecutive clean passes; a failure resets the streak
npm run verify     # typecheck + test + build + audit
```

One site, nine routes:

| Route                   | What it is                                            |
| ----------------------- | ----------------------------------------------------- |
| `/`                     | The portfolio argument and the three doors            |
| `/products/legacy`      | Grin Legacy — the case for the product, then its plan |
| `/products/social`      | GrinSocial — the case for the product, then its plan  |
| `/products/serendipity` | Serendipity — the case for the product, then its plan |
| `/roadmap`              | The relay: waves, gates, the fork, anti-drift         |
| `/gates`                | Live gate measurement against the status API          |
| `/spine`                | The codebase spine — who owns which file              |
| `/docs`                 | The source documents                                  |
| `/accessibility`        | What is guaranteed, what is not, and how to report it |

## Layout

```
packages/
  grin-ui/       the design system — Lantern Trail tokens, 16 primitives, 23 patterns, 7 hooks
  grin-content/  the content layer — every plan, phase, gate, price and risk as typed data
  grin-api/      the status API — persisted gate measurement, mountable by any front-end
apps/
  grinlife/               the website — one app, nine routes
    src/pages/            the nine routes
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

The portfolio plan requires it in §4 and §7: _"micro-apps are fine as long as they share the
same code base"_, and _"Codebases: 1 monorepo, 3 front-ends."_

So **no route contains a component of its own.** Everything imports `@grin/ui` and
`@grin/content` and composes them — 56 package source files carry the design system, the
content and the gate logic; 29 app source files carry composition. `ProductSite` renders an
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

## Deploy

This is a **Node server, not a static site**. GitHub Pages will not work: the server mounts the
status API at `/api`, generates `/sitemap.xml` and `/robots.txt`, injects each route's `<head>`
server-side, and returns a real 404 status on unknown paths.

`render.yaml` is a ready Blueprint — on Render, choose **New +** → **Blueprint** and point it at
this repository. The copy committed on this branch is configured for **Render free tier**, so it
avoids the paid Starter plan and persistent disk. It sets:

| Setting                              | Value                                                    | Why                                                                        |
| ------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `buildCommand`                       | `npm ci --include=dev && npm run build`                  | Render builds with `NODE_ENV=production`, so dev tools must be included    |     
| `startCommand`                       | `npm start`                                              | Serves the site and the status API from `dist/`                            |
| `healthCheckPath`                    | `/api/health`                                            | Answers 200 JSON and touches no disk                                       |
| `NODE_ENV`                           | `production`                                             | Without it the error handler includes `err.message`, leaking server paths  |
| `GRIN_DATA_FILE`, `GRIN_INTENT_FILE` | `/opt/render/project/src/apps/grinlife/data/*.json`      | Writable on free tier, but only on Render's ephemeral filesystem           |
| `GRIN_SITE_URL`                      | set per environment                                      | Canonical origin for the sitemap, `og:url` and `rel=canonical`             |

**Free-tier trade-off:** gate measurements, gate history and intent counts are written as JSON
files, so on the free plan they can disappear on the next restart or deploy. The site still
runs, but nothing server-written is durable.

If you later upgrade to a paid Render service, switch the blueprint back to `plan: starter`, add
a persistent `disk:` mounted at `/var/data`, and point `GRIN_DATA_FILE` / `GRIN_INTENT_FILE`
there so those JSON files survive restarts.

Anywhere else that runs a Node process with a disk works the same way — Fly.io, Railway, a
container, or a VPS:

```bash
npm ci && npm run build
NODE_ENV=production \
GRIN_SITE_URL=https://your.domain \
GRIN_DATA_FILE=/var/data/gate-status.json \
GRIN_INTENT_FILE=/var/data/intent.json \
npm start
```

Vercel and Netlify Functions are a poor fit as the code stands: their filesystems are read-only
apart from an ephemeral `/tmp`, so the JSON store would lose data constantly. Hosting there needs
`GateStore` and `IntentStore` moved onto a database first — both are isolated in
`packages/grin-api/src/store.ts`, so that is a contained change.

A static host is possible but degraded: the site still renders, the gates page falls back to
browser-local storage and says so on screen, but nothing is shared between visitors, every route
unfurls with the home page's title, and unknown paths return 200.

## The audit

`npm run audit` runs 127 numbered checks and prints what each one observed:

| Group                 | What it covers                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| A. Repository hygiene | one app, three packages, nothing built or generated is tracked, no reference to the deleted apps, the lockfile resolves            |
| B. Source quality     | no `any`, no suppressed type errors, no skipped tests, no `eval`, no dead files, Prettier clean                                    |
| C. Types and tests    | `tsc`, the full suite, every package covered, every `it()` asserts, every route reachable                                          |
| D. Build              | builds, the design system survives Tailwind's purge, all three products are in the bundle, no source maps                          |
| E. Content model      | phases contiguous, no empty fields, gates have the plan's criteria, every document resolves, every route has metadata              |
| F. Reuse              | no component re-implemented, packages never import upward, the design system has no router, the compliance table is published once |
| G. Live server        | boots the real production build, 8 routes 200, unknown paths 404, the full gate round-trip, malformed input cannot crash it        |
| H. Security           | `npm audit` clean, no secrets, atomic writes, no path disclosure, one external origin                                              |

`AUDIT.md` is the last run. The audit found six behavioural defects and three hygiene
items, all fixed — `ROADMAP.md` Part 4 records each one and why it mattered.

`npm run audit:streak` runs the whole audit repeatedly until it gets **10 consecutive clean
passes**; any failing attempt resets the streak to zero, because an audit that passes nine
times out of ten is reporting a race, not a pass. `AUDIT-STREAK.md` is the last streak.

Two things to know before running it elsewhere: it needs a git checkout (it enumerates
tracked files with `git ls-files`), and it boots its own production server on `:4321` with a
throwaway data file, so it never touches your recorded gate measurements.

## Continuous integration

The workflow lives at **`deploy/github-actions-ci.yml`**. It runs on every pull request and
every push to `main`: `npm ci`, typecheck, tests, build, the full audit against the real server,
and `npm audit`. It also regenerates `AUDIT.md` and fails if the committed copy had drifted.

To switch it on, copy it into place once and commit:

```bash
mkdir -p .github/workflows
cp deploy/github-actions-ci.yml .github/workflows/ci.yml
git add -f .github/workflows/ci.yml && git commit -m "Enable CI"
```

It is not committed at that path from here because GitHub rejects workflow files pushed by a
token without the `workflows` scope — which is what a sandboxed GitHub App token has. The push
fails outright with `refusing to allow a GitHub App to create or update workflow`, taking the
whole branch with it, so the file is version-controlled somewhere it can be pushed instead.
`.github/workflows/` is gitignored for the same reason; `git add -f` overrides that.

Check 125 asserts the two copies are byte-identical whenever the second one exists, so the
workflow CI actually runs cannot quietly diverge from the one in this repository.

Two things about running the audit on CI. Check 100 asserts the checkout is on a tracked branch
with an upstream; a CI checkout is a detached merge ref by design, so that check reports a skip
rather than a false failure when `CI` is set. And the audit is not read-only — it writes
`AUDIT.md` and runs a live server — so the workflow is allowed to fail on a stale report instead
of silently passing.

## Content fidelity

Every number, price, gate criterion, phase exit condition and risk is transcribed from
`Demo/DOCS/`. `packages/grin-content/src/content.test.ts` asserts the structure holds —
contiguous phase numbering, one value per metric column, at most one track in build per
timeline column, gates that resolve to a real product, document paths that really exist — so
the sites cannot quietly drift from the plan they render.
