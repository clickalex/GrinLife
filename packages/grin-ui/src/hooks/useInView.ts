import { useEffect, useRef, useState } from "react";

/**
 * Reveal an element once it scrolls into view.
 * Used for the "lantern brightens as you arrive" motion; falls back to
 * immediately visible when IntersectionObserver is unavailable.
 */
export function useInView<T extends Element>(options?: { threshold?: number; once?: boolean }) {
  const threshold = options?.threshold ?? 0.15;
  const once = options?.once ?? true;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView } as const;
}
