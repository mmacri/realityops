const CACHE_VERSION = "realityops-v1-2026-02-08-3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/js/router.js",
  "./assets/js/ui.js",
  "./assets/js/components.js",
  "./assets/js/palette.js",
  "./assets/js/briefing.js",
  "./assets/js/visuals.js",
  "./assets/js/lint.js",
  "./assets/js/generators.js",
  "./assets/js/storage.js",
  "./assets/js/sw-register.js",
  "./content/packs.json",
  "./content/universes.json",
  "./content/exec_memos.json",
  "./content/meeting_translator.json",
  "./content/probability_engine.json",
  "./content/npc_dialogue.json",
  "./content/incidents.json",
  "./content/tarot.json",
  "./content/microtools.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") {
    return;
  }

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match("./index.html")) || Response.error();
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then(async (res) => {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
