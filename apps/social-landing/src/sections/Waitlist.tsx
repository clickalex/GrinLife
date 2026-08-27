import { ButtonLink, Callout, Card, Eyebrow, Heading, Lede, Section, accentOf, cn } from "@grin/ui";

/**
 * The waitlist. Honest about the gate: Wave 2 does not start building until Wave 1
 * hits its month-12 numbers, so this page collects cities rather than signups that
 * would sit dead for a year.
 */
export function Waitlist() {
  const a = accentOf("moss");

  return (
    <Section sectionId="waitlist" tone="paper">
      <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <Eyebrow accent="moss">City waitlist</Eyebrow>
            <Heading size="title">Tell us your city. That is the whole form.</Heading>
            <Lede>
              A city opens at around 500 people waiting. Registering does not create an account and does not
              commit you to anything — it decides which city we open first.
            </Lede>
          </div>

          <ol className="space-y-4">
            {[
              {
                title: "You tell us your city and one vertical",
                body: "Running, cycling, books, board games, a trip you are planning. Verticals are how a city gets dense fast.",
              },
              {
                title: "We open the densest city first, not the loudest",
                body: "Wherever the waitlist can actually sustain real matches, and where we have people on the ground to run the first events.",
              },
              {
                title: "You hear honestly where your city stands",
                body: "If yours is not next, we say so rather than leaving you on a list that never moves.",
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
              href="mailto:cities@grinsocial.example?subject=GrinSocial%20city%20waitlist"
              accent="moss"
              size="lg"
            >
              Register your city
            </ButtonLink>
            <ButtonLink href="#price" variant="outline" size="lg">
              See the price first
            </ButtonLink>
          </div>

          <Callout tone="note" label="Why there is no signup form">
            <p>
              Because Wave 2 is gated on Wave 1. Collecting accounts we cannot serve for a year would be worse
              than asking for a city name — you would be an inactive user on day one, which is precisely the
              empty-room problem this product is trying not to become.
            </p>
          </Callout>
        </div>

        <Card accent="moss" variant="card" className="p-6">
          <p className="grin-label text-moss-ink">Opening criteria</p>
          <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
            A city opens when it stops being empty
          </p>

          <ul className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-sm">
            {[
              "~500 people on that city's waitlist",
              "At least one vertical dense enough to run events",
              "Ground presence for the first two meetups",
              "Grievance Officer named and contact published",
              "18+ age assurance working, not a birth-date field",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 leading-relaxed text-ink-soft">
                <span aria-hidden className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)} />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
            First launch target: 1,500 users in one city, at least 25 active groups, and 60% of people replying
            to a match in week one. Below that, the city is not ready and we do not open the next one.
          </p>
        </Card>
      </div>
    </Section>
  );
}
