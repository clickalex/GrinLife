/**
 * Route smoke tests.
 *
 * These render the real `App` — header, router, page, footer — at every path the
 * site serves, so a page that throws, routes wrongly or renders empty fails here
 * instead of in front of a reader.
 *
 * Note: wouter reads the browser location at mount, so the path is set through the
 * History API. `ssrPath` only applies during server rendering and silently renders
 * the home page under jsdom — an easy way to make these tests pass vacuously.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { getPhases, products, routes } from "@grin/content";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("every route", () => {
  it.each(routes.filter((route) => route !== "/404"))(
    "renders %s with a heading, nav and footer",
    (route) => {
      renderAt(route);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent?.trim().length, route).toBeGreaterThan(3);
      expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
      expect(screen.getByRole("contentinfo")).toBeTruthy();
      expect(document.getElementById("main")).toBeTruthy();
    },
  );

  it("serves the 404 page for an unknown path", () => {
    renderAt("/this-stop-does-not-exist");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("does not exist");
  });

  it("gives every route a distinct page, not the home page eight times", () => {
    const headings: string[] = [];
    for (const route of routes.filter((r) => r !== "/404")) {
      const { unmount } = renderAt(route);
      headings.push(screen.getByRole("heading", { level: 1 }).textContent ?? "");
      unmount();
    }
    expect(new Set(headings).size, `duplicate headings: ${headings.join(" | ")}`).toBe(headings.length);
  });
});

describe("home page", () => {
  it("shows the portfolio argument and all three doors", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("relay, not a race");
    for (const product of products) {
      expect(screen.getByRole("heading", { level: 3, name: product.name })).toBeTruthy();
    }
    expect(screen.getAllByRole("link", { name: /Open the plan/ })).toHaveLength(products.length);
    // The relay chart, the spine matrix and the cost table are all on the hub page.
    expect(screen.getAllByRole("table").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("The gates are the strategy")).toBeTruthy();
  });
});

describe("product routes", () => {
  it.each(products.map((product) => [product.id, product.route, product.name] as const))(
    "renders the full %s site at %s",
    (id, route, name) => {
      renderAt(route);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(name);
      for (const phase of getPhases(id)) {
        expect(screen.getByText(phase.title), `${route} → ${phase.title}`).toBeTruthy();
      }
      expect(screen.getByRole("heading", { name: "The numbers this product is judged on" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: /What kills this product/ })).toBeTruthy();
      // Compliance heading differs per product, by design.
      expect(
        screen.getByRole("heading", {
          name: /lightest of the three|changes character|Everything GrinSocial owes/,
        }),
      ).toBeTruthy();
    },
  );
});

describe("roadmap page", () => {
  it("renders the relay chart and every product's phases behind its tab", () => {
    renderAt("/roadmap");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("stop by stop");
    expect(screen.getAllByRole("table").length).toBeGreaterThan(0);
    // The first tab is open, so Legacy's phases are on the page.
    for (const phase of getPhases("legacy")) {
      expect(screen.getByText(phase.title)).toBeTruthy();
    }
  });
});

describe("gates page", () => {
  it("renders both boards as live measurement inputs", () => {
    renderAt("/gates");

    // Gate 1 is four numeric criteria, Gate 2 is one numeric plus four booleans.
    expect(screen.getAllByRole("spinbutton")).toHaveLength(5);
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(4);
    // One progress bar per gate, starting empty.
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(2);
    for (const bar of bars) expect(bar.getAttribute("aria-valuenow")).toBe("0");
    // Per-gate reset plus the global one.
    expect(screen.getAllByRole("button", { name: /Reset/ })).toHaveLength(3);
    expect(screen.getAllByText(/the gate is not passed/)).toHaveLength(2);
  });

  it("falls back to browser-local storage when the API is unreachable", async () => {
    renderAt("/gates");

    // jsdom has no server behind /api/gates, so the fetch fails and the page must
    // say so rather than imply the decision was recorded.
    await waitFor(() => expect(screen.getByText(/No status API — browser-local/)).toBeTruthy());
    expect(screen.getAllByText(/Saved in browser/)).toHaveLength(2);
  });
});

describe("spine page", () => {
  it("shows the shared-service matrix and the codebase mapping", () => {
    renderAt("/spine");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Build it once");
    expect(screen.getAllByRole("table").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/How this repository keeps that promise/)).toBeTruthy();
  });
});

describe("docs page", () => {
  it("lists the source documents", () => {
    renderAt("/docs");

    expect(screen.getByText(/Grin — Three-Product Portfolio Plan/)).toBeTruthy();
    expect(screen.getByText(/3-Serendipity-Phase-Plan\.html/)).toBeTruthy();
  });
});
