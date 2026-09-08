'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Phone, Star } from 'lucide-react';
import { ImageReveal, KenBurns, Parallax } from '@/components/animations/image-reveal';
import { Counter, EASE, TextReveal } from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import type { DemoConfig, HeroSection } from '@/types/demo';

interface HeroProps {
  section: HeroSection;
  config: DemoConfig;
}

export function Hero({ section, config }: HeroProps) {
  switch (section.variant) {
    case 'centered':
      return <CenteredHero section={section} config={config} />;
    case 'editorial':
      return <EditorialHero section={section} config={config} />;
    case 'cinematic':
      return <CinematicHero section={section} config={config} />;
    case 'fullbleed':
      return <FullbleedHero section={section} config={config} />;
    default:
      return <SplitHero section={section} config={config} />;
  }
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Kicker({ children, className }: { children: string; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-line px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted',
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-brand" />
      {children}
    </motion.p>
  );
}

function HeroActions({ config, delay = 0.6 }: { config: DemoConfig; delay?: number }) {
  const { rtl, href } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <Button href={href(`/${config.slug}/book`)} size="lg">
        {config.cta.label}
        <ButtonArrow className={rtl ? 'rotate-180 group-hover/btn:-translate-x-1' : ''} />
      </Button>
      <Button href={`tel:${config.contact.phone.replace(/\s/g, '')}`} variant="outline" size="lg" native>
        <Phone className="size-4" />
        <span dir="ltr">{config.contact.phone}</span>
      </Button>
    </motion.div>
  );
}

function StatRow({
  stats,
  className,
  delay = 0.8,
}: {
  stats: readonly { value: string; label: string }[];
  className?: string;
  delay?: number;
}) {
  return (
    <motion.dl
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={cn('grid grid-cols-3 gap-6', className)}
    >
      {stats.map((stat) => (
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
  );
}

function BadgeRow({ badges, className }: { badges: readonly string[]; className?: string }) {
  return (
    <motion.ul
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted', className)}
    >
      {badges.map((badge) => (
        <li key={badge} className="flex items-center gap-2">
          <span aria-hidden className="size-1 rounded-full bg-brand" />
          {badge}
        </li>
      ))}
    </motion.ul>
  );
}

/** Soft brand glow used behind light-theme heroes. */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-40 right-[-10%] size-[42rem] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: 'var(--brand)' }}
      />
      <div
        className="absolute bottom-[-20%] left-[-15%] size-[34rem] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: 'var(--accent)' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Split — Vita Medical                                             */
/* ------------------------------------------------------------------ */

function SplitHero({ section, config }: HeroProps) {
  const { ui } = useLocale();

  return (
    <section className="relative overflow-hidden bg-page pt-[calc(var(--nav-height)+2.5rem)] pb-16 sm:pb-20 lg:pt-[calc(var(--nav-height)+4.5rem)] lg:pb-28">
      <Glow />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 xl:col-span-5">
          <Kicker>{section.kicker}</Kicker>
          <TextReveal
            lines={section.headline}
            delay={0.15}
            className="mt-6 font-display text-[clamp(2.6rem,6.6vw,4.6rem)]"
            accentLast
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base"
          >
            {section.lead}
          </motion.p>
          <div className="mt-8">
            <HeroActions config={config} />
          </div>
          {section.badges ? <BadgeRow badges={section.badges} className="mt-8" /> : null}
          {section.stats ? (
            <StatRow stats={section.stats} className="mt-10 max-w-md border-t border-line pt-8" />
          ) : null}
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7 xl:col-span-7">
          <ImageReveal className="rounded-brand-lg" delay={0.2}>
            <SmartImage
              asset={section.image}
              alt={`${config.businessName} interior`}
              ratio="4/5"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="rounded-brand-lg lg:aspect-[4/4.6]"
            />
          </ImageReveal>

          {section.secondaryImage ? (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
              className="absolute -bottom-8 -left-4 hidden w-44 overflow-hidden rounded-brand-lg border-4 border-[color:var(--bg)] shadow-2xl sm:block lg:-left-10 lg:w-56"
            >
              <SmartImage
                asset={section.secondaryImage}
                alt=""
                ratio="1/1"
                sizes="220px"
              />
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
            className="absolute right-4 top-6 rounded-brand-lg border border-line bg-surface/95 p-4 shadow-xl backdrop-blur-md lg:-right-6"
          >
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-current text-brand" />
              <span className="font-display text-lg font-semibold">4.9</span>
            </div>
            <p className="mt-1 max-w-[7rem] text-[11px] leading-tight text-muted">
              {ui.common.verifiedReviews}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Centered — Smileora Dental                                       */
/* ------------------------------------------------------------------ */

function CenteredHero({ section, config }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-page pt-[calc(var(--nav-height)+3rem)] lg:pt-[calc(var(--nav-height)+4rem)]">
      <Glow />
      <div className="container-x relative flex flex-col items-center text-center">
        <Kicker>{section.kicker}</Kicker>
        <TextReveal
          lines={section.headline}
          delay={0.15}
          className="mt-6 font-display text-[clamp(2.5rem,7.2vw,5.2rem)]"
          accentLast
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base"
        >
          {section.lead}
        </motion.p>
        <div className="mt-8">
          <HeroActions config={config} />
        </div>
        {section.badges ? (
          <BadgeRow badges={section.badges} className="mt-8 justify-center" />
        ) : null}
      </div>

      <div className="container-x relative mt-14 lg:mt-16">
        <ImageReveal className="rounded-brand-lg" delay={0.35}>
          <SmartImage
            asset={section.image}
            alt={`${config.businessName} clinic`}
            ratio="16/9"
            priority
            sizes="100vw"
            className="rounded-brand-lg"
          />
        </ImageReveal>

        {section.stats ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
            className="mx-auto -mt-10 w-[min(100%,58rem)] rounded-brand-lg border border-line bg-surface p-6 shadow-[0_30px_70px_-45px_rgba(0,0,0,0.4)] sm:-mt-14 sm:p-8"
          >
            <dl className="grid grid-cols-3 gap-4 divide-x divide-line text-center">
              {section.stats.map((stat) => (
                <div key={stat.label} className="px-2">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <Counter
                      value={stat.value}
                      className="block font-display text-2xl sm:text-4xl"
                    />
                    <span className="mt-1.5 block text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px]">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ) : null}
      </div>
      <div className="h-16 sm:h-20" />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Editorial — Lumé Beauty                                          */
/* ------------------------------------------------------------------ */

function EditorialHero({ section, config }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-page pt-[calc(var(--nav-height)+2rem)] pb-20 lg:pb-28">
      <div className="container-x relative">
        <div className="flex items-center justify-between gap-6 border-b border-line pb-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted">{section.kicker}</p>
          <p className="hidden text-[10px] uppercase tracking-[0.28em] text-muted sm:block">
            Est. 2016
          </p>
        </div>

        <div className="relative mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <TextReveal
              lines={section.headline}
              className="font-display text-[clamp(3.4rem,13vw,9rem)]"
            />
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
              className="mt-8 max-w-md text-[15px] leading-relaxed text-muted"
            >
              {section.lead}
            </motion.p>
            <div className="mt-9">
              <HeroActions config={config} />
            </div>
            {section.stats ? (
              <StatRow
                stats={section.stats}
                className="mt-12 max-w-sm border-t border-line pt-8"
              />
            ) : null}
          </div>

          <div className="relative lg:col-span-5">
            <ImageReveal delay={0.25} direction="down">
              <SmartImage
                asset={section.image}
                alt={`${config.businessName} studio`}
                ratio="3/4"
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </ImageReveal>
            {section.secondaryImage ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
                className="absolute -bottom-10 -left-6 hidden w-40 sm:block lg:-left-16 lg:w-48"
              >
                <SmartImage asset={section.secondaryImage} alt="" ratio="4/5" sizes="200px" />
              </motion.div>
            ) : null}
            <span
              aria-hidden
              className="absolute -left-14 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-[0.4em] text-muted xl:block"
            >
              Shoreditch · London
            </span>
          </div>
        </div>

        {section.badges ? (
          <BadgeRow badges={section.badges} className="mt-16 border-t border-line pt-6" />
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Cinematic — Noiré Hotel                                          */
/* ------------------------------------------------------------------ */

function CinematicHero({ section, config }: HeroProps) {
  const { ui } = useLocale();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-page">
      <div className="absolute inset-0">
        <KenBurns>
          <SmartImage
            asset={section.image}
            alt={`${config.businessName} exterior`}
            ratio="16/9"
            priority
            quality={88}
            sizes="100vw"
            className="absolute inset-0 h-full w-full grain"
            imageClassName="object-cover"
          />
        </KenBurns>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg)] via-[color:var(--bg)]/78 to-[color:var(--bg)]/55"
        />
      </div>

      <div className="container-x relative pb-24 pt-[calc(var(--nav-height)+6rem)] sm:pb-28">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8 h-px w-24 bg-brand"
        />
        <p className="text-[11px] uppercase tracking-[0.34em] text-brand">{section.kicker}</p>
        <TextReveal
          lines={section.headline}
          delay={0.25}
          className="mt-6 max-w-4xl font-display text-[clamp(2.9rem,8.4vw,6.4rem)]"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base"
        >
          {section.lead}
        </motion.p>

        <div className="mt-9">
          <HeroActions config={config} delay={0.8} />
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-line pt-8 lg:flex-row lg:items-end lg:justify-between">
          {section.stats ? <StatRow stats={section.stats} className="max-w-sm" delay={1} /> : null}
          {section.badges ? (
            <BadgeRow badges={section.badges} className="lg:justify-end" />
          ) : null}
        </div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-6 right-5 hidden size-12 place-items-center rounded-full border border-line text-muted transition-colors hover:border-[color:var(--brand)] hover:text-brand lg:grid"
        aria-label={ui.common.scrollToContent}
      >
        <ArrowDown className="size-4 animate-bounce" />
      </motion.a>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Fullbleed — Ember & Stone                                        */
/* ------------------------------------------------------------------ */

function FullbleedHero({ section, config }: HeroProps) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-page">
      <div className="absolute inset-0">
        <Parallax distance={40} className="h-full">
          <SmartImage
            asset={section.image}
            alt={`${config.businessName} dining room`}
            ratio="16/9"
            priority
            quality={88}
            sizes="100vw"
            className="absolute inset-0 h-[112%] w-full grain"
            imageClassName="object-cover"
          />
        </Parallax>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--bg) 4%, color-mix(in srgb, var(--bg) 72%, transparent) 42%, color-mix(in srgb, var(--bg) 46%, transparent) 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-40"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 100%, var(--brand-soft), transparent 70%)',
          }}
        />
      </div>

      <div className="container-x relative pb-20 pt-[calc(var(--nav-height)+6rem)] sm:pb-24">
        <p className="text-[11px] uppercase tracking-[0.32em] text-brand">{section.kicker}</p>
        <TextReveal
          lines={section.headline}
          delay={0.2}
          className="mt-6 font-display text-[clamp(3rem,11vw,8rem)]"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-7 max-w-lg text-[15px] leading-relaxed text-muted sm:text-lg"
        >
          {section.lead}
        </motion.p>

        <div className="mt-9">
          <HeroActions config={config} delay={0.8} />
        </div>
      </div>

      {section.stats ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: EASE }}
          className="relative border-t border-line bg-[color:var(--bg)]/80 backdrop-blur-sm"
        >
          <div className="container-x grid grid-cols-3 divide-x divide-line py-6">
            {section.stats.map((stat) => (
              <div key={stat.label} className="px-3 text-center sm:px-6">
                <Counter value={stat.value} className="block font-display text-2xl sm:text-3xl" />
                <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}
