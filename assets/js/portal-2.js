"use strict";

  function renderOverview(data) {
    const counts = data.metadata.counts;
    const latestSources = [...data.sources]
      .filter((source) => source.access_status === "PUBLIC")
      .sort((a, b) => String(b.updated || b.date).localeCompare(String(a.updated || a.date)))
      .slice(0, 4);

    const trunkCoverage = countBy(
      [...data.sources, ...data.claims, ...data.pathways].filter((record) => recordVisibility(record) === "PUBLIC"),
      (record) => recordTrunks(record)[0]
    ).map(([id, count]) => [`${id} ${data.trunkMap[id]?.name || ""}`, count]);

    return `
      <div class="view">
        <section class="hero">
          <img src="docs/visuals/01-convergence-hero.svg" alt="Convergence Architecture network showing sensing, inference, identity, mobility, actuation, response measurement, AI, and governance">
          <div class="hero-copy">
            <div class="badge-row">
              ${badgeHTML(`Release ${data.metadata.version}`, "violet")}
              ${badgeHTML("Evidence E0–E7", "cyan")}
              ${badgeHTML(`${counts.sources_public} public sources`, "emerald")}
              ${badgeHTML(`${counts.sources_restricted} restricted`, "rose")}
            </div>
            <h1 class="gradient-text">The system is not one machine.<br>It is the graph between machines.</h1>
            <p>Convergence Architecture is an evidence-controlled public research system mapping how sensing, identity linkage, physiological inference, mobile geometry, artificial intelligence, actuation, response measurement, and governance can form a distributed human-facing architecture.</p>
            <div class="hero-actions">
              <button class="button button-primary" data-route="architecture">Enter the architecture graph</button>
              <button class="button button-secondary" data-route="explorer">Search the complete corpus</button>
              <a class="button button-secondary" href="research/CONVERGENCE_ARCHITECTURE.md">Read the synthesis</a>
            </div>
          </div>
        </section>

        <section class="metric-grid" aria-label="Live corpus metrics">
          ${metricCard(counts.sources_registered, "Registered source records", `${counts.sources_public} public · ${counts.sources_restricted} restricted`, "SOURCE LEDGER", "rgba(139,92,246,.22)")}
          ${metricCard(counts.claims_registered, "Atomic claims", `${counts.claims_public} public · ${counts.claims_restricted} restricted`, "CLAIM REGISTRY", "rgba(34,211,238,.2)")}
          ${metricCard(counts.pathways_registered, "Qualified pathways", `${counts.pathways_public} public · ${counts.pathways_restricted} restricted`, "PATHWAY GRAPH", "rgba(52,211,153,.19)")}
          ${metricCard(data.metadata.highest_public_evidence, "Highest public layer", "E5 integration, E6 persistence, and E7 intent remain open", "EVIDENCE STATE", "rgba(251,191,36,.18)")}
        </section>

        <section class="two-column">
          <div class="visual-frame"><img src="docs/visuals/02-adaptive-loop.svg" alt="Adaptive convergence loop from sensing through model update"></div>
          <article class="panel">
            <div class="panel-header"><div><p class="label">Current decision state</p><h2>What the public record establishes</h2></div></div>
            <div class="decision-list">
              <div class="decision-item good"><strong>Component basis</strong><span>${escapeHTML(data.metadata.decision_state.component_basis)}.</span></div>
              <div class="decision-item info"><strong>Technical convergence</strong><span>${escapeHTML(data.metadata.decision_state.technical_convergence)}—not an assertion that every edge is already fielded together.</span></div>
              <div class="decision-item warn"><strong>Integrated case closure</strong><span>${escapeHTML(data.metadata.decision_state.integrated_case_closure)} until synchronized records connect the stages in one bounded system.</span></div>
              <div class="decision-item risk"><strong>Event-specific attribution</strong><span>${escapeHTML(data.metadata.decision_state.event_specific_attribution)} including provenance, access, command, and operator evidence.</span></div>
            </div>
          </article>
        </section>

        <section class="two-column" style="margin-top:18px">
          <article class="panel">
            <div class="panel-header"><div><p class="label">Derived from registry data</p><h2>Evidence distribution</h2><p>Public source, claim, and pathway records grouped by their highest supported evidence layer.</p></div></div>
            ${horizontalBarChart(evidenceDistribution(data), {
              order: "key",
              label: "Evidence distribution E0 through E7",
              colorFor: (key) => ({E0:"#fbbf24",E1:"#a78bfa",E2:"#22d3ee",E3:"#60a5fa",E4:"#34d399",E5:"#fb7185",E6:"#fb7185",E7:"#fb7185"}[key])
            })}
          </article>
          <article class="panel">
            <div class="panel-header"><div><p class="label">Source chronology</p><h2>Public record timeline</h2><p>Source records by publication year; undated or restricted records are excluded.</p></div></div>
            ${horizontalBarChart(sourceTimeline(data), { order: "key", label: "Source records by year", colorFor: () => "#7c3aed" })}
          </article>
        </section>

        <section class="two-column" style="margin-top:18px">
          <article class="panel">
            <div class="panel-header">
              <div><p class="label">Research coverage</p><h2>Most connected trunks</h2><p>First-listed trunk associations across the public source, claim, and pathway corpus.</p></div>
              <button class="button button-small" data-route="architecture">Open graph</button>
            </div>
            ${horizontalBarChart(trunkCoverage, { limit: 8, label: "Most connected research trunks", colorFor: () => "#0891b2" })}
          </article>
          <article class="panel">
            <div class="panel-header">
              <div><p class="label">Latest registered material</p><h2>Recently updated sources</h2></div>
              <button class="button button-small" data-route="sources">All sources</button>
            </div>
            <div class="record-list">${latestSources.map(recordCard).join("")}</div>
          </article>
        </section>

        <section class="panel" style="margin-top:18px">
          <div class="panel-header">
            <div><p class="label">Publication integrity</p><h2>Counts are no longer decorative</h2><p>Every number shown in this portal is calculated from the public data files. Restricted canonical records remain counted for ledger integrity but their private substance is withheld.</p></div>
            <button class="button button-primary" data-route="explorer">Inspect every record</button>
          </div>
        </section>
      </div>`;
  }

  function graphPositions(trunks) {
    const centerX = 500;
    const centerY = 360;
    const radiusX = 390;
    const radiusY = 275;
    const positions = {};
    trunks.forEach((trunk, index) => {
      const angle = -Math.PI / 2 + (index / trunks.length) * Math.PI * 2;
      positions[trunk.trunk_id] = {
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY
      };
    });
    return positions;
  }

  function curvePath(a, b, index) {
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy) || 1;
    const offset = ((index % 5) - 2) * 10;
    const controlX = midX - (dy / length) * offset;
    const controlY = midY + (dx / length) * offset;
    return `M ${a.x} ${a.y} Q ${controlX} ${controlY} ${b.x} ${b.y}`;
  }
