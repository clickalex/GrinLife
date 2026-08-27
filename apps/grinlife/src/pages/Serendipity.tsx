/**
 * Wave 3 — Serendipity. Quarantined by brand policy: it reuses this codebase, but
 * the plan is explicit that it shares nothing public-facing with the Grin name.
 */
import {
  Callout,
  DataTable,
  Eyebrow,
  Heading,
  ProductSite,
  TermTable,
  useLocalStorage,
} from "@grin/ui";
import { nonNegotiables, serendipity, serendipityClosing, serendipityPhases, structure } from "@grin/content";
import { Link } from "../router";

export default function Serendipity() {
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
      beforeMetrics={
        <div className="space-y-10">
          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow accent="violet">§1 — Four non-negotiable changes</Eyebrow>
              <Heading size="title">The original spec, corrected</Heading>
            </div>
            <DataTable
              accent="violet"
              caption="Four non-negotiable changes to the original spec"
              head={["Original", "Replace with", "Why"]}
              rows={nonNegotiables.map((row) => [
                <span key="o" className="font-semibold text-muted-foreground line-through decoration-violet/50">
                  {row.original}
                </span>,
                <span key="r" className="font-bold text-foreground">
                  {row.replace}
                </span>,
                <span key="w">{row.why}</span>,
              ])}
            />
          </div>

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
        <Callout tone="note" label="A final word on this one">
          <p>{serendipityClosing}</p>
        </Callout>
      }
    />
  );
}
