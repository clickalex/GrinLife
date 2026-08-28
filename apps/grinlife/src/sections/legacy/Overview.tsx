/**
 * Grin Legacy — the case for the product, above its phase plan.
 * Moved here from the standalone landing app when the three sites were merged.
 */
import { Callout, Container, Eyebrow, Heading, Lede, Section, StatGrid } from "@grin/ui";
import { legacyPricing } from "@grin/content";

const bookTier = legacyPricing.find((tier) => tier.featured) ?? legacyPricing[1]!;

export function Overview() {
  return (
    <Section tone="paper">
      <div className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Eyebrow accent="honey">
            A gift for the person who has everything — except a record of their own life
          </Eyebrow>
          <Heading size="title">Their voice. Their stories. One beautiful book.</Heading>
          <Lede>
            Every week, one question arrives on WhatsApp. Your parent answers in their own voice. We shape it
            gently into prose, and after thirty stories a hardcover book arrives — with QR codes that play the
            original recording.
          </Lede>

          <div className="flex flex-wrap gap-2">
            {["No app to install", "Works on any phone with WhatsApp", "Hindi, English and more"].map(
              (claim) => (
                <span
                  key={claim}
                  className="inline-flex items-center rounded-full bg-honey-soft px-3.5 py-1.5 text-xs font-bold text-honey-ink"
                >
                  {claim}
                </span>
              ),
            )}
          </div>

          <Callout tone="note" label="The part we never automate">
            <p>
              A human reviews every story before print. Automated transcription is good and dialects are hard
              — Awadhi and Bhojpuri especially — so we would rather spend an editor's hour than ship a
              paragraph your family has to correct for the rest of their lives.
            </p>
          </Callout>
        </div>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border border-honey/45 bg-card p-6 shadow-[var(--shadow-lantern)]">
            {/* The book, drawn. No remote image, so nothing here can fail to load. */}
            <svg
              viewBox="0 0 240 180"
              className="w-full"
              role="img"
              aria-label="A hardcover book with a voice QR code"
            >
              <defs>
                <linearGradient id="grin-legacy-cover" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.14 75)" />
                  <stop offset="100%" stopColor="oklch(0.58 0.14 70)" />
                </linearGradient>
              </defs>
              <rect x="18" y="18" width="180" height="144" rx="8" fill="url(#grin-legacy-cover)" />
              <rect x="18" y="18" width="14" height="144" rx="6" fill="oklch(0.42 0.1 70)" />
              <rect x="44" y="40" width="120" height="6" rx="3" fill="oklch(1 0 0 / 0.85)" />
              <rect x="44" y="54" width="84" height="6" rx="3" fill="oklch(1 0 0 / 0.6)" />
              <rect x="44" y="68" width="100" height="6" rx="3" fill="oklch(1 0 0 / 0.45)" />
              <rect x="120" y="104" width="54" height="54" rx="4" fill="oklch(1 0 0)" />
              {[0, 1, 2, 3, 4, 5, 6].map((row) =>
                [0, 1, 2, 3, 4, 5, 6].map((col) =>
                  (row * 7 + col * 3 + row * col) % 3 === 0 ? (
                    <rect
                      key={`${row}-${col}`}
                      x={126 + col * 6}
                      y={110 + row * 6}
                      width="5"
                      height="5"
                      fill="oklch(0.26 0.035 258)"
                    />
                  ) : null,
                ),
              )}
              <text
                x="44"
                y="140"
                fontFamily="DM Mono, monospace"
                fontSize="9"
                fill="oklch(1 0 0 / 0.8)"
                letterSpacing="1.4"
              >
                SCAN TO HEAR HER VOICE
              </text>
            </svg>
          </div>

          <StatGrid
            accent="honey"
            className="grid-cols-2 lg:grid-cols-2"
            items={[
              { value: "52", label: "Weekly prompts", note: "Written for Indian families" },
              { value: "30", label: "Stories to a book", note: "Ship at 20 if life interrupts" },
              { value: bookTier.india, label: "One hardcover", note: bookTier.international },
              { value: "10", label: "First orders", note: "Served personally, by hand" },
            ]}
          />
        </div>
      </div>

      <Container size="wide" className="mt-10 px-0">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Below the story is the plan that builds it: four phases, each with an exit criterion, the pricing,
          the metrics the gate decision uses, the risks and the compliance obligations. Both halves come from
          the same content layer.
        </p>
      </Container>
    </Section>
  );
}
