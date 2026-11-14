"use client";

import {
  ArrowRight,
  Boxes,
  CalendarDays,
  Clock,
  Cloud,
  Expand,
  Languages,
  LayoutDashboard,
  Layers,
  MonitorSmartphone,
  SunMoon,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { AutoSynexLogo, BusinessLogo } from "@/components/brand/logo";
import { LanguageToggle, ThemeToggle } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { industryIcons } from "@/config/industry-icons";
import { listDemoTenants, type TenantSummary } from "@/data/tenant-directory";
import { intlLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { hueStyle } from "@/lib/utils";
import { ProductPreview } from "./product-preview";

const tenants = listDemoTenants();
const ease = [0.2, 0.7, 0.2, 1] as const;

export function DemoHub() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease } });

  const pillars = [
    { icon: Layers, label: t.hub.pillars.industries },
    { icon: Expand, label: t.hub.pillars.scalable },
    { icon: Cloud, label: t.hub.pillars.saas },
    { icon: Boxes, label: t.hub.pillars.tenants },
  ];
  const features = [
    { icon: LayoutDashboard, label: t.hub.features.dashboard },
    { icon: Users, label: t.hub.features.staff },
    { icon: CalendarDays, label: t.hub.features.calendar },
    { icon: Languages, label: t.hub.features.bilingual },
    { icon: SunMoon, label: t.hub.features.theme },
    { icon: MonitorSmartphone, label: t.hub.features.responsive },
  ];
  const stats = [
    { value: tenants.length, label: t.hub.statIndustries },
    { value: tenants.reduce((n, x) => n + x.serviceCount, 0), label: t.hub.statServices },
    { value: tenants.reduce((n, x) => n + x.staffCount, 0), label: t.hub.statTeam },
    { value: 2, label: t.hub.statLanguages },
  ];

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Backdrop: soft brand wash + fine grid that fades out. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]">
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_70%_10%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_70%),radial-gradient(40%_50%_at_10%_0%,color-mix(in_oklch,var(--chart-2)_12%,transparent),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-transparent bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/55">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AutoSynexLogo />
            <span className="hidden rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm shadow-primary/30 sm:inline-flex" dir="ltr">
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
        {/* ------------------------------------------------------------ hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pb-28">
          <div className="text-center lg:text-start">
            <motion.p {...fade(0)} className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {t.hub.eyebrow}
            </motion.p>
            <motion.h1 {...fade(0.05)} className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">{t.hub.heroTitle}</span>
            </motion.h1>
            <motion.p {...fade(0.1)} className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              {t.hub.heroSubtitle}
            </motion.p>
            <motion.div {...fade(0.15)} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-12 px-6 shadow-md shadow-primary/25">
                <Link href="/clinic/book">
                  {t.hub.ctaPrimary}
                  <ArrowRight className="rtl:-scale-x-100" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 px-6">
                <Link href="/clinic/dashboard">
                  <LayoutDashboard />
                  {t.hub.ctaSecondary}
                </Link>
              </Button>
            </motion.div>
            <motion.dl {...fade(0.2)} className="mx-auto mt-10 grid max-w-md grid-cols-4 divide-x divide-border rounded-2xl border bg-card/70 py-3 shadow-xs backdrop-blur rtl:divide-x-reverse lg:mx-0">
              {stats.map((s) => (
                <div key={s.label} className="px-2 text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-xl font-semibold tabular">{s.value}</dd>
                  <dd className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
          <div className="px-2 sm:px-6 lg:px-0">
            <ProductPreview />
          </div>
        </section>

        {/* ------------------------------------------------------------ industries */}
        <section className="border-y bg-subtle/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{t.hub.chooseTitle}</h2>
              <p className="mt-3 text-pretty text-muted-foreground">{t.hub.chooseSubtitle}</p>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {pillars.map((p) => (
                  <li key={p.label} className="inline-flex items-center gap-2">
                    <p.icon className="size-4 text-primary" aria-hidden />
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tenants.map((tenant, i) => (
                <IndustryCard key={tenant.id} tenant={tenant} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ features */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {features.map((f) => (
              <li key={f.label} className="group flex flex-col items-center gap-3 rounded-2xl border bg-card px-3 py-6 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary-soft to-primary-soft/40 text-primary-soft-foreground ring-1 ring-primary/10 transition-transform group-hover:scale-105">
                  <f.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-[13px] font-medium leading-snug">{f.label}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">{t.hub.demoNotice}</p>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <AutoSynexLogo compact />
          <span dir="ltr">
            {t.common.appName} · {t.common.edition} {t.common.version}
          </span>
        </div>
      </footer>
    </div>
  );
}

function IndustryCard({ tenant, index }: { tenant: TenantSummary; index: number }) {
  const { t, tx, locale } = useI18n();
  const reduce = useReducedMotion();
  const Icon = industryIcons[tenant.id];
  const b = tenant.business;
  const money = useMemo(() => new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: b.currency, maximumFractionDigits: 0 }), [locale, b.currency]);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 + 0.06 * index, ease }}
      style={hueStyle(b.hue)}
      className="lane group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--lane-border)]/40 hover:shadow-lg"
    >
      {/* Tinted header with brand monogram and industry glyph */}
      <div className="relative overflow-hidden border-b bg-[var(--lane-bg)] px-5 pb-5 pt-5">
        <div aria-hidden className="absolute -end-8 -top-10 size-36 rounded-full bg-[var(--lane-border)]/15 blur-2xl transition-transform duration-500 group-hover:scale-125" />
        <Icon aria-hidden className="absolute -bottom-4 end-3 size-24 text-[var(--lane-fg)] opacity-[0.07] transition-transform duration-500 group-hover:-rotate-6" strokeWidth={1.5} />
        <div className="relative flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-xl bg-card text-[var(--lane-fg)] shadow-sm ring-1 ring-black/5">
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <span className="rounded-full bg-card/80 px-2.5 py-1 text-[11px] font-medium text-[var(--lane-fg)] backdrop-blur">{tx(b.industryLabel)}</span>
        </div>
        <div className="relative mt-4 flex items-center gap-2.5">
          <BusinessLogo monogram={b.monogram} hue={b.hue} size="sm" className="bg-card" />
          <h3 className="min-w-0 text-base font-semibold leading-snug tracking-tight">{tx(b.name)}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{t.hub.industryBlurb[tenant.id]}</p>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{t.hub.popular}</p>
          <ul className="grid gap-1.5">
            {tenant.featured.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-subtle px-2.5 py-1.5 text-[13px]">
                <span className="min-w-0 truncate">{tx(s.name)}</span>
                <span className="shrink-0 text-xs font-medium tabular" title={t.common.minutes(s.durationMin)}>
                  {money.format(s.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="sr-only">{t.nav.services}</dt>
            <dd>{t.hub.servicesCount(tenant.serviceCount)}</dd>
          </div>
          <div>
            <dt className="sr-only">{t.nav.staff}</dt>
            <dd>{t.hub.staffCount(tenant.staffCount, tx(b.staffNoun.plural))}</dd>
          </div>
          <div>
            <dt className="sr-only">{t.hub.tz}</dt>
            <dd className="inline-flex items-center gap-1" dir="ltr">
              <Clock className="size-3" aria-hidden />
              {b.timezone.split("/")[1]}
            </dd>
          </div>
        </dl>
        <div className="grid gap-2">
          <Button asChild size="sm" className="h-9">
            <Link href={`/${tenant.id}/book`}>
              {t.hub.openPortal}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="h-9">
            <Link href={`/${tenant.id}/dashboard`}>
              <LayoutDashboard /> {t.hub.openDashboard}
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
