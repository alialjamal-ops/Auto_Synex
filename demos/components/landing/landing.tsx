'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AutoSynexLockup, AutoSynexLogo } from '@/components/brand/mark';
import { ImageReveal } from '@/components/animations/image-reveal';
import { Marquee } from '@/components/animations/marquee';
import {
  Counter,
  EASE,
  Reveal,
  Stagger,
  StaggerItem,
  TextReveal,
  useRevealed,
} from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { Eyebrow, SectionHeading } from '@/components/ui/primitives';
import { SmartImage } from '@/components/ui/smart-image';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { getIcon } from '@/lib/icons';
import type { DemoConfig } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: '#demos', label: 'Demos' },
  { href: '#what', label: 'What we build' },
  { href: '#how', label: 'How it works' },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        scrolled ? 'glass border-b border-line' : 'border-b border-transparent',
      )}
      style={{ height: 'var(--nav-height)' }}
    >
      <nav className="container-x flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label={`${siteConfig.brandName} — home`}>
          <AutoSynexLogo />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-[13.5px] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button href="#demos" size="sm" className="hidden sm:inline-flex">
            Explore demos
            <ButtonArrow />
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-brand border border-line md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-b border-line px-5 pb-5 md:hidden"
        >
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/60 py-3 font-display text-lg"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button href="#demos" fullWidth className="mt-4" onClick={() => setOpen(false)}>
            Explore demos
            <ButtonArrow />
          </Button>
        </motion.div>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function LandingHero({ demos }: { demos: readonly DemoConfig[] }) {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-height)+4rem)] pb-16 sm:pb-20 lg:pt-[calc(var(--nav-height)+6rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-18rem] size-[46rem] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
          style={{ background: 'var(--brand)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)',
          }}
        />
      </div>

      <div className="container-x relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2.5 rounded-full border border-line px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-brand" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          {siteConfig.hero.kicker}
        </motion.p>

        <TextReveal
          lines={siteConfig.hero.headline}
          delay={0.12}
          className="mt-7 max-w-4xl font-display text-[clamp(2.8rem,8vw,6rem)] font-bold tracking-[-0.035em] leading-[0.95]"
          accentLast
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="mt-7 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-lg"
        >
          {siteConfig.hero.lead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.62, ease: EASE }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button href="#demos" size="lg">
            Choose your business
            <ButtonArrow />
          </Button>
          <Button href="#what" variant="outline" size="lg">
            See what&apos;s included
          </Button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-line pt-8"
        >
          {siteConfig.hero.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <Counter value={stat.value} className="block font-display text-3xl sm:text-4xl" />
                <span className="mt-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <div className="relative mt-16 border-y border-line py-5">
        <Marquee
          items={demos.map((demo) => `${demo.businessName} — ${demo.industry}`)}
          itemClassName="text-[12px] uppercase tracking-[0.2em] text-muted"
          speed={44}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Demo selector                                                       */
/* ------------------------------------------------------------------ */

export function DemoGrid({ demos }: { demos: readonly DemoConfig[] }) {
  return (
    <section id="demos" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            eyebrow="Interactive demos"
            title="Choose your business"
            text="Each demo is a complete, working product: a website, a booking flow with real availability logic, and an operations dashboard. Click anything — it all works."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {demos.map((demo, index) => (
            <DemoCard key={demo.slug} demo={demo} index={index} featured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoCard({
  demo,
  index,
  featured,
}: {
  demo: DemoConfig;
  index: number;
  featured?: boolean;
}) {
  const { ref, inView } = useRevealed('-8% 0px -8% 0px');

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay: (index % 2) * 0.08, ease: EASE }}
      className={cn(
        'group relative overflow-hidden rounded-brand-lg border border-line bg-surface transition-[transform,border-color] duration-500 hover:-translate-y-1',
        featured && 'lg:col-span-2',
      )}
      style={{ ['--card-accent' as string]: demo.card.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${demo.card.accent}22, transparent 60%)`,
        }}
      />

      <div className={cn('relative grid gap-0', featured ? 'lg:grid-cols-2' : '')}>
        <div className={cn('relative overflow-hidden', featured && 'lg:order-2')}>
          <ImageReveal>
            <SmartImage
              asset={demo.card.image}
              alt={`${demo.businessName} demo preview`}
              ratio={featured ? '16/9' : '16/10'}
              sizes="(max-width: 1024px) 100vw, 50vw"
              zoomOnHover
              className={featured ? 'lg:h-full lg:aspect-auto' : ''}
            />
          </ImageReveal>
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur"
            style={{ background: `${demo.card.accent}dd` }}
          >
            {demo.card.title}
          </span>
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-semibold tracking-tight">
                {demo.businessName}
              </h3>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted">
                {demo.tagline}
              </p>
            </div>
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-all duration-500 group-hover:border-transparent"
              style={{ color: demo.card.accent }}
            >
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>

          <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{demo.card.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {demo.card.features.map((feature) => (
              <li
                key={feature}
                className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-muted"
              >
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-7">
            <Link
              href={`/${demo.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-brand px-5 text-[13.5px] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
              style={{ background: demo.card.accent }}
            >
              {demo.card.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={`/${demo.slug}/book`}
              className="inline-flex h-11 items-center rounded-brand border border-line px-4 text-[13px] text-muted transition-colors hover:border-[color:var(--brand)] hover:text-ink"
            >
              Booking
            </Link>
            <Link
              href={`/${demo.slug}/dashboard`}
              className="inline-flex h-11 items-center rounded-brand border border-line px-4 text-[13px] text-muted transition-colors hover:border-[color:var(--brand)] hover:text-ink"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Offers                                                              */
/* ------------------------------------------------------------------ */

export function OfferSection() {
  return (
    <section id="what" className="scroll-mt-24 border-t border-line bg-surface py-20 sm:py-24 lg:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            eyebrow="What we build"
            title="Three ways to work with us"
            text="Start with the website, add the booking engine when you are ready, or take the whole operation in one build."
          />
        </Reveal>

        <Stagger className="mt-12 grid gap-5 lg:grid-cols-3">
          {siteConfig.offers.map((offer) => {
            const Icon = getIcon(offer.icon);
            return (
              <StaggerItem key={offer.id} className="h-full">
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-brand-lg border p-7 transition-transform duration-500 hover:-translate-y-1',
                    offer.featured
                      ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                      : 'border-line bg-page',
                  )}
                >
                  {offer.featured ? (
                    <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white">
                      Most requested
                    </span>
                  ) : null}
                  <span className="grid size-11 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                    <Icon className="size-5" strokeWidth={1.6} />
                  </span>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {offer.tagline}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {offer.name}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted">{offer.description}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {offer.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[13.5px] text-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href="#demos"
                    variant={offer.featured ? 'primary' : 'outline'}
                    className="mt-7"
                    fullWidth
                  >
                    See it working
                    <ButtonArrow />
                  </Button>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Capabilities + process                                              */
/* ------------------------------------------------------------------ */

export function CapabilityStrip() {
  return (
    <section className="border-t border-line py-16 sm:py-20">
      <div className="container-x">
        <Stagger className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.capabilities.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <StaggerItem key={item.title}>
                <Icon className="size-5 text-brand" strokeWidth={1.6} />
                <h3 className="mt-4 font-display text-[16px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.text}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-line py-20 sm:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="From demo to live in about a week"
            />
          </Reveal>
        </div>
        <Stagger className="lg:col-span-8">
          {siteConfig.process.map((step, index) => (
            <StaggerItem
              key={step.title}
              className="grid gap-3 border-t border-line py-7 last:border-b sm:grid-cols-[auto_1fr_2fr] sm:gap-8"
            >
              <span className="font-display text-sm text-brand">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA + footer                                                */
/* ------------------------------------------------------------------ */

export function LandingCta() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-14rem] mx-auto size-[40rem] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'var(--brand)' }}
      />
      <div className="container-x relative text-center">
        <Reveal>
          <Eyebrow className="justify-center">Ready when you are</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2.2rem,5.4vw,4rem)] font-bold tracking-[-0.03em]">
            Try the demo closest to your business.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Book an appointment, reserve a table, check into a suite — then open the dashboard and
            watch it appear.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="#demos" size="lg">
            Choose your business
            <ButtonArrow />
          </Button>
          <Button href={`mailto:${siteConfig.email}`} variant="outline" size="lg" native>
            {siteConfig.email}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingFooter({ demos }: { demos: readonly DemoConfig[] }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AutoSynexLockup />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.tagline}</p>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted">Demos</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {demos.map((demo) => (
              <li key={demo.slug}>
                <Link
                  href={`/${demo.slug}`}
                  className="text-sm text-ink/75 transition-colors hover:text-brand"
                >
                  {demo.businessName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-muted">Contact</h2>
          <ul className="mt-5 space-y-3 text-sm text-ink/75">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-brand">
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone.replace(/\s/g, '')}`} className="hover:text-brand">
                {siteConfig.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.brandName}. All demo businesses are
          fictional.
        </p>
        <p>Photography: StockSnap (CC0)</p>
      </div>
    </footer>
  );
}
