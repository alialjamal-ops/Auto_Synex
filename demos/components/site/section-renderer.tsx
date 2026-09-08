import { Hero } from '@/components/site/sections/hero';
import {
  CtaBand,
  FeatureGrid,
  MarqueeBand,
  Split,
  StatsBand,
} from '@/components/site/sections/content';
import { MenuBoard, Membership, Services, Staff } from '@/components/site/sections/catalog';
import { BeforeAfter, Gallery } from '@/components/site/sections/media';
import { Contact, Faq, Testimonials } from '@/components/site/sections/social';
import type { DemoConfig, Section } from '@/types/demo';

/**
 * Maps a config section to its component.
 *
 * This is the whole "add a section without touching the system" story: extend
 * the `Section` union in `types/demo.ts`, add a case here, and every demo can
 * use it from config.
 */
export function SectionRenderer({
  section,
  config,
}: {
  section: Section;
  config: DemoConfig;
}) {
  switch (section.type) {
    case 'hero':
      return <Hero section={section} config={config} />;
    case 'stats':
      return <StatsBand section={section} />;
    case 'marquee':
      return <MarqueeBand section={section} />;
    case 'split':
      return <Split section={section} config={config} />;
    case 'features':
      return <FeatureGrid section={section} />;
    case 'services':
      return <Services section={section} config={config} />;
    case 'staff':
      return <Staff section={section} config={config} />;
    case 'gallery':
      return <Gallery section={section} />;
    case 'beforeAfter':
      return <BeforeAfter section={section} />;
    case 'menu':
      return <MenuBoard section={section} config={config} />;
    case 'membership':
      return <Membership section={section} config={config} />;
    case 'testimonials':
      return <Testimonials section={section} />;
    case 'faq':
      return <Faq section={section} />;
    case 'cta':
      return <CtaBand section={section} config={config} />;
    case 'contact':
      return <Contact section={section} config={config} />;
    default: {
      // Exhaustiveness guard — a new section type fails the build here.
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}
