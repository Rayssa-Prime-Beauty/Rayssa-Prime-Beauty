const CACHE_NAME = "lumina-v7-1-3";
const APP_SHELL = [
  "./", "./index.html", "./profile.html", "./manifest.json", "./version.json", "./css/style.css",
  "./js/config.js?v=7.1.3", "./js/products.js?v=7.1.3", "./js/state.js?v=7.1.3", "./js/app.js?v=7.1.3",
  "./assets/icons/icon-192-v6-1-8.png", "./assets/icons/icon-512-v6-1-8.png", "./assets/images/logo.png", "./assets/images/logo-mark-v6-1-8.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.indexOf("lumina-") === 0 && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Arquivos da interface sempre tentam a rede primeiro para evitar versão antiga.
  // O cache é apenas reserva para funcionamento sem internet.
  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) if ("focus" in client) return client.focus();
      return self.clients.openWindow ? self.clients.openWindow("./") : undefined;
    })
  );
});
