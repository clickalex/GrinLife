import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type {
  CriterionState,
  GateHistory,
  GateHistoryEntry,
  GateStatusRecord,
  IntentLog,
  ProductId,
} from "@grin/content";
import { evaluateGate, gateIds, inputsForGate, products } from "@grin/content";

/** Staged write: temp file then rename, so a crash mid-write cannot truncate a record. */
function atomicWrite(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
  renameSync(tempPath, filePath);
}

function readJson(filePath: string): unknown {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as unknown;
  } catch {
    // A corrupt file must not take the site down; the caller falls back to "nothing".
    return null;
  }
}

/**
 * Gate status persistence.
 *
 * A JSON file rather than a database: the portfolio has two gates and nine
 * criteria, and the plan's own advice is to automate only what hurt.
 *
 * A second, append-only file records *history* — every measurement, every reset, and
 * every dated assessment of a gate. The anti-drift rule (0 failures proceed, 1 retry,
 * 2 kill) cannot be evaluated from current values alone, because a criterion that was
 * missed and later corrected looks identical to one that was never missed.
 */
export class GateStore {
  private readonly historyPath: string;

  constructor(
    private readonly filePath: string,
    historyPath?: string,
  ) {
    this.historyPath = historyPath ?? filePath.replace(/\.json$/, ".history.json");
  }

  read(): GateStatusRecord {
    const parsed = readJson(this.filePath);
    return isStatusRecord(parsed) ? parsed : {};
  }

  write(status: GateStatusRecord): GateStatusRecord {
    atomicWrite(this.filePath, status);
    return this.read();
  }

  history(): GateHistory {
    const parsed = readJson(this.historyPath);
    return Array.isArray(parsed) ? (parsed as GateHistory) : [];
  }

  /** Appends one entry, server-stamped, and returns the whole log. */
  append(entry: Omit<GateHistoryEntry, "at">): GateHistory {
    const history = [...this.history(), { ...entry, at: new Date().toISOString() }];
    atomicWrite(this.historyPath, history);
    return history;
  }

  /** Records a measurement for one criterion, validating it against the plan's rule. */
  update(gateId: string, n: string, patch: Partial<CriterionState>): GateStatusRecord {
    const status = this.read();
    const gate = status[gateId] ?? {};
    const previous = gate[n] ?? {};
    status[gateId] = {
      ...gate,
      [n]: { ...previous, ...patch, updatedAt: new Date().toISOString() },
    };
    const written = this.write(status);

    const met = evaluateGate(gateId, written).criteria.find((criterion) => criterion.input.n === n)?.met;
    this.append({
      gateId,
      kind: "measurement",
      n,
      value: typeof patch.value === "number" ? patch.value : undefined,
      confirmed: patch.confirmed,
      met,
      note: patch.note,
    });
    return written;
  }

  /**
   * A dated verdict on the gate as it currently stands.
   *
   * This is the only thing that counts as a failure for the anti-drift rule. Editing a
   * criterion twelve times records twelve measurements and no failures; assessing the
   * gate and finding it short records one.
   */
  assess(gateId: string): { status: GateStatusRecord; clear: boolean; metCount: number; total: number } {
    const status = this.read();
    const verdict = evaluateGate(gateId, status);
    this.append({
      gateId,
      kind: "assessment",
      clear: verdict.clear,
      metCount: verdict.metCount,
      total: verdict.total,
    });
    return { status, clear: verdict.clear, metCount: verdict.metCount, total: verdict.total };
  }

  reset(gateId?: string): GateStatusRecord {
    const status = this.read();
    if (!gateId) {
      for (const id of Object.keys(status)) this.append({ gateId: id, kind: "reset" });
      return this.write({});
    }
    delete status[gateId];
    this.append({ gateId, kind: "reset" });
    return this.write(status);
  }

  /** Every gate id known to the plan — used to reject unknown paths. */
  knownGates(): string[] {
    return gateIds;
  }

  /** Every criterion id known for a gate. */
  knownCriteria(gateId: string): string[] {
    return inputsForGate(gateId).map((input) => input.n);
  }
}

/**
 * Intent capture — how many families have asked for a product.
 *
 * Gate 1's first criterion is 250 paying customers, and Phase 0 sells by `mailto:`, so
 * today the criterion is measured by someone counting emails. This is the counter.
 * It stores no contact details: an ask is a timestamp, a product and where it came from.
 */
export class IntentStore {
  constructor(private readonly filePath: string) {}

  read(): IntentLog {
    const parsed = readJson(this.filePath);
    return Array.isArray(parsed) ? (parsed as IntentLog) : [];
  }

  counts(): Record<string, number> {
    const log = this.read();
    return Object.fromEntries(
      products.map((product) => [product.id, log.filter((entry) => entry.product === product.id).length]),
    );
  }

  record(product: ProductId, source: string, note?: string): IntentLog {
    const log = [...this.read(), { at: new Date().toISOString(), product, source, note }];
    atomicWrite(this.filePath, log);
    return log;
  }

  knownProducts(): string[] {
    return products.map((product) => product.id);
  }
}

function isStatusRecord(value: unknown): value is GateStatusRecord {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value as Record<string, unknown>).every(
    (gate) => typeof gate === "object" && gate !== null,
  );
}
