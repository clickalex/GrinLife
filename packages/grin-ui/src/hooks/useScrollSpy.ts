import { useEffect, useState } from "react";

/**
 * Track which section is currently under the reader.
 * Powers the chapter rail that makes the roadmap feel like a trail.
 */
export function useScrollSpy(ids: string[], offset = 140): string {
  const [active, setActive] = useState(ids[0] ?? "");
  const signature = ids.join("|");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measure = () => {
      let current = ids[0] ?? "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // `ids` is deliberately absent: the joined signature is the real dependency, and
    // listing the array itself would re-subscribe on every render.
  }, [signature, offset]);

  return active;
}
