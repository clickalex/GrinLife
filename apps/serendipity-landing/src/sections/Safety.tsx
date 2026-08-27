import {
  Callout,
  Card,
  DataTable,
  Eyebrow,
  Heading,
  Lede,
  Section,
  TermTable,
} from "@grin/ui";
import { nonNegotiables, serendipity } from "@grin/content";

/**
 * The safety model and the price, together.
 *
 * Note the slice: the fourth non-negotiable change in the plan is the rename away
 * from the previous product name. Publishing that on this site would advertise the
 * very connection the separate legal entity exists to sever, so it stays in the
 * internal plan and off the public page.
 */
const publishableChanges = nonNegotiables.slice(0, 3);

export function Safety() {
  return (
    <>
      <Section sectionId="safety" tone="paper">
        <div className="space-y-8">
          <div className="space-y-3">
            <Eyebrow accent="violet">Safety</Eyebrow>
            <Heading size="title">Built in the opposite order to every other app</Heading>
            <Lede>
              The matching and the chat are a fortnight's work. The safety infrastructure is the actual
              product, and it exists before the first person is admitted.
            </Lede>
          </div>

          <DataTable
            accent="violet"
            caption="What is built before the product itself"
            head={["Built first", "Why it comes before the chat"]}
            rows={[
              { term: "Verified 18+ at signup", detail: "A date-of-birth field is not compliance. Real verification costs conversion, and that is the price of operating legally." },
              { term: "Text classification before delivery", detail: "Scanned before the other person sees it, not after they report it." },
              { term: "In-chat report button and human review", detail: "A report produces a case, a case produces an action, and the action is logged." },
              { term: "Grievance Officer workflow", detail: "Acknowledged within 24 hours, resolved within 15. A named human with published contact details." },
              { term: "Device and IP bans that survive re-signup", detail: "A ban that resets on a fresh account is not a ban." },
              { term: "CSAM detection and mandated reporting", detail: "A documented, tested pipeline with law-enforcement contacts established before launch. Not a feature added later." },
              { term: "Only then: matching and chat", detail: "Roughly two weeks of work, because everything hard was already built." },
            ].map((row) => [
              <span key="t" className="font-bold text-foreground">
                {row.term}
              </span>,
              <span key="d">{row.detail}</span>,
            ])}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card accent="violet" variant="card" className="p-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                Why "no logs" was the wrong promise
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                "Chats live in memory and never touch a database" sounds protective. In practice it means no
                evidence, no actionable reports and no cooperation with law enforcement — exactly the fact
                pattern regulators describe as negligent design. So the chat is ephemeral to you, while a
                short-window encrypted safety log lets us answer a complaint and a court order.
              </p>
            </Card>

            <Card accent="violet" variant="card" className="p-6">
              <h3 className="font-display text-lg font-bold text-foreground">
                Operating hours, at first
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                During the closed beta, matching is live only while a human moderator is on shift. It is
                unglamorous and it caps how fast this can grow. That is the point: usage must never grow faster
                than our ability to moderate it, because moderation cost rises with scale while revenue does
                not.
              </p>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Eyebrow accent="violet">Three things this is not</Eyebrow>
              <Heading size="subtitle">The spec, corrected</Heading>
            </div>
            <DataTable
              accent="violet"
              caption="Changes from the original anonymous-chat spec"
              head={["The tempting version", "What we built instead", "Why"]}
              rows={publishableChanges.map((row) => [
                <span key="o" className="font-semibold text-muted-foreground line-through decoration-violet/50">
                  {row.original}
                </span>,
                <span key="r" className="font-bold text-foreground">
                  {row.replace}
                </span>,
                <span key="w">{row.why}</span>,
              ])}
            />
          </div>

          <div className="space-y-4">
            <Eyebrow accent="violet">Obligations</Eyebrow>
            <TermTable
              accent="violet"
              caption="Serendipity compliance obligations"
              head={["Obligation", "What it means"]}
              rows={serendipity.compliance.map((row) => ({ term: row.obligation, detail: row.detail }))}
            />
          </div>

          <Callout tone="kill" label="Hard stop">
            <p>
              Any single incident involving a minor, or moderation cost exceeding plausible lifetime revenue
              per user, ends the product. Not a pause — a shutdown, using a kill-switch plan written before
              launch: user notification, data deletion, law-enforcement contact, public statement, within 48
              hours.
            </p>
          </Callout>
        </div>
      </Section>

      <Section sectionId="price">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Eyebrow accent="violet">Price</Eyebrow>
            <Heading size="title">₹49, once. That is the whole business model.</Heading>
            <Lede>
              Not because it is much money. Because a small fee is a serious quality filter: it deters
              throwaway accounts, it funds moderation, and it leaves a payment trail that makes a ban stick.
            </Lede>
            <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
              The framing we would rather use than a sales pitch: we do not sell your data, and there are no
              advertisers in this category who would have us. The fee is what keeps the moderation real.
            </p>
          </div>

          <div className="space-y-4">
            <DataTable
              accent="violet"
              caption="Revenue options considered"
              head={["Model", "Verdict"]}
              rows={[
                ["₹49 one-time entry", "Chosen. Quality filter, funds moderation, makes bans enforceable."],
                ["₹99/month subscription", "Possible later, for interest-filtered matching and more daily chats."],
                ["Advertising", "Ruled out. Advertisers abandon this category, and it is uninsurable on brand safety."],
                ["Free at scale", "The trap. Unbounded moderation cost against zero revenue."],
              ].map(([model, verdict]) => [
                <span key="m" className="font-bold text-foreground">
                  {model}
                </span>,
                <span key="v">{verdict}</span>,
              ])}
            />

            <Callout tone="note" label="What the money is measured against">
              <p>
                Moderation cost per 1,000 conversations, tracked monthly. If it exceeds revenue per 1,000, the
                model is broken and growth stops — found out at 10,000 users rather than 500,000.
              </p>
            </Callout>
          </div>
        </div>
      </Section>
    </>
  );
}
