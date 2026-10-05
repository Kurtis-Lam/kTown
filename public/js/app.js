/* kTown - shared core: subject registry, storage, rendering, marking, AI client. */
(function () {
  "use strict";

  const IB = (window.IB = window.IB || {});
  IB.subjects = IB.subjects || {};
  IB.order = ["chia", "engb", "math", "bio", "chem", "econ", "geo"];

  IB.register = function (subject) {
    subject.topics.forEach((t) => {
      t.subject = subject.id;
      (t.questions || []).forEach((q, i) => {
        q.id = q.id || `${t.id}-q${i + 1}`;
        q.subject = subject.id;
        q.topic = t.id;
        q.type = q.type || (q.options ? "mcq" : "short");
        q.diff = q.diff || 2;
      });
    });
    IB.subjects[subject.id] = subject;
  };

  // Merge exam-focused extras (game plan, methods, traps, tips, diagrams) into a registered subject.
  IB.extend = function (subjectId, extra) {
    const s = IB.subjects[subjectId];
    if (!s) return;
    if (extra.gameplan) s.gameplan = extra.gameplan;
    Object.entries(extra.topics || {}).forEach(([id, add]) => {
      const t = s.topics.find((x) => x.id === id);
      if (t) Object.assign(t, add);
    });
  };

  // Append extra hand-written questions to topics (ids continue each topic's numbering, so they stay stable).
  IB.addQuestions = function (subjectId, byTopic) {
    const s = IB.subjects[subjectId];
    if (!s) return;
    Object.entries(byTopic).forEach(([id, list]) => {
      const t = s.topics.find((x) => x.id === id);
      if (!t) return;
      t.questions = t.questions || [];
      list.forEach((q) => {
        q.id = q.id || `${t.id}-q${t.questions.length + 1}`;
        Object.assign(q, { subject: s.id, topic: t.id });
        q.type = q.type || (q.options ? "mcq" : "short");
        q.diff = q.diff || 2;
        t.questions.push(q);
      });
    });
  };

  IB.subjectList = () => IB.order.map((id) => IB.subjects[id]).filter(Boolean);
  IB.topic = (topicId) => {
    for (const s of IB.subjectList()) {
      const t = s.topics.find((x) => x.id === topicId);
      if (t) return t;
    }
    return null;
  };
  IB.allQuestions = (subjectId) => {
    const subs = subjectId ? [IB.subjects[subjectId]] : IB.subjectList();
    const site = subs.filter(Boolean).flatMap((s) => s.topics.flatMap((t) => t.questions || []));
    const mine = IB.myQuestions().filter((q) => !subjectId || q.subject === subjectId);
    return site.concat(mine);
  };
  IB.topicQuestions = (topicId) => IB.allQuestions(topicId.split("-")[0]).filter((q) => q.topic === topicId);

  // ---------- "My past papers": questions the student imports from their own copies ----------
  // Stored privately in this browser inside the progress store (so backups include them).
  // Text is kept raw and escaped when converted, because it is user-supplied.
  let myCache = null;
  IB.paperOptions = {
    econ: [["P1", "Paper 1"], ["P2", "Paper 2"]],
    chem: [["P1A", "Paper 1A (MCQ)"], ["P1B", "Paper 1B"], ["P2", "Paper 2"]],
    geo: [["P1", "Paper 1"], ["P2", "Paper 2"]],
    math: [["P1", "Paper 1"], ["P2", "Paper 2"]],
    bio: [["P1A", "Paper 1A (MCQ)"], ["P1B", "Paper 1B"], ["P2", "Paper 2"]],
    engb: [["P1", "Paper 1 (writing)"], ["P2", "Paper 2 (reading/listening)"], ["IO", "Individual oral"]],
    chia: [["P1", "試卷一"], ["P2", "試卷二"], ["IO", "個人口試"]],
  };
  IB.paperName = (subjectId, code) => ((IB.paperOptions[subjectId] || []).find(([c]) => c === code) || [code, code])[1];
  IB.mySource = (r) => [r.session, IB.paperName(r.subject, r.paper), r.qnum ? "Q" + r.qnum : ""].filter(Boolean).join(" · ");
  IB.myQuestions = function () {
    if (myCache) return myCache;
    const html = (s) => IB.esc(s).replace(/\n/g, "<br>");
    myCache = (IB.store.get().custom || [])
      .filter((r) => IB.subjects[r.subject] && IB.topic(r.topic))
      .map((r) => {
        const q = {
          id: r.id, subject: r.subject, topic: r.topic, paper: r.paper || "", marks: Math.max(1, r.marks | 0), diff: r.diff || 2,
          type: r.type === "mcq" && r.options && r.options.length >= 2 ? "mcq" : r.type === "extended" ? "extended" : "short",
          q: html(r.q), ms: (r.ms && r.ms.length ? r.ms : ["(No markscheme added yet - add it in My past papers.)"]).map(IB.esc),
          custom: true, source: IB.mySource(r), paperKey: r.subject + "|" + (r.session || "") + "|" + (r.paper || ""),
        };
        if (q.type === "mcq") Object.assign(q, { options: r.options.map(IB.esc), answer: r.answer >= 0 ? r.answer : 0, marks: 1 });
        if (r.numeric !== undefined && r.numeric !== null && r.numeric !== "" && isFinite(r.numeric)) q.numeric = { value: Number(r.numeric), tol: Math.max(Math.abs(Number(r.numeric)) * 0.01, 0.001) };
        return q;
      });
    return myCache;
  };
  IB.saveMy = function (fn) {
    IB.store.update((d) => {
      d.custom = d.custom || [];
      fn(d.custom);
    });
    myCache = null;
  };

  // Suggest the best-matching topic for a piece of question text (keyword overlap with the notes).
  IB.suggestTopic = function (subjectId, text) {
    const s = IB.subjects[subjectId];
    if (!s) return { topic: null, score: 0 };
    const tok = (x) => String(x).toLowerCase().replace(/<[^>]+>/g, " ").split(/[^a-z0-9₀-₉⁺⁻]+/).filter((w) => w.length > 3);
    const words = new Set(tok(text));
    let best = { topic: s.topics[0].id, score: 0 };
    s.topics.forEach((t) => {
      if (!t._kw) {
        const kw = {};
        const add = (str, w) => tok(str).forEach((k) => (kw[k] = Math.max(kw[k] || 0, w)));
        add(t.title, 4); add(t.summary, 2);
        (t.terms || []).forEach(([k, v]) => { add(k, 4); add(v, 1); });
        (t.concepts || []).forEach((c) => { add(c.h, 3); add(c.b, 1); });
        t._kw = kw;
      }
      let score = 0;
      words.forEach((w) => (score += t._kw[w] || 0));
      if (score > best.score) best = { topic: t.id, score };
    });
    return best;
  };
  IB.question = (id) => IB.allQuestions().find((q) => q.id === id) || (IB._generated && IB._generated[id]) || null;

  // ---------- utilities ----------
  const esc = (IB.esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  IB.qs = (sel, root = document) => root.querySelector(sel);
  IB.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  IB.el = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  IB.param = (k) => new URLSearchParams(location.search).get(k);
  IB.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  IB.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  IB.fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  IB.pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  IB.math = function (root) {
    if (!root || !window.renderMathInElement) return;
    try {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
      });
    } catch (e) {
      /* rendering is cosmetic */
    }
  };

  // Tiny, safe markdown renderer for AI output (escapes first, then formats).
  IB.md = function (src) {
    const lines = esc(src).split("\n");
    let html = "";
    let list = null;
    const inline = (s) =>
      s
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
    const close = () => {
      if (list) html += `</${list}>`;
      list = null;
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      let m;
      if ((m = line.match(/^#{1,4}\s+(.*)/))) {
        close();
        html += `<h4>${inline(m[1])}</h4>`;
      } else if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
        if (list !== "ul") { close(); html += "<ul>"; list = "ul"; }
        html += `<li>${inline(m[1])}</li>`;
      } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
        if (list !== "ol") { close(); html += "<ol>"; list = "ol"; }
        html += `<li>${inline(m[1])}</li>`;
      } else if (!line.trim()) {
        close();
      } else {
        close();
        html += `<p>${inline(line)}</p>`;
      }
    }
    close();
    return html;
  };

  // In the hosted preview (a sandboxed page) the browser blocks file downloads and printing.
  IB.hosted = !!window.IB_HOSTED;
  IB.print = function () {
    if (IB.hosted) return IB.toast("Printing isn't available in this preview. Run the full site to print or save as PDF.");
    window.print();
  };
  IB.download = function (filename, content, mime = "text/html") {
    if (IB.hosted) {
      // Hosted on claude.ai: files are offered through the page's "save files" ability.
      const dl = window.claude && window.claude.use ? window.claude.use("downloads") : Promise.resolve(null);
      dl.then((d) => {
        if (!d) return IB.toast("Downloads aren't available in this view.");
        return d.save({ filename, data: content }).then(
          () => IB.toast("Saved " + filename),
          (e) => { if (e && e.code !== "declined") IB.toast(e.code === "rate_limited" ? "A save is already open - finish that one first." : "Couldn't save the file here."); }
        );
      });
      return;
    }
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  };

  // Standalone, offline-readable HTML document (used for notes/worksheet downloads).
  IB.standaloneDoc = function (title, bodyHtml) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
 onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\\\(',right:'\\\\)',display:false}]})"></script>
<style>body{font:15px/1.6 system-ui,sans-serif;max-width:820px;margin:32px auto;padding:0 16px;color:#1d1d1b}
h1{font-size:1.8rem}h2{border-bottom:2px solid #ddd;padding-bottom:4px;margin-top:2em}h3{margin-top:1.4em}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:5px 8px;text-align:left;vertical-align:top}
.keyterm{display:grid;grid-template-columns:180px 1fr;gap:8px;border-bottom:1px dashed #ddd;padding:6px 0}.keyterm dt{font-weight:700}.keyterm dd{margin:0}
.skill,.ms{background:#f3f2ee;border-radius:8px;padding:8px 14px;margin:8px 0}.worked,.q{border:1px solid #ddd;border-radius:8px;padding:10px 14px;margin:10px 0;page-break-inside:avoid}
.concept{border-left:3px solid #3b5bdb;padding-left:14px;margin:16px 0}.lines{border-bottom:1px solid #bbb;height:28px}
.meta{color:#666;font-size:.85em}.callout{border-radius:10px;padding:10px 16px;margin:12px 0;page-break-inside:avoid}.callout-title{margin:.2em 0 .4em;font-size:.95em;letter-spacing:.06em;text-transform:uppercase}
.callout.formula{background:#EAF0FF}.callout.method{background:#E8F7EE}.callout.trap{background:#FDECEC}.callout.example{background:#F1EBFF}.callout.tip{background:#FFF4DB}.callout.terms{background:#FFF8E1}
.formula-grid{display:flex;flex-wrap:wrap;gap:8px}.formula{background:#fff;border-radius:8px;padding:6px 12px}.plot-grid{display:flex;flex-wrap:wrap;gap:12px}.plot{margin:0;width:340px}.plot svg{width:100%;--plot-a:#D9480F;--plot-b:#2D5BFF;--plot-c:#1F8A4C;--muted:#666;--text:#222}
.pl-grid{stroke:#e5e5e5}.pl-axis{stroke:#222;stroke-width:1.2}.pl-asym{stroke:#888;stroke-dasharray:5 4}.pl-lab,.pl-ax{font:11px sans-serif;fill:#333}figcaption{font-size:.85em;color:#555;text-align:center}.page-break{page-break-before:always}@media print{body{margin:0}}</style></head>
<body>${bodyHtml}<p class="meta" style="margin-top:3em">Downloaded from kTown · ${new Date().toLocaleDateString()} · Original IB-style material, not official IB content.</p></body></html>`;
  };

  // ---------- storage / progress ----------
  const KEY = "ibrev:v1";
  const blank = () => ({ attempts: [], read: {}, flags: {}, exams: [], custom: [], created: Date.now() });
  IB.store = {
    get() {
      try {
        const d = JSON.parse(localStorage.getItem(KEY));
        return d && d.attempts ? Object.assign(blank(), d) : blank();
      } catch (e) {
        return blank();
      }
    },
    save(d) {
      myCache = null;
      try {
        localStorage.setItem(KEY, JSON.stringify(d));
      } catch (e) {
        IB.toast("Could not save progress in this browser (storage blocked or full).");
      }
      window.dispatchEvent(new CustomEvent("ib:progress-saved", { detail: d }));
    },
    update(fn) {
      const d = this.get();
      fn(d);
      this.save(d);
      return d;
    },
  };
  IB.recordAttempt = function (q, score, max, mode = "practice") {
    IB.store.update((d) => {
      d.attempts.push({ id: q.id, s: q.subject, t: q.topic, sc: score, mx: max, m: mode, at: Date.now() });
      if (d.attempts.length > 5000) d.attempts = d.attempts.slice(-5000);
    });
  };
  IB.markRead = (topicId, val = true) => IB.store.update((d) => (val ? (d.read[topicId] = Date.now()) : delete d.read[topicId]));
  IB.toggleFlag = (qid) =>
    IB.store.update((d) => {
      if (d.flags[qid]) delete d.flags[qid];
      else d.flags[qid] = Date.now();
    });

  // Mastery per topic: recency-weighted % over the last 20 attempts.
  IB.mastery = function (topicId, data = IB.store.get()) {
    const rows = data.attempts.filter((a) => a.t === topicId).slice(-20);
    if (!rows.length) return null;
    let num = 0, den = 0;
    rows.forEach((a, i) => {
      const w = 1 + i / rows.length;
      num += w * (a.sc / a.mx);
      den += w;
    });
    return Math.round((100 * num) / den);
  };

  // Approximate IB grade from a percentage (boundaries vary by session - this is a guide only).
  const BOUNDS = {
    econ: [0, 16, 30, 42, 53, 64, 75],
    chem: [0, 18, 30, 42, 53, 64, 76],
    geo: [0, 15, 28, 40, 51, 62, 73],
    math: [0, 15, 28, 41, 54, 67, 80],
    bio: [0, 17, 29, 41, 52, 63, 74],
    engb: [0, 14, 30, 45, 58, 70, 82],
    chia: [0, 13, 26, 40, 53, 66, 78],
  };
  IB.grade = function (pct, subjectId) {
    const b = BOUNDS[subjectId] || BOUNDS.math;
    let g = 1;
    for (let i = 0; i < b.length; i++) if (pct >= b[i]) g = i + 1;
    return g;
  };

  // ---------- marking ----------
  const STOP = new Set(
    "the a an and or of to in on for with by is are be as at that this it its from which their there these those was were has have had will would can could may might into than then also not no more less most least such other each per using use used show shows give state award any one two both e.g. eg i.e. ie owttE owtte accept do don't allow".split(" ")
  );
  const stem = (w) => w.replace(/(ing|ed|es|s|ly)$/i, "");
  // Chinese has no spaces, so CJK runs are split into overlapping two-character "words".
  const cjk = (s) => (String(s).replace(/<[^>]+>/g, " ").match(/[\u3400-\u9fff]+/g) || []).flatMap((run) => (run.length < 2 ? [] : Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2))));
  const words = (s) =>
    String(s)
      .toLowerCase()
      .replace(/\\\(|\\\)|<[^>]+>/g, " ")
      .replace(/[^a-z0-9.%\-+ ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .map(stem)
      .concat(cjk(s));

  // Offline marker: credits a markscheme point when enough of its key words appear in the answer.
  IB.offlineMark = function (q, answer) {
    const ans = new Set(words(answer));
    const max = q.marks || 1;
    if (!String(answer).trim()) return { score: 0, max, awarded: [], missing: q.ms.slice(), summary: "No answer given.", offline: true };
    if (q.numeric) {
      const r = IB.checkNumeric(q, answer);
      return {
        score: r ? max : 0, max, awarded: r ? q.ms.slice() : [], missing: r ? [] : q.ms.slice(), offline: true,
        summary: r ? "Correct final answer." : `Final answer not matched (expected ≈ ${q.numeric.value}${q.numeric.unit ? " " + q.numeric.unit : ""}). Check your working against the markscheme.`,
      };
    }
    const awarded = [], missing = [];
    (q.ms || []).forEach((p) => {
      if (/^(level|band|\[?\d+\s*[-–]\s*\d+\]?\s*marks?|note|accept|do not|examiners?)/i.test(p.trim())) return;
      const kw = Array.from(new Set(words(p)));
      if (!kw.length) return;
      const hit = kw.filter((k) => ans.has(k)).length / kw.length;
      (hit >= 0.45 ? awarded : missing).push(p);
    });
    const total = awarded.length + missing.length || 1;
    let score = Math.round((awarded.length / total) * max);
    if (answer.trim().split(/\s+/).length + (answer.match(/[\u3400-\u9fff]/g) || []).length / 2 < 6) score = Math.min(score, 1);
    return {
      score, max, awarded, missing, offline: true,
      summary: "Estimated by keyword match against the markscheme - use the markscheme to check yourself, or switch on AI marking for examiner-style feedback.",
    };
  };

  IB.checkNumeric = function (q, answer) {
    const nums = String(answer)
      .replace(/[−–]/g, "-")
      .replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1/$2")
      .replace(/(\d)[, ](?=\d{3}\b)/g, "$1")
      .replace(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, (m, a, b) => `${m} ${parseFloat(a) / parseFloat(b)}`).replace(/(\d)\s*[×x]\s*10\^(-?\d+)/g, "$1e$2").match(/-?\d*\.?\d+(e-?\d+)?/gi);
    if (!nums) return false;
    const target = q.numeric.value;
    const tol = q.numeric.tol ?? Math.max(Math.abs(target) * 0.01, 1e-9);
    // Credit the answer if the final value (or any stated value, e.g. "x = 4, so S = 48") matches.
    return nums.some((n) => Math.abs(parseFloat(n) - target) <= tol);
  };

  // ---------- AI client ----------
  // ---------- AI client ----------
  // Two back ends with one interface:
  //  - hosted on claude.ai: the page's built-in "ask Claude" ability (runs on the viewer's Claude account);
  //  - self-hosted: server.js or Vercel (/api/*) with an OpenRouter API key.
  const SUBJECT_NAMES = { econ: "IB Economics SL", chem: "IB Chemistry SL", geo: "IB Geography SL", math: "IB Mathematics: Analysis and Approaches SL", bio: "IB Biology SL", engb: "IB English B HL", chia: "IB Chinese A: Language and Literature SL (answer in Traditional Chinese)" };
  const TUTOR_RULES = `You are an experienced IB Diploma teacher and examiner tutoring a student in IB Economics SL, Chemistry SL, Geography SL, Mathematics: Analysis & Approaches SL, Biology SL, English B HL and Chinese A: Language & Literature SL. For Chinese A, reply in Traditional Chinese unless the student writes in English.
- Guide rather than hand over answers: when asked for help with a problem, give the next hint or ask what they have tried, unless they explicitly ask for the full worked solution.
- Use IB command terms precisely and say what each demands in marks.
- Use correct IB terminology, units, significant figures and notation. Economics: say which diagram to draw and how to label it. Geography: push for named, located case studies with data. Chemistry: units, state symbols, s.f. Maths: show working and note Paper 1 (no calculator) vs Paper 2.
- Write maths with LaTeX between \\( and \\) inline and $$ $$ for display. Never use single $ delimiters.
- Keep answers focused: short paragraphs and bullet points. End with a quick check-for-understanding question when it helps.
- If unsure about IB rules or assessment changes, say so and suggest checking the current subject guide.`;
  const MARK_RULES = `You are a senior IB examiner. Mark the student's answer strictly against the IB-style markscheme provided.
- Award marks only for creditworthy points present in the answer. Accept equivalent wording (OWTTE). Do not reward vague or incorrect statements.
- Extended responses: apply the level descriptors in the markscheme holistically and choose the best-fit level and mark.
- Calculations: apply method (M) and accuracy (A) marks and follow-through (FT) as IB would.
- Feedback is for a 16-18 year old: specific, encouraging and actionable; quote or paraphrase their words.`;
  const plain = (s) => String(s || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const SAMPLE_MSG = {
    not_granted: "AI was not allowed for this page. You can allow it from the page's Permissions menu.",
    sampling_disabled: "AI isn't available for this Claude account.",
    rate_limited: "The AI is busy or you've hit your usage limit - try again in a little while.",
    session_expired: "Please sign in to Claude again.",
    refused: "The AI declined that request. Try rephrasing it.",
    prompt_too_large: "That's too long for the AI - shorten your answer or question.",
    invalid_json: "The AI's reply couldn't be read - please try again.",
  };
  const sampleError = (e) => {
    const code = e && e.code;
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) IB.ai._health = false;
    const err = new Error(SAMPLE_MSG[code] || "The AI had a problem - please try again.");
    err.code = code;
    err.partial = e && e.text;
    return err;
  };

  IB.ai = {
    _health: null,
    _sample: null,
    async sampler() {
      if (this._sample !== null) return this._sample;
      try {
        this._sample = window.claude && window.claude.use ? (await window.claude.use("sample")) || false : false;
      } catch (e) {
        this._sample = false;
      }
      return this._sample;
    },
    async available() {
      if (this._health === null) {
        if (IB.hosted) {
          this._health = !!(await this.sampler());
        } else {
          try {
            const r = await fetch("/api/health", { cache: "no-store" });
            this._health = r.ok ? (await r.json()).ai === true : false;
          } catch (e) {
            this._health = false;
          }
        }
      }
      return this._health;
    },
    async mark(q, answer) {
      const t = IB.topic(q.topic);
      const question = plain(q.q) + (q.options ? "\nOptions: " + q.options.map(plain).join(" | ") : "");
      if (IB.hosted) {
        const sample = await this.sampler();
        if (!sample) throw new Error("AI isn't available here.");
        const prompt = `${MARK_RULES}

Subject: ${SUBJECT_NAMES[q.subject] || q.subject}
Topic: ${t ? t.title : ""}
Maximum marks: ${q.marks}

<question>
${question}
</question>

<markscheme>
${q.ms.map((p) => "- " + plain(p)).join("\n")}
</markscheme>

<student_answer>
${String(answer).slice(0, 12000)}
</student_answer>

Mark the student answer out of ${q.marks}. Reply with only a JSON object of this shape:
{"score": <integer 0-${q.marks}>, "level": "<level/band for extended responses, else empty string>", "summary": "<1-2 sentence verdict>", "awarded": ["<markscheme points earned>"], "missing": ["<points missed or wrong>"], "improvements": ["<concrete actions to gain the missing marks>"], "model_answer": "<concise full-mark model answer>"}`;
        let r;
        try {
          r = await sample.json(prompt, { modelTier: "default" });
        } catch (e) {
          throw sampleError(e);
        }
        const arr = (x) => (Array.isArray(x) ? x.map((v) => IB.esc(String(v))) : []);
        return {
          score: Math.max(0, Math.min(q.marks, Math.round(Number(r && r.score) || 0))), max: q.marks,
          level: String((r && r.level) || ""), summary: String((r && r.summary) || ""),
          awarded: arr(r && r.awarded), missing: arr(r && r.missing), improvements: (r && Array.isArray(r.improvements) ? r.improvements.map(String) : []),
          model_answer: String((r && r.model_answer) || ""),
        };
      }
      const r = await fetch("/api/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: q.subject, topic: t ? t.title : "", question, ms: q.ms, marks: q.marks, answer }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "AI marking failed");
      // AI text is shown as HTML lists, so escape it.
      j.awarded = (j.awarded || []).map((x) => IB.esc(x));
      j.missing = (j.missing || []).map((x) => IB.esc(x));
      return j;
    },
    // Ask for structured data with a free-form prompt (used by IA/EE marking and the RQ checker).
    async json(prompt) {
      if (IB.hosted) {
        const sample = await this.sampler();
        if (!sample) throw new Error("AI isn't available here.");
        try {
          return await sample.json(prompt, { modelTier: "default", cache: false });
        } catch (e) {
          throw sampleError(e);
        }
      }
      const r = await fetch("/api/json", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "AI request failed");
      return j;
    },
    async generate(opts) {
      if (IB.hosted) {
        const sample = await this.sampler();
        if (!sample) throw new Error("AI isn't available here.");
        const n = Math.max(1, Math.min(8, opts.count || 4));
        const style = opts.style === "mcq" ? "multiple-choice (4 options)" : opts.style === "extended" ? "extended-response" : "a mix of short-answer and structured";
        const prompt = `You are a senior IB examiner who writes original exam-style questions with accurate markschemes.
Write ${n} ORIGINAL practice questions for ${SUBJECT_NAMES[opts.subject] || opts.subject}, topic "${opts.topic}". Style: ${style}.
Match IB command terms, mark allocations and markscheme conventions. Do not copy real IB past-paper questions.
Markscheme: a list of mark points (one creditworthy point per mark where possible; for extended responses give indicative content plus level descriptors).
Write maths with \\( \\) delimiters.
Reply with only a JSON object: {"questions": [{"q": "...", "marks": 4, "type": "short"|"extended"|"mcq", "options": ["A text","B text","C text","D text"] or [], "answer": <0-based index for mcq, else -1>, "ms": ["point 1", "point 2"]}]}`;
        try {
          const r = await sample.json(prompt, { modelTier: "default", cache: false });
          return (r && Array.isArray(r.questions) ? r.questions : []).filter((x) => x && x.q).map((x) => ({
            q: String(x.q), marks: Math.max(1, Math.min(20, parseInt(x.marks, 10) || 2)), type: ["mcq", "short", "extended"].includes(x.type) ? x.type : "short",
            options: Array.isArray(x.options) ? x.options.map(String) : [], answer: Number.isInteger(x.answer) ? x.answer : -1, ms: Array.isArray(x.ms) ? x.ms.map(String) : [],
          }));
        } catch (e) {
          throw sampleError(e);
        }
      }
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(opts) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Generation failed");
      return j.questions || [];
    },
    async tutor(payload, onDelta) {
      if (IB.hosted) {
        const sample = await this.sampler();
        if (!sample) throw new Error("AI isn't available here.");
        const ctx = payload.subject ? `\n\nThe student is currently studying ${SUBJECT_NAMES[payload.subject] || payload.subject}${payload.topic ? ", topic: " + payload.topic : ""}.` : "";
        const turns = [{ role: "user", content: TUTOR_RULES + ctx }].concat(
          (payload.messages || []).filter((m) => m.content && (m.role === "user" || m.role === "assistant")).slice(-20).map((m) => ({ role: m.role, content: String(m.content).slice(0, 12000) }))
        );
        try {
          await sample(turns, { cache: false, onText: ({ delta }) => onDelta(delta) });
        } catch (e) {
          throw sampleError(e);
        }
        return;
      }
      const r = await fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Tutor unavailable");
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const ev = (chunk.match(/^event: (.*)$/m) || [])[1];
          const data = JSON.parse((chunk.match(/^data: (.*)$/m) || [])[1] || "{}");
          if (ev === "delta") onDelta(data.text);
          if (ev === "error") throw new Error(data.error);
        }
      }
    },
  };

  // ---------- question component ----------
  // opts: { mode: 'practice'|'exam', number, onScored(score,max), showTopic, hideActions }
  IB.renderQuestion = function (q, opts = {}) {
    const s = IB.subjects[q.subject];
    const t = IB.topic(q.topic);
    const flagged = !!IB.store.get().flags[q.id];
    const diff = ["", "Foundation", "Standard", "Challenging"][q.diff] || "";
    const card = IB.el(`<article class="q-card" data-qid="${esc(q.id)}">
      <div class="q-meta">
        ${opts.number ? `<strong>Q${opts.number}.</strong>` : ""}
        <span class="pill ${q.subject}">${esc(s ? s.short : q.subject)}</span>
        ${opts.showTopic !== false && t ? `<span class="pill">${esc(t.code)} ${esc(t.title)}</span>` : ""}
        ${q.paper ? `<span class="pill">${esc(q.paper)}</span>` : ""}
        ${diff ? `<span class="pill ${q.diff === 3 ? "bad" : q.diff === 1 ? "good" : "warn"}">${diff}</span>` : ""}
        ${q.generated ? `<span class="pill">Auto-generated</span>` : ""}
        ${q.sec && q.sec !== "exam" && IB.sectionName ? `<span class="pill sec ${q.sec}">${esc(IB.sectionName(q.sec))}</span>` : ""}
        ${q.custom ? `<span class="pill good">My past paper · ${esc(q.source)}</span>` : ""}
        <span class="marks">[${q.marks}]</span>
      </div>
      <div class="q-text rich">${q.q}</div>
      <div class="q-answer"></div>
      <div class="q-actions btn-row no-print" style="margin-top:10px"></div>
      <div class="q-result"></div>
    </article>`);
    const ansBox = IB.qs(".q-answer", card);
    const actions = IB.qs(".q-actions", card);
    const result = IB.qs(".q-result", card);
    let scored = false;

    const finish = (score, max, mode) => {
      if (scored) return;
      scored = true;
      IB.recordAttempt(q, score, max, mode || opts.mode || "practice");
      card.dataset.score = score;
      card.classList.remove("pop", "shake");
      void card.offsetWidth;
      card.classList.add(score >= max ? "pop" : score === 0 ? "shake" : "pop");
      if (score >= max && max > 0 && opts.mode !== "exam" && IB.celebrate) IB.celebrate(IB.qs(".q-result", card) || card);
      if (opts.onScored) opts.onScored(score, max);
    };

    const showMs = () => {
      if (IB.qs(".ms", result)) return;
      const ms = IB.el(`<div class="ms"><strong>Markscheme</strong><ul>${(q.ms || []).map((p) => `<li>${p}</li>`).join("")}</ul></div>`);
      result.appendChild(ms);
      IB.math(ms);
    };

    if (q.type === "mcq") {
      const name = "opt-" + q.id + "-" + Math.random().toString(36).slice(2, 6);
      ansBox.innerHTML = `<ul class="options">${q.options
        .map((o, i) => `<li><label><input type="radio" name="${name}" value="${i}"><span><strong>${"ABCD"[i]}.</strong> ${o}</span></label></li>`)
        .join("")}</ul>`;
      const check = IB.el(`<button class="btn primary small">Check answer</button>`);
      if (opts.mode !== "exam") actions.appendChild(check);
      check.onclick = () => {
        const sel = IB.qs(`input[name="${name}"]:checked`, ansBox);
        if (!sel) return IB.toast("Choose an option first.");
        const choice = +sel.value;
        IB.qsa("label", ansBox).forEach((l, i) => {
          if (i === q.answer) l.classList.add("correct");
          else if (i === choice) l.classList.add("wrong");
          IB.qs("input", l).disabled = true;
        });
        const ok = choice === q.answer;
        result.prepend(IB.el(`<div class="feedback ${ok ? "good" : "low"}"><h4>${ok ? "Correct" : "Not quite"} - ${ok ? q.marks : 0}/${q.marks}</h4><div>${q.ms && q.ms.length ? q.ms.join(" ") : ""}</div></div>`));
        IB.math(result);
        check.disabled = true;
        finish(ok ? q.marks : 0, q.marks);
      };
      card.getAnswer = () => {
        const sel = IB.qs(`input[name="${name}"]:checked`, ansBox);
        return sel ? +sel.value : null;
      };
      card.autoMark = () => {
        if (!scored) check.click();
      };
      card.giveZero = () => {
        IB.qsa("label", ansBox).forEach((l, i) => {
          if (i === q.answer) l.classList.add("correct");
          IB.qs("input", l).disabled = true;
        });
        result.prepend(IB.el(`<div class="feedback low"><h4>Not answered - 0/${q.marks}</h4></div>`));
        finish(0, q.marks, "exam");
      };
    } else {
      const rows = q.type === "extended" ? 14 : Math.min(10, 3 + q.marks);
      ansBox.innerHTML = `<textarea rows="${rows}" placeholder="${q.numeric ? "Show your working, then give your final answer…" : "Write your answer here…"}"></textarea>`;
      const ta = IB.qs("textarea", ansBox);
      const aiBtn = IB.el(`<button class="btn primary small">✦ AI mark my answer</button>`);
      const msBtn = IB.el(`<button class="btn small">Show markscheme & self-mark</button>`);
      if (!opts.hideActions && opts.mode !== "exam") {
        actions.append(aiBtn, msBtn);
      }
      const selfMark = () => {
        showMs();
        if (IB.qs(".self-mark", result) || scored) return;
        const sm = IB.el(`<div class="self-mark"><span class="small muted">Your mark:</span><input type="number" min="0" max="${q.marks}" value="0"><span class="small">/ ${q.marks}</span><button class="btn small">Save mark</button></div>`);
        result.appendChild(sm);
        IB.qs("button", sm).onclick = () => {
          const v = Math.max(0, Math.min(q.marks, parseInt(IB.qs("input", sm).value, 10) || 0));
          finish(v, q.marks, opts.mode === "exam" ? "exam" : "self");
          sm.innerHTML = `<span class="pill good">Saved ${v}/${q.marks}</span>`;
        };
      };
      msBtn.onclick = selfMark;
      const runMark = async () => {
        const answer = ta.value;
        if (!answer.trim()) return IB.toast("Write an answer first.");
        aiBtn.disabled = true;
        aiBtn.textContent = "Marking…";
        let fb;
        try {
          if (await IB.ai.available()) fb = await IB.ai.mark(q, answer);
          else fb = IB.offlineMark(q, answer);
        } catch (e) {
          IB.toast(e.message + " - using offline marker.");
          fb = IB.offlineMark(q, answer);
        }
        aiBtn.textContent = fb.offline ? "Marked (offline estimate)" : "✦ Marked by AI";
        IB.qsa(".feedback", result).forEach((n) => n.remove());
        result.prepend(IB.feedbackEl(fb));
        IB.math(result);
        finish(fb.score, fb.max, fb.offline ? "offline" : "ai");
        showMs();
        return fb;
      };
      aiBtn.onclick = runMark;
      card.getAnswer = () => ta.value;
      card.autoMark = runMark;
      card.selfMark = selfMark;
      card.giveZero = () => {
        ta.disabled = true;
        result.prepend(IB.feedbackEl({ score: 0, max: q.marks, summary: "No answer given.", offline: true }));
        showMs();
        finish(0, q.marks, "exam");
      };
    }

    if (!opts.hideActions && opts.mode !== "exam") {
      const flag = IB.el(`<button class="btn small" title="Save to your review list">${flagged ? "★ Saved" : "☆ Save for review"}</button>`);
      flag.onclick = () => {
        IB.toggleFlag(q.id);
        flag.textContent = IB.store.get().flags[q.id] ? "★ Saved" : "☆ Save for review";
      };
      const tutor = IB.el(`<a class="btn small" href="tutor.html?q=${encodeURIComponent(q.id)}">Ask the AI tutor</a>`);
      if (q.generated) tutor.href = `tutor.html?subject=${q.subject}&prompt=${encodeURIComponent("Help me with this question: " + q.q.replace(/<[^>]+>/g, " "))}`;
      actions.append(flag, tutor);
    }
    IB.math(card);
    card.q = q;
    card.isScored = () => scored;
    return card;
  };

  IB.feedbackEl = function (fb) {
    const p = fb.score / fb.max;
    const list = (title, arr) => (arr && arr.length ? `<p class="small" style="margin:.6em 0 .2em"><strong>${title}</strong></p><ul class="small">${arr.map((x) => `<li>${x}</li>`).join("")}</ul>` : "");
    return IB.el(`<div class="feedback ${p >= 0.7 ? "good" : p >= 0.4 ? "mid" : "low"}">
      <h4>${fb.score}/${fb.max}${fb.level ? ` · ${esc(fb.level)}` : ""} ${fb.offline ? '<span class="pill">offline estimate</span>' : '<span class="pill good">AI examiner</span>'}</h4>
      <div class="small">${esc(fb.summary || "")}</div>
      ${list("✓ Credited", fb.awarded)}
      ${list("✗ Missing", fb.missing)}
      ${list("How to improve", (fb.improvements || []).map(esc))}
      ${fb.model_answer ? `<details style="margin-top:6px"><summary>Model answer</summary><div class="small" style="white-space:pre-line">${esc(fb.model_answer)}</div></details>` : ""}
    </div>`);
  };

  // ---------- chrome ----------
  IB.toast = function (msg) {
    let t = document.getElementById("toast");
    if (!t) {
      t = IB.el(`<div id="toast" style="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:10px;z-index:99;font-size:.92rem;max-width:90vw;box-shadow:var(--shadow);transition:opacity .3s"></div>`);
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = 1;
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.style.opacity = 0), 3200);
  };

  function chrome() {
    const page = document.body.dataset.page || "";
    const link = (href, label, id) => `<a href="${href}" class="${page === id ? "active" : ""}">${label}</a>`;
    const background = IB.el('<iframe class="site-background" src="background.html" title="" aria-hidden="true" tabindex="-1"></iframe>');
    document.body.prepend(background);
    const header = IB.el(`<header class="site-header"><div class="container nav">
      <a class="brand" href="ktown.html"><img src="imgs/logo.png" alt="" class="brand-logo">kTown</a>
      <nav class="nav-links" id="navLinks">
        ${link("krevisionnotes.html", "kRevisionNotes", "notes")}
        ${link("questionbank.html", "Questions", "bank")}
        ${link("practice.html", "Practice", "practice")}
        ${link("progress.html", "Progress", "progress")}
        <details class="nav-more" ${["skills", "ia", "tutor", "mypapers"].includes(page) ? "data-active='true'" : ""}>
          <summary>More</summary>
          <div class="nav-more-menu">
            ${link("tutor.html", "AI Tutor", "tutor")}
            ${link("skills.html", "Exam skills", "skills")}
            ${link("ia.html", "IA &amp; EE", "ia")}
            ${link("mypapers.html", "Past papers", "mypapers")}
          </div>
        </details>
      </nav>
      <div class="account-actions">
        <button class="auth-open" id="authOpen" type="button">Sign in</button>
        <span class="auth-account" id="authAccount" hidden><span id="authDisplayName"></span><button class="auth-signout" id="authSignOut" type="button">Sign out</button></span>
      </div>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">☰</button>
    </div></header>`);
    document.body.prepend(header);
    document.body.appendChild(
      IB.el(`<footer class="site-footer"><div class="container">
      <p><strong>kTown</strong> · Your IB study space</p>
      <p class="small">Original revision material; not affiliated with the International Baccalaureate Organization.</p>
    </div></footer>`)
    );
    document.dispatchEvent(new Event("ktown:chrome-ready"));
    IB.qs("#menuBtn").onclick = () => IB.qs("#navLinks").classList.toggle("open");
    const more = IB.qs(".nav-more");
    if (more && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      more.addEventListener("pointerenter", () => more.open = true);
      more.addEventListener("pointerleave", () => more.open = false);
      const summary = more.querySelector("summary");
      summary.addEventListener("click", (event) => event.preventDefault());
      summary.addEventListener("keydown", (event) => {
        if (["Enter", " ", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          more.open = true;
          more.querySelector("a")?.focus();
        } else if (event.key === "Escape") {
          more.open = false;
        }
      });
    }
  }

  // Wrap each page's opening heading + intro paragraph in the dark header band.
  function introBand() {
    const app = document.getElementById("app");
    const h1 = app && app.firstElementChild;
    if (!h1 || h1.tagName !== "H1" || h1.closest(".band")) return;
    const band = document.createElement("section");
    band.className = "band";
    band.style.paddingBlock = "8px 32px";
    app.insertBefore(band, h1);
    band.appendChild(h1);
    h1.style.marginTop = "18px";
    while (band.nextElementSibling && band.nextElementSibling.tagName === "P") band.appendChild(band.nextElementSibling);
  }

  document.addEventListener("DOMContentLoaded", () => {
    chrome();
    const ret = typeof IB.page === "function" ? IB.page() : null;
    Promise.resolve(ret).then(() => {
      introBand();
      const app = document.getElementById("app");
      if (IB.floaters) IB.qsa(".band", app).forEach(IB.floaters);
      if (IB.animate) IB.animate(app);
    });
  });
})();

/* Shared document builders (notes & worksheet downloads). */
// Colour-coded note sections, shared by the notes page and downloads.
IB.CALLOUTS = [
  ["formula", "Formulas", "What to know or recognise"],
  ["method", "Fastest methods", "The quickest reliable route to the marks"],
  ["trap", "Traps", "Where marks are usually lost"],
  ["example", "Worked examples", "Full solutions in exam layout"],
  ["tip", "Exam tips", "How the markscheme thinks"],
  ["terms", "Key terms", "Learn these word-for-word for 2-mark definitions"],
];
IB.topicSections = function (t, opts = {}) {
  const out = [];
  const box = (kind, title, body, id) => `<section class="callout ${kind}" ${id ? `id="${id}"` : ""} data-reveal><h3 class="callout-title">${title}</h3>${body}</section>`;
  if (t.formulas && t.formulas.length) out.push(["formulas", "Formulas", box("formula", "Formulas", `<div class="formula-grid">${t.formulas.map((f) => `<div class="formula">${f}</div>`).join("")}</div>`, "sec-formulas")]);
  out.push(["concepts", "Concepts", `<section class="card concepts" id="sec-concepts" data-reveal><h3 class="section-title">Key concepts</h3>${t.concepts.map((x) => `<div class="concept"><h3>${x.h}</h3>${x.b}</div>`).join("")}</section>`]);
  if (t.table) out.push(["table", "Compare", `<section class="card" id="sec-table" data-reveal><h3 class="section-title">Compare at a glance</h3><div class="table-wrap"><table class="compare"><tr>${t.table.head.map((h) => `<th>${h}</th>`).join("")}</tr>${t.table.rows.map((r) => `<tr>${r.map((x, i) => (i ? `<td>${x}</td>` : `<th scope="row">${x}</th>`)).join("")}</tr>`).join("")}</table></div></section>`]);
  if (t.diagrams && t.diagrams.length && IB.plot) out.push(["diagrams", "Diagrams", `<section class="card" id="sec-diagrams" data-reveal><h3 class="section-title">Diagrams to know</h3><div class="plot-grid">${t.diagrams.map(IB.plot).join("")}</div></section>`]);
  const methods = (t.methods || []).concat((t.skills || []).map((x) => `<strong>${x.h}:</strong> ${x.b}`));
  if (methods.length) out.push(["methods", "Fastest methods", box("method", "Fastest methods", `<ol>${methods.map((m) => `<li>${m}</li>`).join("")}</ol>`, "sec-methods")]);
  if (t.traps && t.traps.length) out.push(["traps", "Traps", box("trap", "Traps", `<ul>${t.traps.map((m) => `<li>${m}</li>`).join("")}</ul>`, "sec-traps")]);
  if (t.examples && t.examples.length) out.push(["examples", "Worked examples", box("example", "Worked examples", t.examples.map((e, i) => `<div class="worked"><strong>Example ${i + 1}.</strong> ${e.q}${opts.static ? `<div class="sol"><strong>Solution:</strong> ${e.a}</div>` : `<details class="sol"><summary>Show solution</summary><div>${e.a}</div></details>`}</div>`).join(""), "sec-examples")]);
  const plans = IB.essayPlansHtml ? IB.essayPlansHtml(t) : "";
  if (plans) out.push(["plans", "Essay plans", `<section class="card plans" id="sec-plans" data-reveal><h3 class="section-title">Practice essay plans</h3><p class="small muted" style="margin-top:0">Built from the markschemes: intro → for → against → examples → evaluate → conclusion. Use at least two evaluation lenses (scale, time, stakeholders, place, evidence).</p>${plans}</section>`]);
  if (t.tips && t.tips.length) out.push(["tips", "Exam tips", box("tip", "Exam tips", `<ul>${t.tips.map((m) => `<li>${m}</li>`).join("")}</ul>`, "sec-tips")]);
  if (t.terms && t.terms.length) out.push(["terms", "Key terms", box("terms", "Key definitions to learn", `<div class="table-wrap"><table class="def-table"><thead><tr><th>Term</th><th>Definition</th></tr></thead><tbody>${t.terms.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("")}</tbody></table></div>`, "sec-terms")]);
  return out;
};

IB.topicHtml = function (t, opts = {}) {
  const s = IB.subjects[t.subject];
  let h = `<h2>${IB.esc(t.code)} ${IB.esc(t.title)}</h2><p class="meta">${IB.esc(s.name)} · ${IB.esc(t.unit)}</p><p><em>${t.summary}</em></p>`;
  h += IB.topicSections(t, { static: true }).map((x) => x[2]).join("");
  if (opts.questions) h += IB.worksheetHtml(t.questions.filter((q) => !q.derived), `Practice questions - ${t.title}`, true);
  return h;
};

IB.worksheetHtml = function (qs, title, inline) {
  let h = `<h3>${IB.esc(title)}</h3>`;
  qs.forEach((q, i) => {
    const lines = q.type === "mcq" ? "" : `<div>${'<div class="lines"></div>'.repeat(Math.min(12, 2 + q.marks))}</div>`;
    const opts = q.options ? `<ol type="A">${q.options.map((o) => `<li>${o}</li>`).join("")}</ol>` : "";
    h += `<div class="q"><strong>${i + 1}.</strong> <span class="meta">[${q.marks} mark${q.marks > 1 ? "s" : ""}${q.paper ? " · " + q.paper : ""}]</span><div>${q.q}</div>${opts}${lines}</div>`;
  });
  h += `<div class="${inline ? "" : "page-break"}"><h3>Markscheme - ${IB.esc(title)}</h3>`;
  qs.forEach((q, i) => {
    const ans = q.type === "mcq" ? `<p><strong>Answer: ${"ABCD"[q.answer]}</strong></p>` : "";
    h += `<div class="ms"><strong>${i + 1}.</strong> ${ans}<ul>${q.ms.map((p) => `<li>${p}</li>`).join("")}</ul></div>`;
  });
  return h + `</div>`;
};


/* ---------- highlight key (green = key terms, yellow = statistics & formulas, blue = dates, pink = places, policies & names) ---------- */
IB.HIGHLIGHTS = [
  ["k", "Key / command terms"],
  ["s", "Statistics & formulas"],
  ["d", "Dates"],
  ["p", "Places, policies, names"],
];
(function () {
  const PLACES = ("Afghanistan|Algeria|Angola|Argentina|Australia|Austria|Bangladesh|Belgium|Bhutan|Bolivia|Botswana|Brazil|Cambodia|Cameroon|Canada|Chad|Chile|China|Colombia|Congo|Costa Rica|Cuba|Denmark|Egypt|Ethiopia|Finland|France|Germany|Ghana|Greece|Guatemala|Haiti|Hong Kong|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Japan|Jordan|Kenya|Kiribati|Kuwait|Laos|Lebanon|Libya|Macau|Madagascar|Malawi|Malaysia|Maldives|Mali|Mexico|Mongolia|Morocco|Mozambique|Myanmar|Nepal|Netherlands|New Zealand|Niger|Nigeria|North Korea|Norway|Pakistan|Panama|Peru|Philippines|Poland|Portugal|Qatar|Russia|Rwanda|Saudi Arabia|Senegal|Sierra Leone|Singapore|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Sweden|Switzerland|Syria|Taiwan|Tanzania|Thailand|Tunisia|Turkey|Tuvalu|Uganda|Ukraine|United Arab Emirates|UAE|United Kingdom|UK|United States|USA|US|Uruguay|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe|Greenland|Scotland|England|Wales|" +
    "London|Paris|Berlin|Tokyo|Osaka|Kyoto|Beijing|Shanghai|Shenzhen|Guangzhou|Mumbai|Delhi|Kolkata|Dhaka|Karachi|Lagos|Nairobi|Cairo|Jakarta|Manila|Bangkok|Seoul|Sydney|Melbourne|New York|Los Angeles|Chicago|Mexico City|São Paulo|Rio de Janeiro|Curitiba|Medellín|Bogotá|Lima|Buenos Aires|Toronto|Vancouver|Rotterdam|Amsterdam|Copenhagen|Stockholm|Freiburg|Vienna|Rome|Madrid|Barcelona|Istanbul|Dubai|Riyadh|Tehran|Kabul|Kathmandu|Christchurch|Fukushima|Port-au-Prince|Kobe|Dharavi|Kibera|Cox's Bazar|Berlin|Venice|" +
    "Sahel|Sahara|Amazon|Himalayas|Arctic|Antarctica|Ganges|Brahmaputra|Mekong|Yangtze|Nile|Mississippi|Murray-Darling|Aral Sea|Mediterranean|Pacific|Atlantic|Indian Ocean|Ring of Fire|Great Barrier Reef|Europe|Africa|Asia|Latin America|Middle East|Sub-Saharan Africa|" +
    "EU|ASEAN|USMCA|NAFTA|OPEC|WTO|IMF|World Bank|UN|UNHCR|WHO|IPCC|OECD|NATO|G20|Paris Agreement|Kyoto Protocol|Montreal Protocol|Stop at Two|one-child policy|two-child policy|Maternity Capital|Green Revolution|Marshall Plan|Belt and Road|Brexit|Gavi|GiveDirectly|Haber process").split("|");
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const DATE = String.raw`\b(?:1[6-9]\d\d|20\d\d)(?:s\b|\s?[-–]\s?(?:1[6-9]\d\d|20\d\d)\b)?(?!\s?(?:%|km|kg|kJ|mm|ppm|m\b|people|units|tonnes))`;
  const STAT = String.raw`(?:[$£€¥]\s?)?\b\d[\d,]*(?:\.\d+)?\s?(?:%|per cent|percent|million|billion|trillion|bn\b|km²|km|kg|tonnes|°C|ppm|years?\b|per\s1,?000|per 100\b|times\b|mm\b|kJ\b|mol\b)|[$£€¥]\s?\d[\d,]*(?:\.\d+)?|\b\d+\.\d+\b`;
  const PLACE = PLACES.sort((a, b) => b.length - a.length).map(esc).join("|");
  const SKIP = "script,style,code,pre,svg,.banner,.bar,.toc,.qh,.foot,.katex,.plot,button,a,h1,h2,h3,h4,.callout-title,.hl,mark,input,textarea,select,.q-card,.no-hl";
  const classify = (txt) =>
    new RegExp("^\\s*" + DATE + "\\s*$").test(txt) ? "d" : new RegExp(STAT).test(txt) && /\d/.test(txt) && txt.length < 40 ? "s" : new RegExp("^(?:" + PLACE + ")$").test(txt.trim()) ? "p" : "k";

  IB.highlight = function (root, opts = {}) {
    if (!root) return;
    const doc = root.ownerDocument || document;
    // 1) bold phrases the notes already stress become highlighted key phrases (or stats/dates/places)
    root.querySelectorAll("strong, b").forEach((el) => {
      if (el.closest(SKIP) || el.closest(".keyterm dt, th")) return;
      el.classList.add("hl", "hl-" + classify(el.textContent));
    });
    // 2) dates, statistics, places and the topic's key terms inside running text
    const terms = (opts.terms || []).filter((t) => t && t.length > 2).sort((a, b) => b.length - a.length);
    const latin = terms.filter((t) => /^[\w(]/.test(t)).map(esc);
    const cjk = terms.filter((t) => !/^[\w(]/.test(t)).map(esc);
    const parts = [`(${DATE})`, `(${STAT})`, `\\b(${PLACE})\\b`];
    parts.push(latin.length ? `\\b(${latin.join("|")})\\b` : "(?!x)x");
    parts.push(cjk.length ? `(${cjk.join("|")})` : "(?!x)x");
    const re = new RegExp(parts.join("|"), "gi");
    const kinds = ["d", "s", "p", "k", "k"];
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (!n.nodeValue.trim() || (n.parentElement && n.parentElement.closest(SKIP + ",strong,b")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const seen = {};
    nodes.forEach((node) => {
      const text = node.nodeValue;
      re.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = re.exec(text))) {
        if (!m[0].trim()) { re.lastIndex++; continue; }
        const g = m.slice(1).findIndex((x) => x !== undefined);
        const kind = kinds[g];
        // key terms: only the first two mentions per block, so pages don't turn green
        if (kind === "k") {
          const key = m[0].toLowerCase();
          seen[key] = (seen[key] || 0) + 1;
          if (seen[key] > 2) continue;
        }
        frag = frag || doc.createDocumentFragment();
        frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
        const span = doc.createElement("span");
        span.className = "hl hl-" + kind;
        span.textContent = m[0];
        frag.appendChild(span);
        last = m.index + m[0].length;
      }
      if (frag) {
        frag.appendChild(doc.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  };
  IB.highlightKey = () => `<div class="hl-key"><span>Highlight key:</span>${IB.HIGHLIGHTS.map(([k, n]) => `<span class="hl hl-${k}">${n}</span>`).join("")}</div>`;
})();

/* ---------- essay plans built from extended-response markschemes ---------- */
IB.essayPlan = function (q) {
  if (q.type !== "extended" || !q.ms || q.subject === "engb" || q.subject === "chia") return null;
  const rows = { Intro: [], Diagram: [], For: [], Against: [], Examples: [], Evaluate: [] };
  q.ms.forEach((p) => {
    const x = p.replace(/<[^>]+>/g, "").trim();
    if (/^level\b|^\d+\s*-\s*\d+|^\[?\d+\]/i.test(x)) return;
    const body = x.replace(/^(for|against|evaluation|evaluate|advantages?|disadvantages?)\s*[:-]\s*/i, "");
    if (/^(define|definition|describe .*(stages|types))/i.test(x)) rows.Intro.push(x);
    else if (/^diagram/i.test(x)) rows.Diagram.push(x.replace(/^diagram\s*[:-]\s*/i, ""));
    else if (/^(for|advantages?|benefits?|strengths?|successes?|some success|useful|gains?|positive|opportunit)/i.test(x)) rows.For.push(body);
    else if (/^(against|disadvantages?|costs?|limitations?|limits|weakness|problems?|failures?|losers|negative|challenges?|not necessarily|limited success|concerns?)/i.test(x)) rows.Against.push(body);
    else if (/^(evaluation|evaluate|overall|judgement|it depends)/i.test(x)) rows.Evaluate.push(body);
    else if (/^(example|evidence|e\.g\.|compare|real-world)/i.test(x) || /, e\.g\. /.test(x)) rows.Examples.push(x);
    else (rows.For.length && !rows.Against.length ? rows.For : rows.Examples).push(x);
  });
  if (!rows.For.length || !rows.Against.length) return null;
  if (!rows.Intro.length) rows.Intro.push("Define the key terms in the question and state your line of argument (e.g. 'largely true, but it depends on scale and time').");
  const out = Object.entries(rows).filter(([, v]) => v.length).map(([k, v]) => [k, v.join(" ")]);
  out.push(["Conclusion", "Answer the question directly with a clear judgement ('largely', 'partly', 'only in the short term'), say what it depends on, and add no new examples."]);
  return out;
};
IB.essayPlansHtml = function (t) {
  const plans = (t.questions || []).filter((q) => q.type === "extended" && !q.derived).map((q) => [q, IB.essayPlan(q)]).filter((x) => x[1]).slice(0, 4);
  if (!plans.length) return "";
  return plans.map(([q, rows], i) => `<div class="plan"><h4 class="plan-q">${"ABCDEFG"[i]}. ${q.q.replace(/\s*\[\d+\]\s*$/, "")} <span class="marks">[${q.marks}]</span></h4><table class="plan-table"><thead><tr><th>Section</th><th>Plan</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("")}</tbody></table></div>`).join("");
};
