// Cerebra — Service Worker
// Cache les assets statiques et les cours pour le mode hors ligne.

const CACHE = "cerebra-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-512.svg",
];

// Installation : pré-cache des assets statiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes : cache-first pour les assets, network-first pour le reste
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes API ou non-GET
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first pour les assets statiques (JS, CSS, images, polices)
  if (
    url.pathname.match(/\.(js|css|svg|png|jpg|woff2?|ttf|ico)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Network-first pour les pages (HTML)
  if (url.pathname.startsWith("/course/") || url.pathname === "/" || url.pathname.startsWith("/settings")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => {
          // Fallback vers la page d'accueil si la page n'est pas en cache
          return cached || caches.match("/");
        }))
    );
    return;
  }
});
