function toNode(content) {
  if (content instanceof Node) {
    return content;
  }
  if (Array.isArray(content)) {
    const frag = document.createDocumentFragment();
    content.forEach((item) => frag.appendChild(toNode(item)));
    return frag;
  }
  const template = document.createElement("template");
  template.innerHTML = String(content || "");
  return template.content;
}

function findFocusable(container) {
  return [...container.querySelectorAll(
    'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
}

export function createComponents({
  modalRootId = "modal-root",
  drawerRootId = "drawer-root",
  toastRootId = "toast-root"
} = {}) {
  const modalRoot = document.getElementById(modalRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: modalRootId }));
  const drawerRoot = document.getElementById(drawerRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: drawerRootId }));
  const toastRoot = document.getElementById(toastRootId) || document.body.appendChild(Object.assign(document.createElement("div"), { id: toastRootId }));

  modalRoot.classList.add("overlay-root");
  drawerRoot.classList.add("overlay-root");
  toastRoot.classList.add("toast-stack");

  const state = {
    modal: null,
    drawer: null,
    tooltip: null,
    cleanup: []
  };

  function trapKeydown(event, container) {
    if (event.key !== "Tab") {
      return;
    }
    const focusable = findFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    if (!state.modal) {
      return;
    }
    const { element, onClose, prevFocus } = state.modal;
    element.classList.add("overlay-leave");
    window.setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      modalRoot.innerHTML = "";
      if (typeof onClose === "function") {
        onClose();
      }
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
      state.modal = null;
    }, 180);
  }

  function closeDrawer() {
    if (!state.drawer) {
      return;
    }
    const { element, onClose, prevFocus } = state.drawer;
    element.classList.add("overlay-leave");
    window.setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      drawerRoot.innerHTML = "";
      if (typeof onClose === "function") {
        onClose();
      }
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
      state.drawer = null;
    }, 180);
  }

  function closeAllOverlays() {
    closeModal();
    closeDrawer();
  }

  function openModal({
    title = "Dialog",
    subtitle = "",
    content = "",
    className = "",
    actions = [],
    onClose = null,
    closeOnBackdrop = true
  } = {}) {
    closeModal();
    const prevFocus = document.activeElement;

    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    backdrop.innerHTML = `
      <section class="modal ${className}" role="dialog" aria-modal="true" aria-label="${String(title).replace(/\"/g, "")}">
        <header class="modal-head">
          <div>
            <h3>${title}</h3>
            ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
          </div>
          <button class="icon-btn" data-action="close-modal" aria-label="Close dialog">✕</button>
        </header>
        <div class="modal-body"></div>
        <footer class="modal-foot"></footer>
      </section>
    `;

    const body = backdrop.querySelector(".modal-body");
    const foot = backdrop.querySelector(".modal-foot");
    body.appendChild(toNode(content));

    if (actions.length) {
      const frag = document.createDocumentFragment();
      actions.forEach((action) => {
        const btn = document.createElement("button");
        btn.className = `btn ${action.primary ? "btn-primary" : "btn-ghost"}`;
        btn.textContent = action.label;
        btn.addEventListener("click", () => action.onClick?.());
        frag.appendChild(btn);
      });
      foot.appendChild(frag);
    }

    backdrop.addEventListener("click", (event) => {
      if (!closeOnBackdrop) {
        return;
      }
      if (event.target === backdrop) {
        closeModal();
      }
    });

    backdrop.querySelector('[data-action="close-modal"]')?.addEventListener("click", closeModal);

    const keydown = (event) => {
      if (!state.modal || state.modal.element !== backdrop) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
      trapKeydown(event, backdrop.querySelector(".modal"));
    };

    document.addEventListener("keydown", keydown);
    modalRoot.replaceChildren(backdrop);

    state.modal = {
      element: backdrop,
      onClose,
      prevFocus,
      keydown
    };

    const first = findFocusable(backdrop.querySelector(".modal"))[0];
    (first || backdrop.querySelector(".modal")).focus?.();

    const cleanup = () => document.removeEventListener("keydown", keydown);
    state.cleanup.push(cleanup);
    return backdrop;
  }

  function openDrawer({
    title = "Panel",
    subtitle = "",
    content = "",
    className = "",
    side = "right",
    onClose = null,
    closeOnBackdrop = true
  } = {}) {
    closeDrawer();
    const prevFocus = document.activeElement;

    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    backdrop.innerHTML = `
      <aside class="drawer drawer-${side} ${className}" role="dialog" aria-modal="true" aria-label="${String(title).replace(/\"/g, "")}">
        <header class="drawer-head">
          <div>
            <h3>${title}</h3>
            ${subtitle ? `<p class="muted">${subtitle}</p>` : ""}
          </div>
          <button class="icon-btn" data-action="close-drawer" aria-label="Close panel">✕</button>
        </header>
        <div class="drawer-body"></div>
      </aside>
    `;

    const body = backdrop.querySelector(".drawer-body");
    body.appendChild(toNode(content));

    backdrop.addEventListener("click", (event) => {
      if (!closeOnBackdrop) {
        return;
      }
      if (event.target === backdrop) {
        closeDrawer();
      }
    });
    backdrop.querySelector('[data-action="close-drawer"]')?.addEventListener("click", closeDrawer);

    const keydown = (event) => {
      if (!state.drawer || state.drawer.element !== backdrop) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
      trapKeydown(event, backdrop.querySelector(".drawer"));
    };
    document.addEventListener("keydown", keydown);

    drawerRoot.replaceChildren(backdrop);
    state.drawer = { element: backdrop, onClose, prevFocus, keydown };

    const first = findFocusable(backdrop.querySelector(".drawer"))[0];
    (first || backdrop.querySelector(".drawer")).focus?.();

    const cleanup = () => document.removeEventListener("keydown", keydown);
    state.cleanup.push(cleanup);
    return backdrop;
  }

  function showToast({ message, type = "info", duration = 2500 } = {}) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-body">
        <span>${message}</span>
        <button class="icon-btn" aria-label="Dismiss notification">✕</button>
      </div>
    `;

    const remove = () => {
      toast.classList.add("toast-leave");
      window.setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector("button")?.addEventListener("click", remove);
    toastRoot.prepend(toast);

    const toasts = [...toastRoot.children];
    if (toasts.length > 3) {
      toasts.slice(3).forEach((node) => node.remove());
    }

    if (duration > 0) {
      window.setTimeout(remove, duration);
    }
  }

  function mountTooltip() {
    if (state.tooltip) {
      return;
    }
    const tip = document.createElement("div");
    tip.className = "tooltip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    document.body.appendChild(tip);
    state.tooltip = tip;

    const show = (event) => {
      const trigger = event.target.closest("[data-tooltip]");
      if (!trigger || !state.tooltip) {
        return;
      }
      state.tooltip.textContent = trigger.getAttribute("data-tooltip") || "";
      const rect = trigger.getBoundingClientRect();
      state.tooltip.style.left = `${Math.max(8, rect.left + rect.width / 2)}px`;
      state.tooltip.style.top = `${Math.max(8, rect.top - 8)}px`;
      state.tooltip.hidden = false;
    };

    const hide = () => {
      if (state.tooltip) {
        state.tooltip.hidden = true;
      }
    };

    document.addEventListener("mouseover", show);
    document.addEventListener("focusin", show);
    document.addEventListener("mouseout", hide);
    document.addEventListener("focusout", hide);

    state.cleanup.push(() => {
      document.removeEventListener("mouseover", show);
      document.removeEventListener("focusin", show);
      document.removeEventListener("mouseout", hide);
      document.removeEventListener("focusout", hide);
    });
  }

  function renderSkeleton(kind = "card", count = 3) {
    const className = `skeleton skeleton-${kind}`;
    return Array.from({ length: count })
      .map(
        () => `
        <article class="${className}">
          <span class="s-line w-40"></span>
          <span class="s-line w-90"></span>
          <span class="s-line w-70"></span>
        </article>
      `
      )
      .join("");
  }

  function destroy() {
    state.cleanup.forEach((fn) => fn());
    state.cleanup = [];
    closeAllOverlays();
    toastRoot.innerHTML = "";
    if (state.tooltip) {
      state.tooltip.remove();
      state.tooltip = null;
    }
  }

  mountTooltip();

  return {
    modalRoot,
    drawerRoot,
    toastRoot,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
    closeAllOverlays,
    showToast,
    renderSkeleton,
    destroy
  };
}
