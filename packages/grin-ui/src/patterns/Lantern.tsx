import { cn } from "../lib/cn";
import { accentOf, type Accent } from "../lib/accent";

/**
 * The Lantern Trail's phase marker: a numbered lantern rendered as inline SVG.
 * Generated rather than loaded from a CDN, so no front-end can ship a broken image.
 */
export function Lantern({
  n,
  accent = "coral",
  size = 44,
  lit = true,
  className,
  label,
}: {
  n: string | number;
  accent?: Accent;
  size?: number;
  lit?: boolean;
  className?: string;
  label?: string;
}) {
  const a = accentOf(accent);

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center rounded-full border-2",
        a.border,
        lit ? a.bgSoft : "bg-muted/50",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden={label ? undefined : true}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.52}
        height={size * 0.52}
        className={cn("absolute", lit ? "opacity-25" : "opacity-15")}
        aria-hidden
      >
        <circle cx="12" cy="12" r="11" fill="currentColor" className={a.text} />
      </svg>
      <span
        className={cn("grin-label relative font-bold", a.text)}
        style={{ fontSize: Math.max(11, size * 0.3) }}
      >
        {n}
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/** A short vertical connector that turns a stack of lanterns into a trail. */
export function TrailLink({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("mx-auto block h-8 w-px bg-gradient-to-b from-border to-transparent", className)}
    />
  );
}
