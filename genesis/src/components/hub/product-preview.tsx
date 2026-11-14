"use client";

import { CalendarCheck2, Check, CircleDollarSign, Clock, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AutoSynexMark } from "@/components/brand/logo";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Decorative product composition for the hero (aria-hidden, non-interactive).
 * Numbers are illustrative; the real, data-driven screens are one click away.
 */
export function ProductPreview() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const enter = (delay: number, y = 16) =>
    reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] as const } };
  const bars = [38, 54, 46, 70, 62, 84, 58, 76, 92, 66, 80, 72];
  const rows = [
    { time: "09:30", w: "w-24", tone: "bg-primary" },
    { time: "10:15", w: "w-20", tone: "bg-success" },
    { time: "11:00", w: "w-28", tone: "bg-warning" },
    { time: "12:30", w: "w-16", tone: "bg-primary" },
  ];

  return (
    <div aria-hidden className="pointer-events-none relative mx-auto w-full max-w-[620px] select-none">
      {/* Browser frame with a miniature dashboard */}
      <motion.div {...enter(0.1)} className="relative overflow-hidden rounded-2xl border bg-card shadow-[0_30px_80px_-30px_hsl(var(--shadow-color)/0.35)] ring-1 ring-black/[0.03]">
        <div className="flex items-center gap-1.5 border-b bg-subtle px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-danger/60" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/60" />
          <span className="mx-auto h-5 w-48 rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-[92px_1fr]">
          <div className="hidden flex-col gap-2 border-e bg-subtle/60 p-3 sm:flex">
            <AutoSynexMark className="mb-2 size-6" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={cn("h-2.5 rounded-full", i === 0 ? "w-14 bg-primary/70" : "w-12 bg-muted")} />
            ))}
          </div>
          <div className="col-span-2 grid gap-3 p-4 sm:col-span-1">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: CalendarCheck2, v: "28", c: "bg-primary-soft text-primary-soft-foreground" },
                { icon: Users, v: "104", c: "bg-success-soft text-success-foreground" },
                { icon: CircleDollarSign, v: "18.4k", c: "bg-warning-soft text-warning-foreground" },
              ].map((k, i) => (
                <div key={i} className="rounded-xl border p-2.5">
                  <span className={cn("flex size-6 items-center justify-center rounded-md", k.c)}>
                    <k.icon className="size-3.5" />
                  </span>
                  <p className="mt-2 text-lg font-semibold leading-none tabular">{k.v}</p>
                  <span className="mt-1.5 block h-1.5 w-12 rounded-full bg-muted" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-2.5">
              <div className="rounded-xl border p-3">
                <span className="block h-2 w-20 rounded-full bg-muted" />
                <div className="mt-3 flex h-24 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <motion.span
                      key={i}
                      initial={reduce ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 0.35 + i * 0.04 }}
                      style={{ height: `${h}%`, transformOrigin: "bottom" }}
                      className={cn("flex-1 rounded-t", i === 8 ? "bg-primary" : "bg-primary/25")}
                    />
                  ))}
                </div>
              </div>
              <div className="grid content-start gap-2 rounded-xl border p-3">
                {rows.map((r) => (
                  <div key={r.time} className="flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", r.tone)} />
                    <span className="text-[10px] font-medium tabular text-muted-foreground" dir="ltr">{r.time}</span>
                    <span className={cn("h-2 rounded-full bg-muted", r.w)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Phone with the booking slot picker */}
      <motion.div
        {...enter(0.35, 28)}
        className="absolute -bottom-10 start-[-6%] hidden w-[38%] max-w-[210px] rounded-[1.75rem] border-[5px] border-foreground/90 bg-card p-3 shadow-[0_24px_60px_-20px_hsl(var(--shadow-color)/0.45)] sm:block"
      >
        <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-foreground/15" />
        <p className="text-[11px] font-semibold">{t.booking.chooseTime}</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {["09:00", "09:30", "10:00", "11:00", "11:30", "12:00"].map((s, i) => (
            <span
              key={s}
              dir="ltr"
              className={cn(
                "rounded-md border py-1.5 text-center text-[10px] font-medium tabular",
                i === 2 && "border-primary bg-primary text-primary-foreground",
                i === 3 && "border-dashed text-muted-foreground/60 line-through",
              )}
            >
              {s}
            </span>
          ))}
        </div>
        <span className="mt-3 block rounded-lg bg-primary py-1.5 text-center text-[10px] font-semibold text-primary-foreground">{t.common.next}</span>
      </motion.div>

      {/* Confirmation toast */}
      <motion.div
        {...enter(0.6, -10)}
        className="absolute -top-5 end-[-4%] hidden items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 shadow-lg sm:flex"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-success-soft text-success-foreground">
          <Check className="size-4" strokeWidth={2.5} />
        </span>
        <span className="grid leading-tight">
          <span className="text-xs font-semibold">{t.booking.confirmedTitle}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="size-2.5" /> <span dir="ltr">GN-7KQ2PX · 10:00</span>
          </span>
        </span>
      </motion.div>
    </div>
  );
}
