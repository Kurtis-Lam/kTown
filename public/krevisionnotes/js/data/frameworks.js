/* Answer frameworks (templates for every question type) and markscheme decoders, per subject. */
IB.frameworks = {
  econ: {
    frameworks: [
      { id: "def", type: "Define", marks: "2", when: "Define · Paper 2 (a)", time: "2 min",
        structure: [["Core idea", "The precise textbook meaning (1 mark)."], ["Precision", "The qualifier that makes it exact: 'in a given time period', 'ceteris paribus', 'at each price' (1 mark)."]],
        starters: ["X is the …", "X refers to … which …"],
        example: { q: "Define price elasticity of demand. [2]", a: "Price elasticity of demand is a measure of the responsiveness of quantity demanded of a good [1] to a change in its own price [1]." },
        checklist: ["No diagram needed", "Learn definitions word-for-word", "Don't use the word itself in the definition"] },
      { id: "dia4", type: "Explain using a diagram", marks: "4", when: "Using an appropriate diagram, explain… · Paper 2", time: "6-8 min",
        structure: [["Diagram (2 marks)", "Correct axes, curves, shift with arrow, initial and new equilibrium labelled."], ["Cause", "What event happens and which curve it affects (1 mark)."], ["Mechanism", "Shortage/surplus → price moves → new equilibrium; refer to the diagram (1 mark)."]],
        starters: ["As shown in the diagram, … shifts from S₁ to S₂ because …", "At the original price P₁ there is now excess demand, so …"],
        example: { q: "Using a diagram, explain the effect of a drought on the world price of coffee. [4]", a: "[Diagram: S₁ shifts left to S₂, P₁→P₂, Q₁→Q₂] The drought reduces yields, so supply decreases (S₁→S₂). At P₁ there is a shortage, so the price is bid up to P₂ and quantity falls to Q₂." },
        checklist: ["Axes labelled (P, Q or Price level, Real GDP)", "Both equilibria marked", "Text refers to the diagram", "Use the context from the text"] },
      { id: "calc", type: "Calculate", marks: "2", when: "Calculate · Paper 2", time: "2-3 min",
        structure: [["Method (1)", "Write the formula and substitute the numbers."], ["Answer (1)", "Correct value with units (%, $) or none for elasticity, to 2 d.p."]],
        starters: ["PED = %ΔQd ÷ %ΔP = … ÷ … = …"],
        example: { q: "Price rises from $10 to $12, Qd falls from 500 to 450. Calculate PED. [2]", a: "%ΔQd = −10%, %ΔP = +20% → PED = −10/20 = −0.5" },
        checklist: ["Show working (method mark)", "Correct units", "Interpret if asked"] },
      { id: "p1a", type: "Paper 1 part (a)", marks: "10", when: "Explain / Analyse (10 marks)", time: "20-25 min",
        structure: [["Definitions", "Define 2-3 key terms from the question."], ["Diagram 1", "Fully labelled, explained step by step."], ["Diagram 2 / second strand", "A second diagram or a second mechanism if the question has two parts ('two reasons', 'and')."], ["Real-world link", "Optional but helpful: a brief example."], ["Close", "One sentence answering the question (no evaluation needed)."]],
        starters: ["X can be defined as…", "As illustrated in Diagram 1, …", "This causes … which leads to …"],
        example: { q: "Explain why the prices of primary commodities are more volatile than manufactured goods. [10]", a: "Define PED/PES → diagram: inelastic D and S, small supply shift → big price change → explain low PED (necessities) and low PES (time lags) → compare with manufactured goods (elastic S, stocks) with a second diagram → conclude." },
        checklist: ["Accurate, relevant diagram(s)", "Definitions", "Full chain of reasoning", "No evaluation required in (a)"] },
      { id: "p1b", type: "Paper 1 part (b)", marks: "15", when: "Evaluate / Discuss / To what extent (15 marks)", time: "35-40 min",
        structure: [["Introduction", "Define terms; state your line of argument."], ["Theory + diagram", "Explain how the policy/issue works with a diagram."], ["Real-world example(s)", "Specific: country, year, number."], ["Evaluation (CLASP)", "Consequences, Long vs short run, Assumptions, Stakeholders, Priorities - at least 3 points."], ["Conclusion", "Justified judgement: 'to a large extent, because… however it depends on…'."]],
        starters: ["However, this depends on…", "In the short run… whereas in the long run…", "For consumers… but for producers…", "On balance, …"],
        example: { q: "Evaluate the effectiveness of carbon taxes in reducing negative externalities. [15]", a: "Define → externality diagram with tax shifting MPC to MSC → Sweden ~$120/t carbon tax, emissions fell while GDP grew → evaluate: PED inelastic, regressive, valuing external cost, carbon leakage, use of revenue → compare with cap-and-trade → judgement." },
        checklist: ["Diagram used in the argument", "At least one real, specific example", "Balanced evaluation", "Clear final judgement"] },
      { id: "p2h", type: "Paper 2 final question", marks: "15", when: "Using information from the text/data and your knowledge… evaluate", time: "30-35 min",
        structure: [["Intro", "Define key terms; state the strategy/issue."], ["Use the text", "Quote figures and paragraphs explicitly."], ["Theory", "Explain with at least one diagram."], ["Evaluate", "Benefits vs costs for this specific country; alternatives; stakeholders."], ["Conclusion", "Judgement linked to the country's data."]],
        starters: ["Paragraph 3 states that…", "As Table 1 shows, …", "Given the country's high debt (Text B), …"],
        example: { q: "Using the text and your knowledge, evaluate microfinance for development in Country X. [15]", a: "Quote unbanked % and gender data → explain microfinance and poverty cycle → benefits (entrepreneurship, women) → limits (high rates, small scale, commodity dependence) → compare with infrastructure/education → conclusion." },
        checklist: ["Explicit references to the text (at least 3)", "A diagram", "Balanced evaluation", "Judgement specific to the case"] },
    ],
    decoder: [
      { title: "Paper 1 (b) level descriptors (15 marks)", rows: [
        ["Level 5: 13-15", "Wholly relevant; precise definitions; accurate diagrams fully explained; synthesis and evaluation effective and supported by appropriate real-world examples.", "Diagram + example + 3+ evaluative points + judgement.", "Add a second example and a stakeholder/time-period evaluation."],
        ["Level 4: 10-12", "Relevant; good knowledge; diagrams accurate; evaluation is present but may not be fully developed.", "Good essay but evaluation is listed, not weighed.", "Turn each evaluation point into 'this depends on…' reasoning."],
        ["Level 3: 7-9", "Some relevant knowledge; diagrams may have errors; evaluation is limited.", "Mostly description.", "Fix diagram labels; add a real example."],
        ["Level 1-2: 1-6", "Little relevant knowledge; inaccurate diagrams; no evaluation.", "Off-topic or very thin.", "Answer the actual question with a diagram."],
      ] },
      { title: "Markscheme language", rows: [
        ["'Accept / Award'", "Answers that earn the mark", "Your wording may differ - meaning matters.", ""],
        ["'Do not award'", "Common wrong answers", "e.g. 'demand increases' when only price changed.", ""],
        ["'Real-world example'", "Specific to a place and time", "\"Mexico's 2014 soda tax\" not \"some countries tax sugar\".", ""],
        ["'Synthesis'", "Bringing ideas together", "Linking theory, diagram and example into one argument.", ""],
      ] },
    ],
  },
  chem: {
    frameworks: [
      { id: "mcq", type: "Multiple choice (Paper 1A)", marks: "1", when: "Paper 1A", time: "~1.5 min", structure: [["Read the stem", "Underline key words: NOT, MOST, LEAST, correct/incorrect."], ["Predict", "Think of the answer before reading options."], ["Eliminate", "Cross out clearly wrong options; check units and signs."], ["Estimate", "No calculator - round numbers to check orders of magnitude."]], starters: [], example: { q: "Which has the highest boiling point? CH₄, NH₃, H₂O, HF", a: "Predict: hydrogen bonding; H₂O forms the most H-bonds per molecule → H₂O." }, checklist: ["Never leave blank", "Watch for 'NOT'", "Use the data booklet"] },
      { id: "state", type: "State / Identify / Outline", marks: "1-2", when: "State, identify, outline", time: "1 min per mark", structure: [["Point", "One precise fact per mark - no explanation needed for 'state'."]], starters: [], example: { q: "State the shape of NH₃. [1]", a: "Trigonal pyramidal." }, checklist: ["Use correct terminology", "Don't over-write"] },
      { id: "explain", type: "Explain", marks: "2-4", when: "Explain, suggest", time: "1.5 min per mark", structure: [["Cause", "The particle-level reason (forces, electrons, collisions)."], ["Link", "How the cause leads to the effect ('so', 'therefore')."], ["Effect", "The observed property or result."]], starters: ["…because… which means… therefore…"], example: { q: "Explain why Mg has a higher melting point than Na. [3]", a: "Mg²⁺ has a higher charge (and smaller radius) [1]; Mg releases two delocalised electrons per atom [1]; so stronger electrostatic attraction between cations and electrons needs more energy to overcome [1]." }, checklist: ["Particles, not observations", "Compare both substances", "One mark per linked point"] },
      { id: "calc", type: "Calculate", marks: "2-4", when: "Calculate, determine", time: "1.5 min per mark", structure: [["Formula", "Write it (n = m/M, q = mcΔT…)."], ["Substitute", "With units; convert cm³→dm³, °C→K, kPa→Pa."], ["Answer", "Correct s.f. and units; sign for ΔH."]], starters: [], example: { q: "Calculate n of 5.00 g NaOH (M = 40.00). [1]", a: "n = 5.00/40.00 = 0.125 mol" }, checklist: ["ECF protects later marks - show every step", "Don't round early", "Units"] },
      { id: "draw", type: "Draw / Sketch / Annotate", marks: "1-3", when: "Draw Lewis structures, sketch graphs, annotate diagrams", time: "2-3 min", structure: [["Structure", "All atoms, bonds and lone pairs (Lewis), or labelled axes (graphs)."], ["Key features", "Shape of curve, correct position of Ea, peaks, intercepts."]], starters: [], example: { q: "Sketch a Maxwell-Boltzmann distribution and mark Ea. [2]", a: "Curve from origin, skewed peak, tail never touches axis; axes: number of particles vs kinetic energy; Ea marked to the right of the peak." }, checklist: ["Label axes", "Ruler for straight lines", "Lone pairs shown"] },
      { id: "data", type: "Data-based (Paper 1B)", marks: "1-4", when: "Uncertainty, graphs, method evaluation", time: "~1.2 min per mark", structure: [["Read the method", "Identify independent, dependent and controlled variables."], ["Uncertainty", "Half the smallest division (analogue) / ± last digit (digital); % uncertainty = abs ÷ value × 100."], ["Graph", "Gradient = rate; tangent for instantaneous rate."], ["Evaluate", "Systematic vs random error; specific improvement linked to the error."]], starters: ["A systematic error is… which could be reduced by…"], example: { q: "Suggest an improvement to reduce heat loss in calorimetry. [1]", a: "Use a polystyrene cup with a lid (insulation) / extrapolate a cooling curve." }, checklist: ["Specific, practical improvements", "Link improvement to the error"] },
      { id: "compare", type: "Compare / Distinguish", marks: "2-3", when: "Compare, distinguish, contrast", time: "1 min per mark", structure: [["Paired statements", "\"A has…, whereas B has…\" for each point."]], starters: ["…whereas…", "In contrast,…"], example: { q: "Distinguish between a strong and weak acid. [2]", a: "A strong acid dissociates completely in water, whereas a weak acid only partially dissociates [1]; so at the same concentration a strong acid has a lower pH / higher [H⁺] [1]." }, checklist: ["Both substances in every point"] },
    ],
    decoder: [
      { title: "Markscheme notation", rows: [
        ["M / A marks", "Method / answer", "Correct method with a slip still scores M.", "Always show the formula and substitution."],
        ["ECF", "Error carried forward", "A wrong value from (a) used correctly in (b) still earns (b).", "Never skip a later part."],
        ["OWTTE", "Or words to that effect", "Different wording accepted.", ""],
        ["/ (slash)", "Alternative answers", "Either is accepted.", ""],
        ["Underlined words", "Must appear", "The key word is required for the mark.", "Learn the exact keyword (e.g. 'average kinetic energy')."],
        ["IA criteria", "Research design 6 · Data analysis 6 · Conclusion 6 · Evaluation 6", "Shared by all sciences (24 marks).", "See IA & EE page."],
      ] },
    ],
  },
  geo: {
    frameworks: [
      { id: "describe", type: "Describe data / map / graph", marks: "2-3", when: "Describe, identify", time: "1 min per mark", structure: [["Overall trend (G)", "The general pattern in one sentence."], ["Data (I)", "Quote at least two figures with units and dates."], ["Anomaly / change (ST)", "An exception or change in rate."]], starters: ["Overall, … increased from … in … to … in …", "The highest … was … in …, whereas …", "An exception is …"], example: { q: "Describe the change in China's TFR shown in the graph. [3]", a: "Overall TFR fell sharply [1], from about 5.8 in 1970 to 1.7 in 2000 [1]; the fastest decline was 1970-1980, before levelling off below replacement [1]." }, checklist: ["No reasons in 'describe'", "Units with every number", "GIST + data + anomaly"] },
      { id: "explain22", type: "Explain two reasons (2+2)", marks: "4", when: "Explain two…", time: "4-5 min", structure: [["Reason 1", "Point (1)."], ["Development 1", "'because… which means…' + example (1)."], ["Reason 2", "Point (1)."], ["Development 2", "Develop + example (1)."]], starters: ["One reason is…, because…", "A second reason is…, which means…"], example: { q: "Explain two reasons for Japan's ageing population. [2+2]", a: "1. Low fertility: TFR ~1.2, due to late marriage, high living costs and careers, so fewer young people. 2. High life expectancy (~84 years) due to good healthcare and diet, so more people survive into old age." }, checklist: ["Two separate labelled paragraphs", "Each point developed", "A real example"] },
      { id: "suggest", type: "Suggest", marks: "2-4", when: "Suggest reasons/challenges", time: "1 min per mark", structure: [["Plausible idea", "May go beyond the stimulus."], ["Development", "Explain why it is plausible in this context."]], starters: ["A possible reason is… This is likely because…"], example: { q: "Suggest one challenge of Niger's population structure. [3]", a: "High youth dependency: many children need schools and healthcare, straining a low-income budget; if jobs are not created as they reach working age, unemployment may rise (population momentum)." }, checklist: ["Link to the stimulus", "Develop each idea"] },
      { id: "calc", type: "Estimate / Calculate", marks: "1-2", when: "Estimate, calculate", time: "1-2 min", structure: [["Read carefully", "Axes, key and units first."], ["Show working", "Formula, substitution."], ["Answer", "Units, sensible rounding."]], starters: [], example: { q: "Calculate the dependency ratio: 18 m (0-14), 12 m (65+), 50 m (15-64). [2]", a: "(18 + 12) ÷ 50 × 100 = 60" }, checklist: ["Units", "Working shown"] },
      { id: "essay10", type: "10-mark extended response", marks: "10", when: "Examine, discuss, evaluate, to what extent", time: "20-25 min", structure: [["Introduction (3-4 lines)", "Define key terms; state your line of argument ('largely true, but depends on scale and time')."], ["Paragraph 1 (for)", "Point → named case study with 2-3 facts → link to the question."], ["Paragraph 2 (against / other factors)", "Counter-argument with a contrasting case study."], ["Paragraph 3 (evaluation)", "Use evaluation lenses: scale, time, stakeholders, place, evidence."], ["Conclusion (3-4 lines)", "Answer the question directly with a judgement; say what it depends on. No new examples."]], starters: ["At the national scale… however, at the local scale…", "In the short term… but in the long term…", "For governments… whereas for families…", "This applies to HICs like Japan, but less to LICs like Niger.", "It is difficult to judge because other factors also changed."], example: { q: "Evaluate the success of population policies in managing fertility. [10]", a: "Intro: define pro-/anti-natalist; argue anti-natalist policies more 'successful'. For: China one-child (1980-2015) TFR fell sharply. Against: South Korea spent 380+ trillion won since 2006, TFR 0.72 (2023). Evaluate: time - China's ageing and sex ratio 118-120; evidence - fertility also fell due to development. Conclusion: anti-natalist works faster; success depends on time frame." }, checklist: ["Question terms defined", "2+ named case studies", "Specific data", "Both sides", "Evaluation lens", "Clear judgement", "Uses the command term"] },
      { id: "infographic", type: "Paper 2 infographic / visual", marks: "varies", when: "Analyse the visual", time: "~1.2 min per mark", structure: [["Purpose & source", "Who made it and why."], ["Key data", "Main message with figures."], ["Patterns", "Trends and comparisons."], ["Limitations", "Scale, bias, missing data, date."]], starters: ["The infographic shows…", "However, it does not show…"], example: { q: "Analyse the infographic on global food waste. [6]", a: "Main message (1/3 of food wasted), quote two figures, compare regions (waste at consumption in HICs vs production in LICs), limitation (no data on…), conclusion." }, checklist: ["Data quoted", "Limitations considered"] },
    ],
    decoder: [
      { title: "10-mark essay bands (indicative)", rows: [
        ["Band 9-10", "Well-structured, evidence-based, balanced, critical; detailed named and located examples; clear conclusion.", "Top band checklist all ticked.", "Use two evaluation lenses and a judgement."],
        ["Band 7-8", "Relevant knowledge, some evaluation, examples present but less detailed.", "Good but one-sided or thin data.", "Add counter-argument with a second case study."],
        ["Band 5-6", "Mostly descriptive; general examples.", "No real evaluation.", "Add 'however… depends on…' sentences."],
        ["Band 1-4", "Limited knowledge, unsupported generalisations.", "Off-topic or very brief.", "Define terms and give one real example."],
      ] },
      { title: "Short-answer marks", rows: [
        ["1 mark", "Identify / state / estimate", "A word, number or phrase.", ""],
        ["2 marks", "Point + development", "\"…because… which means…\".", ""],
        ["2+2", "Two developed reasons", "Two labelled paragraphs.", ""],
        ["Describe", "Data required", "Quoting figures earns marks.", ""],
      ] },
    ],
  },
  math: {
    frameworks: [
      { id: "writedown", type: "Write down", marks: "1", when: "Write down", time: "<1 min", structure: [["Answer", "Little or no working needed - the answer is obvious from given information."]], starters: [], example: { q: "Write down the y-intercept of y = 2x² − 3x + 5. [1]", a: "(0, 5)" }, checklist: ["Don't waste time on working"] },
      { id: "find", type: "Find / Calculate / Solve", marks: "2-6", when: "Find, calculate, solve", time: "~1.1 min per mark", structure: [["Formula / method", "Write the formula or set up the equation (M1)."], ["Substitute & simplify", "One step per line (A1 for intermediate values)."], ["Answer", "Exact in Paper 1; 3 s.f. in Paper 2; units."]], starters: [], example: { q: "Find the sum of the first 20 terms of 3, 7, 11, … [3]", a: "d = 4 (A1); S₂₀ = 20/2 (2×3 + 19×4) (M1) = 820 (A1)" }, checklist: ["Formula first", "Exact vs 3 s.f.", "Check reasonableness"] },
      { id: "showthat", type: "Show that", marks: "2-4", when: "Show that", time: "~1.1 min per mark", structure: [["Start from the given", "One side, never the answer."], ["Every step", "One algebraic step per line."], ["Arrive exactly", "Final line matches the given result (AG)."]], starters: ["LHS = … = … = RHS (as required)"], example: { q: "Show that (n+1)² − (n−1)² = 4n. [2]", a: "LHS = n² + 2n + 1 − (n² − 2n + 1) (M1) = 4n (A1) = RHS" }, checklist: ["No skipped steps", "Don't work backwards", "No calculator values in P1"] },
      { id: "hence", type: "Hence / Hence or otherwise", marks: "2-5", when: "Hence", time: "~1.1 min per mark", structure: [["Use the previous result", "Quote it explicitly."], ["Apply", "Show how it leads to this answer."]], starters: ["Using part (a), …"], example: { q: "Hence solve 2sin²x − sin x − 1 = 0. [3]", a: "From (a), (2sin x + 1)(sin x − 1) = 0 → sin x = 1 or −½ → x = π/2, 7π/6, 11π/6" }, checklist: ["'Hence' = must use previous part", "Other methods may score 0"] },
      { id: "sketch", type: "Sketch", marks: "2-4", when: "Sketch", time: "3-4 min", structure: [["Shape", "Correct general shape and domain."], ["Key features", "Intercepts, turning points, asymptotes (as equations), endpoints - labelled."]], starters: [], example: { q: "Sketch y = (2x+1)/(x−1). [3]", a: "Two branches; VA x = 1 and HA y = 2 drawn and labelled; intercepts (0, −1) and (−½, 0)." }, checklist: ["Asymptotes as dashed lines with equations", "Axes intercepts labelled", "Domain respected"] },
      { id: "proof", type: "Proof", marks: "3-5", when: "Prove / show that for all…", time: "4-6 min", structure: [["Define", "Let the integers be n, n + 1 …; even = 2k."], ["Manipulate", "Expand, factorise, combine."], ["Conclude", "Sentence: 'since … is an integer, the expression is a multiple of 3'."]], starters: ["Let…", "Since … ∈ ℤ, …"], example: { q: "Prove the sum of three consecutive integers is a multiple of 3. [3]", a: "n + (n+1) + (n+2) = 3n + 3 = 3(n + 1); since n + 1 is an integer, the sum is a multiple of 3." }, checklist: ["Testing numbers is not proof", "Concluding statement (R1)"] },
      { id: "justify", type: "Justify / Explain why (R marks)", marks: "1-2", when: "Justify, explain, reject a value", time: "1 min", structure: [["Reason", "A mathematical sentence: 'since |r| < 1', 'since ln of a negative number is undefined'."]], starters: ["…since…", "Reject x = −5 because…"], example: { q: "Explain why x = −5 is rejected. [1]", a: "log₂(x − 3) is undefined for x = −5 since x − 3 < 0." }, checklist: ["Name the condition explicitly"] },
      { id: "gdc", type: "Paper 2 GDC questions", marks: "2-6", when: "Paper 2", time: "~1.1 min per mark", structure: [["State what you did", "'Using GDC, intersection of y = … and y = …'."], ["Write the set-up", "The integral with limits, the equation, the distribution and parameters."], ["Answer", "3 s.f. (or exact if asked)."]], starters: ["X ~ B(10, 0.3); P(X ≥ 2) = 1 − P(X ≤ 1) = …"], example: { q: "Find the area enclosed by y = eˣ and y = 3 − x². [4]", a: "Intersections from GDC: x = −1.69, 0.834 (A1)(A1); ∫(3 − x² − eˣ) dx between limits (M1) = 2.04 (A1)" }, checklist: ["Write the set-up for M marks", "Radians mode", "3 s.f."] },
      { id: "sectionb", type: "Section B multi-part", marks: "12-16", when: "Long questions", time: "15-18 min", structure: [["Read all parts first", "Later parts often give hints."], ["Use given answers", "If stuck on (a), use the 'show that' result in (b) - follow-through."], ["Keep going", "Each part has independent marks."]], starters: [], example: { q: "(a) show f'(x) = … (b) find stationary points (c) sketch (d) area", a: "Even without (a), use the given f'(x) for (b)-(d)." }, checklist: ["Never stop at a stuck part"] },
    ],
    decoder: [
      { title: "Markscheme codes", rows: [
        ["M1", "Method mark", "For a valid method - even with arithmetic errors.", "Write formula + substitution."],
        ["A1", "Answer mark", "Correct answer, usually depends on M1.", "Exact / 3 s.f."],
        ["(M1)(A1) in brackets", "Implied marks", "Awarded if the correct answer is seen, even without working.", "Still show working - safer."],
        ["R1", "Reasoning", "Clear justification sentence.", "\"since…\""],
        ["AG", "Answer given", "No mark for writing the given answer; marks are for steps.", "Show every line."],
        ["FT", "Follow through", "Wrong earlier answer used correctly later.", "Keep going."],
        ["N marks", "Correct answer, no working", "Often fewer marks than full working.", "Always show working."],
      ] },
      { title: "IA criteria (20 marks)", rows: [["A Presentation 4", "Organised, coherent, concise", "", ""], ["B Mathematical communication 4", "Notation, terminology, graphs, tables", "", ""], ["C Personal engagement 3", "Own ideas, curiosity", "", ""], ["D Reflection 3", "Critical reflection on results and methods", "", ""], ["E Use of mathematics 6", "Relevant, correct, sophisticated maths at SL level", "", ""]] },
    ],
  },
  bio: {
    frameworks: [
      { id: "mcq", type: "Multiple choice (Paper 1A)", marks: "1", when: "Paper 1A", time: "~1.5 min", structure: [["Key words", "Underline NOT, MOST, CORRECT."], ["Predict", "Answer before reading options."], ["Half-true traps", "Check each part of each option."]], starters: [], example: { q: "Which process requires ATP?", a: "Predict 'active transport' → find it." }, checklist: ["Never leave blank"] },
      { id: "outline", type: "State / Outline", marks: "1-3", when: "State, outline, list", time: "1 min per mark", structure: [["One point per mark", "Brief, precise, using keywords."]], starters: [], example: { q: "Outline the role of cholesterol in membranes. [1]", a: "Regulates fluidity (restricts phospholipid movement)." }, checklist: ["Keywords", "No essay"] },
      { id: "graph", type: "Describe a graph / data", marks: "2-3", when: "Describe the trend", time: "1 min per mark", structure: [["Trend", "Overall pattern."], ["Data", "Quote values with units."], ["Change in rate / anomaly", "Where it levels off, peaks or reverses."]], starters: ["As … increases, … increases until …, then …"], example: { q: "Describe the effect of temperature on enzyme activity. [3]", a: "Rate increases from 10 to 40 °C [1], peaks at 40 °C (optimum) at 8.5 units [1], then falls sharply to zero by 60 °C [1]." }, checklist: ["Quote numbers", "No explanation unless asked"] },
      { id: "explain", type: "Explain", marks: "2-4", when: "Explain", time: "1.5 min per mark", structure: [["Cause", "Biological mechanism with keywords."], ["Effect", "Link with 'so / therefore / which means'."]], starters: ["…because… so…"], example: { q: "Explain why enzyme activity falls above the optimum. [3]", a: "Bonds in the tertiary structure break [1]; active site changes shape (denaturation) [1]; substrate no longer fits, fewer enzyme-substrate complexes [1]." }, checklist: ["Keywords", "Cause → effect chain"] },
      { id: "distinguish", type: "Distinguish / Compare and contrast", marks: "2-4", when: "Distinguish, compare, compare and contrast", time: "1 min per mark", structure: [["Table or paired sentences", "Feature | A | B - each row a mark."], ["'Compare' needs similarities", "At least one similarity for compare and contrast."]], starters: ["…whereas…", "Both…"], example: { q: "Distinguish between DNA and RNA. [3]", a: "Deoxyribose vs ribose; thymine vs uracil; double vs single stranded." }, checklist: ["Both sides each time", "Similarity if 'compare'"] },
      { id: "calc", type: "Calculate", marks: "1-2", when: "Calculate, determine", time: "1-2 min", structure: [["Working", "Formula and substitution."], ["Answer", "Units, sensible d.p."]], starters: [], example: { q: "Calculate magnification: image 30 mm, actual 3 µm. [2]", a: "30 000 ÷ 3 = ×10 000" }, checklist: ["Unit conversion", "Units in answer"] },
      { id: "draw", type: "Draw / Annotate", marks: "2-4", when: "Draw, label, annotate", time: "3-4 min", structure: [["Clear outline", "Sharp pencil, no shading."], ["Labels", "Ruled lines, correct names; annotations add function."]], starters: [], example: { q: "Draw and label a nucleotide. [2]", a: "Pentagon sugar, circle phosphate (C5), rectangle base (C1); all labelled." }, checklist: ["Ruled label lines", "Proportions sensible"] },
      { id: "extended", type: "Extended response (Section B)", marks: "7-8", when: "Explain / describe / outline (long)", time: "10-12 min", structure: [["Plan", "List 8-10 distinct points before writing."], ["Organise", "Logical order; one idea per sentence; keywords."], ["Example", "A named organism or example where relevant."], ["Communication", "Clear and coherent - may earn an extra mark."]], starters: [], example: { q: "Explain the theory of evolution by natural selection. [7]", a: "Variation → heritable → overproduction → competition → survival of better adapted → reproduce → allele frequency changes → example (antibiotic resistance)." }, checklist: ["More points than marks", "Keywords", "Named example"] },
      { id: "data", type: "Data-based (Paper 1B / 2A)", marks: "varies", when: "Unfamiliar data", time: "~1 min per mark", structure: [["Read the context", "Organism, variables, units."], ["Use the data", "Quote values; calculate differences/%."], ["Apply knowledge", "Explain using syllabus concepts in the new context."], ["Evaluate", "Sample size, controls, correlation ≠ causation, error bars/SD overlap."]], starters: ["The data show… however, the sample size is small…"], example: { q: "Evaluate the claim that drug X lowers blood pressure. [3]", a: "Mean fell by 12 mmHg vs 3 in placebo; but n = 20 only and SD bars overlap; correlation not proof of causation; need repeat/larger trial." }, checklist: ["Use given numbers", "Consider reliability"] },
    ],
    decoder: [
      { title: "Markscheme conventions", rows: [
        ["; (semicolon)", "Separates mark points", "Each point between semicolons = 1 mark.", ""],
        ["/ (slash)", "Alternatives", "Either answer accepted.", ""],
        ["Reject", "Answers that score 0", "e.g. 'energy produced'.", "Say 'released'."],
        ["Max", "Maximum marks", "More points than max = safety net, not bonus.", ""],
        ["Quality of communication", "Extended response", "Logical, coherent answer can earn an extra mark.", "Plan first."],
        ["IA criteria", "Research design 6 · Data analysis 6 · Conclusion 6 · Evaluation 6", "Shared science criteria (24 marks).", "See IA & EE page."],
      ] },
    ],
  },
  engb: {
    frameworks: [
      { id: "formal-letter", type: "Formal letter", marks: "30", when: "Paper 1", time: "75 min", structure: [["Layout", "Your address, date, recipient's address."], ["Salutation", "Dear Sir or Madam / Dear Mr Lee."], ["Paragraph 1", "Who you are and why you are writing."], ["Body (2-3)", "Each paragraph one point with details/examples."], ["Final paragraph", "Request or call to action; thanks."], ["Closing", "Yours faithfully / Yours sincerely + full name."]], starters: ["I am writing to express my concern about…", "I would be grateful if you could…", "I look forward to hearing from you."], example: { q: "Letter to the editor about overtourism.", a: "Dear Editor, → purpose → impact on residents → proposals (cap, tourist tax, alternative routes) → call to action → Yours faithfully." }, checklist: ["No contractions", "Formal register throughout", "Correct closing"] },
      { id: "email", type: "Email (formal/informal)", marks: "30", when: "Paper 1", time: "75 min", structure: [["Header", "To / Subject line."], ["Greeting", "Dear… / Hi…"], ["Purpose", "First line states why."], ["Body", "Organised paragraphs."], ["Sign-off", "Kind regards / Best wishes + name."]], starters: ["I hope this email finds you well.", "I'm writing to let you know…"], example: { q: "Email to a sports centre asking for student discounts.", a: "Subject: Request for student membership rates → greeting → purpose → benefits for centre → proposal → thanks → Kind regards, name." }, checklist: ["Subject line", "Register matches recipient"] },
      { id: "article", type: "Article / opinion column", marks: "30", when: "Paper 1", time: "75 min", structure: [["Headline", "Catchy, relevant (+ subheading)."], ["By-line", "By [name]."], ["Lead", "Hook: question, anecdote, statistic."], ["Body", "Subheadings; facts, quotes, examples."], ["Conclusion", "Memorable final thought / call to action."]], starters: ["Have you ever wondered…?", "According to a recent survey, …", "So next time you…"], example: { q: "Article: why teenagers should learn to cook.", a: "Headline → by-line → anecdote hook → health → independence → budget → culture → conclusion." }, checklist: ["Headline + by-line", "Engaging register", "Subheadings"] },
      { id: "speech", type: "Speech", marks: "30", when: "Paper 1", time: "75 min", structure: [["Greeting", "Good morning, principal, teachers and fellow students."], ["Hook + purpose", "Question or anecdote; 'Today I want to talk about…'."], ["Three signposted points", "Firstly… Secondly… Finally…"], ["Rhetoric", "Rhetorical questions, tricolon, repetition, inclusive 'we'."], ["Call to action + thanks", "Thank you for listening."]], starters: ["Imagine…", "Let's be honest: …", "Together, we can…"], example: { q: "Speech: individual climate actions matter.", a: "Greeting → hook statistic → three actions with impact → rebut 'too small to matter' → call to action → thanks." }, checklist: ["Audience greeting", "Spoken features", "Ending with thanks"] },
      { id: "blog", type: "Blog / diary", marks: "30", when: "Paper 1", time: "75 min", structure: [["Title + date", "Blog title / diary date."], ["Personal hook", "Anecdote, feelings."], ["Body", "Narrate → describe → reflect."], ["Ending", "Reflection; blog: invite comments."]], starters: ["You won't believe what happened…", "Looking back, I realise…"], example: { q: "Travel blog about a festival.", a: "Title → date → vivid scene → cultural insight → personal reflection → 'Have you been? Tell me in the comments!'" }, checklist: ["First person", "Reflection, not just narration"] },
      { id: "proposal-report", type: "Proposal / report", marks: "30", when: "Paper 1", time: "75 min", structure: [["Heading", "Title; To / From / Date / Subject."], ["Introduction", "Purpose."], ["Sections with headings", "Background / Findings / Proposal / Benefits."], ["Recommendations", "Bullet points."], ["Conclusion", "Summary and request."]], starters: ["The purpose of this report is to…", "It is recommended that…", "Based on the findings, …"], example: { q: "Report on cafeteria plastic.", a: "Title → introduction → method (survey) → findings with data → conclusions → recommendations." }, checklist: ["Headings", "Impersonal register", "Recommendations"] },
      { id: "review", type: "Review", marks: "30", when: "Paper 1", time: "75 min", structure: [["Title", "Name of the work."], ["Details", "Director/author, genre, where/when."], ["Summary", "Brief, no spoilers."], ["Evaluation", "Strengths and weaknesses with examples."], ["Recommendation", "Who should see it; rating."]], starters: ["If you enjoy…, you will love…", "What really stands out is…", "However, it falls short when…"], example: { q: "Review a film about technology.", a: "Title → details → premise → acting/visuals → message → weakness → 4/5 recommendation." }, checklist: ["Evaluation, not just plot", "Rating/recommendation"] },
      { id: "interview", type: "Interview", marks: "30", when: "Paper 1", time: "75 min", structure: [["Title + introduction", "Who the interviewee is and why they matter."], ["Q&A", "Names/initials before each turn; natural speech."], ["Closing", "Final question, thanks."]], starters: ["Q: What inspired you to…?", "A: Honestly, it started when…"], example: { q: "Interview with a young volunteer.", a: "Intro paragraph → 6-8 questions on motivation, challenges, advice → thanks." }, checklist: ["Q&A format", "Spoken register"] },
      { id: "tf", type: "Paper 2: True/False + justification", marks: "1", when: "Reading", time: "1 min", structure: [["Decide", "True or false."], ["Justify", "Copy the shortest exact words that prove it."]], starters: [], example: { q: "Tourists visit the early market. T/F", a: "False - 'long before the tourists wake up'." }, checklist: ["Both parts needed", "Exact words"] },
      { id: "short", type: "Paper 2: short answer / reference", marks: "1", when: "Reading / listening", time: "1 min", structure: [["Locate", "Find the part of the text."], ["Answer briefly", "Lift exact words when they answer precisely."]], starters: [], example: { q: "What does 'It' refer to?", a: "The nearest matching noun: 'the museum'." }, checklist: ["Short", "Grammatically fits"] },
      { id: "io", type: "Individual oral (HL)", marks: "30", when: "IO", time: "12-15 min", structure: [["Context", "Where the extract sits in the work."], ["Content", "What happens / what is said."], ["Analysis", "2-3 techniques with quotes and effects."], ["Theme link", "Connect to a course theme."], ["Personal response", "Your interpretation."]], starters: ["This extract is taken from…", "The writer uses… to convey…", "This links to the theme of… because…"], example: { q: "Present an extract linked to Identities.", a: "Context → summary → imagery + dialogue → theme link → personal response." }, checklist: ["Max 10 bullet notes", "Interact naturally"] },
    ],
    decoder: [
      { title: "Paper 1 criteria decoded", rows: [
        ["A Language 10-12", "Varied and idiomatic vocabulary; complex structures used effectively; errors do not impede communication.", "Ambitious + accurate.", "Learn 30 topic words and 10 complex structures per theme."],
        ["A Language 7-9", "Effective vocabulary, some complex structures, occasional errors.", "Good but safe.", "Add conditionals, passives, inversion."],
        ["B Message 10-12", "Relevant, well-developed ideas; clear, coherent structure; effective cohesive devices.", "Every paragraph developed with examples.", "Plan 4-6 paragraphs."],
        ["C Conceptual understanding 5-6", "Text type fully appropriate; register and tone consistently appropriate; conventions clear.", "Layout + register + purpose.", "Open with the layout features."],
      ] },
      { title: "IO criteria (30)", rows: [["A Language 12", "", "", ""], ["B1 Message: literary extract 6", "", "", ""], ["B2 Message: conversation 6", "", "", ""], ["C Interactive skills 6", "", "", ""]] },
    ],
  },
  chia: {
    frameworks: [
      { id: "p1", type: "試卷一：引導性文本分析", marks: "20", when: "試卷一", time: "75分鐘", structure: [["引言", "文本類型、來源、受眾、目的、中心論點（回應引導問題）。"], ["分析段落一", "主題句 → 引用 → 手法 → 效果 → 扣題。"], ["分析段落二", "另一角度（語言／結構／視覺／語氣）。"], ["分析段落三", "再一角度，可評價手法的局限。"], ["結論", "總結各手法如何共同達到目的，作出評價。"]], starters: ["這篇［文本類型］以［受眾］為對象，旨在……", "作者透過……營造……的氛圍，令讀者……", "由此可見，……", "然而，此手法亦可能……"], example: { q: "引導問題：作者如何運用語言與結構吸引都市讀者？", a: "引言點出快慢對比的中心論點 → 段一分析標題與短句節奏 → 段二分析祈使句與第二人稱 → 段三分析細節與雙關結尾 → 結論評價情感訴求的效果。" }, checklist: ["每段有引用", "手法連繫效果與目的", "結論有評價"] },
      { id: "p2", type: "試卷二：比較論文", marks: "30", when: "試卷二", time: "105分鐘", structure: [["引言", "界定題目關鍵詞；介紹兩部作品；比較性中心論點。"], ["比較段落 ×3", "比較點 → 作品甲 → 作品乙 → 異同的意義 → 扣題。"], ["結論", "總結異同，回應題目，整體評價。"]], starters: ["兩部作品皆……，但……", "相較之下，……", "與此不同的是，……", "綜上所述，……"], example: { q: "作品如何呈現人物在傳統與現代之間的掙扎？", a: "引言界定「傳統與現代」→ 段一比較人物塑造 → 段二比較敘述角度 → 段三比較象徵意象 → 結論。" }, checklist: ["逐點比較", "比較詞", "兩部作品都有具體引文"] },
      { id: "para", type: "分析段落（PETAL 結構）", marks: "—", when: "所有分析寫作", time: "8-10分鐘／段", structure: [["P 論點", "主題句，回應問題。"], ["E 證據", "簡短引用原文。"], ["T 手法", "指出寫作手法。"], ["A 分析", "說明效果與意義。"], ["L 連結", "扣回中心論點／題目。"]], starters: ["作者以「……」一句……", "此處運用……，凸顯……", "這呼應了全文……的主旨。"], example: { q: "分析「城市在深夜裡嘆息」。", a: "論點：作者以擬人呈現都市的疲憊。證據：「城市在深夜裡嘆息」。手法：擬人。分析：賦予城市人的情感，令讀者感受孤獨與壓力。連結：呼應全文對現代生活節奏的反思。" }, checklist: ["引而必析", "效果具體"] },
      { id: "intro", type: "引言寫法", marks: "—", when: "試卷一／二", time: "5分鐘", structure: [["語境", "文本類型、作者／來源、受眾。"], ["目的", "作者想達到什麼。"], ["中心論點", "一句話說明作者如何達到目的（手法 + 效果）。"]], starters: ["這則［類型］由［來源］發布，以［受眾］為對象……", "作者透過……與……，……"], example: { q: "公益海報引言", a: "這張由慈善機構發布的海報，以一般市民為受眾，旨在呼籲捐出剩食。作者透過空碗的視覺象徵與「你／她」的對比標語，把個人浪費與他人飢餓連結起來，觸動讀者的同理心。" }, checklist: ["不超過5句", "有明確中心論點"] },
      { id: "io", type: "個人口試 IO", marks: "40", when: "IO", time: "10分鐘陳述 + 5分鐘問答", structure: [["引言（1分鐘）", "全球性問題 + 兩個文本。"], ["文學節選（4分鐘）", "內容 → 手法 → 如何呈現問題 → 連繫整部作品。"], ["非文學節選（4分鐘）", "同上，連繫整套文本。"], ["總結（1分鐘）", "比較兩者角度。"]], starters: ["我選擇的全球性問題是……", "在這段節選中，作者透過……", "相比之下，非文學文本則……"], example: { q: "全球性問題：科技如何改變人際關係", a: "文學：小說中主角與家人的短訊對話節選；非文學：手機廣告系列。比較：虛構敘事呈現疏離 vs 廣告營造「連結」的假象。" }, checklist: ["提綱 ≤10 點", "連繫整體作品", "自然表達，非背稿"] },
    ],
    decoder: [
      { title: "試卷一 評分準則解讀（各5分）", rows: [
        ["A 理解與詮釋 5", "對文本有深入而具說服力的理解，詮釋有充分證據支持。", "說出隱含意義並引證。", "每個詮釋配一個引用。"],
        ["B 分析與評價 5", "深入分析作者選擇如何塑造意義，並作出有見地的評價。", "手法 → 效果 → 意義 + 評價。", "加入「然而……可能……」的評價句。"],
        ["C 焦點與組織 5", "論述集中、結構清晰、段落之間連貫。", "中心論點貫穿全文。", "每段末句扣題。"],
        ["D 語言 5", "語言清晰準確，句式多樣，語域恰當。", "學術語言 + 術語。", "使用分析動詞庫。"],
      ] },
      { title: "試卷二 評分準則（30分）", rows: [["A 知識、理解與詮釋 10", "", "", ""], ["B 分析與評價 10", "", "", ""], ["C 焦點與組織 5", "", "", ""], ["D 語言 5", "", "", ""]] },
    ],
  },
};

/* Physics frameworks (same layout as the other sciences). */
IB.frameworks.phys = {
  frameworks: [
    { id: "mcq", type: "Multiple choice (Paper 1A)", marks: "1", when: "Paper 1A", time: "~1.5 min",
      structure: [["Read the stem", "Underline NOT, MOST, LEAST; note units and powers of ten."], ["Estimate", "No calculator: round numbers (g ≈ 10) to find the order of magnitude."], ["Units check", "Eliminate options with the wrong units or dimensions."], ["Limiting cases", "Test an extreme (θ = 0, m → ∞) to rule options out."]],
      starters: [], example: { q: "A ball is thrown horizontally at 10 m s⁻¹ from 20 m. Time to land?", a: "Vertical motion only: 20 = ½(10)t² → t = 2 s." },
      checklist: ["Never leave blank", "Watch for 'NOT'", "Use the data booklet"] },
    { id: "calc", type: "Calculate / Determine", marks: "2-4", when: "Calculate, determine, show that", time: "1.5 min per mark",
      structure: [["Formula", "Write the data-booklet equation first (often M1)."], ["SI units", "Convert: km → m, g → kg, mA → A, °C → K, eV → J."], ["Substitute", "Show numbers in the formula."], ["Answer", "Unit + sensible significant figures (2-3)."]],
      starters: ["Using v² = u² + 2as: …"], example: { q: "Calculate the KE of a 0.50 kg ball at 6.0 m s⁻¹. [2]", a: "Ek = ½mv² = ½ × 0.50 × 6.0² = 9.0 J." },
      checklist: ["ECF protects later marks", "Don't round early", "Unit on every answer"] },
    { id: "showthat", type: "Show that", marks: "2-3", when: "Show that … is about …", time: "1 min per mark",
      structure: [["Every step", "Formula, substitution and the unrounded result."], ["Extra s.f.", "Give one more significant figure than the value shown."]],
      starters: [], example: { q: "Show that the period is about 2 s for l = 1.0 m. [2]", a: "T = 2π√(1.0/9.81) = 2.006 s ≈ 2 s." },
      checklist: ["Never just restate the given value", "Use the value given in later parts"] },
    { id: "explain", type: "Explain / Outline", marks: "2-4", when: "Explain, outline, suggest", time: "1.5 min per mark",
      structure: [["Principle", "Name the law or principle (Newton's 2nd law, conservation of energy, Lenz's law)."], ["Link", "Apply it to this situation step by step ('so', 'therefore')."], ["Conclusion", "State the effect asked for."]],
      starters: ["By conservation of momentum, …", "…so the resultant force…"], example: { q: "Explain why a parachutist reaches terminal velocity. [3]", a: "Drag increases with speed [1]; eventually drag equals weight [1]; resultant force zero so acceleration zero, constant velocity [1]." },
      checklist: ["Name the physics principle", "One linked point per mark"] },
    { id: "draw", type: "Draw / Sketch graphs and diagrams", marks: "1-3", when: "Sketch, draw, label", time: "2-3 min",
      structure: [["Axes", "Labelled with quantity and unit."], ["Shape", "Correct curve: straight line, inverse, exponential, sinusoidal."], ["Key points", "Intercepts, asymptotes, peaks, relative values."]],
      starters: [], example: { q: "Sketch the x-t graph of an object in SHM starting at maximum displacement. [2]", a: "Cosine curve starting at +x₀, constant amplitude, constant period." },
      checklist: ["Free-body arrows from the centre of mass", "Ruler for straight lines"] },
    { id: "data", type: "Data-based (Paper 1B)", marks: "1-4", when: "Uncertainty, graphs, method evaluation", time: "~1.2 min per mark",
      structure: [["Variables", "Independent, dependent, controlled."], ["Uncertainty", "Absolute, fractional and %; add % for products/quotients."], ["Graph", "Gradient (large triangle), intercept, linearise (e.g. T² vs l)."], ["Evaluate", "Random vs systematic error; specific improvement."]],
      starters: ["The gradient of the graph equals …"], example: { q: "l = 50.0 ± 0.1 cm. Find the % uncertainty. [1]", a: "0.1/50.0 × 100 = 0.2%." },
      checklist: ["Error bars both directions", "Max/min gradient lines for uncertainty in gradient"] },
    { id: "compare", type: "Compare / Distinguish", marks: "2-3", when: "Compare, distinguish, contrast", time: "1 min per mark",
      structure: [["Paired statements", "\"A …, whereas B …\" for each point."]],
      starters: ["…whereas…"], example: { q: "Distinguish between transverse and longitudinal waves. [2]", a: "Transverse: oscillations perpendicular to energy transfer, whereas longitudinal: oscillations parallel to energy transfer." },
      checklist: ["Both sides in every point"] },
  ],
  decoder: [{ title: "Markscheme notation", rows: [["M / A marks", "Method / answer", "Correct method with a slip still scores M.", "Always write the formula and substitution."], ["ECF", "Error carried forward", "A wrong value from (a) used correctly later still earns marks.", "Never skip a later part."], ["OWTTE", "Or words to that effect", "Different wording accepted.", ""], ["Allow / Do not allow", "Accepted and rejected answers", "Shows the boundary of acceptable answers.", "Read the 'do not allow' list - they are common mistakes."], ["Units", "Missing or wrong unit", "Often loses the final A mark.", "Unit on every final answer."], ["IA criteria", "Research design 6 · Data analysis 6 · Conclusion 6 · Evaluation 6", "Shared by all sciences (24 marks).", "See IA & EE page."]] }],
};

/* Cantonese one-line summaries for each framework type (used in the 答題框架 section of the notes). */
IB.frameYue = {
  def: "定義題：核心意思 + 精準修飾語，兩分就到手。",
  dia4: "圖表題：先畫圖（軸、曲線、移動箭咀、均衡點），再解釋原因同過程。",
  calc: "計算題：先寫公式，再代數（換 SI 單位），最後答案加單位同有效數字。",
  p1a: "Paper 1 (a)：定義 → 畫圖 → 解釋理論 → 例子，唔使評估。",
  p1b: "Paper 1 (b)：定義 + 圖 + 理論 + 真實例子 + 評估（CLASP）+ 有條件嘅結論。",
  p2h: "Paper 2 最後一題：一定要引用文本同數據，用理論分析，再評估同結論。",
  mcq: "選擇題：先估答案再睇選項，用單位同極端情況刪走錯嘅。",
  state: "State 題：一分一個準確事實，唔使解釋。",
  explain: "解釋題：原因 → 連接（所以／因此）→ 結果，一分一個連貫論點。",
  draw: "畫圖題：軸要有標籤同單位，形狀正確，標出關鍵點。",
  data: "數據題：認清變數，計不確定度，用斜率／截距，評估誤差同具體改善方法。",
  compare: "比較題：每一點都要兩邊都講，用「而」連接。",
  describe: "描述數據：講整體趨勢 + 引用數據 + 指出異常值。",
  explain22: "解釋兩個原因：每個原因 1 分指出 + 1 分發展（點樣導致結果）。",
  suggest: "Suggest 題：提出合理原因，要連返題目嘅情境。",
  essay10: "10 分長答：引言、兩至三段有實例同數據嘅分析、評估、結論。",
  infographic: "資訊圖題：先讀標題同圖例，引用具體數字，再解釋。",
  writedown: "Write down：直接寫答案，唔使步驟。",
  find: "Find／Calculate：清楚寫出步驟，最後答案準確到 3 個有效數字。",
  showthat: "Show that：每一步都要寫，唔可以直接抄答案；答案比題目多一位有效數字。",
  hence: "Hence：一定要用上一題嘅結果。",
  sketch: "Sketch：標出截距、漸近線、轉折點同大概形狀。",
  proof: "證明題：清楚列出每一步，最後要寫結論句。",
  justify: "Justify／R 分：用數學理由支持答案，例如導數符號。",
  gdc: "Paper 2 計數機題：寫出用咗咩功能同輸入，答案 3 個有效數字。",
  sectionb: "Section B：分題之間有連繫，前面答錯都要繼續做（ECF）。",
  outline: "Outline：簡單講出重點，每分一點。",
  graph: "描述圖表：趨勢 + 數據 + 單位 + 例外情況。",
  distinguish: "分辨題：一點一對，兩邊都要講。",
  extended: "長答題：先列大綱，每分一個要點，用正確生物學術語。",
};

/* The 答題框架 for a topic: its own hand-written frames first, then the subject's frameworks that match
   the question types used in this topic. */
IB.topicFrames = function (t) {
  const F = IB.frameworks[t.subject];
  const own = (t.frame || []).slice();
  if (!F) return own;
  const qs = t.questions || [];
  const has = (fn) => qs.some(fn);
  const want = [];
  const add = (...ids) => ids.forEach((id) => { if (!want.includes(id) && F.frameworks.some((f) => f.id === id)) want.push(id); });
  if (has((q) => q.type === "mcq")) add("mcq");
  if ((t.terms || []).length) add("def", "state", "outline", "writedown");
  if (has((q) => q.numeric)) add("calc", "find", "showthat");
  if ((t.diagrams || []).length) add("dia4", "draw", "sketch");
  if (has((q) => q.type === "extended")) add("p1b", "essay10", "extended", "sectionb", "p1", "p2");
  add("explain", "explain22", "describe", "proof", "compare", "distinguish", "data", "article", "para");
  const pick = want.slice(0, Math.max(2, 4 - own.length)).map((id) => F.frameworks.find((f) => f.id === id));
  return own.concat(pick.map((f) => ({
    type: `${f.type} [${f.marks}]`,
    steps: (f.structure || []).map(([h, b]) => `<strong>${h}</strong>: ${b}`).concat(f.checklist && f.checklist.length ? [`<em>Check:</em> ${f.checklist.join(" · ")}`] : []),
    yue: (IB.frameYue || {})[f.id] || "",
  })));
};
