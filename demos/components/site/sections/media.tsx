'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, MoveHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageReveal } from '@/components/animations/image-reveal';
import { EASE, Reveal, Stagger, StaggerItem } from '@/components/animations/motion-primitives';
import { SectionHeading, SectionShell } from '@/components/ui/primitives';
import { SmartImage } from '@/components/ui/smart-image';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/cn';
import type { BeforeAfterSection, GalleryItem, GallerySection } from '@/types/demo';

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export function Gallery({ section }: { section: GallerySection }) {
  const { ui, rtl } = useLocale();
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (delta: number) =>
      setActive((current) =>
        current === null ? null : (current + delta + section.items.length) % section.items.length,
      ),
    [section.items.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [active, close, step]);

  return (
    <>
      <SectionShell id={section.id} tone={section.tone} bleed={section.variant === 'strip'}>
        <div className={cn(section.variant === 'strip' && 'container-x')}>
          <Reveal>
            <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
          </Reveal>
        </div>

        {section.variant === 'masonry' ? (
          // A row-span grid rather than CSS columns: multi-column fragments
          // boxes, which breaks IntersectionObserver (and so scroll reveals).
          <div className="mt-12 grid auto-rows-[8.5rem] grid-cols-2 gap-4 sm:auto-rows-[10rem] lg:grid-cols-3 lg:auto-rows-[11rem]">
            {section.items.map((item, index) => (
              <GalleryTile
                key={item.caption}
                item={item}
                index={index}
                onOpen={setActive}
                fill
                className={cn(
                  item.span === 'tall'
                    ? 'row-span-3'
                    : item.span === 'wide'
                      ? 'col-span-2 row-span-2'
                      : 'row-span-2',
                )}
              />
            ))}
          </div>
        ) : null}

        {section.variant === 'grid' ? (
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item, index) => (
              <StaggerItem key={item.caption}>
                <GalleryTile item={{ ...item, span: 'normal' }} index={index} onOpen={setActive} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}

        {section.variant === 'strip' ? (
          <div className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-10">
            {section.items.map((item, index) => (
              <div
                key={item.caption}
                className="w-[78vw] shrink-0 snap-center sm:w-[46vw] lg:w-[32vw]"
              >
                <GalleryTile item={{ ...item, span: 'normal' }} index={index} onOpen={setActive} />
              </div>
            ))}
          </div>
        ) : null}
      </SectionShell>

      <AnimatePresence>
        {active !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={ui.common.galleryImage}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              aria-label={ui.common.closeGallery}
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-3 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 sm:left-6"
              aria-label={ui.common.previousImage}
            >
              <ChevronLeft className={cn('size-5', rtl && 'rotate-180')} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-3 grid size-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 sm:right-6"
              aria-label={ui.common.nextImage}
            >
              <ChevronRight className={cn('size-5', rtl && 'rotate-180')} />
            </button>

            <motion.figure
              key={active}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-4xl"
            >
              <SmartImage
                asset={section.items[active]!.image}
                alt={section.items[active]!.caption}
                ratio="3/2"
                sizes="90vw"
                className="rounded-brand"
              />
              <figcaption className="mt-4 text-center text-sm text-white/70">
                {section.items[active]!.caption}
                <span className="ml-3 text-white/40">
                  {active + 1} / {section.items.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function GalleryTile({
  item,
  index,
  onOpen,
  className,
  fill = false,
}: {
  item: GalleryItem;
  index: number;
  onOpen: (index: number) => void;
  className?: string;
  /** Stretch to the grid cell instead of using the item's own aspect ratio. */
  fill?: boolean;
}) {
  const ratio = item.span === 'tall' ? '3/4' : item.span === 'wide' ? '16/9' : '4/3';

  return (
    <ImageReveal
      className={cn('rounded-brand-lg', fill && 'h-full', className)}
      delay={(index % 3) * 0.06}
    >
      <button
        type="button"
        onClick={() => onOpen(index)}
        className={cn(
          'group relative block w-full overflow-hidden rounded-brand-lg text-left',
          fill && 'h-full',
        )}
        aria-label={`Open ${item.caption}`}
      >
        <SmartImage
          asset={item.image}
          alt={item.caption}
          ratio={ratio}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          zoomOnHover
          className={fill ? 'h-full' : undefined}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="text-sm text-white">{item.caption}</span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
            <Maximize2 className="size-3.5" />
          </span>
        </span>
      </button>
    </ImageReveal>
  );
}

/* ------------------------------------------------------------------ */
/* Before / after comparison                                           */
/* ------------------------------------------------------------------ */

export function BeforeAfter({ section }: { section: BeforeAfterSection }) {
  const { ui } = useLocale();
  const [index, setIndex] = useState(0);
  const item = section.items[index]!;

  return (
    <SectionShell id={section.id} tone={section.tone}>
      <Reveal>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} text={section.text} />
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-2">
        {section.items.map((entry, entryIndex) => (
          <button
            key={entry.title}
            type="button"
            onClick={() => setIndex(entryIndex)}
            className={cn(
              'rounded-full border px-4 py-2 text-[13px] transition-all duration-300',
              entryIndex === index
                ? 'border-transparent bg-brand text-[color:var(--brand-contrast)]'
                : 'border-line text-muted hover:border-[color:var(--brand)] hover:text-ink',
            )}
          >
            {entry.title}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8">
          <CompareSlider
            key={item.title}
            before={item.before}
            after={item.after}
            label={item.title}
          />
        </div>
        <div className="lg:col-span-4">
          <h3 className="font-display text-2xl">{item.title}</h3>
          <p className="mt-3 text-sm text-muted">{item.note}</p>
          <dl className="mt-7 space-y-4 border-t border-line pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{ui.common.treatment}</dt>
              <dd>{item.title.split('·')[0]?.trim()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{ui.common.timeline}</dt>
              <dd>{item.note}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{ui.common.caseLabel}</dt>
              <dd>
                {index + 1} / {section.items.length}
              </dd>
            </div>
          </dl>
          <p className="mt-6 flex items-center gap-2 text-[12px] text-muted">
            <MoveHorizontal className="size-4 text-brand" />
            {ui.booking.dragToCompare}
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function CompareSlider({
  before,
  after,
  label,
}: {
  before: GalleryItem['image'];
  after: GalleryItem['image'];
  label: string;
}) {
  const { ui } = useLocale();
  const [position, setPosition] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragging.current) return;
      updateFromClientX(event.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [updateFromClientX]);

  return (
    <div
      ref={ref}
      className="relative select-none overflow-hidden rounded-brand-lg"
      onPointerDown={(event) => {
        dragging.current = true;
        updateFromClientX(event.clientX);
      }}
    >
      <SmartImage asset={before} alt={`${label} — before`} ratio="3/2" sizes="(max-width: 1024px) 100vw, 62vw" />

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        aria-hidden
      >
        <SmartImage
          asset={after}
          alt={`${label} — after`}
          ratio="3/2"
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="h-full"
        />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white backdrop-blur">
        {ui.common.before}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--brand-contrast)]">
        {ui.common.after}
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_18px_rgba(0,0,0,0.35)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-white/15 backdrop-blur">
          <MoveHorizontal className="size-4 text-white" />
        </span>
      </div>

      <label className="sr-only" htmlFor={`compare-${label}`}>
        Comparison position
      </label>
      <input
        id={`compare-${label}`}
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-x-0 bottom-3 mx-auto w-[60%] cursor-ew-resize opacity-0"
      />
    </div>
  );
}
