'use client';

import Link from 'next/link';
import { Button, ButtonArrow } from '@/components/ui/button';
import { DemoLogo } from '@/components/site/logo';
import { useLocale } from '@/hooks/use-locale';
import { getIcon } from '@/lib/icons';
import { formatTime, weekdayLong } from '@/lib/date';
import type { DemoConfig } from '@/types/demo';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function Footer({ config }: { config: DemoConfig }) {
  const { ui, locale, rtl, href } = useLocale();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <DemoLogo config={config} href={href(`/${config.slug}`)} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{config.tagline}</p>
            <div className="mt-6 flex gap-2">
              {config.contact.socials.map((social) => {
                const Icon = getIcon(social.icon);
                return (
                  <span
                    key={social.label}
                    className="grid size-9 place-items-center rounded-brand border border-line text-muted transition-colors hover:border-[color:var(--brand)] hover:text-brand"
                    aria-label={social.label}
                  >
                    <Icon className="size-4" />
                  </span>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{config.nav[0] ? ui.landing.demosNav : ui.landing.demosNav}</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {config.nav.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-ink/75 transition-colors hover:text-brand">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{ui.common.openingHours}</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {DAY_ORDER.map((day) => {
                const hours = config.hours[day];
                return (
                  <li key={day} className="flex justify-between gap-4 text-ink/75">
                    <span>{weekdayLong(day, locale)}</span>
                    <span className={hours ? 'text-ink' : 'text-muted'}>
                      {hours
                        ? `${formatTime(hours.open, locale)} – ${formatTime(hours.close, locale)}`
                        : ui.common.closed}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{ui.landing.footerContact}</h3>
            <address className="mt-5 space-y-2 text-sm not-italic text-ink/75">
              {config.contact.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pt-2">
                <a href={`tel:${config.contact.phone.replace(/\s/g, '')}`} className="hover:text-brand">
                  {config.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${config.contact.email}`} className="hover:text-brand">
                  {config.contact.email}
                </a>
              </p>
            </address>
            <Button href={href(`/${config.slug}/book`)} size="sm" className="mt-6">
              {config.cta.label}
              <ButtonArrow className={rtl ? 'rotate-180' : ''} />
            </Button>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {config.businessName}. Interactive demo — not a real
            business.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={href(`/${config.slug}/dashboard`)} className="hover:text-ink">
              {ui.common.dashboard}
            </Link>
            <Link href={href('/')} className="hover:text-ink">
              {ui.common.allDemos}
            </Link>
            <span className="hidden sm:inline">{ui.common.photography}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
