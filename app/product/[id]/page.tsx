"use client";
import { useEffect, useState } from "react";
import { findProduct, getStock, type Product } from "@/lib/products";
import { addToCart } from "@/lib/cartStore";
import { useLang } from "@/lib/i18n";
import { pname } from "@/components/ProductCard";

export default function ProductPage({ params }: { params: { id: string } }) {
  const { lang, t } = useLang();
  const [p, setP] = useState<Product | undefined>(undefined);
  const [qty, setQty] = useState(1);
  useEffect(() => { setP(findProduct(params.id)); }, [params.id]);
  if (!p) return <div className="card">...</div>;
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(`${pname(p, lang)} ราคา ${p.price}บาท ${p.story}`);
      u.lang = "th-TH";
      speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <div className="card pdetail">
      {p.image ? (
        <img src={p.image} alt={p.name_th} style={{ width: "100%", minHeight: 280, objectFit: "cover", border: "1px solid #E3C878", borderRadius: 6 }} />
      ) : (
        <div style={{ background: p.color, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, border: "1px solid #E3C878", borderRadius: 6 }}>{p.emoji}</div>
      )}
      <div>
        <span className="badge">{p.category}</span>
        <h2 style={{ color: "#7a1c1c" }}>{pname(p, lang)}</h2>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#7a1c1c" }}>฿{p.price}</div>
        <p><b>{t("lb_material")}:</b> {p.material} | <b>{t("lb_stock")}:</b> {getStock(p)}</p>
        <p><b>{t("lb_story")}:</b> {p.story}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {getStock(p) <= 0 ? (
            <span className="badge">{t("sold_out")}</span>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <input type="number" min={1} max={getStock(p)} value={qty} onChange={(e) => setQty(Math.min(getStock(p), Math.max(1, parseInt(e.target.value) || 1)))} style={{ width: 60, padding: 8, textAlign: "center" }} />
              <button className="btn btn-secondary" onClick={() => setQty(Math.min(getStock(p), qty + 1))}>+</button>
              <button className="btn" onClick={() => addToCart(p.id, qty)}>{t("add_cart")}</button>
            </>
          )}
          <button className="btn btn-secondary" onClick={speak}>{t("btn_read")}</button>
        </div>
      </div>
    </div>
  );
}
