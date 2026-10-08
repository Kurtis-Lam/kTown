/* Accounts (Google sign-in with Firebase), cloud progress sync and friends.
   Without a Firebase config (js/firebase-config.js) the site runs in guest mode and these features say so.

   Firestore layout (see firestore.rules):
   users/{uid}                    name, photo, code, privacy, public summary (XP, level, streak, badges, subject %)
   users/{uid}/private/progress   the full progress store (owner only - answers and papers never leave it)
   codes/{CODE}                   { uid } so friends can be added by code
   requests/{toUid}/from/{fromUid} pending friend requests
   friends/{uid}/list/{friendUid}  accepted friends (written on both sides) */
(function () {
  "use strict";
  const IB = window.IB;
  const V = "10.12.2";
  const SDK = ["app", "auth", "firestore"].map((m) => `https://www.gstatic.com/firebasejs/${V}/firebase-${m}-compat.js`);
  const load = (src) => new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("Couldn't reach Firebase - check your connection.")); document.head.appendChild(s); });

  const cloud = (IB.cloud = { configured: !!window.IB_FIREBASE && !window.IB_HOSTED, user: null, profile: null, ready: false });
  // Resolves once the first sign-in check has finished, so a page can render ONCE with the right account state.
  cloud.whenReady = new Promise((ok) => { cloud._resolve = ok; });
  let fb = null, db = null, auth = null, saveTimer = null, starting = null;

  // ---------- merging two copies of the progress store ----------
  function merge(a, b) {
    const out = Object.assign({}, a, b);
    const key = (x) => `${x.id}|${x.at}`;
    const seen = new Map();
    (a.attempts || []).concat(b.attempts || []).forEach((x) => seen.set(key(x), x));
    out.attempts = Array.from(seen.values()).sort((x, y) => x.at - y.at).slice(-5000);
    out.read = Object.assign({}, a.read, b.read);
    Object.keys(a.read || {}).forEach((k) => { if (b.read && b.read[k]) out.read[k] = Math.max(a.read[k], b.read[k]); });
    out.flags = Object.assign({}, a.flags, b.flags);
    const ex = new Map();
    (a.exams || []).concat(b.exams || []).forEach((e) => ex.set(`${e.at}|${e.title}`, e));
    out.exams = Array.from(ex.values()).sort((x, y) => x.at - y.at);
    const cu = new Map();
    (a.custom || []).concat(b.custom || []).forEach((c) => cu.set(c.id, c));
    out.custom = Array.from(cu.values());
    out.mistakes = Object.assign({}, a.mistakes);
    Object.entries(b.mistakes || {}).forEach(([id, m]) => {
      const p = out.mistakes[id];
      const t = (x) => Math.max(x.at || 0, x.fixedAt || 0);
      if (!p || t(m) >= t(p)) out.mistakes[id] = Object.assign({}, m, { n: Math.max(m.n || 1, (p && p.n) || 1) });
    });
    out.quests = Object.assign({}, a.quests);
    Object.entries(b.quests || {}).forEach(([d, ids]) => (out.quests[d] = Array.from(new Set((out.quests[d] || []).concat(ids)))));
    out.created = Math.min(a.created || Date.now(), b.created || Date.now());
    if (a.prefs && (!b.prefs || (a.prefs.at || 0) > (b.prefs.at || 0))) out.prefs = a.prefs;
    return out;
  }
  IB.mergeStores = merge;

  const code = () => "IB-" + Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
  const readLocal = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };

  async function start() {
    if (!cloud.configured) return null;
    if (starting) return starting;
    starting = (async () => {
      for (const s of SDK) await load(s);
      fb = window.firebase;
      fb.initializeApp(window.IB_FIREBASE);
      auth = fb.auth();
      db = fb.firestore();
      // Local testing against the Firebase emulators: { ..., emulator: { auth: "http://127.0.0.1:9099", firestore: ["127.0.0.1", 8085] } }
      const em = window.IB_FIREBASE.emulator;
      if (em) { auth.useEmulator(em.auth); db.useEmulator(em.firestore[0], em.firestore[1]); }
      auth.onAuthStateChanged(onUser);
      return true;
    })();
    return starting;
  }

  async function onUser(u) {
    cloud.user = u;
    if (!u) {
      const needs = needsRerender(null);
      IB.setStoreKey(null);
      cloud.profile = null;
      cloud.ready = true;
      cloud._resolve();
      renderSlot();
      if (needs) rerender();
      return;
    }
    const key = "ibrev:u:" + u.uid;
    let local = readLocal(key);
    // First sign-in on this browser: bring the guest progress into the account.
    const guest = readLocal(IB.guestKey);
    if (!local && guest && guest.attempts) local = guest;
    let remote = null;
    try {
      const snap = await db.doc(`users/${u.uid}/private/progress`).get();
      if (snap.exists) remote = JSON.parse(snap.data().data || "null");
    } catch (e) { IB.toast("Couldn't load your saved progress - working offline."); }
    const merged = merge(local || IB.store.get(), remote || {});
    IB.setStoreKey(key);
    localStorage.setItem(key, JSON.stringify(merged));
    if (IB.applyPrefs) IB.applyPrefs();
    // profile + friend code
    const ref = db.doc(`users/${u.uid}`);
    let prof = null;
    try { const p = await ref.get(); prof = p.exists ? p.data() : null; } catch (e) { /* offline */ }
    if (!prof) {
      let c = code();
      try {
        for (let i = 0; i < 4; i++) { const ex = await db.doc(`codes/${c}`).get(); if (!ex.exists) break; c = code(); }
        await db.doc(`codes/${c}`).set({ uid: u.uid });
      } catch (e) { /* ignore */ }
      prof = { name: u.displayName || "Student", photo: u.photoURL || "", code: c, privacy: { badges: true, subjects: true }, created: Date.now() };
      try { await ref.set(prof, { merge: true }); } catch (e) { /* ignore */ }
    }
    cloud.profile = prof;
    const needs = needsRerender(u.uid);
    cloud.ready = true;
    cloud._resolve();
    renderSlot();
    if (needs) rerender();
    await saveNow();
    renderSlot();
    if (needs) IB.toast(`Signed in as ${u.displayName || u.email}. Progress is synced.`);
  }

  // Only redraw if the page on screen was drawn for a different account state (or before sign-in finished).
  // On a normal page load the page waits for sign-in and draws once, so nothing needs redrawing.
  function needsRerender(uid) {
    if (IB._renderedUid === undefined) return false;          // nothing drawn yet: the page will draw itself
    return IB._renderedUid !== uid || !IB._renderedReady;
  }

  function rerender() {
    if (IB.renderChrome) IB.renderChrome();
    if (IB.runPage) IB.runPage();
  }

  async function saveNow() {
    if (!cloud.user || !db) return;
    const d = IB.store.get();
    const pub = IB.publicSummary ? IB.publicSummary(d) : {};
    const priv = (cloud.profile && cloud.profile.privacy) || { badges: true, subjects: true };
    if (!priv.badges) delete pub.badges;
    if (!priv.subjects) delete pub.subjects;
    try {
      await db.doc(`users/${cloud.user.uid}/private/progress`).set({ data: JSON.stringify(d), updated: Date.now() });
      await db.doc(`users/${cloud.user.uid}`).set({ public: pub, name: cloud.profile.name, photo: cloud.profile.photo || "" }, { merge: true });
      cloud.lastSync = Date.now();
    } catch (e) { cloud.syncError = e.message; }
  }
  cloud.queueSave = () => {
    if (!cloud.user) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 2500);
  };
  cloud.syncNow = saveNow;

  cloud.signIn = async () => {
    if (!cloud.configured) {
      IB.toast(window.IB_HOSTED ? "Sign-in works on the full website (not in this preview)." : "Google sign-in isn't set up on this copy yet - see SETUP.md. You can keep using the site as a guest.");
      return;
    }
    await start();
    const provider = new fb.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); } catch (e) {
      if (/popup/i.test(e.code || "")) await auth.signInWithRedirect(provider);
      else IB.toast(e.message);
    }
  };
  cloud.signOut = async () => {
    await saveNow();
    await auth.signOut();
    IB.toast("Signed out. You're now using the site as a guest.");
  };
  cloud.setPrivacy = async (p) => {
    cloud.profile.privacy = Object.assign({}, cloud.profile.privacy, p);
    await db.doc(`users/${cloud.user.uid}`).set({ privacy: cloud.profile.privacy }, { merge: true });
    await saveNow();
  };
  cloud.setName = async (name) => {
    cloud.profile.name = String(name).slice(0, 40);
    await db.doc(`users/${cloud.user.uid}`).set({ name: cloud.profile.name }, { merge: true });
  };

  // ---------- friends ----------
  cloud.requestByCode = async (c) => {
    c = String(c || "").trim().toUpperCase();
    if (!/^IB-[A-Z0-9]{5}$/.test(c)) throw new Error("Friend codes look like IB-7K2QD.");
    const snap = await db.doc(`codes/${c}`).get();
    if (!snap.exists) throw new Error("No student has that code.");
    const to = snap.data().uid;
    if (to === cloud.user.uid) throw new Error("That's your own code.");
    await db.doc(`requests/${to}/from/${cloud.user.uid}`).set({ name: cloud.profile.name, photo: cloud.profile.photo || "", at: Date.now() });
  };
  cloud.requests = async () => (await db.collection(`requests/${cloud.user.uid}/from`).get()).docs.map((d) => Object.assign({ uid: d.id }, d.data()));
  cloud.accept = async (uid) => {
    const me = cloud.user.uid, now = Date.now();
    await db.doc(`friends/${me}/list/${uid}`).set({ since: now });
    await db.doc(`friends/${uid}/list/${me}`).set({ since: now });
    await db.doc(`requests/${me}/from/${uid}`).delete();
  };
  cloud.decline = (uid) => db.doc(`requests/${cloud.user.uid}/from/${uid}`).delete();
  cloud.unfriend = async (uid) => {
    const me = cloud.user.uid;
    await db.doc(`friends/${me}/list/${uid}`).delete();
    await db.doc(`friends/${uid}/list/${me}`).delete().catch(() => {});
  };
  cloud.friends = async () => {
    const ids = (await db.collection(`friends/${cloud.user.uid}/list`).get()).docs.map((d) => d.id);
    const out = [];
    for (const id of ids) {
      try { const p = await db.doc(`users/${id}`).get(); if (p.exists) out.push(Object.assign({ uid: id }, p.data())); } catch (e) { /* not visible */ }
    }
    return out;
  };

  // ---------- account button in the header ----------
  function renderSlot() {
    const slot = document.getElementById("acctSlot");
    if (!slot) return;
    const u = cloud.user;
    if (!u) {
      slot.innerHTML = `<button class="icon-btn acct-btn" id="signInBtn" title="Sign in with Google to save progress and add friends"><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg><span class="acct-label">Sign in</span></button>`;
      document.getElementById("signInBtn").onclick = cloud.signIn;
      return;
    }
    const init = (cloud.profile && cloud.profile.name || u.displayName || "?").trim()[0].toUpperCase();
    slot.innerHTML = `<button class="icon-btn acct-btn" id="acctBtn" aria-expanded="false" title="${IB.esc(u.displayName || u.email || "")}">${u.photoURL ? `<img src="${IB.esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="av">${IB.esc(init)}</span>`}</button>`;
    document.getElementById("acctBtn").onclick = (e) => {
      e.stopPropagation();
      let m = document.getElementById("acctMenu");
      if (m) return m.remove();
      m = IB.el(`<div class="lvl-panel card acct-menu" id="acctMenu"><strong>${IB.esc(cloud.profile ? cloud.profile.name : u.displayName || "")}</strong><div class="small muted">${IB.esc(u.email || "")} · Google</div>
        <div class="small" style="margin:8px 0">Friend code <span class="mono"><b>${IB.esc(cloud.profile ? cloud.profile.code : "")}</b></span></div>
        <div class="small muted">${cloud.lastSync ? "Synced " + new Date(cloud.lastSync).toLocaleTimeString() : "Sync pending"}</div>
        <div class="btn-row" style="margin-top:10px"><a class="btn small" href="friends.html">Friends</a><button class="btn small" id="syncBtn">Sync now</button><button class="btn small" id="outBtn">Sign out</button></div></div>`);
      document.querySelector(".site-header").appendChild(m);
      m.querySelector("#syncBtn").onclick = async () => { await saveNow(); IB.toast("Progress synced."); m.remove(); };
      m.querySelector("#outBtn").onclick = () => { m.remove(); cloud.signOut(); };
      const close = (ev) => { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener("click", close); } };
      setTimeout(() => document.addEventListener("click", close), 0);
    };
  }
  const prevChrome = IB.renderChrome;
  IB.renderChrome = function () { prevChrome && prevChrome(); renderSlot(); };

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(renderSlot, 0);
    if (cloud.configured) start().catch((e) => { cloud.ready = true; cloud._resolve(); IB.toast(e.message); });
    else { cloud.ready = true; cloud._resolve(); }
  });
})();
