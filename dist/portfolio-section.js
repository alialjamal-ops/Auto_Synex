/**
 * Auto Synex — "Our Work" (portfolio) section for the main marketing site.
 *
 * Same approach as templates-section.js: the site's `src/` is not in this
 * repository, so this script mounts the section into the served build, right
 * after the Live Templates section, adds an "Our Work" entry to every nav
 * (after "Templates"), and re-mounts whenever React re-renders.
 *
 * To add a project: append an entry to PROJECTS and put its screenshots in
 * /assets/portfolio/<slug>/.
 */
(function () {
  'use strict';

  var MOUNT_ID = 'as-portfolio';
  var AFTER_ID = 'as-templates';

  var COPY = {
    en: {
      eyebrow: 'Our Work',
      title: 'Real websites, live for real clients',
      lead: 'A selection of projects we designed, built and handed over — running in production today.',
      visit: 'Visit the website',
      shots: 'Screenshots',
      open: 'Open screenshot',
      nav: 'Our Work'
    },
    ar: {
      eyebrow: 'أعمالنا',
      title: 'مواقع حقيقية تعمل لعملاء حقيقيين',
      lead: 'مختارات من مشاريع صمّمناها وبنيناها وسلّمناها لأصحابها — وتعمل اليوم على الإنترنت.',
      visit: 'زيارة الموقع',
      shots: 'صور من الموقع',
      open: 'عرض الصورة',
      nav: 'أعمالنا'
    }
  };

  var PROJECTS = [
    {
      slug: 'gcafrica',
      url: 'https://gcafrica.co',
      domain: 'gcafrica.co',
      accent: 'linear-gradient(90deg,#c9a45c,#e7cf94)',
      shots: [
        { file: 'hero.jpg', en: 'Home page', ar: 'الصفحة الرئيسية' },
        { file: 'products.jpg', en: 'Products', ar: 'المنتجات' },
        { file: 'network.jpg', en: 'Interactive distribution map', ar: 'خريطة التوزيع التفاعلية' },
        { file: 'about.jpg', en: 'About & process', ar: 'من نحن ومراحل الإنتاج' },
        { file: 'mobile.jpg', en: 'On mobile', ar: 'على الجوال', tall: true }
      ],
      en: {
        name: 'Green Chemistry',
        kind: 'Manufacturer & exporter · Senegal',
        text: 'A premium corporate website for Green Chemistry, a Senegal-based manufacturer of natural wellness products that supplies distributors and pharmacies in 11+ African countries. Built in three languages, with an interactive map of its distribution network, downloadable product dossiers for distributors, and a private dashboard where the client manages points of sale, certificates and products on their own.',
        features: ['English · French · Arabic (RTL)', 'Interactive Africa map', 'Client admin dashboard', 'Downloadable B2B dossiers', 'Contact form & WhatsApp', 'Mobile-first']
      },
      ar: {
        name: 'Green Chemistry',
        kind: 'شركة تصنيع وتصدير · السنغال',
        text: 'موقع تعريفي فاخر لشركة Green Chemistry، مصنّع منتجات صحية طبيعية في السنغال يزوّد الموزّعين والصيدليات في أكثر من 11 دولة أفريقية. الموقع بثلاث لغات، مع خريطة تفاعلية لشبكة التوزيع، وملفات منتجات قابلة للتحميل للموزّعين، ولوحة تحكّم خاصة يدير منها العميل نقاط البيع والشهادات والمنتجات بنفسه.',
        features: ['إنجليزي · فرنسي · عربي', 'خريطة أفريقيا تفاعلية', 'لوحة تحكّم للعميل', 'ملفات منتجات للموزّعين', 'نموذج تواصل وواتساب', 'متوافق مع الجوال']
      }
    }
  ];

  var S = '#' + MOUNT_ID;
  var CSS = [
    S + '{background:#0a1628;padding:96px 0;position:relative;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif}',
    S + ' .asp-glow{position:absolute;bottom:10%;left:-14%;width:24rem;height:24rem;border-radius:9999px;',
    'background:linear-gradient(90deg,rgba(59,130,246,.18),rgba(34,211,238,.18));filter:blur(64px);pointer-events:none}',
    S + ' .asp-wrap{position:relative;max-width:80rem;margin:0 auto;padding:0 1rem}',
    S + ' .asp-head{text-align:center;margin-bottom:3.5rem}',
    S + ' .asp-eyebrow{display:inline-flex;align-items:center;gap:.5rem;padding:.375rem 1rem;border-radius:9999px;',
    'background:rgba(255,255,255,.1);color:#60a5fa;font-size:.875rem;font-weight:500}',
    S + ' .asp-dot{width:.375rem;height:.375rem;border-radius:9999px;background:#60a5fa}',
    S + ' h2{margin:1.25rem 0 0;font-size:1.875rem;font-weight:700;color:#fff;line-height:1.2}',
    '@media(min-width:768px){' + S + ' h2{font-size:2.25rem}}',
    S + ' .asp-lead{margin:1.25rem auto 0;max-width:42rem;color:#9ca3af;font-size:1rem;line-height:1.7}',
    S + ' .asp-card{display:grid;gap:2rem;grid-template-columns:1fr;background:rgba(255,255,255,.05);',
    'border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:1.25rem}',
    '@media(min-width:1024px){' + S + ' .asp-card{grid-template-columns:minmax(0,7fr) minmax(0,5fr);padding:2rem;align-items:center}}',
    S + ' .asp-stage{position:relative;aspect-ratio:16/10;border-radius:16px;overflow:hidden;background:#06101f;',
    'border:1px solid rgba(255,255,255,.08);display:block}',
    S + ' .asp-stage img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:opacity .25s ease}',
    S + ' .asp-stage.is-tall img{object-fit:contain;background:#06101f}',
    S + ' .asp-caption{position:absolute;bottom:.75rem;inset-inline-start:.75rem;padding:.25rem .75rem;border-radius:.5rem;',
    'background:rgba(10,22,40,.8);color:#e5e7eb;font-size:.75rem;font-weight:600;backdrop-filter:blur(6px)}',
    S + ' .asp-thumbs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.5rem;margin-top:.75rem;padding:0;list-style:none}',
    S + ' .asp-thumb{display:block;width:100%;aspect-ratio:16/10;padding:0;border-radius:10px;overflow:hidden;cursor:pointer;',
    'border:2px solid transparent;background:#06101f;opacity:.6;transition:opacity .2s,border-color .2s}',
    S + ' .asp-thumb:hover{opacity:.9}',
    S + ' .asp-thumb[aria-pressed="true"]{opacity:1;border-color:#3b82f6}',
    S + ' .asp-thumb:focus-visible{outline:2px solid #60a5fa;outline-offset:2px}',
    S + ' .asp-thumb img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}',
    S + ' .asp-kind{display:inline-block;padding:.25rem .75rem;border-radius:.5rem;color:#1f1605;font-size:.75rem;font-weight:700}',
    S + ' h3{margin:1rem 0 0;font-size:1.75rem;font-weight:700;color:#fff}',
    S + ' .asp-domain{margin-top:.25rem;color:#60a5fa;font-size:.875rem;direction:ltr;unicode-bidi:isolate}',
    S + ' .asp-text{margin:1rem 0 0;color:#9ca3af;font-size:.9375rem;line-height:1.8}',
    S + ' .asp-features{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.25rem 0 0;padding:0;list-style:none}',
    S + ' .asp-features li{padding:.3rem .7rem;border-radius:9999px;background:rgba(255,255,255,.07);',
    'border:1px solid rgba(255,255,255,.1);color:#d1d5db;font-size:.75rem}',
    S + ' .asp-btn{display:inline-flex;align-items:center;gap:.5rem;margin-top:1.75rem;padding:.75rem 1.25rem;border-radius:.75rem;',
    'background:linear-gradient(90deg,#3b82f6,#22d3ee);color:#fff;font-weight:600;font-size:.9375rem;text-decoration:none;transition:transform .2s}',
    S + ' .asp-btn:hover{transform:scale(1.03)}',
    S + '[dir="rtl"] .asp-arrow{transform:rotate(180deg)}',
    '@media(prefers-reduced-motion:reduce){' + S + ' *{transition:none!important}}'
  ].join('');

  var ARABIC = /[؀-ۿ]/;
  function isArabic() {
    if (ARABIC.test(document.documentElement.lang || '')) return true;
    if (document.documentElement.dir === 'rtl') return true;
    var probe = document.getElementById('services') || document.getElementById('root');
    return probe ? ARABIC.test(probe.textContent || '') : false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ARROW = '<svg class="asp-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">' +
    '<path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';

  function src(p, shot) {
    return '/assets/portfolio/' + p.slug + '/' + shot.file;
  }

  function render(section) {
    var lang = isArabic() ? 'ar' : 'en';
    var t = COPY[lang];
    section.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    section.setAttribute('data-lang', lang);
    section.setAttribute('aria-labelledby', MOUNT_ID + '-title');

    var cards = PROJECTS.map(function (p) {
      var c = p[lang];
      var first = p.shots[0];
      var thumbs = p.shots.map(function (shot, i) {
        return '<li><button type="button" class="asp-thumb" data-i="' + i + '" aria-pressed="' + (i === 0) + '" ' +
          'aria-label="' + esc(t.open + ': ' + shot[lang]) + '">' +
          '<img src="' + src(p, shot) + '" alt="" loading="lazy" decoding="async" width="160" height="100"></button></li>';
      }).join('');
      return '<article class="asp-card" data-slug="' + p.slug + '">' +
        '<div>' +
          '<a class="asp-stage" href="' + src(p, first) + '" target="_blank" rel="noopener">' +
            '<img src="' + src(p, first) + '" alt="' + esc(c.name + ' — ' + first[lang]) + '" loading="lazy" decoding="async" width="1440" height="900">' +
            '<span class="asp-caption">' + esc(first[lang]) + '</span>' +
          '</a>' +
          '<ul class="asp-thumbs" aria-label="' + esc(t.shots) + '">' + thumbs + '</ul>' +
        '</div>' +
        '<div>' +
          '<span class="asp-kind" style="background:' + p.accent + '">' + esc(c.kind) + '</span>' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<div class="asp-domain">' + esc(p.domain) + '</div>' +
          '<p class="asp-text">' + esc(c.text) + '</p>' +
          '<ul class="asp-features">' + c.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
          '<a class="asp-btn" href="' + p.url + '" target="_blank" rel="noopener">' + t.visit + ARROW + '</a>' +
        '</div>' +
      '</article>';
    }).join('');

    section.innerHTML =
      '<div class="asp-glow"></div>' +
      '<div class="asp-wrap">' +
        '<div class="asp-head">' +
          '<span class="asp-eyebrow"><span class="asp-dot"></span>' + t.eyebrow + '</span>' +
          '<h2 id="' + MOUNT_ID + '-title">' + t.title + '</h2>' +
          '<p class="asp-lead">' + t.lead + '</p>' +
        '</div>' + cards +
      '</div>';
  }

  /** Thumbnail → main image. One delegated listener survives re-renders. */
  function onClick(event) {
    var btn = event.target.closest && event.target.closest('#' + MOUNT_ID + ' .asp-thumb');
    if (!btn) return;
    var card = btn.closest('.asp-card');
    var p = PROJECTS.filter(function (x) { return x.slug === card.getAttribute('data-slug'); })[0];
    if (!p) return;
    var lang = isArabic() ? 'ar' : 'en';
    var shot = p.shots[Number(btn.getAttribute('data-i'))];
    var stage = card.querySelector('.asp-stage');
    var img = stage.querySelector('img');
    img.src = src(p, shot);
    img.alt = p[lang].name + ' — ' + shot[lang];
    stage.href = src(p, shot);
    stage.classList.toggle('is-tall', !!shot.tall);
    stage.querySelector('.asp-caption').textContent = shot[lang];
    var all = card.querySelectorAll('.asp-thumb');
    for (var i = 0; i < all.length; i += 1) all[i].setAttribute('aria-pressed', String(all[i] === btn));
  }

  function styles() {
    if (document.getElementById(MOUNT_ID + '-style')) return;
    var el = document.createElement('style');
    el.id = MOUNT_ID + '-style';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  /**
   * Adds "Our Work" right after every "Templates" entry that templates-section.js
   * added (header, footer, mobile menu), copying that entry's classes.
   */
  function mountNav(lang) {
    var label = COPY[lang].nav;
    var owned = document.querySelectorAll('[data-as-nav="portfolio"]');
    for (var k = 0; k < owned.length; k += 1) {
      var entry = owned[k];
      var prev = entry.previousElementSibling;
      var anchor = entry.tagName === 'LI' ? entry.firstElementChild : entry;
      if (!prev || prev.getAttribute('data-as-nav') !== '1' || !anchor) {
        if (entry.parentNode) entry.parentNode.removeChild(entry);
      } else if (anchor.textContent !== label) {
        anchor.textContent = label;
      }
    }

    var hosts = document.querySelectorAll('[data-as-nav="1"]');
    for (var i = 0; i < hosts.length; i += 1) {
      var host = hosts[i];
      var next = host.nextElementSibling;
      if (next && next.getAttribute('data-as-nav') === 'portfolio') continue;
      var source = host.tagName === 'LI' ? host.firstElementChild : host;
      if (!source || !host.parentNode) continue;

      var link = document.createElement('a');
      link.href = '#' + MOUNT_ID;
      link.textContent = label;
      link.className = source.className;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.getElementById(MOUNT_ID);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      var inserted = link;
      if (host.tagName === 'LI') {
        inserted = document.createElement('li');
        inserted.appendChild(link);
      }
      inserted.setAttribute('data-as-nav', 'portfolio');
      host.parentNode.insertBefore(inserted, host.nextSibling);
    }
  }

  function mount() {
    var anchor = document.getElementById(AFTER_ID) || document.getElementById('home');
    if (!anchor || !anchor.parentNode) return;
    var section = document.getElementById(MOUNT_ID);
    if (!section) {
      section = document.createElement('section');
      section.id = MOUNT_ID;
    }
    if (section.previousElementSibling !== anchor) anchor.parentNode.insertBefore(section, anchor.nextSibling);
    var lang = isArabic() ? 'ar' : 'en';
    if (section.getAttribute('data-lang') !== lang || !section.firstChild) render(section);
    mountNav(lang);
  }

  function start() {
    styles();
    document.addEventListener('click', onClick);
    mount();
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; mount(); }, 0);
    });
    var root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    // Deep link: /#as-portfolio scrolls here once the section exists.
    if (location.hash === '#' + MOUNT_ID) setTimeout(function () { var s = document.getElementById(MOUNT_ID); if (s) s.scrollIntoView(); }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  } else {
    setTimeout(start, 0);
  }
})();
