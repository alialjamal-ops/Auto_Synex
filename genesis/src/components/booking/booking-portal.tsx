"use client";

import { BadgeCheck, CalendarSearch, Clock, Globe, LayoutDashboard, MapPin, Phone, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { toDateKey, weekdayOfKey } from "@/domain/time";
import { industryIcons } from "@/config/industry-icons";
import { hueStyle } from "@/lib/utils";
import Link from "next/link";
import { AutoSynexMark, BusinessLogo } from "@/components/brand/logo";
import { DemoBadge, LanguageToggle, ThemeToggle } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessGate, useBusiness, useRepository } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { BookingFlow } from "./booking-flow";

export function BookingPortal() {
  return (
    <PortalFrame>
      <BookingFlow />
    </PortalFrame>
  );
}

/** Shared public shell (header, business hero, footer) for customer-facing pages. */
export function PortalFrame({ children }: { children: React.ReactNode }) {
  return (
    <BusinessGate fallback={<PortalSkeleton />}>
      <PortalShell>{children}</PortalShell>
    </BusinessGate>
  );
}

function PortalShell({ children }: { children: React.ReactNode }) {
  const { t, tx } = useI18n();
  const { business } = useBusiness();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BusinessLogo monogram={business.monogram} hue={business.hue} />
            <Link href={`/${business.id}/book`} className="min-w-0 truncate text-[15px] font-semibold tracking-tight">
              {tx(business.name)}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DemoBadge className="hidden md:inline-flex" />
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href={`/${business.id}/manage`}>
                <CalendarSearch /> {t.manage.linkLabel}
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="ms-1">
              <Link href={`/${business.id}/dashboard`}>
                <LayoutDashboard />
                <span className="hidden sm:inline">{t.common.dashboard}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <BusinessHero />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> {tx(business.branches[0].address)}
            </span>
            <span className="inline-flex items-center gap-1.5" dir="ltr">
              <Phone className="size-3.5" aria-hidden /> {business.phone}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle className="sm:hidden" />
            <Link href={`/${business.id}/manage`} className="font-medium text-foreground underline-offset-4 hover:underline md:hidden">
              {t.manage.linkLabel}
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
              <AutoSynexMark className="size-6" />
              {t.booking.poweredBy}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BusinessHero() {
  const { t, tx } = useI18n();
  const { business, fmt } = useBusiness();
  const repo = useRepository();
  const [todayKey] = useState(() => toDateKey(repo.now(), business.timezone));
  const today = business.rules.closedDates.includes(todayKey) ? [] : business.openingHours[weekdayOfKey(todayKey)];
  const Icon = industryIcons[business.id];
  const reduce = useReducedMotion();
  const chips = [
    {
      icon: Clock,
      label: today.length ? t.booking.openToday(today.map((r) => `${r.start}–${r.end}`).join(", ")) : t.booking.closedToday,
      tone: today.length ? "text-success-foreground" : "text-danger-foreground",
    },
    { icon: MapPin, label: business.branches.map((b) => tx(b.name)).join(" · ") },
    { icon: business.rules.autoConfirm ? Zap : BadgeCheck, label: business.rules.autoConfirm ? t.booking.instantConfirmation : t.booking.approvalRequired },
    { icon: Globe, label: fmt.tzName(), ltr: true },
  ];
  return (
    <section style={hueStyle(business.hue)} className="lane relative overflow-hidden border-b">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[var(--lane-bg)] to-background" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-10 md:py-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 md:order-1"
        >
          <div className="flex items-center gap-3">
            <BusinessLogo monogram={business.monogram} hue={business.hue} size="lg" className="bg-card shadow-md" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--lane-fg)]">{t.booking.onlineBooking}</p>
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{tx(business.name)}</h1>
            </div>
          </div>
          <p className="mt-3 max-w-[52ch] text-pretty text-sm text-muted-foreground sm:text-base">{tx(business.tagline)}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-1.5 rounded-full border bg-card/85 px-3 py-1 text-xs font-medium shadow-xs backdrop-blur">
                <c.icon className={`size-3.5 ${c.tone ?? "text-muted-foreground"}`} aria-hidden />
                <span dir={c.ltr ? "ltr" : undefined}>{c.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative order-1 aspect-[16/7] overflow-hidden rounded-2xl border shadow-lg md:order-2 md:aspect-[16/10]"
        >
          <Image src={business.media.cover} alt="" fill priority sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
          <Icon aria-hidden className="absolute bottom-3 end-3 size-9 rounded-xl bg-card/90 p-2 text-[var(--lane-fg)] shadow-md backdrop-blur" />
        </motion.div>
      </div>
    </section>
  );
}

function PortalSkeleton() {
  return (
    <div className="min-h-dvh">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-[480px] rounded-xl" />
        <Skeleton className="hidden h-64 rounded-xl lg:block" />
      </div>
    </div>
  );
}
