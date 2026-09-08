'use client';

import { ImageReveal, Parallax } from '@/components/animations/image-reveal';
import { Marquee } from '@/components/animations/marquee';
import { Counter, Reveal, Stagger, StaggerItem } from '@/components/animations/motion-primitives';
import { Button, ButtonArrow } from '@/components/ui/button';
import { Eyebrow, SectionHeading, SectionShell, Surface } from '@/components/ui/primitives';
import { SmartImage } from '@/components/ui/smart-image';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import { getIcon } from '@/lib/icons';
import type {
  CtaSection,
  DemoConfig,
  FeatureGridSection,
  MarqueeSection,
  SplitSection,
  StatsSection,
} from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Split — story / about / chef / dining                               */
/* ------------------------------------------------------------------ */

export function Split({ section, config }: { section: SplitSection; config: DemoConfig }) {
  const { href } = useLocale();
  const imageFirst = section.variant === 'image-left';

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={cn('lg:col-span-6', imageFirst ? 'lg:order-2' : 'lg:order-1')}>
          <Reveal>
            <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
          </Reveal>

          {section.points ? (
            <Stagger className="mt-9 space-y-5" delay={0.1}>
              {section.points.map((point) => {
                const Icon = getIcon(point.icon);
                return (
                  <StaggerItem key={point.title} className="flex gap-4">
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand">
                      <Icon className="size-[18px]" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="font-display text-[17px] font-semibold">{point.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{point.text}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : null}

          {section.signature ? (
            <Reveal delay={0.2}>
              <p className="mt-9 border-l-2 border-[color:var(--brand)] pl-4 text-[13px] uppercase tracking-[0.14em] text-muted">
                {section.signature}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.25}>
            <Button href={href(`/${config.slug}/book`)} variant="outline" className="mt-9">
              {config.cta.label}
              <ButtonArrow />
            </Button>
          </Reveal>
        </div>

        <div className={cn('relative lg:col-span-6', imageFirst ? 'lg:order-1' : 'lg:order-2')}>
          <ImageReveal className="rounded-brand-lg" direction={imageFirst ? 'left' : 'up'}>
            <SmartImage
              asset={section.image}
              alt={section.title ?? ''}
              ratio="4/5"
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="rounded-brand-lg"
              zoomOnHover
            />
          </ImageReveal>

          {section.secondaryImage ? (
            <Reveal
              delay={0.25}
              className={cn(
                'absolute -bottom-8 hidden w-40 overflow-hidden rounded-brand-lg border-4 border-[color:var(--bg)] shadow-2xl sm:block lg:w-52',
                imageFirst ? '-right-4 lg:-right-10' : '-left-4 lg:-left-10',
              )}
            >
              <SmartImage asset={section.secondaryImage} alt="" ratio="1/1" sizes="210px" />
            </Reveal>
          ) : null}

          {section.stat ? (
            <Reveal
              delay={0.35}
              className={cn(
                'absolute top-6 rounded-brand-lg border border-line bg-surface/95 px-5 py-4 shadow-xl backdrop-blur-md',
                imageFirst ? 'left-4 lg:-left-8' : 'right-4 lg:-right-8',
              )}
            >
              <Counter value={section.stat.value} className="block font-display text-2xl" />
              <p className="mt-1 max-w-[8.5rem] text-[11px] leading-tight text-muted">
                {section.stat.label}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Feature grid — specialties / amenities / why-us / experiences       */
/* ------------------------------------------------------------------ */

export function FeatureGrid({ section }: { section: FeatureGridSection }) {
  if (section.variant === 'numbered') {
    return (
      <SectionShell id={section.id} tone={section.tone ?? 'contrast'}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
            </Reveal>
          </div>
          <Stagger className="lg:col-span-8">
            {section.items.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <StaggerItem
                  key={item.title}
                  className="group grid gap-4 border-t border-line py-7 last:border-b sm:grid-cols-[auto_1fr_2fr] sm:items-start sm:gap-8"
                >
                  <span className="font-display text-sm text-brand">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="flex items-center gap-3 font-display text-lg">
                    <Icon className="size-[18px] text-brand sm:hidden" strokeWidth={1.6} />
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{item.text}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </SectionShell>
    );
  }

  if (section.variant === 'minimal') {
    return (
      <SectionShell id={section.id} tone={section.tone ?? 'alt'}>
        <Reveal>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
        </Reveal>
        <Stagger className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {section.items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <StaggerItem key={item.title} className="flex gap-5">
                <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-line text-brand">
                  <Icon className="size-[18px]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </div>
              </StaggerItem>
            );
          })}
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
        {section.items.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <StaggerItem key={item.title}>
              <Surface
                interactive
                className="group h-full p-6 transition-colors hover:bg-[color:var(--surface-alt)]"
              >
                <span className="grid size-11 place-items-center rounded-brand bg-[color:var(--brand-soft)] text-brand transition-transform duration-500 group-hover:-translate-y-0.5">
                  <Icon className="size-[19px]" strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </Surface>
            </StaggerItem>
          );
        })}
      </Stagger>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Stats band                                                          */
/* ------------------------------------------------------------------ */

export function StatsBand({ section }: { section: StatsSection }) {
  return (
    <SectionShell id={section.id} tone={section.tone} className="py-14 sm:py-16 lg:py-20">
      <Stagger className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {section.items.map((item) => (
          <StaggerItem key={item.label} className="px-2 text-center lg:px-6">
            <Counter value={item.value} className="block font-display text-4xl sm:text-5xl" />
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">{item.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee band                                                        */
/* ------------------------------------------------------------------ */

export function MarqueeBand({ section }: { section: MarqueeSection }) {
  return (
    <div className="border-y border-line bg-surface py-5">
      <Marquee
        items={section.items}
        itemClassName="font-display text-[13px] uppercase tracking-[0.2em] text-muted"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CTA band                                                            */
/* ------------------------------------------------------------------ */

export function CtaBand({ section, config }: { section: CtaSection; config: DemoConfig }) {
  const { ui, href } = useLocale();

  return (
    <section id={section.id} className="relative scroll-mt-24 overflow-hidden bg-page py-20 sm:py-24">
      {section.image ? (
        <>
          <Parallax distance={30} className="absolute inset-0">
            <SmartImage
              asset={section.image}
              alt=""
              ratio="16/9"
              sizes="100vw"
              className="absolute inset-0 h-[112%] w-full"
              imageClassName="object-cover"
            />
          </Parallax>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)' }}
          />
        </>
      ) : null}

      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          {section.eyebrow ? (
            <Reveal>
              <Eyebrow className="justify-center">{section.eyebrow}</Eyebrow>
            </Reveal>
          ) : null}
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.6rem)]">{section.title}</h2>
          </Reveal>
          {section.text ? (
            <Reveal delay={0.12}>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
                {section.text}
              </p>
            </Reveal>
          ) : null}
          <Reveal delay={0.2} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={href(`/${config.slug}/book`)} size="lg">
              {config.cta.label}
              <ButtonArrow />
            </Button>
            <Button href="#contact" variant="outline" size="lg">
              {ui.common.contactUs}
            </Button>
          </Reveal>
          {section.note ? (
            <Reveal delay={0.28}>
              <p className="mt-6 text-xs text-muted">{section.note}</p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
