'use client';

import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Scroll entrances are driven by `useInView` + an `animate` prop rather than
 * `whileInView`. Under React StrictMode the `whileInView` observer can be torn
 * down and re-attached across the double mount and miss an element that is
 * already on screen, which leaves it permanently hidden. This hook re-observes
 * from an effect, so that cannot happen.
 */
export function useRevealed(margin = '-12% 0px -8% 0px', once = true) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once,
    margin: margin as `${number}% ${number}px ${number}% ${number}px`,
  });
  return { ref, inView };
}

/** House easing — slow out, no bounce. Used by every entrance in the project. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Reveal — the workhorse scroll entrance                              */
/* ------------------------------------------------------------------ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Travel distance in px. */
  y?: number;
  x?: number;
  duration?: number;
  once?: boolean;
  as?: ElementType;
  id?: string;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  x = 0,
  duration = 0.7,
  once = true,
  as = 'div',
  id,
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  const { ref, inView } = useRevealed('-12% 0px -8% 0px', once);

  return (
    <Component
      ref={ref}
      id={id}
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : undefined}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger group                                                       */
/* ------------------------------------------------------------------ */

const staggerParent = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: ElementType;
  id?: string;
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = 'div',
  id,
}: StaggerProps) {
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  const { ref, inView } = useRevealed('-10% 0px -6% 0px');

  return (
    <Component
      ref={ref}
      id={id}
      className={className}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const Component = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <Component className={className} variants={staggerChild}>
      {children}
    </Component>
  );
}

/* ------------------------------------------------------------------ */
/* TextReveal — masked line-by-line headline entrance                  */
/* ------------------------------------------------------------------ */

interface TextRevealProps {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: ElementType;
  /** Highlights the final line with the brand colour. */
  accentLast?: boolean;
}

export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  as = 'h1',
  accentLast = false,
}: TextRevealProps) {
  const reduced = useReducedMotion();
  const Component = as as ElementType;

  return (
    <Component className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn(
              'block',
              accentLast && index === lines.length - 1 && 'text-brand',
              lineClassName,
            )}
            initial={reduced ? { opacity: 0 } : { y: '105%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.95,
              delay: delay + index * 0.11,
              ease: EASE,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}

/* ------------------------------------------------------------------ */
/* Counter — animates to a target when scrolled into view              */
/* ------------------------------------------------------------------ */

interface CounterProps {
  /** Any string; digits animate, the rest is preserved ("4,000+", "4.9"). */
  value: string;
  className?: string;
  duration?: number;
}

export function Counter({ value, className, duration = 1.4 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  const decimals = value.includes('.') ? 1 : 0;
  const animatable = !reduced && !Number.isNaN(numeric);

  useEffect(() => {
    if (!inView || !animatable) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const linear = Math.min(1, (now - start) / (duration * 1000));
      setProgress(1 - Math.pow(1 - linear, 3));
      if (linear < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, animatable, duration]);

  const display = animatable
    ? value.replace(/[\d.,]+/, (numeric * progress).toFixed(decimals))
    : value;

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic — pointer-follow micro-interaction for primary CTAs        */
/* ------------------------------------------------------------------ */

export function Magnetic({
  children,
  className,
  strength = 0.22,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  return (
    <motion.span
      ref={ref}
      className={cn('inline-block', className)}
      animate={offset}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.4 }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== 'mouse') return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setOffset({
          x: (event.clientX - (rect.left + rect.width / 2)) * strength,
          y: (event.clientY - (rect.top + rect.height / 2)) * strength,
        });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.span>
  );
}
