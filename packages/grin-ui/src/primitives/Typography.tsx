import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

/** Mono small-caps label — the Lantern Trail's "field note" caption. */
export function Eyebrow({
  children,
  accent = "coral",
  className,
}: {
  children: React.ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <p className={cn("grin-label flex items-center gap-2 font-medium", accentOf(accent).text, className)}>
      <span aria-hidden className={cn("inline-block h-1.5 w-1.5 rounded-full", accentOf(accent).dot)} />
      {children}
    </p>
  );
}

type HeadingProps = ComponentProps<"h2"> & {
  as?: "h1" | "h2" | "h3";
  size?: "display" | "title" | "subtitle";
};

const headingSizes = {
  display: "text-4xl leading-[1.06] sm:text-5xl lg:text-6xl",
  title: "text-2xl leading-tight sm:text-3xl lg:text-[2.4rem]",
  subtitle: "text-xl leading-snug sm:text-2xl",
};

export function Heading({ as = "h2", size = "title", className, ...props }: HeadingProps) {
  const Tag = as;
  return (
    <Tag
      className={cn("font-display font-bold text-foreground", headingSizes[size], className)}
      {...props}
    />
  );
}

/** Long-form paragraph with a comfortable measure. */
export function Lede({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("max-w-3xl text-lg leading-relaxed text-ink-soft sm:text-xl", className)}
      {...props}
    />
  );
}

/** Wrapper that applies readable typography to arbitrary children. */
export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-4 text-[1.02rem] leading-relaxed text-ink-soft",
        "[&_strong]:font-bold [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        "[&_a]:text-coral-ink [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}
