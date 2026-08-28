/**
 * The accessibility position, published.
 *
 * The test suite already enforces a real set of guarantees and none of it was visible
 * to the people it protects. Everything here is generated from
 * `accessibilityStatement` in `@grin/content`, and an audit check fails the build if any
 * guarantee names a test that no longer exists — so this page cannot quietly promise
 * something the suite stopped checking.
 */
import { Callout, Card, Eyebrow, Heading, Lede, PageHero, Section } from "@grin/ui";
import { accessibilityStatement, portfolio } from "@grin/content";

export default function Accessibility() {
  const statement = accessibilityStatement;

  return (
    <>
      <PageHero
        eyebrow="How this site is built"
        title={statement.title}
        lede={statement.intro}
        aside={
          <Callout tone="rule" label="The standard we are aiming at">
            <p>{statement.standard}</p>
          </Callout>
        }
      />

      <Section spacing="normal">
        <div className="space-y-14">
          <div className="space-y-5">
            <Eyebrow accent="moss">What is guaranteed</Eyebrow>
            <Heading size="title">Enforced on every build, not promised</Heading>
            <Lede>
              Each line below names the test that enforces it. If that test is deleted, this line stops being
              published — an audit check fails first.
            </Lede>

            <ul className="grid gap-4 md:grid-cols-2">
              {statement.guarantees.map((guarantee) => (
                <li key={guarantee.guarantee}>
                  <Card accent="moss" className="h-full p-5">
                    <p className="text-sm font-bold leading-snug text-foreground">{guarantee.guarantee}</p>
                    <p className="mt-3 font-mono text-[0.68rem] leading-relaxed text-muted-foreground">
                      enforced by: {guarantee.enforcedBy.join(" · ")}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <Eyebrow accent="coral">What is not</Eyebrow>
            <Heading size="title">Known imperfections</Heading>
            <Lede>
              Stated openly, because a page that claims perfection is not telling the truth about
              accessibility or anything else.
            </Lede>

            <ul className="space-y-4">
              {statement.knownIssues.map((issue) => (
                <li key={issue.issue}>
                  <Card accent="coral" variant="paper" className="p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={
                          issue.status === "mitigated"
                            ? "grin-label rounded-full bg-moss-soft px-3 py-1 text-moss-ink"
                            : "grin-label rounded-full bg-coral-soft px-3 py-1 text-coral-ink"
                        }
                      >
                        {issue.status === "mitigated" ? "Mitigated" : "Open"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{issue.issue}</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      <strong className="font-bold">Today: </strong>
                      {issue.workaround}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Eyebrow accent="violet">Report a barrier</Eyebrow>
            <Heading size="title">Tell us what did not work</Heading>
            <p className="max-w-3xl text-base leading-relaxed text-ink-soft">{statement.contactLine}</p>
            <Card accent="violet" className="p-5">
              <p className="grin-label text-violet-ink">Write to</p>
              <p className="mt-2">
                <a
                  href={`mailto:${statement.contact}?subject=Accessibility%20barrier%20on%20${portfolio.name}`}
                  className="font-mono text-sm text-foreground underline decoration-violet underline-offset-4 hover:text-violet-ink"
                >
                  {statement.contact}
                </a>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Say what you were trying to do, what happened, and which assistive technology you were using.
                Barriers are treated as defects with an owner, not as feedback.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
