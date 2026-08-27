/**
 * GrinSocial — the Wave 2 landing page.
 *
 * Built from `@grin/ui` and `@grin/content` like every other Grin front-end. It is
 * honest about its own status: Wave 2 is blocked until Gate 1 passes, so the page
 * collects a waitlist rather than pretending to be open.
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
import { social } from "@grin/content";
import { Safety } from "./sections/Safety";
import { Waitlist } from "./sections/Waitlist";

function Link({ href, className, children }: { href: string; className?: string; children?: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const nav = [
  { label: "Why no feed", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "One city", href: "#city" },
  { label: "Price", href: "#price" },
  { label: "Safety", href: "#safety" },
];

const howItWorks = [
  {
    title: "You set preferences, not a profile",
    body: "Interests, sport, city, travel plans. Nothing to perform, nothing to keep current, no bio to write.",
  },
  {
    title: "Five to ten introductions a week",
    body: "Matched on tag overlap and location. Capped on purpose: a small number of real conversations beats an unlimited scroll.",
  },
  {
    title: "Groups built for a purpose",
    body: "A city, a sport, a trip. Not a permanent community you have to leave — a room with a reason to exist.",
  },
  {
    title: "They archive themselves",
    body: "The trip ends, the group closes. No graveyard of dead chats, no obligation to keep showing up somewhere stale.",
  },
];

export default function App() {
  const a = accentOf("moss");

  return (
    <ErrorBoundary>
      <SkipLink />

      <SiteHeader
        brand="GrinSocial"
        tagline="Wave 2 · gated on Gate 1"
        links={nav}
        currentPath="/"
        Link={Link}
        actions={
          <a
            href="#waitlist"
            className="rounded-full bg-moss px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-lantern)] transition-transform hover:-translate-y-0.5"
          >
            Join the city waitlist
          </a>
        }
      />

      <main id="main">
        <PageHero
          accent="moss"
          eyebrow="Preference-driven, feed-free connection"
          title="No feed. No follower count. Just five good introductions a week."
          lede="You tell us what you are into and where you are. We introduce you to a handful of people a week who match. That is the whole product — there is nothing to scroll, and nothing to perform."
          badges={
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-moss-soft px-3.5 py-1.5 text-xs font-bold text-moss-ink">
                No infinite scroll
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-moss-soft px-3.5 py-1.5 text-xs font-bold text-moss-ink">
                No ads, ever
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-moss-soft px-3.5 py-1.5 text-xs font-bold text-moss-ink">
                18+ verified
              </span>
            </>
          }
          actions={
            <>
              <ButtonLink href="#waitlist" accent="moss" size="lg">
                Join your city's waitlist
              </ButtonLink>
              <ButtonLink href="#why" variant="outline" size="lg">
                Why there is no feed
              </ButtonLink>
            </>
          }
          aside={
            <div className="space-y-4">
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
              <Callout tone="note" label="Why you cannot sign up yet">
                <p>
                  GrinSocial is Wave 2 of the Grin portfolio and it is gated: it only starts building once Wave
                  1 hits its numbers at month 12. The waitlist is how we choose the first city.
                </p>
              </Callout>
            </div>
          }
        />

        <Section sectionId="why" tone="paper">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Eyebrow accent="moss">Why no feed</Eyebrow>
              <Heading size="title">A feed optimises for time spent. This optimises for people met.</Heading>
              <Lede>
                Every feed app measures success by how long you stay. A friendship app that does that will
                always show you more content instead of more people, because content is cheaper.
              </Lede>
              <p className="max-w-xl text-[0.97rem] leading-relaxed text-ink-soft">
                So there is no feed here. There is a weekly number of introductions, and when you have had
                them, the app has nothing left to show you. That is not a limitation we failed to solve — it
                is the product working.
              </p>
              <Callout tone="warning" label="The hard part, stated plainly">
                <p>
                  This kind of app dies empty, not unpopular. A thousand users spread across a country produce
                  zero good matches; a thousand in one city produce a product. That is why we open one city at
                  a time and refuse signups outside it.
                </p>
              </Callout>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { them: "Infinite scroll", us: "Five to ten introductions, then done" },
                { them: "Follower counts", us: "No public counts at all" },
                { them: "Profiles to perform", us: "Private preferences you can change" },
                { them: "Groups that never die", us: "Groups that archive when their purpose ends" },
                { them: "Advertising", us: "Never — subscriptions and event fees instead" },
                { them: "Launch everywhere", us: "One city until it is genuinely alive" },
              ].map((row) => (
                <div key={row.them} className={cn("rounded-lg border border-border bg-card p-4", a.border)}>
                  <p className="text-xs font-bold text-muted-foreground line-through">{row.them}</p>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">{row.us}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section sectionId="how">
          <div className="space-y-8">
            <div className="space-y-3">
              <Eyebrow accent="moss">How it works</Eyebrow>
              <Heading size="title">Four things, and one of them is absence</Heading>
            </div>

            <ol className="grid gap-5 sm:grid-cols-2">
              {howItWorks.map((step, index) => (
                <li key={step.title}>
                  <Card accent="moss" className="h-full p-6">
                    <p className="grin-label text-moss-ink">Step {index + 1}</p>
                    <h3 className="mt-2 font-display text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                  </Card>
                </li>
              ))}
            </ol>

            <Callout tone="note" label="What we will not do to your matches">
              <p>
                No hard expiry clock. A match that goes quiet gets a one-tap "still interested" rather than a
                countdown that shames two people into performing. Conversation cannot be scheduled.
              </p>
            </Callout>
          </div>
        </Section>

        <Section sectionId="city" tone="tint">
          <div className="space-y-8">
            <div className="space-y-3">
              <Eyebrow accent="moss">One city at a time</Eyebrow>
              <Heading size="title">We would rather be full somewhere than thin everywhere</Heading>
              <Lede>
                A city opens at around 500 people on its waitlist. Until then you can register your interest,
                and we will tell you honestly where your city stands.
              </Lede>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Vertical beats geographic",
                  body: "\"Runners in Lucknow\" works at 300 people. \"Everyone in North India\" fails at 3,000.",
                },
                {
                  title: "Groups are the retention",
                  body: "Matching brings people in; groups keep them. Trip groups that archive themselves are the part nobody else does.",
                },
                {
                  title: "Events beat matching",
                  body: "The two things that actually produce friendship are events and existing communities. Both get built early.",
                },
              ].map((card) => (
                <Card key={card.title} accent="moss" variant="paper" className="p-5">
                  <h3 className="font-display text-base font-bold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{card.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        <Safety />
        <Waitlist />

        <Container size="narrow" className="py-14 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {social.name} · {social.tagline} 18+ only, verified. Grievance Officer contact published before the
            first user. Removed content handled within 24 hours.
          </p>
        </Container>
      </main>

      <SiteFooter
        brand="GrinSocial"
        blurb="Preference-driven, feed-free connection. Capped weekly matching, purpose-built groups, and no advertising — because there is no feed to sell it against."
        columns={[
          { title: "This page", links: nav },
          {
            title: "Trust",
            links: [
              { label: "Safety and rules", href: "#safety" },
              { label: "Price", href: "#price" },
              { label: "City waitlist", href: "#waitlist" },
            ],
          },
          {
            title: "Portfolio",
            links: [{ label: "The Grin roadmap", href: "/" }],
          },
        ]}
        legal="GrinSocial · Wave 2 of the Grin portfolio · 18+ · IT Rules 2021 intermediary duties apply."
        Link={Link}
      />
    </ErrorBoundary>
  );
}
