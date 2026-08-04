"use strict";

  function recordDetailHTML(record) {
    const kind = recordKind(record);
    const restricted = recordVisibility(record) === "RESTRICTED";
    const sourceLinks = kind === "claim" ? splitList(record.supporting_sources) : kind === "pathway" ? splitList(record.source_ids) : [];
    const trunks = recordTrunks(record);
    const external = kind === "source" ? safeURL(record.url) : "";
    const common = `
      ${restricted ? `<div class="notice"><strong>Restricted canonical record</strong><p>This placeholder preserves record identity and count without publishing private substance or access paths.</p></div>` : ""}
      <dl class="detail-grid">
        ${detailField("Record ID", recordId(record))}
        ${detailField("Evidence", recordEvidence(record))}
        ${detailField("Visibility", recordVisibility(record))}
        ${trunks.length ? detailField("Research trunks", linkedRecordsHTML(trunks, "trunk"), true) : ""}
    `;

    if (kind === "source") {
      const claims = linkedClaimsForSource(record.source_id);
      const pathways = linkedPathwaysForSource(record.source_id);
      return `${common}
        ${detailField("Title", record.title)}
        ${detailField("Type", record.type)}
        ${detailField("Author / organization", record.author_org)}
        ${detailField("Date", formatDate(record.date))}
        ${detailField("Key contribution", record.key_contribution)}
        ${detailField("Reliability and boundary notes", record.reliability_notes)}
        ${detailField("Access status", record.access_status)}
        ${detailField("Status", record.status)}
        ${detailField("Linked claims", linkedRecordsHTML(claims.map((item) => item.claim_id), "claim"), true)}
        ${detailField("Linked pathways", linkedRecordsHTML(pathways.map((item) => item.path_id), "pathway"), true)}
        ${external ? detailField("Source", `<a class="button button-small" href="${escapeHTML(external)}" target="${external.startsWith("http") ? "_blank" : "_self"}" rel="noopener noreferrer">Open source ↗</a>`, true) : ""}
      </dl>`;
    }

    if (kind === "claim") {
      return `${common}
        ${detailField("Claim", record.claim)}
        ${detailField("Claim class", record.claim_class)}
        ${detailField("Confidence", record.confidence)}
        ${detailField("Supporting sources", linkedRecordsHTML(sourceLinks, "source"), true)}
        ${detailField("Boundary or counterevidence", record.boundary_or_counterevidence)}
        ${detailField("Deployment status", record.deployment_status)}
        ${detailField("Intent status", record.intent_status)}
        ${detailField("Next action", record.next_action)}
        ${detailField("Status", record.status)}
      </dl>`;
    }

    if (kind === "pathway") {
      return `${common}
        ${detailField("Pathway", record.path_name)}
        ${detailField("Source trunk", record.source_trunk)}
        ${detailField("Target trunk", record.target_trunk)}
        ${detailField("Mechanism", record.physical_or_digital_mechanism)}
        ${detailField("Required infrastructure", record.required_infrastructure)}
        ${detailField("Reachability", record.reachability)}
        ${detailField("Supporting sources", linkedRecordsHTML(sourceLinks, "source"), true)}
        ${detailField("Known constraints", record.known_constraints)}
        ${detailField("Integration question", record.integration_question)}
        ${detailField("Test or record needed", record.test_or_record_needed)}
        ${detailField("Status", record.status)}
      </dl>`;
    }

    if (kind === "trunk") {
      const claims = state.data.claims.filter((claim) => recordTrunks(claim).includes(record.trunk_id));
      const pathways = state.data.pathways.filter((pathway) => recordTrunks(pathway).includes(record.trunk_id));
      return `${common}
        ${detailField("Name", record.name)}
        ${detailField("Scope", record.scope)}
        ${detailField("Primary question", record.primary_question)}
        ${detailField("Boundary notes", record.boundary_notes)}
        ${detailField("Status", record.status)}
        ${detailField("Connected claims", linkedRecordsHTML(claims.map((item) => item.claim_id), "claim"), true)}
        ${detailField("Connected pathways", linkedRecordsHTML(pathways.map((item) => item.path_id), "pathway"), true)}
      </dl>`;
    }

    return `${common}</dl>`;
  }

  function openRecord(id, options = {}) {
    const record = state.data.recordsById[id];
    if (!record) return;
    state.drawerReturnFocus = document.activeElement;
    $("#drawer-kicker").textContent = `${recordKind(record).toUpperCase()} · ${recordId(record)}`;
    $("#drawer-title").textContent = recordTitle(record);
    $("#drawer-content").innerHTML = `
      <div class="badge-row" style="margin-bottom:14px">${recordTags(record)}</div>
      ${recordDetailHTML(record)}
      <div class="detail-links" style="margin-top:18px">
        <button type="button" data-copy-record-link>Copy record link</button>
        <button type="button" data-copy-record-json>Copy record JSON</button>
      </div>`;
    $("#record-drawer").classList.add("is-open");
    $("#record-drawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".drawer-panel").focus?.();

    $$('[data-drawer-link]', $("#drawer-content")).forEach((button) => button.addEventListener("click", () => openRecord(button.dataset.drawerLink, { updateURL: true })));
    $("[data-copy-record-link]", $("#drawer-content")).addEventListener("click", () => copyText(recordURL(id), "Record link copied"));
    $("[data-copy-record-json]", $("#drawer-content")).addEventListener("click", () => copyText(JSON.stringify(record, null, 2), "Record JSON copied"));

    if (options.updateURL !== false) {
      const { route, params } = parseHash();
      params.set("record", id);
      window.history.pushState({}, "", makeHash(route, params));
    }
  }

  function openCorrection(id) {
    const correction = state.data.corrections.find((item) => item.correction_id === id);
    if (!correction) return;
    state.drawerReturnFocus = document.activeElement;
    $("#drawer-kicker").textContent = `CORRECTION · ${correction.correction_id}`;
    $("#drawer-title").textContent = correction.summary;
    $("#drawer-content").innerHTML = `
      <dl class="detail-grid">
        ${detailField("Date", formatDate(correction.date))}
        ${detailField("Affected record", linkedRecordsHTML([correction.record_id], "record"), true)}
        ${detailField("Original statement", correction.original_statement)}
        ${detailField("Corrected statement", correction.corrected_statement)}
        ${detailField("Evidence sources", linkedRecordsHTML(splitList(correction.evidence_sources), "source"), true)}
        ${detailField("Status", correction.status)}
      </dl>`;
    $("#record-drawer").classList.add("is-open");
    $("#record-drawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $$('[data-drawer-link]', $("#drawer-content")).forEach((button) => button.addEventListener("click", () => openRecord(button.dataset.drawerLink)));
  }

  function recordURL(id) {
    const url = new URL(window.location.href);
    const { route, params } = parseHash();
    params.set("record", id);
    url.hash = makeHash(route, params);
    return url.toString();
  }

  function closeDrawer(options = {}) {
    const drawer = $("#record-drawer");
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (options.updateURL !== false) {
      const { route, params } = parseHash();
      params.delete("record");
      window.history.replaceState({}, "", makeHash(route, params));
    }
    if (options.restoreFocus !== false && state.drawerReturnFocus instanceof HTMLElement) state.drawerReturnFocus.focus();
  }
