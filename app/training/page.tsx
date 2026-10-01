"use client";
import { useEffect, useState } from "react";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { loadCourses, type Course } from "@/lib/training";
import PageBlocks from "@/components/PageBlocks";

function Desc({ text }: { text: string }) {
  // ตัวหน้อัตโนมัติตั้งแต่คำว่า "ตัวอย่าง"
  const i = text.indexOf("ตัวอย่าง");
  if (i < 0) return <p style={{ color: "#555" }}>{text}</p>;
  return (
    <p style={{ color: "#555" }}>
      {text.slice(0, i)}
      <b style={{ color: "#2b2320" }}>{text.slice(i)}</b>
    </p>
  );
}

export default function TrainingPage() {
  const { lang } = useLang();
  const c = usePage("training");
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    const reload = () => setCourses(loadCourses());
    reload();
    window.addEventListener("courses-changed", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("db-pulled", reload);
    return () => {
      window.removeEventListener("courses-changed", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("db-pulled", reload);
    };
  }, []);
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(c, lang)}</h2>
      {courses.map((t) => (
        <div key={t.id} className="card" style={{ borderTop: "4px solid #7a1c1c" }}>
          <h3 style={{ color: "#7a1c1c", margin: "0 0 8px" }}>{lang === "en" ? (t.title_en || t.title) : t.title}</h3>
          <Desc text={lang === "en" ? (t.desc_en || t.desc) : t.desc} />
        </div>
      ))}
      {c.blocks && c.blocks.length > 0
        ? <div className="card"><PageBlocks blocks={c.blocks} /></div>
        : (pbody(c, lang) ? <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{pbody(c, lang)}</p></div> : null)}
    </div>
  );
}
