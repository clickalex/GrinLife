import type { ComponentProps } from "react";
import { Button } from "./Button";

type PrintButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  /** Defaults to "Print this page". */
  label?: string;
};

/**
 * Opens the browser's print dialog for the page the reader is already on.
 *
 * The `@media print` sheet in `tokens.css` does the layout work — chrome dropped, static
 * positioning, black on white — and this is the affordance that reaches it. It lives in the
 * design system rather than in one route because "this page is worth putting on paper" is a
 * property of a page, not of a product.
 *
 * Guarded because `window.print` is absent under tests and in some embedded webviews, where
 * a click would throw instead of doing nothing.
 */
export function PrintButton({ label = "Print this page", ...props }: PrintButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        if (typeof window.print === "function") window.print();
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
