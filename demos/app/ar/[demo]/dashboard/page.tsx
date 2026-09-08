import { notFound } from 'next/navigation';
import { OverviewView } from '@/components/dashboard/views/overview';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'ar');
  if (!config) notFound();

  return <OverviewView config={config} todayIso={toISODate(new Date())} />;
}
