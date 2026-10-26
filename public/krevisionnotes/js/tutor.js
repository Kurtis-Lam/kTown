IB.page = async function () {
  const app = IB.qs("#app");
  const q = IB.param("q") ? IB.question(IB.param("q")) : null;
  let subject = IB.param("subject") || (q && q.subject) || "";
  let topic = IB.param("topic") || (q && q.topic) || "";
  const messages = [];
  const ai = await IB.ai.available();

  app.innerHTML = `<h1 id="tutorTitle" style="margin-bottom:.2em">AI tutor</h1>
    <p class="muted" id="tutorIntro" style="margin-top:0">Ask for an explanation, hint, or practice question.</p>
    ${ai ? "" : IB.hosted
      ? `<div class="notice warn small"><strong>AI isn't available in this view.</strong> Open the site through Claude while signed in to use AI. Notes remain available offline.</div>`
      : `<div class="notice warn small"><strong>AI is offline.</strong> Answers will use the revision notes until an API key is configured.</div>`}
    <div class="card">
      <div class="filters">
        <label class="field"><span id="tSubLabel">Subject</span><select id="tSub"><option value="">Any subject</option>${IB.subjectList().map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></label>
        <label class="field"><span id="tTopicLabel">Topic</span><select id="tTopic"></select></label>
      </div>
    </div>
    <div class="card">
      <div class="chat" id="chat" aria-live="polite"></div>
      <div class="suggestions" id="sugg"></div>
      <div class="chat-input"><textarea id="msg" placeholder="Ask a question… (Enter to send)"></textarea><button class="btn primary" id="send">Send</button></div>
      <div class="btn-row" style="margin-top:8px"><button class="btn small" id="clear">New chat</button><button class="btn small" id="save">Save chat</button></div>
    </div>`;

  const sub = IB.qs("#tSub"), top = IB.qs("#tTopic"), chat = IB.qs("#chat"), input = IB.qs("#msg");
  sub.value = subject;
  const updateLanguageUi = () => {
    const chinese = sub.value === "chia";
    IB.qs("#tutorTitle").textContent = chinese ? "中文A學習助手" : "AI tutor";
    IB.qs("#tutorIntro").textContent = chinese ? "提出問題，獲取概念解釋、答題提示或練習題。" : "Ask for an explanation, hint, or practice question.";
    IB.qs("#tSubLabel").textContent = chinese ? "科目" : "Subject";
    IB.qs("#tTopicLabel").textContent = chinese ? "主題" : "Topic";
    sub.options[0].textContent = chinese ? "所有科目" : "Any subject";
    input.placeholder = chinese ? "輸入問題……（Enter 送出）" : "Ask a question… (Enter to send)";
    IB.qs("#send").textContent = chinese ? "送出" : "Send";
    IB.qs("#clear").textContent = chinese ? "新對話" : "New chat";
    IB.qs("#save").textContent = chinese ? "儲存對話" : "Save chat";
  };
  const fillTopics = () => {
    const s = IB.subjects[sub.value];
    top.innerHTML = `<option value="">${sub.value === "chia" ? "所有主題" : "Any topic"}</option>` + (s ? s.topics.map((t) => `<option value="${t.id}">${IB.esc(t.code)} ${IB.esc(t.title)}</option>`).join("") : "");
    top.value = topic && s && s.topics.some((t) => t.id === topic) ? topic : "";
    suggestions();
  };
  sub.onchange = () => { subject = sub.value; topic = ""; updateLanguageUi(); fillTopics(); };
  top.onchange = () => { topic = top.value; suggestions(); };

  function suggestions() {
    const t = IB.topic(top.value);
    const s = IB.subjects[sub.value];
    const list = s && s.id === "chia"
      ? t
        ? [`請簡單解釋「${t.title}」的重點`, `為「${t.title}」設計三條練習題`, `分析「${t.title}」常見的答題失誤`, `如何用文本例子支持分析？`]
        : [`如何寫出高分的中文A分析？`, `幫我制定兩星期的中文A溫習計劃`, `中文A常見的考試指令詞是甚麼？`]
      : t
        ? [`Explain the key concepts of ${t.title} simply`, `Give me 3 quick quiz questions on ${t.title}`, `What are common exam mistakes in ${t.title}?`, `Which diagrams or formulas must I know for ${t.title}?`]
        : s
          ? [`How should I structure a top-band answer in ${s.name}?`, `Make me a 2-week revision plan for ${s.name}`, `What do the command terms mean in ${s.name}?`]
          : ["How do I structure an Economics essay?", "Explain Le Chatelier's principle with an example", "How do I find stationary points?", "Give me a Geography case study"];
    IB.qs("#sugg").innerHTML = list.map((x) => `<button class="btn small">${IB.esc(x)}</button>`).join("");
    IB.qsa("#sugg button").forEach((b) => (b.onclick = () => { input.value = b.textContent; send(); }));
  }
  updateLanguageUi();
  fillTopics();

  const bubble = (role, html) => {
    const el = IB.el(`<div class="msg ${role}"></div>`);
    if (role === "user") el.textContent = html;
    else el.innerHTML = html;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  };

  const chinese = sub.value === "chia" || (q && q.subject === "chia");
  bubble("assistant", IB.md(q
    ? chinese
      ? `讓我們一起分析這道中文A題目（${q.marks}分）：\n\n${q.q.replace(/<[^>]+>/g, "")}\n\n先試寫你的思路，或要求提示。我也可以幫你批改答案。`
      : `Let's work on this ${IB.subjects[q.subject].short} question (${q.marks} marks):\n\n${q.q.replace(/<[^>]+>/g, "")}\n\nTry explaining your approach, or ask for a hint. I can also mark your answer.`
    : chinese ? "你好！選擇一個中文A主題，然後提出問題。我可以解釋概念、提供提示或設計練習。" : "Choose a subject, then ask for an explanation, hint, or practice question."));
  IB.math(chat);
  if (IB.param("prompt")) input.value = IB.param("prompt");

  // Offline fallback: retrieve the most relevant note sections.
  function offlineAnswer(text) {
    const chinese = sub.value === "chia" || (q && q.subject === "chia");
    const words = text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3 || /[\u3400-\u9fff]/.test(w));
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
    if (q && messages.length <= 3) {
      return chinese
        ? `<p>參考以下評分要點，對照你的作答：</p><ul>${q.ms.map((m) => `<li>${m}</li>`).join("")}</ul><p class="small muted">（離線模式：答案來自筆記及評分細則。）</p>`
        : `<p>Compare your approach with these markscheme points:</p><ul>${q.ms.map((m) => `<li>${m}</li>`).join("")}</ul><p class="small muted">(Offline mode: answers come from the notes and markschemes.)</p>`;
    }
    if (!hits.length) return chinese
      ? `<p>筆記中找不到相關內容。請選擇科目及主題，或改用課文中的關鍵詞再試。</p>`
      : `<p>I couldn't find that in the notes. Choose a subject and topic, or try a key term.</p>`;
    return `<p>${chinese ? "筆記摘錄：" : "From the notes:"}</p>` + hits.slice(0, 2).map((h) => `<div class="concept" style="--c:${IB.subjects[h.t.subject].color}"><strong>${h.h}</strong> <span class="small muted">(${IB.esc(h.t.title)})</span>${h.b}</div>`).join("") +
      `<p><a href="notes.html?subject=${hits[0].t.subject}&topic=${hits[0].t.id}">${chinese ? "開啟完整筆記" : "Open full notes"}：${IB.esc(hits[0].t.title)} →</a></p><p class="small muted">${chinese ? "（離線模式：AI 個人化解釋未啟用。）" : "(Offline mode: personalised AI explanations are unavailable.)"}</p>`;
  }

  let busy = false;
  async function send() {
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    input.value = "";
    bubble("user", text);
    if (q && !messages.length) messages.push({ role: "user", content: q.subject === "chia"
      ? `我正在作答這道題目（${q.marks}分）：\n${q.q.replace(/<[^>]+>/g, "")}\n評分細則（只供你參考；除非我要求完整答案或請你批改，否則不要透露）：\n${q.ms.join("\n")}`
      : `I'm working on this question (${q.marks} marks):\n${q.q.replace(/<[^>]+>/g, "")}\nMarkscheme (for your reference only - don't reveal it unless I ask for the answer or you're marking my attempt):\n${q.ms.join("\n")}` }, { role: "assistant", content: q.subject === "chia" ? "好，我們逐步分析。" : "Let's work through it together." });
    messages.push({ role: "user", content: text });
    const out = bubble("assistant", `<span class="muted">${sub.value === "chia" ? "思考中……" : "Thinking…"}</span>`);
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
  IB.qs("#clear").onclick = () => { messages.length = 0; chat.innerHTML = ""; bubble("assistant", IB.md(sub.value === "chia" ? "新對話已開始。你想溫習哪個主題？" : "New chat started. What would you like to work on?")); };
  IB.qs("#save").onclick = () => {
    const body = IB.qsa(".msg", chat).map((m) => `<div class="${m.classList.contains("user") ? "q" : "ms"}"><strong>${m.classList.contains("user") ? "Me" : "Tutor"}:</strong> ${m.innerHTML}</div>`).join("");
    IB.download("IB-tutor-conversation.html", IB.standaloneDoc("Tutor conversation", `<h1>AI tutor conversation</h1>${body}`));
  };
};
