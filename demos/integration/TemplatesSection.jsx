/**
 * Auto Synex — "Live Templates" section for the main marketing site.
 *
 * Drop-in for the Vite + Tailwind site at auto-synex-final.vercel.app.
 * Matches that site's design system: #0a1628 canvas, blue-500 → cyan-400
 * gradients, rounded-xl surfaces, white/10 glass, Poppins/Inter/Cairo.
 *
 * Usage — inside your page, after the Services section:
 *
 *   import TemplatesSection from './components/TemplatesSection';
 *   ...
 *   <TemplatesSection lang={lang} />        // lang: 'en' | 'ar'
 *
 * After the demos are deployed, set DEMOS_URL below to the live origin.
 */

const DEMOS_URL = 'https://auto-synex-demos.vercel.app';

const COPY = {
  en: {
    eyebrow: 'Live Templates',
    title: 'See it working before you buy it',
    lead: 'Every template below is a real, running product — not a screenshot. Click through the site, book an appointment, then open the dashboard and watch your booking appear.',
    site: 'Website',
    booking: 'Booking',
    dashboard: 'Dashboard',
    viewAll: 'Browse all templates',
    note: 'All demo businesses are fictional.',
  },
  ar: {
    eyebrow: 'قوالب حيّة',
    title: 'جرّبه قبل أن تشتريه',
    lead: 'كل قالب في الأسفل منتج حقيقي يعمل — وليس صورة. تصفّح الموقع، احجز موعدًا، ثم افتح لوحة التحكم وشاهد حجزك يظهر فيها.',
    site: 'الموقع',
    booking: 'الحجز',
    dashboard: 'لوحة التحكم',
    viewAll: 'تصفّح كل القوالب',
    note: 'جميع الأنشطة في القوالب افتراضية.',
  },
};

const TEMPLATES = [
  {
    slug: 'clinic',
    accent: 'from-emerald-500 to-teal-400',
    en: { kind: 'Medical Clinic', name: 'Vita Medical', text: 'Specialty pages, doctor profiles and consultant-level appointment booking.' },
    ar: { kind: 'عيادة طبية', name: 'Vita Medical', text: 'صفحات تخصصات وملفات أطباء ونظام حجز مواعيد كامل.' },
  },
  {
    slug: 'dental',
    accent: 'from-sky-500 to-cyan-400',
    en: { kind: 'Dental Clinic', name: 'Smileora Dental', text: 'Treatment pricing, a before/after comparison slider and instant booking.' },
    ar: { kind: 'عيادة أسنان', name: 'Smileora Dental', text: 'أسعار العلاجات، مقارنة قبل/بعد تفاعلية، وحجز فوري.' },
  },
  {
    slug: 'salon',
    accent: 'from-amber-500 to-orange-400',
    en: { kind: 'Beauty Salon', name: 'Lumé Beauty', text: 'Editorial layout, treatment menu, membership tiers and artist booking.' },
    ar: { kind: 'صالون تجميل', name: 'Lumé Beauty', text: 'تصميم تحريري، قائمة خدمات، باقات عضوية، وحجز حسب الفنانة.' },
  },
  {
    slug: 'hotel',
    accent: 'from-yellow-500 to-amber-300',
    en: { kind: 'Luxury Hotel', name: 'Noiré', text: 'Cinematic hero, room pricing and a check-in / check-out reservation flow.' },
    ar: { kind: 'فندق فاخر', name: 'Noiré', text: 'واجهة سينمائية، أسعار الغرف، وحجز بتاريخي الوصول والمغادرة.' },
  },
  {
    slug: 'restaurant',
    accent: 'from-orange-500 to-red-400',
    en: { kind: 'Restaurant', name: 'Ember & Stone', text: 'Full menu system, signature dishes and table reservations by party size.' },
    ar: { kind: 'مطعم', name: 'Ember & Stone', text: 'قائمة طعام كاملة، أطباق مميزة، وحجز طاولات حسب عدد الأشخاص.' },
  },
];

function ArrowIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export default function TemplatesSection({ lang = 'en' }) {
  const isAr = lang === 'ar';
  const t = COPY[isAr ? 'ar' : 'en'];

  return (
    <section id="templates" dir={isAr ? 'rtl' : 'ltr'} className="relative py-24 overflow-hidden">
      {/* ambient glow, same idiom as the hero */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-blue-400 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {t.eyebrow}
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-white">
            {t.title}
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-gray-400 leading-relaxed">{t.lead}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => {
            const c = tpl[isAr ? 'ar' : 'en'];
            return (
              <article
                key={tpl.slug}
                className="group relative rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.07]"
              >
                <div className={`inline-flex px-3 py-1 rounded-lg bg-gradient-to-r ${tpl.accent} text-white text-xs font-semibold tracking-wide`}>
                  {c.kind}
                </div>

                <h3 className="mt-5 text-2xl font-bold text-white">{c.name}</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed min-h-[3.5rem]">{c.text}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={`${DEMOS_URL}/${tpl.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold transition-transform hover:scale-[1.03]"
                  >
                    {t.site}
                    <ArrowIcon className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </a>
                  <a
                    href={`${DEMOS_URL}/${tpl.slug}/book`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-sm font-medium transition-colors"
                  >
                    {t.booking}
                  </a>
                  <a
                    href={`${DEMOS_URL}/${tpl.slug}/dashboard`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-sm font-medium transition-colors"
                  >
                    {t.dashboard}
                  </a>
                </div>
              </article>
            );
          })}

          {/* Browse-all card */}
          <a
            href={DEMOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl border border-dashed border-white/20 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-white/5"
          >
            <span className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 grid place-items-center">
              <ArrowIcon className={`w-5 h-5 text-white ${isAr ? 'rotate-180' : ''}`} />
            </span>
            <span className="mt-4 text-lg font-semibold text-white">{t.viewAll}</span>
            <span className="mt-2 text-sm text-gray-400">{t.note}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
