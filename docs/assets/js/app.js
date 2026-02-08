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
