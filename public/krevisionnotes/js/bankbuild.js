/* Builds a structured question bank for every topic from the notes, on top of the hand-written exam questions.
   Sections: exam-style (hand-written), key-term drills, explain-the-concept, spot-the-mistake, worked-example
   replays and fixed calculation sets (seeded so ids - and your progress - stay stable between visits). */
(function () {
  "use strict";
  const IB = window.IB;

  IB.SECTIONS = [
    ["exam", "Exam-style", "Hand-written questions in the style of the real papers"],
    ["calc", "Calculations", "Fixed calculation sets - plus endless fresh numbers from the generator"],
    ["worked", "Worked-example replays", "Answer the notes' worked examples yourself, then compare"],
    ["concepts", "Explain the concept", "Short explanations of every key concept"],
    ["terms", "Key-term drills", "Definitions and quick-fire term recognition"],
    ["traps", "Spot the mistake", "Find the error examiners see most often"],
  ];
  IB.sectionName = (k) => (IB.SECTIONS.find((s) => s[0] === k) || [k, k])[1];

  // Small deterministic PRNG so derived sets are identical on every visit.
  const seedOf = (str) => Array.from(str).reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0), 2166136261);
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuffle = (arr, r) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const strip = (h) => String(h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // Split prose into markscheme-sized points (keeps maths and HTML intact inside each sentence).
  const points = (html, max) => {
    const parts = String(html)
      .split(/(?<=[.!?])\s+(?=[A-Z(<])/)
      .map((s) => s.trim())
      .filter((s) => strip(s).length > 3);
    if (parts.length <= max) return parts;
    const out = parts.slice(0, max - 1);
    out.push(parts.slice(max - 1).join(" "));
    return out;
  };

  const T = {
    define: (sid, k) => `Define the term <strong>${k}</strong>.`,
    defMs: (sid) => "Accurate definition including the key idea",
    whichTerm: (sid, v) => `Which term matches this definition?<br><em>"${v}"</em>`,
    whichDef: (sid, k) => `Which statement best describes <strong>${k}</strong>?`,
    explain: (sid, h, m) => `Explain: ${h}. [${m}]`,
    trap: (sid) => "Which of these is a <strong>mistake</strong> examiners regularly penalise? (The other three are correct.)",
    trapMs: (sid, x) => `This is the common mistake: ${x}`,
  };

  function derive(s) {
    const allTerms = s.allTopics.flatMap((t) => (t.terms || []).map(([k, v]) => ({ k, v, topic: t.id })));
    s.allTopics.forEach((t) => {
      const r = rng(seedOf(t.id));
      const qs = (t.questions = t.questions || []);
      qs.forEach((q) => (q.sec = q.sec || (q.numeric ? "calc" : "exam")));
      const add = (q) => {
        Object.assign(q, { subject: s.id, topic: t.id, derived: true, diff: q.diff || 1 });
        q.type = q.type || "short";
        if (t.hl) q.hl = true;
        qs.push(q);
      };

      // key-term drills: define it, term-from-definition, definition-from-term
      (t.terms || []).forEach(([k, v], i) => {
        add({ id: `${t.id}-k${i + 1}d`, sec: "terms", marks: 2, q: T.define(s.id, k), ms: [v, T.defMs(s.id)] });
        const others = shuffle(allTerms.filter((x) => x.k !== k && x.v !== v), r);
        // prefer distractors from the same topic (harder), then the rest of the subject
        const near = others.filter((x) => x.topic === t.id).concat(others.filter((x) => x.topic !== t.id));
        const seenK = new Set([k.toLowerCase()]), seenV = new Set([v.toLowerCase()]);
        const d = near.filter((x) => {
          const a = x.k.toLowerCase(), b = x.v.toLowerCase();
          if (seenK.has(a) || seenV.has(b)) return false;
          seenK.add(a);
          seenV.add(b);
          return true;
        }).slice(0, 3);
        if (d.length === 3) {
          const o1 = shuffle([k].concat(d.map((x) => x.k)), r);
          add({ id: `${t.id}-k${i + 1}m`, sec: "terms", type: "mcq", marks: 1, q: T.whichTerm(s.id, v), options: o1, answer: o1.indexOf(k), ms: [`${k}: ${v}`] });
          const o2 = shuffle([v].concat(d.map((x) => x.v)), r);
          add({ id: `${t.id}-k${i + 1}r`, sec: "terms", type: "mcq", marks: 1, diff: 2, q: T.whichDef(s.id, k), options: o2, answer: o2.indexOf(v), ms: [`${k}: ${v}`] });
        }
      });

      // explain the concept (markscheme = the notes' own points)
      (t.concepts || []).forEach((c, i) => {
        if (!c.b || strip(c.b).length < 40 || /<table/i.test(c.b)) return;
        const ms = points(c.b, 4);
        const marks = Math.max(2, Math.min(4, ms.length));
        add({ id: `${t.id}-c${i + 1}`, sec: "concepts", marks, diff: 2, q: T.explain(s.id, c.h, marks), ms, hl: !!c.hl || !!t.hl });
      });

      // spot the mistake: one trap + three pieces of good practice from the same topic
      const good = (t.methods || []).concat(t.tips || []).map(strip).filter((x) => x.length > 15 && x.length < 260);
      const facts = (t.terms || []).map(([k, v]) => `${k}: ${v}`);
      (t.traps || []).forEach((x, i) => {
        const rr = rng(seedOf(t.id + "x" + i));
        const right = Array.from(new Set(shuffle(good, rr).concat(shuffle(facts, rr)))).filter((y) => y !== strip(x)).slice(0, 3);
        if (right.length < 3) return;
        const opts = shuffle([strip(x)].concat(right), r);
        add({ id: `${t.id}-x${i + 1}`, sec: "traps", type: "mcq", marks: 1, diff: 2, q: T.trap(s.id), options: opts, answer: opts.indexOf(strip(x)), ms: [T.trapMs(s.id, x)] });
      });

      // worked-example replays: the model answer becomes the markscheme
      (t.examples || []).forEach((e, i) => {
        const m = /\[(\d+)\]\s*$/.exec(strip(e.q));
        const marks = m ? +m[1] : 4;
        const ms = points(e.a, Math.max(2, Math.min(marks, 8)));
        add({ id: `${t.id}-w${i + 1}`, sec: "worked", type: marks >= 8 ? "extended" : "short", marks, diff: 2, q: e.q, ms });
      });

      // fixed calculation sets from the topic's generators (seeded, deduplicated)
      if (IB.hasGenerator && IB.hasGenerator(t.id)) {
        const real = Math.random, seen = new Set();
        Math.random = rng(seedOf(t.id + "calc"));
        try {
          for (let i = 0, n = 0; i < 40 && n < 15; i++) {
            const g = IB.generate(t.id);
            delete IB._generated[g.id];
            if (seen.has(g.q)) continue;
            seen.add(g.q);
            n++;
            g.id = `${t.id}-g${n}`;
            delete g.generated;
            add(Object.assign(g, { sec: "calc", diff: g.diff || 2 }));
          }
        } finally {
          Math.random = real;
        }
      }
    });
  }

  IB.subjectList().forEach(derive);

  // Section counts for a topic, in display order.
  IB.topicSections2 = (topicId) => {
    const qs = IB.topicQuestions(topicId);
    return IB.SECTIONS.map(([k, name, desc]) => ({ k, name, desc, qs: qs.filter((q) => (q.sec || "exam") === k) })).filter((x) => x.qs.length);
  };
})();
