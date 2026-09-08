import { dentalMedia as m } from '@/config/media';
import type { DemoConfig } from '@/types/demo';

/**
 * SMILEORA DENTAL — modern cosmetic + general dental practice.
 * Identity: clean clinical optimism. Azure and mint on cool white, geometric type.
 */
export const dentalDemo: DemoConfig = {
  slug: 'dental',
  businessName: 'Smileora Dental',
  logoMark: 'S',
  industry: 'Dental Clinic',
  tagline: 'The smile you keep catching yourself doing.',

  seo: {
    title: 'Smileora Dental — Implants, Veneers & Cosmetic Dentistry',
    description:
      'Smileora is a modern dental practice offering implants, veneers, whitening, orthodontics and general dentistry with digital scanning and online booking.',
    keywords: ['dentist', 'dental implants', 'veneers', 'teeth whitening', 'orthodontics'],
  },

  card: {
    title: 'Dental Clinic',
    description:
      'A bright cosmetic-dentistry site with treatment pages, a before/after comparison slider and instant booking.',
    features: ['Before / after slider', 'Treatment pricing', 'Dentist profiles', 'Online booking'],
    ctaLabel: 'View Dental Demo',
    image: m.hero,
    accent: '#0B7FD4',
  },

  theme: {
    mode: 'light',
    brand: '#0B7FD4',
    brandSoft: '#E4F1FB',
    brandContrast: '#FFFFFF',
    accent: '#12C2AE',
    bg: '#F7FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF3F8',
    ink: '#0A1B2A',
    inkMuted: '#5A6C7D',
    line: '#DEE7EE',
    radius: '16px',
    radiusLg: '32px',
    displayFont: 'var(--font-sora)',
    bodyFont: 'var(--font-inter)',
    displayStyle: 'tight',
  },

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Treatments', href: '#services' },
    { label: 'Results', href: '#results' },
    { label: 'Dentists', href: '#doctors' },
    { label: 'Clinic', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
  ],

  cta: { label: 'Book Appointment', short: 'Book' },

  contact: {
    phone: '+1 (312) 555-0188',
    email: 'hello@smileora.demo',
    addressLines: ['48 Lakeside Boulevard, Suite 900', 'River North, Chicago, IL 60654'],
    mapHint: 'Level 9 · Validated parking · Two blocks from Merchandise Mart',
    socials: [
      { label: 'Instagram', icon: 'instagram' },
      { label: 'Facebook', icon: 'facebook' },
      { label: 'YouTube', icon: 'youtube' },
    ],
  },

  hours: {
    0: null,
    1: { open: '09:00', close: '18:00', breakFrom: '13:00', breakTo: '13:45' },
    2: { open: '09:00', close: '18:00', breakFrom: '13:00', breakTo: '13:45' },
    3: { open: '09:00', close: '19:00', breakFrom: '13:00', breakTo: '13:45' },
    4: { open: '09:00', close: '19:00', breakFrom: '13:00', breakTo: '13:45' },
    5: { open: '09:00', close: '17:00' },
    6: { open: '10:00', close: '15:00' },
  },

  booking: {
    mode: 'appointment',
    steps: ['service', 'staff', 'date', 'time', 'details', 'confirm'],
    slotMinutes: 30,
    leadTimeHours: 2,
    horizonDays: 60,
    currency: 'USD',
    currencySymbol: '$',
    dateMode: 'single',
    labels: {
      service: 'Treatment',
      servicePlural: 'Choose a treatment',
      staff: 'Dentist',
      staffPlural: 'Choose your dentist',
      date: 'Date',
      time: 'Time',
      guests: 'Guests',
      customer: 'Your details',
      submit: 'Confirm appointment',
      successTitle: 'Appointment confirmed',
      successText:
        'We have emailed your confirmation and a digital intake form. Complete it before you arrive and you can walk straight in.',
    },
    notesPlaceholder: 'Anything we should know — anxiety, previous work, insurance provider…',
  },

  services: [
    {
      id: 'implants',
      name: 'Dental Implants',
      description:
        'Titanium implants placed with guided 3D surgery, restored with a hand-layered ceramic crown.',
      durationMin: 90,
      price: 2400,
      priceFrom: true,
      icon: 'zap',
      badge: 'Signature',
      highlights: ['Guided 3D surgery', 'Lifetime warranty', 'Sedation available'],
      staffIds: ['idris', 'sofia'],
    },
    {
      id: 'cosmetic',
      name: 'Cosmetic Dentistry',
      description:
        'Full smile design: digital preview first, so you approve the result before we touch a tooth.',
      durationMin: 60,
      price: 850,
      priceFrom: true,
      icon: 'sparkles',
      highlights: ['Digital smile preview', 'Trial smile fitting', 'Bespoke shade matching'],
      staffIds: ['sofia', 'elena'],
    },
    {
      id: 'whitening',
      name: 'Teeth Whitening',
      description:
        'In-chair whitening with enamel-safe gel — six to eight shades in a single 45-minute visit.',
      durationMin: 45,
      price: 390,
      icon: 'smile',
      badge: 'Most booked',
      highlights: ['6–8 shades lighter', 'Low sensitivity gel', 'Top-up trays included'],
      staffIds: ['sofia', 'elena', 'idris'],
    },
    {
      id: 'orthodontics',
      name: 'Orthodontics',
      description:
        'Clear aligners and discreet ceramic braces, planned from a single intraoral scan.',
      durationMin: 60,
      price: 3200,
      priceFrom: true,
      icon: 'activity',
      highlights: ['Clear aligners', 'Monthly monitoring', 'Retainers included'],
      staffIds: ['elena'],
    },
    {
      id: 'veneers',
      name: 'Porcelain Veneers',
      description:
        'Ultra-thin, minimal-prep porcelain veneers layered by our in-house ceramist.',
      durationMin: 90,
      price: 1150,
      priceFrom: true,
      icon: 'gem',
      highlights: ['Minimal preparation', 'In-house ceramist', '10-year guarantee'],
      staffIds: ['sofia'],
    },
    {
      id: 'general',
      name: 'General Dentistry',
      description:
        'Examination, hygiene, fillings and preventive care — the unglamorous work that keeps everything else unnecessary.',
      durationMin: 45,
      price: 160,
      icon: 'shield',
      highlights: ['Digital X-rays included', 'Hygiene appointment', 'Preventive plan'],
      staffIds: ['idris', 'elena', 'sofia'],
    },
    {
      id: 'emergency',
      name: 'Emergency Visit',
      description:
        'Pain, breakage or a lost crown — same-day slots reserved every morning and afternoon.',
      durationMin: 30,
      price: 220,
      icon: 'flame',
      highlights: ['Same-day slots', 'Pain relief first', 'Direct dentist line'],
      staffIds: ['idris', 'elena'],
    },
    {
      id: 'kids',
      name: 'Children’s Dentistry',
      description:
        'Gentle check-ups, fluoride and fissure sealants in a room built for small humans.',
      durationMin: 30,
      price: 110,
      icon: 'baby',
      highlights: ['Fear-free approach', 'Fluoride & sealants', 'Parent in the room'],
      staffIds: ['elena'],
    },
  ],

  staff: [
    {
      id: 'idris',
      name: 'Dr. Idris Fontaine',
      role: 'Principal Dentist · Implantology',
      bio: 'Has placed over 4,000 implants and teaches guided surgery to postgraduate dentists. Known for finishing early and explaining everything twice.',
      image: m.p1,
      tags: ['Implants', 'Oral surgery'],
      rating: 4.9,
      experienceYears: 19,
      workdays: [1, 2, 3, 4, 5],
    },
    {
      id: 'sofia',
      name: 'Dr. Sofia Marchetti',
      role: 'Cosmetic & Restorative Dentist',
      bio: 'Trained in Milan and Boston, Sofia designs every smile digitally before a single tooth is prepared — you approve the preview first.',
      image: m.p2,
      tags: ['Veneers', 'Smile design'],
      rating: 5,
      experienceYears: 13,
      workdays: [1, 2, 3, 4, 6],
    },
    {
      id: 'elena',
      name: 'Dr. Elena Park',
      role: 'Orthodontist & Family Dentistry',
      bio: 'Specialist orthodontist with a soft spot for nervous patients and a waiting list of teenagers who actually enjoy their appointments.',
      image: m.p3,
      tags: ['Aligners', 'Children'],
      rating: 4.9,
      experienceYears: 10,
      workdays: [2, 3, 4, 5, 6],
    },
  ],

  sections: [
    {
      id: 'hero',
      type: 'hero',
      variant: 'centered',
      kicker: 'Cosmetic & general dentistry · Chicago',
      headline: ['A smile that', 'looks like you,', 'only rested.'],
      lead: 'Digital smile design, guided implant surgery and genuinely painless hygiene — in a practice that runs on time and shows you the price first.',
      image: m.hero,
      secondaryImage: m.about,
      badges: ['Digital scanning', 'Sedation available', 'Fixed pricing'],
      stats: [
        { value: '4,000+', label: 'Implants placed' },
        { value: '12k', label: 'Smiles treated' },
        { value: '4.9', label: 'Patient rating' },
      ],
    },
    {
      id: 'stats',
      type: 'stats',
      items: [
        { value: '45', label: 'Minutes to a brighter smile' },
        { value: '0', label: 'Hidden fees, ever' },
        { value: '10yr', label: 'Guarantee on veneers' },
        { value: '98%', label: 'Would recommend us' },
      ],
    },
    {
      id: 'about',
      type: 'split',
      variant: 'image-left',
      eyebrow: 'The practice',
      title: 'We removed the three things people hate about the dentist.',
      text: 'The uncertainty, the waiting and the bill you did not expect. Every treatment starts with a scan and a digital preview, every price is fixed before you sit down, and every appointment is scheduled with enough room to finish properly.',
      image: m.about,
      secondaryImage: m.focus,
      signature: 'Dr. Idris Fontaine · Principal Dentist',
      stat: { value: '4 min', label: 'average wait past appointment time' },
      points: [
        {
          icon: 'eye',
          title: 'See it before we do it',
          text: 'A 3D preview of your result, approved by you first.',
        },
        {
          icon: 'shield',
          title: 'Fixed, published prices',
          text: 'The quote you get is the invoice you pay.',
        },
        {
          icon: 'moon',
          title: 'Comfort options as standard',
          text: 'Numbing gel, noise-cancelling headphones, sedation on request.',
        },
      ],
    },
    {
      id: 'services',
      type: 'services',
      variant: 'cards',
      eyebrow: 'Treatments',
      title: 'What we do, and what it costs',
      text: 'Six core treatments plus emergency and children’s care. Every price includes the consultation, the scan and the aftercare visit.',
      showPrice: true,
    },
    {
      id: 'results',
      type: 'beforeAfter',
      eyebrow: 'Before / after',
      title: 'Real treatment timelines',
      text: 'Drag the handle to compare. Every case shown was completed in our Chicago practice.',
      items: [
        {
          title: 'Porcelain veneers · upper arch',
          note: '8 veneers · 3 visits · 11 days',
          before: m.smile1,
          after: m.smile2,
        },
        {
          title: 'Whitening + composite bonding',
          note: '1 visit · 90 minutes',
          before: m.smile3,
          after: m.smile4,
        },
        {
          title: 'Clear aligner treatment',
          note: '14 months · 26 aligners',
          before: m.smile2,
          after: m.smile1,
        },
      ],
    },
    {
      id: 'doctors',
      type: 'staff',
      variant: 'portrait',
      eyebrow: 'Your dentists',
      title: 'Three specialists, one practice',
      text: 'Pick who treats you when you book — and stay with them through every visit.',
    },
    {
      id: 'why',
      type: 'features',
      variant: 'minimal',
      tone: 'alt',
      eyebrow: 'Why Smileora',
      title: 'The details that make the difference',
      items: [
        {
          icon: 'zap',
          title: 'Guided 3D surgery',
          text: 'Implants placed through a printed surgical guide — faster, quieter, and accurate to a fraction of a millimetre.',
        },
        {
          icon: 'palette',
          title: 'In-house ceramist',
          text: 'Your veneers are layered by hand in our own lab, so shade matching happens in the same building as you.',
        },
        {
          icon: 'clock',
          title: 'Appointments that end on time',
          text: 'We book 45-minute hygiene visits because 30 was never actually enough.',
        },
        {
          icon: 'heart',
          title: 'Built for nervous patients',
          text: 'Tell us at booking and we adjust the whole visit — slower pace, stop signals, sedation if you want it.',
        },
      ],
    },
    {
      id: 'gallery',
      type: 'gallery',
      variant: 'grid',
      eyebrow: 'The clinic',
      title: 'Nine floors up, with the lake in the window',
      items: [
        { image: m.g1, caption: 'Treatment suite 01' },
        { image: m.g2, caption: 'Digital scanning bay' },
        { image: m.g3, caption: 'Hygiene room' },
        { image: m.g4, caption: 'Surgery suite' },
        { image: m.g5, caption: 'Consultation room' },
        { image: m.g6, caption: 'Reception lounge' },
      ],
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      variant: 'grid',
      eyebrow: 'Reviews',
      title: 'What patients tell us',
      items: [
        {
          name: 'Priya Raman',
          role: 'Veneers patient',
          quote:
            'I saw the digital preview and cried a little. The real thing looked exactly like it. Exactly.',
          rating: 5,
        },
        {
          name: 'Tom Ashby',
          role: 'Implant patient',
          quote:
            'I have avoided dentists for eleven years. Dr. Fontaine got me through a full implant without a single bad moment.',
          rating: 5,
        },
        {
          name: 'Grace Molnar',
          role: 'Aligners patient',
          quote:
            'Fourteen months, zero drama, and the app told me exactly where I was in the plan the whole way.',
          rating: 5,
        },
        {
          name: 'Kofi Mensah',
          role: 'Whitening patient',
          quote:
            'Booked at midnight, seen at nine the next morning. Whole thing took less time than my commute.',
          rating: 5,
        },
      ],
    },
    {
      id: 'faq',
      type: 'faq',
      eyebrow: 'Questions',
      title: 'The things people ask first',
      items: [
        {
          q: 'Does it hurt?',
          a: 'We use topical numbing gel before any injection, and warmed anaesthetic delivered slowly. Most patients describe implant surgery as pressure rather than pain. Sedation is available for any treatment on request.',
        },
        {
          q: 'How much do implants really cost?',
          a: 'A single implant with a ceramic crown starts at $2,400 and that figure includes the 3D scan, the surgical guide, the implant, the crown and every follow-up visit. Full-arch cases are quoted after your consultation.',
        },
        {
          q: 'Can I see the result before committing?',
          a: 'Yes — every cosmetic case starts with an intraoral scan and a digital preview. For veneers we also fit a trial smile you can wear out of the practice before anything is made permanent.',
        },
        {
          q: 'Do you take insurance?',
          a: 'We accept all major dental plans and submit claims for you. For treatments not covered, we offer 0% financing over 6 or 12 months.',
        },
        {
          q: 'What if I have an emergency?',
          a: 'We hold same-day emergency slots every morning and afternoon. Book the Emergency Visit online, or call and we will fit you in.',
        },
        {
          q: 'How long do veneers last?',
          a: 'Our porcelain veneers carry a 10-year guarantee and typically last considerably longer with normal hygiene and a night guard if you grind.',
        },
      ],
    },
    {
      id: 'book',
      type: 'cta',
      title: 'Book in under two minutes.',
      text: 'Choose your treatment, pick your dentist, and take the slot that fits your week.',
      image: m.g2,
      note: 'Free rescheduling up to 24 hours before your appointment.',
    },
    {
      id: 'contact',
      type: 'contact',
      eyebrow: 'Find us',
      title: 'River North, Chicago',
    },
  ],

  dashboard: {
    dailyVolume: 22,
    avgTicket: 480,
    customerLabel: 'Patient',
    customerLabelPlural: 'Patients',
  },
};
