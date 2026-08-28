/**
 * GrinLife hub — the portfolio argument, in the order the plan makes it.
 *
 * Everything here is rendered from `@grin/content` through `@grin/ui`; this file
 * contains composition and no product copy.
 */
import {
  ButtonLink,
  Callout,
  Card,
  DataTable,
  Eyebrow,
  Heading,
  Lede,
  PageHero,
  ProductCard,
  RelayChart,
  Section,
  SectionChips,
  SectionRail,
  Sources,
  SpineMatrix,
  StatGrid,
  TermTable,
  accentOf,
  cn,
  useLocale,
  type ChapterItem,
} from "@grin/ui";
import {
  costClosing,
  costComparison,
  fork,
  gates,
  portfolio,
  portfolioSources,
  products,
  relayRule,
  shortAnswer,
  spineIntro,
  spinePayoff,
  spineRows,
  translate,
} from "@grin/content";
import { Link } from "../router";

const chapters: ChapterItem[] = [
  { id: "short-answer", label: "Short answer", accent: "coral" },
  { id: "fork", label: "The fork", accent: "coral", caption: "Parallel vs relay" },
  { id: "relay", label: "36-month relay", accent: "coral" },
  { id: "products", label: "Three doors", accent: "coral", caption: `${products.length} products` },
  { id: "order", label: "Why this order", accent: "coral" },
  { id: "spine", label: "Shared spine", accent: "coral", caption: `${spineRows.length} services` },
  { id: "gates", label: "Kill gates", accent: "coral" },
  { id: "cost", label: "What it costs", accent: "coral" },
];

export default function Home() {
  const [locale] = useLocale();

  return (
    <>
      <PageHero
        eyebrow={`${translate(locale, "home.eyebrow")} · ${portfolio.documentDate}`}
        title={translate(locale, "home.headline")}
        lede={translate(locale, "home.lede")}
        badges={products.map((product) => (
          <Link
            key={product.id}
            href={product.route}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
              accentOf(product.accent).border,
              accentOf(product.accent).bgSoft,
              accentOf(product.accent).text,
            )}
          >
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", accentOf(product.accent).dot)} />
            {product.name}
          </Link>
        ))}
        actions={
          <>
            <ButtonLink href="/roadmap" size="lg">
              Walk the 36-month roadmap
            </ButtonLink>
            <ButtonLink href="/gates" variant="outline" size="lg">
              Read the two kill gates
            </ButtonLink>
          </>
        }
        aside={
          <div className="space-y-4">
            <StatGrid
              accent="coral"
              className="grid-cols-2 lg:grid-cols-2"
              items={[
                { value: "3", label: "Products", note: "One relay, never in parallel" },
                { value: "36", label: "Months", note: "Build → grow → build → grow" },
                { value: "2", label: "Kill gates", note: "M12 and M24, all criteria" },
                { value: "1", label: "Codebase", note: `${spineRows.length} shared services` },
              ]}
            />
            <Card variant="paper" accent="coral" className="p-5">
              <p className="grin-label text-coral-ink">The one rule</p>
              <p className="mt-2 font-display text-lg font-bold text-foreground">{relayRule.rule}</p>
            </Card>
          </div>
        }
      />

      <Section spacing="normal">
        <div className="grid gap-10 xl:grid-cols-[17rem_1fr]">
          <SectionRail items={chapters} title="On this trail" />

          <div className="min-w-0 space-y-20">
            <SectionChips items={chapters} className="-mx-5 mb-2" />

            {/* 1 — Short answer ------------------------------------------------ */}
            <div id="short-answer" className="scroll-mt-28 space-y-5">
              <Eyebrow>Short answer</Eyebrow>
              <Heading size="title">Yes — and here is the real argument for it.</Heading>
              <TermTable
                caption="The short answer to shipping three products"
                head={["", ""]}
                rows={shortAnswer}
              />
              <Callout tone="rule" label="The mechanism">
                <p>{relayRule.evidence}</p>
                <p className="mt-2 font-semibold">{relayRule.failureNote}</p>
              </Callout>
            </div>

            {/* 2 — The fork ---------------------------------------------------- */}
            <div id="fork" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§1 — The fork</Eyebrow>
                <Heading size="title">Two ways to run three products</Heading>
                <Lede>Only one of these survives contact with the first paying customer.</Lede>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {[
                  { model: fork.parallel, accent: "violet" as const },
                  { model: fork.relay, accent: "coral" as const },
                ].map(({ model, accent }) => {
                  const a = accentOf(accent);
                  return (
                    <Card
                      key={model.name}
                      accent={accent}
                      className={cn("p-6", model === fork.relay && "ring-2", model === fork.relay && a.ring)}
                    >
                      <p className={cn("grin-label", a.text)}>{model.name}</p>
                      <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                        {model.subtitle}
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {model.points.map((point) => (
                          <li key={point} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                            <span
                              aria-hidden
                              className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)}
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>

              <Callout tone="rule" title={relayRule.rule}>
                <p>{relayRule.gloss}</p>
              </Callout>
            </div>

            {/* 3 — Relay timeline --------------------------------------------- */}
            <div id="relay" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§3 — Timeline</Eyebrow>
                <Heading size="title">The 36-month relay</Heading>
                <Lede>
                  Note the overlap pattern: tracks overlap in market, never in build. That single constraint
                  is what turns three products from a liability into a portfolio.
                </Lede>
              </div>
              <RelayChart />
            </div>

            {/* 4 — Three doors ------------------------------------------------ */}
            <div id="products" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>Three doors</Eyebrow>
                <Heading size="title">One home, three products</Heading>
                <Lede>
                  Each product keeps its own colour and character while sharing one foundation. Open any of
                  them for the full phase plan, pricing, metrics, risks and compliance.
                </Lede>
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} Link={Link} />
                ))}
              </div>
            </div>

            {/* 5 — Order ------------------------------------------------------ */}
            <div id="order" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§2 — Order</Eyebrow>
                <Heading size="title">Which goes first, and why that order</Heading>
                <Lede>
                  The sequencing is not arbitrary. Each track must hand the next one something it could not
                  buy: cash, users, or infrastructure.
                </Lede>
              </div>
              <DataTable
                caption="Wave order and what each wave hands the next"
                head={["Wave", "Product", "Why here", "What it hands the next wave"]}
                rows={products.map((product) => [
                  <span key="w" className="grin-label font-bold">
                    {product.wave}
                  </span>,
                  <Link
                    key="p"
                    href={product.route}
                    className={cn(
                      "font-bold underline-offset-4 hover:underline",
                      accentOf(product.accent).text,
                    )}
                  >
                    {product.name}
                  </Link>,
                  <span key="y">{product.whyHere}</span>,
                  <span key="h">{product.handsNextWave}</span>,
                ])}
              />
              <Callout tone="note" label="Why the easiest product goes last">
                <p>
                  Buildability is the least important variable here. Serendipity is a weekend of engineering
                  and a decade of liability. Building it first means carrying A.M. v. Omegle-shaped risk and
                  UK Online Safety Act age-assurance costs — penalties to £18M or 10% of global turnover —
                  before you have a single rupee of revenue to defend yourself with. Easy to build ≠ cheap to
                  own.
                </p>
              </Callout>
            </div>

            {/* 6 — Shared spine ----------------------------------------------- */}
            <div id="spine" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§4 — Shared spine</Eyebrow>
                <Heading size="title">What makes three products affordable</Heading>
                <Lede>{spineIntro}</Lede>
              </div>
              <SpineMatrix />
              <Callout tone="note" label="Read the last column">
                <p>{spinePayoff}</p>
              </Callout>
              <div>
                <ButtonLink href="/spine" variant="secondary">
                  See how this codebase implements the spine
                </ButtonLink>
              </div>
            </div>

            {/* 7 — Gates ------------------------------------------------------ */}
            <div id="gates" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§6 — Gates</Eyebrow>
                <Heading size="title">The gates are the strategy</Heading>
                <Lede>
                  Without these, "three products in sequence" quietly becomes "three products in parallel" by
                  month nine. Decide the numbers now, while you are calm and nothing is at stake.
                </Lede>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {gates.map((gate) => (
                  <Card key={gate.id} accent={gate.id === "gate-1" ? "coral" : "violet"} className="p-6">
                    <p className="grin-label text-muted-foreground">
                      {gate.id === "gate-1" ? "Gate 1" : "Gate 2"} · Month {gate.month}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-foreground">{gate.question}</h3>
                    <ul className="mt-4 space-y-2">
                      {gate.criteria.map((criterion) => (
                        <li key={criterion.n} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                          <span className="grin-label mt-0.5 opacity-70">{criterion.n}</span>
                          <span>{criterion.text}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                      {gate.ifNotMet}
                    </p>
                  </Card>
                ))}
              </div>
              <div>
                <ButtonLink href="/gates" variant="secondary">
                  Work the gates as checklists
                </ButtonLink>
              </div>
            </div>

            {/* 8 — Cost ------------------------------------------------------- */}
            <div id="cost" className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow>§7 — Cost</Eyebrow>
                <Heading size="title">What three products actually costs</Heading>
              </div>
              <DataTable
                caption="Relay versus parallel cost comparison"
                head={["Line", "Relay (recommended)", "Parallel"]}
                highlightColumn="Relay (recommended)"
                rows={costComparison.map((row) => [
                  <span key="l" className="font-semibold text-foreground">
                    {row.line}
                  </span>,
                  <span key="r" className="font-bold text-coral-ink">
                    {row.relay}
                  </span>,
                  <span key="p" className="text-muted-foreground">
                    {row.parallel}
                  </span>,
                ])}
              />
              <Callout tone="note">{costClosing}</Callout>
            </div>

            <Sources items={portfolioSources} />
          </div>
        </div>
      </Section>
    </>
  );
}
