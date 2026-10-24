var CACHE_NAME = "firestop-finder-v11";

// Data/icons: large or rarely-changing, safe to precache at install and
// serve cache-first (with background revalidation).
var DATA_ASSETS = [
  "data/systems.json",
  "data/products.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "vendor/supabase.js",
];

// App shell: always served network-first (falling back to cache only when
// offline) so a code update is never stuck behind a stale cached copy that
// was baked in during a slow/propagating deploy.
var SHELL_NAMES = ["index.html", "app.js", "styles.css", "i18n.js", "db.js", "manifest.json", "team.js", "team-app.js", "equipo.js"];

function isShellRequest(request) {
  if (request.mode === "navigate") return true;
  var name = new URL(request.url).pathname.split("/").pop();
  return name === "" || SHELL_NAMES.indexOf(name) !== -1;
}

self.addEventListener("install", function (event) {
  // Fetch each asset with cache:"reload" so install always talks to the
  // network, never reusing a stale entry from the browser's own HTTP cache
  // (cache.addAll's default fetch can otherwise bake in an old file).
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        DATA_ASSETS.map(function (url) {
          return fetch(url, { cache: "reload" }).then(function (response) {
            if (response && response.ok) return cache.put(url, response);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var request = event.request;
  // Never cache other sites (the team server, signed file links): the app
  // keeps its own offline copies of drawings and lists.
  if (new URL(request.url).origin !== self.location.origin) return;

  if (isShellRequest(request)) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
          }
          return response;
        })
        .catch(function () { return caches.match(request); })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request, { cache: "reload" })
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
          }
          return response;
        })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});
