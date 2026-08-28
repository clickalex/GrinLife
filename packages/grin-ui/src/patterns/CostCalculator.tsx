import { useMemo, useState } from "react";
import {
  baselineCostValues,
  costAssumptions,
  launchConversations,
  launchUsers,
  runCostModel,
  type CostAssumptionValues,
} from "@grin/content";
import { cn } from "../lib/cn";
import { Callout } from "../primitives/Callout";
import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/**
 * The relay argument, made stress-testable.
 *
 * `costComparison` is transcribed prose — "2–3 people", "Moderate" — so it cannot be
 * recomputed. This is an explicit model of the one claim that prose makes: that
 * Legacy's margin funds GrinSocial, and GrinSocial funds Serendipity. Move an
 * assumption and the model says where the relay breaks.
 *
 * It owns its own state deliberately: a reader stress-testing a number should not have
 * to reload to get the plan's assumptions back.
 */
export function CostCalculator({ className }: { className?: string }) {
  const [values, setValues] = useState<CostAssumptionValues>(baselineCostValues);
  const result = useMemo(() => runCostModel(values), [values]);

  const set = (id: string, value: number) => setValues((current) => ({ ...current, [id]: value }));
  const changed = costAssumptions.some((assumption) => values[assumption.id] !== assumption.baseline);

  return (
    <Card className={cn("p-5 sm:p-7", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-bold text-foreground">Stress the relay</h3>
        {changed ? (
          <button
            type="button"
            onClick={() => setValues(baselineCostValues)}
            className="rounded-full border border-border px-3 py-1 text-xs font-bold text-ink-soft hover:bg-muted"
          >
            Back to the plan&apos;s assumptions
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Every figure below is a planning assumption with its basis shown. The model holds GrinSocial&apos;s
        launch size at {launchUsers.toLocaleString("en-IN")} users and{" "}
        {(launchConversations / 1000).toFixed(0)}k conversations a month, because those are the plan&apos;s
        numbers rather than dials.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {costAssumptions.map((assumption) => {
          const value = values[assumption.id] ?? assumption.baseline;
          return (
            <div key={assumption.id} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label htmlFor={`cost-${assumption.id}`} className="text-sm font-bold text-foreground">
                  {assumption.label}
                </label>
                <span className="font-mono text-sm tabular-nums text-coral-ink">
                  {assumption.unit === "INR" ? inr(value) : `${value}${assumption.unit === "%" ? "%" : ""}`}
                </span>
              </div>
              <input
                id={`cost-${assumption.id}`}
                type="range"
                min={assumption.min}
                max={assumption.max}
                step={assumption.step}
                value={value}
                onChange={(event) => set(assumption.id, Number(event.target.value))}
                className="w-full accent-coral"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">{assumption.basis}</p>
            </div>
          );
        })}
      </div>

      <DataTable
        className="mt-7"
        caption="The relay arithmetic at the current assumptions"
        head={["Step", "Result", "How it is derived"]}
        rows={result.rows.map((row) => [
          <span key="label" className={cn("font-bold", row.breaks ? "text-coral-ink" : "text-foreground")}>
            {row.label}
            {row.breaks ? " — breaks here" : ""}
          </span>,
          <span
            key="value"
            className={cn("font-mono tabular-nums", row.breaks ? "text-coral-ink" : "text-foreground")}
          >
            {row.value}
          </span>,
          <span key="note" className="text-muted-foreground">
            {row.note}
          </span>,
        ])}
      />

      <div className="mt-5">
        {result.breakPoint ? (
          <Callout tone="kill" label="Where the relay breaks">
            {result.breakPoint}
          </Callout>
        ) : (
          <Callout tone="gate" label="The relay holds">
            Legacy&apos;s contribution covers GrinSocial&apos;s moderation at these assumptions, and funds a
            further city launch in {result.rows[3]?.value.replace(" months", "")} months. That is the whole
            argument: the second product is paid for by the first.
          </Callout>
        )}
      </div>
    </Card>
  );
}
