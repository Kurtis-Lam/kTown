/* Motion: scroll reveals, count-ups, celebrations. Everything is skipped under prefers-reduced-motion,
   and content always ends up visible (a safety timer reveals anything the observer missed). */
(function () {
  const IB = window.IB;
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  IB.animate = function (root) {
    if (!root || reduce()) return;
    const els = Array.from(root.querySelectorAll("[data-reveal], .card, .q-card, .callout, .topic-card, .stat-tile")).filter((el) => !el.classList.contains("rv") && !el.closest(".rv:not(.in)") && !el.closest(".exam-bar"));
    if (!els.length) return;
    const vh = window.innerHeight;
    els.forEach((el, i) => {
      const top = el.getBoundingClientRect().top;
      el.classList.add("rv");
      el.style.setProperty("--rv-delay", (top < vh ? Math.min(i, 8) * 60 : 0) + "ms");
    });
    // Reveal, then drop the helper classes so hover effects and transitions work normally afterwards.
    const show = (el) => {
      if (el.classList.contains("in")) return;
      el.classList.add("in");
      setTimeout(() => el.classList.remove("rv", "in"), 700 + (parseInt(el.style.getPropertyValue("--rv-delay")) || 0));
    };
    if (!("IntersectionObserver" in window)) return els.forEach(show);
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
    setTimeout(() => els.forEach(show), 2500);
    countUp(root);
  };

  function countUp(root) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      if (!isFinite(target) || el.dataset.counted) return;
      el.dataset.counted = "1";
      const suffix = el.dataset.suffix || "", t0 = performance.now(), dur = 900;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // Confetti burst from an element (used for full marks, revised topics, drill streaks).
  IB.celebrate = function (el) {
    if (reduce() || !el) return;
    const r = el.getBoundingClientRect();
    const colors = ["#FFC53D", "#2D5BFF", "#1F8A4C", "#D9480F", "#6741D9", "#0B8AA8"];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      const ang = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
      const dist = 60 + Math.random() * 90;
      s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;background:${colors[i % colors.length]};--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 40}px;--rot:${Math.random() * 540}deg`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  };

  // Header gains a shadow once the page scrolls.
  window.addEventListener("scroll", () => {
    const h = document.querySelector(".site-header");
    if (h) h.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  // Reading-progress bar under the header + header shadow.
  const bar = document.createElement("div");
  bar.className = "read-progress";
  bar.setAttribute("aria-hidden", "true");
  const setBar = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 200 ? Math.min(1, scrollY / max) : 0})`;
  };
  document.addEventListener("DOMContentLoaded", () => { document.body.appendChild(bar); setBar(); });
  window.addEventListener("scroll", setBar, { passive: true });

  // Cursor spotlight on cards (throttled to one style write per frame; no 3D tilt, so cards never change size).
  if (!reduce() && matchMedia("(hover: hover)").matches) {
    let pend = null, raf = 0;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".card, .callout, .sec-tab, .fw-chip");
      if (!card) return;
      pend = { card, x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = pend.card.getBoundingClientRect();
        pend.card.style.setProperty("--mx", `${pend.x - r.left}px`);
        pend.card.style.setProperty("--my", `${pend.y - r.top}px`);
      });
    }, { passive: true });
  }

  // Page enter: the main content fades and rises in each time a page renders.
  IB.pageEnter = function () {
    const app = document.getElementById("app");
    if (!app || reduce()) return;
    app.classList.remove("page-in");
    void app.offsetWidth;
    app.classList.add("page-in");
  };

  // Ripple on buttons.
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest && e.target.closest(".btn, .subject-tabs button, .lvl-switch button, .seg button, .sec-tab");
    if (!b || reduce() || b.disabled) return;
    const r = b.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "ripple";
    const d = Math.max(r.width, r.height) * 2;
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    b.style.overflow = "hidden";
    b.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }, { passive: true });

  // Score in marking feedback counts up; checklist chips pop in one by one.
  IB.animateFeedback = function (el) {
    if (!el || reduce()) return;
    const h = el.querySelector("h4");
    const m = h && h.firstChild && /^(\d+)\/(\d+)/.exec(h.firstChild.textContent || "");
    if (m) {
      const target = +m[1], rest = h.firstChild.textContent.slice(m[1].length), t0 = performance.now();
      const step = (now) => { const p = Math.min(1, (now - t0) / 600); h.firstChild.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + rest; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    el.querySelectorAll(".mk-check span, ul li").forEach((x, i) => { x.style.animationDelay = `${120 + i * 70}ms`; x.classList.add("pop-li"); });
  };

  // Scroll-spy: the notes section bar highlights the section on screen.
  IB.scrollSpy = function (root) {
    const bar = root && root.querySelector(".jumpbar");
    if (!bar || !("IntersectionObserver" in window)) return;
    const links = Array.from(bar.querySelectorAll("a[href^='#sec-']"));
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("here"));
      const a = map.get(en.target.id);
      if (a) { a.classList.add("here"); a.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce() ? "auto" : "smooth" }); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((a, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  };
})();
