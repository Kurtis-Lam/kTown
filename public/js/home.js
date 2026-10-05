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
        <span class="eyebrow">IB Diploma · 7 subjects · Notes · Questions · Mocks · IA &amp; EE</span>
        <h1>Every topic. Every paper. <span class="hl">Marked like the real thing.</span></h1>
        <p class="lead">Notes by syllabus topic, an exam-style question bank and mock papers, with an AI examiner that marks your answers against the markscheme.</p>
        <div class="btn-row">
          <a class="btn primary" href="practice.html">Start a quiz</a>
          ${recentTopic ? `<a class="btn" href="notes.html?subject=${recentTopic.subject}&topic=${recentTopic.id}">Continue: ${IB.esc(recentTopic.title)} →</a>` : `<a class="btn" href="notes.html">Browse notes →</a>`}
        </div>
      </div>
      <div class="hero-demo" aria-label="Example of AI marking">
        <div class="btn-row" style="justify-content:space-between">
          <span class="pill econ">Econ SL · Paper 2</span>
          <span class="mono" style="font-weight:700">[4 marks]</span>
        </div>
        <div style="font-size:1.05rem;line-height:1.5;font-weight:500">Using a diagram, explain how a severe drought in Brazil is likely to affect the world price of coffee.</div>
        <div class="answer">Drought reduces crop yields, so supply shifts left from S₁ to S₂. At the old price there is a shortage, so the price rises to P₂…</div>
        <div class="verdict demo-anim">
          <div style="display:flex;align-items:center;gap:12px"><span class="big"><span data-count="3">3</span>/4</span><span class="pill" style="background:#DDF3E6;color:#155E34">AI examiner</span></div>
          <div><strong style="color:#155E34">✓</strong> Supply shifts left · <strong style="color:#155E34">✓</strong> Shortage → price rises · <strong style="color:#155E34">✓</strong> Diagram</div>
          <div><strong style="color:#B42318">✗</strong> Missing: label the new equilibrium Q₂</div>
        </div>
      </div>
    </div>
  </section>

  <section class="grid grid-4 stat-grid" style="margin-top:40px" aria-label="Site statistics">
    <div class="card stat-tile"><span class="stat-big" data-count="${totalT}">${totalT}</span><span class="muted">syllabus topics with notes</span></div>
    <div class="card stat-tile"><span class="stat-big" data-count="${totalQ}">${totalQ}</span><span class="muted">exam-style questions with markschemes</span></div>
    <div class="card stat-tile"><span class="stat-big">∞</span><span class="muted">fresh calculation questions</span></div>
    <div class="card stat-tile accent"><span class="stat-big">${streak} day${streak === 1 ? "" : "s"}</span><span class="muted">your revision streak</span></div>
  </section>

  <div class="btn-row" style="justify-content:space-between;align-items:flex-end;margin-top:56px">
    <h2 style="margin:0">Your subjects</h2>
    <span class="muted small">Mastery from your last 20 attempts per topic</span>
  </div>
  <section class="subject-grid" id="subjects" style="margin-top:20px"></section>

  <h2 style="margin-top:56px">Everything you need for a 7</h2>
  <section class="features" id="features">
    ${[
      ["notes.html", "∑", "Learn", "Topic notes + PDFs", "Concepts, fastest methods, traps, worked examples and a four-colour highlight key - download any topic or subject as a designed PDF booklet.", "Browse notes"],
      ["questionbank.html", "?", "Practise", `${totalQ.toLocaleString()} questions`, "A structured bank for every topic: exam-style, calculations, worked-example replays, explain-the-concept, key-term drills and spot-the-mistake.", "Open the bank"],
      ["practice.html?mode=mock", "⏱", "Test yourself", "Quizzes & mock papers", "Timed papers in the real structure, unit quizzes and smart quizzes that target your weakest topics - marked instantly.", "Sit a mock"],
      ["skills.html", "✎", "Exam technique", "Answer frameworks", "A framework for every question type, sentence starters, top-band checklists and the markscheme decoded band by band.", "Learn the frameworks"],
      ["ia.html", "◎", "Coursework", "IA & EE predictor", "Score yourself on every criterion, get an AI predicted mark for your draft, and see your predicted grade and core points.", "Predict my grade"],
      ["tutor.html", "✦", "Get unstuck", "AI tutor & marking", "An IB examiner-style tutor that gives hints, not just answers - and marks written answers against the markscheme.", "Ask the tutor"],
    ].map(([href, icon, eyebrow, title, text, cta], i) => `<a class="card feature" href="${href}" data-reveal style="--i:${i}">
      <span class="f-icon" aria-hidden="true">${icon}</span>
      <span class="eyebrow">${String(i + 1).padStart(2, "0")} · ${eyebrow}</span>
      <h3>${title}</h3><p class="muted">${text}</p><span class="f-cta">${cta} →</span></a>`).join("")}
  </section>`;

  const grid = IB.qs("#subjects");
  subs.forEach((s) => {
    const qs = IB.allQuestions(s.id);
    const rows = s.topics.map((t) => IB.mastery(t.id, data));
    const tried = rows.filter((m) => m !== null);
    const pct = tried.length ? Math.round(rows.reduce((n, m) => n + (m ?? 0), 0) / rows.length) : 0;
    const next = s.topics.map((t, i) => ({ t, m: rows[i] })).sort((a, b) => (a.m ?? -1) - (b.m ?? -1))[0].t;
    const mono = { econ: "Ec", chem: "Ch", geo: "Ge", math: "Ma", bio: "Bi", engb: "En", chia: "中" }[s.id] || s.short.slice(0, 2);
    const C = 2 * Math.PI * 26;
    grid.appendChild(
      IB.el(`<a class="card subject-card" href="notes.html?subject=${s.id}" style="--c:${s.color}" data-reveal>
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
