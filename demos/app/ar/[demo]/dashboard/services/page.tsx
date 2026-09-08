import { notFound } from 'next/navigation';
import { ServicesView } from '@/components/dashboard/views/catalog';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'ar');
  if (!config) notFound();

  return <ServicesView config={config} todayIso={toISODate(new Date())} />;
}
