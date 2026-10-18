export type Lang = "en" | "hi";
const dict = {
  title: ["Health Bridge AI", "हेल्थ ब्रिज AI"],
  tagline: ["Smart resource management for 5 health centres", "5 स्वास्थ्य केंद्रों के लिए स्मार्ट संसाधन प्रबंधन"],
  all: ["All centres", "सभी केंद्र"],
  patientsToday: ["Patients today", "आज के मरीज़"],
  bedsAvail: ["Beds available", "उपलब्ध बिस्तर"],
  doctorsPresent: ["Doctors present", "उपस्थित डॉक्टर"],
  lowStock: ["Low-stock alerts", "कम स्टॉक चेतावनी"],
  weekTrend: ["Patient footfall – last 7 days", "मरीज़ों की संख्या – पिछले 7 दिन"],
  bedOcc: ["Bed availability", "बिस्तर उपलब्धता"],
  inventory: ["Medicine inventory", "दवा सूची"],
  medicine: ["Medicine", "दवा"], stock: ["Stock", "स्टॉक"], min: ["Min. level", "न्यूनतम"], status: ["Status", "स्थिति"],
  ok: ["OK", "ठीक"], low: ["Low", "कम"], critical: ["Critical", "गंभीर"],
  attendance: ["Doctor attendance", "डॉक्टर उपस्थिति"],
  present: ["Present", "उपस्थित"], absent: ["Absent", "अनुपस्थित"],
  recs: ["AI redistribution recommendations", "AI पुनर्वितरण सुझाव"],
  transfer: ["Transfer", "भेजें"], approve: ["Approve", "स्वीकृत करें"], approved: ["Approved", "स्वीकृत"],
  noRecs: ["All centres are balanced.", "सभी केंद्र संतुलित हैं।"],
  high: ["High", "उच्च"], medium: ["Medium", "मध्यम"],
  centres: ["Centre overview", "केंद्र अवलोकन"],
  occupied: ["Occupied", "भरे"], free: ["Free", "खाली"], icu: ["ICU", "आईसीयू"],
  opd: ["OPD", "ओपीडी"], ipd: ["IPD", "आईपीडी"], emergency: ["Emergency", "आपातकाल"],
  restock: ["Restock", "पुनः भरें"], days: ["Mon,Tue,Wed,Thu,Fri,Sat,Sun", "सोम,मंगल,बुध,गुरु,शुक्र,शनि,रवि"],
  of: ["of", "में से"],
} as const;
export type Key = keyof typeof dict;
export const t = (lang: Lang, k: Key) => dict[k][lang === "en" ? 0 : 1];
