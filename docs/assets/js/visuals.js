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
