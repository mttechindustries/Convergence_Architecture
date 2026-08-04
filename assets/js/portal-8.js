"use strict";

  function handleRouteChange(options = {}) {
    if (!state.data) return;
    const { route, params } = parseHash();
    state.route = route;
    state.params = params;
    setActiveNavigation(route);

    const root = $("#view-root");
    root.innerHTML = renderRoute(state.data, route, params);
    root.hidden = false;
    $("#loading-view").hidden = true;
    $("#error-view").hidden = true;

    bindViewEvents();

    if (route === "history") renderValidationReport();

    const record = params.get("record");
    if (record) openRecord(record, { updateURL: false });
    else closeDrawer({ updateURL: false, restoreFocus: false });

    if (options.scroll !== false) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      $("#main").focus({ preventScroll: true });
    }
  }

  function collectFormParams(form) {
    const params = {};
    new FormData(form).forEach((value, key) => {
      params[key] = String(value).trim();
    });
    params.page = "";
    return params;
  }

  function bindViewEvents() {
    const root = $("#view-root");

    $$('[data-route]', root).forEach((element) => {
      element.addEventListener("click", (event) => {
        if (element.tagName === "A") return;
        event.preventDefault();
        const updates = {};
        if (element.dataset.filterTrunk) updates.trunk = element.dataset.filterTrunk;
        navigate(element.dataset.route, updates, { reset: !element.dataset.filterTrunk });
      });
    });

    $$('[data-open-record]', root).forEach((element) => {
      element.addEventListener("click", () => openRecord(element.dataset.openRecord));
    });

    $$('[data-open-correction]', root).forEach((element) => {
      element.addEventListener("click", () => openCorrection(element.dataset.openCorrection));
    });

    $$('[data-select-trunk]', root).forEach((element) => {
      element.addEventListener("click", () => {
        const trunk = element.dataset.selectTrunk;
        state.selectedGraphTrunk = trunk;
        navigate("architecture", { trunk }, { scroll: false });
      });
    });

    const clearTrunk = $("[data-clear-trunk]", root);
    if (clearTrunk) {
      clearTrunk.addEventListener("click", () => {
        state.selectedGraphTrunk = "";
        navigate("architecture", { trunk: "" }, { scroll: false });
      });
    }

    $$('[data-filter-form]', root).forEach((form) => {
      let timer;
      form.addEventListener("input", (event) => {
        if (event.target.type !== "search") return;
        clearTimeout(timer);
        timer = setTimeout(() => navigate(form.dataset.filterForm, collectFormParams(form), { scroll: false, replace: true }), 220);
      });
      form.addEventListener("change", () => navigate(form.dataset.filterForm, collectFormParams(form), { scroll: false, replace: true }));
      form.addEventListener("submit", (event) => event.preventDefault());
    });

    $$('[data-clear-filters]', root).forEach((button) => {
      button.addEventListener("click", () => navigate(button.dataset.clearFilters, {}, { reset: true, scroll: false }));
    });

    $$('[data-page]', root).forEach((button) => {
      button.addEventListener("click", () => navigate(button.dataset.pageRoute, { page: button.dataset.page }, { scroll: true }));
    });

    $$('[data-export]', root).forEach((button) => {
      button.addEventListener("click", () => exportCurrent(button.dataset.export, button.dataset.exportFormat));
    });

    const copyLink = $("[data-copy-link]", root);
    if (copyLink) copyLink.addEventListener("click", () => copyText(window.location.href, "Filtered link copied"));

    const copyCitation = $("[data-copy-citation]", root);
    if (copyCitation) copyCitation.addEventListener("click", () => copyText(state.data.metadata.citation, "Citation copied"));
  }

  function filteredRecordsForCurrentRoute() {
    const { route, params } = parseHash();
    if (route === "sources") return applyCommonFilters(state.data.sources.map((record) => ({ ...record, _search: buildSearchText(record) })), params, "source");
    if (route === "claims") return applyCommonFilters(state.data.claims.map((record) => ({ ...record, _search: buildSearchText(record) })), params, "claim");
    if (route === "pathways") return applyCommonFilters(state.data.pathways.map((record) => ({ ...record, _search: buildSearchText(record) })), params, "pathway");
    if (route === "explorer") {
      const q = normalizeSearch(params.get("q"));
      const kind = params.get("kind");
      const evidence = params.get("evidence");
      const trunk = params.get("trunk");
      const visibility = params.get("visibility");
      return unifiedRecords(state.data).filter((record) => {
        if (q && !record._search.includes(q)) return false;
        if (kind && record._kind !== kind) return false;
        if (evidence && highestEvidence(recordEvidence(record)) !== evidence) return false;
        if (trunk && !recordTrunks(record).includes(trunk)) return false;
        if (visibility && recordVisibility(record) !== visibility) return false;
        return true;
      });
    }
    return [];
  }

  function toCSV(records) {
    if (!records.length) return "";
    const keys = [...new Set(records.flatMap((record) => Object.keys(record).filter((key) => !key.startsWith("_"))))];
    const encode = (value) => {
      const string = String(value ?? "");
      return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
    };
    return [keys.join(","), ...records.map((record) => keys.map((key) => encode(record[key])).join(","))].join("\n");
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCurrent(kind, format) {
    const records = filteredRecordsForCurrentRoute().map((record) => {
      const clean = { ...record };
      delete clean._search;
      delete clean._kind;
      return clean;
    });
    const date = new Date().toISOString().slice(0, 10);
    if (format === "json") downloadFile(`convergence-${kind}-${date}.json`, JSON.stringify(records, null, 2), "application/json");
    else downloadFile(`convergence-${kind}-${date}.csv`, toCSV(records), "text/csv;charset=utf-8");
    showToast(`Exported ${records.length} records`);
  }

  function linkedClaimsForSource(sourceId) {
    return state.data.claims.filter((claim) => splitList(claim.supporting_sources).includes(sourceId));
  }

  function linkedPathwaysForSource(sourceId) {
    return state.data.pathways.filter((pathway) => splitList(pathway.source_ids).includes(sourceId));
  }

  function linkedRecordsHTML(ids, kindLabel) {
    if (!ids.length) return `<span style="color:var(--dim)">None registered</span>`;
    return `<div class="detail-links">${ids.map((id) => `<button type="button" data-drawer-link="${escapeHTML(id)}">${escapeHTML(id)}</button>`).join("")}</div>`;
  }

  function detailField(label, value, raw = false) {
    if (value === undefined || value === null || value === "") return "";
    return `<div class="detail-field"><dt>${escapeHTML(label)}</dt><dd>${raw ? value : escapeHTML(value)}</dd></div>`;
  }
