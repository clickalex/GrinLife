import { Accordion, Eyebrow, Heading, Lede, PricingTable, Section } from "@grin/ui";
import { legacyPricing, legacyPricingNote } from "@grin/content";

const faqs = [
  {
    id: "who-writes",
    title: "Who writes the book?",
    content: (
      <p>
        Your parent does — by voice. We transcribe and lightly shape the prose so it reads well on a page, but
        the sentences, the opinions and the jokes stay theirs. Nothing is invented, and a human reviews every
        story before print.
      </p>
    ),
  },
  {
    id: "language",
    title: "What if they speak Hindi or a dialect, not English?",
    content: (
      <p>
        Tell us in their language. Prompts are delivered in the language your parent is comfortable in, and
        stories can be printed in that language or translated — your choice. For Awadhi and Bhojpuri we use
        human transcription rather than automation, because the software is not good enough yet and we would
        rather be slow than wrong.
      </p>
    ),
  },
  {
    id: "time",
    title: "How long does it take?",
    content: (
      <p>
        One story a week means roughly seven months, and the book ships at thirty stories. If life interrupts —
        illness, travel, a bad month — we pause billing and pick up where you left off. We promise the book at
        twenty stories, not fifty-two: a book in your hands beats a perfect one that never arrives.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Who can see the stories?",
    content: (
      <p>
        Only the people you invite. The archive is private to your family, contributor access is 18+, and a
        full export of every audio file and every piece of text is always available to you. If you delete the
        archive, it is deleted. Under India's DPDP Act 2023 we are a data fiduciary for this material, and we
        treat it that way.
      </p>
    ),
  },
  {
    id: "extra",
    title: "Can we order more copies later?",
    content: (
      <p>
        Yes — extra copies are ₹1,499 / $35 each, and most families order them for siblings. The audio QR
        codes are reprinted with every copy, so each book is complete on its own.
      </p>
    ),
  },
];

export function Included() {
  return (
    <>
      <Section sectionId="included">
        <div className="space-y-8">
          <div className="space-y-3">
            <Eyebrow accent="honey">What's included</Eyebrow>
            <Heading size="title">The questions people actually ask</Heading>
            <Lede>
              If yours is not here, write to us. During Phase 0 the person who answers is the person who will
              edit your book.
            </Lede>
          </div>

          <Accordion items={faqs} accent="honey" exclusive />
        </div>
      </Section>

      <Section sectionId="price" tone="paper">
        <div className="space-y-6">
          <div className="space-y-3">
            <Eyebrow accent="honey">One price, no subscription trap</Eyebrow>
            <Heading size="title">₹6,999 for the book. That is the whole thing.</Heading>
            <Lede>
              Fifty-two prompts, a year of weekly nudges, human editing, the family archive, and a hardcover
              with voice QR codes. Extra copies whenever you want them.
            </Lede>
          </div>

          <PricingTable accent="honey" tiers={legacyPricing} note={legacyPricingNote} />
        </div>
      </Section>
    </>
  );
}
