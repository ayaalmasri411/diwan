self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // basic bypass to allow PWA criteria
  event.respondWith(fetch(event.request));
});
