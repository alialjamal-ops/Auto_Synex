"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Locale, LocalizedText } from "@/domain/types";
import { ar } from "./ar";
import { dirOf, LOCALE_COOKIE } from "./config";
import { en, type Dictionary } from "./en";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  /** Picks the current language from a localised value. */
  tx: (text: LocalizedText) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = dirOf(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: dirOf(locale),
      t: dictionaries[locale],
      tx: (text) => text[locale] || text.en,
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
