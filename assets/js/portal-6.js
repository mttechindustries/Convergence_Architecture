"use strict";

  function renderResearch(data) {
    const papers = [
      {
        title: "The Convergence Architecture",
        status: "Public technical synthesis",
        description: "The full system map: body-as-signal-medium, contactless physiology, silent speech, neural-data security, mobile geometry, distributed RF systems, actuation, adaptive AI, governance, and bounded proof requirements.",
        href: "research/CONVERGENCE_ARCHITECTURE.md",
        tone: "violet"
      },
      {
        title: "Aerial & Ambient Sensing Extension",
        status: "Technical extension",
        description: "UAV optical and radar physiology, signs-of-life products, CSI interpretation, thermal model adaptation, mobile collection, corrected hardware classification, and open integration boundaries.",
        href: "research/AERIAL_AMBIENT_SENSING_EXTENSION.md",
        tone: "cyan"
      },
      {
        title: "Measurement Without Representation",
        status: "Research brief",
        description: "The Representation Gap, Representation Paradox, identity-indeterminate measurement, and why person-level protocol controls fail when the measured person is absent from the namespace.",
        href: "research/REPRESENTATION_GAP.md",
        tone: "amber"
      },
      {
        title: "Protocol Governance",
        status: "Design proposal",
        description: "Device disclosure, space-scoped policy, session attestation, provenance, retention, reassessment, certification, and the honest non-participant adversary boundary.",
        href: "governance/PROTOCOL_GOVERNANCE.md",
        tone: "emerald"
      },
      {
        title: "Evidence Standard",
        status: "Methodology",
        description: "The E0–E7 advancement ladder and the rules preventing component compatibility from impersonating integration, persistence, or intent evidence.",
        href: "evidence/EVIDENCE_STANDARD.md",
        tone: "violet"
      },
      {
        title: "Current Evidence Status",
        status: "Decision snapshot",
        description: "The public state of the architecture as of August 4, 2026, including established component layers and open proof requirements.",
        href: "evidence/CURRENT_STATUS.md",
        tone: "cyan"
      },
      {
        title: "Primary Source Starter",
        status: "Source map",
        description: "Initial patents, papers, standards, institutional records, and explicit boundaries on what each source does and does not support.",
        href: "references/PRIMARY_SOURCE_STARTER.md",
        tone: "emerald"
      },
      {
        title: "Publication Boundary",
        status: "Custody policy",
        description: "The public/private/commercial separation governing what can be independently reviewed and what remains in controlled custody.",
        href: "PUBLICATION_BOUNDARY.md",
        tone: "rose"
      }
    ];

    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Long-form public corpus</p>
          <h1 class="gradient-text">Research Papers</h1>
          <p>The portal is an index and evidence-navigation system. The complete arguments, definitions, caveats, and design proposals remain available as version-controlled research documents.</p>
        </header>
        <section class="paper-grid">
          ${papers.map((paper) => `
            <article class="paper-card">
              ${badgeHTML(paper.status, paper.tone)}
              <h2>${escapeHTML(paper.title)}</h2>
              <p>${escapeHTML(paper.description)}</p>
              <div class="paper-links"><a class="button button-small" href="${escapeHTML(paper.href)}">Open document</a></div>
            </article>`).join("")}
        </section>
        <section class="panel" style="margin-top:18px">
          <div class="panel-header"><div><p class="label">Corpus integrity</p><h2>Every paper is subordinate to the evidence registry</h2><p>The papers synthesize. The source, claim, pathway, correction, and decision records determine what language is supportable at each evidence layer.</p></div></div>
          ${horizontalBarChart(countBy(data.claims.filter((claim) => recordVisibility(claim) === "PUBLIC"), (claim) => highestEvidence(claim.evidence_state)), { order:"key", label:"Public claims by evidence state", colorFor:(key)=>({E0:"#fbbf24",E1:"#a78bfa",E2:"#22d3ee",E3:"#60a5fa",E4:"#34d399"}[key] || "#fb7185") })}
        </section>
      </div>`;
  }

  function renderGovernance() {
    const mechanisms = [
      ["Capability disclosure & active indication", "Declare what a device can sense and visibly indicate when measurement is active. Indicator failure should disable sensing rather than silently remove notice."],
      ["Space-scoped sensing policy", "Attach signed rules to a physical volume: baseline permission, proxy limits, resolution ceilings, retention limits, purpose, authority, and validity."],
      ["Session attestation & provenance", "Bind initiator, purpose, configuration, responder set, proxy relationship, applicable space policy, resolution class, and interval into verifiable records."],
      ["Retention & reassessment", "Limit raw-channel lifetimes, propagate constraints to derived data, verify deletion, and reassess retained records as inference capability changes."]
    ];

    return `
      <div class="view">
        <header class="view-header">
          <p class="label">Design requirements after the Representation Gap</p>
          <h1 class="gradient-text">Protocol Governance</h1>
          <p>Governance remains possible when policy moves away from an unrepresented person and attaches to entities a system can actually address and verify: devices, physical spaces, sessions, and retained records.</p>
          <div class="header-links"><a class="button button-primary" href="governance/PROTOCOL_GOVERNANCE.md">Read the full proposal</a></div>
        </header>
        <div class="visual-frame"><img src="docs/visuals/04-governance-map.svg" alt="Governance map relocating policy to devices, spaces, sessions, and records"></div>
        <section class="definition-grid" style="margin-top:18px">
          ${mechanisms.map(([title, description], index) => `<article class="definition-card"><p class="label">Mechanism ${index + 1}</p><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></article>`).join("")}
        </section>
        <section class="notice" style="margin-top:18px">
          <strong>Honest compliance boundary</strong>
          <p>Protocol governance binds compliant infrastructure operated by identifiable parties. It does not bind a passive external observer executing no protocol. That adversarial tail requires physical or legal remedies and must not be described as solved by protocol design.</p>
        </section>
      </div>`;
  }
