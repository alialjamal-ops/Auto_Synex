'use client';

import { Languages } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { alternateHref } from '@/config/i18n';
import { cn } from '@/lib/cn';
import { useLocale } from '@/hooks/use-locale';

/** Switches between the English and Arabic version of the current page. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, ui } = useLocale();
  const pathname = usePathname() ?? '/';

  return (
    <Link
      href={alternateHref(locale, pathname)}
      hrefLang={locale === 'ar' ? 'en' : 'ar'}
      aria-label={ui.switchTo}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-brand border border-line px-3 text-[12.5px] text-ink/80 transition-colors hover:border-[color:var(--brand)] hover:text-brand',
        className,
      )}
    >
      <Languages className="size-4" />
      {ui.switchTo}
    </Link>
  );
}
