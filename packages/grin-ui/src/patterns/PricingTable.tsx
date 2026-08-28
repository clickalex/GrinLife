import type { PricingTier } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Badge";

/**
 * One pricing table, two currencies. Legacy and GrinSocial both render through it,
 * which is why their pricing pages agree on emphasis and reading order.
 */
export function PricingTable({
  tiers,
  accent = "coral",
  note,
  currencyLabel = "India / International",
  className,
}: {
  tiers: PricingTier[];
  accent?: Accent;
  note?: string;
  currencyLabel?: string;
  className?: string;
}) {
  const a = accentOf(accent);

  return (
    <div className={cn("space-y-5", className)}>
      <p className="grin-label text-muted-foreground">{currencyLabel}</p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            accent={accent}
            interactive
            className={cn("flex flex-col p-5", tier.featured && cn("ring-2", a.ring))}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-foreground">{tier.name}</h3>
              {tier.featured ? (
                <Badge accent={accent} tone="solid" mono>
                  Popular
                </Badge>
              ) : null}
            </div>

            <p className={cn("mt-3 font-display text-3xl font-bold leading-none", a.text)}>{tier.india}</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{tier.international}</p>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{tier.includes}</p>
          </Card>
        ))}
      </div>

      {note ? <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}
