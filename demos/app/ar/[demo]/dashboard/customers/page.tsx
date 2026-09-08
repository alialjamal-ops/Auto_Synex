import { notFound } from 'next/navigation';
import { CustomersView } from '@/components/dashboard/views/customers';
import { getDemo } from '@/config/demos';
import { toISODate } from '@/lib/date';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'ar');
  if (!config) notFound();

  return <CustomersView config={config} todayIso={toISODate(new Date())} />;
}
