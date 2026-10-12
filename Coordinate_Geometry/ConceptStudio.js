// ========= Concept Studio: animations that use the student's own numbers =========
// A docked panel beside the lesson card. For every tab it offers:
//   - step-by-step animations (play, pause, previous/next step, scrub, speed),
//   - draggable orange handles that write back into the card's own inputs,
//   - "try your own numbers" boxes with sliders when no card is linked,
//   - the matching answer, and small challenges with hints and stars.
// Two wordings: School (Class 8-10, plain words) and Intermediate (Class 11-12, formulas).
// It reads the open card's inputs and, when a student drags a handle, writes the new numbers
// back into those same inputs. It does not change the existing maths.
(function () {
'use strict';
if (window.__conceptStudioLoaded) return;
window.__conceptStudioLoaded = true;

const C = { ink:'#14213d', muted:'#56627f', grid:'#e3e9f4', faint:'#9fb0cf', a:'#e2540b', b:'#0a8a8a', c:'#3556d8', g:'#2b9a45', paper:'#fbfcff' };
const FONT = '"Segoe UI", Roboto, system-ui, sans-serif';
const EPS = 1e-9;
const pick = (lv, s, i) => (lv === 'school' ? s : i);
const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (n, d = 4) => { const p = Math.pow(10, d); const r = Math.round(n * p) / p; return r === 0 ? 0 : r; };
const fmt = (n, d = 4) => String(rnd(n, d)).replace('-', '−');
const fin = (...v) => v.every(Number.isFinite);

// "ax + by + c = 0" written neatly
function eqStr(a, b, c, d = 4) {
  const terms = [];
  const add = (k, v) => { if (Math.abs(v) < EPS) return; const m = Math.abs(v); terms.push([v < 0 ? '−' : '+', (k && Math.abs(m - 1) < 1e-9) ? k : fmt(m, d) + k]); };
  add('x', a); add('y', b); add('', c);
  if (!terms.length) return '0 = 0';
  let s = (terms[0][0] === '−' ? '−' : '') + terms[0][1];
  for (let i = 1; i < terms.length; i++) s += ' ' + terms[i][0] + ' ' + terms[i][1];
  return s + ' = 0';
}
// bisector-style lines: smallest whole-number coefficients when the numbers are rational
function niceEq(l) {
  let a = l.a, b = l.b, c = l.c; const m = Math.max(Math.abs(a), Math.abs(b)) || 1; a /= m; b /= m; c /= m;
  if (a < -1e-9 || (Math.abs(a) < 1e-9 && b < -1e-9)) { a = -a; b = -b; c = -c; }
  for (let k = 1; k <= 60; k++) if ([a, b, c].every(v => Math.abs(v * k - Math.round(v * k)) < 1e-6)) { a *= k; b *= k; c *= k; break; }
  return eqStr(a, b, c, 2);
}
// "y = mx + c"
function slopeEq(m, c) {
  const mt = Math.abs(m) < EPS ? '' : (Math.abs(Math.abs(m) - 1) < 1e-9 ? (m < 0 ? '−x' : 'x') : fmt(m) + 'x');
  if (!mt) return 'y = ' + fmt(c);
  if (Math.abs(c) < EPS) return 'y = ' + mt;
  return 'y = ' + mt + (c < 0 ? ' − ' : ' + ') + fmt(Math.abs(c));
}
function fit(pts, pad = .22, min = 6) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  pts.forEach(p => { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  const w = Math.max((x1 - x0) * (1 + 2 * pad), min), h = Math.max((y1 - y0) * (1 + 2 * pad), min * .75);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2 };
}
function niceStep(span) {
  const raw = span / 10, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

// ---------- Canvas graph with live bounds ----------
function Graph(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), W = 480, H = 340;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d');
  const g = { ctx, W, H, sc: 1, ox: 0, oy: 0, step: 1, b: { x0: -5, x1: 5, y0: -4, y1: 4 } };
  g.X = x => g.ox + x * g.sc; g.Y = y => g.oy - y * g.sc;
  g.setBounds = b => {
    g.b = b; g.sc = Math.min((W - 40) / (b.x1 - b.x0), (H - 40) / (b.y1 - b.y0));
    g.ox = W / 2 - g.sc * (b.x0 + b.x1) / 2; g.oy = H / 2 + g.sc * (b.y0 + b.y1) / 2;
    g.step = niceStep(W / g.sc);
  };
  g.begin = () => { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); };
  g.L = (x1, y1, x2, y2, col, w = 2, dash, alpha = 1) => { ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(g.X(x1), g.Y(y1)); ctx.lineTo(g.X(x2), g.Y(y2)); ctx.stroke(); ctx.restore(); };
  // whole line a x + b y + c = 0 across the visible area
  g.LL = (a, b, c, col, w = 2, dash, alpha = 1) => {
    const n = Math.hypot(a, b); if (n < 1e-12) return;
    const bx = g.b, span = Math.max(bx.x1 - bx.x0, bx.y1 - bx.y0) * 3, cx = (bx.x0 + bx.x1) / 2, cy = (bx.y0 + bx.y1) / 2;
    const v = (a * cx + b * cy + c) / (n * n), fx = cx - a * v, fy = cy - b * v, dx = -b / n, dy = a / n;
    g.L(fx - dx * span, fy - dy * span, fx + dx * span, fy + dy * span, col, w, dash, alpha);
  };
  g.D = (x, y, col, r = 6) => { ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); };
  g.T = (s, x, y, col, o = {}) => { ctx.save(); ctx.font = (o.weight || 700) + ' ' + (o.size || 14) + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, g.X(x) + (o.dx || 0), g.Y(y) + (o.dy || 0)); ctx.restore(); };
  g.poly = (pts, col, alpha) => { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(g.X(p[0]), g.Y(p[1])) : ctx.moveTo(g.X(p[0]), g.Y(p[1])))); ctx.closePath(); ctx.fill(); ctx.restore(); };
  // small square marking a right angle at (x,y); u and w are world directions of the two arms
  g.right = (x, y, u, w, size = 11) => {
    const nu = Math.hypot(u[0], u[1]) || 1, nw = Math.hypot(w[0], w[1]) || 1;
    const a = [u[0] / nu * size, -u[1] / nu * size], b = [w[0] / nw * size, -w[1] / nw * size], px = g.X(x), py = g.Y(y);
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px + a[0], py + a[1]); ctx.lineTo(px + a[0] + b[0], py + a[1] + b[1]); ctx.lineTo(px + b[0], py + b[1]); ctx.stroke(); ctx.restore();
  };
  g.grid = () => {
    const sc = g.sc, ox = g.ox, oy = g.oy, st = g.step;
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = C.grid;
    const i0 = Math.ceil((-ox / sc) / st), i1 = Math.floor(((W - ox) / sc) / st), j0 = Math.ceil(((oy - H) / sc) / st), j1 = Math.floor((oy / sc) / st);
    for (let i = i0; i <= i1; i++) { const x = ox + i * st * sc; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let j = j0; j <= j1; j++) { const y = oy - j * st * sc; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink; ctx.lineWidth = 1.6;
    if (oy > 0 && oy < H) { ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W - 4, oy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W - 2, oy); ctx.lineTo(W - 11, oy - 4); ctx.lineTo(W - 11, oy + 4); ctx.fill(); }
    if (ox > 0 && ox < W) { ctx.beginPath(); ctx.moveTo(ox, H); ctx.lineTo(ox, 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ox, 2); ctx.lineTo(ox - 4, 11); ctx.lineTo(ox + 4, 11); ctx.fill(); }
    ctx.font = '600 11px ' + FONT; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (oy > 20 && oy < H - 18) for (let i = i0; i <= i1; i++) if (i) ctx.fillText(fmt(i * st, 3), ox + i * st * sc, oy + 14);
    if (ox > 24 && ox < W - 18) for (let j = j0; j <= j1; j++) if (j) { ctx.textAlign = 'right'; ctx.fillText(fmt(j * st, 3), ox - 6, oy - j * st * sc); }
    ctx.restore(); ctx.save(); ctx.font = '700 13px ' + FONT; ctx.fillStyle = C.ink;
    ctx.fillText('x', W - 16, Math.min(H - 8, Math.max(14, oy - 12))); ctx.fillText('y', Math.min(W - 10, Math.max(10, ox + 12)), 14);
    if (ox > 14 && ox < W - 14 && oy > 14 && oy < H - 14) ctx.fillText('O', ox - 12, oy + 14);
    ctx.restore();
  };
  g.setBounds(g.b);
  return g;
}

// ---------- Scenes ----------
// params: [key, label, default]. fit(P) -> points to keep in view. draw(g,t,C,lv,P) -> step text. out(P,lv) -> answer text.
const scenes = [
{ id:'plot', tab:1, title:'Plotting a point', tag:'Class 8–10', params:[['px','x',3],['py','y',2]],
  f:['Point = (across, up)','P(x, y). Signs by quadrant: I (+,+)  II (−,+)  III (−,−)  IV (+,−)'],
  fit:P => [[0, 0], [P.px, P.py], [-2, -2], [2, 2]],
  valid:P => fin(P.px, P.py),
  draw(g, t, C, lv, P) {
    const { px, py } = P, b = g.b;
    [['I', .55, .55], ['II', -.55, .55], ['III', -.55, -.55], ['IV', .55, -.55]].forEach(q => g.T(q[0], q[1] > 0 ? b.x1 * q[1] : b.x0 * -q[1], q[2] > 0 ? b.y1 * q[2] : b.y0 * -q[2], C.faint, { size: 24, weight: 800 }));
    const s1 = ease(seg(t, .05, .4)), s2 = ease(seg(t, .4, .75)), cx = px * s1, cy = py * s2;
    g.L(0, 0, cx, 0, C.c, 5); if (s2 > 0) g.L(px, 0, px, cy, C.g, 5);
    if (t > .75) {
      g.L(px, py, px, 0, C.faint, 1.5, [5, 5]); g.L(px, py, 0, py, C.faint, 1.5, [5, 5]);
      g.T(fmt(px), px, 0, C.c, { dy: py >= 0 ? 30 : -30, size: 16 }); g.T(fmt(py), 0, py, C.g, { dx: px >= 0 ? -30 : 30, size: 16 });
      g.T('P(' + fmt(px) + ', ' + fmt(py) + ')', px, py, C.a, { dx: px >= 0 ? 6 : -6, dy: py >= 0 ? -20 : 20, size: 16 });
    }
    g.D(cx, cy, C.a, 8);
    const k = t < .05 ? 0 : t < .4 ? 1 : t < .75 ? 2 : 3, q = quadrant(px, py);
    return pick(lv, ['Start at the origin, (0, 0).', 'Walk ' + fmt(Math.abs(px)) + ' step' + (Math.abs(px) === 1 ? '' : 's') + ' ' + (px >= 0 ? 'right' : 'left') + ' along the x-axis.', 'Now walk ' + fmt(Math.abs(py)) + ' step' + (Math.abs(py) === 1 ? '' : 's') + ' ' + (py >= 0 ? 'up' : 'down') + '.', 'You have arrived at P(' + fmt(px) + ', ' + fmt(py) + ').'],
      ['Origin O(0, 0).', 'Abscissa x = ' + fmt(px) + ', measured along the x-axis.', 'Ordinate y = ' + fmt(py) + ', measured parallel to the y-axis.', 'P = (x, y) = (' + fmt(px) + ', ' + fmt(py) + '), ' + q + '.'])[k];
  },
  out:(P, lv) => 'P(' + fmt(P.px) + ', ' + fmt(P.py) + ') is ' + quadrant(P.px, P.py) + '.' },

{ id:'distance', tab:4, title:'Distance between two points', tag:'Class 8–12', params:[['x1','x₁',1],['y1','y₁',1],['x2','x₂',5],['y2','y₂',4]],
  f:['Right triangle: leg² + leg² = longest side²','d = √[(x₂ − x₁)² + (y₂ − y₁)²]'],
  fit:P => [[P.x1, P.y1], [P.x2, P.y2]],
  valid:P => fin(P.x1, P.y1, P.x2, P.y2),
  draw(g, t, C, lv, P) {
    const { x1, y1, x2, y2 } = P, dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
    g.D(x1, y1, C.a, 7); g.T('A(' + fmt(x1) + ', ' + fmt(y1) + ')', x1, y1, C.ink, { dy: dy >= 0 ? 20 : -20, size: 14 });
    if (t > .05) { g.D(x2, y2, C.a, 7); g.T('B(' + fmt(x2) + ', ' + fmt(y2) + ')', x2, y2, C.ink, { dy: dy >= 0 ? -20 : 20, size: 14 }); }
    const s = seg(t, .2, .4), h = ease(seg(t, .4, .6)), v = ease(seg(t, .6, .8));
    if (s > 0) g.L(x1, y1, x1 + dx * s, y1 + dy * s, C.a, 3, [1, 8]);
    if (h > 0) g.L(x1, y1, x1 + dx * h, y1, C.c, 5);
    if (v > 0) g.L(x2, y1, x2, y1 + dy * v, C.g, 5);
    if (h >= 1 && Math.abs(dx) > EPS) g.T(fmt(Math.abs(dx)), (x1 + x2) / 2, y1, C.c, { dy: dy >= 0 ? 20 : -20, size: 17 });
    if (v >= 1 && Math.abs(dy) > EPS) { g.T(fmt(Math.abs(dy)), x2, (y1 + y2) / 2, C.g, { dx: dx >= 0 ? 18 : -18, size: 17 }); if (Math.abs(dx) > EPS) g.right(x2, y1, [-dx, 0], [0, dy]); }
    if (t > .8) { g.L(x1, y1, x2, y2, C.a, 4); g.T(fmt(d), (x1 + x2) / 2, (y1 + y2) / 2, C.a, { dx: dx * dy >= 0 ? -16 : 16, dy: -14, size: 19 }); }
    g.D(x1, y1, C.a, 7); g.D(x2, y2, C.a, 7);
    const k = t < .2 ? 0 : t < .4 ? 1 : t < .6 ? 2 : t < .8 ? 3 : 4, S = dx * dx + dy * dy;
    return pick(lv, ['Two points: A(' + fmt(x1) + ', ' + fmt(y1) + ') and B(' + fmt(x2) + ', ' + fmt(y2) + ').', 'Join them. How long is AB?', 'Walk across first: ' + fmt(Math.abs(dx)) + ' units.', 'Then ' + (dy >= 0 ? 'up' : 'down') + ': ' + fmt(Math.abs(dy)) + ' units.', 'Longest side: √(' + fmt(Math.abs(dx)) + '² + ' + fmt(Math.abs(dy)) + '²) = √' + fmt(S) + ' = ' + fmt(d) + '.'],
      ['Points A(x₁, y₁) = (' + fmt(x1) + ', ' + fmt(y1) + ') and B(x₂, y₂) = (' + fmt(x2) + ', ' + fmt(y2) + ').', 'Segment AB is the hypotenuse.', 'Δx = x₂ − x₁ = ' + fmt(x2) + ' − ' + fmt(x1) + ' = ' + fmt(dx) + '.', 'Δy = y₂ − y₁ = ' + fmt(y2) + ' − ' + fmt(y1) + ' = ' + fmt(dy) + '.', 'd = √(' + fmt(dx) + '² + ' + fmt(dy) + '²) = √' + fmt(S) + ' = ' + fmt(d) + ' units.'])[k];
  },
  out:(P, lv) => { const dx = P.x2 - P.x1, dy = P.y2 - P.y1, S = dx * dx + dy * dy; return pick(lv, 'Distance AB = ' + fmt(Math.sqrt(S)) + ' units', 'd = √(' + fmt(dx) + '² + ' + fmt(dy) + '²) = √' + fmt(S) + ' = ' + fmt(Math.sqrt(S))); } },

{ id:'section', tab:1, title:'Midpoint and section formula', tag:'Class 9–12', params:[['ax','x₁',-4],['ay','y₁',-1],['bx','x₂',4],['by','y₂',3],['m','m',2],['n','n',1]], ext:true,
  f:['Middle point = the average of both ends. For a ratio, P sits m parts from A and n parts from B.','P = ((m·x₂ + n·x₁)/(m + n), (m·y₂ + n·y₁)/(m + n)); external: divide by (m − n) and use (m·x₂ − n·x₁)'],
  fit:P => { const p = sectionPoint(P); return [[P.ax, P.ay], [P.bx, P.by]].concat(p ? [p] : []); },
  valid:P => fin(P.ax, P.ay, P.bx, P.by, P.m, P.n),
  draw(g, t, C, lv, P) {
    const { ax, ay, bx, by, m, n } = P, p = sectionPoint(P), ext = !!P.ext;
    g.D(ax, ay, C.ink, 6); g.D(bx, by, C.ink, 6);
    g.T('A(' + fmt(ax) + ', ' + fmt(ay) + ')', ax, ay, C.ink, { dy: 22 }); g.T('B(' + fmt(bx) + ', ' + fmt(by) + ')', bx, by, C.ink, { dy: -20 });
    if (!p) { g.L(ax, ay, bx, by, C.muted, 3); return pick(lv, 'This ratio gives no single point (m and n cancel out).', 'No finite point: ' + (ext ? 'm = n' : 'm + n = 0') + '.'); }
    const e = ease(seg(t, .15, .75)), cx = lerp(ax, p[0], e), cy = lerp(ay, p[1], e);
    if (!ext) { g.L(ax, ay, cx, cy, C.c, 5); g.L(cx, cy, bx, by, C.g, 5); }
    else { g.L(ax, ay, bx, by, C.muted, 3); g.L(ax, ay, cx, cy, C.c, 3, [8, 6]); }
    if (t > .75 && !ext) { g.T('m = ' + fmt(m), (ax + p[0]) / 2, (ay + p[1]) / 2, C.c, { dy: -16, size: 14 }); g.T('n = ' + fmt(n), (bx + p[0]) / 2, (by + p[1]) / 2, C.g, { dy: -16, size: 14 }); }
    g.D(cx, cy, C.a, 9); g.T('P', cx, cy, C.a, { dx: -4, dy: -20, size: 17 });
    const k = t < .15 ? 0 : t < .75 ? 1 : 2, pt = '(' + fmt(p[0]) + ', ' + fmt(p[1]) + ')';
    return pick(lv, ['A and B.', 'P slides along the line…', (ext ? 'P is outside AB' : 'P is inside AB') + ' with AP : PB = ' + fmt(m) + ' : ' + fmt(n) + '. So P = ' + pt + '.'],
      ['A(' + fmt(ax) + ', ' + fmt(ay) + '), B(' + fmt(bx) + ', ' + fmt(by) + '), m : n = ' + fmt(m) + ' : ' + fmt(n) + '.', 'Moving P to the point that satisfies AP : PB = m : n.', (ext ? 'External' : 'Internal') + ' division: P = ' + pt + '.'])[k];
  },
  out:(P, lv) => { const p = sectionPoint(P); if (!p) return 'No single point for this ratio.'; const mid = !P.ext && Math.abs(P.m - P.n) < EPS; return (mid ? 'Midpoint' : (P.ext ? 'External' : 'Internal') + ' division') + ' P = (' + fmt(p[0]) + ', ' + fmt(p[1]) + ')'; } },

{ id:'area', tab:1, title:'Area of a triangle and collinearity', tag:'Class 9–12', params:[['x1','x₁',-3],['y1','y₁',-1],['x2','x₂',3],['y2','y₂',1],['x3','x₃',1],['y3','y₃',3]],
  f:['Area = the space inside the triangle. If it shrinks to 0, the 3 points are on one line.','Area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|;  collinear ⇔ Area = 0'],
  fit:P => [[P.x1, P.y1], [P.x2, P.y2], [P.x3, P.y3]],
  valid:P => fin(P.x1, P.y1, P.x2, P.y2, P.x3, P.y3),
  draw(g, t, C, lv, P) {
    const { x1, y1, x2, y2, x3, y3 } = P, S = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2), area = Math.abs(S) / 2, col = area < 1e-7;
    const e1 = ease(seg(t, .15, .3)), e2 = ease(seg(t, .3, .45)), e3 = ease(seg(t, .45, .6));
    if (!col) g.poly([[x1, y1], [x2, y2], [x3, y3]], C.a, .2 * ease(seg(t, .6, .85)));
    const lc = col ? C.g : C.c;
    g.L(x1, y1, lerp(x1, x2, e1), lerp(y1, y2, e1), lc, 3.5); g.L(x2, y2, lerp(x2, x3, e2), lerp(y2, y3, e2), lc, 3.5); g.L(x3, y3, lerp(x3, x1, e3), lerp(y3, y1, e3), lc, 3.5);
    [['A', x1, y1], ['B', x2, y2], ['C', x3, y3]].forEach(([nm, x, y]) => { g.D(x, y, C.ink, 6); g.T(nm + '(' + fmt(x) + ', ' + fmt(y) + ')', x, y, C.ink, { dy: -18, size: 13 }); });
    if (t > .85) { const cx = (x1 + x2 + x3) / 3, cy = (y1 + y2 + y3) / 3; g.T(col ? 'area = 0' : 'area = ' + fmt(area), cx, cy, col ? C.g : C.a, { size: 17 }); }
    const k = t < .15 ? 0 : t < .6 ? 1 : 2;
    return pick(lv, ['Three points A, B and C.', 'Join them to make a triangle.', col ? 'The triangle is flat: area 0, so A, B and C are on one line (collinear).' : 'The shaded space is the area: ' + fmt(area) + ' square units.'],
      ['A(' + fmt(x1) + ', ' + fmt(y1) + '), B(' + fmt(x2) + ', ' + fmt(y2) + '), C(' + fmt(x3) + ', ' + fmt(y3) + ').', 'Triangle ABC.', 'Area = ½ |' + fmt(x1) + '(' + fmt(y2) + '−' + fmt(y3) + ') + ' + fmt(x2) + '(' + fmt(y3) + '−' + fmt(y1) + ') + ' + fmt(x3) + '(' + fmt(y1) + '−' + fmt(y2) + ')| = ½ |' + fmt(S) + '| = ' + fmt(area) + (col ? '  → collinear' : '')])[k];
  },
  out:(P, lv) => { const S = P.x1 * (P.y2 - P.y3) + P.x2 * (P.y3 - P.y1) + P.x3 * (P.y1 - P.y2); return 'Area = ' + fmt(Math.abs(S) / 2) + ' square units' + (Math.abs(S) < 1e-7 ? '  → the 3 points are collinear' : '  → not collinear'); } },

{ id:'slope', tab:2, title:'Slope and the line y = mx + c', tag:'Class 9–12', params:[['x1','x₁',0],['y1','y₁',1],['x2','x₂',2],['y2','y₂',5]],
  f:['Slope = up ÷ across. A bigger number means a steeper line.','m = (y₂ − y₁)/(x₂ − x₁);  y = mx + c, where c = y₁ − m·x₁'],
  fit:P => [[P.x1, P.y1], [P.x2, P.y2]],
  valid:P => fin(P.x1, P.y1, P.x2, P.y2) && (Math.abs(P.x2 - P.x1) > EPS || Math.abs(P.y2 - P.y1) > EPS),
  draw(g, t, C, lv, P) {
    const { x1, y1, x2, y2 } = P, dx = x2 - x1, dy = y2 - y1, vert = Math.abs(dx) < EPS, m = vert ? NaN : dy / dx, c = vert ? NaN : y1 - m * x1;
    g.LL(dy, -dx, dx * y1 - dy * x1, C.a, 4, null, ease(seg(t, .08, .28)));
    g.D(x1, y1, C.a, 7); g.D(x2, y2, C.a, 7);
    const h = ease(seg(t, .3, .55)), v = ease(seg(t, .55, .8));
    if (!vert) { g.L(x1, y1, lerp(x1, x2, h), y1, C.c, 4); if (v > 0) g.L(x2, y1, x2, lerp(y1, y2, v), C.g, 4); }
    else if (v > 0) g.L(x1, y1, x1, lerp(y1, y2, v), C.g, 4);
    if (h >= 1 && !vert && Math.abs(dy) > EPS) g.T('run ' + fmt(dx), (x1 + x2) / 2, y1, C.c, { dy: dy >= 0 ? 18 : -18, size: 13 });
    if (v >= 1 && Math.abs(dy) > EPS) g.T('rise ' + fmt(dy), vert ? x1 : x2, (y1 + y2) / 2, C.g, { dx: dx >= 0 ? 36 : -36, size: 13 });
    const k = t < .08 ? 0 : t < .3 ? 1 : t < .55 ? 2 : t < .8 ? 3 : 4;
    if (vert) return pick(lv, ['Two points.', 'The line through them.', 'No steps across: the line is straight up and down.', 'It rises ' + fmt(dy) + '.', 'A vertical line has no slope. Its equation is x = ' + fmt(x1) + '.'], ['Two points.', 'Line through them.', 'Δx = 0.', 'Δy = ' + fmt(dy) + '.', 'm = Δy/Δx is undefined: vertical line x = ' + fmt(x1) + '.'])[k];
    return pick(lv, ['Two points on the line.', 'Draw the line through them.', 'Run: ' + fmt(dx) + ' across.', 'Rise: ' + fmt(Math.abs(dy)) + ' ' + (dy >= 0 ? 'up' : 'down') + '.', 'Slope = rise ÷ run = ' + fmt(dy) + ' ÷ ' + fmt(dx) + ' = ' + fmt(m) + '.'],
      ['P₁(' + fmt(x1) + ', ' + fmt(y1) + '), P₂(' + fmt(x2) + ', ' + fmt(y2) + ').', 'Line P₁P₂.', 'Δx = ' + fmt(x2) + ' − ' + fmt(x1) + ' = ' + fmt(dx) + '.', 'Δy = ' + fmt(y2) + ' − ' + fmt(y1) + ' = ' + fmt(dy) + '.', 'm = ' + fmt(dy) + '/' + fmt(dx) + ' = ' + fmt(m) + ',  c = y₁ − m·x₁ = ' + fmt(c) + '.'])[k];
  },
  out:(P, lv) => { const dx = P.x2 - P.x1, dy = P.y2 - P.y1; if (Math.abs(dx) < EPS) return 'Vertical line x = ' + fmt(P.x1) + ' (slope undefined)'; const m = dy / dx; return 'Slope m = ' + fmt(m) + (Math.abs(m) < EPS ? ' (flat)' : m > 0 ? ' (rising)' : ' (falling)') + ';  ' + slopeEq(m, P.y1 - m * P.x1); } },

{ id:'intercept', tab:2, title:'Intercept form of a line', tag:'Class 9–12', params:[['a','a (x-intercept)',3],['b','b (y-intercept)',4]],
  f:['The line cuts the x-axis at a and the y-axis at b.','x/a + y/b = 1;  area of the triangle with the axes = ½|ab|'],
  fit:P => [[0, 0], [P.a, 0], [0, P.b]],
  valid:P => fin(P.a, P.b) && Math.abs(P.a) > EPS && Math.abs(P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { a, b } = P, e1 = ease(seg(t, .08, .3)), e2 = ease(seg(t, .3, .65));
    g.poly([[0, 0], [a, 0], [0, b]], C.a, .16 * ease(seg(t, .65, .9)));
    if (e1 > 0) { g.D(a, 0, C.c, 8 * e1); g.D(0, b, C.g, 8 * e1); }
    if (e2 > 0) { g.L(a, 0, lerp(a, 0, e2), lerp(0, b, e2), C.a, 4); g.L(a, 0, lerp(a, a + (a - 0) * .45, e2), lerp(0, -b * .45, e2), C.a, 4, [8, 6]); g.L(0, b, lerp(0, -a * .45, e2), lerp(b, b + b * .45, e2), C.a, 4, [8, 6]); }
    if (e1 >= 1) { g.T('(' + fmt(a) + ', 0)', a, 0, C.c, { dy: b >= 0 ? 24 : -24, size: 13 }); g.T('(0, ' + fmt(b) + ')', 0, b, C.g, { dx: a >= 0 ? 52 : -52, size: 13 }); }
    const k = t < .08 ? 0 : t < .3 ? 1 : t < .65 ? 2 : 3;
    return pick(lv, ['The axes.', 'Mark where the line cuts the x-axis (' + fmt(a) + ') and the y-axis (' + fmt(b) + ').', 'Join the two marks.', 'The line makes a triangle with the axes. Its area is ½ × ' + fmt(Math.abs(a)) + ' × ' + fmt(Math.abs(b)) + ' = ' + fmt(Math.abs(a * b) / 2) + '.'],
      ['Axes.', 'x-intercept a = ' + fmt(a) + ', y-intercept b = ' + fmt(b) + '.', 'x/' + fmt(a) + ' + y/' + fmt(b) + ' = 1.', 'Area = ½|ab| = ' + fmt(Math.abs(a * b) / 2) + '.'])[k];
  },
  out:(P, lv) => 'x/' + fmt(P.a) + ' + y/' + fmt(P.b) + ' = 1  ⇒  ' + eqStr(P.b, P.a, -P.a * P.b) + ';  area = ' + fmt(Math.abs(P.a * P.b) / 2) },

{ id:'twolines', tab:3, title:'Angle between two lines', tag:'Class 9–12', params:[['a1','a₁',2],['b1','b₁',-3],['c1','c₁',4],['a2','a₂',1],['b2','b₂',1],['c2','c₂',-3]],
  f:['The angle is how far you turn from one line to the other.','tan θ = |(m₂ − m₁)/(1 + m₁m₂)|;  m₁m₂ = −1 means the lines are perpendicular'],
  fit:P => { const I = intersect(P); return I ? [[I[0] - 4.5, I[1] - 3.5], [I[0] + 4.5, I[1] + 3.5]] : [[-4, -3], [4, 3]]; },
  valid:P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2) && Math.hypot(P.a1, P.b1) > EPS && Math.hypot(P.a2, P.b2) > EPS,
  draw(g, t, C, lv, P) {
    const { a1, b1, c1, a2, b2, c2 } = P, I = intersect(P), al1 = dirAngle(a1, b1), al2 = dirAngle(a2, b2);
    let dl = al2 - al1; while (dl > Math.PI / 2) dl -= Math.PI; while (dl <= -Math.PI / 2) dl += Math.PI;
    const th = Math.abs(dl) * 180 / Math.PI;
    g.LL(a1, b1, c1, C.c, 3.5);
    if (!I) { const same = coincident(P); g.LL(a2, b2, c2, C.g, same ? 1.5 : 3.5, same ? [8, 6] : null); return same ? pick(lv, 'Both equations draw the same line: the lines are coincident.', 'The equations are proportional: the lines are coincident (the same line).') : pick(lv, 'These lines are parallel: they never meet, so the angle is 0°.', 'a₁b₂ − a₂b₁ = 0: parallel lines, θ = 0°.'); }
    const e = ease(seg(t, .2, .7)), al = al1 + dl * e, ca = Math.cos(al), sa = Math.sin(al);
    g.LL(-sa, ca, sa * I[0] - ca * I[1], C.g, 3.5);
    const r = 40, cx = g.X(I[0]), cy = g.Y(I[1]), ctx = g.ctx;
    if (Math.abs(dl * e) > 1e-4) { ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = C.a; ctx.beginPath(); ctx.moveTo(cx, cy); if (dl >= 0) ctx.arc(cx, cy, r, -al, -al1); else ctx.arc(cx, cy, r, -al1, -al); ctx.closePath(); ctx.fill(); ctx.restore(); g.T(fmt(Math.abs(dl * e) * 180 / Math.PI, 1) + '°', I[0], I[1], C.a, { dx: Math.cos((al + al1) / 2) * (r + 26), dy: -Math.sin((al + al1) / 2) * (r + 26), size: 14 }); }
    g.D(I[0], I[1], C.ink, 6);
    const perp = Math.abs(th - 90) < 1e-6, k = t < .2 ? 0 : t < .7 ? 1 : 2;
    return pick(lv, ['Line 1 (blue). Line 2 (green) turns until it lies in its place.', 'Line 2 turns…', perp ? 'A right angle: the lines are perpendicular.' : 'The angle between the lines is about ' + fmt(th, 1) + '°.'],
      ['L₁: ' + eqStr(a1, b1, c1) + ';  L₂: ' + eqStr(a2, b2, c2) + '.', 'Turning from L₁ to L₂…', 'cos θ = |a₁a₂ + b₁b₂| / (√(a₁²+b₁²)·√(a₂²+b₂²)) → θ = ' + fmt(th, 2) + '°' + (perp ? ' (a₁a₂ + b₁b₂ = 0, perpendicular)' : '') + '.'])[k];
  },
  out:(P, lv) => { const I = intersect(P), al1 = dirAngle(P.a1, P.b1), al2 = dirAngle(P.a2, P.b2); let dl = al2 - al1; while (dl > Math.PI / 2) dl -= Math.PI; while (dl <= -Math.PI / 2) dl += Math.PI; const th = Math.abs(dl) * 180 / Math.PI; if (!I) return coincident(P) ? 'The lines are coincident (the same line): infinitely many common points' : 'Parallel lines: θ = 0°, no intersection'; return 'θ = ' + fmt(th, 4) + '° (acute), ' + fmt(180 - th, 4) + '° (obtuse)' + (Math.abs(th - 90) < 1e-6 ? ', perpendicular' : '') + ';  meet at (' + fmt(I[0]) + ', ' + fmt(I[1]) + ')'; } },

{ id:'ptline', tab:4, title:'Distance from a point to a line', tag:'Class 11–12', params:[['px','x₁',4],['py','y₁',3],['a','a',3],['b','b',4],['c','c',-12]], extra:['c0'],
  f:['The shortest way from a point to a line is straight across, at a right angle.','d = |ax₁ + by₁ + c| / √(a² + b²)  for the line ax + by + c = 0'],
  fit:P => { const f = foot(P); return [[P.px, P.py], f, [f[0] + 3, f[1] + 2], [f[0] - 3, f[1] - 2]]; },
  valid:P => fin(P.px, P.py, P.a, P.b, P.c) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { px, py, a, b, c } = P, n = Math.hypot(a, b), v = a * px + b * py + c, d = Math.abs(v) / n, F = foot(P), hasC0 = Number.isFinite(P.c0);
    g.LL(a, b, c, C.ink, 3.5); if (hasC0) g.LL(a, b, P.c0, C.muted, 3, [8, 6]);
    const e = ease(seg(t, .3, .7)), qx = lerp(px, F[0], e), qy = lerp(py, F[1], e);
    g.D(px, py, C.a, 9); g.T('P(' + fmt(px) + ', ' + fmt(py) + ')', px, py, C.a, { dx: 10, dy: -18, size: 14 });
    if (e > 0) g.L(px, py, qx, qy, C.c, 3.5, [8, 6]);
    if (e >= 1) { g.D(F[0], F[1], C.g, 6); g.right(F[0], F[1], [px - F[0], py - F[1]], [-b, a]); g.T('d = ' + fmt(d), (px + F[0]) / 2, (py + F[1]) / 2, C.c, { dx: 28, dy: -6, size: 15 }); }
    const k = t < .3 ? 0 : t < .7 ? 1 : 2;
    return pick(lv, [hasC0 ? 'Two parallel lines. Pick a point on the first one.' : 'A line and a point P.', 'Drop a straight (perpendicular) path from P to the line.', 'The shortest distance is ' + fmt(d) + ' units.'],
      ['Line ' + eqStr(a, b, c) + (hasC0 ? ' and ' + eqStr(a, b, P.c0) : '') + '; P(' + fmt(px) + ', ' + fmt(py) + ').', 'Substitute P: a·x₁ + b·y₁ + c = ' + fmt(v) + '.', 'd = |' + fmt(v) + '| / √(' + fmt(a) + '² + ' + fmt(b) + '²) = ' + fmt(Math.abs(v)) + ' / ' + fmt(n) + ' = ' + fmt(d) + '.'])[k];
  },
  out:(P, lv) => { const n = Math.hypot(P.a, P.b), v = P.a * P.px + P.b * P.py + P.c, F = foot(P); return 'd = |' + fmt(v) + '| / ' + fmt(n) + ' = ' + fmt(Math.abs(v) / n) + ';  foot of the perpendicular = (' + fmt(F[0]) + ', ' + fmt(F[1]) + ')'; } },

{ id:'locus', tab:5, title:'Locus: equal distance from two points', tag:'Class 11–12', params:[['ax','x₁',-2],['ay','y₁',0],['bx','x₂',2],['by','y₂',0]],
  f:['A locus is the path of every point that follows one rule.','PA = PB ⇒ the locus is the perpendicular bisector of AB'],
  fit:P => { const m = [(P.ax + P.bx) / 2, (P.ay + P.by) / 2], u = bisDir(P), amp = bisAmp(P); return [[P.ax, P.ay], [P.bx, P.by], [m[0] + u[0] * amp, m[1] + u[1] * amp], [m[0] - u[0] * amp, m[1] - u[1] * amp]]; },
  valid:P => fin(P.ax, P.ay, P.bx, P.by) && Math.hypot(P.bx - P.ax, P.by - P.ay) > EPS,
  draw(g, t, C, lv, P) {
    const { ax, ay, bx, by } = P, mx = (ax + bx) / 2, my = (ay + by) / 2, u = bisDir(P), amp = bisAmp(P), s = amp * Math.sin(2 * Math.PI * t), px = mx + u[0] * s, py = my + u[1] * s, d = Math.hypot(px - ax, py - ay);
    const lc = locusLine(P); g.LL(lc[0], lc[1], lc[2], C.faint, 2, [6, 6]); g.L(mx, my, px, py, C.a, 5);
    g.L(ax, ay, px, py, C.c, 3); g.L(bx, by, px, py, C.g, 3);
    g.D(ax, ay, C.ink, 6); g.D(bx, by, C.ink, 6); g.T('A(' + fmt(ax) + ', ' + fmt(ay) + ')', ax, ay, C.ink, { dy: 20 }); g.T('B(' + fmt(bx) + ', ' + fmt(by) + ')', bx, by, C.ink, { dy: 20 });
    g.T(fmt(d, 2), (ax + px) / 2, (ay + py) / 2, C.c, { dx: -14, dy: -8, size: 13 }); g.T(fmt(d, 2), (bx + px) / 2, (by + py) / 2, C.g, { dx: 14, dy: -8, size: 13 });
    g.D(px, py, C.a, 9); g.T('P', px, py, C.a, { dx: 15, dy: -12, size: 15 });
    return pick(lv, ['PA = ' + fmt(d, 2) + ' and PB = ' + fmt(d, 2) + '. They stay equal, so P travels along a straight line.'], ['PA = PB = ' + fmt(d, 2) + '.  The locus is ' + eqStr(lc[0], lc[1], lc[2]) + '.']);
  },
  out:(P, lv) => { const lc = locusLine(P); return 'Locus of P: ' + eqStr(lc[0], lc[1], lc[2]) + (Math.abs(lc[1]) > EPS ? '  i.e. ' + slopeEq(-lc[0] / lc[1], -lc[2] / lc[1]) : '') + '  (the perpendicular bisector of AB)'; } },

{ id:'bisector', tab:6, title:'Angle bisector', tag:'Class 11–12', params:[['a1','a₁',1],['b1','b₁',-3],['c1','c₁',0],['a2','a₂',3],['b2','b₂',-1],['c2','c₂',0]],
  f:['The bisector cuts the angle into 2 equal halves. Every point on it is the same distance from both lines.','(a₁x + b₁y + c₁)/√(a₁² + b₁²) = ± (a₂x + b₂y + c₂)/√(a₂² + b₂²)'],
  fit:P => { const I = intersect(P) || [0, 0]; return [[I[0] - 5, I[1] - 4], [I[0] + 5, I[1] + 4]]; },
  valid:P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2) && Math.hypot(P.a1, P.b1) > EPS && Math.hypot(P.a2, P.b2) > EPS,
  draw(g, t, C, lv, P) {
    const { a1, b1, c1, a2, b2, c2 } = P, bs = bisectors(P), I = intersect(P) || [0, 0];
    g.LL(a1, b1, c1, C.c, 3.5); g.LL(a2, b2, c2, C.g, 3.5);
    const main = bisPick(P, bs); if (!main) return 'These two lines are the same line.';
    bs.forEach(x => x.ok && g.LL(x.a, x.b, x.c, C.a, 2.5, [8, 6]));
    const n = Math.hypot(main.a, main.b), dx = -main.b / n, dy = main.a / n, base = intersect(P) ? I : projOrigin(main), s = 3.2 * Math.sin(2 * Math.PI * t) + (intersect(P) ? 0 : 0);
    const Q = [base[0] + dx * s, base[1] + dy * s], n1 = Math.hypot(a1, b1), n2 = Math.hypot(a2, b2), v1 = a1 * Q[0] + b1 * Q[1] + c1, v2 = a2 * Q[0] + b2 * Q[1] + c2, F1 = [Q[0] - a1 * v1 / (n1 * n1), Q[1] - b1 * v1 / (n1 * n1)], F2 = [Q[0] - a2 * v2 / (n2 * n2), Q[1] - b2 * v2 / (n2 * n2)];
    g.L(Q[0], Q[1], F1[0], F1[1], C.c, 2, [5, 4]); g.L(Q[0], Q[1], F2[0], F2[1], C.g, 2, [5, 4]); g.D(F1[0], F1[1], C.c, 5); g.D(F2[0], F2[1], C.g, 5);
    const d1 = Math.abs(v1) / n1, d2 = Math.abs(v2) / n2;
    g.T('d = ' + fmt(d1, 2), (Q[0] + F1[0]) / 2, (Q[1] + F1[1]) / 2, C.c, { dx: 30, dy: 12, size: 13 }); g.T('d = ' + fmt(d2, 2), (Q[0] + F2[0]) / 2, (Q[1] + F2[1]) / 2, C.g, { dx: -30, dy: -12, size: 13 });
    g.D(Q[0], Q[1], C.a, 8); g.T('Q', Q[0], Q[1], C.a, { dx: 14, dy: -12, size: 14 });
    return pick(lv, ['Point Q is ' + fmt(d1, 2) + ' from line 1 and ' + fmt(d2, 2) + ' from line 2: always equal on the bisector.'], ['Bisector: ' + niceEq(main) + '.  Distances from Q: ' + fmt(d1, 2) + ' and ' + fmt(d2, 2) + ' (equal).']);
  },
  out:(P, lv) => { const bs = bisectors(P), ok = bs.filter(x => x.ok); if (!ok.length) return 'The two lines are identical.'; if (P.mode && ok.length > 1) { const m = bisPick(P, bs); return (P.mode === 'acute' ? 'Bisector of the acute angle: ' : P.mode === 'obtuse' ? 'Bisector of the obtuse angle: ' : 'Bisector containing P: ') + niceEq(m); } return 'Bisector' + (ok.length > 1 ? 's: ' : ': ') + ok.map(x => niceEq(x)).join('   and   '); } },

{ id:'stdpoints', tab:7, title:'Standard points of a triangle', tag:'Class 11–12', params:[['x1','x₁',-4],['y1','y₁',-2],['x2','x₂',5],['y2','y₂',-1],['x3','x₃',0],['y3','y₃',5]],
  f:['Four special centres: centroid, circumcentre, orthocentre, incentre.','G = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3);  H = A + B + C − 2·S;  I = (a·A + b·B + c·C)/(a + b + c)'],
  fit:P => { const T = triPts(P), pts = [T.A, T.B, T.C]; if (T.ok && T.R < 6 * T.size) pts.push([T.O[0] - T.R, T.O[1] - T.R], [T.O[0] + T.R, T.O[1] + T.R]); return pts; },
  valid:P => fin(P.x1, P.y1, P.x2, P.y2, P.x3, P.y3),
  draw(g, t, C, lv, P) {
    const T = triPts(P), ctx = g.ctx, { A, B, C: Cp } = T;
    g.L(A[0], A[1], B[0], B[1], C.ink, 3); g.L(B[0], B[1], Cp[0], Cp[1], C.ink, 3); g.L(Cp[0], Cp[1], A[0], A[1], C.ink, 3);
    [['A', A, -14, 14], ['B', B, 14, 14], ['C', Cp, 0, -16]].forEach(([nm, p, dx, dy]) => { g.D(p[0], p[1], C.ink, 6); g.T(nm, p[0], p[1], C.ink, { dx, dy, size: 15 }); });
    if (!T.ok) return pick(lv, 'These three points are on one line, so there is no triangle.', 'Collinear points: area = 0, no triangle.');
    const part = (P1, Q1, s, col, w) => g.L(P1[0], P1[1], lerp(P1[0], Q1[0], s), lerp(P1[1], Q1[1], s), col, w);
    const s1 = ease(seg(t, .04, .2)), s2 = ease(seg(t, .27, .43)), s3 = ease(seg(t, .5, .66)), s4 = ease(seg(t, .73, .89));
    if (s1 > 0) { part(A, mid(B, Cp), s1, C.c, 2.5); part(B, mid(A, Cp), s1, C.c, 2.5); part(Cp, mid(A, B), s1, C.c, 2.5); if (s1 >= 1) g.D(T.G[0], T.G[1], C.c, 8); }
    if (s2 > 0) { [[A, B], [B, Cp], [Cp, A]].forEach(([p, q]) => part(mid(p, q), T.O, s2, C.g, 2.5)); if (T.R < 6 * T.size) { ctx.save(); ctx.globalAlpha = s2; ctx.strokeStyle = C.g; ctx.lineWidth = 1.8; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(g.X(T.O[0]), g.Y(T.O[1]), T.R * g.sc, 0, 7); ctx.stroke(); ctx.restore(); } if (s2 >= 1) g.D(T.O[0], T.O[1], C.g, 8); }
    if (s3 > 0) { part(A, ft(A, B, Cp), s3, C.a, 2.5); part(B, ft(B, A, Cp), s3, C.a, 2.5); part(Cp, ft(Cp, A, B), s3, C.a, 2.5); if (s3 >= 1) g.D(T.H[0], T.H[1], C.a, 8); }
    if (s4 > 0) { [A, B, Cp].forEach(p => part(p, T.I, s4, C.b, 2.5)); ctx.save(); ctx.globalAlpha = s4; ctx.strokeStyle = C.b; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(g.X(T.I[0]), g.Y(T.I[1]), T.r * g.sc, 0, 7); ctx.stroke(); ctx.restore(); if (s4 >= 1) g.D(T.I[0], T.I[1], C.b, 8); }
    if (t > .9) { g.T('G', T.G[0], T.G[1], C.c, { dx: -12, dy: -12, size: 14 }); g.T('S', T.O[0], T.O[1], C.g, { dx: 12, dy: -12, size: 14 }); g.T('H', T.H[0], T.H[1], C.a, { dx: 12, dy: -12, size: 14 }); g.T('I', T.I[0], T.I[1], C.b, { dx: 12, dy: 10, size: 14 }); }
    const k = t < .04 ? 0 : t < .27 ? 1 : t < .5 ? 2 : t < .73 ? 3 : 4, pt = p => '(' + fmt(p[0], 2) + ', ' + fmt(p[1], 2) + ')';
    return pick(lv, ['A triangle ABC.', 'Medians (to the middle of each side) meet at the centroid G ' + pt(T.G) + '.', 'Perpendicular bisectors meet at the circumcentre S ' + pt(T.O) + ', the centre of the circle through A, B, C.', 'Altitudes (straight down from each corner) meet at the orthocentre H ' + pt(T.H) + '.', 'Angle bisectors meet at the incentre I ' + pt(T.I) + ', the centre of the circle inside.'],
      ['Triangle ABC.', 'G = ' + pt(T.G) + '  (average of the vertices).', 'S = ' + pt(T.O) + ',  R = ' + fmt(T.R, 2) + '  (equal distance to A, B, C).', 'H = ' + pt(T.H) + '  (altitudes meet).', 'I = ' + pt(T.I) + ',  r = ' + fmt(T.r, 2) + '  (inradius = Area / s).'])[k];
  },
  out:(P, lv) => { const T = triPts(P); if (!T.ok) return 'The points are collinear: no triangle.'; const pt = p => '(' + fmt(p[0], 2) + ', ' + fmt(p[1], 2) + ')'; return 'Centroid G = ' + pt(T.G) + ';  Circumcentre S = ' + pt(T.O) + ';  Orthocentre H = ' + pt(T.H) + ';  Incentre I = ' + pt(T.I); } },

{ id:'shift', tab:8, title:'Shifting and rotating the axes', tag:'Class 11–12', params:[['h','h',2],['k','k',1],['th','θ (degrees)',0],['px','x of P',4],['py','y of P',3]],
  f:['New address = old address minus how far the corner moved (then turned).','Translation: x′ = x − h, y′ = y − k.  Rotation by θ: x′ = x cos θ + y sin θ, y′ = −x sin θ + y cos θ'],
  fit:P => { const R = 3; return [[0, 0], [P.h, P.k], [P.px, P.py], [P.h - R, P.k - R], [P.h + R, P.k + R]]; },
  valid:P => fin(P.h, P.k, P.th, P.px, P.py) },

{ id:'circle', tab:9, title:'A line meets a circle', tag:'Class 11–12', params:[['cx','centre x',0],['cy','centre y',0],['r','radius r',3],['a','a',0],['b','b',1],['c','c',-1.5]],
  f:['A line can cross a circle 2 times, touch it once, or miss it.','Distance from the centre to the line: d = |a·cx + b·cy + c|/√(a² + b²).  d < r secant · d = r tangent · d > r none'],
  fit:P => [[P.cx - P.r, P.cy - P.r], [P.cx + P.r, P.cy + P.r], ...(Math.abs(circleD(P)) < 3 * P.r ? [] : [[P.cx - P.r * 3, P.cy], [P.cx + P.r * 3, P.cy]])],
  valid:P => fin(P.cx, P.cy, P.r, P.a, P.b, P.c) && P.r > EPS && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { cx, cy, r, a, b } = P, n = Math.hypot(a, b), ux = a / n, uy = b / n, ds = circleD(P), sgn = ds >= 0 ? 1 : -1;
    const start = Math.abs(ds) < r + 2.5 ? sgn * (r + 2.5) : ds, e = ease(seg(t, .1, .75)), dt = lerp(start, ds, e), ctx = g.ctx;
    ctx.save(); ctx.strokeStyle = C.c; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(g.X(cx), g.Y(cy), r * g.sc, 0, 7); ctx.stroke(); ctx.restore();
    g.D(cx, cy, C.c, 4);
    const fx = cx - dt * ux, fy = cy - dt * uy, dx = -uy, dy = ux, span = Math.max(g.b.x1 - g.b.x0, g.b.y1 - g.b.y0) * 3;
    g.L(fx - dx * span, fy - dy * span, fx + dx * span, fy + dy * span, C.a, 3.5);
    const D = r * r - dt * dt, tan = Math.abs(Math.abs(dt) - r) < (e < 1 ? 0.02 * r : 1e-3 * Math.max(r, 1));
    if (D > 0 && !tan) { const hh = Math.sqrt(D); g.L(fx - dx * hh, fy - dy * hh, fx + dx * hh, fy + dy * hh, C.g, 6); g.D(fx + dx * hh, fy + dy * hh, C.g, 7); g.D(fx - dx * hh, fy - dy * hh, C.g, 7); }
    else if (tan) g.D(fx, fy, C.g, 8);
    const state = tan ? 'tangent' : D > 0 ? 'secant' : 'none';
    const last = t >= .75, ad = Math.abs(ds), fstate = Math.abs(ad - r) < 1e-3 * Math.max(r, 1) ? 'tangent' : ad < r ? 'secant' : 'none';
    if (!last) return pick(lv, [state === 'tangent' ? 'The line is touching the circle at exactly one point.' : state === 'secant' ? 'The line cuts the circle at 2 points.' : 'The line has not reached the circle yet.'], ['Distance from the centre to the moving line = ' + fmt(Math.abs(dt), 2) + ';  radius = ' + fmt(r, 2) + '.']);
    return pick(lv, [fstate === 'tangent' ? 'The line touches the circle at one point: a tangent.' : fstate === 'secant' ? 'The line cuts the circle at 2 points. The chord inside is ' + fmt(2 * Math.sqrt(r * r - ad * ad), 3) + ' long.' : 'The line misses the circle: 0 points.'],
      ['d = ' + fmt(ad, 3) + (fstate === 'tangent' ? ' = r = ' + fmt(r, 3) + ': tangent' : fstate === 'secant' ? ' < r = ' + fmt(r, 3) + ': secant, chord = 2√(r² − d²) = ' + fmt(2 * Math.sqrt(r * r - ad * ad), 3) : ' > r = ' + fmt(r, 3) + ': no intersection') + '.']);
  },
  out:(P, lv) => { const ad = Math.abs(circleD(P)), r = P.r, st = Math.abs(ad - r) < 1e-3 * Math.max(r, 1) ? 'tangent (touches at 1 point)' : ad < r ? 'secant (cuts at 2 points), chord length = ' + fmt(2 * Math.sqrt(r * r - ad * ad), 4) : 'no intersection'; return 'd = ' + fmt(ad, 4) + ', r = ' + fmt(r, 4) + '  →  ' + st; } },

{ id:'threed', tab:10, title:'Points in 3D', tag:'Class 11–12', noGrid:true, params:[['ax','A: x',0],['ay','A: y',0],['az','A: z',0],['bx','B: x',3],['by','B: y',2],['bz','B: z',4]],
  f:['3 numbers: along, across, up.','AB = √(Δx² + Δy² + Δz²);  direction ratios = (Δx, Δy, Δz)'],
  fit:P => [[0, 0]], valid:P => fin(P.ax, P.ay, P.az, P.bx, P.by, P.bz),
  draw(g, t, C, lv, P) {
    const ctx = g.ctx, ext = Math.max(2, ...[P.ax, P.ay, P.az, P.bx, P.by, P.bz].map(Math.abs)), L = ext + 1, u = Math.min(40, 140 / (ext + 1)), O = [240, 195], cs = .866;
    const pr = (x, y, z) => [O[0] + (y - x) * cs * u, O[1] + (x + y) * .5 * u - z * u];
    const ln = (p0, p1, col, w, dash) => { const p = pr(...p0), q = pr(...p1); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); };
    const tx = (s, p, col, dx, dy, size = 15) => { ctx.save(); ctx.font = '700 ' + size + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(s, p[0] + dx, p[1] + dy); ctx.restore(); };
    const gs = Math.max(1, Math.ceil(ext / 5)); for (let i = 0; i <= L; i += gs) { ln([i, 0, 0], [i, L, 0], C.grid, 1); ln([0, i, 0], [L, i, 0], C.grid, 1); }
    ln([0, 0, 0], [L, 0, 0], C.ink, 1.8); ln([0, 0, 0], [0, L, 0], C.ink, 1.8); ln([0, 0, 0], [0, 0, L], C.ink, 1.8);
    ln([0, 0, 0], [-L, 0, 0], C.faint, 1.3, [4, 4]); ln([0, 0, 0], [0, -L, 0], C.faint, 1.3, [4, 4]); ln([0, 0, 0], [0, 0, -L], C.faint, 1.3, [4, 4]);
    tx('x', pr(L + .7, 0, 0), C.ink, 0, 5); tx('y', pr(0, L + .7, 0), C.ink, 0, 5); tx('z', pr(0, 0, L + .7), C.ink, 0, 0);
    const { ax, ay, az, bx, by, bz } = P, s1 = ease(seg(t, .05, .3)), s2 = ease(seg(t, .3, .55)), s3 = ease(seg(t, .55, .8)), dx = bx - ax, dy = by - ay, dz = bz - az;
    if (t > .8) { const X = [ax, bx], Y = [ay, by], Z = [az, bz]; for (const x of X) for (const y of Y) ln([x, y, Z[0]], [x, y, Z[1]], C.faint, 1.5, [5, 5]); for (const y of Y) for (const z of Z) ln([X[0], y, z], [X[1], y, z], C.faint, 1.5, [5, 5]); for (const x of X) for (const z of Z) ln([x, Y[0], z], [x, Y[1], z], C.faint, 1.5, [5, 5]); ln([ax, ay, az], [bx, by, bz], C.a, 3, [1, 8]); }
    ln([ax, ay, az], [ax + dx * s1, ay, az], C.c, 5); if (s2 > 0) ln([bx, ay, az], [bx, ay + dy * s2, az], C.g, 5); if (s3 > 0) ln([bx, by, az], [bx, by, az + dz * s3], C.b, 5);
    const tip = pr(s2 > 0 ? bx : ax + dx * s1, s2 > 0 ? ay + dy * s2 : ay, s3 > 0 ? az + dz * s3 : az);
    ctx.save(); ctx.fillStyle = C.a; ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(tip[0], tip[1], 8, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    const A0 = pr(ax, ay, az); ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(A0[0], A0[1], 5, 0, 7); ctx.fill(); ctx.restore();
    if (t > .8) tx('(' + fmt(bx) + ', ' + fmt(by) + ', ' + fmt(bz) + ')', tip, C.a, 0, -16, 14);
    const k = t < .05 ? 0 : t < .3 ? 1 : t < .55 ? 2 : t < .8 ? 3 : 4, len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return pick(lv, ['Start at A(' + fmt(ax) + ', ' + fmt(ay) + ', ' + fmt(az) + ').', 'Move ' + fmt(dx) + ' along the x direction.', 'Move ' + fmt(dy) + ' along the y direction.', 'Now move ' + fmt(dz) + ' up the z direction.', 'You are at B(' + fmt(bx) + ', ' + fmt(by) + ', ' + fmt(bz) + '). The straight distance AB is ' + fmt(len) + '.'],
      ['A(' + fmt(ax) + ', ' + fmt(ay) + ', ' + fmt(az) + ').', 'Δx = ' + fmt(bx) + ' − ' + fmt(ax) + ' = ' + fmt(dx) + '.', 'Δy = ' + fmt(by) + ' − ' + fmt(ay) + ' = ' + fmt(dy) + '.', 'Δz = ' + fmt(bz) + ' − ' + fmt(az) + ' = ' + fmt(dz) + '.', 'AB = √(' + fmt(dx) + '² + ' + fmt(dy) + '² + ' + fmt(dz) + '²) = √' + fmt(dx * dx + dy * dy + dz * dz) + ' = ' + fmt(len) + '.'])[k];
  },
  out:(P, lv) => { const dx = P.bx - P.ax, dy = P.by - P.ay, dz = P.bz - P.az, S = dx * dx + dy * dy + dz * dz; return 'AB = √' + fmt(S) + ' = ' + fmt(Math.sqrt(S)) + ';  direction ratios (' + fmt(dx) + ', ' + fmt(dy) + ', ' + fmt(dz) + ')'; } }
];

// ---------- geometry helpers ----------
function quadrant(x, y) { if (Math.abs(x) < EPS && Math.abs(y) < EPS) return 'at the origin'; if (Math.abs(x) < EPS) return 'on the y-axis'; if (Math.abs(y) < EPS) return 'on the x-axis'; return 'in Quadrant ' + (x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III')); }
function sectionPoint(P) { const { ax, ay, bx, by, m, n } = P, den = P.ext ? m - n : m + n; if (Math.abs(den) < EPS) return null; return P.ext ? [(m * bx - n * ax) / den, (m * by - n * ay) / den] : [(m * bx + n * ax) / den, (m * by + n * ay) / den]; }
function intersect(P) { const det = P.a1 * P.b2 - P.a2 * P.b1; if (Math.abs(det) < 1e-9) return null; return [(P.b1 * P.c2 - P.b2 * P.c1) / det, (P.c1 * P.a2 - P.c2 * P.a1) / det]; }
function coincident(P) { return Math.abs(P.a1 * P.b2 - P.a2 * P.b1) < 1e-9 && Math.abs(P.a1 * P.c2 - P.a2 * P.c1) < 1e-9 && Math.abs(P.b1 * P.c2 - P.b2 * P.c1) < 1e-9; }
function dirAngle(a, b) { let t = Math.atan2(-a, b); while (t < 0) t += Math.PI; while (t >= Math.PI) t -= Math.PI; return t; }
function foot(P) { const n2 = P.a * P.a + P.b * P.b, v = P.a * P.px + P.b * P.py + P.c; return [P.px - P.a * v / n2, P.py - P.b * v / n2]; }
function bisDir(P) { const dx = P.bx - P.ax, dy = P.by - P.ay, L = Math.hypot(dx, dy); return [-dy / L, dx / L]; }
function bisAmp(P) { return Math.max(Math.hypot(P.bx - P.ax, P.by - P.ay) * .65, 2); }
function locusLine(P) { const dx = P.bx - P.ax, dy = P.by - P.ay; return [dx, dy, (P.ax * P.ax + P.ay * P.ay - P.bx * P.bx - P.by * P.by) / 2]; }
function projOrigin(l) { const n2 = l.a * l.a + l.b * l.b; return [-l.a * l.c / n2, -l.b * l.c / n2]; }
// Which bisector to follow: the acute / obtuse one, or the one containing a point (P.mode), else the first valid.
function bisPick(P, bs) {
  const ok = bs.filter(x => x.ok); if (ok.length < 2 || !P.mode) return ok[0];
  const n1 = Math.hypot(P.a1, P.b1), n2 = Math.hypot(P.a2, P.b2);
  if (P.mode === 'point') { const s1 = (P.a1 * P.px + P.b1 * P.py + P.c1) / n1, s2 = (P.a2 * P.px + P.b2 * P.py + P.c2) / n2; return s1 * s2 > 0 ? bs[0] : bs[1]; }
  const u1 = [P.b1 / n1, -P.a1 / n1], u2 = [P.b2 / n2, -P.a2 / n2], dot = u1[0] * u2[0] + u1[1] * u2[1];
  if (Math.abs(dot) < 1e-9) return ok[0];
  const tgt = dot > 0 ? [u1[0] + u2[0], u1[1] + u2[1]] : [u1[0] - u2[0], u1[1] - u2[1]], cr = x => Math.abs(x.b * tgt[1] + x.a * tgt[0]);
  const acute = cr(bs[0]) <= cr(bs[1]) ? bs[0] : bs[1];
  return P.mode === 'acute' ? acute : (acute === bs[0] ? bs[1] : bs[0]);
}
function bisectors(P) {
  const n1 = Math.hypot(P.a1, P.b1), n2 = Math.hypot(P.a2, P.b2), mk = (s) => { const a = P.a1 / n1 + s * P.a2 / n2, b = P.b1 / n1 + s * P.b2 / n2, c = P.c1 / n1 + s * P.c2 / n2, m = Math.max(Math.abs(a), Math.abs(b)); if (m < 1e-9) return { ok: false }; let k = 1 / m; if ((Math.abs(a) > 1e-9 ? a : b) < 0) k = -k; return { ok: true, a: a * k, b: b * k, c: c * k }; };
  return [mk(-1), mk(1)];
}
function circleD(P) { const n = Math.hypot(P.a, P.b); return (P.a * P.cx + P.b * P.cy + P.c) / n; }
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
function ft(P1, Q, R) { const dx = R[0] - Q[0], dy = R[1] - Q[1], u = ((P1[0] - Q[0]) * dx + (P1[1] - Q[1]) * dy) / (dx * dx + dy * dy); return [Q[0] + u * dx, Q[1] + u * dy]; }
function triPts(P) {
  const A = [P.x1, P.y1], B = [P.x2, P.y2], Cp = [P.x3, P.y3], d = 2 * (A[0] * (B[1] - Cp[1]) + B[0] * (Cp[1] - A[1]) + Cp[0] * (A[1] - B[1])), sq = p => p[0] * p[0] + p[1] * p[1], dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const size = Math.max(dist(A, B), dist(B, Cp), dist(A, Cp)) || 1;
  if (Math.abs(d) < 1e-9) return { A, B, C: Cp, ok: false, size };
  const O = [(sq(A) * (B[1] - Cp[1]) + sq(B) * (Cp[1] - A[1]) + sq(Cp) * (A[1] - B[1])) / d, (sq(A) * (Cp[0] - B[0]) + sq(B) * (A[0] - Cp[0]) + sq(Cp) * (B[0] - A[0])) / d];
  const a = dist(B, Cp), b = dist(A, Cp), c = dist(A, B), area = Math.abs(d) / 4;
  return { A, B, C: Cp, ok: true, size, O, R: dist(O, A), G: [(A[0] + B[0] + Cp[0]) / 3, (A[1] + B[1] + Cp[1]) / 3], H: [A[0] + B[0] + Cp[0] - 2 * O[0], A[1] + B[1] + Cp[1] - 2 * O[1]], I: [(a * A[0] + b * B[0] + c * Cp[0]) / (a + b + c), (a * A[1] + b * B[1] + c * Cp[1]) / (a + b + c)], r: area / ((a + b + c) / 2) };
}

// Shift / rotate scene needs the full draw; defined here so the helpers above are in scope.
(function () {
  const sc = scenes.find(s => s.id === 'shift');
  sc.draw = function (g, t, C, lv, P) {
    const { h, k, th, px, py } = P, e1 = ease(seg(t, .12, .5)), e2 = ease(seg(t, .5, .85)), phi = th * Math.PI / 180 * e2, ox = h * e1, oy = k * e1, cp = Math.cos(phi), sp = Math.sin(phi);
    const R = .42 * Math.max(g.b.x1 - g.b.x0, g.b.y1 - g.b.y0);
    g.LL(-sp, cp, sp * ox - cp * oy, C.a, 3);                // X' axis: through O' with direction (cos, sin)
    g.LL(cp, sp, -(cp * ox + sp * oy), C.a, 3);              // Y' axis: direction (-sin, cos)
    const xs = (px - h) * Math.cos(th * Math.PI / 180) + (py - k) * Math.sin(th * Math.PI / 180), ys = -(px - h) * Math.sin(th * Math.PI / 180) + (py - k) * Math.cos(th * Math.PI / 180);
    if (t > .85) { const fx = [ox + cp * xs, oy + sp * xs], fy = [ox - sp * ys, oy + cp * ys]; g.L(px, py, fx[0], fx[1], C.c, 2, [6, 5]); g.L(px, py, fy[0], fy[1], C.g, 2, [6, 5]); }
    g.D(ox, oy, C.a, 7); g.T('O′', ox, oy, C.a, { dx: -16, dy: 16, size: 14 });
    g.T('X′', ox + cp * R, oy + sp * R, C.a, { dy: -14, size: 14 }); g.T('Y′', ox - sp * R, oy + cp * R, C.a, { dx: 14, size: 14 });
    g.D(px, py, C.ink, 8); g.T('P(' + fmt(px) + ', ' + fmt(py) + ')', px, py, C.ink, { dx: 14, dy: 20, align: 'left', size: 14 });
    const kk = t < .12 ? 0 : t < .5 ? 1 : t < .85 ? 2 : 3, rot = Math.abs(th) > 1e-9;
    return pick(lv, ['The old axes (dark). Where will P be in new axes?', 'Slide the origin to (' + fmt(h) + ', ' + fmt(k) + ').', rot ? 'Turn the axes by ' + fmt(th) + '°.' : 'The axes keep their direction (no turn).', 'In the new axes P is at (' + fmt(xs, 3) + ', ' + fmt(ys, 3) + ').'],
      ['Old system XOY, P(' + fmt(px) + ', ' + fmt(py) + ').', 'Translate: new origin O′(h, k) = (' + fmt(h) + ', ' + fmt(k) + ').', rot ? 'Rotate by θ = ' + fmt(th) + '°.' : 'θ = 0°: no rotation.', rot ? 'x′ = (x−h)cos θ + (y−k)sin θ = ' + fmt(xs, 3) + ',  y′ = −(x−h)sin θ + (y−k)cos θ = ' + fmt(ys, 3) + '.' : 'x′ = x − h = ' + fmt(px) + ' − ' + fmt(h) + ' = ' + fmt(xs, 3) + ',  y′ = y − k = ' + fmt(py) + ' − ' + fmt(k) + ' = ' + fmt(ys, 3) + '.'])[kk];
  };
  sc.out = function (P, lv) {
    const c = Math.cos(P.th * Math.PI / 180), s = Math.sin(P.th * Math.PI / 180), xs = (P.px - P.h) * c + (P.py - P.k) * s, ys = -(P.px - P.h) * s + (P.py - P.k) * c;
    return "P′ = (x′, y′) = (" + fmt(xs, 4) + ', ' + fmt(ys, 4) + ') in the new axes';
  };
})();

// ---------- Which app card feeds which animation ----------
// ids: every id must exist in the open card; get(v, readRadio) turns the typed numbers into scene params.
const BINDINGS = [
  { scene:'distance',  ids:['x1','y1','x2','y2'],                                    get:v => ({ x1:v[0], y1:v[1], x2:v[2], y2:v[3] }) },
  { scene:'section',   ids:['mx1','my1','mx2','my2'],                                get:v => ({ ax:v[0], ay:v[1], bx:v[2], by:v[3], m:1, n:1, ext:0 }) },
  { scene:'section',   ids:['sx1','sy1','sx2','sy2','mVal','nVal'],                  get:(v, rr) => ({ ax:v[0], ay:v[1], bx:v[2], by:v[3], m:v[4], n:v[5], ext:rr('sectionMode') === 'external' ? 1 : 0 }) },
  { scene:'stdpoints', ids:['cx1','cy1','cx2','cy2','cx3','cy3'],                    get:v => tri(v) },
  { scene:'area',      ids:['ax1','ay1','ax2','ay2','ax3','ay3'],                    get:v => tri(v) },
  { scene:'area',      ids:['colx1','coly1','colx2','coly2','colx3','coly3'],        get:v => tri(v) },
  { scene:'area',      ids:['areaAppAx','areaAppAy','areaAppBx','areaAppBy','areaAppCx','areaAppCy'], get:v => tri(v) },
  { scene:'ptline',    ids:['plX','plY','lineA','lineB','lineC'],                    get:v => ({ px:v[0], py:v[1], a:v[2], b:v[3], c:v[4] }) },
  { scene:'ptline',    ids:['plA','plB','plC1','plC2'],                              get:v => { const n2 = v[0] * v[0] + v[1] * v[1]; return { px:-v[0] * v[2] / n2, py:-v[1] * v[2] / n2, a:v[0], b:v[1], c:v[3], c0:v[2] }; } },
  { scene:'ptline',    ids:['originA','originB','originC'],                          get:v => ({ px:0, py:0, a:v[0], b:v[1], c:v[2] }) },
  { scene:'ptline',    ids:['footX1','footY1','footA','footB','footC'],              get:v => ({ px:v[0], py:v[1], a:v[2], b:v[3], c:v[4] }) },
  { scene:'slope',     ids:['slopeX1','slopeY1','slopeX2','slopeY2'],                get:v => ({ x1:v[0], y1:v[1], x2:v[2], y2:v[3] }) },
  { scene:'slope',     ids:['siM','siC'],                                            get:v => ({ x1:0, y1:v[1], x2:1, y2:v[0] + v[1] }) },
  { scene:'slope',     ids:['psX1','psY1','psM'],                                    get:v => ({ x1:v[0], y1:v[1], x2:v[0] + 1, y2:v[1] + v[2] }) },
  { scene:'slope',     ids:['tpX1','tpY1','tpX2','tpY2'],                            get:v => ({ x1:v[0], y1:v[1], x2:v[2], y2:v[3] }) },
  { scene:'intercept', ids:['intA','intB'],                                          get:v => ({ a:v[0], b:v[1] }) },
  { scene:'intercept', ids:['interceptAppA','interceptAppB'],                        get:v => ({ a:v[0], b:v[1] }) },
  { scene:'intercept', ids:['genA','genB','genC'],                                   get:v => ({ a:-v[2] / v[0], b:-v[2] / v[1] }) },
  { scene:'twolines',  ids:['angleM1','angleM2'],                                    get:v => ({ a1:v[0], b1:-1, c1:0, a2:v[1], b2:-1, c2:0 }) },
  { scene:'twolines',  ids:['parA1','parB1','parC1','parA2','parB2','parC2'],        get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'twolines',  ids:['perpA1','perpB1','perpC1','perpA2','perpB2','perpC2'],  get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'twolines',  ids:['intA1','intB1','intC1','intA2','intB2','intC2'],        get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'locus',     ids:['eq2pAx','eq2pAy','eq2pBx','eq2pBy'],                    get:v => ({ ax:v[0], ay:v[1], bx:v[2], by:v[3] }) },
  { scene:'bisector',  ids:['eq2lA1','eq2lB1','eq2lC1','eq2lA2','eq2lB2','eq2lC2'],  get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'bisector',  ids:['eqA1','eqB1','eqC1','eqA2','eqB2','eqC2'],              get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'shift',     ids:['transH','transK','transTestX','transTestY'],            get:v => ({ h:v[0], k:v[1], th:0, px:v[2], py:v[3] }) },
  { scene:'shift',     ids:['rotTheta','rotTestX','rotTestY'],                       get:v => ({ h:0, k:0, th:v[0], px:v[1], py:v[2] }) },
  { scene:'shift',     ids:['genH','genK','genTheta','genTestX','genTestY'],         get:v => ({ h:v[0], k:v[1], th:v[2], px:v[3], py:v[4] }) },
  { scene:'circle',    ids:['circleD','circleE','circleF','lineA','lineB','lineC'],  get:v => circ(v) },
  { scene:'circle',    ids:['tangCircleD','tangCircleE','tangCircleF','tangLineA','tangLineB','tangLineC'], get:v => circ(v) },
  { scene:'circle',    ids:['intCircleD','intCircleE','intCircleF','intLineA','intLineB','intLineC'],       get:v => circ(v) },
  { scene:'circle',    ids:['tangentR','tangentM','tangentC'],                       get:v => ({ cx:0, cy:0, r:v[0], a:v[1], b:-1, c:v[2] }) },
  { scene:'threed',    ids:['coord3Dx','coord3Dy','coord3Dz'],                       get:v => ({ ax:0, ay:0, az:0, bx:v[0], by:v[1], bz:v[2] }) },
  { scene:'threed',    ids:['drAx','drAy','drAz','drBx','drBy','drBz'],              get:v => ({ ax:v[0], ay:v[1], az:v[2], bx:v[3], by:v[4], bz:v[5] }) }
];
function tri(v) { return { x1:v[0], y1:v[1], x2:v[2], y2:v[3], x3:v[4], y3:v[5] }; }
function circ(v) { const r2 = v[0] * v[0] / 4 + v[1] * v[1] / 4 - v[2]; return { cx:-v[0] / 2, cy:-v[1] / 2, r:Math.sqrt(r2), a:v[3], b:v[4], c:v[5] }; }
// ---------- More scenes: reflection, normal form, line against a conic, angle between 3D lines ----------
const imgOf = P => { const F = foot(P); return [2 * F[0] - P.px, 2 * F[1] - P.py]; };
scenes.push({ id:'reflect', tab:3, title:'Foot and image of a point', tag:'Class 11–12', params:[['px','x₁',3],['py','y₁',4],['a','a',1],['b','b',1],['c','c',-2]],
  f:['The image is the same distance behind the mirror line.','F = foot of the perpendicular;  P′ = 2F − P = (x₁ − 2a·v/(a²+b²), y₁ − 2b·v/(a²+b²)),  v = ax₁ + by₁ + c'],
  fit:P => { const F = foot(P), I = imgOf(P); return [[P.px, P.py], F, I]; },
  valid:P => fin(P.px, P.py, P.a, P.b, P.c) && Math.hypot(P.a, P.b) > EPS,
  draw(g, t, C, lv, P) {
    const { px, py, a, b, c } = P, F = foot(P), I = imgOf(P), s1 = ease(seg(t, .12, .45)), s2 = ease(seg(t, .45, .8));
    g.LL(a, b, c, C.ink, 3.5);
    if (s1 > 0) g.L(px, py, lerp(px, F[0], s1), lerp(py, F[1], s1), C.c, 3, [8, 6]);
    if (s1 >= 1) { g.right(F[0], F[1], [px - F[0], py - F[1]], [-b, a]); g.D(F[0], F[1], C.g, 6); g.T('F', F[0], F[1], C.g, { dx: 14, dy: 14, size: 14 }); }
    if (s2 > 0) g.L(F[0], F[1], lerp(F[0], I[0], s2), lerp(F[1], I[1], s2), C.c, 3, [8, 6]);
    if (s2 >= 1) { g.D(I[0], I[1], C.b, 8); g.T('P′(' + fmt(I[0]) + ', ' + fmt(I[1]) + ')', I[0], I[1], C.b, { dy: -20, size: 14 }); }
    g.D(px, py, C.a, 8); g.T('P(' + fmt(px) + ', ' + fmt(py) + ')', px, py, C.a, { dy: -20, size: 14 });
    const k = t < .12 ? 0 : t < .45 ? 1 : t < .8 ? 2 : 3, v = a * px + b * py + c;
    return pick(lv, ['A mirror line and a point P.', 'Drop a straight path from P to the mirror. It meets the mirror at F.', 'Keep going the same distance to the other side.', 'The image P′ is the reflection of P: (' + fmt(I[0]) + ', ' + fmt(I[1]) + ').'],
      ['P(' + fmt(px) + ', ' + fmt(py) + '), mirror ' + eqStr(a, b, c) + '.', 'F = foot of the perpendicular = (' + fmt(F[0]) + ', ' + fmt(F[1]) + ').', 'F is the midpoint of PP′, so P′ = 2F − P.', 'P′ = (' + fmt(I[0]) + ', ' + fmt(I[1]) + ')  (v = ax₁ + by₁ + c = ' + fmt(v) + ').'])[k];
  },
  out:(P, lv) => { const F = foot(P), I = imgOf(P); return 'Foot F = (' + fmt(F[0]) + ', ' + fmt(F[1]) + ');  image P′ = (' + fmt(I[0]) + ', ' + fmt(I[1]) + ')'; } });

scenes.push({ id:'normal', tab:2, title:'Normal form of a line', tag:'Class 11–12', params:[['th','θ (degrees)',45],['p','p (distance)',5]],
  f:['Walk a straight path from the origin, then draw the line across it at a right angle.','x cos θ + y sin θ = p   (p = distance of the line from the origin, θ = angle of the perpendicular)'],
  fit:P => { const r = P.th * Math.PI / 180; return [[0, 0], [P.p * Math.cos(r), P.p * Math.sin(r)], [-2, -2], [2, 2]]; },
  valid:P => fin(P.th, P.p) && P.p > 0,
  draw(g, t, C, lv, P) {
    const { th, p } = P, r = th * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), N = [p * cs, p * sn], e1 = ease(seg(t, .1, .4)), e2 = ease(seg(t, .4, .75)), ctx = g.ctx;
    ctx.save(); ctx.strokeStyle = C.a; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(g.X(0), g.Y(0), 34, 0, -r * e1, r * e1 > 0); ctx.stroke(); ctx.restore();
    if (e1 > 0) { g.L(0, 0, N[0] * e1, N[1] * e1, C.c, 4); g.T(fmt(th, 2) + '°', 0, 0, C.a, { dx: 56 * Math.cos(r * e1 / 2), dy: -56 * Math.sin(r * e1 / 2), size: 13 }); }
    if (e1 >= 1) g.T('p = ' + fmt(p), N[0] / 2, N[1] / 2, C.c, { dx: -22 * sn, dy: -22 * cs, size: 14 });
    if (e2 > 0) g.LL(cs, sn, -p, C.a, 3.5, null, e2);
    if (e2 >= 1) g.right(N[0], N[1], [-cs, -sn], [-sn, cs]);
    g.D(0, 0, C.ink, 6); g.T('O', 0, 0, C.ink, { dx: -12, dy: 14, size: 13 });
    if (e1 >= 1) { g.D(N[0], N[1], C.a, 8); g.T('N', N[0], N[1], C.a, { dx: 14 * cs + 6, dy: -14 * sn - 6, size: 14 }); }
    const k = t < .1 ? 0 : t < .4 ? 1 : t < .75 ? 2 : 3;
    return pick(lv, ['The origin O.', 'Walk ' + fmt(p) + ' units from O, turned ' + fmt(th, 2) + '° from the x-axis. You stop at N.', 'Draw the line through N at a right angle to the path.', 'That line is x cos ' + fmt(th, 2) + '° + y sin ' + fmt(th, 2) + '° = ' + fmt(p) + '.'],
      ['Origin O, θ = ' + fmt(th, 2) + '°, p = ' + fmt(p) + '.', 'The foot of the perpendicular N = (p cos θ, p sin θ) = (' + fmt(N[0]) + ', ' + fmt(N[1]) + ').', 'The line is perpendicular to ON at N.', 'x cos θ + y sin θ = p  →  ' + eqStr(cs, sn, -p) + '.'])[k];
  },
  out:(P, lv) => { const r = P.th * Math.PI / 180; return 'x cos ' + fmt(P.th, 2) + '° + y sin ' + fmt(P.th, 2) + '° = ' + fmt(P.p) + '  →  ' + eqStr(Math.cos(r), Math.sin(r), -P.p); } });

// Line y = mx + c against a parabola y² = 4ax, an ellipse or a hyperbola
const CONIC_NAME = ['parabola', 'ellipse', 'hyperbola'];
function conicRoots(P, c) {
  const { type, a, b, m } = P; let A, B, Cq;
  if (type === 0) { if (Math.abs(m) < EPS) return { n: 1, pts: [[c * c / (4 * a), c]], D: 0, kind: 'parallel' }; A = m * m; B = 2 * m * c - 4 * a; Cq = c * c; }
  else if (type === 1) { A = b * b + a * a * m * m; B = 2 * a * a * m * c; Cq = a * a * (c * c - b * b); }
  else { A = b * b - a * a * m * m; B = -2 * a * a * m * c; Cq = -a * a * (c * c + b * b); }
  if (Math.abs(A) < 1e-9) { if (Math.abs(B) < 1e-9) return { n: 0, pts: [], D: -1, kind: 'none' }; const x = -Cq / B; return { n: 1, pts: [[x, m * x + c]], D: 0, kind: 'parallel' }; }
  const D = B * B - 4 * A * Cq, tol = 1e-9 * (B * B + Math.abs(4 * A * Cq) + 1);
  if (D > tol) { const s = Math.sqrt(D); return { n: 2, pts: [(-B - s) / (2 * A), (-B + s) / (2 * A)].map(x => [x, m * x + c]), D, kind: 'secant' }; }
  if (D >= -tol) { const x = -B / (2 * A); return { n: 1, pts: [[x, m * x + c]], D: 0, kind: 'tangent' }; }
  return { n: 0, pts: [], D, kind: 'none' };
}
function conicCurves(P, ext) {
  const { type, a, b } = P, out = [], n = 120;
  if (type === 0) { const pts = []; for (let i = 0; i <= n; i++) { const y = -ext + 2 * ext * i / n; pts.push([y * y / (4 * a), y]); } out.push(pts); }
  else if (type === 1) { const pts = []; for (let i = 0; i <= n; i++) { const t = 2 * Math.PI * i / n; pts.push([a * Math.cos(t), b * Math.sin(t)]); } out.push(pts); }
  else { const U = Math.asinh(ext * 1.3 / b); [1, -1].forEach(sg => { const pts = []; for (let i = 0; i <= n; i++) { const u = -U + 2 * U * i / n; pts.push([sg * a * Math.cosh(u), b * Math.sinh(u)]); } out.push(pts); }); }
  return out;
}
const conicExt = P => Math.max(P.a, P.type === 0 ? 4 : P.b, 3) * 1.5 + 1;
scenes.push({ id:'conic', tab:9, title:'A line meets a parabola, ellipse or hyperbola', tag:'Class 11–12', selects:{ type:['Curve', ['parabola  y² = 4ax', 'ellipse  x²/a² + y²/b² = 1', 'hyperbola  x²/a² − y²/b² = 1']] },
  params:[['a','a',5],['b','b',3],['m','m',1],['c','c',4]],
  f:['A line can cut a curve twice, touch it once, or miss it.','Put y = mx + c into the curve and check the discriminant D. D > 0 cut · D = 0 tangent · D < 0 miss.  Parabola: c = a/m · Ellipse: c² = a²m² + b² · Hyperbola: c² = a²m² − b²'],
  fit:P => { const e = conicExt(P); return P.type === 0 ? [[-1, -e], [e * 1.2, e]] : [[-e * .9, -e * .75], [e * .9, e * .75]]; },
  valid:P => fin(P.type, P.a, P.b, P.m, P.c) && Math.abs(P.a) > EPS && (P.type === 0 || Math.abs(P.b) > EPS),
  draw(g, t, C, lv, P) {
    const { type, m, c } = P, ext = conicExt(P), ctx = g.ctx, e = ease(seg(t, .1, .75)), K = (Math.abs(m) + 1) * ext * .9, start = (c >= 0 ? -1 : 1) * Math.max(K, Math.abs(c)), ct = lerp(start, c, e);
    ctx.save(); ctx.strokeStyle = C.c; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    conicCurves(P, ext).forEach(pts => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(g.X(q[0]), g.Y(q[1])) : ctx.moveTo(g.X(q[0]), g.Y(q[1])))); ctx.stroke(); });
    ctx.restore();
    g.LL(-m, 1, -ct, C.a, 3.5);
    const r = conicRoots(P, ct); r.pts.forEach(q => g.D(q[0], q[1], r.n === 1 && r.kind === 'tangent' ? C.b : C.g, 8));
    if (r.n === 2) g.L(r.pts[0][0], r.pts[0][1], r.pts[1][0], r.pts[1][1], C.g, 6);
    const last = t >= .75, fin_ = conicRoots(P, c), nm = CONIC_NAME[type];
    const st = fin_.kind === 'tangent' ? 'tangent' : fin_.kind === 'secant' ? 'secant' : fin_.kind === 'parallel' ? 'parallel' : 'none';
    if (!last) return pick(lv, [r.kind === 'tangent' ? 'The line is just touching the ' + nm + '.' : r.n === 2 ? 'The line cuts the ' + nm + ' at 2 points.' : r.n === 1 ? 'The line meets the ' + nm + ' at 1 point.' : 'The line has not met the ' + nm + ' yet.'], ['Sliding the line y = mx + c across the ' + nm + '. Now it meets it at ' + r.n + ' point' + (r.n === 1 ? '' : 's') + '.']);
    const tc = type === 0 ? (Math.abs(m) > EPS ? 'c = a/m = ' + fmt(P.a / m) : 'm = 0') : 'c² = ' + fmt(type === 1 ? P.a * P.a * m * m + P.b * P.b : P.a * P.a * m * m - P.b * P.b);
    return pick(lv, [st === 'tangent' ? 'The line touches the ' + nm + ' at exactly one point: a tangent.' : st === 'secant' ? 'The line cuts the ' + nm + ' at 2 points.' : st === 'parallel' ? 'The line is parallel to an axis or asymptote, so it meets the ' + nm + ' once.' : 'The line misses the ' + nm + '.'],
      ['D ' + (st === 'secant' ? '> 0: secant (2 points)' : st === 'tangent' ? '= 0: tangent. Condition: ' + tc : st === 'parallel' ? 'degenerate: the x² term vanishes, one intersection' : '< 0: no intersection') + '.']);
  },
  out:(P, lv) => { const r = conicRoots(P, P.c), nm = CONIC_NAME[P.type]; if (r.kind === 'tangent') return 'Tangent to the ' + nm + ' at (' + fmt(r.pts[0][0]) + ', ' + fmt(r.pts[0][1]) + ')'; if (r.n === 2) return 'Cuts the ' + nm + ' at (' + fmt(r.pts[0][0]) + ', ' + fmt(r.pts[0][1]) + ') and (' + fmt(r.pts[1][0]) + ', ' + fmt(r.pts[1][1]) + ')'; if (r.n === 1) return 'Meets the ' + nm + ' at one point (' + fmt(r.pts[0][0]) + ', ' + fmt(r.pts[0][1]) + ') (line parallel to an axis or asymptote)'; return 'Misses the ' + nm + ' (no real intersection)'; } });

// Two lines in space, given by direction ratios (a, b, c)
const dir3 = P => { const n1 = Math.hypot(P.a1, P.b1, P.c1), n2 = Math.hypot(P.a2, P.b2, P.c2), dot = P.a1 * P.a2 + P.b1 * P.b2 + P.c1 * P.c2, cs = dot / (n1 * n2); return { n1, n2, dot, cs, th: Math.acos(Math.max(-1, Math.min(1, Math.abs(cs)))) * 180 / Math.PI }; };
scenes.push({ id:'angle3d', tab:10, title:'Angle between two lines in 3D', tag:'Class 11–12', noGrid:true, params:[['a1','a₁',2],['b1','b₁',3],['c1','c₁',1],['a2','a₂',1],['b2','b₂',-1],['c2','c₂',2]],
  f:['Each line has a direction (along, across, up). The angle is how far apart the two directions point.','cos θ = |a₁a₂ + b₁b₂ + c₁c₂| / (√(a₁²+b₁²+c₁²) · √(a₂²+b₂²+c₂²));  perpendicular: a₁a₂ + b₁b₂ + c₁c₂ = 0'],
  fit:P => [[0, 0]], valid:P => fin(P.a1, P.b1, P.c1, P.a2, P.b2, P.c2) && Math.hypot(P.a1, P.b1, P.c1) > EPS && Math.hypot(P.a2, P.b2, P.c2) > EPS,
  draw(g, t, C, lv, P) {
    const ctx = g.ctx, u = 30, O = [240, 205], cs = .866, pr = (x, y, z) => [O[0] + (y - x) * cs * u, O[1] + (x + y) * .5 * u - z * u];
    const ln = (p0, p1, col, w, dash) => { const p = pr(...p0), q = pr(...p1); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); };
    const tx = (s, p, col, dx, dy, size = 14) => { ctx.save(); ctx.font = '700 ' + size + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(s, p[0] + dx, p[1] + dy); ctx.restore(); };
    const L = 4.6; for (let i = 0; i <= 4; i++) { ln([i, 0, 0], [i, 4, 0], C.grid, 1); ln([0, i, 0], [4, i, 0], C.grid, 1); }
    ln([0, 0, 0], [L, 0, 0], C.ink, 1.6); ln([0, 0, 0], [0, L, 0], C.ink, 1.6); ln([0, 0, 0], [0, 0, L], C.ink, 1.6);
    tx('x', pr(L + .6, 0, 0), C.ink, 0, 5); tx('y', pr(0, L + .6, 0), C.ink, 0, 5); tx('z', pr(0, 0, L + .6), C.ink, 0, 0);
    const d = dir3(P), v1 = [P.a1 / d.n1 * 4, P.b1 / d.n1 * 4, P.c1 / d.n1 * 4], v2 = [P.a2 / d.n2 * 4, P.b2 / d.n2 * 4, P.c2 / d.n2 * 4];
    const s1 = ease(seg(t, .05, .3)), s2 = ease(seg(t, .3, .55)), s3 = ease(seg(t, .55, .85));
    ln([0, 0, 0], v1.map(q => q * s1), C.c, 5); ln([0, 0, 0], v2.map(q => q * s2), C.g, 5);
    if (s1 >= 1) tx('L₁', pr(...v1), C.c, 12, -8); if (s2 >= 1) tx('L₂', pr(...v2), C.g, 12, -8);
    if (s3 > 0) {  // arc between the two directions
      const u1 = v1.map(q => q / 4), u2 = v2.map(q => q / 4), ang = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1] + u1[2] * u2[2])));
      if (ang > 1e-3 && Math.PI - ang > 1e-3) { const w = [u2[0] - Math.cos(ang) * u1[0], u2[1] - Math.cos(ang) * u1[1], u2[2] - Math.cos(ang) * u1[2]], wn = Math.hypot(...w), e = w.map(q => q / wn); ctx.save(); ctx.strokeStyle = C.a; ctx.lineWidth = 3; ctx.beginPath(); const N = 30; for (let i = 0; i <= N * s3; i++) { const a = ang * i / N, q = pr(1.9 * (Math.cos(a) * u1[0] + Math.sin(a) * e[0]), 1.9 * (Math.cos(a) * u1[1] + Math.sin(a) * e[1]), 1.9 * (Math.cos(a) * u1[2] + Math.sin(a) * e[2])); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore(); }
      if (s3 >= 1) tx('θ = ' + fmt(d.th, 1) + '°', pr(...u1.map((q, i) => (q + u2[i]) * 1.45)), C.a, 0, -6, 15);
    }
    ctx.save(); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(O[0], O[1], 5, 0, 7); ctx.fill(); ctx.restore();
    const k = t < .05 ? 0 : t < .3 ? 1 : t < .55 ? 2 : t < .85 ? 3 : 4, perp = Math.abs(d.dot) < 1e-9, par = Math.abs(Math.abs(d.cs) - 1) < 1e-9;
    return pick(lv, ['Two lines through the origin, in space.', 'Line 1 points along (' + fmt(P.a1) + ', ' + fmt(P.b1) + ', ' + fmt(P.c1) + ').', 'Line 2 points along (' + fmt(P.a2) + ', ' + fmt(P.b2) + ', ' + fmt(P.c2) + ').', 'Measure how far apart the two directions point.', perp ? 'A right angle: the lines are perpendicular.' : par ? 'The same direction: the lines are parallel.' : 'The angle between them is about ' + fmt(d.th, 1) + '°.'],
      ['d₁ = (' + fmt(P.a1) + ', ' + fmt(P.b1) + ', ' + fmt(P.c1) + '),  |d₁| = ' + fmt(d.n1) + '.', 'Direction ratios of L₁.', 'd₂ = (' + fmt(P.a2) + ', ' + fmt(P.b2) + ', ' + fmt(P.c2) + '),  |d₂| = ' + fmt(d.n2) + '.', 'd₁·d₂ = ' + fmt(d.dot) + '.', 'cos θ = |' + fmt(d.dot) + '| / (' + fmt(d.n1) + ' · ' + fmt(d.n2) + ') = ' + fmt(Math.abs(d.cs)) + ', so θ = ' + fmt(d.th, 2) + '°' + (perp ? ' (perpendicular)' : par ? ' (parallel)' : '') + '.'])[Math.min(k, 4)];
  },
  out:(P, lv) => { const d = dir3(P); return 'θ = ' + fmt(d.th, 2) + '°' + (Math.abs(d.dot) < 1e-9 ? '  → perpendicular (a₁a₂ + b₁b₂ + c₁c₂ = 0)' : Math.abs(Math.abs(d.cs) - 1) < 1e-9 ? '  → parallel' : '  (cos θ = ' + fmt(Math.abs(d.cs)) + ')'); } });

BINDINGS.push(
  { scene:'reflect', ids:['imgX1', 'imgY1', 'imgA', 'imgB', 'imgC'], get:v => ({ px:v[0], py:v[1], a:v[2], b:v[3], c:v[4] }) },
  { scene:'normal', ids:['normTheta', 'normP'], get:v => ({ th:v[0], p:v[1] }) },
  { scene:'conic', ids:['paraA', 'paraM', 'paraC'], get:v => ({ type:0, a:v[0], b:1, m:v[1], c:v[2] }) },
  { scene:'conic', ids:['tangParaA', 'tangParaM', 'tangParaC'], get:v => ({ type:0, a:v[0], b:1, m:v[1], c:v[2] }) },
  { scene:'conic', ids:['ellipseA', 'ellipseB', 'ellipseM', 'ellipseC'], get:v => ({ type:1, a:v[0], b:v[1], m:v[2], c:v[3] }) },
  { scene:'conic', ids:['tangEllipseA', 'tangEllipseB', 'tangEllipseM', 'tangEllipseC'], get:v => ({ type:1, a:v[0], b:v[1], m:v[2], c:v[3] }) },
  { scene:'conic', ids:['hypA', 'hypB', 'hypM', 'hypC'], get:v => ({ type:2, a:v[0], b:v[1], m:v[2], c:v[3] }) },
  { scene:'angle3d', ids:['angle1A', 'angle1B', 'angle1C', 'angle2A', 'angle2B', 'angle2C'], get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) },
  { scene:'angle3d', ids:['perpPara1A', 'perpPara1B', 'perpPara1C', 'perpPara2A', 'perpPara2B', 'perpPara2C'], get:v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] }) }
);

// Tab 7 triangle cards (all use vertices A, B, C) and tab 6 bisector cards
['tv', 'gc', 'ic', 'cc', 'oc', 'me', 'al', 'pb', 'cl', 'ol', 'ib', 'pd', 'ex', 'eu'].forEach(p => BINDINGS.push({ scene:'stdpoints', ids:[p + 'Ax', p + 'Ay', p + 'Bx', p + 'By', p + 'Cx', p + 'Cy'], get:v => tri(v) }));
const lines6 = v => ({ a1:v[0], b1:v[1], c1:v[2], a2:v[3], b2:v[4], c2:v[5] });
BINDINGS.push(
  { scene:'bisector', ids:['bsA1', 'bsB1', 'bsC1', 'bsA2', 'bsB2', 'bsC2'], get:lines6 },
  { scene:'bisector', ids:['acA1', 'acB1', 'acC1', 'acA2', 'acB2', 'acC2'], get:v => Object.assign(lines6(v), { mode:'acute' }) },
  { scene:'bisector', ids:['obA1', 'obB1', 'obC1', 'obA2', 'obB2', 'obC2'], get:v => Object.assign(lines6(v), { mode:'obtuse' }) },
  { scene:'bisector', ids:['cpA1', 'cpB1', 'cpC1', 'cpA2', 'cpB2', 'cpC2', 'cpX', 'cpY'], get:v => Object.assign(lines6(v), { mode:'point', px:v[6], py:v[7] }) }
);
const SC = {}; scenes.forEach(s => { SC[s.id] = s; });

const TAB_INFO = {
  tabCoordinateGeometry:  { n: 1,  name: 'Coordinate geometry' },
  tabLineEquations:       { n: 2,  name: 'Equations of a straight line' },
  tabAnglesIntersections: { n: 3,  name: 'Angles and intersections' },
  tabDistanceMeasures:    { n: 4,  name: 'Distance measures' },
  tabLocusGeometric:      { n: 5,  name: 'Locus' },
  tabAngleBisectors:      { n: 6,  name: 'Angle bisectors and family of lines' },
  tabStandardPoints:      { n: 7,  name: 'Standard points of a triangle' },
  tabTransformationAxes:  { n: 8,  name: 'Shifting of axes' },
  tabLineConic:           { n: 9,  name: 'Line and conic' },
  tab3DGeometry:          { n: 10, name: '3D geometry' }
};

// ---------- Reading the open card ----------
const cardEl = () => document.getElementById('mainCard');
function readRadio(name) { const el = cardEl() && cardEl().querySelector('input[type="radio"][name="' + name + '"]:checked'); return el ? el.value : ''; }
// Returns { binding, params, title } for the card on screen, { binding, params:null } if its inputs are not numbers yet, or null.
function detectCard() {
  const root = cardEl(); if (!root) return null;
  for (const bnd of BINDINGS) {
    const els = bnd.ids.map(id => root.querySelector('#' + id));
    if (els.some(e => !e)) continue;
    const title = (root.querySelector('h2') || {}).textContent || '';
    const v = els.map(e => parseFloat(e.value));
    if (!v.every(Number.isFinite)) return { binding: bnd, params: null, title: title.trim() };
    let p = null; try { p = bnd.get(v, readRadio); } catch (e) { p = null; }
    const sc = SC[bnd.scene];
    if (p && sc.valid(p) && Object.entries(p).every(([k, x]) => k === 'mode' || Number.isFinite(x))) return { binding: bnd, params: p, title: title.trim() };
    return { binding: bnd, params: null, title: title.trim() };
  }
  return null;
}


// =====================================================================================
//  Studio extras: step marks, draggable handles, challenges, slider ranges, card write-back
// =====================================================================================
const snapV = v => { const s = (window.cgLevel && window.cgLevel() === 'inter') ? .5 : 1; return Math.round(v / s) * s; };
const lvNow = () => (window.cgLevel ? window.cgLevel() : 'school');
const R8 = [-8, 8, 1];
const rangesOf = (keys, r) => Object.fromEntries(keys.map(k => [k, r]));
const lineHandles = P => { const I = intersect(P); if (!I) return []; const mk = (a, b, k) => { const n = Math.hypot(a, b) || 1; return { k, x: I[0] + 3 * b / n, y: I[1] - 3 * a / n, label: 'L' + k }; }; return [mk(P.a1, P.b1, '1'), mk(P.a2, P.b2, '2')]; };
const lineDrag = (P, k, x, y) => { const I = intersect(P); if (!I) return null; const vx = x - I[0], vy = y - I[1]; if (Math.hypot(vx, vy) < 1e-9) return null; const a = vy, b = -vx, c = -(a * I[0] + b * I[1]); return Object.assign({}, P, k === '1' ? { a1: a, b1: b, c1: c } : { a2: a, b2: b, c2: c }); };
const triHandles = P => [{ k: '1', x: P.x1, y: P.y1, label: 'A' }, { k: '2', x: P.x2, y: P.y2, label: 'B' }, { k: '3', x: P.x3, y: P.y3, label: 'C' }];
const triDrag = (P, k, x, y) => Object.assign({}, P, { ['x' + k]: x, ['y' + k]: y });
const twoHandles = (a, b, la, lb) => P => [{ k: '1', x: P[a[0]], y: P[a[1]], label: la }, { k: '2', x: P[b[0]], y: P[b[1]], label: lb }];
const twoDrag = (a, b) => (P, k, x, y) => Object.assign({}, P, k === '1' ? { [a[0]]: x, [a[1]]: y } : { [b[0]]: x, [b[1]]: y });
const T2 = (s, i) => [s, i || s];

const EXTRAS = {
  plot: { chip: 'Plot a point', marks: [0, .05, .4, .75], ranges: rangesOf(['px', 'py'], R8),
    handles: P => [{ k: 'P', x: P.px, y: P.py, label: 'P' }], drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
    challenges: [
      { id: 'plot-q3', text: T2('Move P into Quadrant III: both numbers must be negative.'), hint: T2('Quadrant III is the bottom-left part of the graph.', 'In Quadrant III, the abscissa and the ordinate are both negative.'), check: P => P.px < 0 && P.py < 0 },
      { id: 'plot-yaxis', text: T2('Put P on the y-axis. Its x number must be 0.'), hint: T2('Points on the y-axis have 0 steps across.', 'Every point on the y-axis has abscissa x = 0.'), check: P => Math.abs(P.px) < EPS && Math.abs(P.py) > EPS }
    ] },
  distance: { chip: 'Distance', marks: [0, .2, .4, .6, .8], ranges: rangesOf(['x1', 'y1', 'x2', 'y2'], R8),
    handles: twoHandles(['x1', 'y1'], ['x2', 'y2'], 'A', 'B'), drag: twoDrag(['x1', 'y1'], ['x2', 'y2']),
    challenges: [
      { id: 'dist-10', text: T2('Make AB exactly 10 units long.'), hint: T2('Try going 6 across and 8 up. Doubling a 3-4-5 triangle gives 6-8-10.', 'Look for Δx and Δy with Δx² + Δy² = 100, such as 6 and 8.'), check: P => Math.abs(Math.hypot(P.x2 - P.x1, P.y2 - P.y1) - 10) < 1e-6 },
      { id: 'dist-flat', text: T2('Make AB perfectly flat (horizontal) without making it a single point.'), hint: T2('A flat line has the same height at both ends.', 'Horizontal means y₁ = y₂ and x₁ ≠ x₂.'), check: P => Math.abs(P.y1 - P.y2) < EPS && Math.abs(P.x1 - P.x2) > EPS }
    ] },
  section: { chip: 'Midpoint & ratio', marks: [0, .15, .75], ranges: Object.assign(rangesOf(['ax', 'ay', 'bx', 'by'], R8), { m: [0.5, 10, 0.5], n: [0.5, 10, 0.5] }),
    handles: twoHandles(['ax', 'ay'], ['bx', 'by'], 'A', 'B'), drag: twoDrag(['ax', 'ay'], ['bx', 'by']),
    challenges: [
      { id: 'sec-mid', text: T2('Make P the exact midpoint of A and B (internal division).'), hint: T2('The midpoint cuts the line into 2 equal parts. Make m and n the same number.', 'Midpoint: m : n = 1 : 1 with internal division.'), check: P => !P.ext && Math.abs(P.m - P.n) < EPS },
      { id: 'sec-yaxis', text: T2('Make P land exactly on the y-axis.'), hint: T2('P must have x = 0. Try moving A and B, or change the ratio.', 'Choose A, B, m, n so that (m·x₂ + n·x₁)/(m + n) = 0.'), check: P => { const p = sectionPoint(P); return !!p && Math.abs(p[0]) < 1e-9; } }
    ] },
  area: { chip: 'Area & collinear', marks: [0, .15, .6], ranges: rangesOf(['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], R8), handles: triHandles, drag: triDrag,
    challenges: [
      { id: 'area-col', text: T2('Put A, B and C on one straight line (the area becomes 0).'), hint: T2('Move C until it sits on the line through A and B.', 'Collinear points give a determinant (area) of 0.'), check: P => Math.abs(P.x1 * (P.y2 - P.y3) + P.x2 * (P.y3 - P.y1) + P.x3 * (P.y1 - P.y2)) < 1e-9 },
      { id: 'area-10', text: T2('Make the area exactly 10 square units.'), hint: T2('Try a base of 5 and a height of 4: ½ × 5 × 4 = 10.', 'Make |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)| equal to 20.'), check: P => Math.abs(Math.abs(P.x1 * (P.y2 - P.y3) + P.x2 * (P.y3 - P.y1) + P.x3 * (P.y1 - P.y2)) / 2 - 10) < 1e-6 }
    ] },
  slope: { chip: 'Slope & line', marks: [0, .08, .3, .55, .8], ranges: rangesOf(['x1', 'y1', 'x2', 'y2'], R8),
    handles: twoHandles(['x1', 'y1'], ['x2', 'y2'], 'P₁', 'P₂'), drag: twoDrag(['x1', 'y1'], ['x2', 'y2']),
    challenges: [
      { id: 'slope-3', text: T2('Make the slope exactly 3.'), hint: T2('Slope is up ÷ across. Go 3 up for every 1 across.', 'm = Δy / Δx = 3.'), check: P => Math.abs(P.x2 - P.x1) > EPS && Math.abs((P.y2 - P.y1) / (P.x2 - P.x1) - 3) < 1e-9 },
      { id: 'slope-0', text: T2('Make a perfectly flat line (slope 0).'), hint: T2('A flat line does not go up or down.', 'Slope 0 means Δy = 0 with Δx ≠ 0.'), check: P => Math.abs(P.x2 - P.x1) > EPS && Math.abs(P.y2 - P.y1) < EPS },
      { id: 'slope-neg', text: T2('Make a falling line (negative slope).'), hint: T2('A falling line goes downhill from left to right.', 'Choose points so that Δy and Δx have opposite signs.'), check: P => Math.abs(P.x2 - P.x1) > EPS && (P.y2 - P.y1) / (P.x2 - P.x1) < 0 }
    ] },
  intercept: { chip: 'Intercepts', marks: [0, .08, .3, .65], ranges: rangesOf(['a', 'b'], [-8, 8, 1]),
    handles: P => [{ k: 'a', x: P.a, y: 0, label: 'a' }, { k: 'b', x: 0, y: P.b, label: 'b' }],
    drag: (P, k, x, y) => { const v = k === 'a' ? x : y; return Math.abs(v) < EPS ? null : Object.assign({}, P, { [k]: v }); },
    challenges: [
      { id: 'int-12', text: T2('Make the triangle with the axes have area 12.'), hint: T2('Area = ½ × a × b. Try a = 4 and b = 6.', 'Area = ½|ab| = 12, so |ab| = 24.'), check: P => Math.abs(Math.abs(P.a * P.b) / 2 - 12) < 1e-6 },
      { id: 'int-eq', text: T2('Make both intercepts equal (a = b).'), hint: T2('The line then makes the same distance on both axes.', 'When a = b, the line is x + y = a.'), check: P => Math.abs(P.a - P.b) < EPS }
    ] },
  twolines: { chip: 'Angle between lines', marks: [0, .2, .7], ranges: rangesOf(['a1', 'b1', 'c1', 'a2', 'b2', 'c2'], [-9, 9, 1]), sandboxOnly: true, handles: lineHandles, drag: lineDrag,
    challenges: [
      { id: 'lines-perp', text: T2('Make the two lines perpendicular (a right angle).'), hint: T2('Turn the green line until the corner looks like the corner of a square.', 'Perpendicular lines satisfy a₁a₂ + b₁b₂ = 0.'), check: P => Math.abs(P.a1 * P.a2 + P.b1 * P.b2) < 1e-9 && Math.abs(P.a1 * P.b2 - P.a2 * P.b1) > 1e-9 },
      { id: 'lines-par', text: T2('Make the two lines parallel (they never meet).'), hint: T2('Parallel lines point the same way. Make their directions match.', 'Parallel lines satisfy a₁b₂ − a₂b₁ = 0.'), check: P => Math.abs(P.a1 * P.b2 - P.a2 * P.b1) < 1e-9 }
    ] },
  ptline: { chip: 'Point to line', marks: [0, .3, .7], ranges: { px: R8, py: R8, a: [-6, 6, 1], b: [-6, 6, 1], c: [-20, 20, 1] },
    handles: P => (Number.isFinite(P.c0) ? [] : [{ k: 'P', x: P.px, y: P.py, label: 'P' }]), drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
    challenges: [
      { id: 'pl-5', text: T2('Place P exactly 5 units away from the line.'), hint: T2('For the line 3x + 4y − 12 = 0, try the point (3, 7).', 'd = |ax₁ + by₁ + c| / √(a² + b²) must equal 5.'), check: P => Math.abs(Math.abs(P.a * P.px + P.b * P.py + P.c) / Math.hypot(P.a, P.b) - 5) < 1e-6 },
      { id: 'pl-0', text: T2('Put P on the line (distance 0).'), hint: T2('The point must sit exactly on the dark line.', 'ax₁ + by₁ + c = 0.'), check: P => Math.abs(P.a * P.px + P.b * P.py + P.c) < 1e-9 }
    ] },
  locus: { chip: 'Locus', loop: true, ranges: rangesOf(['ax', 'ay', 'bx', 'by'], R8), handles: twoHandles(['ax', 'ay'], ['bx', 'by'], 'A', 'B'), drag: twoDrag(['ax', 'ay'], ['bx', 'by']),
    challenges: [
      { id: 'loc-x', text: T2('Make the locus the x-axis (the line y = 0).'), hint: T2('Put A and B straight above each other, with the x-axis exactly halfway between them.', 'A and B must be mirror images in the x-axis: A = (p, −q), B = (p, q).'), check: P => { const lc = locusLine(P); return Math.abs(lc[0]) < EPS && Math.abs(lc[2]) < EPS && Math.abs(lc[1]) > EPS; } },
      { id: 'loc-flat', text: T2('Make the locus a flat (horizontal) line.'), hint: T2('Put A directly above B.', 'A and B must have the same x so the bisector is horizontal.'), check: P => Math.abs(P.ax - P.bx) < EPS && Math.abs(P.ay - P.by) > EPS }
    ] },
  bisector: { chip: 'Angle bisector', loop: true, ranges: rangesOf(['a1', 'b1', 'c1', 'a2', 'b2', 'c2'], [-9, 9, 1]), sandboxOnly: true, handles: lineHandles, drag: lineDrag,
    challenges: [
      { id: 'bis-perp', text: T2('Make the two lines perpendicular and see the bisectors at 45°.'), hint: T2('Turn one line until the corner is a right angle.', 'Use a₁a₂ + b₁b₂ = 0.'), check: P => Math.abs(P.a1 * P.a2 + P.b1 * P.b2) < 1e-9 && Math.abs(P.a1 * P.b2 - P.a2 * P.b1) > 1e-9 },
      { id: 'bis-par', text: T2('Make the lines parallel and watch the single bisector appear in the middle.'), hint: T2('Make both lines point the same way.', 'a₁b₂ = a₂b₁.'), check: P => Math.abs(P.a1 * P.b2 - P.a2 * P.b1) < 1e-9 }
    ] },
  stdpoints: { chip: 'Triangle centres', marks: [0, .04, .27, .5, .73], ranges: rangesOf(['x1', 'y1', 'x2', 'y2', 'x3', 'y3'], R8), handles: triHandles, drag: triDrag,
    challenges: [
      { id: 'tri-right', text: T2('Make a right-angled triangle. Where does the circumcentre go?'), hint: T2('Make one corner a right angle, like the corner of a book. The circumcentre S lands on the middle of the longest side.', 'In a right triangle the circumcentre is the midpoint of the hypotenuse.'), check: P => { const d = (A, B, Cc) => (B[0] - A[0]) * (Cc[0] - A[0]) + (B[1] - A[1]) * (Cc[1] - A[1]); const A = [P.x1, P.y1], B = [P.x2, P.y2], Cc = [P.x3, P.y3]; const area = Math.abs(P.x1 * (P.y2 - P.y3) + P.x2 * (P.y3 - P.y1) + P.x3 * (P.y1 - P.y2)); return area > 1e-9 && (Math.abs(d(A, B, Cc)) < 1e-9 || Math.abs(d(B, A, Cc)) < 1e-9 || Math.abs(d(Cc, A, B)) < 1e-9); } },
      { id: 'tri-iso', text: T2('Make an isosceles triangle (two sides the same length).'), hint: T2('Two sides must match. Try putting C straight above the middle of AB.', 'Make two of the distances AB, BC, CA equal.'), check: P => { const A = [P.x1, P.y1], B = [P.x2, P.y2], Cc = [P.x3, P.y3], dd = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]); const a = dd(B, Cc), b = dd(Cc, A), c = dd(A, B), area = Math.abs(P.x1 * (P.y2 - P.y3) + P.x2 * (P.y3 - P.y1) + P.x3 * (P.y1 - P.y2)); return area > 1e-9 && (Math.abs(a - b) < 1e-9 || Math.abs(b - c) < 1e-9 || Math.abs(a - c) < 1e-9); } }
    ] },
  shift: { chip: 'Shift axes', marks: [0, .12, .5, .85], ranges: { h: [-6, 6, 1], k: [-6, 6, 1], th: [-180, 180, 5], px: R8, py: R8 },
    handles: P => [{ k: 'O', x: P.h, y: P.k, label: 'O′' }, { k: 'P', x: P.px, y: P.py, label: 'P' }],
    drag: (P, k, x, y) => (k === 'O' ? Object.assign({}, P, { h: x, k: y }) : Object.assign({}, P, { px: x, py: y })),
    challenges: [
      { id: 'sh-origin', text: T2('Move the new origin right onto P. Then P becomes (0, 0).'), hint: T2('Drag the orange O′ dot on top of the dark P dot.', 'Set (h, k) = (x, y) so that x′ = y′ = 0.'), check: P => Math.abs(P.th) < EPS && Math.abs(P.h - P.px) < EPS && Math.abs(P.k - P.py) < EPS },
      { id: 'sh-x0', text: T2('Make P sit exactly on the new y-axis (its new x is 0).'), hint: T2('The new y-axis passes through the new origin. Line it up with P.', 'x′ = (x − h)cos θ + (y − k)sin θ = 0.'), check: P => { const c = Math.cos(P.th * Math.PI / 180), s = Math.sin(P.th * Math.PI / 180); return Math.abs((P.px - P.h) * c + (P.py - P.k) * s) < 1e-9; } }
    ] },
  circle: { chip: 'Line & circle', marks: [0, .1, .75], ranges: { cx: [-6, 6, 1], cy: [-6, 6, 1], r: [0.5, 8, 0.5], a: [-5, 5, 1], b: [-5, 5, 1], c: [-12, 12, 0.5] },
    handles: P => [{ k: 'C', x: P.cx, y: P.cy, label: 'centre' }, { k: 'R', x: P.cx + P.r, y: P.cy, label: 'r' }],
    drag: (P, k, x, y) => (k === 'C' ? Object.assign({}, P, { cx: x, cy: y }) : (Math.hypot(x - P.cx, y - P.cy) < 0.5 ? null : Object.assign({}, P, { r: Math.round(Math.hypot(x - P.cx, y - P.cy) * 2) / 2 }))),
    challenges: [
      { id: 'ci-tan', text: T2('Make the line just touch the circle at one point (a tangent).'), hint: T2('Change the circle size or the line until they only kiss.', 'The distance from the centre to the line must equal r.'), check: P => Math.abs(Math.abs(circleD(P)) - P.r) < 1e-6 },
      { id: 'ci-miss', text: T2('Make the line miss the circle completely.'), hint: T2('Move the circle away from the line, or make the radius smaller.', 'Make the centre-to-line distance larger than r.'), check: P => Math.abs(circleD(P)) > P.r + 1e-6 }
    ] },
  reflect: { chip: 'Reflection', marks: [0, .12, .45, .8], ranges: { px: R8, py: R8, a: [-6, 6, 1], b: [-6, 6, 1], c: [-20, 20, 1] },
    handles: P => [{ k: 'P', x: P.px, y: P.py, label: 'P' }], drag: (P, k, x, y) => Object.assign({}, P, { px: x, py: y }),
    challenges: [
      { id: 'ref-origin', text: T2('Place P so that its image P′ lands exactly on (0, 0).'), hint: T2('The image of P is the mirror copy. Work backwards: where is the mirror copy of (0, 0)?', 'P must be the reflection of the origin in the line.'), check: P => Math.hypot(...imgOf(P)) < 1e-9 },
      { id: 'ref-self', text: T2('Put P right on the mirror line and see where its image goes.'), hint: T2('A point on the mirror is its own image.', 'If ax₁ + by₁ + c = 0 then P′ = P.'), check: P => Math.abs(P.a * P.px + P.b * P.py + P.c) < 1e-9 }
    ] },
  normal: { chip: 'Normal form', marks: [0, .1, .4, .75], ranges: { th: [0, 360, 5], p: [0.5, 10, 0.5] },
    handles: P => { const r = P.th * Math.PI / 180; return [{ k: 'N', x: P.p * Math.cos(r), y: P.p * Math.sin(r), label: 'N' }]; },
    drag: (P, k, x, y) => { const p = Math.hypot(x, y); if (p < 0.5) return null; let th = Math.atan2(y, x) * 180 / Math.PI; if (th < 0) th += 360; return Object.assign({}, P, { th, p }); },
    challenges: [
      { id: 'nf-3', text: T2('Make the line exactly 3 units from the origin.'), hint: T2('Move the orange dot N until its distance from O is 3, for example (0, 3).', 'p = 3.'), check: P => Math.abs(P.p - 3) < 1e-9 },
      { id: 'nf-flat', text: T2('Make the line perfectly flat (horizontal).'), hint: T2('A flat line is reached by a path that points straight up. Put N on the y-axis.', 'θ = 90° (or 270°), so cos θ = 0.'), check: P => Math.abs(Math.cos(P.th * Math.PI / 180)) < 1e-9 }
    ] },
  conic: { chip: 'Line & curve', marks: [0, .1, .75], ranges: { a: [1, 8, 1], b: [1, 8, 1], m: [-4, 4, 0.5], c: [-10, 10, 0.5] },
    challenges: [
      { id: 'co-tan', text: T2('Make the line touch the curve at exactly one point (a tangent).', 'Make the line a tangent to the curve (D = 0).'), hint: T2('Try the ellipse with m = 0 and c = 3. A flat line at the top of the oval just touches it.', 'For the ellipse, c² = a²m² + b². With m = 0 and b = 3, c = ±3.'), check: P => conicRoots(P, P.c).kind === 'tangent' },
      { id: 'co-miss', text: T2('Make the line miss the curve completely.'), hint: T2('Slide the line (change c) far away from the curve.', 'Make D < 0, for instance by taking |c| very large.'), check: P => conicRoots(P, P.c).n === 0 }
    ] },
  angle3d: { chip: '3D angle', marks: [0, .05, .3, .55, .85], ranges: rangesOf(['a1', 'b1', 'c1', 'a2', 'b2', 'c2'], [-6, 6, 1]),
    challenges: [
      { id: 'a3-perp', text: T2('Make the two lines perpendicular (a right angle in space).', 'Make a₁a₂ + b₁b₂ + c₁c₂ = 0.'), hint: T2('Try L₁ = (1, 0, 0) and L₂ = (0, 1, 0): one points along, one across.', 'Choose directions with zero dot product, such as (1, 0, 0) and (0, 1, 0).'), check: P => Math.abs(dir3(P).dot) < 1e-9 },
      { id: 'a3-par', text: T2('Make the two lines parallel (they point the same way).'), hint: T2('Make the second direction a multiple of the first, such as (2, 3, 1) and (4, 6, 2).', 'Parallel: direction ratios proportional.'), check: P => Math.abs(Math.abs(dir3(P).cs) - 1) < 1e-9 }
    ] },
  threed: { chip: '3D point', noGrid: true, marks: [0, .05, .3, .55, .8], ranges: rangesOf(['ax', 'ay', 'az', 'bx', 'by', 'bz'], [-6, 6, 1]),
    challenges: [
      { id: '3d-3', text: T2('Make AB exactly 3 units long.', 'Make AB = 3.'), hint: T2('Try moving 1, 2 and 2 steps. 1² + 2² + 2² = 9, and √9 = 3.', 'Find Δx, Δy, Δz with Δx² + Δy² + Δz² = 9, such as (1, 2, 2).'), check: P => Math.abs(Math.sqrt((P.bx - P.ax) ** 2 + (P.by - P.ay) ** 2 + (P.bz - P.az) ** 2) - 3) < 1e-6 },
      { id: '3d-floor', text: T2('Make B lie flat on the floor (the xy-plane).'), hint: T2('The floor is where the height is 0.', 'z = 0 for B.'), check: P => Math.abs(P.bz) < EPS && (Math.abs(P.bx) + Math.abs(P.by) > EPS) }
    ] }
};
const HOOKS = {
  plot: 'Treasure map: "3 steps east, 2 steps north" is exactly how we plot a point.',
  distance: 'How far is the park from school? The straight shortcut between two places is their distance.',
  section: 'Where do we meet if you walk 2 parts and I walk 1 part of the way? That is the section formula.',
  area: 'A plot of land is a triangle. Its area tells how much grass fits inside.',
  slope: 'Slope is steepness: how much a ramp rises for each step forward.',
  intercept: 'Where does the line cross the floor and the wall? Those two marks fix the whole line.',
  normal: 'Walk straight from the corner of a room to a wall. The wall is the line, and your path is p.',
  twolines: 'Two roads cross. The angle tells how sharp the turn is.',
  reflect: 'A mirror shows your image the same distance behind the glass.',
  ptline: 'The shortest walk from your house to a straight road goes straight across, at a right angle.',
  locus: 'A locus is a path: every spot that is the same distance from two friends.',
  bisector: 'A bisector is a fair divider: every point on it is the same distance from both roads.',
  stdpoints: 'Balance a cardboard triangle on a pin: it balances at the centroid.',
  shift: 'Moving the map\u2019s starting point changes a place\u2019s address, but not the place.',
  circle: 'A laser beam and a round mirror: does the beam cut it, graze it, or miss it?',
  conic: 'A torch beam across a satellite dish or an oval running track: how many times does it cross?',
  threed: 'Where is a drone? Along, across and up: three numbers tell you.',
  angle3d: 'Two aeroplane routes in the sky: how wide is the angle between them?'
};
scenes.forEach(s => Object.assign(s, { marks: [0], ranges: {}, challenges: [], hook: HOOKS[s.id] || '' }, EXTRAS[s.id] || {}));
const TOTAL_CHALLENGES = scenes.reduce((n, s) => n + s.challenges.length, 0);

// Write the dragged numbers back into the card's own inputs (only where the mapping is direct).
const setterFor = (first, fn) => { const b = BINDINGS.find(x => x.ids[0] === first); if (b) b.set = fn; };
const triSet = p => P => ({ [p + 'Ax']: P.x1, [p + 'Ay']: P.y1, [p + 'Bx']: P.x2, [p + 'By']: P.y2, [p + 'Cx']: P.x3, [p + 'Cy']: P.y3 });
setterFor('x1', P => ({ x1: P.x1, y1: P.y1, x2: P.x2, y2: P.y2 }));
setterFor('mx1', P => ({ mx1: P.ax, my1: P.ay, mx2: P.bx, my2: P.by }));
setterFor('sx1', P => ({ sx1: P.ax, sy1: P.ay, sx2: P.bx, sy2: P.by }));
setterFor('cx1', P => ({ cx1: P.x1, cy1: P.y1, cx2: P.x2, cy2: P.y2, cx3: P.x3, cy3: P.y3 }));
setterFor('ax1', P => ({ ax1: P.x1, ay1: P.y1, ax2: P.x2, ay2: P.y2, ax3: P.x3, ay3: P.y3 }));
setterFor('colx1', P => ({ colx1: P.x1, coly1: P.y1, colx2: P.x2, coly2: P.y2, colx3: P.x3, coly3: P.y3 }));
setterFor('areaAppAx', P => ({ areaAppAx: P.x1, areaAppAy: P.y1, areaAppBx: P.x2, areaAppBy: P.y2, areaAppCx: P.x3, areaAppCy: P.y3 }));
setterFor('plX', P => ({ plX: P.px, plY: P.py }));
setterFor('footX1', P => ({ footX1: P.px, footY1: P.py }));
setterFor('slopeX1', P => ({ slopeX1: P.x1, slopeY1: P.y1, slopeX2: P.x2, slopeY2: P.y2 }));
setterFor('tpX1', P => ({ tpX1: P.x1, tpY1: P.y1, tpX2: P.x2, tpY2: P.y2 }));
setterFor('siM', P => { const dx = P.x2 - P.x1; if (Math.abs(dx) < EPS) return null; const m = (P.y2 - P.y1) / dx; return { siM: m, siC: P.y1 - m * P.x1 }; });
setterFor('psX1', P => { const dx = P.x2 - P.x1; if (Math.abs(dx) < EPS) return null; return { psX1: P.x1, psY1: P.y1, psM: (P.y2 - P.y1) / dx }; });
setterFor('intA', P => ({ intA: P.a, intB: P.b }));
setterFor('interceptAppA', P => ({ interceptAppA: P.a, interceptAppB: P.b }));
setterFor('eq2pAx', P => ({ eq2pAx: P.ax, eq2pAy: P.ay, eq2pBx: P.bx, eq2pBy: P.by }));
setterFor('transH', P => ({ transH: P.h, transK: P.k, transTestX: P.px, transTestY: P.py }));
setterFor('rotTheta', P => ({ rotTestX: P.px, rotTestY: P.py }));
BINDINGS.find(x => x.ids[0] === 'rotTheta').noHandles = ['O'];   // the rotation card keeps the origin fixed
setterFor('genH', P => ({ genH: P.h, genK: P.k, genTestX: P.px, genTestY: P.py }));
setterFor('circleD', P => ({ circleD: -2 * P.cx, circleE: -2 * P.cy, circleF: P.cx * P.cx + P.cy * P.cy - P.r * P.r }));
setterFor('tangCircleD', P => ({ tangCircleD: -2 * P.cx, tangCircleE: -2 * P.cy, tangCircleF: P.cx * P.cx + P.cy * P.cy - P.r * P.r }));
setterFor('intCircleD', P => ({ intCircleD: -2 * P.cx, intCircleE: -2 * P.cy, intCircleF: P.cx * P.cx + P.cy * P.cy - P.r * P.r }));
setterFor('imgX1', P => ({ imgX1: P.px, imgY1: P.py }));
setterFor('normTheta', P => ({ normTheta: P.th, normP: P.p }));
BINDINGS.filter(b => /^(tv|gc|ic|cc|oc|me|al|pb|cl|ol|ib|pd|ex|eu)Ax$/.test(b.ids[0])).forEach(b => { b.set = triSet(b.ids[0].slice(0, -2)); });
// the generic 3D / line-form cards are read-only for dragging (no 2D handles)

// =====================================================================================
//  Studio panel
// =====================================================================================
const css = `
#cgStudio{font-family:'Figtree','Segoe UI',Roboto,system-ui,sans-serif;color:#14213d}
.cs-head{position:sticky;top:0;z-index:3;background:#f6f8fd;padding:14px 16px 10px;border-bottom:1px solid #d9e1ef;display:flex;flex-direction:column;gap:8px}
.cs-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cs-top h2{margin:0;font-size:1.05rem;letter-spacing:-.01em}
.cs-stars{font-size:.82rem;font-weight:700;color:#8a5a00;background:#fff3d1;border-radius:999px;padding:4px 10px;white-space:nowrap}
.cs-x{border:0;background:#e9eefb;color:#14213d;width:32px;height:32px;border-radius:50%;font-size:1rem;cursor:pointer;flex:none;min-height:0}
.cs-chips{display:flex;gap:6px;flex-wrap:wrap}
.cs-chip{border:1.5px solid #d9e1ef;background:#fff;color:#56627f;border-radius:999px;padding:6px 12px;font:700 .82rem 'Figtree','Segoe UI',sans-serif;cursor:pointer;min-height:0}
.cs-chip[aria-pressed="true"]{background:#14213d;border-color:#14213d;color:#fff}
.cs-chip.mine::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:#2b9a45;margin-right:6px}
.cs-body{padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px}
.cs-box{background:#fff;border:1px solid #d9e1ef;border-radius:14px;padding:12px 14px}
.cs-stage{position:relative;border:1px solid #d9e1ef;border-radius:14px;overflow:hidden;background:#fbfcff;touch-action:none}
.cs-stage canvas{display:block;width:100%;height:auto;aspect-ratio:480/340}
.cs-tip{position:absolute;left:10px;bottom:8px;background:rgba(20,33,61,.82);color:#fff;font-size:.76rem;font-weight:600;padding:4px 10px;border-radius:999px;pointer-events:none}
.cs-ctl{display:flex;gap:6px;align-items:center}
.cs-ctl button,.cs-ctl select{border:1.5px solid #d9e1ef;background:#fff;color:#14213d;border-radius:10px;font:700 .86rem 'Figtree','Segoe UI',sans-serif;cursor:pointer;min-height:0;padding:7px 10px}
.cs-ctl .cs-play{background:#14213d;color:#fff;border-color:#14213d;min-width:64px}
.cs-ctl input[type=range]{flex:1;min-width:0;accent-color:#e2540b}
.cs-story{display:flex;flex-direction:column;gap:8px}
.cs-dots{display:flex;gap:6px;align-items:center}
.cs-dot{width:26px;height:26px;border-radius:50%;border:2px solid #d9e1ef;background:#fff;color:#56627f;font:800 .74rem 'Figtree',sans-serif;cursor:pointer;display:grid;place-items:center;padding:0;min-height:0}
.cs-dot.done{background:#dfe6fb;border-color:#b6c3f0;color:#3556d8}
.cs-dot.now{background:#e2540b;border-color:#e2540b;color:#fff}
.cs-hook{margin:0;color:#56627f;font-size:.86rem;font-style:italic}
.cs-narr{margin:0;font-size:1.08rem;font-weight:700;line-height:1.4;min-height:3em}
.cs-formula{margin:0;font:600 .84rem ui-monospace,Menlo,Consolas,monospace;background:#e9eefb;border-radius:10px;padding:8px 10px;overflow-wrap:anywhere}
.cs-out{background:#fff4ec;border:1.5px solid #e2540b;border-radius:12px;padding:10px 12px;font-weight:800;overflow-wrap:anywhere}
.cs-out small{display:block;color:#9a4a16;font-size:.68rem;letter-spacing:.07em;text-transform:uppercase;margin-bottom:2px}
.cs-sub{margin:0 0 8px;color:#56627f;font-size:.86rem;font-weight:600}
.cs-live{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:#dff5e4;color:#1d7a35;padding:3px 9px;border-radius:999px;margin-bottom:8px}
.cs-vals{display:flex;flex-wrap:wrap;gap:6px}
.cs-val{background:#e9eefb;border-radius:8px;padding:4px 9px;font:700 .82rem ui-monospace,Menlo,Consolas,monospace}
.cs-params{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.cs-param{display:flex;flex-direction:column;gap:3px;font-size:.78rem;font-weight:700;color:#56627f}
.cs-param .row{display:flex;gap:6px;align-items:center}
.cs-param input[type=number]{width:70px;padding:5px 6px;border:1.5px solid #b9c6de;border-radius:8px;font:700 .9rem 'Figtree',sans-serif;color:#14213d}
.cs-param input[type=number].bad{border-color:#d33;background:#fff0f0}
.cs-param input[type=range]{flex:1;min-width:0;accent-color:#3556d8}
.cs-msg{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:#fff7e0;border:1px solid #f1d98a;font-size:.84rem}
.cs-chal{border:2px dashed #b9c6de}
.cs-chal.solved{border:2px solid #2b9a45;background:#f1fbf3}
.cs-chal h3{margin:0 0 4px;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#56627f}
.cs-chal p{margin:0 0 8px;font-weight:700}
.cs-chal .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.cs-chal button{border:1.5px solid #d9e1ef;background:#fff;border-radius:10px;font:700 .84rem 'Figtree',sans-serif;cursor:pointer;padding:6px 11px;min-height:0;color:#14213d}
.cs-status{font-weight:800;font-size:.84rem;color:#56627f}
.cs-chal.solved .cs-status{color:#1d7a35}
.cs-hint{margin:8px 0 0;font-size:.88rem;background:#fff7e0;border-radius:10px;padding:8px 10px}
.cs-conf{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.cs-conf i{position:absolute;top:-10px;width:8px;height:12px;border-radius:2px;animation:csFall 1.3s ease-in forwards}
@keyframes csFall{to{transform:translateY(420px) rotate(540deg);opacity:0}}
#cgStudio [hidden]{display:none!important}
.cs-stage canvas:focus-visible{outline:3px solid #f59e0b;outline-offset:-3px}
#cgStudio button:focus-visible,#cgStudio input:focus-visible,#cgStudio select:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}
.cg-studio-btn.cs-linked::after{content:'';width:8px;height:8px;border-radius:50%;background:#7ee08f;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
@media (prefers-reduced-motion:reduce){.cs-conf i{animation:none;opacity:0}}
`;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

const $e = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const workspace = document.querySelector('.workspace');
const dock = $e('aside'); dock.id = 'cgStudio'; dock.setAttribute('aria-label', 'Animation Studio'); workspace.appendChild(dock);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TAB_N = { tabCoordinateGeometry: 1, tabLineEquations: 2, tabAnglesIntersections: 3, tabDistanceMeasures: 4, tabLocusGeometric: 5, tabAngleBisectors: 6, tabStandardPoints: 7, tabTransformationAxes: 8, tabLineConic: 9, tab3DGeometry: 10 };
const activeTabId = () => { const t = document.querySelector('.tab-bar .tab.active') || document.querySelector('.tab.active'); return t ? t.id : 'tabCoordinateGeometry'; };
const chPrev = {};
let solved = {}; try { solved = JSON.parse(localStorage.getItem('cgSolved') || '{}') || {}; } catch (e) { solved = {}; }
const saveSolved = () => { try { localStorage.setItem('cgSolved', JSON.stringify(solved)); } catch (e) {} };

// ---- DOM skeleton ----
const el = {};
el.head = $e('div', 'cs-head'); el.top = $e('div', 'cs-top'); el.title = $e('h2', '', 'Animation Studio'); el.stars = $e('span', 'cs-stars'); el.x = $e('button', 'cs-x', '✕'); el.x.type = 'button'; el.x.setAttribute('aria-label', 'Close the Animation Studio');
el.top.append(el.title, el.stars, el.x); el.chips = $e('div', 'cs-chips'); el.head.append(el.top, el.chips);
el.body = $e('div', 'cs-body');
el.stage = $e('div', 'cs-stage'); el.cv = $e('canvas'); el.cv.setAttribute('role', 'img'); el.tip = $e('div', 'cs-tip'); el.conf = $e('div', 'cs-conf'); el.stage.append(el.cv, el.tip, el.conf);
el.ctl = $e('div', 'cs-ctl');
el.prev = $e('button', '', '⏮'); el.prev.type = 'button'; el.prev.setAttribute('aria-label', 'Previous step');
el.play = $e('button', 'cs-play', 'Pause'); el.play.type = 'button';
el.next = $e('button', '', '⏭'); el.next.type = 'button'; el.next.setAttribute('aria-label', 'Next step');
el.rg = $e('input'); el.rg.type = 'range'; el.rg.min = 0; el.rg.max = 1000; el.rg.value = 0; el.rg.setAttribute('aria-label', 'Scrub the animation');
el.replay = $e('button', '', '↺'); el.replay.type = 'button'; el.replay.setAttribute('aria-label', 'Replay');
el.speed = $e('select'); el.speed.setAttribute('aria-label', 'Speed'); el.speed.innerHTML = '<option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option>';
el.ctl.append(el.prev, el.play, el.next, el.rg, el.replay, el.speed);
el.story = $e('div', 'cs-box cs-story'); el.dots = $e('div', 'cs-dots'); el.narr = $e('p', 'cs-narr'); el.narr.setAttribute('aria-live', 'polite'); el.hook = $e('p', 'cs-hook'); el.story.append(el.dots, el.narr, el.hook);
el.out = $e('div', 'cs-out'); el.formula = $e('p', 'cs-formula');
el.nums = $e('div', 'cs-box');
el.chal = $e('div', 'cs-box cs-chal');
el.body.append(el.stage, el.ctl, el.story, el.out, el.formula, el.nums, el.chal);
dock.append(el.head, el.body);
const g = Graph(el.cv); g.invX = px => (px - g.ox) / g.sc; g.invY = py => (g.oy - py) / g.sc;

// ---- state ----
const S = { open: false, tabId: null, sig: '', linked: null, cur: null, sandbox: {}, picked: false, p: 0, playing: true, speed: 1, drag: null, hover: null, step: '', ans: '', dirty: true, hintOn: false, chIdx: {}, writeTimer: 0, boundsFixed: null };

function defaultsOf(sc) { const P = {}; sc.params.forEach(([k, , d]) => { P[k] = d; }); if (sc.ext) P.ext = 0; if (sc.selects) Object.keys(sc.selects).forEach(k => { P[k] = 1; }); if (sc.id === 'ptline') P.c0 = NaN; return P; }
function tabSceneList(tabId) { const n = TAB_N[tabId] || 1; return scenes.filter(s => s.tab === n); }
function writable() { const L = S.linked; return !!(L && L.params && L.binding.set && S.cur && S.cur.linked && !S.cur.sc.sandboxOnly); }

function restart() { S.p = reduce ? 1 : 0; S.playing = !reduce; S.dirty = true; syncPlayBtn(); }
function syncPlayBtn() { el.play.textContent = S.playing ? 'Pause' : 'Play'; }
function setBounds() { const c = S.cur; g.setBounds(S.boundsFixed || fit(c.sc.fit(c.P))); }

function select(id, linked) {
  const sc = SC[id]; if (!sc) return; S.kb = null;
  const L = S.linked, useLinked = !!(linked && L && L.params && L.binding.scene === id);
  const P = useLinked ? L.params : (S.sandbox[id] || (S.sandbox[id] = defaultsOf(sc)));
  S.cur = { sc, P, linked: useLinked }; S.boundsFixed = null; S.hintOn = false;
  el.cv.setAttribute('aria-label', 'Animation: ' + sc.title);
  buildNums(); buildDots(); setBounds(); restart(); checkChallenge(true); refreshChips(); refreshChallenge(); refreshTip(); refreshHook();
  el.title.textContent = sc.title;
}

function refreshChips() {
  el.chips.textContent = '';
  const list = tabSceneList(S.tabId), L = S.linked, ids = [];
  if (L && L.params) { ids.push([L.binding.scene, true]); ids.push([L.binding.scene, false]); }
  list.forEach(s => { if (!(L && L.params && L.binding.scene === s.id)) ids.push([s.id, false]); });
  ids.forEach(([id, mine], i) => {
    const play = !mine && L && L.params && L.binding.scene === id;
    const b = $e('button', 'cs-chip' + (mine ? ' mine' : ''), (SC[id].chip || SC[id].title) + (mine ? ' · your card' : play ? ' · free play' : '')); b.type = 'button';
    b.setAttribute('aria-pressed', String(S.cur && S.cur.sc.id === id && S.cur.linked === mine));
    b.addEventListener('click', () => { S.picked = true; select(id, mine); });
    el.chips.appendChild(b);
  });
  el.chips.hidden = ids.length < 2;
}

// ---- numbers panel ----
function buildNums() {
  const { sc, P, linked } = S.cur; el.nums.textContent = '';
  if (linked) {
    el.nums.append($e('span', 'cs-live', 'Using your card’s numbers'));
    el.nums.append($e('p', 'cs-sub', 'From the card: ' + (S.linked.title || sc.title)));
    const vals = $e('div', 'cs-vals'); sc.params.forEach(([k, lab]) => { vals.append($e('span', 'cs-val', lab + ' = ' + fmt(P[k]))); }); if (sc.ext) vals.append($e('span', 'cs-val', P.ext ? 'external' : 'internal')); if (sc.selects) Object.entries(sc.selects).forEach(([k, [lab, opts]]) => vals.append($e('span', 'cs-val', lab + ' = ' + String(opts[P[k]] || '').split(' ')[0]))); el.nums.append(vals);
    el.nums.append($e('p', 'cs-sub', writable() ? 'Drag the orange dots, or type in the card. Both stay in sync.' : 'Type the numbers in the card. This view follows them.'));
    el.nums.firstChild.style.marginBottom = '8px'; return;
  }
  el.nums.append($e('p', 'cs-sub', 'Try your own numbers:'));
  const grid = $e('div', 'cs-params');
  sc.params.forEach(([k, lab]) => {
    const [mn, mx, st] = sc.ranges[k] || [-10, 10, 1], w = $e('label', 'cs-param'); w.append(document.createTextNode(lab));
    const row = $e('div', 'row'), num = $e('input'), rg = $e('input'); num.type = 'number'; num.step = 'any'; num.value = P[k]; rg.type = 'range'; rg.min = mn; rg.max = mx; rg.step = st; rg.value = P[k];
    num.setAttribute('aria-label', lab); rg.setAttribute('aria-label', lab + ' slider'); num.dataset.k = k; rg.dataset.k = k;
    const upd = v => { const Q = Object.assign({}, S.cur.P, { [k]: v }); const ok = Number.isFinite(v) && sc.valid(Q); num.classList.toggle('bad', !ok); if (ok) { S.sandbox[sc.id] = S.cur.P = Q; S.boundsFixed = null; setBounds(); S.p = 1; S.playing = false; syncPlayBtn(); S.dirty = true; checkChallenge(); } else showMsg('These numbers do not make a valid figure. Check for zeros where a value must not be zero.'); if (ok) showMsg(''); };
    num.addEventListener('input', () => { const v = parseFloat(num.value); if (Number.isFinite(v)) rg.value = v; upd(v); });
    rg.addEventListener('input', () => { num.value = rg.value; upd(parseFloat(rg.value)); });
    row.append(num, rg); w.append(row); grid.append(w);
  });
  if (sc.selects) Object.entries(sc.selects).forEach(([k, [lab, opts]]) => {
    const w = $e('label', 'cs-param'); w.append(document.createTextNode(lab)); const sel = $e('select'); opts.forEach((o, i) => { const op = $e('option', '', o); op.value = String(i); sel.append(op); }); sel.value = String(P[k] == null ? 1 : P[k]);
    sel.addEventListener('change', () => { const Q = Object.assign({}, S.cur.P, { [k]: parseInt(sel.value, 10) }); if (!sc.valid(Q)) { showMsg('These numbers do not make a valid figure for this curve.'); return; } showMsg(''); S.cur.P = S.sandbox[sc.id] = Q; S.boundsFixed = null; setBounds(); restart(); checkChallenge(); });
    w.append(sel); grid.append(w);
  });
  if (sc.ext) { const w = $e('label', 'cs-param'); w.append(document.createTextNode('Division')); const sel = $e('select'); sel.innerHTML = '<option value="0">internal</option><option value="1">external</option>'; sel.value = String(P.ext || 0); sel.addEventListener('change', () => { S.cur.P = S.sandbox[sc.id] = Object.assign({}, S.cur.P, { ext: parseInt(sel.value, 10) }); setBounds(); restart(); checkChallenge(); }); w.append(sel); grid.append(w); }
  el.nums.append(grid); el.msg = $e('p', 'cs-msg'); el.msg.hidden = true; el.nums.append(el.msg);
}
function showMsg(t) { if (!el.msg) return; el.msg.textContent = t; el.msg.hidden = !t; }
function syncInputs() { // after a drag, reflect numbers into the sandbox inputs
  if (S.cur.linked) { buildNums(); return; }
  el.nums.querySelectorAll('input[data-k]').forEach(i => { const v = S.cur.P[i.dataset.k]; if (document.activeElement !== i && Number.isFinite(v)) i.value = rnd(v, 4); });
}

// ---- steps ----
function stepIndex(t) { const m = S.cur.sc.marks; let i = 0; m.forEach((v, j) => { if (t >= v - 1e-9) i = j; }); return i; }
function buildDots() {
  el.dots.textContent = ''; const m = S.cur.sc.marks; if (m.length < 2) { el.dots.hidden = true; return; } el.dots.hidden = false;
  m.forEach((t, i) => { const b = $e('button', 'cs-dot', String(i + 1)); b.type = 'button'; b.setAttribute('aria-label', 'Go to step ' + (i + 1)); b.addEventListener('click', () => { S.p = Math.min(1, t + 0.002); S.playing = false; syncPlayBtn(); S.dirty = true; }); el.dots.append(b); });
}
function jump(dir) {
  const sc = S.cur.sc, m = sc.marks, t = Math.min(1, S.p);
  if (m.length > 1) { const i = stepIndex(t), target = dir > 0 ? Math.min(m.length - 1, i + 1) : (t - m[i] > .02 ? i : Math.max(0, i - 1)); S.p = Math.min(1, m[target] + .002); }
  else S.p = Math.max(0, Math.min(1, t + dir * .125));
  S.playing = false; syncPlayBtn(); S.dirty = true;
}
function refreshHook() { const h = S.cur && S.cur.sc.hook; el.hook.textContent = h && lvNow() === 'school' ? 'Think: ' + h : ''; el.hook.hidden = !el.hook.textContent; }
function refreshTip() {
  const hs = handlesNow(); el.tip.hidden = !hs.length;
  el.tip.textContent = lvNow() === 'school' ? 'Drag the orange dots (or press Enter, then the arrow keys)' : 'Drag the handles (or Enter + arrow keys)';
  el.cv.style.cursor = hs.length ? 'grab' : 'default';
}

// ---- handles ----
function handlesNow() { const c = S.cur; if (!c || !c.sc.handles) return []; if (c.linked && !writable()) return []; const skip = (c.linked && S.linked.binding.noHandles) || []; return (c.sc.handles(c.P) || []).filter(h => !skip.includes(h.k)); }
function worldFromEvent(e) { const r = el.cv.getBoundingClientRect(); return { lx: (e.clientX - r.left) * (g.W / r.width), ly: (e.clientY - r.top) * (g.H / r.height) }; }
function hitHandle(e) { const { lx, ly } = worldFromEvent(e); let best = null, bd = 22; handlesNow().forEach(h => { const d = Math.hypot(g.X(h.x) - lx, g.Y(h.y) - ly); if (d < bd) { bd = d; best = h; } }); return best; }
el.cv.addEventListener('pointerdown', e => { const h = hitHandle(e); if (!h) return; S.drag = { k: h.k }; el.cv.setPointerCapture(e.pointerId); el.cv.style.cursor = 'grabbing'; S.playing = false; S.p = 1; syncPlayBtn(); S.boundsFixed = Object.assign({}, g.b); e.preventDefault(); });
function applyDrag(k, x, y) {
  const c = S.cur, Q = c.sc.drag(c.P, k, x, y);
  if (!Q || !c.sc.valid(Q) || JSON.stringify(Q) === JSON.stringify(c.P)) return false;
  c.P = Q; if (!c.linked) S.sandbox[c.sc.id] = Q;
  S.dirty = true; syncInputs(); scheduleWrite(); checkChallenge(); return true;   // the view stays fixed while dragging so the dot follows the pointer
}
el.cv.addEventListener('pointermove', e => {
  if (!S.drag) { const h = hitHandle(e); const nh = h ? h.k : null; if (nh !== S.hover) { S.hover = nh; el.cv.style.cursor = nh ? 'grab' : 'default'; S.dirty = true; } return; }
  const { lx, ly } = worldFromEvent(e); applyDrag(S.drag.k, snapV(g.invX(lx)), snapV(g.invY(ly)));
});
// keyboard: Enter picks the next dot, arrow keys move it (also what a screen reader user would use)
el.cv.tabIndex = 0;
el.cv.addEventListener('keydown', e => {
  const hs = handlesNow(); if (!hs.length) return;
  if (e.key === 'Enter' || e.key === ' ') { S.kb = ((S.kb == null ? -1 : S.kb) + 1) % hs.length; S.hover = hs[S.kb].k; el.tip.textContent = 'Selected ' + hs[S.kb].label + '. Use the arrow keys.'; el.tip.hidden = false; S.dirty = true; e.preventDefault(); return; }
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return;
  if (S.kb == null) { S.kb = 0; S.hover = hs[0].k; }
  const h = hs[S.kb % hs.length], st = lvNow() === 'inter' ? .5 : 1;
  if (applyDrag(h.k, snapV(h.x + d[0] * st), snapV(h.y + d[1] * st))) { S.boundsFixed = null; setBounds(); scheduleWrite(true); }
  e.preventDefault();
});
const endDrag = e => { if (!S.drag) return; S.drag = null; el.cv.style.cursor = 'grab'; S.boundsFixed = null; setBounds(); S.dirty = true; scheduleWrite(true); };
el.cv.addEventListener('pointerup', endDrag); el.cv.addEventListener('pointercancel', endDrag);

function scheduleWrite(now) {
  if (!S.cur.linked || !writable()) return;
  clearTimeout(S.writeTimer); S.writeTimer = setTimeout(writeCard, now ? 0 : 90);
}
function writeCard() {
  const L = S.linked, root = document.getElementById('mainCard'); if (!L || !L.binding.set || !root || !S.cur.linked) return;
  const vals = L.binding.set(S.cur.P); if (!vals) return;
  window.__cgWriting = true;
  try {
    Object.keys(vals).forEach(id => { const inp = root.querySelector('#' + id); if (inp) { inp.value = String(rnd(vals[id], 4)); inp.dispatchEvent(new Event('input', { bubbles: true })); } });
    const btn = root.querySelector('.calculate-btn'); if (btn) btn.click();
  } finally { window.__cgWriting = false; }
  L.params = Object.assign({}, S.cur.P);
}

// ---- challenges ----
function curChallenge() { const sc = S.cur.sc; if (!sc.challenges.length) return null; const i = (S.chIdx[sc.id] || 0) % sc.challenges.length; return { ch: sc.challenges[i], i, n: sc.challenges.length }; }
function refreshStars() { const n = Object.keys(solved).length; el.stars.textContent = '⭐ ' + n + ' / ' + TOTAL_CHALLENGES; el.stars.title = 'Challenges solved'; }
function refreshChallenge() {
  const c = curChallenge(); el.chal.textContent = ''; el.chal.classList.remove('solved'); refreshStars();
  if (!c) { el.chal.hidden = true; return; } el.chal.hidden = false;
  const lv = lvNow() === 'school' ? 0 : 1, done = !!solved[c.ch.id];
  el.chal.classList.toggle('solved', done);
  el.chal.append($e('h3', '', 'Challenge ' + (c.i + 1) + ' of ' + c.n), $e('p', '', c.ch.text[lv]));
  const row = $e('div', 'row'), st = $e('span', 'cs-status', done ? '✓ Solved' : 'Not yet'), hint = $e('button', '', 'Hint'), nx = $e('button', '', c.n > 1 ? 'Another challenge' : 'Try again');
  hint.type = 'button'; nx.type = 'button'; st.id = 'csStatus'; row.append(st, hint, nx); el.chal.append(row);
  const hp = $e('p', 'cs-hint', c.ch.hint[lv]); hp.hidden = !S.hintOn; el.chal.append(hp);
  hint.addEventListener('click', () => { S.hintOn = !S.hintOn; hp.hidden = !S.hintOn; });
  nx.addEventListener('click', () => { S.chIdx[S.cur.sc.id] = (S.chIdx[S.cur.sc.id] || 0) + 1; S.hintOn = false; refreshChallenge(); checkChallenge(true); });
}
function confetti() {
  if (reduce) return; el.conf.textContent = ''; const cols = ['#e2540b', '#3556d8', '#2b9a45', '#f59e0b', '#0a8a8a'];
  for (let i = 0; i < 26; i++) { const p = $e('i'); p.style.left = (Math.random() * 100) + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = (Math.random() * .25) + 's'; el.conf.append(p); }
  setTimeout(() => { el.conf.textContent = ''; }, 1700);
}
function checkChallenge(silent) {
  const c = curChallenge(); if (!c) return; let ok = false; try { ok = !!c.ch.check(S.cur.P); } catch (e) { ok = false; }
  const id = c.ch.id, st = document.getElementById('csStatus'), already = !!solved[id], was = chPrev[id];
  chPrev[id] = ok;
  if (ok && !already && !silent && was === false) { solved[id] = true; saveSolved(); refreshChallenge(); confetti(); return; }
  el.chal.classList.toggle('solved', already || (ok && was === false && !silent));
  if (st) st.textContent = ok ? (already ? '✓ Solved' : 'Already true. Change something, then bring it back.') : (already ? '✓ Solved before. Try again if you like.' : 'Not yet');
}

// ---- frame loop ----
function render() {
  const t = Math.min(1, S.p), c = S.cur, lv = lvNow();
  g.begin(); if (!c.sc.noGrid) g.grid();
  let s = ''; try { s = c.sc.draw(g, t, C, lv, c.P) || ''; } catch (err) { s = ''; }
  if (Array.isArray(s)) s = s[0] || '';
  // handles
  const hs = handlesNow(), ctx = g.ctx, pulse = 1 + .12 * Math.sin(performance.now() / 260);
  hs.forEach(h => { const x = g.X(h.x), y = g.Y(h.y), act = (S.drag && S.drag.k === h.k) || S.hover === h.k; ctx.save(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.a; ctx.fillStyle = 'rgba(226,84,11,.14)'; ctx.beginPath(); ctx.arc(x, y, (act ? 17 : 14) * (S.drag ? 1 : pulse), 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.a; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill(); ctx.restore(); });
  if (s !== S.step) { S.step = s; el.narr.textContent = s; }
  const m = c.sc.marks, idx = stepIndex(t);
  if (m.length > 1) [...el.dots.children].forEach((d, i) => { d.className = 'cs-dot' + (i < idx ? ' done' : i === idx ? ' now' : ''); });
  const f = pick(lv, c.sc.f[0], c.sc.f[1]); if (el.formula.textContent !== f) el.formula.textContent = f;
  const o = c.sc.out(c.P, lv); if (o !== S.ans) { S.ans = o; el.out.textContent = ''; el.out.append($e('small', '', c.linked ? 'Your answer' : 'Answer for these numbers'), document.createTextNode(o)); }
  el.rg.value = Math.round(t * 1000); S.dirty = false;
}
let last = performance.now(), raf = 0;
function frame(now) {
  const dt = Math.min(now - last, 100); last = now;
  if (S.open && S.cur) {
    if (S.playing && !S.drag) { S.p += dt / 9500 * S.speed; if (S.p >= (S.cur.sc.loop ? 1 : 1.2)) S.p = 0; render(); }
    else if (S.dirty || (handlesNow().length && !S.drag)) render();
  }
  raf = S.open ? requestAnimationFrame(frame) : 0;
}
function openStudio(open) {
  S.open = !!open; if (S.open) { syncLinked(); if (!S.cur) pickDefault(); S.dirty = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
}

// ---- following the app ----
function signature(found, tabId) { return tabId + '|' + (found ? found.binding.ids.join(',') + (found.params ? 'ok' : 'bad') : 'none'); }
function pickDefault() { const list = tabSceneList(S.tabId); select((list[0] || scenes[0]).id, false); }
function syncLinked(forceReplay) {
  const found = detectCard(), tabId = activeTabId(), sig = signature(found, tabId);
  const btn = document.getElementById('cgStudioBtn'); if (btn) btn.classList.toggle('cs-linked', !!(found && found.params));
  S.tabId = tabId;
  if (sig !== S.sig) {
    S.sig = sig; S.linked = found && found.params ? { binding: found.binding, params: Object.assign({}, found.params), title: found.title } : null; S.picked = false;
    el.chips.textContent = ''; if (S.linked) select(S.linked.binding.scene, true); else pickDefault();
    return;
  }
  if (!S.linked || !S.cur || !S.cur.linked || S.drag) return;
  const changed = !found || !found.params ? false : JSON.stringify(found.params) !== JSON.stringify(S.linked.params);
  if (changed) { S.linked.params = Object.assign({}, found.params); S.cur.P = S.linked.params; S.boundsFixed = null; setBounds(); buildNums(); restart(); checkChallenge(); }
  else if (forceReplay) { restart(); }
}
let timer = 0; const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
['input', 'change', 'keyup'].forEach(ev => document.addEventListener(ev, e => { if (window.__cgWriting || dock.contains(e.target)) return; if (e.target.closest && e.target.closest('#mainCard')) later(() => syncLinked(false), 180); }));
document.addEventListener('click', e => { if (window.__cgWriting || dock.contains(e.target)) return; const t = e.target.closest && e.target.closest('#mainCard .calculate-btn, #mainCard button'); if (t) later(() => syncLinked(true), 260); });
const mc = document.getElementById('mainCard'); if (mc) new MutationObserver(() => { if (!window.__cgWriting) later(() => syncLinked(false), 120); }).observe(mc, { childList: true });
const bar = document.querySelector('.tab-bar'); if (bar) new MutationObserver(() => later(() => syncLinked(false), 120)).observe(bar, { attributes: true, subtree: true, attributeFilter: ['class'] });

// ---- controls ----
el.play.addEventListener('click', () => { if (!S.playing && S.p >= 1) S.p = 0; S.playing = !S.playing; syncPlayBtn(); S.dirty = true; });
el.prev.addEventListener('click', () => jump(-1)); el.next.addEventListener('click', () => jump(1));
el.rg.addEventListener('input', () => { S.p = el.rg.value / 1000; S.playing = false; syncPlayBtn(); S.dirty = true; });
el.replay.addEventListener('click', () => restart());
el.speed.addEventListener('change', () => { S.speed = parseFloat(el.speed.value) || 1; });
el.x.addEventListener('click', () => { if (window.cgSetStudio) window.cgSetStudio(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.open && window.innerWidth < 1180 && window.cgSetStudio) window.cgSetStudio(false); });
document.addEventListener('cg-studio', e => openStudio(e.detail));
document.addEventListener('cg-level', () => { if (!S.cur) return; S.dirty = true; S.hintOn = false; refreshChallenge(); refreshTip(); refreshHook(); if (S.cur.linked) buildNums(); });

refreshStars();
S.tabId = activeTabId(); syncLinked(false);
if (window.cgStudioOpen && window.cgStudioOpen()) openStudio(true);
window.ConceptStudio = { scenes, bindings: BINDINGS, detectCard, scene: SC, state: S, g, select, solved: () => solved };
})();
