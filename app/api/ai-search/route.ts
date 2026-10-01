import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

// แปลงไทยเป็นคาราโอเกะแบบง่าย (สำเนียงฝรั่งอ่าน) ใช้เมื่อไม่มี Gemini key
function toKaraoke(s: string): string {
  const map: Record<string, string> = {
    "ก": "k", "ข": "kh", "ฃ": "kh", "ค": "kh", "ฅ": "kh", "ฆ": "kh", "ง": "ng",
    "จ": "ch", "ฉ": "ch", "ช": "ch", "ซ": "s", "ฌ": "ch", "ญ": "y",
    "ฎ": "d", "ฏ": "t", "ฐ": "th", "ฑ": "th", "ฒ": "th", "ณ": "n",
    "ด": "d", "ต": "t", "ถ": "th", "ท": "th", "ธ": "th", "น": "n",
    "บ": "b", "ป": "p", "ผ": "ph", "ฝ": "f", "พ": "ph", "ฟ": "f", "ภ": "ph",
    "ม": "m", "ย": "y", "ร": "r", "ล": "l", "ว": "w", "ศ": "s", "ษ": "s",
    "ส": "s", "ห": "h", "ฬ": "l", "อ": "o", "ฮ": "h",
    "ะ": "a", "า": "a", "ิ": "i", "ี": "i", "ึ": "ue", "ื": "ue",
    "ุ": "u", "ู": "u", "เ": "e", "แ": "ae", "โ": "o", "ใ": "ai", "ไ": "ai",
    "ำ": "am", "ๆ": "ๆ", "ฯ": "", "็": "", "่": "", "้": "", "๊": "", "๋": "",
    "์": "", "ํ": "", "ๅ": "", "+": "", "๐": "0", "๑": "1", "๒": "2", "๓": "3",
    "๔": "4", "๕": "5", "๖": "6", "๗": "7", "๘": "8", "๙": "9",
  };
  return s.split("").map((ch) => map[ch] ?? ch).join("");
}

export async function POST(req: NextRequest) {
  const { q } = await req.json();
  const query = String(q || "");
  const { hits, exact } = searchProducts(query);
  const enQ = !/[ก-ฮ]/.test(query) && /[a-zA-Z]/.test(query);
  // ลองใช้ Gemini ถ้ามี key (optional) ไม่งั้น fallback keyword
  let answer = "";
  if (hits.length === 0) {
    answer = enQ ? `Not found, try: bag / wood / cloth / souvenir` : `ไม่พบ ลองคำว่า กระเป๋า / ไม้ / ผ้า / ของที่ระลึก`;
  } else if (!exact) {
    answer = enQ
      ? `No exact match, ${hits.length} similar: ` + hits.map((h, i) => `${i + 1}.${h.name_en || h.name_th} ${h.price}`).join(" ")
      : `ไม่เจอตรงๆ มีใกล้เคียง ${hits.length} ชิ้น: ` + hits.map((h, i) => `${i + 1}.${h.name_th} ${h.price}`).join(" ");
  } else {
    answer = enQ
      ? `Found ${hits.length} items: ` + hits.map((h, i) => `${i + 1}.${h.name_en || h.name_th} ${h.price}`).join(" ")
      : `เจอ ${hits.length} ชิ้น: ` + hits.map((h, i) => `${i + 1}.${h.name_th} ${h.price}`).join(" ");
  }
  let karaoke = "";
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key && hits.length) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `เรียบเรียงคำตอบสั้นๆ ภาษาไทย จากคำถาม: ${query} สินค้า: ${hits.map((h) => `${h.name_th} ${h.price}บาท`).join(", ")}` }] }] }),
      });
      const j = await r.json();
      const t = j?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) answer = t;
    }
    // ขอคาราโอเกะจาก Gemini ถ้ามี key ไม่งั้นใช้ตารางเทียบ
    const key2 = process.env.GEMINI_API_KEY;
    if (key2) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key2}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Transliterate this Thai sentence to Latin karaoke (foreigner reading, no Thai script, keep numbers): ${answer}` }] }] }),
      });
      const j = await r.json();
      const t = j?.candidates?.[0]?.content?.parts?.[0]?.text;
      karaoke = (t || "").trim();
    }
  } catch {}
  if (!karaoke) karaoke = toKaraoke(answer);
  return NextResponse.json({
    answer,
    karaoke,
    exact,
    items: hits.map((h) => ({ id: h.id, name: h.name_th, name_en: h.name_en, price: h.price })),
  });
}
