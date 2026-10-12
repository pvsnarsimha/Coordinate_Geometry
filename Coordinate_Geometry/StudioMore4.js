// ========= Animation Studio: extra scenes, part 4 (tab 10: lines and planes in 3D, optimisation, data, algorithms) =========
// Loaded after StudioMore1.js (needs E.kit). Scenes, bindings, step marks, challenges and hooks for the last tab-10 cards.
(window.__studioParts = window.__studioParts || []).push(function (E, scenes, BINDINGS, MORE) {
'use strict';
const kit = E.kit; if (!kit || !kit.iso) return;
const { C, EPS, pick, ease, seg, lerp, fmt, fin, eqStr, intersect, foot } = E;
const T2 = (s, i) => [s, i || s];
const mk = (id, tab, title, tag, params, f, o) => { const sc = Object.assign({ id, tab, title, tag, params, f }, o); scenes.push(sc); return sc; };
const ptStr = (x, y) => '(' + fmt(x) + ', ' + fmt(y) + ')';
const R6 = [-6, 6, 1];
const rg = (keys, r) => Object.fromEntries(keys.map(k => [k, r]));

// ---------- small 3D toolkit (vectors as [x, y, z]) ----------
const V = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len: a => Math.hypot(a[0], a[1], a[2]),
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
};
const p3 = p => '(' + p.map(v => fmt(v)).join(', ') + ')';
const isoFor = (g, pts) => { let m = 3; pts.forEach(p => p.forEach(v => { if (Number.isFinite(v) && Math.abs(v) <= 12) m = Math.max(m, Math.ceil(Math.abs(v))); })); return kit.iso(g, Math.min(10, m)); };
const inCube = (p, L) => p.every(v => Math.abs(v) <= L + 1e-9);
// the part of the line P + t·d that stays inside the drawn cube [-L, L]^3, as a range of t
const cubeT = (P, d, L) => {
  let lo = -1e9, hi = 1e9;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-12) { if (Math.abs(P[i]) > L) return null; continue; }
    let a = (-L - P[i]) / d[i], b = (L - P[i]) / d[i]; if (a > b) { const s = a; a = b; b = s; }
    lo = Math.max(lo, a); hi = Math.min(hi, b);
  }
  return lo < hi ? [lo, hi] : null;
};
// whole line, growing out from the point of the line nearest to P as e goes 0 → 1
const line3 = (I, P, d, col, w, e = 1, dash, alpha = 1) => {
  const r = cubeT(P, d, I.L); if (!r || e <= 0) return;
  const m = Math.min(r[1], Math.max(r[0], 0)), a = m + (r[0] - m) * e, b = m + (r[1] - m) * e;
  I.ln(V.add(P, V.mul(d, a)), V.add(P, V.mul(d, b)), col, w, dash, alpha);
};
const arrow3 = (g, I, p, q, col, w = 3, alpha = 1) => {
  I.ln(p, q, col, w, null, alpha);
  const A = I.pr(...p), B = I.pr(...q), len = Math.hypot(B[0] - A[0], B[1] - A[1]); if (len < 9) return;
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]), ctx = g.ctx;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(B[0], B[1]);
  ctx.lineTo(B[0] - 11 * Math.cos(ang - .4), B[1] - 11 * Math.sin(ang - .4)); ctx.lineTo(B[0] - 11 * Math.cos(ang + .4), B[1] - 11 * Math.sin(ang + .4)); ctx.closePath(); ctx.fill(); ctx.restore();
};
const dotL = (I, p, col, label, dx = 0, dy = -13, r = 6) => { if (!inCube(p, I.L)) return; I.dot(p, col, r); if (label) I.tx(label, p, col, dx, dy, 13); };
const drop = (I, p) => { if (!inCube(p, I.L)) return; const q = [p[0], p[1], 0]; I.ln(p, q, C.faint, 1.2, [3, 4]); I.dot(q, C.faint, 3); };   // thin drop to the floor, to read the height
const cap = (d, m) => { const l = V.len(d); return l > m ? V.mul(d, m / l) : d; };
// (x − x₁)/a = (y − y₁)/b = (z − z₁)/c, with a zero direction ratio written as a plane equation (never divide by 0)
const symEq = (p, d) => {
  const nm = ['x', 'y', 'z'], fr = [], eq = [];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < EPS) { eq.push(nm[i] + ' = ' + fmt(p[i])); continue; }
    const top = Math.abs(p[i]) < EPS ? nm[i] : '(' + nm[i] + (p[i] < 0 ? ' + ' : ' − ') + fmt(Math.abs(p[i])) + ')';
    fr.push(top + '/' + (d[i] < 0 ? '(' + fmt(d[i]) + ')' : fmt(d[i])));
  }
  return fr.join(' = ') + (eq.length ? (fr.length ? ',  ' : '') + eq.join(',  ') : '');
};
const vecEq = (p, d, v) => 'r = ⟨' + p.map(q => fmt(q)).join(', ') + '⟩ + ' + v + '⟨' + d.map(q => fmt(q)).join(', ') + '⟩';

// ======================= 1. A line in space: symmetric and vector form =======================
mk('line3d', 10, 'A line in space: symmetric and vector form', 'Class 11–12',
  [['x1', 'x₁', 1], ['y1', 'y₁', 2], ['z1', 'z₁', 1], ['a', 'a', 2], ['b', 'b', 3], ['c', 'c', 1], ['t', 't (or λ)', 1]],
  ['A line in space is a start point plus a direction, walked forwards and backwards.', 'Symmetric: (x − x₁)/a = (y − y₁)/b = (z − z₁)/c.  Vector: r = a + λb, i.e. x = x₁ + at, y = y₁ + bt, z = z₁ + ct'], {
  noGrid: true, selects: { form: ['Written as', ['vector form', 'symmetric form']] },
  fit: P => [[0, 0]],
  valid: P => fin(P.x1, P.y1, P.z1, P.a, P.b, P.c) && Math.hypot(P.a, P.b, P.c) > EPS && (P.t === undefined || Number.isFinite(P.t)),
  draw(g, t, C, lv, P) {
    const p = [P.x1, P.y1, P.z1], d = [P.a, P.b, P.c], hasT = Number.isFinite(P.t), tv = hasT ? P.t : 1, Q = V.add(p, V.mul(d, tv)), sym = P.form === 1, tl = sym ? 't' : 'λ';
    const I = isoFor(g, [p, Q]); I.axes();
    const eD = ease(seg(t, .1, .32)), eL = ease(seg(t, .32, .58)), eQ = ease(seg(t, .58, .82)), dd = cap(d, 4);
    drop(I, p);
    line3(I, p, d, C.c, 3, eL);
    if (eL >= 1) [-1, 1, 2].forEach(k => { const q = V.add(p, V.mul(d, k)); if (k !== tv && inCube(q, I.L)) { I.dot(q, C.faint, 3.5); I.tx(String(k), q, C.muted, 0, 14, 11); } });
    if (eD > 0) arrow3(g, I, p, V.add(p, V.mul(dd, eD)), C.g, 4);
    if (eD >= 1) I.tx('d = ' + p3(d), V.add(p, dd), C.g, 10, -8, 12, 'left');
    dotL(I, p, C.ink, 'P', -12, -10);
    if (eQ > 0) {
      const qa = V.add(p, V.mul(d, tv * eQ)); I.ln(p, qa, C.a, 5); if (inCube(qa, I.L)) I.dot(qa, C.a, 8);
      if (eQ >= 1) { drop(I, Q); I.tx((hasT ? 'Q' : 'Q (t = 1)') + p3(Q), Q, C.a, 0, -16, 13); }
    }
    if (t > .82) I.tx(sym ? symEq(p, d) : vecEq(p, d, 'λ'), [14, 24], C.ink, 0, 0, 13, 'left');
    const k = t < .1 ? 0 : t < .32 ? 1 : t < .58 ? 2 : t < .82 ? 3 : 4, eqS = sym ? symEq(p, d) : vecEq(p, d, 'λ');
    return pick(lv, ['Pick a point on the line: P' + p3(p) + '.', 'The direction ' + p3(d) + ' says how far you move along, across and up in one step.', 'Take steps of that direction forwards and backwards. All those points make the line.',
      'After ' + fmt(tv) + ' step' + (tv === 1 ? '' : 's') + ' you are at Q' + p3(Q) + (hasT ? '.' : ' (an example: type your own t in the card).'), (sym ? 'Written as a chain: ' : 'Written as a vector: ') + eqS + '.'],
      ['P = ' + p3(p) + ' is a point on the line.', 'Direction ratios (a, b, c) = ' + p3(d) + ',  |d| = ' + fmt(V.len(d)) + '.', 'Every point is P + ' + tl + '·d, with ' + tl + ' any real number.',
       tl + ' = ' + fmt(tv) + ':  Q = (' + fmt(p[0]) + ' + ' + fmt(d[0]) + '·' + fmt(tv) + ', ' + fmt(p[1]) + ' + ' + fmt(d[1]) + '·' + fmt(tv) + ', ' + fmt(p[2]) + ' + ' + fmt(d[2]) + '·' + fmt(tv) + ') = ' + p3(Q) + '.', eqS + '.'])[k];
  },
  out: (P, lv) => { const p = [P.x1, P.y1, P.z1], d = [P.a, P.b, P.c], sym = P.form === 1, tl = sym ? 't' : 'λ', hasT = Number.isFinite(P.t); return (sym ? symEq(p, d) : vecEq(p, d, 'λ')) + (hasT ? ';  point at ' + tl + ' = ' + fmt(P.t) + ': Q = ' + p3(V.add(p, V.mul(d, P.t))) : ''); } });
MORE.extras.line3d = { chip: 'Line in space', marks: [0, .1, .32, .58, .82], ranges: Object.assign(rg(['x1', 'y1', 'z1', 'a', 'b', 'c'], R6), { t: [-6, 8, 1] }),
  challenges: [
    { id: 't10-line-origin', text: T2('Make the line pass through the origin (0, 0, 0).', 'Choose P so that the origin is on the line: (x₁, y₁, z₁) is a multiple of (a, b, c).'), hint: T2('Move the start point P to (0, 0, 0).', 'P = (0, 0, 0) works, or any P that is a multiple of (a, b, c).'), check: P => V.len(V.cross([P.x1, P.y1, P.z1], [P.a, P.b, P.c])) < 1e-9 },
    { id: 't10-line-z7', text: T2('Make the point at t land at height z = 7.', 'Choose t so that z₁ + c·t = 7.'), hint: T2('Height after t steps = start height + t × (up part of the direction).', 't = (7 − z₁)/c.'), check: P => Number.isFinite(P.t) && Math.abs(P.z1 + P.c * P.t - 7) < 1e-9 },
    { id: 't10-line-level', text: T2('Make the line level: it never goes up or down.', 'Make the line parallel to the xy-plane: c = 0 with (a, b) ≠ (0, 0).'), hint: T2('The "up" part of the direction must be 0.', 'c = 0.'), check: P => Math.abs(P.c) < EPS && Math.hypot(P.a, P.b) > EPS }] };
MORE.hooks.line3d = 'A zip-line from a tower: where does it start, and which way does it run?';
const withT = (o, s) => { const t = parseFloat(s); if (Number.isFinite(t)) o.t = t; return o; };
BINDINGS.push(
  { scene: 'line3d', ids: ['symPx', 'symPy', 'symPz', 'symA', 'symB', 'symC'], text: ['symT'], get: (v, rr, tx) => withT({ x1: v[0], y1: v[1], z1: v[2], a: v[3], b: v[4], c: v[5], form: 1 }, tx('symT')) },
  { scene: 'line3d', ids: ['vecAx', 'vecAy', 'vecAz', 'vecBx', 'vecBy', 'vecBz'], text: ['vecLambda'], get: (v, rr, tx) => withT({ x1: v[0], y1: v[1], z1: v[2], a: v[3], b: v[4], c: v[5], form: 0 }, tx('vecLambda')) });

// ======================= 2. Two lines in space: meet, parallel or skew =======================
// Everything about two lines P₁ + t·d₁ and P₂ + s·d₂ (correct for every case, including coplanar lines whose x-y system is singular).
const L3 = P => {
  const p1 = [P.x1, P.y1, P.z1], d1 = [P.a1, P.b1, P.c1], p2 = [P.x2, P.y2, P.z2], d2 = [P.a2, P.b2, P.c2];
  const cr = V.cross(d1, d2), crl = V.len(cr), n1 = V.len(d1), n2 = V.len(d2), w = V.sub(p2, p1), wl = V.len(w), o = { p1, d1, p2, d2, cr, crl, w, wl, n1, n2 };
  o.par = crl <= 1e-9 * n1 * n2;
  if (o.par) {
    const wc = V.cross(w, d1), wcl = V.len(wc); o.wc = wc; o.dist = wcl / n1; o.kind = wcl <= 1e-9 * (1 + wl * n1) ? 'coincident' : 'parallel';
    o.t = V.dot(w, d1) / V.dot(d1, d1); o.Q1 = V.add(p1, V.mul(d1, o.t)); o.Q2 = p2; o.s = 0; return o;
  }
  o.trip = V.dot(w, cr);
  const w0 = V.sub(p1, p2), a = V.dot(d1, d1), b = V.dot(d1, d2), c = V.dot(d2, d2), dd = V.dot(d1, w0), e = V.dot(d2, w0), den = a * c - b * b;
  o.t = (b * e - c * dd) / den; o.s = (a * e - b * dd) / den; o.Q1 = V.add(p1, V.mul(d1, o.t)); o.Q2 = V.add(p2, V.mul(d2, o.s));
  o.kind = Math.abs(o.trip) <= 1e-9 * (1 + wl * crl) ? 'intersect' : 'skew'; o.dist = o.kind === 'intersect' ? 0 : Math.abs(o.trip) / crl;
  return o;
};
const L3params = [['x1', 'x₁', 0], ['y1', 'y₁', 0], ['z1', 'z₁', 0], ['a1', 'a₁', 1], ['b1', 'b₁', 0], ['c1', 'c₁', 0], ['x2', 'x₂', 1], ['y2', 'y₂', 0], ['z2', 'z₂', 2], ['a2', 'a₂', 0], ['b2', 'b₂', 1], ['c2', 'c₂', 0]];
const L3valid = P => fin(P.x1, P.y1, P.z1, P.a1, P.b1, P.c1, P.x2, P.y2, P.z2, P.a2, P.b2, P.c2) && Math.hypot(P.a1, P.b1, P.c1) > EPS && Math.hypot(P.a2, P.b2, P.c2) > EPS;
const L3ranges = rg(['x1', 'y1', 'z1', 'a1', 'b1', 'c1', 'x2', 'y2', 'z2', 'a2', 'b2', 'c2'], R6);
function drawL3(g, t, lv, P, focus) {
  const o = L3(P), { p1, d1, p2, d2 } = o, I = isoFor(g, [p1, p2, o.Q1, o.Q2, V.add(p1, d1), V.add(p2, d2)]); I.axes();
  const e1 = ease(seg(t, .1, .4)), e2 = ease(seg(t, .4, .65)), e3 = ease(seg(t, .65, .85)), e4 = ease(seg(t, .85, 1)), nh = o.par ? null : V.mul(o.cr, 1 / o.crl);
  drop(I, p1); drop(I, p2);
  line3(I, p1, d1, C.c, 3, e1); line3(I, p2, d2, C.g, 3, e1);
  if (t > .04) { dotL(I, p1, C.c, 'P₁', -14, -10); dotL(I, p2, C.g, 'P₂', 14, -10); }
  if (e2 > 0) {
    if (focus === 0 || o.par) { arrow3(g, I, p1, V.add(p1, V.mul(cap(d1, 2.8), e2)), C.c, 4); arrow3(g, I, p2, V.add(p2, V.mul(cap(d2, 2.8), e2)), C.g, 4); if (e2 >= 1) { I.tx('d₁', V.add(p1, cap(d1, 2.8)), C.c, 12, -8, 13); I.tx('d₂', V.add(p2, cap(d2, 2.8)), C.g, 12, -8, 13); } }
    else { const mid = V.mul(V.add(o.Q1, o.Q2), .5); arrow3(g, I, mid, V.add(mid, V.mul(nh, 2.6 * e2)), C.a, 4); if (e2 >= 1) I.tx('n = d₁ × d₂', V.add(mid, V.mul(nh, 2.6)), C.a, 10, -6, 13, 'left'); }
  }
  if (e3 > 0) {
    I.ln(p1, V.add(p1, V.mul(o.w, e3)), C.b, 2.4, [6, 5]);
    if (focus === 1 && !o.par) { const h = V.dot(o.w, nh); I.ln(p1, V.add(p1, V.mul(nh, h * e3)), C.a, 2.8, [2, 4]); }
  }
  if (e4 > 0) {
    if (o.kind === 'intersect') { dotL(I, o.Q1, C.a, 'I' + p3(o.Q1), 0, -16, 8); }
    else if (o.kind === 'coincident') { I.tx('same line', [14, 24], C.a, 0, 0, 14, 'left'); }
    else { I.ln(o.Q1, V.add(o.Q1, V.mul(V.sub(o.Q2, o.Q1), e4)), C.a, 4.5); dotL(I, o.Q1, C.a, '', 0, 0, 5); if (e4 >= 1) { dotL(I, o.Q2, C.a, '', 0, 0, 5); I.tx((focus === 1 ? 'd = ' : 'gap = ') + fmt(o.dist), o.Q2, C.a, 12, -14, 14, 'left'); } }
  }
  const k = t < .1 ? 0 : t < .4 ? 1 : t < .65 ? 2 : t < .85 ? 3 : 4, ls = (i, p, d) => 'Line ' + i + ': through P' + (i === 1 ? '₁' : '₂') + p3(p) + ', direction ' + p3(d);
  const intro = [ls(1, p1, d1) + '.  ' + ls(2, p2, d2) + '.'];
  if (focus === 0) {
    const verdict = o.kind === 'intersect' ? ['The lines cross at ' + p3(o.Q1) + '.', 'Solving P₁ + t·d₁ = P₂ + s·d₂ gives t = ' + fmt(o.t) + ', s = ' + fmt(o.s) + ': they meet at ' + p3(o.Q1) + '.']
      : o.kind === 'skew' ? ['The lines never meet and are not parallel: they are skew (distance between them ' + fmt(o.dist) + ').', 'Triple product ≠ 0, so the lines are skew; the shortest distance is ' + fmt(o.dist) + '.']
      : o.kind === 'parallel' ? ['The lines are parallel and different: they never meet (gap ' + fmt(o.dist) + ').', 'd₁ ∥ d₂ and P₂ is not on L₁: parallel, no intersection; gap = |(P₂ − P₁) × d₁|/|d₁| = ' + fmt(o.dist) + '.']
      : ['The two lines are the very same line: every point is shared.', 'd₁ ∥ d₂ and P₂ lies on L₁: the lines are coincident (infinitely many common points).'];
    return pick(lv, [intro[0], 'Draw both lines. Do they cross?', o.par ? 'The two directions point the same way, so the lines are parallel (or the same line).' : 'The directions point different ways, so the lines are not parallel.',
      o.par ? (o.kind === 'coincident' ? 'The start point P₂ sits on line 1, so it is the same line.' : 'P₂ is not on line 1: two parallel rails side by side.') : (o.kind === 'skew' ? 'The two lines do not lie in one flat sheet, so they can never meet.' : 'Both lines lie in one flat sheet, so they must cross.'), verdict[0]],
      [intro[0], 'Solve P₁ + t·d₁ = P₂ + s·d₂ (3 equations, 2 unknowns).', 'd₁ × d₂ = ' + p3(o.cr) + ',  |d₁ × d₂| = ' + fmt(o.crl) + (o.par ? ' = 0 → parallel.' : ' ≠ 0 → not parallel.'),
       o.par ? '(P₂ − P₁) × d₁ = ' + p3(o.wc) + (o.kind === 'coincident' ? ' = 0 → same line.' : ' ≠ 0 → distinct parallel lines.') : '(P₂ − P₁)·(d₁ × d₂) = ' + fmt(o.trip) + (o.kind === 'skew' ? ' ≠ 0 → not coplanar → skew.' : ' = 0 → coplanar → they intersect.'), verdict[1]])[k];
  }
  const pre = o.par ? 'The lines are parallel, so there is no single common perpendicular direction; use the gap between the two rails.' : null;
  return pick(lv, [intro[0], 'Draw both lines. They are not parallel, and they may never meet.', o.par ? pre : 'Find the direction n that is square (perpendicular) to both lines: n = d₁ × d₂.', 'Join P₁ to P₂ and see how much of that joining step points along n.',
      o.kind === 'coincident' ? 'The lines are the same line: distance 0.' : o.kind === 'intersect' ? 'The lines meet, so the shortest distance is 0.' : 'The shortest link between the lines is the common perpendicular, length ' + fmt(o.dist) + '.'],
    [intro[0], 'Shortest distance = length of the common perpendicular.', o.par ? 'd₁ × d₂ = 0, so use d = |(P₂ − P₁) × d₁|/|d₁|.' : 'n = d₁ × d₂ = ' + p3(o.cr) + ',  |n| = ' + fmt(o.crl) + '.',
     o.par ? '(P₂ − P₁) × d₁ = ' + p3(o.wc) + ', |d₁| = ' + fmt(o.n1) + '.' : 'P₁P₂ = ' + p3(o.w) + ';  (P₂ − P₁)·n = ' + fmt(o.trip) + '.',
     o.par ? 'd = ' + fmt(V.len(o.wc)) + '/' + fmt(o.n1) + ' = ' + fmt(o.dist) + '.' : 'd = |(P₂ − P₁)·(d₁ × d₂)|/|d₁ × d₂| = |' + fmt(o.trip) + '|/' + fmt(o.crl) + ' = ' + fmt(o.dist) + '.'])[k];
}
const kindName = o => ({ intersect: 'the lines intersect', skew: 'skew lines', parallel: 'parallel lines', coincident: 'the same line' })[o.kind];
mk('inter3d', 10, 'Do two lines in space meet?', 'Class 11–12', L3params,
  ['Two lines in space can cross, run side by side, or pass over each other without touching.', 'Not parallel and (P₂ − P₁)·(d₁ × d₂) = 0 ⇒ they meet; ≠ 0 ⇒ skew;  d₁ × d₂ = 0 ⇒ parallel or coincident'], {
  noGrid: true, fit: P => [[0, 0]], valid: L3valid, draw: (g, t, C, lv, P) => drawL3(g, t, lv, P, 0),
  out: (P, lv) => { const o = L3(P); return o.kind === 'intersect' ? 'Intersection point: ' + p3(o.Q1) + '  (t = ' + fmt(o.t) + ', s = ' + fmt(o.s) + ')' : o.kind === 'skew' ? 'Lines are SKEW (no intersection, not parallel);  shortest distance = ' + fmt(o.dist) : o.kind === 'parallel' ? 'Lines are PARALLEL (no intersection);  gap between them = ' + fmt(o.dist) : 'Lines are COINCIDENT (infinite intersection points)'; } });
const meetFix = L3;
MORE.extras.inter3d = { chip: 'Do lines meet?', marks: [0, .1, .4, .65, .85], ranges: L3ranges,
  challenges: [
    { id: 't10-int-meet', text: T2('Make the two lines meet at one point.', 'Make the lines coplanar and not parallel: (P₂ − P₁)·(d₁ × d₂) = 0 with d₁ × d₂ ≠ 0.'), hint: T2('Lower or raise line 2 until it touches line 1. Try P₂ = (1, 0, 0).', 'Choose P₂ on line 1 (for example P₂ = (1, 0, 0)).'), check: P => meetFix(P).kind === 'intersect' },
    { id: 't10-int-par', text: T2('Make the lines parallel but different.', 'Make d₁ × d₂ = 0 while P₂ is not on L₁.'), hint: T2('Give line 2 the same direction as line 1. Keep it away from line 1.', 'd₂ = (1, 0, 0) with P₂ = (1, 0, 2).'), check: P => meetFix(P).kind === 'parallel' },
    { id: 't10-int-at2', text: T2('Make the lines meet at the point (2, 0, 0).', 'Make the intersection point exactly (2, 0, 0).'), hint: T2('Start line 2 at (2, 0, 0).', 'P₂ = (2, 0, 0) lies on L₁ (the x-axis).'), check: P => { const o = meetFix(P); return o.kind === 'intersect' && V.len(V.sub(o.Q1, [2, 0, 0])) < 1e-9; } }] };
MORE.hooks.inter3d = 'Two flight paths: will the planes ever be at the same spot, or do they just pass over each other?';
BINDINGS.push({ scene: 'inter3d', ids: ['intL1Px', 'intL1Py', 'intL1Pz', 'intL1Dx', 'intL1Dy', 'intL1Dz', 'intL2Px', 'intL2Py', 'intL2Pz', 'intL2Dx', 'intL2Dy', 'intL2Dz'],
  get: v => ({ x1: v[0], y1: v[1], z1: v[2], a1: v[3], b1: v[4], c1: v[5], x2: v[6], y2: v[7], z2: v[8], a2: v[9], b2: v[10], c2: v[11] }) });

mk('skew3d', 10, 'Skew lines and the shortest distance', 'Class 11–12', L3params,
  ['Skew lines pass over each other without touching. The shortest link between them is a straight rod at right angles to both.', 'd = |(P₂ − P₁)·(d₁ × d₂)| / |d₁ × d₂|;  for parallel lines d = |(P₂ − P₁) × d₁| / |d₁|'], {
  noGrid: true, fit: P => [[0, 0]], valid: L3valid, draw: (g, t, C, lv, P) => drawL3(g, t, lv, P, 1),
  out: (P, lv) => { const o = L3(P); return 'Shortest distance = ' + fmt(o.dist) + '  (' + kindName(o) + ')'; } });
MORE.extras.skew3d = { chip: 'Skew lines', marks: [0, .1, .4, .65, .85], ranges: L3ranges,
  challenges: [
    { id: 't10-skew-d3', text: T2('Make the shortest distance exactly 3.', 'Make d = 3.'), hint: T2('Line 2 is 2 above line 1 now. Lift it to 3.', 'With these directions, d is the difference in heights: set z₂ = 3.'), check: P => Math.abs(L3(P).dist - 3) < 1e-9 },
    { id: 't10-skew-0', text: T2('Make the distance 0: the lines must touch.', 'Make (P₂ − P₁)·(d₁ × d₂) = 0 with the lines not parallel.'), hint: T2('Bring line 2 down onto line 1.', 'z₂ = 0 makes the lines coplanar.'), check: P => { const o = L3(P); return o.kind === 'intersect'; } },
    { id: 't10-skew-par', text: T2('Make the lines parallel. Then the distance is just the gap between two rails.', 'Make d₁ × d₂ = 0 and the lines distinct: the skew formula fails, use |(P₂ − P₁) × d₁|/|d₁|.'), hint: T2('Point line 2 the same way as line 1: direction (1, 0, 0).', 'a₂ = 1, b₂ = 0, c₂ = 0.'), check: P => L3(P).kind === 'parallel' }] };
MORE.hooks.skew3d = 'A bridge over a road: the nearest the bridge deck comes to the road line is its clearance.';
BINDINGS.push({ scene: 'skew3d', ids: ['skewP1x', 'skewP1y', 'skewP1z', 'skewD1x', 'skewD1y', 'skewD1z', 'skewP2x', 'skewP2y', 'skewP2z', 'skewD2x', 'skewD2y', 'skewD2z'],
  get: v => ({ x1: v[0], y1: v[1], z1: v[2], a1: v[3], b1: v[4], c1: v[5], x2: v[6], y2: v[7], z2: v[8], a2: v[9], b2: v[10], c2: v[11] }) });

// ======================= 3. Projection of a segment on a line in space =======================
const PJ3 = P => {
  const A = [P.ax, P.ay, P.az], B = [P.bx, P.by, P.bz], Cc = [P.cx, P.cy, P.cz], D = [P.dx, P.dy, P.dz], u = V.mul(D, 1 / V.len(D)), AB = V.sub(B, A);
  const tA = V.dot(V.sub(A, Cc), u), tB = V.dot(V.sub(B, Cc), u);
  return { A, B, Cc, D, u, AB, abl: V.len(AB), A1: V.add(Cc, V.mul(u, tA)), B1: V.add(Cc, V.mul(u, tB)), dot: V.dot(AB, u), len: Math.abs(V.dot(AB, u)) };
};
mk('proj3d', 10, 'Projection of a segment on a line in space', 'Class 11–12',
  [['ax', 'A: x', 0], ['ay', 'A: y', 1], ['az', 'A: z', 2], ['bx', 'B: x', 3], ['by', 'B: y', 3], ['bz', 'B: z', 0], ['cx', 'C: x', 0], ['cy', 'C: y', 0], ['cz', 'C: z', 0], ['dx', 'dₓ', 1], ['dy', 'dᵧ', 0], ['dz', 'd_z', 0]],
  ['The projection of AB on a line is its shadow when the light shines straight down onto that line.', 'Projection length = |AB · û| = |AB · d| / |d|, where d is the direction of the line'], {
  noGrid: true, fit: P => [[0, 0]],
  valid: P => fin(P.ax, P.ay, P.az, P.bx, P.by, P.bz, P.cx, P.cy, P.cz, P.dx, P.dy, P.dz) && Math.hypot(P.dx, P.dy, P.dz) > EPS,
  draw(g, t, C, lv, P) {
    const o = PJ3(P), I = isoFor(g, [o.A, o.B, o.Cc, o.A1, o.B1]); I.axes();
    const e1 = ease(seg(t, .1, .3)), e2 = ease(seg(t, .3, .55)), e3 = ease(seg(t, .55, .8)), e4 = ease(seg(t, .8, 1));
    line3(I, o.Cc, o.D, C.g, 3, e1);
    I.ln(o.A, V.add(o.A, V.mul(o.AB, e1)), C.c, 3.6);
    dotL(I, o.A, C.c, 'A', -13, -8); if (e1 >= 1) dotL(I, o.B, C.c, 'B', 13, -8);
    if (e2 > 0) { arrow3(g, I, o.Cc, V.add(o.Cc, V.mul(o.u, 2 * e2)), C.b, 4); if (e2 >= 1) I.tx('û', V.add(o.Cc, V.mul(o.u, 2)), C.b, 8, -8, 13); dotL(I, o.Cc, C.g, 'C', -12, 14, 4.5); }
    if (e3 > 0) { I.ln(o.A, V.add(o.A, V.mul(V.sub(o.A1, o.A), e3)), C.muted, 1.8, [5, 4]); I.ln(o.B, V.add(o.B, V.mul(V.sub(o.B1, o.B), e3)), C.muted, 1.8, [5, 4]); }
    if (e4 > 0) {
      I.ln(o.A1, V.add(o.A1, V.mul(V.sub(o.B1, o.A1), e4)), C.a, 6); dotL(I, o.A1, C.a, "A′", 0, 16, 5); dotL(I, o.B1, C.a, "B′", 0, 16, 5);
      if (e4 >= 1) I.tx('shadow = ' + fmt(o.len), V.mul(V.add(o.A1, o.B1), .5), C.a, 0, 30, 14);
    }
    const k = t < .1 ? 0 : t < .3 ? 1 : t < .55 ? 2 : t < .8 ? 3 : 4;
    return pick(lv, ['A stick AB and a straight rail (the line L₂) in space.', 'AB goes from A' + p3(o.A) + ' to B' + p3(o.B) + ' (' + fmt(o.abl) + ' long). The rail starts at C and points along ' + p3(o.D) + '.',
      'Mark the rail’s direction with a length-1 arrow û.', 'Drop a straight path from A and from B onto the rail, at right angles.', 'The shadow A′B′ on the rail is ' + fmt(o.len) + ' long.'],
      ['L₁ = AB with A' + p3(o.A) + ', B' + p3(o.B) + ';  L₂: through C' + p3(o.Cc) + ', direction d = ' + p3(o.D) + '.', 'AB = B − A = ' + p3(o.AB) + ',  |AB| = ' + fmt(o.abl) + '.', 'û = d/|d| = ' + p3(o.u) + '  (|d| = ' + fmt(V.len(o.D)) + ').',
       'A′ and B′ are the feet of the perpendiculars from A and B on L₂.', 'Projection = |AB · û| = |' + fmt(o.dot) + '| = ' + fmt(o.len) + '.'])[k];
  },
  out: (P, lv) => { const o = PJ3(P); return 'Projection length = ' + fmt(o.len) + '   (AB itself is ' + fmt(o.abl) + ' long)'; } });
MORE.extras.proj3d = { chip: 'Shadow on a line', marks: [0, .1, .3, .55, .8], ranges: rg(['ax', 'ay', 'az', 'bx', 'by', 'bz', 'cx', 'cy', 'cz', 'dx', 'dy', 'dz'], R6),
  challenges: [
    { id: 't10-pj3-0', text: T2('Make the shadow vanish: AB must be at a right angle to the rail.', 'Make AB ⟂ L₂, so AB · d = 0 (and A ≠ B).'), hint: T2('The rail points along x. Make A and B have the same x number.', 'AB · d = 0: with d = (1, 0, 0), B and A need the same x.'), check: P => { const o = PJ3(P); return o.abl > EPS && o.len < 1e-9; } },
    { id: 't10-pj3-full', text: T2('Make the shadow exactly as long as AB (AB runs along the rail).', 'Make AB ∥ d, so the projection equals |AB|.'), hint: T2('Move B so that only its x number differs from A.', 'B = A + k·d, for example B = (3, 1, 2).'), check: P => { const o = PJ3(P); return o.abl > EPS && Math.abs(o.len - o.abl) < 1e-9; } },
    { id: 't10-pj3-5', text: T2('Make the shadow exactly 5 long.', 'Make |AB · û| = 5.'), hint: T2('With the rail along x, the shadow is the difference of the x numbers.', 'Here the projection is |x_B − x_A|: take x_B = 5.'), check: P => Math.abs(PJ3(P).len - 5) < 1e-9 }] };
MORE.hooks.proj3d = 'A slanted pole casts a shadow along a straight railway track. How long is the shadow?';
BINDINGS.push({ scene: 'proj3d', ids: ['projAx', 'projAy', 'projAz', 'projBx', 'projBy', 'projBz', 'projCx', 'projCy', 'projCz', 'projDx', 'projDy', 'projDz'],
  get: v => ({ ax: v[0], ay: v[1], az: v[2], bx: v[3], by: v[4], bz: v[5], cx: v[6], cy: v[7], cz: v[8], dx: v[9], dy: v[10], dz: v[11] }) });

// ======================= 4. Image of a point in a line in space =======================
const IM3 = P => {
  const Pp = [P.px, P.py, P.pz], A = [P.ax, P.ay, P.az], D = [P.dx, P.dy, P.dz], u = V.mul(D, 1 / V.len(D)), t = V.dot(V.sub(Pp, A), u), F = V.add(A, V.mul(u, t)), Q = V.sub(V.mul(F, 2), Pp);
  return { Pp, A, D, u, t, F, Q, r: V.len(V.sub(Pp, F)) };
};
mk('img3d', 10, 'Image of a point in a line in space', 'Class 11–12',
  [['px', 'P: x', 2], ['py', 'P: y', 0], ['pz', 'P: z', 3], ['ax', 'A: x', 0], ['ay', 'A: y', 0], ['az', 'A: z', 1], ['dx', 'dₓ', 1], ['dy', 'dᵧ', 1], ['dz', 'd_z', 0]],
  ['The image is the mirror copy of P across the line: the same distance on the other side.', 'F = A + ((AP·û)û) is the foot of the perpendicular; the image is Q = 2F − P'], {
  noGrid: true, fit: P => [[0, 0]],
  valid: P => fin(P.px, P.py, P.pz, P.ax, P.ay, P.az, P.dx, P.dy, P.dz) && Math.hypot(P.dx, P.dy, P.dz) > EPS,
  draw(g, t, C, lv, P) {
    const o = IM3(P), I = isoFor(g, [o.Pp, o.A, o.F, o.Q]); I.axes();
    const e1 = ease(seg(t, .1, .35)), e2 = ease(seg(t, .35, .6)), e3 = ease(seg(t, .6, .8)), same = o.r < 1e-9;
    line3(I, o.A, o.D, C.g, 3, ease(seg(t, .02, .2))); dotL(I, o.A, C.g, 'A', -12, 14, 4.5);
    drop(I, o.Pp);
    if (e3 > 0 && !same) I.ln(o.Pp, V.add(o.Pp, V.mul(V.sub(o.Q, o.Pp), e3)), C.faint, 1.6, [3, 5]);
    I.ln(o.Pp, V.add(o.Pp, V.mul(V.sub(o.F, o.Pp), e1)), C.c, 3.4);
    dotL(I, o.Pp, C.a, 'P', -13, -8, 7);
    if (e1 >= 1) { dotL(I, o.F, C.b, 'F', 12, 14, 5.5); if (!same) I.tx(fmt(o.r), V.mul(V.add(o.Pp, o.F), .5), C.c, -14, 0, 12); }
    if (e2 > 0 && !same) { I.ln(o.F, V.add(o.F, V.mul(V.sub(o.Q, o.F), e2)), C.c, 3.4); if (e2 >= 1) { dotL(I, o.Q, C.a, 'Q' + p3(o.Q), 0, -14, 7); I.tx(fmt(o.r), V.mul(V.add(o.Q, o.F), .5), C.c, 14, 0, 12); } }
    if (same && e1 >= 1) I.tx('P is on the line: Q = P', [14, 24], C.a, 0, 0, 14, 'left');
    const k = t < .1 ? 0 : t < .35 ? 1 : t < .6 ? 2 : t < .8 ? 3 : 4;
    return pick(lv, ['A point P and a straight line (a mirror rod) in space.', 'Walk from P straight to the line, at a right angle. You land at F, ' + fmt(o.r) + ' away.', 'Keep going the same distance beyond F. That lands on the image Q.',
      'F is exactly halfway between P and Q, and PQ is square to the line.', 'The image is Q' + p3(o.Q) + '.'],
      ['P' + p3(o.Pp) + ';  line through A' + p3(o.A) + ' with d = ' + p3(o.D) + ', û = ' + p3(o.u) + '.', 'AP = ' + p3(V.sub(o.Pp, o.A)) + ', t = AP·û = ' + fmt(o.t) + ', F = A + t·û = ' + p3(o.F) + '.', 'Q = 2F − P = ' + p3(o.Q) + '.',
       'Check: midpoint of PQ = ' + p3(V.mul(V.add(o.Pp, o.Q), .5)) + ' = F, and PQ · û = ' + fmt(V.dot(V.sub(o.Q, o.Pp), o.u)) + ' = 0.', 'Image Q = ' + p3(o.Q) + '.'])[k];
  },
  out: (P, lv) => { const o = IM3(P); return 'Image Q = ' + p3(o.Q) + '   (foot of the perpendicular F = ' + p3(o.F) + ')'; } });
MORE.extras.img3d = { chip: 'Mirror in a line', marks: [0, .1, .35, .6, .8], ranges: rg(['px', 'py', 'pz', 'ax', 'ay', 'az', 'dx', 'dy', 'dz'], R6),
  challenges: [
    { id: 't10-im3-self', text: T2('Put P on the line so that its image is P itself.', 'Choose P on the line: then F = P and Q = P.'), hint: T2('A point on the mirror rod does not move. Try A + 2 steps: P = (2, 2, 1).', 'P = A + 2d = (2, 2, 1).'), check: P => { const o = IM3(P); return V.len(V.sub(o.Q, o.Pp)) < 1e-9; } },
    { id: 't10-im3-origin', text: T2('Choose P so that its image is the origin (0, 0, 0).', 'Make Q = 0: then P = 2F and PF ⟂ line.'), hint: T2('Try P straight above A: the foot is A = (0, 0, 1), so P must be (0, 0, 2).', 'F = (0, 0, 1) works, so P = (0, 0, 2).'), check: P => V.len(IM3(P).Q) < 1e-9 },
    { id: 't10-im3-r3', text: T2('Put P exactly 3 units from the line.', 'Make |PF| = 3.'), hint: T2('Go 3 units straight up from a point of the line: P = (0, 0, 4).', 'P = A + 3·ẑ works since the line is horizontal: P = (0, 0, 4).'), check: P => Math.abs(IM3(P).r - 3) < 1e-9 }] };
MORE.hooks.img3d = 'A pole spins on a rod: where does the tip end up after a half turn about the rod?';
BINDINGS.push({ scene: 'img3d', ids: ['imgPx', 'imgPy', 'imgPz', 'imgAx', 'imgAy', 'imgAz', 'imgDx', 'imgDy', 'imgDz'],
  get: v => ({ px: v[0], py: v[1], pz: v[2], ax: v[3], ay: v[4], az: v[5], dx: v[6], dy: v[7], dz: v[8] }) });

// ======================= 5. Line of intersection of two planes =======================
const PI3 = P => {
  const n1 = [P.a1, P.b1, P.c1], n2 = [P.a2, P.b2, P.c2], cr = V.cross(n1, n2), crl = V.len(cr), o = { n1, n2, cr, crl, d1: P.e1, d2: P.e2 };
  if (crl < 1e-10) { const k = V.dot(n1, n2) / V.dot(n1, n1); o.kind = Math.abs(P.e2 - k * P.e1) < 1e-9 * (1 + Math.abs(P.e2)) ? 'coincident' : 'parallel'; return o; }
  // one point on the line, found the way the card does it: set z = 0, else y = 0, else x = 0
  let x = 0, y = 0, z = 0; const det = n1[0] * n2[1] - n2[0] * n1[1];
  if (Math.abs(det) > 1e-10) { x = (-P.e1 * n2[1] + P.e2 * n1[1]) / det; y = (n1[0] * -P.e2 - n2[0] * -P.e1) / det; o.fix = 'z = 0'; }
  else { const det2 = n1[0] * n2[2] - n2[0] * n1[2]; if (Math.abs(det2) > 1e-10) { x = (-P.e1 * n2[2] + P.e2 * n1[2]) / det2; z = (n1[0] * -P.e2 - n2[0] * -P.e1) / det2; o.fix = 'y = 0'; } else { const det3 = n1[1] * n2[2] - n2[1] * n1[2]; y = (-P.e1 * n2[2] + P.e2 * n1[2]) / det3; z = (n1[1] * -P.e2 - n2[1] * -P.e1) / det3; o.fix = 'x = 0'; } }
  o.kind = 'line'; o.p0 = [x, y, z]; o.u = V.mul(cr, 1 / crl); o.pm = V.sub(o.p0, V.mul(o.u, V.dot(o.p0, o.u)));   // pm: the point of the line nearest the origin
  return o;
};
// the part of the plane n·x + e = 0 inside the cube [-L, L]^3, as a 3D polygon
const planePoly = (n, e, L) => {
  const nl = V.len(n), nn = V.mul(n, 1 / nl), p0 = V.mul(nn, -e / nl); let e1 = V.cross(nn, Math.abs(nn[0]) < .9 ? [1, 0, 0] : [0, 1, 0]); e1 = V.mul(e1, 1 / V.len(e1)); const e2 = V.cross(nn, e1), R = 4 * L;
  let poly = [[-R, -R], [R, -R], [R, R], [-R, R]];
  for (let i = 0; i < 3 && poly.length > 2; i++) { poly = kit.clip(poly, e1[i], e2[i], p0[i] + L, 1); if (poly.length > 2) poly = kit.clip(poly, -e1[i], -e2[i], L - p0[i], 1); }
  return poly.length > 2 ? poly.map(q => V.add(p0, V.add(V.mul(e1, q[0]), V.mul(e2, q[1])))) : [];
};
const eqPlane = (a, b, c, d) => { const s = [[a, 'x'], [b, 'y'], [c, 'z']].filter(q => Math.abs(q[0]) > EPS).map((q, i) => (q[0] < 0 ? '−' : (i ? '+' : '')) + (i ? ' ' : '') + (Math.abs(Math.abs(q[0]) - 1) < 1e-9 ? '' : fmt(Math.abs(q[0]))) + q[1]).join(' '); return (s || '0') + (Math.abs(d) < EPS ? '' : (d < 0 ? ' − ' : ' + ') + fmt(Math.abs(d))) + ' = 0'; };
mk('planes3d', 10, 'Line where two planes meet', 'Class 11–12',
  [['a1', 'a₁', 1], ['b1', 'b₁', 1], ['c1', 'c₁', -2], ['e1', 'd₁', 1], ['a2', 'a₂', 2], ['b2', 'b₂', -1], ['c2', 'c₂', 1], ['e2', 'd₂', 0]],
  ['Two flat sheets that are not parallel cut through each other along a straight line.', 'Direction = n₁ × n₂ (both normals are square to the line); one point comes from solving the two equations with z = 0'], {
  noGrid: true, fit: P => [[0, 0]],
  valid: P => fin(P.a1, P.b1, P.c1, P.e1, P.a2, P.b2, P.c2, P.e2) && Math.hypot(P.a1, P.b1, P.c1) > EPS && Math.hypot(P.a2, P.b2, P.c2) > EPS,
  draw(g, t, C, lv, P) {
    const o = PI3(P), ref = o.kind === 'line' ? o.pm : [0, 0, 0], I = isoFor(g, [ref, [0, 0, 0]]); const L = I.L; I.axes();
    const eA = seg(t, .08, .3), eB = seg(t, .32, .54), eC = ease(seg(t, .56, .78)), eD = ease(seg(t, .8, 1)), pa = planePoly(o.n1, o.d1, L), pb = planePoly(o.n2, o.d2, L);
    const patch = (poly, col, e) => { if (poly.length < 3 || e <= 0) return; I.poly(poly, col, .2 * e); poly.forEach((q, i) => I.ln(q, poly[(i + 1) % poly.length], col, 1.6, null, .55 * e)); };
    patch(pa, C.c, eA); patch(pb, C.g, eB);
    const base = o.kind === 'line' ? o.pm : V.mul(o.n1, -o.d1 / V.dot(o.n1, o.n1));
    if (eA > .5) { const nn1 = V.mul(o.n1, 2.2 / V.len(o.n1)); arrow3(g, I, base, V.add(base, nn1), C.c, 3.6); I.tx('n₁', V.add(base, nn1), C.c, 10, -6, 13); }
    if (eB > .5) { const nn2 = V.mul(o.n2, 2.2 / V.len(o.n2)); arrow3(g, I, base, V.add(base, nn2), C.g, 3.6); I.tx('n₂', V.add(base, nn2), C.g, 10, -6, 13); }
    if (o.kind === 'line') {
      if (eC > 0) { arrow3(g, I, o.pm, V.add(o.pm, V.mul(o.u, 2.6 * eC)), C.b, 3.6); if (eC >= 1) I.tx('d = n₁ × n₂', V.add(o.pm, V.mul(o.u, 2.6)), C.b, 12, -12, 12, 'left'); dotL(I, o.p0, C.ink, 'P₀', -14, -8, 5); }
      if (eD > 0) { line3(I, o.pm, o.u, C.a, 4.6, eD); if (eD >= 1) I.tx(symEq(o.p0, o.u), [14, 24], C.a, 0, 0, 12, 'left'); }
    } else if (eD > 0) I.tx(o.kind === 'coincident' ? 'the same plane' : 'parallel planes: no common line', [14, 24], C.a, 0, 0, 14, 'left');
    const k = t < .08 ? 0 : t < .32 ? 1 : t < .56 ? 2 : t < .8 ? 3 : 4, e1s = eqPlane(P.a1, P.b1, P.c1, P.e1), e2s = eqPlane(P.a2, P.b2, P.c2, P.e2);
    const verdict = o.kind === 'line' ? 'The planes meet along the line ' + symEq(o.p0, o.u) + '.' : o.kind === 'coincident' ? 'The two planes are the same plane, so there is no single line.' : 'The planes are parallel (the normals point the same way), so they never meet.';
    return pick(lv, ['Two flat sheets in space (planes).', 'Plane 1: ' + e1s + '. Its normal n₁ = ' + p3(o.n1) + ' sticks straight out of it.', 'Plane 2: ' + e2s + ' with normal n₂ = ' + p3(o.n2) + '.',
      o.kind === 'line' ? 'The meeting line is in both sheets, so it is square to both normals. Its direction is n₁ × n₂ = ' + p3(o.cr) + '.' : 'The two normals point the same way, so n₁ × n₂ = 0.', verdict],
      ['π₁: ' + e1s + ',  n₁ = ' + p3(o.n1) + '.', 'π₂: ' + e2s + ',  n₂ = ' + p3(o.n2) + '.', 'd = n₁ × n₂ = ' + p3(o.cr) + (o.kind === 'line' ? ',  |d| = ' + fmt(o.crl) + '.' : ' = 0 → parallel normals.'),
       o.kind === 'line' ? 'Put ' + o.fix + ' and solve the two equations: P₀ = ' + p3(o.p0) + '.' : 'No line: ' + (o.kind === 'coincident' ? 'coincident' : 'parallel') + ' planes.', verdict])[k];
  },
  out: (P, lv) => { const o = PI3(P); return o.kind === 'line' ? 'Line: ' + symEq(o.p0, o.u) + ';  direction n₁ × n₂ = ' + p3(o.cr) + ', point P₀ = ' + p3(o.p0) : 'Planes are parallel - no intersection line' + (o.kind === 'coincident' ? '  (they are the same plane)' : ''); } });
MORE.extras.planes3d = { chip: 'Two planes', marks: [0, .08, .32, .56, .8], ranges: Object.assign(rg(['a1', 'b1', 'c1', 'a2', 'b2', 'c2'], [-5, 5, 1]), { e1: [-8, 8, 1], e2: [-8, 8, 1] }),
  challenges: [
    { id: 't10-pl-par', text: T2('Make the two planes parallel, so they never meet.', 'Make n₂ a multiple of n₁ (n₁ × n₂ = 0).'), hint: T2('Give plane 2 the same tilt as plane 1: for example 2, 2, −4.', 'n₂ = 2n₁ = (2, 2, −4).'), check: P => PI3(P).kind === 'parallel' },
    { id: 't10-pl-perp', text: T2('Make the two planes meet at a right angle.', 'Make n₁ · n₂ = 0 (and not parallel).'), hint: T2('Try plane 2 with normal (1, −1, 0): 1·1 + 1·(−1) + (−2)·0 = 0.', 'n₂ = (1, −1, 0) gives n₁ · n₂ = 0.'), check: P => { const o = PI3(P); return o.kind === 'line' && Math.abs(V.dot(o.n1, o.n2)) < 1e-9; } },
    { id: 't10-pl-vert', text: T2('Make the meeting line stand straight up (parallel to the z-axis).', 'Make d = n₁ × n₂ parallel to (0, 0, 1): c₁ = c₂ = 0.'), hint: T2('Two vertical walls meet in a vertical line: remove the z part of both planes.', 'c₁ = 0 and c₂ = 0.'), check: P => { const o = PI3(P); return o.kind === 'line' && Math.abs(o.cr[0]) < 1e-9 && Math.abs(o.cr[1]) < 1e-9; } }] };
MORE.hooks.planes3d = 'The ridge where a sloping roof meets a wall is the line where two planes cross.';
BINDINGS.push({ scene: 'planes3d', ids: ['plane1A', 'plane1B', 'plane1C', 'plane1D', 'plane2A', 'plane2B', 'plane2C', 'plane2D'],
  get: v => ({ a1: v[0], b1: v[1], c1: v[2], e1: v[3], a2: v[4], b2: v[5], c2: v[6], e2: v[7] }) });

// ======================= 6. Nearest and farthest point on a circle =======================
const PC = P => {
  const d = Math.hypot(P.qx - P.h, P.qy - P.k), ang = d < 1e-12 ? 0 : Math.atan2(P.qy - P.k, P.qx - P.h), ux = Math.cos(ang), uy = Math.sin(ang);
  return { d, ux, uy, N: [P.h + P.r * ux, P.k + P.r * uy], F: [P.h - P.r * ux, P.k - P.r * uy], mn: Math.abs(d - P.r), mx: d + P.r };
};
mk('ptcircle', 10, 'Nearest and farthest point on a circle', 'Class 9–12',
  [['qx', 'Q: x', 5], ['qy', 'Q: y', 5], ['h', 'centre h', 0], ['k', 'centre k', 0], ['r', 'radius r', 2]],
  ['The nearest and farthest spots of a circle are on the straight line through the centre and the point.', 'd = |QC| = √[(x₁ − h)² + (y₁ − k)²];  nearest = |d − r|,  farthest = d + r'], {
  fit: P => [[P.h - P.r - 1, P.k - P.r - 1], [P.h + P.r + 1, P.k + P.r + 1], [P.qx, P.qy]],
  valid: P => fin(P.qx, P.qy, P.h, P.k, P.r) && P.r > EPS,
  draw(g, t, C, lv, P) {
    const o = PC(P), ctx = g.ctx, { qx, qy, h, k, r } = P, e1 = ease(seg(t, .1, .35)), e2 = ease(seg(t, .35, .6)), e3 = ease(seg(t, .6, .85)), inside = o.d < r - 1e-9;
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(g.X(h), g.Y(k), r * g.sc, 0, 7); ctx.stroke(); ctx.restore();
    g.D(h, k, C.b, 6); g.T('C', h, k, C.b, { dx: -12, dy: 16, size: 13 });
    if (e1 > 0 && o.d > 1e-9) { g.L(h, k, lerp(h, qx, e1), lerp(k, qy, e1), C.b, 2.5, [6, 5]); if (e1 >= 1) g.T('d = ' + fmt(o.d), (h + qx) / 2, (k + qy) / 2, C.b, { dx: -34 * Math.sign(o.uy || 1), dy: -10, size: 13 }); }
    if (e2 > 0) { g.L(qx, qy, lerp(qx, o.N[0], e2), lerp(qy, o.N[1], e2), C.c, 4.5); }
    if (e2 >= 1) { g.D(o.N[0], o.N[1], C.g, 8); g.T('nearest ' + fmt(o.mn), (qx + o.N[0]) / 2, (qy + o.N[1]) / 2, C.c, { dx: 6 * (o.uy >= 0 ? -6 : 6), dy: o.uy >= 0 ? 16 : -16, size: 13 }); }
    if (e3 > 0) { g.L(qx, qy, lerp(qx, o.F[0], e3), lerp(qy, o.F[1], e3), C.a, 3.2, [3, 4]); }
    if (e3 >= 1) { g.D(o.F[0], o.F[1], C.a, 8); g.T('farthest ' + fmt(o.mx), (qx + o.F[0]) / 2, (qy + o.F[1]) / 2, C.a, { dx: 0, dy: o.uy >= 0 ? -18 : 18, size: 13 }); }
    g.D(qx, qy, C.a, 8); g.T('Q' + ptStr(qx, qy), qx, qy, C.a, { dy: -20, size: 13 });
    const k2 = t < .1 ? 0 : t < .35 ? 1 : t < .6 ? 2 : t < .85 ? 3 : 4;
    return pick(lv, ['A circle with centre C' + ptStr(h, k) + ' and radius ' + fmt(r) + ', and a point Q' + ptStr(qx, qy) + '.', 'Measure from Q to the centre C: ' + fmt(o.d) + ' units.',
      inside ? 'Q is inside the circle. The nearest spot on the circle is straight out from Q: ' + fmt(r) + ' − ' + fmt(o.d) + ' = ' + fmt(o.mn) + '.' : 'The nearest spot is on the straight path from Q to C: ' + fmt(o.d) + ' − ' + fmt(r) + ' = ' + fmt(o.mn) + '.',
      'The farthest spot is on the other side of the centre: ' + fmt(o.d) + ' + ' + fmt(r) + ' = ' + fmt(o.mx) + '.', 'Nearest ' + fmt(o.mn) + ', farthest ' + fmt(o.mx) + '.'],
      ['C' + ptStr(h, k) + ', r = ' + fmt(r) + ', Q' + ptStr(qx, qy) + '.', 'd = |QC| = √[(' + fmt(qx) + ' − ' + fmt(h) + ')² + (' + fmt(qy) + ' − ' + fmt(k) + ')²] = ' + fmt(o.d) + '.',
       'Minimum = |d − r| = |' + fmt(o.d) + ' − ' + fmt(r) + '| = ' + fmt(o.mn) + (inside ? ' (Q is inside, so this is r − d).' : '.'), 'Maximum = d + r = ' + fmt(o.d) + ' + ' + fmt(r) + ' = ' + fmt(o.mx) + '.', 'min = ' + fmt(o.mn) + ' at ' + ptStr(o.N[0], o.N[1]) + ';  max = ' + fmt(o.mx) + ' at ' + ptStr(o.F[0], o.F[1]) + '.'])[k2];
  },
  out: (P, lv) => { const o = PC(P); return 'Min distance = ' + fmt(o.mn) + ' at ' + ptStr(o.N[0], o.N[1]) + ',  Max distance = ' + fmt(o.mx) + ' at ' + ptStr(o.F[0], o.F[1]); } });
MORE.extras.ptcircle = { chip: 'Point and circle', marks: [0, .1, .35, .6, .85], ranges: { qx: [-8, 8, 1], qy: [-8, 8, 1], h: [-6, 6, 1], k: [-6, 6, 1], r: [.5, 6, .5] },
  handles: P => { const a = Math.PI / 4; return [{ k: 'Q', x: P.qx, y: P.qy, label: 'Q' }, { k: 'C', x: P.h, y: P.k, label: 'C' }, { k: 'R', x: P.h + P.r * Math.cos(a), y: P.k + P.r * Math.sin(a), label: 'r' }]; },
  drag: (P, k, x, y) => (k === 'Q' ? Object.assign({}, P, { qx: x, qy: y }) : k === 'C' ? Object.assign({}, P, { h: x, k: y }) : Object.assign({}, P, { r: Math.max(.5, E.snap(Math.hypot(x - P.h, y - P.k))) })),
  challenges: [
    { id: 't10-pc-on', text: T2('Put Q exactly on the circle. The nearest distance becomes 0.', 'Make d = r, so the minimum distance |d − r| = 0.'), hint: T2('Q must be 2 units from the centre (the radius). Try Q = (2, 0).', 'With C = (0, 0) and r = 2, Q = (2, 0) works.'), check: P => Math.abs(PC(P).d - P.r) < 1e-9 },
    { id: 't10-pc-in', text: T2('Put Q inside the circle.', 'Make d < r.'), hint: T2('Q must be closer to the centre than the radius. Try Q = (1, 0).', 'd < 2 for C = (0, 0): Q = (1, 0).'), check: P => PC(P).d < P.r - 1e-9 },
    { id: 't10-pc-max10', text: T2('Make the farthest distance exactly 10.', 'Make d + r = 10.'), hint: T2('The farthest distance is (distance to the centre) + radius. You need 8 + 2.', 'd = 8 when r = 2: Q = (8, 0).'), check: P => Math.abs(PC(P).mx - 10) < 1e-9 }] };
MORE.hooks.ptcircle = 'A round pond: how close can you walk to its edge, and how far across is the opposite shore?';

// ======================= 7. Two moving points, one on each line =======================
const MV = P => {
  const n1 = Math.hypot(P.a1, P.b1), n2 = Math.hypot(P.a2, P.b2), cr = P.a1 * P.b2 - P.a2 * P.b1, par = Math.abs(cr) <= 1e-10 * Math.max(1, n1 * n2) || Math.abs(cr) <= 1e-9 * n1 * n2;
  const f1 = foot({ px: 0, py: 0, a: P.a1, b: P.b1, c: P.c1 }), f2 = foot({ px: 0, py: 0, a: P.a2, b: P.b2, c: P.c2 }), o = { n1, n2, par, f1, f2, u1: [-P.b1 / n1, P.a1 / n1], u2: [-P.b2 / n2, P.a2 / n2] };
  if (par) { o.dist = Math.abs(P.a1 * f2[0] + P.b1 * f2[1] + P.c1) / n1; o.same = o.dist < 1e-9; o.A = foot({ px: f2[0], py: f2[1], a: P.a1, b: P.b1, c: P.c1 }); o.B = f2; }
  else { o.dist = 0; o.I = intersect(P); o.A = o.I; o.B = o.I; }
  return o;
};
mk('movepts', 10, 'Two moving points on two lines', 'Class 9–12',
  [['a1', 'a₁', 1], ['b1', 'b₁', 0], ['c1', 'c₁', 0], ['a2', 'a₂', 0], ['b2', 'b₂', 1], ['c2', 'c₂', 0]],
  ['Point A slides along line 1 and point B along line 2. How close can they get?', 'Crossing lines: minimum distance 0 (at the crossing). Parallel lines: the gap = |ax₀ + by₀ + c|/√(a² + b²) for a point on the other line'], {
  fit: P => { const o = MV(P); return [[0, 0], o.A, o.B, [o.f1[0] + 3, o.f1[1] + 3], [o.f2[0] - 3, o.f2[1] - 3]]; },
  valid: P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2) && Math.hypot(P.a1, P.b1) > EPS && Math.hypot(P.a2, P.b2) > EPS,
  draw(g, t, C, lv, P) {
    const o = MV(P), e1 = seg(t, .12, .55), e2 = ease(seg(t, .55, .8)), ph = e1 * Math.PI * 2;
    g.LL(P.a1, P.b1, P.c1, C.c, 3.5); g.LL(P.a2, P.b2, P.c2, C.g, 3.5);
    const sA = 3 * Math.sin(ph), sB = 3 * Math.sin(ph * 1.5 + 1), A0 = [o.f1[0] + o.u1[0] * sA, o.f1[1] + o.u1[1] * sA], B0 = [o.f2[0] + o.u2[0] * sB, o.f2[1] + o.u2[1] * sB];
    let A = A0, B = B0;
    if (t >= .12 && t < .55) { g.L(A0[0], A0[1], B0[0], B0[1], C.faint, 2.4, [6, 5]); g.T('|AB| = ' + fmt(Math.hypot(A0[0] - B0[0], A0[1] - B0[1])), (A0[0] + B0[0]) / 2, (A0[1] + B0[1]) / 2, C.muted, { dy: -14, size: 13 }); }
    else if (t >= .55) { A = [lerp(A0[0], o.A[0], e2), lerp(A0[1], o.A[1], e2)]; B = [lerp(B0[0], o.B[0], e2), lerp(B0[1], o.B[1], e2)]; if (!o.par || o.same) { /* the points meet */ } else g.L(A[0], A[1], B[0], B[1], C.a, 4.5); }
    if (t < .12) { A = o.f1; B = o.f2; }
    g.D(A[0], A[1], C.c, 7); g.T('A', A[0], A[1], C.c, { dx: -12, dy: -12, size: 13 }); g.D(B[0], B[1], C.g, 7); g.T('B', B[0], B[1], C.g, { dx: 12, dy: 12, size: 13 });
    if (t >= .8) { if (o.par && !o.same) { const m = [(o.A[0] + o.B[0]) / 2, (o.A[1] + o.B[1]) / 2]; g.T('min = ' + fmt(o.dist), m[0], m[1], C.a, { dx: 40, dy: -6, size: 14 }); g.right(o.A[0], o.A[1], [o.B[0] - o.A[0], o.B[1] - o.A[1]], [-P.b1, P.a1]); } else if (!o.par) g.T('they meet at ' + ptStr(o.I[0], o.I[1]) + ': min = 0', o.I[0], o.I[1], C.a, { dy: -22, size: 14 }); else g.T('same line: min = 0', o.f1[0], o.f1[1], C.a, { dy: -22, size: 14 }); }
    const k = t < .12 ? 0 : t < .55 ? 1 : t < .8 ? 2 : 3;
    return pick(lv, ['Line 1 (blue) and line 2 (green). A can slide on line 1, B on line 2.', 'Slide both points around. The gap |AB| keeps changing.',
      o.par ? (o.same ? 'The lines are the same line, so A and B can sit together.' : 'The lines are parallel. The closest A and B get is a straight rung across, at a right angle.') : 'The lines cross, so A and B can both sit at the crossing.',
      o.par ? (o.same ? 'Minimum distance = 0.' : 'Minimum distance = the gap between the rails = ' + fmt(o.dist) + '.') : 'Minimum distance = 0.'],
      ['L₁: ' + eqStr(P.a1, P.b1, P.c1) + ',  L₂: ' + eqStr(P.a2, P.b2, P.c2) + '.', 'A = (x, y) on L₁, B on L₂: |AB| depends on where each point is.', 'a₁b₂ − a₂b₁ = ' + fmt(o.par ? 0 : P.a1 * P.b2 - P.a2 * P.b1) + (o.par ? ' = 0 → parallel.' : ' ≠ 0 → the lines meet.'),
       o.par ? 'Take a point (' + fmt(o.f2[0]) + ', ' + fmt(o.f2[1]) + ') on L₂: gap = |a₁x₀ + b₁y₀ + c₁|/√(a₁² + b₁²) = ' + fmt(o.dist) + '.' : 'At the crossing ' + ptStr(o.I[0], o.I[1]) + ', |AB| = 0.'])[k];
  },
  out: (P, lv) => { const o = MV(P); return o.par ? 'Minimum distance = ' + fmt(o.dist) + (o.same ? ' (the lines coincide)' : '') : 'Minimum distance = 0 (lines intersect at ' + ptStr(o.I[0], o.I[1]) + ')'; } });
MORE.extras.movepts = { chip: 'Moving points', marks: [0, .12, .55, .8], ranges: Object.assign(rg(['a1', 'b1', 'a2', 'b2'], [-6, 6, 1]), { c1: [-12, 12, 1], c2: [-12, 12, 1] }),
  challenges: [
    { id: 't10-mv-par', text: T2('Make the lines parallel. Then the points can never meet.', 'Make a₁b₂ − a₂b₁ = 0 with the lines different.'), hint: T2('Make line 2 point the same way as line 1 (x = a number), then move it away.', 'Take L₂: x = 3, i.e. a₂ = 1, b₂ = 0, c₂ = −3.'), check: P => { const o = MV(P); return o.par && !o.same; } },
    { id: 't10-mv-5', text: T2('Make the smallest distance between A and B exactly 5.', 'Make the gap between the parallel lines equal to 5 (watch the scale of a₂, b₂).'), hint: T2('Two upright lines 5 apart: x = 0 and x = 5.', 'a₂ = 2, b₂ = 0, c₂ = −10 is the line x = 5; the gap is |c₁ − c₂/2|/√(a₁² + b₁²) = 5.'), check: P => { const o = MV(P); return o.par && Math.abs(o.dist - 5) < 1e-9; } }] };
MORE.hooks.movepts = 'Two ants walk along two straight roads. How close can they come?';

// ----- the optimisation card: one binding, three scenes (point-line reuses "ptline") -----
const numOf = (root, id) => { const e = root.querySelector('#' + id); return e ? parseFloat(e.value) : NaN; };
const optSet = P => (P.r !== undefined ? { optQx: P.qx, optQy: P.qy, optCircleH: P.h, optCircleK: P.k, optCircleR: P.r } : P.a1 !== undefined ? null : { optPx: P.px, optPy: P.py });
BINDINGS.push({ scene: 'ptline', ids: [], sig: 'optimization', present: root => !!root.querySelector('#optPx') && !!root.querySelector('#computeOptDistanceBtn'),
  read: root => {
    const ty = (root.querySelector('input[name="optType"]:checked') || {}).value || 'pointToLine', f = ids => ids.map(i => numOf(root, i)), ok = v => v.every(Number.isFinite);
    if (ty === 'pointToCircle') { const v = f(['optQx', 'optQy', 'optCircleH', 'optCircleK', 'optCircleR']); return ok(v) ? { qx: v[0], qy: v[1], h: v[2], k: v[3], r: v[4] } : null; }
    if (ty === 'movingPoints') { const v = f(['optL1A', 'optL1B', 'optL1C', 'optL2A', 'optL2B', 'optL2C']); return ok(v) ? { a1: v[0], b1: v[1], c1: v[2], a2: v[3], b2: v[4], c2: v[5] } : null; }
    const v = f(['optPx', 'optPy', 'optLineA', 'optLineB', 'optLineC']); return ok(v) ? { px: v[0], py: v[1], a: v[2], b: v[3], c: v[4] } : null;
  },
  sceneOf: p => (p.r !== undefined ? 'ptcircle' : p.a1 !== undefined ? 'movepts' : 'ptline'), set: optSet });

// ======================= 8. Linear programming (graphical method) =======================
const LPN = 6;
const clipEps = (poly, a, b, c) => {   // keep a x + b y + c >= 0, with a tiny tolerance so corners shared by 3 lines survive
  const out = [], n = poly.length, tol = 1e-9 * (1 + Math.hypot(a, b) + Math.abs(c));
  for (let i = 0; i < n; i++) {
    const P = poly[i], Q = poly[(i + 1) % n], fp = a * P[0] + b * P[1] + c, fq = a * Q[0] + b * Q[1] + c, ip = fp >= -tol, iq = fq >= -tol;
    if (ip) out.push(P);
    if (ip !== iq) { const s = fp / (fp - fq); out.push([P[0] + s * (Q[0] - P[0]), P[1] + s * (Q[1] - P[1])]); }
  }
  return out;
};
const lpRows = P => { const r = []; for (let i = 1; i <= LPN; i++) { const a = P['a' + i], b = P['b' + i], k = P['k' + i]; if (a !== undefined && (Math.abs(a) > 0 || Math.abs(b) > 0 || k < 0)) r.push({ a, b, k, i }); } return r; };
const lpSolve = P => {
  const M = 1e4, rows = lpRows(P), sign = P.dir === 0 ? -1 : 1, Z = q => P.c1 * q[0] + P.c2 * q[1];
  let poly = [[0, 0], [M, 0], [M, M], [0, M]];
  rows.forEach(r => { if (poly.length) poly = clipEps(poly, -r.a, -r.b, r.k); });
  const s = { M, rows, sign, poly, verts: [], Z };
  if (poly.length < 1) { s.status = 'infeasible'; return s; }
  const uniq = []; poly.forEach(q => { if (!uniq.some(u => Math.abs(u[0] - q[0]) < 1e-7 * (1 + Math.abs(q[0])) && Math.abs(u[1] - q[1]) < 1e-7 * (1 + Math.abs(q[1])))) uniq.push(q); });
  s.verts = uniq.filter(q => q[0] < M * .999 && q[1] < M * .999);
  if (!s.verts.length) { s.status = 'unbounded'; return s; }
  let best = s.verts[0]; s.verts.forEach(q => { if (sign * Z(q) > sign * Z(best) + 1e-12) best = q; });
  const bz = Z(best); let bestAll = -Infinity; uniq.forEach(q => { bestAll = Math.max(bestAll, sign * Z(q)); });
  s.best = best; s.bestZ = bz; s.ties = s.verts.filter(q => Math.abs(Z(q) - bz) <= 1e-9 * (1 + Math.abs(bz)));
  s.status = bestAll > sign * bz + 1e-7 * (1 + Math.abs(bz)) ? 'unbounded' : 'optimal';
  return s;
};
const lpCols = [C.c, C.g, C.b, '#8b5cf6', '#b7791f', '#d6336c'];
const lpPar = [['c1', 'c₁ (x)', 3], ['c2', 'c₂ (y)', 2]]; [[1, 1, 10], [2, 1, 15], [0, 1, 8], [1, 0, 6], [0, 0, 0], [0, 0, 0]].forEach((r, i) => { lpPar.push(['a' + (i + 1), 'a' + (i + 1), r[0]], ['b' + (i + 1), 'b' + (i + 1), r[1]], ['k' + (i + 1), 'k' + (i + 1) + ' (≤)', r[2]]); });
const lpEq = r => fmt(r.a) + 'x + ' + fmt(r.b) + 'y ≤ ' + fmt(r.k);
mk('lp', 10, 'Linear programming: the best corner', 'Class 11–12', lpPar,
  ['Rules (constraints) fence in an allowed area. The best answer is always at one of its corners.', 'Maximise/minimise Z = c₁x + c₂y subject to aᵢx + bᵢy ≤ kᵢ, x ≥ 0, y ≥ 0: the optimum is at a vertex of the feasible polygon'], {
  selects: { dir: ['Goal', ['minimize Z', 'maximize Z']] },
  fit: P => { const s = lpSolve(P), W = Math.max(4, ...s.verts.map(q => q[0])) * (s.status === 'unbounded' ? 1.6 : 1.12), H = Math.max(4, ...s.verts.map(q => q[1])) * (s.status === 'unbounded' ? 1.6 : 1.12); return [[-.1 * W, -.1 * H], [W, H]]; },
  valid: P => fin(P.c1, P.c2) && lpRows(P).every(r => fin(r.a, r.b, r.k)),
  draw(g, t, C, lv, P) {
    const s = lpSolve(P), b = g.b, n = Math.max(1, s.rows.length), mx = P.dir === 0 ? 'minimum' : 'maximum';
    kit.half(g, 1, 0, 0, -1, C.muted, .14); kit.half(g, 0, 1, 0, -1, C.muted, .14);
    s.rows.forEach((r, j) => {
      const er = ease(seg(t, .08 + j * .22 / n, .08 + (j + 1) * .22 / n)); if (er <= 0) return; const col = lpCols[(r.i - 1) % lpCols.length];
      if (Math.hypot(r.a, r.b) > 0) { kit.half(g, r.a, r.b, -r.k, 1, col, .09 * er); g.LL(r.a, r.b, -r.k, col, 3, null, er); }
      const lo = { x0: Math.max(0, b.x0), y0: Math.max(0, b.y0) }, pts = [];
      if (Math.abs(r.b) > EPS) [lo.x0, b.x1].forEach(x => { const y = (r.k - r.a * x) / r.b; if (y >= lo.y0 - 1e-9 && y <= b.y1 + 1e-9) pts.push([x, y]); });
      if (Math.abs(r.a) > EPS) [lo.y0, b.y1].forEach(y => { const x = (r.k - r.b * y) / r.a; if (x >= lo.x0 - 1e-9 && x <= b.x1 + 1e-9) pts.push([x, y]); });
      if (pts.length >= 2 && er >= 1) { const p0 = pts[0], p1 = pts.find(q => Math.hypot(q[0] - p0[0], q[1] - p0[1]) > 1e-6) || pts[1], f = .28 + .12 * (j % 4); g.T('(' + r.i + ')', p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f, col, { dy: -12, size: 13 }); }
    });
    const eF = ease(seg(t, .3, .5));
    if (s.status === 'infeasible') { if (t > .3) g.T('no point obeys every rule', (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, C.a, { size: 16 }); }
    else if (eF > 0) { g.poly(s.poly, C.g, .3 * eF); kit.poly(g, s.poly.concat([s.poly[0]]), C.g, 3, null, eF); }
    // corners and their Z values
    const eC = seg(t, .5, .62), cen = s.verts.length ? [s.verts.reduce((u, q) => u + q[0], 0) / s.verts.length, s.verts.reduce((u, q) => u + q[1], 0) / s.verts.length] : [0, 0];
    if (eC > 0) s.verts.forEach(q => { g.D(q[0], q[1], C.ink, 6); const dx = q[0] - cen[0], dy = q[1] - cen[1], nn = Math.hypot(dx, dy) || 1; g.T(ptStr(q[0], q[1]) + (t > .58 ? ' Z=' + fmt(s.Z(q), 2) : ''), q[0], q[1], C.ink, { dx: dx / nn * 40, dy: -dy / nn * 16 + (dy >= 0 ? -8 : 8), size: 11 }); });
    // objective line sliding to the best corner
    if (s.status !== 'infeasible' && s.verts.length && (P.c1 !== 0 || P.c2 !== 0)) {
      const zs = s.verts.map(q => s.Z(q)), zBest = s.best ? s.bestZ : (s.sign > 0 ? Math.max(...zs) : Math.min(...zs)), zWorst = s.sign > 0 ? Math.min(...zs) : Math.max(...zs), eS = ease(seg(t, .72, .88));
      if (t >= .72) { const zt = lerp(zWorst - s.sign * .15 * (Math.abs(zBest - zWorst) + 1), zBest, eS); g.LL(P.c1, P.c2, -zt, C.a, 3.5, null, 1); if (eS >= 1 && s.best && s.status === 'optimal') g.D(s.best[0], s.best[1], C.a, 10); }
    }
    if (t >= .88 && s.best && s.status === 'optimal') g.T(mx + ' Z = ' + fmt(s.bestZ), s.best[0], s.best[1], C.a, { dx: s.best[0] < cen[0] ? -60 : 60, dy: s.best[1] < cen[1] ? 24 : -24, size: 14 });
    if (Math.max(Math.abs(P.c1), Math.abs(P.c2)) > 0 && P.c1 >= b.x0 && P.c1 <= b.x1 && P.c2 >= b.y0 && P.c2 <= b.y1) { kit.arrow(g, 0, 0, P.c1, P.c2, C.a, 2.5, .55); }
    const k = t < .08 ? 0 : t < .3 ? 1 : t < .5 ? 2 : t < .72 ? 3 : t < .88 ? 4 : 5, zeq = 'Z = ' + fmt(P.c1) + 'x + ' + fmt(P.c2) + 'y', goal = P.dir === 0 ? 'smallest' : 'largest', rl = s.rows.map(lpEq);
    const cornerList = s.verts.slice(0, 6).map(q => ptStr(q[0], q[1]) + ' → Z = ' + fmt(s.Z(q))).join(';  ') + (s.verts.length > 6 ? ';  …' : '');
    const res = s.status === 'infeasible' ? 'No point obeys every rule, so there is no feasible solution.' : s.status === 'unbounded' ? 'The allowed area is open on the ' + (P.dir === 0 ? 'cheap' : 'good') + ' side: Z can be made ' + (P.dir === 0 ? 'as small' : 'as large') + ' as you like (unbounded).' : 'The ' + goal + ' Z is ' + fmt(s.bestZ) + ' at the corner ' + ptStr(s.best[0], s.best[1]) + '.';
    return pick(lv, ['We want the ' + goal + ' value of ' + zeq + ', but we must keep to the rules and stay in the top-right quarter (x ≥ 0, y ≥ 0).', 'Each rule is a straight line. The shaded side breaks the rule, so stay on the clear side.',
      s.status === 'infeasible' ? 'The rules clash: nowhere satisfies all of them.' : 'Where every rule is kept, the green shape is the allowed area (the feasible region).', s.status === 'infeasible' ? 'There are no corners.' : 'The best answer is always at a corner. Try each one: ' + cornerList + '.',
      'Slide the line Z = constant across the area. The last corner it touches is the best one.', res],
      [(P.dir === 0 ? 'Minimise ' : 'Maximise ') + zeq + ' subject to ' + (rl.length ? rl.join(', ') : 'no constraints') + ', x ≥ 0, y ≥ 0.', 'Draw each boundary line aᵢx + bᵢy = kᵢ and keep the half-plane aᵢx + bᵢy ≤ kᵢ (the clear side).',
       s.status === 'infeasible' ? 'The half-planes have an empty intersection: infeasible.' : 'Feasible region = intersection of all the half-planes with x ≥ 0, y ≥ 0' + (s.status === 'unbounded' ? ' (it is unbounded).' : ' (a convex polygon).'), s.status === 'infeasible' ? 'No vertices.' : 'Vertices and objective values: ' + cornerList + '.',
       'Move the level line ' + fmt(P.c1) + 'x + ' + fmt(P.c2) + 'y = Z in the direction in which Z ' + (P.dir === 0 ? 'decreases' : 'increases') + '; the extreme vertex is optimal.', res])[k];
  },
  out: (P, lv) => { const s = lpSolve(P); return s.status === 'infeasible' ? 'No feasible solution found' : s.status === 'unbounded' ? 'Unbounded: Z can be made ' + (P.dir === 0 ? 'as small' : 'as large') + ' as you like in the feasible region' : 'Optimal: ' + ptStr(s.best[0], s.best[1]) + ', Z = ' + fmt(s.bestZ) + (s.ties.length > 1 ? '  (also optimal along the edge to ' + s.ties.filter(q => q !== s.best).map(q => ptStr(q[0], q[1])).join(', ') + ')' : ''); } });
const lpOpt = P => lpSolve(P);
MORE.extras.lp = { chip: 'Best corner (LP)', marks: [0, .08, .3, .5, .72, .88], ranges: Object.assign({ c1: [-10, 10, 1], c2: [-10, 10, 1] }, ...[1, 2, 3, 4, 5, 6].map(i => ({ ['a' + i]: [-6, 6, 1], ['b' + i]: [-6, 6, 1], ['k' + i]: [-10, 40, 1] }))),
  handles: P => { const s = lpSolve(P), h = []; s.rows.forEach(r => { if (Math.hypot(r.a, r.b) < EPS) return; const n2 = r.a * r.a + r.b * r.b; h.push({ k: 'k' + r.i, x: r.a * r.k / n2, y: r.b * r.k / n2, label: '(' + r.i + ')' }); }); return h; },
  drag: (P, k, x, y) => { const i = +k.slice(1); if (!(i >= 1)) return null; return Object.assign({}, P, { ['k' + i]: P['a' + i] * x + P['b' + i] * y }); },
  challenges: [
    { id: 't10-lp-61', text: T2('Change the objective so the best corner becomes (6, 3).', 'Choose c₁, c₂ so that the maximum is at the vertex (6, 3).'), hint: T2('Make x count much more than y: try Z = 10x + y.', 'Increase c₁ relative to c₂: c = (10, 1) gives the vertex (6, 3).'), check: P => { const s = lpOpt(P); return s.status === 'optimal' && Math.hypot(s.best[0] - 6, s.best[1] - 3) < 1e-7; } },
    { id: 't10-lp-min', text: T2('Switch to minimise. The cheapest corner should be the origin (0, 0).', 'Minimise Z with positive c₁, c₂: the optimum moves to (0, 0).'), hint: T2('Choose "minimize Z" in the goal (or the Minimize button on the card).', 'Goal: minimise. With c₁, c₂ > 0 the smallest Z is at the origin.'), check: P => { const s = lpOpt(P); return P.dir === 0 && s.status === 'optimal' && Math.hypot(s.best[0], s.best[1]) < 1e-9; } },
    { id: 't10-lp-empty', text: T2('Break the rules so that no point is allowed (no feasible solution).', 'Make the system infeasible, for example x + y ≤ −1 with x, y ≥ 0.'), hint: T2('Make the number on the right of rule 1 negative.', 'k₁ < 0 with a₁, b₁ ≥ 0 has no solution in the first quadrant.'), check: P => lpOpt(P).status === 'infeasible' },
    { id: 't10-lp-open', text: T2('Take away the rules that fence the area in, so Z can grow without limit.', 'Remove every constraint (set aᵢ = bᵢ = kᵢ = 0) so that the maximum is unbounded.'), hint: T2('Set rules 1 to 4 to 0, 0, 0 (or press ✖ on each row of the card).', 'With no upper limits, maximising 3x + 2y is unbounded.'), check: P => lpOpt(P).status === 'unbounded' }] };
MORE.hooks.lp = 'A bakery has limited flour and time. Which mix of cakes and bread earns the most money?';
BINDINGS.push({ scene: 'lp', ids: [], sig: 'linprog', present: root => !!root.querySelector('#computeLPBtn') && !!root.querySelector('#objC1'),
  read: root => {
    const c1 = numOf(root, 'objC1'), c2 = numOf(root, 'objC2'); if (!Number.isFinite(c1) || !Number.isFinite(c2)) return null;
    root.querySelectorAll('input[id^="lpA"],input[id^="lpB"],input[id^="lpK"]').forEach(e => e.removeAttribute('id'));
    const P = { c1, c2, dir: ((root.querySelector('input[name="optDirection"]:checked') || {}).value === 'min') ? 0 : 1 }, rows = [];
    root.querySelectorAll('.constraint-row').forEach(r => { const A = r.querySelector('.constraintA'), B = r.querySelector('.constraintB'), K = r.querySelector('.constraintC'); if (!A || !B || !K) return; const a = parseFloat(A.value), b = parseFloat(B.value), k = parseFloat(K.value); if (Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(k)) rows.push([a, b, k, A, B, K]); });
    if (rows.length > LPN) return null;
    for (let i = 1; i <= LPN; i++) { const r = rows[i - 1]; P['a' + i] = r ? r[0] : 0; P['b' + i] = r ? r[1] : 0; P['k' + i] = r ? r[2] : 0; if (r) { r[3].id = 'lpA' + i; r[4].id = 'lpB' + i; r[5].id = 'lpK' + i; } }
    return P;
  },
  set: P => { const o = {}; for (let i = 1; i <= LPN; i++) { o['lpA' + i] = P['a' + i]; o['lpB' + i] = P['b' + i]; o['lpK' + i] = P['k' + i]; } o.objC1 = P.c1; o.objC2 = P.c2; return o; } });

// ======================= 9. Regression line (least squares) =======================
const RN = 10;
const regPts = P => { const r = []; for (let i = 1; i <= P.n; i++) r.push([P['x' + i], P['y' + i]]); return r; };
const regFit = P => {
  const pts = regPts(P), n = pts.length; if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0; pts.forEach(q => { sx += q[0]; sy += q[1]; sxy += q[0] * q[1]; sxx += q[0] * q[0]; syy += q[1] * q[1]; });
  const den = n * sxx - sx * sx; if (!(den > 1e-12 * (1 + n * sxx))) return null;
  const num = n * sxy - sx * sy, m = num / den, b = (sy - m * sx) / n, vy = n * syy - sy * sy, dr = Math.sqrt(den * Math.max(vy, 0));
  const r = dr > 1e-12 * (1 + n * syy) ? Math.max(-1, Math.min(1, num / dr)) : NaN, sse = pts.reduce((u, q) => u + Math.pow(q[1] - (m * q[0] + b), 2), 0);
  return { pts, n, m, b, r, sse, mx: sx / n, my: sy / n, sx, sy, sxy, sxx, num, den };
};
const regEq = f => E.slopeEq(f.m, f.b);
const regPar = [['n', 'number of points n', 5]]; [[1, 2], [2, 3], [3, 4], [4, 5], [5, 5], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]].forEach((q, i) => regPar.push(['x' + (i + 1), 'x' + (i + 1), q[0]], ['y' + (i + 1), 'y' + (i + 1), q[1]])); regPar.push(['tx', 'test x', 3.5]);
const corner = (g, s, col, y = 22) => { const ctx = g.ctx; ctx.save(); ctx.font = '700 13px ' + E.FONT; ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.fillText(s, 44, y); ctx.restore(); };
mk('regress', 10, 'Best-fit line (least squares)', 'Class 11–12', regPar,
  ['The best straight line passes as close as possible to all the dots: its squared misses add up to the least.', 'm = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²),  b = (Σy − mΣx)/n,  r = (nΣxy − ΣxΣy)/√[(nΣx² − (Σx)²)(nΣy² − (Σy)²)]'], {
  fit: P => { const f = regFit(P); if (!f) return [[0, 0], [5, 5]]; const q = f.pts.concat([[0, 0]]); if (Number.isFinite(P.tx)) q.push([P.tx, f.m * P.tx + f.b]); return q; },
  valid: P => fin(P.n) && P.n >= 2 && P.n <= RN && Math.round(P.n) === P.n && regPts(P).every(q => fin(q[0], q[1])) && (P.tx === undefined || Number.isFinite(P.tx)) && !!regFit(P),
  draw(g, t, C, lv, P) {
    const f = regFit(P), { pts, m, b, mx, my } = f, bd = g.b, e1 = ease(seg(t, .1, .35)), e2 = ease(seg(t, .35, .6)), e3 = seg(t, .6, .82), e4 = ease(seg(t, .82, 1));
    const s = t < .35 ? NaN : t < .6 ? m + (1 - e2) * 1.3 * Math.cos(e2 * 7) : m, hasTx = Number.isFinite(P.tx);
    const yl = x => (t < .6 ? my + s * (x - mx) : m * x + b);
    if (Number.isFinite(s) || t >= .6) {
      const sse = pts.reduce((u, q) => u + Math.pow(q[1] - yl(q[0]), 2), 0);
      pts.forEach(q => { const yy = yl(q[0]), r = q[1] - yy, sd = Math.abs(r); g.poly([[q[0], q[1]], [q[0], yy], [q[0] + sd, yy], [q[0] + sd, q[1]]], C.a, .16); g.L(q[0], q[1], q[0], yy, C.a, 1.6, null, .8); });
      g.L(bd.x0 - 1, yl(bd.x0 - 1), bd.x1 + 1, yl(bd.x1 + 1), C.ink, 3.5);
      corner(g, 'total square area = ' + fmt(sse, 3), C.a);
    }
    if (e1 > 0) { g.L(mx, bd.y0, mx, my, C.b, 1.6, [4, 4], e1); g.L(bd.x0, my, mx, my, C.b, 1.6, [4, 4], e1); g.D(mx, my, C.b, 7 * e1); if (e1 >= 1) g.T('mean (' + fmt(mx, 2) + ', ' + fmt(my, 2) + ')', mx, my, C.b, { dy: 22, size: 12 }); }
    pts.forEach((q, i) => g.D(q[0], q[1], C.c, 7));
    if (e4 > 0 && hasTx) { const yT = m * P.tx + b; g.L(P.tx, bd.y0, P.tx, yT, C.g, 2.2, [5, 4], e4); g.D(P.tx, yT, C.g, 8 * e4); if (e4 >= 1) g.T('x = ' + fmt(P.tx) + ' → y ≈ ' + fmt(yT, 3), P.tx, yT, C.g, { dy: -22, size: 13 }); }
    const k = t < .1 ? 0 : t < .35 ? 1 : t < .6 ? 2 : t < .82 ? 3 : 4, rtxt = Number.isFinite(f.r) ? fmt(f.r) : 'undefined (all y are equal)';
    const pred = hasTx ? ' At x = ' + fmt(P.tx) + ' the line predicts y ≈ ' + fmt(m * P.tx + f.b, 3) + '.' : '';
    return pick(lv, ['Here are ' + f.n + ' data points. We want the straight line that fits them best.', 'The best line always goes through the mean point (x̄, ȳ) = (' + fmt(mx, 3) + ', ' + fmt(my, 3) + '): the average across and the average up.',
      'Tilt the line and watch the squares. Each square’s side is the miss between a dot and the line. The best tilt makes the total square area smallest.', 'Best line: ' + regEq(f) + '. The total square area is ' + fmt(f.sse, 3) + '.',
      'r = ' + rtxt + (Number.isFinite(f.r) ? ' (close to 1 or −1 means the dots hug the line).' : '.') + pred],
      ['n = ' + f.n + ',  Σx = ' + fmt(f.sx) + ',  Σy = ' + fmt(f.sy) + ',  Σxy = ' + fmt(f.sxy) + ',  Σx² = ' + fmt(f.sxx) + '.', 'x̄ = Σx/n = ' + fmt(mx, 4) + ',  ȳ = Σy/n = ' + fmt(my, 4) + ': the line passes through (x̄, ȳ).',
       'Minimise S(m, b) = Σ(yᵢ − mxᵢ − b)². Each square shows one residual².', 'm = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²) = ' + fmt(f.num) + '/' + fmt(f.den) + ' = ' + fmt(m) + ',  b = (Σy − mΣx)/n = ' + fmt(f.b) + ';  S = ' + fmt(f.sse, 4) + '.',
       'r = ' + rtxt + (Number.isFinite(f.r) ? ',  r² = ' + fmt(f.r * f.r) + '.' : '.') + pred])[k];
  },
  out: (P, lv) => { const f = regFit(P); return regEq(f) + ';  r = ' + (Number.isFinite(f.r) ? fmt(f.r) : 'undefined (all y equal)') + (Number.isFinite(P.tx) ? ';  prediction at x = ' + fmt(P.tx) + ': y = ' + fmt(f.m * P.tx + f.b) : ''); } });
MORE.extras.regress = { chip: 'Best-fit line', marks: [0, .1, .35, .6, .82], ranges: Object.assign({ n: [2, RN, 1], tx: [-2, 12, .5] }, ...Array.from({ length: RN }, (_, i) => ({ ['x' + (i + 1)]: [-2, 12, 1], ['y' + (i + 1)]: [-2, 12, 1] }))),
  handles: P => regPts(P).map((q, i) => ({ k: 'p' + (i + 1), x: q[0], y: q[1], label: 'P' + (i + 1) })),
  drag: (P, k, x, y) => { const i = +k.slice(1); return i >= 1 ? Object.assign({}, P, { ['x' + i]: x, ['y' + i]: y }) : null; },
  challenges: [
    { id: 't10-reg-perfect', text: T2('Move one dot so that all the dots lie exactly on one straight line (r = 1).', 'Change a point so that r = 1.'), hint: T2('The first four dots climb 1 across, 1 up. Put the fifth at (5, 6).', 'The points (1,2), (2,3), (3,4), (4,5) lie on y = x + 1; set y₅ = 6.'), check: P => { const f = regFit(P); return !!f && Number.isFinite(f.r) && f.r > 1 - 1e-9; } },
    { id: 't10-reg-flat', text: T2('Change the heights so the best-fit line is perfectly flat (slope 0).', 'Choose the yᵢ so that nΣxy − ΣxΣy = 0, i.e. m = 0.'), hint: T2('Make the heights rise and then fall symmetrically, like a hill: 3, 5, 6, 5, 3.', 'A symmetric set such as y = 3, 5, 6, 5, 3 at x = 1…5 has Σ(x − x̄)(y − ȳ) = 0.'), check: P => { const f = regFit(P); return !!f && Math.abs(f.m) < 1e-9; } },
    { id: 't10-reg-pred5', text: T2('Choose the test x so the line predicts y = 5.', 'Choose x so that m·x + b = 5.'), hint: T2('The line is y = 0.8x + 1.4. Solve 0.8x + 1.4 = 5.', 'x = (5 − b)/m = 4.5 for y = 0.8x + 1.4.'), check: P => { const f = regFit(P); return !!f && Number.isFinite(P.tx) && Math.abs(f.m * P.tx + f.b - 5) < 1e-9; } }] };
MORE.hooks.regress = 'Hours studied against marks scored: what line best predicts a mark for 3.5 hours?';
BINDINGS.push({ scene: 'regress', ids: [], sig: 'regression', present: root => !!root.querySelector('.dataX') && !!root.querySelector('#computeRegressionBtn') && !!root.querySelector('#testRegX'),
  read: root => {
    root.querySelectorAll('input[id^="regX"],input[id^="regY"]').forEach(e => e.removeAttribute('id'));
    const rows = []; root.querySelectorAll('.data-row').forEach(r => { const X = r.querySelector('.dataX'), Y = r.querySelector('.dataY'); if (!X || !Y) return; const x = parseFloat(X.value), y = parseFloat(Y.value); if (Number.isFinite(x) && Number.isFinite(y)) rows.push([x, y, X, Y]); });
    if (rows.length < 2 || rows.length > RN) return null;
    const P = { n: rows.length }; for (let i = 1; i <= RN; i++) { const r = rows[i - 1]; P['x' + i] = r ? r[0] : 0; P['y' + i] = r ? r[1] : 0; if (r) { r[2].id = 'regX' + i; r[3].id = 'regY' + i; } }
    const tx = parseFloat((root.querySelector('#testRegX') || {}).value); if (Number.isFinite(tx)) P.tx = tx;
    return P;
  },
  set: P => { const o = {}; for (let i = 1; i <= P.n; i++) { o['regX' + i] = P['x' + i]; o['regY' + i] = P['y' + i]; } return o; } });

// ======================= 10. Computational geometry: line algorithms =======================
const cgO = (ax, ay, bx, by, cx, cy) => { const v = (by - ay) * (cx - bx) - (bx - ax) * (cy - by); return Math.abs(v) < 1e-10 ? 0 : v > 0 ? 1 : 2; };   // 0 collinear, 1 clockwise, 2 counterclockwise (as the card)
const cgOn = (ax, ay, bx, by, cx, cy) => Math.min(ax, bx) <= cx + 1e-10 && cx <= Math.max(ax, bx) + 1e-10 && Math.min(ay, by) <= cy + 1e-10 && cy <= Math.max(ay, by) + 1e-10;
const cgInfo = P => {
  const { x1, y1, x2, y2, x3, y3, x4, y4 } = P, a1 = y2 - y1, b1 = x1 - x2, c1 = a1 * x1 + b1 * y1, a2 = y4 - y3, b2 = x3 - x4, c2 = a2 * x3 + b2 * y3, det = a1 * b2 - a2 * b1, o = { a1, b1, c1, a2, b2, c2, det };
  if (Math.abs(det) >= 1e-10) o.pt = [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det];
  else o.same = Math.abs((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)) < 1e-9 * (1 + Math.hypot(x2 - x1, y2 - y1) * Math.hypot(x3 - x1, y3 - y1));
  o.o = cgO(x1, y1, x2, y2, x3, y3); o.cross = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
  o.area2 = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2); o.col = Math.abs(o.area2) < 1e-10;
  o.o1 = cgO(x1, y1, x2, y2, x3, y3); o.o2 = cgO(x1, y1, x2, y2, x4, y4); o.o3 = cgO(x3, y3, x4, y4, x1, y1); o.o4 = cgO(x3, y3, x4, y4, x2, y2);
  o.gen = o.o1 !== o.o2 && o.o3 !== o.o4; o.hit = o.gen || (o.o1 === 0 && cgOn(x1, y1, x2, y2, x3, y3)) || (o.o2 === 0 && cgOn(x1, y1, x2, y2, x4, y4)) || (o.o3 === 0 && cgOn(x3, y3, x4, y4, x1, y1)) || (o.o4 === 0 && cgOn(x3, y3, x4, y4, x2, y2));
  o.spt = o.gen && o.pt ? o.pt : null;
  return o;
};
const turnWord = o => (o === 0 ? 'COLLINEAR (points lie on a straight line)' : o === 1 ? 'CLOCKWISE (right turn)' : 'COUNTERCLOCKWISE (left turn)');
const sideCol = s => (Math.abs(s) < 1e-10 ? C.ink : s > 0 ? C.g : C.a);
const crossAt = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
mk('cgeom', 10, 'Line algorithms: crossing, turning, collinear, segments', 'Class 11–12',
  [['x1', 'x₁', 0], ['y1', 'y₁', 0], ['x2', 'x₂', 4], ['y2', 'y₂', 4], ['x3', 'x₃', 0], ['y3', 'y₃', 4], ['x4', 'x₄', 4], ['y4', 'y₄', 0]],
  ['Computers test shapes with a few simple sums. Each test here uses only the numbers of the points.', 'Intersection: Δ = a₁b₂ − a₂b₁.  Orientation: sign of (B − A) × (C − A).  Collinear: area = 0.  Segments: orientation tests on both pairs of endpoints'], {
  selects: { alg: ['Test', ['line intersection', 'turn direction (orientation)', 'collinearity check', 'segment intersection']] },
  fit: P => (P.alg === 1 || P.alg === 2 ? [[P.x1, P.y1], [P.x2, P.y2], [P.x3, P.y3], [0, 0]] : [[P.x1, P.y1], [P.x2, P.y2], [P.x3, P.y3], [P.x4, P.y4], [0, 0]].concat((() => { const o = cgInfo(P); return o.pt && Math.abs(o.pt[0]) < 40 && Math.abs(o.pt[1]) < 40 ? [o.pt] : []; })())),
  valid: P => fin(P.x1, P.y1, P.x2, P.y2, P.x3, P.y3, P.x4, P.y4),
  draw(g, t, C, lv, P) {
    const o = cgInfo(P), { x1, y1, x2, y2, x3, y3, x4, y4 } = P, A = [x1, y1], B = [x2, y2], Cc = [x3, y3], D = [x4, y4], alg = P.alg;
    const lab = (nm, p, col, dx, dy) => { g.D(p[0], p[1], col, 7); g.T(nm + ptStr(p[0], p[1]), p[0], p[1], col, { dx: dx || 0, dy: dy == null ? -18 : dy, size: 13 }); };
    if (alg === 0) {   // two lines, each through two points
      const e1 = ease(seg(t, .06, .3)), e2 = ease(seg(t, .3, .55)), e4 = ease(seg(t, .78, 1));
      if (Math.hypot(o.a1, o.b1) > 0) g.LL(o.a1, o.b1, -o.c1, C.c, 3, null, e1); if (Math.hypot(o.a2, o.b2) > 0) g.LL(o.a2, o.b2, -o.c2, C.g, 3, null, e2);
      lab('P₁', A, C.c, -8, -18); lab('P₂', B, C.c, 8, 18); if (e2 > 0) { lab('Q₁', Cc, C.g, -8, -18); lab('Q₂', D, C.g, 8, 18); }
      if (o.pt && t > .78) { g.D(o.pt[0], o.pt[1], C.a, 10 * e4); g.T('(' + fmt(o.pt[0]) + ', ' + fmt(o.pt[1]) + ')', o.pt[0], o.pt[1], C.a, { dy: -24, size: 14 }); }
      else if (t > .78) g.T(o.same ? 'the same line' : 'parallel: no crossing', (x1 + x3) / 2, (y1 + y3) / 2, C.a, { dy: 30, size: 14 });
      const kk = t < .3 ? 0 : t < .55 ? 1 : t < .78 ? 2 : 3;
      return pick(lv, ['Line 1 goes through P₁' + ptStr(x1, y1) + ' and P₂' + ptStr(x2, y2) + '.', 'Line 2 goes through Q₁' + ptStr(x3, y3) + ' and Q₂' + ptStr(x4, y4) + '.', 'Turn each pair of points into a line equation, then look for the one point that fits both.',
        o.pt ? 'Solving both equations together gives the crossing point ' + ptStr(o.pt[0], o.pt[1]) + '.' : (o.same ? 'The two lines lie exactly on top of each other.' : 'The lines run the same way and never cross.')][kk],
        ['P₁' + ptStr(x1, y1) + ', P₂' + ptStr(x2, y2) + ':  a₁ = y₂ − y₁ = ' + fmt(o.a1) + ', b₁ = x₁ − x₂ = ' + fmt(o.b1) + ', c₁ = a₁x₁ + b₁y₁ = ' + fmt(o.c1) + '.', 'Q₁' + ptStr(x3, y3) + ', Q₂' + ptStr(x4, y4) + ':  a₂ = ' + fmt(o.a2) + ', b₂ = ' + fmt(o.b2) + ', c₂ = ' + fmt(o.c2) + '.',
         'Δ = a₁b₂ − a₂b₁ = ' + fmt(o.det) + (Math.abs(o.det) < 1e-10 ? ' ≈ 0 → parallel or coincident.' : ' ≠ 0 → the lines cross.'), o.pt ? 'x = (c₁b₂ − c₂b₁)/Δ = ' + fmt(o.pt[0]) + ',  y = (a₁c₂ − a₂c₁)/Δ = ' + fmt(o.pt[1]) + '.' : 'No single crossing point.'][kk]);
    }
    if (alg === 1) {   // orientation of A → B → C
      const e1 = ease(seg(t, .12, .38)), e2 = ease(seg(t, .38, .64)), e3 = ease(seg(t, .64, .85)), e4 = ease(seg(t, .85, 1)), col = o.o === 0 ? C.ink : o.o === 1 ? C.a : C.g;
      if (e4 > 0) g.poly([A, B, Cc], col, .14 * e4);
      kit.arrow(g, x1, y1, lerp(x1, x2, e1), lerp(y1, y2, e1), C.c, 4); if (e2 > 0) kit.arrow(g, x2, y2, lerp(x2, x3, e2), lerp(y2, y3, e2), C.g, 4);
      if (e3 > 0 && o.o !== 0) { const th = Math.atan2(y2 - y1, x2 - x1), ph = Math.atan2(crossAt(0, 0, x2 - x1, y2 - y1, x3 - x2, y3 - y2), (x2 - x1) * (x3 - x2) + (y2 - y1) * (y3 - y2)); kit.arc(g, x2, y2, 30, th, th + ph * e3, col, .3); }
      lab('A', A, C.c, -8, -18); lab('B', B, C.ink, 10, 18); lab('C', Cc, C.g, 8, -18);
      if (e4 >= 1) g.T(o.o === 0 ? 'straight on' : o.o === 1 ? 'right turn' : 'left turn', (x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3, col, { size: 14 });
      const k = t < .12 ? 0 : t < .38 ? 1 : t < .64 ? 2 : t < .85 ? 3 : 4;
      return pick(lv, ['Three points A' + ptStr(x1, y1) + ', B' + ptStr(x2, y2) + ', C' + ptStr(x3, y3) + '. Walk A → B → C.', 'First walk from A to B.', 'Then walk from B to C. Do you turn left or right at B?',
        'Multiply across to test the turn: (Bx − Ax)(Cy − Ay) − (By − Ay)(Cx − Ax) = ' + fmt(o.cross) + '.', o.o === 0 ? 'The sum is 0: you go straight on (collinear).' : (o.o === 2 ? 'The sum is positive: you turn LEFT (counterclockwise).' : 'The sum is negative: you turn RIGHT (clockwise).')],
        ['A' + ptStr(x1, y1) + ', B' + ptStr(x2, y2) + ', C' + ptStr(x3, y3) + '.', 'AB = ' + ptStr(x2 - x1, y2 - y1) + '.', 'BC = ' + ptStr(x3 - x2, y3 - y2) + '.', 'Cross = (Bx − Ax)(Cy − Ay) − (By − Ay)(Cx − Ax) = ' + fmt(x2 - x1) + '·' + fmt(y3 - y1) + ' − ' + fmt(y2 - y1) + '·' + fmt(x3 - x1) + ' = ' + fmt(o.cross) + '.',
         'Cross ' + (o.o === 0 ? '= 0' : o.cross > 0 ? '> 0' : '< 0') + ' → ' + turnWord(o.o) + '.'])[k];
    }
    if (alg === 2) {   // collinearity through the triangle area
      const e1 = ease(seg(t, .15, .45)), e2 = ease(seg(t, .45, .75)), e3 = ease(seg(t, .75, 1)), same = Math.hypot(x2 - x1, y2 - y1) < 1e-12;
      if (!same) g.LL(y2 - y1, x1 - x2, -((y2 - y1) * x1 + (x1 - x2) * y1), C.c, 3, [8, 6], e1);
      if (e2 > 0) g.poly([A, B, Cc], o.col ? C.g : C.a, .16 * e2);
      if (e2 > 0 && !same) { const f = foot({ px: x3, py: y3, a: y2 - y1, b: x1 - x2, c: -((y2 - y1) * x1 + (x1 - x2) * y1) }); g.L(x3, y3, lerp(x3, f[0], e2), lerp(y3, f[1], e2), C.b, 2.4, [5, 4]); }
      lab('A', A, C.c, -8, -18); lab('B', B, C.c, 8, 18); lab('C', Cc, o.col ? C.g : C.a, 8, -18);
      if (e3 > 0) g.T('area = ' + fmt(Math.abs(o.area2) / 2) + (o.col ? '  → on one line' : ''), (x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3, o.col ? C.g : C.a, { dy: 30, size: 14 });
      const k = t < .15 ? 0 : t < .45 ? 1 : t < .75 ? 2 : 3;
      return pick(lv, ['Three points A' + ptStr(x1, y1) + ', B' + ptStr(x2, y2) + ', C' + ptStr(x3, y3) + '. Are they on one straight line?', 'Draw the line through A and B.', 'Join the three points into a triangle. If C is on the line, the triangle is flat: its area is 0. Here the area is ' + fmt(Math.abs(o.area2) / 2) + '.',
        o.col ? 'The area is 0, so the points are COLLINEAR.' : 'The area is not 0, so the points are NOT collinear.'],
        ['A' + ptStr(x1, y1) + ', B' + ptStr(x2, y2) + ', C' + ptStr(x3, y3) + '.', 'The line through A and B.', 'Area = ½|x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)| = ½|' + fmt(o.area2) + '| = ' + fmt(Math.abs(o.area2) / 2) + '.', 'Area ' + (o.col ? '≈ 0' : '≠ 0') + ' → the points are ' + (o.col ? 'collinear' : 'not collinear') + '.'])[k];
    }
    // segments AB and CD
    const e1 = ease(seg(t, .15, .4)), e2 = ease(seg(t, .4, .65)), e3 = ease(seg(t, .65, 1)), lineAB = [y2 - y1, x1 - x2, -((y2 - y1) * x1 + (x1 - x2) * y1)], lineCD = [y4 - y3, x3 - x4, -((y4 - y3) * x3 + (x3 - x4) * y3)];
    if (e1 > 0 && Math.hypot(lineAB[0], lineAB[1]) > 0) g.LL(lineAB[0], lineAB[1], lineAB[2], C.c, 1.8, [6, 6], .8 * e1); if (e2 > 0 && Math.hypot(lineCD[0], lineCD[1]) > 0) g.LL(lineCD[0], lineCD[1], lineCD[2], C.g, 1.8, [6, 6], .8 * e2);
    g.L(x1, y1, x2, y2, C.c, 4); g.L(x3, y3, x4, y4, C.g, 4);
    const sC = e1 > 0 ? crossAt(x1, y1, x2, y2, x3, y3) : 0, sD = e1 > 0 ? crossAt(x1, y1, x2, y2, x4, y4) : 0, sA = e2 > 0 ? crossAt(x3, y3, x4, y4, x1, y1) : 0, sB = e2 > 0 ? crossAt(x3, y3, x4, y4, x2, y2) : 0;
    g.D(x1, y1, e2 > 0 ? sideCol(sA) : C.c, 8); g.D(x2, y2, e2 > 0 ? sideCol(sB) : C.c, 8); g.D(x3, y3, e1 > 0 ? sideCol(sC) : C.g, 8); g.D(x4, y4, e1 > 0 ? sideCol(sD) : C.g, 8);
    [['A', A, -10, -16], ['B', B, 10, 16], ['C', Cc, -10, -16], ['D', D, 10, 16]].forEach(q => g.T(q[0], q[1][0], q[1][1], C.ink, { dx: q[2], dy: q[3], size: 14 }));
    if (e3 > 0 && o.hit) { const hp = o.spt || (o.o1 === 0 && cgOn(x1, y1, x2, y2, x3, y3) ? Cc : o.o2 === 0 && cgOn(x1, y1, x2, y2, x4, y4) ? D : o.o3 === 0 && cgOn(x3, y3, x4, y4, x1, y1) ? A : B); g.D(hp[0], hp[1], C.a, 11 * e3); g.T('touch ' + ptStr(hp[0], hp[1]), hp[0], hp[1], C.a, { dy: -24, size: 14 }); }
    const k = t < .15 ? 0 : t < .4 ? 1 : t < .65 ? 2 : 3, opp1 = o.o1 !== o.o2, opp2 = o.o3 !== o.o4, nm = o => ['collinear', 'clockwise', 'counterclockwise'][o];
    return pick(lv, ['Segment AB' + ' from ' + ptStr(x1, y1) + ' to ' + ptStr(x2, y2) + ' and segment CD from ' + ptStr(x3, y3) + ' to ' + ptStr(x4, y4) + '. Do they touch?', 'Extend AB into a line. Are C and D on opposite sides of it? ' + (opp1 ? 'Yes (different colours).' : 'No (same side).'),
      'Now extend CD. Are A and B on opposite sides of it? ' + (opp2 ? 'Yes.' : 'No.'), o.hit ? (o.gen ? 'Both pairs are on opposite sides, so the segments cross.' : 'One end lies exactly on the other segment, so they touch.') : 'At least one pair is on the same side, so the segments do NOT meet.'],
      ['AB: A' + ptStr(x1, y1) + ' → B' + ptStr(x2, y2) + ';  CD: C' + ptStr(x3, y3) + ' → D' + ptStr(x4, y4) + '.', 'orient(A,B,C) = ' + o.o1 + ' (' + nm(o.o1) + '), orient(A,B,D) = ' + o.o2 + ' (' + nm(o.o2) + ')  → ' + (opp1 ? 'differ.' : 'equal.'),
       'orient(C,D,A) = ' + o.o3 + ' (' + nm(o.o3) + '), orient(C,D,B) = ' + o.o4 + ' (' + nm(o.o4) + ')  → ' + (opp2 ? 'differ.' : 'equal.'), o.gen ? 'Both pairs differ → the segments intersect' + (o.spt ? ' at ' + ptStr(o.spt[0], o.spt[1]) : '') + '.' : (o.hit ? 'A collinear end lies on the other segment → they intersect.' : 'Not both pairs differ, and no collinear end lies on a segment → no intersection.')])[k];
  },
  out: (P, lv) => {
    const o = cgInfo(P);
    if (P.alg === 0) return o.pt ? 'Intersection at ' + ptStr(o.pt[0], o.pt[1]) : 'Lines are parallel or coincident' + (o.same ? '  (they are the same line)' : '  (parallel: no common point)');
    if (P.alg === 1) return turnWord(o.o);
    if (P.alg === 2) return o.col ? 'Points are COLLINEAR' : 'Points are NOT collinear';
    return o.hit ? 'Segments INTERSECT' + (o.spt ? ' at ' + ptStr(o.spt[0], o.spt[1]) : '') : 'Segments do NOT intersect';
  } });
const cgNames = P => (P.alg === 1 || P.alg === 2 ? ['A', 'B', 'C'] : ['P₁', 'P₂', 'Q₁', 'Q₂']);
MORE.extras.cgeom = { chip: 'Line algorithms', marks: [0, .12, .38, .64, .85], ranges: rg(['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'], [-6, 8, 1]),
  handles: P => cgNames(P).map((nm, i) => ({ k: String(i + 1), x: P['x' + (i + 1)], y: P['y' + (i + 1)], label: nm })),
  drag: (P, k, x, y) => Object.assign({}, P, { ['x' + k]: x, ['y' + k]: y }),
  challenges: [
    { id: 't10-cg-right', text: T2('Make the walk A → B → C turn RIGHT (clockwise).', 'Make the cross product (B − A) × (C − A) negative (orientation test).'), hint: T2('Move C to the other side of the path A → B.', 'Take C = (4, 0): the cross product is −16.'), check: P => (P.alg === 1) && cgO(P.x1, P.y1, P.x2, P.y2, P.x3, P.y3) === 1 },
    { id: 't10-cg-col', text: T2('Put A, B and C on one straight line.', 'Make the triangle area 0, so the three points are collinear.'), hint: T2('Put C exactly on the line from A to B. Try C = (2, 2).', 'A(0, 0), B(4, 4), C(2, 2) have area 0.'), check: P => (P.alg === 1 || P.alg === 2) && Math.abs(cgInfo(P).area2) < 1e-10 },
    { id: 't10-cg-miss', text: T2('Make the two segments miss each other (use the segment test).', 'In the segment-intersection test, make AB and CD disjoint.'), hint: T2('Move D so that both C and D are above the line AB: try D = (1, 3).', 'C(0, 4) and D(1, 3) are on the same side of line y = x.'), check: P => P.alg === 3 && !cgInfo(P).hit },
    { id: 't10-cg-par', text: T2('In the line test, make the two lines parallel (no crossing point).', 'In the line-intersection test, make Δ = a₁b₂ − a₂b₁ = 0.'), hint: T2('Line 2 must have the same direction as line 1: from (0, 4) go 4 across and 4 up.', 'Q₂ = (4, 8) gives Q₂ − Q₁ = (4, 4) ∥ P₂ − P₁.'), check: P => P.alg === 0 && Math.abs(cgInfo(P).det) < 1e-10 }] };
MORE.hooks.cgeom = 'A robot checks if its two arms collide and whether it turns left or right: a few sums are enough.';
const cgAlgOf = { intersection: 0, orientation: 1, collinearity: 2, segments: 3 };
BINDINGS.push({ scene: 'cgeom', ids: [], sig: 'compgeom', present: root => !!root.querySelector('input[name="cgType"]') && !!root.querySelector('#cgP1x') && !!root.querySelector('#cgAx'),
  read: root => {
    const ty = (root.querySelector('input[name="cgType"]:checked') || {}).value || 'intersection', alg = cgAlgOf[ty] == null ? 0 : cgAlgOf[ty], f = ids => ids.map(i => numOf(root, i));
    const v = alg === 0 || alg === 3 ? f(['cgP1x', 'cgP1y', 'cgP2x', 'cgP2y', 'cgQ1x', 'cgQ1y', 'cgQ2x', 'cgQ2y']) : f(['cgAx', 'cgAy', 'cgBx', 'cgBy', 'cgCx', 'cgCy']).concat([0, 0]);
    if (!v.every(Number.isFinite)) return null;
    return { alg, x1: v[0], y1: v[1], x2: v[2], y2: v[3], x3: v[4], y3: v[5], x4: v[6], y4: v[7] };
  },
  set: P => (P.alg === 1 || P.alg === 2 ? { cgAx: P.x1, cgAy: P.y1, cgBx: P.x2, cgBy: P.y2, cgCx: P.x3, cgCy: P.y3 } : { cgP1x: P.x1, cgP1y: P.y1, cgP2x: P.x2, cgP2y: P.y2, cgQ1x: P.x3, cgQ1y: P.y3, cgQ2x: P.x4, cgQ2y: P.y4 }) });
});
