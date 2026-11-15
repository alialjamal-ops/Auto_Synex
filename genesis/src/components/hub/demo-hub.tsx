"use client";

import { ArrowRight, CalendarDays, Languages, LayoutDashboard, MonitorSmartphone, SunMoon, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { AutoSynexLogo } from "@/components/brand/logo";
import { LanguageToggle, ThemeToggle } from "@/components/controls";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { industryIcons } from "@/config/industry-icons";
import { listDemoTenants, type TenantSummary } from "@/data/tenant-directory";
import { useI18n } from "@/i18n/provider";
import { cn, hueStyle } from "@/lib/utils";
import { CountUp, HeroVisual, Reveal, ThemeCompare } from "./motion-bits";

const tenants = listDemoTenants();
const ease = [0.16, 1, 0.3, 1] as const;

export function DemoHub() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const enter = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } });
  const stats = [
    { value: tenants.length, label: t.hub.statIndustries },
    { value: tenants.reduce((n, x) => n + x.serviceCount, 0), label: t.hub.statServices },
    { value: tenants.reduce((n, x) => n + x.staffCount, 0), label: t.hub.statTeam },
    { value: 2, label: t.hub.statLanguages },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] bg-[radial-gradient(60%_55%_at_75%_15%,color-mix(in_oklch,var(--primary)_11%,transparent),transparent_70%)]" />

      <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AutoSynexLogo />
            <span className="hidden rounded-full border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex" dir="ltr">
              {t.common.edition} {t.common.version}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {/* Hero: asymmetric split, real product screenshots. */}
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:pb-32 lg:pt-20">
          <div className="text-center lg:text-start">
            <motion.p {...enter(0)} className="text-sm font-medium text-primary">
              {t.hub.eyebrow}
            </motion.p>
            <motion.h1 {...enter(0.06)} className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.15rem]">
              {t.hub.heroTitle}
            </motion.h1>
            <motion.p {...enter(0.12)} className="mx-auto mt-5 max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              {t.hub.heroSubtitle}
            </motion.p>
            <motion.div {...enter(0.18)} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="group h-12 px-6 shadow-md shadow-primary/20 active:scale-[0.98]">
                <Link href="/clinic/book">
                  {t.hub.ctaPrimary}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 px-6 active:scale-[0.98]">
                <Link href="/clinic/dashboard">
                  <LayoutDashboard />
                  {t.hub.ctaSecondary}
                </Link>
              </Button>
            </motion.div>
          </div>
          <div className="px-3 sm:px-8 lg:px-0">
            <HeroVisual alt={`${t.common.dashboard}, ${t.hub.previewLabel}`} phoneAlt={`${t.common.bookingPortal}, ${t.hub.previewLabel}`} />
          </div>
        </section>

        {/* Key figures (derived from the demo configuration). */}
        <section className="border-y bg-card/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  <CountUp value={s.value} />
                </dd>
                <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Industries: photo cards. */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal className="mb-12 max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.hub.chooseTitle}</h2>
            <p className="mt-3 text-pretty text-lg text-muted-foreground">{t.hub.chooseSubtitle}</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {tenants.map((tenant, i) => (
              <Reveal key={tenant.id} delay={0.07 * i} className="h-full">
                <IndustryCard tenant={tenant} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Bento: real screens, five cells for five capabilities. */}
        <section className="bg-subtle/70 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.hub.bentoTitle}</h2>
              <p className="mt-3 text-pretty text-lg text-muted-foreground">{t.hub.bentoSubtitle}</p>
            </Reveal>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
              <BentoCell className="md:col-span-4" icon={CalendarDays} title={t.hub.calendarTitle} desc={t.hub.calendarDesc} delay={0}>
                <div className="mt-6 overflow-hidden rounded-t-lg border border-b-0 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
                  <Image src="/media/product/calendar-light.webp" alt="" width={1600} height={1000} sizes="(min-width: 768px) 760px, 100vw" className="transition-transform duration-700 group-hover:scale-[1.02] dark:hidden" />
                  <Image src="/media/product/calendar-dark.webp" alt="" width={1600} height={1000} sizes="(min-width: 768px) 760px, 100vw" className="hidden transition-transform duration-700 group-hover:scale-[1.02] dark:block" />
                </div>
              </BentoCell>
              <BentoCell className="md:col-span-2" icon={MonitorSmartphone} title={t.hub.bookingTitle} desc={t.hub.bookingDesc} delay={0.08} tinted>
                <div className="mx-auto mt-6 w-[62%] max-w-[220px] overflow-hidden rounded-t-[1.6rem] border-[6px] border-b-0 border-foreground/90 transition-transform duration-700 group-hover:-translate-y-1">
                  <Image src="/media/product/phone-light.webp" alt="" width={560} height={953} sizes="220px" className="dark:hidden" />
                  <Image src="/media/product/phone-dark.webp" alt="" width={560} height={953} sizes="220px" className="hidden dark:block" />
                </div>
              </BentoCell>
              <BentoCell className="md:col-span-2" icon={Languages} title={t.hub.bilingualTitle} desc={t.hub.bilingualDesc} delay={0}>
                <div className="mt-6 overflow-hidden rounded-lg border" dir="rtl">
                  <Image src="/media/product/arabic-light.webp" alt="" width={1600} height={1000} sizes="(min-width: 768px) 380px, 100vw" className="origin-top-right scale-[1.6] transition-transform duration-700 group-hover:scale-[1.7] dark:hidden" />
                  <Image src="/media/product/arabic-dark.webp" alt="" width={1600} height={1000} sizes="(min-width: 768px) 380px, 100vw" className="hidden origin-top-right scale-[1.6] transition-transform duration-700 group-hover:scale-[1.7] dark:block" />
                </div>
              </BentoCell>
              <BentoCell className="md:col-span-2" icon={SunMoon} title={t.hub.themeTitle} desc={t.hub.themeDesc} delay={0.08}>
                <div className="mt-6">
                  <ThemeCompare label={t.hub.compareLabel} />
                </div>
              </BentoCell>
              <BentoCell className="md:col-span-2" icon={Users} title={t.hub.teamTitle} desc={t.hub.teamDesc} delay={0.16} tinted>
                <TeamStack />
              </BentoCell>
            </div>
          </div>
        </section>

        {/* Closing call to action over photography. */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-20">
              <Image src="/media/clinic/cover.webp" alt="" fill sizes="(min-width: 1280px) 1240px, 100vw" className="-z-20 object-cover object-[70%_30%]" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.2_0.04_262/0.92)] via-[oklch(0.2_0.04_262/0.75)] to-[oklch(0.2_0.04_262/0.35)] rtl:bg-gradient-to-l" />
              <div className="max-w-xl text-white">
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.hub.ctaTitle}</h2>
                <p className="mt-4 text-pretty text-lg text-white/80">{t.hub.ctaBody}</p>
                <Button asChild size="lg" className="group mt-8 h-12 bg-white px-6 text-[oklch(0.3_0.12_263)] hover:bg-white/90 active:scale-[0.98]">
                  <Link href="/clinic/book">
                    {t.hub.ctaPrimary}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <AutoSynexLogo />
          <p className="max-w-xl leading-relaxed">{t.hub.demoNotice}</p>
        </div>
      </footer>
    </div>
  );
}

function BentoCell({
  className,
  icon: Icon,
  title,
  desc,
  children,
  delay,
  tinted,
}: {
  className?: string;
  icon: typeof Users;
  title: string;
  desc: string;
  children: React.ReactNode;
  delay: number;
  tinted?: boolean;
}) {
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-2xl border px-6 pt-6 shadow-xs transition-shadow duration-300 hover:shadow-md",
          tinted ? "bg-gradient-to-b from-primary-soft/70 to-card" : "bg-card",
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <div className="mt-auto pb-6 [&:has(.rounded-t-lg)]:pb-0 [&:has(.rounded-t-\[1\.6rem\])]:pb-0">{children}</div>
      </article>
    </Reveal>
  );
}

function TeamStack() {
  const { tx } = useI18n();
  const people = tenants.flatMap((x) => x.team).slice(0, 8);
  return (
    <div className="mt-6 grid gap-3">
      <div className="flex -space-x-3 rtl:space-x-reverse">
        {people.map((p) => (
          <Avatar key={p.id} name={p.name.en} hue={p.hue} photo={p.photo} size="lg" className="transition-transform duration-300 group-hover:-translate-y-1" />
        ))}
      </div>
      <ul className="grid gap-1.5 text-sm">
        {people.slice(0, 3).map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-card/80 px-3 py-2">
            <span className="truncate font-medium">{tx(p.name)}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{tx(p.title)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IndustryCard({ tenant }: { tenant: TenantSummary }) {
  const { t, tx } = useI18n();
  const Icon = industryIcons[tenant.id];
  const b = tenant.business;
  const money = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: b.currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }), [b.currency]);

  return (
    <article style={hueStyle(b.hue)} className="lane group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image src={b.media.card} alt="" fill sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
      </div>
      <div className="relative flex flex-1 flex-col gap-4 p-5 pt-8">
        <span className="absolute -top-6 start-5 flex size-12 items-center justify-center rounded-xl border bg-card text-[var(--lane-fg)] shadow-md">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-medium text-[var(--lane-fg)]">{tx(b.industryLabel)}</p>
          <h3 className="mt-0.5 flex items-center gap-2 text-lg font-semibold leading-snug tracking-tight">
            {tx(b.name)}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.hub.industryBlurb[tenant.id]}</p>
        </div>
        <ul className="grid gap-1.5">
          {tenant.featured.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="min-w-0 truncate text-muted-foreground">{tx(s.name)}</span>
              <span className="shrink-0 font-medium tabular">{money.format(s.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button asChild size="sm" className="h-9 flex-1">
            <Link href={`/${tenant.id}/book`}>
              {t.hub.openPortal}
              <ArrowRight className="rtl:-scale-x-100" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="secondary" className="size-9" aria-label={`${t.hub.openDashboard}: ${tx(b.name)}`}>
            <Link href={`/${tenant.id}/dashboard`}>
              <LayoutDashboard />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
