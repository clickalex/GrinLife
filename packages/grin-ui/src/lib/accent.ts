import type { AccentId } from "@grin/content";

export type Accent = AccentId;

export const accents: Accent[] = ["coral", "moss", "violet", "honey"];

/**
 * Every accent-driven class string lives here. Components take an `accent` prop and
 * look up their styling, so adding a product never means touching component markup.
 */
export const accentStyles: Record<
  Accent,
  {
    text: string;
    bg: string;
    bgSoft: string;
    border: string;
    dot: string;
    ring: string;
    label: string;
  }
> = {
  coral: {
    text: "text-coral-ink",
    bg: "bg-coral",
    bgSoft: "bg-coral-soft",
    border: "border-coral/35",
    dot: "bg-coral",
    ring: "ring-coral/40",
    label: "Signature",
  },
  moss: {
    text: "text-moss-ink",
    bg: "bg-moss",
    bgSoft: "bg-moss-soft",
    border: "border-moss/35",
    dot: "bg-moss",
    ring: "ring-moss/40",
    label: "Safe connection",
  },
  violet: {
    text: "text-violet-ink",
    bg: "bg-violet",
    bgSoft: "bg-violet-soft",
    border: "border-violet/35",
    dot: "bg-violet",
    ring: "ring-violet/40",
    label: "Thoughtful chance",
  },
  honey: {
    text: "text-honey-ink",
    bg: "bg-honey",
    bgSoft: "bg-honey-soft",
    border: "border-honey/45",
    dot: "bg-honey",
    ring: "ring-honey/45",
    label: "Cherished memories",
  },
};

export function accentOf(accent: Accent) {
  return accentStyles[accent];
}
