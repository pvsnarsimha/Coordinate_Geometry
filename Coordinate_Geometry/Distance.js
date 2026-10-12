// ========= NEW: Distance from Origin to Line =========
function renderDistanceOriginToLineCard() {
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
    
    // Deactivate equation form buttons
    if(slopeInterceptBtn) slopeInterceptBtn.classList.remove('active-btn');
    if(pointSlopeBtn) pointSlopeBtn.classList.remove('active-btn');
    if(twoPointBtn) twoPointBtn.classList.remove('active-btn');
    if(interceptFormBtn) interceptFormBtn.classList.remove('active-btn');
    if(normalFormBtn) normalFormBtn.classList.remove('active-btn');
    if(generalFormBtn) generalFormBtn.classList.remove('active-btn');
    if(parametricFormBtn) parametricFormBtn.classList.remove('active-btn');
    if(horizontalLineBtn) horizontalLineBtn.classList.remove('active-btn');
    if(verticalLineBtn) verticalLineBtn.classList.remove('active-btn');
    
    // Deactivate angle-related buttons
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    
    // Activate this button
    const distanceOriginToLineBtn = document.getElementById('distanceOriginToLineBtn');
    distanceOriginToLineBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🎯</span> Distance from Origin to a Line</h2>
        
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Distance from origin: } d = \\frac{|c|}{\\sqrt{a^2 + b^2}} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Line Coefficients</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="originA" value="3" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="originB" value="4" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="originC" value="10" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> a and b cannot both be zero
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
        
        <button class="calculate-btn" id="computeOriginDistanceBtn">
            <span>🎯</span> Calculate Distance
        </button>
        
        <div class="result-highlight" id="originDistanceResult">
            \\( d = 2 \\)
        </div>
        <div class="footnote">
            <strong>Special case of point-line distance:</strong> When point is origin (0,0), the formula simplifies to |c|/√(a²+b²).<br>
            The perpendicular from origin to the line has length d, and its foot is the closest point.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('originA');
    const bInp = document.getElementById('originB');
    const cInp = document.getElementById('originC');
    const compute = document.getElementById('computeOriginDistanceBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('originDistanceResult');

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

            // Calculate distance from origin
            const denominator = Math.sqrt(a*a + b*b);
            const distance = Math.abs(c) / denominator;
            
            // Find foot of perpendicular from origin to line
            // For origin (0,0), foot = (-a*c/(a²+b²), -b*c/(a²+b²))
            const footX = -a * c / (a*a + b*b);
            const footY = -b * c / (a*a + b*b);

            // Draw the line
            const minX = -8, maxX = 8;
            let linePts;
            
            if (Math.abs(b) > 1e-10) {
                // Non-vertical line
                linePts = [
                    {x: minX, y: (-a*minX - c)/b},
                    {x: maxX, y: (-a*maxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 },
                { from: {x: 0, y: 0}, to: {x: footX, y: footY}, color: '#d44c2f', dash: [5,3], label: 'Perpendicular', width: 2 }
            ];
            
            const specialPoints = [
                {x: 0, y: 0, label: 'O(0,0)'},
                {x: footX, y: footY, label: 'F'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `② Distance from origin formula: d = |c| / √(a² + b²)`,
                `③ Calculate denominator: √(a² + b²) = √(${fmt(a*a)} + ${fmt(b*b)}) = √${fmt(a*a + b*b)} = ${fmt(denominator)}`,
                `④ Numerator: |c| = |${fmt(c)}| = ${Math.abs(c)}`,
                `⑤ Distance: d = ${Math.abs(c)} / ${fmt(denominator)} = ${fmt(distance)}`,
                `⑥ Foot of perpendicular from origin:`,
                `   x_f = -a·c/(a²+b²) = -${fmt(a)}·${fmt(c)}/${fmt(a*a + b*b)} = ${fmt(footX)}`,
                `   y_f = -b·c/(a²+b²) = -${fmt(b)}·${fmt(c)}/${fmt(a*a + b*b)} = ${fmt(footY)}`,
                `   F = (${fmt(footX)}, ${fmt(footY)})`,
                `⑦ Verification: Check F lies on line:`,
                `   ${fmt(a)}·${fmt(footX)} + ${fmt(b)}·${fmt(footY)} + ${fmt(c)} = ${fmt(a*footX + b*footY + c)} ≈ 0 ✓`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( d = ${fmt(distance)} \\)`;
            
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
// ========= NEW: Perpendicular Distance Problems =========
function renderPerpendicularDistanceCard() {
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
    
    // Deactivate other buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    
    // Activate this button
    const perpendicularDistanceBtn = document.getElementById('perpendicularDistanceBtn');
    perpendicularDistanceBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏</span> Perpendicular Distance Problems</h2>
        
        <div class="formula-badge">\\( \\text{Finding locus using distance condition: } \\frac{|ax + by + c|}{\\sqrt{a^2 + b^2}} = k \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Fixed line -->
            <div class="point-box" style="width:100%;">
                <label>Fixed Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="perpDistA" value="3" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="perpDistB" value="4" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="perpDistC" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Distance condition -->
            <div class="point-box" style="width:100%;">
                <label>Distance Condition</label>
                <div style="display:flex; gap:20px; justify-content:center; align-items:center; flex-wrap:wrap;">
                    <div>Perpendicular distance = <input type="number" id="perpDistK" value="2" step="any" style="width:80px;"></div>
                    <div>
                        <label><input type="radio" name="perpDistType" value="equal" checked> = k</label>
                        <label><input type="radio" name="perpDistType" value="less"> < k</label>
                        <label><input type="radio" name="perpDistType" value="greater"> > k</label>
                    </div>
                </div>
            </div>
            
            <!-- Moving point -->
            <div class="point-box" style="width:100%;">
                <label>Moving Point P(x, y)</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>Sample x = <input type="number" id="perpDistX" value="2" step="any" style="width:80px;"></div>
                    <div>Sample y = <input type="number" id="perpDistY" value="1" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px;">Check if sample point satisfies condition</div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="perpDistEx1">Line y = 0, distance 2</button>
                <button class="mode-option" id="perpDistEx2">Line x + y = 0, distance √2</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePerpDistBtn">
            <span>📏</span> Analyze Locus
        </button>
        
        <div class="result-highlight" id="perpDistResult">
            \\( |3x + 4y| = 10 \\)
        </div>
        <div class="footnote">
            <strong>Locus from distance condition:</strong> Set of points at fixed perpendicular distance k from a line gives two lines parallel to the given line.<br>
            • For distance = k: two lines: ax + by + c = ±k√(a²+b²)<br>
            • For distance < k: region between these lines<br>
            • For distance > k: regions outside these lines
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('perpDistA');
    const bInp = document.getElementById('perpDistB');
    const cInp = document.getElementById('perpDistC');
    const kInp = document.getElementById('perpDistK');
    const xInp = document.getElementById('perpDistX');
    const yInp = document.getElementById('perpDistY');
    const compute = document.getElementById('computePerpDistBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('perpDistResult');
    
    // Example buttons
    const ex1 = document.getElementById('perpDistEx1');
    const ex2 = document.getElementById('perpDistEx2');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            const k = validateNumber(kInp.value, 'k', 0, 1e9); // k must be non-negative
            
            // Get condition type
            const radios = document.getElementsByName('perpDistType');
            let conditionType = 'equal';
            for (let radio of radios) {
                if (radio.checked) {
                    conditionType = radio.value;
                    break;
                }
            }

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate the constant for parallel lines
            const norm = Math.sqrt(a*a + b*b);
            const constant = k * norm;
            
            // The two lines parallel to given line at distance k
            // ax + by + c = ± constant
            const line1Constant = c - constant;
            const line2Constant = c + constant;
            
            // Check sample point if provided
            let sampleCheck = '';
            let sampleSatisfies = false;
            try {
                const xSample = validateNumber(xInp.value, 'sample x');
                const ySample = validateNumber(yInp.value, 'sample y');
                
                const distance = Math.abs(a*xSample + b*ySample + c) / norm;
                
                if (conditionType === 'equal') {
                    sampleSatisfies = Math.abs(distance - k) < 1e-10;
                } else if (conditionType === 'less') {
                    sampleSatisfies = distance < k;
                } else {
                    sampleSatisfies = distance > k;
                }
                
                sampleCheck = `⑧ Sample point (${fmt(xSample)}, ${fmt(ySample)}): ` +
                    `distance = |${fmt(a)}·${fmt(xSample)} + ${fmt(b)}·${fmt(ySample)} + ${fmt(c)}|/${fmt(norm)} = ` +
                    `${fmt(Math.abs(a*xSample + b*ySample + c))}/${fmt(norm)} = ${fmt(distance)}. ` +
                    `Condition ${conditionType === 'equal' ? '=' : (conditionType === 'less' ? '<' : '>')} ${fmt(k)}: ` +
                    `${sampleSatisfies ? '✓ Satisfied' : '✗ Not satisfied'}`;
            } catch (e) {
                sampleCheck = '';
            }

            // Draw the lines
            const minX = -8, maxX = 8;
            
            function getLinePoints(a, b, constantTerm) {
                if (Math.abs(b) > 1e-10) {
                    return [
                        {x: minX, y: (-a*minX - constantTerm)/b},
                        {x: maxX, y: (-a*maxX - constantTerm)/b}
                    ];
                } else {
                    const xConst = -constantTerm/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            const ptsOriginal = getLinePoints(a, b, c);
            const pts1 = getLinePoints(a, b, line1Constant);
            const pts2 = getLinePoints(a, b, line2Constant);
            
            const lineSegments = [
                { from: ptsOriginal[0], to: ptsOriginal[1], color: '#2c3e50', dash: [], label: 'Given line', width: 2 },
                { from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [5,3], label: 'Distance = k', width: 2 },
                { from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: [5,3], label: 'Distance = k', width: 2 }
            ];
            
            // Add sample point if provided
            const specialPoints = [];
            try {
                const xSample = validateNumber(xInp.value, 'sample x');
                const ySample = validateNumber(yInp.value, 'sample y');
                specialPoints.push({x: xSample, y: ySample, label: 'P'});
            } catch (e) {
                // No sample point
            }

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const conditionSymbol = conditionType === 'equal' ? '=' : (conditionType === 'less' ? '<' : '>');
            let locusDesc = '';
            if (conditionType === 'equal') {
                locusDesc = `two lines parallel to given line at distance ${fmt(k)}`;
            } else if (conditionType === 'less') {
                locusDesc = `region between the two parallel lines (distance < ${fmt(k)})`;
            } else {
                locusDesc = `regions outside the two parallel lines (distance > ${fmt(k)})`;
            }
            
            const steps = [
                `① Fixed line L: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `② Distance condition: perpendicular distance from P(x,y) to L ${conditionSymbol} ${fmt(k)}`,
                `③ Distance formula: d = |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| / √(${fmt(a*a)} + ${fmt(b*b)})`,
                `④ Denominator = √${fmt(a*a + b*b)} = ${fmt(norm)}`,
                `⑤ Condition becomes: |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| / ${fmt(norm)} ${conditionSymbol} ${fmt(k)}`,
                `⑥ Multiply both sides by ${fmt(norm)}:`,
                `   |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| ${conditionSymbol} ${fmt(k * norm)}`,
                `⑦ This represents ${locusDesc}:`,
                `   • Line 1: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c - k*norm)} = 0`,
                `   • Line 2: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c + k*norm)} = 0`
            ];
            
            if (sampleCheck) {
                steps.push(sampleCheck);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = '';
            if (conditionType === 'equal') {
                resultText = `\\( |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| = ${fmt(k*norm)} \\)`;
            } else if (conditionType === 'less') {
                resultText = `\\( |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| < ${fmt(k*norm)} \\)`;
            } else {
                resultText = `\\( |${fmt(a)}x + ${fmt(b)}y + ${fmt(c)}| > ${fmt(k*norm)} \\)`;
            }
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp, kInp, xInp, yInp]);
        }
    }

    // Example button handlers
    ex1.addEventListener('click', () => {
        aInp.value = 0; bInp.value = 1; cInp.value = 0;  // y = 0
        kInp.value = 2;
        update();
    });
    
    ex2.addEventListener('click', () => {
        aInp.value = 1; bInp.value = 1; cInp.value = 0;  // x + y = 0
        kInp.value = Math.sqrt(2);
        update();
    });

    compute.addEventListener('click', update);
    [aInp, bInp, cInp, kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp, kInp, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // Add change listeners to radio buttons
    const radios = document.getElementsByName('perpDistType');
    for (let radio of radios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Equidistant Points from Two Lines (Angle Bisectors) =========
function renderEquidistantPointsCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    
    // Activate this button
    const equidistantPointsBtn = document.getElementById('equidistantPointsBtn');
    equidistantPointsBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⚖️</span> Equidistant Points from Two Lines</h2>
        
        <div class="formula-badge">\\( \\text{Locus of points equidistant from two lines = Angle bisectors} \\)</div>
        <div class="formula-badge">\\( \\frac{|a_1x + b_1y + c_1|}{\\sqrt{a_1^2 + b_1^2}} = \\frac{|a_2x + b_2y + c_2|}{\\sqrt{a_2^2 + b_2^2}} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="eqA1" value="1" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="eqB1" value="1" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="eqC1" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="eqA2" value="1" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="eqB2" value="-1" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="eqC2" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Test point -->
            <div class="point-box" style="width:100%;">
                <label>Test Point P(x, y)</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>x = <input type="number" id="eqX" value="2" step="any" style="width:80px;"></div>
                    <div>y = <input type="number" id="eqY" value="1" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px;">Check if point is equidistant from both lines</div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="eqEx1">Intersecting lines (y=x, y=-x)</button>
                <button class="mode-option" id="eqEx2">Parallel lines (y=1, y=-1)</button>
                <button class="mode-option" id="eqEx3">Axes (x=0, y=0)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeEquidistantBtn">
            <span>⚖️</span> Find Angle Bisectors
        </button>
        
        <div class="result-highlight" id="equidistantResult">
            \\( x = 0 \\text{ and } y = 0 \\)
        </div>
        <div class="footnote">
            <strong>Angle Bisectors:</strong> The locus of points equidistant from two intersecting lines gives the two angle bisectors.<br>
            • For intersecting lines: two perpendicular bisectors (internal and external)<br>
            • For parallel lines: the locus is a line parallel to both, exactly midway between them<br>
            • The condition removes absolute values to give two equations: ±
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('eqA1'), b1 = document.getElementById('eqB1'), c1 = document.getElementById('eqC1');
    const a2 = document.getElementById('eqA2'), b2 = document.getElementById('eqB2'), c2 = document.getElementById('eqC2');
    const xInp = document.getElementById('eqX');
    const yInp = document.getElementById('eqY');
    const compute = document.getElementById('computeEquidistantBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('equidistantResult');
    
    // Example buttons
    const ex1 = document.getElementById('eqEx1');
    const ex2 = document.getElementById('eqEx2');
    const ex3 = document.getElementById('eqEx3');

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

            if (Math.abs(a1v) < 1e-10 && Math.abs(b1v) < 1e-10) {
                throw new Error('Line 1: a and b cannot both be zero');
            }
            if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) < 1e-10) {
                throw new Error('Line 2: a and b cannot both be zero');
            }

            // Calculate norms
            const norm1 = Math.sqrt(a1v*a1v + b1v*b1v);
            const norm2 = Math.sqrt(a2v*a2v + b2v*b2v);
            
            // Check if lines are parallel
            const det = a1v * b2v - a2v * b1v;
            const areParallel = Math.abs(det) < 1e-10;
            
            // The two bisector equations: (a1x + b1y + c1)/norm1 = ± (a2x + b2y + c2)/norm2
            // Bisector 1: (a1/norm1 - a2/norm2)x + (b1/norm1 - b2/norm2)y + (c1/norm1 - c2/norm2) = 0
            // Bisector 2: (a1/norm1 + a2/norm2)x + (b1/norm1 + b2/norm2)y + (c1/norm1 + c2/norm2) = 0
            
            const coef1a = a1v/norm1 - a2v/norm2;
            const coef1b = b1v/norm1 - b2v/norm2;
            const coef1c = c1v/norm1 - c2v/norm2;
            
            const coef2a = a1v/norm1 + a2v/norm2;
            const coef2b = b1v/norm1 + b2v/norm2;
            const coef2c = c1v/norm1 + c2v/norm2;
            
            // Check test point if provided
            let testCheck = '';
            let isEquidistant = false;
            try {
                const xTest = validateNumber(xInp.value, 'test x');
                const yTest = validateNumber(yInp.value, 'test y');
                
                const dist1 = Math.abs(a1v*xTest + b1v*yTest + c1v) / norm1;
                const dist2 = Math.abs(a2v*xTest + b2v*yTest + c2v) / norm2;
                isEquidistant = Math.abs(dist1 - dist2) < 1e-10;
                
                testCheck = `⑧ Test point (${fmt(xTest)}, ${fmt(yTest)}): ` +
                    `d₁ = |${fmt(a1v)}·${fmt(xTest)} + ${fmt(b1v)}·${fmt(yTest)} + ${fmt(c1v)}|/${fmt(norm1)} = ${fmt(dist1)}, ` +
                    `d₂ = |${fmt(a2v)}·${fmt(xTest)} + ${fmt(b2v)}·${fmt(yTest)} + ${fmt(c2v)}|/${fmt(norm2)} = ${fmt(dist2)}. ` +
                    `Point is ${isEquidistant ? 'equidistant' : 'not equidistant'}.`;
            } catch (e) {
                testCheck = '';
            }

            // Draw the lines and bisectors
            const minX = -8, maxX = 8;
            
            function getLinePoints(a, b, constant) {
                if (Math.abs(b) > 1e-10) {
                    return [
                        {x: minX, y: (-a*minX - constant)/b},
                        {x: maxX, y: (-a*maxX - constant)/b}
                    ];
                } else {
                    const xConst = -constant/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            const ptsL1 = getLinePoints(a1v, b1v, c1v);
            const ptsL2 = getLinePoints(a2v, b2v, c2v);
            
            const lineSegments = [
                { from: ptsL1[0], to: ptsL1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 },
                { from: ptsL2[0], to: ptsL2[1], color: '#1f7f6a', dash: [], label: 'L₂', width: 2 }
            ];
            
            // Add bisectors (if not degenerate)
            if (Math.abs(coef1a) > 1e-10 || Math.abs(coef1b) > 1e-10) {
                const ptsB1 = getLinePoints(coef1a, coef1b, coef1c);
                lineSegments.push({ from: ptsB1[0], to: ptsB1[1], color: '#2b3595', dash: [5,3], label: 'Bisector 1', width: 2 });
            }
            
            if (Math.abs(coef2a) > 1e-10 || Math.abs(coef2b) > 1e-10) {
                const ptsB2 = getLinePoints(coef2a, coef2b, coef2c);
                lineSegments.push({ from: ptsB2[0], to: ptsB2[1], color: '#ca8a04', dash: [5,3], label: 'Bisector 2', width: 2 });
            }
            
            // Add test point if provided
            const specialPoints = [];
            try {
                const xTest = validateNumber(xInp.value, 'test x');
                const yTest = validateNumber(yInp.value, 'test y');
                specialPoints.push({x: xTest, y: yTest, label: 'P'});
            } catch (e) {}

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line L₁: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0, norm₁ = √(${fmt(a1v*a1v)} + ${fmt(b1v*b1v)}) = ${fmt(norm1)}`,
                `② Line L₂: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0, norm₂ = √(${fmt(a2v*a2v)} + ${fmt(b2v*b2v)}) = ${fmt(norm2)}`,
                `③ Condition for equidistant points: d₁ = d₂`,
                `   |${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)}|/${fmt(norm1)} = |${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)}|/${fmt(norm2)}`,
                `④ Multiply both sides by ${fmt(norm1)}·${fmt(norm2)}:`,
                `   ${fmt(norm2)}|${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)}| = ${fmt(norm1)}|${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)}|`,
                `⑤ Removing absolute values gives two equations:`,
                `   ${fmt(norm2)}(${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)}) = ± ${fmt(norm1)}(${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)})`,
                `⑥ First bisector (taking + sign):`,
                `   (${fmt(norm2*a1v)} - ${fmt(norm1*a2v)})x + (${fmt(norm2*b1v)} - ${fmt(norm1*b2v)})y + (${fmt(norm2*c1v)} - ${fmt(norm1*c2v)}) = 0`,
                `   Simplify: ${fmt(coef1a)}x + ${fmt(coef1b)}y + ${fmt(coef1c)} = 0`,
                `⑦ Second bisector (taking - sign):`,
                `   (${fmt(norm2*a1v)} + ${fmt(norm1*a2v)})x + (${fmt(norm2*b1v)} + ${fmt(norm1*b2v)})y + (${fmt(norm2*c1v)} + ${fmt(norm1*c2v)}) = 0`,
                `   Simplify: ${fmt(coef2a)}x + ${fmt(coef2b)}y + ${fmt(coef2c)} = 0`
            ];
            
            if (areParallel) {
                steps.push(`⑧ Note: Lines are parallel, so the two bisectors coincide into one line midway between them.`);
            }
            
            if (testCheck) {
                steps.push(testCheck);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            const bisector1 = `${fmt(coef1a)}x ${coef1b >= 0 ? '+' : '-'} ${Math.abs(fmt(coef1b))}y ${coef1c >= 0 ? '+' : '-'} ${Math.abs(fmt(coef1c))} = 0`;
            const bisector2 = `${fmt(coef2a)}x ${coef2b >= 0 ? '+' : '-'} ${Math.abs(fmt(coef2b))}y ${coef2c >= 0 ? '+' : '-'} ${Math.abs(fmt(coef2c))} = 0`;
            
            resultDiv.innerHTML = `\\( ${bisector1} \\)<br>\\( ${bisector2} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2, xInp, yInp]);
        }
    }

    // Example button handlers
    ex1.addEventListener('click', () => {
        a1.value = 1; b1.value = -1; c1.value = 0;  // y = x
        a2.value = 1; b2.value = 1; c2.value = 0;   // y = -x
        update();
    });
    
    ex2.addEventListener('click', () => {
        a1.value = 0; b1.value = 1; c1.value = -1;  // y = 1
        a2.value = 0; b2.value = 1; c2.value = 1;   // y = -1
        update();
    });
    
    ex3.addEventListener('click', () => {
        a1.value = 1; b1.value = 0; c1.value = 0;   // x = 0
        a2.value = 0; b2.value = 1; c2.value = 0;   // y = 0
        update();
    });

    compute.addEventListener('click', update);
    [a1, b1, c1, a2, b2, c2, xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a1, b1, c1, a2, b2, c2, xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Distance between Skew Lines (Conceptual intro for 2D) =========
function renderSkewLinesCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    
    // Activate this button
    const skewLinesBtn = document.getElementById('skewLinesBtn');
    skewLinesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Distance between Skew Lines (2D Conceptual)</h2>
        
        <div class="formula-badge" style="background: #fff3cd;">\\( \\text{In 2D, lines are either intersecting or parallel. Skew lines exist only in 3D.} \\)</div>
        <div class="formula-badge">\\( \\text{Distance between parallel lines: } d = \\frac{|c_1 - c_2|}{\\sqrt{a^2 + b^2}} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Two lines (should be parallel for distance calculation) -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="skewA1" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="skewB1" value="3" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="skewC1" value="4" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="skewA2" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="skewB2" value="3" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="skewC2" value="-4" step="any" style="width:80px;"></div>
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    For distance to be defined, lines should be parallel (a₁/a₂ = b₁/b₂)
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="skewExParallel">Parallel Lines</button>
                <button class="mode-option" id="skewExIntersecting">Intersecting Lines</button>
                <button class="mode-option" id="skewEx3D">3D Concept (Demo)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSkewBtn">
            <span>📐</span> Analyze
        </button>
        
        <div class="result-highlight" id="skewResult">
            \\( d = 2.2188 \\)
        </div>
        <div class="footnote">
            <strong>Important Concept:</strong> In 2D geometry, there are no skew lines - lines are either intersecting or parallel.<br>
            • <strong>Skew lines</strong> exist only in 3D (or higher dimensions) - they are lines that do not intersect and are not parallel.<br>
            • The shortest distance between skew lines in 3D is along a line perpendicular to both.<br>
            • In 2D, if lines aren't parallel, they must intersect (distance = 0 at intersection point).<br>
            • This calculator shows the distance for parallel lines, and explains the 3D concept.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('skewA1'), b1 = document.getElementById('skewB1'), c1 = document.getElementById('skewC1');
    const a2 = document.getElementById('skewA2'), b2 = document.getElementById('skewB2'), c2 = document.getElementById('skewC2');
    const compute = document.getElementById('computeSkewBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('skewResult');
    
    // Example buttons
    const exParallel = document.getElementById('skewExParallel');
    const exIntersecting = document.getElementById('skewExIntersecting');
    const ex3D = document.getElementById('skewEx3D');

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

            if (Math.abs(a1v) < 1e-10 && Math.abs(b1v) < 1e-10) {
                throw new Error('Line 1: a and b cannot both be zero');
            }
            if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) < 1e-10) {
                throw new Error('Line 2: a and b cannot both be zero');
            }

            // Check if lines are parallel
            const det = a1v * b2v - a2v * b1v;
            const areParallel = Math.abs(det) < 1e-10;
            
            // Calculate norms (should be same if parallel)
            const norm1 = Math.sqrt(a1v*a1v + b1v*b1v);
            const norm2 = Math.sqrt(a2v*a2v + b2v*b2v);
            
            let distance, steps;

            if (areParallel) {
                // For parallel lines, use formula: |c1 - c2*(norm1/norm2)| / norm1
                // But if parallel, we can scale line2 to have same (a,b) as line1
                // Find scaling factor k such that (a2*k, b2*k) = (a1, b1)
                let k;
                if (Math.abs(a1v) > 1e-10) {
                    k = a1v / a2v;
                } else {
                    k = b1v / b2v;
                }
                
                const scaledC2 = c2v * k;
                distance = Math.abs(c1v - scaledC2) / norm1;
                
                steps = [
                    `① Line L₁: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                    `② Line L₂: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                    `③ Check if lines are parallel: a₁b₂ - a₂b₁ = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)} = ${fmt(det)} ≈ 0`,
                    `   ✓ Lines are PARALLEL`,
                    `④ For parallel lines, distance d = |c₁ - c₂·k| / √(a₁² + b₁²) where k = a₁/a₂ = b₁/b₂`,
                    `   k = ${fmt(a1v)}/${fmt(a2v)} = ${fmt(k)}`,
                    `   c₂·k = ${fmt(c2v)}·${fmt(k)} = ${fmt(c2v*k)}`,
                    `   |c₁ - c₂·k| = |${fmt(c1v)} - ${fmt(c2v*k)}| = ${Math.abs(c1v - c2v*k)}`,
                    `   √(a₁² + b₁²) = √(${fmt(a1v*a1v)} + ${fmt(b1v*b1v)}) = ${fmt(norm1)}`,
                    `⑤ d = ${Math.abs(c1v - c2v*k)} / ${fmt(norm1)} = ${fmt(distance)}`
                ];
                
                resultDiv.innerHTML = `\\( d = ${fmt(distance)} \\)<br><span style="font-size:0.9rem;">(Parallel lines distance)</span>`;
            } else {
                // Lines intersect
                // Find intersection point
                const xNum = b1v * c2v - b2v * c1v;
                const yNum = c1v * a2v - c2v * a1v;
                const x = xNum / det;
                const y = yNum / det;
                
                distance = 0;
                
                steps = [
                    `① Line L₁: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                    `② Line L₂: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                    `③ Check if lines are parallel: a₁b₂ - a₂b₁ = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)} = ${fmt(det)} ≠ 0`,
                    `   ✗ Lines are NOT parallel`,
                    `④ In 2D, non-parallel lines must INTERSECT at a point`,
                    `⑤ Find intersection point using Cramer's rule:`,
                    `   x = (b₁c₂ - b₂c₁)/Δ = (${fmt(b1v)}·${fmt(c2v)} - ${fmt(b2v)}·${fmt(c1v)})/${fmt(det)} = ${fmt(x)}`,
                    `   y = (c₁a₂ - c₂a₁)/Δ = (${fmt(c1v)}·${fmt(a2v)} - ${fmt(c2v)}·${fmt(a1v)})/${fmt(det)} = ${fmt(y)}`,
                    `   Intersection point P = (${fmt(x)}, ${fmt(y)})`,
                    `⑥ Since lines intersect, distance between them is 0 at the intersection point.`,
                    `⑦ In 3D geometry, SKEW LINES are lines that do not intersect and are not parallel.`,
                    `   This concept does NOT apply in 2D - all lines are either intersecting or parallel.`,
                    `   For skew lines in 3D, the shortest distance is along a line perpendicular to both.`
                ];
                
                resultDiv.innerHTML = `\\( \\text{Lines intersect at } (${fmt(x)}, ${fmt(y)}) \\)<br>` +
                    `\\( \\text{Distance} = 0 \\)<br>` +
                    `<span style="font-size:0.9rem;">(Not skew - intersecting lines)</span>`;
            }

            // Draw the lines
            const minX = -8, maxX = 8;
            
            function getLinePoints(a, b, constant) {
                if (Math.abs(b) > 1e-10) {
                    return [
                        {x: minX, y: (-a*minX - constant)/b},
                        {x: maxX, y: (-a*maxX - constant)/b}
                    ];
                } else {
                    const xConst = -constant/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            const ptsL1 = getLinePoints(a1v, b1v, c1v);
            const ptsL2 = getLinePoints(a2v, b2v, c2v);
            
            const lineSegments = [
                { from: ptsL1[0], to: ptsL1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 },
                { from: ptsL2[0], to: ptsL2[1], color: '#1f7f6a', dash: areParallel ? [] : [5,3], label: 'L₂', width: 2 }
            ];
            
            // Add perpendicular segment for parallel lines
            if (areParallel) {
                // Find a point on L1 and drop perpendicular to L2
                let pointOnL1;
                if (Math.abs(b1v) > 1e-10) {
                    pointOnL1 = {x: 0, y: -c1v/b1v};
                } else {
                    pointOnL1 = {x: -c1v/a1v, y: 0};
                }
                
                // Find foot on L2
                const t = (a2v*pointOnL1.x + b2v*pointOnL1.y + c2v) / (a2v*a2v + b2v*b2v);
                const footX = pointOnL1.x - a2v * t;
                const footY = pointOnL1.y - b2v * t;
                
                lineSegments.push({ 
                    from: pointOnL1, 
                    to: {x: footX, y: footY}, 
                    color: '#2b3595', 
                    dash: [5,3], 
                    label: 'Shortest distance', 
                    width: 2 
                });
            }
            
            // Add intersection point for intersecting lines
            const specialPoints = [];
            if (!areParallel) {
                const xNum = b1v * c2v - b2v * c1v;
                const yNum = c1v * a2v - c2v * a1v;
                const x = xNum / det;
                const y = yNum / det;
                specialPoints.push({x: x, y: y, label: 'P'});
            }

            drawGraph([], specialPoints, lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2]);
        }
    }

    // Example button handlers
    exParallel.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 2; b2.value = 3; c2.value = -4;
        update();
    });
    
    exIntersecting.addEventListener('click', () => {
        a1.value = 1; b1.value = 1; c1.value = -3;  // x + y = 3
        a2.value = 1; b2.value = -1; c2.value = -1; // x - y = 1
        update();
    });
    
    ex3D.addEventListener('click', () => {
        a1.value = 1; b1.value = 0; c1.value = 0;   // x = 0
        a2.value = 0; b2.value = 1; c2.value = -2;  // y = 2
        // In 3D, these would be skew if they had different z components
        update();
    });

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
}// ========= NEW: Length of Projection of a Segment on a Line =========
function renderProjectionLengthCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    
    // Activate this button
    const projectionLengthBtn = document.getElementById('projectionLengthBtn');
    projectionLengthBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏</span> Length of Projection of a Segment on a Line</h2>
        
        <div class="formula-badge">\\( \\text{Segment AB projected onto line L} \\)</div>
        <div class="formula-badge">\\( \\text{Projection length} = |\\vec{AB} \\cdot \\hat{u}| \\)</div>
        <div class="formula-badge">\\( \\hat{u} = \\text{unit vector along line L} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:800px; margin:0 auto;">
            <!-- Segment AB -->
            <div class="point-box" style="width:100%;">
                <label>Segment AB</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>Point A: x₁ = <input type="number" id="projAx" value="1" step="any" style="width:70px;"> y₁ = <input type="number" id="projAy" value="2" step="any" style="width:70px;"></div>
                    <div>Point B: x₂ = <input type="number" id="projBx" value="5" step="any" style="width:70px;"> y₂ = <input type="number" id="projBy" value="6" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Line L -->
            <div class="point-box" style="width:100%;">
                <label>Line L: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="projA" value="1" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="projB" value="1" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="projC" value="0" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="projEx1">Horizontal line (y=0)</button>
                <button class="mode-option" id="projEx2">Line y=x</button>
                <button class="mode-option" id="projEx3">Vertical line (x=0)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeProjectionBtn">
            <span>📏</span> Calculate Projection Length
        </button>
        
        <div class="result-highlight" id="projectionResult">
            \\( \\text{Projection length} = 5.6569 \\)
        </div>
        <div class="footnote">
            <strong>Projection formula:</strong> The projection of vector AB onto line L is the component of AB along the direction of L.<br>
            • Unit vector along L: \\(\\hat{u} = (\\cos \\theta, \\sin \\theta)\\) where slope = tan θ<br>
            • Projection length = |(x₂-x₁)cos θ + (y₂-y₁)sin θ|
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const ax = document.getElementById('projAx'), ay = document.getElementById('projAy');
    const bx = document.getElementById('projBx'), by = document.getElementById('projBy');
    const a = document.getElementById('projA'), b = document.getElementById('projB'), c = document.getElementById('projC');
    const compute = document.getElementById('computeProjectionBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('projectionResult');
    
    // Example buttons
    const ex1 = document.getElementById('projEx1');
    const ex2 = document.getElementById('projEx2');
    const ex3 = document.getElementById('projEx3');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const axv = validateNumber(ax.value, 'A x');
            const ayv = validateNumber(ay.value, 'A y');
            const bxv = validateNumber(bx.value, 'B x');
            const byv = validateNumber(by.value, 'B y');
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Vector AB
            const dx = bxv - axv;
            const dy = byv - ayv;
            
            // Direction vector of line L (perpendicular to normal (a,b))
            // Direction vector = (-b, a) or (b, -a) - either works
            const dirX = -bv;
            const dirY = av;
            
            // Normalize to unit vector
            const dirLength = Math.sqrt(dirX*dirX + dirY*dirY);
            const ux = dirX / dirLength;
            const uy = dirY / dirLength;
            
            // Projection length = |dx*ux + dy*uy|
            const projection = Math.abs(dx*ux + dy*uy);
            
            // Calculate angle of line
            const angleRad = Math.atan2(dirY, dirX);
            const angleDeg = angleRad * 180 / Math.PI;

            // Draw everything
            const minX = Math.min(axv, bxv) - 3;
            const maxX = Math.max(axv, bxv) + 3;
            const minY = Math.min(ayv, byv) - 3;
            const maxY = Math.max(ayv, byv) + 3;
            
            const rangeX = Math.max(Math.abs(minX), Math.abs(maxX), 5);
            const rangeY = Math.max(Math.abs(minY), Math.abs(maxY), 5);
            
            const graphMinX = -rangeX;
            const graphMaxX = rangeX;
            const graphMinY = -rangeY;
            const graphMaxY = rangeY;
            
            // Line L points
            let linePts;
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: graphMinX, y: (-av*graphMinX - cv)/bv},
                    {x: graphMaxX, y: (-av*graphMaxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: graphMinY},
                    {x: xConst, y: graphMaxY}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line L', width: 2 },
                { from: {x: axv, y: ayv}, to: {x: bxv, y: byv}, color: '#d44c2f', dash: [], label: 'Segment AB', width: 2 }
            ];
            
            // Draw projection as perpendicular lines to L
            // Project A onto L
            const tA = (av*axv + bv*ayv + cv) / (av*av + bv*bv);
            const projAx = axv - av * tA;
            const projAy = ayv - bv * tA;
            
            // Project B onto L
            const tB = (av*bxv + bv*byv + cv) / (av*av + bv*bv);
            const projBx = bxv - av * tB;
            const projBy = byv - bv * tB;
            
            // Draw projection lines
            lineSegments.push({ from: {x: axv, y: ayv}, to: {x: projAx, y: projAy}, color: '#1f7f6a', dash: [5,3], label: 'Projection A', width: 1.5 });
            lineSegments.push({ from: {x: bxv, y: byv}, to: {x: projBx, y: projBy}, color: '#1f7f6a', dash: [5,3], label: 'Projection B', width: 1.5 });
            
            // Draw the projected segment on L
            lineSegments.push({ from: {x: projAx, y: projAy}, to: {x: projBx, y: projBy}, color: '#ca8a04', dash: [], label: 'Projected segment', width: 2 });
            
            const specialPoints = [
                {x: axv, y: ayv, label: 'A'},
                {x: bxv, y: byv, label: 'B'},
                {x: projAx, y: projAy, label: 'A\''},
                {x: projBx, y: projBy, label: 'B\''}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Segment AB from A(${fmt(axv)},${fmt(ayv)}) to B(${fmt(bxv)},${fmt(byv)})`,
                `   Vector AB = (${fmt(dx)}, ${fmt(dy)})`,
                `② Line L: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0`,
                `   Direction vector of L = (${fmt(-bv)}, ${fmt(av)})`,
                `   Length of direction vector = √(${fmt(bv*bv)} + ${fmt(av*av)}) = ${fmt(dirLength)}`,
                `   Unit vector along L: \\(\\hat{u} = (${fmt(ux)}, ${fmt(uy)})\\)`,
                `   Angle of L with x-axis = ${fmt(angleDeg)}°`,
                `③ Projection formula: proj = |AB · \\(\\hat{u}\\)|`,
                `   = |${fmt(dx)}·${fmt(ux)} + ${fmt(dy)}·${fmt(uy)}|`,
                `   = |${fmt(dx*ux)} + ${fmt(dy*uy)}| = |${fmt(dx*ux + dy*uy)}| = ${fmt(projection)}`,
                `④ Projected points on L:`,
                `   A' = (${fmt(projAx)}, ${fmt(projAy)})`,
                `   B' = (${fmt(projBx)}, ${fmt(projBy)})`,
                `   Length of A'B' = √[(${fmt(projBx-projAx)})² + (${fmt(projBy-projAy)})²] = ${fmt(Math.sqrt((projBx-projAx)**2 + (projBy-projAy)**2))}`,
                `⑤ The projection length is ${fmt(projection)} units.`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Projection length} = ${fmt(projection)} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [ax, ay, bx, by, a, b, c]);
        }
    }

    // Example button handlers
    ex1.addEventListener('click', () => {
        ax.value = 1; ay.value = 2;
        bx.value = 5; by.value = 6;
        a.value = 0; b.value = 1; c.value = 0; // y = 0
        update();
    });
    
    ex2.addEventListener('click', () => {
        ax.value = 1; ay.value = 2;
        bx.value = 5; by.value = 6;
        a.value = 1; b.value = -1; c.value = 0; // y = x
        update();
    });
    
    ex3.addEventListener('click', () => {
        ax.value = 1; ay.value = 2;
        bx.value = 5; by.value = 6;
        a.value = 1; b.value = 0; c.value = 0; // x = 0
        update();
    });

    compute.addEventListener('click', update);
    [ax, ay, bx, by, a, b, c].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [ax, ay, bx, by, a, b, c].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Shortest Distance between Parallel Lines using Intercepts =========
function renderParallelLinesInterceptCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    if(projectionLengthBtn) projectionLengthBtn.classList.remove('active-btn');
    
    // Activate this button
    const parallelLinesInterceptBtn = document.getElementById('parallelLinesInterceptBtn');
    parallelLinesInterceptBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Shortest Distance between Parallel Lines (Using Intercepts)</h2>
        
        <div class="formula-badge">\\( \\text{Line 1: } \\frac{x}{a_1} + \\frac{y}{b_1} = 1 \\)</div>
        <div class="formula-badge">\\( \\text{Line 2: } \\frac{x}{a_2} + \\frac{y}{b_2} = 1 \\)</div>
        <div class="formula-badge">\\( \\text{For parallel lines: } \\frac{1}{a_1} = \\frac{1}{a_2} \\text{ and } \\frac{1}{b_1} = \\frac{1}{b_2} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 in intercept form -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: x/a₁ + y/b₁ = 1</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ (x-intercept) =</span> <input type="number" id="interceptA1" value="4" step="any" style="width:80px;"></div>
                    <div><span>b₁ (y-intercept) =</span> <input type="number" id="interceptB1" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 in intercept form -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: x/a₂ + y/b₂ = 1</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ (x-intercept) =</span> <input type="number" id="interceptA2" value="4" step="any" style="width:80px;"></div>
                    <div><span>b₂ (y-intercept) =</span> <input type="number" id="interceptB2" value="3" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="interceptExParallel">Parallel lines (different intercepts)</button>
                <button class="mode-option" id="interceptExNotParallel">Not parallel</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeInterceptDistanceBtn">
            <span>📐</span> Calculate Distance
        </button>
        
        <div class="result-highlight" id="interceptDistanceResult">
            \\( d = 2.4 \\)
        </div>
        <div class="footnote">
            <strong>Using intercepts for parallel lines:</strong><br>
            • For lines in intercept form, they are parallel if 1/a₁ = 1/a₂ and 1/b₁ = 1/b₂<br>
            • Convert to general form: (b₁)x + (a₁)y - a₁b₁ = 0<br>
            • Distance = |a₁b₁ - a₂b₂| / √(b₁² + a₁²) when slopes are equal
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('interceptA1'), b1 = document.getElementById('interceptB1');
    const a2 = document.getElementById('interceptA2'), b2 = document.getElementById('interceptB2');
    const compute = document.getElementById('computeInterceptDistanceBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('interceptDistanceResult');
    
    // Example buttons
    const exParallel = document.getElementById('interceptExParallel');
    const exNotParallel = document.getElementById('interceptExNotParallel');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a1v = validateNumber(a1.value, 'a₁');
            const b1v = validateNumber(b1.value, 'b₁');
            const a2v = validateNumber(a2.value, 'a₂');
            const b2v = validateNumber(b2.value, 'b₂');
            
            if (Math.abs(a1v) < 1e-10 || Math.abs(b1v) < 1e-10) {
                throw new Error('Line 1: Intercepts cannot be zero');
            }
            if (Math.abs(a2v) < 1e-10 || Math.abs(b2v) < 1e-10) {
                throw new Error('Line 2: Intercepts cannot be zero');
            }

            // Convert intercept form to general form: (b)x + (a)y - ab = 0
            // Line 1: b₁·x + a₁·y - a₁b₁ = 0
            // Line 2: b₂·x + a₂·y - a₂b₂ = 0
            
            // Check if lines are parallel: slopes must be equal
            // Slope of line in intercept form = -b/a
            const slope1 = -b1v / a1v;
            const slope2 = -b2v / a2v;
            
            const areParallel = Math.abs(slope1 - slope2) < 1e-10;
            
            let distance, steps;
            
            if (areParallel) {
                // For parallel lines, use distance formula
                // Need to make coefficients of x and y proportional
                // We can use line1 as reference and scale line2
                
                // Find scaling factor k such that (b2, a2) = k·(b1, a1)
                let k;
                if (Math.abs(b1v) > 1e-10) {
                    k = b2v / b1v;
                } else {
                    k = a2v / a1v;
                }
                
                // Distance = |c1 - c2/k| / √(b1² + a1²)
                // where c1 = -a1b1, c2 = -a2b2
                const c1 = -a1v * b1v;
                const c2 = -a2v * b2v;
                const scaledC2 = c2 / k;
                
                const denom = Math.sqrt(b1v*b1v + a1v*a1v);
                distance = Math.abs(c1 - scaledC2) / denom;
                
                steps = [
                    `① Line 1 in intercept form: x/${fmt(a1v)} + y/${fmt(b1v)} = 1`,
                    `   Convert to general form: multiply by ${fmt(a1v)}·${fmt(b1v)}:`,
                    `   ${fmt(b1v)}x + ${fmt(a1v)}y - ${fmt(a1v*b1v)} = 0`,
                    `② Line 2 in intercept form: x/${fmt(a2v)} + y/${fmt(b2v)} = 1`,
                    `   Convert to general form: ${fmt(b2v)}x + ${fmt(a2v)}y - ${fmt(a2v*b2v)} = 0`,
                    `③ Check if lines are parallel: compare slopes`,
                    `   Slope₁ = -b₁/a₁ = -${fmt(b1v)}/${fmt(a1v)} = ${fmt(slope1)}`,
                    `   Slope₂ = -b₂/a₂ = -${fmt(b2v)}/${fmt(a2v)} = ${fmt(slope2)}`,
                    `   ${Math.abs(slope1 - slope2) < 1e-10 ? '✓ Slopes are equal → lines are PARALLEL' : '✗ Slopes differ → lines are NOT parallel'}`,
                    `④ For parallel lines, find scaling factor k = b₂/b₁ = ${fmt(b2v)}/${fmt(b1v)} = ${fmt(k)}`,
                    `   Scale line2 to match coefficients: (${fmt(b2v/k)}x + ${fmt(a2v/k)}y - ${fmt(a2v*b2v/k)} = 0)`,
                    `   This should match: ${fmt(b1v)}x + ${fmt(a1v)}y - ${fmt(c1)} = 0`,
                    `⑤ Distance formula: d = |c₁ - c₂/k| / √(b₁² + a₁²)`,
                    `   = |${fmt(c1)} - (${fmt(c2)}/${fmt(k)})| / √(${fmt(b1v*b1v)} + ${fmt(a1v*a1v)})`,
                    `   = |${fmt(c1)} - ${fmt(c2/k)}| / √${fmt(b1v*b1v + a1v*a1v)}`,
                    `   = ${Math.abs(c1 - c2/k)} / ${fmt(denom)} = ${fmt(distance)}`
                ];
                
                resultDiv.innerHTML = `\\( d = ${fmt(distance)} \\)`;
            } else {
                steps = [
                    `① Line 1 in intercept form: x/${fmt(a1v)} + y/${fmt(b1v)} = 1`,
                    `   Slope₁ = -b₁/a₁ = -${fmt(b1v)}/${fmt(a1v)} = ${fmt(slope1)}`,
                    `② Line 2 in intercept form: x/${fmt(a2v)} + y/${fmt(b2v)} = 1`,
                    `   Slope₂ = -b₂/a₂ = -${fmt(b2v)}/${fmt(a2v)} = ${fmt(slope2)}`,
                    `③ Check parallelism: |slope₁ - slope₂| = |${fmt(slope1)} - ${fmt(slope2)}| = ${Math.abs(slope1 - slope2)}`,
                    `   Since slopes are different (${Math.abs(slope1 - slope2) > 1e-10 ? '≠ 0' : '≈ 0'}), lines are NOT parallel`,
                    `④ For non-parallel lines, they intersect at some point`,
                    `   Distance between intersecting lines is 0 at the intersection point`,
                    `   Therefore, shortest distance = 0 (they meet)`
                ];
                distance = 0;
                resultDiv.innerHTML = `\\( \\text{Lines intersect → distance} = 0 \\)`;
            }

            // Draw the lines
            const minX = -8, maxX = 8;
            
            function getLinePointsFromIntercept(aVal, bVal) {
                // From intercept form: x/a + y/b = 1 → y = b(1 - x/a)
                return [
                    {x: minX, y: bVal * (1 - minX/aVal)},
                    {x: maxX, y: bVal * (1 - maxX/aVal)}
                ];
            }
            
            const pts1 = getLinePointsFromIntercept(a1v, b1v);
            const pts2 = getLinePointsFromIntercept(a2v, b2v);
            
            const lineSegments = [
                { from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 },
                { from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: areParallel ? [] : [5,3], label: 'L₂', width: 2 }
            ];
            
            // Add perpendicular segment for parallel lines
            if (areParallel) {
                // Find a point on L1 and drop perpendicular to L2
                const pointOnL1 = {x: 0, y: b1v}; // y-intercept
                
                // Find foot on L2 using projection formula
                // L2 in general form: b2x + a2y - a2b2 = 0
                const a2gen = b2v;
                const b2gen = a2v;
                const c2gen = -a2v * b2v;
                
                const t = (a2gen*pointOnL1.x + b2gen*pointOnL1.y + c2gen) / (a2gen*a2gen + b2gen*b2gen);
                const footX = pointOnL1.x - a2gen * t;
                const footY = pointOnL1.y - b2gen * t;
                
                lineSegments.push({ 
                    from: pointOnL1, 
                    to: {x: footX, y: footY}, 
                    color: '#2b3595', 
                    dash: [5,3], 
                    label: 'Shortest distance', 
                    width: 2 
                });
            }

            drawGraph([], [], lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, a2, b2]);
        }
    }

    // Example button handlers
    exParallel.addEventListener('click', () => {
        a1.value = 4; b1.value = 3;
        a2.value = 4; b2.value = 3; // Same slope, different intercepts? Need different constants
        // For parallel but distinct lines in intercept form, we need different products a*b
        // Let's use: x/4 + y/3 = 1 and x/4 + y/3 = 2? But that's not intercept form
        // Better: Use lines with same slopes but different intercepts
        a1.value = 4; b1.value = 3;  // x/4 + y/3 = 1
        a2.value = 8; b2.value = 6;  // x/8 + y/6 = 1 (same slope -b/a = -3/4)
        update();
    });
    
    exNotParallel.addEventListener('click', () => {
        a1.value = 4; b1.value = 3;  // slope = -3/4
        a2.value = 3; b2.value = 4;  // slope = -4/3
        update();
    });

    compute.addEventListener('click', update);
    [a1, b1, a2, b2].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a1, b1, a2, b2].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Distance of a Line from Axes =========
function renderDistanceLineAxesCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    if(projectionLengthBtn) projectionLengthBtn.classList.remove('active-btn');
    if(parallelLinesInterceptBtn) parallelLinesInterceptBtn.classList.remove('active-btn');
    
    // Activate this button
    const distanceLineAxesBtn = document.getElementById('distanceLineAxesBtn');
    distanceLineAxesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📊</span> Distance of a Line from Axes</h2>
        
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Distance from X-axis} = \\frac{|c|}{\\sqrt{a^2 + b^2}} \\text{ when line is horizontal?} \\)</div>
        <div class="formula-badge">\\( \\text{Better: Distance from X-axis = |y-intercept|} \\text{ if line is not vertical} \\)</div>
        <div class="formula-badge">\\( \\text{Distance from Y-axis = |x-intercept|} \\text{ if line is not horizontal} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="distAxesA" value="3" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="distAxesB" value="4" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="distAxesC" value="12" step="any" style="width:80px;"></div>
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
        
        <button class="calculate-btn" id="computeDistAxesBtn">
            <span>📊</span> Calculate Distances
        </button>
        
        <div class="result-highlight" id="distAxesResult">
            \\( d_x = 4, \\quad d_y = 3 \\)
        </div>
        <div class="footnote">
            <strong>Distance of a line from coordinate axes:</strong><br>
            • Distance from X-axis = |y-intercept| (vertical distance to x-axis)<br>
            • Distance from Y-axis = |x-intercept| (horizontal distance to y-axis)<br>
            • For vertical lines (x = k): distance from Y-axis = |k|<br>
            • For horizontal lines (y = k): distance from X-axis = |k|
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a = document.getElementById('distAxesA'), b = document.getElementById('distAxesB'), c = document.getElementById('distAxesC');
    const compute = document.getElementById('computeDistAxesBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('distAxesResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate intercepts
            let xIntercept = null, yIntercept = null;
            let distFromXAxis, distFromYAxis;
            
            if (Math.abs(av) > 1e-10) {
                xIntercept = -cv / av;
                distFromYAxis = Math.abs(xIntercept);
            } else {
                distFromYAxis = Infinity; // Line is horizontal, parallel to Y-axis, distance undefined? Actually distance from Y-axis is infinite? No, horizontal lines have constant distance from Y-axis? Wait, horizontal lines (y = constant) are at varying distances from Y-axis depending on x. So distance from Y-axis is not defined for horizontal lines.
                distFromYAxis = Infinity;
            }
            
            if (Math.abs(bv) > 1e-10) {
                yIntercept = -cv / bv;
                distFromXAxis = Math.abs(yIntercept);
            } else {
                distFromXAxis = Infinity; // Vertical line, parallel to X-axis
            }

            // Draw the line and axes
            const minX = -8, maxX = 8;
            let linePts;
            
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: minX, y: (-av*minX - cv)/bv},
                    {x: maxX, y: (-av*maxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 },
                // X-axis
                { from: {x: minX, y: 0}, to: {x: maxX, y: 0}, color: '#64748B', dash: [2,2], label: 'X-axis', width: 1.5 },
                // Y-axis
                { from: {x: 0, y: minX}, to: {x: 0, y: maxX}, color: '#64748B', dash: [2,2], label: 'Y-axis', width: 1.5 }
            ];
            
            const specialPoints = [];
            if (xIntercept !== null) {
                specialPoints.push({x: xIntercept, y: 0, label: `(${fmt(xIntercept)},0)`});
            }
            if (yIntercept !== null) {
                specialPoints.push({x: 0, y: yIntercept, label: `(0,${fmt(yIntercept)})`});
            }

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0`,
                `② Find x-intercept (where y = 0):`,
                `   ${fmt(av)}x + ${fmt(bv)}·0 + ${fmt(cv)} = 0 → ${fmt(av)}x = ${fmt(-cv)}`,
                `   x = ${fmt(-cv)}/${fmt(av)} = ${fmt(xIntercept !== null ? xIntercept : 'undefined')}`,
                `   Distance from Y-axis = |x-intercept| = ${distFromYAxis === Infinity ? 'undefined (line is horizontal)' : fmt(distFromYAxis)}`,
                `③ Find y-intercept (where x = 0):`,
                `   ${fmt(av)}·0 + ${fmt(bv)}y + ${fmt(cv)} = 0 → ${fmt(bv)}y = ${fmt(-cv)}`,
                `   y = ${fmt(-cv)}/${fmt(bv)} = ${fmt(yIntercept !== null ? yIntercept : 'undefined')}`,
                `   Distance from X-axis = |y-intercept| = ${distFromXAxis === Infinity ? 'undefined (line is vertical)' : fmt(distFromXAxis)}`,
                `④ Interpretation:`,
                `   • Distance from X-axis is the vertical distance to the x-axis = |y-intercept|`,
                `   • Distance from Y-axis is the horizontal distance to the y-axis = |x-intercept|`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = '';
            if (distFromXAxis === Infinity && distFromYAxis === Infinity) {
                resultText = `\\( \\text{Line passes through origin} \\)`;
            } else if (distFromXAxis === Infinity) {
                resultText = `\\( d_y = ${fmt(distFromYAxis)} \\text{ (distance from Y-axis)} \\)<br>\\( \\text{Line is vertical, distance from X-axis undefined} \\)`;
            } else if (distFromYAxis === Infinity) {
                resultText = `\\( d_x = ${fmt(distFromXAxis)} \\text{ (distance from X-axis)} \\)<br>\\( \\text{Line is horizontal, distance from Y-axis undefined} \\)`;
            } else {
                resultText = `\\( d_x = ${fmt(distFromXAxis)}, \\quad d_y = ${fmt(distFromYAxis)} \\)`;
            }
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a, b, c]);
        }
    }

    compute.addEventListener('click', update);
    [a, b, c].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a, b, c].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Relative Position of a Point wrt a Line =========
function renderPointRelativePositionCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    if(projectionLengthBtn) projectionLengthBtn.classList.remove('active-btn');
    if(parallelLinesInterceptBtn) parallelLinesInterceptBtn.classList.remove('active-btn');
    if(distanceLineAxesBtn) distanceLineAxesBtn.classList.remove('active-btn');
    
    // Activate this button
    const pointRelativePositionBtn = document.getElementById('pointRelativePositionBtn');
    pointRelativePositionBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📍</span> Relative Position of a Point wrt a Line</h2>
        
        <div class="formula-badge">\\( \\text{Line L: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Point P: } (x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Evaluate } S = ax_1 + by_1 + c \\)</div>
        <div class="formula-badge">\\( \\text{• If } S = 0 \\text{ → Point lies ON the line} \\)</div>
        <div class="formula-badge">\\( \\text{• If } S > 0 \\text{ → Point lies on POSITIVE side} \\)</div>
        <div class="formula-badge">\\( \\text{• If } S < 0 \\text{ → Point lies on NEGATIVE side} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Line coefficients -->
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="relA" value="2" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="relB" value="3" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="relC" value="-6" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Point P -->
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="relX" value="2" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="relY" value="1" step="any"></div>
            </div>
        </div>

        <!-- Quick example buttons -->
        <div style="display:flex; gap:10px; justify-content:center; margin:20px 0; flex-wrap:wrap;">
            <button class="mode-option" id="relExOn">Point on line</button>
            <button class="mode-option" id="relExPositive">Point above/positive side</button>
            <button class="mode-option" id="relExNegative">Point below/negative side</button>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRelPositionBtn">
            <span>📍</span> Check Position
        </button>
        
        <div class="result-highlight" id="relPositionResult">
            \\( S = 2(2) + 3(1) - 6 = 1 > 0 \\)
        </div>
        <div class="footnote">
            <strong>Geometric interpretation:</strong> The sign of S indicates which side of the line the point lies on.<br>
            • For a line not passing through origin, S = 0 gives the line itself<br>
            • The sign changes when crossing the line<br>
            • The absolute value |S|/√(a²+b²) gives the perpendicular distance
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a = document.getElementById('relA'), b = document.getElementById('relB'), c = document.getElementById('relC');
    const x = document.getElementById('relX'), y = document.getElementById('relY');
    const compute = document.getElementById('computeRelPositionBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('relPositionResult');
    
    // Example buttons
    const exOn = document.getElementById('relExOn');
    const exPositive = document.getElementById('relExPositive');
    const exNegative = document.getElementById('relExNegative');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');
            const xv = validateNumber(x.value, 'x');
            const yv = validateNumber(y.value, 'y');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate S = ax + by + c
            const S = av*xv + bv*yv + cv;
            
            // Determine position
            let position;
            if (Math.abs(S) < 1e-10) {
                position = "ON the line";
            } else if (S > 0) {
                position = "on the POSITIVE side";
            } else {
                position = "on the NEGATIVE side";
            }

            // Draw the line and point
            const minX = Math.min(xv, -5) - 3;
            const maxX = Math.max(xv, 5) + 3;
            
            let linePts;
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: minX, y: (-av*minX - cv)/bv},
                    {x: maxX, y: (-av*maxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line L', width: 2 }
            ];
            
            const specialPoints = [{x: xv, y: yv, label: 'P'}];

            drawGraph([], specialPoints, lineSegments);

            // Calculate distance
            const norm = Math.sqrt(av*av + bv*bv);
            const distance = Math.abs(S) / norm;

            // Create steps
            const steps = [
                `① Line L: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0`,
                `② Point P: (${fmt(xv)}, ${fmt(yv)})`,
                `③ Evaluate S = ax₁ + by₁ + c:`,
                `   S = ${fmt(av)}·${fmt(xv)} + ${fmt(bv)}·${fmt(yv)} + ${fmt(cv)}`,
                `   S = ${fmt(av*xv)} + ${fmt(bv*yv)} + ${fmt(cv)} = ${fmt(S)}`,
                `④ Since S ${Math.abs(S) < 1e-10 ? '≈ 0' : (S > 0 ? '> 0' : '< 0')}, point P lies ${position}`,
                `⑤ Perpendicular distance from P to line = |S|/√(a²+b²)`,
                `   = |${fmt(S)}|/√(${fmt(av*av)} + ${fmt(bv*bv)}) = ${fmt(distance)}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( S = ${fmt(S)} \\)<br>\\( \\text{Point is } ${position} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a, b, c, x, y]);
        }
    }

    // Example button handlers
    exOn.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x.value = 3; y.value = 0;  // (3,0) lies on line
        update();
    });
    
    exPositive.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x.value = 4; y.value = 1;  // (4,1) gives S = 2·4 + 3·1 - 6 = 8+3-6 = 5 > 0
        update();
    });
    
    exNegative.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x.value = 1; y.value = 0;  // (1,0) gives S = 2·1 + 3·0 - 6 = 2-6 = -4 < 0
        update();
    });

    compute.addEventListener('click', update);
    [a, b, c, x, y].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a, b, c, x, y].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Points on Same or Opposite Sides of a Line =========
function renderPointsSameSideCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    if(projectionLengthBtn) projectionLengthBtn.classList.remove('active-btn');
    if(parallelLinesInterceptBtn) parallelLinesInterceptBtn.classList.remove('active-btn');
    if(distanceLineAxesBtn) distanceLineAxesBtn.classList.remove('active-btn');
    if(pointRelativePositionBtn) pointRelativePositionBtn.classList.remove('active-btn');
    
    // Activate this button
    const pointsSameSideBtn = document.getElementById('pointsSameSideBtn');
    pointsSameSideBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔄</span> Points on Same or Opposite Sides of a Line</h2>
        
        <div class="formula-badge">\\( \\text{Line L: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Points } P_1(x_1, y_1), P_2(x_2, y_2) \\)</div>
        <div class="formula-badge">\\( S_1 = ax_1 + by_1 + c, \\quad S_2 = ax_2 + by_2 + c \\)</div>
        <div class="formula-badge">\\( \\text{• Same side if } S_1 \\cdot S_2 > 0 \\)</div>
        <div class="formula-badge">\\( \\text{• Opposite sides if } S_1 \\cdot S_2 < 0 \\)</div>
        <div class="formula-badge">\\( \\text{• One or both on line if } S_1 \\cdot S_2 = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:800px; margin:0 auto;">
            <!-- Line coefficients -->
            <div class="point-box" style="width:100%;">
                <label>Line L: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="sideA" value="2" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="sideB" value="3" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="sideC" value="-6" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <!-- Point P1 -->
            <div class="point-box" style="width:100%;">
                <label>Point P₁</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>x₁ =</span> <input type="number" id="sideX1" value="4" step="any" style="width:80px;"></div>
                    <div><span>y₁ =</span> <input type="number" id="sideY1" value="1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Point P2 -->
            <div class="point-box" style="width:100%;">
                <label>Point P₂</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>x₂ =</span> <input type="number" id="sideX2" value="1" step="any" style="width:80px;"></div>
                    <div><span>y₂ =</span> <input type="number" id="sideY2" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="sideExSame">Same side</button>
                <button class="mode-option" id="sideExOpposite">Opposite sides</button>
                <button class="mode-option" id="sideExOnLine">One on line</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSideBtn">
            <span>🔄</span> Check Sides
        </button>
        
        <div class="result-highlight" id="sideResult">
            \\( S_1 \\cdot S_2 = 5 \\times (-4) = -20 < 0 \\)
        </div>
        <div class="footnote">
            <strong>Important concept:</strong> The product S₁·S₂ determines relative position:<br>
            • S₁·S₂ > 0 → Points on SAME side of the line<br>
            • S₁·S₂ < 0 → Points on OPPOSITE sides<br>
            • S₁·S₂ = 0 → At least one point lies ON the line<br>
            This is useful in geometry problems, triangle area sign, and convexity checks.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a = document.getElementById('sideA'), b = document.getElementById('sideB'), c = document.getElementById('sideC');
    const x1 = document.getElementById('sideX1'), y1 = document.getElementById('sideY1');
    const x2 = document.getElementById('sideX2'), y2 = document.getElementById('sideY2');
    const compute = document.getElementById('computeSideBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('sideResult');
    
    // Example buttons
    const exSame = document.getElementById('sideExSame');
    const exOpposite = document.getElementById('sideExOpposite');
    const exOnLine = document.getElementById('sideExOnLine');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');
            const x1v = validateNumber(x1.value, 'x₁');
            const y1v = validateNumber(y1.value, 'y₁');
            const x2v = validateNumber(x2.value, 'x₂');
            const y2v = validateNumber(y2.value, 'y₂');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate S1 and S2
            const S1 = av*x1v + bv*y1v + cv;
            const S2 = av*x2v + bv*y2v + cv;
            const product = S1 * S2;
            
            // Determine relationship
            let relationship;
            if (Math.abs(S1) < 1e-10 && Math.abs(S2) < 1e-10) {
                relationship = "BOTH points lie ON the line";
            } else if (Math.abs(S1) < 1e-10) {
                relationship = "P₁ lies ON the line, P₂ is " + (S2 > 0 ? "on positive side" : "on negative side");
            } else if (Math.abs(S2) < 1e-10) {
                relationship = "P₂ lies ON the line, P₁ is " + (S1 > 0 ? "on positive side" : "on negative side");
            } else if (product > 0) {
                relationship = "Points are on the SAME side of the line";
            } else if (product < 0) {
                relationship = "Points are on OPPOSITE sides of the line";
            } else {
                relationship = "One or both points lie ON the line";
            }

            // Draw the line and points
            const minX = Math.min(x1v, x2v, -5) - 3;
            const maxX = Math.max(x1v, x2v, 5) + 3;
            
            let linePts;
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: minX, y: (-av*minX - cv)/bv},
                    {x: maxX, y: (-av*maxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line L', width: 2 }
            ];
            
            const specialPoints = [
                {x: x1v, y: y1v, label: 'P₁'},
                {x: x2v, y: y2v, label: 'P₂'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line L: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0`,
                `② Point P₁: (${fmt(x1v)}, ${fmt(y1v)})`,
                `   S₁ = ${fmt(av)}·${fmt(x1v)} + ${fmt(bv)}·${fmt(y1v)} + ${fmt(cv)} = ${fmt(S1)}`,
                `③ Point P₂: (${fmt(x2v)}, ${fmt(y2v)})`,
                `   S₂ = ${fmt(av)}·${fmt(x2v)} + ${fmt(bv)}·${fmt(y2v)} + ${fmt(cv)} = ${fmt(S2)}`,
                `④ Product S₁·S₂ = ${fmt(S1)} × ${fmt(S2)} = ${fmt(product)}`,
                `⑤ Since product ${Math.abs(product) < 1e-10 ? '≈ 0' : (product > 0 ? '> 0' : '< 0')},`,
                `   ${relationship}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( S_1 = ${fmt(S1)}, \\quad S_2 = ${fmt(S2)} \\)<br>\\( S_1 \\cdot S_2 = ${fmt(product)} \\)<br>${relationship}`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a, b, c, x1, y1, x2, y2]);
        }
    }

    // Example button handlers
    exSame.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x1.value = 4; y1.value = 1;  // S₁ = 2·4 + 3·1 - 6 = 8+3-6 = 5 > 0
        x2.value = 5; y2.value = 2;  // S₂ = 2·5 + 3·2 - 6 = 10+6-6 = 10 > 0
        update();
    });
    
    exOpposite.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x1.value = 4; y1.value = 1;  // S₁ = 5 > 0
        x2.value = 1; y2.value = 0;  // S₂ = 2·1 + 3·0 - 6 = 2-6 = -4 < 0
        update();
    });
    
    exOnLine.addEventListener('click', () => {
        a.value = 2; b.value = 3; c.value = -6;  // 2x + 3y = 6
        x1.value = 3; y1.value = 0;  // (3,0) lies on line → S₁ = 0
        x2.value = 4; y2.value = 1;  // S₂ = 5 > 0
        update();
    });

    compute.addEventListener('click', update);
    [a, b, c, x1, y1, x2, y2].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a, b, c, x1, y1, x2, y2].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Area Applications with Distances =========
function renderAreaApplicationsCard() {
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
    
    // Deactivate other distance buttons
    if(distanceOriginToLineBtn) distanceOriginToLineBtn.classList.remove('active-btn');
    if(perpendicularDistanceBtn) perpendicularDistanceBtn.classList.remove('active-btn');
    if(equidistantPointsBtn) equidistantPointsBtn.classList.remove('active-btn');
    if(skewLinesBtn) skewLinesBtn.classList.remove('active-btn');
    if(projectionLengthBtn) projectionLengthBtn.classList.remove('active-btn');
    if(parallelLinesInterceptBtn) parallelLinesInterceptBtn.classList.remove('active-btn');
    if(distanceLineAxesBtn) distanceLineAxesBtn.classList.remove('active-btn');
    if(pointRelativePositionBtn) pointRelativePositionBtn.classList.remove('active-btn');
    if(pointsSameSideBtn) pointsSameSideBtn.classList.remove('active-btn');
    
    // Activate this button
    const areaApplicationsBtn = document.getElementById('areaApplicationsBtn');
    areaApplicationsBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Area Applications with Distances</h2>
        
        <div class="formula-badge">\\( \\text{Area of triangle = } \\frac{1}{2} \\times \\text{base} \\times \\text{height} \\)</div>
        <div class="formula-badge">\\( \\text{Height = perpendicular distance from vertex to base line} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:800px; margin:0 auto;">
            <!-- Triangle vertices -->
            <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                <div class="point-box" style="flex:1;">
                    <label>Vertex A</label>
                    <div class="coord-input"><span>x₁ =</span><input type="number" id="areaAppAx" value="1" step="any"></div>
                    <div class="coord-input"><span>y₁ =</span><input type="number" id="areaAppAy" value="1" step="any"></div>
                </div>
                <div class="point-box" style="flex:1;">
                    <label>Vertex B</label>
                    <div class="coord-input"><span>x₂ =</span><input type="number" id="areaAppBx" value="5" step="any"></div>
                    <div class="coord-input"><span>y₂ =</span><input type="number" id="areaAppBy" value="1" step="any"></div>
                </div>
                <div class="point-box" style="flex:1;">
                    <label>Vertex C</label>
                    <div class="coord-input"><span>x₃ =</span><input type="number" id="areaAppCx" value="3" step="any"></div>
                    <div class="coord-input"><span>y₃ =</span><input type="number" id="areaAppCy" value="5" step="any"></div>
                </div>
            </div>
            
            <!-- Base selection -->
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Use as base:</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <label><input type="radio" name="baseOption" value="AB" checked> Side AB</label>
                    <label><input type="radio" name="baseOption" value="BC"> Side BC</label>
                    <label><input type="radio" name="baseOption" value="CA"> Side CA</label>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="areaExRight">Right triangle</button>
                <button class="mode-option" id="areaExEquilateral">Equilateral approx</button>
                <button class="mode-option" id="areaExIsosceles">Isosceles</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeAreaAppBtn">
            <span>📐</span> Calculate Area using Base & Height
        </button>
        
        <div class="result-highlight" id="areaAppResult">
            \\( \\text{Area} = 8 \\)
        </div>
        <div class="footnote">
            <strong>Area = ½ × base × height</strong><br>
            • Base length = distance between two vertices<br>
            • Height = perpendicular distance from third vertex to the line containing the base<br>
            • This method is useful when coordinates are known and we want to use distance formula<br>
            • Verify using determinant formula: Area = ½|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const ax = document.getElementById('areaAppAx'), ay = document.getElementById('areaAppAy');
    const bx = document.getElementById('areaAppBx'), by = document.getElementById('areaAppBy');
    const cx = document.getElementById('areaAppCx'), cy = document.getElementById('areaAppCy');
    const compute = document.getElementById('computeAreaAppBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('areaAppResult');
    
    // Example buttons
    const exRight = document.getElementById('areaExRight');
    const exEquilateral = document.getElementById('areaExEquilateral');
    const exIsosceles = document.getElementById('areaExIsosceles');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const axv = validateNumber(ax.value, 'A x');
            const ayv = validateNumber(ay.value, 'A y');
            const bxv = validateNumber(bx.value, 'B x');
            const byv = validateNumber(by.value, 'B y');
            const cxv = validateNumber(cx.value, 'C x');
            const cyv = validateNumber(cy.value, 'C y');

            // Get selected base
            const radios = document.getElementsByName('baseOption');
            let baseChoice = 'AB';
            for (let radio of radios) {
                if (radio.checked) {
                    baseChoice = radio.value;
                    break;
                }
            }
            
            // Define base vertices and opposite vertex
            let x1, y1, x2, y2, x3, y3, baseName, oppositeName;
            
            if (baseChoice === 'AB') {
                x1 = axv; y1 = ayv;
                x2 = bxv; y2 = byv;
                x3 = cxv; y3 = cyv;
                baseName = 'AB';
                oppositeName = 'C';
            } else if (baseChoice === 'BC') {
                x1 = bxv; y1 = byv;
                x2 = cxv; y2 = cyv;
                x3 = axv; y3 = ayv;
                baseName = 'BC';
                oppositeName = 'A';
            } else {
                x1 = cxv; y1 = cyv;
                x2 = axv; y2 = ayv;
                x3 = bxv; y3 = byv;
                baseName = 'CA';
                oppositeName = 'B';
            }
            
            // Calculate base length
            const baseLength = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
            
            // Calculate line equation for base (ax + by + c = 0)
            // Using two-point form: (y2 - y1)x - (x2 - x1)y + (x2y1 - x1y2) = 0
            const aBase = y2 - y1;
            const bBase = -(x2 - x1);
            const cBase = x2*y1 - x1*y2;
            
            // Calculate distance from opposite vertex to base line
            const numerator = Math.abs(aBase*x3 + bBase*y3 + cBase);
            const denominator = Math.sqrt(aBase*aBase + bBase*bBase);
            const height = numerator / denominator;
            
            // Calculate area
            const area = 0.5 * baseLength * height;
            
            // Verify using determinant formula
            const detArea = 0.5 * Math.abs(
                axv*(byv - cyv) + bxv*(cyv - ayv) + cxv*(ayv - byv)
            );

            // Draw triangle and height
            const minX = Math.min(axv, bxv, cxv) - 2;
            const maxX = Math.max(axv, bxv, cxv) + 2;
            const minY = Math.min(ayv, byv, cyv) - 2;
            const maxY = Math.max(ayv, byv, cyv) + 2;
            
            // Triangle edges
            const lineSegments = [
                { from: {x: axv, y: ayv}, to: {x: bxv, y: byv}, color: '#2c3e50', dash: [], label: 'AB', width: 2 },
                { from: {x: bxv, y: byv}, to: {x: cxv, y: cyv}, color: '#2c3e50', dash: [], label: 'BC', width: 2 },
                { from: {x: cxv, y: cyv}, to: {x: axv, y: ayv}, color: '#2c3e50', dash: [], label: 'CA', width: 2 }
            ];
            
            // Highlight selected base
            if (baseChoice === 'AB') {
                lineSegments.push({ from: {x: axv, y: ayv}, to: {x: bxv, y: byv}, color: '#d44c2f', dash: [8,4], label: 'Base AB', width: 3 });
            } else if (baseChoice === 'BC') {
                lineSegments.push({ from: {x: bxv, y: byv}, to: {x: cxv, y: cyv}, color: '#d44c2f', dash: [8,4], label: 'Base BC', width: 3 });
            } else {
                lineSegments.push({ from: {x: cxv, y: cyv}, to: {x: axv, y: axv}, color: '#d44c2f', dash: [8,4], label: 'Base CA', width: 3 });
            }
            
            // Find foot of perpendicular from opposite vertex to base line
            const t = (aBase*x3 + bBase*y3 + cBase) / (aBase*aBase + bBase*bBase);
            const footX = x3 - aBase * t;
            const footY = y3 - bBase * t;
            
            // Draw height
            lineSegments.push({ 
                from: {x: x3, y: y3}, 
                to: {x: footX, y: footY}, 
                color: '#1f7f6a', 
                dash: [5,3], 
                label: 'Height', 
                width: 2 
            });
            
            const specialPoints = [
                {x: axv, y: ayv, label: 'A'},
                {x: bxv, y: byv, label: 'B'},
                {x: cxv, y: cyv, label: 'C'},
                {x: footX, y: footY, label: 'F'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Triangle vertices: A(${fmt(axv)},${fmt(ayv)}), B(${fmt(bxv)},${fmt(byv)}), C(${fmt(cxv)},${fmt(cyv)})`,
                `② Using ${baseName} as base, opposite vertex = ${oppositeName}`,
                `③ Base length = distance between ${baseName[0]} and ${baseName[1]}:`,
                `   d = √[(${fmt(x2)} - ${fmt(x1)})² + (${fmt(y2)} - ${fmt(y1)})²]`,
                `   d = √[(${fmt(x2-x1)})² + (${fmt(y2-y1)})²] = √[${fmt((x2-x1)**2)} + ${fmt((y2-y1)**2)}] = √${fmt((x2-x1)**2 + (y2-y1)**2)} = ${fmt(baseLength)}`,
                `④ Equation of line containing base ${baseName}:`,
                `   Using two-point form: (y₂ - y₁)x - (x₂ - x₁)y + (x₂y₁ - x₁y₂) = 0`,
                `   → ${fmt(aBase)}x ${bBase >= 0 ? '+' : '-'} ${Math.abs(fmt(bBase))}y ${cBase >= 0 ? '+' : '-'} ${Math.abs(fmt(cBase))} = 0`,
                `⑤ Height = perpendicular distance from ${oppositeName}(${fmt(x3)},${fmt(y3)}) to this line:`,
                `   h = |${fmt(aBase)}·${fmt(x3)} + ${fmt(bBase)}·${fmt(y3)} + ${fmt(cBase)}| / √(${fmt(aBase*aBase)} + ${fmt(bBase*bBase)})`,
                `   = |${fmt(aBase*x3 + bBase*y3 + cBase)}| / √${fmt(aBase*aBase + bBase*bBase)} = ${fmt(height)}`,
                `⑥ Area = ½ × base × height = ½ × ${fmt(baseLength)} × ${fmt(height)} = ${fmt(area)}`,
                `⑦ Verification using determinant formula:`,
                `   Area = ½|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|`,
                `   = ½|${fmt(axv)}(${fmt(byv)}-${fmt(cyv)}) + ${fmt(bxv)}(${fmt(cyv)}-${fmt(ayv)}) + ${fmt(cxv)}(${fmt(ayv)}-${fmt(byv)})|`,
                `   = ½|${fmt(axv*(byv-cyv) + bxv*(cyv-ayv) + cxv*(ayv-byv))}| = ${fmt(detArea)}`,
                `   ✓ ${Math.abs(area - detArea) < 1e-10 ? 'Matches' : 'Check calculation'}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Area} = ${fmt(area)} \\)<br>` +
                `\\( \\text{Base } ${baseName} = ${fmt(baseLength)}, \\text{ Height} = ${fmt(height)} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [ax, ay, bx, by, cx, cy]);
        }
    }

    // Example button handlers
    exRight.addEventListener('click', () => {
        ax.value = 1; ay.value = 1;
        bx.value = 5; by.value = 1;  // horizontal base
        cx.value = 1; cy.value = 5;  // vertical side → right angle at A
        update();
    });
    
    exEquilateral.addEventListener('click', () => {
        ax.value = 0; ay.value = 0;
        bx.value = 4; by.value = 0;
        cx.value = 2; cy.value = 3.464;  // ≈ 2√3
        update();
    });
    
    exIsosceles.addEventListener('click', () => {
        ax.value = 0; ay.value = 0;
        bx.value = 6; by.value = 0;
        cx.value = 3; cy.value = 4;
        update();
    });

    compute.addEventListener('click', update);
    [ax, ay, bx, by, cx, cy].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [ax, ay, bx, by, cx, cy].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // Add change listeners to radio buttons
    const radios = document.getElementsByName('baseOption');
    for (let radio of radios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Origin Side vs Non-Origin Side =========
function renderOriginSideCard() {
    // Deactivate all other buttons
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    // ... deactivate other buttons ...
    
    // Activate this button
    originSideBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔵</span> Origin Side vs Non-Origin Side</h2>
        
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Point P: } (x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Compare signs: } (ax_1 + by_1 + c) \\text{ and } c \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="originSideA" value="2" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="originSideB" value="3" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="originSideC" value="-6" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="originSideX" value="4" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="originSideY" value="1" step="any"></div>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeOriginSideBtn">
            <span>🔵</span> Compare Sides
        </button>
        
        <div class="result-highlight" id="originSideResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Origin Side vs Non-Origin Side:</strong><br>
            • Evaluate S = ax₁ + by₁ + c for point P<br>
            • Compare sign of S with sign of c (origin side)<br>
            • If S and c have same sign → P and origin are on SAME side<br>
            • If S and c have opposite signs → P and origin are on OPPOSITE sides<br>
            • If c = 0, origin lies on the line
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a = document.getElementById('originSideA'), b = document.getElementById('originSideB'), c = document.getElementById('originSideC');
    const x = document.getElementById('originSideX'), y = document.getElementById('originSideY');
    const compute = document.getElementById('computeOriginSideBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('originSideResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');
            const xv = validateNumber(x.value, 'x');
            const yv = validateNumber(y.value, 'y');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate S for point P
            const S = av*xv + bv*yv + cv;
            
            // Determine relationship
            let relationship;
            let comparison;
            
            if (Math.abs(cv) < 1e-10) {
                comparison = "Origin lies ON the line";
                if (Math.abs(S) < 1e-10) {
                    relationship = "Point P also lies ON the line";
                } else {
                    relationship = `Point P is on ${S > 0 ? 'POSITIVE' : 'NEGATIVE'} side of the line`;
                }
            } else {
                const originSide = cv > 0 ? 'POSITIVE' : 'NEGATIVE';
                
                if (Math.abs(S) < 1e-10) {
                    relationship = `Point P lies ON the line (origin is on ${originSide} side)`;
                } else {
                    const pointSide = S > 0 ? 'POSITIVE' : 'NEGATIVE';
                    
                    if ((S > 0 && cv > 0) || (S < 0 && cv < 0)) {
                        relationship = `Point P and origin are on the SAME side (${originSide})`;
                    } else {
                        relationship = `Point P and origin are on OPPOSITE sides (origin: ${originSide}, point: ${pointSide})`;
                    }
                }
            }

            // Draw the line and point
            const minX = Math.min(xv, -5) - 3;
            const maxX = Math.max(xv, 5) + 3;
            
            let linePts;
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: minX, y: (-av*minX - cv)/bv},
                    {x: maxX, y: (-av*maxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 },
                { from: {x: 0, y: 0}, to: {x: 0, y: 0}, color: '#d44c2f', dash: [], label: 'Origin', width: 2 }
            ];
            
            const specialPoints = [
                {x: 0, y: 0, label: 'O'},
                {x: xv, y: yv, label: 'P'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Line L: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0`,
                `② Origin O(0,0): S₀ = a·0 + b·0 + c = ${fmt(cv)}`,
                `   Origin lies on ${Math.abs(cv) < 1e-10 ? 'the line' : (cv > 0 ? 'POSITIVE side' : 'NEGATIVE side')}`,
                `③ Point P(${fmt(xv)}, ${fmt(yv)}): S = ${fmt(av)}·${fmt(xv)} + ${fmt(bv)}·${fmt(yv)} + ${fmt(cv)} = ${fmt(S)}`,
                `   Point lies on ${Math.abs(S) < 1e-10 ? 'the line' : (S > 0 ? 'POSITIVE side' : 'NEGATIVE side')}`,
                `④ ${relationship}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( S_0 = ${fmt(cv)} \\)<br>\\( S = ${fmt(S)} \\)<br>${relationship}`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a, b, c, x, y]);
        }
    }

    compute.addEventListener('click', update);
    [a, b, c, x, y].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a, b, c, x, y].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Distance between a Line and a Curve (Minimal) =========
function renderLineCurveDistanceCard() {
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
    lineCurveDistanceBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📈📐</span> Distance between a Line and a Curve (Minimal)</h2>
        
        <div class="formula-badge">\\( \\text{Line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Curve: } y = f(x) \\)</div>
        <div class="formula-badge">\\( \\text{Minimal distance occurs where tangent is parallel to line} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="lcA" value="1" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="lcB" value="-1" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="lcC" value="0" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%;">
                <label>Curve Type</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <label><input type="radio" name="curveType" value="parabola" checked> Parabola y = x²</label>
                    <label><input type="radio" name="curveType" value="circle"> Circle x² + y² = r²</label>
                    <label><input type="radio" name="curveType" value="exponential"> Exponential y = eˣ</label>
                </div>
            </div>
            
            <div class="point-box" id="curveParams" style="width:100%;">
                <label>Curve Parameters</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div id="param1">r = <input type="number" id="curveParam" value="1" step="any" style="width:80px;"></div>
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
        
        <button class="calculate-btn" id="computeLineCurveBtn">
            <span>📐</span> Find Minimal Distance
        </button>
        
        <div class="result-highlight" id="lineCurveResult">
            \\( \\text{Minimal distance} = ? \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> Find point on curve where slope equals slope of line (tangent parallel to line).<br>
            Then calculate perpendicular distance from that point to the line.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a = document.getElementById('lcA'), b = document.getElementById('lcB'), c = document.getElementById('lcC');
    const compute = document.getElementById('computeLineCurveBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('lineCurveResult');
    const curveRadios = document.getElementsByName('curveType');
    const curveParamDiv = document.getElementById('curveParams');

    function updateCurveParams() {
        let curveType = 'parabola';
        for (let radio of curveRadios) {
            if (radio.checked) {
                curveType = radio.value;
                break;
            }
        }
        
        if (curveType === 'parabola') {
            curveParamDiv.innerHTML = `
                <label>Curve Parameters</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>y = x² (no parameters)</div>
                </div>
            `;
        } else if (curveType === 'circle') {
            curveParamDiv.innerHTML = `
                <label>Circle Parameters</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>r = <input type="number" id="curveParam" value="1" step="any" style="width:80px;"></div>
                </div>
            `;
        } else {
            curveParamDiv.innerHTML = `
                <label>Exponential Parameters</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div>y = eˣ (no parameters)</div>
                </div>
            `;
        }
    }

    for (let radio of curveRadios) {
        radio.addEventListener('change', updateCurveParams);
    }

    function update() {
        clearErrors();
        
        try {
            const av = validateNumber(a.value, 'a');
            const bv = validateNumber(b.value, 'b');
            const cv = validateNumber(c.value, 'c');

            if (Math.abs(av) < 1e-10 && Math.abs(bv) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Get curve type
            let curveType = 'parabola';
            for (let radio of curveRadios) {
                if (radio.checked) {
                    curveType = radio.value;
                    break;
                }
            }

            // Get curve parameter
            let param = 1;
            const paramInput = document.getElementById('curveParam');
            if (paramInput) {
                param = validateNumber(paramInput.value, 'parameter');
            }

            // Line slope
            const lineSlope = -av / bv;
            
            // Find point on curve where slope equals line slope
            let pointX, pointY;
            let steps = [];
            
            if (curveType === 'parabola') {
                // y = x², slope = 2x
                pointX = lineSlope / 2;
                pointY = pointX * pointX;
                
                steps = [
                    `① Line: ${fmt(av)}x + ${fmt(bv)}y + ${fmt(cv)} = 0, slope m = ${fmt(lineSlope)}`,
                    `② Curve: y = x², slope = 2x`,
                    `③ Set slopes equal: 2x = ${fmt(lineSlope)} → x = ${fmt(pointX)}`,
                    `④ Point on curve: (${fmt(pointX)}, ${fmt(pointY)})`,
                ];
            } else if (curveType === 'circle') {
                // Circle: x² + y² = r², implicit differentiation: 2x + 2y·y' = 0 → y' = -x/y
                // Need to solve -x/y = lineSlope and x² + y² = r²
                // This gives two points (top and bottom)
                const r = param;
                
                if (Math.abs(lineSlope) < 1e-10) {
                    // Horizontal line → points at (0, ±r)
                    pointX = 0;
                    pointY = r;
                    steps = [
                        `① Line: slope ≈ 0 (horizontal)`,
                        `② Circle: x² + y² = ${fmt(r)}²`,
                        `③ Points with horizontal tangent: (0, ${fmt(r)}) and (0, -${fmt(r)})`,
                    ];
                } else {
                    // Solve: y = -x/lineSlope, substitute into x² + y² = r²
                    const slopeSq = lineSlope * lineSlope;
                    pointX = Math.sqrt(r*r / (1 + 1/slopeSq));
                    pointY = -pointX / lineSlope;
                    
                    steps = [
                        `① Line: slope m = ${fmt(lineSlope)}`,
                        `② Circle: x² + y² = ${fmt(r)}²`,
                        `③ Condition for parallel tangent: dy/dx = -x/y = m → y = -x/m`,
                        `④ Substitute: x² + x²/m² = r² → x²(1 + 1/m²) = r²`,
                        `⑤ x = ±${fmt(pointX)}, corresponding y = ∓${fmt(pointX)}/${fmt(lineSlope)} = ${fmt(pointY)}`,
                    ];
                }
            } else {
                // Exponential: y = eˣ, slope = eˣ
                pointX = Math.log(Math.abs(lineSlope));
                pointY = Math.exp(pointX);
                
                steps = [
                    `① Line: slope m = ${fmt(lineSlope)}`,
                    `② Curve: y = eˣ, slope = eˣ`,
                    `③ Set slopes equal: eˣ = ${fmt(lineSlope)} → x = ln(${fmt(lineSlope)}) = ${fmt(pointX)}`,
                    `④ Point on curve: (${fmt(pointX)}, ${fmt(pointY)})`,
                ];
            }

            // Calculate distance from point to line
            const numerator = Math.abs(av*pointX + bv*pointY + cv);
            const denominator = Math.sqrt(av*av + bv*bv);
            const distance = numerator / denominator;

            // Draw line and curve
            const minX = -5, maxX = 5;
            
            // Line points
            let linePts;
            if (Math.abs(bv) > 1e-10) {
                linePts = [
                    {x: minX, y: (-av*minX - cv)/bv},
                    {x: maxX, y: (-av*maxX - cv)/bv}
                ];
            } else {
                const xConst = -cv/av;
                linePts = [
                    {x: xConst, y: minX},
                    {x: xConst, y: maxX}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 }
            ];
            
            // Generate curve points
            const curvePoints = [];
            for (let x = minX; x <= maxX; x += 0.1) {
                if (curveType === 'parabola') {
                    curvePoints.push({x: x, y: x*x});
                } else if (curveType === 'circle') {
                    const r = param;
                    if (Math.abs(x) <= r) {
                        const y = Math.sqrt(r*r - x*x);
                        curvePoints.push({x: x, y: y});
                    }
                } else {
                    curvePoints.push({x: x, y: Math.exp(x)});
                }
            }
            
            // Add curve as a dataset
            const datasets = [
                {
                    label: 'Curve',
                    data: curvePoints,
                    backgroundColor: 'transparent',
                    borderColor: '#1f7f6a',
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                }
            ];
            
            // Add line
            datasets.push({
                label: 'Line',
                data: [linePts[0], linePts[1]],
                backgroundColor: 'transparent',
                borderColor: '#2c3e50',
                borderWidth: 2,
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            
            // Add point of minimal distance
            datasets.push({
                label: 'Closest point',
                data: [{x: pointX, y: pointY}],
                backgroundColor: '#d44c2f',
                pointRadius: 8,
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 2
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
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: { type: 'linear', position: 'bottom', min: minX, max: maxX },
                        y: { type: 'linear', min: -5, max: 10 }
                    }
                }
            });

            steps.push(`⑤ Distance from point to line: d = |${fmt(av)}·${fmt(pointX)} + ${fmt(bv)}·${fmt(pointY)} + ${fmt(cv)}| / √(${fmt(av*av)} + ${fmt(bv*bv)})`);
            steps.push(`   = ${fmt(numerator)} / ${fmt(denominator)} = ${fmt(distance)}`);
            steps.push(`⑥ Minimal distance between line and curve = ${fmt(distance)}`);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{Minimal distance} = ${fmt(distance)} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a, b, c]);
        }
    }

    compute.addEventListener('click', update);
    [a, b, c].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [a, b, c].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    updateCurveParams();
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Using Distance Formula for Rectangle/Square Problems =========
function renderRectangleSquareCard() {
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
    rectangleSquareBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⬛</span> Rectangle/Square Problems using Distance Formula</h2>
        
        <div class="formula-badge">\\( \\text{Given three vertices, find the fourth vertex of a rectangle} \\)</div>
        <div class="formula-badge">\\( \\text{Conditions: Opposite sides parallel and equal, diagonals bisect each other} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box"><label>Vertex A</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="rectAx" value="1" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="rectAy" value="1" step="any"></div>
            </div>
            <div class="point-box"><label>Vertex B</label>
                <div class="coord-input"><span>x₂ =</span><input type="number" id="rectBx" value="5" step="any"></div>
                <div class="coord-input"><span>y₂ =</span><input type="number" id="rectBy" value="1" step="any"></div>
            </div>
            <div class="point-box"><label>Vertex C</label>
                <div class="coord-input"><span>x₃ =</span><input type="number" id="rectCx" value="5" step="any"></div>
                <div class="coord-input"><span>y₃ =</span><input type="number" id="rectCy" value="4" step="any"></div>
            </div>
        </div>
        
        <div class="ratio-group">
            <div style="display:flex; gap:20px; justify-content:center;">
                <label><input type="radio" name="shapeType" value="rectangle" checked> Rectangle</label>
                <label><input type="radio" name="shapeType" value="square"> Square</label>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRectSquareBtn">
            <span>⬛</span> Find Fourth Vertex
        </button>
        
        <div class="result-highlight" id="rectSquareResult">
            \\( D = (1, 4) \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> In a rectangle, diagonals bisect each other. Midpoint of AC = Midpoint of BD.<br>
            For a square, all sides equal and diagonals equal.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const ax = document.getElementById('rectAx'), ay = document.getElementById('rectAy');
    const bx = document.getElementById('rectBx'), by = document.getElementById('rectBy');
    const cx = document.getElementById('rectCx'), cy = document.getElementById('rectCy');
    const compute = document.getElementById('computeRectSquareBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('rectSquareResult');
    const shapeRadios = document.getElementsByName('shapeType');

    function update() {
        clearErrors();
        
        try {
            const axv = validateNumber(ax.value, 'A x');
            const ayv = validateNumber(ay.value, 'A y');
            const bxv = validateNumber(bx.value, 'B x');
            const byv = validateNumber(by.value, 'B y');
            const cxv = validateNumber(cx.value, 'C x');
            const cyv = validateNumber(cy.value, 'C y');

            // Get shape type
            let shapeType = 'rectangle';
            for (let radio of shapeRadios) {
                if (radio.checked) {
                    shapeType = radio.value;
                    break;
                }
            }

            // Calculate midpoint of AC (diagonal)
            const midX = (axv + cxv) / 2;
            const midY = (ayv + cyv) / 2;
            
            // Fourth vertex D = 2*mid - B
            const dxv = 2 * midX - bxv;
            const dyv = 2 * midY - byv;

            // Calculate side lengths
            const AB = Math.sqrt((bxv-axv)**2 + (byv-ayv)**2);
            const BC = Math.sqrt((cxv-bxv)**2 + (cyv-byv)**2);
            const CD = Math.sqrt((dxv-cxv)**2 + (dyv-cyv)**2);
            const DA = Math.sqrt((axv-dxv)**2 + (ayv-dyv)**2);
            
            const diagAC = Math.sqrt((cxv-axv)**2 + (cyv-ayv)**2);
            const diagBD = Math.sqrt((dxv-bxv)**2 + (dyv-byv)**2);

            // Check if it's a square
            const isSquare = shapeType === 'square' && 
                Math.abs(AB - BC) < 1e-10 && 
                Math.abs(BC - CD) < 1e-10 && 
                Math.abs(CD - DA) < 1e-10;

            // Draw rectangle
            const points = [
                {x: axv, y: ayv},
                {x: bxv, y: byv},
                {x: cxv, y: cyv},
                {x: dxv, y: dyv}
            ];
            
            const lineSegments = [
                { from: {x: axv, y: ayv}, to: {x: bxv, y: byv}, color: '#2c3e50', dash: [], label: 'AB', width: 2 },
                { from: {x: bxv, y: byv}, to: {x: cxv, y: cyv}, color: '#2c3e50', dash: [], label: 'BC', width: 2 },
                { from: {x: cxv, y: cyv}, to: {x: dxv, y: dyv}, color: '#2c3e50', dash: [], label: 'CD', width: 2 },
                { from: {x: dxv, y: dyv}, to: {x: axv, y: ayv}, color: '#2c3e50', dash: [], label: 'DA', width: 2 },
                { from: {x: axv, y: ayv}, to: {x: cxv, y: cyv}, color: '#d44c2f', dash: [5,3], label: 'Diagonal AC', width: 2 },
                { from: {x: bxv, y: byv}, to: {x: dxv, y: dyv}, color: '#1f7f6a', dash: [5,3], label: 'Diagonal BD', width: 2 }
            ];
            
            const specialPoints = [
                {x: axv, y: ayv, label: 'A'},
                {x: bxv, y: byv, label: 'B'},
                {x: cxv, y: cyv, label: 'C'},
                {x: dxv, y: dyv, label: 'D'},
                {x: midX, y: midY, label: 'M'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Given three vertices of a ${shapeType}:`,
                `   A(${fmt(axv)},${fmt(ayv)}), B(${fmt(bxv)},${fmt(byv)}), C(${fmt(cxv)},${fmt(cyv)})`,
                `② In a rectangle, diagonals bisect each other`,
                `   Midpoint of AC = ((${fmt(axv)} + ${fmt(cxv)})/2, (${fmt(ayv)} + ${fmt(cyv)})/2)`,
                `   = (${fmt(midX)}, ${fmt(midY)})`,
                `③ This is also midpoint of BD, so D = 2M - B:`,
                `   x₄ = 2·${fmt(midX)} - ${fmt(bxv)} = ${fmt(dxv)}`,
                `   y₄ = 2·${fmt(midY)} - ${fmt(byv)} = ${fmt(dyv)}`,
                `④ Fourth vertex D = (${fmt(dxv)}, ${fmt(dyv)})`,
                `⑤ Side lengths:`,
                `   AB = ${fmt(AB)}, BC = ${fmt(BC)}, CD = ${fmt(CD)}, DA = ${fmt(DA)}`,
                `   Diagonal AC = ${fmt(diagAC)}, Diagonal BD = ${fmt(diagBD)}`,
                `⑥ ${shapeType === 'square' ? (isSquare ? '✓ This is a valid square' : '✗ This is not a square') : 'Rectangle properties verified'}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( D = (${fmt(dxv)}, ${fmt(dyv)}) \\)<br>` +
                `\\( \\text{Sides: } AB = ${fmt(AB)}, BC = ${fmt(BC)}, CD = ${fmt(CD)}, DA = ${fmt(DA)} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [ax, ay, bx, by, cx, cy]);
        }
    }

    compute.addEventListener('click', update);
    [ax, ay, bx, by, cx, cy].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [ax, ay, bx, by, cx, cy].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}