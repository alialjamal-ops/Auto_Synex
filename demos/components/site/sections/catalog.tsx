'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ImageReveal } from '@/components/animations/image-reveal';
import { EASE, Reveal, Stagger, StaggerItem } from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { Badge, Rating, SectionHeading, SectionShell, Surface } from '@/components/ui/primitives';
import { SmartImage } from '@/components/ui/smart-image';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import { formatDuration, formatMoney } from '@/lib/format';
import { getIcon } from '@/lib/icons';
import type { Ui } from '@/config/i18n';
import type {
  DemoConfig,
  MembershipSection,
  MenuSection,
  ServiceItem,
  ServicesSection,
  StaffSection,
} from '@/types/demo';

function selectServices(config: DemoConfig, include?: readonly string[]): readonly ServiceItem[] {
  if (!include?.length) return config.services;
  return include
    .map((id) => config.services.find((service) => service.id === id))
    .filter((service): service is ServiceItem => Boolean(service));
}

function priceLabel(service: ServiceItem, config: DemoConfig, ui: Ui): string {
  if (service.price === 0) return ui.common.noDeposit;
  const value = formatMoney(service.price, config.booking.currencySymbol);
  const suffix = config.booking.mode === 'stay' ? ui.common.perNight : '';
  return `${service.priceFrom ? `${ui.common.from} ` : ''}${value}${suffix}`;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export function Services({ section, config }: { section: ServicesSection; config: DemoConfig }) {
  const { ui, locale, href } = useLocale();
  const services = selectServices(config, section.include);
  const bookHref = href(`/${config.slug}/book`);

  if (section.variant === 'rooms') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <div className="mt-12 space-y-6">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <Surface
                interactive
                className="group grid overflow-hidden lg:grid-cols-12"
              >
                <div className={cn('lg:col-span-5', index % 2 === 1 && 'lg:order-2')}>
                  {service.image ? (
                    <SmartImage
                      asset={service.image}
                      alt={service.name}
                      ratio="4/3"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="h-full lg:aspect-auto lg:h-full"
                      zoomOnHover
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center gap-5 p-7 lg:col-span-7 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    {service.badge ? <Badge>{service.badge}</Badge> : null}
                    <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                      {service.highlights?.[0]}
                    </span>
                  </div>
                  <h3 className="font-display text-[clamp(1.5rem,3vw,2.2rem)]">{service.name}</h3>
                  <p className="max-w-lg text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
                    {service.highlights?.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2">
                        <Check className="size-3.5 text-brand" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                    <p className="font-display text-xl">
                      {priceLabel(service, config, ui)}
                      <span className="mx-2 text-xs font-normal text-muted">{ui.common.inclBreakfast}</span>
                    </p>
                    <Button href={`${bookHref}?service=${service.id}`} size="sm">
                      {config.cta.short}
                      <ButtonArrow />
                    </Button>
                  </div>
                </div>
              </Surface>
            </Reveal>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (section.variant === 'list') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <Stagger className="mt-10">
          {services.map((service, index) => (
            <StaggerItem key={service.id}>
              <Link
                href={`${bookHref}?service=${service.id}`}
                className="group grid items-baseline gap-2 border-t border-line py-6 transition-colors last:border-b hover:bg-[color:var(--brand-soft)] sm:grid-cols-12 sm:gap-6 sm:px-2"
              >
                <span className="font-display text-xs text-brand sm:col-span-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl transition-transform duration-500 group-hover:translate-x-1 sm:col-span-4">
                  {service.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted sm:col-span-4">
                  {service.description}
                </p>
                <span className="text-[13px] text-muted sm:col-span-1">
                  {formatDuration(service.durationMin, locale)}
                </span>
                <span className="flex items-center justify-between gap-3 font-display text-lg sm:col-span-2 sm:justify-end">
                  {priceLabel(service, config, ui)}
                  <ArrowUpRight className="size-4 text-brand transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </SectionShell>
    );
  }

  if (section.variant === 'editorial') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <Link href={`${bookHref}?service=${service.id}`} className="group block">
                <div className="relative overflow-hidden rounded-brand-lg">
                  {service.image ? (
                    <SmartImage
                      asset={service.image}
                      alt={service.name}
                      ratio="4/3"
                      sizes="(max-width: 640px) 100vw, 44vw"
                      overlay="bottom"
                      zoomOnHover
                    />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-6">
                    <div>
                      {service.badge ? (
                        <span className="mb-3 inline-block rounded-full bg-brand px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-contrast)]">
                          {service.badge}
                        </span>
                      ) : null}
                      <h3 className="font-display text-2xl text-white">{service.name}</h3>
                      <p className="mt-1 text-[13px] text-white/70">
                        {formatDuration(service.durationMin, locale)} · {priceLabel(service, config, ui)}
                      </p>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 text-white transition-all duration-500 group-hover:bg-brand group-hover:text-[color:var(--brand-contrast)]">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{service.description}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <Reveal>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
      </Reveal>
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = getIcon(service.icon);
          return (
            <StaggerItem key={service.id} className="h-full">
              <Surface interactive className="group flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                    <Icon className="size-[19px]" strokeWidth={1.6} />
                  </span>
                  {service.badge ? <Badge>{service.badge}</Badge> : null}
                </div>
                <h3 className="mt-5 font-display text-[17px] font-semibold">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
                {service.highlights ? (
                  <ul className="mt-4 space-y-1.5">
                    {service.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-[13px] text-muted">
                        <Check className="size-3.5 shrink-0 text-brand" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                  <span className="flex items-center gap-1.5 text-[12px] text-muted">
                    <Clock className="size-3.5" />
                    {formatDuration(service.durationMin, locale)}
                  </span>
                  {section.showPrice !== false ? (
                    <span className="font-display text-[15px] font-semibold">
                      {priceLabel(service, config, ui)}
                    </span>
                  ) : null}
                </div>
                <Link
                  href={`${bookHref}?service=${service.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand"
                >
                  {ui.common.bookThis}
                  <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Surface>
            </StaggerItem>
          );
        })}
      </Stagger>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */

export function Staff({ section, config }: { section: StaffSection; config: DemoConfig }) {
  const { ui, href } = useLocale();
  if (section.variant === 'editorial') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <div className="mt-12">
          {config.staff.map((member, index) => (
            <Reveal key={member.id} delay={index * 0.04}>
              <div className="group grid items-center gap-6 border-t border-line py-8 last:border-b sm:grid-cols-12">
                <div className="sm:col-span-3 lg:col-span-2">
                  <ImageReveal>
                    <SmartImage
                      asset={member.image}
                      alt={member.name}
                      ratio="1/1"
                      sizes="200px"
                      className="w-32 sm:w-full"
                      zoomOnHover
                    />
                  </ImageReveal>
                </div>
                <div className="sm:col-span-4 lg:col-span-3">
                  <h3 className="font-display text-2xl">{member.name}</h3>
                  <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-brand">
                    {member.role}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted sm:col-span-5 lg:col-span-5">
                  {member.bio}
                </p>
                <div className="sm:col-span-12 lg:col-span-2 lg:text-right">
                  <Button href={href(`/${config.slug}/book?staff=${member.id}`)} variant="outline" size="sm">
                    {ui.common.book} {member.name.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (section.variant === 'portrait') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <Stagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {config.staff.map((member) => (
            <StaggerItem key={member.id} className="group text-center">
              <div className="relative mx-auto w-full max-w-[19rem] overflow-hidden rounded-full">
                <SmartImage
                  asset={member.image}
                  alt={member.name}
                  ratio="1/1"
                  sizes="(max-width: 640px) 80vw, 300px"
                  zoomOnHover
                />
              </div>
              <h3 className="mt-6 font-display text-xl">{member.name}</h3>
              <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-brand">
                {member.role}
              </p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted">{member.bio}</p>
              {member.rating ? (
                <Rating value={member.rating} className="mt-4 justify-center" showValue />
              ) : null}
              <Button
                href={href(`/${config.slug}/book?staff=${member.id}`)}
                variant="ghost"
                size="sm"
                className="mt-4"
              >
                {ui.common.book} {member.name.split(' ').slice(-1)[0]}
                <ButtonArrow />
              </Button>
            </StaggerItem>
          ))}
        </Stagger>
      </SectionShell>
    );
  }

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <Reveal>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
      </Reveal>
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {config.staff.map((member) => (
          <StaggerItem key={member.id} className="h-full">
            <Surface interactive className="group flex h-full flex-col overflow-hidden">
              <div className="relative">
                <SmartImage
                  asset={member.image}
                  alt={member.name}
                  ratio="4/5"
                  sizes="(max-width: 640px) 100vw, 300px"
                  zoomOnHover
                />
                {member.experienceYears ? (
                  <span className="absolute left-4 top-4 rounded-full bg-[color:var(--bg)]/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink backdrop-blur">
                    {member.experienceYears} yrs
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-[17px] font-semibold">{member.name}</h3>
                <p className="mt-1 text-[12px] text-brand">{member.role}</p>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted">{member.bio}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  {member.rating ? <Rating value={member.rating} size={13} showValue /> : <span />}
                  <Link
                    href={href(`/${config.slug}/book?staff=${member.id}`)}
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-brand"
                  >
                    {ui.common.book}
                    <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </Surface>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Menu — tabbed price list                                            */
/* ------------------------------------------------------------------ */

export function MenuBoard({ section, config }: { section: MenuSection; config: DemoConfig }) {
  const { ui } = useLocale();
  const [active, setActive] = useState(section.groups[0]?.id ?? '');
  const group = section.groups.find((item) => item.id === active) ?? section.groups[0];

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <Reveal>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label={ui.common.menuSections}>
        {section.groups.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            onClick={() => setActive(item.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-[13px] transition-all duration-300',
              item.id === active
                ? 'border-transparent bg-brand text-[color:var(--brand-contrast)]'
                : 'border-line text-muted hover:border-[color:var(--brand)] hover:text-ink',
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={group?.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-8"
        >
          {group?.note ? (
            <p className="mb-6 text-[13px] italic text-muted">{group.note}</p>
          ) : null}
          <ul className="grid gap-x-14 gap-y-1 lg:grid-cols-2">
            {group?.items.map((item) => (
              <li
                key={item.name}
                className="group border-b border-line/70 py-5 last:border-0 lg:last:border-b"
              >
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-[17px] transition-colors group-hover:text-brand">
                    {item.name}
                  </h3>
                  <span aria-hidden className="h-px flex-1 translate-y-[-2px] bg-line" />
                  <span className="font-display text-[17px]">
                    {formatMoney(item.price, config.booking.currencySymbol)}
                  </span>
                </div>
                <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted">
                  {item.description}
                </p>
                {item.tags?.length ? (
                  <div className="mt-2 flex gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Membership tiers                                                    */
/* ------------------------------------------------------------------ */

export function Membership({
  section,
  config,
}: {
  section: MembershipSection;
  config: DemoConfig;
}) {
  const { ui, href } = useLocale();

  return (
    <SectionShell id={section.id} tone={section.tone ?? 'contrast'}>
      <Reveal>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          text={section.text}
          align="center"
          className="mx-auto items-center"
        />
      </Reveal>
      <Stagger className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
        {section.tiers.map((tier) => (
          <StaggerItem key={tier.name} className="h-full">
            <div
              className={cn(
                'relative flex h-full flex-col rounded-brand-lg border p-7 transition-transform duration-500 hover:-translate-y-1',
                tier.featured
                  ? 'border-[color:var(--brand)] bg-[color:var(--brand-soft)]'
                  : 'border-line bg-surface',
              )}
            >
              {tier.featured ? (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-contrast)]">
                  {ui.common.mostChosen}
                </span>
              ) : null}
              <h3 className="font-display text-xl">{tier.name}</h3>
              <p className="mt-1.5 text-[13px] text-muted">{tier.summary}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl">
                  {formatMoney(tier.price, config.booking.currencySymbol)}
                </span>
                <span className="text-[13px] text-muted">/ {tier.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                href={href(`/${config.slug}/book`)}
                variant={tier.featured ? 'primary' : 'outline'}
                className="mt-7"
                fullWidth
              >
                {ui.common.join} {tier.name}
              </Button>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}
