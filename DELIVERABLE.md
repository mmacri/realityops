# RealityOps Enhancement Deliverable

## What changed
- Added command palette with global shortcut, context actions, and vault actions.
- Upgraded dashboard into guided Daily Briefing flow plus widget pin/hide settings.
- Overhauled Incident Theater, Probability Engine, Tarot, Museum, and Packs UI tooling.
- Added reusable UI components, visuals helpers, pack lint checks, and updated offline cache manifest.

## Updated/New files (full contents)

FILE: index.html
`$ext
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
<body data-density="cozy">
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
        <button id="palette-toggle-btn" class="btn btn-ghost" aria-label="Open command palette" data-tooltip="Command Palette (Ctrl/Cmd+K)">Command</button>
        <button id="new-patch-btn" class="btn btn-ghost" aria-label="Generate New Patch">New Patch</button>
        <label class="control-inline" for="density-select" data-tooltip="Adjust spacing density">
          <span>Density</span>
          <select id="density-select" aria-label="Density mode">
            <option value="compact">Compact</option>
            <option value="cozy" selected>Cozy</option>
            <option value="expanded">Expanded</option>
          </select>
        </label>
        <label class="chaos-toggle" for="chaos-toggle-input" aria-label="Toggle Chaos Mode">
          <input id="chaos-toggle-input" type="checkbox" />
          <span>Chaos</span>
        </label>
        <button id="inspector-toggle-btn" class="btn btn-ghost" aria-label="Toggle inspector panel" aria-pressed="true" data-tooltip="Toggle inspector">Inspector</button>
        <button id="inspector-mobile-btn" class="btn btn-ghost mobile-only" aria-label="Open inspector panel">Inspector</button>
      </div>
    </header>

    <div class="layout">
      <aside class="status-rail" id="status-rail" aria-label="Reality Status"></aside>
      <main class="stage" id="app-main" tabindex="-1"></main>
      <aside class="inspector-rail" id="inspector-panel" aria-label="Inspector"></aside>
    </div>
  </div>

  <div id="modal-root"></div>
  <div id="drawer-root"></div>
  <div id="toast-root" class="toast-stack" aria-live="polite" aria-atomic="true"></div>

  <noscript>
    <div class="noscript">RealityOps needs JavaScript to pilot this timeline.</div>
  </noscript>

  <script type="module" src="./assets/js/app.js"></script>
</body>
</html>

```

FILE: assets/css/style.css
`$ext
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-7: 2rem;
  --space-8: 2.5rem;

  --font-xxs: 0.72rem;
  --font-xs: 0.82rem;
  --font-sm: 0.92rem;
  --font-md: 1rem;
  --font-lg: 1.22rem;
  --font-xl: 1.48rem;

  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;

  --theme-accent: #46d3a3;
  --theme-accent2: #f3b768;
  --theme-bg1: #0d121b;
  --theme-bg2: #161d2a;

  --accent: var(--theme-accent);
  --accent-2: var(--theme-accent2);
  --bg-1: var(--theme-bg1);
  --bg-2: var(--theme-bg2);

  --text: #eaf1f0;
  --muted: #a9bdbc;
  --line: rgba(170, 204, 209, 0.24);
  --panel: rgba(13, 19, 30, 0.84);
  --panel-strong: rgba(11, 16, 25, 0.93);
  --shadow: 0 15px 38px rgba(0, 0, 0, 0.42);

  --good: #74d48d;
  --warn: #ffcf74;
  --bad: #ff7f79;

  --density-scale: 1;
  --app-width: min(1600px, 97vw);
}

[data-density="compact"] {
  --density-scale: 0.85;
}

[data-density="expanded"] {
  --density-scale: 1.2;
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
  font-family: "Trebuchet MS", "Gill Sans", "Segoe UI", sans-serif;
  background: radial-gradient(circle at 14% 11%, #1a2436 0%, var(--bg-1) 44%, #070b11 100%);
  color: var(--text);
  letter-spacing: 0.014em;
  line-height: 1.45;
}

body.chaos {
  --line: rgba(255, 153, 120, 0.36);
  --panel: rgba(25, 13, 20, 0.84);
  --panel-strong: rgba(20, 10, 17, 0.94);
}

#bg-canvas {
  position: fixed;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
}

.noise {
  position: fixed;
  inset: 0;
  z-index: -2;
  opacity: 0.08;
  background-image: radial-gradient(rgba(255, 255, 255, 0.35) 0.7px, transparent 0.7px);
  background-size: 2px 2px;
  pointer-events: none;
}

a,
button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

a {
  text-decoration: none;
}

button,
input,
textarea,
select {
  outline: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2), 0 0 0 4px color-mix(in srgb, var(--accent) 75%, white 25%);
  border-radius: var(--radius-xs);
}

.app-shell {
  width: var(--app-width);
  margin: var(--space-4) auto var(--space-8);
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: calc(var(--space-3) * var(--density-scale)) calc(var(--space-4) * var(--density-scale));
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: linear-gradient(130deg, rgba(12, 17, 30, 0.88), rgba(16, 24, 37, 0.68));
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  font-family: Consolas, monospace;
  font-weight: 800;
  color: #071310;
  background: linear-gradient(145deg, var(--accent), var(--accent-2));
}

.brand-text {
  display: grid;
  line-height: 1.05;
}

.brand-text strong {
  font-size: var(--font-md);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.brand-text small {
  font-size: var(--font-xxs);
  color: var(--muted);
}

.topnav {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.topnav a {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: calc(var(--space-2) * var(--density-scale)) calc(var(--space-3) * var(--density-scale));
  color: var(--muted);
  font-size: var(--font-sm);
}

.topnav a:hover,
.topnav a.active {
  color: var(--text);
  border-color: color-mix(in srgb, var(--accent) 56%, var(--line) 44%);
  background: rgba(255, 255, 255, 0.05);
}

.top-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.control-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.03);
  font-size: var(--font-xs);
}

.control-inline select {
  min-width: 98px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem 0.45rem;
}

.chaos-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
}

.mobile-only {
  display: none;
}

.layout {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 270px 1fr 320px;
  margin-top: var(--space-4);
}

.status-rail,
.stage,
.inspector-rail {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  backdrop-filter: blur(6px);
}

.status-rail,
.inspector-rail {
  background: var(--panel);
  padding: calc(var(--space-4) * var(--density-scale));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  position: sticky;
  top: var(--space-4);
}

.stage {
  min-height: 76vh;
  padding: calc(var(--space-5) * var(--density-scale));
  background: var(--panel-strong);
  transition: opacity 180ms ease, transform 180ms ease;
}

.stage.route-leaving {
  opacity: 0;
  transform: translateY(8px);
}

.stage.route-entering {
  animation: stage-in 220ms ease;
}

@keyframes stage-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.page-head h1 {
  margin: 0;
  font-size: calc(var(--font-xl) * var(--density-scale));
}

.page-head p {
  margin: var(--space-2) 0 0;
  color: var(--muted);
}

.card-grid,
.tools-list,
.two-col,
.museum-grid,
.scorecard-grid {
  display: grid;
  gap: var(--space-3);
}

.card-grid,
.tools-list {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.two-col {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.museum-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.card,
.tool-card,
.vault-item,
.pack-item,
.inspector-card {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(11, 17, 28, 0.74);
  padding: calc(var(--space-4) * var(--density-scale));
  overflow: hidden;
}

.card::after,
.tool-card::after,
.museum-card::after {
  content: "";
  position: absolute;
  inset: -30% auto auto -20%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 68%);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 220ms ease, transform 220ms ease;
  pointer-events: none;
}

.card:hover,
.tool-card:hover,
.museum-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 58%, var(--line) 42%);
}

.card:hover::after,
.tool-card:hover::after,
.museum-card:hover::after {
  opacity: 1;
  transform: translateY(0);
}

.card h3,
.card h4,
.tool-card h3,
.vault-item h4,
.pack-item h4 {
  margin: 0 0 var(--space-2);
}

.card p,
.card li,
.card dd,
.card dt,
.card small {
  color: #dce8e6;
}

.badge,
.chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: var(--font-xxs);
  color: var(--muted);
}

.badge.good,
.chip.good {
  color: var(--good);
  border-color: rgba(116, 212, 141, 0.5);
}

.badge.warn,
.chip.warn {
  color: var(--warn);
  border-color: rgba(255, 207, 116, 0.5);
}

.badge.bad,
.chip.bad {
  color: var(--bad);
  border-color: rgba(255, 127, 121, 0.6);
}

.chip-list,
.inline-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-2);
}

.btn-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-3);
}

.btn {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: calc(var(--space-2) * var(--density-scale)) calc(var(--space-3) * var(--density-scale));
  cursor: pointer;
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
  transition: transform 140ms ease, border-color 140ms ease;
}

.btn:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--accent) 56%, var(--line) 44%);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  border-color: transparent;
  color: #0f1b1f;
  font-weight: 700;
  background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 64%, #111 36%), color-mix(in srgb, var(--accent-2) 70%, #111 30%));
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.04);
}

.btn-sm {
  font-size: var(--font-xs);
  padding: 0.26rem 0.5rem;
}

.icon-btn {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
}

.tool-layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: var(--space-3);
}

.tool-panel,
.output-panel {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: calc(var(--space-4) * var(--density-scale));
  background: rgba(10, 15, 25, 0.88);
}

.tool-panel h3,
.output-panel h3 {
  margin-top: 0;
}

label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--font-sm);
  font-weight: 700;
}

input[type="text"],
input[type="number"],
input[type="date"],
textarea,
select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  padding: calc(var(--space-2) * var(--density-scale)) calc(var(--space-3) * var(--density-scale));
}

textarea {
  min-height: 112px;
  resize: vertical;
}

pre,
.code-block {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: calc(var(--space-3) * var(--density-scale));
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.4;
  background: rgba(0, 0, 0, 0.3);
  font-family: Consolas, "Lucida Console", monospace;
  font-size: var(--font-xs);
}

.poster-wrap {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.25);
}

.poster-wrap svg,
.poster-thumb-inline svg {
  width: 100%;
  height: auto;
  display: block;
}

.poster-thumb-inline {
  margin-top: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  cursor: pointer;
  overflow: hidden;
}

.timeline-viz {
  list-style: none;
  margin: 0;
  padding: 0;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
}

.timeline-item {
  margin: 0 0 var(--space-2);
  padding-left: var(--space-3);
  position: relative;
}

.timeline-item::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  position: absolute;
  left: -6px;
  top: 0.65rem;
}

.timeline-item summary {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto 1fr auto;
  align-items: center;
  cursor: pointer;
  list-style: none;
}

.timeline-item summary::-webkit-details-marker {
  display: none;
}

.timeline-time {
  font-family: Consolas, monospace;
  color: var(--accent);
}

.timeline-detail {
  margin-top: var(--space-2);
  border: 1px dashed var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
}

.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
}

.action-row label {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-weight: 500;
}

.kv {
  margin: 0;
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: var(--space-2) var(--space-3);
}

.kv dt {
  color: var(--muted);
}

.kv dd {
  margin: 0;
}

.scorecard-grid {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.scorecard-item {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
}

.scorecard-item header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meter {
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin: var(--space-2) 0;
}

.meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
}

.gauge-wrap {
  max-width: 340px;
  margin: 0 auto;
}

.risk-gauge {
  width: 100%;
  height: auto;
}

.g-band {
  fill: none;
  stroke-width: 12;
}

.g-band-green { stroke: #52c780; }
.g-band-yellow { stroke: #f3bc5d; }
.g-band-red { stroke: #f37f77; }
.g-core { fill: rgba(255, 255, 255, 0.06); }
.g-hub { fill: #f4f8f8; }
.g-needle { stroke: #f4f8f8; stroke-width: 4; }
.g-score { fill: #f3f7f7; font-size: 1.4rem; font-family: Consolas, monospace; }
.g-label { fill: #a8bbba; font-size: 0.72rem; }
.g-band-label { fill: #f3f7f7; font-size: 0.82rem; font-weight: 700; }

.control-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.control-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  margin: 0;
  font-weight: 500;
}

.tarot-grid {
  display: grid;
  gap: var(--space-3);
}

.tarot-grid.single {
  grid-template-columns: minmax(220px, 360px);
}

.tarot-grid.spread {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.tarot-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  background: rgba(10, 15, 25, 0.7);
}

.tarot-flip {
  position: relative;
  min-height: 330px;
  transform-style: preserve-3d;
  transition: transform 460ms cubic-bezier(.2,.8,.2,1);
  cursor: pointer;
}

.tarot-flip.revealed {
  transform: rotateY(180deg);
}

.tarot-face {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xs);
  backface-visibility: hidden;
  padding: var(--space-2);
  overflow: auto;
}

.tarot-back {
  display: grid;
  place-items: center;
  color: #f3f7f7;
  background: linear-gradient(140deg, #2d2e5f, #17334a 60%, #351f2e);
}

.tarot-back::after {
  content: "";
  width: 88%;
  height: 88%;
  border-radius: var(--radius-xs);
  border: 1px dashed rgba(255, 255, 255, 0.4);
  position: absolute;
}

.tarot-front {
  transform: rotateY(180deg);
  background: rgba(7, 11, 19, 0.92);
}

.journal-card textarea {
  min-height: 140px;
}

.museum-scroll {
  max-height: 72vh;
  overflow: auto;
  padding-right: var(--space-2);
}

.museum-card {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(9, 14, 24, 0.74);
  position: relative;
}

.museum-card .poster-thumb {
  min-height: 130px;
  border-bottom: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.22);
}

.poster-fallback {
  min-height: 130px;
  display: grid;
  place-items: center;
  font-family: Consolas, monospace;
  color: var(--muted);
}

.museum-card .card-body {
  padding: var(--space-3);
}

.filter-grid {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  align-items: end;
}

.widget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
}

.widget-grid .dashboard-widget {
  min-height: 200px;
}

.widget-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.lint-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.lint-list li {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
}

.lint-error {
  border-color: rgba(255, 127, 121, 0.55);
}

.lint-warn {
  border-color: rgba(255, 207, 116, 0.55);
}

.lint-ok {
  border-color: rgba(116, 212, 141, 0.55);
}

.overlay-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.overlay-backdrop {
  pointer-events: auto;
  position: absolute;
  inset: 0;
  padding: var(--space-5);
  background: rgba(0, 0, 0, 0.62);
  display: grid;
  place-items: center;
  animation: overlay-fade 180ms ease;
}

.overlay-leave {
  animation: overlay-fade-out 180ms ease forwards;
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes overlay-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.modal,
.drawer {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: rgba(8, 12, 20, 0.96);
  box-shadow: var(--shadow);
  max-height: 92vh;
  overflow: auto;
}

.modal {
  width: min(960px, 96vw);
  animation: pop-in 180ms ease;
}

@keyframes pop-in {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-head,
.drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--line);
}

.modal-body,
.drawer-body {
  padding: var(--space-4);
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--line);
}

.drawer {
  width: min(560px, 96vw);
  justify-self: end;
  align-self: stretch;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  animation: slide-in-right 190ms ease;
}

.drawer-bottom {
  width: min(900px, 100%);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  align-self: end;
  justify-self: center;
  animation: slide-in-bottom 190ms ease;
}

@keyframes slide-in-right {
  from { transform: translateX(16px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-bottom {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal.palette-modal,
.drawer.palette-drawer {
  width: min(760px, 96vw);
}

.palette-input {
  margin-bottom: var(--space-2);
}

.palette-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 62vh;
  overflow: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
}

.palette-item,
.palette-empty {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: grid;
}

.palette-item:last-child,
.palette-empty:last-child {
  border-bottom: 0;
}

.palette-item small {
  color: var(--muted);
  font-size: var(--font-xs);
}

.palette-item.active,
.palette-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.palette-hint {
  color: var(--muted);
  font-size: var(--font-xs);
  margin-top: var(--space-2);
}

.toast-stack {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 45;
  display: grid;
  gap: var(--space-2);
}

.toast {
  min-width: 250px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.78);
  box-shadow: var(--shadow);
  animation: toast-in 180ms ease;
}

.toast-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.toast-info { border-color: rgba(134, 203, 210, 0.45); }
.toast-success { border-color: rgba(116, 212, 141, 0.55); }
.toast-warn { border-color: rgba(255, 207, 116, 0.55); }

.toast-leave {
  animation: toast-out 160ms ease forwards;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes toast-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(6px); }
}

.tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, 0.85);
  color: var(--text);
  font-size: var(--font-xxs);
  padding: 0.18rem 0.45rem;
  z-index: 50;
  pointer-events: none;
}

.skeleton {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  background: rgba(255, 255, 255, 0.03);
  padding: var(--space-3);
  overflow: hidden;
  position: relative;
}

.skeleton::before {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
  animation: shimmer 1.2s infinite;
}

.s-line {
  display: block;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0.45rem 0;
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-45 { width: 45%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-80 { width: 80%; }
.w-90 { width: 90%; }
.w-95 { width: 95%; }

@keyframes shimmer {
  to { transform: translateX(100%); }
}

.stat-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.stat-item {
  border: 1px solid var(--line);
  border-radius: var(--radius-xs);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.03);
}

.stat-item strong {
  display: block;
  color: var(--muted);
  font-size: var(--font-xs);
}

.stat-item span {
  font-family: Consolas, monospace;
  font-size: var(--font-sm);
}

hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: var(--space-3) 0;
}

.muted {
  color: var(--muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.noscript {
  width: min(720px, 90vw);
  margin: var(--space-7) auto;
  border: 1px solid #977;
  border-radius: var(--radius-xs);
  background: #2a2323;
  color: #ffe2d1;
  padding: var(--space-4);
}

@media (max-width: 1280px) {
  .layout {
    grid-template-columns: 240px 1fr;
  }

  .inspector-rail {
    display: none;
  }

  .mobile-only {
    display: inline-flex;
  }
}

@media (max-width: 980px) {
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

@media (max-width: 740px) {
  .app-shell {
    width: 98vw;
    margin-top: var(--space-2);
  }

  .page-head {
    flex-direction: column;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .drawer {
    width: 100%;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}

```

FILE: assets/js/app.js
`$ext
import { createGeneratorEngine } from "./generators.js";
import { initRouter } from "./router.js";
import { createComponents } from "./components.js";
import { createBriefing } from "./briefing.js";
import { createPalette } from "./palette.js";
import { createUI } from "./ui.js";
import { registerServiceWorker } from "./sw-register.js";

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function boot() {
  const main = document.getElementById("app-main");
  if (main) {
    main.innerHTML = `
      <section class="card-grid">
        <article class="skeleton skeleton-card"><span class="s-line w-40"></span><span class="s-line w-90"></span><span class="s-line w-70"></span></article>
        <article class="skeleton skeleton-card"><span class="s-line w-30"></span><span class="s-line w-95"></span><span class="s-line w-60"></span></article>
        <article class="skeleton skeleton-card"><span class="s-line w-50"></span><span class="s-line w-80"></span><span class="s-line w-45"></span></article>
      </section>
    `;
  }

  try {
    const components = createComponents();
    const engine = await createGeneratorEngine();
    const briefing = createBriefing({ engine, components });
    const ui = createUI({ engine, components, briefing });

    const palette = createPalette({
      components,
      getContextCommands: () => ui.getContextCommands()
    });

    const runContextAction = (key) => {
      switch (key) {
        case "g":
          ui.invokeAction("generate");
          break;
        case "c":
          ui.invokeAction("copy");
          break;
        case "f":
          ui.invokeAction("favorite");
          break;
        case "s":
          ui.invokeAction("share");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", (event) => {
      const targetTag = event.target?.tagName?.toLowerCase();
      const isEditable = targetTag === "input" || targetTag === "textarea" || event.target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        palette.toggle();
        return;
      }

      if (isEditable || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (["g", "c", "f", "s"].includes(key)) {
        event.preventDefault();
        runContextAction(key);
      }
    });

    window.addEventListener("palette:toggle", () => {
      palette.toggle();
    });

    initRouter(
      async (route) => {
        await ui.renderRoute(route);
      },
      {
        beforeEach: async () => {
          if (!main) {
            return;
          }
          main.classList.add("route-leaving");
          await delay(120);
        },
        afterEach: async () => {
          if (!main) {
            return;
          }
          main.classList.remove("route-leaving");
          main.classList.add("route-entering");
          await delay(220);
          main.classList.remove("route-entering");
        }
      }
    );

    registerServiceWorker();
  } catch (error) {
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

FILE: assets/js/ui.js
`$ext

import { buildHash, navigate } from "./router.js";
import {
  addFavorite,
  addHistory,
  exportJournal,
  exportVault,
  getChaosMode,
  getDensity,
  getFavorites,
  getHistory,
  getIncidentChecks,
  getInspectorOpen,
  getJournalEntry,
  getSettings,
  getWidgetPrefs,
  importVaultData,
  isFavorited,
  moveWidget,
  patchSettings,
  removeFavorite,
  setChaosMode,
  setDensity,
  setIncidentCheck,
  setInspectorOpen,
  setJournalEntry,
  stableHash,
  toggleWidgetHidden
} from "./storage.js";
import { runPackLint, searchAcrossPacks } from "./lint.js";
import {
  animateGauge,
  createGaugeSvg,
  formatDateInput,
  inDateRange,
  renderScorecard,
  renderTimeline,
  riskBand,
  slugify
} from "./visuals.js";

function html(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseIntSafe(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseIndexCsv(value) {
  return String(value || "")
    .split(",")
    .map((v) => parseIntSafe(v, Number.NaN))
    .filter((n) => Number.isInteger(n));
}

function toDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function toLocalString(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso || "";
  }
  return d.toLocaleString();
}

function compactText(value, len = 190) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= len) {
    return text;
  }
  return `${text.slice(0, len - 1)}…`;
}

function downloadText(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function matchesQuery(entry, query) {
  if (!query) {
    return true;
  }
  const q = query.toLowerCase();
  return `${entry.title || ""} ${entry.summary || ""} ${entry.text || ""} ${entry.tool || ""}`.toLowerCase().includes(q);
}

export function createUI({ engine, components, briefing }) {
  const main = document.getElementById("app-main");
  const rail = document.getElementById("status-rail");
  const inspector = document.getElementById("inspector-panel");
  const chaosInput = document.getElementById("chaos-toggle-input");
  const densitySelect = document.getElementById("density-select");
  const inspectorToggleBtn = document.getElementById("inspector-toggle-btn");
  const inspectorMobileBtn = document.getElementById("inspector-mobile-btn");
  const newPatchBtn = document.getElementById("new-patch-btn");
  const paletteBtn = document.getElementById("palette-toggle-btn");

  if (!main || !rail || !inspector) {
    throw new Error("Missing required app shell containers.");
  }

  const settings = getSettings();
  const state = {
    chaosMode: settings.chaosMode ?? getChaosMode(),
    density: settings.density ?? getDensity(),
    inspectorOpen: settings.inspectorOpen ?? getInspectorOpen(),
    compactDashboard: Boolean(settings.compactDashboard),
    currentRoute: "/",
    currentParams: {},
    currentEntry: null,
    actions: {
      generate: null,
      copy: null,
      favorite: null,
      share: null
    },
    pageData: {
      dashboard: {},
      probability: null,
      incidents: null,
      tarot: null,
      museum: {
        windowStart: 0,
        filtered: []
      },
      packs: null
    },
    background: {
      raf: null,
      resizeBound: false
    }
  };

  function withBaseParams(params = {}, chaosOverride = state.chaosMode) {
    return {
      ...params,
      chaos: chaosOverride ? 1 : 0
    };
  }

  function fullShareLink(hash) {
    const path = window.location.pathname.endsWith("/index.html")
      ? window.location.pathname.replace(/index\.html$/, "")
      : window.location.pathname;
    return `${window.location.origin}${path}${hash}`;
  }

  async function copyText(text, success = "Copied.") {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      components.showToast({ message: success, type: "success" });
      return true;
    } catch {
      components.showToast({ message: "Clipboard unavailable in this context.", type: "warn" });
      return false;
    }
  }

  function setActions(next = {}) {
    state.actions = {
      generate: next.generate || null,
      copy: next.copy || null,
      favorite: next.favorite || null,
      share: next.share || null
    };
  }

  function applyTopSettings() {
    document.body.classList.toggle("chaos", Boolean(state.chaosMode));
    document.body.classList.toggle("inspector-open", Boolean(state.inspectorOpen));
    document.body.dataset.density = state.density;

    if (chaosInput) {
      chaosInput.checked = Boolean(state.chaosMode);
    }
    if (densitySelect) {
      densitySelect.value = state.density;
    }
    if (inspectorToggleBtn) {
      inspectorToggleBtn.setAttribute("aria-pressed", state.inspectorOpen ? "true" : "false");
    }
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

  function activeNav(path) {
    document.querySelectorAll(".topnav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").replace(/^#/, "");
      const active =
        href === path ||
        (href === "/tools" && path.startsWith("/tool/") && path !== "/tool/museum") ||
        (href === "/tool/museum" && path === "/tool/museum");
      link.classList.toggle("active", active);
    });
  }

  function setThemeFromUniverse(universe) {
    if (!universe?.theme) {
      return;
    }
    document.documentElement.style.setProperty("--theme-accent", universe.theme.accent);
    document.documentElement.style.setProperty("--theme-accent2", universe.theme.accent2);
    document.documentElement.style.setProperty("--theme-bg1", universe.theme.bg);
    document.documentElement.style.setProperty("--theme-bg2", universe.theme.bg2 || universe.theme.bg);
  }

  function registerCurrentOutput({
    tool,
    type,
    route,
    params,
    title,
    summary,
    text,
    tags = [],
    posterSvg = "",
    payload = null
  }) {
    const shareHash = buildHash(route, params);
    const entry = {
      id: stableHash([tool, params.seed, title, summary, payload?.signature || ""]),
      hash: stableHash([tool, params.seed, title, summary, text?.slice(0, 140) || ""]),
      tool,
      type: type || tool,
      seed: params.seed,
      title,
      summary,
      text,
      tags,
      posterSvg,
      shareHash,
      shareLink: fullShareLink(shareHash),
      payload
    };

    addHistory(entry);
    state.currentEntry = entry;
    renderInspector();
    renderStatusRail();
    return entry;
  }

  function toggleFavoriteCurrent() {
    if (!state.currentEntry) {
      components.showToast({ message: "No active output to favorite.", type: "warn" });
      return;
    }
    if (isFavorited(state.currentEntry.id) || isFavorited(state.currentEntry.hash)) {
      removeFavorite(state.currentEntry.id);
      removeFavorite(state.currentEntry.hash);
      components.showToast({ message: "Removed from favorites.", type: "info" });
    } else {
      addFavorite(state.currentEntry);
      components.showToast({ message: "Saved to favorites.", type: "success" });
    }
    renderInspector();
    renderStatusRail();
  }

  function renderInspectorContent(container) {
    const entry = state.currentEntry;
    if (!entry) {
      container.innerHTML = `
        <div class="inspector-empty">
          <h3>Inspector</h3>
          <p class="muted">Generate an output in any tool to inspect seed, share link, tags, and actions.</p>
          <div class="chip-list">
            <span class="chip">Route: ${html(state.currentRoute)}</span>
            <span class="chip">Chaos: ${state.chaosMode ? "On" : "Off"}</span>
            <span class="chip">Density: ${html(state.density)}</span>
          </div>
        </div>
      `;
      return;
    }

    const favorited = isFavorited(entry.id) || isFavorited(entry.hash);
    container.innerHTML = `
      <section class="inspector-card">
        <h3>${html(entry.title || `${entry.tool} output`)}</h3>
        <p class="muted">${html(entry.summary || "No summary")}</p>
        <div class="chip-list">
          <span class="chip">Seed ${html(entry.seed)}</span>
          <span class="chip">Tool ${html(entry.tool)}</span>
          ${entry.tags?.map((tag) => `<span class="chip">${html(tag)}</span>`).join("") || ""}
        </div>
        <div class="btn-row">
          <button class="btn" data-action="inspector-copy">Copy</button>
          <button class="btn" data-action="inspector-share">Copy Link</button>
          <button class="btn ${favorited ? "btn-primary" : ""}" data-action="inspector-favorite">${favorited ? "Unfavorite" : "Favorite"}</button>
          <button class="btn" data-action="inspector-export">Export JSON</button>
        </div>
        <pre class="code-block">${html(compactText(entry.text, 420))}</pre>
      </section>
    `;
  }

  function renderInspector() {
    if (!state.inspectorOpen) {
      inspector.innerHTML = "";
      return;
    }
    renderInspectorContent(inspector);
  }

  function openInspectorSheet() {
    const shell = document.createElement("div");
    renderInspectorContent(shell);
    components.openDrawer({
      title: "Inspector",
      subtitle: "Seed, share links, tags, and export actions.",
      content: shell,
      side: "bottom",
      className: "inspector-drawer"
    });
  }

  function renderStatusRail() {
    const status = engine.getDailyStatus({ chaosMode: state.chaosMode });
    const favorites = getFavorites();
    const history = getHistory();

    rail.innerHTML = `
      <header class="page-head">
        <div>
          <h1>Reality Status</h1>
          <p>Deterministic telemetry and local vault activity.</p>
        </div>
      </header>
      <div class="chip-list">
        <span class="chip">Daily Seed ${engine.dailySeed()}</span>
        <span class="chip ${state.chaosMode ? "warn" : "good"}">${state.chaosMode ? "Chaos" : "Calm"}</span>
      </div>
      <ul class="stat-list">
        ${status.map((row) => `<li class="stat-item"><strong>${html(row.label)}</strong><span>${html(row.value)}</span></li>`).join("")}
      </ul>
      <hr />
      <p class="muted">Favorites: ${favorites.length}</p>
      <p class="muted">History: ${history.length}</p>
      <p class="muted">Shortcuts: <code>G</code> generate · <code>C</code> copy · <code>F</code> favorite · <code>S</code> share</p>
    `;
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
    let frame = 0;
    const particles = [];

    function rnd(i) {
      const n = Math.sin(seed * 0.00001 + i * 19.73) * 10000;
      return n - Math.floor(n);
    }

    function reset() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles.length = 0;
      const count = Math.max(30, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: rnd(i + 3) * window.innerWidth,
          y: rnd(i + 9) * window.innerHeight,
          r: 0.8 + rnd(i + 11) * 2.4,
          vx: (rnd(i + 13) - 0.5) * 0.55,
          vy: (rnd(i + 17) - 0.5) * 0.55,
          alpha: 0.12 + rnd(i + 21) * 0.4
        });
      }
    }

    function tick() {
      frame += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hueA = state.chaosMode ? 16 : 192;
      const hueB = state.chaosMode ? 41 : 148;

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, `hsla(${hueA}, 40%, 10%, 0.72)`);
      gradient.addColorStop(1, `hsla(${hueB}, 45%, 8%, 0.75)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, idx) => {
        p.x += p.vx * (state.chaosMode ? 1.8 : 1);
        p.y += p.vy * (state.chaosMode ? 1.8 : 1);
        if (p.x < -20) p.x = w + 20;
        if (p.y < -20) p.y = h + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y > h + 20) p.y = -20;

        ctx.fillStyle = `hsla(${state.chaosMode ? 28 : 165}, 82%, 68%, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (idx % 3 === 0) {
          const j = (idx + frame) % particles.length;
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `hsla(${state.chaosMode ? 12 : 171}, 90%, 76%, ${(1 - dist / 130) * 0.16})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      });

      state.background.raf = window.requestAnimationFrame(tick);
    }

    reset();
    if (!state.background.resizeBound) {
      window.addEventListener("resize", reset);
      state.background.resizeBound = true;
    }
    if (state.background.raf) {
      window.cancelAnimationFrame(state.background.raf);
    }
    tick();
  }

  function renderDashboard() {
    const daily = engine.generateDailyBundle({ chaosMode: state.chaosMode });
    const toolCatalog = engine.getToolCatalog().filter((tool) => tool.active);
    const toolOfDay = toolCatalog[daily.seed % toolCatalog.length];
    const prefs = getWidgetPrefs();

    const widgets = [
      {
        id: "universe",
        title: "Daily Reality Patch",
        content: `
          <p><span class="badge">${html(daily.universe.tone)}</span> ${html(daily.universe.tagline)}</p>
          <p>${html(state.compactDashboard ? compactText(daily.universe.headline, 90) : daily.universe.headline)}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/universe", withBaseParams({ seed: daily.universe.seed }))}">Open Universe Forge</a>
        `
      },
      {
        id: "incident",
        title: "Today's Incident",
        content: `
          <p><span class="badge ${daily.incident.severity === "SEV-1" ? "bad" : daily.incident.severity === "SEV-2" ? "warn" : "good"}">${daily.incident.severity}</span> ${html(daily.incident.id)}</p>
          <p>${html(state.compactDashboard ? compactText(daily.incident.title, 90) : daily.incident.title)}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/incidents", withBaseParams({ seed: daily.incident.seed }))}">Open Incident Theater</a>
        `
      },
      {
        id: "tarot",
        title: "Daily Tarot",
        content: `
          <p><strong>${html(daily.tarot.cards[0].name)}</strong> (${html(daily.tarot.cards[0].orientation)})</p>
          <p>${html(state.compactDashboard ? compactText(daily.tarot.cards[0].meaning, 90) : daily.tarot.cards[0].meaning)}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/tarot", withBaseParams({ seed: daily.tarot.seed, mode: "single", rev: 1 }))}">Open Tarot</a>
        `
      },
      {
        id: "probability",
        title: "Daily Probability",
        content: `
          <p><span class="badge ${daily.probability.band === "RED" ? "bad" : daily.probability.band === "YELLOW" ? "warn" : "good"}">${daily.probability.band}</span> ${daily.probability.score}</p>
          <p>${html(state.compactDashboard ? compactText(daily.probability.scenario, 90) : daily.probability.scenario)}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/probability", withBaseParams({ seed: daily.probability.seed, s: daily.probability.scenario }))}">Open Probability</a>
        `
      },
      {
        id: "memo",
        title: "Daily Memo",
        content: `
          <p><strong>${html(daily.memo.subject)}</strong></p>
          <p>${html(state.compactDashboard ? compactText(daily.memo.rationales[0], 90) : daily.memo.rationales[0])}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/memo", withBaseParams({ seed: daily.memo.seed, q: daily.memo.topic }))}">Open Memo</a>
        `
      },
      {
        id: "npc",
        title: "Daily NPC",
        content: `
          <p><strong>${html(daily.npc.npc.name)}</strong> · ${html(daily.npc.npc.role)}</p>
          <p>${html(state.compactDashboard ? compactText(daily.npc.mission, 90) : daily.npc.mission)}</p>
          <a class="btn btn-sm" href="${buildHash("/tool/npc", withBaseParams({ seed: daily.npc.seed, q: daily.npc.request }))}">Open NPC Hotline</a>
        `
      }
    ];

    const byId = new Map(widgets.map((w) => [w.id, w]));
    const ordered = [
      ...prefs.order.filter((id) => byId.has(id)).map((id) => byId.get(id)),
      ...widgets.filter((w) => !prefs.order.includes(w.id))
    ];
    const hidden = new Set(prefs.hidden || []);

    main.innerHTML = `
      <section class="page-head">
        <div>
          <h1>Daily Briefing</h1>
          <p>Interactive deterministic briefing for ${html(daily.date)}.</p>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="start-briefing">Start Briefing</button>
          <button class="btn" data-action="toggle-compact">${state.compactDashboard ? "Compact: On" : "Compact: Off"}</button>
          <button class="btn" data-action="toggle-widget-config">Manage Widgets</button>
          <button class="btn" data-action="new-patch">New Patch</button>
        </div>
      </section>

      <section class="card tool-of-day">
        <h3>Tool of the Day</h3>
        <p><strong>${html(toolOfDay.name)}</strong> — ${html(toolOfDay.description)}</p>
        <a class="btn" href="#${toolOfDay.route}">Launch ${html(toolOfDay.name)}</a>
      </section>

      <section class="card widget-config" id="widget-config" hidden>
        <h3>Widget Preferences</h3>
        <p class="muted">Pin order and hide widgets. Saved locally.</p>
        <div class="widget-controls">
          ${ordered
            .map(
              (w) => `
              <article class="widget-row">
                <strong>${html(w.title)}</strong>
                <div class="btn-row">
                  <button class="btn btn-sm" data-action="widget-up" data-widget="${w.id}">Up</button>
                  <button class="btn btn-sm" data-action="widget-down" data-widget="${w.id}">Down</button>
                  <button class="btn btn-sm" data-action="widget-hide" data-widget="${w.id}">${hidden.has(w.id) ? "Show" : "Hide"}</button>
                </div>
              </article>
            `
            )
            .join("")}
        </div>
      </section>

      <section class="card-grid widget-grid">
        ${ordered
          .filter((w) => !hidden.has(w.id))
          .map(
            (w) => `
            <article class="card dashboard-widget" data-widget-card="${w.id}">
              <header class="widget-head"><h3>${html(w.title)}</h3><span class="chip">${html(w.id)}</span></header>
              ${w.content}
            </article>
          `
          )
          .join("")}
      </section>
    `;

    state.pageData.dashboard = { daily, widgets: ordered };

    setActions({
      generate: () => briefing.start({ chaosMode: state.chaosMode }),
      copy: () => copyText(`Daily briefing seed ${daily.seed} (${daily.date})`, "Briefing metadata copied."),
      favorite: null,
      share: () => copyText(fullShareLink(buildHash("/", withBaseParams({}))), "Dashboard link copied.")
    });

    renderInspector();
  }

  function renderToolsIndex() {
    const tools = engine.getToolCatalog();
    main.innerHTML = `
      <section class="page-head">
        <div>
          <h1>Tools</h1>
          <p>Generators and modules driven entirely by static content packs.</p>
        </div>
      </section>
      <section class="tools-list">
        ${tools
          .map(
            (tool) => `
            <article class="tool-card">
              <h3>${html(tool.name)}</h3>
              <p>${html(tool.description)}</p>
              <div class="chip-list">${tool.tags.map((tag) => `<span class="chip">${html(tag)}</span>`).join("")}</div>
              <div class="btn-row">${tool.active ? `<a class="btn" href="#${tool.route}">Open</a>` : `<span class="badge">Upcoming</span>`}</div>
            </article>
          `
          )
          .join("")}
      </section>
    `;
    setActions();
    renderInspector();
  }

  function renderUniverse(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 101;
    const chaos = resolveChaos(params);
    const result = engine.generateUniverse({ seed, chaosMode: chaos });
    setThemeFromUniverse(result);

    const outputText = [
      `Theme: ${result.theme.name}`,
      `Tone: ${result.tone} // ${result.tagline}`,
      `Rule: ${result.rule}`,
      `Law: ${result.law}`,
      `Headline: ${result.headline}`,
      ...result.patchNotes.map((line) => `- ${line}`)
    ].join("\n");

    main.innerHTML = `
      <section class="page-head"><div><h1>Universe Forge</h1><p>Generate deterministic universe profiles and procedural posters.</p></div></section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="u-seed">Seed</label>
          <input id="u-seed" type="number" value="${result.seed}" />
          <div class="btn-row">
            <button class="btn btn-primary" data-action="u-next">Next Seed</button>
            <button class="btn" data-action="u-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy Output</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
          <details>
            <summary>Patch Metadata</summary>
            <p class="muted">Theme colors update app accents. Chaos mode influences weighted tone and absurdity.</p>
          </details>
        </aside>
        <article class="output-panel">
          <h3>${html(result.headline)}</h3>
          <div class="chip-list"><span class="chip">${html(result.theme.name)}</span><span class="chip">${html(result.tone)}</span></div>
          <p>${html(result.tagline)}</p>
          <dl class="kv"><dt>Reality Rule</dt><dd>${html(result.rule)}</dd><dt>Law</dt><dd>${html(result.law)}</dd></dl>
          <h4>Patch Notes</h4>
          <ul>${result.patchNotes.map((note) => `<li>${html(note)}</li>`).join("")}</ul>
          <div class="poster-wrap">${result.posterSvg}</div>
        </article>
      </section>
    `;

    registerCurrentOutput({
      tool: "universe",
      type: "universe",
      route: "/tool/universe",
      params: withBaseParams({ seed: result.seed }, chaos),
      title: result.headline,
      summary: `${result.tone} // ${result.tagline}`,
      text: outputText,
      tags: [result.theme.name, result.tone],
      posterSvg: result.posterSvg,
      payload: result
    });

    setActions({
      generate: () => {
        const next = engine.generateUniverse({
          seed: engine.nextSeed(parseIntSafe(document.getElementById("u-seed")?.value, result.seed)),
          chaosMode: chaos,
          enforceUnseen: true
        });
        navigate("/tool/universe", withBaseParams({ seed: next.seed }, chaos));
      },
      copy: () => copyText(outputText, "Universe copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderMemo(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 207;
    const topic = params.q || "";
    const chaos = resolveChaos(params);
    const result = engine.generateMemo({ seed, topic, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Exec Memo Generator</h1><p>Justification output with rationale bullets and controls.</p></div></section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="m-seed">Seed</label>
          <input id="m-seed" type="number" value="${result.seed}" />
          <label for="m-topic">What are you justifying?</label>
          <input id="m-topic" type="text" value="${html(result.topic)}" />
          <div class="btn-row">
            <button class="btn btn-primary" data-action="m-generate">Generate</button>
            <button class="btn" data-action="m-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
        </aside>
        <article class="output-panel">
          <h3>${html(result.subject)}</h3>
          <p class="muted">Date ${result.date}</p>
          <pre>${html(result.text)}</pre>
        </article>
      </section>
    `;

    registerCurrentOutput({
      tool: "memo",
      route: "/tool/memo",
      params: withBaseParams({ seed: result.seed, q: result.topic }, chaos),
      title: result.subject,
      summary: result.rationales[0],
      text: result.text,
      tags: ["memo", "exec"],
      payload: result
    });

    setActions({
      generate: () => {
        const nextSeed = parseIntSafe(document.getElementById("m-seed")?.value, result.seed);
        const nextTopic = String(document.getElementById("m-topic")?.value || "").trim();
        navigate("/tool/memo", withBaseParams({ seed: nextSeed, q: nextTopic }, chaos));
      },
      copy: () => copyText(result.text, "Memo copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderTranslator(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 313;
    const inputText = params.text || "";
    const chaos = resolveChaos(params);
    const result = engine.generateTranslation({ seed, inputText, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>Meeting Translator</h1><p>Translate high-context meeting language into direct actions.</p></div></section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="t-seed">Seed</label>
          <input id="t-seed" type="number" value="${result.seed}" />
          <label for="t-input">Meeting Notes</label>
          <textarea id="t-input">${html(result.lines.join("\n"))}</textarea>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="t-generate">Translate</button>
            <button class="btn" data-action="t-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
        </aside>
        <article class="output-panel">
          <h3>Summary</h3>
          <p>${html(result.summary)}</p>
          <ul>
            ${result.translations.map((line) => `<li><strong>${html(line.line)}</strong><br /><span class="muted">${html(line.meaning)}</span></li>`).join("")}
          </ul>
        </article>
      </section>
    `;

    registerCurrentOutput({
      tool: "translator",
      route: "/tool/translator",
      params: withBaseParams({ seed: result.seed, text: result.lines.join("\n") }, chaos),
      title: "Meeting Translation",
      summary: result.summary,
      text: result.text,
      tags: ["translation"],
      payload: result
    });

    setActions({
      generate: () => {
        const nextSeed = parseIntSafe(document.getElementById("t-seed")?.value, result.seed);
        const nextText = String(document.getElementById("t-input")?.value || "").trim();
        navigate("/tool/translator", withBaseParams({ seed: nextSeed, text: nextText }, chaos));
      },
      copy: () => copyText(result.text, "Translation copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderNpc(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 509;
    const request = params.q || "";
    const chaos = resolveChaos(params);
    const result = engine.generateNpc({ seed, request, chaosMode: chaos });

    main.innerHTML = `
      <section class="page-head"><div><h1>NPC Hotline</h1><p>Summon deterministic specialist missions and constraints.</p></div></section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="n-seed">Seed</label>
          <input id="n-seed" type="number" value="${result.seed}" />
          <label for="n-request">Request</label>
          <input id="n-request" type="text" value="${html(result.request)}" />
          <div class="btn-row">
            <button class="btn btn-primary" data-action="n-generate">Summon</button>
            <button class="btn" data-action="n-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
        </aside>
        <article class="output-panel">
          <h3>${html(result.npc.name)} <span class="muted">(${html(result.npc.role)})</span></h3>
          <p>${html(result.opener)}</p>
          <dl class="kv"><dt>Mission</dt><dd>${html(result.mission)}</dd><dt>Constraint</dt><dd>${html(result.constraint)}</dd><dt>Reward</dt><dd>${html(result.reward)}</dd><dt>Hint</dt><dd>${html(result.hint)}</dd></dl>
        </article>
      </section>
    `;

    registerCurrentOutput({
      tool: "npc",
      route: "/tool/npc",
      params: withBaseParams({ seed: result.seed, q: result.request }, chaos),
      title: `${result.npc.name} (${result.npc.role})`,
      summary: result.mission,
      text: result.text,
      tags: result.npc.archetype || ["npc"],
      payload: result
    });

    setActions({
      generate: () => {
        const nextSeed = parseIntSafe(document.getElementById("n-seed")?.value, result.seed);
        const nextReq = String(document.getElementById("n-request")?.value || "").trim();
        navigate("/tool/npc", withBaseParams({ seed: nextSeed, q: nextReq }, chaos));
      },
      copy: () => copyText(result.text, "NPC output copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderProbability(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 401;
    const chaos = resolveChaos(params);
    const scenario = params.s || "";
    const selected = parseIndexCsv(params.ctrl);
    const result = engine.generateProbability({ seed, scenario, chaosMode: chaos });
    const simulation = engine.simulateProbabilityControls({
      seed: result.seed,
      baseScore: result.score,
      controls: result.controls,
      selectedIndexes: selected
    });

    const selectedSet = new Set(selected);
    const gaugeMarkup = createGaugeSvg({
      score: simulation.afterScore,
      beforeScore: simulation.beforeScore,
      label: "Adjusted Risk"
    });

    const reportText = [
      `Scenario: ${result.scenario}`,
      `Before: ${simulation.beforeScore} (${simulation.beforeBand})`,
      `After: ${simulation.afterScore} (${simulation.afterBand})`,
      `Narrative: ${result.explanation}`,
      "Controls:",
      ...result.controls.map((line, idx) => {
        const effect = simulation.effects[idx];
        const sign = effect.delta > 0 ? "+" : "";
        const applied = selectedSet.has(idx) ? "[Applied]" : "";
        return `- ${line} (${sign}${effect.delta}) ${applied}`;
      })
    ].join("\n");

    main.innerHTML = `
      <section class="page-head">
        <div><h1>Probability Engine</h1><p>Interactive deterministic risk gauge with control-impact simulator.</p></div>
      </section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="p-seed">Seed</label>
          <input id="p-seed" type="number" value="${result.seed}" />
          <label for="p-scenario">Scenario</label>
          <input id="p-scenario" type="text" value="${html(result.scenario)}" />
          <div class="btn-row">
            <button class="btn btn-primary" data-action="p-assess">Assess</button>
            <button class="btn" data-action="p-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
          <details open>
            <summary>Control Impact Simulator</summary>
            <p class="muted">Toggle controls to apply deterministic seed-based deltas. Share link persists selected controls.</p>
            <ul class="control-list">
              ${result.controls
                .map((control, idx) => {
                  const effect = simulation.effects[idx];
                  const sign = effect.delta > 0 ? "+" : "";
                  return `
                    <li>
                      <label class="control-row">
                        <input type="checkbox" data-action="toggle-control" data-control-index="${idx}" ${selectedSet.has(idx) ? "checked" : ""} />
                        <span>${html(control)}</span>
                        <span class="badge ${effect.delta <= 0 ? "good" : "bad"}">${sign}${effect.delta}</span>
                      </label>
                    </li>
                  `;
                })
                .join("")}
            </ul>
          </details>
        </aside>
        <article class="output-panel">
          <h3>${html(result.scenario)}</h3>
          <div id="prob-gauge-wrap" class="gauge-wrap">${gaugeMarkup}</div>
          <p><strong>Before:</strong> ${simulation.beforeScore} (${simulation.beforeBand})</p>
          <p><strong>After:</strong> ${simulation.afterScore} (${simulation.afterBand})</p>
          <p><strong>Delta:</strong> ${simulation.totalDelta > 0 ? "+" : ""}${simulation.totalDelta}</p>
          <p>${html(result.explanation)}</p>
        </article>
      </section>
    `;

    animateGauge(document.getElementById("prob-gauge-wrap"));

    state.pageData.probability = {
      result,
      simulation,
      chaos,
      selected: [...selectedSet]
    };

    registerCurrentOutput({
      tool: "probability",
      route: "/tool/probability",
      params: withBaseParams(
        {
          seed: result.seed,
          s: result.scenario,
          ctrl: [...selectedSet].sort((a, b) => a - b).join(",")
        },
        chaos
      ),
      title: `${simulation.afterBand} ${simulation.afterScore}`,
      summary: result.scenario,
      text: reportText,
      tags: [result.band, simulation.afterBand],
      payload: {
        ...result,
        simulation
      }
    });

    setActions({
      generate: () => {
        const nextSeed = parseIntSafe(document.getElementById("p-seed")?.value, result.seed);
        const nextScenario = String(document.getElementById("p-scenario")?.value || "").trim();
        const selectedIndexes = [...main.querySelectorAll('[data-control-index]')]
          .filter((node) => node.checked)
          .map((node) => parseIntSafe(node.getAttribute("data-control-index"), 0));
        navigate(
          "/tool/probability",
          withBaseParams(
            {
              seed: nextSeed,
              s: nextScenario,
              ctrl: selectedIndexes.join(",")
            },
            chaos
          )
        );
      },
      copy: () => copyText(reportText, "Probability report copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderIncidents(params) {
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed() + 607;
    const chaos = resolveChaos(params);
    const result = engine.generateIncident({ seed, chaosMode: chaos });
    const incidentKey = stableHash([result.id, result.seed]);
    const checks = getIncidentChecks(incidentKey);

    const exportMarkdown = [
      `# Incident ${result.id}`,
      `- Severity: ${result.severity}`,
      `- Duration: ${result.duration}`,
      `- Start: ${result.startTime}`,
      `- Impact: ${result.impact}`,
      "",
      "## Timeline",
      ...result.timeline.map((line) => `- ${line.time} ${line.event}`),
      "",
      "## Root Cause",
      result.rootCause,
      "",
      "## Learnings",
      ...result.learned.map((line) => `- ${line}`),
      "",
      "## Action Items",
      ...result.actionItems.map((item, idx) => `- [${checks[idx] ? "x" : " "}] (${item.owner}) ${item.text}`)
    ].join("\n");

    const incidentText = [
      `${result.id} (${result.severity})`,
      result.title,
      `Impact: ${result.impact}`,
      `Root Cause: ${result.rootCause}`,
      "Timeline:",
      ...result.timeline.map((line) => `- ${line.time} ${line.event}`),
      "Action Items:",
      ...result.actionItems.map((item) => `- (${item.owner}) ${item.text}`)
    ].join("\n");

    main.innerHTML = `
      <section class="page-head">
        <div>
          <h1>Incident Theater</h1>
          <p>Structured incident view with timeline, scorecard, and actionable checklist export.</p>
        </div>
      </section>
      <section class="incident-header card">
        <div class="chip-list">
          <span class="chip ${result.severity === "SEV-1" ? "bad" : result.severity === "SEV-2" ? "warn" : "good"}">${result.severity}</span>
          <span class="chip">${html(result.id)}</span>
          <span class="chip">${html(result.duration)}</span>
          <span class="chip">Start ${html(result.startTime)}</span>
          ${result.impactedSystems.map((system) => `<span class="chip">${html(system)}</span>`).join("")}
        </div>
        <h3>${html(result.title)}</h3>
        <p>${html(result.impact)}</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="i-next">Next Seed</button>
          <button class="btn" data-action="i-random">Random Seed</button>
          <button class="btn" data-action="copy-current">Copy</button>
          <button class="btn" data-action="share-current">Copy Share Link</button>
          <button class="btn" data-action="favorite-current">Favorite</button>
          <button class="btn" data-action="incident-export-md">Export Markdown</button>
          <button class="btn" data-action="incident-export-json">Export JSON</button>
          <button class="btn" data-action="incident-open-poster">Open Poster</button>
        </div>
      </section>

      <section class="card-grid incident-grid">
        <article class="card">
          <h3>Timeline</h3>
          ${renderTimeline(result.timeline)}
        </article>

        <article class="card">
          <details open>
            <summary><strong>Root Cause</strong></summary>
            <p>${html(result.rootCause)}</p>
          </details>
          <details open>
            <summary><strong>What We Learned</strong></summary>
            <ul>${result.learned.map((line) => `<li>${html(line)}</li>`).join("")}</ul>
          </details>
        </article>

        <article class="card">
          <h3>Action Items</h3>
          <ul class="action-list">
            ${result.actionItems
              .map(
                (item, idx) => `
                <li class="action-row">
                  <label>
                    <input type="checkbox" data-action="incident-check" data-check-index="${idx}" ${checks[idx] ? "checked" : ""} />
                    <span>${html(item.text)}</span>
                  </label>
                  <span class="badge">${html(item.owner)}</span>
                </li>
              `
              )
              .join("")}
          </ul>
        </article>

        <article class="card">
          <h3>Postmortem Scorecard</h3>
          ${renderScorecard(result.scorecard)}
          <div class="poster-thumb-inline" data-action="incident-open-poster">${result.posterSvg}</div>
        </article>
      </section>
    `;

    state.pageData.incidents = {
      result,
      chaos,
      incidentKey,
      exportMarkdown
    };

    registerCurrentOutput({
      tool: "incidents",
      type: "incident",
      route: "/tool/incidents",
      params: withBaseParams({ seed: result.seed }, chaos),
      title: `${result.id} ${result.title}`,
      summary: result.impact,
      text: incidentText,
      tags: [result.severity, ...result.impactedSystems.slice(0, 2)],
      posterSvg: result.posterSvg,
      payload: result
    });

    setActions({
      generate: () => {
        const next = engine.generateIncident({ seed: engine.nextSeed(result.seed), chaosMode: chaos, enforceUnseen: true });
        navigate("/tool/incidents", withBaseParams({ seed: next.seed }, chaos));
      },
      copy: () => copyText(incidentText, "Incident copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function renderTarot(params) {
    const mode = params.mode === "spread3" ? "spread3" : "single";
    const randomOrientation = params.rev === "0" ? false : true;
    const seed = params.seed ? engine.normalizeSeed(params.seed) : engine.dailySeed();
    const chaos = resolveChaos(params);

    const result = engine.generateTarot({
      seed,
      mode,
      randomOrientation,
      chaosMode: chaos
    });

    const journalDate = toDateKey();
    const journalKey = `${journalDate}:${mode}`;
    const journalValue = getJournalEntry(journalKey);

    main.innerHTML = `
      <section class="page-head">
        <div><h1>Tarot of Productivity</h1><p>Card reveal interactions with deterministic draw state and local journal.</p></div>
      </section>
      <section class="tool-layout">
        <aside class="tool-panel">
          <label for="tr-seed">Seed</label>
          <input id="tr-seed" type="number" value="${result.seed}" />
          <label for="tr-mode">Draw Mode</label>
          <select id="tr-mode">
            <option value="single" ${mode === "single" ? "selected" : ""}>Single Card</option>
            <option value="spread3" ${mode === "spread3" ? "selected" : ""}>Past / Present / Future</option>
          </select>
          <label class="control-row">
            <input id="tr-rev" type="checkbox" ${randomOrientation ? "checked" : ""} />
            <span>Random Upright/Reversed</span>
          </label>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="tr-draw">Draw</button>
            <button class="btn" data-action="tr-daily">Daily</button>
            <button class="btn" data-action="tr-random">Random Seed</button>
            <button class="btn" data-action="copy-current">Copy</button>
            <button class="btn" data-action="share-current">Copy Share Link</button>
            <button class="btn" data-action="favorite-current">Favorite</button>
          </div>
          <section class="card journal-card">
            <h3>Journal (${journalDate})</h3>
            <textarea id="tarot-journal" data-journal-key="${journalKey}" placeholder="Write reflection notes for today...">${html(journalValue)}</textarea>
            <div class="btn-row">
              <button class="btn" data-action="tr-save-journal">Save Journal</button>
              <button class="btn" data-action="tr-export-journal">Export Journal</button>
            </div>
          </section>
        </aside>
        <article class="output-panel">
          <h3>${mode === "single" ? "Single Draw" : "Past / Present / Future"}</h3>
          <div class="tarot-grid ${mode === "spread3" ? "spread" : "single"}">
            ${result.cards
              .map(
                (card, idx) => `
                <article class="tarot-card" data-card-index="${idx}">
                  <div class="tarot-flip" data-action="tr-reveal" data-card-index="${idx}">
                    <div class="tarot-face tarot-back">
                      <span>RealityOps Tarot</span>
                    </div>
                    <div class="tarot-face tarot-front">
                      <div class="poster-wrap">${card.artSvg}</div>
                      <h4>${html(card.position)}: ${html(card.name)}</h4>
                      <p><span class="chip">${html(card.orientation)}</span> <span class="chip">${html(card.archetype)}</span></p>
                      <p>${html(card.meaning)}</p>
                      <p><strong>Action:</strong> ${html(card.action_prompt)}</p>
                      <p><strong>Warning:</strong> ${html(card.warning)}</p>
                    </div>
                  </div>
                  <button class="btn btn-sm" data-action="tr-card-detail" data-card-index="${idx}">Open Details</button>
                </article>
              `
              )
              .join("")}
          </div>
        </article>
      </section>
    `;

    const text = result.cards
      .map((card) => `${card.position}: ${card.name} (${card.orientation})\nMeaning: ${card.meaning}\nAction: ${card.action_prompt}\nWarning: ${card.warning}`)
      .join("\n\n");

    state.pageData.tarot = {
      result,
      mode,
      randomOrientation,
      chaos,
      revealed: new Set()
    };

    registerCurrentOutput({
      tool: "tarot",
      route: "/tool/tarot",
      params: withBaseParams({ seed: result.seed, mode, rev: randomOrientation ? 1 : 0 }, chaos),
      title: mode === "single" ? result.cards[0].name : "3-Card Productivity Spread",
      summary: result.cards[0].meaning,
      text,
      tags: [mode, result.cards[0].orientation],
      payload: result
    });

    setActions({
      generate: () => {
        const nextSeed = parseIntSafe(document.getElementById("tr-seed")?.value, result.seed);
        const nextMode = String(document.getElementById("tr-mode")?.value || "single");
        const nextRev = document.getElementById("tr-rev")?.checked ? 1 : 0;
        navigate("/tool/tarot", withBaseParams({ seed: nextSeed, mode: nextMode, rev: nextRev }, chaos));
      },
      copy: () => copyText(text, "Tarot reading copied."),
      favorite: toggleFavoriteCurrent,
      share: () => copyText(state.currentEntry?.shareLink || "", "Share link copied.")
    });
  }

  function museumCard(item) {
    return `
      <article class="museum-card" data-item-id="${html(item.id)}">
        <div class="poster-thumb">${item.posterSvg || `<div class="poster-fallback">${html(item.tool.toUpperCase())}</div>`}</div>
        <div class="card-body">
          <h4>${html(item.title || item.tool)}</h4>
          <p class="muted">${html(item.type || item.tool)} · ${toLocalString(item.timestamp)}</p>
          <p>${html(compactText(item.summary || item.text, 120))}</p>
          <div class="btn-row">
            <button class="btn btn-sm" data-action="museum-open" data-item-id="${html(item.id)}">Open</button>
            <button class="btn btn-sm" data-action="museum-copy-link" data-item-id="${html(item.id)}">Copy Link</button>
            <button class="btn btn-sm" data-action="museum-delete" data-item-id="${html(item.id)}">Delete</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderMuseum(params) {
    const type = params.type || "all";
    const query = params.q || "";
    const from = params.from || "";
    const to = params.to || "";

    const source = getFavorites();
    const filtered = source
      .filter((item) => (type === "all" ? true : (item.type || item.tool) === type || item.tool === type))
      .filter((item) => inDateRange(item.timestamp, from, to))
      .filter((item) => matchesQuery(item, query))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    state.pageData.museum.filtered = filtered;

    main.innerHTML = `
      <section class="page-head">
        <div><h1>Universe Museum</h1><p>Poster gallery with filters, import/export, and modal details.</p></div>
        <div class="btn-row">
          <button class="btn" data-action="museum-export">Export Vault</button>
          <button class="btn" data-action="museum-import">Import Vault</button>
        </div>
      </section>
      <section class="card museum-filters">
        <div class="filter-grid">
          <label>Type
            <select id="museum-type">
              ${["all", "universe", "incident", "tarot", "memo", "translator", "npc", "probability"].map((t) => `<option value="${t}" ${type === t ? "selected" : ""}>${t}</option>`).join("")}
            </select>
          </label>
          <label>Search
            <input id="museum-query" type="text" value="${html(query)}" placeholder="Title, summary, body" />
          </label>
          <label>From
            <input id="museum-from" type="date" value="${formatDateInput(from)}" />
          </label>
          <label>To
            <input id="museum-to" type="date" value="${formatDateInput(to)}" />
          </label>
          <button class="btn" data-action="museum-apply">Apply</button>
        </div>
        <p class="muted">Showing ${filtered.length} item(s).</p>
      </section>
      <section id="museum-scroll" class="museum-scroll">
        <div id="museum-grid" class="museum-grid"></div>
      </section>
    `;

    const grid = document.getElementById("museum-grid");
    const scroll = document.getElementById("museum-scroll");

    const renderWindow = () => {
      if (!grid || !scroll) {
        return;
      }
      const itemHeight = 330;
      if (filtered.length <= 200) {
        grid.innerHTML = filtered.map(museumCard).join("");
        return;
      }
      const start = Math.max(0, Math.floor(scroll.scrollTop / itemHeight) - 8);
      const windowSize = 70;
      const visible = filtered.slice(start, start + windowSize);
      const topPad = start * itemHeight;
      const bottomPad = Math.max(0, (filtered.length - (start + visible.length)) * itemHeight);
      grid.innerHTML = `
        <div style="height:${topPad}px"></div>
        ${visible.map(museumCard).join("")}
        <div style="height:${bottomPad}px"></div>
      `;
    };

    renderWindow();
    scroll?.addEventListener("scroll", renderWindow);

    setActions();
    renderInspector();
  }

  function renderPacks(params) {
    const search = String(params.q || "").trim();
    const summaries = engine.listPackSummaries();
    const lint = runPackLint(engine.manifest, engine.packs);
    const filteredSummaries = !search
      ? summaries
      : summaries.filter((pack) => `${pack.file} ${pack.meta?.name || ""} ${pack.meta?.description || ""}`.toLowerCase().includes(search.toLowerCase()));

    const searchHits = search ? searchAcrossPacks(engine.packs, search, 35) : [];

    main.innerHTML = `
      <section class="page-head">
        <div><h1>Content Pack Manager</h1><p>Search, stats, lint checks, and expansion guide for static JSON packs.</p></div>
      </section>
      <section class="card">
        <div class="filter-grid">
          <label>Search Packs and Values
            <input id="pack-search" type="text" value="${html(search)}" placeholder="Try 'incident', 'owner', 'risk'" />
          </label>
          <button class="btn" data-action="pack-search-apply">Search</button>
        </div>
        <div class="chip-list">
          <span class="chip">Total Items: ${lint.stats.totalItems}</span>
          <span class="chip">Biggest: ${html(lint.stats.biggestPack?.file || "n/a")}</span>
          <span class="chip">Smallest: ${html(lint.stats.smallestPack?.file || "n/a")}</span>
          <span class="chip ${lint.stats.issueCount ? "warn" : "good"}">Issues: ${lint.stats.issueCount}</span>
          <span class="chip ${lint.stats.missingMeta ? "warn" : "good"}">Missing Meta: ${lint.stats.missingMeta}</span>
        </div>
      </section>

      <section class="card">
        <h3>Lint Checks</h3>
        <ul class="lint-list">
          ${lint.issues.length
            ? lint.issues
                .slice(0, 80)
                .map((issue) => `<li class="lint-${issue.severity}"><strong>${issue.pack}</strong> · ${issue.code} · ${html(issue.message)}</li>`)
                .join("")
            : `<li class="lint-ok">No lint issues found.</li>`}
        </ul>
      </section>

      ${search
        ? `<section class="card"><h3>Search Results</h3><ul>${searchHits.map((hit) => `<li><strong>${hit.packKey}</strong> <code>${html(hit.path)}</code> — ${html(compactText(hit.value, 160))}</li>`).join("") || "<li>No matches.</li>"}</ul></section>`
        : ""}

      ${filteredSummaries
        .map((pack) => {
          const topCounts = [...pack.counts].sort((a, b) => b.count - a.count).slice(0, 8);
          return `
            <article class="pack-item">
              <h4>${html(pack.meta?.name || pack.file)} <span class="muted">(${html(pack.file)})</span></h4>
              <p class="muted">v${html(pack.meta?.version || "n/a")} · updated ${html(pack.meta?.lastUpdated || "n/a")}</p>
              <p>${html(pack.meta?.description || "")}</p>
              <p><strong>Counts:</strong> ${topCounts.map((row) => `${html(row.path)}: ${row.count}`).join(" · ")}</p>
              <p><strong>Examples:</strong></p>
              <ul>${pack.examples.map((example) => `<li><code>${html(example.path)}</code> (${example.count}) — ${html(example.sample)}</li>`).join("")}</ul>
            </article>
          `;
        })
        .join("")}

      <section class="card">
        <h3>How to Extend Packs</h3>
        <ol>
          <li>Create a new JSON file under <code>content/</code> with <code>meta.name</code>, <code>meta.version</code>, <code>meta.lastUpdated</code>, and <code>meta.description</code>.</li>
          <li>Register the file in <code>content/packs.json</code> with <code>{"key":"...","file":"..."}</code>.</li>
          <li>Add generator mapping logic in <code>assets/js/generators.js</code> and expose any new tool or module in <code>content/microtools.json</code>.</li>
          <li>Verify counts and token templates from this page’s lint checks before commit.</li>
        </ol>
      </section>
    `;

    state.pageData.packs = { summaries: filteredSummaries, lint };
    setActions();
    renderInspector();
  }

  function renderVault() {
    const favorites = getFavorites();
    const history = getHistory();

    main.innerHTML = `
      <section class="page-head"><div><h1>Vault</h1><p>Local history and favorites with copy/share and import/export utilities.</p></div></section>
      <section class="btn-row">
        <button class="btn" data-action="museum-export">Export Vault</button>
        <button class="btn" data-action="museum-import">Import Vault</button>
      </section>
      <section class="two-col">
        <article class="card">
          <h3>Favorites (${favorites.length})</h3>
          ${favorites
            .map(
              (item) => `
              <div class="vault-item">
                <h4>${html(item.title || item.tool)}</h4>
                <div class="chip-list"><span class="chip">${html(item.tool)}</span><span class="chip">Seed ${html(item.seed)}</span><span class="chip">${toLocalString(item.timestamp)}</span></div>
                <p>${html(compactText(item.summary || item.text, 140))}</p>
                <div class="btn-row">
                  <button class="btn btn-sm" data-action="vault-copy" data-id="${html(item.id)}">Copy</button>
                  <button class="btn btn-sm" data-action="vault-link" data-id="${html(item.id)}">Copy Link</button>
                  <button class="btn btn-sm" data-action="vault-open" data-id="${html(item.id)}">Open</button>
                  <button class="btn btn-sm" data-action="vault-remove" data-id="${html(item.id)}">Remove</button>
                </div>
              </div>
            `
            )
            .join("") || `<p class="muted">No favorites yet.</p>`}
        </article>
        <article class="card">
          <h3>History (${history.length})</h3>
          ${history
            .map(
              (item) => `
              <div class="vault-item">
                <h4>${html(item.title || item.tool)}</h4>
                <div class="chip-list"><span class="chip">${html(item.tool)}</span><span class="chip">Seed ${html(item.seed)}</span><span class="chip">${toLocalString(item.timestamp)}</span></div>
                <p>${html(compactText(item.summary || item.text, 140))}</p>
                <div class="btn-row">
                  <button class="btn btn-sm" data-action="history-copy" data-id="${html(item.id)}">Copy</button>
                  <button class="btn btn-sm" data-action="history-link" data-id="${html(item.id)}">Copy Link</button>
                  <button class="btn btn-sm" data-action="history-open" data-id="${html(item.id)}">Open</button>
                </div>
              </div>
            `
            )
            .join("") || `<p class="muted">No history yet.</p>`}
        </article>
      </section>
    `;

    setActions();
    renderInspector();
  }

  function renderAbout() {
    main.innerHTML = `
      <section class="page-head"><div><h1>About / Spec</h1><p>RealityOps is static, deterministic, and designed for GitHub Pages.</p></div></section>
      <section class="card-grid">
        <article class="card"><h3>Architecture</h3><ul><li>Vanilla ES modules only.</li><li>Hash routing for project pages and user pages.</li><li>Service worker caches assets and content packs for offline use.</li></ul></article>
        <article class="card"><h3>Determinism</h3><ul><li>All tools run from seed + static content packs.</li><li>Share links preserve query state (seed, chaos, controls).</li><li>Daily outputs are date-seeded locally.</li></ul></article>
        <article class="card"><h3>UX Enhancements</h3><ul><li>Command palette (Ctrl/Cmd+K).</li><li>Daily briefing guided flow.</li><li>Inspector panel, route transitions, and toast stack.</li></ul></article>
        <article class="card"><h3>Extensibility</h3><ul><li>Packs manager includes lint checks and search.</li><li>Museum import/export supports vault portability.</li><li>All data remains local to the browser.</li></ul></article>
      </section>
    `;
    setActions();
    renderInspector();
  }

  async function handleMainClick(event) {
    const actionNode = event.target.closest("[data-action]");
    if (!actionNode) {
      return;
    }
    const action = actionNode.getAttribute("data-action");

    if (action === "copy-current") return state.actions.copy?.();
    if (action === "share-current") return state.actions.share?.();
    if (action === "favorite-current") return state.actions.favorite?.();

    if (action === "start-briefing") return briefing.start({ chaosMode: state.chaosMode });
    if (action === "toggle-compact") {
      state.compactDashboard = !state.compactDashboard;
      patchSettings({ compactDashboard: state.compactDashboard });
      return renderDashboard();
    }
    if (action === "toggle-widget-config") {
      const panel = document.getElementById("widget-config");
      if (panel) panel.hidden = !panel.hidden;
      return;
    }
    if (action === "widget-up") {
      moveWidget(actionNode.getAttribute("data-widget"), "up");
      return renderDashboard();
    }
    if (action === "widget-down") {
      moveWidget(actionNode.getAttribute("data-widget"), "down");
      return renderDashboard();
    }
    if (action === "widget-hide") {
      toggleWidgetHidden(actionNode.getAttribute("data-widget"));
      return renderDashboard();
    }

    if (action === "u-next" || action === "m-generate" || action === "t-generate" || action === "n-generate" || action === "p-assess" || action === "tr-draw") {
      return state.actions.generate?.();
    }

    if (action === "u-random") {
      const next = engine.generateUniverse({ seed: engine.randomSeed(), chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/universe", withBaseParams({ seed: next.seed }));
    }
    if (action === "m-random") {
      const topic = String(document.getElementById("m-topic")?.value || "").trim();
      const next = engine.generateMemo({ seed: engine.randomSeed(), topic, chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/memo", withBaseParams({ seed: next.seed, q: topic }));
    }
    if (action === "t-random") {
      const text = String(document.getElementById("t-input")?.value || "").trim();
      const next = engine.generateTranslation({ seed: engine.randomSeed(), inputText: text, chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/translator", withBaseParams({ seed: next.seed, text }));
    }
    if (action === "n-random") {
      const req = String(document.getElementById("n-request")?.value || "").trim();
      const next = engine.generateNpc({ seed: engine.randomSeed(), request: req, chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/npc", withBaseParams({ seed: next.seed, q: req }));
    }
    if (action === "p-random") {
      const scenario = String(document.getElementById("p-scenario")?.value || "").trim();
      const selected = [...main.querySelectorAll('[data-control-index]')].filter((n) => n.checked).map((n) => n.getAttribute("data-control-index"));
      const next = engine.generateProbability({ seed: engine.randomSeed(), scenario, chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/probability", withBaseParams({ seed: next.seed, s: scenario, ctrl: selected.join(",") }));
    }
    if (action === "i-next") return state.actions.generate?.();
    if (action === "i-random") {
      const next = engine.generateIncident({ seed: engine.randomSeed(), chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/incidents", withBaseParams({ seed: next.seed }));
    }

    if (action === "incident-export-md") {
      const data = state.pageData.incidents;
      if (data) downloadText(`${slugify(data.result.id)}.md`, data.exportMarkdown, "text/markdown");
      return;
    }
    if (action === "incident-export-json") {
      const data = state.pageData.incidents;
      if (data) downloadText(`${slugify(data.result.id)}.json`, JSON.stringify(data.result, null, 2), "application/json");
      return;
    }
    if (action === "incident-open-poster") {
      const data = state.pageData.incidents;
      if (!data) return;
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="poster-wrap">${data.result.posterSvg}</div>`;
      return components.openModal({ title: `${data.result.id} Poster`, content: wrap });
    }
    if (action === "copy-event") {
      const data = state.pageData.incidents;
      if (!data) return;
      const idx = parseIntSafe(actionNode.getAttribute("data-event"), 0);
      const line = data.result.timeline[idx];
      if (line) return copyText(`${line.time} ${line.event}`, "Timeline event copied.");
    }

    if (action === "tr-daily") return navigate("/tool/tarot", withBaseParams({ seed: engine.dailySeed(), mode: "single", rev: 1 }));
    if (action === "tr-random") {
      const mode = String(document.getElementById("tr-mode")?.value || "single");
      const rev = document.getElementById("tr-rev")?.checked ? 1 : 0;
      const next = engine.generateTarot({ seed: engine.randomSeed(), mode, randomOrientation: rev === 1, chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/tarot", withBaseParams({ seed: next.seed, mode, rev }));
    }
    if (action === "tr-reveal") {
      const index = parseIntSafe(actionNode.getAttribute("data-card-index"), 0);
      const card = main.querySelector(`.tarot-card[data-card-index="${index}"] .tarot-flip`);
      if (card) card.classList.toggle("revealed");
      return;
    }
    if (action === "tr-card-detail") {
      const idx = parseIntSafe(actionNode.getAttribute("data-card-index"), 0);
      const data = state.pageData.tarot;
      const card = data?.result?.cards?.[idx];
      if (!card) return;
      const node = document.createElement("div");
      node.innerHTML = `<div class="poster-wrap">${card.artSvg}</div><h4>${html(card.position)}: ${html(card.name)}</h4><p>${html(card.meaning)}</p><p><strong>Action:</strong> ${html(card.action_prompt)}</p><p><strong>Warning:</strong> ${html(card.warning)}</p>`;
      return components.openModal({ title: card.name, subtitle: card.orientation, content: node });
    }
    if (action === "tr-save-journal") {
      const area = document.getElementById("tarot-journal");
      if (!area) return;
      setJournalEntry(area.getAttribute("data-journal-key"), area.value);
      components.showToast({ message: "Journal saved.", type: "success" });
      return;
    }
    if (action === "tr-export-journal") {
      return downloadText(`realityops-journal-${toDateKey()}.json`, JSON.stringify(exportJournal(), null, 2), "application/json");
    }

    if (action === "museum-apply") {
      const type = String(document.getElementById("museum-type")?.value || "all");
      const q = String(document.getElementById("museum-query")?.value || "").trim();
      const from = String(document.getElementById("museum-from")?.value || "");
      const to = String(document.getElementById("museum-to")?.value || "");
      return navigate("/tool/museum", withBaseParams({ type, q, from, to }));
    }
    if (action === "museum-export") {
      downloadText("realityops-vault.json", JSON.stringify(exportVault(), null, 2), "application/json");
      return components.showToast({ message: "Vault exported.", type: "success" });
    }
    if (action === "museum-import") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const payload = JSON.parse(await file.text());
          const result = importVaultData(payload);
          components.showToast({ message: `Imported +${result.favoritesAdded} favorites, +${result.historyAdded} history.`, type: "success" });
          if (state.currentRoute === "/tool/museum") renderMuseum(state.currentParams);
          if (state.currentRoute === "/vault") renderVault();
          renderStatusRail();
        } catch {
          components.showToast({ message: "Import failed: invalid JSON.", type: "warn" });
        }
      });
      return input.click();
    }

    if (action === "museum-open") {
      const id = actionNode.getAttribute("data-item-id");
      const item = state.pageData.museum.filtered.find((row) => row.id === id || row.hash === id);
      if (!item) return;
      const node = document.createElement("div");
      node.innerHTML = `
        <p class="muted">${html(item.tool)} · Seed ${html(item.seed)} · ${toLocalString(item.timestamp)}</p>
        ${item.posterSvg ? `<div class="poster-wrap">${item.posterSvg}</div>` : ""}
        <pre>${html(item.text || "")}</pre>
        <div class="btn-row"><button class="btn" data-action="modal-copy-link" data-link="${html(item.shareLink)}">Copy Link</button></div>
      `;
      const modal = components.openModal({ title: item.title || item.tool, content: node });
      modal.querySelector('[data-action="modal-copy-link"]')?.addEventListener("click", () => copyText(item.shareLink, "Share link copied."));
      return;
    }
    if (action === "museum-copy-link") {
      const id = actionNode.getAttribute("data-item-id");
      const item = state.pageData.museum.filtered.find((row) => row.id === id || row.hash === id);
      if (item) return copyText(item.shareLink, "Share link copied.");
      return;
    }
    if (action === "museum-delete") {
      const id = actionNode.getAttribute("data-item-id");
      const item = state.pageData.museum.filtered.find((row) => row.id === id || row.hash === id);
      if (item) {
        removeFavorite(item.id);
        if (item.hash !== item.id) {
          removeFavorite(item.hash);
        }
      } else {
        removeFavorite(id);
      }
      renderMuseum(state.currentParams);
      renderStatusRail();
      return;
    }

    if (action === "pack-search-apply") {
      const q = String(document.getElementById("pack-search")?.value || "").trim();
      return navigate("/packs", withBaseParams({ q }));
    }

    if (action === "vault-copy" || action === "vault-link" || action === "vault-open" || action === "vault-remove" || action === "history-copy" || action === "history-link" || action === "history-open") {
      const id = actionNode.getAttribute("data-id");
      const favorites = getFavorites();
      const history = getHistory();
      const item = [...favorites, ...history].find((row) => row.id === id || row.hash === id);
      if (!item) return;
      if (action.endsWith("copy")) return copyText(item.text || "", "Copied.");
      if (action.endsWith("link")) return copyText(item.shareLink || "", "Share link copied.");
      if (action.endsWith("open")) return (window.location.hash = item.shareHash || buildHash(`/tool/${item.tool}`, withBaseParams({ seed: item.seed })));
      if (action === "vault-remove") {
        removeFavorite(id);
        renderVault();
        renderStatusRail();
      }
      return;
    }

    if (action === "inspector-copy") return copyText(state.currentEntry?.text || "", "Copied from inspector.");
    if (action === "inspector-share") return copyText(state.currentEntry?.shareLink || "", "Share link copied.");
    if (action === "inspector-favorite") return toggleFavoriteCurrent();
    if (action === "inspector-export") {
      if (!state.currentEntry) return;
      return downloadText(`realityops-${slugify(state.currentEntry.tool)}-${state.currentEntry.seed}.json`, JSON.stringify(state.currentEntry, null, 2), "application/json");
    }

    if (action === "new-patch") {
      const next = engine.generateUniverse({ seed: engine.randomSeed(), chaosMode: state.chaosMode, enforceUnseen: true });
      return navigate("/tool/universe", withBaseParams({ seed: next.seed }));
    }
  }

  function handleMainChange(event) {
    const actionNode = event.target.closest("[data-action]");
    if (!actionNode) {
      return;
    }
    const action = actionNode.getAttribute("data-action");

    if (action === "toggle-control") {
      const result = state.pageData.probability?.result;
      if (!result) return;
      const selected = [...main.querySelectorAll('[data-control-index]')]
        .filter((node) => node.checked)
        .map((node) => parseIntSafe(node.getAttribute("data-control-index"), 0));
      navigate(
        "/tool/probability",
        withBaseParams({
          seed: result.seed,
          s: result.scenario,
          ctrl: selected.join(",")
        })
      );
    }

    if (action === "incident-check") {
      const idx = parseIntSafe(actionNode.getAttribute("data-check-index"), 0);
      const data = state.pageData.incidents;
      if (!data) return;
      setIncidentCheck(data.incidentKey, idx, actionNode.checked);
    }
  }

  function setupTopActions() {
    applyTopSettings();

    chaosInput?.addEventListener("change", () => {
      state.chaosMode = Boolean(chaosInput.checked);
      setChaosMode(state.chaosMode);
      patchSettings({ chaosMode: state.chaosMode });
      applyTopSettings();
      renderStatusRail();
      navigate(state.currentRoute, withBaseParams({ ...state.currentParams }));
    });

    densitySelect?.addEventListener("change", () => {
      state.density = densitySelect.value;
      setDensity(state.density);
      patchSettings({ density: state.density });
      applyTopSettings();
    });

    inspectorToggleBtn?.addEventListener("click", () => {
      state.inspectorOpen = !state.inspectorOpen;
      setInspectorOpen(state.inspectorOpen);
      patchSettings({ inspectorOpen: state.inspectorOpen });
      applyTopSettings();
      renderInspector();
    });

    inspectorMobileBtn?.addEventListener("click", openInspectorSheet);

    newPatchBtn?.addEventListener("click", () => {
      const next = engine.generateUniverse({ seed: engine.randomSeed(), chaosMode: state.chaosMode, enforceUnseen: true });
      navigate("/tool/universe", withBaseParams({ seed: next.seed }));
    });

    paletteBtn?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("palette:toggle"));
    });

    main.addEventListener("click", handleMainClick);
    main.addEventListener("change", handleMainChange);
  }

  async function renderRoute(route) {
    state.currentRoute = route.path;
    state.currentParams = route.params;
    state.currentEntry = null;

    state.chaosMode = resolveChaos(route.params);
    applyTopSettings();
    activeNav(route.path);

    if (route.path !== "/tool/museum") {
      state.pageData.museum.windowStart = 0;
    }

    switch (route.path) {
      case "/":
        renderDashboard();
        break;
      case "/tools":
        renderToolsIndex();
        break;
      case "/tool/universe":
        renderUniverse(route.params);
        break;
      case "/tool/memo":
        renderMemo(route.params);
        break;
      case "/tool/translator":
        renderTranslator(route.params);
        break;
      case "/tool/probability":
        renderProbability(route.params);
        break;
      case "/tool/npc":
        renderNpc(route.params);
        break;
      case "/tool/incidents":
        renderIncidents(route.params);
        break;
      case "/tool/tarot":
        renderTarot(route.params);
        break;
      case "/tool/museum":
        renderMuseum(route.params);
        break;
      case "/packs":
        renderPacks(route.params);
        break;
      case "/vault":
        renderVault();
        break;
      default:
        renderAbout();
        break;
    }

    main.focus();
  }

  function invokeAction(name) {
    const fn = state.actions[name];
    if (typeof fn === "function") {
      fn();
    }
  }

  function getContextCommands() {
    const commands = [];
    if (state.actions.generate) {
      commands.push({ id: "ctx-generate", title: "Action: Generate", subtitle: "Run current tool generation.", keywords: "generate g", run: () => invokeAction("generate") });
    }
    if (state.actions.copy) {
      commands.push({ id: "ctx-copy", title: "Action: Copy Output", subtitle: "Copy current output text.", keywords: "copy c", run: () => invokeAction("copy") });
    }
    if (state.actions.favorite) {
      commands.push({ id: "ctx-favorite", title: "Action: Toggle Favorite", subtitle: "Add/remove current output in favorites.", keywords: "favorite f", run: () => invokeAction("favorite") });
    }
    if (state.actions.share) {
      commands.push({ id: "ctx-share", title: "Action: Copy Share Link", subtitle: "Copy deterministic share URL.", keywords: "share s link", run: () => invokeAction("share") });
    }
    return commands;
  }

  setupTopActions();
  setupBackground();
  renderStatusRail();
  renderInspector();

  return {
    renderRoute,
    invokeAction,
    getContextCommands
  };
}

```

FILE: assets/js/router.js
`$ext
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

export function initRouter(onRoute, hooks = {}) {
  const { beforeEach = null, afterEach = null } = hooks;
  const run = async () => {
    const route = getCurrentRoute();
    if (typeof beforeEach === "function") {
      await beforeEach(route);
    }
    await onRoute(route);
    if (typeof afterEach === "function") {
      await afterEach(route);
    }
  };
  window.addEventListener("hashchange", run);
  run();
}

export function allRoutes() {
  return [...KNOWN_ROUTES];
}

```

FILE: assets/js/storage.js
`$ext
const KEYS = {
  history: "realityops.history.v2",
  favorites: "realityops.favorites.v2",
  seen: "realityops.seen.v1",
  settings: "realityops.settings.v2",
  widgets: "realityops.widgets.v1",
  journals: "realityops.journal.v1",
  incidentChecks: "realityops.incidentChecks.v1"
};

const DEFAULT_SETTINGS = {
  chaosMode: false,
  density: "cozy",
  inspectorOpen: true,
  compactDashboard: false,
  briefingMode: "guided"
};

const DEFAULT_WIDGET_PREFS = {
  order: [],
  hidden: []
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

export function stableHash(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return `v_${(h >>> 0).toString(36)}`;
}

function normalizeEntry(entry) {
  const hash =
    entry.hash ||
    stableHash([
      entry.tool,
      entry.type,
      entry.seed,
      entry.title,
      entry.summary,
      entry.signature,
      entry.text ? String(entry.text).slice(0, 300) : ""
    ]);

  return {
    id: entry.id || hash,
    hash,
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry
  };
}

function mergeUniqueEntries(nextList, previousList = []) {
  const seen = new Set();
  const out = [];
  [...nextList, ...previousList].forEach((item) => {
    const normalized = normalizeEntry(item);
    const key = normalized.hash || normalized.id;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    out.push(normalized);
  });
  return out;
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

export function patchSettings(partial = {}) {
  const next = {
    ...getSettings(),
    ...partial
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

export function getDensity() {
  return getSettings().density || "cozy";
}

export function setDensity(value) {
  const allowed = new Set(["compact", "cozy", "expanded"]);
  return setSetting("density", allowed.has(value) ? value : "cozy");
}

export function getInspectorOpen() {
  return Boolean(getSettings().inspectorOpen);
}

export function setInspectorOpen(open) {
  return setSetting("inspectorOpen", Boolean(open));
}

export function getWidgetPrefs() {
  return {
    ...DEFAULT_WIDGET_PREFS,
    ...readJSON(KEYS.widgets, {})
  };
}

export function setWidgetPrefs(partial = {}) {
  const current = getWidgetPrefs();
  const next = {
    ...current,
    ...partial,
    order: Array.isArray(partial.order) ? partial.order : current.order,
    hidden: Array.isArray(partial.hidden) ? partial.hidden : current.hidden
  };
  writeJSON(KEYS.widgets, next);
  return next;
}

export function toggleWidgetHidden(widgetId) {
  const prefs = getWidgetPrefs();
  const hidden = new Set(prefs.hidden || []);
  if (hidden.has(widgetId)) {
    hidden.delete(widgetId);
  } else {
    hidden.add(widgetId);
  }
  return setWidgetPrefs({ hidden: [...hidden] });
}

export function moveWidget(widgetId, direction = "up") {
  const prefs = getWidgetPrefs();
  const order = [...(prefs.order || [])];
  const idx = order.indexOf(widgetId);
  if (idx < 0) {
    order.push(widgetId);
    return setWidgetPrefs({ order });
  }
  const nextIdx = direction === "up" ? Math.max(0, idx - 1) : Math.min(order.length - 1, idx + 1);
  if (nextIdx === idx) {
    return prefs;
  }
  [order[idx], order[nextIdx]] = [order[nextIdx], order[idx]];
  return setWidgetPrefs({ order });
}

export function getHistory() {
  return readJSON(KEYS.history, []);
}

export function addHistory(entry, limit = 220) {
  const normalized = normalizeEntry(entry);
  const list = mergeUniqueEntries([normalized], getHistory()).slice(0, limit);
  writeJSON(KEYS.history, list);
  return normalized;
}

export function clearHistory() {
  writeJSON(KEYS.history, []);
}

export function getFavorites() {
  return readJSON(KEYS.favorites, []);
}

export function isFavorited(hashOrId) {
  return getFavorites().some((item) => item.id === hashOrId || item.hash === hashOrId);
}

export function addFavorite(entry, limit = 280) {
  const normalized = normalizeEntry(entry);
  const list = mergeUniqueEntries([normalized], getFavorites()).slice(0, limit);
  writeJSON(KEYS.favorites, list);
  return normalized;
}

export function removeFavorite(hashOrId) {
  const next = getFavorites().filter((item) => item.id !== hashOrId && item.hash !== hashOrId);
  writeJSON(KEYS.favorites, next);
  return next;
}

export function getFavoriteById(hashOrId) {
  return getFavorites().find((item) => item.id === hashOrId || item.hash === hashOrId) || null;
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

export function getJournalEntry(dateKey) {
  const map = readJSON(KEYS.journals, {});
  return map[dateKey] || "";
}

export function setJournalEntry(dateKey, text) {
  const map = readJSON(KEYS.journals, {});
  map[dateKey] = String(text || "");
  writeJSON(KEYS.journals, map);
  return map[dateKey];
}

export function exportJournal() {
  return readJSON(KEYS.journals, {});
}

export function getIncidentChecks(incidentKey) {
  const checks = readJSON(KEYS.incidentChecks, {});
  return checks[incidentKey] || {};
}

export function setIncidentCheck(incidentKey, index, checked) {
  const checks = readJSON(KEYS.incidentChecks, {});
  checks[incidentKey] = {
    ...(checks[incidentKey] || {}),
    [index]: Boolean(checked)
  };
  writeJSON(KEYS.incidentChecks, checks);
  return checks[incidentKey];
}

export function exportVault() {
  return {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    widgets: getWidgetPrefs(),
    journals: readJSON(KEYS.journals, {}),
    incidentChecks: readJSON(KEYS.incidentChecks, {}),
    favorites: getFavorites(),
    history: getHistory(),
    seen: getSeenStore()
  };
}

export function importVaultData(payload) {
  const incoming = payload && typeof payload === "object" ? payload : {};

  const prevFav = getFavorites();
  const prevHistory = getHistory();
  const mergedFav = mergeUniqueEntries(incoming.favorites || [], prevFav);
  const mergedHistory = mergeUniqueEntries(incoming.history || [], prevHistory);

  writeJSON(KEYS.favorites, mergedFav.slice(0, 280));
  writeJSON(KEYS.history, mergedHistory.slice(0, 220));

  if (incoming.settings && typeof incoming.settings === "object") {
    patchSettings(incoming.settings);
  }
  if (incoming.widgets && typeof incoming.widgets === "object") {
    setWidgetPrefs(incoming.widgets);
  }
  if (incoming.journals && typeof incoming.journals === "object") {
    writeJSON(KEYS.journals, incoming.journals);
  }
  if (incoming.incidentChecks && typeof incoming.incidentChecks === "object") {
    writeJSON(KEYS.incidentChecks, incoming.incidentChecks);
  }
  if (incoming.seen && typeof incoming.seen === "object") {
    writeJSON(KEYS.seen, incoming.seen);
  }

  return {
    favoritesAdded: Math.max(0, mergedFav.length - prevFav.length),
    historyAdded: Math.max(0, mergedHistory.length - prevHistory.length)
  };
}

```

FILE: assets/js/generators.js
`$ext
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

function stableHash(input) {
  const text = typeof input === "string" ? input : JSON.stringify(input);
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return `h_${(h >>> 0).toString(36)}`;
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
      const controls = pickManyUnique(data.controls, rng.int(6, 10), rng).map((line) =>
        fillTemplate(line, { scenario: chosenScenario }, rng)
      );

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

  function getProbabilityControlEffects({ seed, controls = [] } = {}) {
    const baseSeed = normalizeSeed(seed);
    return controls.map((control, idx) => {
      const rng = createRng(`${baseSeed}:control:${idx}:${control}`);
      const raw = rng.int(1, 5);
      const sign = rng.bool(0.84) ? -1 : 1;
      const delta = sign * raw;
      return {
        index: idx,
        control,
        delta
      };
    });
  }

  function simulateProbabilityControls({
    seed,
    baseScore,
    controls = [],
    selectedIndexes = []
  } = {}) {
    const beforeScore = clamp(Number(baseScore) || 1, 1, 99);
    const effects = getProbabilityControlEffects({ seed, controls });
    const picked = new Set((selectedIndexes || []).map((item) => Number(item)).filter((n) => Number.isInteger(n)));
    const applied = effects.filter((row) => picked.has(row.index));
    const totalDelta = applied.reduce((sum, row) => sum + row.delta, 0);
    const afterScore = clamp(beforeScore + totalDelta, 1, 99);

    const toBand = (score) => (score <= 33 ? "GREEN" : score <= 66 ? "YELLOW" : "RED");

    return {
      beforeScore,
      afterScore,
      beforeBand: toBand(beforeScore),
      afterBand: toBand(afterScore),
      totalDelta,
      effects,
      applied
    };
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
      const impactedSystems = pickManyUnique(data.impactedSystems, rng.int(2, 4), rng);
      const system = impactedSystems[0] || rng.pick(data.impactedSystems);
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
        impactedSystems,
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
    stableHash,
    normalizeSeed,
    nextSeed,
    randomSeed,
    dailySeed,
    toTitleCase,
    generateUniverse,
    generateMemo,
    generateTranslation,
    generateProbability,
    getProbabilityControlEffects,
    simulateProbabilityControls,
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

FILE: sw.js
`$ext
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

```

FILE: assets/js/components.js
`$ext
function toNode(content) {
  if (content instanceof Node) {
    return content;
  }
  if (Array.isArray(content)) {
    const frag = document.createDocumentFragment();
    content.forEach((item) => frag.appendChild(toNode(item)));
    return frag;
  }
  const template = document.createElement("template");
  template.innerHTML = String(content || "");
  return template.content;
}

function findFocusable(container) {
  return [...container.querySelectorAll(
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export function createComponents({
  modalRootId = "modal-root",
  drawerRootId = "drawer-root",
  toastRootId = "toast-root"
} = {}) {
  const modalRoot = document.getElementById(modalRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: modalRootId }));
  const drawerRoot = document.getElementById(drawerRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: drawerRootId }));
  const toastRoot = document.getElementById(toastRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: toastRootId }));

  modalRoot.classList.add("overlay-root");
  drawerRoot.classList.add("overlay-root");
  toastRoot.classList.add("toast-stack");

  const state = {
    modal: null,
    drawer: null,
    tooltip: null,
    cleanup: []
  };

  function trapKeydown(event, container) {
    if (event.key !== "Tab") {
      return;
    }
    const focusable = findFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    if (!state.modal) {
      return;
    }
    const { element, onClose, prevFocus } = state.modal;
    element.classList.add("overlay-leave");
    window.setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      modalRoot.innerHTML = "";
      if (typeof onClose === "function") {
        onClose();
      }
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
      state.modal = null;
    }, 180);
  }

  function closeDrawer() {
    if (!state.drawer) {
      return;
    }
    const { element, onClose, prevFocus } = state.drawer;
    element.classList.add("overlay-leave");
    window.setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      drawerRoot.innerHTML = "";
      if (typeof onClose === "function") {
        onClose();
      }
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
      state.drawer = null;
    }, 180);
  }

  function closeAllOverlays() {
    closeModal();
    closeDrawer();
  }

  function openModal({
    title = "Dialog",
    subtitle = "",
    content = "",
    className = "",
    actions = [],
    onClose = null,
    closeOnBackdrop = true
  } = {}) {
    closeModal();
    const prevFocus = document.activeElement;

    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    backdrop.innerHTML = `
      <section class="modal ${className}" role="dialog" aria-modal="true" aria-label="${String(title).replace(/\"/g, "")}">
        <header class="modal-head">
          <div>
            <h3>${title}</h3>
            ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
          </div>
          <button class="icon-btn" data-action="close-modal" aria-label="Close dialog">✕</button>
        </header>
        <div class="modal-body"></div>
        <footer class="modal-foot"></footer>
      </section>
    `;

    const body = backdrop.querySelector(".modal-body");
    const foot = backdrop.querySelector(".modal-foot");
    body.appendChild(toNode(content));

    if (actions.length) {
      const frag = document.createDocumentFragment();
      actions.forEach((action) => {
        const btn = document.createElement("button");
        btn.className = `btn ${action.primary ? "btn-primary" : "btn-ghost"}`;
        btn.textContent = action.label;
        btn.addEventListener("click", () => action.onClick?.());
        frag.appendChild(btn);
      });
      foot.appendChild(frag);
    }

    backdrop.addEventListener("click", (event) => {
      if (!closeOnBackdrop) {
        return;
      }
      if (event.target === backdrop) {
        closeModal();
      }
    });

    backdrop.querySelector('[data-action="close-modal"]')?.addEventListener("click", closeModal);

    const keydown = (event) => {
      if (!state.modal || state.modal.element !== backdrop) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
      trapKeydown(event, backdrop.querySelector(".modal"));
    };

    document.addEventListener("keydown", keydown);
    modalRoot.replaceChildren(backdrop);

    state.modal = {
      element: backdrop,
      onClose,
      prevFocus,
      keydown
    };

    const first = findFocusable(backdrop.querySelector(".modal"))[0];
    (first || backdrop.querySelector(".modal")).focus?.();

    const cleanup = () => document.removeEventListener("keydown", keydown);
    state.cleanup.push(cleanup);
    return backdrop;
  }

  function openDrawer({
    title = "Panel",
    subtitle = "",
    content = "",
    className = "",
    side = "right",
    onClose = null,
    closeOnBackdrop = true
  } = {}) {
    closeDrawer();
    const prevFocus = document.activeElement;

    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    backdrop.innerHTML = `
      <aside class="drawer drawer-${side} ${className}" role="dialog" aria-modal="true" aria-label="${String(title).replace(/\"/g, "")}">
        <header class="drawer-head">
          <div>
            <h3>${title}</h3>
            ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
          </div>
          <button class="icon-btn" data-action="close-drawer" aria-label="Close panel">✕</button>
        </header>
        <div class="drawer-body"></div>
      </aside>
    `;

    const body = backdrop.querySelector(".drawer-body");
    body.appendChild(toNode(content));

    backdrop.addEventListener("click", (event) => {
      if (!closeOnBackdrop) {
        return;
      }
      if (event.target === backdrop) {
        closeDrawer();
      }
    });
    backdrop.querySelector('[data-action="close-drawer"]')?.addEventListener("click", closeDrawer);

    const keydown = (event) => {
      if (!state.drawer || state.drawer.element !== backdrop) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
      trapKeydown(event, backdrop.querySelector(".drawer"));
    };
    document.addEventListener("keydown", keydown);

    drawerRoot.replaceChildren(backdrop);
    state.drawer = { element: backdrop, onClose, prevFocus, keydown };

    const first = findFocusable(backdrop.querySelector(".drawer"))[0];
    (first || backdrop.querySelector(".drawer")).focus?.();

    const cleanup = () => document.removeEventListener("keydown", keydown);
    state.cleanup.push(cleanup);
    return backdrop;
  }

  function showToast({ message, type = "info", duration = 2500 } = {}) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-body">
        <span>${message}</span>
        <button class="icon-btn" aria-label="Dismiss notification">✕</button>
      </div>
    `;

    const remove = () => {
      toast.classList.add("toast-leave");
      window.setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector("button")?.addEventListener("click", remove);
    toastRoot.prepend(toast);

    const toasts = [...toastRoot.children];
    if (toasts.length > 3) {
      toasts.slice(3).forEach((node) => node.remove());
    }

    if (duration > 0) {
      window.setTimeout(remove, duration);
    }
  }

  function mountTooltip() {
    if (state.tooltip) {
      return;
    }
    const tip = document.createElement("div");
    tip.className = "tooltip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    document.body.appendChild(tip);
    state.tooltip = tip;

    const show = (event) => {
      const trigger = event.target.closest("[data-tooltip]");
      if (!trigger || !state.tooltip) {
        return;
      }
      state.tooltip.textContent = trigger.getAttribute("data-tooltip") || "";
      const rect = trigger.getBoundingClientRect();
      state.tooltip.style.left = `${Math.max(8, rect.left + rect.width / 2)}px`;
      state.tooltip.style.top = `${Math.max(8, rect.top - 8)}px`;
      state.tooltip.hidden = false;
    };

    const hide = () => {
      if (state.tooltip) {
        state.tooltip.hidden = true;
      }
    };

    document.addEventListener("mouseover", show);
    document.addEventListener("focusin", show);
    document.addEventListener("mouseout", hide);
    document.addEventListener("focusout", hide);

    state.cleanup.push(() => {
      document.removeEventListener("mouseover", show);
      document.removeEventListener("focusin", show);
      document.removeEventListener("mouseout", hide);
      document.removeEventListener("focusout", hide);
    });
  }

  function renderSkeleton(kind = "card", count = 3) {
    const className = `skeleton skeleton-${kind}`;
    return Array.from({ length: count })
      .map(
        () => `
        <article class="${className}">
          <span class="s-line w-40"></span>
          <span class="s-line w-90"></span>
          <span class="s-line w-70"></span>
        </article>
      `
      )
      .join("");
  }

  function destroy() {
    state.cleanup.forEach((fn) => fn());
    state.cleanup = [];
    closeAllOverlays();
    toastRoot.innerHTML = "";
    if (state.tooltip) {
      state.tooltip.remove();
      state.tooltip = null;
    }
  }

  mountTooltip();

  return {
    modalRoot,
    drawerRoot,
    toastRoot,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
    closeAllOverlays,
    showToast,
    renderSkeleton,
    destroy
  };
}

```

FILE: assets/js/palette.js
`$ext
import { buildHash, navigate } from "./router.js";
import { exportVault, getFavorites, getHistory, importVaultData } from "./storage.js";

function html(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scoreMatch(text, query) {
  if (!query) {
    return 1;
  }
  const t = String(text).toLowerCase();
  const q = String(query).toLowerCase();
  if (t.includes(q)) {
    return 100 - t.indexOf(q);
  }
  let score = 0;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i += 1) {
    if (t[i] === q[qi]) {
      score += 2;
      qi += 1;
    }
  }
  return qi === q.length ? score : -1;
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function pickFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const text = await file.text();
      try {
        resolve(JSON.parse(text));
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}

export function createPalette({ components, getContextCommands = () => [] } = {}) {
  const state = {
    open: false,
    query: "",
    active: 0,
    commands: [],
    lastRendered: []
  };

  function getNavigationCommands() {
    return [
      { id: "nav-dash", title: "Go: Dashboard", subtitle: "Open daily control room.", keywords: "dashboard home", run: () => navigate("/") },
      { id: "nav-tools", title: "Go: Tools", subtitle: "Open all generators.", keywords: "tools index", run: () => navigate("/tools") },
      { id: "nav-packs", title: "Go: Packs", subtitle: "Open content pack manager.", keywords: "packs lint", run: () => navigate("/packs") },
      { id: "nav-vault", title: "Go: Vault", subtitle: "Open history and favorites.", keywords: "vault history favorites", run: () => navigate("/vault") },
      { id: "nav-museum", title: "Go: Museum", subtitle: "Open gallery view.", keywords: "gallery museum", run: () => navigate("/tool/museum") },
      { id: "nav-about", title: "Go: About", subtitle: "Read architecture/spec.", keywords: "about spec", run: () => navigate("/about") },
      { id: "tool-universe", title: "Tool: Universe Forge", subtitle: "Generate reality patch.", keywords: "universe theme poster", run: () => navigate("/tool/universe") },
      { id: "tool-memo", title: "Tool: Exec Memo Generator", subtitle: "Generate memo output.", keywords: "memo executive", run: () => navigate("/tool/memo") },
      { id: "tool-translator", title: "Tool: Meeting Translator", subtitle: "Decode meeting language.", keywords: "translate meeting", run: () => navigate("/tool/translator") },
      { id: "tool-prob", title: "Tool: Probability Engine", subtitle: "Risk and controls simulator.", keywords: "probability risk", run: () => navigate("/tool/probability") },
      { id: "tool-npc", title: "Tool: NPC Hotline", subtitle: "Summon operational NPC.", keywords: "npc quest", run: () => navigate("/tool/npc") },
      { id: "tool-inc", title: "Tool: Incident Theater", subtitle: "Generate incident narrative.", keywords: "incident timeline", run: () => navigate("/tool/incidents") },
      { id: "tool-tarot", title: "Tool: Tarot of Productivity", subtitle: "Draw deterministic cards.", keywords: "tarot cards", run: () => navigate("/tool/tarot") }
    ];
  }

  function getVaultCommands() {
    const favorites = getFavorites().slice(0, 20).map((item) => ({
      id: `fav-${item.id}`,
      title: `Favorite: ${item.title || item.tool}`,
      subtitle: `${item.tool} · seed ${item.seed}`,
      keywords: `${item.title || ""} ${item.summary || ""} ${item.tool}`,
      run: () => {
        window.location.hash = item.shareHash || buildHash(`/tool/${item.tool}`, { seed: item.seed });
      }
    }));

    const history = getHistory().slice(0, 15).map((item) => ({
      id: `hist-${item.id}`,
      title: `History: ${item.title || item.tool}`,
      subtitle: `${item.tool} · seed ${item.seed}`,
      keywords: `${item.title || ""} ${item.summary || ""} ${item.tool}`,
      run: () => {
        window.location.hash = item.shareHash || buildHash(`/tool/${item.tool}`, { seed: item.seed });
      }
    }));

    return [
      {
        id: "vault-export",
        title: "Vault: Export JSON",
        subtitle: "Download realityops-vault.json",
        keywords: "export vault backup",
        run: () => {
          downloadJson("realityops-vault.json", exportVault());
          components.showToast({ message: "Vault exported.", type: "success" });
        }
      },
      {
        id: "vault-import",
        title: "Vault: Import JSON",
        subtitle: "Merge favorites/history from file.",
        keywords: "import vault merge",
        run: async () => {
          const payload = await pickFile();
          if (!payload) {
            components.showToast({ message: "Invalid import file.", type: "warn" });
            return;
          }
          const result = importVaultData(payload);
          components.showToast({ message: `Imported: +${result.favoritesAdded} favorites, +${result.historyAdded} history.`, type: "success" });
        }
      },
      ...favorites,
      ...history
    ];
  }

  function allCommands() {
    return [
      ...getNavigationCommands(),
      ...getContextCommands(),
      ...getVaultCommands()
    ];
  }

  function filteredCommands() {
    const query = state.query.trim();
    const rows = state.commands
      .map((command) => {
        const score = scoreMatch(`${command.title} ${command.subtitle || ""} ${command.keywords || ""}`, query);
        return {
          command,
          score
        };
      })
      .filter((row) => row.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((row) => row.command);

    return rows;
  }

  function renderList(container) {
    const list = filteredCommands();
    state.lastRendered = list;
    state.active = Math.min(state.active, Math.max(0, list.length - 1));

    container.innerHTML = list.length
      ? list
          .map(
            (cmd, idx) => `
            <li class="palette-item ${idx === state.active ? "active" : ""}" data-index="${idx}">
              <strong>${html(cmd.title)}</strong>
              ${cmd.subtitle ? `<small>${html(cmd.subtitle)}</small>` : ""}
            </li>
          `
          )
          .join("")
      : `<li class="palette-empty">No commands match “${html(state.query)}”.</li>`;
  }

  function close() {
    if (!state.open) {
      return;
    }
    state.open = false;
    components.closeAllOverlays();
  }

  function open() {
    state.commands = allCommands();
    state.query = "";
    state.active = 0;
    state.open = true;

    const content = document.createElement("div");
    content.className = "palette";
    content.innerHTML = `
      <label class="visually-hidden" for="palette-input">Command search</label>
      <input id="palette-input" class="palette-input" type="text" placeholder="Type a command, tool, or vault item..." aria-label="Command palette search" />
      <ul class="palette-list" id="palette-list" role="listbox"></ul>
      <p class="palette-hint">Enter: run · ↑/↓: move · Esc: close · Cmd/Ctrl+K: toggle</p>
    `;

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    if (isMobile) {
      components.openDrawer({ title: "Command Palette", side: "bottom", content, className: "palette-drawer", onClose: () => (state.open = false) });
    } else {
      components.openModal({ title: "Command Palette", subtitle: "Navigate, run actions, and search vault.", content, className: "palette-modal", onClose: () => (state.open = false) });
    }

    const input = document.getElementById("palette-input");
    const list = document.getElementById("palette-list");
    renderList(list);

    input?.focus();
    input?.addEventListener("input", () => {
      state.query = input.value;
      state.active = 0;
      renderList(list);
    });

    const runActive = () => {
      const cmd = state.lastRendered[state.active];
      if (!cmd) {
        return;
      }
      const result = cmd.run?.();
      close();
      return result;
    };

    content.addEventListener("click", (event) => {
      const item = event.target.closest(".palette-item");
      if (!item) {
        return;
      }
      state.active = Number(item.getAttribute("data-index") || 0);
      runActive();
    });

    const onKey = (event) => {
      if (!state.open) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        state.active = Math.min(state.lastRendered.length - 1, state.active + 1);
        renderList(list);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        state.active = Math.max(0, state.active - 1);
        renderList(list);
      } else if (event.key === "Enter") {
        event.preventDefault();
        runActive();
      } else if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", onKey, { once: false });

    const unbind = () => document.removeEventListener("keydown", onKey);
    const observer = new MutationObserver(() => {
      if (!state.open) {
        unbind();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function toggle() {
    if (state.open) {
      close();
    } else {
      open();
    }
  }

  return {
    open,
    close,
    toggle,
    isOpen: () => state.open
  };
}

```

FILE: assets/js/briefing.js
`$ext
import { buildHash, navigate } from "./router.js";

function html(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createBriefing({ engine, components }) {
  let state = null;

  function formatBundle(bundle) {
    const t = bundle.tarot.cards[0];
    return [
      `RealityOps Daily Briefing (${bundle.date})`,
      `Seed: ${bundle.seed}`,
      "",
      `[Universe] ${bundle.universe.headline}`,
      `Tone: ${bundle.universe.tone} // ${bundle.universe.tagline}`,
      `Rule: ${bundle.universe.rule}`,
      `Law: ${bundle.universe.law}`,
      "",
      `[Incident] ${bundle.incident.id} ${bundle.incident.title}`,
      `Severity: ${bundle.incident.severity} | Duration: ${bundle.incident.duration}`,
      `Impact: ${bundle.incident.impact}`,
      `Root Cause: ${bundle.incident.rootCause}`,
      "",
      `[Tarot] ${t.name} (${t.orientation})`,
      `${t.meaning}`,
      "",
      `[Probability] ${bundle.probability.score} (${bundle.probability.band})`,
      `${bundle.probability.scenario}`,
      `${bundle.probability.explanation}`,
      "",
      `[Memo] ${bundle.memo.subject}`,
      `${bundle.memo.rationales[0]}`,
      "",
      `[NPC] ${bundle.npc.npc.name} (${bundle.npc.npc.role})`,
      `${bundle.npc.mission}`,
      `${bundle.npc.hint}`
    ].join("\n");
  }

  function stepMarkup(step, idx, total) {
    return `
      <article class="briefing-step">
        <header class="briefing-head">
          <span class="chip">Step ${idx + 1} / ${total}</span>
          <h3>${html(step.title)}</h3>
          <p class="muted">${html(step.subtitle || "")}</p>
        </header>
        <div class="briefing-content">${step.content}</div>
      </article>
    `;
  }

  function getSteps(bundle, chaos) {
    const tarotCard = bundle.tarot.cards[0];
    return [
      {
        key: "universe",
        title: "Universe Calibration",
        subtitle: `${bundle.universe.tone} // ${bundle.universe.tagline}`,
        route: "/tool/universe",
        params: { seed: bundle.universe.seed, chaos: chaos ? 1 : 0 },
        content: `
          <p><strong>${html(bundle.universe.headline)}</strong></p>
          <p>${html(bundle.universe.rule)}</p>
          <p class="muted">${html(bundle.universe.law)}</p>
        `
      },
      {
        key: "incident",
        title: "Incident Snapshot",
        subtitle: `${bundle.incident.id} · ${bundle.incident.severity}`,
        route: "/tool/incidents",
        params: { seed: bundle.incident.seed, chaos: chaos ? 1 : 0 },
        content: `
          <p><strong>${html(bundle.incident.title)}</strong></p>
          <p>${html(bundle.incident.impact)}</p>
          <p class="muted">Root cause: ${html(bundle.incident.rootCause)}</p>
        `
      },
      {
        key: "tarot",
        title: "Tarot Signal",
        subtitle: `${tarotCard.name} (${tarotCard.orientation})`,
        route: "/tool/tarot",
        params: { seed: bundle.tarot.seed, mode: "single", rev: 1, chaos: chaos ? 1 : 0 },
        content: `
          <p>${html(tarotCard.meaning)}</p>
          <p><strong>Action:</strong> ${html(tarotCard.action_prompt)}</p>
          <p class="muted">Warning: ${html(tarotCard.warning)}</p>
        `
      },
      {
        key: "probability",
        title: "Risk Position",
        subtitle: `${bundle.probability.score} (${bundle.probability.band})`,
        route: "/tool/probability",
        params: { seed: bundle.probability.seed, s: bundle.probability.scenario, chaos: chaos ? 1 : 0 },
        content: `
          <p><strong>${html(bundle.probability.scenario)}</strong></p>
          <p>${html(bundle.probability.explanation)}</p>
        `
      },
      {
        key: "memo",
        title: "Executive Narrative",
        subtitle: bundle.memo.subject,
        route: "/tool/memo",
        params: { seed: bundle.memo.seed, q: bundle.memo.topic, chaos: chaos ? 1 : 0 },
        content: `
          <p><strong>${html(bundle.memo.subject)}</strong></p>
          <ul>${bundle.memo.rationales.slice(0, 3).map((line) => `<li>${html(line)}</li>`).join("")}</ul>
        `
      },
      {
        key: "npc",
        title: "NPC Assignment",
        subtitle: `${bundle.npc.npc.name} · ${bundle.npc.npc.role}`,
        route: "/tool/npc",
        params: { seed: bundle.npc.seed, q: bundle.npc.request, chaos: chaos ? 1 : 0 },
        content: `
          <p>${html(bundle.npc.opener)}</p>
          <p><strong>Mission:</strong> ${html(bundle.npc.mission)}</p>
          <p class="muted">Hint: ${html(bundle.npc.hint)}</p>
        `
      }
    ];
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      components.showToast({ message: "Briefing copied.", type: "success" });
    } catch {
      components.showToast({ message: "Clipboard unavailable.", type: "warn" });
    }
  }

  function render() {
    if (!state) {
      return;
    }
    const step = state.steps[state.index];
    const content = document.createElement("div");
    content.innerHTML = `
      ${stepMarkup(step, state.index, state.steps.length)}
      <div class="btn-row briefing-actions">
        <button class="btn" data-action="briefing-back" ${state.index === 0 ? "disabled" : ""}>Back</button>
        <button class="btn btn-primary" data-action="briefing-next">${state.index === state.steps.length - 1 ? "Finish" : "Next"}</button>
        <button class="btn" data-action="briefing-open">Open Tool</button>
        <button class="btn" data-action="briefing-copy-step">Copy Step</button>
      </div>
    `;

    const modal = components.openModal({
      title: `Daily Briefing · ${state.bundle.date}`,
      subtitle: "Guided run through today’s deterministic outputs.",
      content,
      className: "briefing-modal",
      closeOnBackdrop: false,
      onClose: () => {
        state = null;
      }
    });

    modal.querySelector('[data-action="briefing-back"]')?.addEventListener("click", () => {
      state.index = Math.max(0, state.index - 1);
      render();
    });

    modal.querySelector('[data-action="briefing-next"]')?.addEventListener("click", () => {
      if (state.index === state.steps.length - 1) {
        const summary = formatBundle(state.bundle);
        const done = document.createElement("div");
        done.innerHTML = `
          <article class="briefing-summary">
            <h4>Briefing Complete</h4>
            <p>Copy the full briefing or jump to a specific module.</p>
            <pre>${html(summary)}</pre>
            <div class="btn-row">
              <button class="btn btn-primary" data-action="briefing-copy-all">Copy All</button>
              <button class="btn" data-action="briefing-open-dashboard">Back to Dashboard</button>
            </div>
          </article>
        `;

        const finalModal = components.openModal({
          title: "Daily Briefing Completed",
          subtitle: `Seed ${state.bundle.seed}`,
          content: done,
          className: "briefing-modal"
        });

        finalModal.querySelector('[data-action="briefing-copy-all"]')?.addEventListener("click", () => copyText(summary));
        finalModal.querySelector('[data-action="briefing-open-dashboard"]')?.addEventListener("click", () => {
          components.closeModal();
          navigate("/");
        });
        return;
      }
      state.index += 1;
      render();
    });

    modal.querySelector('[data-action="briefing-open"]')?.addEventListener("click", () => {
      navigate(step.route, step.params);
      components.closeModal();
    });

    modal.querySelector('[data-action="briefing-copy-step"]')?.addEventListener("click", () => {
      const stepText = `${step.title}\n${step.subtitle}\n${step.content.replace(/<[^>]+>/g, " ")}`;
      copyText(stepText);
    });
  }

  function start({ chaosMode = false } = {}) {
    const bundle = engine.generateDailyBundle({ chaosMode });
    state = {
      bundle,
      steps: getSteps(bundle, chaosMode),
      index: 0
    };
    render();
  }

  return {
    start,
    isActive: () => Boolean(state)
  };
}

```

FILE: assets/js/visuals.js
`$ext
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function riskBand(score) {
  const value = Number(score) || 0;
  if (value <= 33) {
    return "GREEN";
  }
  if (value <= 66) {
    return "YELLOW";
  }
  return "RED";
}

function scoreToAngle(score) {
  const clamped = clamp(score, 1, 99);
  return -120 + (clamped / 99) * 240;
}

function polar(cx, cy, r, angleDeg) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  };
}

function arcPath(cx, cy, r, start, end) {
  const p1 = polar(cx, cy, r, start);
  const p2 = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

export function createGaugeSvg({ score = 50, beforeScore = null, label = "Risk", size = 280 } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.33;
  const angle = scoreToAngle(score);
  const beforeAngle = beforeScore !== null ? scoreToAngle(beforeScore) : angle;
  const band = riskBand(score);

  return `
    <svg class="risk-gauge" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label} score ${score}">
      <path d="${arcPath(cx, cy, r, -120, -35)}" class="g-band g-band-green" />
      <path d="${arcPath(cx, cy, r, -35, 45)}" class="g-band g-band-yellow" />
      <path d="${arcPath(cx, cy, r, 45, 120)}" class="g-band g-band-red" />
      <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" class="g-core" />
      <line x1="${cx}" y1="${cy}" x2="${polar(cx, cy, r * 0.75, beforeAngle).x}" y2="${polar(cx, cy, r * 0.75, beforeAngle).y}" class="g-needle" data-needle data-angle="${angle}" />
      <circle cx="${cx}" cy="${cy}" r="8" class="g-hub" />
      <text x="${cx}" y="${cy - 10}" text-anchor="middle" class="g-score">${score}</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="g-label">${label}</text>
      <text x="${cx}" y="${cy + 38}" text-anchor="middle" class="g-band-label">${band}</text>
    </svg>
  `;
}

export function animateGauge(container) {
  if (!container) {
    return;
  }
  const needle = container.querySelector("[data-needle]");
  if (!needle) {
    return;
  }
  const target = Number(needle.getAttribute("data-angle") || 0);
  needle.style.transformOrigin = "center center";
  needle.style.transition = "transform 520ms cubic-bezier(.2,.8,.2,1)";
  window.requestAnimationFrame(() => {
    needle.style.transform = `rotate(${target}deg)`;
  });
}

export function renderTimeline(events = []) {
  return `
    <ol class="timeline-viz" aria-label="Incident timeline">
      ${events
        .map(
          (event, idx) => `
          <li class="timeline-item" data-idx="${idx}">
            <details ${idx === 0 ? "open" : ""}>
              <summary>
                <span class="timeline-time">${event.time}</span>
                <span class="timeline-text">${event.event}</span>
                <button class="btn btn-ghost btn-sm" type="button" data-action="copy-event" data-event="${idx}" aria-label="Copy timeline event">Copy</button>
              </summary>
              <div class="timeline-detail">
                <p>${event.event}</p>
              </div>
            </details>
          </li>
        `
        )
        .join("")}
    </ol>
  `;
}

export function renderScorecard(scorecard = []) {
  return `
    <div class="scorecard-grid">
      ${scorecard
        .map((row) => {
          const pct = clamp((Number(row.score) / 5) * 100, 0, 100);
          return `
            <article class="scorecard-item">
              <header>
                <strong>${row.label}</strong>
                <span>${row.score}/5</span>
              </header>
              <div class="meter"><span style="width:${pct}%"></span></div>
              <p class="muted">${row.note || ""}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

export function formatDateInput(isoLike) {
  if (!isoLike) {
    return "";
  }
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString().slice(0, 10);
}

export function inDateRange(valueIso, fromIso, toIso) {
  if (!valueIso) {
    return true;
  }
  const ts = new Date(valueIso).getTime();
  if (Number.isNaN(ts)) {
    return true;
  }
  const from = fromIso ? new Date(fromIso).getTime() : Number.NEGATIVE_INFINITY;
  const to = toIso ? new Date(toIso).getTime() : Number.POSITIVE_INFINITY;
  if (!Number.isFinite(from) && !Number.isFinite(to)) {
    return true;
  }
  return ts >= from && ts <= to + 86399999;
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

```

FILE: assets/js/lint.js
`$ext
const REQUIRED_META = ["name", "version", "lastUpdated", "description"];

const MIN_THRESHOLDS = {
  universes: {
    "themes": 10,
    "tones": 8,
    "rules": 60,
    "laws": 40,
    "headlines": 30,
    "patchNotes": 25,
    "absurdNouns": 25,
    "authorities": 25,
    "events": 25,
    "places": 25,
    "verbs": 25,
    "subsystems": 25,
    "symptoms": 25,
    "fixes": 25
  },
  exec_memos: {
    "subjects": 20,
    "openers": 20,
    "initiatives": 30,
    "metrics": 25,
    "stakeholders": 25,
    "rationales": 50,
    "risks": 30,
    "mitigations": 35,
    "nextSteps": 35,
    "signatures": 15,
    "topics": 50
  },
  meeting_translator: {
    "map": 30,
    "generic": 20,
    "vibes": 20,
    "actions": 20,
    "timelines": 20,
    "summaryTemplates": 15,
    "sampleLines": 30
  },
  probability_engine: {
    "scenarios": 60,
    "baseRates": 12,
    "modifiers": 30,
    "moods": 20,
    "explanations": 20,
    "controls": 35
  },
  npc_dialogue: {
    "npcs": 15,
    "missions": 20,
    "constraints": 40,
    "rewards": 40,
    "hints": 40,
    "requests": 60,
    "places": 60,
    "objects": 60
  },
  incidents: {
    "titleTemplates": 40,
    "impactedSystems": 40,
    "symptoms": 40,
    "rootCauses": 40,
    "weLearned": 60,
    "actionItems": 80,
    "timelineEvents": 60,
    "commsTemplates": 25,
    "owners": 12
  },
  tarot: {
    "cards": 40
  }
};

const TOKEN_ALLOWLIST = {
  universes: ["absurdNoun", "authority", "event", "place", "verb", "subsystem", "symptom", "fix"],
  exec_memos: ["topic", "initiative", "metric", "stakeholder"],
  meeting_translator: ["vibe", "action", "timeline"],
  probability_engine: ["scenario", "band", "mood", "factor", "modifier"],
  npc_dialogue: ["request", "place", "object", "role", "npc"],
  incidents: ["system", "symptom", "owner", "noun", "verb", "place", "comms", "committee", "severity", "title", "outcome"]
};

function flattenArrays(value, path = "", out = []) {
  if (Array.isArray(value)) {
    out.push({ path, items: value });
    value.forEach((item, idx) => flattenArrays(item, `${path}[${idx}]`, out));
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (key === "meta") {
        return;
      }
      flattenArrays(child, path ? `${path}.${key}` : key, out);
    });
  }
  return out;
}

function walkStrings(value, path = "", out = []) {
  if (typeof value === "string") {
    out.push({ path, value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => walkStrings(item, `${path}[${idx}]`, out));
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (key === "meta") {
        return;
      }
      walkStrings(child, path ? `${path}.${key}` : key, out);
    });
  }
  return out;
}

function collectTemplateTokens(str) {
  const found = [];
  String(str).replace(/\{([^}]+)\}/g, (_, token) => {
    found.push(token.trim());
    return "";
  });
  return found;
}

function duplicateRatio(strings) {
  if (!strings.length) {
    return 0;
  }
  const normalized = strings.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const unique = new Set(normalized);
  return 1 - unique.size / Math.max(1, normalized.length);
}

export function runPackLint(manifest, packs) {
  const issues = [];
  const packStats = [];

  manifest.packs.forEach((entry) => {
    const key = entry.key || entry.file.replace(/\.json$/, "");
    const pack = packs[key];
    if (!pack) {
      issues.push({ severity: "error", pack: key, code: "PACK_MISSING", message: `Pack '${key}' missing from loaded data.` });
      return;
    }

    const meta = pack.meta || {};
    REQUIRED_META.forEach((field) => {
      if (!meta[field]) {
        issues.push({ severity: "warn", pack: key, code: "META_MISSING", message: `Missing meta.${field}` });
      }
    });

    const arrays = flattenArrays(pack);
    const topLevelThresholds = MIN_THRESHOLDS[key] || {};
    Object.entries(topLevelThresholds).forEach(([field, min]) => {
      const arr = pack[field];
      if (!Array.isArray(arr)) {
        issues.push({ severity: "error", pack: key, code: "FIELD_NOT_ARRAY", message: `${field} should be an array.` });
      } else if (arr.length < min) {
        issues.push({ severity: "error", pack: key, code: "ARRAY_TOO_SMALL", message: `${field} has ${arr.length}, expected >= ${min}.` });
      }
    });

    if (key === "meeting_translator" && Array.isArray(pack.map)) {
      pack.map.forEach((entryMap, idx) => {
        if (!Array.isArray(entryMap.means) || entryMap.means.length < 6) {
          issues.push({ severity: "error", pack: key, code: "MAP_MEANS_SHORT", message: `map[${idx}].means expected >= 6.` });
        }
      });
    }

    if (key === "npc_dialogue" && Array.isArray(pack.npcs)) {
      pack.npcs.forEach((npc, idx) => {
        if (!Array.isArray(npc.openers) || npc.openers.length < 10) {
          issues.push({ severity: "error", pack: key, code: "NPC_OPENERS_SHORT", message: `npcs[${idx}].openers expected >= 10.` });
        }
      });
    }

    const strings = walkStrings(pack).map((row) => row.value);
    const dup = duplicateRatio(strings);
    if (dup > 0.35) {
      issues.push({
        severity: "warn",
        pack: key,
        code: "DUPLICATE_HEAVY",
        message: `String duplication ratio is ${(dup * 100).toFixed(1)}% (threshold 35%).`
      });
    }

    const templateStrings = walkStrings(pack).filter((row) => /\{[^}]+\}/.test(row.value));
    const allowedTokens = new Set(TOKEN_ALLOWLIST[key] || []);
    templateStrings.forEach((row) => {
      collectTemplateTokens(row.value).forEach((token) => {
        if (allowedTokens.size && !allowedTokens.has(token)) {
          issues.push({
            severity: "warn",
            pack: key,
            code: "TOKEN_UNKNOWN",
            message: `Unknown token '{${token}}' at ${row.path}.`
          });
        }
      });
    });

    const totalItems = arrays.reduce((sum, row) => sum + row.items.length, 0);
    packStats.push({ key, file: entry.file, totalItems, arrays: arrays.length });
  });

  const sorted = [...packStats].sort((a, b) => b.totalItems - a.totalItems);
  const missingMeta = issues.filter((i) => i.code === "META_MISSING").length;
  const stats = {
    totalPacks: packStats.length,
    totalItems: packStats.reduce((sum, row) => sum + row.totalItems, 0),
    biggestPack: sorted[0] || null,
    smallestPack: sorted[sorted.length - 1] || null,
    missingMeta,
    issueCount: issues.length
  };

  return { stats, issues, packStats };
}

export function searchAcrossPacks(packs, query, limit = 80) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    return [];
  }

  const rows = [];
  Object.entries(packs).forEach(([packKey, pack]) => {
    walkStrings(pack).forEach((entry) => {
      const low = entry.value.toLowerCase();
      if (low.includes(q)) {
        rows.push({
          packKey,
          path: entry.path,
          value: entry.value
        });
      }
    });
  });

  rows.sort((a, b) => a.value.length - b.value.length);
  return rows.slice(0, limit);
}

```

