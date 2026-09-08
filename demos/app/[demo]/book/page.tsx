import type { Metadata } from 'next';
import { ArrowLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingFlow } from '@/components/booking/booking-flow';
import { DemoLogo } from '@/components/site/logo';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

/** "Today" must be the real today, so this route renders per request. */
export const dynamic = 'force-dynamic';

interface BookPageProps {
  params: Promise<{ demo: string }>;
  searchParams: Promise<{ service?: string; staff?: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { demo } = await params;
  const config = getDemo(demo);
  if (!config) return {};

  return {
    title: `${config.cta.label} · ${config.businessName}`,
    description: `Check live availability and ${config.cta.label.toLowerCase()} at ${config.businessName} in under two minutes.`,
    robots: { index: false, follow: true },
  };
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { demo } = await params;
  const query = await searchParams;
  const config = getDemo(demo);
  if (!config) notFound();

  const now = new Date();
  const todayIso = toISODate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const initialServiceId =
    query.service && config.services.some((service) => service.id === query.service)
      ? query.service
      : null;
  const initialStaffId =
    query.staff && config.staff.some((member) => member.id === query.staff) ? query.staff : null;

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur-xl">
        <div className="container-x flex h-[var(--nav-height)] items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link
              href={`/${config.slug}`}
              className="hidden items-center gap-2 text-[13px] text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              <ArrowLeft className="size-4" />
              Back to site
            </Link>
            <span aria-hidden className="hidden h-5 w-px bg-line sm:block" />
            <DemoLogo config={config} href={`/${config.slug}`} />
          </div>
          <a
            href={`tel:${config.contact.phone.replace(/\s/g, '')}`}
            className="text-[13px] text-muted transition-colors hover:text-ink"
          >
            {config.contact.phone}
          </a>
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
              Takes about 90 seconds
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" />
              No card required
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              Live availability
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

      <footer className="container-x border-t border-line py-8 text-center text-[12px] text-muted">
        Interactive demo · {config.businessName} is not a real business ·{' '}
        <Link href="/" className="underline underline-offset-4 hover:text-ink">
          See all demos
        </Link>
      </footer>
    </div>
  );
}
