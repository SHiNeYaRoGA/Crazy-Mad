// Meluna May Melon - persona + wake words + สุ่มรูป (ตาม meluna_may_melon_skill_spec.md)
export type MelunaSettings = {
  enabled: boolean;
  wakeWords: string[];
  imageWords: string[];
};

const KEY = "meluna-settings";

export const DEFAULT_MELUNA: MelunaSettings = {
  enabled: true,
  wakeWords: ["meluna", "melon", "may", "เมลูน่า", "เมล่อน", "เมย์"],
  imageWords: ["ขอรูป", "ขอดูรูป", "ส่งรูป", "รูปหน่อย", "มีรูปไหม", "photo", "picture", "image"],
};

// สำเนียงเมสุกาคิ แซะนิดๆ แต่ช่วย (สั้น 1 วลี)
const FLAVOR = [
  "หึ แค่นี้เอง",
  "ช่วยไม่ได้น้า ก็เลยหาให้แล้ว",
  "แค่นี้ก็ทำไม่ได้เหรอ จ้าๆ",
  "รับไปสิ หาให้แล้วน้า",
  "หึหึ เก่งขึ้นหน่อยสิ",
];

export function loadMeluna(): MelunaSettings {
  if (typeof window === "undefined") return DEFAULT_MELUNA;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_MELUNA;
    const j = JSON.parse(raw);
    return {
      enabled: j.enabled ?? true,
      wakeWords: Array.isArray(j.wakeWords) && j.wakeWords.length ? j.wakeWords : DEFAULT_MELUNA.wakeWords,
      imageWords: Array.isArray(j.imageWords) && j.imageWords.length ? j.imageWords : DEFAULT_MELUNA.imageWords,
    };
  } catch { return DEFAULT_MELUNA; }
}

export function saveMeluna(s: MelunaSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("meluna-changed"));
  } catch {}
}

function includesAny(q: string, words: string[]): boolean {
  const query = q.toLowerCase();
  return words.some((w) => w && query.includes(String(w).toLowerCase()));
}

// เรียกชื่อล้วนๆ (meluna/melon/may) -> ทักทาย ไม่ค้นของ
export function isWakeCall(q: string): boolean {
  const s = loadMeluna();
  if (!s.enabled) return false;
  const query = q.trim().toLowerCase();
  return s.wakeWords.some((w) => {
    const word = String(w).toLowerCase();
    return query === word || query.startsWith(word + " ") || query.startsWith(word + "ช่วย");
  });
}

// มีชื่อปนในประโยค -> เข้าโหมด Meluna (คุยอิสระ) แล้วทำคำสั่งต่อ
export function containsWake(q: string): boolean {
  const s = loadMeluna();
  if (!s.enabled) return false;
  return includesAny(q, s.wakeWords);
}

export function stripWake(q: string): string {
  const s = loadMeluna();
  let out = q;
  s.wakeWords.forEach((w) => {
    if (w) out = out.split(new RegExp(String(w), "ig")).join(" ").replace(/\s+/g, " ").trim();
  });
  return out;
}

// โหมด Meluna: คุยอิสระตามหมวดบทสนทนา (ยังไม่ใช่ LLM เต็มตัว - อิสระจริงต้องต่อ Gemini key)
const CHAT_PATTERNS: { words: string[]; replies: string[] }[] = [
  { words: ["สวัสดี", "ดีจ้า", "ดีครับ", "hello", "hi"], replies: ["หึหึ สวัสดีจ้า ว่ามาสิอยากได้อะไร", "จ้าๆ สวัสดี วันนี้จะเสียเงินเท่าไหร่ดีน้า"] },
  { words: ["ชื่ออะไร", "ชื่อไร", "ใครเนี่ย", "แนะนำตัว"], replies: ["หึ จำไว้เลยนะ ฉัน Meluna May Melon ไง", "Meluna ไงจ๊ะ เรียก meluna melon หรือ may ก็ได้"] },
  { words: ["สบายดี", "เป็นไง", "เป็นอย่างไร"], replies: ["ก็ดีจนเบื่อน่ะสิ มาคุยกับฉันก็ดีขึ้นแล้ว", "หึ สบายดี แล้วเธอล่ะ ซื้อของบ้างสิ"] },
  { words: ["ขอบคุณ", "ขอบใจ", "thank"], replies: ["หึ รู้ตัวก็ดี มาซื้อของตอบแทนสิ", "จ้าๆ ไม่เป็นไร คราวหน้าก็เรียกอีกน้า"] },
  { words: ["ตลก", "มุก", "ขำ"], replies: ["ถามว่ากระเป๋าอะไรใส่เงินแล้วรวย... กระเป๋าตังค์ยังว่างอยู่ของเธอน่ะสิ หึหึ", "มุกเหรอ... ทำไมไม้แกะสลักถึงแพง? เพราะมัน 'สลัก' สำคัญไง จ้าๆ"] },
  { words: ["ทำอะไรได้", "ช่วยอะไร", "มีอะไรบ้าง"], replies: ["หาของในร้าน พาไปหน้าต่างๆ อ่านสคริปต์ให้ฟัง ว่ามาสิ", "ค้นสินค้า เปิดหน้าเว็บ ส่งรูปให้ดู สั่งมาเถอะ"] },
  { words: ["แพง", "ลด", "ถูก", "ราคา", "กี่บาท"], replies: ["หึ งานมือทั้งชิ้นราคานี้ถูกแล้วน้า ไปดูใน Shop สิ", "เริ่ม 99 บาทเอง พวงกุญแจผ้าทอน่ารักนะว่ามั้ย"] },
  { words: ["ส่ง", "พัสดุ", "กี่วัน", "ems"], replies: ["สั่งแบบจำลองก่อนน้า กรอกชื่อที่อยู่ก็ได้เลข PHxxxx แล้ว", "หึ เรื่องส่งไว้ใจได้ สั่งในตะกร้าได้เลย"] },
  { words: ["รัก", "ชอบ", "น่ารัก"], replies: ["หึหึ ปากหวานนะ ชอบก็ซื้อของหน่อยสิ", "รู้ว่าฉันน่ารักก็ดี ว่าแล้วก็ไปดูของในร้านสิ"] },
  { words: ["บาย", "ลาก่อน", "ไปละ", "bye"], replies: ["จ้าๆ ไปเถอะ อย่าลืมกลับมาซื้อของน้า", "หึ รีบไปไหน ไว้คุยกันใหม่น้า"] },
];

const FALLBACK_CHAT = [
  "หึหึ ถามแบบนี้ใครจะไปรู้ล่ะ ลองถามเรื่องของในร้านมาสิจ๊ะ",
  "อืม... เรื่องนั้นไว้ทีหลัง มาสนใจของน่ารักๆ ในร้านดีกว่าน้า",
  "หึ คุยเล่นเก่งนะ แต่ของในร้านก็น่าซื้อกว่านะว่ามั้ย",
  "จ้าๆ ฟังอยู่ แล้วอยากได้ชิ้นไหนล่ะว่ามา",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FLAVOR_EN = [
  "Hmph, that was easy",
  "Couldn't even do that yourself? Here you go, dummy♡",
  "Take it, I found it for you",
];

export function decorateEn(text: string): string {
  return `${text} ${pick(FLAVOR_EN)}`;
}

const FALLBACK_CHAT_EN = [
  "Hmph, how would I know that? Ask about the shop instead, dummy♡",
  "Yes yes, I'm listening. So which piece do you want?",
];

export function freeChatForEn(q: string): string {
  const query = q.toLowerCase();
  for (const p of CHAT_PATTERNS_EN) {
    if (p.words.some((w) => query.includes(w))) return pick(p.replies);
  }
  return pick(FALLBACK_CHAT_EN);
}

const CHAT_PATTERNS_EN: { words: string[]; replies: string[] }[] = [
  { words: ["hello", "hi", "hey"], replies: ["Hmph, hello. So what will you buy today?", "Yes yes, hi. Meluna is here, dummy♡"] },
  { words: ["your name", "who are you", "name"], replies: ["Hmph, remember it: I'm Meluna May Melon", "Meluna, obviously. Call me meluna, melon or may"] },
  { words: ["thank"], replies: ["Hmph, at least you know manners. Buy something then", "Yes yes, you're welcome. Call me again, dummy♡"] },
  { words: ["price", "cheap", "expensive", "how much"], replies: ["Hmph, handmade at this price is cheap already. Go look at the Shop", "From just 99 baht, dummy♡"] },
  { words: ["ship", "deliver", "long"], replies: ["It's a mock order, dummy. Fill in name and address to get a PHxxxx number"] },
  { words: ["bye"], replies: ["Yes yes, go already. Come back and buy something, dummy♡"] },
];

export function freeChatFor(q: string): string {
  const query = q.toLowerCase();
  for (const p of CHAT_PATTERNS) {
    if (p.words.some((w) => query.includes(w))) return pick(p.replies);
  }
  return pick(FALLBACK_CHAT);
}

export function freeChat(): string {
  return pick(FALLBACK_CHAT);
}

export function wakeGreeting(): string {
  const picks = ["หึ เรียกฉันเหรอ มีอะไรว่ามาสิ", "จ้าๆ Meluna มาแล้ว อยากได้อะไรว่ามา", "หึหึ เรียกชื่อถูกด้วย ว่ามาสิ"];
  return picks[Math.floor(Math.random() * picks.length)];
}

export function wakeGreetingEn(): string {
  const picks = ["Hmph, called for me? Spit it out, dummy♡", "Yes yes, Meluna is here. What do you want?"];
  return picks[Math.floor(Math.random() * picks.length)];
}

// ขอรูป -> ให้สุ่มจากคลัง
export function wantsImage(q: string): boolean {
  const s = loadMeluna();
  if (!s.enabled) return false;
  return includesAny(q, s.imageWords);
}

// แต่งคำตอบค้นสินค้าให้มีสำเนียง (สั้น ไม่แตะข้อเท็จจริง)
export function decorate(text: string): string {
  const s = loadMeluna();
  if (!s.enabled) return text;
  const f = FLAVOR[Math.floor(Math.random() * FLAVOR.length)];
  return `${text} ${f}`;
}
