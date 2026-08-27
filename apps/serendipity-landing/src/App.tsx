/**
 * Serendipity — the Wave 3 landing page.
 *
 * This front-end reuses the shared codebase but shares nothing public-facing with
 * Grin, exactly as the brand architecture requires: no Grin name, no cross-links,
 * no "a Grin company" footer. That constraint is deliberate, not an omission — the
 * quarantine is the entire reason the product runs in a separate legal entity.
 */
import {
  ButtonLink,
  Callout,
  Card,
  Container,
  ErrorBoundary,
  Eyebrow,
  Heading,
  Lede,
  PageHero,
  Section,
  SiteFooter,
  SiteHeader,
  SkipLink,
  StatGrid,
  accentOf,
  cn,
} from "@grin/ui";
import { Safety } from "./sections/Safety";
import { Beta } from "./sections/Beta";

function Link({ href, className, children }: { href: string; className?: string; children?: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const nav = [
  { label: "The idea", href: "#idea" },
  { label: "Permanent", href: "#permanent" },
  { label: "Safety", href: "#safety" },
  { label: "Price", href: "#price" },
];

export default function App() {
  const a = accentOf("violet");

  return (
    <ErrorBoundary>
      <SkipLink />

      <SiteHeader
        brand="Serendipity"
        tagline="Text-only · 18+"
        links={nav}
        currentPath="/"
        Link={Link}
        actions={
          <a
            href="#beta"
            className="rounded-full bg-violet px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-lantern)] transition-transform hover:-translate-y-0.5"
          >
            Closed beta
          </a>
        }
      />

      <main id="main">
        <PageHero
          accent="violet"
          eyebrow="Conversation before identity"
          title="Talk to a stranger. Keep it only if you both want to."
          lede="Random, pseudonymous, text-only conversation between verified adults. No profile to build, no photo to judge, no camera anywhere. When the chat ends it is gone — unless you both press Permanent."
          badges={
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-soft px-3.5 py-1.5 text-xs font-bold text-violet-ink">
                Text only — no video, ever
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-soft px-3.5 py-1.5 text-xs font-bold text-violet-ink">
                Verified 18+
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-soft px-3.5 py-1.5 text-xs font-bold text-violet-ink">
                ₹49 once, not a subscription
              </span>
            </>
          }
          actions={
            <>
              <ButtonLink href="#beta" accent="violet" size="lg">
                Ask for a beta invitation
              </ButtonLink>
              <ButtonLink href="#safety" variant="outline" size="lg">
                Read the safety model first
              </ButtonLink>
            </>
          }
          aside={
            <div className="space-y-4">
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
              <Callout tone="kill" label="Read before you join">
                <p>
                  This product only exists if its safety gates pass. If they do not, it is cancelled — not
                  paused. Nothing depends on it, and the option to walk away is worth more than the product.
                </p>
              </Callout>
            </div>
          }
        />

        <Section sectionId="idea" tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Eyebrow accent="violet">The idea</Eyebrow>
              <Heading size="title">Anonymity to each other. Accountability to us.</Heading>
              <Lede>
                You still talk to "Stranger." But every account is verified as an adult behind the scenes, so
                bad actors are traceable and bannable.
              </Lede>
              <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
                Full anonymity sounds like freedom and behaves like impunity. It removes the largest single
                category of harm at almost no cost to the experience to keep the pseudonymity and drop the
                invisibility. You get a conversation with no history and no judgement; we get the ability to
                remove someone permanently.
              </p>
              <Callout tone="note" label="Why text only">
                <p>
                  Live video abuse happens in real time and cannot be reviewed afterwards. Text can be scanned
                  before it is delivered. That single decision removes most of the harm surface this category
                  is known for, and it is not something we plan to revisit.
                </p>
              </Callout>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { them: "Full anonymity, no signup", us: "Pseudonymous — unknown to each other, known to us" },
                { them: "Video roulette", us: "Text only. Voice much later, if ever." },
                { them: "\"No logs, ever\"", us: "Ephemeral to you; a short encrypted safety log for us" },
                { them: "Free at any scale", us: "Paid entry, and growth capped to what we can moderate" },
              ].map((row) => (
                <div key={row.them} className={cn("rounded-lg border border-border bg-card p-4", a.border)}>
                  <p className="text-xs font-bold text-muted-foreground line-through">{row.them}</p>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">{row.us}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section sectionId="permanent">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-4">
              <Eyebrow accent="violet">The Permanent button</Eyebrow>
              <Heading size="title">Both of you press it, or neither of you has it</Heading>
              <Lede>
                Most conversations with strangers should end. The few that should not, deserve a mechanism that
                requires agreement rather than a screenshot.
              </Lede>
              <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
                At any point either person can press Permanent. If the other presses it too, the conversation
                is saved into both accounts and you can continue later, with identities still hidden until you
                choose otherwise. If only one of you presses it, nothing is saved and neither of you learns
                who pressed it.
              </p>
              <Callout tone="note" label="No screenshots, no exports, no recovery">
                <p>
                  If the chat was not made Permanent by both of you, it is gone from your view at the end of
                  the session. We do not offer a way to retrieve it, because a retrievable conversation is not
                  an ephemeral one.
                </p>
              </Callout>
            </div>

            <Card accent="violet" variant="card" className="p-6">
              <div className="space-y-3">
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

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className={cn("rounded-full px-4 py-2 text-xs font-bold text-white", a.bg)}>
                    Permanent — waiting for the other person
                  </span>
                </div>

                <p className="pt-2 text-center text-xs text-muted-foreground">
                  Illustrative. Sessions end when either person leaves; unshared chats are removed from view.
                </p>
              </div>
            </Card>
          </div>
        </Section>

        <Safety />
        <Beta />

        <Container size="narrow" className="py-14 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Serendipity is text-only and open only to verified adults. Matching runs only while a human
            moderator is on shift. Any incident involving a minor ends the product immediately.
          </p>
        </Container>
      </main>

      <SiteFooter
        brand="Serendipity"
        blurb="Conversation before identity. Random, pseudonymous, text-only conversation between verified adults — ephemeral unless both people choose to keep it."
        columns={[
          { title: "This page", links: nav },
          {
            title: "Rules",
            links: [
              { label: "Safety model", href: "#safety" },
              { label: "Price", href: "#price" },
              { label: "Closed beta", href: "#beta" },
            ],
          },
          {
            title: "If something goes wrong",
            links: [{ label: "Report inside the chat", href: "#safety" }],
          },
        ]}
        legal="Serendipity · operated by an independent company · 18+ only, verified · text-only by design."
        Link={Link}
      />
    </ErrorBoundary>
  );
}
