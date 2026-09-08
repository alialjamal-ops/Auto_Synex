import { notFound } from 'next/navigation';
import { SettingsView } from '@/components/dashboard/views/settings';
import { getDemo } from '@/config/demos';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo, 'en');
  if (!config) notFound();

  return <SettingsView config={config} />;
}
