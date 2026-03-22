const CACHE_NAME = 'smarttasks-pro-v3';
const BASE = '/task-reminder-app';
const STATIC_FILES = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = event.request.url;

  // API запросы — SW не вмешивается, всегда идёт в сеть
  const isApi = url.includes('openrouter.ai') ||
                url.includes('api.deepseek.com') ||
                url.includes('generativelanguage.googleapis.com') ||
                url.includes('api.groq.com') ||
                url.includes('/api/');
  if (isApi) return;

  // HTML — Network First: сначала сеть, кэш только при офлайне
  if (event.request.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Остальная статика — Cache First
  if (url.includes('/task-reminder-app/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        });
      })
    );
  }
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') return;
  const { title, body, tag } = event.data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body || '',
      icon: `${BASE}/icon-192x192.png`,
      badge: `${BASE}/icon-96x96.png`,
      vibrate: [300, 100, 300],
      requireInteraction: true,
      tag: tag || 'smarttasks',
      data: { url: `${BASE}/` }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || `${BASE}/`;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        for (const c of clients) {
          if (c.url.includes('/task-reminder-app/') && 'focus' in c) return c.focus();
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
