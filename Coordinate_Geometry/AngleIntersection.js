// NEW: Render function for Angle Between Two Lines
function renderAngleBetweenLinesCard() {
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
    
    // Deactivate equation form buttons if any are active
    if(slopeInterceptBtn) slopeInterceptBtn.classList.remove('active-btn');
    if(pointSlopeBtn) pointSlopeBtn.classList.remove('active-btn');
    if(twoPointBtn) twoPointBtn.classList.remove('active-btn');
    if(interceptFormBtn) interceptFormBtn.classList.remove('active-btn');
    if(normalFormBtn) normalFormBtn.classList.remove('active-btn');
    if(generalFormBtn) generalFormBtn.classList.remove('active-btn');
    if(parametricFormBtn) parametricFormBtn.classList.remove('active-btn');
    if(horizontalLineBtn) horizontalLineBtn.classList.remove('active-btn');
    if(verticalLineBtn) verticalLineBtn.classList.remove('active-btn');
    if(slopeFromGeneralBtn) slopeFromGeneralBtn.classList.remove('active-btn');
    if(xInterceptBtn) xInterceptBtn.classList.remove('active-btn');
    if(yInterceptBtn) yInterceptBtn.classList.remove('active-btn');
    if(symmetricFormBtn) symmetricFormBtn.classList.remove('active-btn');
    if(concurrencyBtn) concurrencyBtn.classList.remove('active-btn');
    if(familyLinesBtn) familyLinesBtn.classList.remove('active-btn');
    if(linearIndependenceBtn) linearIndependenceBtn.classList.remove('active-btn');
    
    // Activate the angle between lines button
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    angleBetweenLinesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Angle Between Two Lines</h2>
        
        <div class="formula-badge">\\( \\tan \\theta = \\left| \\frac{m_1 - m_2}{1 + m_1 m_2} \\right| \\)</div>
        <div class="formula-badge">\\( \\theta = \\text{angle between lines (acute)} \\)</div>
        
        <!-- Input method toggle -->
        <div style="margin: 20px 0;">
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <button class="mode-option selected" id="angleModeSlope">📈 By Slope</button>
                <button class="mode-option" id="angleModePoints">🔢 By Points</button>
                <button class="mode-option" id="angleModeEquation">📐 By Equation</button>
            </div>
        </div>
        
        <!-- Slope input mode (default) -->
        <div id="angleSlopeInput">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box" style="flex:1;">
                    <label>Line 1</label>
                    <div class="coord-input"><span>m₁ =</span><input type="number" id="angleM1" value="2" step="any"></div>
                </div>
                <div class="point-box" style="flex:1;">
                    <label>Line 2</label>
                    <div class="coord-input"><span>m₂ =</span><input type="number" id="angleM2" value="-1" step="any"></div>
                </div>
            </div>
        </div>
        
        <!-- Points input mode (hidden by default) -->
        <div id="anglePointsInput" style="display:none;">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box">
                    <label>Line 1 - Point A</label>
                    <div class="coord-input"><span>x₁ =</span><input type="number" id="angleP1X1" value="1" step="any"></div>
                    <div class="coord-input"><span>y₁ =</span><input type="number" id="angleP1Y1" value="2" step="any"></div>
                </div>
                <div class="point-box">
                    <label>Line 1 - Point B</label>
                    <div class="coord-input"><span>x₂ =</span><input type="number" id="angleP1X2" value="3" step="any"></div>
                    <div class="coord-input"><span>y₂ =</span><input type="number" id="angleP1Y2" value="4" step="any"></div>
                </div>
            </div>
            <div class="input-group" style="justify-content:center; margin-top:10px;">
                <div class="point-box">
                    <label>Line 2 - Point C</label>
                    <div class="coord-input"><span>x₃ =</span><input type="number" id="angleP2X1" value="2" step="any"></div>
                    <div class="coord-input"><span>y₃ =</span><input type="number" id="angleP2Y1" value="1" step="any"></div>
                </div>
                <div class="point-box">
                    <label>Line 2 - Point D</label>
                    <div class="coord-input"><span>x₄ =</span><input type="number" id="angleP2X2" value="5" step="any"></div>
                    <div class="coord-input"><span>y₄ =</span><input type="number" id="angleP2Y2" value="3" step="any"></div>
                </div>
            </div>
        </div>
        
        <!-- Equation input mode (hidden by default) -->
        <div id="angleEquationInput" style="display:none;">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box" style="flex:1;">
                    <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                    <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                        <div><span>a₁ =</span> <input type="number" id="angleA1" value="1" step="any" style="width:70px;"></div>
                        <div><span>b₁ =</span> <input type="number" id="angleB1" value="-1" step="any" style="width:70px;"></div>
                        <div><span>c₁ =</span> <input type="number" id="angleC1" value="0" step="any" style="width:70px;"></div>
                    </div>
                </div>
                <div class="point-box" style="flex:1;">
                    <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                    <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                        <div><span>a₂ =</span> <input type="number" id="angleA2" value="2" step="any" style="width:70px;"></div>
                        <div><span>b₂ =</span> <input type="number" id="angleB2" value="1" step="any" style="width:70px;"></div>
                        <div><span>c₂ =</span> <input type="number" id="angleC2" value="-3" step="any" style="width:70px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Result type toggle -->
        <div style="display:flex; gap:20px; justify-content:center; margin:20px 0;">
            <label class="mode-option selected" id="angleAcuteOpt"><input type="radio" name="angleType" value="acute" checked> 🔸 Acute angle</label>
            <label class="mode-option" id="angleObtuseOpt"><input type="radio" name="angleType" value="obtuse"> 🔹 Obtuse angle</label>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeAngleBtn">
            <span>📐</span> Calculate Angle
        </button>
        
        <div class="result-highlight" id="angleResult">
            \\( \\theta = 71.5651° \\)
        </div>
        <div class="footnote">
            <strong>Note:</strong> The formula gives the acute angle between lines. 
            For obtuse angle, subtract from 180°. If lines are perpendicular, θ = 90°.
            If lines are parallel, θ = 0°.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get mode elements
    const angleModeSlope = document.getElementById('angleModeSlope');
    const angleModePoints = document.getElementById('angleModePoints');
    const angleModeEquation = document.getElementById('angleModeEquation');
    const angleSlopeInput = document.getElementById('angleSlopeInput');
    const anglePointsInput = document.getElementById('anglePointsInput');
    const angleEquationInput = document.getElementById('angleEquationInput');
    
    // Get angle type options
    const angleAcuteOpt = document.getElementById('angleAcuteOpt');
    const angleObtuseOpt = document.getElementById('angleObtuseOpt');
    
    // Get compute button
    const computeBtn = document.getElementById('computeAngleBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('angleResult');

    // Mode switching
    angleModeSlope.addEventListener('click', () => {
        angleModeSlope.classList.add('selected');
        angleModePoints.classList.remove('selected');
        angleModeEquation.classList.remove('selected');
        angleSlopeInput.style.display = 'block';
        anglePointsInput.style.display = 'none';
        angleEquationInput.style.display = 'none';
    });
    
    angleModePoints.addEventListener('click', () => {
        angleModePoints.classList.add('selected');
        angleModeSlope.classList.remove('selected');
        angleModeEquation.classList.remove('selected');
        angleSlopeInput.style.display = 'none';
        anglePointsInput.style.display = 'block';
        angleEquationInput.style.display = 'none';
    });
    
    angleModeEquation.addEventListener('click', () => {
        angleModeEquation.classList.add('selected');
        angleModeSlope.classList.remove('selected');
        angleModePoints.classList.remove('selected');
        angleSlopeInput.style.display = 'none';
        anglePointsInput.style.display = 'none';
        angleEquationInput.style.display = 'block';
    });

    function update() {
        clearErrors();
        
        try {
            let m1, m2;
            let steps = [];
            let line1Points = [], line2Points = [];
            
            // Determine which input mode is active
            if (angleModeSlope.classList.contains('selected')) {
                // Slope mode
                const m1Inp = document.getElementById('angleM1');
                const m2Inp = document.getElementById('angleM2');
                
                m1 = validateNumber(m1Inp.value, 'm₁');
                m2 = validateNumber(m2Inp.value, 'm₂');
                
                steps = [
                    `① Slope method: tan θ = |(m₁ - m₂)/(1 + m₁·m₂)|`,
                    `② Given m₁ = ${fmt(m1)}, m₂ = ${fmt(m2)}`,
                    `③ Calculate numerator: m₁ - m₂ = ${fmt(m1)} - ${fmt(m2)} = ${fmt(m1 - m2)}`,
                    `④ Calculate denominator: 1 + m₁·m₂ = 1 + (${fmt(m1)}·${fmt(m2)}) = 1 + ${fmt(m1*m2)} = ${fmt(1 + m1*m2)}`,
                ];
                
                // For graphing, create sample lines through origin
                line1Points = [
                    {x: -5, y: -5 * m1},
                    {x: 5, y: 5 * m1}
                ];
                line2Points = [
                    {x: -5, y: -5 * m2},
                    {x: 5, y: 5 * m2}
                ];
                
            } else if (angleModePoints.classList.contains('selected')) {
                // Points mode - calculate slopes from points
                const x11 = document.getElementById('angleP1X1');
                const y11 = document.getElementById('angleP1Y1');
                const x12 = document.getElementById('angleP1X2');
                const y12 = document.getElementById('angleP1Y2');
                const x21 = document.getElementById('angleP2X1');
                const y21 = document.getElementById('angleP2Y1');
                const x22 = document.getElementById('angleP2X2');
                const y22 = document.getElementById('angleP2Y2');
                
                const x1v = validateNumber(x11.value, 'x₁');
                const y1v = validateNumber(y11.value, 'y₁');
                const x2v = validateNumber(x12.value, 'x₂');
                const y2v = validateNumber(y12.value, 'y₂');
                const x3v = validateNumber(x21.value, 'x₃');
                const y3v = validateNumber(y21.value, 'y₃');
                const x4v = validateNumber(x22.value, 'x₄');
                const y4v = validateNumber(y22.value, 'y₄');
                
                // Calculate slopes
                const dx1 = x2v - x1v;
                const dy1 = y2v - y1v;
                const dx2 = x4v - x3v;
                const dy2 = y4v - y3v;
                
                if (Math.abs(dx1) < 1e-10) {
                    m1 = Infinity; // vertical line
                } else {
                    m1 = dy1 / dx1;
                }
                
                if (Math.abs(dx2) < 1e-10) {
                    m2 = Infinity; // vertical line
                } else {
                    m2 = dy2 / dx2;
                }
                
                steps = [
                    `① Line 1 through (${fmt(x1v)},${fmt(y1v)}) and (${fmt(x2v)},${fmt(y2v)})`,
                    `   Δx₁ = ${fmt(x2v)} - ${fmt(x1v)} = ${fmt(dx1)}`,
                    `   Δy₁ = ${fmt(y2v)} - ${fmt(y1v)} = ${fmt(dy1)}`,
                    `   m₁ = ${m1 === Infinity ? 'undefined (vertical)' : fmt(m1)}`,
                    `② Line 2 through (${fmt(x3v)},${fmt(y3v)}) and (${fmt(x4v)},${fmt(y4v)})`,
                    `   Δx₂ = ${fmt(x4v)} - ${fmt(x3v)} = ${fmt(dx2)}`,
                    `   Δy₂ = ${fmt(y4v)} - ${fmt(y3v)} = ${fmt(dy2)}`,
                    `   m₂ = ${m2 === Infinity ? 'undefined (vertical)' : fmt(m2)}`,
                ];
                
                // For graphing
                line1Points = [
                    {x: x1v - 5, y: y1v - 5 * (m1 === Infinity ? 0 : m1)},
                    {x: x2v + 5, y: y2v + 5 * (m1 === Infinity ? 0 : m1)}
                ];
                line2Points = [
                    {x: x3v - 5, y: y3v - 5 * (m2 === Infinity ? 0 : m2)},
                    {x: x4v + 5, y: y4v + 5 * (m2 === Infinity ? 0 : m2)}
                ];
                
            } else {
                // Equation mode
                const a1 = document.getElementById('angleA1');
                const b1 = document.getElementById('angleB1');
                const a2 = document.getElementById('angleA2');
                const b2 = document.getElementById('angleB2');
                
                const a1v = validateNumber(a1.value, 'a₁');
                const b1v = validateNumber(b1.value, 'b₁');
                const a2v = validateNumber(a2.value, 'a₂');
                const b2v = validateNumber(b2.value, 'b₂');
                
                if (Math.abs(b1v) < 1e-10) {
                    m1 = Infinity; // vertical line
                } else {
                    m1 = -a1v / b1v;
                }
                
                if (Math.abs(b2v) < 1e-10) {
                    m2 = Infinity; // vertical line
                } else {
                    m2 = -a2v / b2v;
                }
                
                steps = [
                    `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + c₁ = 0`,
                    `   Slope formula: m₁ = -a₁/b₁ = -(${fmt(a1v)})/${fmt(b1v)} = ${m1 === Infinity ? 'undefined (vertical)' : fmt(m1)}`,
                    `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + c₂ = 0`,
                    `   Slope formula: m₂ = -a₂/b₂ = -(${fmt(a2v)})/${fmt(b2v)} = ${m2 === Infinity ? 'undefined (vertical)' : fmt(m2)}`,
                ];
                
                // For graphing
                line1Points = [
                    {x: -5, y: (-a1v*(-5))/b1v},
                    {x: 5, y: (-a1v*5)/b1v}
                ];
                line2Points = [
                    {x: -5, y: (-a2v*(-5))/b2v},
                    {x: 5, y: (-a2v*5)/b2v}
                ];
            }

            // Calculate angle
            let angleDeg;
            
            // Handle special cases
            if (m1 === Infinity && m2 === Infinity) {
                // Both vertical - parallel
                angleDeg = 0;
                steps.push(`⑤ Both lines are vertical → they are parallel`);
            } else if (m1 === Infinity) {
                // First line vertical
                if (Math.abs(m2) < 1e-10) {
                    // Second line horizontal
                    angleDeg = 90;
                    steps.push(`⑤ Line 1 vertical, Line 2 horizontal → perpendicular (θ = 90°)`);
                } else {
                    // Use formula with m1 → ∞
                    angleDeg = Math.abs(Math.atan(Math.abs(1/m2))) * 180 / Math.PI;
                    steps.push(`⑤ Line 1 vertical, using formula: θ = arctan(|1/m₂|) = arctan(|1/${fmt(m2)}|) = ${fmt(angleDeg)}°`);
                }
            } else if (m2 === Infinity) {
                // Second line vertical
                if (Math.abs(m1) < 1e-10) {
                    // First line horizontal
                    angleDeg = 90;
                    steps.push(`⑤ Line 1 horizontal, Line 2 vertical → perpendicular (θ = 90°)`);
                } else {
                    angleDeg = Math.abs(Math.atan(Math.abs(1/m1))) * 180 / Math.PI;
                    steps.push(`⑤ Line 2 vertical, using formula: θ = arctan(|1/m₁|) = arctan(|1/${fmt(m1)}|) = ${fmt(angleDeg)}°`);
                }
            } else {
                // Normal case - both slopes finite
                const numerator = Math.abs(m1 - m2);
                const denominator = Math.abs(1 + m1 * m2);
                
                steps.push(`③ Calculate tan θ = |m₁ - m₂| / |1 + m₁·m₂|`);
                steps.push(`   = |${fmt(m1)} - ${fmt(m2)}| / |1 + (${fmt(m1)}·${fmt(m2)})|`);
                steps.push(`   = |${fmt(m1 - m2)}| / |1 + ${fmt(m1*m2)}|`);
                steps.push(`   = ${fmt(numerator)} / ${fmt(denominator)} = ${fmt(numerator/denominator)}`);
                
                if (Math.abs(denominator) < 1e-10) {
                    // Denominator is zero → lines are perpendicular
                    angleDeg = 90;
                    steps.push(`④ Denominator = 0 → lines are PERPENDICULAR (θ = 90°)`);
                } else {
                    const tanTheta = numerator / denominator;
                    angleDeg = Math.atan(tanTheta) * 180 / Math.PI;
                    steps.push(`④ θ = arctan(${fmt(tanTheta)}) = ${fmt(angleDeg)}° (acute angle)`);
                }
            }
            
            // Check for obtuse angle if selected
            const wantObtuse = angleObtuseOpt.classList.contains('selected');
            if (wantObtuse) {
                angleDeg = 180 - angleDeg;
                steps.push(`⑤ Obtuse angle = 180° - acute angle = 180° - ${fmt(180 - angleDeg)}° = ${fmt(angleDeg)}°`);
            } else {
                steps.push(`⑤ Acute angle = ${fmt(angleDeg)}°`);
            }

            // Draw the lines
            const lineSegments = [
                { 
                    from: line1Points[0], 
                    to: line1Points[1], 
                    color: '#d44c2f', 
                    dash: [], 
                    label: 'Line 1', 
                    width: 2 
                },
                { 
                    from: line2Points[0], 
                    to: line2Points[1], 
                    color: '#1f7f6a', 
                    dash: [], 
                    label: 'Line 2', 
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
            
            resultDiv.innerHTML = `\\( \\theta = ${fmt(angleDeg)}° \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            // Collect all possible inputs based on mode
            const errorInputs = [];
            if (angleModeSlope.classList.contains('selected')) {
                errorInputs.push(document.getElementById('angleM1'));
                errorInputs.push(document.getElementById('angleM2'));
            } else if (angleModePoints.classList.contains('selected')) {
                errorInputs.push(
                    document.getElementById('angleP1X1'),
                    document.getElementById('angleP1Y1'),
                    document.getElementById('angleP1X2'),
                    document.getElementById('angleP1Y2'),
                    document.getElementById('angleP2X1'),
                    document.getElementById('angleP2Y1'),
                    document.getElementById('angleP2X2'),
                    document.getElementById('angleP2Y2')
                );
            } else {
                errorInputs.push(
                    document.getElementById('angleA1'),
                    document.getElementById('angleB1'),
                    document.getElementById('angleA2'),
                    document.getElementById('angleB2')
                );
            }
            showError(e.message, errorInputs);
        }
    }

    // Event listeners
    computeBtn.addEventListener('click', update);
    
    // Add enter key listeners for all possible inputs
    const allInputs = [
        'angleM1', 'angleM2',
        'angleP1X1', 'angleP1Y1', 'angleP1X2', 'angleP1Y2',
        'angleP2X1', 'angleP2Y1', 'angleP2X2', 'angleP2Y2',
        'angleA1', 'angleB1', 'angleA2', 'angleB2'
    ];
    
    allInputs.forEach(id => {
        const inp = document.getElementById(id);
        if (inp) {
            inp.addEventListener('keypress', e => e.key === 'Enter' && update());
            inp.addEventListener('input', clearErrors);
        }
    });
    
    // Angle type toggles
    angleAcuteOpt.addEventListener('click', () => {
        angleAcuteOpt.classList.add('selected');
        angleObtuseOpt.classList.remove('selected');
        update();
    });
    
    angleObtuseOpt.addEventListener('click', () => {
        angleObtuseOpt.classList.add('selected');
        angleAcuteOpt.classList.remove('selected');
        update();
    });
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}


// Add these render functions (add them before the tab switching code, around line 1900)
// NEW: Render function for Parallelism Condition
function renderParallelismCard() {
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
    
    // Deactivate angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    
    // Activate the parallelism button
    parallelismBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏</span> Condition for Parallelism</h2>
        
        <div class="formula-badge">\\( \\text{Two lines are parallel if:} \\)</div>
        <div class="formula-badge">\\( \\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2} \\)</div>
        <div class="formula-badge">\\( \\text{or equivalently: } a_1b_2 - a_2b_1 = 0 \\text{ but lines are distinct} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="parA1" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="parB1" value="3" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="parC1" value="4" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="parA2" value="4" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="parB2" value="6" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="parC2" value="8" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="parExampleParallel">📏 Parallel Example</button>
                <button class="mode-option" id="parExampleCoincident">🔄 Coincident Example</button>
                <button class="mode-option" id="parExampleNotParallel">✖️ Not Parallel Example</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeParallelismBtn">
            <span>📏</span> Check Parallelism
        </button>
        
        <div class="result-highlight" id="parallelismResult">
            \\( \\text{Lines are PARALLEL} \\)
        </div>
        <div class="footnote">
            <strong>Condition for Parallelism:</strong><br>
            • Two lines are parallel if their normals are proportional: a₁/a₂ = b₁/b₂<br>
            • Additionally, they must be distinct: a₁/a₂ ≠ c₁/c₂ (otherwise they're coincident)<br>
            • In determinant form: a₁b₂ - a₂b₁ = 0 (parallel or coincident)<br>
            • If a₁b₂ - a₂b₁ ≠ 0, lines intersect (not parallel)
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('parA1'), b1 = document.getElementById('parB1'), c1 = document.getElementById('parC1');
    const a2 = document.getElementById('parA2'), b2 = document.getElementById('parB2'), c2 = document.getElementById('parC2');
    const compute = document.getElementById('computeParallelismBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('parallelismResult');
    
    // Example buttons
    const exParallel = document.getElementById('parExampleParallel');
    const exCoincident = document.getElementById('parExampleCoincident');
    const exNotParallel = document.getElementById('parExampleNotParallel');

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

            // Check if normals are proportional (parallel or coincident)
            const det = a1v * b2v - a2v * b1v;
            const normalsProportional = Math.abs(det) < 1e-10;
            
            // Check if lines are coincident (all coefficients proportional)
            let coincident = false;
            let parallel = false;
            let ratioAB = null;
            
            if (normalsProportional) {
                // Find a common ratio using non-zero coefficients
                if (Math.abs(a2v) > 1e-10 && Math.abs(a1v) > 1e-10) {
                    ratioAB = a1v / a2v;
                } else if (Math.abs(b2v) > 1e-10 && Math.abs(b1v) > 1e-10) {
                    ratioAB = b1v / b2v;
                }
                
                // Check if c coefficients follow the same ratio
                if (ratioAB !== null && Math.abs(c2v) > 1e-10) {
                    coincident = Math.abs(c1v / c2v - ratioAB) < 1e-10;
                } else if (Math.abs(c2v) < 1e-10 && Math.abs(c1v) < 1e-10) {
                    // Both c's are zero
                    coincident = true;
                } else {
                    coincident = false;
                }
                
                parallel = normalsProportional && !coincident;
            }

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
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
            
            const pts1 = getLinePoints(a1v, b1v, c1v);
            const pts2 = getLinePoints(a2v, b2v, c2v);
            
            lineSegments.push({ from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 });
            lineSegments.push({ from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: parallel ? [5,3] : [], label: 'L₂', width: 2 });

            drawGraph([], [], lineSegments);

            // Create steps
            const steps = [
                `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                `③ Check if normals are proportional:`,
                `   Calculate determinant: a₁b₂ - a₂b₁ = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)}`,
                `   = ${fmt(a1v*b2v)} - ${fmt(a2v*b1v)} = ${fmt(det)}`,
                `   ${Math.abs(det) < 1e-10 ? '✓ Determinant ≈ 0 → Normals are proportional' : '✗ Determinant ≠ 0 → Normals are NOT proportional'}`,
                `④ ${normalsProportional ? 'Check if lines are coincident or just parallel:' : ''}`
            ];
            
            if (normalsProportional) {
                steps.push(`   • Ratio of a coefficients: a₁/a₂ = ${fmt(a1v)}/${fmt(a2v)} = ${ratioAB !== null ? fmt(ratioAB) : 'undefined'}`);
                steps.push(`   • Ratio of c coefficients: c₁/c₂ = ${fmt(c1v)}/${fmt(c2v)} = ${Math.abs(c2v) > 1e-10 ? fmt(c1v/c2v) : 'undefined'}`);
                steps.push(`   ${coincident ? '✓ Ratios are equal → Lines are COINCIDENT' : '✗ Ratios differ → Lines are DISTINCT'}`);
            }
            
            steps.push(`⑤ Conclusion:`);
            if (parallel) {
                steps.push(`   ✓ LINES ARE PARALLEL (and distinct)`);
            } else if (coincident) {
                steps.push(`   🔄 LINES ARE COINCIDENT (same line)`);
            } else {
                steps.push(`   ✗ LINES ARE NOT PARALLEL (they intersect)`);
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            let resultText = '';
            if (parallel) {
                resultText = `\\( \\text{Lines are PARALLEL (and distinct)} \\)`;
            } else if (coincident) {
                resultText = `\\( \\text{Lines are COINCIDENT (same line)} \\)`;
            } else {
                resultText = `\\( \\text{Lines are NOT PARALLEL (they intersect)} \\)`;
            }
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2]);
        }
    }

    // Example button handlers
    exParallel.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 4; b2.value = 6; c2.value = 8;
        update();
    });
    
    exCoincident.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 4; b2.value = 6; c2.value = 8;
        update();
    });
    
    exNotParallel.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 5; b2.value = -1; c2.value = 2;
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
}

// NEW: Render function for Perpendicularity Condition
function renderPerpendicularityCard() {
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
    
    // Deactivate angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    
    // Activate the perpendicularity button
    perpendicularityBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Condition for Perpendicularity</h2>
        
        <div class="formula-badge">\\( \\text{Two lines are perpendicular if:} \\)</div>
        <div class="formula-badge">\\( a_1a_2 + b_1b_2 = 0 \\)</div>
        <div class="formula-badge">\\( \\text{or equivalently: } m_1 \\cdot m_2 = -1 \\text{ (if slopes exist)} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="perpA1" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="perpB1" value="3" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="perpC1" value="4" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="perpA2" value="3" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="perpB2" value="-2" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="perpC2" value="5" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="perpExamplePerp">📐 Perpendicular Example</button>
                <button class="mode-option" id="perpExampleNotPerp">✖️ Not Perpendicular Example</button>
                <button class="mode-option" id="perpExampleAxis">📏 Axes (x and y axes)</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePerpendicularityBtn">
            <span>📐</span> Check Perpendicularity
        </button>
        
        <div class="result-highlight" id="perpendicularityResult">
            \\( \\text{Lines are PERPENDICULAR} \\)
        </div>
        <div class="footnote">
            <strong>Condition for Perpendicularity:</strong><br>
            • Two lines are perpendicular if a₁a₂ + b₁b₂ = 0<br>
            • In terms of slopes: m₁·m₂ = -1 (if both slopes exist)<br>
            • Special cases: vertical line (x = k) is perpendicular to horizontal line (y = c)<br>
            • If one line is vertical (b₁=0) and other is horizontal (a₂=0), they're perpendicular
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('perpA1'), b1 = document.getElementById('perpB1'), c1 = document.getElementById('perpC1');
    const a2 = document.getElementById('perpA2'), b2 = document.getElementById('perpB2'), c2 = document.getElementById('perpC2');
    const compute = document.getElementById('computePerpendicularityBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('perpendicularityResult');
    
    // Example buttons
    const exPerp = document.getElementById('perpExamplePerp');
    const exNotPerp = document.getElementById('perpExampleNotPerp');
    const exAxis = document.getElementById('perpExampleAxis');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a1v = validateNumber(a1.value, 'a₁');
            const b1v = validateNumber(b1.value, 'b₁');
            const a2v = validateNumber(a2.value, 'a₂');
            const b2v = validateNumber(b2.value, 'b₂');
            const c1v = validateNumber(c1.value, 'c₁');
            const c2v = validateNumber(c2.value, 'c₂');

            if (Math.abs(a1v) < 1e-10 && Math.abs(b1v) < 1e-10) {
                throw new Error('Line 1: a and b cannot both be zero');
            }
            if (Math.abs(a2v) < 1e-10 && Math.abs(b2v) < 1e-10) {
                throw new Error('Line 2: a and b cannot both be zero');
            }

            // Check perpendicularity condition: a₁a₂ + b₁b₂ = 0
            const dotProduct = a1v * a2v + b1v * b2v;
            const isPerpendicular = Math.abs(dotProduct) < 1e-10;
            
            // Calculate slopes for explanation
            let m1, m2, slopeText1, slopeText2;
            
            if (Math.abs(b1v) < 1e-10) {
                m1 = Infinity;
                slopeText1 = "undefined (vertical)";
            } else {
                m1 = -a1v / b1v;
                slopeText1 = fmt(m1);
            }
            
            if (Math.abs(b2v) < 1e-10) {
                m2 = Infinity;
                slopeText2 = "undefined (vertical)";
            } else {
                m2 = -a2v / b2v;
                slopeText2 = fmt(m2);
            }

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
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
            
            const pts1 = getLinePoints(a1v, b1v, c1v);
            const pts2 = getLinePoints(a2v, b2v, c2v);
            
            lineSegments.push({ from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 });
            lineSegments.push({ from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: [], label: 'L₂', width: 2 });

            drawGraph([], [], lineSegments);

            // Create steps
            const steps = [
                `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0  (slope = ${slopeText1})`,
                `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0  (slope = ${slopeText2})`,
                `③ Check perpendicularity condition: a₁a₂ + b₁b₂ = 0`,
                `   Calculate: ${fmt(a1v)}·${fmt(a2v)} + ${fmt(b1v)}·${fmt(b2v)}`,
                `   = ${fmt(a1v*a2v)} + ${fmt(b1v*b2v)} = ${fmt(dotProduct)}`,
                `   ${Math.abs(dotProduct) < 1e-10 ? '✓ Result ≈ 0' : '✗ Result ≠ 0'}`,
            ];
            
            // Add slope product check if both slopes exist
            if (m1 !== Infinity && m2 !== Infinity) {
                const slopeProduct = m1 * m2;
                steps.push(`④ Check slope product: m₁·m₂ = ${fmt(m1)}·${fmt(m2)} = ${fmt(slopeProduct)}`);
                steps.push(`   ${Math.abs(slopeProduct + 1) < 1e-10 ? '✓ Product = -1' : '✗ Product ≠ -1'}`);
            } else if (m1 === Infinity && m2 !== Infinity) {
                steps.push(`④ Line 1 is vertical, Line 2 has slope ${slopeText2}`);
                steps.push(`   Vertical lines are perpendicular to horizontal lines (slope = 0)`);
                steps.push(`   ${Math.abs(m2) < 1e-10 ? '✓ Line 2 is horizontal → perpendicular' : '✗ Line 2 is not horizontal → not perpendicular'}`);
            } else if (m2 === Infinity && m1 !== Infinity) {
                steps.push(`④ Line 2 is vertical, Line 1 has slope ${slopeText1}`);
                steps.push(`   Vertical lines are perpendicular to horizontal lines (slope = 0)`);
                steps.push(`   ${Math.abs(m1) < 1e-10 ? '✓ Line 1 is horizontal → perpendicular' : '✗ Line 1 is not horizontal → not perpendicular'}`);
            } else {
                steps.push(`④ Both lines are vertical → they are parallel, not perpendicular`);
            }
            
            steps.push(`⑤ Conclusion: ${isPerpendicular ? '✓ LINES ARE PERPENDICULAR' : '✗ LINES ARE NOT PERPENDICULAR'}`);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            resultDiv.innerHTML = `\\( \\text{Lines are ${isPerpendicular ? 'PERPENDICULAR' : 'NOT PERPENDICULAR'}} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [a1, b1, c1, a2, b2, c2]);
        }
    }

    // Example button handlers
    exPerp.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 3; b2.value = -2; c2.value = 5;
        update();
    });
    
    exNotPerp.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = 4;
        a2.value = 5; b2.value = 1; c2.value = 2;
        update();
    });
    
    exAxis.addEventListener('click', () => {
        a1.value = 1; b1.value = 0; c1.value = 0;  // x = 0 (y-axis)
        a2.value = 0; b2.value = 1; c2.value = 0;  // y = 0 (x-axis)
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
}
// NEW: Render function for Intersection Point of Two Lines
function renderIntersectionPointCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    
    // Activate the intersection point button
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    intersectionPointBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>⚡</span> Intersection Point of Two Lines</h2>
        
        <div class="formula-badge">\\( \\text{Solving two linear equations:} \\)</div>
        <div class="formula-badge">\\( a_1x + b_1y + c_1 = 0 \\)</div>
        <div class="formula-badge">\\( a_2x + b_2y + c_2 = 0 \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Line 1 -->
            <div class="point-box" style="width:100%;">
                <label>Line 1: a₁x + b₁y + c₁ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₁ =</span> <input type="number" id="intA1" value="2" step="any" style="width:80px;"></div>
                    <div><span>b₁ =</span> <input type="number" id="intB1" value="3" step="any" style="width:80px;"></div>
                    <div><span>c₁ =</span> <input type="number" id="intC1" value="-8" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Line 2 -->
            <div class="point-box" style="width:100%;">
                <label>Line 2: a₂x + b₂y + c₂ = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a₂ =</span> <input type="number" id="intA2" value="3" step="any" style="width:80px;"></div>
                    <div><span>b₂ =</span> <input type="number" id="intB2" value="-2" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="intC2" value="-1" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="intExample1">📊 Example 1</button>
                <button class="mode-option" id="intExample2">📈 Example 2</button>
                <button class="mode-option" id="intExampleParallel">📏 Parallel Example</button>
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
            <span>⚡</span> Find Intersection Point
        </button>
        
        <div class="result-highlight" id="intersectionResult">
            \\( \\text{Intersection Point: } (1, 2) \\)
        </div>
        <div class="footnote">
            <strong>Solving Method:</strong> Using Cramer's rule:<br>
            x = (b₁c₂ - b₂c₁) / (a₁b₂ - a₂b₁)<br>
            y = (c₁a₂ - c₂a₁) / (a₁b₂ - a₂b₁)<br>
            If denominator = 0, lines are parallel (no unique intersection).
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const a1 = document.getElementById('intA1'), b1 = document.getElementById('intB1'), c1 = document.getElementById('intC1');
    const a2 = document.getElementById('intA2'), b2 = document.getElementById('intB2'), c2 = document.getElementById('intC2');
    const compute = document.getElementById('computeIntersectionBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('intersectionResult');
    
    // Example buttons
    const ex1 = document.getElementById('intExample1');
    const ex2 = document.getElementById('intExample2');
    const exParallel = document.getElementById('intExampleParallel');

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

            // Calculate determinant
            const det = a1v * b2v - a2v * b1v;
            
            let intersectionPoint = null;
            let steps = [];

            if (Math.abs(det) < 1e-10) {
                // Lines are parallel or coincident
                steps = [
                    `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                    `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                    `③ Calculate determinant: Δ = a₁b₂ - a₂b₁`,
                    `   = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)}`,
                    `   = ${fmt(a1v*b2v)} - ${fmt(a2v*b1v)} = ${fmt(det)}`,
                    `④ Since Δ ≈ 0, the lines are PARALLEL`,
                    `⑤ They do not intersect (or are coincident)`,
                    `⑥ No unique intersection point exists.`
                ];
                
                // Check if they're coincident
                if (Math.abs(c1v) > 1e-10 && Math.abs(c2v) > 1e-10) {
                    const ratio = a1v / a2v;
                    if (Math.abs(c1v / c2v - ratio) < 1e-10) {
                        steps.push(`⑦ Lines are COINCIDENT (same line) - infinite intersection points.`);
                    }
                }
                
                resultDiv.innerHTML = `\\( \\text{Lines are parallel - no unique intersection} \\)`;
            } else {
                // Calculate intersection point using Cramer's rule
                const xNum = b1v * c2v - b2v * c1v;
                const yNum = c1v * a2v - c2v * a1v;
                
                const x = xNum / det;
                const y = yNum / det;
                
                intersectionPoint = {x, y};

                steps = [
                    `① Line 1: ${fmt(a1v)}x + ${fmt(b1v)}y + ${fmt(c1v)} = 0`,
                    `② Line 2: ${fmt(a2v)}x + ${fmt(b2v)}y + ${fmt(c2v)} = 0`,
                    `③ Calculate determinant: Δ = a₁b₂ - a₂b₁`,
                    `   = ${fmt(a1v)}·${fmt(b2v)} - ${fmt(a2v)}·${fmt(b1v)}`,
                    `   = ${fmt(a1v*b2v)} - ${fmt(a2v*b1v)} = ${fmt(det)}`,
                    `④ Calculate x-coordinate using Cramer's rule:`,
                    `   x = (b₁c₂ - b₂c₁) / Δ`,
                    `   = (${fmt(b1v)}·${fmt(c2v)} - ${fmt(b2v)}·${fmt(c1v)}) / ${fmt(det)}`,
                    `   = (${fmt(b1v*c2v)} - ${fmt(b2v*c1v)}) / ${fmt(det)}`,
                    `   = ${fmt(xNum)} / ${fmt(det)} = ${fmt(x)}`,
                    `⑤ Calculate y-coordinate using Cramer's rule:`,
                    `   y = (c₁a₂ - c₂a₁) / Δ`,
                    `   = (${fmt(c1v)}·${fmt(a2v)} - ${fmt(c2v)}·${fmt(a1v)}) / ${fmt(det)}`,
                    `   = (${fmt(c1v*a2v)} - ${fmt(c2v*a1v)}) / ${fmt(det)}`,
                    `   = ${fmt(yNum)} / ${fmt(det)} = ${fmt(y)}`,
                    `⑥ Intersection Point P = (${fmt(x)}, ${fmt(y)})`
                ];
                
                resultDiv.innerHTML = `\\( P = (${fmt(x)}, ${fmt(y)}) \\)`;
            }

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
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
            
            const pts1 = getLinePoints(a1v, b1v, c1v);
            const pts2 = getLinePoints(a2v, b2v, c2v);
            
            lineSegments.push({ from: pts1[0], to: pts1[1], color: '#d44c2f', dash: [], label: 'L₁', width: 2 });
            lineSegments.push({ from: pts2[0], to: pts2[1], color: '#1f7f6a', dash: [], label: 'L₂', width: 2 });

            // Add intersection point if it exists
            const specialPoints = intersectionPoint ? [{x: intersectionPoint.x, y: intersectionPoint.y, label: 'P'}] : [];

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
    ex1.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = -8;
        a2.value = 3; b2.value = -2; c2.value = -1;
        update();
    });
    
    ex2.addEventListener('click', () => {
        a1.value = 1; b1.value = 1; c1.value = -5;
        a2.value = 2; b2.value = -1; c2.value = -1;
        update();
    });
    
    exParallel.addEventListener('click', () => {
        a1.value = 2; b1.value = 3; c1.value = -8;
        a2.value = 4; b2.value = 6; c2.value = 5;
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
}

// NEW: Render function for Line Parallel to a Given Line
function renderLineParallelCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    
    // Activate the parallel line button
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    lineParallelBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏</span> Line Parallel to a Given Line</h2>
        
        <div class="formula-badge">\\( \\text{Given line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Parallel line: } ax + by + \\lambda = 0 \\)</div>
        <div class="formula-badge">\\( \\text{where } \\lambda \\text{ is determined by the point condition} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Given Line -->
            <div class="point-box" style="width:100%;">
                <label>Given Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="parA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="parB" value="3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="parC" value="-6" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Point through which parallel line passes -->
            <div class="point-box" style="width:100%;">
                <label>Point P(x₀, y₀) on parallel line</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>x₀ =</span> <input type="number" id="parX0" value="1" step="any" style="width:80px;"></div>
                    <div><span>y₀ =</span> <input type="number" id="parY0" value="2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="parEx1">📊 Example 1</button>
                <button class="mode-option" id="parEx2">📈 Example 2</button>
                <button class="mode-option" id="parExVertical">📏 Vertical Line</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeParallelLineBtn">
            <span>📏</span> Find Parallel Line
        </button>
        
        <div class="result-highlight" id="parallelLineResult">
            \\( 2x + 3y - 8 = 0 \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> A line parallel to ax + by + c = 0 has the form ax + by + λ = 0.<br>
            Substitute point (x₀, y₀) to find λ = -(ax₀ + by₀).<br>
            The parallel line is: ax + by + λ = 0.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('parA'), bInp = document.getElementById('parB'), cInp = document.getElementById('parC');
    const x0Inp = document.getElementById('parX0'), y0Inp = document.getElementById('parY0');
    const compute = document.getElementById('computeParallelLineBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('parallelLineResult');
    
    // Example buttons
    const ex1 = document.getElementById('parEx1');
    const ex2 = document.getElementById('parEx2');
    const exVertical = document.getElementById('parExVertical');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            const x0 = validateNumber(x0Inp.value, 'x₀');
            const y0 = validateNumber(y0Inp.value, 'y₀');

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate λ = -(ax₀ + by₀)
            const lambda = -(a * x0 + b * y0);
            
            // Equation of parallel line: ax + by + λ = 0

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
            function getLinePoints(a, b, constTerm) {
                if (Math.abs(b) > 1e-10) {
                    // Non-vertical line
                    return [
                        {x: minX, y: (-a*minX - constTerm)/b},
                        {x: maxX, y: (-a*maxX - constTerm)/b}
                    ];
                } else {
                    // Vertical line
                    const xConst = -constTerm/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            const ptsGiven = getLinePoints(a, b, c);
            const ptsParallel = getLinePoints(a, b, lambda);
            
            lineSegments.push({ from: ptsGiven[0], to: ptsGiven[1], color: '#d44c2f', dash: [], label: 'Given Line', width: 2 });
            lineSegments.push({ from: ptsParallel[0], to: ptsParallel[1], color: '#1f7f6a', dash: [5,3], label: 'Parallel Line', width: 2 });

            // Add the point P
            const specialPoints = [{x: x0, y: y0, label: 'P'}];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Given line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `② A line parallel to it has the form: ${fmt(a)}x + ${fmt(b)}y + λ = 0`,
                `③ The parallel line must pass through P(${fmt(x0)}, ${fmt(y0)})`,
                `④ Substitute P into the equation:`,
                `   ${fmt(a)}·${fmt(x0)} + ${fmt(b)}·${fmt(y0)} + λ = 0`,
                `   ${fmt(a*x0)} + ${fmt(b*y0)} + λ = 0`,
                `   ${fmt(a*x0 + b*y0)} + λ = 0`,
                `⑤ Solve for λ: λ = -(${fmt(a*x0 + b*y0)}) = ${fmt(lambda)}`,
                `⑥ Equation of parallel line:`,
                `   ${fmt(a)}x + ${fmt(b)}y ${lambda >= 0 ? '+' : '-'} ${Math.abs(fmt(lambda))} = 0`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            resultDiv.innerHTML = `\\( ${fmt(a)}x ${b >= 0 ? '+' : '-'} ${Math.abs(fmt(b))}y ${lambda >= 0 ? '+' : '-'} ${Math.abs(fmt(lambda))} = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp, x0Inp, y0Inp]);
        }
    }

    // Example button handlers
    ex1.addEventListener('click', () => {
        aInp.value = 2; bInp.value = 3; cInp.value = -6;
        x0Inp.value = 1; y0Inp.value = 2;
        update();
    });
    
    ex2.addEventListener('click', () => {
        aInp.value = 1; bInp.value = -1; cInp.value = 4;
        x0Inp.value = 3; y0Inp.value = -1;
        update();
    });
    
    exVertical.addEventListener('click', () => {
        aInp.value = 1; bInp.value = 0; cInp.value = -3;  // x = 3
        x0Inp.value = 5; y0Inp.value = 2;  // Point (5,2) → parallel line x = 5
        update();
    });

    compute.addEventListener('click', update);
    [aInp, bInp, cInp, x0Inp, y0Inp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp, x0Inp, y0Inp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// NEW: Render function for Line Perpendicular to a Given Line
function renderLinePerpendicularCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    
    // Activate the perpendicular line button
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    linePerpendicularBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐</span> Line Perpendicular to a Given Line</h2>
        
        <div class="formula-badge">\\( \\text{Given line: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Perpendicular line: } bx - ay + \\lambda = 0 \\)</div>
        <div class="formula-badge">\\( \\text{where } \\lambda \\text{ is determined by the point condition} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <!-- Given Line -->
            <div class="point-box" style="width:100%;">
                <label>Given Line: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="perpA" value="2" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="perpB" value="3" step="any" style="width:80px;"></div>
                    <div><span>c =</span> <input type="number" id="perpC" value="-6" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Point through which perpendicular line passes -->
            <div class="point-box" style="width:100%;">
                <label>Point P(x₀, y₀) on perpendicular line</label>
                <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
                    <div><span>x₀ =</span> <input type="number" id="perpX0" value="1" step="any" style="width:80px;"></div>
                    <div><span>y₀ =</span> <input type="number" id="perpY0" value="2" step="any" style="width:80px;"></div>
                </div>
            </div>
            
            <!-- Quick example buttons -->
            <div style="display:flex; gap:10px; justify-content:center; margin-top:10px; flex-wrap:wrap;">
                <button class="mode-option" id="perpEx1">📊 Example 1</button>
                <button class="mode-option" id="perpEx2">📈 Example 2</button>
                <button class="mode-option" id="perpExAxis">📏 Axes Example</button>
            </div>
        </div>

        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePerpendicularLineBtn">
            <span>📐</span> Find Perpendicular Line
        </button>
        
        <div class="result-highlight" id="perpendicularLineResult">
            \\( 3x - 2y + 1 = 0 \\)
        </div>
        <div class="footnote">
            <strong>Method:</strong> A line perpendicular to ax + by + c = 0 has the form bx - ay + λ = 0.<br>
            Substitute point (x₀, y₀) to find λ = -(bx₀ - ay₀).<br>
            The perpendicular line is: bx - ay + λ = 0.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('perpA'), bInp = document.getElementById('perpB'), cInp = document.getElementById('perpC');
    const x0Inp = document.getElementById('perpX0'), y0Inp = document.getElementById('perpY0');
    const compute = document.getElementById('computePerpendicularLineBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('perpendicularLineResult');
    
    // Example buttons
    const ex1 = document.getElementById('perpEx1');
    const ex2 = document.getElementById('perpEx2');
    const exAxis = document.getElementById('perpExAxis');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');
            const x0 = validateNumber(x0Inp.value, 'x₀');
            const y0 = validateNumber(y0Inp.value, 'y₀');

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate λ = -(bx₀ - ay₀)
            const lambda = -(b * x0 - a * y0);
            
            // Equation of perpendicular line: bx - ay + λ = 0

            // Draw both lines
            const minX = -8, maxX = 8;
            const lineSegments = [];
            
            function getLinePointsGiven(a, b, constTerm) {
                if (Math.abs(b) > 1e-10) {
                    // Non-vertical line
                    return [
                        {x: minX, y: (-a*minX - constTerm)/b},
                        {x: maxX, y: (-a*maxX - constTerm)/b}
                    ];
                } else {
                    // Vertical line
                    const xConst = -constTerm/a;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            function getLinePointsPerp(a, b, constTerm) {
                // For bx - ay + λ = 0
                if (Math.abs(a) > 1e-10) {
                    // Solve for y: -ay = -bx - λ → y = (bx + λ)/a
                    return [
                        {x: minX, y: (b*minX + constTerm)/a},
                        {x: maxX, y: (b*maxX + constTerm)/a}
                    ];
                } else {
                    // a = 0, equation becomes bx + λ = 0 → x = -λ/b (vertical)
                    const xConst = -constTerm/b;
                    return [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
            }
            
            const ptsGiven = getLinePointsGiven(a, b, c);
            const ptsPerp = getLinePointsPerp(a, b, lambda);
            
            lineSegments.push({ from: ptsGiven[0], to: ptsGiven[1], color: '#d44c2f', dash: [], label: 'Given Line', width: 2 });
            lineSegments.push({ from: ptsPerp[0], to: ptsPerp[1], color: '#1f7f6a', dash: [5,3], label: 'Perpendicular Line', width: 2 });

            // Add the point P
            const specialPoints = [{x: x0, y: y0, label: 'P'}];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Given line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `② A line perpendicular to it has the form: ${fmt(b)}x - ${fmt(a)}y + λ = 0`,
                `③ The perpendicular line must pass through P(${fmt(x0)}, ${fmt(y0)})`,
                `④ Substitute P into the equation:`,
                `   ${fmt(b)}·${fmt(x0)} - ${fmt(a)}·${fmt(y0)} + λ = 0`,
                `   ${fmt(b*x0)} - ${fmt(a*y0)} + λ = 0`,
                `   ${fmt(b*x0 - a*y0)} + λ = 0`,
                `⑤ Solve for λ: λ = -(${fmt(b*x0 - a*y0)}) = ${fmt(lambda)}`,
                `⑥ Equation of perpendicular line:`,
                `   ${fmt(b)}x - ${fmt(a)}y ${lambda >= 0 ? '+' : '-'} ${Math.abs(fmt(lambda))} = 0`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Display result
            resultDiv.innerHTML = `\\( ${fmt(b)}x - ${fmt(a)}y ${lambda >= 0 ? '+' : '-'} ${Math.abs(fmt(lambda))} = 0 \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp, cInp, x0Inp, y0Inp]);
        }
    }

    // Example button handlers
    ex1.addEventListener('click', () => {
        aInp.value = 2; bInp.value = 3; cInp.value = -6;
        x0Inp.value = 1; y0Inp.value = 2;
        update();
    });
    
    ex2.addEventListener('click', () => {
        aInp.value = 1; bInp.value = -1; cInp.value = 4;
        x0Inp.value = 3; y0Inp.value = 2;
        update();
    });
    
    exAxis.addEventListener('click', () => {
        aInp.value = 1; bInp.value = 0; cInp.value = -3;  // x = 3 (vertical)
        x0Inp.value = 2; y0Inp.value = 4;  // Perpendicular through (2,4) should be horizontal
        update();
    });

    compute.addEventListener('click', update);
    [aInp, bInp, cInp, x0Inp, y0Inp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp, cInp, x0Inp, y0Inp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Foot of Perpendicular from Point to Line =========
function renderFootPerpendicularCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    
    // Activate this button
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    footPerpendicularBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔻</span> Foot of Perpendicular from Point to Line</h2>
        
        <div class="formula-badge">\\( \\text{Point } P(x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Line } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Foot } F = \\left( x_1 - a \\cdot \\frac{ax_1 + by_1 + c}{a^2 + b^2}, \\; y_1 - b \\cdot \\frac{ax_1 + by_1 + c}{a^2 + b^2} \\right) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Point P -->
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="footX1" value="3" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="footY1" value="4" step="any"></div>
            </div>
            
            <!-- Line coefficients -->
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="footA" value="1" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="footB" value="1" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="footC" value="-2" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeFootPerpBtn">
            <span>🔻</span> Find Foot of Perpendicular
        </button>
        
        <div class="result-highlight" id="footPerpResult">
            \\( F = (2.5, 2.5) \\)
        </div>
        <div class="footnote">
            <strong>Geometrical meaning:</strong> The foot of perpendicular is the point on the line that is closest to point P. 
            The line segment PF is perpendicular to the given line.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const x1Inp = document.getElementById('footX1');
    const y1Inp = document.getElementById('footY1');
    const aInp = document.getElementById('footA');
    const bInp = document.getElementById('footB');
    const cInp = document.getElementById('footC');
    const compute = document.getElementById('computeFootPerpBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('footPerpResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate foot of perpendicular
            const denominator = a*a + b*b;
            const t = (a*x1 + b*y1 + c) / denominator;
            
            const footX = x1 - a * t;
            const footY = y1 - b * t;

            // Draw the line and the perpendicular
            const minX = Math.min(x1, footX) - 3;
            const maxX = Math.max(x1, footX) + 3;
            const minY = Math.min(y1, footY) - 3;
            const maxY = Math.max(y1, footY) + 3;
            
            const rangeX = Math.max(Math.abs(minX), Math.abs(maxX), 5);
            const rangeY = Math.max(Math.abs(minY), Math.abs(maxY), 5);
            
            const graphMinX = -rangeX;
            const graphMaxX = rangeX;
            const graphMinY = -rangeY;
            const graphMaxY = rangeY;
            
            // Line points
            let linePts;
            if (Math.abs(b) > 1e-10) {
                linePts = [
                    {x: graphMinX, y: (-a*graphMinX - c)/b},
                    {x: graphMaxX, y: (-a*graphMaxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePts = [
                    {x: xConst, y: graphMinY},
                    {x: xConst, y: graphMaxY}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 },
                { from: {x: x1, y: y1}, to: {x: footX, y: footY}, color: '#d44c2f', dash: [5,3], label: 'Perpendicular', width: 2 }
            ];
            
            const specialPoints = [
                {x: x1, y: y1, label: 'P'},
                {x: footX, y: footY, label: 'F'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Point P(${fmt(x1)}, ${fmt(y1)})`,
                `② Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `③ Calculate denominator D = a² + b² = ${fmt(a*a)} + ${fmt(b*b)} = ${fmt(denominator)}`,
                `④ Calculate numerator N = a·x₁ + b·y₁ + c = ${fmt(a)}·${fmt(x1)} + ${fmt(b)}·${fmt(y1)} + ${fmt(c)} = ${fmt(a*x1 + b*y1 + c)}`,
                `⑤ Parameter t = N/D = ${fmt(a*x1 + b*y1 + c)} / ${fmt(denominator)} = ${fmt(t)}`,
                `⑥ Foot coordinates:`,
                `   x_f = x₁ - a·t = ${fmt(x1)} - ${fmt(a)}·${fmt(t)} = ${fmt(footX)}`,
                `   y_f = y₁ - b·t = ${fmt(y1)} - ${fmt(b)}·${fmt(t)} = ${fmt(footY)}`,
                `⑦ Foot of perpendicular F = (${fmt(footX)}, ${fmt(footY)})`,
                `⑧ Verification: Check that F lies on the line:`,
                `   ${fmt(a)}·${fmt(footX)} + ${fmt(b)}·${fmt(footY)} + ${fmt(c)} = ${fmt(a*footX + b*footY + c)} ≈ 0 ✓`,
                `   Check that PF ⟂ line: slope of line = ${fmt(-a/b)} (if b≠0), slope of PF = ${fmt((footY - y1)/(footX - x1))}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( F = (${fmt(footX)}, ${fmt(footY)}) \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Image of a Point in a Line =========
function renderImagePointLineCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    if(footPerpendicularBtn) footPerpendicularBtn.classList.remove('active-btn');
    
    // Activate this button
    const imagePointLineBtn = document.getElementById('imagePointLineBtn');
    imagePointLineBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🪞</span> Image of a Point in a Line</h2>
        
        <div class="formula-badge">\\( \\text{Point } P(x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Line } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Image } Q = \\left( x_1 - 2a \\cdot \\frac{ax_1 + by_1 + c}{a^2 + b^2}, \\; y_1 - 2b \\cdot \\frac{ax_1 + by_1 + c}{a^2 + b^2} \\right) \\)</div>
        <div class="formula-badge">\\( \\text{where F is foot of perpendicular, and F is midpoint of PQ} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Point P -->
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="imgX1" value="3" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="imgY1" value="4" step="any"></div>
            </div>
            
            <!-- Line coefficients -->
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="imgA" value="1" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="imgB" value="1" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="imgC" value="-2" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeImageBtn">
            <span>🪞</span> Find Image Point
        </button>
        
        <div class="result-highlight" id="imageResult">
            \\( Q = (2, 2) \\)
        </div>
        <div class="footnote">
            <strong>Reflection concept:</strong> The image point Q is the mirror reflection of P across the line. 
            The line is the perpendicular bisector of segment PQ. The foot F is the midpoint of PQ.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const x1Inp = document.getElementById('imgX1');
    const y1Inp = document.getElementById('imgY1');
    const aInp = document.getElementById('imgA');
    const bInp = document.getElementById('imgB');
    const cInp = document.getElementById('imgC');
    const compute = document.getElementById('computeImageBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('imageResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }

            // Calculate foot of perpendicular first
            const denominator = a*a + b*b;
            const t = (a*x1 + b*y1 + c) / denominator;
            
            const footX = x1 - a * t;
            const footY = y1 - b * t;
            
            // Image point Q = 2F - P
            const imgX = 2 * footX - x1;
            const imgY = 2 * footY - y1;

            // Draw the line, points, and perpendicular
            const minX = Math.min(x1, imgX, footX) - 3;
            const maxX = Math.max(x1, imgX, footX) + 3;
            const minY = Math.min(y1, imgY, footY) - 3;
            const maxY = Math.max(y1, imgY, footY) + 3;
            
            const rangeX = Math.max(Math.abs(minX), Math.abs(maxX), 5);
            const rangeY = Math.max(Math.abs(minY), Math.abs(maxY), 5);
            
            const graphMinX = -rangeX;
            const graphMaxX = rangeX;
            const graphMinY = -rangeY;
            const graphMaxY = rangeY;
            
            // Line points
            let linePts;
            if (Math.abs(b) > 1e-10) {
                linePts = [
                    {x: graphMinX, y: (-a*graphMinX - c)/b},
                    {x: graphMaxX, y: (-a*graphMaxX - c)/b}
                ];
            } else {
                // Vertical line
                const xConst = -c/a;
                linePts = [
                    {x: xConst, y: graphMinY},
                    {x: xConst, y: graphMaxY}
                ];
            }
            
            const lineSegments = [
                { from: linePts[0], to: linePts[1], color: '#2c3e50', dash: [], label: 'Line', width: 2 },
                { from: {x: x1, y: y1}, to: {x: footX, y: footY}, color: '#d44c2f', dash: [3,3], label: 'Perpendicular', width: 2 },
                { from: {x: footX, y: footY}, to: {x: imgX, y: imgY}, color: '#d44c2f', dash: [3,3], label: 'To image', width: 2 }
            ];
            
            const specialPoints = [
                {x: x1, y: y1, label: 'P'},
                {x: footX, y: footY, label: 'F'},
                {x: imgX, y: imgY, label: 'Q'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Point P(${fmt(x1)}, ${fmt(y1)})`,
                `② Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `③ First, find foot of perpendicular F:`,
                `   D = a² + b² = ${fmt(denominator)}`,
                `   N = a·x₁ + b·y₁ + c = ${fmt(a*x1 + b*y1 + c)}`,
                `   t = N/D = ${fmt(t)}`,
                `   x_f = x₁ - a·t = ${fmt(footX)}`,
                `   y_f = y₁ - b·t = ${fmt(footY)}`,
                `   F = (${fmt(footX)}, ${fmt(footY)})`,
                `④ Image point Q is such that F is midpoint of PQ:`,
                `   x_q = 2x_f - x₁ = 2·${fmt(footX)} - ${fmt(x1)} = ${fmt(imgX)}`,
                `   y_q = 2y_f - y₁ = 2·${fmt(footY)} - ${fmt(y1)} = ${fmt(imgY)}`,
                `⑤ Image Q = (${fmt(imgX)}, ${fmt(imgY)})`,
                `⑥ Verification: Distance from P to F = distance from F to Q:`,
                `   PF = √[(${fmt(footX-x1)})² + (${fmt(footY-y1)})²] = ${fmt(Math.sqrt((footX-x1)**2 + (footY-y1)**2))}`,
                `   FQ = √[(${fmt(imgX-footX)})² + (${fmt(imgY-footY)})²] = ${fmt(Math.sqrt((imgX-footX)**2 + (imgY-footY)**2))}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( Q = (${fmt(imgX)}, ${fmt(imgY)}) \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Image of a Point with Respect to Axes =========
function renderImagePointAxesCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    const imagePointLineBtn = document.getElementById('imagePointLineBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    if(footPerpendicularBtn) footPerpendicularBtn.classList.remove('active-btn');
    if(imagePointLineBtn) imagePointLineBtn.classList.remove('active-btn');
    
    // Activate this button
    const imagePointAxesBtn = document.getElementById('imagePointAxesBtn');
    imagePointAxesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🪞📏</span> Image of a Point with Respect to Axes</h2>
        
        <div class="formula-badge">\\( \\text{Point } P(x, y) \\)</div>
        <div class="formula-badge">\\( \\text{Image in X-axis: } (x, -y) \\)</div>
        <div class="formula-badge">\\( \\text{Image in Y-axis: } (-x, y) \\)</div>
        <div class="formula-badge">\\( \\text{Image in Origin: } (-x, -y) \\)</div>
        <div class="formula-badge">\\( \\text{Image in line y = x: } (y, x) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Point P -->
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x =</span><input type="number" id="axesX" value="3" step="any"></div>
                <div class="coord-input"><span>y =</span><input type="number" id="axesY" value="4" step="any"></div>
            </div>
            
            <!-- Axis selection -->
            <div class="point-box" style="flex:1;">
                <label>Reflection Axis</label>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <label><input type="radio" name="axesOption" value="xaxis" checked> X-axis (y = 0)</label>
                    <label><input type="radio" name="axesOption" value="yaxis"> Y-axis (x = 0)</label>
                    <label><input type="radio" name="axesOption" value="origin"> Origin (0,0)</label>
                    <label><input type="radio" name="axesOption" value="yx"> Line y = x</label>
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
        
        <button class="calculate-btn" id="computeAxesImageBtn">
            <span>🪞</span> Find Image Point
        </button>
        
        <div class="result-highlight" id="axesImageResult">
            \\( Q = (3, -4) \\)
        </div>
        <div class="footnote">
            <strong>Special cases:</strong> Reflection in axes changes signs of coordinates. 
            Reflection in origin changes both signs. Reflection in y=x swaps coordinates.
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const xInp = document.getElementById('axesX');
    const yInp = document.getElementById('axesY');
    const compute = document.getElementById('computeAxesImageBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('axesImageResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x = validateNumber(xInp.value, 'x');
            const y = validateNumber(yInp.value, 'y');
            
            // Get selected axis
            const radios = document.getElementsByName('axesOption');
            let selected = 'xaxis';
            for (let radio of radios) {
                if (radio.checked) {
                    selected = radio.value;
                    break;
                }
            }
            
            // Calculate image point based on selection
            let imgX, imgY, axisDesc, rule;
            
            switch(selected) {
                case 'xaxis':
                    imgX = x;
                    imgY = -y;
                    axisDesc = 'X-axis (y = 0)';
                    rule = '(x, y) → (x, -y)';
                    break;
                case 'yaxis':
                    imgX = -x;
                    imgY = y;
                    axisDesc = 'Y-axis (x = 0)';
                    rule = '(x, y) → (-x, y)';
                    break;
                case 'origin':
                    imgX = -x;
                    imgY = -y;
                    axisDesc = 'Origin (0, 0)';
                    rule = '(x, y) → (-x, -y)';
                    break;
                case 'yx':
                    imgX = y;
                    imgY = x;
                    axisDesc = 'line y = x';
                    rule = '(x, y) → (y, x)';
                    break;
                default:
                    imgX = x;
                    imgY = -y;
                    axisDesc = 'X-axis (y = 0)';
                    rule = '(x, y) → (x, -y)';
            }

            // Draw the axes and points
            const minCoord = Math.min(Math.abs(x), Math.abs(y), Math.abs(imgX), Math.abs(imgY), 5);
            const maxCoord = Math.max(Math.abs(x), Math.abs(y), Math.abs(imgX), Math.abs(imgY), 5);
            const range = maxCoord + 2;
            
            const lineSegments = [
                // X-axis
                { from: {x: -range, y: 0}, to: {x: range, y: 0}, color: '#64748B', dash: [2,2], label: 'X-axis', width: 1.5 },
                // Y-axis
                { from: {x: 0, y: -range}, to: {x: 0, y: range}, color: '#64748B', dash: [2,2], label: 'Y-axis', width: 1.5 }
            ];
            
            // Add line y=x if selected
            if (selected === 'yx') {
                lineSegments.push({ from: {x: -range, y: -range}, to: {x: range, y: range}, color: '#ca8a04', dash: [5,3], label: 'y = x', width: 2 });
            }
            
            const specialPoints = [
                {x: x, y: y, label: 'P'},
                {x: imgX, y: imgY, label: 'Q'}
            ];

            drawGraph([], specialPoints, lineSegments);

            // Create steps
            const steps = [
                `① Original point P = (${fmt(x)}, ${fmt(y)})`,
                `② Reflection across ${axisDesc}`,
                `③ Rule: ${rule}`,
                `④ Apply the rule:`,
                `   x' = ${fmt(imgX)}`,
                `   y' = ${fmt(imgY)}`,
                `⑤ Image point Q = (${fmt(imgX)}, ${fmt(imgY)})`,
                `⑥ Verification: Distance from P to axis = distance from axis to Q`,
                selected === 'xaxis' ? `   Distance from P to X-axis = |${fmt(y)}|, from Q to X-axis = |${fmt(-y)}| ✓` :
                selected === 'yaxis' ? `   Distance from P to Y-axis = |${fmt(x)}|, from Q to Y-axis = |${fmt(-x)}| ✓` :
                selected === 'origin' ? `   P and Q are opposite points through origin ✓` :
                `   P and Q are symmetric about y = x ✓`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( Q = (${fmt(imgX)}, ${fmt(imgY)}) \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [xInp, yInp]);
        }
    }

    compute.addEventListener('click', update);
    [xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // Add change listeners to radio buttons
    const radios = document.getElementsByName('axesOption');
    for (let radio of radios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Foot of Perpendicular along a Given Direction =========
// ========= NEW: Foot of Perpendicular along a Given Direction (CORRECTED) =========
function renderFootAlongDirectionCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    const imagePointLineBtn = document.getElementById('imagePointLineBtn');
    const imagePointAxesBtn = document.getElementById('imagePointAxesBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    if(footPerpendicularBtn) footPerpendicularBtn.classList.remove('active-btn');
    if(imagePointLineBtn) imagePointLineBtn.classList.remove('active-btn');
    if(imagePointAxesBtn) imagePointAxesBtn.classList.remove('active-btn');
    
    // Activate this button
    const footAlongDirectionBtn = document.getElementById('footAlongDirectionBtn');
    footAlongDirectionBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🔻📐</span> Foot of Perpendicular along a Given Direction</h2>
        
        <div class="formula-badge">\\( \\text{Point } P(x_1, y_1) \\)</div>
        <div class="formula-badge">\\( \\text{Line L: } ax + by + c = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Direction vector } \\vec{d} = (d_x, d_y) \\)</div>
        <div class="formula-badge">\\( \\text{Foot F = point on L along direction from P} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Point P -->
            <div class="point-box" style="flex:1;">
                <label>Point P</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="dirX1" value="3" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="dirY1" value="4" step="any"></div>
            </div>
            
            <!-- Direction vector -->
            <div class="point-box" style="flex:1;">
                <label>Direction vector \\(\\vec{d}\\)</label>
                <div class="coord-input"><span>dₓ =</span><input type="number" id="dirDx" value="1" step="any"></div>
                <div class="coord-input"><span>dᵧ =</span><input type="number" id="dirDy" value="1" step="any"></div>
            </div>
            
            <!-- Line coefficients -->
            <div class="point-box" style="flex:1.5;">
                <label>Line: ax + by + c = 0</label>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="dirA" value="1" step="any" style="width:70px;"></div>
                    <div><span>b =</span> <input type="number" id="dirB" value="-1" step="any" style="width:70px;"></div>
                    <div><span>c =</span> <input type="number" id="dirC" value="0" step="any" style="width:70px;"></div>
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
        
        <button class="calculate-btn" id="computeFootDirBtn">
            <span>🔻📐</span> Find Foot Point
        </button>
        
        <div class="result-highlight" id="footDirResult">
            \\( F = (2.5, 5.5) \\)
        </div>
        <div class="footnote">
            <strong>Along a given direction:</strong> We move from point P in the direction \\(\\vec{d}\\) until we hit the line L.
            Parameter t = -(ax₁ + by₁ + c) / (a·dₓ + b·dᵧ), then F = P + t·\\(\\vec{d}\\).
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const x1Inp = document.getElementById('dirX1');
    const y1Inp = document.getElementById('dirY1');
    const dxInp = document.getElementById('dirDx');
    const dyInp = document.getElementById('dirDy');
    const aInp = document.getElementById('dirA');
    const bInp = document.getElementById('dirB');
    const cInp = document.getElementById('dirC');
    const compute = document.getElementById('computeFootDirBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('footDirResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const dx = validateNumber(dxInp.value, 'dₓ');
            const dy = validateNumber(dyInp.value, 'dᵧ');
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c = validateNumber(cInp.value, 'c');

            if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
                throw new Error('a and b cannot both be zero');
            }
            
            if (Math.abs(dx) < 1e-10 && Math.abs(dy) < 1e-10) {
                throw new Error('Direction vector cannot be zero');
            }

            // Calculate parameter t where P + t·d lies on line
            // Condition: a(x₁ + t·dₓ) + b(y₁ + t·dᵧ) + c = 0
            // t·(a·dₓ + b·dᵧ) = -(a·x₁ + b·y₁ + c)
            
            const denominator = a*dx + b*dy;
            
            if (Math.abs(denominator) < 1e-10) {
                throw new Error('Direction is parallel to the line (no intersection)');
            }
            
            const numerator = -(a*x1 + b*y1 + c);
            const t = numerator / denominator;
            
            const footX = x1 + t * dx;
            const footY = y1 + t * dy;

            // Draw the line and the direction
            // Calculate appropriate bounds for the graph
            const points = [
                {x: x1, y: y1},
                {x: footX, y: footY}
            ];
            
            // Add direction arrow endpoint
            const arrowEnd = {x: x1 + dx, y: y1 + dy};
            
            // Calculate bounds for all points
            let minX = Math.min(x1, footX, arrowEnd.x, 0) - 2;
            let maxX = Math.max(x1, footX, arrowEnd.x, 0) + 2;
            let minY = Math.min(y1, footY, arrowEnd.y, 0) - 2;
            let maxY = Math.max(y1, footY, arrowEnd.y, 0) + 2;
            
            // Ensure the line is visible within these bounds
            if (Math.abs(b) > 1e-10) {
                // For non-vertical lines, extend the line to the graph boundaries
                const lineAtMinX = {x: minX, y: (-a*minX - c)/b};
                const lineAtMaxX = {x: maxX, y: (-a*maxX - c)/b};
                
                // Update bounds based on line endpoints
                minX = Math.min(minX, lineAtMinX.x);
                maxX = Math.max(maxX, lineAtMaxX.x);
                minY = Math.min(minY, lineAtMinX.y, lineAtMaxX.y);
                maxY = Math.max(maxY, lineAtMinX.y, lineAtMaxX.y);
            }
            
            // Add padding
            const padding = 2;
            minX -= padding;
            maxX += padding;
            minY -= padding;
            maxY += padding;
            
            // Create datasets for the graph
            const datasets = [];
            
            // Add the line
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
                    {x: xConst, y: minY},
                    {x: xConst, y: maxY}
                ];
            }
            
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
            
            // Add direction vector (dashed)
            datasets.push({
                label: 'Direction',
                data: [{x: x1, y: y1}, arrowEnd],
                backgroundColor: 'transparent',
                borderColor: '#ca8a04',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            
            // Add path from P to foot (dashed)
            datasets.push({
                label: 'Path to foot',
                data: [{x: x1, y: y1}, {x: footX, y: footY}],
                backgroundColor: 'transparent',
                borderColor: '#d44c2f',
                borderWidth: 2,
                borderDash: [8, 4],
                pointRadius: 0,
                showLine: true,
                fill: false
            });
            
            // Add points P and F
            datasets.push({
                label: 'P',
                data: [{x: x1, y: y1}],
                backgroundColor: '#d44c2f',
                pointRadius: 8,
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 2
            });
            
            datasets.push({
                label: 'F',
                data: [{x: footX, y: footY}],
                backgroundColor: '#1f7f6a',
                pointRadius: 8,
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 2
            });

            // Destroy previous chart and create new one
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
                        x: { 
                            type: 'linear', 
                            position: 'bottom', 
                            min: minX, 
                            max: maxX,
                            grid: { color: '#cbd5e1' },
                            title: { display: true, text: 'x' }
                        },
                        y: { 
                            min: minY, 
                            max: maxY,
                            grid: { color: '#cbd5e1' },
                            title: { display: true, text: 'y' }
                        }
                    }
                }
            });

            // Create steps
            const steps = [
                `① Point P(${fmt(x1)}, ${fmt(y1)})`,
                `② Direction vector \\(\\vec{d} = (${fmt(dx)}, ${fmt(dy)})\\)`,
                `③ Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                `④ Parametric form: (x, y) = (${fmt(x1)}, ${fmt(y1)}) + t·(${fmt(dx)}, ${fmt(dy)})`,
                `⑤ Substitute into line equation:`,
                `   a(${fmt(x1)} + t·${fmt(dx)}) + b(${fmt(y1)} + t·${fmt(dy)}) + ${fmt(c)} = 0`,
                `   ${fmt(a*x1)} + ${fmt(a*dx)}t + ${fmt(b*y1)} + ${fmt(b*dy)}t + ${fmt(c)} = 0`,
                `   (${fmt(a*dx + b*dy)})t + (${fmt(a*x1 + b*y1 + c)}) = 0`,
                `⑥ Solve for t:`,
                `   t = -(${fmt(a*x1 + b*y1 + c)}) / (${fmt(denominator)}) = ${fmt(t)}`,
                `⑦ Foot coordinates:`,
                `   x_f = ${fmt(x1)} + ${fmt(t)}·${fmt(dx)} = ${fmt(footX)}`,
                `   y_f = ${fmt(y1)} + ${fmt(t)}·${fmt(dy)} = ${fmt(footY)}`,
                `⑧ Foot point F = (${fmt(footX)}, ${fmt(footY)})`,
                `⑨ Verification: Check that F lies on line:`,
                `   ${fmt(a)}·${fmt(footX)} + ${fmt(b)}·${fmt(footY)} + ${fmt(c)} = ${fmt(a*footX + b*footY + c)} ≈ 0 ✓`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( F = (${fmt(footX)}, ${fmt(footY)}) \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            resultDiv.innerHTML = '';
            stepsDiv.innerHTML = '';
            if (typeof destroyGraph === 'function') destroyGraph();
            showError(e.message, [x1Inp, y1Inp, dxInp, dyInp, aInp, bInp, cInp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, dxInp, dyInp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [x1Inp, y1Inp, dxInp, dyInp, aInp, bInp, cInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // Initial update
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// ========= NEW: Angle Made by a Line with Axes (Direction Cosines) =========
function renderAngleWithAxesCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    const imagePointLineBtn = document.getElementById('imagePointLineBtn');
    const imagePointAxesBtn = document.getElementById('imagePointAxesBtn');
    const footAlongDirectionBtn = document.getElementById('footAlongDirectionBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    if(footPerpendicularBtn) footPerpendicularBtn.classList.remove('active-btn');
    if(imagePointLineBtn) imagePointLineBtn.classList.remove('active-btn');
    if(imagePointAxesBtn) imagePointAxesBtn.classList.remove('active-btn');
    if(footAlongDirectionBtn) footAlongDirectionBtn.classList.remove('active-btn');
    
    // Activate this button
    const angleWithAxesBtn = document.getElementById('angleWithAxesBtn');
    angleWithAxesBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📐↔️</span> Angle Made by a Line with Axes</h2>
        
        <div class="formula-badge">\\( \\text{Direction cosines in 2D: } \\cos \\alpha, \\cos \\beta \\)</div>
        <div class="formula-badge">\\( \\cos^2 \\alpha + \\cos^2 \\beta = 1 \\)</div>
        <div class="formula-badge">\\( \\alpha = \\text{angle with x-axis}, \\quad \\beta = \\text{angle with y-axis} \\)</div>
        <div class="formula-badge">\\( \\beta = 90° - \\alpha \\quad \\text{(in 2D)} \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <!-- Line input method toggle -->
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px; width:100%;">
                <button class="mode-option selected" id="angleAxesModeSlope">📈 By Slope</button>
                <button class="mode-option" id="angleAxesModeEquation">📐 By Equation</button>
                <button class="mode-option" id="angleAxesModePoints">🔢 By Two Points</button>
            </div>
        </div>
        
        <!-- Slope input mode (default) -->
        <div id="angleAxesSlopeInput">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box" style="flex:1;">
                    <label>Slope</label>
                    <div class="coord-input"><span>m =</span><input type="number" id="angleAxesM" value="2" step="any"></div>
                    <div style="font-size:0.9rem; margin-top:8px;">Slope of the line</div>
                </div>
            </div>
        </div>
        
        <!-- Equation input mode (hidden by default) -->
        <div id="angleAxesEquationInput" style="display:none;">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box" style="flex:1;">
                    <label>Line: ax + by + c = 0</label>
                    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                        <div><span>a =</span> <input type="number" id="angleAxesA" value="1" step="any" style="width:70px;"></div>
                        <div><span>b =</span> <input type="number" id="angleAxesB" value="-2" step="any" style="width:70px;"></div>
                        <div><span>c =</span> <input type="number" id="angleAxesC" value="3" step="any" style="width:70px;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Points input mode (hidden by default) -->
        <div id="angleAxesPointsInput" style="display:none;">
            <div class="input-group" style="justify-content:center;">
                <div class="point-box">
                    <label>Point A</label>
                    <div class="coord-input"><span>x₁ =</span><input type="number" id="angleAxesX1" value="1" step="any"></div>
                    <div class="coord-input"><span>y₁ =</span><input type="number" id="angleAxesY1" value="2" step="any"></div>
                </div>
                <div class="point-box">
                    <label>Point B</label>
                    <div class="coord-input"><span>x₂ =</span><input type="number" id="angleAxesX2" value="3" step="any"></div>
                    <div class="coord-input"><span>y₂ =</span><input type="number" id="angleAxesY2" value="6" step="any"></div>
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
        
        <button class="calculate-btn" id="computeAngleAxesBtn">
            <span>📐</span> Calculate Angles
        </button>
        
        <div class="result-highlight" id="angleAxesResult">
            \\( \\alpha = 63.4349°, \\quad \\beta = 26.5651° \\)
        </div>
        <div class="footnote">
            <strong>Direction Cosines:</strong> cos α = direction ratio with x-axis, cos β = direction ratio with y-axis.<br>
            For a line making angle α with x-axis, slope m = tan α, and cos β = sin α.<br>
            In 2D, α + β = 90° (angles are complementary).
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get mode elements
    const modeSlope = document.getElementById('angleAxesModeSlope');
    const modeEquation = document.getElementById('angleAxesModeEquation');
    const modePoints = document.getElementById('angleAxesModePoints');
    const slopeInput = document.getElementById('angleAxesSlopeInput');
    const equationInput = document.getElementById('angleAxesEquationInput');
    const pointsInput = document.getElementById('angleAxesPointsInput');
    
    const compute = document.getElementById('computeAngleAxesBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('angleAxesResult');

    // Mode switching
    modeSlope.addEventListener('click', () => {
        modeSlope.classList.add('selected');
        modeEquation.classList.remove('selected');
        modePoints.classList.remove('selected');
        slopeInput.style.display = 'block';
        equationInput.style.display = 'none';
        pointsInput.style.display = 'none';
    });
    
    modeEquation.addEventListener('click', () => {
        modeEquation.classList.add('selected');
        modeSlope.classList.remove('selected');
        modePoints.classList.remove('selected');
        slopeInput.style.display = 'none';
        equationInput.style.display = 'block';
        pointsInput.style.display = 'none';
    });
    
    modePoints.addEventListener('click', () => {
        modePoints.classList.add('selected');
        modeSlope.classList.remove('selected');
        modeEquation.classList.remove('selected');
        slopeInput.style.display = 'none';
        equationInput.style.display = 'none';
        pointsInput.style.display = 'block';
    });

    function update() {
        clearErrors();
        
        try {
            let m;
            let steps = [];
            let linePoints = [];
            
            // Determine which input mode is active
            if (modeSlope.classList.contains('selected')) {
                // Slope mode
                const mInp = document.getElementById('angleAxesM');
                m = validateNumber(mInp.value, 'm');
                
                steps = [
                    `① Given slope m = ${fmt(m)}`,
                    `② For a line, slope m = tan α, where α is angle with positive x-axis`,
                    `③ α = arctan(m) = arctan(${fmt(m)})`,
                ];
                
                // For graphing, create line through origin with given slope
                linePoints = [
                    {x: -5, y: -5 * m},
                    {x: 5, y: 5 * m}
                ];
                
            } else if (modeEquation.classList.contains('selected')) {
                // Equation mode
                const aInp = document.getElementById('angleAxesA');
                const bInp = document.getElementById('angleAxesB');
                
                const a = validateNumber(aInp.value, 'a');
                const b = validateNumber(bInp.value, 'b');
                
                if (Math.abs(b) < 1e-10) {
                    m = Infinity; // vertical line
                    steps = [
                        `① Line: ${fmt(a)}x + ${fmt(b)}y + c = 0`,
                        `② Since b = 0, the line is VERTICAL`,
                        `③ For a vertical line, angle with x-axis α = 90°`,
                    ];
                } else {
                    m = -a / b;
                    steps = [
                        `① Line: ${fmt(a)}x + ${fmt(b)}y + c = 0`,
                        `② Slope formula: m = -a/b = -(${fmt(a)})/${fmt(b)} = ${fmt(m)}`,
                        `③ For a line, slope m = tan α, where α is angle with positive x-axis`,
                        `④ α = arctan(m) = arctan(${fmt(m)})`,
                    ];
                }
                
                // For graphing
                const minX = -5, maxX = 5;
                if (Math.abs(b) > 1e-10) {
                    linePoints = [
                        {x: minX, y: (-a*minX)/b},
                        {x: maxX, y: (-a*maxX)/b}
                    ];
                } else {
                    // Vertical line
                    linePoints = [
                        {x: -a, y: minX},
                        {x: -a, y: maxX}
                    ];
                }
                
            } else {
                // Points mode
                const x1 = document.getElementById('angleAxesX1');
                const y1 = document.getElementById('angleAxesY1');
                const x2 = document.getElementById('angleAxesX2');
                const y2 = document.getElementById('angleAxesY2');
                
                const x1v = validateNumber(x1.value, 'x₁');
                const y1v = validateNumber(y1.value, 'y₁');
                const x2v = validateNumber(x2.value, 'x₂');
                const y2v = validateNumber(y2.value, 'y₂');
                
                const dx = x2v - x1v;
                const dy = y2v - y1v;
                
                if (Math.abs(dx) < 1e-10) {
                    m = Infinity; // vertical line
                    steps = [
                        `① Point A(${fmt(x1v)}, ${fmt(y1v)}), Point B(${fmt(x2v)}, ${fmt(y2v)})`,
                        `② Δx = ${fmt(dx)} ≈ 0, so line is VERTICAL`,
                        `③ For a vertical line, angle with x-axis α = 90°`,
                    ];
                } else {
                    m = dy / dx;
                    steps = [
                        `① Point A(${fmt(x1v)}, ${fmt(y1v)}), Point B(${fmt(x2v)}, ${fmt(y2v)})`,
                        `② Δx = ${fmt(dx)}, Δy = ${fmt(dy)}`,
                        `③ Slope m = Δy/Δx = ${fmt(dy)}/${fmt(dx)} = ${fmt(m)}`,
                        `④ For a line, slope m = tan α, where α is angle with positive x-axis`,
                        `⑤ α = arctan(m) = arctan(${fmt(m)})`,
                    ];
                }
                
                // For graphing
                linePoints = [
                    {x: x1v - 5, y: y1v - 5 * (m === Infinity ? 0 : m)},
                    {x: x2v + 5, y: y2v + 5 * (m === Infinity ? 0 : m)}
                ];
            }

            // Calculate angles
            let alphaDeg, betaDeg, cosAlpha, cosBeta;
            
            if (m === Infinity) {
                // Vertical line
                alphaDeg = 90;
                betaDeg = 0;
                cosAlpha = 0;
                cosBeta = 1;
                
                steps.push(`④ For vertical line, α = 90°, β = 0°`);
                steps.push(`⑤ Direction cosines: cos α = 0, cos β = 1`);
            } else {
                // Calculate angle with x-axis
                alphaDeg = Math.atan(m) * 180 / Math.PI;
                // Ensure angle is between 0 and 180
                if (alphaDeg < 0) alphaDeg += 180;
                
                // In 2D, angle with y-axis is 90° - α
                betaDeg = 90 - alphaDeg;
                if (betaDeg < 0) betaDeg += 180;
                
                // Direction cosines
                cosAlpha = Math.cos(alphaDeg * Math.PI / 180);
                cosBeta = Math.cos(betaDeg * Math.PI / 180);
                
                steps.push(`④ α = arctan(${fmt(m)}) = ${fmt(alphaDeg)}°`);
                steps.push(`⑤ In 2D, angle with y-axis β = 90° - α = 90° - ${fmt(alphaDeg)}° = ${fmt(betaDeg)}°`);
                steps.push(`⑥ Direction cosines: cos α = ${fmt(cosAlpha)}, cos β = ${fmt(cosBeta)}`);
                steps.push(`⑦ Verification: cos²α + cos²β = ${fmt(cosAlpha*cosAlpha + cosBeta*cosBeta)} ≈ 1 ✓`);
            }

            // Draw the line
            const lineSegments = [
                { 
                    from: linePoints[0], 
                    to: linePoints[1], 
                    color: '#2c3e50', 
                    dash: [], 
                    label: 'Line', 
                    width: 2 
                }
            ];

            drawGraph([], [], lineSegments);

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\alpha = ${fmt(alphaDeg)}°, \\quad \\beta = ${fmt(betaDeg)}° \\)<br>` +
                `\\( \\cos \\alpha = ${fmt(cosAlpha)}, \\quad \\cos \\beta = ${fmt(cosBeta)} \\)`;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            // Collect error inputs based on mode
            const errorInputs = [];
            if (modeSlope.classList.contains('selected')) {
                errorInputs.push(document.getElementById('angleAxesM'));
            } else if (modeEquation.classList.contains('selected')) {
                errorInputs.push(
                    document.getElementById('angleAxesA'),
                    document.getElementById('angleAxesB')
                );
            } else {
                errorInputs.push(
                    document.getElementById('angleAxesX1'),
                    document.getElementById('angleAxesY1'),
                    document.getElementById('angleAxesX2'),
                    document.getElementById('angleAxesY2')
                );
            }
            showError(e.message, errorInputs);
        }
    }

    compute.addEventListener('click', update);
    
    // Add enter key listeners
    const allInputs = [
        'angleAxesM',
        'angleAxesA', 'angleAxesB',
        'angleAxesX1', 'angleAxesY1', 'angleAxesX2', 'angleAxesY2'
    ];
    
    allInputs.forEach(id => {
        const inp = document.getElementById(id);
        if (inp) {
            inp.addEventListener('keypress', e => e.key === 'Enter' && update());
            inp.addEventListener('input', clearErrors);
        }
    });
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}

// ========= NEW: Line Making Given Intercepts with Axes =========
function renderInterceptApplicationsCard() {
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
    
    // Deactivate other angle-related buttons
    const angleBetweenLinesBtn = document.getElementById('angleBetweenLinesBtn');
    const parallelismBtn = document.getElementById('parallelismBtn');
    const perpendicularityBtn = document.getElementById('perpendicularityBtn');
    const intersectionPointBtn = document.getElementById('intersectionPointBtn');
    const lineParallelBtn = document.getElementById('lineParallelBtn');
    const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
    const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
    const imagePointLineBtn = document.getElementById('imagePointLineBtn');
    const imagePointAxesBtn = document.getElementById('imagePointAxesBtn');
    const footAlongDirectionBtn = document.getElementById('footAlongDirectionBtn');
    const angleWithAxesBtn = document.getElementById('angleWithAxesBtn');
    
    if(angleBetweenLinesBtn) angleBetweenLinesBtn.classList.remove('active-btn');
    if(parallelismBtn) parallelismBtn.classList.remove('active-btn');
    if(perpendicularityBtn) perpendicularityBtn.classList.remove('active-btn');
    if(intersectionPointBtn) intersectionPointBtn.classList.remove('active-btn');
    if(lineParallelBtn) lineParallelBtn.classList.remove('active-btn');
    if(linePerpendicularBtn) linePerpendicularBtn.classList.remove('active-btn');
    if(footPerpendicularBtn) footPerpendicularBtn.classList.remove('active-btn');
    if(imagePointLineBtn) imagePointLineBtn.classList.remove('active-btn');
    if(imagePointAxesBtn) imagePointAxesBtn.classList.remove('active-btn');
    if(footAlongDirectionBtn) footAlongDirectionBtn.classList.remove('active-btn');
    if(angleWithAxesBtn) angleWithAxesBtn.classList.remove('active-btn');
    
    // Activate this button
    const interceptApplicationsBtn = document.getElementById('interceptApplicationsBtn');
    interceptApplicationsBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📊</span> Line Making Given Intercepts with Axes</h2>
        
        <div class="formula-badge">\\( \\text{Intercept form: } \\frac{x}{a} + \\frac{y}{b} = 1 \\)</div>
        <div class="formula-badge">\\( a = \\text{x-intercept}, \\quad b = \\text{y-intercept} \\)</div>
        <div class="formula-badge">\\( \\text{Line passes through } (a,0) \\text{ and } (0,b) \\)</div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Intercepts</label>
                <div class="coord-input">
                    <span>a (x-intercept) =</span>
                    <input type="number" id="interceptAppA" value="4" step="any">
                </div>
                <div class="coord-input">
                    <span>b (y-intercept) =</span>
                    <input type="number" id="interceptAppB" value="3" step="any">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#856404;">
                    <strong>Note:</strong> a ≠ 0, b ≠ 0
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Applications</label>
                <div style="margin:10px 0;">
                    <label><input type="radio" name="interceptAppType" value="equation" checked> Show equation</label><br>
                    <label><input type="radio" name="interceptAppType" value="area"> Area of triangle</label><br>
                    <label><input type="radio" name="interceptAppType" value="length"> Length between intercepts</label><br>
                    <label><input type="radio" name="interceptAppType" value="slope"> Slope from intercepts</label>
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
        
        <button class="calculate-btn" id="computeInterceptAppBtn">
            <span>📊</span> Analyze
        </button>
        
        <div class="result-highlight" id="interceptAppResult">
            \\( \\frac{x}{4} + \\frac{y}{3} = 1 \\)
        </div>
        <div class="footnote">
            <strong>Applications of intercept form:</strong><br>
            • Equation: x/a + y/b = 1<br>
            • Area of triangle formed with axes = ½|ab|<br>
            • Length between intercepts = √(a² + b²)<br>
            • Slope from intercepts = -b/a
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const aInp = document.getElementById('interceptAppA');
    const bInp = document.getElementById('interceptAppB');
    const compute = document.getElementById('computeInterceptAppBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('interceptAppResult');

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const a = validateNumber(aInp.value, 'a (x-intercept)');
            const b = validateNumber(bInp.value, 'b (y-intercept)');
            
            if (Math.abs(a) < 1e-10) {
                throw new Error('x-intercept (a) cannot be zero');
            }
            if (Math.abs(b) < 1e-10) {
                throw new Error('y-intercept (b) cannot be zero');
            }
            
            // Get selected application type
            const radios = document.getElementsByName('interceptAppType');
            let selectedType = 'equation';
            for (let radio of radios) {
                if (radio.checked) {
                    selectedType = radio.value;
                    break;
                }
            }

            // Calculate based on type
            let resultText = '';
            let steps = [];
            
            // Common points
            const xIntercept = {x: a, y: 0};
            const yIntercept = {x: 0, y: b};
            
            // For graph
            let minX = Math.min(0, a) - 2;
            let maxX = Math.max(0, a) + 2;
            let minY = Math.min(0, b) - 2;
            let maxY = Math.max(0, b) + 2;
            
            const linePoints = [
                {x: minX, y: b * (1 - minX/a)},
                {x: maxX, y: b * (1 - maxX/a)}
            ];
            
            const specialPoints = [
                {x: a, y: 0, label: `(${fmt(a)},0)`},
                {x: 0, y: b, label: `(0,${fmt(b)})`}
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

            drawGraph([], specialPoints, lineSegments);

            // Generate steps based on selected type
            if (selectedType === 'equation') {
                const area = Math.abs(a * b) / 2;
                const length = Math.sqrt(a*a + b*b);
                const slope = -b/a;
                
                steps = [
                    `① Intercept form: x/a + y/b = 1`,
                    `② Given x-intercept a = ${fmt(a)}, y-intercept b = ${fmt(b)}`,
                    `③ Equation: x/${fmt(a)} + y/${fmt(b)} = 1`,
                    `④ The line passes through (${fmt(a)}, 0) and (0, ${fmt(b)})`,
                    `⑤ Area of triangle with axes = ½|ab| = ½|${fmt(a)}·${fmt(b)}| = ${fmt(area)}`,
                    `⑥ Length between intercepts = √(a² + b²) = √(${fmt(a*a)} + ${fmt(b*b)}) = √${fmt(a*a + b*b)} = ${fmt(length)}`,
                    `⑦ Slope from intercepts = -b/a = -${fmt(b)}/${fmt(a)} = ${fmt(slope)}`
                ];
                resultText = `\\( \\frac{x}{${fmt(a)}} + \\frac{y}{${fmt(b)}} = 1 \\)`;
                
            } else if (selectedType === 'area') {
                const area = Math.abs(a * b) / 2;
                steps = [
                    `① Intercept form: x/a + y/b = 1`,
                    `② Given x-intercept a = ${fmt(a)}, y-intercept b = ${fmt(b)}`,
                    `③ The line and axes form a right triangle`,
                    `④ Base of triangle = |a| = ${Math.abs(fmt(a))}`,
                    `⑤ Height of triangle = |b| = ${Math.abs(fmt(b))}`,
                    `⑥ Area = ½ × base × height = ½ × ${Math.abs(fmt(a))} × ${Math.abs(fmt(b))} = ${fmt(area)}`,
                    `⑦ Area of triangle formed with axes = ${fmt(area)} square units`
                ];
                resultText = `\\( \\text{Area} = \\frac{1}{2}|ab| = ${fmt(area)} \\)`;
                
            } else if (selectedType === 'length') {
                const length = Math.sqrt(a*a + b*b);
                steps = [
                    `① Intercept form: x/a + y/b = 1`,
                    `② Given x-intercept a = ${fmt(a)}, y-intercept b = ${fmt(b)}`,
                    `③ The intercept points are A(${fmt(a)}, 0) and B(0, ${fmt(b)})`,
                    `④ Distance between intercepts: d = √[(x₂-x₁)² + (y₂-y₁)²]`,
                    `⑤ d = √[(${fmt(0)} - ${fmt(a)})² + (${fmt(b)} - ${fmt(0)})²]`,
                    `⑥ d = √[(${fmt(-a)})² + (${fmt(b)})²] = √(${fmt(a*a)} + ${fmt(b*b)})`,
                    `⑦ d = √${fmt(a*a + b*b)} = ${fmt(length)}`
                ];
                resultText = `\\( d = \\sqrt{a^2 + b^2} = ${fmt(length)} \\)`;
                
            } else if (selectedType === 'slope') {
                const slope = -b/a;
                steps = [
                    `① Intercept form: x/a + y/b = 1`,
                    `② Given x-intercept a = ${fmt(a)}, y-intercept b = ${fmt(b)}`,
                    `③ Slope formula: m = (y₂ - y₁)/(x₂ - x₁)`,
                    `④ Using intercept points (${fmt(a)}, 0) and (0, ${fmt(b)})`,
                    `⑤ m = (${fmt(b)} - 0)/(0 - ${fmt(a)}) = ${fmt(b)}/(-${fmt(a)}) = -${fmt(b)}/${fmt(a)}`,
                    `⑥ m = ${fmt(slope)}`
                ];
                resultText = `\\( m = -\\frac{b}{a} = ${fmt(slope)} \\)`;
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [aInp, bInp]);
        }
    }

    compute.addEventListener('click', update);
    [aInp, bInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [aInp, bInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    
    // Add change listeners to radio buttons
    const radios = document.getElementsByName('interceptAppType');
    for (let radio of radios) {
        radio.addEventListener('change', update);
    }
    
    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}