/* Extra original exam-style questions for the HL (AHL) topics, modelled on IB HL papers. */
IB.addQuestions("econ", {
  "econ-h1": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "Diseconomies of scale cause:", options: ["short-run MC to rise", "long-run average cost to rise as output increases", "fixed costs to fall", "average revenue to rise"], answer: 1, ms: ["B."] },
    { paper: "P3", marks: 2, diff: 2, numeric: { value: 40, tol: 0.01 }, q: "A firm's total revenue rises from $1200 to $1600 when sales rise from 30 to 40 units. Calculate marginal revenue per unit (in $).", ms: ["MR = ΔTR/ΔQ = 400/10 [M1]", "$40 [A1]"] },
    { paper: "P2", marks: 4, diff: 2, q: "Distinguish between the shut-down price and the break-even price of a firm.", ms: ["Shut-down price = minimum AVC [1]", "Below it the firm cannot cover variable costs and closes in the short run [1]", "Break-even price = minimum ATC [1]", "At this price the firm earns normal profit (TR = TC) [1]"] },
  ],
  "econ-h2": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "In the long run, a monopolistically competitive firm:", options: ["earns abnormal profit", "produces at minimum ATC", "has excess capacity", "is allocatively efficient"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 4, diff: 3, q: "Using a diagram, explain why a natural monopoly may be regulated by setting price equal to average cost.", ms: ["Natural monopoly: LRAC falls over the whole market demand [1]", "P = MC would cause a loss because MC < AC [1]", "P = AC gives normal profit, higher output and lower price than profit maximisation [1]", "Diagram with AR, MR, AC, MC and the regulated price [1]"] },
    { paper: "P2", marks: 4, diff: 2, q: "Explain two barriers to entry that allow a monopoly to keep abnormal profit in the long run.", ms: ["Barrier 1 identified, e.g. economies of scale / patents / control of resources / brand loyalty [1]", "Explained: new firms cannot compete on cost or legally enter [1]", "Barrier 2 identified [1]", "Explained [1]"] },
  ],
  "econ-h3": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "According to the long-run Phillips curve, unemployment is:", options: ["inversely related to inflation", "at the natural rate whatever the inflation rate", "zero at full employment", "determined by aggregate demand"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 4, diff: 2, q: "Explain how a fall in the interest rate leads to a multiplied increase in real GDP.", ms: ["Lower cost of borrowing increases consumption and investment [1]", "AD shifts right [1]", "Extra spending becomes income for others, who spend a fraction (MPC) [1]", "Final increase in GDP is a multiple of the initial change [1]"] },
  ],
  "econ-h4": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "A country's terms of trade improve when:", options: ["export prices fall relative to import prices", "export prices rise relative to import prices", "the volume of exports rises", "the currency depreciates"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 4, diff: 3, q: "Explain two consequences of a long-term deterioration in the terms of trade for a country that exports primary commodities.", ms: ["More exports must be sold to buy the same imports [1]", "Current account deficit may worsen / foreign debt rises [1]", "Lower export revenue reduces government revenue and investment [1]", "Living standards / development may fall [1]"] },
  ],
});

IB.addQuestions("chem", {
  "chem-h1": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "What is the shape of SF₄?", options: ["Tetrahedral", "Square planar", "Seesaw", "Trigonal pyramidal"], answer: 2, ms: ["C. 5 domains, 1 lone pair."] },
    { paper: "P2", marks: 3, diff: 3, q: "The successive ionisation energies of element X show a large jump between the 3rd and 4th. Deduce, with a reason, the group of X.", ms: ["Three electrons are relatively easy to remove / three outer-shell electrons [1]", "The 4th electron is removed from an inner shell closer to the nucleus [1]", "X is in group 13 [1]"] },
    { paper: "P2", marks: 2, diff: 2, q: "State the hybridisation of carbon in methane and in ethyne.", ms: ["Methane: sp³ [1]", "Ethyne: sp [1]"] },
  ],
  "chem-h2": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Which can show cis-trans isomerism?", options: ["Propene", "But-2-ene", "Ethene", "But-1-ene"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, q: "Describe how two enantiomers can be distinguished using polarised light.", ms: ["Pass plane-polarised light through a solution of each [1]", "They rotate the plane by equal amounts in opposite directions [1]"] },
    { paper: "P2", marks: 3, diff: 3, q: "A compound C₃H₆O shows a strong IR absorption at 1715 cm⁻¹ and a single peak in its ¹H NMR spectrum. Identify it, explaining your reasoning.", ms: ["1715 cm⁻¹ shows C=O [1]", "One NMR signal: all hydrogens in the same environment [1]", "Propanone, CH₃COCH₃ [1]"] },
  ],
  "chem-h3": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A reaction with ΔH > 0 and ΔS > 0 is:", options: ["never spontaneous", "always spontaneous", "spontaneous at high temperature", "spontaneous at low temperature"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 2, diff: 2, q: "Explain why the lattice enthalpy of MgO is much larger than that of NaCl.", ms: ["Mg²⁺ and O²⁻ have higher charges than Na⁺ and Cl⁻ [1]", "And smaller ionic radii, so stronger electrostatic attraction [1]"] },
  ],
  "chem-h4": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "For rate = k[A][B], the units of k are:", options: ["s⁻¹", "mol dm⁻³ s⁻¹", "dm³ mol⁻¹ s⁻¹", "dm⁶ mol⁻² s⁻¹"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 3, diff: 3, q: "The rate equation for a reaction is rate = k[NO₂]². Suggest a two-step mechanism consistent with this and identify the rate-determining step.", ms: ["Step 1 (slow): NO₂ + NO₂ → NO₃ + NO [1]", "Step 2 (fast): NO₃ + CO → NO₂ + CO₂ [1]", "Step 1 is rate-determining as it involves two NO₂ [1]"] },
  ],
  "chem-h5": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Which mixture forms a buffer?", options: ["HCl and NaCl", "CH₃COOH and CH₃COONa", "NaOH and NaCl", "HNO₃ and KNO₃"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 4.74, tol: 0.02 }, q: "Ethanoic acid has Ka = 1.8 × 10⁻⁵. Calculate the pH at the half-equivalence point of its titration with NaOH.", ms: ["pH = pKa at half-equivalence [M1]", "−log(1.8 × 10⁻⁵) = 4.74 [A1]"] },
    { paper: "P2", marks: 3, diff: 3, q: "Predict the products at each electrode during the electrolysis of concentrated aqueous sodium chloride.", ms: ["Cathode: hydrogen gas (water reduced in preference to Na⁺) [1]", "Anode: chlorine gas (high Cl⁻ concentration) [1]", "Solution becomes sodium hydroxide [1]"] },
  ],
  "chem-h6": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "An SN2 reaction at a chiral carbon results in:", options: ["racemisation", "inversion of configuration", "retention of configuration", "no change"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 3, q: "Explain why tertiary halogenoalkanes react mainly by SN1.", ms: ["Bulky alkyl groups hinder backside attack (steric hindrance) [1]", "The tertiary carbocation is stabilised by the positive inductive effect of three alkyl groups [1]", "So ionisation (rate-determining step) is favoured [1]"] },
  ],
});

IB.addQuestions("math", {
  "math-h1": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "In how many ways can 5 people sit in a row if two of them must sit together?", options: ["24", "48", "60", "120"], answer: 1, ms: ["B. 4! × 2 = 48."] },
    { paper: "P1", marks: 4, diff: 3, q: "Express z = 1 − √3 i in the form re^{iθ} and hence find z⁶.", ms: ["r = 2 [A1]", "θ = −π/3 [A1]", "z⁶ = 2⁶ e^{−2πi} [M1]", "= 64 [A1]"] },
    { paper: "P1", marks: 5, diff: 3, q: "Use proof by contradiction to show that √2 is irrational.", ms: ["Assume √2 = p/q in lowest terms [M1]", "2q² = p², so p² is even and so p is even [A1]", "Let p = 2k: 2q² = 4k² so q² = 2k², so q is even [A1]", "p and q both even contradicts lowest terms [R1]", "Hence √2 is irrational [R1]"] },
  ],
  "math-h2": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "The oblique asymptote of y = (x² + 3x + 1)/(x + 1) is:", options: ["y = x", "y = x + 2", "y = x + 3", "y = 2"], answer: 1, ms: ["B. Division gives x + 2 − 1/(x + 1)."] },
    { paper: "P1", marks: 4, diff: 3, q: "Solve the inequality |2x − 3| < 5.", ms: ["−5 < 2x − 3 < 5 [M1]", "−2 < 2x < 8 [A1]", "−1 < x < 4 [A1A1]"] },
  ],
  "math-h3": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "The value of sec²θ − tan²θ is:", options: ["0", "1", "sin²θ", "cos²θ"], answer: 1, ms: ["B."] },
    { paper: "P1", marks: 5, diff: 3, q: "Find the Cartesian equation of the plane containing A(1, 0, 2), B(2, 1, 3) and C(0, 2, 1).", ms: ["AB = (1, 1, 1), AC = (−1, 2, −1) [A1]", "n = AB × AC = (−3, 0, 3) [M1A1]", "−3x + 3z = −3(1) + 3(2) = 3 [M1]", "−x + z = 1 (or equivalent) [A1]"] },
  ],
  "math-h4": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "If x² + y² = 25, then dy/dx equals:", options: ["−x/y", "x/y", "−y/x", "2x"], answer: 0, ms: ["A."] },
    { paper: "P1", marks: 6, diff: 3, q: "Solve the differential equation dy/dx = xy, given y = 2 when x = 0.", ms: ["∫ (1/y) dy = ∫ x dx [M1]", "ln|y| = x²/2 + C [A1A1]", "x = 0, y = 2: C = ln 2 [M1]", "ln y = x²/2 + ln 2 [A1]", "y = 2e^{x²/2} [A1]"] },
    { paper: "P2", marks: 3, diff: 2, numeric: { value: 3.35, tol: 0.02 }, q: "Find the volume, to 3 s.f., when the region under y = √x from x = 0 to x = 1.46 is rotated through 360° about the x-axis.", ms: ["V = π∫₀^1.46 x dx [M1]", "= π(1.46²)/2 [A1]", "3.35 [A1]"] },
  ],
  "math-h5": [
    { type: "mcq", paper: "P1", marks: 1, diff: 2, q: "For a continuous random variable, P(X = 2) is:", options: ["f(2)", "0", "1", "F(2)"], answer: 1, ms: ["B."] },
    { paper: "P1", marks: 4, diff: 3, numeric: { value: 1.33, tol: 0.01 }, q: "f(x) = x/2 for 0 ≤ x ≤ 2 is a probability density function. Find E(X), to 3 s.f.", ms: ["E(X) = ∫₀² x · (x/2) dx [M1]", "= [x³/6]₀² [A1]", "= 8/6 [A1]", "1.33 [A1]"] },
  ],
});

IB.addQuestions("bio", {
  "bio-h1": [
    { paper: "P2", marks: 3, diff: 2, q: "Outline the evidence from the Miller-Urey experiment for the origin of organic molecules.", ms: ["Gases thought to be in the early atmosphere (CH₄, NH₃, H₂, H₂O) were used [1]", "Electric sparks simulated lightning [1]", "Amino acids / organic molecules formed from inorganic ones [1]"] },
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Cladograms are increasingly based on:", options: ["body shape only", "base or amino acid sequences", "habitat", "diet"], answer: 1, ms: ["B."] },
  ],
  "bio-h2": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "What is the final electron acceptor in aerobic respiration?", options: ["NAD", "FAD", "Oxygen", "Water"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 3, diff: 3, q: "Explain why the Calvin cycle stops in the dark even though it does not use light directly.", ms: ["The Calvin cycle needs ATP and reduced NADP [1]", "These are produced by the light-dependent reactions [1]", "Without light, ATP/NADPH run out so GP cannot be reduced / RuBP is not regenerated [1]"] },
  ],
  "bio-h3": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Histone acetylation usually:", options: ["condenses chromatin and silences genes", "loosens chromatin and increases transcription", "changes the base sequence", "removes introns"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 3, q: "Outline how the environment can influence gene expression, using an example.", ms: ["Environmental factors (diet, temperature, stress) alter epigenetic marks [1]", "E.g. methylation silences/activates particular genes [1]", "Example, e.g. honeybee larvae fed royal jelly develop into queens / Himalayan rabbit fur colour [1]"] },
  ],
  "bio-h4": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "The critical value of χ² at p = 0.05 for 3 degrees of freedom is 7.815. A calculated value of 2.4 means:", options: ["reject the null hypothesis", "accept/do not reject the null hypothesis", "the genes are linked", "the test is invalid"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 3, q: "Explain how crossing over produces recombinant offspring when genes are linked.", ms: ["Crossing over happens between non-sister chromatids in prophase I [1]", "Sections of chromatids (and alleles) are exchanged [1]", "New allele combinations on chromosomes give recombinant gametes and offspring [1]"] },
  ],
  "bio-h5": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Which molecule acts as a second messenger in the adrenaline signalling pathway?", options: ["ATP", "cAMP", "insulin", "DNA"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain how glucose is reabsorbed in the proximal convoluted tubule.", ms: ["Microvilli give a large surface area [1]", "Na⁺ are actively pumped out of the cells, creating a gradient [1]", "Glucose is co-transported with Na⁺ into the cells, then diffuses into the blood [1]"] },
  ],
});

IB.addQuestions("geo", {
  "geo-h1": [
    { paper: "P3", marks: 4, diff: 2, q: "Outline two ways in which technology has increased global interactions.", ms: ["Way 1, e.g. containerisation lowers transport costs [1]", "Developed with example/data [1]", "Way 2, e.g. internet/undersea cables allow data and service flows [1]", "Developed with example/data [1]"] },
  ],
  "geo-h2": [
    { paper: "P3", marks: 4, diff: 2, q: "Explain two ways diasporas maintain links with their home countries.", ms: ["Remittances sent home [1]", "Developed: support families/development, e.g. Philippines [1]", "Cultural links: festivals, language, media [1]", "Developed with example [1]"] },
  ],
  "geo-h3": [
    { paper: "P3", marks: 4, diff: 2, q: "Explain how e-waste flows illustrate the environmental risks of global interactions.", ms: ["E-waste is exported from HICs to LICs/MICs [1]", "Cheaper disposal / weak regulation [1]", "Toxic metals pollute soil, water and harm workers' health [1]", "Named example, e.g. Agbogbloshie (Ghana) / Guiyu (China) [1]"] },
  ],
  "geo-h4": [
    { paper: "P1", marks: 4, diff: 2, q: "Explain two causes of coastal erosion.", ms: ["Hydraulic action: air compressed in cracks [1]", "Developed: cracks widen and rock breaks away [1]", "Abrasion: waves throw sediment at the cliff [1]", "Developed: wears the cliff base, forms a wave-cut notch [1]"] },
  ],
});
