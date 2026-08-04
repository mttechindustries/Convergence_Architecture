"use strict";

  function unifiedRecords(data) {
    return [
      ...data.sources.map((record) => ({ ...record, _kind: "source", _search: buildSearchText(record) })),
      ...data.claims.map((record) => ({ ...record, _kind: "claim", _search: buildSearchText(record) })),
      ...data.pathways.map((record) => ({ ...record, _kind: "pathway", _search: buildSearchText(record) }))
    ];
  }

  function renderExplorer(data, params) {
    const records = unifiedRecords(data);
    const q = normalizeSearch(params.get("q"));
    const kind = params.get("kind") || "";
    const evidence = params.get("evidence") || "";
    const trunk = params.get("trunk") || "";
    const visibility = params.get("visibility") || "";

    const filtered = records.filter((record) => {
      if (q && !record._search.includes(q)) return false;
      if (kind && record._kind !== kind) return false;
      if (evidence && highestEvidence(recordEvidence(record)) !== evidence) return false;
      if (trunk && !recordTrunks(record).includes(trunk)) return false;
      if (visibility && recordVisibility(record) !== visibility) return false;
      return true;
    }).sort((a, b) => {
      const scoreA = q ? relevanceScore(a, q) : evidenceNumber(recordEvidence(a));
      const scoreB = q ? relevanceScore(b, q) : evidenceNumber(recordEvidence(b));
      return scoreB - scoreA || recordId(a).localeCompare(recordId(b), undefined, { numeric: true });
    });

    const typeCounts = countBy(filtered, (record) => record._kind);

    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Unified cross-registry search</p>
          <h1 class="gradient-text">Evidence Explorer</h1>
          <p>Search every public and restricted-placeholder source, claim, and pathway field at once. Filter by record type, evidence state, research trunk, or visibility. Open any record to traverse its linked evidence chain.</p>
        </header>

        <form class="filters compact" data-filter-form="explorer">
          <div class="field">
            <label for="explorer-q">Search corpus</label>
            <input id="explorer-q" name="q" type="search" value="${escapeHTML(params.get("q") || "")}" placeholder="Try Wi-Fi, aerial, E4, Air Force, privacy, T15…">
          </div>
          <div class="field">
            <label for="explorer-kind">Record type</label>
            <select id="explorer-kind" name="kind">${optionHTML(["source","claim","pathway"], kind, "All records")}</select>
          </div>
          <div class="field">
            <label for="explorer-evidence">Evidence</label>
            <select id="explorer-evidence" name="evidence">${optionHTML(data.evidenceLevels.map((item) => item.id), evidence, "All evidence")}</select>
          </div>
          <div class="field">
            <label for="explorer-trunk">Trunk</label>
            <select id="explorer-trunk" name="trunk">${optionHTML(data.trunks.map((trunkItem) => trunkItem.trunk_id), trunk, "All trunks")}</select>
          </div>
          <div class="field">
            <label for="explorer-visibility">Visibility</label>
            <select id="explorer-visibility" name="visibility">${optionHTML(["PUBLIC","RESTRICTED"], visibility, "All visibility")}</select>
          </div>
          <div class="filter-actions"><button class="button button-small" type="button" data-clear-filters="explorer">Clear</button></div>
        </form>

        <section class="metric-grid">
          ${metricCard(filtered.length, "Matching records", q ? `Query: “${params.get("q")}”` : "No text query applied", "RESULT SET", "rgba(139,92,246,.2)")}
          ${metricCard(new Map(typeCounts).get("source") || 0, "Sources", "Primary and canonical records", "SOURCE MATCHES", "rgba(34,211,238,.18)")}
          ${metricCard(new Map(typeCounts).get("claim") || 0, "Claims", "Atomic bounded statements", "CLAIM MATCHES", "rgba(52,211,153,.18)")}
          ${metricCard(new Map(typeCounts).get("pathway") || 0, "Pathways", "Qualified graph edges", "PATHWAY MATCHES", "rgba(251,191,36,.18)")}
        </section>

        ${resultsSection(filtered, params, "record", "explorer")}
      </div>`;
  }

  function relevanceScore(record, q) {
    if (!q) return 0;
    const title = normalizeSearch(recordTitle(record));
    const id = normalizeSearch(recordId(record));
    const summary = normalizeSearch(recordSummary(record));
    let score = 0;
    if (id === q) score += 100;
    if (id.includes(q)) score += 40;
    if (title === q) score += 70;
    if (title.includes(q)) score += 30;
    if (summary.includes(q)) score += 12;
    if ((record._search || "").includes(q)) score += 5;
    score += evidenceNumber(recordEvidence(record));
    return score;
  }
