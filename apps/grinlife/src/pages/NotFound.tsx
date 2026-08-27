import { ButtonLink, Container, Eyebrow, Heading, Lede } from "@grin/ui";
import { primaryNav } from "@grin/content";
import { Link } from "../router";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-28 sm:py-40">
      <Eyebrow>Off the trail</Eyebrow>
      <Heading as="h1" size="display" className="mt-4">
        This stop does not exist
      </Heading>
      <Lede className="mt-4">
        The path you followed is not part of the roadmap. Pick a stop below — the trail continues from any of
        them.
      </Lede>

      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {primaryNav.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-muted"
            >
              {link.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ButtonLink href="/">Back to the portfolio</ButtonLink>
      </div>
    </Container>
  );
}
