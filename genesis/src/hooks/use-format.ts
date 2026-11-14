"use client";

import { useMemo } from "react";
import { zonedToInstant, type DateKey } from "@/domain/time";
import { useI18n } from "@/i18n/provider";
import { intlLocale } from "@/i18n/config";

/**
 * Locale + time-zone aware formatters. Every date shown in the product is
 * rendered in the *business* time zone, never the viewer's.
 */
export function useFormat(timeZone: string, currency: string) {
  const { locale } = useI18n();
  return useMemo(() => {
    const loc = intlLocale(locale);
    const cache = new Map<string, Intl.DateTimeFormat>();
    const dtf = (opts: Intl.DateTimeFormatOptions) => {
      const key = JSON.stringify(opts);
      let f = cache.get(key);
      if (!f) {
        f = new Intl.DateTimeFormat(loc, { timeZone, ...opts });
        cache.set(key, f);
      }
      return f;
    };
    const money = new Intl.NumberFormat(loc, { style: "currency", currency, maximumFractionDigits: 0 });
    const compactMoney = new Intl.NumberFormat(loc, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 });
    const number = new Intl.NumberFormat(loc);
    const percent = new Intl.NumberFormat(loc, { style: "percent", maximumFractionDigits: 1 });
    const keyToDate = (key: DateKey) => zonedToInstant(key, "12:00", timeZone);

    return {
      time: (iso: string | Date) => dtf({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)),
      /** "HH:mm" wall time string → localised (keeps 24h for clarity). */
      wall: (hm: string) => hm,
      date: (iso: string | Date) => dtf({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)),
      dateLong: (iso: string | Date) => dtf({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)),
      dateShort: (iso: string | Date) => dtf({ weekday: "short", day: "numeric", month: "short" }).format(new Date(iso)),
      dateTime: (iso: string | Date) =>
        dtf({ weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)),
      keyLong: (key: DateKey) => dtf({ weekday: "long", day: "numeric", month: "long" }).format(keyToDate(key)),
      keyShort: (key: DateKey) => dtf({ weekday: "short", day: "numeric", month: "short" }).format(keyToDate(key)),
      keyDay: (key: DateKey) => dtf({ day: "numeric" }).format(keyToDate(key)),
      keyWeekdayShort: (key: DateKey) => dtf({ weekday: "short" }).format(keyToDate(key)),
      keyMonthYear: (key: DateKey) => dtf({ month: "long", year: "numeric" }).format(keyToDate(key)),
      keyMonthShort: (key: DateKey) => dtf({ day: "numeric", month: "short" }).format(keyToDate(key)),
      money: (n: number) => money.format(n),
      compactMoney: (n: number) => compactMoney.format(n),
      number: (n: number) => number.format(n),
      percent: (n: number) => percent.format(n),
      tzName: () => {
        const part = dtf({ timeZoneName: "shortOffset" })
          .formatToParts(new Date())
          .find((p) => p.type === "timeZoneName");
        return `${timeZone.split("/").pop()?.replace(/_/g, " ")} (${part?.value ?? ""})`;
      },
    };
  }, [locale, timeZone, currency]);
}

export type Formatters = ReturnType<typeof useFormat>;
