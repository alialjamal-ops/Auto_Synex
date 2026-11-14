"use client";

import { LayoutDashboard, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { AutoSynexMark, BusinessLogo } from "@/components/brand/logo";
import { DemoBadge, LanguageToggle, ThemeToggle } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessGate, useBusiness } from "@/data/repository-context";
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
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{tx(business.tagline)}</p>
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

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
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
