// ========= Animation Studio: extra scenes, part 3 (tab 8 equations and tab 9 conic cards) =========
// Loaded before ConceptStudio.js. Same pattern as StudioMore1.js: mk(...) scenes, MORE.extras, MORE.hooks, BINDINGS.push.
(window.__studioParts = window.__studioParts || []).push(function (E, scenes, BINDINGS, MORE) {
'use strict';
const { C, FONT, EPS, pick, ease, seg, lerp, fmt, fin, eqStr, slopeEq, foot } = E;
const T2 = (s, i) => [s, i || s];
const R8 = [-8, 8, 1];
const D2R = Math.PI / 180;
const rg = (keys, r) => Object.fromEntries(keys.map(k => [k, r]));
const mk = (id, tab, title, tag, params, f, o) => { const sc = Object.assign({ id, tab, title, tag, params, f }, o); scenes.push(sc); return sc; };
const ptStr = (x, y) => '(' + fmt(x) + ', ' + fmt(y) + ')';
const chk = (root, name) => { const e = root.querySelector('input[type="radio"][name="' + name + '"]:checked'); return e ? e.value : ''; };
const num = (tx, id) => parseFloat(tx(id));

// ---------- helpers for equations Ax² + Bxy + Cy² + Dx + Ey + F = 0, stored as [A, B, C, D, E, F] ----------
const co6 = P => [P.A, P.B, P.C, P.D, P.E, P.F];
const evalP = (co, x, y) => co[0] * x * x + co[1] * x * y + co[2] * y * y + co[3] * x + co[4] * y + co[5];
const N4 = v => { const r = Math.round(v * 1e4) / 1e4; return Math.abs(r) < 1e-9 ? 0 : r; };
// "3X² − Y² − 4 = 0" written neatly
const polyStr = (co, vx, vy) => {
  const names = [vx + '²', vx + vy, vy + '²', vx, vy, ''];
  let s = '';
  co.forEach((v, i) => { v = N4(v); if (!v) return; const m = Math.abs(v), body = (names[i] && Math.abs(m - 1) < 1e-9) ? names[i] : fmt(m) + names[i]; s += (s ? (v < 0 ? ' − ' : ' + ') : (v < 0 ? '−' : '')) + body; });
  return (s || '0') + ' = 0';
};
// product of two affine forms (p x + q y + r) as [xx, xy, yy, x, y, 1]
const mul = (u, v) => [u[0] * v[0], u[0] * v[1] + u[1] * v[0], u[1] * v[1], u[0] * v[2] + u[2] * v[0], u[1] * v[2] + u[2] * v[1], u[2] * v[2]];
// replace x by the affine form U and y by V inside the equation co
const subst = (co, U, V) => {
  const uu = mul(U, U), uv = mul(U, V), vv = mul(V, V), r = [0, 1, 2, 3, 4, 5].map(i => co[0] * uu[i] + co[1] * uv[i] + co[2] * vv[i]);
  r[3] += co[3] * U[0] + co[4] * V[0]; r[4] += co[3] * U[1] + co[4] * V[1]; r[5] += co[3] * U[2] + co[4] * V[2] + co[5];
  return r.map(v => (Math.abs(v) < 1e-9 ? 0 : v));
};
// new axes: origin O'(h, k), turned by th degrees.   x = h + X cos − Y sin,  y = k + X sin + Y cos
const mapOld = (co, h, k, th) => { const c = Math.cos(th * D2R), s = Math.sin(th * D2R); return subst(co, [c, -s, h], [s, c, k]); };          // equation in (x, y) -> equation in (X, Y)
const mapNew = (co, h, k, th) => { const c = Math.cos(th * D2R), s = Math.sin(th * D2R); return subst(co, [c, s, -(h * c + k * s)], [-s, c, h * s - k * c]); };   // equation in (X, Y) -> equation in (x, y)
const kindOf = co => {
  const A = co[0], B = co[1], Cc = co[2];
  if (Math.abs(A) < 1e-9 && Math.abs(B) < 1e-9 && Math.abs(Cc) < 1e-9) return 'straight line';
  const d = B * B - 4 * A * Cc, s = Math.max(1, B * B, Math.abs(4 * A * Cc));
  if (Math.abs(d) < 1e-9 * s) return 'parabola';
  if (d < 0) return Math.abs(B) < 1e-9 && Math.abs(A - Cc) < 1e-9 ? 'circle' : 'ellipse';
  return 'hyperbola';
};
// box around the visible part of the curve (null if the curve is not in view)
const curveBox = (co, lim = 8) => {
  const n = 64, st = 2 * lim / n, v = []; let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let j = 0; j <= n; j++) { const row = []; for (let i = 0; i <= n; i++) row.push(evalP(co, -lim + i * st, -lim + j * st)); v.push(row); }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = v[j][i] > 0, b = v[j][i + 1] > 0, d = v[j + 1][i] > 0;
    if (a !== b || a !== d) { const x = -lim + i * st, y = -lim + j * st; x0 = Math.min(x0, x); x1 = Math.max(x1, x + st); y0 = Math.min(y0, y); y1 = Math.max(y1, y + st); }
  }
  return x0 === Infinity ? null : [[x0, y0], [x1, y1]];
};
// reads a typed equation such as "X^2 + Y^2 - 9 = 0" or "2x^2+xy=1" and returns [A, B, C, D, E, F], or null
function parseEq(str) {
  if (typeof str !== 'string') return null;
  let s = str.toLowerCase().replace(/\s+/g, '').replace(/²/g, '^2').replace(/−/g, '-').replace(/[×·]/g, '*');
  if (!s || (s.match(/=/g) || []).length > 1) return null;
  if (s.indexOf('=') >= 0) { const parts = s.split('='); if (!parts[0] || !parts[1]) return null; s = '(' + parts[0] + ')-(' + parts[1] + ')'; }
  if (!/^[0-9xy+\-*/().^]+$/.test(s)) return null;
  s = s.replace(/(\d|\)|x|y)(?=[xy(])/g, '$1*').replace(/([xy]|\d+(?:\.\d+)?|\([^()]*\))\^(\d+(?:\.\d+)?)/g, 'Math.pow($1,$2)').replace(/\^/g, '**');
  let f; try { f = new Function('x', 'y', 'return ' + s + ';'); } catch (e) { return null; }
  const g = (x, y) => { try { const v = f(x, y); return typeof v === 'number' ? v : NaN; } catch (e) { return NaN; } };
  const f00 = g(0, 0), f10 = g(1, 0), fm10 = g(-1, 0), f01 = g(0, 1), f0m1 = g(0, -1), f11 = g(1, 1);
  const F = f00, A = (f10 + fm10) / 2 - F, D = (f10 - fm10) / 2, Cc = (f01 + f0m1) / 2 - F, Ee = (f01 - f0m1) / 2, B = f11 - A - Cc - D - Ee - F;
  const co = [A, B, Cc, D, Ee, F].map(v => (Math.abs(v) < 1e-12 ? 0 : v));
  if (!co.every(Number.isFinite) || (!co[0] && !co[1] && !co[2] && !co[3] && !co[4])) return null;
  const probes = [[2, 3], [-1.5, 2], [3, -2], [.5, -4]];
  for (const q of probes) { const v = g(q[0], q[1]); if (!Number.isFinite(v) || Math.abs(v - evalP(co, q[0], q[1])) > 1e-6 * (1 + Math.abs(v))) return null; }
  return co;
}
const eqParams = co => ({ A: co[0], B: co[1], C: co[2], D: co[3], E: co[4], F: co[5] });
const clampPt = (g, x, y) => { const b = g.b, mx = (b.x1 - b.x0) * .06, my = (b.y1 - b.y0) * .06; return [Math.min(b.x1 - mx, Math.max(b.x0 + mx, x)), Math.min(b.y1 - my, Math.max(b.y0 + my, y))]; };
// the new axes X', Y' (orange): origin (ox, oy), turned by phi radians
function newAxes(g, ox, oy, phi, o) {
  o = o || {}; const cp = Math.cos(phi), sp = Math.sin(phi), R = .34 * Math.max(g.b.x1 - g.b.x0, g.b.y1 - g.b.y0), col = o.col || C.a, al = o.alpha == null ? 1 : o.alpha;
  g.LL(-sp, cp, sp * ox - cp * oy, col, 3, null, al); g.LL(cp, sp, -(cp * ox + sp * oy), col, 3, null, al);
  const lx = clampPt(g, ox + cp * R, oy + sp * R), ly = clampPt(g, ox - sp * R, oy + cp * R);
  g.T('X′', lx[0], lx[1], col, { dy: -14, size: 14 }); g.T('Y′', ly[0], ly[1], col, { dx: 14, size: 14 });
  g.D(ox, oy, col, 6.5); g.T('O′', ox, oy, col, { dx: -16, dy: 16, size: 13 });
}
// equation labels at the top-left of the canvas: rows = [[text, colour]]
function eqBox(g, rows) {
  const ctx = g.ctx; ctx.save(); let size = 13; ctx.font = '700 ' + size + 'px ' + FONT;
  let w = Math.max.apply(null, rows.map(r => ctx.measureText(r[0]).width));
  while (w > g.W - 40 && size > 9) { size--; ctx.font = '700 ' + size + 'px ' + FONT; w = Math.max.apply(null, rows.map(r => ctx.measureText(r[0]).width)); }
  const rh = size + 7, h = rows.length * rh + 6;
  ctx.globalAlpha = .9; ctx.fillStyle = C.paper; ctx.fillRect(6, 6, w + 18, h); ctx.globalAlpha = 1;
  rows.forEach((r, i) => { ctx.fillStyle = r[1]; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r[0], 15, 6 + 3 + (i + .5) * rh); });
  ctx.restore();
}
const keepIn = (arr, lim) => arr.map(p => [Math.max(-lim, Math.min(lim, p[0])), Math.max(-lim, Math.min(lim, p[1]))]);
const eqFit = (co, extra) => { const bx = curveBox(co, 6), pts = [[0, 0]].concat(extra || []); if (bx) pts.push(bx[0], bx[1]); else pts.push([-4, -3], [4, 3]); return keepIn(pts, 12); };

// ======================= Tab 8 =======================
// 1. Rotating the axes to remove the xy term (also used by "change of axes for symmetry")
const rxCalc = P => {
  const co = co6(P), A = co[0], B = co[1], Cc = co[2], D = co[3], Ee = co[4], noXY = Math.abs(B) < 1e-10;
  let th = 0, cot = NaN;
  if (!noXY) { cot = (A - Cc) / B; th = Math.abs(cot) > 1e10 ? 45 : Math.atan(1 / cot) / 2 / D2R; }
  let h = 0, k = 0, moved = false;
  if (P.then === 0) { const det = 4 * A * Cc - B * B; if (Math.abs(det) > 1e-10) { h = (B * Ee - 2 * Cc * D) / det; k = (B * D - 2 * A * Ee) / det; moved = true; } }
  return { co, th, cot, h, k, moved, noXY, nu: mapOld(co, h, k, th) };
};
mk('rotxy', 8, 'Turn the axes to remove the xy term', 'Class 11–12', [['A', 'A (x²)', 3], ['B', 'B (xy)', 2], ['C', 'C (y²)', 1], ['D', 'D (x)', 0], ['E', 'E (y)', 0], ['F', 'F', -4]],
  ['A tilted curve has an xy term. Turn the axes to match the tilt and the xy term disappears.', 'cot 2θ = (A − C)/B.  x = X cos θ − Y sin θ,  y = X sin θ + Y cos θ.  Then B′ = 0, A′ = A cos²θ + B sin θ cos θ + C sin²θ, C′ = A sin²θ − B sin θ cos θ + C cos²θ.'], {
  selects: { then: ['After turning', ['also move the origin to the centre', 'keep the origin where it is']] },
  fit: P => { const q = rxCalc(P); return eqFit(q.co, [[q.h, q.k]]); },
  valid: P => fin(P.A, P.B, P.C, P.D, P.E, P.F),
  draw(g, t, C, lv, P) {
    const q = rxCalc(P), e2 = ease(seg(t, .12, .5)), e3 = ease(seg(t, .5, .75)), phi = q.th * D2R * e2, oEq = polyStr(q.co, 'x', 'y'), nEq = polyStr(q.nu, 'X', 'Y'), kd = kindOf(q.co);
    E.kit.implicit(g, (x, y) => evalP(q.co, x, y), C.c, 3.5);
    if (t > .1) { newAxes(g, q.h * e3, q.k * e3, phi, { alpha: ease(seg(t, .08, .16)) }); if (Math.abs(q.th) > 1e-9 && e2 > 0) E.kit.arc(g, 0, 0, 46, 0, phi, C.a, .22); }
    const rows = [['old: ' + oEq, C.c]]; if (t >= .75) rows.push(['new: ' + nEq, C.a]); eqBox(g, rows);
    const k = t < .12 ? 0 : t < .5 ? 1 : t < .75 ? 2 : 3, same = q.noXY && !q.moved;
    return pick(lv, ['The curve ' + oEq + (q.noXY ? ' has no xy term.' : ' is tilted, and that is why the product term xy appears.'),
      q.noXY ? 'The xy term is already missing (B = 0), so the axes do not need to turn.' : 'Turn the axes by ' + fmt(q.th, 2) + '° until they line up with the curve.',
      q.moved ? 'Now slide the origin to the middle of the curve, ' + ptStr(q.h, q.k) + '.' : 'Write the same curve again using the turned axes.',
      'In the new axes: ' + nEq + '. ' + (same ? 'Nothing needed to change.' : 'The xy term has gone.') + ' The curve is a ' + kd + '.'],
    ['Given ' + oEq + ', so A = ' + fmt(q.co[0]) + ', B = ' + fmt(q.co[1]) + ', C = ' + fmt(q.co[2]) + '.',
      q.noXY ? 'B = 0, so θ = 0: no rotation is needed.' : 'cot 2θ = (A − C)/B = (' + fmt(q.co[0]) + ' − ' + fmt(q.co[2]) + ')/' + fmt(q.co[1]) + ' = ' + fmt(q.cot) + '  →  θ = ' + fmt(q.th, 4) + '°.',
      q.moved ? 'Centre (h, k) = ' + ptStr(q.h, q.k) + ' from 2Ah + Bk + D = 0 and Bh + 2Ck + E = 0.' : 'Put x = X cos θ − Y sin θ, y = X sin θ + Y cos θ. Then B′ = ' + fmt(q.nu[1]) + '.',
      nEq + ';  A′ = ' + fmt(q.nu[0]) + ', C′ = ' + fmt(q.nu[2]) + '  (' + kd + ').'])[k];
  },
  out: (P, lv) => { const q = rxCalc(P); if (q.noXY && !q.moved) return 'B = 0: there is no xy term to remove. The equation stays ' + polyStr(q.co, 'x', 'y'); return 'θ = ' + fmt(q.th, 2) + '°' + (q.moved && Math.abs(q.h) + Math.abs(q.k) > 1e-9 ? ', new origin ' + ptStr(q.h, q.k) : '') + ';  ' + polyStr(q.nu, 'X', 'Y') + '  (' + kindOf(q.co) + ')'; } });
MORE.extras.rotxy = { chip: 'Remove the xy term', marks: [0, .12, .5, .75], ranges: Object.assign(rg(['A', 'B', 'C', 'D', 'E'], [-9, 9, 1]), { F: [-20, 20, 1] }),
  challenges: [{ id: 't8-rot45', text: T2('Make the axes turn by exactly 45°.', 'Choose A, B, C so that θ = 45° (cot 2θ = 0).'), hint: T2('A curve that is tilted evenly has the same number in front of x² and y². Make A = C.', 'cot 2θ = (A − C)/B = 0 when A = C (and B ≠ 0).'), check: P => { const q = rxCalc(P); return !q.noXY && Math.abs(Math.abs(q.th) - 45) < 1e-6; } },
    { id: 't8-rot-none', text: T2('Make a curve that does not need any turning.', 'Choose B so that no rotation is needed.'), hint: T2('The product term xy is what asks for the turn. Remove it.', 'B = 0 gives θ = 0.'), check: P => Math.abs(P.B) < 1e-10 },
    { id: 't8-rot-hyp', text: T2('Make the curve a hyperbola (the two branches look like two open mouths).', 'Make B² − 4AC > 0.'), hint: T2('Give x² and y² opposite signs, for example A = 1 and C = −1.', 'B² − 4AC > 0 means a hyperbola.'), check: P => kindOf(co6(P)) === 'hyperbola' }] };
MORE.hooks.rotxy = 'A tilted picture frame looks straight again if you tilt your head the same amount.';

// 2. Move the origin to the centre
const ctrCalc = P => {
  const co = co6(P), A = co[0], B = co[1], Cc = co[2], D = co[3], Ee = co[4], det = 4 * A * Cc - B * B, has = Math.abs(det) > 1e-10;
  const h = has ? (B * Ee - 2 * Cc * D) / det : 0, k = has ? (B * D - 2 * A * Ee) / det : 0;
  return { co, has, h, k, nu: has ? mapOld(co, h, k, 0) : co };
};
mk('ctrxy', 8, 'Move the origin to the centre of the curve', 'Class 11–12', [['A', 'A (x²)', 1], ['B', 'B (xy)', 0], ['C', 'C (y²)', 1], ['D', 'D (x)', -4], ['E', 'E (y)', -2], ['F', 'F', -4]],
  ['Slide the axes to the middle of the curve and the plain x and y terms vanish.', 'Centre: 2Ah + Bk + D = 0, Bh + 2Ck + E = 0, so h = (BE − 2CD)/(4AC − B²), k = (BD − 2AE)/(4AC − B²).  x = X + h, y = Y + k gives A X² + B XY + C Y² + F′ = 0 with F′ = F + Dh + Ek + Ah² + Bhk + Ck².'], {
  fit: P => { const q = ctrCalc(P); return eqFit(q.co, [[q.h, q.k]]); },
  valid: P => fin(P.A, P.B, P.C, P.D, P.E, P.F),
  draw(g, t, C, lv, P) {
    const q = ctrCalc(P), e1 = ease(seg(t, .12, .45)), e3 = ease(seg(t, .45, .78)), oEq = polyStr(q.co, 'x', 'y'), nEq = polyStr(q.nu, 'X', 'Y');
    E.kit.implicit(g, (x, y) => evalP(q.co, x, y), C.c, 3.5);
    if (e1 > 0) { g.LL(2 * q.co[0], q.co[1], q.co[3], C.g, 2.2, [7, 5], e1); g.LL(q.co[1], 2 * q.co[2], q.co[4], C.b, 2.2, [7, 5], e1); }
    if (q.has && e1 >= 1) { g.D(q.h, q.k, C.ink, 7); if (t < .78) g.T('centre ' + ptStr(q.h, q.k), q.h, q.k, C.ink, { dy: -20, size: 13 }); }
    if (t > .45 && q.has) newAxes(g, q.h * e3, q.k * e3, 0); else if (t > .45) newAxes(g, 0, 0, 0);
    const rows = [['old: ' + oEq, C.c]]; if (t >= .78) rows.push([q.has ? 'new: ' + nEq : 'no centre, so no change', C.a]); eqBox(g, rows);
    const k = t < .12 ? 0 : t < .45 ? 1 : t < .78 ? 2 : 3;
    return pick(lv, ['The curve ' + oEq + '. Where is its middle?',
      q.has ? 'Two helper lines (green and teal) cross at the middle of the curve: ' + ptStr(q.h, q.k) + '.' : 'The two helper lines are parallel, so they never cross. This curve has no middle (it is a parabola).',
      q.has ? 'Slide the origin to the middle, ' + ptStr(q.h, q.k) + '.' : 'We cannot get rid of the x and y terms by sliding the axes.',
      q.has ? 'New equation: ' + nEq + '. The plain x and y terms are gone.' : 'Answer: no single centre, so there is nothing to simplify by sliding.'],
    ['f = ' + oEq + ';  ∂f/∂x = 2Ax + By + D = 0 (green),  ∂f/∂y = Bx + 2Cy + E = 0 (teal).',
      q.has ? 'det = 4AC − B² = ' + fmt(4 * q.co[0] * q.co[2] - q.co[1] * q.co[1]) + ';  h = ' + fmt(q.h) + ', k = ' + fmt(q.k) + '.' : 'det = 4AC − B² = 0, so the two lines are parallel: B² − 4AC = 0, a parabola, no unique centre.',
      q.has ? 'Put x = X + ' + fmt(q.h) + ', y = Y + ' + fmt(q.k) + '.  F′ = F + Dh + Ek + Ah² + Bhk + Ck² = ' + fmt(q.nu[5]) + '.' : 'No translation removes both linear terms.',
      q.has ? nEq + ' (centre ' + ptStr(q.h, q.k) + ').' : 'No unique centre (parabola).'])[k];
  },
  out: (P, lv) => { const q = ctrCalc(P); return q.has ? 'Centre ' + ptStr(q.h, q.k) + ';  new equation ' + polyStr(q.nu, 'X', 'Y') : 'No unique centre (parabola): sliding the axes cannot remove the linear terms'; } });
MORE.extras.ctrxy = { chip: 'Move to the centre', marks: [0, .12, .45, .78], ranges: Object.assign(rg(['A', 'B', 'C', 'D', 'E'], [-9, 9, 1]), { F: [-20, 20, 1] }),
  challenges: [{ id: 't8-ctr-origin', text: T2('Make the centre sit exactly at the origin.', 'Choose D and E so that (h, k) = (0, 0).'), hint: T2('A curve centred at the origin has no plain x or y terms. Set D = 0 and E = 0.', 'With B = 0 the centre is (−D/2A, −E/2C).'), check: P => { const q = ctrCalc(P); return q.has && Math.abs(q.h) < 1e-9 && Math.abs(q.k) < 1e-9; } },
    { id: 't8-ctr-3m2', text: T2('Make the centre of the curve (3, −2).', 'Make (h, k) = (3, −2).'), hint: T2('For x² + y² + Dx + Ey + F, the centre is half of D and E with the signs flipped. Try D = −6 and E = 4.', 'h = −D/2A = 3 and k = −E/2C = −2 (with A = C = 1, B = 0).'), check: P => { const q = ctrCalc(P); return q.has && Math.abs(q.h - 3) < 1e-9 && Math.abs(q.k + 2) < 1e-9; } },
    { id: 't8-ctr-par', text: T2('Make a curve with no centre (a parabola).', 'Make 4AC − B² = 0.'), hint: T2('A parabola has only one of x² or y². Try C = 0 with B = 0.', 'B² = 4AC, for example A = 1, B = 0, C = 0.'), check: P => Math.abs(4 * P.A * P.C - P.B * P.B) < 1e-10 }] };
MORE.hooks.ctrxy = 'To measure an oval pond you start from its middle, not from the gate of the park.';

// 3. Equation after a change of axes (translation, rotation or both), in either direction
const amCalc = P => {
  const co = co6(P), h = P.h, k = P.k, th = P.th;
  const gN = P.dir === 1 ? co : mapOld(co, h, k, th), fO = P.dir === 1 ? mapNew(co, h, k, th) : co;
  return { gN, fO, kd: kindOf(co) };
};
mk('axmap', 8, 'Rewriting an equation in other axes', 'Class 11–12', [['A', 'A (x²)', 1], ['B', 'B (xy)', 0], ['C', 'C (y²)', 1], ['D', 'D (x)', 0], ['E', 'E (y)', 0], ['F', 'F', -9], ['h', 'h', 2], ['k', 'k', 1], ['th', 'θ (degrees)', 0]],
  ['The picture does not change, only the axes do. Replace the old letters by the new ones (or the other way round) and tidy up.', 'x = h + X cos θ − Y sin θ, y = k + X sin θ + Y cos θ  (old → new).  X = (x − h)cos θ + (y − k)sin θ, Y = −(x − h)sin θ + (y − k)cos θ  (new → old).'], {
  selects: { dir: ['The equation is given in', ['the old axes (x, y): find the new one', 'the new axes (X, Y): find the old one']] },
  fit: P => { const q = amCalc(P), R = 3, c = Math.cos(P.th * D2R), s = Math.sin(P.th * D2R); return eqFit(q.fO, [[P.h, P.k], [P.h + R * c, P.k + R * s], [P.h - R * s, P.k + R * c]]); },
  valid: P => fin(P.A, P.B, P.C, P.D, P.E, P.F, P.h, P.k, P.th),
  draw(g, t, C, lv, P) {
    const q = amCalc(P), e1 = ease(seg(t, .12, .42)), e2 = ease(seg(t, .42, .72)), phi = P.th * D2R * e2, up = P.dir === 1;
    const shiftNow = Math.abs(P.h) + Math.abs(P.k) > 1e-9, turnNow = Math.abs(P.th) > 1e-9, word = q.kd === 'straight line' ? 'line' : 'curve';
    E.kit.implicit(g, (x, y) => evalP(q.fO, x, y), C.c, 3.5);
    if (t > .1) newAxes(g, P.h * e1, P.k * e1, phi, { alpha: ease(seg(t, .08, .16)) });
    if (turnNow && e2 > 0) E.kit.arc(g, P.h, P.k, 46, 0, phi, C.a, .22);
    const gEq = polyStr(q.gN, 'X', 'Y'), fEq = polyStr(q.fO, 'x', 'y');
    const rows = [[up ? 'given (new axes): ' + gEq : 'given (old axes): ' + fEq, C.c]]; if (t >= .72) rows.push([up ? 'old axes: ' + fEq : 'new axes: ' + gEq, C.a]); eqBox(g, rows);
    const k = t < .12 ? 0 : t < .42 ? 1 : t < .72 ? 2 : 3, cs = Math.cos(P.th * D2R), sn = Math.sin(P.th * D2R);
    return pick(lv, ['The ' + word + (up ? ' is written in the NEW axes (orange): ' + gEq + '. We want its equation in the old axes.' : ' is written in the old axes: ' + fEq + '. We want its equation in the NEW axes (orange).'),
      shiftNow ? 'The new origin O′ is at ' + ptStr(P.h, P.k) + ' in the old axes.' : 'The origin stays where it is.',
      turnNow ? 'The new axes are turned by ' + fmt(P.th, 2) + '°.' : 'The axes are not turned.',
      up ? 'Swap X and Y for their old-axes values. The ' + word + ' becomes ' + fEq + ' in the old axes.' : 'Swap x and y for their new-axes values. The ' + word + ' becomes ' + gEq + ' in the new axes.'],
    [up ? 'Given in (X, Y): ' + gEq + '.' : 'Given in (x, y): ' + fEq + '.',
      shiftNow ? 'Translation: O′ = (h, k) = ' + ptStr(P.h, P.k) + '.' : 'No translation (h = k = 0).',
      turnNow ? 'Rotation: θ = ' + fmt(P.th, 2) + '°, cos θ = ' + fmt(cs) + ', sin θ = ' + fmt(sn) + '.' : 'No rotation (θ = 0).',
      up ? 'Use X = (x − h)cos θ + (y − k)sin θ, Y = −(x − h)sin θ + (y − k)cos θ:  ' + fEq + '.' : 'Use x = h + X cos θ − Y sin θ, y = k + X sin θ + Y cos θ:  ' + gEq + '.'])[k];
  },
  out: (P, lv) => { const q = amCalc(P); return P.dir === 1 ? 'Equation in the old axes (x, y):  ' + polyStr(q.fO, 'x', 'y') : 'Equation in the new axes (X, Y):  ' + polyStr(q.gN, 'X', 'Y'); } });
MORE.extras.axmap = { chip: 'Equation in new axes', marks: [0, .12, .42, .72], ranges: Object.assign(rg(['A', 'B', 'C', 'D', 'E'], [-9, 9, 1]), { F: [-20, 20, 1], h: [-6, 6, 1], k: [-6, 6, 1], th: [-180, 180, 5] }),
  handles: P => [{ k: 'O', x: P.h, y: P.k, label: 'O′' }, { k: 'T', x: P.h + 3 * Math.cos(P.th * D2R), y: P.k + 3 * Math.sin(P.th * D2R), label: 'X′' }],
  drag: (P, k, x, y) => { if (k === 'O') return Object.assign({}, P, { h: x, k: y }); const dx = x - P.h, dy = y - P.k; if (Math.hypot(dx, dy) < .5) return null; return Object.assign({}, P, { th: Math.round(Math.atan2(dy, dx) / D2R / 5) * 5 }); },
  challenges: [{ id: 't8-am-nox', text: T2('Choose the new origin so the x term of the old equation disappears (use the “given in the new axes” option).', 'Make the coefficient of x in the old equation zero.'), hint: T2('A circle drawn around the new origin has an x term only when the origin is shifted sideways. Set h = 0.', 'For X² + Y² = 9 with θ = 0 the old equation has −2h·x, so h = 0.'), check: P => P.dir === 1 && Math.abs(amCalc(P).fO[3]) < 1e-9 && fin(amCalc(P).fO[3]) },
    { id: 't8-am-turn', text: T2('Turn the axes so that the old equation gets an xy term (try an oval first, C bigger than A).', 'Choose C ≠ A and θ ≠ 0 so that the old equation has an xy term although the new one has none.'), hint: T2('Make the oval with C = 3, then turn the axes by 30°.', 'B′ = (C − A)·sin 2θ for B = 0, so it is nonzero when C ≠ A and θ is not a multiple of 90°.'), check: P => P.dir === 1 && Math.abs(P.B) < 1e-9 && Math.abs(amCalc(P).fO[1]) > 1e-6 },
    { id: 't8-am-ori', text: T2('Pick the “given in the old axes” option and move the new origin onto the circle x² + y² = 9.', 'Choose the “old axes” option and make F′ = f(h, k) = 0, so the curve passes through O′.'), hint: T2('The new origin must lie on the curve. Try h = 3, k = 0 on x² + y² = 9 (F = −9).', 'F′ = h² + k² − 9 = 0 for the default circle.'), check: P => P.dir === 0 && Math.abs(amCalc(P).gN[5]) < 1e-9 }] };
MORE.hooks.axmap = 'Street names change if the city moves its map’s starting point, but the road stays where it is.';

// 4. Shift the origin onto a line
const lnCalc = P => {
  const a = P.a, b = P.b, c = P.c, den = a * a + b * b; let h, k;
  if (P.how === 1) { h = -a * c / den; k = -b * c / den; }
  else if (P.how === 0) { if (Math.abs(b) > 1e-10) { h = 0; k = -c / b; } else { h = -c / a; k = 0; } }
  else if (Math.abs(b) > 1e-10) { h = P.ch; k = (-c - a * P.ch) / b; } else { h = -c / a; k = 0; }
  return { h, k, den };
};
mk('lnsh', 8, 'Shift the origin onto a line', 'Class 11–12', [['a', 'a', 2], ['b', 'b', 3], ['c', 'c', 6], ['ch', 'h (your own choice)', 1]],
  ['If the new origin sits on the line, the line goes through the origin and its equation gets shorter.', 'New origin O′(h, k) on the line: ah + bk + c = 0.  Then x = X + h, y = Y + k turns ax + by + c = 0 into aX + bY = 0.  Foot of the perpendicular: h = −ac/(a² + b²), k = −bc/(a² + b²).'], {
  selects: { how: ['The new origin is', ['any point of the line (h = 0)', 'the foot of the perpendicular from O', 'a point with h chosen by you']] },
  fit: P => { const q = lnCalc(P); return [[0, 0], [q.h, q.k], [q.h - 4, q.k - 3], [q.h + 4, q.k + 3]]; },
  valid: P => fin(P.a, P.b, P.c, P.ch) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { a, b, c } = P, q = lnCalc(P), e0 = ease(seg(t, .12, .45)), e = ease(seg(t, .45, .8)), eq0 = eqStr(a, b, c), eq1 = polyStr([0, 0, 0, a, b, 0], 'X', 'Y');
    g.LL(a, b, c, C.c, 3.5);
    if (P.how === 1 && e0 > 0 && q.den > 0 && Math.hypot(q.h, q.k) > 1e-9) { g.L(0, 0, q.h * e0, q.k * e0, C.g, 3.5, [7, 5]); if (e0 >= 1) g.right(q.h, q.k, [-q.h, -q.k], [-b, a]); }
    if (e0 > 0 && t < .45) { g.D(q.h, q.k, C.g, 8 * e0); if (e0 >= 1) g.T(ptStr(q.h, q.k), q.h, q.k, C.g, { dy: -20, size: 13 }); }
    g.D(0, 0, C.ink, 5); if (t > .1) g.T('O', 0, 0, C.ink, { dx: 12, dy: 14, size: 13 }); if (t >= .45) newAxes(g, q.h * e, q.k * e, 0);
    const rows = [['line: ' + eq0, C.c]]; if (t >= .8) rows.push(['new: ' + eq1, C.a]); eqBox(g, rows);
    const k = t < .12 ? 0 : t < .45 ? 1 : t < .8 ? 2 : 3, flat = Math.abs(q.h) < 1e-9 && Math.abs(q.k) < 1e-9;
    const pickTxt = P.how === 1 ? ['Take the point of the line closest to O: the foot of the perpendicular, ' + ptStr(q.h, q.k) + '.', 'h = −ac/(a² + b²) = ' + fmt(q.h) + ', k = −bc/(a² + b²) = ' + fmt(q.k) + '.']
      : P.how === 0 ? ['Take a simple point of the line: ' + ptStr(q.h, q.k) + (Math.abs(P.b) > 1e-10 ? ' (we choose h = 0).' : ' (the line is vertical, so it is where it meets the x-axis).'), 'Choose h = ' + fmt(q.h) + ', then k = −(ah + c)/b = ' + fmt(q.k) + '.']
      : ['Choose h = ' + fmt(q.h) + ' yourself, then find the matching height: ' + ptStr(q.h, q.k) + '.', 'h = ' + fmt(q.h) + ', k = −(ah + c)/b = ' + fmt(q.k) + '.'];
    return pick(lv, ['The line ' + eq0 + (Math.abs(c) < 1e-9 ? ' already goes through the origin.' : ' does not go through the origin.'), pickTxt[0], 'Slide the axes so the new origin O′ is at ' + ptStr(q.h, q.k) + '.',
      'The line now passes through O′, so the constant term is gone: ' + eq1 + '.' + (flat ? ' (The origin did not need to move.)' : '')],
    ['Line ' + eq0 + '.  O′(h, k) must satisfy ah + bk + c = 0.', pickTxt[1], 'x = X + h, y = Y + k:  a(X + h) + b(Y + k) + c = aX + bY + (ah + bk + c).', 'ah + bk + c = ' + fmt(a * q.h + b * q.k + c) + ', so the new equation is ' + eq1 + '.'])[k];
  },
  out: (P, lv) => { const q = lnCalc(P); return 'Shift the origin to ' + ptStr(q.h, q.k) + ';  new equation ' + polyStr([0, 0, 0, P.a, P.b, 0], 'X', 'Y'); } });
MORE.extras.lnsh = { chip: 'Origin onto a line', marks: [0, .12, .45, .8], ranges: { a: [-8, 8, 1], b: [-8, 8, 1], c: [-20, 20, 1], ch: [-8, 8, 1] },
  handles: P => { const q = lnCalc(P), hs = [{ k: 'L', x: -P.a * P.c / (P.a * P.a + P.b * P.b), y: -P.b * P.c / (P.a * P.a + P.b * P.b), label: 'line' }]; if (P.how === 2) hs.push({ k: 'O', x: q.h, y: q.k, label: 'O′' }); return hs; },
  drag: (P, k, x, y) => (k === 'L' ? Object.assign({}, P, { c: -(P.a * x + P.b * y) }) : Object.assign({}, P, { ch: x })),
  challenges: [{ id: 't8-ln-foot34', text: T2('Choose the line so that the foot of the perpendicular from O is (3, 4).', 'Choose a, b, c so that (h, k) = (3, 4).'), hint: T2('The foot of the perpendicular is the point where the line is closest to O. A line at a right angle to the direction (3, 4) through the point (3, 4) works. Try a = 3, b = 4, c = −25.', '(h, k) = (−ac, −bc)/(a² + b²). With a = 3, b = 4, c = −25 this is (75, 100)/25.'), check: P => { const q = lnCalc(P); return Math.abs(q.h - 3) < 1e-9 && Math.abs(q.k - 4) < 1e-9; } },
    { id: 't8-ln-none', text: T2('Make a line that already goes through the origin, so the origin does not have to move.', 'Make the shift (h, k) = (0, 0).'), hint: T2('A line through the origin has no constant term. Set c = 0.', 'c = 0 gives h = k = 0.'), check: P => { const q = lnCalc(P); return Math.abs(q.h) < 1e-9 && Math.abs(q.k) < 1e-9; } },
    { id: 't8-ln-xaxis', text: T2('Make the new origin land on the x-axis (height 0) without being at O.', 'Make k = 0 and h ≠ 0.'), hint: T2('A standing-up line (b = 0) meets the x-axis at the foot of the perpendicular. Try b = 0.', 'With b = 0 the line is x = −c/a and the foot is (−c/a, 0).'), check: P => { const q = lnCalc(P); return Math.abs(q.k) < 1e-9 && Math.abs(q.h) > 1e-9; } }] };
MORE.hooks.lnsh = 'Measuring a straight road is easier if you start counting from a point on the road itself.';

// 5. Back from new coordinates to old ones
const bkCalc = P => { const c = Math.cos(P.th * D2R), s = Math.sin(P.th * D2R); return { c, s, x: P.h + P.px * c - P.py * s, y: P.k + P.px * s + P.py * c }; };
mk('back', 8, 'From new coordinates back to old', 'Class 11–12', [['h', 'h', 2], ['k', 'k', 1], ['th', 'θ (degrees)', 30], ['px', 'X (new)', 3], ['py', 'Y (new)', 2]],
  ['Start at the new origin, walk X along the new X′-axis and then Y along the new Y′-axis. Then read the old address.', 'x = h + X cos θ − Y sin θ,  y = k + X sin θ + Y cos θ'], {
  fit: P => { const q = bkCalc(P); return [[0, 0], [P.h, P.k], [q.x, q.y], [P.h + 3 * q.c, P.k + 3 * q.s], [P.h - 3 * q.s, P.k + 3 * q.c]]; },
  valid: P => fin(P.h, P.k, P.th, P.px, P.py),
  draw(g, t, C, lv, P) {
    const q = bkCalc(P), e1 = ease(seg(t, .12, .4)), e2 = ease(seg(t, .4, .7)), e3 = ease(seg(t, .7, .95)), mx = P.h + P.px * q.c, my = P.k + P.px * q.s;
    newAxes(g, P.h, P.k, P.th * D2R);
    g.L(P.h, P.k, P.h + P.px * q.c * e1, P.k + P.px * q.s * e1, C.c, 4.5);
    if (e2 > 0) g.L(mx, my, mx - P.py * q.s * e2, my + P.py * q.c * e2, C.g, 4.5);
    if (e1 >= 1) g.T('X = ' + fmt(P.px), (P.h + mx) / 2, (P.k + my) / 2, C.c, { dx: 24 * q.s, dy: 24 * q.c, size: 12 });
    if (e2 >= 1) g.T('Y = ' + fmt(P.py), (mx + q.x) / 2, (my + q.y) / 2, C.g, { dx: -26 * q.c - 4, dy: -26 * q.s, size: 12 });
    if (e3 > 0) { g.L(q.x, q.y, q.x, q.y * (1 - e3), C.faint, 2, [6, 5]); g.L(q.x, q.y, q.x * (1 - e3), q.y, C.faint, 2, [6, 5]); }
    const tip = t < .12 ? [P.h, P.k] : t < .4 ? [P.h + P.px * q.c * e1, P.k + P.px * q.s * e1] : t < .7 ? [mx - P.py * q.s * e2, my + P.py * q.c * e2] : [q.x, q.y];
    g.D(tip[0], tip[1], C.a, 8); if (t >= .7) g.T('P' + ptStr(q.x, q.y), q.x, q.y, C.a, { dy: -22, size: 14 });
    const k = t < .12 ? 0 : t < .4 ? 1 : t < .7 ? 2 : 3;
    return pick(lv, ['The new axes (orange) start at O′' + ptStr(P.h, P.k) + ' and are turned by ' + fmt(P.th, 2) + '°. P has new address (' + fmt(P.px) + ', ' + fmt(P.py) + ').', 'Walk ' + fmt(P.px) + ' along the new X′-axis.', 'Then walk ' + fmt(P.py) + ' along the new Y′-axis. You arrive at P.', 'Now read P against the old axes: across ' + fmt(q.x, 4) + ', up ' + fmt(q.y, 4) + '.'],
      ['O′ = ' + ptStr(P.h, P.k) + ', θ = ' + fmt(P.th, 2) + '°, (X, Y) = (' + fmt(P.px) + ', ' + fmt(P.py) + ').', 'x = h + X cos θ − Y sin θ = ' + fmt(P.h) + ' + ' + fmt(P.px) + '·' + fmt(q.c) + ' − ' + fmt(P.py) + '·' + fmt(q.s) + ' = ' + fmt(q.x, 4) + '.', 'y = k + X sin θ + Y cos θ = ' + fmt(P.k) + ' + ' + fmt(P.px) + '·' + fmt(q.s) + ' + ' + fmt(P.py) + '·' + fmt(q.c) + ' = ' + fmt(q.y, 4) + '.', 'P = (x, y) = ' + ptStr(q.x, q.y) + ' in the old axes.'])[k];
  },
  out: (P, lv) => { const q = bkCalc(P); return 'Point in old coordinates: (x, y) = (' + fmt(q.x, 4) + ', ' + fmt(q.y, 4) + ')'; } });
MORE.extras.back = { chip: 'New → old address', marks: [0, .12, .4, .7], ranges: { h: [-6, 6, 1], k: [-6, 6, 1], th: [-180, 180, 5], px: R8, py: R8 },
  handles: P => { const q = bkCalc(P); return [{ k: 'O', x: P.h, y: P.k, label: 'O′' }, { k: 'T', x: P.h + 3 * q.c, y: P.k + 3 * q.s, label: 'X′' }, { k: 'P', x: q.x, y: q.y, label: 'P' }]; },
  drag: (P, k, x, y) => {
    if (k === 'O') return Object.assign({}, P, { h: x, k: y });
    if (k === 'T') { const dx = x - P.h, dy = y - P.k; return Math.hypot(dx, dy) < .5 ? null : Object.assign({}, P, { th: Math.round(Math.atan2(dy, dx) / D2R / 5) * 5 }); }
    const c = Math.cos(P.th * D2R), s = Math.sin(P.th * D2R); return Object.assign({}, P, { px: N4((x - P.h) * c + (y - P.k) * s), py: N4(-(x - P.h) * s + (y - P.k) * c) });
  },
  challenges: [{ id: 't8-bk-xaxis', text: T2('Make P land exactly on the old x-axis (old height 0).', 'Make y = k + X sin θ + Y cos θ = 0.'), hint: T2('With no turn (θ = 0), the old height is k + Y. Try θ = 0 and k = −2 with Y = 2.', 'θ = 0 gives y = k + Y, so k = −Y.'), check: P => Math.abs(bkCalc(P).y) < 1e-9 && Math.abs(bkCalc(P).x) > 1e-9 },
    { id: 't8-bk-same', text: T2('Make the old and new addresses of P the same.', 'Make (x, y) = (X, Y).'), hint: T2('If the axes do not move and do not turn, the address cannot change. Set h, k and θ to 0.', 'h = k = θ = 0.'), check: P => Math.abs(P.h) < 1e-9 && Math.abs(P.k) < 1e-9 && Math.abs(P.th) < 1e-9 },
    { id: 't8-bk-5', text: T2('Make P exactly 5 units from the old origin.', 'Make x² + y² = 25.'), hint: T2('Take the easy case of no shift and no turn, and use the 3-4-5 triangle: X = 3, Y = 4.', 'With h = k = θ = 0: 3² + 4² = 25.'), check: P => Math.abs(Math.hypot(bkCalc(P).x, bkCalc(P).y) - 5) < 1e-9 }] };
MORE.hooks.back = 'You know a friend’s seat in your own row; the cinema’s grid gives the seat a second address.';

// ----- bindings for tab 8 -----
const rotDeg = tx => num(tx, 'origRotTheta');
const isNum = v => Number.isFinite(v);
BINDINGS.push(
  // remove the xy term (rotation only)
  { scene: 'rotxy', ids: ['removeA', 'removeB', 'removeC', 'removeD', 'removeE', 'removeF'], get: v => ({ A: v[0], B: v[1], C: v[2], D: v[3], E: v[4], F: v[5], then: 1 }) },
  // simplify by translation to the centre
  { scene: 'ctrxy', ids: ['simpA', 'simpB', 'simpC', 'simpD', 'simpE', 'simpF'], get: v => ({ A: v[0], B: v[1], C: v[2], D: v[3], E: v[4], F: v[5] }) },
  // the original equation after a translation / rotation (typed equation)
  { scene: 'axmap', ids: ['origTransH', 'origTransK'], text: ['origTransEq'], get: (v, rr, tx) => { const co = parseEq(tx('origTransEq')); return co ? Object.assign(eqParams(co), { h: v[0], k: v[1], th: 0, dir: 1 }) : null; }, set: P => ({ origTransH: P.h, origTransK: P.k }), noHandles: ['T'] },
  { scene: 'axmap', ids: ['origRotTheta'], text: ['origRotEq'], get: (v, rr, tx) => { const co = parseEq(tx('origRotEq')); return co ? Object.assign(eqParams(co), { h: 0, k: 0, th: v[0], dir: 1 }) : null; }, set: P => ({ origRotTheta: P.th }), noHandles: ['O'] },
  // shift the origin onto the line
  { scene: 'lnsh', ids: ['simplifyLineA', 'simplifyLineB', 'simplifyLineC'], get: v => ({ a: v[0], b: v[1], c: v[2], ch: 1, how: 1 }), set: P => ({ simplifyLineC: P.c }) },
  { scene: 'lnsh', ids: ['shiftThroughA', 'shiftThroughB', 'shiftThroughC', 'customH'], get: (v, rr) => ({ a: v[0], b: v[1], c: v[2], ch: v[3], how: Math.max(0, ['any', 'perpendicular', 'custom'].indexOf(rr('shiftCondition'))) }), set: P => ({ shiftThroughC: P.c, customH: P.ch }) },
  // change of axes for symmetry: three options, three pictures
  { scene: 'rotxy', ids: ['symmetryAxisAngle'], text: ['symmetryEq'], sig: 'symmetry',
    get: (v, rr, tx) => { const co = parseEq(tx('symmetryEq')); if (!co) return null; const ty = rr('symmetryType') || 'xy', p = eqParams(co); p.mode = ty; if (ty === 'xy') p.then = 0; else if (ty === 'axis') Object.assign(p, { h: 0, k: 0, th: v[0], dir: 0 }); return p; },
    sceneOf: p => (p.mode === 'center' ? 'ctrxy' : p.mode === 'axis' ? 'axmap' : 'rotxy') },
  // a point in the new system (reuses the shift scene)
  { scene: 'shift', ids: ['pointPx', 'pointPy', 'coordH', 'coordK'], present: root => chk(root, 'coordTransType') === 'translation', get: v => ({ h: v[2], k: v[3], th: 0, px: v[0], py: v[1] }), set: P => ({ pointPx: P.px, pointPy: P.py, coordH: P.h, coordK: P.k }) },
  { scene: 'shift', ids: ['pointPx', 'pointPy', 'coordTheta'], present: root => chk(root, 'coordTransType') === 'rotation', get: v => ({ h: 0, k: 0, th: v[2], px: v[0], py: v[1] }), set: P => ({ pointPx: P.px, pointPy: P.py }), noHandles: ['O'] },
  { scene: 'shift', ids: ['pointPx', 'pointPy', 'coordBothH', 'coordBothK', 'coordBothTheta'], present: root => chk(root, 'coordTransType') === 'both', get: v => ({ h: v[2], k: v[3], th: v[4], px: v[0], py: v[1] }), set: P => ({ pointPx: P.px, pointPy: P.py, coordBothH: P.h, coordBothK: P.k }) },
  // the equation of a line in new coordinates (three options)
  { scene: 'axmap', ids: ['lineEqA', 'lineEqB', 'lineEqC', 'lineH', 'lineK'], present: root => chk(root, 'lineTransType') === 'translation', get: v => ({ A: 0, B: 0, C: 0, D: v[0], E: v[1], F: v[2], h: v[3], k: v[4], th: 0, dir: 0 }), set: P => ({ lineH: P.h, lineK: P.k }), noHandles: ['T'] },
  { scene: 'axmap', ids: ['lineEqA', 'lineEqB', 'lineEqC', 'lineTheta'], present: root => chk(root, 'lineTransType') === 'rotation', get: v => ({ A: 0, B: 0, C: 0, D: v[0], E: v[1], F: v[2], h: 0, k: 0, th: v[3], dir: 0 }), set: P => ({ lineTheta: P.th }), noHandles: ['O'] },
  { scene: 'axmap', ids: ['lineEqA', 'lineEqB', 'lineEqC', 'lineBothH', 'lineBothK', 'lineBothTheta'], present: root => chk(root, 'lineTransType') === 'both', get: v => ({ A: 0, B: 0, C: 0, D: v[0], E: v[1], F: v[2], h: v[3], k: v[4], th: v[5], dir: 0 }), set: P => ({ lineBothH: P.h, lineBothK: P.k, lineBothTheta: P.th }) },
  // combined translation + rotation: new -> old (default) or old -> new
  { scene: 'back', ids: ['combH', 'combK', 'combTheta'], text: ['combOldX', 'combOldY', 'combNewX', 'combNewY'],
    get: (v, rr, tx) => { const nx = num(tx, 'combNewX'), ny = num(tx, 'combNewY'), ox = num(tx, 'combOldX'), oy = num(tx, 'combOldY'); if (isNum(nx) && isNum(ny)) return { h: v[0], k: v[1], th: v[2], px: nx, py: ny }; if (isNum(ox) && isNum(oy)) return { h: v[0], k: v[1], th: v[2], px: ox, py: oy }; return null; },
    sceneOf: (p, rr, tx) => (isNum(num(tx, 'combNewX')) && isNum(num(tx, 'combNewY')) ? 'back' : 'shift'),
    set: P => { const fromNew = isNum(parseFloat((document.getElementById('combNewX') || {}).value)) && isNum(parseFloat((document.getElementById('combNewY') || {}).value)); return fromNew ? { combH: P.h, combK: P.k, combTheta: P.th, combNewX: P.px, combNewY: P.py } : { combH: P.h, combK: P.k, combOldX: P.px, combOldY: P.py }; } });

// ======================= Tab 9 =======================
// 6. Chord of contact and polar of a circle  x² + y² + Dx + Ey + F = 0
const chCalc = P => {
  const c0 = [-P.D / 2, -P.E / 2], r2 = c0[0] * c0[0] + c0[1] * c0[1] - P.F, r = Math.sqrt(Math.max(0, r2)), d2 = (P.px - c0[0]) ** 2 + (P.py - c0[1]) ** 2, tol = 1e-9 * Math.max(1, r2);
  const A = P.px + P.D / 2, B = P.py + P.E / 2, Cc = P.D / 2 * P.px + P.E / 2 * P.py + P.F, pos = d2 > r2 + tol ? 'out' : Math.abs(d2 - r2) <= tol ? 'on' : 'in', inf = Math.hypot(A, B) < 1e-9;
  let T = null;
  if (!inf) { const n2 = A * A + B * B, v = A * c0[0] + B * c0[1] + Cc, f = [c0[0] - A * v / n2, c0[1] - B * v / n2], dl = Math.abs(v) / Math.sqrt(n2); if (dl < r) { const half = Math.sqrt(r * r - dl * dl), n = Math.sqrt(n2), u = [-B / n, A / n]; T = [[f[0] + u[0] * half, f[1] + u[1] * half], [f[0] - u[0] * half, f[1] - u[1] * half]]; } }
  return { c0, r2, r, d2, A, B, Cc, pos, inf, T, tl: Math.sqrt(Math.max(0, d2 - r2)) };
};
const chLine = q => (q.inf ? '0x + 0y + ' + fmt(q.Cc) + ' = 0' : polyStr([0, 0, 0, q.A, q.B, q.Cc], 'x', 'y'));
mk('chord', 9, 'Tangents, chord of contact and polar', 'Class 11–12', [['D', 'D', -4], ['E', 'E', -6], ['F', 'F', 9], ['px', 'P: x₁', 5], ['py', 'P: y₁', 6]],
  ['From a point outside a circle you can draw two tangents. The line joining the two touching points is the chord of contact.', 'T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0 is the chord of contact (P outside), the tangent at P (P on the circle), and in every case the polar of P.'], {
  selects: { view: ['Show it as', ['chord of contact', 'pole and polar']] },
  fit: P => { const q = chCalc(P), pts = [[q.c0[0] - q.r - 1, q.c0[1] - q.r - 1], [q.c0[0] + q.r + 1, q.c0[1] + q.r + 1], [P.px, P.py]]; if (!q.inf) { const n2 = q.A * q.A + q.B * q.B, v = q.A * q.c0[0] + q.B * q.c0[1] + q.Cc, f = [q.c0[0] - q.A * v / n2, q.c0[1] - q.B * v / n2]; if (Math.hypot(f[0] - q.c0[0], f[1] - q.c0[1]) < 3 * q.r + 4) pts.push(f); } return pts; },
  valid: P => fin(P.D, P.E, P.F, P.px, P.py) && P.D * P.D / 4 + P.E * P.E / 4 - P.F > 1e-9,
  draw(g, t, C, lv, P) {
    const q = chCalc(P), ctx = g.ctx, e1 = ease(seg(t, .12, .4)), e2 = ease(seg(t, .4, .7)), pole = P.view === 1, nm = pole ? 'polar' : 'chord of contact';
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(g.X(q.c0[0]), g.Y(q.c0[1]), q.r * g.sc, 0, 7); ctx.stroke(); ctx.restore();
    g.D(q.c0[0], q.c0[1], C.ink, 4); g.T('centre', q.c0[0], q.c0[1], C.muted, { dy: 16, size: 11, weight: 600 });
    if (q.pos === 'out' && q.T) q.T.forEach(p => { g.L(P.px, P.py, lerp(P.px, p[0], e1), lerp(P.py, p[1], e1), C.a, 3.5); if (e1 >= 1) { g.D(p[0], p[1], C.g, 7); g.right(p[0], p[1], [q.c0[0] - p[0], q.c0[1] - p[1]], [P.px - p[0], P.py - p[1]], 9); } });
    if (q.pos === 'on' && !q.inf) g.LL(q.A, q.B, q.Cc, C.a, 3.5, null, e1);
    if (!q.inf && e2 > 0) { if (q.pos === 'out' && q.T) { g.LL(q.A, q.B, q.Cc, C.g, 1.6, [6, 6], .7 * e2); g.L(q.T[0][0], q.T[0][1], lerp(q.T[0][0], q.T[1][0], e2), lerp(q.T[0][1], q.T[1][1], e2), C.g, 5); } else if (q.pos === 'in') g.LL(q.A, q.B, q.Cc, C.g, 3.5, [8, 6], e2); }
    g.D(P.px, P.py, C.c, 8); g.T('P' + ptStr(P.px, P.py), P.px, P.py, C.c, { dy: -20, size: 13 });
    const rows = [['T = 0:  ' + chLine(q), C.g]]; if (t < .7) rows.length = 0; eqBox(g, rows.length ? rows : [['circle: x² + y² ' + (P.D ? (P.D < 0 ? '− ' : '+ ') + fmt(Math.abs(P.D)) + 'x ' : '') + (P.E ? (P.E < 0 ? '− ' : '+ ') + fmt(Math.abs(P.E)) + 'y ' : '') + (P.F ? (P.F < 0 ? '− ' : '+ ') + fmt(Math.abs(P.F)) + ' ' : '') + '= 0', C.ink]]);
    const k = t < .12 ? 0 : t < .4 ? 1 : t < .7 ? 2 : 3, where = q.pos === 'out' ? 'outside' : q.pos === 'on' ? 'on' : 'inside';
    return pick(lv, ['A circle and a point P ' + where + ' it.',
      q.pos === 'out' ? 'Draw the two tangents from P. Each one touches the circle at one point.' : q.pos === 'on' ? 'P is on the circle, so only one tangent can be drawn: it touches at P.' : 'P is inside the circle, so no tangent can be drawn from it.',
      q.inf ? 'P is the centre. Its ' + nm + ' would be infinitely far away.' : q.pos === 'out' ? 'Join the two touching points. This line is the ' + nm + (pole ? ' of P (P is its pole).' : '.') : q.pos === 'on' ? 'The ' + nm + ' of P is the tangent at P.' : 'Even so, P has a ' + nm + ': a line outside the circle.',
      q.inf ? 'The centre has no polar line (it is at infinity).' : 'Its equation is T = 0:  ' + chLine(q) + '.'],
    ['x² + y² + ' + fmt(P.D) + 'x + ' + fmt(P.E) + 'y + ' + fmt(P.F) + ' = 0,  centre ' + ptStr(q.c0[0], q.c0[1]) + ', r = ' + fmt(q.r) + '.  CP² = ' + fmt(q.d2) + ' ' + (q.pos === 'out' ? '>' : q.pos === 'on' ? '=' : '<') + ' r² = ' + fmt(q.r2) + '.',
      q.pos === 'out' ? 'Tangent length = √(CP² − r²) = ' + fmt(q.tl) + '.' : q.pos === 'on' ? 'P lies on the circle: tangent at P.' : 'CP² < r²: no real tangents.',
      'T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F:  x terms ' + fmt(P.px) + ' + ' + fmt(P.D / 2) + ' = ' + fmt(q.A) + ',  y terms ' + fmt(P.py) + ' + ' + fmt(P.E / 2) + ' = ' + fmt(q.B) + '.',
      q.inf ? 'Here x₁ + D/2 = y₁ + E/2 = 0, so the polar is at infinity.' : 'Constant: (D/2)x₁ + (E/2)y₁ + F = ' + fmt(q.Cc) + '.  ' + nm + ': ' + chLine(q) + '.'])[k];
  },
  out: (P, lv) => { const q = chCalc(P); if (q.inf) return 'P is the centre of the circle: its polar is at infinity (no line)'; const line = chLine(q); if (P.view === 1) return 'Pole P(' + fmt(P.px) + ', ' + fmt(P.py) + ') → Polar: ' + line; return 'Chord of contact: ' + line + (q.pos === 'out' ? '' : q.pos === 'on' ? '   (P is on the circle: this is the tangent at P)' : '   (P is inside the circle: no real chord of contact)'); } });
MORE.extras.chord = { chip: 'Chord of contact / polar', marks: [0, .12, .4, .7], ranges: { D: [-12, 12, 1], E: [-12, 12, 1], F: [-20, 20, 1], px: R8, py: R8 },
  handles: P => { const q = chCalc(P); return [{ k: 'P', x: P.px, y: P.py, label: 'P' }, { k: 'C', x: q.c0[0], y: q.c0[1], label: 'centre' }, { k: 'R', x: q.c0[0] + q.r, y: q.c0[1], label: 'r' }]; },
  drag: (P, k, x, y) => {
    if (k === 'P') return Object.assign({}, P, { px: x, py: y });
    const c0 = [-P.D / 2, -P.E / 2], r = Math.sqrt(Math.max(0, c0[0] * c0[0] + c0[1] * c0[1] - P.F));
    if (k === 'C') return Object.assign({}, P, { D: -2 * x, E: -2 * y, F: x * x + y * y - r * r });
    const nr = Math.round(Math.hypot(x - c0[0], y - c0[1]) * 2) / 2; return nr < .5 ? null : Object.assign({}, P, { F: c0[0] * c0[0] + c0[1] * c0[1] - nr * nr });
  },
  challenges: [{ id: 't9-ch-on', text: T2('Put P on the circle. What happens to the chord of contact?', 'Place P so that CP² = r².'), hint: T2('When P is on the circle, the two touching points join into one point. Move P onto the blue circle.', 'For the default circle (centre (2, 3), r = 2) try P = (4, 3).'), check: P => chCalc(P).pos === 'on' },
    { id: 't9-ch-in', text: T2('Put P inside the circle. Can you still draw tangents?', 'Make CP² < r².'), hint: T2('Inside the circle there are no tangents, but the polar line still exists outside the circle.', 'Try P = (3, 3), which is 1 unit from the centre (2, 3).'), check: P => chCalc(P).pos === 'in' && !chCalc(P).inf },
    { id: 't9-ch-flat', text: T2('Place P (outside the circle) so that the chord of contact is a flat, horizontal line.', 'Make the x-coefficient x₁ + D/2 equal to 0 with P outside.'), hint: T2('The chord is at a right angle to the line from the centre to P. For a flat chord, P must be straight above or below the centre.', 'A = x₁ + D/2 = 0 means x₁ = −D/2, for example P = (2, 6).'), check: P => { const q = chCalc(P); return q.pos === 'out' && Math.abs(q.A) < 1e-9; } },
    { id: 't9-ch-tl3', text: T2('Place P so that each tangent is exactly 3 units long.', 'Make √(CP² − r²) = 3.'), hint: T2('The tangent, the radius and CP form a right triangle: CP² = r² + 9 = 13. Try 3 across and 2 up from the centre.', 'CP² = r² + 9 = 13, e.g. P = (5, 5) for centre (2, 3).'), check: P => { const q = chCalc(P); return q.pos === 'out' && Math.abs(q.tl - 3) < 1e-9; } }] };
MORE.hooks.chord = 'Two guy-ropes from the same point of a pole pull tight against a round tank: the line joining the touching points is the chord of contact.';

// 7. Line against the rectangular hyperbola xy = c²
const rhCalc = P => { const disc = P.k * P.k + 4 * P.m * P.c * P.c, tol = 1e-9 * Math.max(1, P.k * P.k, Math.abs(4 * P.m * P.c * P.c)); let pts = []; if (Math.abs(P.m) < 1e-9) { if (Math.abs(P.k) > 1e-9) pts = [[P.c * P.c / P.k, P.k]]; } else if (disc > tol) { const s = Math.sqrt(disc); pts = [(-P.k - s) / (2 * P.m), (-P.k + s) / (2 * P.m)].map(x => [x, P.m * x + P.k]); } else if (disc >= -tol) pts = [[-P.k / (2 * P.m), P.k / 2]]; const flat = Math.abs(P.m) < 1e-9, kind = flat ? 'parallel' : disc > tol ? 'secant' : disc >= -tol ? 'tangent' : 'none'; return { disc, pts, kind, kreq: P.m < 0 ? 2 * P.c * Math.sqrt(-P.m) : NaN }; };
mk('rhtan', 9, 'A line and the hyperbola xy = c²', 'Class 11–12', [['c', 'c', 2], ['m', 'm', 1], ['k', 'k', -4]],
  ['Slide a line of the same slope across the hyperbola and watch how many times it crosses: twice, once (touching) or never.', 'Put y = mx + k into xy = c²:  mx² + kx − c² = 0.  Discriminant k² + 4mc²:  > 0 two points, = 0 tangent, < 0 none.  Tangent needs m < 0 and k = ±2c√(−m); the contact point is (−k/2m, k/2).'], {
  fit: P => { const R = Math.max(5, 2.6 * P.c), pts = [[-R, -R], [R, R]]; if (Math.abs(P.k) < 3 * R) pts.push([0, P.k]); return pts; },
  valid: P => fin(P.c, P.m, P.k) && P.c > EPS,
  draw(g, t, C, lv, P) {
    const q = rhCalc(P), e = ease(seg(t, .12, .7)), start = (P.k >= 0 ? -1 : 1) * Math.max(Math.abs(P.k) + 4, 8), kt = lerp(start, P.k, e), qt = rhCalc(Object.assign({}, P, { k: kt })), c2 = P.c * P.c;
    E.kit.implicit(g, (x, y) => x * y - c2, C.c, 3.8);
    if (t > .7 && P.m < 0) { const kr = 2 * P.c * Math.sqrt(-P.m); g.LL(-P.m, 1, -kr, C.faint, 1.6, [6, 6], .9); g.LL(-P.m, 1, kr, C.faint, 1.6, [6, 6], .9); }
    g.LL(-P.m, 1, -kt, C.a, 3.5);
    qt.pts.forEach(p => g.D(p[0], p[1], qt.kind === 'tangent' ? C.b : C.g, 8));
    if (qt.pts.length === 2) g.L(qt.pts[0][0], qt.pts[0][1], qt.pts[1][0], qt.pts[1][1], C.g, 5);
    if (t >= .7 && q.kind === 'tangent') g.T('touches at ' + ptStr(q.pts[0][0], q.pts[0][1]), q.pts[0][0], q.pts[0][1], C.b, { dx: 16, dy: -22, align: 'left', size: 13 });
    eqBox(g, [['k² + 4mc² = ' + fmt(qt.disc, 3) + (t >= .7 ? '' : '  (k = ' + fmt(kt, 2) + ')'), t >= .7 ? (q.kind === 'tangent' ? C.b : C.ink) : C.muted]]);
    const k = t < .12 ? 0 : t < .7 ? 1 : 2, nm = 'xy = ' + fmt(c2);
    const res = q.kind === 'tangent' ? 'The line just touches the hyperbola at ' + ptStr(q.pts[0][0], q.pts[0][1]) + ': a tangent.' : q.kind === 'secant' ? 'The line cuts the hyperbola at 2 points.' : q.kind === 'parallel' ? 'A flat line meets the hyperbola only once (or never, if it is the x-axis).' : 'The line misses the hyperbola.';
    return pick(lv, ['The hyperbola ' + nm + ' and the line y = ' + (Math.abs(P.m) < 1e-9 ? '' : fmt(P.m) + 'x ') + (P.k < 0 ? '− ' : '+ ') + fmt(Math.abs(P.k)) + '.', 'Slide the line up or down, keeping its slope. It meets the hyperbola 0, 1 or 2 times.', res + (P.m < 0 ? ' (A tangent of this slope needs k = ±' + fmt(q.kreq) + '.)' : '')],
      ['y = mx + k with m = ' + fmt(P.m) + ', k = ' + fmt(P.k) + '; xy = c² = ' + fmt(c2) + '.', 'x(mx + k) = c²  →  mx² + kx − c² = 0.  Discriminant Δ = k² + 4mc² = ' + fmt(q.disc) + '.', q.kind === 'tangent' ? 'Δ = 0: tangent, contact point (−k/2m, k/2) = ' + ptStr(q.pts[0][0], q.pts[0][1]) + '.' : q.kind === 'secant' ? 'Δ > 0: two points of intersection.' : q.kind === 'parallel' ? 'm = 0: the line is parallel to an asymptote, so it meets the hyperbola once.' : 'Δ < 0: no intersection.' + (P.m < 0 ? ' Tangent when k = ±2c√(−m) = ±' + fmt(q.kreq) + '.' : '')])[k];
  },
  out: (P, lv) => { const q = rhCalc(P), cond = 'k² + 4mc² = ' + fmt(q.disc); if (q.kind === 'tangent') return 'The line is TANGENT to xy = c²:  ' + cond + ' = 0;  point of contact ' + ptStr(q.pts[0][0], q.pts[0][1]); if (q.kind === 'secant') return 'The line is a SECANT (cuts at 2 points):  ' + cond + ' ≠ 0' + (P.m < 0 ? ';  tangent needs k = ±' + fmt(q.kreq) : ''); if (q.kind === 'parallel') return 'm = 0: the line is parallel to an asymptote and meets xy = c² once (' + cond + ')'; return 'The line does NOT meet the hyperbola:  ' + cond + ' ≠ 0' + (P.m < 0 ? ';  tangent needs k = ±' + fmt(q.kreq) : ''); } });
MORE.extras.rhtan = { chip: 'Tangent to xy = c²', marks: [0, .12, .7], ranges: { c: [.5, 6, .5], m: [-6, 6, .5], k: [-12, 12, 1] },
  handles: P => [{ k: 'K', x: 0, y: P.k, label: 'k' }, { k: 'M', x: 1, y: P.m + P.k, label: 'slope' }, { k: 'C', x: P.c, y: P.c, label: 'c' }],
  drag: (P, k, x, y) => (k === 'K' ? Object.assign({}, P, { k: y }) : k === 'M' ? Object.assign({}, P, { m: y - P.k }) : ((x + y) / 2 < .5 ? null : Object.assign({}, P, { c: Math.round((x + y)) / 2 }))),
  challenges: [{ id: 't9-rh-tan', text: T2('Make the line just touch the hyperbola (a tangent).', 'Choose m and k with k² + 4mc² = 0.'), hint: T2('The slope must go downhill (negative). With c = 2 and m = −1, the line touches when k = 4.', 'k² = −4mc²; for c = 2, m = −1: k = ±4.'), check: P => P.m < 0 && rhCalc(P).kind === 'tangent' },
    { id: 't9-rh-miss', text: T2('Make the line miss the hyperbola completely.', 'Make k² + 4mc² < 0.'), hint: T2('Use a downhill slope (m < 0) and keep k small, so the line slips between the two branches. Try m = −1, k = 1.', 'm < 0 and k² < −4mc².'), check: P => rhCalc(P).kind === 'none' },
    { id: 't9-rh-c3', text: T2('Make c = 3 and keep the line a tangent.', 'Make c = 3 with Δ = 0.'), hint: T2('With c = 3 and m = −1, the tangent has k = ±6.', 'k = ±2c√(−m) = ±6.'), check: P => Math.abs(P.c - 3) < 1e-9 && P.m < 0 && rhCalc(P).kind === 'tangent' }] };
MORE.hooks.rhtan = 'A sloping road and a curved fence: the road touches the fence at exactly one spot only for one special height.';

// 8. Diameter of a conic: midpoints of parallel chords
const dmCalc = P => {
  const { type, a, b, m } = P; let eq, line, vertical = false, none = false;
  if (type === 0) { if (Math.abs(m) < 1e-9) { none = true; } else { line = [0, 1, -2 * a / m]; eq = 'y = ' + fmt(2 * a / m); } }
  else if (Math.abs(m) < 1e-9) { vertical = true; line = [1, 0, 0]; eq = 'x = 0'; }
  else { const s = (type === 1 ? -1 : 1) * b * b / (a * a * m); line = [s, -1, 0]; eq = slopeEq(s, 0); if (type === 2 && Math.abs(b * b - a * a * m * m) < 1e-9) none = true; }
  const ext = Math.max(a, type === 0 ? 4 : b, 3) * 1.5 + 1, cs = [], mids = [];
  if (!none) for (let c = -ext * 1.6; c <= ext * 1.6 + 1e-9; c += .25) { const r = E.conicRoots(P, c); if (r.n === 2 && Math.hypot(r.pts[0][0] - r.pts[1][0], r.pts[0][1] - r.pts[1][1]) > .3) cs.push(c); }
  const use = cs.length <= 6 ? cs : [0, 1, 2, 3, 4, 5].map(i => cs[Math.round(i * (cs.length - 1) / 5)]);
  use.forEach(c => { const r = E.conicRoots(P, c); mids.push({ c, p: r.pts, mid: [(r.pts[0][0] + r.pts[1][0]) / 2, (r.pts[0][1] + r.pts[1][1]) / 2] }); });
  return { eq, line, vertical, none, ext, mids };
};
const DM_NAME = ['parabola  y² = 4ax', 'ellipse  x²/a² + y²/b² = 1', 'hyperbola  x²/a² − y²/b² = 1'], DM_SHORT = ['parabola', 'ellipse', 'hyperbola'];
mk('diam', 9, 'Diameter of a conic', 'Class 11–12', [['a', 'a', 4], ['b', 'b', 3], ['m', 'slope m of the chords', 2]],
  ['Draw many parallel chords. The middle points of all of them lie on one straight line: the diameter.', 'Chords y = mx + c.  Midpoints lie on:  parabola y² = 4ax: y = 2a/m;  ellipse x²/a² + y²/b² = 1: y = −b²x/(a²m);  hyperbola x²/a² − y²/b² = 1: y = b²x/(a²m).'], {
  selects: { type: ['Conic', DM_NAME] },
  fit: P => { const e = Math.max(P.a, P.type === 0 ? 4 : P.b, 3) * 1.5 + 1; return P.type === 0 ? [[-1, -e], [e * 1.2, e]] : [[-e * .9, -e * .75], [e * .9, e * .75]]; },
  valid: P => fin(P.a, P.b, P.m) && P.a > EPS && (P.type === 0 || P.b > EPS),
  draw(g, t, C, lv, P) {
    const q = dmCalc(P), type = P.type, a = P.a, b = P.b, ctx = g.ctx;
    if (type === 0) E.kit.implicit(g, (x, y) => y * y - 4 * a * x, C.c, 4); else if (type === 1) E.kit.implicit(g, (x, y) => x * x / (a * a) + y * y / (b * b) - 1, C.c, 4); else E.kit.implicit(g, (x, y) => x * x / (a * a) - y * y / (b * b) - 1, C.c, 4);
    const n = q.mids.length;
    q.mids.forEach((mm, i) => {
      const s0 = .12 + .46 * i / Math.max(n, 1), e = ease(seg(t, s0, s0 + .08));
      if (e > 0) { g.L(mm.p[0][0], mm.p[0][1], mm.p[1][0], mm.p[1][1], C.g, 2.6, null, e); if (e >= 1) g.D(mm.mid[0], mm.mid[1], C.a, 6); }
    });
    const ed = ease(seg(t, .6, .82)); if (!q.none && ed > 0) g.LL(q.line[0], q.line[1], q.line[2], C.a, 3.5, null, ed);
    if (!q.none && t >= .82) eqBox(g, [['diameter:  ' + q.eq, C.a]]);
    const k = t < .12 ? 0 : t < .6 ? 1 : t < .82 ? 2 : 3, nm = DM_SHORT[type];
    return pick(lv, ['A ' + nm + ' and a set of parallel chords. Their slope is ' + fmt(P.m) + '.', q.none ? 'Chords with this slope do not cut the ' + nm + ' twice, so there are no middle points to join.' : 'Mark the middle point of each chord (orange dots).', q.none ? 'So this slope has no diameter.' : 'All the middle points lie on one straight line.',
      q.none ? 'Try a different slope.' : 'The diameter is ' + q.eq + (q.vertical ? ' (the y-axis).' : type === 0 ? ' (a flat line, parallel to the axis).' : ' (it passes through the centre).')],
    [DM_NAME[type] + ';  chords y = ' + fmt(P.m) + 'x + c.', q.none ? 'The chord slope is parallel to the axis or an asymptote: the quadratic in x has only one root.' : 'For y = mx + c substitute into the conic and add the two x-roots: the midpoint is (−B/2A, m·x + c).', q.none ? 'No diameter for this slope.' : 'Eliminating c gives a line through all the midpoints.', q.none ? 'No diameter for this slope.' : 'Diameter: ' + q.eq + '.'])[k];
  },
  out: (P, lv) => { const q = dmCalc(P); if (q.none) return 'No diameter: chords of slope ' + fmt(P.m) + ' do not cut the ' + DM_SHORT[P.type] + ' in two points'; return 'Diameter: ' + q.eq + (P.type === 0 ? '  (= 2a/m)' : P.type === 1 ? '  (slope −b²/(a²m))' : '  (slope b²/(a²m))'); } });
MORE.extras.diam = { chip: 'Diameter of a conic', marks: [0, .12, .6, .82], ranges: { a: [.5, 8, .5], b: [.5, 8, .5], m: [-6, 6, .5] },
  handles: P => { const hs = [{ k: 'S', x: 2, y: 2 * P.m, label: 'slope' }, { k: 'A', x: P.a, y: 0, label: P.type === 0 ? 'focus' : 'a' }]; if (P.type !== 0) hs.push({ k: 'B', x: 0, y: P.b, label: 'b' }); return hs; },
  drag: (P, k, x, y) => (k === 'S' ? (Math.abs(x) < .5 ? null : Object.assign({}, P, { m: y / x })) : k === 'A' ? (x < .5 ? null : Object.assign({}, P, { a: x })) : (y < .5 ? null : Object.assign({}, P, { b: y }))),
  challenges: [{ id: 't9-dm-slope1', text: T2('Choose an ellipse whose diameter slopes down at exactly −1 (down 1 for every 1 across).', 'Choose a, b, m for the ellipse so that −b²/(a²m) = −1.'), hint: T2('Make the ellipse round (a = b) and the chords slope up at 1: m = 1.', 'b² = a²m; for example a = b = 3, m = 1.'), check: P => P.type === 1 && Math.abs(P.m) > 1e-9 && Math.abs(-P.b * P.b / (P.a * P.a * P.m) + 1) < 1e-9 },
    { id: 't9-dm-par1', text: T2('Choose the parabola and make its diameter the flat line y = 1.', 'Choose the parabola with 2a/m = 1.'), hint: T2('For a parabola the diameter is y = 2a/m. Try a = 1 and m = 2.', 'a = 1, m = 2 gives y = 2a/m = 1.'), check: P => P.type === 0 && Math.abs(P.m) > 1e-9 && Math.abs(2 * P.a / P.m - 1) < 1e-9 },
    { id: 't9-dm-vert', text: T2('Choose the ellipse and make the chords flat (slope 0). Where is the diameter?', 'Choose the ellipse with m = 0 (diameter x = 0).'), hint: T2('Flat chords are cut in half by the up-and-down axis of the ellipse. Set m = 0.', 'm = 0: the midpoints of horizontal chords lie on x = 0.'), check: P => P.type === 1 && Math.abs(P.m) < 1e-9 }] };
MORE.hooks.diam = 'Stretch many parallel strings across a drum: their middle points line up.';

// 9. Optical property of the parabola y² = 4ax
const opCalc = P => {
  const { a, ry } = P, xP = ry * ry / (4 * a), N = Math.hypot(ry, 2 * a), s = ry < 0 ? -1 : 1, tau = [Math.abs(ry) / N, s * 2 * a / N];
  const phi = Math.atan2(tau[1], tau[0]), psi = Math.atan2(-ry, a - xP), alpha = Math.atan2(2 * a, Math.abs(ry)), pf = Math.hypot(a - xP, ry);
  const beta = Math.acos(Math.min(1, Math.abs((a - xP) * tau[0] - ry * tau[1]) / pf));
  const d = [-1, 0], dt = d[0] * tau[0] + d[1] * tau[1], r = [2 * dt * tau[0] - d[0], 2 * dt * tau[1] - d[1]], cross = r[0] * (-ry) - r[1] * (a - xP);   // reflected direction r, and r x PF
  return { xP, tau, phi, psi, alpha, beta, pf, N, s, hit: Math.abs(cross) < 1e-9 * Math.max(1, pf), slope: Math.abs(ry) < 1e-12 ? NaN : 2 * a / ry };
};
mk('optics', 9, 'A ray hitting a parabola', 'Class 11–12', [['a', 'a  (focus at (a, 0))', 2], ['ry', 'height of the ray, y', 3]],
  ['A ray travelling parallel to the axis bounces off the parabola straight through the focus. That is why a satellite dish collects signals at one spot.', 'Parabola y² = 4ax, focus F(a, 0).  Ray y = y₀ meets it at P(y₀²/4a, y₀).  Tangent at P: y₀y = 2a(x + x₀), slope 2a/y₀.  The angle between the ray and the tangent equals the angle between PF and the tangent, so the reflected ray passes through F.'], {
  fit: P => { const q = opCalc(P), ym = Math.max(Math.abs(P.ry) + 1, 3); return [[-1.5, -ym], [Math.max(P.a + 3, q.xP + 3), ym]]; },
  valid: P => fin(P.a, P.ry) && P.a > EPS,
  draw(g, t, C, lv, P) {
    const q = opCalc(P), a = P.a, y0 = P.ry, e1 = ease(seg(t, .12, .38)), e2 = ease(seg(t, .38, .62)), e3 = ease(seg(t, .62, .82)), xr = g.b.x1;
    E.kit.implicit(g, (x, y) => y * y - 4 * a * x, C.c, 4);
    g.D(a, 0, C.g, 7); g.T('F(' + fmt(a) + ', 0)', a, 0, C.g, { dy: 20, size: 13 });
    if (e1 > 0) { E.kit.arrow(g, xr, y0, lerp(xr, q.xP, e1), y0, C.a, 3.5); g.D(lerp(xr, q.xP, e1), y0, C.a, 5); }
    if (e1 >= 1) { g.D(q.xP, y0, C.a, 8); g.T('P' + ptStr(q.xP, y0), q.xP, y0, C.a, { dx: -12, dy: y0 >= 0 ? -18 : 18, align: 'right', size: 13 }); }
    if (e2 > 0) g.LL(-2 * a, y0, -2 * a * q.xP, C.ink, 2.2, [8, 5], e2);
    if (e3 > 0) { const px = lerp(q.xP, a, e3), py = lerp(y0, 0, e3); E.kit.arrow(g, q.xP, y0, px, py, C.g, 3.5); }
    if (t > .82) {
      const ar = (a0, a1, col) => E.kit.arc(g, q.xP, y0, 34, a0, a1, col, .28, 2.5);
      ar(0, q.s * q.alpha, C.a); ar(q.phi - q.s * Math.PI, q.psi, C.g);
      g.T(fmt(q.alpha / D2R, 1) + '°', q.xP, y0, C.a, { dx: 56 * Math.cos(q.s * q.alpha / 2), dy: -56 * Math.sin(q.s * q.alpha / 2), size: 12 });
      g.T(fmt(q.beta / D2R, 1) + '°', q.xP, y0, C.g, { dx: 56 * Math.cos((q.phi - q.s * Math.PI + q.psi) / 2), dy: -56 * Math.sin((q.phi - q.s * Math.PI + q.psi) / 2), size: 12 });
    }
    const k = t < .12 ? 0 : t < .38 ? 1 : t < .62 ? 2 : t < .82 ? 3 : 4;
    return pick(lv, ['A parabola with its focus F. A ray (orange) comes in parallel to the axis at height ' + fmt(y0) + '.', 'The ray hits the parabola at P' + ptStr(q.xP, y0) + '.', 'Draw the tangent at P (dashed). The ray bounces off this tangent line like a ball off a wall.', 'The bounced ray (green) heads straight to the focus F.', 'The two marked angles are equal (' + fmt(q.alpha / D2R, 1) + '° each), so the ray bounces exactly through F.'],
      ['y² = 4ax with a = ' + fmt(a) + ', F = (' + fmt(a) + ', 0). The ray y = ' + fmt(y0) + ' meets it at P = (y₀²/4a, y₀) = ' + ptStr(q.xP, y0) + '.', 'x₀ = ' + fmt(y0 * y0) + '/' + fmt(4 * a) + ' = ' + fmt(q.xP) + '.', Math.abs(y0) < 1e-12 ? 'The tangent at the vertex is vertical (x = 0).' : 'Tangent: y₀y = 2a(x + x₀), slope 2a/y₀ = ' + fmt(q.slope) + '.', 'Reflect the ray direction in the tangent: the reflected ray points along PF.', 'Angle(ray, tangent) = ' + fmt(q.alpha / D2R, 2) + '° = angle(PF, tangent) = ' + fmt(q.beta / D2R, 2) + '°.'])[k];
  },
  out: (P, lv) => { const q = opCalc(P); return 'P = ' + ptStr(q.xP, P.ry) + ';  ' + (Math.abs(P.ry) < 1e-12 ? 'tangent is vertical' : 'tangent slope = 2a/y₀ = ' + fmt(q.slope)) + ';  angle with the axis = ' + fmt(q.alpha / D2R, 2) + '°, angle with PF = ' + fmt(q.beta / D2R, 2) + '°  →  ' + (q.hit && Math.abs(q.alpha - q.beta) < 1e-6 ? 'equal, so the reflected ray passes through the focus F(' + fmt(P.a) + ', 0)' : 'not equal'); } });
MORE.extras.optics = { chip: 'Parabola mirror', marks: [0, .12, .38, .62, .82], ranges: { a: [.5, 6, .5], ry: [-8, 8, 1] },
  handles: P => { const q = opCalc(P); return [{ k: 'R', x: q.xP + 3, y: P.ry, label: 'ray' }, { k: 'F', x: P.a, y: 0, label: 'F' }]; },
  drag: (P, k, x, y) => (k === 'R' ? Object.assign({}, P, { ry: y }) : (x < .5 ? null : Object.assign({}, P, { a: x }))),
  challenges: [{ id: 't9-op-lr', text: T2('Send the ray in at the height of the focus’s “standing wall” (y = 2a). What angle does the tangent make?', 'Choose y₀ = 2a. Show that the tangent slope is 1 (45°).'), hint: T2('With a = 2, set the ray height to 4. The tangent there is a perfect diagonal.', 'y₀ = 2a gives slope 2a/y₀ = 1 and P = (a, 2a), directly above F.'), check: P => Math.abs(P.ry - 2 * P.a) < 1e-9 },
    { id: 't9-op-axis', text: T2('Send the ray along the axis (height 0). Where does it bounce?', 'Choose y₀ = 0 (the ray travels along the axis).'), hint: T2('The ray hits the nose of the parabola, the vertex, and comes straight back.', 'At the vertex the tangent is vertical, so the ray reflects straight back through F.'), check: P => Math.abs(P.ry) < 1e-9 },
    { id: 't9-op-below', text: T2('Send a ray in below the axis. Does the property still work?', 'Choose y₀ < 0.'), hint: T2('Use a negative height, for example y = −2.', 'y₀ = −2 gives P = (1, −2) for a = 2.'), check: P => P.ry < 0 }] };
MORE.hooks.optics = 'A satellite dish and a car headlight use the same shape: one gathers parallel rays at a point, the other sends rays out in parallel.';

// 10. A conic from its focus, directrix and eccentricity
const dcCo = P => { const { a, b, c, h, k, e } = P, den = a * a + b * b, e2 = e * e; return [den - e2 * a * a, -2 * e2 * a * b, den - e2 * b * b, -2 * den * h - 2 * e2 * a * c, -2 * den * k - 2 * e2 * b * c, den * (h * h + k * k) - e2 * c * c]; };
const dcKind = e => (Math.abs(e - 1) < 1e-9 ? 'parabola' : e < 1 ? 'ellipse' : 'hyperbola');
const dcPts = P => {   // points of the conic found by looking out from the focus in direction phi
  const n = Math.hypot(P.a, P.b), nu = [P.a / n, P.b / n], s0 = (P.a * P.h + P.b * P.k + P.c) / n, e = P.e, A = [], B = [];
  for (let i = 0; i < 360; i++) {
    const phi = 2 * Math.PI * i / 360, u = [Math.cos(phi), Math.sin(phi)], w = nu[0] * u[0] + nu[1] * u[1];
    const r1 = e * s0 / (1 - e * w), r2 = -e * s0 / (1 + e * w);
    if (Number.isFinite(r1) && r1 > 1e-9 && s0 + r1 * w >= -1e-9) A.push({ r: r1, p: [P.h + r1 * u[0], P.k + r1 * u[1]] });
    if (Number.isFinite(r2) && r2 > 1e-9 && s0 + r2 * w <= 1e-9) B.push({ r: r2, p: [P.h + r2 * u[0], P.k + r2 * u[1]] });
  }
  return A.concat(B);
};
mk('dirconic', 9, 'A conic from its focus and directrix', 'Class 11–12', [['a', 'directrix a', 1], ['b', 'directrix b', 0], ['c', 'directrix c', 2], ['h', 'focus h', 0], ['k', 'focus k', 0], ['e', 'eccentricity e', .8]],
  ['Every point of the curve is e times as far from the focus as from the directrix line. The number e decides the shape.', 'PF = e·PD, with PD = |ax + by + c|/√(a² + b²).  Squaring: (a² + b²)[(x − h)² + (y − k)²] = e²(ax + by + c)².  e < 1 ellipse, e = 1 parabola, e > 1 hyperbola.'], {
  fit: P => { const co = dcCo(P), bx = curveBox(co, 10), n = Math.hypot(P.a, P.b), f = foot({ px: P.h, py: P.k, a: P.a, b: P.b, c: P.c }), pts = [[P.h, P.k], f]; if (bx) pts.push(bx[0], bx[1]); else pts.push([P.h - 4, P.k - 3], [P.h + 4, P.k + 3]); return keepIn(pts, 14); },
  valid: P => fin(P.a, P.b, P.c, P.h, P.k, P.e) && Math.hypot(P.a, P.b) > EPS && P.e > EPS,
  draw(g, t, C, lv, P) {
    const co = dcCo(P), n = Math.hypot(P.a, P.b), pts = dcPts(P), e1 = ease(seg(t, .12, .5)), kd = dcKind(P.e), nEq = polyStr(co, 'x', 'y');
    g.LL(P.a, P.b, P.c, C.c, 3, [9, 6]);
    E.kit.implicit(g, (x, y) => evalP(co, x, y), C.a, 3.5, t < .5 ? .3 : 1);
    g.D(P.h, P.k, C.g, 8); g.T('F', P.h, P.k, C.g, { dx: -14, dy: -14, size: 14 });
    if (t >= .12 && t < .8 && pts.length) {
      const idx = Math.min(pts.length - 1, Math.floor(e1 * (pts.length - 1))), it = pts[idx], d = Math.abs(P.a * it.p[0] + P.b * it.p[1] + P.c) / n, f = foot({ px: it.p[0], py: it.p[1], a: P.a, b: P.b, c: P.c });
      for (let i = 0; i < idx; i += 3) g.D(pts[i].p[0], pts[i].p[1], C.a, 2.5);
      g.L(it.p[0], it.p[1], P.h, P.k, C.g, 3); g.L(it.p[0], it.p[1], f[0], f[1], C.c, 3);
      g.D(it.p[0], it.p[1], C.a, 7);
      g.T('PF ' + fmt(it.r, 2) + ' = ' + fmt(P.e, 2) + ' × PD ' + fmt(d, 2), it.p[0], it.p[1], C.ink, { dy: -20, size: 12 });
    }
    const rows = [['F(' + fmt(P.h) + ', ' + fmt(P.k) + '),  directrix ' + eqStr(P.a, P.b, P.c) + ',  e = ' + fmt(P.e), C.ink]]; if (t >= .8) rows.push([nEq, C.a]); eqBox(g, rows);
    const k = t < .12 ? 0 : t < .5 ? 1 : t < .8 ? 2 : 3, s0 = (P.a * P.h + P.b * P.k + P.c) / n;
    return pick(lv, ['A fixed point F (the focus, green) and a fixed line (the directrix, blue dashes).', 'Take a point P on the curve. Its distance to F (green) is always ' + fmt(P.e, 2) + ' times its distance to the line (blue).', Math.abs(s0) < 1e-9 ? 'The focus lies on the directrix, so the curve falls apart into lines.' : 'Square both sides and tidy up. This gives an equation in x and y.',
      'The curve is a ' + kd + (P.e < 1 ? ' (e is less than 1).' : P.e > 1 ? ' (e is more than 1).' : ' (e = 1).') + '  ' + nEq],
    ['F = ' + ptStr(P.h, P.k) + ', directrix ' + eqStr(P.a, P.b, P.c) + ', e = ' + fmt(P.e) + '.', 'PF = e·PD,  PD = |' + fmt(P.a) + 'x + ' + fmt(P.b) + 'y + ' + fmt(P.c) + '|/' + fmt(n) + '.  Here PF/PD = ' + fmt(P.e) + ' at every point shown.', fmt(n * n) + '[(x − ' + fmt(P.h) + ')² + (y − ' + fmt(P.k) + ')²] = ' + fmt(P.e * P.e) + '(' + fmt(P.a) + 'x + ' + fmt(P.b) + 'y + ' + fmt(P.c) + ')².',
      nEq + ';  B² − 4AC = ' + fmt(co[1] * co[1] - 4 * co[0] * co[2]) + ' → ' + kd + '.'])[k];
  },
  out: (P, lv) => { const co = dcCo(P); return polyStr(co, 'x', 'y') + '   (' + dcKind(P.e) + ': focus ' + ptStr(P.h, P.k) + ', directrix ' + eqStr(P.a, P.b, P.c) + ', e = ' + fmt(P.e) + ')'; } });
MORE.extras.dirconic = { chip: 'Focus, directrix, e', marks: [0, .12, .5, .8], ranges: { a: [-5, 5, 1], b: [-5, 5, 1], c: [-12, 12, 1], h: R8, k: R8, e: [.1, 3, .1] },
  handles: P => { const f = foot({ px: P.h, py: P.k, a: P.a, b: P.b, c: P.c }); return [{ k: 'F', x: P.h, y: P.k, label: 'F' }, { k: 'L', x: f[0], y: f[1], label: 'line' }]; },
  drag: (P, k, x, y) => (k === 'F' ? Object.assign({}, P, { h: x, k: y }) : Object.assign({}, P, { c: -(P.a * x + P.b * y) })),
  challenges: [{ id: 't9-dc-par', text: T2('Make the curve a parabola.', 'Make e = 1.'), hint: T2('A parabola is the in-between case: the distance to the focus equals the distance to the line.', 'e = 1.'), check: P => Math.abs(P.e - 1) < 1e-9 },
    { id: 't9-dc-hyp', text: T2('Make the curve a hyperbola (two open branches).', 'Make e > 1.'), hint: T2('Make the focus-distance bigger than the line-distance: e more than 1, for example 2.', 'e > 1.'), check: P => P.e > 1 + 1e-9 },
    { id: 't9-dc-place', text: T2('Put the focus at (3, 0) and the directrix on the line x = −1.', 'Make F = (3, 0) and the directrix x + 1 = 0.'), hint: T2('The line x = −1 is x + 1 = 0, so a = 1, b = 0, c = 1.', 'a = 1, b = 0, c = 1, h = 3, k = 0.'), check: P => Math.abs(P.h - 3) < 1e-9 && Math.abs(P.k) < 1e-9 && Math.abs(P.b) < 1e-9 && Math.abs(P.a) > 1e-9 && Math.abs(P.c / P.a - 1) < 1e-9 }] };
MORE.hooks.dirconic = 'A comet path is a conic with the Sun at the focus. Its shape depends only on e.';

// ----- bindings for tab 9 -----
BINDINGS.push(
  { scene: 'chord', ids: ['chordCircleD', 'chordCircleE', 'chordCircleF', 'chordPx', 'chordPy'], get: v => ({ D: v[0], E: v[1], F: v[2], px: v[3], py: v[4], view: 0 }), set: P => ({ chordCircleD: P.D, chordCircleE: P.E, chordCircleF: P.F, chordPx: P.px, chordPy: P.py }) },
  { scene: 'chord', ids: ['poleCircleD', 'poleCircleE', 'poleCircleF', 'polePx', 'polePy'], get: v => ({ D: v[0], E: v[1], F: v[2], px: v[3], py: v[4], view: 1 }), set: P => ({ poleCircleD: P.D, poleCircleE: P.E, poleCircleF: P.F, polePx: P.px, polePy: P.py }) },
  { scene: 'rhtan', ids: ['rectHypC', 'rectHypM', 'rectHypK'], get: v => ({ c: v[0], m: v[1], k: v[2] }), set: P => ({ rectHypC: P.c, rectHypM: P.m, rectHypK: P.k }) },
  { scene: 'diam', ids: ['diamParaA', 'diamM'], present: root => chk(root, 'conicType') === 'parabola', get: v => ({ a: v[0], b: 3, m: v[1], type: 0 }), set: P => ({ diamParaA: P.a, diamM: P.m }), noHandles: ['B'] },
  { scene: 'diam', ids: ['diamA', 'diamB', 'diamM'], present: root => chk(root, 'conicType') === 'ellipse', sig: 'diam-ellipse', get: v => ({ a: v[0], b: v[1], m: v[2], type: 1 }), set: P => ({ diamA: P.a, diamB: P.b, diamM: P.m }) },
  { scene: 'diam', ids: ['diamA', 'diamB', 'diamM'], present: root => chk(root, 'conicType') === 'hyperbola', sig: 'diam-hyperbola', get: v => ({ a: v[0], b: v[1], m: v[2], type: 2 }), set: P => ({ diamA: P.a, diamB: P.b, diamM: P.m }) },
  { scene: 'optics', ids: ['optParaA', 'optRayY'], get: v => ({ a: v[0], ry: v[1] }), set: P => ({ optParaA: P.a, optRayY: P.ry }) },
  { scene: 'dirconic', ids: ['dirA', 'dirB', 'dirC', 'focusH', 'focusK'], text: ['eccValue'],
    get: (v, rr, tx) => { const ty = rr('dirConicType') || 'parabola', ev = num(tx, 'eccValue'); let e = 1; if (ty === 'ellipse') { if (!(ev > 0 && ev < 1)) return null; e = ev; } else if (ty === 'hyperbola') { if (!(ev > 1 && ev <= 10)) return null; e = ev; } return { a: v[0], b: v[1], c: v[2], h: v[3], k: v[4], e }; },
    set: P => ({ dirC: P.c, focusH: P.h, focusK: P.k }) });
});
