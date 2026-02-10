// Service Worker for AI Study Assistant PWA
const CACHE_NAME = 'ai-study-assistant-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests - always go to network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first strategy with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response to cache it
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If no cache, show offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            // Return a basic response for other requests
            return new Response('Offline - content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
      })
  );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-flashcards') {
    event.waitUntil(syncFlashcards());
  }
});

async function syncFlashcards() {
  // TODO: Implement background sync for flashcards created offline
  console.log('Background sync triggered');
}
