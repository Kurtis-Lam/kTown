/* Exam Skills: answer frameworks for every question type + markscheme decoder, per subject. */
IB.page = function () {
  const app = IB.qs("#app");
  let sid = IB.param("subject") || "econ";
  if (!IB.frameworks[sid]) sid = "econ";

  app.innerHTML = `<h1 style="margin-bottom:.2em">Exam skills</h1>
    <p class="muted" style="margin-top:0">An answer framework for every question type, sentence starters, worked examples, and the markscheme decoded - so you know exactly where every mark comes from.</p>
    <div class="subject-tabs" id="subTabs"></div>
    <div class="tabs" id="modeTabs" style="margin-top:14px"><button data-m="frameworks" class="active">Answer frameworks</button><button data-m="decoder">Markscheme decoder</button><button data-m="terms">Command terms</button></div>
    <div id="skillBody"></div>`;

  let mode = "frameworks";
  const go = (s) => { sid = s; history.replaceState(null, "", `skills.html?subject=${s}`); render(); };

  function render() {
    const s = IB.subjects[sid], F = IB.frameworks[sid];
    document.body.style.setProperty("--c", s.color);
    IB.qs("#subTabs").innerHTML = IB.subjectList().filter((x) => IB.frameworks[x.id]).map((x) => `<button data-s="${x.id}" class="${x.id === sid ? "active" : ""}" style="--c:${x.color}">${x.name}</button>`).join("");
    IB.qsa("#subTabs button").forEach((b) => (b.onclick = () => go(b.dataset.s)));
    IB.qsa("#modeTabs button").forEach((b) => {
      b.classList.toggle("active", b.dataset.m === mode);
      b.onclick = () => { mode = b.dataset.m; render(); };
    });
    const body = IB.qs("#skillBody");
    if (mode === "frameworks") {
      body.innerHTML = `<div class="fw-chips" style="--c:${s.color}">${F.frameworks.map((f, i) => `<button class="fw-chip ${i === 0 ? "active" : ""}" data-i="${i}"><span>${IB.esc(f.type)}</span><span class="mono small">${IB.esc(f.marks)}</span></button>`).join("")}</div><div id="fwPanel"></div>`;
      const show = (i) => {
        IB.qsa(".fw-chip", body).forEach((c) => c.classList.toggle("active", +c.dataset.i === i));
        renderFramework(s, F.frameworks[i]);
      };
      IB.qsa(".fw-chip", body).forEach((c) => (c.onclick = () => show(+c.dataset.i)));
      show(0);
    } else if (mode === "decoder") {
      body.innerHTML = F.decoder.map((d) => `<section class="card" data-reveal style="margin-top:16px"><h2 style="margin-top:0">${IB.esc(d.title)}</h2><div class="table-wrap"><table class="compare"><tr><th>Band / code</th><th>What the markscheme says</th><th>What it means</th><th>How to get there</th></tr>${d.rows.map((r) => `<tr><th scope="row" class="mono">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</table></div></section>`).join("") + (s.gameplan && s.gameplan.codes ? `<section class="callout tip"><h3 class="callout-title">Quick reference</h3><div class="table-wrap"><table class="compare">${s.gameplan.codes.map((r) => `<tr><th scope="row" class="mono">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div></section>` : "");
    } else {
      body.innerHTML = `<section class="card"><h2 style="margin-top:0">Command terms - ${s.name}</h2><dl>${s.commandTerms.map(([k, v]) => `<div class="keyterm"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></section>`;
    }
    IB.math(body);
    IB.animate(body);
  }

  function renderFramework(s, f) {
    const panel = IB.qs("#fwPanel");
    panel.innerHTML = `<article class="fw" style="--c:${s.color}">
      <div class="fw-head">
        <div><span class="eyebrow">${IB.esc(f.when)}</span><h2>${IB.esc(f.type)}</h2></div>
        <div class="fw-meta"><span class="pill">${IB.esc(f.marks)} marks</span><span class="pill">⏱ ${IB.esc(f.time)}</span></div>
      </div>
      <div class="fw-grid">
        <section class="callout formula"><h3 class="callout-title">Framework</h3><ol class="fw-steps">${f.structure.map(([k, v]) => `<li><strong>${k}</strong><span>${v}</span></li>`).join("")}</ol></section>
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          ${f.starters && f.starters.length ? `<section class="callout method" style="margin:0"><h3 class="callout-title">Sentence starters</h3><ul>${f.starters.map((x) => `<li>${x}</li>`).join("")}</ul></section>` : ""}
          <section class="callout tip" style="margin:0"><h3 class="callout-title">Top-band checklist</h3><ul class="checklist">${f.checklist.map((x) => `<li>${x}</li>`).join("")}</ul></section>
        </div>
      </div>
      <section class="callout example"><h3 class="callout-title">Worked example</h3><p><strong>${f.example.q}</strong></p><p style="margin-bottom:0">${f.example.a}</p></section>
      <section class="card fw-try"><h3 style="margin-top:0">Practise it</h3>
        <p class="small muted">Write an answer using this framework (to the example question or your own) and get feedback on how well it follows the structure.</p>
        <label class="field" for="fwQ">Question you're answering</label><input type="text" id="fwQ" value="${IB.esc(f.example.q.replace(/<[^>]+>/g, ""))}">
        <label class="field" for="fwA" style="margin-top:10px">Your answer</label><textarea id="fwA" rows="8" placeholder="Write your answer here…"></textarea>
        <div class="btn-row" style="margin-top:10px"><button class="btn primary" id="fwMark">✦ Check against the framework</button></div>
        <div id="fwOut"></div>
      </section>
    </article>`;
    IB.qs("#fwMark").onclick = async () => {
      const ans = IB.qs("#fwA").value.trim();
      if (!ans) return IB.toast("Write an answer first.");
      const btn = IB.qs("#fwMark");
      btn.disabled = true;
      btn.textContent = "Checking…";
      const q = { subject: s.id, topic: s.topics[0].id, q: IB.esc(IB.qs("#fwQ").value), marks: Math.max(1, parseInt(f.marks, 10) || 4), ms: f.structure.map(([k, v]) => `${k}: ${v}`).concat(f.checklist), type: "short" };
      let fb;
      try {
        fb = (await IB.ai.available()) ? await IB.ai.mark(q, ans) : IB.offlineMark(q, ans);
      } catch (e) {
        IB.toast(e.message);
        fb = IB.offlineMark(q, ans);
      }
      IB.qs("#fwOut").innerHTML = "";
      IB.qs("#fwOut").appendChild(IB.feedbackEl(fb));
      IB.math(IB.qs("#fwOut"));
      btn.disabled = false;
      btn.textContent = "✦ Check again";
    };
    IB.math(panel);
  }

  render();
};
