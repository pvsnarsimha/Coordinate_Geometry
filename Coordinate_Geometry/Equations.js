// ========= LAZY REGISTRATION =========
// Instead of defining all functions immediately, register them for lazy loading

(function() {
    // Store original function references
    const functionsToLazyLoad = [
        'renderSlopeInterceptCard',
        'renderPointSlopeCard',
        'renderTwoPointCard',
        'renderInterceptFormCard',
        'renderNormalFormCard',
        'renderGeneralFormCard',
        'renderParametricCard',
        'renderHorizontalLineCard',
        'renderVerticalLineCard',
        'renderSlopeFromGeneralCard',
        'renderXInterceptCard',
        'renderYInterceptCard',
        'renderSymmetricFormCard',
        'renderConcurrencyCard',
        'renderFamilyLinesCard',
        'renderLinearIndependenceCard'
    ];
    
    // Check if utils.js lazy loading system exists
    if (typeof registerLazyFunction !== 'undefined') {
        // Register each function for lazy loading
        functionsToLazyLoad.forEach(funcName => {
            registerLazyFunction(funcName, () => {
                // The function is already defined in this file
                // We just need to ensure it's available
                console.log(`Loading ${funcName}...`);
            });
        });
    }
})();
// Add this with the other button declarations
const parametricFormBtn = document.getElementById('parametricFormBtn');

// Add this with the other button declarations (around line 1900)
const familyLinesBtn = document.getElementById('familyLinesBtn');
// NEW: Render function for Slope-Intercept Form
function renderSlopeInterceptCard() {
    // Deactivate all main nav buttons (from coordinate geo)
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    // Activate the new sidebar button
    slopeInterceptBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📉</span> Slope-Intercept Form</h2>
        <div class="formula-badge">\\( y = m x + c \\)</div>
        <div class="formula-badge">\\( m = \\text{slope}, \\quad c = \\text{y-intercept} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Parameters</label>
                <div class="coord-input"><span>m (slope) =</span><input type="number" id="siM" value="2" step="any"></div>
                <div class="coord-input"><span>c (intercept) =</span><input type="number" id="siC" value="3" step="any"></div>
            </div>
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input"><span>x =</span><input type="number" id="siX" value="1" step="any"></div>
                <div class="coord-input"><span>y =</span><input type="number" id="siY" value="5" step="any"></div>
                <div style="font-size:0.9rem; margin-top:8px;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSlopeInterceptBtn"><span>📈</span> Analyze line</button>
        
        <div class="result-highlight" id="siResult">\\( y = 2x + 3 \\)</div>
        <div class="footnote">Graph shows the line. If a test point is provided, it will be shown.</div>
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const mInp = document.getElementById('siM'), cInp = document.getElementById('siC');
    const xInp = document.getElementById('siX'), yInp = document.getElementById('siY');
    const compute = document.getElementById('computeSlopeInterceptBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('siResult');

    function update() {
        clearErrors();
        try {
            const m = validateNumber(mInp.value, 'slope m');
            const c = validateNumber(cInp.value, 'intercept c');
            
            // Optional point
            let testPoint = null;
            let pointOnLine = false;
            let pointCheckStep = '';
            try {
                const xVal = validateNumber(xInp.value, 'test x');
                const yVal = validateNumber(yInp.value, 'test y');
                testPoint = {x: xVal, y: yVal};
                const expectedY = m * xVal + c;
                pointOnLine = Math.abs(yVal - expectedY) < 1e-10;
                pointCheckStep = `⑦ Check test point (${fmt(xVal)}, ${fmt(yVal)}): expected y = ${fmt(m)}·${fmt(xVal)} + ${fmt(c)} = ${fmt(expectedY)}. Actual y = ${fmt(yVal)}. Point is ${pointOnLine ? '' : 'not '}on the line.`;
            } catch (e) {
                // Point fields are optional, ignore if invalid/empty
                pointCheckStep = '';
            }

            // For graph: generate points for the line
            // Find reasonable x-range based on test point or default
            let minX = -5, maxX = 5;
            if (testPoint) {
                minX = Math.min(minX, testPoint.x - 2);
                maxX = Math.max(maxX, testPoint.x + 2);
            }
            const linePoints = [
                {x: minX, y: m * minX + c},
                {x: maxX, y: m * maxX + c}
            ];

            const points = testPoint ? [testPoint] : [];
            const lineSegments = [
                { from: linePoints[0], to: linePoints[1], color: '#2c3e50', dash: [], label: `y = ${fmt(m)}x + ${fmt(c)}`, width: 2 }
            ];

            drawGraph(points, [], lineSegments);

            // Generate steps
            const steps = [
                `① Slope-intercept form: y = m x + c`,
                `② Given m = ${fmt(m)}, c = ${fmt(c)}`,
                `③ Equation: y = ${fmt(m)}x + ${fmt(c)}`,
                `④ For graphing, pick x = ${fmt(minX)} → y = ${fmt(m)}·${fmt(minX)} + ${fmt(c)} = ${fmt(linePoints[0].y)}`,
                `⑤ For graphing, pick x = ${fmt(maxX)} → y = ${fmt(m)}·${fmt(maxX)} + ${fmt(c)} = ${fmt(linePoints[1].y)}`,
                `⑥ Line passes through (${fmt(linePoints[0].x)}, ${fmt(linePoints[0].y)}) and (${fmt(linePoints[1].x)}, ${fmt(linePoints[1].y)})`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
            ).join('');
            
            let resultText = `\\( y = ${fmt(m)}x`;
            if (c >= 0) resultText += ` + ${fmt(c)}`;
            else resultText += ` - ${Math.abs(fmt(c))}`;
            resultText += ` \\)`;
            
            if (testPoint && pointCheckStep) {
                resultText += `<br>Test point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            }
            
            resultDiv.innerHTML = resultText;
            renderLatex();
            attachStepsToggle();
        } catch (e) {
            showError(e.message, [mInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [mInp, cInp, xInp, yInp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
    [mInp, cInp, xInp, yInp].forEach(inp => inp.addEventListener('input', clearErrors));
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}

// Event listener for the new "Equations of a Straight Line" tab
tabLineEquations.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabLineEquations');
    // Optionally, render a default card for this tab, like the slope-intercept form
    renderSlopeInterceptCard();
});

// Event listener for the new sidebar button
slopeInterceptBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderSlopeInterceptCard();
});
// NEW: Render function for Point-Slope Form
function renderPointSlopeCard() {
    // Deactivate all main nav buttons (from coordinate geo)
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate the other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    // Activate the point-slope sidebar button
    const pointSlopeBtn = document.getElementById('pointSlopeBtn');
    pointSlopeBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Point-Slope Form</h2>
        <div class="formula-badge">\\( y - y_1 = m(x - x_1) \\)</div>
        <div class="formula-badge">\\( \\text{through point } (x_1, y_1) \\text{ with slope } m \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Point \\((x_1, y_1)\\)</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="psX1" value="2" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="psY1" value="3" step="any"></div>
            </div>
            <div class="point-box" style="flex:1;">
                <label>Slope</label>
                <div class="coord-input"><span>m =</span><input type="number" id="psM" value="2" step="any"></div>
                <div style="font-size:0.9rem; margin-top:8px;">Slope of the line</div>
            </div>
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input"><span>x =</span><input type="number" id="psX" value="4" step="any"></div>
                <div class="coord-input"><span>y =</span><input type="number" id="psY" value="7" step="any"></div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePointSlopeBtn"><span>📐</span> Analyze line</button>
        
        <div class="result-highlight" id="psResult">\\( y - 3 = 2(x - 2) \\)</div>
        <div class="footnote">Graph shows the line. If a test point is provided, it will be shown.</div>
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const x1Inp = document.getElementById('psX1'), y1Inp = document.getElementById('psY1');
    const mInp = document.getElementById('psM');
    const xInp = document.getElementById('psX'), yInp = document.getElementById('psY');
    const compute = document.getElementById('computePointSlopeBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('psResult');

    function update() {
        clearErrors();
        try {
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const m = validateNumber(mInp.value, 'slope m');
            
            // Optional test point
            let testPoint = null;
            let pointOnLine = false;
            let pointCheckStep = '';
            try {
                const xVal = validateNumber(xInp.value, 'test x');
                const yVal = validateNumber(yInp.value, 'test y');
                testPoint = {x: xVal, y: yVal};
                const expectedY = m * (xVal - x1) + y1;
                pointOnLine = Math.abs(yVal - expectedY) < 1e-10;
                pointCheckStep = `⑥ Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                    `using equation y = ${fmt(m)}(x - ${fmt(x1)}) + ${fmt(y1)} = ` +
                    `${fmt(m)}·(${fmt(xVal)} - ${fmt(x1)}) + ${fmt(y1)} = ${fmt(expectedY)}. ` +
                    `Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            } catch (e) {
                // Point fields are optional, ignore if invalid/empty
                pointCheckStep = '';
            }

            // For graph: generate points for the line
            let minX = -5, maxX = 5;
            if (testPoint) {
                minX = Math.min(minX, testPoint.x - 2, x1 - 2);
                maxX = Math.max(maxX, testPoint.x + 2, x1 + 2);
            } else {
                minX = Math.min(minX, x1 - 2);
                maxX = Math.max(maxX, x1 + 2);
            }
            
            const linePoints = [
                {x: minX, y: m * (minX - x1) + y1},
                {x: maxX, y: m * (maxX - x1) + y1}
            ];

            const points = testPoint ? [testPoint, {x: x1, y: y1}] : [{x: x1, y: y1}];
            const specialPoints = testPoint ? [{x: x1, y: y1, label: '(x₁,y₁)'}] : [{x: x1, y: y1, label: '(x₁,y₁)'}];
            const lineSegments = [
                { from: linePoints[0], to: linePoints[1], color: '#2c3e50', dash: [], label: `y - ${fmt(y1)} = ${fmt(m)}(x - ${fmt(x1)})`, width: 2 }
            ];

            drawGraph(points, specialPoints, lineSegments);

            // Generate steps
            const steps = [
                `① Point-slope form: y - y₁ = m(x - x₁)`,
                `② Given point (x₁, y₁) = (${fmt(x1)}, ${fmt(y1)}) and slope m = ${fmt(m)}`,
                `③ Substitute: y - ${fmt(y1)} = ${fmt(m)}(x - ${fmt(x1)})`,
                `④ For graphing, pick x = ${fmt(minX)} → y = ${fmt(m)}·(${fmt(minX)} - ${fmt(x1)}) + ${fmt(y1)} = ${fmt(linePoints[0].y)}`,
                `⑤ For graphing, pick x = ${fmt(maxX)} → y = ${fmt(m)}·(${fmt(maxX)} - ${fmt(x1)}) + ${fmt(y1)} = ${fmt(linePoints[1].y)}`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            } else {
                steps.push(`⑥ Line passes through (${fmt(linePoints[0].x)}, ${fmt(linePoints[0].y)}) and (${fmt(linePoints[1].x)}, ${fmt(linePoints[1].y)})`);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
            ).join('');
            
            let resultText = `\\( y - ${fmt(y1)} = ${fmt(m)}(x - ${fmt(x1)}) \\)`;
            
            if (testPoint && pointCheckStep) {
                resultText += `<br>Test point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            }
            
            resultDiv.innerHTML = resultText;
            renderLatex();
            attachStepsToggle();
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, mInp, xInp, yInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, mInp, xInp, yInp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
    [x1Inp, y1Inp, mInp, xInp, yInp].forEach(inp => inp.addEventListener('input', clearErrors));
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// NEW: Render function for Two-Point Form
function renderTwoPointCard() {
    // Deactivate all main nav buttons (from coordinate geo)
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    
    // Activate the two-point sidebar button
    const twoPointBtn = document.getElementById('twoPointBtn');
    twoPointBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔗</span> Two-Point Form</h2>
        <div class="formula-badge">\\( \\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1} \\)</div>
        <div class="formula-badge">\\( \\text{Line through } (x_1, y_1) \\text{ and } (x_2, y_2) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Point \\((x_1, y_1)\\)</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="tpX1" value="1" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="tpY1" value="2" step="any"></div>
            </div>
            <div class="point-box" style="flex:1;">
                <label>Point \\((x_2, y_2)\\)</label>
                <div class="coord-input"><span>x₂ =</span><input type="number" id="tpX2" value="4" step="any"></div>
                <div class="coord-input"><span>y₂ =</span><input type="number" id="tpY2" value="6" step="any"></div>
            </div>
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input"><span>x =</span><input type="number" id="tpX" value="2" step="any"></div>
                <div class="coord-input"><span>y =</span><input type="number" id="tpY" value="4" step="any"></div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeTwoPointBtn"><span>🔗</span> Analyze line</button>
        
        <div class="result-highlight" id="tpResult">\\( \\frac{y - 2}{4} = \\frac{x - 1}{3} \\)</div>
        <div class="footnote">Graph shows the line through the two points. Optional test point can be checked.</div>
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const x1Inp = document.getElementById('tpX1'), y1Inp = document.getElementById('tpY1');
    const x2Inp = document.getElementById('tpX2'), y2Inp = document.getElementById('tpY2');
    const xInp = document.getElementById('tpX'), yInp = document.getElementById('tpY');
    const compute = document.getElementById('computeTwoPointBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('tpResult');

function update() {
    clearErrors();
    try {
        const x1 = validateNumber(x1Inp.value, 'x₁');
        const y1 = validateNumber(y1Inp.value, 'y₁');
        const x2 = validateNumber(x2Inp.value, 'x₂');
        const y2 = validateNumber(y2Inp.value, 'y₂');
        
        // Check if points are the same
        if (Math.abs(x2 - x1) < 1e-10 && Math.abs(y2 - y1) < 1e-10) {
            throw new Error('Points must be different to define a line');
        }
        
        // Calculate slope for equation
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Optional test point
        let testPoint = null;
        let pointOnLine = false;
        let pointCheckStep = '';
        try {
            const xVal = validateNumber(xInp.value, 'test x');
            const yVal = validateNumber(yInp.value, 'test y');
            testPoint = {x: xVal, y: yVal};
            
            // Check if point lies on line using determinant method
            // (x2-x1)*(y-y1) - (y2-y1)*(x-x1) = 0
            const determinant = dx * (yVal - y1) - dy * (xVal - x1);
            pointOnLine = Math.abs(determinant) < 1e-10;
            
            // FIXED: Using regular numbers instead of emoji for step 8
            pointCheckStep = `8. Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                `Using determinant (x₂-x₁)(y-y₁) - (y₂-y₁)(x-x₁) = ` +
                `${fmt(dx)}·(${fmt(yVal)} - ${fmt(y1)}) - ${fmt(dy)}·(${fmt(xVal)} - ${fmt(x1)}) = ` +
                `${fmt(dx * (yVal - y1))} - ${fmt(dy * (xVal - x1))} = ${fmt(determinant)}. ` +
                `Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
        } catch (e) {
            // Point fields are optional, ignore if invalid/empty
            pointCheckStep = '';
        }

        // For graph: generate points for the line
        let minX = Math.min(x1, x2) - 2;
        let maxX = Math.max(x1, x2) + 2;
        
        if (testPoint) {
            minX = Math.min(minX, testPoint.x - 2);
            maxX = Math.max(maxX, testPoint.x + 2);
        }
        
        let linePoints;
        let steps = [];
        
        if (Math.abs(dx) < 1e-10) {
            // Vertical line case
            linePoints = [
                {x: x1, y: minX},
                {x: x1, y: maxX}
            ];
            
            // CLARIFIED STEPS FOR VERTICAL LINE
            steps = [
                `1. Point A(x₁, y₁) = (${fmt(x1)}, ${fmt(y1)})`,
                `2. Point B(x₂, y₂) = (${fmt(x2)}, ${fmt(y2)})`,
                `3. Since x₁ = x₂ (both are ${fmt(x1)}), the line is VERTICAL`,
                `4. Equation of vertical line: x = ${fmt(x1)}`,
                `5. Two-point form simplifies to x = constant`,
                `6. For graphing, pick y = ${fmt(minX)} → point (${fmt(x1)}, ${fmt(minX)})`,
                `7. For graphing, pick y = ${fmt(maxX)} → point (${fmt(x1)}, ${fmt(maxX)})`
            ];
            
            resultDiv.innerHTML = `\\( x = ${fmt(x1)} \\) (vertical line)`;
            
        } else {
            // Non-vertical line case
            const m = dy / dx;
            const slopeDisplay = fmt(m);
            const intercept = y1 - m * x1;
            const interceptDisplay = fmt(intercept);
            
            linePoints = [
                {x: minX, y: y1 + m * (minX - x1)},
                {x: maxX, y: y1 + m * (maxX - x1)}
            ];
            
            // CLARIFIED STEPS FOR NON-VERTICAL LINE
            steps = [
                `1. Point A(x₁, y₁) = (${fmt(x1)}, ${fmt(y1)})`,
                `2. Point B(x₂, y₂) = (${fmt(x2)}, ${fmt(y2)})`,
                `3. Calculate differences:`,
                `   Δx = x₂ - x₁ = ${fmt(x2)} - ${fmt(x1)} = ${fmt(dx)}`,
                `4. Δy = y₂ - y₁ = ${fmt(y2)} - ${fmt(y1)} = ${fmt(dy)}`,
                `5. Two-point form formula: (y - y₁)/(y₂ - y₁) = (x - x₁)/(x₂ - x₁)`,
                `   Substitute values: (y - ${fmt(y1)})/${fmt(dy)} = (x - ${fmt(x1)})/${fmt(dx)}`,
                `6. Cross-multiply: ${fmt(dx)}(y - ${fmt(y1)}) = ${fmt(dy)}(x - ${fmt(x1)})`,
                `   ${fmt(dx)}y - ${fmt(dx * y1)} = ${fmt(dy)}x - ${fmt(dy * x1)}`,
                `7. Rearrange to slope-intercept form (y = mx + c):`,
                `   ${fmt(dx)}y = ${fmt(dy)}x - ${fmt(dy * x1)} + ${fmt(dx * y1)}`,
                `   y = (${fmt(dy)}/${fmt(dx)})x + (${fmt(dx * y1 - dy * x1)}/${fmt(dx)})`,
                `   y = ${slopeDisplay}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(interceptDisplay)}`
            ];
            
            resultDiv.innerHTML = `\\( y = ${slopeDisplay}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(interceptDisplay)} \\)<br>` +
                `\\( \\frac{y - ${fmt(y1)}}{${fmt(dy)}} = \\frac{x - ${fmt(x1)}}{${fmt(dx)}} \\)`;
        }
        
        // Add test point step if it exists
        if (pointCheckStep) {
            steps.push(pointCheckStep);
        }

        // Add graph information step
        steps.push(`${steps.length + 1}. Graph shows the line with points A and B highlighted`);

        const points = testPoint ? [testPoint, {x: x1, y: y1}, {x: x2, y: y2}] : [{x: x1, y: y1}, {x: x2, y: y2}];
        const specialPoints = [
            {x: x1, y: y1, label: 'A'},
            {x: x2, y: y2, label: 'B'}
        ];
        
        let lineLabel = `Line through A(${fmt(x1)},${fmt(y1)}) and B(${fmt(x2)},${fmt(y2)})`;
        const lineSegments = [
            { from: linePoints[0], to: linePoints[1], color: '#2c3e50', dash: [], label: lineLabel, width: 2 }
        ];

        drawGraph(points, specialPoints, lineSegments);

        // Display steps with proper numbering
        stepsDiv.innerHTML = steps.map((txt, i) => 
            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
        ).join('');
        
        renderLatex();
        attachStepsToggle();
    } catch (e) {
        showError(e.message, [x1Inp, y1Inp, x2Inp, y2Inp, xInp, yInp]);
    }
}

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, x2Inp, y2Inp, xInp, yInp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
    [x1Inp, y1Inp, x2Inp, y2Inp, xInp, yInp].forEach(inp => inp.addEventListener('input', clearErrors));
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// NEW: Render function for Intercept Form (x/a + y/b = 1)
function renderInterceptFormCard() {
    // ===== STEP 1: DEACTIVATE ALL OTHER BUTTONS =====
    // When we click the Intercept Form button, we need to:
    // 1. Remove the "active" highlight from ALL coordinate geometry buttons
    // 2. Remove "active" from other equation form buttons
    // 3. Add "active" only to our Intercept Form button
    
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    
    // Activate ONLY the intercept form sidebar button
    const interceptFormBtn = document.getElementById('interceptFormBtn');
    interceptFormBtn.classList.add('active-btn');

    // ===== STEP 2: CREATE THE USER INTERFACE (HTML) =====
    // This is what the student sees on screen
    const html = `
        <h2 style="color:#113355;"><span>📊</span> Intercept Form</h2>
        
        <!-- Display the formula at the top -->
        <div class="formula-badge">\\( \\frac{x}{a} + \\frac{y}{b} = 1 \\)</div>
        <div class="formula-badge">\\( a = \\text{x-intercept}, \\quad b = \\text{y-intercept} \\)</div>
        
        <!-- Input section - where students enter numbers -->
        <div class="input-group" style="justify-content:center;">
            <!-- Left box: Intercept inputs -->
            <div class="point-box" style="flex:1;">
                <label>Intercepts</label>
                <div class="coord-input">
                    <span>a (x-intercept) =</span>
                    <input type="number" id="intA" value="3" step="any">
                </div>
                <div class="coord-input">
                    <span>b (y-intercept) =</span>
                    <input type="number" id="intB" value="4" step="any">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> a ≠ 0, b ≠ 0
                </div>
            </div>
            
            <!-- Right box: Optional test point -->
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input">
                    <span>x =</span>
                    <input type="number" id="intX" value="1.5" step="any">
                </div>
                <div class="coord-input">
                    <span>y =</span>
                    <input type="number" id="intY" value="2" step="any">
                </div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <!-- Graph container - where we draw the line -->
        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <!-- Steps section - shows the calculation process -->
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <!-- Calculate button - triggers the analysis -->
        <button class="calculate-btn" id="computeInterceptBtn">
            <span>📊</span> Analyze line
        </button>
        
        <!-- Result display - shows the final answer -->
        <div class="result-highlight" id="intResult">
            \\( \\frac{x}{3} + \\frac{y}{4} = 1 \\)
        </div>
        <div class="footnote">
            Graph shows the line with x-intercept (a,0) and y-intercept (0,b). 
            If a test point is provided, it will be shown.
        </div>
    `;
    
    // Put this HTML into the main card area of the page
    mainCard.innerHTML = html;
    
    // Convert any LaTeX math notation to beautiful formatted math
    renderLatex();

    // ===== STEP 3: GET REFERENCES TO ALL INPUT FIELDS =====
    // These variables "point to" the input boxes so we can read their values
    const aInp = document.getElementById('intA');      // a (x-intercept) input
    const bInp = document.getElementById('intB');      // b (y-intercept) input
    const xInp = document.getElementById('intX');      // test point x input
    const yInp = document.getElementById('intY');      // test point y input
    const compute = document.getElementById('computeInterceptBtn'); // calculate button
    const stepsDiv = document.getElementById('stepsContainer'); // where steps appear
    const resultDiv = document.getElementById('intResult'); // where result appears

    // ===== STEP 4: THE MAIN UPDATE FUNCTION =====
    function update() {
    clearErrors();
    try {
        // ===== READ INPUT VALUES =====
        const a = validateNumber(aInp.value, 'a (x-intercept)');
        const b = validateNumber(bInp.value, 'b (y-intercept)');
        
        // Check for zero intercepts (can't have division by zero)
        if (Math.abs(a) < 1e-10) {
            throw new Error('x-intercept (a) cannot be zero');
        }
        if (Math.abs(b) < 1e-10) {
            throw new Error('y-intercept (b) cannot be zero');
        }
        
        // ===== HANDLE OPTIONAL TEST POINT =====
        let testPoint = null;
        let pointOnLine = false;
        let pointCheckStep = '';
        
        try {
            const xVal = validateNumber(xInp.value, 'test x');
            const yVal = validateNumber(yInp.value, 'test y');
            testPoint = {x: xVal, y: yVal};
            
            const leftSide = xVal/a + yVal/b;
            pointOnLine = Math.abs(leftSide - 1) < 1e-10;
            
            pointCheckStep = `⑧ Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                `x/a + y/b = ${fmt(xVal)}/${fmt(a)} + ${fmt(yVal)}/${fmt(b)} = ` +
                `${fmt(xVal/a)} + ${fmt(yVal/b)} = ${fmt(leftSide)}. ` +
                `Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
        } catch (e) {
            pointCheckStep = '';
        }

        // ===== STEP 1: UNDERSTAND THE INTERCEPT POINTS =====
        // The line passes through two special points:
        const xIntercept = {x: a, y: 0};  // Point where line crosses x-axis: (a, 0)
        const yIntercept = {x: 0, y: b};  // Point where line crosses y-axis: (0, b)
        
        // ===== STEP 2: DECIDE WHAT X-VALUES TO USE FOR GRAPHING =====
        // We need to choose x-values that will show the ENTIRE line properly
        
        // First, find the smallest x-value we need to show
        // Start with 0 and the x-intercept (a), take the smaller one, then go 2 units left
        let minX = Math.min(0, a) - 2;
        
        // Find the largest x-value we need to show
        // Start with 0 and the x-intercept (a), take the larger one, then go 2 units right
        let maxX = Math.max(0, a) + 2;
        
        // If there's a test point, make sure it's also visible
        if (testPoint) {
            minX = Math.min(minX, testPoint.x - 2);  // If test point is more left, include it
            maxX = Math.max(maxX, testPoint.x + 2);  // If test point is more right, include it
        }
        
        // ===== STEP 3: CALCULATE Y-VALUES FOR OUR CHOSEN X-VALUES =====
        // We use the equation: x/a + y/b = 1
        // Rearranged to solve for y: y = b(1 - x/a)
        
        // Calculate y for our LEFTmost x-value (minX)
        const leftY = b * (1 - minX/a);
        
        // Calculate y for our RIGHTmost x-value (maxX)
        const rightY = b * (1 - maxX/a);
        
        // These two points (minX, leftY) and (maxX, rightY) will be used to draw the line
        const linePoints = [
            {x: minX, y: leftY},   // LEFT point on the line
            {x: maxX, y: rightY}    // RIGHT point on the line
        ];

        // ===== STEP 4: PREPARE POINTS FOR DISPLAY =====
        const points = testPoint ? 
            [testPoint, xIntercept, yIntercept] : 
            [xIntercept, yIntercept];
        
        const specialPoints = [
            {x: a, y: 0, label: `(${fmt(a)},0)`},  // X-intercept label
            {x: 0, y: b, label: `(0,${fmt(b)})`}   // Y-intercept label
        ];
        
        const lineSegments = [
            { 
                from: linePoints[0], 
                to: linePoints[1], 
                color: '#2c3e50', 
                dash: [], 
                label: `x/${fmt(a)} + y/${fmt(b)} = 1`, 
                width: 2 
            }
        ];

        // Draw the graph
        drawGraph(points, specialPoints, lineSegments);

        // ===== STEP 5: CREATE STEP-BY-STEP EXPLANATION WITH CLEAR NOTES =====
        
        // NOTES FOR STEP ⑤ (Choosing LEFT x-value):
        // We pick minX as our leftmost x-value because:
        // - We want to see the line extend beyond all points
        // - minX = smallest of (0, a, testPoint.x) minus 2 units padding
        // - This ensures the line is visible on the LEFT side of the graph
        
        // NOTES FOR STEP ⑥ (Choosing RIGHT x-value):
        // We pick maxX as our rightmost x-value because:
        // - We want to see the line extend beyond all points
        // - maxX = largest of (0, a, testPoint.x) plus 2 units padding
        // - This ensures the line is visible on the RIGHT side of the graph
        
        // NOTES FOR CALCULATING Y:
        // From x/a + y/b = 1, we solve for y:
        // Step 1: y/b = 1 - x/a
        // Step 2: y = b(1 - x/a)
        // This formula gives us the y-coordinate for any x on the line
        
        const steps = [
            `① Intercept form: x/a + y/b = 1`,
            `② Given a = ${fmt(a)} (x-intercept), b = ${fmt(b)} (y-intercept)`,
            `③ Equation: x/${fmt(a)} + y/${fmt(b)} = 1`,
            `④ Line passes through two key points:`,
            `   • X-intercept: (${fmt(a)}, 0) - where line crosses x-axis`,
            `   • Y-intercept: (0, ${fmt(b)}) - where line crosses y-axis`,
            
            `⑤ 📌 CHOOSING LEFT X-VALUE FOR GRAPH:`,
            `   • We need to pick an x-value LEFT of all points to draw the line`,
            `   • Smallest important x = min(0, ${fmt(a)}${testPoint ? `, ${fmt(testPoint.x)}` : ''}) = ${fmt(Math.min(0, a, testPoint ? testPoint.x : Infinity))}`,
            `   • Subtract 2 units for padding: ${fmt(minX + 2)} - 2 = ${fmt(minX)}`,
            `   • So we pick x₁ = ${fmt(minX)} for the LEFT point`,
            `   • Calculate y₁ using formula y = b(1 - x/a):`,
            `     y₁ = ${fmt(b)} × (1 - ${fmt(minX)}/${fmt(a)})`,
            `     y₁ = ${fmt(b)} × (1 - ${fmt(minX/a)})`,
            `     y₁ = ${fmt(b)} × ${fmt(1 - minX/a)} = ${fmt(leftY)}`,
            `   • LEFT point on line = (${fmt(minX)}, ${fmt(leftY)})`,
            
            `⑥ 📌 CHOOSING RIGHT X-VALUE FOR GRAPH:`,
            `   • We need to pick an x-value RIGHT of all points to draw the line`,
            `   • Largest important x = max(0, ${fmt(a)}${testPoint ? `, ${fmt(testPoint.x)}` : ''}) = ${fmt(Math.max(0, a, testPoint ? testPoint.x : -Infinity))}`,
            `   • Add 2 units for padding: ${fmt(maxX - 2)} + 2 = ${fmt(maxX)}`,
            `   • So we pick x₂ = ${fmt(maxX)} for the RIGHT point`,
            `   • Calculate y₂ using formula y = b(1 - x/a):`,
            `     y₂ = ${fmt(b)} × (1 - ${fmt(maxX)}/${fmt(a)})`,
            `     y₂ = ${fmt(b)} × (1 - ${fmt(maxX/a)})`,
            `     y₂ = ${fmt(b)} × ${fmt(1 - maxX/a)} = ${fmt(rightY)}`,
            `   • RIGHT point on line = (${fmt(maxX)}, ${fmt(rightY)})`,
            
            `⑦ 📏 DRAWING THE LINE:`,
            `   • Connect points (${fmt(minX)}, ${fmt(leftY)}) and (${fmt(maxX)}, ${fmt(rightY)})`,
            `   • This line will pass through (${fmt(a)}, 0) and (0, ${fmt(b)})`,
            `   • The line extends beyond both intercepts to fill the graph`
        ];
        
        // Add test point explanation if we have one
        if (pointCheckStep) {
            steps.push(pointCheckStep);
        } else {
            steps.push(`⑧ No test point provided. You can enter x and y values to check if a point lies on this line.`);
        }

        // Display the steps
        stepsDiv.innerHTML = steps.map((txt, i) => 
            `<div class="step-row">
                <span class="step-marker">${i+1}</span>
                <span class="step-text" style="white-space: pre-line;">${txt}</span>
            </div>`
        ).join('');
        
        // ===== DISPLAY RESULT =====
        let resultText = `\\( \\frac{x}{${fmt(a)}} + \\frac{y}{${fmt(b)}} = 1 \\)`;
        
        if (testPoint && pointCheckStep) {
            resultText += `<br>Test point (${fmt(testPoint.x)}, ${fmt(testPoint.y)}) is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
        }
        
        resultDiv.innerHTML = resultText;
        renderLatex();
        attachStepsToggle();
        
    } catch (e) {
        showError(e.message, [aInp, bInp, xInp, yInp]);
    }
    }

    // ===== STEP 5: SET UP EVENT LISTENERS =====
    // These make the page interactive
    
    // When user clicks the Calculate button, run update()
    compute.addEventListener('click', update);
    
    // When user presses Enter in any input field, run update()
    [aInp, bInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    
    // When user types in any input, clear previous error messages
    [aInp, bInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // ===== STEP 6: INITIAL DISPLAY =====
    // Run update once to show initial results with default values
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Normal/Perpendicular Form
function renderNormalFormCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    
    // Activate the normal form sidebar button
    const normalFormBtn = document.getElementById('normalFormBtn');
    normalFormBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Normal/Perpendicular Form</h2>
        
        <div class="formula-badge">\\( x \\cos \\theta + y \\sin \\theta = p \\)</div>
        <div class="formula-badge">\\( p = \\text{perpendicular distance from origin} \\)</div>
        <div class="formula-badge">\\( \\theta = \\text{angle of normal with positive x-axis} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Parameters</label>
                <div class="coord-input">
                    <span>θ (degrees) =</span>
                    <input type="number" id="normTheta" value="45" step="any">
                </div>
                <div class="coord-input">
                    <span>p (distance) =</span>
                    <input type="number" id="normP" value="5" step="any" min="0">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> p ≥ 0 (distance from origin)
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input">
                    <span>x =</span>
                    <input type="number" id="normX" value="3" step="any">
                </div>
                <div class="coord-input">
                    <span>y =</span>
                    <input type="number" id="normY" value="4" step="any">
                </div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeNormalBtn">
            <span>📐</span> Analyze line
        </button>
        
        <div class="result-highlight" id="normResult">
            \\( x \\cos 45° + y \\sin 45° = 5 \\)
        </div>
        <div class="footnote">
            Graph shows the line with normal vector at angle θ. The perpendicular from origin to line has length p.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const thetaInp = document.getElementById('normTheta');
    const pInp = document.getElementById('normP');
    const xInp = document.getElementById('normX');
    const yInp = document.getElementById('normY');
    const compute = document.getElementById('computeNormalBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('normResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            const p = validatePositiveNumber(pInp.value, 'p', false); // p must be > 0
            
            // Convert degrees to radians for calculation
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            
            // Optional test point
            let testPoint = null;
            let pointOnLine = false;
            let pointCheckStep = '';
            
            try {
                const xVal = validateNumber(xInp.value, 'test x');
                const yVal = validateNumber(yInp.value, 'test y');
                testPoint = {x: xVal, y: yVal};
                
                // Check if point satisfies: x·cosθ + y·sinθ = p
                const leftSide = xVal * cosTheta + yVal * sinTheta;
                pointOnLine = Math.abs(leftSide - p) < 1e-10;
                
                pointCheckStep = `⑦ Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                    `x·cosθ + y·sinθ = ${fmt(xVal)}·${fmt(cosTheta)} + ${fmt(yVal)}·${fmt(sinTheta)} = ` +
                    `${fmt(xVal * cosTheta)} + ${fmt(yVal * sinTheta)} = ${fmt(leftSide)}. ` +
                    `Expected p = ${fmt(p)}. Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            } catch (e) {
                pointCheckStep = '';
            }

            // Find two points on the line for graphing
            // The line: x·cosθ + y·sinθ = p
            // We can solve for points:
            // If sinθ ≠ 0, we can set x = 0 → y = p/sinθ
            // If cosθ ≠ 0, we can set y = 0 → x = p/cosθ
            
            let xIntercept = null, yIntercept = null;
            let linePoints = [];
            let specialPoints = [];
            
            // Calculate intercepts and line points
            if (Math.abs(cosTheta) > 1e-10) {
                xIntercept = p / cosTheta;
                specialPoints.push({x: xIntercept, y: 0, label: `(${fmt(xIntercept)},0)`});
            }
            
            if (Math.abs(sinTheta) > 1e-10) {
                yIntercept = p / sinTheta;
                specialPoints.push({x: 0, y: yIntercept, label: `(0,${fmt(yIntercept)})`});
            }
            
            // Determine x range for graph
            let minX = -10, maxX = 10;
            if (xIntercept !== null) {
                minX = Math.min(minX, xIntercept - 2);
                maxX = Math.max(maxX, xIntercept + 2);
            }
            if (testPoint) {
                minX = Math.min(minX, testPoint.x - 2);
                maxX = Math.max(maxX, testPoint.x + 2);
            }
            
            // Calculate line points
            if (Math.abs(sinTheta) > 1e-10) {
                // We can express y = (p - x·cosθ)/sinθ
                linePoints = [
                    {x: minX, y: (p - minX * cosTheta) / sinTheta},
                    {x: maxX, y: (p - maxX * cosTheta) / sinTheta}
                ];
            } else {
                // sinθ = 0, line is x·cosθ = p → x = p/cosθ (vertical line)
                const xConst = p / cosTheta;
                linePoints = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }

            // Collect points to display
            const points = testPoint ? [testPoint] : [];
            
            // Draw the normal vector from origin to line
            const normalEnd = {x: p * cosTheta, y: p * sinTheta};
            specialPoints.push({x: normalEnd.x, y: normalEnd.y, label: 'foot'});
            
            // Define line segments
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `x·cos${fmt(thetaDeg)}° + y·sin${fmt(thetaDeg)}° = ${fmt(p)}`, 
                    width: 2 
                },
                { 
                    from: {x: 0, y: 0}, 
                    to: normalEnd, 
                    color: '#d44c2f', 
                    dash: [5,3], 
                    label: 'normal', 
                    width: 2 
                }
            ];

            drawGraph(points, specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Normal form: x cosθ + y sinθ = p`,
                `② Given θ = ${fmt(thetaDeg)}°, p = ${fmt(p)}`,
                `③ cosθ = cos(${fmt(thetaDeg)}°) = ${fmt(cosTheta)}`,
                `④ sinθ = sin(${fmt(thetaDeg)}°) = ${fmt(sinTheta)}`,
                `⑤ Equation: x·${fmt(cosTheta)} + y·${fmt(sinTheta)} = ${fmt(p)}`,
                `⑥ Line crosses axes at: ${xIntercept !== null ? `x = ${fmt(xIntercept)}` : 'no x-intercept'} and ${yIntercept !== null ? `y = ${fmt(yIntercept)}` : 'no y-intercept'}`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = `\\( x \\cos ${fmt(thetaDeg)}° + y \\sin ${fmt(thetaDeg)}° = ${fmt(p)} \\)`;
            
            if (testPoint && pointCheckStep) {
                resultText += `<br>Test point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            }
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [thetaInp, pInp, xInp, yInp]);
        }
    }

    compute.addEventListener('click', update);
    [thetaInp, pInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [thetaInp, pInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// NEW: Render function for General (Standard) Form with six conversion modes
function renderGeneralFormCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    
    // Activate the general form sidebar button
    const generalFormBtn = document.getElementById('generalFormBtn');
    generalFormBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> General (Standard) Form: ax + by + c = 0</h2>
        
        <div class="formula-badge" style="background: #e8f0fe;">\\( a x + b y + c = 0 \\)</div>
        
        <!-- Input section for general form coefficients -->
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Coefficients</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="genA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="genB" value="-3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="genC" value="6" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Line:</strong> <span id="genEquationDisplay">2x - 3y + 6 = 0</span>
                </div>
            </div>
        </div>

        <!-- Six conversion modes -->
        <div style="margin: 25px 0 15px;">
            <h3 style="text-align:center; color:#1e4460;">Convert to:</h3>
            <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
                <button class="mode-option selected" id="convSlopeIntercept">📉 Slope-Intercept</button>
                <button class="mode-option" id="convPointSlope">📐 Point-Slope</button>
                <button class="mode-option" id="convTwoPoint">🔗 Two-Point</button>
                <button class="mode-option" id="convIntercept">📊 Intercept</button>
                <button class="mode-option" id="convNormal">📏 Normal</button>
                <button class="mode-option" id="convSlopeAngle">📈 Slope-Angle</button>
            </div>
        </div>

        <!-- Dynamic conversion result area -->
        <div class="point-box" id="conversionResultBox" style="margin:20px 0; background:#f0f8ff;">
            <label>Converted Form:</label>
            <div id="convertedForm" class="formula-badge" style="font-size:1.5rem;">\\( y = \\frac{2}{3}x + 2 \\)</div>
        </div>

        <!-- Step-by-step explanation -->
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>

        <!-- Graph -->
        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <button class="calculate-btn" id="computeGeneralBtn">
            <span>🔄</span> Update & Convert
        </button>
        
        <div class="result-highlight" id="genResult">
            \\( 2x - 3y + 6 = 0 \\)
        </div>
        <div class="footnote">
            Click any conversion button above to see the line in different forms.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('genA');
    const bInp = document.getElementById('genB');
    const cInp = document.getElementById('genC');
    const computeBtn = document.getElementById('computeGeneralBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('genResult');
    const equationDisplay = document.getElementById('genEquationDisplay');
    const convertedForm = document.getElementById('convertedForm');
    
    // Get conversion buttons
    const convSlopeIntercept = document.getElementById('convSlopeIntercept');
    const convPointSlope = document.getElementById('convPointSlope');
    const convTwoPoint = document.getElementById('convTwoPoint');
    const convIntercept = document.getElementById('convIntercept');
    const convNormal = document.getElementById('convNormal');
    const convSlopeAngle = document.getElementById('convSlopeAngle');
    
    // Current conversion mode
    let currentMode = 'slope-intercept';

    // Helper to update active button styling
    function setActiveMode(activeBtn) {
        [convSlopeIntercept, convPointSlope, convTwoPoint, convIntercept, convNormal, convSlopeAngle].forEach(btn => {
            btn.classList.remove('selected');
        });
        activeBtn.classList.add('selected');
    }

    // Function to convert degrees to radians
    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    // Function to convert radians to degrees
    function radToDeg(rad) {
        return rad * 180 / Math.PI;
    }

    // Main update function
    function update() {
        clearErrors();
        try {
            // Read and validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Update equation display
            const aStr = a === 1 ? '' : (a === -1 ? '-' : fmt(a));
            const bStr = b === 1 ? '+' : (b === -1 ? '-' : (b > 0 ? '+' + fmt(b) : (b < 0 ? '-' + Math.abs(fmt(b)) : '')));
            const cStr = c > 0 ? '+' + fmt(c) : (c < 0 ? '-' + Math.abs(fmt(c)) : '');
            equationDisplay.textContent = `${aStr}x ${bStr}y ${cStr} = 0`.replace(/\s+/g, ' ').trim();
            
            // Calculate points for graphing
            let minX = -5, maxX = 5;
            let linePoints = [];
            
            if (Math.abs(b) > 1e-10) {
                // Non-vertical line: y = (-a*x - c)/b
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
                ];
            } else {
                // Vertical line: x = -c/a
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            // Draw the line
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`, 
                    width: 2 
                }
            ];
            
            drawGraph([], [], lineSegments);

            // Perform conversion based on current mode
            let conversionResult = '';
            let steps = [];
            
            // Common calculations
            const slope = Math.abs(b) > 1e-10 ? -a/b : Infinity; // slope = -a/b
            const yIntercept = Math.abs(b) > 1e-10 ? -c/b : undefined;
            const xIntercept = Math.abs(a) > 1e-10 ? -c/a : undefined;
            
            // Calculate angle from slope
            let angleDeg = 90; // default for vertical
            if (slope !== Infinity && !isNaN(slope)) {
                angleDeg = radToDeg(Math.atan(slope));
                if (angleDeg < 0) angleDeg += 180; // keep between 0-180
            }
            
            // Normal form parameters
            const normDenom = Math.sqrt(a*a + b*b);
            const cosTheta = a / normDenom;
            const sinTheta = b / normDenom;
            const p = Math.abs(c) / normDenom;
            const thetaDeg = radToDeg(Math.acos(Math.abs(cosTheta))); // angle of normal
            
            switch(currentMode) {
                case 'slope-intercept':
                    if (Math.abs(b) < 1e-10) {
                        conversionResult = `Vertical line: x = ${fmt(-c/a)} (slope undefined)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Since b = 0, we cannot solve for y`,
                            `③ For vertical lines, slope is undefined`,
                            `④ Equation in slope-intercept form doesn't exist`,
                            `⑤ The line is vertical at x = ${fmt(-c/a)}`
                        ];
                    } else {
                        const m = -a/b;
                        const intercept = -c/b;
                        const sign = intercept >= 0 ? '+' : '-';
                        conversionResult = `\\( y = ${fmt(m)}x ${sign} ${Math.abs(fmt(intercept))} \\)`;
                        steps = [
                            `① Start with general form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Move x term to other side: ${fmt(b)}y = ${fmt(-a)}x ${c > 0 ? '-' + Math.abs(fmt(c)) : '+' + Math.abs(fmt(c))}`,
                            `③ Divide both sides by ${fmt(b)}: y = ${fmt(-a/b)}x + ${fmt(-c/b)}`,
                            `④ Simplify: y = ${fmt(m)}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(fmt(intercept))}`,
                            `⑤ This is slope-intercept form with slope = ${fmt(m)} and y-intercept = ${fmt(intercept)}`
                        ];
                    }
                    break;
                    
                case 'point-slope':
                    if (Math.abs(b) < 1e-10) {
                        conversionResult = `Vertical line: x = ${fmt(-c/a)} (point-slope form not applicable)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② This is a vertical line, point-slope form doesn't apply`,
                            `③ The equation is simply x = ${fmt(-c/a)}`
                        ];
                    } else {
                        const m = -a/b;
                        // Find a point on the line
                        let x0 = 0, y0;
                        if (Math.abs(b) > 1e-10) {
                            y0 = -c/b;
                        } else {
                            x0 = -c/a;
                            y0 = 0;
                        }
                        conversionResult = `\\( y - ${fmt(y0)} = ${fmt(m)}(x - ${fmt(x0)}) \\)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Calculate slope: m = -a/b = ${fmt(-a)}/${fmt(b)} = ${fmt(m)}`,
                            `③ Find a point on the line: set x = 0, then ${fmt(b)}y + ${fmt(c)} = 0 → y = ${fmt(-c/b)}`,
                            `④ Point (0, ${fmt(-c/b)}) lies on the line`,
                            `⑤ Point-slope form: y - y₁ = m(x - x₁)`,
                            `⑥ Substitute: y - ${fmt(-c/b)} = ${fmt(m)}(x - 0)`,
                            `⑦ Final: y - ${fmt(-c/b)} = ${fmt(m)}x`
                        ];
                    }
                    break;
                    
                case 'two-point':
                    if (Math.abs(b) < 1e-10) {
                        conversionResult = `Vertical line: x = ${fmt(-c/a)} (two-point form not applicable)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② This is a vertical line, all points have same x-coordinate`,
                            `③ Two-point form would require two points with same x but different y`,
                            `④ The equation is simply x = ${fmt(-c/a)}`
                        ];
                    } else {
                        // Find two points on the line
                        const x1 = 0, y1 = -c/b;
                        const x2 = 1, y2 = (-a*1 - c)/b;
                        const dy = y2 - y1;
                        const dx = 1;
                        conversionResult = `\\( \\frac{y - ${fmt(y1)}}{${fmt(dy)}} = \\frac{x - 0}{${fmt(dx)}} \\)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Find first point: let x₁ = 0 → ${fmt(b)}y + ${fmt(c)} = 0 → y₁ = ${fmt(-c/b)}`,
                            `   Point A = (0, ${fmt(-c/b)})`,
                            `③ Find second point: let x₂ = 1 → ${fmt(a)}(1) + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `   → ${fmt(b)}y = ${fmt(-a - c)} → y₂ = ${fmt((-a - c)/b)}`,
                            `   Point B = (1, ${fmt((-a - c)/b)})`,
                            `④ Two-point form: (y - y₁)/(y₂ - y₁) = (x - x₁)/(x₂ - x₁)`,
                            `⑤ Substitute: (y - ${fmt(y1)})/(${fmt(dy)}) = (x - 0)/(${fmt(dx)})`,
                            `⑥ Simplify: (y - ${fmt(y1)})/${fmt(dy)} = x/${fmt(dx)}`
                        ];
                    }
                    break;
                    
                case 'intercept':
                    if (Math.abs(a) < 1e-10 || Math.abs(b) < 1e-10) {
                        if (Math.abs(a) < 1e-10 && Math.abs(b) > 1e-10) {
                            conversionResult = `Horizontal line: y = ${fmt(-c/b)} (intercept form not applicable)`;
                            steps = [`Line is horizontal, only y-intercept exists`];
                        } else if (Math.abs(b) < 1e-10 && Math.abs(a) > 1e-10) {
                            conversionResult = `Vertical line: x = ${fmt(-c/a)} (intercept form not applicable)`;
                            steps = [`Line is vertical, only x-intercept exists`];
                        } else {
                            conversionResult = `Invalid for intercept form (a and b both zero)`;
                        }
                    } else {
                        const xInt = -c/a;
                        const yInt = -c/b;
                        conversionResult = `\\( \\frac{x}{${fmt(xInt)}} + \\frac{y}{${fmt(yInt)}} = 1 \\)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Move constant term: ${fmt(a)}x + ${fmt(b)}y = ${fmt(-c)}`,
                            `③ Divide by -c: \\frac{${fmt(a)}x}{${fmt(-c)}} + \\frac{${fmt(b)}y}{${fmt(-c)}} = 1`,
                            `④ Simplify: \\frac{x}{${fmt(-c/a)}} + \\frac{y}{${fmt(-c/b)}} = 1`,
                            `⑤ This is intercept form with x-intercept = ${fmt(xInt)} and y-intercept = ${fmt(yInt)}`
                        ];
                    }
                    break;
                    
                case 'normal':
                    {
                        const norm = Math.sqrt(a*a + b*b);
                        const sign = c > 0 ? -1 : 1; // to make p positive
                        const p = Math.abs(c) / norm;
                        const cosAngle = (sign * a) / norm;
                        const sinAngle = (sign * b) / norm;
                        const angleDeg = radToDeg(Math.acos(cosAngle));
                        
                        conversionResult = `\\( x \\cos ${fmt(angleDeg)}° + y \\sin ${fmt(angleDeg)}° = ${fmt(p)} \\)`;
                        steps = [
                            `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `② Normalize: divide by √(a² + b²) = √(${fmt(a*a)} + ${fmt(b*b)}) = ${fmt(norm)}`,
                            `³) \\frac{${fmt(a)}}{${fmt(norm)}}x + \\frac{${fmt(b)}}{${fmt(norm)}}y ${c > 0 ? '+' : '-'} \\frac{${Math.abs(fmt(c))}}{${fmt(norm)}} = 0`,
                            `④ Move constant to other side: \\frac{${fmt(a)}}{${fmt(norm)}}x + \\frac{${fmt(b)}}{${fmt(norm)}}y = ${fmt(p)}`,
                            `⑤ This is normal form: x cos θ + y sin θ = p`,
                            `⑥ where cos θ = ${fmt(cosAngle)}, sin θ = ${fmt(sinAngle)}, θ = ${fmt(angleDeg)}°, p = ${fmt(p)}`
                        ];
                    }
                    break;
                    
                case 'slope-angle':
                    {
                        if (Math.abs(b) < 1e-10) {
                            conversionResult = `Vertical line: x = ${fmt(-c/a)} (θ = 90°)`;
                            steps = [
                                `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                                `② This is a vertical line, angle with x-axis = 90°`,
                                `③ Slope-angle form: x = constant`
                            ];
                        } else {
                            const m = -a/b;
                            const angle = radToDeg(Math.atan(m));
                            const angleClean = angle < 0 ? angle + 180 : angle;
                            conversionResult = `\\( y = x \\tan ${fmt(angleClean)}° ${yIntercept >= 0 ? '+' : '-'} ${Math.abs(fmt(yIntercept))} \\)`;
                            steps = [
                                `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                                `② Slope m = -a/b = ${fmt(m)}`,
                                `③ Angle θ = arctan(m) = arctan(${fmt(m)}) = ${fmt(angleClean)}°`,
                                `④ Slope-angle form: y = x tan θ + b`,
                                `⑤ Substitute: y = x tan ${fmt(angleClean)}° ${yIntercept >= 0 ? '+' : '-'} ${Math.abs(fmt(yIntercept))}`
                            ];
                        }
                    }
                    break;
            }
            
            // Update display
            convertedForm.innerHTML = conversionResult;
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( ${fmt(a)}x ${b >= 0 ? '+' : '-'} ${Math.abs(fmt(b))}y ${c >= 0 ? '+' : '-'} ${Math.abs(fmt(c))} = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp]);
        }
    }

    // Conversion button click handlers
    convSlopeIntercept.addEventListener('click', () => {
        setActiveMode(convSlopeIntercept);
        currentMode = 'slope-intercept';
        update();
    });
    
    convPointSlope.addEventListener('click', () => {
        setActiveMode(convPointSlope);
        currentMode = 'point-slope';
        update();
    });
    
    convTwoPoint.addEventListener('click', () => {
        setActiveMode(convTwoPoint);
        currentMode = 'two-point';
        update();
    });
    
    convIntercept.addEventListener('click', () => {
        setActiveMode(convIntercept);
        currentMode = 'intercept';
        update();
    });
    
    convNormal.addEventListener('click', () => {
        setActiveMode(convNormal);
        currentMode = 'normal';
        update();
    });
    
    convSlopeAngle.addEventListener('click', () => {
        setActiveMode(convSlopeAngle);
        currentMode = 'slope-angle';
        update();
    });

    // Event listeners
    computeBtn.addEventListener('click', update);
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// [Keep all your existing render functions like renderSlopeInterceptCard, renderPointSlopeCard, etc.]

// ========= END OF UPDATED CODE FOR EQUATIONS TAB =========
// NEW: Render function for Parametric Form
// NEW: Render function for Parametric Form
function renderParametricCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    
    // Activate the parametric form sidebar button
    parametricFormBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏</span> Parametric Form of a Line</h2>
        
        <div class="formula-badge">\\( x = x_1 + r \\cos \\alpha, \\quad y = y_1 + r \\cos \\beta \\)</div>
        <div class="formula-badge">\\( \\cos \\alpha, \\cos \\beta = \\text{direction cosines} \\)</div>
        <div class="formula-badge">\\( r = \\text{parameter (distance along line)} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Point \\((x_1, y_1)\\)</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="paramX1" value="2" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="paramY1" value="3" step="any"></div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Direction Cosines</label>
                <div class="coord-input"><span>cos α =</span><input type="number" id="paramCosA" value="0.6" step="any" min="-1" max="1"></div>
                <div class="coord-input"><span>cos β =</span><input type="number" id="paramCosB" value="0.8" step="any" min="-1" max="1"></div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> cos²α + cos²β = 1
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Parameter r (optional)</label>
                <div class="coord-input"><span>r =</span><input type="number" id="paramR" value="5" step="any"></div>
                <div style="font-size:0.9rem;">Find point at distance r from (x₁,y₁)</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeParamBtn">
            <span>📏</span> Analyze line
        </button>
        
        <div class="result-highlight" id="paramResult">
            \\( x = 2 + r·0.6, \\quad y = 3 + r·0.8 \\)
        </div>
        <div class="footnote">
            Graph shows the line through (x₁,y₁) with direction cosines. The point at distance r is shown.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const x1Inp = document.getElementById('paramX1');
    const y1Inp = document.getElementById('paramY1');
    const cosAInp = document.getElementById('paramCosA');
    const cosBInp = document.getElementById('paramCosB');
    const rInp = document.getElementById('paramR');
    const compute = document.getElementById('computeParamBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('paramResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const cosA = validateNumber(cosAInp.value, 'cos α', -1, 1);
            const cosB = validateNumber(cosBInp.value, 'cos β', -1, 1);
            
            // Check direction cosines property
            const sumSquares = cosA*cosA + cosB*cosB;
            if (Math.abs(sumSquares - 1) > 1e-6) {
                throw new Error(`Direction cosines must satisfy cos²α + cos²β = 1. Current sum = ${fmt(sumSquares)}`);
            }
            
            // Optional r parameter
            let r = null;
            let pointAtR = null;
            let pointCheckStep = '';
            
            try {
                if (rInp.value.trim() !== '') {
                    r = validateNumber(rInp.value, 'r');
                    pointAtR = {
                        x: x1 + r * cosA,
                        y: y1 + r * cosB
                    };
                    pointCheckStep = `⑧ Point at distance r = ${fmt(r)} from (x₁,y₁):` +
                        ` x = ${fmt(x1)} + ${fmt(r)}·${fmt(cosA)} = ${fmt(pointAtR.x)}` +
                        `, y = ${fmt(y1)} + ${fmt(r)}·${fmt(cosB)} = ${fmt(pointAtR.y)}` +
                        ` → Point P = (${fmt(pointAtR.x)}, ${fmt(pointAtR.y)})`;
                }
            } catch (e) {
                // r is optional, ignore if invalid
                pointCheckStep = '';
            }

            // For graph: generate points for the line
            let minR = -10, maxR = 10;
            if (r !== null) {
                minR = Math.min(minR, -Math.abs(r) - 2);
                maxR = Math.max(maxR, Math.abs(r) + 2);
            }
            
            const linePoints = [
                {x: x1 + minR * cosA, y: y1 + minR * cosB},
                {x: x1 + maxR * cosA, y: y1 + maxR * cosB}
            ];

            // Collect points to display
            const points = pointAtR ? [pointAtR] : [];
            const specialPoints = [{x: x1, y: y1, label: '(x₁,y₁)'}];
            
            // Draw direction vector from origin (if within reasonable bounds)
            const dirVectorEnd = {x: cosA * 3, y: cosB * 3};
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `parametric line`, 
                    width: 2 
                },
                { 
                    from: {x: x1, y: y1}, 
                    to: {x: x1 + cosA * 2, y: y1 + cosB * 2}, 
                    color: '#d44c2f', 
                    dash: [], 
                    label: 'direction', 
                    width: 2 
                }
            ];

            drawGraph(points, specialPoints, lineSegments);

            // Create steps with EXPLANATION of r range selection
            const steps = [
                `① Parametric form: x = x₁ + r·cosα, y = y₁ + r·cosβ`,
                `② Given point (x₁, y₁) = (${fmt(x1)}, ${fmt(y1)})`,
                `③ Direction cosines: cosα = ${fmt(cosA)}, cosβ = ${fmt(cosB)}`,
                `④ Verify: cos²α + cos²β = ${fmt(cosA*cosA)} + ${fmt(cosB*cosB)} = ${fmt(sumSquares)} = 1 ✓`,
                `⑤ Parametric equations:`,
                `   x = ${fmt(x1)} + r·${fmt(cosA)}`,
                `   y = ${fmt(y1)} + r·${fmt(cosB)}`,
                `⑥ 📌 CHOOSING r RANGE FOR GRAPHING:`,
                `   • Default r range is from -10 to 10 to show the line clearly`,
                `   • This gives us points on both sides of (x₁,y₁)`,
                `   • When r is negative: we go in opposite direction from (x₁,y₁)`,
                `   • When r is positive: we go in the direction of (cosα, cosβ)`,
                `   • The range [-10, 10] ensures the line extends 10 units in each direction`,
                `⑦ CALCULATING ENDPOINTS FOR r = ${fmt(minR)} and r = ${fmt(maxR)}:`,
                `   • When r = ${fmt(minR)} (negative/left side):`,
                `     x = ${fmt(x1)} + (${fmt(minR)})·${fmt(cosA)} = ${fmt(linePoints[0].x)}`,
                `     y = ${fmt(y1)} + (${fmt(minR)})·${fmt(cosB)} = ${fmt(linePoints[0].y)}`,
                `     → Point A = (${fmt(linePoints[0].x)}, ${fmt(linePoints[0].y)})`,
                `   • When r = ${fmt(maxR)} (positive/right side):`,
                `     x = ${fmt(x1)} + ${fmt(maxR)}·${fmt(cosA)} = ${fmt(linePoints[1].x)}`,
                `     y = ${fmt(y1)} + ${fmt(maxR)}·${fmt(cosB)} = ${fmt(linePoints[1].y)}`,
                `     → Point B = (${fmt(linePoints[1].x)}, ${fmt(linePoints[1].y)})`,
                `   • The line segment from A to B passes through (x₁,y₁) at r = 0`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = `\\( x = ${fmt(x1)} + r·${fmt(cosA)}, \\quad y = ${fmt(y1)} + r·${fmt(cosB)} \\)`;
            
            if (pointAtR) {
                resultText += `<br>At r = ${fmt(r)}: P = (${fmt(pointAtR.x)}, ${fmt(pointAtR.y)})`;
            }
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, cosAInp, cosBInp, rInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, cosAInp, cosBInp, rInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [x1Inp, y1Inp, cosAInp, cosBInp, rInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Horizontal Line (y = k)
function renderHorizontalLineCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    
    // Activate the horizontal line sidebar button
    const horizontalLineBtn = document.getElementById('horizontalLineBtn');
    horizontalLineBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>➡️</span> Horizontal Line</h2>
        
        <div class="formula-badge">\\( y = k \\)</div>
        <div class="formula-badge">\\( \\text{where } k \\text{ is the y-coordinate (constant)} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Constant value</label>
                <div class="coord-input">
                    <span>k =</span>
                    <input type="number" id="horizK" value="3" step="any">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> Slope = 0 (horizontal line)
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input">
                    <span>x =</span>
                    <input type="number" id="horizX" value="2" step="any">
                </div>
                <div class="coord-input">
                    <span>y =</span>
                    <input type="number" id="horizY" value="3" step="any">
                </div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeHorizBtn">
            <span>➡️</span> Analyze horizontal line
        </button>
        
        <div class="result-highlight" id="horizResult">
            \\( y = 3 \\)
        </div>
        <div class="footnote">
            Horizontal lines have slope 0 and are parallel to x-axis.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const kInp = document.getElementById('horizK');
    const xInp = document.getElementById('horizX');
    const yInp = document.getElementById('horizY');
    const compute = document.getElementById('computeHorizBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('horizResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const k = validateNumber(kInp.value, 'k');
            
            // Optional test point
            let testPoint = null;
            let pointOnLine = false;
            let pointCheckStep = '';
            
            try {
                const xVal = validateNumber(xInp.value, 'test x');
                const yVal = validateNumber(yInp.value, 'test y');
                testPoint = {x: xVal, y: yVal};
                
                // For horizontal line, point is on line if y = k
                pointOnLine = Math.abs(yVal - k) < 1e-10;
                
                pointCheckStep = `⑤ Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                    `For horizontal line y = ${fmt(k)}, ` +
                    `given y = ${fmt(yVal)}. ` +
                    `Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            } catch (e) {
                pointCheckStep = '';
            }

            // For graph: generate points for the horizontal line
            let minX = -5, maxX = 5;
            if (testPoint) {
                minX = Math.min(minX, testPoint.x - 2);
                maxX = Math.max(maxX, testPoint.x + 2);
            }
            
            const linePoints = [
                {x: minX, y: k},
                {x: maxX, y: k}
            ];

            // Collect points to display
            const points = testPoint ? [testPoint] : [];
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `y = ${fmt(k)}`, 
                    width: 2 
                }
            ];

            drawGraph(points, [], lineSegments);

            // Create steps
            const steps = [
                `① Horizontal line equation: y = k`,
                `② Given constant k = ${fmt(k)}`,
                `③ Equation: y = ${fmt(k)}`,
                `④ This line is horizontal (parallel to x-axis) with slope = 0`,
                `   • All points on this line have y-coordinate = ${fmt(k)}`,
                `   • The line never goes up or down as x changes`,
                `⑤ For graphing, we need two points on the line:`,
                `   • Pick x₁ = ${fmt(minX)} → point (${fmt(minX)}, ${fmt(k)})`,
                `   • Pick x₂ = ${fmt(maxX)} → point (${fmt(maxX)}, ${fmt(k)})`,
                `   • These points are at the left and right edges of our graph`,
                `   • The line is drawn by connecting these two points`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            } else {
                steps.push(`⑥ No test point provided. Enter x and y values to check if a point lies on this line.`);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = `\\( y = ${fmt(k)} \\)`;
            
            if (testPoint && pointCheckStep) {
                resultText += `<br>Test point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            }
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [kInp, xInp, yInp]);
        }
    }

    compute.addEventListener('click', update);
    [kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// NEW: Render function for Vertical Line (x = k)
function renderVerticalLineCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    
    // Activate the vertical line sidebar button
    const verticalLineBtn = document.getElementById('verticalLineBtn');
    verticalLineBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⬆️</span> Vertical Line</h2>
        
        <div class="formula-badge">\\( x = k \\)</div>
        <div class="formula-badge">\\( \\text{where } k \\text{ is the x-coordinate (constant)} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Constant value</label>
                <div class="coord-input">
                    <span>k =</span>
                    <input type="number" id="vertK" value="3" step="any">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> Slope is undefined (vertical line)
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point to test (optional)</label>
                <div class="coord-input">
                    <span>x =</span>
                    <input type="number" id="vertX" value="3" step="any">
                </div>
                <div class="coord-input">
                    <span>y =</span>
                    <input type="number" id="vertY" value="5" step="any">
                </div>
                <div style="font-size:0.9rem;">Check if point lies on line</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeVertBtn">
            <span>⬆️</span> Analyze vertical line
        </button>
        
        <div class="result-highlight" id="vertResult">
            \\( x = 3 \\)
        </div>
        <div class="footnote">
            Vertical lines have undefined slope and are parallel to y-axis.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const kInp = document.getElementById('vertK');
    const xInp = document.getElementById('vertX');
    const yInp = document.getElementById('vertY');
    const compute = document.getElementById('computeVertBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('vertResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const k = validateNumber(kInp.value, 'k');
            
            // Optional test point
            let testPoint = null;
            let pointOnLine = false;
            let pointCheckStep = '';
            
            try {
                const xVal = validateNumber(xInp.value, 'test x');
                const yVal = validateNumber(yInp.value, 'test y');
                testPoint = {x: xVal, y: yVal};
                
                // For vertical line, point is on line if x = k
                pointOnLine = Math.abs(xVal - k) < 1e-10;
                
                pointCheckStep = `⑤ Check test point (${fmt(xVal)}, ${fmt(yVal)}): ` +
                    `For vertical line x = ${fmt(k)}, ` +
                    `given x = ${fmt(xVal)}. ` +
                    `Point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            } catch (e) {
                pointCheckStep = '';
            }

            // For graph: generate points for the vertical line
            let minY = -5, maxY = 5;
            if (testPoint) {
                minY = Math.min(minY, testPoint.y - 2);
                maxY = Math.max(maxY, testPoint.y + 2);
            }
            
            const linePoints = [
                {x: k, y: minY},
                {x: k, y: maxY}
            ];

            // Collect points to display
            const points = testPoint ? [testPoint] : [];
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `x = ${fmt(k)}`, 
                    width: 2 
                }
            ];

            drawGraph(points, [], lineSegments);

            // Create steps
            const steps = [
                `① Vertical line equation: x = k`,
                `② Given constant k = ${fmt(k)}`,
                `③ Equation: x = ${fmt(k)}`,
                `④ This line is vertical (parallel to y-axis) with undefined slope`,
                `   • All points on this line have x-coordinate = ${fmt(k)}`,
                `   • The line does not move left or right as y changes`,
                `⑤ For graphing, we need two points on the line:`,
                `   • Pick y₁ = ${fmt(minY)} → point (${fmt(k)}, ${fmt(minY)})`,
                `   • Pick y₂ = ${fmt(maxY)} → point (${fmt(k)}, ${fmt(maxY)})`,
                `   • These points are at the bottom and top of our graph`,
                `   • The line is drawn by connecting these two points`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            } else {
                steps.push(`⑥ No test point provided. Enter x and y values to check if a point lies on this line.`);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = `\\( x = ${fmt(k)} \\)`;
            
            if (testPoint && pointCheckStep) {
                resultText += `<br>Test point is ${pointOnLine ? '✅ on' : '❌ not on'} the line.`;
            }
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [kInp, xInp, yInp]);
        }
    }

    compute.addEventListener('click', update);
    [kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Slope from General Form
function renderSlopeFromGeneralCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    
    // Activate the new button
    const slopeFromGeneralBtn = document.getElementById('slopeFromGeneralBtn');
    slopeFromGeneralBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📈</span> Slope from General Form</h2>
        
        <div class="formula-badge">\\( ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( m = -\\frac{a}{b} \\quad (\\text{if } b \\neq 0) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Coefficients</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="slopeGenA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="slopeGenB" value="-3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="slopeGenC" value="6" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> If b = 0, line is vertical (slope undefined)
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
        
        <button class="calculate-btn" id="computeSlopeGenBtn">
            <span>📈</span> Calculate Slope
        </button>
        
        <div class="result-highlight" id="slopeGenResult">
            \\( m = 0.6667 \\)
        </div>
        <div class="footnote">
            Slope = rise/run. For vertical lines (b=0), slope is undefined.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('slopeGenA');
    const bInp = document.getElementById('slopeGenB');
    const cInp = document.getElementById('slopeGenC');
    const compute = document.getElementById('computeSlopeGenBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('slopeGenResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate slope
            let slope, slopeText;
            let steps = [];
            
            if (Math.abs(b) < 1e-10) {
                slope = undefined;
                slopeText = "undefined (vertical line)";
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② Since b = 0, the equation becomes: ${fmt(a)}x + ${fmt(c)} = 0`,
                    `③ This is a vertical line at x = ${fmt(-c/a)}`,
                    `④ For vertical lines, slope is undefined`,
                    `⑤ The line does not have a slope value`
                ];
            } else {
                slope = -a/b;
                slopeText = fmt(slope);
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② Slope formula: m = -a/b`,
                    `③ Substitute values: m = -(${fmt(a)})/${fmt(b)}`,
                    `④ Calculate: m = ${fmt(-a)}/${fmt(b)} = ${slopeText}`,
                    `⑤ The slope of the line is ${slopeText}`,
                    `⑥ This means for every 1 unit increase in x, y changes by ${slopeText} units`
                ];
            }

            // Draw the line for visualization
            let minX = -5, maxX = 5;
            let linePoints = [];
            
            if (Math.abs(b) > 1e-10) {
                // Non-vertical line
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`, 
                    width: 2 
                }
            ];
            
            drawGraph([], [], lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            if (slope === undefined) {
                resultDiv.innerHTML = `\\( \\text{Slope is undefined (vertical line)} \\)`;
            } else {
                resultDiv.innerHTML = `\\( m = ${slopeText} \\)`;
            }
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// NEW: Render function for x-intercept from General Form
function renderXInterceptCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    
    // Activate the new button
    const xInterceptBtn = document.getElementById('xInterceptBtn');
    xInterceptBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>✖️</span> x-intercept from General Form</h2>
        
        <div class="formula-badge">\\( ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( x\\text{-intercept} = -\\frac{c}{a} \\quad (\\text{if } a \\neq 0) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Coefficients</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="xIntA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="xIntB" value="3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="xIntC" value="-6" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> x-intercept is where line crosses x-axis (y=0)
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
        
        <button class="calculate-btn" id="computeXIntBtn">
            <span>✖️</span> Find x-intercept
        </button>
        
        <div class="result-highlight" id="xIntResult">
            \\( x = 3 \\)
        </div>
        <div class="footnote">
            x-intercept is the point (x, 0) where the line crosses the x-axis.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('xIntA');
    const bInp = document.getElementById('xIntB');
    const cInp = document.getElementById('xIntC');
    const compute = document.getElementById('computeXIntBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('xIntResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate x-intercept
            let xIntercept, xInterceptText;
            let steps = [];
            
            if (Math.abs(a) < 1e-10) {
                xIntercept = undefined;
                xInterceptText = "no x-intercept (line is horizontal)";
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② Since a = 0, the equation becomes: ${fmt(b)}y + ${fmt(c)} = 0`,
                    `③ This is a horizontal line at y = ${fmt(-c/b)}`,
                    `④ Horizontal lines (except y=0) never cross the x-axis`,
                    `⑤ Therefore, there is no x-intercept`
                ];
            } else {
                xIntercept = -c/a;
                xInterceptText = fmt(xIntercept);
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② x-intercept occurs when y = 0`,
                    `③ Substitute y = 0: ${fmt(a)}x + ${fmt(b)}·0 + ${fmt(c)} = 0`,
                    `④ Simplify: ${fmt(a)}x + ${fmt(c)} = 0`,
                    `⑤ Solve for x: ${fmt(a)}x = ${fmt(-c)}`,
                    `⑥ x = ${fmt(-c)}/${fmt(a)} = ${xInterceptText}`,
                    `⑦ The x-intercept is (${xInterceptText}, 0)`
                ];
            }

            // Draw the line for visualization
            let minX = -5, maxX = 5;
            let linePoints = [];
            
            if (Math.abs(b) > 1e-10) {
                // Non-vertical line
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            // Highlight x-intercept point if it exists
            let specialPoints = [];
            if (xIntercept !== undefined && isFinite(xIntercept)) {
                specialPoints.push({x: xIntercept, y: 0, label: `(${fmt(xIntercept)},0)`});
            }
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`, 
                    width: 2 
                }
            ];
            
            drawGraph([], specialPoints, lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            if (xIntercept === undefined) {
                resultDiv.innerHTML = `\\( \\text{No x-intercept (line is horizontal)} \\)`;
            } else {
                resultDiv.innerHTML = `\\( x = ${xInterceptText} \\)<br>Point: (${xInterceptText}, 0)`;
            }
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// NEW: Render function for y-intercept from General Form
function renderYInterceptCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    xInterceptBtn.classList.remove('active-btn');
    
    // Activate the new button
    const yInterceptBtn = document.getElementById('yInterceptBtn');
    yInterceptBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>➕</span> y-intercept from General Form</h2>
        
        <div class="formula-badge">\\( ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( y\\text{-intercept} = -\\frac{c}{b} \\quad (\\text{if } b \\neq 0) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Coefficients</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="yIntA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="yIntB" value="3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="yIntC" value="-6" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> y-intercept is where line crosses y-axis (x=0)
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
        
        <button class="calculate-btn" id="computeYIntBtn">
            <span>➕</span> Find y-intercept
        </button>
        
        <div class="result-highlight" id="yIntResult">
            \\( y = 2 \\)
        </div>
        <div class="footnote">
            y-intercept is the point (0, y) where the line crosses the y-axis.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('yIntA');
    const bInp = document.getElementById('yIntB');
    const cInp = document.getElementById('yIntC');
    const compute = document.getElementById('computeYIntBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('yIntResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            
            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate y-intercept
            let yIntercept, yInterceptText;
            let steps = [];
            
            if (Math.abs(b) < 1e-10) {
                yIntercept = undefined;
                yInterceptText = "no y-intercept (line is vertical)";
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② Since b = 0, the equation becomes: ${fmt(a)}x + ${fmt(c)} = 0`,
                    `③ This is a vertical line at x = ${fmt(-c/a)}`,
                    `④ Vertical lines (except x=0) never cross the y-axis`,
                    `⑤ Therefore, there is no y-intercept`
                ];
            } else {
                yIntercept = -c/b;
                yInterceptText = fmt(yIntercept);
                steps = [
                    `① General form: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `② y-intercept occurs when x = 0`,
                    `③ Substitute x = 0: ${fmt(a)}·0 + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `④ Simplify: ${fmt(b)}y + ${fmt(c)} = 0`,
                    `⑤ Solve for y: ${fmt(b)}y = ${fmt(-c)}`,
                    `⑥ y = ${fmt(-c)}/${fmt(b)} = ${yInterceptText}`,
                    `⑦ The y-intercept is (0, ${yInterceptText})`
                ];
            }

            // Draw the line for visualization
            let minX = -5, maxX = 5;
            let linePoints = [];
            
            if (Math.abs(b) > 1e-10) {
                // Non-vertical line
                linePoints = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePoints = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            // Highlight y-intercept point if it exists
            let specialPoints = [];
            if (yIntercept !== undefined && isFinite(yIntercept)) {
                specialPoints.push({x: 0, y: yIntercept, label: `(0,${fmt(yIntercept)})`});
            }
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`, 
                    width: 2 
                }
            ];
            
            drawGraph([], specialPoints, lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            if (yIntercept === undefined) {
                resultDiv.innerHTML = `\\( \\text{No y-intercept (line is vertical)} \\)`;
            } else {
                resultDiv.innerHTML = `\\( y = ${yInterceptText} \\)<br>Point: (0, ${yInterceptText})`;
            }
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Symmetric Form
function renderSymmetricFormCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    xInterceptBtn.classList.remove('active-btn');
    yInterceptBtn.classList.remove('active-btn');
    
    // Activate the symmetric form sidebar button
    const symmetricFormBtn = document.getElementById('symmetricFormBtn');
    symmetricFormBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄</span> Symmetric Form</h2>
        
        <div class="formula-badge">\\( \\frac{x - x_1}{\\cos \\theta} = \\frac{y - y_1}{\\sin \\theta} = r \\)</div>
        <div class="formula-badge">\\( \\text{where } (x_1, y_1) \\text{ is a point on line} \\)</div>
        <div class="formula-badge">\\( \\theta = \\text{angle of line with positive x-axis} \\)</div>
        <div class="formula-badge">\\( r = \\text{distance from } (x_1, y_1) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Point \\((x_1, y_1)\\)</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="symX1" value="2" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="symY1" value="3" step="any"></div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Direction Angle</label>
                <div class="coord-input"><span>θ (degrees) =</span><input type="number" id="symTheta" value="45" step="any"></div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> Angle with positive x-axis
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Parameter r (optional)</label>
                <div class="coord-input"><span>r =</span><input type="number" id="symR" value="5" step="any"></div>
                <div style="font-size:0.9rem;">Find point at distance r from (x₁,y₁)</div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSymmetricBtn">
            <span>🔄</span> Analyze line
        </button>
        
        <div class="result-highlight" id="symResult">
            \\( \\frac{x - 2}{0.7071} = \\frac{y - 3}{0.7071} = r \\)
        </div>
        <div class="footnote">
            Symmetric form expresses line in terms of direction cosines. For θ=45°, cosθ = sinθ = 0.7071.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const x1Inp = document.getElementById('symX1');
    const y1Inp = document.getElementById('symY1');
    const thetaInp = document.getElementById('symTheta');
    const rInp = document.getElementById('symR');
    const compute = document.getElementById('computeSymmetricBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('symResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const thetaDeg = validateNumber(thetaInp.value, 'θ');
            
            // Convert degrees to radians
            const thetaRad = thetaDeg * Math.PI / 180;
            const cosTheta = Math.cos(thetaRad);
            const sinTheta = Math.sin(thetaRad);
            
            // Check that cos and sin aren't both zero (shouldn't happen)
            if (Math.abs(cosTheta) < 1e-10 && Math.abs(sinTheta) < 1e-10) {
                throw new Error('Invalid angle: cosθ and sinθ cannot both be zero');
            }
            
            // Optional r parameter
            let r = null;
            let pointAtR = null;
            let pointCheckStep = '';
            
            try {
                if (rInp.value.trim() !== '') {
                    r = validateNumber(rInp.value, 'r');
                    pointAtR = {
                        x: x1 + r * cosTheta,
                        y: y1 + r * sinTheta
                    };
                    pointCheckStep = `⑦ Check point at distance r = ${fmt(r)} from (x₁,y₁):` +
                        ` x = ${fmt(x1)} + ${fmt(r)}·${fmt(cosTheta)} = ${fmt(pointAtR.x)}` +
                        `, y = ${fmt(y1)} + ${fmt(r)}·${fmt(sinTheta)} = ${fmt(pointAtR.y)}` +
                        ` → Point P = (${fmt(pointAtR.x)}, ${fmt(pointAtR.y)})`;
                }
            } catch (e) {
                // r is optional, ignore if invalid
                pointCheckStep = '';
            }

            // For graph: generate points for the line
            let minR = -8, maxR = 8;
            if (r !== null) {
                minR = Math.min(minR, -Math.abs(r) - 2);
                maxR = Math.max(maxR, Math.abs(r) + 2);
            }
            
            const linePoints = [
                {x: x1 + minR * cosTheta, y: y1 + minR * sinTheta},
                {x: x1 + maxR * cosTheta, y: y1 + maxR * sinTheta}
            ];

            // Collect points to display
            const points = pointAtR ? [pointAtR] : [];
            const specialPoints = [{x: x1, y: y1, label: '(x₁,y₁)'}];
            
            // Draw direction vector
            const dirVectorEnd = {x: x1 + cosTheta * 2, y: y1 + sinTheta * 2};
            
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: `line at θ = ${fmt(thetaDeg)}°`, 
                    width: 2 
                },
                { 
                    from: {x: x1, y: y1}, 
                    to: dirVectorEnd, 
                    color: '#d44c2f', 
                    dash: [], 
                    label: 'direction', 
                    width: 2 
                }
            ];

            drawGraph(points, specialPoints, lineSegments);

            // Create steps with EXPLANATION
            const steps = [
                `① Symmetric form: (x - x₁)/cosθ = (y - y₁)/sinθ = r`,
                `② Given point (x₁, y₁) = (${fmt(x1)}, ${fmt(y1)})`,
                `③ Given angle θ = ${fmt(thetaDeg)}°`,
                `④ Calculate direction cosines:`,
                `   cosθ = cos(${fmt(thetaDeg)}°) = ${fmt(cosTheta)}`,
                `   sinθ = sin(${fmt(thetaDeg)}°) = ${fmt(sinTheta)}`,
                `⑤ Symmetric equations:`,
                `   (x - ${fmt(x1)})/${fmt(cosTheta)} = (y - ${fmt(y1)})/${fmt(sinTheta)} = r`,
                `   This means:`,
                `   • x = ${fmt(x1)} + r·${fmt(cosTheta)}`,
                `   • y = ${fmt(y1)} + r·${fmt(sinTheta)}`,
                `⑥ For graphing, we use r from ${fmt(minR)} to ${fmt(maxR)}:`,
                `   • r = ${fmt(minR)} → point (${fmt(linePoints[0].x)}, ${fmt(linePoints[0].y)})`,
                `   • r = 0 → point (${fmt(x1)}, ${fmt(y1)})`,
                `   • r = ${fmt(maxR)} → point (${fmt(linePoints[1].x)}, ${fmt(linePoints[1].y)})`
            ];
            
            if (pointCheckStep) {
                steps.push(pointCheckStep);
            } else {
                steps.push(`⑦ No r value provided. Enter a value for r to find a specific point on the line.`);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = `\\( \\frac{x - ${fmt(x1)}}{${fmt(cosTheta)}} = \\frac{y - ${fmt(y1)}}{${fmt(sinTheta)}} = r \\)`;
            
            if (pointAtR) {
                resultText += `<br>At r = ${fmt(r)}: P = (${fmt(pointAtR.x)}, ${fmt(pointAtR.y)})`;
            }
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, thetaInp, rInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, thetaInp, rInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [x1Inp, y1Inp, thetaInp, rInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Concurrency of Three Lines
function renderConcurrencyCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    xInterceptBtn.classList.remove('active-btn');
    yInterceptBtn.classList.remove('active-btn');
    symmetricFormBtn.classList.remove('active-btn');
    
    // Activate the concurrency button
    const concurrencyBtn = document.getElementById('concurrencyBtn');
    concurrencyBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⚡</span> Concurrency of Three Lines</h2>
        
        <div class="formula-badge">\\( \\begin{vmatrix} a_1 & b_1 & c_1 \\\\ a_2 & b_2 & c_2 \\\\ a_3 & b_3 & c_3 \\end{vmatrix} = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Three lines are concurrent if determinant = 0} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="conA1" value="1" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="conB1" value="1" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="conC1" value="-2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="conA2" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="conB2" value="-1" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="conC2" value="-1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 3 -->
            <div class="point-box" style="width:100%;">
                <label>Line 3: a₃x + b₃y + c₃ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₃ =</span> <input type="number" id="conA3" value="3" step="any" style="width:80px;"></div>
                    <div><span>b₃ =</span> <input type="number" id="conB3" value="2" step="any" style="width:80px;"></div>
                    <div><span>c₃ =</span> <input type="number" id="conC3" value="-4" step="any" style="width:80px;"></div>
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
        
        <button class="calculate-btn" id="computeConcurrencyBtn">
            <span>⚡</span> Check Concurrency
        </button>
        
        <div class="result-highlight" id="concurrencyResult">
            \\( \\text{Determinant} = 0 \\text{ → Lines are concurrent} \\)
        </div>
        <div class="footnote">
            Three lines are concurrent if they intersect at a single point. The determinant condition must be satisfied.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('conA1'), b1 = document.getElementById('conB1'), c1 = document.getElementById('conC1');
    const a2 = document.getElementById('conA2'), b2 = document.getElementById('conB2'), c2 = document.getElementById('conC2');
    const a3 = document.getElementById('conA3'), b3 = document.getElementById('conB3'), c3 = document.getElementById('conC3');
    const compute = document.getElementById('computeConcurrencyBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('concurrencyResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a1v = validateNumber(a1.value, 'a₁');
            const b1v = validateNumber(b1.value, 'b₁');
            const c1v = validateNumber(c1.value, 'c₁');
            const a2v = validateNumber(a2.value, 'a₂');
            const b2v = validateNumber(b2.value, 'b₂');
            const c2v = validateNumber(c2.value, 'c₂');
            const a3v = validateNumber(a3.value, 'a₃');
            const b3v = validateNumber(b3.value, 'b₃');
            const c3v = validateNumber(c3.value, 'c₃');

            // Calculate determinant using 3x3 matrix formula
            // | a1 b1 c1 |
            // | a2 b2 c2 |
            // | a3 b3 c3 |
            const det = a1v * (b2v * c3v - b3v * c2v) - 
                        b1v * (a2v * c3v - a3v * c2v) + 
                        c1v * (a2v * b3v - a3v * b2v);
            
            const isConcurrent = Math.abs(det) < 1e-10;

            // Find intersection point of first two lines (if not parallel)
            let intersectionPoint = null;
            let intersectionExists = false;
            
            // Check if first two lines are not parallel
            const denom = a1v * b2v - a2v * b1v;
            if (Math.abs(denom) > 1e-10) {
                const intersectX = (b1v * c2v - b2v * c1v) / denom;
                const intersectY = (c1v * a2v - c2v * a1v) / denom;
                intersectionPoint = {x: intersectX, y: intersectY};
                intersectionExists = true;
            }

            // Draw all three lines
            const minX = -5, maxX = 5;
            const lineSegments = [];
            
            // Function to get line points
            function getLinePoints(a, b, c) {
                if (Math.abs(b) > 1e-10) {
                    // Non-vertical line
                    return [
                        {x: minX, y: (-a*minX - c)/b},
                        {x: maxX, y: (-a*maxX - c)/b}
                    ];
                } else {
                    // Vertical line
                    const xConst = -c/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            // Add line 1
            const pts1 = getLinePoints(a1v, b1v, c1v);
            lineSegments.push({ from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [], label: 'L1', width: 2 });
            
            // Add line 2
            const pts2 = getLinePoints(a2v, b2v, c2v);
            lineSegments.push({ from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: [], label: 'L2', width: 2 });
            
            // Add line 3
            const pts3 = getLinePoints(a3v, b3v, c3v);
            lineSegments.push({ from: pts3[0], to: pts3[1], color: '#ca8a04', dash: [], label: 'L3', width: 2 });

            // Add intersection point if it exists
            const specialPoints = [];
            if (intersectionExists && intersectionPoint) {
                specialPoints.push({x: intersectionPoint.x, y: intersectionPoint.y, label: 'Intersection'});
            }

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                `③ Line 3: ${fmt(a3v)}x + ${fmt(b3v)}y + ${fmt(c3v)} = 0`,
                `④ Calculate determinant using formula:`,
                `   det = a₁(b₂c₃ - b₃c₂) - b₁(a₂c₃ - a₃c₂) + c₁(a₂b₃ - a₃b₂)`,
                `   = ${fmt(a1v)}·(${fmt(b2v)}·${fmt(c3v)} - ${fmt(b3v)}·${fmt(c2v)})`,
                `     - ${fmt(b1v)}·(${fmt(a2v)}·${fmt(c3v)} - ${fmt(a3v)}·${fmt(c2v)})`,
                `     + ${fmt(c1v)}·(${fmt(a2v)}·${fmt(b3v)} - ${fmt(a3v)}·${fmt(b2v)})`,
                `   = ${fmt(a1v)}·(${fmt(b2v*c3v)} - ${fmt(b3v*c2v)})`,
                `     - ${fmt(b1v)}·(${fmt(a2v*c3v)} - ${fmt(a3v*c2v)})`,
                `     + ${fmt(c1v)}·(${fmt(a2v*b3v)} - ${fmt(a3v*b2v)})`,
                `   = ${fmt(a1v)}·(${fmt(b2v*c3v - b3v*c2v)})`,
                `     - ${fmt(b1v)}·(${fmt(a2v*c3v - a3v*c2v)})`,
                `     + ${fmt(c1v)}·(${fmt(a2v*b3v - a3v*b2v)})`,
                `   = ${fmt(a1v * (b2v*c3v - b3v*c2v))}`,
                `     - ${fmt(b1v * (a2v*c3v - a3v*c2v))}`,
                `     + ${fmt(c1v * (a2v*b3v - a3v*b2v))}`,
                `   = ${fmt(det)}`,
                `⑤ ${Math.abs(det) < 1e-10 ? 'det ≈ 0' : 'det ≠ 0'}`,
                `⑥ Therefore, the three lines are ${isConcurrent ? 'CONCURRENT' : 'NOT CONCURRENT'}`,
                `   ${isConcurrent ? '✓ They intersect at a single point' : '✗ They do not all meet at one point'}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            const detFormatted = fmt(det);
            resultDiv.innerHTML = `\\( \\text{Determinant} = ${detFormatted} \\)<br>` +
                `Lines are ${isConcurrent ? '✅ CONCURRENT' : '❌ NOT CONCURRENT'}`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2, a3, b3, c3]);
        }
    }

    compute.addEventListener('click', update);
    [a1, b1, c1, a2, b2, c2, a3, b3, c3].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a1, b1, c1, a2, b2, c2, a3, b3, c3].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Family of Lines through Intersection
function renderFamilyLinesCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    xInterceptBtn.classList.remove('active-btn');
    yInterceptBtn.classList.remove('active-btn');
    symmetricFormBtn.classList.remove('active-btn');
    concurrencyBtn.classList.remove('active-btn');
    
    // Activate the family lines button
    familyLinesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>👪</span> Family of Lines through Intersection</h2>
        
        <div class="formula-badge">\\( L_1 + \\lambda L_2 = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Family of lines passing through intersection of } L_1 \\text{ and } L_2 \\)</div>
        
        <!-- Line 1 Input -->
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line 1 (L₁): a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="famA1" value="1" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="famB1" value="1" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="famC1" value="-2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 Input -->
            <div class="point-box" style="width:100%;">
                <label>Line 2 (L₂): a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="famA2" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="famB2" value="-1" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="famC2" value="-1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- λ (lambda) parameter -->
            <div class="point-box" style="width:100%;">
                <label>Parameter λ (lambda)</label>
                <div style="display:flex; gap:20px; justify-content:center; align-items:center; flex-wrap:wrap;">
                    <div><span>λ =</span> <input type="number" id="famLambda" value="1" step="any" style="width:100px;"></div>
                    <div style="color:#856404; font-size:0.95rem;">
                        <strong>Different λ values give different lines through the intersection point</strong>
                    </div>
                </div>
            </div>
            
            <!-- Quick λ presets -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="famLambda0">λ = 0 (L₁)</button>
                <button class="mode-option" id="famLambda1">λ = 1</button>
                <button class="mode-option" id="famLambda2">λ = 2</button>
                <button class="mode-option" id="famLambdaNeg1">λ = -1</button>
                <button class="mode-option" id="famLambdaInf">λ → ∞ (L₂)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeFamilyBtn">
            <span>👪</span> Show Family Line
        </button>
        
        <div class="result-highlight" id="familyResult">
            \\( (x + y - 2) + \\lambda(2x - y - 1) = 0 \\)
        </div>
        <div class="footnote">
            <strong>Family of Lines:</strong> L₁ + λL₂ = 0 represents ALL lines passing through the intersection of L₁ and L₂.<br>
            • When λ = 0 → we get L₁<br>
            • As λ → ∞ → we approach L₂<br>
            • Different λ values give different lines through the same intersection point
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('famA1'), b1 = document.getElementById('famB1'), c1 = document.getElementById('famC1');
    const a2 = document.getElementById('famA2'), b2 = document.getElementById('famB2'), c2 = document.getElementById('famC2');
    const lambdaInp = document.getElementById('famLambda');
    const compute = document.getElementById('computeFamilyBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('familyResult');
    
    // Lambda preset buttons
    const lambda0 = document.getElementById('famLambda0');
    const lambda1 = document.getElementById('famLambda1');
    const lambda2 = document.getElementById('famLambda2');
    const lambdaNeg1 = document.getElementById('famLambdaNeg1');
    const lambdaInf = document.getElementById('famLambdaInf');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a1v = validateNumber(a1.value, 'a₁');
            const b1v = validateNumber(b1.value, 'b₁');
            const c1v = validateNumber(c1.value, 'c₁');
            const a2v = validateNumber(a2.value, 'a₂');
            const b2v = validateNumber(b2.value, 'b₂');
            const c2v = validateNumber(c2.value, 'c₂');
            const lambda = validateNumber(lambdaInp.value, 'λ');

            // Check that lines are valid
            if (Math.abs(a1v) < 1e-10 && Math.abs(b1v) < 1e-10) {
                throw new Error('Line 1: a and b cannot both be zero');
            }
            if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) < 1e-10) {
                throw new Error('Line 2: a and b cannot both be zero');
            }

            // Find intersection point of L₁ and L₂
            const denom = a1v * b2v - a2v * b1v;
            let intersectionPoint = null;
            
            if (Math.abs(denom) < 1e-10) {
                // Lines are parallel or coincident
                // Check if they're the same line
                const ratio1 = Math.abs(a1v) > 1e-10 ? a2v/a1v : (Math.abs(b1v) > 1e-10 ? b2v/b1v : 0);
                const ratio2 = Math.abs(a1v) > 1e-10 ? c2v/c1v : (Math.abs(b1v) > 1e-10 ? c2v/c1v : 0);
                
                if (Math.abs(ratio1 - ratio2) < 1e-10) {
                    throw new Error('Lines are coincident (same line) - infinite intersection points');
                } else {
                    throw new Error('Lines are parallel - they do not intersect');
                }
            } else {
                // Calculate intersection point
                const intersectX = (b1v * c2v - b2v * c1v) / denom;
                const intersectY = (c1v * a2v - c2v * a1v) / denom;
                intersectionPoint = {x: intersectX, y: intersectY};
            }

            // Calculate coefficients of family line: L₁ + λL₂ = 0
            // (a₁ + λ·a₂)x + (b₁ + λ·b₂)y + (c₁ + λ·c₂) = 0
            const aFam = a1v + lambda * a2v;
            const bFam = b1v + lambda * b2v;
            const cFam = c1v + lambda * c2v;

            // Draw all three lines: L₁, L₂, and the family line
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
            // Helper function to get line points
            function getLinePoints(a, b, c, color, dash, label) {
                let pts;
                if (Math.abs(b) > 1e-10) {
                    // Non-vertical line
                    pts = [
                        {x: minX, y: (-a*minX - c)/b},
                        {x: maxX, y: (-a*maxX - c)/b}
                    ];
                } else {
                    // Vertical line
                    const xConst = -c/a;
                    pts = [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
                lineSegments.push({ from: pts[0], to: pts[1], color: color, dash: dash, label: label, width: 2 });
            }

            // Add L₁ (blue)
            getLinePoints(a1v, b1v, c1v, '#1f7f6a', [], 'L₁');
            
            // Add L₂ (orange)
            getLinePoints(a2v, b2v, c2v, '#ca8a04', [], 'L₂');
            
            // Add family line (red) - only if it's not the same as L₁ or L₂
            if (Math.abs(lambda) > 1e-10 && Math.abs(1/lambda) > 1e-10) {
                getLinePoints(aFam, bFam, cFam, '#d44c2f', [5,3], `L₁ + ${fmt(lambda)}L₂`);
            } else if (Math.abs(lambda) < 1e-10) {
                // λ = 0 gives L₁, already drawn
            } else {
                // Very large λ approximates L₂, already drawn
            }

            // Add intersection point
            const specialPoints = intersectionPoint ? [{x: intersectionPoint.x, y: intersectionPoint.y, label: 'P'}] : [];

            drawGraph([], specialPoints, lineSegments);

            // Create steps with EXPLANATION
            const steps = [
                `① Given lines:`,
                `   L₁: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                `   L₂: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                `② Find intersection point P of L₁ and L₂:`,
                `   Using determinant method:`,
                `   Δ = a₁b₂ - a₂b₁ = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)} = ${fmt(denom)}`,
                `   xₚ = (b₁c₂ - b₂c₁)/Δ = (${fmt(b1v)}·${fmt(c2v)} - ${fmt(b2v)}·${fmt(c1v)})/${fmt(denom)} = ${fmt(intersectionPoint.x)}`,
                `   yₚ = (c₁a₂ - c₂a₁)/Δ = (${fmt(c1v)}·${fmt(a2v)} - ${fmt(c2v)}·${fmt(a1v)})/${fmt(denom)} = ${fmt(intersectionPoint.y)}`,
                `   Intersection point P = (${fmt(intersectionPoint.x)}, ${fmt(intersectionPoint.y)})`,
                `③ Family of lines through P: L₁ + λL₂ = 0`,
                `   This means: (${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)}) + λ(${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)}) = 0`,
                `④ Given λ = ${fmt(lambda)}:`,
                `   Expand: [${fmt(a1v)} + ${fmt(lambda)}·${fmt(a2v)}]x + [${fmt(b1v)} + ${fmt(lambda)}·${fmt(b2v)}]y + [${fmt(c1v)} + ${fmt(lambda)}·${fmt(c2v)}] = 0`,
                `   Simplify: ${fmt(aFam)}x + ${fmt(bFam)}y + ${fmt(cFam)} = 0`,
                `⑤ Verify that P lies on this line:`,
                `   Substitute P(${fmt(intersectionPoint.x)}, ${fmt(intersectionPoint.y)}):`,
                `   ${fmt(aFam)}·${fmt(intersectionPoint.x)} + ${fmt(bFam)}·${fmt(intersectionPoint.y)} + ${fmt(cFam)} =`,
                `   ${fmt(aFam * intersectionPoint.x)} + ${fmt(bFam * intersectionPoint.y)} + ${fmt(cFam)} =`,
                `   ${fmt(aFam * intersectionPoint.x + bFam * intersectionPoint.y + cFam)} ≈ 0 ✓`,
                `⑥ Key properties of family of lines:`,
                `   • When λ = 0, we get L₁: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                `   • As λ → ∞, the line approaches L₂: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                `   • Every line through P (except L₂ itself) can be represented with some finite λ`,
                `   • Different λ values give different lines rotating around point P`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            const a1Str = a1v === 1 ? '' : (a1v === -1 ? '-' : fmt(a1v));
            const b1Str = b1v === 1 ? '+' : (b1v === -1 ? '-' : (b1v > 0 ? '+' + fmt(b1v) : (b1v < 0 ? '-' + Math.abs(fmt(b1v)) : '')));
            const c1Str = c1v > 0 ? '+' + fmt(c1v) : (c1v < 0 ? '-' + Math.abs(fmt(c1v)) : '');
            
            const a2Str = a2v === 1 ? '' : (a2v === -1 ? '-' : fmt(a2v));
            const b2Str = b2v === 1 ? '+' : (b2v === -1 ? '-' : (b2v > 0 ? '+' + fmt(b2v) : (b2v < 0 ? '-' + Math.abs(fmt(b2v)) : '')));
            const c2Str = c2v > 0 ? '+' + fmt(c2v) : (c2v < 0 ? '-' + Math.abs(fmt(c2v)) : '');
            
            resultDiv.innerHTML = `\\( (${a1Str}x ${b1Str}y ${c1Str}) + ${fmt(lambda)}(${a2Str}x ${b2Str}y ${c2Str}) = 0 \\)<br>` +
                `\\( \\downarrow \\)<br>` +
                `\\( ${fmt(aFam)}x ${bFam >= 0 ? '+' : '-'} ${Math.abs(fmt(bFam))}y ${cFam >= 0 ? '+' : '-'} ${Math.abs(fmt(cFam))} = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2, lambdaInp]);
        }
    }

    // Lambda preset handlers
    lambda0.addEventListener('click', () => { lambdaInp.value = 0; update(); });
    lambda1.addEventListener('click', () => { lambdaInp.value = 1; update(); });
    lambda2.addEventListener('click', () => { lambdaInp.value = 2; update(); });
    lambdaNeg1.addEventListener('click', () => { lambdaInp.value = -1; update(); });
    lambdaInf.addEventListener('click', () => { 
        // For "infinity", use a very large number to approximate L₂
        lambdaInp.value = 1000; 
        update(); 
    });

    // Event listeners
    compute.addEventListener('click', update);
    [a1, b1, c1, a2, b2, c2, lambdaInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a1, b1, c1, a2, b2, c2, lambdaInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// NEW: Render function for Linear Independence/Dependence of Lines
function renderLinearIndependenceCard() {
    // Deactivate all coordinate geometry buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Deactivate other equation form buttons
    slopeInterceptBtn.classList.remove('active-btn');
    pointSlopeBtn.classList.remove('active-btn');
    twoPointBtn.classList.remove('active-btn');
    interceptFormBtn.classList.remove('active-btn');
    normalFormBtn.classList.remove('active-btn');
    generalFormBtn.classList.remove('active-btn');
    parametricFormBtn.classList.remove('active-btn');
    horizontalLineBtn.classList.remove('active-btn');
    verticalLineBtn.classList.remove('active-btn');
    slopeFromGeneralBtn.classList.remove('active-btn');
    xInterceptBtn.classList.remove('active-btn');
    yInterceptBtn.classList.remove('active-btn');
    symmetricFormBtn.classList.remove('active-btn');
    concurrencyBtn.classList.remove('active-btn');
    familyLinesBtn.classList.remove('active-btn');
    
    // Activate the linear independence button
    const linearIndependenceBtn = document.getElementById('linearIndependenceBtn');
    linearIndependenceBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔗</span> Linear Independence/Dependence of Lines</h2>
        
        <div class="formula-badge">\\( \\text{Two lines are linearly dependent if one is a scalar multiple of the other} \\)</div>
        <div class="formula-badge">\\( L_1: a_1x + b_1y + c_1 = 0 \\)</div>
        <div class="formula-badge">\\( L_2: a_2x + b_2y + c_2 = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Linearly dependent: } \\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 Input -->
            <div class="point-box" style="width:100%;">
                <label>Line 1 (L₁): a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="liA1" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="liB1" value="4" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="liC1" value="6" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 Input -->
            <div class="point-box" style="width:100%;">
                <label>Line 2 (L₂): a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="liA2" value="1" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="liB2" value="2" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="liC2" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="liExampleDependent">📊 Dependent Example</button>
                <button class="mode-option" id="liExampleIndependent">📈 Independent Example</button>
                <button class="mode-option" id="liExampleParallel">📏 Parallel (Dependent normals)</button>
                <button class="mode-option" id="liExampleIntersecting">✖️ Intersecting (Independent)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeLinearIndependenceBtn">
            <span>🔗</span> Check Linear Independence
        </button>
        
        <div class="result-highlight" id="liResult">
            \\( \\text{Lines are linearly DEPENDENT} \\)
        </div>
        <div class="footnote">
            <strong>Linear Independence in Lines:</strong><br>
            • <strong>Linearly DEPENDENT:</strong> Lines are the same (coincident) - one equation is a scalar multiple of the other<br>
            • <strong>Linearly INDEPENDENT:</strong> Lines are different (intersecting, parallel but distinct, or skew in 3D)<br>
            • For two lines in 2D, they are dependent ONLY if they represent the EXACT same line<br>
            • If they are parallel but distinct → they are INDEPENDENT (different c values)<br>
            • If they intersect at a point → they are INDEPENDENT
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('liA1'), b1 = document.getElementById('liB1'), c1 = document.getElementById('liC1');
    const a2 = document.getElementById('liA2'), b2 = document.getElementById('liB2'), c2 = document.getElementById('liC2');
    const compute = document.getElementById('computeLinearIndependenceBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('liResult');
    
    // Example buttons
    const exampleDependent = document.getElementById('liExampleDependent');
    const exampleIndependent = document.getElementById('liExampleIndependent');
    const exampleParallel = document.getElementById('liExampleParallel');
    const exampleIntersecting = document.getElementById('liExampleIntersecting');

    function checkLinearIndependence(a1v, b1v, c1v, a2v, b2v, c2v) {
        // Check if lines are valid
        if (Math.abs(a1v) < 1e-10 && Math.abs(b1v) < 1e-10) {
            throw new Error('Line 1: a and b cannot both be zero');
        }
        if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) < 1e-10) {
            throw new Error('Line 2: a and b cannot both be zero');
        }

        // Check for zero coefficients to avoid division by zero
        const normalizeAndCompare = () => {
            // Find first non-zero coefficient in each line for ratio comparison
            let ratioA = null, ratioB = null, ratioC = null;
            let consistent = true;
            
            // Compare a coefficients if both non-zero
            if (Math.abs(a1v) > 1e-10 && Math.abs(a2v) > 1e-10) {
                ratioA = a1v / a2v;
            }
            
            // Compare b coefficients if both non-zero
            if (Math.abs(b1v) > 1e-10 && Math.abs(b2v) > 1e-10) {
                ratioB = b1v / b2v;
            }
            
            // Compare c coefficients if both non-zero
            if (Math.abs(c1v) > 1e-10 && Math.abs(c2v) > 1e-10) {
                ratioC = c1v / c2v;
            }
            
            // If we have at least two ratios, they should be equal
            const ratios = [ratioA, ratioB, ratioC].filter(r => r !== null);
            
            if (ratios.length >= 2) {
                const firstRatio = ratios[0];
                consistent = ratios.every(r => Math.abs(r - firstRatio) < 1e-10);
            }
            
            // Special cases:
            // If one line has a=0 and the other has a≠0, they can't be multiples unless the zero line has a=0 and b≠0 matches
            if ((Math.abs(a1v) < 1e-10 && Math.abs(a2v) > 1e-10) || 
                (Math.abs(a1v) > 1e-10 && Math.abs(a2v) < 1e-10)) {
                // One has a=0, other has a≠0 → can't be multiples unless the zero line's a=0 is matched by the other's a being proportionally 0
                // But a2v ≠ 0 means a1v/a2v would be 0, while b ratio might be non-zero
                consistent = false;
            }
            
            if ((Math.abs(b1v) < 1e-10 && Math.abs(b2v) > 1e-10) || 
                (Math.abs(b1v) > 1e-10 && Math.abs(b2v) < 1e-10)) {
                consistent = false;
            }
            
            return consistent;
        };

        const areDependent = normalizeAndCompare();
        
        // Additional check: if ratios exist and are equal, also check if the lines are actually the same
        // For dependent lines, any point on L1 should satisfy L2
        if (areDependent) {
            // Find a point on L1 to test on L2
            let testX, testY;
            if (Math.abs(b1v) > 1e-10) {
                testX = 0;
                testY = -c1v / b1v;
            } else {
                testX = -c1v / a1v;
                testY = 0;
            }
            
            const lhs = a2v * testX + b2v * testY + c2v;
            if (Math.abs(lhs) > 1e-10) {
                return { dependent: false, reason: 'ratios match but lines are different' };
            }
        }
        
        return { dependent: areDependent };
    }

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a1v = validateNumber(a1.value, 'a₁');
            const b1v = validateNumber(b1.value, 'b₁');
            const c1v = validateNumber(c1.value, 'c₁');
            const a2v = validateNumber(a2.value, 'a₂');
            const b2v = validateNumber(b2.value, 'b₂');
            const c2v = validateNumber(c2.value, 'c₂');

            const result = checkLinearIndependence(a1v, b1v, c1v, a2v, b2v, c2v);
            const isDependent = result.dependent;

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
            // Helper function to get line points
            function getLinePoints(a, b, c, color, dash, label) {
                let pts;
                if (Math.abs(b) > 1e-10) {
                    // Non-vertical line
                    pts = [
                        {x: minX, y: (-a*minX - c)/b},
                        {x: maxX, y: (-a*maxX - c)/b}
                    ];
                } else {
                    // Vertical line
                    const xConst = -c/a;
                    pts = [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
                lineSegments.push({ from: pts[0], to: pts[1], color: color, dash: dash, label: label, width: 2 });
            }

            // Add lines with different colors
            getLinePoints(a1v, b1v, c1v, '#d44c2f', [], 'L₁');
            getLinePoints(a2v, b2v, c2v, '#1f7f6a', isDependent ? [5,3] : [], 'L₂');

            drawGraph([], [], lineSegments);

            // Calculate ratios for explanation
            let ratioA = 'undefined', ratioB = 'undefined', ratioC = 'undefined';
            let ratioExplanation = [];
            
            if (Math.abs(a2v) > 1e-10) ratioA = fmt(a1v / a2v);
            if (Math.abs(b2v) > 1e-10) ratioB = fmt(b1v / b2v);
            if (Math.abs(c2v) > 1e-10) ratioC = fmt(c1v / c2v);
            
            // Check if lines are parallel (normals are scalar multiples)
            let areParallel = false;
            if (Math.abs(a2v) > 1e-10 && Math.abs(b2v) > 1e-10) {
                const ratioAB = Math.abs((a1v / a2v) - (b1v / b2v)) < 1e-10;
                areParallel = ratioAB;
            } else if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) > 1e-10) {
                areParallel = Math.abs(a1v) < 1e-10; // Both have a=0
            } else if (Math.abs(b2v) < 1e-10 && Math.abs(a2v) > 1e-10) {
                areParallel = Math.abs(b1v) < 1e-10; // Both have b=0
            }

            // Check if they intersect
            const denom = a1v * b2v - a2v * b1v;
            const doIntersect = Math.abs(denom) > 1e-10;

            // Create steps
            const steps = [
                `① Line 1 (L₁): ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                `② Line 2 (L₂): ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                `③ Compare coefficients (check if one is scalar multiple of the other):`,
                `   • a₁/a₂ = ${ratioA}`,
                `   • b₁/b₂ = ${ratioB}`,
                `   • c₁/c₂ = ${ratioC}`,
                `④ Analysis:`,
                `   • Lines are ${areParallel ? 'PARALLEL' : 'NOT parallel'}`,
                `   • Lines ${doIntersect ? 'INTERSECT at a point' : (areParallel ? 'are parallel' : 'do not intersect')}`,
                `⑤ Linear Independence Conclusion:`,
                `   • ${isDependent ? '✓ LINES ARE LINEARLY DEPENDENT' : '✗ LINES ARE LINEARLY INDEPENDENT'}`,
                `   • ${isDependent ? 'They represent the EXACT SAME line' : 'They are DIFFERENT lines'}`,
                `⑥ Explanation:`,
            ];
            
            if (isDependent) {
                steps.push(`   • One equation is a scalar multiple of the other`);
                steps.push(`   • Every point on L₁ satisfies L₂ and vice versa`);
                steps.push(`   • The lines are COINCIDENT (identical)`);
            } else {
                if (areParallel) {
                    steps.push(`   • Lines are parallel but DISTINCT (different c values)`);
                    steps.push(`   • Normals are scalar multiples, but constants are not in same ratio`);
                    steps.push(`   • Therefore, they are INDEPENDENT`);
                } else if (doIntersect) {
                    steps.push(`   • Lines INTERSECT at a single point`);
                    steps.push(`   • They are clearly INDEPENDENT (different directions)`);
                } else {
                    steps.push(`   • Lines are neither parallel nor intersecting (skew in 3D)`);
                    steps.push(`   • They are INDEPENDENT`);
                }
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            const resultClass = isDependent ? 'dependent' : 'independent';
            resultDiv.innerHTML = `\\( \\text{Lines are LINEARLY ${isDependent ? 'DEPENDENT' : 'INDEPENDENT'}} \\)<br>` +
                (isDependent ? 
                    `\\( (${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)}) = k·(${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)}) \\)` :
                    (areParallel ? 
                        `\\( \\text{Parallel but distinct (independent)} \\)` :
                        (doIntersect ? 
                            `\\( \\text{Intersecting at a point (independent)} \\)` :
                            `\\( \\text{Independent lines} \\)`)));
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2]);
        }
    }

    // Example button handlers
    exampleDependent.addEventListener('click', () => {
        a1.value = 2; b1.value = 4; c1.value = 6;
        a2.value = 1; b2.value = 2; c2.value = 3;
        update();
    });
    
    exampleIndependent.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 5;
        a2.value = 4; b2.value = -1; c2.value = 2;
        update();
    });
    
    exampleParallel.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 5;
        a2.value = 2; b2.value = 3; c2.value = -4;
        update();
    });
    
    exampleIntersecting.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 5;
        a2.value = 4; b2.value = -1; c2.value = 2;
        update();
    });

    // Event listeners
    compute.addEventListener('click', update);
    [a1, b1, c1, a2, b2, c2].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a1, b1, c1, a2, b2, c2].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}