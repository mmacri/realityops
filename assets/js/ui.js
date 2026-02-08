
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
