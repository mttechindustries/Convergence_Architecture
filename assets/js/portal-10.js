"use strict";

  function renderValidationReport() {
    const errors = validateData(state.data);
    const root = $("#validation-report");
    if (!root) return;
    if (!errors.length) {
      root.innerHTML = `<div class="notice" style="border-color:rgba(52,211,153,.3);background:rgba(4,120,87,.1);color:#a7f3d0"><strong>PASS</strong><p>All registered claim and pathway source references resolve, all trunk references resolve, and no duplicate source, claim, pathway, or trunk IDs were detected in the public data files.</p></div>`;
    } else {
      root.innerHTML = `<div class="notice"><strong>${errors.length} validation issue${errors.length === 1 ? "" : "s"}</strong><p>${errors.map(escapeHTML).join("<br>")}</p></div>`;
    }
  }

  function globalSearch(query) {
    const q = normalizeSearch(query);
    if (!q) return [];
    return state.data.allRecords
      .map((record) => ({ record, score: relevanceScore(record, q) }))
      .filter((item) => item.score > 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
      .map((item) => item.record);
  }

  function renderGlobalSearchResults() {
    const root = $("#global-search-results");
    if (!state.searchResults.length) {
      root.innerHTML = `<div class="empty-state" style="min-height:150px"><strong>No matching records</strong><span>Search IDs, titles, organizations, mechanisms, evidence states, or trunk IDs.</span></div>`;
      return;
    }
    root.innerHTML = state.searchResults.map((record, index) => `
      <button type="button" class="search-result ${index === state.searchIndex ? "is-active" : ""}" data-search-index="${index}">
        <strong>${escapeHTML(recordTitle(record))}</strong>
        <span>${escapeHTML(recordId(record))} · ${escapeHTML(recordKind(record))} · ${escapeHTML(recordEvidence(record))}</span>
      </button>`).join("");
    $$('[data-search-index]', root).forEach((button) => {
      button.addEventListener("click", () => selectGlobalSearchResult(Number(button.dataset.searchIndex)));
    });
  }

  function selectGlobalSearchResult(index) {
    const record = state.searchResults[index];
    if (!record) return;
    $("#search-dialog").close();
    openRecord(recordId(record));
  }

  function openSearch() {
    const dialog = $("#search-dialog");
    if (!dialog.open) dialog.showModal();
    const input = $("#global-search-input");
    input.focus();
    input.select();
    state.searchResults = globalSearch(input.value);
    state.searchIndex = state.searchResults.length ? 0 : -1;
    renderGlobalSearchResults();
  }

  function bindGlobalEvents() {
    $$('[data-route]').forEach((element) => {
      element.addEventListener("click", (event) => {
        if (element.tagName === "A" && element.getAttribute("href")?.startsWith("#")) event.preventDefault();
        if (element.closest("#view-root")) return;
        navigate(element.dataset.route, {}, { reset: true });
        $("#mobile-nav").hidden = true;
        $("#menu-button").setAttribute("aria-expanded", "false");
      });
    });

    $("#menu-button").addEventListener("click", () => {
      const nav = $("#mobile-nav");
      nav.hidden = !nav.hidden;
      $("#menu-button").setAttribute("aria-expanded", String(!nav.hidden));
    });

    $("#theme-button").addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.dataset.theme === "light" ? "dark" : "light";
      html.dataset.theme = next;
      localStorage.setItem("convergence-theme", next);
      showToast(`${next[0].toUpperCase()}${next.slice(1)} theme`);
    });

    $("#global-search-button").addEventListener("click", openSearch);
    $("#global-search-input").addEventListener("input", (event) => {
      state.searchResults = globalSearch(event.target.value);
      state.searchIndex = state.searchResults.length ? 0 : -1;
      renderGlobalSearchResults();
    });
    $("#global-search-input").addEventListener("keydown", (event) => {
      if (!state.searchResults.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        state.searchIndex = (state.searchIndex + 1) % state.searchResults.length;
        renderGlobalSearchResults();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        state.searchIndex = (state.searchIndex - 1 + state.searchResults.length) % state.searchResults.length;
        renderGlobalSearchResults();
      } else if (event.key === "Enter") {
        event.preventDefault();
        selectGlobalSearchResult(state.searchIndex);
      }
    });

    $$('[data-close-drawer]').forEach((element) => element.addEventListener("click", () => closeDrawer()));

    window.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        closeDrawer();
        if ($("#mobile-nav") && !$("#mobile-nav").hidden) {
          $("#mobile-nav").hidden = true;
          $("#menu-button").setAttribute("aria-expanded", "false");
        }
      }
    });

    window.addEventListener("popstate", () => handleRouteChange({ scroll: false }));
    window.addEventListener("hashchange", () => handleRouteChange({ scroll: false }));
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
  }

  function updateScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    $("#scroll-progress").style.width = `${percent}%`;
  }

  async function init() {
    const savedTheme = localStorage.getItem("convergence-theme");
    if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;

    bindGlobalEvents();
    updateScrollProgress();

    try {
      const data = await loadData();
      state.data = data;
      updateHeader(data);
      if (!window.location.hash) window.history.replaceState({}, "", "#overview");
      handleRouteChange({ scroll: false });
    } catch (error) {
      console.error(error);
      $("#loading-view").hidden = true;
      $("#error-view").hidden = false;
      $("#error-message").textContent = `${error.message}. The static research documents remain available from the repository.`;
      $("#retry-button").addEventListener("click", () => window.location.reload(), { once: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
