# Al-Ahruf International Academy

Online Qur'an learning and student management platform.

## Online accounts

The website now supports a Supabase-backed online mode while keeping the existing offline demo mode.

### Files

- `index.html` — existing academy UI
- `supabase-config.js` — browser-safe Supabase URL + Publishable Key
- `supabase/schema.sql` — database/RLS setup
- `supabase/functions/academy-api/index.ts` — secure account/data API
- `supabase/config.toml` — Edge Function configuration

### One-time setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Create the first administrator in **Authentication → Users**.
4. Copy that user's UUID into the admin INSERT statement at the bottom of `supabase/schema.sql`, set the username to `ahruf`, and run it.
5. Deploy the `academy-api` Edge Function from `supabase/functions/academy-api/index.ts`.
6. In `supabase-config.js`, replace the two placeholders with the project URL and **Publishable Key**.
7. Never put a Supabase Secret Key/service-role key in this GitHub repository or browser code.

Supabase's current documentation recommends Publishable Keys for browser code and keeping Secret Keys on trusted backend components such as Edge Functions. The Edge Function in this project is designed to keep privileged account creation on the server side.

After setup, Admin → Students can create real student accounts. Students can then sign in from another phone or computer using their Student ID and password. Data is shared through the online backend instead of browser-only localStorage.

### Live classes

The existing Jitsi-based classroom flow remains in the site. Teachers can start a room, copy the invite, and students can join from their own devices.
