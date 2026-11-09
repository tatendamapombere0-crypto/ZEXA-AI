// public/sw.js
// ZEXA AI Service Worker for PWA Offline Caching & Automated Study Notifications

const CACHE_NAME = 'zexa-ai-v2.8.0';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
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
