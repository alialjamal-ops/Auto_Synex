/**
 * Auto Synex — "Live Templates" section for the main marketing site.
 *
 * The site's `src/` is not in this repository, so the page cannot be rebuilt
 * from source (see DEPLOY.md). This script adds the section to the served
 * build instead: it mounts after #services, styles itself in the site's own
 * design system, and re-mounts if React re-renders that part of the tree.
 *
 * When `src/` is restored, delete this file and its <script> tag, and render
 * demos/integration/TemplatesSection.jsx from the real source instead.
 */
(function () {
  'use strict';

  var MOUNT_ID = 'as-templates';
  var BASE = '/demos';

  var COPY = {
    en: {
      eyebrow: 'Live Templates',
      title: 'See it working before you buy it',
      lead: 'Every template below is a real, running product — not a screenshot. Browse the site, book an appointment, then open the dashboard and watch your booking appear in it.',
      site: 'Website',
      booking: 'Booking',
      dashboard: 'Dashboard',
      viewAll: 'Browse all templates',
      note: 'All demo businesses are fictional.'
    },
    ar: {
      eyebrow: 'قوالب حيّة',
      title: 'جرّبه قبل أن تشتريه',
      lead: 'كل قالب في الأسفل منتج حقيقي يعمل — وليس صورة. تصفّح الموقع، احجز موعدًا، ثم افتح لوحة التحكّم وشاهد حجزك يظهر فيها.',
      site: 'الموقع',
      booking: 'الحجز',
      dashboard: 'لوحة التحكّم',
      viewAll: 'تصفّح كل القوالب',
      note: 'جميع الأنشطة في القوالب افتراضية.'
    }
  };

  var TEMPLATES = [
    {
      slug: 'clinic',
      accent: 'linear-gradient(90deg,#10b981,#2dd4bf)',
      en: { kind: 'Medical Clinic', name: 'Vita Medical', text: 'Specialty pages, doctor profiles and consultant-level appointment booking.' },
      ar: { kind: 'عيادة طبية', name: 'ڤيتا الطبية', text: 'صفحات تخصّصات، ملفات أطباء، ونظام حجز مواعيد كامل.' }
    },
    {
      slug: 'dental',
      accent: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
      en: { kind: 'Dental Clinic', name: 'Smileora Dental', text: 'Treatment pricing, a before/after comparison slider and instant booking.' },
      ar: { kind: 'عيادة أسنان', name: 'سمايلورا للأسنان', text: 'أسعار العلاجات، مقارنة قبل/بعد تفاعلية، وحجز فوري.' }
    },
    {
      slug: 'salon',
      accent: 'linear-gradient(90deg,#f59e0b,#fb923c)',
      en: { kind: 'Beauty Salon', name: 'Lumé Beauty', text: 'Editorial layout, treatment menu, membership tiers and booking by artist.' },
      ar: { kind: 'صالون تجميل', name: 'لومي بيوتي', text: 'تصميم تحريري، قائمة خدمات، باقات عضوية، وحجز حسب الفنّانة.' }
    },
    {
      slug: 'hotel',
      accent: 'linear-gradient(90deg,#eab308,#fcd34d)',
      en: { kind: 'Luxury Hotel', name: 'Noiré', text: 'Cinematic hero, room pricing and a check-in / check-out reservation flow.' },
      ar: { kind: 'فندق فاخر', name: 'نوارِيه', text: 'واجهة سينمائية، أسعار الغرف، وحجز بتاريخَي الوصول والمغادرة.' }
    },
    {
      slug: 'restaurant',
      accent: 'linear-gradient(90deg,#f97316,#f87171)',
      en: { kind: 'Restaurant', name: 'Ember & Stone', text: 'Full menu system, signature dishes and table reservations by party size.' },
      ar: { kind: 'مطعم', name: 'إمبر آند ستون', text: 'قائمة طعام كاملة، أطباق مميّزة، وحجز طاولات حسب عدد الأشخاص.' }
    }
  ];

  var CSS = [
    '#' + MOUNT_ID + '{background:#0a1628;padding:96px 0;position:relative;overflow:hidden;',
    'font-family:ui-sans-serif,system-ui,sans-serif}',
    '#' + MOUNT_ID + ' .ast-glow{position:absolute;top:18%;right:-14%;width:24rem;height:24rem;border-radius:9999px;',
    'background:linear-gradient(90deg,rgba(59,130,246,.2),rgba(34,211,238,.2));filter:blur(64px);pointer-events:none}',
    '#' + MOUNT_ID + ' .ast-wrap{position:relative;max-width:80rem;margin:0 auto;padding:0 1rem}',
    '#' + MOUNT_ID + ' .ast-head{text-align:center;margin-bottom:3.5rem}',
    '#' + MOUNT_ID + ' .ast-eyebrow{display:inline-flex;align-items:center;gap:.5rem;padding:.375rem 1rem;',
    'border-radius:9999px;background:rgba(255,255,255,.1);color:#60a5fa;font-size:.875rem;font-weight:500}',
    '#' + MOUNT_ID + ' .ast-dot{width:.375rem;height:.375rem;border-radius:9999px;background:#60a5fa}',
    '#' + MOUNT_ID + ' h2{margin:1.25rem 0 0;font-size:1.875rem;font-weight:700;color:#fff;line-height:1.2}',
    '@media(min-width:768px){#' + MOUNT_ID + ' h2{font-size:2.25rem}}',
    '#' + MOUNT_ID + ' .ast-lead{margin:1.25rem auto 0;max-width:42rem;color:#9ca3af;font-size:1rem;line-height:1.7}',
    '#' + MOUNT_ID + ' .ast-grid{display:grid;gap:1.5rem;grid-template-columns:1fr}',
    '@media(min-width:768px){#' + MOUNT_ID + ' .ast-grid{grid-template-columns:repeat(2,1fr)}}',
    '@media(min-width:1024px){#' + MOUNT_ID + ' .ast-grid{grid-template-columns:repeat(3,1fr)}}',
    '#' + MOUNT_ID + ' .ast-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);',
    'border-radius:24px;padding:2rem;transition:transform .3s,border-color .3s,background-color .3s}',
    '#' + MOUNT_ID + ' .ast-card:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.4);background:rgba(255,255,255,.07)}',
    '#' + MOUNT_ID + ' .ast-kind{display:inline-block;padding:.25rem .75rem;border-radius:.5rem;color:#fff;',
    'font-size:.75rem;font-weight:600;letter-spacing:.02em}',
    '#' + MOUNT_ID + ' h3{margin:1.25rem 0 0;font-size:1.5rem;font-weight:700;color:#fff}',
    '#' + MOUNT_ID + ' .ast-text{margin:.75rem 0 0;color:#9ca3af;font-size:.875rem;line-height:1.7;min-height:3.5rem}',
    '#' + MOUNT_ID + ' .ast-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.5rem}',
    '#' + MOUNT_ID + ' .ast-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.625rem 1rem;border-radius:.75rem;',
    'font-size:.875rem;font-weight:500;text-decoration:none;transition:background-color .2s,transform .2s}',
    '#' + MOUNT_ID + ' .ast-btn-primary{background:linear-gradient(90deg,#3b82f6,#22d3ee);color:#fff;font-weight:600}',
    '#' + MOUNT_ID + ' .ast-btn-primary:hover{transform:scale(1.03)}',
    '#' + MOUNT_ID + ' .ast-btn-ghost{background:rgba(255,255,255,.1);color:#e5e7eb}',
    '#' + MOUNT_ID + ' .ast-btn-ghost:hover{background:rgba(255,255,255,.2)}',
    '#' + MOUNT_ID + ' .ast-all{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;',
    'border:1px dashed rgba(255,255,255,.2);border-radius:24px;padding:2rem;text-decoration:none;transition:border-color .3s,background-color .3s}',
    '#' + MOUNT_ID + ' .ast-all:hover{border-color:rgba(59,130,246,.5);background:rgba(255,255,255,.05)}',
    '#' + MOUNT_ID + ' .ast-all-icon{width:3rem;height:3rem;border-radius:.75rem;display:grid;place-items:center;',
    'background:linear-gradient(90deg,#3b82f6,#22d3ee);color:#fff;font-size:1.25rem}',
    '#' + MOUNT_ID + ' .ast-all-title{margin-top:1rem;font-size:1.125rem;font-weight:600;color:#fff}',
    '#' + MOUNT_ID + ' .ast-all-note{margin-top:.5rem;font-size:.875rem;color:#9ca3af}',
    '#' + MOUNT_ID + '[dir="rtl"] .ast-arrow{transform:rotate(180deg)}'
  ].join('');

  var ARABIC = /[؀-ۿ]/;

  function isArabic() {
    if (ARABIC.test(document.documentElement.lang || '')) return true;
    if (document.documentElement.dir === 'rtl') return true;
    var probe = document.getElementById('services') || document.getElementById('root');
    return probe ? ARABIC.test(probe.textContent || '') : false;
  }

  function href(lang, slug, page) {
    return BASE + (lang === 'ar' ? '/ar' : '') + '/' + slug + (page || '');
  }

  var ARROW = '<svg class="ast-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">' +
    '<path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';

  function render(section) {
    var lang = isArabic() ? 'ar' : 'en';
    var t = COPY[lang];
    section.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    section.setAttribute('data-lang', lang);

    var cards = TEMPLATES.map(function (tpl) {
      var c = tpl[lang];
      return '<article class="ast-card">' +
        '<span class="ast-kind" style="background:' + tpl.accent + '">' + c.kind + '</span>' +
        '<h3>' + c.name + '</h3>' +
        '<p class="ast-text">' + c.text + '</p>' +
        '<div class="ast-actions">' +
          '<a class="ast-btn ast-btn-primary" href="' + href(lang, tpl.slug, '') + '">' + t.site + ARROW + '</a>' +
          '<a class="ast-btn ast-btn-ghost" href="' + href(lang, tpl.slug, '/book') + '">' + t.booking + '</a>' +
          '<a class="ast-btn ast-btn-ghost" href="' + href(lang, tpl.slug, '/dashboard') + '">' + t.dashboard + '</a>' +
        '</div>' +
      '</article>';
    }).join('');

    section.innerHTML =
      '<div class="ast-glow"></div>' +
      '<div class="ast-wrap">' +
        '<div class="ast-head">' +
          '<span class="ast-eyebrow"><span class="ast-dot"></span>' + t.eyebrow + '</span>' +
          '<h2>' + t.title + '</h2>' +
          '<p class="ast-lead">' + t.lead + '</p>' +
        '</div>' +
        '<div class="ast-grid">' + cards +
          '<a class="ast-all" href="' + BASE + (lang === 'ar' ? '/ar' : '') + '">' +
            '<span class="ast-all-icon">' + ARROW + '</span>' +
            '<span class="ast-all-title">' + t.viewAll + '</span>' +
            '<span class="ast-all-note">' + t.note + '</span>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  function styles() {
    if (document.getElementById(MOUNT_ID + '-style')) return;
    var el = document.createElement('style');
    el.id = MOUNT_ID + '-style';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function mount() {
    var anchor = document.getElementById('services');
    if (!anchor || !anchor.parentNode) return false;

    var section = document.getElementById(MOUNT_ID);
    if (!section) {
      section = document.createElement('section');
      section.id = MOUNT_ID;
    }
    // Keep it directly after Services even if React re-orders the page.
    if (section.previousElementSibling !== anchor) {
      anchor.parentNode.insertBefore(section, anchor.nextSibling);
    }
    var lang = isArabic() ? 'ar' : 'en';
    if (section.getAttribute('data-lang') !== lang || !section.firstChild) render(section);
    return true;
  }

  function start() {
    styles();
    mount();
    // React owns this subtree: re-mount if it drops us, and follow language changes.
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; mount(); }, 0);
    });
    var root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  } else {
    setTimeout(start, 0);
  }
})();
