"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, type Product } from "@/lib/products";
import { usePage } from "@/lib/content";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const home = usePage("home");
  const [all, setAll] = useState<Product[]>(MOCK_PRODUCTS);
  useEffect(() => {
    const reload = () => setAll(allProducts());
    reload();
    window.addEventListener("stock-changed", reload);
    window.addEventListener("products-changed", reload);
    window.addEventListener("db-pulled", reload);
    return () => {
      window.removeEventListener("stock-changed", reload);
      window.removeEventListener("products-changed", reload);
      window.removeEventListener("db-pulled", reload);
    };
  }, []);
  return (
    <div>
      <div className="card" style={{ borderLeft: "6px solid #7a1c1c", display: "flex", gap: 16, alignItems: "center" }}>
        <img src="/logo.jpg" alt="logo" width={72} height={72} />
        <div>
          <span className="badge">กรมราชทัณฑ์ พะเยา</span>
          <h2 style={{ color: "#7a1c1c", margin: "6px 0" }}>{home.title}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{home.body}</p>
          <Link className="btn" href="/shop">เข้าชมสินค้า</Link>
        </div>
      </div>
      <h3 style={{ color: "#7a1c1c" }}>สินค้าเด่น</h3>
      <div className="grid3">
        {all.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
