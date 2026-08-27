/**
 * The whole 36-month plan on one trail: the relay, then every phase of every
 * product, in the order the relay allows them to be built.
 */
import {
  ButtonLink,
  Callout,
  Eyebrow,
  Heading,
  Lede,
  PageHero,
  PhaseCard,
  RelayChart,
  Section,
  Tabs,
  useLocalStorage,
  type TabItem,
} from "@grin/ui";
import { antiDriftRule, gates, getPhases, products, relayRule } from "@grin/content";
import { Link } from "../router";

export default function Roadmap() {
  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);

  const toggleExplored = (phaseId: string) =>
    setExplored((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId],
    );

  const totalPhases = products.reduce((sum, product) => sum + getPhases(product.id).length, 0);

  const tabs: TabItem[] = products.map((product) => {
    const phases = getPhases(product.id);
    return {
      id: product.id,
      label: product.name,
      caption: `${phases.length} phases · M${product.months}`,
      content: (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
            <div>
              <p className="font-display text-lg font-bold text-foreground">{product.tagline}</p>
              <p className="mt-1 text-sm text-ink-soft">{product.statusLabel}</p>
            </div>
            <Link
              href={product.route}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-ink-soft hover:bg-muted"
            >
              Full product plan
              <span aria-hidden>→</span>
            </Link>
          </div>

          <ol className="space-y-6">
            {phases.map((phase) => (
              <li key={phase.id}>
                <PhaseCard
                  phase={phase}
                  accent={product.accent}
                  explored={explored.includes(phase.id)}
                  onExplored={toggleExplored}
                />
              </li>
            ))}
          </ol>
        </div>
      ),
    };
  });

  return (
    <>
      <PageHero
        eyebrow="36-month relay · Phases 0–3 for each product"
        title="The roadmap, stop by stop"
        lede="Three tracks, twelve phases, two gates. Every phase has an exit criterion, and no phase hands off to the next one without meeting it."
        badges={
          <>
            <span className="inline-flex items-center gap-2 rounded-full bg-coral-soft px-3.5 py-1.5 text-xs font-bold text-coral-ink">
              {totalPhases} phases
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-xs font-bold text-ink-soft">
              {explored.length} explored
            </span>
          </>
        }
        actions={
          <>
            <ButtonLink href="/gates" size="lg">
              Go to the gates
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Back to the portfolio
            </ButtonLink>
          </>
        }
        aside={
          <Callout tone="rule" title={relayRule.rule}>
            <p>{relayRule.gloss}</p>
          </Callout>
        }
      />

      <Section spacing="normal">
        <div className="space-y-16">
          <div className="space-y-5">
            <Eyebrow>§3 — Timeline</Eyebrow>
            <Heading size="title">Where each track sits, month by month</Heading>
            <Lede>
              Build bars never overlap. That is the constraint that keeps three products affordable, and it is
              the one thing this page exists to show.
            </Lede>
            <RelayChart />
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow>Phase plans</Eyebrow>
              <Heading size="title">Every phase, in strict order</Heading>
              <Lede>
                Switch the simple / full-detail control in the header to read these as a plain-English trail or
                as delivery detail. Your choice is remembered.
              </Lede>
            </div>
            <Tabs items={tabs} label="Choose a product to read its phases" />
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow>Between the phases</Eyebrow>
              <Heading size="title">What sits between one wave and the next</Heading>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {gates.map((gate) => (
                <Callout
                  key={gate.id}
                  tone="gate"
                  label={`${gate.id === "gate-1" ? "Gate 1" : "Gate 2"} · Month ${gate.month}`}
                  title={gate.question}
                >
                  <ul className="space-y-1.5">
                    {gate.criteria.map((criterion) => (
                      <li key={criterion.n}>
                        <span className="grin-label mr-2 opacity-70">{criterion.n}</span>
                        {criterion.text}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-semibold">{gate.ifNotMet}</p>
                </Callout>
              ))}
            </div>
            <Callout tone="kill" title={antiDriftRule.rule}>
              <p>{antiDriftRule.gloss}</p>
            </Callout>
          </div>
        </div>
      </Section>
    </>
  );
}
