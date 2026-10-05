IB.page = function () {
  const app = IB.qs("#app");

  function render() {
    const d = IB.store.get();
    const A = d.attempts;
    const unique = new Set(A.map((a) => a.id)).size;
    const avg = A.length ? IB.pct(A.reduce((n, a) => n + a.sc / a.mx, 0), A.length) : 0;
    const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
    const perDay = {};
    A.forEach((a) => (perDay[dayKey(a.at)] = (perDay[dayKey(a.at)] || 0) + 1));
    let streak = 0;
    for (let i = 0; ; i++) {
      const k = dayKey(Date.now() - i * 86400000);
      if (perDay[k]) streak++;
      else if (i > 0) break;
    }
    const readCount = Object.keys(d.read).length;
    const totalTopics = IB.subjectList().reduce((n, s) => n + s.topics.length, 0);

    // heatmap: last 12 weeks, columns = weeks
    const days = 84;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - days + 1);
    const max = Math.max(1, ...Object.values(perDay));
    let heat = "";
    for (let i = 0; i < days; i++) {
      const dt = new Date(start.getTime() + i * 86400000);
      const n = perDay[dayKey(dt.getTime())] || 0;
      const lvl = n ? 0.25 + 0.75 * (n / max) : 0;
      heat += `<span title="${dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}: ${n} question${n === 1 ? "" : "s"}" style="${n ? `background:color-mix(in srgb, var(--primary) ${Math.round(lvl * 100)}%, var(--surface-2))` : ""}"></span>`;
    }

    app.innerHTML = `<h1 style="margin-bottom:.2em">My progress</h1>
      <p class="muted" style="margin-top:0">Saved privately in this browser. Export a backup to keep it safe or move it to another device.</p>
      <section class="grid grid-4">
        <div class="card"><div class="stat-big">${unique}</div><div class="small muted">different questions attempted (${A.length} attempts)</div></div>
        <div class="card"><div class="stat-big">${A.length ? avg + "%" : "-"}</div><div class="small muted">average score</div></div>
        <div class="card"><div class="stat-big">${streak}</div><div class="small muted">day revision streak</div></div>
        <div class="card"><div class="stat-big">${readCount}/${totalTopics}</div><div class="small muted">topics marked as revised</div></div>
      </section>
      <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Activity - last 12 weeks</h3>
        <div class="heat" style="grid-template-rows:repeat(7,14px);grid-auto-flow:column;grid-template-columns:none">${heat}</div>
        <div class="small muted" style="margin-top:8px;display:flex;align-items:center;gap:6px">Less <span style="width:12px;height:12px;border-radius:3px;background:var(--surface-2);display:inline-block"></span><span style="width:12px;height:12px;border-radius:3px;background:color-mix(in srgb,var(--primary) 50%,var(--surface-2));display:inline-block"></span><span style="width:12px;height:12px;border-radius:3px;background:var(--primary);display:inline-block"></span> More · hover a day for its count</div>
      </div>
      <h2>Mastery by subject and topic</h2>
      <p class="small muted">Mastery is a recency-weighted average of your last 20 attempts in each topic. Grade estimates use typical recent boundaries - they are a guide, not a prediction.</p>
      <div class="grid grid-2" id="subjects"></div>
      <h2>Focus next</h2><div class="card" id="weak"></div>
      <h2>Saved for review</h2><div class="card" id="saved"></div>
      <h2>Quizzes & mock exams</h2><div class="card table-wrap" id="exams"></div>
      <h2>Your data</h2>
      <div class="card"><div class="btn-row">
        <button class="btn primary" id="exp">⬇ Export progress backup</button>
        <label class="btn">⬆ Import backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
        <button class="btn" id="csv">⬇ Attempts as CSV</button>
        <button class="btn" id="reset" style="color:var(--bad)">Reset all progress</button>
      </div></div>`;

    const subjEl = IB.qs("#subjects");
    const allRows = [];
    IB.subjectList().forEach((s) => {
      const rows = s.topics.map((t) => ({ t, m: IB.mastery(t.id, d), n: A.filter((a) => a.t === t.id).length }));
      rows.forEach((r) => allRows.push(r));
      const tried = rows.filter((r) => r.m !== null);
      const mean = tried.length ? Math.round(tried.reduce((n, r) => n + r.m, 0) / tried.length) : null;
      // Grade estimate penalises low coverage: untried topics count as 0 once some work is done.
      const covered = IB.pct(tried.length, rows.length);
      const weighted = tried.length ? Math.round(rows.reduce((n, r) => n + (r.m ?? 0), 0) / rows.length) : null;
      subjEl.appendChild(IB.el(`<div class="card" style="--c:${s.color}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div><h3 style="margin:0">${s.name}</h3><div class="small muted">${covered}% of topics attempted${mean !== null ? ` · mastery in attempted topics ${mean}%` : ""}</div></div>
          ${weighted !== null ? `<div title="Estimated grade across the whole syllabus"><span class="grade" style="background:${s.color}">${IB.grade(weighted, s.id)}</span></div>` : `<span class="pill">No attempts yet</span>`}
        </div>
        <div style="margin-top:10px">${rows.map((r) => `<div class="mastery-row"><a href="krevisionnotes.html?subject=${s.id}&topic=${r.t.id}" title="${r.n} attempt${r.n === 1 ? "" : "s"}">${IB.esc(r.t.code)} ${IB.esc(r.t.title)}</a><div class="bar" title="${r.m === null ? "Not attempted" : r.m + "% mastery from " + r.n + " attempts"}"><span style="width:${r.m ?? 0}%"></span></div><span class="small ${r.m === null ? "muted" : ""}">${r.m === null ? "-" : r.m + "%"}</span></div>`).join("")}</div>
        <div class="btn-row" style="margin-top:10px"><a class="btn small" href="practice.html?subject=${s.id}&mode=smart">Smart quiz</a><a class="btn small" href="practice.html?subject=${s.id}&mode=mock">Mock paper</a></div>
      </div>`));
    });

    const weak = allRows.filter((r) => r.m !== null).sort((a, b) => a.m - b.m).slice(0, 6);
    IB.qs("#weak").innerHTML = weak.length
      ? `<p class="small muted" style="margin-top:0">Your lowest-mastery topics. Re-read the notes, then quiz yourself.</p>` + weak.map((r) => `<div class="mastery-row" style="--c:${IB.subjects[r.t.subject].color}"><span><span class="pill ${r.t.subject}">${IB.subjects[r.t.subject].short}</span> ${IB.esc(r.t.title)}</span><div class="btn-row"><a class="btn small" href="krevisionnotes.html?subject=${r.t.subject}&topic=${r.t.id}">Notes</a><a class="btn small" href="practice.html?subject=${r.t.subject}&topic=${r.t.id}">Quiz</a><a class="btn small" href="tutor.html?subject=${r.t.subject}&topic=${r.t.id}">Tutor</a></div><span class="small">${r.m}%</span></div>`).join("")
      : `<p class="muted" style="margin:0">Attempt some questions and your weakest topics will appear here.</p>`;

    const saved = Object.keys(d.flags).map(IB.question).filter(Boolean);
    IB.qs("#saved").innerHTML = saved.length
      ? `<ul>${saved.map((q) => `<li><span class="pill ${q.subject}">${IB.subjects[q.subject].short}</span> ${IB.esc(q.q.replace(/<[^>]+>/g, "").slice(0, 110))}… <a href="questionbank.html?subject=${q.subject}&topic=${q.topic}">open</a></li>`).join("")}</ul><a class="btn small" href="questionbank.html">Practise saved questions (Status → Saved)</a>`
      : `<p class="muted" style="margin:0">Use "☆ Save for review" on any question to build a personal revision list.</p>`;

    const ex = d.exams.slice().reverse();
    IB.qs("#exams").innerHTML = ex.length
      ? `<table><tr><th>Date</th><th>Activity</th><th>Score</th><th>%</th><th>Grade est.</th></tr>${ex.map((e) => { const p = IB.pct(e.sc, e.mx); return `<tr><td>${IB.fmtDate(e.at)}</td><td>${IB.esc(e.title)}</td><td>${e.sc}/${e.mx}</td><td>${p}%</td><td>${IB.grade(p, e.s)}</td></tr>`; }).join("")}</table>`
      : `<p class="muted" style="margin:0">No quizzes or mocks yet. <a href="practice.html">Start one →</a></p>`;

    IB.qs("#exp").onclick = () => IB.download(`ib-revision-progress-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(IB.store.get(), null, 1), "application/json");
    IB.qs("#csv").onclick = () => {
      const rows = [["date", "subject", "topic", "question_id", "score", "max", "mode"]].concat(IB.store.get().attempts.map((a) => [new Date(a.at).toISOString(), a.s, (IB.topic(a.t) || {}).title || a.t, a.id, a.sc, a.mx, a.m]));
      IB.download("ib-revision-attempts.csv", rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
    };
    IB.qs("#imp").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then((txt) => {
        try {
          const inc = JSON.parse(txt);
          if (!Array.isArray(inc.attempts)) throw new Error();
          IB.store.update((cur) => {
            const seen = new Set(cur.attempts.map((a) => a.id + a.at));
            inc.attempts.forEach((a) => { if (!seen.has(a.id + a.at)) cur.attempts.push(a); });
            cur.attempts.sort((x, y) => x.at - y.at);
            Object.assign(cur.read, inc.read || {});
            Object.assign(cur.flags, inc.flags || {});
            cur.custom = cur.custom || [];
            const ck = new Set(cur.custom.map((x) => x.id));
            (inc.custom || []).forEach((x) => { if (!ck.has(x.id)) cur.custom.push(x); });
            const ek = new Set(cur.exams.map((x) => x.at));
            (inc.exams || []).forEach((x) => { if (!ek.has(x.at)) cur.exams.push(x); });
          });
          IB.toast("Backup imported and merged.");
          render();
        } catch (err) {
          IB.toast("That file isn't a valid progress backup.");
        }
      });
    };
    const reset = IB.qs("#reset");
    reset.onclick = () => {
      // Two-step confirmation inside the page (browser confirm dialogs are blocked in some views).
      if (!reset.dataset.armed) {
        reset.dataset.armed = "1";
        reset.textContent = "Click again to delete all progress";
        setTimeout(() => { if (reset.isConnected) { delete reset.dataset.armed; reset.textContent = "Reset all progress"; } }, 5000);
        return;
      }
      IB.store.save({ attempts: [], read: {}, flags: {}, exams: [], created: Date.now() });
      IB.toast("All progress deleted.");
      render();
    };
  }
  render();
};
