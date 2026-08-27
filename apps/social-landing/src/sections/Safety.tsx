import {
  Callout,
  Card,
  Eyebrow,
  Heading,
  Lede,
  PricingTable,
  Section,
  TermTable,
} from "@grin/ui";
import { social, socialPricing } from "@grin/content";

/**
 * Safety and price together, because on a stranger-to-stranger product they are the
 * same argument. Everything here is transcribed from the Wave 2 plan.
 */
export function Safety() {
  return (
    <>
      <Section sectionId="price" tone="paper">
        <div className="space-y-6">
          <div className="space-y-3">
            <Eyebrow accent="moss">Price</Eyebrow>
            <Heading size="title">The core stays free. There are no ads to sell you.</Heading>
            <Lede>
              We removed the feed, so advertising is out — which is a feature, not a bug, but it means
              subscriptions and event fees carry the product.
            </Lede>
          </div>

          <PricingTable
            accent="moss"
            tiers={socialPricing}
            currencyLabel="Free at the core · optional upgrades"
            note="Paid local meetups are the line we expect to grow fastest: people pay for structured time in a room with other people. Verified communities — running clubs, alumni bodies, coworking spaces — pay for a managed group with tools."
          />
        </div>
      </Section>

      <Section sectionId="safety">
        <div className="space-y-8">
          <div className="space-y-3">
            <Eyebrow accent="moss">Safety</Eyebrow>
            <Heading size="title">The part that has to exist before the first user</Heading>
            <Lede>
              The moment strangers can message each other, the product changes character. These are not
              promises — they are obligations that must be live at launch.
            </Lede>
          </div>

          <TermTable
            accent="moss"
            caption="GrinSocial safety and compliance obligations"
            head={["Obligation", "What it means for you as a user"]}
            rows={social.compliance.map((row) => ({ term: row.obligation, detail: row.detail }))}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card accent="moss" variant="paper" className="p-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                Ephemeral to you, accountable to the law
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Chats disappear from your view unless both people choose to keep them. A short-window encrypted
                server-side log exists solely for safety and legal response, and its retention is stated
                plainly in the privacy policy. "No logs at all" would mean no evidence, no actionable reports
                and no cooperation with a court order — which is exactly the fact pattern regulators call
                negligent design.
              </p>
            </Card>

            <Card accent="moss" variant="paper" className="p-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                The balance problem we monitor weekly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Platonic apps in India skew heavily male and become unusable for women. We track the ratio
                weekly from day one, offer women-only matching options, seed women-first groups, and verify
                strictly. If a city's ratio makes the product bad for half its users, we slow that city down.
              </p>
            </Card>
          </div>

          <Callout tone="warning" label="This is not a dating app">
            <p>
              Every platonic app drifts that way, so we say it out loud: an intent preference at signup,
              explicit community standards, and fast enforcement on unwanted romantic advances. If that is
              what you are looking for, this is the wrong product.
            </p>
          </Callout>

          <p className="text-xs text-muted-foreground">
            Sources: {social.sources.join(" · ")}
          </p>
        </div>
      </Section>
    </>
  );
}
