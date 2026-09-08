import type { Locale } from '@/config/i18n';

/** Presentation helpers shared by the sites, the booking flow and the dashboard. */

export function formatMoney(amount: number, symbol = '$', decimals = 0): string {
  const value = amount.toFixed(decimals);
  const [whole, fraction] = value.split('.');
  const grouped = (whole ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${grouped}${fraction ? `.${fraction}` : ''}`;
}

export function formatCompactMoney(amount: number, symbol = '$'): string {
  if (Math.abs(amount) >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  return formatMoney(amount, symbol);
}

export function formatDuration(minutes: number, locale: Locale = 'en'): string {
  const ar = locale === 'ar';
  const min = ar ? 'دقيقة' : 'min';
  const hr = (count: number) =>
    ar ? (count === 1 ? 'ساعة' : count === 2 ? 'ساعتان' : 'ساعات') : count > 1 ? 'hrs' : 'hr';

  if (minutes < 60) return `${minutes} ${min}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursLabel = ar && hours <= 2 ? hr(hours) : `${hours} ${hr(hours)}`;
  if (rest === 0) return hoursLabel;
  return `${hoursLabel} ${rest} ${min}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `••• ••• ${digits.slice(-4)}`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function percentDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}
