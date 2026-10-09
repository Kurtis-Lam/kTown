/* kRevisionNotes home: rotating subject demo, Google sign-in, subject chooser and the subject grid. */

// One example question per subject for the rotating demo card (same order as the subject grid).
IB.DEMOS = [
  { sid: "engb", tag: "English B HL · Paper 2", marks: 3, q: "Explain how the writer uses statistics to support the argument that cities should ban single-use plastics.", ans: "The writer states that eight million tonnes of plastic enter the oceans every year, which makes the problem sound urgent and measurable…", score: "2/3", ok: ["Identifies the statistic", "Links it to urgency"], miss: "link to the writer's purpose: persuading readers to support a ban" },
  { sid: "math", tag: "Maths AA SL · Paper 1", marks: 4, q: "The function f(x) = 3x² − 12x + 5. Find the coordinates of the vertex of the graph of f, and state the range of f.", ans: "f′(x) = 6x − 12 = 0, so x = 2. f(2) = 12 − 24 + 5 = −7. Vertex (2, −7)…", score: "3/4", ok: ["f′(x) = 0 used", "x = 2", "y = −7"], miss: "state the range: f(x) ≥ −7" },
  { sid: "phys", tag: "Physics SL · Paper 2", marks: 3, q: "A 0.50 kg ball is dropped from rest from a height of 20 m. Calculate its speed just before it hits the ground. Ignore air resistance (g = 9.81 m s⁻²).", ans: "v² = 2gh = 2 × 9.81 × 20 = 392.4, so v = 19.8", score: "2/3", ok: ["Uses v² = 2gh", "Correct substitution"], miss: "the unit in the final answer: m s⁻¹" },
  { sid: "chem", tag: "Chemistry SL · Paper 2", marks: 3, q: "Explain why water (boiling point 100 °C) boils at a much higher temperature than hydrogen sulfide (−60 °C).", ans: "Water molecules form hydrogen bonds, which are stronger than the forces between H₂S molecules, so more energy is needed to separate them…", score: "2/3", ok: ["Hydrogen bonding in water", "Stronger forces → more energy"], miss: "H₂S has only weak dipole–dipole / London forces" },
  { sid: "bio", tag: "Biology SL · Paper 2", marks: 4, q: "Explain how the structure of a mitochondrion is adapted for aerobic cell respiration.", ans: "The inner membrane is folded into cristae, giving a large surface area for the electron transport chain and ATP synthase. The matrix contains the enzymes of the Krebs cycle…", score: "3/4", ok: ["Cristae → large surface area", "ETC / ATP synthase on inner membrane", "Enzymes in the matrix"], miss: "small intermembrane space so a proton gradient builds quickly" },
  { sid: "econ", tag: "Econ SL · Paper 2", marks: 4, q: "Using a diagram, explain how a severe drought in Brazil is likely to affect the world price of coffee.", ans: "Drought reduces crop yields, so supply shifts left from S₁ to S₂. At the old price there is a shortage, so the price rises to P₂…", score: "3/4", ok: ["Supply shifts left", "Shortage → price rises", "Diagram"], miss: "label the new equilibrium Q₂" },
  { sid: "geo", tag: "Geography SL · Paper 1", marks: 4, q: "Explain how large-scale deforestation in the Amazon basin can change the local water cycle.", ans: "With fewer trees there is less transpiration and interception, so less moisture returns to the air and local rainfall falls. Surface runoff increases…", score: "3/4", ok: ["Less transpiration", "Lower local rainfall", "More surface runoff"], miss: "reduced infiltration as the soil is exposed and compacted" },
];

IB.page = function () {
  const app = IB.qs("#app");
  const signedIn = !!(IB.cloud && IB.cloud.user);
  if (signedIn) IB.applyPrefs();          // bring the account's SL / HL choices into this browser
  const data = IB.store.get();
  const subs = IB.subjectList();
  const prefs = signedIn ? IB.getPrefs() : null;
  const chosen = prefs ? subs.filter((s) => prefs.subjects.includes(s.id)) : subs;
  const others = prefs ? subs.filter((s) => !prefs.subjects.includes(s.id)) : [];
  const user = signedIn ? IB.cloud.user : null;
  const firstName = user ? String((IB.cloud.profile && IB.cloud.profile.name) || user.displayName || "").trim().split(/\s+/)[0] : "";

  const G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

  const acct = signedIn
    ? `<section class="card acct-card" id="acct">
        <div class="acct-who">${user.photoURL ? `<img src="${IB.esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="av">${IB.esc((firstName || "?")[0].toUpperCase())}</span>`}
          <div><strong>Welcome${firstName ? ", " + IB.esc(firstName) : ""}</strong>
          <div class="muted small">${prefs ? `${prefs.subjects.length} subject${prefs.subjects.length === 1 ? "" : "s"} chosen · progress synced to your account` : "Choose your subjects and SL / HL to personalise this page."}</div></div></div>
        <button class="btn ${prefs ? "" : "primary"}" id="editSubs">${prefs ? "Edit my subjects" : "Choose my subjects"}</button>
      </section>`
    : `<section class="card acct-card" id="acct">
        <div><strong>Save your progress and pick your subjects</strong>
        <div class="muted small">Sign in to sync across devices, choose your subjects with SL / HL, and add friends. Everything also works as a guest.</div></div>
        <button class="g-btn" id="gBtn" type="button">${G}<span>Continue with Google</span></button>
      </section>`;

  app.innerHTML = `
  <section class="band">
    <div class="hero">
      <div class="hero-copy">
        <span class="eyebrow">IB Diploma · 8 subjects · SL &amp; HL · Notes · Questions · Mocks · IA &amp; EE</span>
        <h1>Every topic. Every paper. <span class="ul">Marked like the real thing.</span></h1>
      </div>
      <div class="hero-demo" id="demo" aria-label="Examples of markscheme marking, one subject at a time">
        <div class="demo-slide" id="demoSlide"></div>
        <div class="demo-nav">
          <button type="button" class="demo-arrow" id="demoPrev" aria-label="Previous subject">‹</button>
          <div class="demo-dots" id="demoDots" role="tablist" aria-label="Choose a subject example"></div>
          <button type="button" class="demo-arrow" id="demoNext" aria-label="Next subject">›</button>
        </div>
      </div>
    </div>
  </section>

  <div style="margin-top:36px">${acct}</div>

  <div class="btn-row" style="justify-content:space-between;align-items:flex-end;margin-top:48px">
    <h2 style="margin:0">${prefs ? "Your subjects" : "All subjects"}</h2>
    ${prefs ? "" : `<span class="muted small">Every subject is available at SL and HL unless stated</span>`}
  </div>
  <section class="subject-grid" id="subjects" style="margin-top:20px"></section>
  ${others.length ? `<div class="more-wrap"><button type="button" class="btn" id="moreBtn" aria-expanded="false" aria-controls="otherSubjects">Show other subjects (${others.length}) ▾</button></div>
  <section class="subject-grid" id="otherSubjects" hidden></section>` : ""}`;

  // ---------- subject cards ----------
  const levelTag = (s) => (IB.hasHL(s.id) ? "SL + HL" : s.levels[0] + " only");
  const card = (s, own) => {
    const rows = s.topics.map((t) => IB.mastery(t.id, data));
    const tried = rows.filter((m) => m !== null);
    const pct = tried.length ? Math.round(rows.reduce((n, m) => n + (m ?? 0), 0) / rows.length) : 0;
    const C = 2 * Math.PI * 26;
    // Chosen subjects show the level you take; all other cards (and everything for guests) append "SL + HL".
    const nTopics = own ? s.topics.length : s.allTopics.length;
    const nQ = own ? IB.allQuestions(s.id).length : s.allTopics.reduce((n, t) => n + (t.questions || []).length, 0);
    return IB.el(`<a class="card subject-card" href="notes.html?subject=${s.id}" style="--c:${s.color}" data-reveal>
      <div class="stripe"></div>
      <div class="body">
        <div class="sc-top">
          <span class="sc-mono">${IB.subjectIcon(s.id, 28)}</span>
          <span class="sc-ring" title="${tried.length ? "Estimated grade " + IB.grade(pct, s.id) : "Not started yet"}">
            <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26" class="trk"/><circle cx="30" cy="30" r="26" class="val" style="stroke-dasharray:${C};--off:${C * (1 - pct / 100)}"/></svg>
            <b>${tried.length ? IB.grade(pct, s.id) : "–"}</b>
          </span>
        </div>
        <div>
          <h3>${IB.esc(s.baseName)}${own ? "" : ` <span class="lv-tag">${levelTag(s)}</span>`}</h3>
          <div class="stats">${nTopics} topics · ${nQ.toLocaleString()} questions</div>
          ${own ? `<div style="margin-top:10px"><span class="lv-badge">${IB.levelOf(s.id)}</span></div>` : ""}
        </div>
      </div>
    </a>`);
  };
  const grid = IB.qs("#subjects");
  chosen.forEach((s) => grid.appendChild(card(s, !!prefs)));
  if (others.length) {
    const og = IB.qs("#otherSubjects");
    others.forEach((s) => og.appendChild(card(s, false)));
    const more = IB.qs("#moreBtn");
    more.onclick = () => {
      const open = og.hasAttribute("hidden");
      if (open) og.removeAttribute("hidden"); else og.setAttribute("hidden", "");
      more.setAttribute("aria-expanded", String(open));
      more.textContent = open ? "Hide other subjects ▴" : `Show other subjects (${others.length}) ▾`;
    };
  }

  // ---------- rotating demo card: changes every 5 seconds, or use the arrows / dots ----------
  const demos = IB.DEMOS.filter((d) => IB.subjects[d.sid]);
  const slide = IB.qs("#demoSlide"), dots = IB.qs("#demoDots");
  let cur = 0;
  dots.innerHTML = demos.map((d, i) => `<button type="button" role="tab" class="demo-dot" data-i="${i}" aria-label="${IB.esc(IB.subjects[d.sid].baseName)}" style="--c:${IB.subjects[d.sid].color}"></button>`).join("");
  // All slides are stacked in one grid cell (the tallest sets the height), so switching only cross-fades:
  // nothing resizes and the page never jumps.
  const slideHtml = (d, i) => {
    const s = IB.subjects[d.sid];
    return `<div class="demo-item" data-i="${i}" aria-hidden="true">
      <div class="btn-row" style="justify-content:space-between">
        <span class="pill ${d.sid}"><span class="pill-ico" style="color:${s.color}">${IB.subjectIcon(d.sid, 15)}</span>${IB.esc(d.tag)}</span>
        <span class="mono" style="font-weight:700">[${d.marks} marks]</span>
      </div>
      <div class="demo-q">${IB.esc(d.q)}</div>
      <div class="answer">${IB.esc(d.ans)}</div>
      <div class="verdict demo-fast">
        <div style="display:flex;align-items:center;gap:12px"><span class="big">${d.score}</span><span class="pill" style="background:#DDF3E6;color:#155E34">Markscheme marker</span></div>
        <div>${d.ok.map((x) => `<strong style="color:#155E34">✓</strong> ${IB.esc(x)}`).join(" · ")}</div>
        <div><strong style="color:#B42318">✗</strong> Missing: ${IB.esc(d.miss)}</div>
      </div></div>`;
  };
  slide.innerHTML = demos.map(slideHtml).join("");
  const items = IB.qsa(".demo-item", slide);
  const draw = (i) => {
    items.forEach((el, k) => { const on = k === i; el.classList.toggle("on", on); el.setAttribute("aria-hidden", String(!on)); });
    IB.qsa(".demo-dot", dots).forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", String(k === i)); });
  };
  const show = (i) => { cur = (i + demos.length) % demos.length; draw(cur); };
  const restart = () => {
    clearInterval(window.__ibDemoTimer);
    window.__ibDemoTimer = setInterval(() => show(cur + 1), 5000);
  };
  draw(0);
  IB.qs("#demoPrev").onclick = () => { show(cur - 1); restart(); };
  IB.qs("#demoNext").onclick = () => { show(cur + 1); restart(); };
  dots.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) { show(Number(b.dataset.i)); restart(); } };
  restart();

  // ---------- account ----------
  const g = IB.qs("#gBtn");
  if (g) g.onclick = () => IB.cloud.signIn();
  const edit = IB.qs("#editSubs");
  if (edit) edit.onclick = () => IB.chooseSubjects();
  // First sign-in (no saved subjects yet): ask once per visit which subjects and levels the student takes.
  if (signedIn && !prefs) {
    IB._asked = IB._asked || {};
    if (!IB._asked[user.uid]) { IB._asked[user.uid] = true; setTimeout(() => IB.chooseSubjects(), 350); }
  }
};

// Subject chooser: tick the subjects you take and pick SL or HL for each.
IB.chooseSubjects = function () {
  if (IB.qs("#subjModal")) return;
  const subs = IB.subjectList();
  const prefs = IB.getPrefs();
  const sel = new Set(prefs ? prefs.subjects : []);
  const lv = {};
  subs.forEach((s) => { lv[s.id] = (prefs && prefs.levels && prefs.levels[s.id]) || IB.levelOf(s.id); if (!s.levels.includes(lv[s.id])) lv[s.id] = s.levels[0]; });

  const row = (s) => `<div class="pick-row" data-sid="${s.id}" style="--c:${s.color}">
      <label class="pick-main"><input type="checkbox" ${sel.has(s.id) ? "checked" : ""} aria-label="${IB.esc(s.baseName)}"><span class="sc-mono small">${IB.subjectIcon(s.id, 22)}</span><span class="pick-name">${IB.esc(s.baseName)}</span></label>
      ${IB.hasHL(s.id)
        ? `<div class="lvl-switch small" role="group" aria-label="${IB.esc(s.baseName)} level">${["SL", "HL"].map((x) => `<button type="button" data-pick-sid="${s.id}" data-pick-lv="${x}" class="${lv[s.id] === x ? "on" : ""}" aria-pressed="${lv[s.id] === x}">${x}</button>`).join("")}</div>`
        : `<span class="pill">${s.levels[0]} only</span>`}
    </div>`;

  const m = IB.el(`<div class="ib-modal" id="subjModal" role="dialog" aria-modal="true" aria-label="Choose your subjects">
    <div class="ib-modal-box card">
      <h2 style="margin:0 0 6px">Choose your subjects</h2>
      <p class="muted" style="margin:0 0 14px">Tick the subjects you take and choose SL or HL for each. Your home page will list these first; the other subjects stay one click away.</p>
      <div class="pick-list">${subs.map(row).join("")}</div>
      <div class="btn-row" style="margin-top:18px">
        <button type="button" class="btn primary" id="saveSubs">Save my subjects</button>
        <button type="button" class="btn" id="skipSubs">Not now</button>
        <span class="muted small" id="pickMsg"></span>
      </div>
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
      IB.qsa(`[data-pick-sid="${b.dataset.pickSid}"]`, m).forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); });
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
    if (!sel.size) { IB.qs("#pickMsg", m).textContent = "Pick at least one subject."; return; }
    const ids = IB.order.filter((id) => sel.has(id));
    IB.savePrefs(ids, lv);
    if (IB.cloud && IB.cloud.syncNow) IB.cloud.syncNow();
    close();
    IB.toast(`Saved: ${ids.length} subject${ids.length === 1 ? "" : "s"}.`);
    IB.runPage();
  };
};
