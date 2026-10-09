/* IA & EE: criteria guidance, self-assessment with predicted marks/grades, AI predicted marking, RQ checker, TOK/EE points. */
IB.page = function () {
  const app = IB.qs("#app");
  const st = () => IB.store.get().ia || {};
  const save = (key, val) => IB.store.update((d) => { d.ia = d.ia || {}; d.ia[key] = val; });
  let view = IB.param("view") || "ia";
  let sid = IB.param("subject") || "econ";
  if (!IB.ia[sid] || !IB.subjectList().some((x) => x.id === sid)) sid = "econ";

  app.innerHTML = `<h1 style="margin-bottom:.2em">IA &amp; Extended Essay</h1>
    <p class="muted" style="margin-top:0">Criteria explained in plain language, a self-assessment marker that predicts your IA mark and subject grade, a research-question checker, and the TOK/EE points calculator.</p>
    <div class="tabs" id="viewTabs"><button data-v="ia">Internal assessment</button><button data-v="ee">Extended Essay</button><button data-v="core">TOK / EE points</button></div>
    <div id="iaBody"></div>`;
  IB.qsa("#viewTabs button").forEach((b) => (b.onclick = () => { view = b.dataset.v; render(); }));

  // ---------- shared pieces ----------
  const levelFor = (c, v) => {
    let best = c.levels[0];
    c.levels.forEach((l) => { if (v >= l[0]) best = l; });
    return best[1];
  };
  const ring = (val, max, label) => {
    const p = max ? val / max : 0, C = 2 * Math.PI * 52;
    return `<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" style="stroke-dasharray:${C};stroke-dashoffset:${C * (1 - p)}"/></svg><div class="ring-txt"><strong>${val}</strong><span>/ ${max}</span><em>${label || ""}</em></div></div>`;
  };

  function criteriaBlock(spec, key, onTotal) {
    const saved = st()[key] || {};
    const scores = Object.assign({}, saved.scores || {});
    const wrap = IB.el(`<section class="card ia-criteria"></section>`);
    const crit = spec.criteria.concat(spec.extra ? [spec.extra] : []);
    wrap.innerHTML = crit.map((c, i) => `<div class="crit" data-i="${i}">
        <div class="crit-head"><strong>${IB.esc(c.k)}</strong><span class="mono"><span class="crit-val">${scores[c.k] ?? 0}</span> / ${c.max}${spec.repeat && c !== spec.extra ? ` <span class="muted small">× ${spec.repeat}</span>` : ""}</span></div>
        <input type="range" min="0" max="${c.max}" step="1" value="${scores[c.k] ?? 0}" aria-label="${IB.esc(c.k)} mark">
        <p class="crit-level small"></p>
        <details><summary class="small">How to reach the top band</summary><ul class="small">${c.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
        <div class="table-wrap"><table class="compare small">${c.levels.map((l) => `<tr><th scope="row" class="mono">${l[0]}</th><td>${l[1]}</td></tr>`).join("")}</table></div></details>
      </div>`).join("");
    const total = () => crit.reduce((n, c) => n + (scores[c.k] || 0) * (spec.repeat && c !== spec.extra ? spec.repeat : 1), 0);
    const update = (persist) => {
      IB.qsa(".crit", wrap).forEach((row) => {
        const c = crit[+row.dataset.i];
        const v = scores[c.k] || 0;
        IB.qs(".crit-val", row).textContent = v;
        IB.qs(".crit-level", row).textContent = levelFor(c, v);
        IB.qs("input", row).value = v;
        IB.qs("input", row).style.setProperty("--fill", (v / c.max) * 100 + "%");
      });
      if (persist) save(key, Object.assign({}, st()[key] || {}, { scores }));
      onTotal(total());
    };
    IB.qsa(".crit input", wrap).forEach((inp) => (inp.oninput = () => {
      const c = crit[+inp.closest(".crit").dataset.i];
      scores[c.k] = +inp.value;
      update(true);
    }));
    wrap.setScores = (obj) => { Object.assign(scores, obj); update(true); };
    wrap.criteria = crit;
    setTimeout(() => update(false));
    return wrap;
  }

  function aiBlock(spec, subjectName, kind, onResult) {
    const box = IB.el(`<section class="card"><h3 style="margin-top:0">✦ AI predicted marking</h3>
      <p class="small muted">Paste your draft (or upload it as a PDF/TXT). The AI marks it against each criterion like an examiner, predicts your mark and tells you what to improve. It's a prediction - your teacher's and the IB's marking can differ.</p>
      <input type="file" accept=".pdf,.txt,application/pdf,text/plain" aria-label="Upload draft">
      <textarea rows="9" placeholder="Paste your ${kind} draft here…" style="margin-top:8px"></textarea>
      <div class="btn-row" style="margin-top:10px"><button class="btn primary">✦ Predict my marks</button><span class="small muted"></span></div>
      <div class="ai-out"></div></section>`);
    const [file, ta, btn, status, out] = [IB.qs("input[type=file]", box), IB.qs("textarea", box), IB.qs("button", box), IB.qs(".btn-row .small", box), IB.qs(".ai-out", box)];
    file.onchange = async () => {
      const f = file.files[0];
      if (!f) return;
      status.textContent = "Reading file…";
      try {
        if (/\.pdf$/i.test(f.name)) {
          if (!window.pdfjsLib) throw new Error("PDF reader unavailable - paste the text instead.");
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.js";
          const pdf = await window.pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
          let t = "";
          for (let p = 1; p <= pdf.numPages; p++) t += (await (await pdf.getPage(p)).getTextContent()).items.map((i) => i.str).join(" ") + "\n";
          ta.value = t;
        } else ta.value = await f.text();
        status.textContent = `Loaded ${ta.value.split(/\s+/).filter(Boolean).length} words.`;
      } catch (e) {
        status.textContent = "";
        IB.toast(e.message);
      }
    };
    btn.onclick = async () => {
      const text = ta.value.trim();
      if (text.split(/\s+/).length < 80) return IB.toast("Paste at least a few paragraphs of your draft.");
      if (!(await IB.ai.available())) return IB.toast("AI marking isn't switched on here. Use the self-assessment sliders instead.");
      btn.disabled = true;
      btn.textContent = "Marking… (this can take a minute)";
      const crit = spec.criteria.concat(spec.extra ? [spec.extra] : []);
      const rubric = crit.map((c) => `${c.k} (max ${c.max}):\n` + c.levels.map((l) => `  ${l[0]}: ${l[1]}`).join("\n")).join("\n\n");
      const prompt = `You are an experienced IB examiner and ${kind} moderator for ${subjectName}. Mark the student's draft against these criteria (level descriptors paraphrased from the IB guide):

${rubric}

${spec.note || ""}
Be fair and specific, quote the draft where useful, and give realistic marks (most drafts are not top band). For each criterion give the mark, a one-sentence justification and the single most valuable improvement.

<draft>
${text.slice(0, 60000)}
</draft>

Reply with only a JSON object: {"criteria": [{"k": "<criterion name exactly as given>", "mark": <integer>, "why": "...", "improve": "..."}], "strengths": ["..."], "priorities": ["top 3 actions in order"], "summary": "2-3 sentences"}`;
      try {
        const r = await IB.ai.json(prompt);
        const marks = {};
        (r.criteria || []).forEach((c) => {
          const match = crit.find((x) => x.k === c.k) || crit.find((x) => String(c.k).startsWith(x.k.split(":")[0]));
          if (match) marks[match.k] = Math.max(0, Math.min(match.max, Math.round(Number(c.mark) || 0)));
        });
        onResult(marks);
        out.innerHTML = `<div class="feedback good"><h4>AI prediction ${IB.esc(r.summary ? "" : "")}</h4><div class="small">${IB.esc(r.summary || "")}</div>
          <div class="table-wrap"><table class="compare small" style="margin-top:10px"><tr><th>Criterion</th><th>Mark</th><th>Why</th><th>Improve</th></tr>${(r.criteria || []).map((c) => `<tr><th scope="row">${IB.esc(c.k)}</th><td class="mono">${IB.esc(c.mark)}</td><td>${IB.esc(c.why)}</td><td>${IB.esc(c.improve)}</td></tr>`).join("")}</table></div>
          ${r.strengths && r.strengths.length ? `<p class="small"><strong>Strengths</strong></p><ul class="small">${r.strengths.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ul>` : ""}
          ${r.priorities && r.priorities.length ? `<p class="small"><strong>Do these next</strong></p><ol class="small">${r.priorities.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ol>` : ""}</div>`;
      } catch (e) {
        IB.toast(e.message);
      }
      btn.disabled = false;
      btn.textContent = "✦ Predict again";
    };
    return box;
  }

  function timelineBlock(steps, key) {
    const done = (st()[key] || {}).done || {};
    const box = IB.el(`<section class="card"><h3 style="margin-top:0">Timeline checklist</h3><ol class="timeline">${steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${done[i] ? "checked" : ""}> ${s}</label></li>`).join("")}</ol></section>`);
    IB.qsa("input", box).forEach((cb) => (cb.onchange = () => {
      done[cb.dataset.i] = cb.checked;
      save(key, Object.assign({}, st()[key] || {}, { done }));
      if (cb.checked) IB.celebrate(cb);
    }));
    return box;
  }

  // ---------- views ----------
  function renderIA() {
    const spec = IB.ia[sid], s = IB.subjects[sid];
    const body = IB.qs("#iaBody");
    body.innerHTML = `<div class="subject-tabs" id="iaSubs">${IB.subjectList().filter((x) => IB.ia[x.id]).map((x) => `<button data-s="${x.id}" class="${x.id === sid ? "active" : ""}" style="--c:${x.color}">${x.name}</button>`).join("")}</div>
      <div class="ia-hero" style="--c:${s.color}">
        <div><span class="eyebrow">${Math.round(spec.weight * 100)}% of the final grade · ${spec.total} marks</span><h2>${IB.esc(spec.title)}</h2><p>${IB.esc(spec.length)}</p><p class="small">${IB.esc(spec.note)}</p></div>
        <div id="iaRing"></div>
      </div>
      <div class="ia-layout"><div id="iaLeft"></div><aside id="iaRight"></aside></div>`;
    IB.qsa("#iaSubs button").forEach((b) => (b.onclick = () => { sid = b.dataset.s; history.replaceState(null, "", `ia.html?view=ia&subject=${sid}`); renderIA(); }));
    const data = IB.store.get();
    const rows = s.topics.map((t) => IB.mastery(t.id, data)).filter((m) => m !== null);
    const examDefault = rows.length ? Math.round(rows.reduce((a, b) => a + b, 0) / rows.length) : 60;
    const right = IB.qs("#iaRight");
    right.innerHTML = `<section class="card predict" style="--c:${s.color}"><h3 style="margin-top:0">Predicted grade</h3>
      <div class="pred-row"><span>IA</span><strong id="iaPct">0%</strong></div>
      <label class="field" for="examPct">Expected exam score (from your mastery: ${rows.length ? examDefault + "%" : "no data yet"})</label>
      <input type="range" id="examPct" min="0" max="100" value="${(st()[sid] || {}).exam ?? examDefault}">
      <div class="pred-row"><span>Exams</span><strong id="examVal"></strong></div>
      <div class="pred-grade"><span class="grade" id="predGrade">-</span><span class="small muted">Estimated final grade (IA ${Math.round(spec.weight * 100)}% + exams ${Math.round((1 - spec.weight) * 100)}%). Boundaries vary by session - a guide only.</span></div></section>`;
    const left = IB.qs("#iaLeft");
    const recompute = (tot) => {
      IB.qs("#iaRing").innerHTML = ring(tot, spec.total, "predicted IA");
      const iaPct = Math.round((tot / spec.total) * 100);
      const ex = +IB.qs("#examPct").value;
      IB.qs("#iaPct").textContent = iaPct + "%";
      IB.qs("#examVal").textContent = ex + "%";
      const overall = iaPct * spec.weight + ex * (1 - spec.weight);
      const g = IB.grade(Math.round(overall), sid);
      const el = IB.qs("#predGrade");
      if (el.textContent !== String(g)) { el.textContent = g; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    };
    const block = criteriaBlock(spec, sid, recompute);
    left.appendChild(block);
    if (IB.config.ai) left.appendChild(aiBlock(spec, s.name, "internal assessment", (marks) => { block.setScores(marks); IB.toast("Sliders updated with the AI's predicted marks."); }));
    right.appendChild(timelineBlock(spec.timeline, sid + "-tl"));
    IB.qs("#examPct").oninput = () => {
      save(sid, Object.assign({}, st()[sid] || {}, { exam: +IB.qs("#examPct").value }));
      recompute(block.criteria.reduce((n, c) => n + (+IB.qs(`.crit[data-i="${block.criteria.indexOf(c)}"] input`, block).value) * (spec.repeat && c !== spec.extra ? spec.repeat : 1), 0));
    };
  }

  function renderEE() {
    const spec = IB.ee;
    const body = IB.qs("#iaBody");
    body.innerHTML = `<div class="ia-hero" style="--c:var(--primary)"><div><span class="eyebrow">DP core · ${spec.total} marks · grades A-E</span><h2>Extended Essay</h2><p>${spec.length}</p><p class="small">${spec.note}</p></div><div id="eeRing"></div></div>
      <div class="ia-layout"><div id="eeLeft"></div><aside id="eeRight"></aside></div>`;
    const left = IB.qs("#eeLeft"), right = IB.qs("#eeRight");
    const rq = IB.el(`<section class="card"><h3 style="margin-top:0">Research question checker</h3>
      <label class="field" for="eeSubj">EE subject</label><select id="eeSubj">${IB.subjectList().map((s) => `<option>${s.name}</option>`).join("")}<option>History</option><option>Psychology</option><option>Business Management</option><option>World Studies</option><option>Other</option></select>
      <label class="field" for="rqText" style="margin-top:10px">Your research question</label><textarea id="rqText" rows="3" placeholder="To what extent…">${IB.esc((st().ee || {}).rq || "")}</textarea>
      <div class="btn-row" style="margin-top:10px"><button class="btn primary" id="rqBtn">✓ Check my RQ</button></div><div id="rqOut"></div>
      <ul class="small muted" style="margin-top:12px">${spec.rqTips.map((t) => `<li>${t}</li>`).join("")}</ul></section>`);
    left.appendChild(rq);
    IB.qs("#rqBtn").onclick = async () => {
      const q = IB.qs("#rqText").value.trim(), subj = IB.qs("#eeSubj").value;
      if (q.length < 10) return IB.toast("Type your research question first.");
      save("ee", Object.assign({}, st().ee || {}, { rq: q }));
      const out = IB.qs("#rqOut");
      if (!(await IB.ai.available())) {
        const checks = [[/\?$/.test(q), "Ends as a question"], [q.split(/\s+/).length >= 10 && q.split(/\s+/).length <= 40, "Length 10-40 words"], [/to what extent|how (far|effectively|significantly)|why|what is the (effect|impact|relationship)/i.test(q), "Uses an arguable stem (to what extent / how / what is the effect)"], [/\d{4}|[A-Z][a-z]+/.test(q.slice(1)), "Names a specific case, place, text or period"]];
        out.innerHTML = `<div class="feedback mid"><h4>Research question checklist</h4><ul class="small">${checks.map(([ok, t]) => `<li>${ok ? "✓" : "✗"} ${t}</li>`).join("")}</ul></div>`;
        return;
      }
      IB.qs("#rqBtn").disabled = true;
      try {
        const r = await IB.ai.json(`You are an IB Extended Essay supervisor for ${subj}. Evaluate this research question: "${q}".
Judge it on: focus/specificity, arguability, feasibility in 4000 words with accessible sources, and fit with ${subj} methods. Reply with only JSON: {"score": <1-10>, "verdict": "one sentence", "strengths": ["..."], "problems": ["..."], "better": ["2-3 improved versions of the RQ"]}`);
        out.innerHTML = `<div class="feedback ${r.score >= 7 ? "good" : r.score >= 4 ? "mid" : "low"}"><h4>${IB.esc(r.score)}/10 · ${IB.esc(r.verdict || "")}</h4>
          ${(r.strengths || []).length ? `<p class="small"><strong>Strengths</strong></p><ul class="small">${r.strengths.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ul>` : ""}
          ${(r.problems || []).length ? `<p class="small"><strong>Problems</strong></p><ul class="small">${r.problems.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ul>` : ""}
          ${(r.better || []).length ? `<p class="small"><strong>Stronger versions</strong></p><ol class="small">${r.better.map((x) => `<li>${IB.esc(x)}</li>`).join("")}</ol>` : ""}</div>`;
      } catch (e) { IB.toast(e.message); }
      IB.qs("#rqBtn").disabled = false;
    };
    const update = (tot) => {
      const g = spec.grades.find(([, lo, hi]) => tot >= lo && tot <= hi);
      IB.qs("#eeRing").innerHTML = ring(tot, spec.total, "grade " + (g ? g[0] : "-"));
    };
    const block = criteriaBlock(spec, "ee-scores", update);
    left.appendChild(block);
    if (IB.config.ai) left.appendChild(aiBlock(spec, IB.qs("#eeSubj").value, "Extended Essay", (marks) => { block.setScores(marks); IB.toast("Sliders updated with the AI's predicted marks."); }));
    right.appendChild(IB.el(`<section class="card"><h3 style="margin-top:0">EE grade bands</h3><table class="compare">${spec.grades.map(([g, lo, hi]) => `<tr><th scope="row">${g}</th><td class="mono">${lo}-${hi}</td></tr>`).join("")}</table><p class="small muted">Approximate - boundaries are set each session.</p></section>`));
    right.appendChild(timelineBlock(spec.timeline, "ee-tl"));
  }

  function renderCore() {
    const m = IB.ee.matrix;
    const saved = st().core || { tok: "B", ee: "B" };
    const body = IB.qs("#iaBody");
    body.innerHTML = `<div class="ia-hero" style="--c:var(--primary)"><div><span class="eyebrow">DP core</span><h2>TOK / EE bonus points</h2><p>Up to 3 points are added to your subject total (max 45). An E in either TOK or the EE is a failing condition.</p></div><div id="coreBig" class="core-big"></div></div>
      <div class="card"><div class="filters" style="max-width:420px"><label class="field" for="tokG">TOK grade</label><label class="field" for="eeG">EE grade</label>
        <select id="tokG">${m.order.map((g) => `<option ${g === saved.tok ? "selected" : ""}>${g}</option>`).join("")}</select>
        <select id="eeG">${m.order.map((g) => `<option ${g === saved.ee ? "selected" : ""}>${g}</option>`).join("")}</select></div>
        <div class="table-wrap" style="margin-top:16px"><table class="compare matrix" id="mx"><tr><th>TOK \\ EE</th>${m.order.map((g) => `<th>${g}</th>`).join("")}</tr>${m.order.map((t) => `<tr><th scope="row">${t}</th>${m.points[t].map((p, i) => `<td data-t="${t}" data-e="${m.order[i]}" class="mono">${p === "F" ? "Fail" : p}</td>`).join("")}</tr>`).join("")}</table></div></div>`;
    const upd = () => {
      const t = IB.qs("#tokG").value, e = IB.qs("#eeG").value;
      save("core", { tok: t, ee: e });
      const p = m.points[t][m.order.indexOf(e)];
      IB.qs("#coreBig").innerHTML = `<strong>${p === "F" ? "Fail" : "+" + p}</strong><span>${p === "F" ? "failing condition" : "bonus point" + (p === 1 ? "" : "s")}</span>`;
      IB.qsa("#mx td").forEach((td) => td.classList.toggle("hit", td.dataset.t === t && td.dataset.e === e));
    };
    IB.qs("#tokG").onchange = upd;
    IB.qs("#eeG").onchange = upd;
    upd();
  }

  function render() {
    IB.qsa("#viewTabs button").forEach((b) => b.classList.toggle("active", b.dataset.v === view));
    if (view === "ee") renderEE();
    else if (view === "core") renderCore();
    else renderIA();
    IB.animate(IB.qs("#iaBody"));
  }
  render();
};
