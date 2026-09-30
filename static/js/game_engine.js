// static/js/game_engine.js

// ==========================================
// Motor de Juego y Renderizado (Fase 3)
// Adaptación Web - Lógica Local Replicada Exactamente
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensiones Virtuales Internas (De la versión Pygame 1920x1080)
const VW = 1920;
const VH = 1080;

// Estados del Juego
const STATE_LOADING = -1;
const STATE_INTRO = 0;
const STATE_PLAYING = 1;
const STATE_LEVEL_COMPLETE = 2;
const STATE_GAMEOVER = 3;

let currentState = STATE_LOADING;

// Variables de estado lógicas
let score = 0;
let correct_in_level = 0;
const SCORE_TO_PASS = 5;
const LEVELS = ["VERDE", "NEGRA", "AZUL"];
let current_level_idx = 0;

let animationId;
let spawn_timer = 0;
const FALL_SPEED = 8;
const PALM_SENSITIVITY = 1.5;

// Entidades
let trash_items = [];
const player = {
    width: 250,
    height: 320,
    x: VW / 2 - 125,
    y: 800 // De config.json: "caneca_verde": {"y": 800}
};

/**
 * ==========================================
 * SISTEMA DE ASSETS Y PRECARGA
 * ==========================================
 */
const ASSETS = {
    bg: '/static/images/FondoFondo/BackBackground.png',
    trees: '/static/images/FondoFondo/arboles.png',
    bushes: '/static/images/FondoFondo/arbustos.png',
    caneca_VERDE: '/static/images/Canecas/obj_CANECA VERDE.png',
    caneca_AZUL: '/static/images/Canecas/obj_CANECA AZUL.png',
    caneca_NEGRA: '/static/images/Canecas/obj_CANECA NEGRA .png',
    intro_title: '/static/images/TL-INTRO_juega y aprende/juega y aprende.png',
    btn_inicio: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_bkg.png',
    btn_txt: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_txt.png',
    felicitaciones_bg: '/static/images/TLs_/btn_FELICITACIONES_bkg.png',
    felicitaciones_txt: '/static/images/TLs_/btn_FELICITACIONES_txt.png',
    btn_replay_txt: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_volver a jugar_txt.png'
};

const TRASH_TYPES = { "VERDE": 7, "AZUL": 16, "NEGRA": 13 };
const trashImages = { "VERDE": [], "AZUL": [], "NEGRA": [] };

const loadedImages = {};
let imagesToLoad = Object.keys(ASSETS).length + TRASH_TYPES.VERDE + TRASH_TYPES.AZUL + TRASH_TYPES.NEGRA;
let imagesLoaded = 0;

function checkLoadComplete() {
    imagesLoaded++;
    if (imagesLoaded >= imagesToLoad) {
        console.log("[GAME_ENGINE] Todos los assets migrados cargados exitosamente.");
        currentState = STATE_INTRO;
        if (!animationId) gameLoop();
    }
}

// Cargar fondos y UI
for (let key in ASSETS) {
    const img = new Image();
    img.onload = checkLoadComplete;
    img.src = ASSETS[key];
    loadedImages[key] = img;
}

// Cargar basuras
function loadTrashImgs(type, count, prefix) {
    for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.onload = checkLoadComplete;
        img.src = `/static/images/BasuraCae/${prefix}_Basura${i}.png`;
        trashImages[type].push(img);
    }
}
loadTrashImgs("VERDE", TRASH_TYPES.VERDE, "Caneca1Verde");
loadTrashImgs("AZUL", TRASH_TYPES.AZUL, "Caneca3Azul");
loadTrashImgs("NEGRA", TRASH_TYPES.NEGRA, "Caneca2Negro");

/**
 * ==========================================
 * CONTROLES Y FALLBACK MULTIDISPOSITIVO
 * ==========================================
 */
function updateCursorFallback(clientX) {
    if (!window.visionActive) {
        const rect = canvas.getBoundingClientRect();
        let x = (clientX - rect.left);
        // Normalizar 0.0 a 1.0 relativo al canvas en pantalla
        window.handCursorX = Math.max(0, Math.min(1, x / rect.width));
    }
}

canvas.addEventListener('mousemove', (e) => updateCursorFallback(e.clientX));
canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateCursorFallback(e.touches[0].clientX);
});

// Sistema de Clicks de UI
canvas.addEventListener('click', (e) => {
    if (currentState !== STATE_INTRO && currentState !== STATE_GAMEOVER && currentState !== STATE_LEVEL_COMPLETE) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = VW / rect.width;
    const scaleY = VH / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Coordenadas del botón de inicio según config.json
    const btnX = 760, btnY = 500, btnW = 400, btnH = 150;

    if (clickX >= btnX && clickX <= btnX + btnW && clickY >= btnY && clickY <= btnY + btnH) {
        if (currentState === STATE_INTRO || currentState === STATE_GAMEOVER) {
            // Reiniciar juego completo
            score = 0;
            current_level_idx = 0;
            correct_in_level = 0;
            trash_items = [];
            currentState = STATE_PLAYING;
        } else if (currentState === STATE_LEVEL_COMPLETE) {
            // Siguiente Nivel
            if (current_level_idx < LEVELS.length - 1) {
                current_level_idx++;
                correct_in_level = 0;
                trash_items = [];
                currentState = STATE_PLAYING;
            } else {
                currentState = STATE_GAMEOVER;
            }
        }
    }
});

/**
 * ==========================================
 * CLASES Y LÓGICA
 * ==========================================
 */
class Trash {
    constructor() {
        const types = ["VERDE", "AZUL", "NEGRA"];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        const typeImages = trashImages[this.type];
        this.img = typeImages[Math.floor(Math.random() * typeImages.length)];
        
        this.width = 120;
        this.height = 120;
        
        // random.randint(100, am.internal_w - 100) -> Adaptado
        this.x = 100 + Math.random() * (VW - 200 - this.width);
        this.y = -150;
        
        // speed = FALL_SPEED + random.randint(-2, 3)
        this.speed = FALL_SPEED + Math.floor(Math.random() * 6) - 2; 
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw(context) {
        if (this.img) {
            context.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}

/**
 * ==========================================
 * GAME LOOP Y RENDERIZADO
 * ==========================================
 */
function gameLoop() {
    // 1. Limpiar y Escalar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Mapear resolucion fisica de HTML a resolucion Virtual 1920x1080
    ctx.scale(canvas.width / VW, canvas.height / VH);
    
    // 2. Renderizado Base
    if (currentState !== STATE_LOADING) {
        if (loadedImages.bg) ctx.drawImage(loadedImages.bg, 0, 0, VW, VH);
        if (loadedImages.trees) ctx.drawImage(loadedImages.trees, 0, 0, VW, VH);
        if (loadedImages.bushes) ctx.drawImage(loadedImages.bushes, 0, 0, VW, VH);
    }

    // 3. Máquina de Estados
    if (currentState === STATE_LOADING) {
        ctx.fillStyle = '#00E5FF';
        ctx.font = '60px "Space Grotesk", Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`CARGANDO ASSETS B2B... ${Math.floor((imagesLoaded/imagesToLoad)*100)}%`, VW/2, VH/2);
    } 
    else if (currentState === STATE_INTRO) {
        if (loadedImages.intro_title) ctx.drawImage(loadedImages.intro_title, 360, 145, 1200, 130);
        if (loadedImages.btn_inicio) ctx.drawImage(loadedImages.btn_inicio, 760, 500, 400, 150);
        if (loadedImages.btn_txt) ctx.drawImage(loadedImages.btn_txt, 760, 500, 400, 150);
        
        // Dibujar indicador de cursor para UX (opcional)
        drawCursor(ctx);
    } 
    else if (currentState === STATE_PLAYING) {
        const targetType = LEVELS[current_level_idx];
        const binImg = loadedImages[`caneca_${targetType}`];
        
        // Spawning
        spawn_timer++;
        if (spawn_timer > 30) {
            trash_items.push(new Trash());
            spawn_timer = 0;
        }
        
        // Físicas: Movimiento suavizado con IA o Touch
        // raw_x = (state["cursor_x"] / cam_w) * internal_w
        // target_x = int(cx + (raw_x - cx) * PALM_SENSITIVITY)
        let cx = VW / 2;
        let raw_x = (window.handCursorX || 0.5) * VW;
        let target_x = cx + (raw_x - cx) * PALM_SENSITIVITY;
        
        player.x += (target_x - (player.x + player.width/2)) * 0.5;
        player.x = Math.max(0, Math.min(player.x, VW - player.width)); // Restringir a los bordes
        
        // Update y Colisiones
        for (let i = trash_items.length - 1; i >= 0; i--) {
            let t = trash_items[i];
            t.update();
            
            // Colisión AABB
            if (t.x < player.x + player.width &&
                t.x + t.width > player.x &&
                t.y < player.y + player.height &&
                t.y + t.height > player.y) {
                    
                if (t.type === targetType) {
                    score += 10;
                    correct_in_level += 1;
                } else {
                    score = Math.max(0, score - 2);
                }
                trash_items.splice(i, 1);
            } 
            // Fuera de pantalla
            else if (t.y > VH) {
                if (t.type === targetType) {
                    score = Math.max(0, score - 2);
                }
                trash_items.splice(i, 1);
            }
        }
        
        // Chequeo Nivel Completado
        if (correct_in_level >= SCORE_TO_PASS) {
            currentState = STATE_LEVEL_COMPLETE;
        }
        
        // Render
        if (binImg) ctx.drawImage(binImg, player.x, player.y, player.width, player.height);
        for (let t of trash_items) t.draw(ctx);
        
        // HUD
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 48px Impact';
        ctx.textAlign = 'left';
        ctx.fillText(`PUNTOS: ${score}`, 20, 60);
        
        ctx.textAlign = 'center';
        ctx.fillText(`NIVEL ${current_level_idx + 1}: CANECA ${targetType}`, VW/2, 60);
        
        ctx.textAlign = 'right';
        ctx.fillText(`PROGRESO: ${correct_in_level}/${SCORE_TO_PASS}`, VW - 20, 60);

    } 
    else if (currentState === STATE_LEVEL_COMPLETE) {
        if (loadedImages.felicitaciones_bg) ctx.drawImage(loadedImages.felicitaciones_bg, 460, 200, 1000, 240);
        if (loadedImages.felicitaciones_txt) ctx.drawImage(loadedImages.felicitaciones_txt, 510, 230, 900, 180);
        if (loadedImages.btn_inicio) ctx.drawImage(loadedImages.btn_inicio, 760, 500, 400, 150);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '40px Impact';
        ctx.textAlign = 'center';
        ctx.fillText("SIGUIENTE NIVEL", VW/2, 595);
        
        drawCursor(ctx);
    } 
    else if (currentState === STATE_GAMEOVER) {
        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 100px Impact';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00E5FF';
        ctx.fillText("¡PROGRAMA COMPLETADO!", VW/2, VH/2 - 100);
        ctx.shadowBlur = 0;
        
        if (loadedImages.btn_inicio) ctx.drawImage(loadedImages.btn_inicio, 760, 500, 400, 150);
        if (loadedImages.btn_replay_txt) ctx.drawImage(loadedImages.btn_replay_txt, 760, 500, 400, 150);
        
        drawCursor(ctx);
    }
    
    ctx.restore();
    animationId = requestAnimationFrame(gameLoop);
}

// Cursor holográfico para menús interactuando con la IA
function drawCursor(ctx) {
    let cx = VW / 2;
    let raw_x = (window.handCursorX || 0.5) * VW;
    let target_x = cx + (raw_x - cx) * PALM_SENSITIVITY;
    
    ctx.beginPath();
    ctx.arc(Math.max(0, Math.min(target_x, VW)), VH/2 + 150, 15, 0, Math.PI*2);
    ctx.fillStyle = window.visionActive ? '#388E3C' : '#FFAB00';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
}

// Inicializador llamado desde la UI HTML
window.startGameEngine = function() {
    console.log("[GAME_ENGINE] Cámara calibrada/Fallback activo.");
    if (!animationId && currentState !== STATE_LOADING) {
        gameLoop();
    }
};
