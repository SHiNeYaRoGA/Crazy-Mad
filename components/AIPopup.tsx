"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAISettings } from "@/lib/aiSettings";
import { loadScript, matchScript, loadNotFound, detectPageIntent, isAdminRequest, AI_PAGES, loadAllowedPages, loadAdminRefuse } from "@/lib/script";
import { wakeGreeting, wantsImage, decorate, containsWake, stripWake, freeChatFor } from "@/lib/meluna";
import { loadLibrary } from "@/lib/imageLibrary";

type Msg = { role: "user" | "ai"; text: string; speak?: string; speakVv?: string; karaoke?: string; image?: string; goto?: string; audio?: string; links?: { id: string; name: string; price: number }[] };

const STOP_WORDS = ["หยุด", "หยุดพูด", "พอแล้ว", "stop"];

export default function AIPopup() {
  const router = useRouter();
  const settings = useAISettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: "สวัสดี พิมพ์หรือพูดเช่น 'หากระเป๋าไม่เกิน 300' แล้วจะค้นสินค้าจริงให้" }]);
  const [listening, setListening] = useState(false);
  const [cont, setCont] = useState(false);
  const [reading, setReading] = useState(false);
  const [melMode, setMelMode] = useState(false);
  const [speakErr, setSpeakErr] = useState("");
  const [micErr, setMicErr] = useState("");
  const melRef = useRef(false);
  const contRef = useRef(false);
  const readingRef = useRef(false);
  const silenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recRef = useRef<any>(null);

  contRef.current = cont;
  readingRef.current = reading;
  melRef.current = melMode;

  const clearSilence = () => { if (silenceRef.current) { clearTimeout(silenceRef.current); silenceRef.current = null; } };
  const armSilence = () => {
    clearSilence();
    silenceRef.current = setTimeout(() => { stopAll(); }, 30000);
  };

  const stopAll = () => {
    setCont(false);
    setReading(false);
    setMelMode(false);
    clearSilence();
    try { recRef.current?.abort(); speechSynthesis.cancel(); } catch {}
    setListening(false);
  };

  const speakMsg = (m: Msg): Promise<void> => {
    const s = settingsRef.current;
    return new Promise((resolve) => {
      try {
        window.dispatchEvent(new Event("ai-speaking"));
        setSpeakErr("");
        // 1) มีไฟล์เสียงอัดล่วงหน้า -> เปิดไฟล์เลย (ใช้ได้ทุกเครื่อง ไม่ต้องมี engine)
        if (m.audio) {
          const audio = new Audio(m.audio);
          audio.onended = () => resolve();
          audio.onerror = () => { setSpeakErr("เปิดไฟล์เสียงไม่ได้ (404?)"); resolve(); };
          audio.play().catch(() => { setSpeakErr("browser บล็อกเสียง กด 🔊 ซ้ำอีกครั้ง"); resolve(); });
          return;
        }
        // ลำดับเสียงพูด: ไฟล์อัด > katakana VOICEVOX (ถ้าเลือกเสียงเด็ก) > สคริปต์พูดเฉพาะ > คาราโอเกะ > ข้อความโชว์
        const raw = s.voice === "voicevox"
          ? (m.speakVv || m.speak || (s.speakLang === "karaoke" ? (m.karaoke || m.text) : m.text))
          : (m.speak || (s.speakLang === "karaoke" ? (m.karaoke || m.text) : m.text));
        const text = raw.replace(/\[ดู\]/g, "");
        const hasThai = /[ก-ฮ]/.test(text);
        // engine ญี่ปุ่นอ่านไทยไม่ออก: มี speakVv (katakana) หรือไม่มีไทยเลยถึงส่ง engine นอกนั้นตกไปเสียง browser
        const useEngine = s.voice === "voicevox" && (!!m.speakVv || !hasThai);
        if (useEngine) {
          fetch(`/api/voicevox?text=${encodeURIComponent(text.slice(0, 200))}&speaker=${s.vvSpeaker}`)
            .then(async (r) => {
              if (!r.ok) { setSpeakErr("ต่อ engine ไม่ได้ (เปิด VOICEVOX หรือยัง?)"); resolve(); return; }
              const audio = new Audio(URL.createObjectURL(await r.blob()));
              audio.onended = () => resolve();
              audio.onerror = () => { setSpeakErr("เล่นเสียง VOICEVOX ไม่ได้"); resolve(); };
              audio.play().catch(() => { setSpeakErr("browser บล็อกเสียง กด 🔊 ซ้ำอีกครั้ง"); resolve(); });
            })
            .catch(() => { setSpeakErr("ต่อ server เสียงไม่ได้"); resolve(); });
          return;
        }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = s.speakLang === "karaoke" ? "en-US" : "th-TH";
        u.rate = s.rate;
        const vs = speechSynthesis.getVoices();
        if (s.speakLang === "karaoke") {
          const en = vs.find((v) => v.lang.startsWith("en"));
          if (en) u.voice = en;
        } else {
          const th = vs.filter((v) => v.lang.includes("th"));
          if (th.length) u.voice = s.voice === "male" ? th[th.length - 1] : th[0];
        }
        u.onend = () => resolve();
        u.onerror = () => { setSpeakErr("เสียง browser ใช้ไม่ได้ ลองเปลี่ยน browser เป็น Chrome/Edge"); resolve(); };
        const timer = setTimeout(() => {
          // กันเงียบ: ถ้า 3 วิยังไม่เริ่มพูด แจ้งเตือน
          try {
            if (!speechSynthesis.speaking && !speechSynthesis.pending) setSpeakErr("browser ไม่ยอมพูด เช็คระดับเสียง + สิทธิ์เสียงของ browser");
          } catch {}
        }, 3000);
        const done = () => { clearTimeout(timer); resolve(); };
        u.onend = done;
        speechSynthesis.speak(u);
      } catch { resolve(); }
    });
  };

  const go = (path: string) => {
    // AI ห้ามเปิด /admin เด็ดขาด + เคารพหน้าที่ Admin อนุญาต
    if (!path || path.includes("admin")) return;
    try {
      if (!loadAllowedPages().includes(path)) return;
    } catch { return; }
    setTimeout(() => { try { router.push(path); } catch {} }, 600);
  };

  const ask = async (text: string) => {
    if (!text.trim()) return;
    clearSilence();
    if (STOP_WORDS.some((w) => text.includes(w))) {
      stopAll();
      setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: "หยุดแล้ว" }]);
      setQ("");
      return;
    }
    // ขอเปิด admin -> ปฏิเสธตามข้อความที่ Admin ตั้งไว้ ไม่พาไป
    if (isAdminRequest(text)) {
      const rf = loadAdminRefuse();
      const ai: Msg = { role: "ai", text: rf.text, speak: rf.speak };
      setMsgs((m) => [...m, { role: "user", text }, ai]);
      setQ("");
      if (contRef.current) {
        await speakMsg(ai);
        if (contRef.current) startListen();
        else armSilence();
      }
      return;
    }
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    // เรียกชื่อ (meluna/melon/may) ตรงไหนก็ได้ -> เปิดโหมด Meluna คุยอิสระ แล้วทำคำสั่งต่อ
    let query = text;
    if (containsWake(text)) {
      if (!melRef.current) {
        setMelMode(true);
        melRef.current = true;
      }
      const rest = stripWake(text);
      if (!rest) {
        const g = wakeGreeting();
        const ai: Msg = { role: "ai", text: `💅 โหมด Meluna เปิดแล้ว ${g}`, speak: g };
        setMsgs((m) => [...m, ai]);
        if (contRef.current) {
          await speakMsg(ai);
          if (contRef.current) startListen();
          else armSilence();
        }
        return;
      }
      query = rest;
    }
    // 1) ลองสคริปต์ก่อน (Admin เขียนไว้) - โชว์ answer พูด speak ส่งรูปได้ พาไปหน้าได้
    const hit = matchScript(query);
    if (hit) {
      const ai: Msg = { role: "ai", text: hit.answer, speak: hit.speak, speakVv: hit.speakVv, image: hit.image, goto: hit.goto, audio: hit.audio };
      setMsgs((m) => [...m, ai]);
      if (hit.goto) go(hit.goto);
      if (contRef.current) {
        await speakMsg(ai);
        if (contRef.current) startListen();
        else armSilence();
      }
      return;
    }
    // 2) ไม่ตรงสคริปต์ -> ค้นสินค้าจริง
    try {
      const r = await fetch("/api/ai-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query }) });
      const j = await r.json();
      let ai: Msg = { role: "ai", text: decorate(j.answer), karaoke: j.karaoke, links: j.items };
      // ขอรูป -> สุ่มจากคลังรูปแนบไปด้วย
      if (wantsImage(text)) {
        const lib = loadLibrary();
        if (lib.length) {
          const pick = lib[Math.floor(Math.random() * lib.length)];
          ai = { ...ai, image: pick.dataUrl };
        } else {
          ai = { ...ai, text: `${ai.text} (คลังรูปยังว่าง ให้ Admin อัปโหลดก่อนน้า)` };
        }
      }
      // 3) หาไม่เจอตรงๆ -> มีของใกล้เคียงโชว์ให้ / ไม่มีเลยค่อยคุยอิสระหรือข้อความ Admin
      if (!j.items || j.items.length === 0) {
        if (melRef.current) {
          let f = "";
          try {
            const hist = msgs.filter((m) => m.role === "user" || m.role === "ai").slice(-6).map((m) => ({ role: m.role, text: m.text }));
            const cr = await fetch("/api/meluna-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query, history: hist }) });
            const cj = await cr.json();
            if (cj.text) f = cj.text;
          } catch {}
          if (!f) f = freeChatFor(query);
          ai = { role: "ai", text: f, speak: f };
        } else {
          const nf = loadNotFound();
          ai = { role: "ai", text: nf.text, speak: nf.speak, audio: nf.audio || undefined };
        }
        const page = detectPageIntent(query);
        if (page) {
          const label = AI_PAGES.find((p) => p.path === page)?.label || page;
          ai = { role: "ai", text: `${ai.text} กำลังพาไปหน้า${label}`, speak: `กำลังพาไปหน้า${label}`, goto: page };
          go(page);
        }
      } else if (!j.exact) {
        // ใกล้เคียง: โชว์ลิงก์สินค้าใกล้เคียง + พูดตามโหมด
        const nf = loadNotFound();
        ai = { role: "ai", text: j.answer, karaoke: j.karaoke, links: j.items, speak: melRef.current ? undefined : nf.speak, audio: melRef.current ? undefined : (nf.audio || undefined) };
      }
      setMsgs((m) => [...m, ai]);
      if (contRef.current) {
        await speakMsg(ai);
        if (contRef.current) startListen();
        else armSilence();
      }
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: "ค้นไม่สำเร็จ ลองคำว่า กระเป๋า / ไม้ / ผ้า" }]);
      if (contRef.current) startListen();
    }
  };

  // อ่านสคริปต์ทั้งหมดทีละข้อจนจบ/สั่งหยุด
  const readAllScript = async () => {
    const items = loadScript();
    if (!items.length) return;
    setReading(true);
    readingRef.current = true;
    setMsgs((m) => [...m, { role: "ai", text: `เริ่มอ่านสคริปต์ ${items.length} ข้อ พูดว่า 'หยุด' เพื่อหยุด` }]);
    for (const it of items) {
      if (!readingRef.current) break;
      const ai: Msg = { role: "ai", text: it.answer, speak: it.speak, speakVv: it.speakVv, image: it.image, audio: it.audio };
      setMsgs((m) => [...m, ai]);
      await speakMsg(ai);
    }
    setReading(false);
    readingRef.current = false;
  };

  const startListen = () => {
    try {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setMicErr("browser นี้ใช้ไมค์ไม่ได้ ให้พิมพ์แทน"); setCont(false); return; }
      setMicErr("");
      try { recRef.current?.abort(); } catch {}
      const rec = new SR();
      rec.lang = "th-TH";
      rec.interimResults = false;
      recRef.current = rec;
      setListening(true);
      armSilence();
      rec.onresult = (e: any) => {
        const t = e.results[0][0].transcript;
        setListening(false);
        setMicErr("");
        ask(t);
      };
      rec.onerror = (e: any) => {
        setListening(false);
        const err = e?.error || "";
        if (err === "not-allowed" || err === "service-not-allowed") setMicErr("กดอนุญาตไมค์ใน browser ก่อนน้า");
        else if (err === "no-speech") setMicErr("ไม่ได้ยินเสียง พูดอีกครั้งได้เลย");
        else if (err === "audio-capture") setMicErr("หาไมค์ไม่เจอ เสียบ/เปิดไมค์ก่อน");
        if (contRef.current && (err === "no-speech" || err === "")) { setTimeout(() => contRef.current && startListen(), 800); }
        else if (contRef.current && (err === "not-allowed" || err === "service-not-allowed" || err === "audio-capture")) setCont(false);
      };
      rec.onend = () => { setListening(false); };
      rec.start();
    } catch { setCont(false); }
  };

  const micOnce = () => {
    try {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setMicErr("browser นี้ใช้ไมค์ไม่ได้ ให้พิมพ์แทน"); return; }
      setMicErr("");
      const rec = new SR();
      rec.lang = "th-TH";
      setListening(true);
      rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setListening(false); setMicErr(""); setQ(t); ask(t); };
      rec.onerror = (e: any) => {
        setListening(false);
        const err = e?.error || "";
        if (err === "not-allowed" || err === "service-not-allowed") setMicErr("กดอนุญาตไมค์ใน browser ก่อนน้า");
        else if (err === "no-speech") setMicErr("ไม่ได้ยินเสียง พูดอีกครั้งได้เลย");
        else if (err === "audio-capture") setMicErr("หาไมค์ไม่เจอ เสียบ/เปิดไมค์ก่อน");
      };
      rec.onend = () => setListening(false);
      rec.start();
    } catch { setMicErr("ใช้ไมค์ไม่ได้ ให้พิมพ์แทน"); }
  };

  const toggleCont = () => {
    if (cont) { stopAll(); }
    else {
      setCont(true);
      setMsgs((m) => [...m, { role: "ai", text: "เปิดโหมดคุยต่อเนื่องแล้ว พูดได้เลย พูดว่า 'หยุด' เพื่อหยุด" }]);
      startListen();
    }
  };

  useEffect(() => { try { speechSynthesis.getVoices(); } catch {} }, [open]);
  useEffect(() => () => { clearSilence(); try { recRef.current?.abort(); } catch {} }, []);

  if (!open) return <button className="btn" style={{ position: "fixed", right: 20, bottom: 20, zIndex: 30 }} onClick={() => setOpen(true)}>✨ AI</button>;

  return (
    <div className="card aipopup" style={{ position: "fixed", right: 20, bottom: 20, display: "flex", flexDirection: "column", zIndex: 30, border: "2px solid #B8860B", padding: 0, overflow: "hidden" }}>
      <div style={{ background: "#7a1c1c", color: "#fff", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
        <b>✨ AI{melMode ? " 💅 Meluna" : ""}{cont ? " (คุยต่อเนื่อง...)" : ""}{reading ? " (อ่านสคริปต์...)" : ""}</b>
        <button onClick={() => { setOpen(false); stopAll(); }} style={{ background: "transparent", color: "#fff", border: "none", cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: m.role === "user" ? "right" : "left" }}>
            <div style={{ display: "inline-block", background: m.role === "user" ? "#7a1c1c" : "#fff", color: m.role === "user" ? "#fff" : "#2b2320", border: "1px solid #E3C878", borderRadius: 8, padding: "8px 10px", maxWidth: "90%" }}>
              {m.text}
              {m.image && <div><img src={m.image} alt="" style={{ width: "100%", maxWidth: 260, borderRadius: 6, marginTop: 6, border: "1px solid #E3C878" }} /></div>}
              {m.goto && <div><a href={m.goto} style={{ color: "#7a1c1c", fontWeight: 700 }}>ไปหน้า{AI_PAGES.find((p) => p.path === m.goto)?.label || m.goto} →</a></div>}
              {m.links?.map((l) => (
                <div key={l.id}><a href={`/product/${l.id}`} style={{ color: "#7a1c1c", fontWeight: 700 }}>{l.name} ฿{l.price} [ดู]</a></div>
              ))}
              {m.role === "ai" && <div><button className="btn-secondary btn" style={{ fontSize: 12, marginTop: 6 }} onClick={() => speakMsg(m)}>🔊 พูด</button></div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 10, borderTop: "1px solid #E3C878" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)} placeholder="หากระเป๋าไม่เกิน 300" style={{ flex: 1, padding: 8 }} />
          <button className="btn" onClick={micOnce} style={listening ? { background: "#c0392b" } : undefined} title="พูดค้นหา">{listening ? "🔴" : "🎤"}</button>
          <button className="btn" onClick={() => ask(q)}>ส่ง</button>
        </div>
        {listening && <div style={{ marginTop: 6, fontSize: 12, color: "#7a1c1c" }}>🎤 กำลังฟัง... พูดได้เลย</div>}
        {micErr && <div style={{ marginTop: 6, fontSize: 12, color: "#7a1c1c" }}>🎤 {micErr}</div>}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button className={cont ? "btn" : "btn btn-secondary"} style={{ flex: 1 }} onClick={toggleCont}>
            {cont ? "⏹ หยุดคุยต่อเนื่อง" : "▶ คุยต่อเนื่อง"}
          </button>
          <button className={reading ? "btn" : "btn btn-secondary"} style={{ flex: 1 }} onClick={() => (reading ? stopAll() : readAllScript())}>
            {reading ? "⏹ หยุดอ่าน" : "▶ อ่านสคริปต์ทั้งหมด"}
          </button>
        </div>
        {speakErr && <div style={{ marginTop: 6, fontSize: 12, color: "#7a1c1c" }}>🔇 {speakErr}</div>}
      </div>
    </div>
  );
}
