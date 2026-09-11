/**
 * VadeAudio AI - Service Worker para Cache Offline & PWA
 */

const CACHE_NAME = 'vadeaudio-v7.0-fresh';
const ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/player.css',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições de API para não interceptar o backend
  if (event.request.url.includes('/api/')) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  // Network First para sempre carregar os estilos e scripts mais recentes
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/index.html');
          }
          return new Response('', { status: 408, statusText: 'Offline or Network Error' });
        });
      })
  );
});
