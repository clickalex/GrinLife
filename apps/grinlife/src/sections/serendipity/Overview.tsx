/**
 * Serendipity — the case for the product, above its phase plan.
 * Moved here from the standalone landing app when the three sites were merged.
 *
 * The copy itself still carries no Grin reference. Merging the front-ends put this
 * product on the same domain as the other two, which the portfolio plan's brand
 * architecture argues against — that trade-off is recorded in ROADMAP.md rather
 * than quietly absorbed into the page.
 */
import { Callout, Card, Eyebrow, Heading, Lede, Section, StatGrid, accentOf, cn } from "@grin/ui";

const contrasts = [
  { them: "Full anonymity, no signup", us: "Pseudonymous — unknown to each other, known to us" },
  { them: "Video roulette", us: "Text only — no camera, no photo, no voice" },
  { them: "\"No logs, ever\"", us: "Ephemeral to you; a short encrypted safety log for us" },
  { them: "Free at any scale", us: "Paid entry, and growth capped to what we can moderate" },
];

export function Overview() {
  const a = accentOf("violet");

  return (
    <Section tone="paper">
      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Eyebrow accent="violet">Conversation before identity</Eyebrow>
            <Heading size="title">Talk to a stranger. Keep it only if you both want to.</Heading>
            <Lede>
              Random, pseudonymous, text-only conversation between verified adults. No profile to build, no
              photo to judge, no camera anywhere. When the chat ends it is gone — unless you both press
              Permanent.
            </Lede>
            <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
              Full anonymity sounds like freedom and behaves like impunity. Keeping the pseudonymity and
              dropping the invisibility removes the largest single category of harm at almost no cost to the
              experience: you get a conversation with no history and no judgement, and we keep the ability to
              remove someone permanently.
            </p>
            <Callout tone="note" label="Why text only">
              <p>
                Live video abuse happens in real time and cannot be reviewed afterwards. Text can be scanned
                before it is delivered. That single decision removes most of the harm surface this category is
                known for, and it is not something we plan to revisit.
              </p>
            </Callout>
          </div>

          <StatGrid
            accent="violet"
            className="grid-cols-2 lg:grid-cols-2"
            items={[
              { value: "0", label: "Cameras", note: "Text is the only medium" },
              { value: "18+", label: "Verified, not declared", note: "A birth-date field is not compliance" },
              { value: "₹49", label: "One-time entry", note: "Funds moderation; makes bans stick" },
              { value: "5,000", label: "Beta cap", note: "Invitation only, moderator on shift" },
            ]}
          />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {contrasts.map((row) => (
              <div key={row.them} className={cn("rounded-lg border border-border bg-card p-4", a.border)}>
                <p className="text-xs font-bold text-muted-foreground line-through">{row.them}</p>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">{row.us}</p>
              </div>
            ))}
          </div>

          <Card accent="violet" variant="card" className="p-6">
            <p className="grin-label text-violet-ink">The Permanent button</p>
            <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
              Both of you press it, or neither of you has it
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-violet-soft px-4 py-2.5 text-sm text-violet-ink">
                  This is the first conversation I have had in months that did not start with a photo.
                </p>
              </div>
              <div className="flex justify-start">
                <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-ink-soft">
                  Same. I usually delete these apps within a week.
                </p>
              </div>
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-violet-soft px-4 py-2.5 text-sm text-violet-ink">
                  I am pressing Permanent. No pressure if you do not.
                </p>
              </div>
              <div className="flex justify-center pt-1">
                <span className={cn("rounded-full px-4 py-2 text-xs font-bold text-white", a.bg)}>
                  Permanent — waiting for the other person
                </span>
              </div>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                Illustrative. If only one person presses it, nothing is saved and neither learns who pressed it.
              </p>
            </div>
          </Card>
        </div>

        <Callout tone="kill" label="Read before you join">
          <p>
            This product only exists if its safety gates pass. If they do not, it is cancelled — not paused.
            Nothing depends on it, and the option to walk away is worth more than the product.
          </p>
        </Callout>
      </div>
    </Section>
  );
}
