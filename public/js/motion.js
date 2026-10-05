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

  // Cursor spotlight on cards, and a gentle 3D tilt on subject / feature cards.
  if (!reduce() && matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".card, .callout, .sec-tab, .fw-chip");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
      if (card.matches(".subject-card, .feature")) {
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      }
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest && e.target.closest(".subject-card, .feature");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
    });
  }

  // Floating subject symbols for hero bands.
  IB.floaters = function (host) {
    if (!host || reduce()) return;
    const sy = ["Σ", "∫", "π", "Δ", "√", "⇌", "%", "dy/dx", "PED", "ΔH", "Kc", "pH", "GDP", "r < 1"];
    const layer = document.createElement("div");
    layer.className = "floaters";
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.textContent = sy[i % sy.length];
      s.style.cssText = `left:${(i * 7.3 + Math.random() * 6) % 100}%;top:${10 + Math.random() * 80}%;font-size:${14 + Math.random() * 22}px;animation-delay:${-Math.random() * 14}s;animation-duration:${12 + Math.random() * 10}s`;
      layer.appendChild(s);
    }
    host.prepend(layer);
  };
})();
