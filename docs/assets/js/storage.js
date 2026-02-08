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
