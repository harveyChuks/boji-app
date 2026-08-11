// Service Worker for offline capabilities
const CACHE_NAME = 'boji-v2';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // IMPORTANT:
  // - Never try to handle non-GET requests (e.g. Supabase Auth POST /token, /recover).
  //   The Cache API only supports GET; attempting to cache-match POST can break requests.
  // - Never try to cache cross-origin requests.
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (request.method !== 'GET' || !isSameOrigin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request);
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Sync data when back online
async function syncData() {
  // Get offline data from IndexedDB or localStorage
  const offlineData = await getOfflineData();
  
  // Sync with server
  for (const item of offlineData) {
    try {
      await syncItem(item);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
    }
  }
}

async function getOfflineData() {
  // Implementation to get offline data
  return [];
}

async function syncItem(item) {
  // Implementation to sync individual item
  return fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}