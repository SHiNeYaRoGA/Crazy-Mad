"use client";
import Link from "next/link";
import type { Product } from "@/lib/products";

import { addToCart } from "@/lib/cartStore";
export { addToCart };

export default function ProductCard({ p }: { p: Product }) {
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
          <div style={{ fontWeight: 700, minHeight: 44 }}>{p.name_th}</div>
          <div><span className="badge">{p.category}</span> <span style={{ fontSize: 12 }}>คงเหลือ {p.stock}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ color: "#7a1c1c", fontWeight: 800 }}>฿{p.price}</span>
            {p.stock <= 0 ? (
              <span className="badge">หมด</span>
            ) : (
              <button className="btn" onClick={(e) => { e.preventDefault(); addToCart(p.id, 1); }}>+ ใส่ตะกร้า</button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
