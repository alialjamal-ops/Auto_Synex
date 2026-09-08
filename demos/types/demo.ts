import type { LucideIcon } from 'lucide-react';
import type { MediaAsset } from '@/config/media';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export type DemoSlug = 'clinic' | 'dental' | 'salon' | 'hotel' | 'restaurant';

/** Key of the curated icon map in `lib/icons.ts` — keeps configs data-only. */
export type IconName = string;

export interface ThemeTokens {
  /** 'dark' flips default surfaces and image overlays. */
  readonly mode: 'light' | 'dark';
  readonly brand: string;
  readonly brandSoft: string;
  readonly brandContrast: string;
  readonly accent: string;
  readonly bg: string;
  readonly surface: string;
  readonly surfaceAlt: string;
  readonly ink: string;
  readonly inkMuted: string;
  readonly line: string;
  readonly radius: string;
  readonly radiusLg: string;
  /** CSS variable produced by next/font, e.g. `var(--font-playfair)`. */
  readonly displayFont: string;
  readonly bodyFont: string;
  /** Personality applied to display headings. */
  readonly displayStyle: 'tight' | 'airy' | 'italic' | 'caps';
}

/* ------------------------------------------------------------------ */
/* Business data                                                       */
/* ------------------------------------------------------------------ */

export interface ServiceItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly durationMin: number;
  readonly price: number;
  /** Renders as "from X" when true. */
  readonly priceFrom?: boolean;
  readonly icon?: IconName;
  readonly image?: MediaAsset;
  readonly badge?: string;
  readonly highlights?: readonly string[];
  /** Restricts which staff can deliver this service. */
  readonly staffIds?: readonly string[];
}

export interface StaffItem {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly image: MediaAsset;
  readonly tags?: readonly string[];
  readonly rating?: number;
  readonly experienceYears?: number;
  /** Weekdays (0 = Sunday) this member works. Defaults to business hours. */
  readonly workdays?: readonly number[];
}

export interface TestimonialItem {
  readonly name: string;
  readonly role: string;
  readonly quote: string;
  readonly rating: number;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export interface StatItem {
  readonly value: string;
  readonly label: string;
  readonly suffix?: string;
}

export interface FeatureItem {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
}

export interface GalleryItem {
  readonly image: MediaAsset;
  readonly caption: string;
  readonly span?: 'normal' | 'tall' | 'wide';
}

export interface MenuEntry {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly tags?: readonly string[];
}

export interface MenuGroup {
  readonly id: string;
  readonly name: string;
  readonly note?: string;
  readonly items: readonly MenuEntry[];
}

export interface MembershipTier {
  readonly name: string;
  readonly price: number;
  readonly period: string;
  readonly summary: string;
  readonly perks: readonly string[];
  readonly featured?: boolean;
}

export interface BeforeAfterItem {
  readonly title: string;
  readonly note: string;
  readonly before: MediaAsset;
  readonly after: MediaAsset;
}

/* ------------------------------------------------------------------ */
/* Opening hours + booking                                             */
/* ------------------------------------------------------------------ */

/** Times are "HH:mm" in the venue's local time. */
export interface DayHours {
  readonly open: string;
  readonly close: string;
  /** Optional break that removes slots from the middle of the day. */
  readonly breakFrom?: string;
  readonly breakTo?: string;
}

/** `null` = closed on that weekday (0 = Sunday). */
export type WorkingHours = Readonly<Record<number, DayHours | null>>;

export type BookingStepId =
  | 'service'
  | 'staff'
  | 'date'
  | 'time'
  | 'guests'
  | 'details'
  | 'confirm';

export interface BookingSettings {
  readonly mode: 'appointment' | 'stay' | 'table';
  readonly steps: readonly BookingStepId[];
  /** Minutes between two slot start times. */
  readonly slotMinutes: number;
  /** Earliest bookable moment, in hours from now. */
  readonly leadTimeHours: number;
  /** How many days ahead the calendar opens. */
  readonly horizonDays: number;
  readonly currency: string;
  readonly currencySymbol: string;
  /** 'range' turns the date step into a check-in / check-out picker. */
  readonly dateMode: 'single' | 'range';
  readonly labels: {
    readonly service: string;
    readonly servicePlural: string;
    readonly staff: string;
    readonly staffPlural: string;
    readonly date: string;
    readonly time: string;
    readonly guests: string;
    readonly customer: string;
    readonly submit: string;
    readonly successTitle: string;
    readonly successText: string;
  };
  readonly guests?: {
    readonly min: number;
    readonly max: number;
    readonly label: string;
    readonly helper: string;
  };
  readonly notesPlaceholder: string;
}

/* ------------------------------------------------------------------ */
/* Sections (discriminated union → SectionRenderer)                    */
/* ------------------------------------------------------------------ */

export interface SectionBase {
  /** Anchor id — also used by the navbar links. */
  readonly id: string;
  readonly eyebrow?: string;
  readonly title?: string;
  readonly text?: string;
  readonly tone?: 'default' | 'alt' | 'contrast';
}

export type HeroVariant = 'split' | 'centered' | 'editorial' | 'cinematic' | 'fullbleed';

export interface HeroSection extends SectionBase {
  readonly type: 'hero';
  readonly variant: HeroVariant;
  readonly kicker: string;
  readonly headline: readonly string[];
  readonly lead: string;
  readonly image: MediaAsset;
  readonly secondaryImage?: MediaAsset;
  readonly badges?: readonly string[];
  readonly stats?: readonly StatItem[];
}

export interface StatsSection extends SectionBase {
  readonly type: 'stats';
  readonly items: readonly StatItem[];
}

export interface SplitSection extends SectionBase {
  readonly type: 'split';
  readonly variant: 'image-right' | 'image-left' | 'stacked';
  readonly image: MediaAsset;
  readonly secondaryImage?: MediaAsset;
  readonly points?: readonly FeatureItem[];
  readonly signature?: string;
  readonly stat?: StatItem;
}

export interface FeatureGridSection extends SectionBase {
  readonly type: 'features';
  readonly variant: 'cards' | 'numbered' | 'minimal';
  readonly items: readonly FeatureItem[];
}

export interface ServicesSection extends SectionBase {
  readonly type: 'services';
  readonly variant: 'cards' | 'list' | 'rooms' | 'editorial';
  /** Service ids to show, in order. Omit for all. */
  readonly include?: readonly string[];
  readonly showPrice?: boolean;
}

export interface StaffSection extends SectionBase {
  readonly type: 'staff';
  readonly variant: 'cards' | 'portrait' | 'editorial';
}

export interface GallerySection extends SectionBase {
  readonly type: 'gallery';
  readonly variant: 'masonry' | 'grid' | 'strip';
  readonly items: readonly GalleryItem[];
}

export interface TestimonialsSection extends SectionBase {
  readonly type: 'testimonials';
  readonly variant: 'carousel' | 'grid';
  readonly items: readonly TestimonialItem[];
}

export interface FaqSection extends SectionBase {
  readonly type: 'faq';
  readonly items: readonly FaqItem[];
}

export interface CtaSection extends SectionBase {
  readonly type: 'cta';
  readonly image?: MediaAsset;
  readonly note?: string;
}

export interface ContactSection extends SectionBase {
  readonly type: 'contact';
}

export interface BeforeAfterSection extends SectionBase {
  readonly type: 'beforeAfter';
  readonly items: readonly BeforeAfterItem[];
}

export interface MenuSection extends SectionBase {
  readonly type: 'menu';
  readonly groups: readonly MenuGroup[];
}

export interface MembershipSection extends SectionBase {
  readonly type: 'membership';
  readonly tiers: readonly MembershipTier[];
}

export interface MarqueeSection extends SectionBase {
  readonly type: 'marquee';
  readonly items: readonly string[];
}

export type Section =
  | HeroSection
  | StatsSection
  | SplitSection
  | FeatureGridSection
  | ServicesSection
  | StaffSection
  | GallerySection
  | TestimonialsSection
  | FaqSection
  | CtaSection
  | ContactSection
  | BeforeAfterSection
  | MenuSection
  | MembershipSection
  | MarqueeSection;

export type SectionType = Section['type'];

/* ------------------------------------------------------------------ */
/* Demo configuration                                                  */
/* ------------------------------------------------------------------ */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface DemoConfig {
  readonly slug: DemoSlug;
  readonly businessName: string;
  /** Short mark used in the logo lockup. */
  readonly logoMark: string;
  readonly industry: string;
  readonly tagline: string;
  readonly seo: {
    readonly title: string;
    readonly description: string;
    readonly keywords: readonly string[];
  };
  /** Copy for the demo selector card on `/`. */
  readonly card: {
    readonly title: string;
    readonly description: string;
    readonly features: readonly string[];
    readonly ctaLabel: string;
    readonly image: MediaAsset;
    readonly accent: string;
  };
  readonly theme: ThemeTokens;
  readonly nav: readonly NavLink[];
  readonly cta: { readonly label: string; readonly short: string };
  readonly contact: {
    readonly phone: string;
    readonly email: string;
    readonly addressLines: readonly string[];
    readonly mapHint: string;
    readonly socials: readonly { readonly label: string; readonly icon: IconName }[];
  };
  readonly hours: WorkingHours;
  readonly booking: BookingSettings;
  readonly services: readonly ServiceItem[];
  readonly staff: readonly StaffItem[];
  readonly sections: readonly Section[];
  readonly dashboard: {
    /** Baseline volume used by the deterministic mock generator. */
    readonly dailyVolume: number;
    readonly avgTicket: number;
    readonly customerLabel: string;
    readonly customerLabelPlural: string;
  };
}

export type IconRegistry = Readonly<Record<string, LucideIcon>>;
