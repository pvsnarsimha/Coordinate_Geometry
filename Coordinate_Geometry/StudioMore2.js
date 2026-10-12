// ========= Animation Studio: extra scenes, part 2 (tabs 5 and 6: locus problems and families of lines) =========
// Loaded before ConceptStudio.js. Same module pattern as StudioMore1.js: scenes, MORE.extras, MORE.hooks, BINDINGS.
(window.__studioParts = window.__studioParts || []).push(function (E, scenes, BINDINGS, MORE) {
'use strict';
const { C, EPS, pick, ease, seg, lerp, fmt, fin, eqStr, slopeEq, niceEq, intersect } = E;
const T2 = (s, i) => [s, i || s];
const R8 = [-8, 8, 1];
const rg = (keys, r) => Object.fromEntries(keys.map(k => [k, r]));
const D2R = Math.PI / 180, TAU = 2 * Math.PI;
const mk = (id, tab, title, tag, params, f, o) => { const sc = Object.assign({ id, tab, title, tag, params, f }, o); scenes.push(sc); return sc; };
const ptS = (x, y) => '(' + fmt(x) + ', ' + fmt(y) + ')';
const sb = v => (Math.abs(v) < 1e-9 ? '' : v > 0 ? ' − ' + fmt(v) : ' + ' + fmt(-v));     // "x − 2" / "y + 3"
const sqr = (s, v) => (Math.abs(v) < 1e-9 ? s + '²' : '(' + s + sb(v) + ')²');             // "(x − 2)²" or "x²"
const hyp = (a, b) => Math.hypot(a, b);
const dotT = (g, x, y, col, label, o) => { g.D(x, y, col, 7); if (label) g.T(label, x, y, col, Object.assign({ dy: -17, size: 14 }, o)); };
// circle outline drawn up to a fraction of the way round (radius in world units)
const circ = (g, cx, cy, r, col, w = 3, frac = 1, dash, alpha = 1) => {
  if (!(r > 0) || frac <= 0) return; const c = g.ctx; c.save(); c.strokeStyle = col; c.lineWidth = w; c.globalAlpha = alpha; c.lineCap = 'round'; c.setLineDash(dash || []);
  c.beginPath(); c.arc(g.X(cx), g.Y(cy), r * g.sc, 0, -TAU * Math.min(1, frac), true); c.stroke(); c.restore();
};
// a label beside the middle of a segment (pushed sideways in pixels so it does not sit on the line)
const segT = (g, x1, y1, x2, y2, text, col, side = 1, off = 13, size = 12) => {
  const sx = g.X(x2) - g.X(x1), sy = g.Y(y2) - g.Y(y1), L = Math.hypot(sx, sy) || 1;
  g.T(text, (x1 + x2) / 2, (y1 + y2) / 2, col, { dx: -sy / L * off * side, dy: sx / L * off * side, size });
};
// keep only the part of the drawing that lies below the world height yw
const below = (g, yw, fn) => { const c = g.ctx; c.save(); c.beginPath(); c.rect(0, g.Y(yw), g.W, g.H); c.clip(); fn(); c.restore(); };

// ---------- a small, safe formula reader for the "custom equation" box (no eval) ----------
const FN = { sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, log: Math.log10, exp: Math.exp };
function lex(s) {
  const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i]; if (/\s/.test(ch)) { i++; continue; } let m; const rest = s.slice(i);
    if ((m = /^(\d+\.?\d*|\.\d+)/.exec(rest))) { out.push({ n: parseFloat(m[1]) }); i += m[1].length; }
    else if ((m = /^[a-z]+/.exec(rest))) { const w = m[0]; i += w.length; if (FN[w] || w === 'pi') out.push({ id: w }); else for (const c1 of w) out.push({ id: c1 }); }
    else if ('+-*/^()'.includes(ch)) { out.push({ op: ch }); i++; }
    else return null;
  }
  return out;
}
function parseSide(toks) {
  let p = 0; const peek = () => toks[p], isP = t => t && (t.n !== undefined || t.id !== undefined || t.op === '(');
  const expr = () => { let l = term(); while (peek() && (peek().op === '+' || peek().op === '-')) { const o = toks[p++].op, a = l, b = term(); l = o === '+' ? (x, y) => a(x, y) + b(x, y) : (x, y) => a(x, y) - b(x, y); } return l; };
  const term = () => { let l = unary(); for (;;) { const t = peek(); if (!t) break; if (t.op === '*' || t.op === '/') { p++; const a = l, b = unary(); l = t.op === '*' ? (x, y) => a(x, y) * b(x, y) : (x, y) => a(x, y) / b(x, y); } else if (isP(t)) { const a = l, b = unary(); l = (x, y) => a(x, y) * b(x, y); } else break; } return l; };
  const unary = () => { const t = peek(); if (t && t.op === '-') { p++; const a = unary(); return (x, y) => -a(x, y); } if (t && t.op === '+') { p++; return unary(); } return power(); };
  const power = () => { const a = primary(); if (peek() && peek().op === '^') { p++; const b = unary(); return (x, y) => Math.pow(a(x, y), b(x, y)); } return a; };
  const primary = () => {
    const t = toks[p++]; if (!t) throw new Error('end');
    if (t.n !== undefined) return () => t.n;
    if (t.op === '(') { const a = expr(); if (!peek() || peek().op !== ')') throw new Error('paren'); p++; return a; }
    if (t.id === 'x') return x => x; if (t.id === 'y') return (x, y) => y; if (t.id === 'pi') return () => Math.PI;
    if (FN[t.id]) { if (!peek() || peek().op !== '(') throw new Error('fn'); const a = primary(), f = FN[t.id]; return (x, y) => f(a(x, y)); }
    throw new Error('id');
  };
  const f = expr(); if (p !== toks.length) throw new Error('extra'); return f;
}
// "x^2 + y^2 - 25 = 0" -> function f(x, y) = left side minus right side, or null
function parseF(src) {
  try {
    const s = String(src).replace(/−/g, '-').replace(/²/g, '^2').replace(/[·×]/g, '*').toLowerCase(), parts = s.split('='); if (parts.length > 2 || !parts[0].trim()) return null;
    const L = lex(parts[0]), R = parts.length === 2 ? lex(parts[1]) : []; if (!L || !R) return null;
    const fl = parseSide(L), fr = R.length ? parseSide(R) : () => 0; return (x, y) => fl(x, y) - fr(x, y);
  } catch (e) { return null; }
}
// f(x, y) of degree at most 2 -> coefficients of x², xy, y², x, y, 1 (null when f is not such a polynomial)
function conicOf(src) {
  const f = parseF(src); if (!f) return null;
  const f00 = f(0, 0), a1 = f(1, 0), a2 = f(-1, 0), b1 = f(0, 1), b2 = f(0, -1), ab = f(1, 1);
  const q = { qa: (a1 + a2) / 2 - f00, qc: (b1 + b2) / 2 - f00, qd: (a1 - a2) / 2, qe: (b1 - b2) / 2, qf: f00 }; q.qb = ab - a1 - b1 + f00;
  if (!fin(q.qa, q.qb, q.qc, q.qd, q.qe, q.qf)) return null;
  const val = (x, y) => q.qa * x * x + q.qb * x * y + q.qc * y * y + q.qd * x + q.qe * y + q.qf;
  for (const [x, y] of [[2, 3], [-1.5, 2.2], [3, -2], [0.5, -4]]) { const w = f(x, y); if (!(Math.abs(w - val(x, y)) < 1e-6 * (1 + Math.abs(w)))) return null; }
  return q;
}
// the same idea for a straight line  a x + b y + c = 0
function lineOf(src) {
  const f = parseF(src); if (!f) return null; const c0 = f(0, 0), a = f(1, 0) - c0, b = f(0, 1) - c0;
  if (!fin(a, b, c0) || hyp(a, b) < 1e-9) return null;
  for (const [x, y] of [[2, 3], [-1.5, 2.2], [3, -2]]) if (!(Math.abs(f(x, y) - (a * x + b * y + c0)) < 1e-6 * (1 + Math.abs(f(x, y))))) return null;
  return { a, b, c: c0 };
}
const polyStr = q => {
  const terms = [[q.qa, 'x²'], [q.qb, 'xy'], [q.qc, 'y²'], [q.qd, 'x'], [q.qe, 'y'], [q.qf, '']].filter(t => Math.abs(t[0]) > 1e-9);
  if (!terms.length) return '0 = 0'; let s = '';
  terms.forEach(([v, k], i) => { const m = Math.abs(v), body = (k && Math.abs(m - 1) < 1e-9) ? k : fmt(m) + k; s += i === 0 ? (v < 0 ? '−' : '') + body : (v < 0 ? ' − ' : ' + ') + body; });
  return s + ' = 0';
};
const conicInfo = q => {   // classify and find the centre
  const { qa, qb, qc, qd, qe, qf } = q, disc = qb * qb - 4 * qa * qc, det = qa * (qc * qf - qe * qe / 4) - (qb / 2) * (qb / 2 * qf - qe * qd / 4) + (qd / 2) * (qb * qe / 4 - qc * qd / 2);
  const lin = Math.abs(qa) < EPS && Math.abs(qb) < EPS && Math.abs(qc) < EPS, sc = Math.max(1, Math.abs(qa), Math.abs(qb), Math.abs(qc), Math.abs(qd), Math.abs(qe), Math.abs(qf)), dg = Math.abs(det) < 1e-9 * sc * sc * sc;
  const dn = 4 * qa * qc - qb * qb, ctr = Math.abs(dn) > 1e-9 ? [(qb * qe - 2 * qc * qd) / dn, (qb * qd - 2 * qa * qe) / dn] : null;
  let kind;
  if (lin) kind = (Math.abs(qd) < EPS && Math.abs(qe) < EPS) ? 'none' : 'line';
  else if (disc < -1e-9) kind = dg ? 'point' : ((qa + qc) * det > 0 ? 'empty' : (Math.abs(qa - qc) < 1e-9 && Math.abs(qb) < 1e-9 ? 'circle' : 'ellipse'));
  else if (Math.abs(disc) <= 1e-9) kind = dg ? 'parallel' : 'parabola';
  else kind = dg ? 'lines' : 'hyperbola';
  let r = NaN; if (kind === 'circle' && ctr) r = Math.sqrt(Math.max(0, ctr[0] * ctr[0] + ctr[1] * ctr[1] - qf / qa));
  return { kind, ctr, r, disc };
};
const KIND_TXT = { none: 'every point (or none): not a curve', line: 'a straight line', point: 'a single point', empty: 'no points at all (empty locus)', circle: 'a circle', ellipse: 'an ellipse', parabola: 'a parabola', hyperbola: 'a hyperbola', parallel: 'a pair of parallel lines (or one line, or nothing)', lines: 'a pair of crossing lines' };

// ======================= Tab 5: Locus =======================
// ---- 1. Apollonius circle: PA : PB = constant (used by "Equation of locus" with m : n, and by "Constant ratio of distances") ----
const apo = (P, lam) => {
  const { ax, ay, bx, by } = P, d = hyp(bx - ax, by - ay);
  if (Math.abs(lam - 1) < 1e-9) return { kind: 'bis', d, mx: (ax + bx) / 2, my: (ay + by) / 2 };
  const l2 = lam * lam, den = 1 - l2; return { kind: 'circ', d, cx: (ax - l2 * bx) / den, cy: (ay - l2 * by) / den, r: lam * d / Math.abs(den) };   // centre = (A − λ²B)/(1 − λ²)
};
const apoFit = (P, lam, extra) => {
  const q = apo(P, lam), pts = [[P.ax, P.ay], [P.bx, P.by]].concat(extra || []), L = Math.max(q.d, 2);
  if (q.kind === 'circ' && q.r < 7 * L) pts.push([q.cx - q.r, q.cy - q.r], [q.cx + q.r, q.cy + q.r]);
  else if (q.kind === 'bis') { const ux = -(P.by - P.ay) / q.d, uy = (P.bx - P.ax) / q.d; pts.push([q.mx + ux * L, q.my + uy * L], [q.mx - ux * L, q.my - uy * L]); }
  else pts.push([P.ax - L, P.ay - L], [P.bx + L, P.by + L]);
  return pts;
};
const apoDraw = (g, t, C, lv, P, lam, test) => {
  const { ax, ay, bx, by } = P, q = apo(P, lam), d = q.d, f = ease(seg(t, .3, .85)), e = ease(seg(t, .05, .2));
  g.L(ax, ay, bx, by, C.faint, 1.6, [5, 5], e);
  let px, py, cur = null;
  if (q.kind === 'bis') {
    const ux = -(by - ay) / d, uy = (bx - ax) / d, amp = Math.max(d * .9, 3), s = amp * (2 * f - 1); px = q.mx + ux * s; py = q.my + uy * s;
    if (t > .3) { g.L(q.mx - ux * amp, q.my - uy * amp, px, py, C.a, 4); } if (t >= .85) g.LL(bx - ax, by - ay, (ax * ax + ay * ay - bx * bx - by * by) / 2, C.a, 4);
  } else {
    const phi = Math.PI * 0.15 + TAU * f; px = q.cx + q.r * Math.cos(phi); py = q.cy + q.r * Math.sin(phi);
    if (t > .3) circ(g, q.cx, q.cy, q.r, C.a, 4, f, null, 1);
    if (t >= .85 && q.r > EPS) { circ(g, q.cx, q.cy, q.r, C.a, 4); g.D(q.cx, q.cy, C.a, 5); g.T('C', q.cx, q.cy, C.a, { dx: -2, dy: -14, size: 14 }); g.L(q.cx, q.cy, q.cx + q.r, q.cy, C.a, 2, [5, 4]); g.T('r = ' + fmt(q.r, 3), q.cx + q.r / 2, q.cy, C.a, { dy: 16, size: 12 }); }
  }
  const lamZero = lam < EPS;
  if (t > .3 && !lamZero) {
    const pa = hyp(px - ax, py - ay), pb = hyp(px - bx, py - by);
    g.L(px, py, ax, ay, C.c, 2.5); g.L(px, py, bx, by, C.g, 2.5);
    segT(g, px, py, ax, ay, 'PA = ' + fmt(pa, 2), C.c, 1, 15); segT(g, px, py, bx, by, 'PB = ' + fmt(pb, 2), C.g, -1, 15);
    g.D(px, py, C.a, 8); g.T('P', px, py, C.a, { dx: 13, dy: -12, size: 15 }); cur = { pa, pb };
  }
  dotT(g, ax, ay, C.c, 'A', { dx: -8 }); dotT(g, bx, by, C.g, 'B', { dx: 8 });
  if (test && t > .8) { const pa = hyp(test[0] - ax, test[1] - ay), pb = hyp(test[0] - bx, test[1] - by), on = Math.abs(pa - lam * pb) < 1e-6 * (1 + pa + pb); g.D(test[0], test[1], on ? C.g : C.ink, 8); g.T('T' + ptS(test[0], test[1]) + (on ? ' ✓ on locus' : ' ✗ off'), test[0], test[1], on ? C.g : C.ink, { dy: -20, size: 12 }); }
  const k = t < .05 ? 0 : t < .3 ? 1 : t < .85 ? 2 : 3, rat = cur && cur.pb > EPS ? fmt(cur.pa / cur.pb, 3) : fmt(lam, 3);
  return pick(lv, ['Two fixed points A and B.', 'We want every point P whose distance from A is ' + fmt(lam, 3) + ' times its distance from B  (PA : PB = ' + fmt(lam, 3) + ' : 1).',
    lamZero ? 'PA must be 0, so P can only be the point A itself.' : 'Move P around and keep checking: PA ÷ PB = ' + rat + '. The ratio never changes.',
    q.kind === 'bis' ? 'The ratio is 1, so PA = PB. The points form the perpendicular bisector of AB (a straight line).' : lamZero ? 'The locus is just the point A.' : 'P draws a circle (the Apollonius circle). Centre C' + ptS(q.cx, q.cy) + ', radius ' + fmt(q.r) + '.'],
  ['A' + ptS(ax, ay) + ', B' + ptS(bx, by) + ',  AB = ' + fmt(d, 3) + '.', 'PA = λ·PB ⇒ PA² = λ²PB²,  λ = ' + fmt(lam, 3) + '.',
    lamZero ? 'λ = 0 ⇒ PA = 0 ⇒ P = A.' : 'Expanding: (1 − λ²)(x² + y²) − 2(x_A − λ²x_B)x − 2(y_A − λ²y_B)y + |A|² − λ²|B|² = 0.   Now PA/PB = ' + rat + '.',
    q.kind === 'bis' ? 'λ = 1 ⇒ 1 − λ² = 0, the squared terms cancel: a line (the perpendicular bisector).' : lamZero ? 'Locus: the point A.' : 'C = (A − λ²B)/(1 − λ²) = ' + ptS(q.cx, q.cy) + ',  r = λ·AB/|1 − λ²| = ' + fmt(q.r) + '.'])[k];
};
const apoOut = (P, lam, test) => {
  const q = apo(P, lam); let s;
  if (q.kind === 'bis') { const dx = P.bx - P.ax, dy = P.by - P.ay, c = (P.ax * P.ax + P.ay * P.ay - P.bx * P.bx - P.by * P.by) / 2; s = 'Locus (λ = 1): the perpendicular bisector of AB, ' + niceEq({ a: dx, b: dy, c }) + (Math.abs(dy) > EPS ? '  i.e. ' + slopeEq(-dx / dy, -c / dy) : '  i.e. x = ' + fmt(-c / dx)); }
  else if (lam < EPS) s = 'Locus (λ = 0): only the point A' + ptS(P.ax, P.ay);
  else s = 'Locus: ' + sqr('x', q.cx) + ' + ' + sqr('y', q.cy) + ' = ' + fmt(q.r) + '²   (Apollonius circle, centre ' + ptS(q.cx, q.cy) + ', radius ' + fmt(q.r) + ')';
  if (test) { const pa = hyp(test[0] - P.ax, test[1] - P.ay), pb = hyp(test[0] - P.bx, test[1] - P.by), on = Math.abs(pa - lam * pb) < 1e-6 * (1 + pa + pb); s += ';  test point ' + ptS(test[0], test[1]) + ': PA = ' + fmt(pa) + ', PB = ' + fmt(pb) + ', PA/PB = ' + (pb > EPS ? fmt(pa / pb) : '—') + (on ? ' → ON the locus' : ' → NOT on the locus'); }
  return s;
};
const lamOf = P => Math.abs(P.m / P.n);
const apoChal = (pre, lamF) => [
  { id: pre + '-bis', text: T2('Make the locus a straight line (the perpendicular bisector).', 'Choose the ratio so that λ = 1.'), hint: T2('A straight line appears when the two distances are equal.', 'λ = 1 makes the x² and y² terms vanish.'), check: P => Math.abs(lamF(P) - 1) < 1e-9 && hyp(P.bx - P.ax, P.by - P.ay) > EPS },
  { id: pre + '-small', text: T2('Make the circle wrap around A (not B).', 'Choose λ < 1 so that A lies inside the circle.'), hint: T2('P must be allowed to be closer to A than to B. Make the ratio less than 1.', 'A lies inside the circle exactly when λ < 1.'), check: P => { const q = apo(P, lamF(P)); return q.kind === 'circ' && lamF(P) > EPS && hyp(P.ax - q.cx, P.ay - q.cy) < q.r - 1e-9; } }];

mk('l5ratio', 5, 'Locus: distances in the ratio m : n', 'Class 11–12', [['ax', 'A: x', 2], ['ay', 'A: y', 0], ['bx', 'B: x', 8], ['by', 'B: y', 0], ['m', 'm', 2], ['n', 'n', 1]],
  ['Points whose distance from A is always m times for every n times the distance from B lie on a circle (or a line when m = n).', 'PA : PB = m : n ⇒ PA² = (m/n)² PB²  ⇒ circle with C = (A − λ²B)/(1 − λ²), λ = m/n; a line when λ = 1'], {
  fit: P => apoFit(P, lamOf(P)),
  valid: P => fin(P.ax, P.ay, P.bx, P.by, P.m, P.n) && Math.abs(P.m) > EPS && Math.abs(P.n) > EPS && hyp(P.bx - P.ax, P.by - P.ay) > EPS,
  draw: (g, t, C, lv, P) => apoDraw(g, t, C, lv, P, lamOf(P), null),
  out: (P, lv) => apoOut(P, lamOf(P), null) });
MORE.extras.l5ratio = { chip: 'Locus: ratio m : n', marks: [0, .05, .3, .85], ranges: Object.assign(rg(['ax', 'ay', 'bx', 'by'], R8), { m: [.5, 8, .5], n: [.5, 8, .5] }),
  handles: P => [{ k: '1', x: P.ax, y: P.ay, label: 'A' }, { k: '2', x: P.bx, y: P.by, label: 'B' }], drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { ax: x, ay: y }) : Object.assign({}, P, { bx: x, by: y })),
  challenges: apoChal('l5-ratio', lamOf).concat([{ id: 'l5-ratio-pass', text: T2('Make the locus pass through the point (4, 0).', 'Choose m : n so that (4, 0) satisfies PA : PB = m : n.'), hint: T2('(4, 0) is on the line AB. It must split AB in the ratio m : n, so 2 steps from A and 4 from B.', 'AP : PB = 2 : 4 = 1 : 2.'), check: P => { const l = lamOf(P), q = apo(P, l); return q.kind === 'circ' ? Math.abs(sq2(4 - q.cx) + sq2(0 - q.cy) - q.r * q.r) < 1e-6 : Math.abs(4 - q.mx) < 1e-9 && Math.abs(q.my) < 1e-9; } }]) };
function sq2(v) { return v * v; }
MORE.hooks.l5ratio = 'Two radio masts A and B: where is the signal from A exactly twice as strong in distance terms as from B?';
BINDINGS.push({ scene: 'l5ratio', ids: ['locusAx', 'locusAy', 'locusBx', 'locusBy', 'locusM', 'locusN', 'locusF1x', 'locusF1y', 'locusF2x', 'locusF2y', 'locusK'], text: ['locusCustomEq'],
  get: (v, rr, tx) => {
    const c = rr('locusCondition') || 'distanceRatio';
    if (c === 'distanceRatio') return { ax: v[0], ay: v[1], bx: v[2], by: v[3], m: v[4], n: v[5] };
    if (c === 'custom') return conicOf(tx('locusCustomEq'));
    return { f1x: v[6], f1y: v[7], f2x: v[8], f2y: v[9], k: v[10], kind: c === 'sumDistances' ? 0 : 1 };
  },
  sceneOf: (p, rr) => { const c = rr('locusCondition') || 'distanceRatio'; return c === 'distanceRatio' ? 'l5ratio' : c === 'custom' ? 'l5cust' : 'l5foci'; },
  set: P => (P.m !== undefined ? { locusAx: P.ax, locusAy: P.ay, locusBx: P.bx, locusBy: P.by } : P.f1x !== undefined ? { locusF1x: P.f1x, locusF1y: P.f1y, locusF2x: P.f2x, locusF2y: P.f2y } : null) });

mk('l5apol', 5, 'Locus: constant ratio of distances (Apollonius circle)', 'Class 11–12', [['ax', 'A: x', -2], ['ay', 'A: y', 0], ['bx', 'B: x', 2], ['by', 'B: y', 0], ['lam', 'λ = PA/PB', 2], ['px', 'test P: x', 2], ['py', 'test P: y', 3]],
  ['Walk so that your distance from A is always λ times your distance from B. You go round in a circle.', 'PA/PB = λ ⇒ circle with C = (A − λ²B)/(1 − λ²), r = λ·AB/|1 − λ²|;  λ = 1 gives the perpendicular bisector'], {
  fit: P => apoFit(P, P.lam, [[P.px, P.py]]),
  valid: P => fin(P.ax, P.ay, P.bx, P.by, P.lam, P.px, P.py) && P.lam >= 0 && hyp(P.bx - P.ax, P.by - P.ay) > EPS,
  draw: (g, t, C, lv, P) => apoDraw(g, t, C, lv, P, P.lam, [P.px, P.py]),
  out: (P, lv) => apoOut(P, P.lam, [P.px, P.py]) });
MORE.extras.l5apol = { chip: 'Apollonius circle', marks: [0, .05, .3, .85], ranges: Object.assign(rg(['ax', 'ay', 'bx', 'by', 'px', 'py'], R8), { lam: [0, 5, .25] }),
  handles: P => [{ k: '1', x: P.ax, y: P.ay, label: 'A' }, { k: '2', x: P.bx, y: P.by, label: 'B' }, { k: '3', x: P.px, y: P.py, label: 'P' }],
  drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { ax: x, ay: y }) : k === '2' ? Object.assign({}, P, { bx: x, by: y }) : Object.assign({}, P, { px: x, py: y })),
  challenges: apoChal('l5-apol', P => P.lam).concat([{ id: 'l5-apol-on', text: T2('Put the test point P exactly on the locus.', 'Choose P so that PA = λ·PB.'), hint: T2('Try a point on the x-axis outside the segment AB, such as x = 6.', 'For A(−2, 0), B(2, 0), λ = 2: P(6, 0) gives PA = 8 and PB = 4.'), check: P => { const pa = hyp(P.px - P.ax, P.py - P.ay), pb = hyp(P.px - P.bx, P.py - P.by); return Math.abs(pa - P.lam * pb) < 1e-9; } }]) };
MORE.hooks.l5apol = 'A lifeguard runs twice as fast on sand as in water. Where do the two routes take equal time?';
BINDINGS.push({ scene: 'l5apol', ids: ['ratioAx', 'ratioAy', 'ratioBx', 'ratioBy', 'ratioLambda', 'ratioX', 'ratioY'], get: v => ({ ax: v[0], ay: v[1], bx: v[2], by: v[3], lam: v[4], px: v[5], py: v[6] }),
  set: P => ({ ratioAx: P.ax, ratioAy: P.ay, ratioBx: P.bx, ratioBy: P.by, ratioX: P.px, ratioY: P.py }) });

// ---- 2. Sum or difference of distances from two foci ----
const foc = P => {
  const dx = P.f2x - P.f1x, dy = P.f2y - P.f1y, d = hyp(dx, dy), ell = P.kind === 0, k = P.k, a = k / 2, c = d / 2;
  const ok = ell ? k > d + 1e-9 : (k < d - 1e-9 && k > 1e-9), b = Math.sqrt(Math.max(0, ell ? a * a - c * c : c * c - a * a));
  return { d, ux: dx / d, uy: dy / d, mx: (P.f1x + P.f2x) / 2, my: (P.f1y + P.f2y) / 2, a, c, b, ok, ell, bis: !ell && Math.abs(k) <= 1e-9 };
};
const focPt = (q, s, side) => { const vx = -q.uy, vy = q.ux, cs = q.ell ? Math.cos(s) : side * Math.cosh(s), sn = q.ell ? Math.sin(s) : Math.sinh(s); return [q.mx + q.a * cs * q.ux + q.b * sn * vx, q.my + q.a * cs * q.uy + q.b * sn * vy]; };
mk('l5foci', 5, 'Locus: two fixed points (ellipse or hyperbola)', 'Class 11–12', [['f1x', 'F₁: x', -3], ['f1y', 'F₁: y', 0], ['f2x', 'F₂: x', 3], ['f2y', 'F₂: y', 0], ['k', 'k', 4]],
  ['Two pins and a loop of string draw an ellipse: the two string lengths always add up to the same number.', 'Ellipse: PF₁ + PF₂ = k > F₁F₂ (a = k/2, b² = a² − c²).  Hyperbola: |PF₁ − PF₂| = k < F₁F₂ (b² = c² − a²).'], {
  selects: { kind: ['Condition', ['sum of distances = k  (ellipse)', 'difference of distances = k  (hyperbola)']] },
  fit: P => { const q = foc(P), pts = [[P.f1x, P.f1y], [P.f2x, P.f2y]]; if (q.ok) { const r = q.ell ? Math.max(q.a, q.b) : q.a * Math.cosh(1.2) + q.b; pts.push([q.mx - r * 1.05, q.my - r * 1.05], [q.mx + r * 1.05, q.my + r * 1.05]); } else pts.push([q.mx - 4, q.my - 3], [q.mx + 4, q.my + 3]); return pts; },
  valid: P => fin(P.f1x, P.f1y, P.f2x, P.f2y, P.k) && hyp(P.f2x - P.f1x, P.f2y - P.f1y) > EPS,
  draw(g, t, C, lv, P) {
    const q = foc(P), f = ease(seg(t, .3, .85)), name = q.ell ? 'ellipse' : 'hyperbola', e = ease(seg(t, .05, .2));
    g.L(P.f1x, P.f1y, P.f2x, P.f2y, C.faint, 1.6, [5, 5], e);
    let msg = null;
    if (q.ell && !q.ok) msg = 'The string (' + fmt(P.k) + ') must be longer than the gap between the pins (' + fmt(q.d, 3) + '), otherwise no ellipse can be drawn.';
    else if (!q.ell && !q.ok && !q.bis) msg = P.k >= q.d ? 'For a hyperbola the difference k must be smaller than the gap F₁F₂ = ' + fmt(q.d, 3) + '.' : 'A difference of distances cannot be negative, so there is no such point.';
    if (q.bis && !msg) { /* k = 0: the two distances are equal */
      const L = Math.max(q.d * 1.2, 4), s = L * (2 * f - 1), px = q.mx - q.uy * s, py = q.my + q.ux * s; g.L(q.mx + q.uy * L, q.my - q.ux * L, px, py, C.a, 4); g.L(px, py, P.f1x, P.f1y, C.c, 2.5); g.L(px, py, P.f2x, P.f2y, C.g, 2.5); g.D(px, py, C.a, 8); g.T('P', px, py, C.a, { dx: 13, dy: -12, size: 15 });
      msg = t < .3 ? '' : 'k = 0 means PF₁ = PF₂: the points form the perpendicular bisector of F₁F₂ (a straight line).';
    } else if (q.ok) {
      const branches = q.ell ? [[1, 0, TAU]] : [[1, -1.3, 1.3], [-1, -1.3, 1.3]], nb = branches.length;
      branches.forEach(([side, s0, s1], bi) => {
        const lo = bi / nb, hi = (bi + 1) / nb, fb = seg(f, lo, hi), n = 80, pts = []; if (fb <= 0) return;
        for (let i = 0; i <= n * fb; i++) pts.push(focPt(q, s0 + (s1 - s0) * (i / n), side)); E.kit.poly(g, pts, C.a, 4);
      });
      const bi = nb === 2 && f >= .5 ? 1 : 0, fb = nb === 2 ? seg(f, bi / 2, (bi + 1) / 2) : f, br = branches[bi], p = focPt(q, br[1] + (br[2] - br[1]) * fb, br[0]);
      const d1 = hyp(p[0] - P.f1x, p[1] - P.f1y), d2 = hyp(p[0] - P.f2x, p[1] - P.f2y); g.L(p[0], p[1], P.f1x, P.f1y, C.c, 2.5); g.L(p[0], p[1], P.f2x, P.f2y, C.g, 2.5);
      segT(g, p[0], p[1], P.f1x, P.f1y, fmt(d1, 2), C.c, 1, 12); segT(g, p[0], p[1], P.f2x, P.f2y, fmt(d2, 2), C.g, -1, 12);
      g.D(p[0], p[1], C.a, 8); g.T('P', p[0], p[1], C.a, { dx: 13, dy: -12, size: 15 });
      if (t > .3) msg = q.ell ? 'PF₁ + PF₂ = ' + fmt(d1, 2) + ' + ' + fmt(d2, 2) + ' = ' + fmt(d1 + d2, 2) : '|PF₁ − PF₂| = |' + fmt(d1, 2) + ' − ' + fmt(d2, 2) + '| = ' + fmt(Math.abs(d1 - d2), 2);
      if (t >= .85) { g.D(q.mx, q.my, C.ink, 4); g.T('centre', q.mx, q.my, C.ink, { dy: 15, size: 11 }); }
    }
    dotT(g, P.f1x, P.f1y, C.c, 'F₁', { dx: -8 }); dotT(g, P.f2x, P.f2y, C.g, 'F₂', { dx: 8 });
    const k = t < .05 ? 0 : t < .3 ? 1 : t < .85 ? 2 : 3;
    return pick(lv, ['Two fixed points F₁ and F₂ (the pins).', 'Rule: ' + (q.ell ? 'the two distances from P add up to ' : 'the two distances from P differ by ') + fmt(P.k) + '.', msg || 'Move P so that the rule always holds.',
      q.ok ? 'P draws an ' + name + '. The pins are its foci.' : q.bis ? 'Locus: the perpendicular bisector.' : 'No ' + name + ' for these numbers.'],
    ['F₁' + ptS(P.f1x, P.f1y) + ', F₂' + ptS(P.f2x, P.f2y) + ',  F₁F₂ = 2c = ' + fmt(q.d, 3) + '.', q.ell ? 'PF₁ + PF₂ = k = ' + fmt(P.k) + ' (needs k > 2c).' : '|PF₁ − PF₂| = k = ' + fmt(P.k) + ' (needs 0 < k < 2c).', msg || '',
      q.ok ? 'a = k/2 = ' + fmt(q.a) + ', c = ' + fmt(q.c) + ', b² = ' + (q.ell ? 'a² − c²' : 'c² − a²') + ' = ' + fmt(q.b * q.b) + '.  Centre ' + ptS(q.mx, q.my) + '.' : msg || ''])[k];
  },
  out(P, lv) {
    const q = foc(P), nm = q.ell ? 'Ellipse' : 'Hyperbola', foci = ' with foci at ' + ptS(P.f1x, P.f1y) + ' and ' + ptS(P.f2x, P.f2y);
    if (q.ell && !q.ok) return 'For an ellipse, the constant must be greater than the distance between the foci (' + fmt(q.d, 3) + '): no ellipse for k = ' + fmt(P.k);
    if (!q.ell && q.bis) return 'k = 0: |PF₁ − PF₂| = 0 means PF₁ = PF₂, so the locus is the perpendicular bisector of F₁F₂ (not a true hyperbola)';
    if (!q.ell && !q.ok) return P.k >= q.d - 1e-9 ? 'For a hyperbola, the constant must be less than the distance between the foci (' + fmt(q.d, 3) + '): no hyperbola for k = ' + fmt(P.k) : 'The constant k = ' + fmt(P.k) + ' is negative: no point has a negative difference of distances';
    const X = Math.abs(q.uy) < 1e-9, Y = Math.abs(q.ux) < 1e-9;
    let eq = X ? sqr('x', q.mx) + '/' + fmt(q.a * q.a) + (q.ell ? ' + ' : ' − ') + sqr('y', q.my) + '/' + fmt(q.b * q.b) + ' = 1' : Y ? sqr('y', q.my) + '/' + fmt(q.a * q.a) + (q.ell ? ' + ' : ' − ') + sqr('x', q.mx) + '/' + fmt(q.b * q.b) + ' = 1' : 'X²/' + fmt(q.a * q.a) + (q.ell ? ' + ' : ' − ') + 'Y²/' + fmt(q.b * q.b) + ' = 1 (X along F₁F₂, centre ' + ptS(q.mx, q.my) + ')';
    return nm + foci + ':  ' + eq + '   (a = ' + fmt(q.a) + ', b = ' + fmt(q.b) + ', c = ' + fmt(q.c) + ')';
  } });
MORE.extras.l5foci = { chip: 'Ellipse and hyperbola', marks: [0, .05, .3, .85], ranges: Object.assign(rg(['f1x', 'f1y', 'f2x', 'f2y'], R8), { k: [0, 14, .5] }),
  handles: P => [{ k: '1', x: P.f1x, y: P.f1y, label: 'F₁' }, { k: '2', x: P.f2x, y: P.f2y, label: 'F₂' }], drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { f1x: x, f1y: y }) : Object.assign({}, P, { f2x: x, f2y: y })),
  challenges: [{ id: 'l5-foci-ell', text: T2('Choose the sum option and make a real ellipse.', 'Choose the sum condition with k > F₁F₂.'), hint: T2('The string must be longer than the gap between the pins.', 'Ellipse needs k > 2c.'), check: P => P.kind === 0 && foc(P).ok },
    { id: 'l5-foci-circ', text: T2('Make the ellipse a circle (the two pins at the same place is not allowed: make it as round as you can, b = a ± 0.1).', 'Choose the sum condition so that the ellipse is nearly a circle: b/a ≥ 0.95.'), hint: T2('Bring the pins close together and make the string a bit longer.', 'Eccentricity c/a < 0.31.'), check: P => { const q = foc(P); return P.kind === 0 && q.ok && q.b / q.a >= .95; } },
    { id: 'l5-foci-hyp', text: T2('Choose the difference option and make the difference exactly 2.', 'Choose the difference condition with k = 2 (so a = 1).'), hint: T2('The difference has to be smaller than the gap between the pins. Set k to 2.', 'Hyperbola needs 0 < k < 2c; here a = k/2 = 1.'), check: P => P.kind === 1 && foc(P).ok && Math.abs(P.k - 2) < 1e-9 }] };
MORE.hooks.l5foci = 'Gardeners draw an oval flower bed with two pegs and a loop of rope.';

// ---- 3. Custom equation: any curve of degree 2, shown by scanning a line over the plane ----
const cuRoots = (q, y) => {   // x values of the curve on the horizontal line at height y
  const a = q.qa, b = q.qb * y + q.qd, c = q.qc * y * y + q.qe * y + q.qf;
  if (Math.abs(a) < 1e-12) return Math.abs(b) < 1e-12 ? [] : [-c / b];
  const D = b * b - 4 * a * c; if (D < 0) return []; if (D === 0) return [-b / (2 * a)]; const s = Math.sqrt(D); return [(-b - s) / (2 * a), (-b + s) / (2 * a)];
};
mk('l5cust', 5, 'Locus from an equation f(x, y) = 0', 'Class 9–12', [['qa', 'x² coeff', 1], ['qb', 'xy coeff', 0], ['qc', 'y² coeff', 1], ['qd', 'x coeff', 0], ['qe', 'y coeff', 0], ['qf', 'constant', -25]],
  ['The locus is every point (x, y) that makes the equation true. A line sweeping upward finds those points.', 'qa·x² + qb·xy + qc·y² + qd·x + qe·y + qf = 0.  Discriminant B² − 4AC: < 0 ellipse/circle, = 0 parabola, > 0 hyperbola.'], {
  fit: P => {   // closed curves: their bounding box; open curves: a window round the centre
    const i = conicInfo(P), c = i.ctr || [0, 0]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    if (['circle', 'ellipse', 'point'].includes(i.kind)) for (let y = -40; y <= 40; y += .25) cuRoots(P, y).forEach(x => { if (Math.abs(x) < 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } });
    if (x0 > x1) { x0 = c[0] - 6; x1 = c[0] + 6; y0 = c[1] - 5; y1 = c[1] + 5; }
    return [[x0 - .5, y0 - .5], [x1 + .5, y1 + .5], [0, 0]];
  },
  valid: P => fin(P.qa, P.qb, P.qc, P.qd, P.qe, P.qf) && Math.max(Math.abs(P.qa), Math.abs(P.qb), Math.abs(P.qc), Math.abs(P.qd), Math.abs(P.qe)) > EPS,
  draw(g, t, C, lv, P) {
    const b = g.b, e = ease(seg(t, .2, .85)), yw = lerp(b.y0, b.y1, e), info = conicInfo(P);
    if (t > .2) below(g, yw, () => E.kit.implicit(g, (x, y) => P.qa * x * x + P.qb * x * y + P.qc * y * y + P.qd * x + P.qe * y + P.qf, C.a, 4, 1, 170));
    if (t > .2 && t < .93) { g.L(b.x0, yw, b.x1, yw, C.c, 2, [6, 5]); cuRoots(P, yw).forEach(x => { if (x >= b.x0 && x <= b.x1) g.D(x, yw, C.a, 6); }); }
    const k = t < .2 ? 0 : t < .85 ? 1 : 2;
    return pick(lv, ['The equation ' + polyStr(P) + ' is a rule that some points obey and others do not.', 'Slide a line upward. Every time it touches a point that fits the rule, a dot is left behind.', 'The dots join into ' + KIND_TXT[info.kind] + (info.kind === 'circle' && isFinite(info.r) ? ' of radius ' + fmt(info.r) + '.' : '.')],
      [polyStr(P) + ',  B² − 4AC = ' + fmt(info.disc) + '.', 'For each height y, solve the quadratic in x; its roots are the points of the locus.', 'The locus is ' + KIND_TXT[info.kind] + (info.ctr && ['circle', 'ellipse', 'hyperbola'].includes(info.kind) ? ', centre ' + ptS(info.ctr[0], info.ctr[1]) : '') + (info.kind === 'circle' && isFinite(info.r) ? ', r = ' + fmt(info.r) : '') + '.'])[k];
  },
  out(P, lv) { const i = conicInfo(P); return 'Locus: ' + polyStr(P) + '  →  ' + KIND_TXT[i.kind] + (i.kind === 'circle' && isFinite(i.r) && i.ctr ? ' with centre ' + ptS(i.ctr[0], i.ctr[1]) + ', radius ' + fmt(i.r) : ''); } });
MORE.extras.l5cust = { chip: 'Curve from an equation', marks: [0, .2, .85], ranges: { qa: [-4, 4, 1], qb: [-4, 4, 1], qc: [-4, 4, 1], qd: [-8, 8, 1], qe: [-8, 8, 1], qf: [-36, 36, 1] },
  challenges: [{ id: 'l5-cust-r3', text: T2('Make a circle of radius 3 around the origin.', 'Choose the constant so that x² + y² + qf = 0 is a circle of radius 3.'), hint: T2('x² + y² = r². The right side is 9.', 'qf = −r² = −9.'), check: P => { const i = conicInfo(P); return i.kind === 'circle' && Math.abs(i.r - 3) < 1e-9 && i.ctr && hyp(i.ctr[0], i.ctr[1]) < 1e-9; } },
    { id: 'l5-cust-par', text: T2('Turn it into a parabola (a U-shaped curve).', 'Make B² − 4AC = 0 with a genuine curve, for example x² − y = 0.'), hint: T2('A parabola has x² but no y². Try y = x² (x² − y = 0).', 'qa = 1, qc = 0, qb = 0, qe = −1, qf = 0.'), check: P => conicInfo(P).kind === 'parabola' },
    { id: 'l5-cust-hyp', text: T2('Make a hyperbola (two separate curves).', 'Make B² − 4AC > 0 with a non-degenerate curve, for example x² − y² = 1.'), hint: T2('Give y² the opposite sign to x².', 'qa = 1, qc = −1, qf = −1.'), check: P => conicInfo(P).kind === 'hyperbola' }] };
MORE.hooks.l5cust = 'A satellite dish, a bridge arch and a planet’s path are all curves with equations like this.';


// ---- 4. Midpoint of the part of a moving line between the axes ----
const midB = (P, a) => (P.cond === 0 ? P.k - a : P.cond === 1 ? a / (P.k * a - 1) : P.k / a);
const midLocus = (P, x, y) => (P.cond === 0 ? x + y - P.k / 2 : P.cond === 1 ? x + y - 2 * P.k * x * y : x * y - P.k / 4);
const midA = (P, u) => { const k = P.k, s = Math.sign(k) || 1; return P.cond === 0 ? k * (.08 + .84 * u) : P.cond === 1 ? (1 / k) * (1.1 + 6 * u * u) : s * Math.sqrt(Math.abs(k)) * Math.pow(10, u - .5) * (k > 0 ? 1 : 1); };
mk('l5mid', 5, 'Locus of the midpoint of the axes-intercept segment', 'Class 11–12', [['k', 'k', 10]],
  ['A ladder-like line slides so that it always cuts the axes at A and B. The middle of AB traces the locus.', 'M = (a/2, b/2).  Substitute a = 2x, b = 2y into the condition:  a + b = k → x + y = k/2;  1/a + 1/b = k → x + y = 2kxy;  ab = k → xy = k/4.'], {
  selects: { cond: ['Condition on the intercepts', ['a + b = k', '1/a + 1/b = k', 'ab = k  (constant area)']] },
  fit: P => { const pts = [[0, 0]]; [0, .5, 1].forEach(u => { const a = midA(P, u), b = midB(P, a); pts.push([a, 0], [0, b], [a / 2, b / 2]); }); return pts; },
  valid: P => fin(P.k) && Math.abs(P.k) > EPS,
  draw(g, t, C, lv, P) {
    const u = ease(seg(t, .12, .78)), a = midA(P, u), b = midB(P, a), e1 = ease(seg(t, .02, .12));
    const trail = []; for (let i = 0; i <= 50 * u; i++) { const aa = midA(P, i / 50), bb = midB(P, aa); trail.push([aa / 2, bb / 2]); }
    if (trail.length > 1) E.kit.poly(g, trail, C.a, 3.5);
    if (t >= .8) E.kit.implicit(g, (x, y) => midLocus(P, x, y), C.a, 4, 1, 170);
    if (t > .02) { g.LL(b, a, -a * b, C.c, 3, null, e1); g.D(a, 0, C.c, 6); g.D(0, b, C.g, 6); g.T('A(' + fmt(a, 2) + ', 0)', a, 0, C.c, { dy: b * a >= 0 ? 18 : -18, size: 11 }); g.T('B(0, ' + fmt(b, 2) + ')', 0, b, C.g, { dx: 50, size: 11 }); }
    if (t > .12) { g.D(a / 2, b / 2, C.a, 8); g.T('M', a / 2, b / 2, C.a, { dx: 14, dy: -12, size: 15 }); }
    const cond = ['a + b = ' + fmt(P.k), '1/a + 1/b = ' + fmt(P.k), 'ab = ' + fmt(P.k)][P.cond], eq = midOut(P), k = t < .12 ? 0 : t < .6 ? 1 : t < .8 ? 2 : 3;
    return pick(lv, ['A line cuts the x-axis at A(a, 0) and the y-axis at B(0, b).', 'The line may move, but it must obey: ' + cond + ' (now a = ' + fmt(a, 2) + ', b = ' + fmt(b, 2) + ').', 'M, the middle of AB, is at (a/2, b/2) = ' + ptS(a / 2, b / 2) + '. Watch the path of M.', 'The path of M is the curve ' + eq + '.'],
      ['Line x/a + y/b = 1, A(a, 0), B(0, b).', 'Condition: ' + cond + ';  here a = ' + fmt(a, 2) + ', b = ' + fmt(b, 2) + '.', 'M(x, y) = (a/2, b/2), so a = 2x and b = 2y.  M = ' + ptS(a / 2, b / 2) + '.',
        P.cond === 0 ? '2x + 2y = k ⇒ ' + eq : P.cond === 1 ? '1/(2x) + 1/(2y) = k ⇒ ' + eq : '(2x)(2y) = k ⇒ ' + eq])[k];
  },
  out: (P, lv) => 'Locus of the midpoint: ' + midOut(P) + (P.cond === 0 ? '  (a straight line)' : '  (a rectangular hyperbola)') });
function midOut(P) { return P.cond === 0 ? 'x + y = ' + fmt(P.k / 2) : P.cond === 1 ? '(x + y) = ' + fmt(2 * P.k) + 'xy' : 'xy = ' + fmt(P.k / 4); }
MORE.extras.l5mid = { chip: 'Midpoint of AB', marks: [0, .12, .6, .8], ranges: { k: [-20, 20, 1] },
  challenges: [{ id: 'l5-mid-pass', text: T2('Choose the sum option (a + b = k) and make the locus line pass through the point (3, 4).', 'With a + b = k, choose k so that x + y = k/2 passes through (3, 4).'), hint: T2('On the line x + y = k/2, the point (3, 4) gives 3 + 4 = 7. So k/2 = 7.', 'k = 14.'), check: P => P.cond === 0 && Math.abs(P.k / 2 - 7) < 1e-9 },
    { id: 'l5-mid-prod', text: T2('Choose the product option (ab = k) so that the triangle AOB has area 8.', 'Choose ab = k so that the area ½ab = 8.'), hint: T2('Area = ½ × a × b = k ÷ 2. So k = 16.', 'k = 16, locus xy = 4.'), check: P => P.cond === 2 && Math.abs(P.k / 2 - 8) < 1e-9 },
    { id: 'l5-mid-recip', text: T2('Choose 1/a + 1/b = k with k = 2.', 'Select the reciprocal condition with k = 2: locus x + y = 4xy.'), hint: T2('Pick the middle option and set k to 2.', 'Locus (x + y) = 2k·xy = 4xy.'), check: P => P.cond === 1 && Math.abs(P.k - 2) < 1e-9 }] };
MORE.hooks.l5mid = 'A ladder slides down a wall: where does the middle rung go?';
BINDINGS.push({ scene: 'l5mid', ids: ['midK'], get: (v, rr) => ({ k: v[0], cond: Math.max(0, ['sum', 'reciprocal', 'constant'].indexOf(rr('midCondition'))) }), set: P => ({ midK: P.k }) });

// ---- 5. Crossing point of two lines that depend on a parameter ----
const vlP = (P, s) => {   // the crossing point for the moving parameter s, plus the two lines
  if (P.type === 0) { const c = Math.cos(s), n = Math.sin(s); return { pt: [c + n, n - c], l1: [c, n, -1], l2: [n, -c, -1] }; }
  if (P.type === 1) { const tt = s; return { pt: [(tt + 1 / tt) / 2, (tt - 1 / tt) / 2], l1: [1, 1, -tt], l2: [1, -1, -1 / tt] }; }
  return null;
};
mk('l5vline', 5, 'Locus of the crossing point of variable lines', 'Class 11–12', [['a', 'a', 1], ['b', 'b', 2]],
  ['Two lines change as a number (the parameter) changes. Their crossing point moves along a curve: the locus.', 'Solve both equations for x and y in terms of the parameter, then eliminate the parameter.'], {
  selects: { type: ['Pair of lines', ['x cos θ + y sin θ = 1  and  x sin θ − y cos θ = 1', 'x + y = t  and  x − y = 1/t', 'x = at, y = a/t  and  x = b/t, y = bt']] },
  fit: P => (P.type === 0 ? [[-2, -2], [2, 2]] : P.type === 1 ? [[-3.2, -2.6], [3.2, 2.6]] : [[-3, -3], [3, 3], [P.a * 3, P.a / 3], [P.b / 3, P.b * 3]]),
  valid: P => fin(P.a, P.b) && Math.abs(P.a) > EPS && Math.abs(P.b) > EPS,
  draw(g, t, C, lv, P) {
    const f = ease(seg(t, .15, .85)), e = ease(seg(t, .02, .15));
    if (P.type < 2) {
      const sweep = s => (P.type === 0 ? TAU * s : (s < .5 ? Math.exp(-1.7 + 3.4 * (s * 2)) : -Math.exp(-1.7 + 3.4 * ((s - .5) * 2))));
      const trail = []; for (let i = 0; i <= 120 * f; i++) { const v = vlP(P, sweep(i / 120)); if (P.type === 1 && i > 0 && ((i / 120 < .5) !== ((i - 1) / 120 < .5))) trail.push(null); trail.push(v.pt); }
      let seg_ = []; trail.forEach(p => { if (p === null) { if (seg_.length > 1) E.kit.poly(g, seg_, C.a, 3.5); seg_ = []; } else seg_.push(p); }); if (seg_.length > 1) E.kit.poly(g, seg_, C.a, 3.5);
      const v = vlP(P, sweep(Math.min(.9999, f)));
      if (P.type === 0) circ(g, 0, 0, 1, C.faint, 1.6, 1, [4, 4]);
      g.LL(v.l1[0], v.l1[1], v.l1[2], C.c, 3, null, e); g.LL(v.l2[0], v.l2[1], v.l2[2], C.g, 3, null, e); g.D(v.pt[0], v.pt[1], C.a, 8); g.T('P' + ptS(v.pt[0], v.pt[1]).replace(/(\d+\.\d\d)\d+/g, '$1'), v.pt[0], v.pt[1], C.a, { dy: -18, size: 12 });
      if (t >= .88) { if (P.type === 0) circ(g, 0, 0, Math.SQRT2, C.a, 3.5); else E.kit.implicit(g, (x, y) => x * x - y * y - 1, C.a, 3.5); }
    } else {
      const lo = Math.log(.3), hi = Math.log(3.3), tt = Math.exp(lerp(lo, hi, f)), same = Math.abs(Math.abs(P.a) - Math.abs(P.b)) < 1e-9;
      E.kit.implicit(g, (x, y) => x * y - P.a * P.a, C.c, 3.5, .9); E.kit.implicit(g, (x, y) => x * y - P.b * P.b, C.g, 3.5, same ? 0 : .9);
      const U = [P.a * tt, P.a / tt], V = [P.b / tt, P.b * tt]; g.D(U[0], U[1], C.c, 7); g.D(V[0], V[1], C.g, 7);
      if (same) g.T('the two curves are the same', (g.b.x0 + g.b.x1) / 2, g.b.y1, C.a, { dy: 18, size: 13 });
    }
    const k = t < .15 ? 0 : t < .85 ? 1 : 2;
    const L0 = ['Two lines that change with the angle θ: they are always at a right angle, and both touch the small circle.', 'Two lines that change with the number t.'];
    return pick(lv, [P.type === 2 ? 'Two paths: the first is (at, a/t), the second is (b/t, bt), both depend on t.' : L0[P.type] || '', P.type === 2 ? 'Slide t. Each path draws a curve with the rule x·y = constant.' : 'Change the parameter and watch the crossing point P move.',
      P.type === 0 ? 'P always stays √2 ≈ 1.414 from the origin, so it travels on a circle: x² + y² = 2.' : P.type === 1 ? 'P travels on the curve x² − y² = 1 (a hyperbola).' : (Math.abs(Math.abs(P.a) - Math.abs(P.b)) < 1e-9 ? 'The two curves are the same, xy = ' + fmt(P.a * P.a) + '.' : 'The curves xy = ' + fmt(P.a * P.a) + ' and xy = ' + fmt(P.b * P.b) + ' never meet.')],
      [P.type === 0 ? 'Solve: x = cos θ + sin θ, y = sin θ − cos θ (determinant −1).' : P.type === 1 ? 'Add and subtract: x = (t + 1/t)/2, y = (t − 1/t)/2.' : 'L₁: xy = a², L₂: xy = b² (eliminate t).', 'Eliminate the parameter.',
        P.type === 0 ? 'x² + y² = (cos θ + sin θ)² + (sin θ − cos θ)² = 2' : P.type === 1 ? 'x² − y² = ¼[(t + 1/t)² − (t − 1/t)²] = 1' : 'Crossing needs a² = b² (then every point of xy = a² is shared).'])[k];
  },
  out: (P, lv) => (P.type === 0 ? 'Locus: x² + y² = 2   (circle, centre the origin, radius √2 ≈ 1.4142)' : P.type === 1 ? 'Locus: x² − y² = 1   (rectangular hyperbola, vertices (±1, 0))' : (Math.abs(Math.abs(P.a) - Math.abs(P.b)) < 1e-9 ? 'The two curves are xy = ' + fmt(P.a * P.a) + ' and xy = ' + fmt(P.b * P.b) + ', identical: locus xy = ' + fmt(P.a * P.a) : 'L₁ is xy = ' + fmt(P.a * P.a) + ' and L₂ is xy = ' + fmt(P.b * P.b) + ': they never meet when a² ≠ b² (they coincide when a² = b², giving xy = a²)')) });
MORE.extras.l5vline = { chip: 'Crossing point of moving lines', marks: [0, .15, .85], ranges: { a: [-4, 4, .5], b: [-4, 4, .5] },
  challenges: [{ id: 'l5-vl-circle', text: T2('Choose the pair of lines whose crossing point stays on a circle.', 'Choose the pair for which x² + y² = 2.'), hint: T2('Look at the pair with cos θ and sin θ.', 'The first pair gives a circle of radius √2.'), check: P => P.type === 0 },
    { id: 'l5-vl-same', text: T2('Choose the third pair and make the two curves the same curve.', 'Choose the third pair with a² = b².'), hint: T2('Make b the same size as a.', '|b| = |a| ⇒ xy = a² for both.'), check: P => P.type === 2 && Math.abs(Math.abs(P.a) - Math.abs(P.b)) < 1e-9 }] };
MORE.hooks.l5vline = 'A searchlight beam and a moving mirror cross at a point that moves along a curve.';
BINDINGS.push({ scene: 'l5vline', ids: [], present: root => !!root.querySelector('input[type="radio"][name="intersectType"]'), read: root => { const r = root.querySelector('input[type="radio"][name="intersectType"]:checked'); return { type: Math.max(0, ['parametric', 'linearParam', 'sumSquares'].indexOf(r ? r.value : '')), a: 1, b: 1 }; } });

// ---- 6. Section formula: fixed ratio, variable ratio, midpoint of a moving chord ----
const secP = P => ({ x: (P.m * P.bx + P.n * P.ax) / (P.m + P.n), y: (P.m * P.by + P.n * P.ay) / (P.m + P.n) });
mk('l5sec', 5, 'Locus with the section formula', 'Class 11–12', [['ax', 'A: x', 0], ['ay', 'A: y', 0], ['bx', 'B: x', 4], ['by', 'B: y', 0], ['m', 'm', 2], ['n', 'n', 1]],
  ['A point that cuts AB in a ratio is found with the section formula. Change the ratio and it slides along AB.', 'P = ((m·x₂ + n·x₁)/(m + n), (m·y₂ + n·y₁)/(m + n)).  Fixed ratio: one point.  Ratio t : 1 varies: the line AB.  Midpoint of AB with B on a circle: another circle.'], {
  selects: { kind: ['Problem', ['P divides AB in a fixed ratio m : n', 'P divides AB in a variable ratio t : 1', 'midpoint of A and a point B moving on a circle']] },
  fit: P => { const pts = [[P.ax, P.ay], [P.bx, P.by], [0, 0]]; if (P.kind === 1) { const dx = P.bx - P.ax, dy = P.by - P.ay; pts.push([P.ax - dx * .6, P.ay - dy * .6], [P.bx + dx * .6, P.by + dy * .6]); } else if (P.kind === 2) { const r = hyp(P.bx, P.by); pts.push([-r, -r], [r, r]); } else if (Math.abs(P.m + P.n) > EPS) { const p = secP(P); pts.push([p.x, p.y]); } return pts; },
  valid: P => fin(P.ax, P.ay, P.bx, P.by, P.m, P.n) && (P.kind !== 0 || Math.abs(P.m + P.n) > EPS) && (P.kind !== 1 || hyp(P.bx - P.ax, P.by - P.ay) > EPS),
  draw(g, t, C, lv, P) {
    const { ax, ay, bx, by } = P, e = ease(seg(t, .05, .2)), f = ease(seg(t, .25, .85)); let k = 0, txt;
    if (P.kind === 0) {
      const p = secP(P), mx = lerp(ax, p.x, f), my = lerp(ay, p.y, f); g.L(ax, ay, bx, by, C.faint, 1.8, [5, 4], e); g.L(ax, ay, p.x, p.y, C.c, 4, null, ease(seg(t, .3, .6))); g.L(p.x, p.y, bx, by, C.g, 4, null, ease(seg(t, .3, .6)));
      if (t > .6) { g.T('m = ' + fmt(P.m), (ax + p.x) / 2, (ay + p.y) / 2, C.c, { dy: -16, size: 13 }); g.T('n = ' + fmt(P.n), (p.x + bx) / 2, (p.y + by) / 2, C.g, { dy: -16, size: 13 }); }
      dotT(g, ax, ay, C.ink, 'A', { dx: -8 }); dotT(g, bx, by, C.ink, 'B', { dx: 8 }); if (f > 0) g.D(mx, my, C.a, 8); if (t > .85) g.T('P' + ptS(p.x, p.y), p.x, p.y, C.a, { dy: -22, size: 14 });
      k = t < .25 ? 0 : t < .6 ? 1 : 2;
      txt = pick(lv, ['Two fixed points A and B, and a ratio m : n = ' + fmt(P.m) + ' : ' + fmt(P.n) + '.', 'Split the journey from A to B into ' + fmt(P.m + P.n) + ' equal parts: ' + fmt(P.m) + ' parts on the A side, ' + fmt(P.n) + ' on the B side.', 'P is a single, fixed point ' + ptS(p.x, p.y) + '. Its locus is just that point.'],
        ['A' + ptS(ax, ay) + ', B' + ptS(bx, by) + ', m : n = ' + fmt(P.m) + ' : ' + fmt(P.n) + '.', 'x = (m·x₂ + n·x₁)/(m + n) = (' + fmt(P.m * bx) + ' + ' + fmt(P.n * ax) + ')/' + fmt(P.m + P.n) + ' = ' + fmt(p.x) + ',  y = (' + fmt(P.m * by) + ' + ' + fmt(P.n * ay) + ')/' + fmt(P.m + P.n) + ' = ' + fmt(p.y) + '.', 'P = ' + ptS(p.x, p.y) + ' does not depend on any parameter: the locus is a fixed point.'])[k];
    } else if (P.kind === 1) {
      const s = lerp(-.6, 1.6, f), pt = [ax + s * (bx - ax), ay + s * (by - ay)], tt = Math.abs(1 - s) < .02 ? null : s / (1 - s);
      g.L(ax - .6 * (bx - ax), ay - .6 * (by - ay), pt[0], pt[1], C.a, 4); if (t >= .88) g.LL(by - ay, ax - bx, -((by - ay) * ax + (ax - bx) * ay), C.a, 4);
      dotT(g, ax, ay, C.ink, 'A', { dx: -8 }); dotT(g, bx, by, C.ink, 'B', { dx: 8 }); g.D(pt[0], pt[1], C.a, 8); g.T('P' + (tt === null ? '  (t → ∞)' : '  (t = ' + fmt(tt, 2) + ')'), pt[0], pt[1], C.a, { dy: -20, size: 12 });
      k = t < .25 ? 0 : t < .85 ? 1 : 2;
      txt = pick(lv, ['A and B are fixed. P cuts AB in the ratio t : 1, but t can be any number.', 'Change t and P slides along the line AB' + (tt !== null ? ' (now t = ' + fmt(tt, 2) + ')' : '') + '. A negative t puts P outside the segment.', 'P never leaves the line AB, so the locus is the whole line AB.'],
        ['x = (t·x₂ + x₁)/(t + 1), y = (t·y₂ + y₁)/(t + 1).', 'Eliminate t: t = (x − x₁)/(x₂ − x), and substitute in y.', 'The result is linear: the line through A and B, ' + lineAB(P) + '.'])[k];
    } else {
      const r = hyp(bx, by), phi0 = Math.atan2(by, bx), phi = phi0 + TAU * f, Bp = [r * Math.cos(phi), r * Math.sin(phi)], M = [(ax + Bp[0]) / 2, (ay + Bp[1]) / 2];
      circ(g, 0, 0, r, C.faint, 2, 1, [5, 4]); circ(g, ax / 2, ay / 2, r / 2, C.a, 4, f, null, 1); if (t >= .88) circ(g, ax / 2, ay / 2, r / 2, C.a, 4);
      g.L(ax, ay, Bp[0], Bp[1], C.c, 2.5); dotT(g, ax, ay, C.ink, 'A', { dx: -8 }); g.D(Bp[0], Bp[1], C.g, 7); g.T('B', Bp[0], Bp[1], C.g, { dx: 12, dy: -12, size: 14 }); g.D(M[0], M[1], C.a, 8); g.T('M', M[0], M[1], C.a, { dx: 13, dy: 13, size: 15 });
      g.D(0, 0, C.ink, 4); g.D(ax / 2, ay / 2, C.a, 4);
      k = t < .25 ? 0 : t < .85 ? 1 : 2;
      txt = pick(lv, ['A is fixed. B moves round a circle (centre O, through the starting B). M is the middle of AB.', 'As B goes round, M goes round too.', 'M traces a circle half the size, centred half way between O and A: centre ' + ptS(ax / 2, ay / 2) + ', radius ' + fmt(r / 2) + '.'],
        ['A' + ptS(ax, ay) + ' fixed, B on x² + y² = r², r = |OB| = ' + fmt(r) + '.', 'M = (A + B)/2 ⇒ B = (2x − x_A, 2y − y_A).', 'Substitute in x² + y² = r²:  ' + sqr('x', ax / 2) + ' + ' + sqr('y', ay / 2) + ' = (r/2)² = ' + fmt(r * r / 4) + '.'])[k];
    }
    return txt;
  },
  out(P, lv) {
    if (P.kind === 0) { const p = secP(P); return 'P = ' + ptS(p.x, p.y) + ' is a fixed point (m : n = ' + fmt(P.m) + ' : ' + fmt(P.n) + '), so the locus is that single point'; }
    if (P.kind === 1) return 'Locus: the line AB, ' + lineAB(P);
    const r = hyp(P.bx, P.by); return 'Locus of the midpoint: ' + sqr('x', P.ax / 2) + ' + ' + sqr('y', P.ay / 2) + ' = ' + fmt(r / 2) + '²   (circle, centre ' + ptS(P.ax / 2, P.ay / 2) + ', radius |OB|/2 = ' + fmt(r / 2) + ')';
  } });
function lineAB(P) { const dx = P.bx - P.ax, dy = P.by - P.ay; if (Math.abs(dx) < EPS) return 'x = ' + fmt(P.ax); const m = dy / dx; return slopeEq(m, P.ay - m * P.ax); }
MORE.extras.l5sec = { chip: 'Section formula locus', marks: [0, .25, .6], ranges: Object.assign(rg(['ax', 'ay', 'bx', 'by'], R8), { m: [-6, 8, 1], n: [-6, 8, 1] }),
  handles: P => [{ k: '1', x: P.ax, y: P.ay, label: 'A' }, { k: '2', x: P.bx, y: P.by, label: 'B' }], drag: (P, k, x, y) => (k === '1' ? Object.assign({}, P, { ax: x, ay: y }) : Object.assign({}, P, { bx: x, by: y })),
  challenges: [{ id: 'l5-sec-mid', text: T2('Choose the first problem and make P the exact middle of AB.', 'Fixed ratio with m = n.'), hint: T2('The middle splits AB into two equal parts, so m and n are equal.', 'm : n = 1 : 1.'), check: P => P.kind === 0 && Math.abs(P.m - P.n) < 1e-9 && Math.abs(P.m) > EPS },
    { id: 'l5-sec-yaxis', text: T2('Choose the first problem and put P on the y-axis (but not at A).', 'Fixed ratio: choose A, B, m, n so that x_P = 0 and P ≠ A.'), hint: T2('P needs x = 0. Put A and B on opposite sides of the y-axis and use the middle.', 'A(−4, 0), B(4, 0), m = n.'), check: P => P.kind === 0 && Math.abs(P.m + P.n) > EPS && Math.abs(secP(P).x) < 1e-9 && hyp(secP(P).x - P.ax, secP(P).y - P.ay) > 1e-9 },
    { id: 'l5-sec-steep', text: T2('Choose the second problem and make the locus line steeper than 45° (slope above 1).', 'Variable ratio: make the line AB have slope > 1.'), hint: T2('Raise B: go up by more than you go across.', 'B(4, 8) gives slope 2.'), check: P => P.kind === 1 && Math.abs(P.bx - P.ax) > EPS && (P.by - P.ay) / (P.bx - P.ax) > 1 },
    { id: 'l5-sec-circ', text: T2('Choose the third problem and make the midpoint circle have radius 3.', 'Choose the third problem with |OB| = 6.'), hint: T2('The circle’s radius is half of OB. So OB must be 6.', 'B(6, 0): r = |OB|/2 = 3.'), check: P => P.kind === 2 && Math.abs(hyp(P.bx, P.by) / 2 - 3) < 1e-9 }] };
MORE.hooks.l5sec = 'A cable car stop that sits one third of the way between two stations: what if the ratio keeps changing?';
BINDINGS.push({ scene: 'l5sec', ids: ['sectionM', 'sectionN', 'sectionAx', 'sectionAy', 'sectionBx', 'sectionBy'], get: (v, rr) => ({ m: v[0], n: v[1], ax: v[2], ay: v[3], bx: v[4], by: v[5], kind: Math.max(0, ['fixedRatio', 'variableRatio', 'midpointVariable'].indexOf(rr('sectionType'))) }),
  set: P => ({ sectionAx: P.ax, sectionAy: P.ay, sectionBx: P.bx, sectionBy: P.by }) });

// ---- 7. Reflection and foot of the perpendicular ----
const reflOf = (P, x, y) => { const n2 = P.a * P.a + P.b * P.b, t = (P.a * x + P.b * y + P.c) / n2; return { F: [x - P.a * t, y - P.b * t], Q: [x - 2 * P.a * t, y - 2 * P.b * t] }; };
const reflLine = P => { const g = (x, y) => { const Q = reflOf(P, x, y).Q; return P.k1 * Q[0] + P.k2 * Q[1] + P.k3; }, g0 = g(0, 0); return { a: g(1, 0) - g0, b: g(0, 1) - g0, c: g0 }; };   // locus of P when its mirror image lies on K
const foot0 = P => { const n = hyp(P.a, P.b), p0 = Math.abs(P.c) / n, h2 = P.d * P.d - p0 * p0; return { n, p0, h2, h: Math.sqrt(Math.max(0, h2)), Fo: [-P.a * P.c / (n * n), -P.b * P.c / (n * n)] }; };
mk('l5refl', 5, 'Locus with a foot of perpendicular or a reflection', 'Class 11–12', [['a', 'a', 1], ['b', 'b', 0], ['c', 'c', 0], ['d', 'd', 2], ['k1', 'K: coeff of x', 1], ['k2', 'K: coeff of y', 2], ['k3', 'K: constant', -4], ['px', 'test P: x', 2], ['py', 'test P: y', 1]],
  ['The foot of the perpendicular is the nearest point of the line L. The reflection is the same distance on the other side.', 'F = P − t(a, b), Q = P − 2t(a, b),  t = (ax + by + c)/(a² + b²).  Use these in the given condition and simplify.'], {
  selects: { kind: ['Condition', ['the foot of the perpendicular is at distance d from the origin', 'the reflection of P lies on a fixed line K', 'the midpoint of P and its reflection lies on a fixed line K']] },
  fit: P => { const pts = [[0, 0], [P.px, P.py], [3, 3], [-3, -3]]; if (Math.abs(P.b) > EPS || Math.abs(P.a) > EPS) { const n = hyp(P.a, P.b); if (n > EPS) pts.push([-P.a * P.c / (n * n) + 2, -P.b * P.c / (n * n) + 2]); } if (P.kind === 0 && P.d > 0) pts.push([-P.d, -P.d], [P.d, P.d]); return pts; },
  valid: P => fin(P.a, P.b, P.c, P.d, P.k1, P.k2, P.k3, P.px, P.py) && hyp(P.a, P.b) > EPS && hyp(P.k1, P.k2) > EPS,
  draw(g, t, C, lv, P) {
    const e = ease(seg(t, .04, .2)), f = ease(seg(t, .3, .85)), n = hyp(P.a, P.b), ux = -P.b / n, uy = P.a / n; let txt, k = 0;
    g.LL(P.a, P.b, P.c, C.ink, 3.5, null, e); g.D(0, 0, C.ink, 4); g.T('O', 0, 0, C.ink, { dx: -11, dy: 12, size: 12 });
    const test = reflOf(P, P.px, P.py);
    if (P.kind === 0) {
      const o = foot0(P), ok = o.h2 > -1e-9, d = P.d;
      circ(g, 0, 0, d, C.faint, 2, ease(seg(t, .2, .5)), [6, 5], 1);
      if (ok && t > .5) {
        [1, -1].forEach(sg => { if (sg === -1 && o.h < 1e-9) return; const F = [o.Fo[0] + sg * o.h * ux, o.Fo[1] + sg * o.h * uy]; g.D(F[0], F[1], C.g, 7); g.LL(ux, uy, -(F[0] * ux + F[1] * uy), C.a, 4, null, ease(seg(t, .55, .8))); if (t >= .85) g.T('F' + (sg > 0 ? '₁' : '₂'), F[0], F[1], C.g, { dx: 12 * -uy, dy: 14, size: 13 }); });
        // lines perpendicular to L through the two feet: n·(x, y) = ... is drawn above with direction (ux, uy)
      }
      g.D(P.px, P.py, C.c, 7); g.T('P', P.px, P.py, C.c, { dx: 12, dy: -12, size: 14 }); if (t > .2) { g.L(P.px, P.py, test.F[0], test.F[1], C.c, 2, [5, 4]); g.D(test.F[0], test.F[1], C.c, 5); g.T('|OF| = ' + fmt(hyp(test.F[0], test.F[1]), 2), test.F[0], test.F[1], C.c, { dy: 16, size: 11 }); }
      k = t < .2 ? 0 : t < .5 ? 1 : t < .8 ? 2 : 3;
      txt = pick(lv, ['The line L, the origin O, and a test point P with its foot F (the nearest point of L to P).', 'We want |OF| = ' + fmt(d) + '. Draw the circle of radius ' + fmt(d) + ' round O.', ok ? 'The circle meets L at ' + (o.h < 1e-9 ? 'one point' : 'two points') + ' F: those are the only allowed feet.' : 'The circle never reaches L, so no foot can be that close to O.',
        ok ? 'P must sit straight above or below those feet: the locus is ' + (o.h < 1e-9 ? 'one line' : 'two lines') + ' at right angles to L.' : 'There is no locus.'],
      ['L: ' + eqStr(P.a, P.b, P.c) + ', foot F(P) = P − t(a, b), t = (ax + by + c)/(a² + b²).', '|OF| = ' + fmt(d) + '. The foot lies on L, so F = F₀ + s·u with F₀ = ' + ptS(o.Fo[0], o.Fo[1]) + ' (nearest point of L to O) and |F₀| = ' + fmt(o.p0, 3) + '.', ok ? 's² = d² − |F₀|² = ' + fmt(o.h2) + ' ⇒ s = ±' + fmt(o.h, 3) + '.' : 's² = d² − |F₀|² = ' + fmt(o.h2) + ' < 0.',
        ok ? 'P has foot F₁ or F₂, so −bx + ay = ±s·√(a² + b²) = ±' + fmt(o.h * o.n, 3) + '.' : 'No real locus.'])[k];
    } else {
      const Kl = { a: P.k1, b: P.k2, c: P.k3 }; g.LL(P.k1, P.k2, P.k3, C.c, 3, null, e);
      if (P.kind === 1) {
        const R = reflLine(P), nk = hyp(P.k1, P.k2), span = Math.max(g.b.x1 - g.b.x0, g.b.y1 - g.b.y0) * .6, bcx = (g.b.x0 + g.b.x1) / 2, bcy = (g.b.y0 + g.b.y1) / 2, v0 = (P.k1 * bcx + P.k2 * bcy + P.k3) / (nk * nk), f0 = [bcx - P.k1 * v0, bcy - P.k2 * v0], dk = [-P.k2 / nk, P.k1 / nk];
        const Qs = [f0[0] + dk[0] * span * (2 * f - 1), f0[1] + dk[1] * span * (2 * f - 1)], rr = reflOf(P, Qs[0], Qs[1]).Q;
        if (hyp(R.a, R.b) > 1e-9 && t > .3) g.LL(R.a, R.b, R.c, C.a, 4, null, ease(seg(t, .3, .9)));
        if (t > .25) { g.L(Qs[0], Qs[1], rr[0], rr[1], C.faint, 2, [5, 4]); g.D(Qs[0], Qs[1], C.c, 7); g.T('Q on K', Qs[0], Qs[1], C.c, { dy: -16, size: 11 }); g.D(rr[0], rr[1], C.a, 8); g.T('P', rr[0], rr[1], C.a, { dx: 12, dy: 13, size: 14 }); }
        const on = Math.abs(P.k1 * test.Q[0] + P.k2 * test.Q[1] + P.k3) < 1e-6; g.D(P.px, P.py, on ? C.g : C.ink, 7); g.T('test P' + (on ? ' ✓' : ''), P.px, P.py, on ? C.g : C.ink, { dy: -16, size: 11 });
        k = t < .25 ? 0 : t < .9 ? 1 : 2;
        txt = pick(lv, ['The mirror line L (black) and the fixed line K (blue).', 'Pick any point Q on K. Its mirror image in L is a point P: that P is allowed.', 'All such P lie on the mirror image of K: the line ' + eqStr(R.a, R.b, R.c) + ' (orange).'],
          ['L: ' + eqStr(P.a, P.b, P.c) + ';  K: ' + eqStr(P.k1, P.k2, P.k3) + '.', 'Q = P − 2t(a, b) must satisfy K:  k₁x_Q + k₂y_Q + k₃ = 0, with x_Q, y_Q linear in x and y.', 'Substituting gives the line ' + eqStr(R.a, R.b, R.c) + ' (the reflection of K in L).'])[k];
      } else {
        const X = intersect({ a1: P.a, b1: P.b, c1: P.c, a2: P.k1, b2: P.k2, c2: P.k3 });
        if (X) {
          g.LL(ux, uy, -(ux * X[0] + uy * X[1]), C.a, 4, null, ease(seg(t, .3, .8))); const s = 2.6 * (2 * f - 1), p = [X[0] + P.a / n * s, X[1] + P.b / n * s], q2 = [X[0] - P.a / n * s, X[1] - P.b / n * s];
          if (t > .3) { g.L(p[0], p[1], q2[0], q2[1], C.faint, 2, [5, 4]); g.D(p[0], p[1], C.a, 8); g.T('P', p[0], p[1], C.a, { dx: 12, dy: -12, size: 14 }); g.D(q2[0], q2[1], C.b, 6); g.T('Q', q2[0], q2[1], C.b, { dx: 12, dy: 12, size: 13 }); }
          g.D(X[0], X[1], C.g, 8); g.T('X = M', X[0], X[1], C.g, { dx: 24, dy: 16, size: 12 });
        }
        const on = X && Math.abs(P.k1 * test.F[0] + P.k2 * test.F[1] + P.k3) < 1e-6; g.D(P.px, P.py, on ? C.g : C.ink, 7); g.T('test P' + (on ? ' ✓' : ''), P.px, P.py, on ? C.g : C.ink, { dy: 18, size: 11 });
        k = t < .25 ? 0 : t < .8 ? 1 : 2;
        txt = pick(lv, ['The mirror line L (black) and the fixed line K (blue).', 'The middle of P and its mirror image Q is always the foot of the perpendicular, so it is always on L.', X ? 'It must also be on K, so it can only be the crossing point X of L and K. P can be anywhere on the perpendicular to L through X.' : 'L and K are parallel, so they never cross: no point can satisfy both.'],
          ['M = foot of P on L, so M ∈ L always.', 'We also need M ∈ K, so M = X = L ∩ K' + (X ? ' = ' + ptS(X[0], X[1]) : ' (parallel: none)') + '.', X ? 'P lies on the line through X perpendicular to L: −bx + ay = −bX_x + aX_y.' : 'L ∥ K: no locus (or all points if K = L).'])[k];
      }
    }
    return txt;
  },
  out(P, lv) {
    let s;
    if (P.kind === 0) {
      const o = foot0(P), n = o.n;
      if (o.h2 < -1e-9) s = 'No real locus: the foot of a perpendicular on L is never as close as d = ' + fmt(P.d) + ' to the origin (the nearest foot is ' + fmt(o.p0, 4) + ')';
      else { const v = o.h * n, ax_ = Math.abs(P.b) < 1e-9 ? 'y = ' + (o.h < 1e-9 ? '0' : '±' + fmt(v / Math.abs(P.a))) + ' (horizontal)' : Math.abs(P.a) < 1e-9 ? 'x = ' + (o.h < 1e-9 ? '0' : '±' + fmt(v / Math.abs(P.b))) + ' (vertical)' : '';
        s = 'Locus: ' + (o.h < 1e-9 ? 'one line' : 'two lines') + ' perpendicular to L: ' + eqStr(-P.b, P.a, -v) + (o.h < 1e-9 ? '' : ' and ' + eqStr(-P.b, P.a, v)) + (ax_ ? '  i.e. ' + ax_ : ''); }
    } else if (P.kind === 1) { const R = reflLine(P); s = 'Locus: the reflection of K (' + eqStr(P.k1, P.k2, P.k3) + ') in L, that is ' + eqStr(R.a, R.b, R.c); }
    else { const X = intersect({ a1: P.a, b1: P.b, c1: P.c, a2: P.k1, b2: P.k2, c2: P.k3 }); s = X ? 'Locus: the line perpendicular to L through X = L ∩ K = ' + ptS(X[0], X[1]) + ', that is ' + eqStr(-P.b, P.a, P.b * X[0] - P.a * X[1]) : 'L and K are parallel: no point P can have its midpoint on both (no locus, or every point if K is L)'; }
    const r = reflOf(P, P.px, P.py); return s + ';  test point ' + ptS(P.px, P.py) + ': foot F = ' + ptS(r.F[0], r.F[1]) + ', reflection Q = ' + ptS(r.Q[0], r.Q[1]);
  } });
MORE.extras.l5refl = { chip: 'Foot and reflection', marks: [0, .2, .5, .8], ranges: { a: [-6, 6, 1], b: [-6, 6, 1], c: [-10, 10, 1], d: [0, 8, .5], k1: [-6, 6, 1], k2: [-6, 6, 1], k3: [-10, 10, 1], px: R8, py: R8 },
  handles: P => [{ k: 'P', x: P.px, y: P.py, label: 'P' }], drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
  challenges: [{ id: 'l5-refl-two', text: T2('Choose the first condition and make it give two separate lines.', 'Choose the first condition with d greater than the distance from O to L.'), hint: T2('The circle of radius d must cut L in two places, so d must be bigger than how far L is from O.', 'd > |c|/√(a² + b²).'), check: P => P.kind === 0 && foot0(P).h2 > 1e-9 },
    { id: 'l5-refl-none', text: T2('Choose the first condition and make it impossible (no locus).', 'Choose the first condition with d < |c|/√(a² + b²).'), hint: T2('Move L far from O (increase c) and keep d small.', 'Try c = 6, d = 2.'), check: P => P.kind === 0 && foot0(P).h2 < -1e-9 },
    { id: 'l5-refl-swap', text: T2('Choose the second condition and make the locus exactly the line y = x.', 'Choose the second condition so that the reflection of K in L is y = x.'), hint: T2('Let L be the y-axis (x = 0) and K be y = −x, that is x + y = 0. Its mirror image is y = x.', 'a = 1, b = 0, c = 0, K: x + y = 0.'), check: P => { if (P.kind !== 1) return false; const R = reflLine(P); return Math.abs(R.a + R.b) < 1e-9 && Math.abs(R.c) < 1e-9 && Math.abs(R.a) > EPS; } },
    { id: 'l5-refl-par', text: T2('Choose the third condition and make L and K parallel (no point works).', 'Choose the third condition with L ∥ K.'), hint: T2('Give K the same slope as L, for example a = 1, b = 1 and K: x + y = 3.', 'a·k₂ = b·k₁ and different constants.'), check: P => P.kind === 2 && Math.abs(P.a * P.k2 - P.b * P.k1) < 1e-9 } ] };
MORE.hooks.l5refl = 'Stand in front of a plane mirror: your image is as far behind the glass as you are in front.';
BINDINGS.push({ scene: 'l5refl', ids: ['reflA', 'reflB', 'reflC', 'reflD', 'reflX', 'reflY'], text: ['reflFixedLine'],
  get: (v, rr, tx) => { const kind = Math.max(0, ['footDistance', 'reflectionPoint', 'midpointTrace'].indexOf(rr('reflectionType'))), L = lineOf(tx('reflFixedLine')); if (!L && kind > 0) return null; const K = L || { a: 1, b: 1, c: 0 }; return { a: v[0], b: v[1], c: v[2], d: v[3], k1: K.a, k2: K.b, k3: K.c, px: v[4], py: v[5], kind }; },
  set: P => ({ reflA: P.a, reflB: P.b, reflC: P.c, reflX: P.px, reflY: P.py }) });

// ---- 8. Moving axes: a point fixed in the moving axes ----
const movW = (P, th, h, k) => [h + P.X * Math.cos(th) - P.Y * Math.sin(th), k + P.X * Math.sin(th) + P.Y * Math.cos(th)];
const movHK = P => (P.kind === 1 ? [0, 0] : [P.h, P.k]);
mk('l5mov', 5, 'Locus of a point fixed in moving axes', 'Class 11–12', [['h', 'h', 2], ['k', 'k', 1], ['th', 'θ (degrees)', 30], ['X', 'X', 3], ['Y', 'Y', 2], ['tx', 'test x', 5], ['ty', 'test y', 3]],
  ['Slide or turn the axes. A point glued to the moving axes goes with them, and the path it draws is the locus.', 'x = h + X cos θ − Y sin θ,  y = k + X sin θ + Y cos θ.  Translation: one point.  Rotation (θ varies): the circle x² + y² = X² + Y².  Both: the circle (x − h)² + (y − k)² = X² + Y².'], {
  selects: { kind: ['Movement of the axes', ['translation only', 'rotation only', 'translation and rotation']] },
  fit: P => { const [h, k] = movHK(P), R = hyp(P.X, P.Y), pts = [[h - R - 1, k - R - 1], [h + R + 1, k + R + 1], [P.tx, P.ty], [0, 0]]; if (P.kind === 0) pts.push([h + P.X, k + P.Y]); return pts; },
  valid: P => fin(P.h, P.k, P.th, P.X, P.Y, P.tx, P.ty),
  draw(g, t, C, lv, P) {
    const [h, k] = movHK(P), th = P.th * D2R, R = hyp(P.X, P.Y); let ox = 0, oy = 0, al = 0, k_ = 0, txt;
    const eT = ease(seg(t, .12, .4)), eR = ease(seg(t, .4, .62)), eS = ease(seg(t, .62, .92));
    if (P.kind === 0) { ox = h * eT; oy = k * eT; }
    else if (P.kind === 1) { al = th * ease(seg(t, .12, .4)); }
    else { ox = h * eT; oy = k * eT; al = th * eR; }
    let sweepAng = null; if (P.kind > 0 && t > (P.kind === 1 ? .4 : .62)) { const f = ease(seg(t, P.kind === 1 ? .4 : .62, .92)); sweepAng = th + TAU * f; al = sweepAng; if (P.kind === 1) al = sweepAng; }
    const cx = P.kind === 1 ? 0 : h, cy = P.kind === 1 ? 0 : k, fr = P.kind === 0 ? 0 : (t > (P.kind === 1 ? .4 : .62) ? ease(seg(t, P.kind === 1 ? .4 : .62, .92)) : 0);
    if (P.kind > 0) { circ(g, cx, cy, R, C.faint, 1.6, 1, [5, 4]); if (fr > 0) { g.ctx.save(); g.ctx.strokeStyle = C.a; g.ctx.lineWidth = 4; g.ctx.lineCap = 'round'; g.ctx.beginPath(); g.ctx.arc(g.X(cx), g.Y(cy), R * g.sc, -Math.atan2(P.Y, P.X) - th, -Math.atan2(P.Y, P.X) - th - TAU * fr, true); g.ctx.stroke(); g.ctx.restore(); } }
    const ex = [Math.cos(al), Math.sin(al)], ey = [-Math.sin(al), Math.cos(al)], Lh = Math.max(R, 3) + 1.2;
    if (t > .02) { E.kit.arrow(g, ox - ex[0] * Lh * .5, oy - ex[1] * Lh * .5, ox + ex[0] * Lh, oy + ex[1] * Lh, C.c, 2.5, .9); E.kit.arrow(g, ox - ey[0] * Lh * .5, oy - ey[1] * Lh * .5, ox + ey[0] * Lh, oy + ey[1] * Lh, C.c, 2.5, .9); g.T('X', ox + ex[0] * (Lh + .4), oy + ex[1] * (Lh + .4), C.c, { size: 13 }); g.T('Y', ox + ey[0] * (Lh + .4), oy + ey[1] * (Lh + .4), C.c, { size: 13 }); g.D(ox, oy, C.c, 5); g.T("O′", ox, oy, C.c, { dx: -13, dy: 13, size: 12 }); }
    const W = [ox + P.X * ex[0] + P.Y * ey[0], oy + P.X * ex[1] + P.Y * ey[1]];
    if (t > .02) { g.L(ox, oy, ox + P.X * ex[0], oy + P.X * ex[1], C.g, 2, [5, 4]); g.L(ox + P.X * ex[0], oy + P.X * ex[1], W[0], W[1], C.g, 2, [5, 4]); g.D(W[0], W[1], C.a, 9); g.T('P(' + fmt(P.X) + ', ' + fmt(P.Y) + ') in moving axes', W[0], W[1], C.a, { dy: -20, size: 11 }); }
    if (t > .92) { const on = P.kind === 0 ? hyp(P.tx - (h + P.X), P.ty - (k + P.Y)) < 1e-9 : Math.abs(hyp(P.tx - cx, P.ty - cy) - R) < 1e-9; g.D(P.tx, P.ty, on ? C.g : C.ink, 7); g.T('test' + (on ? ' ✓' : ' ✗'), P.tx, P.ty, on ? C.g : C.ink, { dy: -16, size: 11 }); }
    const k2 = t < .12 ? 0 : t < (P.kind === 2 ? .62 : .4) ? 1 : t < .92 ? 2 : 3;
    const loc = P.kind === 0 ? movOut(P) : movOut(P);
    return pick(lv, ['The fixed axes (black grid) and a second set of axes (blue) that can move. P sits at (X, Y) = ' + ptS(P.X, P.Y) + ' on the blue axes.',
      P.kind === 0 ? 'Slide the blue axes so that their origin O′ moves to (' + fmt(h) + ', ' + fmt(k) + '). P is glued to them and slides too.' : P.kind === 1 ? 'Turn the blue axes by ' + fmt(P.th) + '°. P turns round the origin.' : 'First slide O′ to (' + fmt(h) + ', ' + fmt(k) + '), then turn the blue axes. P turns round O′.',
      P.kind === 0 ? 'The axes stopped, so P stopped too.' : 'Keep turning the axes all the way round: P marks out its path.', 'The locus: ' + loc],
    ['In the moving system P = (X, Y) = ' + ptS(P.X, P.Y) + ';  x = h + X cos θ − Y sin θ,  y = k + X sin θ + Y cos θ.', P.kind === 0 ? 'Translation: h = ' + fmt(h) + ', k = ' + fmt(k) + ', θ = 0, so x = h + X, y = k + Y.' : P.kind === 1 ? 'Rotation by θ = ' + fmt(P.th) + '° about the origin.' : 'h = ' + fmt(h) + ', k = ' + fmt(k) + ', θ = ' + fmt(P.th) + '°.',
      P.kind === 0 ? 'P = (' + fmt(h) + ' + ' + fmt(P.X) + ', ' + fmt(k) + ' + ' + fmt(P.Y) + ') = ' + ptS(h + P.X, k + P.Y) + '.' : '(x − h)² + (y − k)² = (X cos θ − Y sin θ)² + (X sin θ + Y cos θ)² = X² + Y² = ' + fmt(R * R) + '.', loc])[k2];
  },
  out: (P, lv) => 'Locus: ' + movOut(P) });
function movOut(P) {
  const [h, k] = movHK(P), R = hyp(P.X, P.Y), on = P.kind === 0 ? hyp(P.tx - (h + P.X), P.ty - (k + P.Y)) < 1e-9 : Math.abs(hyp(P.tx - h, P.ty - k) - R) < 1e-9;
  const base = P.kind === 0 ? 'Point (' + fmt(h + P.X) + ', ' + fmt(k + P.Y) + ')' : P.kind === 1 ? 'x² + y² = ' + fmt(R) + '² → Circle with center at origin, radius ' + fmt(R) : sqr('x', h) + ' + ' + sqr('y', k) + ' = ' + fmt(R) + '² → Circle with center ' + ptS(h, k) + ', radius ' + fmt(R);
  return base + ';  test point ' + ptS(P.tx, P.ty) + (on ? ' LIES ON the locus' : ' does NOT lie on the locus');
}
MORE.extras.l5mov = { chip: 'Moving axes', marks: [0, .12, .4, .92], ranges: { h: R8, k: R8, th: [-180, 180, 15], X: R8, Y: R8, tx: R8, ty: R8 },
  handles: P => { const [h, k] = movHK(P), w = movW(P, P.kind === 0 ? 0 : P.th * D2R, h, k), hs = [{ k: 'T', x: P.tx, y: P.ty, label: 'test' }]; if (P.kind !== 1) hs.push({ k: 'O', x: h, y: k, label: "O′" }); if (P.kind === 0) hs.push({ k: 'P', x: w[0], y: w[1], label: 'P' }); return hs; },
  drag: (P, k, x, y) => { if (k === 'T') return Object.assign({}, P, { tx: x, ty: y }); if (k === 'O') return Object.assign({}, P, { h: x, k: y }); const th = P.kind === 0 ? 0 : P.th * D2R, dx = x - P.h, dy = y - P.k; return Object.assign({}, P, { X: dx * Math.cos(th) + dy * Math.sin(th), Y: -dx * Math.sin(th) + dy * Math.cos(th) }); },
  challenges: [{ id: 'l5-mov-origin', text: T2('Choose “translation and rotation” and make the circle’s centre the point (4, 3).', 'Choose translation and rotation with (h, k) = (4, 3).'), hint: T2('The circle is centred where the moving origin O′ ends up.', 'The centre of the locus circle is (h, k).'), check: P => P.kind === 2 && Math.abs(P.h - 4) < 1e-9 && Math.abs(P.k - 3) < 1e-9 },
    { id: 'l5-mov-r5', text: T2('Choose “rotation only” and make the circle’s radius 5.', 'Choose rotation only with √(X² + Y²) = 5.'), hint: T2('Radius = distance of P from O′. Try X = 3, Y = 4.', 'X = 3, Y = 4 gives √25 = 5.'), check: P => P.kind === 1 && Math.abs(hyp(P.X, P.Y) - 5) < 1e-9 },
    { id: 'l5-mov-test', text: T2('Choose “rotation only” and put the test point on the circle.', 'Choose rotation only with x² + y² = X² + Y² at the test point.'), hint: T2('The circle has radius √13 ≈ 3.6. A point like (3, 2) is on it.', 'Test point (3, 2) with X = 3, Y = 2.'), check: P => P.kind === 1 && Math.abs(hyp(P.tx, P.ty) - hyp(P.X, P.Y)) < 1e-9 && hyp(P.X, P.Y) > EPS }] };
MORE.hooks.l5mov = 'A sticker on a car wheel: while the wheel turns, what path does the sticker take?';
BINDINGS.push({ scene: 'l5mov', ids: ['fixedX', 'fixedY', 'movingTestX', 'movingTestY', 'transH', 'transK', 'rotTheta', 'genH', 'genK', 'genTheta'],
  get: (v, rr) => { const kind = Math.max(0, ['translation', 'rotation', 'general'].indexOf(rr('movingType'))); return { X: v[0], Y: v[1], tx: v[2], ty: v[3], h: kind === 0 ? v[4] : kind === 2 ? v[7] : 0, k: kind === 0 ? v[5] : kind === 2 ? v[8] : 0, th: kind === 1 ? v[6] : kind === 2 ? v[9] : 0, kind }; },
  set: P => (P.kind === 0 ? { fixedX: P.X, fixedY: P.Y, movingTestX: P.tx, movingTestY: P.ty, transH: P.h, transK: P.k } : P.kind === 1 ? { fixedX: P.X, fixedY: P.Y, movingTestX: P.tx, movingTestY: P.ty } : { fixedX: P.X, fixedY: P.Y, movingTestX: P.tx, movingTestY: P.ty, genH: P.h, genK: P.k }) });

// ======================= Tab 6: Families of lines =======================
// ---- 9. All lines through a point ----
mk('f6thru', 6, 'Family of lines through a point', 'Class 9–12', [['x1', 'x₁', 2], ['y1', 'y₁', 3], ['m1', 'm₁', 1], ['m2', 'm₂', -2], ['m3', 'm₃', .5]],
  ['Pin a ruler at one point and turn it: every position is a line of the family. Only the slope m changes.', 'y − y₁ = m(x − x₁).  Each value of m gives one member; the vertical line x = x₁ (m → ∞) is a member too.'], {
  fit: P => [[P.x1 - 4.5, P.y1 - 3.5], [P.x1 + 4.5, P.y1 + 3.5], [0, 0]],
  valid: P => fin(P.x1, P.y1, P.m1, P.m2, P.m3),
  draw(g, t, C, lv, P) {
    const e = ease(seg(t, .08, .6)), ang = lerp(-1.25, 1.25, e), ms = [P.m1, P.m2, P.m3], cols = [C.c, C.g, C.b];
    if (t > .08 && t < .62) g.LL(Math.tan(ang), -1, P.y1 - Math.tan(ang) * P.x1, C.a, 3.5);
    if (t >= .62) ms.forEach((m, i) => { g.LL(m, -1, P.y1 - m * P.x1, cols[i], 3.5, null, ease(seg(t, .62 + i * .08, .7 + i * .08))); const xx = P.x1 + 2; g.T('m = ' + fmt(m), xx, P.y1 + 2 * m, cols[i], { dx: 6, dy: m >= 0 ? -14 : 14, size: 12 }); });
    if (t >= .88) g.LL(1, 0, -P.x1, C.faint, 2, [6, 5]);
    g.D(P.x1, P.y1, C.ink, 8); g.T('P' + ptS(P.x1, P.y1), P.x1, P.y1, C.ink, { dx: -4, dy: 20, size: 13 });
    const k = t < .08 ? 0 : t < .62 ? 1 : t < .88 ? 2 : 3, cur = Math.tan(ang);
    return pick(lv, ['A fixed point P' + ptS(P.x1, P.y1) + '.', 'Turn a line round P. The slope changes (now m = ' + fmt(cur, 2) + ') but the line always passes through P.', 'Three members: slopes ' + ms.map(fmt).join(', ') + '. They all cross at P.', 'A vertical line through P (x = ' + fmt(P.x1) + ') belongs to the family too. Its slope does not exist.'],
      ['y − ' + fmt(P.y1) + ' = m(x − ' + fmt(P.x1) + ').', 'm is the parameter: m = ' + fmt(cur, 2) + ' gives ' + slopeEq(cur, P.y1 - cur * P.x1) + '.', ms.map((m, i) => 'm' + '₁₂₃'[i] + ' = ' + fmt(m) + ': ' + slopeEq(m, P.y1 - m * P.x1)).join(';  '), 'm → ∞ gives x = ' + fmt(P.x1) + '.'])[k];
  },
  out: (P, lv) => 'y' + sb(P.y1) + ' = m(x' + sb(P.x1) + ');   ' + [P.m1, P.m2, P.m3].map((m, i) => 'm = ' + fmt(m) + ': ' + slopeEq(m, P.y1 - m * P.x1)).join(';  ') });
MORE.extras.f6thru = { chip: 'Lines through a point', marks: [0, .08, .62, .88], ranges: { x1: R8, y1: R8, m1: [-5, 5, .5], m2: [-5, 5, .5], m3: [-5, 5, .5] },
  handles: P => [{ k: 'P', x: P.x1, y: P.y1, label: 'P' }, { k: '1', x: P.x1 + 2, y: P.y1 + 2 * P.m1, label: 'm₁' }, { k: '2', x: P.x1 + 2, y: P.y1 + 2 * P.m2, label: 'm₂' }, { k: '3', x: P.x1 + 2, y: P.y1 + 2 * P.m3, label: 'm₃' }],
  drag: (P, k, x, y) => (k === 'P' ? Object.assign({}, P, { x1: x, y1: y }) : Object.assign({}, P, { ['m' + k]: (y - P.y1) / 2 })),
  challenges: [{ id: 'f6-thru-origin', text: T2('Make one of the three lines pass through the origin (0, 0).', 'Choose m so that y₁ − m·x₁ = 0 for one member.'), hint: T2('The line from P(2, 3) to the origin goes 3 up for every 2 across: slope 1.5.', 'm = y₁/x₁ = 1.5.'), check: P => Math.abs(P.x1) > EPS && [P.m1, P.m2, P.m3].some(m => Math.abs(P.y1 - m * P.x1) < 1e-9) },
    { id: 'f6-thru-flat', text: T2('Make one of the three lines perfectly flat.', 'Make one slope equal to 0.'), hint: T2('A flat line has slope 0.', 'm = 0 gives y = y₁.'), check: P => [P.m1, P.m2, P.m3].some(m => Math.abs(m) < 1e-9) },
    { id: 'f6-thru-perp', text: T2('Make line 1 and line 2 meet at a right angle.', 'Choose m₁ and m₂ with m₁·m₂ = −1.'), hint: T2('Perpendicular slopes multiply to −1, for example 2 and −0.5.', 'm₁ = 2, m₂ = −1/2.'), check: P => Math.abs(P.m1 * P.m2 + 1) < 1e-9 }] };
MORE.hooks.f6thru = 'A lighthouse beam turns round and round: every beam position is a line through the same point.';
BINDINGS.push({ scene: 'f6thru', ids: ['ftpX', 'ftpY', 'ftpM1', 'ftpM2', 'ftpM3'], get: v => ({ x1: v[0], y1: v[1], m1: v[2], m2: v[3], m3: v[4] }), set: P => ({ ftpX: P.x1, ftpY: P.y1, ftpM1: P.m1, ftpM2: P.m2, ftpM3: P.m3 }) });

// ---- 10. Lines with the same slope ----
mk('f6par', 6, 'Family of parallel lines', 'Class 9–12', [['m', 'slope m', 2], ['c1', 'c₁', -2], ['c2', 'c₂', 1], ['c3', 'c₃', 4]],
  ['Keep the slope the same and slide the line up or down: you get parallel lines like the rails of a railway.', 'y = mx + c with m fixed. Distance between two members: |c₂ − c₁| / √(1 + m²).'], {
  fit: P => [[-3.5, Math.min(P.c1, P.c2, P.c3) - 3], [3.5, Math.max(P.c1, P.c2, P.c3) + 3], [0, 0]],
  valid: P => fin(P.m, P.c1, P.c2, P.c3),
  draw(g, t, C, lv, P) {
    const cs = [P.c1, P.c2, P.c3], cols = [C.c, C.g, C.b], k1 = Math.sqrt(1 + P.m * P.m), e = ease(seg(t, .1, .5)), cc = lerp(P.c1, P.c3, e);
    if (t < .52) g.LL(P.m, -1, cc, C.a, 3.5);
    if (t >= .5) cs.forEach((c, i) => { g.LL(P.m, -1, c, cols[i], 3.5, null, ease(seg(t, .5 + i * .06, .58 + i * .06))); g.D(0, c, cols[i], 5); g.T('c = ' + fmt(c), 0, c, cols[i], { dx: -40, size: 12 }); });
    if (t >= .75) [[0, 1], [1, 2]].forEach(([i, j], q) => {
      const xm = [2.4, -2.4][q], ym = P.m * xm + cs[i], dc = cs[j] - cs[i], Fx = xm - P.m * dc / (1 + P.m * P.m), Fy = ym + dc / (1 + P.m * P.m);
      g.L(xm, ym, Fx, Fy, C.a, 3); g.right(Fx, Fy, [1, P.m], [xm - Fx, ym - Fy], 9); g.T('d = ' + fmt(Math.abs(dc) / k1, 3), (xm + Fx) / 2, (ym + Fy) / 2, C.a, { dx: q === 0 ? 40 : -40, size: 12 });
    });
    const k = t < .1 ? 0 : t < .5 ? 1 : t < .75 ? 2 : 3;
    return pick(lv, ['A line with slope ' + fmt(P.m) + '.', 'Slide it up or down: only c (where it cuts the y-axis) changes, the tilt stays ' + fmt(P.m) + '.', 'Three lines with c = ' + cs.map(fmt).join(', ') + '. They are parallel, so they never meet.', 'The gap between neighbouring lines (measured straight across): ' + fmt(Math.abs(P.c2 - P.c1) / k1, 3) + ' and ' + fmt(Math.abs(P.c3 - P.c2) / k1, 3) + '.'],
      ['y = ' + (Math.abs(P.m) < EPS ? '' : fmt(P.m) + 'x + ') + 'c, m = ' + fmt(P.m) + ' is fixed.', 'c is the parameter (the y-intercept): c = ' + fmt(cc, 2) + ' now.', cs.map((c, i) => 'c' + '₁₂₃'[i] + ' = ' + fmt(c) + ': ' + slopeEq(P.m, c)).join(';  '), 'd₁₂ = |c₂ − c₁|/√(1 + m²) = ' + fmt(Math.abs(P.c2 - P.c1)) + '/' + fmt(k1, 3) + ' = ' + fmt(Math.abs(P.c2 - P.c1) / k1, 4) + ';  d₂₃ = ' + fmt(Math.abs(P.c3 - P.c2) / k1, 4) + '.'])[k];
  },
  out: (P, lv) => { const k = Math.sqrt(1 + P.m * P.m); return 'y = ' + (Math.abs(P.m) < EPS ? '' : fmt(P.m) + 'x + ') + 'c;  d₁₂ = ' + fmt(Math.abs(P.c2 - P.c1) / k) + ',  d₂₃ = ' + fmt(Math.abs(P.c3 - P.c2) / k); } });
MORE.extras.f6par = { chip: 'Parallel family', marks: [0, .1, .5, .75], ranges: { m: [-5, 5, .5], c1: [-8, 8, 1], c2: [-8, 8, 1], c3: [-8, 8, 1] },
  handles: P => [{ k: '1', x: 0, y: P.c1, label: 'c₁' }, { k: '2', x: 0, y: P.c2, label: 'c₂' }, { k: '3', x: 0, y: P.c3, label: 'c₃' }, { k: 'M', x: 2, y: 2 * P.m + P.c1, label: 'm' }],
  drag: (P, k, x, y) => (k === 'M' ? Object.assign({}, P, { m: (y - P.c1) / 2 }) : Object.assign({}, P, { ['c' + k]: y })),
  challenges: [{ id: 'f6-par-one', text: T2('Make lines 1 and 2 exactly 1 unit apart.', 'Choose m and the c values so that |c₂ − c₁| / √(1 + m²) = 1.'), hint: T2('The easiest case is a flat line (slope 0), then the gap is just the difference of c.', 'm = 0 and |c₂ − c₁| = 1.'), check: P => Math.abs(Math.abs(P.c2 - P.c1) / Math.sqrt(1 + P.m * P.m) - 1) < 1e-9 },
    { id: 'f6-par-origin', text: T2('Make one of the lines pass through the origin.', 'Make one of the c values 0.'), hint: T2('A line through the origin has c = 0.', 'c = 0 ⇒ y = mx.'), check: P => [P.c1, P.c2, P.c3].some(c => Math.abs(c) < 1e-9) },
    { id: 'f6-par-same', text: T2('Make two of the lines the very same line.', 'Make two c values equal.'), hint: T2('Give two of the lines the same c.', 'c₁ = c₃, for example.'), check: P => Math.abs(P.c1 - P.c2) < 1e-9 || Math.abs(P.c2 - P.c3) < 1e-9 || Math.abs(P.c1 - P.c3) < 1e-9 }] };
MORE.hooks.f6par = 'The rails of a railway always keep the same slope and never meet.';
BINDINGS.push({ scene: 'f6par', ids: ['fpdM', 'fpdC1', 'fpdC2', 'fpdC3'], get: v => ({ m: v[0], c1: v[1], c2: v[2], c3: v[3] }), set: P => ({ fpdM: P.m, fpdC1: P.c1, fpdC2: P.c2, fpdC3: P.c3 }) });

// ---- 11. Intercepts with a constant sum or a constant product ----
const icB = (P, a) => (P.kind === 0 ? P.k - a : P.k / a);
const icOK = P => fin(P.k, P.a1, P.a2, P.a3) && [P.a1, P.a2, P.a3].every(a => Math.abs(a) > EPS && Math.abs(icB(P, a)) > EPS && isFinite(icB(P, a)));
const icAs = P => (P.kind === 0 ? (u => P.k * (.08 + .84 * u)) : (u => (Math.sign(P.k) || 1) * Math.sqrt(Math.abs(P.k)) * Math.pow(10, u - .5)));
const icTan = (P, a) => (P.kind === 0 ? [a * a / P.k, icB(P, a) * icB(P, a) / P.k] : [a / 2, icB(P, a) / 2]);
mk('f6icpt', 6, 'Lines whose intercepts have a fixed sum or product', 'Class 11–12', [['k', 'k', 12], ['a1', 'a₁', 2], ['a2', 'a₂', 3], ['a3', 'a₃', 6]],
  ['A line cuts the axes at a and b. If a + b (or a × b) is always the same number, there are many such lines.', 'x/a + y/b = 1 with a + b = k: the lines touch √x + √y = √k.  With ab = k: the lines touch xy = k/4 and cut a triangle of area k/2.'], {
  selects: { kind: ['Condition', ['a + b = k  (constant sum)', 'ab = k  (constant product)']] },
  fit: P => { const pts = [[0, 0]]; [P.a1, P.a2, P.a3].forEach(a => { const b = icB(P, a); pts.push([a, 0], [0, b]); }); const as = icAs(P); [0, 1].forEach(u => { const a = as(u), b = icB(P, a); pts.push([a / 2, b / 2]); }); return pts; },
  valid: P => icOK(P),
  draw(g, t, C, lv, P) {
    const as = icAs(P), u = ease(seg(t, .12, .6)), am = as(u), bm = icB(P, am), cols = [C.c, C.g, C.b];
    if (P.kind === 1) { E.kit.implicit(g, (x, y) => x * y - P.k / 4, C.a, 3, ease(seg(t, .6, .9)), 160); }
    else { const pts = []; for (let i = 0; i <= 60; i++) { const a = P.k * i / 60; pts.push([a * a / P.k, (P.k - a) * (P.k - a) / P.k]); } E.kit.poly(g, pts, C.a, 3.5, null, ease(seg(t, .6, .9))); }
    const tr = []; for (let i = 0; i <= 40 * u; i++) tr.push(icTan(P, as(i / 40))); if (tr.length > 1) E.kit.poly(g, tr, C.a, 3.5, null, .9);
    if (t < .62) { g.LL(bm, am, -am * bm, C.a, 3.5); const T = icTan(P, am); g.D(T[0], T[1], C.a, 6); }
    if (t >= .62) [P.a1, P.a2, P.a3].forEach((a, i) => { const b = icB(P, a); g.LL(b, a, -a * b, cols[i], 3, null, ease(seg(t, .62 + i * .08, .7 + i * .08))); g.D(a, 0, cols[i], 5); g.D(0, b, cols[i], 5); g.T('(' + fmt(a) + ', 0)', a, 0, cols[i], { dy: 16, size: 11 }); g.T('(0, ' + fmt(b) + ')', 0, b, cols[i], { dx: 38, size: 11 }); });
    const cond = P.kind === 0 ? 'a + b = ' + fmt(P.k) : 'a × b = ' + fmt(P.k), k = t < .12 ? 0 : t < .62 ? 1 : t < .9 ? 2 : 3, area = Math.abs(P.k) / 2;
    return pick(lv, ['A line cuts the x-axis at a and the y-axis at b.', 'Rule: ' + cond + '. Slide the line: now a = ' + fmt(am, 2) + ', b = ' + fmt(bm, 2) + '. The dot shows where it touches an invisible curve.', 'Three such lines, a = ' + [P.a1, P.a2, P.a3].map(fmt).join(', ') + ', and the curve they all touch.',
      P.kind === 0 ? 'The lines do not share one point; they all touch a curve (a parabola, √x + √y = √' + fmt(P.k) + ').' : 'Every line cuts off a triangle of the same area ' + fmt(area) + ' and touches the curve xy = ' + fmt(P.k / 4) + '.'],
    ['x/a + y/b = 1, ' + cond + (P.kind === 0 ? ', b = k − a.' : ', b = k/a.'), 'a = ' + fmt(am, 2) + ', b = ' + fmt(bm, 2) + '; the tangent point is ' + (P.kind === 0 ? '(a²/k, b²/k)' : 'the midpoint (a/2, b/2)') + ' = ' + ptS(icTan(P, am)[0], icTan(P, am)[1]) + '.',
      [P.a1, P.a2, P.a3].map(a => 'a = ' + fmt(a) + ', b = ' + fmt(icB(P, a))).join(';  ') + '.', P.kind === 0 ? 'Envelope: √x + √y = √k = √' + fmt(P.k) + '.' : 'Envelope: xy = k/4 = ' + fmt(P.k / 4) + ';  area = ½|ab| = ' + fmt(area) + '.'])[k];
  },
  out: (P, lv) => { const ms = [P.a1, P.a2, P.a3].map(a => 'a = ' + fmt(a) + ', b = ' + fmt(icB(P, a))).join(';  '); return P.kind === 0 ? 'x/a + y/(' + fmt(P.k) + ' − a) = 1;  the lines touch √x + √y = √' + fmt(P.k) + '  (' + ms + ')' : 'x/a + ay/' + fmt(P.k) + ' = 1, area = ' + fmt(Math.abs(P.k) / 2) + ';  the lines touch xy = ' + fmt(P.k / 4) + '  (' + ms + ')'; } });
MORE.extras.f6icpt = { chip: 'Fixed sum or product', marks: [0, .12, .62, .9], ranges: { k: [-20, 20, 1], a1: [-12, 12, 1], a2: [-12, 12, 1], a3: [-12, 12, 1] },
  handles: P => [{ k: '1', x: P.a1, y: 0, label: 'a₁' }, { k: '2', x: P.a2, y: 0, label: 'a₂' }, { k: '3', x: P.a3, y: 0, label: 'a₃' }], drag: (P, k, x) => Object.assign({}, P, { ['a' + k]: x }),
  challenges: [{ id: 'f6-icpt-equal', text: T2('Choose the sum option and make one line cut equal pieces on both axes (a = b).', 'Choose a + b = k and a value a = k/2.'), hint: T2('If a and b are equal and add up to k, each is half of k.', 'a = b = k/2.'), check: P => P.kind === 0 && [P.a1, P.a2, P.a3].some(a => Math.abs(a - P.k / 2) < 1e-9 && Math.abs(a) > EPS) },
    { id: 'f6-icpt-area', text: T2('Choose the product option and make every triangle have area 10.', 'Choose ab = k with area ½|k| = 10.'), hint: T2('Area = ½ × a × b = k ÷ 2, so k = 20.', 'k = 20.'), check: P => P.kind === 1 && Math.abs(Math.abs(P.k) / 2 - 10) < 1e-9 },
    { id: 'f6-icpt-twice', text: T2('Make one line where b is twice a.', 'Make a line with b = 2a.'), hint: T2('With a + b = 12, a = 4 gives b = 8.', 'Sum option: a = k/3.'), check: P => [P.a1, P.a2, P.a3].some(a => Math.abs(icB(P, a) - 2 * a) < 1e-9) }] };
MORE.hooks.f6icpt = 'A ladder against a wall that always cuts off the same area of floor and wall: every position is a member of the family.';
BINDINGS.push({ scene: 'f6icpt', ids: ['fsiK', 'fsiA1', 'fsiA2', 'fsiA3'], get: v => ({ k: v[0], a1: v[1], a2: v[2], a3: v[3], kind: 0 }), set: P => ({ fsiK: P.k, fsiA1: P.a1, fsiA2: P.a2, fsiA3: P.a3 }) },
  { scene: 'f6icpt', ids: ['fpiK', 'fpiA1', 'fpiA2', 'fpiA3'], get: v => ({ k: v[0], a1: v[1], a2: v[2], a3: v[3], kind: 1 }), set: P => ({ fpiK: P.k, fpiA1: P.a1, fpiA2: P.a2, fpiA3: P.a3 }) });

// ---- 12. Feet of perpendiculars from a point to the lines of a family ----
const fcIn = P => intersect(P);
const fcLH = (P, n) => { const I = fcIn(P); if (!I) return null; const a = P['a' + n], b = P['b' + n], d = hyp(a, b) || 1; return { k: String(n), x: I[0] + 3 * b / d, y: I[1] - 3 * a / d, label: 'L' + n }; };
mk('f6circ', 6, 'Feet of perpendiculars: a circle on QI', 'Class 11–12', [['a1', 'a₁', 1], ['b1', 'b₁', 1], ['c1', 'c₁', -4], ['a2', 'a₂', 1], ['b2', 'b₂', -1], ['c2', 'c₂', -2], ['qx', 'Q: x', 0], ['qy', 'Q: y', 0]],
  ['Lines through the crossing point I turn like a fan. Drop a perpendicular from Q to each line: the feet lie on a circle.', 'Family L₁ + λL₂ = 0 passes through I. The foot F of Q gives ∠QFI = 90°, so F lies on the circle with diameter QI:  (x − x_Q)(x − x_I) + (y − y_Q)(y − y_I) = 0.'], {
  fit: P => { const I = fcIn(P) || [0, 0], C0 = [(I[0] + P.qx) / 2, (I[1] + P.qy) / 2], r = Math.max(hyp(I[0] - P.qx, I[1] - P.qy) / 2, 1); return [[C0[0] - r * 1.3, C0[1] - r * 1.3], [C0[0] + r * 1.3, C0[1] + r * 1.3], [I[0], I[1]], [P.qx, P.qy]]; },
  valid: P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2, P.qx, P.qy) && hyp(P.a1, P.b1) > EPS && hyp(P.a2, P.b2) > EPS && !!fcIn(P) && hyp(fcIn(P)[0] - P.qx, fcIn(P)[1] - P.qy) > 1e-9,
  draw(g, t, C, lv, P) {
    const I = fcIn(P), Q = [P.qx, P.qy], Cc = [(I[0] + Q[0]) / 2, (I[1] + Q[1]) / 2], r = hyp(I[0] - Q[0], I[1] - Q[1]) / 2, f = ease(seg(t, .3, .88)), phi = lerp(0.2, 0.2 + Math.PI, f);
    g.LL(P.a1, P.b1, P.c1, C.c, 3.2, null, ease(seg(t, .02, .12))); g.LL(P.a2, P.b2, P.c2, C.g, 3.2, null, ease(seg(t, .06, .16)));
    const dx = Math.cos(phi), dy = Math.sin(phi), v = (Q[0] - I[0]) * dx + (Q[1] - I[1]) * dy, F = [I[0] + v * dx, I[1] + v * dy];
    circ(g, Cc[0], Cc[1], r, C.faint, 1.8, 1, [5, 4], t > .3 ? 1 : 0); circ(g, Cc[0], Cc[1], r, C.a, 4, t >= .9 ? 1 : 0.0001);
    const tr = []; for (let i = 0; i <= 80 * f; i++) { const ph = lerp(0.2, 0.2 + Math.PI, i / 80), vv = (Q[0] - I[0]) * Math.cos(ph) + (Q[1] - I[1]) * Math.sin(ph); tr.push([I[0] + vv * Math.cos(ph), I[1] + vv * Math.sin(ph)]); } if (tr.length > 1) E.kit.poly(g, tr, C.a, 3.5);
    if (t > .2) { g.LL(-dy, dx, dy * I[0] - dx * I[1], C.a, 2.5, [7, 5], .8); g.L(Q[0], Q[1], F[0], F[1], C.b, 2.5); g.right(F[0], F[1], [-dx, -dy], [Q[0] - F[0], Q[1] - F[1]], 9); g.D(F[0], F[1], C.a, 8); g.T('F', F[0], F[1], C.a, { dx: 12, dy: -12, size: 15 }); }
    g.D(I[0], I[1], C.ink, 8); g.T('I' + ptS(I[0], I[1]), I[0], I[1], C.ink, { dx: 6, dy: 20, size: 12 }); g.D(Q[0], Q[1], C.b, 8); g.T('Q', Q[0], Q[1], C.b, { dx: -12, dy: -12, size: 15 });
    if (t >= .9) { g.D(Cc[0], Cc[1], C.a, 4); g.T('C' + ptS(Cc[0], Cc[1]), Cc[0], Cc[1], C.a, { dy: 15, size: 11 }); }
    const k = t < .2 ? 0 : t < .3 ? 1 : t < .9 ? 2 : 3;
    return pick(lv, ['Two lines (blue and green) cross at I' + ptS(I[0], I[1]) + '. A point Q is also given.', 'Every line through I belongs to the family. Turn one of them like a fan.', 'From Q, drop a perpendicular to the turning line. The foot F always makes a right angle at F, so F stays on the circle that has QI as its diameter.',
      'The locus of F is a circle: centre ' + ptS(Cc[0], Cc[1]) + ', radius ' + fmt(r) + '.'],
    ['L₁: ' + eqStr(P.a1, P.b1, P.c1) + ', L₂: ' + eqStr(P.a2, P.b2, P.c2) + '.  I = L₁ ∩ L₂ = ' + ptS(I[0], I[1]) + '.', 'L₁ + λL₂ = 0 is a line through I for every λ.', '∠QFI = 90°, so F lies on the circle with diameter QI.', 'C = midpoint of QI = ' + ptS(Cc[0], Cc[1]) + ', r = QI/2 = ' + fmt(r) + ';  (x − ' + fmt(Q[0]) + ')(x − ' + fmt(I[0]) + ') + (y − ' + fmt(Q[1]) + ')(y − ' + fmt(I[1]) + ') = 0.'])[k];
  },
  out: (P, lv) => { const I = fcIn(P), Q = [P.qx, P.qy], Cc = [(I[0] + Q[0]) / 2, (I[1] + Q[1]) / 2], r = hyp(I[0] - Q[0], I[1] - Q[1]) / 2; return sqr('x', Cc[0]) + ' + ' + sqr('y', Cc[1]) + ' = ' + fmt(r * r) + '   (circle on QI as diameter: centre ' + ptS(Cc[0], Cc[1]) + ', radius ' + fmt(r) + ')'; } });
MORE.extras.f6circ = { chip: 'Circle on QI', marks: [0, .2, .3, .9], ranges: Object.assign(rg(['a1', 'b1', 'a2', 'b2'], [-6, 6, 1]), { c1: [-12, 12, 1], c2: [-12, 12, 1], qx: R8, qy: R8 }),
  handles: P => [{ k: 'Q', x: P.qx, y: P.qy, label: 'Q' }, fcLH(P, 1), fcLH(P, 2)].filter(Boolean),
  drag: (P, k, x, y) => { if (k === 'Q') return Object.assign({}, P, { qx: x, qy: y }); const I = fcIn(P); if (!I) return null; const vx = x - I[0], vy = y - I[1]; if (hyp(vx, vy) < 1e-9) return null; const a = vy, b = -vx, c = -(a * I[0] + b * I[1]); return Object.assign({}, P, k === '1' ? { a1: a, b1: b, c1: c } : { a2: a, b2: b, c2: c }); },
  challenges: [{ id: 'f6-circ-r5', text: T2('Move Q so that the circle has radius 5.', 'Place Q with QI = 10.'), hint: T2('The circle’s diameter is the distance QI. Try going 6 left and 8 down from I.', 'Q = (−3, −7) gives QI = √(36 + 64) = 10.'), check: P => { const I = fcIn(P); return !!I && Math.abs(hyp(I[0] - P.qx, I[1] - P.qy) / 2 - 5) < 1e-9; } },
    { id: 'f6-circ-onl1', text: T2('Put Q on line L₁ (blue). Then one foot is Q itself.', 'Choose Q with a₁x_Q + b₁y_Q + c₁ = 0.'), hint: T2('Find a point that fits the blue line’s equation, such as (4, 0).', 'a₁ = 1, b₁ = 1, c₁ = −4: Q(4, 0).'), check: P => { const I = fcIn(P); return !!I && Math.abs(P.a1 * P.qx + P.b1 * P.qy + P.c1) < 1e-9 && hyp(I[0] - P.qx, I[1] - P.qy) > 1e-9; } },
    { id: 'f6-circ-axis', text: T2('Move Q so that the centre of the circle sits on the x-axis.', 'Choose Q so that the centre of the circle has y = 0.'), hint: T2('The centre is half way between Q and I. I is at height 1, so Q must be at height −1.', 'y_C = (y_Q + y_I)/2 = 0 ⇒ y_Q = −y_I = −1.'), check: P => { const I = fcIn(P); return !!I && Math.abs((P.qy + I[1]) / 2) < 1e-9; } }] };
MORE.hooks.f6circ = 'A revolving door: whichever way it turns, the point where a perpendicular from a fixed spot meets it lies on one circle.';
BINDINGS.push({ scene: 'f6circ', ids: ['fclA1', 'fclB1', 'fclC1', 'fclA2', 'fclB2', 'fclC2', 'fclX', 'fclY'], get: v => ({ a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5], qx: v[6], qy: v[7] }),
  set: P => ({ fclA1: P.a1, fclB1: P.b1, fclC1: P.c1, fclA2: P.a2, fclB2: P.b2, fclC2: P.c2, fclX: P.qx, fclY: P.qy }) });

// ---- 13. The line whose part between the axes is cut in half by P ----
mk('f6mid', 6, 'Line with a given midpoint between the axes', 'Class 9–12', [['x0', 'x₀', 2], ['y0', 'y₀', 3]],
  ['Many lines pass through P. Only one of them has P exactly in the middle of the piece between the two axes.', 'A = (2x₀, 0), B = (0, 2y₀):  x/(2x₀) + y/(2y₀) = 1;  area of triangle OAB = 2|x₀y₀|.'], {
  fit: P => [[0, 0], [2 * P.x0, 0], [0, 2 * P.y0], [P.x0, P.y0]],
  valid: P => fin(P.x0, P.y0) && Math.abs(P.x0) > EPS && Math.abs(P.y0) > EPS,
  draw(g, t, C, lv, P) {
    const { x0, y0 } = P, ms = -y0 / x0, e1 = ease(seg(t, .08, .6)), e2 = ease(seg(t, .62, .85)), lg = e2 > 0 ? lerp(Math.log(2.8), 0, e2) : lerp(Math.log(.35), Math.log(2.8), e1), s = Math.exp(lg), m = ms * s;
    const a = x0 - y0 / m, b = y0 - m * x0, M = [a / 2, b / 2];
    const tr = []; for (let i = 0; i <= 50; i++) { let l2; const tt = i / 50; if (t < .62) { if (tt > e1) break; l2 = lerp(Math.log(.35), Math.log(2.8), tt); } else { if (tt > 1) break; l2 = tt < 1 ? lerp(Math.log(.35), Math.log(2.8), tt) : 0; } const mm = ms * Math.exp(l2), aa = x0 - y0 / mm, bb = y0 - mm * x0; tr.push([aa / 2, bb / 2]); }
    if (t < .62 && tr.length > 1) E.kit.poly(g, tr, C.a, 3, [5, 4], .8);
    g.LL(m, -1, y0 - m * x0, e2 >= 1 ? C.a : C.c, e2 >= 1 ? 4 : 3);
    if (t > .08) { g.D(a, 0, C.c, 6); g.D(0, b, C.g, 6); g.L(a, 0, 0, b, e2 >= 1 ? C.a : C.faint, 2, [4, 4]); g.D(M[0], M[1], C.b, 6); g.T('M', M[0], M[1], C.b, { dx: -13, dy: -12, size: 13 }); }
    if (t >= .86) { g.T('A(' + fmt(2 * x0) + ', 0)', 2 * x0, 0, C.c, { dy: y0 * x0 > 0 ? 18 : -18, size: 12 }); g.T('B(0, ' + fmt(2 * y0) + ')', 0, 2 * y0, C.g, { dx: 52, size: 12 }); }
    g.D(x0, y0, C.ink, 8); g.T('P' + ptS(x0, y0), x0, y0, C.ink, { dx: 6, dy: 20, size: 13 });
    const k = t < .08 ? 0 : t < .62 ? 1 : t < .86 ? 2 : 3, gap = hyp(M[0] - x0, M[1] - y0);
    return pick(lv, ['A fixed point P' + ptS(x0, y0) + ' and the two axes.', 'Turn a line round P. It cuts the axes at A and B. The middle M of AB moves too. Right now M is ' + fmt(gap, 2) + ' away from P.', 'When M lands exactly on P, P is the middle of AB. That is our line.', 'A is ' + ptS(2 * x0, 0) + ' and B is ' + ptS(0, 2 * y0) + ': twice the coordinates of P. Area of triangle OAB = ' + fmt(2 * Math.abs(x0 * y0)) + '.'],
      ['Line through P: y − y₀ = m(x − x₀), A(a, 0), B(0, b); M = (a/2, b/2).', 'We need M = P, i.e. |MP| = 0 (now ' + fmt(gap, 2) + ').', 'a/2 = x₀ and b/2 = y₀, so a = ' + fmt(2 * x0) + ' and b = ' + fmt(2 * y0) + ' (m = −y₀/x₀ = ' + fmt(ms) + ').', niceEq({ a: y0, b: x0, c: -2 * x0 * y0 }) + ';  area = ½·|2x₀|·|2y₀| = ' + fmt(2 * Math.abs(x0 * y0)) + '.'])[k];
  },
  out: (P, lv) => niceEq({ a: P.y0, b: P.x0, c: -2 * P.x0 * P.y0 }) + ', area = ' + fmt(2 * Math.abs(P.x0 * P.y0)) + '   (A = ' + ptS(2 * P.x0, 0) + ', B = ' + ptS(0, 2 * P.y0) + ')' });
MORE.extras.f6mid = { chip: 'P is the midpoint', marks: [0, .08, .62, .86], ranges: { x0: [-8, 8, 1], y0: [-8, 8, 1] },
  handles: P => [{ k: 'P', x: P.x0, y: P.y0, label: 'P' }], drag: (P, k, x, y) => Object.assign({}, P, { x0: x, y0: y }),
  challenges: [{ id: 'f6-mid-area', text: T2('Place P so that the triangle OAB has area 24.', 'Choose x₀, y₀ with 2|x₀y₀| = 24.'), hint: T2('Area = 2 × x₀ × y₀. Try P(3, 4).', '|x₀y₀| = 12.'), check: P => Math.abs(2 * Math.abs(P.x0 * P.y0) - 24) < 1e-9 },
    { id: 'f6-mid-equal', text: T2('Place P so that OA = OB (equal pieces on both axes).', 'Choose P with |x₀| = |y₀|.'), hint: T2('Put P on the line y = x.', 'x₀ = y₀, for instance P(2, 2).'), check: P => Math.abs(Math.abs(P.x0) - Math.abs(P.y0)) < 1e-9 && Math.abs(P.x0) > EPS },
    { id: 'f6-mid-left', text: T2('Place P in the top-left part of the graph (x negative, y positive). Where does A go?', 'Choose x₀ < 0 and y₀ > 0.'), hint: T2('Move P to the left of the y-axis, above the x-axis.', 'A = (2x₀, 0) will have a negative x.'), check: P => P.x0 < 0 && P.y0 > 0 }] };
MORE.hooks.f6mid = 'A plank leans so that a bird sitting on it is exactly half way between the wall and the floor.';
BINDINGS.push({ scene: 'f6mid', ids: ['ffmX', 'ffmY'], get: v => ({ x0: v[0], y0: v[1] }), set: P => ({ ffmX: P.x0, ffmY: P.y0 }) });
});
