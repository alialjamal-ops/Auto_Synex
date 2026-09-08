import type { DemoConfig, DemoSlug } from '@/types/demo';
import { clinicDemo } from './clinic';
import { dentalDemo } from './dental';
import { hotelDemo } from './hotel';
import { restaurantDemo } from './restaurant';
import { salonDemo } from './salon';

/**
 * The demo registry.
 *
 * Adding a new industry demo is a single change: create `config/demos/<name>.ts`
 * exporting a `DemoConfig`, then register it here. Routing, metadata, the demo
 * selector, the booking engine and the dashboard all read from this map.
 */
export const demos = {
  clinic: clinicDemo,
  dental: dentalDemo,
  salon: salonDemo,
  hotel: hotelDemo,
  restaurant: restaurantDemo,
} as const satisfies Record<DemoSlug, DemoConfig>;

export const demoSlugs = Object.keys(demos) as DemoSlug[];

export const demoList: readonly DemoConfig[] = demoSlugs.map((slug) => demos[slug]);

export function isDemoSlug(value: string): value is DemoSlug {
  return value in demos;
}

export function getDemo(slug: string): DemoConfig | null {
  return isDemoSlug(slug) ? demos[slug] : null;
}
