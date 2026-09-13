/**
 * Auto Synex — <synex-bot> section guide.
 *
 * A small brand assistant that rides along the page and explains the section
 * the visitor is currently looking at. Sections opt in with data attributes:
 *
 *   <section id="services"
 *     data-bot-tag="Services"
 *     data-bot-title="خدماتنا"
 *     data-bot-body="أتمتة، وكلاء ذكاء اصطناعي، وتطوير ويب."
 *     data-bot-cta="اطلب عرضًا"          (optional)
 *     data-bot-cta-href="#contact">      (optional)
 *
 * Usage:
 *   <script type="module" src="/synex-bot-embed.js"></script>
 *   <synex-bot side="left" color="#17567f" margin="20px"
 *              collapse-after="5200" sticky="false"></synex-bot>
 *
 * The main site's `src/` is not in this repository (see dist/templates-section.js),
 * so the React sections carry no data-bot-* attributes. DEFAULTS below tags them
 * at runtime, bilingually, and a MutationObserver re-tags them if React re-renders.
 * When `src/` is restored, move the copy onto the real sections as attributes and
 * delete the DEFAULTS block — nothing else changes.
 */

const ARABIC = /^ar\b|[؀-ۿ]/;

/** Copy for the sections the deployed build renders itself. */
const DEFAULTS = {
  home: {
    en: { tag: 'Welcome', title: 'Auto Synex', body: 'Websites, booking systems and AI automation — built, not templated. Take a look around.', cta: 'See live templates', href: '#as-templates' },
    ar: { tag: 'أهلًا بك', title: 'أوتو سينكس', body: 'مواقع، أنظمة حجز، وأتمتة بالذكاء الاصطناعي — مبنية لعملك، لا قوالب جاهزة.', cta: 'شاهد القوالب الحيّة', href: '#as-templates' },
  },
  'as-templates': {
    en: { tag: 'Live templates', title: 'Try before you buy', body: 'Five complete businesses you can click through: browse the site, book an appointment, then watch it appear in the dashboard.', cta: 'Open the demos', href: '/demos' },
    ar: { tag: 'قوالب حيّة', title: 'جرّبه قبل أن تشتريه', body: 'خمسة أنشطة كاملة يمكنك تجربتها: تصفّح الموقع، احجز موعدًا، ثم شاهد الحجز يظهر في لوحة التحكّم.', cta: 'افتح النماذج', href: '/demos' },
  },
  services: {
    en: { tag: 'Services', title: 'What we build', body: 'Automation, AI agents and web development — delivered as one working system, not three separate projects.', cta: 'Talk to us', href: '#contact' },
    ar: { tag: 'خدماتنا', title: 'ما الذي نبنيه', body: 'أتمتة، وكلاء ذكاء اصطناعي، وتطوير ويب — بنظام واحد متكامل، لا ثلاثة مشاريع منفصلة.', cta: 'تواصل معنا', href: '#contact' },
  },
  about: {
    en: { tag: 'About', title: 'How we work', body: 'Small team, direct contact, and a running demo before you commit to anything.', cta: 'See the demos', href: '/demos' },
    ar: { tag: 'من نحن', title: 'كيف نعمل', body: 'فريق صغير، تواصل مباشر، ونموذج يعمل أمامك قبل أي التزام.', cta: 'شاهد النماذج', href: '/demos' },
  },
  'why-us': {
    en: { tag: 'Why us', title: 'Fast, measurable, secure', body: 'Quick delivery, work judged by the bookings it brings in, and security built in from day one.', cta: 'Start a project', href: '#contact' },
    ar: { tag: 'لماذا نحن', title: 'سرعة، نتائج، وأمان', body: 'تسليم سريع، وعمل يُقاس بالحجوزات التي يجلبها، وأمان مدمج من اليوم الأول.', cta: 'ابدأ مشروعك', href: '#contact' },
  },
  contact: {
    en: { tag: 'Contact', title: 'Tell us what you need', body: 'Send the business type and what you want it to do. You get a scoped answer, not a brochure.', cta: 'Ask me first', href: '#chat' },
    ar: { tag: 'تواصل', title: 'أخبرنا بما تحتاجه', body: 'أرسل نوع النشاط وما تريده أن يفعله، وتصلك إجابة محدّدة لا كتيّب تعريفي.', cta: 'اسألني أولًا', href: '#chat' },
  },
  // Keys starting with @ are CSS selectors, for blocks the build renders without an id.
  '@#root footer': {
    en: { tag: 'Before you go', title: 'Still deciding?', body: 'Open a live demo and book something — it takes a minute and shows exactly what your customers would get.', cta: 'Open the demos', href: '/demos' },
    ar: { tag: 'قبل أن تغادر', title: 'ما زلت متردّدًا؟', body: 'افتح نموذجًا حيًّا واحجز فيه — دقيقة واحدة تريك بالضبط ما سيحصل عليه عملاؤك.', cta: 'افتح النماذج', href: '/demos' },
  },
};

/** Chrome for the chat half. */
const UI = {
  en: { ask: 'Ask me anything', title: 'Ask Auto Synex', ph: 'Type your question…',
        send: 'Send', back: 'Back', offline: 'Answering from what I know about Auto Synex.',
        err: 'That did not go through. Try again, or use the contact form on this page.',
        online: 'Online · replies instantly',
        chips: ['What do you build?', 'How does the booking work?', 'Can I see a demo?', 'What does it cost?'] },
  ar: { ask: 'اسألني أي شيء', title: 'اسأل أوتو سينكس', ph: 'اكتب سؤالك…',
        send: 'إرسال', back: 'رجوع', offline: 'أجيب مما أعرفه عن أوتو سينكس.',
        err: 'لم تصل الرسالة. أعد المحاولة أو استخدم نموذج التواصل في الصفحة.',
        online: 'متصل · يرد فورًا',
        chips: ['ماذا تبنون؟', 'كيف يعمل نظام الحجز؟', 'أريد رؤية نموذج', 'كم التكلفة؟'] },
};

/**
 * Answers used when /api/chat is unavailable (no API key on the deployment,
 * or the request failed). Keyword-matched, and deliberately the same facts the
 * endpoint's system prompt is allowed to state.
 */
const KB = [
  { k: ['حجز', 'مواعيد', 'موعد', 'book', 'booking', 'appointment', 'reserv'],
    ar: 'نظام الحجز يتعامل مع ساعات العمل وتوزيع الموظفين ومدة كل خدمة، ويمنع الحجز المزدوج ويرسل التأكيد تلقائيًا. الزائر يُنهي الحجز في حوالي 90 ثانية بدون مكالمة وبدون بطاقة.',
    en: 'The booking engine handles working hours, staff rotas and per-service durations, prevents double-bookings and confirms automatically. A visitor finishes in about 90 seconds — no call, no card.' },
  { k: ['نموذج', 'نماذج', 'ديمو', 'تجرب', 'demo', 'example', 'sample', 'try'],
    ar: 'خمسة نماذج حيّة على autosynex.com/demos: عيادة، أسنان، صالون، فندق، مطعم. كل واحد بموقع ونظام حجز ولوحة تحكم تعمل فعلًا — احجز فيه ثم افتح اللوحة وشاهد حجزك.',
    en: 'Five live demos at autosynex.com/demos: clinic, dental, salon, hotel and restaurant. Each has a real booking flow and a working dashboard — book in one, then open its dashboard and watch the booking appear.' },
  { k: ['سعر', 'تكلفة', 'كم', 'ثمن', 'price', 'cost', 'how much', 'quote', 'budget'],
    ar: 'لا توجد قائمة أسعار ثابتة — السعر يتبع نطاق العمل. اترك تفاصيل نشاطك في نموذج التواصل بالصفحة ويصلك عرض محدّد.',
    en: 'There is no fixed price list — it follows the scope. Leave your details in the contact form on this page and you get a scoped quote.' },
  { k: ['لوحة', 'تحكم', 'إدارة', 'dashboard', 'admin', 'manage', 'revenue'],
    ar: 'لوحة التحكم تعرض مواعيد اليوم والتقويم والعملاء والموظفين والخدمات والإيرادات ونسبة الإشغال، في مكان واحد.',
    en: 'The dashboard shows today\'s appointments, the calendar, customers, staff, services, revenue and occupancy — in one place.' },
  { k: ['موقع', 'تصميم', 'website', 'site', 'design', 'web'],
    ar: 'الموقع يُصمَّم على هويتك: تصميم وحركة مخصّصان، سريع على الجوال، وبنية SEO — وليس قالبًا جاهزًا بشعارك.',
    en: 'The website is designed around your brand: bespoke design and motion, fast on real phones, proper SEO structure — not a template with your logo dropped in.' },
  { k: ['لغة', 'عربي', 'إنجليزي', 'language', 'arabic', 'english', 'bilingual'],
    ar: 'كل ما نبنيه ثنائي اللغة: عربي (RTL) وإنجليزي، بنفس المحتوى ونفس التجربة.',
    en: 'Everything is bilingual: Arabic (RTL) and English, same content and same experience in both.' },
  { k: ['أتمتة', 'ذكاء', 'روبوت', 'بوت', 'automation', 'ai', 'agent', 'bot'],
    ar: 'إلى جانب المواقع وأنظمة الحجز، نبني أتمتة أعمال ووكلاء ذكاء اصطناعي — مثل هذا المساعد على الصفحة.',
    en: 'Alongside sites and booking systems we build business automation and AI agents — this assistant on the page is one of them.' },
  { k: ['تواصل', 'اتصال', 'رقم', 'ايميل', 'contact', 'email', 'phone', 'talk', 'call'],
    ar: 'أسرع طريق هو نموذج التواصل في هذه الصفحة — اكتب نوع نشاطك وما تريد أن يفعله النظام، ويصلك ردّ محدّد.',
    en: 'The fastest route is the contact form on this page — say what your business is and what you want the system to do, and you get a specific answer.' },
];

/** Arabic-insensitive matching: drop diacritics and fold letter variants. */
function norm(text) {
  return (text || '').toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');
}

/** Trades map to the closest live demo, so "I run a salon" gets a link, not a brochure. */
const TRADES = [
  // Most specific first: a tie ("dental clinic") goes to the earlier, narrower trade.
  { k: ['اسنان', 'سن ', 'dental', 'dentist', 'teeth'], slug: 'dental', en: 'Smileora Dental', ar: 'سمايلورا لطب الأسنان' },
  { k: ['عياد', 'طبيب', 'دكتور', 'مستشفي', 'clinic', 'doctor', 'medical', 'physio'], slug: 'clinic', en: 'Vita Medical (clinic)', ar: 'ڤيتا الطبية (عيادة)' },
  { k: ['صالون', 'تجميل', 'حلاق', 'سبا', 'مكياج', 'salon', 'beauty', 'barber', 'spa', 'nails'], slug: 'salon', en: 'Lumé Beauty (salon)', ar: 'لومي بيوتي (صالون)' },
  { k: ['فندق', 'شاليه', 'منتجع', 'غرف', 'hotel', 'resort', 'rooms', 'chalet'], slug: 'hotel', en: 'Noiré (hotel)', ar: 'نواريه (فندق)' },
  { k: ['مطعم', 'كافيه', 'مقهي', 'طاولات', 'restaurant', 'cafe', 'table', 'dining'], slug: 'restaurant', en: 'Ember & Stone (restaurant)', ar: 'إمبر آند ستون (مطعم)' },
];

const FOLLOW = {
  en: { booking: ['Show me the dashboard', 'Can customers pay online?'], demo: ['How does the booking work?', 'What does it cost?'],
        price: ['What is included?', 'Talk to the team'], dashboard: ['How does the booking work?', 'Can I see a demo?'],
        site: ['Is it bilingual?', 'Can I see a demo?'], lang: ['Can I see a demo?', 'What do you build?'],
        ai: ['Can it answer on WhatsApp?', 'What do you build?'], contact: ['What does it cost?', 'Can I see a demo?'],
        hello: ['What do you build?', 'Can I see a demo?'], trade: ['How does the booking work?', 'What does it cost?'] },
  ar: { booking: ['أرني لوحة التحكم', 'هل يمكن الدفع أونلاين؟'], demo: ['كيف يعمل الحجز؟', 'كم التكلفة؟'],
        price: ['ماذا يشمل؟', 'تواصل مع الفريق'], dashboard: ['كيف يعمل الحجز؟', 'أريد رؤية نموذج'],
        site: ['هل الموقع بلغتين؟', 'أريد رؤية نموذج'], lang: ['أريد رؤية نموذج', 'ماذا تبنون؟'],
        ai: ['هل يرد على واتساب؟', 'ماذا تبنون؟'], contact: ['كم التكلفة؟', 'أريد رؤية نموذج'],
        hello: ['ماذا تبنون؟', 'أريد رؤية نموذج'], trade: ['كيف يعمل الحجز؟', 'كم التكلفة؟'] },
};

const INTENTS = ['booking', 'demo', 'price', 'dashboard', 'site', 'lang', 'ai', 'contact'];
const EXTRA = [
  { id: 'hello', k: ['مرحب', 'اهلا', 'السلام', 'هاي', 'hello', 'hi ', 'hey', 'good morning'],
    ar: 'أهلًا بك! أنا مساعد أوتو سينكس. أخبرني بنوع نشاطك وأريك النموذج الأقرب له، أو اسألني عن الحجز والمواقع والأتمتة.',
    en: 'Hi! I am the Auto Synex assistant. Tell me what kind of business you run and I will show you the closest demo — or ask about booking, websites or automation.' },
  { id: 'pay', k: ['دفع', 'بطاق', 'اونلاين', 'pay', 'payment', 'stripe', 'card'],
    ar: 'الحجز في النماذج لا يطلب بطاقة حتى يبقى سريعًا، ويمكن إضافة الدفع الإلكتروني أو العربون حسب نشاطك — اذكر ذلك في نموذج التواصل.',
    en: 'The demos book without a card to keep it fast; online payment or deposits can be added for your business — mention it in the contact form.' },
  { id: 'whatsapp', k: ['واتس', 'انستا', 'whatsapp', 'instagram', 'messenger'],
    ar: 'نعم، نبني ردودًا آلية بالذكاء الاصطناعي على واتساب وإنستغرام، مع تحويل المحادثة لموظف عند الحاجة.',
    en: 'Yes — we build AI replies for WhatsApp and Instagram, with a hand-off to a person when a conversation needs one.' },
];

/**
 * The offline brain: scores every intent instead of taking the first keyword
 * hit, recognises the visitor's trade, and returns follow-up questions.
 */
function think(text, lang) {
  const q = ' ' + norm(text) + ' ';
  const hit = (keys) => keys.reduce((n, k) => n + (q.includes(norm(k)) ? 1 : 0), 0);

  const trade = TRADES.map((t) => ({ t, n: hit(t.k) })).sort((x, y) => y.n - x.n)[0];
  let best = null;
  let score = 0;
  KB.forEach((item, i) => { const n = hit(item.k); if (n > score) { score = n; best = { ...item, id: INTENTS[i] }; } });
  for (const item of EXTRA) { const n = hit(item.k); if (n > score) { score = n; best = item; } }

  const alias = { pay: 'booking', whatsapp: 'ai' };
  // Never suggest the question the visitor just asked.
  const asked = norm(text).replace(/[؟?!.\s]+/g, '');
  const key = (c) => norm(c).replace(/[؟?!.\s]+/g, '');
  const fresh = (list) => list.filter((c, i) => key(c) !== asked && list.findIndex((d) => key(d) === key(c)) === i);
  const chips = (id) => fresh([...(FOLLOW[lang][alias[id] || id] || []), ...UI[lang].chips]).slice(0, 2);
  if (trade.n > 0 && (!best || ['demo', 'booking', 'site'].includes(best.id) || trade.n >= score)) {
    const { t } = trade;
    const text = lang === 'ar'
      ? `لنشاط مثل نشاطك، أقرب نموذج هو ${t.ar}. افتحه، احجز فيه كزبون، ثم افتح لوحة التحكم وشاهد الحجز يصل: /demos/ar/${t.slug}`
      : `For a business like yours, the closest demo is ${t.en}. Open it, book as a customer, then open its dashboard and watch the booking arrive: /demos/${t.slug}`;
    return { text, chips: chips('trade') };
  }
  if (best) return { text: best[lang], chips: chips(best.id) };
  return { text: lang === 'ar'
    ? 'أوتو سينكس تبني ثلاثة أشياء معًا: موقعًا مخصّصًا، نظام حجز حقيقي، ولوحة تحكم — إضافة إلى الأتمتة ووكلاء الذكاء الاصطناعي. أخبرني بنوع نشاطك لأريك النموذج الأقرب.'
    : 'Auto Synex builds three things together: a custom website, a real booking system and its dashboard — plus automation and AI agents. Tell me your type of business and I will point you to the closest demo.',
    chips: fresh(UI[lang].chips).slice(0, 3) };
}

function localAnswer(text, lang) { return think(text, lang).text; }

const ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

function isArabic() {
  const el = document.documentElement;
  if (ARABIC.test(el.lang || '')) return true;
  if (el.dir === 'rtl') return true;
  const probe = document.getElementById('services') || document.getElementById('root');
  return probe ? ARABIC.test(probe.textContent || '') : false;
}

class SynexBot extends HTMLElement {
  static observedAttributes = ['side', 'color', 'margin', 'collapse-after', 'sticky'];

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._sections = [];
    this._ratios = new Map();
    this._current = null;
    this._open = false;
    this._timer = 0;
    this._dismissed = false;
  }

  /* ----------------------------------------------------------- attributes */
  get side() { return this.getAttribute('side') === 'left' ? 'left' : 'right'; }
  get color() { return this.getAttribute('color') || '#17567f'; }
  get margin() { return this.getAttribute('margin') || '20px'; }
  get sticky() { return this.getAttribute('sticky') === 'true'; }
  get collapseAfter() {
    const n = parseInt(this.getAttribute('collapse-after') || '', 10);
    return Number.isFinite(n) ? n : 6000;
  }

  attributeChangedCallback() { if (this._root.firstChild) this._applyVars(); }

  connectedCallback() {
    this._render();
    this._applyVars();
    this._collect();
    this._observeDom();
    this._boot3d();
    this._flight();
    // Let the hero settle before the bot announces itself.
    this._hello = setTimeout(() => this._pick(true), 1100);
  }

  /**
   * Scroll flight. The page's scroll velocity becomes an impulse; a spring
   * carries the character a little way with it and lets it settle back, and the
   * same value tips the 3D model so it leans into the travel. Pointer-driven
   * "look" keeps working throughout.
   */
  _flight() {
    let last = window.scrollY;
    let impulse = 0;
    let offset = 0;
    let vel = 0;
    let idle = 0;

    const onScroll = () => {
      const y = window.scrollY;
      impulse = Math.max(-120, Math.min(120, impulse + (y - last)));
      last = y;
      idle = 0;
      if (!this._flyRaf) step();
    };

    const step = () => {
      // Critically-damped-ish spring toward the impulse, which itself decays.
      impulse *= 0.90;
      const target = Math.max(-70, Math.min(70, impulse * 0.8));
      vel = vel * 0.72 + (target - offset) * 0.22;
      offset += vel;
      this._el.flyer.style.translate = '0 ' + offset.toFixed(2) + 'px';
      this._robot?.fly(Math.max(-1, Math.min(1, offset / 55)));

      const settled = Math.abs(offset) < 0.3 && Math.abs(vel) < 0.3 && Math.abs(impulse) < 0.5;
      if (settled && ++idle > 8) {
        this._el.flyer.style.translate = '0 0';
        this._robot?.fly(0);
        this._flyRaf = 0;
        return;
      }
      this._flyRaf = requestAnimationFrame(step);
    };

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._onScroll = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /**
   * The 3D character is a progressive enhancement: it loads after the page is
   * interactive, and any failure (no WebGL, blocked CDN, slow link) simply
   * leaves the flat SVG robot in place.
   */
  async _boot3d() {
    if (this.getAttribute('robot') === 'flat') return;
    try {
      const probe = document.createElement('canvas');
      if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return;
      const url = new URL('./synex-bot-3d.js', import.meta.url).href;
      const { createRobot } = await import(url);
      this._el.stack.classList.add('is3d');
      this._robot = await createRobot(this._el.stage, { color: this.color });
      this._el.avatar.addEventListener('pointerenter', () => this._robot.setHover(true));
      this._el.avatar.addEventListener('pointerleave', () => this._robot.setHover(false));
      this._onMove = (e) => {
        const r = this._el.avatar.getBoundingClientRect();
        this._robot.look(
          (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2),
          (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2),
        );
      };
      window.addEventListener('pointermove', this._onMove, { passive: true });
      this._robot.react('wave');
    } catch (err) {
      console.debug('synex-bot: 3D character unavailable, using the flat robot.', err);
    }
  }

  disconnectedCallback() {
    if (this._onMove) window.removeEventListener('pointermove', this._onMove);
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this._flyRaf) cancelAnimationFrame(this._flyRaf);
    this._robot?.dispose();
    clearTimeout(this._timer);
    clearTimeout(this._hello);
    this._io?.disconnect();
    this._mo?.disconnect();
  }

  /* --------------------------------------------------------------- markup */
  _render() {
    this._root.innerHTML = `
      <style>
        :host{position:fixed;z-index:2147483000;inset-block-start:50%;translate:0 -50%;
              font-family:'Cairo',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
              color-scheme:dark}
        :host([hidden]){display:none}
        .stack{display:flex;align-items:center;gap:12px;flex-direction:var(--dir,row-reverse);
          direction:ltr}  /* placement is physical: RTL must not swap the robot and the bubble */
        :host([dir="rtl"]) .bubble{direction:rtl}

        .stage{position:absolute;inset:0;width:100%;height:100%;display:none}
        .is3d .stage{display:block}
        /* With the character on screen the disc would only box it in. */
        .is3d .avatar{background:none;box-shadow:none;width:188px;height:188px}
        .is3d .avatar:hover{transform:none}
        .is3d svg.bot,.is3d .ping{display:none}
        .avatar{position:relative;width:66px;height:66px;flex:none;border:0;padding:0;cursor:pointer;border-radius:50%;
          background:linear-gradient(150deg,color-mix(in srgb,var(--c) 45%,#7cc0ff),var(--c) 58%,
                     color-mix(in srgb,var(--c) 78%,#04101f));
          box-shadow:0 10px 30px -8px rgba(4,12,28,.75),0 0 0 1px rgba(255,255,255,.30),
                     0 0 26px -6px color-mix(in srgb,var(--c) 50%,#5aa9ff);
          display:grid;place-items:center;transition:transform .22s ease,box-shadow .22s ease}
        .avatar:hover{transform:translateY(-2px) scale(1.04)}
        .avatar:focus-visible{outline:3px solid #9ecbff;outline-offset:3px}
        svg.bot{width:44px;height:44px;display:block;overflow:visible;
          filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
        .bot .head{fill:url(#shell);stroke:rgba(255,255,255,.7);stroke-width:.9}
        .bot .ear{fill:#93aec9}
        .bot .visor{fill:url(#glass)}
        .bot .ant{stroke:#d7e6f7;stroke-width:2.4;stroke-linecap:round}
        .bot .bulb{fill:#78e4ff}
        .bot .eyes circle{fill:#6fe0ff;transform-box:fill-box;transform-origin:center}
        .bot .smile{fill:#4b7ba3}
        .bot .float{transform-box:fill-box;transform-origin:center;animation:bob 3.4s ease-in-out infinite}
        .bot .bulb{animation:blip 2.4s ease-in-out infinite}
        .bot .eyes circle{animation:blink 5.4s infinite}
        .talking .bot .eyes circle{animation:talk .46s ease-in-out 2}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}
        @keyframes blip{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
        @keyframes talk{50%{transform:scale(1.28)}}
        .ping{position:absolute;width:66px;height:66px;border-radius:50%;
          border:2px solid color-mix(in srgb,var(--c) 60%,#7fb6ff);opacity:0;pointer-events:none}
        .wake .ping{animation:ping 2.2s ease-out 2}
        @keyframes ping{0%{transform:scale(.9);opacity:.75}100%{transform:scale(1.7);opacity:0}}

        .bubble{position:relative;width:min(21rem,calc(100vw - 2 * var(--m,20px) - 210px));
          background:
            linear-gradient(160deg,rgba(22,36,58,.92),rgba(8,15,28,.94)) padding-box,
            linear-gradient(140deg,rgba(125,211,252,.55),rgba(255,255,255,.08) 38%,color-mix(in srgb,var(--c) 70%,#3b82f6)) border-box;
          border:1px solid transparent;border-radius:22px;padding:18px 20px 18px;overflow:hidden;
          backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);
          box-shadow:0 30px 60px -28px rgba(0,0,0,.9),0 0 0 1px rgba(0,0,0,.2),
                     0 0 48px -18px color-mix(in srgb,var(--c) 60%,#38bdf8);
          opacity:0;transform:translateY(10px) scale(.94);transform-origin:center var(--origin,right);
          transition:opacity .28s ease,transform .45s cubic-bezier(.2,1.4,.4,1);pointer-events:none}
        .bubble::before{content:"";position:absolute;inset:0 0 auto;height:90px;pointer-events:none;
          background:radial-gradient(120% 90% at 20% 0%,rgba(56,189,248,.16),transparent 70%)}
        .bar{position:absolute;inset:auto 0 0;height:2px;transform-origin:left;transform:scaleX(0);
          background:linear-gradient(90deg,#3b82f6,#22d3ee)}
        :host([dir="rtl"]) .bar{transform-origin:right}
        .open.timed .bar{animation:drain var(--t,5s) linear forwards}
        @keyframes drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
        .open .bubble > *:not(.bar):not(.close){animation:rise .5s cubic-bezier(.2,.9,.3,1) both}
        .open .bubble h3{animation-delay:.05s}.open .bubble p{animation-delay:.1s}
        .open .bubble .cta,.open .bubble .ask{animation-delay:.16s}
        @keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .open .bubble{opacity:1;transform:none;pointer-events:auto}

        .tag{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;
          letter-spacing:.09em;text-transform:uppercase;color:#7dd3fc;
          background:rgba(56,189,248,.10);border:1px solid rgba(56,189,248,.22);
          border-radius:999px;padding:4px 10px 4px 8px}
        .tag i{width:5px;height:5px;border-radius:50%;background:currentColor;
          box-shadow:0 0 8px currentColor}
        h3{margin:11px 0 0;font-size:19px;font-weight:800;color:#f5f9ff;line-height:1.3;letter-spacing:-.01em}
        p{margin:7px 0 0;font-size:14px;line-height:1.75;color:#b3c0d2}
        .cta{display:inline-flex;align-items:center;gap:7px;margin-top:12px;
          font-size:13px;font-weight:700;text-decoration:none;color:#fff;
          background:linear-gradient(135deg,#3b82f6,#06b6d4);
          box-shadow:0 8px 22px -10px rgba(34,211,238,.8);
          border-radius:999px;padding:9px 16px;transition:transform .2s ease,box-shadow .2s ease}
        .cta:hover{transform:translateY(-1px);box-shadow:0 12px 28px -10px rgba(34,211,238,.95)}
        .cta:focus-visible{outline:2px solid #9ecbff;outline-offset:2px}
        .cta svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.4;
          stroke-linecap:round;stroke-linejoin:round}
        :host([dir="rtl"]) .cta svg{transform:scaleX(-1)}
        .close{position:absolute;inset-block-start:8px;inset-inline-end:8px;width:26px;height:26px;
          border:0;border-radius:50%;background:rgba(255,255,255,.07);color:#8d9bb0;cursor:pointer;
          display:grid;place-items:center}
        .close:hover{background:rgba(255,255,255,.14);color:#e6edf7}
        .close svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
        .close:focus-visible{outline:2px solid #9ecbff;outline-offset:2px}

        /* ---------- chat ---------- */
        .ask{display:inline-flex;align-items:center;gap:7px;margin-top:10px;margin-inline-start:8px;
          font-size:13px;font-weight:700;cursor:pointer;color:#cfe0f5;
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);
          border-radius:999px;padding:8px 15px}
        .ask:hover{background:rgba(255,255,255,.16);color:#fff}
        .ask:focus-visible{outline:2px solid #9ecbff;outline-offset:2px}

        .chat{position:absolute;inset-block-start:50%;translate:0 -50%;inset-inline-start:0;
          width:min(25rem,calc(100vw - 2 * var(--m,20px)));
          height:min(35rem,calc(100vh - 2 * var(--m,20px) - 20px));
          display:flex;flex-direction:column;
          background:
            radial-gradient(120% 60% at 10% 0%,rgba(56,189,248,.14),transparent 60%) padding-box,
            linear-gradient(180deg,rgba(15,26,44,.96),rgba(6,12,22,.97)) padding-box,
            linear-gradient(150deg,rgba(125,211,252,.5),rgba(255,255,255,.07) 40%,color-mix(in srgb,var(--c) 70%,#3b82f6)) border-box;
          border:1px solid transparent;border-radius:24px;overflow:hidden;
          backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);
          box-shadow:0 40px 80px -30px rgba(0,0,0,.95),0 0 60px -24px rgba(56,189,248,.55);
          opacity:0;transform:translateY(10px) scale(.98);pointer-events:none;
          transition:opacity .2s ease,transform .2s ease}
        :host([dir="rtl"]) .chat{direction:rtl}
        .chatting .chat{opacity:1;transform:none;pointer-events:auto}
        .chatting .bubble{opacity:0;pointer-events:none}

        .chat header{display:flex;align-items:center;gap:10px;padding:13px 15px;
          border-bottom:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03)}
        .chat header .nm{font-size:15px;font-weight:800;color:#f3f7fd;display:block}
        .chat header .who{flex:1;min-width:0}
        .chat header .face{width:38px;height:38px;border-radius:12px;flex:none;display:grid;place-items:center;
          background:linear-gradient(135deg,#3b82f6,#06b6d4);box-shadow:0 6px 18px -8px rgba(34,211,238,.9)}
        .chat header .face svg{width:24px;height:24px}
        .chat header .st{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:#86efac}
        .chat header .st::before{content:"";width:7px;height:7px;border-radius:50%;background:#22c55e;
          box-shadow:0 0 0 3px rgba(34,197,94,.2);animation:blip 2s ease-in-out infinite}
        .chat .log{flex:1;overflow-y:auto;padding:14px 15px;display:flex;flex-direction:column;gap:10px;
          scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}
        .msg{max-width:86%;font-size:13.5px;line-height:1.7;padding:9px 13px;border-radius:14px;
          white-space:pre-wrap;overflow-wrap:anywhere}
        .msg.bot{display:block;width:auto;height:auto;align-self:flex-start;background:rgba(255,255,255,.07);color:#dfe7f2;
          border:1px solid rgba(255,255,255,.09);border-start-start-radius:5px}
        .msg{animation:rise .35s cubic-bezier(.2,.9,.3,1) both}
        .msg.bot a{color:#7dd3fc;font-weight:700;text-decoration:underline;text-underline-offset:3px}
        .msg.me{align-self:flex-end;background:linear-gradient(135deg,#2563eb,#0891b2);color:#fff;
          box-shadow:0 8px 20px -12px rgba(34,211,238,.8);
          border-end-end-radius:5px}
        .msg.note{align-self:center;background:none;border:0;color:#6d7c90;font-size:11.5px;
          text-align:center;padding:0}
        .dots{display:inline-flex;gap:4px}
        .dots i{width:5px;height:5px;border-radius:50%;background:#8fa3bb;animation:dot 1.1s infinite}
        .dots i:nth-child(2){animation-delay:.15s}
        .dots i:nth-child(3){animation-delay:.3s}
        @keyframes dot{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}

        .chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 15px 10px}
        .chips button{font:inherit;font-size:12px;font-weight:600;cursor:pointer;color:#b9c8da;
          background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.13);
          border-radius:999px;padding:7px 13px;animation:rise .4s cubic-bezier(.2,.9,.3,1) both;
          transition:background .2s ease,border-color .2s ease,color .2s ease}
        .chips button:hover{background:rgba(56,189,248,.14);border-color:rgba(56,189,248,.45);color:#fff}
        .chips button:focus-visible{outline:2px solid #9ecbff;outline-offset:2px}

        .compose{display:flex;gap:8px;padding:11px 12px;border-top:1px solid rgba(255,255,255,.10);
          background:rgba(255,255,255,.03)}
        .compose input{flex:1;min-width:0;font:inherit;font-size:13.5px;color:#eef3fa;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);
          border-radius:999px;padding:10px 15px}
        .compose input::placeholder{color:#6f7e92}
        .compose input:focus{outline:2px solid color-mix(in srgb,var(--c) 60%,#7fb6ff);outline-offset:0}
        .compose button{flex:none;width:40px;height:40px;border:0;border-radius:50%;cursor:pointer;
          background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;display:grid;place-items:center;
          box-shadow:0 8px 20px -10px rgba(34,211,238,.9);transition:transform .2s ease}
        .compose button:not(:disabled):hover{transform:scale(1.06)}
        .compose button:disabled{opacity:.45;cursor:default}
        .compose button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.3;
          stroke-linecap:round;stroke-linejoin:round}
        :host([dir="rtl"]) .compose button svg{transform:scaleX(-1)}

        @media (max-width:520px){
          .chat{width:min(22rem,calc(100vw - 2 * var(--m,20px)));height:min(30rem,calc(100vh - 120px))}
          .avatar,.ping{width:58px;height:58px}
          svg.bot{width:38px;height:38px}
          .is3d .avatar{width:138px;height:138px}
          .bubble{width:min(17rem,calc(100vw - 2 * var(--m,20px) - 156px));padding:13px 15px}
          h3{font-size:15px} p{font-size:12.8px}
        }
        @media (prefers-reduced-motion:reduce){
          .avatar,.bubble{transition:none}
          .wake .ping,.bot .float,.bot .bulb,.bot .eyes circle,.bubble > *,.msg,.chips button,.bar{animation:none!important}
        }
      </style>
      <div class="stack" part="stack">
        <button class="avatar" type="button" aria-expanded="false">
          <span class="ping"></span>
          <canvas class="stage" aria-hidden="true"></canvas>
          <svg class="bot" viewBox="0 0 72 72" aria-hidden="true">
            <defs>
              <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f2f8ff"/><stop offset="1" stop-color="#aec6e2"/>
              </linearGradient>
              <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#10273e"/><stop offset="1" stop-color="#040d18"/>
              </linearGradient>
            </defs>
            <g class="float">
              <line class="ant" x1="36" y1="20" x2="36" y2="11"/>
              <circle class="bulb" cx="36" cy="7.5" r="3.6"/>
              <rect class="ear" x="7" y="33" width="6" height="13" rx="3"/>
              <rect class="ear" x="59" y="33" width="6" height="13" rx="3"/>
              <rect class="head" x="14" y="19" width="44" height="39" rx="13"/>
              <rect class="visor" x="20" y="27" width="32" height="22" rx="10"/>
              <g class="eyes">
                <circle cx="29.5" cy="38" r="3.6"/>
                <circle cx="42.5" cy="38" r="3.6"/>
              </g>
              <rect class="smile" x="31" y="45.5" width="10" height="2.4" rx="1.2"/>
            </g>
          </svg>
        </button>
        <div class="bubble" role="status" aria-live="polite">
          <button class="close" type="button"></button>
          <span class="tag"><i></i><span class="tag-t"></span></span>
          <h3></h3>
          <p></p>
          <a class="cta" hidden></a>
          <button class="ask" type="button"></button>
          <span class="bar" aria-hidden="true"></span>
        </div>
        <div class="chat" role="dialog" aria-modal="false" hidden>
          <header>
            <span class="face" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="7" width="16" height="12" rx="4"/><path d="M12 7V4"/><circle cx="12" cy="3" r="1"/><circle cx="9" cy="13" r="1.2" fill="#fff"/><circle cx="15" cy="13" r="1.2" fill="#fff"/></svg></span>
            <span class="who"><span class="nm"></span><span class="st"></span></span>
            <button class="close chat-x" type="button"></button>
          </header>
          <div class="log"></div>
          <div class="chips"></div>
          <form class="compose">
            <input type="text" autocomplete="off" maxlength="1000">
            <button type="submit"></button>
          </form>
        </div>
      </div>`;

    this._el = {
      stack: this._root.querySelector('.stack'),
      avatar: this._root.querySelector('.avatar'),
      bubble: this._root.querySelector('.bubble'),
      tag: this._root.querySelector('.tag-t'),
      title: this._root.querySelector('h3'),
      body: this._root.querySelector('p'),
      cta: this._root.querySelector('.cta'),
      close: this._root.querySelector('.close'),
      stage: this._root.querySelector('.stage'),
      flyer: this._root.querySelector('.stack'),
      ask: this._root.querySelector('.ask'),
      chat: this._root.querySelector('.chat'),
      chatName: this._root.querySelector('.chat .nm'),
      chatState: this._root.querySelector('.chat .st'),
      chatX: this._root.querySelector('.chat-x'),
      log: this._root.querySelector('.log'),
      chips: this._root.querySelector('.chips'),
      form: this._root.querySelector('.compose'),
      input: this._root.querySelector('.compose input'),
      send: this._root.querySelector('.compose button'),
    };
    this._el.close.innerHTML = ICON_CLOSE;
    this._el.chatX.innerHTML = ICON_CLOSE;
    this._el.send.innerHTML = ICON_SEND;
    this._el.ask.addEventListener('click', () => this._openChat());
    this._el.chatX.addEventListener('click', () => this._closeChat());
    this._el.form.addEventListener('submit', (e) => { e.preventDefault(); this._send(this._el.input.value); });
    this._el.avatar.addEventListener('click', () => {
      if (this._chatOpen) return this._closeChat();
      if (this._open) return this._hide(true);
      this._show(true);
    });
    this._el.close.addEventListener('click', () => this._hide(true));
    this._el.cta.addEventListener('click', (e) => {
      if (this._el.cta.getAttribute('href') === '#chat') { e.preventDefault(); this._openChat(); return; }
      this._hide(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (this._chatOpen) this._closeChat();
      else if (this._open) this._hide(true);
    });
  }

  _applyVars() {
    const rtl = isArabic();
    this.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    this.style.setProperty('--c', this.color);
    this.style.setProperty('--m', this.margin);
    this.style.insetInlineStart = '';
    this.style.insetInlineEnd = '';
    this.style[this.side === 'left' ? 'left' : 'right'] = this.margin;
    this.style[this.side === 'left' ? 'right' : 'left'] = 'auto';
    this._el.stack.style.setProperty('--dir', this.side === 'left' ? 'row' : 'row-reverse');
    this._el.bubble.style.setProperty('--origin', this.side === 'left' ? 'left' : 'right');
    this._el.avatar.setAttribute('aria-label',
      rtl ? 'مساعد أوتو سينكس — شرح هذا القسم' : 'Auto Synex guide — explain this section');
    this._el.close.setAttribute('aria-label', rtl ? 'إخفاء' : 'Dismiss');
    const t = UI[rtl ? 'ar' : 'en'];
    this._el.ask.textContent = t.ask;
    this._el.ask.hidden = this.getAttribute('chat') === 'off';
    this._el.chatName.textContent = t.title;
    this._el.chatState.textContent = t.online;
    this._el.chatX.setAttribute('aria-label', rtl ? 'إغلاق المحادثة' : 'Close chat');
    this._el.input.placeholder = t.ph;
    this._el.send.setAttribute('aria-label', t.send);
    this._el.chat.setAttribute('aria-label', t.title);
    if (this._chips !== (rtl ? 'ar' : 'en')) this._renderChips();
  }

  /* -------------------------------------------------------------- sections */
  /** Tag the build's own sections so they behave like authored data-bot-* ones. */
  _applyDefaults() {
    const lang = isArabic() ? 'ar' : 'en';
    const switched = this._lang !== undefined && this._lang !== lang;
    this._lang = lang;
    for (const [id, copy] of Object.entries(DEFAULTS)) {
      const el = id[0] === '@' ? document.querySelector(id.slice(1)) : document.getElementById(id);
      if (!el) continue;
      const c = copy[lang];
      if (el.dataset.botLang === lang && el.dataset.botTag) continue;
      el.dataset.botLang = lang;
      el.dataset.botTag = c.tag;
      el.dataset.botTitle = c.title;
      el.dataset.botBody = c.body;
      if (c.cta) { el.dataset.botCta = c.cta; el.dataset.botCtaHref = c.href; }
    }
    return switched;
  }

  _collect() {
    // The site switches language in place — re-say the current section in the new one.
    if (this._applyDefaults() && this._current) this._fill(this._current);
    const found = Array.from(document.querySelectorAll('[data-bot-tag]'));
    const added = found.filter((el) => !this._sections.includes(el));
    if (!added.length && found.length === this._sections.length) return;
    this._sections = found;

    this._io ||= new IntersectionObserver((entries) => {
      for (const e of entries) this._ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
      this._pick(false);
    }, { threshold: [0, 0.25, 0.5, 0.75] });

    for (const el of added) this._io.observe(el);
  }

  /** React owns the DOM: re-tag and re-observe whenever it re-renders. */
  _observeDom() {
    let queued = false;
    this._mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; this._collect(); this._applyVars(); this._pick(false); }, 60);
    });
    const root = document.getElementById('root') || document.body;
    this._mo.observe(root, { childList: true, subtree: true });
    this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
  }

  /** Most-visible tagged section wins. */
  _pick(force) {
    let best = null;
    let ratio = 0.12;
    for (const el of this._sections) {
      const r = this._ratios.get(el) || 0;
      if (r > ratio) { ratio = r; best = el; }
    }
    if (!best) return;
    const changed = best !== this._current;
    this._current = best;
    if (!changed && !force) return;
    if (this._chatOpen) return;
    this._fill(best);
    if (!this._dismissed || force) this._show(false);
  }

  _fill(el) {
    const d = el.dataset;
    this._el.tag.textContent = d.botTag || '';
    this._el.title.textContent = d.botTitle || '';
    this._el.body.textContent = d.botBody || '';
    const cta = d.botCta && d.botCtaHref;
    this._el.cta.hidden = !cta;
    if (cta) {
      this._el.cta.href = d.botCtaHref;
      this._el.cta.innerHTML = '';
      this._el.cta.append(d.botCta);
      this._el.cta.insertAdjacentHTML('beforeend', ICON_ARROW);
    }
  }

  /* ------------------------------------------------------------------ chat */
  get endpoint() {
    const v = this.getAttribute('chat');
    return !v || v === 'off' || v === 'on' ? '/api/chat' : v;
  }

  _openChat() {
    this._chatOpen = true;
    clearTimeout(this._timer);
    this._el.chat.hidden = false;
    this._el.stack.classList.add('chatting');
    this._el.avatar.setAttribute('aria-expanded', 'true');
    if (!this._history) {
      this._history = [];
      const lang = isArabic() ? 'ar' : 'en';
      const section = this._current && this._current.dataset.botBody;
      this._addMsg('bot', section || localAnswer('', lang));
      this._renderChips();
    }
    this._robot?.react('nod');
    setTimeout(() => this._el.input.focus({ preventScroll: true }), 60);
  }

  _closeChat() {
    this._chatOpen = false;
    this._el.stack.classList.remove('chatting');
    this._el.avatar.setAttribute('aria-expanded', 'false');
    this._el.avatar.classList.add('wake');
    setTimeout(() => { if (!this._chatOpen) this._el.chat.hidden = true; }, 220);
  }

  _renderChips(list) {
    const lang = isArabic() ? 'ar' : 'en';
    this._chips = lang;
    this._el.chips.innerHTML = '';
    for (const [i, q] of (list || UI[lang].chips).entries()) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.style.animationDelay = (i * 60) + 'ms';
      b.addEventListener('click', () => this._send(q));
      this._el.chips.appendChild(b);
    }
  }

  /** Demo paths and #contact in a reply become real links; everything else stays text. */
  _linkify(el, text) {
    el.textContent = '';
    for (const part of text.split(/((?:https?:\/\/)?(?:autosynex\.com)?\/demos[\w\/-]*|#contact)/g)) {
      if (!part) continue;
      if (/\/demos|#contact/.test(part)) {
        const a = document.createElement('a');
        a.href = part.replace(/^(?:https?:\/\/)?autosynex\.com/, '');
        a.textContent = part.replace(/^https?:\/\//, '');
        el.appendChild(a);
      } else el.appendChild(document.createTextNode(part));
    }
  }

  /** Types the reply out, fast enough to never feel like waiting. */
  _reveal(el, text) {
    el.classList.remove('typing');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve(this._linkify(el, text));
    return new Promise((done) => {
      const step = Math.max(2, Math.ceil(text.length / 70));
      let i = 0;
      const tick = () => {
        i = Math.min(text.length, i + step);
        el.textContent = text.slice(0, i);
        this._el.log.scrollTop = this._el.log.scrollHeight;
        if (i < text.length) this._typeRaf = setTimeout(tick, 16);
        else { this._linkify(el, text); done(); }
      };
      tick();
    });
  }

  _addMsg(who, text) {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    if (text === null) { el.classList.add('typing'); el.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>'; }
    else if (who === 'bot') this._linkify(el, text);
    else el.textContent = text;
    this._el.log.appendChild(el);
    this._el.log.scrollTop = this._el.log.scrollHeight;
    return el;
  }

  async _send(text) {
    const q = (text || '').trim();
    if (!q || this._busy) return;
    const lang = isArabic() ? 'ar' : 'en';
    this._busy = true;
    this._el.input.value = '';
    this._el.send.disabled = true;
    this._el.chips.innerHTML = '';
    this._addMsg('me', q);
    this._history.push({ role: 'user', content: q });
    const typing = this._addMsg('bot', null);
    this._robot?.react('talk');

    let reply = null;
    let chips = null;
    let offline = false;
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this._history.slice(-12),
          lang,
          section: this._current ? { tag: this._current.dataset.botTag, title: this._current.dataset.botTitle } : null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || null;
        if (Array.isArray(data.suggestions)) chips = data.suggestions.slice(0, 3);
      } else {
        offline = true; // no key on the deployment, rate limited, or upstream error
      }
    } catch {
      offline = true;
    }
    const local = think(q, lang);
    if (!reply) { reply = local.text; offline = true; }

    this._robot?.react('talk');
    await this._reveal(typing, reply);
    this._renderChips(chips || local.chips);
    this._history.push({ role: 'assistant', content: reply });
    if (offline && !this._noted) {
      this._noted = true;
      this._addMsg('note', UI[lang].offline);
    }
    this._el.log.scrollTop = this._el.log.scrollHeight;
    this._busy = false;
    this._el.send.disabled = false;
    this._el.input.focus({ preventScroll: true });
  }

  _show(byUser) {
    if (this._chatOpen) return;
    if (byUser) this._dismissed = false;
    this._open = true;
    this._el.stack.classList.add('open');
    this._el.avatar.setAttribute('aria-expanded', 'true');
    this._el.avatar.classList.remove('wake');
    this._el.stack.classList.add('talking');
    this._robot?.react('talk');
    setTimeout(() => this._el.stack.classList.remove('talking'), 1000);
    clearTimeout(this._timer);
    const timed = !this.sticky && !byUser;
    // Restart the countdown bar so it always matches the time left.
    this._el.stack.classList.remove('timed');
    void this._el.stack.offsetWidth;
    this._el.stack.style.setProperty('--t', this.collapseAfter + 'ms');
    this._el.stack.classList.toggle('timed', timed);
    if (timed) {
      this._timer = setTimeout(() => this._hide(false), this.collapseAfter);
    }
  }

  _hide(byUser) {
    if (this._chatOpen) return;
    this._open = false;
    if (byUser) this._dismissed = true;
    this._el.stack.classList.remove('open');
    this._el.avatar.setAttribute('aria-expanded', 'false');
    this._el.avatar.classList.add('wake');
    clearTimeout(this._timer);
  }
}

if (!customElements.get('synex-bot')) customElements.define('synex-bot', SynexBot);
