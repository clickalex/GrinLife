import { Card, Eyebrow, Heading, Lede, Section, accentOf, cn } from "@grin/ui";

/**
 * Three sample stories. The plan is explicit that the prompts should be culturally
 * specific — not "describe your childhood" but the question that actually unlocks
 * the memory. These excerpts are illustrative writing, not customer transcripts.
 */
const samples = [
  {
    prompt: "What did your mother cook on festival days, and who helped her?",
    excerpt:
      "The kitchen was not big enough for all of us, so we worked in shifts. Amma stood at the stove and gave orders like a general. My job was the ghee — I was trusted with the ghee because I was the only one who did not eat it by the spoonful. The smell of it is the smell of that whole house. When my wife heats ghee now, I am nine years old and being useful.",
  },
  {
    prompt: "Who was the first person in your family to leave the village, and what did they send back?",
    excerpt:
      "Chachaji left in 1968 with one suitcase and a tin trunk. He sent money every month without fail, in envelopes with the corner cut so nobody could steal it. But what we remember is the radio. It arrived by bus and the whole lane came to hear it. He gave us the world before he ever came home to see it.",
  },
  {
    prompt: "Tell me about the first time you saw your husband. Not the wedding — the first time.",
    excerpt:
      "At my cousin's wedding, and I was not supposed to look. So I looked at his shoes instead. They were polished and one lace was untied, and I thought: this man has nobody looking after him yet. I have been tying that lace for fifty-one years. Ask him about the shoes. He remembers it differently, but he is wrong.",
  },
];

export function SampleStories() {
  const a = accentOf("honey");

  return (
    <Section sectionId="samples">
      <div className="space-y-8">
        <div className="space-y-3">
          <Eyebrow accent="honey">Three sample stories</Eyebrow>
          <Heading size="title">This is what a prompt produces</Heading>
          <Lede>
            The question matters more than the writing. Fifty-two prompts, written for Indian families, each
            one specific enough that the answer cannot be a summary. Below, the prompt and the kind of story
            it produces.
          </Lede>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {samples.map((sample, index) => (
            <Card key={sample.prompt} accent="honey" variant="paper" className="flex flex-col p-6">
              <p className={cn("grin-label mb-3", a.text)}>Sample {index + 1}</p>
              <p className="font-display text-lg font-bold leading-snug text-foreground">“{sample.prompt}”</p>
              <blockquote className="mt-4 flex-1 border-l-2 border-honey/40 pl-4 text-[0.95rem] leading-relaxed text-ink-soft">
                {sample.excerpt}
              </blockquote>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
                Audio preserved · QR code in the book
              </p>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Illustrative samples, written to show the shape a real answer takes. Your storyteller's words stay
          theirs — we edit for clarity, never for content, and you approve every page before print.
        </p>
      </div>
    </Section>
  );
}
