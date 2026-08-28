import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

type CardProps = ComponentProps<"div"> & {
  /** Applies an accent hairline on the leading edge. Omit for a neutral card. */
  accent?: Accent;
  /** `paper` uses the field-note treatment for dense reference content. */
  variant?: "card" | "paper" | "flat";
  interactive?: boolean;
};

export function Card({ accent, variant = "card", interactive = false, className, ...props }: CardProps) {
  return (
    <div
      data-component="card"
      className={cn(
        "relative rounded-xl border border-border",
        variant === "card" && "bg-card shadow-[var(--shadow-lantern)]",
        variant === "paper" && "grin-paper border-border/70",
        variant === "flat" && "bg-muted/40",
        accent && cn("border-l-4", accentOf(accent).border),
        interactive && "transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("space-y-2 p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("font-display text-lg font-bold text-foreground sm:text-xl", className)} {...props} />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}
