/* Shared kTown shell.
   background.html (the animated background layers) and footer.html are fetched in parallel straight away.
   The footer is appended into the background, and the pair is mounted once. The page content is never held
   back by the background: it appears as soon as the page reports it is ready. */
(function () {
  "use strict";
  var root = document.documentElement;
  var me = document.currentScript;
  var base = me && me.src ? me.src.replace(/shell\.js(\?.*)?$/, "") : "/";
  var FONT_AWESOME = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";

  function get(name) {
    return fetch(base + name)
      .then(function (r) { if (!r.ok) throw new Error(name); return r.text(); })
      .catch(function () { return ""; });
  }
  var backgroundReq = get("background.html");
  var footerReq = get("footer.html");

  function ensureFontAwesome() {
    if (document.querySelector('link[href*="font-awesome"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_AWESOME;
    document.head.appendChild(link);
  }

  function pick(html, selector) {
    if (!html) return null;
    var found = new DOMParser().parseFromString(html, "text/html").body.querySelector(selector);
    return found ? document.importNode(found, true) : null;
  }

  function fallbackBackground() {
    var wrap = document.createElement("div");
    wrap.id = "ktBackground";
    ["overlay", "nebula"].forEach(function (id) {
      var layer = document.createElement("div");
      layer.id = id;
      layer.setAttribute("aria-hidden", "true");
      wrap.appendChild(layer);
    });
    return wrap;
  }

  function mount(backgroundHtml, footerHtml) {
    if (document.getElementById("ktBackground")) return;
    var background = pick(backgroundHtml, "#ktBackground");
    if (!background || !background.querySelector("#nebula") || !background.querySelector("#overlay")) background = fallbackBackground();
    var footer = pick(footerHtml, "#ktFooter");
    if (footer) {
      var note = window.KT_FOOTER_NOTE;
      if (note) {
        var p = document.createElement("div");
        p.className = "kt-note";
        p.textContent = note;
        footer.appendChild(p);
      }
      background.appendChild(footer);
    }
    root.style.backgroundColor = "#07090e";
    document.body.appendChild(background);
    document.dispatchEvent(new Event("ktown:layers-ready"));
  }

  var contentDone = false;
  function contentReady() {
    if (contentDone) return;
    contentDone = true;
    root.classList.add("kt-ready");
    document.dispatchEvent(new Event("ktown:ready"));
    prefetch();
  }

  // Warm the browser cache for the pages and scripts a visitor is likely to open next.
  function prefetch() {
    var run = function () {
      var seen = {};
      var urls = (window.KT_PREFETCH || []).slice();
      document.querySelectorAll(".nav-links a[href]").forEach(function (a) { urls.push(a.getAttribute("href")); });
      urls.forEach(function (u) {
        if (!u || u.charAt(0) === "#" || /^(https?:)?\/\//i.test(u)) return;
        var abs = new URL(u, location.href);
        if (abs.origin !== location.origin || abs.href === location.href || seen[abs.href]) return;
        seen[abs.href] = 1;
        var link = document.createElement("link");
        link.rel = "prefetch";
        link.href = abs.href;
        document.head.appendChild(link);
      });
    };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 1500);
  }

  function start() {
    ensureFontAwesome();
    Promise.all([backgroundReq, footerReq]).then(function (r) { mount(r[0], r[1]); });

    // Pages that build their content with JavaScript (they carry data-page) report in when it is drawn.
    var dynamic = document.body.hasAttribute("data-page");
    if (!dynamic || window.KT_CONTENT_READY) contentReady();
    else document.addEventListener("ktown:content-ready", contentReady, { once: true });
    setTimeout(contentReady, 8000);
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
