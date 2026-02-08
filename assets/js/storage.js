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
