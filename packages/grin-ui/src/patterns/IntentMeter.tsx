import { intentLine, intentProgress, intentTarget } from "@grin/content";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";

/**
 * Gate 1's "250 customers", counted instead of emailed.
 *
 * Phase 0 sells through a `mailto:` link, so the criterion that gates the whole
 * portfolio is currently measured by someone counting an inbox. This publishes the
 * count against the gate — deliberately as *progress toward a number*, because a bare
 * "3" reads as failure while "the gate needs 250, three have asked" reads as a gate.
 *
 * It stores no contact details, so it creates no personal data and no DPDP obligation.
 */
export function IntentMeter({
  productName,
  count,
  target = intentTarget,
  onAsk,
  busy = false,
  asked = false,
  accent = "coral",
  className,
}: {
  productName: string;
  count: number;
  target?: number;
  /** Records one ask. No form, no account, no personal data. */
  onAsk: () => void;
  busy?: boolean;
  /** True once this visitor has asked, so the button cannot inflate the count. */
  asked?: boolean;
  accent?: Accent;
  className?: string;
}) {
  const a = accentOf(accent);
  const progress = intentProgress(count, target);
  const pct = Math.round(progress * 100);

  return (
    <Card accent={accent} variant="paper" className={cn("p-5 sm:p-6", className)}>
      <p className="grin-label text-muted-foreground">Intent</p>
      <p className="mt-2 font-display text-lg font-bold leading-snug text-foreground">
        {productName} — {intentLine(count, target)}
      </p>

      <div
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${productName} intent against the gate target`}
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", a.bg)}
          style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          accent={accent}
          variant={asked ? "secondary" : "primary"}
          size="sm"
          onClick={onAsk}
          disabled={busy || asked}
        >
          {asked ? "Counted — thank you" : "We would like this"}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Adds one to the public count. No name, no email, no account — nothing personal is stored, and the
          count is the only thing published.
        </p>
      </div>
    </Card>
  );
}
