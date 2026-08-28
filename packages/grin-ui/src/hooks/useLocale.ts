import { useCallback, useSyncExternalStore } from "react";
import { defaultLocale, langTagFor, supportedLocales, type Locale } from "@grin/content";

const STORAGE_KEY = "grin:locale";

/**
 * The site's language, held in one module-level store.
 *
 * A `useState` per component would leave the header switch and a page's copy out of
 * step — flipping the language would translate the nav and not the hero. One store
 * with `useSyncExternalStore` keeps every consumer on the same value and still
 * re-renders them all.
 */

function isKnown(value: unknown): value is Locale {
  return supportedLocales.some((entry) => entry.id === value);
}

function readStored(): Locale {
  if (typeof window === "undefined" || !window.localStorage) return defaultLocale;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw === null ? null : (JSON.parse(raw) as unknown);
    return isKnown(parsed) ? parsed : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

let current: Locale = readStored();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): Locale {
  return current;
}

function serverSnapshot(): Locale {
  return defaultLocale;
}

function set(next: Locale) {
  if (next === current) return;
  current = next;
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — the choice still applies for this session */
  }
  for (const listener of listeners) listener();
}

/** Reflect the choice onto `<html lang>`; screen readers pick a voice from it. */
if (typeof document !== "undefined") {
  subscribe(() => {
    document.documentElement.lang = langTagFor(current);
  });
  document.documentElement.lang = langTagFor(current);
}

/** The current language, and a setter every consumer shares. */
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const setLocale = useCallback((next: Locale) => set(next), []);
  return [locale, setLocale] as const;
}
