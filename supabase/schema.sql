-- AL-AHRUF ACADEMY — Supabase setup
-- Run this once in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  role text not null check (role in ('admin','teacher','student')),
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.academy_state (
  id integer primary key check (id = 1),
  state jsonb not null default '{"students":[],"pay":[],"att":{},"classes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.academy_state enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'); $$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('admin','teacher')); $$;

drop policy if exists "profiles_self_or_admin" on public.profiles;
create policy "profiles_self_or_admin" on public.profiles
for select to authenticated
using (id=auth.uid() or public.is_admin());

drop policy if exists "state_staff" on public.academy_state;
create policy "state_staff" on public.academy_state
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

grant select on public.profiles to authenticated;
grant select,insert,update,delete on public.academy_state to authenticated;

insert into public.academy_state(id,state)
values (1,'{"students":[],"pay":[],"att":{},"classes":[]}'::jsonb)
on conflict (id) do nothing;

-- After creating your first Auth user in Authentication > Users,
-- replace the UUID below and run:
-- insert into public.profiles(id,username,name,role,email)
-- values ('YOUR-AUTH-USER-UUID','ahruf','Cheikh Tidiane Sall','admin','YOUR-EMAIL');
