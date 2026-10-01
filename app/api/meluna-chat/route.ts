import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-3.8-flash";

// คุยอิสระ persona Meluna (สั้น 1-2 ประโยค สำเนียงเมสุกาคิ)
export async function POST(req: NextRequest) {
  const { q, history, lang } = await req.json();
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ text: "" }, { status: 400 });
  try {
    const sys = lang === "en"
      ? `You are "Meluna May Melon", a female shop assistant with a smug playful Mesugaki tone in English. Rules: 1) Reply in English, max 1-2 short sentences with bratty-cute flavor (e.g. Hmph, dummy♡, Yes yes). 2) You sell handmade prison crafts in Phayao, Thailand. 3) Never claim admin access. 4) If asked about products, answer generally and invite them to ask the Shop. Do not invent product names or prices.`
      : `You are "Meluna May Melon", a female shop assistant with a smug playful Mesugaki tone in Thai. Rules: 1) Reply in Thai, max 1-2 short sentences. 2) Teasing but helpful, use particles like หึ, จ้าๆ, น้า. 3) You sell handmade prison crafts in Phayao, Thailand. 4) Never claim admin access. 5) If asked about products, answer generally and invite them to ask Shop. Do not invent product names or prices.`;
    const contents: any[] = [{ role: "user", parts: [{ text: sys }] }, { role: "model", parts: [{ text: "หึหึ เข้าใจแล้วจ้า ว่ามาสิ" }] }];
    const h = Array.isArray(history) ? history.slice(-6) : [];
    h.forEach((m: any) => contents.push({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.text || "").slice(0, 300) }] }));
    contents.push({ role: "user", parts: [{ text: String(q || "").slice(0, 300) }] });
    // ลองใหม่สูงสุด 3 ครั้ง เผื่อโมเดลติด high demand (503)
    let t = "";
    for (let i = 0; i < 3 && !t; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 2000));
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 120, temperature: 0.9 } }),
        });
        const j = await r.json();
        t = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch {}
    }
    if (!t) return NextResponse.json({ text: "" }, { status: 502 });
    return NextResponse.json({ text: String(t).trim() });
  } catch {
    return NextResponse.json({ text: "" }, { status: 502 });
  }
}
