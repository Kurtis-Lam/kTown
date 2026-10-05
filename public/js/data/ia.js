/* Internal assessment and Extended Essay criteria, level descriptors (paraphrased) and guidance. */
(function () {
  const sci = (subjectName) => ({
    title: `${subjectName} IA: scientific investigation`,
    weight: 0.2, total: 24, length: "Max 3000 words · ~10 hours",
    note: "Criteria shared by all DP sciences (first assessment 2025).",
    criteria: [
      { k: "Research design", max: 6, levels: [[0, "Does not reach a standard below."], [2, "Research question stated but vague; methodology has major gaps; context missing."], [4, "Research question focused; methodology mostly appropriate; some details about controls, safety or sampling missing."], [6, "Focused, detailed research question in context; methodology clearly appropriate, repeatable, with controlled variables, sufficient data and safety/ethics addressed."]], tips: ["Write a research question with independent and dependent variables, the range, and the organism/system.", "Justify why each controlled variable matters and how it is controlled.", "Plan enough data: at least 5 IV values × 3+ repeats."] },
      { k: "Data analysis", max: 6, levels: [[0, "Does not reach a standard below."], [2, "Recording/processing is unclear or contains major errors; uncertainties ignored."], [4, "Data recorded and processed relevantly, with some errors or omissions; uncertainties partly considered."], [6, "Clear, precise recording and processing; uncertainties propagated/considered; graphs and statistics appropriate and correct."]], tips: ["Tables with units and uncertainties in headings.", "Show one worked example of each calculation.", "Use error bars / SD and an appropriate statistical test where suitable."] },
      { k: "Conclusion", max: 6, levels: [[0, "Does not reach a standard below."], [2, "Conclusion stated but not supported by the data or not linked to the RQ."], [4, "Conclusion relevant to the RQ and partly justified by data; limited scientific context."], [6, "Conclusion fully justified by the analysed data, directly answers the RQ, and is compared with accepted scientific context/literature."]], tips: ["Quote your processed data (means, gradients, p-values).", "Compare with a published value or theory and explain agreement/differences."] },
      { k: "Evaluation", max: 6, levels: [[0, "Does not reach a standard below."], [2, "Weaknesses listed generically; improvements vague."], [4, "Specific weaknesses identified with some discussion of their impact; realistic improvements."], [6, "Methodological weaknesses and limitations discussed with their impact on the conclusion; realistic, relevant improvements and extensions explained."]], tips: ["Distinguish systematic and random errors and say how each affected the results.", "Every improvement must fix a stated weakness."] },
    ],
    timeline: ["Choose a topic you're curious about and that is measurable", "Pilot experiment and refine the method", "Collect data (aim for range + repeats)", "Process data and draft analysis", "Draft conclusion and evaluation", "Final edit against the criteria"],
  });
  IB.ia = {
    econ: {
      title: "Economics IA: portfolio of three commentaries",
      weight: 0.3, total: 45, length: "Max 800 words per commentary · 3 commentaries",
      note: "Each commentary is marked on A-F (14 marks); ×3 commentaries = 42, plus G: rubric requirements (3).",
      repeat: 3, extra: { k: "G: Rubric requirements (whole portfolio)", max: 3, levels: [[0, "Rubric requirements not met."], [1, "Partly met."], [3, "All met: three commentaries on different units, different key concepts, contemporary articles (published within a year), word counts."]], tips: ["Use a different unit of the syllabus for each commentary.", "Articles must be published no earlier than one year before you write the commentary."] },
      criteria: [
        { k: "A: Diagrams", max: 3, levels: [[0, "No relevant diagram."], [1, "Diagram relevant but has errors / not explained."], [2, "Relevant, accurate diagram, partly explained."], [3, "Relevant, accurate and fully explained diagram(s) linked to the article."]], tips: ["Draw diagrams digitally or neatly; label everything and refer to them in the text."] },
        { k: "B: Terminology", max: 2, levels: [[0, "No relevant terms."], [1, "Some terms used, not always appropriately."], [2, "Relevant economic terminology used appropriately throughout."]], tips: ["Define the key terms you use - briefly."] },
        { k: "C: Application and analysis", max: 3, levels: [[0, "No application."], [1, "Some application to the article."], [2, "Relevant theory applied effectively in parts."], [3, "Relevant theory effectively applied to the article throughout."]], tips: ["Every theory point should mention the article's facts."] },
        { k: "D: Key concept", max: 3, levels: [[0, "No key concept identified."], [1, "Key concept identified but not explained."], [2, "Key concept explained with some link to the article."], [3, "Key concept explicitly and effectively linked to the article throughout."]], tips: ["Name one key concept (scarcity, choice, efficiency, equity, well-being, sustainability, change, interdependence, intervention) and keep returning to it."] },
        { k: "E: Evaluation", max: 3, levels: [[0, "No evaluation."], [1, "Superficial evaluation."], [2, "Judgements partly supported."], [3, "Judgements well supported by effective and balanced reasoning."]], tips: ["Use CLASP: consequences, long/short run, assumptions, stakeholders, priorities."] },
      ],
      timeline: ["Collect contemporary articles for each unit", "Choose three articles with clear economic issues and good diagram potential", "Write commentary 1 → teacher feedback", "Commentaries 2 and 3", "Check rubric requirements and word counts"],
    },
    chem: sci("Chemistry"),
    bio: sci("Biology"),
    geo: {
      title: "Geography IA: fieldwork investigation",
      weight: 0.25, total: 30, length: "Max 2500 words · ~20 hours",
      note: "Criteria shown follow the fieldwork IA structure; check the version for your exam session with your teacher, as the geography guide is being updated.",
      criteria: [
        { k: "A: Fieldwork question and geographic context", max: 3, levels: [[0, "Not reached."], [1, "Question stated; little context."], [2, "Focused question; some context/theory."], [3, "Focused, specific question with clear geographic context and relevant theory/hypothesis."]], tips: ["Make the question local, specific and testable."] },
        { k: "B: Method(s) of investigation", max: 3, levels: [[0, "Not reached."], [1, "Methods described."], [2, "Methods appropriate and partly justified."], [3, "Appropriate methods fully justified; sampling explained."]], tips: ["Justify sampling (random, systematic, stratified) and site choice."] },
        { k: "C: Quality and treatment of information collected", max: 6, levels: [[0, "Not reached."], [2, "Limited information; inappropriate presentation."], [4, "Appropriate information; mostly effective techniques."], [6, "Sufficient, relevant information; effective and varied presentation techniques (maps, graphs, statistics)."]], tips: ["Use at least one map and one statistical test (e.g. Spearman's rank)."] },
        { k: "D: Written analysis", max: 10, levels: [[0, "Not reached."], [3, "Mostly descriptive."], [6, "Some analysis linked to the question."], [8, "Analysis with geographic context and anomalies discussed."], [10, "Thorough, well-supported analysis directly linked to the question, theory and data, including anomalies."]], tips: ["Refer to your figures by number; explain patterns and anomalies with theory."] },
        { k: "E: Conclusion", max: 2, levels: [[0, "Not reached."], [1, "Conclusion stated."], [2, "Clear conclusion consistent with the analysis that answers the question."]], tips: ["Answer the fieldwork question in one clear paragraph."] },
        { k: "F: Evaluation", max: 3, levels: [[0, "Not reached."], [1, "Limited evaluation."], [2, "Some strengths and weaknesses."], [3, "Thorough evaluation of methods with realistic improvements."]], tips: ["Evaluate sampling, timing, equipment and data reliability."] },
        { k: "G: Formal requirements", max: 3, levels: [[0, "Not reached."], [1, "Some requirements met."], [3, "Title, location map, contents, word count, sources and labelled figures all present."]], tips: ["Include a location map, numbered figures and a bibliography."] },
      ],
      timeline: ["Pick a local, measurable question", "Plan methods and sampling", "Collect primary data", "Present and analyse data", "Write conclusion and evaluation", "Check formal requirements"],
    },
    math: {
      title: "Mathematics AA IA: mathematical exploration",
      weight: 0.2, total: 20, length: "12-20 pages (double-spaced)",
      note: "Choose maths at or slightly beyond the SL syllabus that you genuinely understand.",
      criteria: [
        { k: "A: Presentation", max: 4, levels: [[0, "Not reached."], [1, "Some coherence or organisation."], [2, "Some coherence and some organisation."], [3, "Coherent and well organised."], [4, "Coherent, well organised and concise."]], tips: ["Introduction with aim, logical sections, conclusion; remove anything irrelevant."] },
        { k: "B: Mathematical communication", max: 4, levels: [[0, "Not reached."], [1, "Some relevant notation/terminology."], [2, "Mostly correct notation and terminology."], [3, "Correct notation, terminology and multiple forms of representation."], [4, "Consistently correct and appropriate throughout."]], tips: ["Define variables, label graphs and tables, use ≈ and = correctly, no calculator notation (^, *)."] },
        { k: "C: Personal engagement", max: 3, levels: [[0, "Not reached."], [1, "Limited or superficial."], [2, "Some evidence of personal engagement."], [3, "Significant: independent thinking, own examples, curiosity."]], tips: ["Collect your own data or create your own models; explain your choices."] },
        { k: "D: Reflection", max: 3, levels: [[0, "Not reached."], [1, "Limited or superficial."], [2, "Meaningful reflection."], [3, "Substantial, critical reflection on results, methods and limitations."]], tips: ["After each result, ask: what does this mean? How reliable is it? What next?"] },
        { k: "E: Use of mathematics", max: 6, levels: [[0, "Not reached."], [2, "Some relevant maths; limited understanding."], [4, "Relevant, correct maths at the level of the course with good understanding."], [6, "Relevant, correct, thorough maths commensurate with the course, demonstrating full understanding."]], tips: ["Show the maths, not just GDC outputs; explain why each method was chosen."] },
      ],
      timeline: ["Pick a topic linked to an interest", "Find the mathematical aim", "Research and do the maths", "First draft", "Teacher feedback", "Final draft focused on criteria"],
    },
    engb: {
      title: "English B HL: individual oral",
      weight: 0.25, total: 30, length: "12-15 min + 20 min preparation",
      note: "Based on a literary extract from a work studied, then a conversation on at least one additional theme.",
      criteria: [
        { k: "A: Language", max: 12, levels: [[0, "Not reached."], [3, "Limited vocabulary and grammar; many errors."], [6, "Appropriate vocabulary; some complex structures with errors."], [9, "Varied vocabulary and structures; errors rarely impede."], [12, "Varied, idiomatic language with complex structures; fluent and accurate."]], tips: ["Practise topic vocabulary for all five themes; use a range of tenses and conditionals."] },
        { k: "B1: Message - literary extract", max: 6, levels: [[0, "Not reached."], [2, "Superficial understanding of the extract."], [4, "Good understanding, some links to the work."], [6, "Thorough understanding; ideas well developed and linked to the work and theme."]], tips: ["Context → content → techniques → theme link → personal response."] },
        { k: "B2: Message - conversation", max: 6, levels: [[0, "Not reached."], [2, "Responses are simple or irrelevant."], [4, "Relevant responses with some development."], [6, "Consistently relevant, well-developed responses with examples."]], tips: ["Answer + reason + example for every question."] },
        { k: "C: Interactive skills", max: 6, levels: [[0, "Not reached."], [2, "Limited understanding and interaction."], [4, "Sustained interaction with some hesitation."], [6, "Natural, sustained conversation; understands and responds fluently."]], tips: ["Ask for clarification naturally; expand answers without being prompted."] },
      ],
      timeline: ["Choose literary works", "Annotate key extracts", "Practise 4-min presentations", "Practise theme conversations", "Mock IO with a partner"],
    },
    chia: {
      title: "中文A 語言與文學：個人口試 (IO)",
      weight: 0.3, total: 40, length: "15分鐘（10分鐘陳述 + 5分鐘提問）",
      note: "以一個全球性問題，連繫一部文學作品節選及一套非文學文本節選。",
      criteria: [
        { k: "A：知識、理解與詮釋", max: 10, levels: [[0, "未達以下水平。"], [3, "對節選有一些認識，詮釋有限。"], [6, "對節選及整體作品有良好理解，詮釋大致有據。"], [8, "理解深入，詮釋有見地並有充分證據。"], [10, "對兩個文本及全球性問題有全面而深刻的理解與詮釋。"]], tips: ["每個論點都以節選中的具體證據支持，並連繫整部作品。"] },
        { k: "B：分析與評價", max: 10, levels: [[0, "未達以下水平。"], [3, "以描述為主，分析有限。"], [6, "對作者選擇有一定分析。"], [8, "深入分析作者選擇如何呈現全球性問題。"], [10, "分析與評價深刻、具洞見，比較兩個文本的不同角度。"]], tips: ["手法 → 效果 → 如何呈現全球性問題。"] },
        { k: "C：焦點與組織", max: 10, levels: [[0, "未達以下水平。"], [3, "組織鬆散，焦點不清。"], [6, "大致有組織，焦點尚算清晰。"], [8, "結構清晰，緊扣全球性問題。"], [10, "結構嚴密，兩個文本的討論平衡且緊扣問題。"]], tips: ["跟從 1-4-4-1 分鐘結構。"] },
        { k: "D：語言", max: 10, levels: [[0, "未達以下水平。"], [3, "語言欠準確，語域不當。"], [6, "語言大致清晰準確。"], [8, "語言準確、流暢、語域恰當。"], [10, "語言精確、流暢，善用術語，表達具感染力。"]], tips: ["練習用分析動詞與文學術語，避免口語化。"] },
      ],
      timeline: ["確定全球性問題", "選文學作品與非文學文本", "選取約40行節選", "撰寫10點提綱", "模擬口試練習"],
    },
  };

  IB.ee = {
    title: "Extended Essay",
    total: 34, length: "Max 4000 words · ~40 hours · 3 reflection sessions",
    note: "Criteria below follow the EE model assessed up to May 2026. A revised EE applies from first assessment 2027 - always confirm the current criteria with your EE supervisor and coordinator.",
    criteria: [
      { k: "A: Focus and method", max: 6, levels: [[0, "Not reached."], [2, "Topic and RQ unclear; methodology limited."], [4, "Topic communicated; RQ clear; methodology mostly appropriate."], [6, "Topic and focused RQ clearly communicated; methodology appropriate and complete."]], tips: ["Narrow your research question - specific, arguable and answerable in 4000 words."] },
      { k: "B: Knowledge and understanding", max: 6, levels: [[0, "Not reached."], [2, "Limited knowledge; terminology inaccurate."], [4, "Good knowledge, mostly relevant sources; terminology mostly accurate."], [6, "Excellent knowledge; sources effectively used; terminology accurate throughout."]], tips: ["Use subject-specific terminology and academic sources."] },
      { k: "C: Critical thinking", max: 12, levels: [[0, "Not reached."], [3, "Research limited; analysis mainly descriptive."], [6, "Research adequate; some analysis; argument partly developed."], [9, "Research appropriate; analysis effective; reasoned argument; some evaluation."], [12, "Research excellent; analysis sound; well-developed argument; critical evaluation throughout."]], tips: ["Every paragraph should advance the argument; evaluate your sources and methods."] },
      { k: "D: Presentation", max: 4, levels: [[0, "Not reached."], [2, "Structure and layout partly support the essay."], [4, "Structure and layout fully support reading and understanding."]], tips: ["Title page, contents, page numbers, consistent referencing, labelled figures."] },
      { k: "E: Engagement", max: 6, levels: [[0, "Not reached."], [2, "Reflections mostly descriptive."], [4, "Reflections show some intellectual initiative and engagement."], [6, "Reflections show strong personal engagement, intellectual initiative and creativity."]], tips: ["In the RPPF, write about decisions, setbacks and what you learned - not just what you did."] },
    ],
    grades: [["A", 27, 34], ["B", 21, 26], ["C", 14, 20], ["D", 7, 13], ["E", 0, 6]],
    matrix: { // TOK (rows) x EE (cols) → bonus points; E in either = failing condition
      order: ["A", "B", "C", "D", "E"],
      points: { A: [3, 3, 2, 2, "F"], B: [3, 2, 2, 1, "F"], C: [2, 2, 1, 0, "F"], D: [2, 1, 0, 0, "F"], E: ["F", "F", "F", "F", "F"] },
    },
    rqTips: [
      "Specific: names the case, period, text, organism or dataset.",
      "Arguable: allows a reasoned answer, not a list of facts.",
      "Answerable: sources or data you can actually access in 4000 words.",
      "Subject-appropriate: uses the methods of the chosen subject.",
    ],
    timeline: ["Choose subject and supervisor", "Initial reflection (RPPF 1)", "Research and refine RQ", "First full draft", "Interim reflection (RPPF 2)", "Final draft and viva voce (RPPF 3)"],
  };
})();
