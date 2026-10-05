const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

Guide rather than hand over answers: give a hint first unless the student asks for a full solution. Use IB command terms precisely, correct terminology, units and notation, and keep answers focused and well structured. Write mathematics with \\( and \\) for inline maths and $$ $$ for display maths. If unsure about IB rules or assessment changes, say so and recommend checking the current subject guide.`;

const MARK_SYSTEM = `You are a senior IB examiner. Mark only creditworthy points against the supplied markscheme, accept valid alternatives, apply method and accuracy marks appropriately, and return only valid JSON matching the requested schema. Feedback should be specific, encouraging, and actionable for a 16-18 year old student.`;

const MARK_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    level: { type: "string" },
    summary: { type: "string" },
    awarded: { type: "array", items: { type: "string" } },
    missing: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    model_answer: { type: "string" },
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
          answer: { type: "integer" },
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

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 400_000) {
  const asObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw Object.assign(new Error("Request body must be a JSON object."), { status: 400 });
    }
    return value;
  };
  if (req.body && typeof req.body === "object") return asObject(req.body);
  if (typeof req.body === "string") {
    try { return asObject(JSON.parse(req.body || "{}")); }
    catch { throw Object.assign(new Error("Invalid JSON"), { status: 400 }); }
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("Request too large"), { status: 413 });
    chunks.push(chunk);
  }
  try { return asObject(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
  catch { throw Object.assign(new Error("Invalid JSON"), { status: 400 }); }
}

function str(value, max = 20_000) {
  return String(value ?? "").slice(0, max);
}

function extractJson(text) {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = Math.min(...["{", "["].map((mark) => {
    const index = clean.indexOf(mark);
    return index < 0 ? Infinity : index;
  }));
  const end = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
  if (!Number.isFinite(start) || end < start) throw Object.assign(new Error("The AI returned invalid JSON. Please try again."), { status: 502 });
  try { return JSON.parse(clean.slice(start, end + 1)); }
  catch { throw Object.assign(new Error("The AI returned invalid JSON. Please try again."), { status: 502 }); }
}

async function responseJson(response) {
  try { return await response.json(); }
  catch { throw Object.assign(new Error("OpenRouter returned an invalid response."), { status: 502 }); }
}

async function openRouter(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw Object.assign(new Error("AI is not configured. Add OPENROUTER_API_KEY to the server environment."), { status: 503 });
  const origin = options.origin || "https://ktown.app";
  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": origin,
        "X-Title": "kTown",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: options.maxTokens || 6000,
        stream: !!options.stream,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    console.error("[openrouter] request failed:", error);
    throw Object.assign(new Error("Could not reach the OpenRouter API."), { status: 502 });
  }
  if (!response.ok) {
    const text = await response.text();
    const status = response.status === 429 ? 429 : response.status === 401 || response.status === 403 ? 503 : 502;
    console.error("[openrouter]", response.status, text.slice(0, 1000));
    throw Object.assign(new Error(status === 429 ? "The AI service is busy. Try again in a moment." : status === 503 ? "The OpenRouter API key is invalid or not authorized." : "The AI service returned an error."), { status });
  }
  return response;
}

async function askJson(system, prompt, schema, req) {
  const schemaText = JSON.stringify(schema);
  const response = await openRouter([
    { role: "system", content: `${system}\nReturn only a JSON object matching this schema: ${schemaText}` },
    { role: "user", content: prompt },
  ], { json: true, origin: requestOrigin(req) });
  const payload = await responseJson(response);
  return extractJson(payload.choices?.[0]?.message?.content || "");
}

function requestOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "ktown.app";
  return `${protocol}://${host}`;
}

async function handleMark(req, res) {
  const body = await readBody(req);
  const max = Math.max(1, Math.min(60, parseInt(body.marks, 10) || 1));
  const prompt = `Subject: ${SUBJECT_NAMES[body.subject] || str(body.subject, 100)}
Topic: ${str(body.topic, 200)}
Maximum marks: ${max}

Question:
${str(body.question)}

Markscheme:
${(Array.isArray(body.ms) ? body.ms : [body.ms]).map((point) => `- ${str(point, 2000)}`).join("\n")}

Student answer:
${str(body.answer) || "(no answer given)"}

Mark the answer out of ${max}. Use this JSON shape: ${JSON.stringify(MARK_SCHEMA)}`;
  const result = await askJson(MARK_SYSTEM, prompt, MARK_SCHEMA, req);
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw Object.assign(new Error("The AI returned invalid marking feedback. Please try again."), { status: 502 });
  }
  result.score = Math.max(0, Math.min(max, Math.round(Number(result.score) || 0)));
  result.max = max;
  return sendJson(res, 200, result);
}

async function handleGenerate(req, res) {
  const body = await readBody(req);
  const count = Math.max(1, Math.min(10, parseInt(body.count, 10) || 5));
  const style = body.style === "mcq" ? "multiple-choice with 4 options" : body.style === "extended" ? "extended-response" : "a mix of short-answer and structured";
  const prompt = `Write ${count} ORIGINAL exam-style practice questions for ${SUBJECT_NAMES[body.subject] || str(body.subject, 100)}, topic "${str(body.topic, 200)}".
Style: ${style}. Difficulty: ${str(body.difficulty, 20) || "mixed"}.
Match IB command terms, mark allocations and markscheme conventions. Do not copy real past-paper questions. For each question, include a concise markscheme. For MCQ, provide 4 options and a zero-based answer index. For other questions, provide [] for options and -1 for answer. Write all math in \\( \\) delimiters.
Return this JSON shape: ${JSON.stringify(GEN_SCHEMA)}`;
  const result = await askJson("You are a senior IB examiner who writes high-quality, original exam-style questions with accurate markschemes.", prompt, GEN_SCHEMA, req);
  if (!result || !Array.isArray(result.questions)) throw Object.assign(new Error("The AI returned an invalid question set. Please try again."), { status: 502 });
  return sendJson(res, 200, result);
}

async function handleJson(req, res) {
  const body = await readBody(req);
  const prompt = str(body.prompt, 120_000);
  if (prompt.length < 20) return sendJson(res, 400, { error: "Prompt too short." });
  const result = await askJson("You are a careful IB examiner and teacher. Reply with only the JSON value requested.", prompt, { type: "object" }, req);
  return sendJson(res, 200, result);
}

async function handleAuraNotes(req, res) {
  const body = await readBody(req);
  if (!Array.isArray(body.messages) || !body.messages.length) {
    return sendJson(res, 400, { error: "Provide at least one chat message." });
  }
  const valid = body.messages
    .filter((message) => message && typeof message === "object" && ["system", "user", "assistant"].includes(message.role) && message.content)
    .map((message) => ({ role: message.role, content: str(message.content, 40_000) }));
  const system = valid.find((message) => message.role === "system");
  const conversation = valid.filter((message) => message.role !== "system").slice(-23);
  const messages = [...(system ? [system] : []), ...conversation];
  if (!messages.some((message) => message.role === "user")) {
    return sendJson(res, 400, { error: "Include at least one user message." });
  }
  const maxTokens = Math.max(128, Math.min(4096, parseInt(body.maxTokens, 10) || 2048));
  const response = await openRouter(messages, { maxTokens, origin: requestOrigin(req) });
  const payload = await responseJson(response);
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw Object.assign(new Error("The AI returned an empty response."), { status: 502 });
  return sendJson(res, 200, { content });
}

async function handleTutor(req, res) {
  const body = await readBody(req);
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((message) => message && typeof message === "object" && (message.role === "user" || message.role === "assistant") && message.content)
    .slice(-20)
    .map((message) => ({ role: message.role, content: str(message.content, 12_000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return sendJson(res, 400, { error: "Last message must be from the student." });
  }
  const context = body.subject ? `\n\nThe student is studying ${SUBJECT_NAMES[body.subject] || str(body.subject, 100)}${body.topic ? `, topic: ${str(body.topic, 200)}` : ""}.` : "";
  const abortController = new AbortController();
  res.on("close", () => { if (!res.writableEnded) abortController.abort(); });
  const upstream = await openRouter([
    { role: "system", content: TUTOR_SYSTEM + context },
    ...messages,
  ], { stream: true, maxTokens: 6000, origin: requestOrigin(req), signal: abortController.signal });
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  let buffer = "";
  for await (const chunk of upstream.body) {
    buffer += chunk.toString("utf8");
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) res.write(`event: delta\ndata: ${JSON.stringify({ text: delta })}\n\n`);
      } catch (error) {
        console.error("Could not parse an OpenRouter stream event:", error);
      }
    }
  }
  res.write("event: done\ndata: {}\n\n");
  res.end();
}

export async function handleApi(req, res, pathname) {
  try {
    if (pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, { ai: !!process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_API_KEY ? MODEL : null });
    }
    if (req.method !== "POST") return sendJson(res, 405, { error: "POST only" });
    if (pathname === "/api/mark") return await handleMark(req, res);
    if (pathname === "/api/generate") return await handleGenerate(req, res);
    if (pathname === "/api/tutor") return await handleTutor(req, res);
    if (pathname === "/api/auranotes") return await handleAuraNotes(req, res);
    if (pathname === "/api/json") return await handleJson(req, res);
    return sendJson(res, 404, { error: "Unknown endpoint" });
  } catch (error) {
    console.error("[api]", error?.status || "", error?.message || error);
    if (!res.headersSent) return sendJson(res, error?.status || 500, { error: error?.message || "Server error" });
    res.write(`event: error\ndata: ${JSON.stringify({ error: error?.message || "AI error" })}\n\n`);
    return res.end();
  }
}
