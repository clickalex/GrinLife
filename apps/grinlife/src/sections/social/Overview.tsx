/**
 * GrinSocial — the case for the product, above its phase plan.
 * Moved here from the standalone landing app when the three sites were merged.
 */
import { Callout, Eyebrow, Heading, Lede, Section, StatGrid, accentOf, cn } from "@grin/ui";

const contrasts = [
  { them: "Infinite scroll", us: "Five to ten introductions, then done" },
  { them: "Follower counts", us: "No public counts at all" },
  { them: "Profiles to perform", us: "Private preferences you can change" },
  { them: "Groups that never die", us: "Groups that archive when their purpose ends" },
  { them: "Advertising", us: "Never — subscriptions and event fees instead" },
  { them: "Launch everywhere", us: "One city until it is genuinely alive" },
];

export function Overview() {
  const a = accentOf("moss");

  return (
    <Section tone="paper">
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Eyebrow accent="moss">Why no feed</Eyebrow>
            <Heading size="title">No feed. No follower count. Just five good introductions a week.</Heading>
            <Lede>
              You tell us what you are into and where you are. We introduce you to a handful of people a week
              who match. There is nothing to scroll and nothing to perform.
            </Lede>
            <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
              Every feed app measures success by how long you stay. A friendship app that does that will
              always show you more content instead of more people, because content is cheaper. So when you
              have had your introductions, this app has nothing left to show you. That is not a limitation we
              failed to solve — it is the product working.
            </p>
            <Callout tone="note" label="Why you cannot sign up yet">
              <p>
                GrinSocial is Wave 2 and it is gated: it only starts building once Wave 1 hits its numbers at
                month 12. Until then this page collects the city waitlist, which is how the first city gets
                chosen.
              </p>
            </Callout>
          </div>

          <StatGrid
            accent="moss"
            className="grid-cols-2 lg:grid-cols-2"
            items={[
              { value: "5–10", label: "Matches a week", note: "Capped, deliberately" },
              { value: "0", label: "Feeds", note: "Nothing to scroll" },
              { value: "1", label: "City at launch", note: "Density before scale" },
              { value: "₹199", label: "Optional plus", note: "Core matching stays free" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contrasts.map((row) => (
            <div key={row.them} className={cn("rounded-lg border border-border bg-card p-4", a.border)}>
              <p className="text-xs font-bold text-muted-foreground line-through">{row.them}</p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">{row.us}</p>
            </div>
          ))}
        </div>

        <Callout tone="warning" label="The hard part, stated plainly">
          <p>
            This kind of app dies empty, not unpopular. A thousand users spread across a country produce zero
            good matches; a thousand in one city produce a product. That is why we open one city at a time and
            refuse signups outside it.
          </p>
        </Callout>
      </div>
    </Section>
  );
}
