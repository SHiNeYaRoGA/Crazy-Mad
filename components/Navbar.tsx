"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import MusicButton from "./MusicButton";

export default function Navbar() {
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
      <Link className="navlink" href="/shop">Shop</Link>
      <Link className="navlink" href="/training">งานฝึกวิชาชีพ</Link>
      <Link className="navlink" href="/about">เกี่ยวกับเรา</Link>
      <Link className="navlink" href="/contact">ติดต่อ</Link>
      <Link className="navlink" href="/admin">Admin</Link>
      <span style={{ flex: 1 }} />
      <MusicButton />
      <Link className="navlink" href="/cart">Cart({count})</Link>
    </nav>
  );
}
