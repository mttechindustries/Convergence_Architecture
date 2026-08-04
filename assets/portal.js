(() => {
  "use strict";

  const TAB_IDS = [
    "overview",
    "synthesis",
    "aerial",
    "representation",
    "governance",
    "evidence",
    "sources",
    "boundaries"
  ];

  const labels = {
    overview: "Program Overview",
    synthesis: "The Architecture",
    aerial: "Aerial & Ambient Extension",
    representation: "The Representation Gap",
    governance: "Protocol Governance",
    evidence: "Evidence Standard & Status",
    sources: "Primary Source Starter",
    boundaries: "Publication Boundary"
  };

  const state = {
    activeTab: "overview",
    mobileOpen: false,
    toastTimer: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function validTab(value) {
    return TAB_IDS.includes(value) ? value : "overview";
  }

  function tabFromHash() {
    return validTab(window.location.hash.replace(/^#\/?/, "").trim());
  }

  function updateDocumentTitle(tabId) {
    const suffix = labels[tabId] || labels.overview;
    document.title = `${suffix} — Convergence Architecture`;
  }

  function updateNavigation(tabId) {
    $$(".nav-btn").forEach((button) => {
      const active = button.dataset.target === tabId;
      button.dataset.state = active ? "active" : "inactive";
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("tabindex", active ? "0" : "-1");
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    const select = $("#mobile-select");
    if (select) select.value = tabId;

    const sectionName = $("#active-section-name");
    if (sectionName) sectionName.textContent = labels[tabId];
  }

  function updatePanels(tabId) {
    $$(".tab-content").forEach((panel) => {
      const active = panel.id === `tab-${tabId}`;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", String(!active));
      if (active) panel.removeAttribute("inert");
      else panel.setAttribute("inert", "");
    });
  }

  function updateHash(tabId, mode = "push") {
    const nextHash = `#${tabId}`;
    if (window.location.hash === nextHash) return;
    const method = mode === "replace" ? "replaceState" : "pushState";
    window.history[method]({ tab: tabId }, "", nextHash);
  }

  function activateTab(tabId, options = {}) {
    const {
      updateUrl = true,
      historyMode = "push",
      moveFocus = false,
      scroll = true
    } = options;

    const resolved = validTab(tabId);
    state.activeTab = resolved;
    updatePanels(resolved);
    updateNavigation(resolved);
    updateDocumentTitle(resolved);

    if (updateUrl) updateHash(resolved, historyMode);
    closeMobileMenu(false);

    const panel = $(`#tab-${resolved}`);
    if (moveFocus && panel) {
      const heading = $("h2", panel);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }

    if (scroll) {
      const main = $("#main-content");
      if (main) {
        const top = main.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }

    const liveRegion = $("#section-announcer");
    if (liveRegion) liveRegion.textContent = `${labels[resolved]} selected`;
  }

  function openMobileMenu() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const activeDesktopButton = $(".desktop-nav-btn[data-state='active']");
      if (activeDesktopButton) activeDesktopButton.focus();
      return;
    }

    const drawer = $("#mobile-drawer");
    const trigger = $("#mobile-menu-button");
    if (!drawer || !trigger) return;
    state.mobileOpen = true;
    drawer.dataset.open = "true";
    drawer.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const firstButton = $(".mobile-nav-btn", drawer);
    if (firstButton) firstButton.focus();
  }

  function closeMobileMenu(restoreFocus = true) {
    const drawer = $("#mobile-drawer");
    const trigger = $("#mobile-menu-button");
    if (!drawer || !trigger || !state.mobileOpen) return;
    state.mobileOpen = false;
    drawer.dataset.open = "false";
    drawer.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (restoreFocus && !window.matchMedia("(min-width: 1024px)").matches) trigger.focus();
  }

  function updateScrollProgress() {
    const progress = $("#scroll-progress");
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }

  function showToast(message) {
    const toast = $("#copy-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.visible = "true";
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      toast.dataset.visible = "false";
    }, 2200);
  }

  async function copyCitation() {
    const citation = "Tuinier, Marc. Convergence Architecture. MT Tech Industries LLC, 2026. https://github.com/mttechindustries/Convergence_Architecture";
    try {
      await navigator.clipboard.writeText(citation);
      showToast("Citation copied");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = citation;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      showToast(copied ? "Citation copied" : "Copy failed");
    }
  }

  function handleTabKeydown(event) {
    const buttons = $$(".desktop-nav-btn");
    const currentIndex = buttons.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    let nextIndex = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextButton = buttons[nextIndex];
      activateTab(nextButton.dataset.target, { moveFocus: false, scroll: false });
      nextButton.focus();
    }
  }

  function bindEvents() {
    $$(".nav-btn").forEach((button) => {
      button.addEventListener("click", () => {
        activateTab(button.dataset.target, { moveFocus: true });
      });
    });

    $$(".desktop-nav-btn").forEach((button) => {
      button.addEventListener("keydown", handleTabKeydown);
    });

    $$("[data-tab-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        activateTab(link.dataset.tabLink, { moveFocus: true });
      });
    });

    const select = $("#mobile-select");
    if (select) {
      select.addEventListener("change", (event) => {
        activateTab(event.target.value, { moveFocus: true });
      });
    }

    const mobileButton = $("#mobile-menu-button");
    if (mobileButton) mobileButton.addEventListener("click", openMobileMenu);

    const closeButton = $("#mobile-menu-close");
    if (closeButton) closeButton.addEventListener("click", () => closeMobileMenu());

    const drawer = $("#mobile-drawer");
    if (drawer) {
      drawer.addEventListener("click", (event) => {
        if (event.target === drawer || event.target.dataset.drawerBackdrop === "true") {
          closeMobileMenu();
        }
      });
    }

    const citationButton = $("#copy-citation");
    if (citationButton) citationButton.addEventListener("click", copyCitation);

    window.addEventListener("popstate", () => {
      activateTab(tabFromHash(), { updateUrl: false, moveFocus: false, scroll: false });
    });

    window.addEventListener("hashchange", () => {
      activateTab(tabFromHash(), { updateUrl: false, moveFocus: false, scroll: false });
    });

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1024px)").matches && state.mobileOpen) {
        closeMobileMenu(false);
      }
    }, { passive: true });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileMenu();
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target;
        const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
        if (!typing) {
          event.preventDefault();
          openMobileMenu();
        }
      }
    });
  }

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
    }
  }

  function init() {
    bindEvents();
    const initialTab = tabFromHash();
    activateTab(initialTab, {
      updateUrl: true,
      historyMode: "replace",
      moveFocus: false,
      scroll: false
    });
    updateScrollProgress();
    initIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
