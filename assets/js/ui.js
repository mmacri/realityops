
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
