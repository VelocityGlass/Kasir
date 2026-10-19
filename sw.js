// Ubah versi ke v3 agar HP Android dipaksa membuang cache lama dan mengambil update index.html baru
const CACHE_NAME = 'kasir-pwa-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://lh3.googleusercontent.com/d/1Uac4sUkGDifGEB1vD4mCB_r1dp4wftno'
];

// 1. Event Install: Menyimpan file penting wrapper ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Menyimpan aset ke cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Langsung aktifkan SW baru tanpa menunggu tutup tab
  self.skipWaiting();
});

// 2. Event Activate: Membersihkan cache lama (v1, v2) agar tidak terjadi bug
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('SW: Menghapus cache lama:', key);
          return caches.delete(key);
        })
      );
    })
  );
  // Ambil kendali atas semua halaman yang sedang terbuka
  self.clients.claim();
});

// 3. Event Fetch: Mengatur request offline dan online
self.addEventListener('fetch', (event) => {
  // PENTING: Jangan simpan request ke script.google.com di cache
  // agar transaksi kasir selalu realtime dari database Google Spreadsheet!
  if (event.request.url.includes('script.google.com') || event.request.url.includes('googleusercontent.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
