/* My past papers: import questions from your own copies of IB papers (private, stored in this browser). */
IB.page = function () {
  const app = IB.qs("#app");
  const subjOpts = (val) => IB.subjectList().map((s) => `<option value="${s.id}" ${s.id === val ? "selected" : ""}>${s.name}</option>`).join("");
  const paperOpts = (sid, val) => (IB.paperOptions[sid] || []).map(([c, n]) => `<option value="${c}" ${c === val ? "selected" : ""}>${n}</option>`).join("");
  const topicOpts = (sid, val) => IB.subjects[sid].topics.map((t) => `<option value="${t.id}" ${t.id === val ? "selected" : ""}>${IB.esc(t.code)} ${IB.esc(t.title)}</option>`).join("");

  app.innerHTML = `<h1 style="margin-bottom:.2em">My past papers</h1>
    <p class="muted" style="margin-top:0">Add questions from the official past papers and markschemes you already have (from your school or the IB store). They are sorted into topics and then appear in the question bank, topic notes, quizzes and mocks - with instant markscheme marking and progress tracking.</p>
    <div class="notice small">Private to you: everything you add is saved only in this browser and is never published. Include it in your backup from <a href="progress.html">My Progress</a> → Export.</div>
    <div class="tabs" id="tabs"><button data-tab="import" class="active">Import a paper</button><button data-tab="one">Add one question</button><button data-tab="list">My questions (<span id="count">0</span>)</button></div>
    <section data-panel="import"></section>
    <section data-panel="one" class="hidden"></section>
    <section data-panel="list" class="hidden"></section>`;

  const showTab = (name) => {
    IB.qsa("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    IB.qsa("[data-panel]").forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== name));
    if (name === "list") renderList();
  };
  IB.qsa("#tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
  const updateCount = () => (IB.qs("#count").textContent = (IB.store.get().custom || []).length);
  updateCount();

  // ---------- text extraction ----------
  async function fileText(file) {
    if (!file) return "";
    if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      if (!window.pdfjsLib) throw new Error("The PDF reader didn't load. Copy the text from the PDF and paste it instead.");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.js";
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const content = await (await pdf.getPage(p)).getTextContent();
        let lastY = null;
        content.items.forEach((it) => {
          const y = Math.round(it.transform[5]);
          if (lastY !== null && Math.abs(y - lastY) > 2) out += "\n";
          else if (out && !out.endsWith("\n") && !out.endsWith(" ")) out += " ";
          out += it.str;
          lastY = y;
        });
        out += "\n";
      }
      return out;
    }
    return file.text();
  }

  // ---------- splitting a paper into questions ----------
  const JUNK = [/^\s*[-–—]\s*\d+\s*[-–—]\s*$/, /turn over/i, /^\s*[MN]\d{2}\/\d/, /^\s*\d{4}\s*[-–]\s*\d{4}\s*$/, /please do not write/i, /^\s*blank page\s*$/i, /^\s*(markscheme|instructions to candidates)\b/i];
  const clean = (text) => text.replace(/\r/g, "").split("\n").filter((l) => !JUNK.some((re) => re.test(l))).join("\n");

  function split(text) {
    const lines = clean(text).split("\n");
    const chunks = [];
    let expect = 1, cur = null;
    for (const line of lines) {
      const m = line.match(/^\s*(?:question\s+)?(\d{1,2})\s*[.):]?\s+(.*)$/i) || line.match(/^\s*(?:question\s+)?(\d{1,2})\s*[.):]?\s*$/i);
      const n = m ? +m[1] : 0;
      if (m && (n === expect || (cur && n === cur.num + 1))) {
        cur = { num: n, lines: [m[2] || ""] };
        chunks.push(cur);
        expect = n + 1;
      } else if (cur) cur.lines.push(line);
    }
    if (!chunks.length && text.trim()) chunks.push({ num: 1, lines: clean(text).split("\n") });
    return chunks.map((c) => ({ num: c.num, text: c.lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() }));
  }

  function parseQuestion(chunk, mcqPaper) {
    const t = chunk.text;
    const opt = [...t.matchAll(/(?:^|\n|\s)\(?([A-D])[.)]\s+([^\n]+?)(?=\s+\(?[A-D][.)]\s|\n|$)/g)];
    const letters = opt.map((o) => o[1]).join("");
    if ((mcqPaper || letters.startsWith("ABCD")) && letters.startsWith("ABCD")) {
      const first = opt.findIndex((o) => o[1] === "A");
      const stem = t.slice(0, t.indexOf(opt[first][0])).trim();
      return { qnum: chunk.num, type: "mcq", q: stem, options: opt.slice(first, first + 4).map((o) => o[2].trim()), answer: -1, marks: 1 };
    }
    const marks = [...t.matchAll(/\[(\d{1,2})\]/g)].reduce((n, m) => n + +m[1], 0) || 0;
    return { qnum: chunk.num, type: marks >= 10 ? "extended" : "short", q: t, marks: marks || 2 };
  }

  function parseMarkscheme(text, mcqPaper) {
    const map = {};
    if (mcqPaper) {
      for (const m of clean(text).matchAll(/\b(\d{1,2})\s*[.):]?\s*\(?([A-D])\)?(?=\s|$)/g)) if (!(m[1] in map)) map[m[1]] = "ABCD".indexOf(m[2]);
      return map;
    }
    split(text).forEach((c) => {
      map[c.num] = c.text.split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter((l) => l.length > 1).slice(0, 40);
    });
    return map;
  }

  // ---------- import panel ----------
  let preview = [];
  const imp = IB.qs('[data-panel="import"]');
  imp.innerHTML = `<div class="card"><h2 style="margin-top:0">1. Which paper?</h2>
      <div class="filters">
        <label class="field">Subject<select id="iSub">${subjOpts("econ")}</select></label>
        <label class="field">Paper<select id="iPaper"></select></label>
        <label class="field">Session<input type="text" id="iSession" placeholder="e.g. May 2023 TZ1"></label>
      </div></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h2 style="margin-top:0">2. Question paper</h2><p class="small muted">Upload the PDF (or a .txt file), or paste the text.</p>
        <input type="file" id="iQfile" accept=".pdf,.txt,application/pdf,text/plain"><textarea id="iQtext" rows="9" placeholder="1. Define opportunity cost. [2]&#10;2. …" style="margin-top:8px"></textarea></div>
      <div class="card"><h2 style="margin-top:0">3. Markscheme <span class="muted small">(optional)</span></h2><p class="small muted">Upload or paste the matching markscheme. For multiple-choice papers, the answer key ("1. B  2. D …").</p>
        <input type="file" id="iMfile" accept=".pdf,.txt,application/pdf,text/plain"><textarea id="iMtext" rows="9" placeholder="1. the next best alternative forgone [1] …" style="margin-top:8px"></textarea></div>
    </div>
    <div class="btn-row" style="margin:16px 0"><button class="btn primary" id="iSplit">Split into questions</button><span class="small muted" id="iStatus"></span></div>
    <div id="iPreview"></div>`;
  const iSub = IB.qs("#iSub"), iPaper = IB.qs("#iPaper");
  const fillPaper = () => (iPaper.innerHTML = paperOpts(iSub.value));
  fillPaper();
  iSub.onchange = fillPaper;

  IB.qs("#iSplit").onclick = async () => {
    const status = IB.qs("#iStatus");
    status.textContent = "Reading…";
    try {
      const qText = (await fileText(IB.qs("#iQfile").files[0])) || IB.qs("#iQtext").value;
      const mText = (await fileText(IB.qs("#iMfile").files[0])) || IB.qs("#iMtext").value;
      if (!qText.trim()) { status.textContent = ""; return IB.toast("Add the question paper first (upload or paste)."); }
      const sid = iSub.value, paper = iPaper.value, mcqPaper = paper === "P1A";
      const ms = mText.trim() ? parseMarkscheme(mText, mcqPaper) : {};
      preview = split(qText).map((c) => {
        const q = parseQuestion(c, mcqPaper);
        q.topic = IB.suggestTopic(sid, q.q + " " + (q.options || []).join(" ")).topic;
        if (q.type === "mcq") q.answer = ms[c.num] ?? -1;
        else q.ms = Array.isArray(ms[c.num]) ? ms[c.num] : [];
        q.include = q.q.length > 3;
        return q;
      });
      status.textContent = `Found ${preview.length} question${preview.length === 1 ? "" : "s"}. Check them below, then save.`;
      renderPreview();
    } catch (e) {
      status.textContent = "";
      IB.toast(e.message || "Couldn't read that file.");
    }
  };

  function renderPreview() {
    const sid = iSub.value;
    const box = IB.qs("#iPreview");
    if (!preview.length) return (box.innerHTML = "");
    box.innerHTML = preview.map((q, i) => `<div class="q-card" data-i="${i}">
      <div class="btn-row" style="justify-content:space-between">
        <label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-f="include" ${q.include ? "checked" : ""}> <strong>Question ${q.qnum}</strong></label>
        <span class="pill">${q.type === "mcq" ? "Multiple choice" : q.type === "extended" ? "Extended response" : "Structured"}</span>
      </div>
      <div class="filters" style="margin-top:8px">
        <label class="field" style="grid-column:span 2">Topic<select data-f="topic">${topicOpts(sid, q.topic)}</select></label>
        <label class="field">Marks<input type="number" min="1" max="40" data-f="marks" value="${q.marks}" ${q.type === "mcq" ? "disabled" : ""}></label>
        ${q.type === "mcq" ? `<label class="field">Correct answer<select data-f="answer"><option value="-1">?</option>${"ABCD".split("").map((L, k) => `<option value="${k}" ${q.answer === k ? "selected" : ""}>${L}</option>`).join("")}</select></label>` : ""}
      </div>
      <label class="field" style="margin-top:8px">Question<textarea data-f="q" rows="5">${IB.esc(q.q)}</textarea></label>
      ${q.type === "mcq" ? `<label class="field" style="margin-top:8px">Options (one per line: A, B, C, D)<textarea data-f="options" rows="4">${IB.esc((q.options || []).join("\n"))}</textarea></label>` : `<label class="field" style="margin-top:8px">Markscheme (one mark point per line)<textarea data-f="ms" rows="4">${IB.esc((q.ms || []).join("\n"))}</textarea></label>`}
    </div>`).join("") + `<div class="btn-row" style="margin:16px 0"><button class="btn primary" id="iSave">Save selected questions</button></div>`;
    IB.qsa("[data-i]", box).forEach((card) => {
      const q = preview[+card.dataset.i];
      IB.qsa("[data-f]", card).forEach((el) => (el.oninput = el.onchange = () => {
        const f = el.dataset.f;
        if (f === "include") q.include = el.checked;
        else if (f === "marks") q.marks = Math.max(1, +el.value || 1);
        else if (f === "answer") q.answer = +el.value;
        else if (f === "options") q.options = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
        else if (f === "ms") q.ms = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
        else q[f] = el.value;
      }));
    });
    IB.qs("#iSave").onclick = () => {
      const chosen = preview.filter((q) => q.include && q.q.trim());
      if (!chosen.length) return IB.toast("Tick at least one question.");
      const session = IB.qs("#iSession").value.trim(), paper = iPaper.value;
      const stamp = Date.now().toString(36);
      IB.saveMy((list) => chosen.forEach((q, k) => list.push({
        id: `my-${stamp}-${k}`, subject: sid, topic: q.topic, paper, session, qnum: q.qnum, type: q.type, marks: q.type === "mcq" ? 1 : q.marks,
        q: q.q.trim(), ms: q.type === "mcq" ? [q.answer >= 0 ? `Answer: ${"ABCD"[q.answer]}` : "Answer not added yet"] : q.ms || [], options: q.options, answer: q.answer, created: Date.now(),
      })));
      preview = [];
      renderPreview();
      updateCount();
      IB.qs("#iStatus").textContent = "";
      IB.toast(`Saved ${chosen.length} question${chosen.length === 1 ? "" : "s"}.`);
      showTab("list");
    };
  }

  // ---------- add one question ----------
  let editing = null;
  const one = IB.qs('[data-panel="one"]');
  function renderOne(r) {
    editing = r || null;
    const sid = r ? r.subject : "econ";
    one.innerHTML = `<div class="card"><h2 style="margin-top:0">${r ? "Edit question" : "Add one question"}</h2>
      <div class="filters">
        <label class="field">Subject<select id="oSub">${subjOpts(sid)}</select></label>
        <label class="field">Paper<select id="oPaper">${paperOpts(sid, r && r.paper)}</select></label>
        <label class="field">Session<input type="text" id="oSession" value="${IB.esc(r ? r.session : "")}" placeholder="e.g. Nov 2022"></label>
        <label class="field">Question no.<input type="text" id="oNum" value="${IB.esc(r ? r.qnum : "")}" placeholder="e.g. 3(b)"></label>
        <label class="field">Type<select id="oType"><option value="short">Structured / short</option><option value="extended">Extended response</option><option value="mcq">Multiple choice</option></select></label>
        <label class="field">Marks<input type="number" id="oMarks" min="1" max="40" value="${r ? r.marks : 2}"></label>
      </div>
      <label class="field" style="margin-top:10px">Question<textarea id="oQ" rows="5">${IB.esc(r ? r.q : "")}</textarea></label>
      <div class="btn-row" style="margin-top:8px"><label class="field" style="flex:1">Topic<select id="oTopic">${topicOpts(sid, r && r.topic)}</select></label><button class="btn small" id="oSuggest" style="align-self:flex-end">Suggest topic</button></div>
      <div id="oMcq"><label class="field" style="margin-top:10px">Options (one per line: A, B, C, D)<textarea id="oOpts" rows="4">${IB.esc(r && r.options ? r.options.join("\n") : "")}</textarea></label>
        <label class="field" style="margin-top:10px;max-width:200px">Correct answer<select id="oAns">${"ABCD".split("").map((L, k) => `<option value="${k}" ${r && r.answer === k ? "selected" : ""}>${L}</option>`).join("")}</select></label></div>
      <div id="oWritten"><label class="field" style="margin-top:10px">Markscheme (one mark point per line)<textarea id="oMs" rows="5">${IB.esc(r && r.ms ? r.ms.join("\n") : "")}</textarea></label>
        <label class="field" style="margin-top:10px;max-width:280px">Final numerical answer (optional, enables instant marking)<input type="text" id="oNumAns" value="${IB.esc(r && r.numeric != null ? r.numeric : "")}"></label></div>
      <div class="btn-row" style="margin-top:14px"><button class="btn primary" id="oSave">${r ? "Save changes" : "Add question"}</button>${r ? '<button class="btn" id="oCancel">Cancel</button>' : ""}</div></div>`;
    const sub = IB.qs("#oSub"), type = IB.qs("#oType");
    type.value = r ? r.type : "short";
    const toggle = () => { IB.qs("#oMcq").classList.toggle("hidden", type.value !== "mcq"); IB.qs("#oWritten").classList.toggle("hidden", type.value === "mcq"); };
    toggle();
    type.onchange = toggle;
    sub.onchange = () => { IB.qs("#oPaper").innerHTML = paperOpts(sub.value); IB.qs("#oTopic").innerHTML = topicOpts(sub.value); };
    IB.qs("#oSuggest").onclick = () => { IB.qs("#oTopic").value = IB.suggestTopic(sub.value, IB.qs("#oQ").value).topic; };
    if (r) IB.qs("#oCancel").onclick = () => { renderOne(); showTab("list"); };
    IB.qs("#oSave").onclick = () => {
      const q = IB.qs("#oQ").value.trim();
      if (!q) return IB.toast("Type or paste the question first.");
      const isMcq = type.value === "mcq";
      const options = IB.qs("#oOpts").value.split("\n").map((s) => s.trim()).filter(Boolean);
      if (isMcq && options.length < 2) return IB.toast("Add the answer options, one per line.");
      const numRaw = IB.qs("#oNumAns").value.trim();
      const rec = {
        id: editing ? editing.id : `my-${Date.now().toString(36)}`, subject: sub.value, topic: IB.qs("#oTopic").value, paper: IB.qs("#oPaper").value,
        session: IB.qs("#oSession").value.trim(), qnum: IB.qs("#oNum").value.trim(), type: type.value, marks: isMcq ? 1 : Math.max(1, +IB.qs("#oMarks").value || 1), q,
        ms: isMcq ? [`Answer: ${"ABCD"[+IB.qs("#oAns").value]}`] : IB.qs("#oMs").value.split("\n").map((s) => s.trim()).filter(Boolean),
        options: isMcq ? options : undefined, answer: isMcq ? +IB.qs("#oAns").value : undefined,
        numeric: !isMcq && numRaw && isFinite(parseFloat(numRaw)) ? parseFloat(numRaw) : null, created: editing ? editing.created : Date.now(),
      };
      IB.saveMy((list) => {
        const i = list.findIndex((x) => x.id === rec.id);
        if (i >= 0) list[i] = rec; else list.push(rec);
      });
      updateCount();
      IB.toast(editing ? "Question updated." : "Question added.");
      renderOne();
      if (rec.id && editing) showTab("list");
    };
  }
  renderOne();

  // ---------- list ----------
  function renderList() {
    const box = IB.qs('[data-panel="list"]');
    const all = IB.store.get().custom || [];
    if (!all.length) {
      box.innerHTML = `<div class="card muted">No questions yet. Import a paper or add a question to get started.</div>`;
      return;
    }
    const groups = {};
    all.forEach((r) => { const k = r.subject + "|" + (r.session || "") + "|" + (r.paper || ""); (groups[k] = groups[k] || []).push(r); });
    box.innerHTML = Object.entries(groups).map(([k, rows]) => {
      const r0 = rows[0], s = IB.subjects[r0.subject];
      const marks = rows.reduce((n, r) => n + (r.marks || 1), 0);
      return `<div class="card" style="--c:${s.color}">
        <div class="btn-row" style="justify-content:space-between">
          <div><span class="pill ${s.id}">${s.short}</span> <strong>${IB.esc(r0.session || "Undated")}</strong> · ${IB.esc(IB.paperName(r0.subject, r0.paper))} <span class="muted small">· ${rows.length} questions · ${marks} marks</span></div>
          <div class="btn-row"><a class="btn small primary" href="practice.html?mypaper=${encodeURIComponent(k)}">Sit as timed mock</a><a class="btn small" href="questionbank.html?subject=${s.id}&source=mine">Practise in bank</a></div>
        </div>
        <div class="table-wrap"><table><tr><th>Q</th><th>Topic</th><th>Marks</th><th>Question</th><th></th></tr>
        ${rows.sort((a, b) => (parseInt(a.qnum) || 0) - (parseInt(b.qnum) || 0)).map((r) => { const t = IB.topic(r.topic); return `<tr><td>${IB.esc(r.qnum || "")}</td><td>${t ? IB.esc(t.title) : "-"}</td><td>${r.marks}</td><td>${IB.esc(r.q.slice(0, 90))}${r.q.length > 90 ? "…" : ""}${r.type !== "mcq" && !(r.ms && r.ms.length) ? ' <span class="pill warn">no markscheme</span>' : ""}</td><td style="white-space:nowrap"><button class="btn small" data-edit="${r.id}">Edit</button> <button class="btn small" data-del="${r.id}">Delete</button></td></tr>`; }).join("")}
        </table></div></div>`;
    }).join("");
    IB.qsa("[data-edit]", box).forEach((b) => (b.onclick = () => { renderOne((IB.store.get().custom || []).find((x) => x.id === b.dataset.edit)); showTab("one"); }));
    IB.qsa("[data-del]", box).forEach((b) => (b.onclick = () => {
      if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Confirm"; return; }
      IB.saveMy((list) => { const i = list.findIndex((x) => x.id === b.dataset.del); if (i >= 0) list.splice(i, 1); });
      updateCount();
      renderList();
    }));
  }
};
