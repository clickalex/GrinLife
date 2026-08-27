/**
 * Wave 2 — GrinSocial. Same template, same components, different data.
 */
import { Callout, ProductSite, useLocalStorage } from "@grin/ui";
import { social, socialPhases, socialPricing } from "@grin/content";
import { Link } from "../router";

export default function Social() {
  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);

  const toggle = (phaseId: string) =>
    setExplored((current) =>
      current.includes(phaseId) ? current.filter((id) => id !== phaseId) : [...current, phaseId],
    );

  return (
    <ProductSite
      product={social}
      phases={socialPhases}
      pricing={socialPricing}
      exploredPhases={explored}
      onExplored={toggle}
      next={{ label: "Serendipity — Wave 3", href: "/products/serendipity" }}
      Link={Link}
      afterCompliance={
        <Callout tone="note" label="How to judge this product">
          <p>
            GrinSocial will likely be the least profitable of the three for a long time. Its strategic value is
            that it builds the matching engine, moderation tooling and age assurance that Wave 3 inherits — and
            it creates a large top-of-funnel that Legacy can sell into. Judge it on retention and
            infrastructure, not on early revenue.
          </p>
        </Callout>
      }
    />
  );
}
