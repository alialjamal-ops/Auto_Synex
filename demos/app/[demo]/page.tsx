import { notFound } from 'next/navigation';
import { Footer } from '@/components/site/footer';
import { Navbar } from '@/components/site/navbar';
import { SectionRenderer } from '@/components/site/section-renderer';
import { getDemo } from '@/config/demos';
import { WEEKDAY_LONG } from '@/lib/date';

export default async function DemoSitePage({ params }: { params: Promise<{ demo: string }> }) {
  const { demo } = await params;
  const config = getDemo(demo);
  if (!config) notFound();

  // LocalBusiness structured data — real SEO, generated from the same config.
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
        dayOfWeek: WEEKDAY_LONG[Number(day)],
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
