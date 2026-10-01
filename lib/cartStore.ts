import { findProduct, getStock } from "./products";

export function addToCart(id: string, qty = 1) {
  try {
    const p = findProduct(id);
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    const cur = c.find((x: any) => x.id === id)?.qty || 0;
    if (p && cur + qty > getStock(p)) {
      alert(`สต็อกเหลือ ${getStock(p)} ชิ้น`);
      return;
    }
    const i = c.findIndex((x: any) => x.id === id);
    if (i >= 0) c[i].qty += qty;
    else c.push({ id, qty });
    localStorage.setItem("cart", JSON.stringify(c));
    window.dispatchEvent(new Event("cart-changed"));
  } catch {}
}
