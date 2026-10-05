# kTown

A free IB study space for topic notes, original practice questions, quizzes, mock papers, AI support and progress tracking. The homepage is `public/ktown.html`; `public/index.html` forwards to it.

## What's inside

| Section | Features |
|---|---|
| **kRevisionNotes** (`krevisionnotes.html`) | Syllabus notes, key terms, worked examples, practice questions, downloadable PDFs and worksheets. |
| **Question bank** (`questionbank.html`) | 3,130 exam-style questions, filters, markschemes and downloadable worksheets. |
| **My past papers** (`mypapers.html`) | Import your own past-paper PDFs or text, add markschemes, then practice and track results. |
| **AI tutor, marking and progress** | Guided tutoring, answer feedback, generated practice, quizzes, mocks and mastery tracking. |
| **kAuraNotes / kCiteThisForMe** | Personal study-note workspace and APA citation tool, linked at the bottom of the kTown homepage. |

Questions are original IB-style materials; official IB past papers and markschemes are not reproduced. Always verify assessment details against the current subject guide and your teacher.

## Google sign-in and progress sync

The site uses Firebase project `ktown-45`. In the Firebase console:

1. Enable **Google** under **Authentication → Sign-in method**. Add your deployed hostname under **Authentication → Settings → Authorized domains**.
2. Enable **Cloud Firestore**.
3. Deploy the included per-user rules:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project ktown-45
```

Signed-in kRevisionNotes users sync their revision activity to `users/{uid}/apps/krevisionnotes`; signed-out progress remains in their browser. The Firestore rules limit each account to its own user documents. Firebase's browser configuration is public by design; never put a private API key in `public/`.

## Deploy the site and AI API to Vercel

1. Push this repository to GitHub. Sign in at [vercel.com](https://vercel.com), choose **Add New → Project**, then import `Kurtis-Lam/kTown`.
2. Keep the repository root as the project root and choose **Other** as the framework preset. `vercel.json` serves the static site from `public/`, routes `/` to `ktown.html`, and deploys the `api/` serverless functions.
3. Create an API key at [openrouter.ai/keys](https://openrouter.ai/keys). In Vercel, open **Project → Settings → Environment Variables** and add `OPENROUTER_API_KEY` with the key value. Select **Production** and, if you use them, **Preview** and **Development**. Do not put the key in JavaScript, commit it, or expose it with a `NEXT_PUBLIC_` name.
4. Optionally add `OPENROUTER_MODEL` (default: `openai/gpt-4o-mini`) to use another model available to your OpenRouter account. Save the variables and redeploy; environment variable changes apply to new deployments.
5. Open the generated `*.vercel.app` URL. Add that hostname to Firebase Authentication's authorized domains, then test Google sign-in and progress sync. To use your own domain, open **Project → Settings → Domains** in Vercel and follow its DNS instructions.

Vercel keeps the OpenRouter key server-side. The AI tutor, marking, question generation and kAuraNotes document assistant call server API routes; without the key, offline study features remain available.

## Run locally

Requires Node.js 18+.

```bash
npm install
OPENROUTER_API_KEY=your-key npm start
# Or start without AI:
npm start
```

Open http://localhost:3000. Optionally set `OPENROUTER_MODEL` and `PORT`. Do not commit local keys; `.env` is ignored by Git.

## Project layout

```text
server.js               local static server and OpenRouter API routes
api/*.js                Vercel serverless API entry points
lib/openrouter.js       shared OpenRouter request handlers
firestore.rules         per-user progress and app data access rules
public/ktown.html       kTown homepage
public/background.html  shared animated background for the study pages
public/css/style.css    shared dark design system
public/js/app.js        shared registry, progress, UI and AI client
public/js/data/*.js     subject content and practice questions
scripts/check-data.js   validates topic data and question generators
```

Run the data check with `npm run check`.
