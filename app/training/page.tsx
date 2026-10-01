"use client";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import PageBlocks from "@/components/PageBlocks";

export default function TrainingPage() {
  const { lang } = useLang();
  const c = usePage("training");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(c, lang)}</h2>
      {c.blocks && c.blocks.length > 0
        ? <div className="card"><PageBlocks blocks={c.blocks} /></div>
        : <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{pbody(c, lang)}</p></div>}
    </div>
  );
}
