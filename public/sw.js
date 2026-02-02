// Service Worker for offline capabilities
const CACHE_NAME = 'bizflow-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
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
    event.respondWith(fetch(request));
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