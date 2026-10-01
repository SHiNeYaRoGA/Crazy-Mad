import { NextRequest, NextResponse } from "next/server";

const ENGINE = process.env.VOICEVOX_ENGINE_URL || "http://127.0.0.1:50021";

// GET /api/voicevox?action=speakers -> รายชื่อ speaker
// GET /api/voicevox?text=...&speaker=3 -> เสียง wav
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    if (searchParams.get("action") === "speakers") {
      const r = await fetch(`${ENGINE}/speakers`);
      const j = await r.json();
      return NextResponse.json(j);
    }
    const text = searchParams.get("text") || "こんにちは";
    const speaker = searchParams.get("speaker") || "3";
    const q = await fetch(`${ENGINE}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`, { method: "POST" });
    if (!q.ok) return NextResponse.json({ error: "audio_query failed - เปิด VOICEVOX หรือยัง?" }, { status: 502 });
    const query = await q.json();
    // เสียงยัยเด็กปากดี: pitch +0.05, speed 1.15x
    query.pitchScale = 0.05;
    query.speedScale = 1.15;
    const s = await fetch(`${ENGINE}/synthesis?speaker=${speaker}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!s.ok) return NextResponse.json({ error: "synthesis failed" }, { status: 502 });
    const buf = Buffer.from(await s.arrayBuffer());
    return new NextResponse(buf, { headers: { "Content-Type": "audio/wav" } });
  } catch {
    return NextResponse.json({ error: "ต่อ VOICEVOX (127.0.0.1:50021) ไม่ได้ - เปิดโปรแกรม VOICEVOX ก่อน" }, { status: 502 });
  }
}
