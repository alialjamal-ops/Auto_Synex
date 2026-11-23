"""Builds guide.html: an 11-slide Arabic explainer used for the PDF, the PNG slides and the video."""
import json, pathlib
HERE = pathlib.Path(__file__).parent
I = json.loads((HERE / "icons.json").read_text())

def ic(name, cls="ic"):
    return f'<span class="{cls}">{I[name]}</span>'

def card(icon, title, body, extra=""):
    return f'<div class="card r {extra}">{ic(icon)}<h3>{title}</h3><p>{body}</p></div>'

S = []  # slides

# 1 Cover
S.append(f'''
<div class="cover">
  <img class="r tile" src="../../public/brand/logo-tile.png" />
  <div class="r kicker">دليل تشغيل المنصة</div>
  <h1 class="r big">Auto Synex <span class="blue">Booking OS</span></h1>
  <p class="r lead">من ديمو تفاعلي إلى نظام حجز حقيقي يخدم عشرة أنشطة تجارية</p>
  <div class="r chips"><span>الاستضافة</span><span>قاعدة البيانات</span><span>إضافة الأنشطة</span><span>التكلفة والربح</span></div>
</div>''')

# 2 What it is
S.append(f'''
<h2 class="r">ما هو النظام؟</h2>
<p class="r sub">منصة حجز مواعيد واحدة تخدم العيادات والصالونات والأكاديميات والاستوديوهات</p>
<div class="grid3">
  {card("Smartphone", "صفحة الحجز", "يختار العميل الخدمة والموظف والوقت ويحجز خلال دقيقة، ويعدّل حجزه أو يلغيه بنفسه.")}
  {card("LayoutDashboard", "لوحة التحكم", "لصاحب النشاط وفريقه: التقويم، المواعيد، العملاء، الخدمات، ساعات العمل والتحليلات.")}
  {card("Cpu", "محرك الحجز", "يطبّق القواعد تلقائياً: ساعات العمل، الفواصل، منع التعارض، سعة الجلسات ومهلة الإلغاء.")}
</div>
<div class="shots r">
  <img src="../../promo/assets/dash-light-ar.jpg" class="shot-wide" />
  <img src="../../promo/assets/phone-ar.jpg" class="shot-phone" />
</div>''')

# 3 Current state
S.append(f'''
<h2 class="r">أين نحن الآن؟</h2>
<p class="r sub">الواجهة كاملة ومنشورة، لكنها تعمل كديمو</p>
<div class="url r">{ic("Globe")}<span dir="ltr">auto-synex-genesis.vercel.app</span></div>
<div class="grid3">
  {card("AlertTriangle", "البيانات في المتصفح", "كل زائر يرى نسخته فقط، فالحجز لا يصل إلى صاحب النشاط.", "warn")}
  {card("Lock", "بدون تسجيل دخول", "أي شخص يستطيع فتح لوحة التحكم.", "warn")}
  {card("BellRing", "بدون إشعارات", "لا رسائل تأكيد أو تذكير للعملاء.", "warn")}
</div>
<div class="note r">{ic("CheckCircle2")}<span>الحل: قاعدة بيانات مركزية وتسجيل دخول. الواجهة جاهزة ولن تتغير.</span></div>''')

# 4 How it works online
S.append(f'''
<h2 class="r">كيف يعمل النظام أونلاين؟</h2>
<p class="r sub">ثلاث خدمات سحابية، ولا حاجة لسيرفر تديره بنفسك</p>
<div class="flow">
  <div class="node r">{ic("Users")}<b>العميل وصاحب النشاط</b><small>من الموبايل أو الكمبيوتر</small></div>
  <div class="arrow r">{ic("ArrowLeft")}</div>
  <div class="node main r">{ic("Globe")}<b>Vercel</b><small>الموقع والكود الذي يطبّق القواعد</small></div>
  <div class="arrow r">{ic("ArrowLeft")}</div>
  <div class="col">
    <div class="node r">{ic("Database")}<b>Supabase</b><small>قاعدة البيانات وتسجيل الدخول</small></div>
    <div class="node r">{ic("Mail")}<b>Resend</b><small>إيميلات التأكيد والتذكير</small></div>
  </div>
</div>
<div class="example r"><b>مثال:</b> سارة تحجز في الصالون من موبايلها ← Vercel يتأكد أن الموعد متاح ويحفظه في Supabase ← يصلها إيميل تأكيد ← الحجز يظهر فوراً في لوحة تحكم الصالون.</div>''')

# 5 Server?
S.append(f'''
<h2 class="r">هل تحتاج سيرفر؟</h2>
<p class="r sub">لا. الاستضافة المُدارة توفّر وقتك للعملاء والمبيعات بدل الصيانة</p>
<div class="cmp">
  <div class="opt rec r">
    <div class="badge">ننصح به</div>
    {ic("ServerOff")}<h3>استضافة مُدارة</h3><p class="muted">Vercel + Supabase</p>
    <ul><li>حوالي $45 شهرياً</li><li>صيانة شبه معدومة</li><li>نسخ احتياطي يومي تلقائي</li><li>الأعطال مسؤولية الشركة</li></ul>
  </div>
  <div class="opt r">
    {ic("Server")}<h3>سيرفر خاص VPS</h3><p class="muted">Hetzner أو DigitalOcean</p>
    <ul><li>حوالي $5 إلى $10 شهرياً</li><li>التحديثات والحماية عليك</li><li>النسخ الاحتياطي عليك</li><li>العطل في منتصف الليل عليك</li></ul>
  </div>
</div>''')

# 6 Multi-tenant
subs = ["alnakheel", "lumiere", "nexus", "cedarlight", "smile-dental", "fitzone", "glow-spa", "kids-care", "pro-academy", "vision-studio"]
chips = "".join(f'<span class="r" dir="ltr">{s}.autosynex.com</span>' for s in subs)
S.append(f'''
<h2 class="r">عشرة أنشطة على نسخة واحدة</h2>
<p class="r sub">موقع واحد وقاعدة بيانات واحدة، ولكل نشاط مساحته الخاصة (Multi-tenant)</p>
<div class="tenant">
  <div class="core r"><img src="../../public/brand/logo-tile.png" /><b>منصة واحدة</b></div>
  <div class="subs">{chips}</div>
</div>
<div class="grid4">
  {card("Link", "رابط خاص", "لكل نشاط رابطه الخاص")}
  {card("ShieldCheck", "بيانات معزولة", "قاعدة البيانات تمنع أي نشاط من رؤية بيانات غيره")}
  {card("Users", "حسابات دخول", "لصاحب النشاط وموظفيه")}
  {card("Sparkles", "هوية خاصة", "الاسم والشعار والألوان")}
</div>''')

# 7 Onboarding steps
steps = [("LayoutDashboard", "تدخل لوحة الإدارة", "الخاصة بك وحدك"),
         ("UserPlus", "نشاط جديد", "الاسم، النوع، الرابط، الإيميل"),
         ("LayoutTemplate", "قالب جاهز", "خدمات حسب نوع النشاط"),
         ("Send", "دعوة صاحب النشاط", "يعدّل الأسعار والفريق والساعات"),
         ("Rocket", "يبدأ الاستقبال", "يشارك رابط الحجز مع عملائه")]
st = "".join(f'<div class="step r"><div class="num">{i+1}</div>{ic(a)}<b>{b}</b><small>{c}</small></div>' for i, (a, b, c) in enumerate(steps))
S.append(f'''
<h2 class="r">كيف تضيف نشاطاً جديداً؟</h2>
<p class="r sub">حوالي عشر دقائق منك، والباقي يكمله صاحب النشاط</p>
<div class="steps">{st}</div>
<div class="note r">{ic("Clock")}<span>بعد بناء لوحة الإدارة، إضافة عميل جديد لا تحتاج أي برمجة.</span></div>''')

# 8 Costs & profit
S.append(f'''
<h2 class="r">التكلفة والربح</h2>
<p class="r sub">تكلفة ثابتة صغيرة تكفي لعشرة أنشطة وأكثر</p>
<div class="money">
  <div class="table r">
    <div><span>Vercel Pro (مطلوب للاستخدام التجاري)</span><b dir="ltr">$20</b></div>
    <div><span>Supabase Pro (نسخ احتياطي يومي)</span><b dir="ltr">$25</b></div>
    <div><span>Resend (حتى ~3,000 إيميل)</span><b>مجاني</b></div>
    <div><span>الدومين autosynex.com</span><b>متوفر</b></div>
    <div class="total"><span>المجموع الشهري</span><b dir="ltr">~$45</b></div>
  </div>
  <div class="bars r">
    <div class="bar"><i style="height:13%"></i><b dir="ltr">$45</b><small>التكلفة</small></div>
    <div class="bar"><i class="g" style="height:86%"></i><b dir="ltr">$300 - $500</b><small>إيراد 10 أنشطة<br/>($30 - $50 لكل نشاط)</small></div>
  </div>
</div>
<p class="fine r">الأسعار تقريبية، تحقق منها في مواقع الشركات قبل الاشتراك.</p>''')

# 9 Getting paid
S.append(f'''
<h2 class="r">كيف تقبض الاشتراكات كفري لانسر؟</h2>
<p class="r sub">ابدأ ببساطة، وانتقل للدفع التلقائي عندما يكبر العدد</p>
<div class="grid3">
  {card("Banknote", "الآن: فاتورة شهرية", "تحويل بنكي أو Whish أو OMT أو USDT. يكفي تماماً لعشرة عملاء.", "ok")}
  {card("CreditCard", "لاحقاً: Lemon Squeezy أو Paddle", "يقبلون الأفراد بدون شركة ويتولّون الضرائب والفواتير مقابل نسبة. تأكد من دعم بلدك.")}
  {card("Building2", "عند تأسيس شركة: Stripe", "يحتاج شركة في بلد مدعوم مثل الإمارات.")}
</div>''')

# 10 Plan
phases = [("Layers", "المرحلة 1: الأساس", "قاعدة البيانات، تسجيل الدخول، رابط لكل نشاط، لوحة الإدارة", "تشغيل أول عميل حقيقي"),
          ("MessageCircle", "المرحلة 2: التواصل", "إيميلات التأكيد والتذكير، رمز تحقق لإدارة الحجز", "تجربة احترافية للعملاء"),
          ("TrendingUp", "المرحلة 3: التوسع", "دومين خاص لكل نشاط، واتساب، دفع تلقائي", "جاهز لأكثر من عشرة")]
ph = "".join(f'<div class="phase r">{ic(a)}<h3>{b}</h3><p>{c}</p><div class="res">{ic("CheckCircle2", "ic sm")}{d}</div></div>' for a, b, c, d in phases)
S.append(f'''
<h2 class="r">خطة العمل</h2>
<p class="r sub">ثلاث مراحل، وكل مرحلة تنتهي بنتيجة قابلة للاستخدام</p>
<div class="grid3">{ph}</div>''')

# 11 Next steps
S.append(f'''
<div class="cover">
  <h2 class="r" style="margin-top:0">لنبدأ</h2>
  <p class="r sub">المطلوب منك لبدء المرحلة الأولى</p>
  <div class="todo">
    <div class="r">{ic("Database")}<span><b>افتح حساباً على supabase.com</b><small>مجاني للبداية</small></span></div>
    <div class="r">{ic("Zap")}<span><b>رقِّ Vercel إلى خطة Pro</b><small>قبل أول عميل يدفع</small></span></div>
    <div class="r">{ic("Link")}<span><b>اختر شكل الروابط</b><small dir="ltr">business.autosynex.com</small></span></div>
  </div>
  <div class="r endbrand"><img src="../../public/brand/logo-tile.png" /><span dir="ltr">AUTO <i>SYNEX</i></span></div>
</div>''')

slides = "\n".join(f'<section class="slide" data-i="{i}">{s}<div class="foot"><span dir="ltr">Auto Synex Booking OS</span><span dir="ltr">{i+1} / {len(S)}</span></div></section>' for i, s in enumerate(S))

CSS = (HERE / "guide.css").read_text()
JS = (HERE / "guide.js").read_text()
html = f'''<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" /><title>دليل تشغيل Auto Synex Booking OS</title><style>{CSS}</style></head>
<body>
<div id="deck">{slides}</div>
<div id="progress"><i></i></div>
<script>{JS}</script>
</body></html>'''
(HERE / "guide.html").write_text(html)
print("slides:", len(S))
