"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import MusicButton from "./MusicButton";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const c = JSON.parse(localStorage.getItem("cart") || "[]");
        setCount(c.reduce((s: number, i: any) => s + (i.qty || 1), 0));
      } catch { setCount(0); }
    };
    read();
    window.addEventListener("cart-changed", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("cart-changed", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return (
    <nav className="navbar">
      <Link className="navlink" href="/">Home</Link>
      <Link className="navlink" href="/shop">{t("nav_shop")}</Link>
      <Link className="navlink" href="/training">{t("nav_training")}</Link>
      <Link className="navlink" href="/about">{t("nav_about")}</Link>
      <Link className="navlink" href="/contact">{t("nav_contact")}</Link>
      <Link className="navlink" href="/admin">Admin</Link>
      <span style={{ flex: 1 }} />
      <button className="navlink" onClick={() => setLang(lang === "th" ? "en" : "th")} title="เปลี่ยนภาษา / Language">{lang === "th" ? "EN" : "ไทย"}</button>
      <MusicButton />
      <Link className="navlink" href="/cart">{t("nav_cart")}({count})</Link>
    </nav>
  );
}
