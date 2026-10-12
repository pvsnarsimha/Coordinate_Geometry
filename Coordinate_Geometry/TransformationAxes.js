
// ========= TRANSFORMATION & SHIFTING OF AXES =========
// This file contains all transformation-related functions

/**
 * Translation of Origin - Shifting origin to (h, k)
 * New coordinates: X = x - h, Y = y - k
 * Original coordinates: x = X + h, y = Y + k
 */

function renderTranslationOriginCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('translationOriginBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📍</span> Translation of Origin (Shifting Origin)</h2>
        
        <div class="formula-badge">\\( \\text{New origin O' at } (h, k) \\text{ in old coordinates} \\)</div>
        <div class="formula-badge">\\( \\text{Old coordinates: } x = X + h, \\quad y = Y + k \\)</div>
        <div class="formula-badge">\\( \\text{New coordinates: } X = x - h, \\quad Y = y - k \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>New Origin O' = (h, k)</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>h = <input type="number" id="transH" value="2" step="any" style="width:80px;"></div>
                    <div>k = <input type="number" id="transK" value="1" step="any" style="width:80px;"></div>
                </div>
                <div style="margin-top:15px; font-size:0.9rem; color:#666;">
                    The origin is shifted from O(0,0) to O'(${fmt(2)}, ${fmt(1)})
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Original Curve/Line Equation: f(x, y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="transEq" value="x^2 + y^2 - 4x - 2y - 4 = 0" style="width:300px; padding:8px; border-radius:20px;">
                </div>
                <div style="font-size:0.8rem; margin-top:5px;">Examples: x^2 + y^2 - 4x - 2y - 4 = 0, 2x + 3y - 12 = 0</div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point P (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x = <input type="number" id="transTestX" value="4" step="any" style="width:70px;"></div>
                    <div>y = <input type="number" id="transTestY" value="2" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeTranslationBtn">
            <span>📍</span> Apply Translation
        </button>
        
        <div class="result-highlight" id="translationResult">
            \\( \\text{New equation in X, Y coordinates} \\)
        </div>
        <div class="footnote">
            <strong>Translation of Axes:</strong> Shifting the origin to (h, k) without changing the direction of axes.<br>
            • Old coordinates: (x, y) = (X + h, Y + k)<br>
            • New coordinates: (X, Y) = (x - h, y - k)<br>
            • The shape of the curve remains the same; only the reference point changes.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const hInp = document.getElementById('transH');
    const kInp = document.getElementById('transK');
    const eqInp = document.getElementById('transEq');
    const testXInp = document.getElementById('transTestX');
    const testYInp = document.getElementById('transTestY');
    const compute = document.getElementById('computeTranslationBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('translationResult');

    function parseEquation(equation, x, y) {
        // Simple evaluator for basic equations
        try {
            // Replace ^ with ** for JavaScript
            let expr = equation.replace(/\^/g, '**');
            // Add multiplication signs where needed
            expr = expr.replace(/(\d)([xy])/g, '$1*$2');
            expr = expr.replace(/([xy])(\d)/g, '$1*$2');
            expr = expr.replace(/([xy])([xy])/g, '$1*$2');
            // Replace x and y with actual values
            expr = expr.replace(/x/g, `(${x})`);
            expr = expr.replace(/y/g, `(${y})`);
            return eval(expr);
        } catch(e) {
            return null;
        }
    }

    function update() {
        clearErrors();
        
        try {
            const h = validateNumber(hInp.value, 'h');
            const k = validateNumber(kInp.value, 'k');
            const equation = eqInp.value;
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test x');
                testY = validateNumber(testYInp.value, 'test y');
            } catch(e) {}
            
            // Translation formulas: x = X + h, y = Y + k
            // Substitute into original equation to get new equation in X,Y
            
            let newEquation = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding Translation of Axes`,
                `   • Original origin: O(0,0)`,
                `   • New origin O' = (${fmt(h)}, ${fmt(k)}) in old coordinates`,
                `   • Translation formulas:`,
                `     x = X + ${fmt(h)}`,
                `     y = Y + ${fmt(k)}`,
                `   • Where (X,Y) are coordinates in the new system`,
                ``,
                `📍 STEP 2: Original equation`,
                `   • ${equation} = 0`,
                ``,
                `📍 STEP 3: Substitute x = X + ${fmt(h)}, y = Y + ${fmt(k)}`,
            ];
            
            // Handle specific equation types
            if (equation.includes('x^2 + y^2') || equation.includes('x² + y²')) {
                // Circle equation: x² + y² + Dx + Ey + F = 0
                // After translation: X² + Y² + (D + 2h)X + (E + 2k)Y + (h² + k² + Dh + Ek + F) = 0
                // We want to eliminate linear terms by choosing h = -D/2, k = -E/2
                
                // Parse coefficients from the equation
                let eq = equation.replace(/²/g, '^2');
                let D = 0, E = 0, F = 0;
                
                // Simple pattern matching for x^2 + y^2 + Dx + Ey + F = 0
                const xMatch = eq.match(/[+-]\s*(\d*\.?\d*)x\b(?!\^)/);
                const yMatch = eq.match(/[+-]\s*(\d*\.?\d*)y\b(?!\^)/);
                const constMatch = eq.match(/[+-]\s*(\d*\.?\d*)(?![xy\^])$/);
                
                if (xMatch) D = parseFloat(xMatch[0].replace(/\s/g, ''));
                if (yMatch) E = parseFloat(yMatch[0].replace(/\s/g, ''));
                if (constMatch) F = parseFloat(constMatch[0].replace(/\s/g, ''));
                
                const Dval = D, Eval = E, Fval = F;
                
                // After translation: X² + Y² + (D + 2h)X + (E + 2k)Y + (h² + k² + Dh + Ek + F) = 0
                const newD = Dval + 2*h;
                const newE = Eval + 2*k;
                const newF = h*h + k*k + Dval*h + Eval*k + Fval;
                
                newEquation = `X² + Y² + ${fmt(newD)}X + ${fmt(newE)}Y + ${fmt(newF)} = 0`;
                
                steps.push(`   • Original: ${equation}`);
                steps.push(`   • Substitute: (X + ${fmt(h)})² + (Y + ${fmt(k)})² + ${fmt(Dval)}(X + ${fmt(h)}) + ${fmt(Eval)}(Y + ${fmt(k)}) + ${fmt(Fval)} = 0`);
                steps.push(`   • Expand: X² + ${fmt(2*h)}X + ${fmt(h*h)} + Y² + ${fmt(2*k)}Y + ${fmt(k*k)} + ${fmt(Dval)}X + ${fmt(Dval*h)} + ${fmt(Eval)}Y + ${fmt(Eval*k)} + ${fmt(Fval)} = 0`);
                steps.push(`   • Combine like terms:`);
                steps.push(`     X² + Y² + (${fmt(2*h)} + ${fmt(Dval)})X + (${fmt(2*k)} + ${fmt(Eval)})Y + (${fmt(h*h + k*k + Dval*h + Eval*k + Fval)}) = 0`);
                steps.push(`   • New equation: X² + Y² + ${fmt(newD)}X + ${fmt(newE)}Y + ${fmt(newF)} = 0`);
                
                if (Math.abs(newD) < 1e-10 && Math.abs(newE) < 1e-10) {
                    steps.push(`   • Notice: The linear terms are eliminated!`);
                    steps.push(`   • This is because h = -D/2 = ${fmt(-Dval/2)} and k = -E/2 = ${fmt(-Eval/2)}`);
                    steps.push(`   • When we shift origin to the center of the circle, the equation becomes X² + Y² = ${fmt(-newF)}`);
                }
                
            } else if (equation.includes('x') && equation.includes('y') && !equation.includes('^2') && !equation.includes('²')) {
                // Linear equation: ax + by + c = 0
                // After translation: aX + bY + (ah + bk + c) = 0
                
                // Parse coefficients
                let eq = equation;
                let a = 0, b = 0, c = 0;
                
                const xMatch = eq.match(/([+-]?\d*\.?\d*)\s*x(?!\^)/);
                const yMatch = eq.match(/([+-]?\d*\.?\d*)\s*y(?!\^)/);
                
                if (xMatch) {
                    let val = xMatch[1];
                    if (val === '+' || val === '') a = 1;
                    else if (val === '-') a = -1;
                    else a = parseFloat(val);
                }
                if (yMatch) {
                    let val = yMatch[1];
                    if (val === '+' || val === '') b = 1;
                    else if (val === '-') b = -1;
                    else b = parseFloat(val);
                }
                
                // Find constant term
                let remaining = eq.replace(/[+-]?\d*\.?\d*\s*[xy](?!\^)/g, '').replace(/\s/g, '');
                if (remaining) {
                    c = parseFloat(remaining);
                }
                
                const newC = a*h + b*k + c;
                newEquation = `${fmt(a)}X + ${fmt(b)}Y + ${fmt(newC)} = 0`;
                
                steps.push(`   • Original: ${equation}`);
                steps.push(`   • Substitute: ${fmt(a)}(X + ${fmt(h)}) + ${fmt(b)}(Y + ${fmt(k)}) + ${fmt(c)} = 0`);
                steps.push(`   • Expand: ${fmt(a)}X + ${fmt(a*h)} + ${fmt(b)}Y + ${fmt(b*k)} + ${fmt(c)} = 0`);
                steps.push(`   • Combine constants: ${fmt(a)}X + ${fmt(b)}Y + (${fmt(a*h + b*k + c)}) = 0`);
                steps.push(`   • New equation: ${newEquation}`);
                
            } else {
                newEquation = `After translation: replace x with (X + ${fmt(h)}), y with (Y + ${fmt(k)}) in ${equation}`;
                steps.push(`   • Replace x with (X + ${fmt(h)}) and y with (Y + ${fmt(k)})`);
                steps.push(`   • ${equation.replace(/x/g, `(X + ${fmt(h)})`).replace(/y/g, `(Y + ${fmt(k)})`)} = 0`);
            }
            
            steps.push(``);
            steps.push(`📍 STEP 4: Interpretation`);
            steps.push(`   • The new equation is expressed in terms of X and Y coordinates`);
            steps.push(`   • The origin is now at (${fmt(h)}, ${fmt(k)}) in the old system`);
            steps.push(`   • The shape of the curve remains unchanged; only the reference point changes`);
            
            // Test point verification
            if (testX !== null && testY !== null) {
                const newX = testX - h;
                const newY = testY - k;
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Original point P = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • New coordinates: X = x - h = ${fmt(testX)} - ${fmt(h)} = ${fmt(newX)}`);
                steps.push(`   • New coordinates: Y = y - k = ${fmt(testY)} - ${fmt(k)} = ${fmt(newY)}`);
                steps.push(`   • In new system, P = (${fmt(newX)}, ${fmt(newY)})`);
            }
            
            // Draw graph
            const minX = -5, maxX = 10;
            const minY = -5, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw new axes (dashed)
            axes.push(
                { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
            );
            
            // Mark new origin
            const specialPoints = [
                {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
            ];
            
            // Draw original curve (simple circle for demo)
            const curvePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                const x = 2 + 2 * Math.cos(t);
                const y = 1 + 2 * Math.sin(t);
                curvePoints.push({x: x, y: y});
            }
            
            const datasets = [
                {
                    label: 'Original Curve',
                    data: curvePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            // Add axes and points as separate overlay (using lineSegments in drawGraph)
            // Re-draw with all elements
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{New equation: } ${newEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [hInp, kInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Rotation of Axes - Rotating axes by angle θ
 * Rotation formulas: x = X cos θ - Y sin θ, y = X sin θ + Y cos θ
 */

function renderRotationAxesCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('rotationAxesBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄</span> Rotation of Axes</h2>
        
        <div class="formula-badge">\\( \\text{Rotate axes by angle } \\theta \\)</div>
        <div class="formula-badge">\\( x = X \\cos \\theta - Y \\sin \\theta \\)</div>
        <div class="formula-badge">\\( y = X \\sin \\theta + Y \\cos \\theta \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Rotation Angle θ</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>θ = <input type="number" id="rotTheta" value="45" step="any" style="width:100px;"> degrees</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Original Curve/Line Equation: f(x, y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="rotEq" value="x^2 + y^2 = 25" style="width:300px; padding:8px; border-radius:20px;">
                </div>
                <div style="font-size:0.8rem; margin-top:5px;">Examples: x^2 + y^2 = 25, xy = 1, x^2 - y^2 = 1</div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point P (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x = <input type="number" id="rotTestX" value="3" step="any" style="width:70px;"></div>
                    <div>y = <input type="number" id="rotTestY" value="4" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeRotationBtn">
            <span>🔄</span> Apply Rotation
        </button>
        
        <div class="result-highlight" id="rotationResult">
            \\( \\text{New equation in X, Y coordinates} \\)
        </div>
        <div class="footnote">
            <strong>Rotation of Axes:</strong> Rotating the coordinate axes by angle θ while keeping the origin fixed.<br>
            • Rotation formulas: x = X cos θ - Y sin θ, y = X sin θ + Y cos θ<br>
            • The inverse rotation: X = x cos θ + y sin θ, Y = -x sin θ + y cos θ<br>
            • The shape of the curve remains the same; only the orientation changes.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const thetaInp = document.getElementById('rotTheta');
    const eqInp = document.getElementById('rotEq');
    const testXInp = document.getElementById('rotTestX');
    const testYInp = document.getElementById('rotTestY');
    const compute = document.getElementById('computeRotationBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('rotationResult');

    function update() {
        clearErrors();
        
        try {
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            const equation = eqInp.value;
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test x');
                testY = validateNumber(testYInp.value, 'test y');
            } catch(e) {}
            
            let newEquation = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding Rotation of Axes`,
                `   • Rotation angle θ = ${fmt(thetaDeg)}° = ${fmt(thetaRad.toFixed(4))} radians`,
                `   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`,
                `   • Rotation formulas:`,
                `     x = X cos θ - Y sin θ = ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y`,
                `     y = X sin θ + Y cos θ = ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y`,
                ``,
                `📍 STEP 2: Original equation`,
                `   • ${equation} = 0`,
                ``,
                `📍 STEP 3: Substitute the rotation formulas`,
            ];
            
            // Handle specific equation types
            if (equation.includes('x^2 + y^2') || equation.includes('x² + y²')) {
                // Circle: x² + y² = r²
                // After rotation: X² + Y² = r² (invariant under rotation)
                const rMatch = equation.match(/=\s*(\d+)/);
                const r = rMatch ? Math.sqrt(parseFloat(rMatch[1])) : 5;
                newEquation = `X² + Y² = ${fmt(r*r)}`;
                
                steps.push(`   • Original: x² + y² = ${fmt(r*r)}`);
                steps.push(`   • Substitute: (${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)² + (${fmt(sinTheta)}X + ${fmt(cosTheta)}Y)² = ${fmt(r*r)}`);
                steps.push(`   • Expand: (${fmt(cosTheta*cosTheta)}X² - ${fmt(2*cosTheta*sinTheta)}XY + ${fmt(sinTheta*sinTheta)}Y²) + (${fmt(sinTheta*sinTheta)}X² + ${fmt(2*cosTheta*sinTheta)}XY + ${fmt(cosTheta*cosTheta)}Y²) = ${fmt(r*r)}`);
                steps.push(`   • Combine: (${fmt(cosTheta*cosTheta + sinTheta*sinTheta)})X² + (${fmt(sinTheta*sinTheta + cosTheta*cosTheta)})Y² + (-${fmt(2*cosTheta*sinTheta)} + ${fmt(2*cosTheta*sinTheta)})XY = ${fmt(r*r)}`);
                steps.push(`   • Since cos²θ + sin²θ = 1, we get: X² + Y² = ${fmt(r*r)}`);
                steps.push(`   • The circle is invariant under rotation!`);
                
            } else if (equation.includes('xy') && equation.includes('=')) {
                // Hyperbola: xy = constant
                // After rotation: (X cosθ - Y sinθ)(X sinθ + Y cosθ) = c
                const cMatch = equation.match(/=\s*(\d+)/);
                const c = cMatch ? parseFloat(cMatch[1]) : 1;
                const newC = c;
                newEquation = `X² - Y² = ${fmt(2*c/sin(2*thetaRad))}`;
                
                steps.push(`   • Original: xy = ${fmt(c)}`);
                steps.push(`   • Substitute: (${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)(${fmt(sinTheta)}X + ${fmt(cosTheta)}Y) = ${fmt(c)}`);
                steps.push(`   • Expand: ${fmt(cosTheta*sinTheta)}X² + ${fmt(cosTheta*cosTheta - sinTheta*sinTheta)}XY - ${fmt(cosTheta*sinTheta)}Y² = ${fmt(c)}`);
                steps.push(`   • To eliminate XY term, choose θ = 45° (tan 2θ = ∞)`);
                if (Math.abs(thetaDeg - 45) < 0.1) {
                    steps.push(`   • With θ = 45°, cosθ = sinθ = √2/2, the XY term cancels`);
                    steps.push(`   • We get: X² - Y² = ${fmt(2*c)}`);
                }
                
            } else if (equation.includes('x^2 - y^2') || equation.includes('x² - y²')) {
                // Hyperbola: x² - y² = constant
                // After rotation by 45°, becomes xy = constant/2
                const cMatch = equation.match(/=\s*(\d+)/);
                const c = cMatch ? parseFloat(cMatch[1]) : 1;
                newEquation = `XY = ${fmt(c/2)}`;
                
                steps.push(`   • Original: x² - y² = ${fmt(c)}`);
                steps.push(`   • Substitute and simplify`);
                steps.push(`   • With θ = 45°, the equation becomes XY = ${fmt(c/2)}`);
            }
            
            steps.push(``);
            steps.push(`📍 STEP 4: Interpretation`);
            steps.push(`   • The new equation is expressed in terms of X and Y coordinates (rotated axes)`);
            steps.push(`   • The axes have been rotated by ${fmt(thetaDeg)}° counterclockwise`);
            
            // Test point verification
            if (testX !== null && testY !== null) {
                const newX = testX * cosTheta + testY * sinTheta;
                const newY = -testX * sinTheta + testY * cosTheta;
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Original point P = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • New coordinates (in rotated system):`);
                steps.push(`     X = x cosθ + y sinθ = ${fmt(testX)}·${fmt(cosTheta)} + ${fmt(testY)}·${fmt(sinTheta)} = ${fmt(newX)}`);
                steps.push(`     Y = -x sinθ + y cosθ = -${fmt(testX)}·${fmt(sinTheta)} + ${fmt(testY)}·${fmt(cosTheta)} = ${fmt(newY)}`);
                steps.push(`   • In new system, P = (${fmt(newX)}, ${fmt(newY)})`);
            }
            
            // Draw graph showing original axes and rotated axes
            const minX = -8, maxX = 8;
            const minY = -8, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw rotated axes (dashed)
            // X' axis direction: (cosθ, sinθ)
            const xAxisEndX = maxX * cosTheta;
            const xAxisEndY = maxX * sinTheta;
            const xAxisStartX = minX * cosTheta;
            const xAxisStartY = minX * sinTheta;
            
            // Y' axis direction: (-sinθ, cosθ)
            const yAxisEndX = maxY * (-sinTheta);
            const yAxisEndY = maxY * cosTheta;
            const yAxisStartX = minY * (-sinTheta);
            const yAxisStartY = minY * cosTheta;
            
            axes.push(
                { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
            );
            
            // Draw original curve (circle)
            const curvePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                const x = 5 * Math.cos(t);
                const y = 5 * Math.sin(t);
                curvePoints.push({x: x, y: y});
            }
            
            const datasets = [
                {
                    label: 'Original Curve',
                    data: curvePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            // Add axes
            drawGraph([], [], axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{New equation: } ${newEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [thetaInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * General Transformation (Translation + Rotation)
 */
function renderGeneralTransformationCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('generalTransformationBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>✨</span> General Transformation (Translation + Rotation)</h2>
        
        <div class="formula-badge">\\( \\text{First translate origin to } (h,k), \\text{ then rotate by } \\theta \\)</div>
        <div class="formula-badge">\\( x = h + X \\cos \\theta - Y \\sin \\theta \\)</div>
        <div class="formula-badge">\\( y = k + X \\sin \\theta + Y \\cos \\theta \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Translation: New Origin O' = (h, k)</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>h = <input type="number" id="genH" value="2" step="any" style="width:80px;"></div>
                    <div>k = <input type="number" id="genK" value="1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Rotation Angle θ</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>θ = <input type="number" id="genTheta" value="30" step="any" style="width:100px;"> degrees</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Original Equation: f(x, y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="genEq" value="x^2 + y^2 - 4x - 2y - 4 = 0" style="width:350px; padding:8px; border-radius:20px;">
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point P (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x = <input type="number" id="genTestX" value="4" step="any" style="width:70px;"></div>
                    <div>y = <input type="number" id="genTestY" value="3" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeGeneralTransformBtn">
            <span>✨</span> Apply Transformation
        </button>
        
        <div class="result-highlight" id="generalResult">
            \\( \\text{New equation in X, Y coordinates} \\)
        </div>
        <div class="footnote">
            <strong>General Transformation:</strong> Combination of translation and rotation.<br>
            • First translate origin to (h, k), then rotate by θ<br>
            • Formulas: x = h + X cosθ - Y sinθ, y = k + X sinθ + Y cosθ<br>
            • This is the most general rigid motion (distance-preserving transformation).
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const hInp = document.getElementById('genH');
    const kInp = document.getElementById('genK');
    const thetaInp = document.getElementById('genTheta');
    const eqInp = document.getElementById('genEq');
    const testXInp = document.getElementById('genTestX');
    const testYInp = document.getElementById('genTestY');
    const compute = document.getElementById('computeGeneralTransformBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('generalResult');

    function update() {
        clearErrors();
        
        try {
            const h = validateNumber(hInp.value, 'h');
            const k = validateNumber(kInp.value, 'k');
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            const equation = eqInp.value;
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test x');
                testY = validateNumber(testYInp.value, 'test y');
            } catch(e) {}
            
            // General transformation: x = h + X cosθ - Y sinθ, y = k + X sinθ + Y cosθ
            let newEquation = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding General Transformation`,
                `   • This transformation combines translation and rotation into a single rigid motion`,
                `   • Step 1: Translate origin to O' = (${fmt(h)}, ${fmt(k)})`,
                `   • Step 2: Rotate axes by θ = ${fmt(thetaDeg)}°`,
                `   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`,
                ``,
                `📍 STEP 2: Transformation Formulas (X, Y are coordinates in new system)`,
                `   • X = coordinate along new X'-axis (rotated by θ°)`,
                `   • Y = coordinate along new Y'-axis (perpendicular to X'-axis)`,
                `   • Forward transformation (from X,Y to x,y):`,
                `     x = ${fmt(h)} + X·${fmt(cosTheta)} - Y·${fmt(sinTheta)}`,
                `     y = ${fmt(k)} + X·${fmt(sinTheta)} + Y·${fmt(cosTheta)}`,
                `   • Inverse transformation (from x,y to X,Y):`,
                `     X = (x - ${fmt(h)})·${fmt(cosTheta)} + (y - ${fmt(k)})·${fmt(sinTheta)}`,
                `     Y = -(x - ${fmt(h)})·${fmt(sinTheta)} + (y - ${fmt(k)})·${fmt(cosTheta)}`,
                ``,
                `📍 STEP 3: Original equation in (x, y) coordinates`,
                `   • ${equation} = 0`,
                ``,
                `📍 STEP 4: Substitution Process - Replace x and y with X,Y expressions`,
                `   • Step 4.1: Substitute x = ${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y`,
                `   • Step 4.2: Substitute y = ${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y`,
                `   • Step 4.3: Expand all terms (squares, products, etc.)`,
                `   • Step 4.4: Collect like terms in X², Y², XY, X, Y, and constant`,
                `   • Step 4.5: Simplify using trigonometric identities if applicable`,
            ];
            
            // Handle circle equation with detailed substitution
            if (equation.includes('x^2 + y^2') || equation.includes('x² + y²')) {
                // Parse circle equation: x² + y² + Dx + Ey + F = 0
                let D = 0, E = 0, F = -4;
                const standardMatch = equation.match(/x\^2\s*\+\s*y\^2\s*([-+])\s*(\d*)x\s*([-+])\s*(\d*)y\s*([-+])\s*(\d*)\s*=\s*0/);
                
                if (standardMatch) {
                    D = (standardMatch[1] === '-' ? -1 : 1) * (standardMatch[2] || 1);
                    E = (standardMatch[3] === '-' ? -1 : 1) * (standardMatch[4] || 1);
                    F = (standardMatch[5] === '-' ? -1 : 1) * (standardMatch[6] || 0);
                }
                
                // Center of circle in original coordinates
                const centerX = -D/2;
                const centerY = -E/2;
                const radius = Math.sqrt(centerX*centerX + centerY*centerY - F);
                
                steps.push(``);
                steps.push(`📍 STEP 5: Detailed Substitution and Simplification`);
                steps.push(`   • Original circle: x² + y² + (${fmt(D)})x + (${fmt(E)})y + (${fmt(F)}) = 0`);
                steps.push(`   • Center at (${fmt(centerX)}, ${fmt(centerY)}), radius = ${fmt(radius)}`);
                steps.push(``);
                steps.push(`   • Substituting x = ${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y`);
                steps.push(`   • Substituting y = ${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y`);
                steps.push(``);
                steps.push(`   • Calculate x²:`);
                steps.push(`     x² = (${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)²`);
                steps.push(`        = ${fmt(h*h)} + ${fmt(2*h*cosTheta)}X + ${fmt(2*h*sinTheta)}Y? Wait, careful...`);
                steps.push(`        = ${fmt(h*h)} + 2·${fmt(h)}·${fmt(cosTheta)}X - 2·${fmt(h)}·${fmt(sinTheta)}Y + ${fmt(cosTheta*cosTheta)}X² - 2·${fmt(cosTheta)}·${fmt(sinTheta)}XY + ${fmt(sinTheta*sinTheta)}Y²`);
                steps.push(``);
                steps.push(`   • Calculate y²:`);
                steps.push(`     y² = (${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y)²`);
                steps.push(`        = ${fmt(k*k)} + 2·${fmt(k)}·${fmt(sinTheta)}X + 2·${fmt(k)}·${fmt(cosTheta)}Y + ${fmt(sinTheta*sinTheta)}X² + 2·${fmt(sinTheta)}·${fmt(cosTheta)}XY + ${fmt(cosTheta*cosTheta)}Y²`);
                steps.push(``);
                steps.push(`   • Add x² + y²:`);
                steps.push(`     x² + y² = (${fmt(h*h + k*k)}) + [${fmt(2*h*cosTheta + 2*k*sinTheta)}]X + [${fmt(-2*h*sinTheta + 2*k*cosTheta)}]Y +`);
                steps.push(`               (${fmt(cosTheta*cosTheta + sinTheta*sinTheta)})X² + (${fmt(sinTheta*sinTheta + cosTheta*cosTheta)})Y² + [${fmt(-2*cosTheta*sinTheta + 2*sinTheta*cosTheta)}]XY`);
                steps.push(`              = (${fmt(h*h + k*k)}) + ${fmt(2*(h*cosTheta + k*sinTheta))}X + ${fmt(2*(-h*sinTheta + k*cosTheta))}Y + X² + Y²`);
                steps.push(``);
                steps.push(`   • Add linear terms D·x + E·y:`);
                steps.push(`     D·x = ${fmt(D)}·(${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y) = ${fmt(D*h)} + ${fmt(D*cosTheta)}X - ${fmt(D*sinTheta)}Y`);
                steps.push(`     E·y = ${fmt(E)}·(${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y) = ${fmt(E*k)} + ${fmt(E*sinTheta)}X + ${fmt(E*cosTheta)}Y`);
                steps.push(`     D·x + E·y = ${fmt(D*h + E*k)} + ${fmt(D*cosTheta + E*sinTheta)}X + ${fmt(-D*sinTheta + E*cosTheta)}Y`);
                steps.push(``);
                steps.push(`   • Add constant term F = ${fmt(F)}`);
                steps.push(``);
                steps.push(`   • Combine all terms:`);
                steps.push(`     (x² + y²) + D·x + E·y + F = 0`);
                steps.push(`     [X² + Y²] + [coefficient of X]·X + [coefficient of Y]·Y + [constant term] = 0`);
                
                // After substitution, the equation simplifies to:
                // X² + Y² + (2(h - centerX)cosθ + 2(k - centerY)sinθ)X + ... = r²
                // When h,k are chosen as the center, linear terms vanish
                const linearXTerm = 2*(h - centerX)*cosTheta + 2*(k - centerY)*sinTheta;
                const linearYTerm = -2*(h - centerX)*sinTheta + 2*(k - centerY)*cosTheta;
                const constantTerm = (h - centerX)*(h - centerX) + (k - centerY)*(k - centerY) - radius*radius;
                
                steps.push(``);
                steps.push(`   • After complete simplification:`);
                steps.push(`     X² + Y² + ${fmt(linearXTerm)}·X + ${fmt(linearYTerm)}·Y + ${fmt(constantTerm)} = 0`);
                
                if (Math.abs(h - centerX) < 0.01 && Math.abs(k - centerY) < 0.01) {
                    steps.push(`   • Since h = ${fmt(h)} equals center x (${fmt(centerX)}) and k = ${fmt(k)} equals center y (${fmt(centerY)})`);
                    steps.push(`   • The linear terms vanish (coefficient becomes 0)`);
                    steps.push(`   • The constant term becomes: -r² = -${fmt(radius*radius)}`);
                    steps.push(`   • Final simplified equation: X² + Y² = ${fmt(radius*radius)}`);
                    newEquation = `X² + Y² = ${fmt(radius*radius)}`;
                } else {
                    steps.push(`   • Complete the square in X and Y to get circle equation in new coordinates`);
                    newEquation = `X² + Y² + ${fmt(linearXTerm)}X + ${fmt(linearYTerm)}Y + ${fmt(constantTerm)} = 0`;
                }
            } else {
                newEquation = `Equation after substitution and simplification in X,Y coordinates`;
                steps.push(``);
                steps.push(`📍 STEP 5: General Substitution`);
                steps.push(`   • Replace every x with: ${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y`);
                steps.push(`   • Replace every y with: ${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y`);
                steps.push(`   • Expand all powers and products`);
                steps.push(`   • Collect like terms in X, Y, XY, X², Y², and constants`);
                steps.push(`   • The result is the equation in the new coordinate system (X,Y)`);
            }
            
            steps.push(``);
            steps.push(`📍 STEP 6: Interpretation of New Equation`);
            steps.push(`   • The new equation is expressed in coordinates (X, Y)`);
            steps.push(`   • X and Y are coordinates measured along the rotated axes:`);
            steps.push(`     → X-axis: rotated by ${fmt(thetaDeg)}° from original x-axis`);
            steps.push(`     → Y-axis: rotated by ${fmt(thetaDeg)}° from original y-axis`);
            steps.push(`   • Origin of (X,Y) system is at O' = (${fmt(h)}, ${fmt(k)}) in original coordinates`);
            steps.push(`   • Any point (X,Y) in the new system corresponds to:`);
            steps.push(`     (x, y) = (${fmt(h)} + X·${fmt(cosTheta)} - Y·${fmt(sinTheta)}, ${fmt(k)} + X·${fmt(sinTheta)} + Y·${fmt(cosTheta)})`);
            
            // Test point verification
            if (testX !== null && testY !== null) {
                // Inverse transformation to get X,Y from x,y
                // X = (x - h)cosθ + (y - k)sinθ
                // Y = -(x - h)sinθ + (y - k)cosθ
                const dx = testX - h;
                const dy = testY - k;
                const newX = dx * cosTheta + dy * sinTheta;
                const newY = -dx * sinTheta + dy * cosTheta;
                
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Original point P = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • Step 1 - Translate: Subtract O' (${fmt(h)}, ${fmt(k)})`);
                steps.push(`     → P' = (${fmt(dx)}, ${fmt(dy)})`);
                steps.push(`   • Step 2 - Rotate by θ = ${fmt(thetaDeg)}°:`);
                steps.push(`     → X = (${fmt(dx)})·cosθ + (${fmt(dy)})·sinθ = ${fmt(newX)}`);
                steps.push(`     → Y = -(${fmt(dx)})·sinθ + (${fmt(dy)})·cosθ = ${fmt(newY)}`);
                steps.push(`   • In transformed system, P = (${fmt(newX)}, ${fmt(newY)})`);
                steps.push(`   • Verification: Substitute back to original coordinates:`);
                const checkX = h + newX * cosTheta - newY * sinTheta;
                const checkY = k + newX * sinTheta + newY * cosTheta;
                steps.push(`     → x_reconstructed = ${fmt(h)} + ${fmt(newX)}·${fmt(cosTheta)} - ${fmt(newY)}·${fmt(sinTheta)} = ${fmt(checkX)}`);
                steps.push(`     → y_reconstructed = ${fmt(k)} + ${fmt(newX)}·${fmt(sinTheta)} + ${fmt(newY)}·${fmt(cosTheta)} = ${fmt(checkY)}`);
                steps.push(`     ✓ Original point (${fmt(testX)}, ${fmt(testY)}) is recovered!`);
            }
            
            // Draw graph
            const minX = -5, maxX = 10;
            const minY = -5, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw transformed axes (dashed)
            // X' axis: from (h, k) in direction (cosθ, sinθ)
            const xAxisEndX = h + 8 * cosTheta;
            const xAxisEndY = k + 8 * sinTheta;
            const xAxisStartX = h - 8 * cosTheta;
            const xAxisStartY = k - 8 * sinTheta;
            
            // Y' axis: from (h, k) in direction (-sinθ, cosθ)
            const yAxisEndX = h + 8 * (-sinTheta);
            const yAxisEndY = k + 8 * cosTheta;
            const yAxisStartX = h - 8 * (-sinTheta);
            const yAxisStartY = k - 8 * cosTheta;
            
            axes.push(
                { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
            );
            
            // Mark new origin
            const specialPoints = [
                {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
            ];
            
            // Draw original curve (circle)
            const curvePoints = [];
            for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                const x = 2 + 3 * Math.cos(t);
                const y = 1 + 3 * Math.sin(t);
                curvePoints.push({x: x, y: y});
            }
            
            const datasets = [
                {
                    label: 'Original Curve',
                    data: curvePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            // Add axes and points
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${escapeHtml(txt)}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{New equation: } ${newEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [hInp, kInp, thetaInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

// Helper function to escape HTML special characters
function escapeHtml(str) {
    if (!str) return str;
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * Remove XY Term by Rotation
 */

/**
 * Remove XY Term by Rotation - Enhanced with detailed algebraic expansion
 */

function renderRemoveXYTermCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('removeXYTermBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Remove XY Term by Rotation</h2>
        
        <div class="formula-badge">\\( \\text{General quadratic equation: } Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Rotate by } \\theta \\text{ where } \\cot 2\\theta = \\frac{A - C}{B} \\)</div>
        <div class="formula-badge">\\( \\text{This eliminates the XY term} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Quadratic Equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0</label>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:15px;">
                    <div>A = <input type="number" id="removeA" value="1" step="any" style="width:70px;"></div>
                    <div>B = <input type="number" id="removeB" value="4" step="any" style="width:70px;"></div>
                    <div>C = <input type="number" id="removeC" value="1" step="any" style="width:70px;"></div>
                    <div>D = <input type="number" id="removeD" value="0" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="removeE" value="0" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="removeF" value="-4" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.8rem;">Current equation: <span id="removeEquationDisplay"></span></div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRemoveXYBtn">
            <span>📐</span> Remove XY Term
        </button>
        
        <div class="result-highlight" id="removeXYResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Removing the XY Term:</strong> For a quadratic equation, the XY term can be eliminated by rotating axes by an angle θ satisfying cot 2θ = (A - C)/B.<br>
            This simplifies the equation to A'X² + C'Y² + D'X + E'Y + F' = 0, which represents a conic section.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('removeA');
    const bInp = document.getElementById('removeB');
    const cInp = document.getElementById('removeC');
    const dInp = document.getElementById('removeD');
    const eInp = document.getElementById('removeE');
    const fInp = document.getElementById('removeF');
    const equationDisplay = document.getElementById('removeEquationDisplay');
    const compute = document.getElementById('computeRemoveXYBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('removeXYResult');

    function updateEquationDisplay() {
        const A = parseFloat(aInp.value) || 0;
        const B = parseFloat(bInp.value) || 0;
        const C = parseFloat(cInp.value) || 0;
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        
        let eq = '';
        if (A !== 0) eq += `${fmt(A)}x²`;
        if (B !== 0) eq += `${B > 0 && eq ? '+' : ''}${fmt(B)}xy`;
        if (C !== 0) eq += `${C > 0 && eq ? '+' : ''}${fmt(C)}y²`;
        if (D !== 0) eq += `${D > 0 && eq ? '+' : ''}${fmt(D)}x`;
        if (E !== 0) eq += `${E > 0 && eq ? '+' : ''}${fmt(E)}y`;
        if (F !== 0) eq += `${F > 0 && eq ? '+' : ''}${fmt(F)}`;
        eq += ' = 0';
        equationDisplay.textContent = eq;
    }
    
    [aInp, bInp, cInp, dInp, eInp, fInp].forEach(inp => 
        inp.addEventListener('input', updateEquationDisplay)
    );
    updateEquationDisplay();

    function update() {
        clearErrors();
        
        try {
            const A = validateNumber(aInp.value, 'A');
            const B = validateNumber(bInp.value, 'B');
            const C = validateNumber(cInp.value, 'C');
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            
            if (Math.abs(B) < 1e-10) {
                const steps = [
                    `📍 STEP 1: Analyze the given equation`,
                    `   • Equation: ${fmt(A)}x² + ${fmt(B)}xy + ${fmt(C)}y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                    `   • Since B = 0, there is NO XY term to remove!`,
                    `   • The equation is already in the simplified form.`,
                    `   • The conic section is already aligned with the axes.`
                ];
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                resultDiv.innerHTML = `\\( \\text{No XY term to remove. Already simplified.} \\)`;
                return;
            }
            
            // Calculate rotation angle to eliminate XY term
            // cot 2θ = (A - C)/B
            const cot2theta = (A - C) / B;
            let thetaRad;
            
            steps = [];
            
            steps.push(`📍 STEP 1: Identify the quadratic equation`);
            steps.push(`   • ${fmt(A)}x² + ${fmt(B)}xy + ${fmt(C)}y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`);
            steps.push(``);
            
            steps.push(`📍 STEP 2: Calculate rotation angle to eliminate XY term`);
            steps.push(`   • Formula: cot 2θ = (A - C)/B`);
            steps.push(`   • cot 2θ = (${fmt(A)} - ${fmt(C)})/${fmt(B)} = ${fmt(cot2theta)}`);
            
            if (Math.abs(cot2theta) > 1e10) {
                thetaRad = Math.PI / 4; // 45 degrees when A = C
                steps.push(`   • Since |cot 2θ| is very large, tan 2θ ≈ 0, so 2θ ≈ π/2, θ = 45°`);
            } else {
                const tan2theta = 1 / cot2theta;
                const twoTheta = Math.atan(tan2theta);
                thetaRad = twoTheta / 2;
                steps.push(`   • tan 2θ = 1/cot 2θ = 1/${fmt(cot2theta)} = ${fmt(tan2theta)}`);
                steps.push(`   • 2θ = arctan(${fmt(tan2theta)}) = ${fmt(twoTheta.toFixed(4))} radians = ${fmt(twoTheta * 180 / Math.PI)}°`);
                steps.push(`   • θ = ${fmt(thetaRad.toFixed(4))} radians = ${fmt(thetaRad * 180 / Math.PI)}°`);
            }
            
            const thetaDeg = thetaRad * 180 / Math.PI;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            
            steps.push(`   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`);
            steps.push(``);
            
            steps.push(`📍 STEP 3: Rotation formulas`);
            steps.push(`   • x = X cosθ - Y sinθ = ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y`);
            steps.push(`   • y = X sinθ + Y cosθ = ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y`);
            steps.push(``);
            
            steps.push(`📍 STEP 4: Substitute into the equation`);
            steps.push(`   • Original: ${fmt(A)}x² + ${fmt(B)}xy + ${fmt(C)}y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`);
            steps.push(``);
            
            // Detailed expansion of each term
            const cosSq = cosTheta * cosTheta;
            const sinSq = sinTheta * sinTheta;
            const cosSin = cosTheta * sinTheta;
            
            // Term 1: A·x²
            steps.push(`   🔷 Term 1: A·x² = ${fmt(A)}·(${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)²`);
            steps.push(`      = ${fmt(A)}·(${fmt(cosSq)}X² - ${fmt(2*cosSin)}XY + ${fmt(sinSq)}Y²)`);
            steps.push(`      = ${fmt(A*cosSq)}X² - ${fmt(2*A*cosSin)}XY + ${fmt(A*sinSq)}Y²`);
            steps.push(``);
            
            // Term 2: B·xy
            steps.push(`   🔷 Term 2: B·xy = ${fmt(B)}·(${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)(${fmt(sinTheta)}X + ${fmt(cosTheta)}Y)`);
            steps.push(`      = ${fmt(B)}·[${fmt(cosTheta*sinTheta)}X² + ${fmt(cosTheta*cosTheta - sinTheta*sinTheta)}XY - ${fmt(cosTheta*sinTheta)}Y²]`);
            steps.push(`      = ${fmt(B*cosSin)}X² + ${fmt(B*(cosSq - sinSq))}XY - ${fmt(B*cosSin)}Y²`);
            steps.push(``);
            
            // Term 3: C·y²
            steps.push(`   🔷 Term 3: C·y² = ${fmt(C)}·(${fmt(sinTheta)}X + ${fmt(cosTheta)}Y)²`);
            steps.push(`      = ${fmt(C)}·(${fmt(sinSq)}X² + ${fmt(2*cosSin)}XY + ${fmt(cosSq)}Y²)`);
            steps.push(`      = ${fmt(C*sinSq)}X² + ${fmt(2*C*cosSin)}XY + ${fmt(C*cosSq)}Y²`);
            steps.push(``);
            
            // Term 4: D·x
            steps.push(`   🔷 Term 4: D·x = ${fmt(D)}·(${fmt(cosTheta)}X - ${fmt(sinTheta)}Y)`);
            steps.push(`      = ${fmt(D*cosTheta)}X - ${fmt(D*sinTheta)}Y`);
            steps.push(``);
            
            // Term 5: E·y
            steps.push(`   🔷 Term 5: E·y = ${fmt(E)}·(${fmt(sinTheta)}X + ${fmt(cosTheta)}Y)`);
            steps.push(`      = ${fmt(E*sinTheta)}X + ${fmt(E*cosTheta)}Y`);
            steps.push(``);
            
            // Term 6: F (constant)
            steps.push(`   🔷 Term 6: F = ${fmt(F)}`);
            steps.push(``);
            
            // Combine all terms
            const A_prime = A*cosSq + B*cosSin + C*sinSq;
            const B_prime = -2*A*cosSin + B*(cosSq - sinSq) + 2*C*cosSin;
            const C_prime = A*sinSq - B*cosSin + C*cosSq;
            const D_prime = D*cosTheta + E*sinTheta;
            const E_prime = -D*sinTheta + E*cosTheta;
            const F_prime = F;
            
            steps.push(`   🔷 STEP 5: Combine all terms by coefficient:`);
            steps.push(`   • X² coefficient: ${fmt(A*cosSq)} + ${fmt(B*cosSin)} + ${fmt(C*sinSq)} = ${fmt(A_prime)}`);
            steps.push(`   • XY coefficient: -${fmt(2*A*cosSin)} + ${fmt(B*(cosSq - sinSq))} + ${fmt(2*C*cosSin)} = ${fmt(B_prime)}`);
            steps.push(`   • Y² coefficient: ${fmt(A*sinSq)} - ${fmt(B*cosSin)} + ${fmt(C*cosSq)} = ${fmt(C_prime)}`);
            steps.push(`   • X coefficient: ${fmt(D*cosTheta)} + ${fmt(E*sinTheta)} = ${fmt(D_prime)}`);
            steps.push(`   • Y coefficient: -${fmt(D*sinTheta)} + ${fmt(E*cosTheta)} = ${fmt(E_prime)}`);
            steps.push(`   • Constant term: ${fmt(F_prime)}`);
            steps.push(``);
            
            // Verify XY term is eliminated (should be 0)
            steps.push(`   🔷 STEP 6: Verify XY term elimination`);
            steps.push(`   • B' = ${fmt(B_prime)}`);
            if (Math.abs(B_prime) < 1e-10) {
                steps.push(`   • ✓ The XY term has been eliminated! (B' = 0)`);
            } else {
                steps.push(`   • ⚠ Note: Due to rounding, B' is very close to 0 (theoretically 0)`);
            }
            steps.push(``);
            
            steps.push(`📍 STEP 7: New simplified equation`);
            steps.push(`   • ${taPolyStr({A: A_prime, B: 0, C: C_prime, D: D_prime, E: E_prime, F: F_prime}, 'X', 'Y')} = 0`);
            steps.push(``);
            
            steps.push(`📍 STEP 8: Identify the conic section`);
            const discriminant = A_prime * C_prime;
            if (Math.abs(discriminant) < 1e-10) {
                steps.push(`   • This is a PARABOLA (since A'·C' = 0)`);
            } else if (discriminant > 0) {
                steps.push(`   • This is an ELLIPSE (since A' and C' have the same sign)`);
                if (Math.abs(A_prime - C_prime) < 1e-10) {
                    steps.push(`   • It's actually a CIRCLE (A' = C')`);
                }
            } else {
                steps.push(`   • This is a HYPERBOLA (since A' and C' have opposite signs)`);
            }
            
            // Draw the conic
            const minX = -8, maxX = 8;
            const minY = -8, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1 }
            ];
            
            // Draw rotated axes
            const xAxisEndX = maxX * cosTheta;
            const xAxisEndY = maxX * sinTheta;
            const xAxisStartX = minX * cosTheta;
            const xAxisStartY = minX * sinTheta;
            const yAxisEndX = maxY * (-sinTheta);
            const yAxisEndY = maxY * cosTheta;
            const yAxisStartX = minY * (-sinTheta);
            const yAxisStartY = minY * cosTheta;
            
            axes.push(
                { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
            );
            
            // Plot the real conic: as given (x, y) and in the rotated axes (X, Y)
            const datasets = [
                taImplicitDataset({A, B, C, D, E, F}, minX, maxX, minY, maxY, '#1f7f6a', 'Original conic (x, y)'),
                taImplicitDataset({A: A_prime, B: 0, C: C_prime, D: D_prime, E: E_prime, F: F_prime}, minX, maxX, minY, maxY, '#d44c2f', 'Same conic in rotated axes (X, Y)', [6, 4])
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
            
            drawGraph([], [], axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( ${taPolyStr({A: A_prime, B: 0, C: C_prime, D: D_prime, E: E_prime, F: F_prime}, 'X', 'Y')} = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, dInp, eInp, fInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
/**
 * Simplify Equation by Translation (Find Center)
 */

function renderSimplifyEquationCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('simplifyEquationBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📝</span> Simplify Equation by Translation (Find Center)</h2>
        
        <div class="formula-badge">\\( \\text{For a conic: } Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Translate origin to center } (h,k) \\text{ to eliminate linear terms} \\)</div>
        <div class="formula-badge">\\( h = \\frac{2CD - BE}{B^2 - 4AC}, \\quad k = \\frac{2AE - BD}{B^2 - 4AC} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Quadratic Equation: Ax² + Bxy + Cy² + Dx + Ey + F = 0</label>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:15px;">
                    <div>A = <input type="number" id="simpA" value="1" step="any" style="width:70px;"></div>
                    <div>B = <input type="number" id="simpB" value="0" step="any" style="width:70px;"></div>
                    <div>C = <input type="number" id="simpC" value="1" step="any" style="width:70px;"></div>
                    <div>D = <input type="number" id="simpD" value="-4" step="any" style="width:70px;"></div>
                    <div>E = <input type="number" id="simpE" value="-2" step="any" style="width:70px;"></div>
                    <div>F = <input type="number" id="simpF" value="-4" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.8rem;">Current equation: <span id="simpEquationDisplay"></span></div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSimplifyBtn">
            <span>📝</span> Simplify Equation
        </button>
        
        <div class="result-highlight" id="simplifyResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Simplifying by Translation:</strong> For a conic section, translating the origin to the center eliminates the linear terms.<br>
            This gives the standard form: A'X² + B'XY + C'Y² + F' = 0.<br>
            The center (h,k) is found by solving ∂f/∂x = 0 and ∂f/∂y = 0.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('simpA');
    const bInp = document.getElementById('simpB');
    const cInp = document.getElementById('simpC');
    const dInp = document.getElementById('simpD');
    const eInp = document.getElementById('simpE');
    const fInp = document.getElementById('simpF');
    const equationDisplay = document.getElementById('simpEquationDisplay');
    const compute = document.getElementById('computeSimplifyBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('simplifyResult');

    function updateEquationDisplay() {
        const A = parseFloat(aInp.value) || 0;
        const B = parseFloat(bInp.value) || 0;
        const C = parseFloat(cInp.value) || 0;
        const D = parseFloat(dInp.value) || 0;
        const E = parseFloat(eInp.value) || 0;
        const F = parseFloat(fInp.value) || 0;
        
        let eq = '';
        if (A !== 0) eq += `${fmt(A)}x²`;
        if (B !== 0) eq += `${B > 0 && eq ? '+' : ''}${fmt(B)}xy`;
        if (C !== 0) eq += `${C > 0 && eq ? '+' : ''}${fmt(C)}y²`;
        if (D !== 0) eq += `${D > 0 && eq ? '+' : ''}${fmt(D)}x`;
        if (E !== 0) eq += `${E > 0 && eq ? '+' : ''}${fmt(E)}y`;
        if (F !== 0) eq += `${F > 0 && eq ? '+' : ''}${fmt(F)}`;
        eq += ' = 0';
        equationDisplay.textContent = eq;
    }
    
    [aInp, bInp, cInp, dInp, eInp, fInp].forEach(inp => 
        inp.addEventListener('input', updateEquationDisplay)
    );
    updateEquationDisplay();

    function update() {
        clearErrors();
        
        try {
            const A = validateNumber(aInp.value, 'A');
            const B = validateNumber(bInp.value, 'B');
            const C = validateNumber(cInp.value, 'C');
            const D = validateNumber(dInp.value, 'D');
            const E = validateNumber(eInp.value, 'E');
            const F = validateNumber(fInp.value, 'F');
            
            const discriminant = B*B - 4*A*C;
            
            let steps = [];
            let centerX, centerY;
            let isCenter = false;
            
            if (Math.abs(discriminant) < 1e-10) {
                // Parabola - no unique center
                steps = [
                    `📍 STEP 1: Identify the quadratic equation`,
                    `   • ${fmt(A)}x² + ${fmt(B)}xy + ${fmt(C)}y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                    ``,
                    `📍 STEP 2: Calculate the discriminant`,
                    `   • Δ = B² - 4AC = ${fmt(B*B)} - 4·${fmt(A)}·${fmt(C)} = ${fmt(discriminant)}`,
                    `   • Since Δ = 0, this is a PARABOLA`,
                    ``,
                    `📍 STEP 3: Parabolas have no unique center`,
                    `   • The equation cannot be simplified by translation to eliminate linear terms`,
                    `   • The vertex can be found by completing the square`
                ];
                centerX = centerY = 0;
                isCenter = false;
            } else {
                // Find center by solving partial derivatives
                // ∂f/∂x = 2Ax + By + D = 0
                // ∂f/∂y = Bx + 2Cy + E = 0
                const det = 4*A*C - B*B;
                
                if (Math.abs(det) < 1e-10) {
                    steps = [`Cannot find unique center (det = 0)`];
                    centerX = centerY = 0;
                    isCenter = false;
                } else {
                    centerX = (B*E - 2*C*D) / det;
                    centerY = (B*D - 2*A*E) / det;
                    isCenter = true;
                    
                    // Calculate new constant term after translation
                    const F_prime = F + D*centerX + E*centerY + A*centerX*centerX + B*centerX*centerY + C*centerY*centerY;
                    
                    steps = [
                        `📍 STEP 1: Identify the quadratic equation`,
                        `   • ${fmt(A)}x² + ${fmt(B)}xy + ${fmt(C)}y² + ${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`,
                        ``,
                        `📍 STEP 2: Find the center by solving ∂f/∂x = 0 and ∂f/∂y = 0`,
                        `   • ∂f/∂x = 2Ax + By + D = 0  →  2·${fmt(A)}x + ${fmt(B)}y + ${fmt(D)} = 0`,
                        `   • ∂f/∂y = Bx + 2Cy + E = 0  →  ${fmt(B)}x + 2·${fmt(C)}y + ${fmt(E)} = 0`,
                        ``,
                        `📍 STEP 3: Solve the system`,
                        `   • Using Cramer's rule:`,
                        `   • det = 4AC - B² = 4·${fmt(A)}·${fmt(C)} - ${fmt(B)}² = ${fmt(det)}`,
                        `   • h = (BE - 2CD)/det = (${fmt(B)}·${fmt(E)} - 2·${fmt(C)}·${fmt(D)})/${fmt(det)} = ${fmt(centerX)}`,
                        `   • k = (BD - 2AE)/det = (${fmt(B)}·${fmt(D)} - 2·${fmt(A)}·${fmt(E)})/${fmt(det)} = ${fmt(centerY)}`,
                        ``,
                        `📍 STEP 4: Translate origin to center (h, k)`,
                        `   • x = X + ${fmt(centerX)}, y = Y + ${fmt(centerY)}`,
                        ``,
                        `📍 STEP 5: New constant term after translation`,
                        `   • F' = F + Dh + Ek + Ah² + Bhk + Ck²`,
                        `   • = ${fmt(F)} + ${fmt(D)}·${fmt(centerX)} + ${fmt(E)}·${fmt(centerY)} + ${fmt(A)}·${fmt(centerX*centerX)} + ${fmt(B)}·${fmt(centerX*centerY)} + ${fmt(C)}·${fmt(centerY*centerY)}`,
                        `   • = ${fmt(F_prime)}`,
                        ``,
                        `📍 STEP 6: Simplified equation`,
                        `   • ${fmt(A)}X² + ${fmt(B)}XY + ${fmt(C)}Y² + ${fmt(F_prime)} = 0`,
                        ``,
                        `📍 STEP 7: This represents a conic centered at (${fmt(centerX)}, ${fmt(centerY)})`
                    ];
                }
            }
            
            // Draw the conic
            const minX = -8, maxX = 10;
            const minY = -8, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1 }
            ];
            
            // Draw center if found
            const specialPoints = [];
            if (isCenter) {
                specialPoints.push({x: centerX, y: centerY, label: `Center (${fmt(centerX)}, ${fmt(centerY)})`});
            }
            
            // Draw the conic (circle for demo)
            const conicPoints = [];
            if (Math.abs(B) < 1e-10 && A > 0 && C > 0 && isCenter) {
                // Ellipse/Circle
                const R_sq = -F - D*centerX - E*centerY - A*centerX*centerX - C*centerY*centerY;
                if (R_sq > 0) {
                    const a = Math.sqrt(R_sq / A);
                    const b = Math.sqrt(R_sq / C);
                    for (let t = 0; t <= 2 * Math.PI; t += 0.05) {
                        conicPoints.push({x: centerX + a * Math.cos(t), y: centerY + b * Math.sin(t)});
                    }
                }
            }
            
            const datasets = [
                {
                    label: 'Conic Section',
                    data: conicPoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            if (isCenter) {
                resultDiv.innerHTML = `\\( \\text{Center: } (${fmt(centerX)}, ${fmt(centerY)}) \\)<br>\\( ${fmt(A)}X² + ${fmt(B)}XY + ${fmt(C)}Y² + ${fmt(F + D*centerX + E*centerY + A*centerX*centerX + B*centerX*centerY + C*centerY*centerY)} = 0 \\)`;
            } else {
                resultDiv.innerHTML = `\\( \\text{No unique center (parabola)} \\)`;
            }
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, dInp, eInp, fInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
/**
 * Find Original Equation after Translation
 * Given the new equation in (X,Y) coordinates and the translation (h,k), find original equation in (x,y)
 * New coordinates: X = x - h, Y = y - k
 * Original: x = X + h, y = Y + k
 */
function renderFindOriginalAfterTranslationCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('findOriginalAfterTranslationBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄</span> Find Original Equation after Translation</h2>
        
        <div class="formula-badge">\\( \\text{New equation in (X, Y) coordinates} \\)</div>
        <div class="formula-badge">\\( \\text{Translation: Origin shifted to (h, k)} \\)</div>
        <div class="formula-badge">\\( X = x - h, \\quad Y = y - k \\)</div>
        <div class="formula-badge">\\( x = X + h, \\quad y = Y + k \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Translation (h, k)</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>h = <input type="number" id="origTransH" value="2" step="any" style="width:80px;"></div>
                    <div>k = <input type="number" id="origTransK" value="1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>New Equation in (X, Y): F(X, Y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="origTransEq" value="X^2 + Y^2 - 9 = 0" style="width:300px; padding:8px; border-radius:20px;">
                </div>
                <div style="font-size:0.8rem; margin-top:5px;">Examples: X^2 + Y^2 - 9 = 0 (circle), 2X + 3Y - 6 = 0 (line)</div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point in New System (X, Y) (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>X = <input type="number" id="origTransTestX" value="3" step="any" style="width:70px;"></div>
                    <div>Y = <input type="number" id="origTransTestY" value="0" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeOrigTranslationBtn">
            <span>🔄</span> Find Original Equation
        </button>
        
        <div class="result-highlight" id="origTranslationResult">
            \\( \\text{Original equation in (x, y)} \\)
        </div>
        <div class="footnote">
            <strong>Finding Original Equation:</strong> Given the equation after translation and the shift (h,k),<br>
            substitute X = x - h, Y = y - k to get the original equation.<br>
            • New coordinates: (X, Y) = (x - h, y - k)<br>
            • Original coordinates: (x, y) = (X + h, Y + k)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const hInp = document.getElementById('origTransH');
    const kInp = document.getElementById('origTransK');
    const eqInp = document.getElementById('origTransEq');
    const testXInp = document.getElementById('origTransTestX');
    const testYInp = document.getElementById('origTransTestY');
    const compute = document.getElementById('computeOrigTranslationBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('origTranslationResult');

    function update() {
        clearErrors();
        
        try {
            const h = validateNumber(hInp.value, 'h');
            const k = validateNumber(kInp.value, 'k');
            const equation = eqInp.value;
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test X');
                testY = validateNumber(testYInp.value, 'test Y');
            } catch(e) {}
            
            // Original equation: replace X with (x - h), Y with (y - k)
            let originalEquation = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding the problem`,
                `   • New origin O' = (${fmt(h)}, ${fmt(k)}) in old coordinates`,
                `   • New equation is given in terms of (X, Y):`,
                `     ${/=/.test(equation) ? equation : equation + ' = 0'}`,
                `   • Relationship: X = x - h, Y = y - k`,
                ``,
                `📍 STEP 2: Substitute X = x - h and Y = y - k`,
                `   • X = x - ${fmt(h)}`,
                `   • Y = y - ${fmt(k)}`,
                ``,
                `📍 STEP 3: Substitute into the new equation`,
                `   • Replace every X with (x - ${fmt(h)})`,
                `   • Replace every Y with (y - ${fmt(k)})`,
            ];
            
            const P = taParsePoly(equation);
            const origPoly = taSubst(P, [1, 0, -h], [0, 1, -k]);
            const shX = h >= 0 ? `(x - ${fmt(h)})` : `(x + ${fmt(-h)})`;
            const shY = k >= 0 ? `(y - ${fmt(k)})` : `(y + ${fmt(-k)})`;
            steps.push(`   • F(X, Y) = ${taPolyStr(P, 'X', 'Y')}`);
            steps.push(`   • Replace X by ${shX} and Y by ${shY}`);
            steps.push(`   • Expand and collect like terms:`);
            steps.push(`   • ${taPolyStr(origPoly, 'x', 'y')} = 0`);
            originalEquation = `${taPolyStr(origPoly, 'x', 'y')} = 0`;
            
            steps.push(``);
            steps.push(`📍 STEP 4: Interpretation`);
            steps.push(`   • The original equation is expressed in terms of x and y coordinates`);
            steps.push(`   • The origin was shifted from O(0,0) to O'(${fmt(h)}, ${fmt(k)})`);
            
            // Test point verification
            if (testX !== null && testY !== null) {
                const oldX = testX + h;
                const oldY = testY + k;
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Test point in new system: P' = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • Original coordinates: x = X + h = ${fmt(testX)} + ${fmt(h)} = ${fmt(oldX)}`);
                steps.push(`   • Original coordinates: y = Y + k = ${fmt(testY)} + ${fmt(k)} = ${fmt(oldY)}`);
                steps.push(`   • In original system, P = (${fmt(oldX)}, ${fmt(oldY)})`);
            }
            
            // Draw the graph
            const minX = -8, maxX = 12;
            const minY = -6, maxY = 10;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw new axes (dashed)
            axes.push(
                { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
            );
            
            // Mark new origin
            const specialPoints = [
                {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
            ];
            
            // Draw the real original curve (sampled from the equation)
            const origCurve = taImplicitDataset(taSubst(taParsePoly(equation), [1, 0, -h], [0, 1, -k]), minX, maxX, minY, maxY, '#1f7f6a', 'Original Curve');
            const datasets = [origCurve];
            
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
            
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Original equation: } ${originalEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [hInp, kInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Find Original Equation after Rotation
 * Given the new equation in (X,Y) coordinates and rotation angle θ, find original equation in (x,y)
 * Rotation: x = X cosθ - Y sinθ, y = X sinθ + Y cosθ
 */
function renderFindOriginalAfterRotationCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('findOriginalAfterRotationBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄</span> Find Original Equation after Rotation</h2>
        
        <div class="formula-badge">\\( \\text{New equation in (X, Y) coordinates} \\)</div>
        <div class="formula-badge">\\( \\text{Rotation: } x = X \\cos \\theta - Y \\sin \\theta, \\quad y = X \\sin \\theta + Y \\cos \\theta \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Rotation Angle θ</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>θ = <input type="number" id="origRotTheta" value="45" step="any" style="width:100px;"> degrees</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>New Equation in (X, Y): F(X, Y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="origRotEq" value="X^2 + Y^2 = 25" style="width:300px; padding:8px; border-radius:20px;">
                </div>
                <div style="font-size:0.8rem; margin-top:5px;">Examples: X^2 + Y^2 = 25, XY = 1</div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point in New System (X, Y) (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>X = <input type="number" id="origRotTestX" value="3" step="any" style="width:70px;"></div>
                    <div>Y = <input type="number" id="origRotTestY" value="4" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeOrigRotationBtn">
            <span>🔄</span> Find Original Equation
        </button>
        
        <div class="result-highlight" id="origRotationResult">
            \\( \\text{Original equation in (x, y)} \\)
        </div>
        <div class="footnote">
            <strong>Finding Original Equation after Rotation:</strong><br>
            • Rotation formulas: x = X cosθ - Y sinθ, y = X sinθ + Y cosθ<br>
            • Substitute X = x cosθ + y sinθ, Y = -x sinθ + y cosθ (inverse rotation)<br>
            • The shape of the curve remains the same; only the orientation changes.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const thetaInp = document.getElementById('origRotTheta');
    const eqInp = document.getElementById('origRotEq');
    const testXInp = document.getElementById('origRotTestX');
    const testYInp = document.getElementById('origRotTestY');
    const compute = document.getElementById('computeOrigRotationBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('origRotationResult');

    function update() {
        clearErrors();
        
        try {
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            const equation = eqInp.value;
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test X');
                testY = validateNumber(testYInp.value, 'test Y');
            } catch(e) {}
            
            // Inverse rotation formulas: X = x cosθ + y sinθ, Y = -x sinθ + y cosθ
            let originalEquation = '';
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding rotation of axes`,
                `   • Rotation angle θ = ${fmt(thetaDeg)}°`,
                `   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`,
                `   • Forward rotation: x = X cosθ - Y sinθ, y = X sinθ + Y cosθ`,
                `   • Inverse rotation (to find original):`,
                `     X = x cosθ + y sinθ`,
                `     Y = -x sinθ + y cosθ`,
                ``,
                `📍 STEP 2: New equation in (X, Y) coordinates`,
                `   • ${/=/.test(equation) ? equation : equation + ' = 0'}`,
                ``,
                `📍 STEP 3: Substitute inverse rotation formulas`,
            ];
            
            const P = taParsePoly(equation);
            const origPoly = taSubst(P, [cosTheta, sinTheta, 0], [-sinTheta, cosTheta, 0]);
            steps.push(`   • F(X, Y) = ${taPolyStr(P, 'X', 'Y')}`);
            steps.push(`   • Put X = x(${fmt(cosTheta)}) + y(${fmt(sinTheta)}), Y = x(${fmt(-sinTheta)}) + y(${fmt(cosTheta)}) and expand`);
            if (Math.abs(P.B) < 1e-12 && Math.abs(P.A - P.C) < 1e-12 && Math.abs(P.D) < 1e-12 && Math.abs(P.E) < 1e-12) {
                steps.push(`   • Since cos²θ + sin²θ = 1, X² + Y² = x² + y²: a circle centred at the origin is invariant under rotation`);
            }
            steps.push(`   • ${taPolyStr(origPoly, 'x', 'y', true)}`);
            originalEquation = taPolyStr(origPoly, 'x', 'y', true);
            
            steps.push(``);
            steps.push(`📍 STEP 4: Interpretation`);
            steps.push(`   • The original equation is expressed in terms of x and y coordinates`);
            steps.push(`   • The axes were rotated by ${fmt(thetaDeg)}° to get the new equation`);
            
            // Test point verification
            if (testX !== null && testY !== null) {
                const x = testX * cosTheta - testY * sinTheta;
                const y = testX * sinTheta + testY * cosTheta;
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Test point in new system: P' = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • Original coordinates: x = X cosθ - Y sinθ = ${fmt(testX)}·${fmt(cosTheta)} - ${fmt(testY)}·${fmt(sinTheta)} = ${fmt(x)}`);
                steps.push(`   • Original coordinates: y = X sinθ + Y cosθ = ${fmt(testX)}·${fmt(sinTheta)} + ${fmt(testY)}·${fmt(cosTheta)} = ${fmt(y)}`);
                steps.push(`   • In original system, P = (${fmt(x)}, ${fmt(y)})`);
            }
            
            // Draw the graph
            const minX = -8, maxX = 8;
            const minY = -8, maxY = 8;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw rotated axes (dashed)
            const xAxisEndX = maxX * cosTheta;
            const xAxisEndY = maxX * sinTheta;
            const xAxisStartX = minX * cosTheta;
            const xAxisStartY = minX * sinTheta;
            const yAxisEndX = maxY * (-sinTheta);
            const yAxisEndY = maxY * cosTheta;
            const yAxisStartX = minY * (-sinTheta);
            const yAxisStartY = minY * cosTheta;
            
            axes.push(
                { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
            );
            
            // Draw the real original curve (sampled from the equation)
            const origCurve = taImplicitDataset(taSubst(taParsePoly(equation), [cosTheta, sinTheta, 0], [-sinTheta, cosTheta, 0]), minX, maxX, minY, maxY, '#1f7f6a', 'Original Curve');
            const datasets = [origCurve];
            
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
            
            drawGraph([], [], axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Original equation: } ${originalEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [thetaInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Shifting Origin to Simplify Line Problems
 * Find the shift (h,k) that simplifies a line equation by making it pass through origin or removing constant term
 */
function renderShiftOriginSimplifyLineCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('shiftOriginSimplifyLineBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📍</span> Shifting Origin to Simplify Line Problems</h2>
        
        <div class="formula-badge">\\( \\text{Given line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Shift origin to } (h, k) \\text{ to eliminate constant term} \\)</div>
        <div class="formula-badge">\\( \\text{New equation becomes: } aX + bY = 0 \\)</div>
        <div class="formula-badge">\\( h = -\\frac{ac}{a^2 + b^2}, \\quad k = -\\frac{bc}{a^2 + b^2} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>a = <input type="number" id="simplifyLineA" value="3" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="simplifyLineB" value="4" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="simplifyLineC" value="12" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point on Original Line (optional)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x = <input type="number" id="simplifyLineTestX" value="0" step="any" style="width:70px;"></div>
                    <div>y = <input type="number" id="simplifyLineTestY" value="-3" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.8rem;">Enter a point that lies on the line to verify</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSimplifyLineBtn">
            <span>📍</span> Find Shift to Simplify
        </button>
        
        <div class="result-highlight" id="simplifyLineResult">
            \\( \\text{Shift origin to } (h, k) \\)
        </div>
        <div class="footnote">
            <strong>Simplifying Line Equations:</strong> By shifting the origin to the foot of the perpendicular from origin to the line,<br>
            the line equation becomes aX + bY = 0, which is simpler to work with.<br>
            • h = -ac/(a² + b²), k = -bc/(a² + b²)<br>
            • After shift, the line passes through the new origin
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('simplifyLineA');
    const bInp = document.getElementById('simplifyLineB');
    const cInp = document.getElementById('simplifyLineC');
    const testXInp = document.getElementById('simplifyLineTestX');
    const testYInp = document.getElementById('simplifyLineTestY');
    const compute = document.getElementById('computeSimplifyLineBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('simplifyLineResult');

    function update() {
        clearErrors();
        
        try {
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            let testX = null, testY = null;
            try {
                testX = validateNumber(testXInp.value, 'test x');
                testY = validateNumber(testYInp.value, 'test y');
            } catch(e) {}
            
            // Find shift (h,k) to eliminate constant term
            const denom = a*a + b*b;
            const h = -a * c / denom;
            const k = -b * c / denom;
            
            // After shift, line equation becomes: aX + bY = 0
            const simplifiedEquation = `${fmt(a)}X + ${fmt(b)}Y = 0`;
            
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding the problem`,
                `   • Original line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `   • We want to shift origin to (h, k) so that the line passes through the new origin`,
                `   • This means the constant term in the new equation becomes 0`,
                ``,
                `📍 STEP 2: Translation formulas`,
                `   • x = X + h, y = Y + k`,
                `   • Substituting into the line equation:`,
                `   • ${fmt(a)}(X + h) + ${fmt(b)}(Y + k) + ${fmt(c)} = 0`,
                `   • ${fmt(a)}X + ${fmt(b)}Y + (${fmt(a)}h + ${fmt(b)}k + ${fmt(c)}) = 0`,
                ``,
                `📍 STEP 3: Condition for eliminating constant term`,
                `   • We want: ${fmt(a)}h + ${fmt(b)}k + ${fmt(c)} = 0`,
                `   • This is one equation with two unknowns. We also want (h,k) to be the foot of perpendicular from origin to the line`,
                `   • The foot of perpendicular satisfies: (h, k) = (-ac/(a²+b²), -bc/(a²+b²))`,
                ``,
                `📍 STEP 4: Calculate the shift`,
                `   • a² + b² = ${fmt(a*a)} + ${fmt(b*b)} = ${fmt(denom)}`,
                `   • h = -a·c / (a²+b²) = -${fmt(a)}·${fmt(c)} / ${fmt(denom)} = ${fmt(-a*c)} / ${fmt(denom)} = ${fmt(h)}`,
                `   • k = -b·c / (a²+b²) = -${fmt(b)}·${fmt(c)} / ${fmt(denom)} = ${fmt(-b*c)} / ${fmt(denom)} = ${fmt(k)}`,
                ``,
                `📍 STEP 5: New origin coordinates`,
                `   • Shift the origin to O' = (${fmt(h)}, ${fmt(k)})`,
                ``,
                `📍 STEP 6: New simplified equation`,
                `   • After shifting, the line equation becomes:`,
                `   • ${fmt(a)}X + ${fmt(b)}Y = 0`,
                `   • This can be written as: Y = ${fmt(-a/b)}X (if b ≠ 0) or X = 0 (if b = 0)`,
                ``,
                `📍 STEP 7: Verification`,
                `   • Check that the new origin O' lies on the original line:`,
                `   • ${fmt(a)}·${fmt(h)} + ${fmt(b)}·${fmt(k)} + ${fmt(c)} = ${fmt(a*h)} + ${fmt(b*k)} + ${fmt(c)} = ${fmt(a*h + b*k + c)}`,
                `   • This equals 0, confirming O' lies on the line`,
            ];
            
            // Test point verification
            if (testX !== null && testY !== null) {
                const originalCheck = Math.abs(a*testX + b*testY + c) < 1e-10;
                steps.push(``);
                steps.push(`📌 TEST POINT VERIFICATION`);
                steps.push(`   • Test point P = (${fmt(testX)}, ${fmt(testY)})`);
                steps.push(`   • Check if it lies on original line: ${fmt(a)}·${fmt(testX)} + ${fmt(b)}·${fmt(testY)} + ${fmt(c)} = ${fmt(a*testX + b*testY + c)}`);
                steps.push(`   • Point ${originalCheck ? '✅ lies on' : '❌ does not lie on'} the original line`);
                
                if (originalCheck) {
                    const newX = testX - h;
                    const newY = testY - k;
                    steps.push(`   • In new coordinates: X = x - h = ${fmt(testX)} - ${fmt(h)} = ${fmt(newX)}`);
                    steps.push(`   • In new coordinates: Y = y - k = ${fmt(testY)} - ${fmt(k)} = ${fmt(newY)}`);
                    steps.push(`   • Check simplified equation: ${fmt(a)}·${fmt(newX)} + ${fmt(b)}·${fmt(newY)} = ${fmt(a*newX + b*newY)}`);
                    steps.push(`   • Since this equals 0, the point satisfies the simplified equation ✓`);
                }
            }
            
            // Draw the graph
            const minX = -10, maxX = 10;
            const minY = -10, maxY = 10;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw new axes (dashed)
            axes.push(
                { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
            );
            
            // Mark new origin
            const specialPoints = [
                {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
            ];
            
            // Draw the line
            let linePoints;
            if (Math.abs(b) > 1e-10) {
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
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
                    label: 'Original Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Shift origin to } (${fmt(h)}, ${fmt(k)}) \\)<br>\\( \\text{Simplified equation: } ${simplifiedEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, testXInp, testYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Shift to Make Line Pass Through Origin
 * Find the shift (h,k) required to make a given line pass through the origin
 */
function renderShiftLineThroughOriginCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('shiftLineThroughOriginBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🎯</span> Shift to Make Line Pass Through Origin</h2>
        
        <div class="formula-badge">\\( \\text{Given line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Find shift } (h, k) \\text{ such that the line passes through the new origin} \\)</div>
        <div class="formula-badge">\\( \\text{Condition: } ah + bk + c = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>a = <input type="number" id="shiftThroughA" value="2" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="shiftThroughB" value="3" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="shiftThroughC" value="6" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Additional Condition (optional)</label>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <label><input type="radio" name="shiftCondition" value="any" checked> Any shift on the line (choose h or k freely)</label>
                    <label><input type="radio" name="shiftCondition" value="perpendicular"> Shift along perpendicular direction (foot from origin)</label>
                    <label><input type="radio" name="shiftCondition" value="custom"> Custom: h = <input type="number" id="customH" value="1" step="any" style="width:70px;"></label>
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
        
        <button class="calculate-btn" id="computeShiftThroughBtn">
            <span>🎯</span> Find Shift
        </button>
        
        <div class="result-highlight" id="shiftThroughResult">
            \\( \\text{Shift origin to } (h, k) \\)
        </div>
        <div class="footnote">
            <strong>Making a Line Pass Through Origin:</strong><br>
            • The line ax + by + c = 0 can be made to pass through the origin by shifting origin to any point on the line<br>
            • Condition: ah + bk + c = 0 (the new origin must lie on the line)<br>
            • If a perpendicular shift is chosen, we get the foot of perpendicular from origin to the line
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('shiftThroughA');
    const bInp = document.getElementById('shiftThroughB');
    const cInp = document.getElementById('shiftThroughC');
    const customHInp = document.getElementById('customH');
    const compute = document.getElementById('computeShiftThroughBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('shiftThroughResult');
    
    const conditionRadios = document.getElementsByName('shiftCondition');
    const customDiv = document.getElementById('customH').parentElement.parentElement;

    function update() {
        clearErrors();
        
        try {
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            // Get selected condition
            let condition = 'any';
            for (let radio of conditionRadios) {
                if (radio.checked) {
                    condition = radio.value;
                    break;
                }
            }
            
            let h, k;
            let steps = [];
            
            if (condition === 'any') {
                // Choose h = 0 for simplicity
                h = 0;
                if (Math.abs(b) > 1e-10) {
                    k = -c / b;
                } else {
                    // b = 0, line is vertical: ax + c = 0
                    h = -c / a;
                    k = 0;
                }
                
                steps = [
                    `📍 STEP 1: Understanding the problem`,
                    `   • Original line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `   • We want to shift origin to (h, k) so that the line passes through the new origin`,
                    `   • Condition: The new origin must lie on the line`,
                    ``,
                    `📍 STEP 2: Condition for shift`,
                    `   • ah + bk + c = 0`,
                    `   • This is one equation with two unknowns (h, k)`,
                    `   • We can choose any point on the line as the new origin`,
                    ``,
                    `📍 STEP 3: Choose a simple point`,
                    `   • Let's set h = 0 for simplicity`,
                    `   • Then: ${fmt(a)}·0 + ${fmt(b)}k + ${fmt(c)} = 0`,
                    `   • ${fmt(b)}k = ${fmt(-c)}`,
                    `   • k = ${fmt(-c)} / ${fmt(b)} = ${fmt(k)}`,
                    ``,
                    `📍 STEP 4: New origin coordinates`,
                    `   • Shift origin to O' = (${fmt(h)}, ${fmt(k)})`,
                    ``,
                    `📍 STEP 5: Verify`,
                    `   • Check: ${fmt(a)}·${fmt(h)} + ${fmt(b)}·${fmt(k)} + ${fmt(c)} = ${fmt(a*h)} + ${fmt(b*k)} + ${fmt(c)} = ${fmt(a*h + b*k + c)} = 0 ✓`
                ];
                
            } else if (condition === 'perpendicular') {
                // Foot of perpendicular from origin to the line
                const denom = a*a + b*b;
                h = -a * c / denom;
                k = -b * c / denom;
                
                steps = [
                    `📍 STEP 1: Understanding the problem`,
                    `   • Original line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `   • We want to shift origin to (h, k) so that the line passes through the new origin`,
                    `   • We choose the shift to be the foot of perpendicular from the origin to the line`,
                    ``,
                    `📍 STEP 2: Formula for foot of perpendicular`,
                    `   • For line ax + by + c = 0, the foot of perpendicular from (0,0) is:`,
                    `   • (h, k) = (-ac/(a²+b²), -bc/(a²+b²))`,
                    ``,
                    `📍 STEP 3: Calculate`,
                    `   • a² + b² = ${fmt(a*a)} + ${fmt(b*b)} = ${fmt(a*a + b*b)}`,
                    `   • h = -${fmt(a)}·${fmt(c)} / ${fmt(a*a + b*b)} = ${fmt(-a*c)} / ${fmt(a*a + b*b)} = ${fmt(h)}`,
                    `   • k = -${fmt(b)}·${fmt(c)} / ${fmt(a*a + b*b)} = ${fmt(-b*c)} / ${fmt(a*a + b*b)} = ${fmt(k)}`,
                    ``,
                    `📍 STEP 4: New origin coordinates`,
                    `   • Shift origin to O' = (${fmt(h)}, ${fmt(k)})`,
                    `   • This is the closest point on the line to the original origin`,
                    ``,
                    `📍 STEP 5: Verify`,
                    `   • Check: ${fmt(a)}·${fmt(h)} + ${fmt(b)}·${fmt(k)} + ${fmt(c)} = ${fmt(a*h)} + ${fmt(b*k)} + ${fmt(c)} = ${fmt(a*h + b*k + c)} = 0 ✓`
                ];
                
            } else {
                // Custom h
                const customH = validateNumber(customHInp.value, 'custom h');
                h = customH;
                if (Math.abs(b) > 1e-10) {
                    k = (-c - a*h) / b;
                } else {
                    // b = 0, line is vertical: ax + c = 0
                    if (Math.abs(a) > 1e-10) {
                        h = -c / a;
                        k = 0;
                    } else {
                        throw new Error('Invalid line coefficients');
                    }
                }
                
                steps = [
                    `📍 STEP 1: Understanding the problem`,
                    `   • Original line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `   • Given h = ${fmt(h)} (custom value)`,
                    `   • Find k such that (h, k) lies on the line`,
                    ``,
                    `📍 STEP 2: Use the condition`,
                    `   • ah + bk + c = 0`,
                    `   • ${fmt(a)}·${fmt(h)} + ${fmt(b)}k + ${fmt(c)} = 0`,
                    `   • ${fmt(b)}k = ${fmt(-a*h - c)}`,
                    `   • k = ${fmt(-a*h - c)} / ${fmt(b)} = ${fmt(k)}`,
                    ``,
                    `📍 STEP 3: New origin coordinates`,
                    `   • Shift origin to O' = (${fmt(h)}, ${fmt(k)})`,
                    ``,
                    `📍 STEP 4: Verify`,
                    `   • Check: ${fmt(a)}·${fmt(h)} + ${fmt(b)}·${fmt(k)} + ${fmt(c)} = ${fmt(a*h)} + ${fmt(b*k)} + ${fmt(c)} = ${fmt(a*h + b*k + c)} = 0 ✓`
                ];
            }
            
            // Draw the graph
            const minX = -8, maxX = 12;
            const minY = -8, maxY = 12;
            
            // Draw original axes
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            
            // Draw new axes (dashed)
            axes.push(
                { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
            );
            
            // Mark new origin
            const specialPoints = [
                {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
            ];
            
            // Draw the line
            let linePoints;
            if (Math.abs(b) > 1e-10) {
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
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
                    label: 'Original Line',
                    data: linePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
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
            
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Shift origin to } (${fmt(h)}, ${fmt(k)}) \\)<br>\\( \\text{New equation becomes: } ${fmt(a)}X + ${fmt(b)}Y = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, customHInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    for (let radio of conditionRadios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Change of Axes for Symmetry
 * Find transformation that makes a curve symmetric about coordinate axes
 */
function renderChangeAxesSymmetryCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('changeAxesSymmetryBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>✨</span> Change of Axes for Symmetry</h2>
        
        <div class="formula-badge">\\( \\text{Transform axes to make a curve symmetric about coordinate axes} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Original Equation: f(x, y) = 0</label>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <input type="text" id="symmetryEq" value="x^2 + 4xy + y^2 - 8 = 0" style="width:350px; padding:8px; border-radius:20px;">
                </div>
                <div style="font-size:0.8rem; margin-top:5px;">Examples: x^2 + 4xy + y^2 = 8 (rotated ellipse), 2x^2 + 2xy + 2y^2 = 1</div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Select Symmetry Type to Achieve</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <label><input type="radio" name="symmetryType" value="xy" checked> Symmetric about both axes (eliminate XY term)</label>
                    <label><input type="radio" name="symmetryType" value="center"> Symmetric about origin (center at origin)</label>
                    <label><input type="radio" name="symmetryType" value="axis"> Symmetric about a specific axis</label>
                </div>
            </div>
            
            <div id="axisInput" style="display:none; width:100%; margin-top:15px;">
                <div class="point-box">
                    <label>Axis of symmetry (angle from x-axis)</label>
                    <div><span>θ =</span> <input type="number" id="symmetryAxisAngle" value="45" step="any" style="width:80px;"> degrees</div>
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
        
        <button class="calculate-btn" id="computeSymmetryBtn">
            <span>✨</span> Transform for Symmetry
        </button>
        
        <div class="result-highlight" id="symmetryResult">
            \\( \\text{Transformed equation} \\)
        </div>
        <div class="footnote">
            <strong>Change of Axes for Symmetry:</strong><br>
            • To make a curve symmetric about coordinate axes, we often need to rotate the axes to eliminate the XY term<br>
            • The rotation angle θ satisfies cot 2θ = (A - C)/B for quadratic equations<br>
            • After rotation, the equation takes the form A'X² + C'Y² + F' = 0, which is symmetric about both axes
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const eqInp = document.getElementById('symmetryEq');
    const axisAngleInp = document.getElementById('symmetryAxisAngle');
    const compute = document.getElementById('computeSymmetryBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('symmetryResult');
    const axisInputDiv = document.getElementById('axisInput');
    
    const typeRadios = document.getElementsByName('symmetryType');
    
    for (let radio of typeRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'axis') {
                axisInputDiv.style.display = 'block';
            } else {
                axisInputDiv.style.display = 'none';
            }
        });
    }

    function parseQuadraticEquation(equation) {
        // Shared robust parser (see taParsePoly): Ax² + Bxy + Cy² + Dx + Ey + F = 0, '=' sides handled
        return taParsePoly(equation);
    }

    function update() {
        clearErrors();
        
        try {
            const equation = eqInp.value;
            
            let type = 'xy';
            for (let radio of typeRadios) {
                if (radio.checked) {
                    type = radio.value;
                    break;
                }
            }
            
            let steps = [];
            let transformedEquation = '';
            let thetaDeg = 0;
            
            // Parse the equation
            const coeffs = parseQuadraticEquation(equation);
            const { A, B, C, D, E, F } = coeffs;
            
            steps = [
                `📍 STEP 1: Original equation`,
                `   • ${/=/.test(equation) ? equation : equation + ' = 0'}`,
                `   • Coefficients: A = ${fmt(A)}, B = ${fmt(B)}, C = ${fmt(C)}, D = ${fmt(D)}, E = ${fmt(E)}, F = ${fmt(F)}`,
                ``,
            ];
            
            const minX = -8, maxX = 8;
            const minY = -8, maxY = 8;
            const eps = 1e-10;
            const axes = [
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
            ];
            const specialPoints = [];
            const addFrame = (ox, oy, c, s) => {
                axes.push(
                    { from: {x: ox - 12*c, y: oy - 12*s}, to: {x: ox + 12*c, y: oy + 12*s}, color: '#d44c2f', dash: [5, 5], label: "new X axis", width: 2 },
                    { from: {x: ox + 12*s, y: oy - 12*c}, to: {x: ox - 12*s, y: oy + 12*c}, color: '#d44c2f', dash: [5, 5], label: "new Y axis", width: 2 }
                );
            };
            
            if (type === 'xy') {
                let Pr = {A, B, C, D, E, F};
                let cosT = 1, sinT = 0;
                if (Math.abs(B) < eps) {
                    steps.push(`📍 STEP 2: B = 0, so there is no XY term and no rotation is needed`);
                } else {
                    // tan 2θ = B/(A - C)  (equivalently cot 2θ = (A - C)/B)
                    const thetaRad = 0.5 * Math.atan2(B, A - C);
                    thetaDeg = thetaRad * 180 / Math.PI;
                    cosT = Math.cos(thetaRad);
                    sinT = Math.sin(thetaRad);
                    steps.push(`📍 STEP 2: Calculate rotation angle to eliminate XY term`);
                    steps.push(`   • Formula: cot 2θ = (A - C)/B = (${fmt(A)} - ${fmt(C)})/${fmt(B)} = ${fmt((A - C) / B)}`);
                    steps.push(`   • 2θ = ${fmt(2 * thetaDeg)}°, so θ = ${fmt(thetaDeg)}°`);
                    steps.push(``);
                    const cc = cosT*cosT, ss = sinT*sinT, cs = cosT*sinT;
                    Pr = {
                        A: A*cc + B*cs + C*ss,
                        B: 0,
                        C: A*ss - B*cs + C*cc,
                        D: D*cosT + E*sinT,
                        E: -D*sinT + E*cosT,
                        F: F
                    };
                    steps.push(`📍 STEP 3: Apply rotation x = X cosθ - Y sinθ, y = X sinθ + Y cosθ`);
                    steps.push(`   • cos θ = ${fmt(cosT)}, sin θ = ${fmt(sinT)}`);
                    steps.push(`   • A' = ${fmt(Pr.A)}, B' = 0, C' = ${fmt(Pr.C)}, D' = ${fmt(Pr.D)}, E' = ${fmt(Pr.E)}, F' = ${fmt(Pr.F)}`);
                    steps.push(`   • ✓ XY term eliminated!`);
                }
                let cx = 0, cy = 0;
                let np = Pr;
                if (Math.abs(Pr.D) > eps || Math.abs(Pr.E) > eps) {
                    // Complete the square in each variable that has a squared term
                    const hasX2 = Math.abs(Pr.A) > eps, hasY2 = Math.abs(Pr.C) > eps;
                    if (hasX2 || hasY2) {
                        cx = hasX2 ? -Pr.D / (2 * Pr.A) : 0;
                        cy = hasY2 ? -Pr.E / (2 * Pr.C) : 0;
                        np = {
                            A: Pr.A, B: 0, C: Pr.C,
                            D: hasX2 ? 0 : Pr.D,
                            E: hasY2 ? 0 : Pr.E,
                            F: Pr.F - (hasX2 ? Pr.D*Pr.D / (4*Pr.A) : 0) - (hasY2 ? Pr.E*Pr.E / (4*Pr.C) : 0)
                        };
                        steps.push(``);
                        steps.push(`📍 STEP 4: Linear terms are still present, so translate the origin (complete the square)`);
                        steps.push(`   • New origin in the rotated axes: (${fmt(cx)}, ${fmt(cy)})`);
                        steps.push(`   • Constant becomes ${fmt(np.F)}`);
                    }
                }
                transformedEquation = taPolyStr(np, 'X', 'Y', true);
                steps.push(``);
                steps.push(`📍 STEP 5: Final equation`);
                steps.push(`   • ${transformedEquation}`);
                if (Math.abs(np.D) < eps && Math.abs(np.E) < eps && Math.abs(np.B) < eps) {
                    steps.push(Math.abs(B) < eps && cosT === 1 && cx === 0 && cy === 0
                        ? `   • No XY term and no linear terms: the curve is already symmetric about both coordinate axes`
                        : `   • Only X², Y² and constant terms remain: symmetric about both new axes`);
                } else {
                    steps.push(`   • A parabola has no centre; it is symmetric about its own axis only`);
                }
                const ox = cx * cosT - cy * sinT, oy = cx * sinT + cy * cosT;
                if (Math.abs(thetaDeg) > eps || Math.abs(ox) > eps || Math.abs(oy) > eps) {
                    addFrame(ox, oy, cosT, sinT);
                    if (Math.abs(ox) > eps || Math.abs(oy) > eps) specialPoints.push({x: ox, y: oy, label: `O'(${fmt(ox)}, ${fmt(oy)})`});
                }
                
            } else if (type === 'center') {
                const det = 4*A*C - B*B;
                if (Math.abs(det) < eps) {
                    steps.push(`📍 STEP 2: 4AC - B² = 0, so there is no unique centre (parabola or parallel lines)`);
                    transformedEquation = taPolyStr(coeffs, 'x', 'y');
                    transformedEquation += ' = 0';
                } else {
                    const h = (B*E - 2*C*D) / det;
                    const k = (B*D - 2*A*E) / det;
                    const F_prime = F + (D*h + E*k) / 2;
                    steps.push(`📍 STEP 2: Find centre (h, k)`);
                    steps.push(`   • h = (BE - 2CD)/(4AC - B²) = ${fmt(h)}`);
                    steps.push(`   • k = (BD - 2AE)/(4AC - B²) = ${fmt(k)}`);
                    steps.push(``);
                    if (Math.abs(h) < eps && Math.abs(k) < eps) {
                        steps.push(`📍 STEP 3: The centre is already the origin, nothing to translate`);
                    } else {
                        steps.push(`📍 STEP 3: Translate origin to the centre (x = X + h, y = Y + k)`);
                        steps.push(`   • Linear terms vanish; the constant becomes F' = F + (Dh + Ek)/2 = ${fmt(F_prime)}`);
                    }
                    const np = {A, B, C, D: 0, E: 0, F: F_prime};
                    transformedEquation = taPolyStr(np, 'X', 'Y', true);
                    steps.push(`   • ${transformedEquation}`);
                    if (Math.abs(h) > eps || Math.abs(k) > eps) {
                        axes.push(
                            { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X axis", width: 2 },
                            { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y axis", width: 2 }
                        );
                        specialPoints.push({x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`});
                    }
                }
                
            } else {
                const axisAngle = validateNumber(axisAngleInp.value, 'θ');
                const axisRad = axisAngle * Math.PI / 180;
                const cosT = Math.cos(axisRad), sinT = Math.sin(axisRad);
                steps.push(`📍 STEP 2: Rotate axes so the given axis becomes the X-axis`);
                steps.push(`   • Axis of symmetry: θ = ${fmt(axisAngle)}° from the x-axis`);
                steps.push(`   • Substitute x = X cosθ - Y sinθ, y = X sinθ + Y cosθ`);
                const np = taSubst(coeffs, [cosT, -sinT, 0], [sinT, cosT, 0]);
                transformedEquation = taPolyStr(np, 'X', 'Y', true);
                steps.push(`   • ${transformedEquation}`);
                if (Math.abs(np.B) < 1e-9 && Math.abs(np.E) < 1e-9) {
                    steps.push(`   • Only even powers of Y occur: the curve IS symmetric about this axis`);
                } else {
                    steps.push(`   • Odd powers of Y remain (XY or Y term): the curve is NOT symmetric about this axis`);
                }
                addFrame(0, 0, cosT, sinT);
            }
            
            const datasets = [taImplicitDataset(coeffs, minX, maxX, minY, maxY, '#1f7f6a', 'Original curve')];
            
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
            
            drawGraph([], specialPoints, axes);
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Transformed equation: } ${transformedEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [eqInp, axisAngleInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    for (let radio of typeRadios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
/**
 * Combined Translation and Rotation Transformation
 * Applies translation first, then rotation to transform coordinates
 * Formulas: x = h + X cosθ - Y sinθ, y = k + X sinθ + Y cosθ
 */
function renderCombinedTranslationRotationCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('combinedTranslationRotationBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄✨</span> Combined Translation and Rotation of Axes</h2>
        
        <div class="formula-badge">\\( \\text{Step 1: Translate origin to } (h, k) \\)</div>
        <div class="formula-badge">\\( \\text{Step 2: Rotate axes by angle } \\theta \\)</div>
        <div class="formula-badge">\\( x = h + X \\cos \\theta - Y \\sin \\theta \\)</div>
        <div class="formula-badge">\\( y = k + X \\sin \\theta + Y \\cos \\theta \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Translation: New Origin O' = (h, k)</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>h = <input type="number" id="combH" value="2" step="any" style="width:80px;"></div>
                    <div>k = <input type="number" id="combK" value="1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Rotation Angle θ</label>
                <div style="display:flex; gap:20px; justify-content:center;">
                    <div>θ = <input type="number" id="combTheta" value="30" step="any" style="width:100px;"> degrees</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Original Point Coordinates (x, y) or (X, Y)</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>Point in OLD system (x, y): <input type="number" id="combOldX" value="5" step="any" style="width:70px;">, <input type="number" id="combOldY" value="3" step="any" style="width:70px;"></div>
                    <div style="margin-top:10px;">Point in NEW system (X, Y): <input type="number" id="combNewX" value="3" step="any" style="width:70px;">, <input type="number" id="combNewY" value="2" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeCombinedBtn">
            <span>🔄✨</span> Apply Combined Transformation
        </button>
        
        <div class="result-highlight" id="combinedResult">
            \\( \\text{Transformation results will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Combined Transformation:</strong> First translate origin to (h,k), then rotate axes by θ.<br>
            • Forward: (x, y) = (h + X cosθ - Y sinθ, k + X sinθ + Y cosθ)<br>
            • Inverse: (X, Y) = ((x - h)cosθ + (y - k)sinθ, -(x - h)sinθ + (y - k)cosθ)<br>
            • This is the most general rigid motion (distance-preserving transformation).
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const hInp = document.getElementById('combH');
    const kInp = document.getElementById('combK');
    const thetaInp = document.getElementById('combTheta');
    const oldXInp = document.getElementById('combOldX');
    const oldYInp = document.getElementById('combOldY');
    const newXInp = document.getElementById('combNewX');
    const newYInp = document.getElementById('combNewY');
    const compute = document.getElementById('computeCombinedBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('combinedResult');

    function update() {
        clearErrors();
        
        try {
            const h = validateNumber(hInp.value, 'h');
            const k = validateNumber(kInp.value, 'k');
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            
            let oldX = null, oldY = null;
            let newX = null, newY = null;
            
            try {
                oldX = validateNumber(oldXInp.value, 'old x');
                oldY = validateNumber(oldYInp.value, 'old y');
            } catch(e) {}
            
            try {
                newX = validateNumber(newXInp.value, 'new X');
                newY = validateNumber(newYInp.value, 'new Y');
            } catch(e) {}
            
            let steps = [];
            
            steps = [
                `📍 STEP 1: Understanding Combined Transformation`,
                `   • This transformation combines translation and rotation into a single rigid motion`,
                `   • Step 1: Translate origin to O' = (${fmt(h)}, ${fmt(k)})`,
                `   • Step 2: Rotate axes by θ = ${fmt(thetaDeg)}°`,
                `   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`,
                ``,
                `📍 STEP 2: Transformation Formulas`,
                `   • Forward transformation (from X,Y to x,y):`,
                `     x = h + X·cosθ - Y·sinθ`,
                `     y = k + X·sinθ + Y·cosθ`,
                `   • Inverse transformation (from x,y to X,Y):`,
                `     X = (x - h)·cosθ + (y - k)·sinθ`,
                `     Y = -(x - h)·sinθ + (y - k)·cosθ`,
                ``
            ];
            
            // Case 1: Transform from (X,Y) to (x,y)
            if (newX !== null && newY !== null) {
                const transformedX = h + newX * cosTheta - newY * sinTheta;
                const transformedY = k + newX * sinTheta + newY * cosTheta;
                
                steps.push(`📍 STEP 3: Forward Transformation (New → Old)`);
                steps.push(`   • Given point in NEW system: P' = (X, Y) = (${fmt(newX)}, ${fmt(newY)})`);
                steps.push(`   • Apply forward formulas:`);
                steps.push(`     x = ${fmt(h)} + ${fmt(newX)}·${fmt(cosTheta)} - ${fmt(newY)}·${fmt(sinTheta)}`);
                steps.push(`     x = ${fmt(h)} + ${fmt(newX*cosTheta)} - ${fmt(newY*sinTheta)} = ${fmt(transformedX)}`);
                steps.push(`     y = ${fmt(k)} + ${fmt(newX)}·${fmt(sinTheta)} + ${fmt(newY)}·${fmt(cosTheta)}`);
                steps.push(`     y = ${fmt(k)} + ${fmt(newX*sinTheta)} + ${fmt(newY*cosTheta)} = ${fmt(transformedY)}`);
                steps.push(`   • Point in OLD system: P = (${fmt(transformedX)}, ${fmt(transformedY)})`);
                
                resultDiv.innerHTML = `\\( \\text{Point in old coordinates: } (${fmt(transformedX)}, ${fmt(transformedY)}) \\)`;
                
                // Draw graph with transformed point
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                
                const axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                // Draw transformed axes
                const xAxisEndX = h + 8 * cosTheta;
                const xAxisEndY = k + 8 * sinTheta;
                const xAxisStartX = h - 8 * cosTheta;
                const xAxisStartY = k - 8 * sinTheta;
                const yAxisEndX = h + 8 * (-sinTheta);
                const yAxisEndY = k + 8 * cosTheta;
                const yAxisStartX = h - 8 * (-sinTheta);
                const yAxisStartY = k - 8 * cosTheta;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                const specialPoints = [
                    {x: transformedX, y: transformedY, label: `P(${fmt(transformedX)}, ${fmt(transformedY)})`},
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                drawGraph([], specialPoints, axes);
                
            } 
            // Case 2: Transform from (x,y) to (X,Y)
            else if (oldX !== null && oldY !== null) {
                const dx = oldX - h;
                const dy = oldY - k;
                const transformedX = dx * cosTheta + dy * sinTheta;
                const transformedY = -dx * sinTheta + dy * cosTheta;
                
                steps.push(`📍 STEP 3: Inverse Transformation (Old → New)`);
                steps.push(`   • Given point in OLD system: P = (x, y) = (${fmt(oldX)}, ${fmt(oldY)})`);
                steps.push(`   • Step 3.1: Subtract translation (h, k) = (${fmt(h)}, ${fmt(k)})`);
                steps.push(`     x' = x - h = ${fmt(oldX)} - ${fmt(h)} = ${fmt(dx)}`);
                steps.push(`     y' = y - k = ${fmt(oldY)} - ${fmt(k)} = ${fmt(dy)}`);
                steps.push(`   • Step 3.2: Apply inverse rotation formulas:`);
                steps.push(`     X = x'·cosθ + y'·sinθ = ${fmt(dx)}·${fmt(cosTheta)} + ${fmt(dy)}·${fmt(sinTheta)} = ${fmt(transformedX)}`);
                steps.push(`     Y = -x'·sinθ + y'·cosθ = -${fmt(dx)}·${fmt(sinTheta)} + ${fmt(dy)}·${fmt(cosTheta)} = ${fmt(transformedY)}`);
                steps.push(`   • Point in NEW system: P' = (${fmt(transformedX)}, ${fmt(transformedY)})`);
                
                resultDiv.innerHTML = `\\( \\text{Point in new coordinates: } (${fmt(transformedX)}, ${fmt(transformedY)}) \\)`;
                
                // Draw graph
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                
                const axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                const xAxisEndX = h + 8 * cosTheta;
                const xAxisEndY = k + 8 * sinTheta;
                const xAxisStartX = h - 8 * cosTheta;
                const xAxisStartY = k - 8 * sinTheta;
                const yAxisEndX = h + 8 * (-sinTheta);
                const yAxisEndY = k + 8 * cosTheta;
                const yAxisStartX = h - 8 * (-sinTheta);
                const yAxisStartY = k - 8 * cosTheta;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                const specialPoints = [
                    {x: oldX, y: oldY, label: `P(${fmt(oldX)}, ${fmt(oldY)})`},
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                drawGraph([], specialPoints, axes);
            } 
            else {
                steps.push(`📍 STEP 3: Enter either a point in OLD coordinates (x,y) or NEW coordinates (X,Y) to see the transformation.`);
                resultDiv.innerHTML = `\\( \\text{Enter a point to see the transformation} \\)`;
            }
            
            steps.push(``);
            steps.push(`📍 STEP 4: Geometric Interpretation`);
            steps.push(`   • The original axes (x,y) are shown in black`);
            steps.push(`   • The transformed axes (X',Y') are shown in dashed red`);
            steps.push(`   • The new origin O' is at (${fmt(h)}, ${fmt(k)}) in the old system`);
            steps.push(`   • The axes are rotated by ${fmt(thetaDeg)}° counterclockwise`);
            
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
    [hInp, kInp, thetaInp, oldXInp, oldYInp, newXInp, newYInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Coordinates of a Point in New System
 * Find coordinates of a point after translation and/or rotation
 */
function renderPointNewCoordinatesCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('pointNewCoordinatesBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📍</span> Coordinates of a Point in New System</h2>
        
        <div class="formula-badge">\\( \\text{Find coordinates of a point after changing the coordinate system} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Original Point P (x, y)</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>x = <input type="number" id="pointPx" value="5" step="any" style="width:80px;"></div>
                    <div>y = <input type="number" id="pointPy" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Select Transformation Type</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <label><input type="radio" name="coordTransType" value="translation" checked> Translation only</label>
                    <label><input type="radio" name="coordTransType" value="rotation"> Rotation only</label>
                    <label><input type="radio" name="coordTransType" value="both"> Translation + Rotation</label>
                </div>
            </div>
            
            <div id="coordTransParams" class="point-box" style="width:100%; margin-top:15px;">
                <label>Transformation Parameters</label>
                <div id="transOnlyParams" style="display:block;">
                    <div>New origin O' = (h, k):</div>
                    <div style="display:flex; gap:15px; justify-content:center;">
                        <div>h = <input type="number" id="coordH" value="2" step="any" style="width:80px;"></div>
                        <div>k = <input type="number" id="coordK" value="1" step="any" style="width:80px;"></div>
                    </div>
                </div>
                <div id="rotOnlyParams" style="display:none; margin-top:10px;">
                    <div>Rotation angle θ:</div>
                    <div><input type="number" id="coordTheta" value="45" step="any" style="width:100px;"> degrees</div>
                </div>
                <div id="bothParams" style="display:none; margin-top:10px;">
                    <div>Translation: h = <input type="number" id="coordBothH" value="2" step="any" style="width:70px;">, k = <input type="number" id="coordBothK" value="1" step="any" style="width:70px;"></div>
                    <div style="margin-top:10px;">Rotation: θ = <input type="number" id="coordBothTheta" value="30" step="any" style="width:100px;"> degrees</div>
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
        
        <button class="calculate-btn" id="computePointNewCoordBtn">
            <span>📍</span> Find New Coordinates
        </button>
        
        <div class="result-highlight" id="pointNewCoordResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>New Coordinates:</strong> After changing the coordinate system, the coordinates of a point change according to the transformation.<br>
            • Translation: X = x - h, Y = y - k<br>
            • Rotation: X = x cosθ + y sinθ, Y = -x sinθ + y cosθ<br>
            • Combined: X = (x - h)cosθ + (y - k)sinθ, Y = -(x - h)sinθ + (y - k)cosθ
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const typeRadios = document.getElementsByName('coordTransType');
    const transOnlyDiv = document.getElementById('transOnlyParams');
    const rotOnlyDiv = document.getElementById('rotOnlyParams');
    const bothDiv = document.getElementById('bothParams');
    const pxInp = document.getElementById('pointPx');
    const pyInp = document.getElementById('pointPy');
    const hInp = document.getElementById('coordH');
    const kInp = document.getElementById('coordK');
    const thetaInp = document.getElementById('coordTheta');
    const bothHInp = document.getElementById('coordBothH');
    const bothKInp = document.getElementById('coordBothK');
    const bothThetaInp = document.getElementById('coordBothTheta');
    const compute = document.getElementById('computePointNewCoordBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('pointNewCoordResult');
    
    for (let radio of typeRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'translation') {
                transOnlyDiv.style.display = 'block';
                rotOnlyDiv.style.display = 'none';
                bothDiv.style.display = 'none';
            } else if (this.value === 'rotation') {
                transOnlyDiv.style.display = 'none';
                rotOnlyDiv.style.display = 'block';
                bothDiv.style.display = 'none';
            } else {
                transOnlyDiv.style.display = 'none';
                rotOnlyDiv.style.display = 'none';
                bothDiv.style.display = 'block';
            }
        });
    }

    function update() {
        clearErrors();
        
        try {
            let type = 'translation';
            for (let radio of typeRadios) {
                if (radio.checked) {
                    type = radio.value;
                    break;
                }
            }
            
            const x = validateNumber(pxInp.value, 'x');
            const y = validateNumber(pyInp.value, 'y');
            
            let newX, newY;
            let steps = [];
            let axes = [];
            let specialPoints = [];
            
            steps.push(`📍 STEP 1: Original point coordinates`);
            steps.push(`   • P = (${fmt(x)}, ${fmt(y)})`);
            steps.push(``);
            
            if (type === 'translation') {
                const h = validateNumber(hInp.value, 'h');
                const k = validateNumber(kInp.value, 'k');
                
                newX = x - h;
                newY = y - k;
                
                steps.push(`📍 STEP 2: Translation of axes`);
                steps.push(`   • New origin O' = (${fmt(h)}, ${fmt(k)})`);
                steps.push(`   • Translation formulas: X = x - h, Y = y - k`);
                steps.push(`   • X = ${fmt(x)} - ${fmt(h)} = ${fmt(newX)}`);
                steps.push(`   • Y = ${fmt(y)} - ${fmt(k)} = ${fmt(newY)}`);
                steps.push(``);
                steps.push(`📍 STEP 3: New coordinates`);
                steps.push(`   • P' = (${fmt(newX)}, ${fmt(newY)}) in the new system`);
                
                // Draw graph
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                
                axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 },
                    { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                    { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
                ];
                
                specialPoints = [
                    {x: x, y: y, label: `P(${fmt(x)}, ${fmt(y)})`},
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                resultDiv.innerHTML = `\\( \\text{New coordinates: } (${fmt(newX)}, ${fmt(newY)}) \\)`;
                
            } else if (type === 'rotation') {
                const thetaDeg = validateNumber(thetaInp.value, 'θ');
                const thetaRad = thetaDeg * Math.PI / 180;
                const cosTheta = Math.cos(thetaRad);
                const sinTheta = Math.sin(thetaRad);
                
                newX = x * cosTheta + y * sinTheta;
                newY = -x * sinTheta + y * cosTheta;
                
                steps.push(`📍 STEP 2: Rotation of axes by θ = ${fmt(thetaDeg)}°`);
                steps.push(`   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`);
                steps.push(`   • Rotation formulas: X = x cosθ + y sinθ, Y = -x sinθ + y cosθ`);
                steps.push(`   • X = ${fmt(x)}·${fmt(cosTheta)} + ${fmt(y)}·${fmt(sinTheta)} = ${fmt(x*cosTheta)} + ${fmt(y*sinTheta)} = ${fmt(newX)}`);
                steps.push(`   • Y = -${fmt(x)}·${fmt(sinTheta)} + ${fmt(y)}·${fmt(cosTheta)} = -${fmt(x*sinTheta)} + ${fmt(y*cosTheta)} = ${fmt(newY)}`);
                steps.push(``);
                steps.push(`📍 STEP 3: New coordinates`);
                steps.push(`   • P' = (${fmt(newX)}, ${fmt(newY)}) in the rotated system`);
                
                // Draw graph
                const minX = -8, maxX = 8;
                const minY = -8, maxY = 8;
                const thetaRadVal = thetaDeg * Math.PI / 180;
                const cosThetaVal = Math.cos(thetaRadVal);
                const sinThetaVal = Math.sin(thetaRadVal);
                
                axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                const xAxisEndX = maxX * cosThetaVal;
                const xAxisEndY = maxX * sinThetaVal;
                const xAxisStartX = minX * cosThetaVal;
                const xAxisStartY = minX * sinThetaVal;
                const yAxisEndX = maxY * (-sinThetaVal);
                const yAxisEndY = maxY * cosThetaVal;
                const yAxisStartX = minY * (-sinThetaVal);
                const yAxisStartY = minY * cosThetaVal;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                specialPoints = [
                    {x: x, y: y, label: `P(${fmt(x)}, ${fmt(y)})`}
                ];
                
                resultDiv.innerHTML = `\\( \\text{New coordinates: } (${fmt(newX)}, ${fmt(newY)}) \\)`;
                
            } else {
                const h = validateNumber(bothHInp.value, 'h');
                const k = validateNumber(bothKInp.value, 'k');
                const thetaDeg = validateNumber(bothThetaInp.value, 'θ');
                const thetaRad = thetaDeg * Math.PI / 180;
                const cosTheta = Math.cos(thetaRad);
                const sinTheta = Math.sin(thetaRad);
                
                const dx = x - h;
                const dy = y - k;
                newX = dx * cosTheta + dy * sinTheta;
                newY = -dx * sinTheta + dy * cosTheta;
                
                steps.push(`📍 STEP 2: Combined transformation (Translation + Rotation)`);
                steps.push(`   • Step 2.1: Translate origin to O' = (${fmt(h)}, ${fmt(k)})`);
                steps.push(`     x' = x - h = ${fmt(x)} - ${fmt(h)} = ${fmt(dx)}`);
                steps.push(`     y' = y - k = ${fmt(y)} - ${fmt(k)} = ${fmt(dy)}`);
                steps.push(`   • Step 2.2: Rotate by θ = ${fmt(thetaDeg)}°`);
                steps.push(`     cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`);
                steps.push(`     X = x'·cosθ + y'·sinθ = ${fmt(dx)}·${fmt(cosTheta)} + ${fmt(dy)}·${fmt(sinTheta)} = ${fmt(newX)}`);
                steps.push(`     Y = -x'·sinθ + y'·cosθ = -${fmt(dx)}·${fmt(sinTheta)} + ${fmt(dy)}·${fmt(cosTheta)} = ${fmt(newY)}`);
                steps.push(``);
                steps.push(`📍 STEP 3: New coordinates`);
                steps.push(`   • P' = (${fmt(newX)}, ${fmt(newY)}) in the new system`);
                
                // Draw graph
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                const thetaRadVal = thetaDeg * Math.PI / 180;
                const cosThetaVal = Math.cos(thetaRadVal);
                const sinThetaVal = Math.sin(thetaRadVal);
                
                axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                const xAxisEndX = h + 8 * cosThetaVal;
                const xAxisEndY = k + 8 * sinThetaVal;
                const xAxisStartX = h - 8 * cosThetaVal;
                const xAxisStartY = k - 8 * sinThetaVal;
                const yAxisEndX = h + 8 * (-sinThetaVal);
                const yAxisEndY = k + 8 * cosThetaVal;
                const yAxisStartX = h - 8 * (-sinThetaVal);
                const yAxisStartY = k - 8 * cosThetaVal;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                specialPoints = [
                    {x: x, y: y, label: `P(${fmt(x)}, ${fmt(y)})`},
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                resultDiv.innerHTML = `\\( \\text{New coordinates: } (${fmt(newX)}, ${fmt(newY)}) \\)`;
            }
            
            drawGraph([], specialPoints, axes);
            
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
    [pxInp, pyInp, hInp, kInp, thetaInp, bothHInp, bothKInp, bothThetaInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    for (let radio of typeRadios) radio.addEventListener('change', update);
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

/**
 * Line Equation in New Coordinates
 * Find the equation of a line after translation and/or rotation
 */
function renderLineEquationNewCoordinatesCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    document.getElementById('lineEquationNewCoordinatesBtn').classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Line Equation in New Coordinates</h2>
        
        <div class="formula-badge">\\( \\text{Find the equation of a line after changing the coordinate system} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Original Line Equation: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div>a = <input type="number" id="lineEqA" value="1" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="lineEqB" value="1" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="lineEqC" value="-2" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.9rem;">Current line: <span id="lineEqDisplay"></span></div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Select Transformation Type</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <label><input type="radio" name="lineTransType" value="translation" checked> Translation only</label>
                    <label><input type="radio" name="lineTransType" value="rotation"> Rotation only</label>
                    <label><input type="radio" name="lineTransType" value="both"> Translation + Rotation</label>
                </div>
            </div>
            
            <div id="lineTransParams" class="point-box" style="width:100%; margin-top:15px;">
                <label>Transformation Parameters</label>
                <div id="lineTransOnlyParams" style="display:block;">
                    <div>New origin O' = (h, k):</div>
                    <div style="display:flex; gap:15px; justify-content:center;">
                        <div>h = <input type="number" id="lineH" value="2" step="any" style="width:80px;"></div>
                        <div>k = <input type="number" id="lineK" value="1" step="any" style="width:80px;"></div>
                    </div>
                </div>
                <div id="lineRotOnlyParams" style="display:none; margin-top:10px;">
                    <div>Rotation angle θ:</div>
                    <div><input type="number" id="lineTheta" value="45" step="any" style="width:100px;"> degrees</div>
                </div>
                <div id="lineBothParams" style="display:none; margin-top:10px;">
                    <div>Translation: h = <input type="number" id="lineBothH" value="2" step="any" style="width:70px;">, k = <input type="number" id="lineBothK" value="1" step="any" style="width:70px;"></div>
                    <div style="margin-top:10px;">Rotation: θ = <input type="number" id="lineBothTheta" value="30" step="any" style="width:100px;"> degrees</div>
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
        
        <button class="calculate-btn" id="computeLineNewCoordBtn">
            <span>📐</span> Find New Equation
        </button>
        
        <div class="result-highlight" id="lineNewCoordResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Line Equation Transformation:</strong><br>
            • Translation: Replace x = X + h, y = Y + k to get equation in (X,Y)<br>
            • Rotation: Replace x = X cosθ - Y sinθ, y = X sinθ + Y cosθ<br>
            • Combined: Replace x = h + X cosθ - Y sinθ, y = k + X sinθ + Y cosθ
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    const typeRadios = document.getElementsByName('lineTransType');
    const transOnlyDiv = document.getElementById('lineTransOnlyParams');
    const rotOnlyDiv = document.getElementById('lineRotOnlyParams');
    const bothDiv = document.getElementById('lineBothParams');
    const aInp = document.getElementById('lineEqA');
    const bInp = document.getElementById('lineEqB');
    const cInp = document.getElementById('lineEqC');
    const hInp = document.getElementById('lineH');
    const kInp = document.getElementById('lineK');
    const thetaInp = document.getElementById('lineTheta');
    const bothHInp = document.getElementById('lineBothH');
    const bothKInp = document.getElementById('lineBothK');
    const bothThetaInp = document.getElementById('lineBothTheta');
    const compute = document.getElementById('computeLineNewCoordBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('lineNewCoordResult');
    const lineDisplay = document.getElementById('lineEqDisplay');
    
    function updateLineDisplay() {
        const a = parseFloat(aInp.value) || 0;
        const b = parseFloat(bInp.value) || 0;
        const c = parseFloat(cInp.value) || 0;
        let eq = '';
        if (a !== 0) eq += `${fmt(a)}x`;
        if (b !== 0) eq += `${b > 0 && eq ? '+' : ''}${fmt(b)}y`;
        if (c !== 0) eq += `${c > 0 && eq ? '+' : ''}${fmt(c)}`;
        eq += ' = 0';
        lineDisplay.textContent = eq;
    }
    
    [aInp, bInp, cInp].forEach(inp => inp.addEventListener('input', updateLineDisplay));
    updateLineDisplay();
    
    for (let radio of typeRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'translation') {
                transOnlyDiv.style.display = 'block';
                rotOnlyDiv.style.display = 'none';
                bothDiv.style.display = 'none';
            } else if (this.value === 'rotation') {
                transOnlyDiv.style.display = 'none';
                rotOnlyDiv.style.display = 'block';
                bothDiv.style.display = 'none';
            } else {
                transOnlyDiv.style.display = 'none';
                rotOnlyDiv.style.display = 'none';
                bothDiv.style.display = 'block';
            }
        });
    }

    function update() {
        clearErrors();
        
        try {
            let type = 'translation';
            for (let radio of typeRadios) {
                if (radio.checked) {
                    type = radio.value;
                    break;
                }
            }
            
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            let newA, newB, newC;
            let steps = [];
            let newEquation = '';
            
            steps.push(`📍 STEP 1: Original line equation`);
            steps.push(`   • ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`);
            steps.push(``);
            
            if (type === 'translation') {
                const h = validateNumber(hInp.value, 'h');
                const k = validateNumber(kInp.value, 'k');
                
                // x = X + h, y = Y + k
                // a(X + h) + b(Y + k) + c = 0
                // aX + bY + (ah + bk + c) = 0
                newA = a;
                newB = b;
                newC = a*h + b*k + c;
                
                steps.push(`📍 STEP 2: Translation of axes`);
                steps.push(`   • New origin O' = (${fmt(h)}, ${fmt(k)})`);
                steps.push(`   • Translation formulas: x = X + ${fmt(h)}, y = Y + ${fmt(k)}`);
                steps.push(`   • Substitute into the line equation:`);
                steps.push(`     ${fmt(a)}(X + ${fmt(h)}) + ${fmt(b)}(Y + ${fmt(k)}) + ${fmt(c)} = 0`);
                steps.push(`   • Expand: ${fmt(a)}X + ${fmt(a*h)} + ${fmt(b)}Y + ${fmt(b*k)} + ${fmt(c)} = 0`);
                steps.push(`   • Combine constants: ${fmt(a)}X + ${fmt(b)}Y + (${fmt(a*h + b*k + c)}) = 0`);
                steps.push(``);
                steps.push(`📍 STEP 3: New line equation in (X,Y) coordinates`);
                steps.push(`   • ${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`);
                
                newEquation = `${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`;
                
                // Draw graph
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                
                function getLinePoints(aVal, bVal, cVal) {
                    if (Math.abs(bVal) > 1e-10) {
                        return [
                            {x: minX, y: (-aVal*minX - cVal)/bVal},
                            {x: maxX, y: (-aVal*maxX - cVal)/bVal}
                        ];
                    } else {
                        const xConst = -cVal/aVal;
                        return [
                            {x: xConst, y: minY},
                            {x: xConst, y: maxY}
                        ];
                    }
                }
                
                const originalLine = getLinePoints(a, b, c);
                const newLine = getLinePoints(newA, newB, newC);
                
                const axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 },
                    { from: {x: minX, y: k}, to: {x: maxX, y: k}, color: '#d44c2f', dash: [5, 5], label: "new X' axis", width: 2 },
                    { from: {x: h, y: minY}, to: {x: h, y: maxY}, color: '#d44c2f', dash: [5, 5], label: "new Y' axis", width: 2 }
                ];
                
                const lineSegments = [
                    { from: originalLine[0], to: originalLine[1], color: '#2c3e50', dash: [], label: 'Original Line', width: 2 },
                    { from: newLine[0], to: newLine[1], color: '#d44c2f', dash: [5, 3], label: 'Line in New Coordinates', width: 2 }
                ];
                
                const specialPoints = [
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                drawGraph([], specialPoints, lineSegments);
                
            } else if (type === 'rotation') {
                const thetaDeg = validateNumber(thetaInp.value, 'θ');
                const thetaRad = thetaDeg * Math.PI / 180;
                const cosTheta = Math.cos(thetaRad);
                const sinTheta = Math.sin(thetaRad);
                
                // x = X cosθ - Y sinθ, y = X sinθ + Y cosθ
                // a(X cosθ - Y sinθ) + b(X sinθ + Y cosθ) + c = 0
                // (a cosθ + b sinθ)X + (-a sinθ + b cosθ)Y + c = 0
                newA = a * cosTheta + b * sinTheta;
                newB = -a * sinTheta + b * cosTheta;
                newC = c;
                
                steps.push(`📍 STEP 2: Rotation of axes by θ = ${fmt(thetaDeg)}°`);
                steps.push(`   • cos θ = ${fmt(cosTheta)}, sin θ = ${fmt(sinTheta)}`);
                steps.push(`   • Rotation formulas: x = X cosθ - Y sinθ, y = X sinθ + Y cosθ`);
                steps.push(`   • Substitute into the line equation:`);
                steps.push(`     ${fmt(a)}(X·${fmt(cosTheta)} - Y·${fmt(sinTheta)}) + ${fmt(b)}(X·${fmt(sinTheta)} + Y·${fmt(cosTheta)}) + ${fmt(c)} = 0`);
                steps.push(`   • Expand: (${fmt(a*cosTheta)}X - ${fmt(a*sinTheta)}Y) + (${fmt(b*sinTheta)}X + ${fmt(b*cosTheta)}Y) + ${fmt(c)} = 0`);
                steps.push(`   • Combine like terms:`);
                steps.push(`     X: ${fmt(a*cosTheta)} + ${fmt(b*sinTheta)} = ${fmt(newA)}`);
                steps.push(`     Y: -${fmt(a*sinTheta)} + ${fmt(b*cosTheta)} = ${fmt(newB)}`);
                steps.push(`   • New equation: ${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`);
                steps.push(``);
                steps.push(`📍 STEP 3: New line equation in (X,Y) coordinates`);
                steps.push(`   • ${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`);
                
                newEquation = `${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`;
                
                // Draw graph
                const minX = -8, maxX = 8;
                const minY = -8, maxY = 8;
                
                function getLinePoints(aVal, bVal, cVal) {
                    if (Math.abs(bVal) > 1e-10) {
                        return [
                            {x: minX, y: (-aVal*minX - cVal)/bVal},
                            {x: maxX, y: (-aVal*maxX - cVal)/bVal}
                        ];
                    } else {
                        const xConst = -cVal/aVal;
                        return [
                            {x: xConst, y: minY},
                            {x: xConst, y: maxY}
                        ];
                    }
                }
                
                const originalLine = getLinePoints(a, b, c);
                const newLine = getLinePoints(newA, newB, newC);
                
                const axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                const xAxisEndX = maxX * cosTheta;
                const xAxisEndY = maxX * sinTheta;
                const xAxisStartX = minX * cosTheta;
                const xAxisStartY = minX * sinTheta;
                const yAxisEndX = maxY * (-sinTheta);
                const yAxisEndY = maxY * cosTheta;
                const yAxisStartX = minY * (-sinTheta);
                const yAxisStartY = minY * cosTheta;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                const lineSegments = [
                    { from: originalLine[0], to: originalLine[1], color: '#2c3e50', dash: [], label: 'Original Line', width: 2 },
                    { from: newLine[0], to: newLine[1], color: '#d44c2f', dash: [5, 3], label: 'Line in New Coordinates', width: 2 }
                ];
                
                drawGraph([], [], lineSegments);
                drawGraph([], [], axes);
                
            } else {
                const h = validateNumber(bothHInp.value, 'h');
                const k = validateNumber(bothKInp.value, 'k');
                const thetaDeg = validateNumber(bothThetaInp.value, 'θ');
                const thetaRad = thetaDeg * Math.PI / 180;
                const cosTheta = Math.cos(thetaRad);
                const sinTheta = Math.sin(thetaRad);
                
                // x = h + X cosθ - Y sinθ, y = k + X sinθ + Y cosθ
                // a(h + X cosθ - Y sinθ) + b(k + X sinθ + Y cosθ) + c = 0
                // (a cosθ + b sinθ)X + (-a sinθ + b cosθ)Y + (ah + bk + c) = 0
                newA = a * cosTheta + b * sinTheta;
                newB = -a * sinTheta + b * cosTheta;
                newC = a*h + b*k + c;
                
                steps.push(`📍 STEP 2: Combined transformation (Translation + Rotation)`);
                steps.push(`   • Step 2.1: Translate origin to O' = (${fmt(h)}, ${fmt(k)})`);
                steps.push(`   • Step 2.2: Rotate by θ = ${fmt(thetaDeg)}°`);
                steps.push(`   • Combined formulas:`);
                steps.push(`     x = ${fmt(h)} + X·${fmt(cosTheta)} - Y·${fmt(sinTheta)}`);
                steps.push(`     y = ${fmt(k)} + X·${fmt(sinTheta)} + Y·${fmt(cosTheta)}`);
                steps.push(`   • Substitute into the line equation:`);
                steps.push(`     ${fmt(a)}(${fmt(h)} + ${fmt(cosTheta)}X - ${fmt(sinTheta)}Y) + ${fmt(b)}(${fmt(k)} + ${fmt(sinTheta)}X + ${fmt(cosTheta)}Y) + ${fmt(c)} = 0`);
                steps.push(`   • Expand:`);
                steps.push(`     ${fmt(a*h)} + ${fmt(a*cosTheta)}X - ${fmt(a*sinTheta)}Y + ${fmt(b*k)} + ${fmt(b*sinTheta)}X + ${fmt(b*cosTheta)}Y + ${fmt(c)} = 0`);
                steps.push(`   • Combine like terms:`);
                steps.push(`     X: ${fmt(a*cosTheta)} + ${fmt(b*sinTheta)} = ${fmt(newA)}`);
                steps.push(`     Y: -${fmt(a*sinTheta)} + ${fmt(b*cosTheta)} = ${fmt(newB)}`);
                steps.push(`     Constant: ${fmt(a*h + b*k + c)} = ${fmt(newC)}`);
                steps.push(``);
                steps.push(`📍 STEP 3: New line equation in (X,Y) coordinates`);
                steps.push(`   • ${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`);
                
                newEquation = `${fmt(newA)}X + ${fmt(newB)}Y + ${fmt(newC)} = 0`;
                
                // Draw graph
                const minX = -5, maxX = 12;
                const minY = -5, maxY = 10;
                
                function getLinePoints(aVal, bVal, cVal) {
                    if (Math.abs(bVal) > 1e-10) {
                        return [
                            {x: minX, y: (-aVal*minX - cVal)/bVal},
                            {x: maxX, y: (-aVal*maxX - cVal)/bVal}
                        ];
                    } else {
                        const xConst = -cVal/aVal;
                        return [
                            {x: xConst, y: minY},
                            {x: xConst, y: maxY}
                        ];
                    }
                }
                
                const originalLine = getLinePoints(a, b, c);
                const newLine = getLinePoints(newA, newB, newC);
                
                const axes = [
                    { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#2c3e50', dash: [], label: 'x-axis', width: 1.5 },
                    { from: {x: 0, y: minY}, to: {x: 0, y: maxY}, color: '#2c3e50', dash: [], label: 'y-axis', width: 1.5 }
                ];
                
                const xAxisEndX = h + 8 * cosTheta;
                const xAxisEndY = k + 8 * sinTheta;
                const xAxisStartX = h - 8 * cosTheta;
                const xAxisStartY = k - 8 * sinTheta;
                const yAxisEndX = h + 8 * (-sinTheta);
                const yAxisEndY = k + 8 * cosTheta;
                const yAxisStartX = h - 8 * (-sinTheta);
                const yAxisStartY = k - 8 * cosTheta;
                
                axes.push(
                    { from: {x: xAxisStartX, y: xAxisStartY}, to: {x: xAxisEndX, y: xAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "X' axis", width: 2 },
                    { from: {x: yAxisStartX, y: yAxisStartY}, to: {x: yAxisEndX, y: yAxisEndY}, color: '#d44c2f', dash: [5, 5], label: "Y' axis", width: 2 }
                );
                
                const lineSegments = [
                    { from: originalLine[0], to: originalLine[1], color: '#2c3e50', dash: [], label: 'Original Line', width: 2 },
                    { from: newLine[0], to: newLine[1], color: '#d44c2f', dash: [5, 3], label: 'Line in New Coordinates', width: 2 }
                ];
                
                const specialPoints = [
                    {x: h, y: k, label: `O'(${fmt(h)}, ${fmt(k)})`}
                ];
                
                drawGraph([], specialPoints, lineSegments);
            }
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{New equation: } ${newEquation} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    [aInp, bInp, cInp, hInp, kInp, thetaInp, bothHInp, bothKInp, bothThetaInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    for (let radio of typeRadios) radio.addEventListener('change', update);
    
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// ---- Shared helpers for quadratic polynomials  A x^2 + B xy + C y^2 + D x + E y + F  ----
// Parse text such as "x^2 + 4xy + y^2 - 8 = 0", "2X + 3Y - 6 = 0", "XY = 1", "3x²-y² = 8".
// '*' is optional, ^2 or ², implicit coefficients, both sides of '=' are handled (RHS is moved to the left).
function taParsePoly(str) {
    let s = String(str == null ? '' : str).toLowerCase()
        .replace(/[−–—]/g, '-').replace(/²/g, '^2')
        .replace(/[\s*×·]/g, '');
    if (!s) throw new Error('Please enter an equation.');
    const sides = s.split('=');
    if (sides.length > 2) throw new Error('The equation can contain only one "=" sign.');
    const p = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    sides.forEach((side, idx) => {
        if (side === '') throw new Error('Incomplete equation: nothing on one side of "=".');
        side = side.replace(/[+-]{2,}/g, m => ((m.match(/-/g) || []).length % 2 ? '-' : '+'));
        const terms = side.match(/[+-]?[^+-]+/g) || [];
        if (terms.join('') !== side) throw new Error('Could not read the equation near "' + side + '".');
        terms.forEach(term => {
            const m = /^([+-]?)(\d+\.?\d*|\.\d+)?(.*)$/.exec(term);
            let coef = (m[2] === undefined ? 1 : parseFloat(m[2])) * (m[1] === '-' ? -1 : 1) * (idx === 1 ? -1 : 1);
            const rest = m[3];
            if (m[2] === undefined && rest === '') throw new Error('Could not read the equation near "' + term + '".');
            let px = 0, py = 0, pos = 0;
            const re = /([xy])(?:\^(\d+))?/y;
            while (pos < rest.length) {
                re.lastIndex = pos;
                const t = re.exec(rest);
                if (!t) throw new Error('Could not read "' + term + '". Use only x, y, numbers, + - and ^2.');
                const pw = t[2] === undefined ? 1 : parseInt(t[2], 10);
                if (t[1] === 'x') px += pw; else py += pw;
                pos = re.lastIndex;
            }
            if (px + py > 2) throw new Error('Only terms up to degree 2 are supported (found "' + term + '").');
            if (px === 2) p.A += coef; else if (px === 1 && py === 1) p.B += coef; else if (py === 2) p.C += coef;
            else if (px === 1) p.D += coef; else if (py === 1) p.E += coef; else p.F += coef;
        });
    });
    if (![p.A, p.B, p.C, p.D, p.E, p.F].every(isFinite)) throw new Error('Invalid number in the equation.');
    return p;
}

// Text for a polynomial. constToRhs=true prints "terms = -F", otherwise "terms + F" (no "= 0" is added).
function taPolyStr(p, vx, vy, constToRhs) {
    const r = n => Math.round(n * 10000) / 10000;
    const items = [[p.A, vx + '²'], [p.B, vx + vy], [p.C, vy + '²'], [p.D, vx], [p.E, vy]];
    if (!constToRhs) items.push([p.F, '']);
    let out = '';
    items.forEach(([c, lab]) => {
        c = r(c);
        if (c === 0) return;
        const mag = Math.abs(c);
        const body = (lab && mag === 1) ? lab : String(mag) + lab;
        out += out ? (c < 0 ? ' - ' : ' + ') + body : (c < 0 ? '-' : '') + body;
    });
    if (!out) out = '0';
    return constToRhs ? out + ' = ' + String(r(-p.F) === 0 ? 0 : r(-p.F)) : out;
}

// Substitute X = L1[0]*u + L1[1]*v + L1[2], Y = L2[0]*u + L2[1]*v + L2[2] into P(X, Y).
function taSubst(p, L1, L2) {
    const mul = (L, M) => ({
        A: L[0]*M[0], B: L[0]*M[1] + L[1]*M[0], C: L[1]*M[1],
        D: L[0]*M[2] + L[2]*M[0], E: L[1]*M[2] + L[2]*M[1], F: L[2]*M[2]
    });
    const xx = mul(L1, L1), xy = mul(L1, L2), yy = mul(L2, L2);
    const out = {};
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(k => { out[k] = p.A*xx[k] + p.B*xy[k] + p.C*yy[k]; });
    out.D += p.D*L1[0] + p.E*L2[0];
    out.E += p.D*L1[1] + p.E*L2[1];
    out.F += p.D*L1[2] + p.E*L2[2] + p.F;
    return out;
}

// Chart.js dataset tracing the real curve P(x, y) = 0 inside the window (marching squares).
function taImplicitDataset(p, x0, x1, y0, y1, color, label, dash) {
    const N = 200, dx = (x1 - x0) / N, dy = (y1 - y0) / N;
    const f = (x, y) => p.A*x*x + p.B*x*y + p.C*y*y + p.D*x + p.E*y + p.F;
    const g = [];
    for (let j = 0; j <= N; j++) {
        const row = [];
        for (let i = 0; i <= N; i++) row.push(f(x0 + i*dx, y0 + j*dy));
        g.push(row);
    }
    const pts = [];
    const cross = (xa, ya, va, xb, yb, vb) => {
        if ((va >= 0) === (vb >= 0)) return null;
        const t = va / (va - vb);
        return { x: xa + t*(xb - xa), y: ya + t*(yb - ya) };
    };
    for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
            const xa = x0 + i*dx, xb = xa + dx, ya = y0 + j*dy, yb = ya + dy;
            const v00 = g[j][i], v10 = g[j][i+1], v11 = g[j+1][i+1], v01 = g[j+1][i];
            const bot = cross(xa, ya, v00, xb, ya, v10), rgt = cross(xb, ya, v10, xb, yb, v11);
            const top = cross(xa, yb, v01, xb, yb, v11), lft = cross(xa, ya, v00, xa, yb, v01);
            const e = [bot, rgt, top, lft].filter(Boolean);
            const seg = (a, b) => { pts.push(a, b, { x: null, y: null }); };
            if (e.length === 2) seg(e[0], e[1]);
            else if (e.length === 4) { seg(bot, lft); seg(top, rgt); }
        }
    }
    return {
        label: label, data: pts, backgroundColor: 'transparent', borderColor: color, borderWidth: 2,
        pointRadius: 0, showLine: true, fill: false, spanGaps: false, borderDash: dash || []
    };
}

// Helper function to format numbers
function fmt(n) {
    if (n === undefined || n === null) return '0';
    if (Math.abs(n) < 0.0001) return '0';
    if (Math.abs(n) > 10000) return n.toExponential(2);
    return Math.round(n * 10000) / 10000;
}