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
import { demoList } from '@/config/demos';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.brandName,
    description: siteConfig.metaDescription,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    makesOffer: siteConfig.offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav />
      <main id="main">
        <LandingHero demos={demoList} />
        <DemoGrid demos={demoList} />
        <OfferSection />
        <CapabilityStrip />
        <ProcessSection />
        <LandingCta />
      </main>
      <LandingFooter demos={demoList} />
    </>
  );
}
