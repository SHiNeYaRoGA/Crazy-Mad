"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, getStock, loadCategories, addCategory, removeCategory, loadCustomProducts, setStock, saveOverride, type Product } from "@/lib/products";
import { DEFAULT_PAGES, loadPage, savePage, type PageKey, type PageContent } from "@/lib/content";
import { loadOrders, deleteOrder, type Order } from "@/lib/orders";
import { DEFAULT_AI_SETTINGS, loadAISettings, saveAISettings, type AISettings } from "@/lib/aiSettings";
import { DEFAULT_NOTFOUND, loadNotFound, loadScript, saveNotFound, saveScript, AI_PAGES, DEFAULT_INTENTS, DEFAULT_ADMIN_WORDS, DEFAULT_ADMIN_REFUSE, loadAdminRefuse, loadAdminWords, loadAllowedPages, loadIntents, saveAdminGuard, saveAllowedPages, saveIntents, type ScriptItem } from "@/lib/script";
import { addLibraryImage, fileToDataUrl, loadLibrary, removeLibraryImage, type LibImage } from "@/lib/imageLibrary";
import { DEFAULT_MELUNA, loadMeluna, saveMeluna } from "@/lib/meluna";
import { isDbConfigured, pullNow } from "@/lib/db";

const PAGES: { key: PageKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "shop", label: "Shop" },
  { key: "training", label: "งานฝึกวิชาชีพ" },
  { key: "about", label: "เกี่ยวกับเรา" },
  { key: "contact", label: "ติดต่อ" },
];

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<"products" | "pages" | "orders" | "ai">("products");
  const [items, setItems] = useState<Product[]>(MOCK_PRODUCTS);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState(100);
  const [img, setImg] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");
  const [pickCat, setPickCat] = useState("ของที่ระลึก");
  const [editId, setEditId] = useState("");
  const [ef, setEf] = useState({ name: "", nameEn: "", price: 0, category: "", stock: 0, image: "" });
  const [pageKey, setPageKey] = useState<PageKey>("home");
  const [pageForm, setPageForm] = useState<PageContent>(DEFAULT_PAGES.home);
  const [orders, setOrders] = useState<Order[]>([]);
  const [saved, setSaved] = useState("");
  const [ai, setAi] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [vvList, setVvList] = useState<{ id: number; name: string }[]>([]);
  const [script, setScript] = useState<ScriptItem[]>([]);
  const [sk, setSk] = useState("");
  const [sa, setSa] = useState("");
  const [ss, setSs] = useState("");
  const [svv, setSvv] = useState("");
  const [simg, setSimg] = useState("");
  const [sgoto, setSgoto] = useState("");
  const [nfText, setNfText] = useState(DEFAULT_NOTFOUND.text);
  const [nfSpeak, setNfSpeak] = useState(DEFAULT_NOTFOUND.speak);
  const [nfAudio, setNfAudio] = useState("");
  const [allowed, setAllowed] = useState<string[]>(AI_PAGES.map((p) => p.path));
  const [intents, setIntents] = useState<{ page: string; words: string[] }[]>(DEFAULT_INTENTS);
  const [guardWords, setGuardWords] = useState(DEFAULT_ADMIN_WORDS.join(", "));
  const [guardText, setGuardText] = useState(DEFAULT_ADMIN_REFUSE.text);
  const [guardSpeak, setGuardSpeak] = useState(DEFAULT_ADMIN_REFUSE.speak);
  const [lib, setLib] = useState<LibImage[]>([]);
  const [libUrl, setLibUrl] = useState("");
  const [melOn, setMelOn] = useState(true);
  const [melWake, setMelWake] = useState(DEFAULT_MELUNA.wakeWords.join(", "));
  const [melImg, setMelImg] = useState(DEFAULT_MELUNA.imageWords.join(", "));

  useEffect(() => {
    setItems(allProducts());
    setCats(loadCategories());
    setPageForm(loadPage("home"));
    setAi(loadAISettings());
    setScript(loadScript());
    const nf = loadNotFound();
    setNfText(nf.text);
    setNfSpeak(nf.speak);
    setNfAudio(nf.audio || "");
    setAllowed(loadAllowedPages());
    setIntents(loadIntents());
    setGuardWords(loadAdminWords().join(", "));
    const gr = loadAdminRefuse();
    setGuardText(gr.text);
    setGuardSpeak(gr.speak);
    const reloadLib = () => setLib(loadLibrary());
    reloadLib();
    window.addEventListener("image-library-changed", reloadLib);
    const mel = loadMeluna();
    setMelOn(mel.enabled);
    setMelWake(mel.wakeWords.join(", "));
    setMelImg(mel.imageWords.join(", "));
    (async () => {
      try {
        const r = await fetch("/api/voicevox?action=speakers");
        const j = await r.json();
        if (Array.isArray(j)) {
          const flat: { id: number; name: string }[] = [];
          j.forEach((s: any) => (s.styles || []).forEach((st: any) => flat.push({ id: st.id, name: `${s.name}(${st.name})` })));
          setVvList(flat);
        }
      } catch {}
    })();
    const reloadOrders = () => setOrders(loadOrders());
    reloadOrders();
    window.addEventListener("orders-changed", reloadOrders);
    return () => window.removeEventListener("orders-changed", reloadOrders);
  }, []);

  useEffect(() => { setPageForm(loadPage(pageKey)); setSaved(""); }, [pageKey]);

  const persistCustom = (custom: Product[]) => {
    try { localStorage.setItem("custom-products", JSON.stringify(custom)); } catch {}
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImg(String(r.result));
    r.readAsDataURL(f);
  };

  const add = () => {
    if (!name) return;
    const custom = loadCustomProducts();
    const np: Product = { id: "C" + Date.now(), name_th: name, name_en: nameEn || undefined, category: pickCat, price, stock: 10, material: "-", story: "เพิ่มโดยแอดมิน", color: "#666", emoji: "📦", image: img || undefined };
    const next = [np, ...custom];
    persistCustom(next);
    setItems(allProducts());
    setName(""); setNameEn(""); setPrice(100); setImg("");
  };

  const remove = (id: string) => {
    const custom = loadCustomProducts().filter((x) => x.id !== id);
    const isMock = MOCK_PRODUCTS.some((x) => x.id === id);
    if (isMock) {
      try {
        const hidden = JSON.parse(localStorage.getItem("hidden-products") || "[]");
        localStorage.setItem("hidden-products", JSON.stringify([...hidden, id]));
      } catch {}
      setItems(allProducts());
    } else {
      persistCustom(custom);
      setItems(allProducts());
    }
  };

  if (!ok) return (
    <div className="card">
      <h2 style={{ color: "#7a1c1c" }}>Admin - เรือนจำพะเยา</h2>
      <input type="password" placeholder="รหัสผ่าน (phayao123)" value={pw} onChange={(e) => setPw(e.target.value)} style={{ padding: 8 }} />
      <button className="btn" style={{ marginLeft: 8 }} onClick={() => (pw === "phayao123" ? setOk(true) : alert("รหัสผิด"))}>เข้า</button>
    </div>
  );
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>Admin - แก้ได้ทุกหน้า</h2>
      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge">{isDbConfigured() ? "DB กลาง: ต่อแล้ว" : "DB กลาง: ยังไม่ต่อ (ใช้ในเครื่อง)"}</span>
        {isDbConfigured() && <button className="btn btn-secondary" onClick={async () => { const ok = await pullNow(); setSaved(ok ? "ดึงข้อมูลกลางแล้ว" : "ดึงไม่สำเร็จ"); setItems(allProducts()); }}>ดึงข้อมูลกลาง</button>}
        {saved && <span style={{ color: "#7a1c1c" }}>{saved}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={tab === "products" ? "btn" : "btn btn-secondary"} onClick={() => setTab("products")}>สินค้า ({items.length})</button>
        <button className={tab === "pages" ? "btn" : "btn btn-secondary"} onClick={() => setTab("pages")}>เนื้อหาแยกหน้า</button>
        <button className={tab === "orders" ? "btn" : "btn btn-secondary"} onClick={() => setTab("orders")}>ออเดอร์ ({orders.length})</button>
        <button className={tab === "ai" ? "btn" : "btn btn-secondary"} onClick={() => setTab("ai")}>ตั้งค่า AI + สคริปต์</button>
      </div>

      {tab === "products" && (
        <>
          <div className="card">
            <h3>หมวดหมู่สินค้า</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="ชื่อหมวดใหม่" value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => { addCategory(newCat); setCats(loadCategories()); setNewCat(""); }}>เพิ่มหมวด</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {cats.map((c) => (
                <span key={c} className="badge">{c}{!["งานไม้", "ผ้าทอ", "จักสาน", "ของที่ระลึก"].includes(c) && <button style={{ marginLeft: 4 }} onClick={() => { removeCategory(c); setCats(loadCategories()); }}>✕</button>}</span>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder="ชื่อสินค้าใหม่" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input placeholder="English name" value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} style={{ padding: 8, width: 120 }} />
              <select value={pickCat} onChange={(e) => setPickCat(e.target.value)} style={{ padding: 8 }}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="วางลิงก์รูป https://..." value={img.startsWith("data:") ? "" : img} onChange={(e) => setImg(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>📷 เลือกรูป<input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
              <button className="btn" onClick={add}>เพิ่มสินค้า</button>
            </div>
            {img && <img src={img} alt="preview" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, border: "1px solid #E3C878", borderRadius: 6 }} />}
          </div>
          {items.map((p) => (
            <div key={p.id}>
              <div className="jobitem">
                {p.image && <img src={p.image} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }} />}
                <span>{p.name_th} ฿{p.price} <span className="badge">{p.category}</span> <span style={{ fontSize: 12 }}>คงเหลือ {getStock(p)}</span></span>
                <span style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => { setEditId(p.id); setEf({ name: p.name_th, nameEn: p.name_en || "", price: p.price, category: p.category, stock: getStock(p), image: p.image || "" }); }}>แก้</button>
                <button onClick={() => remove(p.id)}>ลบ</button>
              </div>
              {editId === p.id && (
                <div className="card">
                  <b>แก้: {p.id}</b>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <input value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={{ padding: 8, flex: 1 }} placeholder="ชื่อ" />
                    <input value={ef.nameEn} onChange={(e) => setEf({ ...ef, nameEn: e.target.value })} style={{ padding: 8, flex: 1 }} placeholder="English name" />
                    <label>ราคา<input type="number" value={ef.price} onChange={(e) => setEf({ ...ef, price: parseInt(e.target.value) || 0 })} style={{ padding: 8, width: 110, marginLeft: 4 }} /></label>
                    <label>หมวด
                      <select value={ef.category} onChange={(e) => setEf({ ...ef, category: e.target.value })} style={{ padding: 8, marginLeft: 4 }}>
                        {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>สต็อก<input type="number" value={ef.stock} onChange={(e) => setEf({ ...ef, stock: parseInt(e.target.value) || 0 })} style={{ padding: 8, width: 80, marginLeft: 4 }} /></label>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input placeholder="ลิงก์รูป https://..." value={ef.image.startsWith("data:") ? "" : ef.image} onChange={(e) => setEf({ ...ef, image: e.target.value })} style={{ padding: 8, flex: 2 }} />
                    <label className="btn btn-secondary" style={{ cursor: "pointer" }}>📷<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setEf({ ...ef, image: String(r.result) }); r.readAsDataURL(f); }} /></label>
                  </div>
                  {ef.image && <img src={ef.image} alt="preview" style={{ width: 120, height: 90, objectFit: "cover", marginTop: 8, border: "1px solid #E3C878", borderRadius: 6 }} />}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn" onClick={() => {
                      const isMock = MOCK_PRODUCTS.some((x) => x.id === p.id);
                      if (isMock) {
                        saveOverride(p.id, { name_th: ef.name, name_en: ef.nameEn || undefined, price: ef.price, category: ef.category, image: ef.image || undefined });
                        setStock(p.id, ef.stock);
                      } else {
                        const custom = loadCustomProducts().map((x) => x.id === p.id ? { ...x, name_th: ef.name, name_en: ef.nameEn || undefined, price: ef.price, category: ef.category, stock: ef.stock, image: ef.image || undefined } : x);
                        try { localStorage.setItem("custom-products", JSON.stringify(custom)); window.dispatchEvent(new Event("products-changed")); } catch {}
                      }
                      setItems(allProducts());
                      setEditId("");
                    }}>บันทึก (ขึ้น Shop ทันที)</button>
                    <button className="btn btn-secondary" onClick={() => setEditId("")}>ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {tab === "pages" && (
        <div className="card">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {PAGES.map((p) => (
              <button key={p.key} className={pageKey === p.key ? "btn" : "btn btn-secondary"} onClick={() => setPageKey(p.key)}>{p.label}</button>
            ))}
          </div>
          <p>แก้ทีละหน้า เก็บแยกกัน (`content-{pageKey}`) ไม่กระทบหน้าอื่น</p>
          <label style={{ fontWeight: 700, color: "#7a1c1c" }}>หัวข้อ {PAGES.find((p) => p.key === pageKey)?.label}</label>
          <input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>เนื้อหา</label>
          <textarea value={pageForm.body} onChange={(e) => setPageForm({ ...pageForm, body: e.target.value })} rows={5} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={() => { savePage(pageKey, pageForm); setSaved(`บันทึกหน้า ${pageKey} แล้ว ${new Date().toLocaleTimeString()}`); }}>บันทึกหน้านี้</button>
            <button className="btn btn-secondary" onClick={() => { setPageForm(DEFAULT_PAGES[pageKey]); savePage(pageKey, DEFAULT_PAGES[pageKey]); setSaved("รีเซ็ตหน้านี้แล้ว"); }}>รีเซ็ตหน้านี้</button>
          </div>
          {saved && <div style={{ marginTop: 8, color: "#7a1c1c" }}>{saved}</div>}
        </div>
      )}

      {tab === "orders" && (
        <>
          {orders.length === 0 && <div className="card">ยังไม่มีออเดอร์ สั่งจากหน้า Cart ก่อน</div>}
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div style={{ display: "flex", gap: 8 }}>
                <b style={{ color: "#7a1c1c" }}>{o.id}</b><span>{o.date}</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => { deleteOrder(o.id); setOrders(loadOrders()); }}>ลบ</button>
              </div>
              <div>{o.name} | {o.phone} | {o.address}</div>
              {o.items.map((i) => <div key={i.id}>- {i.name} ฿{i.price} x {i.qty}</div>)}
              <b>รวม ฿{o.total}</b>
            </div>
          ))}
        </>
      )}

      {tab === "ai" && (
        <>
          <div className="card">
            <h3>ตั้งค่าเสียง (มีผลกับ Popup ฝั่งลูกค้าทันที)</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label>เสียง
                <select value={ai.voice} onChange={(e) => setAi({ ...ai, voice: e.target.value as any })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="female">เสียงหญิง</option>
                  <option value="male">เสียงชาย</option>
                  <option value="voicevox">VOICEVOX เด็กญี่ปุ่น</option>
                </select>
              </label>
              <label>ภาษาพูด
                <select value={ai.speakLang} onChange={(e) => setAi({ ...ai, speakLang: e.target.value as any })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="th">พูดไทย</option>
                  <option value="karaoke">พูดคาราโอเกะ</option>
                </select>
              </label>
              <label>ความเร็ว
                <select value={ai.rate} onChange={(e) => setAi({ ...ai, rate: parseFloat(e.target.value) })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value={0.8}>0.8x</option>
                  <option value={1}>1x</option>
                  <option value={1.2}>1.2x</option>
                </select>
              </label>
              {ai.voice === "voicevox" && vvList.length > 0 && (
                <label>ตัวละคร
                  <select value={ai.vvSpeaker} onChange={(e) => setAi({ ...ai, vvSpeaker: e.target.value })} style={{ marginLeft: 4, padding: 6 }}>
                    {vvList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              )}
            </div>
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveAISettings(ai); setSaved("บันทึกตั้งค่า AI แล้ว"); }}>บันทึกตั้งค่า AI</button></div>
            {saved && <div style={{ marginTop: 8, color: "#7a1c1c" }}>{saved}</div>}
          </div>
          <div className="card">
            <h3>หน้าที่ AI เปิดให้ได้ (ไม่มี Admin เสมอ)</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {AI_PAGES.map((p) => (
                <label key={p.path} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input type="checkbox" checked={allowed.includes(p.path)} onChange={(e) => {
                    const next = e.target.checked ? [...allowed, p.path] : allowed.filter((x) => x !== p.path);
                    setAllowed(next); saveAllowedPages(next);
                  }} /> {p.label}
                </label>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>คำสั่งเปิดหน้า (พิมพ์ตรงคำไหน AI พาไปหน้านั้น)</h3>
            {intents.map((it) => (
              <div key={it.page} style={{ marginBottom: 8 }}>
                <b>{AI_PAGES.find((p) => p.path === it.page)?.label || it.page}</b>
                <input value={it.words.join(", ")} onChange={(e) => setIntents(intents.map((x) => x.page === it.page ? { ...x, words: e.target.value.split(",").map((w) => w.trim()).filter(Boolean) } : x))} style={{ width: "100%", padding: 8, marginTop: 4 }} placeholder="คำคั่นด้วยจุลภาค เช่น ติดต่อ, แผนที่" />
              </div>
            ))}
            <button className="btn" onClick={() => { saveIntents(intents); setSaved("บันทึกคำสั่งเปิดหน้าแล้ว"); }}>บันทึกคำสั่งเปิดหน้า</button>
          </div>
          <div className="card">
            <h3>ตอนขอเกี่ยวกับ Admin - ปรับคำสั่ง + คำปฏิเสธได้</h3>
            <p>พิมพ์ตรงคำไหนถือว่าขอเข้า Admin แล้ว AI จะปฏิเสธตามข้อความข้างล่าง ไม่พาไป</p>
            <label style={{ fontWeight: 700, color: "#7a1c1c" }}>คำที่ถือว่าขอ Admin (คั่นด้วยจุลภาค)</label>
            <input value={guardWords} onChange={(e) => setGuardWords(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>ข้อความปฏิเสธที่แสดง</label>
            <input value={guardText} onChange={(e) => setGuardText(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>สคริปต์ปฏิเสธที่อ่าน</label>
            <textarea value={guardSpeak} onChange={(e) => setGuardSpeak(e.target.value)} rows={2} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveAdminGuard(guardWords.split(",").map((w) => w.trim()).filter(Boolean), guardText, guardSpeak); setSaved("บันทึกการปฏิเสธ Admin แล้ว"); }}>บันทึกการปฏิเสธ Admin</button></div>
          </div>
          <div className="card">
            <h3>Meluna May Melon - persona (เรียก meluna / melon / may)</h3>
            <p>โหมดปกติพูดสั้นสไตล์เมสุกาคิ เจอ keyword สคริปต์เมื่อไหร่ทิ้ง persona ตอบตามสคริปต์ตรงๆ ขอรูปเมื่อไหร่สุ่มจากคลังให้</p>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={melOn} onChange={(e) => setMelOn(e.target.checked)} /> เปิด persona Meluna
            </label>
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>คำเรียกชื่อ (คั่นด้วยจุลภาค)</label>
            <input value={melWake} onChange={(e) => setMelWake(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>คำขอรูป (คั่นด้วยจุลภาค)</label>
            <input value={melImg} onChange={(e) => setMelImg(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveMeluna({ enabled: melOn, wakeWords: melWake.split(",").map((w) => w.trim()).filter(Boolean), imageWords: melImg.split(",").map((w) => w.trim()).filter(Boolean) }); setSaved("บันทึก Meluna แล้ว"); }}>บันทึก Meluna</button></div>
          </div>
          <div className="card">
            <h3>คลังรูป - ให้ AI หยิบส่ง ({lib.length} รูป)</h3>
            <p>อัปโหลดครั้งเดียวเก็บกลาง รูปถูกย่อเหลือกว้างสุด 800px กันเมมเต็ม แล้วเลือกใช้ในสคริปต์ข้อไหนก็ได้</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="วางลิงก์รูป https://..." value={libUrl} onChange={(e) => setLibUrl(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <button className="btn btn-secondary" onClick={() => { if (!libUrl) return; setLib(addLibraryImage(libUrl.split("/").pop() || "link", libUrl)); setLibUrl(""); }}>เพิ่มจากลิงก์</button>
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>📷 อัปโหลด<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const { name, dataUrl } = await fileToDataUrl(f); setLib(addLibraryImage(name, dataUrl)); } catch { alert("อ่านรูปไม่ได้"); } }} /></label>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {lib.map((im) => (
                <div key={im.id} style={{ border: "1px solid #E3C878", borderRadius: 6, padding: 6, width: 140 }}>
                  <img src={im.dataUrl} alt={im.name} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4 }} />
                  <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{im.name}</div>
                  <button style={{ fontSize: 12 }} onClick={() => { removeLibraryImage(im.id); setLib(loadLibrary()); }}>ลบ</button>
                </div>
              ))}
              {lib.length === 0 && <span style={{ fontSize: 13 }}>ยังไม่มีรูป อัปโหลดหรือวางลิงก์ก่อน</span>}
            </div>
          </div>
          <div className="card">
            <h3>สคริปต์ตอบ ({script.length} ข้อ) - โชว์กับพูดแยกกันได้</h3>
            <p>ลูกค้าพิมพ์ตรง keyword ข้อไหน โชว์ช่อง <b>ข้อความที่แสดง</b> แล้วพูดช่อง <b>สคริปต์ที่อ่าน</b></p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder="keyword เช่น กระเป๋า (คั่น | ได้หลายคำ)" value={sk} onChange={(e) => setSk(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input placeholder="ข้อความที่แสดง" value={sa} onChange={(e) => setSa(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <input placeholder="สคริปต์ที่อ่าน (ว่าง = ใช้ข้อความที่แสดง)" value={ss} onChange={(e) => setSs(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <input placeholder="สคริปต์ VOICEVOX (katakana ざーこ♡)" value={svv} onChange={(e) => setSvv(e.target.value)} style={{ padding: 8, flex: 2 }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
              <input placeholder="ลิงก์รูป https://... (ให้ AI ส่ง)" value={simg.startsWith("data:") ? "" : simg} onChange={(e) => setSimg(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>📷 รูป<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setSimg(String(r.result)); r.readAsDataURL(f); }} /></label>
              <label>จากคลัง
                <select value="" onChange={(e) => { if (e.target.value) setSimg(e.target.value); }} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="">-- เลือก --</option>
                  {lib.map((im) => <option key={im.id} value={im.dataUrl}>{im.name}</option>)}
                </select>
              </label>
              <label>พาไปหน้า
                <select value={sgoto} onChange={(e) => setSgoto(e.target.value)} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="">ไม่พาไปไหน</option>
                  {AI_PAGES.map((p) => <option key={p.path} value={p.path}>{p.label}</option>)}
                </select>
              </label>
              <button className="btn" onClick={() => { if (!sk || !sa) return; const next = [...script, { id: "S" + Date.now(), keyword: sk, answer: sa, speak: ss || sa, speakVv: svv || undefined, image: simg || undefined, goto: sgoto || undefined }]; saveScript(next); setScript(next); setSk(""); setSa(""); setSs(""); setSvv(""); setSimg(""); setSgoto(""); }}>เพิ่มข้อ</button>
            </div>
            {simg && <img src={simg} alt="preview" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, border: "1px solid #E3C878", borderRadius: 6 }} />}
            {script.map((s, idx) => (
              <div key={s.id} className="card" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <b style={{ color: "#7a1c1c" }}>ข้อ {idx + 1}</b>
                  {s.image && <img src={s.image} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }} />}
                  <span style={{ flex: 1 }} />
                  <button className="btn btn-secondary" onClick={async () => {
                    try {
                      const ttsText = ai.voice === "voicevox" ? (s.speakVv || s.speak || s.answer) : (s.speak || s.answer);
                      const r = await fetch("/api/script-audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, text: ttsText, speaker: ai.vvSpeaker }) });
                      const j = await r.json();
                      if (!r.ok) { alert(j.error || "สร้างไม่สำเร็จ"); return; }
                      const next = script.map((x) => x.id === s.id ? { ...x, audio: j.path } : x);
                      saveScript(next); setScript(next); setSaved(`สร้างเสียงข้อ ${idx + 1} แล้ว`);
                    } catch { alert("สร้างไม่สำเร็จ - เปิด VOICEVOX ก่อน"); }
                  }}>สร้างเสียง</button>
                  <button onClick={() => { const next = script.filter((x) => x.id !== s.id); saveScript(next); setScript(next); }}>ลบ</button>
                </div>
                <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.9 }}>
                  <div><b>คำเรียก:</b> {s.keyword}</div>
                  <div><b>ข้อความที่แสดง:</b> {s.answer}</div>
                  <div><b>สคริปต์ที่อ่าน:</b> {s.speak}</div>
                  <div><b>VOICEVOX:</b> {s.speakVv || "-"}</div>
                  <div><b>พาไปหน้า:</b> {s.goto ? (AI_PAGES.find((p) => p.path === s.goto)?.label || s.goto) : "-"}</div>
                  <div><b>ไฟล์เสียง:</b> {s.audio ? `มีแล้ว (${s.audio})` : "-"}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>ตอนหาไม่เจอ - ปรับข้อความกับสคริปต์ได้</h3>
            <label style={{ fontWeight: 700, color: "#7a1c1c" }}>ข้อความที่แสดง</label>
            <input value={nfText} onChange={(e) => setNfText(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>สคริปต์ที่อ่าน</label>
            <textarea value={nfSpeak} onChange={(e) => setNfSpeak(e.target.value)} rows={3} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => { saveNotFound({ text: nfText, speak: nfSpeak, audio: nfAudio || undefined }); setSaved("บันทึกข้อความตอนหาไม่เจอแล้ว"); }}>บันทึกตอนหาไม่เจอ</button>
              <button className="btn btn-secondary" onClick={async () => {
                try {
                  const r = await fetch("/api/script-audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "_notfound", text: nfSpeak, speaker: ai.vvSpeaker }) });
                  const j = await r.json();
                  if (!r.ok) { alert(j.error || "สร้างไม่สำเร็จ"); return; }
                  setNfAudio(j.path); saveNotFound({ text: nfText, speak: nfSpeak, audio: j.path }); setSaved("สร้างเสียงตอนหาไม่เจอแล้ว");
                } catch { alert("สร้างไม่สำเร็จ - เปิด VOICEVOX ก่อน"); }
              }}>สร้างเสียงตอนหาไม่เจอ</button>
            </div>
            {nfAudio && <div style={{ marginTop: 6, fontSize: 13 }}>🔊 มีไฟล์เสียงแล้ว: {nfAudio}</div>}
          </div>
        </>
      )}
    </div>
  );
}
