import { relayColumns, relayLegend, relayTracks, type RelayState } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

const trackAccent: Record<string, Accent> = {
  legacy: "honey",
  social: "moss",
  serendipity: "violet",
};

const stateStyles: Record<RelayState, string> = {
  build: "bg-coral text-white",
  grow: "bg-coral-soft text-coral-ink",
  idle: "bg-muted/50 text-muted-foreground",
  gate: "bg-violet text-white",
};

/**
 * §3 of the portfolio plan, drawn: the 36-month relay.
 * The point the chart exists to make is visible at a glance — the tracks overlap in
 * market, and never in build.
 */
export function RelayChart({
  columns = relayColumns,
  tracks = relayTracks,
  legend = relayLegend,
  className,
}: {
  columns?: string[];
  tracks?: typeof relayTracks;
  legend?: typeof relayLegend;
  className?: string;
}) {
  return (
    <figure className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            36-month relay timeline for Grin Legacy, GrinSocial and Serendipity, in six-month columns.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="grin-label px-4 py-3 text-muted-foreground">
                Track
              </th>
              {columns.map((column) => (
                <th key={column} scope="col" className="grin-label px-2 py-3 text-center text-muted-foreground">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track) => {
              const accent = trackAccent[track.product] ?? "coral";
              const a = accentOf(accent);
              return (
                <tr key={track.product} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="px-4 py-4 text-left align-middle">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", a.dot)} />
                      <span className="flex flex-col">
                        <span className="font-bold text-foreground">{track.name}</span>
                        <span className="grin-label font-normal text-muted-foreground">{track.wave}</span>
                      </span>
                    </span>
                  </th>
                  {track.cells.map((cell, i) => (
                    <td key={i} className="px-1 py-3">
                      <div
                        className={cn(
                          "grid h-11 place-items-center rounded-md text-center text-xs font-bold transition-transform duration-200 hover:scale-[1.03]",
                          stateStyles[cell.state],
                        )}
                        title={`${track.name} · ${columns[i] ?? ""} · ${cell.label}`}
                      >
                        {cell.label}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {legend.map((entry) => (
          <span key={entry.state} className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft">
            <span
              aria-hidden
              className={cn(
                "h-3 w-3 rounded-sm",
                stateStyles[entry.state],
                entry.state === "idle" && "border border-border",
              )}
            />
            {entry.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
