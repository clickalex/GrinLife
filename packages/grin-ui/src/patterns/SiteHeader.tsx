import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Shared site chrome. Navigation is injected as data so every Grin front-end gets
 * the same header without copying it; `Link` is injected too, so the component does
 * not depend on any particular router.
 */
export function SiteHeader({
  brand,
  tagline,
  links,
  currentPath,
  Link,
  actions,
}: {
  brand: string;
  tagline?: string;
  links: NavLink[];
  currentPath: string;
  Link: React.ComponentType<{ href: string; className?: string; children?: React.ReactNode }>;
  actions?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  const isActive = (href: string) => (href === "/" ? currentPath === "/" : currentPath.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/90 shadow-[var(--shadow-lantern)] backdrop-blur-md"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex max-w-[86rem] items-center gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-coral text-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v3M5 12H2M22 12h-3M6 6 4 4M18 6l2-2" strokeLinecap="round" />
              <circle cx="12" cy="13" r="5.5" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-display text-lg font-bold leading-none text-foreground">{brand}</span>
            {tagline ? (
              <span className="grin-label truncate text-[0.6rem] text-muted-foreground">{tagline}</span>
            ) : null}
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-bold transition-colors",
                isActive(link.href) ? "bg-coral-soft text-coral-ink" : "text-ink-soft hover:bg-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {actions ? <div className="ml-auto hidden items-center gap-2 lg:ml-2 lg:flex">{actions}</div> : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card lg:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Primary mobile"
          className="border-t border-border bg-background px-5 pb-5 pt-3 lg:hidden"
        >
          <ul className="grid gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-base font-bold",
                    isActive(link.href) ? "bg-coral-soft text-coral-ink" : "text-ink-soft hover:bg-muted",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {actions ? <div className="mt-4 flex items-center gap-2">{actions}</div> : null}
        </nav>
      ) : null}
    </header>
  );
}
