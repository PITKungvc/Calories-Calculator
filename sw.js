// Kalguroo Service Worker - Enables PWA Standalone Fullscreen Mode
const CACHE_NAME = 'kalguroo-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch for dynamic API & static assets
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
