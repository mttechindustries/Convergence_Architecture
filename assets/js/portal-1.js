"use strict";

  const DATA_FILES = {
    metadata: "data/metadata.json",
    evidenceLevels: "data/evidence-levels.json",
    trunks: "data/trunks.csv",
    sources: "data/sources.csv",
    claims: "data/claims.csv",
    pathways: "data/pathways.csv",
    corrections: "data/corrections.csv"
  };

  const ROUTES = [
    "overview",
    "architecture",
    "explorer",
    "sources",
    "claims",
    "pathways",
    "research",
    "governance",
    "history",
    "boundary"
  ];

  const ROUTE_TITLES = {
    overview: "Overview",
    architecture: "Architecture Graph",
    explorer: "Evidence Explorer",
    sources: "Source Ledger",
    claims: "Claim Registry",
    pathways: "Pathway Registry",
    research: "Research Papers",
    governance: "Protocol Governance",
    history: "Corrections & History",
    boundary: "Publication Boundary"
  };

  const state = {
    data: null,
    route: "overview",
    params: new URLSearchParams(),
    selectedGraphTrunk: "",
    searchResults: [],
    searchIndex: -1,
    drawerReturnFocus: null,
    toastTimer: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeURL(value) {
    if (!value) return "";
    const url = String(value).trim();
    if (/^(https?:\/\/|research\/|governance\/|evidence\/|references\/|PUBLICATION_BOUNDARY\.md|RIGHTS\.md|CITATION\.cff|CHANGELOG\.md)/i.test(url)) {
      return url;
    }
    return "";
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (quoted) {
        if (char === '"' && next === '"') {
          field += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field.replace(/\r$/, ""));
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (field.length || row.length) {
      row.push(field.replace(/\r$/, ""));
      if (row.some((cell) => cell !== "")) rows.push(row);
    }

    const [headers, ...body] = rows;
    return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
  }

  function splitList(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function evidenceNumbers(value) {
    return (String(value || "").match(/E[0-7]/g) || []).map((item) => Number(item.slice(1)));
  }

  function highestEvidence(value) {
    const numbers = evidenceNumbers(value);
    return numbers.length ? `E${Math.max(...numbers)}` : "E0";
  }

  function evidenceNumber(value) {
    return Number(highestEvidence(value).slice(1));
  }

  function reachabilityNumber(value) {
    const match = String(value || "").match(/R([0-7])/);
    return match ? Number(match[1]) : 0;
  }

  function normalizeSearch(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function formatDate(value) {
    if (!value) return "Undated";
    const normalized = /^\d{4}$/.test(value) ? `${value}-01-01` : (/^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value);
    const date = new Date(`${normalized}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: /^\d{4}$/.test(value) ? undefined : "numeric" }).format(date);
  }

  function yearOf(value) {
    const match = String(value || "").match(/^\d{4}/);
    return match ? match[0] : "Unknown";
  }

  function recordKind(record) {
    const id = record.source_id || record.claim_id || record.path_id || record.trunk_id || record.correction_id || "";
    if (id.startsWith("SOV-SRC")) return "source";
    if (id.startsWith("SOV-CLM")) return "claim";
    if (id.startsWith("SOV-PATH")) return "pathway";
    if (id.startsWith("T")) return "trunk";
    if (id.startsWith("COR")) return "correction";
    return "record";
  }

  function recordId(record) {
    return record.source_id || record.claim_id || record.path_id || record.trunk_id || record.correction_id || "";
  }

  function recordTitle(record) {
    return record.title || record.claim || record.path_name || record.name || record.summary || recordId(record);
  }

  function recordSummary(record) {
    const kind = recordKind(record);
    if (kind === "source") return record.key_contribution || record.reliability_notes;
    if (kind === "claim") return record.boundary_or_counterevidence || record.claim_class;
    if (kind === "pathway") return record.physical_or_digital_mechanism || record.integration_question;
    if (kind === "trunk") return record.scope || record.primary_question;
    if (kind === "correction") return record.corrected_statement || record.summary;
    return "";
  }

  function recordEvidence(record) {
    return record.evidence_supported || record.evidence_state || "";
  }

  function recordTrunks(record) {
    if (record.trunk_ids) return splitList(record.trunk_ids);
    const values = [...splitList(record.source_trunk), ...splitList(record.target_trunk)];
    return [...new Set(values)];
  }

  function recordVisibility(record) {
    return record.visibility || (record.access_status === "RESTRICTED" ? "RESTRICTED" : "PUBLIC");
  }

  function buildSearchText(record) {
    return normalizeSearch(Object.values(record).join(" "));
  }

  async function fetchText(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.text();
  }

  async function loadData() {
    const [metadata, evidenceLevels, trunksText, sourcesText, claimsText, pathwaysText, correctionsText] = await Promise.all([
      fetch(DATA_FILES.metadata, { cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(`${DATA_FILES.metadata} returned ${response.status}`);
        return response.json();
      }),
      fetch(DATA_FILES.evidenceLevels, { cache: "no-cache" }).then((response) => {
        if (!response.ok) throw new Error(`${DATA_FILES.evidenceLevels} returned ${response.status}`);
        return response.json();
      }),
      fetchText(DATA_FILES.trunks),
      fetchText(DATA_FILES.sources),
      fetchText(DATA_FILES.claims),
      fetchText(DATA_FILES.pathways),
      fetchText(DATA_FILES.corrections)
    ]);

    const trunks = parseCSV(trunksText);
    const sources = parseCSV(sourcesText);
    const claims = parseCSV(claimsText);
    const pathways = parseCSV(pathwaysText);
    const corrections = parseCSV(correctionsText);
    const trunkMap = Object.fromEntries(trunks.map((trunk) => [trunk.trunk_id, trunk]));

    const sourcesById = Object.fromEntries(sources.map((record) => [record.source_id, record]));
    const claimsById = Object.fromEntries(claims.map((record) => [record.claim_id, record]));
    const pathwaysById = Object.fromEntries(pathways.map((record) => [record.path_id, record]));
    const recordsById = { ...sourcesById, ...claimsById, ...pathwaysById, ...trunkMap };

    const allRecords = [
      ...sources.map((record) => ({ ...record, _kind: "source" })),
      ...claims.map((record) => ({ ...record, _kind: "claim" })),
      ...pathways.map((record) => ({ ...record, _kind: "pathway" })),
      ...trunks.map((record) => ({ ...record, _kind: "trunk" }))
    ].map((record) => ({ ...record, _search: buildSearchText(record) }));

    return {
      metadata,
      evidenceLevels,
      trunks,
      sources,
      claims,
      pathways,
      corrections,
      trunkMap,
      sourcesById,
      claimsById,
      pathwaysById,
      recordsById,
      allRecords
    };
  }

  function validateData(data) {
    const errors = [];
    const duplicateCheck = (records, key) => {
      const ids = records.map((record) => record[key]);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length) errors.push(`Duplicate ${key}: ${[...new Set(duplicates)].join(", ")}`);
    };
    duplicateCheck(data.sources, "source_id");
    duplicateCheck(data.claims, "claim_id");
    duplicateCheck(data.pathways, "path_id");
    duplicateCheck(data.trunks, "trunk_id");

    data.claims.forEach((claim) => {
      splitList(claim.supporting_sources).forEach((id) => {
        if (!data.sourcesById[id]) errors.push(`${claim.claim_id} references missing source ${id}`);
      });
      recordTrunks(claim).forEach((id) => {
        if (!data.trunkMap[id]) errors.push(`${claim.claim_id} references missing trunk ${id}`);
      });
    });

    data.pathways.forEach((pathway) => {
      splitList(pathway.source_ids).forEach((id) => {
        if (!data.sourcesById[id]) errors.push(`${pathway.path_id} references missing source ${id}`);
      });
      recordTrunks(pathway).forEach((id) => {
        if (!data.trunkMap[id]) errors.push(`${pathway.path_id} references missing trunk ${id}`);
      });
    });

    return errors;
  }

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "");
    const [routePart, queryPart = ""] = raw.split("?");
    const route = ROUTES.includes(routePart) ? routePart : "overview";
    return { route, params: new URLSearchParams(queryPart) };
  }

  function makeHash(route, params = new URLSearchParams()) {
    const query = params.toString();
    return `#${route}${query ? `?${query}` : ""}`;
  }

  function navigate(route, updates = {}, options = {}) {
    const current = parseHash();
    const nextRoute = ROUTES.includes(route) ? route : current.route;
    const nextParams = options.reset ? new URLSearchParams() : new URLSearchParams(current.params);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) nextParams.delete(key);
      else nextParams.set(key, String(value));
    });

    if (options.remove) options.remove.forEach((key) => nextParams.delete(key));

    const hash = makeHash(nextRoute, nextParams);
    if (options.replace) window.history.replaceState({}, "", hash);
    else window.history.pushState({}, "", hash);
    handleRouteChange({ scroll: options.scroll !== false });
  }

  function setActiveNavigation(route) {
    $$('[data-route]').forEach((element) => {
      const active = element.dataset.route === route;
      element.classList.toggle("is-active", active);
      if (element.matches("button")) element.setAttribute("aria-current", active ? "page" : "false");
    });
    document.title = `${ROUTE_TITLES[route]} — Convergence Architecture`;
  }

  function updateHeader(data) {
    $("#header-version").textContent = `PUBLIC RESEARCH · v${data.metadata.version}`;
    $("#side-source-count").textContent = data.metadata.counts.sources_registered;
    $("#side-claim-count").textContent = data.metadata.counts.claims_registered;
    $("#side-path-count").textContent = data.metadata.counts.pathways_registered;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  async function copyText(text, successMessage = "Copied") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      showToast(ok ? successMessage : "Copy failed");
    }
  }

  function evidenceClass(value) {
    const number = evidenceNumber(value);
    if (number === 0) return "amber";
    if (number <= 2) return "cyan";
    if (number === 3) return "violet";
    if (number === 4) return "emerald";
    return "rose";
  }

  function tagHTML(text, tone = "") {
    return `<span class="tag ${tone}">${escapeHTML(text)}</span>`;
  }

  function badgeHTML(text, tone = "") {
    return `<span class="badge ${tone}">${escapeHTML(text)}</span>`;
  }

  function metricCard(value, title, description, code, glow) {
    return `
      <article class="metric-card" style="--metric-glow:${glow}">
        <div class="metric-top"><span>${escapeHTML(code)}</span><span>LIVE DATA</span></div>
        <strong>${escapeHTML(value)}</strong>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(description)}</p>
      </article>`;
  }

  function recordTags(record) {
    const tags = [];
    const evidence = recordEvidence(record);
    if (evidence) tags.push(tagHTML(evidence, evidenceClass(evidence)));
    recordTrunks(record).slice(0, 4).forEach((trunk) => tags.push(tagHTML(trunk, "violet")));
    const visibility = recordVisibility(record);
    if (visibility === "RESTRICTED") tags.push(tagHTML("Restricted", "rose"));
    if (record.type) tags.push(tagHTML(record.type));
    if (record.claim_class) tags.push(tagHTML(record.claim_class));
    if (record.reachability) tags.push(tagHTML(record.reachability, "amber"));
    return tags.join("");
  }

  function recordCard(record) {
    const kind = recordKind(record);
    const restricted = recordVisibility(record) === "RESTRICTED";
    return `
      <button type="button" class="record-card ${restricted ? "restricted" : ""}" data-open-record="${escapeHTML(recordId(record))}">
        <div>
          <span class="record-id">${escapeHTML(recordId(record))} · ${escapeHTML(kind.toUpperCase())}</span>
          <h3>${escapeHTML(recordTitle(record))}</h3>
          <p>${escapeHTML(recordSummary(record))}</p>
          <div class="record-meta">${recordTags(record)}</div>
        </div>
        <div class="record-tail">
          <strong>${escapeHTML(recordEvidence(record) || (record.reachability || ""))}</strong>
          <span>${escapeHTML(record.updated || record.date || record.last_updated || "")}</span>
        </div>
      </button>`;
  }

  function countBy(records, getter) {
    const map = new Map();
    records.forEach((record) => {
      const key = getter(record);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()];
  }

  function horizontalBarChart(entries, options = {}) {
    const sorted = [...entries]
      .filter(([, value]) => value > 0)
      .sort((a, b) => options.order === "key" ? String(a[0]).localeCompare(String(b[0])) : b[1] - a[1])
      .slice(0, options.limit || entries.length);
    if (!sorted.length) return `<div class="chart-empty">No chart data</div>`;

    const width = 760;
    const rowHeight = 38;
    const height = sorted.length * rowHeight + 36;
    const max = Math.max(...sorted.map(([, value]) => value), 1);
    const labelWidth = 150;
    const chartWidth = width - labelWidth - 48;

    return `
      <div class="chart">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHTML(options.label || "Distribution chart")}">
          ${sorted.map(([key, value], index) => {
            const y = 20 + index * rowHeight;
            const barWidth = (value / max) * chartWidth;
            const tone = options.colorFor ? options.colorFor(key) : `hsl(${255 - index * 14} 76% 62%)`;
            return `
              <text class="axis-label" x="${labelWidth - 10}" y="${y + 17}" text-anchor="end">${escapeHTML(key)}</text>
              <line class="grid-line" x1="${labelWidth}" x2="${width - 30}" y1="${y + 16}" y2="${y + 16}"></line>
              <rect class="bar" x="${labelWidth}" y="${y + 5}" width="${barWidth}" height="22" rx="7" fill="${tone}"></rect>
              <text class="bar-label" x="${Math.min(labelWidth + barWidth + 8, width - 25)}" y="${y + 20}">${value}</text>`;
          }).join("")}
        </svg>
      </div>`;
  }

  function evidenceDistribution(data) {
    const records = [...data.sources, ...data.claims, ...data.pathways].filter((record) => recordVisibility(record) === "PUBLIC");
    const entries = countBy(records, (record) => highestEvidence(recordEvidence(record)));
    const complete = Array.from({ length: 8 }, (_, index) => [`E${index}`, 0]);
    const map = new Map(entries);
    return complete.map(([key]) => [key, map.get(key) || 0]);
  }

  function sourceTimeline(data) {
    return countBy(data.sources.filter((source) => source.access_status === "PUBLIC"), (source) => yearOf(source.date))
      .filter(([year]) => year !== "Unknown")
      .sort((a, b) => Number(a[0]) - Number(b[0]));
  }

  function publicCount(records) {
    return records.filter((record) => recordVisibility(record) === "PUBLIC").length;
  }
