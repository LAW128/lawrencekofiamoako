const CACHE_NAME = 'lka-portfolio-v1';
const ASSETS = [
  './',
  './index.html',
  './my-logo.png'
];

// 1. Install Event: Cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Forces the waiting service worker to become active immediately
  );
});

// 2. Activate Event: Clean up old, outdated caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Forces open pages to use this service worker immediately
  );
});

// 3. Fetch Event: Network-first falling back to cache (Best for dynamic portfolios)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If network request succeeds, clone it and clone it into the cache
        if (response.status === 200 && ASSETS.includes(e.request.url)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request)) // If network fails, serve from cache
  );
});