import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

type BadgeProps = ComponentProps<"span"> & {
  accent?: Accent;
  /** `solid` for status chips that must read at a glance, `soft` for labels. */
  tone?: "soft" | "solid" | "outline";
  mono?: boolean;
};

export function Badge({ accent = "coral", tone = "soft", mono = false, className, ...props }: BadgeProps) {
  const a = accentOf(accent);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        mono && "grin-label py-1.5",
        tone === "soft" && cn(a.bgSoft, a.text),
        tone === "solid" && cn(a.bg, "text-white"),
        tone === "outline" && cn("bg-card text-foreground", a.border, "border"),
        className,
      )}
      {...props}
    />
  );
}

/** Status pill for a product's wave state. */
export function StatusBadge({ status, label }: { status: string; label: string }) {
  const accent: Accent = status === "build-now" ? "coral" : status === "blocked" ? "moss" : "violet";
  return (
    <Badge accent={accent} tone="soft" mono>
      {label}
    </Badge>
  );
}
