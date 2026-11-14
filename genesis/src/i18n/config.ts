import type { Locale } from "@/domain/types";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "genesis-locale";

export const isLocale = (v: unknown): v is Locale => v === "en" || v === "ar";
export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
/** Latin digits + Gregorian calendar keep dates unambiguous for Gulf businesses. */
export const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-AE-u-nu-latn-ca-gregory" : "en-GB");
