import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

type RevealProps = ComponentProps<"div"> & {
  /** Milliseconds of stagger when several reveals share a parent. */
  delay?: number;
};

/**
 * Fades and lifts content once on arrival — the "lantern brightens" motion.
 * Purely decorative: content is in the DOM either way, so nothing is hidden from
 * assistive tech or from a browser without IntersectionObserver.
 *
 * The global `prefers-reduced-motion` rule in tokens.css already neutralises the
 * animation; skipping the class entirely means a visitor who asked for no motion
 * never gets the animation node at all rather than a 0.001ms one.
 */
export function Reveal({ delay = 0, className, children, ...props }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const animate = inView && !reducedMotion;

  return (
    <div
      ref={ref}
      className={cn(animate && "grin-reveal", className)}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
