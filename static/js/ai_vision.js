// static/js/ai_vision.js

// ==========================================
// Módulo de Inteligencia Artificial (MediaPipe)
// Arquitectura: Cyberpunk Andino
// ==========================================

// Variables Globales de Interconexión
window.handCursorX = 0.5; // Coordenada X global normalizada (0.0 a 1.0) - Centro por defecto
window.visionActive = false; // Indica si la cámara y el modelo IA están operativos

// Estado local
let handLandmarker = undefined;
let webcamRunning = false;
let lastVideoTime = -1;

// Referencias del DOM
const video = document.getElementById('webcam');
const btnCalibrate = document.getElementById('btn-calibrate');
const uiOverlay = document.getElementById('game-ui-overlay');

/**
 * Carga el modelo de MediaPipe Tasks Vision de forma asíncrona
 * Usamos import() dinámico para evitar conflictos si no está en un module type
 */
async function initializeAI() {
    try {
        console.log("[AI_VISION] Cargando modelo neuronal HandLandmarker...");
        
        // Importación de módulos UMD/ES desde el CDN
        const visionModule = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12");
        const FilesetResolver = visionModule.FilesetResolver;
        const HandLandmarker = visionModule.HandLandmarker;
        
        // Resolver WebAssembly (WASM) requerido por MediaPipe
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
        );
        
        // Instanciar el detector de manos
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                // Modelo ligero y rápido Float16
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
                // NOTA: Se omite explícitamente el 'delegate' para forzar CPU nativo y evitar el crash de WebGL/kGpuService
            },
            runningMode: "VIDEO",
            numHands: 1 // Solo rastreamos una mano para mover la caneca
        });
        
        console.log("[AI_VISION] IA cargada. Edge-Computing listo.");
        
        if (btnCalibrate) {
            btnCalibrate.innerText = "[ INICIAR_SISTEMA ]";
            btnCalibrate.disabled = false;
        }
    } catch (error) {
        console.error("[AI_VISION] Error inicializando el motor de IA:", error);
    }
}

// Disparador de carga del modelo al iniciar el script
if (btnCalibrate) {
    btnCalibrate.disabled = true;
    btnCalibrate.innerText = "[ CARGANDO_IA_CORE... ]";
    btnCalibrate.addEventListener('click', enableCam);
}
initializeAI();

/**
 * Solicita permisos de cámara e inicia el stream de video
 */
function enableCam(event) {
    if (!handLandmarker) {
        console.warn("[AI_VISION] IA aún procesando modelo. Por favor espere.");
        return;
    }
    
    if (webcamRunning === true) {
        webcamRunning = false;
        return;
    }
    webcamRunning = true;

    // Constraints del Stream
    const constraints = { 
        video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: "user" // Cámara frontal
        } 
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
        
        // Ocultar Interfaz de Calibración
        if (uiOverlay) {
            uiOverlay.style.opacity = "0";
            setTimeout(() => uiOverlay.style.display = "none", 300);
        }
        
        // Señalizar al motor de juego que la IA está viva
        window.visionActive = true;
        
        // Desencadenar el motor de juego
        if (typeof window.startGameEngine === 'function') {
            window.startGameEngine();
        }
    }).catch((err) => {
        console.error("[AI_VISION] Error de hardware / Permisos:", err);
        alert("ALERTA: Acceso a cámara denegado. Activando protocolo de emergencia: MOUSE (Fallback).");
        
        // Ocultar Interfaz de todas formas y usar modo Fallback
        if (uiOverlay) uiOverlay.style.display = "none";
        
        // Desencadenar el motor de juego en modo fallback
        if (typeof window.startGameEngine === 'function') {
            window.startGameEngine();
        }
    });
}

/**
 * Bucle de predicción fotograma a fotograma
 */
async function predictWebcam() {
    let startTimeMs = performance.now();
    
    // Solo predecir si tenemos un nuevo frame de video
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
            // Extraemos las coordenadas de la primera mano detectada
            // Landmark 9: Base del dedo medio (centro de la palma aproximadamente)
            const landmarkX = results.landmarks[0][9].x;
            
            // NORMALIZACIÓN
            // La cámara frontal actúa como un espejo. Si la persona mueve su mano a la izquierda,
            // en la imagen se ve hacia la derecha. Invertimos X para que el movimiento sea natural.
            window.handCursorX = 1.0 - landmarkX; 
        }
    }
    
    // Continuar el bucle a 60FPS o lo que la pantalla permita
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
