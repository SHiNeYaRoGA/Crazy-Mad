"use client";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";

export default function AboutPage() {
  const { lang } = useLang();
  const c = usePage("about");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(c, lang)}</h2>
      <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{pbody(c, lang)}</p></div>
    </div>
  );
}
