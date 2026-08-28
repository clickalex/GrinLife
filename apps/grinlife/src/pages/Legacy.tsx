/**
 * Wave 1 — Grin Legacy. One route carrying both halves of the product: the case for
 * it (pitch, how it works, samples, ordering) and the plan that builds it (phases,
 * pricing, metrics, risks, compliance). Both come from the same content layer.
 */
import {
  ConsentSheet,
  DataTable,
  Eyebrow,
  Heading,
  IntentMeter,
  ProductSite,
  Section,
  UnitEconomicsTable,
  useLocalStorage,
} from "@grin/ui";
import { legacy, legacyAddOns, legacyPhases, legacyPricing, legacyPricingNote } from "@grin/content";
import { Link } from "../router";
import { useIntent } from "../lib/useIntent";
import { Overview } from "../sections/legacy/Overview";
import { HowItWorks } from "../sections/legacy/HowItWorks";
import { SampleStories } from "../sections/legacy/SampleStories";
import { Occasions } from "../sections/legacy/Occasions";
import { Included } from "../sections/legacy/Included";
import { Order } from "../sections/legacy/Order";

export default function Legacy() {
  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);
  const intent = useIntent("legacy");

  const toggle = (phaseId: string) =>
    setExplored((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId],
    );

  return (
    <ProductSite
      product={legacy}
      phases={legacyPhases}
      pricing={legacyPricing}
      pricingNote={legacyPricingNote}
      exploredPhases={explored}
      onExplored={toggle}
      next={{ label: "GrinSocial — Wave 2", href: "/products/social" }}
      Link={Link}
      landing={
        <>
          <Overview />
          <HowItWorks />
          <SampleStories />
          <Occasions />
          <Included />
          <Order />

          <Section sectionId="legacy-unit-economics" spacing="normal" tone="paper">
            <div className="space-y-5">
              <div className="space-y-3">
                <Eyebrow accent="honey">Unit economics</Eyebrow>
                <Heading size="title">What a book costs, and what is left</Heading>
              </div>
              <UnitEconomicsTable />
            </div>
          </Section>
        </>
      }
      afterCompliance={
        <div className="space-y-10">
          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow accent="honey">The obligation, as an artefact</Eyebrow>
              <Heading size="title">What a family signs before the first prompt</Heading>
            </div>
            <ConsentSheet />
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Eyebrow accent="honey">Phase 3 add-ons</Eyebrow>
              <Heading size="title">The vault, once trust is earned</Heading>
            </div>
            <DataTable
              accent="honey"
              caption="Grin Legacy Phase 3 add-ons"
              head={["Add-on", "Price", "Note"]}
              rows={legacyAddOns.map((addOn) => [
                <span key="n" className="font-bold text-foreground">
                  {addOn.name}
                </span>,
                <span key="p" className="font-mono text-sm text-honey-ink">
                  {addOn.price}
                </span>,
                <span key="d">{addOn.note}</span>,
              ])}
            />
          </div>

          {intent.count !== undefined ? (
            <IntentMeter
              productName={legacy.name}
              count={intent.count}
              target={intent.target}
              onAsk={() => void intent.ask()}
              busy={intent.busy}
              asked={intent.asked}
              accent="honey"
            />
          ) : null}
        </div>
      }
    />
  );
}
