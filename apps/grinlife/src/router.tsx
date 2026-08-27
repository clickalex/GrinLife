import { Link as WouterLink, useLocation } from "wouter";

/**
 * The router adapter every `@grin/ui` component receives as its `Link` prop.
 *
 * `@grin/ui` deliberately does not depend on a router — it only asks for something
 * that takes `href`, `className` and children. That keeps the design system usable
 * from any front-end (or from a test) without dragging wouter into the package.
 */
export function Link({
  href,
  className,
  children,
  "aria-current": ariaCurrent,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
  /** Set by `@grin/ui` chrome to mark the active trail stop for assistive tech. */
  "aria-current"?: "page";
}) {
  return (
    <WouterLink href={href} className={className} aria-current={ariaCurrent}>
      {children}
    </WouterLink>
  );
}

/** Current path, so the header can mark the active trail stop. */
export function usePath(): string {
  const [location] = useLocation();
  return location;
}
