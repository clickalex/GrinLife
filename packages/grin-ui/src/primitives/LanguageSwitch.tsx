import type { ComponentProps } from "react";
import { supportedLocales, translate, type Locale } from "@grin/content";
import { cn } from "../lib/cn";

type LanguageSwitchProps = Omit<ComponentProps<"select">, "onChange" | "value"> & {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

/**
 * The language control that sits in the header.
 *
 * A `<select>` rather than a pair of buttons: it is keyboard-operable, announced with
 * its current value, and works without JavaScript being involved in the interaction.
 */
export function LanguageSwitch({ locale, onChange, className, ...props }: LanguageSwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <span className="sr-only">{translate(locale, "chrome.language")}</span>
      <span aria-hidden className="grin-label text-muted-foreground">
        {translate(locale, "chrome.language")}
      </span>
      <select
        value={locale}
        onChange={(event) => onChange(event.target.value as Locale)}
        className={cn(
          "rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground",
          "focus:outline-2 focus:outline-offset-1",
        )}
        {...props}
      >
        {supportedLocales.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
