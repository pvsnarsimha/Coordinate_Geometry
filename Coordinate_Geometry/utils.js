    // ========= OPTIMIZATION: Lazy loading registry =========
const lazyFunctions = new Map();

function registerLazyFunction(name, loader) {
    lazyFunctions.set(name, loader);
}

function loadLazyFunction(name) {
    const loader = lazyFunctions.get(name);
    if (loader && !window[name]) {
        console.log(`🔄 Lazy loading: ${name}`);
        loader();
    }
    return window[name];
}

// Function to load all lazy functions when needed
function loadAllLazy() {
    for (const [name, loader] of lazyFunctions) {
        if (!window[name]) {
            loader();
        }
    }
}

// Defer heavy initializations until after page load
window.addEventListener('DOMContentLoaded', () => {
    // Only load what's needed for initial view
    setTimeout(() => {
        // Load remaining functions in background
        loadAllLazy();
    }, 500);
});
// Debounce graph updates
let graphUpdateTimeout = null;
let pendingDrawRequest = false;


    // global toggle for steps visibility
            let stepsVisible = true;
            const distanceBtn = document.getElementById('distanceBtn');
const sectionBtn = document.getElementById('sectionBtn');
const midpointBtn = document.getElementById('midpointBtn');
const centroidBtn = document.getElementById('centroidBtn');
const areaBtn = document.getElementById('areaBtn');
const collinearBtn = document.getElementById('collinearBtn');
const pointLineBtn = document.getElementById('pointLineBtn');
const parallelLinesBtn = document.getElementById('parallelLinesBtn');
// ADD THIS NEW LINE
const slopeBtn = document.getElementById('slopeBtn');
/**
 * Renders LaTeX math in the document using KaTeX
 * @returns {void}
 */

            function renderLatex() {
                if (typeof renderMathInElement === 'function') {
                    renderMathInElement(document.body, {
                        delimiters: [
                            {left: '$$', right: '$$', display: true},
                            {left: '\\(', right: '\\)', display: false},
                            {left: '\\[', right: '\\]', display: true}
                        ],
                        throwOnError: false,
                        trust: true
                    });
                }
            }
/**
 * Validates a numeric input value
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {number} [min=-1e10] - Minimum allowed value
 * @param {number} [max=1e10] - Maximum allowed value
 * @returns {number} The validated number
 * @throws {Error} If validation fails
 */

          function validateNumber(value, fieldName, min = -1e10, max = 1e10) {
    // Handle null, undefined, empty string
    if (value === null || value === undefined || value === '') {
        throw new Error(`${fieldName} cannot be empty`);
    }
    
    const num = parseFloat(value);
    
    // Check for NaN
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    
    // Check for Infinity
    if (!isFinite(num)) {
        throw new Error(`${fieldName} must be a finite number`);
    }
    
    // Check for extreme values
    if (num < min || num > max) {
        throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
    
    // Additional check for scientific notation overflow
    if (Math.abs(num) > 1e15) {
        throw new Error(`${fieldName} value is too large (max: 1e15)`);
    }
    
    return num;
}
/**
 * Validates a positive numeric value
 * @param {string|number} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {boolean} [allowZero=false] - Whether zero is allowed
 * @returns {number} The validated positive number
 * @throws {Error} If validation fails
 */

function validatePositiveNumber(value, fieldName, allowZero = false) {
    const num = validateNumber(value, fieldName, 0, 1e9);
    
    if (!allowZero && num <= 0) {
        throw new Error(`${fieldName} must be positive (greater than 0)`);
    }
    if (allowZero && num < 0) {
        throw new Error(`${fieldName} must be >= 0`);
    }
    
    return num;
}
// Add this helper function at the top of utils.js
function sanitizeInput(inputElement) {
    // Remove any non-numeric characters except minus sign, decimal, and scientific notation
    if (inputElement && inputElement.value) {
        // Allow negative sign, digits, decimal, and scientific notation
        let sanitized = inputElement.value.replace(/[^-0-9.eE]/g, '');
        if (sanitized === '' || sanitized === '-') sanitized = '0';
        if (sanitized !== inputElement.value) {
            inputElement.value = sanitized;
        }
    }
}
/**
 * Clears all error messages and error classes from inputs
 * @returns {void}
 */

            function clearErrors() {
                document.querySelectorAll('input.error').forEach(inp => inp.classList.remove('error'));
                document.querySelectorAll('.error-message').forEach(el => el.remove());
            }
/**
 * Displays an error message and highlights invalid inputs
 * @param {string} message - The error message to display
 * @param {Array<HTMLElement>} inputs - Array of input elements to highlight
 * @returns {void}
 */

            function showError(message, inputs = []) {
                inputs.forEach(inp => { if(inp) inp.classList.add('error'); });
                const container = document.querySelector('.calculate-btn')?.parentNode;
                if (!container) return;
                const oldErr = document.querySelector('.error-message');
                if (oldErr) oldErr.remove();
                const errDiv = document.createElement('div');
                errDiv.className = 'error-message';
                errDiv.textContent = message;
                container.insertBefore(errDiv, document.querySelector('.calculate-btn')?.nextSibling);
            }
/**
 * Formats a number to 4 decimal places or uses scientific notation for large numbers
 * @param {number} n - The number to format
 * @returns {string} Formatted number string
 */

            function fmt(n) { return Math.round(n * 10000) / 10000; }

            // graph chart instance
            let chartInstance = null;

            function destroyGraph() {
                if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
            }
/**
 * Calculates smart bounds for graph based on points
 * @param {Array<Object>} points - Array of points {x, y}
 * @returns {Object} Object containing minX, maxX, minY, maxY
 */

            function smartBounds(points) {
                const allX = [], allY = [];
                points.forEach(p => { if (p && p.x !== undefined && p.y !== undefined) { allX.push(p.x); allY.push(p.y); } });
                if (allX.length === 0) return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
                
                let minX = Math.min(...allX), maxX = Math.max(...allX);
                let minY = Math.min(...allY), maxY = Math.max(...allY);
                
                if (0 < minX || 0 > maxX) { minX = Math.min(minX, 0); maxX = Math.max(maxX, 0); }
                if (0 < minY || 0 > maxY) { minY = Math.min(minY, 0); maxY = Math.max(maxY, 0); }

                let rangeX = maxX - minX || 4;
                let rangeY = maxY - minY || 4;
                let padX = Math.max(1.5, rangeX * 0.25);
                let padY = Math.max(1.5, rangeY * 0.25);
                
                if (Math.abs(maxX) > 1000 || Math.abs(minX) > 1000) padX = rangeX * 0.4;
                if (Math.abs(maxY) > 1000 || Math.abs(minY) > 1000) padY = rangeY * 0.4;
                
                minX -= padX; maxX += padX;
                minY -= padY; maxY += padY;

                return { minX, maxX, minY, maxY };
            }
// Global variables for optimization

let lastDrawParams = null;
/**
 * Draws a coordinate graph with points, line segments, and special points
 * with optimized chart reuse to avoid destroy/recreate cycles
 * @param {Array<Object>} pointsArray - Array of points to plot {x, y}
 * @param {Array<Object>} specialPoints - Array of special points with labels {x, y, label}
 * @param {Array<Object>} lineSegments - Array of line segments {from: {x,y}, to: {x,y}, color, dash, label, width}
 * @param {Object} options - Optional configuration { bounds, skipAnimation }
 * @returns {void}
 */
function drawGraph(pointsArray, specialPoints = [], lineSegments = [], options = {}) {
    // Clear any pending updates (debouncing)
    if (graphUpdateTimeout) {
        clearTimeout(graphUpdateTimeout);
    }
    
    // Debounce for 16ms (60fps) to prevent rapid redraws
    graphUpdateTimeout = setTimeout(() => {
        const ctx = document.getElementById('coordinateGraph')?.getContext('2d');
        if (!ctx) return;
        
        // Calculate all points for bounds
        const allPoints = [...pointsArray, ...specialPoints].filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');
        const bounds = options.bounds || smartBounds(allPoints);
        
        // Create a hash of current drawing parameters to check if we need to redraw
        const currentParams = {
            pointsHash: JSON.stringify(allPoints.map(p => `${p.x},${p.y}`).sort()),
            segmentsHash: JSON.stringify(lineSegments.map(s => `${s.from.x},${s.from.y},${s.to.x},${s.to.y},${s.color}`).sort()),
            specialCount: specialPoints.length,
            boundsHash: `${bounds.minX},${bounds.maxX},${bounds.minY},${bounds.maxY}`
        };
        
        // Check if we can reuse existing chart (same data)
        if (chartInstance && lastDrawParams && 
            lastDrawParams.pointsHash === currentParams.pointsHash &&
            lastDrawParams.segmentsHash === currentParams.segmentsHash &&
            lastDrawParams.specialCount === currentParams.specialCount &&
            lastDrawParams.boundsHash === currentParams.boundsHash) {
            // No changes needed, skip redraw
            return;
        }
        
        // Store current params for next comparison
        lastDrawParams = currentParams;
        
        const datasets = [];
        
        // Add main points A, B, C (colored circles)
        const pointColors = ['#d44c2f', '#1f7f6a', '#ca8a04'];
        const pointLabels = ['A', 'B', 'C'];
        for (let i = 0; i < pointsArray.length && i < 3; i++) {
            datasets.push({ 
                label: pointLabels[i], 
                data: [{ x: pointsArray[i].x, y: pointsArray[i].y }], 
                backgroundColor: pointColors[i], 
                pointRadius: 8, 
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 2
            });
        }
        
        // Add line segments - optimized batch processing
        if (lineSegments && lineSegments.length) {
            for (let i = 0; i < lineSegments.length; i++) {
                const seg = lineSegments[i];
                datasets.push({
                    label: seg.label || '',
                    data: [seg.from, seg.to],
                    backgroundColor: 'transparent',
                    borderColor: seg.color || '#64748B',
                    borderWidth: seg.width || 2,
                    borderDash: seg.dash || [],
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                    tension: 0,
                    order: 0
                });
            }
        }
        
        // Add special points (centroid, etc.)
        if (specialPoints && specialPoints.length) {
            for (let i = 0; i < specialPoints.length; i++) {
                const pt = specialPoints[i];
                datasets.push({ 
                    label: pt.label || 'G', 
                    data: [{ x: pt.x, y: pt.y }], 
                    backgroundColor: '#2b3595', 
                    pointRadius: 12, 
                    pointStyle: 'triangle',
                    borderColor: 'white',
                    borderWidth: 2
                });
            }
        }
        
        // Calculate appropriate tick step size based on range
        const xRange = bounds.maxX - bounds.minX;
        const yRange = bounds.maxY - bounds.minY;
        const xTickStep = calculateAdaptiveTickStep(xRange);
        const yTickStep = calculateAdaptiveTickStep(yRange);
        
        
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: options.skipAnimation ? false : { duration: 200, easing: 'easeOutQuad' },
    plugins: {
        legend: { 
            display: true, 
            position: 'top',
            labels: { 
                font: { size: 11 },
                boxWidth: window.innerWidth < 768 ? 20 : 12,
                padding: window.innerWidth < 768 ? 15 : 10
            }
        },
        tooltip: { 
            enabled: true,
            mode: 'nearest',
            intersect: false,
            position: 'nearest',
            bodySpacing: 8,
            titleSpacing: 6,
            footerSpacing: 6,
            padding: window.innerWidth < 768 ? 12 : 8,
            caretSize: window.innerWidth < 768 ? 8 : 5,
            callbacks: {
                label: function(context) {
                    if (context && context.parsed) {
                        return `(${window.formatLargeNumber ? window.formatLargeNumber(context.parsed.x) : context.parsed.x}, ${window.formatLargeNumber ? window.formatLargeNumber(context.parsed.y) : context.parsed.y})`;
                    }
                    return '';
                }
            }
        }
    },
    scales: {
        x: { 
            type: 'linear', 
            position: 'bottom', 
            min: bounds.minX, 
            max: bounds.maxX,
            grid: { color: '#cbd5e1', drawBorder: true },
            title: { display: true, text: 'x', font: { weight: 'bold' } },
            ticks: { 
                maxRotation: 45, 
                autoSkip: true, 
                autoSkipPadding: 20,
                stepSize: xTickStep,
                callback: function(value) {
                    return window.formatLargeNumber ? window.formatLargeNumber(value) : value;
                }
            }
        },
        y: { 
            min: bounds.minY, 
            max: bounds.maxY,
            grid: { color: '#cbd5e1', drawBorder: true },
            title: { display: true, text: 'y', font: { weight: 'bold' } },
            ticks: { 
                autoSkip: true, 
                autoSkipPadding: 20,
                stepSize: yTickStep,
                callback: function(value) {
                    return window.formatLargeNumber ? window.formatLargeNumber(value) : value;
                }
            }
        }
    },
    elements: {
        point: {
            hoverRadius: window.innerWidth < 768 ? 15 : 8,
            hitRadius: window.innerWidth < 768 ? 20 : 10
        }
    }
};

        
        // If chart instance exists, update it instead of destroying/recreating
        if (chartInstance) {
            // Update data and options
            chartInstance.data.datasets = datasets;
            chartInstance.options = { ...chartInstance.options, ...chartOptions };
            chartInstance.update({ duration: options.skipAnimation ? 0 : 200 });
        } else {
            // Create new chart instance
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: chartOptions
            });
        }
        
        // Enhance for touch if needed
        if (window.innerWidth < 768) {
            enhanceGraphForTouch();
        }
    }, 16);
}


// Helper function to destroy graph instance
function destroyGraph() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    lastDrawParams = null;
    if (graphUpdateTimeout) {
        clearTimeout(graphUpdateTimeout);
        graphUpdateTimeout = null;
    }
}

/**
 * Calculate adaptive tick step size based on range
 * @param {number} range - The range of values
 * @returns {number} Appropriate tick step size
 */
function calculateAdaptiveTickStep(range) {
    if (range <= 10) return 1;
    if (range <= 50) return 5;
    if (range <= 200) return 20;
    if (range <= 500) return 50;
    if (range <= 2000) return 200;
    if (range <= 5000) return 500;
    if (range <= 20000) return 2000;
    if (range <= 50000) return 5000;
    if (range <= 200000) return 20000;
    if (range <= 500000) return 50000;
    if (range <= 2000000) return 200000;
    if (range <= 5000000) return 500000;
    if (range <= 20000000) return 2000000;
    if (range <= 50000000) return 5000000;
    return Math.pow(10, Math.floor(Math.log10(range))) / 2;
}

/**
 * Attaches toggle functionality to steps visibility button
 * @returns {void}
 */

            // helper to attach steps toggle logic
            function attachStepsToggle() {
                const toggleBtn = document.getElementById('toggleStepsBtn');
                const stepsContainer = document.getElementById('stepsContainer');
                if (!toggleBtn || !stepsContainer) return;
                const updateToggleText = () => {
                    toggleBtn.innerHTML = stepsVisible ? '🔎 Hide steps' : '📋 Show steps';
                    toggleBtn.classList.toggle('off', !stepsVisible);
                };
                // remove old listener by cloning
                const newBtn = toggleBtn.cloneNode(true);
                toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    stepsVisible = !stepsVisible;
                    if (stepsContainer) {
                        if (stepsVisible) stepsContainer.classList.remove('hidden-steps');
                        else stepsContainer.classList.add('hidden-steps');
                    }
                    newBtn.innerHTML = stepsVisible ? '🔎 Hide steps' : '📋 Show steps';
                    newBtn.classList.toggle('off', !stepsVisible);
                });
                // initial state
                if (stepsVisible) stepsContainer.classList.remove('hidden-steps');
                else stepsContainer.classList.add('hidden-steps');
                newBtn.innerHTML = stepsVisible ? '🔎 Hide steps' : '📋 Show steps';
                newBtn.classList.toggle('off', !stepsVisible);
                
            }
                    // ---------- existing cards (distance, section, midpoint, centroid, area, collinear) – kept exactly as before ----------
            // (They are identical to the original; I've abbreviated here for brevity but they remain unchanged.)
            // For the sake of a complete file, we include all original implementations. 
            // Below I'll add the new point-line distance card and keep other functions exactly as originally provided.
// NEW: Render function for Rectangular Coordinate System
// NEW: Render function for Rectangular Coordinate System with dynamic range up to 1e10
/**
 * Renders the Rectangular Coordinate System card
 * Displays interactive Cartesian plane with point plotting and quadrant visualization
 * @returns {void}
 */

function renderRectCoordCard() {
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
    
    // Activate the rectangular coordinate system button
    const rectCoordBtn = document.getElementById('rectCoordBtn');
    rectCoordBtn.classList.add('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>🎯</span> Rectangular Coordinate System</h2>
        
        <!-- Explanation of Cartesian axes and quadrants -->
        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0;">
            <div class="point-box" style="flex: 2;">
                <label>📚 Key Concepts</label>
                <ul style="font-size: 1.1rem; line-height: 1.8; padding-left: 20px;">
                    <li><strong>Cartesian Plane:</strong> Formed by two perpendicular lines (axes)</li>
                    <li><strong>X-axis:</strong> Horizontal line (y = 0) - positive to the RIGHT (+x), negative to the LEFT (-x)</li>
                    <li><strong>Y-axis:</strong> Vertical line (x = 0) - positive UP (+y), negative DOWN (-y)</li>
                    <li><strong>Origin (0,0):</strong> Point where axes intersect</li>
                    <li><strong>Quadrants:</strong> Four regions numbered I, II, III, IV counterclockwise</li>
                    <li><strong>Dynamic Range:</strong> Coordinates can be from -10,000,000,000 to +10,000,000,000</li>
                </ul>
            </div>
            
            <div class="point-box" style="flex: 1; background: #e8f0fe;">
                <label>Quadrant Signs</label>
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <div style="text-align: center;">
                        <div style="display: grid; grid-template-columns: 100px 100px; gap: 5px; border: 2px solid #333;">
                            <div style="background: #ffd966; padding: 15px; border-right: 1px solid #999; border-bottom: 1px solid #999;">
                                <strong>QII</strong><br>(-x, +y)
                            </div>
                            <div style="background: #b6d7a8; padding: 15px; border-bottom: 1px solid #999;">
                                <strong>QI</strong><br>(+x, +y)
                            </div>
                            <div style="background: #e06666; padding: 15px; border-right: 1px solid #999;">
                                <strong>QIII</strong><br>(-x, -y)
                            </div>
                            <div style="background: #9fc5e8; padding: 15px;">
                                <strong>QIV</strong><br>(+x, -y)
                            </div>
                        </div>
                        <div style="margin-top: 15px; font-size: 0.95rem; background: #f8f9fa; padding: 8px; border-radius: 20px;">
                            ← -x direction | +x direction →<br>
                            ↑ +y direction | ↓ -y direction
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Interactive point plotting -->
        <div class="formula-badge" style="background: #fff3cd;">
            \\( \\text{Point } P = (x, y) \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Plot a Point</label>
                <div class="coord-input">
                    <span>x =</span>
                    <input type="number" id="rectX" value="10" step="any" min="-10000000000" max="10000000000">
                </div>
                <div class="coord-input">
                    <span>y =</span>
                    <input type="number" id="rectY" value="3" step="any" min="-10000000000" max="10000000000">
                </div>
                <div style="font-size:0.9rem; margin-top:8px; color:#1a4972;">
                    Enter coordinates (range: -10¹⁰ to 10¹⁰)
                </div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point Information</label>
                <div id="pointInfo" style="font-size: 1.2rem; text-align: center; padding: 10px; min-height: 140px;">
                    <div>📍 Point: (10, 3)</div>
                    <div>📌 Location: <span style="font-weight:bold; color:#2b5797;">Quadrant I</span></div>
                    <div>📏 Distance from origin: 10.44</div>
                    <div>📊 Scale: Normal view</div>
                    <div style="margin-top:5px; font-size:1rem;">↓ Projection on x-axis: (10, 0)</div>
                    <div>→ Projection on y-axis: (0, 3)</div>
                </div>
            </div>
        </div>
<div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
    <button class="mode-option" id="extremePositive">+10¹⁰ Example</button>
    <button class="mode-option" id="extremeNegative">-10¹⁰ Example</button>
    <button class="mode-option" id="extremeMixed">Mixed Scale Example</button>
</div>

        <!-- Graph showing axes and point with quadrants -->
        <div class="graph-container">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <!-- Visual quadrant indicator -->
        <div id="quadrantVisual" style="display: flex; justify-content: center; margin: 15px 0;">
            <div style="background: #f0f0f0; border-radius: 40px; padding: 12px 25px; display: inline-flex; gap: 25px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <span style="font-weight: 600;">Current Point Location:</span>
                <span id="quadrantBadge" style="background: #2b5797; color: white; padding: 6px 20px; border-radius: 30px; font-weight: bold; font-size: 1.1rem;">Quadrant I</span>
            </div>
        </div>
        
        <!-- Step-by-step explanation with dynamic updates -->
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRectBtn">
            <span>🎯</span> Update Point
        </button>
        
        <div class="result-highlight" id="rectResult">
            \\( \\text{Point } P(10, 3) \\text{ in Quadrant I (both coordinates positive)} \\)
        </div>
        <div class="footnote">
            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                <span><span style="color: #b6d7a8; font-weight: bold;">■ QI (+,+)</span> Top-Right</span>
                <span><span style="color: #ffd966; font-weight: bold;">■ QII (-,+)</span> Top-Left</span>
                <span><span style="color: #e06666; font-weight: bold;">■ QIII (-,-)</span> Bottom-Left</span>
                <span><span style="color: #9fc5e8; font-weight: bold;">■ QIV (+,-)</span> Bottom-Right</span>
            </div>
            <div style="margin-top: 8px;">
                <strong>Axis Directions:</strong> +x → right | -x ← left | +y ↑ up | -y ↓ down
            </div>
            <div style="margin-top: 8px; color: #666;">
                <strong>Dynamic Range:</strong> Graph automatically adjusts to show coordinates up to ±10¹⁰<br>
                <strong>Dashed lines:</strong> Show projections onto x-axis and y-axis
            </div>
        </div>
    `;
    
    mainCard.innerHTML = html;
    renderLatex();

    // Get input references
    const xInp = document.getElementById('rectX');
    const yInp = document.getElementById('rectY');
    const compute = document.getElementById('computeRectBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('rectResult');
    const pointInfo = document.getElementById('pointInfo');
    const quadrantBadge = document.getElementById('quadrantBadge');


// Add this to utils.js (after the existing fmt function)

/**
 * Format large numbers with scientific notation for graph ticks
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatLargeNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.0001 && num !== 0)) {
        return num.toExponential(2);
    }
    return fmt(num);
}

// Also ensure this is globally accessible
window.formatLargeNumber = formatLargeNumber;


    // Helper function to calculate dynamic bounds based on point coordinates
    function calculateBounds(x, y) {
        const maxCoord = Math.max(Math.abs(x), Math.abs(y), 1);
        
        // Calculate padding based on magnitude
        let padding;
        if (maxCoord <= 10) {
            padding = 2; // Small numbers: add 2 units padding
        } else if (maxCoord <= 100) {
            padding = maxCoord * 0.2; // 20% padding
        } else if (maxCoord <= 1000) {
            padding = maxCoord * 0.15; // 15% padding
        } else if (maxCoord <= 1e6) {
            padding = maxCoord * 0.1; // 10% padding
        } else {
            padding = maxCoord * 0.05; // 5% padding for very large numbers
        }
        
        // Ensure minimum padding
        padding = Math.max(padding, 1);
        
        // Calculate bounds
        const minX = -Math.max(maxCoord + padding, 5);
        const maxX = Math.max(maxCoord + padding, 5);
        const minY = -Math.max(maxCoord + padding, 5);
        const maxY = Math.max(maxCoord + padding, 5);
        
        return { minX, maxX, minY, maxY };
    }

    // Helper function to determine tick step size based on range
    function calculateTickStep(range) {
        if (range <= 20) return 1;
        if (range <= 100) return 5;
        if (range <= 500) return 25;
        if (range <= 2000) return 100;
        if (range <= 10000) return 500;
        if (range <= 1e5) return 5000;
        if (range <= 1e6) return 50000;
        if (range <= 1e7) return 500000;
        if (range <= 1e8) return 5000000;
        if (range <= 1e9) return 50000000;
        return 500000000; // For 1e10 range
    }

    function update() {
        clearErrors();
        
        try {
            // Validate inputs
            const x = validateNumber(xInp.value, 'x', -1e10, 1e10);
            const y = validateNumber(yInp.value, 'y', -1e10, 1e10);

            // Determine quadrant with proper description
            let quadrant = '';
            let quadrantDesc = '';
            let quadrantColor = '';
            let axisDescription = '';
            let quadrantNumber = '';
            
            if (x > 0 && y > 0) {
                quadrant = 'Quadrant I';
                quadrantDesc = 'Quadrant I (both coordinates positive)';
                quadrantColor = '#b6d7a8';
                axisDescription = 'right of y-axis and above x-axis';
                quadrantNumber = 'I';
            } else if (x < 0 && y > 0) {
                quadrant = 'Quadrant II';
                quadrantDesc = 'Quadrant II (x negative, y positive)';
                quadrantColor = '#ffd966';
                axisDescription = 'left of y-axis and above x-axis';
                quadrantNumber = 'II';
            } else if (x < 0 && y < 0) {
                quadrant = 'Quadrant III';
                quadrantDesc = 'Quadrant III (both coordinates negative)';
                quadrantColor = '#e06666';
                axisDescription = 'left of y-axis and below x-axis';
                quadrantNumber = 'III';
            } else if (x > 0 && y < 0) {
                quadrant = 'Quadrant IV';
                quadrantDesc = 'Quadrant IV (x positive, y negative)';
                quadrantColor = '#9fc5e8';
                axisDescription = 'right of y-axis and below x-axis';
                quadrantNumber = 'IV';
            } else if (x === 0 && y === 0) {
                quadrant = 'Origin';
                quadrantDesc = 'Origin (0,0) - intersection of axes';
                quadrantColor = '#808080';
                axisDescription = 'at the center where axes meet';
                quadrantNumber = 'Origin';
            } else if (x === 0) {
                quadrant = 'On Y-axis';
                quadrantDesc = `On Y-axis (x = 0) - point lies on the vertical line through origin`;
                quadrantColor = '#9370DB';
                axisDescription = y > 0 ? 'on y-axis above origin' : 'on y-axis below origin';
                quadrantNumber = 'Y-axis';
            } else if (y === 0) {
                quadrant = 'On X-axis';
                quadrantDesc = `On X-axis (y = 0) - point lies on the horizontal line through origin`;
                quadrantColor = '#9370DB';
                axisDescription = x > 0 ? 'on x-axis right of origin' : 'on x-axis left of origin';
                quadrantNumber = 'X-axis';
            }

            // Calculate distance from origin
            const distance = Math.sqrt(x*x + y*y);

            // Format numbers for display
            const xDisplay = formatLargeNumber(x);
            const yDisplay = formatLargeNumber(y);
            const distanceDisplay = distance > 1e6 ? distance.toExponential(2) : fmt(distance);

            // Update quadrant badge
            quadrantBadge.textContent = quadrant;
            quadrantBadge.style.backgroundColor = quadrantColor;
            quadrantBadge.style.color = (quadrant === 'Quadrant III' || quadrant === 'Origin') ? 'white' : 'black';

            // Update point info display with projections
            pointInfo.innerHTML = `
                <div style="margin-bottom: 10px;"><strong>📍 Point P:</strong> (${xDisplay}, ${yDisplay})</div>
                <div><strong>📌 Location:</strong> <span style="font-weight:bold; color:${quadrantColor};">${quadrantDesc}</span></div>
                <div><strong>🧭 Position:</strong> ${axisDescription}</div>
                <div><strong>📏 Distance from origin:</strong> ${distanceDisplay}</div>
                <div style="margin-top:8px; border-top: 1px dashed #ccc; padding-top:8px;">
                    <div><strong>↓ Projection on x-axis:</strong> (${xDisplay}, 0)</div>
                    <div><strong>→ Projection on y-axis:</strong> (0, ${yDisplay})</div>
                </div>
                ${x === 0 || y === 0 ? '<div style="color: #856404; margin-top:8px; font-weight:500;">⚠️ Point lies on an axis (not in any quadrant)</div>' : ''}
                <div style="margin-top:8px; font-size:0.9rem; color:#666;">Scale: ${Math.abs(x) > 100 || Math.abs(y) > 100 ? 'Zoomed out view' : 'Normal view'}</div>
            `;

            // Calculate dynamic bounds
            const bounds = calculateBounds(x, y);
            const xRange = bounds.maxX - bounds.minX;
            const tickStep = calculateTickStep(xRange);

            // Draw the coordinate system with proper quadrant visualization
            const ctx = document.getElementById('coordinateGraph').getContext('2d');
            
            // Clear any existing chart
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }

            // Create custom drawing for quadrant backgrounds
            const quadrantBackgroundPlugin = {
                id: 'quadrantBackground',
                beforeDatasetsDraw(chart) {
                    const { ctx, chartArea: { left, right, top, bottom }, scales } = chart;
                    
                    // Save context state
                    ctx.save();
                    
                    // Calculate pixel positions for quadrant boundaries
                    const xAxisZero = scales.x.getPixelForValue(0);
                    const yAxisZero = scales.y.getPixelForValue(0);
                    
                    // Only draw quadrants if zero is within visible range
                    if (xAxisZero >= left && xAxisZero <= right && yAxisZero >= top && yAxisZero <= bottom) {
                        // Draw Quadrant I (top-right) - light green
                        ctx.fillStyle = 'rgba(182, 215, 168, 0.15)';
                        ctx.fillRect(xAxisZero, top, right - xAxisZero, yAxisZero - top);
                        
                        // Draw Quadrant II (top-left) - light yellow
                        ctx.fillStyle = 'rgba(255, 217, 102, 0.15)';
                        ctx.fillRect(left, top, xAxisZero - left, yAxisZero - top);
                        
                        // Draw Quadrant III (bottom-left) - light red
                        ctx.fillStyle = 'rgba(224, 102, 102, 0.15)';
                        ctx.fillRect(left, yAxisZero, xAxisZero - left, bottom - yAxisZero);
                        
                        // Draw Quadrant IV (bottom-right) - light blue
                        ctx.fillStyle = 'rgba(159, 197, 232, 0.15)';
                        ctx.fillRect(xAxisZero, yAxisZero, right - xAxisZero, bottom - yAxisZero);
                        
                        // Draw quadrant labels (only if quadrants are large enough)
                        const minQuadrantWidth = 60;
                        const minQuadrantHeight = 40;
                        
                        if (right - xAxisZero > minQuadrantWidth && yAxisZero - top > minQuadrantHeight) {
                            ctx.font = 'bold 14px "Segoe UI", Arial';
                            ctx.fillStyle = '#2c3e50';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            // QI label (top-right)
                            ctx.fillText('QI (+,+)', xAxisZero + (right - xAxisZero) * 0.3, top + (yAxisZero - top) * 0.3);
                        }
                        
                        if (xAxisZero - left > minQuadrantWidth && yAxisZero - top > minQuadrantHeight) {
                            ctx.font = 'bold 14px "Segoe UI", Arial';
                            ctx.fillStyle = '#2c3e50';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            // QII label (top-left)
                            ctx.fillText('QII (-,+)', left + (xAxisZero - left) * 0.7, top + (yAxisZero - top) * 0.3);
                        }
                        
                        if (xAxisZero - left > minQuadrantWidth && bottom - yAxisZero > minQuadrantHeight) {
                            ctx.font = 'bold 14px "Segoe UI", Arial';
                            ctx.fillStyle = '#2c3e50';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            // QIII label (bottom-left)
                            ctx.fillText('QIII (-,-)', left + (xAxisZero - left) * 0.7, yAxisZero + (bottom - yAxisZero) * 0.7);
                        }
                        
                        if (right - xAxisZero > minQuadrantWidth && bottom - yAxisZero > minQuadrantHeight) {
                            ctx.font = 'bold 14px "Segoe UI", Arial';
                            ctx.fillStyle = '#2c3e50';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            // QIV label (bottom-right)
                            ctx.fillText('QIV (+,-)', xAxisZero + (right - xAxisZero) * 0.3, yAxisZero + (bottom - yAxisZero) * 0.7);
                        }
                    }
                    
                    // Draw axis direction arrows (always visible near edges)
                    ctx.fillStyle = '#e67e22';
                    ctx.font = 'bold 12px "Segoe UI", Arial';
                    
                    // +x arrow (right)
                    if (scales.x.getPixelForValue(bounds.maxX * 0.8) < right) {
                        ctx.fillText('+x →', right - 60, scales.y.getPixelForValue(0) - 8);
                    }
                    
                    // -x arrow (left)
                    if (scales.x.getPixelForValue(bounds.minX * 0.8) > left) {
                        ctx.fillText('← -x', left + 10, scales.y.getPixelForValue(0) - 8);
                    }
                    
                    // +y arrow (up)
                    if (scales.y.getPixelForValue(bounds.maxY * 0.8) < bottom) {
                        ctx.fillText('↑ +y', scales.x.getPixelForValue(0) + 8, top + 20);
                    }
                    
                    // -y arrow (down)
                    if (scales.y.getPixelForValue(bounds.minY * 0.8) > top) {
                        ctx.fillText('-y ↓', scales.x.getPixelForValue(0) + 8, bottom - 20);
                    }
                    
                    ctx.restore();
                }
            };

            // Register the plugin
            Chart.register(quadrantBackgroundPlugin);

            // Create datasets
            const datasets = [];
            
            // Add the main point
            datasets.push({
                label: `P(${xDisplay}, ${yDisplay})`,
                data: [{ x: x, y: y }],
                backgroundColor: '#d44c2f',
                pointRadius: Math.min(12, 200 / Math.log10(Math.abs(x) + Math.abs(y) + 10)), // Dynamic point size
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 2
            });

            // Add projection points on axes
            datasets.push({
                label: 'Projection on x-axis',
                data: [{ x: x, y: 0 }],
                backgroundColor: '#2b5797',
                pointRadius: 6,
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 1
            });

            datasets.push({
                label: 'Projection on y-axis',
                data: [{ x: 0, y: y }],
                backgroundColor: '#2b5797',
                pointRadius: 6,
                pointStyle: 'circle',
                borderColor: 'white',
                borderWidth: 1
            });

            // Add dashed lines from point to axes (imaginary lines)
            datasets.push({
                label: 'Projection line to x-axis',
                data: [
                    { x: x, y: y },
                    { x: x, y: 0 }
                ],
                borderColor: '#d44c2f',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false,
                tension: 0
            });

            datasets.push({
                label: 'Projection line to y-axis',
                data: [
                    { x: x, y: y },
                    { x: 0, y: y }
                ],
                borderColor: '#d44c2f',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                showLine: true,
                fill: false,
                tension: 0
            });

            // Add axes as line segments
            datasets.push({
                label: 'x-axis',
                data: [
                    { x: bounds.minX, y: 0 },
                    { x: bounds.maxX, y: 0 }
                ],
                borderColor: '#2c3e50',
                borderWidth: 1.5,
                pointRadius: 0,
                showLine: true,
                fill: false,
                tension: 0
            });

            datasets.push({
                label: 'y-axis',
                data: [
                    { x: 0, y: bounds.minY },
                    { x: 0, y: bounds.maxY }
                ],
                borderColor: '#2c3e50',
                borderWidth: 1.5,
                pointRadius: 0,
                showLine: true,
                fill: false,
                tension: 0
            });

            // Create the chart
            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { 
                            enabled: true,
                            callbacks: {
                                label: function(context) {
                                    if (context.dataset.label.includes('Projection')) {
                                        if (context.dataset.label.includes('x-axis')) {
                                            return `Projection on x-axis: (${formatLargeNumber(context.parsed.x)}, 0)`;
                                        } else if (context.dataset.label.includes('y-axis')) {
                                            return `Projection on y-axis: (0, ${formatLargeNumber(context.parsed.y)})`;
                                        } else {
                                            return `Projection line`;
                                        }
                                    }
                                    return `P(${formatLargeNumber(context.parsed.x)}, ${formatLargeNumber(context.parsed.y)})`;
                                }
                            }
                        },
                        quadrantBackground: true
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            min: bounds.minX,
                            max: bounds.maxX,
                            grid: { 
                                color: '#cbd5e1',
                                drawOnChartArea: true
                            },
                            title: { 
                                display: true, 
                                text: 'x-axis (negative ← | → positive)',
                                font: { weight: 'bold' }
                            },
                            ticks: { 
                                stepSize: tickStep,
                                callback: function(value) {
                                    return formatLargeNumber(value);
                                },
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            min: bounds.minY,
                            max: bounds.maxY,
                            grid: { 
                                color: '#cbd5e1',
                                drawOnChartArea: true
                            },
                            title: { 
                                display: true, 
                                text: 'y-axis (negative ↓ | ↑ positive)',
                                font: { weight: 'bold' }
                            },
                            ticks: { 
                                stepSize: tickStep,
                                callback: function(value) {
                                    return formatLargeNumber(value);
                                },
                                maxTicksLimit: 10
                            }
                        }
                    }
                }
            });

            // Create comprehensive step-by-step explanation
            const steps = [
                `① 📐 THE CARTESIAN COORDINATE SYSTEM:`,
                `   • The plane is divided into 4 QUADRANTS by two perpendicular axes:`,
                `     - X-AXIS (horizontal line y = 0)`,
                `       → POSITIVE x-direction (+x): to the RIGHT (x > 0)`,
                `       → NEGATIVE x-direction (-x): to the LEFT (x < 0)`,
                `     - Y-AXIS (vertical line x = 0)`,
                `       → POSITIVE y-direction (+y): UP (y > 0)`,
                `       → NEGATIVE y-direction (-y): DOWN (y < 0)`,
                `   • ORIGIN (0,0): where both axes intersect (center point)`,
                `   • DYNAMIC RANGE: Graph automatically scales from -10¹⁰ to +10¹⁰`,
                
                `② 🧭 UNDERSTANDING THE FOUR QUADRANTS:`,
                `   • QUADRANT I (top-right):  x > 0, y > 0  (both positive)`,
                `   • QUADRANT II (top-left):  x < 0, y > 0  (x negative, y positive)`,
                `   • QUADRANT III (bottom-left): x < 0, y < 0  (both negative)`,
                `   • QUADRANT IV (bottom-right): x > 0, y < 0  (x positive, y negative)`,
                `   • Points on axes: x = 0 or y = 0 (not in any quadrant)`,
                
                `③ 🎯 PLOTTING POINT P(${xDisplay}, ${yDisplay}):`,
                `   • Starting from the ORIGIN (0,0) at the center:`,
                `   • HORIZONTAL MOVEMENT (along x-axis):`,
                `     → Move ${formatLargeNumber(Math.abs(x))} unit${Math.abs(x) !== 1 ? 's' : ''} to the ${x >= 0 ? 'RIGHT' : 'LEFT'}`,
                `     → ${x > 0 ? `This is +${formatLargeNumber(Math.abs(x))} in POSITIVE x-direction` : 
                                 x < 0 ? `This is -${formatLargeNumber(Math.abs(x))} in NEGATIVE x-direction` : 
                                 'No horizontal movement (x = 0)'}`,
                `   • VERTICAL MOVEMENT (parallel to y-axis):`,
                `     → Move ${formatLargeNumber(Math.abs(y))} unit${Math.abs(y) !== 1 ? 's' : ''} ${y >= 0 ? 'UP' : 'DOWN'}`,
                `     → ${y > 0 ? `This is +${formatLargeNumber(Math.abs(y))} in POSITIVE y-direction` : 
                                 y < 0 ? `This is -${formatLargeNumber(Math.abs(y))} in NEGATIVE y-direction` : 
                                 'No vertical movement (y = 0)'}`,
                `   • Final position: Point P(${xDisplay}, ${yDisplay})`,
                
                `④ 📏 PROJECTIONS ON THE AXES (shown with dashed lines):`,
                `   • PROJECTION ON X-AXIS: Drop a vertical line from P to the x-axis`,
                `     → This gives us point (${xDisplay}, 0)`,
                `     → This is the x-coordinate of P on the horizontal axis`,
                `   • PROJECTION ON Y-AXIS: Drop a horizontal line from P to the y-axis`,
                `     → This gives us point (0, ${yDisplay})`,
                `     → This is the y-coordinate of P on the vertical axis`,
                `   • These dashed lines help visualize the coordinates of point P`,
                
                `⑤ 🔍 IDENTIFYING THE LOCATION:`,
                `   • X-coordinate = ${xDisplay} → ${x > 0 ? 'positive (+)' : x < 0 ? 'negative (-)' : 'zero'}`,
                `   • Y-coordinate = ${yDisplay} → ${y > 0 ? 'positive (+)' : y < 0 ? 'negative (-)' : 'zero'}`,
                `   • This point lies **${axisDescription}**`,
                `   • Therefore, it is in **${quadrantDesc}**`,
                
                `⑥ 📏 DISTANCE FROM ORIGIN:`,
                `   • Using the distance formula: d = √(x² + y²)`,
                `   • d = √(${xDisplay}² + ${yDisplay}²)`,
                `   • d = √(${formatLargeNumber(x*x)} + ${formatLargeNumber(y*y)})`,
                `   • d = √${formatLargeNumber(x*x + y*y)} = ${distanceDisplay}`,
                `   • This means point P is ${distanceDisplay} units away from the origin`,
                
                `⑦ 💡 KEY OBSERVATIONS:`,
                `   • ${x === 0 && y === 0 ? 'The point is at the ORIGIN (center of coordinate system)' : 
                          (x === 0 ? 'The point lies on the Y-AXIS (vertical line)' : 
                           (y === 0 ? 'The point lies on the X-AXIS (horizontal line)' : 
                            `The point lies in QUADRANT ${quadrantNumber}`))}`,
                `   • Moving RIGHT increases x-coordinate (more positive)`,
                `   • Moving LEFT decreases x-coordinate (more negative)`,
                `   • Moving UP increases y-coordinate (more positive)`,
                `   • Moving DOWN decreases y-coordinate (more negative)`,
                `   • The axes divide the plane into four regions called quadrants`,
                `   • Graph scale: ${bounds.minX.toExponential(2)} to ${bounds.maxX.toExponential(2)}`
            ];

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            // Update result display with quadrant information
            let resultText = `\\( P(${xDisplay}, ${yDisplay}) \\text{ in } ${quadrantDesc} \\)`;
            resultDiv.innerHTML = resultText;
            
            renderLatex();
            attachStepsToggle();
            
        } catch (e) {
            showError(e.message, [xInp, yInp]);
        }
    }

    // Event listeners
    compute.addEventListener('click', update);
    [xInp, yInp].forEach(inp => 
        inp.addEventListener('keypress', e => e.key === 'Enter' && update())
    );
    [xInp, yInp].forEach(inp => 
        inp.addEventListener('input', clearErrors)
    );
    // Add event listeners:
document.getElementById('extremePositive').addEventListener('click', () => {
    xInp.value = 10000000000;
    yInp.value = 5000000000;
    update();
});
document.getElementById('extremeNegative').addEventListener('click', () => {
    xInp.value = -10000000000;
    yInp.value = -5000000000;
    update();
});

    setTimeout(() => { 
        update(); 
        attachStepsToggle(); 
    }, 50);
}
// Function to switch between main tabs
function switchTab(activeTabId) {
    // Update tab bar styles
    const allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => {
        if (tab.id === activeTabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show/hide sidebar buttons based on active tab
    const allSidebarBtns = document.querySelectorAll('#sidebarContent .nav-btn');
    if (activeTabId === 'tabLineEquations') {
        // Show equation form buttons, hide others
        allSidebarBtns.forEach(btn => {
            if (btn.id === 'slopeInterceptBtn' || btn.id === 'pointSlopeBtn' || 
                btn.id === 'twoPointBtn' || btn.id === 'interceptFormBtn' || 
                btn.id === 'normalFormBtn' || btn.id === 'generalFormBtn' ||
                btn.id === 'parametricFormBtn' || btn.id === 'horizontalLineBtn' ||
                btn.id === 'verticalLineBtn' || btn.id === 'slopeFromGeneralBtn' ||
                btn.id === 'xInterceptBtn' || btn.id === 'yInterceptBtn' ||
                btn.id === 'symmetricFormBtn' || btn.id === 'concurrencyBtn' ||
                btn.id === 'familyLinesBtn' || btn.id === 'linearIndependenceBtn') {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    } else if (activeTabId === 'tabAnglesIntersections') {
        // Show only angle-related buttons
        allSidebarBtns.forEach(btn => {
            if (btn.id === 'angleBetweenLinesBtn' || btn.id === 'parallelismBtn' || 
                btn.id === 'perpendicularityBtn' || btn.id === 'intersectionPointBtn' ||
                btn.id === 'lineParallelBtn' || btn.id === 'linePerpendicularBtn' ||
                btn.id === 'footPerpendicularBtn' || btn.id === 'imagePointLineBtn' ||
                btn.id === 'imagePointAxesBtn' || btn.id === 'footAlongDirectionBtn' ||
                btn.id === 'angleWithAxesBtn' || btn.id === 'interceptApplicationsBtn') {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    } else if (activeTabId === 'tabDistanceMeasures') {
        // Show only distance measures buttons
        allSidebarBtns.forEach(btn => {
            if (btn.id === 'distanceOriginToLineBtn' || 
                btn.id === 'perpendicularDistanceBtn' || 
                btn.id === 'equidistantPointsBtn' || 
                btn.id === 'skewLinesBtn' ||
                btn.id === 'projectionLengthBtn' ||
                btn.id === 'parallelLinesInterceptBtn' ||
                btn.id === 'distanceLineAxesBtn' ||
                btn.id === 'pointRelativePositionBtn' ||
                btn.id === 'pointsSameSideBtn' ||
                btn.id === 'areaApplicationsBtn' ||
                btn.id === 'originSideBtn' ||
                btn.id === 'lineCurveDistanceBtn' ||
                btn.id === 'rectangleSquareBtn') {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    } 
    // ADD YOUR NEW TAB CONDITION HERE
// ADD YOUR NEW TAB CONDITION HERE
else if (activeTabId === 'tabLocusGeometric') {
    // Show only locus-related buttons
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'equationLocusBtn' || 
            btn.id === 'equidistantTwoPointsBtn' || 
            btn.id === 'equidistantTwoLinesBtn' || 
            btn.id === 'constantDistanceLineBtn' ||
            btn.id === 'locusMidpointSegmentBtn' ||
            btn.id === 'locusIntersectionVariableBtn' ||
            btn.id === 'locusSectionFormulaBtn' ||
            btn.id === 'locusConstantAreaBtn' ||
            btn.id === 'locusConstantRatioBtn' ||
            btn.id === 'locusReflectionFootBtn' ||
            btn.id === 'locusFamilyLinesBtn' ||
            btn.id === 'locusMovingCoordinateBtn') {  // Add these two
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
else if (activeTabId === 'tabAngleBisectors') {
    // Show only angle bisector buttons and the new family buttons
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'angleBisectorsEquationBtn' || 
            btn.id === 'acuteBisectorBtn' || 
            btn.id === 'obtuseBisectorBtn' || 
            btn.id === 'containingPointBisectorBtn' ||
            // Existing family buttons
            btn.id === 'familyThroughPointBtn' ||
            btn.id === 'familyParallelDirectionBtn' ||
            btn.id === 'familySumInterceptsBtn' ||
            btn.id === 'familyProductInterceptsBtn' ||
            // ADD THE FIVE NEW BUTTONS HERE
            btn.id === 'familyAdvancedIntersectionBtn' ||
            btn.id === 'familyFindBaseBtn' ||
            btn.id === 'familyCombinationsLocusBtn' ||
            btn.id === 'familyConcurrencyBtn' ||
            btn.id === 'familyFixedMidpointBtn') {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
// In the switchTab function, update the tabStandardPoints section:
// In the switchTab function, update the tabStandardPoints section:
else if (activeTabId === 'tabStandardPoints') {
    // Show only standard points buttons
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'triangleVerticesBtn' || 
            btn.id === 'centroidTriangleBtn' || 
            btn.id === 'incenterTriangleBtn' || 
            btn.id === 'circumcenterTriangleBtn' ||
            btn.id === 'orthocenterTriangleBtn' ||
            btn.id === 'mediansEquationsBtn' ||
            btn.id === 'altitudesEquationsBtn' ||
            btn.id === 'perpBisectorsEquationsBtn' ||
            btn.id === 'circumcenterLineEqBtn' ||
            btn.id === 'orthocenterLineEqBtn' ||
            btn.id === 'incenterAngleBisectorsBtn' ||
            btn.id === 'pedalTriangleBtn' ||
            // ADD THE NEW BUTTONS HERE
            btn.id === 'excentersBtn' ||
            btn.id === 'eulerLineBtn') {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
// In the switchTab function in utils.js, add this new condition
// In utils.js, find the switchTab function and update the transformation axes section:
// In the switchTab function, update the transformation axes section:
else if (activeTabId === 'tabTransformationAxes') {
    // Show only transformation buttons (including the new ones)
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'translationOriginBtn' || 
            btn.id === 'rotationAxesBtn' || 
            btn.id === 'generalTransformationBtn' || 
            btn.id === 'removeXYTermBtn' ||
            btn.id === 'simplifyEquationBtn' ||
            // ADD THE 5 ORIGINAL NEW BUTTONS HERE
            btn.id === 'findOriginalAfterTranslationBtn' ||
            btn.id === 'findOriginalAfterRotationBtn' ||
            btn.id === 'shiftOriginSimplifyLineBtn' ||
            btn.id === 'shiftLineThroughOriginBtn' ||
            btn.id === 'changeAxesSymmetryBtn' ||
            // ADD THE 3 NEW BUTTONS HERE
            btn.id === 'combinedTranslationRotationBtn' ||
            btn.id === 'pointNewCoordinatesBtn' ||
            btn.id === 'lineEquationNewCoordinatesBtn') {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
else if (activeTabId === 'tabLineConic') {
    // Show all line-conic interaction buttons (original 5 + 5 new ones)
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'lineCircleIntersectionBtn' || 
            btn.id === 'tangencyConditionBtn' || 
            btn.id === 'tangentSlopeFormBtn' || 
            btn.id === 'interceptLengthBtn' ||
            btn.id === 'chordOfContactBtn' ||
            // NEW BUTTONS
            btn.id === 'polePolarBtn' ||
            btn.id === 'lineParabolaIntersectionBtn' ||
            btn.id === 'tangencyParabolaBtn' ||
            btn.id === 'lineEllipseIntersectionBtn' ||
            btn.id === 'tangencyEllipseBtn' ||
            // ADD THE 5 NEW BUTTONS HERE
            btn.id === 'lineHyperbolaIntersectionBtn' ||
            btn.id === 'tangencyRectHyperbolaBtn' ||
            btn.id === 'diameterConicBtn' ||
            btn.id === 'parabolaReflectionBtn' ||
            btn.id === 'lineDirectrixAxisBtn') {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
// In switchTab function in utils.js, add this new condition
else if (activeTabId === 'tab3DGeometry') {
    // Show only 3D geometry buttons (including the new ones)
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'threeDCoordsBtn' || 
            btn.id === 'directionRatiosBtn' || 
            btn.id === 'lineSymmetricFormBtn' || 
            btn.id === 'lineVectorFormBtn' ||
            btn.id === 'angleBetweenLines3DBtn' ||
            // NEW BUTTONS
            btn.id === 'conditionParallelPerp3DBtn' ||
            btn.id === 'intersectionLines3DBtn' ||
            btn.id === 'skewLines3DBtn' ||
            btn.id === 'projectionLine3DBtn' ||
            btn.id === 'imagePointLine3DBtn' ||
            // ========= ADD YOUR 5 NEW BUTTONS HERE =========
            btn.id === 'planeIntersectionBtn' ||
            btn.id === 'optimizationDistanceBtn' ||
            btn.id === 'linearProgrammingBtn' ||
            btn.id === 'regressionLineBtn' ||
            btn.id === 'computationalGeometryBtn') {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}
else {
    // Default: Show coordinate geometry buttons, hide all others
    allSidebarBtns.forEach(btn => {
        if (btn.id === 'slopeInterceptBtn' || btn.id === 'pointSlopeBtn' || 
            btn.id === 'twoPointBtn' || btn.id === 'interceptFormBtn' || 
            btn.id === 'normalFormBtn' || btn.id === 'generalFormBtn' ||
            btn.id === 'parametricFormBtn' || btn.id === 'horizontalLineBtn' ||
            btn.id === 'verticalLineBtn' || btn.id === 'slopeFromGeneralBtn' ||
            btn.id === 'xInterceptBtn' || btn.id === 'yInterceptBtn' ||
            btn.id === 'symmetricFormBtn' || btn.id === 'concurrencyBtn' ||
            btn.id === 'familyLinesBtn' || btn.id === 'linearIndependenceBtn' ||
            btn.id === 'angleBetweenLinesBtn'|| btn.id === 'parallelismBtn' || 
            btn.id === 'perpendicularityBtn'|| btn.id === 'intersectionPointBtn' ||
            btn.id === 'lineParallelBtn' || btn.id === 'linePerpendicularBtn' ||
            btn.id === 'footPerpendicularBtn' || btn.id === 'imagePointLineBtn' ||
            btn.id === 'imagePointAxesBtn' || btn.id === 'footAlongDirectionBtn' ||
            btn.id === 'angleWithAxesBtn' || btn.id === 'interceptApplicationsBtn' ||
            btn.id === 'distanceOriginToLineBtn' || btn.id === 'perpendicularDistanceBtn' ||
            btn.id === 'equidistantPointsBtn' || btn.id === 'skewLinesBtn' ||
            btn.id === 'projectionLengthBtn' || btn.id === 'parallelLinesInterceptBtn' ||
            btn.id === 'distanceLineAxesBtn' || btn.id === 'pointRelativePositionBtn' ||
            btn.id === 'pointsSameSideBtn' || btn.id === 'areaApplicationsBtn' ||
            btn.id === 'originSideBtn' || btn.id === 'lineCurveDistanceBtn' ||
            btn.id === 'rectangleSquareBtn' ||
            // Locus buttons
            btn.id === 'equationLocusBtn' || btn.id === 'equidistantTwoPointsBtn' ||
            btn.id === 'equidistantTwoLinesBtn' || btn.id === 'constantDistanceLineBtn'||
            btn.id === 'locusMidpointSegmentBtn' ||
            btn.id === 'locusIntersectionVariableBtn' ||
            btn.id === 'locusSectionFormulaBtn' ||
            btn.id === 'locusConstantAreaBtn'||
            btn.id === 'locusConstantRatioBtn' ||
            btn.id === 'locusReflectionFootBtn'||
            btn.id === 'locusFamilyLinesBtn' ||
            btn.id === 'locusMovingCoordinateBtn'||
            // Angle bisector buttons
            btn.id === 'angleBisectorsEquationBtn' || 
            btn.id === 'acuteBisectorBtn' || 
            btn.id === 'obtuseBisectorBtn' || 
            btn.id === 'containingPointBisectorBtn' ||
            btn.id === 'familyThroughPointBtn' ||
            btn.id === 'familyParallelDirectionBtn' ||
            btn.id === 'familySumInterceptsBtn' ||
            btn.id === 'familyProductInterceptsBtn'||
            btn.id === 'familyAdvancedIntersectionBtn' ||
            btn.id === 'familyFindBaseBtn' ||
            btn.id === 'familyCombinationsLocusBtn' ||
            btn.id === 'familyConcurrencyBtn' ||
            btn.id === 'familyFixedMidpointBtn'||
            // Standard points buttons
            btn.id === 'triangleVerticesBtn' || 
            btn.id === 'centroidTriangleBtn' || 
            btn.id === 'incenterTriangleBtn' || 
            btn.id === 'circumcenterTriangleBtn' ||
            btn.id === 'orthocenterTriangleBtn'||
            btn.id === 'mediansEquationsBtn' ||
            btn.id === 'altitudesEquationsBtn' ||
            btn.id === 'perpBisectorsEquationsBtn' ||
            btn.id === 'circumcenterLineEqBtn' ||
            btn.id === 'orthocenterLineEqBtn'||
            btn.id === 'incenterAngleBisectorsBtn' ||
            btn.id === 'pedalTriangleBtn'||
            btn.id === 'excentersBtn' ||
            btn.id === 'eulerLineBtn'||
            // Transformation buttons
            btn.id === 'translationOriginBtn' || 
            btn.id === 'rotationAxesBtn' || 
            btn.id === 'generalTransformationBtn' || 
            btn.id === 'removeXYTermBtn' ||
            btn.id === 'simplifyEquationBtn'||
            btn.id === 'findOriginalAfterTranslationBtn' ||
            btn.id === 'findOriginalAfterRotationBtn' ||
            btn.id === 'shiftOriginSimplifyLineBtn' ||
            btn.id === 'shiftLineThroughOriginBtn' ||
            btn.id === 'changeAxesSymmetryBtn'||
            btn.id === 'combinedTranslationRotationBtn' ||
            btn.id === 'pointNewCoordinatesBtn' ||
            btn.id === 'lineEquationNewCoordinatesBtn'||
            // LINE & CONIC BUTTONS (ORIGINAL 5 + 5 NEW) - HIDE THESE IN DEFAULT TAB
            btn.id === 'lineCircleIntersectionBtn' || 
            btn.id === 'tangencyConditionBtn' || 
            btn.id === 'tangentSlopeFormBtn' || 
            btn.id === 'interceptLengthBtn' ||
            btn.id === 'chordOfContactBtn' ||
            btn.id === 'polePolarBtn' ||
            btn.id === 'lineParabolaIntersectionBtn' ||
            btn.id === 'tangencyParabolaBtn' ||
            btn.id === 'lineEllipseIntersectionBtn' ||
            btn.id === 'tangencyEllipseBtn'||
            // ADD THE 5 NEW BUTTONS HERE
            btn.id === 'lineHyperbolaIntersectionBtn' ||
            btn.id === 'tangencyRectHyperbolaBtn' ||
            btn.id === 'diameterConicBtn' ||
            btn.id === 'parabolaReflectionBtn' ||
            btn.id === 'lineDirectrixAxisBtn'|| btn.id === 'threeDCoordsBtn' || 
            btn.id === 'directionRatiosBtn' || 
            btn.id === 'lineSymmetricFormBtn' || 
            btn.id === 'lineVectorFormBtn' ||
            btn.id === 'angleBetweenLines3DBtn' ||
            // NEW BUTTONS
            btn.id === 'conditionParallelPerp3DBtn' ||
            btn.id === 'intersectionLines3DBtn' ||
            btn.id === 'skewLines3DBtn' ||
            btn.id === 'projectionLine3DBtn' ||
            btn.id === 'imagePointLine3DBtn'||
            // ========= ADD YOUR 5 NEW BUTTONS HERE =========
            btn.id === 'planeIntersectionBtn' ||
            btn.id === 'optimizationDistanceBtn' ||
            btn.id === 'linearProgrammingBtn' ||
            btn.id === 'regressionLineBtn' ||
            btn.id === 'computationalGeometryBtn') {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
        }
    });
}
}
    /**
 * Renders the Distance between two points card
 * Calculates Euclidean distance using formula d = √((x₂-x₁)² + (y₂-y₁)²)
 * @returns {void}
 */

            // ========= DISTANCE CARD (original) =========
            function renderDistanceCard() {
                distanceBtn.classList.add('active-btn');
                sectionBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
                const html = `
                    <h2 style="color:#113355;"><span>📏</span> Distance between two points</h2>
                    <div class="formula-badge">\\( d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2} \\)</div>
                    <div class="input-group">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="x1" value="3" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="y1" value="2" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="x2" value="7" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="y2" value="5" step="any"></div>
                        </div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer">
                        <div class="step-row"><span class="step-marker">⚪</span><span class="step-text">ready</span></div>
                    </div>
                    <button class="calculate-btn" id="computeDistanceBtn"><span>✨</span> Calculate distance</button>
                    <div class="result-highlight" id="distanceDisplay">\\( d = 5 \\)</div>
                    <div class="footnote">graph shows segment AB (dashed) + smart axis</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const x1 = document.getElementById('x1'), y1 = document.getElementById('y1');
                const x2 = document.getElementById('x2'), y2 = document.getElementById('y2');
                const compute = document.getElementById('computeDistanceBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('distanceDisplay');

                function update() {
                    clearErrors();
                    try {
                        const x1v = validateNumber(x1.value, 'x₁'), y1v = validateNumber(y1.value, 'y₁');
                        const x2v = validateNumber(x2.value, 'x₂'), y2v = validateNumber(y2.value, 'y₂');

                        const lineSegments = [{ from: {x:x1v, y:y1v}, to: {x:x2v, y:y2v}, color:'#64748B', dash:[5,3], label:'AB' }];
                        drawGraph([{x:x1v, y:y1v}, {x:x2v, y:y2v}], [], lineSegments);

                        const dx = x2v - x1v, dy = y2v - y1v;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const steps = [
                            `① A(${fmt(x1v)},${fmt(y1v)}), B(${fmt(x2v)},${fmt(y2v)})`,
                            `② Δx = ${fmt(x2v)} – ${fmt(x1v)} = ${fmt(dx)}`,
                            `③ Δy = ${fmt(y2v)} – ${fmt(y1v)} = ${fmt(dy)}`,
                            `④ Δx² = ${fmt(dx*dx)} , Δy² = ${fmt(dy*dy)}`,
                            `⑤ sum = ${fmt(dx*dx + dy*dy)}`,
                            `⑥ d = √${fmt(dx*dx + dy*dy)} = ${fmt(dist)}`
                        ];
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( d = ${fmt(dist)} \\)`;
                        renderLatex();
                        attachStepsToggle(); 
                    } catch (e) {
                        showError(e.message, [x1, y1, x2, y2]);
                    }
                }

                compute.addEventListener('click', update);
                [x1, y1, x2, y2].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [x1, y1, x2, y2].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
/**
 * Renders the Section Formula card for internal and external division
 * @returns {void}
 */

            // ========= SECTION CARD (original) =========
            function renderSectionCard() {
                sectionBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
                const html = `
                    <h2 style="color:#113355;"><span>⚖️</span> Section formula · internal / external</h2>
                    <div class="toggle-mode">
                        <label class="mode-option selected" id="modeInternalOpt"><input type="radio" name="sectionMode" value="internal" checked> ⚬ internal \\( (m:n) \\)</label>
                        <label class="mode-option" id="modeExternalOpt"><input type="radio" name="sectionMode" value="external"> ⚡ external \\( (m:n) \\)</label>
                    </div>
                    <div class="formula-badge" id="sectionFormulaDisplay">\\( P = \\left( \\frac{m x_2 + n x_1}{m+n}, \\frac{m y_2 + n y_1}{m+n} \\right) \\)</div>
                    <div class="input-group">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="sx1" value="2" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="sy1" value="3" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="sx2" value="10" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="sy2" value="7" step="any"></div>
                        </div>
                    </div>
                    <div class="ratio-group">
                        <div class="ratio-box">m = <input type="number" id="mVal" value="3" step="any" min="0.001"></div>
                        <span style="font-size:2rem;">:</span>
                        <div class="ratio-box">n = <input type="number" id="nVal" value="2" step="any" min="0.001"></div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computeSectionBtn"><span>⚡</span> Find point P</button>
                    <div class="result-highlight" id="sectionResult">\\( P = (6.8, 5.4) \\)</div>
                    <div class="footnote">dashed: AB, dotted: AP & BP. external uses \\(\\frac{m x_2 - n x_1}{m-n}\\)</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const sx1 = document.getElementById('sx1'), sy1 = document.getElementById('sy1');
                const sx2 = document.getElementById('sx2'), sy2 = document.getElementById('sy2');
                const mInp = document.getElementById('mVal'), nInp = document.getElementById('nVal');
                const compute = document.getElementById('computeSectionBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('sectionResult');
                const formulaDiv = document.getElementById('sectionFormulaDisplay');
                const modeInternal = document.getElementById('modeInternalOpt');
                const modeExternal = document.getElementById('modeExternalOpt');

                function isExternal() {
                    return modeExternal.classList.contains('selected');
                }

                function setModeUI() {
                    if (isExternal()) {
                        formulaDiv.innerHTML = `\\( P = \\left( \\frac{m x_2 - n x_1}{m-n}, \\frac{m y_2 - n y_1}{m-n} \\right) \\) (external)`;
                        modeExternal.classList.add('selected');
                        modeInternal.classList.remove('selected');
                    } else {
                        formulaDiv.innerHTML = `\\( P = \\left( \\frac{m x_2 + n x_1}{m+n}, \\frac{m y_2 + n y_1}{m+n} \\right) \\) (internal)`;
                        modeInternal.classList.add('selected');
                        modeExternal.classList.remove('selected');
                    }
                    renderLatex();
                }

                modeInternal.addEventListener('click', () => {
                    modeInternal.classList.add('selected');
                    modeExternal.classList.remove('selected');
                    setModeUI();
                    update();
                });
                modeExternal.addEventListener('click', () => {
                    modeExternal.classList.add('selected');
                    modeInternal.classList.remove('selected');
                    setModeUI();
                    update();
                });

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(sx1.value, 'x₁'), y1 = validateNumber(sy1.value, 'y₁');
                        const x2 = validateNumber(sx2.value, 'x₂'), y2 = validateNumber(sy2.value, 'y₂');
                        const m = validatePositiveNumber(mInp.value, 'm', false);
                        const n = validatePositiveNumber(nInp.value, 'n', false);
                        
                        let px, py, denom;
                        let steps = [];
                        const ext = isExternal();

                        if (ext) {
                            if (Math.abs(m - n) < 1e-12) throw new Error('For external division m and n must be different');
                            denom = m - n;
                            px = (m * x2 - n * x1) / denom;
                            py = (m * y2 - n * y1) / denom;
                            steps = [
                                `① A(${fmt(x1)},${fmt(y1)}) B(${fmt(x2)},${fmt(y2)})`,
                                `② ratio m:n = ${fmt(m)}:${fmt(n)} (external)`,
                                `③ denominator m - n = ${fmt(m)} - ${fmt(n)} = ${fmt(denom)}`,
                                `④ Px = (${fmt(m)}·${fmt(x2)} - ${fmt(n)}·${fmt(x1)}) / ${fmt(denom)} = ${fmt(m*x2 - n*x1)} / ${fmt(denom)} = ${fmt(px)}`,
                                `⑤ Py = (${fmt(m)}·${fmt(y2)} - ${fmt(n)}·${fmt(y1)}) / ${fmt(denom)} = ${fmt(m*y2 - n*y1)} / ${fmt(denom)} = ${fmt(py)}`,
                                `⑥ P = (${fmt(px)}, ${fmt(py)})`
                            ];
                        } else {
                            denom = m + n;
                            px = (m * x2 + n * x1) / denom;
                            py = (m * y2 + n * y1) / denom;
                            steps = [
                                `① A(${fmt(x1)},${fmt(y1)}) B(${fmt(x2)},${fmt(y2)})`,
                                `② ratio m:n = ${fmt(m)}:${fmt(n)} (internal)`,
                                `③ denominator m + n = ${fmt(m)} + ${fmt(n)} = ${fmt(denom)}`,
                                `④ Px = (${fmt(m)}·${fmt(x2)} + ${fmt(n)}·${fmt(x1)}) / ${fmt(denom)} = ${fmt(m*x2 + n*x1)} / ${fmt(denom)} = ${fmt(px)}`,
                                `⑤ Py = (${fmt(m)}·${fmt(y2)} + ${fmt(n)}·${fmt(y1)}) / ${fmt(denom)} = ${fmt(m*y2 + n*y1)} / ${fmt(denom)} = ${fmt(py)}`,
                                `⑥ P = (${fmt(px)}, ${fmt(py)})`
                            ];
                        }

                        const points = [{x:x1,y:y1}, {x:x2,y:y2}];
                        const pPoint = {x:px, y:py};
                        const lineSegments = [
                            { from: {x:x1,y:y1}, to: {x:x2,y:y2}, color:'#64748B', dash:[5,3], label:'AB' },
                            { from: {x:x1,y:y1}, to: pPoint, color:'#d44c2f', dash:[8,4], label:'AP' },
                            { from: {x:x2,y:y2}, to: pPoint, color:'#1f7f6a', dash:[8,4], label:'BP' }
                        ];
                        drawGraph(points, [{...pPoint, label:'P'}], lineSegments);

                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( P = (${fmt(px)}, ${fmt(py)}) \\)`;
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [sx1, sy1, sx2, sy2, mInp, nInp]);
                    }
                }

                compute.addEventListener('click', update);
                [sx1, sy1, sx2, sy2, mInp, nInp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [sx1, sy1, sx2, sy2, mInp, nInp].forEach(inp => inp.addEventListener('input', clearErrors));
                setModeUI(); 
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
/**
 * Renders the Midpoint of a segment card
 * @returns {void}
 */

            // ========= MIDPOINT CARD (original) =========
            function renderMidpointCard() {
                midpointBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                sectionBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
                const html = `
                    <h2 style="color:#113355;"><span>🔴</span> Midpoint of segment</h2>
                    <div class="formula-badge">\\( M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right) \\)</div>
                    <div class="input-group">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="mx1" value="2" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="my1" value="3" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="mx2" value="8" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="my2" value="7" step="any"></div>
                        </div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computeMidpointBtn"><span>🎯</span> Find midpoint</button>
                    <div class="result-highlight" id="midpointResult">\\( M = (5, 5) \\)</div>
                    <div class="footnote">dashed: AB , dotted: AM & BM</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const mx1 = document.getElementById('mx1'), my1 = document.getElementById('my1');
                const mx2 = document.getElementById('mx2'), my2 = document.getElementById('my2');
                const compute = document.getElementById('computeMidpointBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('midpointResult');

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(mx1.value, 'x₁'), y1 = validateNumber(my1.value, 'y₁');
                        const x2 = validateNumber(mx2.value, 'x₂'), y2 = validateNumber(my2.value, 'y₂');

                        const mx = (x1 + x2) / 2;
                        const my = (y1 + y2) / 2;

                        const points = [{x:x1,y:y1}, {x:x2,y:y2}];
                        const mPoint = {x:mx, y:my};
                        const lineSegments = [
                            { from: {x:x1,y:y1}, to: {x:x2,y:y2}, color:'#64748B', dash:[5,3], label:'AB' },
                            { from: {x:x1,y:y1}, to: mPoint, color:'#d44c2f', dash:[8,4], label:'AM' },
                            { from: {x:x2,y:y2}, to: mPoint, color:'#1f7f6a', dash:[8,4], label:'BM' }
                        ];
                        drawGraph(points, [{...mPoint, label:'M'}], lineSegments);

                        const steps = [
                            `① A(${fmt(x1)},${fmt(y1)}), B(${fmt(x2)},${fmt(y2)})`,
                            `② Mx = (${fmt(x1)} + ${fmt(x2)}) / 2 = ${fmt(x1 + x2)} / 2 = ${fmt(mx)}`,
                            `③ My = (${fmt(y1)} + ${fmt(y2)}) / 2 = ${fmt(y1 + y2)} / 2 = ${fmt(my)}`,
                            `④ M = (${fmt(mx)}, ${fmt(my)})`
                        ];
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( M = (${fmt(mx)}, ${fmt(my)}) \\)`;
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [mx1, my1, mx2, my2]);
                    }
                }

                compute.addEventListener('click', update);
                [mx1, my1, mx2, my2].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [mx1, my1, mx2, my2].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
/**
 * Renders the Centroid of triangle card
 * @returns {void}
 */

            // ========= CENTROID CARD (original) =========
            function renderCentroidCard() {
                centroidBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                sectionBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
                const html = `
                    <h2 style="color:#113355;"><span>🔺</span> Centroid of triangle</h2>
                    <div class="formula-badge">\\( G = \\left( \\frac{x_1+x_2+x_3}{3}, \\frac{y_1+y_2+y_3}{3} \\right) \\)</div>
                    <div class="input-group" style="justify-content:center; gap:15px;">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="cx1" value="1" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="cy1" value="2" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="cx2" value="5" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="cy2" value="6" step="any"></div>
                        </div>
                        <div class="point-box"><label>C</label>
                            <div class="coord-input"><span>x₃ =</span><input type="number" id="cx3" value="9" step="any"></div>
                            <div class="coord-input"><span>y₃ =</span><input type="number" id="cy3" value="1" step="any"></div>
                        </div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computeCentroidBtn"><span>🔺</span> Find centroid</button>
                    <div class="result-highlight" id="centroidResult">\\( G = (5, 3) \\)</div>
                    <div class="footnote">Triangle edges solid, medians (dashed) and full medians (dotted) shown. Centroid as triangle marker.</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const cx1 = document.getElementById('cx1'), cy1 = document.getElementById('cy1');
                const cx2 = document.getElementById('cx2'), cy2 = document.getElementById('cy2');
                const cx3 = document.getElementById('cx3'), cy3 = document.getElementById('cy3');
                const compute = document.getElementById('computeCentroidBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('centroidResult');

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(cx1.value, 'x₁'), y1 = validateNumber(cy1.value, 'y₁');
                        const x2 = validateNumber(cx2.value, 'x₂'), y2 = validateNumber(cy2.value, 'y₂');
                        const x3 = validateNumber(cx3.value, 'x₃'), y3 = validateNumber(cy3.value, 'y₃');

                        const gx = (x1 + x2 + x3) / 3;
                        const gy = (y1 + y2 + y3) / 3;

                        const midAB = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
                        const midBC = { x: (x2 + x3) / 2, y: (y2 + y3) / 2 };
                        const midCA = { x: (x3 + x1) / 2, y: (y3 + y1) / 2 };

                        const points = [{x:x1,y:y1}, {x:x2,y:y2}, {x:x3,y:y3}];
                        const centroid = {x:gx, y:gy, label:'G'};

                        const edges = [
                            { from: {x:x1,y:y1}, to: {x:x2,y:y2}, color:'#2c3e50', dash:[], label:'AB', width:2 },
                            { from: {x:x2,y:y2}, to: {x:x3,y:y3}, color:'#2c3e50', dash:[], label:'BC', width:2 },
                            { from: {x:x3,y:y3}, to: {x:x1,y:y1}, color:'#2c3e50', dash:[], label:'CA', width:2 }
                        ];
                        
                        const mediansToCentroid = [
                            { from: {x:x1,y:y1}, to: centroid, color:'#d44c2f', dash:[6,4], label:'median to A', width:2 },
                            { from: {x:x2,y:y2}, to: centroid, color:'#1f7f6a', dash:[6,4], label:'median to B', width:2 },
                            { from: {x:x3,y:y3}, to: centroid, color:'#ca8a04', dash:[6,4], label:'median to C', width:2 }
                        ];
                        
                        const fullMedians = [
                            { from: {x:x1,y:y1}, to: midBC, color:'#d44c2f', dash:[2,4], label:'full median A', width:1.5 },
                            { from: {x:x2,y:y2}, to: midCA, color:'#1f7f6a', dash:[2,4], label:'full median B', width:1.5 },
                            { from: {x:x3,y:y3}, to: midAB, color:'#ca8a04', dash:[2,4], label:'full median C', width:1.5 }
                        ];
                        
                        const lineSegments = [...edges, ...mediansToCentroid, ...fullMedians];

                        drawGraph(points, [centroid], lineSegments);

                        const steps = [
                            `① A(${fmt(x1)},${fmt(y1)}), B(${fmt(x2)},${fmt(y2)}), C(${fmt(x3)},${fmt(y3)})`,
                            `② Gx = (${fmt(x1)} + ${fmt(x2)} + ${fmt(x3)}) / 3 = ${fmt(x1+x2+x3)} / 3 = ${fmt(gx)}`,
                            `③ Gy = (${fmt(y1)} + ${fmt(y2)} + ${fmt(y3)}) / 3 = ${fmt(y1+y2+y3)} / 3 = ${fmt(gy)}`,
                            `④ G = (${fmt(gx)}, ${fmt(gy)})`
                        ];
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( G = (${fmt(gx)}, ${fmt(gy)}) \\)`;
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [cx1, cy1, cx2, cy2, cx3, cy3]);
                    }
                }

                compute.addEventListener('click', update);
                [cx1, cy1, cx2, cy2, cx3, cy3].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [cx1, cy1, cx2, cy2, cx3, cy3].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
/**
 * Renders the Area of triangle card using determinant formula
 * @returns {void}
 */

            // ========= AREA CARD (original) =========
            function renderAreaCard() {
                if(areaBtn) areaBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                sectionBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');

                const html = `
                    <h2 style="color:#113355;"><span>📐</span> Area of triangle</h2>
                    <div class="formula-badge">\\( \\text{Area} = \\frac{1}{2} \\, | \\, x_1(y_2-y_3) + x_2(y_3-y_1) + x_3(y_1-y_2) \\, | \\)</div>
                    <div class="input-group" style="justify-content:center; gap:15px;">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="ax1" value="1" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="ay1" value="2" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="ax2" value="5" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="ay2" value="6" step="any"></div>
                        </div>
                        <div class="point-box"><label>C</label>
                            <div class="coord-input"><span>x₃ =</span><input type="number" id="ax3" value="9" step="any"></div>
                            <div class="coord-input"><span>y₃ =</span><input type="number" id="ay3" value="1" step="any"></div>
                        </div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computeAreaBtn"><span>📏</span> Calculate area</button>
                    <div class="result-highlight" id="areaResult">\\( \\text{Area} = 18 \\)</div>
                    <div class="footnote">Triangle edges shown with vertex labels. Area is always non‑negative.</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const ax1 = document.getElementById('ax1'), ay1 = document.getElementById('ay1');
                const ax2 = document.getElementById('ax2'), ay2 = document.getElementById('ay2');
                const ax3 = document.getElementById('ax3'), ay3 = document.getElementById('ay3');
                const compute = document.getElementById('computeAreaBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('areaResult');

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(ax1.value, 'x₁'), y1 = validateNumber(ay1.value, 'y₁');
                        const x2 = validateNumber(ax2.value, 'x₂'), y2 = validateNumber(ay2.value, 'y₂');
                        const x3 = validateNumber(ax3.value, 'x₃'), y3 = validateNumber(ay3.value, 'y₃');

                        const sum = x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2);
                        const area = Math.abs(sum) / 2;

                        const points = [{x:x1,y:y1}, {x:x2,y:y2}, {x:x3,y:y3}];
                        const edges = [
                            { from: {x:x1,y:y1}, to: {x:x2,y:y2}, color:'#2c3e50', dash:[], label:'AB', width:2 },
                            { from: {x:x2,y:y2}, to: {x:x3,y:y3}, color:'#2c3e50', dash:[], label:'BC', width:2 },
                            { from: {x:x3,y:y3}, to: {x:x1,y:y1}, color:'#2c3e50', dash:[], label:'CA', width:2 }
                        ];
                        
                        drawGraph(points, [], edges);

                        const steps = [
                            `① A(${fmt(x1)},${fmt(y1)}), B(${fmt(x2)},${fmt(y2)}), C(${fmt(x3)},${fmt(y3)})`,
                            `② term₁ = x₁·(y₂ - y₃) = ${fmt(x1)}·(${fmt(y2)} - ${fmt(y3)}) = ${fmt(x1)}·(${fmt(y2-y3)}) = ${fmt(x1*(y2-y3))}`,
                            `③ term₂ = x₂·(y₃ - y₁) = ${fmt(x2)}·(${fmt(y3)} - ${fmt(y1)}) = ${fmt(x2)}·(${fmt(y3-y1)}) = ${fmt(x2*(y3-y1))}`,
                            `④ term₃ = x₃·(y₁ - y₂) = ${fmt(x3)}·(${fmt(y1)} - ${fmt(y2)}) = ${fmt(x3)}·(${fmt(y1-y2)}) = ${fmt(x3*(y1-y2))}`,
                            `⑤ sum = term₁ + term₂ + term₃ = ${fmt(x1*(y2-y3))} + ${fmt(x2*(y3-y1))} + ${fmt(x3*(y1-y2))} = ${fmt(sum)}`,
                            `⑥ area = ½ × |sum| = ½ × |${fmt(sum)}| = ½ × ${fmt(Math.abs(sum))} = ${fmt(area)}`
                        ];
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( \\text{Area} = ${fmt(area)} \\)`;
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [ax1, ay1, ax2, ay2, ax3, ay3]);
                    }
                }

                compute.addEventListener('click', update);
                [ax1, ay1, ax2, ay2, ax3, ay3].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [ax1, ay1, ax2, ay2, ax3, ay3].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
/**
 * Renders the Collinearity check card for three points
 * @returns {void}
 */

            // ========= COLLINEARITY CARD (original) =========
            function renderCollinearCard() {
                if(collinearBtn) collinearBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                sectionBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(pointLineBtn) pointLineBtn.classList.remove('active-btn');

                const html = `
                    <h2 style="color:#113355;"><span>📏</span> Collinearity of three points</h2>
                    <div class="formula-badge">\\( \\text{Condition: Area} = \\frac{1}{2}|x_1(y_2-y_3)+x_2(y_3-y_1)+x_3(y_1-y_2)| = 0 \\)</div>
                    <div class="formula-badge">\\( \\text{or slopes: } \\frac{y_2-y_1}{x_2-x_1} = \\frac{y_3-y_2}{x_3-x_2} \\) (if denominators ≠ 0)</div>
                    <div class="input-group" style="justify-content:center; gap:15px;">
                        <div class="point-box"><label>A</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="colx1" value="1" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="coly1" value="1" step="any"></div>
                        </div>
                        <div class="point-box"><label>B</label>
                            <div class="coord-input"><span>x₂ =</span><input type="number" id="colx2" value="3" step="any"></div>
                            <div class="coord-input"><span>y₂ =</span><input type="number" id="coly2" value="3" step="any"></div>
                        </div>
                        <div class="point-box"><label>C</label>
                            <div class="coord-input"><span>x₃ =</span><input type="number" id="colx3" value="5" step="any"></div>
                            <div class="coord-input"><span>y₃ =</span><input type="number" id="coly3" value="5" step="any"></div>
                        </div>
                    </div>
                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computeCollinearBtn"><span>🔍</span> Check collinearity</button>
                    <div class="collinear-result" id="collinearResult">Points are collinear</div>
                    <div class="footnote">If area ≈ 0 (within 1e-10), points lie on same straight line.</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const colx1 = document.getElementById('colx1'), coly1 = document.getElementById('coly1');
                const colx2 = document.getElementById('colx2'), coly2 = document.getElementById('coly2');
                const colx3 = document.getElementById('colx3'), coly3 = document.getElementById('coly3');
                const compute = document.getElementById('computeCollinearBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('collinearResult');

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(colx1.value, 'x₁'), y1 = validateNumber(coly1.value, 'y₁');
                        const x2 = validateNumber(colx2.value, 'x₂'), y2 = validateNumber(coly2.value, 'y₂');
                        const x3 = validateNumber(colx3.value, 'x₃'), y3 = validateNumber(coly3.value, 'y₃');

                        const points = [{x:x1,y:y1}, {x:x2,y:y2}, {x:x3,y:y3}];
                        
                        const lineSegments = [
                            { from: {x:x1,y:y1}, to: {x:x2,y:y2}, color:'#64748B', dash:[], label:'AB', width:2 },
                            { from: {x:x2,y:y2}, to: {x:x3,y:y3}, color:'#64748B', dash:[], label:'BC', width:2 },
                            { from: {x:x3,y:y3}, to: {x:x1,y:y1}, color:'#64748B', dash:[], label:'CA', width:2 }
                        ];
                        
                        drawGraph(points, [], lineSegments);

                        const areaSum = x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2);
                        const area = Math.abs(areaSum) / 2;
                        const isCollinearArea = Math.abs(area) < 1e-10;

                        let slopeMessage = "";
                        
                        try {
                            if (Math.abs(x2 - x1) > 1e-10 && Math.abs(x3 - x2) > 1e-10) {
                                const slopeAB = (y2 - y1) / (x2 - x1);
                                const slopeBC = (y3 - y2) / (x3 - x2);
                                slopeMessage = `slope AB = ${fmt(slopeAB)}, slope BC = ${fmt(slopeBC)}`;
                            } else if (Math.abs(x2 - x1) < 1e-10 && Math.abs(x3 - x2) < 1e-10) {
                                slopeMessage = "both segments are vertical (x constant)";
                            } else {
                                slopeMessage = "slope comparison not applicable (vertical/horizontal mix)";
                            }
                        } catch (e) {
                            slopeMessage = "slope comparison not possible";
                        }

                        const isCollinear = isCollinearArea;

                        const steps = [
                            `① A(${fmt(x1)},${fmt(y1)}), B(${fmt(x2)},${fmt(y2)}), C(${fmt(x3)},${fmt(y3)})`,
                            `② Area determinant: x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)`,
                            `   = ${fmt(x1)}·(${fmt(y2)}-${fmt(y3)}) + ${fmt(x2)}·(${fmt(y3)}-${fmt(y1)}) + ${fmt(x3)}·(${fmt(y1)}-${fmt(y2)})`,
                            `   = ${fmt(x1)}·(${fmt(y2-y3)}) + ${fmt(x2)}·(${fmt(y3-y1)}) + ${fmt(x3)}·(${fmt(y1-y2)})`,
                            `   = ${fmt(x1*(y2-y3))} + ${fmt(x2*(y3-y1))} + ${fmt(x3*(y1-y2))} = ${fmt(areaSum)}`,
                            `③ Area = ½|${fmt(areaSum)}| = ${fmt(area)}`,
                            `④ ${slopeMessage}`,
                            `⑤ Since area ${isCollinear ? '≈ 0' : '≠ 0'}, points are ${isCollinear ? '' : 'not '}collinear`
                        ];
                        
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        
                        resultDiv.innerHTML = `Points are ${isCollinear ? 'collinear' : 'not collinear'}`;
                        resultDiv.className = `collinear-result ${isCollinear ? 'yes' : 'no'}`;
                        
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [colx1, coly1, colx2, coly2, colx3, coly3]);
                    }
                }

                compute.addEventListener('click', update);
                [colx1, coly1, colx2, coly2, colx3, coly3].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [colx1, coly1, colx2, coly2, colx3, coly3].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }

            // ========= NEW: POINT-TO-LINE DISTANCE CARD =========
            function renderPointLineCard() {
                pointLineBtn.classList.add('active-btn');
                distanceBtn.classList.remove('active-btn');
                sectionBtn.classList.remove('active-btn');
                midpointBtn.classList.remove('active-btn');
                centroidBtn.classList.remove('active-btn');
                if(areaBtn) areaBtn.classList.remove('active-btn');
                if(collinearBtn) collinearBtn.classList.remove('active-btn');

                const html = `
                    <h2 style="color:#113355;"><span>📐➡️📏</span> Distance from point to line</h2>
                    <div class="formula-badge">\\( P(x_1,y_1) \\quad \\text{line } ax+by+c=0 \\)</div>
                    <div class="formula-badge">\\( d = \\dfrac{|a x_1 + b y_1 + c|}{\\sqrt{a^2 + b^2}} \\)</div>
                    
                    <div class="input-group" style="justify-content:center;">
                        <div class="point-box" style="flex:1.5;">
                            <label>Point P</label>
                            <div class="coord-input"><span>x₁ =</span><input type="number" id="plX" value="3" step="any"></div>
                            <div class="coord-input"><span>y₁ =</span><input type="number" id="plY" value="4" step="any"></div>
                        </div>
                        <div class="point-box" style="flex:2;">
                            <label>Line: a·x + b·y + c = 0</label>
                            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">
                                <div><span>a =</span> <input type="number" id="lineA" value="1" step="any" style="width:70px;"></div>
                                <div><span>b =</span> <input type="number" id="lineB" value="-1" step="any" style="width:70px;"></div>
                                <div><span>c =</span> <input type="number" id="lineC" value="0" step="any" style="width:70px;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
                    
                    <div class="steps-header">
                        <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
                    </div>
                    <div class="steps-container" id="stepsContainer"></div>
                    <button class="calculate-btn" id="computePointLineBtn"><span>📏</span> Compute distance</button>
                    <div class="result-highlight" id="pointLineResult">\\( d = 2.1213 \\)</div>
                    <div class="footnote">Graph shows point P and the line. Dashed perpendicular from P to line (nearest point).</div>
                `;
                mainCard.innerHTML = html;
                renderLatex();

                const x1Inp = document.getElementById('plX'), y1Inp = document.getElementById('plY');
                const aInp = document.getElementById('lineA'), bInp = document.getElementById('lineB'), cInp = document.getElementById('lineC');
                const compute = document.getElementById('computePointLineBtn');
                const stepsDiv = document.getElementById('stepsContainer');
                const resultDiv = document.getElementById('pointLineResult');

                function update() {
                    clearErrors();
                    try {
                        const x1 = validateNumber(x1Inp.value, 'x₁');
                        const y1 = validateNumber(y1Inp.value, 'y₁');
                        const a = validateNumber(aInp.value, 'a');
                        const b = validateNumber(bInp.value, 'b');
                        const c = validateNumber(cInp.value, 'c');

                        if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) {
                            throw new Error('a and b cannot both be zero');
                        }

                        // distance formula
                        const numerator = Math.abs(a * x1 + b * y1 + c);
                        const denominator = Math.sqrt(a*a + b*b);
                        const distance = numerator / denominator;

                        // find foot of perpendicular (projection) for drawing
                        // point on line: (x0,y0) = (x1 - a*t, y1 - b*t) where t = (a*x1+b*y1+c)/(a^2+b^2)
                        const t = (a*x1 + b*y1 + c) / (a*a + b*b);
                        const footX = x1 - a * t;
                        const footY = y1 - b * t;

                        // points for graph: point P, and foot
                        const points = [{x:x1, y:y1}];
                        const special = [{x:footX, y:footY, label:'foot'}];

                        // We need to draw the line: find two points far away along the line.
                        // direction vector perpendicular to normal (a,b) is (-b, a)
                        const range = 8; // will be adjusted by bounds later, but we pick reasonable segment.
                        let p1x, p1y, p2x, p2y;
                        if (Math.abs(b) > 1e-8) {
                            // line: y = (-a x - c)/b
                            p1x = footX - 5; p1y = (-a * p1x - c) / b;
                            p2x = footX + 5; p2y = (-a * p2x - c) / b;
                        } else {
                            // vertical line (a != 0)
                            p1x = -c/a; p1y = footY - 5;
                            p2x = -c/a; p2y = footY + 5;
                        }

                        const lineSegments = [
                            { from: {x:p1x, y:p1y}, to: {x:p2x, y:p2y}, color:'#2c3e50', dash:[], label:'line', width:2 },
                            { from: {x:x1, y:y1}, to: {x:footX, y:footY}, color:'#d44c2f', dash:[5,3], label:'perp', width:2 }
                        ];

                        drawGraph(points, special, lineSegments);

                        const steps = [
                            `① Point P(${fmt(x1)}, ${fmt(y1)})`,
                            `② Line: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                            `③ Numerator = |a·x₁ + b·y₁ + c| = |${fmt(a)}·${fmt(x1)} + ${fmt(b)}·${fmt(y1)} + ${fmt(c)}| = |${fmt(a*x1 + b*y1 + c)}| = ${fmt(numerator)}`,
                            `④ Denominator = √(a² + b²) = √(${fmt(a*a)} + ${fmt(b*b)}) = √${fmt(a*a + b*b)} = ${fmt(denominator)}`,
                            `⑤ Distance = ${fmt(numerator)} / ${fmt(denominator)} = ${fmt(distance)}`
                        ];
                        stepsDiv.innerHTML = steps.map((txt, i) => 
                            `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
                        ).join('');
                        resultDiv.innerHTML = `\\( d = ${fmt(distance)} \\)`;
                        renderLatex();
                        attachStepsToggle();
                    } catch (e) {
                        showError(e.message, [x1Inp, y1Inp, aInp, bInp, cInp]);
                    }
                }

                compute.addEventListener('click', update);
                [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
                [x1Inp, y1Inp, aInp, bInp, cInp].forEach(inp => inp.addEventListener('input', clearErrors));
                setTimeout(() => { update(); attachStepsToggle(); }, 50);
            }
// ========= NEW: PARALLEL LINES DISTANCE CARD =========
function renderParallelLinesCard() {
    parallelLinesBtn.classList.add('active-btn');
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📏📏</span> Distance between parallel lines</h2>
        <div class="formula-badge">\\( \\text{Line 1: } ax + by + c_1 = 0 \\)</div>
        <div class="formula-badge">\\( \\text{Line 2: } ax + by + c_2 = 0 \\)</div>
        <div class="formula-badge">\\( d = \\dfrac{|c_1 - c_2|}{\\sqrt{a^2 + b^2}} \\)</div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:500px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Common coefficients</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>a =</span> <input type="number" id="plA" value="1" step="any" style="width:80px;"></div>
                    <div><span>b =</span> <input type="number" id="plB" value="-1" step="any" style="width:80px;"></div>
                </div>
            </div>
            <div class="point-box" style="width:100%;">
                <label>Constants</label>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <div><span>c₁ =</span> <input type="number" id="plC1" value="0" step="any" style="width:80px;"></div>
                    <div><span>c₂ =</span> <input type="number" id="plC2" value="5" step="any" style="width:80px;"></div>
                </div>
            </div>
        </div>

        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        <button class="calculate-btn" id="computeParallelLinesBtn"><span>📏</span> Compute distance</button>
        <div class="result-highlight" id="parallelLinesResult">\\( d = 3.5355 \\)</div>
        <div class="footnote">Graph shows both parallel lines. Distance measured perpendicularly between them.</div>
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const aInp = document.getElementById('plA'), bInp = document.getElementById('plB');
    const c1Inp = document.getElementById('plC1'), c2Inp = document.getElementById('plC2');
    const compute = document.getElementById('computeParallelLinesBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('parallelLinesResult');

    function update() {
        clearErrors();
        try {
            const a = validateNumber(aInp.value, 'a');
            const b = validateNumber(bInp.value, 'b');
            const c1 = validateNumber(c1Inp.value, 'c₁');
            const c2 = validateNumber(c2Inp.value, 'c₂');

            if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) {
                throw new Error('a and b cannot both be zero');
            }

            // distance formula
            const numerator = Math.abs(c1 - c2);
            const denominator = Math.sqrt(a*a + b*b);
            const distance = numerator / denominator;

            // Find a point on each line for drawing
            let p1, p2, q1, q2; // points for line1 and line2
            
            if (Math.abs(b) > 1e-8) {
                // For line1: y = (-a*x - c1)/b
                p1 = {x: -5, y: (-a*(-5) - c1)/b};
                p2 = {x: 5, y: (-a*5 - c1)/b};
                // For line2: y = (-a*x - c2)/b
                q1 = {x: -5, y: (-a*(-5) - c2)/b};
                q2 = {x: 5, y: (-a*5 - c2)/b};
            } else {
                // Vertical line (a != 0)
                p1 = {x: -c1/a, y: -5};
                p2 = {x: -c1/a, y: 5};
                q1 = {x: -c2/a, y: -5};
                q2 = {x: -c2/a, y: 5};
            }

            // Find a perpendicular segment for visualization
            let perpStart, perpEnd;
            if (Math.abs(b) > 1e-8) {
                // Find a point on line1
                const x0 = 0;
                const y0 = (-a*x0 - c1)/b;
                // Move perpendicular to line2 (along normal vector (a,b))
                const norm = Math.sqrt(a*a + b*b);
                const perpDist = distance;
                const perpX = x0 + (a/norm) * perpDist;
                const perpY = y0 + (b/norm) * perpDist;
                perpStart = {x: x0, y: y0};
                perpEnd = {x: perpX, y: perpY};
            } else {
                // Vertical line case
                const x0 = -c1/a;
                const y0 = 0;
                perpStart = {x: x0, y: y0};
                perpEnd = {x: -c2/a, y: y0};
            }

            const lineSegments = [
                { from: p1, to: p2, color: '#2c3e50', dash: [], label: 'Line 1', width: 2 },
                { from: q1, to: q2, color: '#e67e22', dash: [], label: 'Line 2', width: 2 },
                { from: perpStart, to: perpEnd, color: '#d44c2f', dash: [5,3], label: 'perpendicular', width: 2 }
            ];

            drawGraph([], [], lineSegments);

            const steps = [
                `① Line 1: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c1)} = 0`,
                `② Line 2: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c2)} = 0`,
                `③ Numerator = |c₁ - c₂| = |${fmt(c1)} - ${fmt(c2)}| = |${fmt(c1 - c2)}| = ${fmt(numerator)}`,
                `④ Denominator = √(a² + b²) = √(${fmt(a*a)} + ${fmt(b*b)}) = √${fmt(a*a + b*b)} = ${fmt(denominator)}`,
                `⑤ Distance = ${fmt(numerator)} / ${fmt(denominator)} = ${fmt(distance)}`
            ];
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
            ).join('');
            resultDiv.innerHTML = `\\( d = ${fmt(distance)} \\)`;
            renderLatex();
            attachStepsToggle();
        } catch (e) {
            showError(e.message, [aInp, bInp, c1Inp, c2Inp]);
        }
    }

    compute.addEventListener('click', update);
    [aInp, bInp, c1Inp, c2Inp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
    [aInp, bInp, c1Inp, c2Inp].forEach(inp => inp.addEventListener('input', clearErrors));
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// ========= NEW: SLOPE CARD =========
function renderSlopeCard() {
    slopeBtn.classList.add('active-btn');
    distanceBtn.classList.remove('active-btn');
    sectionBtn.classList.remove('active-btn');
    midpointBtn.classList.remove('active-btn');
    centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');

    const html = `
        <h2 style="color:#113355;"><span>📈</span> Slope of line joining two points</h2>
        <div class="formula-badge">\\( m = \\frac{y_2 - y_1}{x_2 - x_1} \\)</div>
        <div class="formula-badge" style="background: #fff3cd; border-color: #856404;">\\( \\text{Note: Slope is undefined (vertical line) if } x_1 = x_2 \\)</div>
        
        <div class="input-group">
            <div class="point-box"><label>Point A</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="slopeX1" value="2" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="slopeY1" value="3" step="any"></div>
            </div>
            <div class="point-box"><label>Point B</label>
                <div class="coord-input"><span>x₂ =</span><input type="number" id="slopeX2" value="8" step="any"></div>
                <div class="coord-input"><span>y₂ =</span><input type="number" id="slopeY2" value="7" step="any"></div>
            </div>
        </div>

        <div class="graph-container"><canvas id="coordinateGraph"></canvas></div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSlopeBtn"><span>📈</span> Calculate slope</button>
        
        <div class="result-highlight" id="slopeResult">\\( m = 0.6667 \\)</div>
        <div class="footnote">Graph shows the line segment AB. Slope = rise / run</div>
    `;
    mainCard.innerHTML = html;
    renderLatex();

    const x1Inp = document.getElementById('slopeX1'), y1Inp = document.getElementById('slopeY1');
    const x2Inp = document.getElementById('slopeX2'), y2Inp = document.getElementById('slopeY2');
    const compute = document.getElementById('computeSlopeBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('slopeResult');

    function update() {
        clearErrors();
        try {
            const x1 = validateNumber(x1Inp.value, 'x₁');
            const y1 = validateNumber(y1Inp.value, 'y₁');
            const x2 = validateNumber(x2Inp.value, 'x₂');
            const y2 = validateNumber(y2Inp.value, 'y₂');

            // Draw the line segment
            const points = [{x:x1, y:y1}, {x:x2, y:y2}];
            const lineSegments = [
                { from: {x:x1, y:y1}, to: {x:x2, y:y2}, color: '#2c3e50', dash: [], label: 'AB', width: 2 }
            ];
            drawGraph(points, [], lineSegments);

            // Calculate slope
            const dx = x2 - x1;
            const dy = y2 - y1;
            
            let slope, slopeText, steps;
            
            if (Math.abs(dx) < 1e-12) {
                // Vertical line
                slope = undefined;
                slopeText = "undefined (vertical line)";
                steps = [
                    `① Point A(${fmt(x1)}, ${fmt(y1)})`,
                    `② Point B(${fmt(x2)}, ${fmt(y2)})`,
                    `③ Δx = x₂ - x₁ = ${fmt(x2)} - ${fmt(x1)} = ${fmt(dx)} ≈ 0`,
                    `④ Since Δx = 0, the line is vertical`,
                    `⑤ Slope is undefined for vertical lines`
                ];
                resultDiv.innerHTML = `\\( \\text{Slope is undefined (vertical line)} \\)`;
            } else {
                slope = dy / dx;
                slopeText = fmt(slope);
                steps = [
                    `① Point A(${fmt(x1)}, ${fmt(y1)})`,
                    `② Point B(${fmt(x2)}, ${fmt(y2)})`,
                    `③ Δx = x₂ - x₁ = ${fmt(x2)} - ${fmt(x1)} = ${fmt(dx)}`,
                    `④ Δy = y₂ - y₁ = ${fmt(y2)} - ${fmt(y1)} = ${fmt(dy)}`,
                    `⑤ m = Δy / Δx = ${fmt(dy)} / ${fmt(dx)} = ${slopeText}`,
                    `⑥ The slope of the line is ${slopeText}`
                ];
                resultDiv.innerHTML = `\\( m = ${slopeText} \\)`;
            }

            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row"><span class="step-marker">${i+1}</span><span class="step-text">${txt}</span></div>`
            ).join('');
            
            renderLatex();
            attachStepsToggle();
        } catch (e) {
            showError(e.message, [x1Inp, y1Inp, x2Inp, y2Inp]);
        }
    }

    compute.addEventListener('click', update);
    [x1Inp, y1Inp, x2Inp, y2Inp].forEach(inp => inp.addEventListener('keypress', e => e.key === 'Enter' && update()));
    [x1Inp, y1Inp, x2Inp, y2Inp].forEach(inp => inp.addEventListener('input', clearErrors));
    setTimeout(() => { update(); attachStepsToggle(); }, 50);
}
// Touch optimization: increase hit radius for points
function enhanceGraphForTouch() {
    if (!chartInstance) return;
    
    // Increase point hover radius for touch devices
    if (window.innerWidth < 768) {
        chartInstance.config.options.elements.point.hoverRadius = 15;
        chartInstance.config.options.elements.point.hitRadius = 20;
        chartInstance.update();
    }
}

switchTab('tabCoordinateGeometry');
renderRectCoordCard(); // Changed from renderDistanceCard()