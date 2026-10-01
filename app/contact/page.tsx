"use client";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import PageBlocks from "@/components/PageBlocks";

export default function ContactPage() {
  const { lang } = useLang();
  const c = usePage("contact");
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#7a1c1c", fontSize: 28 }}>{ptitle(c, lang)}</h2>
      <div className="card" style={{ borderTop: "4px solid #B8860B", maxWidth: 640, margin: "0 auto" }}>
        {c.blocks && c.blocks.length
          ? <PageBlocks blocks={c.blocks} />
          : <p style={{ whiteSpace: "pre-wrap", fontSize: 18, lineHeight: 2, color: "#2b2320" }}>{pbody(c, lang)}</p>}
      </div>
    </div>
  );
}
