import { DemoSite } from '@/components/routes/demo-site';

export default async function Page({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  return <DemoSite slug={demo} locale="en" />;
}
