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
  const base = `/${config.slug}/dashboard`;

  const nav = [
    { href: base, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/appointments`, label: 'Appointments', icon: ListChecks },
    { href: `${base}/calendar`, label: 'Calendar', icon: CalendarDays },
    { href: `${base}/services`, label: 'Services', icon: Scissors },
    { href: `${base}/staff`, label: pluralize(2, config.booking.labels.staff), icon: UserRound },
    { href: `${base}/customers`, label: config.dashboard.customerLabelPlural, icon: Users },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
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
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand"
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
          <DemoLogo config={config} href={`/${config.slug}`} />
        </div>
        {navList}
        <div className="border-t border-line p-4">
          <Link
            href={`/${config.slug}`}
            className="flex items-center gap-2 rounded-brand px-3 py-2 text-[13px] text-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" />
            Back to website
          </Link>
          <p className="mt-3 rounded-brand bg-[color:var(--brand-soft)] px-3 py-2.5 text-[11px] leading-relaxed text-brand">
            Demo data. Bookings you make in the demo appear here instantly.
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-[var(--nav-height)] items-center justify-between gap-3 border-b border-line bg-page/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-brand border border-line"
          aria-label="Open dashboard menu"
        >
          <Menu className="size-5" />
        </button>
        <DemoLogo config={config} compact />
        <Link
          href={`/${config.slug}`}
          className="rounded-brand border border-line px-3 py-2 text-[12px] text-muted"
        >
          Site
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="absolute inset-y-0 left-0 flex w-[min(84vw,290px)] flex-col bg-surface"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex h-[var(--nav-height)] items-center justify-between border-b border-line px-4">
                <DemoLogo config={config} compact />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-brand border border-line"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>
              {navList}
              <div className="border-t border-line p-4">
                <Link href={`/${config.slug}`} className="text-[13px] text-muted">
                  ← Back to website
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
              {config.businessName} · Operations
            </p>
            <p className="mt-0.5 text-[13px]">{formatDayLong(todayIso)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12px] text-muted">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              All systems normal
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
