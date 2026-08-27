import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Container } from "../primitives/Container";
import { Eyebrow, Heading, Lede } from "../primitives/Typography";

/**
 * Opening block for every page and every product site. Same component, different
 * data — which is why the three product sites look like one family.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  accent = "coral",
  badges,
  actions,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  accent?: Accent;
  badges?: ReactNode;
  actions?: ReactNode;
  /** Optional right-hand panel: status card, stats, or the lantern motif. */
  aside?: ReactNode;
  className?: string;
}) {
  const a = accentOf(accent);

  return (
    <div className={cn("relative overflow-hidden border-b border-border", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl",
          a.bgSoft,
        )}
      />
      <Container className="relative py-16 sm:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {eyebrow ? <Eyebrow accent={accent}>{eyebrow}</Eyebrow> : null}
            <Heading as="h1" size="display">
              {title}
            </Heading>
            {lede ? <Lede>{lede}</Lede> : null}
            {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
            {actions ? <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div> : null}
          </div>
          {aside ? <div className="lg:pt-4">{aside}</div> : null}
        </div>
      </Container>
    </div>
  );
}
