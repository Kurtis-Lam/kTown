// Builds the claude.ai-hosted copy of the site: one page (index.html) plus js/router.js, so every screen
// keeps the page's AI and download connection.  Usage: node scripts/build-hosted.mjs <outDir>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "public", "krevisionnotes");
const out = path.resolve(process.argv[2] || "dist-hosted");
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(root, out, { recursive: true });

// Only the single-page shell is published; drop the per-page HTML files, licences and source maps.
for (const f of fs.readdirSync(out)) if (f.endsWith(".html")) fs.rmSync(path.join(out, f));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p);
  else if (/^LICENSE|\.map$/.test(e.name)) fs.rmSync(p);
});
walk(out);

// Head of notes.html has the full shared script list; reuse it, then add the libraries other screens need.
const notes = fs.readFileSync(path.join(root, "notes.html"), "utf8");
const head = notes.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*|<title>[\s\S]*?<\/title>\s*/g, "")
  .replace(/<script src="js\/notes\.js"><\/script>\s*/, "")
  .replace('<script src="js/app.js"></script>', '<script>window.IB_HOSTED = true;</script>\n<script src="vendor/pdfjs/pdf.min.js"></script>\n<script src="js/app.js"></script>')
  .replace('<script src="js/pdfnotes.js"></script>', '<script src="js/pdfnotes.js"></script>\n<script src="js/data/ia.js"></script>\n<script src="js/router.js"></script>');
fs.writeFileSync(path.join(out, "index.html"), `<title>IB Revision Hub</title>\n${head.trim()}\n<main class="container" id="app"></main>\n`);

const files = {};
const list = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) list(p);
  else if (p !== path.join(out, "index.html")) files[path.relative(out, p)] = path.relative(out, p);
});
list(out);
fs.writeFileSync(path.join(out, "..", path.basename(out) + "-files.json"), JSON.stringify(files));
console.log(`Built ${out}: index.html + ${Object.keys(files).length} files`);
