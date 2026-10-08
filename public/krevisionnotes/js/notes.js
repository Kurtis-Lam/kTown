IB.page = function () {
  const app = IB.qs("#app");
  let subjectId = IB.param("subject");
  if (!IB.subjects[subjectId]) subjectId = null;      // no subject chosen yet -> show the subject chooser
  let topicId = IB.param("topic");

  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { /* ignore */ } return null; };
  const hlOn = () => store("ibrev:hl") !== "0";
  let sideOpen = store("ibrev:sideOpen") !== "0";
  // Sidebar units are an accordion: all collapsed by default, only one open at a time.
  let openUnit = null;
  const unitOfTopic = (sid, tid) => { const t = tid && IB.subjects[sid] && IB.subjects[sid].topics.find((x) => x.id === tid); return t ? t.unit : null; };
  openUnit = unitOfTopic(subjectId, topicId);

  const go = (sid, tid) => {
    subjectId = sid;
    topicId = tid || null;
    openUnit = unitOfTopic(sid, tid);                     // collapse everything except the unit of the topic you open
    history.replaceState(null, "", sid ? `notes.html?subject=${sid}${tid ? "&topic=" + tid : ""}` : "notes.html");
    render();
    window.scrollTo({ top: 0 });
  };

  // ---------- step 1: choose a subject ----------
  function renderChooser() {
    const data = IB.store.get();
    const prefs = IB.getPrefs();
    const subs = IB.subjectList();
    const mine = prefs ? subs.filter((x) => prefs.subjects.includes(x.id)) : subs;
    const rest = prefs ? subs.filter((x) => !prefs.subjects.includes(x.id)) : [];
    const card = (x) => {
      const read = x.topics.filter((t) => data.read[t.id]).length;
      return `<a href="#" class="card subject-card" data-s="${x.id}" style="--c:${x.color}" data-reveal>
        <div class="stripe"></div>
        <div class="body">
          <div class="sc-top"><span class="sc-mono">${IB.subjectIcon(x.id, 28)}</span><span class="pill">${IB.levelOf(x.id)}</span></div>
          <div><h3>${IB.esc(x.baseName)}</h3><div class="stats">${x.topics.length} topics · ${read}/${x.topics.length} revised</div></div>
          <div class="hero-progress"><div class="bar"><span style="width:${IB.pct(read, x.topics.length)}%"></span></div></div>
        </div></a>`;
    };
    app.innerHTML = `<h1 style="margin-bottom:.2em">Topic notes</h1>
      <p class="muted" style="margin-top:0">Choose a subject to open its revision notes: concepts, key terms, exam skills and worked examples for every syllabus topic.</p>
      <h2 class="chooser-h">${prefs ? "Your subjects" : "All subjects"}</h2>
      <section class="subject-grid">${mine.map(card).join("")}</section>
      ${rest.length ? `<h2 class="chooser-h">Other subjects</h2><section class="subject-grid">${rest.map(card).join("")}</section>` : ""}`;
    IB.qsa("[data-s]", app).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(a.dataset.s); }));
    IB.animate(app);
  }

  // ---------- step 2: notes for one subject ----------
  function renderShell() {
    app.innerHTML = `<div class="notes-bar no-print">
        <button type="button" class="btn small bar-btn" id="sideShow" aria-controls="side" hidden>» Show topics</button>
        <button type="button" class="btn small bar-btn" id="changeSubject">⇄ Change subject</button>
        <span class="notes-bar-title"><span id="barTitle"></span> <span class="lv-badge" id="barLevel"></span></span>
      </div>
      <div class="notes-layout"><aside class="side card" id="side"></aside><section id="content"></section></div>`;
    IB.qs("#sideShow").onclick = () => setSide(true);
    IB.qs("#changeSubject").onclick = () => go(null);
  }
  function setSide(open) { sideOpen = open; store("ibrev:sideOpen", open ? "1" : "0"); applySide(); }
  function applySide() {
    const lay = IB.qs(".notes-layout");
    if (!lay) return;
    lay.classList.toggle("collapsed", !sideOpen);
    const b = IB.qs("#sideShow");
    if (b) { b.hidden = sideOpen; b.setAttribute("aria-expanded", String(sideOpen)); }
  }

  function renderSide(s, data) {
    const active = s.topics.find((x) => x.id === topicId);
    const units = [];
    s.topics.forEach((t) => { let u = units[units.length - 1]; if (!u || u.name !== t.unit) units.push((u = { name: t.unit, items: [] })); u.items.push(t); });
    let side = `<div class="side-top"><a href="#" data-t="" class="btn small side-overview">${IB.esc(s.name)} overview</a>
      <button type="button" class="btn small side-collapse" id="sideHide" title="Collapse topics panel" aria-label="Collapse topics panel">«</button></div>`;
    units.forEach((u, i) => {
      const shut = openUnit !== u.name;
      const has = !!active && active.unit === u.name;
      side += `<div class="unit ${shut ? "shut" : ""} ${has ? "has-active" : ""}" data-u="${i}">
        <button type="button" class="unit-head" aria-expanded="${!shut}"><span class="chev" aria-hidden="true">▾</span><span>${IB.esc(u.name)}</span><span class="unit-n">${u.items.length}</span></button>
        <div class="unit-body"><ul class="topic-list">${u.items.map((t) => `<li><a href="#" data-t="${t.id}" class="${t.id === topicId ? "active" : ""}"${t.id === topicId ? ' aria-current="page"' : ""}><span class="code">${IB.esc(t.code)}</span><span>${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</span>${data.read[t.id] ? '<span class="done" title="Revised">✓</span>' : ""}</a></li>`).join("")}</ul></div>
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
    IB.qs("#sideHide", el).onclick = () => setSide(false);
    IB.qsa("a[data-t]", el).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(subjectId, a.dataset.t); }));
  }

  let shellFor = null;
  function render() {
    if (!subjectId) { shellFor = null; document.body.style.removeProperty("--c"); return renderChooser(); }
    const s = IB.subjects[subjectId];
    const data = IB.store.get();
    document.body.style.setProperty("--c", s.color);
    if (shellFor !== subjectId || !IB.qs("#side")) { renderShell(); shellFor = subjectId; }
    IB.qs("#barTitle").textContent = s.baseName;
    IB.qs("#barLevel").textContent = IB.levelOf(s.id);
    applySide();
    renderSide(s, data);

    const t = topicId ? s.topics.find((x) => x.id === topicId) : null;
    const hidden = !t && topicId ? s.allTopics.find((x) => x.id === topicId) : null;
    if (hidden) {
      IB.qs("#content").innerHTML = `<div class="card" data-reveal style="text-align:center;padding:40px 24px"><span class="ahl-badge">AHL · HL only</span><h2 style="margin:.6em 0 .2em">${IB.esc(hidden.code)} ${IB.esc(hidden.title)}</h2><p class="muted">This topic is part of the higher level course. Switch ${IB.esc(s.baseName)} to HL to open it.</p>${IB.levelSwitch(s.id)}</div>`;
      return;
    }
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
        <span class="topic-card-body"><span class="mono small muted">${IB.esc(t.code)}</span><strong>${IB.esc(t.title)}${t.hl ? ' <span class="ahl-badge">AHL</span>' : ""}</strong><span class="small muted">${t.summary}</span></span>
        <span class="topic-card-meta">${data.read[t.id] ? '<span class="pill good">✓ revised</span>' : ""}${m !== null ? `<span class="pill">${m}%</span>` : ""}</span>
      </a>`;
    }).join("");
    c.innerHTML = `<div class="subject-hero" style="--c:${s.color}" data-reveal>
      <div class="btn-row" style="justify-content:space-between"><span class="eyebrow">${IB.esc(s.guide)}</span><span class="lv-badge on-dark">${IB.levelOf(s.id)}</span></div>
      <h1>${s.name} revision notes</h1>
      ${IB.hasHL(s.id) ? `<p class="small" style="margin:.2em 0 .6em;opacity:.85">${IB.levelOf(s.id) === "HL" ? `HL view: all ${s.allTopics.length} topics including ${s.allTopics.filter((t) => t.hl).length} AHL topics (marked AHL), HL papers and AHL questions.` : `SL view: ${s.topics.length} topics. Use the Switch to HL button (top right) to add ${s.allTopics.filter((t) => t.hl).length} AHL topics and HL papers.`}</p>` : ""}
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
    const quizPlan = makeQuiz(t);
    c.innerHTML = `<div class="topic-banner" style="--c:${s.color}" data-reveal>
      <span class="topic-big-num">${String(idx + 1).padStart(2, "0")}</span>
      <div class="topic-banner-body">
        <div class="btn-row"><span class="eyebrow">${IB.esc(t.unit)}</span>${t.hl ? '<span class="ahl-badge">AHL · HL only</span>' : ""}<span class="lv-badge on-dark">${IB.levelOf(s.id)}</span>${m !== null ? `<span class="pill ${m >= 70 ? "good" : m >= 40 ? "warn" : "bad"}">Mastery ${m}%</span>` : ""}</div>
        <h1><span class="code">${IB.esc(t.code)}</span>${IB.esc(t.title)}</h1>
        <p>${t.summary}</p>
      </div>
    </div>
    <div class="btn-row no-print" style="margin:14px 0">
      <button class="btn ${data.read[t.id] ? "" : "primary"}" id="readBtn">${data.read[t.id] ? "✓ Revised" : "Mark as revised"}</button>
      ${IB.config.ai ? `<a class="btn" href="tutor.html?subject=${s.id}&topic=${t.id}">Ask the AI tutor</a>` : ""}
      <button class="btn mark" id="dlTopic">⬇ PDF notes</button>
      <button class="btn" id="dlTopicQ">⬇ PDF + practice paper</button>
      <button class="btn" id="dlSheet">⬇ Worksheet</button>
      <button class="btn ${hlOn() ? "on" : ""}" id="hlBtn" aria-pressed="${hlOn()}">🖍 Highlights</button>
      <button class="btn" id="printBtn">Print</button>
    </div>
    <div class="hl-legend no-print ${hlOn() ? "" : "hidden"}">${IB.highlightKey()}</div>
    <nav class="jumpbar no-print" aria-label="Jump to section" style="--c:${s.color}">
      ${sections.map(([id, label]) => `<a href="#sec-${id}" class="jump ${id}">${label}</a>`).join("")}<a href="#sec-quiz" class="jump practice">Take quiz</a>
    </nav>
    <div class="topic-sections ${hlOn() ? "" : "hl-off"}" style="--c:${s.color}">${sections.map((x) => x[2]).join("")}
      <section class="card quiz-cta no-print" id="sec-quiz" data-reveal>
        <div><span class="eyebrow">Check your understanding</span><h3 style="margin:.2em 0 .3em">Finished revising ${IB.esc(t.title)}?</h3>
          <p class="small muted" style="margin:0">Take a short timed quiz on this topic (about ${quizPlan.minutes} minutes, ${quizPlan.qs.length} questions). You can come straight back to these notes or move on to the next topic afterwards.</p></div>
        <div class="btn-row"><button type="button" class="btn primary" id="takeQuiz">Take quiz · ${quizPlan.minutes} min</button><a class="btn small" href="questionbank.html?subject=${s.id}&topic=${t.id}">Open question bank</a></div>
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
    IB.qs("#takeQuiz").onclick = () => renderQuiz(s, t, quizPlan);
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
    if (IB.scrollSpy) IB.scrollSpy(c);
  }

  // ---------- timed quiz for one subtopic (opens after the notes, not alongside them) ----------
  // Aim for ~8 questions, instant-marked ones first, topped up with generated calculations. Time is ~1.2 min per mark
  // (the IB rule of thumb), rounded to 5 minutes and kept between 5 and 30.
  function makeQuiz(t) {
    const N = 8;
    const all = IB.shuffle(IB.topicQuestions(t.id).filter((q) => !q.derived));
    const auto = all.filter((q) => q.type === "mcq" || q.numeric);
    const rest = all.filter((q) => !(q.type === "mcq" || q.numeric));
    let qs = auto.concat(rest).slice(0, N);
    let guard = 0;
    while (qs.length < N && IB.hasGenerator(t.id) && guard++ < 50) qs.push(IB.generate(t.id));
    qs = IB.shuffle(qs);
    const marks = qs.reduce((n, q) => n + (q.marks || 1), 0);
    const minutes = Math.min(30, Math.max(5, Math.ceil((marks * 1.2) / 5) * 5));
    return { qs, marks, minutes };
  }

  function renderQuiz(s, t, plan) {
    const c = IB.qs("#content");
    const P = plan || makeQuiz(t);                   // "Try a new quiz" passes no plan, so it draws fresh questions
    const qs = P.qs, minutes = P.minutes;
    const totalMarks = qs.reduce((n, q) => n + (q.marks || 1), 0);
    const idx = s.topics.indexOf(t), next = s.topics[idx + 1];
    if (!qs.length) { IB.toast("No quiz questions for this topic yet."); return; }
    c.innerHTML = `<div class="exam-bar quiz-bar" style="--c:${s.color}">
        <div><strong>${IB.esc(t.code)} ${IB.esc(t.title)} · quiz</strong><div class="small muted">${qs.length} questions · ${totalMarks} marks · ${minutes} min</div></div>
        <div class="btn-row"><span class="timer" id="qTimer"></span><span class="pill" id="qLive">0/${qs.length} answered</span>
          <button type="button" class="btn primary" id="qFinish">Finish &amp; mark</button><button type="button" class="btn" id="qBack">← Back to notes</button></div>
      </div><div id="qList" style="--c:${s.color}"></div><div id="qSummary"></div>`;
    window.scrollTo({ top: 0 });
    const list = IB.qs("#qList");
    const cards = qs.map((q, i) => { const card = IB.renderQuestion(q, { number: i + 1, mode: "quiz", showTopic: false }); list.appendChild(card); return card; });
    IB.math(list);
    const live = () => {
      const n = cards.filter((x) => { const a = x.getAnswer(); return a !== null && a !== "" && !(typeof a === "string" && !a.trim()); }).length;
      IB.qs("#qLive").textContent = `${n}/${cards.length} answered`;
    };
    list.addEventListener("input", live);
    list.addEventListener("change", live);

    let timerH = null, finished = false;
    const end = Date.now() + minutes * 60000;
    const tick = () => {
      const el = IB.qs("#qTimer");
      if (!el) return clearInterval(timerH);
      const left = Math.max(0, end - Date.now());
      el.textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}`;
      el.style.color = left < 60000 ? "var(--bad)" : "";
      if (!left) { clearInterval(timerH); IB.toast("Time's up - marking your quiz."); finish(); }
    };
    tick();
    timerH = setInterval(tick, 1000);

    const backToNotes = () => { clearInterval(timerH); render(); window.scrollTo({ top: 0 }); };
    IB.qs("#qBack").onclick = () => {
      if (!finished && cards.some((x) => { const a = x.getAnswer(); return a !== null && a !== ""; }) && !confirm("Leave the quiz? Your answers so far will be lost.")) return;
      backToNotes();
    };
    async function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timerH);
      const btn = IB.qs("#qFinish");
      btn.disabled = true;
      btn.textContent = "Marking…";
      for (const x of cards) {
        if (x.isScored()) continue;
        const a = x.getAnswer();
        if (a === null || a === "" || (typeof a === "string" && !a.trim())) x.giveZero();
        else await x.autoMark();
      }
      const got = cards.reduce((n, x) => n + Number(x.dataset.score || 0), 0);
      const pct = IB.pct(got, totalMarks);
      IB.store.update((d) => d.exams.push({ kind: "quiz", title: `${s.short} quiz - ${t.title}`, s: s.id, sc: got, mx: totalMarks, at: Date.now(), paper: null }));
      const sum = IB.qs("#qSummary");
      sum.innerHTML = `<div class="card quiz-result" style="--c:${s.color}">
        <h2 style="margin-top:0">Quiz result</h2>
        <div class="btn-row" style="gap:20px"><span class="score-ring">${got}/${totalMarks}</span><span class="stat-big">${pct}%</span></div>
        <p class="small muted">Check each answer against its markscheme above. Your result is saved to <a href="progress.html">My Progress</a>.</p>
        <div class="btn-row" style="margin-top:14px"><button type="button" class="btn" id="qNotes">← Back to notes</button><button type="button" class="btn" id="qAgain">Try a new quiz</button>${next ? `<button type="button" class="btn primary" id="qNext">Next: ${IB.esc(next.title)} →</button>` : ""}</div></div>`;
      btn.textContent = "Marked";
      IB.qs("#qNotes").onclick = backToNotes;
      IB.qs("#qAgain").onclick = () => renderQuiz(s, t);
      const nx = IB.qs("#qNext");
      if (nx) nx.onclick = () => go(s.id, next.id);
      sum.scrollIntoView({ behavior: "smooth" });
    }
    IB.qs("#qFinish").onclick = finish;
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
