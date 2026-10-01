"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, loadCategories, catName, type Product } from "@/lib/products";
import { usePage, ptitle } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import PageBlocks from "@/components/PageBlocks";

export default function ShopPage() {
  const page = usePage("shop");
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [max, setMax] = useState(2000);
  const [all, setAll] = useState<Product[]>(MOCK_PRODUCTS);
  const [cats, setCats] = useState<string[]>(loadCategories());
  useEffect(() => {
    const reload = () => { setAll(allProducts()); setCats(loadCategories()); };
    reload();
    window.addEventListener("stock-changed", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("categories-changed", reload);
    window.addEventListener("products-changed", reload);
    window.addEventListener("db-pulled", reload);
    return () => {
      window.removeEventListener("stock-changed", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("categories-changed", reload);
      window.removeEventListener("products-changed", reload);
      window.removeEventListener("db-pulled", reload);
    };
  }, []);
  const ALL = t("all");
  const list = all.filter((p) => {
    const hitQ = !q || `${p.name_th} ${p.name_en || ""} ${p.material}`.toLowerCase().includes(q.toLowerCase());
    const hitC = !cat || p.category === cat;
    return hitQ && hitC && p.price <= max;
  });
  const showCats = [ALL, ...cats.filter((c) => c !== "ทั้งหมด" && c !== ALL)];
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{ptitle(page, lang)} ({list.length})</h2>
      {page.blocks && page.blocks.length > 0 && <div className="card"><PageBlocks blocks={page.blocks} /></div>}
      <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_ph")} style={{ padding: 8, flex: 1, minWidth: 160 }} />
        <button className={!cat ? "btn" : "btn btn-secondary"} onClick={() => setCat("")}>{ALL}</button>
        {showCats.slice(1).map((c) => (
          <button key={c} className={cat === c ? "btn" : "btn btn-secondary"} onClick={() => setCat(c)}>{catName(c, lang)}</button>
        ))}
        <label>{t("max_price")} ฿{max}<input type="range" min={99} max={2000} value={max} onChange={(e) => setMax(parseInt(e.target.value))} /></label>
      </div>
      <div className="grid3">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
