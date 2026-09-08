import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@/lib/fonts';
import { siteConfig } from '@/config/site';
import './globals.css';

/** Vercel injects VERCEL_PROJECT_PRODUCTION_URL; override with NEXT_PUBLIC_SITE_URL. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.metaTitle,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.metaDescription,
  openGraph: {
    type: 'website',
    title: siteConfig.metaTitle,
    description: siteConfig.metaDescription,
    siteName: siteConfig.brandName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.metaTitle,
    description: siteConfig.metaDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07080a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
