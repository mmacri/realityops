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
