self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("ncb-pwa-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/dashboard",
        "/capture",
        "/ledger",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
