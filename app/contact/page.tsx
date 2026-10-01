"use client";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export default function ContactPage() {
  const { lang } = useLang();
  const c = usePage("contact");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(c, lang)}</h2>
      <div className="card" style={{ textAlign: "center" }}>
        <img src="/contact01.jpg" alt="ข้อมูลติดต่อ" style={{ maxWidth: 560, width: "100%", borderRadius: 8, border: "2px solid #E3C878" }} />
      </div>
      <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{pbody(c, lang)}</p></div>
    </div>
  );
}
