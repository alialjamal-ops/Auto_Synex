"use client";

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Clock,
  ExternalLink,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { AutoSynexLogo, BusinessLogo } from "@/components/brand/logo";
import { DemoBadge, LanguageToggle, ResetDemoButton, ThemeToggle } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessGate, useBusiness } from "@/data/repository-context";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { Dialog as RadixDialog } from "radix-ui";
import { BookingDetailsProvider } from "./booking-details";
import { CommandPalette } from "./command-palette";
import { CreateBookingDialog } from "./create-booking-dialog";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Lets any dashboard page open the "New booking" dialog (optionally prefilled). */
const NewBookingContext = createContext<(prefill?: { dateKey?: string; staffId?: string }) => void>(() => {});
export const useNewBooking = () => useContext(NewBookingContext);

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <BusinessGate fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </BusinessGate>
  );
}

function useNav() {
  const { t } = useI18n();
  const { business } = useBusiness();
  const base = `/${business.id}/dashboard`;
  const manage: NavItem[] = [
    { href: base, label: t.nav.overview, icon: LayoutGrid },
    { href: `${base}/calendar`, label: t.nav.calendar, icon: CalendarDays },
    { href: `${base}/appointments`, label: t.nav.appointments, icon: ClipboardList },
    { href: `${base}/customers`, label: t.nav.customers, icon: Users },
    { href: `${base}/analytics`, label: t.nav.analytics, icon: BarChart3 },
  ];
  const configure: NavItem[] = [
    { href: `${base}/services`, label: t.nav.services, icon: Sparkles },
    { href: `${base}/staff`, label: t.nav.staff, icon: UserRound },
    { href: `${base}/hours`, label: t.nav.hours, icon: Clock },
    { href: `${base}/settings`, label: t.nav.settings, icon: Settings2 },
  ];
  return { manage, configure, base };
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { manage, configure, base } = useNav();
  const isActive = (href: string) => (href === base ? pathname === base : pathname.startsWith(href));
  const render = (items: NavItem[]) =>
    items.map((item) => {
      const active = isActive(item.href);
      return (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active &&
                "bg-primary-soft text-primary-soft-foreground before:absolute before:inset-y-2 before:start-0 before:w-[3px] before:rounded-e-full before:bg-primary hover:bg-primary-soft hover:text-primary-soft-foreground rtl:before:rounded-e-none rtl:before:rounded-s-full",
            )}
          >
            <item.icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.9} aria-hidden />
            {item.label}
          </Link>
        </li>
      );
    });
  return (
    <nav className="grid gap-6" aria-label={t.nav.menu}>
      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{t.nav.groupManage}</p>
        <ul className="grid gap-0.5">{render(manage)}</ul>
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{t.nav.groupConfigure}</p>
        <ul className="grid gap-0.5">{render(configure)}</ul>
      </div>
    </nav>
  );
}

function SidebarFooter() {
  const { t } = useI18n();
  const { business } = useBusiness();
  return (
    <div className="grid gap-3">
      <Button asChild variant="secondary" size="sm" className="justify-between">
        <Link href={`/${business.id}/book`} target="_blank">
          {t.nav.viewPortal}
          <ExternalLink />
        </Link>
      </Button>
      <Link href="/" className="flex items-center justify-between rounded-lg px-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <AutoSynexLogo className="scale-90 ltr:origin-left rtl:origin-right" />
        <span>{t.common.demoHub}</span>
      </Link>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { t, tx, dir } = useI18n();
  const { business } = useBusiness();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newBooking, setNewBooking] = useState<{ open: boolean; prefill?: { dateKey?: string; staffId?: string } }>({ open: false });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const nav = useNav();

  return (
    <NewBookingContext.Provider value={(prefill) => setNewBooking({ open: true, prefill })}>
      <BookingDetailsProvider>
      <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-e bg-card/80 px-3 py-5 backdrop-blur lg:flex">
          <div className="flex items-center gap-3 px-2">
            <BusinessLogo monogram={business.monogram} hue={business.hue} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{tx(business.name)}</p>
              <p className="truncate text-xs text-muted-foreground">{tx(business.industryLabel)}</p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            <NavList />
          </div>
          <SidebarFooter />
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
            <RadixDialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <RadixDialog.Trigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label={t.nav.menu}>
                  <Menu />
                </Button>
              </RadixDialog.Trigger>
              <RadixDialog.Portal>
                <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
                <RadixDialog.Content
                  aria-describedby={undefined}
                  className={cn(
                    "fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 bg-card px-3 py-5 shadow-lg data-[state=open]:animate-in lg:hidden",
                    dir === "rtl" ? "right-0 data-[state=open]:slide-in-from-right" : "left-0 data-[state=open]:slide-in-from-left",
                  )}
                >
                  <RadixDialog.Title className="flex items-center gap-3 px-2">
                    <BusinessLogo monogram={business.monogram} hue={business.hue} size="sm" />
                    <span className="truncate text-sm font-semibold">{tx(business.name)}</span>
                  </RadixDialog.Title>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <NavList onNavigate={() => setMobileOpen(false)} />
                  </div>
                  <SidebarFooter />
                  <DialogClose className="sr-only">{t.common.close}</DialogClose>
                </RadixDialog.Content>
              </RadixDialog.Portal>
            </RadixDialog.Root>

            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <BusinessLogo monogram={business.monogram} hue={business.hue} size="sm" />
              <span className="truncate text-sm font-semibold">{tx(business.name)}</span>
            </div>
            <DemoBadge className="hidden lg:inline-flex" />
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="ms-2 hidden h-9 w-64 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-muted lg:flex"
            >
              <Search className="size-4" aria-hidden />
              <span className="flex-1 text-start">{t.palette.trigger}</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium" dir="ltr">⌘K</kbd>
            </button>

            <div className="ms-auto flex items-center gap-1">
              <div className="hidden items-center gap-1 md:flex">
                <ResetDemoButton />
                <LanguageToggle />
              </div>
              <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setPaletteOpen(true)} aria-label={t.palette.trigger}>
                <Search />
              </Button>
              <ThemeToggle />
              <Button size="sm" className="ms-1" onClick={() => setNewBooking({ open: true })}>
                <Plus />
                <span className="hidden sm:inline">{t.nav.newBooking}</span>
              </Button>
            </div>
          </header>

          {/* Compact controls on small screens. */}
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2 md:hidden">
            <DemoBadge />
            <div className="flex items-center">
              <ResetDemoButton showLabel={false} />
              <LanguageToggle />
            </div>
          </div>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <Dialog open={newBooking.open} onOpenChange={(open) => setNewBooking((s) => ({ ...s, open }))}>
        {newBooking.open ? (
          <CreateBookingDialog prefill={newBooking.prefill} onDone={() => setNewBooking({ open: false })} />
        ) : null}
      </Dialog>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} nav={[...nav.manage, ...nav.configure]} onNewBooking={() => setNewBooking({ open: true })} />
      </BookingDetailsProvider>
    </NewBookingContext.Provider>
  );
}

function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_1fr]">
      <div className="hidden border-e p-5 lg:grid lg:content-start lg:gap-3">
        <Skeleton className="h-9 w-40" />
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div>
        <div className="h-16 border-b" />
        <div className="grid gap-4 p-8 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
          <Skeleton className="h-72 rounded-xl sm:col-span-2 xl:col-span-4" />
        </div>
      </div>
    </div>
  );
}
