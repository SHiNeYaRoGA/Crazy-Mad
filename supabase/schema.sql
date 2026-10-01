-- Supabase schema: ที่เก็บกลางให้ Admin แก้ทีเดียวเห็นทุกเครื่อง
-- วิธีใช้: สร้างโปรเจกต์ที่ supabase.com > SQL Editor > วางไฟล์นี้ > Run

create table if not exists kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- MVP เปิดให้ anon อ่าน/เขียนได้ (demo เท่านั้น ขึ้นจริงควรล็อกด้วย RLS + auth)
alter table kv enable row level security;

drop policy if exists "anon all" on kv;
create policy "anon all" on kv
  for all to anon using (true) with check (true);
