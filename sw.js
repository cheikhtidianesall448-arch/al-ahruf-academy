const CACHE_NAME = "al-ahruf-app-shell-v2";
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
self.addEventListener("push", event => {
 let data={};try{data=event.data?event.data.json():{}}catch(_){}
 if(data.type!=="ahruf-incoming-call")return;
 event.waitUntil(self.registration.showNotification(data.title||"Incoming call",{body:data.body||"Someone is calling you",icon:new URL("./app-icon.svg",self.location.href).href,badge:new URL("./app-icon.svg",self.location.href).href,tag:data.tag||"ahruf-incoming-call",renotify:true,requireInteraction:true,vibrate:[500,250,500,250,900],data:{url:data.url||"./",room:data.room||"",kind:data.kind||"audio",from:data.from||"",fromName:data.fromName||"",timetableId:data.timetableId||""}}));
});
self.addEventListener("notificationclick", event => {
 event.notification.close();const call=event.notification.data||{},target=new URL(call.url||"./",self.location.href);
 if(call.room){target.searchParams.set("incomingCall",call.room);target.searchParams.set("kind",call.kind||"audio");target.searchParams.set("from",call.from||"");target.searchParams.set("fromName",call.fromName||"");if(call.timetableId)target.searchParams.set("timetableId",call.timetableId)}
 event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});for(const client of windows){if(new URL(client.url).origin===target.origin){await client.focus();client.postMessage({type:"AHRUF_INCOMING_CALL",call:{room:call.room,kind:call.kind||"audio",from:call.from||"",fromName:call.fromName||"",timetableId:call.timetableId||""}});return}}await self.clients.openWindow(target.href)})());
});
