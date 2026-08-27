import { spineRows as defaultRows, type SpineRow } from "@grin/content";
import { cn } from "../lib/cn";

const Yes = () => (
  <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-moss-soft text-moss-ink" title="Yes">
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3.2">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="sr-only">Yes</span>
  </span>
);

const No = () => (
  <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground" title="No">
    <span aria-hidden className="text-sm leading-none">
      –
    </span>
    <span className="sr-only">No</span>
  </span>
);

/**
 * §4 of the portfolio plan: what makes three products affordable.
 * Read the last column — it is the reason the build order matters more than the count.
 */
export function SpineMatrix({
  rows = defaultRows,
  columns = [
    { key: "legacy" as const, label: "Legacy", hint: "Wave 1" },
    { key: "social" as const, label: "Social", hint: "Wave 2" },
    { key: "luck" as const, label: "Serendipity", hint: "Wave 3" },
  ],
  className,
}: {
  rows?: SpineRow[];
  columns?: { key: "legacy" | "social" | "luck"; label: string; hint: string }[];
  className?: string;
}) {
  const waveCount = (builtIn: string) => (builtIn.startsWith("Wave 1") ? 1 : builtIn.startsWith("Wave 2") ? 2 : 3);

  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border bg-card", className)}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Shared services, which products use them, and which wave builds them.
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="grin-label px-4 py-3 text-muted-foreground">
              Shared service
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-3 text-center">
                <span className="block text-xs font-bold text-foreground">{column.label}</span>
                <span className="grin-label font-normal text-muted-foreground">{column.hint}</span>
              </th>
            ))}
            <th scope="col" className="grin-label px-4 py-3 text-left text-muted-foreground">
              Built in
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const wave = waveCount(row.builtIn);
            return (
              <tr key={row.service} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                <th scope="row" className="px-4 py-3.5 text-left font-semibold text-foreground">
                  {row.service}
                </th>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3.5 text-center">
                    {row[column.key] ? <Yes /> : <No />}
                  </td>
                ))}
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                      wave === 1 && "bg-coral-soft text-coral-ink",
                      wave === 2 && "bg-moss-soft text-moss-ink",
                      wave === 3 && "bg-violet-soft text-violet-ink",
                    )}
                  >
                    {row.builtIn}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
