import { notFound } from 'next/navigation';
import { CalendarView } from '@/components/dashboard/views/calendar';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'en');
  if (!config) notFound();

  return <CalendarView config={config} todayIso={toISODate(new Date())} />;
}
