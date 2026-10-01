"use client";
import { usePage } from "@/lib/content";

export default function AboutPage() {
  const c = usePage("about");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{c.title}</h2>
      <div className="card"><p style={{ whiteSpace: "pre-wrap" }}>{c.body}</p></div>
    </div>
  );
}
