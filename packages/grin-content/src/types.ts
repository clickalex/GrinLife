/**
 * GrinLife content model.
 *
 * Every type here describes one block of the strategy documents in `Demo/DOCS/`.
 * Nothing in this package renders anything — it is the single source of truth that
 * `@grin/ui` patterns consume. Adding a product means adding data, not components.
 */

export type ProductId = "legacy" | "social" | "serendipity";

export type AccentId = "coral" | "moss" | "violet" | "honey";

export type WaveStatus = "build-now" | "blocked" | "conditional";

/** A term/detail pair — the shape the plan documents use for almost every table. */
export interface TermDetail {
  term: string;
  detail: string;
}

/** A generic content block inside a phase. */
export type PhaseBlock =
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "table"; heading: string; head: [string, string]; rows: TermDetail[] };

export interface Sprint {
  sprint: string;
  ships: string;
  /** Which shared-spine service this sprint builds, or a Legacy-only note. */
  reuse: string;
  /** True when the sprint's output is inherited by a later wave. */
  shared: boolean;
}

export interface Phase {
  id: string;
  product: ProductId;
  index: number;
  label: string;
  window: string;
  title: string;
  /** The "in kid words" translation, per the Lantern Trail design in `ideas.md`. */
  kidWords: string;
  summary: string;
  blocks: PhaseBlock[];
  sprints: Sprint[];
  exitCriteria: string[];
  killSignal?: string;
}

export interface GateCriterion {
  n: string;
  text: string;
}

export interface Gate {
  id: "gate-1" | "gate-2";
  month: number;
  question: string;
  unlocks: ProductId;
  criteria: GateCriterion[];
  ifNotMet: string;
  fudgeWarning?: string;
}

export interface Product {
  id: ProductId;
  name: string;
  formerName?: string;
  tagline: string;
  /** One-sentence "what it is" for cards and hero copy. */
  pitch: string;
  wave: number;
  months: string;
  status: WaveStatus;
  statusLabel: string;
  accent: AccentId;
  route: string;
  brand: "endorsed" | "quarantined";
  domain: string;
  whyHere: string;
  handsNextWave: string;
  coreRisk: string;
  /** The "product in one page" table. */
  onePage: TermDetail[];
  /** Opening warning / framing the document leads with. */
  readThisFirst?: { heading: string; body: string[] };
  metrics: { columns: string[]; rows: { metric: string; values: string[] }[] };
  risks: { risk: string; severity: string; mitigation: string }[];
  compliance: { obligation: string; detail: string }[];
  sources: string[];
}

export interface SpineRow {
  service: string;
  legacy: boolean;
  social: boolean;
  luck: boolean;
  builtIn: string;
}

export type RelayState = "build" | "grow" | "idle" | "gate";

export interface RelayCell {
  state: RelayState;
  label: string;
}

export interface RelayTrack {
  product: ProductId;
  name: string;
  wave: string;
  /** Exactly one cell per timeline column. */
  cells: RelayCell[];
}

export interface PricingTier {
  name: string;
  featured?: boolean;
  india: string;
  international: string;
  includes: string;
}

export interface DocumentEntry {
  order: number;
  file: string;
  title: string;
  kind: string;
  wave: string;
  summary: string;
}

/* ---------------------------------------------------------------------------
 * Gate measurement.
 *
 * The plan states each criterion in prose. These types express the same criteria
 * as something a dashboard and an API can compare real numbers against.
 * ------------------------------------------------------------------------- */

export type CriterionKind = "numeric" | "boolean";

export interface GateInput {
  /** Matches `GateCriterion.n`, so the prose and the measurement stay paired. */
  n: string;
  label: string;
  kind: CriterionKind;
  /** Omitted for boolean criteria. */
  target?: number;
  unit?: string;
  /** `at-least` for "250+ customers", `at-most` for "≤1 engineer". */
  direction?: "at-least" | "at-most";
}

/** The measured state of one criterion, as recorded by the API. */
export interface CriterionState {
  value?: number;
  confirmed?: boolean;
  note?: string;
  updatedAt?: string;
}

/** `{ [gateId]: { [criterion n]: state } }` */
export type GateStatusRecord = Record<string, Record<string, CriterionState>>;

export interface GateCriterionVerdict {
  input: GateInput;
  state?: CriterionState;
  met: boolean;
  /** 0–1 progress toward the target; boolean criteria are 0 or 1. */
  progress: number;
}

export interface GateVerdict {
  gateId: string;
  criteria: GateCriterionVerdict[];
  metCount: number;
  total: number;
  /** True only when every criterion is met — the plan allows no partial pass. */
  clear: boolean;
}
