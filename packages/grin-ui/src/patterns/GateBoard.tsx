import type { Gate, GateVerdict } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf } from "../lib/accent";
import { Card } from "../primitives/Card";
import { Badge } from "../primitives/Badge";
import { Callout } from "../primitives/Callout";

/**
 * A kill gate as a live measurement board.
 *
 * `GateCard` renders the gate as prose. This renders the same gate against real
 * numbers: each criterion takes its measurement, and the verdict only clears when
 * every criterion is met — the plan allows no partial pass.
 *
 * The component owns no persistence. It reports edits upward, so the page decides
 * whether they go to the API or to local storage.
 */
/**
 * "14 Mar 2026" — a gate decision that carries no date cannot be audited later, and
 * `updatedAt` was being stored by the API without ever reaching the screen.
 */
function formatRecorded(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "an unknown date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function GateBoard({
  gate,
  verdict,
  unlockedProduct,
  online,
  busy = false,
  onValue,
  onConfirm,
  onNote,
  onReset,
  className,
}: {
  gate: Gate;
  verdict: GateVerdict;
  unlockedProduct: string;
  /** False when the API is unreachable and measurements are browser-local only. */
  online: boolean;
  busy?: boolean;
  onValue: (n: string, value: number | null) => void;
  onConfirm: (n: string, confirmed: boolean) => void;
  onNote: (n: string, note: string) => void;
  onReset: () => void;
  className?: string;
}) {
  const accent = gate.id === "gate-1" ? ("coral" as const) : ("violet" as const);
  const a = accentOf(accent);
  const progress = verdict.total === 0 ? 0 : verdict.metCount / verdict.total;

  return (
    <Card accent={accent} className={cn("flex flex-col p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Badge accent={accent} tone="solid" mono>
          Gate {gate.id.slice(-1)}
        </Badge>
        <span className="grin-label text-muted-foreground">Month {gate.month}</span>
        <span
          className={cn(
            "grin-label ml-auto rounded-full px-3 py-1",
            online ? "bg-moss-soft text-moss-ink" : "bg-muted text-muted-foreground",
          )}
          title={online ? "Measurements are stored on the server" : "Saved in this browser only"}
        >
          {online ? "Saved on server" : "Saved in browser"}
        </span>
      </div>

      <h3 className="mt-4 font-display text-2xl font-bold text-foreground">{gate.question}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Unlocks <strong className="text-foreground">{unlockedProduct}</strong>. All {verdict.total} must be
        true — not some.
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={a.text}>
            {verdict.metCount} of {verdict.total} met
          </span>
          <span className="text-muted-foreground">{Math.round(progress * 100)}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={verdict.metCount}
          aria-valuemin={0}
          aria-valuemax={verdict.total}
          aria-label={`${gate.id} criteria met`}
          className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500", a.bg)}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {verdict.criteria.map(({ input, state, met }) => (
          <li
            key={input.n}
            className={cn(
              "rounded-lg border p-3.5 transition-colors",
              met ? cn(a.bgSoft, a.border) : "border-border bg-card",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={cn("text-sm font-bold leading-snug", met ? a.text : "text-foreground")}>
                <span className="grin-label mr-2 opacity-70">{input.n}</span>
                {input.label}
              </p>
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                  met ? cn(a.bg, "text-white") : "border border-border text-transparent",
                )}
                aria-hidden
              >
                ✓
              </span>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {gate.criteria.find((criterion) => criterion.n === input.n)?.text}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {input.kind === "numeric" ? (
                <>
                  <label className="sr-only" htmlFor={`${gate.id}-${input.n}-value`}>
                    {input.label}
                  </label>
                  <input
                    id={`${gate.id}-${input.n}-value`}
                    type="number"
                    inputMode="decimal"
                    disabled={busy}
                    value={typeof state?.value === "number" ? state.value : ""}
                    placeholder="—"
                    onChange={(event) => {
                      const raw = event.target.value;
                      onValue(input.n, raw === "" ? null : Number(raw));
                    }}
                    className={cn(
                      "w-28 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm tabular-nums",
                      "focus:outline-2 focus:outline-offset-1",
                    )}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {input.direction === "at-most" ? "≤" : "≥"} {input.target}
                    {input.unit ? ` ${input.unit}` : ""}
                  </span>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  aria-pressed={state?.confirmed === true}
                  onClick={() => onConfirm(input.n, state?.confirmed !== true)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
                    state?.confirmed
                      ? cn(a.bg, "border-transparent text-white")
                      : "border-border text-ink-soft",
                  )}
                >
                  {state?.confirmed ? "Confirmed" : "Not yet"}
                </button>
              )}

              <label className="sr-only" htmlFor={`${gate.id}-${input.n}-note`}>
                Note for {input.label}
              </label>
              <input
                id={`${gate.id}-${input.n}-note`}
                type="text"
                disabled={busy}
                maxLength={500}
                value={state?.note ?? ""}
                placeholder="Add a note"
                onChange={(event) => onNote(input.n, event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs"
              />
            </div>

            {state?.updatedAt ? (
              <p className="mt-1.5 font-mono text-[0.62rem] text-muted-foreground">
                recorded {formatRecorded(state.updatedAt)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "grin-label mt-5 rounded-lg p-3 text-center",
          verdict.clear ? cn(a.bgSoft, a.text) : "bg-muted text-muted-foreground",
        )}
        role="status"
      >
        {verdict.clear
          ? `Gate clear — ${unlockedProduct} may start building`
          : `${verdict.metCount} of ${verdict.total} confirmed — the gate is not passed`}
      </div>

      <div className="mt-5 space-y-3">
        <Callout tone="warning" label="If not met">
          {gate.ifNotMet}
        </Callout>
        {gate.fudgeWarning ? <Callout tone="note">{gate.fudgeWarning}</Callout> : null}
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={busy}
        className="mt-5 self-start rounded-full border border-border px-4 py-1.5 text-xs font-bold text-ink-soft hover:bg-muted"
      >
        Reset this gate
      </button>
    </Card>
  );
}
