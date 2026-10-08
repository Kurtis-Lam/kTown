/* kTown shell: puts the shared nebula background + footer (background.html) on every page.
   Usage on any page:  <script src="shell.js" defer></script>   (krevisionnotes pages use ../shell.js)
   A page can add a small note under the footer line with:  window.KT_FOOTER_NOTE = "text";  (set before shell.js runs) */
(function () {
  var me = document.currentScript;
  var base = me && me.src ? me.src.replace(/shell\.js(\?.*)?$/, "") : "/";
  function mount(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var scripts = [];
    // styles first (they live in <head> after parsing), then body nodes
    Array.prototype.forEach.call(doc.head.querySelectorAll("style"), function (n) { document.head.appendChild(document.importNode(n, true)); });
    Array.prototype.slice.call(doc.body.childNodes).forEach(function (n) {
      if (n.nodeType !== 1) return;
      if (n.tagName === "SCRIPT") { scripts.push(n); return; }
      if (n.id === "nebula" || n.id === "overlay") document.body.insertBefore(document.importNode(n, true), document.body.firstChild);
      else document.body.appendChild(document.importNode(n, true));
    });
    var note = window.KT_FOOTER_NOTE, f = document.getElementById("ktFooter");
    if (note && f) { var p = document.createElement("div"); p.className = "kt-note"; p.textContent = note; f.appendChild(p); }
    scripts.forEach(function (old) { var s = document.createElement("script"); s.textContent = old.textContent; document.body.appendChild(s); });
  }
  function go() {
    fetch(base + "background.html", { cache: "no-cache" }).then(function (r) { return r.text(); }).then(mount).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
