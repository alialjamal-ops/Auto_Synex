import { notFound } from 'next/navigation';
import { Footer } from '@/components/site/footer';
import { Navbar } from '@/components/site/navbar';
import { SectionRenderer } from '@/components/site/section-renderer';
import { getDemo } from '@/config/demos';
import type { Locale } from '@/config/i18n';
import { weekdayLong } from '@/lib/date';

/** The marketing site for one demo, in one language. */
export function DemoSite({ slug, locale }: { slug: string; locale: Locale }) {
  const config = getDemo(slug, locale);
  if (!config) notFound();

  // LocalBusiness structured data, generated from the same config.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.businessName,
    description: config.seo.description,
    telephone: config.contact.phone,
    email: config.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.contact.addressLines[0],
      addressLocality: config.contact.addressLines[1],
    },
    openingHoursSpecification: Object.entries(config.hours)
      .filter(([, hours]) => hours)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: weekdayLong(Number(day)),
        opens: hours?.open,
        closes: hours?.close,
      })),
    makesOffer: config.services.map((service) => ({
      '@type': 'Offer',
      name: service.name,
      description: service.description,
      price: service.price,
      priceCurrency: config.booking.currency,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar config={config} />
      <main id="main">
        {config.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} config={config} />
        ))}
      </main>
      <Footer config={config} />
    </>
  );
}
