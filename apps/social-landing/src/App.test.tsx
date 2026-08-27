/**
 * GrinSocial landing page — the third front-end on the shared spine.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { social, socialPricing } from "@grin/content";

describe("GrinSocial landing page", () => {
  it("leads with the feed-free promise", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("No feed");
    expect(screen.getByText("No infinite scroll")).toBeTruthy();
    expect(screen.getByText("No ads, ever")).toBeTruthy();
  });

  it("shows the shared pricing data, not copy typed into this app", () => {
    render(<App />);
    for (const tier of socialPricing) {
      expect(screen.getByText(tier.name), tier.name).toBeTruthy();
    }
    // The free tier is the featured one, because density is the product.
    const free = socialPricing.find((tier) => tier.name === "Free tier")!;
    expect(free.featured).toBe(true);
  });

  it("publishes every compliance obligation from the plan", () => {
    render(<App />);
    for (const row of social.compliance) {
      expect(screen.getByText(row.obligation), row.obligation).toBeTruthy();
    }
  });

  it("is honest that the product is gated and not open yet", () => {
    render(<App />);
    expect(screen.getByText("Why you cannot sign up yet")).toBeTruthy();
    expect(screen.getByText("Why there is no signup form")).toBeTruthy();
  });

  it("loads no remote images", () => {
    render(<App />);
    const remote = [...document.querySelectorAll("img")].filter((img) =>
      /^(https?:)?\/\//.test(img.getAttribute("src") ?? ""),
    );
    expect(remote).toHaveLength(0);
  });
});
