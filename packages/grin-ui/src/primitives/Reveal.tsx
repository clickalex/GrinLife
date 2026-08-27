import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { useInView } from "../hooks/useInView";

type RevealProps = ComponentProps<"div"> & {
  /** Milliseconds of stagger when several reveals share a parent. */
  delay?: number;
};

/**
 * Fades and lifts content once on arrival — the "lantern brightens" motion.
 * Purely decorative: content is in the DOM either way, so nothing is hidden from
 * assistive tech or from a browser without IntersectionObserver.
 */
export function Reveal({ delay = 0, className, children, ...props }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(inView && "grin-reveal", className)}
      style={inView && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
