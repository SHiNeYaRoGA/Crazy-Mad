"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, decrementStock, findProduct, getStock, type Product } from "@/lib/products";
import { saveOrder } from "@/lib/orders";

export default function CartPage() {
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
    if (!name || !phone || !addr) { alert("กรอกให้ครบ"); return; }
    if (cart.length === 0) { alert("ตะกร้าว่าง"); return; }
    // กันขายเกินสต็อก
    for (const i of cart) {
      const p = find(i.id);
      if (!p || getStock(p) < i.qty) { alert(`"${p?.name_th || i.id}" เหลือ ${p ? getStock(p) : 0} ชิ้น`); return; }
    }
    const id = "PH" + Math.floor(1000 + Math.random() * 9000);
    saveOrder({
      id, name, phone, address: addr,
      items: cart.map((i) => ({ id: i.id, name: find(i.id)?.name_th || i.id, price: find(i.id)?.price || 0, qty: i.qty })),
      total, date: new Date().toLocaleString("th-TH"),
    });
    cart.forEach((i) => decrementStock(i.id, i.qty));
    setAll(allProducts());
    setOrderId(id);
    save([]);
  };

  if (orderId) return <div className="card"><h2 style={{ color: "#7a1c1c" }}>สั่งซื้อสำเร็จ เลข {orderId}</h2><p>จำลอง ไม่ตัดเงินจริง ดูออเดอร์ได้ที่ Admin แท็บออเดอร์</p></div>;

  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>ตะกร้า + ชำระเงินจำลอง</h2>
      <div className="card">
        {cart.length === 0 && <div>ตะกร้าว่าง</div>}
        {cart.map((i) => {
          const p = find(i.id);
          if (!p) return null;
          return (
            <div key={i.id} className="jobitem">
              <span>{p.image ? <img src={p.image} alt="" style={{ width: 32, height: 24, objectFit: "cover" }} /> : p.emoji} {p.name_th} ฿{p.price} x {i.qty}</span>
              <span style={{ flex: 1 }} />
              <button onClick={() => save(cart.map((c) => c.id === i.id ? { ...c, qty: c.qty + 1 } : c))}>+</button>
              <button onClick={() => save(cart.map((c) => c.id === i.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))}>-</button>
              <button onClick={() => save(cart.filter((c) => c.id !== i.id))}>ลบ</button>
            </div>
          );
        })}
        <h3>รวม ฿{total}</h3>
      </div>
      <div className="card">
        <h3>ที่อยู่จัดส่ง</h3>
        <input placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <input placeholder="เบอร์" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ display: "block", width: "100%", padding: 8, marginBottom: 8 }} />
        <textarea placeholder="ที่อยู่" value={addr} onChange={(e) => setAddr(e.target.value)} rows={3} style={{ width: "100%", padding: 8 }} />
        <div style={{ marginTop: 8 }}><button className="btn" onClick={checkout}>สั่งซื้อจำลอง</button></div>
      </div>
    </div>
  );
}
