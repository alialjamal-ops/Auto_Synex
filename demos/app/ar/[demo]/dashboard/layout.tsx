import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

/** Every dashboard screen is relative to "today", so render per request. */
export const dynamic = 'force-dynamic';

const LOCALE = 'ar' as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ demo: string }>;
}): Promise<Metadata> {
  const { demo } = await params;
  const config = getDemo(demo, LOCALE);
  if (!config) return {};

  return {
    title: `${config.businessName} · ${config.dashboard.customerLabelPlural}`,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ demo: string }>;
}) {
  const { demo } = await params;
  const config = getDemo(demo, LOCALE);
  if (!config) notFound();

  return (
    <DashboardShell config={config} todayIso={toISODate(new Date())}>
      {children}
    </DashboardShell>
  );
}
