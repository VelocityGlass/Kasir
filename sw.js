const CACHE_NAME = 'gas-pwa-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Event Instalasi: Simpan asset dasar wrapper dan langsung aktifkan
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa worker baru langsung aktif tanpa menunggu tab lama ditutup
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Event Aktivasi: Hapus semua cache versi lama (v1 dsb) secara menyeluruh
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Menghapus cache usang:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Ambil alih semua client/halaman yang terbuka seketika
      return self.clients.claim();
    })
  );
});

// Event Fetch: Gunakan network-first dan jangan pernah cache request GAS/Google Drive
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Lewatkan langsung request ke Google Apps Script dan Google Drive/Photos
  if (
    url.includes('script.google.com') ||
    url.includes('googleusercontent.com') ||
    url.includes('drive.google.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first untuk file lokal agar perubahan GitHub Pages langsung terbaca
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika response valid, update cache lokal
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback ke cache jika perangkat sedang offline
        return caches.match(event.request);
      })
  );
});
