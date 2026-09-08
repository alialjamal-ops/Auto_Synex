import type { Metadata } from 'next';
import { DemoBook } from '@/components/routes/demo-book';
import { getDemo } from '@/config/demos';

/** "Today" must be the real today, so this route renders per request. */
export const dynamic = 'force-dynamic';

const LOCALE = 'ar' as const;

interface BookPageProps {
  params: Promise<{ demo: string }>;
  searchParams: Promise<{ service?: string; staff?: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { demo } = await params;
  const config = getDemo(demo, LOCALE);
  if (!config) return {};

  return {
    title: `${config.cta.label} · ${config.businessName}`,
    description: config.seo.description,
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params, searchParams }: BookPageProps) {
  const { demo } = await params;
  const query = await searchParams;
  return (
    <DemoBook slug={demo} locale={LOCALE} serviceParam={query.service} staffParam={query.staff} />
  );
}
