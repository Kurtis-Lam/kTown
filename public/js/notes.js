IB.page = function () {
  const app = IB.qs("#app");
  let subjectId = IB.param("subject") || null;
  if (subjectId && !IB.subjects[subjectId]) subjectId = null;
  let topicId = IB.param("topic");

  app.innerHTML = `<div id="notesTop"></div>
    <div class="notes-layout"><aside class="side card" id="side"></aside><section id="content"></section></div>`;

  const hlOn = () => { try { return localStorage.getItem("ibrev:hl") !== "0"; } catch (e) { return true; } };
  const go = (sid, tid) => {
    subjectId = sid || null;
    topicId = tid || null;
    const url = subjectId ? `krevisionnotes.html?subject=${subjectId}${topicId ? "&topic=" + topicId : ""}` : "krevisionnotes.html";
    history.pushState(null, "", url);
    render();
    window.scrollTo({ top: 0 });
  };

  function renderLanding() {
    const top = IB.qs("#notesTop");
    const layout = IB.qs(".notes-layout");
    const side = IB.qs("#side");
    const content = IB.qs("#content");
    layout.classList.remove("notes-active");
    side.classList.add("hidden");
    top.innerHTML = `<div class="notes-heading"><h1>kRevisionNotes</h1><span class="eyebrow">Choose a subject</span></div>`;
    content.innerHTML = `<div class="subject-picker">${IB.subjectList().map((s) => `<a class="card subject-picker-card" href="krevisionnotes.html?subject=${s.id}" style="--c:${s.color}">
      <h2>${IB.esc(s.name)}</h2><span class="subject-count">${s.topics.length} topics · ${IB.allQuestions(s.id).length.toLocaleString()} practice questions</span>
      <span class="f-cta">Open notes →</span>
    </a>`).join("")}</div>`;
    IB.math(content);
    IB.animate(content);
  }

  function render() {
    if (!subjectId) return renderLanding();
    const s = IB.subjects[subjectId];
    if (topicId && !s.topics.some((topic) => topic.id === topicId)) topicId = null;
    const data = IB.store.get();
    document.body.style.setProperty("--c", s.color);
    IB.qs(".notes-layout").classList.add("notes-active");
    IB.qs("#side").classList.remove("hidden");
    IB.qs("#notesTop").innerHTML = `<div class="notes-heading">
      <a class="btn small" href="krevisionnotes.html" id="allSubjects">← All subjects</a>
    </div>`;
    IB.qs("#allSubjects").onclick = (event) => { event.preventDefault(); go(null); };

    let side = `<a href="#" data-t="" class="btn small" style="width:100%;margin-bottom:10px;justify-content:center">Subject overview</a>`;
    let unit = "";
    s.topics.forEach((t) => {
      if (t.unit !== unit) {
        if (unit) side += "</ul></details>";
        unit = t.unit;
        side += `<details class="topic-group"><summary>${IB.esc(unit)}</summary><ul class="topic-list">`;
      }
      side += `<li><a href="#" data-t="${t.id}" class="${t.id === topicId ? "active" : ""}"><span class="code">${IB.esc(t.code)}</span><span>${IB.esc(t.title)}</span></a></li>`;
    });
    side += "</ul></details>";
    IB.qs("#side").innerHTML = side;
    IB.qsa("#side a").forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(subjectId, a.dataset.t); }));

    const t = topicId ? s.topics.find((x) => x.id === topicId) : null;
    t ? renderTopic(s, t, data) : renderOverview(s, data);
  }

  function renderOverview(s, data) {
    const c = IB.qs("#content");
    const practiced = s.topics.filter((t) => IB.mastery(t.id, data) !== null).length;
    const gp = s.gameplan;
    let unit = "", n = 0;
    const topicCards = s.topics.map((t) => {
      n++;
      const head = t.unit !== unit ? ((unit = t.unit), `<div class="unit-label">${IB.esc(t.unit)}</div>`) : "";
      const m = IB.mastery(t.id, data);
      return `${head}<a href="#" data-t="${t.id}" class="topic-card" data-reveal style="--c:${s.color}">
        <span class="topic-num">${String(n).padStart(2, "0")}</span>
        <span class="topic-card-body"><span class="mono small muted">${IB.esc(t.code)}</span><strong>${IB.esc(t.title)}</strong><span class="small muted">${t.summary}</span></span>
        <span class="topic-card-meta">${m !== null ? `<span class="pill">${m}%</span>` : ""}</span>
      </a>`;
    }).join("");
    c.innerHTML = `<details class="subject-hero" style="--c:${s.color}" data-reveal>
      <summary class="subject-hero-summary"><strong>${IB.esc(s.name)} revision notes</strong><span>${s.topics.length} topics · ${practiced} practiced</span></summary>
      <div class="subject-overview">
      <span class="eyebrow">${IB.esc(s.guide)}</span>
      <div class="hero-progress"><div class="bar"><span style="width:${IB.pct(practiced, s.topics.length)}%"></span></div><span class="small">${practiced}/${s.topics.length} topics practiced</span></div>
      <details class="download-menu no-print"><summary class="btn mark">⬇ Download</summary><div class="download-options">
        <button class="btn small" id="dlAll">PDF · all notes</button><button class="btn small" id="dlAllQ">PDF · notes + practice paper</button><button class="btn small" id="dlHtml">HTML · all notes</button>
      </div></details>
      <details class="topics-preview"><summary>Browse topics · ${s.topics.length}</summary><div class="chip-row">${s.topics.map((t) => `<a href="#" data-t="${t.id}" class="chip">${IB.esc(t.title)}</a>`).join("")}</div></details>
      </div>
    </details>
    ${gp ? `<details class="overview-detail"><summary>Exam game plan</summary><div><p style="margin-top:0">${gp.intro}</p>
      <div class="table-wrap"><table class="compare"><tr><th>Part</th><th>What it looks like</th><th>Strategy</th></tr>${gp.rows.map((r) => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div></div>
    ${gp.codes ? `<section class="callout tip" data-reveal><h3 class="callout-title">How the markscheme gives marks</h3><div class="table-wrap"><table class="compare"><tr><th>Code</th><th>Meaning</th><th>What it means for you</th></tr>${gp.codes.map((r) => `<tr><th scope="row" class="mono">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table></div></section>` : ""}
    <section class="callout method" data-reveal><h3 class="callout-title">Habits of 7-scorers</h3><ol class="habits">${gp.habits.map((h) => `<li>${h}</li>`).join("")}</ol></section>
    ${gp.extra ? `<section class="callout formula" data-reveal><h3 class="callout-title">${gp.extra.title}</h3><div class="table-wrap">${gp.extra.html}</div></section>` : ""}</div></details>` : ""}
    <details class="overview-detail"><summary>Assessment overview</summary><div class="card" data-reveal><div class="table-wrap"><table class="compare"><tr><th>Component</th><th>Time</th><th>Marks</th><th>Weight</th><th>Format</th></tr>
      ${s.assessment.map((r) => `<tr>${r.map((x, i) => (i ? `<td>${x}</td>` : `<th scope="row">${x}</th>`)).join("")}</tr>`).join("")}</table></div>
      <p class="small muted">Always confirm details against the current IB subject guide - assessment details can change between sessions.</p></div></details>
    <details class="overview-detail"><summary>Command terms</summary><div class="card" data-reveal><dl>${s.commandTerms.map(([k, v]) => `<div class="keyterm"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl></div></details>
    <h2>Topics</h2>
    <div class="topic-cards">${topicCards}</div>`;
    IB.qsa("#content a[data-t]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    const dl = (withQ) => {
      const body = `<h1>${s.name} - Revision notes</h1><p class="meta">${s.guide}</p>` + s.topics.map((t) => IB.topicHtml(t, { questions: withQ })).join('<div class="page-break"></div>');
      IB.download(`IB-${s.short.replace(/\s+/g, "-")}-notes${withQ ? "-with-questions" : ""}.html`, IB.standaloneDoc(`${s.name} notes`, body));
    };
    const pdfAll = (btn, n) => {
      btn.disabled = true;
      IB.pdfNotes({ subject: s.id, topics: s.topics, questions: n })
        .catch((error) => IB.toast(error.message || "The notes could not be downloaded."))
        .finally(() => (btn.disabled = false));
    };
    IB.qs("#dlAll").onclick = (e) => { pdfAll(e.currentTarget, 0); e.currentTarget.closest("details").open = false; };
    IB.qs("#dlAllQ").onclick = (e) => { pdfAll(e.currentTarget, 3); e.currentTarget.closest("details").open = false; };
    IB.qs("#dlHtml").onclick = (e) => { dl(true); e.currentTarget.closest("details").open = false; };
    IB.math(c);
    IB.animate(c);
  }

  function renderTopic(s, t, data) {
    const c = IB.qs("#content");
    const idx = s.topics.indexOf(t);
    const prev = s.topics[idx - 1], next = s.topics[idx + 1];
    const m = IB.mastery(t.id, data);
    const sections = IB.topicSections(t);
    const nQ = IB.topicQuestions(t.id).length;
    c.innerHTML = `<div class="topic-banner" style="--c:${s.color}" data-reveal>
      <span class="topic-big-num">${String(idx + 1).padStart(2, "0")}</span>
      <div class="topic-banner-body">
        <div class="btn-row"><span class="eyebrow">${IB.esc(t.unit)}</span>${m !== null ? `<span class="pill ${m >= 70 ? "good" : m >= 40 ? "warn" : "bad"}">Mastery ${m}%</span>` : ""}</div>
        <h1><span class="code">${IB.esc(t.code)}</span>${IB.esc(t.title)}</h1>
        <p>${t.summary}</p>
      </div>
    </div>
    <div class="btn-row no-print" style="margin:14px 0">
      <a class="btn" href="practice.html?subject=${s.id}&topic=${t.id}">Quiz this topic</a>
      <a class="btn" href="tutor.html?subject=${s.id}&topic=${t.id}">Ask the AI tutor</a>
      <details class="download-menu"><summary class="btn mark">⬇ Download</summary><div class="download-options">
        <button class="btn small" id="dlTopic">PDF · notes</button><button class="btn small" id="dlTopicQ">PDF · notes + practice paper</button><button class="btn small" id="dlSheet">HTML · worksheet</button>
      </div></details>
      <button class="btn ${hlOn() ? "on" : ""}" id="hlBtn" aria-pressed="${hlOn()}">Highlighting ${hlOn() ? "on" : "off"}</button>
    </div>
    <div class="hl-legend no-print ${hlOn() ? "" : "hidden"}">${IB.highlightKey()}</div>
    <div class="topic-sections ${hlOn() ? "" : "hl-off"}" style="--c:${s.color}">${sections.map(([, label, html]) => `<section class="topic-subtopic"><button class="subtopic-toggle" type="button" aria-expanded="false">${IB.esc(label)}<span aria-hidden="true">＋</span></button><div class="subtopic-content" hidden>${html}</div></section>`).join("")}
      <section class="topic-subtopic topic-practice"><button class="subtopic-toggle" type="button" aria-expanded="false">Practice questions · ${nQ}<span aria-hidden="true">＋</span></button><div class="subtopic-content" hidden><section class="card topic-bank" id="sec-practice" data-reveal>
        <div class="tb-head"><div><span class="eyebrow">Question bank</span><h3>${nQ} questions on ${IB.esc(t.title)}</h3></div>
          <div class="btn-row no-print">${IB.hasGenerator(t.id) ? '<button class="btn primary small" id="genBtn">+ Fresh calculation</button>' : ""}<a class="btn small" href="questionbank.html?subject=${s.id}&topic=${t.id}">Open in question bank</a><a class="btn small" href="practice.html?subject=${s.id}&topic=${t.id}">Timed quiz</a></div></div>
        <div class="sec-tabs no-print" id="secTabs" role="tablist"></div>
        <p class="small muted" id="secDesc"></p>
        <div id="practiceList"></div>
        <div class="btn-row no-print" style="justify-content:center;margin-top:12px"><button class="btn" id="moreBtn">Show more</button></div>
      </section></div></section>
    </div>
    <div class="btn-row no-print" style="justify-content:space-between;margin-top:16px">
      ${prev ? `<a class="btn" href="#" data-t="${prev.id}">← ${IB.esc(prev.title)}</a>` : "<span></span>"}
      ${next ? `<a class="btn primary" href="#" data-t="${next.id}">${IB.esc(next.title)} →</a>` : ""}
    </div>`;

    IB.qsa(".subtopic-toggle", c).forEach((button) => {
      const content = button.nextElementSibling;
      button.onclick = () => {
        const opening = button.getAttribute("aria-expanded") !== "true";
        content.getAnimations().forEach((animation) => animation.cancel());
        button.setAttribute("aria-expanded", opening);
        button.lastElementChild.textContent = opening ? "−" : "＋";
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
          content.hidden = !opening;
          return;
        }
        if (opening) {
          const startHeight = content.hidden ? 0 : content.offsetHeight;
          content.hidden = false;
          content.animate([{ height: `${startHeight}px`, opacity: startHeight ? 1 : 0 }, { height: `${content.scrollHeight}px`, opacity: 1 }], {
            duration: 220,
            easing: "ease-out",
          });
        } else {
          const animation = content.animate([{ height: `${content.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], {
            duration: 180,
            easing: "ease-in",
          });
          animation.onfinish = () => {
            if (button.getAttribute("aria-expanded") === "false") content.hidden = true;
          };
        }
      };
    });
    const list = IB.qs("#practiceList");
    const groups = IB.topicSections2(t.id);
    const done = {};
    data.attempts.forEach((a) => (done[a.id] = true));
    let cur = groups[0], shown = 0;
    const PAGE = 8;
    const more = IB.qs("#moreBtn");
    const showMore = () => {
      cur.qs.slice(shown, shown + PAGE).forEach((q, i) => {
        const card = IB.renderQuestion(q, { number: shown + i + 1, showTopic: false });
        card.classList.add("pop-in");
        list.appendChild(card);
      });
      shown = Math.min(cur.qs.length, shown + PAGE);
      more.textContent = `Show more (${cur.qs.length - shown} left)`;
      more.classList.toggle("hidden", shown >= cur.qs.length);
      IB.math(list);
    };
    const pick = (g) => {
      cur = g;
      shown = 0;
      list.innerHTML = "";
      IB.qsa("#secTabs button").forEach((b) => b.classList.toggle("active", b.dataset.k === g.k));
      IB.qs("#secDesc").textContent = g.desc;
      showMore();
    };
    IB.qs("#secTabs").innerHTML = groups.map((g) => {
      const n = g.qs.filter((q) => done[q.id]).length;
      return `<button role="tab" data-k="${g.k}" class="sec-tab k-${g.k}"><span>${IB.esc(g.name)}</span><span class="sec-count">${n ? `${n}/` : ""}${g.qs.length}</span><span class="sec-bar" style="--p:${Math.round((100 * n) / g.qs.length)}%"></span></button>`;
    }).join("");
    IB.qsa("#secTabs button").forEach((b) => (b.onclick = () => pick(groups.find((g) => g.k === b.dataset.k))));
    more.onclick = showMore;
    if (groups.length) pick(groups[0]);
    const gen = IB.qs("#genBtn");
    if (gen) gen.onclick = () => {
      const q = IB.generate(t.id);
      const card = IB.renderQuestion(q, { showTopic: false });
      card.classList.add("pop-in");
      list.prepend(card);
      IB.math(card);
    };
    IB.qsa("a[data-t]", c).forEach((a) => (a.onclick = (e) => { e.preventDefault(); go(s.id, a.dataset.t); }));
    const pdf = (btn, n) => {
      btn.disabled = true;
      IB.pdfNotes({ subject: s.id, topics: [t], questions: n })
        .catch((error) => IB.toast(error.message || "The notes could not be downloaded."))
        .finally(() => (btn.disabled = false));
    };
    IB.qs("#dlTopic").onclick = (e) => { pdf(e.currentTarget, 0); e.currentTarget.closest("details").open = false; };
    IB.qs("#dlTopicQ").onclick = (e) => { pdf(e.currentTarget, 12); e.currentTarget.closest("details").open = false; };
    IB.qs("#dlSheet").onclick = (e) => {
      IB.download(`IB-${s.short.replace(/\s+/g, "-")}-${t.title.replace(/[^\w]+/g, "-")}-worksheet.html`, IB.standaloneDoc(`${t.title} worksheet`, `<h1>${IB.esc(s.name)}: ${IB.esc(t.title)}</h1>` + IB.worksheetHtml(t.questions.filter((q) => !q.derived), "Worksheet")));
      e.currentTarget.closest("details").open = false;
    };
    IB.qs("#hlBtn").onclick = (e) => {
      const on = !hlOn();
      try { localStorage.setItem("ibrev:hl", on ? "1" : "0"); } catch (err) { /* ignore */ }
      e.currentTarget.classList.toggle("on", on);
      e.currentTarget.setAttribute("aria-pressed", on);
      e.currentTarget.textContent = `Highlighting ${on ? "on" : "off"}`;
      IB.qs(".topic-sections", c).classList.toggle("hl-off", !on);
      IB.qs(".hl-legend", c).classList.toggle("hidden", !on);
    };
    IB.math(c);
    IB.highlight(IB.qs(".topic-sections", c), { terms: (t.terms || []).map((x) => x[0]) });
    marker(c);
    IB.animate(c);
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

  window.addEventListener("popstate", () => {
    const requestedSubject = IB.param("subject");
    subjectId = requestedSubject && IB.subjects[requestedSubject] ? requestedSubject : null;
    topicId = IB.param("topic");
    render();
  });

  render();
};
