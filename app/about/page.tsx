"use client";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import PageBlocks from "@/components/PageBlocks";

export default function AboutPage() {
  const { lang } = useLang();
  const c = usePage("about");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(c, lang)}</h2>
      <div className="card" style={{ textAlign: "center" }}>
        <img src="/commander.png" alt="ผบ." style={{ maxWidth: 320, width: "100%", borderRadius: 8, border: "2px solid #E3C878" }} />
        <div style={{ fontWeight: 800, marginTop: 8 }}>ผบ.</div>
      </div>
      <div className="card" style={{ borderLeft: "6px solid #7a1c1c" }}>
        <div style={{ fontWeight: 800, color: "#7a1c1c", fontSize: 18 }}>
          {lang === "en" ? "Vision - Department of Corrections" : "วิสัยทัศน์ -กรมราชทัณฑ์"}
        </div>
        <p style={{ fontWeight: 800, color: "#7a1c1c" }}>
          {lang === "en"
            ? "“An efficient organization in controlling and developing inmates' behavior to international standards to protect and safeguard society”"
            : "“องค์กรที่มีประสิทธิภาพในการควบคุมและพัฒนา พฤตินิสัยผู้ต้องขังตามมาตรฐานสากลเพื่อปกป้องคุ้มครองสังคม”"}
        </p>
      </div>
      {c.blocks && c.blocks.length > 0
        ? <div className="card"><PageBlocks blocks={c.blocks} /></div>
        : <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{pbody(c, lang)}</p></div>}
    </div>
  );
}
