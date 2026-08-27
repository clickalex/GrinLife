/**
 * The two kill gates, as working checklists. Criteria you confirm are remembered
 * locally, so a founder can come back to this page during a real gate review.
 */
import {
  Button,
  Callout,
  Card,
  Eyebrow,
  GateCard,
  Heading,
  Lede,
  PageHero,
  Section,
  useLocalStorage,
} from "@grin/ui";
import { antiDriftRule, gates, getProduct } from "@grin/content";

type GateState = Record<string, string[]>;

export default function Gates() {
  const [state, setState] = useLocalStorage<GateState>("grinlife:gate-review", {});

  const toggle = (gateId: string, n: string) =>
    setState((current) => {
      const list = current[gateId] ?? [];
      return {
        ...current,
        [gateId]: list.includes(n) ? list.filter((item) => item !== n) : [...list, n],
      };
    });

  const reset = () => setState({});

  const gate1 = gates[0];
  const gate2 = gates[1];
  if (!gate1 || !gate2) throw new Error("GrinLife gates are missing from @grin/content");

  const gate1Product = getProduct(gate1.unlocks);
  const gate2Product = getProduct(gate2.unlocks);

  return (
    <>
      <PageHero
        eyebrow="§6 — Gates"
        title="The gates are the strategy"
        lede="Without these, 'three products in sequence' quietly becomes 'three products in parallel' by month nine. Decide the numbers now, while you are calm and nothing is at stake."
        actions={
          <Button variant="outline" onClick={reset}>
            Reset both checklists
          </Button>
        }
        aside={
          <Card variant="paper" accent="violet" className="p-5">
            <p className="grin-label text-violet-ink">Anti-drift rule</p>
            <p className="mt-2 font-display text-lg font-bold text-foreground">{antiDriftRule.rule}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{antiDriftRule.gloss}</p>
          </Card>
        }
      />

      <Section spacing="normal">
        <div className="space-y-14">
          <div className="space-y-3">
            <Eyebrow>Permission to build</Eyebrow>
            <Heading size="title">Two decisions, all criteria required</Heading>
            <Lede>
              Each gate is a pass/fail on every criterion at once. A gate that is "mostly met" is a gate that
              failed — the fudging happens one criterion at a time.
            </Lede>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GateCard
              gate={gate1}
              unlockedProduct={gate1Product?.name ?? "GrinSocial"}
              checked={state[gate1.id] ?? []}
              onToggle={(n) => toggle(gate1.id, n)}
            />
            <GateCard
              gate={gate2}
              unlockedProduct={gate2Product?.name ?? "Serendipity"}
              checked={state[gate2.id] ?? []}
              onToggle={(n) => toggle(gate2.id, n)}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Callout tone="warning" label="The criterion founders fudge">
              <p>
                Gate 1, criterion ④ — "Legacy runs on ≤1 engineer's ongoing attention." If Legacy still eats
                the whole team at month 12, you do not have a product, you have a job, and Wave 2 must not
                start.
              </p>
            </Callout>
            <Callout tone="kill" label="If Gate 2 is anything short of a clear pass">
              <p>
                Skip Wave 3 permanently. Nothing downstream depends on it. A profitable two-product company
                beats a three-product company in litigation.
              </p>
            </Callout>
          </div>
        </div>
      </Section>
    </>
  );
}
