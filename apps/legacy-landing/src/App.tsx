/**
 * Grin Legacy — the Wave 1 Phase 0 landing page.
 *
 * The Legacy plan specifies this page precisely: "One page. Sample book photos,
 * 3 sample stories, one price, one CTA." Built entirely from `@grin/ui` patterns
 * and `@grin/content` data — it contains no components of its own.
 */
import {
  ButtonLink,
  Container,
  ErrorBoundary,
  PageHero,
  SiteFooter,
  SiteHeader,
  SkipLink,
  StatGrid,
} from "@grin/ui";
import { legacy, legacyPricing } from "@grin/content";
import { HowItWorks } from "./sections/HowItWorks";
import { SampleStories } from "./sections/SampleStories";
import { Occasions } from "./sections/Occasions";
import { Included } from "./sections/Included";
import { Order } from "./sections/Order";

/** Plain anchors: this page is one scroll, so no router is needed. */
function Link({ href, className, children }: { href: string; className?: string; children?: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const bookTier = legacyPricing.find((tier) => tier.featured) ?? legacyPricing[1]!;

const nav = [
  { label: "How it works", href: "#how" },
  { label: "Sample stories", href: "#samples" },
  { label: "What's included", href: "#included" },
  { label: "Price", href: "#price" },
];

export default function App() {
  return (
    <ErrorBoundary>
      <SkipLink />

      <SiteHeader
        brand="Grin Legacy"
        tagline="Wave 1 · Build now"
        links={nav}
        currentPath="/"
        Link={Link}
        actions={
          <a
            href="#order"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-lantern)] transition-transform hover:-translate-y-0.5"
          >
            Order a book
          </a>
        }
      />

      <main id="main">
        <PageHero
          accent="honey"
          eyebrow="A gift for the person who has everything — except a record of their own life"
          title="Their voice. Their stories. One beautiful book."
          lede="Every week, one question arrives on WhatsApp. Your parent answers in their own voice. We shape it gently into prose, and after thirty stories a hardcover book arrives — with QR codes that play the original recording."
          badges={
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3.5 py-1.5 text-xs font-bold text-honey-ink">
                No app to install
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3.5 py-1.5 text-xs font-bold text-honey-ink">
                Works on any phone with WhatsApp
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-honey-soft px-3.5 py-1.5 text-xs font-bold text-honey-ink">
                Hindi, English and more
              </span>
            </>
          }
          actions={
            <>
              <ButtonLink href="#order" accent="honey" size="lg">
                Order the book · {bookTier.india}
              </ButtonLink>
              <ButtonLink href="#samples" variant="outline" size="lg">
                Read three sample stories
              </ButtonLink>
            </>
          }
          aside={
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-honey/45 bg-card p-6 shadow-[var(--shadow-lantern)]">
                {/* The book, drawn. No remote image, so nothing here can fail to load. */}
                <svg viewBox="0 0 240 180" className="w-full" role="img" aria-label="A hardcover book with a voice QR code">
                  <defs>
                    <linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.14 75)" />
                      <stop offset="100%" stopColor="oklch(0.58 0.14 70)" />
                    </linearGradient>
                  </defs>
                  <rect x="18" y="18" width="180" height="144" rx="8" fill="url(#cover)" />
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
          }
        />

        <HowItWorks />
        <SampleStories />
        <Occasions />
        <Included />
        <Order />

        <Container size="narrow" className="py-14 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {legacy.name} · {legacy.tagline} Every story is reviewed by a human before it is printed. Full export
            of your audio and text is always available, and deleting an archive deletes it.
          </p>
        </Container>
      </main>

      <SiteFooter
        brand="Grin Legacy"
        blurb="Guided family storytelling that ends in a beautiful printed book. Part of the Grin portfolio — Wave 1, the product that funds the rest."
        columns={[
          { title: "This page", links: nav },
          {
            title: "Order",
            links: [
              { label: "Price and tiers", href: "#price" },
              { label: "How to order", href: "#order" },
              { label: "What's included", href: "#included" },
            ],
          },
          {
            title: "Portfolio",
            links: [{ label: "The Grin roadmap", href: "/" }],
          },
        ]}
        legal="Grin Legacy · Wave 1 of the Grin portfolio · DPDP Act 2023: contributors must be 18 or older."
        Link={Link}
      />
    </ErrorBoundary>
  );
}
