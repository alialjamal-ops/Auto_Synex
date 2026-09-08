'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Mail, MapPin, Minus, Navigation, Phone, Plus, Quote } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { EASE, Reveal, Stagger, StaggerItem } from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { Rating, SectionHeading, SectionShell, Surface } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { useLocale } from '@/hooks/use-locale';
import { formatTime, weekdayLong } from '@/lib/date';
import type { ContactSection, DemoConfig, FaqSection, TestimonialsSection } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export function Testimonials({ section }: { section: TestimonialsSection }) {
  const { ui, rtl } = useLocale();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const move = (delta: number) => {
    setDirection(delta);
    setIndex((current) => (current + delta + section.items.length) % section.items.length);
  };

  if (section.variant === 'grid') {
    return (
      <SectionShell id={section.id} tone={section.tone}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2">
          {section.items.map((item) => (
            <StaggerItem key={item.name} className="h-full">
              <Surface interactive className="flex h-full flex-col p-7">
                <Quote className="size-6 text-brand" strokeWidth={1.4} />
                <blockquote className="mt-5 flex-1 font-display text-[19px] leading-snug">
                  “{item.quote}”
                </blockquote>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted">{item.role}</p>
                  </div>
                  <Rating value={item.rating} size={13} />
                </div>
              </Surface>
            </StaggerItem>
          ))}
        </Stagger>
      </SectionShell>
    );
  }

  const active = section.items[index]!;

  return (
    <SectionShell id={section.id} tone={section.tone ?? 'alt'}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
          </Reveal>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => move(-1)}
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-[color:var(--brand)] hover:text-brand"
              aria-label={ui.common.previousReview}
            >
              <ChevronLeft className={cn('size-4', rtl && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-[color:var(--brand)] hover:text-brand"
              aria-label={ui.common.nextReview}
            >
              <ChevronRight className={cn('size-4', rtl && 'rotate-180')} />
            </button>
            <span className="ml-2 text-[13px] text-muted">
              {String(index + 1).padStart(2, '0')} / {String(section.items.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="relative min-h-[19rem] sm:min-h-[15rem]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.figure
                key={active.name}
                initial={{ opacity: 0, x: direction * 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -36 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Rating value={active.rating} />
                <blockquote className="mt-6 font-display text-[clamp(1.35rem,2.6vw,2rem)] leading-snug">
                  “{active.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-6">
                  <span className="grid size-11 place-items-center rounded-full bg-[color:var(--brand-soft)] font-display text-sm text-brand">
                    {active.name
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .join('')}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{active.name}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{active.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex gap-1.5">
            {section.items.map((item, itemIndex) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setDirection(itemIndex > index ? 1 : -1);
                  setIndex(itemIndex);
                }}
                aria-label={`${ui.common.review} ${itemIndex + 1}`}
                className={cn(
                  'h-0.5 flex-1 transition-colors duration-500',
                  itemIndex === index ? 'bg-brand' : 'bg-line',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function Faq({ section }: { section: FaqSection }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <ul>
            {section.items.map((item, index) => {
              const expanded = open === index;
              return (
                <li key={item.q} className="border-b border-line first:border-t">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : index)}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={cn(
                          'font-display text-[17px] transition-colors sm:text-lg',
                          expanded && 'text-brand',
                        )}
                      >
                        {item.q}
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-brand">
                        {expanded ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">{item.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Contact + location                                                  */
/* ------------------------------------------------------------------ */

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function Contact({ section, config }: { section: ContactSection; config: DemoConfig }) {
  const { ui, locale } = useLocale();
  const query = encodeURIComponent(config.contact.addressLines.join(', '));
  // Client-only value: the server has no business knowing the visitor's day.
  const todayIndex = useSyncExternalStore(
    () => () => {},
    () => new Date().getDay(),
    () => -1,
  );

  return (
    <SectionShell id={section.id} tone={section.tone ?? 'alt'}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
          </Reveal>

          <Reveal delay={0.1} className="mt-9 space-y-6">
            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{ui.common.address}</p>
                <address className="mt-1.5 text-sm not-italic leading-relaxed">
                  {config.contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className="mt-2 text-[12px] text-muted">{config.contact.mapHint}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                <Phone className="size-4" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{ui.common.phone}</p>
                <a
                  href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
                  className="mt-1.5 block text-sm hover:text-brand"
                >
                  {config.contact.phone}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                <Mail className="size-4" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{ui.common.email}</p>
                <a
                  href={`mailto:${config.contact.email}`}
                  className="mt-1.5 block text-sm hover:text-brand"
                >
                  {config.contact.email}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-9 flex flex-wrap gap-3">
            <Button href={`/${config.slug}/book`}>
              {config.cta.label}
              <ButtonArrow />
            </Button>
            <Button
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              variant="outline"
              target="_blank"
              rel="noopener noreferrer"
              native
            >
              <Navigation className="size-4" />
              {ui.common.directions}
            </Button>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <MapPanel config={config} />
          </Reveal>

          <Reveal delay={0.18}>
            <Surface className="mt-4 p-6">
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-muted">{ui.common.openingHours}</h3>
              <ul className="mt-4 grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
                {DAY_ORDER.map((day) => {
                  const hours = config.hours[day];
                  const isToday = todayIndex === day;
                  return (
                    <li
                      key={day}
                      className={cn(
                        'flex justify-between gap-4 text-sm',
                        isToday && 'font-medium text-brand',
                      )}
                    >
                      <span>{weekdayLong(day, locale)}</span>
                      <span className={cn(!hours && 'text-muted')}>
                        {hours
                          ? `${formatTime(hours.open, locale)} – ${formatTime(hours.close, locale)}`
                          : ui.common.closed}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Surface>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}

/** Stylised location panel — deliberately abstract rather than a fake screenshot. */
function MapPanel({ config }: { config: DemoConfig }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-brand-lg border border-line bg-surface">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(115deg, transparent 42%, color-mix(in srgb, var(--brand) 22%, transparent) 42.4%, color-mix(in srgb, var(--brand) 22%, transparent) 43.6%, transparent 44%), linear-gradient(28deg, transparent 61%, var(--line) 61.3%, var(--line) 62.4%, transparent 62.7%)',
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="relative grid size-14 place-items-center">
          <span className="absolute inline-flex size-full animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-brand opacity-40" />
          <span className="relative grid size-11 place-items-center rounded-full bg-brand text-[color:var(--brand-contrast)]">
            <MapPin className="size-5" />
          </span>
        </span>
        <p className="mt-3 font-display text-sm">{config.businessName}</p>
      </div>
      <div className="absolute bottom-4 left-4 rounded-brand border border-line bg-[color:var(--bg)]/85 px-3 py-2 text-[11px] text-muted backdrop-blur">
        {config.contact.addressLines[0]}
      </div>
    </div>
  );
}
