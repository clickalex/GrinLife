import type { ComponentProps, ReactNode } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

type DataTableProps = ComponentProps<"div"> & {
  head: ReactNode[];
  rows: ReactNode[][];
  caption?: string;
  /** Bold the first column and give it a fixed measure — the plan's term/detail shape. */
  termFirst?: boolean;
  /** Highlight the column whose header matches this label (e.g. the Gate-1 month). */
  highlightColumn?: string;
  accent?: Accent;
};

/**
 * The one table every dense reference block in the plan documents renders through.
 * Horizontally scrollable on small screens instead of squeezing the copy.
 */
export function DataTable({
  head,
  rows,
  caption,
  termFirst = false,
  highlightColumn,
  accent = "coral",
  className,
  ...props
}: DataTableProps) {
  const highlightIndex = highlightColumn ? head.findIndex((h) => h === highlightColumn) : -1;
  const a = accentOf(accent);

  return (
    <div
      className={cn("-mx-1 overflow-x-auto rounded-lg border border-border bg-card px-1", className)}
      {...props}
    >
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border">
            {head.map((cell, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  "grin-label whitespace-nowrap px-4 py-3 text-muted-foreground",
                  i === highlightIndex && a.text,
                )}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-border/60 align-top last:border-0 hover:bg-muted/40">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    "px-4 py-3.5 leading-relaxed text-ink-soft",
                    termFirst && c === 0 && "font-bold text-foreground",
                    termFirst && c === 0 && "min-w-[10rem] max-w-[18rem]",
                    c === highlightIndex && cn(a.bgSoft, "font-semibold"),
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Convenience wrapper for the term/detail tables the plans use most often. */
export function TermTable({
  head,
  rows,
  caption,
  accent,
  className,
}: {
  head: [string, string];
  rows: { term: string; detail: string }[];
  caption?: string;
  accent?: Accent;
  className?: string;
}) {
  return (
    <DataTable
      head={head}
      rows={rows.map((r) => [r.term, r.detail])}
      caption={caption}
      termFirst
      accent={accent}
      className={className}
    />
  );
}
