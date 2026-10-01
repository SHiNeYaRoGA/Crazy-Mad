"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// keys ที่ sync ขึ้นกลาง (ไม่รวม cart / เพลง / โน้ตส่วนตัว)
export const SYNC_KEYS = [
  "custom-products", "hidden-products", "stock-map", "product-overrides", "custom-categories",
  "site-content", "content-migrated",
  "content-home", "content-shop", "content-training", "content-about", "content-contact",
  "orders", "ai-settings", "ai-script", "ai-notfound",
  "ai-intents", "ai-pages-allowed", "ai-admin-guard",
  "meluna-settings", "image-library",
];

let client: SupabaseClient | null | undefined;

export function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getDb(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!isDbConfigured()) { client = null; return client; }
  client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}

export async function pullNow(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const { data, error } = await db.from("kv").select("key,value").in("key", SYNC_KEYS);
    if (error) return false;
    (data || []).forEach((row: any) => {
      try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch {}
    });
    window.dispatchEvent(new Event("db-pulled"));
    window.dispatchEvent(new Event("storage"));
    ["orders-changed", "stock-changed", "content-changed", "ai-settings-changed", "ai-script-changed", "categories-changed", "image-library-changed", "ai-intents-changed", "ai-pages-changed", "ai-guard-changed", "meluna-changed", "cart-changed"].forEach((e) => {
      try { window.dispatchEvent(new Event(e)); } catch {}
    });
    return true;
  } catch { return false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
const pending = new Set<string>();

export function pushKey(key: string) {
  if (!SYNC_KEYS.includes(key)) return;
  if (!isDbConfigured()) return;
  pending.add(key);
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushPush, 1500);
}

async function flushPush() {
  const db = getDb();
  if (!db) { pending.clear(); return; }
  const keys = Array.from(pending);
  pending.clear();
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      await db.from("kv").upsert({ key, value: JSON.parse(raw) });
    } catch {}
  }
}
