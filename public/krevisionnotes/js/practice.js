IB.page = function () {
  const app = IB.qs("#app");
  const subParam = IB.param("subject");
  const topicParam = IB.param("topic");

  app.innerHTML = `<h1 style="margin-bottom:.2em">Quizzes & mock exams</h1>
    <p class="muted" style="margin-top:0">Build a unit quiz, let the smart quiz target your weak topics, sit a timed mock paper, or drill calculations with endless fresh numbers. Every result is saved to <a href="progress.html">My Progress</a>.</p>
    <div class="tabs no-print" id="modes">
      <button data-mode="quiz" class="active">Unit quiz</button>
      <button data-mode="smart">Smart quiz (weak topics)</button>
      <button data-mode="mock">Mock exam paper</button>
      <button data-mode="drill">Calculation drill</button>
    </div>
    <div id="setup"></div>
    <div id="run"></div>
    <div id="history"></div>`;

  const subjectSelect = (id, val) => `<label class="field">Subject<select id="${id}">${IB.subjectList().map((s) => `<option value="${s.id}" ${s.id === val ? "selected" : ""}>${s.name}</option>`).join("")}</select></label>`;
  const setup = IB.qs("#setup");
  const run = IB.qs("#run");

  // ---------- pools ----------
  function poolFor(topicIds, format) {
    let bank = IB.allQuestions().filter((q) => topicIds.includes(q.topic));
    if (format === "auto") bank = bank.filter((q) => q.type === "mcq" || q.numeric);
    if (format === "written") bank = bank.filter((q) => q.type !== "mcq");
    return bank;
  }
  function buildQuiz(topicIds, n, format) {
    let pool = IB.shuffle(poolFor(topicIds, format));
    const genTopics = topicIds.filter(IB.hasGenerator);
    const out = pool.slice(0, n);
    // Top up with generated questions so a quiz is never short - and every retake differs.
    let guard = 0;
    while (out.length < n && genTopics.length && guard++ < 200) {
      const g = IB.generate(IB.pick(genTopics));
      out.push(format === "auto" && Math.random() < 0.5 ? IB.asMcq(g) : g);
    }
    // Mix in some fresh numbers even when the bank is big enough.
    if (genTopics.length && format !== "written") {
      const swaps = Math.min(Math.floor(n / 4), genTopics.length * 2);
      for (let i = 0; i < swaps; i++) {
        const g = IB.generate(IB.pick(genTopics));
        out[out.length - 1 - i] = format === "auto" && Math.random() < 0.5 ? IB.asMcq(g) : g;
      }
    }
    return IB.shuffle(out);
  }

  // ---------- runner shared by quiz / smart / mock ----------
  function startRun({ title, subject, questions, minutes, kind, paper }) {
    setup.classList.add("hidden");
    const totalMarks = questions.reduce((n, q) => n + q.marks, 0);
    const exam = kind === "mock";
    run.innerHTML = `<div class="exam-bar">
        <div><strong>${IB.esc(title)}</strong><div class="small muted">${questions.length} questions · ${totalMarks} marks${exam ? " · exam conditions: markschemes hidden until you submit" : ""}</div></div>
        <div class="btn-row">${minutes ? `<span class="timer" id="timer"></span>` : ""}<span class="pill" id="live">0 answered</span>
        <button class="btn mark" id="dlPaper">⬇ IB-style PDF</button><button class="btn primary" id="finish">${exam ? "Submit paper" : "Finish & mark"}</button><button class="btn" id="quit">Quit</button></div>
      </div><div id="qs"></div><div id="summary"></div>`;
    const list = IB.qs("#qs");
    const cards = questions.map((q, i) => {
      const c = IB.renderQuestion(q, { number: i + 1, mode: exam ? "exam" : "quiz" });
      list.appendChild(c);
      return c;
    });
    const live = () => {
      const answered = cards.filter((c) => { const a = c.getAnswer(); return a !== null && a !== ""; }).length;
      IB.qs("#live").textContent = `${answered}/${cards.length} answered`;
    };
    list.addEventListener("input", live);
    list.addEventListener("change", live);

    let timerH = null;
    if (minutes) {
      const end = Date.now() + minutes * 60000;
      const tick = () => {
        const left = Math.max(0, end - Date.now());
        const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        const el = IB.qs("#timer");
        if (!el) return clearInterval(timerH);
        el.textContent = `${m}:${String(s).padStart(2, "0")}`;
        el.style.color = left < 5 * 60000 ? "var(--bad)" : "";
        if (!left) { clearInterval(timerH); IB.toast("Time's up - submitting your paper."); finish(); }
      };
      tick();
      timerH = setInterval(tick, 1000);
    }

    IB.qs("#dlPaper").onclick = (ev) => {
      if (!IB.paperPdf) return dlHtml();
      const b = ev.currentTarget;
      b.disabled = true;
      IB.paperPdf({ title, subtitle: IB.subjects[subject] ? IB.subjects[subject].name : "", subject, questions, minutes }).catch((e) => IB.toast(e.message)).finally(() => (b.disabled = false));
    };
    const dlHtml = () => IB.download(`${title.replace(/[^\w]+/g, "-")}.html`, IB.standaloneDoc(title, `<h1>${IB.esc(title)}</h1><p class="meta">${questions.length} questions · ${totalMarks} marks${minutes ? ` · ${minutes} minutes` : ""}</p>` + IB.worksheetHtml(questions, "Questions")));
    IB.qs("#quit").onclick = () => { clearInterval(timerH); run.innerHTML = ""; setup.classList.remove("hidden"); };

    let finished = false;
    async function finish() {
      if (finished) return;
      finished = true;
      clearInterval(timerH);
      const btn = IB.qs("#finish");
      btn.disabled = true;
      btn.textContent = "Marking…";
      for (const c of cards) {
        if (c.isScored()) continue;
        const a = c.getAnswer();
        if (a === null || a === "" || (typeof a === "string" && !a.trim())) c.giveZero();
        else await c.autoMark();
      }
      const scores = cards.map((c) => ({ q: c.q, sc: Number(c.dataset.score || 0) }));
      const got = scores.reduce((n, x) => n + x.sc, 0);
      const pct = IB.pct(got, totalMarks);
      const grade = IB.grade(pct, subject);
      const byTopic = {};
      scores.forEach(({ q, sc }) => {
        const k = q.topic;
        byTopic[k] = byTopic[k] || { sc: 0, mx: 0 };
        byTopic[k].sc += sc;
        byTopic[k].mx += q.marks;
      });
      IB.store.update((d) => d.exams.push({ kind, title, s: subject, sc: got, mx: totalMarks, at: Date.now(), paper: paper || null }));
      const ai = await IB.ai.available();
      const sum = IB.qs("#summary");
      sum.innerHTML = `<div class="card" style="--c:${IB.subjects[subject].color}">
        <h2 style="margin-top:0">Result</h2>
        <div class="btn-row" style="gap:20px"><span class="score-ring">${got}/${totalMarks}</span><span class="stat-big">${pct}%</span>
        <span title="Estimated IB grade - boundaries vary by session"><span class="grade">${grade}</span> <span class="small muted">estimated grade</span></span></div>
        <p class="small muted">${ai ? "Written answers were marked by the AI examiner." : "Written answers were marked by the built-in markscheme marker - check them against the markschemes below and adjust with self-marking if needed."} Grade estimates use typical recent boundaries and are a guide only.</p>
        <h3>By topic</h3>
        ${Object.entries(byTopic).map(([tid, v]) => { const t = IB.topic(tid); const p = IB.pct(v.sc, v.mx); return `<div class="mastery-row"><a href="notes.html?subject=${t.subject}&topic=${tid}">${IB.esc(t.code)} ${IB.esc(t.title)}</a><div class="bar"><span style="width:${p}%"></span></div><span class="small">${p}%</span></div>`; }).join("")}
        <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="again">New ${kind === "mock" ? "mock" : "quiz"}</button><a class="btn" href="progress.html">View progress</a></div>
      </div>`;
      IB.qs("#again").onclick = () => { run.innerHTML = ""; setup.classList.remove("hidden"); window.scrollTo({ top: 0 }); };
      btn.textContent = "Marked";
      sum.scrollIntoView({ behavior: "smooth" });
      renderHistory();
    }
    IB.qs("#finish").onclick = finish;
    window.scrollTo({ top: run.offsetTop - 70 });
  }

  // ---------- setups ----------
  const setups = {
    quiz() {
      const sid = subParam || "econ";
      setup.innerHTML = `<div class="card"><h2 style="margin-top:0">Build a unit quiz</h2>
        <div class="filters">${subjectSelect("qSub", sid)}
          <label class="field">Questions<select id="qN"><option>5</option><option selected>10</option><option>15</option><option>20</option><option>30</option></select></label>
          <label class="field">Format<select id="qFmt"><option value="auto">Instant-marked (MCQ + calculations)</option><option value="mixed">Mixed (incl. written answers)</option><option value="written">Written answers only</option></select></label>
        </div>
        <p class="small muted" style="margin:14px 0 6px">Topics <button class="btn small" id="allT">Select all</button> <button class="btn small" id="noneT">Clear</button></p>
        <div id="qTopics" class="grid grid-3" style="gap:6px"></div>
        <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="qStart">Start quiz</button><span class="small muted" id="qInfo"></span></div></div>`;
      const fillTopics = () => {
        const s = IB.subjects[IB.qs("#qSub").value];
        IB.qs("#qTopics").innerHTML = s.topics.map((t) => `<label class="small" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" value="${t.id}" ${!topicParam || topicParam === t.id ? "checked" : ""}><span><strong>${IB.esc(t.code)}</strong> ${IB.esc(t.title)}${IB.hasGenerator(t.id) ? ' <span class="pill" title="Unlimited generated questions">∞</span>' : ""}</span></label>`).join("");
      };
      fillTopics();
      IB.qs("#qSub").onchange = () => { fillTopics(); };
      IB.qs("#allT").onclick = () => IB.qsa("#qTopics input").forEach((i) => (i.checked = true));
      IB.qs("#noneT").onclick = () => IB.qsa("#qTopics input").forEach((i) => (i.checked = false));
      IB.qs("#qStart").onclick = () => {
        const ids = IB.qsa("#qTopics input:checked").map((i) => i.value);
        if (!ids.length) return IB.toast("Pick at least one topic.");
        const n = +IB.qs("#qN").value, fmt = IB.qs("#qFmt").value;
        const qs = buildQuiz(ids, n, fmt);
        if (!qs.length) return IB.toast("No questions in that format for these topics - try 'Mixed'.");
        const s = IB.subjects[IB.qs("#qSub").value];
        startRun({ title: `${s.short} quiz - ${ids.length === 1 ? IB.topic(ids[0]).title : ids.length + " topics"}`, subject: s.id, questions: qs, kind: "quiz" });
      };
    },
    smart() {
      const sid = subParam || "econ";
      setup.innerHTML = `<div class="card"><h2 style="margin-top:0">Smart quiz</h2>
        <p class="muted">Picks the topics where your mastery is lowest (and topics you haven't tried yet) and builds a 10-question quiz from them.</p>
        <div class="filters">${subjectSelect("sSub", sid)}<label class="field">Format<select id="sFmt"><option value="auto">Instant-marked</option><option value="mixed">Mixed</option></select></label></div>
        <div id="sPreview" class="small muted" style="margin-top:10px"></div>
        <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="sStart">Start smart quiz</button></div></div>`;
      const weakest = () => {
        const s = IB.subjects[IB.qs("#sSub").value];
        const data = IB.store.get();
        return s.topics.map((t) => ({ t, m: IB.mastery(t.id, data) })).sort((a, b) => (a.m ?? -1) - (b.m ?? -1)).slice(0, 4);
      };
      const preview = () => (IB.qs("#sPreview").innerHTML = "Focus topics: " + weakest().map(({ t, m }) => `<span class="pill">${IB.esc(t.title)} · ${m === null ? "new" : m + "%"}</span>`).join(" "));
      preview();
      IB.qs("#sSub").onchange = preview;
      IB.qs("#sStart").onclick = () => {
        const w = weakest();
        const s = IB.subjects[IB.qs("#sSub").value];
        startRun({ title: `${s.short} smart quiz`, subject: s.id, questions: buildQuiz(w.map((x) => x.t.id), 10, IB.qs("#sFmt").value), kind: "smart" });
      };
    },
    mock() {
      const sid = subParam || "econ";
      setup.innerHTML = `<div class="card"><h2 style="margin-top:0">Mock exam paper</h2>
        <p class="muted">Generates a paper in the structure of a real IB component, drawing different questions each time. Timed, with markschemes hidden until you submit.</p>
        <div class="filters">${subjectSelect("mSub", sid)}<label class="field">Paper<select id="mPaper"></select></label>
        <label class="field">Length<select id="mLen"><option value="1">Full length</option><option value="0.5">Half length</option></select></label>
        <label class="field">Timer<select id="mTimer"><option value="1">On</option><option value="0">Off</option></select></label></div>
        <div id="mInfo" class="small muted" style="margin-top:10px"></div>
        <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="mStart">Start mock exam</button></div></div>`;
      const fill = () => {
        const s = IB.subjects[IB.qs("#mSub").value];
        IB.qs("#mPaper").innerHTML = Object.entries(s.papers).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join("");
        info();
      };
      const info = () => {
        const s = IB.subjects[IB.qs("#mSub").value], p = s.papers[IB.qs("#mPaper").value];
        IB.qs("#mInfo").textContent = `${p.name}: ${p.minutes} minutes in the real exam. ${Object.entries(p.mix).map(([t, n]) => `${n} ${t === "mcq" ? "multiple-choice" : t === "extended" ? "extended-response" : "structured"} question${n > 1 ? "s" : ""}`).join(", ")}.`;
      };
      fill();
      IB.qs("#mSub").onchange = fill;
      IB.qs("#mPaper").onchange = info;
      IB.qs("#mStart").onclick = () => {
        const s = IB.subjects[IB.qs("#mSub").value], key = IB.qs("#mPaper").value, p = s.papers[key];
        const len = +IB.qs("#mLen").value;
        const all = IB.allQuestions(s.id).filter((q) => !q.derived || q.sec === "calc");
        const paperMatch = (q) => q.paper === key || (key === "P2" && s.id === "chem" && q.paper === "P1B") || (key === "P1A" && q.type === "mcq");
        let qs = [];
        Object.entries(p.mix).forEach(([type, n]) => {
          const need = Math.max(1, Math.round(n * len));
          let cand = IB.shuffle(all.filter((q) => q.type === type && paperMatch(q)));
          if (type === "extended" && s.id === "econ" && key === "P1") {
            // Paper 1 = one (a) 10-mark + one (b) 15-mark question
            const a = cand.find((q) => q.marks === 10), b = cand.find((q) => q.marks === 15 && q.topic !== (a && a.topic));
            cand = [a, b].filter(Boolean);
          }
          let picked = cand.slice(0, need);
          // top up structured sections with generated calculation questions for this paper
          const gTopics = IB.generatorTopics(s.id);
          let guard = 0;
          while (picked.length < need && gTopics.length && guard++ < 100) {
            const g = IB.generate(IB.pick(gTopics));
            if (type === "mcq") picked.push(IB.asMcq(g));
            else if (g.paper === key || key !== "P1A") picked.push(g);
          }
          qs = qs.concat(picked);
        });
        if (!qs.length) return IB.toast("Not enough questions for this paper yet.");
        // Top up structured papers to the real paper's mark total (essay papers are fixed-format).
        if (!p.mix.extended || p.mix.short) {
          const target = Math.round(p.marks * len);
          const used = new Set(qs.map((q) => q.id));
          const spare = IB.shuffle(all.filter((q) => !used.has(q.id) && q.type === (p.mix.mcq ? "mcq" : "short") && paperMatch(q)));
          const gTopics = IB.generatorTopics(s.id);
          let marks = qs.reduce((n, q) => n + q.marks, 0), guard = 0;
          while (marks < target && guard++ < 200) {
            let q = spare.shift();
            if (!q && gTopics.length) q = IB.generate(IB.pick(gTopics));
            if (!q) break;
            if (p.mix.mcq && q.type !== "mcq") q = IB.asMcq(q);
            if (marks + q.marks > target + 2) continue;
            qs.push(q);
            marks += q.marks;
          }
          // keep extended responses at the end, like a real paper's section B
          qs.sort((a, b) => (a.type === "extended") - (b.type === "extended"));
        }
        const minutes = +IB.qs("#mTimer").value ? Math.round(p.minutes * len) : 0;
        startRun({ title: `${s.short} mock - ${p.name}${len < 1 ? " (half)" : ""}`, subject: s.id, questions: qs, minutes, kind: "mock", paper: key });
      };
    },
    drill() {
      const sid = subParam || "math";
      setup.innerHTML = `<div class="card"><h2 style="margin-top:0">Calculation drill</h2>
        <p class="muted">Endless fresh calculation questions with instant marking. Build speed and accuracy - keep your streak going.</p>
        <div class="filters">${subjectSelect("dSub", sid)}<label class="field">Topic<select id="dTopic"></select></label></div>
        <div class="btn-row" style="margin:14px 0"><span class="pill good" id="streak">Streak 0</span><span class="pill" id="dScore">0/0 correct</span></div>
        <div id="dQ"></div></div>`;
      let streak = 0, right = 0, total = 0;
      const fill = () => {
        const s = IB.qs("#dSub").value;
        const ts = IB.generatorTopics(s);
        IB.qs("#dTopic").innerHTML = `<option value="">All calculation topics</option>` + ts.map((id) => `<option value="${id}">${IB.esc(IB.topic(id).title)}</option>`).join("");
        next();
      };
      const next = () => {
        const ts = IB.qs("#dTopic").value ? [IB.qs("#dTopic").value] : IB.generatorTopics(IB.qs("#dSub").value);
        const q = IB.generate(IB.pick(ts));
        const box = IB.qs("#dQ");
        box.innerHTML = `<div class="q-card"><div class="q-meta"><span class="pill ${q.subject}">${IB.esc(IB.topic(q.topic).title)}</span><span class="marks">[${q.marks}]</span></div>
          <div class="q-text rich">${q.q}</div>
          <div class="btn-row" style="margin-top:10px"><input type="text" id="dAns" placeholder="Your final answer" style="max-width:260px" autocomplete="off"><button class="btn primary" id="dCheck">Check</button><button class="btn" id="dSkip">Skip</button></div>
          <div id="dRes"></div></div>`;
        IB.math(box);
        const inp = IB.qs("#dAns");
        inp.focus();
        const check = () => {
          if (!inp.value.trim()) return;
          const ok = IB.checkNumeric(q, inp.value);
          total++;
          if (ok) { right++; streak++; } else streak = 0;
          IB.recordAttempt(q, ok ? q.marks : 0, q.marks, "drill");
          IB.qs("#streak").textContent = `Streak ${streak}${streak >= 5 ? " 🔥" : ""}`;
          IB.qs("#dScore").textContent = `${right}/${total} correct`;
          const res = IB.qs("#dRes");
          res.innerHTML = `<div class="feedback ${ok ? "good" : "low"}"><h4>${ok ? "Correct!" : `Not quite - answer: ${q.numeric.value}`}</h4><ul class="small">${q.ms.map((m) => `<li>${m}</li>`).join("")}</ul></div><div class="btn-row" style="margin-top:8px"><button class="btn primary" id="dNext">Next question →</button></div>`;
          IB.math(res);
          IB.qs("#dCheck").disabled = true;
          IB.qs("#dNext").onclick = next;
          IB.qs("#dNext").focus();
        };
        IB.qs("#dCheck").onclick = check;
        inp.onkeydown = (e) => { if (e.key === "Enter") check(); };
        IB.qs("#dSkip").onclick = next;
      };
      IB.qs("#dSub").onchange = fill;
      IB.qs("#dTopic").onchange = next;
      fill();
    },
  };

  function renderHistory() {
    const ex = IB.store.get().exams.slice(-8).reverse();
    IB.qs("#history").innerHTML = ex.length
      ? `<h2>Recent quizzes & mocks</h2><div class="card table-wrap"><table><tr><th>Date</th><th>Activity</th><th>Score</th><th>Grade est.</th></tr>${ex
          .map((e) => { const p = IB.pct(e.sc, e.mx); return `<tr><td>${IB.fmtDate(e.at)}</td><td>${IB.esc(e.title)}</td><td>${e.sc}/${e.mx} (${p}%)</td><td>${IB.grade(p, e.s)}</td></tr>`; })
          .join("")}</table></div>`
      : "";
  }

  const switchMode = (mode) => {
    IB.qsa("#modes button").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    run.innerHTML = "";
    setup.classList.remove("hidden");
    setups[mode]();
  };
  IB.qsa("#modes button").forEach((b) => (b.onclick = () => switchMode(b.dataset.mode)));
  if (IB.param("mode") === "mistakes") {
    // Retry quiz from the mistakes notebook.
    let ids = [];
    try { ids = JSON.parse(sessionStorage.getItem("ibrev:quizIds") || "[]"); } catch (e) { /* ignore */ }
    const mk = IB.store.get().mistakes || {};
    const qs = ids.map((id) => mk[id] && IB.mistakeQuestion(id, mk[id])).filter(Boolean);
    switchMode("quiz");
    if (qs.length) startRun({ title: "Mistakes retry quiz", subject: qs[0].subject, questions: IB.shuffle(qs), kind: "quiz" });
    else IB.toast("No mistakes to retry.");
  } else switchMode(IB.param("mode") || "quiz");

  // Sit one of your imported past papers as a timed mock.
  const myKey = IB.param("mypaper");
  if (myKey) {
    const qs = IB.myQuestions().filter((q) => q.paperKey === myKey);
    if (qs.length) {
      const [sid, session, paper] = myKey.split("|");
      const p = IB.subjects[sid].papers[paper];
      const marks = qs.reduce((n, q) => n + q.marks, 0);
      const minutes = p ? Math.round((p.minutes * marks) / p.marks) : Math.round(marks * 1.2);
      startRun({ title: `${IB.subjects[sid].short} · ${session || "My paper"} · ${IB.paperName(sid, paper)}`, subject: sid, questions: qs, minutes, kind: "mock", paper });
    } else IB.toast("That paper has no questions yet.");
  }
  renderHistory();
};
