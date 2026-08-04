"use strict";

  function renderHistory(data) {
    const releases = [
      ["0.4.0", "2026-08-04", "Data-driven public evidence system", "Replaces hard-coded summary counts with public-safe registries, unified search, complete record views, interactive graph navigation, filtering, linked evidence chains, exports, corrections, and validation."],
      ["0.3.0", "2026-08-04", "Interactive portal prototype", "Introduced the root portal, responsive navigation, visual summaries, and document links."],
      ["0.2.0", "2026-08-04", "Visual README", "Introduced the visual public repository landing page and original architecture graphics."],
      ["0.1.0", "2026-08-04", "Initial public corpus", "Published the first public synthesis, governance papers, evidence standard, source starter, boundary, and citation files."]
    ];

    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Revision is part of the evidence model</p>
          <h1 class="gradient-text">Corrections & History</h1>
          <p>Errors, contradictions, corrections, and supersession are recorded rather than silently erased. The public portal exposes active corrections and release history while the canonical repository retains deeper audit provenance.</p>
          <div class="header-links"><a class="button button-secondary" href="CHANGELOG.md">Open full changelog</a></div>
        </header>

        <section class="panel">
          <div class="panel-header"><div><p class="label">Active correction register</p><h2>${data.corrections.length} published correction${data.corrections.length === 1 ? "" : "s"}</h2></div></div>
          <div class="record-list">${data.corrections.map((correction) => `
            <button type="button" class="record-card" data-open-correction="${escapeHTML(correction.correction_id)}">
              <div><span class="record-id">${escapeHTML(correction.correction_id)} · ${escapeHTML(correction.record_type.toUpperCase())}</span><h3>${escapeHTML(correction.summary)}</h3><p>${escapeHTML(correction.corrected_statement)}</p><div class="record-meta">${tagHTML(correction.status,"emerald")}${tagHTML(correction.record_id,"violet")}</div></div>
              <div class="record-tail"><strong>${escapeHTML(formatDate(correction.date))}</strong><span>Correction</span></div>
            </button>`).join("")}</div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><p class="label">Release history</p><h2>Public portal evolution</h2></div></div>
          <div class="timeline">
            ${releases.map(([version, date, title, description]) => `<article class="timeline-item"><time>${escapeHTML(date)} · v${escapeHTML(version)}</time><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></article>`).join("")}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><p class="label">Validation state</p><h2>Registry integrity</h2></div></div>
          <div id="validation-report"></div>
        </section>
      </div>`;
  }

  function renderBoundary(data) {
    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Public by design · bounded by design</p>
          <h1 class="gradient-text">Publication Boundary</h1>
          <p>This repository is the public research and independent-review surface. It is not a mirror of the private canonical evidence system, and it is not the dormant commercial workspace.</p>
          <div class="header-links"><a class="button button-primary" href="PUBLICATION_BOUNDARY.md">Read the complete boundary</a><a class="button button-secondary" href="RIGHTS.md">Rights notice</a></div>
        </header>

        <section class="two-column">
          <article class="panel">
            <div class="panel-header"><div><p class="label">Published here</p><h2>Public research surface</h2></div></div>
            <div class="decision-list">
              <div class="decision-item good"><strong>Technical synthesis</strong><span>Public papers, system maps, governance arguments, and falsifiable proof requirements.</span></div>
              <div class="decision-item good"><strong>Evidence discipline</strong><span>Public-safe source, claim, pathway, correction, and decision-state records.</span></div>
              <div class="decision-item good"><strong>Independent review material</strong><span>Primary source links, explicit support boundaries, contribution rules, citation metadata, and version history.</span></div>
            </div>
          </article>
          <article class="panel">
            <div class="panel-header"><div><p class="label">Deliberately excluded</p><h2>Controlled custody</h2></div></div>
            <div class="decision-list">
              <div class="decision-item risk"><strong>Private testimony and records</strong><span>Private exports, access paths, Drive links, identifying records, and case-specific evidence.</span></div>
              <div class="decision-item risk"><strong>Protected implementation detail</strong><span>Mathematics, weights, thresholds, calibration constants, signatures, private graph logic, and deployment validation sequences.</span></div>
              <div class="decision-item risk"><strong>Commercial workspace</strong><span>Pricing, outreach scripts, buyer targeting, offer design, and private commercial planning.</span></div>
            </div>
          </article>
        </section>

        <section class="panel">
          <div class="panel-header"><div><p class="label">Ledger integrity without leakage</p><h2>Restricted records remain visible as restricted placeholders</h2><p>The portal preserves canonical record counts and referential integrity without publishing the substance of restricted sources, claims, or pathways.</p></div></div>
          <div class="metric-grid">
            ${metricCard(data.metadata.counts.sources_restricted, "Restricted source", "Counted, identified as restricted, substance withheld", "SOURCE", "rgba(251,113,133,.17)")}
            ${metricCard(data.metadata.counts.claims_restricted, "Restricted claims", "Placeholder records preserve claim IDs and ledger continuity", "CLAIMS", "rgba(251,113,133,.17)")}
            ${metricCard(data.metadata.counts.pathways_restricted, "Restricted pathways", "Graph integrity preserved without private mechanisms or records", "PATHWAYS", "rgba(251,113,133,.17)")}
            ${metricCard(data.metadata.counts.trunks, "Public trunks", "Sanitized public scopes; protected formulas remain private", "RESEARCH MAP", "rgba(34,211,238,.16)")}
          </div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><p class="label">Authorship and rights</p><h2>Marc Tuinier · MT Tech Industries LLC</h2><p>Digital Dichotomy publications are attributed to Fin Nyx where explicitly marked. Technical, evidentiary, publication, and commercial identities remain connected but functionally separated.</p></div><button class="button button-small" data-copy-citation>Copy citation</button></div>
          <p style="color:var(--muted);font-size:.8rem">${escapeHTML(data.metadata.rights)} Public access does not place the contents in the public domain and does not grant an open-source or open-content license unless a specific file states otherwise.</p>
        </section>
      </div>`;
  }

  function renderRoute(data, route, params) {
    if (route === "overview") return renderOverview(data);
    if (route === "architecture") return renderArchitecture(data, params);
    if (route === "explorer") return renderExplorer(data, params);
    if (route === "sources") return renderRegistry(data, params, "source");
    if (route === "claims") return renderRegistry(data, params, "claim");
    if (route === "pathways") return renderRegistry(data, params, "pathway");
    if (route === "research") return renderResearch(data);
    if (route === "governance") return renderGovernance(data);
    if (route === "history") return renderHistory(data);
    if (route === "boundary") return renderBoundary(data);
    return renderOverview(data);
  }
