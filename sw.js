const CACHE = 'hvr-halloween-4';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './sw.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(FILES);
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(function (cache) {
    return fetch(event.request.url, { cache: 'no-store', credentials: 'same-origin', redirect: 'follow' }).then(function (res) {
      if (res && res.ok) cache.put(event.request, res.clone()).catch(function () {});
      return res;
    }).catch(function () {
      return cache.match(event.request).then(function (hit) {
        if (hit) return hit;
        if (event.request.mode === 'navigate') return cache.match('./index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    });
  }));
});
