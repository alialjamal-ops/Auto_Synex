import { clinicMedia as m } from '@/config/media';
import type { DemoConfig } from '@/types/demo';

/**
 * VITA MEDICAL — premium multi-specialty clinic.
 * Identity: calm clinical luxury. Deep emerald, warm ivory, generous whitespace.
 */
export const clinicDemo: DemoConfig = {
  slug: 'clinic',
  businessName: 'Vita Medical',
  logoMark: 'V',
  industry: 'Medical Clinic',
  tagline: 'Precision medicine, delivered with unusual care.',

  seo: {
    title: 'Vita Medical — Private Multi-Specialty Clinic',
    description:
      'Vita Medical is a private multi-specialty clinic offering cardiology, dermatology, neurology and executive health programmes with same-week appointments.',
    keywords: ['private clinic', 'medical centre', 'cardiology', 'executive health', 'book doctor'],
  },

  card: {
    title: 'Medical Clinic',
    description:
      'A calm, trust-first clinical site with specialty pages, doctor profiles and a full appointment engine.',
    features: ['Doctor profiles', 'Specialty pages', 'Appointment booking', 'Practice dashboard'],
    ctaLabel: 'View Clinic Demo',
    image: m.hero,
    accent: '#0F6B5F',
  },

  theme: {
    mode: 'light',
    brand: '#0F6B5F',
    brandSoft: '#E8F2EF',
    brandContrast: '#FFFFFF',
    accent: '#0A4A42',
    bg: '#FBFAF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F1EA',
    ink: '#0D1B19',
    inkMuted: '#5C6B67',
    line: '#E5E3DB',
    radius: '14px',
    radiusLg: '28px',
    displayFont: 'var(--font-manrope)',
    bodyFont: 'var(--font-inter)',
    displayStyle: 'tight',
  },

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Specialties', href: '#specialties' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'Services', href: '#services' },
    { label: 'Clinic', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
  ],

  cta: { label: 'Book Appointment', short: 'Book' },

  contact: {
    phone: '+1 (415) 555-0142',
    email: 'care@vitamedical.demo',
    addressLines: ['210 Harbour View Avenue', 'Mission Bay, San Francisco, CA 94158'],
    mapHint: 'Two minutes from Mission Bay station · Underground parking for patients',
    socials: [
      { label: 'Instagram', icon: 'instagram' },
      { label: 'LinkedIn', icon: 'linkedin' },
      { label: 'Facebook', icon: 'facebook' },
    ],
  },

  hours: {
    0: null,
    1: { open: '08:00', close: '18:00', breakFrom: '13:00', breakTo: '14:00' },
    2: { open: '08:00', close: '18:00', breakFrom: '13:00', breakTo: '14:00' },
    3: { open: '08:00', close: '18:00', breakFrom: '13:00', breakTo: '14:00' },
    4: { open: '08:00', close: '18:00', breakFrom: '13:00', breakTo: '14:00' },
    5: { open: '08:00', close: '17:00', breakFrom: '13:00', breakTo: '14:00' },
    6: { open: '09:00', close: '14:00' },
  },

  booking: {
    mode: 'appointment',
    steps: ['service', 'staff', 'date', 'time', 'details', 'confirm'],
    slotMinutes: 30,
    leadTimeHours: 3,
    horizonDays: 45,
    currency: 'USD',
    currencySymbol: '$',
    dateMode: 'single',
    labels: {
      service: 'Service',
      servicePlural: 'Choose a service',
      staff: 'Doctor',
      staffPlural: 'Choose your doctor',
      date: 'Date',
      time: 'Time',
      guests: 'Guests',
      customer: 'Your details',
      submit: 'Confirm appointment',
      successTitle: 'Appointment confirmed',
      successText:
        'A confirmation has been sent to your email. Please arrive 10 minutes early with a photo ID.',
    },
    notesPlaceholder: 'Symptoms, referrals or anything the doctor should know in advance…',
  },

  services: [
    {
      id: 'consultation',
      name: 'General Consultation',
      description:
        'A 30-minute consultation with an internal medicine physician, including vitals and a written care plan.',
      durationMin: 30,
      price: 120,
      icon: 'stethoscope',
      badge: 'Most booked',
      highlights: ['Same-week availability', 'Written care plan', 'Digital prescription'],
      staffIds: ['amara', 'marcus', 'noor'],
    },
    {
      id: 'cardiology',
      name: 'Cardiology Assessment',
      description:
        'ECG, echocardiogram review and a cardiovascular risk profile interpreted by a consultant cardiologist.',
      durationMin: 60,
      price: 340,
      icon: 'heart',
      highlights: ['ECG + Echo review', 'Risk scoring', '48-hour report'],
      staffIds: ['julian'],
    },
    {
      id: 'dermatology',
      name: 'Dermatology & Skin',
      description:
        'Full-body dermoscopy, mole mapping and a personalised treatment plan for medical or aesthetic concerns.',
      durationMin: 45,
      price: 260,
      icon: 'sparkles',
      highlights: ['Digital dermoscopy', 'Mole mapping', 'Treatment plan'],
      staffIds: ['noor'],
    },
    {
      id: 'neurology',
      name: 'Neurology Consultation',
      description:
        'Assessment for headache, memory and nerve conditions with cognitive screening and imaging referral.',
      durationMin: 60,
      price: 380,
      icon: 'brain',
      highlights: ['Cognitive screening', 'Imaging referral', 'Follow-up included'],
      staffIds: ['marcus'],
    },
    {
      id: 'executive',
      name: 'Executive Health Screening',
      description:
        'A half-day programme: bloods, imaging, cardiology and a physician debrief in a single visit.',
      durationMin: 90,
      price: 890,
      priceFrom: true,
      icon: 'shield',
      badge: 'Signature',
      highlights: ['62-marker blood panel', 'Same-day results', 'Physician debrief'],
      staffIds: ['amara', 'julian'],
    },
    {
      id: 'pediatrics',
      name: 'Paediatric Care',
      description:
        'Growth, development and vaccination reviews in a room designed to keep children calm.',
      durationMin: 30,
      price: 140,
      icon: 'baby',
      highlights: ['Child-friendly rooms', 'Vaccination records', 'Parent guidance'],
      staffIds: ['amara'],
    },
    {
      id: 'imaging',
      name: 'Diagnostic Imaging',
      description:
        'Ultrasound and low-dose imaging performed on site, reported by a consultant radiologist.',
      durationMin: 45,
      price: 320,
      icon: 'microscope',
      highlights: ['On-site scanning', 'Consultant reporting', 'Results in 24h'],
      staffIds: ['julian', 'marcus'],
    },
    {
      id: 'nutrition',
      name: 'Metabolic & Nutrition',
      description:
        'Body composition analysis, metabolic bloods and a nutrition plan built around how you actually live.',
      durationMin: 45,
      price: 190,
      icon: 'salad',
      highlights: ['Body composition', 'Metabolic panel', '12-week plan'],
      staffIds: ['amara', 'noor'],
    },
  ],

  staff: [
    {
      id: 'amara',
      name: 'Dr. Amara Whitfield',
      role: 'Chief Medical Officer · Internal Medicine',
      bio: 'Eighteen years in internal medicine and preventive care. Amara built the Vita screening programme around one idea: find it early, explain it plainly.',
      image: m.p1,
      tags: ['Internal medicine', 'Preventive care'],
      rating: 4.9,
      experienceYears: 18,
      workdays: [1, 2, 3, 4, 6],
    },
    {
      id: 'julian',
      name: 'Dr. Julian Reyes',
      role: 'Consultant Cardiologist',
      bio: 'Interventional cardiologist with a research background in early risk detection. Publishes on cardiac imaging in asymptomatic adults.',
      image: m.p2,
      tags: ['Cardiology', 'Imaging'],
      rating: 4.8,
      experienceYears: 15,
      workdays: [1, 2, 3, 4, 5],
    },
    {
      id: 'marcus',
      name: 'Dr. Marcus Hale',
      role: 'Head of Neurology',
      bio: 'Neurologist specialising in headache disorders and cognitive health, with a calm, unhurried consultation style patients ask for by name.',
      image: m.p3,
      tags: ['Neurology', 'Cognitive health'],
      rating: 4.9,
      experienceYears: 22,
      workdays: [2, 3, 4, 5],
    },
    {
      id: 'noor',
      name: 'Dr. Noor Haddad',
      role: 'Dermatology & Aesthetics',
      bio: 'Dermatologist trained in London and Dubai, combining medical dermatology with restrained, natural-looking aesthetic work.',
      image: m.p4,
      tags: ['Dermatology', 'Aesthetics'],
      rating: 5,
      experienceYears: 11,
      workdays: [1, 3, 4, 5, 6],
    },
  ],

  sections: [
    {
      id: 'hero',
      type: 'hero',
      variant: 'split',
      kicker: 'Private multi-specialty clinic · San Francisco',
      headline: ['Medicine that', 'takes its time', 'with you.'],
      lead: 'Consultant-led care across cardiology, neurology, dermatology and preventive medicine — with appointments that start when they say they will.',
      image: m.hero,
      secondaryImage: m.focus,
      badges: ['Same-week appointments', 'Consultant-led', 'Results in 24–48h'],
      stats: [
        { value: '24', label: 'Consultants on staff' },
        { value: '18k', label: 'Patients cared for' },
        { value: '4.9', label: 'Average patient rating' },
      ],
    },
    {
      id: 'accreditations',
      type: 'marquee',
      items: [
        'Joint Commission Accredited',
        'ISO 9001 Certified Laboratory',
        'Royal College Affiliated',
        'HIPAA Compliant Records',
        'Consultant-Led Care',
        'Same-Week Appointments',
      ],
    },
    {
      id: 'about',
      type: 'split',
      variant: 'image-right',
      eyebrow: 'About Vita',
      title: 'A clinic built around the consultation, not the queue.',
      text: 'We cap each physician at twelve patients a day. That single decision changes everything downstream: appointments run to time, notes get written properly, and questions get answered in the room instead of over email three days later.',
      image: m.about,
      secondaryImage: m.g5,
      signature: 'Dr. Amara Whitfield · Chief Medical Officer',
      stat: { value: '12', label: 'patients per physician, per day' },
      points: [
        {
          icon: 'clock',
          title: 'Appointments that start on time',
          text: 'Our average start delay last quarter was four minutes.',
        },
        {
          icon: 'microscope',
          title: 'Diagnostics under one roof',
          text: 'Bloods, imaging and cardiac testing without a second trip.',
        },
        {
          icon: 'shield',
          title: 'One record, everywhere',
          text: 'Encrypted notes your specialists can all actually read.',
        },
      ],
    },
    {
      id: 'specialties',
      type: 'features',
      variant: 'cards',
      eyebrow: 'Specialties',
      title: 'Eight departments, one continuous record',
      text: 'Referrals inside Vita take minutes, not weeks — your consultants share the same notes, imaging and results.',
      items: [
        { icon: 'heart', title: 'Cardiology', text: 'ECG, echo and cardiovascular risk programmes.' },
        { icon: 'brain', title: 'Neurology', text: 'Headache, memory and nerve conditions.' },
        { icon: 'sparkles', title: 'Dermatology', text: 'Dermoscopy, mole mapping, medical skin care.' },
        { icon: 'baby', title: 'Paediatrics', text: 'Growth, development and vaccination reviews.' },
        { icon: 'salad', title: 'Metabolic health', text: 'Weight, diabetes and nutrition programmes.' },
        { icon: 'microscope', title: 'Diagnostics', text: 'On-site imaging and a same-day laboratory.' },
        { icon: 'activity', title: 'Physiotherapy', text: 'Post-operative and sports rehabilitation.' },
        { icon: 'shield', title: 'Preventive medicine', text: 'Executive screening and annual reviews.' },
      ],
    },
    {
      id: 'services',
      type: 'services',
      variant: 'cards',
      eyebrow: 'Services & pricing',
      title: 'Clear prices, published up front',
      text: 'Every consultation includes the written plan, the prescription and one follow-up message. No surprise line items.',
      showPrice: true,
    },
    {
      id: 'doctors',
      type: 'staff',
      variant: 'cards',
      eyebrow: 'Our consultants',
      title: 'The people you will actually see',
      text: 'You choose your consultant when you book — and you keep them for follow-ups.',
    },
    {
      id: 'why',
      type: 'features',
      variant: 'numbered',
      tone: 'contrast',
      eyebrow: 'Why Vita',
      title: 'Four things we refuse to compromise on',
      items: [
        {
          icon: 'clock',
          title: 'Time in the room',
          text: 'Thirty minutes minimum for a first consultation. Sixty for anything complex. We would rather run fewer clinics than shorter ones.',
        },
        {
          icon: 'microscope',
          title: 'Diagnostics on site',
          text: 'Bloods, ultrasound and cardiac testing happen in the building — most patients leave with results the same day.',
        },
        {
          icon: 'users',
          title: 'Continuity of care',
          text: 'The consultant you meet is the consultant who reviews your results and signs your plan.',
        },
        {
          icon: 'shield',
          title: 'Records you control',
          text: 'Encrypted, portable, and exportable in one click whenever you want a second opinion.',
        },
      ],
    },
    {
      id: 'gallery',
      type: 'gallery',
      variant: 'masonry',
      eyebrow: 'Inside the clinic',
      title: 'Designed to lower your heart rate',
      text: 'Natural light, quiet materials and no fluorescent waiting halls.',
      items: [
        { image: m.g1, caption: 'The waiting lounge', span: 'tall' },
        { image: m.g2, caption: 'Consultation wing' },
        { image: m.g6, caption: 'Patient consultation', span: 'wide' },
        { image: m.g3, caption: 'Examination suite' },
        { image: m.g4, caption: 'Day-care recovery' },
        { image: m.g5, caption: 'Nursing team' },
      ],
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      variant: 'carousel',
      eyebrow: 'Patient stories',
      title: 'What people say afterwards',
      items: [
        {
          name: 'Helena Barros',
          role: 'Executive screening patient',
          quote:
            'They found a thyroid issue two other clinics had missed, and I had the results and a plan before lunch. I have never been treated so seriously.',
          rating: 5,
        },
        {
          name: 'Daniel Okafor',
          role: 'Cardiology patient',
          quote:
            'Dr. Reyes drew my heart on a piece of paper and explained the whole thing. First time in twenty years anyone had done that.',
          rating: 5,
        },
        {
          name: 'Marie Lindqvist',
          role: 'Dermatology patient',
          quote:
            'Booked on a Sunday night, seen on Tuesday morning. The whole thing took four minutes on my phone.',
          rating: 5,
        },
        {
          name: 'Amir Rahman',
          role: 'Paediatrics parent',
          quote:
            'My daughter is terrified of clinics. She asked when we could go back. That is the entire review.',
          rating: 5,
        },
      ],
    },
    {
      id: 'faq',
      type: 'faq',
      eyebrow: 'Questions',
      title: 'Before you book',
      items: [
        {
          q: 'How quickly can I be seen?',
          a: 'Most consultations are available within three working days, and we hold a block of same-day slots each morning for urgent cases. The booking calendar shows live availability.',
        },
        {
          q: 'Do you work with insurance?',
          a: 'We are recognised by all major international insurers and can bill them directly. Self-paying patients see the full price before confirming — nothing is added afterwards.',
        },
        {
          q: 'Will I see the same doctor at follow-up?',
          a: 'Yes. You select your consultant when booking and the system keeps them assigned to your record for any follow-up appointments.',
        },
        {
          q: 'How fast do results come back?',
          a: 'Routine bloods and on-site imaging are reported within 24 hours. Specialist panels take 48. You are notified the moment they are signed off.',
        },
        {
          q: 'Do you see children?',
          a: 'We do — our paediatric team runs dedicated clinics with rooms designed for younger patients, including a separate quiet waiting area.',
        },
        {
          q: 'What if I need to reschedule?',
          a: 'Reschedule or cancel free of charge up to 12 hours before your appointment, directly from the confirmation email.',
        },
      ],
    },
    {
      id: 'book',
      type: 'cta',
      title: 'Your appointment takes about ninety seconds to book.',
      text: 'Pick a service, choose your consultant, and take the first slot that suits you. No account, no call-back queue.',
      image: m.g2,
      note: 'Free cancellation up to 12 hours before your visit.',
    },
    {
      id: 'contact',
      type: 'contact',
      eyebrow: 'Visit us',
      title: 'Mission Bay, San Francisco',
    },
  ],

  dashboard: {
    dailyVolume: 26,
    avgTicket: 245,
    customerLabel: 'Patient',
    customerLabelPlural: 'Patients',
  },
};
