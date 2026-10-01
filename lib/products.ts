export type Product = {
  id: string;
  name_th: string;
  category: string;
  price: number;
  stock: number;
  material: string;
  story: string;
  color: string;
  emoji: string;
  image?: string;
};

export const DEFAULT_CATEGORIES = ["งานไม้", "ผ้าทอ", "จักสาน", "ของที่ระลึก"];

export function loadCategories(): string[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem("custom-categories");
    const custom = raw ? JSON.parse(raw) : [];
    const list = [...DEFAULT_CATEGORIES, ...(Array.isArray(custom) ? custom : [])];
    return list.filter((v, i) => list.indexOf(v) === i);
  } catch { return DEFAULT_CATEGORIES; }
}

export function addCategory(name: string) {
  const n = name.trim();
  if (!n) return;
  try {
    const raw = localStorage.getItem("custom-categories");
    const custom = raw ? JSON.parse(raw) : [];
    if (![...DEFAULT_CATEGORIES, ...custom].includes(n)) {
      localStorage.setItem("custom-categories", JSON.stringify([...custom, n]));
      window.dispatchEvent(new Event("categories-changed"));
    }
  } catch {}
}

export function removeCategory(name: string) {
  if (DEFAULT_CATEGORIES.includes(name)) return; // หมวดหลักลบไม่ได้
  try {
    const raw = localStorage.getItem("custom-categories");
    const custom = raw ? JSON.parse(raw) : [];
    localStorage.setItem("custom-categories", JSON.stringify(custom.filter((c: string) => c !== name)));
    window.dispatchEvent(new Event("categories-changed"));
  } catch {}
}

export function loadCustomProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem("custom-products") || "[]");
  } catch { return []; }
}

function loadHidden(): string[] {
  try { return JSON.parse(localStorage.getItem("hidden-products") || "[]"); }
  catch { return []; }
}

function loadStockMap(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem("stock-map") || "{}"); }
  catch { return {}; }
}

export type ProductOverride = { name_th?: string; price?: number; category?: string; image?: string; material?: string; story?: string };

function loadOverrides(): Record<string, ProductOverride> {
  try { return JSON.parse(localStorage.getItem("product-overrides") || "{}"); }
  catch { return {}; }
}

export function saveOverride(id: string, o: ProductOverride) {
  try {
    const m = loadOverrides();
    m[id] = { ...(m[id] || {}), ...o };
    localStorage.setItem("product-overrides", JSON.stringify(m));
    window.dispatchEvent(new Event("products-changed"));
  } catch {}
}

export function getStock(p: Product): number {
  if (typeof window === "undefined") return p.stock;
  const m = loadStockMap();
  return m[p.id] ?? p.stock;
}

export function setStock(id: string, stock: number) {
  try {
    const m = loadStockMap();
    m[id] = Math.max(0, stock);
    localStorage.setItem("stock-map", JSON.stringify(m));
    window.dispatchEvent(new Event("stock-changed"));
  } catch {}
}

// ตัดสต็อกตอนสั่งสำเร็จ คืน false ถ้าของไม่พอ
export function decrementStock(id: string, qty: number): boolean {
  const p = findProduct(id);
  if (!p) return false;
  const left = getStock(p) - qty;
  if (left < 0) return false;
  setStock(id, left);
  return true;
}

export function allProducts(): Product[] {
  if (typeof window === "undefined") return MOCK_PRODUCTS;
  const hidden = new Set(loadHidden());
  const m = loadStockMap();
  const ov = loadOverrides();
  const apply = (p: Product) => ({ ...p, ...(ov[p.id] || {}), stock: m[p.id] ?? p.stock });
  return [...loadCustomProducts(), ...MOCK_PRODUCTS].filter((p) => !hidden.has(p.id)).map(apply);
}

export function findProduct(id: string): Product | undefined {
  return allProducts().find((p) => p.id === id);
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "P01",
    name_th: "กระเป๋าผ้าย้อมคราม",
    category: "ผ้าทอ",
    price: 350,
    stock: 20,
    material: "ผ้าฝ้ายย้อมคราม",
    story: "ทอและย้อมโดยผู้ต้องขังเรือนจำพะเยา ใช้เวลา 3 วันต่อใบ ลายไม่ซ้ำกัน",
    color: "#1e3a5f",
    emoji: "👜",
  },
  {
    id: "P02",
    name_th: "โคมไม้ไผ่สาน",
    category: "จักสาน",
    price: 499,
    stock: 12,
    material: "ไม้ไผ่ท้องถิ่นพะเยา",
    story: "สานมือทีละเส้น ใช้เวลาทำ 5 วัน แสงอบอุ่นเหมาะกับบ้านไม้",
    color: "#8B5A2B",
    emoji: "🏮",
  },
  {
    id: "P03",
    name_th: "ผ้าพันคอทอมือ",
    category: "ผ้าทอ",
    price: 290,
    stock: 30,
    material: "ฝ้ายผสมไหม",
    story: "ทอมือลายน้ำไหลกว๊านพะเยา ผืนนุ่ม ทำ 2 วันต่อผืน",
    color: "#7A1C1C",
    emoji: "🧣",
  },
  {
    id: "P04",
    name_th: "ชุดไม้แกะสลัก",
    category: "งานไม้",
    price: 550,
    stock: 8,
    material: "ไม้สัก",
    story: "แกะสลักลายช้างศึกโดยช่างฝึกอาชีพ ใช้เวลา 7 วันต่อชุด",
    color: "#5C3A21",
    emoji: "🐘",
  },
  {
    id: "P05",
    name_th: "พวงกุญแจผ้าทอ",
    category: "ของที่ระลึก",
    price: 99,
    stock: 100,
    material: "เศษผ้าทอ",
    story: "ของที่ระลึกชิ้นเล็ก ลดขยะผ้า ทำโดยกลุ่มวัฒนธรรมท้องถิ่น",
    color: "#B8860B",
    emoji: "🔑",
  },
];

const SYNONYMS: Record<string, string[]> = {
  "กระเป๋า": ["กระเปา", "bag", "ถุง", "เป้"],
  "ผ้า": ["ผืน", "cloth", "fabric", "ทอ"],
  "ไม้": ["wood", "เฟอร์นิเจอร์", "แกะสลัก", "ช้าง"],
  "โคม": ["ไฟ", "ตะเกียง", "lamp", "แสง"],
  "ของฝาก": ["ของที่ระลึก", "souvenir", "พวงกุญแจ", "ที่ระลึก"],
  "ถูก": ["ไม่เกิน", "ราคา", "บาท", "กี่บาท", "ถูกๆ"],
};

// คืน {hits, exact} - ไม่เจอตรงให้เดาใกล้เคียงมาแทน (ตามหมวดที่เดาได้ ไม่งั้น 3 ชิ้นแรก)
export function searchProducts(q: string, maxPrice?: number): { hits: Product[]; exact: boolean } {
  const kw = q.toLowerCase();
  const m = q.match(/(\d{2,5})/);
  const priceLimit = maxPrice ?? (m ? parseInt(m[1], 10) : undefined);
  // ขยายคำพ้อง
  let expanded = kw;
  Object.entries(SYNONYMS).forEach(([main, alts]) => {
    if (alts.some((a) => kw.includes(a))) expanded += " " + main;
  });
  const words = expanded.split(/\s+/).filter((w) => w.length > 1);
  const scored = MOCK_PRODUCTS.map((p) => {
    const hay = `${p.name_th} ${p.category} ${p.material} ${p.story}`.toLowerCase();
    let score = 0;
    words.forEach((w) => { if (hay.includes(w)) score += w.length >= 3 ? 2 : 1; });
    if (kw.includes("ไม้") && hay.includes("ไม้")) score += 2;
    if (kw.includes("ผ้า") && hay.includes("ผ้า")) score += 2;
    if (kw.includes("กระเป๋") && hay.includes("กระเป๋")) score += 2;
    return { p, score };
  }).filter((s) => s.score > 0 && (priceLimit === undefined || s.p.price <= priceLimit))
    .sort((a, b) => b.score - a.score);
  if (scored.length) return { hits: scored.map((s) => s.p), exact: true };
  // เดาใกล้เคียง: เจอชื่อหมวดในคำถามเอาหมวดนั้น ไม่งั้น 3 ชิ้นแรก
  const catHit = MOCK_PRODUCTS.find((p) => kw.includes(p.category));
  const sugg = (catHit ? MOCK_PRODUCTS.filter((p) => p.category === catHit.category) : MOCK_PRODUCTS.slice(0, 3))
    .filter((p) => priceLimit === undefined || p.price <= priceLimit);
  return { hits: sugg, exact: false };
}
