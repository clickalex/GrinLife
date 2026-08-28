/**
 * The locale layer.
 *
 * `Record<Locale, Record<StringKey, string>>` already makes a missing key a compile
 * error. These check the things the types cannot: that Hindi is actually Hindi rather
 * than a copy of the English, that the English entries are the source records rather
 * than a second copy of them, and that the nav the switch produces matches the routes
 * the app serves.
 */
import { describe, expect, it } from "vitest";
import { legacy } from "./legacy";
import { portfolio } from "./portfolio";
import {
  defaultLocale,
  langTagFor,
  localizedStrings,
  localeOptions,
  navFor,
  routes,
  supportedLocales,
  translate,
  type StringKey,
} from "./index";

const keys = Object.keys(localizedStrings.en) as StringKey[];

describe("the locale layer", () => {
  it("offers English and Hindi, and defaults to English", () => {
    expect(supportedLocales.map((entry) => entry.id)).toEqual(["en", "hi"]);
    expect(defaultLocale).toBe("en");
    expect(langTagFor("hi")).toBe("hi");
    expect(localeOptions).toHaveLength(2);
  });

  it("translates every key in every locale", () => {
    for (const locale of supportedLocales) {
      for (const key of keys) {
        const value = localizedStrings[locale.id][key];
        expect(typeof value, `${locale.id}/${key}`).toBe("string");
        expect(value.trim().length, `${locale.id}/${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it("renders the marketing layer in Devanagari, not in a copy of the English", () => {
    const hindiKeys: StringKey[] = [
      "nav.portfolio",
      "home.headline",
      "home.lede",
      "legacy.tagline",
      "chrome.skipToContent",
      "gates.clear",
    ];
    for (const key of hindiKeys) {
      const hi = translate("hi", key);
      expect(hi, `${key} was not translated`).toMatch(/[\u0900-\u097F]/);
      expect(hi, `${key} is identical to the English`).not.toBe(translate("en", key));
    }
  });

  it("keeps brand names transliterated rather than translated", () => {
    expect(translate("hi", "nav.legacy")).toBe("ग्रिन लेगेसी");
    expect(translate("hi", "nav.serendipity")).toBe("सेरेंडिपिटी");
  });

  it("takes the English copy from the source records, so it cannot drift from them", () => {
    expect(translate("en", "home.headline")).toBe(portfolio.headline);
    expect(translate("en", "home.lede")).toBe(portfolio.lede);
    expect(translate("en", "legacy.tagline")).toBe(legacy.tagline);
  });

  it("produces a nav that points only at routes the app serves", () => {
    for (const locale of supportedLocales) {
      const nav = navFor(locale.id);
      expect(nav.length).toBeGreaterThanOrEqual(8);
      for (const item of nav) {
        expect(routes, `${locale.id}: ${item.href} is not a served route`).toContain(item.href);
        expect(item.label.trim().length, `${locale.id}: ${item.href} has no label`).toBeGreaterThan(0);
      }
    }
  });
});
