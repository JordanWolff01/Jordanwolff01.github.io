// Sketch Helper - offline app-shell cache, network-first.
//
// Every request tries the network first, so any newly deployed version of
// the app loads automatically on next visit (no manual "clear site data"
// needed). If the network is unavailable, it falls back to whatever was
// last successfully cached, so offline use still works - and the cache
// keeps itself fresh automatically every time you're online, rather than
// being frozen at whatever was cached on first install.
//
// This only affects the app's own files (HTML/JS/manifest); saved sketches
// live in localStorage, which is completely separate and untouched by any
// of this.
const CACHE_NAME = "sketch-helper-v2";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
