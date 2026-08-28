import type { GateHistoryEntry } from "@grin/content";
import { killTrigger } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Callout } from "../primitives/Callout";
import { Card } from "../primitives/Card";

type DriftState = "clear" | "retry" | "killed";

const driftCopy: Record<DriftState, { label: string; tone: "gate" | "warning" | "kill"; detail: string }> = {
  clear: {
    label: "No failures",
    tone: "gate",
    detail: "This gate has never been assessed and found short. Proceed when it clears.",
  },
  retry: {
    label: "One failure — retry once",
    tone: "warning",
    detail: "One recorded failure. The plan allows exactly one retry before the product is killed.",
  },
  killed: {
    label: "Two failures — kill",
    tone: "kill",
    detail: "Two recorded failures of this gate. The anti-drift rule says kill the product, not pause it.",
  },
};

/**
 * The gate's record, as a timeline.
 *
 * `GateBoard` shows where the numbers stand *now*. This shows what has already been
 * decided: the anti-drift rule (0 failures proceed, 1 retry, 2 kill) cannot be read
 * off current values, because a criterion that was missed and later corrected looks
 * identical to one that was never missed.
 */
export function GateTimeline({
  gateId,
  gateLabel,
  state,
  entries,
  onAssess,
  busy = false,
  accent = "coral",
  className,
}: {
  gateId: string;
  gateLabel: string;
  state: DriftState;
  entries: GateHistoryEntry[];
  /** Records a dated verdict. This is what counts as a failure — not a keystroke. */
  onAssess: () => void;
  busy?: boolean;
  accent?: Accent;
  className?: string;
}) {
  const a = accentOf(accent);
  const copy = driftCopy[state];
  const ordered = [...entries].sort((x, y) => x.at.localeCompare(y.at));

  return (
    <Card accent={accent} className={cn("p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Badge accent={accent} tone="solid" mono>
          {gateLabel}
        </Badge>
        <Badge
          tone={copy.tone === "gate" ? "soft" : "solid"}
          accent={copy.tone === "kill" ? "coral" : accent}
        >
          {copy.label}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{copy.detail}</p>

      <Callout
        tone={copy.tone === "kill" ? "kill" : copy.tone === "warning" ? "warning" : "rule"}
        label="Trigger"
      >
        {killTrigger}
      </Callout>

      <h3 className={cn("mt-5 font-display text-lg font-bold", a.text)}>Record</h3>

      {ordered.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing recorded yet. Measuring a criterion writes an entry here; assessing the gate writes a dated
          verdict, and that verdict is what the anti-drift rule counts.
        </p>
      ) : (
        <ol className="mt-3 space-y-2 border-l border-border pl-4">
          {ordered.map((entry, index) => (
            <li key={`${entry.at}-${index}`} className="relative text-sm leading-relaxed text-ink-soft">
              <span
                aria-hidden
                className={cn(
                  "absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full",
                  entry.kind === "assessment" ? (entry.clear ? "bg-moss" : "bg-coral") : "bg-border",
                )}
              />
              {entry.kind === "assessment" ? (
                <strong className={entry.clear ? "text-moss-ink" : "text-coral-ink"}>
                  {entry.clear ? "Assessed — gate clear" : "Assessed — not clear"}
                </strong>
              ) : null}
              <span className="block font-mono text-xs text-muted-foreground">
                {new Date(entry.at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                {entry.kind === "measurement" && typeof entry.n === "string" ? ` · criterion ${entry.n}` : ""}
                {typeof entry.value === "number" ? ` · ${entry.value}` : ""}
                {entry.confirmed ? " · confirmed" : ""}
                {entry.kind === "assessment" ? ` · ${entry.metCount} of ${entry.total}` : ""}
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button accent={accent} size="sm" onClick={onAssess} disabled={busy}>
          Assess {gateId.replace("gate-", "gate ")} now
        </Button>
        <p className="text-xs text-muted-foreground">
          Records a dated verdict. If the gate is short, that is a failure — and two of them kill the product.
        </p>
      </div>
    </Card>
  );
}
