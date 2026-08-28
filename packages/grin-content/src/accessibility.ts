/**
 * The accessibility position, published.
 *
 * The test suite already enforces a real set of guarantees — one `h1` per page, no
 * duplicate ids, table captions, a skip link, reduced-motion support — and none of it
 * was visible to the people it protects. This states it plainly, including the parts
 * that are not true yet.
 *
 * Anti-drift: every guarantee names the tests that enforce it, and an audit check
 * fails if any of those names stops existing. A guarantee whose test has been deleted
 * is not a guarantee.
 */

export interface AccessibilityGuarantee {
  guarantee: string;
  /**
   * Verbatim test names in `apps/grinlife/src/audit.test.tsx`, or audit check names in
   * `scripts/audit.mjs`. Checked to still exist.
   */
  enforcedBy: string[];
}

export const accessibilityGuarantees: AccessibilityGuarantee[] = [
  {
    guarantee: "Every page has exactly one top-level heading, and heading levels never skip.",
    enforcedBy: ["has exactly one h1 and a sensible heading order"],
  },
  {
    guarantee: "No element id appears twice on a page, so in-page links and labels resolve.",
    enforcedBy: ["has no duplicate element ids"],
  },
  {
    guarantee: "Every table has an accessible caption, so it can be navigated without seeing it.",
    enforcedBy: ["gives every table an accessible caption"],
  },
  {
    guarantee: "Keyboard users get a skip link that lands on the main content, on the first tab stop.",
    enforcedBy: ["gives keyboard users a skip link that lands on the main content"],
  },
  {
    guarantee: "The current page is marked in the navigation, not just styled differently.",
    enforcedBy: ["marks the active nav item on every route"],
  },
  {
    guarantee: "Every control and link has an accessible name, so nothing is announced as 'button'.",
    enforcedBy: ["gives every control and link an accessible name"],
  },
  {
    guarantee: "Every in-page anchor points at an element that exists, so no jump link dead-ends.",
    enforcedBy: ["resolves every in-page anchor to a real element"],
  },
  {
    guarantee:
      "Visitors who ask their system for reduced motion get no animation at all — not a shorter one.",
    enforcedBy: ["reduced motion is honoured in CSS and in a component"],
  },
  {
    guarantee: "Every route sets its own document title, so tabs and screen readers can tell them apart.",
    enforcedBy: ["labels the page in the document title"],
  },
  {
    guarantee: "Nothing is loaded from a remote image host, so no visual can silently fail to appear.",
    enforcedBy: ["alt-texts every image and loads none from a remote host"],
  },
];

export interface AccessibilityKnownIssue {
  issue: string;
  /** What a visitor can do today. */
  workaround: string;
  status: "open" | "mitigated";
}

/** Stated openly, because a page that claims perfection is not telling the truth. */
export const accessibilityKnownIssues: AccessibilityKnownIssue[] = [
  {
    issue:
      "Colour contrast is not machine-verified. The parchment-and-ink palette was chosen by eye, and the muted greys at small sizes are the weakest pairing on the site.",
    workaround:
      "Browser zoom reflows the layout rather than cropping it, and every page prints cleanly in black on white.",
    status: "open",
  },
  {
    issue:
      "The chapter rail collapses into a horizontally scrolling row of chips below 1280px. Horizontal scrolling is awkward with some assistive technology.",
    workaround:
      "The same chapters are reachable by scrolling the page; the chips are a shortcut, not the only route.",
    status: "mitigated",
  },
  {
    issue:
      "Reduced motion is honoured only when the operating system asks for it. There is no in-page toggle, so a visitor cannot turn animation off for this site alone.",
    workaround: "The animations are opacity and a short translate — no parallax, no autoplaying movement.",
    status: "open",
  },
];

/** The target, stated as a target. Nothing here has been certified. */
export const accessibilityStandard =
  "WCAG 2.2 level AA is the target. It has not been audited by a third party and no " +
  "conformance claim is made — the guarantees above are the ones a test enforces.";

export const accessibilityContact = "hello@grinlife.example";

export const accessibilityContactLine =
  "If something on this site is hard or impossible to use, write to the address below saying " +
  "what you were trying to do and what happened. Barriers get fixed as defects, not filed as " +
  "feedback.";

/** Everything the guarantees and the caveats, for a page that must not drift from them. */
export const accessibilityStatement = {
  title: "Accessibility",
  intro:
    "This page lists what the site guarantees, what it does not, and how to report a problem. " +
    "The guarantees are the ones a test enforces on every build; a guarantee whose test is " +
    "removed stops being published here.",
  standard: accessibilityStandard,
  guarantees: accessibilityGuarantees,
  knownIssues: accessibilityKnownIssues,
  contact: accessibilityContact,
  contactLine: accessibilityContactLine,
};
