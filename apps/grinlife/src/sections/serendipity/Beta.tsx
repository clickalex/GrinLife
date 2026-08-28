import { ButtonLink, Callout, Card, Eyebrow, Heading, Lede, Section, accentOf, cn } from "@grin/ui";

/**
 * Closed beta. Honest about conditionality: this product may never open, and the
 * page says so rather than running a launch countdown for something that might be
 * cancelled by its own safety gates.
 */
export function Beta() {
  const a = accentOf("violet");

  return (
    <Section sectionId="beta" tone="paper">
      <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Eyebrow accent="violet">Closed beta</Eyebrow>
            <Heading size="title">5,000 people, invitation only, watched closely</Heading>
            <Lede>
              We are measuring one thing: what fraction of conversations go wrong, and what it costs to catch
              them. That number decides whether this product opens at all.
            </Lede>
          </div>

          <ol className="space-y-4">
            {[
              {
                title: "You verify as an adult first",
                body: "Before an invitation, not after. If verification fails, there is no account and nothing to delete.",
              },
              {
                title: "English and Hindi only, to begin with",
                body: "The classifier has to actually work in the languages we allow. We do not enable a language we cannot moderate.",
              },
              {
                title: "Matching runs during moderator shifts",
                body: "Someone is awake and watching the queue whenever two strangers can be paired.",
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
            <ButtonLink
              href="mailto:beta@serendipity.example?subject=Serendipity%20beta%20invitation"
              accent="violet"
              size="lg"
            >
              Ask for an invitation
            </ButtonLink>
            <ButtonLink href="#safety" variant="outline" size="lg">
              Read the safety model
            </ButtonLink>
          </div>

          <Callout tone="warning" label="This may never open">
            <p>
              The beta has pre-set thresholds. If serious incidents do not stay at zero, or moderation cost
              outruns plausible revenue per user, the product is shut down rather than paused. We would rather
              tell you that now than after you have invited your friends.
            </p>
          </Callout>
        </div>

        <Card accent="violet" variant="card" className="p-6">
          <p className="grin-label text-violet-ink">What we measure</p>
          <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
            Safety metrics before growth metrics
          </p>

          <dl className="mt-5 space-y-3 border-t border-border/70 pt-4 text-sm">
            {[
              ["Serious incidents", "0 — the only acceptable number"],
              ["Median time to act on a report", "Under 2 hours"],
              ["Classifier recall on red-line categories", "Above 95%"],
              ["Moderation cost per 1,000 chats", "Known, and below revenue per 1,000"],
              ["Permanent rate per chat pair", "Measured — above 4% once open"],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="font-bold text-foreground">{term}</dt>
                <dd className="mt-0.5 leading-relaxed text-ink-soft">{detail}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
            Note what is missing from that list: user counts, session length, daily actives. Those are the
            metrics that get this category into trouble.
          </p>
        </Card>
      </div>
    </Section>
  );
}
