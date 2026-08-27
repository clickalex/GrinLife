import { useId, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

export interface TabItem {
  id: string;
  label: string;
  /** Optional short caption shown under the label on wide screens. */
  caption?: string;
  content: ReactNode;
}

/**
 * Accessible tablist with full keyboard support (arrows, Home, End).
 * Used for the product switcher and for phase-group views.
 */
export function Tabs({
  items,
  accent = "coral",
  initial,
  className,
  label,
}: {
  items: TabItem[];
  accent?: Accent;
  initial?: string;
  className?: string;
  label: string;
}) {
  const uid = useId();
  const [active, setActive] = useState(initial ?? items[0]?.id ?? "");
  const a = accentOf(accent);
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    const item = items[next];
    if (item) setActive(item.id);
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 rounded-full border border-border bg-card p-1.5"
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              id={`${uid}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200",
                selected ? cn(a.bg, "text-white shadow-[var(--shadow-lantern)]") : "text-ink-soft hover:bg-muted",
              )}
            >
              {item.label}
              {item.caption ? (
                <span className={cn("hidden text-xs font-semibold sm:block", selected ? "opacity-90" : "opacity-70")}>
                  {item.caption}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id={`${uid}-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        tabIndex={0}
        className="focus-visible:outline-2"
      >
        {items[activeIndex]?.content}
      </div>
    </div>
  );
}
