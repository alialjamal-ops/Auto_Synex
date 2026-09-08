import { hotelMedia as m } from '@/config/media';
import type { DemoConfig } from '@/types/demo';

/**
 * NOIRÉ HOTEL — five-key luxury hotel.
 * Identity: cinematic night. Near-black surfaces, brushed gold, high-contrast serif.
 * Booking runs in `stay` mode: room → dates → guests → details.
 */
export const hotelDemo: DemoConfig = {
  slug: 'hotel',
  businessName: 'Noiré',
  logoMark: 'N',
  industry: 'Luxury Hotel',
  tagline: 'A quieter kind of luxury.',

  seo: {
    title: 'Noiré Hotel — Rooms, Suites & Reservations',
    description:
      'Noiré is a 42-key luxury hotel with sea-facing suites, a spa, a chef-led restaurant and direct online reservations.',
    keywords: ['luxury hotel', 'boutique hotel', 'suites', 'spa hotel', 'hotel booking'],
  },

  card: {
    title: 'Luxury Hotel',
    description:
      'A cinematic dark hotel site with room types, nightly pricing and a full check-in / check-out reservation flow.',
    features: ['Full-screen hero', 'Room & suite pricing', 'Date-range booking', 'Reservations desk'],
    ctaLabel: 'View Hotel Demo',
    image: m.hero,
    accent: '#C8A96A',
  },

  theme: {
    mode: 'dark',
    brand: '#C8A96A',
    brandSoft: 'rgba(200,169,106,0.14)',
    brandContrast: '#0B0B0C',
    accent: '#E7D8B4',
    bg: '#0A0A0B',
    surface: '#131315',
    surfaceAlt: '#1B1B1E',
    ink: '#F3F0EA',
    inkMuted: '#A09B92',
    line: 'rgba(243,240,234,0.12)',
    radius: '2px',
    radiusLg: '4px',
    displayFont: 'var(--font-playfair)',
    bodyFont: 'var(--font-inter)',
    displayStyle: 'airy',
  },

  nav: [
    { label: 'The Hotel', href: '#about' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Dining', href: '#dining' },
    { label: 'Experiences', href: '#experiences' },
  ],

  cta: { label: 'Reserve Your Stay', short: 'Reserve' },

  contact: {
    phone: '+351 21 555 0190',
    email: 'reservations@noirehotel.demo',
    addressLines: ['Rua do Alecrim 88', 'Chiado, 1200-018 Lisbon, Portugal'],
    mapHint: 'Reception open 24 hours · Airport transfer 25 minutes · Valet parking',
    socials: [
      { label: 'Instagram', icon: 'instagram' },
      { label: 'Facebook', icon: 'facebook' },
      { label: 'LinkedIn', icon: 'linkedin' },
    ],
  },

  hours: {
    0: { open: '07:00', close: '23:00' },
    1: { open: '07:00', close: '23:00' },
    2: { open: '07:00', close: '23:00' },
    3: { open: '07:00', close: '23:00' },
    4: { open: '07:00', close: '23:00' },
    5: { open: '07:00', close: '23:59' },
    6: { open: '07:00', close: '23:59' },
  },

  booking: {
    mode: 'stay',
    steps: ['service', 'date', 'guests', 'details', 'confirm'],
    slotMinutes: 60,
    leadTimeHours: 4,
    horizonDays: 180,
    currency: 'EUR',
    currencySymbol: '€',
    dateMode: 'range',
    labels: {
      service: 'Room',
      servicePlural: 'Choose your room',
      staff: 'Host',
      staffPlural: 'Choose your host',
      date: 'Dates',
      time: 'Arrival',
      guests: 'Guests',
      customer: 'Guest details',
      submit: 'Confirm reservation',
      successTitle: 'Reservation confirmed',
      successText:
        'Your suite is held. Check-in from 15:00, check-out until 12:00, and the concierge will be in touch before you arrive.',
    },
    guests: {
      min: 1,
      max: 6,
      label: 'Guests',
      helper: 'Children under 12 stay free in existing bedding.',
    },
    notesPlaceholder: 'Arrival time, dietary needs, celebrations we should know about…',
  },

  services: [
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      description:
        '32m² of quiet on the courtyard side, with a walk-in rain shower and a bed you will describe to people later.',
      durationMin: 1440,
      price: 280,
      icon: 'bed',
      image: m.r1,
      highlights: ['32 m²', 'Courtyard view', 'King bed', 'Rain shower'],
    },
    {
      id: 'premier',
      name: 'Premier River View',
      description:
        'A corner room facing the Tagus, with a reading chair positioned exactly where the light lands at six.',
      durationMin: 1440,
      price: 390,
      icon: 'sun',
      image: m.r2,
      badge: 'Most booked',
      highlights: ['41 m²', 'River view', 'Corner windows', 'Nespresso bar'],
    },
    {
      id: 'suite',
      name: 'Noiré Suite',
      description:
        'Separate living room, freestanding bath and a private terrace above the rooftops of Chiado.',
      durationMin: 1440,
      price: 620,
      icon: 'crown',
      image: m.r3,
      badge: 'Signature',
      highlights: ['68 m²', 'Private terrace', 'Freestanding bath', 'Butler service'],
    },
    {
      id: 'penthouse',
      name: 'The Penthouse',
      description:
        'The whole top floor: two bedrooms, a kitchen nobody uses, and the best view in the building.',
      durationMin: 1440,
      price: 1150,
      priceFrom: true,
      icon: 'gem',
      image: m.r4,
      highlights: ['128 m²', 'Two bedrooms', 'Panoramic terrace', 'Private check-in'],
    },
  ],

  staff: [
    {
      id: 'tomas',
      name: 'Tomás Ferreira',
      role: 'Head Concierge',
      bio: 'Twenty-two years in Lisbon hospitality and a contact list that opens most doors in the city, including a few that are technically closed.',
      image: m.p1,
      tags: ['Concierge', 'City access'],
      rating: 5,
      experienceYears: 22,
    },
    {
      id: 'ines',
      name: 'Inês Cardoso',
      role: 'Guest Relations Director',
      bio: 'Runs arrivals, celebrations and the small details that guests never quite manage to explain but always notice.',
      image: m.p2,
      tags: ['Guest relations', 'Events'],
      rating: 4.9,
      experienceYears: 14,
    },
  ],

  sections: [
    {
      id: 'hero',
      type: 'hero',
      variant: 'cinematic',
      kicker: 'Chiado · Lisbon',
      headline: ['A quieter kind', 'of luxury.'],
      lead: 'Forty-two keys above the old town. No lobby music, no queue at reception, and a terrace that makes the whole city look like it was arranged for you.',
      image: m.hero,
      secondaryImage: m.about,
      badges: ['42 keys', 'Michelin-listed restaurant', 'Rooftop spa'],
      stats: [
        { value: '42', label: 'Keys' },
        { value: '1878', label: 'The building' },
        { value: '4.9', label: 'Guest rating' },
      ],
    },
    {
      id: 'awards',
      type: 'marquee',
      items: [
        'Condé Nast Gold List',
        'Michelin Guide — Restaurant Vela',
        'Design Hotels Member',
        'Travel + Leisure It List',
        'Green Key Certified',
      ],
    },
    {
      id: 'about',
      type: 'split',
      variant: 'image-right',
      eyebrow: 'The hotel',
      title: 'An 1878 townhouse that took four years to become a hotel.',
      text: 'We kept the staircase, the tile, and the way the light comes across the courtyard at the end of the afternoon. Everything else — the rooms, the plumbing, the sound insulation you will notice at two in the morning — is entirely new. Forty-two keys was the largest number the building could hold without ruining it.',
      image: m.about,
      secondaryImage: m.focus,
      signature: 'Inês Cardoso · Guest Relations Director',
      stat: { value: '4 years', label: 'of restoration before we opened' },
      points: [
        {
          icon: 'moon',
          title: 'Silence, engineered',
          text: 'Triple glazing and 60mm acoustic floors throughout.',
        },
        {
          icon: 'compass',
          title: 'A concierge who lives here',
          text: 'Tomás has been opening doors in Lisbon for 22 years.',
        },
        {
          icon: 'leaf',
          title: 'Green Key certified',
          text: 'Rooftop water recovery and zero single-use plastic.',
        },
      ],
    },
    {
      id: 'rooms',
      type: 'services',
      variant: 'rooms',
      eyebrow: 'Rooms & suites',
      title: 'Four ways to stay',
      text: 'Rates are per night including breakfast, the rooftop spa and the late 12:00 check-out.',
      showPrice: true,
    },
    {
      id: 'amenities',
      type: 'features',
      variant: 'cards',
      tone: 'alt',
      eyebrow: 'Amenities',
      title: 'Everything, quietly available',
      items: [
        { icon: 'waves', title: 'Rooftop pool', text: 'Heated year-round, open until midnight.' },
        { icon: 'flower', title: 'Spa & hammam', text: 'Four treatment rooms and a marble hammam.' },
        { icon: 'utensils', title: 'Restaurant Vela', text: 'Michelin-listed, open to residents at any hour.' },
        { icon: 'dumbbell', title: '24h fitness studio', text: 'Technogym floor and two Peloton bikes.' },
        { icon: 'car', title: 'Valet & transfers', text: 'Airport in 25 minutes, car waiting on arrival.' },
        { icon: 'wifi', title: 'Fibre throughout', text: '1 Gb/s in every room, and it actually works.' },
        { icon: 'compass', title: 'Concierge desk', text: 'Reservations, tickets, and the unlisted places.' },
        { icon: 'paw', title: 'Pets welcome', text: 'Beds, bowls and a courtyard they can use.' },
      ],
    },
    {
      id: 'gallery',
      type: 'gallery',
      variant: 'masonry',
      eyebrow: 'The property',
      title: 'Look around',
      items: [
        { image: m.a1, caption: 'The rooftop pool', span: 'tall' },
        { image: m.g1, caption: 'Courtyard at dusk' },
        { image: m.g3, caption: 'The 1878 staircase', span: 'wide' },
        { image: m.a2, caption: 'Suite bathroom' },
        { image: m.a3, caption: 'The spa' },
        { image: m.g5, caption: 'Reading room' },
        { image: m.g4, caption: 'Pool terrace', span: 'tall' },
        { image: m.g6, caption: 'Premier river view' },
      ],
    },
    {
      id: 'dining',
      type: 'split',
      variant: 'image-left',
      tone: 'contrast',
      eyebrow: 'Dining',
      title: 'Restaurant Vela',
      text: 'Twenty-four covers, one seating, and a menu that changes when the market does. Chef Rui Almeida cooks the Atlantic — salt-baked robalo, percebes when they are good, and a bica you will think about on the flight home. Residents can eat at any hour; the kitchen simply stays awake.',
      image: m.a4,
      secondaryImage: m.g2,
      signature: 'Rui Almeida · Executive Chef',
      stat: { value: '24', label: 'covers, one seating a night' },
      points: [
        { icon: 'utensils', title: 'Michelin-listed', text: 'In the guide since our second year.' },
        { icon: 'wine', title: '400-bin cellar', text: 'Portuguese-led, with a serious Bairrada section.' },
        { icon: 'clock', title: 'Residents eat any hour', text: 'The kitchen does not close for guests.' },
      ],
    },
    {
      id: 'experiences',
      type: 'features',
      variant: 'numbered',
      eyebrow: 'Experiences',
      title: 'Arranged before you arrive',
      text: 'Tell the concierge at booking and it is waiting when you get here.',
      items: [
        {
          icon: 'plane',
          title: 'Sunrise over the Tagus',
          text: 'A private boat leaves at 06:20 with coffee and pastéis still warm. Ninety minutes, back before breakfast service ends.',
        },
        {
          icon: 'wine',
          title: 'Cellar dinner for six',
          text: 'The chef’s table underneath the restaurant, five courses, and whatever Rui feels like opening that night.',
        },
        {
          icon: 'music',
          title: 'Fado, properly',
          text: 'Not the tourist version — a back room in Alfama, two singers, and no menu in English.',
        },
        {
          icon: 'flower',
          title: 'The hammam ritual',
          text: 'Ninety minutes of marble, black soap and silence, followed by mint tea on the roof.',
        },
      ],
    },
    {
      id: 'reviews',
      type: 'testimonials',
      variant: 'carousel',
      eyebrow: 'Guests',
      title: 'What they wrote afterwards',
      items: [
        {
          name: 'Adrienne Vos',
          role: 'Noiré Suite · 4 nights',
          quote:
            'I have stayed in a lot of expensive hotels. This is the first one that felt like it was designed by someone who actually sleeps.',
          rating: 5,
        },
        {
          name: 'Hugo Almeida',
          role: 'Premier River View · 2 nights',
          quote:
            'Tomás got us into a restaurant that had been booked out for six weeks. He did not mention it, it was just on the itinerary in our room.',
          rating: 5,
        },
        {
          name: 'Sana Qureshi',
          role: 'The Penthouse · 6 nights',
          quote:
            'The terrace at sunset is worth the entire trip. We cancelled two days of plans and stayed on it.',
          rating: 5,
        },
        {
          name: 'Elliot Grange',
          role: 'Deluxe Room · 3 nights',
          quote:
            'Silent. Genuinely silent, in the middle of Chiado. I do not know how they did it and I did not ask.',
          rating: 5,
        },
      ],
    },
    {
      id: 'book',
      type: 'cta',
      title: 'Forty-two keys. Choose yours.',
      text: 'Live availability, best rate guaranteed, and no card charged until you arrive.',
      image: m.g4,
      note: 'Free cancellation up to 48 hours before check-in.',
    },
    {
      id: 'contact',
      type: 'contact',
      eyebrow: 'Getting here',
      title: 'Chiado, Lisbon',
    },
  ],

  dashboard: {
    dailyVolume: 18,
    avgTicket: 1180,
    customerLabel: 'Guest',
    customerLabelPlural: 'Guests',
  },
};
