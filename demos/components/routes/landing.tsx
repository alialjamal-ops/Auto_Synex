import {
  CapabilityStrip,
  DemoGrid,
  LandingCta,
  LandingFooter,
  LandingHero,
  LandingNav,
  OfferSection,
  ProcessSection,
} from '@/components/landing/landing';
import { getDemoList } from '@/config/demos';
import { isRtl, type Locale } from '@/config/i18n';
import { getSite } from '@/config/site';
import { LocaleProvider } from '@/hooks/use-locale';

/** The demo selector, in one language. */
export function Landing({ locale }: { locale: Locale }) {
  const demos = getDemoList(locale);
  const site = getSite(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.brandName,
    description: site.metaDescription,
    email: site.email,
    telephone: site.phone,
    makesOffer: site.offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
    })),
  };

  return (
    <div lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocaleProvider locale={locale}>
        <LandingNav />
        <main id="main">
          <LandingHero demos={demos} />
          <DemoGrid demos={demos} />
          <OfferSection />
          <CapabilityStrip />
          <ProcessSection />
          <LandingCta />
        </main>
        <LandingFooter demos={demos} />
      </LocaleProvider>
    </div>
  );
}
