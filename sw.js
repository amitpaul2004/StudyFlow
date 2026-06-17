const CACHE_NAME = 'studysphere-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/pages.css',
  '/js/db.js',
  '/js/ui.js',
  '/js/pages.js',
  '/assets/favicon.svg',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
        })
      );
    })
  );
});
