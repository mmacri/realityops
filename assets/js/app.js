import { createGeneratorEngine } from "./generators.js";
import { initRouter } from "./router.js";
import { createUI } from "./ui.js";
import { registerServiceWorker } from "./sw-register.js";

async function boot() {
  try {
    const engine = await createGeneratorEngine();
    const ui = createUI(engine);
    initRouter((route) => ui.renderRoute(route));
    registerServiceWorker();
  } catch (error) {
    const main = document.getElementById("app-main");
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
