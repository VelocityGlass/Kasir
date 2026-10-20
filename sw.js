const CACHE_NAME = 'kasir-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Biarkan request lewat normal tanpa mengganggu komunikasi GAS
  event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
