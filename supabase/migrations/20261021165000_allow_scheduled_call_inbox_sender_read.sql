-- Allow an authenticated scheduled-class caller to subscribe to the assigned recipient's private inbox.
-- This is required because Supabase checks SELECT authorization when the sender subscribes
-- to a private broadcast channel before sending the invitation. Access remains limited to
-- users registered as participants in the same timetable and class-call room.
create policy "Class callers can subscribe to recipient call inbox"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and realtime.topic() like 'ahruf-user-%'
  and exists (
    select 1
    from public.academy_call_participants sender
    join public.academy_call_participants recipient
      on recipient.room = sender.room
     and recipient.timetable_id = sender.timetable_id
    join public.profiles target on target.id = recipient.user_id
    where sender.user_id = auth.uid()
      and recipient.user_id <> auth.uid()
      and regexp_replace(lower(coalesce(target.username, '')), '[^a-z0-9_-]', '_', 'g')
          = substring(realtime.topic() from 12)
  )
);
