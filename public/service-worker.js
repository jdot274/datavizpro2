// Service worker for visualization resource caching
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open('design-data-pro-resources').then(function(cache) {
      return cache.addAll([
        './public/textures/asphalt.png',
        './public/textures/grass.png',
        './public/textures/sand.jpg',
        './public/textures/sky.png',
        './public/textures/wood.jpg',
        './generated-icon.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
