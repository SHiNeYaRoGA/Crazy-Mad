import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENGINE = process.env.VOICEVOX_ENGINE_URL || "http://127.0.0.1:50021";

// POST {id, text, speaker} -> สังเคราะห์เสียงแล้วเซฟเป็นไฟล์ static
// ใช้ตอนเตรียมงานบนเครื่อง local (มี engine) เพื่อ deploy แล้วเปิดได้ทุกเครื่อง
export async function POST(req: NextRequest) {
  const { id, text, speaker } = await req.json();
  const safeId = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!safeId || !text) return NextResponse.json({ error: "ต้องมี id + text" }, { status: 400 });
  try {
    const q = await fetch(`${ENGINE}/audio_query?text=${encodeURIComponent(String(text).slice(0, 300))}&speaker=${speaker || "3"}`, { method: "POST" });
    if (!q.ok) return NextResponse.json({ error: "ต่อ engine ไม่ได้ - เปิด VOICEVOX ก่อน" }, { status: 502 });
    const query = await q.json();
    // เสียงยัยเด็กปากดี: pitch +0.05, speed 1.15x
    query.pitchScale = 0.05;
    query.speedScale = 1.15;
    const s = await fetch(`${ENGINE}/synthesis?speaker=${speaker || "3"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!s.ok) return NextResponse.json({ error: "synthesis ล้มเหลว" }, { status: 502 });
    const buf = Buffer.from(await s.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "audio");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${safeId}.wav`), buf);
    return NextResponse.json({ path: `/audio/${safeId}.wav`, size: buf.length });
  } catch {
    return NextResponse.json({ error: "ต่อ engine ไม่ได้ - เปิด VOICEVOX ก่อน" }, { status: 502 });
  }
}
