/* Shared kTown shell: prime the background immediately, then load the footer separately. */
(function () {
  "use strict";
  var me = document.currentScript;
  var base = me && me.src ? me.src.replace(/shell\.js(\?.*)?$/, "") : "/";

  function ensureLayer(id) {
    var layer = document.getElementById(id);
    if (layer) return layer;
    layer = document.createElement("div");
    layer.id = id;
    layer.setAttribute("aria-hidden", "true");
    document.body.insertBefore(layer, document.body.firstChild);
    return layer;
  }

  function primeBackground() {
    if (!document.body) return;
    ensureLayer("overlay");
    ensureLayer("nebula");
    document.documentElement.style.backgroundColor = "#07090e";
    document.body.style.backgroundColor = "transparent";
  }

  function mountFooter(html) {
    if (document.getElementById("ktFooter")) return;
    var doc = new DOMParser().parseFromString(html, "text/html");
    var footer = doc.body.querySelector("#ktFooter");
    if (!footer) return;
    var imported = document.importNode(footer, true);
    document.body.appendChild(imported);
    var note = window.KT_FOOTER_NOTE;
    if (note) {
      var p = document.createElement("div");
      p.className = "kt-note";
      p.textContent = note;
      imported.appendChild(p);
    }
  }

  function loadFooter() {
    fetch(base + "background.html", { cache: "force-cache" })
      .then(function (response) { if (!response.ok) throw new Error("Footer unavailable"); return response.text(); })
      .then(mountFooter)
      .catch(function () { /* Main content remains available if the footer request fails. */ });
  }

  function go() {
    primeBackground();
    if (document.documentElement.classList.contains("shell-background-ready")) loadFooter();
    else document.addEventListener("ktown:background-ready", loadFooter, { once: true });
    // Keep the page usable if the animated background script fails to load.
    setTimeout(function () {
      if (document.documentElement.classList.contains("shell-background-ready")) return;
      document.documentElement.classList.add("shell-background-ready");
      document.dispatchEvent(new Event("ktown:background-ready"));
    }, 7000);
  }
  if (document.readyState === "loading" && !document.body) document.addEventListener("DOMContentLoaded", go, { once: true });
  else go();
})();
