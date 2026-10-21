-- The Academy's login session can carry a valid auth.uid() while Realtime evaluates
-- the topic under a nonstandard role claim. Keep the UID/profile and class-membership
-- predicates as the authorization boundary, but make these SELECT policies role-agnostic.
alter policy "Ahruf users can receive own call inbox"
  on realtime.messages to public;

alter policy "Class callers can subscribe to recipient call inbox"
  on realtime.messages to public;
