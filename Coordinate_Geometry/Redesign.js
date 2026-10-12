// ========= Coordinate Geometry Lab: app shell =========
// Adds the top bar (level switch + Studio button), icon tab pills, and a searchable topic list.
// It only changes how the page looks and never touches the existing cards or maths.
(function () {
'use strict';
if (window.__cgShellLoaded) return;
window.__cgShellLoaded = true;
document.body.classList.add('cg');

const svg = d => '<svg class="cg-tabicon" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
const TABS = {
  tabCoordinateGeometry:  { n: 1,  short: 'Points & Area',    long: 'Coordinate geometry · area · centroid · collinearity', blurb: 'Plot points, measure, find middles and areas.', icon: svg('<path d="M4 19h16M4 19V5"/><path d="M7 16l5-9 5 9z"/>') },
  tabLineEquations:       { n: 2,  short: 'Line Equations',   long: 'Equations of a straight line (various forms)',         blurb: 'Every way to write a line, from slope to intercepts.', icon: svg('<path d="M4 19h16M4 19V5"/><path d="M6 17L18 7"/>') },
  tabAnglesIntersections: { n: 3,  short: 'Angles',           long: 'Angles & intersections',                               blurb: 'Where lines meet and how they turn.', icon: svg('<path d="M4 19h16"/><path d="M4 19L17 6"/><path d="M10 19a6 6 0 0 0-2.5-4.9"/>') },
  tabDistanceMeasures:    { n: 4,  short: 'Distances',        long: 'Distance measures',                                    blurb: 'Shortest paths from points to lines.', icon: svg('<path d="M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>') },
  tabLocusGeometric:      { n: 5,  short: 'Locus',            long: 'Locus & geometric loci',                               blurb: 'The path of a point that follows a rule.', icon: svg('<circle cx="12" cy="12" r="8" stroke-dasharray="2.5 3"/><circle cx="12" cy="4" r="1.6" fill="currentColor"/>') },
  tabAngleBisectors:      { n: 6,  short: 'Bisectors',        long: 'Angle bisectors & family of lines',                    blurb: 'Cut angles in half; lines that share a point.', icon: svg('<path d="M4 19h16"/><path d="M4 19L16 5"/><path d="M4 19l13-6" stroke-dasharray="2.5 2.5"/>') },
  tabStandardPoints:      { n: 7,  short: 'Triangle Centres', long: 'Standard points of a triangle',                        blurb: 'Centroid, incentre, circumcentre, orthocentre.', icon: svg('<path d="M12 4l8 15H4z"/><circle cx="12" cy="14" r="1.7" fill="currentColor"/>') },
  tabTransformationAxes:  { n: 8,  short: 'Shift Axes',       long: 'Transformation & shifting of axes',                    blurb: 'Move or turn the axes; the point stays put.', icon: svg('<path d="M3 17h12M7 21V7"/><path d="M12 9h9M17 14V4" stroke-dasharray="2.5 2.5"/>') },
  tabLineConic:           { n: 9,  short: 'Line & Circle',    long: 'Line & conic interaction (basic)',                     blurb: 'Does a line cut, touch or miss a curve?', icon: svg('<circle cx="12" cy="12" r="6"/><path d="M3 15L21 8"/>') },
  tab3DGeometry:          { n: 10, short: '3D',               long: '3D geometry',                                          blurb: 'Points, lines and planes in space.', icon: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>') }
};
window.CG_TABS = TABS;

// ---------- level (shared with the Studio) ----------
let level = 'school';
try { level = localStorage.getItem('cgaLevel') === 'inter' ? 'inter' : 'school'; } catch (e) {}
window.cgLevel = () => level;
function setLevel(l) {
  level = l; try { localStorage.setItem('cgaLevel', l); } catch (e) {}
  document.querySelectorAll('.cg-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lv === l)));
  document.body.dataset.level = l;
  document.dispatchEvent(new CustomEvent('cg-level', { detail: l }));
}

// ---------- top bar ----------
const tabBar = document.querySelector('.tab-bar');
const top = document.createElement('header');
top.className = 'cg-top';
top.innerHTML =
  '<div class="cg-brand">' +
    '<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><rect width="38" height="38" rx="10" fill="#14213d"/><path d="M9 29V9M9 29h20" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M9 29L26 12" stroke="#3556d8" stroke-width="2.4" stroke-linecap="round"/><circle cx="26" cy="12" r="3.4" fill="#e2540b"/></svg>' +
    '<div><b>Coordinate Geometry Lab</b><small>See it. Move it. Understand it.</small></div>' +
  '</div>' +
  '<div class="cg-actions">' +
    '<div class="cg-seg" role="group" aria-label="Student level"><button type="button" data-lv="school" title="Class 8 to 10: plain words">School</button><button type="button" data-lv="inter" title="Class 11 to 12: formulas">Intermediate</button></div>' +
    '<button type="button" class="cg-studio-btn" id="cgStudioBtn" aria-pressed="false"><span aria-hidden="true">▶</span><span class="cg-lbl">Animation Studio</span></button>' +
  '</div>';
tabBar.parentNode.insertBefore(top, tabBar);
top.querySelectorAll('.cg-seg button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.lv)));

// ---------- Studio open/close ----------
const studioBtn = top.querySelector('#cgStudioBtn');
function setStudio(open) {
  document.body.classList.toggle('cg-studio-open', open);
  studioBtn.setAttribute('aria-pressed', String(open));
  document.dispatchEvent(new CustomEvent('cg-studio', { detail: open }));
}
window.cgSetStudio = setStudio;
window.cgStudioOpen = () => document.body.classList.contains('cg-studio-open');
studioBtn.addEventListener('click', () => setStudio(!window.cgStudioOpen()));

// ---------- tab pills ----------
Object.keys(TABS).forEach(id => {
  const el = document.getElementById(id), t = TABS[id];
  if (!el) return;
  el.title = t.long; el.setAttribute('role', 'button'); el.tabIndex = 0;
  el.innerHTML = '<span class="cg-tabn">' + t.n + '</span>' + t.icon + '<span>' + t.short + '</span>';
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
});

// ---------- topic list header + search ----------
const side = document.getElementById('leftSidebar'), content = document.getElementById('sidebarContent');
const head = document.createElement('div');
head.className = 'cg-side-head';
head.innerHTML = '<h2 id="cgSideTitle">Topics</h2><p id="cgSideBlurb"></p><input class="cg-search" id="cgSearch" type="search" placeholder="Find a topic…" aria-label="Find a topic">';
side.insertBefore(head, content);
const empty = document.createElement('div'); empty.className = 'cg-empty'; empty.textContent = 'No topic matches. Try a shorter word.'; empty.hidden = true; content.appendChild(empty);
const search = head.querySelector('#cgSearch');
function applyFilter() {
  const q = search.value.trim().toLowerCase(); let shown = 0;
  content.querySelectorAll('.nav-btn').forEach(b => {
    const inTab = b.style.display !== 'none';
    if (!inTab) { b.classList.remove('cg-hide'); return; }
    const hit = !q || b.textContent.toLowerCase().includes(q);
    b.classList.toggle('cg-hide', !hit); if (hit) shown++;
  });
  empty.hidden = shown > 0 || !q;
}
search.addEventListener('input', applyFilter);
function syncSide() {
  const act = document.querySelector('.tab.active'), t = act && TABS[act.id];
  if (t) { document.getElementById('cgSideTitle').textContent = t.short; document.getElementById('cgSideBlurb').textContent = t.blurb; }
  search.value = ''; applyFilter();
  if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center' });
}
new MutationObserver(syncSide).observe(tabBar, { attributes: true, subtree: true, attributeFilter: ['class'] });

// ---------- start state ----------
setLevel(level);
syncSide();
// open the Studio by default on wide screens
setStudio(window.innerWidth >= 1280);
})();
