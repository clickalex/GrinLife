/**
 * §4 — the shared spine, and the part the strategy plan asks of this repository:
 * "1 monorepo, 3 front-ends". The second table shows where each spine service
 * actually lives in the code you are reading.
 */
import {
  Callout,
  DataTable,
  Eyebrow,
  Heading,
  Lede,
  PageHero,
  Section,
  SpineMatrix,
  StatGrid,
  accentOf,
  cn,
} from "@grin/ui";
import { codebaseSpine, spineIntro, spinePayoff, spineRows } from "@grin/content";

export default function Spine() {
  const wave1 = spineRows.filter((row) => row.builtIn.startsWith("Wave 1")).length;
  const wave2 = spineRows.filter((row) => row.builtIn.startsWith("Wave 2")).length;
  const inheritedByLuck = spineRows.filter((row) => row.luck).length;

  return (
    <>
      <PageHero
        eyebrow="§4 — Shared spine"
        title="Build it once, deliberately, in Wave 1"
        lede={spineIntro}
        aside={
          <StatGrid
            accent="moss"
            className="grid-cols-2 lg:grid-cols-2"
            items={[
              { value: String(spineRows.length), label: "Shared services", note: "Across three products" },
              { value: String(wave1), label: "Built in Wave 1", note: "Legacy funds the foundation" },
              { value: String(wave2), label: "Built in Wave 2", note: "Social builds the matching layer" },
              { value: String(inheritedByLuck), label: "Inherited by Wave 3", note: "Almost nothing is new" },
            ]}
          />
        }
      />

      <Section spacing="normal">
        <div className="space-y-16">
          <div className="space-y-5">
            <Eyebrow accent="moss">The plan</Eyebrow>
            <Heading size="title">Which product uses which service, and who builds it</Heading>
            <SpineMatrix />
            <Callout tone="note" label="Read the last column">
              <p>{spinePayoff}</p>
            </Callout>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow accent="moss">The codebase</Eyebrow>
              <Heading size="title">How this repository keeps that promise</Heading>
              <Lede>
                The portfolio plan found 76 files duplicated verbatim across four site archives, including 53
                design-system components copied four times. That is the codebase breaking the spine rule it
                depends on. This monorepo is the correction: one design system, one content layer, and
                front-ends that contain no components of their own.
              </Lede>
            </div>

            <DataTable
              accent="moss"
              caption="Where each shared service lives in this repository"
              head={["Spine service", "Asset in this repo", "What that means in practice"]}
              rows={codebaseSpine.map((row) => [
                <span key="s" className="font-bold text-foreground">
                  {row.service}
                </span>,
                <code
                  key="a"
                  className={cn(
                    "inline-flex rounded-md px-2 py-1 font-mono text-xs font-semibold",
                    accentOf("moss").bgSoft,
                    accentOf("moss").text,
                  )}
                >
                  {row.asset}
                </code>,
                <span key="d">{row.detail}</span>,
              ])}
            />

            <Callout tone="rule" label="The test of a shared spine">
              <p>
                A new Grin front-end should need a data file and a route. If adding a product means copying
                components, the spine has failed — which is exactly how the four original archives drifted.
              </p>
            </Callout>
          </div>
        </div>
      </Section>
    </>
  );
}
