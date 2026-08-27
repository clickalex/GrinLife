import { Callout, Card, Eyebrow, Heading, Lantern, Lede, Section } from "@grin/ui";

const steps = [
  {
    n: 1,
    title: "One question a week, on WhatsApp",
    body: "No app to install, no login to remember. A question arrives at a time your parent chooses — Tuesday evening, Sunday morning, whenever suits them.",
  },
  {
    n: 2,
    title: "They answer by voice note",
    body: "Two minutes or twenty. In Hindi, English, Bhojpuri or whatever language the memory actually lives in. Nothing to type.",
  },
  {
    n: 3,
    title: "We shape it gently into prose",
    body: "Transcription, then a light editorial pass that keeps their sentences and their rhythm. A human reads every story before it goes anywhere near a printer.",
  },
  {
    n: 4,
    title: "A hardcover book arrives",
    body: "Thirty stories, photographs, and a QR code beside each one. Scan it and the room fills with their voice, exactly as they told it.",
  },
];

export function HowItWorks() {
  return (
    <Section sectionId="how" tone="paper">
      <div className="space-y-8">
        <div className="space-y-3">
          <Eyebrow accent="honey">How it works</Eyebrow>
          <Heading size="title">Four steps, none of which need a computer</Heading>
          <Lede>
            The whole product is designed around one fact: the person telling the stories is not the person
            buying them. So nothing here asks your parent to learn anything.
          </Lede>
        </div>

        <ol className="grid gap-5 sm:grid-cols-2">
          {steps.map((step) => (
            <li key={step.n}>
              <Card accent="honey" variant="card" className="h-full p-6">
                <Lantern n={step.n} accent="honey" size={44} label={`Step ${step.n}`} />
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <Callout tone="note" label="The part we never automate">
          <p>
            A human reviews every single story before print. Automated transcription is good and dialects are
            hard — Awadhi and Bhojpuri especially — so we would rather spend an editor's hour than ship a
            paragraph your family has to correct for the rest of their lives.
          </p>
        </Callout>
      </div>
    </Section>
  );
}
