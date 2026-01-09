var appCacheName = "app-cache-v3";
var preCacheFiles = ["/", "/bundle.js", "/app.css", "/manifest.json", "/favicon.ico", "/logo-text.png", "/example.csv"];

console.debug("[ServiceWorker] Loaded");

self.addEventListener("install", function (e) {
  self.skipWaiting();
  console.debug("[ServiceWorker] Installing");
  e.waitUntil(
    caches.open(appCacheName).then(function (cache) {
      console.debug("[ServiceWorker] Caching");
      return cache.addAll(preCacheFiles);
    }),
  );
});

self.addEventListener("fetch", function (e) {
  console.debug("[ServiceWorker] Fetch", e.request.url);
  e.respondWith(
    caches.open(appCacheName).then(function (cache) {
      return cache.match(e.request).then(function (cachedResponse) {
        console.debug("[ServiceWorker] Cache lookup", e.request.url);
        if (cachedResponse) {
          console.debug("[ServiceWorker] Serving from cache", e.request.url);
          return cachedResponse;
        } else {
          console.debug("[ServiceWorker] Fetching from network", e.request.url);
          return fetch(e.request).then(function (response) {
            console.debug("[ServiceWorker] Updating cache", e.request.url);
            cache.put(e.request.url, response.clone());
            return response;
          });
        }
      });
    }),
  );
});
