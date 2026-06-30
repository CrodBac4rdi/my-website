/* HORIZON Service Worker — handgeschrieben (Turbopack-kompatibel, kein Workbox).
   Strategie:
   - Navigationen: network-first, Fallback auf gecachte Seite, sonst /offline.
   - Bilder (TMDB/Supabase/nekos/dicebear): cache-first (Runtime-Cache, begrenzt).
   - Same-origin statische Assets (_next/static, icons): stale-while-revalidate.
   - API/Auth/Server-Actions: NICHT cachen (immer Netzwerk). */

const VERSION = 'v1';
const STATIC_CACHE = `horizon-static-${VERSION}`;
const IMAGE_CACHE = `horizon-img-${VERSION}`;
const PAGE_CACHE = `horizon-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png'];

const IMAGE_HOSTS = [
  'image.tmdb.org',
  'nekos.best',
  'api.dicebear.com',
  'phrpjjuhwvanqfzcfxxg.supabase.co',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('horizon-') && ![STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Cache begrenzen (einfaches LRU per FIFO-Trim).
async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) {
    await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
  }
}

function isImageRequest(url) {
  return IMAGE_HOSTS.includes(url.hostname) || /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Supabase REST/Auth/Realtime niemals cachen.
  if (url.hostname.endsWith('.supabase.co') && !url.pathname.startsWith('/storage/')) return;
  // Eigene API-Routen nicht cachen.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  // 1) Navigationen: network-first mit Offline-Fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, fresh.clone());
          trimCache(PAGE_CACHE, 40);
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }
      })(),
    );
    return;
  }

  // 2) Bilder: cache-first.
  if (isImageRequest(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(IMAGE_CACHE);
          cache.put(request, fresh.clone());
          trimCache(IMAGE_CACHE, 120);
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  // 3) Same-origin statische Assets: stale-while-revalidate.
  if (url.origin === self.location.origin && (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons'))) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const network = fetch(request)
          .then((fresh) => {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, fresh.clone()));
            return fresh;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

// --- Web Push (optional; aktiv sobald VAPID + Subscription vorhanden) ---
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'HORIZON', body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'HORIZON', {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
