// ========= Visual Explainer: animated concept explanations for every tab =========
// Adds a floating "Explain" button and a drawer that shows step-by-step animations for the
// active tab, in simple words (School, Class 8-10) or with formulas (Intermediate, Class 11-12).
// Self-contained: it only reads which tab is active and never touches the existing graph code.
(function () {
'use strict';
if (window.__conceptAnimationsLoaded) return;
window.__conceptAnimationsLoaded = true;

const C = { ink:'#14213d', muted:'#56627f', grid:'#e3e9f4', faint:'#9fb0cf', a:'#e2540b', b:'#0a8a8a', c:'#3556d8', g:'#2b9a45', paper:'#fbfcff' };
const FONT = '"Segoe UI", Roboto, system-ui, sans-serif';
const pick = (lv, s, i) => (lv === 'school' ? s : i);

const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const seg=(t,a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
const lerp=(a,b,t)=>a+(b-a)*t;
const f1=n=>(Math.round(n*10)/10).toFixed(1).replace('-','−');

function Graph(cv,b){
  const dpr=Math.min(window.devicePixelRatio||1,2),W=480,H=340;
  cv.width=W*dpr;cv.height=H*dpr;
  const ctx=cv.getContext('2d');
  const sc=Math.min((W-28)/(b.x1-b.x0),(H-28)/(b.y1-b.y0));
  const ox=W/2-sc*(b.x0+b.x1)/2, oy=H/2+sc*(b.y0+b.y1)/2;
  const g={ctx,W,H,sc,X:x=>ox+x*sc,Y:y=>oy-y*sc};
  g.begin=()=>{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=C.paper;ctx.fillRect(0,0,W,H)};
  g.L=(x1,y1,x2,y2,col,w=2,dash)=>{ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(g.X(x1),g.Y(y1));ctx.lineTo(g.X(x2),g.Y(y2));ctx.stroke();ctx.restore()};
  g.D=(x,y,col,r=6)=>{ctx.save();ctx.fillStyle=col;ctx.strokeStyle=C.paper;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(g.X(x),g.Y(y),r,0,7);ctx.fill();ctx.stroke();ctx.restore()};
  g.T=(s,x,y,col,o={})=>{ctx.save();ctx.font=(o.weight||700)+' '+(o.size||14)+'px '+FONT;ctx.fillStyle=col;ctx.textAlign=o.align||'center';ctx.textBaseline='middle';ctx.fillText(s,g.X(x)+(o.dx||0),g.Y(y)+(o.dy||0));ctx.restore()};
  g.grid=()=>{
    ctx.save();ctx.lineWidth=1;
    const i0=Math.ceil(-ox/sc),i1=Math.floor((W-ox)/sc),j0=Math.ceil((oy-H)/sc),j1=Math.floor(oy/sc);
    ctx.strokeStyle=C.grid;
    for(let i=i0;i<=i1;i++){const x=ox+i*sc;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let j=j0;j<=j1;j++){const y=oy-j*sc;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    ctx.strokeStyle=C.ink;ctx.fillStyle=C.ink;ctx.lineWidth=1.6;
    if(oy>0&&oy<H){ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W-4,oy);ctx.stroke();ctx.beginPath();ctx.moveTo(W-2,oy);ctx.lineTo(W-11,oy-4);ctx.lineTo(W-11,oy+4);ctx.fill()}
    if(ox>0&&ox<W){ctx.beginPath();ctx.moveTo(ox,H);ctx.lineTo(ox,4);ctx.stroke();ctx.beginPath();ctx.moveTo(ox,2);ctx.lineTo(ox-4,11);ctx.lineTo(ox+4,11);ctx.fill()}
    ctx.restore();
    for(let i=i0+1;i<i1;i++){if(i&&oy>20&&oy<H-18)g.T(i,i,0,C.muted,{dy:14,size:11,weight:600})}
    for(let j=j0+1;j<j1;j++){if(j&&ox>20&&ox<W-18)g.T(j,0,j,C.muted,{dx:-12,size:11,weight:600})}
    ctx.save();ctx.font='700 13px '+FONT;ctx.fillStyle=C.ink;
    ctx.fillText('x',W-16,oy-12);ctx.fillText('y',ox+12,14);ctx.fillText('O',ox-12,oy+14);ctx.restore();
  };
  return g;
}


const scenes=[
{ tab:1, title:'Plotting a point', tag:'Class 8–10', b:{x0:-4,x1:5,y0:-3,y1:4},
  f:['Point = (across, up)','P(x, y). Signs by quadrant: I (+,+)  II (−,+)  III (−,−)  IV (+,−)'],
  draw(g,t,C,lv){
    [['I',2.4,2.8],['II',-2.4,2.8],['III',-2.4,-1.8],['IV',2.4,-1.8]].forEach(q=>g.T(q[0],q[1],q[2],C.faint,{size:24,weight:800}));
    const s1=ease(seg(t,.05,.4)),s2=ease(seg(t,.4,.75)),px=3*s1,py=2*s2;
    g.L(0,0,px,0,C.c,5); if(s2>0)g.L(3,0,3,py,C.g,5);
    if(t>.75){g.L(3,2,3,0,C.faint,1.5,[5,5]);g.L(3,2,0,2,C.faint,1.5,[5,5]);
      g.T('3',3,0,C.c,{dy:30,size:16});g.T('2',0,2,C.g,{dx:-30,size:16});g.T('P(3, 2)',3,2,C.a,{dx:6,dy:-20,size:16})}
    g.D(px,py,C.a,8);
    const k=t<.05?0:t<.4?1:t<.75?2:3;
    return pick(lv,['Start at the origin, (0, 0).','Walk 3 steps right along the x-axis.','Now walk 2 steps up.','You have arrived at P(3, 2).'],
      ['Origin O(0, 0).','Abscissa x = 3, measured along the x-axis.','Ordinate y = 2, measured parallel to the y-axis.','P = (x, y) = (3, 2), in Quadrant I.'])[k];
  }},
{ tab:4, title:'Distance between two points', tag:'Class 8–10 · 11–12', b:{x0:-1,x1:7,y0:-1,y1:6},
  f:['Right triangle: leg² + leg² = longest side²','d = √[(x₂ − x₁)² + (y₂ − y₁)²]'],
  draw(g,t,C,lv){
    g.D(1,1,C.a,7);g.T('A(1, 1)',1,1,C.ink,{dx:-6,dy:22,size:14});
    if(t>.05){g.D(5,4,C.a,7);g.T('B(5, 4)',5,4,C.ink,{dx:6,dy:-20,size:14})}
    const s=seg(t,.2,.4),h=ease(seg(t,.4,.6)),v=ease(seg(t,.6,.8));
    if(s>0)g.L(1,1,1+4*s,1+3*s,C.a,3,[1,8]);
    if(h>0)g.L(1,1,1+4*h,1,C.c,5);
    if(v>0)g.L(5,1,5,1+3*v,C.g,5);
    if(h>=1)g.T('4',3,1,C.c,{dy:20,size:17});
    if(v>=1){g.T('3',5,2.5,C.g,{dx:16,size:17});g.L(4.6,1,4.6,1.4,C.ink,1.5);g.L(4.6,1.4,5,1.4,C.ink,1.5)}
    if(t>.8){g.L(1,1,5,4,C.a,4);g.T('5',2.8,3,C.a,{size:20})}
    g.D(1,1,C.a,7);g.D(5,4,C.a,7);
    const k=t<.2?0:t<.4?1:t<.6?2:t<.8?3:4;
    return pick(lv,['Two points: A(1, 1) and B(5, 4).','Join them. How long is AB?','Walk across first: 4 units.','Then up: 3 units.','Longest side: √(4² + 3²) = √25 = 5.'],
      ['Points A(x₁, y₁) = (1, 1) and B(x₂, y₂) = (5, 4).','Segment AB is the hypotenuse.','Δx = x₂ − x₁ = 5 − 1 = 4.','Δy = y₂ − y₁ = 4 − 1 = 3.','d = √(4² + 3²) = √25 = 5 units.'])[k];
  }},
{ tab:1, title:'Midpoint and section formula', tag:'Class 9–12', b:{x0:-6,x1:6,y0:-3,y1:5},
  f:['Middle point = the average of both ends','P = ((m·x₂ + n·x₁)/(m + n), (m·y₂ + n·y₁)/(m + n))'],
  draw(g,t,C,lv){
    let s=.5;
    s=lerp(s,.25,ease(seg(t,.22,.4)));
    s=lerp(s,.75,ease(seg(t,.5,.74)));
    s=lerp(s,.5,ease(seg(t,.82,.97)));
    const A=[-4,-1],B=[4,3],P=[A[0]+s*(B[0]-A[0]),A[1]+s*(B[1]-A[1])];
    g.L(A[0],A[1],P[0],P[1],C.c,5);g.L(P[0],P[1],B[0],B[1],C.g,5);
    g.D(A[0],A[1],C.ink,6);g.D(B[0],B[1],C.ink,6);
    g.T('A(−4, −1)',A[0],A[1],C.ink,{dy:22});g.T('B(4, 3)',B[0],B[1],C.ink,{dy:-20});
    g.D(P[0],P[1],C.a,9);g.T('P',P[0],P[1],C.a,{dx:-4,dy:-22,size:17});
    const m=s*4,n=(1-s)*4;
    return pick(lv,[Math.abs(s-.5)<.02?'P is exactly in the middle of A and B.':'P is '+Math.round(s*100)+'% of the way from A to B.'],
      ['m : n = '+f1(m)+' : '+f1(n)+'   P = ('+f1(P[0])+', '+f1(P[1])+')'])[0];
  }},
{ tab:2, title:'Slope and the line y = mx + c', tag:'Class 9–12', b:{x0:-5,x1:6,y0:-3,y1:5},
  f:['Slope = up ÷ across. Bigger number means steeper.','y = mx + c,  m = tan θ = (y₂ − y₁)/(x₂ − x₁)'],
  draw(g,t,C,lv){
    const m=2*Math.sin(2*Math.PI*t),c=1,ctx=g.ctx;
    ctx.save();ctx.beginPath();ctx.rect(0,0,g.W,g.H);ctx.clip();
    g.L(-9,-9*m+c,9,9*m+c,C.a,4);ctx.restore();
    g.D(0,c,C.ink,5);g.T('c = 1',0,c,C.muted,{dx:30,dy:-10,size:12});
    const y1=m+c,y2=2*m+c;
    g.L(1,y1,2,y1,C.c,4);g.L(2,y1,2,y2,C.g,4);
    g.D(1,y1,C.a,6);g.D(2,y2,C.a,6);
    g.T('1 across',1.5,y1,C.c,{dy:m>=0?18:-18,size:12});
    g.T('up '+f1(m),2,(y1+y2)/2,C.g,{dx:34,size:12});
    const kind=Math.abs(m)<.08?'flat':m>0?'rising':'falling';
    return pick(lv,['The line is '+kind+'. For every 1 step across it goes up '+f1(m)+'.'],
      ['y = ('+f1(m)+')x + 1   m = '+f1(m)+' ('+kind+')'])[0];
  }},
{ tab:9, title:'A line meets a circle', tag:'Class 11–12', b:{x0:-5,x1:5,y0:-4.5,y1:4.5},
  f:['A line can cross a circle 2 times, touch it once, or miss it','Substitute y = k into x² + y² = 9:  D = 9 − k²  (D>0 secant, D=0 tangent, D<0 none)'],
  draw(g,t,C,lv){
    const k=4*Math.cos(2*Math.PI*t),ctx=g.ctx;
    ctx.save();ctx.strokeStyle=C.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(g.X(0),g.Y(0),3*g.sc,0,7);ctx.stroke();ctx.restore();
    g.L(-6,k,6,k,C.a,3.5);
    const D=9-k*k;
    if(D>0){const x=Math.sqrt(D);g.D(x,k,C.g,7);g.D(-x,k,C.g,7)}
    else if(Math.abs(D)<.5){g.D(0,k,C.g,7)}
    const tan=Math.abs(Math.abs(k)-3)<.07;
    let st;
    if(tan)st='tangent';else if(D>0)st='secant';else st='none';
    g.T('y = '+f1(k),4.1,k,C.a,{dy:-14,size:13});
    return pick(lv,[tan?'Touching at exactly 1 point: a tangent.':D>0?'The line cuts the circle at 2 points.':'The line misses the circle: 0 points.'],
      ['D = 9 − k² = '+f1(D)+(tan?'  → D = 0, tangent':D>0?'  → D > 0, secant':'  → D < 0, no real point')])[0];
  }},
{ tab:8, title:'Shifting the axes', tag:'Class 11–12', b:{x0:-2,x1:7,y0:-2,y1:6},
  f:['New address = old address minus how far the corner moved','x′ = x − h ,  y′ = y − k   (new origin at (h, k))'],
  draw(g,t,C,lv){
    const e=ease(seg(t,.15,.65)),h=2*e,k=1*e;
    g.L(-3,k,8,k,C.a,3);g.L(h,-3,h,7,C.a,3);
    g.L(4,3,4,k,C.g,2,[6,5]);g.L(4,3,h,3,C.c,2,[6,5]);
    g.D(h,k,C.a,7);g.T('O′',h,k,C.a,{dx:-16,dy:16,size:14});
    g.T('X′',6.7,k,C.a,{dy:-14,size:14});g.T('Y′',h,5.7,C.a,{dx:14,size:14});
    g.D(4,3,C.ink,8);g.T('P',4,3,C.ink,{dx:14,dy:-14,size:15});
    return pick(lv,['New corner at ('+f1(h)+', '+f1(k)+'). P is now '+f1(4-h)+' across and '+f1(3-k)+' up from it.'],
      ["x′ = 4 − "+f1(h)+" = "+f1(4-h)+",  y′ = 3 − "+f1(k)+" = "+f1(3-k)+"   so  P′ = ("+f1(4-h)+", "+f1(3-k)+")"])[0];
  }},
{ tab:5, title:'Locus: equal distance from two points', tag:'Class 11–12', b:{x0:-5,x1:5,y0:-3.4,y1:3.4},
  f:['A locus is the path of every point that follows one rule','PA = PB  ⇒  (x+2)² + y² = (x−2)² + y²  ⇒  x = 0'],
  draw(g,t,C,lv){
    const y=2.6*Math.sin(2*Math.PI*t),d=Math.sqrt(4+y*y);
    g.L(0,-3.4,0,3.4,C.faint,2,[6,6]);g.L(0,0,0,y,C.a,5);
    g.L(-2,0,0,y,C.c,3);g.L(2,0,0,y,C.g,3);
    g.D(-2,0,C.ink,6);g.D(2,0,C.ink,6);
    g.T('A(−2, 0)',-2,0,C.ink,{dy:20});g.T('B(2, 0)',2,0,C.ink,{dy:20});
    g.T(f1(d),-1,y/2,C.c,{dx:-14,dy:y>=0?-6:6,size:13});g.T(f1(d),1,y/2,C.g,{dx:14,dy:y>=0?-6:6,size:13});
    g.D(0,y,C.a,9);g.T('P',0,y,C.a,{dx:15,dy:-12,size:15});
    return pick(lv,['PA = '+f1(d)+' and PB = '+f1(d)+'. They stay equal, so P travels along a straight line.'],
      ['PA = PB = √(2² + y²) = '+f1(d)+'.  The locus is the line x = 0.'])[0];
  }},
{ tab:10, title:'Points in 3D', tag:'Class 11–12', noGrid:true, b:{x0:-1,x1:1,y0:-1,y1:1},
  f:['3 numbers: along, across, up','OP = √(x² + y² + z²) = √(9 + 4 + 16) = √29 ≈ 5.39'],
  draw(g,t,C,lv){
    const ctx=g.ctx,u=30,O=[250,205],cs=0.866;
    const pr=(x,y,z)=>[O[0]+(y-x)*cs*u,O[1]+(x+y)*.5*u-z*u];
    const ln=(a,b,col,w,dash)=>{const p=pr(...a),q=pr(...b);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();ctx.restore()};
    const tx=(s,p,col,dx,dy)=>{ctx.save();ctx.font='700 15px '+FONT;ctx.fillStyle=col;ctx.textAlign='center';ctx.fillText(s,p[0]+dx,p[1]+dy);ctx.restore()};
    for(let i=0;i<=5;i++){ln([i,0,0],[i,5,0],C.grid,1);ln([0,i,0],[5,i,0],C.grid,1)}
    ln([0,0,0],[5.3,0,0],C.ink,1.8);ln([0,0,0],[0,5.3,0],C.ink,1.8);ln([0,0,0],[0,0,5.3],C.ink,1.8);
    tx('x',pr(5.6,0,0),C.ink,0,5);tx('y',pr(0,5.6,0),C.ink,0,5);tx('z',pr(0,0,5.6),C.ink,0,0);
    const s1=ease(seg(t,.05,.3)),s2=ease(seg(t,.3,.55)),s3=ease(seg(t,.55,.8));
    if(t>.8){const B=[[3,0,0],[3,2,0],[0,2,0]],T=[[3,0,4],[3,2,4],[0,2,4],[0,0,4]];
      ln([3,0,0],[3,0,4],C.faint,1.5,[5,5]);ln([0,2,0],[0,2,4],C.faint,1.5,[5,5]);ln([3,2,0],[3,2,4],C.faint,1.5,[5,5]);
      ln([0,0,4],[3,0,4],C.faint,1.5,[5,5]);ln([0,0,4],[0,2,4],C.faint,1.5,[5,5]);ln([3,0,4],[3,2,4],C.faint,1.5,[5,5]);ln([0,2,4],[3,2,4],C.faint,1.5,[5,5]);
      ln([0,0,0],[3,2,4],C.a,3,[1,8])}
    ln([0,0,0],[3*s1,0,0],C.c,5);
    if(s2>0)ln([3,0,0],[3,2*s2,0],C.g,5);
    if(s3>0)ln([3,2,0],[3,2,4*s3],C.b,5);
    const tip=pr(3*(s2>0?1:s1),2*s2,4*s3);
    ctx.save();ctx.fillStyle=C.a;ctx.strokeStyle=C.paper;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(tip[0],tip[1],8,0,7);ctx.fill();ctx.stroke();ctx.restore();
    if(t>.8)tx('P(3, 2, 4)',tip,C.a,-4,-18);
    const k=t<.05?0:t<.3?1:t<.55?2:t<.8?3:4;
    return pick(lv,['Start at the origin.','Move 3 along the x direction.','Move 2 along the y direction.','Now climb 4 up the z direction.','The point is P(3, 2, 4).'],
      ['O(0, 0, 0).','x = 3.','y = 2.','z = 4.','P(3, 2, 4), OP = √29 ≈ 5.39.'])[k];
  }},
{ tab:1, title:'Area of a triangle and collinearity', tag:'Class 9–12', snap:.5, b:{x0:-5,x1:6,y0:-4.5,y1:4.5},
  f:['Area = space inside the triangle. If it shrinks to 0, the 3 points are in one line.','Area = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|;  collinear ⇔ Area = 0'],
  draw(g,t,C,lv){
    const A=[-3,-1],B=[4,0],y=-0.43+3.6*Math.sin(2*Math.PI*t),Cc=[1,y];
    const area=.5*Math.abs(A[0]*(B[1]-Cc[1])+B[0]*(Cc[1]-A[1])+Cc[0]*(A[1]-B[1]));
    const ctx=g.ctx;ctx.save();ctx.globalAlpha=.2;ctx.fillStyle=C.a;ctx.beginPath();ctx.moveTo(g.X(A[0]),g.Y(A[1]));ctx.lineTo(g.X(B[0]),g.Y(B[1]));ctx.lineTo(g.X(Cc[0]),g.Y(Cc[1]));ctx.fill();ctx.restore();
    const col=area<.15;
    g.L(A[0],A[1],B[0],B[1],C.c,3.5);g.L(B[0],B[1],Cc[0],Cc[1],col?C.g:C.c,3.5);g.L(Cc[0],Cc[1],A[0],A[1],col?C.g:C.c,3.5);
    g.D(A[0],A[1],C.ink,6);g.D(B[0],B[1],C.ink,6);g.D(Cc[0],Cc[1],C.a,8);
    g.T('A',A[0],A[1],C.ink,{dx:-14,dy:12,size:15});g.T('B',B[0],B[1],C.ink,{dx:14,dy:12,size:15});g.T('C',1,y,C.a,{dx:16,dy:-6,size:15});
    return pick(lv,[col?'C is on the line AB: the triangle is flat, area 0, so A, B, C are collinear.':'Slide C up and down. The shaded area is '+f1(area)+' square units.'],
      ['Area = '+f1(area)+(col?'  → 0, so A, B, C are collinear':'')])[0];
  }},
{ tab:2, title:'Intercept form of a line', tag:'Class 9–12', snap:.15, b:{x0:-2,x1:6,y0:-2,y1:6},
  f:['The line cuts the x-axis at a and the y-axis at b','x/a + y/b = 1;  area of the triangle with the axes = ½|ab|'],
  draw(g,t,C,lv){
    const a=3+1.5*Math.sin(2*Math.PI*t),b=3+1.5*Math.cos(2*Math.PI*t),ctx=g.ctx;
    ctx.save();ctx.globalAlpha=.16;ctx.fillStyle=C.a;ctx.beginPath();ctx.moveTo(g.X(0),g.Y(0));ctx.lineTo(g.X(a),g.Y(0));ctx.lineTo(g.X(0),g.Y(b));ctx.fill();ctx.restore();
    g.L(1.4*a,-.4*b,-.4*a,1.4*b,C.a,4);
    g.D(a,0,C.c,8);g.D(0,b,C.g,8);
    g.T('(a, 0) = ('+f1(a)+', 0)',a,0,C.c,{dy:28,size:13});g.T('(0, b) = (0, '+f1(b)+')',0,b,C.g,{dx:58,dy:-4,size:13});
    return pick(lv,['Cuts the x-axis at '+f1(a)+' and the y-axis at '+f1(b)+'.'],
      ['x/'+f1(a)+' + y/'+f1(b)+' = 1     area = ½ab = '+f1(a*b/2)])[0];
  }},
{ tab:3, title:'Angle between two lines', tag:'Class 9–12', snap:.3, b:{x0:-5,x1:5,y0:-4,y1:4},
  f:['The angle is how far you turn from one line to the other','tan θ = |(m₂ − m₁)/(1 + m₁m₂)|;  m₁m₂ = −1 means perpendicular'],
  draw(g,t,C,lv){
    const a1=20*Math.PI/180,deg=50+100*(.5-.5*Math.cos(2*Math.PI*t)),a2=deg*Math.PI/180,ctx=g.ctx;
    const m1=Math.tan(a1),m2=Math.tan(a2);
    let th=Math.abs(deg-20);if(th>90)th=180-th;
    const perp=Math.abs(th-90)<1.2;
    ctx.save();ctx.globalAlpha=.22;ctx.fillStyle=C.a;ctx.beginPath();ctx.moveTo(g.X(0),g.Y(0));ctx.arc(g.X(0),g.Y(0),1.6*g.sc,-a2,-a1);ctx.closePath();ctx.fill();ctx.restore();
    g.L(-9*Math.cos(a1),-9*Math.sin(a1),9*Math.cos(a1),9*Math.sin(a1),C.c,3.5);
    g.L(-9*Math.cos(a2),-9*Math.sin(a2),9*Math.cos(a2),9*Math.sin(a2),C.g,3.5);
    g.D(0,0,C.ink,6);
    g.T('θ',1.9*Math.cos((a1+a2)/2),1.9*Math.sin((a1+a2)/2),C.a,{size:20});
    g.T('line 1',3.6,1.5,C.c,{size:13});g.T('line 2',Math.cos(a2)*3.6,Math.sin(a2)*3.6,C.g,{dx:24,dy:-4,size:13});
    return pick(lv,[perp?'Exactly a right angle: the lines are perpendicular.':'The angle between the lines is about '+Math.round(th)+'°.'],
      ['θ = '+Math.round(th)+'°   tan θ = '+(perp?'undefined (1 + m₁m₂ = 0)':f1(Math.tan(th*Math.PI/180)))+'   m₁ = '+f1(m1)+', m₂ = '+f1(m2)])[0];
  }},
{ tab:4, title:'Distance from a point to a line', tag:'Class 11–12', snap:.3, b:{x0:-4,x1:6,y0:-4,y1:5},
  f:['Shortest way from a point to a line is straight across, at a right angle','d = |ax₁ + by₁ + c| / √(a² + b²)  for the line ax + by + c = 0'],
  draw(g,t,C,lv){
    const th=2*Math.PI*t,P=[1+3*Math.cos(th),-1+2.2*Math.sin(th)+1.4];
    const v=3*P[0]+4*P[1]-12,d=Math.abs(v)/5,F=[P[0]-v/25*3,P[1]-v/25*4];
    g.L(-3,5.25,6,-1.5,C.ink,3.5);g.T('3x + 4y − 12 = 0',4.6,-.7,C.muted,{size:12,dy:20});
    g.L(P[0],P[1],F[0],F[1],C.c,3,[7,5]);
    g.D(F[0],F[1],C.g,6);g.D(P[0],P[1],C.a,9);g.T('P',P[0],P[1],C.a,{dx:14,dy:-12,size:15});
    return pick(lv,['The shortest distance from P to the line is '+f1(d)+' units.'],
      ['d = |3('+f1(P[0])+') + 4('+f1(P[1])+') − 12| / 5 = '+f1(Math.abs(v))+' / 5 = '+f1(d)])[0];
  }},
{ tab:6, title:'Angle bisector', tag:'Class 11–12', snap:.25, b:{x0:-5,x1:5,y0:-4.5,y1:4.5},
  f:['The bisector cuts the angle into 2 equal halves. Every point on it is equally far from both lines.','Bisector of a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0:  (a₁x + b₁y + c₁)/√(a₁² + b₁²) = ± (a₂x + b₂y + c₂)/√(a₂² + b₂²)'],
  draw(g,t,C,lv){
    const A1=10*Math.PI/180,phi=(60+40*Math.sin(2*Math.PI*t))*Math.PI/180,A2=A1+phi,Bq=A1+phi/2;
    const ray=(a,col,w,dash)=>g.L(0,0,8*Math.cos(a),8*Math.sin(a),col,w,dash);
    ray(A1,C.c,3.5);ray(A2,C.g,3.5);ray(Bq,C.a,3,[8,6]);
    const q=4,Q=[q*Math.cos(Bq),q*Math.sin(Bq)],dd=q*Math.cos(phi/2),d=q*Math.sin(phi/2);
    const F1=[dd*Math.cos(A1),dd*Math.sin(A1)],F2=[dd*Math.cos(A2),dd*Math.sin(A2)];
    g.L(Q[0],Q[1],F1[0],F1[1],C.c,2,[5,4]);g.L(Q[0],Q[1],F2[0],F2[1],C.g,2,[5,4]);
    g.D(F1[0],F1[1],C.c,5);g.D(F2[0],F2[1],C.g,5);g.D(Q[0],Q[1],C.a,8);g.D(0,0,C.ink,6);
    g.T('d = '+f1(d),F1[0],F1[1],C.c,{dx:30,dy:14,size:13});g.T('d = '+f1(d),F2[0],F2[1],C.g,{dx:-34,dy:-12,size:13});
    g.T('bisector',5.4*Math.cos(Bq),5.4*Math.sin(Bq),C.a,{dx:-8,dy:-12,size:12});
    return pick(lv,['Point Q is '+f1(d)+' from line 1 and '+f1(d)+' from line 2: always equal.'],
      ['Half-angle = '+Math.round(phi*90/Math.PI)+'°.  Distances from Q: '+f1(d)+' and '+f1(d)+' (equal).'])[0];
  }},
{ tab:7, title:'Standard points of a triangle', tag:'Class 11–12', snap:.97, b:{x0:-6,x1:7,y0:-5.5,y1:6},
  f:['Four special centres: centroid, circumcentre, orthocentre, incentre','G = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3);  H = A + B + C − 2·O;  I = (a·A + b·B + c·C)/(a + b + c)'],
  draw(g,t,C,lv){
    const A=[-4,-2],B=[5,-1],Cp=[0,5],ctx=g.ctx,V=[A,B,Cp];
    const mid=(P,Q)=>[(P[0]+Q[0])/2,(P[1]+Q[1])/2];
    const dist=(P,Q)=>Math.hypot(P[0]-Q[0],P[1]-Q[1]);
    const G=[(A[0]+B[0]+Cp[0])/3,(A[1]+B[1]+Cp[1])/3];
    const d=2*(A[0]*(B[1]-Cp[1])+B[0]*(Cp[1]-A[1])+Cp[0]*(A[1]-B[1]));
    const sq=P=>P[0]*P[0]+P[1]*P[1];
    const O=[(sq(A)*(B[1]-Cp[1])+sq(B)*(Cp[1]-A[1])+sq(Cp)*(A[1]-B[1]))/d,(sq(A)*(Cp[0]-B[0])+sq(B)*(A[0]-Cp[0])+sq(Cp)*(B[0]-A[0]))/d];
    const R=dist(O,A),H=[A[0]+B[0]+Cp[0]-2*O[0],A[1]+B[1]+Cp[1]-2*O[1]];
    const a=dist(B,Cp),b=dist(A,Cp),c=dist(A,B),I=[(a*A[0]+b*B[0]+c*Cp[0])/(a+b+c),(a*A[1]+b*B[1]+c*Cp[1])/(a+b+c)];
    const area=Math.abs(d)/4,r=area/((a+b+c)/2);
    const foot=(P,Q,Rr)=>{const dx=Rr[0]-Q[0],dy=Rr[1]-Q[1],u=((P[0]-Q[0])*dx+(P[1]-Q[1])*dy)/(dx*dx+dy*dy);return[Q[0]+u*dx,Q[1]+u*dy]};
    const part=(P,Q,s,col,w,dash)=>g.L(P[0],P[1],lerp(P[0],Q[0],s),lerp(P[1],Q[1],s),col,w,dash);
    g.L(A[0],A[1],B[0],B[1],C.ink,3);g.L(B[0],B[1],Cp[0],Cp[1],C.ink,3);g.L(Cp[0],Cp[1],A[0],A[1],C.ink,3);
    const s1=ease(seg(t,.04,.2)),s2=ease(seg(t,.27,.43)),s3=ease(seg(t,.5,.66)),s4=ease(seg(t,.73,.89));
    if(s1>0){part(A,mid(B,Cp),s1,C.c,2.5);part(B,mid(A,Cp),s1,C.c,2.5);part(Cp,mid(A,B),s1,C.c,2.5);if(s1>=1)g.D(G[0],G[1],C.c,8)}
    if(s2>0){[[A,B],[B,Cp],[Cp,A]].forEach(([P,Q])=>part(mid(P,Q),O,s2,C.g,2.5));
      ctx.save();ctx.globalAlpha=Math.min(1,s2);ctx.strokeStyle=C.g;ctx.lineWidth=1.8;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(g.X(O[0]),g.Y(O[1]),R*g.sc,0,7);ctx.stroke();ctx.restore();
      if(s2>=1)g.D(O[0],O[1],C.g,8)}
    if(s3>0){part(A,foot(A,B,Cp),s3,C.a,2.5);part(B,foot(B,A,Cp),s3,C.a,2.5);part(Cp,foot(Cp,A,B),s3,C.a,2.5);if(s3>=1)g.D(H[0],H[1],C.a,8)}
    if(s4>0){V.forEach(P=>part(P,I,s4,C.b,2.5));ctx.save();ctx.globalAlpha=s4;ctx.strokeStyle=C.b;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(g.X(I[0]),g.Y(I[1]),r*g.sc,0,7);ctx.stroke();ctx.restore();if(s4>=1)g.D(I[0],I[1],C.b,8)}
    [['A',A,-14,14],['B',B,14,14],['C',Cp,0,-16]].forEach(([n,P,dx,dy])=>{g.D(P[0],P[1],C.ink,6);g.T(n,P[0],P[1],C.ink,{dx,dy,size:15})});
    if(t>.9){g.T('G',G[0],G[1],C.c,{dx:-12,dy:-12,size:14});g.T('S',O[0],O[1],C.g,{dx:12,dy:-12,size:14});g.T('H',H[0],H[1],C.a,{dx:12,dy:-12,size:14});g.T('I',I[0],I[1],C.b,{dx:12,dy:10,size:14})}
    const k=t<.04?0:t<.27?1:t<.5?2:t<.73?3:4;
    return pick(lv,['A triangle ABC.','Medians (to the middle of each side) meet at the centroid G.','Perpendicular bisectors meet at the circumcentre S. It is the centre of the circle through A, B, C.','Altitudes (straight down from each corner) meet at the orthocentre H.','Angle bisectors meet at the incentre I, the centre of the circle inside.'],
      ['Triangle ABC.','G = ('+f1(G[0])+', '+f1(G[1])+')  (average of the vertices).','S = ('+f1(O[0])+', '+f1(O[1])+'),  R = '+f1(R)+'  (equal distance to A, B, C).','H = ('+f1(H[0])+', '+f1(H[1])+')  (altitudes meet).','I = ('+f1(I[0])+', '+f1(I[1])+'),  r = '+f1(r)+'  (inradius = Area / s).'])[k];
  }}
];
scenes.sort((x,y)=>x.tab-y.tab);

// ---------- Tab table: which animations belong to which app tab ----------
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

// ---------- Styles (namespaced with cga-) ----------
const css = `
.cga-fab{position:fixed;right:20px;bottom:20px;z-index:9000;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 20px;background:#1e6f9f;color:#fff;font:600 1rem 'Segoe UI',Roboto,system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 24px -8px rgba(15,59,94,.6)}
.cga-fab:hover{background:#175a82}
.cga-fab:focus-visible,.cga-drawer button:focus-visible,.cga-drawer input:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}
.cga-drawer{position:fixed;top:0;right:0;bottom:0;width:min(520px,100vw);z-index:9100;background:#f3f6fb;box-shadow:-12px 0 32px rgba(15,59,94,.25);display:flex;flex-direction:column;transform:translateX(105%);transition:transform .25s ease;font-family:'Segoe UI',Roboto,system-ui,sans-serif;color:#14213d}
.cga-drawer.open{transform:none}
.cga-head{display:flex;flex-direction:column;gap:10px;padding:14px 16px;background:#fff;border-bottom:1px solid #d9e1ef}
.cga-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cga-top h2{margin:0;font-size:1.1rem}
.cga-x{border:0;background:#e9eefb;color:#14213d;width:34px;height:34px;border-radius:50%;font-size:1.1rem;cursor:pointer}
.cga-seg{display:flex;background:#e9eefb;border-radius:10px;padding:3px}
.cga-seg button{flex:1;border:0;background:transparent;color:#56627f;font:600 .88rem 'Segoe UI',Roboto,system-ui,sans-serif;padding:8px 10px;border-radius:8px;cursor:pointer}
.cga-seg button[aria-pressed="true"]{background:#14213d;color:#fff}
.cga-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.cga-card{background:#fff;border:1px solid #d9e1ef;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
.cga-card h3{margin:0;font-size:1.05rem}
.cga-chip{align-self:flex-start;font:700 .7rem 'Segoe UI',Roboto,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#e9eefb;color:#56627f;padding:3px 8px;border-radius:5px}
.cga-stage{border:1px solid #d9e1ef;border-radius:10px;overflow:hidden;background:#fbfcff}
.cga-stage canvas{display:block;width:100%;height:auto;aspect-ratio:480/340}
.cga-ctl{display:flex;gap:10px;align-items:center}
.cga-ctl button{min-width:72px;padding:7px 12px;border-radius:8px;border:1px solid #bdc9d6;background:#fff;color:#14213d;font:600 .85rem 'Segoe UI',Roboto,system-ui,sans-serif;cursor:pointer}
.cga-ctl input{flex:1;min-width:0;accent-color:#e2540b}
.cga-step{margin:0;font-weight:600;min-height:3em}
.cga-formula{margin:0;font:500 .84rem ui-monospace,Menlo,Consolas,monospace;background:#e9eefb;border-radius:8px;padding:8px 10px;overflow-wrap:anywhere}
.cga-note{margin:0;color:#56627f;font-size:.88rem}
@media (prefers-reduced-motion:reduce){.cga-drawer{transition:none}}
`;
const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

// ---------- DOM ----------
let level = 'school';
try { level = localStorage.getItem('cgaLevel') === 'inter' ? 'inter' : 'school'; } catch (e) {}

const fab = document.createElement('button');
fab.className = 'cga-fab'; fab.type = 'button'; fab.setAttribute('aria-expanded', 'false');
fab.innerHTML = '<span aria-hidden="true">▶</span> Explain this topic';

const drawer = document.createElement('aside');
drawer.className = 'cga-drawer'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', 'Visual explainer'); drawer.setAttribute('aria-hidden', 'true');
drawer.innerHTML =
  '<div class="cga-head"><div class="cga-top"><h2 id="cgaTitle">Visual explainer</h2><button class="cga-x" type="button" aria-label="Close explainer">✕</button></div>' +
  '<div class="cga-seg" role="group" aria-label="Student level"><button type="button" data-lv="school">School · Class 8–10</button><button type="button" data-lv="inter">Intermediate · Class 11–12</button></div></div>' +
  '<div class="cga-body" id="cgaBody"></div>';
document.body.appendChild(drawer); document.body.appendChild(fab);

const bodyEl = drawer.querySelector('#cgaBody'), titleEl = drawer.querySelector('#cgaTitle');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let cards = [], open = false, currentTab = null;

function activeTabId() {
  const t = document.querySelector('.tab-bar .tab.active') || document.querySelector('.tab.active');
  return t ? t.id : 'tabCoordinateGeometry';
}

function build() {
  const id = activeTabId(); if (id === currentTab && cards.length) return;
  currentTab = id; cards = []; bodyEl.textContent = '';
  const info = TAB_INFO[id] || TAB_INFO.tabCoordinateGeometry;
  titleEl.textContent = 'Visual explainer · ' + info.name;
  scenes.filter(s => s.tab === info.n).forEach(sc => {
    const el = document.createElement('article'); el.className = 'cga-card';
    const h = document.createElement('h3'); h.textContent = sc.title;
    const chip = document.createElement('span'); chip.className = 'cga-chip'; chip.textContent = sc.tag;
    const stage = document.createElement('div'); stage.className = 'cga-stage';
    const cv = document.createElement('canvas'); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Animation: ' + sc.title); stage.appendChild(cv);
    const ctl = document.createElement('div'); ctl.className = 'cga-ctl';
    const pp = document.createElement('button'); pp.type = 'button'; pp.textContent = reduce ? 'Play' : 'Pause';
    const rg = document.createElement('input'); rg.type = 'range'; rg.min = 0; rg.max = 1000; rg.value = 0; rg.setAttribute('aria-label', 'Scrub ' + sc.title);
    ctl.append(pp, rg);
    const st = document.createElement('p'); st.className = 'cga-step'; st.setAttribute('aria-live', 'off');
    const fm = document.createElement('p'); fm.className = 'cga-formula';
    el.append(chip, h, stage, ctl, st, fm); bodyEl.appendChild(el);
    const cd = { sc, g: Graph(cv, sc.b), pp, rg, st, fm, p: reduce ? 1 : 0, playing: !reduce, dirty: true, last: '' };
    pp.addEventListener('click', () => { if (!cd.playing && cd.p >= 1) cd.p = 0; cd.playing = !cd.playing; pp.textContent = cd.playing ? 'Pause' : 'Play'; cd.dirty = true; });
    rg.addEventListener('input', () => { cd.p = rg.value / 1000; cd.playing = false; pp.textContent = 'Play'; cd.dirty = true; });
    cards.push(cd);
  });
  const note = document.createElement('p'); note.className = 'cga-note';
  note.textContent = 'Blue is across (x), green is up (y), orange is the answer or the moving point. Press Play, or drag the slider to stop on any step.';
  bodyEl.appendChild(note);
  bodyEl.scrollTop = 0;
}

function render(cd) {
  const tt = Math.min(1, cd.p), g = cd.g;
  g.begin(); if (!cd.sc.noGrid) g.grid();
  const s = cd.sc.draw(g, tt, C, level);
  if (s !== cd.last) { cd.st.textContent = s; cd.last = s; }
  cd.fm.textContent = level === 'school' ? cd.sc.f[0] : cd.sc.f[1];
  cd.rg.value = Math.round(tt * 1000); cd.dirty = false;
}

let last = performance.now(), raf = 0;
function frame(now) {
  const dt = Math.min(now - last, 100); last = now;
  cards.forEach(cd => {
    if (cd.playing) { cd.p += dt / 9500; if (cd.p >= 1.2) cd.p = 0; render(cd); }
    else if (cd.dirty) render(cd);
  });
  raf = open ? requestAnimationFrame(frame) : 0;
}

function setLevel(l) {
  level = l; try { localStorage.setItem('cgaLevel', l); } catch (e) {}
  drawer.querySelectorAll('.cga-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lv === l)));
  cards.forEach(cd => cd.dirty = true);
}

function openDrawer() {
  build(); open = true; drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); fab.setAttribute('aria-expanded', 'true');
  setLevel(level); last = performance.now(); if (!raf) raf = requestAnimationFrame(frame);
  drawer.querySelector('.cga-x').focus();
}
function closeDrawer() {
  open = false; drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); fab.setAttribute('aria-expanded', 'false'); fab.focus();
}

fab.addEventListener('click', () => (open ? closeDrawer() : openDrawer()));
drawer.querySelector('.cga-x').addEventListener('click', closeDrawer);
drawer.querySelectorAll('.cga-seg button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.lv)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeDrawer(); });

// Refresh the cards whenever the user switches to another tab.
const bar = document.querySelector('.tab-bar');
if (bar) new MutationObserver(() => { if (open) build(); else currentTab = null; }).observe(bar, { attributes: true, subtree: true, attributeFilter: ['class'] });
setLevel(level);
})();
