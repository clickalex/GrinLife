/** Keyboard users skip straight past the header to the page content. */
export function SkipLink({ target = "#main", label = "Skip to content" }: { target?: string; label?: string }) {
  return (
    <a
      href={target}
      className="sr-only left-4 top-4 z-[100] rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background focus:not-sr-only focus:absolute"
    >
      {label}
    </a>
  );
}
