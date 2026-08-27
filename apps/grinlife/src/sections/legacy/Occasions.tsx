import { Callout, Eyebrow, Heading, Lede, Section, accentOf, cn } from "@grin/ui";

const occasions = [
  { title: "A 60th, 70th, 75th or 80th", body: "The birthdays where the person says they want nothing." },
  { title: "Diwali", body: "The one week the whole family is in the same house, and the stories come out anyway." },
  { title: "Retirement", body: "Forty years of work and no record of any of it." },
  { title: "A grandchild's birth", body: "The moment a parent starts wondering what the child will remember." },
  { title: "A diagnosis", body: "Some families start here. We handle those with care and no deadlines." },
  { title: "Visiting from abroad", body: "You are home for ten days. Start the book while you are still in the same time zone." },
];

export function Occasions() {
  const a = accentOf("honey");

  return (
    <Section sectionId="occasions" tone="tint">
      <div className="space-y-8">
        <div className="space-y-3">
          <Eyebrow accent="honey">When families start</Eyebrow>
          <Heading size="title">Usually a birthday. Sometimes something harder.</Heading>
          <Lede>
            Nobody starts this on an ordinary Tuesday. Whatever brought you here, the mechanics are the same —
            and the deadline is never as tight as it feels.
          </Lede>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion) => (
            <li key={occasion.title} className={cn("rounded-lg border border-border bg-card p-5", a.border)}>
              <h3 className="font-display text-base font-bold text-foreground">{occasion.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{occasion.body}</p>
            </li>
          ))}
        </ul>

        <Callout tone="note" label="Buying it as a surprise">
          <p>
            You do not need your parent's phone number to place the order. We send a gift card, they choose
            when to start, and the first prompt waits until they are ready.
          </p>
        </Callout>
      </div>
    </Section>
  );
}
