import { findProduct, getStock } from "./products";
import { getLang } from "./i18n";

export function addToCart(id: string, qty = 1) {
  const en = getLang() === "en";
  try {
    const p = findProduct(id);
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    const cur = c.find((x: any) => x.id === id)?.qty || 0;
    if (p && cur + qty > getStock(p)) {
      alert(en ? `Only ${getStock(p)} left` : `สต็อกเหลือ ${getStock(p)} ชิ้น`);
      return;
    }
    const i = c.findIndex((x: any) => x.id === id);
    if (i >= 0) c[i].qty += qty;
    else c.push({ id, qty });
    localStorage.setItem("cart", JSON.stringify(c));
    window.dispatchEvent(new Event("cart-changed"));
  } catch {}
}
