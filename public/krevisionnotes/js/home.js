/* kRevisionNotes dashboard: subject-first navigation and lightweight account sync. */
IB.page = function () {
  const app = IB.qs("#app");
  const signedIn = !!(IB.cloud && IB.cloud.user);
  if (signedIn) IB.applyPrefs();
  const prefs = signedIn ? IB.getPrefs() : null;

  app.innerHTML = `
    <section class="home-heading">
      <div><h1>Choose a subject</h1><p class="muted">Open notes, review topics, or practise questions.</p></div>
      <button class="btn" id="editSubs">Choose subjects</button>
    </section>
    <div class="home-account ${signedIn ? "is-signed-in" : ""}">
      <span>${signedIn ? "Progress syncs to your account." : "Progress saves in this browser."}</span>
      ${signedIn ? "" : '<button type="button" class="text-btn" id="homeSignIn">Sign in to sync</button>'}
    </div>
    <div class="subject-toolbar">
      <label class="subject-search-wrap"><span class="sr-only">Search subjects</span><input id="subjectSearch" class="subject-search" type="search" placeholder="Search subjects…" autocomplete="off"></label>
      <span class="muted small" id="subjectCount"></span>
    </div>
    <section class="subject-grid subject-grid-clean" id="subjects" aria-label="Subjects"></section>
    <p class="muted small subject-empty" id="subjectEmpty" hidden>No subjects match that search.</p>`;

  IB.qs("#editSubs").onclick = () => IB.chooseSubjects();
  const signIn = IB.qs("#homeSignIn");
  if (signIn) signIn.onclick = () => IB.cloud.signIn();

  const grid = IB.qs("#subjects");
  const search = IB.qs("#subjectSearch");
  const count = IB.qs("#subjectCount");
  const empty = IB.qs("#subjectEmpty");
  const subjects = IB.subjectList();
  const selected = new Set(prefs ? prefs.subjects : []);
  const cards = subjects.map((s) => {
    const isSelected = selected.has(s.id);
    const topics = s.topics.length;
    const questions = IB.allQuestions(s.id).length;
    const card = IB.el(`<a class="card subject-card subject-card-main" href="notes.html?subject=${s.id}" data-subject="${s.id}" data-search="${IB.esc((s.baseName + " " + s.baseShort).toLowerCase())}" style="--c:${s.color}">
      <span class="subject-icon">${IB.subjectIcon(s.id, 26)}</span>
      <span class="subject-copy"><strong>${IB.esc(s.baseName)}</strong><span class="subject-meta">${IB.levelOf(s.id)} · ${topics} topics</span></span>
      <span class="subject-questions">${questions} questions</span>
      ${isSelected ? '<span class="subject-picked">Selected</span>' : ""}
      <span class="subject-open" aria-hidden="true">→</span>
    </a>`);
    grid.appendChild(card);
    return card;
  });
  function filterSubjects() {
    const q = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const show = !q || card.dataset.search.includes(q);
      card.hidden = !show;
      if (show) visible++;
    });
    count.textContent = `${visible} subject${visible === 1 ? "" : "s"}`;
    empty.hidden = visible !== 0;
  }
  search.addEventListener("input", filterSubjects);
  filterSubjects();
};

IB.chooseSubjects = function () {
  if (IB.qs("#subjModal")) return;
  const subs = IB.subjectList();
  const prefs = IB.getPrefs();
  const sel = new Set(prefs ? prefs.subjects : []);
  const lv = {};
  subs.forEach((s) => {
    lv[s.id] = (prefs && prefs.levels && prefs.levels[s.id]) || IB.levelOf(s.id);
    if (!s.levels.includes(lv[s.id])) lv[s.id] = s.levels[0];
  });
  const row = (s) => `<div class="pick-row" data-sid="${s.id}" style="--c:${s.color}">
    <label class="pick-main"><input type="checkbox" ${sel.has(s.id) ? "checked" : ""} aria-label="${IB.esc(s.baseName)}"><span class="sc-mono small">${IB.subjectIcon(s.id, 22)}</span><span class="pick-name">${IB.esc(s.baseName)}</span></label>
    ${IB.hasHL(s.id) ? `<div class="lvl-switch small" role="group" aria-label="${IB.esc(s.baseName)} level">${["SL", "HL"].map((x) => `<button type="button" data-pick-sid="${s.id}" data-pick-lv="${x}" class="${lv[s.id] === x ? "on" : ""}" aria-pressed="${lv[s.id] === x}">${x}</button>`).join("")}</div>` : `<span class="pill">${s.levels[0]} only</span>`}
  </div>`;
  const m = IB.el(`<div class="ib-modal" id="subjModal" role="dialog" aria-modal="true" aria-label="Choose subjects">
    <div class="ib-modal-box card">
      <h2 class="modal-heading">Choose subjects</h2>
      <p class="muted">Select the subjects you study and set SL or HL.</p>
      <div class="pick-list">${subs.map(row).join("")}</div>
      <div class="btn-row modal-actions"><button type="button" class="btn primary" id="saveSubs">Save</button><button type="button" class="btn" id="skipSubs">Cancel</button><span class="muted small" id="pickMsg"></span></div>
    </div></div>`);
  document.body.appendChild(m);
  const close = () => { m.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  m.addEventListener("click", (e) => {
    if (e.target === m) return close();
    const b = e.target.closest("[data-pick-sid]");
    if (b) {
      lv[b.dataset.pickSid] = b.dataset.pickLv;
      IB.qsa(`[data-pick-sid="${b.dataset.pickSid}"]`, m).forEach((x) => {
        const on = x === b;
        x.classList.toggle("on", on);
        x.setAttribute("aria-pressed", String(on));
      });
    }
  });
  m.addEventListener("change", (e) => {
    const r = e.target.closest(".pick-row");
    if (!r || e.target.type !== "checkbox") return;
    if (e.target.checked) sel.add(r.dataset.sid); else sel.delete(r.dataset.sid);
    IB.qs("#pickMsg", m).textContent = "";
  });
  IB.qs("#skipSubs", m).onclick = close;
  IB.qs("#saveSubs", m).onclick = () => {
    if (!sel.size) { IB.qs("#pickMsg", m).textContent = "Choose at least one subject."; return; }
    const ids = IB.order.filter((id) => sel.has(id));
    IB.savePrefs(ids, lv);
    if (IB.cloud && IB.cloud.syncNow) IB.cloud.syncNow();
    close();
    IB.toast("Subjects saved.");
    IB.runPage();
  };
};
