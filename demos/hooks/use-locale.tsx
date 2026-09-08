'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import {
  DEFAULT_LOCALE,
  getUi,
  isRtl,
  localeHref,
  type Locale,
  type Ui,
} from '@/config/i18n';

interface LocaleContextValue {
  locale: Locale;
  ui: Ui;
  rtl: boolean;
  /** Prefixes an app path with the active locale. */
  href: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      ui: getUi(locale),
      rtl: isRtl(locale),
      href: (path: string) => localeHref(locale, path),
    }),
    [locale],
  );

  // English lives at the root and Arabic under /ar, so the two share one root
  // layout. Mirror the active locale onto <html> for assistive tech and search.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = isRtl(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Falls back to English so a component can render outside a provider. */
export function useLocale(): LocaleContextValue {
  return (
    useContext(LocaleContext) ?? {
      locale: DEFAULT_LOCALE,
      ui: getUi(DEFAULT_LOCALE),
      rtl: false,
      href: (path: string) => path,
    }
  );
}

export function useUi(): Ui {
  return useLocale().ui;
}
