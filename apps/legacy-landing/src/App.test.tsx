/**
 * Landing-page smoke test — the second front-end, rendered for real.
 * Proves the shared design system serves a different website, not just a second
 * page of the same one.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { legacyPricing } from "@grin/content";

const bookTier = legacyPricing.find((tier) => tier.featured)!;

describe("Grin Legacy landing page", () => {
  it("delivers the four things the Phase 0 brief asks for", () => {
    render(<App />);

    // 1. One page with a single primary CTA.
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("One beautiful book");
    expect(screen.getAllByRole("link", { name: /Order the book/ }).length).toBeGreaterThan(0);

    // 2. Three sample stories.
    expect(screen.getByText(/Sample 1/)).toBeTruthy();
    expect(screen.getByText(/Sample 2/)).toBeTruthy();
    expect(screen.getByText(/Sample 3/)).toBeTruthy();

    // 3. One price, taken from the shared content layer (hero CTA, price table, order card).
    expect(screen.getAllByText(bookTier.india).length).toBeGreaterThanOrEqual(2);

    // 4. The book itself, drawn rather than loaded from a CDN.
    expect(screen.getByRole("img", { name: /hardcover book with a voice QR code/ })).toBeTruthy();
  });

  it("has no remote images that could fail to load", () => {
    render(<App />);
    const remoteImages = [...document.querySelectorAll("img")].filter((img) =>
      /^(https?:)?\/\//.test(img.getAttribute("src") ?? ""),
    );
    expect(remoteImages).toHaveLength(0);
  });

  it("answers the questions families actually ask", () => {
    render(<App />);
    for (const question of [
      "Who writes the book?",
      "How long does it take?",
      "Who can see the stories?",
    ]) {
      expect(screen.getByText(question)).toBeTruthy();
    }
  });

  it("is honest that Phase 0 has no checkout", () => {
    render(<App />);
    expect(screen.getByText("Why there is no checkout button")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /concierge desk/i }).length).toBeGreaterThan(0);
  });
});
