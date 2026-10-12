// ========= Standard Points of a Triangle (tab 7) + shared card builder for tabs 6 and 7 =========
// Every card follows the app's pattern: inputs -> graph -> steps -> result, and recalculates on
// the Calculate button or Enter. The page already loads this file, but it was missing.

// ---------- Shared helpers (also used by AngleBisectors.js) ----------
function geoActivate(btnId) {
    document.querySelectorAll('#sidebarContent .nav-btn').forEach(b => b.classList.remove('active-btn'));
    const b = document.getElementById(btnId);
    if (b) b.classList.add('active-btn');
}
function geoPt(x, y) { return { x, y }; }
function geoDist(P, Q) { return Math.hypot(P.x - Q.x, P.y - Q.y); }
function geoMid(P, Q) { return geoPt((P.x + Q.x) / 2, (P.y + Q.y) / 2); }
// line a x + b y + c = 0 through two points
function geoLineThrough(P, Q) { return { a: P.y - Q.y, b: Q.x - P.x, c: P.x * Q.y - Q.x * P.y }; }
function geoIntersect(l1, l2) {
    const det = l1.a * l2.b - l2.a * l1.b;
    if (Math.abs(det) < 1e-12) return null;
    return geoPt((l1.b * l2.c - l2.b * l1.c) / det, (l1.c * l2.a - l2.c * l1.a) / det);
}
function geoFoot(P, l) {
    const n2 = l.a * l.a + l.b * l.b, v = l.a * P.x + l.b * P.y + l.c;
    return geoPt(P.x - l.a * v / n2, P.y - l.b * v / n2);
}
// tidy a line: positive first coefficient, smallest integer scale if the numbers are rational
function geoNormLine(l) {
    let { a, b, c } = l;
    if (a < -1e-12 || (Math.abs(a) < 1e-12 && b < -1e-12)) { a = -a; b = -b; c = -c; }
    for (let k = 1; k <= 120; k++) {
        const ok = [a, b, c].every(v => Math.abs(v * k - Math.round(v * k)) < 1e-7);
        if (ok) { a *= k; b *= k; c *= k; break; }
    }
    const z = v => (Math.abs(v) < 1e-10 ? 0 : v);
    return { a: z(a), b: z(b), c: z(c) };
}
function geoEq(a, b, c) {
    const parts = [];
    const add = (v, s) => { if (Math.abs(v) < 1e-9) return; const m = Math.abs(v); parts.push({ neg: v < 0, txt: (s && Math.abs(m - 1) < 1e-9) ? s : fmt(m) + s }); };
    add(a, 'x'); add(b, 'y'); add(c, '');
    if (!parts.length) return '0 = 0';
    return parts.map((p, i) => (i === 0 ? (p.neg ? '-' : '') : (p.neg ? ' - ' : ' + ')) + p.txt).join('') + ' = 0';
}
const geoEqL = l => geoEq(l.a, l.b, l.c);
const geoPtStr = P => '(' + fmt(P.x) + ', ' + fmt(P.y) + ')';
// a circle as one polyline dataset (one legend entry, not 72)
function geoCircleSegs(cx, cy, r, color, label, dash) {
    const pts = [], n = 90;
    for (let i = 0; i <= n; i++) { const t = 2 * Math.PI * i / n; pts.push(geoPt(cx + r * Math.cos(t), cy + r * Math.sin(t))); }
    return [{ from: pts[0], to: pts[n], points: pts, color, dash: dash || [], width: 2, label: label || '' }];
}
// cut an infinite line to the visible box; returns two points or null
function geoClip(l, bd) {
    const pts = [], { a, b, c } = l, eps = 1e-9;
    if (Math.abs(b) > eps) {
        [bd.minX, bd.maxX].forEach(x => { const y = (-a * x - c) / b; if (y >= bd.minY - eps && y <= bd.maxY + eps) pts.push(geoPt(x, y)); });
    }
    if (Math.abs(a) > eps) {
        [bd.minY, bd.maxY].forEach(y => { const x = (-b * y - c) / a; if (x >= bd.minX - eps && x <= bd.maxX + eps) pts.push(geoPt(x, y)); });
    }
    if (pts.length < 2) return null;
    let best = [pts[0], pts[1]], d = 0;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const dd = geoDist(pts[i], pts[j]); if (dd > d) { d = dd; best = [pts[i], pts[j]]; } }
    return d < eps ? null : best;
}
// bounds with the same x:y scale as the canvas, so circles look round
function geoBounds(pts) {
    const b = smartBounds(pts), cv = document.getElementById('coordinateGraph');
    const ratio = cv && cv.clientHeight > 50 ? cv.clientWidth / cv.clientHeight : 1.6;
    let cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, w = b.maxX - b.minX, h = b.maxY - b.minY;
    if (w / h < ratio) w = h * ratio; else h = w / ratio;
    return { minX: cx - w / 2, maxX: cx + w / 2, minY: cy - h / 2, maxY: cy + h / 2 };
}

/**
 * Builds one card in the app's standard layout.
 * cfg: { btn, icon, title, formulas:[latex], groups:[{label, fields:[{id,label,value}]}], extraHtml, foot, initResult,
 *        compute(v) -> { points, special, segs, lines, circles, curves, key, steps, result } }
 */
function buildGeoCard(cfg) {
    geoActivate(cfg.btn);
    const groupsHtml = cfg.groups.map(g => `
        <div class="point-box"><label>${g.label}</label>
            ${g.fields.map(f => `<div class="coord-input"><span>${f.label} =</span><input type="number" id="${f.id}" value="${f.value}" step="any"></div>`).join('')}
        </div>`).join('');
    const html = `
        <h2 style="color:#113355;"><span>${cfg.icon}</span> ${cfg.title}</h2>
        ${(cfg.formulas || []).map(f => `<div class="formula-badge">\\( ${f} \\)</div>`).join('')}
        <div class="input-group">${groupsHtml}</div>
        ${cfg.extraHtml || ''}
        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        <div class="steps-header"><button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button></div>
        <div class="steps-container" id="stepsContainer"></div>
        <button class="calculate-btn" id="${cfg.btn}Calc"><span>${cfg.icon}</span> Calculate</button>
        <div class="result-highlight" id="${cfg.btn}Result">${cfg.initResult || '\\( \\ldots \\)'}</div>
        ${cfg.foot ? `<div class="footnote">${cfg.foot}</div>` : ''}
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const fields = cfg.groups.flatMap(g => g.fields);
    const els = fields.map(f => document.getElementById(f.id));
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById(cfg.btn + 'Result');

    function update() {
        clearErrors();
        try {
            const v = {};
            fields.forEach((f, i) => { v[f.id] = validateNumber(els[i].value, f.label); });
            const r = cfg.compute(v);
            const pts = [].concat(r.points || [], r.special || [], r.key || []);
            (r.segs || []).forEach(s => pts.push(s.from, s.to));
            (r.circles || []).forEach(c => pts.push(geoPt(c.cx - c.r, c.cy - c.r), geoPt(c.cx + c.r, c.cy + c.r)));
            const bd = geoBounds(pts);
            const segs = (r.segs || []).slice();
            (r.lines || []).forEach(l => { const cl = geoClip(l, bd); if (cl) segs.push({ from: cl[0], to: cl[1], color: l.color || '#2c3e50', dash: l.dash || [], width: l.width || 2, label: l.label || '' }); });
            (r.circles || []).forEach(c => geoCircleSegs(c.cx, c.cy, c.r, c.color || '#2b3595', c.label, c.dash).forEach(s => segs.push(s)));
            (r.curves || []).forEach(cu => segs.push({ from: cu.pts[0], to: cu.pts[cu.pts.length - 1], points: cu.pts, color: cu.color || '#7c3aed', dash: cu.dash || [], width: 2, label: cu.label || '' }));
            drawGraph(r.points || [], r.special || [], segs, { bounds: bd });
            stepsDiv.innerHTML = r.steps.map((txt, i) =>
                `<div class="step-row"><span class="step-marker">${i + 1}</span><span class="step-text" style="white-space: pre-line;">${txt}</span></div>`).join('');
            resultDiv.innerHTML = r.result;
            renderLatex();
            attachStepsToggle();
        } catch (e) {
            showError(e.message, els);
        }
    }
    document.getElementById(cfg.btn + 'Calc').addEventListener('click', update);
    els.forEach(inp => { inp.addEventListener('keypress', e => e.key === 'Enter' && update()); inp.addEventListener('input', clearErrors); });
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

// ---------- Triangle helpers ----------
function triGroups(p) {
    const d = { A: [0, 0], B: [6, 0], C: [2, 5] };
    return ['A', 'B', 'C'].map(n => ({
        label: 'Vertex ' + n,
        fields: [{ id: p + n + 'x', label: 'x' + (n === 'A' ? '₁' : n === 'B' ? '₂' : '₃'), value: d[n][0] }, { id: p + n + 'y', label: 'y' + (n === 'A' ? '₁' : n === 'B' ? '₂' : '₃'), value: d[n][1] }]
    }));
}
function triInfo(A, B, C) {
    const a = geoDist(B, C), b = geoDist(C, A), c = geoDist(A, B);
    const S = A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y);
    const area = Math.abs(S) / 2;
    if (area < 1e-9) throw new Error('The three points are collinear, so they do not form a triangle');
    return { a, b, c, S, area, s: (a + b + c) / 2, perim: a + b + c };
}
function triCircum(A, B, C) {
    const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
    const sq = P => P.x * P.x + P.y * P.y;
    const O = geoPt((sq(A) * (B.y - C.y) + sq(B) * (C.y - A.y) + sq(C) * (A.y - B.y)) / d, (sq(A) * (C.x - B.x) + sq(B) * (A.x - C.x) + sq(C) * (B.x - A.x)) / d);
    return { O, R: geoDist(O, A) };
}
function triIncenter(A, B, C, T) { return geoPt((T.a * A.x + T.b * B.x + T.c * C.x) / T.perim, (T.a * A.y + T.b * B.y + T.c * C.y) / T.perim); }
function triSides(A, B, C, col) {
    return [{ from: A, to: B, color: col || '#475569', width: 2, label: 'AB' }, { from: B, to: C, color: col || '#475569', width: 2, label: 'BC' }, { from: C, to: A, color: col || '#475569', width: 2, label: 'CA' }];
}
function triCard(cfg) {
    const p = cfg.prefix;
    buildGeoCard({
        btn: cfg.btn, icon: cfg.icon, title: cfg.title, formulas: cfg.formulas, foot: cfg.foot, groups: triGroups(p),
        compute: v => {
            const A = geoPt(v[p + 'Ax'], v[p + 'Ay']), B = geoPt(v[p + 'Bx'], v[p + 'By']), C = geoPt(v[p + 'Cx'], v[p + 'Cy']);
            const T = triInfo(A, B, C);
            return cfg.compute(A, B, C, T);
        }
    });
}
const tn = n => fmt(n);

// ---------- 1. Triangle vertices and sides ----------
function renderTriangleVerticesCard() {
    triCard({
        btn: 'triangleVerticesBtn', icon: '🔺', title: 'Triangle Vertices & Sides', prefix: 'tv',
        formulas: ['a = BC,\\; b = CA,\\; c = AB \\quad (\\text{distance formula})', '\\text{Area} = \\tfrac12 |x_1(y_2-y_3)+x_2(y_3-y_1)+x_3(y_1-y_2)|'],
        foot: 'Sides are found with the distance formula. The triangle is classified by its side lengths and by comparing the largest side squared with the other two.',
        compute: (A, B, C, T) => {
            const sides = [T.a, T.b, T.c].sort((x, y) => x - y), eq = (x, y) => Math.abs(x - y) < 1e-7;
            const bySide = (eq(T.a, T.b) && eq(T.b, T.c)) ? 'equilateral' : (eq(T.a, T.b) || eq(T.b, T.c) || eq(T.a, T.c)) ? 'isosceles' : 'scalene';
            const diff = sides[0] ** 2 + sides[1] ** 2 - sides[2] ** 2;
            const byAngle = Math.abs(diff) < 1e-7 ? 'right-angled' : diff > 0 ? 'acute-angled' : 'obtuse-angled';
            return {
                points: [A, B, C], segs: triSides(A, B, C),
                steps: [
                    `① Vertices: A${geoPtStr(A)}, B${geoPtStr(B)}, C${geoPtStr(C)}`,
                    `② a = BC = √((${tn(C.x)}-${tn(B.x)})² + (${tn(C.y)}-${tn(B.y)})²) = ${tn(T.a)}`,
                    `③ b = CA = √((${tn(A.x)}-${tn(C.x)})² + (${tn(A.y)}-${tn(C.y)})²) = ${tn(T.b)}`,
                    `④ c = AB = √((${tn(B.x)}-${tn(A.x)})² + (${tn(B.y)}-${tn(A.y)})²) = ${tn(T.c)}`,
                    `⑤ Perimeter = a + b + c = ${tn(T.perim)}, semi-perimeter s = ${tn(T.s)}`,
                    `⑥ Area = ½|${tn(T.S)}| = ${tn(T.area)}`,
                    `⑦ By sides: ${bySide}. By angles: ${byAngle} (smallest² + middle² - largest² = ${tn(diff)})`
                ],
                result: `\\( a=${tn(T.a)},\\; b=${tn(T.b)},\\; c=${tn(T.c)},\\; \\text{Area}=${tn(T.area)} \\)`
            };
        }
    });
}

// ---------- 2. Centroid ----------
function renderCentroidTriangleCard() {
    triCard({
        btn: 'centroidTriangleBtn', icon: '🔻', title: 'Centroid (Intersection of Medians)', prefix: 'gc',
        formulas: ['G = \\left(\\frac{x_1+x_2+x_3}{3},\\; \\frac{y_1+y_2+y_3}{3}\\right)'],
        foot: 'A median joins a vertex to the midpoint of the opposite side. The three medians meet at the centroid G, which divides each median 2 : 1 from the vertex.',
        compute: (A, B, C) => {
            const G = geoPt((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3), Ma = geoMid(B, C), Mb = geoMid(C, A), Mc = geoMid(A, B);
            return {
                points: [A, B, C], special: [Object.assign(G, { label: 'G' })],
                segs: triSides(A, B, C).concat([{ from: A, to: Ma, color: '#d44c2f', dash: [5, 3], label: 'median A' }, { from: B, to: Mb, color: '#1f7f6a', dash: [5, 3], label: 'median B' }, { from: C, to: Mc, color: '#ca8a04', dash: [5, 3], label: 'median C' }]),
                steps: [
                    `① Vertices: A${geoPtStr(A)}, B${geoPtStr(B)}, C${geoPtStr(C)}`,
                    `② Midpoints: BC → ${geoPtStr(Ma)}, CA → ${geoPtStr(Mb)}, AB → ${geoPtStr(Mc)}`,
                    `③ Gx = (${tn(A.x)} + ${tn(B.x)} + ${tn(C.x)}) / 3 = ${tn(G.x)}`,
                    `④ Gy = (${tn(A.y)} + ${tn(B.y)} + ${tn(C.y)}) / 3 = ${tn(G.y)}`,
                    `⑤ Check: AG : GMₐ = ${tn(geoDist(A, G))} : ${tn(geoDist(G, Ma))} = 2 : 1`
                ],
                result: `\\( G = (${tn(G.x)},\\; ${tn(G.y)}) \\)`
            };
        }
    });
}

// ---------- 3. Incenter ----------
function renderIncenterTriangleCard() {
    triCard({
        btn: 'incenterTriangleBtn', icon: '🔴', title: 'Incenter (Angle Bisectors)', prefix: 'ic',
        formulas: ['I = \\left(\\frac{a x_1 + b x_2 + c x_3}{a+b+c},\\; \\frac{a y_1 + b y_2 + c y_3}{a+b+c}\\right)', 'r = \\frac{\\text{Area}}{s}'],
        foot: 'The incenter is where the three angle bisectors meet. It is the centre of the circle that touches all three sides (the incircle).',
        compute: (A, B, C, T) => {
            const I = triIncenter(A, B, C, T), r = T.area / T.s;
            return {
                points: [A, B, C], special: [Object.assign(I, { label: 'I' })],
                segs: triSides(A, B, C).concat([A, B, C].map((P, i) => ({ from: P, to: I, color: ['#d44c2f', '#1f7f6a', '#ca8a04'][i], dash: [5, 3], label: 'bisector ' + 'ABC'[i] }))),
                circles: [{ cx: I.x, cy: I.y, r, color: '#2b3595', label: 'incircle' }],
                steps: [
                    `① Sides: a = BC = ${tn(T.a)}, b = CA = ${tn(T.b)}, c = AB = ${tn(T.c)}`,
                    `② a + b + c = ${tn(T.perim)}`,
                    `③ Ix = (a·x₁ + b·x₂ + c·x₃)/(a+b+c) = (${tn(T.a)}·${tn(A.x)} + ${tn(T.b)}·${tn(B.x)} + ${tn(T.c)}·${tn(C.x)}) / ${tn(T.perim)} = ${tn(I.x)}`,
                    `④ Iy = (a·y₁ + b·y₂ + c·y₃)/(a+b+c) = ${tn(I.y)}`,
                    `⑤ Inradius r = Area / s = ${tn(T.area)} / ${tn(T.s)} = ${tn(r)}`
                ],
                result: `\\( I = (${tn(I.x)},\\; ${tn(I.y)}),\\quad r = ${tn(r)} \\)`
            };
        }
    });
}

// ---------- 4. Circumcenter ----------
function renderCircumcenterTriangleCard() {
    triCard({
        btn: 'circumcenterTriangleBtn', icon: '⚪', title: 'Circumcenter (Perpendicular Bisectors)', prefix: 'cc',
        formulas: ['D = 2[x_1(y_2-y_3)+x_2(y_3-y_1)+x_3(y_1-y_2)]', 'S = (S_x, S_y),\\; R = SA = SB = SC'],
        foot: 'The circumcenter S is where the perpendicular bisectors of the sides meet. It is equally far (R) from all three vertices, so it is the centre of the circle through A, B, C.',
        compute: (A, B, C) => {
            const { O, R } = triCircum(A, B, C), d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
            return {
                points: [A, B, C], special: [Object.assign(O, { label: 'S' })],
                segs: triSides(A, B, C).concat([[B, C], [C, A], [A, B]].map(([P, Q], i) => ({ from: geoMid(P, Q), to: O, color: ['#d44c2f', '#1f7f6a', '#ca8a04'][i], dash: [5, 3], label: 'perp. bisector' }))),
                circles: [{ cx: O.x, cy: O.y, r: R, color: '#2b3595', label: 'circumcircle', dash: [6, 4] }],
                steps: [
                    `① Vertices: A${geoPtStr(A)}, B${geoPtStr(B)}, C${geoPtStr(C)}`,
                    `② D = 2[x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)] = ${tn(d)}`,
                    `③ Sx = [(x₁²+y₁²)(y₂-y₃) + (x₂²+y₂²)(y₃-y₁) + (x₃²+y₃²)(y₁-y₂)] / D = ${tn(O.x)}`,
                    `④ Sy = [(x₁²+y₁²)(x₃-x₂) + (x₂²+y₂²)(x₁-x₃) + (x₃²+y₃²)(x₂-x₁)] / D = ${tn(O.y)}`,
                    `⑤ R = SA = √((${tn(A.x)}-${tn(O.x)})² + (${tn(A.y)}-${tn(O.y)})²) = ${tn(R)}`,
                    `⑥ Check: SB = ${tn(geoDist(O, B))}, SC = ${tn(geoDist(O, C))} (all equal to R)`
                ],
                result: `\\( S = (${tn(O.x)},\\; ${tn(O.y)}),\\quad R = ${tn(R)} \\)`
            };
        }
    });
}

// ---------- 5. Orthocenter ----------
function triOrtho(A, B, C) {
    // (H - A).(B - C) = 0 and (H - B).(A - C) = 0
    const a1 = B.x - C.x, b1 = B.y - C.y, c1 = a1 * A.x + b1 * A.y, a2 = A.x - C.x, b2 = A.y - C.y, c2 = a2 * B.x + b2 * B.y;
    const det = a1 * b2 - a2 * b1;
    return geoPt((c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det);
}
function renderOrthocenterTriangleCard() {
    triCard({
        btn: 'orthocenterTriangleBtn', icon: '🔺', title: 'Orthocenter (Intersection of Altitudes)', prefix: 'oc',
        formulas: ['(H-A)\\cdot(B-C)=0,\\quad (H-B)\\cdot(A-C)=0'],
        foot: 'An altitude drops from a vertex at a right angle to the opposite side. The three altitudes meet at the orthocenter H (outside the triangle if it is obtuse).',
        compute: (A, B, C) => {
            const H = triOrtho(A, B, C), la = geoLineThrough(B, C), lb = geoLineThrough(C, A), lc = geoLineThrough(A, B);
            return {
                points: [A, B, C], special: [Object.assign(H, { label: 'H' })],
                segs: triSides(A, B, C).concat([{ from: A, to: geoFoot(A, la), color: '#d44c2f', dash: [5, 3], label: 'altitude A' }, { from: B, to: geoFoot(B, lb), color: '#1f7f6a', dash: [5, 3], label: 'altitude B' }, { from: C, to: geoFoot(C, lc), color: '#ca8a04', dash: [5, 3], label: 'altitude C' }]),
                steps: [
                    `① Vertices: A${geoPtStr(A)}, B${geoPtStr(B)}, C${geoPtStr(C)}`,
                    `② Altitude from A is perpendicular to BC: (H-A)·(B-C) = 0`,
                    `③ Altitude from B is perpendicular to CA: (H-B)·(A-C) = 0`,
                    `④ Solving the two equations: H = ${geoPtStr(H)}`,
                    `⑤ Check with the third altitude: (H-C)·(A-B) = ${tn((H.x - C.x) * (A.x - B.x) + (H.y - C.y) * (A.y - B.y))} ≈ 0 ✓`
                ],
                result: `\\( H = (${tn(H.x)},\\; ${tn(H.y)}) \\)`
            };
        }
    });
}

// ---------- 6. Equations of medians ----------
function renderMediansEquationsCard() {
    triCard({
        btn: 'mediansEquationsBtn', icon: '📐', title: 'Equations of Medians', prefix: 'me',
        formulas: ['\\text{Median from } A:\\ \\text{line through } A \\text{ and the midpoint of } BC'],
        foot: 'Each median is the line through a vertex and the midpoint of the opposite side. All three pass through the centroid.',
        compute: (A, B, C) => {
            const Ma = geoMid(B, C), Mb = geoMid(C, A), Mc = geoMid(A, B), G = geoPt((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
            const la = geoNormLine(geoLineThrough(A, Ma)), lb = geoNormLine(geoLineThrough(B, Mb)), lc = geoNormLine(geoLineThrough(C, Mc));
            return {
                points: [A, B, C], special: [Object.assign(G, { label: 'G' })], segs: triSides(A, B, C),
                lines: [Object.assign({ color: '#d44c2f', label: 'median A' }, la), Object.assign({ color: '#1f7f6a', label: 'median B' }, lb), Object.assign({ color: '#ca8a04', label: 'median C' }, lc)],
                steps: [
                    `① Midpoints: Mₐ (of BC) = ${geoPtStr(Ma)}, M_b (of CA) = ${geoPtStr(Mb)}, M_c (of AB) = ${geoPtStr(Mc)}`,
                    `② Median from A: through A${geoPtStr(A)} and Mₐ${geoPtStr(Ma)} → ${geoEqL(la)}`,
                    `③ Median from B: through B${geoPtStr(B)} and M_b${geoPtStr(Mb)} → ${geoEqL(lb)}`,
                    `④ Median from C: through C${geoPtStr(C)} and M_c${geoPtStr(Mc)} → ${geoEqL(lc)}`,
                    `⑤ They meet at the centroid G = ${geoPtStr(G)}. Check in median A: ${tn(la.a * G.x + la.b * G.y + la.c)} ≈ 0 ✓`
                ],
                result: `\\( ${geoEqL(la)};\\; ${geoEqL(lb)};\\; ${geoEqL(lc)} \\)`
            };
        }
    });
}

// ---------- 7. Equations of altitudes ----------
function renderAltitudesEquationsCard() {
    triCard({
        btn: 'altitudesEquationsBtn', icon: '📏', title: 'Equations of Altitudes', prefix: 'al',
        formulas: ['\\text{Altitude from } A:\\ (x_C - x_B)(x - x_A) + (y_C - y_B)(y - y_A) = 0'],
        foot: 'An altitude from a vertex is perpendicular to the opposite side, so the opposite side\u2019s direction (C - B) is the normal of the altitude.',
        compute: (A, B, C) => {
            const mk = (P, Q, R) => geoNormLine({ a: R.x - Q.x, b: R.y - Q.y, c: -((R.x - Q.x) * P.x + (R.y - Q.y) * P.y) });
            const la = mk(A, B, C), lb = mk(B, C, A), lc = mk(C, A, B), H = triOrtho(A, B, C);
            const sl = (P, Q) => (Math.abs(Q.x - P.x) < 1e-12 ? 'undefined (vertical)' : tn((Q.y - P.y) / (Q.x - P.x)));
            return {
                points: [A, B, C], special: [Object.assign(H, { label: 'H' })], segs: triSides(A, B, C),
                lines: [Object.assign({ color: '#d44c2f', label: 'altitude A' }, la), Object.assign({ color: '#1f7f6a', label: 'altitude B' }, lb), Object.assign({ color: '#ca8a04', label: 'altitude C' }, lc)],
                steps: [
                    `① Slopes of the sides: BC = ${sl(B, C)}, CA = ${sl(C, A)}, AB = ${sl(A, B)}`,
                    `② Altitude from A ⟂ BC, through A${geoPtStr(A)}: ${geoEqL(la)}`,
                    `③ Altitude from B ⟂ CA, through B${geoPtStr(B)}: ${geoEqL(lb)}`,
                    `④ Altitude from C ⟂ AB, through C${geoPtStr(C)}: ${geoEqL(lc)}`,
                    `⑤ They meet at the orthocenter H = ${geoPtStr(H)}`
                ],
                result: `\\( ${geoEqL(la)};\\; ${geoEqL(lb)};\\; ${geoEqL(lc)} \\)`
            };
        }
    });
}

// ---------- 8. Equations of perpendicular bisectors ----------
function renderPerpBisectorsEquationsCard() {
    triCard({
        btn: 'perpBisectorsEquationsBtn', icon: '📐', title: 'Equations of Perpendicular Bisectors', prefix: 'pb',
        formulas: ['(x_B - x_A)(x - x_M) + (y_B - y_A)(y - y_M) = 0 \\quad (M = \\text{midpoint of } AB)'],
        foot: 'A perpendicular bisector passes through the midpoint of a side at a right angle to it. All three meet at the circumcenter.',
        compute: (A, B, C) => {
            const mk = (P, Q) => { const M = geoMid(P, Q), a = Q.x - P.x, b = Q.y - P.y; return { M, l: geoNormLine({ a, b, c: -(a * M.x + b * M.y) }) }; };
            const ab = mk(A, B), bc = mk(B, C), ca = mk(C, A), { O, R } = triCircum(A, B, C);
            return {
                points: [A, B, C], special: [Object.assign(O, { label: 'S' })], segs: triSides(A, B, C),
                lines: [Object.assign({ color: '#d44c2f', label: 'bisector of AB' }, ab.l), Object.assign({ color: '#1f7f6a', label: 'bisector of BC' }, bc.l), Object.assign({ color: '#ca8a04', label: 'bisector of CA' }, ca.l)],
                steps: [
                    `① Midpoint of AB = ${geoPtStr(ab.M)}, direction AB = (${tn(B.x - A.x)}, ${tn(B.y - A.y)})`,
                    `② Perpendicular bisector of AB: ${geoEqL(ab.l)}`,
                    `③ Midpoint of BC = ${geoPtStr(bc.M)} → ${geoEqL(bc.l)}`,
                    `④ Midpoint of CA = ${geoPtStr(ca.M)} → ${geoEqL(ca.l)}`,
                    `⑤ They meet at the circumcenter S = ${geoPtStr(O)}, with R = ${tn(R)}`
                ],
                result: `\\( ${geoEqL(ab.l)};\\; ${geoEqL(bc.l)};\\; ${geoEqL(ca.l)} \\)`
            };
        }
    });
}

// ---------- 9. Circumcenter using line equations ----------
function renderCircumcenterLineEqCard() {
    triCard({
        btn: 'circumcenterLineEqBtn', icon: '⚪', title: 'Circumcenter (using Line Equations)', prefix: 'cl',
        formulas: ['a_1x + b_1y + c_1 = 0,\\; a_2x + b_2y + c_2 = 0 \\;\\Rightarrow\\; x = \\frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1},\\; y = \\frac{c_1a_2 - c_2a_1}{a_1b_2 - a_2b_1}'],
        foot: 'Write the perpendicular bisectors of AB and BC as equations, then solve them together (Cramer\u2019s rule). The third bisector is a check.',
        compute: (A, B, C) => {
            const mk = (P, Q) => { const M = geoMid(P, Q), a = Q.x - P.x, b = Q.y - P.y; return { a, b, c: -(a * M.x + b * M.y) }; };
            const l1 = mk(A, B), l2 = mk(B, C), l3 = mk(C, A), det = l1.a * l2.b - l2.a * l1.b, O = geoIntersect(l1, l2), R = geoDist(O, A);
            const n1 = geoNormLine(l1), n2 = geoNormLine(l2);
            return {
                points: [A, B, C], special: [Object.assign(O, { label: 'S' })], segs: triSides(A, B, C),
                lines: [Object.assign({ color: '#d44c2f', label: 'bisector AB' }, n1), Object.assign({ color: '#1f7f6a', label: 'bisector BC' }, n2)],
                circles: [{ cx: O.x, cy: O.y, r: R, color: '#2b3595', label: 'circumcircle', dash: [6, 4] }],
                steps: [
                    `① Perpendicular bisector of AB: ${geoEqL(n1)}`,
                    `② Perpendicular bisector of BC: ${geoEqL(n2)}`,
                    `③ Determinant a₁b₂ - a₂b₁ = ${tn(n1.a * n2.b - n2.a * n1.b)}`,
                    `④ Sx = (b₁c₂ - b₂c₁)/det = ${tn((n1.b * n2.c - n2.b * n1.c) / (n1.a * n2.b - n2.a * n1.b))}`,
                    `⑤ Sy = (c₁a₂ - c₂a₁)/det = ${tn((n1.c * n2.a - n2.c * n1.a) / (n1.a * n2.b - n2.a * n1.b))}`,
                    `⑥ Check with the bisector of CA: ${tn(l3.a * O.x + l3.b * O.y + l3.c)} ≈ 0 ✓,   R = SA = ${tn(R)}`
                ],
                result: `\\( S = (${tn(O.x)},\\; ${tn(O.y)}),\\quad R = ${tn(R)} \\)`
            };
        }
    });
}

// ---------- 10. Orthocenter using line equations ----------
function renderOrthocenterLineEqCard() {
    triCard({
        btn: 'orthocenterLineEqBtn', icon: '🔺', title: 'Orthocenter (using Line Equations)', prefix: 'ol',
        formulas: ['a_1x + b_1y + c_1 = 0,\\; a_2x + b_2y + c_2 = 0 \\;\\Rightarrow\\; x = \\frac{b_1c_2 - b_2c_1}{a_1b_2 - a_2b_1},\\; y = \\frac{c_1a_2 - c_2a_1}{a_1b_2 - a_2b_1}'],
        foot: 'Write the altitudes from A and B as equations, then solve them together. The altitude from C is a check.',
        compute: (A, B, C) => {
            const mk = (P, Q, R) => ({ a: R.x - Q.x, b: R.y - Q.y, c: -((R.x - Q.x) * P.x + (R.y - Q.y) * P.y) });
            const l1 = mk(A, B, C), l2 = mk(B, C, A), l3 = mk(C, A, B), H = geoIntersect(l1, l2);
            const n1 = geoNormLine(l1), n2 = geoNormLine(l2), det = n1.a * n2.b - n2.a * n1.b;
            return {
                points: [A, B, C], special: [Object.assign(H, { label: 'H' })], segs: triSides(A, B, C),
                lines: [Object.assign({ color: '#d44c2f', label: 'altitude A' }, n1), Object.assign({ color: '#1f7f6a', label: 'altitude B' }, n2)],
                steps: [
                    `① Altitude from A (⟂ BC): ${geoEqL(n1)}`,
                    `② Altitude from B (⟂ CA): ${geoEqL(n2)}`,
                    `③ Determinant a₁b₂ - a₂b₁ = ${tn(det)}`,
                    `④ Hx = (b₁c₂ - b₂c₁)/det = ${tn((n1.b * n2.c - n2.b * n1.c) / det)}`,
                    `⑤ Hy = (c₁a₂ - c₂a₁)/det = ${tn((n1.c * n2.a - n2.c * n1.a) / det)}`,
                    `⑥ Check with the altitude from C: ${tn(l3.a * H.x + l3.b * H.y + l3.c)} ≈ 0 ✓`
                ],
                result: `\\( H = (${tn(H.x)},\\; ${tn(H.y)}) \\)`
            };
        }
    });
}

// ---------- 11. Incenter by the angle bisector method ----------
function renderIncenterAngleBisectorsCard() {
    triCard({
        btn: 'incenterAngleBisectorsBtn', icon: '🔴', title: 'Incenter (Angle Bisector Method)', prefix: 'ib',
        formulas: ['D = \\frac{bB + cC}{b + c}\\ (\\text{foot of the bisector from } A),\\quad BD : DC = c : b'],
        foot: 'The bisector of angle A meets BC at D with BD : DC = AB : AC = c : b. Intersect two such bisectors to find the incenter.',
        compute: (A, B, C, T) => {
            const D = geoPt((T.b * B.x + T.c * C.x) / (T.b + T.c), (T.b * B.y + T.c * C.y) / (T.b + T.c));
            const E = geoPt((T.c * C.x + T.a * A.x) / (T.a + T.c), (T.c * C.y + T.a * A.y) / (T.a + T.c));
            const lA = geoLineThrough(A, D), lB = geoLineThrough(B, E), I = geoIntersect(lA, lB), I2 = triIncenter(A, B, C, T);
            return {
                points: [A, B, C], special: [Object.assign(I, { label: 'I' })],
                segs: triSides(A, B, C).concat([{ from: A, to: D, color: '#d44c2f', dash: [5, 3], label: 'bisector A' }, { from: B, to: E, color: '#1f7f6a', dash: [5, 3], label: 'bisector B' }]),
                steps: [
                    `① Sides: a = BC = ${tn(T.a)}, b = CA = ${tn(T.b)}, c = AB = ${tn(T.c)}`,
                    `② Bisector from A meets BC at D, BD : DC = c : b = ${tn(T.c)} : ${tn(T.b)} → D = ${geoPtStr(D)}`,
                    `③ Bisector from B meets CA at E, CE : EA = a : c = ${tn(T.a)} : ${tn(T.c)} → E = ${geoPtStr(E)}`,
                    `④ Line AD: ${geoEqL(geoNormLine(lA))}      Line BE: ${geoEqL(geoNormLine(lB))}`,
                    `⑤ Intersection: I = ${geoPtStr(I)}`,
                    `⑥ Check with I = (aA + bB + cC)/(a+b+c) = ${geoPtStr(I2)} ✓`
                ],
                result: `\\( I = (${tn(I.x)},\\; ${tn(I.y)}) \\)`
            };
        }
    });
}

// ---------- 12. Pedal triangle ----------
function renderPedalTriangleCard() {
    triCard({
        btn: 'pedalTriangleBtn', icon: '🔻', title: 'Pedal Triangle (Foot of Altitudes)', prefix: 'pd',
        formulas: ['D,\\ E,\\ F = \\text{feet of the altitudes on } BC,\\ CA,\\ AB'],
        foot: 'The pedal (orthic) triangle joins the feet of the three altitudes. Here the point is the orthocenter H.',
        compute: (A, B, C) => {
            const D = geoFoot(A, geoLineThrough(B, C)), E = geoFoot(B, geoLineThrough(C, A)), F = geoFoot(C, geoLineThrough(A, B));
            const d1 = geoDist(E, F), d2 = geoDist(F, D), d3 = geoDist(D, E), area = Math.abs(D.x * (E.y - F.y) + E.x * (F.y - D.y) + F.x * (D.y - E.y)) / 2, H = triOrtho(A, B, C);
            return {
                points: [A, B, C], special: [Object.assign(D, { label: 'D' }), Object.assign(E, { label: 'E' }), Object.assign(F, { label: 'F' })],
                segs: triSides(A, B, C).concat([{ from: D, to: E, color: '#d44c2f', width: 3, label: 'pedal DE' }, { from: E, to: F, color: '#d44c2f', width: 3, label: 'pedal EF' }, { from: F, to: D, color: '#d44c2f', width: 3, label: 'pedal FD' }, { from: A, to: D, color: '#94a3b8', dash: [4, 3], label: '' }, { from: B, to: E, color: '#94a3b8', dash: [4, 3], label: '' }, { from: C, to: F, color: '#94a3b8', dash: [4, 3], label: '' }]),
                steps: [
                    `① Foot D of the altitude from A on BC = ${geoPtStr(D)}`,
                    `② Foot E of the altitude from B on CA = ${geoPtStr(E)}`,
                    `③ Foot F of the altitude from C on AB = ${geoPtStr(F)}`,
                    `④ Pedal triangle sides: EF = ${tn(d1)}, FD = ${tn(d2)}, DE = ${tn(d3)}`,
                    `⑤ Perimeter = ${tn(d1 + d2 + d3)},  Area = ${tn(area)}`,
                    `⑥ The altitudes meet at H = ${geoPtStr(H)}`
                ],
                result: `\\( D=${geoPtStr(D)},\\; E=${geoPtStr(E)},\\; F=${geoPtStr(F)} \\)`.replace(/\(/g, '(')
            };
        }
    });
}

// ---------- 13. Excenters ----------
function renderExcentersCard() {
    triCard({
        btn: 'excentersBtn', icon: '⭕', title: 'Excenters (External Angle Bisectors)', prefix: 'ex',
        formulas: ['I_a = \\frac{-aA + bB + cC}{-a+b+c},\\; I_b = \\frac{aA - bB + cC}{a-b+c},\\; I_c = \\frac{aA + bB - cC}{a+b-c}', 'r_a = \\frac{\\text{Area}}{s-a}'],
        foot: 'An excenter is where one internal and two external angle bisectors meet. It is the centre of a circle that touches one side and the extensions of the other two.',
        compute: (A, B, C, T) => {
            const w = (wa, wb, wc) => { const s = wa + wb + wc; return geoPt((wa * A.x + wb * B.x + wc * C.x) / s, (wa * A.y + wb * B.y + wc * C.y) / s); };
            const Ia = w(-T.a, T.b, T.c), Ib = w(T.a, -T.b, T.c), Ic = w(T.a, T.b, -T.c), ra = T.area / (T.s - T.a), rb = T.area / (T.s - T.b), rc = T.area / (T.s - T.c);
            return {
                points: [A, B, C], special: [Object.assign(Ia, { label: 'Iₐ' }), Object.assign(Ib, { label: 'I_b' }), Object.assign(Ic, { label: 'I_c' })],
                segs: triSides(A, B, C).concat([{ from: A, to: Ia, color: '#d44c2f', dash: [5, 3], label: 'A–Iₐ' }, { from: B, to: Ib, color: '#1f7f6a', dash: [5, 3], label: 'B–I_b' }, { from: C, to: Ic, color: '#ca8a04', dash: [5, 3], label: 'C–I_c' }]),
                steps: [
                    `① Sides: a = ${tn(T.a)}, b = ${tn(T.b)}, c = ${tn(T.c)};  s = ${tn(T.s)};  Area = ${tn(T.area)}`,
                    `② Iₐ (opposite A) = ${geoPtStr(Ia)},  rₐ = Area/(s-a) = ${tn(ra)}`,
                    `③ I_b (opposite B) = ${geoPtStr(Ib)},  r_b = Area/(s-b) = ${tn(rb)}`,
                    `④ I_c (opposite C) = ${geoPtStr(Ic)},  r_c = Area/(s-c) = ${tn(rc)}`,
                    `⑤ Check: 1/r = ${tn(T.s / T.area)} and 1/rₐ + 1/r_b + 1/r_c = ${tn(1 / ra + 1 / rb + 1 / rc)}`
                ],
                result: `\\( I_a=${geoPtStr(Ia)},\\; I_b=${geoPtStr(Ib)},\\; I_c=${geoPtStr(Ic)} \\)`
            };
        }
    });
}

// ---------- 14. Euler line ----------
function renderEulerLineCard() {
    triCard({
        btn: 'eulerLineBtn', icon: '📈', title: 'Euler Line (G, O, H Collinearity)', prefix: 'eu',
        formulas: ['G, O, H \\text{ lie on one line, and } OG : GH = 1 : 2', 'H = 3G - 2O'],
        foot: 'The centroid G, circumcenter S (also called O) and orthocenter H always lie on one straight line, the Euler line. G sits one third of the way from S to H. For an equilateral triangle the three points coincide.',
        compute: (A, B, C) => {
            const G = geoPt((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3), { O } = triCircum(A, B, C), H = triOrtho(A, B, C);
            const same = geoDist(O, H) < 1e-9, line = same ? null : geoNormLine(geoLineThrough(O, H));
            const cross = (G.x - O.x) * (H.y - O.y) - (G.y - O.y) * (H.x - O.x);
            return {
                points: [A, B, C], special: [Object.assign(G, { label: 'G' }), Object.assign(O, { label: 'S (circumcenter)' }), Object.assign(H, { label: 'H' })],
                segs: triSides(A, B, C), lines: line ? [Object.assign({ color: '#d44c2f', label: 'Euler line', width: 2 }, line)] : [],
                steps: [
                    `① Centroid G = ${geoPtStr(G)}`,
                    `② Circumcenter S = ${geoPtStr(O)}`,
                    `③ Orthocenter H = ${geoPtStr(H)}`,
                    same ? `④ S and H coincide: the triangle is equilateral, so G, S and H are the same point` : `④ Euler line through S and H: ${geoEqL(line)}`,
                    `⑤ Collinearity check: (G-S) × (H-S) = ${tn(cross)} ≈ 0 ✓`,
                    `⑥ Distances: SG = ${tn(geoDist(O, G))}, GH = ${tn(geoDist(G, H))}, so GH = 2·SG ✓`
                ],
                result: same ? `\\( G = S = H = (${tn(G.x)},\\; ${tn(G.y)}) \\)` : `\\( ${geoEqL(line)},\\quad SG : GH = 1 : 2 \\)`
            };
        }
    });
}

// ---------- Click handlers for the buttons that had none ----------
['incenterAngleBisectorsBtn:renderIncenterAngleBisectorsCard', 'pedalTriangleBtn:renderPedalTriangleCard', 'excentersBtn:renderExcentersCard', 'eulerLineBtn:renderEulerLineCard'].forEach(pair => {
    const [id, fn] = pair.split(':'), btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => { destroyGraph(); switchTab('tabStandardPoints'); window[fn](); });
});
