-- Allow authenticated call participants to publish Realtime presence.
-- The call inbox and room subscriptions use private channels; without an INSERT
-- policy for extension='presence', track() fails with UnableToHandlePresence.
drop policy if exists "Ahruf users can track call presence" on realtime.messages;
create policy "Ahruf users can track call presence"
on realtime.messages
for insert
to public
with check (
  extension = 'presence'
  and (
    (
      realtime.topic() like 'ahruf-user-%'
      and (
        exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and regexp_replace(lower(coalesce(p.username, '')), '[^a-z0-9_-]', '_', 'g') = substring(realtime.topic() from 12)
        )
        or private.can_subscribe_class_call_inbox(substring(realtime.topic() from 12))
      )
    )
    or (
      realtime.topic() like 'ahruf-call-%'
      and private.can_join_class_call_room(substring(realtime.topic() from 12))
    )
  )
);
