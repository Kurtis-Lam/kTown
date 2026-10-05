IB.page = function () {
  const app = IB.qs("#app");
  const PER_PAGE = 12;
  let page = 1;
  let extra = []; // generated / AI questions added this session

  app.innerHTML = `<h1 style="margin-bottom:.2em">Question bank</h1>
    <p class="muted" style="margin-top:0">Exam-style questions by subject and topic with full markschemes. Answer in the box, then get AI/offline marking or self-mark against the markscheme. Every attempt is saved to your progress.</p>
    <div class="notice warn small">These are <strong>original IB-style questions</strong> modelled on the format, command terms and markscheme style of IB papers - official IB past papers are copyright of the IBO and are not reproduced here. Use them alongside the official past papers from your school.</div>
    <div class="card no-print">
      <div class="filters">
        <label class="field">Subject<select id="fSub"><option value="">All subjects</option>${IB.subjectList().map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></label>
        <label class="field">Topic<select id="fTopic"></select></label>
        <label class="field">Paper<select id="fPaper"><option value="">Any paper</option></select></label>
        <label class="field">Type<select id="fType"><option value="">Any type</option><option value="mcq">Multiple choice</option><option value="short">Short / structured</option><option value="extended">Extended response / essay</option><option value="calc">Calculations only</option></select></label>
        <label class="field">Section<select id="fSec"><option value="">All sections</option>${IB.SECTIONS.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></label>
        <label class="field">Difficulty<select id="fDiff"><option value="">Any</option><option value="1">Foundation</option><option value="2">Standard</option><option value="3">Challenging</option></select></label>
        <label class="field">Source<select id="fSource"><option value="">All questions</option><option value="site">Site questions</option><option value="mine">My past papers</option></select></label>
        <label class="field">Status<select id="fStatus"><option value="">All questions</option><option value="new">Not attempted</option><option value="weak">Scored under 60%</option><option value="saved">Saved for review</option></select></label>
        <label class="field field-wide">Search<input type="search" id="fSearch" placeholder="e.g. elasticity, pH, Spearman, tariff…"></label>
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button class="btn primary" id="genBtn">+ 5 fresh calculation questions</button>
        <button class="btn" id="aiGenBtn">✦ AI: write new questions for this topic</button>
        <button class="btn" id="sheetBtn">⬇ Download filtered set as worksheet</button>
        <span class="muted small" id="count"></span>
      </div>
    </div>
    <div id="list"></div>
    <div class="pager no-print" id="pager"></div>`;

  const f = {
    sub: IB.qs("#fSub"), topic: IB.qs("#fTopic"), paper: IB.qs("#fPaper"), type: IB.qs("#fType"),
    diff: IB.qs("#fDiff"), sec: IB.qs("#fSec"), status: IB.qs("#fStatus"), source: IB.qs("#fSource"), search: IB.qs("#fSearch"),
  };
  f.sub.value = IB.param("subject") || "";
  f.source.value = IB.param("source") || "";
  f.sec.value = IB.param("sec") || "";

  function fillTopics() {
    const subs = f.sub.value ? [IB.subjects[f.sub.value]] : IB.subjectList();
    f.topic.innerHTML = `<option value="">All topics</option>` + subs.map((s) => `<optgroup label="${s.name}">${s.topics.map((t) => `<option value="${t.id}">${IB.esc(t.code)} ${IB.esc(t.title)}</option>`).join("")}</optgroup>`).join("");
    const papers = new Set(IB.allQuestions(f.sub.value || undefined).map((q) => q.paper).filter(Boolean));
    f.paper.innerHTML = `<option value="">Any paper</option>` + Array.from(papers).sort().map((p) => `<option>${p}</option>`).join("");
  }
  fillTopics();
  if (IB.param("topic")) f.topic.value = IB.param("topic");

  function filtered() {
    const data = IB.store.get();
    const last = {};
    data.attempts.forEach((a) => (last[a.id] = a.sc / a.mx));
    const term = f.search.value.trim().toLowerCase();
    let qs = extra.concat(IB.allQuestions(f.sub.value || undefined)).filter((q) => !f.sub.value || q.subject === f.sub.value);
    return qs.filter((q) => {
      if (f.topic.value && q.topic !== f.topic.value) return false;
      if (f.paper.value && q.paper !== f.paper.value) return false;
      if (f.source.value === "mine" && !q.custom) return false;
      if (f.source.value === "site" && q.custom) return false;
      if (f.type.value === "calc" ? !q.numeric : f.type.value && q.type !== f.type.value) return false;
      if (f.diff.value && String(q.diff) !== f.diff.value) return false;
      if (f.sec.value && (q.sec || "exam") !== f.sec.value) return false;
      if (f.status.value === "new" && q.id in last) return false;
      if (f.status.value === "weak" && !(q.id in last && last[q.id] < 0.6)) return false;
      if (f.status.value === "saved" && !data.flags[q.id]) return false;
      if (term) {
        const t = IB.topic(q.topic);
        const hay = (q.q + " " + (t ? t.title : "") + " " + (q.ms || []).join(" ")).toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }

  function render() {
    const qs = filtered();
    const pages = Math.max(1, Math.ceil(qs.length / PER_PAGE));
    page = Math.min(page, pages);
    IB.qs("#count").textContent = `${qs.length} question${qs.length === 1 ? "" : "s"}`;
    const list = IB.qs("#list");
    list.innerHTML = qs.length ? "" : `<div class="card muted">No questions match these filters.</div>`;
    qs.slice((page - 1) * PER_PAGE, page * PER_PAGE).forEach((q, i) => list.appendChild(IB.renderQuestion(q, { number: (page - 1) * PER_PAGE + i + 1 })));
    const pager = IB.qs("#pager");
    pager.innerHTML = "";
    if (pages > 1) {
      const btn = (label, p, dis) => {
        const b = IB.el(`<button class="btn small" ${dis ? "disabled" : ""}>${label}</button>`);
        b.onclick = () => { page = p; render(); window.scrollTo({ top: IB.qs("#list").offsetTop - 80 }); };
        pager.appendChild(b);
      };
      btn("← Prev", page - 1, page === 1);
      pager.appendChild(IB.el(`<span class="muted small" style="align-self:center">Page ${page} of ${pages}</span>`));
      btn("Next →", page + 1, page === pages);
    }
  }

  Object.values(f).forEach((el) => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => {
    if (el === f.sub) fillTopics();
    page = 1;
    history.replaceState(null, "", `questionbank.html?subject=${f.sub.value}${f.topic.value ? "&topic=" + f.topic.value : ""}${f.sec.value ? "&sec=" + f.sec.value : ""}`);
    render();
  }));

  IB.qs("#genBtn").onclick = () => {
    let topics = f.topic.value ? [f.topic.value] : IB.generatorTopics(f.sub.value || undefined);
    topics = topics.filter(IB.hasGenerator);
    if (!topics.length) return IB.toast("This topic is not calculation-based - try the AI question writer instead.");
    const fresh = Array.from({ length: 5 }, () => IB.generate(IB.pick(topics)));
    extra = fresh.concat(extra);
    f.type.value = "";
    f.status.value = "";
    page = 1;
    render();
    IB.toast("Added 5 fresh questions at the top.");
  };

  IB.qs("#aiGenBtn").onclick = async () => {
    const t = f.topic.value ? IB.topic(f.topic.value) : null;
    if (!t) return IB.toast("Choose a topic first.");
    if (!(await IB.ai.available())) return IB.toast("AI is not switched on for this site (see README). Use the calculation generator or the bank.");
    const b = IB.qs("#aiGenBtn");
    b.disabled = true;
    b.textContent = "✦ Writing questions…";
    try {
      const out = await IB.ai.generate({ subject: t.subject, topic: `${t.code} ${t.title}`, count: 4, style: f.type.value === "mcq" ? "mcq" : f.type.value === "extended" ? "extended" : "mixed" });
      const made = out.map((g, i) => {
        const q = { id: `ai-${t.id}-${Date.now().toString(36)}-${i}`, subject: t.subject, topic: t.id, type: g.type, marks: g.marks, q: IB.esc(g.q), ms: g.ms.map(IB.esc), diff: 2, paper: "AI", generated: true };
        if (g.type === "mcq" && g.options.length === 4 && g.answer >= 0) Object.assign(q, { options: g.options.map(IB.esc), answer: g.answer });
        else if (g.type === "mcq") q.type = "short";
        IB._generated[q.id] = q;
        return q;
      });
      extra = made.concat(extra);
      page = 1;
      f.paper.value = "";
      render();
      IB.toast(`Added ${made.length} AI-written questions.`);
    } catch (e) {
      IB.toast(e.message);
    }
    b.disabled = false;
    b.textContent = "✦ AI: write new questions for this topic";
  };

  IB.qs("#sheetBtn").onclick = () => {
    const qs = filtered().slice(0, 40);
    if (!qs.length) return IB.toast("Nothing to download.");
    const title = f.topic.value ? IB.topic(f.topic.value).title : f.sub.value ? IB.subjects[f.sub.value].name : "Mixed";
    IB.download(`IB-worksheet-${title.replace(/[^\w]+/g, "-")}.html`, IB.standaloneDoc(`${title} worksheet`, `<h1>${IB.esc(title)} - practice worksheet</h1><p class="meta">${qs.length} questions · total ${qs.reduce((n, q) => n + q.marks, 0)} marks</p>` + IB.worksheetHtml(qs, "Questions")));
  };

  render();
};
