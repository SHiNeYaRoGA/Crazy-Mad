"use client";
import { useEffect, useState } from "react";

const ITEMS = [
  "เปิด link ได้ ไม่ต้อง login ก็ดูได้",
  "โชว์ Req 4 ไฟล์ครบ",
  "โชว์ Spec ปัจจุบัน (แดง-ทอง v3)",
  "พิมพ์ค้นหาในเว็บเจอเอกสารจริง",
  "กดฟังเสียงอ่านเอกสารได้ (TTS)",
  "เพลงเดียวเปิด/ปิด + จำค่าได้",
  "Job ติ๊กสถานะแล้วจำค่าได้ (localStorage)",
  "Deploy Vercel ไม่จอขาว",
];

export default function JobPage() {
  const [checked, setChecked] = useState<boolean[]>(Array(ITEMS.length).fill(false));
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const c = localStorage.getItem("job-checked");
      if (c) setChecked(JSON.parse(c));
      const n = localStorage.getItem("job-note");
      if (n) setNote(n);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("job-checked", JSON.stringify(checked));
    } catch {}
  }, [checked]);

  const done = checked.filter(Boolean).length;

  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>Job - สถานะงาน ({done}/{ITEMS.length})</h2>
      <div className="card">
        <div style={{ background: "#eee", borderRadius: 6, height: 12, overflow: "hidden" }}>
          <div style={{ width: `${(done / ITEMS.length) * 100}%`, background: "#7a1c1c", height: "100%" }} />
        </div>
        <p>ไฟล์จริง: <code>Job/status.md</code> - หน้านี้จำค่าติ๊กในเครื่องให้</p>
      </div>
      <div className="card">
        {ITEMS.map((t, i) => (
          <label key={i} className="jobitem">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => setChecked((p) => p.map((v, j) => (j === i ? !v : v)))}
            />
            <span style={{ textDecoration: checked[i] ? "line-through" : "none" }}>{t}</span>
          </label>
        ))}
      </div>
      <div className="card">
        <h3>บันทึกเพิ่ม</h3>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            try { localStorage.setItem("job-note", e.target.value); } catch {}
          }}
          rows={4}
          style={{ width: "100%", padding: 10 }}
          placeholder="พิมพ์สถานะงาน..."
        />
      </div>
    </div>
  );
}
