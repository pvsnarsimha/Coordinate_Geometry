// ========= OPTIMIZATION: Lazy load tab content =========
const tabContentMap = new Map();

// Register tabs with their lazy load function
function registerTab(tabId, loadFunction) {
    tabContentMap.set(tabId, loadFunction);
}

// Load tab content when clicked
function loadTabContent(tabId) {
    const loader = tabContentMap.get(tabId);
    if (loader && !window[`${tabId}Loaded`]) {
        console.log(`📂 Loading tab: ${tabId}`);
        loader();
        window[`${tabId}Loaded`] = true;
    }
}

// Modify switchTab function to lazy load content
const originalSwitchTab = switchTab;
window.switchTab = function(activeTabId) {
    // Load content for this tab if not loaded
    loadTabContent(activeTabId);
    
    // Call original function
    originalSwitchTab(activeTabId);
};

// Register tabs with their lazy load functions
registerTab('tabLineEquations', () => {
    // This will load Equations.js functions when needed
    console.log('Loading Equation forms...');
    // Functions are already defined in Equations.js
});

registerTab('tabAnglesIntersections', () => {
    console.log('Loading Angle & Intersection functions...');
});

registerTab('tabDistanceMeasures', () => {
    console.log('Loading Distance Measures functions...');
});

registerTab('tabLocusGeometric', () => {
    console.log('Loading Locus Geometric functions...');
});

registerTab('tabAngleBisectors', () => {
    console.log('Loading Angle Bisectors functions...');
});

registerTab('tabStandardPoints', () => {
    console.log('Loading Standard Points functions...');
});
// Get the new tab element
const tabLineEquations = document.getElementById('tabLineEquations');
const slopeInterceptBtn = document.getElementById('slopeInterceptBtn');

// Function to switch between main tabs
// Function to switch between main tabs
// Function to switch between main tabs
// Function to switch between main tabs



// Add this after the other tab event listeners
const tabCoordinateGeometry = document.getElementById('tabCoordinateGeometry');
tabCoordinateGeometry.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabCoordinateGeometry');
    // Optionally, render a default card for this tab
    renderDistanceCard(); // or whichever card you want as default
});
// Event listener for the new point-slope sidebar button
const pointSlopeBtn = document.getElementById('pointSlopeBtn');
pointSlopeBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderPointSlopeCard();
});
// Event listener for the new two-point sidebar button
const twoPointBtn = document.getElementById('twoPointBtn');
twoPointBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderTwoPointCard();
});
// Event listener for the normal form sidebar button
const normalFormBtn = document.getElementById('normalFormBtn');
normalFormBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderNormalFormCard();
});
// Event listener for the intercept form sidebar button
const interceptFormBtn = document.getElementById('interceptFormBtn');
interceptFormBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderInterceptFormCard();
});
// Event listener for the general form sidebar button
const generalFormBtn = document.getElementById('generalFormBtn');
if (generalFormBtn) {
    generalFormBtn.addEventListener('click', () => {
        destroyGraph();
        // Ensure we're in the right tab and activate the button
        switchTab('tabLineEquations');
        renderGeneralFormCard();
    });
}
// Event listener for the parametric form sidebar button
parametricFormBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderParametricCard();
});
// Event listener for the horizontal line sidebar button
const horizontalLineBtn = document.getElementById('horizontalLineBtn');
horizontalLineBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderHorizontalLineCard();
});

// Event listener for the vertical line sidebar button
const verticalLineBtn = document.getElementById('verticalLineBtn');
verticalLineBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderVerticalLineCard();
});

// Event listeners for the new general form analysis buttons
const slopeFromGeneralBtn = document.getElementById('slopeFromGeneralBtn');
slopeFromGeneralBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabLineEquations');
    renderSlopeFromGeneralCard();
});

const xInterceptBtn = document.getElementById('xInterceptBtn');
xInterceptBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabLineEquations');
    renderXInterceptCard();
});

const yInterceptBtn = document.getElementById('yInterceptBtn');
yInterceptBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabLineEquations');
    renderYInterceptCard();
});
// Event listener for the symmetric form sidebar button
const symmetricFormBtn = document.getElementById('symmetricFormBtn');
symmetricFormBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderSymmetricFormCard();
});
// Event listener for the concurrency button
const concurrencyBtn = document.getElementById('concurrencyBtn');
concurrencyBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderConcurrencyCard();
});
// Event listener for the family lines button (add with other listeners, around line 2240)
familyLinesBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderFamilyLinesCard();
});
// Event listener for the linear independence button
const linearIndependenceBtn = document.getElementById('linearIndependenceBtn');
linearIndependenceBtn.addEventListener('click', () => {
    destroyGraph();
    // Ensure we're in the right tab and activate the button
    switchTab('tabLineEquations');
    renderLinearIndependenceCard();
});
// Add this with the other tab event listeners
const tabAnglesIntersections = document.getElementById('tabAnglesIntersections');
tabAnglesIntersections.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderAngleBetweenLinesCard();
});
// Event listeners for parallelism and perpendicularity buttons
const parallelismBtn = document.getElementById('parallelismBtn');
parallelismBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderParallelismCard();
});

const perpendicularityBtn = document.getElementById('perpendicularityBtn');
perpendicularityBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderPerpendicularityCard();
});
// Event listeners for the new angle/intersection buttons
const intersectionPointBtn = document.getElementById('intersectionPointBtn');
intersectionPointBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderIntersectionPointCard();
});

const lineParallelBtn = document.getElementById('lineParallelBtn');
lineParallelBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderLineParallelCard();
});

const linePerpendicularBtn = document.getElementById('linePerpendicularBtn');
linePerpendicularBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderLinePerpendicularCard();
});
// Event listeners for the two new buttons
const angleWithAxesBtn = document.getElementById('angleWithAxesBtn');
angleWithAxesBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderAngleWithAxesCard();
});

const interceptApplicationsBtn = document.getElementById('interceptApplicationsBtn');
interceptApplicationsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderInterceptApplicationsCard();
});
// Event listeners for the four new buttons
const footPerpendicularBtn = document.getElementById('footPerpendicularBtn');
footPerpendicularBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderFootPerpendicularCard();
});

const imagePointLineBtn = document.getElementById('imagePointLineBtn');
imagePointLineBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderImagePointLineCard();
});

const imagePointAxesBtn = document.getElementById('imagePointAxesBtn');
imagePointAxesBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderImagePointAxesCard();
});

const footAlongDirectionBtn = document.getElementById('footAlongDirectionBtn');
footAlongDirectionBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAnglesIntersections');
    renderFootAlongDirectionCard();
});
// Add this with the other tab event listeners
const tabDistanceMeasures = document.getElementById('tabDistanceMeasures');
tabDistanceMeasures.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    // Default to the first button
    renderDistanceOriginToLineCard();
});
// Event listeners for the new distance measures buttons
const distanceOriginToLineBtn = document.getElementById('distanceOriginToLineBtn');
distanceOriginToLineBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderDistanceOriginToLineCard();
});

const perpendicularDistanceBtn = document.getElementById('perpendicularDistanceBtn');
perpendicularDistanceBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderPerpendicularDistanceCard();
});

const equidistantPointsBtn = document.getElementById('equidistantPointsBtn');
equidistantPointsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderEquidistantPointsCard();
});

const skewLinesBtn = document.getElementById('skewLinesBtn');
skewLinesBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderSkewLinesCard();
});
// Event listeners for the new distance measures buttons
const pointRelativePositionBtn = document.getElementById('pointRelativePositionBtn');
pointRelativePositionBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderPointRelativePositionCard();
});

const pointsSameSideBtn = document.getElementById('pointsSameSideBtn');
pointsSameSideBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderPointsSameSideCard();
});

const areaApplicationsBtn = document.getElementById('areaApplicationsBtn');
areaApplicationsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderAreaApplicationsCard();
});
// Event listeners for the new distance measures buttons
const projectionLengthBtn = document.getElementById('projectionLengthBtn');
projectionLengthBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderProjectionLengthCard();
});

const parallelLinesInterceptBtn = document.getElementById('parallelLinesInterceptBtn');
parallelLinesInterceptBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderParallelLinesInterceptCard();
});

const distanceLineAxesBtn = document.getElementById('distanceLineAxesBtn');
distanceLineAxesBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderDistanceLineAxesCard();
});

// ADD YOUR THREE NEW BUTTON EVENT LISTENERS HERE
const originSideBtn = document.getElementById('originSideBtn');
originSideBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    // You'll need to create these render functions
    renderOriginSideCard();
});

const lineCurveDistanceBtn = document.getElementById('lineCurveDistanceBtn');
lineCurveDistanceBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderLineCurveDistanceCard();
});

const rectangleSquareBtn = document.getElementById('rectangleSquareBtn');
rectangleSquareBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabDistanceMeasures');
    renderRectangleSquareCard();
});

// ADD YOUR 4 NEW EVENT LISTENERS HERE


// Event listener for the Angle Bisectors & Family of Lines tab (the tab had no click handler)
const tabAngleBisectors = document.getElementById('tabAngleBisectors');
tabAngleBisectors.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabAngleBisectors');
    renderAngleBisectorsEquationCard();
});

// Event listeners for Standard Points of Triangle
const tabStandardPoints = document.getElementById('tabStandardPoints');
tabStandardPoints.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderTriangleVerticesCard();
});
const triangleVerticesBtn = document.getElementById('triangleVerticesBtn');
triangleVerticesBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderTriangleVerticesCard();
});

const centroidTriangleBtn = document.getElementById('centroidTriangleBtn');
centroidTriangleBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderCentroidTriangleCard();
});

const incenterTriangleBtn = document.getElementById('incenterTriangleBtn');
incenterTriangleBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderIncenterTriangleCard();
});

const circumcenterTriangleBtn = document.getElementById('circumcenterTriangleBtn');
circumcenterTriangleBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderCircumcenterTriangleCard();
});

const orthocenterTriangleBtn = document.getElementById('orthocenterTriangleBtn');
orthocenterTriangleBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderOrthocenterTriangleCard();
});
// Add these with the other event listeners in the <script> tag

// Equations of Medians button
const mediansEquationsBtn = document.getElementById('mediansEquationsBtn');
mediansEquationsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderMediansEquationsCard();
});

// Equations of Altitudes button
const altitudesEquationsBtn = document.getElementById('altitudesEquationsBtn');
altitudesEquationsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderAltitudesEquationsCard();
});

// Equations of Perpendicular Bisectors button
const perpBisectorsEquationsBtn = document.getElementById('perpBisectorsEquationsBtn');
perpBisectorsEquationsBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderPerpBisectorsEquationsCard();
});

// Circumcenter using Line Equations button
const circumcenterLineEqBtn = document.getElementById('circumcenterLineEqBtn');
circumcenterLineEqBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderCircumcenterLineEqCard();
});

// Orthocenter using Line Equations button
const orthocenterLineEqBtn = document.getElementById('orthocenterLineEqBtn');
orthocenterLineEqBtn.addEventListener('click', () => {
    destroyGraph();
    switchTab('tabStandardPoints');
    renderOrthocenterLineEqCard();
});
