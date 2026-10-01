export type ScriptItem = { id: string; keyword: string; answer: string; speak: string; speakVv?: string; image?: string; goto?: string; audio?: string };

const KEY = "ai-script";
const NF_KEY = "ai-notfound";

// หน้าที่ AI เปิดให้ได้ (ไม่มี /admin - AI ห้ามเปิด)
export const AI_PAGES = [
  { path: "/", label: "Home" },
  { path: "/shop", label: "Shop" },
  { path: "/training", label: "งานฝึกวิชาชีพ" },
  { path: "/about", label: "เกี่ยวกับเรา" },
  { path: "/contact", label: "ติดต่อ" },
  { path: "/cart", label: "ตะกร้า" },
];

// คำขอเปิดหน้า (intent) จับจาก keyword - ไม่มี admin
export type IntentRule = { page: string; words: string[] };

const INTENT_KEY = "ai-intents";
const ALLOW_KEY = "ai-pages-allowed";
const GUARD_KEY = "ai-admin-guard";

export const DEFAULT_ADMIN_WORDS = ["admin", "แอดมิน", "หลังบ้าน", "จัดการร้าน"];
export const DEFAULT_ADMIN_REFUSE = {
  text: "ขอโทษครับ AI เปิดหน้า Admin ให้ไม่ได้ครับ",
  speak: "ขอโทษครับ AI เปิดหน้า Admin ให้ไม่ได้ครับ",
};

export function loadAdminWords(): string[] {
  if (typeof window === "undefined") return DEFAULT_ADMIN_WORDS;
  try {
    const raw = localStorage.getItem(GUARD_KEY);
    if (!raw) return DEFAULT_ADMIN_WORDS;
    const j = JSON.parse(raw);
    return Array.isArray(j.words) && j.words.length ? j.words : DEFAULT_ADMIN_WORDS;
  } catch { return DEFAULT_ADMIN_WORDS; }
}

export function loadAdminRefuse(): { text: string; speak: string } {
  if (typeof window === "undefined") return DEFAULT_ADMIN_REFUSE;
  try {
    const raw = localStorage.getItem(GUARD_KEY);
    if (!raw) return DEFAULT_ADMIN_REFUSE;
    const j = JSON.parse(raw);
    return { text: j.text || DEFAULT_ADMIN_REFUSE.text, speak: j.speak || DEFAULT_ADMIN_REFUSE.speak };
  } catch { return DEFAULT_ADMIN_REFUSE; }
}

export function saveAdminGuard(words: string[], text: string, speak: string) {
  try {
    localStorage.setItem(GUARD_KEY, JSON.stringify({ words, text, speak }));
    window.dispatchEvent(new Event("ai-guard-changed"));
  } catch {}
}

export const DEFAULT_INTENTS: IntentRule[] = [
  { page: "/contact", words: ["ติดต่อ", "ที่อยู่ร้าน", "เบอร์ร้าน", "แผนที่"] },
  { page: "/about", words: ["เกี่ยวกับ", "ความเป็นมา", "เรือนจำ"] },
  { page: "/training", words: ["ฝึกอาชีพ", "ฝึกวิชาชีพ", "หลักสูตร"] },
  { page: "/cart", words: ["ตะกร้า", "ชำระเงิน", "เช็คเอาท์", "สั่งซื้อ"] },
  { page: "/shop", words: ["สินค้า", "ร้าน", "shop", "ซื้อของ", "ดูของ"] },
  { page: "/", words: ["หน้าแรก", "home", "โฮม"] },
];

export function loadIntents(): IntentRule[] {
  if (typeof window === "undefined") return DEFAULT_INTENTS;
  try {
    const raw = localStorage.getItem(INTENT_KEY);
    if (!raw) return DEFAULT_INTENTS;
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : DEFAULT_INTENTS;
  } catch { return DEFAULT_INTENTS; }
}

export function saveIntents(rules: IntentRule[]) {
  try {
    localStorage.setItem(INTENT_KEY, JSON.stringify(rules));
    window.dispatchEvent(new Event("ai-intents-changed"));
  } catch {}
}

// หน้าที่ AI เปิดได้ (Admin ติ๊กเปิด/ปิด) - ไม่มี /admin เสมอ
export function loadAllowedPages(): string[] {
  if (typeof window === "undefined") return AI_PAGES.map((p) => p.path);
  try {
    const raw = localStorage.getItem(ALLOW_KEY);
    if (!raw) return AI_PAGES.map((p) => p.path);
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j.filter((x) => x !== "/admin") : AI_PAGES.map((p) => p.path);
  } catch { return AI_PAGES.map((p) => p.path); }
}

export function saveAllowedPages(paths: string[]) {
  try {
    localStorage.setItem(ALLOW_KEY, JSON.stringify(paths.filter((x) => x !== "/admin")));
    window.dispatchEvent(new Event("ai-pages-changed"));
  } catch {}
}

export function detectPageIntent(q: string): string | null {
  const query = q.toLowerCase();
  const allowed = new Set(loadAllowedPages());
  for (const it of loadIntents()) {
    if (!allowed.has(it.page)) continue;
    if ((it.words || []).some((w) => w && query.includes(String(w).toLowerCase()))) return it.page;
  }
  return null;
}

export function isAdminRequest(q: string): boolean {
  const query = q.toLowerCase();
  return loadAdminWords().some((w) => w && query.includes(String(w).toLowerCase()));
}

export const DEFAULT_SCRIPT: ScriptItem[] = [
  { id: "S1", keyword: "สวัสดี", answer: "สวัสดีครับ ยินดีต้อนรับ", speak: "สวัสดีครับ ยินดีต้อนรับสู่ร้านงานฝีมือเรือนจำพะเยา... เจ้ากระจอก~", speakVv: "サワディー クラップ、インディー ターンラップ スー ラ่าน ガーンフィーมือ ルアンジャム パヤオ... ザーコ♡" },
  { id: "S2", keyword: "กระเป๋า", answer: "กระเป๋าผ้าย้อมคราม 350 บาท", speak: "กระเป๋าผ้าย้อมครามราคา 350 บาท ทอและย้อมมือ ใช้เวลา 3 วันต่อใบ... ซื้อไหวเปล่าเนี่ย?", speakVv: "クラペ๋า パーヨームクラーム ラーカー サンร้อย ฮ่าสิบ บาท、トー และ ย้อมมือ ชัยเวลา サン วัน ต่อ ใบ... カエル ノー?" },
  { id: "S3", keyword: "โคม|โคมไฟ", answer: "โคมไม้ไผ่สาน 499 บาท", speak: "โคมไม้ไผ่สานราคา 499 บาท สานมือทีละเส้น ใช้เวลา 5 วัน แสงอบอุ่น... สวยเกินปัญญาคุณล่ะสิ~", speakVv: "โคม ไม้ไผ่ สาน ラーカー สี่ร้อย เก้าสิบเก้า บาท、สานมือ ทีละ เส้น ชัยเวลา โก้ วัน แสง ออบอุ่น... ザーコ♡" },
  { id: "S4", keyword: "ผ้าพันคอ", answer: "ผ้าพันคอทอมือ 290 บาท", speak: "ผ้าพันคอทอมือราคา 290 บาท ลายน้ำไหลกว๊านพะเยา ผืนนุ่ม... หนาเหมาะกับคนบ๊องๆ~", speakVv: "パーパンコー トーมือ ラーカー สองร้อย เก้าสิบ บาท、ラーイ ナームライ クワーン パヤオ ผืน นุ่ม... バカー♡" },
  { id: "S5", keyword: "ไม้แกะ|แกะสลัก", answer: "ชุดไม้แกะสลัก 550 บาท", speak: "ชุดไม้แกะสลักราคา 550 บาท ลายช้างศึก ใช้เวลา 7 วันต่อชุด... อย่างคุณทำไม่ได้หรอก~", speakVv: "ชุด ไม้แกะสลัก ラーカー โก้ร้อย ฮ่าสิบ บาท、ラーイ チャーンスック ชัยเวลา เจ็ด วัน ต่อ ชุด... ムダ ムダ♡" },
  { id: "S6", keyword: "ราคา|แพง|ถูก|กี่บาท", answer: "ราคาเริ่ม 99-550 บาท ดูทั้งหมดที่หน้า Shop", speak: "ราคาเริ่ม 99 บาทถึง 550 บาท ดูทั้งหมดได้ที่หน้า Shop... แค่นี้ก็ต้องให้บอกเหรอ?", speakVv: "ラーカー เริ่ม เก้าสิบเก้า บาท ถึง โก้ร้อย ฮ่าสิบ บาท、ดู ทั้งหมด ได้ ที่ หน้า Shop... ザーコ♡", goto: "/shop" },
  { id: "S7", keyword: "ส่ง|พัสดุ|กี่วัน|ems", answer: "สั่งแบบจำลอง กรอกชื่อที่อยู่ ได้เลข PHxxxx", speak: "สั่งแบบจำลอง กรอกชื่อที่อยู่ ก็ได้เลขออเดอร์ PHxxxx... ทำเป็นไหมเนี่ย?", speakVv: "สั่ง แบบจำลอง、กรอก ชื่อ ที่อยู่ ก็ได้ เลข ออเดอร์ P-H-x-x-x-x... デキル ノー?", goto: "/cart" },
  { id: "S8", keyword: "ติดต่อ|ที่อยู่|เบอร์|แผนที่", answer: "ติดต่อเรือนจำจังหวัดพะเยา", speak: "ติดต่อเรือนจำจังหวัดพะเยา กำลังพาไปหน้าติดต่อ... อย่าหลงทางล่ะ~", speakVv: "ติดต่อ ルアンジャム จังหวัต パヤオ、กำลัง พา ไป หน้า ติดต่อ... ザーコ♡", goto: "/contact" },
  { id: "S9", keyword: "ฝึกอาชีพ|ฝึกวิชาชีพ|หลักสูตร", answer: "มีฝึกงานไม้ ผ้าทอ จักสาน", speak: "มีฝึกอาชีพงานไม้ ผ้าทอ จักสาน กำลังพาไปหน้าฝึกอาชีพ... คนไร้ฝีมือแบบคุณควรเรียนนะ~", speakVv: "มี ฝึกอาชีพ งานไม้ パートー จักสาน、กำลัง พา ไป หน้า ฝึกอาชีพ... ザーコ♡", goto: "/training" },
  { id: "S10", keyword: "ขอบคุณ|ขอบใจ", answer: "ขอบคุณที่อุดหนุนครับ", speak: "ขอบคุณที่อุดหนุนงานผู้ต้องขังครับ... อุดหนุนเยอะๆ ล่ะเจ้ากระจอก!", speakVv: "คอบคุน ที่ อุดหนุน งาน ผู้ต้องขัง クラップ... アリガト ザーコ♡" },
  { id: "S11", keyword: "พวงกุญแจ|ของฝาก|ของที่ระลึก", answer: "พวงกุญแจผ้าทอ 99 บาท", speak: "พวงกุญแจผ้าทอราคา 99 บาท ของฝากชิ้นเล็ก... เหมาะกับคนตัวเล็กสมองเล็กแบบคุณเลย~", speakVv: "พวงกุญแจ パートー ラーカー เก้าสิบเก้า บาท、คองฝาก ชิ้น เล็ก... ザーコ♡" },
];

export const DEFAULT_NOTFOUND = {
  text: "ไม่พบสินค้า ลองคำว่า กระเป๋า / ไม้ / ผ้า / ของที่ระลึก",
  speak: "ไม่พบสินค้าที่ต้องการ ลองค้นด้วยคำว่า กระเป๋า ไม้ ผ้า หรือ ของที่ระลึก",
  audio: "",
};

export function loadScript(): ScriptItem[] {
  if (typeof window === "undefined") return DEFAULT_SCRIPT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SCRIPT;
    const j = JSON.parse(raw);
    if (!Array.isArray(j)) return DEFAULT_SCRIPT;
    const items = j.map((x: any) => ({ ...x, speak: x.speak ?? x.answer ?? "" }));
    // ข้อมาตรฐาน S1-S11 ที่ยังไม่มี speakVv (เวอร์ชันเมสุกาคิ) -> อัปเฉพาะข้อมาตรฐาน ของที่เพิ่มเองไม่แตะ
    let touched = false;
    const merged = items.map((x: any) => {
      const d = DEFAULT_SCRIPT.find((dd) => dd.id === x.id);
      if (d && !x.speakVv) { touched = true; return { ...d }; }
      return x;
    });
    // เติมข้อมาตรฐานที่หายไปให้ครบ
    DEFAULT_SCRIPT.forEach((d) => {
      if (!merged.some((x: any) => x.id === d.id)) { merged.push({ ...d }); touched = true; }
    });
    // กันของเก่าสุด: ถ้ามีไม่ครบมาตรฐานให้เรียงตาม S1-S11 ก่อน
    merged.sort((a: any, b: any) => {
      const ai = DEFAULT_SCRIPT.findIndex((d) => d.id === a.id);
      const bi = DEFAULT_SCRIPT.findIndex((d) => d.id === b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    if (touched) { try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch {} }
    return merged;
  } catch { return DEFAULT_SCRIPT; }
}

export function saveScript(items: ScriptItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("ai-script-changed"));
  } catch {}
}

// เจอ keyword ในคำถาม -> คืนสคริปต์ข้อนั้น (ไม่แต่งคำเอง)
export function matchScript(q: string): ScriptItem | null {
  const items = loadScript();
  const query = q.toLowerCase();
  // keyword คั่นด้วย | ได้หลายคำ (เช่น "โคม|โคมไฟ") คำยาวตรงก่อน
  let best: ScriptItem | null = null;
  let bestLen = 0;
  for (const it of items) {
    const alts = String(it.keyword || "").split("|").map((s) => s.trim().toLowerCase()).filter(Boolean);
    for (const a of alts) {
      if (a && query.includes(a) && a.length > bestLen) { best = it; bestLen = a.length; }
    }
  }
  return best;
}

export function loadNotFound(): { text: string; speak: string; audio?: string } {
  if (typeof window === "undefined") return DEFAULT_NOTFOUND;
  try {
    const raw = localStorage.getItem(NF_KEY);
    if (!raw) return DEFAULT_NOTFOUND;
    return { ...DEFAULT_NOTFOUND, ...JSON.parse(raw) };
  } catch { return DEFAULT_NOTFOUND; }
}

export function saveNotFound(v: { text: string; speak: string; audio?: string }) {
  try {
    localStorage.setItem(NF_KEY, JSON.stringify(v));
    window.dispatchEvent(new Event("ai-notfound-changed"));
  } catch {}
}
