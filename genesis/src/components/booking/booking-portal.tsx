"use client";

import { BadgeCheck, Clock, Globe, LayoutDashboard, MapPin, Phone, Zap } from "lucide-react";
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
    <BusinessGate fallback={<PortalSkeleton />}>
      <PortalShell />
    </BusinessGate>
  );
}

function PortalShell() {
  const { t, tx } = useI18n();
  const { business } = useBusiness();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BusinessLogo monogram={business.monogram} hue={business.hue} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight">{tx(business.name)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DemoBadge className="hidden md:inline-flex" />
            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
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
        <BookingFlow />
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
          <div className="flex items-center gap-3">
            <LanguageToggle className="sm:hidden" />
            <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
              <AutoSynexMark className="size-5" />
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
      <div aria-hidden className="absolute inset-0 opacity-50 [background-image:radial-gradient(var(--lane-border)_0.6px,transparent_0.6px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <Icon aria-hidden strokeWidth={1.25} className="absolute -bottom-10 end-6 size-56 text-[var(--lane-fg)] opacity-[0.06]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:px-6 sm:py-10">
        <BusinessLogo monogram={business.monogram} hue={business.hue} size="lg" className="bg-card shadow-md" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--lane-fg)]">{t.booking.onlineBooking}</p>
          <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{tx(business.name)}</h1>
          <p className="mt-1.5 text-pretty text-sm text-muted-foreground sm:text-base">{tx(business.tagline)}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-1.5 rounded-full border bg-card/85 px-3 py-1 text-xs font-medium shadow-xs backdrop-blur">
                <c.icon className={`size-3.5 ${c.tone ?? "text-muted-foreground"}`} aria-hidden />
                <span dir={c.ltr ? "ltr" : undefined}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
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
