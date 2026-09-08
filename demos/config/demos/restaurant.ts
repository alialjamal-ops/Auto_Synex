import { restaurantMedia as m } from '@/config/media';
import type { DemoConfig } from '@/types/demo';

/**
 * EMBER & STONE — live-fire restaurant.
 * Identity: warm dark. Charcoal, ember orange, high-contrast display serif.
 * Booking runs in `table` mode: seating → date → time → party size → details.
 */
export const restaurantDemo: DemoConfig = {
  slug: 'restaurant',
  businessName: 'Ember & Stone',
  logoMark: 'E',
  industry: 'Restaurant',
  tagline: 'Everything touches fire.',

  seo: {
    title: 'Ember & Stone — Live-Fire Restaurant & Reservations',
    description:
      'Ember & Stone is a live-fire restaurant cooking over oak and charcoal. Tasting menu, chef’s counter and weekend brunch, with instant table reservations.',
    keywords: ['restaurant', 'fine dining', 'tasting menu', 'book a table', 'live fire cooking'],
  },

  card: {
    title: 'Restaurant',
    description:
      'A warm, dark restaurant site with a full menu, signature dishes, chef profile and table reservations.',
    features: ['Full menu system', 'Signature dishes', 'Party-size booking', 'Front-of-house desk'],
    ctaLabel: 'View Restaurant Demo',
    image: m.hero,
    accent: '#D9743B',
  },

  theme: {
    mode: 'dark',
    brand: '#D9743B',
    brandSoft: 'rgba(217,116,59,0.16)',
    brandContrast: '#12100E',
    accent: '#E9C68A',
    bg: '#100E0C',
    surface: '#1A1613',
    surfaceAlt: '#221D18',
    ink: '#F5EFE6',
    inkMuted: '#A3968A',
    line: 'rgba(245,239,230,0.12)',
    radius: '4px',
    radiusLg: '8px',
    displayFont: 'var(--font-fraunces)',
    bodyFont: 'var(--font-inter)',
    displayStyle: 'caps',
  },

  nav: [
    { label: 'Story', href: '#story' },
    { label: 'Menu', href: '#menu' },
    { label: 'Dishes', href: '#dishes' },
    { label: 'The Room', href: '#gallery' },
    { label: 'Chef', href: '#chef' },
    { label: 'Reviews', href: '#reviews' },
  ],

  cta: { label: 'Reserve a Table', short: 'Reserve' },

  contact: {
    phone: '+1 (503) 555-0147',
    email: 'reservations@emberandstone.demo',
    addressLines: ['1120 SE Water Avenue', 'Central Eastside, Portland, OR 97214'],
    mapHint: 'Corner of Water & Clay · Street parking after 18:00 · Bike racks at the door',
    socials: [
      { label: 'Instagram', icon: 'instagram' },
      { label: 'Facebook', icon: 'facebook' },
      { label: 'Twitter', icon: 'twitter' },
    ],
  },

  hours: {
    0: { open: '10:00', close: '15:00' },
    1: null,
    2: { open: '17:00', close: '22:00' },
    3: { open: '17:00', close: '22:00' },
    4: { open: '17:00', close: '23:00' },
    5: { open: '17:00', close: '23:30' },
    6: { open: '10:00', close: '23:30', breakFrom: '15:00', breakTo: '17:00' },
  },

  booking: {
    mode: 'table',
    steps: ['service', 'date', 'time', 'guests', 'details', 'confirm'],
    slotMinutes: 30,
    leadTimeHours: 2,
    horizonDays: 60,
    currency: 'USD',
    currencySymbol: '$',
    dateMode: 'single',
    labels: {
      service: 'Seating',
      servicePlural: 'Choose your seating',
      staff: 'Host',
      staffPlural: 'Choose your host',
      date: 'Date',
      time: 'Time',
      guests: 'Party size',
      customer: 'Your details',
      submit: 'Confirm reservation',
      successTitle: 'Table reserved',
      successText:
        'We hold your table for 15 minutes past the booking time. If you are running late, call us — we would rather know.',
    },
    guests: {
      min: 1,
      max: 10,
      label: 'Party size',
      helper: 'Parties of 8 or more are seated at the long oak table.',
    },
    notesPlaceholder: 'Allergies, celebrations, or a seat you love…',
  },

  services: [
    {
      id: 'dinner',
      name: 'Dinner Service',
      description:
        'The full à la carte room. Two and a half hours, whatever you feel like ordering, cooked over oak.',
      durationMin: 150,
      price: 0,
      icon: 'utensils',
      image: m.g5,
      badge: 'Most booked',
      highlights: ['À la carte', '2.5 hours', 'Main dining room'],
    },
    {
      id: 'counter',
      name: 'The Chef’s Counter',
      description:
        'Eight stools facing the fire. A twelve-course tasting menu served by the cooks who made it.',
      durationMin: 180,
      price: 145,
      icon: 'flame',
      image: m.focus,
      badge: 'Signature',
      highlights: ['12 courses', '8 seats only', 'Wine pairing available'],
    },
    {
      id: 'brunch',
      name: 'Weekend Brunch',
      description:
        'Saturdays and Sundays until three. Wood-fired eggs, cast-iron pastry and a serious bloody mary.',
      durationMin: 105,
      price: 0,
      icon: 'croissant',
      image: m.d5,
      highlights: ['Sat & Sun', 'Wood-fired eggs', 'Bottomless coffee'],
    },
    {
      id: 'private',
      name: 'Private Dining',
      description:
        'The stone room behind the kitchen: sixteen seats, your own service, and a menu written for the night.',
      durationMin: 240,
      price: 185,
      priceFrom: true,
      icon: 'crown',
      image: m.g2,
      highlights: ['Up to 16 guests', 'Bespoke menu', 'Private service'],
    },
  ],

  staff: [
    {
      id: 'rowan',
      name: 'Rowan Vance',
      role: 'Chef · Owner',
      bio: 'Cooked in Basque country for six years, then came home to Oregon to build a kitchen with no gas line in it. Everything here touches fire, or it does not go out.',
      image: m.p1,
      tags: ['Live fire', 'Menu'],
      rating: 5,
      experienceYears: 21,
    },
    {
      id: 'dahlia',
      name: 'Dahlia Okoro',
      role: 'Head Chef',
      bio: 'Runs the pass six nights a week and keeps the fire honest. Her ember-baked celeriac has been on the menu since opening night because guests refuse to let it leave.',
      image: m.p2,
      tags: ['Pass', 'Vegetables'],
      rating: 5,
      experienceYears: 12,
    },
    {
      id: 'noel',
      name: 'Noel Barrett',
      role: 'Maître d’ · Wine',
      bio: 'Keeps 300 bins in his head and will find you something you have never heard of for forty dollars.',
      image: m.p3,
      tags: ['Wine', 'Front of house'],
      rating: 4.9,
      experienceYears: 16,
    },
  ],

  sections: [
    {
      id: 'hero',
      type: 'hero',
      variant: 'fullbleed',
      kicker: 'Live fire · Central Eastside, Portland',
      headline: ['Everything', 'touches fire.'],
      lead: 'No gas line. One oak-burning hearth, a charcoal grill and forty-four seats around them.',
      image: m.hero,
      secondaryImage: m.about,
      badges: ['Oak & charcoal only', '44 seats', 'Open Tue – Sun'],
      stats: [
        { value: '44', label: 'Seats' },
        { value: '12', label: 'Courses at the counter' },
        { value: '0', label: 'Gas burners' },
      ],
    },
    {
      id: 'ticker',
      type: 'marquee',
      items: [
        'Oak-fired hearth',
        'Whole-animal butchery',
        'Oregon coast seafood',
        'James Beard semifinalist 2025',
        'Natural wine cellar',
        'No gas, ever',
      ],
    },
    {
      id: 'story',
      type: 'split',
      variant: 'image-right',
      eyebrow: 'The story',
      title: 'We took the gas line out of the building.',
      text: 'It was the first thing we did and the reason for everything that followed. Cooking over live fire is slower, harder and completely unforgiving — you cannot turn it down, you can only move things closer or further away. Every cook here spends their first month doing nothing but learning to read the coals.',
      image: m.about,
      secondaryImage: m.focus,
      signature: 'Rowan Vance · Chef & Owner',
      stat: { value: '3 tons', label: 'of Oregon oak burned each year' },
      points: [
        { icon: 'flame', title: 'One hearth, one grill', text: 'Everything on the menu passes over one of the two.' },
        { icon: 'leaf', title: 'Farm-direct', text: 'Nine growers within 90 miles, named on the menu.' },
        { icon: 'wine', title: '300-bin cellar', text: 'Natural and low-intervention, Oregon-led.' },
      ],
    },
    {
      id: 'menu',
      type: 'menu',
      eyebrow: 'The menu',
      title: 'Written each morning, printed each afternoon',
      text: 'What follows is this week’s. It will have changed by the time you sit down, and that is the point.',
      groups: [
        {
          id: 'start',
          name: 'To begin',
          note: 'Meant for the middle of the table.',
          items: [
            {
              name: 'Hearth bread & cultured butter',
              description: 'Baked to order in the ash, sea salt, two-day butter.',
              price: 12,
              tags: ['v'],
            },
            {
              name: 'Ember-baked celeriac',
              description: 'Buried in coals for four hours, hazelnut, brown butter, aged sherry.',
              price: 19,
              tags: ['v', 'signature'],
            },
            {
              name: 'Coast oysters, oak-smoked',
              description: 'Netarts Bay, warm from the fire, apple and horseradish. Six pieces.',
              price: 26,
            },
            {
              name: 'Grilled bread & bone marrow',
              description: 'Marrow from the whole animal, parsley, pickled shallot, lemon.',
              price: 21,
            },
          ],
        },
        {
          id: 'fire',
          name: 'From the fire',
          note: 'Served whole, carved at the table where it makes sense.',
          items: [
            {
              name: 'Whole coastal rockfish',
              description: 'Grilled in a basket over oak, fennel, brown butter, charred lemon.',
              price: 58,
              tags: ['signature'],
            },
            {
              name: '45-day dry-aged ribeye',
              description: 'For two. Cascade beef, salt-crusted, rested over embers, bone jus.',
              price: 128,
              tags: ['for two'],
            },
            {
              name: 'Hearth-roasted lamb shoulder',
              description: 'Six hours beside the fire, smoked yogurt, green chilli, mint.',
              price: 62,
            },
            {
              name: 'Charred hispi cabbage',
              description: 'Split, grilled hard, fermented chilli butter, toasted seeds.',
              price: 24,
              tags: ['v'],
            },
            {
              name: 'Ash-baked potatoes',
              description: 'Cooked in the embers, crème fraîche, chive, black salt.',
              price: 14,
              tags: ['v'],
            },
          ],
        },
        {
          id: 'end',
          name: 'To finish',
          items: [
            {
              name: 'Burnt honey tart',
              description: 'Local honey caramelised over fire, crème fraîche ice cream.',
              price: 15,
              tags: ['signature'],
            },
            {
              name: 'Grilled stone fruit',
              description: 'Whatever is ripe this week, almond cream, sourdough crumb.',
              price: 14,
            },
            {
              name: 'Smoked chocolate cremoso',
              description: '70% Guittard, oak smoke, olive oil, sea salt.',
              price: 16,
            },
          ],
        },
      ],
    },
    {
      id: 'dishes',
      type: 'gallery',
      variant: 'grid',
      tone: 'alt',
      eyebrow: 'Signature',
      title: 'Six dishes that never leave',
      text: 'The menu changes weekly. These six survived every rewrite.',
      items: [
        { image: m.d1, caption: '45-day ribeye, for two' },
        { image: m.d2, caption: 'Hearth-roasted lamb shoulder' },
        { image: m.d3, caption: 'Whole coastal rockfish' },
        { image: m.d4, caption: 'Hand-rolled pasta, ember butter' },
        { image: m.d5, caption: 'The board, before dinner' },
        { image: m.d6, caption: 'Burnt honey tart' },
      ],
    },
    {
      id: 'gallery',
      type: 'gallery',
      variant: 'strip',
      eyebrow: 'The room',
      title: 'Forty-four seats around a fire',
      items: [
        { image: m.g4, caption: 'The hearth' },
        { image: m.g3, caption: 'Open kitchen' },
        { image: m.g5, caption: 'Dining room' },
        { image: m.g1, caption: 'The bar' },
        { image: m.g2, caption: 'The stone room' },
        { image: m.g6, caption: 'Pastry pass' },
      ],
    },
    {
      id: 'chef',
      type: 'split',
      variant: 'image-left',
      tone: 'contrast',
      eyebrow: 'The chef',
      title: 'Rowan Vance',
      text: 'Six years in Getaria watching people cook turbot over coals with nothing but a basket and their judgement. Rowan came back to Portland convinced that a kitchen does not need a single dial on it. Ember & Stone opened eighteen months later with a hearth, a grill and no gas connection at all.',
      image: m.p1,
      secondaryImage: m.g3,
      signature: 'James Beard Award semifinalist, 2025',
      stat: { value: '21 yrs', label: 'cooking, six of them in Basque country' },
      points: [
        { icon: 'flame', title: 'Trained in Getaria', text: 'Basque coast, where the fish is grilled outside.' },
        { icon: 'award', title: 'Beard semifinalist', text: 'Best Chef: Northwest, 2025.' },
        { icon: 'users', title: 'Cooks the pass nightly', text: 'Six services a week, still at the fire.' },
      ],
    },
    {
      id: 'seatings',
      type: 'services',
      variant: 'editorial',
      eyebrow: 'Reservations',
      title: 'Four ways to eat here',
      text: 'Choose the room, then the night. The counter opens sixty days ahead and goes quickly.',
      showPrice: true,
    },
    {
      id: 'reviews',
      type: 'testimonials',
      variant: 'grid',
      eyebrow: 'Reviews',
      title: 'What people said',
      items: [
        {
          name: 'Marguerite Bell',
          role: 'Portland Monthly',
          quote:
            'The celeriac is a vegetable dish that people book a table for. That sentence should not be possible, and yet here we are.',
          rating: 5,
        },
        {
          name: 'Devon Achebe',
          role: 'Chef’s counter, twice',
          quote:
            'Twelve courses and I watched every one of them get made. Best three hours I have spent at a table.',
          rating: 5,
        },
        {
          name: 'Ilse Brandt',
          role: 'Regular since 2023',
          quote:
            'Noel has never once suggested a bottle I did not end up loving. I stopped reading the list two years ago.',
          rating: 5,
        },
        {
          name: 'Peter Nakamura',
          role: 'Private dining',
          quote:
            'Sixteen of us in the stone room, a menu written for the evening, and my father did not stop talking about it for a month.',
          rating: 5,
        },
      ],
    },
    {
      id: 'book',
      type: 'cta',
      title: 'The counter has eight seats. It fills first.',
      text: 'Reservations open sixty days ahead. Choose your seating, your night and your party size.',
      image: m.g4,
      note: 'Cancel free up to 24 hours before. No card required.',
    },
    {
      id: 'contact',
      type: 'contact',
      eyebrow: 'Find us',
      title: 'Central Eastside, Portland',
    },
  ],

  dashboard: {
    dailyVolume: 48,
    avgTicket: 96,
    customerLabel: 'Guest',
    customerLabelPlural: 'Guests',
  },
};
