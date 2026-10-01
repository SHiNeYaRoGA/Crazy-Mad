export type Course = { id: string; title: string; desc: string; title_en?: string; desc_en?: string };

const KEY = "training-courses";

export const DEFAULT_COURSES: Course[] = [
  {
    id: "T1",
    title: "สาขาช่างไม้",
    desc: "ฝึกตั้งแต่การเลือกไม้ การวัด การตัด การขัด และการประกอบ ตัวอย่างผลิตภัณฑ์: โต๊ะไม้สำหรับใช้งาน",
  },
  {
    id: "T2",
    title: "สาขาจักสานไม้ไผ่",
    desc: "สืบสานภูมิปัญญาท้องถิ่นล้านนา-พะเยา ตัวอย่าง: กระเป๋าจักสานไม้ไผ่",
  },
  {
    id: "T3",
    title: "สาขางานถักและหัตถกรรม",
    desc: "งานถักมือที่ต้องใช้สมาธิและความประณีต ตัวอย่าง: สร้อยคอลูกปัดไม้สักถักโครเชต์ ถุงผ้าใส่แก้ว กล่องทิชชู",
  },
];

export function loadCourses(): Course[] {
  if (typeof window === "undefined") return DEFAULT_COURSES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_COURSES;
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : DEFAULT_COURSES;
  } catch { return DEFAULT_COURSES; }
}

export function saveCourses(items: Course[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("courses-changed"));
  } catch {}
}
