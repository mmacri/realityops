const KNOWN_ROUTES = new Set([
  "/",
  "/tools",
  "/tool/universe",
  "/tool/memo",
  "/tool/translator",
  "/tool/probability",
  "/tool/npc",
  "/tool/incidents",
  "/tool/tarot",
  "/tool/museum",
  "/packs",
  "/vault",
  "/about"
]);

function normalizePath(pathname) {
  let path = pathname || "/";
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  path = path.replace(/\/+$/, "");
  return path || "/";
}

function parseHash(hashText) {
  const hash = (hashText || "#/").replace(/^#/, "");
  const [rawPath, rawQuery = ""] = hash.split("?");
  const path = normalizePath(rawPath || "/");
  const params = Object.fromEntries(new URLSearchParams(rawQuery));
  return {
    path: KNOWN_ROUTES.has(path) ? path : "/about",
    rawPath: path,
    params
  };
}

export function getCurrentRoute() {
  return parseHash(window.location.hash);
}

export function buildHash(path, params = {}) {
  const route = normalizePath(path);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, String(v));
    }
  });
  const suffix = query.toString();
  return `#${route}${suffix ? `?${suffix}` : ""}`;
}

export function navigate(path, params = {}) {
  window.location.hash = buildHash(path, params);
}

export function initRouter(onRoute, hooks = {}) {
  const { beforeEach = null, afterEach = null } = hooks;
  const run = async () => {
    const route = getCurrentRoute();
    if (typeof beforeEach === "function") {
      await beforeEach(route);
    }
    await onRoute(route);
    if (typeof afterEach === "function") {
      await afterEach(route);
    }
  };
  window.addEventListener("hashchange", run);
  run();
}

export function allRoutes() {
  return [...KNOWN_ROUTES];
}
