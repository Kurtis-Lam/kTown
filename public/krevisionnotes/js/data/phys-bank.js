/* Physics question bank: extra original exam-style questions modelled on IB Physics papers (first assessment 2025). */
IB.addQuestions("phys", {
  "phys-1": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "The gradient of a velocity-time graph represents:", options: ["displacement", "acceleration", "speed", "jerk"], answer: 1, ms: ["B."] },
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A ball is thrown vertically upwards. At its highest point its acceleration is:", options: ["zero", "9.81 m s⁻² upwards", "9.81 m s⁻² downwards", "decreasing"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 3, diff: 2, numeric: { value: 45.9, tol: 0.3 }, q: "A ball is kicked horizontally at 15 m s⁻¹ from the top of a cliff 46 m high. Ignoring air resistance, calculate the horizontal distance travelled, in m, before it lands.", ms: ["t = √(2 × 46 / 9.81) = 3.06 s [M1]", "x = 15 × 3.06 [M1]", "45.9 m [A1]"] },
    { paper: "P2", marks: 2, diff: 1, numeric: { value: 2.5, tol: 0.02 }, q: "A car accelerates uniformly from 5.0 m s⁻¹ to 25 m s⁻¹ in 8.0 s. Calculate its acceleration in m s⁻².", ms: ["a = (25 − 5.0) / 8.0 [M1]", "2.5 m s⁻² [A1]"] },
    { paper: "P2", marks: 3, diff: 3, q: "Describe how air resistance affects the trajectory of a projectile compared with the motion in a vacuum.", ms: ["Lower maximum height [1]", "Shorter horizontal range [1]", "Trajectory no longer symmetrical / steeper descent [1]"] },
  ],
  "phys-2": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "The unit of momentum is:", options: ["N s", "N m", "kg m s⁻²", "J s"], answer: 0, ms: ["A."] },
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A person stands in a lift accelerating upwards. The normal reaction on the person is:", options: ["less than their weight", "equal to their weight", "greater than their weight", "zero"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 360, tol: 1 }, q: "A 0.15 kg ball moving at 20 m s⁻¹ is stopped by a bat in 0.010 s, rebounding at 4.0 m s⁻¹. Calculate the average force on the ball in N.", ms: ["Δp = 0.15 × (20 + 4.0) = 3.6 N s [M1]", "F = 3.6 / 0.010 = 360 N [A1]"] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain, using Newton's laws, how a rocket accelerates in space.", ms: ["Rocket pushes exhaust gases backwards (force on gas) [1]", "Gases exert an equal and opposite force forwards on the rocket (Newton III) [1]", "Resultant force on the rocket so it accelerates / rate of change of momentum (Newton II) [1]"] },
    { paper: "P2", marks: 2, diff: 3, numeric: { value: 5400, tol: 10 }, q: "A 1200 kg car rounds a bend of radius 50 m at 15 m s⁻¹. Calculate the friction force needed, in N.", ms: ["F = mv²/r = 1200 × 15² / 50 [M1]", "5400 N [A1]"] },
  ],
  "phys-3": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "The kinetic energy of an object is doubled. Its speed increases by a factor of:", options: ["2", "√2", "4", "1/2"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 1, numeric: { value: 13.3, tol: 0.1 }, q: "A 0.20 kg ball falls from rest through 9.0 m. Ignoring air resistance, calculate its speed, in m s⁻¹, at the bottom.", ms: ["mgh = ½mv² → v = √(2 × 9.81 × 9.0) [M1]", "13.3 m s⁻¹ [A1]"] },
    { paper: "P2", marks: 3, diff: 2, numeric: { value: 32, tol: 0.5 }, q: "An electric motor takes 500 W and lifts a 40 kg mass at 0.40 m s⁻¹. Calculate the efficiency of the motor as a percentage.", ms: ["Useful power = mgv = 40 × 9.81 × 0.40 = 157 W [M1]", "Efficiency = 157 / 500 [M1]", "≈ 31-32 % (32) [A1]"] },
    { paper: "P2", marks: 2, diff: 2, q: "State the principle of conservation of energy and give one example of energy being dissipated.", ms: ["Energy cannot be created or destroyed, only transferred / total energy of an isolated system is constant [1]", "Example, e.g. thermal energy from friction / sound [1]"] },
  ],
  "phys-4": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A spinning skater pulls in their arms. Their angular velocity:", options: ["decreases", "increases", "stays the same", "becomes zero"], answer: 1, ms: ["B. Angular momentum conserved, moment of inertia falls."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 12, tol: 0.05 }, q: "A force of 30 N acts perpendicular to a spanner at 0.40 m from the bolt. Calculate the torque in N m.", ms: ["τ = Fr = 30 × 0.40 [M1]", "12 N m [A1]"] },
    { paper: "P2", marks: 3, diff: 3, q: "State the two conditions for a rigid body to be in equilibrium and explain why both are needed.", ms: ["Resultant force is zero (translational equilibrium) [1]", "Resultant torque about any point is zero (rotational equilibrium) [1]", "A body can have zero resultant force but still rotate (a couple) [1]"] },
  ],
  "phys-5": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A clock moving at high speed relative to an observer appears to the observer to:", options: ["run fast", "run slow", "run at the same rate", "stop"], answer: 1, ms: ["B. Time dilation."] },
    { paper: "P2", marks: 2, diff: 3, numeric: { value: 1.67, tol: 0.02 }, q: "Calculate the Lorentz factor γ for an object moving at 0.80c.", ms: ["γ = 1/√(1 − 0.64) [M1]", "1.67 [A1]"] },
    { paper: "P2", marks: 2, diff: 3, q: "State the two postulates of special relativity.", ms: ["The laws of physics are the same in all inertial frames of reference [1]", "The speed of light in a vacuum is the same for all inertial observers [1]"] },
  ],
  "phys-6": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "During melting, the temperature of a pure solid:", options: ["rises steadily", "stays constant", "falls", "rises then falls"], answer: 1, ms: ["B. Energy breaks bonds; average KE unchanged."] },
    { paper: "P2", marks: 3, diff: 2, numeric: { value: 209000, tol: 1500 }, q: "Calculate the total energy, in J, needed to melt 0.50 kg of ice at 0 °C and warm the water to 20 °C. (L = 3.34 × 10⁵ J kg⁻¹, c = 4180 J kg⁻¹ K⁻¹)", ms: ["mL = 0.50 × 3.34 × 10⁵ = 1.67 × 10⁵ J [M1]", "mcΔT = 0.50 × 4180 × 20 = 4.18 × 10⁴ J [M1]", "Total = 2.09 × 10⁵ J (209 000 J) [A1]"] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain, in terms of particles, why the temperature of a substance stays constant while it boils.", ms: ["Energy supplied is used to overcome intermolecular forces / increase potential energy [1]", "Average kinetic energy of particles does not change [1]", "Temperature is a measure of average kinetic energy, so it stays constant [1]"] },
  ],
  "phys-7": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Greenhouse gases absorb mainly:", options: ["ultraviolet radiation from the Sun", "infrared radiation emitted by the Earth", "visible light", "radio waves"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 3, numeric: { value: 255, tol: 3 }, q: "Estimate, in K, Earth's mean surface temperature with no atmosphere. Albedo = 0.30, solar constant = 1360 W m⁻², emissivity = 1.", ms: ["Absorbed per m² = 0.70 × 1360 ÷ 4 = 238 W m⁻² [M1]", "238 = 5.67 × 10⁻⁸ T⁴ [M1]", "T = 255 K [A1]"] },
    { paper: "P2", marks: 2, diff: 2, q: "Explain how melting polar ice can increase the rate of global warming.", ms: ["Ice has a high albedo; exposed water/land has a lower albedo [1]", "More radiation absorbed, further warming (positive feedback) [1]"] },
  ],
  "phys-8": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "Absolute zero is:", options: ["0 °C", "−273 °C", "−100 °C", "273 K"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 0.0404, tol: 0.0005 }, q: "Calculate the number of moles of an ideal gas in a 1.0 dm³ container at 100 kPa and 298 K. (R = 8.31 J K⁻¹ mol⁻¹)", ms: ["n = pV/RT = 100 000 × 1.0 × 10⁻³ / (8.31 × 298) [M1]", "0.0404 mol [A1]"] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain, using the kinetic model, why the pressure of a gas increases when it is heated at constant volume.", ms: ["Particles move faster / higher average kinetic energy [1]", "Collide with the walls more frequently [1]", "And with a greater change of momentum per collision, so greater force and pressure [1]"] },
  ],
  "phys-9": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "In an adiabatic compression of a gas:", options: ["Q = 0 and internal energy increases", "temperature is constant", "W = 0", "internal energy decreases"], answer: 0, ms: ["A."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 0.35, tol: 0.005 }, q: "A heat engine takes in 2000 J and rejects 1300 J. Calculate its efficiency (as a decimal).", ms: ["W = 2000 − 1300 = 700 J [M1]", "η = 700/2000 = 0.35 [A1]"] },
    { paper: "P2", marks: 2, diff: 3, q: "State the second law of thermodynamics in terms of entropy and explain why no heat engine can be 100% efficient.", ms: ["The entropy of an isolated system never decreases [1]", "Some energy must be transferred to a cold reservoir, so not all heat can become work [1]"] },
  ],
  "phys-10": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "Two 4.0 Ω resistors are connected in parallel. The total resistance is:", options: ["0.5 Ω", "2.0 Ω", "4.0 Ω", "8.0 Ω"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 3, diff: 2, numeric: { value: 1.5, tol: 0.02 }, q: "A cell of emf 6.0 V and internal resistance 1.0 Ω is connected to a 3.0 Ω resistor. Calculate the current in A.", ms: ["I = ε/(R + r) [M1]", "= 6.0/4.0 [M1]", "1.5 A [A1]"] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 4.5, tol: 0.05 }, q: "A 6.0 V cell (internal resistance 1.0 Ω) drives 1.5 A through a resistor. Calculate the terminal potential difference in V.", ms: ["V = ε − Ir = 6.0 − 1.5 × 1.0 [M1]", "4.5 V [A1]"] },
    { paper: "P2", marks: 2, diff: 2, q: "Explain why the resistance of a filament lamp increases as the current increases.", ms: ["Temperature of the filament increases [1]", "Ions vibrate more, so more collisions with electrons / greater resistance [1]"] },
  ],
  "phys-11": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "The period of a mass-spring system is doubled by:", options: ["doubling the mass", "quadrupling the mass", "halving the spring constant", "doubling the amplitude"], answer: 1, ms: ["B. T ∝ √m."] },
    { paper: "P2", marks: 2, diff: 2, q: "State the two conditions for simple harmonic motion.", ms: ["Acceleration is proportional to displacement from equilibrium [1]", "Acceleration is directed towards the equilibrium position [1]"] },
    { paper: "P2", marks: 3, diff: 2, q: "Describe the energy changes during one complete oscillation of a pendulum with no damping.", ms: ["Maximum gravitational potential energy at the extremes, zero kinetic energy [1]", "Maximum kinetic energy at the equilibrium position [1]", "Total energy remains constant throughout [1]"] },
  ],
  "phys-12": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "Which electromagnetic waves have the shortest wavelength?", options: ["Radio", "Visible", "X-rays", "Gamma rays"], answer: 3, ms: ["D."] },
    { paper: "P2", marks: 2, diff: 1, numeric: { value: 0.68, tol: 0.01 }, q: "A sound wave of frequency 500 Hz travels at 340 m s⁻¹. Calculate its wavelength in m.", ms: ["λ = v/f = 340/500 [M1]", "0.68 m [A1]"] },
  ],
  "phys-13": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "When light passes from air into glass:", options: ["speed and frequency decrease", "speed decreases, frequency unchanged", "wavelength increases", "frequency increases"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 19.5, tol: 0.3 }, q: "Light travels from air into glass (n = 1.50) at an angle of incidence of 30°. Calculate the angle of refraction in degrees.", ms: ["sin r = sin 30° / 1.50 [M1]", "19.5° [A1]"] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain how a double-slit arrangement produces bright and dark fringes.", ms: ["Light diffracts at each slit and the waves overlap/superpose [1]", "Bright fringes where path difference = nλ (constructive interference) [1]", "Dark fringes where path difference = (n + ½)λ (destructive interference) [1]"] },
  ],
  "phys-14": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Points between two adjacent nodes on a standing wave oscillate:", options: ["in phase", "in antiphase", "with equal amplitude", "with a phase difference of 90°"], answer: 0, ms: ["A."] },
    { paper: "P2", marks: 3, diff: 2, q: "Compare a standing wave with a travelling wave.", ms: ["Standing waves do not transfer energy; travelling waves do [1]", "Amplitude varies with position in a standing wave (nodes and antinodes); constant for a travelling wave [1]", "Points between adjacent nodes are in phase; in a travelling wave phase varies continuously [1]"] },
    { paper: "P2", marks: 2, diff: 3, numeric: { value: 750, tol: 3 }, q: "The fundamental frequency of a pipe closed at one end is 250 Hz. Calculate the frequency, in Hz, of the next harmonic.", ms: ["Only odd harmonics: next is 3f [M1]", "750 Hz [A1]"] },
  ],
  "phys-15": [
    { paper: "P2", marks: 3, diff: 2, q: "Explain, with reference to wavefronts, why the pitch of a siren appears higher as the vehicle approaches.", ms: ["The source moves towards the observer between emitting successive wavefronts [1]", "Wavefronts are closer together / shorter observed wavelength [1]", "So a higher frequency is observed [1]"] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 0.01, tol: 0.0005 }, q: "A galaxy's spectral line shows a fractional wavelength shift Δλ/λ of 0.010. Calculate its recession speed as a fraction of c.", ms: ["v/c ≈ Δλ/λ [M1]", "0.010 c [A1]"] },
  ],
  "phys-16": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A satellite moves to an orbit with a larger radius. Its orbital speed:", options: ["increases", "decreases", "stays the same", "becomes zero"], answer: 1, ms: ["B. v = √(GM/r)."] },
    { paper: "P2", marks: 3, diff: 3, numeric: { value: 7700, tol: 100 }, q: "Calculate the orbital speed, in m s⁻¹, of a satellite 400 km above Earth's surface. (M = 5.97 × 10²⁴ kg, R = 6.37 × 10⁶ m)", ms: ["r = 6.37 × 10⁶ + 4.0 × 10⁵ = 6.77 × 10⁶ m [M1]", "v = √(GM/r) [M1]", "≈ 7.7 × 10³ m s⁻¹ (7700) [A1]"] },
    { paper: "P2", marks: 2, diff: 2, q: "Explain why an astronaut in an orbiting space station feels weightless.", ms: ["The astronaut and the station are both in free fall / have the same acceleration towards Earth [1]", "So there is no normal (contact) force between them [1]"] },
  ],
  "phys-17": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "Electric field lines point:", options: ["from negative to positive", "from positive to negative", "around a current", "towards the north pole"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, q: "Outline one similarity and one difference between gravitational and electric fields.", ms: ["Similarity: both inverse-square laws for point sources / both field = force per unit (mass or charge) [1]", "Difference: gravity is only attractive; electric force can attract or repel [1]"] },
  ],
  "phys-18": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "Two parallel wires carry currents in the same direction. The wires:", options: ["attract", "repel", "have no force between them", "rotate"], answer: 0, ms: ["A."] },
    { paper: "P2", marks: 3, diff: 3, q: "Explain why a charged particle moving perpendicular to a uniform magnetic field moves in a circle.", ms: ["Magnetic force is always perpendicular to the velocity [1]", "Force has constant magnitude qvB, so speed is constant [1]", "The force provides the centripetal force, so the path is circular [1]"] },
  ],
  "phys-19": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "The unit of magnetic flux is:", options: ["tesla", "weber", "henry", "volt"], answer: 1, ms: ["B."] },
    { paper: "P2", marks: 2, diff: 2, q: "State Faraday's law and Lenz's law.", ms: ["Faraday: induced emf is proportional to the rate of change of magnetic flux linkage [1]", "Lenz: the induced emf/current opposes the change that produces it [1]"] },
  ],
  "phys-20": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 1, q: "A nucleus of ¹⁴C contains:", options: ["6 protons and 8 neutrons", "8 protons and 6 neutrons", "6 protons and 14 neutrons", "14 protons"], answer: 0, ms: ["A."] },
    { paper: "P2", marks: 3, diff: 2, q: "Explain how line emission spectra provide evidence for discrete energy levels in atoms.", ms: ["Only specific wavelengths/frequencies are emitted [1]", "Each photon has energy E = hf equal to the difference between two levels [1]", "So only certain energy differences, hence discrete levels, exist [1]"] },
  ],
  "phys-21": [
    { paper: "P2", marks: 3, diff: 3, numeric: { value: 1.23, tol: 0.02 }, q: "Light of wavelength 400 nm falls on a metal with work function 1.87 eV. Calculate the maximum kinetic energy of the photoelectrons in eV.", ms: ["E = hc/λ = 4.97 × 10⁻¹⁹ J = 3.10 eV [M1]", "Ek = 3.10 − 1.87 [M1]", "1.23 eV [A1]"] },
    { paper: "P2", marks: 2, diff: 3, q: "Outline what is meant by wave-particle duality, with one piece of evidence for each nature of electrons.", ms: ["Particle: electrons have mass/charge, deflected by fields / photoelectric emission [1]", "Wave: electron diffraction through a crystal / de Broglie wavelength [1]"] },
  ],
  "phys-22": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "In β⁻ decay the nucleon number:", options: ["increases by 1", "decreases by 1", "stays the same", "decreases by 4"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 2, diff: 2, numeric: { value: 25, tol: 0.1 }, q: "A sample has an activity of 400 Bq. Calculate its activity, in Bq, after four half-lives.", ms: ["400 ÷ 2⁴ [M1]", "25 Bq [A1]"] },
    { paper: "P2", marks: 3, diff: 3, q: "Explain why the binding energy per nucleon curve shows that both fission and fusion release energy.", ms: ["Binding energy per nucleon peaks near iron-56 [1]", "Fission of heavy nuclei and fusion of light nuclei both form products with higher binding energy per nucleon [1]", "The increase in total binding energy is released (mass defect converted to energy) [1]"] },
  ],
  "phys-23": [
    { paper: "P2", marks: 3, diff: 2, q: "Explain the role of control rods and the consequences if they were fully removed.", ms: ["Control rods absorb neutrons [1]", "This controls the number of neutrons available for further fission / keeps the reaction steady [1]", "Removing them leads to an uncontrolled chain reaction / overheating / meltdown [1]"] },
  ],
  "phys-24": [
    { type: "mcq", paper: "P1A", marks: 1, diff: 2, q: "A low-mass star like the Sun will end its life as a:", options: ["neutron star", "black hole", "white dwarf", "supernova"], answer: 2, ms: ["C."] },
    { paper: "P2", marks: 3, diff: 3, q: "Describe the evolution of a star much more massive than the Sun after it leaves the main sequence.", ms: ["Becomes a red supergiant, fusing heavier elements [1]", "Core collapses when fusion stops (iron core) - supernova [1]", "Remnant is a neutron star or black hole depending on mass [1]"] },
  ],
});
