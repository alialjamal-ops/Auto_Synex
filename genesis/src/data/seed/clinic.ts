import type { IndustrySeed } from "./types";
import { L, people, sameHours, week } from "./helpers";

const satToThu = [6, 0, 1, 2, 3, 4] as const;

export const clinicSeed: IndustrySeed = {
  business: {
    id: "clinic",
    name: L("Al Nakheel Medical Clinic", "عيادة النخيل الطبية"),
    tagline: L("Family medicine and specialist care, without the wait.", "طب الأسرة والرعاية التخصصية، بلا انتظار."),
    industryLabel: L("Medical clinic", "عيادة طبية"),
    timezone: "Asia/Dubai",
    currency: "USD",
    phone: "+971 4 555 0142",
    email: "care@alnakheel-clinic.example",
    monogram: "AN",
    hue: 195,
    branches: [
      { id: "jumeirah", name: L("Jumeirah", "جميرا"), address: L("Al Wasl Road, Jumeirah 1, Dubai", "شارع الوصل، جميرا 1، دبي") },
      { id: "business-bay", name: L("Business Bay", "الخليج التجاري"), address: L("Bay Square, Building 7, Dubai", "باي سكوير، مبنى 7، دبي") },
    ],
    media: { cover: "/media/clinic/cover.webp", card: "/media/clinic/card.webp" },
    openingHours: week({ 6: "08:00-20:00", 0: "08:00-20:00", 1: "08:00-20:00", 2: "08:00-20:00", 3: "08:00-20:00", 4: "08:00-18:00" }),
    rules: {
      slotIntervalMin: 15,
      bufferMin: 5,
      minNoticeMin: 60,
      maxAdvanceDays: 45,
      allowStaffSelection: true,
      autoConfirm: true,
      cancellationWindowHours: 12,
      closedDates: [],
    },
    staffNoun: { singular: L("Doctor", "الطبيب"), plural: L("Doctors", "الأطباء") },
    customerNoun: { singular: L("Patient", "مريض"), plural: L("Patients", "المرضى") },
  },
  services: [
    { id: "gp", name: L("General consultation", "استشارة طب عام"), description: L("Assessment, diagnosis and treatment plan with a family physician.", "تقييم وتشخيص وخطة علاج مع طبيب الأسرة."), category: L("Family medicine", "طب الأسرة"), durationMin: 20, price: 80, capacity: 1, active: true },
    { id: "follow-up", name: L("Follow-up visit", "زيارة متابعة"), description: L("Review results and adjust treatment within 30 days of a visit.", "مراجعة النتائج وتعديل العلاج خلال 30 يوماً من الزيارة."), category: L("Family medicine", "طب الأسرة"), durationMin: 15, price: 40, capacity: 1, active: true },
    { id: "derma", name: L("Dermatology consultation", "استشارة جلدية"), description: L("Skin, hair and nail concerns assessed by a consultant dermatologist.", "تقييم مشاكل البشرة والشعر والأظافر مع استشاري جلدية."), category: L("Specialists", "التخصصات"), durationMin: 30, price: 125, capacity: 1, active: true },
    { id: "peds", name: L("Paediatric check-up", "فحص الأطفال"), description: L("Growth review, vaccinations advice and general check for children.", "متابعة النمو والاستشارة حول التطعيمات وفحص عام للأطفال."), category: L("Specialists", "التخصصات"), durationMin: 30, price: 95, capacity: 1, active: true },
    { id: "ortho", name: L("Orthopaedic assessment", "تقييم العظام"), description: L("Joint, back and sports-injury assessment with treatment options.", "تقييم المفاصل والظهر والإصابات الرياضية مع خيارات العلاج."), category: L("Specialists", "التخصصات"), durationMin: 40, price: 150, capacity: 1, bufferMin: 10, active: true },
    { id: "checkup", name: L("Comprehensive health check", "فحص صحي شامل"), description: L("Full physical exam, vitals and a personalised prevention plan.", "فحص سريري كامل والعلامات الحيوية وخطة وقائية مخصصة."), category: L("Preventive care", "الرعاية الوقائية"), durationMin: 60, price: 245, capacity: 1, bufferMin: 10, active: true },
  ],
  resources: [
    { id: "dr-layla", kind: "staff", photo: "/media/team/dr-layla.webp", name: L("Dr. Layla Haddad", "د. ليلى حداد"), title: L("Family Physician", "طبيبة أسرة"), branchId: "jumeirah", hue: 195, serviceIds: ["gp", "follow-up", "checkup"], weeklyHours: sameHours([...satToThu], "08:00-16:00"), active: true },
    { id: "dr-omar", kind: "staff", photo: "/media/team/dr-omar.webp", name: L("Dr. Omar Khalil", "د. عمر خليل"), title: L("Consultant Dermatologist", "استشاري الأمراض الجلدية"), branchId: "jumeirah", hue: 260, serviceIds: ["derma", "follow-up"], weeklyHours: week({ 6: "12:00-20:00", 0: "12:00-20:00", 1: "12:00-20:00", 3: "12:00-20:00", 4: "10:00-16:00" }), active: true },
    { id: "dr-sarah", kind: "staff", photo: "/media/team/dr-sarah.webp", name: L("Dr. Sarah Mitchell", "د. سارة ميتشل"), title: L("Paediatrician", "طبيبة أطفال"), branchId: "business-bay", hue: 330, serviceIds: ["peds", "gp", "follow-up"], weeklyHours: sameHours([0, 1, 2, 3, 4], ["09:00-13:00", "15:00-19:00"]), active: true },
    { id: "dr-yousef", kind: "staff", photo: "/media/team/dr-yousef.webp", name: L("Dr. Yousef Al Mansoori", "د. يوسف المنصوري"), title: L("Orthopaedic Surgeon", "جراح عظام"), branchId: "business-bay", hue: 30, serviceIds: ["ortho", "follow-up"], weeklyHours: week({ 6: "10:00-18:00", 1: "10:00-18:00", 2: "10:00-18:00", 3: "14:00-20:00" }), active: true },
    { id: "dr-nadia", kind: "staff", photo: "/media/team/dr-nadia.webp", name: L("Dr. Nadia Rahman", "د. نادية رحمن"), title: L("Internal Medicine", "الطب الباطني"), branchId: "business-bay", hue: 150, serviceIds: ["gp", "checkup", "follow-up"], weeklyHours: sameHours([6, 0, 1, 2, 3], "12:00-20:00"), active: true },
  ],
  customers: people("+971 50", [
    ["سارة أحمد", "sara.ahmed"], ["Mohammed Khalid", "m.khalid"], ["ليلى حسن", "layla.hassan"], ["James Carter", "j.carter"],
    ["فاطمة الزهراء", "fatima.z"], ["Aisha Al Suwaidi", "aisha.s"], ["خالد العتيبي", "khaled.o"], ["Priya Nair", "priya.nair"],
    ["عبدالله الكعبي", "abdullah.k"], ["Hannah Schmidt", "hannah.s"], ["مريم سالم", "mariam.salem"], ["Rami Aboud", "rami.aboud"],
    ["نورة المهيري", "noura.m"], ["Daniel Okafor", "d.okafor"], ["يوسف حمدان", "yousef.h"], ["Elena Petrova", "elena.p"],
    ["هند الشامسي", "hind.s"], ["Tariq Mahmood", "tariq.m"], ["ريم الزعابي", "reem.z"], ["Sophie Laurent", "sophie.l"],
    ["أحمد البلوشي", "ahmed.b"], ["Omar Farouk", "omar.f"], ["شيخة النعيمي", "shaikha.n"], ["Lucas Rossi", "lucas.r"],
    ["حمد الظاهري", "hamad.d"], ["Zainab Ali", "zainab.ali"], ["دانة يوسف", "dana.y"], ["Michael Chen", "m.chen"],
  ]),
};
