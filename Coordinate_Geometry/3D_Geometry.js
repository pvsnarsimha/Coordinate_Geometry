// ============================================
// 3D GEOMETRY MODULE - Enhanced HD Version
// With drag, rotate, zoom controls and number line axes
// ============================================

// Global variables for 3D scene
let scene3D = null;
let camera3D = null;
let renderer3D = null;
let controls3D = null;
let animationFrameId = null;
let current3DPoints = [];
let current3DLines = [];
let current3DSceneInitialized = false;
let zoomButtonsAdded = false;

// Store THREE globally when loaded
let THREE = null;
let OrbitControls = null;

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

/**
 * Loads Three.js dynamically
 */
function loadThreeJS() {
    return new Promise((resolve, reject) => {
        if (typeof window.THREE !== 'undefined' && window.THREE) {
            THREE = window.THREE;
            if (window.OrbitControls) {
                OrbitControls = window.OrbitControls;
                resolve();
            } else {
                // Load OrbitControls
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
                script.type = 'module';
                script.onload = () => {
                    resolve();
                };
                script.onerror = reject;
                document.head.appendChild(script);
            }
        } else {
            // Load Three.js
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                THREE = window.THREE;
                // Load OrbitControls
                const controlsScript = document.createElement('script');
                controlsScript.src = 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
                controlsScript.type = 'module';
                controlsScript.onload = () => {
                    import('https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js').then(module => {
                        OrbitControls = module.OrbitControls;
                        resolve();
                    }).catch(reject);
                };
                controlsScript.onerror = reject;
                document.head.appendChild(controlsScript);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        }
    });
}

/**
 * Adds zoom control buttons to the graph container
 */
function addZoomControlButtons(container) {
    if (zoomButtonsAdded) return;
    
    // Create zoom control panel
    const zoomPanel = document.createElement('div');
    zoomPanel.id = 'zoomControlsPanel';
    zoomPanel.style.cssText = `
        position: absolute;
        bottom: 15px;
        right: 15px;
        z-index: 100;
        display: flex;
        gap: 10px;
        background: rgba(30, 30, 40, 0.85);
        backdrop-filter: blur(8px);
        padding: 8px 12px;
        border-radius: 50px;
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    // Zoom In button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '🔍 +';
    zoomInBtn.style.cssText = `
        background: #1e4460;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    zoomInBtn.onmouseover = () => zoomInBtn.style.transform = 'scale(1.1)';
    zoomInBtn.onmouseout = () => zoomInBtn.style.transform = 'scale(1)';
    zoomInBtn.onclick = () => {
        if (camera3D) {
            camera3D.position.multiplyScalar(0.85);
            controls3D.target.set(0, 0, 0);
            controls3D.update();
        }
    };
    
    // Zoom Out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '🔍 -';
    zoomOutBtn.style.cssText = `
        background: #1e4460;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    zoomOutBtn.onmouseover = () => zoomOutBtn.style.transform = 'scale(1.1)';
    zoomOutBtn.onmouseout = () => zoomOutBtn.style.transform = 'scale(1)';
    zoomOutBtn.onclick = () => {
        if (camera3D) {
            camera3D.position.multiplyScalar(1.18);
            controls3D.target.set(0, 0, 0);
            controls3D.update();
        }
    };
    
    // Reset View button
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '⟳';
    resetBtn.style.cssText = `
        background: #1e4460;
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    resetBtn.onmouseover = () => resetBtn.style.transform = 'scale(1.1)';
    resetBtn.onmouseout = () => resetBtn.style.transform = 'scale(1)';
    resetBtn.onclick = () => {
        if (camera3D && controls3D) {
            camera3D.position.set(6, 5, 8);
            controls3D.target.set(0, 0, 0);
            controls3D.update();
        }
    };
    
    // Add info text
    const infoText = document.createElement('span');
    infoText.innerHTML = '🖱️ Drag to rotate | Scroll to zoom';
    infoText.style.cssText = `
        color: white;
        font-size: 12px;
        padding: 0 10px;
        font-family: 'Segoe UI', sans-serif;
        background: rgba(0,0,0,0.5);
        border-radius: 20px;
        display: flex;
        align-items: center;
    `;
    
    zoomPanel.appendChild(zoomInBtn);
    zoomPanel.appendChild(zoomOutBtn);
    zoomPanel.appendChild(resetBtn);
    zoomPanel.appendChild(infoText);
    
    // Make container relative for absolute positioning
    if (container) {
        container.style.position = 'relative';
        container.appendChild(zoomPanel);
        zoomButtonsAdded = true;
    }
}

/**
 * Adds number line labels on axes
 */
function addNumberLineLabels() {
    if (!scene3D || !THREE) return;
    
    // Function to create number label sprite
    function createNumberLabel(num, position, color = '#2c3e50') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 24;
        const text = num.toString();
        
        ctx.font = `Bold ${fontSize}px "Segoe UI", "Arial"`;
        const textWidth = ctx.measureText(text).width;
        
        canvas.width = textWidth + 16;
        canvas.height = fontSize + 16;
        
        ctx.font = `Bold ${fontSize}px "Segoe UI", "Arial"`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle background glow
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.4, 0.25, 0.4);
        sprite.position.set(position.x, position.y, position.z);
        scene3D.add(sprite);
    }
    
    // Add numbers on X-axis from -5 to 5
    for (let x = -5; x <= 5; x++) {
        if (x !== 0) {
            createNumberLabel(x, { x: x, y: -0.2, z: -0.2 }, '#e67e22');
        }
    }
    
    // Add numbers on Y-axis from -5 to 5
    for (let y = -5; y <= 5; y++) {
        if (y !== 0) {
            createNumberLabel(y, { x: -0.3, y: y, z: -0.2 }, '#e67e22');
        }
    }
    
    // Add numbers on Z-axis from -5 to 5
    for (let z = -5; z <= 5; z++) {
        if (z !== 0) {
            createNumberLabel(z, { x: -0.2, y: -0.2, z: z }, '#e67e22');
        }
    }
}

/**
 * Initializes or reinitializes the 3D scene - HD Enhanced Version
 */
function init3DScene() {
    console.log('init3DScene called - HD Enhanced Version');
    const container = document.getElementById('threeDGraph');
    if (!container) {
        console.error('3D container not found - make sure element with id "threeDGraph" exists');
        return false;
    }
    
    // Check if THREE is available
    if (!THREE) {
        console.log('THREE not loaded yet, loading...');
        loadThreeJS().then(() => {
            console.log('Three.js loaded, initializing scene...');
            init3DScene();
        }).catch(err => {
            console.error('Failed to load Three.js:', err);
        });
        return false;
    }
    
    // Clean up existing scene
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (renderer3D) {
        if (renderer3D.domElement && renderer3D.domElement.parentNode) {
            renderer3D.domElement.parentNode.removeChild(renderer3D.domElement);
        }
        renderer3D = null;
    }
    if (controls3D) {
        controls3D.dispose();
        controls3D = null;
    }
    
    // Clear container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    console.log(`Container dimensions: ${width} x ${height}`);
    
    if (width === 0 || height === 0) {
        console.warn('Container has zero size, retrying...');
        setTimeout(() => init3DScene(), 100);
        return false;
    }
    
    try {
        // Create scene with HD background
        scene3D = new THREE.Scene();
        scene3D.background = new THREE.Color(0xf0f4fa);
        scene3D.fog = new THREE.FogExp2(0xf0f4fa, 0.008); // Subtle fog for depth
        
        // Create camera (perspective camera) - wider FOV for better viewing
        camera3D = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera3D.position.set(7, 6, 9);
        camera3D.lookAt(0, 0, 0);
        
        // Create renderer with HD settings
        renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer3D.setSize(width, height);
        renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // HD quality
        renderer3D.shadowMap.enabled = true; // Enable shadows for better depth
        renderer3D.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer3D.domElement);
        
        // Add controls with enhanced settings
        if (OrbitControls) {
            controls3D = new OrbitControls(camera3D, renderer3D.domElement);
            controls3D.enableDamping = true;
            controls3D.dampingFactor = 0.05;
            controls3D.rotateSpeed = 1.5;
            controls3D.zoomSpeed = 1.5;
            controls3D.panSpeed = 0.8;
            controls3D.enableZoom = true;
            controls3D.zoomSpeed = 1.2;
            controls3D.enablePan = true;
            controls3D.panSpeed = 0.8;
        }
        
        // Enhanced lighting system
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
        scene3D.add(ambientLight);
        
        // Main directional light (sunlight)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(2, 5, 3);
        mainLight.castShadow = true;
        mainLight.receiveShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        scene3D.add(mainLight);
        
        // Fill light from below
        const fillLight = new THREE.PointLight(0x88aaff, 0.3);
        fillLight.position.set(0, -3, 0);
        scene3D.add(fillLight);
        
        // Back rim light for edge definition
        const rimLight = new THREE.PointLight(0xffaa66, 0.5);
        rimLight.position.set(-2, 1, -3);
        scene3D.add(rimLight);
        
        // Warm fill from side
        const warmFill = new THREE.PointLight(0xffaa88, 0.4);
        warmFill.position.set(3, 2, 2);
        scene3D.add(warmFill);
        
        // Add helper grid with enhanced visibility
        const gridHelper = new THREE.GridHelper(14, 30, 0x6699cc, 0xaaccff);
        gridHelper.position.y = -0.01;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.6;
        scene3D.add(gridHelper);
        
        // Add a subtle ground plane shadow catcher
        const groundPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 12),
            new THREE.ShadowMaterial({ opacity: 0.3, color: 0x000000, transparent: true, side: THREE.DoubleSide })
        );
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.position.y = -0.02;
        groundPlane.receiveShadow = true;
        scene3D.add(groundPlane);
        
        // Enhanced Axes Helper with thicker lines
        const axesHelper = new THREE.AxesHelper(6.5);
        scene3D.add(axesHelper);
        
        // Add colored axis lines manually for better visibility
        const xAxisLineMat = new THREE.LineBasicMaterial({ color: 0xe67e22 });
        const xAxisPoints = [];
        for (let x = -6; x <= 6; x += 0.1) xAxisPoints.push(new THREE.Vector3(x, 0, 0));
        const xAxisGeo = new THREE.BufferGeometry().setFromPoints(xAxisPoints);
        const xAxisLine = new THREE.Line(xAxisGeo, xAxisLineMat);
        scene3D.add(xAxisLine);
        
        const yAxisLineMat = new THREE.LineBasicMaterial({ color: 0xe67e22 });
        const yAxisPoints = [];
        for (let y = -6; y <= 6; y += 0.1) yAxisPoints.push(new THREE.Vector3(0, y, 0));
        const yAxisGeo = new THREE.BufferGeometry().setFromPoints(yAxisPoints);
        const yAxisLine = new THREE.Line(yAxisGeo, yAxisLineMat);
        scene3D.add(yAxisLine);
        
        const zAxisLineMat = new THREE.LineBasicMaterial({ color: 0xe67e22 });
        const zAxisPoints = [];
        for (let z = -6; z <= 6; z += 0.1) zAxisPoints.push(new THREE.Vector3(0, 0, z));
        const zAxisGeo = new THREE.BufferGeometry().setFromPoints(zAxisPoints);
        const zAxisLine = new THREE.Line(zAxisGeo, zAxisLineMat);
        scene3D.add(zAxisLine);
        
        // Add coordinate labels with HD styling
        addHDCoordinateLabels();
        
        // Add number line labels
        addNumberLineLabels();
        
        // Add zoom control buttons
        addZoomControlButtons(container);
        
        // Start animation loop with smooth rendering
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            if (controls3D) controls3D.update();
            if (renderer3D && scene3D && camera3D) {
                renderer3D.render(scene3D, camera3D);
            }
        }
        animate();
        
        current3DSceneInitialized = true;
        console.log('3D scene initialized successfully (HD Enhanced)');
        return true;
        
    } catch (error) {
        console.error('Error initializing 3D scene:', error);
        return false;
    }
}

/**
 * Adds HD coordinate axis labels with better styling
 */
function addHDCoordinateLabels() {
    if (!scene3D || !THREE) return;
    
    function createStyledLabel(message, color, size, position) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = size;
        
        ctx.font = `Bold ${fontSize}px "Segoe UI", "Arial"`;
        const textWidth = ctx.measureText(message).width;
        
        canvas.width = textWidth + 24;
        canvas.height = fontSize + 24;
        
        // Draw background glow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = `Bold ${fontSize}px "Segoe UI", "Arial"`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add shadow for depth
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fillText(message, canvas.width/2, canvas.height/2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.7, 0.4, 0.7);
        sprite.position.set(position.x, position.y, position.z);
        scene3D.add(sprite);
    }
    
    // X-axis label with glow
    createStyledLabel('X', '#e67e22', 28, { x: 6.2, y: -0.4, z: -0.4 });
    createStyledLabel('+X', '#e67e22', 16, { x: 5, y: -0.5, z: -0.5 });
    createStyledLabel('-X', '#e67e22', 16, { x: -5.5, y: -0.5, z: -0.5 });
    
    // Y-axis label
    createStyledLabel('Y', '#e67e22', 28, { x: -0.4, y: 6.2, z: -0.4 });
    createStyledLabel('+Y', '#e67e22', 16, { x: -0.5, y: 5, z: -0.5 });
    createStyledLabel('-Y', '#e67e22', 16, { x: -0.5, y: -5.5, z: -0.5 });
    
    // Z-axis label
    createStyledLabel('Z', '#e67e22', 28, { x: -0.4, y: -0.4, z: 6.2 });
    createStyledLabel('+Z', '#e67e22', 16, { x: -0.5, y: -0.5, z: 5 });
    createStyledLabel('-Z', '#e67e22', 16, { x: -0.5, y: -0.5, z: -5.5 });
    
    // Origin label
    createStyledLabel('O (0,0,0)', '#2c3e50', 20, { x: -0.6, y: -0.6, z: -0.6 });
}

/**
 * Clears all 3D objects from the scene except axes and grid
 */
function clear3DObjects() {
    if (!scene3D) return;
    
    const toRemove = [];
    scene3D.children.forEach(child => {
        // Keep axes helper, grid helper, and sprites (labels), lights, and axis lines
        if (child instanceof THREE.AxesHelper) return;
        if (child instanceof THREE.GridHelper) return;
        if (child instanceof THREE.Sprite) return;
        if (child instanceof THREE.AmbientLight) return;
        if (child instanceof THREE.DirectionalLight) return;
        if (child instanceof THREE.PointLight) return;
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShadowMaterial) return;
        // Keep the custom axis lines we added
        if (child.isLine && child.material && child.material.color && 
            (child.material.color.getHex() === 0xe67e22)) return;
        toRemove.push(child);
    });
    toRemove.forEach(child => scene3D.remove(child));
    current3DPoints = [];
    current3DLines = [];
}

/**
 * Adds a point to the 3D scene with enhanced visual quality
 */
function add3DPoint(x, y, z, color = '#d44c2f', label = '', size = 0.22) {
    if (!scene3D || !THREE) return null;
    
    const geometry = new THREE.SphereGeometry(size, 48, 48);
    const material = new THREE.MeshStandardMaterial({ 
        color: color, 
        roughness: 0.25, 
        metalness: 0.4,
        emissive: color,
        emissiveIntensity: 0.15,
        flatShading: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene3D.add(sphere);
    
    current3DPoints.push({ x, y, z, color, label });
    
    // Add label if provided with enhanced styling
    if (label) {
        addHDTextLabel(label, x, y + 0.35, z, color);
    }
    
    return sphere;
}

/**
 * Adds HD text label in 3D space
 */
function addHDTextLabel(text, x, y, z, color = '#2c3e50') {
    if (!scene3D || !THREE) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    
    // Clear with transparent
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(30, 40, 50, 0.7)';
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = color;
    ctx.font = 'Bold 26px "Segoe UI", "Arial"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(text, canvas.width/2, canvas.height/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.4, 0.7, 1.4);
    sprite.position.set(x, y, z);
    scene3D.add(sprite);
}

// Helper for rounded rectangles
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x+r, y);
    this.lineTo(x+w-r, y);
    this.quadraticCurveTo(x+w, y, x+w, y+r);
    this.lineTo(x+w, y+h-r);
    this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.lineTo(x+r, y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-r);
    this.lineTo(x, y+r);
    this.quadraticCurveTo(x, y, x+r, y);
    return this;
};

/**
 * Adds a line segment to the 3D scene with enhanced visuals
 */
function add3DLine(from, to, color = '#2c3e50', linewidth = 2, dashPattern = null) {
    if (!scene3D || !THREE) return null;
    
    const points = [
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(to.x, to.y, to.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: linewidth });
    const line = new THREE.Line(geometry, material);
    scene3D.add(line);
    return line;
}

/**
 * Adds a vector (arrow) to the 3D scene with enhanced visuals
 */
function add3DArrow(origin, direction, color = '#d44c2f', length = 1) {
    if (!scene3D || !THREE) return;
    
    const dir = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
    const originVec = new THREE.Vector3(origin.x, origin.y, origin.z);
    
    const arrowHelper = new THREE.ArrowHelper(dir, originVec, length, color, 0.4, 0.25);
    scene3D.add(arrowHelper);
    return arrowHelper;
}

/**
 * Resizes the 3D renderer when container size changes
 */
function resize3DRenderer() {
    const container = document.getElementById('threeDGraph');
    if (container && renderer3D && camera3D) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
            renderer3D.setSize(width, height);
            camera3D.aspect = width / height;
            camera3D.updateProjectionMatrix();
        }
    }
}

// Number formatting helper
function fmt(n) {
    if (n === undefined || n === null) return '0';
    return Math.round(n * 10000) / 10000;
}

// Expose functions globally
window.init3DScene = init3DScene;
window.clear3DObjects = clear3DObjects;
window.add3DPoint = add3DPoint;
window.add3DLine = add3DLine;
window.add3DArrow = add3DArrow;
window.resize3DRenderer = resize3DRenderer;
window.add3DTextLabel = addHDTextLabel;
window.fmt = fmt;
window.loadThreeJS = loadThreeJS;
window.THREE = null;  // Will be set when loaded



// ============================================
// RENDER FUNCTIONS FOR EACH 3D GEOMETRY CARD
// ============================================

/**
 * Renders the 3D Coordinate System Intro Card
 */
function render3DCoordsCard() {
    console.log('render3DCoordsCard called');
    // Deactivate all other buttons
    const distanceBtn = document.getElementById('distanceBtn');
    const sectionBtn = document.getElementById('sectionBtn');
    const midpointBtn = document.getElementById('midpointBtn');
    const centroidBtn = document.getElementById('centroidBtn');
    const areaBtn = document.getElementById('areaBtn');
    const collinearBtn = document.getElementById('collinearBtn');
    const pointLineBtn = document.getElementById('pointLineBtn');
    const parallelLinesBtn = document.getElementById('parallelLinesBtn');
    const slopeBtn = document.getElementById('slopeBtn');
    
    if(distanceBtn) distanceBtn.classList.remove('active-btn');
    if(sectionBtn) sectionBtn.classList.remove('active-btn');
    if(midpointBtn) midpointBtn.classList.remove('active-btn');
    if(centroidBtn) centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    const threeDCoordsBtn = document.getElementById('threeDCoordsBtn');
    if (threeDCoordsBtn) threeDCoordsBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>🌐</span> 3D Coordinate System (Intro)</h2>
        
        <div class="formula-badge">
            \\( \\text{Point in 3D space: } P(x, y, z) \\)
        </div>
        <div class="formula-badge" style="background: #fff3cd;">
            \\( \\text{Three mutually perpendicular axes: X (right), Y (up), Z (forward)} \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box" style="flex:1;">
                <label>Point Coordinates</label>
                <div class="coord-input"><span>x =</span><input type="number" id="coord3Dx" value="2" step="any"></div>
                <div class="coord-input"><span>y =</span><input type="number" id="coord3Dy" value="3" step="any"></div>
                <div class="coord-input"><span>z =</span><input type="number" id="coord3Dz" value="2" step="any"></div>
                <div style="font-size:0.85rem; margin-top:8px;">Range: -5 to 5</div>
            </div>
            
            <div class="point-box" style="flex:1;">
                <label>Point Information</label>
                <div id="pointInfo3D" style="font-size: 1rem; text-align: center; padding: 10px;">
                    <div>📍 Point P: (2, 3, 2)</div>
                    <div>📏 Distance from origin: 4.1231</div>
                    <div>📐 Direction from origin: (0.485, 0.728, 0.485)</div>
                </div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="compute3DCoordsBtn">
            <span>🌐</span> Update Point
        </button>
        
        <div class="result-highlight" id="coords3DResult">
            \\( P(2, 3, 2) \\)
        </div>
        <div class="footnote">
            <strong>3D Cartesian Coordinates:</strong> Three perpendicular axes (X, Y, Z).<br>
            • X-axis: positive to the right, negative to the left<br>
            • Y-axis: positive upward, negative downward<br>
            • Z-axis: positive forward (out of screen), negative backward<br>
            • Distance from origin: \\( d = \\sqrt{x^2 + y^2 + z^2} \\)
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    // Render LaTeX if available
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    // Wait for DOM to be ready before initializing Three.js
    setTimeout(() => {
        console.log('Initializing 3D scene...');
        
        // Get input references
        const xInp = document.getElementById('coord3Dx');
        const yInp = document.getElementById('coord3Dy');
        const zInp = document.getElementById('coord3Dz');
        const compute = document.getElementById('compute3DCoordsBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('coords3DResult');
        const pointInfo = document.getElementById('pointInfo3D');
        
        // Initialize 3D scene
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        function update() {
            try {
                const x = parseFloat(xInp.value);
                const y = parseFloat(yInp.value);
                const z = parseFloat(zInp.value);
                
                if (isNaN(x) || isNaN(y) || isNaN(z)) {
                    throw new Error('Please enter valid numbers');
                }
                
                // Clear previous points
                clear3DObjects();
                
                // Add the point
                add3DPoint(x, y, z, '#d44c2f', `P(${fmt(x)},${fmt(y)},${fmt(z)})`, 0.25);
                
                // Add projection lines to coordinate planes
                add3DLine({x: x, y: y, z: z}, {x: x, y: y, z: 0}, '#888888');
                add3DLine({x: x, y: y, z: z}, {x: x, y: 0, z: z}, '#888888');
                add3DLine({x: x, y: y, z: z}, {x: 0, y: y, z: z}, '#888888');
                
                // Add projections on coordinate planes
                add3DPoint(x, y, 0, '#2b5797', `(x,y,0)`, 0.12);
                add3DPoint(x, 0, z, '#2b5797', `(x,0,z)`, 0.12);
                add3DPoint(0, y, z, '#2b5797', `(0,y,z)`, 0.12);
                
                // Add coordinate axes indicators
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Calculate distance from origin
                const distance = Math.sqrt(x*x + y*y + z*z);
                
                // Calculate direction cosines
                const dirX = x / distance;
                const dirY = y / distance;
                const dirZ = z / distance;
                
                // Update point info
                pointInfo.innerHTML = `
                    <div><strong>📍 Point P:</strong> (${fmt(x)}, ${fmt(y)}, ${fmt(z)})</div>
                    <div><strong>📏 Distance from origin:</strong> ${fmt(distance)}</div>
                    <div><strong>📐 Direction cosines:</strong> (${fmt(dirX)}, ${fmt(dirY)}, ${fmt(dirZ)})</div>
                    <div><strong>📊 Projections:</strong> XY-plane: (${fmt(x)}, ${fmt(y)}, 0)<br>
                         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;XZ-plane: (${fmt(x)}, 0, ${fmt(z)})<br>
                         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;YZ-plane: (0, ${fmt(y)}, ${fmt(z)})</div>
                `;
                
                // Generate steps
                const steps = [
                    `① Understanding 3D coordinates`,
                    `   • Point P(${fmt(x)}, ${fmt(y)}, ${fmt(z)}) in 3D space`,
                    `   • X-coordinate = ${fmt(x)} → ${x >= 0 ? 'right' : 'left'} of origin`,
                    `   • Y-coordinate = ${fmt(y)} → ${y >= 0 ? 'up' : 'down'} from origin`,
                    `   • Z-coordinate = ${fmt(z)} → ${z >= 0 ? 'forward' : 'backward'} from origin`,
                    
                    `② Distance from origin`,
                    `   • Using formula: d = √(x² + y² + z²)`,
                    `   • d = √(${fmt(x*x)} + ${fmt(y*y)} + ${fmt(z*z)})`,
                    `   • d = √${fmt(x*x + y*y + z*z)} = ${fmt(distance)}`,
                    
                    `③ Direction Cosines`,
                    `   • cos α = x/d = ${fmt(x)}/${fmt(distance)} = ${fmt(dirX)}`,
                    `   • cos β = y/d = ${fmt(y)}/${fmt(distance)} = ${fmt(dirY)}`,
                    `   • cos γ = z/d = ${fmt(z)}/${fmt(distance)} = ${fmt(dirZ)}`,
                    `   • Check: cos²α + cos²β + cos²γ = ${fmt(dirX*dirX + dirY*dirY + dirZ*dirZ)} = 1`,
                    
                    `④ Projections on Coordinate Planes`,
                    `   • XY-plane (z=0): (${fmt(x)}, ${fmt(y)}, 0)`,
                    `   • XZ-plane (y=0): (${fmt(x)}, 0, ${fmt(z)})`,
                    `   • YZ-plane (x=0): (0, ${fmt(y)}, ${fmt(z)})`
                ];
                
                if (stepsDiv) {
                    stepsDiv.innerHTML = steps.map((txt, i) => 
                        `<div class="step-row">
                            <span class="step-marker">${i+1}</span>
                            <span class="step-text" style="white-space: pre-line;">${txt}</span>
                        </div>`
                    ).join('');
                }
                
                if (resultDiv) {
                    resultDiv.innerHTML = `\\( P(${fmt(x)}, ${fmt(y)}, ${fmt(z)}) \\)<br>\\( d = ${fmt(distance)} \\)`;
                }
                
                // Re-render LaTeX
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                // Attach steps toggle
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error updating 3D point:', e);
            }
        }
        
        if (compute) compute.addEventListener('click', update);
        if (xInp) xInp.addEventListener('keypress', e => e.key === 'Enter' && update());
        if (yInp) yInp.addEventListener('keypress', e => e.key === 'Enter' && update());
        if (zInp) zInp.addEventListener('keypress', e => e.key === 'Enter' && update());
        
        update();
    }, 100);
}

/**
 * Renders the Direction Ratios and Direction Cosines Card
 */
function renderDirectionRatiosCard() {
    // Deactivate all other buttons
    const distanceBtn = document.getElementById('distanceBtn');
    const sectionBtn = document.getElementById('sectionBtn');
    const midpointBtn = document.getElementById('midpointBtn');
    const centroidBtn = document.getElementById('centroidBtn');
    const areaBtn = document.getElementById('areaBtn');
    const collinearBtn = document.getElementById('collinearBtn');
    const pointLineBtn = document.getElementById('pointLineBtn');
    const parallelLinesBtn = document.getElementById('parallelLinesBtn');
    const slopeBtn = document.getElementById('slopeBtn');
    
    if(distanceBtn) distanceBtn.classList.remove('active-btn');
    if(sectionBtn) sectionBtn.classList.remove('active-btn');
    if(midpointBtn) midpointBtn.classList.remove('active-btn');
    if(centroidBtn) centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    const directionRatiosBtn = document.getElementById('directionRatiosBtn');
    if (directionRatiosBtn) directionRatiosBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>📐</span> Direction Ratios & Direction Cosines</h2>
        
        <div class="formula-badge">
            \\( \\text{For a line through points } A(x_1,y_1,z_1) \\text{ and } B(x_2,y_2,z_2) \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Direction Ratios: } a = x_2-x_1, b = y_2-y_1, c = z_2-z_1 \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Direction Cosines: } l = \\frac{a}{\\sqrt{a^2+b^2+c^2}}, m = \\frac{b}{\\sqrt{a^2+b^2+c^2}}, n = \\frac{c}{\\sqrt{a^2+b^2+c^2}} \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box">
                <label>Point A</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="drAx" value="1" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="drAy" value="2" step="any"></div>
                <div class="coord-input"><span>z₁ =</span><input type="number" id="drAz" value="1" step="any"></div>
            </div>
            <div class="point-box">
                <label>Point B</label>
                <div class="coord-input"><span>x₂ =</span><input type="number" id="drBx" value="4" step="any"></div>
                <div class="coord-input"><span>y₂ =</span><input type="number" id="drBy" value="5" step="any"></div>
                <div class="coord-input"><span>z₂ =</span><input type="number" id="drBz" value="3" step="any"></div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeDRBtn">
            <span>📐</span> Calculate Direction Ratios & Cosines
        </button>
        
        <div class="result-highlight" id="drResult">
            \\( \\text{DR: } (3, 3, 2), \\text{ DC: } (0.640, 0.640, 0.427) \\)
        </div>
        <div class="footnote">
            <strong>Direction Ratios (DR):</strong> Proportional numbers indicating the direction of a line.<br>
            <strong>Direction Cosines (DC):</strong> Cosines of angles made with X, Y, Z axes: l² + m² + n² = 1
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        const ax = document.getElementById('drAx');
        const ay = document.getElementById('drAy');
        const az = document.getElementById('drAz');
        const bx = document.getElementById('drBx');
        const by = document.getElementById('drBy');
        const bz = document.getElementById('drBz');
        const compute = document.getElementById('computeDRBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('drResult');
        
        function update() {
            try {
                const x1 = parseFloat(ax.value);
                const y1 = parseFloat(ay.value);
                const z1 = parseFloat(az.value);
                const x2 = parseFloat(bx.value);
                const y2 = parseFloat(by.value);
                const z2 = parseFloat(bz.value);
                
                if (isNaN(x1) || isNaN(y1) || isNaN(z1) || isNaN(x2) || isNaN(y2) || isNaN(z2)) {
                    throw new Error('Please enter valid numbers');
                }
                
                // Direction ratios
                const drX = x2 - x1;
                const drY = y2 - y1;
                const drZ = z2 - z1;
                
                // Magnitude
                const mag = Math.sqrt(drX*drX + drY*drY + drZ*drZ);
                
                // Direction cosines
                const l = drX / mag;
                const m = drY / mag;
                const n = drZ / mag;
                
                // Clear previous objects
                clear3DObjects();
                
                // Add points A and B
                add3DPoint(x1, y1, z1, '#d44c2f', `A(${fmt(x1)},${fmt(y1)},${fmt(z1)})`, 0.2);
                add3DPoint(x2, y2, z2, '#1f7f6a', `B(${fmt(x2)},${fmt(y2)},${fmt(z2)})`, 0.2);
                
                // Add line AB
                add3DLine({x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}, '#2c3e50', 3);
                
                // Add vector arrow from A to B
                add3DArrow({x: x1, y: y1, z: z1}, {x: drX, y: drY, z: drZ}, '#d44c2f', mag);
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Points in 3D space`,
                    `   • A(${fmt(x1)}, ${fmt(y1)}, ${fmt(z1)})`,
                    `   • B(${fmt(x2)}, ${fmt(y2)}, ${fmt(z2)})`,
                    
                    `② Direction Ratios (DR)`,
                    `   • a = x₂ - x₁ = ${fmt(x2)} - ${fmt(x1)} = ${fmt(drX)}`,
                    `   • b = y₂ - y₁ = ${fmt(y2)} - ${fmt(y1)} = ${fmt(drY)}`,
                    `   • c = z₂ - z₁ = ${fmt(z2)} - ${fmt(z1)} = ${fmt(drZ)}`,
                    `   • Direction Ratios = (${fmt(drX)}, ${fmt(drY)}, ${fmt(drZ)})`,
                    
                    `③ Magnitude of direction vector`,
                    `   • |AB| = √(a² + b² + c²)`,
                    `   • = √(${fmt(drX*drX)} + ${fmt(drY*drY)} + ${fmt(drZ*drZ)})`,
                    `   • = √${fmt(drX*drX + drY*drY + drZ*drZ)} = ${fmt(mag)}`,
                    
                    `④ Direction Cosines (DC)`,
                    `   • l = a/|AB| = ${fmt(drX)}/${fmt(mag)} = ${fmt(l)}`,
                    `   • m = b/|AB| = ${fmt(drY)}/${fmt(mag)} = ${fmt(m)}`,
                    `   • n = c/|AB| = ${fmt(drZ)}/${fmt(mag)} = ${fmt(n)}`,
                    `   • Direction Cosines = (${fmt(l)}, ${fmt(m)}, ${fmt(n)})`,
                    
                    `⑤ Verification`,
                    `   • l² + m² + n² = ${fmt(l*l)} + ${fmt(m*m)} + ${fmt(n*n)} = ${fmt(l*l + m*m + n*n)} ≈ 1`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\text{DR: } (${fmt(drX)}, ${fmt(drY)}, ${fmt(drZ)}) \\)<br>\\( \\text{DC: } (${fmt(l)}, ${fmt(m)}, ${fmt(n)}) \\)<br>\\( |AB| = ${fmt(mag)} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [ax, ay, az, bx, by, bz].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
        else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
    }, 100);
}

/**
 * Renders the Equation of Line in 3D: Symmetric Form Card
 */
function renderLineSymmetricFormCard() {
    // Deactivate all other buttons
    const distanceBtn = document.getElementById('distanceBtn');
    const sectionBtn = document.getElementById('sectionBtn');
    const midpointBtn = document.getElementById('midpointBtn');
    const centroidBtn = document.getElementById('centroidBtn');
    const areaBtn = document.getElementById('areaBtn');
    const collinearBtn = document.getElementById('collinearBtn');
    const pointLineBtn = document.getElementById('pointLineBtn');
    const parallelLinesBtn = document.getElementById('parallelLinesBtn');
    const slopeBtn = document.getElementById('slopeBtn');
    
    if(distanceBtn) distanceBtn.classList.remove('active-btn');
    if(sectionBtn) sectionBtn.classList.remove('active-btn');
    if(midpointBtn) midpointBtn.classList.remove('active-btn');
    if(centroidBtn) centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    const lineSymmetricFormBtn = document.getElementById('lineSymmetricFormBtn');
    if (lineSymmetricFormBtn) lineSymmetricFormBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>📏</span> Equation of Line in 3D: Symmetric Form</h2>
        
        <div class="formula-badge">
            \\( \\text{Line through } P(x_1,y_1,z_1) \\text{ with direction ratios } a,b,c \\)
        </div>
        <div class="formula-badge">
            \\( \\frac{x - x_1}{a} = \\frac{y - y_1}{b} = \\frac{z - z_1}{c} \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box">
                <label>Point on line</label>
                <div class="coord-input"><span>x₁ =</span><input type="number" id="symPx" value="1" step="any"></div>
                <div class="coord-input"><span>y₁ =</span><input type="number" id="symPy" value="2" step="any"></div>
                <div class="coord-input"><span>z₁ =</span><input type="number" id="symPz" value="1" step="any"></div>
            </div>
            <div class="point-box">
                <label>Direction Ratios</label>
                <div class="coord-input"><span>a =</span><input type="number" id="symA" value="2" step="any"></div>
                <div class="coord-input"><span>b =</span><input type="number" id="symB" value="3" step="any"></div>
                <div class="coord-input"><span>c =</span><input type="number" id="symC" value="1" step="any"></div>
                <div style="font-size:0.85rem; margin-top:5px;">Direction ratios determine line orientation</div>
            </div>
        </div>
        
        <div class="input-group" style="justify-content:center; margin-top:0;">
            <div class="point-box">
                <label>Parameter t (optional)</label>
                <div class="coord-input"><span>t =</span><input type="number" id="symT" value="1" step="any"></div>
                <div style="font-size:0.85rem;">Find point at parameter t</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSymmetricBtn">
            <span>📏</span> Show Line & Calculate
        </button>
        
        <div class="result-highlight" id="symmetricResult">
            \\( \\frac{x-1}{2} = \\frac{y-2}{3} = \\frac{z-1}{1} \\)
        </div>
        <div class="footnote">
            <strong>Symmetric Form:</strong> Parametric form: x = x₁ + at, y = y₁ + bt, z = z₁ + ct<br>
            t is a real parameter. Each value of t gives a point on the line.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        const px = document.getElementById('symPx');
        const py = document.getElementById('symPy');
        const pz = document.getElementById('symPz');
        const aInp = document.getElementById('symA');
        const bInp = document.getElementById('symB');
        const cInp = document.getElementById('symC');
        const tInp = document.getElementById('symT');
        const compute = document.getElementById('computeSymmetricBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('symmetricResult');
        
        function update() {
            try {
                const x1 = parseFloat(px.value);
                const y1 = parseFloat(py.value);
                const z1 = parseFloat(pz.value);
                const a = parseFloat(aInp.value);
                const b = parseFloat(bInp.value);
                const c = parseFloat(cInp.value);
                
                if (isNaN(x1) || isNaN(y1) || isNaN(z1) || isNaN(a) || isNaN(b) || isNaN(c)) {
                    throw new Error('Please enter valid numbers');
                }
                
                if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10 && Math.abs(c) < 1e-10) {
                    throw new Error('Direction ratios cannot all be zero');
                }
                
                let t = null;
                try {
                    t = parseFloat(tInp.value);
                    if (isNaN(t)) t = null;
                } catch (e) {}
                
                // Clear previous objects
                clear3DObjects();
                
                // Add the fixed point P
                add3DPoint(x1, y1, z1, '#d44c2f', `P(${fmt(x1)},${fmt(y1)},${fmt(z1)})`, 0.25);
                
                // Generate points along the line for visualization
                const linePoints = [];
                const stepSize = 0.3;
                const numSteps = 20;
                
                for (let step = -numSteps/2; step <= numSteps/2; step += stepSize) {
                    const x = x1 + a * step;
                    const y = y1 + b * step;
                    const z = z1 + c * step;
                    if (Math.abs(x) < 12 && Math.abs(y) < 12 && Math.abs(z) < 12) {
                        if (window.THREE) {
                            linePoints.push(new THREE.Vector3(x, y, z));
                        }
                    }
                }
                
                if (linePoints.length >= 2 && window.THREE) {
                    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
                    const material = new THREE.LineBasicMaterial({ color: '#2c3e50', linewidth: 2 });
                    const line = new THREE.Line(geometry, material);
                    scene3D.add(line);
                    current3DLines.push(line);
                }
                
                // Add direction vector arrow
                const dirMag = Math.sqrt(a*a + b*b + c*c);
                if (dirMag > 0.1) {
                    const dirUnit = { x: a/dirMag, y: b/dirMag, z: c/dirMag };
                    add3DArrow({x: x1, y: y1, z: z1}, dirUnit, '#1f7f6a', 2);
                }
                
                // Add point at parameter t if provided
                let pointAtT = null;
                if (t !== null) {
                    const xt = x1 + a * t;
                    const yt = y1 + b * t;
                    const zt = z1 + c * t;
                    pointAtT = { x: xt, y: yt, z: zt };
                    add3DPoint(xt, yt, zt, '#ca8a04', `t=${fmt(t)}`, 0.2);
                }
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const symmetricEq = `\\frac{x - ${fmt(x1)}}{${fmt(a)}} = \\frac{y - ${fmt(y1)}}{${fmt(b)}} = \\frac{z - ${fmt(z1)}}{${fmt(c)}}`;
                
                let steps = [
                    `① Point on line`,
                    `   • P(${fmt(x1)}, ${fmt(y1)}, ${fmt(z1)})`,
                    
                    `② Direction ratios`,
                    `   • (a, b, c) = (${fmt(a)}, ${fmt(b)}, ${fmt(c)})`,
                    
                    `③ Symmetric form equation`,
                    `   • ${symmetricEq}`,
                    
                    `④ Parametric form`,
                    `   • x = ${fmt(x1)} + ${fmt(a)}t`,
                    `   • y = ${fmt(y1)} + ${fmt(b)}t`,
                    `   • z = ${fmt(z1)} + ${fmt(c)}t`
                ];
                
                if (pointAtT) {
                    steps.push(
                        `⑤ Point at t = ${fmt(t)}`,
                        `   • x = ${fmt(x1)} + ${fmt(a)}·${fmt(t)} = ${fmt(x1 + a*t)}`,
                        `   • y = ${fmt(y1)} + ${fmt(b)}·${fmt(t)} = ${fmt(y1 + b*t)}`,
                        `   • z = ${fmt(z1)} + ${fmt(c)}·${fmt(t)} = ${fmt(z1 + c*t)}`,
                        `   • Q = (${fmt(pointAtT.x)}, ${fmt(pointAtT.y)}, ${fmt(pointAtT.z)})`
                    );
                }
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( ${symmetricEq} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [px, py, pz, aInp, bInp, cInp, tInp].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
        else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
    }, 100);
}

/**
 * Renders the Equation of Line in 3D: Vector Form Card
 */
function renderLineVectorFormCard() {
    // Deactivate all other buttons
    const distanceBtn = document.getElementById('distanceBtn');
    const sectionBtn = document.getElementById('sectionBtn');
    const midpointBtn = document.getElementById('midpointBtn');
    const centroidBtn = document.getElementById('centroidBtn');
    const areaBtn = document.getElementById('areaBtn');
    const collinearBtn = document.getElementById('collinearBtn');
    const pointLineBtn = document.getElementById('pointLineBtn');
    const parallelLinesBtn = document.getElementById('parallelLinesBtn');
    const slopeBtn = document.getElementById('slopeBtn');
    
    if(distanceBtn) distanceBtn.classList.remove('active-btn');
    if(sectionBtn) sectionBtn.classList.remove('active-btn');
    if(midpointBtn) midpointBtn.classList.remove('active-btn');
    if(centroidBtn) centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    const lineVectorFormBtn = document.getElementById('lineVectorFormBtn');
    if (lineVectorFormBtn) lineVectorFormBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>➡️</span> Equation of Line in 3D: Vector Form</h2>
        
        <div class="formula-badge">
            \\( \\vec{r} = \\vec{a} + \\lambda \\vec{b} \\)
        </div>
        <div class="formula-badge">
            \\( \\vec{a} = \\text{position vector of a point on line}, \\quad \\vec{b} = \\text{direction vector} \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box">
                <label>Point on line: \\(\\vec{a}\\)</label>
                <div class="coord-input"><span>a₁ =</span><input type="number" id="vecAx" value="1" step="any"></div>
                <div class="coord-input"><span>a₂ =</span><input type="number" id="vecAy" value="2" step="any"></div>
                <div class="coord-input"><span>a₃ =</span><input type="number" id="vecAz" value="1" step="any"></div>
            </div>
            <div class="point-box">
                <label>Direction vector: \\(\\vec{b}\\)</label>
                <div class="coord-input"><span>b₁ =</span><input type="number" id="vecBx" value="2" step="any"></div>
                <div class="coord-input"><span>b₂ =</span><input type="number" id="vecBy" value="3" step="any"></div>
                <div class="coord-input"><span>b₃ =</span><input type="number" id="vecBz" value="1" step="any"></div>
            </div>
        </div>
        
        <div class="input-group" style="justify-content:center; margin-top:0;">
            <div class="point-box">
                <label>Parameter λ (optional)</label>
                <div class="coord-input"><span>λ =</span><input type="number" id="vecLambda" value="1" step="any"></div>
                <div style="font-size:0.85rem;">Find point at parameter λ</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeVectorBtn">
            <span>➡️</span> Show Line & Calculate
        </button>
        
        <div class="result-highlight" id="vectorResult">
            \\( \\vec{r} = \\langle 1,2,1 \\rangle + \\lambda \\langle 2,3,1 \\rangle \\)
        </div>
        <div class="footnote">
            <strong>Vector Form:</strong> \\(\\vec{r} = \\vec{a} + \\lambda\\vec{b}\\)<br>
            λ is a real parameter. Each λ gives a point on the line.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        const ax = document.getElementById('vecAx');
        const ay = document.getElementById('vecAy');
        const az = document.getElementById('vecAz');
        const bx = document.getElementById('vecBx');
        const by = document.getElementById('vecBy');
        const bz = document.getElementById('vecBz');
        const lambdaInp = document.getElementById('vecLambda');
        const compute = document.getElementById('computeVectorBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('vectorResult');
        
        function update() {
            try {
                const a1 = parseFloat(ax.value);
                const a2 = parseFloat(ay.value);
                const a3 = parseFloat(az.value);
                const b1 = parseFloat(bx.value);
                const b2 = parseFloat(by.value);
                const b3 = parseFloat(bz.value);
                
                if (isNaN(a1) || isNaN(a2) || isNaN(a3) || isNaN(b1) || isNaN(b2) || isNaN(b3)) {
                    throw new Error('Please enter valid numbers');
                }
                
                if (Math.abs(b1) < 1e-10 && Math.abs(b2) < 1e-10 && Math.abs(b3) < 1e-10) {
                    throw new Error('Direction vector cannot be zero');
                }
                
                let lambda = null;
                try {
                    lambda = parseFloat(lambdaInp.value);
                    if (isNaN(lambda)) lambda = null;
                } catch (e) {}
                
                // Clear previous objects
                clear3DObjects();
                
                // Add the fixed point A (position vector a)
                add3DPoint(a1, a2, a3, '#d44c2f', `A(${fmt(a1)},${fmt(a2)},${fmt(a3)})`, 0.25);
                
                // Generate points along the line
                const linePoints = [];
                const stepSize = 0.3;
                const numSteps = 20;
                
                for (let step = -numSteps/2; step <= numSteps/2; step += stepSize) {
                    const x = a1 + b1 * step;
                    const y = a2 + b2 * step;
                    const z = a3 + b3 * step;
                    if (Math.abs(x) < 12 && Math.abs(y) < 12 && Math.abs(z) < 12) {
                        if (window.THREE) {
                            linePoints.push(new THREE.Vector3(x, y, z));
                        }
                    }
                }
                
                if (linePoints.length >= 2 && window.THREE) {
                    const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
                    const material = new THREE.LineBasicMaterial({ color: '#2c3e50', linewidth: 2 });
                    const line = new THREE.Line(geometry, material);
                    scene3D.add(line);
                    current3DLines.push(line);
                }
                
                // Add direction vector arrow from point A
                const dirMag = Math.sqrt(b1*b1 + b2*b2 + b3*b3);
                if (dirMag > 0.1) {
                    const dirUnit = { x: b1/dirMag, y: b2/dirMag, z: b3/dirMag };
                    add3DArrow({x: a1, y: a2, z: a3}, dirUnit, '#1f7f6a', 2);
                }
                
                // Add point at parameter λ if provided
                let pointAtLambda = null;
                if (lambda !== null) {
                    const xλ = a1 + b1 * lambda;
                    const yλ = a2 + b2 * lambda;
                    const zλ = a3 + b3 * lambda;
                    pointAtLambda = { x: xλ, y: yλ, z: zλ };
                    add3DPoint(xλ, yλ, zλ, '#ca8a04', `λ=${fmt(lambda)}`, 0.2);
                }
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const vectorEq = `\\vec{r} = \\langle ${fmt(a1)}, ${fmt(a2)}, ${fmt(a3)} \\rangle + \\lambda \\langle ${fmt(b1)}, ${fmt(b2)}, ${fmt(b3)} \\rangle`;
                
                let steps = [
                    `① Position vector of point on line`,
                    `   • \\(\\vec{a} = \\langle ${fmt(a1)}, ${fmt(a2)}, ${fmt(a3)} \\rangle\\)`,
                    
                    `② Direction vector`,
                    `   • \\(\\vec{b} = \\langle ${fmt(b1)}, ${fmt(b2)}, ${fmt(b3)} \\rangle\\)`,
                    `   • Magnitude: \\(|\\vec{b}| = \\sqrt{${fmt(b1*b1)} + ${fmt(b2*b2)} + ${fmt(b3*b3)}} = ${fmt(dirMag)}\\)`,
                    
                    `③ Vector form equation`,
                    `   • \\(\\vec{r} = \\vec{a} + \\lambda \\vec{b}\\)`,
                    `   • ${vectorEq}`,
                    
                    `④ Parametric form`,
                    `   • x = ${fmt(a1)} + ${fmt(b1)}λ`,
                    `   • y = ${fmt(a2)} + ${fmt(b2)}λ`,
                    `   • z = ${fmt(a3)} + ${fmt(b3)}λ`
                ];
                
                if (pointAtLambda) {
                    steps.push(
                        `⑤ Point at λ = ${fmt(lambda)}`,
                        `   • x = ${fmt(a1)} + ${fmt(b1)}·${fmt(lambda)} = ${fmt(a1 + b1*lambda)}`,
                        `   • y = ${fmt(a2)} + ${fmt(b2)}·${fmt(lambda)} = ${fmt(a2 + b2*lambda)}`,
                        `   • z = ${fmt(a3)} + ${fmt(b3)}·${fmt(lambda)} = ${fmt(a3 + b3*lambda)}`,
                        `   • Q = (${fmt(pointAtLambda.x)}, ${fmt(pointAtLambda.y)}, ${fmt(pointAtLambda.z)})`
                    );
                }
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( ${vectorEq} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [ax, ay, az, bx, by, bz, lambdaInp].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
        else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
    }, 100);
}

/**
 * Renders the Angle Between Two Lines in 3D Card
 */
function renderAngleBetweenLines3DCard() {
    // Deactivate all other buttons
    const distanceBtn = document.getElementById('distanceBtn');
    const sectionBtn = document.getElementById('sectionBtn');
    const midpointBtn = document.getElementById('midpointBtn');
    const centroidBtn = document.getElementById('centroidBtn');
    const areaBtn = document.getElementById('areaBtn');
    const collinearBtn = document.getElementById('collinearBtn');
    const pointLineBtn = document.getElementById('pointLineBtn');
    const parallelLinesBtn = document.getElementById('parallelLinesBtn');
    const slopeBtn = document.getElementById('slopeBtn');
    
    if(distanceBtn) distanceBtn.classList.remove('active-btn');
    if(sectionBtn) sectionBtn.classList.remove('active-btn');
    if(midpointBtn) midpointBtn.classList.remove('active-btn');
    if(centroidBtn) centroidBtn.classList.remove('active-btn');
    if(areaBtn) areaBtn.classList.remove('active-btn');
    if(collinearBtn) collinearBtn.classList.remove('active-btn');
    if(pointLineBtn) pointLineBtn.classList.remove('active-btn');
    if(parallelLinesBtn) parallelLinesBtn.classList.remove('active-btn');
    if(slopeBtn) slopeBtn.classList.remove('active-btn');
    
    // Activate this button
    const angleBetweenLines3DBtn = document.getElementById('angleBetweenLines3DBtn');
    if (angleBetweenLines3DBtn) angleBetweenLines3DBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>📐</span> Angle Between Two Lines in 3D</h2>
        
        <div class="formula-badge">
            \\( \\cos \\theta = \\frac{|a_1 a_2 + b_1 b_2 + c_1 c_2|}{\\sqrt{a_1^2+b_1^2+c_1^2} \\cdot \\sqrt{a_2^2+b_2^2+c_2^2}} \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box">
                <label>Line 1 Direction Ratios</label>
                <div class="coord-input"><span>a₁ =</span><input type="number" id="angle1A" value="2" step="any"></div>
                <div class="coord-input"><span>b₁ =</span><input type="number" id="angle1B" value="3" step="any"></div>
                <div class="coord-input"><span>c₁ =</span><input type="number" id="angle1C" value="1" step="any"></div>
            </div>
            <div class="point-box">
                <label>Line 2 Direction Ratios</label>
                <div class="coord-input"><span>a₂ =</span><input type="number" id="angle2A" value="1" step="any"></div>
                <div class="coord-input"><span>b₂ =</span><input type="number" id="angle2B" value="-1" step="any"></div>
                <div class="coord-input"><span>c₂ =</span><input type="number" id="angle2C" value="2" step="any"></div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeAngle3DBtn">
            <span>📐</span> Calculate Angle
        </button>
        
        <div class="result-highlight" id="angle3DResult">
            \\( \\theta = 45.0° \\)
        </div>
        <div class="footnote">
            <strong>Angle between lines in 3D:</strong> If lines are parallel, angle = 0°; if perpendicular, cos θ = 0.<br>
            The formula works for lines in any orientation in 3D space.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        const a1 = document.getElementById('angle1A');
        const b1 = document.getElementById('angle1B');
        const c1 = document.getElementById('angle1C');
        const a2 = document.getElementById('angle2A');
        const b2 = document.getElementById('angle2B');
        const c2 = document.getElementById('angle2C');
        const compute = document.getElementById('computeAngle3DBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('angle3DResult');
        
        function update() {
            try {
                const dr1x = parseFloat(a1.value);
                const dr1y = parseFloat(b1.value);
                const dr1z = parseFloat(c1.value);
                const dr2x = parseFloat(a2.value);
                const dr2y = parseFloat(b2.value);
                const dr2z = parseFloat(c2.value);
                
                if (isNaN(dr1x) || isNaN(dr1y) || isNaN(dr1z) || isNaN(dr2x) || isNaN(dr2y) || isNaN(dr2z)) {
                    throw new Error('Please enter valid numbers');
                }
                
                if (Math.abs(dr1x) < 1e-10 && Math.abs(dr1y) < 1e-10 && Math.abs(dr1z) < 1e-10) {
                    throw new Error('Direction ratios for Line 1 cannot all be zero');
                }
                if (Math.abs(dr2x) < 1e-10 && Math.abs(dr2y) < 1e-10 && Math.abs(dr2z) < 1e-10) {
                    throw new Error('Direction ratios for Line 2 cannot all be zero');
                }
                
                // Dot product
                const dot = dr1x * dr2x + dr1y * dr2y + dr1z * dr2z;
                
                // Magnitudes
                const mag1 = Math.sqrt(dr1x*dr1x + dr1y*dr1y + dr1z*dr1z);
                const mag2 = Math.sqrt(dr2x*dr2x + dr2y*dr2y + dr2z*dr2z);
                
                // Cosine of angle
                const cosTheta = Math.abs(dot) / (mag1 * mag2);
                const thetaRad = Math.acos(Math.min(1, Math.max(-1, cosTheta)));
                const thetaDeg = thetaRad * 180 / Math.PI;
                
                // Check for parallel lines
                const isParallel = Math.abs(cosTheta - 1) < 1e-10;
                const isPerpendicular = Math.abs(dot) < 1e-10;
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw two lines through origin with given direction ratios
                const origin = { x: 0, y: 0, z: 0 };
                
                // Normalize direction vectors for visualization
                const dir1 = { x: dr1x / mag1, y: dr1y / mag1, z: dr1z / mag1 };
                const dir2 = { x: dr2x / mag2, y: dr2y / mag2, z: dr2z / mag2 };
                
                // Draw lines extending in both directions
                const length = 4;
                const line1End1 = { x: -dir1.x * length, y: -dir1.y * length, z: -dir1.z * length };
                const line1End2 = { x: dir1.x * length, y: dir1.y * length, z: dir1.z * length };
                const line2End1 = { x: -dir2.x * length, y: -dir2.y * length, z: -dir2.z * length };
                const line2End2 = { x: dir2.x * length, y: dir2.y * length, z: dir2.z * length };
                
                add3DLine(line1End1, line1End2, '#d44c2f', 2);
                add3DLine(line2End1, line2End2, '#1f7f6a', 2);
                
                // Add arrows to show direction
                add3DArrow(origin, dir1, '#d44c2f', 3);
                add3DArrow(origin, dir2, '#1f7f6a', 3);
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Direction ratios of Line 1`,
                    `   • (a₁, b₁, c₁) = (${fmt(dr1x)}, ${fmt(dr1y)}, ${fmt(dr1z)})`,
                    
                    `② Direction ratios of Line 2`,
                    `   • (a₂, b₂, c₂) = (${fmt(dr2x)}, ${fmt(dr2y)}, ${fmt(dr2z)})`,
                    
                    `③ Dot product`,
                    `   • a₁a₂ + b₁b₂ + c₁c₂ = ${fmt(dr1x)}·${fmt(dr2x)} + ${fmt(dr1y)}·${fmt(dr2y)} + ${fmt(dr1z)}·${fmt(dr2z)}`,
                    `   • = ${fmt(dr1x*dr2x)} + ${fmt(dr1y*dr2y)} + ${fmt(dr1z*dr2z)} = ${fmt(dot)}`,
                    
                    `④ Magnitudes`,
                    `   • |L₁| = √(${fmt(dr1x*dr1x)} + ${fmt(dr1y*dr1y)} + ${fmt(dr1z*dr1z)}) = √${fmt(dr1x*dr1x + dr1y*dr1y + dr1z*dr1z)} = ${fmt(mag1)}`,
                    `   • |L₂| = √(${fmt(dr2x*dr2x)} + ${fmt(dr2y*dr2y)} + ${fmt(dr2z*dr2z)}) = √${fmt(dr2x*dr2x + dr2y*dr2y + dr2z*dr2z)} = ${fmt(mag2)}`,
                    
                    `⑤ Cosine of angle`,
                    `   • cos θ = |a₁a₂ + b₁b₂ + c₁c₂| / (|L₁|·|L₂|)`,
                    `   • cos θ = ${Math.abs(dot)} / (${fmt(mag1)} × ${fmt(mag2)})`,
                    `   • cos θ = ${Math.abs(dot)} / ${fmt(mag1*mag2)} = ${fmt(cosTheta)}`,
                    
                    `⑥ Angle between lines`,
                    `   • θ = arccos(${fmt(cosTheta)}) = ${fmt(thetaDeg)}°`,
                    
                    `⑦ Special cases`,
                    isParallel ? `   • Lines are PARALLEL (θ = 0°)` : 
                    isPerpendicular ? `   • Lines are PERPENDICULAR (θ = 90°)` :
                    `   • Lines are neither parallel nor perpendicular`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\theta = ${fmt(thetaDeg)}° \\)<br>\\( \\cos \\theta = ${fmt(cosTheta)} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [a1, b1, c1, a2, b2, c2].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
        else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
    }, 100);
}
// ============================================
// NEW 3D GEOMETRY FUNCTIONS
// ============================================

/**
 * Renders the Condition for Parallelism and Perpendicularity in 3D Card
 */
function renderConditionParallelPerp3DCard() {
    // Deactivate all other 3D buttons
    const threeDCoordsBtn = document.getElementById('threeDCoordsBtn');
    const directionRatiosBtn = document.getElementById('directionRatiosBtn');
    const lineSymmetricFormBtn = document.getElementById('lineSymmetricFormBtn');
    const lineVectorFormBtn = document.getElementById('lineVectorFormBtn');
    const angleBetweenLines3DBtn = document.getElementById('angleBetweenLines3DBtn');
    
    if(threeDCoordsBtn) threeDCoordsBtn.classList.remove('active-btn');
    if(directionRatiosBtn) directionRatiosBtn.classList.remove('active-btn');
    if(lineSymmetricFormBtn) lineSymmetricFormBtn.classList.remove('active-btn');
    if(lineVectorFormBtn) lineVectorFormBtn.classList.remove('active-btn');
    if(angleBetweenLines3DBtn) angleBetweenLines3DBtn.classList.remove('active-btn');
    
    // Activate this button
    const conditionParallelPerp3DBtn = document.getElementById('conditionParallelPerp3DBtn');
    if(conditionParallelPerp3DBtn) conditionParallelPerp3DBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>📏</span> Condition for Parallelism & Perpendicularity in 3D</h2>
        
        <div class="formula-badge">
            \\( \\text{Line 1: Direction ratios } (a_1, b_1, c_1) \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Line 2: Direction ratios } (a_2, b_2, c_2) \\)
        </div>
        <div class="formula-badge" style="background: #e8f0fe;">
            \\( \\text{PARALLEL: } \\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\)
        </div>
        <div class="formula-badge" style="background: #e8f0fe;">
            \\( \\text{PERPENDICULAR: } a_1a_2 + b_1b_2 + c_1c_2 = 0 \\)
        </div>
        
        <div class="input-group" style="justify-content:center;">
            <div class="point-box">
                <label>Line 1 Direction Ratios</label>
                <div class="coord-input"><span>a₁ =</span><input type="number" id="perpPara1A" value="2" step="any"></div>
                <div class="coord-input"><span>b₁ =</span><input type="number" id="perpPara1B" value="3" step="any"></div>
                <div class="coord-input"><span>c₁ =</span><input type="number" id="perpPara1C" value="1" step="any"></div>
            </div>
            <div class="point-box">
                <label>Line 2 Direction Ratios</label>
                <div class="coord-input"><span>a₂ =</span><input type="number" id="perpPara2A" value="4" step="any"></div>
                <div class="coord-input"><span>b₂ =</span><input type="number" id="perpPara2B" value="6" step="any"></div>
                <div class="coord-input"><span>c₂ =</span><input type="number" id="perpPara2C" value="2" step="any"></div>
                <div style="font-size:0.85rem; margin-top:5px;">For parallel: (2,3,1) and (4,6,2) are proportional</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePerpParaBtn">
            <span>📏</span> Check Condition
        </button>
        
        <div class="result-highlight" id="perpParaResult">
            \\( \\text{Lines are PARALLEL} \\)
        </div>
        <div class="footnote">
            <strong>Parallel Lines:</strong> Direction ratios are proportional.<br>
            <strong>Perpendicular Lines:</strong> Dot product of direction vectors = 0.<br>
            Lines are drawn through origin for visualization.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        window.addEventListener('resize', resize3DRenderer);
        
        const a1 = document.getElementById('perpPara1A');
        const b1 = document.getElementById('perpPara1B');
        const c1 = document.getElementById('perpPara1C');
        const a2 = document.getElementById('perpPara2A');
        const b2 = document.getElementById('perpPara2B');
        const c2 = document.getElementById('perpPara2C');
        const compute = document.getElementById('computePerpParaBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('perpParaResult');
        
        function update() {
            try {
                const dr1x = parseFloat(a1.value);
                const dr1y = parseFloat(b1.value);
                const dr1z = parseFloat(c1.value);
                const dr2x = parseFloat(a2.value);
                const dr2y = parseFloat(b2.value);
                const dr2z = parseFloat(c2.value);
                
                if (isNaN(dr1x) || isNaN(dr1y) || isNaN(dr1z) || 
                    isNaN(dr2x) || isNaN(dr2y) || isNaN(dr2z)) {
                    throw new Error('Please enter valid numbers');
                }
                
                // Check for parallelism (proportionality)
                let isParallel = false;
                let parallelRatio = null;
                
                if (Math.abs(dr1x) > 1e-10 && Math.abs(dr2x) > 1e-10) {
                    const ratio = dr1x / dr2x;
                    if (Math.abs(dr1y - ratio * dr2y) < 1e-8 && 
                        Math.abs(dr1z - ratio * dr2z) < 1e-8) {
                        isParallel = true;
                        parallelRatio = ratio;
                    }
                } else if (Math.abs(dr1y) > 1e-10 && Math.abs(dr2y) > 1e-10) {
                    const ratio = dr1y / dr2y;
                    if (Math.abs(dr1x - ratio * dr2x) < 1e-8 && 
                        Math.abs(dr1z - ratio * dr2z) < 1e-8) {
                        isParallel = true;
                        parallelRatio = ratio;
                    }
                } else if (Math.abs(dr1z) > 1e-10 && Math.abs(dr2z) > 1e-10) {
                    const ratio = dr1z / dr2z;
                    if (Math.abs(dr1x - ratio * dr2x) < 1e-8 && 
                        Math.abs(dr1y - ratio * dr2y) < 1e-8) {
                        isParallel = true;
                        parallelRatio = ratio;
                    }
                }
                
                // Check for perpendicularity
                const dotProduct = dr1x * dr2x + dr1y * dr2y + dr1z * dr2z;
                const isPerpendicular = Math.abs(dotProduct) < 1e-8;
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw both lines through origin
                const origin = { x: 0, y: 0, z: 0 };
                const mag1 = Math.sqrt(dr1x*dr1x + dr1y*dr1y + dr1z*dr1z);
                const mag2 = Math.sqrt(dr2x*dr2x + dr2y*dr2y + dr2z*dr2z);
                
                if (mag1 > 0.1) {
                    const dir1 = { x: dr1x / mag1, y: dr1y / mag1, z: dr1z / mag1 };
                    add3DArrow(origin, dir1, '#d44c2f', 4);
                    add3DLine({x: -dir1.x * 3, y: -dir1.y * 3, z: -dir1.z * 3}, 
                             {x: dir1.x * 4, y: dir1.y * 4, z: dir1.z * 4}, '#d44c2f', 2);
                }
                
                if (mag2 > 0.1) {
                    const dir2 = { x: dr2x / mag2, y: dr2y / mag2, z: dr2z / mag2 };
                    add3DArrow(origin, dir2, '#1f7f6a', 4);
                    add3DLine({x: -dir2.x * 3, y: -dir2.y * 3, z: -dir2.z * 3}, 
                             {x: dir2.x * 4, y: dir2.y * 4, z: dir2.z * 4}, '#1f7f6a', 2);
                }
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                let resultText = '';
                let steps = [];
                
                if (isParallel) {
                    resultText = `Lines are PARALLEL (ratio = ${fmt(parallelRatio)})`;
                    steps = [
                        `① Direction ratios of Line 1: (${fmt(dr1x)}, ${fmt(dr1y)}, ${fmt(dr1z)})`,
                        `② Direction ratios of Line 2: (${fmt(dr2x)}, ${fmt(dr2y)}, ${fmt(dr2z)})`,
                        `③ Check proportionality:`,
                        `   • a₁/a₂ = ${fmt(dr1x)}/${fmt(dr2x)} = ${fmt(dr1x/dr2x)}`,
                        `   • b₁/b₂ = ${fmt(dr1y)}/${fmt(dr2y)} = ${fmt(dr1y/dr2y)}`,
                        `   • c₁/c₂ = ${fmt(dr1z)}/${fmt(dr2z)} = ${fmt(dr1z/dr2z)}`,
                        `④ All ratios are equal → Lines are PARALLEL`,
                        `⑤ Parallel condition: Direction vectors are scalar multiples`,
                        `   • (${fmt(dr1x)}, ${fmt(dr1y)}, ${fmt(dr1z)}) = ${fmt(parallelRatio)} × (${fmt(dr2x)}, ${fmt(dr2y)}, ${fmt(dr2z)})`
                    ];
                } else if (isPerpendicular) {
                    resultText = `Lines are PERPENDICULAR (dot product = 0)`;
                    steps = [
                        `① Direction ratios of Line 1: (${fmt(dr1x)}, ${fmt(dr1y)}, ${fmt(dr1z)})`,
                        `② Direction ratios of Line 2: (${fmt(dr2x)}, ${fmt(dr2y)}, ${fmt(dr2z)})`,
                        `③ Dot product = a₁a₂ + b₁b₂ + c₁c₂`,
                        `   = ${fmt(dr1x)}·${fmt(dr2x)} + ${fmt(dr1y)}·${fmt(dr2y)} + ${fmt(dr1z)}·${fmt(dr2z)}`,
                        `   = ${fmt(dr1x*dr2x)} + ${fmt(dr1y*dr2y)} + ${fmt(dr1z*dr2z)} = ${fmt(dotProduct)}`,
                        `④ Since dot product = 0 → Lines are PERPENDICULAR`,
                        `⑤ Perpendicular condition: Direction vectors are orthogonal`
                    ];
                } else {
                    resultText = `Lines are NEITHER parallel nor perpendicular`;
                    steps = [
                        `① Direction ratios of Line 1: (${fmt(dr1x)}, ${fmt(dr1y)}, ${fmt(dr1z)})`,
                        `② Direction ratios of Line 2: (${fmt(dr2x)}, ${fmt(dr2y)}, ${fmt(dr2z)})`,
                        `③ Check parallelism: Ratios are not equal`,
                        `   • a₁/a₂ = ${fmt(dr1x/dr2x)}`,
                        `   • b₁/b₂ = ${fmt(dr1y/dr2y)}`,
                        `   • c₁/c₂ = ${fmt(dr1z/dr2z)}`,
                        `④ Check perpendicularity: Dot product = ${fmt(dotProduct)} ≠ 0`,
                        `⑤ Therefore, lines are neither parallel nor perpendicular`
                    ];
                }
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\text{${resultText}} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                else if (typeof window.renderLatex === 'function') window.renderLatex();
                
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [a1, b1, c1, a2, b2, c2].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
        else if (typeof window.attachStepsToggle === 'function') window.attachStepsToggle();
    }, 100);
}

/**
 * Renders the Intersection of Lines in 3D (if coplanar) Card
 */
function renderIntersectionLines3DCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>⚡</span> Intersection of Lines in 3D (Coplanar Check)</h2>
        
        <div class="formula-badge">
            \\( \\text{Line 1: } \\frac{x - x_1}{a_1} = \\frac{y - y_1}{b_1} = \\frac{z - z_1}{c_1} \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Line 2: } \\frac{x - x_2}{a_2} = \\frac{y - y_2}{b_2} = \\frac{z - z_2}{c_2} \\)
        </div>
        <div class="formula-badge" style="background: #fff3cd;">
            \\( \\text{Intersection exists if the lines are coplanar and the parameters yield the same point} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line 1: Point P₁ + t·d₁</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P₁: (<input type="number" id="intL1Px" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="intL1Py" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="intL1Pz" value="0" step="any" style="width:60px;">)</div>
                    <div>d₁: (<input type="number" id="intL1Dx" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="intL1Dy" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="intL1Dz" value="1" step="any" style="width:60px;">)</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Line 2: Point P₂ + s·d₂</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P₂: (<input type="number" id="intL2Px" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="intL2Py" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="intL2Pz" value="1" step="any" style="width:60px;">)</div>
                    <div>d₂: (<input type="number" id="intL2Dx" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="intL2Dy" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="intL2Dz" value="1" step="any" style="width:60px;">)</div>
                </div>
                <div style="font-size:0.85rem; margin-top:5px;">Example shows intersecting lines (P₁ + t·d₁ and P₂ + s·d₂ with same direction)</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeIntersection3DBtn">
            <span>⚡</span> Find Intersection
        </button>
        
        <div class="result-highlight" id="intersection3DResult">
            \\( \\text{Lines intersect at point} \\)
        </div>
        <div class="footnote">
            <strong>Intersection in 3D:</strong> Solve parametric equations for parameters t and s.<br>
            If solution exists and is unique, lines intersect at that point.<br>
            If direction vectors are parallel, lines are either coincident or parallel (no intersection).
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        
        const l1Px = document.getElementById('intL1Px');
        const l1Py = document.getElementById('intL1Py');
        const l1Pz = document.getElementById('intL1Pz');
        const l1Dx = document.getElementById('intL1Dx');
        const l1Dy = document.getElementById('intL1Dy');
        const l1Dz = document.getElementById('intL1Dz');
        const l2Px = document.getElementById('intL2Px');
        const l2Py = document.getElementById('intL2Py');
        const l2Pz = document.getElementById('intL2Pz');
        const l2Dx = document.getElementById('intL2Dx');
        const l2Dy = document.getElementById('intL2Dy');
        const l2Dz = document.getElementById('intL2Dz');
        const compute = document.getElementById('computeIntersection3DBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('intersection3DResult');
        
        function update() {
            try {
                const p1x = parseFloat(l1Px.value);
                const p1y = parseFloat(l1Py.value);
                const p1z = parseFloat(l1Pz.value);
                const d1x = parseFloat(l1Dx.value);
                const d1y = parseFloat(l1Dy.value);
                const d1z = parseFloat(l1Dz.value);
                const p2x = parseFloat(l2Px.value);
                const p2y = parseFloat(l2Py.value);
                const p2z = parseFloat(l2Pz.value);
                const d2x = parseFloat(l2Dx.value);
                const d2y = parseFloat(l2Dy.value);
                const d2z = parseFloat(l2Dz.value);
                
                // Solve for intersection: p1 + t*d1 = p2 + s*d2
                // This is a system of 3 equations with 2 unknowns
                // Use first two equations to solve, then check third
                
                let intersectPoint = null;
                let steps = [];
                let isParallel = false;
                let isIntersecting = false;
                
                // Check if direction vectors are parallel
                const crossX = d1y * d2z - d1z * d2y;
                const crossY = d1z * d2x - d1x * d2z;
                const crossZ = d1x * d2y - d1y * d2x;
                const crossMag = Math.sqrt(crossX*crossX + crossY*crossY + crossZ*crossZ);
                isParallel = crossMag < 1e-8;
                
                steps = [
                    `① Line 1: P₁ = (${fmt(p1x)}, ${fmt(p1y)}, ${fmt(p1z)}), d₁ = (${fmt(d1x)}, ${fmt(d1y)}, ${fmt(d1z)})`,
                    `② Line 2: P₂ = (${fmt(p2x)}, ${fmt(p2y)}, ${fmt(p2z)}), d₂ = (${fmt(d2x)}, ${fmt(d2y)}, ${fmt(d2z)})`,
                    `③ Check if lines are parallel: Cross product |d₁ × d₂| = ${fmt(crossMag)}`,
                    isParallel ? `   • Cross product ≈ 0 → Lines are PARALLEL` : `   • Cross product ≠ 0 → Lines are NOT parallel`
                ];
                
                if (isParallel) {
                    // Check if lines are coincident
                    const dp = p2x - p1x, dq = p2y - p1y, dr = p2z - p1z;
                    const isCoincident = Math.abs(crossX) < 1e-8 && Math.abs(crossY) < 1e-8 && Math.abs(crossZ) < 1e-8;
                    
                    if (isCoincident) {
                        steps.push(`④ Lines are COINCIDENT (they overlap completely)`);
                        steps.push(`⑤ Every point on one line lies on the other → infinite intersection points`);
                        resultDiv.innerHTML = `\\( \\text{Lines are COINCIDENT (infinite intersection points)} \\)`;
                    } else {
                        steps.push(`④ Lines are PARALLEL but not coincident → NO intersection`);
                        resultDiv.innerHTML = `\\( \\text{Lines are PARALLEL (no intersection)} \\)`;
                    }
                    
                    // Draw parallel lines
                    clear3DObjects();
                    
                    // Draw Line 1
                    const dir1 = { x: d1x, y: d1y, z: d1z };
                    const mag1 = Math.sqrt(d1x*d1x + d1y*d1y + d1z*d1z);
                    if (mag1 > 0.1) {
                        const unit1 = { x: d1x/mag1, y: d1y/mag1, z: d1z/mag1 };
                        add3DArrow({x: p1x, y: p1y, z: p1z}, unit1, '#d44c2f', 3);
                        add3DLine({x: p1x - unit1.x*4, y: p1y - unit1.y*4, z: p1z - unit1.z*4},
                                 {x: p1x + unit1.x*4, y: p1y + unit1.y*4, z: p1z + unit1.z*4}, '#d44c2f', 2);
                        add3DPoint(p1x, p1y, p1z, '#d44c2f', 'P₁', 0.15);
                    }
                    
                    // Draw Line 2
                    const dir2 = { x: d2x, y: d2y, z: d2z };
                    const mag2 = Math.sqrt(d2x*d2x + d2y*d2y + d2z*d2z);
                    if (mag2 > 0.1) {
                        const unit2 = { x: d2x/mag2, y: d2y/mag2, z: d2z/mag2 };
                        add3DArrow({x: p2x, y: p2y, z: p2z}, unit2, '#1f7f6a', 3);
                        add3DLine({x: p2x - unit2.x*4, y: p2y - unit2.y*4, z: p2z - unit2.z*4},
                                 {x: p2x + unit2.x*4, y: p2y + unit2.y*4, z: p2z + unit2.z*4}, '#1f7f6a', 2);
                        add3DPoint(p2x, p2y, p2z, '#1f7f6a', 'P₂', 0.15);
                    }
                    
                } else {
                    // Solve for t and s using two equations
                    // From x: p1x + t*d1x = p2x + s*d2x
                    // From y: p1y + t*d1y = p2y + s*d2y
                    
                    const dxDiff = p2x - p1x;
                    const dyDiff = p2y - p1y;
                    
                    // Solve: t*d1x - s*d2x = dxDiff
                    //        t*d1y - s*d2y = dyDiff
                    const det = d1x * (-d2y) - (-d2x) * d1y;
                    
                    if (Math.abs(det) < 1e-8) {
                        steps.push(`④ System determinant is zero → lines may be skew`);
                        steps.push(`⑤ Check if they lie in the same plane...`);
                        
                        // Check coplanarity
                        const vecP = { x: p2x - p1x, y: p2y - p1y, z: p2z - p1z };
                        const tripleProduct = vecP.x * crossX + vecP.y * crossY + vecP.z * crossZ;
                        
                        if (Math.abs(tripleProduct) < 1e-8) {
                            steps.push(`   • Triple product = ${fmt(tripleProduct)} → Lines are COPLANAR`);
                            steps.push(`   • Lines intersect or are parallel (but we already checked parallel)`);
                        } else {
                            steps.push(`   • Triple product = ${fmt(tripleProduct)} → Lines are SKEW (no intersection, not parallel)`);
                            resultDiv.innerHTML = `\\( \\text{Lines are SKEW (no intersection, not parallel)} \\)`;
                            intersectPoint = null;
                        }
                    } else {
                        const t = (dxDiff * (-d2y) - (-d2x) * dyDiff) / det;
                        const s = (d1x * dyDiff - dxDiff * d1y) / det;
                        
                        // Check third coordinate
                        const z1 = p1z + t * d1z;
                        const z2 = p2z + s * d2z;
                        
                        steps.push(`④ Solve system from x and y equations:`);
                        steps.push(`   • t = ${fmt(t)}, s = ${fmt(s)}`);
                        steps.push(`⑤ Check z-coordinate:`);
                        steps.push(`   • z from Line 1 = ${fmt(p1z)} + ${fmt(t)}·${fmt(d1z)} = ${fmt(z1)}`);
                        steps.push(`   • z from Line 2 = ${fmt(p2z)} + ${fmt(s)}·${fmt(d2z)} = ${fmt(z2)}`);
                        
                        if (Math.abs(z1 - z2) < 1e-8) {
                            intersectPoint = { x: p1x + t * d1x, y: p1y + t * d1y, z: p1z + t * d1z };
                            steps.push(`⑥ z-values match → Lines INTERSECT at point (${fmt(intersectPoint.x)}, ${fmt(intersectPoint.y)}, ${fmt(intersectPoint.z)})`);
                            resultDiv.innerHTML = `\\( \\text{Intersection point: } (${fmt(intersectPoint.x)}, ${fmt(intersectPoint.y)}, ${fmt(intersectPoint.z)}) \\)`;
                            isIntersecting = true;
                        } else {
                            steps.push(`⑥ z-values do NOT match → Lines are SKEW (no intersection)`);
                            resultDiv.innerHTML = `\\( \\text{Lines are SKEW (no intersection, not parallel)} \\)`;
                            intersectPoint = null;
                        }
                    }
                    
                    // Draw lines
                    clear3DObjects();
                    
                    // Draw Line 1
                    const dir1 = { x: d1x, y: d1y, z: d1z };
                    const mag1 = Math.sqrt(d1x*d1x + d1y*d1y + d1z*d1z);
                    if (mag1 > 0.1) {
                        const unit1 = { x: d1x/mag1, y: d1y/mag1, z: d1z/mag1 };
                        add3DArrow({x: p1x, y: p1y, z: p1z}, unit1, '#d44c2f', 3);
                        add3DLine({x: p1x - unit1.x*4, y: p1y - unit1.y*4, z: p1z - unit1.z*4},
                                 {x: p1x + unit1.x*4, y: p1y + unit1.y*4, z: p1z + unit1.z*4}, '#d44c2f', 2);
                        add3DPoint(p1x, p1y, p1z, '#d44c2f', 'P₁', 0.15);
                    }
                    
                    // Draw Line 2
                    const dir2 = { x: d2x, y: d2y, z: d2z };
                    const mag2 = Math.sqrt(d2x*d2x + d2y*d2y + d2z*d2z);
                    if (mag2 > 0.1) {
                        const unit2 = { x: d2x/mag2, y: d2y/mag2, z: d2z/mag2 };
                        add3DArrow({x: p2x, y: p2y, z: p2z}, unit2, '#1f7f6a', 3);
                        add3DLine({x: p2x - unit2.x*4, y: p2y - unit2.y*4, z: p2z - unit2.z*4},
                                 {x: p2x + unit2.x*4, y: p2y + unit2.y*4, z: p2z + unit2.z*4}, '#1f7f6a', 2);
                        add3DPoint(p2x, p2y, p2z, '#1f7f6a', 'P₂', 0.15);
                    }
                    
                    // Draw intersection point if exists
                    if (intersectPoint) {
                        add3DPoint(intersectPoint.x, intersectPoint.y, intersectPoint.z, '#ca8a04', 'Intersection', 0.25);
                    }
                }
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                if (typeof renderLatex === 'function') renderLatex();
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [l1Px, l1Py, l1Pz, l1Dx, l1Dy, l1Dz, l2Px, l2Py, l2Pz, l2Dx, l2Dy, l2Dz].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
    }, 100);
}

/**
 * Renders the Skew Lines Card (Definition and Shortest Distance)
 */
function renderSkewLines3DCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>📐</span> Skew Lines: Definition & Shortest Distance</h2>
        
        <div class="formula-badge" style="background: #e8f0fe;">
            \\( \\text{Skew lines are lines in 3D that are NOT parallel and do NOT intersect} \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Shortest distance between skew lines: } d = \\frac{|(\\vec{P_2P_1}) \\cdot (\\vec{d_1} \\times \\vec{d_2})|}{|\\vec{d_1} \\times \\vec{d_2}|} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line 1: Point P₁ + t·d₁</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P₁: (<input type="number" id="skewP1x" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="skewP1y" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="skewP1z" value="0" step="any" style="width:60px;">)</div>
                    <div>d₁: (<input type="number" id="skewD1x" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="skewD1y" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="skewD1z" value="0" step="any" style="width:60px;">)</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Line 2: Point P₂ + s·d₂</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P₂: (<input type="number" id="skewP2x" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="skewP2y" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="skewP2z" value="1" step="any" style="width:60px;">)</div>
                    <div>d₂: (<input type="number" id="skewD2x" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="skewD2y" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="skewD2z" value="1" step="any" style="width:60px;">)</div>
                </div>
                <div style="font-size:0.85rem; margin-top:5px;">Example: Line 1 along x-axis, Line 2 through (0,1,1) along (0,1,1)</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeSkewLinesBtn">
            <span>📐</span> Calculate Shortest Distance
        </button>
        
        <div class="result-highlight" id="skewLinesResult">
            \\( \\text{Shortest distance = 1.4142} \\)
        </div>
        <div class="footnote">
            <strong>Skew Lines:</strong> Lines that are neither parallel nor intersecting.<br>
            <strong>Shortest distance:</strong> Length of common perpendicular between the two lines.<br>
            The formula uses vector cross product and dot product.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        
        const p1x = document.getElementById('skewP1x');
        const p1y = document.getElementById('skewP1y');
        const p1z = document.getElementById('skewP1z');
        const d1x = document.getElementById('skewD1x');
        const d1y = document.getElementById('skewD1y');
        const d1z = document.getElementById('skewD1z');
        const p2x = document.getElementById('skewP2x');
        const p2y = document.getElementById('skewP2y');
        const p2z = document.getElementById('skewP2z');
        const d2x = document.getElementById('skewD2x');
        const d2y = document.getElementById('skewD2y');
        const d2z = document.getElementById('skewD2z');
        const compute = document.getElementById('computeSkewLinesBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('skewLinesResult');
        
        function update() {
            try {
                const p1 = { x: parseFloat(p1x.value), y: parseFloat(p1y.value), z: parseFloat(p1z.value) };
                const d1 = { x: parseFloat(d1x.value), y: parseFloat(d1y.value), z: parseFloat(d1z.value) };
                const p2 = { x: parseFloat(p2x.value), y: parseFloat(p2y.value), z: parseFloat(p2z.value) };
                const d2 = { x: parseFloat(d2x.value), y: parseFloat(d2y.value), z: parseFloat(d2z.value) };
                
                // Calculate cross product d1 × d2
                const crossX = d1.y * d2.z - d1.z * d2.y;
                const crossY = d1.z * d2.x - d1.x * d2.z;
                const crossZ = d1.x * d2.y - d1.y * d2.x;
                const crossMag = Math.sqrt(crossX*crossX + crossY*crossY + crossZ*crossZ);
                
                // Vector between points: P2 - P1
                const diffX = p2.x - p1.x;
                const diffY = p2.y - p1.y;
                const diffZ = p2.z - p1.z;
                
                // Triple product: (P2P1) · (d1 × d2)
                const tripleProduct = diffX * crossX + diffY * crossY + diffZ * crossZ;
                
                // Shortest distance
                const shortestDist = Math.abs(tripleProduct) / crossMag;
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw Line 1
                const mag1 = Math.sqrt(d1.x*d1.x + d1.y*d1.y + d1.z*d1.z);
                if (mag1 > 0.1) {
                    const unit1 = { x: d1.x/mag1, y: d1.y/mag1, z: d1.z/mag1 };
                    add3DArrow({x: p1.x, y: p1.y, z: p1.z}, unit1, '#d44c2f', 3);
                    add3DLine({x: p1.x - unit1.x*5, y: p1.y - unit1.y*5, z: p1.z - unit1.z*5},
                             {x: p1.x + unit1.x*5, y: p1.y + unit1.y*5, z: p1.z + unit1.z*5}, '#d44c2f', 2);
                    add3DPoint(p1.x, p1.y, p1.z, '#d44c2f', 'P₁', 0.15);
                }
                
                // Draw Line 2
                const mag2 = Math.sqrt(d2.x*d2.x + d2.y*d2.y + d2.z*d2.z);
                if (mag2 > 0.1) {
                    const unit2 = { x: d2.x/mag2, y: d2.y/mag2, z: d2.z/mag2 };
                    add3DArrow({x: p2.x, y: p2.y, z: p2.z}, unit2, '#1f7f6a', 3);
                    add3DLine({x: p2.x - unit2.x*5, y: p2.y - unit2.y*5, z: p2.z - unit2.z*5},
                             {x: p2.x + unit2.x*5, y: p2.y + unit2.y*5, z: p2.z + unit2.z*5}, '#1f7f6a', 2);
                    add3DPoint(p2.x, p2.y, p2.z, '#1f7f6a', 'P₂', 0.15);
                }
                
                // Find points of closest approach (optional, for visualization)
                // Solve for t and s where distance is minimized
                // This is more complex; we'll compute approximate points
                const denominator = crossMag * crossMag;
                if (denominator > 1e-8) {
                    const t = ((diffX * crossX + diffY * crossY + diffZ * crossZ) * crossMag) / denominator;
                    // Simplified: find closest point on line 1
                    const closestOnL1 = { 
                        x: p1.x + t * d1.x, 
                        y: p1.y + t * d1.y, 
                        z: p1.z + t * d1.z 
                    };
                    
                    // Draw the common perpendicular line
                    // For visualization, draw a line showing the shortest distance
                    // This is approximate
                    const unitCross = { x: crossX/crossMag, y: crossY/crossMag, z: crossZ/crossMag };
                    add3DLine(closestOnL1, { x: closestOnL1.x + unitCross.x * shortestDist, 
                                              y: closestOnL1.y + unitCross.y * shortestDist, 
                                              z: closestOnL1.z + unitCross.z * shortestDist }, 
                            '#ca8a04', 3);
                    add3DPoint(closestOnL1.x, closestOnL1.y, closestOnL1.z, '#ca8a04', 'Closest point on L1', 0.12);
                }
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Line 1: P₁(${fmt(p1.x)}, ${fmt(p1.y)}, ${fmt(p1.z)}) + t·(${fmt(d1.x)}, ${fmt(d1.y)}, ${fmt(d1.z)})`,
                    `② Line 2: P₂(${fmt(p2.x)}, ${fmt(p2.y)}, ${fmt(p2.z)}) + s·(${fmt(d2.x)}, ${fmt(d2.y)}, ${fmt(d2.z)})`,
                    `③ Direction vectors: d₁ = (${fmt(d1.x)}, ${fmt(d1.y)}, ${fmt(d1.z)}), d₂ = (${fmt(d2.x)}, ${fmt(d2.y)}, ${fmt(d2.z)})`,
                    `④ Cross product d₁ × d₂:`,
                    `   • = (${fmt(d1.y)}·${fmt(d2.z)} - ${fmt(d1.z)}·${fmt(d2.y)}, ${fmt(d1.z)}·${fmt(d2.x)} - ${fmt(d1.x)}·${fmt(d2.z)}, ${fmt(d1.x)}·${fmt(d2.y)} - ${fmt(d1.y)}·${fmt(d2.x)})`,
                    `   • = (${fmt(crossX)}, ${fmt(crossY)}, ${fmt(crossZ)})`,
                    `   • |d₁ × d₂| = √(${fmt(crossX*crossX)} + ${fmt(crossY*crossY)} + ${fmt(crossZ*crossZ)}) = ${fmt(crossMag)}`,
                    `⑤ Vector P₂P₁ = (${fmt(p2.x)} - ${fmt(p1.x)}, ${fmt(p2.y)} - ${fmt(p1.y)}, ${fmt(p2.z)} - ${fmt(p1.z)})`,
                    `   = (${fmt(diffX)}, ${fmt(diffY)}, ${fmt(diffZ)})`,
                    `⑥ Triple product = P₂P₁ · (d₁ × d₂)`,
                    `   = ${fmt(diffX)}·${fmt(crossX)} + ${fmt(diffY)}·${fmt(crossY)} + ${fmt(diffZ)}·${fmt(crossZ)}`,
                    `   = ${fmt(tripleProduct)}`,
                    `⑦ Shortest distance = |triple product| / |d₁ × d₂|`,
                    `   = |${fmt(tripleProduct)}| / ${fmt(crossMag)} = ${fmt(shortestDist)}`,
                    `⑧ Since lines are ${crossMag > 1e-8 ? 'not parallel' : 'parallel'} and ${Math.abs(tripleProduct) > 1e-8 ? 'not coplanar' : 'coplanar'},`,
                    `   these are ${Math.abs(tripleProduct) > 1e-8 && crossMag > 1e-8 ? 'SKEW LINES' : 'intersecting or parallel lines'}`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\text{Shortest distance} = ${fmt(shortestDist)} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [p1x, p1y, p1z, d1x, d1y, d1z, p2x, p2y, p2z, d2x, d2y, d2z].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
    }, 100);
}

/**
 * Renders the Projection of a Line on another Line Card
 */
function renderProjectionLine3DCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>📏</span> Projection of a Line on another Line</h2>
        
        <div class="formula-badge">
            \\( \\text{Projection length of line L₁ on L₂ = } \\frac{|\\vec{AB} \\cdot \\vec{d₂}|}{|\\vec{d₂}|} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Line to Project (Line L₁): Points A and B</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>A: (<input type="number" id="projAx" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="projAy" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="projAz" value="0" step="any" style="width:60px;">)</div>
                    <div>B: (<input type="number" id="projBx" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="projBy" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="projBz" value="0" step="any" style="width:60px;">)</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Line to Project ON (Line L₂): Point C and Direction d</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>C: (<input type="number" id="projCx" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="projCy" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="projCz" value="0" step="any" style="width:60px;">)</div>
                    <div>d: (<input type="number" id="projDx" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="projDy" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="projDz" value="0" step="any" style="width:60px;">)</div>
                </div>
                <div style="font-size:0.85rem; margin-top:5px;">Example: Project AB onto x-axis</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeProjectionLineBtn">
            <span>📏</span> Calculate Projection
        </button>
        
        <div class="result-highlight" id="projectionLineResult">
            \\( \\text{Projection length = 2.0000} \\)
        </div>
        <div class="footnote">
            <strong>Projection of a line onto another line:</strong> The length of the shadow of one line onto another.<br>
            Formula uses dot product to find component of vector along direction.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        
        const ax = document.getElementById('projAx');
        const ay = document.getElementById('projAy');
        const az = document.getElementById('projAz');
        const bx = document.getElementById('projBx');
        const by = document.getElementById('projBy');
        const bz = document.getElementById('projBz');
        const cx = document.getElementById('projCx');
        const cy = document.getElementById('projCy');
        const cz = document.getElementById('projCz');
        const dx = document.getElementById('projDx');
        const dy = document.getElementById('projDy');
        const dz = document.getElementById('projDz');
        const compute = document.getElementById('computeProjectionLineBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('projectionLineResult');
        
        function update() {
            try {
                const A = { x: parseFloat(ax.value), y: parseFloat(ay.value), z: parseFloat(az.value) };
                const B = { x: parseFloat(bx.value), y: parseFloat(by.value), z: parseFloat(bz.value) };
                const C = { x: parseFloat(cx.value), y: parseFloat(cy.value), z: parseFloat(cz.value) };
                const D = { x: parseFloat(dx.value), y: parseFloat(dy.value), z: parseFloat(dz.value) };
                
                // Vector AB
                const AB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
                const ABMag = Math.sqrt(AB.x*AB.x + AB.y*AB.y + AB.z*AB.z);
                
                // Direction vector of line L₂
                const DMag = Math.sqrt(D.x*D.x + D.y*D.y + D.z*D.z);
                const unitD = { x: D.x/DMag, y: D.y/DMag, z: D.z/DMag };
                
                // Projection length of AB onto direction D
                const projection = Math.abs(AB.x * unitD.x + AB.y * unitD.y + AB.z * unitD.z);
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw line L₁ (AB)
                add3DLine(A, B, '#d44c2f', 2);
                add3DPoint(A.x, A.y, A.z, '#d44c2f', 'A', 0.15);
                add3DPoint(B.x, B.y, B.z, '#d44c2f', 'B', 0.15);
                
                // Draw line L₂ (through C with direction D)
                const mag = Math.sqrt(D.x*D.x + D.y*D.y + D.z*D.z);
                if (mag > 0.1) {
                    const unit = { x: D.x/mag, y: D.y/mag, z: D.z/mag };
                    add3DArrow({x: C.x, y: C.y, z: C.z}, unit, '#1f7f6a', 3);
                    add3DLine({x: C.x - unit.x*5, y: C.y - unit.y*5, z: C.z - unit.z*5},
                             {x: C.x + unit.x*5, y: C.y + unit.y*5, z: C.z + unit.z*5}, '#1f7f6a', 2);
                    add3DPoint(C.x, C.y, C.z, '#1f7f6a', 'C', 0.15);
                }
                
                // Draw projection: project A and B onto line L₂
                const tA = ((A.x - C.x) * unitD.x + (A.y - C.y) * unitD.y + (A.z - C.z) * unitD.z);
                const tB = ((B.x - C.x) * unitD.x + (B.y - C.y) * unitD.y + (B.z - C.z) * unitD.z);
                
                const A_proj = { x: C.x + tA * unitD.x, y: C.y + tA * unitD.y, z: C.z + tA * unitD.z };
                const B_proj = { x: C.x + tB * unitD.x, y: C.y + tB * unitD.y, z: C.z + tB * unitD.z };
                
                add3DLine(A_proj, B_proj, '#ca8a04', 3);
                add3DPoint(A_proj.x, A_proj.y, A_proj.z, '#ca8a04', 'A\'', 0.12);
                add3DPoint(B_proj.x, B_proj.y, B_proj.z, '#ca8a04', 'B\'', 0.12);
                
                // Draw projection lines (dashed)
                add3DLine(A, A_proj, '#888888', 1, true);
                add3DLine(B, B_proj, '#888888', 1, true);
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Line L₁: Points A(${fmt(A.x)}, ${fmt(A.y)}, ${fmt(A.z)}) and B(${fmt(B.x)}, ${fmt(B.y)}, ${fmt(B.z)})`,
                    `② Vector AB = B - A = (${fmt(AB.x)}, ${fmt(AB.y)}, ${fmt(AB.z)})`,
                    `③ |AB| = √(${fmt(AB.x*AB.x)} + ${fmt(AB.y*AB.y)} + ${fmt(AB.z*AB.z)}) = ${fmt(ABMag)}`,
                    `④ Line L₂: Through C(${fmt(C.x)}, ${fmt(C.y)}, ${fmt(C.z)}) with direction d = (${fmt(D.x)}, ${fmt(D.y)}, ${fmt(D.z)})`,
                    `⑤ |d| = √(${fmt(D.x*D.x)} + ${fmt(D.y*D.y)} + ${fmt(D.z*D.z)}) = ${fmt(DMag)}`,
                    `⑥ Unit direction vector u = d/|d| = (${fmt(unitD.x)}, ${fmt(unitD.y)}, ${fmt(unitD.z)})`,
                    `⑦ Projection length = |AB · u|`,
                    `   = |${fmt(AB.x)}·${fmt(unitD.x)} + ${fmt(AB.y)}·${fmt(unitD.y)} + ${fmt(AB.z)}·${fmt(unitD.z)}|`,
                    `   = |${fmt(AB.x*unitD.x + AB.y*unitD.y + AB.z*unitD.z)}| = ${fmt(projection)}`,
                    `⑧ This is the length of the projection of segment AB onto line L₂`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\text{Projection length} = ${fmt(projection)} \\)<br>\\( \\text{Original AB length} = ${fmt(ABMag)} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        compute.addEventListener('click', update);
        [ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
    }, 100);
}

/**
 * Renders the Image of a Point in a Line in 3D Card
 */
function renderImagePointLine3DCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>🪞</span> Image of a Point in a Line in 3D</h2>
        
        <div class="formula-badge">
            \\( \\text{Find the mirror image of point P across line L} \\)
        </div>
        <div class="formula-badge" style="background: #e8f0fe;">
            \\( \\text{Image Q = P + 2(\\vec{FP}) \\text{ where F is foot of perpendicular from P to line}} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Point P to reflect</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P: (<input type="number" id="imgPx" value="2" step="any" style="width:60px;">, 
                            <input type="number" id="imgPy" value="3" step="any" style="width:60px;">, 
                            <input type="number" id="imgPz" value="1" step="any" style="width:60px;">)</div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Line L: Point A + t·d</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>A: (<input type="number" id="imgAx" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="imgAy" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="imgAz" value="0" step="any" style="width:60px;">)</div>
                    <div>d: (<input type="number" id="imgDx" value="1" step="any" style="width:60px;">, 
                            <input type="number" id="imgDy" value="0" step="any" style="width:60px;">, 
                            <input type="number" id="imgDz" value="0" step="any" style="width:60px;">)</div>
                </div>
                <div style="font-size:0.85rem; margin-top:5px;">Example: Reflect point (2,3,1) across x-axis</div>
            </div>
        </div>
        
        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeImagePointBtn">
            <span>🪞</span> Find Image Point
        </button>
        
        <div class="result-highlight" id="imagePointResult">
            \\( \\text{Image Q = (2, -3, -1)} \\)
        </div>
        <div class="footnote">
            <strong>Image of a point in a line:</strong> The point Q such that the line is the perpendicular bisector of PQ.<br>
            Steps: Find foot of perpendicular F from P to line, then Q = P + 2(F - P) = 2F - P.
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        
        const px = document.getElementById('imgPx');
        const py = document.getElementById('imgPy');
        const pz = document.getElementById('imgPz');
        const ax = document.getElementById('imgAx');
        const ay = document.getElementById('imgAy');
        const az = document.getElementById('imgAz');
        const dx = document.getElementById('imgDx');
        const dy = document.getElementById('imgDy');
        const dz = document.getElementById('imgDz');
        const compute = document.getElementById('computeImagePointBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('imagePointResult');
        
        function update() {
            try {
                const P = { x: parseFloat(px.value), y: parseFloat(py.value), z: parseFloat(pz.value) };
                const A = { x: parseFloat(ax.value), y: parseFloat(ay.value), z: parseFloat(az.value) };
                const D = { x: parseFloat(dx.value), y: parseFloat(dy.value), z: parseFloat(dz.value) };
                
                // Direction vector of line
                const DMag = Math.sqrt(D.x*D.x + D.y*D.y + D.z*D.z);
                if (DMag < 1e-8) throw new Error('Direction vector cannot be zero');
                const unitD = { x: D.x/DMag, y: D.y/DMag, z: D.z/DMag };
                
                // Vector from A to P
                const AP = { x: P.x - A.x, y: P.y - A.y, z: P.z - A.z };
                
                // Parameter t for foot of perpendicular: t = (AP · u)
                const t = AP.x * unitD.x + AP.y * unitD.y + AP.z * unitD.z;
                
                // Foot of perpendicular F
                const F = { x: A.x + t * unitD.x, y: A.y + t * unitD.y, z: A.z + t * unitD.z };
                
                // Image Q = 2F - P
                const Q = { x: 2*F.x - P.x, y: 2*F.y - P.y, z: 2*F.z - P.z };
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw the line
                const mag = DMag;
                if (mag > 0.1) {
                    const unit = unitD;
                    add3DArrow({x: A.x, y: A.y, z: A.z}, unit, '#1f7f6a', 3);
                    add3DLine({x: A.x - unit.x*6, y: A.y - unit.y*6, z: A.z - unit.z*6},
                             {x: A.x + unit.x*6, y: A.y + unit.y*6, z: A.z + unit.z*6}, '#1f7f6a', 2);
                    add3DPoint(A.x, A.y, A.z, '#1f7f6a', 'A', 0.15);
                }
                
                // Draw point P
                add3DPoint(P.x, P.y, P.z, '#d44c2f', 'P', 0.2);
                
                // Draw foot F
                add3DPoint(F.x, F.y, F.z, '#ca8a04', 'F', 0.15);
                
                // Draw image Q
                add3DPoint(Q.x, Q.y, Q.z, '#2b5797', 'Q (Image)', 0.2);
                
                // Draw perpendicular from P to F
                add3DLine(P, F, '#888888', 2);
                add3DLine(F, Q, '#888888', 2);
                
                // Draw segment PQ (to show it's bisected)
                add3DLine(P, Q, '#888888', 1, true);
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Point to reflect: P(${fmt(P.x)}, ${fmt(P.y)}, ${fmt(P.z)})`,
                    `② Line L: Through A(${fmt(A.x)}, ${fmt(A.y)}, ${fmt(A.z)}) with direction d = (${fmt(D.x)}, ${fmt(D.y)}, ${fmt(D.z)})`,
                    `③ Unit direction vector u = d/|d| = (${fmt(unitD.x)}, ${fmt(unitD.y)}, ${fmt(unitD.z)})`,
                    `④ Vector AP = P - A = (${fmt(AP.x)}, ${fmt(AP.y)}, ${fmt(AP.z)})`,
                    `⑤ Parameter t = AP · u = ${fmt(AP.x)}·${fmt(unitD.x)} + ${fmt(AP.y)}·${fmt(unitD.y)} + ${fmt(AP.z)}·${fmt(unitD.z)}`,
                    `   = ${fmt(t)}`,
                    `⑥ Foot of perpendicular F = A + t·u = (${fmt(A.x)} + ${fmt(t)}·${fmt(unitD.x)}, ...)`,
                    `   = (${fmt(F.x)}, ${fmt(F.y)}, ${fmt(F.z)})`,
                    `⑦ Image point Q = 2F - P = (2·${fmt(F.x)} - ${fmt(P.x)}, 2·${fmt(F.y)} - ${fmt(P.y)}, 2·${fmt(F.z)} - ${fmt(P.z)})`,
                    `   = (${fmt(Q.x)}, ${fmt(Q.y)}, ${fmt(Q.z)})`,
                    `⑧ Verification: F is the midpoint of PQ:`,
                    `   Midpoint = ((${fmt(P.x)} + ${fmt(Q.x)})/2, ...) = (${fmt((P.x+Q.x)/2)}, ${fmt((P.y+Q.y)/2)}, ${fmt((P.z+Q.z)/2)}) = F ✓`,
                    `   Also, PQ ⟂ line (check dot product)`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\text{Image Q} = (${fmt(Q.x)}, ${fmt(Q.y)}, ${fmt(Q.z)}) \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
                showError(e.message);
            }
        }
        
        compute.addEventListener('click', update);
        [px, py, pz, ax, ay, az, dx, dy, dz].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
    }, 100);
}
// ============================================
// NEW ADVANCED 3D GEOMETRY FUNCTIONS
// ============================================

/**
 * Renders the Line of Intersection of Two Planes Card
 */
function renderPlaneIntersectionCard() {
    // Deactivate all other 3D buttons
    const threeDCoordsBtn = document.getElementById('threeDCoordsBtn');
    const directionRatiosBtn = document.getElementById('directionRatiosBtn');
    const lineSymmetricFormBtn = document.getElementById('lineSymmetricFormBtn');
    const lineVectorFormBtn = document.getElementById('lineVectorFormBtn');
    const angleBetweenLines3DBtn = document.getElementById('angleBetweenLines3DBtn');
    
    if(threeDCoordsBtn) threeDCoordsBtn.classList.remove('active-btn');
    if(directionRatiosBtn) directionRatiosBtn.classList.remove('active-btn');
    if(lineSymmetricFormBtn) lineSymmetricFormBtn.classList.remove('active-btn');
    if(lineVectorFormBtn) lineVectorFormBtn.classList.remove('active-btn');
    if(angleBetweenLines3DBtn) angleBetweenLines3DBtn.classList.remove('active-btn');
    
    // Activate this button
    const planeIntersectionBtn = document.getElementById('planeIntersectionBtn');
    if(planeIntersectionBtn) planeIntersectionBtn.classList.add('active-btn');

    const mainCard = document.getElementById('mainCard');
    const html = `
        <h2 style="color:#113355;"><span>📐🔀</span> Line of Intersection of Two Planes</h2>
        
        <div class="formula-badge">
            \\( \\text{Plane 1: } a_1x + b_1y + c_1z + d_1 = 0 \\)
        </div>
        <div class="formula-badge">
            \\( \\text{Plane 2: } a_2x + b_2y + c_2z + d_2 = 0 \\)
        </div>
        <div class="formula-badge" style="background: #e8f0fe;">
            \\( \\text{The intersection line direction: } \\vec{d} = \\vec{n_1} \\times \\vec{n_2} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Plane 1: a₁x + b₁y + c₁z + d₁ = 0</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>a₁ = <input type="number" id="plane1A" value="1" step="any" style="width:70px;"></div>
                    <div>b₁ = <input type="number" id="plane1B" value="1" step="any" style="width:70px;"></div>
                    <div>c₁ = <input type="number" id="plane1C" value="-2" step="any" style="width:70px;"></div>
                    <div>d₁ = <input type="number" id="plane1D" value="1" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Plane 2: a₂x + b₂y + c₂z + d₂ = 0</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>a₂ = <input type="number" id="plane2A" value="2" step="any" style="width:70px;"></div>
                    <div>b₂ = <input type="number" id="plane2B" value="-1" step="any" style="width:70px;"></div>
                    <div>c₂ = <input type="number" id="plane2C" value="1" step="any" style="width:70px;"></div>
                    <div>d₂ = <input type="number" id="plane2D" value="0" step="any" style="width:70px;"></div>
                </div>
                <div style="font-size:0.85rem; margin-top:5px;">Example: Two non-parallel planes intersecting in a line</div>
            </div>
        </div>

        <div class="graph-container" style="height: 400px;">
            <div id="threeDGraph" style="width:100%; height:100%;"></div>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computePlaneIntersectionBtn">
            <span>📐🔀</span> Find Intersection Line
        </button>
        
        <div class="result-highlight" id="planeIntersectionResult">
            \\( \\text{Line: } \\frac{x - x_0}{a} = \\frac{y - y_0}{b} = \\frac{z - z_0}{c} \\)
        </div>
        <div class="footnote">
            <strong>Intersection of Two Planes:</strong> When two non-parallel planes intersect, they form a straight line.<br>
            • Direction vector = cross product of normal vectors<br>
            • Find one point on the line by solving the plane equations<br>
            • The line can be expressed in symmetric or parametric form
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    setTimeout(() => {
        init3DScene();
        
        const a1 = document.getElementById('plane1A');
        const b1 = document.getElementById('plane1B');
        const c1 = document.getElementById('plane1C');
        const d1 = document.getElementById('plane1D');
        const a2 = document.getElementById('plane2A');
        const b2 = document.getElementById('plane2B');
        const c2 = document.getElementById('plane2C');
        const d2 = document.getElementById('plane2D');
        const compute = document.getElementById('computePlaneIntersectionBtn');
        const stepsDiv = document.getElementById('stepsContainer');
        const resultDiv = document.getElementById('planeIntersectionResult');
        
        function update() {
            try {
                const n1x = parseFloat(a1.value);
                const n1y = parseFloat(b1.value);
                const n1z = parseFloat(c1.value);
                const d1v = parseFloat(d1.value);
                const n2x = parseFloat(a2.value);
                const n2y = parseFloat(b2.value);
                const n2z = parseFloat(c2.value);
                const d2v = parseFloat(d2.value);
                
                if (isNaN(n1x) || isNaN(n1y) || isNaN(n1z) || isNaN(d1v) ||
                    isNaN(n2x) || isNaN(n2y) || isNaN(n2z) || isNaN(d2v)) {
                    throw new Error('Please enter valid numbers');
                }
                
                // Check if planes are parallel
                const crossX = n1y * n2z - n1z * n2y;
                const crossY = n1z * n2x - n1x * n2z;
                const crossZ = n1x * n2y - n1y * n2x;
                const crossMag = Math.sqrt(crossX*crossX + crossY*crossY + crossZ*crossZ);
                
                if (crossMag < 1e-10) {
                    stepsDiv.innerHTML = `
                        <div class="step-row">
                            <span class="step-marker">⚠️</span>
                            <span class="step-text">The planes are PARALLEL or COINCIDENT. They do not intersect in a line.</span>
                        </div>
                    `;
                    resultDiv.innerHTML = `\\( \\text{Planes are parallel - no intersection line} \\)`;
                    return;
                }
                
                // Direction vector = cross product of normals
                const dirX = crossX;
                const dirY = crossY;
                const dirZ = crossZ;
                
                // Find a point on the line
                // Solve system: a1x + b1y + c1z = -d1, a2x + b2y + c2z = -d2
                // Set z = 0 for simplicity (if possible)
                let pointX, pointY, pointZ = 0;
                
                const det = n1x * n2y - n2x * n1y;
                if (Math.abs(det) > 1e-10) {
                    pointX = ((-d1v) * n2y - (-d2v) * n1y) / det;
                    pointY = (n1x * (-d2v) - n2x * (-d1v)) / det;
                } else {
                    // Try setting y = 0
                    const det2 = n1x * n2z - n2x * n1z;
                    if (Math.abs(det2) > 1e-10) {
                        pointX = ((-d1v) * n2z - (-d2v) * n1z) / det2;
                        pointZ = (n1x * (-d2v) - n2x * (-d1v)) / det2;
                        pointY = 0;
                    } else {
                        // Set x = 0
                        const det3 = n1y * n2z - n2y * n1z;
                        pointY = ((-d1v) * n2z - (-d2v) * n1z) / det3;
                        pointZ = (n1y * (-d2v) - n2y * (-d1v)) / det3;
                        pointX = 0;
                    }
                }
                
                // Normalize direction vector
                const mag = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
                const unitDir = { x: dirX/mag, y: dirY/mag, z: dirZ/mag };
                
                // Clear previous objects
                clear3DObjects();
                
                // Draw the line through the point in both directions
                const lineLength = 6;
                const lineStart = {
                    x: pointX - unitDir.x * lineLength,
                    y: pointY - unitDir.y * lineLength,
                    z: pointZ - unitDir.z * lineLength
                };
                const lineEnd = {
                    x: pointX + unitDir.x * lineLength,
                    y: pointY + unitDir.y * lineLength,
                    z: pointZ + unitDir.z * lineLength
                };
                
                add3DLine(lineStart, lineEnd, '#d44c2f', 3);
                add3DPoint(pointX, pointY, pointZ, '#d44c2f', 'Point on line', 0.2);
                add3DArrow({x: pointX, y: pointY, z: pointZ}, unitDir, '#d44c2f', 2);
                
                // Add coordinate axes
                add3DArrow({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 1, z: 0}, '#e67e22', 5);
                add3DArrow({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, '#e67e22', 5);
                
                // Generate steps
                const steps = [
                    `① Plane 1: ${fmt(n1x)}x + ${fmt(n1y)}y + ${fmt(n1z)}z + ${fmt(d1v)} = 0`,
                    `   Normal vector n₁ = (${fmt(n1x)}, ${fmt(n1y)}, ${fmt(n1z)})`,
                    `② Plane 2: ${fmt(n2x)}x + ${fmt(n2y)}y + ${fmt(n2z)}z + ${fmt(d2v)} = 0`,
                    `   Normal vector n₂ = (${fmt(n2x)}, ${fmt(n2y)}, ${fmt(n2z)})`,
                    `③ Direction vector = n₁ × n₂ =`,
                    `   = (${fmt(n1y)}·${fmt(n2z)} - ${fmt(n1z)}·${fmt(n2y)}, ` +
                      `${fmt(n1z)}·${fmt(n2x)} - ${fmt(n1x)}·${fmt(n2z)}, ` +
                      `${fmt(n1x)}·${fmt(n2y)} - ${fmt(n1y)}·${fmt(n2x)})`,
                    `   = (${fmt(dirX)}, ${fmt(dirY)}, ${fmt(dirZ)})`,
                    `④ Magnitude of direction vector = ${fmt(mag)}`,
                    `⑤ Unit direction = (${fmt(unitDir.x)}, ${fmt(unitDir.y)}, ${fmt(unitDir.z)})`,
                    `⑥ Find a point on the line: Solve plane equations with z = 0 (or other assumption)`,
                    `   • Point P₀ = (${fmt(pointX)}, ${fmt(pointY)}, ${fmt(pointZ)})`,
                    `⑦ Symmetric form of the line:`,
                    `   \\[ \\frac{x - ${fmt(pointX)}}{${fmt(unitDir.x)}} = \\frac{y - ${fmt(pointY)}}{${fmt(unitDir.y)}} = \\frac{z - ${fmt(pointZ)}}{${fmt(unitDir.z)}} \\]`,
                    `⑧ Parametric form:`,
                    `   • x = ${fmt(pointX)} + ${fmt(unitDir.x)}t`,
                    `   • y = ${fmt(pointY)} + ${fmt(unitDir.y)}t`,
                    `   • z = ${fmt(pointZ)} + ${fmt(unitDir.z)}t`
                ];
                
                stepsDiv.innerHTML = steps.map((txt, i) => 
                    `<div class="step-row">
                        <span class="step-marker">${i+1}</span>
                        <span class="step-text" style="white-space: pre-line;">${txt}</span>
                    </div>`
                ).join('');
                
                resultDiv.innerHTML = `\\( \\frac{x - ${fmt(pointX)}}{${fmt(unitDir.x)}} = \\frac{y - ${fmt(pointY)}}{${fmt(unitDir.y)}} = \\frac{z - ${fmt(pointZ)}}{${fmt(unitDir.z)}} \\)`;
                
                if (typeof renderLatex === 'function') renderLatex();
                if (typeof attachStepsToggle === 'function') attachStepsToggle();
                
            } catch (e) {
                console.error('Error:', e);
                showError(e.message);
            }
        }
        
        compute.addEventListener('click', update);
        [a1, b1, c1, d1, a2, b2, c2, d2].forEach(inp => 
            inp.addEventListener('keypress', e => e.key === 'Enter' && update())
        );
        
        update();
        if (typeof attachStepsToggle === 'function') attachStepsToggle();
    }, 100);
}

/**
 * Renders the Optimization: Max/Min Distance Problems Card
 */
function renderOptimizationDistanceCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>📈📏</span> Optimization: Max/Min Distance Problems</h2>
        
        <div class="formula-badge">
            \\( \\text{Find the maximum or minimum distance from a point to a curve or between moving points} \\)
        </div>
        <div class="formula-badge" style="background: #fff3cd;">
            \\( \\text{Method: Use calculus (derivatives) or geometric properties} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Select Problem Type</label>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <label><input type="radio" name="optType" value="pointToLine" checked> Point to Line: Minimum distance</label>
                    <label><input type="radio" name="optType" value="pointToCircle"> Point to Circle: Min/Max distance</label>
                    <label><input type="radio" name="optType" value="movingPoints"> Two Moving Points on Lines</label>
                </div>
            </div>
            
            <div id="optPointLineInput" class="point-box" style="width:100%; margin-top:15px;">
                <label>Point P(x₀, y₀)</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>x₀ = <input type="number" id="optPx" value="3" step="any" style="width:70px;"></div>
                    <div>y₀ = <input type="number" id="optPy" value="4" step="any" style="width:70px;"></div>
                </div>
                
                <label style="margin-top:15px;">Line L: ax + by + c = 0</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>a = <input type="number" id="optLineA" value="3" step="any" style="width:70px;"></div>
                    <div>b = <input type="number" id="optLineB" value="4" step="any" style="width:70px;"></div>
                    <div>c = <input type="number" id="optLineC" value="0" step="any" style="width:70px;"></div>
                </div>
            </div>
            
            <div id="optPointCircleInput" style="display:none; width:100%; margin-top:15px;">
                <div class="point-box">
                    <label>Point Q(x₁, y₁)</label>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                        <div>x₁ = <input type="number" id="optQx" value="5" step="any" style="width:70px;"></div>
                        <div>y₁ = <input type="number" id="optQy" value="5" step="any" style="width:70px;"></div>
                    </div>
                    
                    <label style="margin-top:15px;">Circle: (x - h)² + (y - k)² = r²</label>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                        <div>h = <input type="number" id="optCircleH" value="0" step="any" style="width:70px;"></div>
                        <div>k = <input type="number" id="optCircleK" value="0" step="any" style="width:70px;"></div>
                        <div>r = <input type="number" id="optCircleR" value="2" step="any" style="width:70px;"></div>
                    </div>
                </div>
            </div>
            
            <div id="optMovingPointsInput" style="display:none; width:100%; margin-top:15px;">
                <div class="point-box">
                    <label>Point A moves on Line L₁</label>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                        <div>L₁: a₁x + b₁y + c₁ = 0</div>
                        <div>a₁ = <input type="number" id="optL1A" value="1" step="any" style="width:60px;"></div>
                        <div>b₁ = <input type="number" id="optL1B" value="0" step="any" style="width:60px;"></div>
                        <div>c₁ = <input type="number" id="optL1C" value="0" step="any" style="width:60px;"></div>
                    </div>
                    
                    <label style="margin-top:15px;">Point B moves on Line L₂</label>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                        <div>L₂: a₂x + b₂y + c₂ = 0</div>
                        <div>a₂ = <input type="number" id="optL2A" value="0" step="any" style="width:60px;"></div>
                        <div>b₂ = <input type="number" id="optL2B" value="1" step="any" style="width:60px;"></div>
                        <div>c₂ = <input type="number" id="optL2C" value="0" step="any" style="width:60px;"></div>
                    </div>
                    <div style="font-size:0.85rem; margin-top:5px;">Find minimum distance between points on these lines</div>
                </div>
            </div>
        </div>

        <div class="graph-container" style="height: 400px;">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeOptDistanceBtn">
            <span>📈📏</span> Find Min/Max Distance
        </button>
        
        <div class="result-highlight" id="optDistanceResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Optimization Problems:</strong> Use derivative to find critical points, or geometric properties:<br>
            • Minimum distance from point to line = perpendicular distance<br>
            • Min/Max distance from point to circle = |d ± r| where d = distance from point to center<br>
            • Minimum distance between two lines = distance between parallel lines or shortest distance between skew lines
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    // Get DOM references
    const typeRadios = document.getElementsByName('optType');
    const pointLineDiv = document.getElementById('optPointLineInput');
    const pointCircleDiv = document.getElementById('optPointCircleInput');
    const movingPointsDiv = document.getElementById('optMovingPointsInput');
    const compute = document.getElementById('computeOptDistanceBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('optDistanceResult');
    
    // Toggle input visibility
    for (let radio of typeRadios) {
        radio.addEventListener('change', function() {
            pointLineDiv.style.display = 'none';
            pointCircleDiv.style.display = 'none';
            movingPointsDiv.style.display = 'none';
            if (this.value === 'pointToLine') pointLineDiv.style.display = 'block';
            else if (this.value === 'pointToCircle') pointCircleDiv.style.display = 'block';
            else movingPointsDiv.style.display = 'block';
        });
    }
    
    function update() {
        try {
            let type = 'pointToLine';
            for (let radio of typeRadios) {
                if (radio.checked) {
                    type = radio.value;
                    break;
                }
            }
            
            let resultText = '';
            let steps = [];
            let datasets = [];
            
            if (type === 'pointToLine') {
                const px = parseFloat(document.getElementById('optPx').value);
                const py = parseFloat(document.getElementById('optPy').value);
                const a = parseFloat(document.getElementById('optLineA').value);
                const b = parseFloat(document.getElementById('optLineB').value);
                const c = parseFloat(document.getElementById('optLineC').value);
                
                const denominator = Math.sqrt(a*a + b*b);
                const distance = Math.abs(a*px + b*py + c) / denominator;
                
                // Find foot of perpendicular
                const t = (a*px + b*py + c) / (a*a + b*b);
                const footX = px - a * t;
                const footY = py - b * t;
                
                // Draw
                const minX = -8, maxX = 8;
                let linePoints;
                if (Math.abs(b) > 1e-10) {
                    linePoints = [
                        {x: minX, y: (-a*minX - c)/b},
                        {x: maxX, y: (-a*maxX - c)/b}
                    ];
                } else {
                    const xConst = -c/a;
                    linePoints = [
                        {x: xConst, y: minX},
                        {x: xConst, y: maxX}
                    ];
                }
                
                datasets = [
                    { label: 'Line', data: linePoints, borderColor: '#2c3e50', borderWidth: 2, pointRadius: 0, showLine: true, fill: false },
                    { label: 'Point P', data: [{x: px, y: py}], backgroundColor: '#d44c2f', pointRadius: 10, showLine: false },
                    { label: 'Foot (closest point)', data: [{x: footX, y: footY}], backgroundColor: '#1f7f6a', pointRadius: 8, showLine: false },
                    { label: 'Perpendicular', data: [{x: px, y: py}, {x: footX, y: footY}], borderColor: '#d44c2f', borderDash: [5,3], pointRadius: 0, showLine: true, fill: false }
                ];
                
                steps = [
                    `① Point P(${fmt(px)}, ${fmt(py)})`,
                    `② Line L: ${fmt(a)}x + ${fmt(b)}y + ${fmt(c)} = 0`,
                    `③ Distance formula: d = |ax₀ + by₀ + c| / √(a² + b²)`,
                    `   • Numerator = |${fmt(a)}·${fmt(px)} + ${fmt(b)}·${fmt(py)} + ${fmt(c)}| = |${fmt(a*px + b*py + c)}| = ${fmt(Math.abs(a*px + b*py + c))}`,
                    `   • Denominator = √(${fmt(a*a)} + ${fmt(b*b)}) = ${fmt(denominator)}`,
                    `④ Minimum distance = ${fmt(distance)}`,
                    `⑤ This occurs at the foot of perpendicular: (${fmt(footX)}, ${fmt(footY)})`
                ];
                
                resultText = `\\text{Minimum distance} = ${fmt(distance)}`;
                
            } else if (type === 'pointToCircle') {
                const qx = parseFloat(document.getElementById('optQx').value);
                const qy = parseFloat(document.getElementById('optQy').value);
                const h = parseFloat(document.getElementById('optCircleH').value);
                const k = parseFloat(document.getElementById('optCircleK').value);
                const r = parseFloat(document.getElementById('optCircleR').value);
                
                const centerDist = Math.sqrt((qx - h)*(qx - h) + (qy - k)*(qy - k));
                const minDist = Math.max(0, centerDist - r);
                const maxDist = centerDist + r;
                
                // Generate circle points
                const circlePoints = [];
                for (let t = 0; t <= 2*Math.PI; t += 0.05) {
                    circlePoints.push({x: h + r * Math.cos(t), y: k + r * Math.sin(t)});
                }
                
                // Find closest and farthest points on circle
                const angle = Math.atan2(qy - k, qx - h);
                const closestPoint = {x: h + r * Math.cos(angle), y: k + r * Math.sin(angle)};
                const farthestPoint = {x: h - r * Math.cos(angle), y: k - r * Math.sin(angle)};
                
                datasets = [
                    { label: 'Circle', data: circlePoints, borderColor: '#2c3e50', borderWidth: 2, pointRadius: 0, showLine: true, fill: false },
                    { label: 'Point Q', data: [{x: qx, y: qy}], backgroundColor: '#d44c2f', pointRadius: 10, showLine: false },
                    { label: 'Center', data: [{x: h, y: k}], backgroundColor: '#1f7f6a', pointRadius: 6, showLine: false },
                    { label: 'Closest point', data: [closestPoint], backgroundColor: '#27ae60', pointRadius: 8, showLine: false },
                    { label: 'Farthest point', data: [farthestPoint], backgroundColor: '#e67e22', pointRadius: 8, showLine: false }
                ];
                
                steps = [
                    `① Point Q(${fmt(qx)}, ${fmt(qy)})`,
                    `② Circle: Center C(${fmt(h)}, ${fmt(k)}), radius r = ${fmt(r)}`,
                    `③ Distance from Q to center: d = √[(${fmt(qx)} - ${fmt(h)})² + (${fmt(qy)} - ${fmt(k)})²] = ${fmt(centerDist)}`,
                    `④ Minimum distance = |d - r| = |${fmt(centerDist)} - ${fmt(r)}| = ${fmt(minDist)}`,
                    `⑤ Maximum distance = d + r = ${fmt(centerDist)} + ${fmt(r)} = ${fmt(maxDist)}`,
                    `⑥ Closest point is along the line from center to Q: (${fmt(closestPoint.x)}, ${fmt(closestPoint.y)})`,
                    `⑦ Farthest point is in opposite direction: (${fmt(farthestPoint.x)}, ${fmt(farthestPoint.y)})`
                ];
                
                resultText = `\\text{Min distance} = ${fmt(minDist)},\\ \\text{Max distance} = ${fmt(maxDist)}`;
                
            } else {
                const a1 = parseFloat(document.getElementById('optL1A').value);
                const b1 = parseFloat(document.getElementById('optL1B').value);
                const c1 = parseFloat(document.getElementById('optL1C').value);
                const a2 = parseFloat(document.getElementById('optL2A').value);
                const b2 = parseFloat(document.getElementById('optL2B').value);
                const c2 = parseFloat(document.getElementById('optL2C').value);
                
                // Check if lines are parallel
                const det = a1 * b2 - a2 * b1;
                const areParallel = Math.abs(det) < 1e-10;
                
                let distance;
                if (areParallel) {
                    const norm = Math.sqrt(a1*a1 + b1*b1);
                    distance = Math.abs(c1 - c2) / norm;
                    steps = [
                        `① Lines are PARALLEL`,
                        `   L₁: ${fmt(a1)}x + ${fmt(b1)}y + ${fmt(c1)} = 0`,
                        `   L₂: ${fmt(a2)}x + ${fmt(b2)}y + ${fmt(c2)} = 0`,
                        `② Distance between parallel lines = |c₁ - c₂| / √(a₁² + b₁²)`,
                        `   = |${fmt(c1)} - ${fmt(c2)}| / √(${fmt(a1*a1)} + ${fmt(b1*b1)})`,
                        `   = ${fmt(Math.abs(c1 - c2))} / ${fmt(Math.sqrt(a1*a1 + b1*b1))} = ${fmt(distance)}`
                    ];
                    resultText = `\\text{Minimum distance} = ${fmt(distance)}`;
                } else {
                    // Intersecting lines - minimum distance is 0
                    distance = 0;
                    steps = [
                        `① Lines are NOT parallel (they intersect)`,
                        `   L₁: ${fmt(a1)}x + ${fmt(b1)}y + ${fmt(c1)} = 0`,
                        `   L₂: ${fmt(a2)}x + ${fmt(b2)}y + ${fmt(c2)} = 0`,
                        `② Since the lines intersect, the minimum distance between points on the lines is 0`,
                        `③ The minimum occurs at the intersection point`
                    ];
                    resultText = `\\text{Minimum distance} = 0 \\text{ (lines intersect)}`;
                }
                
                // Draw lines
                const minX = -8, maxX = 8;
                let ptsL1, ptsL2;
                if (Math.abs(b1) > 1e-10) {
                    ptsL1 = [{x: minX, y: (-a1*minX - c1)/b1}, {x: maxX, y: (-a1*maxX - c1)/b1}];
                } else {
                    const xConst = -c1/a1;
                    ptsL1 = [{x: xConst, y: minX}, {x: xConst, y: maxX}];
                }
                if (Math.abs(b2) > 1e-10) {
                    ptsL2 = [{x: minX, y: (-a2*minX - c2)/b2}, {x: maxX, y: (-a2*maxX - c2)/b2}];
                } else {
                    const xConst = -c2/a2;
                    ptsL2 = [{x: xConst, y: minX}, {x: xConst, y: maxX}];
                }
                
                datasets = [
                    { label: 'Line L₁', data: ptsL1, borderColor: '#d44c2f', borderWidth: 2, pointRadius: 0, showLine: true, fill: false },
                    { label: 'Line L₂', data: ptsL2, borderColor: '#1f7f6a', borderWidth: 2, pointRadius: 0, showLine: true, fill: false }
                ];
            }
            
            // Draw graph
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
                        x: { min: -8, max: 8, grid: { color: '#cbd5e1' } },
                        y: { min: -8, max: 8, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( ${resultText} \\)`;
            
            if (typeof renderLatex === 'function') renderLatex();
            if (typeof attachStepsToggle === 'function') attachStepsToggle();
            
        } catch (e) {
            console.error('Error:', e);
            showError(e.message);
        }
    }
    
    compute.addEventListener('click', update);
    setTimeout(() => { update(); attachStepsToggle(); }, 100);
}

/**
 * Renders the Linear Programming (Graphical) Card
 */
function renderLinearProgrammingCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>📊🔷</span> Linear Programming (Graphical Method)</h2>
        
        <div class="formula-badge">
            \\( \\text{Maximize/Minimize } Z = c_1x + c_2y \\)
        </div>
        <div class="formula-badge" style="background: #fff3cd;">
            \\( \\text{Subject to linear constraints: } a_{i}x + b_{i}y \\leq d_i \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:700px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Objective Function</label>
                <div style="display:flex; gap:15px; justify-content:center;">
                    <div>Z = <input type="number" id="objC1" value="3" step="any" style="width:70px;"> x + 
                          <input type="number" id="objC2" value="2" step="any" style="width:70px;"> y</div>
                    <div>
                        <label><input type="radio" name="optDirection" value="max" checked> Maximize</label>
                        <label><input type="radio" name="optDirection" value="min"> Minimize</label>
                    </div>
                </div>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Constraints (each in form: a₁x + b₁y ≤ c₁)</label>
                <div id="constraintsContainer">
                    <div class="constraint-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <input type="number" class="constraintA" value="1" step="any" style="width:60px;"> x +
                        <input type="number" class="constraintB" value="1" step="any" style="width:60px;"> y ≤
                        <input type="number" class="constraintC" value="10" step="any" style="width:70px;">
                        <button class="removeConstraint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="constraint-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <input type="number" class="constraintA" value="2" step="any" style="width:60px;"> x +
                        <input type="number" class="constraintB" value="1" step="any" style="width:60px;"> y ≤
                        <input type="number" class="constraintC" value="15" step="any" style="width:70px;">
                        <button class="removeConstraint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="constraint-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <input type="number" class="constraintA" value="0" step="any" style="width:60px;"> x +
                        <input type="number" class="constraintB" value="1" step="any" style="width:60px;"> y ≤
                        <input type="number" class="constraintC" value="8" step="any" style="width:70px;">
                        <button class="removeConstraint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="constraint-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <input type="number" class="constraintA" value="1" step="any" style="width:60px;"> x +
                        <input type="number" class="constraintB" value="0" step="any" style="width:60px;"> y ≤
                        <input type="number" class="constraintC" value="6" step="any" style="width:70px;">
                        <button class="removeConstraint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="constraint-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <label>Non-negativity: x ≥ 0, y ≥ 0 (always included)</label>
                    </div>
                </div>
                <button id="addConstraintBtn" style="margin-top:10px; background:#1f5f96; color:white; border:none; border-radius:30px; padding:8px 20px;">+ Add Constraint</button>
            </div>
        </div>

        <div class="graph-container" style="height: 400px;">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeLPBtn">
            <span>📊🔷</span> Solve Linear Program
        </button>
        
        <div class="result-highlight" id="lpResult">
            \\( \\text{Optimal solution will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Linear Programming (Graphical Method):</strong><br>
            • Plot all constraints as lines<br>
            • Identify the feasible region (intersection of half-planes)<br>
            • Evaluate objective function at corner points<br>
            • Optimal solution occurs at a vertex of the feasible region
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    // Add constraint functionality
    const constraintsContainer = document.getElementById('constraintsContainer');
    const addBtn = document.getElementById('addConstraintBtn');
    
    function addConstraintRow(aVal = 1, bVal = 1, cVal = 10) {
        const row = document.createElement('div');
        row.className = 'constraint-row';
        row.style.cssText = 'display:flex; gap:10px; margin-bottom:8px; justify-content:center;';
        row.innerHTML = `
            <input type="number" class="constraintA" value="${aVal}" step="any" style="width:60px;"> x +
            <input type="number" class="constraintB" value="${bVal}" step="any" style="width:60px;"> y ≤
            <input type="number" class="constraintC" value="${cVal}" step="any" style="width:70px;">
            <button class="removeConstraint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
        `;
        const removeBtn = row.querySelector('.removeConstraint');
        removeBtn.addEventListener('click', () => row.remove());
        constraintsContainer.insertBefore(row, constraintsContainer.lastElementChild);
    }
    
    addBtn.addEventListener('click', () => addConstraintRow());
    
    const computeBtn = document.getElementById('computeLPBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('lpResult');
    
    function update() {
        try {
            const c1 = parseFloat(document.getElementById('objC1').value);
            const c2 = parseFloat(document.getElementById('objC2').value);
            
            let direction = 'max';
            for (let radio of document.getElementsByName('optDirection')) {
                if (radio.checked) direction = radio.value;
            }
            
            // Gather constraints
            const constraints = [];
            const rows = document.querySelectorAll('.constraint-row');
            for (let row of rows) {
                const a = parseFloat(row.querySelector('.constraintA').value);
                const b = parseFloat(row.querySelector('.constraintB').value);
                const c = parseFloat(row.querySelector('.constraintC').value);
                if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
                    constraints.push({ a, b, c });
                }
            }
            
            // Add non-negativity constraints: x >= 0, y >= 0
            // These are handled by checking feasible points
            
            // Find corner points by solving pairs of equations
            const cornerPoints = [];
            
            // Add origin
            cornerPoints.push({ x: 0, y: 0 });
            
            // Intersections with axes for each constraint
            constraints.forEach(constraint => {
                if (Math.abs(constraint.a) > 1e-10) {
                    const xIntercept = constraint.c / constraint.a;
                    if (xIntercept >= 0) cornerPoints.push({ x: xIntercept, y: 0 });
                }
                if (Math.abs(constraint.b) > 1e-10) {
                    const yIntercept = constraint.c / constraint.b;
                    if (yIntercept >= 0) cornerPoints.push({ x: 0, y: yIntercept });
                }
            });
            
            // Intersections of each pair of constraints
            for (let i = 0; i < constraints.length; i++) {
                for (let j = i + 1; j < constraints.length; j++) {
                    const c1c = constraints[i];
                    const c2c = constraints[j];
                    const det = c1c.a * c2c.b - c2c.a * c1c.b;
                    if (Math.abs(det) > 1e-10) {
                        const x = (c1c.c * c2c.b - c2c.c * c1c.b) / det;
                        const y = (c1c.a * c2c.c - c2c.a * c1c.c) / det;
                        if (x >= 0 && y >= 0) cornerPoints.push({ x, y });
                    }
                }
            }
            
            // Filter points that satisfy all constraints
            const feasiblePoints = cornerPoints.filter(point => {
                for (let constraint of constraints) {
                    if (constraint.a * point.x + constraint.b * point.y > constraint.c + 1e-8) return false;
                }
                return point.x >= -1e-8 && point.y >= -1e-8;
            });
            
            // Remove duplicates
            const uniquePoints = [];
            feasiblePoints.forEach(point => {
                let duplicate = false;
                for (let p of uniquePoints) {
                    if (Math.abs(p.x - point.x) < 1e-8 && Math.abs(p.y - point.y) < 1e-8) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) uniquePoints.push(point);
            });
            
            // Evaluate objective at each corner
            let optimalPoint = null;
            let optimalValue = direction === 'max' ? -Infinity : Infinity;
            
            uniquePoints.forEach(point => {
                const value = c1 * point.x + c2 * point.y;
                if (direction === 'max' && value > optimalValue) {
                    optimalValue = value;
                    optimalPoint = point;
                } else if (direction === 'min' && value < optimalValue) {
                    optimalValue = value;
                    optimalPoint = point;
                }
            });
            
            // Draw feasible region and constraints
            const datasets = [];
            const colors = ['#d44c2f', '#1f7f6a', '#ca8a04', '#2b5797', '#e67e22'];
            
            // Draw each constraint line
            const minX = -1, maxX = 12, minY = -1, maxY = 12;
            constraints.forEach((constraint, idx) => {
                let points;
                if (Math.abs(constraint.b) > 1e-10) {
                    points = [
                        { x: minX, y: (constraint.c - constraint.a * minX) / constraint.b },
                        { x: maxX, y: (constraint.c - constraint.a * maxX) / constraint.b }
                    ];
                } else {
                    const xConst = constraint.c / constraint.a;
                    points = [
                        { x: xConst, y: minY },
                        { x: xConst, y: maxY }
                    ];
                }
                datasets.push({
                    label: `${fmt(constraint.a)}x + ${fmt(constraint.b)}y ≤ ${fmt(constraint.c)}`,
                    data: points,
                    borderColor: colors[idx % colors.length],
                    borderWidth: 1.5,
                    pointRadius: 0,
                    showLine: true,
                    fill: false
                });
            });
            
            // Draw feasible region points
            datasets.push({
                label: 'Feasible region vertices',
                data: uniquePoints,
                backgroundColor: '#2c3e50',
                pointRadius: 6,
                pointStyle: 'circle',
                showLine: false
            });
            
            // Draw optimal point
            if (optimalPoint) {
                datasets.push({
                    label: 'Optimal solution',
                    data: [optimalPoint],
                    backgroundColor: '#27ae60',
                    pointRadius: 12,
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
                        x: { min: -1, max: 12, grid: { color: '#cbd5e1' }, title: { display: true, text: 'x' } },
                        y: { min: -1, max: 12, grid: { color: '#cbd5e1' }, title: { display: true, text: 'y' } }
                    }
                }
            });
            
            // Generate steps
            const steps = [
                `① Objective function: ${direction === 'max' ? 'Maximize' : 'Minimize'} Z = ${fmt(c1)}x + ${fmt(c2)}y`,
                `② Constraints:`,
                ...constraints.map(c => `   • ${fmt(c.a)}x + ${fmt(c.b)}y ≤ ${fmt(c.c)}`),
                `   • x ≥ 0, y ≥ 0 (non-negativity)`,
                `③ Plot all constraint lines on the graph`,
                `④ Identify feasible region (intersection of all half-planes)`,
                `⑤ Find vertices (corner points) of feasible region:`,
                ...uniquePoints.map(p => `   • (${fmt(p.x)}, ${fmt(p.y)})`),
                `⑥ Evaluate objective at each vertex:`,
                ...uniquePoints.map(p => `   • Z = ${fmt(c1)}·${fmt(p.x)} + ${fmt(c2)}·${fmt(p.y)} = ${fmt(c1*p.x + c2*p.y)}`),
                `⑦ Optimal solution:`,
                optimalPoint ? `   • Point (${fmt(optimalPoint.x)}, ${fmt(optimalPoint.y)}) with Z = ${fmt(optimalValue)}` : '   • No feasible solution found'
            ];
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = optimalPoint ? 
                `\\( \\text{Optimal: } (${fmt(optimalPoint.x)}, ${fmt(optimalPoint.y)}), \\ Z = ${fmt(optimalValue)} \\)` :
                `\\( \\text{No feasible solution found} \\)`;
            
            if (typeof renderLatex === 'function') renderLatex();
            if (typeof attachStepsToggle === 'function') attachStepsToggle();
            
        } catch (e) {
            console.error('Error:', e);
            showError(e.message);
        }
    }
    
    computeBtn.addEventListener('click', update);
    setTimeout(() => { update(); attachStepsToggle(); }, 100);
}

/**
 * Renders the Regression Line (Least Squares Fit) Card
 */
function renderRegressionLineCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>📈📊</span> Regression Line (Least Squares Fit)</h2>
        
        <div class="formula-badge">
            \\( \\text{Find the line } y = mx + b \\text{ that best fits given data points} \\)
        </div>
        <div class="formula-badge" style="background: #fff3cd;">
            \\( m = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^2 - (\\sum x)^2}, \\quad b = \\frac{\\sum y - m\\sum x}{n} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:600px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Data Points (x, y)</label>
                <div id="dataPointsContainer">
                    <div class="data-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <span>(</span><input type="number" class="dataX" value="1" step="any" style="width:60px;">,
                        <input type="number" class="dataY" value="2" step="any" style="width:60px;"><span>)</span>
                        <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="data-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <span>(</span><input type="number" class="dataX" value="2" step="any" style="width:60px;">,
                        <input type="number" class="dataY" value="3" step="any" style="width:60px;"><span>)</span>
                        <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="data-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <span>(</span><input type="number" class="dataX" value="3" step="any" style="width:60px;">,
                        <input type="number" class="dataY" value="4" step="any" style="width:60px;"><span>)</span>
                        <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="data-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <span>(</span><input type="number" class="dataX" value="4" step="any" style="width:60px;">,
                        <input type="number" class="dataY" value="5" step="any" style="width:60px;"><span>)</span>
                        <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                    <div class="data-row" style="display:flex; gap:10px; margin-bottom:8px; justify-content:center;">
                        <span>(</span><input type="number" class="dataX" value="5" step="any" style="width:60px;">,
                        <input type="number" class="dataY" value="5" step="any" style="width:60px;"><span>)</span>
                        <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
                    </div>
                </div>
                <button id="addDataPointBtn" style="margin-top:10px; background:#1f5f96; color:white; border:none; border-radius:30px; padding:8px 20px;">+ Add Data Point</button>
            </div>
            
            <div class="point-box" style="width:100%; margin-top:15px;">
                <label>Test Point (optional)</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>x = <input type="number" id="testRegX" value="3.5" step="any" style="width:80px;"></div>
                    <div>y = <input type="number" id="testRegY" value="0" step="any" style="width:80px;"></div>
                    <button id="predictBtn" style="background:#27ae60; color:white; border:none; border-radius:30px; padding:5px 15px;">Predict y from x</button>
                </div>
            </div>
        </div>

        <div class="graph-container" style="height: 400px;">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeRegressionBtn">
            <span>📈📊</span> Calculate Regression Line
        </button>
        
        <div class="result-highlight" id="regressionResult">
            \\( y = mx + b \\)
        </div>
        <div class="footnote">
            <strong>Least Squares Regression:</strong> Minimizes the sum of squared vertical distances between data points and the line.<br>
            • Correlation coefficient r measures strength of linear relationship<br>
            • r² is the coefficient of determination (proportion of variance explained)
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    // Add data point functionality
    const dataContainer = document.getElementById('dataPointsContainer');
    const addDataBtn = document.getElementById('addDataPointBtn');
    
    function addDataRow(xVal = 0, yVal = 0) {
        const row = document.createElement('div');
        row.className = 'data-row';
        row.style.cssText = 'display:flex; gap:10px; margin-bottom:8px; justify-content:center;';
        row.innerHTML = `
            <span>(</span><input type="number" class="dataX" value="${xVal}" step="any" style="width:60px;">,
            <input type="number" class="dataY" value="${yVal}" step="any" style="width:60px;"><span>)</span>
            <button class="removeDataPoint" style="background:#dc3545; color:white; border:none; border-radius:20px; padding:2px 8px;">✖</button>
        `;
        const removeBtn = row.querySelector('.removeDataPoint');
        removeBtn.addEventListener('click', () => row.remove());
        dataContainer.appendChild(row);
    }
    
    addDataBtn.addEventListener('click', () => addDataRow());
    
    const computeBtn = document.getElementById('computeRegressionBtn');
    const predictBtn = document.getElementById('predictBtn');
    const testXInp = document.getElementById('testRegX');
    const testYInp = document.getElementById('testRegY');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('regressionResult');
    
    function update() {
        try {
            // Collect data points
            const points = [];
            const rows = document.querySelectorAll('.data-row');
            for (let row of rows) {
                const x = parseFloat(row.querySelector('.dataX').value);
                const y = parseFloat(row.querySelector('.dataY').value);
                if (!isNaN(x) && !isNaN(y)) {
                    points.push({ x, y });
                }
            }
            
            if (points.length < 2) {
                resultDiv.innerHTML = `\\( \\text{Need at least 2 data points} \\)`;
                return;
            }
            
            const n = points.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            
            points.forEach(p => {
                sumX += p.x;
                sumY += p.y;
                sumXY += p.x * p.y;
                sumX2 += p.x * p.x;
            });
            
            const denominator = n * sumX2 - sumX * sumX;
            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;
            
            // Calculate correlation coefficient
            let sumY2 = 0;
            points.forEach(p => { sumY2 += p.y * p.y; });
            const numeratorR = n * sumXY - sumX * sumY;
            const denomR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            const r = numeratorR / denomR;
            
            // Draw points and regression line
            const minX = Math.min(...points.map(p => p.x), -1) - 1;
            const maxX = Math.max(...points.map(p => p.x), 8) + 1;
            const minY = Math.min(...points.map(p => p.y), -1) - 1;
            const maxY = Math.max(...points.map(p => p.y), 8) + 1;
            
            const linePoints = [
                { x: minX, y: slope * minX + intercept },
                { x: maxX, y: slope * maxX + intercept }
            ];
            
            const datasets = [
                {
                    label: 'Data Points',
                    data: points,
                    backgroundColor: '#d44c2f',
                    pointRadius: 8,
                    pointStyle: 'circle',
                    borderColor: 'white',
                    borderWidth: 1,
                    showLine: false
                },
                {
                    label: `Regression Line: y = ${fmt(slope)}x + ${fmt(intercept)}`,
                    data: linePoints,
                    borderColor: '#2c3e50',
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
                        x: { min: minX, max: maxX, grid: { color: '#cbd5e1' }, title: { display: true, text: 'x' } },
                        y: { min: minY, max: maxY, grid: { color: '#cbd5e1' }, title: { display: true, text: 'y' } }
                    }
                }
            });
            
            // Generate steps
            const steps = [
                `① Data points:`,
                ...points.map((p, i) => `   • (${fmt(p.x)}, ${fmt(p.y)})`),
                `② Calculate sums:`,
                `   • n = ${n}`,
                `   • Σx = ${fmt(sumX)}`,
                `   • Σy = ${fmt(sumY)}`,
                `   • Σxy = ${fmt(sumXY)}`,
                `   • Σx² = ${fmt(sumX2)}`,
                `③ Slope formula: m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)`,
                `   • Numerator = ${n}·${fmt(sumXY)} - ${fmt(sumX)}·${fmt(sumY)} = ${fmt(n*sumXY - sumX*sumY)}`,
                `   • Denominator = ${n}·${fmt(sumX2)} - (${fmt(sumX)})² = ${fmt(n*sumX2 - sumX*sumX)}`,
                `   • m = ${fmt((n*sumXY - sumX*sumY) / denominator)}`,
                `④ Intercept formula: b = (Σy - mΣx) / n`,
                `   • b = (${fmt(sumY)} - ${fmt(slope)}·${fmt(sumX)}) / ${n}`,
                `   • b = ${fmt(intercept)}`,
                `⑤ Regression line: y = ${fmt(slope)}x + ${fmt(intercept)}`,
                `⑥ Correlation coefficient r:`,
                `   • r = ${fmt(r)}`,
                `   • r² = ${fmt(r*r)} (${Math.round(r*r*100)}% of variance explained)`
            ];
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( y = ${fmt(slope)}x + ${fmt(intercept)} \\)<br>\\( r = ${fmt(r)} \\)`;
            
            // Prediction
            const testX = parseFloat(testXInp.value);
            if (!isNaN(testX)) {
                const predictedY = slope * testX + intercept;
                testYInp.value = fmt(predictedY);
            }
            
            if (typeof renderLatex === 'function') renderLatex();
            if (typeof attachStepsToggle === 'function') attachStepsToggle();
            
        } catch (e) {
            console.error('Error:', e);
            showError(e.message);
        }
    }
    
    computeBtn.addEventListener('click', update);
    predictBtn.addEventListener('click', update);
    setTimeout(() => { update(); attachStepsToggle(); }, 100);
}

/**
 * Renders the Computational Geometry: Line Algorithms Card
 */
function renderComputationalGeometryCard() {
    const mainCard = document.getElementById('mainCard');
    
    const html = `
        <h2 style="color:#113355;"><span>💻📐</span> Computational Geometry: Line Algorithms</h2>
        
        <div class="formula-badge">
            \\( \\text{Algorithms for line intersection, collinearity, and orientation checks} \\)
        </div>
        
        <div class="input-group" style="justify-content:center; flex-direction:column; max-width:800px; margin:0 auto;">
            <div class="point-box" style="width:100%;">
                <label>Select Algorithm</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <label><input type="radio" name="cgType" value="intersection" checked> Line Intersection</label>
                    <label><input type="radio" name="cgType" value="orientation"> Orientation Test</label>
                    <label><input type="radio" name="cgType" value="collinearity"> Collinearity Check</label>
                    <label><input type="radio" name="cgType" value="segments"> Segment Intersection</label>
                </div>
            </div>
            
            <div id="cgLineInput" class="point-box" style="width:100%; margin-top:15px;">
                <label>Line 1: Points P₁(x₁, y₁) and P₂(x₂, y₂)</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>P₁: (<input type="number" id="cgP1x" value="0" step="any" style="width:60px;">, 
                           <input type="number" id="cgP1y" value="0" step="any" style="width:60px;">)</div>
                    <div>P₂: (<input type="number" id="cgP2x" value="4" step="any" style="width:60px;">, 
                           <input type="number" id="cgP2y" value="4" step="any" style="width:60px;">)</div>
                </div>
                
                <label style="margin-top:15px;">Line 2: Points Q₁(x₃, y₃) and Q₂(x₄, y₄)</label>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <div>Q₁: (<input type="number" id="cgQ1x" value="0" step="any" style="width:60px;">, 
                           <input type="number" id="cgQ1y" value="4" step="any" style="width:60px;">)</div>
                    <div>Q₂: (<input type="number" id="cgQ2x" value="4" step="any" style="width:60px;">, 
                           <input type="number" id="cgQ2y" value="0" step="any" style="width:60px;">)</div>
                </div>
            </div>
            
            <div id="cgPointsInput" style="display:none; width:100%; margin-top:15px;">
                <div class="point-box">
                    <label>Three Points for Orientation/Collinearity</label>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                        <div>A: (<input type="number" id="cgAx" value="0" step="any" style="width:60px;">, 
                               <input type="number" id="cgAy" value="0" step="any" style="width:60px;">)</div>
                        <div>B: (<input type="number" id="cgBx" value="4" step="any" style="width:60px;">, 
                               <input type="number" id="cgBy" value="0" step="any" style="width:60px;">)</div>
                        <div>C: (<input type="number" id="cgCx" value="2" step="any" style="width:60px;">, 
                               <input type="number" id="cgCy" value="3" step="any" style="width:60px;">)</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="graph-container" style="height: 400px;">
            <canvas id="coordinateGraph"></canvas>
        </div>
        
        <div class="steps-header">
            <button class="toggle-steps-btn" id="toggleStepsBtn">🔎 Hide steps</button>
        </div>
        <div class="steps-container" id="stepsContainer"></div>
        
        <button class="calculate-btn" id="computeCGBtn">
            <span>💻📐</span> Run Algorithm
        </button>
        
        <div class="result-highlight" id="cgResult">
            \\( \\text{Result will appear here} \\)
        </div>
        <div class="footnote">
            <strong>Computational Geometry Algorithms:</strong><br>
            • Orientation: Returns clockwise, counterclockwise, or collinear<br>
            • Segment Intersection: Checks if two line segments intersect<br>
            • Collinearity: Checks if three points lie on a straight line<br>
            • Line Intersection: Finds intersection point of two infinite lines
        </div>
    `;
    
    mainCard.innerHTML = html;
    
    if (typeof renderLatex === 'function') renderLatex();
    else if (typeof window.renderLatex === 'function') window.renderLatex();
    
    // Get DOM references
    const typeRadios = document.getElementsByName('cgType');
    const lineInputDiv = document.getElementById('cgLineInput');
    const pointsInputDiv = document.getElementById('cgPointsInput');
    const computeBtn = document.getElementById('computeCGBtn');
    const stepsDiv = document.getElementById('stepsContainer');
    const resultDiv = document.getElementById('cgResult');
    
    // Toggle input visibility
    for (let radio of typeRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'intersection' || this.value === 'segments') {
                lineInputDiv.style.display = 'block';
                pointsInputDiv.style.display = 'none';
            } else {
                lineInputDiv.style.display = 'none';
                pointsInputDiv.style.display = 'block';
            }
        });
    }
    
    // Helper function for orientation
    function orientation(ax, ay, bx, by, cx, cy) {
        const val = (by - ay) * (cx - bx) - (bx - ax) * (cy - by);
        if (Math.abs(val) < 1e-10) return 0; // collinear
        return val > 0 ? 1 : 2; // 1 = clockwise, 2 = counterclockwise
    }
    
    function onSegment(ax, ay, bx, by, cx, cy) {
        return Math.min(ax, bx) <= cx + 1e-10 && cx <= Math.max(ax, bx) + 1e-10 &&
               Math.min(ay, by) <= cy + 1e-10 && cy <= Math.max(ay, by) + 1e-10;
    }
    
    function update() {
        try {
            let type = 'intersection';
            for (let radio of typeRadios) {
                if (radio.checked) {
                    type = radio.value;
                    break;
                }
            }
            
            let resultText = '';
            let steps = [];
            let datasets = [];
            
            if (type === 'intersection') {
                const p1x = parseFloat(document.getElementById('cgP1x').value);
                const p1y = parseFloat(document.getElementById('cgP1y').value);
                const p2x = parseFloat(document.getElementById('cgP2x').value);
                const p2y = parseFloat(document.getElementById('cgP2y').value);
                const q1x = parseFloat(document.getElementById('cgQ1x').value);
                const q1y = parseFloat(document.getElementById('cgQ1y').value);
                const q2x = parseFloat(document.getElementById('cgQ2x').value);
                const q2y = parseFloat(document.getElementById('cgQ2y').value);
                
                // Solve for intersection of two lines
                const a1 = p2y - p1y;
                const b1 = p1x - p2x;
                const c1 = a1 * p1x + b1 * p1y;
                
                const a2 = q2y - q1y;
                const b2 = q1x - q2x;
                const c2 = a2 * q1x + b2 * q1y;
                
                const det = a1 * b2 - a2 * b1;
                
                let intersectionPoint = null;
                if (Math.abs(det) < 1e-10) {
                    resultText = 'Lines are parallel or coincident';
                    steps = [
                        `① Line 1: through P₁(${fmt(p1x)}, ${fmt(p1y)}) and P₂(${fmt(p2x)}, ${fmt(p2y)})`,
                        `② Line 2: through Q₁(${fmt(q1x)}, ${fmt(q1y)}) and Q₂(${fmt(q2x)}, ${fmt(q2y)})`,
                        `③ Determinant Δ = a₁b₂ - a₂b₁ = ${fmt(det)}`,
                        `④ Since Δ ≈ 0, lines are PARALLEL (no intersection)`
                    ];
                } else {
                    const x = (c1 * b2 - c2 * b1) / det;
                    const y = (a1 * c2 - a2 * c1) / det;
                    intersectionPoint = { x, y };
                    resultText = `Intersection at (${fmt(x)}, ${fmt(y)})`;
                    steps = [
                        `① Line 1: through P₁(${fmt(p1x)}, ${fmt(p1y)}) and P₂(${fmt(p2x)}, ${fmt(p2y)})`,
                        `   Direction vector: (${fmt(p2x-p1x)}, ${fmt(p2y-p1y)})`,
                        `② Line 2: through Q₁(${fmt(q1x)}, ${fmt(q1y)}) and Q₂(${fmt(q2x)}, ${fmt(q2y)})`,
                        `   Direction vector: (${fmt(q2x-q1x)}, ${fmt(q2y-q1y)})`,
                        `③ Using line equations:`,
                        `   • a₁ = y₂ - y₁ = ${fmt(a1)}`,
                        `   • b₁ = x₁ - x₂ = ${fmt(b1)}`,
                        `   • c₁ = a₁x₁ + b₁y₁ = ${fmt(c1)}`,
                        `   • a₂ = y₄ - y₃ = ${fmt(a2)}`,
                        `   • b₂ = x₃ - x₄ = ${fmt(b2)}`,
                        `   • c₂ = a₂x₃ + b₂y₃ = ${fmt(c2)}`,
                        `④ Determinant Δ = a₁b₂ - a₂b₁ = ${fmt(det)}`,
                        `⑤ Intersection point:`,
                        `   • x = (c₁b₂ - c₂b₁)/Δ = ${fmt(x)}`,
                        `   • y = (a₁c₂ - a₂c₁)/Δ = ${fmt(y)}`
                    ];
                }
                
                // Draw lines
                const minX = -5, maxX = 10, minY = -5, maxY = 10;
                datasets = [
                    { label: 'Line 1', data: [{x: p1x, y: p1y}, {x: p2x, y: p2y}], borderColor: '#d44c2f', borderWidth: 2, pointRadius: 4, showLine: true, fill: false },
                    { label: 'Line 2', data: [{x: q1x, y: q1y}, {x: q2x, y: q2y}], borderColor: '#1f7f6a', borderWidth: 2, pointRadius: 4, showLine: true, fill: false }
                ];
                
                if (intersectionPoint) {
                    datasets.push({
                        label: 'Intersection',
                        data: [intersectionPoint],
                        backgroundColor: '#27ae60',
                        pointRadius: 10,
                        pointStyle: 'circle',
                        borderColor: 'white',
                        borderWidth: 2,
                        showLine: false
                    });
                }
                
            } else if (type === 'orientation') {
                const ax = parseFloat(document.getElementById('cgAx').value);
                const ay = parseFloat(document.getElementById('cgAy').value);
                const bx = parseFloat(document.getElementById('cgBx').value);
                const by = parseFloat(document.getElementById('cgBy').value);
                const cx = parseFloat(document.getElementById('cgCx').value);
                const cy = parseFloat(document.getElementById('cgCy').value);
                
                const orient = orientation(ax, ay, bx, by, cx, cy);
                let orientationText;
                if (orient === 0) orientationText = 'COLLINEAR (points lie on a straight line)';
                else if (orient === 1) orientationText = 'CLOCKWISE (right turn)';
                else orientationText = 'COUNTERCLOCKWISE (left turn)';
                
                resultText = orientationText;
                
                const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
                steps = [
                    `① Points: A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}), C(${fmt(cx)}, ${fmt(cy)})`,
                    `② Orientation = (Bx - Ax)·(Cy - Ay) - (By - Ay)·(Cx - Ax)`,
                    `   = (${fmt(bx)} - ${fmt(ax)})·(${fmt(cy)} - ${fmt(ay)}) - (${fmt(by)} - ${fmt(ay)})·(${fmt(cx)} - ${fmt(ax)})`,
                    `   = ${fmt(bx-ax)}·${fmt(cy-ay)} - ${fmt(by-ay)}·${fmt(cx-ax)}`,
                    `   = ${fmt((bx-ax)*(cy-ay))} - ${fmt((by-ay)*(cx-ax))} = ${fmt(cross)}`,
                    `③ Since value ${Math.abs(cross) < 1e-10 ? '≈ 0' : cross > 0 ? '> 0' : '< 0'},`,
                    `   orientation is ${orientationText}`
                ];
                
                // Draw points
                datasets = [
                    { label: 'Points', data: [{x: ax, y: ay}, {x: bx, y: by}, {x: cx, y: cy}], backgroundColor: '#d44c2f', pointRadius: 8, showLine: false },
                    { label: 'Path A→B→C', data: [{x: ax, y: ay}, {x: bx, y: by}, {x: cx, y: cy}], borderColor: '#2c3e50', borderWidth: 2, pointRadius: 0, showLine: true, fill: false }
                ];
                
            } else if (type === 'collinearity') {
                const ax = parseFloat(document.getElementById('cgAx').value);
                const ay = parseFloat(document.getElementById('cgAy').value);
                const bx = parseFloat(document.getElementById('cgBx').value);
                const by = parseFloat(document.getElementById('cgBy').value);
                const cx = parseFloat(document.getElementById('cgCx').value);
                const cy = parseFloat(document.getElementById('cgCy').value);
                
                const area = ax * (by - cy) + bx * (cy - ay) + cx * (ay - by);
                const isCollinear = Math.abs(area) < 1e-10;
                
                resultText = isCollinear ? 'Points are COLLINEAR' : 'Points are NOT collinear';
                steps = [
                    `① Points: A(${fmt(ax)}, ${fmt(ay)}), B(${fmt(bx)}, ${fmt(by)}), C(${fmt(cx)}, ${fmt(cy)})`,
                    `② Area = ½|x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|`,
                    `   = ½|${fmt(ax)}·(${fmt(by)} - ${fmt(cy)}) + ${fmt(bx)}·(${fmt(cy)} - ${fmt(ay)}) + ${fmt(cx)}·(${fmt(ay)} - ${fmt(by)})|`,
                    `   = ½|${fmt(ax*(by-cy))} + ${fmt(bx*(cy-ay))} + ${fmt(cx*(ay-by))}|`,
                    `   = ½|${fmt(area)}| = ${fmt(Math.abs(area)/2)}`,
                    `③ Since area ${Math.abs(area) < 1e-10 ? '≈ 0' : '≠ 0'}, points are ${isCollinear ? 'collinear' : 'not collinear'}`
                ];
                
                datasets = [
                    { label: 'Points', data: [{x: ax, y: ay}, {x: bx, y: by}, {x: cx, y: cy}], backgroundColor: '#d44c2f', pointRadius: 8, showLine: false }
                ];
                if (isCollinear) {
                    const minX = Math.min(ax, bx, cx) - 1;
                    const maxX = Math.max(ax, bx, cx) + 1;
                    const slope = (by - ay) / (bx - ax);
                    const intercept = ay - slope * ax;
                    datasets.push({
                        label: 'Line through points',
                        data: [{x: minX, y: slope*minX + intercept}, {x: maxX, y: slope*maxX + intercept}],
                        borderColor: '#2c3e50',
                        borderWidth: 2,
                        pointRadius: 0,
                        showLine: true,
                        fill: false
                    });
                }
                
            } else { // segments
                const p1x = parseFloat(document.getElementById('cgP1x').value);
                const p1y = parseFloat(document.getElementById('cgP1y').value);
                const p2x = parseFloat(document.getElementById('cgP2x').value);
                const p2y = parseFloat(document.getElementById('cgP2y').value);
                const q1x = parseFloat(document.getElementById('cgQ1x').value);
                const q1y = parseFloat(document.getElementById('cgQ1y').value);
                const q2x = parseFloat(document.getElementById('cgQ2x').value);
                const q2y = parseFloat(document.getElementById('cgQ2y').value);
                
                const o1 = orientation(p1x, p1y, p2x, p2y, q1x, q1y);
                const o2 = orientation(p1x, p1y, p2x, p2y, q2x, q2y);
                const o3 = orientation(q1x, q1y, q2x, q2y, p1x, p1y);
                const o4 = orientation(q1x, q1y, q2x, q2y, p2x, p2y);
                
                let intersects = false;
                let intersectionPoint = null;
                
                if (o1 !== o2 && o3 !== o4) {
                    intersects = true;
                    // Find intersection point
                    const a1 = p2y - p1y;
                    const b1 = p1x - p2x;
                    const c1 = a1 * p1x + b1 * p1y;
                    const a2 = q2y - q1y;
                    const b2 = q1x - q2x;
                    const c2 = a2 * q1x + b2 * q1y;
                    const det = a1 * b2 - a2 * b1;
                    if (Math.abs(det) > 1e-10) {
                        const x = (c1 * b2 - c2 * b1) / det;
                        const y = (a1 * c2 - a2 * c1) / det;
                        intersectionPoint = { x, y };
                    }
                } else if (o1 === 0 && onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) intersects = true;
                else if (o2 === 0 && onSegment(p1x, p1y, p2x, p2y, q2x, q2y)) intersects = true;
                else if (o3 === 0 && onSegment(q1x, q1y, q2x, q2y, p1x, p1y)) intersects = true;
                else if (o4 === 0 && onSegment(q1x, q1y, q2x, q2y, p2x, p2y)) intersects = true;
                
                resultText = intersects ? 'Segments INTERSECT' : 'Segments do NOT intersect';
                steps = [
                    `① Segment AB: A(${fmt(p1x)}, ${fmt(p1y)}), B(${fmt(p2x)}, ${fmt(p2y)})`,
                    `② Segment CD: C(${fmt(q1x)}, ${fmt(q1y)}), D(${fmt(q2x)}, ${fmt(q2y)})`,
                    `③ Orientation tests:`,
                    `   • Orientation(A,B,C) = ${o1} ${o1 === 0 ? '(collinear)' : o1 === 1 ? '(clockwise)' : '(counterclockwise)'}`,
                    `   • Orientation(A,B,D) = ${o2} ${o2 === 0 ? '(collinear)' : o2 === 1 ? '(clockwise)' : '(counterclockwise)'}`,
                    `   • Orientation(C,D,A) = ${o3} ${o3 === 0 ? '(collinear)' : o3 === 1 ? '(clockwise)' : '(counterclockwise)'}`,
                    `   • Orientation(C,D,B) = ${o4} ${o4 === 0 ? '(collinear)' : o4 === 1 ? '(clockwise)' : '(counterclockwise)'}`,
                    `④ Since ${o1 !== o2 && o3 !== o4 ? 'orientations differ' : 'general position condition not met'},`,
                    `   segments ${intersects ? 'INTERSECT' : 'do NOT intersect'}`
                ];
                
                if (intersectionPoint) {
                    steps.push(`⑤ Intersection point: (${fmt(intersectionPoint.x)}, ${fmt(intersectionPoint.y)})`);
                }
                
                // Draw segments
                datasets = [
                    { label: 'Segment AB', data: [{x: p1x, y: p1y}, {x: p2x, y: p2y}], borderColor: '#d44c2f', borderWidth: 2, pointRadius: 4, showLine: true, fill: false },
                    { label: 'Segment CD', data: [{x: q1x, y: q1y}, {x: q2x, y: q2y}], borderColor: '#1f7f6a', borderWidth: 2, pointRadius: 4, showLine: true, fill: false }
                ];
                
                if (intersectionPoint) {
                    datasets.push({
                        label: 'Intersection',
                        data: [intersectionPoint],
                        backgroundColor: '#27ae60',
                        pointRadius: 10,
                        pointStyle: 'circle',
                        borderColor: 'white',
                        borderWidth: 2,
                        showLine: false
                    });
                }
            }
            
            // Draw graph
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
                        x: { min: -5, max: 10, grid: { color: '#cbd5e1' } },
                        y: { min: -5, max: 10, grid: { color: '#cbd5e1' } }
                    }
                }
            });
            
            stepsDiv.innerHTML = steps.map((txt, i) => 
                `<div class="step-row">
                    <span class="step-marker">${i+1}</span>
                    <span class="step-text" style="white-space: pre-line;">${txt}</span>
                </div>`
            ).join('');
            
            resultDiv.innerHTML = `\\( \\text{${resultText}} \\)`;
            
            if (typeof renderLatex === 'function') renderLatex();
            if (typeof attachStepsToggle === 'function') attachStepsToggle();
            
        } catch (e) {
            console.error('Error:', e);
            showError(e.message);
        }
    }
    
    computeBtn.addEventListener('click', update);
    setTimeout(() => { update(); attachStepsToggle(); }, 100);
}

// Make functions globally available
window.renderPlaneIntersectionCard = renderPlaneIntersectionCard;
window.renderOptimizationDistanceCard = renderOptimizationDistanceCard;
window.renderLinearProgrammingCard = renderLinearProgrammingCard;
window.renderRegressionLineCard = renderRegressionLineCard;
window.renderComputationalGeometryCard = renderComputationalGeometryCard;

// Make functions globally available
window.renderConditionParallelPerp3DCard = renderConditionParallelPerp3DCard;
window.renderIntersectionLines3DCard = renderIntersectionLines3DCard;
window.renderSkewLines3DCard = renderSkewLines3DCard;
window.renderProjectionLine3DCard = renderProjectionLine3DCard;
window.renderImagePointLine3DCard = renderImagePointLine3DCard;
// Export functions for global use
window.render3DCoordsCard = render3DCoordsCard;
window.renderDirectionRatiosCard = renderDirectionRatiosCard;
window.renderLineSymmetricFormCard = renderLineSymmetricFormCard;
window.renderLineVectorFormCard = renderLineVectorFormCard;
window.renderAngleBetweenLines3DCard = renderAngleBetweenLines3DCard;