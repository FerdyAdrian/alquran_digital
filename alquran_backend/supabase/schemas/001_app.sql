-- Declarative schema for a NEW project. Existing Laravel data is not migrated.
create table public.tilawah_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  surah_name text not null check (char_length(trim(surah_name)) between 1 and 120),
  ayah_count integer not null check (ayah_count between 1 and 6236),
  read_date date not null,
  created_at timestamptz not null default now()
);
create index tilawah_notes_user_date_idx on public.tilawah_notes(user_id, read_date desc);
create table public.tilawah_schedules (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  time time not null,
  done_date date
);
create index tilawah_schedules_user_idx on public.tilawah_schedules(user_id);
create table public.khatam_targets (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  days integer not null default 30 check (days between 1 and 3650),
  daily_pages integer not null default 20 check (daily_pages between 1 and 604),
  pages_read integer not null default 0 check (pages_read between 0 and 604),
  start_date date not null default current_date
);
create table public.worship_reminders (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  time time not null,
  enabled boolean not null default true
);
create index worship_reminders_user_idx on public.worship_reminders(user_id);
alter table public.tilawah_notes enable row level security;
alter table public.tilawah_schedules enable row level security;
alter table public.khatam_targets enable row level security;
alter table public.worship_reminders enable row level security;
create policy own_notes on public.tilawah_notes for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_schedules on public.tilawah_schedules for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_target on public.khatam_targets for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_reminders on public.worship_reminders for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.tilawah_notes, public.tilawah_schedules, public.khatam_targets, public.worship_reminders from public, anon;
grant select, insert, update, delete on public.tilawah_notes, public.tilawah_schedules, public.khatam_targets, public.worship_reminders to authenticated;
grant usage on sequence public.tilawah_notes_id_seq, public.tilawah_schedules_id_seq, public.worship_reminders_id_seq to authenticated;
create function public.toggle_tilawah_schedule(schedule_id bigint, today_date date)
returns setof public.tilawah_schedules language sql security invoker set search_path = '' as $$
  update public.tilawah_schedules
  set done_date = case when done_date = today_date then null else today_date end
  where id = schedule_id and user_id = (select auth.uid()) returning *;
$$;
create function public.toggle_worship_reminder(reminder_id bigint)
returns setof public.worship_reminders language sql security invoker set search_path = '' as $$
  update public.worship_reminders set enabled = not enabled
  where id = reminder_id and user_id = (select auth.uid()) returning *;
$$;
create function public.add_khatam_progress(pages integer)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if pages is null or pages < 1 or pages > 604 then raise exception 'Jumlah halaman harus 1 sampai 604'; end if;
  insert into public.khatam_targets(user_id, pages_read) values ((select auth.uid()), pages)
  on conflict (user_id) do update set pages_read = least(604, public.khatam_targets.pages_read + excluded.pages_read);
end;
$$;
revoke all on function public.toggle_tilawah_schedule(bigint, date), public.toggle_worship_reminder(bigint), public.add_khatam_progress(integer) from public, anon;
grant execute on function public.toggle_tilawah_schedule(bigint, date), public.toggle_worship_reminder(bigint), public.add_khatam_progress(integer) to authenticated;
