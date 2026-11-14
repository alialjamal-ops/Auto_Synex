"use client";

import { ArrowLeftRight } from "lucide-react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** Fades content up as it enters the viewport (storytelling order, once). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to a value once visible; writes to the DOM directly (no re-render per frame). */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className={cn("tabular", className)}>
      {reduce ? value : 0}
    </span>
  );
}

/**
 * Real product screenshots in a device frame. The frame settles from a slight
 * tilt to flat as it scrolls into place, adding depth without hijacking scroll.
 */
export function HeroVisual({ alt, phoneAlt }: { alt: string; phoneAlt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const tilt = useSpring(useTransform(scrollYProgress, [0, 0.45], [10, 0]), { stiffness: 120, damping: 24 });
  const phoneY = useTransform(scrollYProgress, [0.2, 0.8], [30, -30]);

  return (
    <div ref={ref} className="relative [perspective:1600px]">
      <motion.div
        style={reduce ? undefined : { rotateX: tilt }}
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
        className="origin-bottom overflow-hidden rounded-xl border bg-card p-1.5 shadow-[0_40px_100px_-40px_hsl(var(--shadow-color)/0.45)] sm:rounded-2xl"
      >
        <div className="flex items-center gap-1.5 px-2.5 pb-2 pt-1">
          <span className="size-2 rounded-full bg-danger/50" />
          <span className="size-2 rounded-full bg-warning/60" />
          <span className="size-2 rounded-full bg-success/50" />
        </div>
        <Image src="/media/product/dashboard-light.webp" alt={alt} width={1600} height={1000} priority sizes="(min-width: 1024px) 640px, 100vw" className="rounded-lg dark:hidden" />
        <Image src="/media/product/dashboard-dark.webp" alt={alt} width={1600} height={1000} sizes="(min-width: 1024px) 640px, 100vw" className="hidden rounded-lg dark:block" />
      </motion.div>
      <motion.div
        style={reduce ? undefined : { y: phoneY }}
        initial={reduce ? false : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease }}
        className="absolute -bottom-12 -start-4 hidden w-[30%] max-w-[190px] overflow-hidden rounded-[1.6rem] border-[6px] border-foreground/90 bg-card shadow-[0_30px_60px_-20px_hsl(var(--shadow-color)/0.5)] sm:block lg:-start-10"
      >
        <Image src="/media/product/phone-light.webp" alt={phoneAlt} width={560} height={953} sizes="190px" className="dark:hidden" />
        <Image src="/media/product/phone-dark.webp" alt={phoneAlt} width={560} height={953} sizes="190px" className="hidden dark:block" />
      </motion.div>
    </div>
  );
}

/** Drag/keyboard slider revealing the dark-mode screenshot over the light one. */
export function ThemeCompare({ label }: { label: string }) {
  const pos = useMotionValue(50);
  const clip = useTransform(pos, (p) => `inset(0 ${100 - p}% 0 0)`);
  const handle = useTransform(pos, (p) => `${p}%`);
  return (
    <div className="relative overflow-hidden rounded-lg border" dir="ltr">
      <Image src="/media/product/dashboard-light.webp" alt="" width={1600} height={1000} sizes="(min-width: 1024px) 420px, 100vw" className="block" />
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        <Image src="/media/product/dashboard-dark.webp" alt="" width={1600} height={1000} sizes="(min-width: 1024px) 420px, 100vw" className="block" />
      </motion.div>
      <motion.div style={{ left: handle }} className="pointer-events-none absolute inset-y-0 -ms-px w-0.5 bg-primary">
        <span className="absolute top-1/2 -ms-3.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-card text-[10px] font-bold text-primary shadow-md">
          <ArrowLeftRight className="size-3.5" strokeWidth={2.5} />
        </span>
      </motion.div>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        aria-label={label}
        onChange={(e) => pos.set(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
