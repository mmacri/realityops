# RealityOps Deliverable

## Repo Tree
```text
Folder PATH listing for volume OS
Volume serial number is 00000009 E6F2:0BE9
C:.
�   .gitattributes
�   404.html
�   index.html
�   manifest.webmanifest
�   sw.js
�   
+---assets
�   +---css
�   �       style.css
�   �       
�   +---js
�           app.js
�           generators.js
�           router.js
�           storage.js
�           sw-register.js
�           ui.js
�           
+---content
        exec_memos.json
        incidents.json
        meeting_translator.json
        microtools.json
        npc_dialogue.json
        packs.json
        probability_engine.json
        tarot.json
        universes.json
        
```

FILE: index.html
```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="description" content="RealityOps — Over-Engineered Multiverse Control Room" />
  <meta name="theme-color" content="#0d121b" />
  <title>RealityOps — Over-Engineered Multiverse Control Room</title>
  <link rel="manifest" href="./manifest.webmanifest" />
  <link rel="stylesheet" href="./assets/css/style.css" />
</head>
<body>
  <canvas id="bg-canvas" aria-hidden="true"></canvas>
  <div class="noise" aria-hidden="true"></div>

  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#/" aria-label="RealityOps Dashboard">
        <span class="brand-mark">RO</span>
        <span class="brand-text">
          <strong>RealityOps</strong>
          <small>Over-Engineered Multiverse Control Room</small>
        </span>
      </a>

      <nav class="topnav" aria-label="Primary">
        <a href="#/">Dashboard</a>
        <a href="#/tools">Tools</a>
        <a href="#/packs">Packs</a>
        <a href="#/vault">Vault</a>
        <a href="#/tool/museum">Museum</a>
        <a href="#/about">About</a>
      </nav>

      <div class="top-actions">
        <button id="new-patch-btn" class="btn btn-ghost" aria-label="Generate New Patch">New Patch</button>
        <label class="chaos-toggle" for="chaos-toggle-input" aria-label="Toggle Chaos Mode">
          <input id="chaos-toggle-input" type="checkbox" />
          <span>Chaos Mode</span>
        </label>
      </div>
    </header>

    <div class="layout">
      <aside class="status-rail" id="status-rail" aria-label="Reality Status"></aside>
      <main class="stage" id="app-main" tabindex="-1"></main>
    </div>
  </div>

  <div id="modal-root"></div>

  <noscript>
    <div class="noscript">RealityOps needs JavaScript to pilot this timeline.</div>
  </noscript>

  <script type="module" src="./assets/js/app.js"></script>
</body>
</html>

```

FILE: 404.html
```
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>RealityOps Redirect</title>
</head>
<body>
  <p>Redirecting to RealityOps...</p>
  <script>
    (function () {
      var path = window.location.pathname;
      var base = path.replace(/[^/]*$/, "");
      var route = "/";
      if (path && !path.endsWith("/404.html")) {
        var segments = path.split("/").filter(Boolean);
        if (segments.length > 1) {
          route = "/" + segments.slice(1).join("/");
        }
      }
      var target = window.location.origin + base + "index.html#" + route + (window.location.search || "");
      window.location.replace(target);
    })();
  </script>
</body>
</html>

```

FILE: manifest.webmanifest
```
{
  "name": "RealityOps — Over-Engineered Multiverse Control Room",
  "short_name": "RealityOps",
  "description": "Enterprise control room satire with seeded generators and offline packs.",
  "start_url": "./index.html#/",
  "display": "standalone",
  "background_color": "#0d121b",
  "theme_color": "#0d121b",
  "lang": "en",
  "icons": []
}

```

FILE: sw.js
```
const CACHE_VERSION = "realityops-v1-2026-02-08-2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/js/router.js",
  "./assets/js/ui.js",
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

```

FILE: assets/css/style.css
```
:root {
  --theme-accent: #43c59e;
  --theme-accent2: #f8b86d;
  --theme-bg1: #0d121b;
  --theme-bg2: #161d2b;
  --accent: var(--theme-accent);
  --accent-2: var(--theme-accent2);
  --bg-1: var(--theme-bg1);
  --bg-2: var(--theme-bg2);
  --panel: rgba(15, 21, 34, 0.86);
  --panel-strong: rgba(11, 16, 27, 0.95);
  --line: rgba(175, 206, 214, 0.2);
  --text: #eef4f2;
  --muted: #acc0be;
  --good: #72d38b;
  --warn: #ffcc69;
  --bad: #ff7d78;
  --focus: #ffffff;
  --radius: 12px;
  --shadow: 0 14px 35px rgba(0, 0, 0, 0.35);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  background: radial-gradient(circle at 12% 12%, #1f2838 0%, var(--bg-1) 48%, #080b10 100%);
  color: var(--text);
  font-family: "Trebuchet MS", "Gill Sans", "Segoe UI", sans-serif;
  letter-spacing: 0.015em;
  position: relative;
  overflow-x: hidden;
}

body.chaos {
  --panel: rgba(26, 15, 20, 0.86);
  --panel-strong: rgba(21, 10, 15, 0.95);
  --line: rgba(255, 148, 117, 0.3);
}

#bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
}

.noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -2;
  opacity: 0.09;
  background-image: radial-gradient(rgba(255, 255, 255, 0.45) 0.6px, transparent 0.6px);
  background-size: 2px 2px;
  mix-blend-mode: soft-light;
}

a {
  color: inherit;
}

button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

button,
input[type="checkbox"],
a,
textarea,
input[type="text"],
input[type="number"] {
  outline: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15), 0 0 0 5px color-mix(in srgb, var(--accent) 75%, white 25%);
  border-radius: 10px;
}

.app-shell {
  width: min(1440px, 96vw);
  margin: 1rem auto 2rem;
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  background: linear-gradient(120deg, rgba(12, 18, 30, 0.88), rgba(18, 25, 39, 0.72));
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(6px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-family: "Consolas", "Lucida Console", monospace;
  font-weight: 700;
  color: #04120c;
  background: linear-gradient(140deg, var(--accent), var(--accent-2));
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text strong {
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.brand-text small {
  color: var(--muted);
  font-size: 0.72rem;
}

.topnav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}

.topnav a {
  text-decoration: none;
  padding: 0.45rem 0.7rem;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--muted);
}

.topnav a.active,
.topnav a:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 50%, var(--line) 50%);
  background: rgba(255, 255, 255, 0.04);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.chaos-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  user-select: none;
}

.chaos-toggle input {
  width: 1rem;
  height: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.status-rail,
.stage {
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(5px);
}

.status-rail {
  padding: 1rem;
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow: auto;
}

.stage {
  padding: 1.1rem;
  min-height: 70vh;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}

.page-head h1 {
  margin: 0;
  font-size: 1.32rem;
  letter-spacing: 0.03em;
}

.page-head p {
  margin: 0.35rem 0 0;
  color: var(--muted);
}

.card-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: rgba(8, 12, 20, 0.57);
  padding: 0.9rem;
}

.card h3,
.card h4 {
  margin: 0 0 0.45rem;
}

.card p,
.card li,
.card dd,
.card dt {
  color: #dce7e5;
}

.muted {
  color: var(--muted);
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.8rem;
}

.btn {
  border: 1px solid var(--line);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
}

.btn:hover {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--line) 45%);
}

.btn-primary {
  background: linear-gradient(125deg, color-mix(in srgb, var(--accent) 60%, #111 40%), color-mix(in srgb, var(--accent-2) 70%, #111 30%));
  border-color: transparent;
  color: #101722;
  font-weight: 700;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.03);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 0.74rem;
  color: var(--muted);
}

.badge.good {
  border-color: rgba(114, 211, 139, 0.4);
  color: var(--good);
}

.badge.warn {
  border-color: rgba(255, 204, 105, 0.5);
  color: var(--warn);
}

.badge.bad {
  border-color: rgba(255, 125, 120, 0.5);
  color: var(--bad);
}

.tool-layout {
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr;
  gap: 0.9rem;
}

.tool-panel,
.output-panel {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel-strong);
  padding: 0.9rem;
}

.tool-panel h3,
.output-panel h3 {
  margin-top: 0;
}

label {
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 600;
  font-size: 0.92rem;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text);
  padding: 0.55rem 0.6rem;
}

textarea {
  resize: vertical;
  min-height: 108px;
}

pre,
.code-block {
  margin: 0;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.26);
  font-family: "Consolas", "Lucida Console", monospace;
  white-space: pre-wrap;
  line-height: 1.35;
  font-size: 0.9rem;
}

.poster-wrap {
  margin-top: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.22);
}

.poster-wrap svg {
  width: 100%;
  height: auto;
  display: block;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.timeline li {
  padding: 0.25rem 0 0.45rem 0.8rem;
  position: relative;
}

.timeline li::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  position: absolute;
  left: -5px;
  top: 0.55rem;
}

.kv {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 0.4rem 0.7rem;
  margin: 0;
}

.kv dt {
  color: var(--muted);
}

.kv dd {
  margin: 0;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.8rem;
}

hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 0.85rem 0;
}

.tools-list {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.tool-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.85rem;
  background: rgba(11, 16, 26, 0.74);
}

.tool-card .tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.45rem;
}

.tool-card .tag {
  font-size: 0.72rem;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.12rem 0.45rem;
}

.vault-item,
.pack-item {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.75rem;
  background: rgba(9, 14, 24, 0.68);
  margin-bottom: 0.65rem;
}

.vault-item h4,
.pack-item h4 {
  margin: 0 0 0.35rem;
}

.inline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.museum-grid {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.museum-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: rgba(9, 14, 24, 0.7);
}

.museum-card .card-body {
  padding: 0.65rem;
}

.museum-card .poster-thumb {
  border-bottom: 1px solid var(--line);
  min-height: 120px;
}

#modal-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  pointer-events: auto;
  padding: 1rem;
}

.modal {
  width: min(920px, 96vw);
  max-height: 92vh;
  overflow: auto;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #0c121c;
  padding: 1rem;
}

.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.78);
  border: 1px solid var(--line);
  color: var(--text);
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  z-index: 10;
}

.stat-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.stat-item {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
}

.stat-item strong {
  display: block;
  font-size: 0.84rem;
  color: var(--muted);
}

.stat-item span {
  font-family: "Consolas", "Lucida Console", monospace;
  font-size: 0.95rem;
}

.noscript {
  margin: 2rem auto;
  width: min(720px, 90vw);
  border: 1px solid #995;
  background: #221;
  color: #ffd;
  padding: 0.8rem;
  border-radius: 10px;
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .status-rail {
    position: relative;
    top: auto;
    max-height: none;
  }

  .tool-layout {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .top-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .app-shell {
    width: 98vw;
    margin-top: 0.6rem;
  }

  .topnav {
    justify-content: flex-start;
  }

  .page-head {
    flex-direction: column;
  }
}

```

FILE: assets/js/app.js
```
import { createGeneratorEngine } from "./generators.js";
import { initRouter } from "./router.js";
import { createUI } from "./ui.js";
import { registerServiceWorker } from "./sw-register.js";

async function boot() {
  try {
    const engine = await createGeneratorEngine();
    const ui = createUI(engine);
    initRouter((route) => ui.renderRoute(route));
    registerServiceWorker();
  } catch (error) {
    const main = document.getElementById("app-main");
    if (main) {
      main.innerHTML = `
        <section class="card">
          <h2>Boot Failure</h2>
          <p>RealityOps could not start. Check that content packs are present and valid JSON.</p>
          <pre>${String(error?.stack || error)}</pre>
        </section>
      `;
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

boot();

```

FILE: assets/js/router.js
```
const KNOWN_ROUTES = new Set([
  "/",
  "/tools",
  "/tool/universe",
  "/tool/memo",
  "/tool/translator",
  "/tool/probability",
  "/tool/npc",
  "/tool/incidents",
  "/tool/tarot",
  "/tool/museum",
  "/packs",
  "/vault",
  "/about"
]);

function normalizePath(pathname) {
  let path = pathname || "/";
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  path = path.replace(/\/+$/, "");
  return path || "/";
}

function parseHash(hashText) {
  const hash = (hashText || "#/").replace(/^#/, "");
  const [rawPath, rawQuery = ""] = hash.split("?");
  const path = normalizePath(rawPath || "/");
  const params = Object.fromEntries(new URLSearchParams(rawQuery));
  return {
    path: KNOWN_ROUTES.has(path) ? path : "/about",
    rawPath: path,
    params
  };
}

export function getCurrentRoute() {
  return parseHash(window.location.hash);
}

export function buildHash(path, params = {}) {
  const route = normalizePath(path);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, String(v));
    }
  });
  const suffix = query.toString();
  return `#${route}${suffix ? `?${suffix}` : ""}`;
}

export function navigate(path, params = {}) {
  window.location.hash = buildHash(path, params);
}

export function initRouter(onRoute) {
  const run = () => onRoute(getCurrentRoute());
  window.addEventListener("hashchange", run);
  run();
}

export function allRoutes() {
  return [...KNOWN_ROUTES];
}

```

FILE: assets/js/ui.js
```

import { buildHash, navigate } from "./router.js";
import {
  addFavorite,
  addHistory,
  exportVault,
  getChaosMode,
  getFavorites,
  getHistory,
  removeFavorite,
  setChaosMode
} from "./storage.js";

function hashId(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function html(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatWhen(isoText) {
  const d = new Date(isoText);
  if (Number.isNaN(d.getTime())) {
    return isoText;
  }
  return d.toLocaleString();
}

function miniSeedRng(seed) {
  let t = Number(seed) || 1;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function createUI(engine) {
  const main = document.getElementById("app-main");
  const rail = document.getElementById("status-rail");
  const modalRoot = document.getElementById("modal-root");
  const chaosInput = document.getElementById("chaos-toggle-input");
  const newPatchBtn = document.getElementById("new-patch-btn");

  if (!main || !rail || !modalRoot || !chaosInput || !newPatchBtn) {
    throw new Error("Missing layout elements.");
  }

  const state = {
    chaosMode: getChaosMode(),
    currentRoute: "/",
    currentParams: {},
    currentEntry: null,
    actions: { generate: null, copy: null, favorite: null },
    background: { raf: null, resizeBound: false }
  };

  function setThemeFromUniverse(universeResult) {
    if (!universeResult?.theme) {
      return;
    }
    document.documentElement.style.setProperty("--theme-accent", universeResult.theme.accent);
    document.documentElement.style.setProperty("--theme-accent2", universeResult.theme.accent2);
    document.documentElement.style.setProperty("--theme-bg1", universeResult.theme.bg);
    if (universeResult.theme.bg2) {
      document.documentElement.style.setProperty("--theme-bg2", universeResult.theme.bg2);
    }
  }

  function applyChaosMode(enabled) {
    document.body.classList.toggle("chaos", Boolean(enabled));
    chaosInput.checked = Boolean(enabled);
  }

  function showToast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 1900);
  }

  async function copyText(value, successMessage = "Copied") {
    try {
      await navigator.clipboard.writeText(value);
      showToast(successMessage);
    } catch {
      showToast("Clipboard blocked. Try manual copy.");
    }
  }

  function fullShareLink(hash) {
    const path = window.location.pathname.endsWith("/index.html")
      ? window.location.pathname.replace(/index\.html$/, "")
      : window.location.pathname;
    return `${window.location.origin}${path}${hash}`;
  }

  function registerCurrentOutput({ tool, route, params, title, summary, text, posterSvg, payload, type }) {
    const seed = params.seed ?? payload?.seed;
    const shareHash = buildHash(route, params);
    const entry = {
      id: `${tool}_${hashId([tool, payload?.signature || summary || title, seed])}`,
      tool,
      type: type || tool,
      seed,
      title,
      summary,
      text,
      posterSvg: posterSvg || "",
      shareHash,
      shareLink: fullShareLink(shareHash),
      payload
    };
    addHistory(entry);
    state.currentEntry = entry;
    renderStatusRail();
  }

  function favoriteCurrent() {
    if (!state.currentEntry) {
      showToast("Generate an output first.");
      return;
    }
    addFavorite(state.currentEntry);
    renderStatusRail();
    showToast("Saved to favorites.");
  }

  function setActions(actions = {}) {
    state.actions = {
      generate: actions.generate || null,
      copy: actions.copy || null,
      favorite: actions.favorite || null
    };
  }

  function resolveChaos(params = {}) {
    if (params.chaos === "1") {
      return true;
    }
    if (params.chaos === "0") {
      return false;
    }
    return state.chaosMode;
  }

  function withChaos(params, chaos) {
    return {
      ...params,
      chaos: chaos ? 1 : 0
    };
  }

  function activeNav(path) {
    const links = document.querySelectorAll(".topnav a");
    links.forEach((a) => {
      const target = (a.getAttribute("href") || "").replace(/^#/, "");
      const isActive =
        target === path ||
        (target === "/tools" && path.startsWith("/tool/") && path !== "/tool/museum") ||
        (target === "/tool/museum" && path === "/tool/museum");
      a.classList.toggle("active", isActive);
    });
  }

  function renderStatusRail() {
    const statuses = engine.getDailyStatus({ chaosMode: state.chaosMode });
    const favorites = getFavorites();
    const history = getHistory();

    rail.innerHTML = `
      <div class="page-head"><div><h1>Reality Status</h1><p>Daily telemetry from your local multiverse node.</p></div></div>
      <div class="inline-meta">
        <span class="badge">Daily Seed: ${engine.dailySeed()}</span>
        <span class="badge ${state.chaosMode ? "warn" : "good"}">${state.chaosMode ? "Chaos" : "Calm"}</span>
      </div>
      <ul class="stat-list">
        ${statuses.map((s) => `<li class="stat-item"><strong>${html(s.label)}</strong><span>${html(s.value)}</span></li>`).join("")}
      </ul>
      <hr />
      <p class="muted"><strong>Vault</strong></p>
      <p class="muted">Favorites: ${favorites.length} | History: ${history.length}</p>
      <p class="muted">Keyboard: <code>G</code> generate, <code>C</code> copy, <code>F</code> favorite.</p>
    `;
  }

  function renderDashboard() {
    const daily = engine.generateDailyBundle({ chaosMode: state.chaosMode });
    const tools = engine.getToolCatalog().filter((tool) => tool.active);
    const toolOfDay = tools[daily.seed % tools.length];

    main.innerHTML = `
      <section class="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Daily reality patching for ${html(daily.date)}. Outputs are deterministic from your local date seed.</p>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="dash-new-patch" aria-label="Create a new universe patch">New Patch</button>
          <a class="btn" href="#/tools">Open Tools</a>
        </div>
      </section>
      <section class="card-grid">
        <article class="card"><h3>Daily Reality Patch</h3><p><span class="badge">${html(daily.universe.tone)}</span> ${html(daily.universe.tagline)}</p><p>${html(daily.universe.headline)}</p><p class="muted">Law: ${html(daily.universe.law)}</p><a class="btn" href="${buildHash("/tool/universe", withChaos({ seed: daily.universe.seed }, state.chaosMode))}">Open Universe Forge</a></article>
        <article class="card"><h3>Tool of the Day</h3><p><strong>${html(toolOfDay.name)}</strong></p><p>${html(toolOfDay.description)}</p><a class="btn" href="#${toolOfDay.route}">Launch Tool</a></article>
        <article class="card"><h3>Today's Incident</h3><p><span class="badge ${daily.incident.severity === "SEV-1" ? "bad" : daily.incident.severity === "SEV-2" ? "warn" : "good"}">${html(daily.incident.severity)}</span> ${html(daily.incident.id)}</p><p>${html(daily.incident.title)}</p><a class="btn" href="${buildHash("/tool/incidents", withChaos({ seed: daily.incident.seed }, state.chaosMode))}">Open Incident Theater</a></article>
        <article class="card"><h3>Daily Memo Excerpt</h3><p><strong>${html(daily.memo.subject)}</strong></p><p>${html(daily.memo.rationales[0])}</p><a class="btn" href="${buildHash("/tool/memo", withChaos({ seed: daily.memo.seed, q: daily.memo.topic }, state.chaosMode))}">Open Memo Generator</a></article>
        <article class="card"><h3>Daily Tarot Card</h3><p><strong>${html(daily.tarot.cards[0].name)}</strong> (${html(daily.tarot.cards[0].orientation)})</p><p>${html(daily.tarot.cards[0].meaning)}</p><a class="btn" href="${buildHash("/tool/tarot", withChaos({ seed: daily.tarot.seed, mode: "single", rev: 1 }, state.chaosMode))}">Open Tarot</a></article>
        <article class="card"><h3>Daily Probability</h3><p><span class="badge ${daily.probability.band === "RED" ? "bad" : daily.probability.band === "YELLOW" ? "warn" : "good"}">${html(daily.probability.band)}</span> <strong>${daily.probability.score}</strong></p><p>${html(daily.probability.scenario)}</p><a class="btn" href="${buildHash("/tool/probability", withChaos({ seed: daily.probability.seed, s: daily.probability.scenario }, state.chaosMode))}">Open Probability Engine</a></article>
        <article class="card"><h3>Daily NPC Snippet</h3><p><strong>${html(daily.npc.npc.name)}</strong> · ${html(daily.npc.npc.role)}</p><p>${html(daily.npc.opener)}</p><a class="btn" href="${buildHash("/tool/npc", withChaos({ seed: daily.npc.seed, q: daily.npc.request }, state.chaosMode))}">Open NPC Hotline</a></article>
      </section>
    `;

    document.getElementById("dash-new-patch")?.addEventListener("click", () => {
      const fresh = engine.generateUniverse({
        seed: engine.randomSeed(),
        chaosMode: state.chaosMode,
        enforceUnseen: true
      });
      navigate("/tool/universe", withChaos({ seed: fresh.seed }, state.chaosMode));
    });

    setActions();
  }

  function renderToolsIndex() {
    const tools = engine.getToolCatalog();
    main.innerHTML = `
      <section class="page-head"><div><h1>Tools</h1><p>Every module runs fully client-side from static JSON packs.</p></div></section>
      <section class="tools-list">
        ${tools
          .map(
            (tool) => `
            <article class="tool-card">
              <h3>${html(tool.name)}</h3>
              <p>${html(tool.description)}</p>
              <div class="tags">${tool.tags.map((tag) => `<span class="tag">${html(tag)}</span>`).join("")}</div>
              <div class="btn-row">${tool.active ? `<a class="btn" href="#${tool.route}">Open</a>` : `<span class="badge">Upcoming</span>`}</div>
            </article>
          `
          )
          .join("")}
      </section>
    `;
    setActions();
  }

  function universeText(result) {
    return [
      `Theme: ${result.theme.name}`,
      `Tone: ${result.tone} // ${result.tagline}`,
      `Rule: ${result.rule}`,
      `Law: ${result.law}`,
      `Headline: ${result.headline}`,
      "Patch Notes:",
      ...result.patchNotes.map((line) => `- ${line}`)
    ].join("\n");
  }

  function renderUniverse(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 101;
    const chaos = resolveChaos(params);
    const result = engine.generateUniverse({ seed, chaosMode: chaos });
    setThemeFromUniverse(result);

    main.innerHTML = `
      <section class="page-head"><div><h1>Universe Forge</h1><p>Compile a new operational reality profile. Theme variables update from each generated universe.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="u-seed">Seed</label>
          <input id="u-seed" type="number" value="${result.seed}" aria-label="Universe seed" />
          <div class="btn-row">
            <button class="btn btn-primary" id="u-next" aria-label="Generate next seed">Next Seed</button>
            <button class="btn" id="u-random" aria-label="Generate random seed">Random Seed</button>
            <button class="btn" id="u-copy" aria-label="Copy universe output">Copy Output</button>
            <button class="btn" id="u-copy-link" aria-label="Copy share link">Copy Share Link</button>
            <button class="btn" id="u-fav" aria-label="Favorite universe">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${html(result.headline)}</h3>
          <p><span class="badge">${html(result.theme.name)}</span> <span class="badge">${html(result.tone)}</span></p>
          <p>${html(result.tagline)}</p>
          <dl class="kv"><dt>Reality Rule</dt><dd>${html(result.rule)}</dd><dt>Law</dt><dd>${html(result.law)}</dd></dl>
          <hr />
          <h4>Patch Notes</h4>
          <ul>${result.patchNotes.map((note) => `<li>${html(note)}</li>`).join("")}</ul>
          <div class="poster-wrap">${result.posterSvg}</div>
        </div>
      </section>
    `;

    const outputText = universeText(result);
    registerCurrentOutput({
      tool: "universe",
      route: "/tool/universe",
      params: withChaos({ seed: result.seed }, chaos),
      title: result.headline,
      summary: `${result.tone} // ${result.tagline}`,
      text: outputText,
      posterSvg: result.posterSvg,
      payload: result,
      type: "universe"
    });

    const nextGenerate = () => {
      const next = engine.generateUniverse({
        seed: engine.nextSeed(Number(document.getElementById("u-seed")?.value || result.seed)),
        chaosMode: chaos,
        enforceUnseen: true
      });
      navigate("/tool/universe", withChaos({ seed: next.seed }, chaos));
    };

    document.getElementById("u-next")?.addEventListener("click", nextGenerate);
    document.getElementById("u-random")?.addEventListener("click", () => {
      const next = engine.generateUniverse({ seed: engine.randomSeed(), chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/universe", withChaos({ seed: next.seed }, chaos));
    });
    document.getElementById("u-copy")?.addEventListener("click", () => copyText(outputText, "Universe copied."));
    document.getElementById("u-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("u-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: nextGenerate, copy: () => copyText(outputText, "Universe copied."), favorite: favoriteCurrent });
  }

  function memoText(result) {
    return result.text;
  }

  function renderMemo(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 203;
    const topic = params.q || "";
    const chaos = resolveChaos(params);
    const result = engine.generateMemo({ seed, topic, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Exec Memo Generator</h1><p>Create a fully formatted executive memo that sounds expensive and unavoidable.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="m-seed">Seed</label>
          <input id="m-seed" type="number" value="${result.seed}" aria-label="Memo seed" />
          <label for="m-topic">What are you justifying?</label>
          <input id="m-topic" type="text" value="${html(result.topic)}" aria-label="Memo topic" />
          <div class="btn-row">
            <button class="btn btn-primary" id="m-generate" aria-label="Generate memo">Generate</button>
            <button class="btn" id="m-random" aria-label="Random memo seed">Random Seed</button>
            <button class="btn" id="m-copy" aria-label="Copy memo">Copy</button>
            <button class="btn" id="m-copy-link" aria-label="Copy memo share link">Copy Share Link</button>
            <button class="btn" id="m-fav" aria-label="Favorite memo">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${html(result.subject)}</h3>
          <p class="muted">Date: ${html(result.date)}</p>
          <pre>${html(memoText(result))}</pre>
        </div>
      </section>
    `;

    const makeParams = () => ({
      seed: Number(document.getElementById("m-seed")?.value || result.seed),
      q: String(document.getElementById("m-topic")?.value || "").trim(),
      chaos: chaos ? 1 : 0
    });

    const text = memoText(result);
    registerCurrentOutput({
      tool: "memo",
      route: "/tool/memo",
      params: withChaos({ seed: result.seed, q: result.topic }, chaos),
      title: result.subject,
      summary: result.rationales[0],
      text,
      payload: result,
      type: "memo"
    });

    const generateSameSeed = () => navigate("/tool/memo", makeParams());
    document.getElementById("m-generate")?.addEventListener("click", generateSameSeed);
    document.getElementById("m-random")?.addEventListener("click", () => {
      const p = makeParams();
      const next = engine.generateMemo({ seed: engine.randomSeed(), topic: p.q, chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/memo", withChaos({ seed: next.seed, q: p.q }, chaos));
    });
    document.getElementById("m-copy")?.addEventListener("click", () => copyText(text, "Memo copied."));
    document.getElementById("m-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("m-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: generateSameSeed, copy: () => copyText(text, "Memo copied."), favorite: favoriteCurrent });
  }

  function renderTranslator(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 307;
    const textParam = params.text || "";
    const chaos = resolveChaos(params);
    const result = engine.generateTranslation({ seed, inputText: textParam, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Meeting Translator</h1><p>Convert corporate language into plain intent and survival guidance.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="t-seed">Seed</label>
          <input id="t-seed" type="number" value="${result.seed}" aria-label="Translator seed" />
          <label for="t-input">Meeting Notes</label>
          <textarea id="t-input" aria-label="Meeting notes">${html(result.lines.join("\n"))}</textarea>
          <div class="btn-row">
            <button class="btn btn-primary" id="t-generate" aria-label="Translate lines">Translate</button>
            <button class="btn" id="t-random" aria-label="Random translation seed">Random Seed</button>
            <button class="btn" id="t-copy" aria-label="Copy translation">Copy</button>
            <button class="btn" id="t-copy-link" aria-label="Copy translation share link">Copy Share Link</button>
            <button class="btn" id="t-fav" aria-label="Favorite translation">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>Translation Summary</h3>
          <p>${html(result.summary)}</p>
          <hr />
          <ul>${result.translations.map((line) => `<li><strong>${html(line.line)}</strong><br /><span class="muted">${html(line.meaning)}</span></li>`).join("")}</ul>
        </div>
      </section>
    `;

    const makeParams = () => ({
      seed: Number(document.getElementById("t-seed")?.value || result.seed),
      text: String(document.getElementById("t-input")?.value || "").trim(),
      chaos: chaos ? 1 : 0
    });

    const outputText = result.text;
    registerCurrentOutput({
      tool: "translator",
      route: "/tool/translator",
      params: withChaos({ seed: result.seed, text: result.lines.join("\n") }, chaos),
      title: "Meeting Translation",
      summary: result.summary,
      text: outputText,
      payload: result,
      type: "translator"
    });

    const regenerate = () => navigate("/tool/translator", makeParams());
    document.getElementById("t-generate")?.addEventListener("click", regenerate);
    document.getElementById("t-random")?.addEventListener("click", () => {
      const p = makeParams();
      const next = engine.generateTranslation({ seed: engine.randomSeed(), inputText: p.text, chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/translator", withChaos({ seed: next.seed, text: p.text }, chaos));
    });
    document.getElementById("t-copy")?.addEventListener("click", () => copyText(outputText, "Translation copied."));
    document.getElementById("t-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("t-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: regenerate, copy: () => copyText(outputText, "Translation copied."), favorite: favoriteCurrent });
  }

  function probabilityText(result) {
    return result.text;
  }

  function renderProbability(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 409;
    const scenario = params.s || "";
    const chaos = resolveChaos(params);
    const result = engine.generateProbability({ seed, scenario, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Probability Engine</h1><p>Assess plausible disaster at board-ready confidence levels.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="p-seed">Seed</label>
          <input id="p-seed" type="number" value="${result.seed}" aria-label="Probability seed" />
          <label for="p-scenario">Scenario</label>
          <input id="p-scenario" type="text" value="${html(result.scenario)}" aria-label="Scenario" />
          <div class="btn-row">
            <button class="btn btn-primary" id="p-assess" aria-label="Assess probability">Assess</button>
            <button class="btn" id="p-random" aria-label="Random probability seed">Random Seed</button>
            <button class="btn" id="p-copy" aria-label="Copy probability output">Copy</button>
            <button class="btn" id="p-copy-link" aria-label="Copy probability share link">Copy Share Link</button>
            <button class="btn" id="p-fav" aria-label="Favorite probability result">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${html(result.scenario)}</h3>
          <p><span class="badge ${result.band === "RED" ? "bad" : result.band === "YELLOW" ? "warn" : "good"}">${html(result.band)}</span> <strong>${result.score}</strong></p>
          <p>${html(result.explanation)}</p>
          <h4>Controls</h4><ul>${result.controls.map((line) => `<li>${html(line)}</li>`).join("")}</ul>
        </div>
      </section>
    `;

    const makeParams = () => ({
      seed: Number(document.getElementById("p-seed")?.value || result.seed),
      s: String(document.getElementById("p-scenario")?.value || "").trim(),
      chaos: chaos ? 1 : 0
    });

    const text = probabilityText(result);
    registerCurrentOutput({
      tool: "probability",
      route: "/tool/probability",
      params: withChaos({ seed: result.seed, s: result.scenario }, chaos),
      title: `${result.band} ${result.score}`,
      summary: result.scenario,
      text,
      payload: result,
      type: "probability"
    });

    const regen = () => navigate("/tool/probability", makeParams());
    document.getElementById("p-assess")?.addEventListener("click", regen);
    document.getElementById("p-random")?.addEventListener("click", () => {
      const p = makeParams();
      const next = engine.generateProbability({ seed: engine.randomSeed(), scenario: p.s, chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/probability", withChaos({ seed: next.seed, s: p.s }, chaos));
    });
    document.getElementById("p-copy")?.addEventListener("click", () => copyText(text, "Probability report copied."));
    document.getElementById("p-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("p-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: regen, copy: () => copyText(text, "Probability report copied."), favorite: favoriteCurrent });
  }

  function npcText(result) {
    return result.text;
  }

  function renderNpc(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 503;
    const req = params.q || "";
    const chaos = resolveChaos(params);
    const result = engine.generateNpc({ seed, request: req, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>NPC Hotline</h1><p>Summon a specialist with suspicious confidence and a very specific side quest.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="n-seed">Seed</label>
          <input id="n-seed" type="number" value="${result.seed}" aria-label="NPC seed" />
          <label for="n-request">Request</label>
          <input id="n-request" type="text" value="${html(result.request)}" aria-label="NPC request" />
          <div class="btn-row">
            <button class="btn btn-primary" id="n-summon" aria-label="Summon NPC">Summon</button>
            <button class="btn" id="n-random" aria-label="Random NPC seed">Random Seed</button>
            <button class="btn" id="n-copy" aria-label="Copy NPC output">Copy</button>
            <button class="btn" id="n-copy-link" aria-label="Copy NPC share link">Copy Share Link</button>
            <button class="btn" id="n-fav" aria-label="Favorite NPC output">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${html(result.npc.name)} <span class="muted">(${html(result.npc.role)})</span></h3>
          <p>${html(result.opener)}</p>
          <dl class="kv"><dt>Mission</dt><dd>${html(result.mission)}</dd><dt>Constraint</dt><dd>${html(result.constraint)}</dd><dt>Reward</dt><dd>${html(result.reward)}</dd><dt>Hint</dt><dd>${html(result.hint)}</dd></dl>
        </div>
      </section>
    `;

    const makeParams = () => ({
      seed: Number(document.getElementById("n-seed")?.value || result.seed),
      q: String(document.getElementById("n-request")?.value || "").trim(),
      chaos: chaos ? 1 : 0
    });

    const text = npcText(result);
    registerCurrentOutput({
      tool: "npc",
      route: "/tool/npc",
      params: withChaos({ seed: result.seed, q: result.request }, chaos),
      title: `${result.npc.name} // ${result.npc.role}`,
      summary: result.mission,
      text,
      payload: result,
      type: "npc"
    });

    const summon = () => navigate("/tool/npc", makeParams());
    document.getElementById("n-summon")?.addEventListener("click", summon);
    document.getElementById("n-random")?.addEventListener("click", () => {
      const p = makeParams();
      const next = engine.generateNpc({ seed: engine.randomSeed(), request: p.q, chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/npc", withChaos({ seed: next.seed, q: p.q }, chaos));
    });
    document.getElementById("n-copy")?.addEventListener("click", () => copyText(text, "NPC briefing copied."));
    document.getElementById("n-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("n-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: summon, copy: () => copyText(text, "NPC briefing copied."), favorite: favoriteCurrent });
  }

  function incidentText(result) {
    return [
      `${result.id} (${result.severity})`,
      `Title: ${result.title}`,
      `Start: ${result.startTime}`,
      `Duration: ${result.duration}`,
      `Impact: ${result.impact}`,
      `Root Cause: ${result.rootCause}`,
      "",
      "Timeline:",
      ...result.timeline.map((item) => `- ${item.time} ${item.event}`),
      "",
      "What We Learned:",
      ...result.learned.map((item) => `- ${item}`),
      "",
      "Action Items:",
      ...result.actionItems.map((item) => `- [${item.owner}] ${item.text}`),
      "",
      "Scorecard:",
      ...result.scorecard.map((row) => `- ${row.label}: ${row.score}/5 (${row.note})`)
    ].join("\n");
  }

  function renderIncidents(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 607;
    const chaos = resolveChaos(params);
    const result = engine.generateIncident({ seed, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Incident Theater</h1><p>On-call drama generator with deterministic timelines, scorecards, and deeply professional nonsense.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="i-seed">Seed</label>
          <input id="i-seed" type="number" value="${result.seed}" aria-label="Incident seed" />
          <div class="btn-row">
            <button class="btn btn-primary" id="i-next" aria-label="Next incident seed">Next Seed</button>
            <button class="btn" id="i-random" aria-label="Random incident seed">Random Seed</button>
            <button class="btn" id="i-copy" aria-label="Copy incident">Copy</button>
            <button class="btn" id="i-copy-link" aria-label="Copy incident share link">Copy Share Link</button>
            <button class="btn" id="i-fav" aria-label="Favorite incident">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${html(result.title)}</h3>
          <div class="inline-meta"><span class="badge ${result.severity === "SEV-1" ? "bad" : result.severity === "SEV-2" ? "warn" : "good"}">${html(result.severity)}</span><span class="badge">${html(result.id)}</span><span class="badge">${html(result.startTime)} / ${html(result.duration)}</span></div>
          <p>${html(result.impact)}</p><p><strong>Root Cause:</strong> ${html(result.rootCause)}</p>
          <h4>Timeline</h4><ul class="timeline">${result.timeline.map((item) => `<li><strong>${html(item.time)}</strong> ${html(item.event)}</li>`).join("")}</ul>
          <h4>What We Learned</h4><ul>${result.learned.map((line) => `<li>${html(line)}</li>`).join("")}</ul>
          <h4>Action Items</h4><ul>${result.actionItems.map((item) => `<li><strong>${html(item.owner)}:</strong> ${html(item.text)}</li>`).join("")}</ul>
          <h4>Postmortem Scorecard</h4><ul>${result.scorecard.map((row) => `<li>${html(row.label)}: <strong>${row.score}/5</strong> <span class="muted">${html(row.note)}</span></li>`).join("")}</ul>
          <div class="poster-wrap">${result.posterSvg}</div>
        </div>
      </section>
    `;

    const text = incidentText(result);
    registerCurrentOutput({
      tool: "incidents",
      route: "/tool/incidents",
      params: withChaos({ seed: result.seed }, chaos),
      title: `${result.id} ${result.title}`,
      summary: result.impact,
      text,
      posterSvg: result.posterSvg,
      payload: result,
      type: "incident"
    });

    const nextIncident = () => {
      const next = engine.generateIncident({
        seed: engine.nextSeed(Number(document.getElementById("i-seed")?.value || result.seed)),
        chaosMode: chaos,
        enforceUnseen: true
      });
      navigate("/tool/incidents", withChaos({ seed: next.seed }, chaos));
    };

    document.getElementById("i-next")?.addEventListener("click", nextIncident);
    document.getElementById("i-random")?.addEventListener("click", () => {
      const next = engine.generateIncident({ seed: engine.randomSeed(), chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/incidents", withChaos({ seed: next.seed }, chaos));
    });
    document.getElementById("i-copy")?.addEventListener("click", () => copyText(text, "Incident copied."));
    document.getElementById("i-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("i-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: nextIncident, copy: () => copyText(text, "Incident copied."), favorite: favoriteCurrent });
  }

  function tarotText(result) {
    return result.cards
      .map((card) => `${card.position}: ${card.name} (${card.orientation})\nMeaning: ${card.meaning}\nAction: ${card.action_prompt}\nWarning: ${card.warning}`)
      .join("\n\n");
  }

  function renderTarot(params) {
    const mode = params.mode === "spread3" ? "spread3" : "single";
    const randomOrientation = params.rev === "0" ? false : true;
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed();
    const chaos = resolveChaos(params);
    const result = engine.generateTarot({ seed, mode, randomOrientation, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Tarot of Productivity</h1><p>Pull deterministic cards to diagnose your process aura.</p></div></section>
      <section class="tool-layout">
        <div class="tool-panel">
          <h3>Controls</h3>
          <label for="tr-seed">Seed</label><input id="tr-seed" type="number" value="${result.seed}" aria-label="Tarot seed" />
          <label for="tr-mode">Draw Mode</label>
          <select id="tr-mode" aria-label="Tarot mode"><option value="single" ${mode === "single" ? "selected" : ""}>1 Card</option><option value="spread3" ${mode === "spread3" ? "selected" : ""}>3-Card Spread</option></select>
          <label class="chaos-toggle" for="tr-rev"><input id="tr-rev" type="checkbox" ${randomOrientation ? "checked" : ""} aria-label="Random upright or reversed" /><span>Random Upright/Reversed</span></label>
          <div class="btn-row">
            <button class="btn btn-primary" id="tr-draw" aria-label="Draw tarot cards">Draw</button>
            <button class="btn" id="tr-daily" aria-label="Draw daily card">Draw Daily</button>
            <button class="btn" id="tr-random" aria-label="Random tarot seed">Random Seed</button>
            <button class="btn" id="tr-copy" aria-label="Copy tarot output">Copy</button>
            <button class="btn" id="tr-copy-link" aria-label="Copy tarot share link">Copy Share Link</button>
            <button class="btn" id="tr-fav" aria-label="Favorite tarot output">Favorite</button>
          </div>
        </div>
        <div class="output-panel">
          <h3>${mode === "single" ? "Single Draw" : "Past / Present / Future"}</h3>
          <div class="card-grid">${result.cards.map((card) => `<article class="card"><h4>${html(card.position)}: ${html(card.name)}</h4><p><span class="badge">${html(card.orientation)}</span> <span class="badge">${html(card.archetype)}</span></p><div class="poster-wrap">${card.artSvg}</div><p>${html(card.meaning)}</p><p><strong>Action:</strong> ${html(card.action_prompt)}</p><p><strong>Warning:</strong> ${html(card.warning)}</p></article>`).join("")}</div>
        </div>
      </section>
    `;

    const text = tarotText(result);
    registerCurrentOutput({
      tool: "tarot",
      route: "/tool/tarot",
      params: withChaos({ seed: result.seed, mode, rev: randomOrientation ? 1 : 0 }, chaos),
      title: mode === "single" ? result.cards[0].name : "3-Card Productivity Spread",
      summary: result.cards[0].meaning,
      text,
      payload: result,
      type: "tarot"
    });

    const makeParams = (seedOverride) => ({
      seed: seedOverride ?? Number(document.getElementById("tr-seed")?.value || result.seed),
      mode: String(document.getElementById("tr-mode")?.value || "single"),
      rev: document.getElementById("tr-rev")?.checked ? 1 : 0,
      chaos: chaos ? 1 : 0
    });

    const draw = () => navigate("/tool/tarot", makeParams());
    document.getElementById("tr-draw")?.addEventListener("click", draw);
    document.getElementById("tr-daily")?.addEventListener("click", () => navigate("/tool/tarot", withChaos({ seed: engine.dailySeed(), mode: "single", rev: 1 }, chaos)));
    document.getElementById("tr-random")?.addEventListener("click", () => {
      const p = makeParams(engine.randomSeed());
      const next = engine.generateTarot({ seed: p.seed, mode: p.mode, randomOrientation: p.rev === 1, chaosMode: chaos, enforceUnseen: true });
      navigate("/tool/tarot", withChaos({ seed: next.seed, mode: p.mode, rev: p.rev }, chaos));
    });
    document.getElementById("tr-copy")?.addEventListener("click", () => copyText(text, "Tarot reading copied."));
    document.getElementById("tr-copy-link")?.addEventListener("click", () => copyText(state.currentEntry.shareLink, "Share link copied."));
    document.getElementById("tr-fav")?.addEventListener("click", favoriteCurrent);

    setActions({ generate: draw, copy: () => copyText(text, "Tarot reading copied."), favorite: favoriteCurrent });
  }

  function openModal(contentHtml) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal" role="dialog" aria-modal="true">
          ${contentHtml}
          <div class="btn-row"><button class="btn" id="modal-close" aria-label="Close modal">Close</button></div>
        </div>
      </div>
    `;
    document.getElementById("modal-close")?.addEventListener("click", closeModal);
    document.getElementById("modal-backdrop")?.addEventListener("click", (event) => {
      if (event.target.id === "modal-backdrop") {
        closeModal();
      }
    });
  }

  function closeModal() {
    modalRoot.innerHTML = "";
  }

  function renderMuseum(params) {
    const filter = params.type || "all";
    const favorites = getFavorites().filter((item) => item.type === "universe" || item.type === "incident");
    const shown = favorites.filter((item) => filter === "all" || item.type === filter);

    main.innerHTML = `
      <section class="page-head"><div><h1>Universe Museum</h1><p>Gallery of favorite Universes and Incidents with poster previews.</p></div><div class="btn-row"><button class="btn" id="museum-export" aria-label="Export vault as JSON">Export Vault</button></div></section>
      <section class="card"><label for="museum-filter">Filter</label><select id="museum-filter" aria-label="Filter museum by type"><option value="all" ${filter === "all" ? "selected" : ""}>All</option><option value="universe" ${filter === "universe" ? "selected" : ""}>Universes</option><option value="incident" ${filter === "incident" ? "selected" : ""}>Incidents</option></select></section>
      <section class="museum-grid">
        ${shown
          .map(
            (item) => `
            <article class="museum-card">
              <div class="poster-thumb">${item.posterSvg || "<div class='card-body muted'>No poster available.</div>"}</div>
              <div class="card-body">
                <h4>${html(item.title || "Untitled")}</h4>
                <p class="muted">${html(item.type)} · Seed ${html(item.seed)}</p>
                <p>${html(item.summary || "No summary")}</p>
                <div class="btn-row"><button class="btn" data-open="${html(item.id)}" aria-label="Open details">Open</button><button class="btn" data-copy-link="${html(item.id)}" aria-label="Copy share link">Copy Link</button></div>
              </div>
            </article>
          `
          )
          .join("")}
      </section>
      ${shown.length === 0 ? `<p class="muted">No favorites in this filter yet. Save a Universe or Incident, then return to curate the gallery.</p>` : ""}
    `;

    document.getElementById("museum-filter")?.addEventListener("change", (event) => {
      navigate("/tool/museum", { type: event.target.value });
    });

    document.getElementById("museum-export")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(exportVault(), null, 2)], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "realityops-vault.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      showToast("Vault exported.");
    });

    main.querySelectorAll("[data-copy-link]").forEach((node) => {
      node.addEventListener("click", () => {
        const id = node.getAttribute("data-copy-link");
        const item = favorites.find((fav) => fav.id === id);
        if (item) {
          copyText(item.shareLink, "Share link copied.");
        }
      });
    });

    main.querySelectorAll("[data-open]").forEach((node) => {
      node.addEventListener("click", () => {
        const id = node.getAttribute("data-open");
        const item = favorites.find((fav) => fav.id === id);
        if (!item) {
          return;
        }
        openModal(`
          <h3>${html(item.title || "Detail")}</h3>
          <p class="muted">${html(item.type)} · Seed ${html(item.seed)} · Saved ${html(formatWhen(item.timestamp))}</p>
          <div class="poster-wrap">${item.posterSvg || ""}</div>
          <pre>${html(item.text || "No text payload")}</pre>
          <div class="btn-row"><a class="btn" href="${item.shareHash}">Open Route</a><button class="btn" id="modal-copy-link" aria-label="Copy share link">Copy Share Link</button></div>
        `);
        document.getElementById("modal-copy-link")?.addEventListener("click", () => copyText(item.shareLink, "Share link copied."));
      });
    });

    setActions();
  }

  function renderPacks() {
    const summaries = engine.listPackSummaries();

    main.innerHTML = `
      <section class="page-head"><div><h1>Content Pack Manager</h1><p>Packs are pure JSON files loaded from <code>/content</code>. Update <code>packs.json</code> to register new packs.</p></div></section>
      <section class="card">
        <h3>How to add a new pack</h3>
        <ol>
          <li>Create a JSON file in <code>content/</code> with a <code>meta</code> object including <code>name</code>, <code>version</code>, <code>lastUpdated</code>, and <code>description</code>.</li>
          <li>Add an entry to <code>content/packs.json</code> with <code>key</code> and <code>file</code>.</li>
          <li>Reference the pack in <code>assets/js/generators.js</code> if it drives a generator.</li>
        </ol>
      </section>
      ${summaries
        .map((pack) => {
          const topCounts = [...pack.counts].sort((a, b) => b.count - a.count).slice(0, 7);
          return `
            <article class="pack-item">
              <h4>${html(pack.meta.name)} <span class="muted">(${html(pack.file)})</span></h4>
              <p class="muted">v${html(pack.meta.version)} · updated ${html(pack.meta.lastUpdated)}</p>
              <p>${html(pack.meta.description)}</p>
              <p><strong>Counts:</strong> ${topCounts.map((row) => `${html(row.path)}: ${row.count}`).join(" · ")}</p>
              <p><strong>Examples:</strong></p>
              <ul>${pack.examples.map((example) => `<li><code>${html(example.path)}</code> (${example.count}) — ${html(example.sample)}</li>`).join("")}</ul>
            </article>
          `;
        })
        .join("")}
    `;

    setActions();
  }

  function renderVault() {
    const history = getHistory();
    const favorites = getFavorites();

    main.innerHTML = `
      <section class="page-head"><div><h1>Vault</h1><p>LocalStorage archives for recent outputs and favorites. Stored only in this browser.</p></div></section>
      <section class="two-col">
        <article class="card">
          <h3>Favorites (${favorites.length})</h3>
          ${favorites
            .map(
              (item) => `
              <div class="vault-item">
                <h4>${html(item.title || "Untitled")}</h4>
                <div class="inline-meta"><span class="badge">${html(item.tool)}</span><span class="badge">Seed ${html(item.seed)}</span><span class="badge">${html(formatWhen(item.timestamp))}</span></div>
                <p>${html(item.summary || "No summary")}</p>
                <div class="btn-row"><button class="btn" data-v-copy="${html(item.id)}" aria-label="Copy favorite text">Copy</button><button class="btn" data-v-link="${html(item.id)}" aria-label="Copy favorite share link">Copy Link</button><button class="btn" data-v-remove="${html(item.id)}" aria-label="Remove favorite">Remove</button></div>
              </div>
            `
            )
            .join("")}
          ${favorites.length === 0 ? `<p class="muted">Nothing favorited yet. Use the Favorite button in any generator tool.</p>` : ""}
        </article>
        <article class="card">
          <h3>History (${history.length})</h3>
          ${history
            .map(
              (item) => `
              <div class="vault-item">
                <h4>${html(item.title || "Untitled")}</h4>
                <div class="inline-meta"><span class="badge">${html(item.tool)}</span><span class="badge">Seed ${html(item.seed)}</span><span class="badge">${html(formatWhen(item.timestamp))}</span></div>
                <p>${html(item.summary || "No summary")}</p>
                <div class="btn-row"><button class="btn" data-h-copy="${html(item.id)}" aria-label="Copy history text">Copy</button><button class="btn" data-h-link="${html(item.id)}" aria-label="Copy history share link">Copy Link</button></div>
              </div>
            `
            )
            .join("")}
          ${history.length === 0 ? `<p class="muted">History is empty. Generate something and it appears here automatically.</p>` : ""}
        </article>
      </section>
    `;

    const favMap = new Map(favorites.map((item) => [item.id, item]));
    const histMap = new Map(history.map((item) => [item.id, item]));

    main.querySelectorAll("[data-v-copy]").forEach((node) => {
      node.addEventListener("click", () => {
        const item = favMap.get(node.getAttribute("data-v-copy"));
        if (item) {
          copyText(item.text || "", "Favorite copied.");
        }
      });
    });
    main.querySelectorAll("[data-v-link]").forEach((node) => {
      node.addEventListener("click", () => {
        const item = favMap.get(node.getAttribute("data-v-link"));
        if (item) {
          copyText(item.shareLink, "Share link copied.");
        }
      });
    });
    main.querySelectorAll("[data-v-remove]").forEach((node) => {
      node.addEventListener("click", () => {
        removeFavorite(node.getAttribute("data-v-remove"));
        renderVault();
        renderStatusRail();
      });
    });
    main.querySelectorAll("[data-h-copy]").forEach((node) => {
      node.addEventListener("click", () => {
        const item = histMap.get(node.getAttribute("data-h-copy"));
        if (item) {
          copyText(item.text || "", "History item copied.");
        }
      });
    });
    main.querySelectorAll("[data-h-link]").forEach((node) => {
      node.addEventListener("click", () => {
        const item = histMap.get(node.getAttribute("data-h-link"));
        if (item) {
          copyText(item.shareLink, "Share link copied.");
        }
      });
    });

    setActions();
  }

  function renderAbout() {
    main.innerHTML = `
      <section class="page-head"><div><h1>About RealityOps</h1><p>Enterprise control room satire, fully static for GitHub Pages, with deterministic outputs and offline support.</p></div></section>
      <section class="card-grid">
        <article class="card"><h3>Static Architecture</h3><ul><li>Vanilla modules, no backend, no paid services.</li><li>Hash routing for GitHub Pages compatibility.</li><li>Service worker caches assets and content packs for offline use.</li></ul></article>
        <article class="card"><h3>Deterministic Generation</h3><ul><li>Every tool accepts a seed in route query parameters.</li><li>Share links replay exact outputs for same seed + input.</li><li>Daily dashboard uses local-date seeded generation.</li></ul></article>
        <article class="card"><h3>Local Vault</h3><ul><li>History and favorites are stored in LocalStorage.</li><li>Museum view renders poster thumbnails for saved universes/incidents.</li><li>Export vault to <code>realityops-vault.json</code> with one click.</li></ul></article>
        <article class="card"><h3>Keyboard Shortcuts</h3><ul><li><code>G</code>: Generate current tool output</li><li><code>C</code>: Copy current output text</li><li><code>F</code>: Favorite current output</li></ul></article>
      </section>
    `;
    setActions();
  }

  function renderRoute(route) {
    closeModal();
    state.currentRoute = route.path;
    state.currentParams = route.params;
    state.currentEntry = null;
    if (route.params.chaos === "1" || route.params.chaos === "0") {
      applyChaosMode(route.params.chaos === "1");
    } else {
      applyChaosMode(state.chaosMode);
    }
    activeNav(route.path);

    switch (route.path) {
      case "/": renderDashboard(); break;
      case "/tools": renderToolsIndex(); break;
      case "/tool/universe": renderUniverse(route.params); break;
      case "/tool/memo": renderMemo(route.params); break;
      case "/tool/translator": renderTranslator(route.params); break;
      case "/tool/probability": renderProbability(route.params); break;
      case "/tool/npc": renderNpc(route.params); break;
      case "/tool/incidents": renderIncidents(route.params); break;
      case "/tool/tarot": renderTarot(route.params); break;
      case "/tool/museum": renderMuseum(route.params); break;
      case "/packs": renderPacks(); break;
      case "/vault": renderVault(); break;
      default: renderAbout(); break;
    }

    main.focus();
  }

  function setupShortcuts() {
    window.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || event.target?.isContentEditable) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "g" && state.actions.generate) { event.preventDefault(); state.actions.generate(); }
      if (key === "c" && state.actions.copy) { event.preventDefault(); state.actions.copy(); }
      if (key === "f" && state.actions.favorite) { event.preventDefault(); state.actions.favorite(); }
    });
  }

  function setupTopActions() {
    chaosInput.checked = state.chaosMode;
    chaosInput.addEventListener("change", () => {
      state.chaosMode = Boolean(chaosInput.checked);
      setChaosMode(state.chaosMode);
      applyChaosMode(state.chaosMode);
      renderStatusRail();
      navigate(state.currentRoute, withChaos({ ...state.currentParams }, state.chaosMode));
    });

    newPatchBtn.addEventListener("click", () => {
      const next = engine.generateUniverse({ seed: engine.randomSeed(), chaosMode: state.chaosMode, enforceUnseen: true });
      navigate("/tool/universe", withChaos({ seed: next.seed }, state.chaosMode));
    });
  }

  function setupBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const seed = engine.dailySeed();
    const rnd = miniSeedRng(seed);
    let particles = [];

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.floor(window.innerWidth / 18);
      particles = Array.from({ length: count }).map(() => {
        const speedBase = state.chaosMode ? 0.7 : 0.38;
        return { x: rnd() * window.innerWidth, y: rnd() * window.innerHeight, vx: (rnd() - 0.5) * speedBase, vy: (rnd() - 0.5) * speedBase, r: rnd() * 2.2 + 0.6, o: rnd() * 0.45 + 0.1 };
      });
    };

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hueA = state.chaosMode ? 12 : 198;
      const hueB = state.chaosMode ? 52 : 151;

      ctx.clearRect(0, 0, w, h);
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, `hsla(${hueA}, 44%, 11%, 0.70)`);
      gradient.addColorStop(1, `hsla(${hueB}, 42%, 9%, 0.72)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx * (state.chaosMode ? 1.7 : 1);
        p.y += p.vy * (state.chaosMode ? 1.7 : 1);
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${state.chaosMode ? 30 : 175}, 84%, 70%, ${p.o.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.14;
            ctx.strokeStyle = `hsla(${state.chaosMode ? 17 : 167}, 95%, 75%, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      state.background.raf = window.requestAnimationFrame(tick);
    };

    resize();
    if (!state.background.resizeBound) {
      window.addEventListener("resize", resize);
      state.background.resizeBound = true;
    }
    if (state.background.raf) {
      window.cancelAnimationFrame(state.background.raf);
    }
    tick();
  }

  applyChaosMode(state.chaosMode);
  setupTopActions();
  setupShortcuts();
  setupBackground();
  renderStatusRail();

  return { renderRoute };
}

```

FILE: assets/js/generators.js
```
import { getSeenMeta, hasSeen, markSeen, resetSeen } from "./storage.js";

const PACK_MANIFEST_URL = "./content/packs.json";
const MAX_ATTEMPTS = 40;

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function seedFn() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedInput) {
  const seedHash = xmur3(String(seedInput));
  const rand = mulberry32(seedHash());
  return {
    float() {
      return rand();
    },
    int(min, max) {
      return Math.floor(rand() * (max - min + 1)) + min;
    },
    bool(chance = 0.5) {
      return rand() < chance;
    },
    pick(list) {
      if (!Array.isArray(list) || !list.length) {
        return null;
      }
      return list[Math.floor(rand() * list.length)];
    },
    shuffle(list) {
      const arr = [...list];
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    weighted(list, weightGetter = (item) => item.weight ?? 1) {
      if (!Array.isArray(list) || !list.length) {
        return null;
      }
      const weights = list.map((item) => Math.max(0.0001, Number(weightGetter(item)) || 0.0001));
      const total = weights.reduce((sum, w) => sum + w, 0);
      let hit = rand() * total;
      for (let i = 0; i < list.length; i += 1) {
        hit -= weights[i];
        if (hit <= 0) {
          return list[i];
        }
      }
      return list[list.length - 1];
    }
  };
}

function hashToInt(input) {
  const seedFn = xmur3(String(input));
  return seedFn() || 1;
}

function normalizeSeed(input) {
  if (typeof input === "number" && Number.isFinite(input)) {
    const n = Math.abs(Math.floor(input));
    return n || 1;
  }
  if (typeof input === "string" && input.trim()) {
    const maybe = Number(input);
    if (Number.isFinite(maybe) && maybe !== 0) {
      return Math.abs(Math.floor(maybe));
    }
    return hashToInt(input.trim());
  }
  return hashToInt(`${Date.now()}`);
}

function nextSeed(seed) {
  const n = normalizeSeed(seed);
  const next = (n + 104729) % 2147483647;
  return next || 2147483629;
}

function randomSeed() {
  if (window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return normalizeSeed(buf[0]);
  }
  return normalizeSeed(Math.random() * 1e9);
}

function dateStamp(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dailySeed(d = new Date()) {
  return normalizeSeed(dateStamp(d));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toTitleCase(text) {
  return String(text)
    .split(" ")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ");
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function chaosWeight(item, chaos = false) {
  const base = Number(item?.weight ?? 1) || 1;
  if (!chaos) {
    return base;
  }
  const absurdity = Number(item?.absurdity ?? item?.chaos ?? 1.45) || 1.45;
  return base * absurdity;
}

function fillTemplate(template, context, rng) {
  if (!template) {
    return "";
  }
  return String(template).replace(/\{([^}]+)\}/g, (_, rawToken) => {
    const token = rawToken.trim();
    const value = context[token];
    if (Array.isArray(value)) {
      return rng.pick(value) ?? "";
    }
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return `{${token}}`;
  });
}

function pickManyUnique(list, count, rng) {
  if (!Array.isArray(list) || !list.length) {
    return [];
  }
  return rng.shuffle(list).slice(0, Math.max(0, Math.min(count, list.length)));
}

function wrapLines(text, limit = 32) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > limit) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 4);
}

function formatClock(totalMinutes) {
  const m = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hour = Math.floor(m / 60);
  const minute = m % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function deterministicDate(seed) {
  const start = Date.UTC(2026, 0, 1);
  const dayOffset = normalizeSeed(seed) % 365;
  const d = new Date(start + dayOffset * 86400000);
  return d.toISOString().slice(0, 10);
}

function normalizeText(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeSignature(tool, signature) {
  return `${tool}|${signature}`;
}

function buildUniversePoster(data, seed) {
  const rng = createRng(`${seed}:universe-poster`);
  const circles = Array.from({ length: 15 })
    .map(() => {
      const cx = rng.int(20, 700);
      const cy = rng.int(20, 400);
      const r = rng.int(12, 90);
      const o = (rng.float() * 0.28 + 0.08).toFixed(2);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${data.theme.accent2}" opacity="${o}" />`;
    })
    .join("");

  const bars = Array.from({ length: 13 })
    .map((_, i) => {
      const y = i * 31;
      const h = rng.int(2, 10);
      const o = (rng.float() * 0.32 + 0.1).toFixed(2);
      return `<rect x="0" y="${y}" width="720" height="${h}" fill="${data.theme.accent}" opacity="${o}"/>`;
    })
    .join("");

  const headline = wrapLines(data.headline, 34)
    .map((line, idx) => `<tspan x="32" y="${132 + idx * 28}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" role="img" aria-label="Universe Poster">
  <defs>
    <linearGradient id="uGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${data.theme.bg}"/>
      <stop offset="100%" stop-color="${data.theme.accent2}"/>
    </linearGradient>
  </defs>
  <rect width="720" height="420" fill="url(#uGrad)"/>
  <rect x="14" y="14" width="692" height="392" fill="none" stroke="${data.theme.accent}" stroke-width="2" opacity="0.75"/>
  ${bars}
  ${circles}
  <text x="32" y="56" fill="#f3f8f7" font-family="Consolas, monospace" font-size="16">REALITY PATCH / SEED ${seed}</text>
  <text x="32" y="92" fill="#f3f8f7" font-family="Trebuchet MS, sans-serif" font-size="26" font-weight="700">${escapeXml(data.tone)} // ${escapeXml(data.tagline)}</text>
  <text fill="#f3f8f7" font-family="Trebuchet MS, sans-serif" font-size="24" font-weight="700">${headline}</text>
  <text x="32" y="338" fill="#f3f8f7" font-family="Consolas, monospace" font-size="15">Rule: ${escapeXml(data.rule)}</text>
  <text x="32" y="368" fill="#f3f8f7" font-family="Consolas, monospace" font-size="15">Law: ${escapeXml(data.law)}</text>
</svg>`;
}

function buildIncidentPoster(data, seed) {
  const rng = createRng(`${seed}:incident-poster`);
  const sevColor = data.severity === "SEV-1" ? "#ff6f61" : data.severity === "SEV-2" ? "#ffbe55" : "#86d49d";
  const blocks = Array.from({ length: 24 })
    .map((_, i) => {
      const x = (i % 6) * 120;
      const y = Math.floor(i / 6) * 105;
      const alpha = (rng.float() * 0.22 + 0.08).toFixed(2);
      return `<rect x="${x}" y="${y}" width="115" height="100" fill="${sevColor}" opacity="${alpha}"/>`;
    })
    .join("");

  const sparks = Array.from({ length: 20 })
    .map(() => {
      const x1 = rng.int(8, 712);
      const y1 = rng.int(8, 412);
      const x2 = x1 + rng.int(-90, 90);
      const y2 = y1 + rng.int(-90, 90);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffe7d6" stroke-width="1" opacity="0.4"/>`;
    })
    .join("");

  const titleLines = wrapLines(data.title, 30)
    .map((line, idx) => `<tspan x="28" y="${126 + idx * 30}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" role="img" aria-label="Incident Poster">
  <defs>
    <linearGradient id="iGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f1825"/>
      <stop offset="100%" stop-color="#2f1118"/>
    </linearGradient>
  </defs>
  <rect width="720" height="420" fill="url(#iGrad)"/>
  ${blocks}
  ${sparks}
  <rect x="16" y="16" width="688" height="388" fill="none" stroke="${sevColor}" stroke-width="2"/>
  <text x="28" y="56" fill="#f5f6f8" font-family="Consolas, monospace" font-size="18">INCIDENT THEATER // ${escapeXml(data.id)}</text>
  <text x="28" y="88" fill="${sevColor}" font-family="Consolas, monospace" font-size="18">${escapeXml(data.severity)} // ${escapeXml(data.duration)}</text>
  <text fill="#f5f6f8" font-family="Trebuchet MS, sans-serif" font-size="27" font-weight="700">${titleLines}</text>
  <text x="28" y="350" fill="#f5f6f8" font-family="Consolas, monospace" font-size="15">Impact: ${escapeXml(data.impact.slice(0, 92))}</text>
  <text x="28" y="378" fill="#f5f6f8" font-family="Consolas, monospace" font-size="15">Root Cause: ${escapeXml(data.rootCause.slice(0, 86))}</text>
</svg>`;
}

function buildTarotCardArt(card, seed, reversed = false, index = 0) {
  const rng = createRng(`${seed}:tarot:${card.name}:${index}:${reversed ? 1 : 0}`);
  const hueA = rng.int(15, 340);
  const hueB = (hueA + rng.int(35, 170)) % 360;

  const layer = Array.from({ length: 12 })
    .map(() => {
      const x = rng.int(6, 214);
      const y = rng.int(6, 314);
      const w = rng.int(16, 94);
      const h = rng.int(16, 120);
      const r = rng.int(2, 20);
      const o = (rng.float() * 0.33 + 0.09).toFixed(2);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="hsl(${(hueA + rng.int(-20, 20) + 360) % 360} 80% 64%)" opacity="${o}"/>`;
    })
    .join("");

  const circles = Array.from({ length: 9 })
    .map(() => {
      const x = rng.int(18, 198);
      const y = rng.int(18, 298);
      const r = rng.int(8, 34);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(${hueB} 78% 70%)" opacity="0.24"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="320" viewBox="0 0 220 320" role="img" aria-label="Tarot card art">
  <defs>
    <linearGradient id="tGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA} 80% 42%)"/>
      <stop offset="100%" stop-color="hsl(${hueB} 84% 39%)"/>
    </linearGradient>
  </defs>
  <rect width="220" height="320" fill="url(#tGrad)"/>
  <rect x="9" y="9" width="202" height="302" rx="12" fill="none" stroke="rgba(255,255,255,0.7)"/>
  ${layer}
  ${circles}
  <text x="16" y="35" fill="#fff" font-family="Consolas, monospace" font-size="13">${escapeXml(reversed ? "REVERSED" : "UPRIGHT")}</text>
  <text x="16" y="300" fill="#fff" font-family="Trebuchet MS, sans-serif" font-size="14">${escapeXml(card.archetype)}</text>
</svg>`;
}

function flattenExamples(value, path = "") {
  const rows = [];
  if (Array.isArray(value)) {
    rows.push({
      path,
      count: value.length,
      sample: value.slice(0, 3).map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join(" | ")
    });
    return rows;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      if (k === "meta") {
        return;
      }
      rows.push(...flattenExamples(v, path ? `${path}.${k}` : k));
    });
  }
  return rows;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed loading ${url} (${res.status})`);
  }
  return res.json();
}

export async function createGeneratorEngine() {
  const manifest = await fetchJson(PACK_MANIFEST_URL);
  const packs = {};

  await Promise.all(
    manifest.packs.map(async (entry) => {
      const pack = await fetchJson(`./content/${entry.file}`);
      const key = entry.key || entry.file.replace(/\.json$/, "");
      packs[key] = pack;
    })
  );

  function withSeen(tool, seed, build, options = {}) {
    const {
      enforceUnseen = false,
      trackSeen = true,
      resetThreshold = 550,
      maxAttempts = MAX_ATTEMPTS
    } = options;

    let candidateSeed = normalizeSeed(seed);

    if (!trackSeen) {
      const out = build(candidateSeed);
      return {
        ...out,
        seed: candidateSeed
      };
    }

    if (!enforceUnseen) {
      const out = build(candidateSeed);
      markSeen(tool, summarizeSignature(tool, out.signature));
      return {
        ...out,
        seed: candidateSeed
      };
    }

    for (let i = 0; i < maxAttempts; i += 1) {
      const out = build(candidateSeed);
      const sig = summarizeSignature(tool, out.signature);
      if (!hasSeen(tool, sig)) {
        markSeen(tool, sig);
        return {
          ...out,
          seed: candidateSeed
        };
      }
      candidateSeed = nextSeed(candidateSeed + i * 13);
    }

    const meta = getSeenMeta(tool);
    if (meta.count >= resetThreshold) {
      resetSeen(tool);
    }

    const out = build(candidateSeed);
    markSeen(tool, summarizeSignature(tool, out.signature));
    return {
      ...out,
      seed: candidateSeed
    };
  }

  function generateUniverse({ seed, chaosMode = false, enforceUnseen = false, trackSeen = true } = {}) {
    const data = packs.universes;
    const context = {
      absurdNoun: data.absurdNouns,
      authority: data.authorities,
      event: data.events,
      place: data.places,
      verb: data.verbs,
      subsystem: data.subsystems,
      symptom: data.symptoms,
      fix: data.fixes
    };

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:universe:${chaosMode ? 1 : 0}`);
      const theme = rng.pick(data.themes);
      const tone = rng.weighted(data.tones, (item) => chaosWeight(item, chaosMode));
      const rule = rng.pick(data.rules);
      const law = rng.pick(data.laws);
      const headline = fillTemplate(rng.pick(data.headlines), context, rng);
      const noteCount = rng.int(3, 5);
      const patchNotes = Array.from({ length: noteCount }).map(() => fillTemplate(rng.pick(data.patchNotes), context, rng));
      const payload = {
        tool: "universe",
        theme,
        tone: tone.tone,
        tagline: tone.tagline,
        rule,
        law,
        headline,
        patchNotes
      };
      return {
        ...payload,
        posterSvg: buildUniversePoster(payload, candidateSeed),
        signature: [payload.tone, payload.rule, payload.law, payload.headline, payload.patchNotes[0]].join("|")
      };
    };

    return withSeen("universe", seed, build, { enforceUnseen, trackSeen, resetThreshold: 700 });
  }

  function generateMemo({
    seed,
    topic,
    chaosMode = false,
    enforceUnseen = false,
    trackSeen = true
  } = {}) {
    const data = packs.exec_memos;
    const cleanTopic = normalizeText(topic) || null;

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:memo:${cleanTopic || "auto"}:${chaosMode ? 1 : 0}`);
      const chosenTopic = cleanTopic || rng.pick(data.topics);
      const ctx = {
        topic: chosenTopic,
        initiative: rng.pick(data.initiatives),
        metric: rng.pick(data.metrics),
        stakeholder: rng.pick(data.stakeholders)
      };
      const subject = fillTemplate(rng.pick(data.subjects), ctx, rng);
      const opener = fillTemplate(rng.pick(data.openers), ctx, rng);
      const rationaleCount = rng.int(3, 5);
      const rationales = pickManyUnique(data.rationales, rationaleCount, rng).map((line) => fillTemplate(line, ctx, rng));
      const risk = fillTemplate(rng.pick(data.risks), ctx, rng);
      const controls = pickManyUnique(data.mitigations, 2 + rng.int(0, 1), rng).map((line) => fillTemplate(line, ctx, rng));
      const decision = fillTemplate(rng.pick(data.initiatives), ctx, rng);
      const nextStep = fillTemplate(rng.pick(data.nextSteps), ctx, rng);
      const signature = rng.pick(data.signatures);
      const date = deterministicDate(candidateSeed);

      const bodyText = [
        `Subject: ${subject}`,
        `Date: ${date}`,
        "",
        opener,
        "",
        "Rationale:",
        ...rationales.map((line) => `- ${line}`),
        "",
        "Risk & Controls:",
        `- Risk: ${risk}`,
        ...controls.map((line) => `- Control: ${line}`),
        "",
        `Decision: ${decision}`,
        `Next Step: ${nextStep}`,
        "",
        signature
      ].join("\n");

      return {
        tool: "memo",
        topic: chosenTopic,
        subject,
        date,
        opener,
        rationales,
        risk,
        controls,
        decision,
        nextStep,
        signatureLine: signature,
        text: bodyText,
        signature: [subject, risk, nextStep, signature].join("|")
      };
    };

    return withSeen("memo", seed, build, { enforceUnseen, trackSeen, resetThreshold: 680 });
  }

  function generateTranslation({
    seed,
    inputText,
    chaosMode = false,
    enforceUnseen = false,
    trackSeen = true
  } = {}) {
    const data = packs.meeting_translator;
    const cleanInput = String(inputText || "").trim();

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:translator:${cleanInput || "samples"}:${chaosMode ? 1 : 0}`);
      const lines = cleanInput
        ? cleanInput
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        : pickManyUnique(data.sampleLines, 4, rng);

      const translations = lines.map((line) => {
        const lower = line.toLowerCase();
        const matching = data.map.filter((entry) => lower.includes(entry.contains.toLowerCase()));
        if (matching.length) {
          const chosen = rng.pick(matching);
          return {
            line,
            meaning: rng.pick(chosen.means)
          };
        }
        return {
          line,
          meaning: rng.pick(data.generic)
        };
      });

      const vibe = rng.pick(data.vibes);
      const action = rng.pick(data.actions);
      const timeline = rng.pick(data.timelines);
      const summaryTemplate = rng.pick(data.summaryTemplates);
      const summary = fillTemplate(summaryTemplate, { vibe, action, timeline }, rng);

      const text = [
        `Translation summary: ${summary}`,
        "",
        ...translations.map((item) => `- ${item.line}\n  -> ${item.meaning}`)
      ].join("\n");

      return {
        tool: "translator",
        lines,
        translations,
        summary,
        vibe,
        action,
        timeline,
        text,
        signature: [summary, ...translations.map((t) => t.meaning)].join("|")
      };
    };

    return withSeen("translator", seed, build, { enforceUnseen, trackSeen, resetThreshold: 720 });
  }

  function generateProbability({
    seed,
    scenario,
    chaosMode = false,
    enforceUnseen = false,
    trackSeen = true
  } = {}) {
    const data = packs.probability_engine;
    const cleanScenario = normalizeText(scenario) || null;

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:prob:${cleanScenario || "auto"}:${chaosMode ? 1 : 0}`);
      const chosenScenario = cleanScenario || rng.pick(data.scenarios);
      const base = rng.weighted(data.baseRates, (item) => chaosWeight(item, chaosMode));
      const mods = pickManyUnique(data.modifiers, 3, rng);
      const delta = mods.reduce((sum, item) => sum + Number(item.delta || 0), 0);
      const noise = rng.int(-7, 7);
      const chaosBump = chaosMode ? rng.int(5, 14) : 0;
      const score = clamp(Math.round(base.score + delta + noise + chaosBump), 1, 99);
      const band = score <= 33 ? "GREEN" : score <= 66 ? "YELLOW" : "RED";
      const mood = rng.pick(data.moods);
      const explanationTemplate = rng.pick(data.explanations);
      const explanation = fillTemplate(
        explanationTemplate,
        {
          scenario: chosenScenario,
          band,
          mood,
          factor: mods[0]?.factor || "ambient uncertainty",
          modifier: mods[1]?.factor || "organizational weather"
        },
        rng
      );
      const controls = pickManyUnique(data.controls, 3, rng).map((line) => fillTemplate(line, { scenario: chosenScenario }, rng));

      const text = [
        `Scenario: ${chosenScenario}`,
        `Risk score: ${score} (${band})`,
        `Narrative: ${explanation}`,
        "Controls:",
        ...controls.map((line) => `- ${line}`)
      ].join("\n");

      return {
        tool: "probability",
        scenario: chosenScenario,
        score,
        band,
        mood,
        explanation,
        controls,
        modifiers: mods,
        text,
        signature: [chosenScenario, score, band, controls[0]].join("|")
      };
    };

    return withSeen("probability", seed, build, { enforceUnseen, trackSeen, resetThreshold: 760 });
  }

  function generateNpc({
    seed,
    request,
    chaosMode = false,
    enforceUnseen = false,
    trackSeen = true
  } = {}) {
    const data = packs.npc_dialogue;
    const cleanRequest = normalizeText(request) || null;

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:npc:${cleanRequest || "auto"}:${chaosMode ? 1 : 0}`);
      const chosenRequest = cleanRequest || rng.pick(data.requests);
      const npc = rng.pick(data.npcs);
      const opener = rng.pick(npc.openers);
      const ctx = {
        request: chosenRequest,
        place: rng.pick(data.places),
        object: rng.pick(data.objects),
        role: npc.role,
        npc: npc.name
      };

      const mission = fillTemplate(rng.pick(data.missions), ctx, rng);
      const constraint = fillTemplate(rng.pick(data.constraints), ctx, rng);
      const reward = fillTemplate(rng.pick(data.rewards), ctx, rng);
      const hint = fillTemplate(rng.pick(data.hints), ctx, rng);

      const text = [
        `${npc.name} (${npc.role})`,
        opener,
        "",
        `Mission: ${mission}`,
        `Constraint: ${constraint}`,
        `Reward: ${reward}`,
        `Hint: ${hint}`
      ].join("\n");

      return {
        tool: "npc",
        request: chosenRequest,
        npc,
        opener,
        mission,
        constraint,
        reward,
        hint,
        text,
        signature: [npc.name, mission, constraint, reward].join("|")
      };
    };

    return withSeen("npc", seed, build, { enforceUnseen, trackSeen, resetThreshold: 680 });
  }

  function generateIncident({ seed, chaosMode = false, enforceUnseen = false, trackSeen = true } = {}) {
    const data = packs.incidents;

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:incident:${chaosMode ? 1 : 0}`);
      const severity = rng.weighted(data.severityLevels, (item) => chaosWeight(item, chaosMode));
      const system = rng.pick(data.impactedSystems);
      const symptom = rng.pick(data.symptoms);
      const owner = rng.pick(data.owners);
      const id = `${severity.level}-${rng.int(1000, 9999)}`;

      const ctx = {
        system,
        symptom,
        owner,
        noun: rng.pick(data.nouns),
        verb: rng.pick(data.verbs),
        place: rng.pick(data.places),
        comms: rng.pick(data.commsTemplates),
        committee: "The Committee"
      };

      const title = fillTemplate(rng.pick(data.titleTemplates), ctx, rng);
      const startMinute = rng.int(0, 23 * 60 + 59);
      const rule = data.durationRules[severity.level] || [25, 90];
      const durationMinutes = rng.int(rule[0], rule[1]);
      const duration = `${durationMinutes}m`;

      const impact = fillTemplate(rng.pick(data.commsTemplates), {
        ...ctx,
        severity: severity.level,
        title
      }, rng);

      const timelineCount = rng.int(6, 10);
      const timeline = [];
      let offset = 0;
      for (let i = 0; i < timelineCount; i += 1) {
        if (i > 0) {
          offset += rng.int(3, Math.max(9, Math.round(durationMinutes / timelineCount) + 5));
        }
        const event = fillTemplate(rng.pick(data.timelineEvents), {
          ...ctx,
          owner: rng.pick(data.owners),
          outcome: rng.pick(data.outcomes)
        }, rng);
        timeline.push({
          time: formatClock(startMinute + offset),
          event
        });
      }

      const rootCause = fillTemplate(rng.pick(data.rootCauses), ctx, rng);
      const learned = pickManyUnique(data.weLearned, 3, rng).map((line) => fillTemplate(line, ctx, rng));

      const actionItems = pickManyUnique(data.actionItems, 5, rng).map((item) => {
        const ownerPick = rng.pick(item.owners?.length ? item.owners : data.owners);
        const text = fillTemplate(item.template, {
          ...ctx,
          owner: ownerPick,
          system
        }, rng);
        return {
          owner: ownerPick,
          text
        };
      });

      const scorecard = data.scorecard.dimensions.map((dim) => {
        const base = severity.level === "SEV-1" ? 2 : severity.level === "SEV-2" ? 3 : 4;
        const score = clamp(base + rng.int(-1, 1), 1, 5);
        return {
          label: dim,
          score,
          note: data.scorecard.interpretations[String(score)]
        };
      });

      const payload = {
        tool: "incidents",
        id,
        severity: severity.level,
        title,
        startTime: formatClock(startMinute),
        duration,
        impact,
        timeline,
        rootCause,
        learned,
        actionItems,
        scorecard
      };

      return {
        ...payload,
        posterSvg: buildIncidentPoster(payload, candidateSeed),
        signature: [id, title, rootCause, actionItems[0]?.text || ""].join("|")
      };
    };

    return withSeen("incidents", seed, build, { enforceUnseen, trackSeen, resetThreshold: 840 });
  }

  function generateTarot({
    seed,
    mode = "single",
    randomOrientation = true,
    chaosMode = false,
    enforceUnseen = false,
    trackSeen = true
  } = {}) {
    const data = packs.tarot;

    const build = (candidateSeed) => {
      const rng = createRng(`${candidateSeed}:tarot:${mode}:${randomOrientation ? 1 : 0}:${chaosMode ? 1 : 0}`);
      const deck = rng.shuffle(data.cards);
      const drawCount = mode === "spread3" ? 3 : 1;
      const positions = mode === "spread3" ? data.spreads.three_card.positions : ["Daily Card"];
      const cards = deck.slice(0, drawCount).map((card, idx) => {
        const reversed = randomOrientation ? rng.bool(0.5) : false;
        return {
          ...card,
          position: positions[idx] || `Card ${idx + 1}`,
          reversed,
          orientation: reversed ? "Reversed" : "Upright",
          meaning: reversed ? card.meaning_reversed : card.meaning_upright,
          artSvg: buildTarotCardArt(card, candidateSeed, reversed, idx)
        };
      });

      const text = cards
        .map(
          (card) =>
            `${card.position}: ${card.name} (${card.orientation})\nMeaning: ${card.meaning}\nAction: ${card.action_prompt}\nWarning: ${card.warning}`
        )
        .join("\n\n");

      return {
        tool: "tarot",
        mode,
        randomOrientation,
        cards,
        text,
        signature: cards.map((card) => `${card.name}:${card.orientation}`).join("|")
      };
    };

    return withSeen("tarot", seed, build, { enforceUnseen, trackSeen, resetThreshold: 620 });
  }

  function generateDailyBundle({ chaosMode = false } = {}) {
    const seed = dailySeed();

    return {
      seed,
      date: dateStamp(),
      universe: generateUniverse({ seed: seed + 11, chaosMode, trackSeen: false }),
      memo: generateMemo({ seed: seed + 29, chaosMode, trackSeen: false }),
      incident: generateIncident({ seed: seed + 41, chaosMode, trackSeen: false }),
      tarot: generateTarot({ seed: seed + 53, mode: "single", randomOrientation: true, chaosMode, trackSeen: false }),
      probability: generateProbability({ seed: seed + 67, chaosMode, trackSeen: false }),
      npc: generateNpc({ seed: seed + 79, chaosMode, trackSeen: false })
    };
  }

  function getDailyStatus({ chaosMode = false } = {}) {
    const data = packs.universes;
    const rng = createRng(`${dailySeed()}:status:${chaosMode ? 1 : 0}`);
    const labels = [
      "Timeline Stability",
      "Audit Heat",
      "Portal Latency",
      "Policy Weirdness",
      "Executive Confidence",
      "Snack Compliance"
    ];

    return labels.map((label, idx) => {
      const val = idx % 2 === 0 ? `${rng.int(12, 98)}%` : `${rng.pick(data.subsystems)}-${rng.int(1, 9)}`;
      return {
        label,
        value: val
      };
    });
  }

  function listPackSummaries() {
    const rng = createRng(`${dailySeed()}:pack-summary`);
    return manifest.packs.map((entry) => {
      const key = entry.key || entry.file.replace(/\.json$/, "");
      const pack = packs[key];
      const details = flattenExamples(pack).filter((item) => item.path && item.count > 0);
      const samples = rng.shuffle(details).slice(0, 3).map((item) => ({
        path: item.path,
        count: item.count,
        sample: item.sample
      }));
      return {
        key,
        file: entry.file,
        meta: pack.meta,
        counts: details.map((item) => ({ path: item.path, count: item.count })),
        examples: samples
      };
    });
  }

  function getToolCatalog() {
    return packs.microtools.tools;
  }

  return {
    manifest,
    packs,
    normalizeSeed,
    nextSeed,
    randomSeed,
    dailySeed,
    toTitleCase,
    generateUniverse,
    generateMemo,
    generateTranslation,
    generateProbability,
    generateNpc,
    generateIncident,
    generateTarot,
    generateDailyBundle,
    getDailyStatus,
    listPackSummaries,
    getToolCatalog
  };
}

```

FILE: assets/js/storage.js
```
const KEYS = {
  history: "realityops.history.v1",
  favorites: "realityops.favorites.v1",
  seen: "realityops.seen.v1",
  settings: "realityops.settings.v1"
};

const DEFAULT_SETTINGS = {
  chaosMode: false
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function stableId(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return `id_${Math.abs(h >>> 0).toString(36)}`;
}

export function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...readJSON(KEYS.settings, {})
  };
}

export function setSetting(key, value) {
  const next = {
    ...getSettings(),
    [key]: value
  };
  writeJSON(KEYS.settings, next);
  return next;
}

export function getChaosMode() {
  return Boolean(getSettings().chaosMode);
}

export function setChaosMode(enabled) {
  return setSetting("chaosMode", Boolean(enabled));
}

export function getHistory() {
  return readJSON(KEYS.history, []);
}

export function addHistory(entry, limit = 180) {
  const history = getHistory();
  const normalized = {
    id: entry.id || stableId([entry.tool, entry.seed, entry.summary || entry.title || ""]).slice(0, 22),
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry
  };
  const deduped = [normalized, ...history.filter((item) => item.id !== normalized.id)];
  writeJSON(KEYS.history, deduped.slice(0, limit));
  return normalized;
}

export function clearHistory() {
  writeJSON(KEYS.history, []);
}

export function getFavorites() {
  return readJSON(KEYS.favorites, []);
}

export function isFavorited(id) {
  return getFavorites().some((item) => item.id === id);
}

export function addFavorite(entry, limit = 240) {
  const list = getFavorites();
  const normalized = {
    id: entry.id || stableId([entry.tool, entry.seed, entry.summary || entry.title || ""]).slice(0, 22),
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry
  };
  const deduped = [normalized, ...list.filter((item) => item.id !== normalized.id)];
  writeJSON(KEYS.favorites, deduped.slice(0, limit));
  return normalized;
}

export function removeFavorite(id) {
  const list = getFavorites().filter((item) => item.id !== id);
  writeJSON(KEYS.favorites, list);
  return list;
}

function getSeenStore() {
  return readJSON(KEYS.seen, {});
}

function setSeenStore(next) {
  writeJSON(KEYS.seen, next);
}

export function getSeen(tool) {
  const store = getSeenStore();
  return Array.isArray(store[tool]?.items) ? store[tool].items : [];
}

export function hasSeen(tool, signature) {
  return getSeen(tool).includes(signature);
}

export function markSeen(tool, signature, limit = 900) {
  const store = getSeenStore();
  const prev = Array.isArray(store[tool]?.items) ? store[tool].items : [];
  const merged = [signature, ...prev.filter((item) => item !== signature)].slice(0, limit);
  store[tool] = {
    items: merged,
    resets: store[tool]?.resets || 0,
    updatedAt: new Date().toISOString()
  };
  setSeenStore(store);
}

export function resetSeen(tool) {
  const store = getSeenStore();
  const resets = (store[tool]?.resets || 0) + 1;
  store[tool] = {
    items: [],
    resets,
    updatedAt: new Date().toISOString()
  };
  setSeenStore(store);
}

export function getSeenMeta(tool) {
  const store = getSeenStore();
  return {
    count: getSeen(tool).length,
    resets: store[tool]?.resets || 0
  };
}

export function exportVault() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    favorites: getFavorites(),
    history: getHistory(),
    seen: getSeenStore()
  };
}

```

FILE: assets/js/sw-register.js
```
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Service worker registration failed", error);
    }
  });
}

```

FILE: content/packs.json
```
{"meta":{"name":"RealityOps Pack Manifest","version":"1.0.0","lastUpdated":"2026-02-07","description":"Manifest listing all content packs used by the static generator engine."},"packs":[{"key":"universes","file":"universes.json"},{"key":"exec_memos","file":"exec_memos.json"},{"key":"meeting_translator","file":"meeting_translator.json"},{"key":"probability_engine","file":"probability_engine.json"},{"key":"npc_dialogue","file":"npc_dialogue.json"},{"key":"incidents","file":"incidents.json"},{"key":"tarot","file":"tarot.json"},{"key":"microtools","file":"microtools.json"}]}
```

FILE: content/universes.json
```
{"meta":{"name":"Universe Forge Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Themes, rules, headlines, and patch structures for multiverse satire."},"themes":[{"name":"Brass Bureaucracy","accent":"#c0a468","accent2":"#4dc3b2","bg":"#10161f","bg2":"#1d2633"},{"name":"Mint Compliance","accent":"#4ed2a2","accent2":"#f2b36f","bg":"#0f1820","bg2":"#1c2930"},{"name":"Sunset Escalation","accent":"#ff9a61","accent2":"#7ce0d8","bg":"#13131d","bg2":"#261b24"},{"name":"Cold Ledger","accent":"#69c7ff","accent2":"#ffcf85","bg":"#0d1625","bg2":"#172133"},{"name":"Sable Audit","accent":"#d4c18f","accent2":"#7fcf86","bg":"#121316","bg2":"#202428"},{"name":"Chrome Ritual","accent":"#89e0e6","accent2":"#ef8a73","bg":"#111820","bg2":"#1f2934"},{"name":"Paperclip Horizon","accent":"#ffc677","accent2":"#64d7b5","bg":"#141722","bg2":"#212739"},{"name":"Safety Orange","accent":"#ff8f5f","accent2":"#9dd9ff","bg":"#17141b","bg2":"#271f2e"},{"name":"Lime Directive","accent":"#8fe25f","accent2":"#ffbe78","bg":"#111a15","bg2":"#1d2c22"},{"name":"Oceanic Committee","accent":"#63d3c6","accent2":"#ffc37a","bg":"#0e1b21","bg2":"#1a2a30"},{"name":"Terracotta Forecast","accent":"#f19972","accent2":"#7fd2c6","bg":"#1a1413","bg2":"#2a1f1a"},{"name":"Midnight Procurement","accent":"#8bb7ff","accent2":"#f8bc7a","bg":"#0f1320","bg2":"#1b2335"}],"tones":[{"tone":"Confidently Alarmed","tagline":"Everything is fine; please sign this indemnity waiver.","weight":7,"absurdity":1.4},{"tone":"Metric Spiritual","tagline":"We measured the vibe and it is billable.","weight":5,"absurdity":1.6},{"tone":"Quietly Apocalyptic","tagline":"No urgency, only structural panic.","weight":4,"absurdity":1.8},{"tone":"Compliance Punk","tagline":"Follow the policy, break the cosmos.","weight":6,"absurdity":1.5},{"tone":"Executive Campfire","tagline":"Gather around for a bedtime outage story.","weight":5,"absurdity":1.7},{"tone":"Post-Merger Mysticism","tagline":"Two realities entered, seven workflows emerged.","weight":3,"absurdity":1.9},{"tone":"Process Noir","tagline":"In this city, every checkbox has a motive.","weight":4,"absurdity":1.5},{"tone":"Helpful Menace","tagline":"We solved your problem by creating a department.","weight":6,"absurdity":1.4},{"tone":"Budget Heroics","tagline":"Innovation is what happens after procurement says no.","weight":5,"absurdity":1.5},{"tone":"Stakeholder Opera","tagline":"Every update has three solos and no decisions.","weight":4,"absurdity":1.7}],"rules":["Every launch must include one dramatic reveal.","Every launch triggers a spontaneous audit.","Every launch creates one extra dependency.","Every launch requires snacks for quorum.","Every launch summons the committee.","Every launch forces polite overreaction.","Every launch adds a ceremonial checkpoint.","Every launch resets the confidence score.","Every launch converts certainty into caveats.","Every launch requires an interpretive summary.","All dashboards must include one dramatic reveal.","All dashboards triggers a spontaneous audit.","All dashboards creates one extra dependency.","All dashboards requires snacks for quorum.","All dashboards summons the committee.","All dashboards forces polite overreaction.","All dashboards adds a ceremonial checkpoint.","All dashboards resets the confidence score.","All dashboards converts certainty into caveats.","All dashboards requires an interpretive summary.","Any budget discussion must include one dramatic reveal.","Any budget discussion triggers a spontaneous audit.","Any budget discussion creates one extra dependency.","Any budget discussion requires snacks for quorum.","Any budget discussion summons the committee.","Any budget discussion forces polite overreaction.","Any budget discussion adds a ceremonial checkpoint.","Any budget discussion resets the confidence score.","Any budget discussion converts certainty into caveats.","Any budget discussion requires an interpretive summary.","Each daily standup must include one dramatic reveal.","Each daily standup triggers a spontaneous audit.","Each daily standup creates one extra dependency.","Each daily standup requires snacks for quorum.","Each daily standup summons the committee.","Each daily standup forces polite overreaction.","Each daily standup adds a ceremonial checkpoint.","Each daily standup resets the confidence score.","Each daily standup converts certainty into caveats.","Each daily standup requires an interpretive summary.","Every escalation must include one dramatic reveal.","Every escalation triggers a spontaneous audit.","Every escalation creates one extra dependency.","Every escalation requires snacks for quorum.","Every escalation summons the committee.","Every escalation forces polite overreaction.","Every escalation adds a ceremonial checkpoint.","Every escalation resets the confidence score.","Every escalation converts certainty into caveats.","Every escalation requires an interpretive summary.","Every approval thread must include one dramatic reveal.","Every approval thread triggers a spontaneous audit.","Every approval thread creates one extra dependency.","Every approval thread requires snacks for quorum.","Every approval thread summons the committee.","Every approval thread forces polite overreaction.","Every approval thread adds a ceremonial checkpoint.","Every approval thread resets the confidence score.","Every approval thread converts certainty into caveats.","Every approval thread requires an interpretive summary.","All postmortems must include one dramatic reveal.","All postmortems triggers a spontaneous audit.","All postmortems creates one extra dependency.","All postmortems requires snacks for quorum.","All postmortems summons the committee.","All postmortems forces polite overreaction.","All postmortems adds a ceremonial checkpoint.","All postmortems resets the confidence score.","All postmortems converts certainty into caveats.","All postmortems requires an interpretive summary."],"laws":["Law of Deferred Clarity: The more people approve it, the weirder it becomes.","Law of Deferred Clarity: A delayed decision doubles in ceremony every sprint.","Law of Deferred Clarity: Any metric can be heroic if graphed with enough confidence.","Law of Deferred Clarity: If nobody owns it, it belongs to everyone in theory.","Law of Deferred Clarity: Every workaround eventually acquires documentation.","Law of Deferred Clarity: The shortest meeting is always the one that gets cancelled.","Law of Deferred Clarity: Escalations travel faster than context.","Law of Deferred Clarity: Every policy produces equal and opposite exceptions.","Law of Deferred Clarity: Roadmaps bend toward whichever slide has color gradients.","Law of Deferred Clarity: A critical bug always waits for lunch hour.","Law of Escalation Thermodynamics: The more people approve it, the weirder it becomes.","Law of Escalation Thermodynamics: A delayed decision doubles in ceremony every sprint.","Law of Escalation Thermodynamics: Any metric can be heroic if graphed with enough confidence.","Law of Escalation Thermodynamics: If nobody owns it, it belongs to everyone in theory.","Law of Escalation Thermodynamics: Every workaround eventually acquires documentation.","Law of Escalation Thermodynamics: The shortest meeting is always the one that gets cancelled.","Law of Escalation Thermodynamics: Escalations travel faster than context.","Law of Escalation Thermodynamics: Every policy produces equal and opposite exceptions.","Law of Escalation Thermodynamics: Roadmaps bend toward whichever slide has color gradients.","Law of Escalation Thermodynamics: A critical bug always waits for lunch hour.","Law of Executive Gravity: The more people approve it, the weirder it becomes.","Law of Executive Gravity: A delayed decision doubles in ceremony every sprint.","Law of Executive Gravity: Any metric can be heroic if graphed with enough confidence.","Law of Executive Gravity: If nobody owns it, it belongs to everyone in theory.","Law of Executive Gravity: Every workaround eventually acquires documentation.","Law of Executive Gravity: The shortest meeting is always the one that gets cancelled.","Law of Executive Gravity: Escalations travel faster than context.","Law of Executive Gravity: Every policy produces equal and opposite exceptions.","Law of Executive Gravity: Roadmaps bend toward whichever slide has color gradients.","Law of Executive Gravity: A critical bug always waits for lunch hour.","Law of Queue Conservation: The more people approve it, the weirder it becomes.","Law of Queue Conservation: A delayed decision doubles in ceremony every sprint.","Law of Queue Conservation: Any metric can be heroic if graphed with enough confidence.","Law of Queue Conservation: If nobody owns it, it belongs to everyone in theory.","Law of Queue Conservation: Every workaround eventually acquires documentation.","Law of Queue Conservation: The shortest meeting is always the one that gets cancelled.","Law of Queue Conservation: Escalations travel faster than context.","Law of Queue Conservation: Every policy produces equal and opposite exceptions.","Law of Queue Conservation: Roadmaps bend toward whichever slide has color gradients.","Law of Queue Conservation: A critical bug always waits for lunch hour.","Law of Budget Relativity: The more people approve it, the weirder it becomes.","Law of Budget Relativity: A delayed decision doubles in ceremony every sprint.","Law of Budget Relativity: Any metric can be heroic if graphed with enough confidence.","Law of Budget Relativity: If nobody owns it, it belongs to everyone in theory.","Law of Budget Relativity: Every workaround eventually acquires documentation."],"headlines":["{authority} confirms {event} near {place}","{subsystem} begins to {verb} without approval","{absurdNoun} appointed deputy of {subsystem}","Breaking: {authority} schedules emergency {event}","{place} reports that {symptom}","Analysts warn {event} may impact {subsystem}","{authority} denies rumors of {absurdNoun} involvement","{subsystem} receives patch after {event}","Public update: {fix} now mandatory","{authority} launches inquiry into {symptom}","{place} welcomes temporary {subsystem} freeze","Quarterly note: {event} exceeds forecast","Hotfix bulletin: {subsystem} will {verb} at dawn","Rumor mill: {absurdNoun} seen in {place}","Executive order: {fix} effective immediately","Live feed: {authority} redefines success criteria","Policy desk: {event} now considered strategic","Operations digest: {symptom} downgraded to known behavior","War room update: {subsystem} now partially symbolic","Newsflash: {authority} approves reversible reality","Advisory 21: {subsystem} and {absurdNoun} coordinate loudly","Advisory 22: {subsystem} and {absurdNoun} coordinate quietly","Advisory 23: {subsystem} and {absurdNoun} coordinate loudly","Advisory 24: {subsystem} and {absurdNoun} coordinate quietly","Advisory 25: {subsystem} and {absurdNoun} coordinate loudly","Advisory 26: {subsystem} and {absurdNoun} coordinate quietly","Advisory 27: {subsystem} and {absurdNoun} coordinate loudly","Advisory 28: {subsystem} and {absurdNoun} coordinate quietly","Advisory 29: {subsystem} and {absurdNoun} coordinate loudly","Advisory 30: {subsystem} and {absurdNoun} coordinate quietly","Advisory 31: {subsystem} and {absurdNoun} coordinate loudly","Advisory 32: {subsystem} and {absurdNoun} coordinate quietly","Advisory 33: {subsystem} and {absurdNoun} coordinate loudly","Advisory 34: {subsystem} and {absurdNoun} coordinate quietly","Advisory 35: {subsystem} and {absurdNoun} coordinate loudly"],"patchNotes":["Adjusted {subsystem} to {verb} within legal daylight.","Mitigated {symptom} by asking everyone to {fix}.","Added fallback path through {place}.","Replaced unstable {absurdNoun} with supervised variant.","Introduced optional ceremony for {event}.","Reduced alert volume by teaching {subsystem} patience.","Improved reliability after {authority} approved snacks.","Patched compatibility issue between {subsystem} and {authority}.","Enabled verbose mode whenever {symptom} appears.","Documented emergency response: {fix}.","Patch 11: {subsystem} will {verb} unless {event}.","Patch 12: {subsystem} will {verb} unless {symptom}.","Patch 13: {subsystem} will {verb} unless {event}.","Patch 14: {subsystem} will {verb} unless {symptom}.","Patch 15: {subsystem} will {verb} unless {event}.","Patch 16: {subsystem} will {verb} unless {symptom}.","Patch 17: {subsystem} will {verb} unless {event}.","Patch 18: {subsystem} will {verb} unless {symptom}.","Patch 19: {subsystem} will {verb} unless {event}.","Patch 20: {subsystem} will {verb} unless {symptom}.","Patch 21: {subsystem} will {verb} unless {event}.","Patch 22: {subsystem} will {verb} unless {symptom}.","Patch 23: {subsystem} will {verb} unless {event}.","Patch 24: {subsystem} will {verb} unless {symptom}.","Patch 25: {subsystem} will {verb} unless {event}.","Patch 26: {subsystem} will {verb} unless {symptom}.","Patch 27: {subsystem} will {verb} unless {event}.","Patch 28: {subsystem} will {verb} unless {symptom}.","Patch 29: {subsystem} will {verb} unless {event}.","Patch 30: {subsystem} will {verb} unless {symptom}."],"absurdNouns":["spreadsheet ghost","budget basilisk","synergy walrus","compliance otter","latency goblin","roadmap oracle","meeting hydra","procurement phoenix","escalation llama","dashboard druid","policy chimera","ticket kraken","forecast sphinx","audit peacock","retrospective gargoyle","merger jellyfish","timeline unicorn","workflow minotaur","bonus raccoon","governance octopus","pager centaur","SLA mermaid","runbook kangaroo","committee dragon","hamster CFO","shadow intern","variance wizard","escalation ferret","budget troll","calendar vampire"],"authorities":["The Committee","Regional Destiny Office","Interdepartmental Oracle","Quarterly Tribunal","Board of Plausible Outcomes","Department of Incident Folklore","Office of Narrative Risk","Task Force for Gentle Panic","Cabinet of Adjacent Synergies","Chief Reality Accountant","Program Management Constellation","Escalation Choir","Parliament of Metrics","Unified Ticket Command","Council of Placeholder Reduction","Order of Compliance Wizards","Procurement Sanctum","Vendor Alignment Bureau","SRE Senate","Audit Rangers","Office of Predictive Excuses","Chief Calendar Marshal","Architecture Guild","Red Tape Directorate","Strategic Delay Authority","Workflow Standards Monastery","Policy Design Studio","Portal Operations Court","Executive Cartographers","Quality Seance Unit"],"events":["alignment summit","incident parade","silent reorg","forecast eclipse","metric migration","budget inversion","policy thunderstorm","vendor moonwalk","audit migration","postmortem recital","escalation brunch","roadmap drought","comms avalanche","retro loop","runbook renaissance","platform carnival","change-freeze thaw","stakeholder eclipse","priority shuffle","token ceremony","KPI bloom","service freeze","queue uprising","latency harvest","compliance tide","merger afterparty","dashboard blackout","handoff migration","sprint pilgrimage","estimate correction"],"places":["North Datacenter Atrium","Room 7B","The Quiet War Room","Executive Stairwell","Parking Lot C","Floor 12 Snack Zone","Integration Annex","Legacy Vault","Cloud Basement","Control Deck","Ceremonial Standup Circle","Regional Queue Dock","Observability Balcony","Policy Greenhouse","Vendor Loading Bay","KPI Aquarium","Metrics Chapel","SRE Balcony","Legal Escape Hatch","Feature Flag Lounge","Comms Bunker","Risk Conservatory","Escalation Kiosk","Data Observatory","Ticket Orchard","Platform Pier","Compliance Forge","Ritual Deploy Dock","Sandbox Plaza","Shadow PM Alcove"],"verbs":["harmonize","escalate","downgrade","negotiate","reboot","translate","invoice","containerize","bless","deprecate","triage","stabilize","gamify","franchise","compress","audit","forecast","ritualize","outsource","rediscover","backfill","reinterpret","normalize","synchronize","timebox","transpose","sanitize","invalidate","propagate","calibrate"],"subsystems":["queue fabric","forecast engine","incident siren","policy router","memo compiler","entropy gateway","compliance mesh","timeline switchboard","approval cache","meeting parser","tarot daemon","runbook exchanger","portal beacon","risk matrix","latency tribunal","customer mirage","budget allocator","sync orchestra","checkpoint relay","narrative firewall","vendor bridge","escalation modem","artifact registry","museum index","decision furnace","audit sequencer","probability lattice","stakeholder bus","governance hub","chaos amplifier"],"symptoms":["reports now rhyme","alerts are whispering","all dashboards blink in iambic pentameter","releases occur in reverse","tickets reopen themselves","metrics developed stage fright","logs switched to passive voice","time estimates are all prime numbers","approvals loop every 11 minutes","roadmap arrows point inward","on-call phone requests applause","deploy button demands tribute","SLA clocks speed up near executives","incident channel only accepts haiku","status pages became opinionated","calendar sends passive-aggressive invites","build server requests emotional support","kubernetes renamed itself","audit logs now smell like cinnamon","chatbot files PTO","forecast includes weather","postmortems start with spoilers","spreadsheet tabs unionized","runbooks ask for plot twists","backup job requests recognition","changelog became fan fiction","DNS answers in riddles","feature flags picked sides","pager escalates to household pets","meeting notes appeared in all caps"],"fixes":["reboot the committee","rotate the standing desk 90 degrees","sacrifice a stale gantt chart","disable optimism mode","patch with temporary clarity","roll back to last Tuesday","promote the intern to timeline custodian","rename the queue for luck","issue a ceremonial hotfix","replace the dashboard background","ship fewer surprises","add one more approval layer","bribe the cache with snacks","deploy empathy v2","apply a reversible policy","turn off buzzword autocompletion","rewrite the memo in plain language","re-seed the incident generator","open a dedicated panic window","decommission ceremonial blockers","realign the status emojis","convert meetings to voice notes","install anti-chaos guardrails","admit uncertainty in writing","enable controlled absurdity","archive legacy rituals","restore ownership mapping","introduce timeout diplomacy","invalidate all mystery constants","invoke contingency karaoke"]}
```

FILE: content/exec_memos.json
```
{"meta":{"name":"Executive Memo Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Satirical executive communication fragments for memo generation."},"subjects":["Strategic justification for {initiative}","Operational memo: why {topic} is now a priority","Decision rationale for {initiative} in Q-next","Temporary policy framing for {topic}","Cross-functional note on {initiative}","Capital request: protecting {metric}","Narrative support for {topic}","Escalation-prevention memo for {initiative}","Executive digest: {topic} and continuity","Risk-position update on {initiative}","Guardrail memo for {topic}","Stakeholder reassurance plan for {initiative}","Interim doctrine for {topic}","Board-facing summary of {initiative}","Next-quarter framing for {topic}","Operating note: containing volatility in {initiative}","Governance stance on {topic}","Transformation memo: {initiative}","Resource rationale for {topic}","Narrative and controls package for {initiative}","Escalation shield around {topic}","Operating thesis on {initiative}","Urgent calm memo: {topic}","Plan of record for {initiative}"],"openers":["In alignment with current enterprise posture, we are formalizing a practical interpretation of this issue.","Following stakeholder concern and one loud dashboard, we recommend immediate narrative control.","Given market optics and hallway sentiment, this memo frames a reversible commitment.","This note codifies why doing nothing looked risky in a slide deck.","To preserve cross-functional trust, we will be decisive in writing and flexible in implementation.","The purpose of this memo is to make an expensive surprise sound deliberate.","Recent incidents suggest that informal optimism no longer scales.","After rigorous interpretation of partial evidence, we propose an orderly escalation.","This recommendation balances risk appetite, calendar reality, and executive choreography.","In service of continuity, we are introducing a controlled amount of urgency.","We can either govern this now or document why it governed us later.","This rationale translates panic into policy language.","We observed a gap between what we promised and what physics delivered.","The organization is ready for a coordinated overreaction.","To avoid accidental strategy, we recommend explicit intent.","This proposal protects outcomes while preserving optional blame routing.","A temporary doctrine is required before the rumor cycle sets architecture.","The current model relies too heavily on luck and caffeinated heroics.","We are at the point where a memo is cheaper than another surprise outage.","To reduce entropy, this memo introduces measured constraints.","The leadership consensus is clear: ambiguity should be centrally managed.","We can continue improvising, or we can improvise with standards."],"initiatives":["Narrative Containment Program","Zero Surprise Deployment","Quarterly Calm Initiative","Unified Escalation Protocol","Predictable Weirdness Framework","Policy-as-Code Revival","Runtime Diplomacy Layer","Executive Trust Rebuild","Governed Chaos Pilot","Cross-Team Reality Alignment","Incident Theater Reduction","Documentation Fluency Sprint","Portal Stability Upgrade","Strategic Queue Hygiene","Forecast Integrity Project","Operational Candor Campaign","Approval Cycle Compression","Meeting Debt Burn Down","Risk Ledger Refresh","Comms Precision Program","Platform Guardrail Initiative","SLO Credibility Repair","Observability Rehab","Dependency Diet","Expectation Management Stack","Stakeholder Noise Dampener","Clarity Tax Abatement","Actionability Upgrade","Schedule Honesty Pact","Two-Week Certainty Experiment","Decision Latency Reduction","Escalation Literacy Program"],"metrics":["Mean Time To Perspective","Escalation Half-Life","Percent of Calm Deployments","Memo-to-Action Ratio","Stakeholder Blood Pressure","Queue Dignity Index","Pager Surprise Score","Policy Drift Coefficient","Postmortem Follow-Through","Narrative Consistency Rate","Approval Cycle Minutes","Forecast Reality Delta","Runbook Readability","After-Hours Heroics","Comms Precision","Ticket Reopen Velocity","Context Loss Rate","Decision Reversal Ratio","Toolchain Morale","Executive Confidence","Incident Plot Complexity","Rework Burn Rate","Scope Gravity","System Sigh Frequency","Retro Completion Rate","Cross-Team Trust","Audit Friction"],"stakeholders":["Platform","Security","SRE","Product","Legal","Comms","Support","Data","QA","Facilities","Finance","Procurement","Customer Success","Architecture","People Ops","The Committee","Field Engineering","RevOps","Partnerships","Risk Office","Executive Staff","Operations","Program Management","Analytics","Compliance","Brand","Infrastructure"],"rationales":["Current process volatility is eroding Memo-to-Action Ratio. Impact lens: Platform + Memo-to-Action Ratio.","Current process volatility is eroding Stakeholder Blood Pressure. Impact lens: Security + Stakeholder Blood Pressure.","Current process volatility is eroding Queue Dignity Index. Impact lens: SRE + Queue Dignity Index.","Current process volatility is eroding Pager Surprise Score. Impact lens: Product + Pager Surprise Score.","Current process volatility is eroding Policy Drift Coefficient. Impact lens: Legal + Policy Drift Coefficient.","Current process volatility is eroding Postmortem Follow-Through. Impact lens: Comms + Postmortem Follow-Through.","Current process volatility is eroding Narrative Consistency Rate. Impact lens: Support + Narrative Consistency Rate.","Current process volatility is eroding Approval Cycle Minutes. Impact lens: Data + Approval Cycle Minutes.","Current process volatility is eroding Forecast Reality Delta. Impact lens: QA + Forecast Reality Delta.","Current process volatility is eroding Runbook Readability. Impact lens: Facilities + Runbook Readability.","Current process volatility is eroding After-Hours Heroics. Impact lens: Finance + After-Hours Heroics.","Current process volatility is eroding Comms Precision. Impact lens: Procurement + Comms Precision.","Current process volatility is eroding Ticket Reopen Velocity. Impact lens: Customer Success + Ticket Reopen Velocity.","Current process volatility is eroding Context Loss Rate. Impact lens: Architecture + Context Loss Rate.","A formal initiative protects Platform from ad-hoc escalation. Impact lens: Platform + Stakeholder Blood Pressure.","A formal initiative protects Security from ad-hoc escalation. Impact lens: Security + Queue Dignity Index.","A formal initiative protects SRE from ad-hoc escalation. Impact lens: SRE + Pager Surprise Score.","A formal initiative protects Product from ad-hoc escalation. Impact lens: Product + Policy Drift Coefficient.","A formal initiative protects Legal from ad-hoc escalation. Impact lens: Legal + Postmortem Follow-Through.","A formal initiative protects Comms from ad-hoc escalation. Impact lens: Comms + Narrative Consistency Rate.","A formal initiative protects Support from ad-hoc escalation. Impact lens: Support + Approval Cycle Minutes.","A formal initiative protects Data from ad-hoc escalation. Impact lens: Data + Forecast Reality Delta.","A formal initiative protects QA from ad-hoc escalation. Impact lens: QA + Runbook Readability.","A formal initiative protects Facilities from ad-hoc escalation. Impact lens: Facilities + After-Hours Heroics.","A formal initiative protects Finance from ad-hoc escalation. Impact lens: Finance + Comms Precision.","A formal initiative protects Procurement from ad-hoc escalation. Impact lens: Procurement + Ticket Reopen Velocity.","A formal initiative protects Customer Success from ad-hoc escalation. Impact lens: Customer Success + Context Loss Rate.","A formal initiative protects Architecture from ad-hoc escalation. Impact lens: Architecture + Decision Reversal Ratio.","We can convert recurring surprises into scheduled work. Impact lens: Platform + Queue Dignity Index.","We can convert recurring surprises into scheduled work. Impact lens: Security + Pager Surprise Score.","We can convert recurring surprises into scheduled work. Impact lens: SRE + Policy Drift Coefficient.","We can convert recurring surprises into scheduled work. Impact lens: Product + Postmortem Follow-Through.","We can convert recurring surprises into scheduled work. Impact lens: Legal + Narrative Consistency Rate.","We can convert recurring surprises into scheduled work. Impact lens: Comms + Approval Cycle Minutes.","We can convert recurring surprises into scheduled work. Impact lens: Support + Forecast Reality Delta.","We can convert recurring surprises into scheduled work. Impact lens: Data + Runbook Readability.","We can convert recurring surprises into scheduled work. Impact lens: QA + After-Hours Heroics.","We can convert recurring surprises into scheduled work. Impact lens: Facilities + Comms Precision.","We can convert recurring surprises into scheduled work. Impact lens: Finance + Ticket Reopen Velocity.","We can convert recurring surprises into scheduled work. Impact lens: Procurement + Context Loss Rate.","We can convert recurring surprises into scheduled work. Impact lens: Customer Success + Decision Reversal Ratio.","We can convert recurring surprises into scheduled work. Impact lens: Architecture + Toolchain Morale.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Platform + Pager Surprise Score.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Security + Policy Drift Coefficient.","Recent behavior shows unmanaged dependence on heroics. Impact lens: SRE + Postmortem Follow-Through.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Product + Narrative Consistency Rate.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Legal + Approval Cycle Minutes.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Comms + Forecast Reality Delta.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Support + Runbook Readability.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Data + After-Hours Heroics.","Recent behavior shows unmanaged dependence on heroics. Impact lens: QA + Comms Precision.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Facilities + Ticket Reopen Velocity.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Finance + Context Loss Rate.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Procurement + Decision Reversal Ratio.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Customer Success + Toolchain Morale.","Recent behavior shows unmanaged dependence on heroics. Impact lens: Architecture + Executive Confidence.","Codifying expectations will lower noise and increase throughput. Impact lens: Platform + Policy Drift Coefficient.","Codifying expectations will lower noise and increase throughput. Impact lens: Security + Postmortem Follow-Through."],"risks":["Over-centralized decision rights could slow incident response.","Unclear ownership may produce parallel workstreams.","Stakeholder fatigue could reduce adoption speed.","Metric gaming may increase if incentives remain unchanged.","Scope creep could hide inside friendly language.","Dependence on manual approvals may create bottlenecks.","Early wins may mask unresolved structural debt.","Lack of enforcement could turn this into optional reading.","Transition load may distract from core delivery.","Policy ambiguity could trigger regional inconsistencies.","Tooling gaps may force workaround behavior.","Expectations may outpace delivery capacity.","Vendor dependencies may limit sequencing options.","Comms lag may create rumor-driven escalations.","Legacy workflows may resist migration.","Incentive mismatch may preserve old habits.","Rapid rollout may degrade signal quality.","Board-level visibility may amplify minor misses.","Weak feedback loops may hide deterioration.","Cross-functional trust may be uneven.","Documentation debt may block handoffs.","Ownership overlap may blur accountability.","Success criteria may drift mid-quarter.","Resourcing assumptions may prove optimistic.","Seasonal demand spikes may invalidate baselines.","Escalation etiquette may vary by team.","Audit timing could collide with rollout.","Operational noise may conceal progress.","Hidden coupling may trigger side effects.","Inconsistent adoption could split governance.","Legacy metrics may reward old behaviors.","Decision latency may rebound after launch.","Support load may rise before controls mature.","Informal channels may bypass agreed process.","Backlog inflation may continue despite optics."],"mitigations":["Define owner-of-record for each workstream and publish weekly.","Use a 30-day review cycle with documented threshold triggers.","Introduce lightweight escalation path with explicit handoff points.","Track adoption against two leading indicators and one lagging indicator.","Require decision memos to include rollback options.","Protect implementation bandwidth with fixed capacity allocation.","Publish clear definitions for success and failure.","Timebox policy exceptions and log rationale.","Schedule stakeholder office hours for issue triage.","Automate recurring checks where manual drift is common.","Provide comms templates for incident and non-incident updates.","Run a pilot in one domain before global rollout.","Create dependency map and review weekly.","Align incentives with desired behaviors in planning cycle.","Require post-incident follow-up evidence before closure.","Use a single source of truth for status reporting.","Instrument queue depth and response latency daily.","Assign rotating risk owner to prevent silent decay.","Archive superseded guidance to reduce confusion.","Set executive expectation boundary conditions in writing.","Train managers on escalation criteria.","Add automated reminder for unresolved action items.","Create red/yellow/green thresholds for intervention.","Pair policy updates with practical examples.","Review metrics for gaming behavior monthly.","Keep implementation notes public by default.","Use structured check-ins instead of ad-hoc pings.","Introduce guardrail budget for unexpected load.","Document system assumptions and expiry dates.","Run a failure simulation each month.","Create fallback staffing plan for peak periods.","Publish short weekly narrative alongside numbers.","Treat exception volume as first-class signal.","Perform cross-team retros focused on handoffs.","Convert recurring exceptions into standard policy.","Instrument comms lag and escalate if breached.","Keep versioned changelog for governance decisions.","Use shadow on-call for rollout phase.","Link action item owners to measurable checkpoints.","Maintain open risk register with aging alerts."],"nextSteps":["Publish this memo to all delivery leaders and open Q&A window.","Start a 14-day pilot with Platform and Security.","Confirm owner list and success criteria by Friday.","Draft operating runbook and circulate for redline review.","Schedule checkpoint with executive staff in one week.","Launch adoption dashboard and baseline current values.","Align legal/comms language before external mention.","Create implementation timeline with weekly milestones.","Gather dependency risks and assign mitigation owners.","Initiate training session for frontline responders.","Run scenario tabletop with SRE and Product.","Archive conflicting legacy guidance.","Open feedback channel and track themes weekly.","Review initial metrics and adjust rollout scope.","Escalate unresolved blockers to steering group.","Define rollback criteria and communication trigger.","Map required tool updates and implementation effort.","Publish annotated FAQ for managers.","Validate resource allocation against sprint plans.","Set monthly governance review cadence.","Pilot comms template during next incident drill.","Attach action tracker to weekly status report.","Complete risk scoring pass with Data team.","Present interim outcomes to board committee.","Add compliance controls to policy checklist.","Confirm incident ownership matrix with Ops.","Record lessons from pilot and revise doctrine.","Launch phase two with controlled expansion.","Review cost impact with Finance and Procurement.","Declare policy effective date and grace period.","Enable automated alerts for threshold breaches.","Schedule retrospective and publish outcomes.","Consolidate duplicate workflows by end of month.","Create public changelog for stakeholder trust.","Evaluate sunset criteria for temporary controls.","Decide go/no-go for broader rollout.","Integrate feedback into next planning cycle.","Assign backup owner for every critical task.","Close open ambiguities before execution window.","Document assumptions and revisit quarterly."],"signatures":["R. Halberd, EVP of Controlled Outcomes","M. Quartz, Chief Practical Optimism Officer","S. Voss, VP of Narrative Risk","J. Kepler, Director of Predictable Surprises","A. Lumen, Program Lead, Strategic Stability","D. Finch, Acting Head of Escalation Hygiene","P. Rowan, Operations Portfolio Manager","N. Vale, Office of Enterprise Coherence","C. Morrow, Interim Chief of Timeline Affairs","T. Mercer, Senior Director, Guardrails","E. Sol, Governance and Delivery","Y. Kline, Director of Incident Literacy","B. Quinn, VP, Platform Accountability","I. Ford, Program Executive, Continuity","L. Serrano, Chief of Practical Alignment","K. Ito, Head of Queue Reliability","F. Hale, Director, Cross-Team Response","The Committee, On Behalf of Itself"],"topics":["Narrative Containment Program","Zero Surprise Deployment","Quarterly Calm Initiative","Unified Escalation Protocol","Predictable Weirdness Framework","Policy-as-Code Revival","Runtime Diplomacy Layer","Executive Trust Rebuild","Governed Chaos Pilot","Cross-Team Reality Alignment","Incident Theater Reduction","Documentation Fluency Sprint","Portal Stability Upgrade","Strategic Queue Hygiene","Forecast Integrity Project","Operational Candor Campaign","Approval Cycle Compression","Meeting Debt Burn Down","Risk Ledger Refresh","Comms Precision Program","Platform Guardrail Initiative","SLO Credibility Repair","Observability Rehab","Dependency Diet","Expectation Management Stack","Stakeholder Noise Dampener","Clarity Tax Abatement","Actionability Upgrade","Schedule Honesty Pact","Two-Week Certainty Experiment","Decision Latency Reduction","Escalation Literacy Program","late-stage scope correction","cross-team dependency debt","silent rollback culture","high-noise incident channels","calendar-induced latency","meeting sprawl containment","tooling fragmentation","legacy workflow arbitration","executive confidence drift","on-call sustainability","forecast overfitting","vendor coupling","policy exception inflation","handoff ambiguity","runbook entropy","deployment ceremony overload","risk appetite mismatch","ownership diffusion","communication lag","decision fatigue","temporary hotfix permanency","unplanned heroics","queue saturation","priority inversion","retro action leakage","context switching tax","narrative inconsistency","audit readiness","service volatility","feature flag debt","support escalation volume","compliance routing","priority theater","roadmap overcommitment"]}
```

FILE: content/meeting_translator.json
```
{"meta":{"name":"Meeting Translator Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Corporate jargon map and translation scaffolding for meeting decryption."},"map":[{"contains":"circle back","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"circle back\" with extra budget anxiety."]},{"contains":"take this offline","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"take this offline\" with extra budget anxiety."]},{"contains":"parking lot","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"parking lot\" with extra budget anxiety."]},{"contains":"quick win","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"quick win\" with extra budget anxiety."]},{"contains":"double click","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"double click\" with extra budget anxiety."]},{"contains":"align","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"align\" with extra budget anxiety."]},{"contains":"socialize","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"socialize\" with extra budget anxiety."]},{"contains":"right-size","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"right-size\" with extra budget anxiety."]},{"contains":"actionable","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"actionable\" with extra budget anxiety."]},{"contains":"no-brainer","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"no-brainer\" with extra budget anxiety."]},{"contains":"bandwidth","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"bandwidth\" with extra budget anxiety."]},{"contains":"boil the ocean","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"boil the ocean\" with extra budget anxiety."]},{"contains":"north star","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"north star\" with extra budget anxiety."]},{"contains":"move the needle","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"move the needle\" with extra budget anxiety."]},{"contains":"low-hanging fruit","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"low-hanging fruit\" with extra budget anxiety."]},{"contains":"deep dive","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"deep dive\" with extra budget anxiety."]},{"contains":"touch base","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"touch base\" with extra budget anxiety."]},{"contains":"table this","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"table this\" with extra budget anxiety."]},{"contains":"hard stop","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"hard stop\" with extra budget anxiety."]},{"contains":"strategic","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"strategic\" with extra budget anxiety."]},{"contains":"visibility","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"visibility\" with extra budget anxiety."]},{"contains":"best practice","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"best practice\" with extra budget anxiety."]},{"contains":"synergy","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"synergy\" with extra budget anxiety."]},{"contains":"ownership","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"ownership\" with extra budget anxiety."]},{"contains":"quick question","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"quick question\" with extra budget anxiety."]},{"contains":"escalate","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"escalate\" with extra budget anxiety."]},{"contains":"roadmap","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"roadmap\" with extra budget anxiety."]},{"contains":"scope","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"scope\" with extra budget anxiety."]},{"contains":"timeline","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"timeline\" with extra budget anxiety."]},{"contains":"blocker","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"blocker\" with extra budget anxiety."]},{"contains":"dependencies","means":["We are uncertain and would like more time before committing.","Nobody wants to own this yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need this to sound proactive while we gather context.","Please translate this into a task someone else can execute.","This phrase currently means \"dependencies\" with extra budget anxiety."]},{"contains":"optics","means":["We are uncertain and would like more time before committing.","Nobody wants to own that yet, but everyone wants to look cooperative.","The real decision happened already in a smaller room.","We need that to sound proactive while we gather context.","Please translate that into a task someone else can execute.","This phrase currently means \"optics\" with extra budget anxiety."]}],"generic":["Translation: we are stalling politely.","Translation: a hidden dependency just appeared.","Translation: ownership is currently theoretical.","Translation: this needs a decision, but not in this meeting.","Translation: the timeline is optimistic fiction.","Translation: risk exists but lacks a slide.","Translation: someone promised this before checking with engineering.","Translation: priorities changed mid-sentence.","Translation: this requires cross-team diplomacy.","Translation: we need data before opinions harden.","Translation: this is now your problem if you nod.","Translation: we are negotiating scope in real time.","Translation: nobody wants to say no on camera.","Translation: this may become an incident report.","Translation: the action item is hiding in passive voice.","Translation: we are aligning around ambiguity.","Translation: the answer is yes, but with twelve caveats.","Translation: the issue is social, not technical.","Translation: this was discovered five minutes ago.","Translation: the plan depends on calendar miracles.","Translation: we need one brave owner.","Translation: this requires executive air cover.","Translation: this is a policy gap in disguise.","Translation: we need to stop saying 'quick'."],"vibes":["polite panic","disciplined confusion","confident uncertainty","agile dread","measured optimism","ceremonial urgency","governed chaos","calendar grief","strategic sighing","escalation jazz","committed ambiguity","high-context turbulence","resource anxiety","quiet alarm","constructive denial","retroactive confidence","sincere improvisation","operational suspense","defensive enthusiasm","quarterly melodrama","board-friendly tension","metrics cosplay"],"actions":["assign a clear owner","freeze scope for 72 hours","write the ugly truth in one paragraph","separate must-do from nice-to-have","confirm dependencies with names","create a rollback path","add decision deadline","publish action tracker","run a cross-team triage","remove one approval layer","replace jargon with tasks","escalate unresolved blockers","protect focus time","simplify reporting format","align incentives","de-risk launch plan","split work into reversible chunks","clarify success criteria","validate timeline assumptions","schedule follow-up with decision makers","capture open questions","document tradeoffs"],"timelines":["today","within 24 hours","before next standup","this sprint","by Friday","within one week","before launch freeze","before finance closes the month","before incident review","after dependency confirmation","once owners acknowledge","after legal signs wording","within two business days","before status report","in the next planning cycle","before roadmap lock","after pilot metrics","by next retro","before next leadership sync","inside current quarter","as soon as ambiguity drops","before rumor velocity exceeds facts"],"summaryTemplates":["Vibe: {vibe}. Action: {action}. Timeline: {timeline}.","This conversation is {vibe}; do {action} {timeline}.","Underneath the jargon: {vibe}. Recommendation: {action} {timeline}.","Signal check -> {vibe}. Next move: {action} {timeline}.","Interpretation: {vibe}. Execution request: {action} {timeline}.","Atmosphere is {vibe}; practical step is to {action} {timeline}.","Meeting translation: {vibe}. Please {action} {timeline}.","Summary: {vibe}. Team should {action} {timeline}.","Decoded intent: {vibe}. Convert to action: {action} {timeline}.","Decision weather: {vibe}. Countermeasure: {action} {timeline}.","Operational read: {vibe}. Suggested move: {action} {timeline}.","Board-safe version: {vibe}; teams must {action} {timeline}.","Reality check: {vibe}. Do this now: {action} {timeline}.","Net-net: {vibe}. Step one: {action} {timeline}.","Short answer: {vibe}. Long answer: {action} {timeline}.","Translation complete: {vibe}. Execute by {timeline}: {action}."],"sampleLines":["Let's circle back after we socialize this with leadership.","Can we take this offline and right-size the ask?","I need more visibility before we move the needle.","This should be a quick win if dependencies cooperate.","We should table this until roadmap alignment.","I have a hard stop but this is strategic.","Can someone own this blocker by end of day?","We're trying not to boil the ocean here.","Let's deep dive next sprint and keep optics clean.","This no-brainer has become a cross-functional effort.","Can we align on scope before touching timeline?","We'll touch base after legal reviews language.","Bandwidth is tight, but we can escalate if needed.","This needs best-practice framing for the board.","Let's parking-lot this until support joins.","We need actionable next steps, not vibes.","Can we double click the rollback path?","Dependencies are still fluid in this phase.","Timeline is aggressive but not impossible.","Quick question: who actually approves this?","Ownership is shared, which means currently none.","Can we socialize this memo before deployment?","Let's align on what done looks like.","If scope expands, timeline must move.","This is strategic, not urgent, except now urgent.","Visibility is good, execution is pending.","We need synergy between teams and maybe reality.","Please escalate only after trying common sense.","Roadmap changed overnight; no one blinked.","Can we avoid a heroics-based launch?","Let's convert this discussion into owner-tagged tasks.","We should check blocker status before leadership sync.","I need confidence intervals, not adjectives.","Can we treat this as reversible?","Support needs context before comms goes out.","Let's de-risk in slices instead of one moonshot.","I hear agreement and zero commitments.","Can we ship less and sleep more?"]}
```

FILE: content/probability_engine.json
```
{"meta":{"name":"Probability Engine Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Scenario risk data for deterministic probability narratives."},"scenarios":["Launching a patch while leadership is in flight","Merging two queues during an active incident","Skipping runbook review for speed","Adding a new vendor before quarter close","Releasing on Friday afternoon","Announcing scope freeze without product","Running migration with stale ownership map","Consolidating alerts without testing fallback","Renaming services mid-oncall","Cutting observability budget","Sharing one dashboard across four teams","Rebuilding incident channel taxonomy","Delaying security review to sprint end","Deploying with known flaky tests","Using temporary credentials in production","Pivoting roadmap after demo day","Changing escalation policy during holidays","Running compliance audit and migration simultaneously","Moving data pipelines during billing window","Retiring legacy queue with hidden dependencies","Performing rollback without comms draft","Merging support and ops inboxes","Switching feature flags at peak traffic","Reducing QA cycle under deadline","Handing on-call to a new team","Refactoring auth flow before launch","Updating terms of service during outage","Removing manual approvals overnight","Compressing three initiatives into one sprint","Introducing a new incident severity matrix","Rotating secrets during vendor outage","Adding AI summaries to status updates","Consolidating repos with active hotfixes","Deferring postmortem follow-up","Ignoring low-severity alert storms","Reassigning ownership before vacation","Testing disaster recovery live","Shipping UI rewrite with no fallback","Changing payment retry logic","Combining feature freeze and reorg","Moving analytics events without schema review","Triggering full cache flush globally","Launching self-serve controls without docs","Expanding pilot without success criteria","Auto-closing stale tickets","Merging legal and technical sign-off","Skipping dependency review","Turning off chaos experiments suddenly","Promoting beta workflow to default","Sunsetting runbook templates","Converting incidents to async updates","Reducing meeting cadence during crisis","Using one SLA for all services","Changing monitoring vendor","Re-prioritizing every Monday","Running concurrent architecture councils","Delegating root cause writeup to interns","Migrating storage tier with unknown load","Enabling dark launch for billing","Allowing unbounded retries","Launching translated comms without review","Coupling deploy and content release","Delaying patch by waiting for perfect certainty","Pausing incident drills for quarter"],"baseRates":[{"label":"Mostly fine","score":18,"weight":8,"absurdity":1.2},{"label":"Manageable wobble","score":27,"weight":9,"absurdity":1.2},{"label":"Mild turbulence","score":34,"weight":8,"absurdity":1.3},{"label":"Noticeable risk","score":41,"weight":7,"absurdity":1.35},{"label":"Fragile confidence","score":47,"weight":6,"absurdity":1.4},{"label":"Escalation scent","score":54,"weight":5,"absurdity":1.5},{"label":"Sustained concern","score":60,"weight":5,"absurdity":1.55},{"label":"Comms pre-draft","score":66,"weight":4,"absurdity":1.6},{"label":"Red-leaning","score":72,"weight":3,"absurdity":1.7},{"label":"Incident-adjacent","score":77,"weight":3,"absurdity":1.8},{"label":"Ominous","score":83,"weight":2,"absurdity":1.9},{"label":"Legendary concern","score":90,"weight":1,"absurdity":2}],"modifiers":[{"factor":"single-threaded ownership","delta":7,"weight":5,"absurdity":1.4},{"factor":"unclear rollback plan","delta":10,"weight":5,"absurdity":1.5},{"factor":"recent staffing churn","delta":8,"weight":4,"absurdity":1.4},{"factor":"fresh documentation","delta":-9,"weight":4,"absurdity":1.1},{"factor":"known dependency map","delta":-7,"weight":4,"absurdity":1.1},{"factor":"new tooling rollout","delta":6,"weight":4,"absurdity":1.4},{"factor":"holiday calendar overlap","delta":9,"weight":3,"absurdity":1.6},{"factor":"strong on-call bench","delta":-8,"weight":4,"absurdity":1.1},{"factor":"executive attention","delta":5,"weight":3,"absurdity":1.4},{"factor":"cross-team dependency fog","delta":11,"weight":4,"absurdity":1.6},{"factor":"staged rollout","delta":-6,"weight":4,"absurdity":1.1},{"factor":"manual checklist usage","delta":3,"weight":3,"absurdity":1.2},{"factor":"automated guardrails","delta":-10,"weight":3,"absurdity":1.05},{"factor":"late requirement changes","delta":8,"weight":4,"absurdity":1.5},{"factor":"tested fallback","delta":-7,"weight":4,"absurdity":1.1},{"factor":"vendor uncertainty","delta":9,"weight":3,"absurdity":1.6},{"factor":"service ownership clarity","delta":-6,"weight":4,"absurdity":1.1},{"factor":"legacy codepaths","delta":7,"weight":4,"absurdity":1.5},{"factor":"incident fatigue","delta":10,"weight":3,"absurdity":1.6},{"factor":"fresh postmortem action","delta":-5,"weight":4,"absurdity":1.1},{"factor":"ad-hoc communication","delta":6,"weight":4,"absurdity":1.5},{"factor":"clear escalation matrix","delta":-6,"weight":4,"absurdity":1.1},{"factor":"silent assumptions","delta":8,"weight":4,"absurdity":1.6},{"factor":"guardrail budget","delta":-4,"weight":3,"absurdity":1.1},{"factor":"new team handoff","delta":9,"weight":3,"absurdity":1.5},{"factor":"healthy alert hygiene","delta":-5,"weight":4,"absurdity":1.1},{"factor":"unbounded retries","delta":11,"weight":2,"absurdity":1.9},{"factor":"approved change window","delta":-5,"weight":4,"absurdity":1.1},{"factor":"partial feature flag coverage","delta":4,"weight":3,"absurdity":1.3},{"factor":"dependency rehearsal completed","delta":-7,"weight":3,"absurdity":1.1},{"factor":"fuzzy success criteria","delta":7,"weight":4,"absurdity":1.5},{"factor":"experienced incident commander","delta":-6,"weight":3,"absurdity":1.1},{"factor":"compressed timeline","delta":8,"weight":4,"absurdity":1.5},{"factor":"quiet launch strategy","delta":-3,"weight":3,"absurdity":1.15},{"factor":"stakeholder misalignment","delta":9,"weight":3,"absurdity":1.6}],"moods":["cautiously optimistic","quietly nervous","boardroom tense","methodically skeptical","preemptively defensive","incident-aware","surprisingly calm","mildly dramatic","policy-heavy","signal-seeking","deadline haunted","sprint-resigned","earnestly pragmatic","compliance caffeinated","risk-curious","documentation positive","escalation-ready","weatherproof","queue-aware","ritually confident","measured alarm","quietly theatrical"],"explanations":["Given {scenario}, current posture is {mood}; {factor} pushes the band toward {band}.","This setup reads {mood}. The dominant driver is {factor}, with secondary pressure from {modifier}.","Scenario review indicates {band} exposure because {factor} remains unresolved.","Risk mood is {mood}; if {modifier} persists, this likely stays {band}.","Model output is {band}. Main influence: {factor}.","The pattern is {mood}; unresolved {factor} increases operational fragility.","Assessment lands in {band} as {modifier} compounds baseline uncertainty.","This appears {mood}, but {factor} keeps volatility elevated.","Confidence is moderate; {factor} and {modifier} shape a {band} profile.","Narrative: {scenario} under {mood} conditions trends {band}.","Signal quality suggests {band} risk with emphasis on {factor}.","Observation: {mood}. Intervention needed where {factor} intersects {modifier}.","Current state sits in {band}; top pressure comes from {factor}.","Operational readout: {mood}, with {modifier} amplifying {factor}.","Result is {band}; this is mostly a {factor} problem.","This case remains {mood}; treat {modifier} before it compounds.","The system profile is {band} due to persistent {factor}.","Risk remains {mood}; unresolved {modifier} narrows recovery options.","Output leans {band}; {factor} dominates the model.","Projection: {scenario} with {mood} governance equals {band} unless corrected.","The model calls {band}; {factor} is the sharp edge.","Condition is {mood}; {modifier} makes this less forgiving."],"controls":["Assign one accountable owner and one backup owner.","Define explicit rollback criteria before execution.","Publish dependency checklist with names and dates.","Run a 30-minute preflight risk review.","Gate release behind automated guardrail checks.","Reduce scope to the minimum reversible slice.","Prewrite incident comms with approval path.","Verify observability coverage for critical paths.","Schedule deployment during staffed window.","Confirm handoff protocol across teams.","Track risk deltas daily until stabilization.","Freeze non-essential changes during rollout.","Set threshold alerts for early warning signals.","Require status updates in one channel only.","Validate vendor SLAs against scenario assumptions.","Run tabletop rehearsal with key stakeholders.","Attach action owners to every mitigation task.","Document known unknowns before launch.","Align legal/comms language ahead of incident potential.","Protect focus capacity for responders.","Add temporary on-call shadow rotation.","Archive stale guidance and publish one source of truth.","Use feature flags with measured ramp schedule.","Monitor customer impact metrics hourly.","Escalate unresolved blockers within 24 hours.","Review incident runbook for this scenario.","Log exceptions and revisit at weekly governance.","Require explicit go/no-go checkpoint.","Measure confidence and not just progress.","Audit alert noise before release.","Introduce stop condition if risk score spikes.","Keep leadership informed without channel flooding.","Instrument timeline assumptions with real data.","Add post-launch validation step.","Track mitigation completion by owner.","Ensure support has scripts and context.","Align roadmap promises to delivery reality.","Convert temporary workarounds into tracked debt.","Pair technical and comms leads for response.","Timebox decision windows to avoid drift."]}
```

FILE: content/npc_dialogue.json
```
{"meta":{"name":"NPC Hotline Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"NPC archetypes and mission fragments for hotline summoning."},"npcs":[{"name":"Mara Vell","role":"Escalation Cartographer","archetype":["ops","mapping"],"openers":["You called the hotline, so things are either urgent or theatrical. (Mara mode 1)","I have three plans and one dramatic disclaimer. (Mara mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Mara mode 3)","I reviewed your request and preemptively filed a concern. (Mara mode 4)","I can solve this, but the calendar must cooperate. (Mara mode 5)","Let's treat this like a mission, not a meeting. (Mara mode 6)","Excellent, a fresh crisis with reusable lessons. (Mara mode 7)","I brought a checklist and suspicious confidence. (Mara mode 8)","Good news: we can absolutely improve this timeline. (Mara mode 9)","Let's keep comms clear and expectations realistic. (Mara mode 10)"]},{"name":"Juno Pike","role":"Queue Whisperer","archetype":["support","flow"],"openers":["I have three plans and one dramatic disclaimer. (Juno mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Juno mode 2)","I reviewed your request and preemptively filed a concern. (Juno mode 3)","I can solve this, but the calendar must cooperate. (Juno mode 4)","Let's treat this like a mission, not a meeting. (Juno mode 5)","Excellent, a fresh crisis with reusable lessons. (Juno mode 6)","I brought a checklist and suspicious confidence. (Juno mode 7)","Good news: we can absolutely improve this timeline. (Juno mode 8)","Let's keep comms clear and expectations realistic. (Juno mode 9)","I specialize in controlled panic and clean handoffs. (Juno mode 10)"]},{"name":"Theo Marsh","role":"Compliance Ranger","archetype":["compliance","risk"],"openers":["You called the hotline, so things are either urgent or theatrical. (Theo mode 1)","I have three plans and one dramatic disclaimer. (Theo mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Theo mode 3)","I reviewed your request and preemptively filed a concern. (Theo mode 4)","I can solve this, but the calendar must cooperate. (Theo mode 5)","Let's treat this like a mission, not a meeting. (Theo mode 6)","Excellent, a fresh crisis with reusable lessons. (Theo mode 7)","I brought a checklist and suspicious confidence. (Theo mode 8)","Good news: we can absolutely improve this timeline. (Theo mode 9)","Let's keep comms clear and expectations realistic. (Theo mode 10)"]},{"name":"Lina Quill","role":"Memo Surgeon","archetype":["comms","exec"],"openers":["I have three plans and one dramatic disclaimer. (Lina mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Lina mode 2)","I reviewed your request and preemptively filed a concern. (Lina mode 3)","I can solve this, but the calendar must cooperate. (Lina mode 4)","Let's treat this like a mission, not a meeting. (Lina mode 5)","Excellent, a fresh crisis with reusable lessons. (Lina mode 6)","I brought a checklist and suspicious confidence. (Lina mode 7)","Good news: we can absolutely improve this timeline. (Lina mode 8)","Let's keep comms clear and expectations realistic. (Lina mode 9)","I specialize in controlled panic and clean handoffs. (Lina mode 10)"]},{"name":"Rook Ennis","role":"Incident Bard","archetype":["sre","story"],"openers":["You called the hotline, so things are either urgent or theatrical. (Rook mode 1)","I have three plans and one dramatic disclaimer. (Rook mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Rook mode 3)","I reviewed your request and preemptively filed a concern. (Rook mode 4)","I can solve this, but the calendar must cooperate. (Rook mode 5)","Let's treat this like a mission, not a meeting. (Rook mode 6)","Excellent, a fresh crisis with reusable lessons. (Rook mode 7)","I brought a checklist and suspicious confidence. (Rook mode 8)","Good news: we can absolutely improve this timeline. (Rook mode 9)","Let's keep comms clear and expectations realistic. (Rook mode 10)"]},{"name":"Pavel Nox","role":"Latency Negotiator","archetype":["infra","performance"],"openers":["I have three plans and one dramatic disclaimer. (Pavel mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Pavel mode 2)","I reviewed your request and preemptively filed a concern. (Pavel mode 3)","I can solve this, but the calendar must cooperate. (Pavel mode 4)","Let's treat this like a mission, not a meeting. (Pavel mode 5)","Excellent, a fresh crisis with reusable lessons. (Pavel mode 6)","I brought a checklist and suspicious confidence. (Pavel mode 7)","Good news: we can absolutely improve this timeline. (Pavel mode 8)","Let's keep comms clear and expectations realistic. (Pavel mode 9)","I specialize in controlled panic and clean handoffs. (Pavel mode 10)"]},{"name":"Nia Flint","role":"Vendor Diplomat","archetype":["procurement","partner"],"openers":["You called the hotline, so things are either urgent or theatrical. (Nia mode 1)","I have three plans and one dramatic disclaimer. (Nia mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Nia mode 3)","I reviewed your request and preemptively filed a concern. (Nia mode 4)","I can solve this, but the calendar must cooperate. (Nia mode 5)","Let's treat this like a mission, not a meeting. (Nia mode 6)","Excellent, a fresh crisis with reusable lessons. (Nia mode 7)","I brought a checklist and suspicious confidence. (Nia mode 8)","Good news: we can absolutely improve this timeline. (Nia mode 9)","Let's keep comms clear and expectations realistic. (Nia mode 10)"]},{"name":"Kei Rowan","role":"Policy Alchemist","archetype":["policy","governance"],"openers":["I have three plans and one dramatic disclaimer. (Kei mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Kei mode 2)","I reviewed your request and preemptively filed a concern. (Kei mode 3)","I can solve this, but the calendar must cooperate. (Kei mode 4)","Let's treat this like a mission, not a meeting. (Kei mode 5)","Excellent, a fresh crisis with reusable lessons. (Kei mode 6)","I brought a checklist and suspicious confidence. (Kei mode 7)","Good news: we can absolutely improve this timeline. (Kei mode 8)","Let's keep comms clear and expectations realistic. (Kei mode 9)","I specialize in controlled panic and clean handoffs. (Kei mode 10)"]},{"name":"Bram Holt","role":"Rollback Monk","archetype":["release","safety"],"openers":["You called the hotline, so things are either urgent or theatrical. (Bram mode 1)","I have three plans and one dramatic disclaimer. (Bram mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Bram mode 3)","I reviewed your request and preemptively filed a concern. (Bram mode 4)","I can solve this, but the calendar must cooperate. (Bram mode 5)","Let's treat this like a mission, not a meeting. (Bram mode 6)","Excellent, a fresh crisis with reusable lessons. (Bram mode 7)","I brought a checklist and suspicious confidence. (Bram mode 8)","Good news: we can absolutely improve this timeline. (Bram mode 9)","Let's keep comms clear and expectations realistic. (Bram mode 10)"]},{"name":"Iris Vale","role":"Dashboard Forensic Analyst","archetype":["data","observability"],"openers":["I have three plans and one dramatic disclaimer. (Iris mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Iris mode 2)","I reviewed your request and preemptively filed a concern. (Iris mode 3)","I can solve this, but the calendar must cooperate. (Iris mode 4)","Let's treat this like a mission, not a meeting. (Iris mode 5)","Excellent, a fresh crisis with reusable lessons. (Iris mode 6)","I brought a checklist and suspicious confidence. (Iris mode 7)","Good news: we can absolutely improve this timeline. (Iris mode 8)","Let's keep comms clear and expectations realistic. (Iris mode 9)","I specialize in controlled panic and clean handoffs. (Iris mode 10)"]},{"name":"Owen Drift","role":"Timeline Shepherd","archetype":["pm","planning"],"openers":["You called the hotline, so things are either urgent or theatrical. (Owen mode 1)","I have three plans and one dramatic disclaimer. (Owen mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Owen mode 3)","I reviewed your request and preemptively filed a concern. (Owen mode 4)","I can solve this, but the calendar must cooperate. (Owen mode 5)","Let's treat this like a mission, not a meeting. (Owen mode 6)","Excellent, a fresh crisis with reusable lessons. (Owen mode 7)","I brought a checklist and suspicious confidence. (Owen mode 8)","Good news: we can absolutely improve this timeline. (Owen mode 9)","Let's keep comms clear and expectations realistic. (Owen mode 10)"]},{"name":"Sora Kent","role":"Support Oracle","archetype":["support","customer"],"openers":["I have three plans and one dramatic disclaimer. (Sora mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Sora mode 2)","I reviewed your request and preemptively filed a concern. (Sora mode 3)","I can solve this, but the calendar must cooperate. (Sora mode 4)","Let's treat this like a mission, not a meeting. (Sora mode 5)","Excellent, a fresh crisis with reusable lessons. (Sora mode 6)","I brought a checklist and suspicious confidence. (Sora mode 7)","Good news: we can absolutely improve this timeline. (Sora mode 8)","Let's keep comms clear and expectations realistic. (Sora mode 9)","I specialize in controlled panic and clean handoffs. (Sora mode 10)"]},{"name":"Dax Mercer","role":"Security Storyteller","archetype":["security","awareness"],"openers":["You called the hotline, so things are either urgent or theatrical. (Dax mode 1)","I have three plans and one dramatic disclaimer. (Dax mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Dax mode 3)","I reviewed your request and preemptively filed a concern. (Dax mode 4)","I can solve this, but the calendar must cooperate. (Dax mode 5)","Let's treat this like a mission, not a meeting. (Dax mode 6)","Excellent, a fresh crisis with reusable lessons. (Dax mode 7)","I brought a checklist and suspicious confidence. (Dax mode 8)","Good news: we can absolutely improve this timeline. (Dax mode 9)","Let's keep comms clear and expectations realistic. (Dax mode 10)"]},{"name":"Tala Finch","role":"Feature Flag Tactician","archetype":["release","flags"],"openers":["I have three plans and one dramatic disclaimer. (Tala mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Tala mode 2)","I reviewed your request and preemptively filed a concern. (Tala mode 3)","I can solve this, but the calendar must cooperate. (Tala mode 4)","Let's treat this like a mission, not a meeting. (Tala mode 5)","Excellent, a fresh crisis with reusable lessons. (Tala mode 6)","I brought a checklist and suspicious confidence. (Tala mode 7)","Good news: we can absolutely improve this timeline. (Tala mode 8)","Let's keep comms clear and expectations realistic. (Tala mode 9)","I specialize in controlled panic and clean handoffs. (Tala mode 10)"]},{"name":"Milo Arden","role":"Documentation Necromancer","archetype":["docs","knowledge"],"openers":["You called the hotline, so things are either urgent or theatrical. (Milo mode 1)","I have three plans and one dramatic disclaimer. (Milo mode 2)","Before we begin: yes, this is recoverable and no, not elegantly. (Milo mode 3)","I reviewed your request and preemptively filed a concern. (Milo mode 4)","I can solve this, but the calendar must cooperate. (Milo mode 5)","Let's treat this like a mission, not a meeting. (Milo mode 6)","Excellent, a fresh crisis with reusable lessons. (Milo mode 7)","I brought a checklist and suspicious confidence. (Milo mode 8)","Good news: we can absolutely improve this timeline. (Milo mode 9)","Let's keep comms clear and expectations realistic. (Milo mode 10)"]},{"name":"Vera Sol","role":"Committee Liaison","archetype":["leadership","alignment"],"openers":["I have three plans and one dramatic disclaimer. (Vera mode 1)","Before we begin: yes, this is recoverable and no, not elegantly. (Vera mode 2)","I reviewed your request and preemptively filed a concern. (Vera mode 3)","I can solve this, but the calendar must cooperate. (Vera mode 4)","Let's treat this like a mission, not a meeting. (Vera mode 5)","Excellent, a fresh crisis with reusable lessons. (Vera mode 6)","I brought a checklist and suspicious confidence. (Vera mode 7)","Good news: we can absolutely improve this timeline. (Vera mode 8)","Let's keep comms clear and expectations realistic. (Vera mode 9)","I specialize in controlled panic and clean handoffs. (Vera mode 10)"]}],"missions":["Escort {object} from {place} before sunrise.","Convince {role} that {request} is mission critical.","Deploy a reversible fix for {request} at {place}.","Translate three executive comments into one action plan.","Recover missing context about {object} from {place}.","Stage a calm escalation for {request}.","Draft and deliver a one-page doctrine for {request}.","Build a temporary bridge between {place} and the incident channel.","Negotiate safe rollout terms for {object}.","Refactor chaos around {request} into milestones.","Investigate why {object} keeps reappearing in audits.","Stabilize {place} long enough for leadership to stop refreshing dashboards.","Perform ritual rollback rehearsal in {place}.","Map hidden dependencies around {request}.","Launch a decoy meeting while real work happens.","Protect customer-facing systems from {object} behavior.","Reconcile policy and reality regarding {request}.","Retrieve approval signatures without summoning panic.","Patch the process gap near {place}.","Deliver the quiet fix before the loud review.","Convert folklore about {object} into runbook steps.","Audit ownership trails related to {request}.","Prevent recurrence by redesigning handoffs at {place}.","Contain narrative fallout from {request}."],"constraints":["No direct API access after 17:00.","You may only communicate via status-page haiku.","Security must approve every third sentence.","Budget allows exactly one premium workaround.","All decisions must fit on one sticky note.","You cannot wake The Committee unless SEV-1.","Legacy service cannot be restarted twice.","No deployments during snack inventory checks.","Comms team requires a friendly metaphor.","Legal bans the word 'guarantee'.","The pager battery is at 12%.","You must include Support in every checkpoint.","Timeline is fixed; scope must move.","No changes to production schemas.","Only reversible actions are authorized.","You may not rename any queue today.","Every action needs a backup owner.","One vendor is currently unreachable.","Observability data lags by five minutes.","Leadership wants updates in plain language.","Only one hotfix window remains.","No policy exceptions without written rationale.","All escalations require explicit owner tags.","The runbook has two contradictory steps.","VPN access drops every hour.","On-call handoff happens in 40 minutes.","Support cannot absorb additional ticket load.","No temporary secrets in production.","Meeting slots are fully booked.","You must keep customer impact below visible threshold.","No cross-region failover today.","Comms must be reviewed before publication.","One critical dependency is in maintenance mode.","The incident channel is rate-limited.","You need dual sign-off for rollback.","No one remembers who owns the old service.","Only dry-run changes allowed before noon.","Board update is due in 30 minutes.","Your laptop battery is 18%.","Data retention limits block raw log access.","Everything must be done without creating a new committee.","The release train leaves in one hour.","No mass notifications without legal review.","You can ask for help only once.","Do not trigger another incident while fixing this."],"rewards":["A permanent reduction in midnight pages.","Priority access to the calm deploy window.","A signed note from Finance saying 'approved'.","A week of low-noise dashboards.","Three reusable runbook templates.","A trusted fallback path for future incidents.","Public credit in the next postmortem.","A temporary immunity from ad-hoc meetings.","One free escalation without judgment.","A cleaner ownership map.","A voucher for emergency snack procurement.","A less dramatic roadmap review.","A branded mug labeled 'I prevented SEV-1'.","A reduction in policy exception requests.","A stable queue for one whole sprint.","A new alert rule that actually helps.","A board slide that tells the truth.","Additional engineering focus budget.","A quiet Friday deploy.","A small but meaningful morale boost.","Faster incident commander handoffs.","A documented rollback pattern.","Reduced comms churn.","A reusable playbook for this mess.","Fewer passive-aggressive calendar invites.","A training budget for your team.","One week with no surprise priorities.","A calm retro with action items that ship.","Vendor response SLA improvements.","A reliable stakeholder update format.","Better observability dashboards.","An ops trophy nobody asked for.","A reduction in ticket reopen rate.","An endorsement from The Committee.","A protected focus block next sprint.","Streamlined approval path.","A map of hidden dependencies.","Lower support escalation volume.","Clarity in ownership boundaries.","A celebrated success in weekly all-hands.","A practical policy rewrite.","A healthier on-call rotation.","A signed exception for this one weird edge case.","A small but permanent process improvement.","Respect from skeptical peers."],"hints":["If everyone says yes, nobody owns it.","Ask who writes the rollback note.","Find the quiet dependency first.","Start with comms, then code.","Reduce scope until fear drops.","Write the one-sentence goal.","Tag an owner before discussing timeline.","If a metric is vague, it is useless.","Check support impact before shipping.","The safest fix is reversible.","Escalate early, narrate clearly.","Assumptions expire faster than slides.","If you need heroics, redesign the process.","Use one status channel only.","History hides in old runbooks.","Call Legal before calling victory.","Treat 'quick win' as a risk signal.","Find the person who says 'this is fine'.","A blocked dependency is still work.","Archive dead docs to reduce confusion.","Ask for evidence, not confidence.","Small fixes beat grand declarations.","Define done before debate starts.","Comms delay multiplies incident heat.","Never patch in anger.","Boring process beats heroic improvisation.","Check dashboard assumptions manually.","Prepare fallback before promise.","Name risks in plain language.","Use checklists when adrenaline spikes.","Prioritize customer impact over internal drama.","If timeline is fixed, change scope.","Track action items by owner and date.","Silence in meetings means hidden disagreement.","If it can't be tested, it isn't done.","Treat exceptions as product feedback.","Document weirdness while it's fresh.","Respect support's first signal.","Ship clarity with every update.","Incident memory fades; write it now.","Consistency beats cleverness.","Trust but verify dashboards.","Budget for the second-order effect.","Ask what could make this worse.","The fastest path is often the cleanest handoff."],"requests":["stabilize on-call workflow 1","stabilize release workflow 2","stabilize comms workflow 3","stabilize approval workflow 4","stabilize rollback workflow 5","stabilize queue workflow 6","stabilize support workflow 7","stabilize security workflow 8","stabilize policy workflow 9","stabilize handoff workflow 10","stabilize on-call workflow 11","stabilize release workflow 12","stabilize comms workflow 13","stabilize approval workflow 14","stabilize rollback workflow 15","stabilize queue workflow 16","stabilize support workflow 17","stabilize security workflow 18","stabilize policy workflow 19","stabilize handoff workflow 20","stabilize on-call workflow 21","stabilize release workflow 22","stabilize comms workflow 23","stabilize approval workflow 24","stabilize rollback workflow 25","stabilize queue workflow 26","stabilize support workflow 27","stabilize security workflow 28","stabilize policy workflow 29","stabilize handoff workflow 30","stabilize on-call workflow 31","stabilize release workflow 32","stabilize comms workflow 33","stabilize approval workflow 34","stabilize rollback workflow 35","stabilize queue workflow 36","stabilize support workflow 37","stabilize security workflow 38","stabilize policy workflow 39","stabilize handoff workflow 40","stabilize on-call workflow 41","stabilize release workflow 42","stabilize comms workflow 43","stabilize approval workflow 44","stabilize rollback workflow 45","stabilize queue workflow 46","stabilize support workflow 47","stabilize security workflow 48","stabilize policy workflow 49","stabilize handoff workflow 50","stabilize on-call workflow 51","stabilize release workflow 52","stabilize comms workflow 53","stabilize approval workflow 54","stabilize rollback workflow 55","stabilize queue workflow 56","stabilize support workflow 57","stabilize security workflow 58","stabilize policy workflow 59","stabilize handoff workflow 60","stabilize on-call workflow 61","stabilize release workflow 62","stabilize comms workflow 63","stabilize approval workflow 64","stabilize rollback workflow 65"],"places":["Control Room 1","Queue Annex 2","War Room 3","Legacy Vault 4","Support Dock 5","Policy Atrium 6","Data Hangar 7","Escalation Pier 8","Incident Loft 9","Comms Bunker 10","Control Room 11","Queue Annex 12","War Room 13","Legacy Vault 14","Support Dock 15","Policy Atrium 16","Data Hangar 17","Escalation Pier 18","Incident Loft 19","Comms Bunker 20","Control Room 21","Queue Annex 22","War Room 23","Legacy Vault 24","Support Dock 25","Policy Atrium 26","Data Hangar 27","Escalation Pier 28","Incident Loft 29","Comms Bunker 30","Control Room 31","Queue Annex 32","War Room 33","Legacy Vault 34","Support Dock 35","Policy Atrium 36","Data Hangar 37","Escalation Pier 38","Incident Loft 39","Comms Bunker 40","Control Room 41","Queue Annex 42","War Room 43","Legacy Vault 44","Support Dock 45","Policy Atrium 46","Data Hangar 47","Escalation Pier 48","Incident Loft 49","Comms Bunker 50","Control Room 51","Queue Annex 52","War Room 53","Legacy Vault 54","Support Dock 55","Policy Atrium 56","Data Hangar 57","Escalation Pier 58","Incident Loft 59","Comms Bunker 60","Control Room 61","Queue Annex 62","War Room 63","Legacy Vault 64","Support Dock 65"],"objects":["runbook shard 1","approval token 2","quiet patch 3","rollback key 4","status artifact 5","dependency map 6","audit lantern 7","service charm 8","metric prism 9","queue compass 10","runbook shard 11","approval token 12","quiet patch 13","rollback key 14","status artifact 15","dependency map 16","audit lantern 17","service charm 18","metric prism 19","queue compass 20","runbook shard 21","approval token 22","quiet patch 23","rollback key 24","status artifact 25","dependency map 26","audit lantern 27","service charm 28","metric prism 29","queue compass 30","runbook shard 31","approval token 32","quiet patch 33","rollback key 34","status artifact 35","dependency map 36","audit lantern 37","service charm 38","metric prism 39","queue compass 40","runbook shard 41","approval token 42","quiet patch 43","rollback key 44","status artifact 45","dependency map 46","audit lantern 47","service charm 48","metric prism 49","queue compass 50","runbook shard 51","approval token 52","quiet patch 53","rollback key 54","status artifact 55","dependency map 56","audit lantern 57","service charm 58","metric prism 59","queue compass 60","runbook shard 61","approval token 62","quiet patch 63","rollback key 64","status artifact 65"]}
```

FILE: content/incidents.json
```
{"meta":{"name":"Incident Theater Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Structured absurd incident data for deterministic postmortem theater."},"severityLevels":[{"level":"SEV-1","weight":2,"absurdity":2},{"level":"SEV-2","weight":5,"absurdity":1.6},{"level":"SEV-3","weight":8,"absurdity":1.3}],"durationRules":{"SEV-1":[60,220],"SEV-2":[35,140],"SEV-3":[12,85]},"titleTemplates":["{system} degraded during policy sync","{system} interrupted by vendor handshake","{system} misrouted after schema promotion","{system} stalled amid comms update","{system} overheated by release choreography","{system} degraded during queue reshuffle","{system} interrupted by latency flare","{system} misrouted after security check","{system} stalled amid feature ramp","{system} overheated by policy sync","{system} degraded during vendor handshake","{system} interrupted by schema promotion","{system} misrouted after comms update","{system} stalled amid release choreography","{system} overheated by queue reshuffle","{system} degraded during latency flare","{system} interrupted by security check","{system} misrouted after feature ramp","{system} stalled amid policy sync","{system} overheated by vendor handshake","{system} degraded during schema promotion","{system} interrupted by comms update","{system} misrouted after release choreography","{system} stalled amid queue reshuffle","{system} overheated by latency flare","{system} degraded during security check","{system} interrupted by feature ramp","{system} misrouted after policy sync","{system} stalled amid vendor handshake","{system} overheated by schema promotion","{system} degraded during comms update","{system} interrupted by release choreography","{system} misrouted after queue reshuffle","{system} stalled amid latency flare","{system} overheated by security check","{system} degraded during feature ramp","{system} interrupted by policy sync","{system} misrouted after vendor handshake","{system} stalled amid schema promotion","{system} overheated by comms update","{system} degraded during release choreography","{system} interrupted by queue reshuffle","{system} misrouted after latency flare","{system} stalled amid security check","{system} overheated by feature ramp"],"impactedSystems":["queue mesh 1","auth gateway 1","memo pipeline 1","status relay 1","feature flag fabric 1","billing ledger 1","support bridge 1","alert router 1","artifact registry 1","tarot daemon 1","reporting lake 1","policy API 1","vendor bridge 1","chat notifier 1","deployment orchestrator 1","queue mesh 2","auth gateway 2","memo pipeline 2","status relay 2","feature flag fabric 2","billing ledger 2","support bridge 2","alert router 2","artifact registry 2","tarot daemon 2","reporting lake 2","policy API 2","vendor bridge 2","chat notifier 2","deployment orchestrator 2","queue mesh 3","auth gateway 3","memo pipeline 3","status relay 3","feature flag fabric 3","billing ledger 3","support bridge 3","alert router 3","artifact registry 3","tarot daemon 3","reporting lake 3","policy API 3","vendor bridge 3","chat notifier 3","deployment orchestrator 3"],"symptoms":["latency spikes observed 1","error bloom observed 2","duplicate notifications observed 3","silent failures observed 4","retry storm observed 5","stale reads observed 6","queue backlog observed 7","phantom alerts observed 8","missing payloads observed 9","timezone drift observed 10","schema mismatch observed 11","approval loop observed 12","cache confusion observed 13","auth flapping observed 14","dashboard hallucinations observed 15","latency spikes observed 16","error bloom observed 17","duplicate notifications observed 18","silent failures observed 19","retry storm observed 20","stale reads observed 21","queue backlog observed 22","phantom alerts observed 23","missing payloads observed 24","timezone drift observed 25","schema mismatch observed 26","approval loop observed 27","cache confusion observed 28","auth flapping observed 29","dashboard hallucinations observed 30","latency spikes observed 31","error bloom observed 32","duplicate notifications observed 33","silent failures observed 34","retry storm observed 35","stale reads observed 36","queue backlog observed 37","phantom alerts observed 38","missing payloads observed 39","timezone drift observed 40","schema mismatch observed 41","approval loop observed 42","cache confusion observed 43","auth flapping observed 44","dashboard hallucinations observed 45"],"rootCauses":["A hidden dependency misread the {noun} path in {place} during rollout.","A hidden dependency duplicated the {noun} path in {place} under load.","A hidden dependency starved the {noun} path in {place} after failover.","A hidden dependency overflowed the {noun} path in {place} inside fallback mode.","A hidden dependency renamed the {noun} path in {place} during handoff.","A hidden dependency misrouted the {noun} path in {place} during freeze exception.","A hidden dependency invalidated the {noun} path in {place} during rollout.","A hidden dependency looped the {noun} path in {place} under load.","A hidden dependency compressed the {noun} path in {place} after failover.","A hidden dependency stalled the {noun} path in {place} inside fallback mode.","A hidden dependency amplified the {noun} path in {place} during handoff.","A hidden dependency mutated the {noun} path in {place} during freeze exception.","An outdated runbook misread the {noun} path in {place} during rollout.","An outdated runbook duplicated the {noun} path in {place} under load.","An outdated runbook starved the {noun} path in {place} after failover.","An outdated runbook overflowed the {noun} path in {place} inside fallback mode.","An outdated runbook renamed the {noun} path in {place} during handoff.","An outdated runbook misrouted the {noun} path in {place} during freeze exception.","An outdated runbook invalidated the {noun} path in {place} during rollout.","An outdated runbook looped the {noun} path in {place} under load.","An outdated runbook compressed the {noun} path in {place} after failover.","An outdated runbook stalled the {noun} path in {place} inside fallback mode.","An outdated runbook amplified the {noun} path in {place} during handoff.","An outdated runbook mutated the {noun} path in {place} during freeze exception.","A race condition misread the {noun} path in {place} during rollout.","A race condition duplicated the {noun} path in {place} under load.","A race condition starved the {noun} path in {place} after failover.","A race condition overflowed the {noun} path in {place} inside fallback mode.","A race condition renamed the {noun} path in {place} during handoff.","A race condition misrouted the {noun} path in {place} during freeze exception.","A race condition invalidated the {noun} path in {place} during rollout.","A race condition looped the {noun} path in {place} under load.","A race condition compressed the {noun} path in {place} after failover.","A race condition stalled the {noun} path in {place} inside fallback mode.","A race condition amplified the {noun} path in {place} during handoff.","A race condition mutated the {noun} path in {place} during freeze exception.","A misaligned policy misread the {noun} path in {place} during rollout.","A misaligned policy duplicated the {noun} path in {place} under load.","A misaligned policy starved the {noun} path in {place} after failover.","A misaligned policy overflowed the {noun} path in {place} inside fallback mode.","A misaligned policy renamed the {noun} path in {place} during handoff.","A misaligned policy misrouted the {noun} path in {place} during freeze exception.","A misaligned policy invalidated the {noun} path in {place} during rollout.","A misaligned policy looped the {noun} path in {place} under load.","A misaligned policy compressed the {noun} path in {place} after failover.","A misaligned policy stalled the {noun} path in {place} inside fallback mode.","A misaligned policy amplified the {noun} path in {place} during handoff.","A misaligned policy mutated the {noun} path in {place} during freeze exception."],"weLearned":["Reversible changes matters more than optimistic slides (1).","Clear ownership matters more than optimistic slides (2).","Comms discipline matters more than optimistic slides (3).","Dependency mapping matters more than optimistic slides (4).","Rollback rehearsal matters more than optimistic slides (5).","Alert hygiene matters more than optimistic slides (6).","Explicit thresholds matters more than optimistic slides (7).","Support context matters more than optimistic slides (8).","Runbook clarity matters more than optimistic slides (9).","Cross-team trust matters more than optimistic slides (10).","Status cadence matters more than optimistic slides (11).","Preflight checks matters more than optimistic slides (12).","Scope control matters more than optimistic slides (13).","Reversible changes matters more than optimistic slides (14).","Clear ownership matters more than optimistic slides (15).","Comms discipline matters more than optimistic slides (16).","Dependency mapping matters more than optimistic slides (17).","Rollback rehearsal matters more than optimistic slides (18).","Alert hygiene matters more than optimistic slides (19).","Explicit thresholds matters more than optimistic slides (20).","Support context matters more than optimistic slides (21).","Runbook clarity matters more than optimistic slides (22).","Cross-team trust matters more than optimistic slides (23).","Status cadence matters more than optimistic slides (24).","Preflight checks matters more than optimistic slides (25).","Scope control matters more than optimistic slides (26).","Reversible changes matters more than optimistic slides (27).","Clear ownership matters more than optimistic slides (28).","Comms discipline matters more than optimistic slides (29).","Dependency mapping matters more than optimistic slides (30).","Rollback rehearsal matters more than optimistic slides (31).","Alert hygiene matters more than optimistic slides (32).","Explicit thresholds matters more than optimistic slides (33).","Support context matters more than optimistic slides (34).","Runbook clarity matters more than optimistic slides (35).","Cross-team trust matters more than optimistic slides (36).","Status cadence matters more than optimistic slides (37).","Preflight checks matters more than optimistic slides (38).","Scope control matters more than optimistic slides (39).","Reversible changes matters more than optimistic slides (40).","Clear ownership matters more than optimistic slides (41).","Comms discipline matters more than optimistic slides (42).","Dependency mapping matters more than optimistic slides (43).","Rollback rehearsal matters more than optimistic slides (44).","Alert hygiene matters more than optimistic slides (45).","Explicit thresholds matters more than optimistic slides (46).","Support context matters more than optimistic slides (47).","Runbook clarity matters more than optimistic slides (48).","Cross-team trust matters more than optimistic slides (49).","Status cadence matters more than optimistic slides (50).","Preflight checks matters more than optimistic slides (51).","Scope control matters more than optimistic slides (52).","Reversible changes matters more than optimistic slides (53).","Clear ownership matters more than optimistic slides (54).","Comms discipline matters more than optimistic slides (55).","Dependency mapping matters more than optimistic slides (56).","Rollback rehearsal matters more than optimistic slides (57).","Alert hygiene matters more than optimistic slides (58).","Explicit thresholds matters more than optimistic slides (59).","Support context matters more than optimistic slides (60).","Runbook clarity matters more than optimistic slides (61).","Cross-team trust matters more than optimistic slides (62).","Status cadence matters more than optimistic slides (63).","Preflight checks matters more than optimistic slides (64).","Scope control matters more than optimistic slides (65)."],"actionItems":[{"template":"Document {system} rollback path before next cycle (1).","owners":["Infra","SRE","Comms"]},{"template":"Automate {system} owner map before next cycle (2).","owners":["Platform","Product","Support"]},{"template":"Validate {system} alert thresholds before next cycle (3).","owners":["Security","Legal","Data"]},{"template":"Rehearse {system} handoff protocol before next cycle (4).","owners":["SRE","Comms","QA"]},{"template":"Review {system} dependency checklist before next cycle (5).","owners":["Product","Support","Facilities"]},{"template":"Refactor {system} status template before next cycle (6).","owners":["Legal","Data","The Committee"]},{"template":"Publish {system} change window before next cycle (7).","owners":["Comms","QA","Finance"]},{"template":"Enforce {system} exception policy before next cycle (8).","owners":["Support","Facilities","Infra"]},{"template":"Track {system} release gate before next cycle (9).","owners":["Data","The Committee","Platform"]},{"template":"Audit {system} failover plan before next cycle (10).","owners":["QA","Finance","Security"]},{"template":"Document {system} rollback path before next cycle (11).","owners":["Facilities","Infra","SRE"]},{"template":"Automate {system} owner map before next cycle (12).","owners":["The Committee","Platform","Product"]},{"template":"Validate {system} alert thresholds before next cycle (13).","owners":["Finance","Security","Legal"]},{"template":"Rehearse {system} handoff protocol before next cycle (14).","owners":["Infra","SRE","Comms"]},{"template":"Review {system} dependency checklist before next cycle (15).","owners":["Platform","Product","Support"]},{"template":"Refactor {system} status template before next cycle (16).","owners":["Security","Legal","Data"]},{"template":"Publish {system} change window before next cycle (17).","owners":["SRE","Comms","QA"]},{"template":"Enforce {system} exception policy before next cycle (18).","owners":["Product","Support","Facilities"]},{"template":"Track {system} release gate before next cycle (19).","owners":["Legal","Data","The Committee"]},{"template":"Audit {system} failover plan before next cycle (20).","owners":["Comms","QA","Finance"]},{"template":"Document {system} rollback path before next cycle (21).","owners":["Support","Facilities","Infra"]},{"template":"Automate {system} owner map before next cycle (22).","owners":["Data","The Committee","Platform"]},{"template":"Validate {system} alert thresholds before next cycle (23).","owners":["QA","Finance","Security"]},{"template":"Rehearse {system} handoff protocol before next cycle (24).","owners":["Facilities","Infra","SRE"]},{"template":"Review {system} dependency checklist before next cycle (25).","owners":["The Committee","Platform","Product"]},{"template":"Refactor {system} status template before next cycle (26).","owners":["Finance","Security","Legal"]},{"template":"Publish {system} change window before next cycle (27).","owners":["Infra","SRE","Comms"]},{"template":"Enforce {system} exception policy before next cycle (28).","owners":["Platform","Product","Support"]},{"template":"Track {system} release gate before next cycle (29).","owners":["Security","Legal","Data"]},{"template":"Audit {system} failover plan before next cycle (30).","owners":["SRE","Comms","QA"]},{"template":"Document {system} rollback path before next cycle (31).","owners":["Product","Support","Facilities"]},{"template":"Automate {system} owner map before next cycle (32).","owners":["Legal","Data","The Committee"]},{"template":"Validate {system} alert thresholds before next cycle (33).","owners":["Comms","QA","Finance"]},{"template":"Rehearse {system} handoff protocol before next cycle (34).","owners":["Support","Facilities","Infra"]},{"template":"Review {system} dependency checklist before next cycle (35).","owners":["Data","The Committee","Platform"]},{"template":"Refactor {system} status template before next cycle (36).","owners":["QA","Finance","Security"]},{"template":"Publish {system} change window before next cycle (37).","owners":["Facilities","Infra","SRE"]},{"template":"Enforce {system} exception policy before next cycle (38).","owners":["The Committee","Platform","Product"]},{"template":"Track {system} release gate before next cycle (39).","owners":["Finance","Security","Legal"]},{"template":"Audit {system} failover plan before next cycle (40).","owners":["Infra","SRE","Comms"]},{"template":"Document {system} rollback path before next cycle (41).","owners":["Platform","Product","Support"]},{"template":"Automate {system} owner map before next cycle (42).","owners":["Security","Legal","Data"]},{"template":"Validate {system} alert thresholds before next cycle (43).","owners":["SRE","Comms","QA"]},{"template":"Rehearse {system} handoff protocol before next cycle (44).","owners":["Product","Support","Facilities"]},{"template":"Review {system} dependency checklist before next cycle (45).","owners":["Legal","Data","The Committee"]},{"template":"Refactor {system} status template before next cycle (46).","owners":["Comms","QA","Finance"]},{"template":"Publish {system} change window before next cycle (47).","owners":["Support","Facilities","Infra"]},{"template":"Enforce {system} exception policy before next cycle (48).","owners":["Data","The Committee","Platform"]},{"template":"Track {system} release gate before next cycle (49).","owners":["QA","Finance","Security"]},{"template":"Audit {system} failover plan before next cycle (50).","owners":["Facilities","Infra","SRE"]},{"template":"Document {system} rollback path before next cycle (51).","owners":["The Committee","Platform","Product"]},{"template":"Automate {system} owner map before next cycle (52).","owners":["Finance","Security","Legal"]},{"template":"Validate {system} alert thresholds before next cycle (53).","owners":["Infra","SRE","Comms"]},{"template":"Rehearse {system} handoff protocol before next cycle (54).","owners":["Platform","Product","Support"]},{"template":"Review {system} dependency checklist before next cycle (55).","owners":["Security","Legal","Data"]},{"template":"Refactor {system} status template before next cycle (56).","owners":["SRE","Comms","QA"]},{"template":"Publish {system} change window before next cycle (57).","owners":["Product","Support","Facilities"]},{"template":"Enforce {system} exception policy before next cycle (58).","owners":["Legal","Data","The Committee"]},{"template":"Track {system} release gate before next cycle (59).","owners":["Comms","QA","Finance"]},{"template":"Audit {system} failover plan before next cycle (60).","owners":["Support","Facilities","Infra"]},{"template":"Document {system} rollback path before next cycle (61).","owners":["Data","The Committee","Platform"]},{"template":"Automate {system} owner map before next cycle (62).","owners":["QA","Finance","Security"]},{"template":"Validate {system} alert thresholds before next cycle (63).","owners":["Facilities","Infra","SRE"]},{"template":"Rehearse {system} handoff protocol before next cycle (64).","owners":["The Committee","Platform","Product"]},{"template":"Review {system} dependency checklist before next cycle (65).","owners":["Finance","Security","Legal"]},{"template":"Refactor {system} status template before next cycle (66).","owners":["Infra","SRE","Comms"]},{"template":"Publish {system} change window before next cycle (67).","owners":["Platform","Product","Support"]},{"template":"Enforce {system} exception policy before next cycle (68).","owners":["Security","Legal","Data"]},{"template":"Track {system} release gate before next cycle (69).","owners":["SRE","Comms","QA"]},{"template":"Audit {system} failover plan before next cycle (70).","owners":["Product","Support","Facilities"]},{"template":"Document {system} rollback path before next cycle (71).","owners":["Legal","Data","The Committee"]},{"template":"Automate {system} owner map before next cycle (72).","owners":["Comms","QA","Finance"]},{"template":"Validate {system} alert thresholds before next cycle (73).","owners":["Support","Facilities","Infra"]},{"template":"Rehearse {system} handoff protocol before next cycle (74).","owners":["Data","The Committee","Platform"]},{"template":"Review {system} dependency checklist before next cycle (75).","owners":["QA","Finance","Security"]},{"template":"Refactor {system} status template before next cycle (76).","owners":["Facilities","Infra","SRE"]},{"template":"Publish {system} change window before next cycle (77).","owners":["The Committee","Platform","Product"]},{"template":"Enforce {system} exception policy before next cycle (78).","owners":["Finance","Security","Legal"]},{"template":"Track {system} release gate before next cycle (79).","owners":["Infra","SRE","Comms"]},{"template":"Audit {system} failover plan before next cycle (80).","owners":["Platform","Product","Support"]},{"template":"Document {system} rollback path before next cycle (81).","owners":["Security","Legal","Data"]},{"template":"Automate {system} owner map before next cycle (82).","owners":["SRE","Comms","QA"]},{"template":"Validate {system} alert thresholds before next cycle (83).","owners":["Product","Support","Facilities"]},{"template":"Rehearse {system} handoff protocol before next cycle (84).","owners":["Legal","Data","The Committee"]},{"template":"Review {system} dependency checklist before next cycle (85).","owners":["Comms","QA","Finance"]}],"timelineEvents":["Detected {symptom}; {owner} opened response path quickly and {outcome} for {system} (1).","Escalated {symptom}; {owner} rerouted response path carefully and {outcome} for {system} (2).","Correlated {symptom}; {owner} closed response path under pressure and {outcome} for {system} (3).","Triaged {symptom}; {owner} approved response path with backup and {outcome} for {system} (4).","Mitigated {symptom}; {owner} validated response path after debate and {outcome} for {system} (5).","Confirmed {symptom}; {owner} resumed response path without heroics and {outcome} for {system} (6).","Broadcast {symptom}; {owner} reviewed response path quickly and {outcome} for {system} (7).","Reverted {symptom}; {owner} updated response path carefully and {outcome} for {system} (8).","Patched {symptom}; {owner} paused response path under pressure and {outcome} for {system} (9).","Stabilized {symptom}; {owner} documented response path with backup and {outcome} for {system} (10).","Detected {symptom}; {owner} opened response path after debate and {outcome} for {system} (11).","Escalated {symptom}; {owner} rerouted response path without heroics and {outcome} for {system} (12).","Correlated {symptom}; {owner} closed response path quickly and {outcome} for {system} (13).","Triaged {symptom}; {owner} approved response path carefully and {outcome} for {system} (14).","Mitigated {symptom}; {owner} validated response path under pressure and {outcome} for {system} (15).","Confirmed {symptom}; {owner} resumed response path with backup and {outcome} for {system} (16).","Broadcast {symptom}; {owner} reviewed response path after debate and {outcome} for {system} (17).","Reverted {symptom}; {owner} updated response path without heroics and {outcome} for {system} (18).","Patched {symptom}; {owner} paused response path quickly and {outcome} for {system} (19).","Stabilized {symptom}; {owner} documented response path carefully and {outcome} for {system} (20).","Detected {symptom}; {owner} opened response path under pressure and {outcome} for {system} (21).","Escalated {symptom}; {owner} rerouted response path with backup and {outcome} for {system} (22).","Correlated {symptom}; {owner} closed response path after debate and {outcome} for {system} (23).","Triaged {symptom}; {owner} approved response path without heroics and {outcome} for {system} (24).","Mitigated {symptom}; {owner} validated response path quickly and {outcome} for {system} (25).","Confirmed {symptom}; {owner} resumed response path carefully and {outcome} for {system} (26).","Broadcast {symptom}; {owner} reviewed response path under pressure and {outcome} for {system} (27).","Reverted {symptom}; {owner} updated response path with backup and {outcome} for {system} (28).","Patched {symptom}; {owner} paused response path after debate and {outcome} for {system} (29).","Stabilized {symptom}; {owner} documented response path without heroics and {outcome} for {system} (30).","Detected {symptom}; {owner} opened response path quickly and {outcome} for {system} (31).","Escalated {symptom}; {owner} rerouted response path carefully and {outcome} for {system} (32).","Correlated {symptom}; {owner} closed response path under pressure and {outcome} for {system} (33).","Triaged {symptom}; {owner} approved response path with backup and {outcome} for {system} (34).","Mitigated {symptom}; {owner} validated response path after debate and {outcome} for {system} (35).","Confirmed {symptom}; {owner} resumed response path without heroics and {outcome} for {system} (36).","Broadcast {symptom}; {owner} reviewed response path quickly and {outcome} for {system} (37).","Reverted {symptom}; {owner} updated response path carefully and {outcome} for {system} (38).","Patched {symptom}; {owner} paused response path under pressure and {outcome} for {system} (39).","Stabilized {symptom}; {owner} documented response path with backup and {outcome} for {system} (40).","Detected {symptom}; {owner} opened response path after debate and {outcome} for {system} (41).","Escalated {symptom}; {owner} rerouted response path without heroics and {outcome} for {system} (42).","Correlated {symptom}; {owner} closed response path quickly and {outcome} for {system} (43).","Triaged {symptom}; {owner} approved response path carefully and {outcome} for {system} (44).","Mitigated {symptom}; {owner} validated response path under pressure and {outcome} for {system} (45).","Confirmed {symptom}; {owner} resumed response path with backup and {outcome} for {system} (46).","Broadcast {symptom}; {owner} reviewed response path after debate and {outcome} for {system} (47).","Reverted {symptom}; {owner} updated response path without heroics and {outcome} for {system} (48).","Patched {symptom}; {owner} paused response path quickly and {outcome} for {system} (49).","Stabilized {symptom}; {owner} documented response path carefully and {outcome} for {system} (50).","Detected {symptom}; {owner} opened response path under pressure and {outcome} for {system} (51).","Escalated {symptom}; {owner} rerouted response path with backup and {outcome} for {system} (52).","Correlated {symptom}; {owner} closed response path after debate and {outcome} for {system} (53).","Triaged {symptom}; {owner} approved response path without heroics and {outcome} for {system} (54).","Mitigated {symptom}; {owner} validated response path quickly and {outcome} for {system} (55).","Confirmed {symptom}; {owner} resumed response path carefully and {outcome} for {system} (56).","Broadcast {symptom}; {owner} reviewed response path under pressure and {outcome} for {system} (57).","Reverted {symptom}; {owner} updated response path with backup and {outcome} for {system} (58).","Patched {symptom}; {owner} paused response path after debate and {outcome} for {system} (59).","Stabilized {symptom}; {owner} documented response path without heroics and {outcome} for {system} (60).","Detected {symptom}; {owner} opened response path quickly and {outcome} for {system} (61).","Escalated {symptom}; {owner} rerouted response path carefully and {outcome} for {system} (62).","Correlated {symptom}; {owner} closed response path under pressure and {outcome} for {system} (63).","Triaged {symptom}; {owner} approved response path with backup and {outcome} for {system} (64).","Mitigated {symptom}; {owner} validated response path after debate and {outcome} for {system} (65).","Confirmed {symptom}; {owner} resumed response path without heroics and {outcome} for {system} (66).","Broadcast {symptom}; {owner} reviewed response path quickly and {outcome} for {system} (67).","Reverted {symptom}; {owner} updated response path carefully and {outcome} for {system} (68)."],"commsTemplates":["Customer update: {severity} incident 'contained' while teams address {system}; next checkpoint in 20m (1).","Internal update: {severity} incident 'under review' while teams address {system}; next checkpoint in 30m (2).","Executive update: {severity} incident 'recovering' while teams address {system}; next checkpoint in 45m (3).","Support update: {severity} incident 'closing' while teams address {system}; next checkpoint at top of hour (4).","Partner update: {severity} incident 'active' while teams address {system}; next checkpoint in 20m (5).","Status page note: {severity} incident 'mitigating' while teams address {system}; next checkpoint in 30m (6).","Leadership note: {severity} incident 'stable' while teams address {system}; next checkpoint in 45m (7).","Customer update: {severity} incident 'contained' while teams address {system}; next checkpoint at top of hour (8).","Internal update: {severity} incident 'under review' while teams address {system}; next checkpoint in 20m (9).","Executive update: {severity} incident 'recovering' while teams address {system}; next checkpoint in 30m (10).","Support update: {severity} incident 'closing' while teams address {system}; next checkpoint in 45m (11).","Partner update: {severity} incident 'active' while teams address {system}; next checkpoint at top of hour (12).","Status page note: {severity} incident 'mitigating' while teams address {system}; next checkpoint in 20m (13).","Leadership note: {severity} incident 'stable' while teams address {system}; next checkpoint in 30m (14).","Customer update: {severity} incident 'contained' while teams address {system}; next checkpoint in 45m (15).","Internal update: {severity} incident 'under review' while teams address {system}; next checkpoint at top of hour (16).","Executive update: {severity} incident 'recovering' while teams address {system}; next checkpoint in 20m (17).","Support update: {severity} incident 'closing' while teams address {system}; next checkpoint in 30m (18).","Partner update: {severity} incident 'active' while teams address {system}; next checkpoint in 45m (19).","Status page note: {severity} incident 'mitigating' while teams address {system}; next checkpoint at top of hour (20).","Leadership note: {severity} incident 'stable' while teams address {system}; next checkpoint in 20m (21).","Customer update: {severity} incident 'contained' while teams address {system}; next checkpoint in 30m (22).","Internal update: {severity} incident 'under review' while teams address {system}; next checkpoint in 45m (23).","Executive update: {severity} incident 'recovering' while teams address {system}; next checkpoint at top of hour (24).","Support update: {severity} incident 'closing' while teams address {system}; next checkpoint in 20m (25).","Partner update: {severity} incident 'active' while teams address {system}; next checkpoint in 30m (26).","Status page note: {severity} incident 'mitigating' while teams address {system}; next checkpoint in 45m (27).","Leadership note: {severity} incident 'stable' while teams address {system}; next checkpoint at top of hour (28)."],"scorecard":{"dimensions":["Detection","Response","Comms","Follow-up"],"interpretations":{"1":"Ad-hoc and stressed","2":"Reactive with gaps","3":"Functional but uneven","4":"Solid execution","5":"Boringly excellent"}},"owners":["Infra","Platform","Security","SRE","Product","Legal","Comms","Support","Data","QA","Facilities","The Committee","Finance"],"nouns":["runbook","token","policy","queue","dashboard","checkpoint","handoff","artifact","bridge","daemon","timeline","ledger","gateway","fallback","monitor"],"verbs":["misread","duplicated","starved","overflowed","renamed","misrouted","invalidated","looped","compressed","stalled","amplified","mutated"],"places":["Control Deck","Integration Annex","Queue Plaza","Status Bunker","Support Atrium","Policy Forge","Regional Node","Legacy Vault","Ops Pier","Incident Balcony"],"outcomes":["service recovered","alerts normalized","customers stabilized","traffic rerouted","rollback completed","comms updated","error rate dropped","ownership clarified","hotfix deployed","queue drained"]}
```

FILE: content/tarot.json
```
{"meta":{"name":"Tarot of Productivity Pack","version":"1.0.0","lastUpdated":"2026-02-07","description":"Forty satirical productivity tarot cards and spread definitions."},"cards":[{"name":"The Calendar Kraken","archetype":"Overcommitment","meaning_upright":"The Calendar Kraken upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (1).","meaning_reversed":"The Calendar Kraken reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (1).","action_prompt":"What single action today would move overcommitment from vague intention to observable progress?","warning":"Avoid performative urgency while this card is active."},{"name":"The Quiet Rollback","archetype":"Recovery","meaning_upright":"The Quiet Rollback upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (2).","meaning_reversed":"The Quiet Rollback reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (2).","action_prompt":"What single action today would move recovery from vague intention to observable progress?","warning":"Avoid ownerless tasks while this card is active."},{"name":"The Approval Maze","archetype":"Governance","meaning_upright":"The Approval Maze upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (3).","meaning_reversed":"The Approval Maze reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (3).","action_prompt":"What single action today would move governance from vague intention to observable progress?","warning":"Avoid silent dependencies while this card is active."},{"name":"The Infinite Standup","archetype":"Ritual","meaning_upright":"The Infinite Standup upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (4).","meaning_reversed":"The Infinite Standup reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (4).","action_prompt":"What single action today would move ritual from vague intention to observable progress?","warning":"Avoid late comms while this card is active."},{"name":"The Friendly Outage","archetype":"Incident","meaning_upright":"The Friendly Outage upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (5).","meaning_reversed":"The Friendly Outage reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (5).","action_prompt":"What single action today would move incident from vague intention to observable progress?","warning":"Avoid heroic shortcuts while this card is active."},{"name":"The Budget Meteor","archetype":"Finance","meaning_upright":"The Budget Meteor upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (6).","meaning_reversed":"The Budget Meteor reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (6).","action_prompt":"What single action today would move finance from vague intention to observable progress?","warning":"Avoid scope optimism while this card is active."},{"name":"The Risk Lantern","archetype":"Foresight","meaning_upright":"The Risk Lantern upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (7).","meaning_reversed":"The Risk Lantern reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (7).","action_prompt":"What single action today would move foresight from vague intention to observable progress?","warning":"Avoid policy theater while this card is active."},{"name":"The Queue Monarch","archetype":"Flow","meaning_upright":"The Queue Monarch upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (8).","meaning_reversed":"The Queue Monarch reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (8).","action_prompt":"What single action today would move flow from vague intention to observable progress?","warning":"Avoid metric vanity while this card is active."},{"name":"The Scope Mirage","archetype":"Planning","meaning_upright":"The Scope Mirage upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (9).","meaning_reversed":"The Scope Mirage reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (9).","action_prompt":"What single action today would move planning from vague intention to observable progress?","warning":"Avoid performative urgency while this card is active."},{"name":"The Vendor Moon","archetype":"Partnership","meaning_upright":"The Vendor Moon upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (10).","meaning_reversed":"The Vendor Moon reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (10).","action_prompt":"What single action today would move partnership from vague intention to observable progress?","warning":"Avoid ownerless tasks while this card is active."},{"name":"The Alert Choir","archetype":"Observability","meaning_upright":"The Alert Choir upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (11).","meaning_reversed":"The Alert Choir reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (11).","action_prompt":"What single action today would move observability from vague intention to observable progress?","warning":"Avoid silent dependencies while this card is active."},{"name":"The Runbook Forge","archetype":"Craft","meaning_upright":"The Runbook Forge upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (12).","meaning_reversed":"The Runbook Forge reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (12).","action_prompt":"What single action today would move craft from vague intention to observable progress?","warning":"Avoid late comms while this card is active."},{"name":"The Policy Owl","archetype":"Compliance","meaning_upright":"The Policy Owl upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (13).","meaning_reversed":"The Policy Owl reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (13).","action_prompt":"What single action today would move compliance from vague intention to observable progress?","warning":"Avoid heroic shortcuts while this card is active."},{"name":"The Fallback Bridge","archetype":"Resilience","meaning_upright":"The Fallback Bridge upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (14).","meaning_reversed":"The Fallback Bridge reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (14).","action_prompt":"What single action today would move resilience from vague intention to observable progress?","warning":"Avoid scope optimism while this card is active."},{"name":"The Comms Drum","archetype":"Messaging","meaning_upright":"The Comms Drum upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (15).","meaning_reversed":"The Comms Drum reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (15).","action_prompt":"What single action today would move messaging from vague intention to observable progress?","warning":"Avoid policy theater while this card is active."},{"name":"The Feature Garden","archetype":"Delivery","meaning_upright":"The Feature Garden upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (16).","meaning_reversed":"The Feature Garden reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (16).","action_prompt":"What single action today would move delivery from vague intention to observable progress?","warning":"Avoid metric vanity while this card is active."},{"name":"The Deadline Comet","archetype":"Urgency","meaning_upright":"The Deadline Comet upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (17).","meaning_reversed":"The Deadline Comet reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (17).","action_prompt":"What single action today would move urgency from vague intention to observable progress?","warning":"Avoid performative urgency while this card is active."},{"name":"The Escalation Ladder","archetype":"Leadership","meaning_upright":"The Escalation Ladder upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (18).","meaning_reversed":"The Escalation Ladder reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (18).","action_prompt":"What single action today would move leadership from vague intention to observable progress?","warning":"Avoid ownerless tasks while this card is active."},{"name":"The Trust Battery","archetype":"Culture","meaning_upright":"The Trust Battery upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (19).","meaning_reversed":"The Trust Battery reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (19).","action_prompt":"What single action today would move culture from vague intention to observable progress?","warning":"Avoid silent dependencies while this card is active."},{"name":"The Metrics Mirror","archetype":"Insight","meaning_upright":"The Metrics Mirror upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (20).","meaning_reversed":"The Metrics Mirror reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (20).","action_prompt":"What single action today would move insight from vague intention to observable progress?","warning":"Avoid late comms while this card is active."},{"name":"The Retrospective Bell","archetype":"Learning","meaning_upright":"The Retrospective Bell upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (21).","meaning_reversed":"The Retrospective Bell reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (21).","action_prompt":"What single action today would move learning from vague intention to observable progress?","warning":"Avoid heroic shortcuts while this card is active."},{"name":"The Ownership Compass","archetype":"Accountability","meaning_upright":"The Ownership Compass upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (22).","meaning_reversed":"The Ownership Compass reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (22).","action_prompt":"What single action today would move accountability from vague intention to observable progress?","warning":"Avoid scope optimism while this card is active."},{"name":"The Dependency Knot","archetype":"Complexity","meaning_upright":"The Dependency Knot upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (23).","meaning_reversed":"The Dependency Knot reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (23).","action_prompt":"What single action today would move complexity from vague intention to observable progress?","warning":"Avoid policy theater while this card is active."},{"name":"The Support Beacon","archetype":"Service","meaning_upright":"The Support Beacon upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (24).","meaning_reversed":"The Support Beacon reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (24).","action_prompt":"What single action today would move service from vague intention to observable progress?","warning":"Avoid metric vanity while this card is active."},{"name":"The Security Mantle","archetype":"Protection","meaning_upright":"The Security Mantle upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (25).","meaning_reversed":"The Security Mantle reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (25).","action_prompt":"What single action today would move protection from vague intention to observable progress?","warning":"Avoid performative urgency while this card is active."},{"name":"The QA Lantern","archetype":"Quality","meaning_upright":"The QA Lantern upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (26).","meaning_reversed":"The QA Lantern reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (26).","action_prompt":"What single action today would move quality from vague intention to observable progress?","warning":"Avoid ownerless tasks while this card is active."},{"name":"The Infra Atlas","archetype":"Foundation","meaning_upright":"The Infra Atlas upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (27).","meaning_reversed":"The Infra Atlas reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (27).","action_prompt":"What single action today would move foundation from vague intention to observable progress?","warning":"Avoid silent dependencies while this card is active."},{"name":"The Product Lens","archetype":"Value","meaning_upright":"The Product Lens upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (28).","meaning_reversed":"The Product Lens reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (28).","action_prompt":"What single action today would move value from vague intention to observable progress?","warning":"Avoid late comms while this card is active."},{"name":"The Committee Gavel","archetype":"Authority","meaning_upright":"The Committee Gavel upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (29).","meaning_reversed":"The Committee Gavel reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (29).","action_prompt":"What single action today would move authority from vague intention to observable progress?","warning":"Avoid heroic shortcuts while this card is active."},{"name":"The Latency Falcon","archetype":"Performance","meaning_upright":"The Latency Falcon upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (30).","meaning_reversed":"The Latency Falcon reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (30).","action_prompt":"What single action today would move performance from vague intention to observable progress?","warning":"Avoid scope optimism while this card is active."},{"name":"The Dry Run","archetype":"Preparation","meaning_upright":"The Dry Run upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (31).","meaning_reversed":"The Dry Run reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (31).","action_prompt":"What single action today would move preparation from vague intention to observable progress?","warning":"Avoid policy theater while this card is active."},{"name":"The Hotfix Crown","archetype":"Intervention","meaning_upright":"The Hotfix Crown upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (32).","meaning_reversed":"The Hotfix Crown reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (32).","action_prompt":"What single action today would move intervention from vague intention to observable progress?","warning":"Avoid metric vanity while this card is active."},{"name":"The Staging Harbor","archetype":"Experiment","meaning_upright":"The Staging Harbor upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (33).","meaning_reversed":"The Staging Harbor reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (33).","action_prompt":"What single action today would move experiment from vague intention to observable progress?","warning":"Avoid performative urgency while this card is active."},{"name":"The Contract Tide","archetype":"Legal","meaning_upright":"The Contract Tide upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (34).","meaning_reversed":"The Contract Tide reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (34).","action_prompt":"What single action today would move legal from vague intention to observable progress?","warning":"Avoid ownerless tasks while this card is active."},{"name":"The Documentation Flame","archetype":"Knowledge","meaning_upright":"The Documentation Flame upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (35).","meaning_reversed":"The Documentation Flame reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (35).","action_prompt":"What single action today would move knowledge from vague intention to observable progress?","warning":"Avoid silent dependencies while this card is active."},{"name":"The Customer Echo","archetype":"Empathy","meaning_upright":"The Customer Echo upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (36).","meaning_reversed":"The Customer Echo reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (36).","action_prompt":"What single action today would move empathy from vague intention to observable progress?","warning":"Avoid late comms while this card is active."},{"name":"The Signal Prism","archetype":"Clarity","meaning_upright":"The Signal Prism upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (37).","meaning_reversed":"The Signal Prism reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (37).","action_prompt":"What single action today would move clarity from vague intention to observable progress?","warning":"Avoid heroic shortcuts while this card is active."},{"name":"The Pipeline Oak","archetype":"Stability","meaning_upright":"The Pipeline Oak upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (38).","meaning_reversed":"The Pipeline Oak reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (38).","action_prompt":"What single action today would move stability from vague intention to observable progress?","warning":"Avoid scope optimism while this card is active."},{"name":"The Portable Panic","archetype":"Adaptation","meaning_upright":"The Portable Panic upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (39).","meaning_reversed":"The Portable Panic reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (39).","action_prompt":"What single action today would move adaptation from vague intention to observable progress?","warning":"Avoid policy theater while this card is active."},{"name":"The Unplanned Hero","archetype":"Sustainability","meaning_upright":"The Unplanned Hero upright signals practical momentum: define the owner, narrow scope, and ship the reversible move (40).","meaning_reversed":"The Unplanned Hero reversed warns that noise is replacing judgment; pause, clarify assumptions, and reduce blast radius (40).","action_prompt":"What single action today would move sustainability from vague intention to observable progress?","warning":"Avoid metric vanity while this card is active."}],"spreads":{"three_card":{"name":"Past / Present / Future","positions":["Past","Present","Future"]}}}
```

FILE: content/microtools.json
```
{"meta":{"name":"Microtools Catalog","version":"1.0.0","lastUpdated":"2026-02-07","description":"Tool registry for active and upcoming RealityOps modules."},"tools":[{"name":"Universe Forge","route":"/tool/universe","description":"Generate a fresh multiverse operating patch.","tags":["theme","poster","daily"],"active":true},{"name":"Exec Memo Generator","route":"/tool/memo","description":"Produce executive-grade justification memos.","tags":["memo","satire","copy"],"active":true},{"name":"Meeting Translator","route":"/tool/translator","description":"Decode corporate language into direct intent.","tags":["translation","analysis","notes"],"active":true},{"name":"Probability Engine","route":"/tool/probability","description":"Compute deterministic risk narratives.","tags":["risk","controls","score"],"active":true},{"name":"NPC Hotline","route":"/tool/npc","description":"Summon specialists for absurd missions.","tags":["npc","quests","dialogue"],"active":true},{"name":"Incident Theater","route":"/tool/incidents","description":"Generate fake on-call incidents and postmortems.","tags":["incident","timeline","poster"],"active":true},{"name":"Tarot of Productivity","route":"/tool/tarot","description":"Draw deterministic productivity tarot cards.","tags":["tarot","cards","daily"],"active":true},{"name":"Universe Museum","route":"/tool/museum","description":"Gallery for favorite universe and incident posters.","tags":["gallery","vault","export"],"active":true},{"name":"Escalation Simulator","route":"/tool/escalation-sim","description":"Prototype for branching escalation outcomes.","tags":["future","sim"],"active":false},{"name":"Policy Diff Engine","route":"/tool/policy-diff","description":"Upcoming policy contradiction scanner.","tags":["future","policy"],"active":false}]}
```

