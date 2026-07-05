// Campus Adda — Service Worker
// Handles two real, independent things:
//   1) Offline app-shell caching (install/activate/fetch)
//   2) Web Push notifications (push/notificationclick)
// Bump this on every deploy so old caches get cleared automatically.
const CACHE_NAME = 'campus-adda-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Never cache Supabase API/auth/realtime traffic — that data must always
  // be live, caching it would show stale posts/messages or break auth.
  if (request.url.includes('supabase.co')) return;

  if (request.mode === 'navigate') {
    // Network-first for the HTML shell: online users always get the latest
    // build; offline users fall back to whatever was last cached.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./')))
    );
    return;
  }

  // Stale-while-revalidate for everything else (fonts, the supabase-js CDN
  // script, images): serve instantly from cache if present, refresh in the
  // background for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// ===== REAL PUSH NOTIFICATIONS =====
// Fired by the browser/OS push service even when the app/tab is fully
// closed, as long as the device has network — this is what makes it "real"
// push instead of the old local-only Notification() test.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Campus Adda', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Campus Adda';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge,
    tag: data.tag,
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
