'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  ListChecks,
  Menu,
  Scissors,
  Settings,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { DemoLogo } from '@/components/site/logo';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import { formatDayLong } from '@/lib/date';
import { pluralize } from '@/lib/format';
import type { DemoConfig } from '@/types/demo';

export function DashboardShell({
  config,
  todayIso,
  children,
}: {
  config: DemoConfig;
  todayIso: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { ui, locale, rtl, href } = useLocale();
  const base = href(`/${config.slug}/dashboard`);

  const nav = [
    { href: base, label: ui.dashboard.nav.dashboard, icon: LayoutDashboard },
    { href: `${base}/appointments`, label: ui.dashboard.nav.appointments, icon: ListChecks },
    { href: `${base}/calendar`, label: ui.dashboard.nav.calendar, icon: CalendarDays },
    { href: `${base}/services`, label: ui.dashboard.nav.services, icon: Scissors },
    {
      href: `${base}/staff`,
      label: locale === 'ar' ? config.booking.labels.staff : pluralize(2, config.booking.labels.staff),
      icon: UserRound,
    },
    { href: `${base}/customers`, label: config.dashboard.customerLabelPlural, icon: Users },
    { href: `${base}/settings`, label: ui.dashboard.nav.settings, icon: Settings },
  ];

  const navList = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {nav.map((item) => {
        const active = item.href === base ? pathname === base : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'group relative flex items-center gap-3 rounded-brand px-3 py-2.5 text-[13.5px] transition-colors duration-200',
              active
                ? 'bg-[color:var(--brand-soft)] text-brand'
                : 'text-muted hover:bg-[color:var(--surface-alt)] hover:text-ink',
            )}
          >
            {active ? (
              <motion.span
                layoutId="dash-active"
                className={cn('absolute inset-y-1.5 w-0.5 rounded-full bg-brand', rtl ? 'right-0' : 'left-0')}
              />
            ) : null}
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.7} />
            <span className="truncate capitalize">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-page lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-[var(--nav-height)] items-center border-b border-line px-5">
          <DemoLogo config={config} href={href(`/${config.slug}`)} />
        </div>
        {navList}
        <div className="border-t border-line p-4">
          <Link
            href={href(`/${config.slug}`)}
            className="flex items-center gap-2 rounded-brand px-3 py-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className={cn('size-4', rtl && 'rotate-180')} />
            {ui.common.backToWebsite}
          </Link>
          <p className="mt-3 rounded-brand bg-[color:var(--brand-soft)] px-3 py-2.5 text-[11px] leading-relaxed text-brand">
            {ui.dashboard.demoNote}
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-[var(--nav-height)] items-center justify-between gap-3 border-b border-line bg-page/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-brand border border-line"
          aria-label={ui.dashboard.openMenu}
        >
          <Menu className="size-5" />
        </button>
        <DemoLogo config={config} compact href={href(`/${config.slug}`)} />
        <Link
          href={href(`/${config.slug}`)}
          className="rounded-brand border border-line px-3 py-2 text-[12px] text-muted"
        >
          {ui.dashboard.site}
        </Link>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ x: rtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: rtl ? '100%' : '-100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className={cn(
                'absolute inset-y-0 flex w-[min(84vw,290px)] flex-col bg-surface',
                rtl ? 'right-0' : 'left-0',
              )}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex h-[var(--nav-height)] items-center justify-between border-b border-line px-4">
                <DemoLogo config={config} compact href={href(`/${config.slug}`)} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-brand border border-line"
                  aria-label={ui.common.closeMenu}
                >
                  <X className="size-4" />
                </button>
              </div>
              {navList}
              <div className="border-t border-line p-4">
                <Link href={href(`/${config.slug}`)} className="text-[13px] text-muted">
                  {ui.common.backToWebsite}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <div className="hidden h-[var(--nav-height)] items-center justify-between gap-4 border-b border-line px-8 lg:flex">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
              {config.businessName} · {ui.dashboard.operations}
            </p>
            <p className="mt-0.5 text-[13px]">{formatDayLong(todayIso, locale)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12px] text-muted">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {ui.dashboard.allNormal}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-[color:var(--brand-soft)] text-[12px] font-medium text-brand">
              {config.staff[0]?.name.split(' ').map((part) => part.charAt(0)).slice(0, 2).join('')}
            </span>
          </div>
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
