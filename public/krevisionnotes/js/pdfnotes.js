/* Designed PDF notes, modelled on printed revision booklets: gradient cover, contents with page numbers,
   "how to read" legend + highlight key, numbered section banners, colour callouts, definition tables,
   essay plans, a practice paper with IB-style answer boxes and a full markscheme, and page footers.
   The document is laid out in an isolated A4 frame, paginated block by block (tables split by rows with
   repeated headers, lists by items, callouts by paragraph) and each page is rendered into the PDF. */
(function () {
  "use strict";
  const IB = window.IB;
  const PW = 794, PH = 1123, FOOT = 44, TOP = 46, SIDE = 56;
  const HEX = { econ: "#D9480F", chem: "#0B8AA8", phys: "#364FC7", geo: "#2F9E44", math: "#6741D9", bio: "#C2255C", engb: "#1864AB" };
  const DOTS = ["#2D5BFF", "#0B8AA8", "#7C3AED", "#E8590C", "#2F9E44", "#D6336C", "#5F3DC4", "#C27803", "#E03131", "#1098AD", "#334155", "#0CA678"];

  let libs = null;
  const script = (src) => new Promise((ok, bad) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = ok;
    el.onerror = () => bad(new Error("Couldn't load the PDF engine."));
    document.head.appendChild(el);
  });
  const loadLibs = () => (libs = libs || Promise.all([script("vendor/pdfgen/html2canvas-pro.min.js"), script("vendor/pdfgen/jspdf.umd.min.js")]).catch((e) => { libs = null; throw e; }));

  const CSS = (c) => `
*{box-sizing:border-box}html,body{margin:0;background:#fff}
body{font:12.6px/1.55 Figtree,system-ui,sans-serif;color:#1B2436;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,.disp{font-family:"Bricolage Grotesque",Figtree,system-ui,sans-serif}
p{margin:0 0 8px}ul,ol{margin:4px 0 8px;padding-left:20px}li{margin:2px 0}
.page{width:${PW}px;height:${PH}px;position:relative;overflow:hidden;background:#fff;padding:${TOP}px ${SIDE}px 0}
.body{height:${PH - TOP - FOOT - 14}px;overflow:hidden}
.foot{position:absolute;left:${SIDE}px;right:${SIDE}px;bottom:16px;display:flex;justify-content:space-between;font-size:9.5px;color:#6B7487;border-top:1px solid #E6E9F0;padding-top:7px}
.foot b{color:${c}}
/* cover */
.page.cover{padding:30px}
.cover-card{position:relative;height:${PH - 92}px;border-radius:20px;overflow:hidden;color:#fff;padding:96px 64px;background:radial-gradient(circle at 85% 12%,rgba(255,255,255,.18),transparent 34%),radial-gradient(circle at 10% 95%,rgba(255,255,255,.12),transparent 40%),linear-gradient(150deg,#16205A 0%,${c} 52%,#D6336C 100%)}
.cover-card .eyebrow{font:800 12.5px/1 Figtree,sans-serif;letter-spacing:.24em;text-transform:uppercase;opacity:.92}
.cover-card h1{font-size:50px;line-height:1.04;margin:18px 0 12px;letter-spacing:-.02em}
.cover-card .sub{font-size:19px;opacity:.95;margin:0 0 28px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.15);border-radius:999px;padding:5px 13px;font-size:12.5px;font-weight:600}
.cover-foot{position:absolute;left:64px;right:64px;bottom:56px;font-size:13px;line-height:1.6;opacity:.95}
.cover-big{position:absolute;right:-20px;bottom:120px;font:800 230px/1 "Bricolage Grotesque",sans-serif;color:rgba(255,255,255,.08);letter-spacing:-.04em}
/* contents + legend */
.toc-h{font-size:30px;margin:4px 0 14px}
.toc{display:grid;grid-template-columns:1fr 1fr;column-gap:34px;row-gap:3px;margin-bottom:18px}
.toc div{display:flex;align-items:center;gap:9px;font-weight:700;font-size:12.6px;padding:3px 0}
.toc i{width:11px;height:11px;border-radius:3px;flex:none}
.toc span.t{flex:1;min-width:0}
.toc span.pg{font:600 11px "JetBrains Mono",monospace;color:#6B7487}
h2.lg{font-size:17px;margin:14px 0 8px}
.legend{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.legend div{border-radius:10px;padding:9px 12px;border-left:4px solid var(--k);background:var(--b);font-size:11.5px}
.legend b{display:block;color:var(--k);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
.hl-key{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:11.5px;margin:6px 0 12px}
.hl-key>span:first-child{font-weight:700;margin-right:4px}
/* highlights (as in the printed notes) */
.hl{border-radius:3px;padding:0 2px;font-weight:700;white-space:nowrap}
.hl-k{background:#C9EBCF}.hl-s{background:#FFEB7A}.hl-d{background:#C5E3FF}.hl-p{background:#F9C6DA}
/* banners */
.banner{display:flex;align-items:center;gap:18px;border-radius:14px;padding:14px 22px;margin:4px 0 14px;color:#fff;background:linear-gradient(115deg,#0F1B2D 0%,#2A3A58 100%);border-left:7px solid ${c}}
.banner .n{font:800 38px/1 "Bricolage Grotesque",sans-serif;color:rgba(255,255,255,.5);min-width:52px}
.banner h2{margin:0;font-size:23px;line-height:1.15}
.banner small{display:block;font-size:11.5px;opacity:.82;margin-top:3px}
.bar{background:#1B4F72;color:#fff;font:700 16px "Bricolage Grotesque",sans-serif;padding:9px 14px;margin:10px 0 8px;border-radius:4px}
.lead{font-size:13.4px;color:#2F3A4F;margin:0 0 10px}
h3.h{font-size:15px;color:#1B4F72;margin:12px 0 6px}
/* callouts */
.co{border-radius:12px;padding:10px 16px 8px;margin:0 0 10px;border-left:5px solid var(--k);background:var(--b)}
.co>.ct{font:800 11px Figtree,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--k);margin:2px 0 6px}
.k-formula{--k:#2D5BFF;--b:#EEF2FF}.k-method{--k:#1F8A4C;--b:#EAF8EF}.k-trap{--k:#D0312D;--b:#FDEEEE}
.k-example{--k:#6741D9;--b:#F3EEFF}.k-tip{--k:#C27803;--b:#FFF6DF}.k-terms{--k:#8A6A00;--b:#FFF9E5}.k-zh{--k:#7048E8;--b:#F3EFFF}.k-frame{--k:#7048E8;--b:#F7F4FF}
.ahl{display:inline-block;font:800 9.5px Figtree,sans-serif;background:#7048E8;color:#fff;border-radius:4px;padding:2px 5px;vertical-align:middle}
.fgrid{display:flex;flex-wrap:wrap;gap:6px}.fgrid div{background:#fff;border-radius:8px;padding:5px 10px}
.concept{border-left:3px solid ${c};padding:2px 0 2px 14px;margin:0 0 10px}
.concept>h3{font-size:14.5px;margin:0 0 4px;color:#0F1B2D}
.sol{margin-top:6px;padding:7px 10px;background:rgba(255,255,255,.75);border-radius:8px}
/* tables */
table{border-collapse:collapse;width:100%;margin:0 0 10px;font-size:11.8px}
th,td{border:1px solid #D7DCE5;padding:6px 9px;text-align:left;vertical-align:top}
thead th{background:#24324A;color:#fff;border-color:#24324A}
tbody th{color:#1B4F72;background:#F6F8FB;font-weight:700;width:28%}
tbody tr:nth-child(even) td{background:#FAFBFD}
.plan h4{font-size:13.5px;color:#1B4F72;margin:10px 0 5px}
.plan tbody th{width:16%}
.plots{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}
.plot{margin:0;width:330px}.plot svg{width:100%;height:auto;--plot-a:${c};--plot-b:#2D5BFF;--plot-c:#1F8A4C;--muted:#6B7487;--text:#1B2436}
.pl-grid{stroke:#E8EBF1}.pl-axis{stroke:#1B2436;stroke-width:1.2}.pl-asym{stroke:#8A93A6;stroke-dasharray:5 4}.pl-lab,.pl-ax{font:11px Figtree,sans-serif;fill:#2F3A4F}figcaption{font-size:10.5px;color:#55607A;text-align:center}
/* practice paper */
.q{margin:0 0 12px}
.qh{display:flex;justify-content:space-between;align-items:baseline;font-weight:800;margin-bottom:3px}
.qh .m{font:700 11px "JetBrains Mono",monospace;color:#55607A}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;margin:4px 0 0;padding:0;list-style:none}
.opts li{display:flex;gap:6px}.opts b{color:${c}}
.box{border:1.4px solid #9AA4B5;border-radius:4px;margin-top:6px;padding:0 10px}.box i{display:block;height:26px;border-bottom:1px dotted #B7BFCC}.box i:last-child{border-bottom:0}
.ms{border-left:4px solid ${c};background:#F7F8FB;border-radius:8px;padding:7px 12px;margin:0 0 8px}
.ms .a{font-weight:800;color:${c}}
.katex{font-size:1.05em}
`;

  // ---------- content builders ----------
  const box = (kind, title, inner) => `<div class="co k-${kind}"><div class="ct">${title}</div>${inner}</div>`;
  function topicBlocks(s, t, opts) {
    const b = [];
    const head = (title, sub) => (opts.single ? `<div class="bar" data-anchor="${opts.anchor()}">${title}</div>` : `<h3 class="h">${title}</h3>`) + (sub || "");
    if (t.summary) b.push(`<p class="lead">${t.summary}</p>`);
    if (t.formulas && t.formulas.length) b.push(head("Formulas") + box("formula", "Formula", `<div class="fgrid">${t.formulas.map((f) => `<div>${f}</div>`).join("")}</div>`));
    b.push(head("Key concepts"));
    t.concepts.filter((x) => IB.showItem(s.id, x)).forEach((x) => b.push(`<div class="concept"><h3>${x.h}${x.hl ? ' <span class="ahl">AHL</span>' : ""}</h3>${x.b}</div>`));
    if (t.table) b.push(head("Compare at a glance") + `<table><thead><tr>${t.table.head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${t.table.rows.map((r) => `<tr>${r.map((x, i) => (i ? `<td>${x}</td>` : `<th>${x}</th>`)).join("")}</tr>`).join("")}</tbody></table>`);
    if (t.diagrams && t.diagrams.length && IB.plot) b.push(head("Diagrams to know") + `<div class="plots">${t.diagrams.map(IB.plot).join("")}</div>`);
    const methods = (t.methods || []).concat((t.skills || []).map((x) => `<strong>${x.h}:</strong> ${x.b}`));
    if (methods.length) b.push(head("Fastest methods") + box("method", "Fastest method", `<ol>${methods.map((m) => `<li>${m}</li>`).join("")}</ol>`));
    if (t.traps && t.traps.length) b.push(head("Traps") + box("trap", "Trap", `<ul>${t.traps.map((m) => `<li>${m}</li>`).join("")}</ul>`));
    if (t.examples && t.examples.length) {
      b.push(head("Worked examples"));
      t.examples.forEach((e, i) => b.push(box("example", `Worked example ${i + 1}`, `<p><strong>${e.q}</strong></p><div class="sol">${e.a}</div>`)));
    }
    if (t.tips && t.tips.length) b.push(head("Exam tips") + box("tip", "Exam tip", `<ul>${t.tips.map((m) => `<li>${m}</li>`).join("")}</ul>`));
    const frames = IB.topicFrames ? IB.topicFrames(t) : [];
    if (frames.length) {
      b.push(head("Answer frameworks"));
      frames.forEach((f) => b.push(box("frame", f.type, `<ol>${f.steps.map((x) => `<li>${x}</li>`).join("")}</ol>`)));
    }
    if (t.terms && t.terms.length) b.push(head("Key definitions to learn") + `<table class="defs"><thead><tr><th>${"Term"}</th><th>${"Definition"}</th></tr></thead><tbody>${t.terms.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</tbody></table>`);
    const plans = IB.essayPlansHtml(t);
    if (plans) b.push(head("Practice essay plans") + plans);
    return b;
  }
  const questionBlock = (q, n) => {
    const opts = q.options ? `<ol class="opts">${q.options.map((o, i) => `<li><b>${"ABCD"[i]}</b><span>${o}</span></li>`).join("")}</ol>` : "";
    const lines = q.type === "mcq" ? "" : `<div class="box">${"<i></i>".repeat(Math.round(Math.min(16, 2 + q.marks * 1.4)))}</div>`;
    return `<div class="q"><div class="qh"><span>${n}.</span><span class="m">[${q.marks}]${q.paper ? " · " + IB.esc(q.paper) : ""}</span></div><div>${q.q}</div>${opts}${lines}</div>`;
  };
  const msBlock = (q, n) => `<div class="ms"><strong>${n}.</strong> ${q.type === "mcq" ? `<span class="a">${"ABCD"[q.answer]}</span> ` : ""}<ul>${q.ms.map((p) => `<li>${p}</li>`).join("")}</ul></div>`;

  // ---------- pagination ----------
  function paginator(doc, root, footLeft) {
    const pages = [];
    let body = null;
    const newPage = () => {
      const page = doc.createElement("div");
      page.className = "page";
      page.innerHTML = `<div class="body"></div><div class="foot"><span>${footLeft}</span><span class="pn"></span></div>`;
      root.appendChild(page);
      pages.push(page);
      body = page.firstChild;
      return page;
    };
    const over = () => body.scrollHeight > body.clientHeight + 1;
    const isHead = (el) => el && el.nodeType === 1 && (/^H[1-4]$/.test(el.tagName) || el.classList.contains("bar") || el.classList.contains("banner") || el.classList.contains("keep"));
    const splittable = (n) => {
      if (n.nodeType !== 1) return false;
      if (n.tagName === "TABLE") return !!(n.tBodies[0] && n.tBodies[0].rows.length > 1);
      if (n.tagName === "UL" || n.tagName === "OL") return n.children.length > 1;
      return n.matches(".co,.concept,.plan,.sol,.grp,.box:not(.whole),.msq") && n.children.length > 1;
    };
    // Place `node` into `parent`; returns null when it fits fully, otherwise the part that still has to go.
    function place(parent, node) {
      parent.appendChild(node);
      if (!over()) return null;
      parent.removeChild(node);
      if (!splittable(node)) return node;
      let shell, inner, items, title = null, rest;
      if (node.tagName === "TABLE") {
        shell = node.cloneNode(false);
        if (node.tHead) shell.appendChild(node.tHead.cloneNode(true));
        inner = shell.appendChild(doc.createElement("tbody"));
        items = Array.from(node.tBodies[0].rows);
        rest = () => { const t = node.cloneNode(false); if (node.tHead) t.appendChild(node.tHead.cloneNode(true)); t.appendChild(doc.createElement("tbody")); return [t, t.tBodies[0]]; };
      } else {
        shell = node.cloneNode(false);
        inner = shell;
        items = Array.from(node.children);
        if (items[0] && items[0].classList && items[0].classList.contains("ct")) {
          title = items.shift();
          shell.appendChild(title);
        }
        rest = () => {
          const t = node.cloneNode(false);
          if (title) { const c2 = title.cloneNode(true); c2.textContent += " (continued)"; t.appendChild(c2); }
          return [t, t];
        };
      }
      parent.appendChild(shell);
      if (over()) { parent.removeChild(shell); if (title) node.prepend(title); return node; }
      let i = 0, placed = 0;
      for (; i < items.length; i++) {
        const r = place(inner, items[i]);
        if (r) { if (r !== items[i]) { items[i] = r; placed++; } break; }
        placed++;
      }
      // a split that only managed to place a heading would strand it - move the whole block instead
      if (placed && Array.from(inner.children).every((x) => isHead(x) || x === title)) placed = 0;
      if (!placed) { parent.removeChild(shell); if (title) node.prepend(title); items.forEach((x) => (node.tagName === "TABLE" ? node.tBodies[0] : node).appendChild(x)); return node; }
      if (i >= items.length) return null;
      const [out, holder] = rest();
      if (node.tagName === "OL") out.start = (node.start || 1) + Array.from(shell.children).length;
      items.slice(i).forEach((x) => holder.appendChild(x));
      return out;
    }
    function add(node) {
      if (!body) newPage();
      let r = place(body, node), guard = 0;
      while (r && guard++ < 60) {
        // don't leave a heading stranded at the bottom of a page
        const carry = [];
        for (let k = body.children.length - 1; k > 0 && isHead(body.children[k]); k--) carry.unshift(body.children[k]);
        if (body.children.length === 0 || (body.children.length === carry.length)) { body.appendChild(r); r = null; break; }
        newPage();
        carry.forEach((c) => body.appendChild(c));
        r = place(body, r);
        if (r && body.children.length === carry.length) { body.appendChild(r); r = null; }
      }
    }
    return { pages, newPage, add, breakPage: () => { if (body && body.children.length) newPage(); } };
  }

  // ---------- progress overlay ----------
  function progress() {
    const el = IB.el(`<div class="pdf-progress" role="status"><div class="pdf-card"><div class="pdf-spin"></div><strong>Designing your PDF…</strong><div class="bar"><span></span></div><span class="small muted" id="pdfMsg">Laying out pages</span></div></div>`);
    document.body.appendChild(el);
    return {
      set: (msg, f) => { el.querySelector("#pdfMsg").textContent = msg; if (f !== undefined) el.querySelector(".bar span").style.width = Math.round(f * 100) + "%"; },
      done: () => { el.classList.add("out"); setTimeout(() => el.remove(), 400); },
    };
  }

  /**
   * Build and download a designed PDF.
   * opts: { subject, topics (array of topic objects), title, questions: number per topic (0 = none), filename }
   */
  IB.pdfNotes = async function (opts) {
    const s = IB.subjects[opts.subject];
    const c = HEX[s.id] || "#2D5BFF";
    const single = opts.topics.length === 1;
    const prog = progress();
    let frame;
    try {
      await loadLibs();
      frame = document.createElement("iframe");
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = `position:fixed;left:-${PW * 3}px;top:0;width:${PW}px;height:${PH}px;border:0;visibility:hidden`;
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${new URL("vendor/katex/katex.min.css", location.href)}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"><style>${CSS(c)}</style></head><body></body></html>`);
      doc.close();
      await new Promise((r) => setTimeout(r, 60));
      await Promise.race([Promise.all(Array.from(doc.querySelectorAll("link")).map((l) => (l.sheet ? 1 : new Promise((ok) => { l.onload = l.onerror = ok; })))), new Promise((r) => setTimeout(r, 4000))]);
      if (doc.fonts && doc.fonts.ready) await Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);

      const root = doc.body;
      const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
      const title = opts.title || (single ? opts.topics[0].title : `${s.name}`);
      const footLeft = `IB ${IB.esc(s.short)} · ${IB.esc(single ? opts.topics[0].title : "Revision Notes")} · <b>IB Revision Hub</b>`;
      let anchorN = 0;
      const anchor = () => "a" + ++anchorN;

      // questions for the practice paper
      const qset = [];
      if (opts.questions) opts.topics.forEach((t) => {
        const exam = (t.questions || []).filter((q) => !q.derived && IB.showItem(s.id, q));
        const pick = exam.filter((q) => q.type !== "extended" || s.id === "engb").slice(0, opts.questions);
        const ext = exam.filter((q) => q.type === "extended").slice(0, single ? 2 : 1);
        pick.concat(ext.filter((q) => !pick.includes(q))).slice(0, opts.questions + 1).forEach((q) => qset.push(q));
      });

      // cover
      const cover = doc.createElement("div");
      cover.className = "page cover";
      const chips = single
        ? ["Key concepts", "Fastest methods", "Traps", "Worked examples", "Exam tips", "Answer frameworks", "Definitions"].concat(IB.essayPlansHtml(opts.topics[0]) ? ["Essay plans"] : []).concat(qset.length ? ["Practice paper"] : [])
        : opts.topics.map((t) => t.title);
      cover.innerHTML = `<div class="cover-card"><div class="cover-big">${IB.esc(single ? opts.topics[0].code : s.short.replace(/\s.*/, ""))}</div>
        <div class="eyebrow">IB ${IB.esc(s.name)}${single ? " · " + IB.esc(opts.topics[0].unit) : ""}</div>
        <h1>${IB.esc(title)}<br>Revision Notes</h1>
        <p class="sub">${single ? IB.esc(opts.topics[0].code) + " · " : ""}Concepts · fastest methods · traps · worked examples</p>
        <div class="chips">${chips.slice(0, 16).map((x) => `<span class="chip">${IB.esc(x)}</span>`).join("")}${chips.length > 16 ? `<span class="chip">+${chips.length - 16} more</span>` : ""}</div>
        <div class="cover-foot">${qset.length ? `Includes a ${qset.length}-question practice paper with IB-style answer boxes and a full markscheme.<br>` : ""}Original IB-style revision material · not official IB content · ${date}</div></div>`;
      root.appendChild(cover);
      const P = paginator(doc, root, footLeft);
      const pages = P.pages;

      // contents + how to read
      const tocItems = [];
      const toc = doc.createElement("div");
      // reserve the contents' final size now (it's filled in with page numbers at the end)
      const est = single
        ? 1 + (topicBlocks(s, opts.topics[0], { single: true, anchor: () => "x" }).join("").match(/class="bar"/g) || []).length + (qset.length ? 2 : 0)
        : opts.topics.length + (s.gameplan ? 1 : 0) + (qset.length ? 2 : 0);
      toc.innerHTML = Array.from({ length: est }, () => '<div><i></i><span class="t">&nbsp;</span><span class="pg">00</span></div>').join("");
      P.newPage();
      P.add(Object.assign(doc.createElement("h1"), { className: "toc-h", innerHTML: "Contents" }));
      P.add(toc);
      toc.className = "toc";
      const legend = doc.createElement("div");
      legend.innerHTML = `<h2 class="lg">How to read these notes</h2><div class="legend">
        <div class="k-formula"><b>Formula</b>What to know or recognise.</div>
        <div class="k-method"><b>Fastest method</b>The quickest reliable route to the marks.</div>
        <div class="k-trap"><b>Trap</b>Where marks are usually lost.</div>
        <div class="k-example"><b>Worked example</b>A full solution in exam layout.</div>
        <div class="k-tip"><b>Exam tip</b>How the markscheme thinks.</div>
        <div class="k-terms"><b>Definitions</b>Learn these word-for-word.</div></div>${IB.highlightKey()}`;
      P.add(legend);

      const addHtml = (html, terms) => {
        const tmp = doc.createElement("div");
        root.appendChild(tmp);
        tmp.innerHTML = html;
        IB.math(tmp);
        IB.highlight(tmp, { terms });
        const kids = Array.from(tmp.children);
        root.removeChild(tmp);
        kids.forEach((k) => P.add(k));
      };

      // subject PDFs open with the exam game plan
      const gp = s.gameplan;
      if (!single && gp) {
        P.breakPage();
        const a = anchor();
        tocItems.push([a, "How to use + exam game plan"]);
        addHtml(`<div class="banner" data-anchor="${a}"><span class="n">GP</span><div><h2>${"Exam game plan"}</h2><small>${IB.esc(s.guide)}</small></div></div>
          <p class="lead">${gp.intro}</p>
          <table><thead><tr><th>Part</th><th>What it looks like</th><th>Strategy</th></tr></thead><tbody>${gp.rows.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
          ${gp.codes ? box("tip", "How the markscheme gives marks", `<table><thead><tr><th>Code</th><th>Meaning</th><th>What it means for you</th></tr></thead><tbody>${gp.codes.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>`) : ""}
          ${box("method", "Habits of 7-scorers", `<ol>${gp.habits.map((h) => `<li>${h}</li>`).join("")}</ol>`)}`, []);
      }

      opts.topics.forEach((t, i) => {
        prog.set(`Laying out ${t.title}`, 0.05 + (0.35 * i) / opts.topics.length);
        P.breakPage();
        const terms = (t.terms || []).map((x) => x[0]);
        if (single) {
          const a = anchor();
          tocItems.push([a, "Overview"]);
          let n = 0;
          const secAnchor = () => { const id = anchor(); tocItems.push([id, null]); return id; };
          const blocks = topicBlocks(s, t, { single: true, anchor: secAnchor });
          addHtml(`<div class="banner" data-anchor="${a}"><span class="n">${s.topics.includes(t) ? String(s.topics.indexOf(t) + 1).padStart(2, "0") : IB.esc(t.code || "OV")}</span><div><h2>${IB.esc(t.title)}</h2><small>${IB.esc(t.code)} · ${IB.esc(t.unit)}</small></div></div>` +
            blocks.join("").replace(/<div class="bar" data-anchor="(a\d+)">([^<]*)<\/div>/g, (m, id, label) => {
              n++;
              const item = tocItems.find((x) => x[0] === id);
              if (item) item[1] = label;
              return `<div class="bar" data-anchor="${id}">${n}. ${label}</div>`;
            }), terms);
        } else {
          const a = anchor();
          tocItems.push([a, t.title]);
          addHtml(`<div class="banner" data-anchor="${a}"><span class="n">${String(i + 1).padStart(2, "0")}</span><div><h2>${IB.esc(t.title)}</h2><small>${IB.esc(t.code)} · ${IB.esc(t.unit)}</small></div></div>` + topicBlocks(s, t, { single: false }).join(""), terms);
        }
      });

      if (qset.length) {
        P.breakPage();
        const a = anchor(), b2 = anchor();
        tocItems.push([a, "Practice paper"], [b2, "Markscheme"]);
        addHtml(`<div class="banner" data-anchor="${a}"><span class="n">PP</span><div><h2>Practice paper</h2><small>${qset.length} questions · ${qset.reduce((n, q) => n + q.marks, 0)} marks · answer in the boxes</small></div></div>` + qset.map((q, i) => questionBlock(q, i + 1)).join(""), []);
        P.breakPage();
        addHtml(`<div class="banner" data-anchor="${b2}"><span class="n">MS</span><div><h2>Markscheme</h2><small>Check your answers - M = method, A = answer, R = reasoning</small></div></div>` + qset.map((q, i) => msBlock(q, i + 1)).join(""), []);
      }

      // contents with page numbers (cover = page 1)
      const all = [cover].concat(pages);
      const pageOf = (id) => { const el = doc.querySelector(`[data-anchor="${id}"]`); return el ? all.indexOf(el.closest(".page")) + 1 : ""; };
      toc.innerHTML = tocItems.filter((x) => x[1]).map(([id, label], i) => `<div><i style="background:${DOTS[i % DOTS.length]}"></i><span class="t">${IB.esc(label)}</span><span class="pg">${pageOf(id)}</span></div>`).join("");
      all.forEach((p, i) => { const pn = p.querySelector(".pn"); if (pn) pn.textContent = `${i + 1} / ${all.length}`; });

      // render
      const h2c = window.html2canvas.default || window.html2canvas.html2canvas || window.html2canvas;
      const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4", compress: true });
      all.forEach((p) => p.remove());
      for (let i = 0; i < all.length; i++) {
        prog.set(`Rendering page ${i + 1} of ${all.length}`, 0.4 + (0.6 * i) / all.length);
        root.appendChild(all[i]);
        const canvas = await h2c(all[i], { scale: single ? 2 : 1.6, backgroundColor: "#ffffff", logging: false, useCORS: true, width: PW, height: PH, windowWidth: PW, windowHeight: PH });
        root.removeChild(all[i]);
        if (i) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", single ? 0.88 : 0.8), "JPEG", 0, 0, 595.28, 841.89, undefined, "FAST");
      }
      pdf.setProperties({ title: `${title} - Revision Notes`, subject: s.name, creator: "IB Revision Hub" });
      const blob = pdf.output("blob");
      prog.set("Done", 1);
      IB.download(opts.filename || `IB-${s.short.replace(/\s+/g, "-")}-${title.replace(/[^\w-]+/g, "-")}-notes.pdf`, blob, "application/pdf");
      return all.length;
    } catch (e) {
      IB.toast(e.message || "Couldn't build the PDF.");
      throw e;
    } finally {
      if (frame) frame.remove();
      prog.done();
    }
  };
  // ================= IB-style exam papers =================
  const PAPER_CSS = (c) => `
.page.pcov{padding:40px 64px 0}
.ptop{position:absolute;top:14px;left:0;right:0;text-align:center;font:600 11px Figtree,sans-serif;color:#333}
.pcover{height:${PH - 120}px;display:flex;flex-direction:column}
.pc-brand{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #111;padding-bottom:14px}
.pc-brand .code{font:700 11px "JetBrains Mono",monospace;color:#555;text-align:right;line-height:1.6}
.pc-title{margin:34px 0 4px;font:800 30px/1.15 "Bricolage Grotesque",sans-serif;color:#111}
.pc-sub{font-size:17px;font-weight:700;color:#111;margin:0 0 4px}
.pc-meta{font-size:14px;color:#333;margin:0 0 26px}
.cand{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;margin:0 0 26px}
.cand .name{border-bottom:1.4px solid #111;height:34px;font-size:11px;color:#555;padding-top:2px}
.cand .num{display:flex;gap:4px}.cand .num i{width:24px;height:30px;border:1.4px solid #111;display:block}
.instr{border:1.6px solid #111;padding:14px 20px;margin:0 0 18px}
.instr h3{margin:0 0 6px;font-size:14px;letter-spacing:.04em;text-transform:uppercase}
.instr ul{margin:0;padding-left:18px;font-size:13px;line-height:1.7}
.pc-total{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1.4px solid #111;padding-top:12px;font-size:11px;color:#444}
.pc-total .big{font:800 34px "Bricolage Grotesque",sans-serif;color:#111}
.disc{font-size:10px;color:#666;margin-top:8px}
.secbar{font:800 15px "Bricolage Grotesque",sans-serif;border-bottom:2px solid #111;padding:0 0 4px;margin:6px 0 12px;color:#111}
.pq-h{display:grid;grid-template-columns:30px 1fr;gap:6px;margin:10px 0 6px;font-size:13.4px;color:#111}
.pq-h>b{font-size:14px}
.pq-t .mk{float:right;font-weight:800;margin-left:10px}
.pq-t .tp{display:block;font-size:10px;color:#777;margin-top:3px}
.popts{display:grid;grid-template-columns:30px 1fr;margin:0 0 4px 36px;gap:3px 10px;font-size:13px}
.popts b{font-weight:800}
.ansl{display:flex;justify-content:flex-end;align-items:center;gap:8px;margin:2px 0 14px;font-size:11px;color:#444}
.ansl i{width:30px;height:30px;border:1.4px solid #111;display:block}
.box{border:1.4px solid #111;border-radius:0;margin:4px 0 16px 36px;padding:0 12px}
.box i{display:block;height:28px;border-bottom:1px dotted #8A93A6}.box i:last-child{border-bottom:0}
.mshead{font:800 22px "Bricolage Grotesque",sans-serif;margin:0 0 4px}
.msq{border-left:4px solid ${c};background:#F7F8FB;padding:8px 14px;margin:0 0 9px;font-size:12.4px}
.msq .h{font-weight:800;display:flex;justify-content:space-between}
.msq ul{margin:4px 0 0}
.mcqgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:0 0 14px}
.mcqgrid div{border:1.4px solid #111;padding:5px 8px;font:700 12px "JetBrains Mono",monospace}
`;
  const linesFor = (q) => q.type === "mcq" ? 0 : q.type === "extended" ? Math.min(34, Math.max(14, Math.round(q.marks * 2.2))) : q.numeric ? Math.min(14, 3 + q.marks * 2) : Math.min(16, Math.max(3, Math.round(q.marks * 2.2)));

  /**
   * IB-style exam paper PDF: cover with candidate boxes and instructions, numbered questions with marks,
   * lined answer boxes, then the markscheme.
   * opts: { title, subtitle, subject (id or null), questions, minutes, filename, markscheme (default true) }
   */
  IB.paperPdf = async function (opts) {
    const qs = (opts.questions || []).filter(Boolean);
    if (!qs.length) throw new Error("No questions to export.");
    const s = opts.subject && IB.subjects[opts.subject];
    const c = (s && HEX[s.id]) || "#2D5BFF";
    const mcq = qs.filter((q) => q.type === "mcq"), written = qs.filter((q) => q.type !== "mcq");
    const ordered = mcq.concat(written);
    const total = ordered.reduce((n, q) => n + (q.marks || 0), 0);
    const minutes = opts.minutes || Math.max(10, Math.round(total * 1.3));
    const calc = s && s.id === "math" ? (opts.paper === "P1" ? "not permitted" : "required") : ["chem", "phys", "bio", "geo", "econ"].includes(s && s.id) ? "permitted" : null;
    const prog = progress();
    let frame;
    try {
      await loadLibs();
      frame = document.createElement("iframe");
      frame.setAttribute("aria-hidden", "true");
      frame.style.cssText = `position:fixed;left:-${PW * 3}px;top:0;width:${PW}px;height:${PH}px;border:0;visibility:hidden`;
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${new URL("vendor/katex/katex.min.css", location.href)}"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"><style>${CSS(c)}${PAPER_CSS(c)}</style></head><body></body></html>`);
      doc.close();
      await new Promise((r) => setTimeout(r, 60));
      await Promise.race([Promise.all(Array.from(doc.querySelectorAll("link")).map((l) => (l.sheet ? 1 : new Promise((ok) => { l.onload = l.onerror = ok; })))), new Promise((r) => setTimeout(r, 4000))]);
      if (doc.fonts && doc.fonts.ready) await Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
      const root = doc.body;
      const title = opts.title || "Practice paper";
      const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
      const P = paginator(doc, root, `${IB.esc(s ? s.name : "Mixed subjects")} · ${IB.esc(title)}`);

      // cover
      const cover = doc.createElement("div");
      cover.className = "page pcov";
      cover.innerHTML = `<div class="pcover">
        <div class="pc-brand"><div><div style="font:800 15px 'Bricolage Grotesque',sans-serif">IB Revision Hub</div><div style="font-size:11px;color:#555">Original practice material in IB exam format</div></div><div class="code">${IB.esc((s ? s.short : "MIXED").toUpperCase())}<br>${IB.esc(date)}</div></div>
        <div class="pc-title">${IB.esc(s ? s.name : "Mixed subjects")}</div>
        <div class="pc-sub">${IB.esc(title)}${opts.subtitle && (!s || opts.subtitle !== s.name) ? " · " + IB.esc(opts.subtitle) : ""}</div>
        <div class="pc-meta">${Math.floor(minutes / 60) ? Math.floor(minutes / 60) + " hour" + (Math.floor(minutes / 60) > 1 ? "s" : "") + " " : ""}${minutes % 60 ? (minutes % 60) + " minutes" : ""}</div>
        <div class="cand"><div class="name">Candidate name</div><div><div style="font-size:11px;color:#555;margin-bottom:4px">Candidate session number</div><div class="num">${"<i></i>".repeat(10)}</div></div></div>
        <div class="instr"><h3>Instructions to candidates</h3><ul>
          <li>Do not open this examination paper until instructed to do so.</li>
          <li>Answer all questions.</li>
          ${mcq.length ? "<li>Multiple choice: write the letter of your chosen answer in the box provided for each question.</li>" : ""}
          ${written.length ? "<li>Answers must be written within the answer boxes provided.</li>" : ""}
          ${calc ? `<li>A calculator is ${calc} for this paper.</li>` : ""}
          ${s && (s.id === "chem" || s.id === "phys") ? `<li>A clean copy of the ${s.baseName.toLowerCase()} data booklet is required for this paper.</li>` : ""}
          ${s && s.id === "math" ? "<li>Unless otherwise stated, all numerical answers should be given exactly or correct to three significant figures.</li>" : ""}
          <li>The maximum mark for this examination paper is <b>[${total} marks]</b>.</li>
        </ul></div>
        <div class="pc-total"><div>${ordered.length} questions${mcq.length && written.length ? ` · Section A: ${mcq.length} multiple choice · Section B: ${written.length} written` : ""}<div class="disc">Original questions written for revision in the style of IB papers. Not an official IB examination paper; not affiliated with or endorsed by the International Baccalaureate Organization.</div></div><div style="text-align:right"><div class="big">${total}</div>marks</div></div>
      </div>`;
      root.appendChild(cover);

      const addHtml = (html) => {
        const tmp = doc.createElement("div");
        root.appendChild(tmp);
        tmp.innerHTML = html;
        IB.math(tmp);
        const kids = Array.from(tmp.children);
        root.removeChild(tmp);
        kids.forEach((k) => P.add(k));
      };
      const topicLabel = (q) => { const t = IB.topic(q.topic); return t ? `${t.code} ${t.title}` : ""; };
      prog.set("Laying out questions", 0.1);
      P.newPage();
      let n = 0;
      if (mcq.length) {
        addHtml(`<div class="secbar keep">${written.length ? "Section A · " : ""}Multiple choice</div>`);
        mcq.forEach((q) => {
          n++;
          addHtml(`<div class="pq-h keep"><b>${n}.</b><div class="pq-t">${q.q} <span class="mk">[${q.marks}]</span>${opts.showTopics ? `<span class="tp">${IB.esc(topicLabel(q))}</span>` : ""}</div></div>
            <div class="popts keep">${q.options.map((o, i) => `<b>${"ABCD"[i]}.</b><span>${o}</span>`).join("")}</div><div class="ansl"><span>Answer</span><i></i></div>`);
        });
      }
      if (written.length) {
        if (mcq.length) { P.breakPage(); addHtml(`<div class="secbar keep">Section B · Written answers</div>`); }
        written.forEach((q) => {
          n++;
          const parts = [`<div class="pq-h keep"><b>${n}.</b><div class="pq-t">${q.q} <span class="mk">[${q.marks}]</span>${opts.showTopics ? `<span class="tp">${IB.esc(topicLabel(q))}</span>` : ""}</div></div>`];
          parts.push(`<div class="box${linesFor(q) <= 10 ? " whole" : ""}">${"<i></i>".repeat(linesFor(q))}</div>`);
          addHtml(parts.join(""));
        });
      }

      // markscheme
      if (opts.markscheme !== false) {
        P.breakPage();
        addHtml(`<div class="mshead keep">Markscheme</div><p class="lead">M = method mark · A = answer mark · R = reasoning · ECF = error carried forward · OWTTE = or words to that effect.</p>`);
        if (mcq.length) addHtml(`<div class="secbar keep">Section A answers</div><div class="mcqgrid">${mcq.map((q, i) => `<div>${i + 1}. ${"ABCD"[q.answer]}</div>`).join("")}</div>`);
        ordered.forEach((q, i) => {
          if (q.type === "mcq" && !(q.ms || []).some((x) => x.length > 3)) return;
          addHtml(`<div class="msq"><div class="h"><span>${i + 1}.${q.type === "mcq" ? " " + "ABCD"[q.answer] : ""}</span><span>[${q.marks} mark${q.marks > 1 ? "s" : ""}]</span></div><ul>${(q.ms || []).map((p) => `<li>${p}</li>`).join("")}</ul></div>`);
        });
      }

      const all = [cover].concat(P.pages);
      all.forEach((p, i) => {
        p.classList.add("paper");
        if (i) p.insertAdjacentHTML("afterbegin", `<div class="ptop">– ${i + 1} –</div>`);
        const pn = p.querySelector(".pn");
        if (pn) pn.innerHTML = i < all.length - 1 ? "<b>Turn over</b>" : `${i + 1} / ${all.length}`;
      });
      const h2c = window.html2canvas.default || window.html2canvas.html2canvas || window.html2canvas;
      const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4", compress: true });
      all.forEach((p) => p.remove());
      for (let i = 0; i < all.length; i++) {
        prog.set(`Rendering page ${i + 1} of ${all.length}`, 0.3 + (0.7 * i) / all.length);
        root.appendChild(all[i]);
        const canvas = await h2c(all[i], { scale: 1.7, backgroundColor: "#ffffff", logging: false, useCORS: true, width: PW, height: PH, windowWidth: PW, windowHeight: PH });
        root.removeChild(all[i]);
        if (i) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.82), "JPEG", 0, 0, 595.28, 841.89, undefined, "FAST");
      }
      pdf.setProperties({ title, subject: s ? s.name : "IB practice paper", creator: "IB Revision Hub" });
      prog.set("Done", 1);
      IB.download(opts.filename || `IB-${s ? s.short.replace(/\s+/g, "-") : "Mixed"}-${title.replace(/[^\w-]+/g, "-")}-paper.pdf`, pdf.output("blob"), "application/pdf");
      return all.length;
    } catch (e) {
      IB.toast(e.message || "Couldn't build the PDF.");
      throw e;
    } finally {
      if (frame) frame.remove();
      prog.done();
    }
  };
})();
