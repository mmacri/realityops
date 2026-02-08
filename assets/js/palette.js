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
