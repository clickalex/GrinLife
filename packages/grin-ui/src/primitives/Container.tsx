import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type ContainerProps = ComponentProps<"div"> & {
  /** `narrow` is the reading measure for long prose; `wide` for full-bleed charts. */
  size?: "narrow" | "default" | "wide";
};

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      data-component="container"
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-[86rem]",
        className,
      )}
      {...props}
    />
  );
}
