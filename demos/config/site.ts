export interface Offer {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly points: readonly string[];
  readonly icon: string;
  readonly featured?: boolean;
}

/**
 * Agency-level configuration for the demo selector at `/`.
 *
 * Rename `brandName`, swap the contact details and the offer copy — the landing
 * page reads everything from here.
 */
export const siteConfig = {
  brandName: 'Auto Synex',
  tagline: 'Websites, booking systems and dashboards for businesses that take reservations.',
  metaTitle: 'Auto Synex — Interactive Website & Booking System Demos',
  metaDescription:
    'Five fully interactive demo websites with real booking flows and business dashboards — for clinics, dental practices, salons, hotels and restaurants.',
  email: 'hello@autosynex.com',
  phone: '+1 (415) 555-0110',

  hero: {
    kicker: 'Interactive demos — not screenshots',
    headline: ['Your business,', 'already built.'],
    lead: 'Five complete websites you can click through right now. Real booking flows, real availability logic, real dashboards. Pick the one closest to your business and try it as if it were yours.',
    stats: [
      { value: '5', label: 'Live industry demos' },
      { value: '3', label: 'Products per demo' },
      { value: '100%', label: 'Interactive, no mockups' },
    ],
  },

  offers: [
    {
      id: 'website',
      name: 'Website',
      tagline: 'The storefront',
      description:
        'A custom, animated, fully responsive site built around your brand — not a template with your logo dropped in.',
      points: [
        'Bespoke design and art direction',
        'Motion built in, not bolted on',
        'Mobile-first, fast on real phones',
        'SEO structure and metadata',
        'Content you can edit yourself',
      ],
      icon: 'palette',
    },
    {
      id: 'booking',
      name: 'Booking System',
      tagline: 'The engine',
      description:
        'Real availability logic: working hours, staff rotas, service durations, double-booking prevention and confirmations.',
      points: [
        'Multi-step booking flow',
        'Working hours & break handling',
        'Per-staff availability',
        'Double-booking prevention',
        'Email / SMS confirmations',
      ],
      icon: 'calendar',
      featured: true,
    },
    {
      id: 'complete',
      name: 'Website + Booking + Dashboard',
      tagline: 'The whole operation',
      description:
        'Everything above plus the back office: appointments, calendar, customers, staff, services and revenue in one place.',
      points: [
        'Everything in Website + Booking',
        'Operations dashboard',
        'Calendar and appointment table',
        'Customer and staff records',
        'Revenue and occupancy reporting',
      ],
      icon: 'building',
    },
  ] as readonly Offer[],

  capabilities: [
    { icon: 'zap', title: 'Fast by default', text: 'Server-rendered, image-optimised, and tuned for mobile networks.' },
    { icon: 'calendar', title: 'Booking that holds up', text: 'Hours, breaks, lead times and staff rotas — handled properly.' },
    { icon: 'sparkles', title: 'Motion with restraint', text: 'Animation that signals quality without getting in the way.' },
    { icon: 'shield', title: 'Built to be maintained', text: 'Config-driven content, typed end to end, easy to hand over.' },
  ],

  process: [
    { title: 'Pick a direction', text: 'Start from the demo closest to your business, or start from a blank page.' },
    { title: 'We adapt it to you', text: 'Your brand, services, staff, hours and pricing — usually inside a week.' },
    { title: 'You go live', text: 'Deployed, measured and handed over with everything you need to run it.' },
  ],
};

export type SiteConfig = typeof siteConfig;

/** Arabic copy for the demo selector. Structure mirrors `siteConfig`. */
export const siteConfigAr: SiteConfig = {
  brandName: 'Auto Synex',
  tagline: 'مواقع وأنظمة حجز ولوحات تحكم للأنشطة التي تستقبل حجوزات.',
  metaTitle: 'Auto Synex — قوالب مواقع وأنظمة حجز تفاعلية',
  metaDescription:
    'خمسة مواقع تجريبية كاملة بأنظمة حجز حقيقية ولوحات تحكم — للعيادات وعيادات الأسنان والصالونات والفنادق والمطاعم.',
  email: 'hello@autosynex.com',
  phone: '+1 (415) 555-0110',

  hero: {
    kicker: 'قوالب تفاعلية — لا صور',
    headline: ['نشاطك،', 'مبنيٌّ سلفًا.'],
    lead: 'خمسة مواقع كاملة تستطيع تصفّحها الآن. أنظمة حجز حقيقية، ومنطق توفّر فعلي، ولوحات تحكم تعمل. اختر الأقرب إلى نشاطك وجرّبه كأنه لك.',
    stats: [
      { value: '5', label: 'قوالب حيّة' },
      { value: '3', label: 'منتجات لكل قالب' },
      { value: '100%', label: 'تفاعلية بالكامل' },
    ],
  },

  offers: [
    {
      id: 'website',
      name: 'الموقع',
      tagline: 'الواجهة',
      description:
        'موقع مخصّص متحرّك ومتجاوب بالكامل مبني حول هويتك — لا قالب جاهز وُضع عليه شعارك.',
      points: [
        'تصميم وإخراج بصري خاص',
        'حركة مدمجة في البنية لا مضافة',
        'يبدأ من الجوال، وسريع على الشبكات الفعلية',
        'بنية وبيانات وصفية للـSEO',
        'محتوى تستطيع تعديله بنفسك',
      ],
      icon: 'palette',
    },
    {
      id: 'booking',
      name: 'نظام الحجز',
      tagline: 'المحرّك',
      description:
        'منطق توفّر حقيقي: ساعات العمل، ومناوبات الطاقم، ومدد الخدمات، ومنع الحجز المزدوج، والتأكيدات.',
      points: [
        'تدفق حجز متعدد الخطوات',
        'ساعات عمل وفترات استراحة',
        'توفّر لكل موظف على حدة',
        'منع الحجز المزدوج',
        'تأكيدات بالبريد والرسائل',
      ],
      icon: 'calendar',
      featured: true,
    },
    {
      id: 'complete',
      name: 'موقع + حجز + لوحة تحكم',
      tagline: 'المنظومة كاملة',
      description:
        'كل ما سبق مع مكتب الإدارة: المواعيد والتقويم والعملاء والطاقم والخدمات والإيرادات في مكان واحد.',
      points: [
        'كل ما في الموقع والحجز',
        'لوحة تشغيل متكاملة',
        'تقويم وجدول مواعيد',
        'سجلات العملاء والطاقم',
        'تقارير الإيرادات والإشغال',
      ],
      icon: 'building',
    },
  ] as readonly Offer[],

  capabilities: [
    { icon: 'zap', title: 'سريع بطبيعته', text: 'مُولَّد من الخادم، وصور محسّنة، ومضبوط لشبكات الجوال.' },
    { icon: 'calendar', title: 'حجز يصمد', text: 'ساعات العمل والاستراحات والمهل والمناوبات — معالَجة كما يجب.' },
    { icon: 'sparkles', title: 'حركة منضبطة', text: 'حركة تدلّ على الجودة دون أن تعترض الطريق.' },
    { icon: 'shield', title: 'مبني ليُصان', text: 'محتوى مبني على ملفات إعداد، وأنواع صارمة، وتسليم سهل.' },
  ],

  process: [
    { title: 'اختر الاتجاه', text: 'ابدأ من القالب الأقرب إلى نشاطك، أو من صفحة بيضاء.' },
    { title: 'نكيّفه عليك', text: 'هويتك وخدماتك وطاقمك وساعاتك وأسعارك — عادة خلال أسبوع.' },
    { title: 'تنطلق', text: 'منشور ومقيس ومُسلَّم إليك بكل ما تحتاجه لتشغيله.' },
  ],
};

/**
 * The main Auto Synex site. When the demos are proxied at `/demos` this is the
 * parent origin's root, so a plain '/' takes the visitor back to the site.
 */
export const parentSiteUrl = process.env.NEXT_PUBLIC_PARENT_URL ?? '/';

export function getSite(locale: 'en' | 'ar'): SiteConfig {
  return locale === 'ar' ? siteConfigAr : siteConfig;
}
