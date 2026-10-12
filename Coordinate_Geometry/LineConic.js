// ==================== LINE & CONIC INTERACTION (BASIC) ====================
// File: LineConic.js
// Contains functions for line-circle intersection, tangency, and chord properties

/**
 * Renders the Intersection of Line and Circle card
 * Solves simultaneous equations to find intersection points
 */
function renderLineCircleIntersectionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('lineCircleIntersectionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⭕📏</span> Intersection of Line and Circle</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Circle Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Circle Equation: x² + y² + Dx + Ey + F = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>D = <input type="number" id="circleD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="circleE" value="-6" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="circleF" value="9" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:5px;">Current: x² + y² + <span id="circleDispD">-4</span>x + <span id="circleDispE">-6</span>y + <span id="circleDispF">9</span> = 0</div>
                <div style="font-size:0.9rem;">Center: (<span id="centerX">2</span>, <span id="centerY">3</span>), Radius: <span id="radiusVal">2</span></div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line Equation: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>a = <input type="number" id="lineA" value="1" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="lineB" value="1" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="lineC" value="-2" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Current: <span id="lineEqDisp">x + y - 2 = 0</span></div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="mode-option" id="exampleSecant">Secant (2 intersections)</button>
                <button class="mode-option" id="exampleTangent">Tangent (1 intersection)</button>
                <button class="mode-option" id="exampleNoIntersect">No Intersection</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeIntersectionBtn">
            <span>⭕📏</span> Find Intersection Points
        </button>
        
        <div class="result-highlight" id="intersectionResult">
            \\( \\text{Intersection points will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> Substitute line equation into circle equation → quadratic in x (or y).<br>
            • If discriminant > 0: Two intersection points (secant)<br>
            • If discriminant = 0: One intersection point (tangent)<br>
            • If discriminant < 0: No intersection (line misses circle)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get DOM references
    const dInp = document.getElementById('circleD');
    const eInp = document.getElementById('circleE');
    const fInp = document.getElementById('circleF');
    const aInp = document.getElementById('lineA');
    const bInp = document.getElementById('lineB');
    const cInp = document.getElementById('lineC');
    const compute = document.getElementById('computeIntersectionBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('intersectionResult');
    
    // Display elements
    const circleDispD = document.getElementById('circleDispD');
    const circleDispE = document.getElementById('circleDispE');
    const circleDispF = document.getElementById('circleDispF');
    const centerXSpan = document.getElementById('centerX');
    const centerYSpan = document.getElementById('centerY');
    const radiusSpan = document.getElementById('radiusVal');
    const lineEqDisp = document.getElementById('lineEqDisp');
    
    // Example buttons
    document.getElementById('exampleSecant').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 1; bInp.value = 1; cInp.value = -2;
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('exampleTangent').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 2; bInp.value = 1; cInp.value = -7;
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('exampleNoIntersect').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 1; bInp.value = 1; cInp.value = 5;
        updateCircleDisplay();
        update();
    });
    
    function updateCircleDisplay() {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        
        circleDispD.textContent = fmt(D);
        circleDispE.textContent = fmt(E);
        circleDispF.textContent = fmt(F);
        
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        
        centerXSpan.textContent = fmt(centerX);
        centerYSpan.textContent = fmt(centerY);
        radiusSpan.textContent = fmt(Math.sqrt(Math.abs(radiusSq)));
    }
    
    function updateLineDisplay() {
        const a = parseFloat(aInp.value) || 0;
        const b = parseFloat(bInp.value) || 0;
        const c = parseFloat(cInp.value) || 0;
        lineEqDisp.textContent = `${fmt(a)}x ${b >= 0 ? '+' : '-'} ${Math.abs(fmt(b))}y ${c >= 0 ? '+' : '-'} ${Math.abs(fmt(c))} = 0`;
    }
    
    dInp.addEventListener('input', updateCircleDisplay);
    eInp.addEventListener('input', updateCircleDisplay);
    fInp.addEventListener('input', updateCircleDisplay);
    aInp.addEventListener('input', updateLineDisplay);
    bInp.addEventListener('input', updateLineDisplay);
    cInp.addEventListener('input', updateLineDisplay);
    
    function update() {
        clearErrors();
        
        try {
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            // Circle center and radius
            const centerX = -D/2;
            const centerY = -E/2;
            const radiusSq = centerX*centerX + centerY*centerY - F;
            
            if (radiusSq < -1e-10) {
                throw new Error('Invalid circle: radius² is negative');
            }
            const radius = Math.sqrt(Math.max(0, radiusSq));
            
            // Distance from center to line
            const distToLine = Math.abs(a*centerX + b*centerY + c) / Math.sqrt(a*a + b*b);
            
            // Solve intersection
            let steps = [];
            let intersectionPoints = [];
            let discriminant = 0;
            let intersectionType = '';
            
            // Choose to solve for x or y based on coefficients
            if (Math.abs(b) > Math.abs(a)) {
                // Solve for y from line: y = (-a*x - c)/b
                const slope = -a/b;
                const intercept = -c/b;
                
                steps = [
                    `📍 STEP 1: Identify circle and line`,
                    `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                    `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                    `   • Radius: r = √(${fmt(centerX)}² + ${fmt(centerY)}² - ${fmt(F)}) = √${fmt(radiusSq)} = ${fmt(radius)}`,
                    ``,
                    `📍 STEP 2: Express y in terms of x from line equation`,
                    `   • ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `   • y = (-${fmt(a)}x - ${fmt(c)})/${fmt(b)} = ${fmt(slope)}x + ${fmt(intercept)}`,
                    ``,
                    `📍 STEP 3: Substitute into circle equation`,
                    `   • x² + (${fmt(slope)}x + ${fmt(intercept)})² + ${fmt(D)}x + ${fmt(E)}(${fmt(slope)}x + ${fmt(intercept)}) + ${fmt(F)} = 0`,
                    `   • Expand and collect like terms...`
                ];
                
                // Expand: (mx + k)² = m²x² + 2mkx + k²
                const m = slope;
                const k = intercept;
                const A_coef = 1 + m*m;
                const B_coef = 2*m*k + D + E*m;
                const C_coef = k*k + E*k + F;
                
                discriminant = B_coef*B_coef - 4*A_coef*C_coef;
                
                steps.push(`   • This gives quadratic: ${fmt(A_coef)}x² + ${fmt(B_coef)}x + ${fmt(C_coef)} = 0`);
                steps.push(`   • Discriminant Δ = ${fmt(B_coef)}² - 4·${fmt(A_coef)}·${fmt(C_coef)} = ${fmt(discriminant)}`);
                
                if (discriminant > 1e-10) {
                    intersectionType = 'secant (2 intersections)';
                    const sqrtD = Math.sqrt(discriminant);
                    const x1 = (-B_coef + sqrtD) / (2*A_coef);
                    const x2 = (-B_coef - sqrtD) / (2*A_coef);
                    const y1 = m*x1 + k;
                    const y2 = m*x2 + k;
                    intersectionPoints = [{x: x1, y: y1}, {x: x2, y: y2}];
                    steps.push(`   • √Δ = ${fmt(sqrtD)}`);
                    steps.push(`   • x₁ = (${fmt(-B_coef)} + ${fmt(sqrtD)})/(2·${fmt(A_coef)}) = ${fmt(x1)}`);
                    steps.push(`   • y₁ = ${fmt(m)}·${fmt(x1)} + ${fmt(k)} = ${fmt(y1)}`);
                    steps.push(`   • x₂ = (${fmt(-B_coef)} - ${fmt(sqrtD)})/(2·${fmt(A_coef)}) = ${fmt(x2)}`);
                    steps.push(`   • y₂ = ${fmt(m)}·${fmt(x2)} + ${fmt(k)} = ${fmt(y2)}`);
                    steps.push(`   • Intersection points: P₁(${fmt(x1)}, ${fmt(y1)}), P₂(${fmt(x2)}, ${fmt(y2)})`);
                } else if (Math.abs(discriminant) < 1e-10) {
                    intersectionType = 'tangent (1 intersection)';
                    const x = -B_coef / (2*A_coef);
                    const y = m*x + k;
                    intersectionPoints = [{x: x, y: y}];
                    steps.push(`   • Δ = 0 → one intersection point (tangent)`);
                    steps.push(`   • x = -${fmt(B_coef)}/(2·${fmt(A_coef)}) = ${fmt(x)}`);
                    steps.push(`   • y = ${fmt(m)}·${fmt(x)} + ${fmt(k)} = ${fmt(y)}`);
                    steps.push(`   • Tangent point: T(${fmt(x)}, ${fmt(y)})`);
                } else {
                    intersectionType = 'no intersection';
                    steps.push(`   • Δ = ${fmt(discriminant)} < 0 → no real intersection`);
                    steps.push(`   • The line does not meet the circle`);
                }
                
            } else {
                // Solve for x from line: x = (-b*y - c)/a
                const slopeX = -b/a;
                const interceptX = -c/a;
                
                steps = [
                    `📍 STEP 1: Identify circle and line`,
                    `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                    `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                    `   • Radius: r = √(${fmt(centerX)}² + ${fmt(centerY)}² - ${fmt(F)}) = √${fmt(radiusSq)} = ${fmt(radius)}`,
                    ``,
                    `📍 STEP 2: Express x in terms of y from line equation`,
                    `   • ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `   • x = (-${fmt(b)}y - ${fmt(c)})/${fmt(a)} = ${fmt(slopeX)}y + ${fmt(interceptX)}`,
                    ``,
                    `📍 STEP 3: Substitute into circle equation`,
                    `   • (${fmt(slopeX)}y + ${fmt(interceptX)})² + y² + ${fmt(D)}(${fmt(slopeX)}y + ${fmt(interceptX)}) + ${fmt(E)}y + ${fmt(F)} = 0`,
                    `   • Expand and collect like terms...`
                ];
                
                const m = slopeX;
                const k = interceptX;
                const A_coef = 1 + m*m;
                const B_coef = 2*m*k + D*m + E;
                const C_coef = k*k + D*k + F;
                
                discriminant = B_coef*B_coef - 4*A_coef*C_coef;
                
                steps.push(`   • This gives quadratic: ${fmt(A_coef)}y² + ${fmt(B_coef)}y + ${fmt(C_coef)} = 0`);
                steps.push(`   • Discriminant Δ = ${fmt(B_coef)}² - 4·${fmt(A_coef)}·${fmt(C_coef)} = ${fmt(discriminant)}`);
                
                if (discriminant > 1e-10) {
                    intersectionType = 'secant (2 intersections)';
                    const sqrtD = Math.sqrt(discriminant);
                    const y1 = (-B_coef + sqrtD) / (2*A_coef);
                    const y2 = (-B_coef - sqrtD) / (2*A_coef);
                    const x1 = m*y1 + k;
                    const x2 = m*y2 + k;
                    intersectionPoints = [{x: x1, y: y1}, {x: x2, y: y2}];
                    steps.push(`   • √Δ = ${fmt(sqrtD)}`);
                    steps.push(`   • y₁ = (${fmt(-B_coef)} + ${fmt(sqrtD)})/(2·${fmt(A_coef)}) = ${fmt(y1)}`);
                    steps.push(`   • x₁ = ${fmt(m)}·${fmt(y1)} + ${fmt(k)} = ${fmt(x1)}`);
                    steps.push(`   • y₂ = (${fmt(-B_coef)} - ${fmt(sqrtD)})/(2·${fmt(A_coef)}) = ${fmt(y2)}`);
                    steps.push(`   • x₂ = ${fmt(m)}·${fmt(y2)} + ${fmt(k)} = ${fmt(x2)}`);
                    steps.push(`   • Intersection points: P₁(${fmt(x1)}, ${fmt(y1)}), P₂(${fmt(x2)}, ${fmt(y2)})`);
                } else if (Math.abs(discriminant) < 1e-10) {
                    intersectionType = 'tangent (1 intersection)';
                    const y = -B_coef / (2*A_coef);
                    const x = m*y + k;
                    intersectionPoints = [{x: x, y: y}];
                    steps.push(`   • Δ = 0 → one intersection point (tangent)`);
                    steps.push(`   • y = -${fmt(B_coef)}/(2·${fmt(A_coef)}) = ${fmt(y)}`);
                    steps.push(`   • x = ${fmt(m)}·${fmt(y)} + ${fmt(k)} = ${fmt(x)}`);
                    steps.push(`   • Tangent point: T(${fmt(x)}, ${fmt(y)})`);
                } else {
                    intersectionType = 'no intersection';
                    steps.push(`   • Δ = ${fmt(discriminant)} < 0 → no real intersection`);
                    steps.push(`   • The line does not meet the circle`);
                }
            }
            
            steps.push(``);
            steps.push(`📍 STEP 4: Geometric interpretation`);
            steps.push(`   • Distance from center to line = ${fmt(distToLine)}`);
            steps.push(`   • Radius = ${fmt(radius)}`);
            steps.push(`   • Since ${distToLine < radius - 1e-10 ? 'distance < radius → secant' : 
                                 Math.abs(distToLine - radius) < 1e-10 ? 'distance = radius → tangent' : 
                                 'distance > radius → no intersection'}`);
            
            // Draw graph
            const minX = centerX - radius - 2;
            const maxX = centerX + radius + 2;
            const minY = centerY - radius - 2;
            const maxY = centerY + radius + 2;
            
            // Generate circle points
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: centerX + radius * Math.cos(t),
                    y: centerY + radius * Math.sin(t)
                });
            }
            
            // Generate line points
            let linePoints = [];
            if (Math.abs(b) > 1e-10) {
                const m = -a/b;
                const intercept = -c/b;
                linePoints = [
                    {x: minX, y: m*minX + intercept},
                    {x: maxX, y: m*maxX + intercept}
                ];
            } else {
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            const datasets = [
                {
                    label: 'Circle',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add intersection points
            if (intersectionPoints.length > 0) {
                datasets.push({
                    label: `Intersection Points (${intersectionType})`,
                    data: intersectionPoints,
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                });
            }
            
            // Add center point
            datasets.push({
                label: 'Center',
                data: [{x: centerX, y: centerY}],
                backgroundColor: '#3498db',
                pointRadius: 8,
                pointStyle: 'circle',
                showLine: false
            });
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            // Display result
            let resultText = '';
            if (intersectionPoints.length === 2) {
                resultText = `Intersection points:<br>
                    P₁(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    P₂(${fmt(intersectionPoints[1].x)}, ${fmt(intersectionPoints[1].y)})<br>
                    <span style="font-size:0.9rem;">Line is a SECANT (cuts circle at 2 points)</span>`;
            } else if (intersectionPoints.length === 1) {
                resultText = `Tangent point:<br>
                    T(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    <span style="font-size:0.9rem;">Line is TANGENT to the circle</span>`;
            } else {
                resultText = `No intersection points<br>
                    <span style="font-size:0.9rem;">Line does not intersect the circle</span>`;
            }
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [dInp, eInp, fInp, aInp, bInp, cInp]);
        }
    }
    
    updateCircleDisplay();
    updateLineDisplay();
    compute.addEventListener('click', update);
    [dInp, eInp, fInp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Condition for Tangency to Circle card
 * Line is tangent to circle if perpendicular distance from center = radius
 */
function renderTangencyConditionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('tangencyConditionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔵📏</span> Condition for Tangency to Circle</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Tangency Condition: } \\frac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}} = r \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Circle Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Circle Equation: x² + y² + Dx + Ey + F = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>D = <input type="number" id="tangCircleD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="tangCircleE" value="-6" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="tangCircleF" value="9" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Center: (<span id="tangCenterX">2</span>, <span id="tangCenterY">3</span>), Radius: <span id="tangRadius">2</span></div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line Equation: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>a = <input type="number" id="tangLineA" value="2" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="tangLineB" value="1" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="tangLineC" value="-7" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Find c for Tangency -->
            <div class="point-box" style="width:100%;">
                <label>Find constant term c to make line tangent (keep a, b fixed)</label>
                <button class="mode-option" id="findCForTangency">Find c for tangency</button>
                <div style="margin-top:10px;">c = <span id="requiredC">?</span> makes line tangent</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeTangencyBtn">
            <span>🔵📏</span> Check Tangency
        </button>
        
        <div class="result-highlight" id="tangencyResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Tangency Condition:</strong> A line is tangent to a circle if the perpendicular distance from the circle's center to the line equals the radius.<br>
            • For line ax + by + c = 0, distance = |ax₀ + by₀ + c|/√(a² + b²)<br>
            • Setting distance = r gives c = -(ax₀ + by₀) ± r√(a² + b²)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const dInp = document.getElementById('tangCircleD');
    const eInp = document.getElementById('tangCircleE');
    const fInp = document.getElementById('tangCircleF');
    const aInp = document.getElementById('tangLineA');
    const bInp = document.getElementById('tangLineB');
    const cInp = document.getElementById('tangLineC');
    const compute = document.getElementById('computeTangencyBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('tangencyResult');
    const centerXSpan = document.getElementById('tangCenterX');
    const centerYSpan = document.getElementById('tangCenterY');
    const radiusSpan = document.getElementById('tangRadius');
    const requiredCSpan = document.getElementById('requiredC');
    
    function updateCircleDisplay() {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        const radius = Math.sqrt(Math.max(0, radiusSq));
        centerXSpan.textContent = fmt(centerX);
        centerYSpan.textContent = fmt(centerY);
        radiusSpan.textContent = fmt(radius);
        return { centerX, centerY, radius };
    }
    
    dInp.addEventListener('input', updateCircleDisplay);
    eInp.addEventListener('input', updateCircleDisplay);
    fInp.addEventListener('input', updateCircleDisplay);
    
    // Find c for tangency
    document.getElementById('findCForTangency').addEventListener('click', () => {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        const a = parseFloat(aInp.value) || 0;
        const b = parseFloat(bInp.value) || 0;
        
        if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
            requiredCSpan.textContent = 'Error: a and b cannot both be zero';
            return;
        }
        
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        const radius = Math.sqrt(Math.max(0, radiusSq));
        const norm = Math.sqrt(a*a + b*b);
        
        const c1 = -(a*centerX + b*centerY) + radius * norm;
        const c2 = -(a*centerX + b*centerY) - radius * norm;
        
        requiredCSpan.innerHTML = `${fmt(c1)} or ${fmt(c2)}`;
        cInp.value = c1;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            const centerX = -D/2;
            const centerY = -E/2;
            const radiusSq = centerX*centerX + centerY*centerY - F;
            
            if (radiusSq < -1e-10) {
                throw new Error('Invalid circle: radius² is negative');
            }
            const radius = Math.sqrt(Math.max(0, radiusSq));
            
            const distance = Math.abs(a*centerX + b*centerY + c) / Math.sqrt(a*a + b*b);
            const isTangent = Math.abs(distance - radius) < 1e-10;
            const isSecant = distance < radius - 1e-10;
            const isNoIntersect = distance > radius + 1e-10;
            
            let resultText = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Identify circle and line`,
                `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                `   • Radius: r = √(${fmt(centerX)}² + ${fmt(centerY)}² - ${fmt(F)}) = √${fmt(radiusSq)} = ${fmt(radius)}`,
                ``,
                `📍 STEP 2: Find perpendicular distance from center to line`,
                `   • Distance d = |ax₀ + by₀ + c|/√(a² + b²)`,
                `   • d = |${fmt(a)}·${fmt(centerX)} + ${fmt(b)}·${fmt(centerY)} + ${fmt(c)}|/√(${fmt(a*a)} + ${fmt(b*b)})`,
                `   • Numerator = |${fmt(a*centerX + b*centerY + c)}| = ${fmt(Math.abs(a*centerX + b*centerY + c))}`,
                `   • Denominator = √${fmt(a*a + b*b)} = ${fmt(Math.sqrt(a*a + b*b))}`,
                `   • d = ${fmt(distance)}`,
                ``,
                `📍 STEP 3: Apply tangency condition`,
                `   • For tangency: distance = radius`,
                `   • ${fmt(distance)} ${Math.abs(distance - radius) < 1e-10 ? '=' : '≠'} ${fmt(radius)}`,
                `   • Therefore, the line is ${isTangent ? 'TANGENT' : isSecant ? 'SECANT (cuts circle at 2 points)' : 'NOT INTERSECTING the circle'}`
            ];
            
            if (isTangent) {
                resultText = `✅ The line is TANGENT to the circle!<br>
                    Distance = ${fmt(distance)} = Radius = ${fmt(radius)}`;
            } else if (isSecant) {
                resultText = `❌ The line is a SECANT (cuts circle at 2 points)<br>
                    Distance = ${fmt(distance)} < Radius = ${fmt(radius)}`;
            } else {
                resultText = `❌ The line does NOT intersect the circle<br>
                    Distance = ${fmt(distance)} > Radius = ${fmt(radius)}`;
            }
            
            // Draw graph
            const minX = centerX - radius - 2;
            const maxX = centerX + radius + 2;
            const minY = centerY - radius - 2;
            const maxY = centerY + radius + 2;
            
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: centerX + radius * Math.cos(t),
                    y: centerY + radius * Math.sin(t)
                });
            }
            
            let linePoints = [];
            if (Math.abs(b) > 1e-10) {
                const m = -a/b;
                const intercept = -c/b;
                linePoints = [
                    {x: minX, y: m*minX + intercept},
                    {x: maxX, y: m*maxX + intercept}
                ];
            } else {
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            const datasets = [
                {
                    label: 'Circle',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: isTangent ? '#27ae60' : '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Center',
                    data: [{x: centerX, y: centerY}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = resultText;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    updateCircleDisplay();
    compute.addEventListener('click', update);
    [dInp, eInp, fInp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Equation of Tangent to a Circle in Slope Form card
 * Tangent to circle x² + y² = r² with slope m: y = mx ± r√(1+m²)
 */
function renderTangentSlopeFormCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('tangentSlopeFormBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐⭕</span> Equation of Tangent to Circle in Slope Form</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 = r^2 \\)</div>
        <div class="formula-badge">\\( \\text{Tangent with slope m: } y = mx \\pm r\\sqrt{1+m^2} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Circle: x² + y² = r²</label>
                <div>r = <input type="number" id="tangentR" value="3" step="any" style="width:100px;"></div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Slope m =</label>
                <div><input type="number" id="tangentM" value="2" step="any" style="width:100px;"></div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>OR find slope given y-intercept c</label>
                <div style="display:flex; gap:10px;">
                    <div>c = <input type="number" id="tangentC" value="6.708" step="any" style="width:100px;"></div>
                    <button class="mode-option" id="findSlopeFromIntercept">Find m for given c</button>
                </div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeTangentSlopeBtn">
            <span>📐⭕</span> Find Tangent Equation
        </button>
        
        <div class="result-highlight" id="tangentSlopeResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Slope Form of Tangent to Circle x² + y² = r²:</strong><br>
            • Equation: y = mx ± r√(1+m²)<br>
            • For a given slope m, there are two parallel tangents<br>
            • The distance from center to line = r (tangency condition)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const rInp = document.getElementById('tangentR');
    const mInp = document.getElementById('tangentM');
    const cInp = document.getElementById('tangentC');
    const compute = document.getElementById('computeTangentSlopeBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('tangentSlopeResult');
    
    function update() {
        clearErrors();
        
        try {
            const r = validatePositiveNumber(rInp.value, 'r', false);
            const m = validateNumber(mInp.value, 'm');
            
            const c1 = r * Math.sqrt(1 + m*m);
            const c2 = -r * Math.sqrt(1 + m*m);
            
            const eq1 = `y = ${fmt(m)}x + ${fmt(c1)}`;
            const eq2 = `y = ${fmt(m)}x + ${fmt(c2)}`;
            
            const steps = [
                `📍 STEP 1: Given circle x² + y² = ${fmt(r)}²`,
                `   • Center at origin (0, 0)`,
                `   • Radius r = ${fmt(r)}`,
                ``,
                `📍 STEP 2: Tangency condition for line y = mx + c`,
                `   • Distance from origin to line = |c|/√(1 + m²)`,
                `   • For tangency, distance = r`,
                `   • Therefore, |c|/√(1 + m²) = r`,
                ``,
                `📍 STEP 3: Solve for c`,
                `   • |c| = r√(1 + m²) = ${fmt(r)}·√(1 + ${fmt(m)}²) = ${fmt(r)}·√${fmt(1 + m*m)} = ${fmt(r)}·${fmt(Math.sqrt(1 + m*m))} = ${fmt(c1)}`,
                `   • c = ±${fmt(c1)}`,
                ``,
                `📍 STEP 4: Tangent equations`,
                `   • Tangent 1: y = ${fmt(m)}x + ${fmt(c1)}`,
                `   • Tangent 2: y = ${fmt(m)}x + ${fmt(c2)}`,
                ``,
                `📍 STEP 5: Verification`,
                `   • Distance from origin to line 1: |${fmt(c1)}|/√(1 + ${fmt(m)}²) = ${fmt(c1)}/${fmt(Math.sqrt(1 + m*m))} = ${fmt(r)} ✓`,
                `   • Distance from origin to line 2: |${fmt(c2)}|/√(1 + ${fmt(m)}²) = ${fmt(c1)}/${fmt(Math.sqrt(1 + m*m))} = ${fmt(r)} ✓`
            ];
            
            // Draw graph
            const minX = -r - 2;
            const maxX = r + 2;
            const minY = -r - 2;
            const maxY = r + 2;
            
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: r * Math.cos(t),
                    y: r * Math.sin(t)
                });
            }
            
            const line1Points = [
                {x: minX, y: m*minX + c1},
                {x: maxX, y: m*maxX + c1}
            ];
            const line2Points = [
                {x: minX, y: m*minX + c2},
                {x: maxX, y: m*maxX + c2}
            ];
            
            const datasets = [
                {
                    label: 'Circle x² + y² = r²',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: `Tangent 1: ${fmt(m)}x + ${fmt(c1)}`,
                    data: line1Points,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: `Tangent 2: ${fmt(m)}x + ${fmt(c2)}`,
                    data: line2Points,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Center (0,0)',
                    data: [{x: 0, y: 0}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = `\\( ${eq1} \\)<br>\\( ${eq2} \\)`;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [rInp, mInp]);
        }
    }
    
    // Find slope from y-intercept
    document.getElementById('findSlopeFromIntercept').addEventListener('click', () => {
        const r = parseFloat(rInp.value) || 0;
        const c = parseFloat(cInp.value) || 0;
        
        if (r <= 0) {
            showError('Radius must be positive', [rInp]);
            return;
        }
        
        if (Math.abs(c) < r) {
            showError(`For tangency, |c| must be ≥ r. Current |c| = ${Math.abs(c)} < ${r}`, [cInp]);
            return;
        }
        
        const mSq = (c*c)/(r*r) - 1;
        if (mSq < 0) {
            showError('No real slope exists for this c value', [cInp]);
            return;
        }
        
        const m1 = Math.sqrt(mSq);
        const m2 = -Math.sqrt(mSq);
        
        mInp.value = m1;
        update();
        
        // Show both possible slopes
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('tangentSlopeResult');
        stepsDiv.innerHTML = `
            <div class="step-row">
                <span class="step-marker">📐</span>
                <span class="step-text">For c = ${fmt(c)}, r = ${fmt(r)}:<br>
                m = ±√(c²/r² - 1) = ±√(${fmt(c*c)}/${fmt(r*r)} - 1) = ±${fmt(m1)}</span>
            </div>`;
        resultDiv.innerHTML = `Slopes: m = ${fmt(m1)} or m = ${fmt(m2)}<br>Choose one and click "Find Tangent Equation"`;
    });
    
    compute.addEventListener('click', update);
    [rInp, mInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Length of Intercept Cut by Circle on a Line card
 */
/**
 * Renders the Length of Intercept Cut by Circle on a Line card
 */
function renderInterceptLengthCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('interceptLengthBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏⭕</span> Length of Intercept Cut by Circle on a Line</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Intercept length} = 2\\sqrt{r^2 - d^2} \\) where d = distance from center to line</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Circle: x² + y² + Dx + Ey + F = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>D = <input type="number" id="intCircleD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="intCircleE" value="-6" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="intCircleF" value="9" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Center: (<span id="intCenterX">2</span>, <span id="intCenterY">3</span>), Radius: <span id="intRadius">2</span></div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>a = <input type="number" id="intLineA" value="1" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="intLineB" value="1" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="intLineC" value="-2" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:10px;">
                <button class="mode-option" id="exampleSecantIntercept">Secant Example (2 intersections)</button>
                <button class="mode-option" id="exampleTangentIntercept">Tangent Example (touches)</button>
                <button class="mode-option" id="exampleNoIntercept">No Intersection Example</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeInterceptLengthBtn">
            <span>📏⭕</span> Find Intercept Length
        </button>
        
        <div class="result-highlight" id="interceptLengthResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Intercept Length Formula:</strong> L = 2√(r² - d²), where d = distance from circle center to line.<br>
            • If d < r: line cuts circle at 2 points (chord length = L)<br>
            • If d = r: line is tangent (L = 0)<br>
            • If d > r: no intersection (no real intercept)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const dInp = document.getElementById('intCircleD');
    const eInp = document.getElementById('intCircleE');
    const fInp = document.getElementById('intCircleF');
    const aInp = document.getElementById('intLineA');
    const bInp = document.getElementById('intLineB');
    const cInp = document.getElementById('intLineC');
    const compute = document.getElementById('computeInterceptLengthBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('interceptLengthResult');
    const centerXSpan = document.getElementById('intCenterX');
    const centerYSpan = document.getElementById('intCenterY');
    const radiusSpan = document.getElementById('intRadius');
    
    // Example buttons
    document.getElementById('exampleSecantIntercept').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 1; bInp.value = 1; cInp.value = -2;
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('exampleTangentIntercept').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 2; bInp.value = 1; cInp.value = -7;
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('exampleNoIntercept').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        aInp.value = 1; bInp.value = 1; cInp.value = 5;
        updateCircleDisplay();
        update();
    });
    
    function updateCircleDisplay() {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        const radius = Math.sqrt(Math.max(0, radiusSq));
        centerXSpan.textContent = fmt(centerX);
        centerYSpan.textContent = fmt(centerY);
        radiusSpan.textContent = fmt(radius);
        return { centerX, centerY, radius, radiusSq };
    }
    
    dInp.addEventListener('input', updateCircleDisplay);
    eInp.addEventListener('input', updateCircleDisplay);
    fInp.addEventListener('input', updateCircleDisplay);
    
    function update() {
        clearErrors();
        
        try {
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            const centerX = -D/2;
            const centerY = -E/2;
            const radiusSq = centerX*centerX + centerY*centerY - F;
            
            if (radiusSq < -1e-10) {
                throw new Error('Invalid circle: radius² is negative');
            }
            const radius = Math.sqrt(Math.max(0, radiusSq));
            
            // Calculate numerator for distance formula
            const numeratorRaw = a*centerX + b*centerY + c;
            const numerator = Math.abs(numeratorRaw);
            const denominator = Math.sqrt(a*a + b*b);
            const distance = numerator / denominator;
            
            let interceptLength = 0;
            let resultText = '';
            let steps = [];
            
            // COMMON STEP 1 & 2 for all cases - show HOW distance is calculated
            const stepsCommon = [
                `📍 STEP 1: Identify circle and line`,
                `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                `   • Radius: r = √(${fmt(centerX)}² + ${fmt(centerY)}² - ${fmt(F)})`,
                `   • r = √(${fmt(centerX*centerX)} + ${fmt(centerY*centerY)} - ${fmt(F)})`,
                `   • r = √${fmt(radiusSq)} = ${fmt(radius)}`,
                ``,
                `📍 STEP 2: Calculate distance from center to line`,
                `   • Distance formula: d = |ax₀ + by₀ + c| / √(a² + b²)`,
                `   • Substitute values:`,
                `   • Numerator = |${fmt(a)}·${fmt(centerX)} + ${fmt(b)}·${fmt(centerY)} + ${fmt(c)}|`,
                `   • = |${fmt(a*centerX)} + ${fmt(b*centerY)} + ${fmt(c)}|`,
                `   • = |${fmt(a*centerX + b*centerY)} + ${fmt(c)}|`,
                `   • = |${fmt(a*centerX + b*centerY + c)}|`,
                `   • = |${fmt(numeratorRaw)}| = ${fmt(numerator)}`,
                `   • Denominator = √(${fmt(a)}² + ${fmt(b)}²) = √(${fmt(a*a)} + ${fmt(b*b)}) = √${fmt(a*a + b*b)} = ${fmt(denominator)}`,
                `   • d = ${fmt(numerator)} / ${fmt(denominator)} = ${fmt(distance)}`
            ];
            
            if (distance < radius - 1e-10) {
                // SECANT CASE - line cuts circle at 2 points
                interceptLength = 2 * Math.sqrt(radius*radius - distance*distance);
                resultText = `✅ Line cuts circle at two points (secant)<br>
                    Chord length = ${fmt(interceptLength)}`;
                
                steps = [
                    ...stepsCommon,
                    ``,
                    `📍 STEP 3: Compare distance with radius`,
                    `   • d = ${fmt(distance)}`,
                    `   • r = ${fmt(radius)}`,
                    `   • Since d < r (${fmt(distance)} < ${fmt(radius)}), the line is a SECANT (cuts circle at 2 points)`,
                    ``,
                    `📍 STEP 4: Calculate chord (intercept) length`,
                    `   • Formula: L = 2√(r² - d²)`,
                    `   • r² = ${fmt(radius)}² = ${fmt(radius*radius)}`,
                    `   • d² = ${fmt(distance)}² = ${fmt(distance*distance)}`,
                    `   • r² - d² = ${fmt(radius*radius)} - ${fmt(distance*distance)} = ${fmt(radius*radius - distance*distance)}`,
                    `   • √(r² - d²) = √${fmt(radius*radius - distance*distance)} = ${fmt(Math.sqrt(radius*radius - distance*distance))}`,
                    `   • L = 2 × ${fmt(Math.sqrt(radius*radius - distance*distance))} = ${fmt(interceptLength)}`
                ];
                
            } else if (Math.abs(distance - radius) < 1e-10) {
                // TANGENT CASE - line touches circle at 1 point
                interceptLength = 0;
                resultText = `📌 Line is TANGENT to the circle<br>
                    Chord length = 0 (touches at exactly one point)`;
                
                steps = [
                    ...stepsCommon,
                    ``,
                    `📍 STEP 3: Compare distance with radius`,
                    `   • d = ${fmt(distance)}`,
                    `   • r = ${fmt(radius)}`,
                    `   • Since d = r (${fmt(distance)} = ${fmt(radius)}), the line is TANGENT to the circle`,
                    ``,
                    `📍 STEP 4: Intercept length for tangent`,
                    `   • For a tangent line, the chord length is 0 (touches at exactly one point)`,
                    `   • L = 0`
                ];
                
            } else {
                // NO INTERSECTION CASE - line misses the circle
                interceptLength = 0;
                resultText = `❌ Line does NOT intersect the circle<br>
                    Distance = ${fmt(distance)} > Radius = ${fmt(radius)}`;
                
                steps = [
                    ...stepsCommon,
                    ``,
                    `📍 STEP 3: Compare distance with radius`,
                    `   • d = ${fmt(distance)}`,
                    `   • r = ${fmt(radius)}`,
                    `   • Since d > r (${fmt(distance)} > ${fmt(radius)}), the line does NOT intersect the circle`,
                    ``,
                    `📍 STEP 4: Intercept length`,
                    `   • No real intersection points exist`,
                    `   • Therefore, no real intercept length`
                ];
            }
            
            // Draw graph
            const minX = centerX - radius - 2;
            const maxX = centerX + radius + 2;
            const minY = centerY - radius - 2;
            const maxY = centerY + radius + 2;
            
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: centerX + radius * Math.cos(t),
                    y: centerY + radius * Math.sin(t)
                });
            }
            
            let linePoints = [];
            if (Math.abs(b) > 1e-10) {
                const m = -a/b;
                const lineIntercept = -c/b;
                linePoints = [
                    {x: minX, y: m*minX + lineIntercept},
                    {x: maxX, y: m*maxX + lineIntercept}
                ];
            } else {
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            // Determine line color based on intersection type
            let lineColor;
            if (distance < radius - 1e-10) lineColor = '#27ae60';  // Green for secant
            else if (Math.abs(distance - radius) < 1e-10) lineColor = '#f39c12';  // Orange for tangent
            else lineColor = '#d44c2f';  // Red for no intersection
            
            const datasets = [
                {
                    label: 'Circle',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: `Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: lineColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Center',
                    data: [{x: centerX, y: centerY}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = resultText;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [dInp, eInp, fInp, aInp, bInp, cInp]);
        }
    }
    
    updateCircleDisplay();
    compute.addEventListener('click', update);
    [dInp, eInp, fInp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Chord of Contact from an External Point to a Circle card
 */
function renderChordOfContactCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('chordOfContactBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔗⭕</span> Chord of Contact from External Point to Circle</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{External point: } P(x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Chord of contact equation: } T = 0 \\)</div>
        <div class="formula-badge">\\( T: xx_1 + yy_1 + \\frac{D}{2}(x + x_1) + \\frac{E}{2}(y + y_1) + F = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Circle: x² + y² + Dx + Ey + F = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>D = <input type="number" id="chordCircleD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="chordCircleE" value="-6" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="chordCircleF" value="9" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Center: (<span id="chordCenterX">2</span>, <span id="chordCenterY">3</span>), Radius: <span id="chordRadius">2</span></div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>External Point P(x₁, y₁)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x₁ = <input type="number" id="chordPx" value="5" step="any" style="width:80px;"></div>
                    <div>y₁ = <input type="number" id="chordPy" value="6" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="mode-option" id="exampleExternal">External Point Example</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeChordBtn">
            <span>🔗⭕</span> Find Chord of Contact
        </button>
        
        <div class="result-highlight" id="chordResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Chord of Contact:</strong> From an external point P(x₁,y₁) to a circle, the chord joining the points of contact of the two tangents from P.<br>
            • Equation: T = 0, where T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F<br>
            • For circle x² + y² = r², chord of contact is xx₁ + yy₁ = r²
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const dInp = document.getElementById('chordCircleD');
    const eInp = document.getElementById('chordCircleE');
    const fInp = document.getElementById('chordCircleF');
    const pxInp = document.getElementById('chordPx');
    const pyInp = document.getElementById('chordPy');
    const compute = document.getElementById('computeChordBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('chordResult');
    const centerXSpan = document.getElementById('chordCenterX');
    const centerYSpan = document.getElementById('chordCenterY');
    const radiusSpan = document.getElementById('chordRadius');
    
    function updateCircleDisplay() {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        const radius = Math.sqrt(Math.max(0, radiusSq));
        centerXSpan.textContent = fmt(centerX);
        centerYSpan.textContent = fmt(centerY);
        radiusSpan.textContent = fmt(radius);
        return { centerX, centerY, radius, radiusSq };
    }
    
    dInp.addEventListener('input', updateCircleDisplay);
    eInp.addEventListener('input', updateCircleDisplay);
    fInp.addEventListener('input', updateCircleDisplay);
    
    document.getElementById('exampleExternal').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        pxInp.value = 5; pyInp.value = 6;
        updateCircleDisplay();
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            const x1 = validateNumber(pxInp.value, 'x₁');
            const y1 = validateNumber(pyInp.value, 'y₁');
            
            const centerX = -D/2;
            const centerY = -E/2;
            const radiusSq = centerX*centerX + centerY*centerY - F;
            
            if (radiusSq < -1e-10) {
                throw new Error('Invalid circle: radius² is negative');
            }
            const radius = Math.sqrt(Math.max(0, radiusSq));
            
            // Check if point is external
            const distSq = (x1 - centerX)*(x1 - centerX) + (y1 - centerY)*(y1 - centerY);
            const isExternal = distSq > radiusSq + 1e-10;
            
            // Chord of contact equation: T = 0
            // T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0
            const A_coef = x1 + D/2;
            const B_coef = y1 + E/2;
            const C_coef = (D/2)*x1 + (E/2)*y1 + F;
            
            const chordEq = `${fmt(A_coef)}x + ${fmt(B_coef)}y + ${fmt(C_coef)} = 0`;
            
            let steps = [
                `📍 STEP 1: Identify circle and external point`,
                `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                `   • Radius: r = ${fmt(radius)}`,
                `   • Point P: (${fmt(x1)}, ${fmt(y1)})`,
                ``,
                `📍 STEP 2: Check if point is external`,
                `   • Distance² from center = (${fmt(x1)} - ${fmt(centerX)})² + (${fmt(y1)} - ${fmt(centerY)})² = ${fmt(distSq)}`,
                `   • Radius² = ${fmt(radiusSq)}`,
                `   • Since ${fmt(distSq)} ${isExternal ? '>' : (Math.abs(distSq - radiusSq) < 1e-10 ? '=' : '<')} ${fmt(radiusSq)}, point is ${isExternal ? 'EXTERNAL' : (Math.abs(distSq - radiusSq) < 1e-10 ? 'ON the circle' : 'INTERNAL')}`,
                ``,
                `📍 STEP 3: Equation of chord of contact (T = 0)`,
                `   • For circle x² + y² + Dx + Ey + F = 0, T is:`,
                `   • T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0`,
                ``,
                `📍 STEP 4: Substitute values`,
                `   • xx₁ = x·${fmt(x1)} = ${fmt(x1)}x`,
                `   • yy₁ = y·${fmt(y1)} = ${fmt(y1)}y`,
                `   • (D/2)(x + x₁) = ${fmt(D/2)}(x + ${fmt(x1)}) = ${fmt(D/2)}x + ${fmt(D/2*x1)}`,
                `   • (E/2)(y + y₁) = ${fmt(E/2)}(y + ${fmt(y1)}) = ${fmt(E/2)}y + ${fmt(E/2*y1)}`,
                `   • F = ${fmt(F)}`,
                ``,
                `📍 STEP 5: Combine like terms`,
                `   • x terms: ${fmt(x1)} + ${fmt(D/2)} = ${fmt(A_coef)}`,
                `   • y terms: ${fmt(y1)} + ${fmt(E/2)} = ${fmt(B_coef)}`,
                `   • Constant: ${fmt(D/2*x1)} + ${fmt(E/2*y1)} + ${fmt(F)} = ${fmt(C_coef)}`,
                ``,
                `📍 STEP 6: Chord of contact equation`,
                `   • ${chordEq}`,
                ``,
                `📍 STEP 7: Geometric interpretation`,
                `   • This is the chord joining the points of tangency from P to the circle`,
                `   • The two tangents from P touch the circle at points where this chord intersects the circle`
            ];
            
            if (!isExternal) {
                steps.push(``);
                steps.push(`⚠️ NOTE: Point P is NOT external to the circle.`);
                steps.push(`   • If point is on the circle, the chord of contact degenerates to the tangent at that point.`);
                steps.push(`   • If point is inside the circle, no real tangents exist.`);
            }
            
            // Draw graph
            const minX = centerX - radius - 3;
            const maxX = centerX + radius + 3;
            const minY = centerY - radius - 3;
            const maxY = centerY + radius + 3;
            
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: centerX + radius * Math.cos(t),
                    y: centerY + radius * Math.sin(t)
                });
            }
            
            // Draw chord of contact line
            let chordPoints = [];
            if (Math.abs(B_coef) > 1e-10) {
                const m = -A_coef/B_coef;
                const intercept = -C_coef/B_coef;
                chordPoints = [
                    {x: minX, y: m*minX + intercept},
                    {x: maxX, y: m*maxX + intercept}
                ];
            } else {
                const xConst = -C_coef/A_coef;
                chordPoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            const datasets = [
                {
                    label: 'Circle',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Chord of Contact',
                    data: chordPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'External Point P',
                    data: [{x: x1, y: y1}],
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                },
                {
                    label: 'Center',
                    data: [{x: centerX, y: centerY}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = `\\( ${chordEq} \\)<br><span style="font-size:0.9rem;">${isExternal ? 'Chord of contact from P to circle' : (Math.abs(distSq - radiusSq) < 1e-10 ? 'P is on the circle → tangent at P' : 'P is inside circle → no real chord')}</span>`;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    updateCircleDisplay();
    compute.addEventListener('click', update);
    [dInp, eInp, fInp, pxInp, pyInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
/**
 * Renders the Pole and Polar card for Circle
 * Pole: Point P(x₁, y₁)
 * Polar: Line T = 0 where T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0
 */
function renderPolePolarCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('polePolarBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📍🔗</span> Pole and Polar (Circle)</h2>
        
        <div class="formula-badge">\\( \\text{Circle: } x^2 + y^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Pole: } P(x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Polar: } T = 0 \\)</div>
        <div class="formula-badge">\\( T: xx_1 + yy_1 + \\frac{D}{2}(x + x_1) + \\frac{E}{2}(y + y_1) + F = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Circle Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Circle: x² + y² + Dx + Ey + F = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>D = <input type="number" id="poleCircleD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="poleCircleE" value="-6" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="poleCircleF" value="9" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Center: (<span id="poleCenterX">2</span>, <span id="poleCenterY">3</span>), Radius: <span id="poleRadius">2</span></div>
            </div>
            
            <!-- Pole Point P -->
            <div class="point-box" style="width:100%;">
                <label>Pole Point P(x₁, y₁)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x₁ = <input type="number" id="polePx" value="5" step="any" style="width:80px;"></div>
                    <div>y₁ = <input type="number" id="polePy" value="6" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="mode-option" id="poleExampleExternal">External Point Example</button>
                <button class="mode-option" id="poleExampleOnCircle">Point on Circle Example</button>
                <button class="mode-option" id="poleExampleInside">Inside Point Example</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePolePolarBtn">
            <span>📍🔗</span> Find Polar Line
        </button>
        
        <div class="result-highlight" id="polePolarResult">
            \\( \\text{Polar equation will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Pole and Polar:</strong> For a given circle, the polar of a point P is the line joining the points of contact of the two tangents from P.
            Conversely, P is called the pole of that line.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get DOM references
    const dInp = document.getElementById('poleCircleD');
    const eInp = document.getElementById('poleCircleE');
    const fInp = document.getElementById('poleCircleF');
    const pxInp = document.getElementById('polePx');
    const pyInp = document.getElementById('polePy');
    const compute = document.getElementById('computePolePolarBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('polePolarResult');
    const centerXSpan = document.getElementById('poleCenterX');
    const centerYSpan = document.getElementById('poleCenterY');
    const radiusSpan = document.getElementById('poleRadius');
    
    function updateCircleDisplay() {
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        const centerX = -D/2;
        const centerY = -E/2;
        const radiusSq = centerX*centerX + centerY*centerY - F;
        const radius = Math.sqrt(Math.max(0, radiusSq));
        centerXSpan.textContent = fmt(centerX);
        centerYSpan.textContent = fmt(centerY);
        radiusSpan.textContent = fmt(radius);
        return { centerX, centerY, radius, radiusSq };
    }
    
    dInp.addEventListener('input', updateCircleDisplay);
    eInp.addEventListener('input', updateCircleDisplay);
    fInp.addEventListener('input', updateCircleDisplay);
    
    // Example buttons
    document.getElementById('poleExampleExternal').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        pxInp.value = 5; pyInp.value = 6;
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('poleExampleOnCircle').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        pxInp.value = 4; pyInp.value = 3; // Point on circle
        updateCircleDisplay();
        update();
    });
    
    document.getElementById('poleExampleInside').addEventListener('click', () => {
        dInp.value = -4; eInp.value = -6; fInp.value = 9;
        pxInp.value = 2; pyInp.value = 3; // Center
        updateCircleDisplay();
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            const x1 = validateNumber(pxInp.value, 'x₁');
            const y1 = validateNumber(pyInp.value, 'y₁');
            
            const centerX = -D/2;
            const centerY = -E/2;
            const radiusSq = centerX*centerX + centerY*centerY - F;
            
            if (radiusSq < -1e-10) {
                throw new Error('Invalid circle: radius² is negative');
            }
            const radius = Math.sqrt(Math.max(0, radiusSq));
            
            // Check position of point relative to circle
            const distSq = (x1 - centerX)*(x1 - centerX) + (y1 - centerY)*(y1 - centerY);
            const isOutside = distSq > radiusSq + 1e-10;
            const isOnCircle = Math.abs(distSq - radiusSq) < 1e-10;
            
            // Polar equation: T = 0
            // T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0
            const A_coef = x1 + D/2;
            const B_coef = y1 + E/2;
            const C_coef = (D/2)*x1 + (E/2)*y1 + F;
            
            const polarEq = `${fmt(A_coef)}x + ${fmt(B_coef)}y + ${fmt(C_coef)} = 0`;
            
            let steps = [
                `📍 STEP 1: Identify circle and pole point`,
                `   • Circle: x² + y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                `   • Center: (${fmt(centerX)}, ${fmt(centerY)})`,
                `   • Radius: r = ${fmt(radius)}`,
                `   • Pole Point P: (${fmt(x1)}, ${fmt(y1)})`,
                ``,
                `📍 STEP 2: Determine point position relative to circle`,
                `   • Distance² from center = (${fmt(x1)} - ${fmt(centerX)})² + (${fmt(y1)} - ${fmt(centerY)})² = ${fmt(distSq)}`,
                `   • Radius² = ${fmt(radiusSq)}`,
                `   • Point is ${isOutside ? 'EXTERNAL' : (isOnCircle ? 'ON the circle' : 'INTERNAL')}`,
                ``,
                `📍 STEP 3: Equation of polar (T = 0)`,
                `   • For circle x² + y² + Dx + Ey + F = 0, T is:`,
                `   • T = xx₁ + yy₁ + (D/2)(x + x₁) + (E/2)(y + y₁) + F = 0`,
                ``,
                `📍 STEP 4: Substitute values`,
                `   • xx₁ = x·${fmt(x1)} = ${fmt(x1)}x`,
                `   • yy₁ = y·${fmt(y1)} = ${fmt(y1)}y`,
                `   • (D/2)(x + x₁) = ${fmt(D/2)}(x + ${fmt(x1)}) = ${fmt(D/2)}x + ${fmt(D/2*x1)}`,
                `   • (E/2)(y + y₁) = ${fmt(E/2)}(y + ${fmt(y1)}) = ${fmt(E/2)}y + ${fmt(E/2*y1)}`,
                `   • F = ${fmt(F)}`,
                ``,
                `📍 STEP 5: Combine like terms`,
                `   • x terms: ${fmt(x1)} + ${fmt(D/2)} = ${fmt(A_coef)}`,
                `   • y terms: ${fmt(y1)} + ${fmt(E/2)} = ${fmt(B_coef)}`,
                `   • Constant: ${fmt(D/2*x1)} + ${fmt(E/2*y1)} + ${fmt(F)} = ${fmt(C_coef)}`,
                ``,
                `📍 STEP 6: Polar line equation`,
                `   • ${polarEq}`,
                ``,
                `📍 STEP 7: Geometric interpretation`,
                `   • ${isOutside ? 'Point is external → Polar is the chord of contact of tangents from P' : 
                               isOnCircle ? 'Point is on circle → Polar is the tangent at P' : 
                               'Point is inside → Polar is a line that does not intersect the circle'}`,
                `   • The pole-polar relationship is reciprocal:`,
                `     - If P lies on the polar of Q, then Q lies on the polar of P`
            ];
            
            // Draw graph
            const minX = centerX - radius - 3;
            const maxX = centerX + radius + 3;
            const minY = centerY - radius - 3;
            const maxY = centerY + radius + 3;
            
            // Generate circle points
            const circlePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                circlePoints.push({
                    x: centerX + radius * Math.cos(t),
                    y: centerY + radius * Math.sin(t)
                });
            }
            
            // Draw polar line
            let polarPoints = [];
            if (Math.abs(B_coef) > 1e-10) {
                const m = -A_coef/B_coef;
                const intercept = -C_coef/B_coef;
                polarPoints = [
                    {x: minX, y: m*minX + intercept},
                    {x: maxX, y: m*maxX + intercept}
                ];
            } else {
                const xConst = -C_coef/A_coef;
                polarPoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            const datasets = [
                {
                    label: 'Circle',
                    data: circlePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Polar Line',
                    data: polarPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Pole Point P',
                    data: [{x: x1, y: y1}],
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                },
                {
                    label: 'Center',
                    data: [{x: centerX, y: centerY}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = `\\( ${polarEq} \\)<br><span style="font-size:0.9rem;">Pole P(${fmt(x1)}, ${fmt(y1)}) → Polar: ${polarEq}</span>`;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    updateCircleDisplay();
    compute.addEventListener('click', update);
    [dInp, eInp, fInp, pxInp, pyInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Intersection of Line and Parabola card
 * Standard parabola: y² = 4ax
 * Line: y = mx + c
 */
function renderLineParabolaIntersectionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('lineParabolaIntersectionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📈📏</span> Intersection of Line and Parabola</h2>
        
        <div class="formula-badge">\\( \\text{Parabola: } y^2 = 4ax \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + c \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Parabola Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Parabola: y² = 4ax</label>
                <div><span>a =</span> <input type="number" id="paraA" value="2" step="any" style="width:80px;"></div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + c</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="paraM" value="1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="paraC" value="2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="mode-option" id="paraSecant">Secant (2 intersections)</button>
                <button class="mode-option" id="paraTangent">Tangent (1 intersection)</button>
                <button class="mode-option" id="paraNoIntersect">No Intersection</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeParaIntersectBtn">
            <span>📈📏</span> Find Intersection Points
        </button>
        
        <div class="result-highlight" id="paraIntersectResult">
            \\( \\text{Intersection points will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> Substitute y = mx + c into y² = 4ax → (mx + c)² = 4ax → quadratic in x.<br>
            • If discriminant > 0: Two intersection points (secant)<br>
            • If discriminant = 0: One intersection point (tangent)<br>
            • If discriminant < 0: No intersection
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('paraA');
    const mInp = document.getElementById('paraM');
    const cInp = document.getElementById('paraC');
    const compute = document.getElementById('computeParaIntersectBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('paraIntersectResult');
    
    // Example buttons
    document.getElementById('paraSecant').addEventListener('click', () => {
        aInp.value = 2;
        mInp.value = 1;
        cInp.value = 2;
        update();
    });
    
    document.getElementById('paraTangent').addEventListener('click', () => {
        aInp.value = 2;
        mInp.value = 1;
        cInp.value = 2; // Need c = a/m for tangent: 2/1 = 2 ✓
        update();
    });
    
    document.getElementById('paraNoIntersect').addEventListener('click', () => {
        aInp.value = 2;
        mInp.value = 1;
        cInp.value = -5;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validateNumber(aInp.value, 'a');
            const m = validateNumber(mInp.value, 'm');
            const c = validateNumber(cInp.value, 'c');
            
            if (a <= 0) {
                throw new Error('For standard parabola y² = 4ax, a must be positive');
            }
            
            // Substitute y = mx + c into y² = 4ax
            // (mx + c)² = 4ax
            // m²x² + 2mcx + c² = 4ax
            // m²x² + (2mc - 4a)x + c² = 0
            
            const A = m*m;
            const B = 2*m*c - 4*a;
            const C = c*c;
            const discriminant = B*B - 4*A*C;
            
            let steps = [];
            let intersectionPoints = [];
            let intersectionType = '';
            
            steps = [
                `📍 STEP 1: Identify parabola and line`,
                `   • Parabola: y² = 4ax = 4·${fmt(a)}x = ${fmt(4*a)}x`,
                `   • Line: y = ${fmt(m)}x + ${fmt(c)}`,
                ``,
                `📍 STEP 2: Substitute line equation into parabola`,
                `   • (${fmt(m)}x + ${fmt(c)})² = ${fmt(4*a)}x`,
                `   • ${fmt(m*m)}x² + ${fmt(2*m*c)}x + ${fmt(c*c)} = ${fmt(4*a)}x`,
                ``,
                `📍 STEP 3: Rearrange to quadratic form`,
                `   • ${fmt(A)}x² + ${fmt(2*m*c)}x - ${fmt(4*a)}x + ${fmt(C)} = 0`,
                `   • ${fmt(A)}x² + ${fmt(B)}x + ${fmt(C)} = 0`,
                ``,
                `📍 STEP 4: Calculate discriminant`,
                `   • Δ = B² - 4AC = ${fmt(B)}² - 4·${fmt(A)}·${fmt(C)}`,
                `   • Δ = ${fmt(B*B)} - ${fmt(4*A*C)} = ${fmt(discriminant)}`
            ];
            
            if (discriminant > 1e-10) {
                intersectionType = 'secant (2 intersections)';
                const sqrtD = Math.sqrt(discriminant);
                const x1 = (-B + sqrtD) / (2*A);
                const x2 = (-B - sqrtD) / (2*A);
                const y1 = m*x1 + c;
                const y2 = m*x2 + c;
                intersectionPoints = [{x: x1, y: y1}, {x: x2, y: y2}];
                steps.push(`   • √Δ = ${fmt(sqrtD)}`);
                steps.push(`   • x₁ = (${fmt(-B)} + ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x1)}`);
                steps.push(`   • y₁ = ${fmt(m)}·${fmt(x1)} + ${fmt(c)} = ${fmt(y1)}`);
                steps.push(`   • x₂ = (${fmt(-B)} - ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x2)}`);
                steps.push(`   • y₂ = ${fmt(m)}·${fmt(x2)} + ${fmt(c)} = ${fmt(y2)}`);
                steps.push(`   • Intersection points: P₁(${fmt(x1)}, ${fmt(y1)}), P₂(${fmt(x2)}, ${fmt(y2)})`);
            } else if (Math.abs(discriminant) < 1e-10) {
                intersectionType = 'tangent (1 intersection)';
                const x = -B / (2*A);
                const y = m*x + c;
                intersectionPoints = [{x: x, y: y}];
                steps.push(`   • Δ = 0 → one intersection point (tangent)`);
                steps.push(`   • x = -${fmt(B)}/(2·${fmt(A)}) = ${fmt(x)}`);
                steps.push(`   • y = ${fmt(m)}·${fmt(x)} + ${fmt(c)} = ${fmt(y)}`);
                steps.push(`   • Tangent point: T(${fmt(x)}, ${fmt(y)})`);
            } else {
                intersectionType = 'no intersection';
                steps.push(`   • Δ = ${fmt(discriminant)} < 0 → no real intersection`);
                steps.push(`   • The line does not meet the parabola`);
            }
            
            // Draw graph
            const vertexX = 0;
            const vertexY = 0;
            const focusX = a;
            const minX = -2;
            const maxX = Math.max(10, focusX + 5);
            const minY = -8;
            const maxY = 8;
            
            // Generate parabola points (y² = 4ax → y = ±√(4ax))
            const parabolaPoints = [];
            for (let x = 0; x <= maxX; x += 0.05) {
                if (4*a*x >= 0) {
                    const y = Math.sqrt(4*a*x);
                    parabolaPoints.push({x: x, y: y});
                    parabolaPoints.push({x: x, y: -y});
                }
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + c},
                {x: maxX, y: m*maxX + c}
            ];
            
            const datasets = [
                {
                    label: 'Parabola y² = 4ax',
                    data: parabolaPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add intersection points
            if (intersectionPoints.length > 0) {
                datasets.push({
                    label: `Intersection Points (${intersectionType})`,
                    data: intersectionPoints,
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                });
            }
            
            // Add focus and vertex
            datasets.push({
                label: 'Focus',
                data: [{x: focusX, y: 0}],
                backgroundColor: '#e67e22',
                pointRadius: 8,
                pointStyle: 'circle',
                showLine: false
            });
            
            datasets.push({
                label: 'Vertex',
                data: [{x: vertexX, y: vertexY}],
                backgroundColor: '#3498db',
                pointRadius: 8,
                pointStyle: 'circle',
                showLine: false
            });
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            // Display result
            let resultText = '';
            if (intersectionPoints.length === 2) {
                resultText = `Intersection points:<br>
                    P₁(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    P₂(${fmt(intersectionPoints[1].x)}, ${fmt(intersectionPoints[1].y)})<br>
                    <span style="font-size:0.9rem;">Line is a SECANT (cuts parabola at 2 points)</span>`;
            } else if (intersectionPoints.length === 1) {
                resultText = `Tangent point:<br>
                    T(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    <span style="font-size:0.9rem;">Line is TANGENT to the parabola</span>`;
            } else {
                resultText = `No intersection points<br>
                    <span style="font-size:0.9rem;">Line does not intersect the parabola</span>`;
            }
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, mInp, cInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, mInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Condition for Tangency to Parabola card
 * Parabola: y² = 4ax, Line: y = mx + c
 * Condition: c = a/m
 */
function renderTangencyParabolaCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('tangencyParabolaBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐📈</span> Condition for Tangency to Parabola</h2>
        
        <div class="formula-badge">\\( \\text{Parabola: } y^2 = 4ax \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + c \\)</div>
        <div class="formula-badge">\\( \\text{Tangency Condition: } c = \\frac{a}{m} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Parabola Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Parabola: y² = 4ax</label>
                <div><span>a =</span> <input type="number" id="tangParaA" value="2" step="any" style="width:80px;"></div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + c</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="tangParaM" value="1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="tangParaC" value="2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Find c for Tangency -->
            <div class="point-box" style="width:100%;">
                <label>Find c to make line tangent (keep a, m fixed)</label>
                <button class="mode-option" id="findParaC">Find c for tangency</button>
                <div style="margin-top:10px;">Required c = <span id="requiredParaC">?</span></div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeTangParaBtn">
            <span>📐📈</span> Check Tangency
        </button>
        
        <div class="result-highlight" id="tangParaResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Tangency Condition for Parabola:</strong><br>
            • For parabola y² = 4ax, line y = mx + c is tangent if c = a/m<br>
            • The point of contact is (a/m², 2a/m)<br>
            • If c > a/m, line does not intersect; if c < a/m, line is secant (for m > 0)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('tangParaA');
    const mInp = document.getElementById('tangParaM');
    const cInp = document.getElementById('tangParaC');
    const compute = document.getElementById('computeTangParaBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('tangParaResult');
    const requiredCSpan = document.getElementById('requiredParaC');
    
    // Find c for tangency
    document.getElementById('findParaC').addEventListener('click', () => {
        const a = parseFloat(aInp.value) || 0;
        const m = parseFloat(mInp.value) || 0;
        
        if (Math.abs(m) < 1e-10) {
            requiredCSpan.textContent = 'Error: m cannot be zero';
            return;
        }
        
        const requiredC = a / m;
        requiredCSpan.innerHTML = fmt(requiredC);
        cInp.value = requiredC;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validateNumber(aInp.value, 'a');
            const m = validateNumber(mInp.value, 'm');
            const c = validateNumber(cInp.value, 'c');
            
            if (a <= 0) {
                throw new Error('For standard parabola y² = 4ax, a must be positive');
            }
            
            const requiredC = a / m;
            const isTangent = Math.abs(c - requiredC) < 1e-10;
            
            // Substitute y = mx + c into y² = 4ax
            const A = m*m;
            const B = 2*m*c - 4*a;
            const C = c*c;
            const discriminant = B*B - 4*A*C;
            
            let steps = [
                `📍 STEP 1: Identify parabola and line`,
                `   • Parabola: y² = 4·${fmt(a)}x = ${fmt(4*a)}x`,
                `   • Line: y = ${fmt(m)}x + ${fmt(c)}`,
                ``,
                `📍 STEP 2: Substitute into parabola equation`,
                `   • (${fmt(m)}x + ${fmt(c)})² = ${fmt(4*a)}x`,
                `   • ${fmt(m*m)}x² + ${fmt(2*m*c)}x + ${fmt(c*c)} = ${fmt(4*a)}x`,
                `   • ${fmt(A)}x² + ${fmt(B)}x + ${fmt(C)} = 0`,
                ``,
                `📍 STEP 3: Apply tangency condition (discriminant = 0)`,
                `   • Δ = B² - 4AC = ${fmt(B)}² - 4·${fmt(A)}·${fmt(C)} = ${fmt(discriminant)}`,
                `   • For tangency, Δ = 0`,
                ``,
                `📍 STEP 4: Solve for c`,
                `   • (2mc - 4a)² - 4m²·c² = 0`,
                `   • 4m²c² - 16amc + 16a² - 4m²c² = 0`,
                `   • -16amc + 16a² = 0`,
                `   • amc = a²`,
                `   • c = a/m = ${fmt(a)}/${fmt(m)} = ${fmt(requiredC)}`,
                ``,
                `📍 STEP 5: Check given line`,
                `   • Given c = ${fmt(c)}`,
                `   • Required c = ${fmt(requiredC)}`,
                `   • Since ${fmt(c)} ${isTangent ? '=' : '≠'} ${fmt(requiredC)}, line is ${isTangent ? 'TANGENT' : 'NOT tangent'}`
            ];
            
            // Draw graph
            const vertexX = 0;
            const vertexY = 0;
            const focusX = a;
            const minX = -2;
            const maxX = Math.max(10, focusX + 5);
            const minY = -8;
            const maxY = 8;
            
            // Generate parabola points
            const parabolaPoints = [];
            for (let x = 0; x <= maxX; x += 0.05) {
                if (4*a*x >= 0) {
                    const y = Math.sqrt(4*a*x);
                    parabolaPoints.push({x: x, y: y});
                    parabolaPoints.push({x: x, y: -y});
                }
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + c},
                {x: maxX, y: m*maxX + c}
            ];
            
            const datasets = [
                {
                    label: 'Parabola y² = 4ax',
                    data: parabolaPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: isTangent ? '#27ae60' : '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Focus',
                    data: [{x: focusX, y: 0}],
                    backgroundColor: '#e67e22',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                },
                {
                    label: 'Vertex',
                    data: [{x: vertexX, y: vertexY}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            const resultText = isTangent ? 
                `✅ The line is TANGENT to the parabola!<br>c = ${fmt(c)} = a/m = ${fmt(requiredC)}` :
                `❌ The line is ${discriminant > 0 ? 'SECANT (2 intersections)' : 'NOT intersecting'} the parabola<br>
                c = ${fmt(c)} ${c > requiredC ? '>' : '<'} a/m = ${fmt(requiredC)}`;
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, mInp, cInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, mInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Intersection of Line and Ellipse card
 * Standard ellipse: x²/a² + y²/b² = 1
 * Line: y = mx + c
 */
function renderLineEllipseIntersectionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('lineEllipseIntersectionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⭕📏</span> Intersection of Line and Ellipse</h2>
        
        <div class="formula-badge">\\( \\text{Ellipse: } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + c \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Ellipse Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Ellipse: x²/a² + y²/b² = 1</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>a =</span> <input type="number" id="ellipseA" value="5" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="ellipseB" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + c</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="ellipseM" value="1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="ellipseC" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="mode-option" id="ellipseSecant">Secant Example</button>
                <button class="mode-option" id="ellipseTangent">Tangent Example</button>
                <button class="mode-option" id="ellipseNoIntersect">No Intersection</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeEllipseIntersectBtn">
            <span>⭕📏</span> Find Intersection Points
        </button>
        
        <div class="result-highlight" id="ellipseIntersectResult">
            \\( \\text{Intersection points will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> Substitute y = mx + c into ellipse equation → quadratic in x.<br>
            • If discriminant > 0: Two intersection points (secant)<br>
            • If discriminant = 0: One intersection point (tangent)<br>
            • If discriminant < 0: No intersection
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('ellipseA');
    const bInp = document.getElementById('ellipseB');
    const mInp = document.getElementById('ellipseM');
    const cInp = document.getElementById('ellipseC');
    const compute = document.getElementById('computeEllipseIntersectBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('ellipseIntersectResult');
    
    // Example buttons
    document.getElementById('ellipseSecant').addEventListener('click', () => {
        aInp.value = 5; bInp.value = 3;
        mInp.value = 1; cInp.value = 0;
        update();
    });
    
    document.getElementById('ellipseTangent').addEventListener('click', () => {
        aInp.value = 5; bInp.value = 3;
        mInp.value = 1; cInp.value = Math.sqrt(9 + 25); // c² = a²m² + b²
        update();
    });
    
    document.getElementById('ellipseNoIntersect').addEventListener('click', () => {
        aInp.value = 5; bInp.value = 3;
        mInp.value = 1; cInp.value = 7;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validatePositiveNumber(aInp.value, 'a');
            const b = validatePositiveNumber(bInp.value, 'b');
            const m = validateNumber(mInp.value, 'm');
            const c = validateNumber(cInp.value, 'c');
            
            // Substitute y = mx + c into x²/a² + y²/b² = 1
            // x²/a² + (mx + c)²/b² = 1
            // Multiply by a²b²: b²x² + a²(mx + c)² = a²b²
            // b²x² + a²(m²x² + 2mcx + c²) = a²b²
            // (b² + a²m²)x² + 2a²mc x + (a²c² - a²b²) = 0
            
            const A = b*b + a*a*m*m;
            const B = 2*a*a*m*c;
            const C = a*a*(c*c - b*b);
            const discriminant = B*B - 4*A*C;
            
            let steps = [];
            let intersectionPoints = [];
            let intersectionType = '';
            
            steps = [
                `📍 STEP 1: Identify ellipse and line`,
                `   • Ellipse: x²/${fmt(a)}² + y²/${fmt(b)}² = 1`,
                `   • Line: y = ${fmt(m)}x + ${fmt(c)}`,
                ``,
                `📍 STEP 2: Substitute line into ellipse equation`,
                `   • x²/${fmt(a*a)} + (${fmt(m)}x + ${fmt(c)})²/${fmt(b*b)} = 1`,
                `   • Multiply by ${fmt(a*a*b*b)}:`,
                `   • ${fmt(b*b)}x² + ${fmt(a*a)}(${fmt(m)}x + ${fmt(c)})² = ${fmt(a*a*b*b)}`,
                ``,
                `📍 STEP 3: Expand`,
                `   • ${fmt(b*b)}x² + ${fmt(a*a)}(${fmt(m*m)}x² + ${fmt(2*m*c)}x + ${fmt(c*c)}) = ${fmt(a*a*b*b)}`,
                `   • ${fmt(b*b)}x² + ${fmt(a*a*m*m)}x² + ${fmt(2*a*a*m*c)}x + ${fmt(a*a*c*c)} = ${fmt(a*a*b*b)}`,
                ``,
                `📍 STEP 4: Rearrange to quadratic form`,
                `   • (${fmt(b*b)} + ${fmt(a*a*m*m)})x² + ${fmt(2*a*a*m*c)}x + (${fmt(a*a*c*c)} - ${fmt(a*a*b*b)}) = 0`,
                `   • ${fmt(A)}x² + ${fmt(B)}x + ${fmt(C)} = 0`,
                ``,
                `📍 STEP 5: Calculate discriminant`,
                `   • Δ = B² - 4AC = ${fmt(B)}² - 4·${fmt(A)}·${fmt(C)}`,
                `   • Δ = ${fmt(B*B)} - ${fmt(4*A*C)} = ${fmt(discriminant)}`
            ];
            
            if (discriminant > 1e-10) {
                intersectionType = 'secant (2 intersections)';
                const sqrtD = Math.sqrt(discriminant);
                const x1 = (-B + sqrtD) / (2*A);
                const x2 = (-B - sqrtD) / (2*A);
                const y1 = m*x1 + c;
                const y2 = m*x2 + c;
                intersectionPoints = [{x: x1, y: y1}, {x: x2, y: y2}];
                steps.push(`   • √Δ = ${fmt(sqrtD)}`);
                steps.push(`   • x₁ = (${fmt(-B)} + ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x1)}`);
                steps.push(`   • y₁ = ${fmt(m)}·${fmt(x1)} + ${fmt(c)} = ${fmt(y1)}`);
                steps.push(`   • x₂ = (${fmt(-B)} - ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x2)}`);
                steps.push(`   • y₂ = ${fmt(m)}·${fmt(x2)} + ${fmt(c)} = ${fmt(y2)}`);
                steps.push(`   • Intersection points: P₁(${fmt(x1)}, ${fmt(y1)}), P₂(${fmt(x2)}, ${fmt(y2)})`);
            } else if (Math.abs(discriminant) < 1e-10) {
                intersectionType = 'tangent (1 intersection)';
                const x = -B / (2*A);
                const y = m*x + c;
                intersectionPoints = [{x: x, y: y}];
                steps.push(`   • Δ = 0 → one intersection point (tangent)`);
                steps.push(`   • x = -${fmt(B)}/(2·${fmt(A)}) = ${fmt(x)}`);
                steps.push(`   • y = ${fmt(m)}·${fmt(x)} + ${fmt(c)} = ${fmt(y)}`);
                steps.push(`   • Tangent point: T(${fmt(x)}, ${fmt(y)})`);
            } else {
                intersectionType = 'no intersection';
                steps.push(`   • Δ = ${fmt(discriminant)} < 0 → no real intersection`);
                steps.push(`   • The line does not meet the ellipse`);
            }
            
            // Draw graph
            const minX = -a - 2;
            const maxX = a + 2;
            const minY = -b - 2;
            const maxY = b + 2;
            
            // Generate ellipse points (parametric: x = a cosθ, y = b sinθ)
            const ellipsePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                ellipsePoints.push({
                    x: a * Math.cos(t),
                    y: b * Math.sin(t)
                });
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + c},
                {x: maxX, y: m*maxX + c}
            ];
            
            const datasets = [
                {
                    label: `Ellipse x²/${fmt(a)}² + y²/${fmt(b)}² = 1`,
                    data: ellipsePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add intersection points
            if (intersectionPoints.length > 0) {
                datasets.push({
                    label: `Intersection Points (${intersectionType})`,
                    data: intersectionPoints,
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                });
            }
            
            // Add center
            datasets.push({
                label: 'Center',
                data: [{x: 0, y: 0}],
                backgroundColor: '#3498db',
                pointRadius: 8,
                pointStyle: 'circle',
                showLine: false
            });
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            // Display result
            let resultText = '';
            if (intersectionPoints.length === 2) {
                resultText = `Intersection points:<br>
                    P₁(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    P₂(${fmt(intersectionPoints[1].x)}, ${fmt(intersectionPoints[1].y)})<br>
                    <span style="font-size:0.9rem;">Line is a SECANT (cuts ellipse at 2 points)</span>`;
            } else if (intersectionPoints.length === 1) {
                resultText = `Tangent point:<br>
                    T(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    <span style="font-size:0.9rem;">Line is TANGENT to the ellipse</span>`;
            } else {
                resultText = `No intersection points<br>
                    <span style="font-size:0.9rem;">Line does not intersect the ellipse</span>`;
            }
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, mInp, cInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, mInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Condition for Tangency to Ellipse card
 * Ellipse: x²/a² + y²/b² = 1
 * Line: y = mx + c
 * Condition: c² = a²m² + b²
 */
function renderTangencyEllipseCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('tangencyEllipseBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐⭕</span> Condition for Tangency to Ellipse</h2>
        
        <div class="formula-badge">\\( \\text{Ellipse: } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + c \\)</div>
        <div class="formula-badge">\\( \\text{Tangency Condition: } c^2 = a^2 m^2 + b^2 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Ellipse Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Ellipse: x²/a² + y²/b² = 1</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>a =</span> <input type="number" id="tangEllipseA" value="5" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="tangEllipseB" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + c</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="tangEllipseM" value="1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="tangEllipseC" value="${Math.sqrt(25 + 9)}" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Find c for Tangency -->
            <div class="point-box" style="width:100%;">
                <label>Find c to make line tangent (keep a, b, m fixed)</label>
                <button class="mode-option" id="findEllipseC">Find c for tangency</button>
                <div style="margin-top:10px;">Required c = <span id="requiredEllipseC">?</span></div>
                <div style="font-size:0.9rem;">(c = ±√(a²m² + b²))</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeTangEllipseBtn">
            <span>📐⭕</span> Check Tangency
        </button>
        
        <div class="result-highlight" id="tangEllipseResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Tangency Condition for Ellipse:</strong><br>
            • For ellipse x²/a² + y²/b² = 1, line y = mx + c is tangent if c² = a²m² + b²<br>
            • The point of contact is (-a²m/c, b²/c) for the tangent with positive c<br>
            • If c² < a²m² + b², line is secant; if c² > a²m² + b², line does not intersect
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('tangEllipseA');
    const bInp = document.getElementById('tangEllipseB');
    const mInp = document.getElementById('tangEllipseM');
    const cInp = document.getElementById('tangEllipseC');
    const compute = document.getElementById('computeTangEllipseBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('tangEllipseResult');
    const requiredCSpan = document.getElementById('requiredEllipseC');
    
    // Find c for tangency
    document.getElementById('findEllipseC').addEventListener('click', () => {
        const a = parseFloat(aInp.value) || 0;
        const b = parseFloat(bInp.value) || 0;
        const m = parseFloat(mInp.value) || 0;
        
        if (a <= 0 || b <= 0) {
            requiredCSpan.textContent = 'Error: a and b must be positive';
            return;
        }
        
        const requiredC = Math.sqrt(a*a*m*m + b*b);
        requiredCSpan.innerHTML = `±${fmt(requiredC)}`;
        cInp.value = requiredC;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validatePositiveNumber(aInp.value, 'a');
            const b = validatePositiveNumber(bInp.value, 'b');
            const m = validateNumber(mInp.value, 'm');
            const c = validateNumber(cInp.value, 'c');
            
            const requiredC = Math.sqrt(a*a*m*m + b*b);
            const isTangent = Math.abs(Math.abs(c) - requiredC) < 1e-10;
            
            // Substitute y = mx + c into ellipse equation
            const A = b*b + a*a*m*m;
            const B = 2*a*a*m*c;
            const C = a*a*(c*c - b*b);
            const discriminant = B*B - 4*A*C;
            
            let steps = [
                `📍 STEP 1: Identify ellipse and line`,
                `   • Ellipse: x²/${fmt(a)}² + y²/${fmt(b)}² = 1`,
                `   • Line: y = ${fmt(m)}x + ${fmt(c)}`,
                ``,
                `📍 STEP 2: Substitute into ellipse equation`,
                `   • x²/${fmt(a*a)} + (${fmt(m)}x + ${fmt(c)})²/${fmt(b*b)} = 1`,
                `   • Multiply by ${fmt(a*a*b*b)}:`,
                `   • ${fmt(b*b)}x² + ${fmt(a*a)}(${fmt(m)}x + ${fmt(c)})² = ${fmt(a*a*b*b)}`,
                ``,
                `📍 STEP 3: Expand and simplify`,
                `   • ${fmt(b*b)}x² + ${fmt(a*a)}(${fmt(m*m)}x² + ${fmt(2*m*c)}x + ${fmt(c*c)}) = ${fmt(a*a*b*b)}`,
                `   • (${fmt(b*b)} + ${fmt(a*a*m*m)})x² + ${fmt(2*a*a*m*c)}x + (${fmt(a*a*c*c)} - ${fmt(a*a*b*b)}) = 0`,
                ``,
                `📍 STEP 4: Apply tangency condition (discriminant = 0)`,
                `   • Δ = (${fmt(2*a*a*m*c)})² - 4(${fmt(b*b + a*a*m*m)})(${fmt(a*a*c*c - a*a*b*b)}) = 0`,
                `   • 4a⁴m²c² - 4a²(b² + a²m²)(c² - b²) = 0`,
                `   • Divide by 4a²: a²m²c² - (b² + a²m²)(c² - b²) = 0`,
                `   • a²m²c² - b²c² - a²m²c² + a²m²b² + b⁴ = 0`,
                `   • -b²c² + a²m²b² + b⁴ = 0`,
                `   • Divide by b²: -c² + a²m² + b² = 0`,
                `   • c² = a²m² + b²`,
                ``,
                `📍 STEP 5: Calculate required c`,
                `   • a²m² + b² = ${fmt(a*a)}·${fmt(m*m)} + ${fmt(b*b)} = ${fmt(a*a*m*m)} + ${fmt(b*b)} = ${fmt(a*a*m*m + b*b)}`,
                `   • required c = ±√(${fmt(a*a*m*m + b*b)}) = ±${fmt(requiredC)}`,
                ``,
                `📍 STEP 6: Check given line`,
                `   • Given c = ${fmt(c)}`,
                `   • Required |c| = ${fmt(requiredC)}`,
                `   • Since |c| ${isTangent ? '=' : '≠'} required, line is ${isTangent ? 'TANGENT' : 'NOT tangent'}`
            ];
            
            // Draw graph
            const minX = -a - 2;
            const maxX = a + 2;
            const minY = -b - 2;
            const maxY = b + 2;
            
            // Generate ellipse points
            const ellipsePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                ellipsePoints.push({
                    x: a * Math.cos(t),
                    y: b * Math.sin(t)
                });
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + c},
                {x: maxX, y: m*maxX + c}
            ];
            
            const datasets = [
                {
                    label: `Ellipse x²/${fmt(a)}² + y²/${fmt(b)}² = 1`,
                    data: ellipsePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: isTangent ? '#27ae60' : '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Center',
                    data: [{x: 0, y: 0}],
                    backgroundColor: '#3498db',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            const resultText = isTangent ? 
                `✅ The line is TANGENT to the ellipse!<br>c² = ${fmt(c*c)} = a²m² + b² = ${fmt(a*a*m*m + b*b)}` :
                `❌ The line is ${discriminant > 0 ? 'SECANT (2 intersections)' : 'NOT intersecting'} the ellipse<br>
                c² = ${fmt(c*c)} ${c*c > a*a*m*m + b*b ? '>' : '<'} a²m² + b² = ${fmt(a*a*m*m + b*b)}`;
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, mInp, cInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, mInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// ==================== NEW LINE & CONIC FUNCTIONS ====================

/**
 * Renders the Intersection of Line and Hyperbola card
 * Standard hyperbola: x²/a² - y²/b² = 1
 * Line: y = mx + c
 */
function renderLineHyperbolaIntersectionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('lineHyperbolaIntersectionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📈📏</span> Intersection of Line and Hyperbola</h2>
        
        <div class="formula-badge">\\( \\text{Hyperbola: } \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + c \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Hyperbola Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Hyperbola: x²/a² - y²/b² = 1</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>a =</span> <input type="number" id="hypA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="hypB" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + c</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="hypM" value="1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="hypC" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick Examples -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="mode-option" id="hypSecant">Secant (2 intersections)</button>
                <button class="mode-option" id="hypTangent">Tangent (1 intersection)</button>
                <button class="mode-option" id="hypNoIntersect">No Intersection</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeHypIntersectBtn">
            <span>📈📏</span> Find Intersection Points
        </button>
        
        <div class="result-highlight" id="hypIntersectResult">
            \\( \\text{Intersection points will appear here} \\)</div>
        <div class="footnote">
            <strong>Method:</strong> Substitute y = mx + c into hyperbola equation → quadratic in x.<br>
            • If discriminant > 0: Two intersection points (secant)<br>
            • If discriminant = 0: One intersection point (tangent)<br>
            • If discriminant < 0: No intersection
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('hypA');
    const bInp = document.getElementById('hypB');
    const mInp = document.getElementById('hypM');
    const cInp = document.getElementById('hypC');
    const compute = document.getElementById('computeHypIntersectBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('hypIntersectResult');
    
    // Example buttons
    document.getElementById('hypSecant').addEventListener('click', () => {
        aInp.value = 2; bInp.value = 3;
        mInp.value = 1; cInp.value = 0;
        update();
    });
    
    document.getElementById('hypTangent').addEventListener('click', () => {
        aInp.value = 2; bInp.value = 3;
        mInp.value = 1; cInp.value = Math.sqrt(4 - 9); // c² = a²m² - b²
        update();
    });
    
    document.getElementById('hypNoIntersect').addEventListener('click', () => {
        aInp.value = 2; bInp.value = 3;
        mInp.value = 0.5; cInp.value = 5;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validatePositiveNumber(aInp.value, 'a');
            const b = validatePositiveNumber(bInp.value, 'b');
            const m = validateNumber(mInp.value, 'm');
            const c = validateNumber(cInp.value, 'c');
            
            // Substitute y = mx + c into x²/a² - y²/b² = 1
            // x²/a² - (mx + c)²/b² = 1
            // Multiply by a²b²: b²x² - a²(mx + c)² = a²b²
            // b²x² - a²(m²x² + 2mcx + c²) = a²b²
            // (b² - a²m²)x² - 2a²mc x - a²c² - a²b² = 0
            // (b² - a²m²)x² - 2a²mc x - a²(c² + b²) = 0
            
            const A = b*b - a*a*m*m;
            const B = -2*a*a*m*c;
            const C = -a*a*(c*c + b*b);
            const discriminant = B*B - 4*A*C;
            
            let steps = [];
            let intersectionPoints = [];
            let intersectionType = '';
            
            steps = [
                `📍 STEP 1: Identify hyperbola and line`,
                `   • Hyperbola: x²/${fmt(a)}² - y²/${fmt(b)}² = 1`,
                `   • Line: y = ${fmt(m)}x + ${fmt(c)}`,
                ``,
                `📍 STEP 2: Substitute line into hyperbola equation`,
                `   • x²/${fmt(a*a)} - (${fmt(m)}x + ${fmt(c)})²/${fmt(b*b)} = 1`,
                `   • Multiply by ${fmt(a*a*b*b)}:`,
                `   • ${fmt(b*b)}x² - ${fmt(a*a)}(${fmt(m)}x + ${fmt(c)})² = ${fmt(a*a*b*b)}`,
                ``,
                `📍 STEP 3: Expand`,
                `   • ${fmt(b*b)}x² - ${fmt(a*a)}(${fmt(m*m)}x² + ${fmt(2*m*c)}x + ${fmt(c*c)}) = ${fmt(a*a*b*b)}`,
                `   • ${fmt(b*b)}x² - ${fmt(a*a*m*m)}x² - ${fmt(2*a*a*m*c)}x - ${fmt(a*a*c*c)} = ${fmt(a*a*b*b)}`,
                ``,
                `📍 STEP 4: Rearrange to quadratic form`,
                `   • (${fmt(b*b)} - ${fmt(a*a*m*m)})x² - ${fmt(2*a*a*m*c)}x - ${fmt(a*a*c*c + a*a*b*b)} = 0`,
                `   • ${fmt(A)}x² + ${fmt(B)}x + ${fmt(C)} = 0`,
                ``,
                `📍 STEP 5: Calculate discriminant`,
                `   • Δ = B² - 4AC = ${fmt(B)}² - 4·${fmt(A)}·${fmt(C)}`,
                `   • Δ = ${fmt(B*B)} - ${fmt(4*A*C)} = ${fmt(discriminant)}`
            ];
            
            if (discriminant > 1e-10) {
                intersectionType = 'secant (2 intersections)';
                const sqrtD = Math.sqrt(discriminant);
                const x1 = (-B + sqrtD) / (2*A);
                const x2 = (-B - sqrtD) / (2*A);
                const y1 = m*x1 + c;
                const y2 = m*x2 + c;
                intersectionPoints = [{x: x1, y: y1}, {x: x2, y: y2}];
                steps.push(`   • √Δ = ${fmt(sqrtD)}`);
                steps.push(`   • x₁ = (${fmt(-B)} + ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x1)}`);
                steps.push(`   • y₁ = ${fmt(m)}·${fmt(x1)} + ${fmt(c)} = ${fmt(y1)}`);
                steps.push(`   • x₂ = (${fmt(-B)} - ${fmt(sqrtD)})/(2·${fmt(A)}) = ${fmt(x2)}`);
                steps.push(`   • y₂ = ${fmt(m)}·${fmt(x2)} + ${fmt(c)} = ${fmt(y2)}`);
                steps.push(`   • Intersection points: P₁(${fmt(x1)}, ${fmt(y1)}), P₂(${fmt(x2)}, ${fmt(y2)})`);
            } else if (Math.abs(discriminant) < 1e-10) {
                intersectionType = 'tangent (1 intersection)';
                const x = -B / (2*A);
                const y = m*x + c;
                intersectionPoints = [{x: x, y: y}];
                steps.push(`   • Δ = 0 → one intersection point (tangent)`);
                steps.push(`   • x = -${fmt(B)}/(2·${fmt(A)}) = ${fmt(x)}`);
                steps.push(`   • y = ${fmt(m)}·${fmt(x)} + ${fmt(c)} = ${fmt(y)}`);
                steps.push(`   • Tangent point: T(${fmt(x)}, ${fmt(y)})`);
            } else {
                intersectionType = 'no intersection';
                steps.push(`   • Δ = ${fmt(discriminant)} < 0 → no real intersection`);
                steps.push(`   • The line does not meet the hyperbola`);
            }
            
            // Draw graph
            const maxX = Math.max(8, a + 3);
            const minX = -maxX;
            const maxY = Math.max(8, b + 3);
            const minY = -maxY;
            
            // Generate hyperbola points (x²/a² - y²/b² = 1 → y = ±b√(x²/a² - 1))
            const hyperbolaPointsRight = [];
            const hyperbolaPointsLeft = [];
            for (let x = a; x <= maxX; x += 0.05) {
                if (x*x/(a*a) - 1 >= 0) {
                    const y = b * Math.sqrt(x*x/(a*a) - 1);
                    hyperbolaPointsRight.push({x: x, y: y});
                    hyperbolaPointsRight.push({x: x, y: -y});
                }
            }
            for (let x = -maxX; x <= -a; x += 0.05) {
                if (x*x/(a*a) - 1 >= 0) {
                    const y = b * Math.sqrt(x*x/(a*a) - 1);
                    hyperbolaPointsLeft.push({x: x, y: y});
                    hyperbolaPointsLeft.push({x: x, y: -y});
                }
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + c},
                {x: maxX, y: m*maxX + c}
            ];
            
            const datasets = [
                {
                    label: `Hyperbola x²/${fmt(a)}² - y²/${fmt(b)}² = 1`,
                    data: [...hyperbolaPointsRight, ...hyperbolaPointsLeft],
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add asymptotes
            const asymptote1Points = [{x: minX, y: (b/a)*minX}, {x: maxX, y: (b/a)*maxX}];
            const asymptote2Points = [{x: minX, y: -(b/a)*minX}, {x: maxX, y: -(b/a)*maxX}];
            datasets.push({
                label: 'Asymptotes',
                data: asymptote1Points,
                backgroundColor: 'transparent',
                borderColor: '#aaa',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            datasets.push({
                label: '',
                data: asymptote2Points,
                backgroundColor: 'transparent',
                borderColor: '#aaa',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            
            // Add intersection points
            if (intersectionPoints.length > 0) {
                datasets.push({
                    label: `Intersection Points (${intersectionType})`,
                    data: intersectionPoints,
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                });
            }
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            // Display result
            let resultText = '';
            if (intersectionPoints.length === 2) {
                resultText = `Intersection points:<br>
                    P₁(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    P₂(${fmt(intersectionPoints[1].x)}, ${fmt(intersectionPoints[1].y)})<br>
                    <span style="font-size:0.9rem;">Line is a SECANT (cuts hyperbola at 2 points)</span>`;
            } else if (intersectionPoints.length === 1) {
                resultText = `Tangent point:<br>
                    T(${fmt(intersectionPoints[0].x)}, ${fmt(intersectionPoints[0].y)})<br>
                    <span style="font-size:0.9rem;">Line is TANGENT to the hyperbola</span>`;
            } else {
                resultText = `No intersection points<br>
                    <span style="font-size:0.9rem;">Line does not intersect the hyperbola</span>`;
            }
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, mInp, cInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, mInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Condition for Tangency to Rectangular Hyperbola card
 * Rectangular hyperbola: xy = c²
 * Line: y = mx + c
 * Condition: c = -2m√(c²?) Actually: xy = c², line y = mx + k → x(mx + k) = c² → mx² + kx - c² = 0
 * For tangency: discriminant = k² + 4m c² = 0
 */
function renderTangencyRectHyperbolaCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('tangencyRectHyperbolaBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐📈</span> Tangency to Rectangular Hyperbola</h2>
        
        <div class="formula-badge">\\( \\text{Rectangular Hyperbola: } xy = c^2 \\)</div>
        <div class="formula-badge">\\( \\text{Line: } y = mx + k \\)</div>
        <div class="formula-badge">\\( \\text{Tangency Condition: } k^2 + 4mc^2 = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <!-- Hyperbola Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Rectangular Hyperbola: xy = c²</label>
                <div><span>c =</span> <input type="number" id="rectHypC" value="2" step="any" style="width:80px;"></div>
            </div>
            
            <!-- Line Parameters -->
            <div class="point-box" style="width:100%;">
                <label>Line: y = mx + k</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>m =</span> <input type="number" id="rectHypM" value="1" step="any" style="width:80px;"></div>
                    <div><span>k =</span> <input type="number" id="rectHypK" value="-4" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Find k for Tangency -->
            <div class="point-box" style="width:100%;">
                <label>Find k to make line tangent (keep c, m fixed)</label>
                <button class="mode-option" id="findRectHypK">Find k for tangency</button>
                <div style="margin-top:10px;">Required k = <span id="requiredRectHypK">?</span></div>
                <div style="font-size:0.9rem;">(k = ±2√(-mc²) for m < 0, or no real k for m > 0)</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRectHypTangencyBtn">
            <span>📐📈</span> Check Tangency
        </button>
        
        <div class="result-highlight" id="rectHypTangencyResult">
            \\( \\text{Result will appear here} \\)</div>
        <div class="footnote">
            <strong>Tangency Condition for Rectangular Hyperbola xy = c²:</strong><br>
            • Line y = mx + k is tangent if k² + 4mc² = 0<br>
            • This requires m < 0 for real tangents<br>
            • The point of contact is (-k/(2m), -k/2) or equivalently (c/√(-m), c√(-m))
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const cInp = document.getElementById('rectHypC');
    const mInp = document.getElementById('rectHypM');
    const kInp = document.getElementById('rectHypK');
    const compute = document.getElementById('computeRectHypTangencyBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('rectHypTangencyResult');
    const requiredKSpan = document.getElementById('requiredRectHypK');
    
    // Find k for tangency
    document.getElementById('findRectHypK').addEventListener('click', () => {
        const c = parseFloat(cInp.value) || 0;
        const m = parseFloat(mInp.value) || 0;
        
        if (m >= 0) {
            requiredKSpan.innerHTML = 'No real k (m must be negative)';
            return;
        }
        
        const k = 2 * Math.sqrt(-m * c * c);
        requiredKSpan.innerHTML = `±${fmt(k)}`;
        kInp.value = k;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const c = validatePositiveNumber(cInp.value, 'c');
            const m = validateNumber(mInp.value, 'm');
            const k = validateNumber(kInp.value, 'k');
            
            // For line y = mx + k and hyperbola xy = c²
            // Substitute: x(mx + k) = c² → mx² + kx - c² = 0
            const A = m;
            const B = k;
            const C = -c*c;
            const discriminant = B*B - 4*A*C;
            const isTangent = Math.abs(discriminant) < 1e-10;
            
            // Tangency condition: k² + 4mc² = 0
            const conditionValue = k*k + 4*m*c*c;
            const satisfiesCondition = Math.abs(conditionValue) < 1e-10;
            
            let steps = [
                `📍 STEP 1: Identify rectangular hyperbola and line`,
                `   • Rectangular Hyperbola: xy = ${fmt(c)}² = ${fmt(c*c)}`,
                `   • Line: y = ${fmt(m)}x + ${fmt(k)}`,
                ``,
                `📍 STEP 2: Substitute line into hyperbola equation`,
                `   • x(${fmt(m)}x + ${fmt(k)}) = ${fmt(c*c)}`,
                `   • ${fmt(m)}x² + ${fmt(k)}x - ${fmt(c*c)} = 0`,
                ``,
                `📍 STEP 3: Quadratic equation: ${fmt(m)}x² + ${fmt(k)}x - ${fmt(c*c)} = 0`,
                `   • Discriminant Δ = ${fmt(k)}² - 4·${fmt(m)}·(-${fmt(c*c)})`,
                `   • Δ = ${fmt(k*k)} + ${fmt(4*m*c*c)} = ${fmt(conditionValue)}`,
                ``,
                `📍 STEP 4: Tangency condition (Δ = 0)`,
                `   • For tangency, we require k² + 4mc² = 0`,
                `   • ${fmt(k*k)} + ${fmt(4*m*c*c)} = ${fmt(conditionValue)}`,
                `   • ${satisfiesCondition ? '✓ Condition satisfied' : '✗ Condition not satisfied'}`,
                ``,
                `📍 STEP 5: ${satisfiesCondition ? 'Line is TANGENT' : 'Line is NOT tangent'}`,
                satisfiesCondition ? 
                    `   • The point of contact is x = -k/(2m) = ${fmt(-k/(2*m))}, y = -k/2 = ${fmt(-k/2)}` :
                    `   • ${discriminant > 0 ? 'Line is secant (2 intersections)' : 'Line does not intersect'}`
            ];
            
            // Draw graph
            const minX = -8, maxX = 8;
            const minY = -8, maxY = 8;
            
            // Generate hyperbola points (xy = c² → y = c²/x)
            const hyperbolaPoints1 = []; // x > 0
            const hyperbolaPoints2 = []; // x < 0
            for (let x = 0.1; x <= maxX; x += 0.1) {
                hyperbolaPoints1.push({x: x, y: c*c / x});
            }
            for (let x = -maxX; x <= -0.1; x += 0.1) {
                hyperbolaPoints2.push({x: x, y: c*c / x});
            }
            
            // Generate line points
            const linePoints = [
                {x: minX, y: m*minX + k},
                {x: maxX, y: m*maxX + k}
            ];
            
            // Find intersection points
            const A_coef = m;
            const B_coef = k;
            const C_coef = -c*c;
            const disc = B_coef*B_coef - 4*A_coef*C_coef;
            let intersectionPoints = [];
            
            if (Math.abs(A_coef) > 1e-10 && disc >= 0) {
                const sqrtDisc = Math.sqrt(disc);
                const x1 = (-B_coef + sqrtDisc) / (2*A_coef);
                const x2 = (-B_coef - sqrtDisc) / (2*A_coef);
                const y1 = m*x1 + k;
                const y2 = m*x2 + k;
                if (isFinite(x1) && isFinite(y1)) intersectionPoints.push({x: x1, y: y1});
                if (isFinite(x2) && isFinite(y2) && Math.abs(x1 - x2) > 1e-10) intersectionPoints.push({x: x2, y: y2});
            }
            
            const datasets = [
                {
                    label: `Rectangular Hyperbola xy = ${fmt(c*c)}`,
                    data: [...hyperbolaPoints1, ...hyperbolaPoints2],
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: satisfiesCondition ? '#27ae60' : '#d44c2f',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add intersection points
            if (intersectionPoints.length > 0) {
                datasets.push({
                    label: `Intersection Points`,
                    data: intersectionPoints,
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                });
            }
            
            // Add asymptotes (axes)
            datasets.push({
                label: 'Asymptotes (axes)',
                data: [{x: minX, y: 0}, {x: maxX, y: 0}],
                backgroundColor: 'transparent',
                borderColor: '#aaa',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            datasets.push({
                label: '',
                data: [{x: 0, y: minY}, {x: 0, y: maxY}],
                backgroundColor: 'transparent',
                borderColor: '#aaa',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            const resultText = satisfiesCondition ? 
                `✅ The line is TANGENT to the rectangular hyperbola!<br>
                Condition: k² + 4mc² = ${fmt(conditionValue)} = 0<br>
                Point of contact: (${fmt(-k/(2*m))}, ${fmt(-k/2)})` :
                `❌ The line is ${disc > 0 ? 'SECANT' : 'NOT intersecting'}<br>
                Condition: k² + 4mc² = ${fmt(conditionValue)} ≠ 0`;
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [cInp, mInp, kInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [cInp, mInp, kInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Diameter of a Conic card
 * Locus of midpoints of parallel chords of a conic
 */
function renderDiameterConicCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('diameterConicBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⚪📏</span> Diameter of a Conic</h2>
        
        <div class="formula-badge">\\( \\text{Diameter: Locus of midpoints of parallel chords} \\)</div>
        <div class="formula-badge">\\( \\text{For parabola } y^2 = 4ax, \\text{ diameter: } y = \\frac{2a}{m} \\)</div>
        <div class="formula-badge">\\( \\text{For ellipse } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\text{ diameter: } y = -\\frac{b^2}{a^2 m}x \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Select Conic Type</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <label><input type="radio" name="conicType" value="parabola" checked> Parabola y² = 4ax</label>
                    <label><input type="radio" name="conicType" value="ellipse"> Ellipse x²/a² + y²/b² = 1</label>
                    <label><input type="radio" name="conicType" value="hyperbola"> Hyperbola x²/a² - y²/b² = 1</label>
                </div>
            </div>
            
            <div id="paraParams" class="point-box" style="width:100%;">
                <label>Parabola: y² = 4ax</label>
                <div><span>a =</span> <input type="number" id="diamParaA" value="2" step="any" style="width:80px;"></div>
            </div>
            
            <div id="ellipseHypParams" class="point-box" style="width:100%; display:none;">
                <label>Ellipse/Hyperbola Parameters</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div><span>a =</span> <input type="number" id="diamA" value="4" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="diamB" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Slope of chords (m) =</label>
                <div><input type="number" id="diamM" value="2" step="any" style="width:100px;"></div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="mode-option" id="diamExample1">m = 1</button>
                <button class="mode-option" id="diamExample2">m = 2</button>
                <button class="mode-option" id="diamExample3">m = -1</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeDiameterBtn">
            <span>⚪📏</span> Find Diameter Equation
        </button>
        
        <div class="result-highlight" id="diameterResult">
            \\( \\text{Diameter equation will appear here} \\)</div>
        <div class="footnote">
            <strong>Diameter of a Conic:</strong> The locus of midpoints of a system of parallel chords is called a diameter.<br>
            • For parabola y² = 4ax: Diameter is y = 2a/m (a line parallel to x-axis)<br>
            • For ellipse x²/a² + y²/b² = 1: Diameter is y = -b²/(a²m)·x<br>
            • For hyperbola x²/a² - y²/b² = 1: Diameter is y = b²/(a²m)·x
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const conicRadios = document.getElementsByName('conicType');
    const paraParams = document.getElementById('paraParams');
    const ellipseHypParams = document.getElementById('ellipseHypParams');
    const paraAInp = document.getElementById('diamParaA');
    const diamAInp = document.getElementById('diamA');
    const diamBInp = document.getElementById('diamB');
    const mInp = document.getElementById('diamM');
    const compute = document.getElementById('computeDiameterBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('diameterResult');
    
    // Toggle parameter visibility
    for (let radio of conicRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'parabola') {
                paraParams.style.display = 'block';
                ellipseHypParams.style.display = 'none';
            } else {
                paraParams.style.display = 'none';
                ellipseHypParams.style.display = 'block';
            }
        });
    }
    
    // Example buttons
    document.getElementById('diamExample1').addEventListener('click', () => {
        mInp.value = 1;
        update();
    });
    document.getElementById('diamExample2').addEventListener('click', () => {
        mInp.value = 2;
        update();
    });
    document.getElementById('diamExample3').addEventListener('click', () => {
        mInp.value = -1;
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            let conicType = 'parabola';
            for (let radio of conicRadios) {
                if (radio.checked) {
                    conicType = radio.value;
                    break;
                }
            }
            
            const m = validateNumber(mInp.value, 'm');
            
            let diameterEq = '';
            let steps = [];
            let conicPoints = [];
            let diameterPoints = [];
            let minX = -6, maxX = 6, minY = -6, maxY = 6;
            
            if (conicType === 'parabola') {
                const a = validatePositiveNumber(paraAInp.value, 'a');
                // For parabola y² = 4ax, diameter for chords with slope m: y = 2a/m
                const yIntercept = 2*a/m;
                diameterEq = `y = ${fmt(yIntercept)} (horizontal line)`;
                
                steps = [
                    `📍 STEP 1: Parabola: y² = 4ax = 4·${fmt(a)}x = ${fmt(4*a)}x`,
                    `   • Chords have slope m = ${fmt(m)}`,
                    ``,
                    `📍 STEP 2: Equation of chord with slope m: y = mx + c`,
                    `   • Substitute into parabola: (mx + c)² = 4ax`,
                    `   • m²x² + 2mcx + c² - 4ax = 0`,
                    `   • m²x² + (2mc - 4a)x + c² = 0`,
                    ``,
                    `📍 STEP 3: For midpoint (x₁, y₁) of chord, x-coordinate is average of roots:`,
                    `   • x_mid = (x₁ + x₂)/2 = - (2mc - 4a)/(2m²) = (4a - 2mc)/(2m²) = (2a - mc)/m²`,
                    `   • y_mid = m·x_mid + c = m·(2a - mc)/m² + c = (2a - mc)/m + c = 2a/m`,
                    ``,
                    `📍 STEP 4: Diameter equation (independent of c)`,
                    `   • y = 2a/m = 2·${fmt(a)}/${fmt(m)} = ${fmt(2*a/m)}`,
                    `   • This is a horizontal line parallel to x-axis`
                ];
                
                // Generate parabola points
                for (let x = 0; x <= maxX; x += 0.05) {
                    if (4*a*x >= 0) {
                        const y = Math.sqrt(4*a*x);
                        conicPoints.push({x: x, y: y}, {x: x, y: -y});
                    }
                }
                
                // Generate diameter line
                diameterPoints = [
                    {x: minX, y: 2*a/m},
                    {x: maxX, y: 2*a/m}
                ];
                
            } else if (conicType === 'ellipse') {
                const a = validatePositiveNumber(diamAInp.value, 'a');
                const b = validatePositiveNumber(diamBInp.value, 'b');
                // For ellipse x²/a² + y²/b² = 1, diameter: y = -b²/(a²m)·x
                const slope = -b*b/(a*a*m);
                diameterEq = `y = ${fmt(slope)}x`;
                
                steps = [
                    `📍 STEP 1: Ellipse: x²/${fmt(a)}² + y²/${fmt(b)}² = 1`,
                    `   • Chords have slope m = ${fmt(m)}`,
                    ``,
                    `📍 STEP 2: Equation of chord with slope m: y = mx + c`,
                    `   • Substitute into ellipse: x²/a² + (mx + c)²/b² = 1`,
                    `   • Multiply by a²b²: b²x² + a²(mx + c)² = a²b²`,
                    `   • (b² + a²m²)x² + 2a²mc x + a²(c² - b²) = 0`,
                    ``,
                    `📍 STEP 3: For midpoint (x₁, y₁) of chord:`,
                    `   • x_mid = - (2a²mc)/(2(b² + a²m²)) = -a²mc/(b² + a²m²)`,
                    `   • y_mid = m·x_mid + c = -a²m²c/(b² + a²m²) + c = c·b²/(b² + a²m²)`,
                    ``,
                    `📍 STEP 4: Eliminate c to get diameter equation:`,
                    `   • y_mid / x_mid = [c·b²/(b² + a²m²)] / [-a²mc/(b² + a²m²)] = -b²/(a²m)`,
                    `   • y = -b²/(a²m)·x`,
                    `   • y = -${fmt(b*b)}/(${fmt(a*a)}·${fmt(m)})·x = ${fmt(slope)}x`
                ];
                
                // Generate ellipse points
                for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                    conicPoints.push({
                        x: a * Math.cos(t),
                        y: b * Math.sin(t)
                    });
                }
                
                // Generate diameter line
                diameterPoints = [
                    {x: minX, y: slope * minX},
                    {x: maxX, y: slope * maxX}
                ];
                
            } else { // hyperbola
                const a = validatePositiveNumber(diamAInp.value, 'a');
                const b = validatePositiveNumber(diamBInp.value, 'b');
                // For hyperbola x²/a² - y²/b² = 1, diameter: y = b²/(a²m)·x
                const slope = b*b/(a*a*m);
                diameterEq = `y = ${fmt(slope)}x`;
                
                steps = [
                    `📍 STEP 1: Hyperbola: x²/${fmt(a)}² - y²/${fmt(b)}² = 1`,
                    `   • Chords have slope m = ${fmt(m)}`,
                    ``,
                    `📍 STEP 2: Equation of chord with slope m: y = mx + c`,
                    `   • Substitute into hyperbola: x²/a² - (mx + c)²/b² = 1`,
                    `   • Multiply by a²b²: b²x² - a²(mx + c)² = a²b²`,
                    `   • (b² - a²m²)x² - 2a²mc x - a²(c² + b²) = 0`,
                    ``,
                    `📍 STEP 3: For midpoint (x₁, y₁) of chord:`,
                    `   • x_mid = (2a²mc)/(2(b² - a²m²)) = a²mc/(b² - a²m²)`,
                    `   • y_mid = m·x_mid + c = a²m²c/(b² - a²m²) + c = c·b²/(b² - a²m²)`,
                    ``,
                    `📍 STEP 4: Eliminate c to get diameter equation:`,
                    `   • y_mid / x_mid = [c·b²/(b² - a²m²)] / [a²mc/(b² - a²m²)] = b²/(a²m)`,
                    `   • y = b²/(a²m)·x`,
                    `   • y = ${fmt(b*b)}/(${fmt(a*a)}·${fmt(m)})·x = ${fmt(slope)}x`
                ];
                
                // Generate hyperbola points
                maxX = a + 4;
                minX = -maxX;
                maxY = b + 4;
                minY = -maxY;
                for (let x = a; x <= maxX; x += 0.05) {
                    if (x*x/(a*a) - 1 >= 0) {
                        const y = b * Math.sqrt(x*x/(a*a) - 1);
                        conicPoints.push({x: x, y: y}, {x: x, y: -y});
                    }
                }
                for (let x = -maxX; x <= -a; x += 0.05) {
                    if (x*x/(a*a) - 1 >= 0) {
                        const y = b * Math.sqrt(x*x/(a*a) - 1);
                        conicPoints.push({x: x, y: y}, {x: x, y: -y});
                    }
                }
                
                // Generate diameter line
                diameterPoints = [
                    {x: minX, y: slope * minX},
                    {x: maxX, y: slope * maxX}
                ];
            }
            
            const datasets = [
                {
                    label: 'Conic',
                    data: conicPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Diameter (locus of midpoints)',
                    data: diameterPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 3,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = `\\( \\text{Diameter: } ${diameterEq} \\)`;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [paraAInp, diamAInp, diamBInp, mInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Optical Property of Parabola card
 * Reflection property: All rays parallel to axis reflect through focus
 */
function renderParabolaReflectionCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('parabolaReflectionBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🪞📈</span> Optical Property of Parabola</h2>
        
        <div class="formula-badge">\\( \\text{Parabola: } y^2 = 4ax \\)</div>
        <div class="formula-badge">\\( \\text{Property: Any ray parallel to axis reflects through the focus} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Parabola: y² = 4ax</label>
                <div><span>a =</span> <input type="number" id="optParaA" value="2" step="any" style="width:80px;"></div>
                <div style="font-size:0.9rem;">Focus F = (a, 0) = (<span id="focusX">2</span>, 0)</div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Incoming Ray (parallel to axis, horizontal)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>Ray at y = <input type="number" id="optRayY" value="3" step="any" style="width:80px;"></div>
                </div>
                <div>Intersects parabola at point P = (<span id="intersectX">?</span>, <span id="intersectY">?</span>)</div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="mode-option" id="optExample1">y = 2</button>
                <button class="mode-option" id="optExample2">y = 3</button>
                <button class="mode-option" id="optExample3">y = -2</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeOpticalBtn">
            <span>🪞</span> Verify Reflection Property
        </button>
        
        <div class="result-highlight" id="opticalResult">
            \\( \\text{Result will appear here} \\)</div>
        <div class="footnote">
            <strong>Optical Property of Parabola:</strong><br>
            • Any ray coming from the focus reflects parallel to the axis (satellite dishes)<br>
            • Conversely, any ray parallel to the axis reflects through the focus (headlights)<br>
            • The tangent at any point makes equal angles with the focal radius and the axis
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('optParaA');
    const rayYInp = document.getElementById('optRayY');
    const compute = document.getElementById('computeOpticalBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('opticalResult');
    const focusXSpan = document.getElementById('focusX');
    const intersectXSpan = document.getElementById('intersectX');
    const intersectYSpan = document.getElementById('intersectY');
    
    // Example buttons
    document.getElementById('optExample1').addEventListener('click', () => {
        rayYInp.value = 2;
        update();
    });
    document.getElementById('optExample2').addEventListener('click', () => {
        rayYInp.value = 3;
        update();
    });
    document.getElementById('optExample3').addEventListener('click', () => {
        rayYInp.value = -2;
        update();
    });
    
    aInp.addEventListener('input', () => {
        focusXSpan.textContent = fmt(parseFloat(aInp.value) || 0);
        update();
    });
    
    function update() {
        clearErrors();
        
        try {
            const a = validatePositiveNumber(aInp.value, 'a');
            const y0 = validateNumber(rayYInp.value, 'y');
            
            // Intersection point P: from y² = 4ax → x = y²/(4a)
            const xP = y0*y0 / (4*a);
            const pointP = {x: xP, y: y0};
            const focusF = {x: a, y: 0};
            
            intersectXSpan.textContent = fmt(xP);
            intersectYSpan.textContent = fmt(y0);
            focusXSpan.textContent = fmt(a);
            
            // Calculate slopes for angle verification
            // Tangent slope at P: for y² = 4ax, dy/dx = 2a/y
            const tangentSlope = 2*a / y0;
            
            // Slope of PF (from P to focus)
            const slopePF = (0 - y0) / (a - xP);
            
            // Slope of axis (horizontal line)
            const slopeAxis = 0;
            
            // Calculate angles to verify reflection property
            // Angle between tangent and PF = angle between tangent and axis
            const angleTanPF = Math.abs(Math.atan(tangentSlope) - Math.atan(slopePF));
            const angleTanAxis = Math.abs(Math.atan(tangentSlope) - Math.atan(slopeAxis));
            const areEqual = Math.abs(angleTanPF - angleTanAxis) < 0.001;
            
            let steps = [
                `📍 STEP 1: Parabola: y² = 4ax = 4·${fmt(a)}x = ${fmt(4*a)}x`,
                `   • Focus F = (a, 0) = (${fmt(a)}, 0)`,
                `   • Incoming ray is parallel to axis (horizontal) at y = ${fmt(y0)}`,
                ``,
                `📍 STEP 2: Find intersection point P of ray with parabola`,
                `   • At y = ${fmt(y0)}, from y² = 4ax:`,
                `   • ${fmt(y0*y0)} = ${fmt(4*a)}x → x = ${fmt(y0*y0)}/${fmt(4*a)} = ${fmt(xP)}`,
                `   • P = (${fmt(xP)}, ${fmt(y0)})`,
                ``,
                `📍 STEP 3: Find slope of tangent at P`,
                `   • For y² = 4ax, differentiate: 2y·dy/dx = 4a → dy/dx = 2a/y`,
                `   • Tangent slope m_t = 2·${fmt(a)}/${fmt(y0)} = ${fmt(tangentSlope)}`,
                ``,
                `📍 STEP 4: Find slope of line from P to focus F`,
                `   • m_PF = (${fmt(0)} - ${fmt(y0)})/(${fmt(a)} - ${fmt(xP)}) = ${fmt(slopePF)}`,
                ``,
                `📍 STEP 5: Reflection property verification`,
                `   • Angle between tangent and PF = tan⁻¹(${fmt(tangentSlope)}) - tan⁻¹(${fmt(slopePF)}) = ${fmt(angleTanPF)} rad`,
                `   • Angle between tangent and axis (horizontal) = tan⁻¹(${fmt(tangentSlope)}) - 0 = ${fmt(angleTanAxis)} rad`,
                `   • ${areEqual ? 'Angles are EQUAL → Reflection property holds ✓' : 'Angles are NOT equal'}`,
                ``,
                `📍 STEP 6: Geometric interpretation`,
                `   • The tangent at P makes equal angles with the focal radius PF and the axis`,
                `   • This means the ray parallel to the axis reflects through the focus`,
                `   • This property is used in satellite dishes and headlights`
            ];
            
            // Draw graph
            const minX = -2, maxX = Math.max(a + 5, xP + 3);
            const minY = -Math.max(8, Math.abs(y0) + 3);
            const maxY = Math.max(8, Math.abs(y0) + 3);
            
            // Generate parabola points
            const parabolaPoints = [];
            for (let x = 0; x <= maxX; x += 0.05) {
                if (4*a*x >= 0) {
                    const y = Math.sqrt(4*a*x);
                    parabolaPoints.push({x: x, y: y});
                    parabolaPoints.push({x: x, y: -y});
                }
            }
            
            // Ray (incoming, parallel to axis)
            const rayPoints = [
                {x: minX, y: y0},
                {x: xP, y: y0}
            ];
            
            // Reflected ray (from P to focus)
            const reflectedPoints = [
                {x: xP, y: y0},
                {x: a, y: 0}
            ];
            
            // Tangent line at P
            // Tangent equation: yy₀ = 2a(x + xP)
            const tangentPoints = [];
            if (Math.abs(y0) > 1e-10) {
                const xMin = Math.max(minX, 0);
                const xMaxLine = maxX;
                const yAtXMin = 2*a*(xMin + xP) / y0;
                const yAtXMax = 2*a*(xMaxLine + xP) / y0;
                tangentPoints.push({x: xMin, y: yAtXMin});
                tangentPoints.push({x: xMaxLine, y: yAtXMax});
            } else {
                // Vertical tangent at vertex
                tangentPoints.push({x: 0, y: minY});
                tangentPoints.push({x: 0, y: maxY});
            }
            
            const datasets = [
                {
                    label: 'Parabola',
                    data: parabolaPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Incoming Ray (parallel to axis)',
                    data: rayPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#3498db',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Reflected Ray (to focus)',
                    data: reflectedPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#e67e22',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Tangent at P',
                    data: tangentPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#d44c2f',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Focus',
                    data: [focusF],
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                },
                {
                    label: 'Point P',
                    data: [pointP],
                    backgroundColor: '#d44c2f',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            const resultText = areEqual ?
                `✅ Reflection property VERIFIED!<br>
                The ray parallel to the axis reflects through the focus (${fmt(a)}, 0).<br>
                Angle with tangent: ${fmt(angleTanPF.toFixed(4))} rad = ${fmt(angleTanAxis.toFixed(4))} rad` :
                `❌ Something went wrong - angles should be equal`;
            
            resultDiv.innerHTML = resultText;
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, rayYInp]);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, rayYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Renders the Line as Directrix or Axis of Conic card
 * Find condition for a given line to be directrix/axis of a conic
 */
function renderLineDirectrixAxisCard() {
    // Deactivate all other buttons
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    allSidebarBtns.forEach(btn => btn.classList.remove('active-btn'));
    
    // Activate this button
    const btn = document.getElementById('lineDirectrixAxisBtn');
    if (btn) btn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐🎯</span> Line as Directrix or Axis of Conic</h2>
        
        <div class="formula-badge">\\( \\text{For conic: distance to focus / distance to directrix = eccentricity e} \\)</div>
        <div class="formula-badge">\\( \\text{Directrix: } ax + by + c = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Select Conic Type</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <label><input type="radio" name="dirConicType" value="parabola" checked> Parabola (e = 1)</label>
                    <label><input type="radio" name="dirConicType" value="ellipse"> Ellipse (0 < e < 1)</label>
                    <label><input type="radio" name="dirConicType" value="hyperbola"> Hyperbola (e > 1)</label>
                </div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Directrix Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>a = <input type="number" id="dirA" value="1" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="dirB" value="0" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="dirC" value="2" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Focus Point F = (h, k)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>h = <input type="number" id="focusH" value="0" step="any" style="width:70px;"></div>
                    <div>k = <input type="number" id="focusK" value="0" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div id="eccParams" class="point-box" style="width:100%;">
                <label>Eccentricity e =</label>
                <div><input type="number" id="eccValue" value="0.8" step="any" style="width:100px;"></div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeDirectrixBtn">
            <span>📐🎯</span> Find Conic Equation
        </button>
        
        <div class="result-highlight" id="directrixResult">
            \\( \\text{Conic equation will appear here} \\)</div>
        <div class="footnote">
            <strong>Conic Definition:</strong> A conic is the set of points P such that PF / PD = e,<br>
            where F is focus, D is perpendicular distance to directrix, e is eccentricity.<br>
            • Parabola: e = 1<br>
            • Ellipse: 0 < e < 1<br>
            • Hyperbola: e > 1
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const conicRadios = document.getElementsByName('dirConicType');
    const eccParams = document.getElementById('eccParams');
    const eccInp = document.getElementById('eccValue');
    const aInp = document.getElementById('dirA');
    const bInp = document.getElementById('dirB');
    const cInp = document.getElementById('dirC');
    const hInp = document.getElementById('focusH');
    const kInp = document.getElementById('focusK');
    const compute = document.getElementById('computeDirectrixBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('directrixResult');
    
    // Toggle eccentricity input visibility
    for (let radio of conicRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'parabola') {
                eccParams.style.display = 'none';
            } else {
                eccParams.style.display = 'block';
            }
        });
    }
    
    function update() {
        clearErrors();
        
        try {
            let conicType = 'parabola';
            for (let radio of conicRadios) {
                if (radio.checked) {
                    conicType = radio.value;
                    break;
                }
            }
            
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            const h = validateNumber(hInp.value, 'h');
            const k = validateNumber(kInp.value, 'k');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            let e = 1; // parabola
            if (conicType === 'ellipse') {
                e = validateNumber(eccInp.value, 'e', 0, 1);
                if (e <= 0 || e >= 1) {
                    throw new Error('For ellipse, eccentricity must be between 0 and 1');
                }
            } else if (conicType === 'hyperbola') {
                e = validateNumber(eccInp.value, 'e', 1, 10);
                if (e <= 1) {
                    throw new Error('For hyperbola, eccentricity must be greater than 1');
                }
            }
            
            const norm = Math.sqrt(a*a + b*b);
            
            // Conic definition: distance to focus = e * distance to directrix
            // √[(x-h)² + (y-k)²] = e * |ax + by + c|/norm
            // Square both sides:
            // (x-h)² + (y-k)² = e² (ax + by + c)²/(a² + b²)
            
            const eSq = e*e;
            const denom = a*a + b*b;
            
            // Expand: (x-h)² + (y-k)² = (e²/denom)(a²x² + b²y² + c² + 2abxy + 2acx + 2bcy)
            // Multiply by denom:
            // denom[(x-h)² + (y-k)²] = e²(a²x² + b²y² + c² + 2abxy + 2acx + 2bcy)
            
            // This gives a general quadratic equation
            const A_coef = denom - eSq*a*a;
            const B_coef = denom - eSq*b*b;
            const C_coef = -2*eSq*a*b;
            const D_coef = -2*denom*h - 2*eSq*a*c;
            const E_coef = -2*denom*k - 2*eSq*b*c;
            const F_coef = denom*(h*h + k*k) - eSq*c*c;
            
            // Simplify coefficients
            const finalA = fmt(A_coef);
            const finalB = fmt(C_coef);
            const finalC = fmt(B_coef);
            const finalD = fmt(D_coef);
            const finalE = fmt(E_coef);
            const finalF = fmt(F_coef);
            
            const conicEquation = `${finalA}x² ${C_coef >= 0 ? '+' : '-'} ${Math.abs(finalB)}xy ${B_coef >= 0 ? '+' : '-'} ${Math.abs(finalC)}y² ${D_coef >= 0 ? '+' : '-'} ${Math.abs(finalD)}x ${E_coef >= 0 ? '+' : '-'} ${Math.abs(finalE)}y ${F_coef >= 0 ? '+' : '-'} ${Math.abs(finalF)} = 0`;
            
            let steps = [
                `📍 STEP 1: Conic definition`,
                `   • Focus F = (${fmt(h)}, ${fmt(k)})`,
                `   • Directrix L: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `   • Eccentricity e = ${fmt(e)} (${conicType})`,
                `   • Condition: PF = e × PD, where PD = distance to directrix`,
                ``,
                `📍 STEP 2: Write distance formulas`,
                `   • PF² = (x - ${fmt(h)})² + (y - ${fmt(k)})²`,
                `   • PD = |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}|/√(${fmt(a*a)} + ${fmt(b*b)}) = |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}|/${fmt(norm)}`,
                ``,
                `📍 STEP 3: Square both sides to remove absolute value`,
                `   • (x - ${fmt(h)})² + (y - ${fmt(k)})² = ${fmt(eSq)}·(${fmt(a)}x + ${fmt(b)}y + ${fmt(c)})²/(${fmt(denom)})`,
                ``,
                `📍 STEP 4: Multiply by denominator`,
                `   • ${fmt(denom)}[(x - ${fmt(h)})² + (y - ${fmt(k)})²] = ${fmt(eSq)}(${fmt(a)}x + ${fmt(b)}y + ${fmt(c)})²`,
                ``,
                `📍 STEP 5: Expand both sides`,
                `   • Left: ${fmt(denom)}[(x² - ${fmt(2*h)}x + ${fmt(h*h)}) + (y² - ${fmt(2*k)}y + ${fmt(k*k)})]`,
                `   • = ${fmt(denom)}x² + ${fmt(denom)}y² - ${fmt(2*denom*h)}x - ${fmt(2*denom*k)}y + ${fmt(denom*(h*h + k*k))}`,
                `   • Right: ${fmt(eSq)}[${fmt(a*a)}x² + ${fmt(b*b)}y² + ${fmt(c*c)} + ${fmt(2*a*b)}xy + ${fmt(2*a*c)}x + ${fmt(2*b*c)}y]`,
                `   • = ${fmt(eSq*a*a)}x² + ${fmt(eSq*b*b)}y² + ${fmt(eSq*c*c)} + ${fmt(2*eSq*a*b)}xy + ${fmt(2*eSq*a*c)}x + ${fmt(2*eSq*b*c)}y`,
                ``,
                `📍 STEP 6: Bring all terms to left side`,
                `   • (${fmt(denom)} - ${fmt(eSq*a*a)})x² + (${fmt(denom)} - ${fmt(eSq*b*b)})y² - ${fmt(2*eSq*a*b)}xy + ... = 0`,
                ``,
                `📍 STEP 7: Conic equation`,
                `   • ${finalA}x² ${C_coef >= 0 ? '+' : '-'} ${Math.abs(finalB)}xy ${B_coef >= 0 ? '+' : '-'} ${Math.abs(finalC)}y² ${D_coef >= 0 ? '+' : '-'} ${Math.abs(finalD)}x ${E_coef >= 0 ? '+' : '-'} ${Math.abs(finalE)}y ${F_coef >= 0 ? '+' : '-'} ${Math.abs(finalF)} = 0`,
                ``,
                `📍 STEP 8: Identify the conic`,
                `   • Discriminant Δ = ${finalB}² - 4·${finalA}·${finalC} = ${fmt(C_coef*C_coef - 4*A_coef*B_coef)}`,
                `   • This is a ${conicType} (e = ${fmt(e)})`
            ];
            
            // Draw graph
            const minX = -8, maxX = 8;
            const minY = -6, maxY = 6;
            
            // Draw directrix line
            let directrixPoints = [];
            if (Math.abs(b) > 1e-10) {
                const m = -a/b;
                const intercept = -c/b;
                directrixPoints = [
                    {x: minX, y: m*minX + intercept},
                    {x: maxX, y: m*maxX + intercept}
                ];
            } else {
                const xConst = -c/a;
                directrixPoints = [
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
            // Generate conic points by solving for y
            const conicPoints = [];
            // For a given x, solve Ay² + By + C = 0 where A = finalC, B = finalE + finalB*x, C = finalA*x² + finalD*x + finalF
            for (let x = minX; x <= maxX; x += 0.1) {
                const A_val = parseFloat(finalC);
                const B_val = parseFloat(finalE) + parseFloat(finalB)*x;
                const C_val = parseFloat(finalA)*x*x + parseFloat(finalD)*x + parseFloat(finalF);
                
                if (Math.abs(A_val) > 1e-10) {
                    const disc = B_val*B_val - 4*A_val*C_val;
                    if (disc >= 0) {
                        const y1 = (-B_val + Math.sqrt(disc)) / (2*A_val);
                        const y2 = (-B_val - Math.sqrt(disc)) / (2*A_val);
                        if (y1 >= minY && y1 <= maxY) conicPoints.push({x: x, y: y1});
                        if (y2 >= minY && y2 <= maxY && Math.abs(y1 - y2) > 0.01) conicPoints.push({x: x, y: y2});
                    }
                } else if (Math.abs(B_val) > 1e-10) {
                    const y = -C_val / B_val;
                    if (y >= minY && y <= maxY) conicPoints.push({x: x, y: y});
                }
            }
            
            const datasets = [
                {
                    label: 'Directrix',
                    data: directrixPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#3498db',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: `Conic (${conicType}, e = ${fmt(e)})`,
                    data: conicPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#2c3e50',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                },
                {
                    label: 'Focus',
                    data: [{x: h, y: k}],
                    backgroundColor: '#27ae60',
                    pointRadius: 10,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 2,
                    showLine: false
                }
            ];
            
            destroyGraph();
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: true, position: 'top' } },
                    scales: {
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            resultDiv.innerHTML = `\\( ${conicEquation} \\)<br><span style="font-size:0.9rem;">Conic with focus (${fmt(h)}, ${fmt(k)}), directrix ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0, e = ${fmt(e)}</span>`;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, hInp, kInp, eccInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    for (let radio of conicRadios) radio.addEventListener('change', update);
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}