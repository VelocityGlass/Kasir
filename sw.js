// Service Worker untuk Cache PWA Shell
const CACHE_NAME = 'gas-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://lh3.googleusercontent.com/d/1Uac4sUkGDifGEB1vD4mCB_r1dp4wftno'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani asset wrapper lokal agar tidak menabrak dynamic request Apps Script
  if (event.request.url.includes('script.google.com')) {
    return; // Langsung teruskan ke jaringan online
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
