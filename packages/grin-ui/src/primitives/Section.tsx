import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { Container } from "./Container";

type SectionProps = ComponentProps<"section"> & {
  /** Anchors the section for the chapter rail and deep links. */
  sectionId?: string;
  tone?: "plain" | "paper" | "tint";
  /** Vertical rhythm. */
  spacing?: "tight" | "normal" | "loose";
  size?: "narrow" | "default" | "wide";
};

const tones = {
  plain: "bg-transparent",
  paper: "bg-parchment-deep/60",
  tint: "bg-muted/50",
};

const spacingScale = {
  tight: "py-10 sm:py-14",
  normal: "py-16 sm:py-24",
  loose: "py-24 sm:py-32",
};

export function Section({
  sectionId,
  tone = "plain",
  spacing = "normal",
  size = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={sectionId}
      data-component="section"
      data-tone={tone}
      className={cn("scroll-mt-24 border-b border-border/50", tones[tone], spacingScale[spacing], className)}
      {...props}
    >
      <Container size={size}>{children}</Container>
    </section>
  );
}
