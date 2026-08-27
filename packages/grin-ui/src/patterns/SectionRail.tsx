import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";
import { useScrollSpy } from "../hooks/useScrollSpy";

export interface ChapterItem {
  id: string;
  label: string;
  accent?: Accent;
  caption?: string;
}

/**
 * The Lantern Trail chapter rail: a sticky, scroll-tracking index of the page.
 * Returns null on small screens, where the page is a single readable trail and a
 * rail would only compete with it.
 */
export function SectionRail({
  items,
  title = "On this trail",
  offset = 140,
  className,
}: {
  items: ChapterItem[];
  title?: string;
  offset?: number;
  className?: string;
}) {
  const active = useScrollSpy(
    items.map((item) => item.id),
    offset,
  );
  const activeIndex = items.findIndex((item) => item.id === active);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={title}
      className={cn("sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-auto xl:block", className)}
    >
      <p className="grin-label mb-4 text-muted-foreground">{title}</p>
      <ol className="space-y-1 border-l border-border">
        {items.map((item, index) => {
          const isActive = item.id === active;
          const accent = item.accent ?? "coral";
          const a = accentOf(accent);
          return (
            <li key={item.id} className="relative">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "-ml-px flex flex-col gap-0.5 border-l-2 py-2 pl-4 text-sm transition-all duration-200",
                  isActive
                    ? cn("font-bold", a.border, a.text)
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="grin-label opacity-70">{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </span>
                {item.caption && isActive ? (
                  <span className="text-xs font-medium opacity-75">{item.caption}</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
      <p className="grin-label mt-5 pl-4 text-muted-foreground">
        {activeIndex >= 0 ? `Stop ${activeIndex + 1} of ${items.length}` : `${items.length} stops`}
      </p>
    </nav>
  );
}

/**
 * Horizontal, scrollable version of the same index for phones.
 * Rendered above the content so the trail position is still obvious on a 390px screen.
 */
export function SectionChips({ items, className }: { items: ChapterItem[]; className?: string }) {
  const active = useScrollSpy(items.map((item) => item.id));

  return (
    <nav
      aria-label="Trail stops"
      className={cn("-mx-5 overflow-x-auto px-5 pb-2 xl:hidden", className)}
    >
      <ul className="flex w-max gap-2">
        {items.map((item, index) => {
          const isActive = item.id === active;
          const a = accentOf(item.accent ?? "coral");
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition-colors",
                  isActive ? cn(a.bgSoft, a.text, a.border) : "border-border bg-card text-muted-foreground",
                )}
              >
                <span className="grin-label opacity-70">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
