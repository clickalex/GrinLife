import {
  gateOneMarginFloorPct,
  legacyBookEconomics,
  marginTargetPct,
  unitEconomicsNote,
  type UnitEconomics,
} from "@grin/content";
import { cn } from "../lib/cn";
import { Callout } from "../primitives/Callout";
import { Card } from "../primitives/Card";
import { DataTable } from "../primitives/DataTable";

const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const pct = (value: number) => `${value.toFixed(1)}%`;

/**
 * The arithmetic behind Gate 1's margin criterion.
 *
 * The gate asks for a 50% margin and the site published the price but never what a book
 * costs to make, so the criterion was typed into a box by hand with nothing behind it.
 * This shows the parts. Every cost is a planning estimate with its basis printed beside
 * it, so replacing an estimate with a supplier quote moves the percentage without anyone
 * editing the percentage.
 */
export function UnitEconomicsTable({
  economics = legacyBookEconomics,
  floorPct = gateOneMarginFloorPct,
  targetPct = marginTargetPct,
  note = unitEconomicsNote,
  className,
}: {
  economics?: UnitEconomics;
  /** Gate 1's margin criterion. */
  floorPct?: number;
  /** The pricing note's own aspiration, which is stricter than the gate. */
  targetPct?: number;
  note?: string;
  className?: string;
}) {
  const margin = economics.marginPct;
  const clearsGate = margin >= floorPct;
  const clearsTarget = margin >= targetPct;

  return (
    <Card accent="honey" className={cn("p-5 sm:p-7", className)}>
      <p className="grin-label text-honey-ink">Unit economics</p>
      <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
        What a {economics.tier} book costs to make
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">Price transcribed from {economics.priceBasis}</p>

      <DataTable
        className="mt-5"
        accent="honey"
        caption={`Cost breakdown for the ${economics.tier} tier, in rupees per book`}
        head={["Line", "Per book", "Basis"]}
        rows={[
          ...economics.lines.map((line) => [
            <span key="label" className="text-foreground">
              {line.label}
            </span>,
            <span key="amount" className="font-mono tabular-nums text-ink-soft">
              {inr(line.amountInr)}
            </span>,
            <span key="basis" className="text-xs text-muted-foreground">
              {line.basis}
            </span>,
          ]),
          [
            <span key="total" className="font-bold text-foreground">
              Total cost
            </span>,
            <span key="amount" className="font-mono font-bold tabular-nums text-foreground">
              {inr(economics.costInr)}
            </span>,
            <span key="basis" className="text-xs text-muted-foreground">
              Sum of the lines above
            </span>,
          ],
          [
            <span key="margin" className="font-bold text-foreground">
              Gross margin
            </span>,
            <span
              key="amount"
              className={cn(
                "font-mono font-bold tabular-nums",
                clearsGate ? "text-moss-ink" : "text-coral-ink",
              )}
            >
              {inr(economics.marginInr)} · {pct(margin)}
            </span>,
            <span key="basis" className="text-xs text-muted-foreground">
              Derived — never typed
            </span>,
          ],
        ]}
      />

      <div className="mt-5">
        <Callout
          tone={clearsGate ? (clearsTarget ? "gate" : "warning") : "kill"}
          label="Against the criteria"
        >
          {clearsGate
            ? clearsTarget
              ? `At ${pct(margin)} this clears Gate 1's ${floorPct}% floor and the ${targetPct}% target in the pricing note.`
              : `At ${pct(margin)} this clears Gate 1's ${floorPct}% floor but not the ${targetPct}% the pricing note promises. The print quote is the swing factor, and it is the first number worth replacing with a real one.`
            : `At ${pct(margin)} this misses Gate 1's ${floorPct}% floor. On these costs the Book tier does not fund the next wave, which is what the gate exists to catch.`}
        </Callout>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </Card>
  );
}
