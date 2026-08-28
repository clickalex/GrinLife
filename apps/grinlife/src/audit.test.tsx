/**
 * Site audit.
 *
 * These render the real `App` at every route the site serves and assert the things
 * a reader would notice but a unit test would not: duplicate element ids, anchors
 * that point at nothing, images with no alternative text, controls with no
 * accessible name, tables with no caption, heading order that jumps, and leftover
 * placeholder copy. They are deliberately mechanical — nothing here judges design,
 * only correctness — so they stay green as content changes.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";
import { routes } from "@grin/content";

const AUDITED = routes.filter((route) => route !== "/404");

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe.each(AUDITED)("audit %s", (route) => {
  it("has exactly one h1 and a sensible heading order", () => {
    renderAt(route);

    const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((node) =>
      Number(node.tagName.slice(1)),
    );
    expect(
      headings.filter((level) => level === 1),
      route,
    ).toHaveLength(1);

    for (let i = 1; i < headings.length; i += 1) {
      const jump = headings[i]! - headings[i - 1]!;
      // Descending to a deeper level is fine one step at a time; h1 → h3 is a defect.
      expect(jump, `${route}: h${headings[i - 1]} followed by h${headings[i]}`).toBeLessThanOrEqual(1);
    }
  });

  it("has no duplicate element ids", () => {
    renderAt(route);

    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    const seen = new Set<string>();
    const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(duplicates, `${route}: duplicate ids`).toEqual([]);
  });

  it("resolves every in-page anchor to a real element", () => {
    renderAt(route);

    const unresolved = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .map((link) => link.getAttribute("href")!)
      .filter((href) => href.length > 1 && !document.getElementById(href.slice(1)));
    expect(unresolved, `${route}: anchors pointing at nothing`).toEqual([]);
  });

  it("links only to routes this site serves", () => {
    renderAt(route);

    const known = new Set([...AUDITED, "/404"]);
    const bad = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
      .map((link) => link.getAttribute("href")!)
      .filter((href) => href.startsWith("/") && !href.startsWith("//") && !known.has(href.split("#")[0]!));
    expect(bad, `${route}: internal links to unknown routes`).toEqual([]);
  });

  it("has no broken, empty or script hrefs", () => {
    renderAt(route);

    const bad = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].filter((link) => {
      const href = link.getAttribute("href") ?? "";
      return href === "" || href === "#" || href.toLowerCase().startsWith("javascript:");
    });
    expect(
      bad.map((link) => link.textContent?.trim()),
      `${route}: dead hrefs`,
    ).toEqual([]);
  });

  it("gives every control and link an accessible name", () => {
    renderAt(route);

    const nameless = [...document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>("button, a")]
      .filter((node) => {
        const name = (node.textContent ?? "") + (node.getAttribute("aria-label") ?? "");
        return name.trim().length === 0;
      })
      .map((node) => node.outerHTML.slice(0, 80));
    expect(nameless, `${route}: controls with no accessible name`).toEqual([]);
  });

  it("alt-texts every image and loads none from a remote host", () => {
    renderAt(route);

    const images = [...document.querySelectorAll("img")];
    const missing = images.filter((img) => !(img.getAttribute("alt") ?? "").trim());
    expect(
      missing.map((img) => img.getAttribute("src")),
      `${route}: images with no alt`,
    ).toEqual([]);

    const remote = images.filter((img) => /^(https?:)?\/\//.test(img.getAttribute("src") ?? ""));
    expect(remote, `${route}: remote images`).toEqual([]);
  });

  it("gives every table an accessible caption", () => {
    renderAt(route);

    const uncaptioned = [...document.querySelectorAll("table")].filter(
      (table) => !table.querySelector("caption") && !table.getAttribute("aria-label"),
    );
    expect(uncaptioned, `${route}: tables with no caption`).toHaveLength(0);
  });

  it("renders no placeholder copy", () => {
    renderAt(route);

    const text = document.body.textContent ?? "";
    const smells = ["lorem ipsum", "TODO", "FIXME", "TBD", "placeholder", "coming soon", "undefined", "NaN"];
    const found = smells.filter((smell) => text.includes(smell));
    expect(found, `${route}: placeholder copy in the rendered page`).toEqual([]);
  });

  it("renders no empty section", () => {
    renderAt(route);

    const empty = [...document.querySelectorAll("main section")].filter(
      (section) => (section.textContent ?? "").trim().length === 0,
    );
    expect(empty, `${route}: sections that render nothing`).toHaveLength(0);
  });

  it("labels the page in the document title", () => {
    renderAt(route);
    expect(document.title.length, route).toBeGreaterThan(0);
    expect(document.title, route).toContain("GrinLife");
  });

  it("renders no React key or validation warnings", () => {
    const warnings: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => warnings.push(String(args[0]));
    try {
      renderAt(route);
    } finally {
      console.error = original;
    }
    expect(warnings, `${route}: console.error during render`).toEqual([]);
  });
});

describe("site chrome", () => {
  it("gives keyboard users a skip link that lands on the main content", () => {
    renderAt("/");
    const skip = document.querySelector<HTMLAnchorElement>('a[href="#main"]');
    expect(skip).toBeTruthy();
    expect(document.getElementById("main")).toBeTruthy();
    expect(skip?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("marks the active nav item on every route", () => {
    for (const route of AUDITED) {
      const { unmount } = renderAt(route);
      const current = document.querySelector('nav[aria-label="Primary"] [aria-current="page"]');
      expect(current, `${route}: no nav item marked current`).toBeTruthy();
      unmount();
    }
  });

  it("does not claim a separation the site no longer provides", () => {
    renderAt("/");
    const footer = document.querySelector("footer")?.textContent ?? "";
    // Serendipity is linked from this footer, so the copy may not deny the link.
    expect(footer).not.toContain("no public affiliation to Grin");
    expect(footer).toContain("separate legal entity");
  });
});
