import { listMd, readMd } from "@/lib/docs";

export default function ReqPage() {
  const files = listMd("Req");
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>Req - ความต้องการ (4 ไฟล์ดิบ)</h2>
      <p>อ่านตรงจากโฟลเดอร์ <code>Req/</code> ไม่ต้อง login</p>
      {files.map((f) => {
        const content = readMd("Req", f);
        return (
          <details key={f} className="card" open={f === "requirements.md"}>
            <summary style={{ fontWeight: 800, color: "#7a1c1c", cursor: "pointer" }}>
              {f}
            </summary>
            <pre className="md">{content}</pre>
          </details>
        );
      })}
    </div>
  );
}
