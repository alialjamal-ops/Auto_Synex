import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoBar } from '@/components/site/demo-bar';
import { demoSlugs, getDemo } from '@/config/demos';
import { BookingsProvider } from '@/hooks/use-bookings';
import { themeStyle } from '@/lib/theme';

interface DemoParams {
  params: Promise<{ demo: string }>;
}

export function generateStaticParams() {
  return demoSlugs.map((demo) => ({ demo }));
}

export async function generateMetadata({ params }: DemoParams): Promise<Metadata> {
  const { demo } = await params;
  const config = getDemo(demo);
  if (!config) return {};

  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: [...config.seo.keywords],
    alternates: { canonical: `/${config.slug}` },
    openGraph: {
      type: 'website',
      title: config.seo.title,
      description: config.seo.description,
      siteName: config.businessName,
      url: `/${config.slug}`,
      images: [{ url: config.card.image.src, width: 1200, height: 800, alt: config.businessName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.title,
      description: config.seo.description,
      images: [config.card.image.src],
    },
  };
}

export default async function DemoLayout({
  children,
  params,
}: DemoParams & { children: React.ReactNode }) {
  const { demo } = await params;
  const config = getDemo(demo);
  if (!config) notFound();

  return (
    <div
      style={themeStyle(config.theme)}
      data-display={config.theme.displayStyle}
      data-demo={config.slug}
      className="min-h-screen bg-page font-body text-ink"
    >
      <BookingsProvider slug={config.slug}>
        {children}
        <DemoBar config={config} />
      </BookingsProvider>
    </div>
  );
}
