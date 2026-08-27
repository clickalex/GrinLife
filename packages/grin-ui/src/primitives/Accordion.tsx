import { useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  content: ReactNode;
}

/**
 * Native `<details>` so disclosure works without JavaScript and stays accessible.
 * `exclusive` turns the group into a single-open panel.
 */
export function Accordion({
  items,
  accent = "coral",
  exclusive = false,
  defaultOpen,
  className,
}: {
  items: AccordionItem[];
  accent?: Accent;
  exclusive?: boolean;
  defaultOpen?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const a = accentOf(accent);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const isOpen = exclusive ? open === item.id : undefined;
        return (
          <details
            key={item.id}
            open={isOpen ?? undefined}
            onToggle={(event) => {
              if (!exclusive) return;
              setOpen(event.currentTarget.open ? item.id : null);
            }}
            className={cn(
              "group rounded-lg border border-border bg-card transition-colors",
              "open:border-l-4",
              isOpen && "open:border-l-4",
              a.border,
            )}
          >
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5",
                "[&::-webkit-details-marker]:hidden",
              )}
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-display text-base font-bold text-foreground sm:text-lg">{item.title}</span>
                {item.meta ? <span className="text-xs text-muted-foreground">{item.meta}</span> : null}
              </span>
              <span
                aria-hidden
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm transition-transform duration-200",
                  a.bgSoft,
                  a.text,
                  "group-open:rotate-45",
                )}
              >
                +
              </span>
            </summary>
            <div className="border-t border-border/70 p-4 sm:p-5">{item.content}</div>
          </details>
        );
      })}
    </div>
  );
}
