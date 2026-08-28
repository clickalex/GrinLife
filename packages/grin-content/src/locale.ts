/**
 * The locale layer.
 *
 * Every price on this site is in rupees and the governing law is the DPDP Act, so the
 * market the plan assumes reads Hindi — but all the copy is English. This is the
 * mechanism that closes that gap, plus a first reviewed subset.
 *
 * Scope, stated honestly: the keys below cover navigation, the portfolio hero, the
 * shared chrome and Grin Legacy's marketing layer, because those are what a family
 * deciding whether to buy a memory book actually reads. The plan-facing chapters —
 * the 36-month roadmap, the gate arithmetic, the spine matrix — stay English, because
 * their readers are a different audience and mistranslating a gate threshold is worse
 * than not translating it. `Record<Locale, Record<StringKey, string>>` makes a missing
 * translation a compile error rather than a blank string in production.
 */

import { legacy } from "./legacy";
import { portfolio } from "./portfolio";

export type Locale = "en" | "hi";

export const supportedLocales: { id: Locale; label: string; nativeLabel: string; langTag: string }[] = [
  { id: "en", label: "English", nativeLabel: "English", langTag: "en" },
  { id: "hi", label: "Hindi", nativeLabel: "हिन्दी", langTag: "hi" },
];

export const defaultLocale: Locale = "en";

export type StringKey =
  // Navigation
  | "nav.portfolio"
  | "nav.roadmap"
  | "nav.legacy"
  | "nav.social"
  | "nav.serendipity"
  | "nav.spine"
  | "nav.gates"
  | "nav.docs"
  | "nav.accessibility"
  // Chrome
  | "chrome.skipToContent"
  | "chrome.language"
  | "chrome.printPage"
  | "chrome.printBrief"
  | "chrome.notFound.title"
  | "chrome.notFound.body"
  | "chrome.notFound.home"
  // Home
  | "home.eyebrow"
  | "home.headline"
  | "home.lede"
  | "home.cta.primary"
  | "home.cta.secondary"
  // Gates
  | "gates.savedOnServer"
  | "gates.savedInBrowser"
  | "gates.clear"
  | "gates.notClear"
  | "gates.metOf"
  // Legacy
  | "legacy.tagline"
  | "legacy.orderCta"
  | "legacy.printBrief"
  // Intent
  | "intent.prefix"
  | "intent.target";

export const localizedStrings: Record<Locale, Record<StringKey, string>> = {
  en: {
    "nav.portfolio": "Portfolio",
    "nav.roadmap": "Roadmap",
    "nav.legacy": "Legacy",
    "nav.social": "Social",
    "nav.serendipity": "Serendipity",
    "nav.spine": "Shared spine",
    "nav.gates": "Gates",
    "nav.docs": "Docs",
    "nav.accessibility": "Accessibility",
    "chrome.skipToContent": "Skip to main content",
    "chrome.language": "Language",
    "chrome.printPage": "Print this page",
    "chrome.printBrief": "Print the brief",
    "chrome.notFound.title": "This stop does not exist",
    "chrome.notFound.body": "That trail stop is not on the map.",
    "chrome.notFound.home": "Back to the portfolio",
    "home.eyebrow": portfolio.scope.split(",")[0] ?? "Portfolio plan",
    "home.headline": portfolio.headline,
    "home.lede": portfolio.lede,
    "home.cta.primary": "Read the roadmap",
    "home.cta.secondary": "See the kill gates",
    "gates.savedOnServer": "Saved on server",
    "gates.savedInBrowser": "Saved in browser",
    "gates.clear": "Gate clear",
    "gates.notClear": "the gate is not passed",
    "gates.metOf": "met",
    "legacy.tagline": legacy.tagline,
    "legacy.orderCta": "Email the concierge desk",
    "legacy.printBrief": "Print the brief",
    "intent.prefix": "Families who have asked",
    "intent.target": "The gate needs",
  },
  hi: {
    "nav.portfolio": "पोर्टफ़ोलियो",
    "nav.roadmap": "रोडमैप",
    "nav.legacy": "ग्रिन लेगेसी",
    "nav.social": "ग्रिन सोशल",
    "nav.serendipity": "सेरेंडिपिटी",
    "nav.spine": "साझा आधार",
    "nav.gates": "गेट",
    "nav.docs": "दस्तावेज़",
    "nav.accessibility": "सुगम्यता",
    "chrome.skipToContent": "मुख्य सामग्री पर जाएँ",
    "chrome.language": "भाषा",
    "chrome.printPage": "यह पेज प्रिंट करें",
    "chrome.printBrief": "ब्रीफ़ प्रिंट करें",
    "chrome.notFound.title": "यह पड़ाव मौजूद नहीं है",
    "chrome.notFound.body": "यह पड़ाव नक़्शे पर नहीं है।",
    "chrome.notFound.home": "पोर्टफ़ोलियो पर वापस जाएँ",
    "home.eyebrow": "पोर्टफ़ोलियो योजना",
    "home.headline": "तीन प्रोडक्ट, तीन रास्ते — दौड़ नहीं, रिले की तरह।",
    "home.lede":
      "आप तीनों को अलग-अलग प्रोडक्ट बना सकते हैं। असली फ़ैसला यह नहीं है कि कौन-से प्रोडक्ट बनें — बल्कि यह है कि वे एक साथ बनेंगे या किल गेट के साथ एक-एक करके। इनमें से एक राह बचाई जा सकती है; दूसरे की विफलता दर अच्छी तरह दर्ज है।",
    "home.cta.primary": "रोडमैप पढ़ें",
    "home.cta.secondary": "किल गेट देखें",
    "gates.savedOnServer": "सर्वर पर सहेजा गया",
    "gates.savedInBrowser": "ब्राउज़र में सहेजा गया",
    "gates.clear": "गेट पास",
    "gates.notClear": "गेट पास नहीं हुआ",
    "gates.metOf": "पूरे",
    "legacy.tagline": "निर्देशित पारिवारिक कहानी-कथन, जिसका अंत एक सुंदर छपी हुई किताब में होता है।",
    "legacy.orderCta": "कॉन्सियर्ज डेस्क को ईमेल करें",
    "legacy.printBrief": "ब्रीफ़ प्रिंट करें",
    "intent.prefix": "पूछताछ करने वाले परिवार",
    "intent.target": "गेट के लिए आवश्यक",
  },
};

/** A key lookup that cannot silently return undefined. */
export function translate(locale: Locale, key: StringKey): string {
  return localizedStrings[locale][key];
}

export function langTagFor(locale: Locale): string {
  return supportedLocales.find((entry) => entry.id === locale)?.langTag ?? "en";
}

/** The nav labels in a given locale, so the header cannot drift from the route table. */
export function navFor(locale: Locale): { label: string; href: string }[] {
  return [
    { label: translate(locale, "nav.portfolio"), href: "/" },
    { label: translate(locale, "nav.roadmap"), href: "/roadmap" },
    { label: translate(locale, "nav.legacy"), href: "/products/legacy" },
    { label: translate(locale, "nav.social"), href: "/products/social" },
    { label: translate(locale, "nav.serendipity"), href: "/products/serendipity" },
    { label: translate(locale, "nav.spine"), href: "/spine" },
    { label: translate(locale, "nav.gates"), href: "/gates" },
    { label: translate(locale, "nav.docs"), href: "/docs" },
    { label: translate(locale, "nav.accessibility"), href: "/accessibility" },
  ];
}

/** What the switch offers, for rendering the control. */
export const localeOptions = supportedLocales.map((entry) => ({
  value: entry.id,
  label: entry.nativeLabel,
}));
