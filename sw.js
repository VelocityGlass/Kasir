const CACHE_NAME = 'gas-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Event Instalasi: Simpan asset dasar wrapper
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Event Aktivasi: Hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Event Fetch: Gunakan network-first untuk iframe GAS, fallback ke cache jika offline
self.addEventListener('fetch', (event) => {
  // Biarkan request eksternal Google Apps Script ditangani langsung via network
  if (event.request.url.includes('script.google.com') || event.request.url.includes('googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
