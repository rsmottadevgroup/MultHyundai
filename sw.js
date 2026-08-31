// Service Worker — NEXUS MID
// Faz cache apenas do "shell" local do app (HTML/manifest).
// Tiles do mapa (OpenStreetMap) e Leaflet via CDN seguem sempre via rede,
// pois exigem conexão para dados de mapa atualizados.

const CACHE_NAME = 'nexus-mid-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => { /* segue mesmo se algum arquivo falhar ao cachear */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Só intercepta pedidos de mesma origem (o shell local); tudo externo (CDN/tiles) vai direto pra rede.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
