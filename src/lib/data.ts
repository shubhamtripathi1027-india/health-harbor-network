export type Medicine = { name: string; nameHi: string; stock: number; min: number; unit: string };
export type Centre = {
  id: string; name: string; nameHi: string; district: string; districtHi: string;
  beds: { total: number; occupied: number; icu: number; icuOccupied: number };
  doctors: { total: number; present: number; list: { name: string; spec: string; present: boolean }[] };
  patients: { today: number; week: number[]; opd: number; ipd: number; emergency: number };
  medicines: Medicine[];
};

const meds = (v: number[]): Medicine[] => [
  { name: "Paracetamol 500mg", nameHi: "पैरासिटामोल 500mg", stock: v[0], min: 2000, unit: "tabs" },
  { name: "Amoxicillin 250mg", nameHi: "एमोक्सिसिलिन 250mg", stock: v[1], min: 1000, unit: "caps" },
  { name: "ORS Sachets", nameHi: "ओआरएस पैकेट", stock: v[2], min: 500, unit: "packs" },
  { name: "Insulin (Vials)", nameHi: "इंसुलिन (शीशी)", stock: v[3], min: 80, unit: "vials" },
  { name: "Metformin 500mg", nameHi: "मेटफॉर्मिन 500mg", stock: v[4], min: 1500, unit: "tabs" },
  { name: "Anti-Rabies Vaccine", nameHi: "रेबीज़ रोधी टीका", stock: v[5], min: 40, unit: "doses" },
  { name: "Iron-Folic Acid", nameHi: "आयरन-फोलिक एसिड", stock: v[6], min: 3000, unit: "tabs" },
];

export const centres: Centre[] = [
  { id: "c1", name: "PHC Sitapur", nameHi: "पीएचसी सीतापुर", district: "Sitapur, UP", districtHi: "सीतापुर, उ.प्र.",
    beds: { total: 30, occupied: 27, icu: 4, icuOccupied: 4 },
    doctors: { total: 6, present: 4, list: [
      { name: "Dr. Anil Verma", spec: "General Medicine", present: true },
      { name: "Dr. Sunita Yadav", spec: "Gynaecology", present: true },
      { name: "Dr. Rakesh Mishra", spec: "Paediatrics", present: false },
      { name: "Dr. Pooja Singh", spec: "General Medicine", present: true },
      { name: "Dr. Imran Khan", spec: "Orthopaedics", present: false },
      { name: "Dr. Neha Gupta", spec: "Dental", present: true }]},
    patients: { today: 186, week: [142, 160, 171, 155, 190, 178, 186], opd: 152, ipd: 27, emergency: 7 },
    medicines: meds([650, 1800, 120, 22, 2100, 8, 4200]) },
  { id: "c2", name: "CHC Barabanki", nameHi: "सीएचसी बाराबंकी", district: "Barabanki, UP", districtHi: "बाराबंकी, उ.प्र.",
    beds: { total: 50, occupied: 31, icu: 6, icuOccupied: 2 },
    doctors: { total: 9, present: 8, list: [
      { name: "Dr. Mohit Srivastava", spec: "Surgery", present: true },
      { name: "Dr. Kavita Tiwari", spec: "Gynaecology", present: true },
      { name: "Dr. Faisal Ahmed", spec: "Paediatrics", present: true },
      { name: "Dr. Ritu Saxena", spec: "General Medicine", present: true },
      { name: "Dr. Deepak Pandey", spec: "Anaesthesia", present: false },
      { name: "Dr. Shalini Dubey", spec: "Ophthalmology", present: true }]},
    patients: { today: 241, week: [210, 225, 230, 218, 244, 236, 241], opd: 205, ipd: 31, emergency: 5 },
    medicines: meds([8400, 3200, 1400, 190, 5200, 95, 9800]) },
  { id: "c3", name: "PHC Nalanda", nameHi: "पीएचसी नालंदा", district: "Nalanda, Bihar", districtHi: "नालंदा, बिहार",
    beds: { total: 24, occupied: 22, icu: 2, icuOccupied: 2 },
    doctors: { total: 5, present: 2, list: [
      { name: "Dr. Sanjay Kumar", spec: "General Medicine", present: true },
      { name: "Dr. Priya Sinha", spec: "Gynaecology", present: false },
      { name: "Dr. Manoj Jha", spec: "Paediatrics", present: false },
      { name: "Dr. Archana Prasad", spec: "General Medicine", present: true },
      { name: "Dr. Vikas Ranjan", spec: "Dental", present: false }]},
    patients: { today: 164, week: [120, 138, 149, 152, 160, 158, 164], opd: 135, ipd: 22, emergency: 7 },
    medicines: meds([1200, 420, 210, 60, 900, 35, 1800]) },
  { id: "c4", name: "District Hospital Nashik", nameHi: "जिला अस्पताल नासिक", district: "Nashik, MH", districtHi: "नासिक, महाराष्ट्र",
    beds: { total: 120, occupied: 74, icu: 14, icuOccupied: 7 },
    doctors: { total: 22, present: 20, list: [
      { name: "Dr. Aditya Patil", spec: "Cardiology", present: true },
      { name: "Dr. Snehal Kulkarni", spec: "Gynaecology", present: true },
      { name: "Dr. Rohan Deshmukh", spec: "Surgery", present: true },
      { name: "Dr. Meera Joshi", spec: "Paediatrics", present: true },
      { name: "Dr. Nikhil Pawar", spec: "Orthopaedics", present: false },
      { name: "Dr. Swati Shinde", spec: "General Medicine", present: true }]},
    patients: { today: 412, week: [380, 395, 402, 388, 420, 405, 412], opd: 330, ipd: 74, emergency: 8 },
    medicines: meds([15000, 6200, 2600, 340, 8800, 160, 14000]) },
  { id: "c5", name: "CHC Udaipur", nameHi: "सीएचसी उदयपुर", district: "Udaipur, RJ", districtHi: "उदयपुर, राजस्थान",
    beds: { total: 40, occupied: 23, icu: 4, icuOccupied: 1 },
    doctors: { total: 8, present: 6, list: [
      { name: "Dr. Harish Meena", spec: "General Medicine", present: true },
      { name: "Dr. Kiran Rathore", spec: "Gynaecology", present: true },
      { name: "Dr. Lokesh Sharma", spec: "Paediatrics", present: false },
      { name: "Dr. Anjali Choudhary", spec: "Surgery", present: true },
      { name: "Dr. Bhavesh Jain", spec: "Dental", present: false },
      { name: "Dr. Ravi Garg", spec: "Orthopaedics", present: true }]},
    patients: { today: 198, week: [170, 182, 190, 176, 201, 195, 198], opd: 172, ipd: 23, emergency: 3 },
    medicines: meds([5600, 2900, 980, 140, 3600, 70, 7600]) },
];

export type Recommendation = { med: string; medHi: string; from: string; to: string; qty: number; unit: string; urgency: "high" | "medium" };

/** Move surplus (stock above 1.5x min) from donors to centres below min. */
export function computeRecommendations(cs: Centre[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const n = cs[0].medicines.length;
  for (let i = 0; i < n; i++) {
    const surplus = cs.map((c) => ({ c, s: Math.floor(c.medicines[i]!.stock - c.medicines[i]!.min * 1.5) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    for (const c of cs) {
      const m = c.medicines[i]!;
      let need = m.min * 1.5 - m.stock;
      if (m.stock >= m.min) continue;
      for (const d of surplus) {
        if (need <= 0 || d.s <= 0) continue;
        const qty = Math.ceil(Math.min(need, d.s));
        d.s -= qty; need -= qty;
        recs.push({ med: m.name, medHi: m.nameHi, from: d.c.id, to: c.id, qty, unit: m.unit, urgency: m.stock < m.min * 0.5 ? "high" : "medium" });
      }
    }
  }
  return recs.sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "high" ? -1 : 1));
}
