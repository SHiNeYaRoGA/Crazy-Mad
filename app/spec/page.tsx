import { listMd, readMd } from "@/lib/docs";

export default function SpecPage() {
  const files = listMd("Spec");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>Spec - ตัวปัจจุบันที่ล็อกแล้ว</h2>
      <div className="card">
        <h3>สีทางการ (ตามโลโก้กรมราชทัณฑ์)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["#7A1C1C", "#B8860B", "#FDF8EE", "#2B2320", "#E3C878"].map((c) => (
            <span key={c} className="badge" style={{ background: c, color: c === "#FDF8EE" || c === "#E3C878" ? "#2b2320" : "#fff" }}>{c}</span>
          ))}
        </div>
      </div>
      {files.map((f) => (
        <div key={f} className="card">
          <h3>{f}</h3>
          <pre className="md">{readMd("Spec", f)}</pre>
        </div>
      ))}
    </div>
  );
}
