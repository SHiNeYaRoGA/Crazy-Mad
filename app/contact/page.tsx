"use client";
import { usePage, ptitle, pbody, type ContentBlock } from "@/lib/content";
import { useLang } from "@/lib/i18n";

const SIZES = { s: 15, m: 18, l: 24 };

function Block({ b }: { b: ContentBlock }) {
  return (
    <p style={{
      whiteSpace: "pre-wrap",
      fontWeight: b.bold ? 800 : 400,
      color: b.color,
      fontSize: SIZES[b.size] || 18,
      lineHeight: 2,
      textAlign: b.align,
      background: b.color === "#ffffff" ? "#7a1c1c" : undefined,
      borderRadius: 6,
      padding: b.color === "#ffffff" ? "8px" : 0,
    }}>{b.text}</p>
  );
}

export default function ContactPage() {
  const { lang } = useLang();
  const c = usePage("contact");
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "#7a1c1c", fontSize: 28 }}>{ptitle(c, lang)}</h2>
      <div className="card" style={{ borderTop: "4px solid #B8860B", maxWidth: 640, margin: "0 auto" }}>
        {c.blocks && c.blocks.length
          ? c.blocks.map((b, i) => <Block key={i} b={b} />)
          : <p style={{ whiteSpace: "pre-wrap", fontSize: 18, lineHeight: 2, color: "#2b2320" }}>{pbody(c, lang)}</p>}
      </div>
    </div>
  );
}
