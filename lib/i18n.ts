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
  adm_title: ["Admin - แก้ได้ทุกหน้า", "Admin - Edit everything"],
  adm_login_title: ["Admin - เรือนจำพะเยา", "Admin - Phayao Prison"],
  adm_pw_ph: ["รหัสผ่าน (phayao123)", "Password (phayao123)"],
  adm_enter: ["เข้า", "Enter"],
  adm_wrong: ["รหัสผิด", "Wrong password"],
  adm_db_on: ["DB กลาง: ต่อแล้ว", "Cloud DB: connected"],
  adm_db_off: ["DB กลาง: ยังไม่ต่อ (ใช้ในเครื่อง)", "Cloud DB: offline (this device only)"],
  adm_pull: ["ดึงข้อมูลกลาง", "Pull cloud data"],
  adm_pulled: ["ดึงข้อมูลกลางแล้ว", "Cloud data pulled"],
  adm_pull_fail: ["ดึงไม่สำเร็จ", "Pull failed"],
  tab_products: ["สินค้า", "Products"],
  tab_pages: ["เนื้อหาแยกหน้า", "Page contents"],
  tab_orders: ["ออเดอร์", "Orders"],
  tab_ai: ["ตั้งค่า AI + สคริปต์", "AI settings + Scripts"],
  cat_title: ["หมวดหมู่สินค้า", "Product categories"],
  cat_new_ph: ["ชื่อหมวดใหม่", "New category name"],
  cat_add: ["เพิ่มหมวด", "Add category"],
  prod_new_ph: ["ชื่อสินค้าใหม่", "New product name"],
  prod_add: ["เพิ่มสินค้า", "Add product"],
  img_link_ph: ["วางลิงก์รูป https://...", "Paste image link https://..."],
  img_choose: ["📷 เลือกรูป", "📷 Choose image"],
  edit: ["แก้", "Edit"],
  del: ["ลบ", "Delete"],
  cancel: ["ยกเลิก", "Cancel"],
  save_shop: ["บันทึก (ขึ้น Shop ทันที)", "Save (live on Shop)"],
  price: ["ราคา", "Price"],
  category: ["หมวด", "Category"],
  stock: ["สต็อก", "Stock"],
  left: ["คงเหลือ", "Left"],
  no_orders: ["ยังไม่มีออเดอร์ สั่งจากหน้า Cart ก่อน", "No orders yet. Order from Cart first"],
  ai_voice_title: ["ตั้งค่าเสียง (มีผลกับ Popup ฝั่งลูกค้าทันที)", "Voice settings (applies to customer popup instantly)"],
  voice: ["เสียง", "Voice"],
  v_female: ["เสียงหญิง", "Female"],
  v_male: ["เสียงชาย", "Male"],
  v_vv: ["VOICEVOX เด็กญี่ปุ่น", "VOICEVOX child (Japanese)"],
  speak_lang: ["ภาษาพูด", "Spoken language"],
  speak_th: ["พูดไทย", "Thai"],
  speak_kara: ["พูดคาราโอเกะ", "Karaoke"],
  speed: ["ความเร็ว", "Speed"],
  character: ["ตัวละคร", "Character"],
  save_ai: ["บันทึกตั้งค่า AI", "Save AI settings"],
  saved_ai: ["บันทึกตั้งค่า AI แล้ว", "AI settings saved"],
  ai_pages_title: ["หน้าที่ AI เปิดให้ได้ (ไม่มี Admin เสมอ)", "Pages AI may open (never Admin)"],
  intent_title: ["คำสั่งเปิดหน้า (พิมพ์ตรงคำไหน AI พาไปหน้านั้น)", "Open-page commands (matching text navigates there)"],
  intent_ph: ["คำคั่นด้วยจุลภาค เช่น ติดต่อ, แผนที่", "Comma-separated words, e.g. contact, map"],
  save_intent: ["บันทึกคำสั่งเปิดหน้า", "Save open-page commands"],
  saved_intent: ["บันทึกคำสั่งเปิดหน้าแล้ว", "Open-page commands saved"],
  guard_title: ["ตอนขอเกี่ยวกับ Admin - ปรับคำสั่ง + คำปฏิเสธได้", "Admin requests - edit triggers + refusal"],
  guard_desc: ["พิมพ์ตรงคำไหนถือว่าขอเข้า Admin แล้ว AI จะปฏิเสธตามข้อความข้างล่าง ไม่พาไป", "Matching text counts as an Admin request; AI refuses below and never navigates"],
  guard_words: ["คำที่ถือว่าขอ Admin (คั่นด้วยจุลภาค)", "Words treated as Admin requests (comma-separated)"],
  guard_text: ["ข้อความปฏิเสธที่แสดง", "Refusal text shown"],
  guard_speak: ["สคริปต์ปฏิเสธที่อ่าน", "Refusal script spoken"],
  save_guard: ["บันทึกการปฏิเสธ Admin", "Save Admin refusal"],
  saved_guard: ["บันทึกการปฏิเสธ Admin แล้ว", "Admin refusal saved"],
  mel_title: ["Meluna May Melon - persona (เรียก meluna / melon / may)", "Meluna May Melon persona (call meluna / melon / may)"],
  mel_desc: ["โหมดปกติพูดสั้นสไตล์เมสุกาคิ เจอ keyword สคริปต์เมื่อไหร่ทิ้ง persona ตอบตามสคริปต์ตรงๆ ขอรูปเมื่อไหร่สุ่มจากคลังให้", "Normal mode speaks short Mesugaki style; script keywords switch to exact replies; image requests pick randomly from the library"],
  mel_on: ["เปิด persona Meluna", "Enable Meluna persona"],
  mel_wake: ["คำเรียกชื่อ (คั่นด้วยจุลภาค)", "Wake words (comma-separated)"],
  mel_img: ["คำขอรูป (คั่นด้วยจุลภาค)", "Image request words (comma-separated)"],
  save_mel: ["บันทึก Meluna", "Save Meluna"],
  saved_mel: ["บันทึก Meluna แล้ว", "Meluna saved"],
  lib_title: ["คลังรูป - ให้ AI หยิบส่ง", "Image library - for AI to send"],
  lib_desc: ["อัปโหลดครั้งเดียวเก็บกลาง รูปถูกย่อเหลือกว้างสุด 800px กันเมมเต็ม แล้วเลือกใช้ในสคริปต์ข้อไหนก็ได้", "Upload once, stored centrally. Shrunk to 800px wide. Then pick per script item"],
  lib_add_link: ["เพิ่มจากลิงก์", "Add from link"],
  lib_upload: ["📷 อัปโหลด", "📷 Upload"],
  lib_empty: ["ยังไม่มีรูป อัปโหลดหรือวางลิงก์ก่อน", "No images yet, upload or paste a link first"],
  lib_link_ph: ["วางลิงก์รูป https://...", "Paste image link https://..."],
  script_title: ["สคริปต์ตอบ", "Reply scripts"],
  script_note: ["โชว์กับพูดแยกกันได้", "display and speech are separate"],
  script_desc: ["ลูกค้าพิมพ์ตรง keyword ข้อไหน โชว์ช่อง ข้อความที่แสดง แล้วพูดช่อง สคริปต์ที่อ่าน", "Matching keyword shows Display text and speaks Speak script"],
  sk_ph: ["keyword เช่น กระเป๋า (คั่น | ได้หลายคำ)", "keyword e.g. bag (use | for alternatives)"],
  sa_ph: ["ข้อความที่แสดง", "Display text"],
  ss_ph: ["สคริปต์ที่อ่าน (ว่าง = ใช้ข้อความที่แสดง)", "Speak script (empty = use display text)"],
  svv_ph: ["สคริปต์ VOICEVOX (katakana ざーこ♡)", "VOICEVOX script (katakana)"],
  simg_ph: ["ลิงก์รูป https://... (ให้ AI ส่ง)", "Image link https://... (AI sends it)"],
  simg_file: ["📷 รูป", "📷 Image"],
  lib_pick: ["จากคลัง", "From library"],
  pick_none: ["-- เลือก --", "-- Select --"],
  goto_none: ["ไม่พาไปไหน", "Don't navigate"],
  goto_label: ["พาไปหน้า", "Navigate to"],
  add_item: ["เพิ่มข้อ", "Add item"],
  make_audio: ["สร้างเสียง", "Generate voice"],
  audio_fail: ["สร้างไม่สำเร็จ", "Generation failed"],
  audio_need_engine: ["สร้างไม่สำเร็จ - เปิด VOICEVOX ก่อน", "Failed - start VOICEVOX first"],
  read_err: ["อ่านรูปไม่ได้", "Cannot read image"],
  item_no: ["ข้อ", "Item"],
  f_keyword: ["คำเรียก:", "Trigger:"],
  f_show: ["ข้อความที่แสดง:", "Display:"],
  f_speak: ["สคริปต์ที่อ่าน:", "Speak:"],
  f_vv: ["VOICEVOX:", "VOICEVOX:"],
  f_goto: ["พาไปหน้า:", "Navigate:"],
  f_audio: ["ไฟล์เสียง:", "Audio file:"],
  f_audio_ready: ["มีแล้ว", "ready"],
  f_dash: ["-", "-"],
  nf_title: ["ตอนหาไม่เจอ - ปรับข้อความกับสคริปต์ได้", "Not-found case - editable text + script"],
  nf_save: ["บันทึกตอนหาไม่เจอ", "Save not-found"],
  nf_make: ["สร้างเสียงตอนหาไม่เจอ", "Generate not-found voice"],
  nf_made: ["สร้างเสียงตอนหาไม่เจอแล้ว", "Not-found voice generated"],
  nf_has: ["🔊 มีไฟล์เสียงแล้ว:", "🔊 Audio file ready:"],
  pages_note: ["แก้ทีละหน้า เก็บแยกกัน ไม่กระทบหน้าอื่น", "Edit per page, stored separately, others unaffected"],
  pages_title_label: ["หัวข้อ", "Title"],
  pages_body: ["เนื้อหา", "Body"],
  save_page: ["บันทึกหน้านี้", "Save this page"],
  reset_page: ["รีเซ็ตหน้านี้", "Reset this page"],
  reset_done: ["รีเซ็ตหน้านี้แล้ว", "This page was reset"],
  saved_generic: ["บันทึกแล้ว", "Saved"],
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
