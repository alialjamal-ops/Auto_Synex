import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@/types/demo';

/**
 * Turns a demo's theme tokens into the CSS custom properties consumed by
 * `globals.css`. Applied once on the demo root — every component below it
 * (including the booking flow and dashboard) re-skins automatically.
 */
export function themeStyle(theme: ThemeTokens): CSSProperties {
  return {
    '--brand': theme.brand,
    '--brand-soft': theme.brandSoft,
    '--brand-contrast': theme.brandContrast,
    '--accent': theme.accent,
    '--bg': theme.bg,
    '--surface': theme.surface,
    '--surface-alt': theme.surfaceAlt,
    '--ink': theme.ink,
    '--ink-muted': theme.inkMuted,
    '--line': theme.line,
    '--radius': theme.radius,
    '--radius-lg': theme.radiusLg,
    '--display-font': theme.displayFont,
    '--body-font': theme.bodyFont,
  } as CSSProperties;
}
