"use client";
import { useEffect, useState } from "react";

export type PageKey = "home" | "shop" | "training" | "about" | "contact";

export type PageContent = { title: string; body: string; title_en?: string; body_en?: string };

export const DEFAULT_PAGES: Record<PageKey, PageContent> = {
  home: { title: "งานมือผู้ต้องขัง สู่ของขวัญพะเยา", body: "ตลาดงานคราฟต์ ที่แค่พูดก็ซื้อได้ - AI พิมพ์/พูดค้นสินค้าจริง + เพลงพื้นหลัง", title_en: "Inmate Handicrafts, Gifts from Phayao", body_en: "A craft market you can shop by voice - AI finds real products + background music" },
  shop: { title: "Shop - สินค้าทั้งหมด", body: "", title_en: "Shop - All products", body_en: "" },
  training: { title: "งานฝึกวิชาชีพ", body: "หน้ารอใส่ข้อมูล - หลักสูตรฝึกอาชีพผู้ต้องขัง (งานไม้ ผ้าทอ จักสาน)", title_en: "Vocational Training", body_en: "Pending info - inmate vocational programs (woodwork, weaving, basketry)" },
  about: { title: "เกี่ยวกับเรา", body: "หน้ารอใส่ข้อมูล - เรือนจำจังหวัดพะเยา กรมราชทัณฑ์", title_en: "About Us", body_en: "Pending info - Phayao Provincial Prison, Dept. of Corrections" },
  contact: { title: "ติดต่อ", body: "หน้ารอใส่ข้อมูล - เบอร์ ที่อยู่ แผนที่", title_en: "Contact", body_en: "Pending info - phone, address, map" },
};

export function ptitle(c: PageContent, lang: "th" | "en"): string {
  return lang === "en" ? (c.title_en || c.title) : c.title;
}

export function pbody(c: PageContent, lang: "th" | "en"): string {
  return lang === "en" ? (c.body_en || c.body) : c.body;
}

function keyOf(page: PageKey) {
  return `content-${page}`;
}

// ย้ายค่าจากก้อนเดี่ยวเดิม (site-content) มาแยกหน้า ครั้งเดียว
function migrateOnce() {
  try {
    if (localStorage.getItem("content-migrated") === "1") return;
    const raw = localStorage.getItem("site-content");
    if (raw) {
      const old = JSON.parse(raw);
      const map: Record<string, PageKey> = { home_title: "home", shop_title: "shop", training_title: "training", about_title: "about", contact_title: "contact" };
      const bodyMap: Record<string, PageKey> = { home_desc: "home", training_body: "training", about_body: "about", contact_body: "contact" };
      Object.entries(map).forEach(([oldKey, page]) => {
        if (old[oldKey]) {
          const cur = loadPage(page);
          savePage(page, { ...cur, title: String(old[oldKey]) });
        }
      });
      Object.entries(bodyMap).forEach(([oldKey, page]) => {
        if (old[oldKey]) {
          const cur = loadPage(page);
          savePage(page, { ...cur, body: String(old[oldKey]) });
        }
      });
    }
    localStorage.setItem("content-migrated", "1");
  } catch {}
}

export function loadPage(page: PageKey): PageContent {
  if (typeof window === "undefined") return DEFAULT_PAGES[page];
  try {
    const raw = localStorage.getItem(keyOf(page));
    if (!raw) return DEFAULT_PAGES[page];
    return { ...DEFAULT_PAGES[page], ...JSON.parse(raw) };
  } catch { return DEFAULT_PAGES[page]; }
}

export function savePage(page: PageKey, c: PageContent) {
  try {
    localStorage.setItem(keyOf(page), JSON.stringify(c));
    window.dispatchEvent(new Event(`content-changed-${page}`));
    window.dispatchEvent(new Event("content-changed"));
  } catch {}
}

export function usePage(page: PageKey) {
  const [c, setC] = useState<PageContent>(DEFAULT_PAGES[page]);
  useEffect(() => {
    migrateOnce();
    setC(loadPage(page));
    const on = () => setC(loadPage(page));
    window.addEventListener(`content-changed-${page}`, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(`content-changed-${page}`, on);
      window.removeEventListener("storage", on);
    };
  }, [page]);
  return c;
}

// ---- backward compat: API เดิมยังใช้ได้ ----
export type SiteContent = {
  home_title: string; home_desc: string; shop_title: string;
  training_title: string; training_body: string;
  about_title: string; about_body: string;
  contact_title: string; contact_body: string;
};
export const DEFAULT_CONTENT: SiteContent = {
  home_title: DEFAULT_PAGES.home.title, home_desc: DEFAULT_PAGES.home.body,
  shop_title: DEFAULT_PAGES.shop.title,
  training_title: DEFAULT_PAGES.training.title, training_body: DEFAULT_PAGES.training.body,
  about_title: DEFAULT_PAGES.about.title, about_body: DEFAULT_PAGES.about.body,
  contact_title: DEFAULT_PAGES.contact.title, contact_body: DEFAULT_PAGES.contact.body,
};
export function loadContent(): SiteContent { return DEFAULT_CONTENT; }
export function saveContent() {}
export function useSiteContent() {
  const home = usePage("home");
  const shop = usePage("shop");
  const training = usePage("training");
  const about = usePage("about");
  const contact = usePage("contact");
  return {
    home_title: home.title, home_desc: home.body, shop_title: shop.title,
    training_title: training.title, training_body: training.body,
    about_title: about.title, about_body: about.body,
    contact_title: contact.title, contact_body: contact.body,
  };
}
