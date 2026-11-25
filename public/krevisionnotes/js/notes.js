/* kRevisionNotes: notes reader. Notes only (no questions, quizzes or progress tracking). */
(function () {
  "use strict";
  const IB = window.IB;
  IB.essayPlansHtml = () => ""; // essay plans are built from questions, so they are not part of the notes
  // Notes only: no worked-example questions, answer templates or essay plans.
  const baseSections = IB.topicSections;
  IB.topicSections = (t, o) => baseSections(t, o).filter((x) => !["examples", "frame", "plans"].includes(x[0]));
  IB.animate = IB.animate || function () {};

  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* ignore */ } return null; };
  const root = document.documentElement;

  /* ---------- reading preferences: theme + text size ---------- */
  const SIZES = [15, 16, 17, 18, 19, 20, 22];
  const prefs = {
    theme: store("kr:theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    size: Math.min(SIZES.length - 1, Math.max(0, Number(store("kr:size") || 2))),
  };
  const applyPrefs = () => {
    root.dataset.theme = prefs.theme;
    root.style.setProperty("--fs", SIZES[prefs.size] + "px");
  };
  applyPrefs();

  IB.page = function () {
    const app = IB.qs("#app");
    let subjectId = IB.param("subject");
    if (!IB.subjectList().some((x) => x.id === subjectId)) subjectId = null;
    let topicId = IB.param("topic");
    let query = "";
    let spy = null;

    const hlOn = () => store("kr:hl") !== "0";
    const isZh = () => subjectId === "chia";
    const plain = (h) => String(h || "").replace(/<[^>]+>/g, " ").toLowerCase();

    const go = (sid, tid, hash) => {
      subjectId = sid;
      topicId = tid || null;
      history.replaceState(null, "", sid ? `notes.html?subject=${sid}${tid ? "&topic=" + tid : ""}` : "notes.html");
      render();
      closeDrawer();
      window.scrollTo({ top: 0 });
    };
    IB.rerender = () => render();

    /* ---------- top bar ---------- */
    function topbar(s) {
      const level = s ? IB.levelSwitch(s.id, { small: true }) : "";
      return `<header class="kbar no-print">
        <button type="button" class="kbtn icon only-narrow" id="menuBtn" aria-label="Open topics" aria-controls="side">☰</button>
        <a class="kbrand" href="index.html"><img src="/imgs/logos/krevisionnotes.png" alt="" width="28" height="28"><span>kRevisionNotes</span></a>
        ${s ? `<a class="kcrumb" href="notes.html" data-home="1" title="All subjects"><span class="kdot"></span>${IB.esc(s.baseName)}</a>${level}` : ""}
        <div class="kspacer"></div>
        ${s ? `<label class="ksearch"><span aria-hidden="true">⌕</span><input id="nsearch" type="search" placeholder="${isZh() ? "搜尋關鍵字…" : "Search these notes…"}" autocomplete="off" aria-label="Search notes"></label>` : ""}
        <div class="ktools">
          <button type="button" class="kbtn icon" id="sizeDown" aria-label="Smaller text" title="Smaller text">A<small>−</small></button>
          <button type="button" class="kbtn icon" id="sizeUp" aria-label="Larger text" title="Larger text">A<small>+</small></button>
          <button type="button" class="kbtn icon" id="themeBtn" aria-label="Toggle light and dark" title="Light / dark">${prefs.theme === "dark" ? "☀" : "☾"}</button>
          ${s ? `<button type="button" class="kbtn" id="dlBtn">Download</button>` : ""}
        </div>
      </header>`;
    }
    function wireBar(s) {
      IB.qs("#themeBtn").onclick = () => { prefs.theme = prefs.theme === "dark" ? "light" : "dark"; store("kr:theme", prefs.theme); applyPrefs(); IB.qs("#themeBtn").textContent = prefs.theme === "dark" ? "☀" : "☾"; };
      const size = (d) => { prefs.size = Math.min(SIZES.length - 1, Math.max(0, prefs.size + d)); store("kr:size", prefs.size); applyPrefs(); };
      IB.qs("#sizeDown").onclick = () => size(-1);
      IB.qs("#sizeUp").onclick = () => size(1);
      const home = IB.qs(".kcrumb");
      if (home) home.onclick = (e) => { e.preventDefault(); go(null); };
      const mb = IB.qs("#menuBtn");
      if (mb) mb.onclick = () => document.body.classList.toggle("drawer-open");
      const dl = IB.qs("#dlBtn");
      if (dl) dl.onclick = () => openDownloadPicker(s, s.topics.find((x) => x.id === topicId) || null);
      const input = IB.qs("#nsearch");
      if (input) {
        let timer = 0;
        input.addEventListener("input", (e) => {
          const v = e.target.value.trim().toLowerCase();
          clearTimeout(timer);
          timer = setTimeout(() => { query = v; renderSide(s); applySearch(); }, 120);
        });
      }
    }
    function closeDrawer() { document.body.classList.remove("drawer-open"); }

    /* ---------- subject chooser ---------- */
    function renderChooser() {
      document.body.dataset.view = "chooser";
      document.body.style.removeProperty("--c");
      const subs = IB.subjectList();
      app.innerHTML = `${topbar(null)}
        <main class="kchooser">
          <h1>Topic notes</h1>
          <p class="klead">Pick a subject to open its notes.</p>
          <div class="ksubjects">${subs.map((x) => `<a href="notes.html?subject=${x.id}" class="ksubject" data-s="${x.id}" style="--c:${x.color}">
            <span class="kicon">${IB.subjectIcon(x.id, 28)}</span>
            <span class="kname">${IB.esc(x.baseName)}</span>
            <span class="kmeta">${IB.levelOf(x.id)} · ${x.topics.length} topics</span>
          </a>`).join("")}</div>
        </main>`;
      IB.qsa("[data-s]", app).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(a.dataset.s); }));
      wireBar(null);
    }

    /* ---------- sidebar ---------- */
    const textCache = {};
    const topicText = (t) => textCache[t.id] || (textCache[t.id] = plain([t.code, t.title, t.summary, ...(t.concepts || []).map((c) => (c.g || "") + " " + c.h + " " + c.b), ...(t.terms || []).map((x) => x.join(" "))].join(" ")));
    const topicMatches = (t) => !query || topicText(t).indexOf(query) !== -1;

    function renderSide(s) {
      const active = s.topics.find((x) => x.id === topicId);
      const units = [];
      s.topics.filter(topicMatches).forEach((t) => { let u = units[units.length - 1]; if (!u || u.name !== t.unit) units.push((u = { name: t.unit, items: [], paper: t.paper || null })); u.items.push(t); });
      const anyPaper = s.topics.some((t) => t.paper);
      let html = `<a href="notes.html?subject=${s.id}" data-t="" class="side-overview ${!topicId ? "active" : ""}">${isZh() ? "總覽" : "Subject overview"}</a>`;
      let lastPaper;
      units.forEach((u) => {
        const label = anyPaper ? (u.paper || (isZh() ? "CORE · 通用基礎" : "CORE")) : null;
        if (label && label !== lastPaper) { html += `<div class="side-paper">${IB.esc(label)}</div>`; lastPaper = label; }
        html += `<div class="side-unit">${IB.esc(u.name)}</div><ul>${u.items.map((t) => `<li><a href="notes.html?subject=${s.id}&topic=${t.id}" data-t="${t.id}" class="${t.id === topicId ? "active" : ""}"${t.id === topicId ? ' aria-current="page"' : ""}><span class="code">${IB.esc(t.code)}</span><span class="ttl">${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</span></a></li>`).join("")}</ul>`;
      });
      if (!units.length) html += `<p class="side-none">${isZh() ? "沒有符合的主題" : "No matching topics"}</p>`;
      const el = IB.qs("#side");
      const keep = el.scrollTop;
      el.innerHTML = html;
      el.scrollTop = keep;
      IB.qsa("a[data-t]", el).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
      const cur = IB.qs("a.active", el);
      if (cur && !query) { const r = cur.getBoundingClientRect(), b = el.getBoundingClientRect(); if (r.top < b.top + 40 || r.bottom > b.bottom - 40) el.scrollTop += r.top - b.top - b.height / 3; }
    }

    /* ---------- search inside the open topic ---------- */
    function applySearch() {
      const c = IB.qs("#content");
      if (!c) return;
      const blocks = IB.qsa(".concept, .dcard, .topic-sections > section", c);
      let any = false;
      blocks.forEach((b) => {
        const hit = !query || plain(b.textContent).indexOf(query) !== -1;
        b.classList.toggle("is-hidden", !hit);
        if (hit) any = true;
      });
      IB.qsa(".dgroup", c).forEach((g) => g.classList.toggle("is-hidden", !IB.qsa(".dcard", g).some((x) => !x.classList.contains("is-hidden"))));
      let hint = IB.qs("#emptyHint", c);
      if (blocks.length && !any) {
        if (!hint) { hint = document.createElement("div"); hint.id = "emptyHint"; hint.className = "empty-hint"; c.appendChild(hint); }
        hint.textContent = isZh() ? "找不到符合的內容，換個關鍵字試試。" : "Nothing in this topic matches. Try another keyword.";
      } else if (hint) hint.remove();
    }

    /* ---------- page frame ---------- */
    let shellFor = null;
    function render() {
      if (!subjectId) { shellFor = null; return renderChooser(); }
      const s = IB.subjects[subjectId];
      document.body.dataset.view = "notes";
      document.body.style.setProperty("--c", s.color);
      if (shellFor !== subjectId + IB.levelOf(subjectId)) {
        query = "";
        app.innerHTML = `${topbar(s)}<div class="kframe"><aside class="kside no-print" id="side" aria-label="Topics"></aside><div class="kscrim" id="scrim"></div><main class="kmain" id="mainArea"><article id="content"></article><nav class="kouter no-print" id="outline" aria-label="On this page"></nav></main></div>`;
        wireBar(s);
        IB.qs("#scrim").onclick = closeDrawer;
        shellFor = subjectId + IB.levelOf(subjectId);
      }
      renderSide(s);
      const t = topicId ? s.topics.find((x) => x.id === topicId) : null;
      const hidden = !t && topicId ? s.allTopics.find((x) => x.id === topicId) : null;
      if (hidden) {
        IB.qs("#content").innerHTML = `<div class="khidden"><span class="ahl-badge">AHL</span><h2>${IB.esc(hidden.code)} ${IB.esc(hidden.title)}</h2><p>This topic is Higher Level only.</p>${IB.levelSwitch(s.id, { action: true })}</div>`;
        IB.qs("#outline").innerHTML = "";
        return;
      }
      t ? renderTopic(s, t) : renderOverview(s);
      document.title = (t ? t.title + " · " : "") + s.baseName + " notes · kRevisionNotes";
    }

    function legend() {
      return `<div class="key-row" aria-label="Colour key">${IB.CALLOUTS.filter((x) => x[0] !== "example").map(([k, title, d]) => `<span class="key-chip ${k}" title="${d}">${title}</span>`).join("")}</div>`;
    }

    function setOutline(items) {
      const o = IB.qs("#outline");
      if (spy) { spy.disconnect(); spy = null; }
      if (!items.length) { o.innerHTML = ""; return; }
      o.innerHTML = `<div class="outline-h">${isZh() ? "本頁內容" : "On this page"}</div>${items.map(([id, label]) => `<a href="#${id}" data-o="${id}">${label}</a>`).join("")}`;
      IB.qsa("a", o).forEach((a) => (a.onclick = (e) => {
        e.preventDefault();
        const el = document.getElementById(a.dataset.o);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: "smooth" });
      }));
      const els = items.map(([id]) => document.getElementById(id)).filter(Boolean);
      if (!("IntersectionObserver" in window)) return;
      const seen = new Map();
      spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = els.find((el) => seen.get(el.id));
        if (first) IB.qsa("a", o).forEach((a) => a.classList.toggle("on", a.dataset.o === first.id));
      }, { rootMargin: "-70px 0px -65% 0px" });
      els.forEach((el) => spy.observe(el));
    }

    /* ---------- subject overview ---------- */
    function renderOverview(s) {
      const c = IB.qs("#content");
      let unit = "", n = 0;
      const topicCards = s.topics.map((t) => {
        n++;
        const head = t.unit !== unit ? ((unit = t.unit), `<h3 class="unit-label">${IB.esc(t.unit)}</h3>`) : "";
        return `${head}<a href="notes.html?subject=${s.id}&topic=${t.id}" data-t="${t.id}" class="topic-card">
          <span class="topic-num">${String(n).padStart(2, "0")}</span>
          <span class="topic-card-body"><span class="tcode">${IB.esc(t.code)}</span><strong>${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</strong><span class="tsum">${t.summary}</span></span>
        </a>`;
      }).join("");
      c.innerHTML = `<div class="subject-hero">
          <span class="eyebrow">${IB.esc(s.guide)}</span>
          <h1>${s.name}</h1>
          <p class="hero-sub">${s.topics.length} topics · ${IB.levelOf(s.id)}</p>
          ${IB.hasHL(s.id) ? `<div class="hero-level">${IB.levelSwitch(s.id, { action: true })}</div>` : ""}
        </div>
        ${legend()}
        <div class="topic-sections ov">
        <section class="panel wide" id="ov-topics"><h2 class="panel-title">Topics</h2><div class="topic-cards">${topicCards}</div></section>
        <section class="panel wide" id="ov-terms"><h2 class="panel-title">Command terms</h2><dl class="terms-grid">${s.commandTerms.map(([k, v]) => `<div class="keyterm"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></section>
        </div>`;
      IB.qsa("a[data-t]", c).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
      const l = [["ov-topics", "Topics"], ["ov-terms", "Command terms"]].filter((x) => document.getElementById(x[0]));
      setOutline(l);
      IB.math(c);
    }

    /* ---------- one topic ---------- */
    function renderTopic(s, t) {
      const c = IB.qs("#content");
      const idx = s.topics.indexOf(t);
      const prev = s.topics[idx - 1], next = s.topics[idx + 1];
      const sections = IB.topicSections(t, { static: true });
      const yue = isZh() ? "" : "";
      c.innerHTML = `<header class="topic-head">
          <div class="topic-meta"><span class="eyebrow">${IB.esc(t.unit)}</span>${t.hl ? '<span class="ahl-badge">AHL · HL only</span>' : ""}<span class="lv">${IB.levelOf(s.id)}</span></div>
          <h1><span class="code">${IB.esc(t.code)}</span>${IB.esc(t.title)}</h1>
          <p class="topic-sum">${t.summary}</p>
          <div class="topic-actions no-print">
            <button class="kbtn ${hlOn() ? "on" : ""}" id="hlBtn" aria-pressed="${hlOn()}">Highlights</button>
            <button class="kbtn" id="printBtn">Print</button>
          </div>
          <details class="hl-legend no-print" ${hlOn() ? "" : "hidden"}><summary>Highlight key</summary>${IB.highlightKey()}</details>
        </header>
        <div class="topic-sections ${hlOn() ? "" : "hl-off"}">${sections.map((x) => x[2]).join("")}</div>
        <nav class="pager no-print" aria-label="Previous and next topic">
          ${prev ? `<a class="pg" href="notes.html?subject=${s.id}&topic=${prev.id}" data-t="${prev.id}"><small>← Previous</small><span>${IB.esc(prev.title)}</span></a>` : "<span></span>"}
          ${next ? `<a class="pg next" href="notes.html?subject=${s.id}&topic=${next.id}" data-t="${next.id}"><small>Next →</small><span>${IB.esc(next.title)}</span></a>` : ""}
        </nav>`;
      IB.qsa("a[data-t]", c).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
      IB.qs("#hlBtn").onclick = (e) => {
        const on = !hlOn();
        store("kr:hl", on ? "1" : "0");
        e.currentTarget.classList.toggle("on", on);
        e.currentTarget.setAttribute("aria-pressed", on);
        IB.qs(".topic-sections", c).classList.toggle("hl-off", !on);
        const lg = IB.qs(".hl-legend", c); lg.hidden = !on;
      };
      IB.qs("#printBtn").onclick = () => IB.print();
      IB.math(c);
      const hr = IB.qs(".topic-sections", c);
      const applyHighlights = () => { if (hr && hr.isConnected) IB.highlight(hr, { terms: (t.terms || []).map((x) => x[0]) }); };
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(applyHighlights, { timeout: 1200 }); else setTimeout(applyHighlights, 40);
      setOutline(sections.map((x) => [x[0] === "concepts" ? "sec-concepts" : "sec-" + x[0], x[1]]).filter((x) => document.getElementById(x[0])));
      applySearch();
    }

    /* ---------- download picker (notes only) ---------- */
    function openDownloadPicker(s, currentTopic) {
      const old = IB.qs("#notesDownloadPicker");
      if (old) old.remove();
      const groups = [];
      s.topics.forEach((t) => { let g = groups[groups.length - 1]; if (!g || g.name !== t.unit) groups.push((g = { name: t.unit, items: [] })); g.items.push(t); });
      const gm = groups.map((g, i) => `<section class="download-group">
        <label class="download-group-head"><input type="checkbox" data-download-group="${i}"> <strong>${IB.esc(g.name)}</strong></label>
        <div class="download-group-items">${g.items.map((t) => `<label class="download-topic-option"><input type="checkbox" data-download-topic="${IB.esc(t.id)}" ${currentTopic && currentTopic.id === t.id ? "checked" : ""}> <span><span class="mono small muted">${IB.esc(t.code)}</span> ${IB.esc(t.title)}</span></label>`).join("")}</div></section>`).join("");
      const modal = IB.el(`<div class="ib-modal" id="notesDownloadPicker" role="dialog" aria-modal="true" aria-labelledby="dlTitle">
        <div class="ib-modal-box">
          <div class="dl-head"><div><h2 id="dlTitle">Download notes</h2><p class="muted small">Choose the overview, single topics or whole units.</p></div><button class="kbtn" type="button" id="closeDl">Close</button></div>
          <div class="dl-opts">
            <label><input type="checkbox" id="downloadOverview" ${currentTopic ? "" : "checked"}> <strong>Subject overview</strong></label>
            <label class="dl-format">Format <select id="downloadFormat"><option value="pdf">PDF</option><option value="html">HTML</option></select></label>
          </div>
          <div class="dl-list">${gm}</div>
          <div class="dl-foot"><span class="small muted" id="dlCount"></span><button class="kbtn primary" id="buildDl" type="button">Download selected</button></div>
        </div></div>`);
      document.body.appendChild(modal);
      const close = () => { modal.remove(); document.removeEventListener("keydown", key); };
      const key = (e) => { if (e.key === "Escape") close(); };
      document.addEventListener("keydown", key);
      modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
      IB.qs("#closeDl", modal).onclick = close;
      const gb = () => IB.qsa("[data-download-group]", modal), tb = () => IB.qsa("[data-download-topic]", modal);
      const upd = () => {
        gb().forEach((g) => { const items = tb().filter((x) => groups[+g.dataset.downloadGroup].items.some((t) => t.id === x.dataset.downloadTopic)); g.checked = items.length > 0 && items.every((x) => x.checked); g.indeterminate = items.some((x) => x.checked) && !g.checked; });
        const n = tb().filter((x) => x.checked).length, ov = IB.qs("#downloadOverview", modal).checked;
        IB.qs("#dlCount", modal).textContent = `${n} topic${n === 1 ? "" : "s"}${ov ? " + overview" : ""} selected`;
      };
      gb().forEach((g) => g.addEventListener("change", () => { const grp = groups[+g.dataset.downloadGroup]; tb().forEach((x) => { if (grp.items.some((t) => t.id === x.dataset.downloadTopic)) x.checked = g.checked; }); upd(); }));
      tb().forEach((x) => x.addEventListener("change", upd));
      IB.qs("#downloadOverview", modal).addEventListener("change", upd);
      upd();
      IB.qs("#buildDl", modal).onclick = async (e) => {
        const btn = e.currentTarget;
        const ov = IB.qs("#downloadOverview", modal).checked;
        const format = IB.qs("#downloadFormat", modal).value;
        const picked = tb().filter((x) => x.checked).map((x) => s.topics.find((t) => t.id === x.dataset.downloadTopic)).filter(Boolean);
        if (!ov && !picked.length) return IB.toast("Select the overview or at least one topic.");
        btn.disabled = true; btn.textContent = "Preparing…";
        try {
          const overviewTopic = { id: `${s.id}-overview`, subject: s.id, code: "OV", unit: "Overview", title: `${s.baseName} overview`, summary: `${s.topics.length} topics in ${s.baseName}. ${s.guide}`,
            concepts: [{ h: "Course structure", b: `<ol>${s.topics.map((t) => `<li><strong>${IB.esc(t.code)} — ${IB.esc(t.title)}</strong> <span class="muted">(${IB.esc(t.unit)})</span></li>`).join("")}</ol>` }],
            formulas: [], terms: [], methods: [], traps: [], examples: [], tips: [], questions: [], diagrams: [], skills: [] };
          if (format === "pdf") {
            await IB.pdfNotes({ subject: s.id, topics: (ov ? [overviewTopic] : []).concat(picked), questions: 0, title: picked.length ? `${s.baseName} selected notes` : `${s.baseName} overview` });
          } else {
            const oh = ov ? `<h1>${IB.esc(s.name)} overview</h1><p>${IB.esc(s.guide)}</p><ol>${s.topics.map((t) => `<li>${IB.esc(t.code)} — ${IB.esc(t.title)}</li>`).join("")}</ol>` : "";
            IB.download(`IB-${s.baseShort.replace(/[^\w-]+/g, "-")}-${picked.length ? "selected-notes" : "overview"}.html`, IB.standaloneDoc(`${s.name} notes`, oh + picked.map((t) => IB.topicHtml(t, {})).join('<div class="page-break"></div>')));
          }
          close();
        } catch (err) {
          IB.toast(err && err.message ? err.message : "The download could not be prepared.");
          btn.disabled = false; btn.textContent = "Download selected";
        }
      };
    }

    render();
  };
})();
