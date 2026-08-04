"use strict";

  function filterPanel(data, records, params, kind, route) {
    const evidenceValues = getFilterValues(records, "evidence_state", highestEvidence);
    if (kind === "source") {
      getFilterValues(records, "evidence_supported", highestEvidence).forEach((value) => {
        if (!evidenceValues.includes(value)) evidenceValues.push(value);
      });
      evidenceValues.sort();
    }
    const typeField = kind === "source" ? "type" : kind === "claim" ? "claim_class" : "status";
    const typeValues = getFilterValues(records, typeField);
    const yearValues = getFilterValues(records, kind === "source" ? "date" : "updated", yearOf).sort((a, b) => Number(b) - Number(a));
    const reachabilityValues = kind === "pathway" ? getFilterValues(records, "reachability") : [];

    return `
      <form class="filters" data-filter-form="${route}">
        <div class="field">
          <label for="${route}-q">Search</label>
          <input id="${route}-q" name="q" type="search" value="${escapeHTML(params.get("q") || "")}" placeholder="Search every field…">
        </div>
        <div class="field">
          <label for="${route}-evidence">Evidence</label>
          <select id="${route}-evidence" name="evidence">${optionHTML(evidenceValues, params.get("evidence"), "All evidence")}</select>
        </div>
        <div class="field">
          <label for="${route}-trunk">Trunk</label>
          <select id="${route}-trunk" name="trunk">${optionHTML(data.trunks.map((trunk) => trunk.trunk_id), params.get("trunk"), "All trunks")}</select>
        </div>
        <div class="field">
          <label for="${route}-visibility">Visibility</label>
          <select id="${route}-visibility" name="visibility">${optionHTML(["PUBLIC", "RESTRICTED"], params.get("visibility"), "All visibility")}</select>
        </div>
        <div class="field">
          <label for="${route}-type">${kind === "pathway" ? "Status" : "Type / class"}</label>
          <select id="${route}-type" name="type">${optionHTML(typeValues, params.get("type"), "All")}</select>
        </div>
        ${kind === "pathway" ? `
          <div class="field">
            <label for="${route}-reachability">Reachability</label>
            <select id="${route}-reachability" name="reachability">${optionHTML(reachabilityValues, params.get("reachability"), "All reachability")}</select>
          </div>` : `
          <div class="field">
            <label for="${route}-year">Year</label>
            <select id="${route}-year" name="year">${optionHTML(yearValues, params.get("year"), "All years")}</select>
          </div>`}
        <div class="field">
          <label for="${route}-sort">Sort</label>
          <select id="${route}-sort" name="sort">
            <option value="id" ${params.get("sort") === "id" ? "selected" : ""}>Record ID</option>
            <option value="title" ${params.get("sort") === "title" ? "selected" : ""}>Title</option>
            <option value="evidence-desc" ${params.get("sort") === "evidence-desc" ? "selected" : ""}>Evidence high to low</option>
            ${kind === "source" ? `
              <option value="date-desc" ${!params.get("sort") || params.get("sort") === "date-desc" ? "selected" : ""}>Newest first</option>
              <option value="date-asc" ${params.get("sort") === "date-asc" ? "selected" : ""}>Oldest first</option>` : ""}
            ${kind === "pathway" ? `<option value="reachability-desc" ${params.get("sort") === "reachability-desc" ? "selected" : ""}>Reachability high to low</option>` : ""}
          </select>
        </div>
        <div class="filter-actions">
          <button class="button button-small" type="button" data-clear-filters="${route}">Clear</button>
        </div>
      </form>`;
  }

  function paginationHTML(total, page, pageSize, route) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (pages <= 1) return "";
    const current = Math.min(page, pages);
    const visible = [];
    for (let i = 1; i <= pages; i += 1) {
      if (i === 1 || i === pages || Math.abs(i - current) <= 2) visible.push(i);
    }
    const items = [];
    let previous = 0;
    visible.forEach((number) => {
      if (number - previous > 1) items.push(`<span>…</span>`);
      items.push(`<button type="button" data-page="${number}" data-page-route="${route}" class="${number === current ? "is-active" : ""}">${number}</button>`);
      previous = number;
    });
    return `
      <nav class="pagination" aria-label="Results pages">
        <button type="button" data-page="${current - 1}" data-page-route="${route}" ${current <= 1 ? "disabled" : ""}>←</button>
        ${items.join("")}
        <button type="button" data-page="${current + 1}" data-page-route="${route}" ${current >= pages ? "disabled" : ""}>→</button>
      </nav>`;
  }

  function resultsSection(records, params, kind, route) {
    const pageSize = 12;
    const requestedPage = Math.max(1, Number(params.get("page") || 1));
    const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const pageRecords = records.slice((page - 1) * pageSize, page * pageSize);

    return `
      <div class="result-toolbar">
        <span><strong>${records.length}</strong> matching ${kind}${records.length === 1 ? "" : "s"}</span>
        <div class="toolbar-actions">
          <button class="button button-small" data-copy-link>Copy filtered link</button>
          <button class="button button-small" data-export="${kind}" data-export-format="csv">Export CSV</button>
          <button class="button button-small" data-export="${kind}" data-export-format="json">Export JSON</button>
        </div>
      </div>
      ${pageRecords.length ? `<div class="record-list">${pageRecords.map(recordCard).join("")}</div>` : `<div class="empty-state"><strong>No matching records</strong><span>Clear a filter or try a broader search.</span></div>`}
      ${paginationHTML(records.length, page, pageSize, route)}`;
  }

  function renderRegistry(data, params, kind) {
    const config = {
      source: {
        route: "sources",
        title: "Source Ledger",
        kicker: "30 registered records · 29 public · 1 restricted",
        description: "The source ledger exposes the actual public patent, paper, standard, product, institutional, and synthesis records. Each record includes what it supports and what it cannot establish by itself.",
        records: data.sources.map((record) => ({ ...record, _search: buildSearchText(record) })),
        link: "references/PRIMARY_SOURCE_STARTER.md"
      },
      claim: {
        route: "claims",
        title: "Claim Registry",
        kicker: "30 registered claims · 28 public · 2 restricted",
        description: "Claims are atomic and bounded. Each one carries an evidence state, confidence, supporting sources, a counterevidence or boundary statement, deployment status, intent status, and a next action.",
        records: data.claims.map((record) => ({ ...record, _search: buildSearchText(record) })),
        link: "evidence/EVIDENCE_STANDARD.md"
      },
      pathway: {
        route: "pathways",
        title: "Pathway Registry",
        kicker: "20 registered pathways · 18 public · 2 restricted",
        description: "Pathways connect research trunks through a stated mechanism and infrastructure. Reachability R0–R7 and evidence E0–E7 are tracked independently.",
        records: data.pathways.map((record) => ({ ...record, _search: buildSearchText(record) })),
        link: "evidence/CURRENT_STATUS.md"
      }
    }[kind];

    const filtered = applyCommonFilters(config.records, params, kind);

    return `
      <div class="view">
        <header class="view-header">
          <p class="label">${escapeHTML(config.kicker)}</p>
          <h1 class="gradient-text">${escapeHTML(config.title)}</h1>
          <p>${escapeHTML(config.description)}</p>
          <div class="header-links"><a class="button button-secondary" href="${escapeHTML(config.link)}">Open methodology document</a></div>
        </header>
        ${filterPanel(data, config.records, params, kind, config.route)}
        ${resultsSection(filtered, params, kind, config.route)}
      </div>`;
  }
