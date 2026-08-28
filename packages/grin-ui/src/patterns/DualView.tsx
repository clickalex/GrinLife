import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type ViewMode = "child" | "parent";

interface DualViewValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggle: () => void;
}

const DualViewContext = createContext<DualViewValue | null>(null);

/**
 * The "explain first, detail second" switch from the Lantern Trail design.
 * One provider drives every DualView block on the page, and the choice persists.
 */
export function DualViewProvider({
  children,
  storageKey = "grinlife:view-mode",
  initial = "child",
}: {
  children: ReactNode;
  storageKey?: string;
  initial?: ViewMode;
}) {
  const [mode, setMode] = useLocalStorage<ViewMode>(storageKey, initial);
  const value: DualViewValue = {
    mode,
    setMode,
    toggle: () => setMode(mode === "child" ? "parent" : "child"),
  };

  return <DualViewContext.Provider value={value}>{children}</DualViewContext.Provider>;
}

export function useDualView(): DualViewValue {
  const ctx = useContext(DualViewContext);
  if (ctx) return ctx;
  // Sensible default outside a provider so a component never crashes the page.
  return { mode: "child", setMode: () => undefined, toggle: () => undefined };
}

/** The switch itself. Renders as a labelled radio pair, not a mysterious icon. */
export function DualViewToggle({ className }: { className?: string }) {
  const { mode, setMode } = useDualView();

  const options: { id: ViewMode; label: string; hint: string }[] = [
    { id: "child", label: "Simple", hint: "Short sentences first" },
    { id: "parent", label: "Full detail", hint: "Delivery detail for the team" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Explanation level"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => setMode(option.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              selected ? "bg-coral text-white" : "text-ink-soft hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Content shown only in simple mode. */
export function ChildView({ children, className }: { children: ReactNode; className?: string }) {
  const { mode } = useDualView();
  if (mode !== "child") return null;
  return <div className={className}>{children}</div>;
}

/** Content shown only in full-detail mode. */
export function ParentView({ children, className }: { children: ReactNode; className?: string }) {
  const { mode } = useDualView();
  if (mode !== "parent") return null;
  return <div className={className}>{children}</div>;
}

/**
 * Paired explanation: the short version and the detailed version of the same idea,
 * with the inactive one still available behind a toggle so nothing is ever lost.
 */
export function DualView({
  child,
  parent,
  accentClass,
}: {
  child: ReactNode;
  parent: ReactNode;
  accentClass?: string;
}) {
  const { mode } = useDualView();

  return (
    <div className={cn("space-y-3", accentClass)}>
      <div className="flex items-baseline gap-2">
        <span className="grin-label text-muted-foreground">
          {mode === "child" ? "In short" : "Delivery detail"}
        </span>
      </div>
      {mode === "child" ? (
        <p className="max-w-3xl text-lg leading-relaxed text-foreground">{child}</p>
      ) : (
        <div className="max-w-3xl space-y-3 text-[0.97rem] leading-relaxed text-ink-soft">{parent}</div>
      )}
    </div>
  );
}
