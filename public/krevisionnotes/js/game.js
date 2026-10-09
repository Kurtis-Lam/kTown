/* Game layer: XP, levels, streak, daily quests and badges. Everything is computed from the saved progress
   (attempts, revised topics, mocks, fixed mistakes), so it syncs with the account and can't drift. */
(function () {
  "use strict";
  const IB = window.IB;
  const DAY = 86400000;
  const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const weekStart = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); const wd = (d.getDay() + 6) % 7; return d.getTime() - wd * DAY; };
  IB.dayKey = dayKey;
  IB.weekKey = () => dayKey(weekStart());

  // ---------- XP ----------
  // answering: 1 XP per attempt + 2 XP per mark scored; full marks on a written answer +3;
  // revising a topic 10; finishing a quiz/mock 15/40; fixing a mistake 5; each completed daily quest 20.
  const XP = { attempt: 1, mark: 2, perfect: 3, read: 10, quiz: 15, mock: 40, fix: 5, quest: 20 };
  function events(d) {
    const ev = [];
    d.attempts.forEach((a) => ev.push([a.at, XP.attempt + XP.mark * (a.sc || 0) + (a.sc >= a.mx && a.mx > 1 ? XP.perfect : 0)]));
    Object.values(d.read || {}).forEach((t) => typeof t === "number" && ev.push([t, XP.read]));
    (d.exams || []).forEach((e) => ev.push([e.at, /mock|paper/i.test(e.title || "") ? XP.mock : XP.quiz]));
    Object.values(d.mistakes || {}).forEach((m) => m.fixed && m.fixedAt && ev.push([m.fixedAt, XP.fix]));
    Object.entries(d.quests || {}).forEach(([day, ids]) => (ids || []).forEach(() => ev.push([new Date(day + "T12:00:00").getTime(), XP.quest])));
    return ev;
  }
  IB.xp = (d = IB.store.get()) => events(d).reduce((n, [, x]) => n + x, 0);
  IB.weekXp = (d = IB.store.get()) => { const ws = weekStart(); return events(d).reduce((n, [t, x]) => n + (t >= ws ? x : 0), 0); };
  IB.todayXp = (d = IB.store.get()) => { const k = dayKey(Date.now()); return events(d).reduce((n, [t, x]) => n + (dayKey(t) === k ? x : 0), 0); };
  // Level n needs 60·n·(n−1) XP in total: 120 for level 2, 360 for 3, 720 for 4 …
  IB.levelInfo = (xp) => {
    let lv = 1;
    while (60 * (lv + 1) * lv <= xp) lv++;
    const lo = 60 * lv * (lv - 1), hi = 60 * (lv + 1) * lv;
    return { level: lv, xp, into: xp - lo, need: hi - lo, pct: Math.round(((xp - lo) / (hi - lo)) * 100) };
  };

  // ---------- streak ----------
  function activeDays(d) {
    const s = new Set();
    d.attempts.forEach((a) => s.add(dayKey(a.at)));
    Object.values(d.read || {}).forEach((t) => typeof t === "number" && s.add(dayKey(t)));
    return s;
  }
  IB.streak = (d = IB.store.get()) => {
    const days = activeDays(d);
    let n = 0, t = Date.now();
    if (!days.has(dayKey(t))) t -= DAY; // today not done yet: the streak is still alive from yesterday
    while (days.has(dayKey(t))) { n++; t -= DAY; }
    return { days: n, today: days.has(dayKey(Date.now())), best: bestStreak(days) };
  };
  function bestStreak(days) {
    const sorted = Array.from(days).sort();
    let best = 0, run = 0, prev = null;
    sorted.forEach((k) => {
      const t = new Date(k + "T12:00:00").getTime();
      run = prev !== null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = t;
    });
    return best;
  }

  // ---------- daily quests ----------
  const QUESTS = [
    { id: "q10", label: "Answer 10 questions", goal: 10, of: (t) => t.attempts.length },
    { id: "w3", label: "Full marks on 3 written answers", goal: 3, of: (t) => t.attempts.filter((a) => a.mx > 1 && a.sc >= a.mx).length },
    { id: "rev", label: "Revise a topic (mark it as revised)", goal: 1, of: (t) => t.read },
    { id: "fix", label: "Fix 2 mistakes from your notebook", goal: 2, of: (t) => t.fixed },
    { id: "m25", label: "Score 25 marks", goal: 25, of: (t) => t.attempts.reduce((n, a) => n + a.sc, 0) },
    { id: "sub3", label: "Practise 3 different topics", goal: 3, of: (t) => new Set(t.attempts.map((a) => a.t)).size },
    { id: "quiz", label: "Finish a quiz or mock", goal: 1, of: (t) => t.exams },
    { id: "q20", label: "Answer 20 questions", goal: 20, of: (t) => t.attempts.length },
  ];
  const seed = (k) => k.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  IB.dailyQuests = (d = IB.store.get()) => {
    const k = dayKey(Date.now());
    const today = {
      attempts: d.attempts.filter((a) => dayKey(a.at) === k),
      read: Object.values(d.read || {}).filter((t) => typeof t === "number" && dayKey(t) === k).length,
      fixed: Object.values(d.mistakes || {}).filter((m) => m.fixed && m.fixedAt && dayKey(m.fixedAt) === k).length,
      exams: (d.exams || []).filter((e) => dayKey(e.at) === k).length,
    };
    const pool = QUESTS.slice();
    const out = [];
    let h = seed(k);
    while (out.length < 3) { const i = h % pool.length; out.push(pool.splice(i, 1)[0]); h = (h * 1103515245 + 12345) >>> 0; }
    const claimed = (d.quests || {})[k] || [];
    return out.map((q) => { const v = Math.min(q.goal, q.of(today)); return { id: q.id, label: q.label, goal: q.goal, value: v, done: v >= q.goal, claimed: claimed.includes(q.id) }; });
  };
  // Completed quests are banked automatically (so their XP counts) whenever progress is saved.
  function bankQuests() {
    const d = IB.store.get();
    const k = dayKey(Date.now());
    const done = IB.dailyQuests(d).filter((q) => q.done && !q.claimed);
    if (!done.length) return [];
    IB.store.update((x) => { x.quests = x.quests || {}; x.quests[k] = (x.quests[k] || []).concat(done.map((q) => q.id)); });
    return done;
  }

  // ---------- badges ----------
  const subjMastery = (d, sid) => {
    const s = IB.subjects[sid];
    const ms = s.allTopics.map((t) => IB.mastery(t.id, d)).filter((m) => m !== null);
    return ms.length >= 3 ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null;
  };
  const BADGES = [
    ["first", "✓", "First answer", "Answer your first question", (d) => d.attempts.length >= 1, "#2F9E44"],
    ["q100", "100", "Century", "Answer 100 questions", (d) => d.attempts.length >= 100, "#1864AB"],
    ["q500", "500", "Question machine", "Answer 500 questions", (d) => d.attempts.length >= 500, "#5F3DC4"],
    ["q1000", "1k", "Thousand club", "Answer 1,000 questions", (d) => d.attempts.length >= 1000, "#0F1B2D"],
    ["s3", "3🔥", "On a roll", "3-day streak", (d, st) => st.best >= 3, "#E8590C"],
    ["s7", "7🔥", "Week warrior", "7-day streak", (d, st) => st.best >= 7, "#D9480F"],
    ["s30", "30🔥", "Unstoppable", "30-day streak", (d, st) => st.best >= 30, "#B42318"],
    ["read10", "📖", "Bookworm", "Revise 10 topics", (d) => Object.keys(d.read || {}).length >= 10, "#0B8AA8"],
    ["fix10", "🛠", "Mistake fixer", "Fix 10 mistakes", (d) => Object.values(d.mistakes || {}).filter((m) => m.fixed).length >= 10, "#C2255C"],
    ["mock", "★", "Mock champion", "Score 80%+ on a mock or quiz of 10+ marks", (d) => (d.exams || []).some((e) => e.mx >= 10 && e.sc / e.mx >= 0.8), "#C27803"],
    ["perfect", "💯", "Perfectionist", "Full marks on 10 written answers", (d) => d.attempts.filter((a) => a.mx >= 3 && a.sc >= a.mx).length >= 10, "#7048E8"],
    ["hl", "HL", "Higher level", "Practise an AHL topic", (d) => d.attempts.some((a) => { const t = IB.topic(a.t); return t && t.hl; }), "#7048E8"],
    ["poly", "8", "All-rounder", "Practise every one of your subjects", (d) => IB.subjectList().every((s) => d.attempts.some((a) => a.s === s.id)), "#2D5BFF"],
    ["level10", "Lv10", "Scholar", "Reach level 10", (d) => IB.levelInfo(IB.xp(d)).level >= 10, "#0F1B2D"],
  ].concat(["engb", "math", "phys", "chem", "bio", "econ", "geo"].map((sid) => [
    "m-" + sid, "7", `${(IB.subjects[sid] && IB.subjects[sid].baseName) || sid} expert`, "Average mastery 70%+ over 3+ topics", (d) => IB.subjects[sid] && (subjMastery(d, sid) || 0) >= 70, `var(--${sid})`,
  ]));
  IB.badges = (d = IB.store.get()) => {
    const st = IB.streak(d);
    return BADGES.map(([id, glyph, name, how, test, color]) => ({ id, glyph, name, how, color, got: !!test(d, st) }));
  };

  // ---------- public summary (what friends may see) ----------
  IB.publicSummary = (d = IB.store.get()) => {
    const xp = IB.xp(d);
    const subjects = {};
    IB.subjectList().forEach((s) => { const m = subjMastery(d, s.id); if (m !== null) subjects[s.id] = m; });
    return { xp, weekXp: IB.weekXp(d), weekKey: IB.weekKey(), level: IB.levelInfo(xp).level, streak: IB.streak(d).days, badges: IB.badges(d).filter((b) => b.got).map((b) => b.id), subjects, updated: Date.now() };
  };

  // ---------- panel: level, streak, today's quests, badges ----------
  IB.gamePanel = (d = IB.store.get(), opts = {}) => {
    const xp = IB.xp(d), li = IB.levelInfo(xp), st = IB.streak(d), qs = IB.dailyQuests(d), bs = IB.badges(d);
    const got = bs.filter((b) => b.got);
    const quest = (q) => `<li class="quest ${q.done ? "done" : ""}"><span class="qchk">${q.done ? "✓" : ""}</span><span class="qlab">${q.label}</span><span class="qbar"><span style="width:${Math.round((q.value / q.goal) * 100)}%"></span></span><span class="mono small">${q.value}/${q.goal}</span><span class="pill">+20 XP</span></li>`;
    return `<section class="game-panel" id="game" data-reveal>
      <div class="gp-level card"><div class="gp-ring" style="--p:${li.pct}"><span>${li.level}</span></div>
        <div><span class="eyebrow">Level ${li.level}</span><strong class="gp-xp">${xp.toLocaleString()} XP</strong><div class="small muted">${li.need - li.into} XP to level ${li.level + 1} · ${IB.todayXp(d)} XP today · ${IB.weekXp(d)} this week</div></div></div>
      <div class="gp-streak card ${st.today ? "lit" : ""}"><span class="flame" aria-hidden="true">🔥</span><div><strong class="gp-xp">${st.days} day${st.days === 1 ? "" : "s"}</strong><div class="small muted">${st.today ? "Streak safe for today" : st.days ? "Answer a question today to keep it" : "Answer a question to start a streak"} · best ${st.best}</div></div></div>
      <div class="gp-quests card"><div class="btn-row" style="justify-content:space-between"><strong>Today's quests</strong><span class="small muted">new quests at midnight</span></div><ul>${qs.map(quest).join("")}</ul></div>
      ${opts.compact ? `<div class="gp-badges card"><strong>Badges · ${got.length}/${bs.length}</strong><div class="badge-row">${got.slice(-7).map((b) => `<span class="badge-tile" title="${b.name}" style="--b:${b.color}">${b.glyph}</span>`).join("") || '<span class="small muted">Earn your first badge by answering a question.</span>'}</div><a class="small" href="progress.html#game">All badges →</a></div>`
        : `<div class="gp-badges card wide"><strong>Badges · ${got.length}/${bs.length}</strong><div class="badge-grid">${bs.map((b) => `<div class="badge-cell ${b.got ? "" : "is-locked"}"><span class="badge-tile ${b.got ? "" : "locked"}" style="--b:${b.color}">${b.glyph}</span><span><strong>${b.name}</strong><span class="small muted">${b.how}</span></span></div>`).join("")}</div></div>`}
    </section>`;
  };

  // ---------- header chip + XP pop-ups ----------
  IB.gameChip = () => {
    const d = IB.store.get();
    const li = IB.levelInfo(IB.xp(d)), st = IB.streak(d);
    return `<a class="xp-chip" href="progress.html#game" title="Level ${li.level} · ${li.into}/${li.need} XP to next level · ${st.days}-day streak">
      <span class="lv">Lv ${li.level}</span><span class="xpbar"><span style="width:${li.pct}%"></span></span>
      <span class="streak ${st.today ? "on" : ""}">🔥${st.days}</span></a>`;
  };
  let lastXp = null, lastLevel = null;
  IB.gameRefresh = () => {
    const chip = IB.qs(".xp-chip");
    if (chip) chip.outerHTML = IB.gameChip();
  };
  // Called after every save: banks quests and shows +XP / level-up feedback.
  IB.afterSave = () => {
    const quests = bankQuests();
    const d = IB.store.get();
    const xp = IB.xp(d), lv = IB.levelInfo(xp).level;
    if (lastXp !== null && xp > lastXp) floatXp(xp - lastXp);
    quests.forEach((q) => IB.toast && IB.toast(`Daily quest complete: ${q.label} · +${XP.quest} XP`));
    if (lastLevel !== null && lv > lastLevel) levelUp(lv);
    lastXp = xp;
    lastLevel = lv;
    IB.gameRefresh();
    if (IB.cloud && IB.cloud.queueSave) IB.cloud.queueSave();
  };
  function floatXp(n) {
    const chip = IB.qs(".xp-chip");
    const el = document.createElement("div");
    el.className = "xp-float";
    el.textContent = `+${n} XP`;
    const r = chip ? chip.getBoundingClientRect() : { left: innerWidth - 160, bottom: 60 };
    el.style.left = r.left + "px";
    el.style.top = r.bottom + 6 + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }
  function levelUp(lv) {
    const el = IB.el(`<div class="levelup" role="status"><div class="lu-card"><span class="lu-eyebrow">Level up!</span><span class="lu-num">${lv}</span><span>Keep going - next level at ${60 * (lv + 1) * lv} XP</span></div></div>`);
    document.body.appendChild(el);
    if (IB.celebrate) IB.celebrate(el.firstChild);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 500); }, 2200);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const d = IB.store.get();
    lastXp = IB.xp(d);
    lastLevel = IB.levelInfo(lastXp).level;
  });
})();
