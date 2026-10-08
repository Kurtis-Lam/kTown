// Vercel Serverless Function: proxies requests to OpenRouter so the API key
// stays on the server (set OPENROUTER_API_KEY in Vercel > Settings > Environment Variables).

const MODEL = "deepseek/deepseek-v4-flash-vision-exp";
const MAX_TOKENS_CAP = 8192;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: { message: "Method not allowed" } });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: { message: "OPENROUTER_API_KEY is not configured on the server." } });
    }

    const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
        return res.status(400).json({ error: { message: "Request must include a messages array." } });
    }

    const maxTokens = Math.min(Number(body.max_tokens) || 4096, MAX_TOKENS_CAP);

    try {
        const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": req.headers.origin || `https://${req.headers.host}`,
                "X-Title": "kTown"
            },
            body: JSON.stringify({
                model: MODEL, // model is fixed server-side
                max_tokens: maxTokens,
                messages: body.messages
            })
        });

        const text = await upstream.text();
        res.status(upstream.status).setHeader("Content-Type", "application/json").send(text);
    } catch (err) {
        res.status(502).json({ error: { message: `Upstream request failed: ${err.message}` } });
    }
}

function safeParse(s) {
    try { return JSON.parse(s); } catch { return null; }
}
