import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import { DEFAULT_LOCALE, dirOf, isLocale, LOCALE_COOKIE } from "@/i18n/config";

export const metadata: Metadata = {
  title: { default: "Auto Synex Booking OS — Genesis demo", template: "%s · Auto Synex Booking OS" },
  description: "Interactive multi-industry booking platform demo: clinic, salon, academy and photography studio.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#161922" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  return (
    <html lang={locale} dir={dirOf(locale)} className={GeistSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
