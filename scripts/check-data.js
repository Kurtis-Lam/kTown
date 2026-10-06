// Validates all subject data and question generators.  Run: npm run check
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "js");
const ctx = { console, Math, Date, JSON, Number, String, Array, Object, Set, isFinite, parseFloat, parseInt, URLSearchParams };
ctx.window = ctx;
ctx.document = { addEventListener() {}, documentElement: { dataset: {} } };
ctx.localStorage = { getItem: () => null, setItem() {} };
vm.createContext(ctx);
for (const f of ["app.js", "data/econ.js", "data/chem.js", "data/geo.js", "data/math.js", "data/bio.js", "data/engb.js", "data/chia.js", "data/econ-plus.js", "data/chem-plus.js", "data/geo-plus.js", "data/geo-hl.js", "data/physics.js", "data/tok.js", "data/math-plus.js", "data/bio-plus.js", "data/engb-plus.js", "data/chia-plus.js", "data/econ-bank.js", "data/chem-bank.js", "data/geo-bank.js", "data/math-bank.js", "data/bio-bank.js", "data/engb-bank.js", "data/chia-bank.js", "generators.js", "bankbuild.js", "plot.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
}
const IB = ctx.IB;
const errors = [];
const ids = new Set();
let total = 0;

for (const s of IB.subjectList()) {
  for (const t of s.topics) {
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
  for (const t of s.topics) {
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

console.log(`${IB.subjectList().length} subjects, ${IB.subjectList().reduce((n, s) => n + s.topics.length, 0)} topics, ${total} bank questions, ${IB.generatorTopics().length} generator topics (${gens} samples checked)`);
for (const s of IB.subjectList()) console.log(`  ${s.name}: ${s.topics.length} topics, ${IB.allQuestions(s.id).length} questions`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n - ` + errors.join("\n - "));
  process.exit(1);
}
console.log("All checks passed.");
