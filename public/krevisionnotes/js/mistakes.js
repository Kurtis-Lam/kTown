/* Mistakes notebook: every question answered with marks lost is saved here with the answer given and what was
   missing. Retry it; full marks moves it to "Fixed". */
IB.page = function () {
  const app = IB.qs("#app");
  let sid = IB.param("subject") || "all";
  let view = IB.param("view") === "fixed" ? "fixed" : "open";
  let sort = "recent";

  app.innerHTML = `<h1 style="margin-bottom:.2em">Mistakes notebook</h1>
    <p class="muted" style="margin-top:0">Every question where you lost marks is saved automatically, with your answer and the markscheme points you missed. Retry until you get full marks, then it moves to Fixed.</p>
    <div class="mk-stats" id="mkStats"></div>
    <div class="subject-tabs" id="mkSubs"></div>
    <div class="mk-bar card">
      <div class="seg" role="tablist" id="mkView"></div>
      <label class="small">Sort <select id="mkSort"><option value="recent">Most recent</option><option value="often">Most often wrong</option><option value="topic">By topic</option><option value="marks">Most marks lost</option></select></label>
      <div class="btn-row" style="margin-left:auto">
        <button class="btn primary small" id="mkQuiz">↻ Retry all as a quiz</button>
        <button class="btn mark small" id="mkPdf">⬇ IB-style PDF of my mistakes</button>
      </div>
    </div>
    <div id="mkList"></div>`;

  const subjects = () => IB.subjectList();
  function entries() {
    const d = IB.store.get();
    return Object.entries(d.mistakes || {})
      .map(([id, m]) => ({ id, m, q: IB.mistakeQuestion(id, m) }))
      .filter((e) => e.q && (sid === "all" || e.m.s === sid));
  }

  function render() {
    const all = entries();
    const open = all.filter((e) => !e.m.fixed), fixed = all.filter((e) => e.m.fixed);
    const list = view === "open" ? open : fixed;
    const lost = open.reduce((n, e) => n + (e.m.mx - e.m.sc), 0);
    const weakTopic = (() => {
      const c = {};
      open.forEach((e) => (c[e.m.t] = (c[e.m.t] || 0) + 1));
      const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
      return top ? IB.topic(top[0]) : null;
    })();
    IB.qs("#mkStats").innerHTML = `
      <div class="stat-tile card"><span class="stat-big" data-count="${open.length}">${open.length}</span><span class="muted">to fix</span></div>
      <div class="stat-tile card"><span class="stat-big">${fixed.length}</span><span class="muted">fixed</span></div>
      <div class="stat-tile card"><span class="stat-big">${lost}</span><span class="muted">marks to win back</span></div>
      <div class="stat-tile card"><span class="stat-big small-big">${weakTopic ? IB.esc(weakTopic.title) : "-"}</span><span class="muted">most mistakes</span></div>`;
    IB.qs("#mkSubs").innerHTML = [`<button data-s="all" class="${sid === "all" ? "active" : ""}" style="--c:#0F1B2D">All subjects</button>`]
      .concat(subjects().map((x) => {
        const n = Object.values(IB.store.get().mistakes || {}).filter((m) => m.s === x.id && !m.fixed).length;
        return `<button data-s="${x.id}" class="${sid === x.id ? "active" : ""}" style="--c:${x.color}">${IB.esc(x.name)}${n ? ` <span class="count">${n}</span>` : ""}</button>`;
      })).join("");
    IB.qsa("#mkSubs button").forEach((b) => (b.onclick = () => { sid = b.dataset.s; history.replaceState(null, "", `mistakes.html?subject=${sid}${view === "fixed" ? "&view=fixed" : ""}`); render(); }));
    IB.qs("#mkView").innerHTML = `<button class="${view === "open" ? "active" : ""}" data-v="open">To fix · ${open.length}</button><button class="${view === "fixed" ? "active" : ""}" data-v="fixed">Fixed · ${fixed.length}</button>`;
    IB.qsa("#mkView button").forEach((b) => (b.onclick = () => { view = b.dataset.v; render(); }));
    IB.qs("#mkQuiz").disabled = !open.length;
    IB.qs("#mkPdf").disabled = !list.length;

    const sorted = list.slice().sort((a, b) =>
      sort === "often" ? b.m.n - a.m.n || b.m.at - a.m.at
        : sort === "topic" ? String(a.m.t).localeCompare(String(b.m.t), undefined, { numeric: true })
          : sort === "marks" ? (b.m.mx - b.m.sc) - (a.m.mx - a.m.sc)
            : (view === "fixed" ? b.m.fixedAt - a.m.fixedAt : b.m.at - a.m.at));
    const box = IB.qs("#mkList");
    if (!sorted.length) {
      box.innerHTML = view === "open"
        ? `<div class="card empty" data-reveal><div class="empty-icon">🎯</div><h3>No mistakes to fix${sid !== "all" ? " in this subject" : ""}</h3><p class="muted">Questions where you lose marks in the question bank, notes, quizzes and mocks appear here automatically.</p><a class="btn primary" href="questionbank.html">Practise some questions</a></div>`
        : `<div class="card empty"><h3>Nothing fixed yet</h3><p class="muted">Get full marks on a retry and the question moves here.</p></div>`;
      return;
    }
    box.innerHTML = "";
    let lastTopic = "";
    sorted.forEach((e, i) => {
      const t = IB.topic(e.m.t);
      if (sort === "topic" && e.m.t !== lastTopic) {
        lastTopic = e.m.t;
        box.appendChild(IB.el(`<div class="unit-label">${t ? IB.esc(t.code + " " + t.title) : ""}</div>`));
      }
      const wrap = IB.el(`<section class="mk-item ${e.m.fixed ? "is-fixed" : ""}" data-reveal>
        <div class="mk-head">
          <span class="pill bad">✗ ${e.m.n}× wrong</span>
          <span class="small muted">last ${e.m.sc}/${e.m.mx} · ${new Date(e.m.at).toLocaleDateString()}</span>
          ${e.m.fixed ? `<span class="pill good">✓ fixed ${new Date(e.m.fixedAt).toLocaleDateString()}</span>` : ""}
          <span style="margin-left:auto" class="btn-row">
            ${t ? `<a class="btn small" href="notes.html?subject=${e.m.s}&topic=${e.m.t}">Notes</a>` : ""}
            <button class="btn small" data-rm="${IB.esc(e.id)}" title="Remove from notebook">Remove</button>
          </span>
        </div>
        ${e.m.ans ? `<div class="mk-prev"><strong>Your answer last time</strong><div>${IB.esc(e.m.ans).replace(/\n/g, "<br>")}</div></div>` : ""}
        ${e.m.miss && e.m.miss.length ? `<div class="mk-miss small"><strong>Missed</strong><ul>${e.m.miss.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ul></div>` : ""}
      </section>`);
      const card = IB.renderQuestion(e.q, { number: i + 1, onScored: (sc, mx) => setTimeout(() => {
        if (sc >= mx) { IB.toast("Fixed! Moved to the Fixed list."); IB.celebrate && IB.celebrate(wrap); }
      }, 50) });
      wrap.appendChild(card);
      box.appendChild(wrap);
    });
    IB.qsa("[data-rm]", box).forEach((b) => (b.onclick = () => {
      IB.store.update((d) => { delete d.mistakes[b.dataset.rm]; });
      render();
    }));
    IB.math(box);
    if (IB.animate) IB.animate(box);
  }

  IB.qs("#mkSort").onchange = (e) => { sort = e.target.value; render(); };
  IB.qs("#mkQuiz").onclick = () => {
    const ids = entries().filter((e) => !e.m.fixed).map((e) => e.id).slice(0, 40);
    try { sessionStorage.setItem("ibrev:quizIds", JSON.stringify(ids)); } catch (e) { /* ignore */ }
    location.href = "practice.html?mode=mistakes";
  };
  IB.qs("#mkPdf").onclick = (ev) => {
    const list = entries().filter((e) => (view === "open" ? !e.m.fixed : e.m.fixed)).map((e) => e.q);
    if (!IB.paperPdf) return IB.toast("PDF engine not loaded.");
    const btn = ev.currentTarget;
    btn.disabled = true;
    IB.paperPdf({ title: "My mistakes", subtitle: sid === "all" ? "All subjects" : IB.subjects[sid].name, subject: sid === "all" ? null : sid, questions: list })
      .catch((e) => IB.toast(e.message)).finally(() => (btn.disabled = false));
  };
  render();
};
