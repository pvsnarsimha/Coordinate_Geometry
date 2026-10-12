// ========= Visual Explainer: animated concept explanations that use the student's own numbers =========
// A floating "Explain" button opens a drawer with step-by-step animations for the active tab.
// When the open card is one of the mapped cards (distance, midpoint, area, slope, circle, ...),
// the animation reads the numbers typed into that card, follows them live, and shows the same answer.
// On other cards the drawer offers its own input boxes ("Try your own numbers").
// Two wordings: School (Class 8-10, plain words) and Intermediate (Class 11-12, formulas).
// Self-contained: it only reads the card's inputs and never writes to or changes the existing code.
(function () {
'use strict';
if (window.__conceptAnimationsLoaded) return;
window.__conceptAnimationsLoaded = true;

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

{ id:'area', tab:1, title:'Area of a triangle and collinearity', tag:'Class 9–12', params:[['x1','x₁',-3],['y1','y₁',-1],['x2','x₂',4],['y2','y₂',0],['x3','x₃',1],['y3','y₃',3]],
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
    const main = bs.find(x => x.ok); if (!main) return 'These two lines are the same line.';
    bs.forEach(x => x.ok && g.LL(x.a, x.b, x.c, C.a, 2.5, [8, 6]));
    const n = Math.hypot(main.a, main.b), dx = -main.b / n, dy = main.a / n, base = intersect(P) ? I : projOrigin(main), s = 3.2 * Math.sin(2 * Math.PI * t) + (intersect(P) ? 0 : 0);
    const Q = [base[0] + dx * s, base[1] + dy * s], n1 = Math.hypot(a1, b1), n2 = Math.hypot(a2, b2), v1 = a1 * Q[0] + b1 * Q[1] + c1, v2 = a2 * Q[0] + b2 * Q[1] + c2, F1 = [Q[0] - a1 * v1 / (n1 * n1), Q[1] - b1 * v1 / (n1 * n1)], F2 = [Q[0] - a2 * v2 / (n2 * n2), Q[1] - b2 * v2 / (n2 * n2)];
    g.L(Q[0], Q[1], F1[0], F1[1], C.c, 2, [5, 4]); g.L(Q[0], Q[1], F2[0], F2[1], C.g, 2, [5, 4]); g.D(F1[0], F1[1], C.c, 5); g.D(F2[0], F2[1], C.g, 5);
    const d1 = Math.abs(v1) / n1, d2 = Math.abs(v2) / n2;
    g.T('d = ' + fmt(d1, 2), (Q[0] + F1[0]) / 2, (Q[1] + F1[1]) / 2, C.c, { dx: 30, dy: 12, size: 13 }); g.T('d = ' + fmt(d2, 2), (Q[0] + F2[0]) / 2, (Q[1] + F2[1]) / 2, C.g, { dx: -30, dy: -12, size: 13 });
    g.D(Q[0], Q[1], C.a, 8); g.T('Q', Q[0], Q[1], C.a, { dx: 14, dy: -12, size: 14 });
    return pick(lv, ['Point Q is ' + fmt(d1, 2) + ' from line 1 and ' + fmt(d2, 2) + ' from line 2: always equal on the bisector.'], ['Bisector: ' + eqStr(main.a, main.b, main.c, 2) + '.  Distances from Q: ' + fmt(d1, 2) + ' and ' + fmt(d2, 2) + ' (equal).']);
  },
  out:(P, lv) => { const bs = bisectors(P).filter(x => x.ok); if (!bs.length) return 'The two lines are identical.'; return 'Bisector' + (bs.length > 1 ? 's: ' : ': ') + bs.map(x => eqStr(x.a, x.b, x.c, 2)).join('   and   '); } },

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
    const ctx = g.ctx, ext = Math.max(3, ...[P.ax, P.ay, P.az, P.bx, P.by, P.bz].map(Math.abs)), L = ext + 1, u = Math.min(34, 135 / (ext + 1)), O = [240, 195], cs = .866;
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
    g.D(px, py, C.ink, 8); g.T('P(' + fmt(px) + ', ' + fmt(py) + ')', px, py, C.ink, { dx: 12, dy: -16, size: 14 });
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
    if (p && sc.valid(p) && Object.values(p).every(x => Number.isFinite(x))) return { binding: bnd, params: p, title: title.trim() };
    return { binding: bnd, params: null, title: title.trim() };
  }
  return null;
}

// ---------- Styles ----------
const css = `
.cga-fab{position:fixed;right:20px;bottom:20px;z-index:9000;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 20px;background:#1e6f9f;color:#fff;font:600 1rem 'Segoe UI',Roboto,system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 24px -8px rgba(15,59,94,.6)}
.cga-fab:hover{background:#175a82}
.cga-fab.linked::after{content:'';width:9px;height:9px;border-radius:50%;background:#7ee08f;box-shadow:0 0 0 2px #1e6f9f}
.cga-fab:focus-visible,.cga-drawer button:focus-visible,.cga-drawer input:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}
.cga-drawer{position:fixed;top:0;right:0;bottom:0;width:min(520px,100vw);z-index:9100;background:#f3f6fb;box-shadow:-12px 0 32px rgba(15,59,94,.25);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .25s ease;font-family:'Segoe UI',Roboto,system-ui,sans-serif;color:#14213d}
.cga-drawer.open{transform:none}
.cga-head{display:flex;flex-direction:column;gap:10px;padding:14px 16px;background:#fff;border-bottom:1px solid #d9e1ef}
.cga-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cga-top h2{margin:0;font-size:1.1rem}
.cga-x{border:0;background:#e9eefb;color:#14213d;width:34px;height:34px;border-radius:50%;font-size:1.1rem;cursor:pointer;flex:none}
.cga-seg{display:flex;background:#e9eefb;border-radius:10px;padding:3px}
.cga-seg button{flex:1;border:0;background:transparent;color:#56627f;font:600 .88rem 'Segoe UI',Roboto,system-ui,sans-serif;padding:8px 10px;border-radius:8px;cursor:pointer}
.cga-seg button[aria-pressed="true"]{background:#14213d;color:#fff}
.cga-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.cga-card{background:#fff;border:1px solid #d9e1ef;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cga-card.linked{border-color:#2b9a45;box-shadow:0 0 0 2px rgba(43,154,69,.18)}
.cga-card h3{margin:0;font-size:1.05rem}
.cga-badges{display:flex;gap:8px;flex-wrap:wrap}
.cga-chip{font:700 .7rem 'Segoe UI',Roboto,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#e9eefb;color:#56627f;padding:3px 8px;border-radius:5px}
.cga-chip.live{background:#dff5e4;color:#1d7a35}
.cga-sub{margin:0;color:#56627f;font-size:.88rem}
.cga-stage{border:1px solid #d9e1ef;border-radius:10px;overflow:hidden;background:#fbfcff}
.cga-stage canvas{display:block;width:100%;height:auto;aspect-ratio:480/340}
.cga-ctl{display:flex;gap:10px;align-items:center}
.cga-ctl button{min-width:72px;padding:7px 12px;border-radius:8px;border:1px solid #bdc9d6;background:#fff;color:#14213d;font:600 .85rem 'Segoe UI',Roboto,system-ui,sans-serif;cursor:pointer}
.cga-ctl input{flex:1;min-width:0;accent-color:#e2540b}
.cga-inputs{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:8px}
.cga-inputs label{display:flex;flex-direction:column;gap:2px;font-size:.78rem;font-weight:600;color:#56627f}
.cga-inputs input{width:100%;min-width:0;padding:6px 8px;border:1px solid #bdc9d6;border-radius:8px;font:500 .95rem 'Segoe UI',Roboto,system-ui,sans-serif;color:#14213d}
.cga-inputs input.bad{border-color:#d33;background:#fff0f0}
.cga-step{margin:0;font-weight:600;min-height:3em}
.cga-formula{margin:0;font:500 .84rem ui-monospace,Menlo,Consolas,monospace;background:#e9eefb;border-radius:8px;padding:8px 10px;overflow-wrap:anywhere}
.cga-out{margin:0;background:#fff4ec;border:1px solid #f3c7a8;border-radius:8px;padding:8px 10px;font-weight:700;overflow-wrap:anywhere}
.cga-out small{display:block;font-weight:600;color:#9a4a16;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
.cga-note{margin:0;color:#56627f;font-size:.88rem}
.cga-msg{margin:0;padding:10px 12px;border-radius:10px;background:#fff7e0;border:1px solid #f1d98a;font-size:.9rem}
@media (prefers-reduced-motion:reduce){.cga-drawer{transition:none}}
`;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

// ---------- DOM ----------
let level = 'school';
try { level = localStorage.getItem('cgaLevel') === 'inter' ? 'inter' : 'school'; } catch (e) {}
const fab = document.createElement('button');
fab.className = 'cga-fab'; fab.type = 'button'; fab.setAttribute('aria-expanded', 'false');
const drawer = document.createElement('aside');
drawer.className = 'cga-drawer'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', 'Visual explainer'); drawer.setAttribute('aria-hidden', 'true');
drawer.innerHTML =
  '<div class="cga-head"><div class="cga-top"><h2 id="cgaTitle">Visual explainer</h2><button class="cga-x" type="button" aria-label="Close explainer">✕</button></div>' +
  '<div class="cga-seg" role="group" aria-label="Student level"><button type="button" data-lv="school">School · Class 8–10</button><button type="button" data-lv="inter">Intermediate · Class 11–12</button></div></div>' +
  '<div class="cga-body" id="cgaBody"></div>';
document.body.appendChild(drawer); document.body.appendChild(fab);
const bodyEl = drawer.querySelector('#cgaBody'), titleEl = drawer.querySelector('#cgaTitle');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let entries = [], open = false, sig = '';

function activeTabId() { const t = document.querySelector('.tab-bar .tab.active') || document.querySelector('.tab.active'); return t ? t.id : 'tabCoordinateGeometry'; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

function restart(en) { en.p = reduce ? 1 : 0; en.playing = !reduce; en.pp.textContent = en.playing ? 'Pause' : 'Play'; en.dirty = true; }
function applyParams(en, P) {
  en.P = P; en.g.setBounds(fit(en.sc.fit(P))); restart(en);
}

function makeEntry(sc, P, linked, cardTitle) {
  const card = el('article', 'cga-card' + (linked ? ' linked' : ''));
  const badges = el('div', 'cga-badges'); badges.appendChild(el('span', 'cga-chip', sc.tag)); if (linked) badges.appendChild(el('span', 'cga-chip live', 'Using your card’s numbers'));
  const h = el('h3', '', sc.title);
  const stage = el('div', 'cga-stage'), cv = el('canvas'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Animation: ' + sc.title); stage.appendChild(cv);
  const ctl = el('div', 'cga-ctl'), pp = el('button', '', reduce ? 'Play' : 'Pause'); pp.type = 'button';
  const rg = el('input'); rg.type = 'range'; rg.min = 0; rg.max = 1000; rg.value = 0; rg.setAttribute('aria-label', 'Scrub ' + sc.title);
  const rp = el('button', '', '↺ Replay'); rp.type = 'button'; ctl.append(pp, rg, rp);
  const st = el('p', 'cga-step'), fm = el('p', 'cga-formula'), out = el('p', 'cga-out'), msg = el('p', 'cga-msg'); msg.hidden = true;
  card.append(badges, h);
  if (linked && cardTitle) card.appendChild(el('p', 'cga-sub', 'From the card: ' + cardTitle));
  card.append(stage, ctl);
  const en = { sc, linked, card, g: Graph(cv), pp, rg, st, fm, out, msg, inputs: {}, P: null, p: 0, playing: true, dirty: true, last: '', lastOut: '' };
  if (!linked) {
    const grid = el('div', 'cga-inputs'), cap = el('p', 'cga-sub', 'Try your own numbers:');
    sc.params.forEach(([k, label, def]) => { const lab = el('label', '', label), inp = el('input'); inp.type = 'number'; inp.step = 'any'; inp.value = def; inp.setAttribute('aria-label', sc.title + ': ' + label); en.inputs[k] = inp; lab.appendChild(inp); grid.appendChild(lab); inp.addEventListener('input', () => readOwn(en)); });
    if (sc.ext) { const lab = el('label', '', 'Division'), sel = el('select'); sel.innerHTML = '<option value="0">internal</option><option value="1">external</option>'; sel.setAttribute('aria-label', 'Division type'); sel.style.cssText = 'padding:6px 8px;border:1px solid #bdc9d6;border-radius:8px;font:500 .95rem Segoe UI,Roboto,sans-serif'; en.inputs.ext = sel; lab.appendChild(sel); grid.appendChild(lab); sel.addEventListener('change', () => readOwn(en)); }
    card.append(cap, grid);
  }
  card.append(msg, st, out, fm);
  pp.addEventListener('click', () => { if (!en.playing && en.p >= 1) en.p = 0; en.playing = !en.playing; pp.textContent = en.playing ? 'Pause' : 'Play'; en.dirty = true; });
  rg.addEventListener('input', () => { en.p = rg.value / 1000; en.playing = false; pp.textContent = 'Play'; en.dirty = true; });
  rp.addEventListener('click', () => restart(en));
  const P0 = P || Object.fromEntries(sc.params.map(([k, , d]) => [k, d]).concat(sc.ext ? [['ext', 0]] : []));
  applyParams(en, P0); if (!reduce) en.p = 0; else en.p = 1;
  return en;
}
function readOwn(en) {
  const P = {}; let ok = true;
  for (const [k] of en.sc.params) { const inp = en.inputs[k], v = parseFloat(inp.value); inp.classList.toggle('bad', !Number.isFinite(v)); if (!Number.isFinite(v)) ok = false; P[k] = v; }
  if (en.sc.ext) P.ext = parseInt(en.inputs.ext.value, 10) || 0;
  if (en.sc.id === 'ptline') P.c0 = NaN;
  if (ok && !en.sc.valid(P)) { ok = false; en.msg.textContent = 'These numbers do not make a valid figure. Check for zeros where a value must not be zero.'; }
  en.msg.hidden = ok; if (ok) { applyParams(en, P); }
}

function build() {
  const found = detectCard(), info = TAB_INFO[activeTabId()] || TAB_INFO.tabCoordinateGeometry;
  sig = signature(found, info);
  entries = []; bodyEl.textContent = '';
  titleEl.textContent = 'Visual explainer · ' + info.name;
  if (found && found.params) {
    const en = makeEntry(SC[found.binding.scene], found.params, true, found.title); entries.push(en); bodyEl.appendChild(en.card);
  } else if (found) {
    bodyEl.appendChild(el('p', 'cga-msg', 'Type valid numbers in the card (and press Calculate) to see them animated here.'));
  }
  const rest = scenes.filter(s => s.tab === info.n && !(found && found.params && s.id === found.binding.scene));
  if (rest.length && found && found.params) bodyEl.appendChild(el('p', 'cga-note', 'More explainers for this tab, with example numbers you can change:'));
  rest.forEach(sc => { const en = makeEntry(sc, null, false); entries.push(en); bodyEl.appendChild(en.card); });
  bodyEl.appendChild(el('p', 'cga-note', 'Blue is across (x), green is up (y), orange is the answer or the moving point. Press Play, or drag the slider to stop on any step.'));
  bodyEl.scrollTop = 0;
}
function signature(found, info) { return info.n + '|' + (found ? found.binding.ids.join(',') + (found.params ? 'ok' : 'bad') : 'none'); }

// Re-read the card's numbers while it stays the same card.
function syncLinked(forceReplay) {
  const found = detectCard(), info = TAB_INFO[activeTabId()] || TAB_INFO.tabCoordinateGeometry;
  updateFab(found);
  if (!open) return;
  if (signature(found, info) !== sig) { build(); return; }
  const en = entries.find(e => e.linked); if (!en || !found || !found.params) return;
  const changed = JSON.stringify(found.params) !== JSON.stringify(en.P);
  if (changed || forceReplay) { applyParams(en, found.params); }
}
function updateFab(found) {
  const linked = !!(found && found.params);
  fab.classList.toggle('linked', linked);
  fab.innerHTML = '<span aria-hidden="true">▶</span> ' + (linked ? 'Explain this card' : 'Explain this topic');
}

// ---------- Frame loop ----------
function render(en) {
  const tt = Math.min(1, en.p), g = en.g;
  g.begin(); if (!en.sc.noGrid) g.grid();
  const s = en.sc.draw(g, tt, C, level, en.P);
  if (s !== en.last) { en.st.textContent = s; en.last = s; }
  const f = pick(level, en.sc.f[0], en.sc.f[1]); if (en.fm.textContent !== f) en.fm.textContent = f;
  const o = en.sc.out(en.P, level), ot = o ? '' : '';
  if (o !== en.lastOut) { en.out.textContent = ''; const sm = el('small', '', en.linked ? 'Your answer' : 'Answer for these numbers'); en.out.append(sm, document.createTextNode(o)); en.lastOut = o; }
  en.rg.value = Math.round(tt * 1000); en.dirty = false;
}
let last = performance.now(), raf = 0;
function frame(now) {
  const dt = Math.min(now - last, 100); last = now;
  entries.forEach(en => { if (en.playing) { en.p += dt / 9500; if (en.p >= 1.2) en.p = 0; render(en); } else if (en.dirty) render(en); });
  raf = open ? requestAnimationFrame(frame) : 0;
}
function setLevel(l) {
  level = l; try { localStorage.setItem('cgaLevel', l); } catch (e) {}
  drawer.querySelectorAll('.cga-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lv === l)));
  entries.forEach(en => { en.dirty = true; });
}
function openDrawer() { build(); open = true; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true'); setLevel(level); last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); drawer.querySelector('.cga-x').focus(); }
function closeDrawer() { open = false; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); fab.setAttribute('aria-expanded', 'false'); fab.focus(); }

fab.addEventListener('click', () => (open ? closeDrawer() : openDrawer()));
drawer.querySelector('.cga-x').addEventListener('click', closeDrawer);
drawer.querySelectorAll('.cga-seg button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.lv)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeDrawer(); });

// ---------- Following the app ----------
let timer = 0;
function later(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }
['input', 'change', 'keyup'].forEach(ev => document.addEventListener(ev, e => { if (drawer.contains(e.target)) return; if (e.target.closest && e.target.closest('#mainCard')) later(() => syncLinked(false), 180); }));
document.addEventListener('click', e => {
  if (drawer.contains(e.target) || fab.contains(e.target)) return;
  const t = e.target.closest && e.target.closest('#mainCard .calculate-btn, #mainCard button'); if (t) later(() => syncLinked(true), 260);
});
const mc = cardEl();
if (mc) new MutationObserver(() => later(() => syncLinked(false), 120)).observe(mc, { childList: true });
const bar = document.querySelector('.tab-bar');
if (bar) new MutationObserver(() => later(() => syncLinked(false), 120)).observe(bar, { attributes: true, subtree: true, attributeFilter: ['class'] });
setLevel(level); updateFab(detectCard());
window.ConceptAnimations = { scenes, bindings: BINDINGS, detectCard, scene: SC, fmt };
})();
