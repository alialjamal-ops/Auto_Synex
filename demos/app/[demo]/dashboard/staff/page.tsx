import { notFound } from 'next/navigation';
import { StaffView } from '@/components/dashboard/views/catalog';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'en');
  if (!config) notFound();

  return <StaffView config={config} todayIso={toISODate(new Date())} />;
}
