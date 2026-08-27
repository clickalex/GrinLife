/**
 * Serendipity landing page — including automated enforcement of the brand
 * quarantine.
 *
 * The portfolio plan requires this product to share nothing public-facing with the
 * Grin family: no shared name, no cross-links, no "a Grin company" footer. That is
 * a rule about *output*, so it is asserted against the rendered DOM rather than
 * left to review.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { nonNegotiables, serendipity } from "@grin/content";

describe("Serendipity landing page", () => {
  it("leads with conversation before identity", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Talk to a stranger");
    expect(screen.getByText("Text only — no video, ever")).toBeTruthy();
    expect(screen.getByText("₹49 once, not a subscription")).toBeTruthy();
  });

  it("explains the Permanent button as mutual consent", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Both of you press it/ })).toBeTruthy();
    expect(screen.getByText(/waiting for the other person/)).toBeTruthy();
  });

  it("publishes every compliance obligation from the plan", () => {
    render(<App />);
    for (const row of serendipity.compliance) {
      expect(screen.getByText(row.obligation), row.obligation).toBeTruthy();
    }
  });

  it("shows the safety-first build order and the hard stop", () => {
    render(<App />);
    expect(screen.getByText("CSAM detection and mandated reporting")).toBeTruthy();
    expect(screen.getByText("Hard stop")).toBeTruthy();
  });

  it("never mentions Grin anywhere in the rendered output", () => {
    render(<App />);

    const text = document.body.textContent ?? "";
    expect(text.toLowerCase()).not.toContain("grin");

    // No cross-links, no shared developer identity, no outbound brand reference.
    const hrefs = [...document.querySelectorAll("a[href]")].map((anchor) =>
      (anchor.getAttribute("href") ?? "").toLowerCase(),
    );
    expect(hrefs.filter((href) => href.includes("grin"))).toEqual([]);
  });

  it("omits the rename row, which would reveal the family connection", () => {
    render(<App />);

    const rename = nonNegotiables[3]!;
    expect(rename.original).toContain("GrinLuck");
    expect(document.body.textContent).not.toContain(rename.original);
    // The other three corrections are still published (some appear more than once).
    for (const change of nonNegotiables.slice(0, 3)) {
      expect(screen.getAllByText(change.replace).length, change.replace).toBeGreaterThan(0);
    }
  });
});
