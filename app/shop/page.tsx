"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, loadCategories, type Product } from "@/lib/products";
import { usePage } from "@/lib/content";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const page = usePage("shop");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ทั้งหมด");
  const [max, setMax] = useState(2000);
  const [all, setAll] = useState<Product[]>(MOCK_PRODUCTS);
  const [cats, setCats] = useState<string[]>(["ทั้งหมด", ...loadCategories()]);
  useEffect(() => {
    const reload = () => { setAll(allProducts()); setCats(["ทั้งหมด", ...loadCategories()]); };
    reload();
    window.addEventListener("stock-changed", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("categories-changed", reload);
    return () => {
      window.removeEventListener("stock-changed", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("categories-changed", reload);
    };
  }, []);
  const list = all.filter((p) => {
    const hitQ = !q || `${p.name_th} ${p.material}`.includes(q);
    const hitC = cat === "ทั้งหมด" || p.category === cat;
    return hitQ && hitC && p.price <= max;
  });
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{page.title} ({list.length})</h2>
      <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นชื่อ..." style={{ padding: 8, flex: 1, minWidth: 160 }} />
        {cats.map((c) => (
          <button key={c} className={cat === c ? "btn" : "btn btn-secondary"} onClick={() => setCat(c)}>{c}</button>
        ))}
        <label>ไม่เกิน ฿{max}<input type="range" min={99} max={2000} value={max} onChange={(e) => setMax(parseInt(e.target.value))} /></label>
      </div>
      <div className="grid3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
