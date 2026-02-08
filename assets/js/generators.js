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
