/**
 * Wave 3 — Serendipity. One route carrying the product story and its phase plan.
 *
 * Note the deviation: the portfolio plan puts this product in a separate legal
 * entity with no public linkage to Grin. Merging the front-ends into one website
 * puts it on the same domain as the other two, which the plan argues against. The
 * page copy still carries no Grin reference and that is asserted by a test, but the
 * structural separation is gone. See ROADMAP.md, "Deliberate deviation".
 */
import { Callout, Eyebrow, Heading, IntentMeter, ProductSite, TermTable, useLocalStorage } from "@grin/ui";
import { serendipity, serendipityClosing, serendipityPhases, structure } from "@grin/content";
import { Link } from "../router";
import { useIntent } from "../lib/useIntent";
import { Overview } from "../sections/serendipity/Overview";
import { Safety } from "../sections/serendipity/Safety";
import { Beta } from "../sections/serendipity/Beta";

export default function Serendipity() {
  const intent = useIntent("serendipity");

  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);

  const toggle = (phaseId: string) =>
    setExplored((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId],
    );

  return (
    <ProductSite
      product={serendipity}
      phases={serendipityPhases}
      exploredPhases={explored}
      onExplored={toggle}
      next={{ label: "Back to the portfolio", href: "/" }}
      Link={Link}
      landing={
        <>
          <Overview />
          <Safety />
          <Beta />
        </>
      }
      beforeMetrics={
        // §1, the corrected spec, is published once by sections/serendipity/Safety.tsx in
        // the landing above this chapter. Only §2 remains here, so no table appears twice.
        <div className="space-y-10">
          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow accent="violet">§2 — Structure</Eyebrow>
              <Heading size="title">Corporate and brand separation</Heading>
            </div>
            <TermTable
              accent="violet"
              caption="Corporate and brand separation requirements"
              head={["Requirement", "What it means"]}
              rows={structure.map((row) => ({ term: row.item, detail: row.detail }))}
            />
          </div>
        </div>
      }
      afterCompliance={
        <div className="space-y-10">
          {intent.count !== undefined ? (
            <IntentMeter
              productName={serendipity.name}
              count={intent.count}
              target={intent.target}
              onAsk={() => void intent.ask()}
              busy={intent.busy}
              asked={intent.asked}
              accent="violet"
            />
          ) : null}

          <Callout tone="note" label="A final word on this one">
            <p>{serendipityClosing}</p>
          </Callout>
        </div>
      }
    />
  );
}
