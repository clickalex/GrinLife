import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

/** Source list. Every plan document ends with one, so the sites do too. */
export function Sources({
  items,
  accent = "coral",
  title = "Sources",
  className,
}: {
  items: string[];
  accent?: Accent;
  title?: string;
  className?: string;
}) {
  const a = accentOf(accent);

  if (items.length === 0) return null;

  return (
    <aside className={cn("rounded-lg border border-border bg-card p-5 sm:p-6", className)}>
      <p className={cn("grin-label mb-3", a.text)}>{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-border" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
