import "./globals.css";
import Navbar from "@/components/Navbar";
import AIPopup from "@/components/AIPopup";
import DbSync from "@/components/DbSync";

export const metadata = {
  title: "Phayao Prison Craft & Culture E-Shopping",
  description: "งานมือผู้ต้องขัง สู่ของขวัญพะเยา",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="topbar">
          <img src="/logo.jpg" alt="ตรากรมราชทัณฑ์" width={40} height={40} style={{ borderRadius: "50%" }} />
          <div>
            <div style={{ fontWeight: 800 }}>Phayao Prison Craft &amp; Culture E-Shopping</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>กรมราชทัณฑ์ เรือนจำจังหวัดพะเยา | งานมือผู้ต้องขัง สู่ของขวัญพะเยา</div>
          </div>
        </div>
        <Navbar />
        <DbSync />
        <div className="container">{children}</div>
        <div className="footer">กรมราชทัณฑ์ | แดงเลือดหมู-ทอง ทางการ | Mock 5 ชิ้น | Checkout จำลอง PHxxxx</div>
        <AIPopup />
      </body>
    </html>
  );
}
