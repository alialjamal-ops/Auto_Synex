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
  contact: {
    en: { tag: 'Contact', title: 'Tell us what you need', body: 'Send the business type and what you want it to do. You get a scoped answer, not a brochure.' },
    ar: { tag: 'تواصل', title: 'أخبرنا بما تحتاجه', body: 'أرسل نوع النشاط وما تريده أن يفعله، وتصلك إجابة محدّدة لا كتيّب تعريفي.' },
  },
};

const ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

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
    // Let the hero settle before the bot announces itself.
    this._hello = setTimeout(() => this._pick(true), 1100);
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
    clearTimeout(this._hello);
    this._io?.disconnect();
    this._mo?.disconnect();
  }

  /* --------------------------------------------------------------- markup */
  _render() {
    this._root.innerHTML = `
      <style>
        :host{position:fixed;z-index:2147483000;inset-block-end:var(--m,20px);
              font-family:'Cairo',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
              color-scheme:dark}
        :host([hidden]){display:none}
        .stack{display:flex;align-items:flex-end;gap:10px;flex-direction:var(--dir,row-reverse);
          direction:ltr}  /* placement is physical: RTL must not swap the robot and the bubble */
        :host([dir="rtl"]) .bubble{direction:rtl}

        .avatar{width:66px;height:66px;flex:none;border:0;padding:0;cursor:pointer;border-radius:50%;
          background:linear-gradient(150deg,color-mix(in srgb,var(--c) 45%,#7cc0ff),var(--c) 58%,
                     color-mix(in srgb,var(--c) 78%,#04101f));
          box-shadow:0 10px 30px -8px rgba(4,12,28,.75),0 0 0 1px rgba(255,255,255,.30),
                     0 0 26px -6px color-mix(in srgb,var(--c) 50%,#5aa9ff);
          display:grid;place-items:center;transition:transform .22s ease,box-shadow .22s ease}
        .avatar:hover{transform:translateY(-2px) scale(1.04)}
        .avatar:focus-visible{outline:3px solid #9ecbff;outline-offset:3px}
        .bot{width:44px;height:44px;display:block;overflow:visible;
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

        .bubble{position:relative;width:min(19rem,calc(100vw - 2 * var(--m,20px) - 82px));
          background:linear-gradient(180deg,#101a29,#0a1220);
          border:1px solid rgba(255,255,255,.12);border-radius:18px;
          padding:15px 17px 15px;box-shadow:0 22px 52px -22px rgba(0,0,0,.85);
          opacity:0;transform:translateY(8px) scale(.97);transform-origin:bottom var(--origin,right);
          transition:opacity .22s ease,transform .22s ease;pointer-events:none}
        .open .bubble{opacity:1;transform:none;pointer-events:auto}

        .tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;
          letter-spacing:.06em;text-transform:uppercase;
          color:color-mix(in srgb,var(--c) 35%,#9ecbff)}
        .tag i{width:5px;height:5px;border-radius:50%;background:currentColor;
          box-shadow:0 0 8px currentColor}
        h3{margin:7px 0 0;font-size:16.5px;font-weight:800;color:#f2f6fc;line-height:1.35}
        p{margin:6px 0 0;font-size:13.5px;line-height:1.72;color:#a9b5c6}
        .cta{display:inline-flex;align-items:center;gap:7px;margin-top:12px;
          font-size:13px;font-weight:700;text-decoration:none;color:#fff;
          background:color-mix(in srgb,var(--c) 82%,#4d8ff0);
          border-radius:999px;padding:8px 15px;transition:filter .2s ease}
        .cta:hover{filter:brightness(1.15)}
        .cta svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.4;
          stroke-linecap:round;stroke-linejoin:round}
        :host([dir="rtl"]) .cta svg{transform:scaleX(-1)}
        .close{position:absolute;inset-block-start:8px;inset-inline-end:8px;width:26px;height:26px;
          border:0;border-radius:50%;background:rgba(255,255,255,.07);color:#8d9bb0;cursor:pointer;
          display:grid;place-items:center}
        .close:hover{background:rgba(255,255,255,.14);color:#e6edf7}
        .close svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
        .close:focus-visible{outline:2px solid #9ecbff;outline-offset:2px}

        @media (max-width:520px){
          .avatar,.ping{width:58px;height:58px}
          .bot{width:38px;height:38px}
          .bubble{width:min(17rem,calc(100vw - 2 * var(--m,20px) - 72px));padding:13px 15px}
          h3{font-size:15px} p{font-size:12.8px}
        }
        @media (prefers-reduced-motion:reduce){
          .avatar,.bubble{transition:none}
          .wake .ping,.bot .float,.bot .bulb,.bot .eyes circle{animation:none}
        }
      </style>
      <div class="stack" part="stack">
        <button class="avatar" type="button" aria-expanded="false">
          <span class="ping"></span>
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
    };
    this._el.close.innerHTML = ICON_CLOSE;
    this._el.avatar.addEventListener('click', () => (this._open ? this._hide(true) : this._show(true)));
    this._el.close.addEventListener('click', () => this._hide(true));
    this._el.cta.addEventListener('click', () => this._hide(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this._open) this._hide(true); });
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
  }

  /* -------------------------------------------------------------- sections */
  /** Tag the build's own sections so they behave like authored data-bot-* ones. */
  _applyDefaults() {
    const lang = isArabic() ? 'ar' : 'en';
    const switched = this._lang !== undefined && this._lang !== lang;
    this._lang = lang;
    for (const [id, copy] of Object.entries(DEFAULTS)) {
      const el = document.getElementById(id);
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

  _show(byUser) {
    if (byUser) this._dismissed = false;
    this._open = true;
    this._el.stack.classList.add('open');
    this._el.avatar.setAttribute('aria-expanded', 'true');
    this._el.avatar.classList.remove('wake');
    this._el.stack.classList.add('talking');
    setTimeout(() => this._el.stack.classList.remove('talking'), 1000);
    clearTimeout(this._timer);
    if (!this.sticky && !byUser) {
      this._timer = setTimeout(() => this._hide(false), this.collapseAfter);
    }
  }

  _hide(byUser) {
    this._open = false;
    if (byUser) this._dismissed = true;
    this._el.stack.classList.remove('open');
    this._el.avatar.setAttribute('aria-expanded', 'false');
    this._el.avatar.classList.add('wake');
    clearTimeout(this._timer);
  }
}

if (!customElements.get('synex-bot')) customElements.define('synex-bot', SynexBot);
