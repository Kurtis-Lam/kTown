/* Parametric question generators: unlimited fresh, auto-markable practice questions.
   Each generator returns { q, marks, ms, numeric:{value,tol}, paper, diff }. */
(function () {
  "use strict";
  const IB = window.IB;
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // integer in [a, b]
  const P = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const sig = (x, s = 3) => {
    if (!isFinite(x)) return String(x);
    if (x === 0) return "0";
    const v = Number(x.toPrecision(s));
    return Math.abs(v) >= 1e6 || Math.abs(v) < 1e-3 ? v.toExponential(s - 1) : String(v);
  };
  const dp = (x, d = 2) => Number(x.toFixed(d));
  const money = (x) => x.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const G = {
    // ===================== ECONOMICS =====================
    "econ-5": [
      () => {
        const p1 = R(4, 20), dpPct = P([5, 10, 15, 20, 25]), up = Math.random() < 0.5;
        const p2 = dp(p1 * (1 + (up ? dpPct : -dpPct) / 100));
        const q1 = R(10, 90) * 100, ped = P([0.2, 0.4, 0.5, 0.8, 1.2, 1.5, 2, 2.5]);
        const dq = (up ? -1 : 1) * ped * dpPct;
        const q2 = Math.round(q1 * (1 + dq / 100));
        const val = ((q2 - q1) / q1) / ((p2 - p1) / p1);
        return { paper: "P2", marks: 2, diff: 2, q: `The price of a good changes from $${p1} to $${p2} and quantity demanded changes from ${q1.toLocaleString()} to ${q2.toLocaleString()} units per week. Calculate the PED and state whether demand is elastic or inelastic.`, numeric: { value: dp(val), tol: 0.03 },
          ms: [`%ΔQd = ${dp(((q2 - q1) / q1) * 100, 1)}%, %ΔP = ${dp(((p2 - p1) / p1) * 100, 1)}% [M1]`, `PED = ${dp(val)} → ${Math.abs(val) > 1 ? "price elastic" : "price inelastic"} [A1]`] };
      },
      () => {
        const y = P([2, 4, 5, 8, 10]), yed = P([-0.5, -0.8, 0.4, 0.6, 1.5, 2.2]);
        const dq = dp(yed * y, 1);
        return { paper: "P2", marks: 2, diff: 2, q: `Average household income rises by ${y}% and demand for a good changes by ${dq}%. Calculate the YED and identify the type of good.`, numeric: { value: yed, tol: 0.02 },
          ms: [`YED = ${dq}/${y} [M1]`, `= ${yed} → ${yed < 0 ? "inferior good" : yed > 1 ? "normal, income-elastic (luxury) good" : "normal, income-inelastic (necessity) good"} [A1]`] };
      },
      () => {
        const p = P([2, 3, 4, 5, 8, 10]), q = R(20, 80) * 100, rise = P([10, 20]), ped = P([0.3, 0.5, 1.5, 2]);
        const p2 = dp(p * (1 + rise / 100)), q2 = Math.round(q * (1 - (ped * rise) / 100));
        const change = p2 * q2 - p * q;
        return { paper: "P2", marks: 2, diff: 2, q: `A firm raises its price from $${p} to $${p2}. Quantity sold falls from ${q} to ${q2}. Calculate the change in total revenue (in $; use a negative sign for a fall).`, numeric: { value: dp(change), tol: 1 },
          ms: [`TR before = $${money(p * q)}, after = $${money(p2 * q2)} [M1]`, `Change = $${money(dp(change))} (demand is ${ped < 1 ? "inelastic" : "elastic"}) [A1]`] };
      },
    ],
    "econ-3": [
      () => {
        const a = R(8, 20), pe = R(2, a - 2), qe = R(2, 12) * 100;
        const cs = 0.5 * qe * (a - pe);
        return { paper: "P2", marks: 2, diff: 2, q: `A linear demand curve meets the price axis at $${a}. The equilibrium price is $${pe} and equilibrium quantity is ${qe} units. Calculate consumer surplus.`, numeric: { value: cs, tol: 0.5 }, ms: [`½ × ${qe} × (${a} − ${pe}) [M1]`, `= $${money(cs)} [A1]`] };
      },
    ],
    "econ-6": [
      () => {
        const t = P([0.5, 1, 1.5, 2, 3]), q = R(5, 60) * 1000;
        return { paper: "P2", marks: 2, diff: 1, q: `A specific tax of $${t} per unit is imposed. After the tax, ${q.toLocaleString()} units are sold. Calculate government tax revenue.`, numeric: { value: t * q, tol: 0.5 }, ms: [`$${t} × ${q} [M1]`, `= $${money(t * q)} [A1]`] };
      },
      () => {
        const t = P([2, 3, 4, 5]), share = P([0.25, 0.4, 0.5, 0.6, 0.75]), p0 = R(8, 30), q = R(2, 20) * 1000;
        const pc = dp(p0 + t * share);
        return { paper: "P2", marks: 2, diff: 3, q: `Before a $${t} per-unit tax the price was $${p0}. After the tax the consumer price is $${pc} and ${q.toLocaleString()} units are sold. Calculate the total tax burden paid by producers.`, numeric: { value: dp(t * (1 - share) * q), tol: 1 },
          ms: [`Producer burden per unit = $${t} − ($${pc} − $${p0}) = $${dp(t * (1 - share))} [M1]`, `× ${q} = $${money(dp(t * (1 - share) * q))} [A1]`] };
      },
    ],
    "econ-9": [
      () => {
        const g1 = R(200, 900), infl = P([2, 3, 4, 5, 6]), real = P([-1, 1, 2, 3, 4]);
        const d2 = 100 + infl, n2 = dp((g1 * (1 + real / 100) * d2) / 100, 1);
        const r2 = (n2 / d2) * 100, gr = ((r2 - g1) / g1) * 100;
        return { paper: "P2", marks: 2, diff: 2, q: `Nominal GDP was $${g1} bn in year 1 (base year, deflator = 100) and $${n2} bn in year 2, when the GDP deflator was ${d2}. Calculate the real GDP growth rate.`, numeric: { value: dp(gr, 2), tol: 0.06 },
          ms: [`Real GDP year 2 = ${n2}/${d2} × 100 = ${dp(r2, 1)} [M1]`, `Growth = ${dp(gr, 2)}% [A1]`] };
      },
    ],
    "econ-11": [
      () => {
        const lf = R(5, 60), rate = P([3.5, 4, 5, 6.5, 8, 12]);
        const u = dp((lf * rate) / 100, 3);
        return { paper: "P2", marks: 2, diff: 1, q: `A labour force of ${lf} million includes ${u} million unemployed people. Calculate the unemployment rate.`, numeric: { value: rate, tol: 0.05 }, ms: [`${u}/${lf} × 100 [M1]`, `= ${rate}% [A1]`] };
      },
      () => {
        const c1 = R(100, 140), inf = P([1.5, 2, 2.5, 3, 4.5, 7, 9]);
        const c2 = dp(c1 * (1 + inf / 100), 2);
        return { paper: "P2", marks: 2, diff: 1, q: `The consumer price index rose from ${c1} to ${c2}. Calculate the rate of inflation.`, numeric: { value: inf, tol: 0.05 }, ms: [`(${c2} − ${c1})/${c1} × 100 [M1]`, `= ${inf}% [A1]`] };
      },
    ],
    "econ-12": [
      () => {
        const t1 = R(8, 15) * 1000, t2 = R(35, 60) * 1000, r1 = P([10, 15, 20, 25]), r2 = P([30, 40, 45]), inc = R(t2 / 1000 + 5, 120) * 1000;
        const tax = (r1 / 100) * (t2 - t1) + (r2 / 100) * (inc - t2);
        return { paper: "P2", marks: 2, diff: 2, q: `Income tax is 0% on the first $${t1.toLocaleString()}, ${r1}% on income from $${t1.toLocaleString()} to $${t2.toLocaleString()}, and ${r2}% above $${t2.toLocaleString()}. Calculate the tax paid on an income of $${inc.toLocaleString()}.`, numeric: { value: tax, tol: 1 },
          ms: [`${r1}% × ${t2 - t1} + ${r2}% × ${inc - t2} [M1]`, `= $${money(tax)} (average rate ${dp((tax / inc) * 100, 1)}%) [A1]`] };
      },
    ],
    "econ-17": [
      () => {
        const pairs = [["US$", "€", 0.92], ["US$", "¥", 148], ["£", "US$", 1.27], ["€", "₹", 90], ["AU$", "US$", 0.66]];
        const [a, b, r] = P(pairs), amt = R(2, 90) * 100;
        return { paper: "P2", marks: 2, diff: 1, q: `The exchange rate is ${a}1 = ${b}${r}. Calculate the price in ${b} of a product priced at ${a}${amt.toLocaleString()}.`, numeric: { value: dp(amt * r), tol: Math.max(0.5, amt * r * 0.002) }, ms: [`${amt} × ${r} [M1]`, `= ${b}${money(dp(amt * r))} [A1]`] };
      },
      () => {
        const r1 = R(100, 200), r2 = r1 + P([-15, -10, 10, 15, 20]);
        const pct = ((r2 - r1) / r1) * 100;
        return { paper: "P2", marks: 2, diff: 2, q: `The exchange rate changes from £1 = ¥${r1} to £1 = ¥${r2}. Calculate the percentage change in the value of the pound against the yen.`, numeric: { value: dp(pct, 2), tol: 0.05 }, ms: [`(${r2} − ${r1})/${r1} × 100 [M1]`, `= ${dp(pct, 2)}% (${pct > 0 ? "appreciation" : "depreciation"} of the pound) [A1]`] };
      },
    ],

    // ===================== CHEMISTRY =====================
    "chem-1": [
      () => {
        const els = [["Cl", 35, 37, 75.8], ["B", 10, 11, 19.9], ["Cu", 63, 65, 69.2], ["Ga", 69, 71, 60.1], ["Br", 79, 81, 50.7], ["Ag", 107, 109, 51.8]];
        const [s, m1, m2, a] = P(els);
        const ar = (m1 * a + m2 * (100 - a)) / 100;
        return { paper: "P2", marks: 2, diff: 1, q: `An element contains ${a}% of the isotope with mass ${m1} and ${dp(100 - a, 1)}% of the isotope with mass ${m2}. Calculate its relative atomic mass to 2 d.p.`, numeric: { value: dp(ar, 2), tol: 0.015 }, ms: [`(${m1} × ${a} + ${m2} × ${dp(100 - a, 1)})/100 [M1]`, `= ${dp(ar, 2)} [A1]`] };
      },
    ],
    "chem-3": [
      () => {
        const cmp = [["H₂O", 18.02], ["CO₂", 44.01], ["NaCl", 58.44], ["CaCO₃", 100.09], ["C₆H₁₂O₆", 180.18], ["NaOH", 40.0], ["H₂SO₄", 98.08]];
        const [f, M] = P(cmp), m = dp(R(5, 200) / 10, 1);
        return { paper: "P2", marks: 1, diff: 1, q: `Calculate the amount (in mol) of ${f} in ${m} g. (M = ${M} g mol⁻¹)`, numeric: { value: Number(sig(m / M)), tol: Math.max(0.0015, (m / M) * 0.006) }, ms: [`n = ${m}/${M} = ${sig(m / M)} mol [A1]`] };
      },
      () => {
        const n = dp(R(5, 80) / 100, 2), v = R(100, 500);
        const c = n / (v / 1000);
        return { paper: "P2", marks: 2, diff: 1, q: `${n} mol of solute is dissolved in water to make ${v} cm³ of solution. Calculate the concentration in mol dm⁻³.`, numeric: { value: Number(sig(c)), tol: c * 0.006 }, ms: [`V = ${v / 1000} dm³ [M1]`, `c = ${sig(c)} mol dm⁻³ [A1]`] };
      },
      () => {
        const n = dp(R(5, 60) / 100, 2), T = R(273, 373), p = R(80, 250);
        const V = ((n * 8.31 * T) / (p * 1000)) * 1000;
        return { paper: "P2", marks: 2, diff: 2, q: `Calculate the volume, in dm³, occupied by ${n} mol of an ideal gas at ${T} K and ${p} kPa. (R = 8.31 J K⁻¹ mol⁻¹)`, numeric: { value: Number(sig(V)), tol: V * 0.006 }, ms: [`V = nRT/p = ${n} × 8.31 × ${T}/${p * 1000} m³ [M1]`, `= ${sig(V)} dm³ [A1]`] };
      },
      () => {
        const c1 = P([1.0, 2.0, 0.5, 0.25]), c2 = P([0.1, 0.05, 0.2]), v2 = P([100, 250, 500]);
        const v1 = (c2 * v2) / c1;
        return { paper: "P2", marks: 2, diff: 1, q: `What volume, in cm³, of ${c1} mol dm⁻³ stock solution is needed to prepare ${v2} cm³ of ${c2} mol dm⁻³ solution?`, numeric: { value: dp(v1, 2), tol: 0.02 }, ms: [`c₁V₁ = c₂V₂ → V₁ = ${c2} × ${v2}/${c1} [M1]`, `= ${dp(v1, 2)} cm³ [A1]`] };
      },
    ],
    "chem-7": [
      () => {
        const m = P([50, 100, 150, 200]), dT = dp(R(20, 150) / 10, 1), n = dp(R(5, 50) / 1000, 3);
        const dH = -((m * 4.18 * dT) / 1000) / n;
        return { paper: "P2", marks: 3, diff: 2, q: `A reaction of ${n} mol of reactant raises the temperature of ${m} g of water by ${dT} °C. Calculate the enthalpy change in kJ mol⁻¹ (c = 4.18 J g⁻¹ K⁻¹).`, numeric: { value: Number(sig(dH)), tol: Math.abs(dH) * 0.008 },
          ms: [`q = ${m} × 4.18 × ${dT} = ${dp(m * 4.18 * dT, 1)} J [M1]`, `ΔH = −q/n [M1]`, `= ${sig(dH)} kJ mol⁻¹ (negative - exothermic) [A1]`] };
      },
    ],
    "chem-8": [
      () => {
        const th = dp(R(20, 100) / 10, 1), y = R(45, 95);
        const act = dp((th * y) / 100, 2);
        return { paper: "P2", marks: 1, diff: 1, q: `The theoretical yield of a product is ${th} g and ${act} g is obtained. Calculate the percentage yield.`, numeric: { value: dp((act / th) * 100, 1), tol: 0.2 }, ms: [`${act}/${th} × 100 = ${dp((act / th) * 100, 1)}% [A1]`] };
      },
      () => {
        const ca = P([0.1, 0.1, 0.2, 0.05]), va = dp(R(180, 280) / 10, 2), vb = 25.0, ratio = P([1, 2]);
        const acid = ratio === 2 ? "H₂SO₄" : "HCl", base = "NaOH";
        const nb = ca * (va / 1000) * ratio, cb = nb / (vb / 1000);
        return { paper: "P2", marks: 3, diff: 2, q: `${vb.toFixed(2)} cm³ of ${base} solution is neutralised by ${va} cm³ of ${ca} mol dm⁻³ ${acid}. Calculate the concentration of the ${base}.`, numeric: { value: Number(sig(cb)), tol: cb * 0.006 },
          ms: [`n(${acid}) = ${ca} × ${va / 1000} [M1]`, `n(NaOH) = ${ratio === 2 ? "2 ×" : "1 ×"} n(acid) = ${sig(nb)} mol [M1]`, `c = ${sig(cb)} mol dm⁻³ [A1]`] };
      },
    ],
    "chem-10": [
      () => {
        const a = dp(R(5, 50) / 100, 2), b = dp(R(5, 50) / 100, 2), c = dp(R(20, 150) / 100, 2);
        const K = (c * c) / (a * b);
        return { paper: "P2", marks: 2, diff: 2, q: `For H₂(g) + I₂(g) ⇌ 2HI(g), the equilibrium concentrations are [H₂] = ${a}, [I₂] = ${b} and [HI] = ${c} mol dm⁻³. Calculate Kc.`, numeric: { value: Number(sig(K)), tol: K * 0.008 }, ms: [`Kc = ${c}²/(${a} × ${b}) [M1]`, `= ${sig(K)} [A1]`] };
      },
    ],
    "chem-11": [
      () => {
        const c = P([0.1, 0.05, 0.02, 0.01, 0.005, 0.25, 0.001]), base = Math.random() < 0.5;
        const ph = base ? 14 + Math.log10(c) : -Math.log10(c);
        return { paper: "P2", marks: 2, diff: 2, q: `Calculate the pH of ${c} mol dm⁻³ ${base ? "NaOH" : "HCl"} at 298 K.`, numeric: { value: dp(ph, 2), tol: 0.02 }, ms: [base ? `pOH = −log(${c}) = ${dp(-Math.log10(c), 2)} [M1]` : `[H⁺] = ${c} [M1]`, `pH = ${dp(ph, 2)} [A1]`] };
      },
    ],

    // ===================== GEOGRAPHY =====================
    "geo-1": [
      () => {
        const y = R(10, 45), o = R(5, 30), w = R(40, 70);
        const tot = y + o + w, yn = dp((y / tot) * 100, 1), on = dp((o / tot) * 100, 1), wn = dp(100 - yn - on, 1);
        const dr = ((yn + on) / wn) * 100;
        return { paper: "P2", marks: 2, diff: 1, q: `In a country, ${yn}% of people are aged 0-14, ${on}% are aged 65+, and ${wn}% are aged 15-64. Calculate the dependency ratio.`, numeric: { value: dp(dr, 1), tol: 0.3 }, ms: [`(${yn} + ${on})/${wn} × 100 [M1]`, `= ${dp(dr, 1)} [A1]`] };
      },
      () => {
        const pop = R(2, 300), area = R(10, 3000);
        const d = (pop * 1e6) / (area * 1000);
        return { paper: "P2", marks: 1, diff: 1, q: `A country has a population of ${pop} million and an area of ${area} thousand km². Calculate its population density (people per km²).`, numeric: { value: Number(sig(d)), tol: d * 0.01 }, ms: [`${pop} 000 000 ÷ ${area} 000 = ${sig(d)} people per km² [A1]`] };
      },
      () => {
        const cbr = R(8, 45), cdr = R(5, 15);
        const ni = (cbr - cdr) / 10;
        return { paper: "P2", marks: 2, diff: 1, q: `A country has a crude birth rate of ${cbr} per 1000 and a crude death rate of ${cdr} per 1000. Calculate the rate of natural increase as a percentage${ni > 0 ? " and estimate the doubling time using the rule of 70" : ""}.`, numeric: { value: ni, tol: 0.01 }, ms: [`(${cbr} − ${cdr})/10 = ${ni}% [A1]`, ni > 0 ? `Doubling time ≈ 70/${ni} = ${dp(70 / ni, 1)} years [A1]` : "Natural decrease - population falls without migration [A1]"] };
      },
    ],
    "geo-8": [
      () => {
        const h1 = R(0, 18), lag = R(4, 30);
        const tot = h1 + lag, day = tot >= 24 ? " on the following day" : "";
        const h2 = tot % 24;
        return { paper: "P1", marks: 1, diff: 1, q: `Peak rainfall occurred at ${String(h1).padStart(2, "0")}:00 and peak discharge at ${String(h2).padStart(2, "0")}:00${day}. Calculate the lag time in hours.`, numeric: { value: lag, tol: 0.01 }, ms: [`Lag time = ${lag} hours [A1]`] };
      },
    ],
    "geo-12": [
      () => {
        const n = P([8, 10, 12, 15]), d2 = R(10, Math.round((n * (n * n - 1)) / 6 - 5));
        const rs = 1 - (6 * d2) / (n * (n * n - 1));
        return { paper: "P2", marks: 2, diff: 2, q: `A Spearman's rank test with ${n} pairs of data gives Σd² = ${d2}. Calculate the Spearman's rank correlation coefficient and describe the correlation.`, numeric: { value: dp(rs, 3), tol: 0.005 },
          ms: [`rs = 1 − (6 × ${d2})/(${n}(${n * n} − 1)) [M1]`, `= ${dp(rs, 3)} → ${Math.abs(rs) > 0.7 ? "strong" : Math.abs(rs) > 0.4 ? "moderate" : "weak"} ${rs >= 0 ? "positive" : "negative"} correlation [A1]`] };
      },
    ],

    // ===================== MATHEMATICS =====================
    "math-1": [
      () => {
        const a = R(-10, 20), d = R(-5, 9) || 3, n = R(8, 30);
        const un = a + (n - 1) * d;
        return { paper: "P1", marks: 2, diff: 1, q: `An arithmetic sequence has first term ${a} and common difference ${d}. Find the ${n}th term.`, numeric: { value: un, tol: 0.001 }, ms: [`\\(u_{${n}} = ${a} + ${n - 1}(${d})\\) [M1]`, `= ${un} [A1]`] };
      },
      () => {
        const a = R(1, 15), d = R(2, 8), n = R(10, 40);
        const s = (n / 2) * (2 * a + (n - 1) * d);
        return { paper: "P1", marks: 3, diff: 2, q: `Find the sum of the first ${n} terms of the arithmetic series ${a} + ${a + d} + ${a + 2 * d} + …`, numeric: { value: s, tol: 0.001 }, ms: [`d = ${d} [A1]`, `\\(S_{${n}} = \\frac{${n}}{2}(2(${a}) + ${n - 1}(${d}))\\) [M1]`, `= ${s} [A1]`] };
      },
      () => {
        const a = P([12, 18, 24, 30, 40, 60, 81, 100]), r = P([[1, 2], [1, 3], [2, 3], [3, 4], [1, 4], [-1, 2]]);
        const rv = r[0] / r[1], s = a / (1 - rv);
        return { paper: "P1", marks: 3, diff: 2, q: `Find the sum to infinity of the geometric series with first term ${a} and common ratio \\(${rv < 0 ? "-" : ""}\\frac{${Math.abs(r[0])}}{${r[1]}}\\).`, numeric: { value: dp(s, 4), tol: 0.005 }, ms: [`\\(|r| < 1\\) so converges [R1]`, `\\(S_\\infty = \\frac{${a}}{1 - (${dp(rv, 4)})}\\) [M1]`, `= ${dp(s, 4)} [A1]`] };
      },
      () => {
        const pv = R(10, 200) * 100, rate = P([2, 2.5, 3, 4, 4.5, 5, 6]), k = P([1, 4, 12]), n = R(3, 20);
        const fv = pv * Math.pow(1 + rate / (100 * k), k * n);
        return { paper: "P2", marks: 3, diff: 2, q: `$${pv.toLocaleString()} is invested at ${rate}% per annum compounded ${k === 1 ? "annually" : k === 4 ? "quarterly" : "monthly"}. Find the value after ${n} years, to the nearest dollar.`, numeric: { value: Math.round(fv), tol: 1.5 }, ms: [`\\(${pv}\\left(1 + \\frac{${rate}}{${100 * k}}\\right)^{${k * n}}\\) [M1][A1]`, `= $${Math.round(fv).toLocaleString()} [A1]`] };
      },
    ],
    "math-2": [
      () => {
        const b = P([2, 3, 4, 5, 10]), e = R(-2, 5);
        const v = Math.pow(b, e);
        return { paper: "P1", marks: 1, diff: 1, q: `Evaluate \\(\\log_{${b}} ${e < 0 ? `\\frac{1}{${Math.pow(b, -e)}}` : v}\\).`, numeric: { value: e, tol: 0.001 }, ms: [`\\(${b}^{${e}} = ${e < 0 ? `\\frac{1}{${Math.pow(b, -e)}}` : v}\\), so the answer is ${e} [A1]`] };
      },
      () => {
        const n0 = R(50, 500), k = P([0.05, 0.08, 0.1, 0.12, 0.2, 0.25]), mult = P([2, 3, 5, 10]);
        const t = Math.log(mult) / k;
        return { paper: "P2", marks: 3, diff: 2, q: `A quantity grows according to \\(N = ${n0}e^{${k}t}\\). Find the time taken for N to reach ${n0 * mult}.`, numeric: { value: Number(sig(t)), tol: t * 0.004 }, ms: [`\\(${n0 * mult} = ${n0}e^{${k}t}\\) [M1]`, `\\(t = \\frac{\\ln ${mult}}{${k}}\\) [A1]`, `t = ${sig(t)} [A1]`] };
      },
    ],
    "math-3": [
      () => {
        const n = R(4, 8), a = R(1, 3), b = R(1, 3) * P([1, -1]), r = R(1, n - 1);
        const nCr = (n, r) => { let x = 1; for (let i = 1; i <= r; i++) x = (x * (n - r + i)) / i; return Math.round(x); };
        const coef = nCr(n, r) * Math.pow(a, n - r) * Math.pow(b, r);
        return { paper: "P1", marks: 3, diff: 2, q: `Find the coefficient of \\(x^{${r}}\\) in the expansion of \\((${a} ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x)^{${n}}\\).`, numeric: { value: coef, tol: 0.001 },
          ms: [`\\(\\binom{${n}}{${r}}(${a})^{${n - r}}(${b}x)^{${r}}\\) [M1]`, `\\(${nCr(n, r)} \\times ${Math.pow(a, n - r)} \\times ${Math.pow(b, r)}\\) [A1]`, `= ${coef} [A1]`] };
      },
    ],
    "math-5": [
      () => {
        const c = P([4, 9, 16, 25, 36, 49]), a = P([1, 1, 4]);
        const k = 2 * Math.sqrt(a * c);
        return { paper: "P1", marks: 3, diff: 2, q: `Find the positive value of k for which \\(${a === 1 ? "" : a}x^2 + kx + ${c} = 0\\) has two equal real roots.`, numeric: { value: k, tol: 0.001 }, ms: [`\\(\\Delta = k^2 - 4(${a})(${c}) = 0\\) [M1]`, `\\(k^2 = ${4 * a * c}\\) [A1]`, `k = ${k} [A1]`] };
      },
      () => {
        const h = R(-6, 6), k = R(-9, 9), a = P([1, 2, -1, 3]);
        const b = -2 * a * h, c = a * h * h + k;
        const fmt = (n, x) => (n === 0 ? "" : `${n < 0 ? " - " : " + "}${Math.abs(n) === 1 && x ? "" : Math.abs(n)}${x}`);
        return { paper: "P1", marks: 2, diff: 2, q: `Find the y-coordinate of the vertex of \\(y = ${a === 1 ? "" : a === -1 ? "-" : a}x^2${fmt(b, "x")}${fmt(c, "")}\\).`, numeric: { value: k, tol: 0.001 }, ms: [`\\(x = -\\frac{b}{2a} = ${h}\\) [M1]`, `y = ${k} [A1]`] };
      },
    ],
    "math-7": [
      () => {
        const a = R(4, 15), b = R(4, 15), C = R(25, 140);
        const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((C * Math.PI) / 180));
        return { paper: "P2", marks: 3, diff: 2, q: `In triangle ABC, BC = ${a} cm, AC = ${b} cm and angle ACB = ${C}°. Find AB.`, numeric: { value: Number(sig(c)), tol: 0.01 }, ms: [`\\(AB^2 = ${a}^2 + ${b}^2 - 2(${a})(${b})\\cos ${C}°\\) [M1][A1]`, `AB = ${sig(c)} cm [A1]`] };
      },
      () => {
        const a = R(3, 14), b = R(3, 14), C = R(20, 150);
        const A = 0.5 * a * b * Math.sin((C * Math.PI) / 180);
        return { paper: "P2", marks: 2, diff: 1, q: `Find the area of a triangle with sides ${a} cm and ${b} cm enclosing an angle of ${C}°.`, numeric: { value: Number(sig(A)), tol: A * 0.005 }, ms: [`\\(\\frac{1}{2}(${a})(${b})\\sin ${C}°\\) [M1]`, `= ${sig(A)} cm² [A1]`] };
      },
      () => {
        const r = R(3, 20), th = dp(R(3, 30) / 10, 1);
        return { paper: "P2", marks: 2, diff: 1, q: `A sector has radius ${r} cm and angle ${th} radians. Find its area.`, numeric: { value: dp(0.5 * r * r * th, 2), tol: 0.02 }, ms: [`\\(\\frac{1}{2}(${r})^2(${th})\\) [M1]`, `= ${dp(0.5 * r * r * th, 2)} cm² [A1]`] };
      },
    ],
    "math-10": [
      () => {
        const pa = dp(R(2, 6) / 10, 1), pb = dp(R(2, 6) / 10, 1), indep = Math.random() < 0.5;
        const pab = indep ? dp(pa * pb, 2) : dp(Math.min(pa, pb) * P([0.3, 0.5]), 2);
        const union = dp(pa + pb - pab, 2);
        return { paper: "P1", marks: 2, diff: 1, q: `P(A) = ${pa}, P(B) = ${pb} and P(A ∩ B) = ${pab}. Find P(A ∪ B).`, numeric: { value: union, tol: 0.001 }, ms: [`${pa} + ${pb} − ${pab} [M1]`, `= ${union} [A1]`] };
      },
      () => {
        const r = R(3, 8), b = R(2, 7), t = r + b;
        const p = (r / t) * ((r - 1) / (t - 1));
        return { paper: "P1", marks: 3, diff: 2, q: `A bag contains ${r} red and ${b} blue counters. Two are taken without replacement. Find the probability that both are red (as a decimal to 4 d.p.).`, numeric: { value: dp(p, 4), tol: 0.0006 }, ms: [`\\(\\frac{${r}}{${t}} \\times \\frac{${r - 1}}{${t - 1}}\\) [M1][A1]`, `= ${dp(p, 4)} [A1]`] };
      },
    ],
    "math-11": [
      () => {
        const n = R(5, 20), p = P([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), k = R(1, Math.min(6, n - 1));
        let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
        const v = c * Math.pow(p, k) * Math.pow(1 - p, n - k);
        return { paper: "P2", marks: 2, diff: 2, q: `\\(X \\sim B(${n}, ${p})\\). Find P(X = ${k}).`, numeric: { value: dp(v, 4), tol: 0.0006 }, ms: [`\\(\\binom{${n}}{${k}}(${p})^{${k}}(${dp(1 - p, 2)})^{${n - k}}\\) [M1]`, `= ${dp(v, 4)} [A1]`] };
      },
      () => {
        const n = R(10, 60), p = P([0.1, 0.2, 0.25, 0.4, 0.5, 0.6]);
        return { paper: "P1", marks: 1, diff: 1, q: `\\(X \\sim B(${n}, ${p})\\). Write down E(X).`, numeric: { value: dp(n * p, 2), tol: 0.001 }, ms: [`np = ${dp(n * p, 2)} [A1]`] };
      },
    ],
    "math-12": [
      () => {
        const a = R(1, 5), b = R(-6, 6), c = R(-9, 9), x0 = R(-3, 4);
        const d = 3 * a * x0 * x0 + 2 * b * x0 + c;
        return { paper: "P1", marks: 2, diff: 1, q: `Let \\(f(x) = ${a === 1 ? "" : a}x^3 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x^2 ${c < 0 ? "-" : "+"} ${Math.abs(c)}x\\). Find the gradient of the curve at x = ${x0}.`, numeric: { value: d, tol: 0.001 }, ms: [`\\(f'(x) = ${3 * a}x^2 ${2 * b < 0 ? "-" : "+"} ${Math.abs(2 * b)}x ${c < 0 ? "-" : "+"} ${Math.abs(c)}\\) [A1]`, `f'(${x0}) = ${d} [A1]`] };
      },
      () => {
        const p = R(-4, 1), q = R(p + 1, 5);
        // f'(x) = 3(x - p)(x - q) -> f(x) = x^3 - 1.5(p+q)x^2 + 3pq x
        const B = -1.5 * (p + q), C = 3 * p * q;
        const f = (x) => x ** 3 + B * x * x + C * x;
        return { paper: "P1", marks: 3, diff: 2, q: `Find the x-coordinate of the local minimum of \\(f(x) = x^3 ${B < 0 ? "-" : "+"} ${Math.abs(B)}x^2 ${C < 0 ? "-" : "+"} ${Math.abs(C)}x\\).`, numeric: { value: q, tol: 0.001 },
          ms: [`\\(f'(x) = 3x^2 ${2 * B < 0 ? "-" : "+"} ${Math.abs(2 * B)}x ${C < 0 ? "-" : "+"} ${Math.abs(C)} = 3(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})(x ${q < 0 ? "+" : "-"} ${Math.abs(q)})\\) [M1]`, `Stationary at x = ${p}, x = ${q} [A1]`, `Minimum at x = ${q} (f'' > 0), f(${q}) = ${dp(f(q), 2)} [A1]`] };
      },
    ],
    "math-13": [
      () => {
        const a = R(1, 4), b = R(-5, 5), lo = R(0, 2), hi = lo + R(1, 3);
        const F = (x) => (a * x ** 3) / 3 + (b * x * x) / 2;
        const v = F(hi) - F(lo);
        return { paper: "P1", marks: 3, diff: 2, q: `Evaluate \\(\\int_{${lo}}^{${hi}} (${a === 1 ? "" : a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x)\\,dx\\). Give your answer as a decimal to 3 d.p. if necessary.`, numeric: { value: dp(v, 3), tol: 0.002 },
          ms: [`\\(\\left[\\frac{${a}x^3}{3} ${b < 0 ? "-" : "+"} \\frac{${Math.abs(b)}x^2}{2}\\right]_{${lo}}^{${hi}}\\) [A1]`, `Substituting limits [M1]`, `= ${dp(v, 3)} [A1]`] };
      },
      () => {
        const k = R(1, 6);
        // area between y = x^2 and y = kx from 0 to k: k^3/6
        return { paper: "P1", marks: 4, diff: 3, q: `Find the area enclosed by \\(y = x^2\\) and \\(y = ${k === 1 ? "" : k}x\\) (to 3 d.p.).`, numeric: { value: dp(k ** 3 / 6, 3), tol: 0.002 }, ms: [`Intersections x = 0, x = ${k} [A1]`, `\\(\\int_0^{${k}} (${k}x - x^2)dx\\) [M1]`, `\\(\\left[\\frac{${k}x^2}{2} - \\frac{x^3}{3}\\right]_0^{${k}}\\) [A1]`, `= ${dp(k ** 3 / 6, 3)} [A1]`] };
      },
    ],
    "math-14": [
      () => {
        const a = R(1, 4), b = R(-8, 8), c = R(-5, 5), t = R(1, 5);
        // s = a t^3 + b t^2 + c t ; v = 3a t^2 + 2b t + c
        const v = 3 * a * t * t + 2 * b * t + c;
        return { paper: "P1", marks: 2, diff: 1, q: `The displacement of a particle is \\(s(t) = ${a === 1 ? "" : a}t^3 ${b < 0 ? "-" : "+"} ${Math.abs(b)}t^2 ${c < 0 ? "-" : "+"} ${Math.abs(c)}t\\) m. Find its velocity when t = ${t} s.`, numeric: { value: v, tol: 0.001 },
          ms: [`\\(v = ${3 * a}t^2 ${2 * b < 0 ? "-" : "+"} ${Math.abs(2 * b)}t ${c < 0 ? "-" : "+"} ${Math.abs(c)}\\) [A1]`, `v(${t}) = ${v} m s⁻¹ [A1]`] };
      },
    ],
    // ===================== BIOLOGY =====================
    "bio-1": [
      () => {
        const a = R(15, 35), base = P([["thymine", a], ["adenine", a]]), want = P(["guanine", "cytosine"]);
        const v = (100 - 2 * a) / 2;
        return { paper: "P2", marks: 2, diff: 1, q: `In a sample of double-stranded DNA, ${a}% of the bases are ${base[0]}. Calculate the percentage of ${want}.`, numeric: { value: v, tol: 0.05 }, ms: [`A = T = ${a}%, so C + G = ${100 - 2 * a}% [M1]`, `${want} = ${v}% [A1]`] };
      },
    ],
    "bio-2": [
      () => {
        const actual = P([2, 3, 5, 8, 10, 20, 25, 50]), unit = P(["µm"]), mag = P([400, 1000, 2000, 5000, 10000, 20000]);
        const imgMm = (actual * mag) / 1000;
        return Math.random() < 0.5
          ? { paper: "P2", marks: 2, diff: 1, q: `An image of a structure measures ${imgMm} mm. Its actual size is ${actual} ${unit}. Calculate the magnification.`, numeric: { value: mag, tol: 0.5 }, ms: [`${imgMm} mm = ${imgMm * 1000} µm; ${imgMm * 1000} ÷ ${actual} [M1]`, `×${mag} [A1]`] }
          : { paper: "P2", marks: 2, diff: 2, q: `A micrograph at ×${mag} shows a cell ${imgMm} mm long. Calculate the actual length in µm.`, numeric: { value: actual, tol: 0.01 }, ms: [`${imgMm} mm = ${imgMm * 1000} µm; ÷ ${mag} [M1]`, `= ${actual} µm [A1]`] };
      },
    ],
    "bio-4": [
      () => {
        const N = R(8, 60) * 10, M = R(20, 80), n = R(30, 90);
        const m = Math.max(1, Math.round((M * n) / N));
        const est = (M * n) / m;
        return { paper: "P2", marks: 2, diff: 2, q: `${M} animals were captured, marked and released. Later ${n} were captured, of which ${m} were marked. Estimate the population size using the Lincoln index.`, numeric: { value: Math.round(est), tol: 1 }, ms: [`${M} × ${n} ÷ ${m} [M1]`, `≈ ${Math.round(est)} [A1]`] };
      },
    ],
    "bio-6": [
      () => {
        const l = R(1, 10);
        return { paper: "P2", marks: 2, diff: 1, q: `Calculate the surface area to volume ratio of a cube-shaped cell with sides of ${l} µm. Give the answer as x : 1.`, numeric: { value: dp(6 / l, 2), tol: 0.01 }, ms: [`SA = ${6 * l * l} µm², V = ${l ** 3} µm³ [M1]`, `${dp(6 / l, 2)} : 1 [A1]`] };
      },
    ],
    "bio-10": [
      () => {
        const sf = dp(R(60, 100) / 10, 1), rf = dp(R(10, 95) / 100, 2), d = dp(sf * rf, 2);
        return { paper: "P2", marks: 2, diff: 1, q: `In paper chromatography, a pigment moved ${d} cm and the solvent front moved ${sf} cm. Calculate the Rf value.`, numeric: { value: dp(d / sf, 2), tol: 0.011 }, ms: [`${d} ÷ ${sf} [M1]`, `= ${dp(d / sf, 2)} [A1]`] };
      },
    ],
    "bio-13": [
      () => {
        const low = R(5, 50) * 1000, pct = P([5, 8, 10, 12, 15, 20]), high = (low * pct) / 100;
        return { paper: "P2", marks: 2, diff: 1, q: `Producers contain ${low.toLocaleString()} kJ m⁻² yr⁻¹ and primary consumers ${high.toLocaleString()} kJ m⁻² yr⁻¹. Calculate the percentage energy transfer.`, numeric: { value: pct, tol: 0.05 }, ms: [`${high} ÷ ${low} × 100 [M1]`, `= ${pct}% [A1]`] };
      },
    ],
    "bio-15": [
      () => {
        const tot = R(10, 40) * 10, mit = R(5, Math.round(tot / 3));
        return { paper: "P2", marks: 2, diff: 1, q: `In a sample of ${tot} cells from a root tip, ${mit} were in mitosis. Calculate the mitotic index (to 2 d.p.).`, numeric: { value: dp(mit / tot, 2), tol: 0.006 }, ms: [`${mit} ÷ ${tot} [M1]`, `= ${dp(mit / tot, 2)} [A1]`] };
      },
    ],
    "bio-16": [
      () => {
        const m1 = dp(R(150, 400) / 100, 2), pct = P([-12, -8, -6, -4, 3, 5, 7, 10]), m2 = dp(m1 * (1 + pct / 100), 2);
        const v = dp(((m2 - m1) / m1) * 100, 1);
        return { paper: "P2", marks: 2, diff: 1, q: `A potato cylinder's mass changed from ${m1} g to ${m2} g in a sucrose solution. Calculate the percentage change in mass.`, numeric: { value: v, tol: 0.15 }, ms: [`(${m2} − ${m1}) ÷ ${m1} × 100 [M1]`, `= ${v}% [A1]`] };
      },
    ],
  };

  let counter = 0;
  IB._generated = IB._generated || {};

  IB.hasGenerator = (topicId) => !!G[topicId];
  IB.generatorTopics = (subjectId) => Object.keys(G).filter((k) => !subjectId || k.startsWith(subjectId + "-"));

  // Generate a fresh question for a topic (or a random generator topic in the subject).
  IB.generate = function (topicId) {
    const gens = G[topicId];
    if (!gens) return null;
    const raw = P(gens)();
    const q = Object.assign({ type: "short", generated: true }, raw);
    q.id = `gen-${topicId}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
    q.subject = topicId.split("-")[0];
    q.topic = topicId;
    IB._generated[q.id] = q;
    return q;
  };

  // Convert a generated numeric question into a 4-option MCQ with plausible distractors.
  IB.asMcq = function (q) {
    const v = q.numeric.value;
    const fmt = (x) => (Number.isInteger(v) ? String(Math.round(x)) : sig(x, 3));
    const set = new Set([fmt(v)]);
    const cands = [v * 2, v / 2, -v, v * 1.1, v * 0.9, v + 1, v - 1, v * 10, v / 10, v * 1.25, v * 0.75].sort(() => Math.random() - 0.5);
    for (const c of cands) {
      if (set.size >= 4) break;
      const f = fmt(c);
      if (f !== "NaN" && Number(f) !== Number(fmt(v))) set.add(f);
    }
    const options = IB.shuffle(Array.from(set));
    return Object.assign({}, q, { type: "mcq", marks: 1, options, answer: options.indexOf(fmt(v)), q: q.q + " <span class='muted small'>(choose the closest answer)</span>" });
  };
})();
