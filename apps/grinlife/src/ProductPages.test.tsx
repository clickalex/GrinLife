/**
 * Product page tests.
 *
 * When the three standalone landing apps were merged into this site, their tests
 * came with them. Each product route now has to carry both halves: the case for the
 * product and the plan that builds it. These assert both are actually there.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { legacyPricing, nonNegotiables, serendipity, social, socialPricing } from "@grin/content";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("/products/legacy — story and plan on one route", () => {
  it("carries the landing brief: samples, the book, one price, one CTA", () => {
    renderAt("/products/legacy");

    expect(screen.getByText(/Sample 1/)).toBeTruthy();
    expect(screen.getByText(/Sample 2/)).toBeTruthy();
    expect(screen.getByText(/Sample 3/)).toBeTruthy();
    expect(screen.getByRole("img", { name: /hardcover book with a voice QR code/ })).toBeTruthy();

    const bookTier = legacyPricing.find((tier) => tier.featured)!;
    expect(screen.getAllByText(bookTier.india).length).toBeGreaterThan(0);
    expect(screen.getByText("Why there is no checkout button")).toBeTruthy();
  });

  it("answers the questions families ask, then shows the phase plan", () => {
    renderAt("/products/legacy");

    for (const question of ["Who writes the book?", "How long does it take?", "Who can see the stories?"]) {
      expect(screen.getByText(question)).toBeTruthy();
    }
    expect(document.getElementById("legacy-phases")).toBeTruthy();
    expect(document.getElementById("legacy-overview")).toBeTruthy();
  });

  it("loads no remote images", () => {
    renderAt("/products/legacy");
    const remote = [...document.querySelectorAll("img")].filter((img) =>
      /^(https?:)?\/\//.test(img.getAttribute("src") ?? ""),
    );
    expect(remote).toHaveLength(0);
  });
});

describe("/products/social — story and plan on one route", () => {
  it("leads with the feed-free promise and shows shared pricing data", () => {
    renderAt("/products/social");

    expect(screen.getByRole("heading", { name: /No feed\. No follower count/ })).toBeTruthy();
    for (const tier of socialPricing) {
      expect(screen.getByText(tier.name), tier.name).toBeTruthy();
    }
  });

  it("publishes every compliance obligation from the plan", () => {
    renderAt("/products/social");
    for (const row of social.compliance) {
      expect(screen.getByText(row.obligation), row.obligation).toBeTruthy();
    }
  });

  it("is honest that the product is gated and not open yet", () => {
    renderAt("/products/social");
    expect(screen.getByText("Why you cannot sign up yet")).toBeTruthy();
    expect(screen.getByText("Why there is no signup form")).toBeTruthy();
  });
});

describe("/products/serendipity — story and plan on one route", () => {
  it("explains the Permanent button as mutual consent", () => {
    renderAt("/products/serendipity");
    expect(screen.getByText(/Both of you press it, or neither of you has it/)).toBeTruthy();
    expect(screen.getByText(/waiting for the other person/)).toBeTruthy();
    // One-sided pressing is the failure mode, so the mock says so out loud.
    expect(screen.getByText(/nothing is saved and neither learns who pressed it/)).toBeTruthy();
  });

  it("shows the safety-first build order, the hard stop and the price", () => {
    renderAt("/products/serendipity");
    expect(screen.getByText("CSAM detection and mandated reporting")).toBeTruthy();
    expect(screen.getByText("Hard stop")).toBeTruthy();
    expect(screen.getAllByText(/₹49/).length).toBeGreaterThan(0);
  });

  it("publishes every compliance obligation from the plan", () => {
    renderAt("/products/serendipity");
    for (const row of serendipity.compliance) {
      expect(screen.getByText(row.obligation), row.obligation).toBeTruthy();
    }
  });

  /**
   * The brand quarantine, scoped honestly.
   *
   * Merging the front-ends put this product on the same domain as the other two,
   * which the portfolio plan argues against — the shared header now says GrinLife.
   * What is still enforceable, and asserted here, is that Serendipity's own copy
   * carries no Grin reference and never publishes the rename row.
   */
  it("keeps Serendipity's own copy free of any Grin reference", () => {
    renderAt("/products/serendipity");

    const overview = document.getElementById("serendipity-overview");
    expect(overview).toBeTruthy();
    expect(overview?.textContent?.toLowerCase()).not.toContain("grin");

    const rename = nonNegotiables[3]!;
    expect(rename.original).toContain("GrinLuck");
    expect(document.body.textContent).not.toContain(rename.original);

    for (const change of nonNegotiables.slice(0, 3)) {
      expect(screen.getAllByText(change.replace).length, change.replace).toBeGreaterThan(0);
    }
  });
});
