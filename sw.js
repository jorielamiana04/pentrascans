/* Pentra Finance service worker: offline app shell, share-to-Pentra, safe updates.
   Caches only Pentra's own files; Supabase always uses the network. The on-device scanner's engine
   (/ocr/) is kept in its own cache that app updates don't delete, so scanning works offline. */
const VERSION = 'pentra-d57c1d6632';
const BASE = new URL('./', self.location).pathname;   /* '/' on Netlify, '/your-repo/' on GitHub Pages */
const SHELL = ['', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'].map((p) => BASE + p);
const SHARE = 'pentra-share';
const OCR = 'pentra-ocr-1';   /* bump when the engine files change */
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL))); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== SHARE && k !== OCR).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('notificationclick', function(e){ e.notification.close(); var url = (e.notification.data && e.notification.data.url) || BASE;   /* Pentra alerts open the right page */
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(function(list){ for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) { if (list[i].navigate) list[i].navigate(url).catch(function(){}); return list[i].focus(); } } return self.clients.openWindow(url); })); });
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.method === 'POST' && url.pathname === BASE + 'share-target') { e.respondWith(receive(req)); return; }
  if (req.method !== 'GET') return;
  if (url.pathname.startsWith(BASE + '__share/')) { e.respondWith(handOver(url)); return; }
  if (url.pathname.startsWith(BASE + 'ocr/') || url.pathname.startsWith(BASE + 'scan/')) {   /* scanner engines: kept for offline use */
    if (url.pathname.startsWith(BASE + 'ocr/lang/')) return;   /* Tesseract keeps its language data itself (IndexedDB) */
    e.respondWith(caches.open(OCR).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(BASE + 'index.html', copy)); } return res; })
      .catch(() => caches.match(BASE + 'index.html').then((r) => r || caches.match(BASE))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
/* A picture shared to Pentra (Android share sheet) is held briefly, then handed to the Scan screen and deleted. */
async function receive(req) {
  const form = await req.formData(), files = form.getAll('files').filter((f) => f && typeof f === 'object' && f.size).slice(0, 6);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7), c = await caches.open(SHARE);
  await Promise.all(files.map((f, i) => c.put(BASE + '__share/' + id + '/' + i, new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream', 'x-name': encodeURIComponent(f.name || ('shared-' + i)) } }))));
  return Response.redirect(BASE + '#/scan?share=' + id + '&n=' + files.length, 303);
}
async function handOver(url) {
  const c = await caches.open(SHARE), parts = ('/' + url.pathname.slice(BASE.length)).split('/');   /* ['', '__share', id, n|clear] wherever Pentra is served */
  if (parts[3] === 'clear') { const keys = await c.keys(); await Promise.all(keys.filter((k) => new URL(k.url).pathname.startsWith(BASE + '__share/' + parts[2] + '/')).map((k) => c.delete(k))); return new Response('ok'); }
  const hit = await c.match(url.pathname); return hit || new Response('gone', { status: 404 });
}
