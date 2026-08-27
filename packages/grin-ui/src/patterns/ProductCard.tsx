import type { Product } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Card } from "../primitives/Card";
import { StatusBadge } from "../primitives/Badge";
import { Lantern } from "./Lantern";

/**
 * The three-doors card. One component, three products, three accents — the visual
 * anchor the Lantern Trail design calls for.
 */
export function ProductCard({
  product,
  Link,
  className,
  note,
}: {
  product: Product;
  Link: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
  className?: string;
  note?: string;
}) {
  const accent: Accent = product.accent;
  const a = accentOf(accent);

  return (
    <Card accent={accent} interactive className={cn("flex h-full flex-col p-6", className)}>
      <div className="flex items-start gap-4">
        <Lantern n={product.wave} accent={accent} size={44} label={`Wave ${product.wave}`} />
        <div className="min-w-0">
          <p className="grin-label text-muted-foreground">
            Wave {product.wave} · Months {product.months}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">{product.name}</h3>
        </div>
      </div>

      <p className="mt-4 font-semibold text-foreground">{product.tagline}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{product.pitch}</p>

      <dl className="mt-5 space-y-2 border-t border-border/70 pt-4 text-xs">
        <div>
          <dt className="grin-label text-muted-foreground">Why here</dt>
          <dd className="mt-0.5 leading-relaxed text-ink-soft">{product.whyHere}</dd>
        </div>
        {note ? (
          <div>
            <dt className="grin-label text-muted-foreground">Note</dt>
            <dd className="mt-0.5 leading-relaxed text-ink-soft">{note}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={product.status} label={product.statusLabel} />
        <Link
          href={product.route}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5",
            a.bg,
          )}
        >
          Open the plan
          <span aria-hidden>→</span>
        </Link>
      </div>
    </Card>
  );
}
