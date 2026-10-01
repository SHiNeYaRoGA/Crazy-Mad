"use client";
import { useEffect, useState } from "react";
import { MOCK_PRODUCTS, allProducts, getStock, loadCategories, addCategory, removeCategory, loadCatEn, saveCatEn, loadCustomProducts, setStock, saveOverride, type Product } from "@/lib/products";
import { DEFAULT_PAGES, loadPage, savePage, type PageKey, type PageContent } from "@/lib/content";
import { loadOrders, deleteOrder, type Order } from "@/lib/orders";
import { DEFAULT_AI_SETTINGS, loadAISettings, saveAISettings, type AISettings } from "@/lib/aiSettings";
import { DEFAULT_NOTFOUND, loadNotFound, loadScript, saveNotFound, saveScript, AI_PAGES, DEFAULT_INTENTS, DEFAULT_ADMIN_WORDS, DEFAULT_ADMIN_REFUSE, loadAdminRefuse, loadAdminWords, loadAllowedPages, loadIntents, saveAdminGuard, saveAllowedPages, saveIntents, type ScriptItem } from "@/lib/script";
import { addLibraryImage, fileToDataUrl, loadLibrary, removeLibraryImage, type LibImage } from "@/lib/imageLibrary";
import { DEFAULT_MELUNA, loadMeluna, saveMeluna } from "@/lib/meluna";
import { isDbConfigured, pullNow } from "@/lib/db";
import { useLang } from "@/lib/i18n";

const PAGE_KEYS: { key: PageKey; labelKey: "nav_shop" | "nav_training" | "nav_about" | "nav_contact" }[] = [
  { key: "home", labelKey: "nav_shop" },
  { key: "shop", labelKey: "nav_shop" },
  { key: "training", labelKey: "nav_training" },
  { key: "about", labelKey: "nav_about" },
  { key: "contact", labelKey: "nav_contact" },
];

export default function AdminPage() {
  const { t } = useLang();
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<"products" | "pages" | "orders" | "ai">("products");
  const [items, setItems] = useState<Product[]>(MOCK_PRODUCTS);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState(100);
  const [img, setImg] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [catEn, setCatEn] = useState<Record<string, string>>({});
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

  const pl = (path: string) => {
    if (path === "/") return "Home";
    if (path === "/shop") return t("nav_shop");
    if (path === "/training") return t("nav_training");
    if (path === "/about") return t("nav_about");
    if (path === "/contact") return t("nav_contact");
    if (path === "/cart") return t("nav_cart");
    return AI_PAGES.find((p) => p.path === path)?.label || path;
  };

  useEffect(() => {
    setItems(allProducts());
    setCats(loadCategories());
    setCatEn(loadCatEn());
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
      <h2 style={{ color: "#7a1c1c" }}>{t("adm_login_title")}</h2>
      <input type="password" placeholder={t("adm_pw_ph")} value={pw} onChange={(e) => setPw(e.target.value)} style={{ padding: 8 }} />
      <button className="btn" style={{ marginLeft: 8 }} onClick={() => (pw === "phayao123" ? setOk(true) : alert(t("adm_wrong")))}>{t("adm_enter")}</button>
    </div>
  );
  return (
    <div>
      <h2 style={{ color: "#7a1c1c" }}>{t("adm_title")}</h2>
      <div className="card" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge">{isDbConfigured() ? t("adm_db_on") : t("adm_db_off")}</span>
        {isDbConfigured() && <button className="btn btn-secondary" onClick={async () => { const ok = await pullNow(); setSaved(ok ? t("adm_pulled") : t("adm_pull_fail")); setItems(allProducts()); }}>{t("adm_pull")}</button>}
        {saved && <span style={{ color: "#7a1c1c" }}>{saved}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={tab === "products" ? "btn" : "btn btn-secondary"} onClick={() => setTab("products")}>{t("tab_products")} ({items.length})</button>
        <button className={tab === "pages" ? "btn" : "btn btn-secondary"} onClick={() => setTab("pages")}>{t("tab_pages")}</button>
        <button className={tab === "orders" ? "btn" : "btn btn-secondary"} onClick={() => setTab("orders")}>{t("tab_orders")} ({orders.length})</button>
        <button className={tab === "ai" ? "btn" : "btn btn-secondary"} onClick={() => setTab("ai")}>{t("tab_ai")}</button>
      </div>

      {tab === "products" && (
        <>
          <div className="card">
            <h3>{t("cat_title")}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder={t("cat_new_ph")} value={newCat} onChange={(e) => setNewCat(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <button className="btn btn-secondary" onClick={() => { addCategory(newCat); setCats(loadCategories()); setNewCat(""); }}>{t("cat_add")}</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {cats.map((c) => (
                <span key={c} className="badge">{c}{!["งานไม้", "ผ้าทอ", "จักสาน", "ของที่ระลึก"].includes(c) && <button style={{ marginLeft: 4 }} onClick={() => { removeCategory(c); setCats(loadCategories()); }}>✕</button>}</span>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              {cats.map((c) => (
                <div key={c} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <b style={{ minWidth: 90 }}>{c}</b>
                  <input placeholder="English name" value={catEn[c] || ""} onChange={(e) => { const next = { ...catEn, [c]: e.target.value }; setCatEn(next); saveCatEn(next); }} style={{ padding: 6, flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder={t("prod_new_ph")} value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input placeholder="English name" value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value) || 0)} style={{ padding: 8, width: 120 }} />
              <select value={pickCat} onChange={(e) => setPickCat(e.target.value)} style={{ padding: 8 }}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder={t("img_link_ph")} value={img.startsWith("data:") ? "" : img} onChange={(e) => setImg(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>{t("img_choose")}<input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
              <button className="btn" onClick={add}>{t("prod_add")}</button>
            </div>
            {img && <img src={img} alt="preview" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, border: "1px solid #E3C878", borderRadius: 6 }} />}
          </div>
          {items.map((p) => (
            <div key={p.id}>
              <div className="jobitem">
                {p.image && <img src={p.image} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }} />}
                <span>{p.name_th} ฿{p.price} <span className="badge">{p.category}</span> <span style={{ fontSize: 12 }}>{t("left")} {getStock(p)}</span></span>
                <span style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={() => { setEditId(p.id); setEf({ name: p.name_th, nameEn: p.name_en || "", price: p.price, category: p.category, stock: getStock(p), image: p.image || "" }); }}>{t("edit")}</button>
                <button onClick={() => remove(p.id)}>{t("del")}</button>
              </div>
              {editId === p.id && (
                <div className="card">
                  <b>{t("edit")}: {p.id}</b>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <input value={ef.name} onChange={(e) => setEf({ ...ef, name: e.target.value })} style={{ padding: 8, flex: 1 }} placeholder={t("prod_new_ph")} />
                    <input value={ef.nameEn} onChange={(e) => setEf({ ...ef, nameEn: e.target.value })} style={{ padding: 8, flex: 1 }} placeholder="English name" />
                    <label>{t("price")}<input type="number" value={ef.price} onChange={(e) => setEf({ ...ef, price: parseInt(e.target.value) || 0 })} style={{ padding: 8, width: 110, marginLeft: 4 }} /></label>
                    <label>{t("category")}
                      <select value={ef.category} onChange={(e) => setEf({ ...ef, category: e.target.value })} style={{ padding: 8, marginLeft: 4 }}>
                        {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label>{t("stock")}<input type="number" value={ef.stock} onChange={(e) => setEf({ ...ef, stock: parseInt(e.target.value) || 0 })} style={{ padding: 8, width: 80, marginLeft: 4 }} /></label>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input placeholder={t("img_link_ph")} value={ef.image.startsWith("data:") ? "" : ef.image} onChange={(e) => setEf({ ...ef, image: e.target.value })} style={{ padding: 8, flex: 2 }} />
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
                    }}>{t("save_shop")}</button>
                    <button className="btn btn-secondary" onClick={() => setEditId("")}>{t("cancel")}</button>
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
            {PAGE_KEYS.map((p) => (
              <button key={p.key} className={pageKey === p.key ? "btn" : "btn btn-secondary"} onClick={() => setPageKey(p.key)}>{p.key === "home" ? "Home" : t(p.labelKey)}</button>
            ))}
          </div>
          <p>{t("pages_note")} (`content-{pageKey}`)</p>
          <label style={{ fontWeight: 700, color: "#7a1c1c" }}>{t("pages_title_label")}</label>
          <input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("pages_title_label")} (English)</label>
          <input value={pageForm.title_en || ""} onChange={(e) => setPageForm({ ...pageForm, title_en: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("pages_body")}</label>
          <textarea value={pageForm.body} onChange={(e) => setPageForm({ ...pageForm, body: e.target.value })} rows={5} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("pages_body")} (English)</label>
          <textarea value={pageForm.body_en || ""} onChange={(e) => setPageForm({ ...pageForm, body_en: e.target.value })} rows={5} style={{ width: "100%", padding: 8, marginTop: 4 }} />
          {(
            <div style={{ marginTop: 12, borderTop: "1px dashed #E3C878", paddingTop: 8 }}>
              <b>กรอบข้อมูล (แทนเนื้อหาด้านบนเมื่อมีอย่างน้อย 1 กรอบ)</b>
              {(pageForm.blocks || []).map((b, i) => (
                <div key={i} className="card" style={{ marginTop: 8 }}>
                  <textarea value={b.text} onChange={(e) => { const nx = [...(pageForm.blocks || [])]; nx[i] = { ...nx[i], text: e.target.value }; setPageForm({ ...pageForm, blocks: nx }); }} rows={2} style={{ width: "100%", padding: 8 }} placeholder="ข้อความ" />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
                    <label><input type="checkbox" checked={b.bold} onChange={(e) => { const nx = [...(pageForm.blocks || [])]; nx[i] = { ...nx[i], bold: e.target.checked }; setPageForm({ ...pageForm, blocks: nx }); }} /> ตัวหนา</label>
                    <label>สี
                      <select value={b.color} onChange={(e) => { const nx = [...(pageForm.blocks || [])]; nx[i] = { ...nx[i], color: e.target.value }; setPageForm({ ...pageForm, blocks: nx }); }} style={{ marginLeft: 4, padding: 6 }}>
                        <option value="#7a1c1c">เลือดหมู</option>
                        <option value="#B8860B">ทอง</option>
                        <option value="#2b2320">ดำ</option>
                        <option value="#ffffff">ขาว (พื้นแดง)</option>
                      </select>
                    </label>
                    <label>ขนาด
                      <select value={b.size} onChange={(e) => { const nx = [...(pageForm.blocks || [])]; nx[i] = { ...nx[i], size: e.target.value as any }; setPageForm({ ...pageForm, blocks: nx }); }} style={{ marginLeft: 4, padding: 6 }}>
                        <option value="s">เล็ก</option>
                        <option value="m">กลาง</option>
                        <option value="l">ใหญ่</option>
                      </select>
                    </label>
                    <label>จัดวาง
                      <select value={b.align} onChange={(e) => { const nx = [...(pageForm.blocks || [])]; nx[i] = { ...nx[i], align: e.target.value as any }; setPageForm({ ...pageForm, blocks: nx }); }} style={{ marginLeft: 4, padding: 6 }}>
                        <option value="left">ซ้าย</option>
                        <option value="center">กลาง</option>
                        <option value="right">ขวา</option>
                      </select>
                    </label>
                    <button onClick={() => setPageForm({ ...pageForm, blocks: (pageForm.blocks || []).filter((_, j) => j !== i) })}>{t("del")}</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setPageForm({ ...pageForm, blocks: [...(pageForm.blocks || []), { text: "", bold: false, color: "#2b2320", size: "m", align: "center" }] })}>+ เพิ่มกรอบ</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={() => { savePage(pageKey, pageForm); setSaved(`${t("saved_generic")} ${pageKey} ${new Date().toLocaleTimeString()}`); }}>{t("save_page")}</button>
            <button className="btn btn-secondary" onClick={() => { setPageForm(DEFAULT_PAGES[pageKey]); savePage(pageKey, DEFAULT_PAGES[pageKey]); setSaved(t("reset_done")); }}>{t("reset_page")}</button>
          </div>
          {saved && <div style={{ marginTop: 8, color: "#7a1c1c" }}>{saved}</div>}
        </div>
      )}

      {tab === "orders" && (
        <>
          {orders.length === 0 && <div className="card">{t("no_orders")}</div>}
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div style={{ display: "flex", gap: 8 }}>
                <b style={{ color: "#7a1c1c" }}>{o.id}</b><span>{o.date}</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => { deleteOrder(o.id); setOrders(loadOrders()); }}>{t("del")}</button>
              </div>
              <div>{o.name} | {o.phone} | {o.address}</div>
              {o.items.map((i) => <div key={i.id}>- {i.name} ฿{i.price} x {i.qty}</div>)}
              <b>{t("total")} ฿{o.total}</b>
            </div>
          ))}
        </>
      )}

      {tab === "ai" && (
        <>
          <div className="card">
            <h3>{t("ai_voice_title")}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label>{t("voice")}
                <select value={ai.voice} onChange={(e) => setAi({ ...ai, voice: e.target.value as any })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="female">{t("v_female")}</option>
                  <option value="male">{t("v_male")}</option>
                  <option value="voicevox">{t("v_vv")}</option>
                </select>
              </label>
              <label>{t("speak_lang")}
                <select value={ai.speakLang} onChange={(e) => setAi({ ...ai, speakLang: e.target.value as any })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="th">{t("speak_th")}</option>
                  <option value="karaoke">{t("speak_kara")}</option>
                </select>
              </label>
              <label>{t("speed")}
                <select value={ai.rate} onChange={(e) => setAi({ ...ai, rate: parseFloat(e.target.value) })} style={{ marginLeft: 4, padding: 6 }}>
                  <option value={0.8}>0.8x</option>
                  <option value={1}>1x</option>
                  <option value={1.2}>1.2x</option>
                </select>
              </label>
              {ai.voice === "voicevox" && vvList.length > 0 && (
                <label>{t("character")}
                  <select value={ai.vvSpeaker} onChange={(e) => setAi({ ...ai, vvSpeaker: e.target.value })} style={{ marginLeft: 4, padding: 6 }}>
                    {vvList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
              )}
            </div>
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveAISettings(ai); setSaved(t("saved_ai")); }}>{t("save_ai")}</button></div>
            {saved && <div style={{ marginTop: 8, color: "#7a1c1c" }}>{saved}</div>}
          </div>
          <div className="card">
            <h3>{t("ai_pages_title")}</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {AI_PAGES.map((p) => (
                <label key={p.path} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input type="checkbox" checked={allowed.includes(p.path)} onChange={(e) => {
                    const next = e.target.checked ? [...allowed, p.path] : allowed.filter((x) => x !== p.path);
                    setAllowed(next); saveAllowedPages(next);
                  }} /> {pl(p.path)}
                </label>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>{t("intent_title")}</h3>
            {intents.map((it) => (
              <div key={it.page} style={{ marginBottom: 8 }}>
                <b>{pl(it.page)}</b>
                <input value={it.words.join(", ")} onChange={(e) => setIntents(intents.map((x) => x.page === it.page ? { ...x, words: e.target.value.split(",").map((w) => w.trim()).filter(Boolean) } : x))} style={{ width: "100%", padding: 8, marginTop: 4 }} placeholder={t("intent_ph")} />
              </div>
            ))}
            <button className="btn" onClick={() => { saveIntents(intents); setSaved(t("saved_intent")); }}>{t("save_intent")}</button>
          </div>
          <div className="card">
            <h3>{t("guard_title")}</h3>
            <p>{t("guard_desc")}</p>
            <label style={{ fontWeight: 700, color: "#7a1c1c" }}>{t("guard_words")}</label>
            <input value={guardWords} onChange={(e) => setGuardWords(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("guard_text")}</label>
            <input value={guardText} onChange={(e) => setGuardText(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("guard_speak")}</label>
            <textarea value={guardSpeak} onChange={(e) => setGuardSpeak(e.target.value)} rows={2} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveAdminGuard(guardWords.split(",").map((w) => w.trim()).filter(Boolean), guardText, guardSpeak); setSaved(t("saved_guard")); }}>{t("save_guard")}</button></div>
          </div>
          <div className="card">
            <h3>{t("mel_title")}</h3>
            <p>{t("mel_desc")}</p>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="checkbox" checked={melOn} onChange={(e) => setMelOn(e.target.checked)} /> {t("mel_on")}
            </label>
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("mel_wake")}</label>
            <input value={melWake} onChange={(e) => setMelWake(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("mel_img")}</label>
            <input value={melImg} onChange={(e) => setMelImg(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8 }}><button className="btn" onClick={() => { saveMeluna({ enabled: melOn, wakeWords: melWake.split(",").map((w) => w.trim()).filter(Boolean), imageWords: melImg.split(",").map((w) => w.trim()).filter(Boolean) }); setSaved(t("saved_mel")); }}>{t("save_mel")}</button></div>
          </div>
          <div className="card">
            <h3>{t("lib_title")} ({lib.length})</h3>
            <p>{t("lib_desc")}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder={t("lib_link_ph")} value={libUrl} onChange={(e) => setLibUrl(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <button className="btn btn-secondary" onClick={() => { if (!libUrl) return; setLib(addLibraryImage(libUrl.split("/").pop() || "link", libUrl)); setLibUrl(""); }}>{t("lib_add_link")}</button>
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>{t("lib_upload")}<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const { name, dataUrl } = await fileToDataUrl(f); setLib(addLibraryImage(name, dataUrl)); } catch { alert(t("read_err")); } }} /></label>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {lib.map((im) => (
                <div key={im.id} style={{ border: "1px solid #E3C878", borderRadius: 6, padding: 6, width: 140 }}>
                  <img src={im.dataUrl} alt={im.name} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4 }} />
                  <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{im.name}</div>
                  <button style={{ fontSize: 12 }} onClick={() => { removeLibraryImage(im.id); setLib(loadLibrary()); }}>{t("del")}</button>
                </div>
              ))}
              {lib.length === 0 && <span style={{ fontSize: 13 }}>{t("lib_empty")}</span>}
            </div>
          </div>
          <div className="card">
            <h3>{t("script_title")} ({script.length}) - {t("script_note")}</h3>
            <p>{t("script_desc")}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input placeholder={t("sk_ph")} value={sk} onChange={(e) => setSk(e.target.value)} style={{ padding: 8, flex: 1 }} />
              <input placeholder={t("sa_ph")} value={sa} onChange={(e) => setSa(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <input placeholder={t("ss_ph")} value={ss} onChange={(e) => setSs(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <input placeholder={t("svv_ph")} value={svv} onChange={(e) => setSvv(e.target.value)} style={{ padding: 8, flex: 2 }} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
              <input placeholder={t("simg_ph")} value={simg.startsWith("data:") ? "" : simg} onChange={(e) => setSimg(e.target.value)} style={{ padding: 8, flex: 2 }} />
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>{t("simg_file")}<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setSimg(String(r.result)); r.readAsDataURL(f); }} /></label>
              <label>{t("lib_pick")}
                <select value="" onChange={(e) => { if (e.target.value) setSimg(e.target.value); }} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="">{t("pick_none")}</option>
                  {lib.map((im) => <option key={im.id} value={im.dataUrl}>{im.name}</option>)}
                </select>
              </label>
              <label>{t("goto_label")}
                <select value={sgoto} onChange={(e) => setSgoto(e.target.value)} style={{ marginLeft: 4, padding: 6 }}>
                  <option value="">{t("goto_none")}</option>
                  {AI_PAGES.map((p) => <option key={p.path} value={p.path}>{pl(p.path)}</option>)}
                </select>
              </label>
              <button className="btn" onClick={() => { if (!sk || !sa) return; const next = [...script, { id: "S" + Date.now(), keyword: sk, answer: sa, speak: ss || sa, speakVv: svv || undefined, image: simg || undefined, goto: sgoto || undefined }]; saveScript(next); setScript(next); setSk(""); setSa(""); setSs(""); setSvv(""); setSimg(""); setSgoto(""); }}>{t("add_item")}</button>
            </div>
            {simg && <img src={simg} alt="preview" style={{ width: 160, height: 120, objectFit: "cover", marginTop: 8, border: "1px solid #E3C878", borderRadius: 6 }} />}
            {script.map((s, idx) => (
              <div key={s.id} className="card" style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <b style={{ color: "#7a1c1c" }}>{t("item_no")} {idx + 1}</b>
                  {s.image && <img src={s.image} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }} />}
                  <span style={{ flex: 1 }} />
                  <button className="btn btn-secondary" onClick={async () => {
                    try {
                      const ttsText = ai.voice === "voicevox" ? (s.speakVv || s.speak || s.answer) : (s.speak || s.answer);
                      const r = await fetch("/api/script-audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, text: ttsText, speaker: ai.vvSpeaker }) });
                      const j = await r.json();
                      if (!r.ok) { alert(j.error || t("audio_fail")); return; }
                      const next = script.map((x) => x.id === s.id ? { ...x, audio: j.path } : x);
                      saveScript(next); setScript(next); setSaved(`${t("make_audio")} ${t("item_no")} ${idx + 1}`);
                    } catch { alert(t("audio_need_engine")); }
                  }}>{t("make_audio")}</button>
                  <button onClick={() => { const next = script.filter((x) => x.id !== s.id); saveScript(next); setScript(next); }}>{t("del")}</button>
                </div>
                <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.9 }}>
                  <div><b>{t("f_keyword")}</b> {s.keyword}</div>
                  <div><b>{t("f_show")}</b> {s.answer}</div>
                  <div><b>{t("f_speak")}</b> {s.speak}</div>
                  <div><b>{t("f_vv")}</b> {s.speakVv || t("f_dash")}</div>
                  <div><b>{t("f_goto")}</b> {s.goto ? pl(s.goto) : t("f_dash")}</div>
                  <div><b>{t("f_audio")}</b> {s.audio ? `${t("f_audio_ready")} (${s.audio})` : t("f_dash")}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>{t("nf_title")}</h3>
            <label style={{ fontWeight: 700, color: "#7a1c1c" }}>{t("guard_text").replace("ปฏิเสธ", "หาไม่เจอ").replace("Refusal", "Not-found")}</label>
            <input value={nfText} onChange={(e) => setNfText(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <label style={{ fontWeight: 700, color: "#7a1c1c", marginTop: 8, display: "block" }}>{t("guard_speak").replace("ปฏิเสธ", "หาไม่เจอ").replace("Refusal", "Not-found")}</label>
            <textarea value={nfSpeak} onChange={(e) => setNfSpeak(e.target.value)} rows={3} style={{ width: "100%", padding: 8, marginTop: 4 }} />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => { saveNotFound({ text: nfText, speak: nfSpeak, audio: nfAudio || undefined }); setSaved(t("saved_generic")); }}>{t("nf_save")}</button>
              <button className="btn btn-secondary" onClick={async () => {
                try {
                  const r = await fetch("/api/script-audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "_notfound", text: nfSpeak, speaker: ai.vvSpeaker }) });
                  const j = await r.json();
                  if (!r.ok) { alert(j.error || t("audio_fail")); return; }
                  setNfAudio(j.path); saveNotFound({ text: nfText, speak: nfSpeak, audio: j.path }); setSaved(t("nf_made"));
                } catch { alert(t("audio_need_engine")); }
              }}>{t("nf_make")}</button>
            </div>
            {nfAudio && <div style={{ marginTop: 6, fontSize: 13 }}>{t("nf_has")} {nfAudio}</div>}
          </div>
        </>
      )}
    </div>
  );
}
