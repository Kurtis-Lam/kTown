/* Economics SL - exam-focused extras: game plan, how-to-answer methods, traps, tips, diagrams. */
(function () {
  // reusable diagram builders (axes: price/quantity or price level/real GDP)
  const sd = (title, extra) => Object.assign({ title, x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Q", yLabel: "P" }, extra);
  const D = (a, b, label, color, dash) => ({ from: [1, a], to: [9, b], label, color, dash });
  IB.extend("econ", {
    gameplan: {
      intro: "SL: <strong>Paper 1</strong> (1h 15m) = one essay: part (a) 10 marks + part (b) 15 marks. <strong>Paper 2</strong> (1h 45m, 40 marks) = data response. Roughly <strong>2 minutes per mark</strong> - spend ~25 min on 1(a) and ~40 min on 1(b).",
      rows: [
        ["Paper 1 (a) - 10 marks", "Explain/analyse with a diagram", "Define key terms → draw a fully labelled diagram → explain the chain of cause and effect step by step. No evaluation needed."],
        ["Paper 1 (b) - 15 marks", "Evaluate / discuss / to what extent", "Theory + diagram + <strong>real-world example(s)</strong> + balanced evaluation (CLASP) + a justified conclusion."],
        ["Paper 2 definitions", "2 marks each", "Precise textbook definition - learn them word-for-word."],
        ["Paper 2 diagrams + explain", "4 marks", "2 for an accurate labelled diagram, 2 for linked explanation using the text."],
        ["Paper 2 final question", "15 marks", "Use the text AND your knowledge. Quote the data (\"paragraph 3 shows…\")."],
      ],
      codes: [
        ["Definition", "2 marks", "1 for the core idea, 1 for precision (e.g. \"ceteris paribus\", \"in a given time period\")."],
        ["Diagram", "usually 2 of 4", "Axes, curves, shifts with arrows, initial and new equilibrium all labelled."],
        ["Level 5 (13-15)", "Paper 1 (b)", "Relevant theory, precise definitions, accurate diagram, examples, and balanced, supported evaluation."],
        ["CLASP", "evaluation checklist", "Consequences · Long/short run · Assumptions · Stakeholders · Priorities."],
      ],
      habits: [
        "<strong>Every essay needs a diagram</strong> - and refer to it in your writing (\"as shown, S shifts from S₁ to S₂…\").",
        "<strong>Label macro axes</strong> \"Average price level\" and \"Real GDP\" - never P and Q.",
        "<strong>Define the key terms in the question</strong> in your first paragraph.",
        "<strong>Use real, specific examples</strong> with country, year and a number.",
        "<strong>Explain the chain</strong>: cause → change in a curve → new equilibrium → effect on stakeholders.",
        "<strong>Evaluate, don't just list</strong>: \"this depends on PED…\", \"in the short run… but in the long run…\".",
        "<strong>Conclude with a judgement</strong> that answers the question directly.",
        "<strong>Use the text</strong> in Paper 2 - quote figures and paragraphs.",
      ],
    },
    topics: {
      "econ-1": {
        methods: ["<strong>Opportunity cost on a PPC:</strong> show the movement between two points with arrows on both axes and state the units given up.", "<strong>Actual vs potential growth:</strong> point inside → onto the curve (actual); curve shifts outward (potential)."],
        traps: ["Confusing a movement inside → onto the PPC (using idle resources) with an outward shift.", "Calling a statement positive just because it contains a number - \"should\" makes it normative."],
        tips: ["A concave PPC shows increasing opportunity cost - say why (resources are not equally suited to all uses)."],
        diagrams: [{ title: "PPC: outward shift = potential growth; A → B = actual growth", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Consumer goods", yLabel: "Capital goods", curves: [{ f: (x) => (x <= 7 ? 7 * Math.sqrt(1 - (x / 7) ** 2) : NaN), label: "PPC₁", labelX: 5.6 }, { f: (x) => (x <= 9 ? 9 * Math.sqrt(1 - (x / 9) ** 2) : NaN), color: "b", label: "PPC₂", labelX: 7.6 }], points: [{ at: [3, 3], label: "A" }, { at: [4.2, 5.6], label: "B" }] }],
      },
      "econ-2": {
        methods: ["<strong>Movement vs shift:</strong> own price change → movement (\"quantity demanded\"); anything else → shift (\"demand\").", "<strong>Diagram chain:</strong> which curve? → which direction? → new P and Q → explain the shortage/surplus that moves the price."],
        traps: ["Saying \"demand increases\" when price falls - it's quantity demanded.", "Shifting both curves when only one is affected."],
        tips: ["Name the determinant precisely: \"a fall in the price of a complement\", not \"cheaper related goods\"."],
        diagrams: [sd("Increase in demand: D₁ → D₂, P and Q rise", { lines: [D(9, 1, "D₁"), { from: [2.5, 9.5], to: [9.5, 2.5], label: "D₂", color: "b" }, { from: [1, 1], to: [9, 9], label: "S", color: "c" }, { from: [0, 5], to: [5, 5], dash: true, color: "muted", label: "P₁", labelAt: "start" }, { from: [0, 6], to: [6, 6], dash: true, color: "muted", label: "P₂", labelAt: "start" }], points: [{ at: [5, 5] }, { at: [6, 6] }] })],
      },
      "econ-3": {
        methods: ["<strong>Price mechanism answers:</strong> use the three functions by name - signalling, incentive, rationing.", "<strong>Surplus calculations:</strong> area of triangle = ½ × base × height; identify the vertices from the diagram."],
        traps: ["Forgetting to explain how the shortage/surplus is eliminated.", "Mixing up consumer and producer surplus areas."],
        tips: ["Allocative efficiency: MB = MC (MSB = MSC) where community surplus is maximised."],
        diagrams: [sd("Consumer surplus (above P*) and producer surplus (below P*)", { lines: [D(9, 1, "D"), { from: [1, 1], to: [9, 9], label: "S", color: "c" }, { from: [0, 5], to: [5, 5], dash: true, color: "muted", label: "P*", labelAt: "start" }], texts: [{ at: [2.2, 6.2], text: "CS" }, { at: [2.2, 3.4], text: "PS" }], points: [{ at: [5, 5] }] })],
      },
      "econ-4": {
        methods: ["<strong>Behavioural answers:</strong> name the bias → explain how it leads to a non-utility-maximising choice → name a nudge that addresses it."],
        traps: ["Describing a nudge that is actually a ban or tax - nudges keep all options open."],
        tips: ["Good examples: UK pension auto-enrolment, organ donation opt-out, calorie labelling, cafeteria layout."],
      },
      "econ-5": {
        formulas: ["\\(PED = \\frac{\\%\\Delta Q_d}{\\%\\Delta P}\\)", "\\(YED = \\frac{\\%\\Delta Q_d}{\\%\\Delta Y}\\)", "\\(PES = \\frac{\\%\\Delta Q_s}{\\%\\Delta P}\\)", "\\(\\%\\Delta = \\frac{new - old}{old}\\times 100\\)"],
        table: { head: ["Value", "PED", "YED", "PES"], rows: [["> 1", "price elastic", "normal, luxury", "elastic"], ["0 to 1", "price inelastic", "normal, necessity", "inelastic"], ["< 0", "(ignore sign)", "inferior good", "-"]] },
        methods: ["<strong>Calculation layout:</strong> formula → %ΔQ and %ΔP with signs → answer to 2 d.p. → interpret in words.", "<strong>Revenue test:</strong> inelastic → raise price raises TR; elastic → cut price raises TR.", "<strong>Primary commodities:</strong> low PED + low PES → large price swings from small shifts."],
        traps: ["Giving elasticity units or a % sign.", "Using absolute changes instead of % changes.", "Calling YED of 0.6 a luxury (it's a necessity)."],
        tips: ["Link PED to tax incidence and revenue in policy essays."],
        diagrams: [sd("Inelastic demand: a big price rise, a small fall in Q", { lines: [{ from: [3, 9.5], to: [5, 0.5], label: "D (inelastic)" }, { from: [0, 3], to: [4.45, 3], dash: true, color: "muted", label: "P₁", labelAt: "start" }, { from: [0, 7], to: [3.55, 7], dash: true, color: "muted", label: "P₂", labelAt: "start" }] })],
      },
      "econ-6": {
        methods: ["<strong>Tax diagram:</strong> S → S + tax (vertical distance = tax). Mark Pc, Pp, Qt; shade revenue (Pc − Pp) × Qt.", "<strong>Stakeholders:</strong> consumers, producers, workers, government, society - one sentence each with direction of effect."],
        traps: ["Drawing an ad valorem tax as parallel (it pivots).", "Saying the price rises by the full amount of the tax."],
        tips: ["Incidence: the more inelastic side of the market pays more."],
        diagrams: [sd("Indirect tax: S₁ → S₁ + tax; consumers pay Pc, producers receive Pp", { lines: [D(9, 1, "D"), { from: [1, 1], to: [9, 9], label: "S₁", color: "c" }, { from: [1, 3], to: [8, 10], label: "S₁ + tax", color: "b" }, { from: [0, 6], to: [4, 6], dash: true, color: "muted", label: "Pc", labelAt: "start" }, { from: [0, 4], to: [4, 4], dash: true, color: "muted", label: "Pp", labelAt: "start" }, { from: [4, 0], to: [4, 6], dash: true, color: "muted" }] })],
      },
      "econ-7": {
        methods: ["<strong>Externality diagrams:</strong> decide production (MPC vs MSC) or consumption (MPB vs MSB) → mark Qm and Qopt → shade the welfare loss pointing to Qm.", "<strong>Policy evaluation:</strong> compare at least two policies (tax vs permits vs regulation vs nudges) and judge which fits the case."],
        traps: ["Shading the welfare loss on the wrong side.", "Calling every pollution case a negative externality of consumption."],
        tips: ["Examples: EU ETS, Sweden's carbon tax (~$120/t), Mexico's soda tax, Singapore's congestion charge."],
        diagrams: [sd("Negative production externality: Qm > Qopt", { xLabel: "Q", yLabel: "Costs, benefits", lines: [D(9, 1, "MPB = MSB"), { from: [1, 1], to: [9, 8], label: "MPC", color: "c" }, { from: [1, 3], to: [8.5, 10], label: "MSC", color: "b" }, { from: [4.1, 0], to: [4.1, 5.9], dash: true, color: "muted", label: "Qopt", labelAt: "start" }, { from: [5.27, 0], to: [5.27, 4.73], dash: true, color: "muted", label: "Qm", labelAt: "start" }] })],
      },
      "econ-8": { methods: ["<strong>Always use both characteristics</strong> (non-rivalrous and non-excludable) and link to the free-rider problem → missing market."], traps: ["Calling roads or education pure public goods - they are quasi-public / merit goods."], tips: ["Strong examples: street lighting, flood defences, national defence, lighthouses."] },
      "econ-9": {
        formulas: ["GDP = C + I + G + (X − M)", "Real GDP = nominal GDP ÷ deflator × 100", "growth % = (new − old) ÷ old × 100"],
        methods: ["<strong>Comparisons between countries:</strong> use real GDP per capita at PPP."],
        traps: ["Including transfer payments in GDP.", "Using nominal values to compare growth over time."],
        tips: ["Have one limitation of GDP ready with an example (e.g. informal economy in India, environmental damage in China)."],
      },
      "econ-10": {
        methods: ["<strong>AD/AS chain:</strong> event → which component of AD or which cost → which curve shifts → new price level and real GDP → unemployment/inflation.", "<strong>Choose the model:</strong> Keynesian (spare capacity) vs monetarist (vertical LRAS) - say which you're using."],
        traps: ["Labelling axes P and Q on macro diagrams.", "Shifting LRAS for a short-run cost change (that's SRAS)."],
        tips: ["Recessionary gap = Yp − Ye; inflationary gap = Ye − Yp."],
        diagrams: [{ title: "AD falls: recessionary gap below potential output Yp", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Real GDP", yLabel: "Price level", lines: [{ from: [1, 9], to: [9, 1], label: "AD₁" }, { from: [0.5, 7.5], to: [7.5, 0.5], label: "AD₂", color: "b" }, { from: [1, 1.5], to: [9, 9], label: "SRAS", color: "c" }, { from: [4.87, 0], to: [4.87, 9.5], label: "LRAS", color: "muted" }, { from: [3.84, 0], to: [3.84, 4.16], dash: true, color: "muted", label: "Ye", labelAt: "start" }], texts: [{ at: [5.05, 0.4], text: "Yp" }] }],
      },
      "econ-11": {
        formulas: ["unemployment rate = unemployed ÷ labour force × 100", "inflation = (CPI₂ − CPI₁) ÷ CPI₁ × 100"],
        methods: ["<strong>Match policy to type:</strong> cyclical → demand-side; structural → supply-side (training, mobility)."],
        traps: ["Disinflation ≠ deflation.", "Labour force ≠ population."],
        tips: ["Weighted price index: multiply each index by its weight, sum, divide by total weight."],
      },
      "econ-12": {
        methods: ["<strong>Tax calculations:</strong> work band by band; average rate = total tax ÷ income; marginal rate = rate on the last dollar."],
        traps: ["Applying the top rate to the whole income.", "Confusing equity (fairness) with equality."],
        tips: ["Lorenz curve: closer to the line of equality = lower Gini."],
        diagrams: [{ title: "Lorenz curve: further from the diagonal = more inequality", x: [0, 100], y: [0, 100], origin: false, grid: false, xLabel: "% population", yLabel: "% income", lines: [{ from: [0, 0], to: [100, 100], label: "equality", color: "muted" }], curves: [{ f: (x) => 100 * Math.pow(x / 100, 2.2), label: "Lorenz", labelX: 70 }, { f: (x) => 100 * Math.pow(x / 100, 1.5), color: "b", dash: true, label: "after tax", labelX: 55 }] }],
      },
      "econ-13": {
        methods: ["<strong>Transmission:</strong> interest rate → cost of borrowing / saving / mortgages / exchange rate → C, I, (X − M) → AD.", "<strong>Evaluate with time lags, confidence, debt, crowding out</strong> and the current interest rate level."],
        traps: ["Calling interest-rate changes \"fiscal policy\".", "Forgetting the multiplier when explaining fiscal policy."],
        tips: ["Examples: US CARES Act 2020, ECB negative rates 2014-2022, Bank of England rate rises 2022-23."],
      },
      "econ-14": {
        methods: ["<strong>Show both shifts</strong> for interventionist policies: AD right (short run) and LRAS right (long run)."],
        traps: ["Claiming supply-side policies work quickly.", "Forgetting equity costs of market-based policies."],
        tips: ["Examples: India 1991 liberalisation, UK privatisation, Singapore SkillsFuture."],
      },
      "econ-15": {
        methods: ["<strong>Comparative advantage:</strong> compute the opportunity cost of one unit of each good for both countries; lower OC wins.", "<strong>Tariff diagram:</strong> mark Q1-Q4; imports fall from Q1Q4 to Q2Q3; revenue rectangle; two welfare-loss triangles."],
        traps: ["Confusing absolute with comparative advantage.", "Saying protection always protects jobs - retaliation can destroy export jobs."],
        tips: ["Examples: US-China tariffs 2018-19, EU CAP, Indonesia's nickel export ban."],
        diagrams: [sd("Tariff raises the domestic price from Pw to Pw + t", { lines: [D(9, 1, "D dom"), { from: [1, 1], to: [9, 9], label: "S dom", color: "c" }, { from: [0, 2.5], to: [10, 2.5], label: "Pw", color: "b" }, { from: [0, 4], to: [10, 4], label: "Pw + t", color: "b", dash: true }] })],
      },
      "econ-16": { methods: ["<strong>Climb the ladder:</strong> PTA → FTA → customs union → common market → monetary union - each adds one feature."], traps: ["Saying an FTA has a common external tariff."], tips: ["Name a real bloc at each level: ASEAN (FTA), Mercosur (CU), EU (common market + eurozone)."] },
      "econ-17": {
        methods: ["<strong>Currency conversions:</strong> if €1 = $1.10, $ price ÷ 1.10 = € price.", "<strong>Exchange-rate chain:</strong> event → demand or supply of the currency → appreciation/depreciation → effect on X, M, inflation, growth."],
        traps: ["Shifting demand for a currency when imports rise (that's supply of the currency).", "Mixing up current and financial accounts."],
        tips: ["Remittances are secondary income in the current account; FDI is in the financial account."],
        diagrams: [{ title: "Rise in demand for the € → appreciation", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Quantity of €", yLabel: "$ per €", lines: [D(9, 1, "D€₁"), { from: [2.5, 9.5], to: [9.5, 2.5], label: "D€₂", color: "b" }, { from: [1, 1], to: [9, 9], label: "S€", color: "c" }] }],
      },
      "econ-18": {
        methods: ["<strong>Paper 2 final question:</strong> pick a strategy from the text, explain how it works (with a diagram), evaluate with the country's data, and compare with another strategy."],
        traps: ["Treating growth and development as the same thing."],
        tips: ["Examples: Bangladesh (Grameen microfinance), Rwanda (governance), Botswana (diamonds and institutions), Vietnam (FDI and exports)."],
      },
    },
  });
})();
