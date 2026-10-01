"use client";
import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { src: "/music/bgm1.mp4", name: "For Tomorrow - SavfkMusic" },
  { src: "/music/bgm2.mp4", name: "Phoenix - Netrum & Halvorsen (NCS)" },
];

export default function MusicButton() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.5);
  const [idx, setIdx] = useState(0);
  const [shuffle, setShuffle] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("music-vol");
      if (v) setVol(parseFloat(v));
      const s = localStorage.getItem("music-shuffle");
      if (s) setShuffle(s === "1");
    } catch {}
    const duck = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.volume = vol * 0.25;
        setTimeout(() => { if (audioRef.current) audioRef.current.volume = vol; }, 3000);
      }
    };
    window.addEventListener("ai-speaking", duck as any);
    return () => window.removeEventListener("ai-speaking", duck as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
    try {
      localStorage.setItem("music-vol", String(vol));
      localStorage.setItem("music-shuffle", shuffle ? "1" : "0");
    } catch {}
  }, [vol, shuffle]);

  const playIdx = (i: number) => {
    setIdx(i);
    setPlaying(true);
    requestAnimationFrame(() => audioRef.current?.play().catch(() => setPlaying(false)));
  };

  const next = () => {
    if (shuffle) {
      let n = Math.floor(Math.random() * TRACKS.length);
      if (TRACKS.length > 1 && n === idx) n = (n + 1) % TRACKS.length;
      playIdx(n);
    } else {
      playIdx((idx + 1) % TRACKS.length);
    }
  };

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      // กดครั้งแรกสุ่มเพลงให้เลย
      if (shuffle && audioRef.current?.currentTime === 0) next();
      else audioRef.current?.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="navlink" onClick={() => setOpen(!open)} title="เพลงพื้นหลัง">♪</button>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, top: 44, width: 260, zIndex: 20 }}>
          <div style={{ fontWeight: 800, color: "#7a1c1c" }}>♪ {TRACKS[idx].name}</div>
          <audio ref={audioRef} src={TRACKS[idx].src} loop={false} onEnded={next} />
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <button className="btn" onClick={toggle}>{playing ? "⏸" : "▶"}</button>
            <button className="btn btn-secondary" onClick={next}>⏭</button>
            <button className="btn btn-secondary" onClick={() => setShuffle(!shuffle)} title="สุ่มเพลง">{shuffle ? "🔀" : "➡"}</button>
          </div>
          <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(parseFloat(e.target.value))} style={{ width: "100%", marginTop: 8 }} />
          <div style={{ fontSize: 12, marginTop: 6 }}>จบเพลงสุ่มเพลงต่อไปเอง | เบาเสียงเองตอน AI พูด</div>
        </div>
      )}
    </div>
  );
}
