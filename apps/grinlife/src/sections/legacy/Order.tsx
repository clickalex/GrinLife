import { ButtonLink, Callout, Card, Eyebrow, Heading, Lede, Section, accentOf, cn } from "@grin/ui";
import { legacyPricing } from "@grin/content";

const bookTier = legacyPricing.find((tier) => tier.featured) ?? legacyPricing[1]!;

/**
 * Phase 0 is a concierge phase, and this page says so rather than faking a checkout.
 * The plan's own instruction: "Concierge delivery — first 10 customers served entirely
 * by hand." A pretend payment form here would measure nothing real.
 */
export function Order() {
  const a = accentOf("honey");

  return (
    <Section sectionId="order" tone="paper">
      <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Eyebrow accent="honey">Order</Eyebrow>
            <Heading size="title">Start a book this week</Heading>
            <Lede>
              We are in the first phase of building this, which means the first ten books are made by hand —
              prompts sent personally, audio downloaded and edited by the founder, no automated pipeline
              standing between you and the person doing the work.
            </Lede>
          </div>

          <ol className="space-y-4">
            {[
              {
                title: "Send us the storyteller's first name and language",
                body: "That is all we need to start. No phone number required if this is a surprise.",
              },
              {
                title: "We reply within one working day with the first prompt",
                body: "You will see the exact question before it ever reaches your parent, and you can change it.",
              },
              {
                title: "Pay when the first story is written",
                body: "Not before. We would rather you saw a page of your mother's prose than trust a checkout screen.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className={cn(
                    "grin-label grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold",
                    a.bgSoft,
                    a.text,
                  )}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-base font-bold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="mailto:hello@grinlegacy.example?subject=Start%20a%20Grin%20Legacy%20book" accent="honey" size="lg">
              Email the concierge desk
            </ButtonLink>
            <ButtonLink href="#legacy-pricing" variant="outline" size="lg">
              See all three tiers
            </ButtonLink>
          </div>

          <Callout tone="note" label="Why there is no checkout button">
            <p>
              Because a payment form would let us pretend we have a product before we have proven the one that
              matters: that storytellers actually finish. The first ten books are made by hand, and the count
              is deliberately small.
            </p>
          </Callout>
        </div>

        <Card accent="honey" variant="card" className="p-6">
          <p className="grin-label text-honey-ink">The book tier</p>
          <p className="mt-2 font-display text-4xl font-bold leading-none text-honey-ink">{bookTier.india}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{bookTier.international}</p>

          <ul className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-sm">
            {[
              "52 weekly prompts, sent on WhatsApp",
              "Unlimited voice answers, in any language",
              "Human transcription and light editing",
              "Private family archive for invited relatives",
              "One hardcover book with voice QR codes",
              "Full export of audio and text, always free",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 leading-relaxed text-ink-soft">
                <span aria-hidden className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)} />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
            Extra copies ₹1,499 / $35. Digital-only and Family tiers available — see the price section above.
          </p>
        </Card>
      </div>
    </Section>
  );
}
