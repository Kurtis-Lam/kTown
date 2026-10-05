/* Geography SL - exam-focused extras: game plan, how-to-answer methods, traps, tips, diagrams. */
IB.extend("geo", {
  gameplan: {
    intro: "Paper 1 tests your two options; Paper 2 tests the core. The marks reward <strong>named, located examples with data</strong> and a clear argument - not general knowledge.",
    rows: [
      ["Short data questions", "1-4 marks: describe / state / explain", "Describe = pattern + data + anomaly. Explain = reason + link to the outcome."],
      ["10-mark extended response", "Examine / discuss / evaluate / to what extent", "Introduction with definitions → 3-4 developed paragraphs with examples → different perspectives → justified conclusion."],
      ["Infographic / visual", "Paper 2", "Purpose of the visual, key data, trends, and limitations (scale, bias, missing data)."],
    ],
    codes: [
      ["Band 9-10", "Top band", "Well-structured, critical evaluation, detailed named and located examples, different perspectives."],
      ["Band 7-8", "Good", "Relevant examples and some evaluation, but less depth or balance."],
      ["Band 5-6", "Mostly descriptive", "Examples are general; evaluation is thin."],
    ],
    habits: [
      "<strong>Quote data</strong> with units in every description (\"rose from 2.1 to 4.8 million\").",
      "<strong>Name and locate</strong> case studies: place, country, date, scale.",
      "<strong>Use geographic terms</strong>: core-periphery, vulnerability, resilience, sustainability.",
      "<strong>Consider scale</strong>: local, national, global - and different stakeholders.",
      "<strong>Spatial and temporal change</strong>: say where and when, not just what.",
      "<strong>Conclude</strong> with a judgement that answers the command term.",
    ],
  },
  topics: {
    "geo-1": {
      formulas: ["dependency ratio = (0-14 + 65+) ÷ (15-64) × 100", "natural increase (%) = (CBR − CDR) ÷ 10", "doubling time ≈ 70 ÷ growth rate (%)"],
      methods: ["<strong>Describe a distribution:</strong> GIST (overall pattern) → specific data → anomaly.", "<strong>Population pyramids:</strong> base (fertility) → top (life expectancy) → bulges and notches (baby booms, wars, migration)."],
      traps: ["Describing a pattern without any figures.", "Listing physical factors only - human factors usually matter more."],
      tips: ["Strong examples: Nile valley (Egypt), Lagos/Kinshasa megacity growth, Brasília as a planned capital."],
    },
    "geo-2": {
      methods: ["<strong>Evaluate a policy:</strong> data before and after → unintended consequences → cost → ethics → other factors that changed fertility."],
      traps: ["Assuming all fertility decline in China was caused by the one-child policy."],
      tips: ["Contrast: China (anti-natalist), France (relatively successful pro-natalist), Singapore/South Korea (limited success, TFR < 1)."],
      diagrams: [{ title: "Demographic transition model: CBR (accent) and CDR (dashed)", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Stage 1 → 5", yLabel: "Rate per 1000", curves: [{ f: (x) => (x < 3 ? 8.5 : 8.5 - 5.5 / (1 + Math.exp(-(x - 5) * 1.4))) - (x > 8 ? (x - 8) * 0.6 : 0), label: "CBR", labelX: 1 }, { f: (x) => 8 - 5.5 / (1 + Math.exp(-(x - 2.8) * 1.6)) + (x > 8 ? (x - 8) * 0.3 : 0), color: "b", dash: true, label: "CDR", labelX: 5 }] }],
    },
    "geo-3": {
      methods: ["<strong>Balance:</strong> source AND destination, positive AND negative, migrants AND those left behind."],
      traps: ["Calling all migrants refugees - refugees cross a border fleeing persecution or conflict."],
      tips: ["Examples: Syria → Türkiye/Germany, Philippines → Gulf states, Mexico → USA, rural-urban migration in China."],
    },
    "geo-4": {
      methods: ["<strong>Feedback loops:</strong> draw as arrow cycles with + (amplifying) or − (dampening)."],
      traps: ["Confusing ozone depletion with the greenhouse effect.", "Saying \"pollution\" instead of naming gases (CO₂, CH₄, N₂O)."],
      tips: ["Key data: CO₂ ~280 ppm pre-industrial → ~420+ ppm today; ~1.1-1.2 °C warming."],
    },
    "geo-5": { methods: ["<strong>Vulnerability = exposure × sensitivity ÷ adaptive capacity</strong> - use these three words as your paragraph structure."], traps: ["Treating all people in one country as equally vulnerable."], tips: ["Bangladesh: Bhola cyclone 1970 (~300,000 deaths) vs Amphan 2020 (<100) shows resilience improving."] },
    "geo-6": { methods: ["<strong>Evaluate responses</strong> against effectiveness, cost, scale, speed, equity and side effects."], traps: ["Calling a sea wall mitigation (it's adaptation)."], tips: ["Paris Agreement (2015): NDCs from all countries; current pledges point to ~2.5-2.9 °C."] },
    "geo-7": { methods: ["<strong>Nexus questions:</strong> show at least one two-way link between water, food and energy."], traps: ["Presenting Malthus and Boserup without evaluating either."], tips: ["Ecological footprint: humanity uses ~1.7 Earths per year."] },
    "geo-8": {
      methods: ["<strong>Hydrograph comparisons:</strong> quote lag time and peak discharge with units, then explain with two basin characteristics."],
      traps: ["Measuring lag time from the start of rain instead of peak rainfall."],
      tips: ["Examples: Three Gorges Dam, GERD (Ethiopia-Egypt), Aral Sea, Murray-Darling Basin Plan."],
      diagrams: [{ title: "Storm hydrograph: lag time from peak rainfall to peak discharge", x: [0, 48], y: [0, 10], origin: false, grid: false, xLabel: "Hours", yLabel: "Discharge (m³ s⁻¹)", curves: [{ f: (t) => 2 + 6.5 * Math.exp(-((t - 20) ** 2) / (t < 20 ? 30 : 110)), label: "discharge", labelX: 30 }], lines: [{ from: [8, 10], to: [8, 7.2], color: "b", label: "peak rain", labelAt: "end" }, { from: [8, 9.2], to: [20, 9.2], dash: true, color: "muted", label: "lag time" }] }],
    },
    "geo-9": { methods: ["<strong>Compare events with one structure:</strong> date, magnitude, deaths, cost → causes of vulnerability → response → evaluation."], traps: ["Saying magnitude alone explains the death toll."], tips: ["Haiti 2010 (Mw 7.0, 100,000+ deaths) vs Chile 2010 (Mw 8.8, ~500) vs Tōhoku 2011 (Mw 9.0, ~18,000)."] },
    "geo-10": { methods: ["<strong>Sustainable city essays:</strong> assess social, economic and environmental sustainability separately."], traps: ["Describing a strategy without evidence it worked."], tips: ["Curitiba BRT, Singapore ERP, Favela-Bairro (Rio), Masdar (limited occupancy)."] },
    "geo-11": { methods: ["<strong>Diffusion:</strong> name the type (expansion, relocation, hierarchical) and the barriers."], traps: ["Assuming food insecurity is only about supply - access and poverty matter most (Sen)."], tips: ["Green Revolution in India: yields up, but groundwater depletion and inequality."] },
    "geo-12": {
      formulas: ["\\(r_s = 1 - \\frac{6\\sum d^2}{n(n^2 - 1)}\\)", "gradient = vertical ÷ horizontal distance"],
      methods: ["<strong>10-mark structure:</strong> define → argue with examples → counter-argument → judgement."],
      traps: ["Ending without a conclusion that answers the command term."],
      tips: ["IA: discuss reliability, sample size and limitations of your method."],
    },
  },
});
