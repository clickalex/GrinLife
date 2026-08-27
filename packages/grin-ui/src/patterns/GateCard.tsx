import { cn } from "../lib/cn";
import { accentOf } from "../lib/accent";
import type { Gate } from "@grin/content";
import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Badge";
import { Callout } from "../primitives/Callout";

/**
 * A kill gate. All criteria must be true, so the card renders them as a checklist
 * with an explicit "all of these, not some" instruction — the plan's own framing.
 */
export function GateCard({
  gate,
  unlockedProduct,
  checked,
  onToggle,
  className,
}: {
  gate: Gate;
  unlockedProduct: string;
  /** Optional review state: which criteria the reader has confirmed. */
  checked?: string[];
  onToggle?: (n: string) => void;
  className?: string;
}) {
  const allChecked = checked ? gate.criteria.every((c) => checked.includes(c.n)) : false;
  const accent = gate.id === "gate-1" ? ("coral" as const) : ("violet" as const);
  const a = accentOf(accent);

  return (
    <Card accent={accent} className={cn("p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Badge accent={accent} tone="solid" mono>
          Gate {gate.id.slice(-1)}
        </Badge>
        <span className="grin-label text-muted-foreground">Month {gate.month}</span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-bold text-foreground">{gate.question}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Unlocks <strong className="text-foreground">{unlockedProduct}</strong>. All{" "}
        {gate.criteria.length} must be true — not some.
      </p>

      <ul className="mt-5 space-y-2">
        {gate.criteria.map((criterion) => {
          const isOn = checked?.includes(criterion.n) ?? false;
          return (
            <li key={criterion.n}>
              {onToggle ? (
                <button
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => onToggle(criterion.n)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    isOn ? cn(a.bgSoft, a.border) : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.65rem] font-bold",
                      isOn ? cn(a.bg, "border-transparent text-white") : "border-border text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span className={cn("text-sm leading-relaxed", isOn ? a.text : "text-ink-soft")}>
                    <span className="grin-label mr-2 opacity-70">{criterion.n}</span>
                    {criterion.text}
                  </span>
                </button>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <span className="grin-label mt-0.5 opacity-70">{criterion.n}</span>
                  <span className="text-sm leading-relaxed text-ink-soft">{criterion.text}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {onToggle ? (
        <p
          className={cn(
            "grin-label mt-4 rounded-lg p-3 text-center",
            allChecked ? cn(a.bgSoft, a.text) : "bg-muted text-muted-foreground",
          )}
          role="status"
        >
          {allChecked
            ? `Gate clear — ${unlockedProduct} may start building`
            : `${checked?.length ?? 0} of ${gate.criteria.length} confirmed`}
        </p>
      ) : null}

      <div className="mt-5 space-y-3">
        <Callout tone="warning" label="If not met">
          {gate.ifNotMet}
        </Callout>
        {gate.fudgeWarning ? <Callout tone="note">{gate.fudgeWarning}</Callout> : null}
      </div>
    </Card>
  );
}
