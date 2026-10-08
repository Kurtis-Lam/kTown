/* Friends: weekly league (friends only), add by code or invite link, requests, privacy, and friend profiles.
   Friends see XP, level, streak, badges and subject progress - never answers, essays or past papers. */
IB.page = async function () {
  const app = IB.qs("#app");
  const cloud = IB.cloud || {};
  const d = IB.store.get();
  const me = IB.publicSummary(d);
  const li = IB.levelInfo(me.xp);
  const st = IB.streak(d);
  const badges = IB.badges(d);
  const av = (name, photo, color) => photo ? `<img class="av-img" src="${IB.esc(photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="av-img" style="background:${color || "#5F3DC4"}">${IB.esc((name || "?").trim()[0] || "?").toUpperCase()}</span>`;
  const COLORS = ["#D9480F", "#0B8AA8", "#2F9E44", "#C2255C", "#1864AB", "#5F3DC4", "#C27803"];
  const colorOf = (s) => COLORS[String(s).split("").reduce((h, c) => h + c.charCodeAt(0), 0) % COLORS.length];
  const badgeHtml = (ids) => {
    const all = IB.badges(IB.store.get());
    return ids.map((id) => all.find((b) => b.id === id)).filter(Boolean).map((b) => `<span class="badge-tile" title="${IB.esc(b.name)} - ${IB.esc(b.how)}" style="--b:${b.color}">${b.glyph}</span>`).join("");
  };

  app.innerHTML = `<h1 style="margin-bottom:.2em">Friends</h1>
    <p class="muted" style="margin-top:0">Revise together, compare progress and win the weekly league. Friends see your level, XP, streak and - if you allow it - badges and subject progress. Your answers, essays and past papers are never shared.</p>
    <div id="fBody"></div>`;
  const body = IB.qs("#fBody");

  const myCard = `<section class="card me-card" data-reveal>
      <div class="me-row">${av(cloud.profile ? cloud.profile.name : "You", cloud.user && cloud.user.photoURL, "#2D5BFF")}
        <div><strong class="me-name">${IB.esc(cloud.profile ? cloud.profile.name : "You (guest)")}</strong><div class="small muted">Level ${li.level} · ${me.xp.toLocaleString()} XP · ${me.weekXp.toLocaleString()} XP this week · 🔥 ${st.days}-day streak (best ${st.best})</div></div></div>
      <div class="lvbar"><span style="width:${li.pct}%"></span></div><div class="small muted">${li.into}/${li.need} XP to level ${li.level + 1}</div>
      <div class="badge-row">${badges.filter((b) => b.got).map((b) => `<span class="badge-tile" title="${IB.esc(b.name)}" style="--b:${b.color}">${b.glyph}</span>`).join("") || '<span class="small muted">No badges yet - answer your first question!</span>'}</div>
    </section>`;

  if (cloud.configured && !cloud.ready) { body.innerHTML = `<div class="card muted">Checking your sign-in…</div>`; return; }
  if (!cloud.configured || !cloud.user) {
    body.innerHTML = `<div class="friends-grid"><div>
      <section class="card signin-card" data-reveal>
        <h2 style="margin-top:0">Sign in to add friends</h2>
        <p>Sign in with your Google account to save your progress online (on any device) and compete with friends in a private weekly league.</p>
        <ul class="small"><li>Friends see: level, XP, streak, badges and subject progress (you can hide badges and subjects).</li><li>Never shared: your answers, essays, mistakes and past papers.</li><li>Leagues are friends-only - no strangers.</li></ul>
        <button class="btn primary" id="fSignIn">Sign in with Google</button>
        ${cloud.configured ? "" : `<p class="small muted" style="margin-bottom:0">${window.IB_HOSTED ? "Accounts work on the full website, not in this preview." : "Accounts aren't switched on for this copy of the site yet (the site owner adds a Firebase project - see SETUP.md). Everything else works as a guest."}</p>`}
      </section></div><div>${myCard}</div></div>`;
    IB.qs("#fSignIn").onclick = () => cloud.signIn && cloud.signIn();
    return;
  }

  // ----- signed in -----
  const view = IB.param("friend");
  body.innerHTML = `<div class="card muted">Loading friends…</div>`;
  let friends = [], requests = [];
  try { [friends, requests] = await Promise.all([cloud.friends(), cloud.requests()]); } catch (e) { body.innerHTML = `<div class="notice warn">${IB.esc(e.message)}</div>`; return; }
  const wk = IB.weekKey();
  const wkXp = (p) => (p.public && p.public.weekKey === wk ? p.public.weekXp || 0 : 0);

  if (view) {
    const f = friends.find((x) => x.uid === view);
    if (!f) { body.innerHTML = `<div class="card">That student isn't in your friends list. <a href="friends.html">Back to friends</a></div>`; return; }
    const p = f.public || {};
    const rows = IB.subjectList().map((s) => [s, me.subjects[s.id], (p.subjects || {})[s.id]]).filter(([, a, b]) => a !== undefined || b !== undefined);
    body.innerHTML = `<section class="band-lite card" data-reveal style="--c:${colorOf(f.uid)}"><a href="friends.html" class="small">← Friends</a>
        <div class="me-row" style="margin-top:8px">${av(f.name, f.photo, colorOf(f.uid))}<div><h2 style="margin:0">${IB.esc(f.name)}</h2><div class="small muted">Level ${p.level || 1} · ${(p.xp || 0).toLocaleString()} XP · ${wkXp(f).toLocaleString()} XP this week · 🔥 ${p.streak || 0}-day streak</div></div></div></section>
      <div class="friends-grid"><section class="card" data-reveal><h3 style="margin-top:0">You vs ${IB.esc(f.name)} · subject mastery</h3>
        ${p.subjects ? (rows.length ? rows.map(([s, a, b]) => `<div class="cmp-row"><strong>${IB.esc(s.baseName)}</strong><span class="cmp-bars"><span class="b you"><span style="width:${a || 0}%"></span></span><span class="b them"><span style="width:${b || 0}%"></span></span></span><span class="mono small">${a ?? "-"} / ${b ?? "-"}</span></div>`).join("") : '<p class="muted small">No subject data yet.</p>') : `<p class="muted small">${IB.esc(f.name)} keeps subject progress private.</p>`}
        <div class="small muted" style="margin-top:8px"><span class="key you"></span> You <span class="key them"></span> ${IB.esc(f.name)}</div></section>
      <section class="card" data-reveal><h3 style="margin-top:0">Badges</h3><div class="badge-row">${p.badges ? badgeHtml(p.badges) || '<span class="small muted">None yet.</span>' : '<span class="small muted">Hidden.</span>'}</div>
        <button class="btn small" id="unf" style="margin-top:14px">Remove friend</button></section></div>`;
    IB.qs("#unf").onclick = async () => { if (confirm(`Remove ${f.name} from your friends?`)) { await cloud.unfriend(f.uid); location.href = "friends.html"; } };
    return;
  }

  const meRow = { uid: cloud.user.uid, name: cloud.profile.name, photo: cloud.user.photoURL, public: me, isMe: true };
  const league = friends.concat([meRow]).sort((a, b) => wkXp(b) - wkXp(a));
  const top = Math.max(1, ...league.map(wkXp));
  const rank = league.indexOf(meRow) + 1;
  const daysLeft = 7 - ((new Date().getDay() + 6) % 7);
  const priv = cloud.profile.privacy || { badges: true, subjects: true };
  body.innerHTML = `<div class="league-stats">
      <div class="stat-tile card"><span class="stat-big">${rank}${["st", "nd", "rd"][rank - 1] || "th"}</span><span class="muted">this week</span></div>
      <div class="stat-tile card"><span class="stat-big">${friends.length}</span><span class="muted">friends</span></div>
      <div class="stat-tile card accent"><span class="stat-big">${daysLeft} day${daysLeft > 1 ? "s" : ""}</span><span>left in this league</span></div></div>
    <div class="friends-grid"><section class="card" data-reveal><div class="btn-row" style="justify-content:space-between"><h2 style="margin:0">Weekly league</h2><span class="small muted">XP since Monday · friends only</span></div>
      ${league.length > 1 ? league.map((f, i) => `<a class="league-row ${f.isMe ? "me" : ""} ${i === 0 ? "first" : ""}" href="${f.isMe ? "progress.html#game" : "friends.html?friend=" + f.uid}">
        <span class="rk">${i + 1}</span>${av(f.name, f.photo, colorOf(f.uid))}
        <span class="nm"><strong>${IB.esc(f.isMe ? "You" : f.name)}</strong><span class="small muted">Lv ${(f.public || {}).level || 1} · 🔥${(f.public || {}).streak || 0}</span></span>
        <span class="lbar"><span style="width:${Math.round((wkXp(f) / top) * 100)}%"></span></span><span class="mono">${wkXp(f).toLocaleString()}</span></a>`).join("") : `<div class="empty"><div class="empty-icon">🏆</div><p class="muted">Add a friend to start a league. Share your code or invite link →</p></div>`}
    </section>
    <aside class="stack">
      <section class="card" data-reveal><h3 style="margin-top:0">Add a friend</h3>
        <span class="small muted">Your friend code</span>
        <div class="btn-row"><span class="code-box mono">${IB.esc(cloud.profile.code)}</span><button class="btn small" id="copyLink">Copy invite link</button></div>
        <label class="field" for="fCode" style="margin-top:12px">Enter a friend's code</label>
        <div class="btn-row"><input type="text" id="fCode" placeholder="IB-XXXXX" style="flex:1;min-width:140px"><button class="btn primary" id="fSend">Send request</button></div>
        ${requests.map((r) => `<div class="req">${av(r.name, r.photo, colorOf(r.uid))}<span style="flex:1"><strong>${IB.esc(r.name)}</strong> wants to be friends</span><button class="btn small primary" data-acc="${r.uid}">Accept</button><button class="btn small" data-dec="${r.uid}">Decline</button></div>`).join("")}
      </section>
      <section class="card" data-reveal><h3 style="margin-top:0">What friends can see</h3>
        <label class="pv"><input type="checkbox" checked disabled> Level, XP and streak <span class="small muted">always</span></label>
        <label class="pv"><input type="checkbox" id="pvB" ${priv.badges ? "checked" : ""}> Badges</label>
        <label class="pv"><input type="checkbox" id="pvS" ${priv.subjects ? "checked" : ""}> Subject progress (mastery %)</label>
        <label class="pv"><input type="checkbox" disabled> Answers, essays, mistakes and past papers <span class="small muted">never shared</span></label>
        <label class="field" for="pvName" style="margin-top:10px">Display name</label><div class="btn-row"><input type="text" id="pvName" value="${IB.esc(cloud.profile.name)}" maxlength="40" style="flex:1"><button class="btn small" id="pvSave">Save</button></div>
      </section>
      ${myCard}
    </aside></div>`;

  const invite = `${location.origin}${location.pathname.replace(/[^/]*$/, "")}friends.html?add=${cloud.profile.code}`;
  IB.qs("#copyLink").onclick = async () => { try { await navigator.clipboard.writeText(invite); IB.toast("Invite link copied."); } catch (e) { prompt("Copy this invite link:", invite); } };
  const send = async (c) => {
    try { await cloud.requestByCode(c); IB.toast("Friend request sent."); IB.qs("#fCode").value = ""; } catch (e) { IB.toast(e.message); }
  };
  IB.qs("#fSend").onclick = () => send(IB.qs("#fCode").value);
  IB.qsa("[data-acc]").forEach((b) => (b.onclick = async () => { await cloud.accept(b.dataset.acc); IB.toast("Friend added!"); IB.runPage(); }));
  IB.qsa("[data-dec]").forEach((b) => (b.onclick = async () => { await cloud.decline(b.dataset.dec); IB.runPage(); }));
  IB.qs("#pvB").onchange = (e) => cloud.setPrivacy({ badges: e.target.checked });
  IB.qs("#pvS").onchange = (e) => cloud.setPrivacy({ subjects: e.target.checked });
  IB.qs("#pvSave").onclick = async () => { await cloud.setName(IB.qs("#pvName").value.trim() || "Student"); IB.toast("Name saved."); };
  const add = IB.param("add");
  if (add && add !== cloud.profile.code) { history.replaceState(null, "", "friends.html"); send(add); }
};
