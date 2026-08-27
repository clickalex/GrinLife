import { cn } from "../lib/cn";

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

/**
 * Shared footer. Note the deliberate absence: Serendipity is quarantined by brand
 * policy, so it is never linked from an endorsed Grin property. `columns` is data,
 * which is what keeps that rule enforceable per app rather than per copy.
 */
export function SiteFooter({
  brand,
  blurb,
  columns,
  legal,
  Link,
  className,
}: {
  brand: string;
  blurb: string;
  columns: FooterColumn[];
  legal: string;
  Link: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
  className?: string;
}) {
  return (
    <footer className={cn("border-t border-border bg-parchment-deep/70", className)}>
      <div className="mx-auto grid max-w-[86rem] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-xl font-bold text-foreground">{brand}</p>
          <p className="text-sm leading-relaxed text-ink-soft">{blurb}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="grin-label mb-3 text-muted-foreground">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-semibold text-ink-soft hover:text-coral-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{legal}</p>
          <p className="grin-label">Built from one shared spine</p>
        </div>
      </div>
    </footer>
  );
}
