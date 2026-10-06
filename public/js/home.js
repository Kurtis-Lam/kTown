IB.page = function () {
  const app = IB.qs("#app");
  const data = IB.store.get();
  const subs = IB.subjectList();
  const totalQ = IB.allQuestions().length;
  const totalT = subs.reduce((n, s) => n + s.topics.length, 0);
  const recent = data.attempts.slice(-1)[0];
  const recentTopic = recent && IB.topic(recent.t);

  // revision streak (consecutive days with at least one attempt)
  const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  const days = new Set(data.attempts.map((a) => dayKey(a.at)));
  let streak = 0;
  for (let i = 0; ; i++) {
    if (days.has(dayKey(Date.now() - i * 86400000))) streak++;
    else if (i > 0) break;
  }

  app.innerHTML = `
  <section class="band">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Your IB study space</span>
        <h1>Study smarter.<br><span class="hl">Feel ready.</span></h1>
        <p class="lead">Notes, questions and practice for your IB courses — all in one place.</p>
        <div class="btn-row">
          <a class="btn primary" href="krevisionnotes.html">Open kRevisionNotes</a>
          ${recentTopic ? `<a class="btn" href="krevisionnotes.html?subject=${recentTopic.subject}&topic=${recentTopic.id}">Continue studying →</a>` : `<a class="btn" href="practice.html">Start practising →</a>`}
        </div>
      </div>
    </div>
  </section>

  <section class="grid grid-3 stat-grid" style="margin-top:28px" aria-label="Revision tools">
    <div class="card stat-tile"><span class="stat-big" data-count="${totalT}">${totalT}</span><span class="muted">topics with notes</span></div>
    <div class="card stat-tile"><span class="stat-big" data-count="${totalQ}">${totalQ.toLocaleString()}</span><span class="muted">practice questions</span></div>
    <div class="card stat-tile accent"><span class="stat-big">${streak}</span><span class="muted">day${streak === 1 ? "" : "s"} revising in a row</span></div>
  </section>

  <h2 style="margin-top:42px">Choose a workspace</h2>
  <section class="features" id="features">
    ${[
      ["krevisionnotes.html", "✎", "kRevisionNotes", "Topic notes and examples"],
      ["questionbank.html", "?", "Questions", `${totalQ.toLocaleString()} practice questions`],
      ["practice.html", "✓", "Practice", "Quizzes and mock exams"],
      ["progress.html", "↗", "Progress", "Pick up where you left off"],
    ].map(([href, icon, title, text], i) => `<a class="card feature" href="${href}" data-reveal style="--i:${i}">
      <span class="f-icon" aria-hidden="true">${icon}</span>
      <h3>${title}</h3><p class="muted">${text}</p><span class="f-cta">Open →</span></a>`).join("")}
  </section>

  <div class="btn-row" style="margin-top:24px">
    <span class="muted small">More tools</span>
    <a class="btn small" href="tutor.html">AI Tutor</a>
    <a class="btn small" href="skills.html">Exam skills</a>
    <a class="btn small" href="ia.html">IA &amp; EE</a>
    <a class="btn small" href="mypapers.html">Past papers</a>
  </div>

  <h2 style="margin-top:44px">Choose a subject</h2>
  <section class="subject-grid" id="subjects" style="margin-top:16px"></section>

  <section class="related-apps" aria-labelledby="relatedAppsTitle">
    <div class="related-apps-heading"><span class="eyebrow">More from kTown</span><h2 id="relatedAppsTitle">Your other workspaces</h2></div>
    <div class="grid grid-2">
      <a class="card related-app" href="kauranotes.html"><span class="eyebrow">Notes workspace</span><h3>kAuraNotes</h3><p class="muted">Write, organize and keep your own study notes.</p><span class="f-cta">Open kAuraNotes →</span></a>
      <a class="card related-app" href="kcitethisforme.html"><span class="eyebrow">Citation tool</span><h3>kCiteThisForMe</h3><p class="muted">Create and manage APA-style citations for your sources.</p><span class="f-cta">Open kCiteThisForMe →</span></a>
    </div>
  </section>`;

  const grid = IB.qs("#subjects");
  subs.forEach((s) => {
    const qs = IB.allQuestions(s.id);
    const rows = s.topics.map((t) => IB.mastery(t.id, data));
    const tried = rows.filter((m) => m !== null);
    const pct = tried.length ? Math.round(rows.reduce((n, m) => n + (m ?? 0), 0) / rows.length) : 0;
    const next = s.topics.map((t, i) => ({ t, m: rows[i] })).sort((a, b) => (a.m ?? -1) - (b.m ?? -1))[0].t;
    const mono = { econ: "Ec", chem: "Ch", geo: "Ge", geohl: "GH", physl: "Ph", phyhl: "PH", tok: "TOK", math: "Ma", bio: "Bi", engb: "En", chia: "中" }[s.id] || s.short.slice(0, 2);
    const C = 2 * Math.PI * 26;
    grid.appendChild(
      IB.el(`<a class="card subject-card" href="krevisionnotes.html?subject=${s.id}" style="--c:${s.color}" data-reveal>
        <div class="stripe"></div>
        <div class="body">
          <div class="sc-top">
            <span class="sc-mono">${mono}</span>
            <span class="sc-ring" title="${tried.length ? "Estimated grade " + IB.grade(pct, s.id) : "Not started yet"}">
              <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26" class="trk"/><circle cx="30" cy="30" r="26" class="val" style="stroke-dasharray:${C};--off:${C * (1 - pct / 100)}"/></svg>
              <b>${tried.length ? IB.grade(pct, s.id) : "–"}</b>
            </span>
          </div>
          <div><h3>${s.name}</h3><div class="stats">${s.topics.length} topics · ${qs.length.toLocaleString()} questions</div></div>
          <div class="sc-next"><span class="muted">Next up</span><span>${IB.esc(next.title)}</span><strong class="mono">${tried.length ? pct + "%" : "new"}</strong></div>
        </div>
      </a>`)
    );
  });
};
