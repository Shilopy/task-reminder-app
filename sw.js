const CACHE_NAME = 'smarttasks-pro-v2';
const BASE = '/task-reminder-app';
const urlsToCache = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
];

// ── Установка: кэшируем файлы ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // активируемся сразу без ожидания
  );
});

// ── Активация: удаляем старые кэши ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim()) // берём контроль над всеми вкладками
  );
});

// ── Fetch: сначала кэш, потом сеть ────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Не перехватываем chrome-extension и non-GET запросы
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Кэшируем только успешные ответы с нашего домена
        if (response.ok && event.request.url.includes('/task-reminder-app/')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Офлайн-фоллбэк для навигации
      if (event.request.mode === 'navigate') {
        return caches.match(`${BASE}/index.html`);
      }
    })
  );
});

// ── Показ уведомления от polling (вкладка в фоне) ─────────────────────────
// Основной канал: страница сама показывает оверлей через polling.
// SW нужен только когда вкладка ПОЛНОСТЬЮ закрыта — но тогда
// нет polling. Поэтому SW слушает сообщения от страницы.
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body || '',
        icon: `${BASE}/icon-192x192.png`,
        badge: `${BASE}/icon-96x96.png`,
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true,
        tag: tag || 'smarttasks',
        data: { url: `${BASE}/` }
      })
    );
  }
});

// ── Клик по уведомлению → открываем/фокусируем вкладку ───────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : `${BASE}/`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Если вкладка уже открыта — фокусируем её
        for (const client of clients) {
          if (client.url.includes('/task-reminder-app/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Иначе открываем новую
        return self.clients.openWindow(targetUrl);
      })
  );
});
