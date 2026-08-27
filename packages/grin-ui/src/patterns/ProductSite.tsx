import type { Phase, PricingTier, Product, ProductId } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Section } from "../primitives/Section";
import { Container } from "../primitives/Container";
import { Eyebrow, Heading, Lede } from "../primitives/Typography";
import { TermTable } from "../primitives/DataTable";
import { Card } from "../primitives/Card";
import { Callout } from "../primitives/Callout";
import { Badge, StatusBadge } from "../primitives/Badge";
import { PageHero } from "./PageHero";
import { PhaseCard } from "./PhaseCard";
import { SectionChips, SectionRail, type ChapterItem } from "./SectionRail";
import { MetricTable } from "./MetricTable";
import { RiskTable } from "./RiskTable";
import { PricingTable } from "./PricingTable";
import { Sources } from "./Sources";

const accentFor: Record<ProductId, Accent> = {
  legacy: "honey",
  social: "moss",
  serendipity: "violet",
};

export interface ProductSiteProps {
  product: Product;
  phases: Phase[];
  pricing?: PricingTier[];
  pricingNote?: string;
  /** Anything product-specific that the shared template should not know about. */
  beforeMetrics?: React.ReactNode;
  afterCompliance?: React.ReactNode;
  /**
   * The product's own story — pitch, how it works, samples, ordering. Rendered
   * above the plan so one route carries both the case for the product and the
   * phases that build it.
   */
  landing?: React.ReactNode;
  /** Remembers which phases the reader has visited. */
  exploredPhases?: string[];
  onExplored?: (phaseId: string) => void;
  next?: { label: string; href: string } | null;
  Link: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
}

/**
 * A complete product site — hero, one-pager, phases, pricing, metrics, risks,
 * compliance and sources — rendered entirely from `@grin/content`.
 *
 * Grin Legacy, GrinSocial and Serendipity each have a full multi-section site, and
 * none of them contains a line of markup that the others don't share. Adding a
 * fourth product means adding data and one route.
 */
export function ProductSite({
  product,
  phases,
  pricing,
  pricingNote,
  beforeMetrics,
  afterCompliance,
  landing,
  exploredPhases = [],
  onExplored,
  next,
  Link,
}: ProductSiteProps) {
  const accent = product.accent ?? accentFor[product.id];
  const a = accentOf(accent);

  const chapters: ChapterItem[] = [
    ...(landing
      ? [{ id: `${product.id}-overview`, label: "The product", accent, caption: "Start here" }]
      : []),
    { id: `${product.id}-one-page`, label: "In one page", accent },
    { id: `${product.id}-phases`, label: "Phases", accent, caption: `${phases.length} stops` },
    ...(pricing ? [{ id: `${product.id}-pricing`, label: "Pricing", accent }] : []),
    { id: `${product.id}-metrics`, label: "Metrics", accent },
    { id: `${product.id}-risks`, label: "Risks", accent },
    { id: `${product.id}-compliance`, label: "Compliance", accent },
    { id: `${product.id}-sources`, label: "Sources", accent },
  ];

  return (
    <>
      <PageHero
        accent={accent}
        eyebrow={`Wave ${product.wave} · Months ${product.months}`}
        title={product.name}
        lede={product.tagline}
        badges={
          <>
            <StatusBadge status={product.status} label={product.statusLabel} />
            <Badge accent={accent} tone="outline" mono>
              {product.domain}
            </Badge>
            {product.formerName ? (
              <Badge accent="violet" tone="soft" mono>
                formerly {product.formerName}
              </Badge>
            ) : null}
          </>
        }
        aside={
          <Card accent={accent} variant="paper" className="p-5 sm:p-6">
            <p className={cn("grin-label mb-3", a.text)}>Why this position in the relay</p>
            <p className="text-sm leading-relaxed text-ink-soft">{product.whyHere}</p>
            <dl className="mt-5 space-y-3 border-t border-border/70 pt-4 text-sm">
              <div>
                <dt className="grin-label text-muted-foreground">Hands the next wave</dt>
                <dd className="mt-1 leading-relaxed text-foreground">{product.handsNextWave}</dd>
              </div>
              <div>
                <dt className="grin-label text-muted-foreground">Core risk</dt>
                <dd className="mt-1 leading-relaxed text-foreground">{product.coreRisk}</dd>
              </div>
              <div>
                <dt className="grin-label text-muted-foreground">Brand tier</dt>
                <dd className="mt-1 font-semibold capitalize text-foreground">
                  {product.brand}{" "}
                  {product.brand === "quarantined" ? "· zero shared equity" : "· shared equity"}
                </dd>
              </div>
            </dl>
          </Card>
        }
      />

      {product.readThisFirst ? (
        <Section tone="paper" spacing="tight">
          <Callout
            tone={product.status === "conditional" ? "kill" : "note"}
            label={product.readThisFirst.heading}
          >
            {product.readThisFirst.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </Callout>
        </Section>
      ) : null}

      {landing ? (
        <div id={`${product.id}-overview`} className="scroll-mt-24">
          {landing}
        </div>
      ) : null}

      <Section sectionId={`${product.id}-one-page`}>
        <div className="grid gap-10 xl:grid-cols-[17rem_1fr]">
          <SectionRail items={chapters} />

          <div className="min-w-0 space-y-16">
            <SectionChips items={chapters} className="-mx-5 mb-2" />

            <div className="space-y-5">
              <Eyebrow accent={accent}>The product in one page</Eyebrow>
              <Heading size="title">
                {product.pitch.length > 120 ? product.pitch.slice(0, 117).trimEnd() + "…" : product.pitch}
              </Heading>
              <TermTable
                accent={accent}
                caption={`${product.name} in one page`}
                head={["", ""]}
                rows={product.onePage.map((row, i) => ({
                  term: row.term,
                  detail: i === 0 ? product.pitch : row.detail,
                }))}
              />
            </div>

            <div id={`${product.id}-phases`} className="scroll-mt-28 space-y-6">
              <div className="space-y-3">
                <Eyebrow accent={accent}>Phase plan</Eyebrow>
                <Heading size="title">{phases.length} phases, in strict order</Heading>
                <Lede>
                  Each phase has an exit criterion. A phase that misses its criterion does not get to hand off
                  to the next one — the same discipline as the portfolio gates, applied one level down.
                </Lede>
              </div>

              <ol className="space-y-6">
                {phases.map((phase) => (
                  <li key={phase.id}>
                    <PhaseCard
                      phase={phase}
                      accent={accent}
                      explored={exploredPhases.includes(phase.id)}
                      onExplored={onExplored}
                    />
                  </li>
                ))}
              </ol>
            </div>

            {pricing ? (
              <div id={`${product.id}-pricing`} className="scroll-mt-28 space-y-5">
                <div className="space-y-3">
                  <Eyebrow accent={accent}>Pricing</Eyebrow>
                  <Heading size="title">What it costs, in two currencies</Heading>
                </div>
                <PricingTable tiers={pricing} accent={accent} note={pricingNote} />
              </div>
            ) : null}

            {beforeMetrics}

            <div id={`${product.id}-metrics`} className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow accent={accent}>Metrics that matter</Eyebrow>
                <Heading size="title">The numbers this product is judged on</Heading>
                <Lede>
                  {product.id === "serendipity"
                    ? "The primary metrics here are safety metrics, not growth metrics. That inversion is deliberate."
                    : "Tracked monthly. The right-hand column is the number the gate decision actually uses."}
                </Lede>
              </div>
              <MetricTable accent={accent} columns={product.metrics.columns} rows={product.metrics.rows} />
            </div>

            <div id={`${product.id}-risks`} className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow accent={accent}>Top risks</Eyebrow>
                <Heading size="title">What kills this product, and the mitigation</Heading>
              </div>
              <RiskTable risks={product.risks} accent={accent} />
            </div>

            <div id={`${product.id}-compliance`} className="scroll-mt-28 space-y-5">
              <div className="space-y-3">
                <Eyebrow accent={accent}>Compliance</Eyebrow>
                <Heading size="title">
                  {product.id === "legacy"
                    ? "The lightest of the three — but not zero"
                    : product.id === "social"
                      ? "This is where the product changes character"
                      : "Everything GrinSocial owes, plus more"}
                </Heading>
              </div>
              <TermTable
                accent={accent}
                caption={`${product.name} compliance obligations`}
                head={["Obligation", "What it means for you"]}
                rows={product.compliance.map((row) => ({ term: row.obligation, detail: row.detail }))}
              />
            </div>

            {afterCompliance}

            <div id={`${product.id}-sources`} className="scroll-mt-28 space-y-4">
              <Sources items={product.sources} accent={accent} />
            </div>

            {next ? (
              <Container size="wide" className="px-0">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
                  <p className="text-sm text-ink-soft">Continue along the trail</p>
                  <Link
                    href={next.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white",
                      a.bg,
                    )}
                  >
                    {next.label}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </Container>
            ) : null}
          </div>
        </div>
      </Section>
    </>
  );
}
