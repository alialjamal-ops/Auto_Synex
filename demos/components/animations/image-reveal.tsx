'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EASE, useRevealed } from './motion-primitives';

/**
 * Curtain reveal: the photo scales down from 1.14 behind a mask that wipes up.
 * Used for every editorial image on the demo sites.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left';
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useRevealed('-10% 0px -10% 0px');

  const hidden =
    direction === 'left'
      ? { clipPath: 'inset(0 100% 0 0)' }
      : direction === 'down'
        ? { clipPath: 'inset(0 0 100% 0)' }
        : { clipPath: 'inset(100% 0 0 0)' };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('overflow-hidden', className)}
      initial={hidden}
      animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      <motion.div
        initial={{ scale: 1.14 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: 1.4, delay, ease: EASE }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Scroll-linked vertical drift. Deliberately small — parallax reads as premium
 * only when you barely notice it.
 */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Slow cinematic push-in for full-screen hero photography. */
export function KenBurns({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn('h-full w-full', className)}
      initial={reduced ? undefined : { scale: 1.12 }}
      animate={reduced ? undefined : { scale: 1 }}
      transition={{ duration: 12, ease: 'linear' }}
    >
      {children}
    </motion.div>
  );
}
