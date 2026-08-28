import { killProcedure, killTrigger, type KillStep } from "@grin/content";
import { cn } from "../lib/cn";
import { Callout } from "../primitives/Callout";
import { Card } from "../primitives/Card";

/**
 * "Kill the product", as a procedure rather than a slogan.
 *
 * The plan is unusually honest that products die after two gate failures. The failure
 * mode is not the decision — it is executing that decision badly, under stress, by
 * someone who has never rehearsed it. So the steps, their owners and the evidence each
 * one leaves behind are written down now.
 *
 * Deliberately not interactive. A kill decision is a human one; this exists so the
 * human can execute it cleanly at 2am, not so a checkbox can make it feel done.
 */
export function ProcedureChecklist({
  steps = killProcedure,
  title = "If a product has to be killed",
  className,
}: {
  steps?: KillStep[];
  title?: string;
  className?: string;
}) {
  return (
    <Card variant="paper" className={cn("p-5 sm:p-7", className)}>
      <h3 className="font-display text-2xl font-bold text-foreground">{title}</h3>

      <div className="mt-4">
        <Callout tone="kill" label="When this applies">
          {killTrigger}
        </Callout>
      </div>

      <ol className="mt-6 space-y-5">
        {steps.map((step) => (
          <li key={step.order} className="flex gap-4">
            <span
              aria-hidden
              className="grin-label grid h-8 w-8 shrink-0 place-items-center rounded-full bg-coral-soft font-bold text-coral-ink"
            >
              {step.order}
            </span>
            <div className="min-w-0 space-y-1.5">
              <p className="font-display text-base font-bold text-foreground">{step.action}</p>
              <p className="text-sm leading-relaxed text-ink-soft">{step.detail}</p>
              <p className="font-mono text-xs text-muted-foreground">
                owner: {step.owner} · proof: {step.evidence}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
        Every step names an owner and the evidence it leaves. A step with no owner is a hope, and an audit
        check fails the build if one appears here without one.
      </p>
    </Card>
  );
}
