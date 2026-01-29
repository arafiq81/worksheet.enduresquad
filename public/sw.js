const CACHE_NAME = "endure-worksheet-v23";
const ASSETS = [
  "/",
  "/index.html",
  "/config.js",
  "/styles.css",
  "/script.js",
  "/stats.html",
  "/stats.js",
  "/episodes/E01.json",
  "/episodes/E02.json",
  "/episodes/E03.json",
  "/episodes/E04.json",
  "/episodes/E05.json",
  "/episodes/E06.json",
  "/episodes/E07.json",
  "/episodes/E08.json",
  "/manifest.json",
  "/icon.svg",
  "/logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
