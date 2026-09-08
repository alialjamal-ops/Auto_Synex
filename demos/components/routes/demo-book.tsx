import { ArrowLeft, ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingFlow } from '@/components/booking/booking-flow';
import { LanguageToggle } from '@/components/site/language-toggle';
import { DemoLogo } from '@/components/site/logo';
import { getDemo } from '@/config/demos';
import { getUi, isRtl, localeHref, type Locale } from '@/config/i18n';
import { toISODate } from '@/lib/date';

/** The booking flow page for one demo, in one language. */
export function DemoBook({
  slug,
  locale,
  serviceParam,
  staffParam,
}: {
  slug: string;
  locale: Locale;
  serviceParam?: string;
  staffParam?: string;
}) {
  const config = getDemo(slug, locale);
  if (!config) notFound();

  const ui = getUi(locale);
  const rtl = isRtl(locale);
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const home = localeHref(locale, `/${config.slug}`);

  const now = new Date();
  const todayIso = toISODate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const initialServiceId =
    serviceParam && config.services.some((service) => service.id === serviceParam)
      ? serviceParam
      : null;
  const initialStaffId =
    staffParam && config.staff.some((member) => member.id === staffParam) ? staffParam : null;

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-xl">
        <div className="container-x flex h-[var(--nav-height)] items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link
              href={home}
              className="hidden items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <BackIcon className="size-4" />
              {ui.common.backToSite}
            </Link>
            <span aria-hidden className="hidden h-5 w-px bg-line sm:block" />
            <DemoLogo config={config} href={home} />
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
              className="hidden text-[13px] text-muted transition-colors hover:text-ink sm:inline"
              dir="ltr"
            >
              {config.contact.phone}
            </a>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container-x py-10 sm:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-brand">
            {config.businessName} · {config.industry}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.2rem)]">{config.cta.label}</h1>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-brand" />
              {ui.booking.takesSeconds}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" />
              {ui.booking.noCard}
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              {ui.booking.liveAvailability}
            </li>
          </ul>
        </div>

        <BookingFlow
          config={config}
          todayIso={todayIso}
          nowMinutes={nowMinutes}
          initialServiceId={initialServiceId}
          initialStaffId={initialStaffId}
        />
      </main>

      <footer className="container-x border-t border-line py-8 pb-24 text-center text-[12px] text-muted">
        {ui.common.interactiveDemo} · {config.businessName} {ui.common.notReal} ·{' '}
        <Link href={localeHref(locale, '/')} className="underline underline-offset-4 hover:text-ink">
          {ui.common.allDemos}
        </Link>
      </footer>
    </div>
  );
}
