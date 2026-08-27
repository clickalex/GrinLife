# Demo/ — source of record and archive index

Nothing in this folder is used to build the websites. It is here as the record the
monorepo was derived from.

## `DOCS/` — the five plan documents (authoritative)

Read in this order. The websites render this content; they do not replace it.

| File | What it is |
|---|---|
| `README.html` | Document index. Verdict: build C first, scoring 7.7 vs 4.2 and 3.6. |
| `Grin-Three-Product-Plan.html` | The portfolio plan: relay vs parallel, shared spine, brand architecture, capital plan, the two kill gates. |
| `1-Grin-Legacy-Phase-Plan.html` | Wave 1. WhatsApp voice memoirs → hardcover books. Phases 0–3, pricing, completion levers, DPDP. |
| `2-GrinSocial-Phase-Plan.html` | Wave 2. Feed-free matching, one city at a time. Blocked on Gate 1. IT Rules 2021 duties. |
| `3-Serendipity-Phase-Plan.html` | Wave 3. Random pseudonymous chat, separate legal entity. Conditional on Gate 2. |
| `main.pdf` | 203 KB companion PDF of the strategy set. |

`Grin-Three-Product-Plan 2.html` is a byte-identical duplicate of
`Grin-Three-Product-Plan.html` (verified with `diff -q`). Left in place so this
folder stays an untouched record.

## `design-notes/` — extracted from the archives, now readable

Eleven markdown files that were previously locked inside the zips: the Lantern Trail
design rationale (`ideas.md` for each of the four sites), plus the audits and
verification notes written against the original roadmap site. These are the reason
the current design system uses parchment, sunlit coral, moss, twilight violet and
honey, and why every phase explains itself twice — child-facing first, delivery
detail second.

## `*.zip` — the four original site archives

Superseded by the monorepo at the repository root, kept as the only record of the
four original implementations.

| Archive | Files | Was |
|---|---|---|
| `grinlife_roadmap.zip` | 92 | The umbrella "Lantern Trail" roadmap site — one 697-line `Home.tsx` holding all copy and logic |
| `Grinrex Legacy.zip` | 97 | The Legacy site, 12 section components |
| `grinsocial-roadmap.zip` | 97 | The GrinSocial site |
| `grinluck.zip` | 95 | The GrinLuck site |

**Why they are archived rather than maintained.** Measured by md5, **76 files are
byte-identical across all four archives**, including **53 design-system components
copied four times** (the four `client/src/components/ui/` directories have the same
aggregate hash). Fixing one component meant fixing it four times. That is the
codebase breaking the rule its own portfolio plan depends on: §4 requires a shared
spine, and §7 costs the portfolio at *"1 monorepo, 3 front-ends"*.

They also cannot be built off-platform: they depend on `vite-plugin-manus-runtime`,
a `__manus__` debug-log collector, a storage proxy that needs
`BUILT_IN_FORGE_API_KEY` (without it every `/manus-storage/...` image 500s), and a
`wouter` patch whose only effect is pushing route paths into
`window.__WOUTER_ROUTES__`.

The monorepo replaces all four with two shared packages and four front-ends that
contain no components of their own. See `ROADMAP.md` at the repository root.
