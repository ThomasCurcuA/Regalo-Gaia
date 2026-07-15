-- ═══════════════════════════════════════════════════════════════
--  Setup completo del database per "La Nostra Storia" 💜
--  Incolla TUTTO questo file nell'SQL Editor di Supabase e premi Run.
--  Si può rilanciare senza problemi: non cancella mai i ricordi.
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabella dei ricordi (una riga = una pagina del libro)
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  position int not null unique,
  title text default '',
  date text default '',
  body text default '',
  image_url text default '',
  created_at timestamptz default now()
);

alter table memories enable row level security;

drop policy if exists "lettura" on memories;
drop policy if exists "inserimento" on memories;
drop policy if exists "modifica" on memories;
drop policy if exists "cancellazione" on memories;

create policy "lettura" on memories for select using (true);
create policy "inserimento" on memories for insert with check (true);
create policy "modifica" on memories for update using (true);
create policy "cancellazione" on memories for delete using (true);

-- 2. Bucket pubblico per le foto (equivale a crearlo da Storage → New bucket)
insert into storage.buckets (id, name, public)
values ('foto', 'foto', true)
on conflict (id) do update set public = true;

drop policy if exists "upload foto" on storage.objects;
drop policy if exists "lettura foto" on storage.objects;

create policy "upload foto" on storage.objects
  for insert with check (bucket_id = 'foto');
create policy "lettura foto" on storage.objects
  for select using (bucket_id = 'foto');
