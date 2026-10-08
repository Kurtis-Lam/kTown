# Contributing to kTown

Thanks for wanting to help improve kTown! Anyone can suggest changes by opening a pull request on GitHub:
**https://github.com/Kurtis-Lam/kTown**

## How to contribute

1. **Fork** the repository on GitHub.
2. **Clone** your fork and create a branch for your change:
   ```bash
   git clone https://github.com/Kurtis-Lam/kTown.git
   cd kTown
   git checkout -b my-change
   ```
3. **Make your changes** (see "Project layout" below).
4. **Test locally** (see "Running locally").
5. **Commit** with a short, clear message and **push** your branch:
   ```bash
   git add .
   git commit -m "Describe what you changed"
   git push origin my-change
   ```
6. Open a **pull request** against `main` at https://github.com/Kurtis-Lam/kTown/pulls and explain what you changed and why. Screenshots help for visual changes.

Found a bug or have an idea but don't want to code it? Open an issue instead.

## Project layout

| Path | What it is |
|---|---|
| `public/ktown/` | The kTown home page (launchpad, sign-in) |
| `public/krevisionnotes/` | kRevisionNotes: IB notes, question bank, quizzes, mistakes notebook |
| `public/kauranotes/` | kAuraNotes: notes workspace |
| `public/kcitethisforme/` | kCiteThisForMe: APA 7th citation generator |
| `public/credits/` | Credits page |
| `public/background.html` + `public/shell.js` | Shared animated background and footer, loaded on every page |
| `api/openrouter.js` | Serverless proxy for the OpenRouter AI API |
| `tools/krevisionnotes/` | Local server and data-checking scripts |

## Running locally

Requires Node.js 18+.

```bash
npm install
npm start        # serves kRevisionNotes at http://localhost:3000
npm run check    # validates question data and the marker
```

Any static file server also works for the front end, for example `npx serve public`.

AI features need an `OPENROUTER_API_KEY` environment variable. Never commit API keys or `.env` files.

## Guidelines

- Keep changes focused: one fix or feature per pull request.
- Match the existing code style and keep pages fast and light (no heavy dependencies for small things).
- Make sure text stays readable on the dark background (good contrast).
- Revision content must be **original** IB-style material. Do not paste copyrighted past papers, markschemes or textbook text.
- Be kind and respectful in issues and reviews.

By contributing you agree that your contribution can be used in this project.
