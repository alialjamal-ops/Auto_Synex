import type { IndustrySeed } from "./types";
import { L, people, sameHours, week } from "./helpers";

const rooms = { kind: "room" as const, label: L("Classroom", "قاعة"), resourceIds: ["lab-a", "lab-b", "hall"] };
const labs = { kind: "room" as const, label: L("Computer lab", "معمل حاسب"), resourceIds: ["lab-a", "lab-b"] };

export const academySeed: IndustrySeed = {
  business: {
    id: "academy",
    name: L("Nexus Training Academy", "أكاديمية نكسس للتدريب"),
    tagline: L("Practical, instructor-led courses for working professionals.", "دورات عملية بإشراف مدربين للمهنيين."),
    industryLabel: L("Training academy", "أكاديمية تدريب"),
    timezone: "Asia/Riyadh",
    currency: "SAR",
    phone: "+966 11 555 0190",
    email: "learn@nexus-academy.example",
    monogram: "NX",
    hue: 230,
    branches: [{ id: "olaya", name: L("Olaya campus", "فرع العليا"), address: L("King Fahd Road, Al Olaya, Riyadh", "طريق الملك فهد، العليا، الرياض") }],
    openingHours: week({ 0: "09:00-22:00", 1: "09:00-22:00", 2: "09:00-22:00", 3: "09:00-22:00", 4: "09:00-22:00", 6: "10:00-18:00" }),
    rules: {
      slotIntervalMin: 30,
      bufferMin: 15,
      minNoticeMin: 180,
      maxAdvanceDays: 60,
      allowStaffSelection: true,
      autoConfirm: false,
      cancellationWindowHours: 48,
      closedDates: [],
    },
    staffNoun: { singular: L("Trainer", "المدرب"), plural: L("Trainers", "المدربون") },
    customerNoun: { singular: L("Student", "متدرب"), plural: L("Students", "المتدربون") },
  },
  services: [
    { id: "python-data", name: L("Data Analytics with Python", "تحليل البيانات باستخدام بايثون"), description: L("Hands-on workshop: pandas, visualisation and a real dataset project.", "ورشة تطبيقية: pandas والتصوير البياني ومشروع على بيانات حقيقية."), category: L("Data & AI", "البيانات والذكاء الاصطناعي"), durationMin: 180, price: 650, capacity: 16, fixedStartTimes: ["18:00"], fixedWeekdays: [0, 2], requirements: [labs], active: true },
    { id: "ai-essentials", name: L("Generative AI for Business", "الذكاء الاصطناعي التوليدي للأعمال"), description: L("Prompting, workflows and responsible use for teams.", "صياغة الأوامر وسير العمل والاستخدام المسؤول للفرق."), category: L("Data & AI", "البيانات والذكاء الاصطناعي"), durationMin: 120, price: 480, capacity: 20, fixedStartTimes: ["10:00"], fixedWeekdays: [6, 3], requirements: [rooms], active: true },
    { id: "pmp", name: L("PMP Exam Preparation", "التحضير لاختبار PMP"), description: L("Structured exam-prep sessions with practice questions.", "جلسات تحضير منظمة مع أسئلة تدريبية."), category: L("Management", "الإدارة"), durationMin: 120, price: 550, capacity: 20, fixedStartTimes: ["18:30"], fixedWeekdays: [1, 3], requirements: [rooms], active: true },
    { id: "english", name: L("Business English Conversation", "محادثة الإنجليزية للأعمال"), description: L("Small-group speaking practice for meetings and presentations.", "تدريب على المحادثة في مجموعات صغيرة للاجتماعات والعروض."), category: L("Languages", "اللغات"), durationMin: 90, price: 180, capacity: 8, fixedStartTimes: ["10:00", "17:00"], requirements: [rooms], active: true },
    { id: "ux", name: L("UX Design Fundamentals", "أساسيات تصميم تجربة المستخدم"), description: L("Research, wireframes and usability testing in Figma.", "البحث والنماذج الأولية واختبار قابلية الاستخدام في Figma."), category: L("Design", "التصميم"), durationMin: 150, price: 590, capacity: 12, fixedStartTimes: ["16:00"], fixedWeekdays: [0, 4], requirements: [labs], active: true },
    { id: "coaching", name: L("1:1 Career Coaching", "إرشاد مهني فردي"), description: L("Private session: CV review, interview practice and a growth plan.", "جلسة خاصة: مراجعة السيرة الذاتية وتدريب المقابلات وخطة تطوير."), category: L("Coaching", "الإرشاد"), durationMin: 60, price: 400, capacity: 1, bufferMin: 0, active: true },
  ],
  resources: [
    { id: "faisal", kind: "staff", name: L("Eng. Faisal Al-Otaibi", "م. فيصل العتيبي"), title: L("Data & AI Lead Trainer", "كبير مدربي البيانات والذكاء الاصطناعي"), branchId: "olaya", hue: 230, serviceIds: ["python-data", "ai-essentials", "coaching"], weeklyHours: week({ 0: "14:00-22:00", 2: "14:00-22:00", 3: "09:00-17:00", 6: "10:00-18:00" }), active: true },
    { id: "reem", kind: "staff", name: L("Reem Al-Harbi, PMP", "ريم الحربي، PMP"), title: L("Project Management Trainer", "مدربة إدارة المشاريع"), branchId: "olaya", hue: 280, serviceIds: ["pmp", "coaching"], weeklyHours: week({ 1: "12:00-22:00", 3: "12:00-22:00", 0: "09:00-15:00" }), active: true },
    { id: "daniel", kind: "staff", name: L("Daniel Brooks", "دانيال بروكس"), title: L("Business English Coach", "مدرب الإنجليزية للأعمال"), branchId: "olaya", hue: 15, serviceIds: ["english", "coaching"], weeklyHours: sameHours([0, 1, 2, 3, 4], ["09:00-12:00", "16:00-20:00"]), active: true },
    { id: "huda", kind: "staff", name: L("Huda Al-Qahtani", "هدى القحطاني"), title: L("Senior UX Designer", "مصممة تجربة مستخدم أولى"), branchId: "olaya", hue: 320, serviceIds: ["ux", "coaching"], weeklyHours: week({ 0: "12:00-20:00", 4: "12:00-20:00", 2: "10:00-16:00" }), active: true },
    { id: "lab-a", kind: "room", name: L("Lab A", "المعمل أ"), title: L("Computer lab · 16 seats", "معمل حاسب · 16 مقعداً"), branchId: "olaya", hue: 200, serviceIds: [], weeklyHours: sameHours([0, 1, 2, 3, 4, 6], "09:00-22:00"), active: true },
    { id: "lab-b", kind: "room", name: L("Lab B", "المعمل ب"), title: L("Computer lab · 12 seats", "معمل حاسب · 12 مقعداً"), branchId: "olaya", hue: 210, serviceIds: [], weeklyHours: sameHours([0, 1, 2, 3, 4, 6], "09:00-22:00"), active: true },
    { id: "hall", kind: "room", name: L("Seminar Hall", "قاعة الندوات"), title: L("Seminar room · 24 seats", "قاعة ندوات · 24 مقعداً"), branchId: "olaya", hue: 220, serviceIds: [], weeklyHours: sameHours([0, 1, 2, 3, 4, 6], "09:00-22:00"), active: true },
  ],
  customers: people("+966 55", [
    ["عبدالرحمن الشهري", "a.alshehri"], ["Sarah Al-Dosari", "sarah.d"], ["محمد القحطاني", "m.qahtani"], ["Noura Al-Saud", "noura.saud"],
    ["تركي الغامدي", "turki.g"], ["Ahmed Hassan", "ahmed.hassan"], ["أسماء الزهراني", "asma.z"], ["Ravi Kumar", "ravi.k"],
    ["سلطان العنزي", "sultan.a"], ["Lama Al-Rashid", "lama.r"], ["نوف المطيري", "nouf.m"], ["John Peterson", "john.p"],
    ["بندر الدوسري", "bandar.d"], ["Hana Yamamoto", "hana.y"], ["أريج السبيعي", "areej.s"], ["Fahad Al-Harthi", "fahad.h"],
    ["رهف العمري", "rahaf.o"], ["Marwan Saleh", "marwan.s"], ["وعد الحربي", "waad.h"], ["Amira Youssef", "amira.y"],
    ["ماجد الشمري", "majed.s"], ["Khalid Bakr", "khalid.b"], ["جود الفيصل", "joud.f"], ["Ayesha Malik", "ayesha.m"],
    ["عمر باحمدان", "omar.b"], ["Dana Al-Jaber", "dana.j"], ["فارس الرويلي", "fares.r"], ["Leen Hijazi", "leen.h"],
    ["هيفاء النمر", "haifa.n"], ["Yazan Qasem", "yazan.q"], ["شهد الخالدي", "shahad.k"], ["Tom Becker", "tom.b"],
  ]),
};
