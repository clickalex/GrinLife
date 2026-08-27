/**
 * Vitest setup.
 *
 * `globals` is off in this project, so Testing Library's auto-cleanup does not
 * register itself. Without this, every render accumulates in the same document and
 * `getByRole` starts finding duplicates from earlier tests.
 */
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom leaves these unimplemented; the app uses them for scroll-to-top and reveal.
if (typeof window !== "undefined") {
  window.scrollTo = (() => undefined) as unknown as typeof window.scrollTo;
}

afterEach(() => {
  cleanup();
});
