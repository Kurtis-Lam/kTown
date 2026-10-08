# IB Revision Hub

A free revision website for the IB Diploma. It covers **Economics, Chemistry, Physics, Geography, Mathematics: Analysis & Approaches and Biology at SL and HL**, plus **English B HL** and **中文A 語言與文學 SL**.

## What's inside

| Section | What it does |
|---|---|
| **Notes** (`notes.html`) | Every syllabus topic, with an **SL / HL switch** per subject; AHL topics are marked. Each topic has formulas, key concepts, a **廣東話重點** summary and Cantonese explanations, diagrams, fastest methods, traps, worked examples, exam tips, key definitions, and a **答題框架** (answer frameworks: exam skills for each question type). Any topic or whole subject downloads as a designed PDF booklet. |
| **Questions** (`questionbank.html`) | 4,600+ original exam-style questions with IB-style markschemes, plus unlimited generated calculations. Filter by subject, topic, paper (including HL Paper 3), type, difficulty and status. Export any filtered set as an **IB-style PDF paper**: a cover with instructions, numbered questions with marks, lined answer boxes and the markscheme at the end. |
| **Marking** | Written answers are marked instantly and strictly against the markscheme by the built-in marker. It accepts synonyms and equivalent wording (OWTTE), checks direction ("price rises" ≠ "price falls"), detects negations and common wrong answers, gives method marks and checks units in calculations, and applies level descriptors and an essay checklist to extended responses. No AI or API key is needed. |
| **Quizzes & mocks** (`practice.html`) | Unit quizzes, smart weak-topic quizzes, timed mock papers in the real structure (HL papers when HL is on) and calculation drills. Any of these exports as an IB-style PDF. |
| **Mistakes notebook** (`mistakes.html`) | Every question where marks were lost is saved with your answer and the points you missed. Retry them one by one or as a quiz. Full marks moves a question to "Fixed". You can also export it as an IB-style PDF. |
| **Exam skills** (`skills.html`) | A framework for every question type in every subject, a markscheme decoder and practice with feedback. |
| **IA & EE** (`ia.html`) | Criteria explained, self-assessment with predicted marks and grade, a research-question checker and the TOK/EE points matrix. |
| **Past papers** (`mypapers.html`) | Import your own copies of official papers and markschemes (kept private). They join the bank, quizzes and marking. |
| **Game & friends** | XP, levels, daily streaks, three daily quests and badges. **Friends** (`friends.html`): add classmates by code or invite link and compete in a private weekly league. Friends see level, XP, streak, badges and subject progress only; answers, essays, mistakes and past papers are never shared. |
| **Accounts** | Sign in with Google (Firebase) to save progress online and use it on any device. Guest mode works without an account; guest progress is merged into the account on first sign-in. |
| **Progress** (`progress.html`) | Level and badges, mastery per topic, estimated grades, activity heatmap, quiz/mock history, and backup export/import. |

All notes and questions are **original IB-style material**. They are not official IB past-paper questions, and this site is not affiliated with or endorsed by the International Baccalaureate Organization.

## Run it on your computer

Requires Node.js 18+.

```bash
npm install
npm start          # http://localhost:3000
npm run check      # validates every question, generator and the marker
```

## Put it online with Google sign-in

See **[SETUP.md](SETUP.md)**. In short: create a free Firebase project, turn on Google sign-in and Firestore, paste the web config into `public/js/firebase-config.js`, then run `firebase deploy`. Without that config the site still works fully, in guest mode.

## How the files fit together

```
public/
  *.html                   pages (notes, questionbank, practice, mistakes, skills, ia, mypapers, friends, progress)
  css/style.css            design system (light + dark)
  js/app.js                core: subjects, SL/HL levels, storage, question cards, notes sections
  js/marker.js             built-in markscheme marker
  js/data/markdb.js        marking database: synonyms (OWTTE), opposite pairs, wrong answers, essay checklist
  js/game.js               XP, levels, streaks, daily quests, badges
  js/cloud.js              Google sign-in, cloud sync and friends (Firebase)
  js/firebase-config.js    your Firebase web config (null = guest mode)
  js/pdfnotes.js           PDF notes booklets and IB-style PDF papers
  js/data/<subject>.js     notes and questions; *-hl.js = AHL topics; *-bank.js = extra questions
  js/data/frameworks.js    答題框架 / answer frameworks; yue.js = 廣東話重點 summaries
firestore.rules            security rules (private progress; friends-only profiles)
firebase.json              Firebase Hosting + Firestore config
scripts/check-data.js      data and marker checks (npm run check)
scripts/build-hosted.mjs   single-page build for the claude.ai preview
```

## Adding content

Topics are registered with `IB.register({...})`. AHL topics are added with `IB.addTopics(subject, [...])`, and extra questions with `IB.addQuestions(subject, { topicId: [...] })`. A question looks like this:

```js
{ type: "short", paper: "P2", marks: 2, diff: 2,
  numeric: { value: 1.5, tol: 0.02 },            // optional: exact auto-marking + method marks
  q: "Calculate the PED …",
  ms: ["%ΔQd = …, %ΔP = … [M1]", "PED = 1.5 [A1]"] }
```

Use `type: "mcq"` with four `options` and an `answer` index, or `type: "extended"` with level bands in the markscheme (`"Evaluation … [3-4]"`). Mark HL-only content with `hl: true` (topics, concepts or questions). To teach the marker a new equivalent phrase, add it to the right group in `js/data/markdb.js`. Run `npm run check` after editing.

## Accuracy

Syllabus structures follow the current guides: Economics (2022), Chemistry, Physics and Biology (2025), Maths AA (2021), Geography (2019 guide, first assessment 2026 changes noted where relevant). Grade boundaries vary by session, so grade estimates are a guide only. Always check against the current subject guide and your teacher.
