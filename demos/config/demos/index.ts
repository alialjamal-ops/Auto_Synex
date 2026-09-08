import type { DemoConfig, DemoSlug } from '@/types/demo';
import { DEFAULT_LOCALE, type Locale } from '@/config/i18n';
import { applyTranslation, type Translation } from '@/lib/localize';
import { clinicDemo } from './clinic';
import { clinicAr } from './clinic.ar';
import { dentalDemo } from './dental';
import { dentalAr } from './dental.ar';
import { hotelDemo } from './hotel';
import { hotelAr } from './hotel.ar';
import { restaurantDemo } from './restaurant';
import { restaurantAr } from './restaurant.ar';
import { salonDemo } from './salon';
import { salonAr } from './salon.ar';

/**
 * The demo registry.
 *
 * Adding an industry demo is one change: create `config/demos/<name>.ts`
 * exporting a `DemoConfig` (plus an optional `<name>.ar.ts` translation) and
 * register it here. Routing, metadata, the demo selector, the booking engine
 * and the dashboard all read from this map.
 */
export const demos = {
  clinic: clinicDemo,
  dental: dentalDemo,
  salon: salonDemo,
  hotel: hotelDemo,
  restaurant: restaurantDemo,
} as const satisfies Record<DemoSlug, DemoConfig>;

const translations: Record<DemoSlug, Partial<Record<Locale, Translation>>> = {
  clinic: { ar: clinicAr },
  dental: { ar: dentalAr },
  salon: { ar: salonAr },
  hotel: { ar: hotelAr },
  restaurant: { ar: restaurantAr },
};

export const demoSlugs = Object.keys(demos) as DemoSlug[];

export function isDemoSlug(value: string): value is DemoSlug {
  return value in demos;
}

/** Localised config for a demo. Falls back to English for missing strings. */
export function getDemo(slug: string, locale: Locale = DEFAULT_LOCALE): DemoConfig | null {
  if (!isDemoSlug(slug)) return null;
  const base = demos[slug];
  if (locale === DEFAULT_LOCALE) return base;
  return applyTranslation(base, translations[slug][locale]);
}

export function getDemoList(locale: Locale = DEFAULT_LOCALE): readonly DemoConfig[] {
  return demoSlugs.map((slug) => getDemo(slug, locale) as DemoConfig);
}

export const demoList: readonly DemoConfig[] = getDemoList();
