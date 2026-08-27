import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

export function Stat({
  value,
  label,
  note,
  accent = "coral",
  className,
}: {
  value: string;
  label: string;
  note?: string;
  accent?: Accent;
  className?: string;
}) {
  const a = accentOf(accent);
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <p className={cn("font-display text-3xl font-bold leading-none sm:text-4xl", a.text)}>{value}</p>
      <p className="mt-2 text-sm font-bold text-foreground">{label}</p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function StatGrid({
  items,
  accent,
  className,
}: {
  items: { value: string; label: string; note?: string }[];
  accent?: Accent;
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <Stat key={item.label} {...item} accent={accent} />
      ))}
    </dl>
  );
}
