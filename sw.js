const CACHE_NAME = "al-ahruf-app-shell-v1";
const APP_SHELL = new URL("./", self.location.href).href;
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(APP_SHELL, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(APP_SHELL))));
  }
});