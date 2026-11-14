/**
 * Time-zone aware helpers. All instants are stored as UTC ISO strings; all
 * business rules (opening hours, slots, "today") are evaluated as wall-clock
 * time in the business's IANA time zone via @date-fns/tz.
 */
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import type { Weekday } from "./types";

/** "yyyy-MM-dd" calendar date in the business time zone. */
export type DateKey = string;

export function parseHM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function splitKey(key: DateKey): [number, number, number] {
  const [y, m, d] = key.split("-").map(Number);
  return [y, m, d];
}

function exactInstant(y: number, m: number, d: number, minutes: number, timeZone: string): number {
  return new TZDate(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0, timeZone).getTime();
}

/** Per-day UTC offset cache; null when the day contains a DST transition. */
const offsetCache = new Map<string, number | null>();

/** Converts a wall-clock date + time in `timeZone` to a UTC instant. */
export function zonedToInstant(key: DateKey, time: string, timeZone: string): Date {
  const [y, m, d] = splitKey(key);
  const minutes = parseHM(time);
  const cacheKey = `${timeZone}|${key}`;
  let offset = offsetCache.get(cacheKey);
  if (offset === undefined) {
    const base = Date.UTC(y, m - 1, d);
    const early = base - exactInstant(y, m, d, 0, timeZone);
    const late = base + 1439 * 60_000 - exactInstant(y, m, d, 1439, timeZone);
    offset = early === late ? early : null;
    if (offsetCache.size > 5000) offsetCache.clear();
    offsetCache.set(cacheKey, offset);
  }
  if (offset === null) return new Date(exactInstant(y, m, d, minutes, timeZone));
  return new Date(Date.UTC(y, m - 1, d) + minutes * 60_000 - offset);
}

export function toDateKey(instant: Date | string, timeZone: string): DateKey {
  return format(new TZDate(new Date(instant).getTime(), timeZone), "yyyy-MM-dd");
}

/** Wall-clock "HH:mm" of an instant in `timeZone`. */
export function toWallTime(instant: Date | string, timeZone: string): string {
  return format(new TZDate(new Date(instant).getTime(), timeZone), "HH:mm");
}

/** Minutes since local midnight of an instant in `timeZone`. */
export function minutesInZone(instant: Date | string, timeZone: string): number {
  return parseHM(toWallTime(instant, timeZone));
}

export function weekdayOfKey(key: DateKey): Weekday {
  const [y, m, d] = splitKey(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday;
}

export function addDaysToKey(key: DateKey, days: number): DateKey {
  const [y, m, d] = splitKey(key);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function diffDaysKeys(a: DateKey, b: DateKey): number {
  const [ay, am, ad] = splitKey(a);
  const [by, bm, bd] = splitKey(b);
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / 86_400_000);
}

/** Start of the week (Saturday for Arabic, Sunday for English). */
export function startOfWeekKey(key: DateKey, weekStartsOn: Weekday): DateKey {
  const wd = weekdayOfKey(key);
  const back = (wd - weekStartsOn + 7) % 7;
  return addDaysToKey(key, -back);
}

export function startOfMonthKey(key: DateKey): DateKey {
  return `${key.slice(0, 7)}-01`;
}

export function addMonthsToKey(key: DateKey, months: number): DateKey {
  const [y, m] = splitKey(key);
  const date = new Date(Date.UTC(y, m - 1 + months, 1));
  return date.toISOString().slice(0, 10);
}

export function daysInMonthOfKey(key: DateKey): number {
  const [y, m] = splitKey(key);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addMinutes(instant: Date | string, minutes: number): Date {
  return new Date(new Date(instant).getTime() + minutes * 60_000);
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}
