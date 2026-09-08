import type { DemoConfig } from '@/types/demo';

/**
 * Content translations are overlays, not copies.
 *
 * An Arabic file supplies only the strings that change; ids, prices, images,
 * icons, hours and booking rules stay in the English config so the two can
 * never drift apart. Anything left untranslated falls back to English rather
 * than disappearing.
 */
export type Translation = DeepPartial<DemoConfig>;

type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { readonly [K in keyof T]?: DeepPartial<T[K]> }
    : T;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Merges an overlay over a base value.
 *
 * Arrays merge element-wise and keep the base length, so a translation can
 * fill in the first N entries and the rest still render.
 */
function merge<T>(base: T, overlay: unknown): T {
  if (overlay === undefined) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(overlay)) return base;
    return base.map((item, index) => merge(item, overlay[index])) as unknown as T;
  }

  if (isPlainObject(base) && isPlainObject(overlay)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(overlay)) {
      out[key] = merge((base as Record<string, unknown>)[key], overlay[key]);
    }
    return out as T;
  }

  return overlay as T;
}

export function applyTranslation(base: DemoConfig, translation?: Translation): DemoConfig {
  if (!translation) return base;
  return merge(base, translation);
}
