/**
 * Wave 2 — GrinSocial. One route carrying the product story and its phase plan.
 * Same template, same components, different data.
 */
import {
  Badge,
  Callout,
  DataTable,
  Eyebrow,
  Heading,
  IntentMeter,
  Lede,
  ProductSite,
  Section,
  useLocalStorage,
} from "@grin/ui";
import {
  cityReady,
  cityWaitlistTarget,
  launchCities,
  social,
  socialPhases,
  socialPricing,
} from "@grin/content";
import { Link } from "../router";
import { useIntent } from "../lib/useIntent";
import { Overview } from "../sections/social/Overview";
import { Safety } from "../sections/social/Safety";
import { Waitlist } from "../sections/social/Waitlist";

export default function Social() {
  const [explored, setExplored] = useLocalStorage<string[]>("grinlife:explored-phases", []);
  const intent = useIntent("social");

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
      landing={
        <>
          <Overview />
          <Safety />
          <Waitlist />

          <Section sectionId="social-cities" spacing="normal" tone="paper">
            <div className="space-y-5">
              <div className="space-y-3">
                <Eyebrow accent="moss">City readiness</Eyebrow>
                <Heading size="title">One city at a time, and the number that says when</Heading>
                <Lede>
                  The plan launches a city at roughly {cityWaitlistTarget} on the waitlist, with a moderator
                  actually on shift. Nothing here is invented: no city has been chosen yet, so every waitlist
                  reads zero until one opens. A table of plausible numbers would be exactly the fudging the
                  gates exist to prevent.
                </Lede>
              </div>

              <DataTable
                accent="moss"
                caption="GrinSocial launch city readiness against the plan's threshold"
                head={["City", "State", "Waitlist", "Moderators", "Target", "Ready?"]}
                rows={launchCities.map((city) => [
                  <span key="c" className="font-bold text-foreground">
                    {city.city}
                  </span>,
                  <Badge key="s" accent="moss" tone="outline" mono>
                    {city.state}
                  </Badge>,
                  <span key="w" className="font-mono tabular-nums text-ink-soft">
                    {city.waitlist} / {cityWaitlistTarget}
                  </span>,
                  <span key="m" className="font-mono tabular-nums text-ink-soft">
                    {city.moderators}
                  </span>,
                  <span key="t" className="font-mono tabular-nums text-muted-foreground">
                    {city.targetMonth === null ? "not set" : `month ${city.targetMonth}`}
                  </span>,
                  <span
                    key="r"
                    className={cityReady(city) ? "font-bold text-moss-ink" : "text-muted-foreground"}
                  >
                    {cityReady(city) ? "ready" : "not yet"}
                  </span>,
                ])}
              />

              <ul className="space-y-2">
                {launchCities.map((city) => (
                  <li key={city.city} className="text-sm leading-relaxed text-ink-soft">
                    <strong className="font-bold text-foreground">{city.city}: </strong>
                    {city.note}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </>
      }
      afterCompliance={
        <div className="space-y-10">
          {intent.count !== undefined ? (
            <IntentMeter
              productName={social.name}
              count={intent.count}
              target={intent.target}
              onAsk={() => void intent.ask()}
              busy={intent.busy}
              asked={intent.asked}
              accent="moss"
            />
          ) : null}

          <Callout tone="note" label="How to judge this product">
            <p>
              GrinSocial will likely be the least profitable of the three for a long time. Its strategic value
              is that it builds the matching engine, moderation tooling and age assurance that Wave 3 inherits
              — and it creates a large top-of-funnel that Legacy can sell into. Judge it on retention and
              infrastructure, not on early revenue.
            </p>
          </Callout>
        </div>
      }
    />
  );
}
