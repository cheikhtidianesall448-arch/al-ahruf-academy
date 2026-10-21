-- Repair scheduled class call inbox authorization without exposing participant rows.
-- The SECURITY DEFINER helper is placed in the non-exposed private schema and
-- requires an authenticated UID before checking shared room/timetable membership.
create schema if not exists private;

create or replace function private.can_subscribe_class_call_inbox(target_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.academy_call_participants sender
       join public.academy_call_participants recipient
         on recipient.room = sender.room
        and recipient.timetable_id = sender.timetable_id
       join public.profiles target on target.id = recipient.user_id
       where sender.user_id = auth.uid()
         and recipient.user_id <> auth.uid()
         and regexp_replace(lower(coalesce(target.username, '')), '[^a-z0-9_-]', '_', 'g') = target_username
     );
$$;

grant usage on schema private to public;
grant execute on function private.can_subscribe_class_call_inbox(text) to public;

drop policy if exists "Class callers can subscribe to recipient call inbox" on realtime.messages;
create policy "Class callers can subscribe to recipient call inbox"
on realtime.messages for select to public
using (
  extension = 'broadcast'
  and realtime.topic() like 'ahruf-user-%'
  and private.can_subscribe_class_call_inbox(substring(realtime.topic() from 12))
);

alter policy "Ahruf users can receive own call inbox"
on realtime.messages using (
  extension in ('broadcast', 'presence')
  and (
    (
      realtime.topic() like 'ahruf-user-%'
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and regexp_replace(lower(coalesce(p.username, '')), '[^a-z0-9_-]', '_', 'g') = substring(realtime.topic() from 12)
      )
    )
    or (
      realtime.topic() like 'ahruf-call-%'
      and exists (
        select 1 from public.academy_call_participants p
        where p.room = substring(realtime.topic() from 12)
          and p.user_id = auth.uid()
      )
    )
  )
);

-- Keep call-room SELECT authorization working even when participant rows are hidden by RLS.
create or replace function private.can_join_class_call_room(room_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.academy_call_participants p
       where p.room = room_name
         and p.user_id = auth.uid()
     );
$$;
grant execute on function private.can_join_class_call_room(text) to public;

alter policy "Ahruf users can receive own call inbox"
on realtime.messages using (
  extension in ('broadcast', 'presence')
  and (
    (
      realtime.topic() like 'ahruf-user-%'
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and regexp_replace(lower(coalesce(p.username, '')), '[^a-z0-9_-]', '_', 'g') = substring(realtime.topic() from 12)
      )
    )
    or (
      realtime.topic() like 'ahruf-call-%'
      and private.can_join_class_call_room(substring(realtime.topic() from 12))
    )
  )
);
