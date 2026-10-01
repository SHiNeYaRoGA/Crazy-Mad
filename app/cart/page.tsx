"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, decrementStock, findProduct, getStock, type Product } from "@/lib/products";
import { saveOrder } from "@/lib/orders";
import { useLang } from "@/lib/i18n";
import { pname } from "@/components/ProductCard";

export default function CartPage() {
  const { lang, t } = useLang();
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [all, setAll] = useState<Product[]>(MOCK_PRODUCTS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setAll(allProducts());
  }, []);

  const save = (c: typeof cart) => {
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
    window.dispatchEvent(new Event("cart-changed"));
  };

  const find = (id: string) => all.find((p) => p.id === id);
  const total = cart.reduce((s, i) => s + (find(i.id)?.price || 0) * i.qty, 0);

  const checkout = () => {
    if (!name || !phone || !addr) { alert(t("fill_all")); return; }
    if (cart.length === 0) { alert(t("cart_empty2")); return; }
    // กันขายเกินสต็อก
    for (const i of cart) {
      const p = find(i.id);
      if (!p || getStock(p) < i.qty) { alert(`"${p ? pname(p, lang) : i.id}" ${t("stock_left")} ${p ? getStock(p) : 0}`); return; }
    }
    const id = "PH" + Math.floor(1000 + Math.random() * 9000);
    saveOrder({
      id, name, phone, address: addr,
      items: cart.map((i) => ({ id: i.id, name: find(i.id)?.name_th || i.id, price: find(i.id)?.price || 0, qty: i.qty })),
      total, date: new Date().toLocaleString(lang === "en" ? "en-US" : "th-TH"),
    });
    cart.forEach((i) => decrementStock(i.id, i.qty));
    setAll(allProducts());
    setOrderId(id);
    save([]);
  };

  if (orderId) return <div className="card"><h2 style={{ color: "#7a1c1c" }}>{t("order_ok")}{orderId}</h2><p>{t("order_thanks")}</p></div>;

  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{t("cart_title")}</h2>
      <div className="card">
        {cart.length === 0 && <div>{t("cart_empty")}</div>}
        {cart.map((i) => {
          const p = find(i.id);
          if (!p) return null;
          return (
            <div key={i.id} className="jobitem">
              <span>{p.image ? <img src={p.image} alt="" style={{ width: 32, height: 24, objectFit: "cover" }} /> : p.emoji} {pname(p, lang)} ฿{p.price} x {i.qty}</span>
              <span style={{ flex: 1 }} />
              <button onClick={() => save(cart.map((c) => c.id === i.id ? { ...c, qty: c.qty + 1 } : c))}>+</button>
              <button onClick={() => save(cart.map((c) => c.id === i.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}>-</button>
              <button onClick={() => save(cart.filter((c) => c.id !== i.id))}>ลบ</button>
            </div>
          );
        })}
        <h3>{t("total")} ฿{total}</h3>
      </div>
      <div className="card">
        <h3>{t("ship_title")}</h3>
        <input placeholder={t("ph_name")} value={name} onChange={(e) => setName(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <input placeholder={t("ph_phone")} value={phone} onChange={(e) => setPhone(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <textarea placeholder={t("ph_addr")} value={addr} onChange={(e) => setAddr(e.target.value)} rows={3} style={{ width: "100%", padding: 8 }} />
        <div style={{ marginTop: 8 }}><button className="btn" onClick={checkout}>{t("order_btn")}</button></div>
      </div>
    </div>
  );
}
