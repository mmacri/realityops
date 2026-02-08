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
