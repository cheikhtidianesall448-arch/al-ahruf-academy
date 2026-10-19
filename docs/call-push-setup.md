# Background call alerts setup

The `call-push` Supabase Edge Function and `call_push_subscriptions` database table are deployed to project `bxwrdutoauonbfdbrhsu`. The web app and service worker include push registration, incoming-call notifications, vibration where supported, and notification-click routing.

## One-time Supabase secrets

The private VAPID key must never be committed to this repository or exposed in browser code. In the Supabase dashboard for project `bxwrdutoauonbfdbrhsu`, open the Edge Functions secrets settings and add these secrets:

- `AHRUF_VAPID_PUBLIC_KEY`: the public VAPID key already embedded in `index.html`.
- `AHRUF_VAPID_PRIVATE_KEY`: the matching private VAPID key generated for this deployment.
- `AHRUF_VAPID_SUBJECT`: a contact URI such as `mailto:admin@alahrufacademy.org` (replace it with the academy's monitored contact address if different).

The function also uses the standard Supabase runtime secrets for its project URL and server-side database access. Do not put a Supabase service/secret key in `index.html`.

Official guide: https://supabase.com/docs/guides/functions/secrets

## Enable on a device

1. Open the academy site over HTTPS and sign in.
2. Click **Enable call alerts** in the top bar.
3. Allow browser notifications.
4. Keep notifications enabled for the site and allow background activity in device/browser settings.

The subscription is saved per signed-in academy profile. To receive calls on another device or browser, repeat these steps on that device.

## Important platform limits

Web Push can notify a supported browser when the page is not open, including many installed-PWA scenarios. Delivery depends on browser/device settings, power-saving restrictions, network availability, and push-service support. A web page cannot force a closed browser to launch or guarantee a native full-screen call UI without the user interacting with the notification. Tapping the notification opens/focuses Al-Ahruf and routes the call invitation to the in-platform call screen.
