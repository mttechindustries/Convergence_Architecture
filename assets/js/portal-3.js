"use strict";

  function renderArchitectureGraph(data, selectedTrunk = "") {
    const positions = graphPositions(data.trunks);
    const edges = [];
    data.pathways.filter((pathway) => recordVisibility(pathway) === "PUBLIC").forEach((pathway) => {
      const targets = splitList(pathway.target_trunk);
      const sources = splitList(pathway.source_trunk);
      sources.forEach((source) => targets.forEach((target) => {
        if (positions[source] && positions[target]) edges.push({ source, target, pathway });
      }));
    });

    const selectedPathways = selectedTrunk
      ? data.pathways.filter((pathway) => recordVisibility(pathway) === "PUBLIC" && recordTrunks(pathway).includes(selectedTrunk))
      : data.pathways.filter((pathway) => recordVisibility(pathway) === "PUBLIC");

    return `
      <div class="architecture-layout">
        <div class="graph-panel">
          <svg viewBox="0 0 1000 720" role="img" aria-label="Interactive graph of research trunks and qualified pathways">
            <defs>
              <filter id="nodeGlow"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#7c3aed" flood-opacity=".35"/></filter>
            </defs>
            ${edges.map((edge, index) => {
              const active = selectedTrunk && (edge.source === selectedTrunk || edge.target === selectedTrunk);
              return `<path class="graph-edge ${active ? "is-selected" : ""}" data-open-record="${escapeHTML(edge.pathway.path_id)}" data-evidence="${escapeHTML(highestEvidence(edge.pathway.evidence_state))}" d="${curvePath(positions[edge.source], positions[edge.target], index)}"><title>${escapeHTML(edge.pathway.path_id)} — ${escapeHTML(edge.pathway.path_name)}</title></path>`;
            }).join("")}
            ${data.trunks.map((trunk) => {
              const position = positions[trunk.trunk_id];
              const selected = trunk.trunk_id === selectedTrunk;
              const shortName = trunk.name.length > 25 ? `${trunk.name.slice(0, 23)}…` : trunk.name;
              return `
                <g class="graph-node ${selected ? "is-selected" : ""}" data-select-trunk="${escapeHTML(trunk.trunk_id)}" transform="translate(${position.x} ${position.y})">
                  <circle r="45" filter="url(#nodeGlow)"></circle>
                  <text class="node-id" text-anchor="middle" y="-6">${escapeHTML(trunk.trunk_id)}</text>
                  <text text-anchor="middle" y="11">${escapeHTML(shortName.slice(0, 15))}</text>
                  ${shortName.length > 15 ? `<text text-anchor="middle" y="25">${escapeHTML(shortName.slice(15, 30))}</text>` : ""}
                  <title>${escapeHTML(trunk.trunk_id)} — ${escapeHTML(trunk.name)}</title>
                </g>`;
            }).join("")}
          </svg>
        </div>

        <aside class="graph-side">
          <section class="panel">
            <div class="panel-header"><div><p class="label">Graph control</p><h2>${selectedTrunk ? escapeHTML(`${selectedTrunk} · ${data.trunkMap[selectedTrunk]?.name}`) : "All public pathways"}</h2></div></div>
            ${selectedTrunk ? `
              <p style="color:var(--muted);font-size:.8rem;line-height:1.65">${escapeHTML(data.trunkMap[selectedTrunk]?.scope || "")}</p>
              <button class="button button-small" data-clear-trunk style="margin-top:14px">Clear trunk filter</button>
            ` : `<p style="color:var(--muted);font-size:.8rem;line-height:1.65">Select a trunk node to isolate its incoming and outgoing pathways. Select an edge to open the complete pathway record.</p>`}
          </section>
          <section class="panel">
            <p class="label">Evidence legend</p>
            <div class="graph-legend" style="margin-top:12px">
              <span><i class="legend-line e0"></i>E0 hypothesis or validation-required edge</span>
              <span><i class="legend-line"></i>E1 mechanism or formal pathway</span>
              <span><i class="legend-line e2"></i>E2 controlled capability</span>
              <span><i class="legend-line e4"></i>E4 institutional fielding</span>
            </div>
          </section>
          <section class="panel">
            <div class="panel-header"><div><p class="label">Connected records</p><h3>${selectedPathways.length} pathways</h3></div></div>
            <div class="record-list">${selectedPathways.slice(0, 8).map(recordCard).join("")}</div>
            ${selectedPathways.length > 8 ? `<button class="button button-small" data-route="pathways" data-filter-trunk="${escapeHTML(selectedTrunk)}" style="margin-top:12px">View all ${selectedPathways.length}</button>` : ""}
          </section>
        </aside>
      </div>`;
  }

  function renderArchitecture(data, params) {
    const selectedTrunk = params.get("trunk") || state.selectedGraphTrunk || "";
    state.selectedGraphTrunk = selectedTrunk;
    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Data-driven systems map</p>
          <h1 class="gradient-text">Architecture Graph</h1>
          <p>This graph is generated from the pathway registry. Nodes are public research trunks; edges are qualified physical, digital, or governance pathways. Evidence state and reachability remain separate.</p>
          <div class="header-links">
            <button class="button button-primary" data-route="pathways">Open pathway registry</button>
            <a class="button button-secondary" href="evidence/EVIDENCE_STANDARD.md">Evidence standard</a>
          </div>
        </header>
        ${renderArchitectureGraph(data, selectedTrunk)}
      </div>`;
  }

  function getFilterValues(records, field, transform = (value) => value) {
    const values = new Set();
    records.forEach((record) => {
      const raw = record[field];
      if (!raw) return;
      const transformed = transform(raw);
      (Array.isArray(transformed) ? transformed : [transformed]).forEach((value) => {
        if (value) values.add(value);
      });
    });
    return [...values].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }

  function optionHTML(values, selected, emptyLabel = "All") {
    return `<option value="">${escapeHTML(emptyLabel)}</option>${values.map((value) => `<option value="${escapeHTML(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeHTML(value)}</option>`).join("")}`;
  }

  function applyCommonFilters(records, params, kind) {
    const q = normalizeSearch(params.get("q"));
    const evidence = params.get("evidence") || "";
    const trunk = params.get("trunk") || "";
    const visibility = params.get("visibility") || "";
    const type = params.get("type") || "";
    const year = params.get("year") || "";
    const reachability = params.get("reachability") || "";

    let filtered = records.filter((record) => {
      const search = record._search || buildSearchText(record);
      if (q && !search.includes(q)) return false;
      if (evidence && highestEvidence(recordEvidence(record)) !== evidence) return false;
      if (trunk && !recordTrunks(record).includes(trunk)) return false;
      if (visibility && recordVisibility(record) !== visibility) return false;
      if (type) {
        const candidate = kind === "source" ? record.type : kind === "claim" ? record.claim_class : record.status;
        if (candidate !== type) return false;
      }
      if (year && yearOf(record.date || record.updated) !== year) return false;
      if (reachability && record.reachability !== reachability) return false;
      return true;
    });

    const sort = params.get("sort") || (kind === "source" ? "date-desc" : "id");
    filtered = filtered.sort((a, b) => {
      if (sort === "date-desc") return String(b.date || b.updated).localeCompare(String(a.date || a.updated));
      if (sort === "date-asc") return String(a.date || a.updated).localeCompare(String(b.date || b.updated));
      if (sort === "evidence-desc") return evidenceNumber(recordEvidence(b)) - evidenceNumber(recordEvidence(a));
      if (sort === "title") return recordTitle(a).localeCompare(recordTitle(b));
      if (sort === "reachability-desc") return reachabilityNumber(b.reachability) - reachabilityNumber(a.reachability);
      return recordId(a).localeCompare(recordId(b), undefined, { numeric: true });
    });

    return filtered;
  }
