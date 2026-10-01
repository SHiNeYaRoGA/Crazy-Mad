"use client";
import { useEffect, useState } from "react";

export type Lang = "th" | "en";
const KEY = "site-lang";

const DICT = {
  nav_home: ["Home", "Home"],
  nav_shop: ["Shop", "Shop"],
  nav_training: ["งานฝึกวิชาชีพ", "Vocational Training"],
  nav_about: ["เกี่ยวกับเรา", "About Us"],
  nav_contact: ["ติดต่อ", "Contact"],
  nav_admin: ["Admin", "Admin"],
  nav_cart: ["ตะกร้า", "Cart"],
  home_badge: ["กรมราชทัณฑ์ พะเยา", "Dept. of Corrections, Phayao"],
  home_cta: ["เข้าชมสินค้า", "Browse products"],
  featured: ["สินค้าเด่น", "Featured"],
  search_ph: ["ค้นชื่อ...", "Search name..."],
  all: ["ทั้งหมด", "All"],
  max_price: ["ไม่เกิน", "Up to"],
  add_cart: ["+ ใส่ตะกร้า", "+ Add to cart"],
  sold_out: ["หมด", "Sold out"],
  stock_left: ["คงเหลือ", "Left"],
  lb_material: ["วัสดุ", "Material"],
  lb_stock: ["สต็อกคงเหลือ", "Stock"],
  lb_story: ["เรื่องราว", "Story"],
  btn_read: ["🔊 ให้ AI อ่าน", "🔊 Read aloud"],
  cart_title: ["ตะกร้า + ชำระเงินจำลอง", "Cart + Mock checkout"],
  cart_empty: ["ตะกร้าว่าง", "Cart is empty"],
  total: ["รวม", "Total"],
  ship_title: ["ที่อยู่จัดส่ง", "Shipping address"],
  ph_name: ["ชื่อ", "Name"],
  ph_phone: ["เบอร์", "Phone"],
  ph_addr: ["ที่อยู่", "Address"],
  order_btn: ["สั่งซื้อจำลอง", "Place mock order"],
  order_ok: ["สั่งซื้อสำเร็จ เลข", "Order placed: "],
  order_thanks: ["จำลอง ไม่ตัดเงินจริง ขอบคุณที่อุดหนุนงานผู้ต้องขังพะเยา", "Mock only, no real charge. Thanks for supporting Phayao prison crafts"],
  ai_ph: ["หากระเป๋าไม่เกิน 300", "e.g. bag under 300"],
  send: ["ส่ง", "Send"],
  listening: ["🎤 กำลังฟัง... พูดได้เลย", "🎤 Listening... speak now"],
  cont_on: ["⏹ หยุดคุยต่อเนื่อง", "⏹ Stop continuous chat"],
  cont_off: ["▶ คุยต่อเนื่อง", "▶ Continuous chat"],
  read_all: ["▶ อ่านสคริปต์ทั้งหมด", "▶ Read all scripts"],
  stop_read: ["⏹ หยุดอ่าน", "⏹ Stop reading"],
  speak_btn: ["🔊 พูด", "🔊 Speak"],
  not_found: ["ค้นไม่สำเร็จ ลองคำว่า กระเป๋า / ไม้ / ผ้า", "Search failed, try: bag / wood / cloth"],
  fill_all: ["กรอกให้ครบ", "Please fill in all fields"],
  cart_empty2: ["ตะกร้าว่าง", "Cart is empty"],
} as const;

export type TKey = keyof typeof DICT;

export function getLang(): Lang {
  if (typeof window === "undefined") return "th";
  try { return localStorage.getItem(KEY) === "en" ? "en" : "th"; }
  catch { return "th"; }
}

export function setLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
    window.dispatchEvent(new Event("lang-changed"));
  } catch {}
}

export function t(key: TKey, lang?: Lang): string {
  const l = lang ?? getLang();
  return DICT[key][l === "en" ? 1 : 0];
}

export function useLang() {
  const [lang, setL] = useState<Lang>("th");
  useEffect(() => {
    setL(getLang());
    const on = () => setL(getLang());
    window.addEventListener("lang-changed", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("lang-changed", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return { lang, setLang: (l: Lang) => { setLang(l); setL(l); }, t: (k: TKey) => t(k, lang) };
}

// ไม่มีอักษรไทยเลย + มีอังกฤษ = ถือว่าเป็นภาษาอังกฤษ
export function isEnglish(q: string): boolean {
  return !/[ก-ฮ]/.test(q) && /[a-zA-Z]/.test(q);
}
