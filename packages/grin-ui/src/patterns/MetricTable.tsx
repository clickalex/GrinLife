import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { DataTable } from "../primitives/DataTable";

/**
 * "Metrics that matter" — targets by month. The last column is highlighted because
 * it is the number the product is actually judged on.
 */
export function MetricTable({
  columns,
  rows,
  accent = "coral",
  caption = "Metrics that matter",
  className,
}: {
  columns: string[];
  rows: { metric: string; values: string[] }[];
  accent?: Accent;
  caption?: string;
  className?: string;
}) {
  const a = accentOf(accent);
  const last = columns[columns.length - 1] ?? "";

  return (
    <DataTable
      accent={accent}
      caption={caption}
      head={["Metric", ...columns]}
      highlightColumn={last}
      rows={rows.map((row) => [
        <span key="m" className="font-semibold text-foreground">
          {row.metric}
        </span>,
        ...row.values.map((value, i) => (
          <span
            key={i}
            className={cn(
              "font-mono text-sm tabular-nums",
              i === row.values.length - 1 ? cn("font-bold", a.text) : "text-ink-soft",
            )}
          >
            {value}
          </span>
        )),
      ])}
      className={className}
    />
  );
}
