// ========= Angle Bisectors & Family of Lines (tab 6) =========
// Uses buildGeoCard() and the geo* helpers from StandardTriangle.js, so that file must load first.

const BS_C1 = '#1f7f6a', BS_C2 = '#d44c2f', BS_CB = '#2b3595', BS_PAL = ['#d44c2f', '#1f7f6a', '#ca8a04', '#7c3aed', '#0891b2'];

function bsLineGroups(p, d1, d2, extra) {
    const g = [
        { label: 'Line 1:  a₁x + b₁y + c₁ = 0', fields: [{ id: p + 'A1', label: 'a₁', value: d1[0] }, { id: p + 'B1', label: 'b₁', value: d1[1] }, { id: p + 'C1', label: 'c₁', value: d1[2] }] },
        { label: 'Line 2:  a₂x + b₂y + c₂ = 0', fields: [{ id: p + 'A2', label: 'a₂', value: d2[0] }, { id: p + 'B2', label: 'b₂', value: d2[1] }, { id: p + 'C2', label: 'c₂', value: d2[2] }] }
    ];
    if (extra) g.push(extra);
    return g;
}
function bsRead(v, p, k) { return { a: v[p + 'A' + k], b: v[p + 'B' + k], c: v[p + 'C' + k] }; }
function bsCheckLine(l, name) { if (Math.abs(l.a) < 1e-12 && Math.abs(l.b) < 1e-12) throw new Error(name + ': a and b cannot both be zero'); }
const bsLine = (l, color, label, extra) => Object.assign({ color, label }, extra || {}, { a: l.a, b: l.b, c: l.c });
const bsUnit = l => { const n = Math.hypot(l.a, l.b); return { a: l.a / n, b: l.b / n, c: l.c / n, n }; };

// Both angle bisectors. same: s1 = s2, opp: s1 = -s2 (s = signed distance). Returns null entries for degenerate ones.
function bsBisectors(l1, l2) {
    const u1 = bsUnit(l1), u2 = bsUnit(l2);
    const mk = sg => {
        const a = u1.a - sg * u2.a, b = u1.b - sg * u2.b, c = u1.c - sg * u2.c, m = Math.max(Math.abs(a), Math.abs(b));
        if (m < 1e-9) return null;
        return { raw: { a, b, c }, line: geoNormLine({ a: a / m, b: b / m, c: c / m }) };
    };
    return { same: mk(1), opp: mk(-1), u1, u2 };
}
// Which of the two bisectors cuts the acute angle between the lines.
function bsAcute(l1, l2) {
    const B = bsBisectors(l1, l2), d1 = [B.u1.b, -B.u1.a], d2 = [B.u2.b, -B.u2.a], dot = d1[0] * d2[0] + d1[1] * d2[1];
    if (Math.abs(dot) < 1e-9) return { perpendicular: true, B };
    const tgt = dot > 0 ? [d1[0] + d2[0], d1[1] + d2[1]] : [d1[0] - d2[0], d1[1] - d2[1]];
    const dirOf = x => [x.line.b, -x.line.a], crossT = x => Math.abs(dirOf(x)[0] * tgt[1] - dirOf(x)[1] * tgt[0]);
    const sameIsAcute = crossT(B.same) <= crossT(B.opp);
    return { perpendicular: false, B, acute: sameIsAcute ? B.same : B.opp, obtuse: sameIsAcute ? B.opp : B.same, acuteSign: sameIsAcute ? 's₁ = s₂' : 's₁ = −s₂', obtuseSign: sameIsAcute ? 's₁ = −s₂' : 's₁ = s₂', theta: Math.acos(Math.min(1, Math.abs(dot))) * 180 / Math.PI };
}
function bsBase(v, p) {
    const l1 = bsRead(v, p, 1), l2 = bsRead(v, p, 2);
    bsCheckLine(l1, 'Line 1'); bsCheckLine(l2, 'Line 2');
    const I = geoIntersect(l1, l2);
    return { l1, l2, I };
}
const bsFormula = '\\frac{a_1x+b_1y+c_1}{\\sqrt{a_1^2+b_1^2}} = \\pm \\frac{a_2x+b_2y+c_2}{\\sqrt{a_2^2+b_2^2}}';

// ---------- 1. Equation of angle bisectors ----------
function renderAngleBisectorsEquationCard() {
    buildGeoCard({
        btn: 'angleBisectorsEquationBtn', icon: '📐', title: 'Equation of Angle Bisectors', formulas: [bsFormula],
        groups: bsLineGroups('bs', [1, 1, -2], [7, -1, -6]),
        foot: 'Every point on an angle bisector is the same distance from both lines. The + sign and the − sign give the two bisectors, one for the acute angle and one for the obtuse angle.',
        compute: v => {
            const { l1, l2, I } = bsBase(v, 'bs'), B = bsBisectors(l1, l2), n1 = B.u1.n, n2 = B.u2.n;
            if (!I && !B.same && !B.opp) throw new Error('The two lines are the same line');
            const lines = [bsLine(l1, BS_C1, 'Line 1'), bsLine(l2, BS_C2, 'Line 2')], out = [];
            if (B.same) { lines.push(bsLine(B.same.line, BS_CB, 'bisector (s₁ = s₂)', { dash: [6, 4], width: 3 })); out.push(geoEqL(B.same.line)); }
            if (B.opp) { lines.push(bsLine(B.opp.line, '#7c3aed', 'bisector (s₁ = −s₂)', { dash: [6, 4], width: 3 })); out.push(geoEqL(B.opp.line)); }
            const steps = [
                `① L₁: ${geoEq(l1.a, l1.b, l1.c)},   L₂: ${geoEq(l2.a, l2.b, l2.c)}`,
                `② √(a₁²+b₁²) = ${fmt(n1)},   √(a₂²+b₂²) = ${fmt(n2)}`,
                `③ Bisector condition: (${geoEq(l1.a, l1.b, l1.c).replace(' = 0', '')}) / ${fmt(n1)} = ± (${geoEq(l2.a, l2.b, l2.c).replace(' = 0', '')}) / ${fmt(n2)}`,
                B.same ? `④ With +  (s₁ = s₂):  ${geoEqL(B.same.line)}` : `④ With +: the x and y terms cancel, so there is no bisector of this type (the lines are parallel)`,
                B.opp ? `⑤ With −  (s₁ = −s₂):  ${geoEqL(B.opp.line)}` : `⑤ With −: the x and y terms cancel, so there is no bisector of this type (the lines are parallel)`
            ];
            if (I) {
                const ac = bsAcute(l1, l2);
                steps.push(`⑥ The lines meet at I = ${geoPtStr(I)}. ` + (ac.perpendicular ? 'The lines are perpendicular, so both bisectors cut 90° angles.' : `The angle between them is ${fmt(ac.theta)}°; the bisector of the acute angle is ${geoEqL(ac.acute.line)}.`));
            } else steps.push('⑥ The lines are parallel, so the single bisector is the line halfway between them.');
            return { special: I ? [Object.assign(I, { label: 'I' })] : [], key: [geoPt(0, 0)].concat(I ? [I] : []), lines, steps, result: `\\( ${out.join(';\\quad ')} \\)` };
        }
    });
}

function bsAngleCard(btn, title, which, p) {
    buildGeoCard({
        btn, icon: '📐', title, formulas: [bsFormula], groups: bsLineGroups(p, [1, 1, -2], [7, -1, -6]),
        foot: which === 'acute'
            ? 'The bisector of the acute angle lies in the narrower pair of angles between the two lines.'
            : 'The bisector of the obtuse angle lies in the wider pair of angles between the two lines.',
        compute: v => {
            const { l1, l2, I } = bsBase(v, p);
            if (!I) throw new Error('The lines are parallel, so there is no angle to bisect');
            const ac = bsAcute(l1, l2), lines = [bsLine(l1, BS_C1, 'Line 1'), bsLine(l2, BS_C2, 'Line 2')];
            if (ac.perpendicular) {
                lines.push(bsLine(ac.B.same.line, BS_CB, 'bisector', { dash: [6, 4], width: 3 }), bsLine(ac.B.opp.line, '#7c3aed', 'bisector', { dash: [6, 4], width: 3 }));
                return { special: [Object.assign(I, { label: 'I' })], lines, steps: [
                    `① L₁: ${geoEq(l1.a, l1.b, l1.c)},   L₂: ${geoEq(l2.a, l2.b, l2.c)}`,
                    `② a₁a₂ + b₁b₂ = ${fmt(l1.a * l2.a + l1.b * l2.b)} = 0, so the lines are perpendicular`,
                    `③ All four angles are 90°, so both bisectors are equally acute and obtuse: ${geoEqL(ac.B.same.line)}  and  ${geoEqL(ac.B.opp.line)}`
                ], result: `\\( ${geoEqL(ac.B.same.line)};\\quad ${geoEqL(ac.B.opp.line)} \\)` };
            }
            const pick = which === 'acute' ? ac.acute : ac.obtuse, sign = which === 'acute' ? ac.acuteSign : ac.obtuseSign, other = which === 'acute' ? ac.obtuse : ac.acute;
            lines.push(bsLine(pick.line, BS_CB, which + ' bisector', { dash: [6, 4], width: 3 }), bsLine(other.line, '#94a3b8', 'other bisector', { dash: [3, 4], width: 1.5 }));
            const dot = l1.a * l2.a + l1.b * l2.b;
            return { special: [Object.assign(I, { label: 'I' })], key: [geoPt(0, 0)], lines, steps: [
                `① L₁: ${geoEq(l1.a, l1.b, l1.c)},   L₂: ${geoEq(l2.a, l2.b, l2.c)},  meeting at I = ${geoPtStr(I)}`,
                `② Angle between the lines: cos θ = |a₁a₂ + b₁b₂| / (√(a₁²+b₁²)·√(a₂²+b₂²)) = ${fmt(Math.abs(dot))} / ${fmt(ac.B.u1.n * ac.B.u2.n)}, so θ = ${fmt(ac.theta)}° (acute), ${fmt(180 - ac.theta)}° (obtuse)`,
                `③ Using the direction vectors, the ${which} angle is bisected by the line with ${sign}`,
                `④ Equation of the ${which} angle bisector: ${geoEqL(pick.line)}`,
                `⑤ The other bisector (${which === 'acute' ? 'obtuse' : 'acute'} angle): ${geoEqL(other.line)}`
            ], result: `\\( ${geoEqL(pick.line)} \\)` };
        }
    });
}
function renderAcuteBisectorCard() { bsAngleCard('acuteBisectorBtn', 'Bisector of Acute Angle', 'acute', 'ac'); }
function renderObtuseBisectorCard() { bsAngleCard('obtuseBisectorBtn', 'Bisector of Obtuse Angle', 'obtuse', 'ob'); }

// ---------- 4. Bisector containing a point ----------
function renderContainingPointBisectorCard() {
    buildGeoCard({
        btn: 'containingPointBisectorBtn', icon: '📍', title: 'Bisector Containing a Point', formulas: [bsFormula],
        groups: bsLineGroups('cp', [1, 1, -2], [7, -1, -6], { label: 'Point P(x, y)', fields: [{ id: 'cpX', label: 'x', value: 2 }, { id: 'cpY', label: 'y', value: 1 }] }),
        foot: 'Put P into both lines. If L₁/√(a₁²+b₁²) and L₂/√(a₂²+b₂²) have the same sign, P lies in the angle bisected by the + bisector; if the signs differ, by the − bisector.',
        compute: v => {
            const { l1, l2, I } = bsBase(v, 'cp'), P = geoPt(v.cpX, v.cpY);
            if (!I) throw new Error('The lines are parallel, so there is no angle to bisect');
            const B = bsBisectors(l1, l2), s1 = (l1.a * P.x + l1.b * P.y + l1.c) / B.u1.n, s2 = (l2.a * P.x + l2.b * P.y + l2.c) / B.u2.n;
            if (Math.abs(s1) < 1e-9 || Math.abs(s2) < 1e-9) throw new Error('P lies on one of the lines, so it is not inside an angle');
            const same = s1 * s2 > 0, chosen = same ? B.same : B.opp, other = same ? B.opp : B.same, ac = bsAcute(l1, l2);
            const kind = ac.perpendicular ? '90°' : (chosen === ac.acute ? 'acute' : 'obtuse');
            return { special: [Object.assign(I, { label: 'I' }), Object.assign(P, { label: 'P' })], key: [geoPt(0, 0)],
                lines: [bsLine(l1, BS_C1, 'Line 1'), bsLine(l2, BS_C2, 'Line 2'), bsLine(chosen.line, BS_CB, 'bisector containing P', { dash: [6, 4], width: 3 }), bsLine(other.line, '#94a3b8', 'other bisector', { dash: [3, 4], width: 1.5 })],
                steps: [
                    `① L₁: ${geoEq(l1.a, l1.b, l1.c)},   L₂: ${geoEq(l2.a, l2.b, l2.c)},  P = ${geoPtStr(P)}`,
                    `② s₁ = L₁(P)/√(a₁²+b₁²) = ${fmt(l1.a * P.x + l1.b * P.y + l1.c)} / ${fmt(B.u1.n)} = ${fmt(s1)}`,
                    `③ s₂ = L₂(P)/√(a₂²+b₂²) = ${fmt(l2.a * P.x + l2.b * P.y + l2.c)} / ${fmt(B.u2.n)} = ${fmt(s2)}`,
                    `④ s₁ and s₂ have ${same ? 'the same sign, so use s₁ = s₂' : 'different signs, so use s₁ = −s₂'}`,
                    `⑤ The bisector containing P: ${geoEqL(chosen.line)}  (it cuts the ${kind === '90°' ? '90°' : kind} angle that contains P)`,
                    `⑥ The other bisector, ${geoEqL(other.line)}, cuts the neighbouring pair of angles (the ones that do not contain P)`
                ],
                result: `\\( ${geoEqL(chosen.line)} \\)` };
        }
    });
}

// ---------- Family helpers ----------
const bsMember = (a, b, c) => ({ a, b, c });
// y = mx + c written neatly (no "+ -2", no "1x")
function bsSlopeEq(m, c) {
    const mt = Math.abs(m) < 1e-9 ? '' : (Math.abs(Math.abs(m) - 1) < 1e-9 ? (m < 0 ? '-x' : 'x') : fmt(m) + 'x');
    if (!mt) return 'y = ' + fmt(c);
    if (Math.abs(c) < 1e-9) return 'y = ' + mt;
    return 'y = ' + mt + (c < 0 ? ' - ' : ' + ') + fmt(Math.abs(c));
}
// c0 + c1λ written neatly
function bsLam(c0, c1) {
    const t1 = Math.abs(c1) < 1e-9 ? '' : (Math.abs(Math.abs(c1) - 1) < 1e-9 ? 'λ' : fmt(Math.abs(c1)) + 'λ');
    if (!t1) return fmt(c0);
    if (Math.abs(c0) < 1e-9) return (c1 < 0 ? '-' : '') + t1;
    return fmt(c0) + (c1 < 0 ? ' - ' : ' + ') + t1;
}
const bsNum = (v, k) => validateNumber(v, k);

// ---------- 5. Family through a point ----------
function renderFamilyThroughPointCard() {
    buildGeoCard({
        btn: 'familyThroughPointBtn', icon: '👪', title: 'Family through a Point', formulas: ['y - y_1 = m(x - x_1)', '\\text{every line through } (x_1, y_1) \\text{ is a member (and } x = x_1 \\text{ for infinite slope)}'],
        groups: [{ label: 'Fixed point P', fields: [{ id: 'ftpX', label: 'x₁', value: 2 }, { id: 'ftpY', label: 'y₁', value: 3 }] }, { label: 'Slopes to draw', fields: [{ id: 'ftpM1', label: 'm₁', value: 1 }, { id: 'ftpM2', label: 'm₂', value: -2 }, { id: 'ftpM3', label: 'm₃', value: 0.5 }] }],
        foot: 'Changing the parameter m turns the line around the fixed point P. All members share the point P.',
        compute: v => {
            const P = geoPt(v.ftpX, v.ftpY), ms = [v.ftpM1, v.ftpM2, v.ftpM3];
            const lines = ms.map((m, i) => bsLine({ a: m, b: -1, c: P.y - m * P.x }, BS_PAL[i], 'm = ' + fmt(m))).concat([bsLine({ a: 1, b: 0, c: -P.x }, '#94a3b8', 'x = ' + fmt(P.x) + ' (m → ∞)', { dash: [3, 4], width: 1.5 })]);
            return { special: [Object.assign(P, { label: 'P' })], key: [geoPt(P.x + 3, P.y + 3), geoPt(P.x - 3, P.y - 3)], lines, steps: [
                `① Family through P${geoPtStr(P)}: y - ${fmt(P.y)} = m(x - ${fmt(P.x)})`,
                ...ms.map((m, i) => `${'②③④'[i]} m = ${fmt(m)}: y - ${fmt(P.y)} = ${fmt(m)}(x - ${fmt(P.x)}) → ${bsSlopeEq(m, P.y - m * P.x)}`),
                `⑤ The vertical line x = ${fmt(P.x)} also passes through P (slope undefined)`
            ], result: `\\( y - ${fmt(P.y)} = m(x - ${fmt(P.x)}) \\)` };
        }
    });
}

// ---------- 6. Family parallel to a direction ----------
function renderFamilyParallelDirectionCard() {
    buildGeoCard({
        btn: 'familyParallelDirectionBtn', icon: '📏', title: 'Family Parallel to a Direction', formulas: ['y = mx + c \\ (m \\text{ fixed},\\; c \\text{ varies})', 'd = \\frac{|c_2 - c_1|}{\\sqrt{1+m^2}}'],
        groups: [{ label: 'Fixed slope', fields: [{ id: 'fpdM', label: 'm', value: 2 }] }, { label: 'Values of c to draw', fields: [{ id: 'fpdC1', label: 'c₁', value: -2 }, { id: 'fpdC2', label: 'c₂', value: 1 }, { id: 'fpdC3', label: 'c₃', value: 4 }] }],
        foot: 'All lines with the same slope are parallel. Changing c slides the line up or down; the distance between neighbours is |Δc| / √(1 + m²).',
        compute: v => {
            const m = v.fpdM, cs = [v.fpdC1, v.fpdC2, v.fpdC3], k = Math.sqrt(1 + m * m);
            return { key: [geoPt(-3, -3), geoPt(3, 3), geoPt(0, cs[0]), geoPt(0, cs[2])], lines: cs.map((c, i) => bsLine({ a: m, b: -1, c }, BS_PAL[i], 'c = ' + fmt(c))), steps: [
                `① Family: ${bsSlopeEq(m, 0).replace(/$/, '')} + c (same slope ${fmt(m)}, so all lines are parallel)`,
                ...cs.map((c, i) => `${'②③④'[i]} c = ${fmt(c)}: ${bsSlopeEq(m, c)}`),
                `⑤ Distance between c₁ and c₂: |(${fmt(cs[1])}) - (${fmt(cs[0])})| / √(1+${fmt(m * m)}) = ${fmt(Math.abs(cs[1] - cs[0]) / k)}`,
                `⑥ Distance between c₂ and c₃: ${fmt(Math.abs(cs[2] - cs[1]) / k)}`
            ], result: `\\( y = ${fmt(m)}x + c;\\quad d_{12} = ${fmt(Math.abs(cs[1] - cs[0]) / k)} \\)` };
        }
    });
}

// ---------- 7. Intercepts with a constant sum ----------
function bsInterceptMembers(as, bOf, label) {
    return as.map((a, i) => {
        const b = bOf(a);
        if (Math.abs(a) < 1e-9 || Math.abs(b) < 1e-9 || !isFinite(b)) throw new Error('a' + (i + 1) + ' gives an intercept of 0 or infinity; choose a different value');
        return { a, b, l: { a: b, b: a, c: -a * b } };
    });
}
function renderFamilySumInterceptsCard() {
    buildGeoCard({
        btn: 'familySumInterceptsBtn', icon: '➕', title: 'Family with Sum of Intercepts = Constant', formulas: ['\\frac{x}{a} + \\frac{y}{b} = 1,\\quad a + b = k'],
        groups: [{ label: 'Constant sum', fields: [{ id: 'fsiK', label: 'k', value: 6 }] }, { label: 'x-intercepts to draw (b = k − a)', fields: [{ id: 'fsiA1', label: 'a₁', value: 1 }, { id: 'fsiA2', label: 'a₂', value: 2 }, { id: 'fsiA3', label: 'a₃', value: 4 }] }],
        foot: 'With a + b = k, the lines do not share one point. Instead they all touch the curve √x + √y = √k (drawn in purple when k > 0).',
        compute: v => {
            const k = v.fsiK, mem = bsInterceptMembers([v.fsiA1, v.fsiA2, v.fsiA3], a => k - a), curves = [];
            if (k > 0) { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(geoPt(k * t * t, k * (1 - t) * (1 - t))); } curves.push({ pts, color: '#7c3aed', label: '√x + √y = √k', dash: [4, 3] }); }
            return { key: [geoPt(0, 0)].concat(mem.map(m => geoPt(m.a, 0)), mem.map(m => geoPt(0, m.b))), lines: mem.map((m, i) => bsLine(m.l, BS_PAL[i], `a = ${fmt(m.a)}, b = ${fmt(m.b)}`)), curves, steps: [
                `① Condition: a + b = ${fmt(k)}, so b = ${fmt(k)} - a`,
                ...mem.map((m, i) => `${'②③④'[i]} a = ${fmt(m.a)}, b = ${fmt(m.b)}: x/${fmt(m.a)} + y/${fmt(m.b)} = 1 → ${geoEqL(geoNormLine(m.l))}`),
                `⑤ These lines have no common point; they envelope the curve √x + √y = √${fmt(k)}`
            ], result: `\\( \\frac{x}{a} + \\frac{y}{${fmt(k)} - a} = 1 \\)` };
        }
    });
}

// ---------- 8. Intercepts with a constant product ----------
function renderFamilyProductInterceptsCard() {
    buildGeoCard({
        btn: 'familyProductInterceptsBtn', icon: '✖️', title: 'Family with Product of Intercepts = Constant', formulas: ['\\frac{x}{a} + \\frac{y}{b} = 1,\\quad ab = k'],
        groups: [{ label: 'Constant product', fields: [{ id: 'fpiK', label: 'k', value: 12 }] }, { label: 'x-intercepts to draw (b = k / a)', fields: [{ id: 'fpiA1', label: 'a₁', value: 2 }, { id: 'fpiA2', label: 'a₂', value: 3 }, { id: 'fpiA3', label: 'a₃', value: 6 }] }],
        foot: 'With ab = k, the triangle cut off by each line has the same area k/2, and the lines all touch the hyperbola xy = k/4 (purple).',
        compute: v => {
            const k = v.fpiK, mem = bsInterceptMembers([v.fpiA1, v.fpiA2, v.fpiA3], a => k / a), ext = Math.max(...mem.map(m => Math.max(Math.abs(m.a), Math.abs(m.b)))) * 1.3, curves = [];
            if (Math.abs(k) > 1e-9) {
                const c = k / 4, x0 = Math.abs(c) / ext;
                [1, -1].forEach(sg => { const pts = []; for (let i = 0; i <= 50; i++) { const x = sg * x0 * Math.pow(ext / x0, i / 50); pts.push(geoPt(x, c / x)); } curves.push({ pts, color: '#7c3aed', label: sg === 1 ? 'xy = k/4' : '', dash: [4, 3] }); });
            }
            return { key: [geoPt(0, 0)].concat(mem.map(m => geoPt(m.a, 0)), mem.map(m => geoPt(0, m.b))), lines: mem.map((m, i) => bsLine(m.l, BS_PAL[i], `a = ${fmt(m.a)}, b = ${fmt(m.b)}`)), curves, steps: [
                `① Condition: a·b = ${fmt(k)}, so b = ${fmt(k)} / a`,
                ...mem.map((m, i) => `${'②③④'[i]} a = ${fmt(m.a)}, b = ${fmt(m.b)}: x/${fmt(m.a)} + y/${fmt(m.b)} = 1 → ${geoEqL(geoNormLine(m.l))}`),
                `⑤ Each line cuts a triangle of area ½|ab| = ${fmt(Math.abs(k) / 2)} with the axes`,
                `⑥ The lines envelope the hyperbola xy = k/4 = ${fmt(k / 4)}`
            ], result: `\\( \\frac{x}{a} + \\frac{ay}{${fmt(k)}} = 1,\\quad \\text{area} = ${fmt(Math.abs(k) / 2)} \\)` };
        }
    });
}

// ---------- 9. L1 + lambda L2 = 0 ----------
function renderFamilyAdvancedIntersectionCard() {
    buildGeoCard({
        btn: 'familyAdvancedIntersectionBtn', icon: '⚡', title: 'Family: L₁ + λL₂ = 0 (Advanced)', formulas: ['(a_1x+b_1y+c_1) + \\lambda(a_2x+b_2y+c_2) = 0', '\\lambda_P = -\\frac{L_1(P)}{L_2(P)}'],
        groups: bsLineGroups('fai', [1, 1, -4], [1, -1, -2], { label: 'Parameter and a point P', fields: [{ id: 'faiL', label: 'λ', value: 1 }, { id: 'faiX', label: 'x', value: 0 }, { id: 'faiY', label: 'y', value: 0 }] }),
        foot: 'Every member passes through the intersection point of L₁ and L₂. To find the member through another point P, put P into the equation and solve for λ.',
        compute: v => {
            const { l1, l2, I } = bsBase(v, 'fai'), lam = v.faiL, P = geoPt(v.faiX, v.faiY);
            const mem = bsMember(l1.a + lam * l2.a, l1.b + lam * l2.b, l1.c + lam * l2.c), L1P = l1.a * P.x + l1.b * P.y + l1.c, L2P = l2.a * P.x + l2.b * P.y + l2.c;
            if (Math.abs(mem.a) < 1e-12 && Math.abs(mem.b) < 1e-12) throw new Error('For this λ the member is not a line (x and y terms vanish)');
            const lines = [bsLine(l1, BS_C1, 'L₁'), bsLine(l2, BS_C2, 'L₂'), bsLine(geoNormLine(mem), BS_CB, 'λ = ' + fmt(lam), { dash: [6, 4], width: 3 })];
            let lamP = null, pTxt;
            if (Math.abs(L2P) < 1e-9) pTxt = Math.abs(L1P) < 1e-9 ? 'P lies on both lines, so every member passes through P' : 'P lies on L₂ itself, which is the member λ → ∞';
            else { lamP = -L1P / L2P; pTxt = `λ = -L₁(P)/L₂(P) = -(${fmt(L1P)})/(${fmt(L2P)}) = ${fmt(lamP)}`; const mp = bsMember(l1.a + lamP * l2.a, l1.b + lamP * l2.b, l1.c + lamP * l2.c); if (Math.abs(mp.a) > 1e-12 || Math.abs(mp.b) > 1e-12) lines.push(bsLine(geoNormLine(mp), '#7c3aed', 'through P (λ = ' + fmt(lamP) + ')', { width: 2 })); }
            return { special: (I ? [Object.assign(I, { label: 'I' })] : []).concat([Object.assign(P, { label: 'P' })]), key: [geoPt(0, 0)].concat(I ? [I] : []), lines, steps: [
                `① L₁: ${geoEq(l1.a, l1.b, l1.c)},   L₂: ${geoEq(l2.a, l2.b, l2.c)}`,
                `② Family: (${geoEq(l1.a, l1.b, l1.c).replace(' = 0', '')}) + λ(${geoEq(l2.a, l2.b, l2.c).replace(' = 0', '')}) = 0`,
                `③ λ = ${fmt(lam)}: ${geoEq(mem.a, mem.b, mem.c)}`,
                I ? `④ Fixed point of the family (L₁ ∩ L₂): I = ${geoPtStr(I)}` : `④ L₁ ∥ L₂: there is no common point, so the members are all parallel to L₁`,
                `⑤ Member through P${geoPtStr(P)}: ${pTxt}`
            ], result: `\\( ${geoEq(mem.a, mem.b, mem.c)}${I ? `;\\quad I = (${fmt(I.x)},\\; ${fmt(I.y)})` : ''} \\)` };
        }
    });
}

// ---------- 10. Find the base equations ----------
function renderFamilyFindBaseCard() {
    buildGeoCard({
        btn: 'familyFindBaseBtn', icon: '🔍', title: 'Find Base Equation from Family', formulas: ['(a_0 + a_1\\lambda)x + (b_0 + b_1\\lambda)y + (c_0 + c_1\\lambda) = 0', '\\Rightarrow\\ (a_0x+b_0y+c_0) + \\lambda(a_1x+b_1y+c_1) = 0'],
        groups: [
            { label: 'Coefficient of x:  a₀ + a₁λ', fields: [{ id: 'ffbA0', label: 'a₀', value: 2 }, { id: 'ffbA1', label: 'a₁', value: 1 }] },
            { label: 'Coefficient of y:  b₀ + b₁λ', fields: [{ id: 'ffbB0', label: 'b₀', value: 1 }, { id: 'ffbB1', label: 'b₁', value: -1 }] },
            { label: 'Constant:  c₀ + c₁λ', fields: [{ id: 'ffbC0', label: 'c₀', value: -5 }, { id: 'ffbC1', label: 'c₁', value: -1 }] }
        ],
        foot: 'Collect the terms with λ and the terms without λ. The two groups are the base lines L₁ and L₂; the family passes through their intersection point.',
        compute: v => {
            const l1 = { a: v.ffbA0, b: v.ffbB0, c: v.ffbC0 }, l2 = { a: v.ffbA1, b: v.ffbB1, c: v.ffbC1 };
            bsCheckLine(l1, 'The part without λ'); bsCheckLine(l2, 'The part with λ');
            const I = geoIntersect(l1, l2), lines = [bsLine(l1, BS_C1, 'L₁ (λ = 0)'), bsLine(l2, BS_C2, 'L₂ (λ → ∞)')];
            [1, -1].forEach((lam, i) => { const m = { a: l1.a + lam * l2.a, b: l1.b + lam * l2.b, c: l1.c + lam * l2.c }; if (Math.abs(m.a) > 1e-12 || Math.abs(m.b) > 1e-12) lines.push(bsLine(geoNormLine(m), ['#7c3aed', '#ca8a04'][i], 'λ = ' + lam, { dash: [5, 4] })); });
            return { special: I ? [Object.assign(I, { label: 'I' })] : [], key: [geoPt(0, 0)].concat(I ? [I] : []), lines, steps: [
                `① Family: (${bsLam(v.ffbA0, v.ffbA1)})x + (${bsLam(v.ffbB0, v.ffbB1)})y + (${bsLam(v.ffbC0, v.ffbC1)}) = 0`,
                `② Terms without λ: L₁ = ${geoEqL(geoNormLine(l1))}`,
                `③ Terms with λ: L₂ = ${geoEqL(geoNormLine(l2))}`,
                `④ So the family is L₁ + λL₂ = 0`,
                I ? `⑤ Every member passes through L₁ ∩ L₂ = ${geoPtStr(I)}` : `⑤ L₁ ∥ L₂, so the members are all parallel and have no common point`
            ], result: `\\( L_1: ${geoEqL(geoNormLine(l1))},\\quad L_2: ${geoEqL(geoNormLine(l2))}${I ? `,\\quad \\text{fixed point } (${fmt(I.x)},\\; ${fmt(I.y)})` : ''} \\)` };
        }
    });
}

// ---------- 11. Family combinations for a locus ----------
function renderFamilyCombinationsLocusCard() {
    buildGeoCard({
        btn: 'familyCombinationsLocusBtn', icon: '🌀', title: 'Family Combinations for Locus', formulas: ['(x-x_Q)(x-x_I) + (y-y_Q)(y-y_I) = 0'],
        groups: bsLineGroups('fcl', [1, 1, -4], [1, -1, -2], { label: 'Point Q', fields: [{ id: 'fclX', label: 'x', value: 0 }, { id: 'fclY', label: 'y', value: 0 }] }),
        foot: 'Take the family L₁ + λL₂ = 0 (all lines through I). The feet of the perpendiculars from Q to these lines all lie on the circle with diameter QI. That circle is the locus.',
        compute: v => {
            const { l1, l2, I } = bsBase(v, 'fcl'), Q = geoPt(v.fclX, v.fclY);
            if (!I) throw new Error('L₁ and L₂ are parallel, so the family has no common point');
            const C = geoMid(Q, I), r = geoDist(Q, I) / 2;
            if (r < 1e-9) throw new Error('Q coincides with the intersection point, so the locus is a single point');
            const f1 = geoFoot(Q, l1), f2 = geoFoot(Q, l2);
            return { special: [Object.assign(I, { label: 'I' }), Object.assign(Q, { label: 'Q' }), Object.assign(f1, { label: 'foot on L₁' }), Object.assign(f2, { label: 'foot on L₂' })], key: [C],
                lines: [bsLine(l1, BS_C1, 'L₁'), bsLine(l2, BS_C2, 'L₂')], circles: [{ cx: C.x, cy: C.y, r, color: BS_CB, label: 'locus', dash: [6, 4] }], segs: [{ from: Q, to: f1, color: '#94a3b8', dash: [3, 3], label: '' }, { from: Q, to: f2, color: '#94a3b8', dash: [3, 3], label: '' }],
                steps: [
                    `① Intersection of the base lines: I = ${geoPtStr(I)}`,
                    `② A line of the family through I; the foot F of the perpendicular from Q${geoPtStr(Q)} makes ∠QFI = 90°`,
                    `③ So F lies on the circle with diameter QI`,
                    `④ Centre = midpoint of QI = ${geoPtStr(C)},  radius = QI/2 = ${fmt(r)}`,
                    `⑤ Equation: (x - ${fmt(Q.x)})(x - ${fmt(I.x)}) + (y - ${fmt(Q.y)})(y - ${fmt(I.y)}) = 0`,
                    `⑥ Check: the feet ${geoPtStr(f1)} and ${geoPtStr(f2)} are at distances ${fmt(geoDist(f1, C))} and ${fmt(geoDist(f2, C))} from the centre (= radius ✓)`
                ],
                result: `\\( (x - ${fmt(C.x)})^2 + (y - ${fmt(C.y)})^2 = ${fmt(r * r)} \\)` };
        }
    });
}

// ---------- 12. Concurrency using the family concept ----------
function renderFamilyConcurrencyCard() {
    buildGeoCard({
        btn: 'familyConcurrencyBtn', icon: '🎯', title: 'Concurrency using Family Concept', formulas: ['\\begin{vmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{vmatrix} = 0 \\iff L_3 = \\lambda L_1 + \\mu L_2'],
        groups: [
            { label: 'Line 1', fields: [{ id: 'fccA1', label: 'a₁', value: 1 }, { id: 'fccB1', label: 'b₁', value: 1 }, { id: 'fccC1', label: 'c₁', value: -5 }] },
            { label: 'Line 2', fields: [{ id: 'fccA2', label: 'a₂', value: 1 }, { id: 'fccB2', label: 'b₂', value: -1 }, { id: 'fccC2', label: 'c₂', value: -1 }] },
            { label: 'Line 3', fields: [{ id: 'fccA3', label: 'a₃', value: 2 }, { id: 'fccB3', label: 'b₃', value: 1 }, { id: 'fccC3', label: 'c₃', value: -8 }] }
        ],
        foot: 'Three lines are concurrent when L₃ belongs to the family L₁ + λL₂ = 0, which happens exactly when the determinant is zero.',
        compute: v => {
            const L = [1, 2, 3].map(k => ({ a: v['fccA' + k], b: v['fccB' + k], c: v['fccC' + k] }));
            L.forEach((l, i) => bsCheckLine(l, 'Line ' + (i + 1)));
            const [l1, l2, l3] = L, det = l1.a * (l2.b * l3.c - l2.c * l3.b) - l1.b * (l2.a * l3.c - l2.c * l3.a) + l1.c * (l2.a * l3.b - l2.b * l3.a);
            const conc = Math.abs(det) < 1e-9, I12 = geoIntersect(l1, l2), lines = L.map((l, i) => bsLine(l, [BS_C1, BS_C2, BS_CB][i], 'Line ' + (i + 1)));
            const steps = [`① Lines: ${L.map(l => geoEq(l.a, l.b, l.c)).join('   |   ')}`, `② Determinant = ${fmt(det)}`];
            let special = [], result;
            if (conc) {
                steps.push('③ The determinant is 0, so the three lines are concurrent (or all parallel)');
                if (I12) {
                    const d12 = l1.a * l2.b - l2.a * l1.b, lam = (l3.a * l2.b - l2.a * l3.b) / d12, mu = (l1.a * l3.b - l3.a * l1.b) / d12;
                    steps.push(`④ Writing L₃ = λL₁ + μL₂ gives λ = ${fmt(lam)}, μ = ${fmt(mu)} (check on c: ${fmt(lam * l1.c + mu * l2.c)} = ${fmt(l3.c)} ✓)`);
                    steps.push(`⑤ Common point: ${geoPtStr(I12)}`);
                    special = [Object.assign(I12, { label: 'common point' })];
                    result = `\\( \\text{Concurrent at } (${fmt(I12.x)},\\; ${fmt(I12.y)}) \\)`;
                } else { steps.push('④ L₁ and L₂ are parallel, so the three lines are parallel: no common point'); result = '\\( \\text{Parallel (no common point)} \\)'; }
            } else {
                const I13 = geoIntersect(l1, l3), I23 = geoIntersect(l2, l3);
                steps.push('③ The determinant is not 0, so the lines are NOT concurrent');
                const vs = [I12, I13, I23].filter(Boolean);
                steps.push(vs.length === 3 ? `④ They form a triangle with vertices ${vs.map(geoPtStr).join(', ')}` : '④ At least two of the lines are parallel');
                special = vs.map((p, i) => Object.assign(p, { label: ['L₁∩L₂', 'L₁∩L₃', 'L₂∩L₃'][i] }));
                result = `\\( \\text{Determinant} = ${fmt(det)} \\neq 0:\\ \\text{not concurrent} \\)`;
            }
            return { special, key: [geoPt(0, 0)].concat(special), lines, steps, result };
        }
    });
}

// ---------- 13. Lines with a fixed midpoint ----------
function renderFamilyFixedMidpointCard() {
    buildGeoCard({
        btn: 'familyFixedMidpointBtn', icon: '⚖️', title: 'Lines with Fixed Midpoint Property', formulas: ['\\frac{x}{2x_0} + \\frac{y}{2y_0} = 1', 'A = (2x_0, 0),\\; B = (0, 2y_0)'],
        groups: [{ label: 'Fixed point P(x₀, y₀)', fields: [{ id: 'ffmX', label: 'x₀', value: 2 }, { id: 'ffmY', label: 'y₀', value: 3 }] }],
        foot: 'Of all lines through P, exactly one meets the axes at A and B with P as the midpoint of AB. Its intercepts are twice the coordinates of P, and it cuts a triangle of area 2|x₀y₀|.',
        compute: v => {
            const x0 = v.ffmX, y0 = v.ffmY;
            if (Math.abs(x0) < 1e-9 || Math.abs(y0) < 1e-9) throw new Error('P must not lie on an axis (x₀ and y₀ must be non-zero)');
            const A = geoPt(2 * x0, 0), B = geoPt(0, 2 * y0), P = geoPt(x0, y0), l = geoNormLine({ a: y0, b: x0, c: -2 * x0 * y0 });
            return { points: [A, B], special: [Object.assign(P, { label: 'P (midpoint)' })], key: [geoPt(0, 0)], segs: [{ from: A, to: B, color: BS_CB, width: 3, label: 'AB' }],
                lines: [bsLine(l, '#94a3b8', 'line', { dash: [3, 4], width: 1.5 })],
                steps: [
                    `① Let the line be x/a + y/b = 1 with intercept points A(a, 0) and B(0, b)`,
                    `② Midpoint of AB = (a/2, b/2) must equal P(${fmt(x0)}, ${fmt(y0)}), so a = ${fmt(2 * x0)} and b = ${fmt(2 * y0)}`,
                    `③ Equation: x/${fmt(2 * x0)} + y/${fmt(2 * y0)} = 1 → ${geoEqL(l)}`,
                    `④ A = ${geoPtStr(A)}, B = ${geoPtStr(B)}`,
                    `⑤ Area of triangle OAB = ½·|${fmt(2 * x0)}|·|${fmt(2 * y0)}| = ${fmt(2 * Math.abs(x0 * y0))}`,
                    `⑥ Check: midpoint of AB = ${geoPtStr(geoMid(A, B))} ✓`
                ],
                result: `\\( ${geoEqL(l)},\\quad \\text{area} = ${fmt(2 * Math.abs(x0 * y0))} \\)` };
        }
    });
}

// ---------- Click handlers ----------
[
    ['angleBisectorsEquationBtn', 'renderAngleBisectorsEquationCard'], ['acuteBisectorBtn', 'renderAcuteBisectorCard'], ['obtuseBisectorBtn', 'renderObtuseBisectorCard'],
    ['containingPointBisectorBtn', 'renderContainingPointBisectorCard'], ['familyThroughPointBtn', 'renderFamilyThroughPointCard'], ['familyParallelDirectionBtn', 'renderFamilyParallelDirectionCard'],
    ['familySumInterceptsBtn', 'renderFamilySumInterceptsCard'], ['familyProductInterceptsBtn', 'renderFamilyProductInterceptsCard'], ['familyAdvancedIntersectionBtn', 'renderFamilyAdvancedIntersectionCard'],
    ['familyFindBaseBtn', 'renderFamilyFindBaseCard'], ['familyCombinationsLocusBtn', 'renderFamilyCombinationsLocusCard'], ['familyConcurrencyBtn', 'renderFamilyConcurrencyCard'],
    ['familyFixedMidpointBtn', 'renderFamilyFixedMidpointCard']
].forEach(([id, fn]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => { destroyGraph(); switchTab('tabAngleBisectors'); window[fn](); });
});
