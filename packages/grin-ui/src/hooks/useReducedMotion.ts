import { useEffect, useState } from "react";

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  // Read the preference up front rather than defaulting to false: an effect-only
  // initialisation gives a reduced-motion visitor one frame of animation first.
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
