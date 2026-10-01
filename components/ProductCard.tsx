"use client";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useLang } from "@/lib/i18n";

import { addToCart } from "@/lib/cartStore";
export { addToCart };

export function pname(p: Product, lang: "th" | "en"): string {
  return lang === "en" ? (p.name_en || p.name_th) : p.name_th;
}

export default function ProductCard({ p }: { p: Product }) {
  const { lang, t } = useLang();
  return (
    <Link href={`/product/${p.id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {p.image ? (
          <img src={p.image} alt={p.name_th} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderBottom: "2px solid #E3C878" }} />
        ) : (
          <div style={{ background: p.color, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, borderBottom: "2px solid #E3C878" }}>
            {p.emoji}
          </div>
        )}
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, minHeight: 44 }}>{pname(p, lang)}</div>
          <div><span className="badge">{p.category}</span> <span style={{ fontSize: 12 }}>{t("stock_left")} {p.stock}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ color: "#7a1c1c", fontWeight: 800 }}>฿{p.price}</span>
            {p.stock <= 0 ? (
              <span className="badge">{t("sold_out")}</span>
            ) : (
              <button className="btn" onClick={(e) => { e.preventDefault(); addToCart(p.id, 1); }}>{t("add_cart")}</button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
