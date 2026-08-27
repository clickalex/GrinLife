/**
 * The two kill gates as live measurement boards.
 *
 * Measurements persist to the status API (`packages/grin-api`). When that API is
 * not reachable — a static build, a demo, an offline machine — the page falls back
 * to browser-local storage and says so on screen, so nobody mistakes a local
 * checklist for a recorded decision.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Callout,
  Card,
  Eyebrow,
  GateBoard,
  Heading,
  Lede,
  PageHero,
  Section,
  StatGrid,
  useLocalStorage,
} from "@grin/ui";
import {
  antiDriftRule,
  evaluateAll,
  gates,
  getProduct,
  type CriterionState,
  type GateStatusRecord,
} from "@grin/content";
import {
  applyPatch,
  fetchGates,
  resetAllGates,
  resetGate,
  type GatePatch,
  type GatesPayload,
} from "../lib/gateApi";

export default function Gates() {
  const [local, setLocal] = useLocalStorage<GateStatusRecord>("grinlife:gate-status", {});
  const [payload, setPayload] = useState<GatesPayload | null>(null);
  const [online, setOnline] = useState(false);
  const [busy, setBusy] = useState(false);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  /** Latest server state, so an offline flip can carry it into local storage. */
  const latest = useRef<GateStatusRecord>({});

  useEffect(() => {
    let cancelled = false;
    fetchGates().then((data) => {
      if (cancelled || !data) return;
      latest.current = data.status;
      setPayload(data);
      setOnline(true);
    });
    return () => {
      cancelled = true;
      for (const timer of Object.values(noteTimers.current)) clearTimeout(timer);
    };
  }, []);

  /**
   * The API can go away between page load and a keystroke. Flipping to browser-local
   * storage without carrying the server values over would blank every measurement the
   * reader just entered, so the last known state is merged in on the way down.
   */
  const goOffline = useCallback(() => {
    setOnline(false);
    setLocal((current) => {
      const server = latest.current;
      const merged: GateStatusRecord = { ...current };
      for (const [gateId, criteria] of Object.entries(server)) {
        merged[gateId] = { ...criteria, ...(merged[gateId] ?? {}) };
      }
      return merged;
    });
  }, [setLocal]);

  const status = online && payload ? payload.status : local;
  const verdicts = online && payload ? payload.verdicts : evaluateAll(status);

  const patchLocal = useCallback(
    (gateId: string, patch: GatePatch) => {
      setLocal((current) => {
        const gate = current[gateId] ?? {};
        const previous: CriterionState = gate[patch.n] ?? {};
        const next: CriterionState = { ...previous, updatedAt: new Date().toISOString() };
        if (patch.kind === "value") {
          if (patch.value === null) delete next.value;
          else next.value = patch.value;
        }
        if (patch.kind === "confirmed") next.confirmed = patch.confirmed;
        if (patch.kind === "note") next.note = patch.note;
        return { ...current, [gateId]: { ...gate, [patch.n]: next } };
      });
    },
    [setLocal],
  );

  const commit = useCallback(
    async (gateId: string, patch: GatePatch) => {
      if (!online) {
        patchLocal(gateId, patch);
        return;
      }

      // Notes arrive on every keystroke; give the writer a moment to settle.
      if (patch.kind === "note") {
        const key = `${gateId}/${patch.n}`;
        clearTimeout(noteTimers.current[key]);
        noteTimers.current[key] = setTimeout(() => {
          void applyPatch(gateId, patch).then((next) => {
            if (next) {
              latest.current = next.status;
              setPayload(next);
            } else {
              goOffline();
            }
          });
        }, 500);
        return;
      }

      setBusy(true);
      const next = await applyPatch(gateId, patch);
      setBusy(false);
      if (next) {
        latest.current = next.status;
        setPayload(next);
      } else {
        goOffline();
      }
    },
    [online, patchLocal, goOffline],
  );

  const handleReset = useCallback(
    async (gateId: string) => {
      if (!online) {
        setLocal((current) => {
          const next = { ...current };
          delete next[gateId];
          return next;
        });
        return;
      }
      const next = await resetGate(gateId);
      if (next) {
        latest.current = next.status;
        setPayload(next);
      } else {
        goOffline();
      }
    },
    [online, setLocal, goOffline],
  );

  const handleResetAll = useCallback(async () => {
    if (!online) {
      setLocal({});
      return;
    }
    const next = await resetAllGates();
    if (next) {
      latest.current = next.status;
      setPayload(next);
    } else {
      goOffline();
    }
  }, [online, setLocal, goOffline]);

  return (
    <>
      <PageHero
        eyebrow="§6 — Gates · live measurement"
        title="The gates are the strategy"
        lede="Without these, 'three products in sequence' quietly becomes 'three products in parallel' by month nine. Enter the real numbers; the verdict only clears when every criterion is met."
        aside={
          <div className="space-y-4">
            <StatGrid
              accent="coral"
              className="grid-cols-2 lg:grid-cols-2"
              items={verdicts.map((verdict) => ({
                value: `${verdict.metCount}/${verdict.total}`,
                label: verdict.gateId === "gate-1" ? "Gate 1 · month 12" : "Gate 2 · month 24",
                note: verdict.clear ? "Clear — next wave may build" : "Not passed",
              }))}
            />
            <Card variant="paper" accent={online ? "moss" : "honey"} className="p-5">
              <p className="grin-label text-muted-foreground">
                {online ? "Connected to the status API" : "No status API — browser-local"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {online
                  ? "Measurements are stored on the server, so a gate decision is recorded once for the company instead of living in one person's browser."
                  : "Nothing is reachable at /api/gates, so measurements are saved in this browser only. Run the status API to record them properly."}
              </p>
            </Card>
          </div>
        }
      />

      <Section spacing="normal">
        <div className="space-y-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Eyebrow>Permission to build</Eyebrow>
              <Heading size="title">Two decisions, all criteria required</Heading>
              <Lede>
                Each gate is a pass/fail on every criterion at once. A gate that is "mostly met" is a gate
                that failed — the fudging happens one criterion at a time.
              </Lede>
            </div>
            <button
              type="button"
              onClick={() => void handleResetAll()}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold text-ink-soft hover:bg-muted"
            >
              Reset both gates
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {gates.map((gate) => {
              const verdict = verdicts.find((candidate) => candidate.gateId === gate.id);
              if (!verdict) return null;
              return (
                <GateBoard
                  key={gate.id}
                  gate={gate}
                  verdict={verdict}
                  unlockedProduct={getProduct(gate.unlocks)?.name ?? gate.unlocks}
                  online={online}
                  busy={busy}
                  onValue={(n, value) => void commit(gate.id, { kind: "value", n, value })}
                  onConfirm={(n, confirmed) => void commit(gate.id, { kind: "confirmed", n, confirmed })}
                  onNote={(n, note) => void commit(gate.id, { kind: "note", n, note })}
                  onReset={() => void handleReset(gate.id)}
                />
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Callout tone="warning" label="The criterion founders fudge">
              <p>
                Gate 1, criterion ④ — "Legacy runs on ≤1 engineer's ongoing attention." If Legacy still eats
                the whole team at month 12, you do not have a product, you have a job, and Wave 2 must not
                start.
              </p>
            </Callout>
            <Callout tone="kill" title={antiDriftRule.rule}>
              <p>{antiDriftRule.gloss}</p>
            </Callout>
          </div>
        </div>
      </Section>
    </>
  );
}
