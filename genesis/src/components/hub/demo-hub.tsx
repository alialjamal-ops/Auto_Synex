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
import { AutoSynexLogo, BusinessLogo } from "@/components/brand/logo";
import { LanguageToggle, ThemeToggle } from "@/components/controls";
import { Button } from "@/components/ui/button";
import { industryIcons } from "@/config/industry-icons";
import { listDemoTenants } from "@/data/tenant-directory";
import { useI18n } from "@/i18n/provider";
import { hueStyle } from "@/lib/utils";

const tenants = listDemoTenants();

export function DemoHub() {
  const { t, tx } = useI18n();
  const reduce = useReducedMotion();

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

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Quiet backdrop: a single soft wash, no heavy gradients. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <AutoSynexLogo />
          <span className="hidden rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground sm:inline-flex" dir="ltr">
            {t.common.edition} {t.common.version}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="mx-auto max-w-3xl pb-10 pt-8 text-center sm:pt-14">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {t.hub.eyebrow}
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]">{t.hub.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{t.hub.subtitle}</p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {pillars.map((p) => (
              <li key={p.label} className="inline-flex items-center gap-2">
                <p.icon className="size-4 text-primary" aria-hidden />
                {p.label}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={t.hub.title} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tenants.map((tenant, i) => {
            const Icon = industryIcons[tenant.id];
            const b = tenant.business;
            return (
              <motion.article
                key={tenant.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.2, 0.7, 0.2, 1] }}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow duration-300 hover:shadow-md"
              >
                <div style={hueStyle(b.hue)} className="lane relative flex h-32 items-center justify-center overflow-hidden border-b bg-[var(--lane-bg)]">
                  <div aria-hidden className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--lane-border)_0.6px,transparent_0.6px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                  <span className="relative flex size-14 items-center justify-center rounded-2xl bg-card text-[var(--lane-fg)] shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon className="size-6" strokeWidth={1.75} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <BusinessLogo monogram={b.monogram} hue={b.hue} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">{tx(b.industryLabel)}</p>
                      <h2 className="truncate text-[15px] font-semibold tracking-tight">{tx(b.name)}</h2>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t.hub.industryBlurb[tenant.id]}</p>
                  <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1">
                      <dt className="sr-only">{t.nav.services}</dt>
                      <dd>{t.hub.servicesCount(tenant.serviceCount)}</dd>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <dt className="sr-only">{t.nav.staff}</dt>
                      <dd>{t.hub.staffCount(tenant.staffCount, tx(b.staffNoun.plural))}</dd>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <dt className="sr-only">{t.hub.tz}</dt>
                      <dd className="inline-flex items-center gap-1" dir="ltr">
                        <Clock className="size-3" aria-hidden />
                        {b.timezone.split("/")[1]}
                      </dd>
                    </div>
                  </dl>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Button asChild variant="default" size="sm" className="px-2.5">
                      <Link href={`/${tenant.id}/book`}>
                        {t.hub.openPortal}
                        <ArrowRight className="rtl:-scale-x-100" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm" className="px-2.5">
                      <Link href={`/${tenant.id}/dashboard`}>{t.hub.openDashboard}</Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-12 rounded-2xl border bg-card p-2 shadow-xs">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
            {features.map((f) => (
              <li key={f.label} className="flex flex-col items-center gap-2.5 rounded-xl px-3 py-5 text-center">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                  <f.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-[13px] font-medium leading-snug">{f.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">{t.hub.demoNotice}</p>
      </main>
    </div>
  );
}
