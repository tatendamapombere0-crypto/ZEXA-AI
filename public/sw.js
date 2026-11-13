// public/sw.js
// ZEXA AI Service Worker for PWA Offline Caching & Automated Study Notifications

const CACHE_NAME = 'zexa-ai-v4.1.0';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/exam_manifest.json',
  '/assets/zexa_logo_icon.png',
  '/assets/zexa_favicon.png',
  '/assets/wasm/wllama.wasm'
];

// Install event: pre-cache core offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Offline-First caching strategy for assets and exam papers
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or external analytics
  if (event.request.method !== 'GET') return;

  // Let large .gguf model files bypass Cache API put() (handled cleanly by Wllama OPFS/CacheManager + HTTP Range)
  if (url.pathname.endsWith('.gguf') || event.request.headers.has('range')) {
    return;
  }

  // 1. Navigation requests: Network-first falling back to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Exam assets, JSON files, WASM, images: Cache-first with background revalidation
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.json') || url.pathname.endsWith('.wasm') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background if online
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch from network and store for offline use
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch((fetchError) => {
            // Return empty JSON fallback for failed JSON requests when completely offline
            if (url.pathname.endsWith('.json')) {
              return new Response(JSON.stringify({ error: 'offline', offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            throw fetchError;
          });
      })
    );
    return;
  }

  // 3. General static scripts & styles
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  if (data.type === 'ACTIVATE_PREMIUM') {
    targetUrl = '/?action=premium';
  } else if (data.question) {
    targetUrl = `/?question=${encodeURIComponent(data.question)}`;
  }

  // Focus existing open window or open a new window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'ZEXA_NOTIFICATION_CLICK',
            action: data.type,
            question: data.question
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Periodic sync or push if available
self.addEventListener('push', (event) => {
  let payload = {
    title: '📚 ZEXA Study Reminder',
    body: 'Have you done your study today? Let\'s begin! Tap to start your offline revision.',
    data: { type: 'STUDY_REMINDER' }
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/assets/zexa_logo_icon.png',
      badge: '/assets/zexa_favicon.png',
      data: payload.data
    })
  );
});
