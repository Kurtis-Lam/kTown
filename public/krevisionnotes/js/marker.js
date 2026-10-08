/* Built-in markscheme marker. Marks written answers strictly against each question's markscheme, with no AI:
   - each markscheme point is matched on its key terms, accepting synonyms from the marking database (OWTTE)
     and alternatives written as "A / B" or "e.g. A, B";
   - negated statements ("does not increase") do not earn a point that says the opposite;
   - common wrong answers are flagged and cost a mark;
   - calculations: full marks for the right value, otherwise method (M) marks for correct working, and a unit check;
   - extended responses: band lines ("[3-4]") are marked against the level descriptors with an essay checklist. */
(function () {
  "use strict";
  const IB = window.IB;
  const DB = IB.markdb || { syn: {}, wrong: {}, essay: {} };

  const STOP = new Set(("the a an and or of to in on for with by is are be as at that this it its from which their there these those was were has have had will would can could may might into than then also such other each per using use used show shows give state award any one both eg ie owtte accept allow do does did if when what how why who whom they them he she we you your our his her not no").split(" "));
  // Words that only describe what the examiner wants ("Reason identified", "explained with example").
  const DESCRIPTOR = new Set("reason reasons way ways point points identified identify explained explain explanation developed develop development valid relevant correct correctly appropriate named name example examples real-world real world detailed detail clear clearly accurate accurately award mark marks candidate answer answers response responses given give mention mentioned reference referred statement statements link linked linking effect effects factor factors argument arguments understanding knowledge application use using shown show evidence supported support supports level levels band bands any two three first second third one 1 2 3 4 5 e.g. eg".split(" "));
  const NEG = new Set(["not", "no", "never", "cannot", "can't", "dont", "don't", "doesnt", "doesn't", "isnt", "isn't", "wont", "won't", "without", "neither", "nor", "didnt", "didn't", "arent", "aren't", "wasnt", "wasn't", "hardly"]);

  const stem = (w) => (w.length > 4 ? w.replace(/(ations?|ing|ed|es|s|ly)$/i, "") : w.replace(/s$/, ""));
  const plain = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\\\(|\\\)/g, " ");

  // ---------- synonym index ----------
  const index = {};
  function lex(sid) {
    if (index[sid]) return index[sid];
    const groups = (DB.syn.all || []).map((g, i) => ["§a" + i, g]).concat((DB.syn[sid] || []).map((g, i) => ["§s" + i, g]));
    const word = new Map(); // stem -> Set(group id)
    const phrases = []; // [regex, gid]
    groups.forEach(([gid, g]) => {
      g.forEach((entry) => {
        const e = entry.toLowerCase().trim();
        if (/\s|-/.test(e) && e.split(/[\s-]+/).length > 1) phrases.push([new RegExp("(^|[^a-z0-9])" + e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s-]+/g, "[\\s-]+") + "(?=$|[^a-z0-9])", "g"), gid, e.length]);
        else if (e.length >= 2) {
          const k = stem(e);
          if (!word.has(k)) word.set(k, new Set());
          word.get(k).add(gid);
        }
      });
    });
    phrases.sort((a, b) => b[2] - a[2]);
    // polar pairs -> group ids
    const gidOf = (w) => { const g = groups.find(([, list]) => list[0] === w); return g && g[0]; };
    const opposite = new Map();
    (DB.syn.polar || []).forEach(([a, b]) => { const ga = gidOf(a), gb = gidOf(b); if (ga && gb) { opposite.set(ga, gb); opposite.set(gb, ga); } });
    return (index[sid] = { word, phrases, opposite });
  }

  // Tokenise text into [{w, keys:Set, neg}] using the subject lexicon.
  function tokens(text, sid) {
    const L = lex(sid);
    let t = " " + plain(text).toLowerCase().replace(/[−–]/g, "-").replace(/[’']/g, "'") + " ";
    const found = [];
    L.phrases.forEach(([re, gid]) => { t = t.replace(re, (m, pre) => { found.push(gid); return `${pre} ${gid} `; }); });
    const raw = t.replace(/[^a-z0-9§.%'\- ]/g, " ").split(/\s+/).filter(Boolean);
    const out = [];
    raw.forEach((w) => {
      w = w.replace(/^[.'-]+|[.'-]+$/g, "");
      if (!w) return;
      if (w[0] === "§") return out.push({ w, keys: new Set([w]), phrase: true });
      if (NEG.has(w)) return out.push({ w, neg: true, keys: new Set() });
      if (/^-?\d/.test(w)) { const n = parseFloat(w); if (isFinite(n)) out.push({ w, num: n, keys: new Set(["#" + n]) }); return; }
      if (w.length < 3 && !L.word.has(w)) return;
      if (STOP.has(w)) return;
      const s = stem(w);
      const keys = new Set([s]);
      (L.word.get(s) || L.word.get(w) || []).forEach((g) => keys.add(g));
      out.push({ w, s, keys });
    });
    return out;
  }
  const cjk = (s) => (plain(s).match(/[\u3400-\u9fff]+/g) || []).flatMap((run) => (run.length < 2 ? [] : Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2))));

  // Does token k (from a markscheme point) appear in the answer, not negated?
  function hit(k, ans, pointNeg) {
    for (let i = 0; i < ans.length; i++) {
      const a = ans[i];
      if (a.neg) continue;
      let ok = false;
      if (k.num !== undefined) ok = a.num !== undefined && Math.abs(a.num - k.num) <= Math.max(Math.abs(k.num) * 0.01, 1e-9);
      else for (const x of k.keys) if (a.keys.has(x)) { ok = true; break; }
      if (!ok) continue;
      const negated = ans.slice(Math.max(0, i - 4), i).some((b) => b.neg);
      if (negated === !!(k.negCtx || pointNeg === "all")) return true;
    }
    return false;
  }

  // For each direction word in the point, find the thing it describes (nearest content word) and check that
  // the answer uses the same direction (not the opposite) close to that thing.
  function polarClash(toks, ans, sid) {
    const { opposite } = lex(sid);
    const pol = (k) => [...k.keys].find((x) => opposite.has(x));
    for (let i = 0; i < toks.length; i++) {
      const g = pol(toks[i]);
      if (!g) continue;
      let j = -1;
      for (let d = 1; d <= 3 && j < 0; d++) for (const c of [i + d, i - d]) if (c >= 0 && c < toks.length && !toks[c].neg && !pol(toks[c]) && toks[c].s && !DESCRIPTOR.has(toks[c].w)) { j = c; break; }
      if (j < 0) continue;
      const target = toks[j], bad = opposite.get(g);
      let same = false, opp = false;
      ans.forEach((a, ai) => {
        if (![...target.keys].some((x) => a.keys.has(x))) return;
        // the direction word closest to this mention decides (ties: the one before it)
        for (let d = 1; d <= 4; d++) {
          const near = [ans[ai - d], ans[ai + d]].filter(Boolean);
          const s1 = near.some((b) => b.keys.has(g)), o1 = near.some((b) => b.keys.has(bad));
          if (s1 && !o1) { same = true; break; }
          if (o1 && !s1) { opp = true; break; }
          if (s1 && o1) { same = true; break; } // "price rises, demand falls": both readings possible
        }
      });
      if (opp && !same) return `direction: "${toks[i].w} … ${target.w}"`;
    }
    return null;
  }

  // Everyday words that appear in many definitions; never essential on their own.
  const WEAK = new Set("good goods product products item items thing things person people way ways process type types kind form forms part parts some many much".split(" ").map((w) => stem(w)));
  const isKey = (k, sid, terms) => !(k.s && WEAK.has(k.s)) && (k.num !== undefined || [...k.keys].some((x) => x.startsWith("§s")) || terms.has(k.s) || !!(k.s && k.s.length >= 8));

  // Split a markscheme point into the alternatives that each earn it.
  function alternatives(p) {
    let txt = plain(p).replace(/\[[^\]]*\]/g, " ").replace(/\((?:owtte|accept[^)]*|or similar)\)/gi, " ").trim();
    const eg = txt.split(/\b(?:e\.g\.?|eg\.?|for example|such as)\s*/i);
    let head = eg[0], examples = [];
    if (eg.length > 1) examples = eg.slice(1).join(" ").split(/\s\/\s|,\s|;\s|\sor\s/i).map((x) => x.trim()).filter(Boolean);
    const heads = head.split(/\s\/\s|\sOR\s/).map((x) => x.trim()).filter(Boolean);
    return { heads, examples };
  }
  const content = (toks) => toks.filter((k) => k.num !== undefined || k.phrase || (k.s && !DESCRIPTOR.has(k.w) && !DESCRIPTOR.has(k.s)));

  function matchText(text, ans, sid, terms) {
    const toks = tokens(text, sid);
    toks.forEach((k, i) => (k.negCtx = toks.slice(Math.max(0, i - 4), i).some((b) => b.neg)));
    const pointNeg = false;
    const kw = content(toks.filter((k) => !k.neg));
    // dedupe by first key
    const seen = new Set();
    const uniq = kw.filter((k) => { const id = [...k.keys].sort().join("|"); if (seen.has(id)) return false; seen.add(id); return true; });
    if (!uniq.length) return null; // nothing checkable: a generic descriptor
    const keys = uniq.filter((k) => isKey(k, sid, terms));
    const got = uniq.filter((k) => hit(k, ans, pointNeg));
    const gotKeys = keys.filter((k) => got.includes(k));
    const need = keys.length <= 2 ? keys.length : Math.ceil(keys.length * 0.67);
    const frac = got.length / uniq.length;
    let ok = keys.length ? gotKeys.length >= need && frac >= 0.4 : frac >= 0.5;
    // Direction words must agree: "price rises" is not earned by "price falls".
    const wrongWay = ok ? polarClash(toks, ans, sid) : null;
    if (wrongWay) ok = false;
    return { ok, frac, wrongWay, missing: wrongWay ? [wrongWay] : keys.filter((k) => !got.includes(k)).map((k) => k.w) };
  }

  const EXAMPLE = /\b(e\.g|for example|for instance|such as|example)\b|\b(19|20)\d{2}\b|\b[A-Z][a-z]{2,}\b(?<!^\w+)|\d/;
  const LINK = /\b(because|therefore|so|thus|hence|leads? to|results? in|which means|causing|as a result|since|due to)\b/i;

  function markPoints(q, answer, sid, terms) {
    const ans = tokens(answer, sid);
    const awarded = [], missing = [], hints = [];
    let prevOk = false;
    (q.ms || []).forEach((p) => {
      const pt = plain(p).trim();
      if (!pt || /^(note|examiners?|do not|accept|award|n\.?b\.?)\b/i.test(pt)) return;
      const { heads, examples } = alternatives(pt);
      let res = null, generic = true;
      for (const h of heads.concat(examples)) {
        const r = matchText(h, ans, sid, terms);
        if (r === null) continue;
        generic = false;
        if (r.ok) { res = r; break; }
        if (!res || r.frac > res.frac) res = r;
      }
      let ok;
      // A descriptor-only point ("…explained with an example") needs the point before it plus what it describes.
      if (generic) ok = prevOk && (/example/i.test(pt) ? EXAMPLE.test(plain(answer)) : /explain|develop|analys|link/i.test(pt) ? LINK.test(answer) : true);
      else ok = !!(res && res.ok);
      if (ok) awarded.push(p);
      else {
        missing.push(p);
        if (res && res.wrongWay) hints.push(`Wrong direction - the markscheme needs ${res.wrongWay.replace(/^direction: /, "")}`);
        else if (res && res.missing && res.missing.length) hints.push(`Missing key term${res.missing.length > 1 ? "s" : ""}: ${res.missing.slice(0, 4).join(", ")}`);
      }
      prevOk = ok;
    });
    return { awarded, missing, hints };
  }

  function wrongAnswers(sid, answer, q) {
    const a = plain(answer).toLowerCase();
    const ms = plain((q.ms || []).join(" ")).toLowerCase();
    return ((DB.wrong || {})[sid] || []).filter(([re]) => re.test(a) && !re.test(ms)).map(([, msg]) => msg);
  }

  // ---------- calculations ----------
  const nums = (s) => (plain(s).replace(/[−–]/g, "-").replace(/(\d)[, ](?=\d{3}\b)/g, "$1").replace(/(\d(?:\.\d+)?)\s*[×x]\s*10\^?([⁻-]?[\d⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (m, a, e) => `${a}e${e.replace(/⁻/g, "-").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c))}`).match(/-?\d*\.?\d+(e-?\d+)?/gi) || []).map(Number).filter(isFinite);
  const near = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(b) * 0.01, 1e-9);

  function unitOf(q) {
    if (q.numeric.unit) return q.numeric.unit;
    const v = q.numeric.value;
    for (const line of (q.ms || []).slice().reverse()) {
      const txt = plain(line).replace(/\[[^\]]*\]/g, " ").replace(/\([^)]*\)/g, " ");
      const m = txt.match(/(-?\d[\d.,]*(?:\s*[×x]\s*10\S+)?)\s*([a-zA-Zμ°Ω%$£€][^\d\[\]()]{0,14})/);
      if (m && near(nums(m[1])[0], v)) {
        const u = m[2].trim().replace(/[.,;]+$/, "");
        if (/^(to|and|or|is|so|the|of|because|which|ratio)\b/i.test(u)) return "";
        return u;
      }
    }
    return "";
  }

  function markNumeric(q, answer, sid) {
    const max = q.marks || 1;
    const right = IB.checkNumeric(q, answer);
    const unit = unitOf(q);
    const science = sid === "phys" || sid === "chem";
    const UW = { s: "second", m: "met", kg: "kilogram", g: "gram", j: "joule", kj: "kilojoule", n: "newton", w: "watt", v: "volt", a: "amp", hz: "hertz", k: "kelvin", pa: "pascal", kpa: "kilopascal", c: "coulomb", "ω": "ohm", mol: "mole", t: "tesla", ev: "electronvolt", h: "hour", min: "minute" };
    const u0 = unit.split(/\s+/)[0].toLowerCase();
    const unitOk = !unit || (UW[u0] && new RegExp(UW[u0], "i").test(plain(answer))) || /^[%$£€]/.test(unit) || new RegExp("(^|[^a-zA-Z])" + unit.split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/⁻/g, "[-⁻]?") + "(?![a-zA-Z])").test(plain(answer).replace(/\d(?=[a-zA-Zμ°Ω])/g, "$& "));
    if (right) {
      const lose = science && unit && !unitOk && max >= 2 ? 1 : 0;
      return {
        score: max - lose, max, awarded: lose ? q.ms.slice(0, -1) : q.ms.slice(), missing: lose ? q.ms.slice(-1) : [],
        summary: lose ? `Correct value, but the unit (${unit}) is missing - the final answer mark needs it.` : "Correct final answer.",
        checklist: unit ? [[`Unit given (${unit})`, unitOk]] : [],
      };
    }
    // method marks: an M line is credited when the numbers it substitutes appear in the working
    const given = nums(answer);
    const awarded = [], missing = [];
    let m = 0;
    (q.ms || []).forEach((line, i) => {
      const isA = /\[A\d?\]|\[A1\]/.test(line) || (i === q.ms.length - 1 && !/\[M/.test(line));
      if (isA) return missing.push(line);
      const want = nums(plain(line).replace(/\[[^\]]*\]/g, "")).filter((n) => !Number.isInteger(n) || Math.abs(n) > 1 || n === 0);
      const okLine = want.length ? want.filter((n) => given.some((g) => near(g, n))).length / want.length >= 0.6 : false;
      if (okLine && m < max - 1) { m++; awarded.push(line); } else missing.push(line);
    });
    return {
      score: m, max, awarded, missing,
      summary: `Final answer not matched (expected ≈ ${q.numeric.value}${unit ? " " + unit : ""}).${m ? ` ${m} method mark${m > 1 ? "s" : ""} for correct working.` : " Show your formula and substitution to earn method marks."}`,
      checklist: [["Final value correct", false], ["Working shown (formula + substitution)", m > 0]].concat(unit ? [[`Unit given (${unit})`, unitOk]] : []),
    };
  }

  // ---------- extended responses ----------
  const BAND = /\[(\d+)\s*[-–]\s*(\d+)\]/;
  const FEATURE_OF = [[/diagram/i, "diagram"], [/example|case stud|real-world|data|named/i, "example"], [/evaluat|balanced|counter|limitation|strengths? and/i, "evaluation"], [/judgement|conclusion|supported/i, "judgement"], [/defin/i, "definition"], [/mechanism|explain|analys|chain|links?/i, "analysis"]];

  function markExtended(q, answer, sid, terms) {
    const max = q.marks || 1;
    const ans = tokens(answer, sid);
    const text = plain(answer);
    const nWords = text.split(/\s+/).filter(Boolean).length + (text.match(/[\u3400-\u9fff]/g) || []).length / 2;
    const feats = {};
    Object.entries(DB.essay || {}).forEach(([k, f]) => (feats[k] = f.re.test(text)));
    let total = 0;
    const awarded = [], missing = [];
    const bands = (q.ms || []).filter((p) => BAND.test(p));
    const plainPts = (q.ms || []).filter((p) => !BAND.test(p));
    bands.forEach((p) => {
      const [, lo, hi] = p.match(BAND).map(Number);
      const desc = plain(p).replace(BAND, "");
      const r = matchText(desc, ans, sid, terms);
      const feat = (FEATURE_OF.find(([re]) => re.test(desc)) || [])[1];
      let frac = r ? r.frac : 0;
      if (feat && feats[feat]) frac = Math.max(frac, 0.5);
      if (feat && !feats[feat]) frac = Math.min(frac, 0.2);
      const got = frac >= 0.6 ? hi : frac >= 0.3 ? lo + Math.round((hi - lo) * ((frac - 0.3) / 0.3)) : frac >= 0.15 ? Math.max(0, lo - 1) : 0;
      total += got;
      (got >= lo ? awarded : missing).push(`${p} → ${got}`);
    });
    if (plainPts.length) {
      const pr = markPoints({ ms: plainPts }, answer, sid, terms);
      const per = bands.length ? 1 : max / plainPts.length;
      total += pr.awarded.length * per;
      awarded.push(...pr.awarded);
      missing.push(...pr.missing);
    }
    total = Math.round(total);
    // length caps: an extended answer needs room for analysis and evaluation
    const need = max >= 15 ? 450 : max >= 10 ? 300 : 180;
    let capNote = "";
    if (nWords < need * 0.25) { total = Math.min(total, Math.round(max * 0.25)); capNote = ` Very short for ${max} marks (about ${need}+ words expected).`; }
    else if (nWords < need * 0.5) { total = Math.min(total, Math.round(max * 0.5)); capNote = ` Short for ${max} marks (about ${need}+ words expected).`; }
    const checklist = Object.entries(DB.essay || {}).map(([k, f]) => [f.label, feats[k]]);
    const level = total >= max * 0.8 ? "Top level" : total >= max * 0.6 ? "Upper-middle level" : total >= max * 0.4 ? "Middle level" : total > 0 ? "Lower level" : "No creditworthy material";
    return { score: Math.min(max, total), max, awarded, missing, checklist, level, summary: `Best-fit ${level.toLowerCase()} against the level descriptors.${capNote}` };
  }

  // ---------- main ----------
  IB.offlineMark = function (q, answer) {
    const max = q.marks || 1;
    const sid = q.subject || (q.topic || "").split("-")[0];
    if (!String(answer || "").trim()) return { score: 0, max, awarded: [], missing: (q.ms || []).slice(), summary: "No answer given.", offline: true };
    const t = IB.topic && IB.topic(q.topic);
    const terms = new Set(((t && t.terms) || []).flatMap(([k]) => tokens(k, sid).map((x) => x.s).filter(Boolean)));
    let fb;
    if (q.numeric) fb = markNumeric(q, answer, sid);
    else if (sid === "chia" || /[\u3400-\u9fff]{6,}/.test(plain(q.ms.join("")))) fb = markChinese(q, answer);
    else if (q.type === "extended" || (q.ms || []).some((p) => BAND.test(p))) fb = markExtended(q, answer, sid, terms);
    else {
      const r = markPoints(q, answer, sid, terms);
      const counted = r.awarded.length + r.missing.length || 1;
      let score = Math.min(max, Math.round((r.awarded.length / counted) * max));
      if (counted === max) score = Math.min(max, r.awarded.length);
      fb = { score, max, awarded: r.awarded, missing: r.missing, hints: r.hints, summary: r.awarded.length === counted ? "Every markscheme point found." : `${r.awarded.length} of ${counted} markscheme points found.` };
      const words = plain(answer).split(/\s+/).filter(Boolean).length;
      if (words < 4 && max > 1) { fb.score = Math.min(fb.score, 1); fb.summary += " Answer too brief for more than 1 mark."; }
    }
    const errs = wrongAnswers(sid, answer, q);
    if (errs.length && fb.score > 0) { fb.score = Math.max(0, fb.score - 1); }
    fb.errors = errs;
    fb.offline = true;
    fb.marker = "markscheme";
    return fb;
  };

  function markChinese(q, answer) {
    const max = q.marks || 1;
    const set = new Set(cjk(answer));
    const awarded = [], missing = [];
    (q.ms || []).forEach((p) => {
      const kw = Array.from(new Set(cjk(p)));
      if (!kw.length) return;
      const f = kw.filter((k) => set.has(k)).length / kw.length;
      (f >= 0.5 ? awarded : missing).push(p);
    });
    const n = awarded.length + missing.length || 1;
    let score = Math.round((awarded.length / n) * max);
    const len = (plain(answer).match(/[\u3400-\u9fff]/g) || []).length;
    if (q.type === "extended" && len < 200) score = Math.min(score, Math.round(max * 0.4));
    return { score, max, awarded, missing, summary: `${awarded.length} / ${n} 個評分要點命中。` };
  }

  IB.markTokens = tokens; // exposed for tests
})();
