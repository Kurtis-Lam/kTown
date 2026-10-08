/* Chemistry SL - exam-focused extras: game plan, fastest methods, traps, tips, diagrams. */
IB.extend("chem", {
  gameplan: {
    intro: "Paper 1 (1h 30m): 1A multiple choice (no calculator) + 1B data-based questions on practical work. Paper 2 (1h 30m, calculator): short-answer and extended questions. Data booklet allowed in both - <strong>know what's in it so you don't waste time memorising it</strong>.",
    rows: [
      ["Paper 1A", "Multiple choice, ~1.5 min each", "Eliminate wrong options first. Rough estimates beat full calculations (no calculator)."],
      ["Paper 1B", "Data-based questions from experiments", "Read the method carefully; questions on uncertainty, graphs, improvements and errors."],
      ["Paper 2", "Structured questions", "Show working, units and significant figures for every calculation."],
    ],
    codes: [
      ["M / A", "Method / answer marks", "A correct method with an arithmetic slip still scores - always show the formula and substitution."],
      ["ECF", "Error carried forward", "A wrong earlier answer used correctly later still earns marks."],
      ["s.f.", "Significant figures", "Give the same number of s.f. as the least precise data (usually 3)."],
      ["OWTTE", "Or words to that effect", "Your wording doesn't need to match exactly - the chemistry idea does."],
    ],
    habits: [
      "<strong>Units on every answer</strong> (kJ mol⁻¹, mol dm⁻³, dm³) and the sign on ΔH.",
      "<strong>State symbols</strong> in equations when asked - (s), (l), (g), (aq).",
      "<strong>Explain with particles:</strong> collisions, forces, electrons - not \"it gets faster\".",
      "<strong>Don't round mid-calculation</strong>; round only the final answer.",
      "<strong>Use the data booklet:</strong> Ar values, bond enthalpies, IR ranges, constants.",
      "<strong>Intermolecular vs intramolecular:</strong> boiling breaks IMFs, not covalent bonds.",
      "<strong>Count marks:</strong> a 3-mark explanation needs three separate points.",
    ],
  },
  topics: {
    "chem-1": {
      formulas: ["\\(A_r = \\frac{\\sum(\\text{mass} \\times \\%)}{100}\\)", "neutrons = A − Z", "electrons in an ion = Z − charge"],
      methods: ["<strong>Unknown abundance:</strong> let one isotope be x% and the other (100 − x)%, then solve.", "<strong>State changes:</strong> flat sections on a heating curve = energy used to overcome intermolecular forces."],
      traps: ["Saying isotopes have different chemical properties.", "Saying temperature rises during melting."],
      tips: ["Kelvin = °C + 273; temperature ∝ average kinetic energy."],
    },
    "chem-2": {
      methods: ["<strong>Aufbau order:</strong> 1s 2s 2p 3s 3p <strong>4s 3d</strong> 4p. Ions of transition metals lose 4s first.", "<strong>Successive IE:</strong> count electrons before the biggest jump = valence electrons = group (s/p block)."],
      traps: ["Cr and Cu exceptions: [Ar]3d⁵4s¹ and [Ar]3d¹⁰4s¹.", "Explaining IE dips without naming sublevels (Al: 3p higher energy; S: paired 3p repulsion)."],
      tips: ["Convergence: lines in an emission spectrum get closer at higher energy."],
    },
    "chem-3": {
      formulas: ["\\(n = \\frac{m}{M}\\)", "\\(c = \\frac{n}{V}\\)", "\\(pV = nRT\\)", "\\(c_1V_1 = c_2V_2\\)", "molar volume at STP = 22.7 dm³ mol⁻¹"],
      methods: ["<strong>Empirical formula table:</strong> mass or % → ÷ Ar → ÷ smallest → whole numbers (×2 or ×3 if you get .5 or .33).", "<strong>pV = nRT units:</strong> Pa, m³, K. kPa × 1000; dm³ ÷ 1000; cm³ ÷ 10⁶."],
      traps: ["Using cm³ instead of dm³ in c = n/V.", "Using °C in pV = nRT."],
      tips: ["Real gases deviate at high pressure and low temperature - explain with particle volume and attractive forces."],
    },
    "chem-4": {
      table: { head: ["Domains", "Lone pairs", "Shape", "Angle"], rows: [["2", "0", "linear", "180°"], ["3", "0", "trigonal planar", "120°"], ["4", "0", "tetrahedral", "109.5°"], ["4", "1", "trigonal pyramidal", "107°"], ["4", "2", "bent", "104.5°"]] },
      methods: ["<strong>Shape questions:</strong> Lewis structure → count domains (double bond = 1) → shape → angle.", "<strong>Boiling point comparisons:</strong> name the IMF in each, compare strength, link to energy needed."],
      traps: ["Saying covalent bonds break when a simple molecular substance boils.", "Calling CO₂ polar because C=O bonds are polar - symmetry cancels them."],
      tips: ["Hydrogen bonding needs H bonded to N, O or F."],
    },
    "chem-5": {
      methods: ["<strong>Trend explanations:</strong> nuclear charge + number of shells + shielding → attraction for outer electrons."],
      traps: ["Saying radius increases across a period."],
      tips: ["Know the oxide equations: Na₂O + H₂O → 2NaOH; SO₃ + H₂O → H₂SO₄."],
    },
    "chem-6": {
      table: { head: ["Bond", "IR wavenumber / cm⁻¹"], rows: [["O-H (alcohol)", "3200-3600, broad"], ["O-H (acid)", "2500-3000, very broad"], ["C=O", "1700-1750"], ["C-H", "2850-3090"]] },
      methods: ["<strong>Spectra problems:</strong> MS for M → IHD for rings/π bonds → IR for functional groups → ¹H NMR for environments and ratio → propose and check a structure.", "<strong>Naming:</strong> longest chain with the functional group → lowest locant → substituents alphabetically."],
      traps: ["Counting H environments wrongly in symmetrical molecules.", "Mixing up primary/secondary/tertiary alcohols."],
      tips: ["IR ranges are in the data booklet - learn how to read the table quickly."],
    },
    "chem-7": {
      formulas: ["\\(q = mc\\Delta T\\)", "\\(\\Delta H = -\\frac{q}{n}\\)", "\\(\\Delta H = \\sum\\text{bonds broken} - \\sum\\text{bonds formed}\\)"],
      methods: ["<strong>Calorimetry:</strong> m = mass of water/solution, not the fuel. Convert J → kJ. Temperature rise → negative ΔH.", "<strong>Hess cycles:</strong> reverse an equation → change the sign; multiply → multiply ΔH."],
      traps: ["Forgetting the negative sign for exothermic ΔH (loses the A mark).", "Using bond enthalpies for liquids - they apply to gases."],
      tips: ["Experimental ΔH is usually less exothermic than literature because of heat loss - suggest insulation, a lid, stirring."],
      diagrams: [{ title: "Exothermic energy profile: products lower than reactants", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Reaction progress", yLabel: "Energy", curves: [{ f: (x) => 6 - 2.5 * (1 / (1 + Math.exp(-(x - 5) * 1.6))) + 2.8 * Math.exp(-((x - 4.3) ** 2) / 1.6) }], texts: [{ at: [0.8, 6.4], text: "reactants" }, { at: [7.4, 3.9], text: "products" }, { at: [4.6, 9.3], text: "Ea" }, { at: [8.2, 5.2], text: "ΔH < 0" }] }],
    },
    "chem-8": {
      formulas: ["% yield = actual ÷ theoretical × 100", "atom economy = M(desired) ÷ ΣM(reactants) × 100"],
      methods: ["<strong>Moles method:</strong> mass → moles → ratio → moles → mass. Write the ratio explicitly (\"1 : 2\").", "<strong>Limiting reactant:</strong> divide moles by the coefficient - the smallest is limiting."],
      traps: ["Using the mass ratio instead of the mole ratio.", "Forgetting the 2 : 1 ratio for H₂SO₄ with NaOH."],
      tips: ["Concordant titres agree within ±0.10 cm³."],
    },
    "chem-9": {
      methods: ["<strong>Collision theory answers:</strong> more frequent collisions AND/OR a greater proportion with E ≥ Ea.", "<strong>Initial rate:</strong> tangent at t = 0, gradient = rate."],
      traps: ["Saying a catalyst increases particle energy.", "Saying temperature mainly works by increasing collision frequency (the energy effect dominates)."],
      tips: ["M-B curve after a temperature rise: lower, broader peak, shifted right - same area."],
      diagrams: [{ title: "Maxwell-Boltzmann: catalyst lowers Ea (dashed) - more particles have enough energy", x: [0, 10], y: [0, 10], origin: false, grid: false, xLabel: "Kinetic energy", yLabel: "Number of particles", curves: [{ f: (x) => 84 * x * Math.exp(-x / 1.6) / 6.2 }], vlines: [{ x: 6.5, label: "Ea" }, { x: 4.5, label: "Ea(cat)" }] }],
    },
    "chem-10": {
      formulas: ["\\(K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}\\)", "reverse equation → \\(\\frac{1}{K}\\)", "double coefficients → \\(K^2\\)"],
      methods: ["<strong>Le Chatelier answers:</strong> state the change → direction of shift → reason (to oppose the change) → effect on yield.", "<strong>Q vs K:</strong> Q < K → forward; Q > K → reverse."],
      traps: ["Saying a catalyst shifts the equilibrium.", "Saying K changes with concentration or pressure (only temperature)."],
      tips: ["Haber process: ~450 °C, ~200 atm, Fe catalyst - a compromise between rate, yield and cost."],
    },
    "chem-11": {
      formulas: ["pH = −log[H⁺]", "[H⁺] = 10⁻ᵖᴴ", "Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴", "pH + pOH = 14"],
      methods: ["<strong>Strong base pH:</strong> [OH⁻] → pOH → 14 − pOH.", "<strong>Conjugate pairs:</strong> differ by exactly one H⁺."],
      traps: ["Confusing strong/weak with concentrated/dilute.", "One pH unit = ×10 in [H⁺], not ×1."],
      tips: ["Distinguish strong and weak acids by pH, conductivity or rate with Mg/CaCO₃ at the same concentration."],
      diagrams: [{ title: "Strong acid + strong base titration: sharp jump at pH 7", x: [0, 50], y: [0, 14], origin: false, grid: false, xLabel: "Volume of base / cm³", yLabel: "pH", curves: [{ f: (v) => 1 + 12 / (1 + Math.exp(-(v - 25) * 0.9)) }], points: [{ at: [25, 7], label: "equivalence" }] }],
    },
    "chem-12": {
      methods: ["<strong>Half-equations in acid:</strong> balance atoms → add H₂O for O → H⁺ for H → e⁻ for charge.", "<strong>Cells:</strong> \"An Ox, Red Cat\" - oxidation at the anode, reduction at the cathode."],
      traps: ["Saying electrons flow through the salt bridge (ions do).", "Mixing up anode polarity: negative in voltaic cells, positive in electrolytic cells."],
      tips: ["Ethanal: distil as it forms. Ethanoic acid: reflux with excess oxidising agent."],
    },
    "chem-13": {
      methods: ["<strong>Radical mechanisms:</strong> initiation (UV splits Cl₂) → propagation (radical in, radical out) → termination (two radicals combine).", "<strong>Curly arrows</strong> start at a lone pair or bond and end where the pair goes."],
      traps: ["Drawing full arrows for single electrons (use half-headed arrows for radicals)."],
      tips: ["Bromine water test: orange → colourless for C=C."],
    },
  },
});
