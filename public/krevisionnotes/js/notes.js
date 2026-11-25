IB.page = function () {
  const app = IB.qs("#app");
  let subjectId = IB.param("subject");
  if (!IB.subjectList().some((x) => x.id === subjectId)) subjectId = null; // no subject chosen yet -> show the subject chooser
  let topicId = IB.param("topic");

  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* ignore */ } return null; };
  const hlOn = () => store("ibrev:hl") !== "0";
  let sideOpen = store("ibrev:sideOpen") !== "0";
  if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) sideOpen = false;
  // Sidebar units are an accordion: only one unit is expanded at a time.
  let openUnit = null;
  const unitOfTopic = (sid, tid) => { const t = tid && IB.subjects[sid] && IB.subjects[sid].topics.find((x) => x.id === tid); return t ? t.unit : null; };
  openUnit = unitOfTopic(subjectId, topicId);

  const go = (sid, tid) => {
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
      sideOpen = false;
      store("ibrev:sideOpen", "0");
    }
    subjectId = sid;
    topicId = tid || null;
    openUnit = unitOfTopic(sid, tid);                     // collapse everything except the unit of the topic you open
    history.replaceState(null, "", sid ? `notes.html?subject=${sid}${tid ? "&topic=" + tid : ""}` : "notes.html");
    render();
    window.scrollTo({ top: 0 });
  };

  // ---------- step 1: choose a subject ----------
  function renderChooser() {
    const prefs = IB.getPrefs();
    const subs = IB.subjectList();
    const mine = prefs ? subs.filter((x) => prefs.subjects.includes(x.id)) : subs;
    const rest = prefs ? subs.filter((x) => !prefs.subjects.includes(x.id)) : [];
    const card = (x) => `<a href="#" class="card subject-card" data-s="${x.id}" style="--c:${x.color}" data-reveal>
      <div class="stripe"></div>
      <div class="body">
        <div class="sc-top"><span class="sc-mono">${IB.subjectIcon(x.id, 28)}</span><span class="pill">${IB.levelOf(x.id)}</span></div>
        <div class="subject-card-copy"><h3>${IB.esc(x.baseName)}</h3><span class="subject-topic-count">${x.topics.length} topics</span></div>
        <span class="subject-card-open">Open notes <span aria-hidden="true">→</span></span>
      </div></a>`;
    app.innerHTML = `<section class="notes-welcome" data-reveal>
        <div class="eyebrow">IB DIPLOMA PROGRAMME</div>
        <h1>Revision notes</h1>
        <p>Choose a subject to browse clear, structured notes by topic.</p>
      </section>
      <section class="subject-library" aria-label="Subjects">
        <div class="library-heading"><h2>${prefs ? "Your subjects" : "All subjects"}</h2><span>${mine.length + rest.length} subjects</span></div>
        <div class="subject-grid">${mine.map(card).join("")}</div>
        ${rest.length ? `<div class="library-heading other-heading"><h2>Other subjects</h2></div><div class="subject-grid">${rest.map(card).join("")}</div>` : ""}
      </section>`;
    IB.qsa("[data-s]", app).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(a.dataset.s); }));
    IB.animate(app);
  }

  // ---------- step 2: notes for one subject ----------
  // ---------- search (filters the topic list and the cards of the open topic) ----------
  let query = "";
  const isZh = () => subjectId === "chia";
  const plain = (h) => String(h || "").replace(/<[^>]+>/g, " ").toLowerCase();
  const textCache = {};
  const topicText = (t) => textCache[t.id] || (textCache[t.id] = plain([t.code, t.title, t.summary, ...(t.concepts || []).map((c) => (c.g || "") + " " + c.h + " " + c.b), ...(t.terms || []).map((x) => x.join(" "))].join(" ")));
  const topicMatches = (t) => !query || topicText(t).indexOf(query) !== -1;
  function applySearch() {
    const root = IB.qs("#content");
    if (!root) return;
    const cards = IB.qsa(".dcard, .topic-sections > details.fold, .topic-sections > .callout", root);
    let any = false;
    cards.forEach((c) => {
      const hit = !query || plain(c.textContent).indexOf(query) !== -1;
      c.style.display = hit ? "" : "none";
      if (hit) { any = true; if (query && c.tagName === "DETAILS") c.open = true; }
    });
    IB.qsa(".dgroup", root).forEach((g) => { g.style.display = IB.qsa(".dcard", g).some((c) => c.style.display !== "none") ? "" : "none"; });
    let hint = IB.qs("#emptyHint", root);
    if (cards.length && !any) {
      if (!hint) { hint = document.createElement("div"); hint.id = "emptyHint"; hint.className = "empty-hint"; root.appendChild(hint); }
      hint.textContent = isZh() ? "找不到符合的內容，換個關鍵字試試。" : "No matching content in this topic. Try another keyword.";
      hint.style.display = "block";
    } else if (hint) hint.style.display = "none";
  }

  function renderShell() {
    const zh = isZh();
    app.innerHTML = `<header class="dtop no-print">
        <div class="dbrand">
          <a class="all-subjects-link" href="notes.html" id="allSubjects">All subjects</a>
          <span class="dbrand-divider" aria-hidden="true">/</span>
          <div class="dbrand-copy"><h1 id="barTitle"></h1><span id="barSub">${zh ? "溫習筆記" : "Notes"}</span></div>
        </div>
        <div class="dtools">
          <button type="button" class="mini bar-btn" id="sideShow" aria-controls="side">☷ ${zh ? "主題" : "Topics"}</button>
          <div class="dsearch"><input id="nsearch" type="search" placeholder="${zh ? "搜尋筆記…" : "Search notes…"}" autocomplete="off" aria-label="${zh ? "搜尋筆記" : "Search notes"}"></div>
        </div>
      </header>
      <div class="notes-layout"><aside class="side" id="side" aria-label="Topic navigation"></aside><section id="content" aria-live="polite"></section></div>`;
    query = "";
    IB.qs("#allSubjects").onclick = (e) => { e.preventDefault(); go(null); };
    IB.qs("#sideShow").onclick = () => setSide(true);
    let searchTimer = 0;
    IB.qs("#nsearch").addEventListener("input", (e) => {
      const v = e.target.value.trim().toLowerCase();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        query = v;
        const s = IB.subjects[subjectId];
        if (s) renderSide(s);
        applySearch();
      }, 120);
    });
  }
  function setSide(open) { sideOpen = open; store("ibrev:sideOpen", open ? "1" : "0"); applySide(); }
  function applySide() {
    const lay = IB.qs(".notes-layout");
    if (!lay) return;
    lay.classList.toggle("collapsed", !sideOpen);
    const narrow = window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
    lay.classList.toggle("mobile-side-open", !!(narrow && sideOpen));
    const b = IB.qs("#sideShow");
    if (b) { b.hidden = sideOpen; b.setAttribute("aria-expanded", String(sideOpen)); }
  }

  function renderSide(s) {
    const active = s.topics.find((x) => x.id === topicId);
    const units = [];
    s.topics.filter(topicMatches).forEach((t) => { let u = units[units.length - 1]; if (!u || u.name !== t.unit) units.push((u = { name: t.unit, items: [], paper: t.paper || null })); u.items.push(t); });
    const anyPaper = s.topics.some((t) => t.paper);
    const coreLabel = isZh() ? "CORE · 通用基礎" : "CORE";
    let side = `<div class="side-top"><a href="#" data-t="" class="btn small side-overview">${IB.esc(s.name)} overview</a>
      <button type="button" class="btn small side-collapse" id="sideHide" title="Collapse topics panel" aria-label="Collapse topics panel">«</button></div>`;
    let lastPaper;
    units.forEach((u, i) => {
      const paperLabel = anyPaper ? (u.paper || coreLabel) : null;
      if (paperLabel && paperLabel !== lastPaper) { side += `<div class="nav-paper">${IB.esc(paperLabel)}</div>`; lastPaper = paperLabel; }
      const shut = !query && openUnit !== u.name;
      const has = !!active && active.unit === u.name;
      side += `<div class="unit ${shut ? "shut" : ""} ${has ? "has-active" : ""}" data-u="${i}">
        <button type="button" class="unit-head" aria-expanded="${!shut}"><span class="chev" aria-hidden="true">▾</span><span>${IB.esc(u.name)}</span><span class="unit-n">${u.items.length}</span></button>
        <div class="unit-body"><ul class="topic-list">${u.items.map((t) => `<li><a href="#" data-t="${t.id}" class="${t.id === topicId ? "active" : ""}"${t.id === topicId ? ' aria-current="page"' : ""}><span class="code">${IB.esc(t.code)}</span><span>${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</span></a></li>`).join("")}</ul></div>
      </div>`;
    });
    const el = IB.qs("#side");
    const keep = el.scrollTop;
    el.innerHTML = side;
    el.scrollTop = keep;
    IB.qsa(".unit-head", el).forEach((h) => (h.onclick = () => {
      const u = h.parentElement, idx = Number(u.dataset.u);
      const wasShut = u.classList.contains("shut");
      openUnit = wasShut ? units[idx].name : null;          // opening one unit closes the others
      IB.qsa(".unit", el).forEach((x) => {
        const shut = openUnit !== units[Number(x.dataset.u)].name;
        x.classList.toggle("shut", shut);
        IB.qs(".unit-head", x).setAttribute("aria-expanded", String(!shut));
      });
    }));
    if (!units.length) el.insertAdjacentHTML("beforeend", `<p class="muted small" style="padding:8px 10px">${isZh() ? "沒有符合的主題" : "No matching topics"}</p>`);
    IB.qs("#sideHide", el).onclick = () => setSide(false);
    IB.qsa("a[data-t]", el).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(subjectId, a.dataset.t); }));
  }

  let shellFor = null;
  function render() {
    if (!subjectId) { shellFor = null; document.body.style.removeProperty("--c"); return renderChooser(); }
    const s = IB.subjects[subjectId];
    document.body.style.setProperty("--c", s.color);
    if (shellFor !== subjectId || !IB.qs("#side")) { renderShell(); shellFor = subjectId; }
    IB.qs("#barTitle").textContent = s.baseName;
    const sb = IB.qs("#nsearch"); if (sb && sb.value.trim().toLowerCase() !== query) sb.value = query;
    applySide();
    renderSide(s);

    const t = topicId ? s.topics.find((x) => x.id === topicId) : null;
    const hidden = !t && topicId ? s.allTopics.find((x) => x.id === topicId) : null;
    if (hidden) {
      IB.qs("#content").innerHTML = `<div class="card" data-reveal style="text-align:center;padding:40px 24px"><span class="ahl-badge">AHL</span><h2 style="margin:.6em 0 .2em">${IB.esc(hidden.code)} ${IB.esc(hidden.title)}</h2><p class="muted">Higher level only.</p>${IB.levelSwitch(s.id, { action: true })}</div>`;
      return;
    }
    t ? renderTopic(s, t) : renderOverview(s);
  }

  function legend() {
    return `<div class="key-row" aria-label="Colour key">${IB.CALLOUTS.map(([k, title, d]) => `<span class="key-chip ${k}" title="${d}">${title}</span>`).join("")}</div>`;
  }

  function overviewTopic(s) {
    return {
      id: `${s.id}-overview`, subject: s.id, code: "OV", unit: "Overview",
      title: `${s.baseName} overview`, summary: `${s.topics.length} topics in ${s.baseName}. ${s.guide}`,
      concepts: [{ h: "Course structure", b: `<p>This overview covers ${IB.esc(s.topics.length)} topics. The selected topics can be included in the same download.</p><ol>${s.topics.map((t) => `<li><strong>${IB.esc(t.code)} — ${IB.esc(t.title)}</strong> <span class="muted">(${IB.esc(t.unit)})</span></li>`).join("")}</ol>` }],
      formulas: [], terms: [], methods: [], traps: [], examples: [], tips: [], questions: [], diagrams: [], skills: []
    };
  }

  function openDownloadPicker(s, currentTopic) {
    const existing = IB.qs("#notesDownloadPicker");
    if (existing) existing.remove();
    const groups = [];
    s.topics.forEach((t) => {
      let group = groups[groups.length - 1];
      if (!group || group.name !== t.unit) groups.push((group = { name: t.unit, items: [] }));
      group.items.push(t);
    });
    const groupMarkup = groups.map((g, i) => `<section class="download-group">
      <label class="download-group-head"><input type="checkbox" data-download-group="${i}"> <strong>${IB.esc(g.name)}</strong><span class="muted small">Select all subtopics</span></label>
      <div class="download-group-items">${g.items.map((t) => `<label class="download-topic-option"><input type="checkbox" data-download-topic="${IB.esc(t.id)}" ${currentTopic && currentTopic.id === t.id ? "checked" : ""}> <span><span class="mono small muted">${IB.esc(t.code)}</span> ${IB.esc(t.title)}</span></label>`).join("")}</div>
    </section>`).join("");
    const modal = IB.el(`<div class="ib-modal download-picker" id="notesDownloadPicker" role="dialog" aria-modal="true" aria-labelledby="downloadPickerTitle">
      <div class="ib-modal-box card download-picker-box">
        <div class="download-picker-heading"><div><h2 id="downloadPickerTitle" style="margin:0">Download notes</h2><p class="muted small" style="margin:.3em 0 0">Choose the overview, individual subtopics, or an entire topic group.</p></div><button class="btn small" type="button" id="closeDownloadPicker" aria-label="Close">Close</button></div>
        <div class="download-picker-options">
          <label class="download-overview-option"><input type="checkbox" id="downloadOverview" ${currentTopic ? "" : "checked"}> <strong>Subject overview</strong><span class="muted small">Course structure and topic index</span></label>
          <label class="download-format-label">File format<select id="downloadFormat"><option value="pdf">PDF</option><option value="html">HTML</option></select></label>
        </div>
        <div class="download-group-list">${groupMarkup}</div>
        <p class="small muted" id="downloadSelectionCount">${currentTopic ? "1 subtopic selected" : "Overview selected"}</p>
        <div class="btn-row" style="justify-content:flex-end"><button class="btn primary" id="buildSelectedDownload" type="button">Download selected</button></div>
      </div></div>`);
    document.body.appendChild(modal);
    const close = () => { modal.remove(); document.removeEventListener("keydown", keydown); };
    const keydown = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", keydown);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    IB.qs("#closeDownloadPicker", modal).onclick = close;
    const groupBoxes = () => IB.qsa("[data-download-group]", modal);
    const topicBoxes = () => IB.qsa("[data-download-topic]", modal);
    const updateSelection = () => {
      groupBoxes().forEach((g) => {
        const items = topicBoxes().filter((x) => groups[Number(g.dataset.downloadGroup)].items.some((t) => t.id === x.dataset.downloadTopic));
        g.checked = items.length > 0 && items.every((x) => x.checked);
        g.indeterminate = items.some((x) => x.checked) && !g.checked;
      });
      const n = topicBoxes().filter((x) => x.checked).length;
      const overview = IB.qs("#downloadOverview", modal).checked;
      IB.qs("#downloadSelectionCount", modal).textContent = `${n} subtopic${n === 1 ? "" : "s"}${overview ? (n ? " + overview" : " selected with overview") : " selected"}`;
    };
    groupBoxes().forEach((g) => g.addEventListener("change", () => {
      const group = groups[Number(g.dataset.downloadGroup)];
      topicBoxes().forEach((x) => { if (group.items.some((t) => t.id === x.dataset.downloadTopic)) x.checked = g.checked; });
      updateSelection();
    }));
    topicBoxes().forEach((x) => x.addEventListener("change", updateSelection));
    IB.qs("#downloadOverview", modal).addEventListener("change", updateSelection);
    updateSelection();
    IB.qs("#buildSelectedDownload", modal).onclick = async (e) => {
      const btn = e.currentTarget;
      const includeOverview = IB.qs("#downloadOverview", modal).checked;
      const format = IB.qs("#downloadFormat", modal).value;
      const picked = topicBoxes().filter((x) => x.checked).map((x) => s.topics.find((t) => t.id === x.dataset.downloadTopic)).filter(Boolean);
      if (!includeOverview && !picked.length) return IB.toast("Select the overview or at least one subtopic.");
      btn.disabled = true;
      btn.textContent = "Preparing…";
      try {
        if (format === "pdf") {
          const selected = (includeOverview ? [overviewTopic(s)] : []).concat(picked);
          await IB.pdfNotes({ subject: s.id, topics: selected, title: picked.length ? `${s.baseName} selected notes` : `${s.baseName} overview` });
        } else {
          const overviewHtml = includeOverview ? `<h1>${IB.esc(s.name)} overview</h1><p>${IB.esc(s.guide)}</p><h2>Topic index</h2><ol>${s.topics.map((t) => `<li>${IB.esc(t.code)} — ${IB.esc(t.title)} <span class="muted">(${IB.esc(t.unit)})</span></li>`).join("")}</ol>` : "";
          const topicsHtml = picked.map((t) => IB.topicHtml(t)).join('<div class="page-break"></div>');
          const subjectFile = s.baseShort.replace(/[^\w-]+/g, "-");
          const file = `IB-${subjectFile}-${picked.length ? "selected-notes" : "overview"}.html`;
          IB.download(file, IB.standaloneDoc(`${s.name} download`, overviewHtml + topicsHtml));
        }
        close();
      } catch (err) {
        IB.toast(err && err.message ? err.message : "The download could not be prepared.");
        btn.disabled = false;
        btn.textContent = "Download selected";
      }
    };
  }

  function renderOverview(s) {
    const c = IB.qs("#content");
    let unit = "", n = 0;
    const topicCards = s.topics.map((t) => {
      n++;
      const head = t.unit !== unit ? ((unit = t.unit), `<div class="unit-label">${IB.esc(t.unit)}</div>`) : "";
      return `${head}<a href="#" data-t="${t.id}" class="topic-card" data-reveal style="--c:${s.color}">
        <span class="topic-num">${String(n).padStart(2, "0")}</span>
        <span class="topic-card-body"><span class="mono small muted">${IB.esc(t.code)}</span><strong>${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</strong><span class="small muted">${t.summary}</span></span>
        <span class="topic-card-arrow" aria-hidden="true">→</span>
      </a>`;
    }).join("");

    c.innerHTML = `<section class="subject-hero" style="--c:${s.color}" data-reveal>
      <div class="subject-hero-top"><span class="eyebrow">${IB.esc(s.guide || "Subject notes")}</span><div class="btn-row level-actions"><span class="lv-badge on-dark">${IB.levelOf(s.id)}</span>${IB.levelSwitch(s.id, { action: true })}</div></div>
      <h1>${IB.esc(s.baseName)}</h1>
      <p class="subject-hero-description">Browse ${s.topics.length} topic notes, arranged by unit.</p>
      <div class="btn-row no-print"><button class="btn mark" id="downloadNotes" type="button">Download notes</button></div>
    </section>
    ${legend()}
    <div class="overview-heading"><div><h2>Topics</h2><p>Choose a topic to open its notes.</p></div><span>${s.topics.length} topics</span></div>
    <div class="topic-cards">${topicCards}</div>
    ${s.commandTerms && s.commandTerms.length ? `<details class="command-terms no-print"><summary>IB command terms</summary><dl>${s.commandTerms.map(([k, v]) => `<div class="keyterm"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></details>` : ""}`;

    IB.qsa("#content a[data-t]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    IB.qs("#downloadNotes").onclick = () => openDownloadPicker(s, null);
    IB.math(c);
    IB.animate(c);
  }

  function renderTopic(s, t) {
    const c = IB.qs("#content");
    const idx = s.topics.indexOf(t);
    const prev = s.topics[idx - 1], next = s.topics[idx + 1];
    const sections = IB.topicSections(t, { notesOnly: true });

    c.innerHTML = `<div class="topic-banner" style="--c:${s.color}" data-reveal>
      <div class="topic-banner-body">
        <div class="btn-row"><span class="eyebrow">${IB.esc(t.unit)}</span>${t.hl ? '<span class="ahl-badge">AHL</span>' : ""}<span class="lv-badge on-dark">${IB.levelOf(s.id)}</span>${IB.levelSwitch(s.id, { action: true })}</div>
        <h1><span class="code">${IB.esc(t.code)}</span>${IB.esc(t.title)}</h1>
        <p>${t.summary}</p>
      </div>
    </div>
    <div class="btn-row no-print topic-actions">
      <button class="btn mark" id="downloadNotes" type="button">Download notes</button>
      <button class="btn ${hlOn() ? "on" : ""}" id="hlBtn" aria-pressed="${hlOn()}">Highlights</button>
      <button class="btn" id="printBtn">Print</button>
    </div>
    <details class="hl-legend no-print ${hlOn() ? "" : "hidden"}"><summary>Highlight key</summary>${IB.highlightKey()}</details>
    <nav class="jumpbar no-print" aria-label="Jump to section" style="--c:${s.color}">
      ${sections.map(([id, label]) => `<a href="#sec-${id}" class="jump ${id}">${label}</a>`).join("")}
    </nav>
    <div class="topic-sections ${hlOn() ? "" : "hl-off"}" style="--c:${s.color}">${sections.map((x) => x[2]).join("")}</div>
    <div class="btn-row no-print topic-pagination">
      ${prev ? `<a class="btn" href="#" data-t="${prev.id}">← ${IB.esc(prev.title)}</a>` : "<span></span>"}
      ${next ? `<a class="btn primary" href="#" data-t="${next.id}">${IB.esc(next.title)} →</a>` : ""}
    </div>`;

    IB.qsa(".jumpbar a", c).forEach((a) => (a.onclick = (e) => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute("href"));
      if (el && el.tagName === "DETAILS") el.open = true;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
    }));
    IB.qsa("a[data-t]", c).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    IB.qs("#downloadNotes").onclick = () => openDownloadPicker(s, t);
    IB.qs("#hlBtn").onclick = (e) => {
      const on = !hlOn();
      try { localStorage.setItem("ibrev:hl", on ? "1" : "0"); } catch (err) { /* ignore */ }
      e.currentTarget.classList.toggle("on", on);
      e.currentTarget.setAttribute("aria-pressed", on);
      IB.qs(".topic-sections", c).classList.toggle("hl-off", !on);
      IB.qs(".hl-legend", c).classList.toggle("hidden", !on);
    };
    IB.qs("#printBtn").onclick = () => {
      IB.qsa("#content details").forEach((d) => (d.open = true));
      IB.print();
    };
    IB.math(c);
    const highlightRoot = IB.qs(".topic-sections", c);
    const applyHighlights = () => {
      if (!highlightRoot || !highlightRoot.isConnected || IB.qs(".topic-sections", c) !== highlightRoot) return;
      IB.highlight(highlightRoot, { terms: (t.terms || []).map((x) => x[0]) });
    };
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(applyHighlights, { timeout: 1200 });
    else window.setTimeout(applyHighlights, 40);
    marker(c);
    IB.animate(c);
    if (IB.scrollSpy) IB.scrollSpy(c);
    applySearch();
  }

  // Highlights "draw on" like a marker pen as each section scrolls into view.
  function marker(root) {
    const secs = IB.qsa(".topic-sections > section, .topic-sections > details, .topic-sections > .callout", root);
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return secs.forEach((x) => x.classList.add("lit"));
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("lit"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -15% 0px" });
    secs.forEach((x) => io.observe(x));
  }

  render();
};