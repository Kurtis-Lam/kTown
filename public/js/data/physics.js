/* Original IB Physics SL and HL revision notes and practice. */
(function () {
  const topic = (sid, code, unit, title, summary, concepts, formulas, questions, terms) => ({
    id: `${sid}-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    code,
    unit,
    title,
    summary,
    concepts,
    formulas,
    terms,
    methods: ["Write the governing relationship first, substitute values with units, then round only the final result to a justified number of significant figures."],
    traps: ["Do not confuse a scalar with a vector; state direction or sign whenever the quantity is directional.", "Check unit prefixes and convert to SI before substituting."],
    tips: ["For data questions, identify the trend, quote values from the stimulus and connect the evidence to the physical model."],
    examples: [{ q: "A trolley accelerates uniformly from 2.0 m s⁻¹ to 8.0 m s⁻¹ in 3.0 s. Find its acceleration.", a: "a = Δv/Δt = (8.0 − 2.0)/3.0 = 2.0 m s⁻²." }],
    questions,
  });

  const makeCore = (sid) => [
    topic(sid, "A1", "Space, time and motion", "Describing motion", "Represent motion with displacement, velocity and acceleration; interpret motion graphs and constant-acceleration models.", [
      { h: "Position and motion", b: "<p><strong>Distance</strong> is scalar; <strong>displacement</strong> is the directed change in position. Average velocity is displacement divided by elapsed time, while speed uses distance. Acceleration is the rate of change of velocity, so it can occur when speed or direction changes.</p>" },
      { h: "Graphs and models", b: "<p>The gradient of a displacement–time graph is velocity; the gradient of a velocity–time graph is acceleration. The signed area under a velocity–time graph is displacement. For constant acceleration, use a kinematics equation only when its variables match the information given.</p>" },
    ], ["\\(v = u + at\\)", "\\(s = ut + \\frac{1}{2}at^2\\)", "\\(v^2 = u^2 + 2as\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "The gradient of a velocity–time graph represents:", options: ["displacement", "acceleration", "force", "power"], answer: 1, ms: ["Acceleration is the rate of change of velocity, equal to the graph's gradient."] },
      { type: "short", paper: "P1B", marks: 2, diff: 1, q: "A runner changes velocity from 3.0 m s⁻¹ to 9.0 m s⁻¹ in 2.0 s. Calculate the acceleration.", ms: ["a = (v − u)/t [1]", "= (9.0 − 3.0)/2.0 = 3.0 m s⁻² [1]"] },
    ], [["Displacement", "Change in position in a specified direction."], ["Acceleration", "Rate of change of velocity with time."]]),
    topic(sid, "A2", "Space, time and motion", "Forces and momentum", "Apply Newton's laws, free-body diagrams, impulse and conservation of momentum.", [
      { h: "Newton's laws", b: "<p>Zero resultant force means constant velocity, not necessarily rest. A resultant force produces acceleration according to \\(F_{net}=ma\\). Interaction forces are equal and opposite, act on different objects, and are the same type of force.</p>" },
      { h: "Momentum and impulse", b: "<p>Momentum \\(p=mv\\) is a vector. Impulse is the change in momentum and equals the area under a force–time graph. In an isolated system, total momentum is conserved; kinetic energy is conserved only in an elastic collision.</p>" },
    ], ["\\(F_{net}=ma\\)", "\\(p=mv\\)", "\\(J=F\\Delta t=\\Delta p\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "During an isolated collision, which quantity is always conserved?", options: ["Kinetic energy", "Total momentum", "Speed of each object", "Acceleration"], answer: 1, ms: ["Total momentum is conserved in an isolated system. Kinetic energy need not be conserved in an inelastic collision."] },
      { type: "short", paper: "P2", marks: 3, diff: 2, q: "A 0.20 kg ball moving at 10 m s⁻¹ rebounds at 6.0 m s⁻¹ in the opposite direction. Calculate the magnitude of its change in momentum.", ms: ["Take the initial direction as positive: Δp = 0.20(−6.0 − 10) [1]", "Δp = −3.2 kg m s⁻¹ [1]", "Magnitude = 3.2 kg m s⁻¹ [1]"] },
    ], [["Resultant force", "Vector sum of all forces acting on an object."], ["Impulse", "Change in momentum, equal to force multiplied by the time interval for a constant force."]]),
    topic(sid, "A3", "Space, time and motion", "Work, energy and power", "Track energy transfers using work, kinetic and gravitational potential energy, efficiency and power.", [
      { h: "Work and energy", b: "<p>Work is energy transferred when a force causes displacement. Only the component of force parallel to displacement contributes. In a closed model, energy is conserved although useful energy may be dissipated to the surroundings.</p>" },
      { h: "Power and efficiency", b: "<p>Power is the rate of energy transfer. Efficiency compares useful output with total input and is dimensionless; multiply by 100% when expressing it as a percentage.</p>" },
    ], ["\\(W=Fs\\cos\\theta\\)", "\\(E_k=\\frac{1}{2}mv^2\\)", "\\(E_p=mgh\\)", "\\(P=\\frac{\\Delta E}{\\Delta t}\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "A machine transfers 600 J of input energy and delivers 450 J usefully. Its efficiency is:", options: ["25%", "60%", "75%", "133%"], answer: 2, ms: ["Efficiency = 450/600 × 100% = 75%."] },
      { type: "short", paper: "P2", marks: 2, diff: 1, q: "Calculate the kinetic energy of a 2.0 kg object moving at 3.0 m s⁻¹.", ms: ["Eₖ = ½mv² [1]", "= ½(2.0)(3.0)² = 9.0 J [1]"] },
    ], [["Work", "Energy transferred by a force acting through a displacement."], ["Power", "Rate of energy transfer or work done."]]),
    topic(sid, "B1", "The particulate nature of matter", "Thermal energy and matter", "Explain temperature, internal energy, phase changes and heating using a particle model.", [
      { h: "Temperature and internal energy", b: "<p>Temperature is related to the average random kinetic energy of particles. Internal energy is the total microscopic kinetic and potential energy. During a phase change, energy changes particle potential energy while temperature remains constant for a pure substance at constant pressure.</p>" },
      { h: "Specific heat capacity", b: "<p>Specific heat capacity is the energy required to raise the temperature of unit mass by one kelvin. A larger value means more energy is required for the same mass and temperature change.</p>" },
    ], ["\\(Q=mc\\Delta T\\)", "\\(Q=mL\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "While a pure substance boils at constant pressure, added energy primarily increases its:", options: ["temperature", "mass", "particle potential energy", "specific heat capacity"], answer: 2, ms: ["Energy separates particles and changes potential energy during the phase change; temperature stays constant."] },
      { type: "short", paper: "P1B", marks: 2, diff: 2, q: "A 0.50 kg sample with specific heat capacity 400 J kg⁻¹ K⁻¹ warms by 5.0 K. Calculate the energy transferred.", ms: ["Q = mcΔT [1]", "= 0.50 × 400 × 5.0 = 1000 J [1]"] },
    ], [["Internal energy", "Total microscopic kinetic and potential energy of the particles in a system."], ["Specific latent heat", "Energy needed per unit mass for a change of state without temperature change."]]),
    topic(sid, "B2", "The particulate nature of matter", "Gases and thermal models", "Use the ideal-gas model and kinetic theory to relate pressure, volume, temperature and amount of gas.", [
      { h: "Ideal-gas model", b: "<p>The ideal-gas equation relates pressure, volume, amount and absolute temperature. Convert Celsius to kelvin before calculations. The model assumes particles have negligible volume, move randomly and undergo elastic collisions.</p>" },
      { h: "Microscopic explanation", b: "<p>Gas pressure results from particle collisions with container walls. At fixed volume and amount, raising temperature increases mean kinetic energy and the rate and impulse of collisions, so pressure rises.</p>" },
    ], ["\\(pV=nRT\\)", "\\(pV=Nk_BT\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "In the ideal-gas equation pV = nRT, temperature must be measured in:", options: ["°C", "K", "°F", "any scale"], answer: 1, ms: ["The gas equation uses absolute temperature in kelvin."] },
      { type: "short", paper: "P1B", marks: 2, diff: 2, q: "Explain why the pressure of a gas in a rigid sealed container increases when heated.", ms: ["Temperature increase raises the particles' mean kinetic energy / speed [1]", "Collisions with the walls become more frequent and/or transfer more momentum per second [1]"] },
    ], [["Absolute temperature", "Temperature measured from absolute zero in kelvin."], ["Ideal gas", "A model gas whose particles have negligible volume and no intermolecular forces except during elastic collisions."]]),
    topic(sid, "C1", "Wave behaviour", "Oscillations and wave descriptions", "Describe periodic motion and travelling waves using displacement, amplitude, period, frequency and wavelength.", [
      { h: "Oscillations", b: "<p>Simple harmonic motion occurs when acceleration is proportional to displacement from equilibrium and directed toward it. Period is the time for one cycle; frequency is cycles per second. Amplitude is the maximum displacement.</p>" },
      { h: "Travelling waves", b: "<p>A wave transfers energy and information without net transfer of matter. Transverse oscillations are perpendicular to energy transfer; longitudinal oscillations are parallel. Wave speed depends on frequency and wavelength.</p>" },
    ], ["\\(f=1/T\\)", "\\(v=f\\lambda\\)", "\\(a=-\\omega^2x\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "A wave has frequency 4.0 Hz and wavelength 0.50 m. Its speed is:", options: ["0.125 m s⁻¹", "2.0 m s⁻¹", "4.5 m s⁻¹", "8.0 m s⁻¹"], answer: 1, ms: ["v = fλ = 4.0 × 0.50 = 2.0 m s⁻¹."] },
      { type: "short", paper: "P2", marks: 2, diff: 2, q: "State two features of simple harmonic motion.", ms: ["Acceleration is proportional to displacement from equilibrium [1]", "Acceleration is directed toward the equilibrium position / opposite displacement [1]"] },
    ], [["Amplitude", "Maximum displacement from the equilibrium position."], ["Wavelength", "Distance between successive points in phase on a wave."]]),
    topic(sid, "C2", "Wave behaviour", "Wave phenomena and superposition", "Apply reflection, refraction, diffraction, interference and standing-wave models.", [
      { h: "Superposition and interference", b: "<p>When waves overlap, their displacements add. Coherent sources have a constant phase difference. Constructive interference occurs for path difference \\(m\\lambda\\); destructive interference occurs for \\((m+\\frac12)\\lambda\\).</p>" },
      { h: "Diffraction and standing waves", b: "<p>Diffraction is strongest when the gap size is comparable to wavelength. Standing waves result from superposition of counter-propagating waves and contain fixed nodes and antinodes; adjacent nodes are separated by half a wavelength.</p>" },
    ], ["\\(\\Delta x=m\\lambda\\) (constructive)", "\\(\\Delta x=(m+\\frac12)\\lambda\\) (destructive)", "\\(L=n\\lambda/2\\) (two fixed ends)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Diffraction is most pronounced when a wave passes through an opening whose width is:", options: ["much larger than its wavelength", "similar to its wavelength", "zero", "unrelated to wavelength"], answer: 1, ms: ["Diffraction is strongest when the opening dimension is similar to the wavelength."] },
      { type: "short", paper: "P2", marks: 2, diff: 2, q: "A string fixed at both ends has length 0.80 m and vibrates in its second harmonic. Find the wavelength.", ms: ["L = nλ/2 with n = 2 [1]", "λ = 2L/n = 0.80 m [1]"] },
    ], [["Coherent sources", "Sources with the same frequency and a constant phase difference."], ["Node", "Point on a standing wave with zero displacement at all times."]]),
    topic(sid, "D1", "Fields", "Electricity and fields", "Model electric current, potential difference, resistance and field interactions.", [
      { h: "Circuits", b: "<p>Current is the rate of flow of charge. Potential difference is energy transferred per unit charge. For an ohmic conductor at constant temperature, current is proportional to potential difference; a component's resistance can vary with temperature and operating conditions.</p>" },
      { h: "Electric fields", b: "<p>An electric field is force per unit positive test charge. Field lines point in the direction of force on a positive charge. A uniform field between parallel plates has approximately constant magnitude away from edges.</p>" },
    ], ["\\(I=\\Delta Q/\\Delta t\\)", "\\(V=IR\\)", "\\(P=IV=I^2R\\)", "\\(E=F/q\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "The SI unit of potential difference is:", options: ["ampere", "coulomb", "volt", "ohm"], answer: 2, ms: ["Potential difference is measured in volts (J C⁻¹)."] },
      { type: "short", paper: "P2", marks: 2, diff: 1, q: "A 6.0 Ω resistor is connected to a 12 V supply. Calculate the current.", ms: ["I = V/R [1]", "I = 12/6.0 = 2.0 A [1]"] },
      { type: "extended", paper: "P2", marks: 6, diff: 3, q: "Describe an investigation to determine how the resistance of a metal wire depends on its temperature. [6]", ms: ["Measure the wire's length and diameter / cross-sectional area [1]", "Connect it in a circuit with an ammeter in series and a voltmeter across the wire [1]", "Vary temperature in controlled steps using a water bath or controlled heater [1]", "At each temperature, measure V and I and calculate R = V/I [1]", "Repeat readings and calculate a mean; allow thermal equilibrium [1]", "Plot resistance against temperature, control other variables and identify uncertainty / trend [1]"] },
    ], [["Current", "Rate of flow of charge."], ["Electric field strength", "Force per unit positive test charge at a point."]]),
    topic(sid, "D2", "Fields", "Magnetism and induction", "Describe magnetic forces and explain electromagnetic induction with Faraday's and Lenz's laws.", [
      { h: "Magnetic effects", b: "<p>A moving charge or current-carrying conductor in a magnetic field experiences a force when motion has a component perpendicular to the field. The force direction is perpendicular to both current/velocity and field.</p>" },
      { h: "Electromagnetic induction", b: "<p>An emf is induced when magnetic flux linkage changes. Its magnitude depends on the rate of change of flux linkage. Lenz's law gives the direction: the induced effect opposes the change that produced it, consistent with energy conservation.</p>" },
    ], ["\\(F=BIL\\sin\\theta\\)", "\\(F=qvB\\sin\\theta\\)", "\\(\\mathcal{E}=-N\\frac{\\Delta\\Phi}{\\Delta t}\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "According to Lenz's law, an induced current acts to:", options: ["increase the change in magnetic flux", "oppose the change in magnetic flux", "remove all magnetic fields", "stop charge conservation"], answer: 1, ms: ["The induced effect opposes the change that caused it."] },
      { type: "short", paper: "P2", marks: 2, diff: 2, q: "State two ways to increase the induced emf in a coil moved through a magnetic field.", ms: ["Increase the rate of change of magnetic flux (e.g. move it faster or use a stronger field) [1]", "Increase the number of turns in the coil [1]"] },
    ], [["Magnetic flux", "Measure of the magnetic field passing through a defined area."], ["Lenz's law", "The induced current is directed so its magnetic effect opposes the change that produced it."]]),
    topic(sid, "E1", "Nuclear and quantum physics", "Atoms, nuclei and quantum ideas", "Use photon, atomic and nuclear models to explain quantization, radioactivity and energy changes.", [
      { h: "Photons and quantization", b: "<p>Energy exchange between matter and radiation is quantized. Photon energy is proportional to frequency. In the photoelectric effect, emission occurs only when photon frequency is at least the threshold frequency; increasing intensity above threshold raises the number of emitted electrons, not their maximum kinetic energy.</p>" },
      { h: "Nuclear processes", b: "<p>Radioactive decay is random for a single nucleus but predictable statistically for a large sample. Alpha, beta and gamma emissions differ in charge, ionizing ability and penetration. In nuclear equations, conserve nucleon number and proton number.</p>" },
    ], ["\\(E=hf=hc/\\lambda\\)", "\\(E_k=hf-\\phi\\)", "\\(N=N_0(\\frac12)^{t/T_{1/2}}\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Increasing the intensity of light above the photoelectric threshold frequency increases the:", options: ["maximum kinetic energy of each electron", "number of emitted electrons per second", "work function of the metal", "threshold frequency"], answer: 1, ms: ["Greater intensity means more photons per second and therefore more emitted electrons, while photon energy is unchanged."] },
      { type: "short", paper: "P2", marks: 2, diff: 2, q: "A radioactive sample has a half-life of 6.0 h. What fraction remains after 18 h?", ms: ["Number of half-lives = 18/6.0 = 3 [1]", "Fraction = (1/2)³ = 1/8 [1]"] },
    ], [["Half-life", "Time taken for the number of undecayed nuclei or activity of a sample to fall to half its initial value."], ["Photon", "Quantum of electromagnetic radiation with energy proportional to frequency."]]),
  ];

  const hlTopics = (sid) => [
    topic(sid, "HL1", "HL extension: space, time and motion", "Circular motion and gravitation", "Relate centripetal acceleration and force to circular paths, orbital motion and gravitational fields.", [
      { h: "Circular motion", b: "<p>In uniform circular motion, speed is constant but velocity changes direction, so acceleration points toward the centre. The centripetal force is not a new force: it is the resultant of real forces such as tension, gravity or friction.</p>" },
      { h: "Gravitational fields and orbits", b: "<p>Newton's law of gravitation describes attraction between masses. For a circular orbit, gravity provides centripetal force. Orbital speed depends on the central mass and orbital radius, not the orbiting object's mass.</p>" },
    ], ["\\(a_c=v^2/r=\\omega^2r\\)", "\\(F_c=mv^2/r\\)", "\\(F=GMm/r^2\\)", "\\(v_{orbit}=\\sqrt{GM/r}\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 3, q: "An object moving at constant speed in a circle has acceleration directed:", options: ["tangent to the path", "away from the centre", "toward the centre", "zero"], answer: 2, ms: ["Centripetal acceleration points toward the centre of the circular path."] },
      { type: "short", paper: "P2", marks: 3, diff: 3, q: "Explain why a satellite in a circular orbit is accelerating even if its speed is constant.", ms: ["Velocity is a vector and its direction changes continuously [1]", "A change in velocity means acceleration [1]", "The acceleration is centripetal, toward the planet's centre [1]"] },
    ], [["Centripetal acceleration", "Acceleration directed toward the centre of a circular path."], ["Gravitational field strength", "Gravitational force per unit mass at a point."]]),
    topic(sid, "HL2", "HL extension: wave behaviour", "Advanced wave models", "Connect phase, resonance, damping and driven oscillations to wave behaviour and energy transfer.", [
      { h: "Resonance and damping", b: "<p>A driven oscillator responds most strongly when driving frequency is close to its natural frequency. Damping transfers energy from the oscillation to the surroundings and reduces amplitude; stronger damping broadens and lowers the resonance peak.</p>" },
      { h: "Phase and wave speed", b: "<p>Phase describes position in a cycle. Phase difference can be related to a path difference as a fraction of wavelength. A wave's frequency is set by its source; speed and wavelength may change when it enters a new medium.</p>" },
    ], ["\\(\\Delta\\phi=2\\pi\\Delta x/\\lambda\\)", "\\(v=f\\lambda\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 3, q: "Increasing damping in a driven oscillator generally:", options: ["raises the resonance peak", "lowers and broadens the resonance peak", "removes the natural frequency", "increases energy conservation violations"], answer: 1, ms: ["Damping reduces the resonant amplitude and makes the response less sharply peaked."] },
      { type: "short", paper: "P2", marks: 2, diff: 3, q: "Two points on a wave are separated by a path difference of one quarter wavelength. Find their phase difference.", ms: ["Δφ = 2πΔx/λ [1]", "Δφ = 2π(1/4) = π/2 rad [1]"] },
    ], [["Resonance", "Large response when a driving frequency is close to a system's natural frequency."], ["Damping", "Energy loss from an oscillating system that reduces its amplitude."]]),
    topic(sid, "HL3", "HL extension: fields and nuclear physics", "Advanced fields and quantum physics", "Extend field and particle models to charged-particle motion, quantum evidence and nuclear-energy changes.", [
      { h: "Charged particles in fields", b: "<p>A charged particle moving perpendicular to a uniform magnetic field follows a circular path because the magnetic force is perpendicular to its velocity and changes direction without doing work. The radius depends on momentum, charge and field strength.</p>" },
      { h: "Energy and nuclear binding", b: "<p>Mass–energy equivalence relates mass defect to binding energy. Fission splits a heavy nucleus; fusion combines light nuclei. Either can release energy when products have greater total binding energy per nucleon, subject to the reaction's conditions.</p>" },
    ], ["\\(r=mv/(|q|B)\\)", "\\(E=mc^2\\)", "\\(E_b=\\Delta mc^2\\)"], [
      { type: "mcq", paper: "P1A", marks: 1, diff: 3, q: "A magnetic force on a charged particle moving in a uniform magnetic field does no work because it is:", options: ["parallel to velocity", "perpendicular to velocity", "zero for all charges", "opposite to displacement"], answer: 1, ms: ["The magnetic force is perpendicular to velocity, so it changes direction but not kinetic energy."] },
      { type: "short", paper: "P2", marks: 3, diff: 3, q: "State the condition on binding energy per nucleon that allows a nuclear reaction to release energy.", ms: ["Products have a larger total binding energy than reactants [1]", "Equivalently, products are more tightly bound / have greater binding energy per nucleon in the relevant comparison [1]", "The mass difference is released as energy according to E = Δmc² [1]"] },
    ], [["Mass defect", "Difference between the combined mass of separated nucleons and the mass of the bound nucleus."], ["Binding energy per nucleon", "Average energy required to remove one nucleon from a nucleus."]]),
  ];

  const registerPhysics = (id, name, short, color, hl) => {
    const topics = makeCore(id).concat(hl ? hlTopics(id) : []);
    IB.register({
      id, name, short, color,
      guide: "IB Physics guide (first assessment 2025); confirm the current course structure with your teacher.",
      topics,
      assessment: [
        ["Paper 1A - Multiple choice", "1 h", "MCQ", "20%", "Multiple-choice questions across the syllabus."],
        ["Paper 1B - Data-based questions", "1 h", "Structured", "20%", "Questions interpreting experimental and scientific data."],
        ["Paper 2 - Short and extended response", "1 h 45 min", "Structured", "40%", "Questions assessing understanding, application and mathematical skills."],
        ["Scientific investigation", "20 h", "Investigation", "20%", "Independent practical investigation; check the current guide for the assessment weighting and submission requirements."],
      ],
      papers: {
        P1A: { name: "Paper 1A (multiple choice)", minutes: 60, marks: 30, mix: { mcq: 10 } },
        P1B: { name: "Paper 1B (data-based)", minutes: 60, marks: 30, mix: { short: 3 } },
        P2: { name: "Paper 2 (structured response)", minutes: 105, marks: 45, mix: { short: 8, extended: 1 } },
      },
      commandTerms: [
        ["State", "Give a specific fact, value or answer without explanation."],
        ["Outline", "Give a brief account or summary of the main points."],
        ["Explain", "Give a reasoned account using the relevant physical model."],
        ["Determine", "Obtain an answer using data, reasoning or calculation; show working when appropriate."],
        ["Estimate", "Find an approximate value using suitable assumptions and state the reasoning."],
        ["Show that", "Use working and supplied information to establish the stated result."],
      ],
      gameplan: {
        intro: "Physics rewards clear models, careful data handling and visible working. Match your method to the command term and show how each equation follows from the situation.",
        rows: [
          ["Paper 1A", "Multiple-choice concepts and calculations", "Check units, signs, graph meanings and limiting cases before choosing."],
          ["Paper 1B", "Experimental/data-based reasoning", "Quote data, calculate gradients or uncertainties, and link patterns to the model."],
          ["Paper 2", "Structured and extended-response problems", "Draw a diagram, state assumptions, show substitutions and finish with units."],
        ],
        habits: ["Sketch the system and choose a sign convention before using equations.", "Keep unrounded values until the final line; report units and appropriate significant figures.", "Check whether the answer's size and direction are physically plausible."],
      },
    });
  };

  registerPhysics("physl", "Physics SL", "Physics SL", "var(--physl)", false);
  registerPhysics("phyhl", "Physics HL", "Physics HL", "var(--phyhl)", true);
})();
