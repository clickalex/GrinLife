import type { Phase, ProductId } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Lantern } from "./Lantern";
import { DualView } from "./DualView";
import { Card } from "../primitives/Card";
import { Callout } from "../primitives/Callout";
import { DataTable, TermTable } from "../primitives/DataTable";
import { Badge } from "../primitives/Badge";

const accentFor: Record<ProductId, Accent> = {
  legacy: "honey",
  social: "moss",
  serendipity: "violet",
};

/**
 * One phase of one product. Every phase in the portfolio renders through this single
 * component: Legacy sprints, GrinSocial sprints and Serendipity's inverted safety
 * order are all the same shape with different data.
 */
export function PhaseCard({
  phase,
  accent,
  explored = false,
  onExplored,
  className,
}: {
  phase: Phase;
  accent?: Accent;
  /** Lets the roadmap remember which stops the reader has visited. */
  explored?: boolean;
  onExplored?: (id: string) => void;
  className?: string;
}) {
  const tone = accent ?? accentFor[phase.product];
  const a = accentOf(tone);

  return (
    <Card
      id={phase.id}
      accent={tone}
      className={cn(
        "scroll-mt-28 p-5 sm:p-7",
        explored && "ring-1 ring-inset",
        explored && a.ring,
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Lantern n={phase.index + 1} accent={tone} size={48} label={`${phase.label} lantern`} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge accent={tone} mono>
              {phase.label}
            </Badge>
            <span className="grin-label text-muted-foreground">{phase.window}</span>
            {onExplored ? (
              <button
                type="button"
                aria-pressed={explored}
                onClick={() => onExplored(phase.id)}
                className={cn(
                  "grin-label ml-auto rounded-full border px-3 py-1 transition-colors",
                  explored
                    ? cn(a.bgSoft, a.text, a.border)
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {explored ? "Explored ✓" : "Mark explored"}
              </button>
            ) : null}
          </div>
          <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl">{phase.title}</h3>
        </div>
      </div>

      <div className="mt-5 border-t border-border/70 pt-5">
        <DualView child={phase.kidWords} parent={<p>{phase.summary}</p>} />
      </div>

      {phase.blocks.map((block) => (
        <div key={block.heading} className="mt-6">
          <p className="grin-label mb-3 text-muted-foreground">{block.heading}</p>
          {block.kind === "table" ? (
            <TermTable head={block.head} rows={block.rows} caption={block.heading} accent={tone} />
          ) : (
            <ul className="space-y-2.5">
              {block.items.map((item) => (
                <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  <span aria-hidden className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", a.dot)} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {phase.sprints.length > 0 ? (
        <div className="mt-6">
          <p className="grin-label mb-3 text-muted-foreground">Build order</p>
          <DataTable
            accent={tone}
            caption={`${phase.label} build order`}
            head={["Sprint", "Ships", "Shared spine"]}
            rows={phase.sprints.map((sprint) => [
              <span key="s" className="grin-label font-bold">
                {sprint.sprint}
              </span>,
              <span key="h" className="font-semibold text-foreground">
                {sprint.ships}
              </span>,
              sprint.shared ? (
                <span key="r" className={cn("inline-flex items-center gap-1.5 font-semibold", a.text)}>
                  <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
                  {sprint.reuse}
                </span>
              ) : (
                <span key="r" className="text-muted-foreground">
                  {sprint.reuse}
                </span>
              ),
            ])}
          />
        </div>
      ) : null}

      {phase.exitCriteria.length > 0 ? (
        <div className="mt-6">
          <p className="grin-label mb-3 text-muted-foreground">Exit criteria</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {phase.exitCriteria.map((criterion) => (
              <li
                key={criterion}
                className={cn(
                  "flex items-start gap-2 rounded-lg p-3 text-sm leading-relaxed",
                  a.bgSoft,
                  a.text,
                )}
              >
                <span aria-hidden className="mt-0.5 font-bold">
                  →
                </span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {phase.killSignal ? (
        <div className="mt-6">
          <Callout tone="kill">{phase.killSignal}</Callout>
        </div>
      ) : null}
    </Card>
  );
}
