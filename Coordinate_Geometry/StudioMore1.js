// ========= Animation Studio: extra scenes, part 1 (tabs 2 to 4) =========
// Loaded before ConceptStudio.js. Each scene is { id, tab, title, params, f, fit, valid, draw, out };
// EXTRAS-style details (chip, step marks, handles, challenges) go in MORE.extras, bindings tie a card to a scene.
(window.__studioParts = window.__studioParts || []).push(function (E, scenes, BINDINGS, MORE) {
'use strict';
const { C, FONT, EPS, pick, ease, seg, lerp, fmt, fin, eqStr, slopeEq, niceEq, intersect, foot } = E;
const T2 = (s, i) => [s, i || s];
const R8 = [-8, 8, 1];
const rg = (keys, r) => Object.fromEntries(keys.map(k => [k, r]));
const D2R = Math.PI / 180;

// ---------- shared drawing kit (used by the other parts too) ----------
const kit = E.kit = {
  rect: g => { const b = g.b; return [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]]; },
  clip: (poly, a, b, c, sign) => {   // keep the part where sign * (a x + b y + c) >= 0
    const out = [], n = poly.length;
    for (let i = 0; i < n; i++) {
      const P = poly[i], Q = poly[(i + 1) % n], fp = sign * (a * P[0] + b * P[1] + c), fq = sign * (a * Q[0] + b * Q[1] + c);
      if (fp >= 0) out.push(P);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
    }
    return out;
  },
  half: (g, a, b, c, sign, col, alpha) => { const p = kit.clip(kit.rect(g), a, b, c, sign); if (p.length > 2) g.poly(p, col, alpha); },
  band: (g, a, b, sLo, sHi, col, alpha) => { let p = kit.clip(kit.rect(g), a, b, -sLo, 1); p = kit.clip(p, a, b, -sHi, -1); if (p.length > 2) g.poly(p, col, alpha); },   // sLo <= a x + b y <= sHi
  arrow: (g, x1, y1, x2, y2, col, w = 3, alpha = 1) => {
    g.L(x1, y1, x2, y2, col, w, null, alpha);
    const ctx = g.ctx, X1 = g.X(x1), Y1 = g.Y(y1), X2 = g.X(x2), Y2 = g.Y(y2), ang = Math.atan2(Y2 - Y1, X2 - X1);
    if (Math.hypot(X2 - X1, Y2 - Y1) < 4) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X2, Y2); ctx.lineTo(X2 - 12 * Math.cos(ang - .4), Y2 - 12 * Math.sin(ang - .4)); ctx.lineTo(X2 - 12 * Math.cos(ang + .4), Y2 - 12 * Math.sin(ang + .4)); ctx.closePath(); ctx.fill(); ctx.restore();
  },
  poly: (g, pts, col, w = 3, dash, alpha = 1) => {
    const ctx = g.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = alpha; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(g.X(q[0]), g.Y(q[1])) : ctx.moveTo(g.X(q[0]), g.Y(q[1])))); ctx.stroke(); ctx.restore();
  },
  arc: (g, cx, cy, rpx, a0, a1, col, alpha = .25, w = 2.5) => {   // angles in radians (maths direction), radius in pixels
    const ctx = g.ctx; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(g.X(cx), g.Y(cy)); ctx.arc(g.X(cx), g.Y(cy), rpx, -a0, -a1, a1 > a0); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(g.X(cx), g.Y(cy), rpx, -a0, -a1, a1 > a0); ctx.stroke(); ctx.restore();
  },
  // marching squares: draw the curve f(x, y) = 0 over the visible window
  implicit: (g, f, col, w = 3, alpha = 1, N = 150) => {
    const b = g.b, nx = N, ny = Math.max(20, Math.round(N * (b.y1 - b.y0) / (b.x1 - b.x0))), dx = (b.x1 - b.x0) / nx, dy = (b.y1 - b.y0) / ny, v = [];
    for (let j = 0; j <= ny; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(f(b.x0 + i * dx, b.y0 + j * dy)); v.push(row); }
    const ctx = g.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = alpha; ctx.lineCap = 'round'; ctx.beginPath();
    const X = (i, j) => g.X(b.x0 + i * dx), Y = (i, j) => g.Y(b.y0 + j * dy);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const va = v[j][i], vb = v[j][i + 1], vc = v[j + 1][i + 1], vd = v[j + 1][i];
      if (!isFinite(va + vb + vc + vd)) continue;
      const idx = (va > 0 ? 1 : 0) | (vb > 0 ? 2 : 0) | (vc > 0 ? 4 : 0) | (vd > 0 ? 8 : 0); if (idx === 0 || idx === 15) continue;
      const t = (p, q) => (p === q ? .5 : p / (p - q));
      const e = [
        () => [X(i, j) + t(va, vb) * (X(i + 1, j) - X(i, j)), Y(i, j)],          // bottom a-b
        () => [X(i + 1, j), Y(i, j) + t(vb, vc) * (Y(i, j + 1) - Y(i, j))],      // right b-c
        () => [X(i, j + 1) + t(vd, vc) * (X(i + 1, j) - X(i, j)), Y(i, j + 1)],  // top d-c
        () => [X(i, j), Y(i, j) + t(va, vd) * (Y(i, j + 1) - Y(i, j))]           // left a-d
      ];
      const seg2 = (p, q) => { const P = e[p](), Q = e[q](); ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); };
      const cen = (va + vb + vc + vd) / 4;
      switch (idx) { case 1: case 14: seg2(3, 0); break; case 2: case 13: seg2(0, 1); break; case 3: case 12: seg2(3, 1); break; case 4: case 11: seg2(1, 2); break; case 6: case 9: seg2(0, 2); break; case 7: case 8: seg2(3, 2); break;
        case 5: if (cen > 0) { seg2(0, 1); seg2(3, 2); } else { seg2(3, 0); seg2(1, 2); } break;
        case 10: if (cen > 0) { seg2(3, 0); seg2(1, 2); } else { seg2(0, 1); seg2(3, 2); } break; }
    }
    ctx.stroke(); ctx.restore();
  },
  // isometric 3D scene: x runs down-left, y down-right, z up
  iso: (g, ext, O = [240, 200]) => {
    const ctx = g.ctx, L = ext + 1, u = Math.min(40, 140 / (ext + 1)), cs = .866;
    const pr = (x, y, z) => [O[0] + (y - x) * cs * u, O[1] + (x + y) * .5 * u - z * u];
    const ln = (p0, p1, col, w, dash, alpha = 1) => { const p = pr(...p0), q = pr(...p1); ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); };
    const tx = (s, p, col, dx = 0, dy = 0, size = 14, align = 'center') => { const q = Array.isArray(p) && p.length === 3 ? pr(...p) : p; ctx.save(); ctx.font = '700 ' + size + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(s, q[0] + dx, q[1] + dy); ctx.restore(); };
    const dot = (p, col, r = 6) => { const q = pr(...p); ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); };
    const poly = (pts, col, alpha) => { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); pts.forEach((p, i) => { const q = pr(...p); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill(); ctx.restore(); };
    const axes = () => {
      const gs = Math.max(1, Math.ceil(ext / 5)); for (let i = 0; i <= L; i += gs) { ln([i, 0, 0], [i, L, 0], C.grid, 1); ln([0, i, 0], [L, i, 0], C.grid, 1); }
      ln([0, 0, 0], [L, 0, 0], C.ink, 1.8); ln([0, 0, 0], [0, L, 0], C.ink, 1.8); ln([0, 0, 0], [0, 0, L], C.ink, 1.8);
      ln([0, 0, 0], [-L, 0, 0], C.faint, 1.3, [4, 4]); ln([0, 0, 0], [0, -L, 0], C.faint, 1.3, [4, 4]); ln([0, 0, 0], [0, 0, -L], C.faint, 1.3, [4, 4]);
      tx('x', [L + .7, 0, 0], C.ink, 0, 5); tx('y', [0, L + .7, 0], C.ink, 0, 5); tx('z', [0, 0, L + .7], C.ink, 0, 0);
    };
    return { pr, ln, tx, dot, poly, axes, u, L };
  }
};
const lineEnds = (a, b, c, cx, cy, span) => { const n = Math.hypot(a, b), v = (a * cx + b * cy + c) / (n * n), fx = cx - a * v, fy = cy - b * v, dx = -b / n, dy = a / n; return [[fx - dx * span, fy - dy * span], [fx + dx * span, fy + dy * span]]; };
const sgnTxt = s => (Math.abs(s) < 1e-9 ? 'ON the line' : s > 0 ? 'on the POSITIVE side' : 'on the NEGATIVE side');
const mk = (id, tab, title, tag, params, f, o) => { const sc = Object.assign({ id, tab, title, tag, params, f }, o); scenes.push(sc); return sc; };
const ptStr = (x, y) => '(' + fmt(x) + ', ' + fmt(y) + ')';

// ======================= Tab 2 =======================
// 1. Walk along a line: parametric and symmetric form
mk('param', 2, 'Walking along a line: parametric form', 'Class 11–12', [['x1', 'x₁', 2], ['y1', 'y₁', 3], ['ca', 'cos α', .6], ['cb', 'cos β', .8], ['r', 'r (distance)', 5]],
  ['Start at a point, face a direction, and walk r steps.', 'x = x₁ + r cos α,  y = y₁ + r cos β   (direction cosines; symmetric form: (x − x₁)/cos α = (y − y₁)/cos β = r)'], {
  fit: P => [[P.x1, P.y1], [P.x1 + P.r * P.ca, P.y1 + P.r * P.cb], [P.x1 - .5 * P.ca * Math.max(1, P.r), P.y1 - .5 * P.cb * Math.max(1, P.r)]],
  valid: P => fin(P.x1, P.y1, P.ca, P.cb, P.r) && Math.hypot(P.ca, P.cb) > EPS,
  draw(g, t, C, lv, P) {
    const { x1, y1, ca, cb, r } = P, e1 = ease(seg(t, .12, .7)), e2 = ease(seg(t, .72, .95)), X = x1 + r * ca, Y = y1 + r * cb, cx = x1 + r * ca * e1, cy = y1 + r * cb * e1;
    g.LL(cb, -ca, -(cb * x1 - ca * y1), C.faint, 2, [6, 6]);
    if (e1 > 0) E.kit.arrow(g, x1, y1, cx, cy, C.c, 4);
    if (e2 > 0) { g.L(x1, y1, x1 + r * ca * e2, y1, C.c, 3, [6, 4]); g.L(X, y1, X, y1 + r * cb * e2, C.g, 3, [6, 4]); }
    if (e2 >= 1) { g.T('r cos α = ' + fmt(r * ca), (x1 + X) / 2, y1, C.c, { dy: cb >= 0 ? 18 : -18, size: 12 }); g.T('r cos β = ' + fmt(r * cb), X, (y1 + Y) / 2, C.g, { dx: ca >= 0 ? 52 : -52, size: 12 }); }
    g.D(x1, y1, C.ink, 6); g.T('P₁' + ptStr(x1, y1), x1, y1, C.ink, { dy: cb >= 0 ? 20 : -20, size: 13 });
    g.D(cx, cy, C.a, 8); if (t > .7) g.T('P' + ptStr(X, Y), X, Y, C.a, { dy: cb >= 0 ? -20 : 20, size: 14 });
    const k = t < .12 ? 0 : t < .72 ? 1 : 2;
    return pick(lv, ['Start at P₁(' + fmt(x1) + ', ' + fmt(y1) + ') and face the direction (' + fmt(ca) + ', ' + fmt(cb) + ').', 'Walk ' + fmt(r) + ' steps along the line…', 'You stop at P' + ptStr(X, Y) + ': ' + fmt(r * ca) + ' across and ' + fmt(r * cb) + ' up.'],
      ['P₁(' + fmt(x1) + ', ' + fmt(y1) + '), direction cosines (cos α, cos β) = (' + fmt(ca) + ', ' + fmt(cb) + ').', 'x = x₁ + r cos α,  y = y₁ + r cos β with r = ' + fmt(r) + '.', 'P = (' + fmt(x1) + ' + ' + fmt(r) + '·' + fmt(ca) + ', ' + fmt(y1) + ' + ' + fmt(r) + '·' + fmt(cb) + ') = ' + ptStr(X, Y) + '.'])[k];
  },
  out: (P, lv) => 'At r = ' + fmt(P.r) + ':  P = ' + ptStr(P.x1 + P.r * P.ca, P.y1 + P.r * P.cb) + (Math.abs(Math.hypot(P.ca, P.cb) - 1) > 1e-3 ? '   (note: cos²α + cos²β = ' + fmt(P.ca * P.ca + P.cb * P.cb, 3) + ', a real direction cosine pair gives 1)' : '') });
MORE.extras.param = { chip: 'Walk along a line', marks: [0, .12, .72], ranges: { x1: R8, y1: R8, ca: [-1, 1, .1], cb: [-1, 1, .1], r: [0, 12, .5] },
  handles: P => [{ k: '1', x: P.x1, y: P.y1, label: 'P₁' }], drag: (P, k, x, y) => Object.assign({}, P, { x1: x, y1: y }),
  challenges: [{ id: 'param-x8', text: T2('Make the walker finish at x = 8.', 'Choose r so that x = x₁ + r cos α equals 8.'), hint: T2('The walker moves across by r × cos α. Try a longer walk.', 'r cos α = 8 − x₁.'), check: P => Math.abs(P.x1 + P.r * P.ca - 8) < 1e-9 },
    { id: 'param-flat', text: T2('Make the line perfectly flat (cos β = 0).'), hint: T2('A flat line has no "up" part in its direction.', 'cos β = 0 and cos α = ±1.'), check: P => Math.abs(P.cb) < EPS && Math.abs(P.ca) > EPS }] };
MORE.hooks.param = 'A drone flies from a launch point in a fixed direction. Where is it after r metres?';
BINDINGS.push(
  { scene: 'param', ids: ['paramX1', 'paramY1', 'paramCosA', 'paramCosB', 'paramR'], get: v => ({ x1: v[0], y1: v[1], ca: v[2], cb: v[3], r: v[4] }), set: P => ({ paramX1: P.x1, paramY1: P.y1 }) },
  { scene: 'param', ids: ['symX1', 'symY1', 'symTheta', 'symR'], get: v => ({ x1: v[0], y1: v[1], ca: Math.cos(v[2] * D2R), cb: Math.sin(v[2] * D2R), r: v[3] }), set: P => ({ symX1: P.x1, symY1: P.y1 }) });

// 2. Horizontal and vertical lines
mk('axisline', 2, 'Horizontal and vertical lines', 'Class 8–10', [['k', 'k', 3], ['px', 'test x', 2], ['py', 'test y', 3]],
  ['y = k is flat. x = k is straight up and down.', 'Horizontal: y = k, slope 0, parallel to the x-axis.  Vertical: x = k, slope undefined, parallel to the y-axis.'], {
  selects: { vert: ['Line type', ['horizontal  y = k', 'vertical  x = k']] },
  fit: P => [[0, 0], [P.vert ? P.k : P.px, P.vert ? P.py : P.k], [P.px, P.py], [3, 3], [-3, -3]],
  valid: P => fin(P.k, P.px, P.py),
  draw(g, t, C, lv, P) {
    const { k, px, py, vert } = P, e = ease(seg(t, .12, .6)), kt = k * e, on = Math.abs((vert ? px : py) - k) < 1e-9;
    g.LL(vert ? 1 : 0, vert ? 0 : 1, -kt, C.a, 4);
    if (e >= 1) g.T(vert ? 'x = ' + fmt(k) : 'y = ' + fmt(k), vert ? k : 0, vert ? 0 : k, C.a, { dx: vert ? 40 : 40, dy: vert ? 18 : -14, size: 15 });
    if (t > .65) { g.D(px, py, on ? C.g : C.ink, 8); g.T('P' + ptStr(px, py) + (on ? ' ✓ on the line' : ' not on the line'), px, py, on ? C.g : C.ink, { dy: -20, size: 13 }); }
    const kk = t < .12 ? 0 : t < .6 ? 1 : 2;
    return pick(lv, ['The axes.', 'Slide the line to ' + (vert ? 'x' : 'y') + ' = ' + fmt(k) + '. Every point on it has the same ' + (vert ? 'x' : 'y') + ' number.', on ? 'The test point is on the line.' : 'The test point is not on the line (its ' + (vert ? 'x' : 'y') + ' is ' + fmt(vert ? px : py) + ').'],
      [vert ? 'x = k' : 'y = k', 'k = ' + fmt(k) + ',  slope ' + (vert ? 'undefined (Δx = 0)' : '= 0') + ',  parallel to the ' + (vert ? 'y' : 'x') + '-axis.', 'Substituting P: ' + (vert ? 'x' : 'y') + ' = ' + fmt(vert ? px : py) + (on ? ' = k, so P is on the line.' : ' ≠ k, so P is not on the line.')])[kk];
  },
  out: (P, lv) => (P.vert ? 'x = ' + fmt(P.k) + '  (slope undefined)' : 'y = ' + fmt(P.k) + '  (slope 0)') + ';  test point ' + ptStr(P.px, P.py) + (Math.abs((P.vert ? P.px : P.py) - P.k) < 1e-9 ? ' is ON the line' : ' is NOT on the line') });
MORE.extras.axisline = { chip: 'Flat and upright lines', marks: [0, .12, .6], ranges: { k: R8, px: R8, py: R8 },
  handles: P => [{ k: 'L', x: P.vert ? P.k : 0, y: P.vert ? 0 : P.k, label: 'line' }, { k: 'T', x: P.px, y: P.py, label: 'P' }],
  drag: (P, k, x, y) => (k === 'L' ? Object.assign({}, P, { k: P.vert ? x : y }) : Object.assign({}, P, { px: x, py: y })),
  challenges: [{ id: 'axis-on', text: T2('Put the test point exactly on the line.'), hint: T2('Match the point’s ' + 'height (or across number) to k.', 'For y = k the point needs y = k.'), check: P => Math.abs((P.vert ? P.px : P.py) - P.k) < 1e-9 },
    { id: 'axis-neg', text: T2('Make the line sit below the x-axis (or left of the y-axis): k < 0.'), hint: T2('Slide the line the other way.', 'k must be negative.'), check: P => P.k < 0 }] };
MORE.hooks.axisline = 'A floor is a horizontal line. A wall is a vertical line.';
BINDINGS.push(
  { scene: 'axisline', ids: ['horizK', 'horizX', 'horizY'], get: v => ({ k: v[0], px: v[1], py: v[2], vert: 0 }), set: P => ({ horizK: P.k, horizX: P.px, horizY: P.py }) },
  { scene: 'axisline', ids: ['vertK', 'vertX', 'vertY'], get: v => ({ k: v[0], px: v[1], py: v[2], vert: 1 }), set: P => ({ vertK: P.k, vertX: P.px, vertY: P.py }) });

// 3. General form: slope, intercepts, distances from the axes
const gl = P => { const { a, b, c } = P; return { m: Math.abs(b) < EPS ? NaN : -a / b, xi: Math.abs(a) < EPS ? NaN : -c / a, yi: Math.abs(b) < EPS ? NaN : -c / b }; };
mk('genline', 2, 'Reading a line from ax + by + c = 0', 'Class 9–12', [['a', 'a', 2], ['b', 'b', -3], ['c', 'c', 6]],
  ['The numbers a, b, c tell you the slope and where the line crosses each axis.', 'm = −a/b,  x-intercept = −c/a,  y-intercept = −c/b'], {
  selects: { mode: ['Find', ['slope', 'x-intercept', 'y-intercept', 'distances from the axes']] },
  fit: P => { const q = gl(P); return [[0, 0], [Number.isFinite(q.xi) ? q.xi : 0, 0], [0, Number.isFinite(q.yi) ? q.yi : 0], [3, 3], [-3, -3]]; },
  valid: P => fin(P.a, P.b, P.c) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { a, b, c, mode } = P, q = gl(P), e = ease(seg(t, .1, .4)), e2 = ease(seg(t, .4, .75));
    g.LL(a, b, c, C.ink, 3.5, null, e);
    const X = Number.isFinite(q.xi) ? [q.xi, 0] : null, Y = Number.isFinite(q.yi) ? [0, q.yi] : null;
    if (mode === 0 && X && Y && Math.abs(X[0]) > 1e-9) { const x2 = q.xi, y2 = 0, run = Math.abs(x2) < 1e-9 ? 1 : 1; g.L(0, q.yi, x2, q.yi, C.c, 4, null, e2); g.L(x2, q.yi, x2, 0, C.g, 4, null, e2); if (e2 >= 1) { g.T('across ' + fmt(x2), x2 / 2, q.yi, C.c, { dy: q.yi >= 0 ? -16 : 16, size: 12 }); g.T('up ' + fmt(-q.yi), x2, q.yi / 2, C.g, { dx: x2 >= 0 ? 44 : -44, size: 12 }); } }
    if (X && (mode === 1 || mode === 3 || mode === 0)) { g.D(X[0], 0, C.c, 8 * (mode === 2 ? .6 : 1)); if (mode === 1 && e2 > 0) g.T('(' + fmt(X[0]) + ', 0)', X[0], 0, C.c, { dy: 24, size: 14 }); }
    if (Y && (mode === 2 || mode === 3 || mode === 0)) { g.D(0, Y[1], C.g, 8 * (mode === 1 ? .6 : 1)); if (mode === 2 && e2 > 0) g.T('(0, ' + fmt(Y[1]) + ')', 0, Y[1], C.g, { dx: 52, size: 14 }); }
    if (mode === 3 && e2 > 0) { if (Y) { g.L(0, Y[1], 0, 0, C.g, 4, null, e2); g.T('from x-axis: ' + fmt(Math.abs(Y[1])), 0, Y[1] / 2, C.g, { dx: 78, size: 12 }); } if (X) { g.L(X[0], 0, 0, 0, C.c, 4, null, e2); g.T('from y-axis: ' + fmt(Math.abs(X[0])), X[0] / 2, 0, C.c, { dy: 20, size: 12 }); } }
    const k = t < .1 ? 0 : t < .4 ? 1 : t < .75 ? 2 : 3, eq = eqStr(a, b, c), M = ['slope m = −a/b', 'x-intercept (put y = 0)', 'y-intercept (put x = 0)', 'distances (intercepts)'][mode];
    let fin_;
    if (mode === 0) fin_ = Number.isFinite(q.m) ? ['m = ' + fmt(q.m)] : ['vertical line, slope undefined'];
    else if (mode === 1) fin_ = Number.isFinite(q.xi) ? ['x = ' + fmt(q.xi)] : ['horizontal line: no x-intercept'];
    else if (mode === 2) fin_ = Number.isFinite(q.yi) ? ['y = ' + fmt(q.yi)] : ['vertical line: no y-intercept'];
    else fin_ = ['d from x-axis = ' + (Number.isFinite(q.yi) ? fmt(Math.abs(q.yi)) : '—') + ', d from y-axis = ' + (Number.isFinite(q.xi) ? fmt(Math.abs(q.xi)) : '—')];
    return pick(lv, ['The line ' + eq + '.', mode === 0 ? 'Rewrite it as y = mx + k: move the x and c terms across.' : mode === 1 ? 'Where it meets the x-axis, the height is 0, so put y = 0.' : mode === 2 ? 'Where it meets the y-axis, the across number is 0, so put x = 0.' : 'The intercepts are how far the line is from the origin along each axis.', 'Answer: ' + fin_[0] + '.', 'Check the dot' + (mode === 0 ? 's' : '') + ' on the picture.'],
      ['ax + by + c = 0 → ' + eq + '.', M + '.', fin_[0] + '.', 'Verify on the graph.'])[Math.min(k, 3)];
  },
  out: (P, lv) => { const q = gl(P), m = P.mode; if (m === 0) return Number.isFinite(q.m) ? 'm = −a/b = ' + fmt(q.m) : 'Vertical line: slope undefined'; if (m === 1) return Number.isFinite(q.xi) ? 'x-intercept = −c/a = ' + fmt(q.xi) + '  → point (' + fmt(q.xi) + ', 0)' : 'Horizontal line: no x-intercept'; if (m === 2) return Number.isFinite(q.yi) ? 'y-intercept = −c/b = ' + fmt(q.yi) + '  → point (0, ' + fmt(q.yi) + ')' : 'Vertical line: no y-intercept'; return 'd from the x-axis = |y-intercept| = ' + (Number.isFinite(q.yi) ? fmt(Math.abs(q.yi)) : '—') + ';  d from the y-axis = |x-intercept| = ' + (Number.isFinite(q.xi) ? fmt(Math.abs(q.xi)) : '—'); } });
MORE.extras.genline = { chip: 'Read ax + by + c = 0', marks: [0, .1, .4, .75], ranges: { a: [-8, 8, 1], b: [-8, 8, 1], c: [-12, 12, 1] },
  challenges: [{ id: 'gl-m1', text: T2('Make the slope exactly −1.'), hint: T2('Make a and b the same number (for example a = 2, b = 2).', 'm = −a/b = −1 means a = b.'), check: P => Math.abs(P.b) > EPS && Math.abs(-P.a / P.b + 1) < 1e-9 },
    { id: 'gl-origin', text: T2('Make the line pass through the origin.'), hint: T2('Set c to 0. Then (0, 0) satisfies the equation.', 'c = 0.'), check: P => Math.abs(P.c) < EPS }] };
MORE.hooks.genline = 'A ramp written as ax + by + c = 0: its numbers hide the steepness and where it meets the floor and the wall.';
BINDINGS.push(
  { scene: 'genline', ids: ['slopeGenA', 'slopeGenB', 'slopeGenC'], get: v => ({ a: v[0], b: v[1], c: v[2], mode: 0 }), set: P => ({ slopeGenA: P.a, slopeGenB: P.b, slopeGenC: P.c }) },
  { scene: 'genline', ids: ['xIntA', 'xIntB', 'xIntC'], get: v => ({ a: v[0], b: v[1], c: v[2], mode: 1 }) },
  { scene: 'genline', ids: ['yIntA', 'yIntB', 'yIntC'], get: v => ({ a: v[0], b: v[1], c: v[2], mode: 2 }) },
  { scene: 'genline', ids: ['distAxesA', 'distAxesB', 'distAxesC'], get: v => ({ a: v[0], b: v[1], c: v[2], mode: 3 }) });

// 4. Three lines: concurrency
const det3 = P => P.a1 * (P.b2 * P.c3 - P.c2 * P.b3) - P.b1 * (P.a2 * P.c3 - P.c2 * P.a3) + P.c1 * (P.a2 * P.b3 - P.b2 * P.a3);
mk('concur', 2, 'Do three lines meet at one point?', 'Class 11–12', [['a1', 'a₁', 1], ['b1', 'b₁', 1], ['c1', 'c₁', -2], ['a2', 'a₂', 2], ['b2', 'b₂', -1], ['c2', 'c₂', -1], ['a3', 'a₃', 3], ['b3', 'b₃', 2], ['c3', 'c₃', -4]],
  ['Three lines are concurrent if they all pass through the same point.', 'Concurrent ⇔ |a₁ b₁ c₁; a₂ b₂ c₂; a₃ b₃ c₃| = 0'], {
  fit: P => { const pts = [[0, 0]]; [[1, 2], [1, 3], [2, 3]].forEach(([i, j]) => { const I = intersect({ a1: P['a' + i], b1: P['b' + i], c1: P['c' + i], a2: P['a' + j], b2: P['b' + j], c2: P['c' + j] }); if (I && Math.abs(I[0]) < 60 && Math.abs(I[1]) < 60) pts.push(I); }); pts.push([4, 3], [-4, -3]); return pts; },
  valid: P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2, P.a3, P.b3, P.c3) && [1, 2, 3].every(i => Math.hypot(P['a' + i], P['b' + i]) > EPS),
  draw(g, t, C, lv, P) {
    const cols = [C.c, C.g, C.b], det = det3(P), L = [1, 2, 3].map(i => ({ a: P['a' + i], b: P['b' + i], c: P['c' + i] }));
    L.forEach((l, i) => g.LL(l.a, l.b, l.c, cols[i], 3.5, null, ease(seg(t, .06 + i * .16, .22 + i * .16))));
    const pairs = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => intersect({ a1: L[i].a, b1: L[i].b, c1: L[i].c, a2: L[j].a, b2: L[j].b, c2: L[j].c }));
    const conc = Math.abs(det) < 1e-9 && pairs.some(Boolean);
    if (t > .6) { if (conc) { const I = pairs.find(Boolean); g.D(I[0], I[1], C.a, 10); g.T('common point ' + ptStr(I[0], I[1]), I[0], I[1], C.a, { dy: -22, size: 14 }); } else pairs.forEach((q, i) => { if (q) { g.D(q[0], q[1], C.a, 7); g.T(['L₁∩L₂', 'L₁∩L₃', 'L₂∩L₃'][i], q[0], q[1], C.a, { dy: -16, size: 12 }); } }); }
    const k = t < .55 ? 0 : t < .8 ? 1 : 2;
    return pick(lv, ['Three lines are drawn one at a time.', conc ? 'They all cross at one point.' : 'Each pair of lines crosses at a different point.', conc ? 'The three lines are concurrent.' : 'The lines are NOT concurrent: they make a triangle.'],
      ['L₁: ' + eqStr(L[0].a, L[0].b, L[0].c) + ';  L₂: ' + eqStr(L[1].a, L[1].b, L[1].c) + ';  L₃: ' + eqStr(L[2].a, L[2].b, L[2].c) + '.', 'Determinant = ' + fmt(det) + '.', det === 0 || Math.abs(det) < 1e-9 ? 'Determinant = 0 → concurrent (or all parallel).' : 'Determinant ≠ 0 → not concurrent.'])[k];
  },
  out: (P, lv) => { const d = det3(P), I = intersect({ a1: P.a1, b1: P.b1, c1: P.c1, a2: P.a2, b2: P.b2, c2: P.c2 }); return 'Determinant = ' + fmt(d) + (Math.abs(d) < 1e-9 ? '  → CONCURRENT' + (I ? ' at ' + ptStr(I[0], I[1]) : ' (parallel family)') : '  → NOT concurrent'); } });
MORE.extras.concur = { chip: 'Three lines', marks: [0, .55, .8], ranges: rg(['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'], [-9, 9, 1]),
  challenges: [{ id: 'cc-conc', text: T2('Make the three lines concurrent.', 'Make the determinant 0.'), hint: T2('Make line 3 pass through the point where lines 1 and 2 cross. Try changing c₃ only.', 'Choose c₃ so that L₃ passes through L₁ ∩ L₂.'), check: P => Math.abs(det3(P)) < 1e-9 && !!intersect({ a1: P.a1, b1: P.b1, c1: P.c1, a2: P.a2, b2: P.b2, c2: P.c2 }) }] };
MORE.hooks.concur = 'Three roads meeting at one roundabout: do they, or do they make a triangle?';
BINDINGS.push(
  { scene: 'concur', ids: ['conA1', 'conB1', 'conC1', 'conA2', 'conB2', 'conC2', 'conA3', 'conB3', 'conC3'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], a3: v[6], b3: v[7], c3: v[8] }) },
  { scene: 'concur', ids: ['fccA1', 'fccB1', 'fccC1', 'fccA2', 'fccB2', 'fccC2', 'fccA3', 'fccB3', 'fccC3'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], a3: v[6], b3: v[7], c3: v[8] }) });

// 5. Family of lines L1 + lambda L2 = 0
const fam = (P, lam) => ({ a: P.a1 + lam * P.a2, b: P.b1 + lam * P.b2, c: P.c1 + lam * P.c2 });
mk('family', 2, 'Family of lines through an intersection point', 'Class 11–12', [['a1', 'a₁', 1], ['b1', 'b₁', 1], ['c1', 'c₁', -2], ['a2', 'a₂', 2], ['b2', 'b₂', -1], ['c2', 'c₂', -1], ['lam', 'λ', 1]],
  ['Turn the number λ and the line spins around one fixed point.', 'L₁ + λL₂ = 0 is every line through the point where L₁ and L₂ cross.'], {
  fit: P => { const I = intersect(P) || [0, 0]; return [[I[0] - 4.5, I[1] - 3.5], [I[0] + 4.5, I[1] + 3.5], [0, 0]]; },
  valid: P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2, P.lam) && Math.hypot(P.a1, P.b1) > EPS && Math.hypot(P.a2, P.b2) > EPS,
  draw(g, t, C, lv, P) {
    const I = intersect(P), e = ease(seg(t, .15, .8)), lt = lerp(-4, P.lam, e);
    for (let lm = -4; lm <= 4; lm += 1) { const m = fam(P, lm); if (Math.hypot(m.a, m.b) > 1e-9) g.LL(m.a, m.b, m.c, C.faint, 1.3, null, .35 * ease(seg(t, .05, .35))); }
    g.LL(P.a1, P.b1, P.c1, C.c, 3.5); g.LL(P.a2, P.b2, P.c2, C.g, 3.5);
    const m = fam(P, lt); if (Math.hypot(m.a, m.b) > 1e-9) g.LL(m.a, m.b, m.c, C.a, 4);
    if (I) { g.D(I[0], I[1], C.ink, 8); g.T('fixed point ' + ptStr(I[0], I[1]), I[0], I[1], C.ink, { dy: -20, size: 13 }); }
    const k = t < .15 ? 0 : t < .8 ? 1 : 2, mf = fam(P, P.lam);
    return pick(lv, ['Line 1 (blue) and line 2 (green).', 'Spin λ: the orange line turns around the crossing point.', 'With λ = ' + fmt(P.lam) + ' the line is ' + eqStr(mf.a, mf.b, mf.c) + '.'],
      ['L₁: ' + eqStr(P.a1, P.b1, P.c1) + ',  L₂: ' + eqStr(P.a2, P.b2, P.c2) + '.', 'λ = ' + fmt(lt, 2) + ' (moving). Every member passes through ' + (I ? ptStr(I[0], I[1]) : 'no common point (L₁ ∥ L₂)') + '.', '(L₁) + ' + fmt(P.lam) + '(L₂) = 0 → ' + eqStr(mf.a, mf.b, mf.c) + '.'])[k];
  },
  out: (P, lv) => { const m = fam(P, P.lam), I = intersect(P); return '(' + eqStr(P.a1, P.b1, P.c1).replace(' = 0', '') + ') + ' + fmt(P.lam) + '(' + eqStr(P.a2, P.b2, P.c2).replace(' = 0', '') + ') = 0  →  ' + eqStr(m.a, m.b, m.c) + (I ? ';  passes through ' + ptStr(I[0], I[1]) : ';  the lines are parallel'); } });
MORE.extras.family = { chip: 'Family L₁ + λL₂', marks: [0, .15, .8], ranges: Object.assign(rg(['a1', 'b1', 'c1', 'a2', 'b2', 'c2'], [-9, 9, 1]), { lam: [-6, 6, 0.5] }), loop: false,
  challenges: [{ id: 'fam-flat', text: T2('Choose λ so the member is perfectly flat (no x term).', 'Choose λ so that a₁ + λa₂ = 0.'), hint: T2('The x part is a₁ + λ·a₂. Make it zero.', 'λ = −a₁/a₂.'), check: P => Math.abs(P.a1 + P.lam * P.a2) < 1e-9 && Math.abs(P.b1 + P.lam * P.b2) > 1e-9 },
    { id: 'fam-origin', text: T2('Choose λ so the member passes through the origin.', 'Choose λ so that c₁ + λc₂ = 0.'), hint: T2('Through the origin means the constant part is 0.', 'λ = −c₁/c₂.'), check: P => Math.abs(P.c1 + P.lam * P.c2) < 1e-9 && Math.hypot(fam(P, P.lam).a, fam(P, P.lam).b) > 1e-9 }] };
MORE.hooks.family = 'Imagine a laser fixed at a crossing point that you can swing around: every beam is a member of the family.';
BINDINGS.push(
  { scene: 'family', ids: ['famA1', 'famB1', 'famC1', 'famA2', 'famB2', 'famC2', 'famLambda'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], lam: v[6] }) },
  { scene: 'family', ids: ['faiA1', 'faiB1', 'faiC1', 'faiA2', 'faiB2', 'faiC2', 'faiL'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], lam: v[6] }) },
  { scene: 'family', ids: ['ffbA0', 'ffbA1', 'ffbB0', 'ffbB1', 'ffbC0', 'ffbC1'], get: v => ({ a1: v[0], b1: v[2], c1: v[4], a2: v[1], b2: v[3], c2: v[5], lam: 1 }) },
  { scene: 'family', ids: ['familyL1A', 'familyL1B', 'familyL1C', 'familyL2A', 'familyL2B', 'familyL2C'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], lam: 1 }) });

// ======================= Tab 3 =======================
// 6. Line through a point, parallel or perpendicular to a given line
mk('parperp', 3, 'A line through a point: parallel or perpendicular', 'Class 9–12', [['a', 'a', 2], ['b', 'b', 3], ['c', 'c', -6], ['x0', 'x₀', 1], ['y0', 'y₀', 2]],
  ['Parallel lines point the same way. Perpendicular lines meet at a right angle.', 'Parallel: ax + by + λ = 0.  Perpendicular: bx − ay + λ = 0.  Put the point in to find λ.'], {
  selects: { mode: ['Draw the line that is', ['parallel', 'perpendicular']] },
  fit: P => [[P.x0, P.y0], [P.x0 + 3, P.y0 + 3], [P.x0 - 3, P.y0 - 3], [0, 0]],
  valid: P => fin(P.a, P.b, P.c, P.x0, P.y0) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { a, b, c, x0, y0, mode } = P, e = ease(seg(t, .3, .8));
    g.LL(a, b, c, C.ink, 3.5); g.D(x0, y0, C.a, 8); g.T('P₀' + ptStr(x0, y0), x0, y0, C.a, { dy: -20, size: 13 });
    if (mode === 0) { const lam = -(a * x0 + b * y0), ct = lerp(c, lam, e); g.LL(a, b, ct, C.a, 4, null, ease(seg(t, .12, .3))); }
    else { const al0 = Math.atan2(-a, b), al = al0 + Math.PI / 2 * e, nrm = [-Math.sin(al), Math.cos(al)]; g.LL(nrm[0], nrm[1], -(nrm[0] * x0 + nrm[1] * y0), C.a, 4, null, ease(seg(t, .12, .3))); if (e >= 1) { const I = intersect({ a1: a, b1: b, c1: c, a2: b, b2: -a, c2: -(b * x0 - a * y0) }); if (I) g.right(I[0], I[1], [b, -a], [x0 - I[0] || b, y0 - I[1] || -a]); } }
    const lam = mode === 0 ? -(a * x0 + b * y0) : -(b * x0 - a * y0), k = t < .3 ? 0 : t < .8 ? 1 : 2, eqf = mode === 0 ? eqStr(a, b, lam) : eqStr(b, -a, lam);
    return pick(lv, ['A line and a point P₀.', mode === 0 ? 'Slide a copy of the line, keeping its direction, until it touches P₀.' : 'Turn a copy a quarter turn (90°) and slide it to P₀.', 'The new line is ' + eqf + '.'],
      ['Given ' + eqStr(a, b, c) + ', P₀' + ptStr(x0, y0) + '.', mode === 0 ? 'Form ax + by + λ = 0; at P₀: λ = −(ax₀ + by₀) = ' + fmt(lam) + '.' : 'Form bx − ay + λ = 0; at P₀: λ = −(bx₀ − ay₀) = ' + fmt(lam) + '.', eqf + '.'])[k];
  },
  out: (P, lv) => { const lam = P.mode === 0 ? -(P.a * P.x0 + P.b * P.y0) : -(P.b * P.x0 - P.a * P.y0); return (P.mode === 0 ? 'Parallel line: ' + eqStr(P.a, P.b, lam) : 'Perpendicular line: ' + eqStr(P.b, -P.a, lam)) + '   (λ = ' + fmt(lam) + ')'; } });
MORE.extras.parperp = { chip: 'Parallel / perpendicular', marks: [0, .3, .8], ranges: { a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1], x0: R8, y0: R8 },
  handles: P => [{ k: 'P', x: P.x0, y: P.y0, label: 'P₀' }], drag: (P, k, x, y) => Object.assign({}, P, { x0: x, y0: y }),
  challenges: [{ id: 'pp-same', text: T2('Move P₀ onto the given line. What happens to the parallel line?', 'Put P₀ on the line so that λ = c.'), hint: T2('A parallel line through a point on the line is the same line.', 'ax₀ + by₀ + c = 0.'), check: P => Math.abs(P.a * P.x0 + P.b * P.y0 + P.c) < 1e-9 },
    { id: 'pp-origin', text: T2('Place P₀ so the new line passes through the origin.', 'Make λ = 0.'), hint: T2('The new line passes through the origin when the constant part is 0.', P => ''), check: P => (P.mode === 0 ? Math.abs(P.a * P.x0 + P.b * P.y0) : Math.abs(P.b * P.x0 - P.a * P.y0)) < 1e-9 }] };
MORE.extras.parperp.challenges[1].hint = T2('Try P₀ = (0, 0).', 'λ = 0, for example P₀ = (0, 0).');
MORE.hooks.parperp = 'Railway tracks are parallel. A zebra crossing meets the road at a right angle.';
BINDINGS.push(
  { scene: 'parperp', ids: ['parA', 'parB', 'parC', 'parX0', 'parY0'], get: v => ({ a: v[0], b: v[1], c: v[2], x0: v[3], y0: v[4], mode: 0 }), set: P => ({ parX0: P.x0, parY0: P.y0 }) },
  { scene: 'parperp', ids: ['perpA', 'perpB', 'perpC', 'perpX0', 'perpY0'], get: v => ({ a: v[0], b: v[1], c: v[2], x0: v[3], y0: v[4], mode: 1 }), set: P => ({ perpX0: P.x0, perpY0: P.y0 }) });

// 7. Image of a point in the axes, the origin, or y = x
const imgA = P => [[P.px, -P.py], [-P.px, P.py], [-P.px, -P.py], [P.py, P.px]][P.opt];
mk('axesimg', 3, 'Image of a point in the axes', 'Class 8–10', [['px', 'x', 3], ['py', 'y', 4]],
  ['The image is the mirror copy of the point.', 'x-axis: (x, −y).  y-axis: (−x, y).  origin: (−x, −y).  line y = x: (y, x).'], {
  selects: { opt: ['Mirror', ['x-axis', 'y-axis', 'origin', 'line y = x']] },
  fit: P => { const Q = imgA(P); return [[P.px, P.py], Q, [0, 0], [3, 3], [-3, -3]]; },
  valid: P => fin(P.px, P.py),
  draw(g, t, C, lv, P) {
    const { px, py, opt } = P, Q = imgA(P), e = ease(seg(t, .3, .75));
    if (opt === 0) g.LL(0, 1, 0, C.a, 4); else if (opt === 1) g.LL(1, 0, 0, C.a, 4); else if (opt === 3) g.LL(1, -1, 0, C.a, 4); else g.D(0, 0, C.a, 9);
    g.D(px, py, C.c, 8); g.T('P' + ptStr(px, py), px, py, C.c, { dy: -20, size: 14 });
    g.L(px, py, lerp(px, Q[0], e), lerp(py, Q[1], e), C.faint, 2.5, [6, 5]);
    if (e >= 1) { g.D(Q[0], Q[1], C.b, 8); g.T('Q' + ptStr(Q[0], Q[1]), Q[0], Q[1], C.b, { dy: 22, size: 14 }); }
    const k = t < .3 ? 0 : t < .75 ? 1 : 2, nm = ['x-axis', 'y-axis', 'origin', 'line y = x'][opt], rule = ['(x, −y)', '(−x, y)', '(−x, −y)', '(y, x)'][opt];
    return pick(lv, ['A point P' + ptStr(px, py) + ' and the ' + nm + ' as a mirror.', 'Reflect P across the ' + nm + '.', 'The image is Q' + ptStr(Q[0], Q[1]) + '.'], ['P' + ptStr(px, py) + ', mirror: ' + nm + '.', 'Rule: (x, y) → ' + rule + '.', 'Q = ' + ptStr(Q[0], Q[1]) + '.'])[k];
  },
  out: (P, lv) => 'Image of ' + ptStr(P.px, P.py) + ' in the ' + ['x-axis', 'y-axis', 'origin', 'line y = x'][P.opt] + ':  Q = ' + ptStr(imgA(P)[0], imgA(P)[1]) });
MORE.extras.axesimg = { chip: 'Mirror in the axes', marks: [0, .3, .75], ranges: rg(['px', 'py'], R8), handles: P => [{ k: 'P', x: P.px, y: P.py, label: 'P' }], drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
  challenges: [{ id: 'ai-self', text: T2('Put P where it is its own image (it sits on the mirror).', 'Choose P so that Q = P.'), hint: T2('A point on the mirror does not move. For the x-axis, use y = 0.', 'Q = P only when P lies on the mirror (or at the origin for the origin mirror).'), check: P => { const Q = imgA(P); return Math.abs(Q[0] - P.px) < EPS && Math.abs(Q[1] - P.py) < EPS; } },
    { id: 'ai-q3', text: T2('Make the image land in Quadrant III (both numbers negative).'), hint: T2('Work backwards: where should P start so the mirror puts it in the bottom-left?', 'Q must have x < 0 and y < 0.'), check: P => { const Q = imgA(P); return Q[0] < 0 && Q[1] < 0; } }] };
MORE.hooks.axesimg = 'Stand on the bank of a still lake: your reflection is the same distance below the surface.';
BINDINGS.push({ scene: 'axesimg', ids: ['axesX', 'axesY'], get: (v, rr) => ({ px: v[0], py: v[1], opt: Math.max(0, ['xaxis', 'yaxis', 'origin', 'yx'].indexOf(rr('axesOption'))) }), set: P => ({ axesX: P.px, axesY: P.py }) });

// 8. Foot of the perpendicular along a given direction
const fd = P => { const den = P.a * P.dx + P.b * P.dy; if (Math.abs(den) < 1e-9) return null; const t = -(P.a * P.px + P.b * P.py + P.c) / den; return { t, F: [P.px + t * P.dx, P.py + t * P.dy] }; };
mk('footdir', 3, 'Foot of a point along a given direction', 'Class 11–12', [['px', 'x₁', 3], ['py', 'y₁', 4], ['dx', 'dₓ', 1], ['dy', 'dᵧ', 2], ['a', 'a', 1], ['b', 'b', -1], ['c', 'c', 0]],
  ['Walk from P in a fixed direction until you hit the line.', 't = −(ax₁ + by₁ + c) / (a·dₓ + b·dᵧ),  F = P + t·d'], {
  fit: P => { const q = fd(P); return [[P.px, P.py], q ? q.F : [P.px + P.dx * 2, P.py + P.dy * 2], [P.px + 2, P.py + 2], [P.px - 2, P.py - 2]]; },
  valid: P => fin(P.px, P.py, P.dx, P.dy, P.a, P.b, P.c) && Math.hypot(P.dx, P.dy) > EPS && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { px, py, dx, dy, a, b, c } = P, q = fd(P), e = ease(seg(t, .3, .8));
    g.LL(a, b, c, C.ink, 3.5); E.kit.arrow(g, px, py, px + dx, py + dy, C.c, 3.5, ease(seg(t, .08, .3)));
    g.D(px, py, C.a, 8); g.T('P' + ptStr(px, py), px, py, C.a, { dy: -20, size: 13 });
    if (!q) return pick(lv, ['The walking direction is parallel to the line, so the walker never reaches it.'], ['a·dₓ + b·dᵧ = 0: the direction is parallel to the line, so there is no such foot.']);
    g.LL(dy, -dx, -(dy * px - dx * py), C.faint, 1.6, [6, 6], .8);
    const cx = px + q.t * dx * e, cy = py + q.t * dy * e; g.L(px, py, cx, cy, C.c, 3.5); g.D(cx, cy, C.a, 7);
    if (e >= 1) { g.D(q.F[0], q.F[1], C.g, 8); g.T('F' + ptStr(q.F[0], q.F[1]), q.F[0], q.F[1], C.g, { dy: 22, size: 14 }); }
    const k = t < .3 ? 0 : t < .8 ? 1 : 2;
    return pick(lv, ['A point P, a line, and a direction d.', 'Walk from P along d until you reach the line…', 'You reach it at F' + ptStr(q.F[0], q.F[1]) + ', after ' + fmt(Math.abs(q.t)) + ' steps of d.'],
      ['P' + ptStr(px, py) + ', d = (' + fmt(dx) + ', ' + fmt(dy) + '), line ' + eqStr(a, b, c) + '.', 't = −(' + fmt(a * px + b * py + c) + ')/(' + fmt(a * dx + b * dy) + ') = ' + fmt(q.t) + '.', 'F = P + t·d = ' + ptStr(q.F[0], q.F[1]) + '.'])[k];
  },
  out: (P, lv) => { const q = fd(P); return q ? 'F = ' + ptStr(q.F[0], q.F[1]) + '   (t = ' + fmt(q.t) + ')' : 'The direction is parallel to the line: no foot exists'; } });
MORE.extras.footdir = { chip: 'Foot along a direction', marks: [0, .3, .8], ranges: { px: R8, py: R8, dx: [-4, 4, 1], dy: [-4, 4, 1], a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1] },
  handles: P => [{ k: 'P', x: P.px, y: P.py, label: 'P' }, { k: 'D', x: P.px + P.dx, y: P.py + P.dy, label: 'd' }],
  drag: (P, k, x, y) => (k === 'P' ? Object.assign({}, P, { px: x, py: y }) : ((x - P.px) === 0 && (y - P.py) === 0 ? null : Object.assign({}, P, { dx: x - P.px, dy: y - P.py }))),
  challenges: [{ id: 'fd-perp', text: T2('Choose the direction so the walker goes straight across (perpendicular to the line).', 'Choose d parallel to the normal (a, b).'), hint: T2('A path at a right angle to the line follows the line’s normal (a, b).', 'd × (a, b) = 0.'), check: P => Math.abs(P.dx * P.b - P.dy * P.a) < 1e-9 },
    { id: 'fd-miss', text: T2('Choose a direction that never reaches the line.', 'Choose d with a·dₓ + b·dᵧ = 0.'), hint: T2('Walk along the same direction as the line itself.', 'd must be parallel to the line.'), check: P => Math.abs(P.a * P.dx + P.b * P.dy) < 1e-9 }] };
MORE.hooks.footdir = 'A torch beam shines in a set direction. Where does it land on the wall?';
BINDINGS.push({ scene: 'footdir', ids: ['dirX1', 'dirY1', 'dirDx', 'dirDy', 'dirA', 'dirB', 'dirC'], get: v => ({ px: v[0], py: v[1], dx: v[2], dy: v[3], a: v[4], b: v[5], c: v[6] }), set: P => ({ dirX1: P.px, dirY1: P.py, dirDx: P.dx, dirDy: P.dy }) });

// 9. Angle a line makes with the axes
mk('axesangle', 3, 'Angles a line makes with the axes', 'Class 9–12', [['m', 'slope m', 2]],
  ['A line leans away from both axes. The two angles always add up to 90°.', 'α = tan⁻¹|m| (with the x-axis),  β = 90° − α (with the y-axis);  cos α = 1/√(1+m²),  cos β = |m|/√(1+m²)'], {
  fit: P => [[-4, -3], [4, 3], [1, Math.abs(P.m)]],
  valid: P => fin(P.m),
  draw(g, t, C, lv, P) {
    const m = Math.abs(P.m), al = Math.atan(m), be = Math.PI / 2 - al, n = Math.sqrt(1 + m * m), s = P.m >= 0 ? 1 : -1, e = ease(seg(t, .12, .5)), e2 = ease(seg(t, .5, .85));
    g.LL(P.m, -1, 0, C.ink, 3.5, null, ease(seg(t, .05, .2)));
    const ctx = g.ctx;
    if (e > 0) { const a0 = s > 0 ? 0 : Math.PI, a1 = s > 0 ? al * e : Math.PI - al * e; E.kit.arc(g, 0, 0, 52, a0, a1, C.c, .25); }
    if (e2 > 0) { const a0 = s > 0 ? Math.PI / 2 : Math.PI / 2, a1 = s > 0 ? Math.PI / 2 - be * e2 : Math.PI / 2 + be * e2; E.kit.arc(g, 0, 0, 74, a0, a1, C.g, .22); }
    if (e >= 1) g.T('α = ' + fmt(al / D2R, 2) + '°', 0, 0, C.c, { dx: s * 94, dy: -12 * s, size: 14 });
    if (e2 >= 1) g.T('β = ' + fmt(be / D2R, 2) + '°', 0, 0, C.g, { dx: s * 26, dy: -108, size: 14 });
    g.D(0, 0, C.ink, 6);
    const k = t < .12 ? 0 : t < .5 ? 1 : t < .85 ? 2 : 3;
    return pick(lv, ['A line through the origin with slope ' + fmt(P.m) + '.', 'Angle with the x-axis: α = ' + fmt(al / D2R, 2) + '°.', 'Angle with the y-axis: β = ' + fmt(be / D2R, 2) + '°.', 'α + β = 90°. Direction cosines: cos α = ' + fmt(1 / n) + ', cos β = ' + fmt(m / n) + '.'],
      ['m = ' + fmt(P.m) + ', α = tan⁻¹|m| = ' + fmt(al / D2R, 4) + '°.', 'β = 90° − α = ' + fmt(be / D2R, 4) + '°.', 'cos α = ' + fmt(1 / n) + ', cos β = ' + fmt(m / n) + '.', 'cos²α + cos²β = ' + fmt(1 / (n * n) + m * m / (n * n)) + '.'])[k];
  },
  out: (P, lv) => { const m = Math.abs(P.m), n = Math.sqrt(1 + m * m), al = Math.atan(m) / D2R; return 'α = ' + fmt(al, 4) + '°, β = ' + fmt(90 - al, 4) + '°;  cos α = ' + fmt(1 / n) + ', cos β = ' + fmt(m / n); } });
MORE.extras.axesangle = { chip: 'Angles with the axes', marks: [0, .12, .5, .85], ranges: { m: [-6, 6, .5] },
  handles: P => [{ k: 'M', x: 1, y: P.m, label: 'm' }], drag: (P, k, x, y) => (Math.abs(x - 1) > 0 ? Object.assign({}, P, { m: y / (x || 1) }) : Object.assign({}, P, { m: y })),
  challenges: [{ id: 'aa-45', text: T2('Make the line lean equally toward both axes (α = β = 45°).'), hint: T2('Go 1 across for every 1 up.', '|m| = 1.'), check: P => Math.abs(Math.abs(P.m) - 1) < 1e-9 },
    { id: 'aa-flat', text: T2('Make α as small as you can: a line that lies flat along the x-axis.'), hint: T2('Slope 0 is a flat line.', 'm = 0 gives α = 0°.'), check: P => Math.abs(P.m) < 1e-9 }] };
MORE.hooks.axesangle = 'A ladder leans on a wall: how far is it tilted from the ground and from the wall?';
BINDINGS.push({ scene: 'axesangle', ids: ['angleAxesM'], get: v => ({ m: v[0] }), set: P => ({ angleAxesM: P.m }) });

// ======================= Tab 4 =======================
// 10. Points at a fixed distance from a line (also constant area)
mk('constdist', 4, 'Points at a fixed distance from a line', 'Class 11–12', [['a', 'a', 3], ['b', 'b', 4], ['c', 'c', 0], ['k', 'k (distance)', 2], ['px', 'P: x', 3], ['py', 'P: y', 2]],
  ['All the points that are k steps from a line form two lines, one on each side.', '|ax + by + c| / √(a² + b²) = k  ⇒  ax + by + c = ± k√(a² + b²)'], {
  selects: { type: ['Condition', ['distance = k', 'distance < k', 'distance > k']] },
  fit: P => { const n = Math.hypot(P.a, P.b), kk = Math.abs(P.k); const pts = [[0, 0], [3, 3], [-3, -3]]; const q = lineEnds(P.a, P.b, P.c, 0, 0, 3)[0]; pts.push(q, lineEnds(P.a, P.b, P.c, 0, 0, 3)[1]); const f = foot({ px: 0, py: 0, a: P.a, b: P.b, c: P.c }); pts.push([f[0] + P.a / n * (kk + 1), f[1] + P.b / n * (kk + 1)], [f[0] - P.a / n * (kk + 1), f[1] - P.b / n * (kk + 1)]); if (Number.isFinite(P.px)) pts.push([P.px, P.py]); return pts; },
  valid: P => fin(P.a, P.b, P.c, P.k) && Math.hypot(P.a, P.b) > EPS && P.k >= 0,
  draw(g, t, C, lv, P) {
    const { a, b, c, k, type } = P, n = Math.hypot(a, b), e = ease(seg(t, .15, .6)), ck = k * n * e;
    if (e >= 1) { if (type === 1) E.kit.band(g, a, b, -c - k * n, -c + k * n, C.g, .18); else if (type === 2) { E.kit.half(g, a, b, c - k * n, 1, C.a, .14); E.kit.half(g, a, b, c + k * n, -1, C.a, .14); } }
    g.LL(a, b, c, C.ink, 3.5);
    g.LL(a, b, c - ck, C.c, 3.5, type === 0 ? null : [8, 6]); g.LL(a, b, c + ck, C.g, 3.5, type === 0 ? null : [8, 6]);
    if (Number.isFinite(P.px) && t > .6) { const d = Math.abs(a * P.px + b * P.py + c) / n, ok = type === 0 ? Math.abs(d - k) < 1e-9 : type === 1 ? d < k : d > k; g.D(P.px, P.py, ok ? C.g : C.a, 8); g.T('P' + ptStr(P.px, P.py) + ': d = ' + fmt(d), P.px, P.py, ok ? C.g : C.a, { dy: -20, size: 13 }); }
    const kk = t < .15 ? 0 : t < .6 ? 1 : 2, tcond = ['= k', '< k', '> k'][type];
    return pick(lv, ['A line. How far is each point from it?', 'Slide the line ' + fmt(k) + ' steps to each side.', type === 0 ? 'Every point on these two lines is exactly ' + fmt(k) + ' from the line.' : type === 1 ? 'Points closer than ' + fmt(k) + ' lie between the two lines.' : 'Points farther than ' + fmt(k) + ' lie outside the two lines.'],
      ['Line ' + eqStr(a, b, c) + ', √(a²+b²) = ' + fmt(n) + '.', 'k√(a²+b²) = ' + fmt(k * n) + '.', 'd ' + tcond + ': ax + by + c ' + (type === 0 ? '= ±' : type === 1 ? 'between ±' : 'beyond ±') + fmt(k * n) + '.'])[kk];
  },
  out: (P, lv) => { const n = Math.hypot(P.a, P.b), ks = P.k * n; let s = 'ax + by + c = ±' + fmt(ks) + ' → ' + eqStr(P.a, P.b, P.c - ks) + '  and  ' + eqStr(P.a, P.b, P.c + ks); if (Number.isFinite(P.px)) { const d = Math.abs(P.a * P.px + P.b * P.py + P.c) / n; s += ';  P' + ptStr(P.px, P.py) + ' is ' + fmt(d) + ' away (' + (P.type === 0 ? (Math.abs(d - P.k) < 1e-9 ? 'on' : 'not on') + ' the locus' : P.type === 1 ? (d < P.k ? 'closer than k' : 'not closer than k') : (d > P.k ? 'farther than k' : 'not farther than k')) + ')'; } if (Number.isFinite(P.area)) s += ';  triangle area = ½·|AB|·d = ' + fmt(P.area); return s; } });
MORE.extras.constdist = { chip: 'Distance k from a line', marks: [0, .15, .6], ranges: { a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1], k: [0, 8, .5], px: R8, py: R8 },
  handles: P => (Number.isFinite(P.px) ? [{ k: 'P', x: P.px, y: P.py, label: 'P' }] : []), drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
  challenges: [{ id: 'cd-on', text: T2('Place P exactly on one of the two lines (distance = k).', 'Place P so that its distance from the line equals k.'), hint: T2('Walk from the middle line straight across by k units.', 'd = |ax₁ + by₁ + c| / √(a² + b²) = k.'), check: P => Number.isFinite(P.px) && Math.abs(Math.abs(P.a * P.px + P.b * P.py + P.c) / Math.hypot(P.a, P.b) - P.k) < 1e-9 },
    { id: 'cd-inside', text: T2('Put P closer to the line than k.', 'Make d < k.'), hint: T2('Stay between the two outer lines.', 'd must be smaller than k.'), check: P => Number.isFinite(P.px) && Math.abs(P.a * P.px + P.b * P.py + P.c) / Math.hypot(P.a, P.b) < P.k - 1e-9 }] };
MORE.hooks.constdist = 'A road with a safety zone: which spots are exactly 2 metres from the road?';
BINDINGS.push(
  { scene: 'constdist', ids: ['perpDistA', 'perpDistB', 'perpDistC', 'perpDistK', 'perpDistX', 'perpDistY'], get: (v, rr) => ({ a: v[0], b: v[1], c: v[2], k: v[3], px: v[4], py: v[5], type: Math.max(0, ['equal', 'less', 'greater'].indexOf(rr('perpDistType'))) }), set: P => ({ perpDistX: P.px, perpDistY: P.py }) },
  { scene: 'constdist', ids: ['constDistA', 'constDistB', 'constDistC', 'constDistK'], get: v => ({ a: v[0], b: v[1], c: v[2], k: v[3], type: 0 }) },
  { scene: 'constdist', ids: ['areaConstAx', 'areaConstAy', 'areaConstBx', 'areaConstBy', 'areaConstK', 'areaConstX', 'areaConstY'], get: v => { const L = Math.hypot(v[2] - v[0], v[3] - v[1]); if (L < EPS) return null; return { a: v[1] - v[3], b: v[2] - v[0], c: v[0] * v[3] - v[2] * v[1], k: Math.abs(2 * v[4] / L), px: v[5], py: v[6], type: 0, area: Math.abs(v[4]) }; }, set: P => ({ areaConstX: P.px, areaConstY: P.py }) });

// 11. Projection of a segment on a line
const pj = P => { const l = { px: P.ax, py: P.ay, a: P.a, b: P.b, c: P.c }, A1 = foot(l), B1 = foot({ px: P.bx, py: P.by, a: P.a, b: P.b, c: P.c }); return { A1, B1, len: Math.hypot(B1[0] - A1[0], B1[1] - A1[1]) }; };
mk('proj2d', 4, 'Projection of a segment on a line', 'Class 11–12', [['ax', 'A: x', 1], ['ay', 'A: y', 1], ['bx', 'B: x', 5], ['by', 'B: y', 4], ['a', 'a', 0], ['b', 'b', 1], ['c', 'c', 0]],
  ['The projection is the shadow of AB when the sun shines straight down onto the line.', 'Projection length = |AB · û|, where û is the unit vector along the line.'], {
  fit: P => { const q = pj(P); return [[P.ax, P.ay], [P.bx, P.by], q.A1, q.B1]; },
  valid: P => fin(P.ax, P.ay, P.bx, P.by, P.a, P.b, P.c) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const q = pj(P), e = ease(seg(t, .3, .7)), e2 = ease(seg(t, .7, .95));
    g.LL(P.a, P.b, P.c, C.ink, 3.5); g.L(P.ax, P.ay, P.bx, P.by, C.c, 4);
    g.L(P.ax, P.ay, lerp(P.ax, q.A1[0], e), lerp(P.ay, q.A1[1], e), C.faint, 2, [6, 5]); g.L(P.bx, P.by, lerp(P.bx, q.B1[0], e), lerp(P.by, q.B1[1], e), C.faint, 2, [6, 5]);
    if (e2 > 0) g.L(q.A1[0], q.A1[1], lerp(q.A1[0], q.B1[0], e2), lerp(q.A1[1], q.B1[1], e2), C.a, 6);
    g.D(P.ax, P.ay, C.c, 7); g.D(P.bx, P.by, C.c, 7); g.T('A', P.ax, P.ay, C.c, { dy: -18, size: 14 }); g.T('B', P.bx, P.by, C.c, { dy: -18, size: 14 });
    if (e >= 1) { g.D(q.A1[0], q.A1[1], C.g, 6); g.D(q.B1[0], q.B1[1], C.g, 6); }
    if (e2 >= 1) g.T('length ' + fmt(q.len), (q.A1[0] + q.B1[0]) / 2, (q.A1[1] + q.B1[1]) / 2, C.a, { dy: 22, size: 14 });
    const k = t < .3 ? 0 : t < .7 ? 1 : 2;
    return pick(lv, ['A segment AB and a line.', 'Drop a straight shadow from A and from B onto the line.', 'The shadow of AB on the line is ' + fmt(q.len) + ' long.'],
      ['AB = (' + fmt(P.bx - P.ax) + ', ' + fmt(P.by - P.ay) + '), line ' + eqStr(P.a, P.b, P.c) + '.', 'Feet A′ = ' + ptStr(q.A1[0], q.A1[1]) + ', B′ = ' + ptStr(q.B1[0], q.B1[1]) + '.', 'Projection = |A′B′| = |AB · û| = ' + fmt(q.len) + '.'])[k];
  },
  out: (P, lv) => 'Projection length = ' + fmt(pj(P).len) + '   (AB itself is ' + fmt(Math.hypot(P.bx - P.ax, P.by - P.ay)) + ' long)' });
MORE.extras.proj2d = { chip: 'Projection on a line', marks: [0, .3, .7], ranges: { ax: R8, ay: R8, bx: R8, by: R8, a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1] },
  handles: (P) => [{ k: '1', x: P.ax, y: P.ay, label: 'A' }, { k: '2', x: P.bx, y: P.by, label: 'B' }], drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { ax: x, ay: y }) : Object.assign({}, P, { bx: x, by: y })),
  challenges: [{ id: 'pj-5', text: T2('Make the shadow exactly 5 long.', 'Make the projection length 5.'), hint: T2('For a flat line, the shadow is the across distance between A and B. Try 5 across.', 'For the line y = 0 the projection is |x₂ − x₁|.'), check: P => Math.abs(pj(P).len - 5) < 1e-9 },
    { id: 'pj-0', text: T2('Make the shadow disappear (length 0). AB must meet the line at a right angle.', 'Make AB perpendicular to the line.'), hint: T2('Put A straight above B.', 'Projection 0 means AB ⟂ line.'), check: P => Math.abs(pj(P).len) < 1e-9 && Math.hypot(P.bx - P.ax, P.by - P.ay) > EPS }] };
MORE.hooks.proj2d = 'A flagpole casts a shadow on the ground. How long is the shadow of a slanted stick?';
BINDINGS.push({ scene: 'proj2d', ids: ['projAx', 'projAy', 'projBx', 'projBy', 'projA', 'projB', 'projC'], get: v => ({ ax: v[0], ay: v[1], bx: v[2], by: v[3], a: v[4], b: v[5], c: v[6] }), set: P => ({ projAx: P.ax, projAy: P.ay, projBx: P.bx, projBy: P.by }) });

// 12. Which side of a line?
mk('sides', 4, 'Which side of the line?', 'Class 9–12', [['a', 'a', 2], ['b', 'b', 3], ['c', 'c', -6], ['x1', 'P₁: x', 4], ['y1', 'P₁: y', 1], ['x2', 'P₂: x', 1], ['y2', 'P₂: y', 0]],
  ['A line splits the plane in two. Put a point in ax + by + c: the sign tells the side.', 'S = ax₁ + by₁ + c.  S > 0: one side, S < 0: the other, S = 0: on the line.  Same side ⇔ S₁·S₂ > 0.'], {
  selects: { mode: ['Question', ['one point and the line', 'two points and the line', 'origin and a point']] },
  fit: P => [[P.x1, P.y1], [P.x2, P.y2], [0, 0], [3, 3], [-3, -3]],
  valid: P => fin(P.a, P.b, P.c, P.x1, P.y1, P.x2, P.y2) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { a, b, c, mode } = P, e = ease(seg(t, .1, .4)), S = (x, y) => a * x + b * y + c, ctx = g.ctx;
    E.kit.half(g, a, b, c, 1, C.a, .13 * e); E.kit.half(g, a, b, c, -1, C.c, .13 * e);
    g.LL(a, b, c, C.ink, 3.5);
    const bd = g.b, cx = (bd.x0 + bd.x1) / 2, cy = (bd.y0 + bd.y1) / 2, nn = Math.hypot(a, b), sp = Math.max(bd.x1 - bd.x0, bd.y1 - bd.y0) * .3;
    g.T('+', cx + a / nn * sp * 1.1, cy + b / nn * sp * 1.1, C.a, { size: 26 }); g.T('−', cx - a / nn * sp * 1.1, cy - b / nn * sp * 1.1, C.c, { size: 26 });
    const pts = mode === 0 ? [[P.x1, P.y1, 'P']] : mode === 1 ? [[P.x1, P.y1, 'P₁'], [P.x2, P.y2, 'P₂']] : [[0, 0, 'O'], [P.x2, P.y2, 'P']];
    const e2 = ease(seg(t, .4, .75)); if (mode > 0 && e2 > 0) g.L(pts[0][0], pts[0][1], lerp(pts[0][0], pts[1][0], e2), lerp(pts[0][1], pts[1][1], e2), C.faint, 2.5, [6, 5]);
    pts.forEach(([x, y, nm], i) => { if (t > .35 + i * .15) { const s = S(x, y); g.D(x, y, Math.abs(s) < 1e-9 ? C.ink : s > 0 ? C.a : C.c, 8); g.T(nm + ' (S = ' + fmt(s) + ')', x, y, Math.abs(s) < 1e-9 ? C.ink : s > 0 ? C.a : C.c, { dy: -20, size: 13 }); } });
    const s1 = S(pts[0][0], pts[0][1]), s2 = pts[1] ? S(pts[1][0], pts[1][1]) : 0, k = t < .1 ? 0 : t < .4 ? 1 : 2, same = s1 * s2 > 1e-12;
    const fin_ = mode === 0 ? 'The point is ' + sgnTxt(s1) + '.' : (Math.abs(s1 * s2) < 1e-12 ? 'At least one point is ON the line.' : same ? 'Both points are on the SAME side.' : 'The points are on OPPOSITE sides.');
    return pick(lv, ['The line cuts the plane in two halves: + (orange) and − (blue).', 'Put each point into ax + by + c and look at the sign.', fin_], ['Line ' + eqStr(a, b, c) + '.', mode === 0 ? 'S = ' + fmt(s1) + '.' : 'S₁ = ' + fmt(s1) + ', S₂ = ' + fmt(s2) + ', S₁·S₂ = ' + fmt(s1 * s2) + '.', fin_])[k];
  },
  out: (P, lv) => { const S = (x, y) => P.a * x + P.b * y + P.c, p0 = P.mode === 2 ? [0, 0] : [P.x1, P.y1], p1 = P.mode === 0 ? null : [P.x2, P.y2]; const s1 = S(p0[0], p0[1]); if (!p1) return 'S = ' + fmt(s1) + '  → point is ' + sgnTxt(s1); const s2 = S(p1[0], p1[1]); if (P.mode === 2) return 'S₀ = c = ' + fmt(s1) + ', S = ' + fmt(s2) + '  → ' + (Math.abs(s1 * s2) < 1e-12 ? 'one point is on the line' : s1 * s2 > 0 ? 'point and origin are on the SAME side' : 'point and origin are on OPPOSITE sides'); return 'S₁ = ' + fmt(s1) + ', S₂ = ' + fmt(s2) + ', S₁·S₂ = ' + fmt(s1 * s2) + '  → ' + (Math.abs(s1 * s2) < 1e-12 ? 'at least one point is on the line' : s1 * s2 > 0 ? 'SAME side' : 'OPPOSITE sides'); } });
MORE.extras.sides = { chip: 'Sides of a line', marks: [0, .1, .4], ranges: { a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1], x1: R8, y1: R8, x2: R8, y2: R8 },
  handles: P => (P.mode === 0 ? [{ k: '1', x: P.x1, y: P.y1, label: 'P' }] : P.mode === 1 ? [{ k: '1', x: P.x1, y: P.y1, label: 'P₁' }, { k: '2', x: P.x2, y: P.y2, label: 'P₂' }] : [{ k: '2', x: P.x2, y: P.y2, label: 'P' }]),
  drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { x1: x, y1: y }) : Object.assign({}, P, { x2: x, y2: y })),
  challenges: [{ id: 'sd-same', text: T2('Put the two points on the same side of the line.', 'Make S₁·S₂ > 0.'), hint: T2('Move one point across the line so both are in the same colour.', 'S₁ and S₂ must have the same sign.'), check: P => { const S = (x, y) => P.a * x + P.b * y + P.c, p0 = P.mode === 2 ? [0, 0] : [P.x1, P.y1]; return S(p0[0], p0[1]) * S(P.x2, P.y2) > 1e-12; } },
    { id: 'sd-on', text: T2('Put a point exactly on the line (S = 0).'), hint: T2('Slide the point onto the dark line.', 'ax + by + c = 0.'), check: P => Math.abs(P.a * (P.mode === 2 ? P.x2 : P.x1) + P.b * (P.mode === 2 ? P.y2 : P.y1) + P.c) < 1e-9 }] };
MORE.hooks.sides = 'A fence splits a field in two. Are the cow and the farmer on the same side?';
BINDINGS.push(
  { scene: 'sides', ids: ['relA', 'relB', 'relC', 'relX', 'relY'], get: v => ({ a: v[0], b: v[1], c: v[2], x1: v[3], y1: v[4], x2: 0, y2: 0, mode: 0 }), set: P => ({ relX: P.x1, relY: P.y1 }) },
  { scene: 'sides', ids: ['sideA', 'sideB', 'sideC', 'sideX1', 'sideY1', 'sideX2', 'sideY2'], get: v => ({ a: v[0], b: v[1], c: v[2], x1: v[3], y1: v[4], x2: v[5], y2: v[6], mode: 1 }), set: P => ({ sideX1: P.x1, sideY1: P.y1, sideX2: P.x2, sideY2: P.y2 }) },
  { scene: 'sides', ids: ['originSideA', 'originSideB', 'originSideC', 'originSideX', 'originSideY'], get: v => ({ a: v[0], b: v[1], c: v[2], x1: 0, y1: 0, x2: v[3], y2: v[4], mode: 2 }), set: P => ({ originSideX: P.x2, originSideY: P.y2 }) });

// 13. Shortest distance between a line and a curve
const lcm = P => {
  const { a, b, c, curve, r } = P, n = Math.hypot(a, b), m = Math.abs(b) < EPS ? NaN : -a / b; let pt = null, d = NaN;
  if (curve === 0) { if (Number.isFinite(m)) { const x = m / 2; pt = [x, x * x]; } }
  else if (curve === 1) { d = Math.max(0, Math.abs(c) / n - r); const f = foot({ px: 0, py: 0, a, b, c }); const dd = Math.hypot(f[0], f[1]); pt = dd < EPS ? null : [f[0] / dd * r, f[1] / dd * r]; if (Math.abs(c) / n <= r) { pt = null; } return { pt, d, m }; }
  else if (Number.isFinite(m) && m > 0) { const x = Math.log(m); pt = [x, m]; }
  if (pt) d = Math.abs(a * pt[0] + b * pt[1] + c) / n;
  return { pt, d, m };
};
mk('linecurve', 4, 'Shortest distance from a line to a curve', 'Class 11–12', [['a', 'a', 1], ['b', 'b', -1], ['c', 'c', 0], ['r', 'r (circle)', 1]],
  ['The closest spot on the curve is where the curve runs in the same direction as the line.', 'Find the point where the curve’s slope equals the line’s slope, then use the point-to-line distance.'], {
  selects: { curve: ['Curve', ['parabola  y = x²', 'circle  x² + y² = r²', 'exponential  y = eˣ']] },
  fit: P => [[-4, -3], [4, 5], ...(P.curve === 1 ? [[-P.r - 1, -P.r - 1], [P.r + 1, P.r + 1]] : [])],
  valid: P => fin(P.a, P.b, P.c, P.r) && Math.hypot(P.a, P.b) > EPS && P.r > 0,
  draw(g, t, C, lv, P) {
    const q = lcm(P), ctx = g.ctx, bd = g.b, e = ease(seg(t, .12, .5)), e2 = ease(seg(t, .5, .9));
    g.LL(P.a, P.b, P.c, C.ink, 3.5);
    if (P.curve === 0) E.kit.implicit(g, (x, y) => y - x * x, C.c, 4);
    else if (P.curve === 1) { ctx.save(); ctx.strokeStyle = C.c; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(g.X(0), g.Y(0), P.r * g.sc, 0, 7); ctx.stroke(); ctx.restore(); }
    else E.kit.implicit(g, (x, y) => y - Math.exp(Math.min(x, 12)), C.c, 4);
    if (q.pt && Number.isFinite(q.m)) { const T = q.pt; g.LL(-q.m, 1, -(T[1] - q.m * T[0]), C.faint, 2, [6, 6], .9 * e); g.D(T[0], T[1], C.a, 8 * e); }
    if (q.pt && e2 > 0) { const F = foot({ px: q.pt[0], py: q.pt[1], a: P.a, b: P.b, c: P.c }); g.L(q.pt[0], q.pt[1], lerp(q.pt[0], F[0], e2), lerp(q.pt[1], F[1], e2), C.a, 4); if (e2 >= 1) { g.D(F[0], F[1], C.g, 6); g.T('d = ' + fmt(q.d), (q.pt[0] + F[0]) / 2, (q.pt[1] + F[1]) / 2, C.a, { dx: 34, dy: -8, size: 14 }); } }
    const k = t < .12 ? 0 : t < .5 ? 1 : 2, nm = ['parabola', 'circle', 'exponential curve'][P.curve];
    const res = q.pt ? 'The closest point on the ' + nm + ' is ' + ptStr(q.pt[0], q.pt[1]) + ', at distance ' + fmt(q.d) + '.' : (P.curve === 1 ? (q.d > 0 ? 'The nearest point of the circle is ' + fmt(q.d) + ' from the line.' : 'The line cuts the circle: the distance is 0.') : P.curve === 2 ? 'This line never runs parallel to the curve (needs a positive slope), so there is no closest point.' : 'No closest point (vertical line).');
    return pick(lv, ['A line and a ' + nm + '.', 'Slide a parallel line toward the curve until it just touches: that touch point is the closest.', res], ['Line slope m = ' + (Number.isFinite(q.m) ? fmt(q.m) : 'undefined') + '.', P.curve === 0 ? 'Curve slope 2x = m → x = ' + (Number.isFinite(q.m) ? fmt(q.m / 2) : '—') + '.' : P.curve === 1 ? 'Distance from the centre to the line, minus r.' : 'Curve slope eˣ = m → x = ln m.', res])[k];
  },
  out: (P, lv) => { const q = lcm(P); return Number.isFinite(q.d) ? 'Minimal distance = ' + fmt(q.d) + (q.pt ? ' at ' + ptStr(q.pt[0], q.pt[1]) : '') : 'No closest point for these numbers'; } });
MORE.extras.linecurve = { chip: 'Line to a curve', marks: [0, .12, .5], ranges: { a: [-6, 6, 1], b: [-6, 6, 1], c: [-12, 12, 1], r: [.5, 6, .5] },
  challenges: [{ id: 'lc-touch', text: T2('Make the line just touch the circle (choose the circle option first).', 'Choose the circle and make the line tangent: distance from the centre = r.'), hint: T2('Slide the line (change c) until its distance from the centre equals r.', '|c|/√(a²+b²) = r.'), check: P => P.curve === 1 && Math.abs(Math.abs(P.c) / Math.hypot(P.a, P.b) - P.r) < 1e-9 },
    { id: 'lc-slope', text: T2('Make the line parallel to the tangent at x = 1 on the parabola (slope 2).', 'Choose the parabola and a line with slope 2.'), hint: T2('Slope = −a/b. Try a = 2, b = −1.', 'm = −a/b = 2.'), check: P => P.curve === 0 && Math.abs(P.b) > EPS && Math.abs(-P.a / P.b - 2) < 1e-9 }] };
MORE.hooks.linecurve = 'How close does a straight road come to a curved lake shore?';
BINDINGS.push({ scene: 'linecurve', ids: ['lcA', 'lcB', 'lcC'], get: (v, rr, tx) => ({ a: v[0], b: v[1], c: v[2], r: parseFloat(tx('curveParam')) > 0 ? parseFloat(tx('curveParam')) : 1, curve: Math.max(0, ['parabola', 'circle', 'exponential'].indexOf(rr('curveType'))) }) });

// 14. Fourth vertex of a rectangle or square
mk('rect4', 4, 'Fourth vertex of a rectangle', 'Class 9–12', [['ax', 'A: x', 1], ['ay', 'A: y', 1], ['bx', 'B: x', 5], ['by', 'B: y', 1], ['cx', 'C: x', 5], ['cy', 'C: y', 4]],
  ['The diagonals of a rectangle cut each other in half, so the missing corner is found from the middle.', 'M = midpoint of AC = midpoint of BD, so D = 2M − B = A + C − B'], {
  selects: { shape: ['Shape', ['rectangle', 'square']] },
  fit: P => [[P.ax, P.ay], [P.bx, P.by], [P.cx, P.cy], [P.ax + P.cx - P.bx, P.ay + P.cy - P.by]],
  valid: P => fin(P.ax, P.ay, P.bx, P.by, P.cx, P.cy),
  draw(g, t, C, lv, P) {
    const A = [P.ax, P.ay], B = [P.bx, P.by], Cc = [P.cx, P.cy], D = [P.ax + P.cx - P.bx, P.ay + P.cy - P.by], M = [(P.ax + P.cx) / 2, (P.ay + P.cy) / 2];
    const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]), AB = dist(A, B), BC = dist(B, Cc), CD = dist(Cc, D), DA = dist(D, A), AC = dist(A, Cc), BD = dist(B, D);
    const e1 = ease(seg(t, .08, .3)), e2 = ease(seg(t, .3, .55)), e3 = ease(seg(t, .55, .85));
    g.poly([A, B, Cc, D], C.a, .1 * e3);
    g.L(A[0], A[1], lerp(A[0], B[0], e1), lerp(A[1], B[1], e1), C.c, 3.5); g.L(B[0], B[1], lerp(B[0], Cc[0], e1), lerp(B[1], Cc[1], e1), C.c, 3.5);
    g.L(A[0], A[1], lerp(A[0], Cc[0], e2), lerp(A[1], Cc[1], e2), C.g, 3, [6, 4]);
    if (e2 >= 1) g.D(M[0], M[1], C.b, 7);
    if (e3 > 0) { g.L(Cc[0], Cc[1], lerp(Cc[0], D[0], e3), lerp(Cc[1], D[1], e3), C.c, 3.5); g.L(D[0], D[1], lerp(D[0], A[0], e3), lerp(D[1], A[1], e3), C.c, 3.5); g.L(B[0], B[1], lerp(B[0], D[0], e3), lerp(B[1], D[1], e3), C.a, 3, [6, 4]); }
    [['A', A], ['B', B], ['C', Cc]].forEach(([n, p]) => { g.D(p[0], p[1], C.ink, 6); g.T(n, p[0], p[1], C.ink, { dx: -12, dy: -14, size: 14 }); });
    if (e3 >= 1) { g.D(D[0], D[1], C.a, 8); g.T('D' + ptStr(D[0], D[1]), D[0], D[1], C.a, { dy: -20, size: 14 }); }
    if (e2 >= 1) g.T('M', M[0], M[1], C.b, { dx: 12, dy: 16, size: 13 });
    const k = t < .08 ? 0 : t < .3 ? 1 : t < .55 ? 2 : 3, rect = Math.abs(AC - BD) < 1e-9 && Math.abs(AB - CD) < 1e-9 && Math.abs(BC - DA) < 1e-9, sq = rect && Math.abs(AB - BC) < 1e-9;
    const fin_ = P.shape === 1 ? (sq ? 'It is a valid square.' : 'It is NOT a square (the sides are not all equal).') : (rect ? 'Opposite sides and both diagonals match: a rectangle.' : 'The diagonals are not equal, so it is a parallelogram but not a rectangle.');
    return pick(lv, ['Three corners: A, B and C.', 'Join A to B to C.', 'Draw the diagonal AC. Its middle M is also the middle of BD.', 'D = 2M − B = ' + ptStr(D[0], D[1]) + '. ' + fin_], ['A' + ptStr(A[0], A[1]) + ', B' + ptStr(B[0], B[1]) + ', C' + ptStr(Cc[0], Cc[1]) + '.', 'AB = ' + fmt(AB) + ', BC = ' + fmt(BC) + '.', 'M = ' + ptStr(M[0], M[1]) + ', AC = ' + fmt(AC) + '.', 'D = 2M − B = ' + ptStr(D[0], D[1]) + '; CD = ' + fmt(CD) + ', DA = ' + fmt(DA) + ', BD = ' + fmt(BD) + '. ' + fin_])[k];
  },
  out: (P, lv) => { const D = [P.ax + P.cx - P.bx, P.ay + P.cy - P.by], dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]), A = [P.ax, P.ay], B = [P.bx, P.by], Cc = [P.cx, P.cy]; return 'D = ' + ptStr(D[0], D[1]) + ';  sides AB = ' + fmt(dist(A, B)) + ', BC = ' + fmt(dist(B, Cc)) + ', CD = ' + fmt(dist(Cc, D)) + ', DA = ' + fmt(dist(D, A)); } });
MORE.extras.rect4 = { chip: 'Fourth vertex', marks: [0, .08, .3, .55], ranges: rg(['ax', 'ay', 'bx', 'by', 'cx', 'cy'], R8),
  handles: P => [{ k: '1', x: P.ax, y: P.ay, label: 'A' }, { k: '2', x: P.bx, y: P.by, label: 'B' }, { k: '3', x: P.cx, y: P.cy, label: 'C' }], drag: (P, k, x, y) => Object.assign({}, P, { ['a' + 'bc'[+k - 1] + 'x']: x, ['a' + 'bc'[+k - 1] + 'y']: y }),
  challenges: [{ id: 'rc-sq', text: T2('Make ABCD a perfect square.'), hint: T2('Make AB and BC the same length and meet at a right angle.', 'AB ⟂ BC and |AB| = |BC|.'), check: P => { const ab = [P.bx - P.ax, P.by - P.ay], bc = [P.cx - P.bx, P.cy - P.by]; return Math.hypot(...ab) > EPS && Math.abs(ab[0] * bc[0] + ab[1] * bc[1]) < 1e-9 && Math.abs(Math.hypot(...ab) - Math.hypot(...bc)) < 1e-9; } },
    { id: 'rc-rect', text: T2('Make ABCD a long thin rectangle: AB and BC must differ by at least 3.'), hint: T2('Keep the corner at B a right angle, but stretch one side and shrink the other.', 'AB ⟂ BC with ||AB| − |BC|| ≥ 3.'), check: P => { const ab = [P.bx - P.ax, P.by - P.ay], bc = [P.cx - P.bx, P.cy - P.by]; return Math.hypot(...ab) > EPS && Math.hypot(...bc) > EPS && Math.abs(ab[0] * bc[0] + ab[1] * bc[1]) < 1e-9 && Math.abs(Math.hypot(...ab) - Math.hypot(...bc)) >= 3 - 1e-9; } }] };
// handle keys '1','2','3' map to A, B, C: repair the generic mapper above
MORE.extras.rect4.drag = (P, k, x, y) => (k === '1' ? Object.assign({}, P, { ax: x, ay: y }) : k === '2' ? Object.assign({}, P, { bx: x, by: y }) : Object.assign({}, P, { cx: x, cy: y }));
MORE.hooks.rect4 = 'Three corners of a garden are marked. Where do you put the fourth post?';
BINDINGS.push({ scene: 'rect4', ids: ['rectAx', 'rectAy', 'rectBx', 'rectBy', 'rectCx', 'rectCy'], get: (v, rr) => ({ ax: v[0], ay: v[1], bx: v[2], by: v[3], cx: v[4], cy: v[5], shape: rr('shapeType') === 'square' ? 1 : 0 }), set: P => ({ rectAx: P.ax, rectAy: P.ay, rectBx: P.bx, rectBy: P.by, rectCx: P.cx, rectCy: P.cy }) });

// ----- cards that reuse an existing animation by converting their numbers -----
// Two lines: parallel (distance) or not (angle). Used by the 2D "skew lines" card and the optimisation card.
const parConv = (a1, b1, c1, a2, b2, c2) => {   // returns ptline params if the lines are parallel, else null
  if (Math.abs(a1 * b2 - a2 * b1) > 1e-9 * (Math.hypot(a1, b1) * Math.hypot(a2, b2))) return null;
  const k = Math.abs(a1) > Math.abs(b1) ? a1 / a2 : b1 / b2, c2n = c2 * k, n2 = a1 * a1 + b1 * b1;
  return { px: -a1 * c1 / n2, py: -b1 * c1 / n2, a: a1, b: b1, c: c2n, c0: c1 };
};
E.parConv = parConv;
BINDINGS.push(
  { scene: 'ptline', ids: ['skewA1', 'skewB1', 'skewC1', 'skewA2', 'skewB2', 'skewC2'], get: v => parConv(v[0], v[1], v[2], v[3], v[4], v[5]) || { a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5] }, sceneOf: p => (p.a1 === undefined ? 'ptline' : 'twolines') },
  { scene: 'ptline', ids: ['interceptA1', 'interceptB1', 'interceptA2', 'interceptB2'], get: v => { if (Math.abs(v[0]) < EPS || Math.abs(v[1]) < EPS || Math.abs(v[2]) < EPS || Math.abs(v[3]) < EPS) return null; const l1 = [v[1], v[0], -v[0] * v[1]], l2 = [v[3], v[2], -v[2] * v[3]]; return parConv(l1[0], l1[1], l1[2], l2[0], l2[1], l2[2]) || { a1: l1[0], b1: l1[1], c1: l1[2], a2: l2[0], b2: l2[1], c2: l2[2] }; }, sceneOf: p => (p.a1 === undefined ? 'ptline' : 'twolines') },
  { scene: 'twolines', ids: ['liA1', 'liB1', 'liC1', 'liA2', 'liB2', 'liC2'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5] }) });
});
