import localFont from 'next/font/local';

/**
 * Self-hosted variable fonts (latin subset, woff2) from Google Fonts.
 *
 * Serving them from `app/fonts` instead of fonts.gstatic.com removes a
 * third-party request from every page load, kills the flash of unstyled text,
 * and makes builds work without network access to Google.
 *
 * One body face (Inter) is shared by every demo; each demo picks one display
 * face through its theme tokens.
 */

export const inter = localFont({
  src: [{ path: '../app/fonts/inter.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const manrope = localFont({
  src: [{ path: '../app/fonts/manrope.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
});

export const sora = localFont({
  src: [{ path: '../app/fonts/sora.woff2', weight: '100 800', style: 'normal' }],
  variable: '--font-sora',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
});

export const cormorant = localFont({
  src: [
    { path: '../app/fonts/cormorant.woff2', weight: '300 700', style: 'normal' },
    { path: '../app/fonts/cormorant-italic.woff2', weight: '300 700', style: 'italic' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const playfair = localFont({
  src: [{ path: '../app/fonts/playfair.woff2', weight: '400 900', style: 'normal' }],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const fraunces = localFont({
  src: [{ path: '../app/fonts/fraunces.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const fontVariables = [
  inter.variable,
  manrope.variable,
  sora.variable,
  cormorant.variable,
  playfair.variable,
  fraunces.variable,
].join(' ');
