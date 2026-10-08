/* Single-page router for the claude.ai-hosted copy of the site.
   claude.ai connects its AI (and downloads) only to the main page, so instead of navigating between
   HTML files, every screen is loaded into index.html and addressed by the hash: #/notes.html?subject=econ */
(function () {
  "use strict";
  const IB = window.IB;
  const PAGES = {
    "index.html": ["home", "js/home.js"],
    "notes.html": ["notes", "js/notes.js"],
    "questionbank.html": ["bank", "js/bank.js"],
    "practice.html": ["practice", "js/practice.js"],
    "skills.html": ["skills", "js/skills.js"],
    "ia.html": ["ia", "js/iaee.js"],
    "tutor.html": ["tutor", "js/tutor.js"],
    "mypapers.html": ["mypapers", "js/mypapers.js"],
    "progress.html": ["progress", "js/progress.js"],
    "mistakes.html": ["mistakes", "js/mistakes.js"],
    "friends.html": ["friends", "js/friends.js"],
  };
  const parse = () => {
    const [file, qs] = location.hash.replace(/^#\/?/, "").split("?");
    return { file: PAGES[file] ? file : "index.html", qs: qs || "" };
  };
  // Turn "notes.html?subject=econ" into "#/notes.html?subject=econ"; anything else stays as it is.
  const toHash = (url) => {
    const m = /^(?:\.\/)?([a-z]+\.html)(\?[^#]*)?$/i.exec(String(url || ""));
    return m && PAGES[m[1]] ? "#/" + m[1] + (m[2] || "") : null;
  };

  IB.param = (k) => new URLSearchParams(parse().qs).get(k);
  const replace = history.replaceState.bind(history);
  history.replaceState = (state, title, url) => replace(state, title, (url && toHash(url)) || url);

  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download") || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href === "#") return e.preventDefault();
    const h = toHash(href);
    if (!h) return;
    e.preventDefault();
    if (location.hash === h) render();
    else location.hash = h;
  });
  window.addEventListener("hashchange", () => render());

  const load = (src) => new Promise((ok, bad) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => { el.remove(); ok(); };
    el.onerror = () => bad(new Error("Couldn't load " + src));
    document.body.appendChild(el);
  });

  let seq = 0;
  async function render() {
    const [id, script] = PAGES[parse().file];
    const my = ++seq;
    IB.page = null;
    document.body.dataset.page = id;
    const app = document.getElementById("app");
    app.innerHTML = "";
    window.scrollTo(0, 0);
    try {
      await load(script);
    } catch (err) {
      app.innerHTML = `<p class="notice warn">${IB.esc(err.message)}</p>`;
      return;
    }
    if (my !== seq) return;
    IB.renderChrome();
    await IB.runPage();
  }
  IB.router = render;
})();
