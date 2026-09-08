import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DemoShell } from '@/components/routes/demo-shell';
import { demoSlugs, getDemo } from '@/config/demos';
import { localeHref } from '@/config/i18n';

const LOCALE = 'en' as const;
const LOCALE_OG = 'en_US';

interface DemoParams {
  params: Promise<{ demo: string }>;
}

export function generateStaticParams() {
  return demoSlugs.map((demo) => ({ demo }));
}

export async function generateMetadata({ params }: DemoParams): Promise<Metadata> {
  const { demo } = await params;
  const config = getDemo(demo, LOCALE);
  if (!config) return {};

  const path = localeHref(LOCALE, `/${config.slug}`);

  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: [...config.seo.keywords],
    alternates: {
      canonical: path,
      languages: { en: `/${config.slug}`, ar: `/ar/${config.slug}` },
    },
    openGraph: {
      type: 'website',
      locale: LOCALE_OG,
      title: config.seo.title,
      description: config.seo.description,
      siteName: config.businessName,
      url: path,
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
  const config = getDemo(demo, LOCALE);
  if (!config) notFound();

  return (
    <DemoShell config={config} locale={LOCALE}>
      {children}
    </DemoShell>
  );
}
