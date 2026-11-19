-- รันใน Supabase Dashboard -> SQL Editor (โปรเจกต์ที่ใช้กับ CalSnap)
create table if not exists public.calsnap_backup (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- เปิด RLS และไม่สร้าง policy: เข้าถึงได้เฉพาะ service role จาก /api/sync เท่านั้น
alter table public.calsnap_backup enable row level security;

-- ให้ service role (ที่ /api/sync ใช้) เข้าถึงตารางได้
grant select, insert, update, delete on public.calsnap_backup to service_role;
