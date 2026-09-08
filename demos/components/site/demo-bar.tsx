'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, LayoutDashboard, Globe, CalendarCheck, Grid2x2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { AutoSynexMark } from '@/components/brand/mark';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import type { DemoConfig } from '@/types/demo';

/**
 * The "this is a demo" affordance.
 *
 * A single floating pill, bottom-centre, that never covers content and expands
 * into a switcher for the three products (site / booking / dashboard). Visitors
 * arriving from an ad can jump straight to the dashboard from any page.
 */
export function DemoBar({ config }: { config: DemoConfig }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const { ui, href } = useLocale();

  if (hidden) return null;

  const root = href(`/${config.slug}`);
  const links = [
    { href: root, label: ui.common.website, icon: Globe },
    { href: `${root}/book`, label: ui.common.booking, icon: CalendarCheck },
    { href: `${root}/dashboard`, label: ui.common.dashboard, icon: LayoutDashboard },
  ];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6"
    >
      <div className="glass pointer-events-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-full border border-line shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]">
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex items-center gap-1 p-1.5"
            >
              {links.map((link) => {
                const active =
                  link.href === root ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition-colors sm:px-3.5',
                      active
                        ? 'bg-brand text-[color:var(--brand-contrast)]'
                        : 'text-ink/75 hover:bg-[color:var(--brand-soft)] hover:text-ink',
                    )}
                  >
                    <link.icon className="size-3.5" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
              <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
              <Link
                href={href('/')}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] text-ink/75 transition-colors hover:bg-[color:var(--brand-soft)] hover:text-ink"
              >
                <Grid2x2 className="size-3.5" />
                <span className="hidden sm:inline">{ui.common.allDemos}</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                aria-label={ui.common.close}
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center"
            >
              {/* The mark is a way home from any demo page, not just decoration. */}
              <Link
                href={href('/')}
                aria-label={ui.common.allDemos}
                className="flex items-center py-2.5 ps-4 pe-2.5 transition-opacity hover:opacity-70"
              >
                <AutoSynexMark className="h-6" />
              </Link>
              <span aria-hidden className="h-4 w-px bg-line" />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2.5 py-2.5 pe-4 ps-2.5 text-[12px] font-medium tracking-wide"
              >
                {ui.common.interactiveDemo}
                <ChevronUp className="size-3.5 text-muted" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {open ? (
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="pointer-events-auto ml-2 hidden text-[11px] text-muted underline underline-offset-4 hover:text-ink sm:block"
        >
          {ui.common.hideBar}
        </button>
      ) : null}
    </motion.div>
  );
}
