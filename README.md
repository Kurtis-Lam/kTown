# kTown

A clear, free study space for IB courses, with topic notes, original practice questions, quizzes, mock papers, AI support and progress tracking.

## What's inside

| Section | Features |
|---|---|
| **kRevisionNotes** (`krevisionnotes.html`) | 95 syllabus topics with key concepts, exam skills, worked examples and practice questions. Download topic notes or print to PDF. |
| **2. Question bank** (`questionbank.html`) | 3,130 exam-style questions with IB-style markschemes (M/A marks, level descriptors). Filter by subject, topic, paper, type, difficulty and status (new / weak / saved). The bank can generate unlimited calculation questions, and AI can write new questions for any topic. Download any filtered set as a worksheet. |
| **My past papers** (`mypapers.html`) | For self-revision with your own copies of official papers: upload a past-paper PDF (or paste text) plus its markscheme. The site splits it into questions, suggests a topic for each, and adds them to the question bank, topic practice, quizzes and AI marking. You can sit an imported paper as a timed mock. Everything stays private in your browser and is included in progress backups. |
| **3. AI tutor, marking & tracking** | **AI tutor** (`tutor.html`): a guided chat that knows the subject and topic you're on. **AI marking**: write an answer, then get a mark, the credited and missing markscheme points, how to improve, and a model answer. **Quizzes & mocks** (`practice.html`): unit quizzes, a smart weak-topic quiz, timed mock papers in the real paper structure with a grade estimate, and endless calculation drills. **My Progress** (`progress.html`): mastery per topic, activity heatmap, estimated grades, saved questions, quiz/mock history, and export/import/CSV. |

### About past papers
The questions are **original IB-style questions**. They are modelled on the format, command terms and markscheme conventions of IB papers. Official IB past papers and markschemes are copyright of the International Baccalaureate Organization, so they are not reproduced here. Students should use this site alongside the official past papers from their school or the IB store.

## Firebase Hosting and sign-in

The site is configured for Firebase project `ktown-45`. Firebase Authentication supports email/password accounts, Google sign-in and password reset. Enable both sign-in providers in the Firebase console and add the deployed domain under **Authentication → Settings → Authorized domains**.

Deploy the static website with Firebase CLI:

```bash
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

The Firebase browser configuration is public by design. kTown does not upload revision activity to Firebase; progress remains in the current browser, as before.

Firebase Hosting serves the static app. AI features that call the local Node API are unavailable on Hosting unless an API backend is deployed; offline marking and the rest of the study tools continue to work.

## Running locally

Requires Node.js 18+.

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-...  npm start      # AI tutor + AI marking ON
# or
npm start                                     # works fully offline, AI features use the built-in fallback
```

Then open http://localhost:3000.

- **Without an API key** everything still works. Written answers get an offline estimate: key words are matched against the markscheme, and you can then self-mark. Calculation answers are auto-marked exactly. The tutor answers from the notes.
- **With an API key** the server calls Claude (`claude-opus-5-5` by default; override with `CLAUDE_MODEL`). It uses structured outputs for marking and question writing, and streaming for the tutor. The key stays on the server and is never sent to the browser.
- **Hosted on claude.ai** (the shared preview link): the AI tutor, AI marking and AI question writing run through the page's built-in "ask Claude" ability, on the viewer's own Claude account (each viewer is asked to allow it once). Downloads use the page's "save files" ability.
- The `public/` folder is a static site. It can also be hosted on GitHub Pages, Netlify and similar hosts; AI features fall back to offline mode unless you also deploy `server.js`.

Other environment variables: `PORT` (default 3000), and `AI_ENABLED=1` if you authenticate another way (for example `ant auth login`).

## Project layout

```
server.js               static server + /api/mark, /api/generate, /api/tutor (Claude)
public/
  index.html …          pages: home, kRevisionNotes, questionbank, practice, tutor, progress
  css/style.css         design system (light + dark)
  js/app.js             shared core: registry, storage, question component, marking, AI client
  js/generators.js      parametric question generators (unlimited auto-marked questions)
  js/data/*.js          subject content: notes, key terms, skills, examples, questions
  vendor/katex/         maths rendering (bundled, works offline)
scripts/check-data.js   validates every question and generator (npm run check)
```

## Adding content

Each subject file in `public/js/data/` calls `IB.register({...})` with a list of topics. To add a question, append it to a topic's `questions` array:

```js
{ type: "short", paper: "P2", marks: 2, diff: 2,
  numeric: { value: 1.5, tol: 0.02 },            // optional - enables exact auto-marking
  q: "Calculate the PED …",
  ms: ["%ΔQd = …, %ΔP = … [M1]", "PED = 1.5 [A1]"] }
```

Use `type: "mcq"` with `options` (4 strings) and `answer` (0-based index) for multiple choice, and `type: "extended"` for essays. Write maths with `\\( … \\)` (inline) or `$$ … $$` (display). Run `npm run check` after editing.

## Notes on accuracy
Syllabus structure follows the current guides: Economics (first assessment 2022), Chemistry (first assessment 2025), Maths AA (first assessment 2021), and Geography core themes plus popular options. Assessment details and grade boundaries change between sessions, so the grade estimates are a guide only. Check details against the current subject guide and your teacher.
