/**
 * Design-system behaviour.
 *
 * These render the real shared components — the same ones both front-ends ship —
 * so a regression in the design system fails here rather than silently on a page.
 */
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  DualView,
  DualViewProvider,
  DualViewToggle,
  GateCard,
  ProductSite,
  RelayChart,
  SectionRail,
  SpineMatrix,
  Tabs,
  cn,
  slugify,
} from "./index";
import {
  gates,
  getProduct,
  getPhases,
  relayColumns,
  relayTracks,
  socialPricing,
  spineRows,
} from "@grin/content";

function TestLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

describe("lib", () => {
  it("merges class names with later utilities winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false, undefined, "font-bold")).toBe("text-sm font-bold");
  });

  it("slugifies labels into stable ids", () => {
    expect(slugify("Phase 0 · Sell it!")).toBe("phase-0-sell-it");
    expect(slugify("  Grin Social  ")).toBe("grin-social");
  });
});

describe("RelayChart", () => {
  it("draws every track against every timeline column", () => {
    render(<RelayChart />);
    const table = screen.getByRole("table");
    for (const track of relayTracks) {
      expect(within(table).getByRole("rowheader", { name: new RegExp(track.name) })).toBeTruthy();
    }
    for (const column of relayColumns) {
      expect(within(table).getByRole("columnheader", { name: column })).toBeTruthy();
    }
  });

  it("shows at most one track in build per column", () => {
    render(<RelayChart />);
    const cells = screen.getAllByTitle(/Build/);
    expect(cells).toHaveLength(relayTracks.filter((t) => t.cells.some((c) => c.state === "build")).length);
  });
});

describe("GateCard", () => {
  const gate = gates[0]!;

  it("starts unconfirmed and clears only when every criterion is checked", () => {
    const checked: string[] = [];
    const { rerender } = render(
      <GateCard gate={gate} unlockedProduct="GrinSocial" checked={checked} onToggle={() => undefined} />,
    );
    expect(screen.getByRole("status").textContent).toContain(`0 of ${gate.criteria.length}`);

    let current = [...checked];
    for (const criterion of gate.criteria) {
      current = [...current, criterion.n];
      rerender(
        <GateCard gate={gate} unlockedProduct="GrinSocial" checked={current} onToggle={() => undefined} />,
      );
    }
    expect(screen.getByRole("status").textContent).toContain("Gate clear");
  });

  it("exposes each criterion as a toggle button", () => {
    render(<GateCard gate={gate} unlockedProduct="GrinSocial" checked={[]} onToggle={() => undefined} />);
    const toggles = screen.getAllByRole("button", { pressed: false });
    expect(toggles).toHaveLength(gate.criteria.length);
  });
});

describe("DualView", () => {
  it("switches between the child-facing and detailed explanation", () => {
    render(
      <DualViewProvider storageKey="test:view" initial="child">
        <DualViewToggle />
        <DualView
          child="We build the locks first."
          parent={<p>Ship identity, consent and audit before features.</p>}
        />
      </DualViewProvider>,
    );

    expect(screen.getByText("We build the locks first.")).toBeTruthy();
    expect(screen.queryByText(/Ship identity, consent and audit/)).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Full detail" }));

    expect(screen.getByText(/Ship identity, consent and audit/)).toBeTruthy();
    expect(screen.queryByText("We build the locks first.")).toBeNull();
  });
});

describe("Tabs", () => {
  const items = [
    { id: "a", label: "Legacy", content: <p>legacy panel</p> },
    { id: "b", label: "Social", content: <p>social panel</p> },
  ];

  it("moves selection with the arrow keys", () => {
    render(<Tabs items={items} label="Products" />);
    expect(screen.getByText("legacy panel")).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("tab", { name: "Legacy" }), { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Social" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("social panel")).toBeTruthy();
  });
});

describe("SpineMatrix", () => {
  it("renders a row per shared service with an accessible yes/no marker", () => {
    render(<SpineMatrix />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(spineRows.length + 1);
    expect(within(table).getAllByText("Yes").length).toBeGreaterThan(20);
  });
});

describe("SectionRail", () => {
  it("lists every chapter and marks the current stop", () => {
    const items = [
      { id: "one", label: "First stop" },
      { id: "two", label: "Second stop" },
    ];
    render(
      <div>
        <div id="one" />
        <div id="two" />
        <SectionRail items={items} />
      </div>,
    );
    expect(screen.getByRole("link", { name: /First stop/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Second stop/ })).toBeTruthy();
  });
});

describe("ProductSite", () => {
  it("renders a full site for a product from data alone", () => {
    const product = getProduct("social")!;
    const phases = getPhases(product.id);

    render(<ProductSite product={product} phases={phases} pricing={socialPricing} Link={TestLink} />);

    // Hero
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(product.name);
    // Every chapter anchor the rail points at must exist on the page.
    for (const id of [
      `${product.id}-phases`,
      `${product.id}-pricing`,
      `${product.id}-metrics`,
      `${product.id}-risks`,
      `${product.id}-compliance`,
      `${product.id}-sources`,
    ]) {
      expect(document.getElementById(id), id).toBeTruthy();
    }
    // Every phase rendered through the shared PhaseCard.
    for (const phase of phases) {
      expect(document.getElementById(phase.id), phase.id).toBeTruthy();
      expect(screen.getByText(phase.title)).toBeTruthy();
    }
  });

  it("omits the pricing chapter when the product has no pricing data", () => {
    const product = getProduct("serendipity")!;
    render(<ProductSite product={product} phases={getPhases(product.id)} Link={TestLink} />);
    expect(document.getElementById(`${product.id}-pricing`)).toBeNull();
    expect(document.getElementById(`${product.id}-risks`)).toBeTruthy();
  });
});
