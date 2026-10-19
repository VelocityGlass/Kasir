const CACHE_NAME = 'kasir-pwa-v7';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
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
  // KUNCI FIX 100%: SW ini SEKARANG HANYA mencegat file index.html dan manifest kita sendiri.
  // SEMUA koneksi, klik, dan pertukaran data ke Google Apps Script DIBIARKAN LEPAS.
  // Ini menjamin Service Worker tidak akan memblokir komunikasi Iframe yang memicu freeze!
  const url = new URL(event.request.url);
  
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
