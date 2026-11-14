import type { IndustrySeed } from "./types";
import { L, people, sameHours } from "./helpers";

const studios = { kind: "room" as const, label: L("Studio", "استوديو"), resourceIds: ["studio-a", "studio-b"] };
const lighting = { kind: "equipment" as const, label: L("Lighting kit", "معدات الإضاءة"), resourceIds: ["profoto-1", "profoto-2"] };
const drone = { kind: "equipment" as const, label: L("Drone kit", "طائرة تصوير"), resourceIds: ["drone"] };
const monToSat = [1, 2, 3, 4, 5, 6] as const;

export const studioSeed: IndustrySeed = {
  business: {
    id: "studio",
    name: L("Cedar Light Studio", "استوديو ضوء الأرز"),
    tagline: L("Portraits, products and stories, beautifully lit.", "صور شخصية ومنتجات وقصص، بإضاءة مدروسة."),
    industryLabel: L("Photography studio", "استوديو تصوير"),
    timezone: "Asia/Beirut",
    currency: "USD",
    phone: "+961 1 555 014",
    email: "studio@cedarlight.example",
    monogram: "CL",
    hue: 40,
    branches: [{ id: "mar-mikhael", name: L("Mar Mikhael", "مار مخايل"), address: L("Armenia Street, Mar Mikhael, Beirut", "شارع أرمينيا، مار مخايل، بيروت") }],
    openingHours: sameHours([...monToSat], "10:00-19:00"),
    rules: {
      slotIntervalMin: 30,
      bufferMin: 15,
      minNoticeMin: 240,
      maxAdvanceDays: 90,
      allowStaffSelection: true,
      autoConfirm: false,
      cancellationWindowHours: 48,
      closedDates: [],
    },
    staffNoun: { singular: L("Photographer", "المصور"), plural: L("Photographers", "المصورون") },
    customerNoun: { singular: L("Client", "عميل"), plural: L("Clients", "العملاء") },
  },
  services: [
    { id: "portrait", name: L("Portrait session", "جلسة تصوير شخصية"), description: L("Studio portraits with two looks and 10 retouched images.", "صور استوديو بإطلالتين و10 صور معدّلة."), category: L("Portraits", "البورتريه"), durationMin: 60, price: 120, capacity: 1, requirements: [studios], active: true },
    { id: "headshots", name: L("Corporate headshots", "صور مهنية للشركات"), description: L("Clean, consistent headshots for LinkedIn and websites.", "صور مهنية متناسقة للينكدإن والمواقع."), category: L("Portraits", "البورتريه"), durationMin: 30, price: 75, capacity: 1, requirements: [studios], active: true },
    { id: "family", name: L("Family session", "جلسة عائلية"), description: L("Relaxed family portraits, up to 6 people, 20 edited images.", "صور عائلية مريحة حتى 6 أشخاص و20 صورة معدّلة."), category: L("Portraits", "البورتريه"), durationMin: 90, price: 220, capacity: 1, requirements: [studios], active: true },
    { id: "maternity", name: L("Maternity session", "جلسة حمل"), description: L("Soft-light maternity portraits with wardrobe options.", "صور حمل بإضاءة ناعمة مع خيارات أزياء."), category: L("Portraits", "البورتريه"), durationMin: 90, price: 250, capacity: 1, requirements: [studios], active: true },
    { id: "product", name: L("Product photography (half day)", "تصوير منتجات (نصف يوم)"), description: L("Up to 15 products on white and styled sets, lighting included.", "حتى 15 منتجاً على خلفية بيضاء ومشاهد منسقة، مع الإضاءة."), category: L("Commercial", "تجاري"), durationMin: 210, price: 450, capacity: 1, bufferMin: 30, requirements: [studios, lighting], active: true },
    { id: "aerial", name: L("Aerial & outdoor shoot", "تصوير جوي وخارجي"), description: L("On-location shoot with drone coverage for venues and real estate.", "تصوير في الموقع مع لقطات جوية للمنشآت والعقارات."), category: L("Commercial", "تجاري"), durationMin: 120, price: 380, capacity: 1, bufferMin: 30, requirements: [drone], active: true },
  ],
  resources: [
    { id: "karim", kind: "staff", name: L("Karim Saad", "كريم سعد"), title: L("Lead Photographer", "المصور الرئيسي"), branchId: "mar-mikhael", hue: 40, serviceIds: ["portrait", "headshots", "product", "aerial"], weeklyHours: sameHours([1, 2, 3, 4, 5], "10:00-19:00"), active: true },
    { id: "rita", kind: "staff", name: L("Rita Khoury", "ريتا خوري"), title: L("Portrait & Family Photographer", "مصورة بورتريه وعائلات"), branchId: "mar-mikhael", hue: 340, serviceIds: ["portrait", "family", "maternity", "headshots"], weeklyHours: sameHours([2, 3, 4, 5, 6], "10:00-19:00"), active: true },
    { id: "elie", kind: "staff", name: L("Elie Haddad", "إيلي حداد"), title: L("Commercial Photographer", "مصور تجاري"), branchId: "mar-mikhael", hue: 200, serviceIds: ["product", "aerial", "headshots"], weeklyHours: sameHours([1, 3, 5, 6], "10:00-19:00"), active: true },
    { id: "studio-a", kind: "room", name: L("Studio A — Cyclorama", "استوديو أ — خلفية لا نهائية"), title: L("6m infinity wall, blackout", "جدار لا نهائي 6م، تعتيم كامل"), branchId: "mar-mikhael", hue: 30, serviceIds: [], weeklyHours: sameHours([...monToSat], "10:00-19:00"), active: true },
    { id: "studio-b", kind: "room", name: L("Studio B — Daylight loft", "استوديو ب — إضاءة طبيعية"), title: L("North-facing windows, styled sets", "نوافذ شمالية ومشاهد منسقة"), branchId: "mar-mikhael", hue: 50, serviceIds: [], weeklyHours: sameHours([...monToSat], "10:00-19:00"), active: true },
    { id: "profoto-1", kind: "equipment", name: L("Profoto kit #1", "معدات Profoto ‏#1"), title: L("3× B10X, softboxes, stands", "3× B10X وصناديق ضوء وحوامل"), branchId: "mar-mikhael", hue: 60, serviceIds: [], weeklyHours: sameHours([...monToSat], "10:00-19:00"), active: true },
    { id: "profoto-2", kind: "equipment", name: L("Profoto kit #2", "معدات Profoto ‏#2"), title: L("2× D2, beauty dish, reflectors", "2× D2 وطبق تجميل وعواكس"), branchId: "mar-mikhael", hue: 70, serviceIds: [], weeklyHours: sameHours([...monToSat], "10:00-19:00"), active: true },
    { id: "drone", kind: "equipment", name: L("DJI Mavic 3 Pro", "DJI Mavic 3 Pro"), title: L("Drone with 3 batteries", "طائرة مع 3 بطاريات"), branchId: "mar-mikhael", hue: 190, serviceIds: [], weeklyHours: sameHours([...monToSat], "10:00-19:00"), active: true },
  ],
  customers: people("+961 3", [
    ["Nadine Abou Jaoude", "nadine.aj"], ["جورج حداد", "georges.h"], ["Maya Karam", "maya.karam"], ["كارلا نصر", "carla.n"],
    ["Rami Fakhoury", "rami.fa"], ["Tala Mansour", "tala.m"], ["ريان شمعون", "rayan.c"], ["Sandra Azar", "sandra.a"],
    ["Jad Khalil", "jad.k"], ["لين عيسى", "lynn.i"], ["Marc Gemayel", "marc.g"], ["Yara Saliba", "yara.s"],
    ["Cedar Bakery", "orders.cedarbakery"], ["Beit Lubnan Hotel", "events.beitlubnan"], ["سيرين الأيوبي", "serine.a"], ["Nour Hamdan", "nour.hamdan"],
    ["Elissa Rizk", "elissa.r"], ["Wael Tannous", "wael.t"], ["هلا سليمان", "hala.s"], ["Kinda Bitar", "kinda.b"],
  ]),
};
