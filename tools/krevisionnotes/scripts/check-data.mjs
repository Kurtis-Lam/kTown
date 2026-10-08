// Validates all subject data and question generators.  Run: npm run check
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "public", "krevisionnotes", "js");
const ctx = { console, Math, Date, JSON, Number, String, Array, Object, Set, isFinite, parseFloat, parseInt, URLSearchParams };
ctx.window = ctx;
ctx.document = { addEventListener() {}, documentElement: { dataset: {} } };
ctx.localStorage = { getItem: () => null, setItem() {} };
vm.createContext(ctx);
for (const f of ["app.js", "data/econ.js", "data/chem.js", "data/geo.js", "data/math.js", "data/bio.js", "data/engb.js", "data/chia.js", "data/econ-plus.js", "data/chem-plus.js", "data/geo-plus.js", "data/math-plus.js", "data/bio-plus.js", "data/engb-plus.js", "data/chia-plus.js", "data/econ-bank.js", "data/chem-bank.js", "data/geo-bank.js", "data/math-bank.js", "data/bio-bank.js", "data/engb-bank.js", "data/chia-bank.js", "data/phys.js", "data/phys2.js", "data/phys-bank.js", "data/econ-hl.js", "data/chem-hl.js", "data/math-hl.js", "data/bio-hl.js", "data/geo-hl.js", "data/hl-bank.js", "data/frameworks.js", "data/yue.js", "data/markdb.js", "marker.js", "game.js", "generators.js", "bankbuild.js", "plot.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
}
const IB = ctx.IB;
const errors = [];
const ids = new Set();
let total = 0;

for (const s of IB.subjectList()) {
  for (const t of s.allTopics) {
    if (!t.concepts?.length) errors.push(`${t.id}: no concepts`);
    for (const q of t.questions) {
      total++;
      if (ids.has(q.id)) errors.push(`duplicate id ${q.id}`);
      ids.add(q.id);
      if (!(q.marks > 0)) errors.push(`${q.id}: bad marks`);
      if (!q.ms?.length) errors.push(`${q.id}: empty markscheme`);
      if (q.type === "mcq" && (!Array.isArray(q.options) || q.options.length !== 4 || !(q.answer >= 0 && q.answer < 4)))
        errors.push(`${q.id}: bad mcq options/answer`);
      if (q.type === "mcq" && new Set(q.options.map((o) => String(o).trim())).size !== q.options.length) errors.push(`${q.id}: duplicate mcq options`);
      if (q.numeric && !IB.checkNumeric(q, String(q.numeric.value))) errors.push(`${q.id}: numeric self-check failed`);
      if (q.numeric && !IB.checkNumeric(q, q.ms.join(" ")))
        errors.push(`${q.id}: numeric answer ${q.numeric.value} not found in markscheme`);
    }
  }
}

// every topic should now have the exam-focused extras, and every diagram must render
for (const s of IB.subjectList()) {
  if (!s.gameplan) errors.push(`${s.id}: no game plan`);
  for (const t of s.allTopics) {
    if (!t.traps?.length) errors.push(`${t.id}: no traps`);
    if (!(t.methods?.length || t.skills?.length)) errors.push(`${t.id}: no methods`);
    if (!t.tips?.length) errors.push(`${t.id}: no exam tips`);
    for (const d of t.diagrams || []) {
      const svg = IB.plot(d);
      if (/NaN|undefined/.test(svg)) errors.push(`${t.id}: diagram "${d.title}" has NaN/undefined`);
    }
  }
}

let gens = 0;
for (const tid of IB.generatorTopics()) {
  if (!IB.topic(tid)) errors.push(`generator for unknown topic ${tid}`);
  for (let i = 0; i < 300; i++) {
    const q = IB.generate(tid);
    gens++;
    if (!q.numeric || !isFinite(q.numeric.value)) { errors.push(`${tid}: non-finite answer in "${q.q.slice(0, 60)}"`); break; }
    if (/NaN|undefined|Infinity/.test(q.q + q.ms.join(""))) { errors.push(`${tid}: NaN/undefined in text "${q.q.slice(0, 80)}"`); break; }
    if (!IB.checkNumeric(q, String(q.numeric.value))) { errors.push(`${tid}: self-check failed (${q.numeric.value})`); break; }
    const m = IB.asMcq(q);
    if (!(m.answer >= 0) || new Set(m.options).size !== m.options.length) { errors.push(`${tid}: bad MCQ conversion ${JSON.stringify(m.options)}`); break; }
  }
}

// the built-in marker: markscheme-quality answers must score high, irrelevant answers ~0, reversed directions must lose marks
{
  const junk = "I really like football and pizza. My favourite holiday was in Spain where the weather was nice and sunny.";
  const pad = " As the diagram shows, this happens because of that, which means the outcome changes. For example, in 2022 in France the figure rose by 6%. However, in the long run this depends on stakeholders. In conclusion, on balance the argument holds to a large extent. ";
  const agg = {};
  for (const s of IB.subjectList()) for (const t of s.allTopics) for (const q of t.questions) {
    if (q.type === "mcq") continue;
    const model = q.numeric ? q.ms.join(" ") : q.ms.map((p) => p.replace(/\[[^\]]*\]/g, "")).join(". ");
    const ext = q.type === "extended";
    const a = agg[s.id] = agg[s.id] || { n: 0, good: 0, junk: 0 };
    const r = IB.offlineMark(q, ext ? (model + pad).repeat(4) : model);
    const j = IB.offlineMark(q, ext ? (junk + pad).repeat(4) : junk);
    a.n++; a.good += r.score / r.max; a.junk += j.score / j.max;
  }
  for (const [sid, a] of Object.entries(agg)) {
    if (a.good / a.n < 0.9) errors.push(`marker: ${sid} model answers average only ${(a.good / a.n).toFixed(2)}`);
    if (a.junk / a.n > 0.1) errors.push(`marker: ${sid} irrelevant answers average ${(a.junk / a.n).toFixed(2)}`);
  }
  const q = { id: "t", subject: "econ", topic: "econ-2", marks: 2, ms: ["Goods consumed together [1]", "A rise in the price of one leads to a fall in demand for the other [1]"] };
  if (IB.offlineMark(q, "Goods used together, so a fall in the price of one leads to a fall in demand for the other").score !== 1) errors.push("marker: reversed direction was not penalised");
  if (IB.offlineMark(q, "They are consumed together; when the price of one rises, demand for the other falls.").score !== 2) errors.push("marker: equivalent wording (OWTTE) was not accepted");
}

console.log(`${IB.subjectList().length} subjects, ${IB.subjectList().reduce((n, s) => n + s.allTopics.length, 0)} topics, ${total} bank questions, ${IB.generatorTopics().length} generator topics (${gens} samples checked)`);
for (const s of IB.subjectList()) console.log(`  ${s.name}: ${s.allTopics.length} topics, ${IB.allQuestions(s.id).length} questions`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n - ` + errors.join("\n - "));
  process.exit(1);
}
console.log("All checks passed.");
