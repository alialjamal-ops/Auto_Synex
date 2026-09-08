/**
 * Date helpers built around "YYYY-MM-DD" strings.
 *
 * Everything the booking engine and dashboard render is derived from these
 * strings, which keeps server and client output byte-identical (no timezone
 * drift, no hydration mismatches).
 */

import type { Locale } from '@/config/i18n';

export const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const WEEKDAY_LONG_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

const WEEKDAY_SHORT_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] as const;

const MONTH_LONG_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

/**
 * Locale-aware name tables. Latin digits are kept in both languages so the
 * server and the browser always render the same string.
 */
export function weekdayLong(day: number, locale: Locale = 'en'): string {
  return (locale === 'ar' ? WEEKDAY_LONG_AR : WEEKDAY_LONG)[day] ?? '';
}

export function weekdayShort(day: number, locale: Locale = 'en'): string {
  return (locale === 'ar' ? WEEKDAY_SHORT_AR : WEEKDAY_SHORT)[day] ?? '';
}

export function monthLong(month: number, locale: Locale = 'en'): string {
  return (locale === 'ar' ? MONTH_LONG_AR : MONTH_LONG)[month] ?? '';
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date as "YYYY-MM-DD" (never UTC-shifted). */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses "YYYY-MM-DD" at local midday so DST can never shift the day. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function diffDays(fromIso: string, toIso: string): number {
  const ms = fromISODate(toIso).getTime() - fromISODate(fromIso).getTime();
  return Math.round(ms / 86_400_000);
}

export function weekdayOf(iso: string): number {
  return fromISODate(iso).getDay();
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export function isBefore(a: string, b: string): boolean {
  return a < b;
}

/** "Mon, 14 Apr" style label. */
export function formatDayShort(iso: string, locale: Locale = 'en'): string {
  const date = fromISODate(iso);
  const month =
    locale === 'ar' ? monthLong(date.getMonth(), 'ar') : MONTH_LONG[date.getMonth()]?.slice(0, 3);
  return `${weekdayShort(date.getDay(), locale)}، ${date.getDate()} ${month}`.replace(
    '،',
    locale === 'ar' ? '،' : ',',
  );
}

/** "Monday, 14 April 2026". */
export function formatDayLong(iso: string, locale: Locale = 'en'): string {
  const date = fromISODate(iso);
  const separator = locale === 'ar' ? '،' : ',';
  return `${weekdayLong(date.getDay(), locale)}${separator} ${date.getDate()} ${monthLong(date.getMonth(), locale)} ${date.getFullYear()}`;
}

export function formatMonthYear(iso: string, locale: Locale = 'en'): string {
  const date = fromISODate(iso);
  return `${monthLong(date.getMonth(), locale)} ${date.getFullYear()}`;
}

/** "09:30" → "9:30 AM" / "9:30 ص". */
export function formatTime(hhmm: string, locale: Locale = 'en'): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h ?? 0;
  const suffix = locale === 'ar' ? (hour >= 12 ? 'م' : 'ص') : hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${pad(m ?? 0)} ${suffix}`;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function addMinutes(hhmm: string, minutes: number): string {
  return minutesToTime(timeToMinutes(hhmm) + minutes);
}

/** Monday-first index (0 = Monday) used by the dashboard calendar. */
export function mondayIndex(weekday: number): number {
  return (weekday + 6) % 7;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -mondayIndex(weekdayOf(iso)));
}

export function startOfMonth(iso: string): string {
  const date = fromISODate(iso);
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1, 12));
}

export function addMonths(iso: string, months: number): string {
  const date = fromISODate(iso);
  return toISODate(new Date(date.getFullYear(), date.getMonth() + months, 1, 12));
}

export function daysInMonth(iso: string): number {
  const date = fromISODate(iso);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 6×7 grid of ISO dates covering the month that `iso` falls in, padded with
 * neighbouring days so every calendar renders at a stable height.
 */
export function monthMatrix(iso: string): { iso: string; inMonth: boolean }[] {
  const first = startOfMonth(iso);
  const lead = mondayIndex(weekdayOf(first));
  const total = daysInMonth(iso);
  const cells: { iso: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i += 1) {
    const offset = i - lead;
    cells.push({ iso: addDays(first, offset), inMonth: offset >= 0 && offset < total });
  }
  return cells;
}

export function relativeDayLabel(
  iso: string,
  todayIso: string,
  locale: Locale = 'en',
): string | null {
  const delta = diffDays(todayIso, iso);
  const ar = locale === 'ar';
  if (delta === 0) return ar ? 'اليوم' : 'Today';
  if (delta === 1) return ar ? 'غدًا' : 'Tomorrow';
  if (delta === -1) return ar ? 'أمس' : 'Yesterday';
  return null;
}
