import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ */
/* Eyebrow                                                             */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-brand',
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-current opacity-50" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Badge / pill                                                        */
/* ------------------------------------------------------------------ */

export function Badge({
  children,
  className,
  tone = 'brand',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'brand' | 'neutral' | 'outline';
}) {
  const tones = {
    brand: 'bg-[color:var(--brand-soft)] text-brand',
    neutral: 'bg-surface-alt text-muted',
    outline: 'border border-line text-muted',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Rating                                                              */
/* ------------------------------------------------------------------ */

export function Rating({
  value,
  className,
  showValue = false,
  size = 14,
}: {
  value: number;
  className?: string;
  showValue?: boolean;
  size?: number;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          style={{ width: size, height: size }}
          className={cn(
            index < Math.round(value) ? 'fill-current text-brand' : 'text-muted/40',
          )}
          strokeWidth={1.4}
        />
      ))}
      {showValue ? <span className="ml-1 text-xs text-muted">{value.toFixed(1)}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section shell — every marketing section uses this rhythm            */
/* ------------------------------------------------------------------ */

export type SectionTone = 'default' | 'alt' | 'contrast';

const toneClass: Record<SectionTone, string> = {
  default: 'bg-page text-ink',
  alt: 'bg-surface-alt text-ink',
  contrast: 'bg-surface text-ink',
};

export function SectionShell({
  id,
  tone = 'default',
  className,
  children,
  bleed = false,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-24 py-20 sm:py-24 lg:py-32',
        toneClass[tone],
        className,
      )}
    >
      {bleed ? children : <div className="container-x">{children}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = 'left',
  className,
  titleClassName,
  children,
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  align?: 'left' | 'center';
  className?: string;
  titleClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title ? (
        <h2
          className={cn(
            'font-display max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)]',
            titleClassName,
          )}
        >
          {title}
        </h2>
      ) : null}
      {text ? (
        <p className={cn('max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base')}>{text}</p>
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card surface                                                        */
/* ------------------------------------------------------------------ */

export function Surface({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-brand-lg border border-line bg-surface',
        interactive &&
          'transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-[color:var(--brand)]/40 hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Divider with a label                                                */
/* ------------------------------------------------------------------ */

export function LabelledRule({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
