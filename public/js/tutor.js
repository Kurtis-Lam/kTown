IB.page = async function () {
  const app = IB.qs("#app");
  const q = IB.param("q") ? IB.question(IB.param("q")) : null;
  let subject = IB.param("subject") || (q && q.subject) || "";
  let topic = IB.param("topic") || (q && q.topic) || "";
  const messages = [];
  const ai = await IB.ai.available();

  app.innerHTML = `<h1 style="margin-bottom:.2em">AI tutor</h1>
    <p class="muted" style="margin-top:0">Ask for an explanation, a hint, a diagram description, feedback on an essay plan, or a step-by-step method. The tutor guides you like a teacher - ask for the full solution if you want it.</p>
    ${ai ? "" : `<div class="notice warn small"><strong>AI is offline on this copy of the site.</strong> You'll get answers drawn from the revision notes instead. To switch on the full AI tutor and examiner-style marking, run the site with an Anthropic API key (see README).</div>`}
    <div class="card">
      <div class="filters">
        <label class="field">Subject<select id="tSub"><option value="">Any subject</option>${IB.subjectList().map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></label>
        <label class="field">Topic<select id="tTopic"></select></label>
      </div>
    </div>
    <div class="card">
      <div class="chat" id="chat" aria-live="polite"></div>
      <div class="suggestions" id="sugg"></div>
      <div class="chat-input"><textarea id="msg" placeholder="Ask anything about your IB subjects…  (Enter to send, Shift+Enter for a new line)"></textarea><button class="btn primary" id="send">Send</button></div>
      <div class="btn-row" style="margin-top:8px"><button class="btn small" id="clear">New conversation</button><button class="btn small" id="save">⬇ Save conversation</button></div>
    </div>`;

  const sub = IB.qs("#tSub"), top = IB.qs("#tTopic"), chat = IB.qs("#chat"), input = IB.qs("#msg");
  sub.value = subject;
  const fillTopics = () => {
    const s = IB.subjects[sub.value];
    top.innerHTML = `<option value="">Any topic</option>` + (s ? s.topics.map((t) => `<option value="${t.id}">${IB.esc(t.code)} ${IB.esc(t.title)}</option>`).join("") : "");
    top.value = topic && s && s.topics.some((t) => t.id === topic) ? topic : "";
    suggestions();
  };
  sub.onchange = () => { subject = sub.value; topic = ""; fillTopics(); };
  top.onchange = () => { topic = top.value; suggestions(); };

  function suggestions() {
    const t = IB.topic(top.value);
    const s = IB.subjects[sub.value];
    const list = t
      ? [`Explain the key concepts of ${t.title} simply`, `Give me 3 quick quiz questions on ${t.title}`, `What are common exam mistakes in ${t.title}?`, `Which diagrams or formulas must I know for ${t.title}?`]
      : s
        ? [`How should I structure a top-band answer in ${s.name}?`, `Make me a 2-week revision plan for ${s.name}`, `What do the command terms mean in ${s.name}?`]
        : ["How do I structure an Econ Paper 1 (b) essay?", "Explain Le Chatelier's principle with an example", "How do I find stationary points?", "Give me a case study for geophysical hazards"];
    IB.qs("#sugg").innerHTML = list.map((x) => `<button class="btn small">${IB.esc(x)}</button>`).join("");
    IB.qsa("#sugg button").forEach((b) => (b.onclick = () => { input.value = b.textContent; send(); }));
  }
  fillTopics();

  const bubble = (role, html) => {
    const el = IB.el(`<div class="msg ${role}"></div>`);
    if (role === "user") el.textContent = html;
    else el.innerHTML = html;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  };

  bubble("assistant", IB.md(q
    ? `Let's work on this ${IB.subjects[q.subject].short} question (${q.marks} marks):\n\n${q.q.replace(/<[^>]+>/g, "")}\n\nTell me how you'd start, or ask for a hint. I can also mark your attempt.`
    : "Hi! I'm your IB tutor for Economics SL, Chemistry SL, Geography SL and Maths AA SL. What are you revising today?"));
  IB.math(chat);
  if (IB.param("prompt")) input.value = IB.param("prompt");

  // Offline fallback: retrieve the most relevant note sections.
  function offlineAnswer(text) {
    const words = text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const subs = sub.value ? [IB.subjects[sub.value]] : IB.subjectList();
    const hits = [];
    subs.forEach((s) => s.topics.forEach((t) => {
      if (top.value && t.id !== top.value) return;
      const items = t.concepts.map((c) => ({ t, h: c.h, b: c.b })).concat((t.terms || []).map(([k, v]) => ({ t, h: k, b: `<p>${v}</p>` })));
      items.forEach((it) => {
        const hay = (it.h + " " + it.b + " " + t.title).toLowerCase();
        const score = words.reduce((n, w) => n + (hay.includes(w) ? (it.h.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
        if (score) hits.push({ ...it, score });
      });
    }));
    hits.sort((a, b) => b.score - a.score);
    if (q && messages.length <= 1) {
      return `<p>Here's the markscheme guidance for this question - compare it with your approach:</p><ul>${q.ms.map((m) => `<li>${m}</li>`).join("")}</ul><p class="small muted">(Offline mode - answers come from the site's notes and markschemes.)</p>`;
    }
    if (!hits.length) return `<p>I couldn't find that in the notes. Try choosing a subject and topic above, or rephrase with key terms (e.g. "price elasticity", "enthalpy", "binomial").</p>`;
    return `<p>From the notes:</p>` + hits.slice(0, 2).map((h) => `<div class="concept" style="--c:${IB.subjects[h.t.subject].color}"><strong>${h.h}</strong> <span class="small muted">(${IB.esc(h.t.title)})</span>${h.b}</div>`).join("") +
      `<p><a href="krevisionnotes.html?subject=${hits[0].t.subject}&topic=${hits[0].t.id}">Open the full notes for ${IB.esc(hits[0].t.title)} →</a></p><p class="small muted">(Offline mode - switch on AI for personalised explanations.)</p>`;
  }

  let busy = false;
  async function send() {
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    input.value = "";
    bubble("user", text);
    if (q && !messages.length) messages.push({ role: "user", content: `I'm working on this question (${q.marks} marks):\n${q.q.replace(/<[^>]+>/g, "")}\nMarkscheme (for your reference only - don't reveal it unless I ask for the answer or you're marking my attempt):\n${q.ms.join("\n")}` }, { role: "assistant", content: "Great - let's work through it together." });
    messages.push({ role: "user", content: text });
    const out = bubble("assistant", `<span class="muted">Thinking…</span>`);
    if (!ai) {
      out.innerHTML = offlineAnswer(text);
      messages.push({ role: "assistant", content: out.textContent });
      IB.math(out);
      busy = false;
      return;
    }
    let acc = "";
    try {
      const t = IB.topic(top.value);
      await IB.ai.tutor({ messages, subject: sub.value, topic: t ? `${t.code} ${t.title}` : "" }, (d) => {
        acc += d;
        out.innerHTML = IB.md(acc);
        chat.scrollTop = chat.scrollHeight;
      });
      messages.push({ role: "assistant", content: acc || "(no response)" });
      IB.math(out);
    } catch (e) {
      out.innerHTML = `<p>${IB.esc(e.message)}</p>` + offlineAnswer(text);
      messages.push({ role: "assistant", content: out.textContent });
      IB.math(out);
    }
    busy = false;
  }

  IB.qs("#send").onclick = send;
  input.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  IB.qs("#clear").onclick = () => { messages.length = 0; chat.innerHTML = ""; bubble("assistant", IB.md("New conversation started. What would you like to work on?")); };
  IB.qs("#save").onclick = () => {
    const body = IB.qsa(".msg", chat).map((m) => `<div class="${m.classList.contains("user") ? "q" : "ms"}"><strong>${m.classList.contains("user") ? "Me" : "Tutor"}:</strong> ${m.innerHTML}</div>`).join("");
    IB.download("IB-tutor-conversation.html", IB.standaloneDoc("Tutor conversation", `<h1>AI tutor conversation</h1>${body}`));
  };
};
