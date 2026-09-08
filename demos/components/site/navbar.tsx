'use client';

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EASE } from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { DemoLogo } from '@/components/site/logo';
import { cn } from '@/lib/cn';
import type { DemoConfig } from '@/types/demo';

export function Navbar({ config }: { config: DemoConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled(value > 24);
  });

  // Never leave a mobile menu open behind a scroll-locked body.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-500',
          scrolled ? 'glass border-b border-line' : 'border-b border-transparent',
        )}
        style={{ height: 'var(--nav-height)' }}
      >
        <nav className="container-x flex h-full items-center justify-between gap-6">
          <DemoLogo config={config} href={`/${config.slug}`} />

          <ul className="hidden items-center gap-1 lg:flex">
            {config.nav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative rounded-brand px-3 py-2 text-[13.5px] text-ink/75 transition-colors duration-300 hover:text-ink"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all duration-300 hover:w-full" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
              className="hidden items-center gap-2 rounded-brand px-3 py-2 text-[13.5px] text-ink/75 transition-colors hover:text-ink xl:inline-flex"
            >
              <Phone className="size-3.5" />
              {config.contact.phone}
            </a>
            <Button href={`/${config.slug}/book`} size="sm" className="hidden sm:inline-flex">
              {config.cta.label}
              <ButtonArrow />
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-brand border border-line text-ink transition-colors hover:border-[color:var(--brand)] lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col bg-page"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div
                className="flex items-center justify-between border-b border-line px-5"
                style={{ height: 'var(--nav-height)' }}
              >
                <DemoLogo config={config} compact />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-10 place-items-center rounded-brand border border-line text-ink"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto px-5 py-6">
                {config.nav.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * 0.05, duration: 0.4, ease: EASE }}
                    className="border-b border-line/60 last:border-0"
                  >
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-4 font-display text-2xl"
                    >
                      {link.label}
                      <span className="text-xs text-muted">0{index + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-line p-5">
                <Button href={`/${config.slug}/book`} size="lg" fullWidth onClick={() => setOpen(false)}>
                  {config.cta.label}
                  <ButtonArrow />
                </Button>
                <div className="flex items-center justify-between text-xs text-muted">
                  <a href={`tel:${config.contact.phone.replace(/\s/g, '')}`}>{config.contact.phone}</a>
                  <Link href="/" className="underline underline-offset-4">
                    All demos
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
