/**
 * Wave 1 — Grin Legacy. A complete product site rendered from data.
 * This file's job is composition: pick the data, add the Legacy-only blocks.
 */
import { DataTable, Eyebrow, Heading, ProductSite, useLocalStorage } from "@grin/ui";
import { legacy, legacyAddOns, legacyPhases, legacyPricing, legacyPricingNote } from "@grin/content";
import { Link } from "../router";

export default function Legacy() {
  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);

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
      afterCompliance={
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
      }
    />
  );
}
