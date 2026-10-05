IB.page = function () {
  const app = IB.qs("#app");
  let subjectId = IB.param("subject") || "econ";
  if (!IB.subjects[subjectId]) subjectId = "econ";
  let topicId = IB.param("topic");

  app.innerHTML = `<h1 style="margin-bottom:.2em">Topic notes</h1>
    <p class="muted" style="margin-top:0">Concepts, key terms, exam skills and worked examples for every syllabus topic. Download any topic or the whole subject.</p>
    <div class="subject-tabs" id="subTabs"></div>
    <div class="notes-layout"><aside class="side card" id="side"></aside><section id="content"></section></div>`;

  const hlOn = () => { try { return localStorage.getItem("ibrev:hl") !== "0"; } catch (e) { return true; } };
  const go = (sid, tid) => {
    subjectId = sid;
    topicId = tid || null;
    history.replaceState(null, "", `krevisionnotes.html?subject=${sid}${tid ? "&topic=" + tid : ""}`);
    render();
    window.scrollTo({ top: 0 });
  };

  function render() {
    const s = IB.subjects[subjectId];
    const data = IB.store.get();
    document.body.style.setProperty("--c", s.color);
    IB.qs("#subTabs").innerHTML = IB.subjectList()
      .map((x) => `<button data-s="${x.id}" class="${x.id === subjectId ? "active" : ""}" style="--c:${x.color}">${x.name}</button>`)
      .join("");
    IB.qsa("#subTabs button").forEach((b) => (b.onclick = () => go(b.dataset.s)));

    // sidebar grouped by unit
    let side = `<a href="#" data-t="" class="btn small" style="width:100%;margin-bottom:10px;justify-content:center">${s.name} overview</a>`;
    let unit = "";
    s.topics.forEach((t) => {
      if (t.unit !== unit) {
        if (unit) side += "</ul>";
        unit = t.unit;
        side += `<div class="small muted" style="font-weight:700;margin:12px 4px 4px">${IB.esc(unit)}</div><ul class="topic-list">`;
      }
      side += `<li><a href="#" data-t="${t.id}" class="${t.id === topicId ? "active" : ""}"><span class="code">${IB.esc(t.code)}</span><span>${IB.esc(t.title)}</span>${data.read[t.id] ? '<span class="done" title="Revised">✓</span>' : ""}</a></li>`;
    });
    side += "</ul>";
    IB.qs("#side").innerHTML = side;
    IB.qsa("#side a").forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(subjectId, a.dataset.t); }));

    const t = topicId ? s.topics.find((x) => x.id === topicId) : null;
    t ? renderTopic(s, t, data) : renderOverview(s, data);
  }

  function legend() {
    return `<div class="legend">${IB.CALLOUTS.map(([k, title, d]) => `<div class="callout ${k} mini"><strong class="callout-title">${title}</strong><span class="small">${d}</span></div>`).join("")}</div>`;
  }

  function renderOverview(s, data) {
    const c = IB.qs("#content");
    const read = s.topics.filter((t) => data.read[t.id]).length;
    const gp = s.gameplan;
    let unit = "", n = 0;
    const topicCards = s.topics.map((t) => {
      n++;
      const head = t.unit !== unit ? ((unit = t.unit), `<div class="unit-label">${IB.esc(t.unit)}</div>`) : "";
      const m = IB.mastery(t.id, data);
      return `${head}<a href="#" data-t="${t.id}" class="topic-card" data-reveal style="--c:${s.color}">
        <span class="topic-num">${String(n).padStart(2, "0")}</span>
        <span class="topic-card-body"><span class="mono small muted">${IB.esc(t.code)}</span><strong>${IB.esc(t.title)}</strong><span class="small muted">${t.summary}</span></span>
        <span class="topic-card-meta">${data.read[t.id] ? '<span class="pill good">✓ revised</span>' : ""}${m !== null ? `<span class="pill">${m}%</span>` : ""}</span>
      </a>`;
    }).join("");
    c.innerHTML = `<div class="subject-hero" style="--c:${s.color}" data-reveal>
      <span class="eyebrow">${IB.esc(s.guide)}</span>
      <h1>${s.name} revision notes</h1>
      <div class="chip-row">${s.topics.slice(0, 12).map((t) => `<a href="#" data-t="${t.id}" class="chip">${IB.esc(t.title)}</a>`).join("")}${s.topics.length > 12 ? `<span class="chip">+${s.topics.length - 12} more</span>` : ""}</div>
      <div class="hero-progress"><div class="bar"><span style="width:${IB.pct(read, s.topics.length)}%"></span></div><span class="small">${read}/${s.topics.length} topics revised</span></div>
      <div class="btn-row no-print"><button class="btn mark" id="dlAll">⬇ PDF: all notes</button><button class="btn" id="dlAllQ">⬇ PDF: notes + practice paper</button><button class="btn" id="dlHtml">⬇ HTML version</button></div>
    </div>
    <h2>How to read these notes</h2>
    ${legend()}
    ${gp ? `<h2>Exam game plan</h2>
    <div class="card" data-reveal><p style="margin-top:0">${gp.intro}</p>
      <div class="table-wrap"><table class="compare"><tr><th>Part</th><th>What it looks like</th><th>Strategy</th></tr>${gp.rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div></div>
    ${gp.codes ? `<section class="callout tip" data-reveal><h3 class="callout-title">How the markscheme gives marks</h3><div class="table-wrap"><table class="compare"><tr><th>Code</th><th>Meaning</th><th>What it means for you</th></tr>${gp.codes.map((r) => `<tr><th scope="row" class="mono">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div></section>` : ""}
    <section class="callout method" data-reveal><h3 class="callout-title">Habits of 7-scorers</h3><ol class="habits">${gp.habits.map((h) => `<li>${h}</li>`).join("")}</ol></section>
    ${gp.extra ? `<section class="callout formula" data-reveal><h3 class="callout-title">${gp.extra.title}</h3><div class="table-wrap">${gp.extra.html}</div></section>` : ""}` : ""}
    <h2>Assessment overview</h2>
    <div class="card" data-reveal><div class="table-wrap"><table class="compare"><tr><th>Component</th><th>Time</th><th>Marks</th><th>Weight</th><th>Format</th></tr>
      ${s.assessment.map((r) => `<tr>${r.map((x, i) => (i ? `<td>${x}</td>` : `<th scope="row">${x}</th>`)).join("")}</tr>`).join("")}</table></div>
      <p class="small muted">Always confirm details against the current IB subject guide - assessment details can change between sessions.</p></div>
    <h2>Command terms</h2>
    <div class="card" data-reveal><dl>${s.commandTerms.map(([k, v]) => `<div class="keyterm"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div>
    <h2>Topics</h2>
    <div class="topic-cards">${topicCards}</div>`;
    IB.qsa("#content a[data-t]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    const dl = (withQ) => {
      const body = `<h1>${s.name} - Revision notes</h1><p class="meta">${s.guide}</p>` + s.topics.map((t) => IB.topicHtml(t, { questions: withQ })).join('<div class="page-break"></div>');
      IB.download(`IB-${s.short.replace(/\s+/g, "-")}-notes${withQ ? "-with-questions" : ""}.html`, IB.standaloneDoc(`${s.name} notes`, body));
    };
    const pdfAll = (btn, n) => {
      btn.disabled = true;
      IB.pdfNotes({ subject: s.id, topics: s.topics, questions: n }).catch(() => {}).finally(() => (btn.disabled = false));
    };
    IB.qs("#dlAll").onclick = (e) => pdfAll(e.currentTarget, 0);
    IB.qs("#dlAllQ").onclick = (e) => pdfAll(e.currentTarget, 3);
    IB.qs("#dlHtml").onclick = () => dl(true);
    IB.math(c);
    IB.animate(c);
  }

  function renderTopic(s, t, data) {
    const c = IB.qs("#content");
    const idx = s.topics.indexOf(t);
    const prev = s.topics[idx - 1], next = s.topics[idx + 1];
    const m = IB.mastery(t.id, data);
    const sections = IB.topicSections(t);
    const nQ = IB.topicQuestions(t.id).length;
    c.innerHTML = `<div class="topic-banner" style="--c:${s.color}" data-reveal>
      <span class="topic-big-num">${String(idx + 1).padStart(2, "0")}</span>
      <div class="topic-banner-body">
        <div class="btn-row"><span class="eyebrow">${IB.esc(t.unit)}</span>${m !== null ? `<span class="pill ${m >= 70 ? "good" : m >= 40 ? "warn" : "bad"}">Mastery ${m}%</span>` : ""}</div>
        <h1><span class="code">${IB.esc(t.code)}</span>${IB.esc(t.title)}</h1>
        <p>${t.summary}</p>
      </div>
    </div>
    <div class="btn-row no-print" style="margin:14px 0">
      <button class="btn ${data.read[t.id] ? "" : "primary"}" id="readBtn">${data.read[t.id] ? "✓ Revised" : "Mark as revised"}</button>
      <a class="btn" href="practice.html?subject=${s.id}&topic=${t.id}">Quiz this topic</a>
      <a class="btn" href="tutor.html?subject=${s.id}&topic=${t.id}">Ask the AI tutor</a>
      <button class="btn mark" id="dlTopic">⬇ PDF notes</button>
      <button class="btn" id="dlTopicQ">⬇ PDF + practice paper</button>
      <button class="btn" id="dlSheet">⬇ Worksheet</button>
      <button class="btn ${hlOn() ? "on" : ""}" id="hlBtn" aria-pressed="${hlOn()}">🖍 Highlights</button>
      <button class="btn" id="printBtn">Print</button>
    </div>
    <div class="hl-legend no-print ${hlOn() ? "" : "hidden"}">${IB.highlightKey()}</div>
    <nav class="jumpbar no-print" aria-label="Jump to section" style="--c:${s.color}">
      ${sections.map(([id, label]) => `<a href="#sec-${id}" class="jump ${id}">${label}</a>`).join("")}<a href="#sec-practice" class="jump practice">Practice · ${nQ}${IB.hasGenerator(t.id) ? "+∞" : ""}</a>
    </nav>
    <div class="topic-sections ${hlOn() ? "" : "hl-off"}" style="--c:${s.color}">${sections.map((x) => x[2]).join("")}
      <section class="card topic-bank" id="sec-practice" data-reveal>
        <div class="tb-head"><div><span class="eyebrow">Question bank</span><h3>${nQ} questions on ${IB.esc(t.title)}</h3></div>
          <div class="btn-row no-print">${IB.hasGenerator(t.id) ? '<button class="btn primary small" id="genBtn">+ Fresh calculation</button>' : ""}<a class="btn small" href="questionbank.html?subject=${s.id}&topic=${t.id}">Open in question bank</a><a class="btn small" href="practice.html?subject=${s.id}&topic=${t.id}">Timed quiz</a></div></div>
        <div class="sec-tabs no-print" id="secTabs" role="tablist"></div>
        <p class="small muted" id="secDesc"></p>
        <div id="practiceList"></div>
        <div class="btn-row no-print" style="justify-content:center;margin-top:12px"><button class="btn" id="moreBtn">Show more</button></div>
      </section>
    </div>
    <div class="btn-row no-print" style="justify-content:space-between;margin-top:16px">
      ${prev ? `<a class="btn" href="#" data-t="${prev.id}">← ${IB.esc(prev.title)}</a>` : "<span></span>"}
      ${next ? `<a class="btn primary" href="#" data-t="${next.id}">${IB.esc(next.title)} →</a>` : ""}
    </div>`;

    IB.qsa(".jumpbar a", c).forEach((a) => (a.onclick = (e) => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute("href"));
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: "smooth" });
    }));
    const list = IB.qs("#practiceList");
    const groups = IB.topicSections2(t.id);
    const done = {};
    data.attempts.forEach((a) => (done[a.id] = true));
    let cur = groups[0], shown = 0;
    const PAGE = 8;
    const more = IB.qs("#moreBtn");
    const showMore = () => {
      cur.qs.slice(shown, shown + PAGE).forEach((q, i) => {
        const card = IB.renderQuestion(q, { number: shown + i + 1, showTopic: false });
        card.classList.add("pop-in");
        list.appendChild(card);
      });
      shown = Math.min(cur.qs.length, shown + PAGE);
      more.textContent = `Show more (${cur.qs.length - shown} left)`;
      more.classList.toggle("hidden", shown >= cur.qs.length);
      IB.math(list);
    };
    const pick = (g) => {
      cur = g;
      shown = 0;
      list.innerHTML = "";
      IB.qsa("#secTabs button").forEach((b) => b.classList.toggle("active", b.dataset.k === g.k));
      IB.qs("#secDesc").textContent = g.desc;
      showMore();
    };
    IB.qs("#secTabs").innerHTML = groups.map((g) => {
      const n = g.qs.filter((q) => done[q.id]).length;
      return `<button role="tab" data-k="${g.k}" class="sec-tab k-${g.k}"><span>${IB.esc(g.name)}</span><span class="sec-count">${n ? `${n}/` : ""}${g.qs.length}</span><span class="sec-bar" style="--p:${Math.round((100 * n) / g.qs.length)}%"></span></button>`;
    }).join("");
    IB.qsa("#secTabs button").forEach((b) => (b.onclick = () => pick(groups.find((g) => g.k === b.dataset.k))));
    more.onclick = showMore;
    if (groups.length) pick(groups[0]);
    const gen = IB.qs("#genBtn");
    if (gen) gen.onclick = () => {
      const q = IB.generate(t.id);
      const card = IB.renderQuestion(q, { showTopic: false });
      card.classList.add("pop-in");
      list.prepend(card);
      IB.math(card);
    };
    IB.qsa("a[data-t]", c).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    IB.qs("#readBtn").onclick = (e) => {
      const was = IB.store.get().read[t.id];
      IB.markRead(t.id, !was);
      if (!was) IB.celebrate(e.currentTarget);
      setTimeout(render, was ? 0 : 450);
    };
    const pdf = (btn, n) => {
      btn.disabled = true;
      IB.pdfNotes({ subject: s.id, topics: [t], questions: n }).catch(() => {}).finally(() => (btn.disabled = false));
    };
    IB.qs("#dlTopic").onclick = (e) => pdf(e.currentTarget, 0);
    IB.qs("#dlTopicQ").onclick = (e) => pdf(e.currentTarget, 12);
    IB.qs("#dlSheet").onclick = () => IB.download(`IB-${s.short.replace(/\s+/g, "-")}-${t.title.replace(/[^\w]+/g, "-")}-worksheet.html`, IB.standaloneDoc(`${t.title} worksheet`, `<h1>${IB.esc(s.name)}: ${IB.esc(t.title)}</h1>` + IB.worksheetHtml(t.questions.filter((q) => !q.derived), "Worksheet")));
    IB.qs("#hlBtn").onclick = (e) => {
      const on = !hlOn();
      try { localStorage.setItem("ibrev:hl", on ? "1" : "0"); } catch (err) { /* ignore */ }
      e.currentTarget.classList.toggle("on", on);
      e.currentTarget.setAttribute("aria-pressed", on);
      IB.qs(".topic-sections", c).classList.toggle("hl-off", !on);
      IB.qs(".hl-legend", c).classList.toggle("hidden", !on);
    };
    IB.qs("#printBtn").onclick = () => {
      IB.qsa("details").forEach((d) => (d.open = true));
      IB.print();
    };
    IB.math(c);
    IB.highlight(IB.qs(".topic-sections", c), { terms: (t.terms || []).map((x) => x[0]) });
    marker(c);
    IB.animate(c);
  }

  // Highlights "draw on" like a marker pen as each section scrolls into view.
  function marker(root) {
    const secs = IB.qsa(".topic-sections > section, .topic-sections > .callout", root);
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return secs.forEach((x) => x.classList.add("lit"));
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("lit"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -15% 0px" });
    secs.forEach((x) => io.observe(x));
  }

  render();
};
