// Exports the Lucide icons used by the guide as inline SVG strings (icons.json).
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const L = require("lucide-react");
const names = ["CalendarCheck2","LayoutDashboard","Cpu","Smartphone","Users","Database","Mail","Globe","ServerOff","Server","Building2","Store","Clock","CircleDollarSign","Wallet","Rocket","CheckCircle2","ShieldCheck","AlertTriangle","Link","UserPlus","LayoutTemplate","Send","Sparkles","Wrench","TrendingUp","ArrowLeft","Lock","BellRing","Layers","CreditCard","Banknote","Zap","MessageCircle"];
const out = {};
for (const n of names) {
  if (!L[n]) { console.error("missing", n); continue; }
  out[n] = renderToStaticMarkup(React.createElement(L[n], { size: 48, strokeWidth: 1.75 }));
}
require("fs").writeFileSync(__dirname + "/icons.json", JSON.stringify(out));
console.log(Object.keys(out).length, "icons");
