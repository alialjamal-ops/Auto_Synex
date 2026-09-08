import { notFound } from 'next/navigation';
import { AppointmentsView } from '@/components/dashboard/views/appointments';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'ar');
  if (!config) notFound();

  return <AppointmentsView config={config} todayIso={toISODate(new Date())} />;
}
