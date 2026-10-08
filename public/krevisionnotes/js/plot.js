/* Tiny SVG plotter for notes: function graphs (maths/chem) and line diagrams (economics).
   spec = { title, x:[min,max], y:[min,max], xLabel, yLabel, grid:true, origin:true,
            curves:[{ f: x => ..., color, dash, label, domain:[a,b] }],
            lines:[{ from:[x,y], to:[x,y], color, dash, label, labelAt:"end"|"start" }],
            points:[{ at:[x,y], label, color }], vlines:[{x, label, dash}], hlines:[{y, label, dash}],
            shade:{ from:a, to:b, color } }  Colours are names: "a" (accent) "b" "c" "muted". */
(function () {
  const IB = window.IB;
  const COL = { a: "var(--plot-a)", b: "var(--plot-b)", c: "var(--plot-c)", muted: "var(--muted)" };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  IB.plot = function (spec) {
    const W = 380, H = 260, P = 26, PR = 46;
    const [x0, x1] = spec.x || [-5, 5], [y0, y1] = spec.y || [-5, 5];
    const sx = (x) => P + ((x - x0) / (x1 - x0)) * (W - P - PR);
    const sy = (y) => H - P - ((y - y0) / (y1 - y0)) * (H - 2 * P);
    const inY = (y) => isFinite(y) && y >= y0 - (y1 - y0) && y <= y1 + (y1 - y0);
    let g = "";
    // grid
    if (spec.grid !== false) {
      const step = (a, b) => { const r = b - a; return r <= 12 ? 1 : r <= 30 ? 2 : r <= 60 ? 5 : 10; };
      const gx = step(x0, x1), gy = step(y0, y1);
      for (let x = Math.ceil(x0 / gx) * gx; x <= x1; x += gx) g += `<line x1="${sx(x)}" y1="${P}" x2="${sx(x)}" y2="${H - P}" class="pl-grid"/>`;
      for (let y = Math.ceil(y0 / gy) * gy; y <= y1; y += gy) g += `<line x1="${P}" y1="${sy(y)}" x2="${W - PR}" y2="${sy(y)}" class="pl-grid"/>`;
    }
    // shading between x values (e.g. inequality solution)
    if (spec.shade) g += `<rect x="${sx(spec.shade.from)}" y="${P}" width="${sx(spec.shade.to) - sx(spec.shade.from)}" height="${H - 2 * P}" fill="${COL[spec.shade.color] || COL.c}" opacity=".14"/>`;
    // axes
    const ax = spec.origin === false ? x0 : Math.min(Math.max(0, x0), x1), ay = spec.origin === false ? y0 : Math.min(Math.max(0, y0), y1);
    g += `<line x1="${P}" y1="${sy(ay)}" x2="${W - PR + 10}" y2="${sy(ay)}" class="pl-axis" marker-end="url(#pl-arr)"/>`;
    g += `<line x1="${sx(ax)}" y1="${H - P}" x2="${sx(ax)}" y2="${P - 8}" class="pl-axis" marker-end="url(#pl-arr)"/>`;
    g += `<text x="${W - PR + 6}" y="${sy(ay) - 8}" class="pl-ax" text-anchor="end">${esc(spec.xLabel || "x")}</text>`;
    g += `<text x="${sx(ax) + 8}" y="${P - 6}" class="pl-ax">${esc(spec.yLabel || "y")}</text>`;
    (spec.vlines || []).forEach((v) => {
      g += `<line x1="${sx(v.x)}" y1="${P}" x2="${sx(v.x)}" y2="${H - P}" class="pl-asym"/>`;
      if (v.label) g += `<text x="${sx(v.x) + 4}" y="${P + 12}" class="pl-lab">${esc(v.label)}</text>`;
    });
    (spec.hlines || []).forEach((h) => {
      g += `<line x1="${P}" y1="${sy(h.y)}" x2="${W - PR}" y2="${sy(h.y)}" class="pl-asym"/>`;
      if (h.label) g += `<text x="${W - PR - 2}" y="${sy(h.y) - 5}" class="pl-lab" text-anchor="end">${esc(h.label)}</text>`;
    });
    // curves
    (spec.curves || []).forEach((c, ci) => {
      const [a, b] = c.domain || [x0, x1];
      let d = "", pen = false;
      const N = 240;
      for (let i = 0; i <= N; i++) {
        const x = a + ((b - a) * i) / N;
        let y;
        try { y = c.f(x); } catch (e) { y = NaN; }
        if (!inY(y)) { pen = false; continue; }
        d += (pen ? "L" : "M") + sx(x).toFixed(1) + " " + sy(Math.max(y0 - (y1 - y0) * 0.2, Math.min(y1 + (y1 - y0) * 0.2, y))).toFixed(1);
        pen = true;
      }
      g += `<path d="${d}" fill="none" stroke="${COL[c.color] || COL.a}" stroke-width="2.4" ${c.dash ? 'stroke-dasharray="6 5"' : ""} class="pl-curve" style="--d:${ci * 0.25}s" clip-path="url(#pl-clip)"/>`;
      if (c.label) {
        const lx = c.labelX ?? (a + (b - a) * 0.85);
        let ly = c.f(lx);
        if (isFinite(ly)) g += `<text x="${sx(lx) + 4}" y="${Math.max(P + 10, Math.min(H - P - 4, sy(ly) - 6))}" class="pl-lab" fill="${COL[c.color] || COL.a}">${esc(c.label)}</text>`;
      }
    });
    (spec.lines || []).forEach((l, li) => {
      g += `<line x1="${sx(l.from[0])}" y1="${sy(l.from[1])}" x2="${sx(l.to[0])}" y2="${sy(l.to[1])}" stroke="${COL[l.color] || COL.a}" stroke-width="${l.dash ? 1.4 : 2.4}" ${l.dash ? 'stroke-dasharray="4 4"' : ""} class="${l.dash ? "" : "pl-curve"}" style="--d:${li * 0.15}s"/>`;
      if (l.label) {
        const at = l.labelAt === "start" ? l.from : l.to;
        g += `<text x="${sx(at[0]) + 5}" y="${sy(at[1]) + (l.labelAt === "start" ? 14 : -5)}" class="pl-lab" fill="${COL[l.color] || COL.a}">${esc(l.label)}</text>`;
      }
    });
    (spec.points || []).forEach((p) => {
      g += `<circle cx="${sx(p.at[0])}" cy="${sy(p.at[1])}" r="4" fill="${COL[p.color] || COL.a}" class="pl-pt"/>`;
      if (p.label) g += `<text x="${sx(p.at[0]) + 6}" y="${sy(p.at[1]) - 7}" class="pl-lab pl-pt-lab">${esc(p.label)}</text>`;
    });
    (spec.texts || []).forEach((t) => (g += `<text x="${sx(t.at[0])}" y="${sy(t.at[1])}" class="pl-lab" ${t.anchor ? `text-anchor="${t.anchor}"` : ""}>${esc(t.text)}</text>`));
    return `<figure class="plot"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.title || "graph")}">
      <defs><marker id="pl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--text)"/></marker>
      <clipPath id="pl-clip"><rect x="${P}" y="${P - 4}" width="${W - P - PR}" height="${H - 2 * P + 8}"/></clipPath></defs>${g}</svg>
      ${spec.title ? `<figcaption>${spec.title}</figcaption>` : ""}</figure>`;
  };
})();
