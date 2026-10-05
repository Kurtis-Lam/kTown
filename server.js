// IB Revision Hub - static file server + AI tutor / marking API.
//
// Run:  ANTHROPIC_API_KEY=sk-... npm start   (then open http://localhost:3000)
//
// Without an API key the site still works: the browser falls back to the
// built-in offline marker (markscheme matching) and the rules-based tutor.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, "public");
const PORT = Number(process.env.PORT) || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

// AI is on when credentials are configured (ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN),
// or when AI_ENABLED=1 is set for other credential sources (e.g. an `ant auth login` profile).
const hasCredentials = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.AI_ENABLED === "1");
let client = null;
if (hasCredentials) {
  try {
    client = new Anthropic();
  } catch {
    client = null; // misconfigured credentials - AI endpoints report "offline"
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

const SUBJECT_NAMES = {
  econ: "IB Economics SL",
  chem: "IB Chemistry SL",
  geo: "IB Geography SL",
  math: "IB Mathematics: Analysis and Approaches SL",
  bio: "IB Biology SL",
  engb: "IB English B HL",
  chia: "IB Chinese A: Language and Literature SL (answer in Traditional Chinese)",
};

const TUTOR_SYSTEM = `You are an experienced IB Diploma teacher and examiner tutoring a student in IB Economics SL, Chemistry SL, Geography SL, Mathematics: Analysis & Approaches SL, Biology SL, English B HL and Chinese A: Language & Literature SL. For Chinese A, reply in Traditional Chinese unless the student writes in English.

How to tutor:
- Guide rather than hand over answers. When a student asks for help with a problem, first ask what they have tried or give the next hint, unless they explicitly ask for the full worked solution.
- Use IB command terms precisely (define, describe, explain, analyse, evaluate, discuss, to what extent, calculate, show that, hence) and tell students what each demands in marks.
- Use correct IB terminology, units, significant figures and notation. For economics, recommend which diagram to draw and how to label it. For geography, push for named, located case studies with data. For chemistry, insist on units, state symbols and significant figures. For maths, show working and say which steps are "show that" vs. calculator-allowed (Paper 1 vs Paper 2).
- Write mathematics with LaTeX between \\( and \\) for inline maths and $$ $$ for display maths. Do not use single $ delimiters.
- Keep answers focused and well structured (short paragraphs, bullet points). End with a quick check-for-understanding question when it helps.
- If asked about IB rules, deadlines or assessment changes you are unsure of, say so and suggest checking with their teacher or the current subject guide.`;

const MARK_SYSTEM = `You are a senior IB examiner. Mark the student's answer strictly against the IB-style markscheme provided, the way an IB examiner would.

Rules:
- Award marks only for creditworthy points that are present in the answer. Accept equivalent wording and valid alternatives (OWTTE). Do not reward vague or incorrect statements.
- For extended responses (economics Paper 1 part (b), geography essays) apply the level descriptors in the markscheme holistically and pick the best-fit level and mark.
- For calculations, apply method marks (M) and accuracy marks (A); follow-through (FT) errors where IB would.
- The score must be an integer between 0 and the maximum marks.
- Feedback is for a 16-18 year old student: specific, encouraging, and actionable. Quote or paraphrase their own words when pointing out what earned or lost marks.`;

const MARK_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer", description: "Marks awarded" },
    level: { type: "string", description: "Level/band awarded for extended responses, or empty string" },
    summary: { type: "string", description: "One or two sentence overall verdict" },
    awarded: { type: "array", items: { type: "string" }, description: "Markscheme points the student earned" },
    missing: { type: "array", items: { type: "string" }, description: "Markscheme points the student missed or got wrong" },
    improvements: { type: "array", items: { type: "string" }, description: "Concrete actions to gain the missing marks" },
    model_answer: { type: "string", description: "A concise full-mark model answer" },
  },
  required: ["score", "level", "summary", "awarded", "missing", "improvements", "model_answer"],
  additionalProperties: false,
};

const GEN_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          q: { type: "string" },
          marks: { type: "integer" },
          type: { type: "string", enum: ["mcq", "short", "extended"] },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "integer", description: "Index of correct option for mcq, else -1" },
          ms: { type: "array", items: { type: "string" } },
        },
        required: ["q", "marks", "type", "options", "answer", "ms"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
};

// ---------- helpers ----------

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 200_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request too large"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

function str(v, max = 20_000) {
  return String(v ?? "").slice(0, max);
}

function textOf(message) {
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function apiError(res, err) {
  console.error("[api]", err?.status || "", err?.message || err);
  if (err instanceof Anthropic.RateLimitError) return sendJson(res, 429, { error: "The AI service is busy - try again in a moment." });
  if (err instanceof Anthropic.AuthenticationError) return sendJson(res, 503, { error: "AI is not configured on this server (invalid API key)." });
  if (err instanceof Anthropic.APIConnectionError) return sendJson(res, 502, { error: "Could not reach the AI service." });
  if (err instanceof Anthropic.APIError) return sendJson(res, 502, { error: "The AI service returned an error." });
  return sendJson(res, err?.status || 500, { error: err?.message || "Server error" });
}

async function structured(system, user, schema, effort = "medium") {
  const message = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: user }],
    output_config: { effort, format: { type: "json_schema", schema } },
    betas: [FALLBACK_BETA],
    fallbacks: "default",
  });
  if (message.stop_reason === "refusal") {
    throw Object.assign(new Error("The AI declined this request."), { status: 422 });
  }
  return JSON.parse(textOf(message));
}

// ---------- API routes ----------

async function handleMark(req, res) {
  const b = await readBody(req);
  const max = Math.max(1, Math.min(60, parseInt(b.marks, 10) || 1));
  const prompt = `Subject: ${SUBJECT_NAMES[b.subject] || b.subject}
Topic: ${str(b.topic, 200)}
Maximum marks: ${max}

<question>
${str(b.question)}
</question>

<markscheme>
${(Array.isArray(b.ms) ? b.ms : [b.ms]).map((p) => "- " + str(p, 2000)).join("\n")}
</markscheme>

<student_answer>
${str(b.answer) || "(no answer given)"}
</student_answer>

Mark the student answer out of ${max}.`;
  const result = await structured(MARK_SYSTEM, prompt, MARK_SCHEMA, "medium");
  result.score = Math.max(0, Math.min(max, Math.round(Number(result.score) || 0)));
  result.max = max;
  sendJson(res, 200, result);
}

async function handleGenerate(req, res) {
  const b = await readBody(req);
  const n = Math.max(1, Math.min(10, parseInt(b.count, 10) || 5));
  const style = b.style === "mcq" ? "multiple-choice (4 options)" : b.style === "extended" ? "extended-response" : "a mix of short-answer and structured";
  const prompt = `Write ${n} ORIGINAL exam-style practice questions for ${SUBJECT_NAMES[b.subject] || b.subject}, topic "${str(b.topic, 200)}".
Style: ${style}. Difficulty: ${str(b.difficulty, 20) || "mixed"}.
Match IB command terms, mark allocations and markscheme conventions. Do not copy real IB past-paper questions verbatim.
For each question give the markscheme as a list of mark points (one creditworthy point per mark where possible; for extended responses give indicative content plus level descriptors).
For mcq set "options" to 4 strings and "answer" to the 0-based correct index; for other types set options to [] and answer to -1.
Write maths with \\( \\) inline delimiters.`;
  const result = await structured(
    "You are a senior IB examiner who writes high-quality, original exam-style questions with accurate markschemes.",
    prompt,
    GEN_SCHEMA,
    "medium"
  );
  sendJson(res, 200, result);
}

// Free-form prompt that must return JSON (IA/EE predicted marking, RQ checker).
async function handleJson(req, res) {
  const b = await readBody(req, 400_000);
  const prompt = str(b.prompt, 120_000);
  if (prompt.length < 20) return sendJson(res, 400, { error: "Prompt too short." });
  const message = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: "You are a careful IB examiner and teacher. Reply with only the JSON value requested - no prose before or after it.",
    messages: [{ role: "user", content: prompt }],
    output_config: { effort: "medium" },
    betas: [FALLBACK_BETA],
    fallbacks: "default",
  });
  if (message.stop_reason === "refusal") return sendJson(res, 422, { error: "The AI declined this request." });
  const text = textOf(message);
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text.slice(Math.min(...["{", "["].map((c) => (text.indexOf(c) + 1 || Infinity) - 1)), Math.max(text.lastIndexOf("}"), text.lastIndexOf("]")) + 1);
  try {
    sendJson(res, 200, JSON.parse(candidate));
  } catch {
    sendJson(res, 502, { error: "The AI's reply couldn't be read - please try again." });
  }
}

async function handleTutor(req, res) {
  const b = await readBody(req, 400_000);
  const history = (Array.isArray(b.messages) ? b.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-20)
    .map((m) => ({ role: m.role, content: str(m.content, 12_000) }));
  if (!history.length || history[history.length - 1].role !== "user") {
    return sendJson(res, 400, { error: "Last message must be from the student." });
  }
  const context = b.subject ? `\n\nThe student is currently studying ${SUBJECT_NAMES[b.subject] || b.subject}${b.topic ? `, topic: ${str(b.topic, 200)}` : ""}.` : "";

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      system: TUTOR_SYSTEM + context,
      messages: history,
      output_config: { effort: "medium" },
      betas: [FALLBACK_BETA],
      fallbacks: "default",
    });
    stream.on("text", (delta) => send("delta", { text: delta }));
    req.on("close", () => stream.abort());
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") send("error", { error: "The AI declined to answer that. Try rephrasing your question." });
    send("done", {});
  } catch (err) {
    if (!res.writableEnded) send("error", { error: err?.message || "AI error" });
  }
  res.end();
}

// ---------- static files ----------

function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      if (req.url === "/api/health") return sendJson(res, 200, { ai: !!client, model: client ? MODEL : null });
      if (req.method !== "POST") return sendJson(res, 405, { error: "POST only" });
      if (!client) return sendJson(res, 503, { error: "AI is not configured on this server. Set ANTHROPIC_API_KEY and restart." });
      if (req.url === "/api/mark") return await handleMark(req, res);
      if (req.url === "/api/generate") return await handleGenerate(req, res);
      if (req.url === "/api/tutor") return await handleTutor(req, res);
      if (req.url === "/api/json") return await handleJson(req, res);
      return sendJson(res, 404, { error: "Unknown endpoint" });
    }
    serveStatic(req, res);
  } catch (err) {
    if (!res.headersSent) apiError(res, err);
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`IB Revision Hub running at http://localhost:${PORT}`);
  console.log(client ? `AI tutor & marking: ON (${MODEL})` : "AI tutor & marking: OFF (set ANTHROPIC_API_KEY) - offline marker will be used");
});
