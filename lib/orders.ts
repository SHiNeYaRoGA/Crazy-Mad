export type OrderItem = { id: string; name: string; price: number; qty: number };
export type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  date: string;
};

const KEY = "orders";

export function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveOrder(o: Order) {
  try {
    const all = [o, ...loadOrders()];
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("orders-changed"));
  } catch {}
}

export function deleteOrder(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadOrders().filter((o) => o.id !== id)));
    window.dispatchEvent(new Event("orders-changed"));
  } catch {}
}
