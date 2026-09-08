import type { Metadata } from 'next';
import { Landing } from '@/components/routes/landing';
import { siteConfigAr } from '@/config/site';

export const metadata: Metadata = {
  title: siteConfigAr.metaTitle,
  description: siteConfigAr.metaDescription,
  alternates: { canonical: '/ar', languages: { en: '/', ar: '/ar' } },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    title: siteConfigAr.metaTitle,
    description: siteConfigAr.metaDescription,
  },
};

export default function ArabicHomePage() {
  return <Landing locale="ar" />;
}
