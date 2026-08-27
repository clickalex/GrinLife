import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 " +
  "disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0";

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm sm:text-base",
  lg: "px-7 py-3.5 text-base sm:text-lg",
};

function variants(variant: ButtonVariant, accent: Accent) {
  const a = accentOf(accent);
  switch (variant) {
    case "primary":
      return cn(a.bg, "text-white shadow-[var(--shadow-lantern)] hover:brightness-105");
    case "secondary":
      return cn(a.bgSoft, a.text, "hover:brightness-[0.98]");
    case "outline":
      return cn("border bg-card text-foreground hover:bg-muted/60", a.border);
    case "ghost":
      return "text-foreground hover:bg-muted/70";
  }
}

export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", accent: Accent = "coral") {
  return cn(base, sizes[size], variants(variant, accent));
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: Accent;
};

export function Button({ variant = "primary", size = "md", accent = "coral", className, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles(variant, size, accent), className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: Accent;
};

/** Same visual language as `Button`, but a real anchor so it is keyboard- and SEO-correct. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  accent = "coral",
  className,
  ...props
}: ButtonLinkProps) {
  return <a className={cn(buttonStyles(variant, size, accent), className)} {...props} />;
}
