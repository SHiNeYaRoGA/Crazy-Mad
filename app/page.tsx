"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, type Product } from "@/lib/products";
import { usePage, ptitle, pbody } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { lang, t } = useLang();
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
          <span className="badge">{t("home_badge")}</span>
          <h2 style={{ color: "#7a1c1c", margin: "6px 0" }}>{ptitle(home, lang)}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{pbody(home, lang)}</p>
          <Link className="btn" href="/shop">{t("home_cta")}</Link>
        </div>
      </div>
      <h3 style={{ color: "#7a1c1c" }}>{t("featured")}</h3>
      <div className="grid3">
        {all.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
