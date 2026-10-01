"use client";
import { useEffect, useState } from "react";
import { getDb, isDbConfigured, pullNow, pushKey, SYNC_KEYS } from "@/lib/db";

// ดึงข้อมูลกลางลงเครื่องตอนเปิด + ดักทุกครั้งที่ Admin บันทึกแล้วดันขึ้นกลาง
export default function DbSync() {
  const [state, setState] = useState<"off" | "syncing" | "on" | "fail">("off");
  useEffect(() => {
    if (!isDbConfigured() || !getDb()) { setState("off"); return; }
    setState("syncing");
    pullNow().then((ok) => {
      setState(ok ? "on" : "fail");
      // โหลดหน้าใหม่หลังดึงเพื่อให้ทุกหน้าอ่านค่าใหม่
      if (ok) window.dispatchEvent(new Event("db-pulled"));
    });
    // ดัก localStorage.setItem: key ไหนอยู่ใน SYNC_KEYS ดันขึ้น Supabase
    const orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (k: string, v: string) => {
      orig(k, v);
      if (SYNC_KEYS.includes(k)) pushKey(k);
    };
    return () => { localStorage.setItem = orig; };
  }, []);
  if (state === "off" || state === "on") return null;
  return (
    <div style={{ background: state === "fail" ? "#7a1c1c" : "#B8860B", color: "#fff", textAlign: "center", fontSize: 13, padding: 4 }}>
      {state === "syncing" ? "กำลังดึงข้อมูลกลาง..." : "ต่อฐานข้อมูลกลางไม่ได้ ใช้ข้อมูลในเครื่อง"}
    </div>
  );
}
