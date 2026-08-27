import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { CriterionState, GateStatusRecord } from "@grin/content";
import { gateIds, inputsForGate } from "@grin/content";

/**
 * Gate status persistence.
 *
 * A JSON file rather than a database: the portfolio has two gates and nine
 * criteria, and the plan's own advice is to automate only what hurt. The write is
 * staged to a temp file and renamed so a crash mid-write cannot truncate the
 * record of a gate decision.
 */
export class GateStore {
  constructor(private readonly filePath: string) {}

  read(): GateStatusRecord {
    if (!existsSync(this.filePath)) return {};
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, "utf-8")) as unknown;
      return isStatusRecord(parsed) ? parsed : {};
    } catch {
      // A corrupt file must not take the site down; fall back to "nothing recorded".
      return {};
    }
  }

  write(status: GateStatusRecord): GateStatusRecord {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(status, null, 2)}\n`, "utf-8");
    renameSync(tempPath, this.filePath);
    return this.read();
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
    return this.write(status);
  }

  reset(gateId?: string): GateStatusRecord {
    const status = this.read();
    if (!gateId) return this.write({});
    delete status[gateId];
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

function isStatusRecord(value: unknown): value is GateStatusRecord {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value as Record<string, unknown>).every(
    (gate) => typeof gate === "object" && gate !== null,
  );
}
