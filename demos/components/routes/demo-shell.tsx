import type { ReactNode } from 'react';
import { DemoBar } from '@/components/site/demo-bar';
import { isRtl, type Locale } from '@/config/i18n';
import { BookingsProvider } from '@/hooks/use-bookings';
import { LocaleProvider } from '@/hooks/use-locale';
import { themeStyle } from '@/lib/theme';
import type { DemoConfig } from '@/types/demo';

/**
 * Shared chrome for every demo route in every language: theme variables,
 * text direction, the booking store and the demo switcher.
 */
export function DemoShell({
  config,
  locale,
  children,
}: {
  config: DemoConfig;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div
      lang={locale}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      style={themeStyle(config.theme)}
      data-display={config.theme.displayStyle}
      data-demo={config.slug}
      className="min-h-screen bg-page font-body text-ink"
    >
      <LocaleProvider locale={locale}>
        <BookingsProvider slug={config.slug}>
          {children}
          <DemoBar config={config} />
        </BookingsProvider>
      </LocaleProvider>
    </div>
  );
}
