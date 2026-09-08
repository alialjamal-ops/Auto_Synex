/**
 * Central media registry — every image URL used by the demos lives here.
 * Photos: StockSnap.io (CC0), self-hosted under `public/media/<demo>/` so the
 * demos load fast and keep working with no external dependency.
 * Swap a path here and it updates everywhere — nothing else hardcodes an image.
 */

export interface MediaAsset {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export const clinicMedia = {
  hero: { src: '/media/clinic/hero.jpg', width: 4128, height: 3096 },
  about: { src: '/media/clinic/about.jpg', width: 8688, height: 5792 },
  focus: { src: '/media/clinic/focus.jpg', width: 8688, height: 5792 },
  g1: { src: '/media/clinic/g1.jpg', width: 6082, height: 4054 },
  g2: { src: '/media/clinic/g2.jpg', width: 6720, height: 4480 },
  g3: { src: '/media/clinic/g3.jpg', width: 3888, height: 2592 },
  g4: { src: '/media/clinic/g4.jpg', width: 6082, height: 4054 },
  g5: { src: '/media/clinic/g5.jpg', width: 8688, height: 5792 },
  g6: { src: '/media/clinic/g6.jpg', width: 6720, height: 4480 },
  p1: { src: '/media/clinic/p1.jpg', width: 5792, height: 8688 },
  p2: { src: '/media/clinic/p2.jpg', width: 5792, height: 8688 },
  p3: { src: '/media/clinic/p3.jpg', width: 4391, height: 6586 },
  p4: { src: '/media/clinic/p4.jpg', width: 3840, height: 5760 },
} as const satisfies Record<string, MediaAsset>;

export const dentalMedia = {
  hero: { src: '/media/dental/hero.jpg', width: 4928, height: 3264 },
  about: { src: '/media/dental/about.jpg', width: 3888, height: 2592 },
  focus: { src: '/media/dental/focus.jpg', width: 4928, height: 3264 },
  g1: { src: '/media/dental/g1.jpg', width: 3888, height: 2592 },
  g2: { src: '/media/dental/g2.jpg', width: 3888, height: 2592 },
  g3: { src: '/media/dental/g3.jpg', width: 3888, height: 2592 },
  g4: { src: '/media/dental/g4.jpg', width: 3888, height: 2592 },
  g5: { src: '/media/dental/g5.jpg', width: 3888, height: 2592 },
  g6: { src: '/media/dental/g6.jpg', width: 4928, height: 3264 },
  smile1: { src: '/media/dental/smile1.jpg', width: 4000, height: 2667 },
  smile2: { src: '/media/dental/smile2.jpg', width: 5760, height: 3840 },
  smile3: { src: '/media/dental/smile3.jpg', width: 5184, height: 3456 },
  smile4: { src: '/media/dental/smile4.jpg', width: 5760, height: 3840 },
  p1: { src: '/media/dental/p1.jpg', width: 5792, height: 8688 },
  p2: { src: '/media/dental/p2.jpg', width: 5792, height: 8688 },
  p3: { src: '/media/dental/p3.jpg', width: 3840, height: 5760 },
} as const satisfies Record<string, MediaAsset>;

export const salonMedia = {
  hero: { src: '/media/salon/hero.jpg', width: 5760, height: 3840 },
  about: { src: '/media/salon/about.jpg', width: 5120, height: 3413 },
  focus: { src: '/media/salon/focus.jpg', width: 5760, height: 3840 },
  s1: { src: '/media/salon/s1.jpg', width: 8256, height: 5504 },
  s2: { src: '/media/salon/s2.jpg', width: 2000, height: 1333 },
  s3: { src: '/media/salon/s3.jpg', width: 5760, height: 3840 },
  s4: { src: '/media/salon/s4.jpg', width: 6016, height: 4016 },
  s5: { src: '/media/salon/s5.jpg', width: 4752, height: 3168 },
  s6: { src: '/media/salon/s6.jpg', width: 6000, height: 4000 },
  g1: { src: '/media/salon/g1.jpg', width: 5120, height: 2880 },
  g2: { src: '/media/salon/g2.jpg', width: 5120, height: 2880 },
  g3: { src: '/media/salon/g3.jpg', width: 4752, height: 3168 },
  g4: { src: '/media/salon/g4.jpg', width: 4752, height: 3168 },
  g5: { src: '/media/salon/g5.jpg', width: 4368, height: 2912 },
  g6: { src: '/media/salon/g6.jpg', width: 5688, height: 3797 },
  g7: { src: '/media/salon/g7.jpg', width: 5760, height: 3840 },
  g8: { src: '/media/salon/g8.jpg', width: 4016, height: 6016 },
  p1: { src: '/media/salon/p1.jpg', width: 2524, height: 3872 },
  p2: { src: '/media/salon/p2.jpg', width: 2524, height: 3872 },
  p3: { src: '/media/salon/p3.jpg', width: 4000, height: 6000 },
  p4: { src: '/media/salon/p4.jpg', width: 4000, height: 6000 },
} as const satisfies Record<string, MediaAsset>;

export const hotelMedia = {
  hero: { src: '/media/hotel/hero.jpg', width: 2000, height: 1500 },
  about: { src: '/media/hotel/about.jpg', width: 3200, height: 1803 },
  focus: { src: '/media/hotel/focus.jpg', width: 5184, height: 3888 },
  r1: { src: '/media/hotel/r1.jpg', width: 4804, height: 3207 },
  r2: { src: '/media/hotel/r2.jpg', width: 8192, height: 5464 },
  r3: { src: '/media/hotel/r3.jpg', width: 8192, height: 5464 },
  r4: { src: '/media/hotel/r4.jpg', width: 8192, height: 5464 },
  a1: { src: '/media/hotel/a1.jpg', width: 1545, height: 1024 },
  a2: { src: '/media/hotel/a2.jpg', width: 4016, height: 6016 },
  a3: { src: '/media/hotel/a3.jpg', width: 6016, height: 4016 },
  a4: { src: '/media/hotel/a4.jpg', width: 5472, height: 3648 },
  g1: { src: '/media/hotel/g1.jpg', width: 4019, height: 2778 },
  g2: { src: '/media/hotel/g2.jpg', width: 4608, height: 3072 },
  g3: { src: '/media/hotel/g3.jpg', width: 3471, height: 2314 },
  g4: { src: '/media/hotel/g4.jpg', width: 8192, height: 5464 },
  g5: { src: '/media/hotel/g5.jpg', width: 5760, height: 3840 },
  g6: { src: '/media/hotel/g6.jpg', width: 4804, height: 3207 },
  p1: { src: '/media/hotel/p1.jpg', width: 5760, height: 3840 },
  p2: { src: '/media/hotel/p2.jpg', width: 3840, height: 5760 },
} as const satisfies Record<string, MediaAsset>;

export const restaurantMedia = {
  hero: { src: '/media/restaurant/hero.jpg', width: 2480, height: 1358 },
  about: { src: '/media/restaurant/about.jpg', width: 5988, height: 3513 },
  focus: { src: '/media/restaurant/focus.jpg', width: 5184, height: 3456 },
  d1: { src: '/media/restaurant/d1.jpg', width: 4928, height: 3264 },
  d2: { src: '/media/restaurant/d2.jpg', width: 3000, height: 2000 },
  d3: { src: '/media/restaurant/d3.jpg', width: 2592, height: 3872 },
  d4: { src: '/media/restaurant/d4.jpg', width: 3264, height: 4928 },
  d5: { src: '/media/restaurant/d5.jpg', width: 5317, height: 3767 },
  d6: { src: '/media/restaurant/d6.jpg', width: 3633, height: 2725 },
  g1: { src: '/media/restaurant/g1.jpg', width: 3000, height: 2000 },
  g2: { src: '/media/restaurant/g2.jpg', width: 4460, height: 2973 },
  g3: { src: '/media/restaurant/g3.jpg', width: 4896, height: 3264 },
  g4: { src: '/media/restaurant/g4.jpg', width: 4592, height: 3448 },
  g5: { src: '/media/restaurant/g5.jpg', width: 4806, height: 3204 },
  g6: { src: '/media/restaurant/g6.jpg', width: 2513, height: 1670 },
  p1: { src: '/media/restaurant/p1.jpg', width: 2574, height: 3861 },
  p2: { src: '/media/restaurant/p2.jpg', width: 2091, height: 3137 },
  p3: { src: '/media/restaurant/p3.jpg', width: 6720, height: 4480 },
} as const satisfies Record<string, MediaAsset>;

export const media = {
  clinic: clinicMedia,
  dental: dentalMedia,
  salon: salonMedia,
  hotel: hotelMedia,
  restaurant: restaurantMedia,
} as const;
