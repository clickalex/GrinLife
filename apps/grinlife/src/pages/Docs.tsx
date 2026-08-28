/**
 * The source documents. This site is a rendering of these five files, not a
 * replacement for them — so every entry links back to the original in `Demo/DOCS/`.
 */
import { Callout, Card, Eyebrow, Heading, Lede, PageHero, Section, accentOf, cn } from "@grin/ui";
import { documents, portfolioSources } from "@grin/content";

const kindAccent = (kind: string) => {
  if (kind.startsWith("Strategy")) return "coral" as const;
  if (kind.startsWith("Wave 1")) return "honey" as const;
  if (kind.startsWith("Wave 2")) return "moss" as const;
  if (kind.startsWith("Wave 3")) return "violet" as const;
  return "coral" as const;
};

export default function Docs() {
  return (
    <>
      <PageHero
        eyebrow="Source of record"
        title="Five documents. Two strategic, three operational."
        lede="Everything on this site is transcribed from the plan documents in Demo/DOCS/. Read them in this order."
        aside={
          <Callout tone="rule" label="The one rule that makes this work">
            <p>
              Never more than one product in active build at a time. A product in market is allowed; a product
              in construction is not.
            </p>
          </Callout>
        }
      />

      <Section spacing="normal">
        <div className="space-y-14">
          <div className="space-y-5">
            <Eyebrow>Reading order</Eyebrow>
            <Heading size="title">The document index</Heading>
            <Lede>
              The paths below are relative to the repository root. They open as static files — the documents
              are self-contained HTML and need no server.
            </Lede>

            <ol className="grid gap-5">
              {documents.map((doc) => {
                const accent = kindAccent(doc.kind);
                const a = accentOf(accent);
                return (
                  <li key={doc.file}>
                    <Card accent={accent} interactive className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={cn("grin-label rounded-full px-2.5 py-1", a.bgSoft, a.text)}>
                          {doc.kind}
                        </span>
                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-ink-soft">
                          {doc.file}
                        </code>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold text-foreground">{doc.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{doc.summary}</p>
                    </Card>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-4">
            <Eyebrow>Citations</Eyebrow>
            <Heading size="subtitle">Sources the plan relies on</Heading>
            <ul className="grid gap-2 sm:grid-cols-2">
              {portfolioSources.map((source) => (
                <li
                  key={source}
                  className="rounded-lg border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground"
                >
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
