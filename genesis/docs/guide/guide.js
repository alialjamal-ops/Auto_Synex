// Same file drives three outputs:
//   ?print            → every slide fully shown, one per page (PDF)
//   ?slide=N          → slide N fully shown (PNG)
//   seek(t)           → animated video timeline
const params = new URLSearchParams(location.search);
const slides = [...document.querySelectorAll(".slide")];
const N = slides.length;
const PER = 5.4, COVER = 4.6, LAST = 6.5;             // seconds per slide
const starts = slides.map((_, i) => (i === 0 ? 0 : COVER + (i - 1) * PER));
window.DURATION = starts[N - 1] + LAST;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const eo = (x) => 1 - Math.pow(1 - x, 4);
const reveal = (el, p) => { el.style.opacity = p; el.style.transform = `translateY(${(1 - p) * 34}px)`; };

function showAll(el) { el.querySelectorAll(".r").forEach((r) => reveal(r, 1)); }

window.seek = (t) => {
  slides.forEach((s, i) => {
    const a = starts[i], b = i < N - 1 ? starts[i + 1] : Infinity;
    const vis = t >= a - 0.001 && t < b;
    const fadeIn = i === 0 ? 1 : eo(clamp((t - a) / 0.45));
    const fadeOut = i < N - 1 ? clamp((t - (b - 0.35)) / 0.35) : 0;
    s.style.visibility = vis ? "visible" : "hidden";
    s.style.opacity = fadeIn * (1 - fadeOut);
    s.style.transform = `translateX(${(1 - fadeIn) * -60 + fadeOut * 60}px)`;
    s.querySelectorAll(".r").forEach((r, k) => reveal(r, eo(clamp((t - a - 0.25 - k * 0.13) / 0.55))));
  });
  document.querySelector("#progress i").style.width = `${(t / window.DURATION) * 100}%`;
};

if (params.has("print")) { document.body.classList.add("print"); slides.forEach(showAll); }
else if (params.has("slide")) { const n = +params.get("slide"); slides.forEach((s, i) => { s.style.visibility = i === n ? "visible" : "hidden"; }); showAll(slides[n]); document.querySelector("#progress").style.display = "none"; }
else { window.seek(0); }
window.ready = Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]);
