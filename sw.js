const CACHE_NAME = 'kasir-pwa-v6';

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
  // Jangan sekali-kali meng-cache request Google Apps Script agar sentuhan/transaksi kasir tidak freeze
  if (
    event.request.url.includes('script.google.com') || 
    event.request.url.includes('googleusercontent.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
