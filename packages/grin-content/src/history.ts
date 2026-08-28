/**
 * Gate history and intent capture — the two things the plan needs counted and
 * currently are not.
 *
 * The anti-drift rule is: 0 gate failures → proceed, 1 → retry once, 2 → kill.
 * `antiDriftState` implements the arithmetic, but nothing recorded a failure, so the
 * rule could only ever be asserted by hand. A failure here is a recorded
 * **assessment** — a dated decision that the gate did not clear — and not a
 * keystroke, because otherwise editing one criterion twelve times would kill a
 * product.
 */
import type { ProductId } from "./types";
import { antiDriftState } from "./gateStatus";

export type GateHistoryKind = "measurement" | "assessment" | "reset";

export interface GateHistoryEntry {
  /** ISO timestamp, set by the server. */
  at: string;
  gateId: string;
  kind: GateHistoryKind;
  /** Criterion id, for measurements. */
  n?: string;
  value?: number;
  confirmed?: boolean;
  /** Whether that criterion was met at the time, for measurements. */
  met?: boolean;
  /** Present on assessments: the gate's verdict at that moment. */
  clear?: boolean;
  metCount?: number;
  total?: number;
  note?: string;
}

export type GateHistory = GateHistoryEntry[];

/** Assessments are the only entries that can constitute a failure. */
export function assessmentsFor(history: GateHistory, gateId: string): GateHistoryEntry[] {
  return history
    .filter((entry) => entry.gateId === gateId && entry.kind === "assessment")
    .sort((a, b) => a.at.localeCompare(b.at));
}

/** How many times this gate has been assessed and found not clear. */
export function failuresFor(history: GateHistory, gateId: string): number {
  return assessmentsFor(history, gateId).filter((entry) => entry.clear === false).length;
}

/** The anti-drift verdict, computed from the record instead of asserted by hand. */
export function antiDriftFromHistory(history: GateHistory, gateId: string): "clear" | "retry" | "killed" {
  return antiDriftState(failuresFor(history, gateId));
}

const shortDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "an unknown date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

/** One line per entry, in order — the timeline the gates page renders. */
export function historyLines(history: GateHistory, gateId: string): string[] {
  return history
    .filter((entry) => entry.gateId === gateId)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((entry) => {
      const when = shortDate(entry.at);
      if (entry.kind === "reset") return `${when} — the gate was reset`;
      if (entry.kind === "assessment") {
        const score = `${entry.metCount ?? 0} of ${entry.total ?? 0} met`;
        return `${when} — assessed: ${entry.clear ? "gate clear" : `not clear, ${score}`}`;
      }
      const measured =
        typeof entry.value === "number" ? `${entry.value}` : entry.confirmed ? "confirmed" : "cleared";
      return `${when} — criterion ${entry.n ?? "?"} recorded as ${measured}${entry.met ? " (met)" : ""}`;
    });
}

/* ---------------------------------------------------------------------------
 * Intent capture — Gate 1's "250 customers" has no counter today.
 * ------------------------------------------------------------------------- */

export interface IntentRecord {
  at: string;
  product: ProductId;
  /** Where the ask came from: "site", "email", "referral". */
  source: string;
  note?: string;
}

export type IntentLog = IntentRecord[];

/** Gate 1's first criterion, in the same units the counter reports. */
export const intentTarget = 250;

/**
 * Below this, the copy leads with the target rather than the count. A published "3"
 * reads as failure; "the gate needs 250, and 3 have asked so far" reads as a gate.
 */
export const intentPublishThreshold = 25;

export function intentCount(log: IntentLog, product: ProductId): number {
  return log.filter((entry) => entry.product === product).length;
}

export function intentProgress(count: number, target: number = intentTarget): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(1, count / target));
}

/** The honest phrasing at either end of the range. */
export function intentLine(count: number, target: number = intentTarget): string {
  if (count >= target) return `${count} families have asked. Gate 1's first criterion is met.`;
  if (count >= intentPublishThreshold) return `${count} families have asked. The gate needs ${target}.`;
  return `The gate needs ${target} families. ${count} ${count === 1 ? "has" : "have"} asked so far.`;
}
