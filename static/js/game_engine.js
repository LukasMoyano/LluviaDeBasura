// static/js/game_engine.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const VW = 1920;
const VH = 1080;

const STATE_LOADING = -1;
const STATE_INTRO = 0;
const STATE_TUTORIAL_READING = 1;
const STATE_TUTORIAL = 2;
const STATE_PLAYING = 3;
const STATE_LEVEL_COMPLETE = 4;
const STATE_GAMEOVER = 5;

let currentState = STATE_LOADING;

let score = 0;
let correct_in_level = 0;
let mistakes = 0;
const MAX_MISTAKES = 5;
const SCORE_TO_PASS = 5;
const LEVELS = ["VERDE", "NEGRA", "AZUL"];
let current_level_idx = 0;

let animationId;
let spawn_timer = 0;
const FALL_SPEED = 650; // Pixels per second
let tutorial_start_time = 0;

let trash_items = [];
let cursorX = VW / 2;
let cursorY = VH / 2;

// Layout copiado de config.json para preservar redimensiones
const LAYOUT = {
    intro_bg1: {x: 260, y: 80, w: 1400, h: 260},
    intro_bg2: {x: 310, y: 100, w: 1300, h: 220},
    intro_title: {x: 360, y: 145, w: 1200, h: 130},
    tutorial_bg: {x: 160, y: 100, w: 1600, h: 260},
    tutorial_txt: {x: 210, y: 140, w: 1500, h: 180},
    btn_inicio_center: {x: 760, y: 450, w: 400, h: 150},
    btn_inicio_left: {x: 460, y: 450, w: 400, h: 150},
    btn_volver_right: {x: 1060, y: 450, w: 400, h: 150},
    felicitaciones_bg: {x: 460, y: 100, w: 1000, h: 240},
    felicitaciones_txt: {x: 510, y: 130, w: 900, h: 180},
    gameover_bg: {x: 460, y: 100, w: 1000, h: 240},
    gameover_txt: {x: 510, y: 130, w: 900, h: 180},
    caneca_verde: {x: 400, y: 700, w: 250, h: 320},
    caneca_negra: {x: 835, y: 700, w: 250, h: 320},
    caneca_azul: {x: 1270, y: 700, w: 250, h: 320}
};

const ASSETS = {
    bg: '/static/images/FondoFondo/BackBackground.png',
    trees: '/static/images/FondoFondo/arboles.png',
    bushes: '/static/images/FondoFondo/arbustos.png',
    caneca_VERDE: '/static/images/Canecas/obj_CANECA VERDE.png',
    caneca_AZUL: '/static/images/Canecas/obj_CANECA AZUL.png',
    caneca_NEGRA: '/static/images/Canecas/obj_CANECA NEGRA .png',
    intro_bg1: '/static/images/TL-INTRO_juega y aprende/bg1.png',
    intro_bg2: '/static/images/TL-INTRO_juega y aprende/bg2.png',
    intro_title: '/static/images/TL-INTRO_juega y aprende/juega y aprende.png',
    tutorial_bg: '/static/images/TL_instrucciones/TL_instrucciones_bkg.png',
    tutorial_txt: '/static/images/TL_instrucciones/TL_instrucciones_txt.png',
    btn_inicio: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_bkg.png',
    btn_inicio_txt: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_txt.png',
    btn_replay_txt: '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_volver a jugar_txt.png',
    felicitaciones_bg: '/static/images/TLs_/btn_FELICITACIONES_bkg.png',
    felicitaciones_txt: '/static/images/TLs_/btn_FELICITACIONES_txt.png',
    gameover_bg: '/static/images/TLs_/btn_intentalo de nuevo_bkg.png',
    gameover_txt: '/static/images/TLs_/btn_intentalo de nuevo_txt.png'
};

const TRASH_TYPES = { "VERDE": 7, "AZUL": 16, "NEGRA": 13 };
const trashImages = { "VERDE": [], "AZUL": [], "NEGRA": [] };
const loadedImages = {};
let imagesToLoad = Object.keys(ASSETS).length + TRASH_TYPES.VERDE + TRASH_TYPES.AZUL + TRASH_TYPES.NEGRA;
let imagesLoaded = 0;

function checkLoadComplete() {
    imagesLoaded++;
    if (imagesLoaded >= imagesToLoad) {
        console.log("Todos los assets cargados.");
        currentState = STATE_INTRO;
        if (!animationId) gameLoop();
    }
}

for (let key in ASSETS) {
    const img = new Image();
    img.onload = checkLoadComplete;
    img.onerror = (e) => {
        console.error("Error al cargar imagen ASSET:", key, ASSETS[key]);
        checkLoadComplete();
    };
    img.src = ASSETS[key];
    loadedImages[key] = img;
}

function loadTrashImgs(type, count, prefix) {
    for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.onload = checkLoadComplete;
        img.onerror = (e) => {
            console.error("Error al cargar basura:", type, prefix, i);
            checkLoadComplete();
        };
        img.src = `/static/images/BasuraCae/${prefix}_Basura${i}.png`;
        trashImages[type].push(img);
    }
}
loadTrashImgs("VERDE", TRASH_TYPES.VERDE, "Caneca1Verde");
loadTrashImgs("AZUL", TRASH_TYPES.AZUL, "Caneca3Azul");
loadTrashImgs("NEGRA", TRASH_TYPES.NEGRA, "Caneca2Negro");


function updateCursor(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = VW / rect.width;
    const scaleY = VH / rect.height;
    cursorX = (clientX - rect.left) * scaleX;
    cursorY = (clientY - rect.top) * scaleY;
}

canvas.addEventListener('mousemove', (e) => updateCursor(e.clientX, e.clientY));
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) updateCursor(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: false});

function checkBtnClick(rectKey) {
    const r = LAYOUT[rectKey];
    if (!r) return false;
    return cursorX >= r.x && cursorX <= r.x + r.w && cursorY >= r.y && cursorY <= r.y + r.h;
}

function handleInteraction() {
    if (currentState === STATE_INTRO) {
        if (checkBtnClick('btn_inicio_center')) {
            currentState = STATE_TUTORIAL_READING;
            tutorial_start_time = Date.now();
        }
    } else if (currentState === STATE_TUTORIAL) {
        if (checkBtnClick('btn_inicio_center')) {
            currentState = STATE_PLAYING;
            score = 0;
            mistakes = 0;
            current_level_idx = 0;
            correct_in_level = 0;
            trash_items = [];
        }
    } else if (currentState === STATE_LEVEL_COMPLETE) {
        if (current_level_idx < LEVELS.length - 1) {
            if (checkBtnClick('btn_inicio_center')) {
                current_level_idx++;
                correct_in_level = 0;
                mistakes = 0;
                trash_items = [];
                currentState = STATE_PLAYING;
            }
        } else {
            if (checkBtnClick('btn_inicio_left')) {
                currentState = STATE_INTRO;
            } else if (checkBtnClick('btn_volver_right')) {
                currentState = STATE_PLAYING;
                score = 0;
                mistakes = 0;
                current_level_idx = 0;
                correct_in_level = 0;
                trash_items = [];
            }
        }
    } else if (currentState === STATE_GAMEOVER) {
        if (checkBtnClick('btn_inicio_left')) {
            currentState = STATE_INTRO;
        } else if (checkBtnClick('btn_volver_right')) {
            currentState = STATE_PLAYING;
            score = 0;
            mistakes = 0;
            current_level_idx = 0;
            correct_in_level = 0;
            trash_items = [];
        }
    }
}

canvas.addEventListener('mousedown', handleInteraction);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) updateCursor(e.touches[0].clientX, e.touches[0].clientY);
    handleInteraction();
}, {passive: false});

class Trash {
    constructor() {
        const types = ["VERDE", "AZUL", "NEGRA"];
        this.type = types[Math.floor(Math.random() * types.length)];
        const typeImages = trashImages[this.type];
        this.img = typeImages[Math.floor(Math.random() * typeImages.length)];
        
        // Conservar proporciones originales
        this.width = 120;
        this.height = 120;
        if (this.img) {
            const aspect = this.img.width / this.img.height;
            if (aspect > 1) {
                this.height = this.width / aspect; // Ancho es 120, calculamos alto
            } else {
                this.width = this.height * aspect; // Alto es 120, calculamos ancho
            }
        }
        
        this.x = 100 + Math.random() * (VW - 200 - this.width);
        this.y = -150;
        this.speed = FALL_SPEED + Math.floor(Math.random() * 200) - 100; // +/- 100 px/s
    }
    
    update(dt) {
        this.y += (this.speed * dt) / 1000;
    }
    
    draw(context) {
        if (this.img) {
            context.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}

function drawLayout(ctx, key) {
    const r = LAYOUT[key];
    const img = loadedImages[key];
    if (img && r) {
        ctx.drawImage(img, r.x, r.y, r.w, r.h);
    }
}
function drawBtn(ctx, key, txtKey) {
    drawLayout(ctx, key);
    if (txtKey) {
        const r = LAYOUT[key];
        const tImg = loadedImages[txtKey];
        if (tImg && r) {
            ctx.drawImage(tImg, r.x, r.y, r.w, r.h);
        }
    }
}

let lastTime = 0;

function gameLoop(timestamp) {
    if (!timestamp) timestamp = performance.now();
    let dt = timestamp - lastTime;
    if (lastTime === 0) dt = 16;
    if (dt > 100) dt = 16; // Evita saltos enormes si cambian de pestaña
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width / VW, canvas.height / VH);
    
    if (currentState !== STATE_LOADING) {
        if (loadedImages.bg) ctx.drawImage(loadedImages.bg, 0, 0, VW, VH);
        if (loadedImages.trees) ctx.drawImage(loadedImages.trees, 0, 0, VW, VH);
        if (loadedImages.bushes) ctx.drawImage(loadedImages.bushes, 0, 0, VW, VH);
    }

    if (currentState === STATE_LOADING) {
        ctx.fillStyle = '#00E5FF';
        ctx.font = '60px Impact';
        ctx.textAlign = 'center';
        ctx.fillText(`CARGANDO ASSETS B2B... ${Math.floor((imagesLoaded/imagesToLoad)*100)}%`, VW/2, VH/2);
    } 
    else if (currentState === STATE_INTRO) {
        drawLayout(ctx, 'intro_bg1');
        drawLayout(ctx, 'intro_bg2');
        drawLayout(ctx, 'intro_title');
        
        const isHover = checkBtnClick('btn_inicio_center');
        if (isHover) ctx.filter = 'brightness(1.2)';
        drawBtn(ctx, 'btn_inicio_center', 'btn_inicio_txt');
        ctx.filter = 'none';
        
    }
    else if (currentState === STATE_TUTORIAL_READING) {
        drawLayout(ctx, 'tutorial_bg');
        drawLayout(ctx, 'tutorial_txt');
        
        if (Date.now() - tutorial_start_time > 1500) {
            currentState = STATE_TUTORIAL;
        }
    }
    else if (currentState === STATE_TUTORIAL) {
        drawLayout(ctx, 'tutorial_bg');
        drawLayout(ctx, 'tutorial_txt');
        
        drawLayout(ctx, 'caneca_verde');
        drawLayout(ctx, 'caneca_negra');
        drawLayout(ctx, 'caneca_azul');
        
        const isHover = checkBtnClick('btn_inicio_center');
        if (isHover) ctx.filter = 'brightness(1.2)';
        drawBtn(ctx, 'btn_inicio_center', 'btn_inicio_txt');
        ctx.filter = 'none';
    }
    else if (currentState === STATE_PLAYING) {
        const targetType = LEVELS[current_level_idx];
        const layoutKey = `caneca_${targetType.toLowerCase()}`;
        const imgKey = `caneca_${targetType}`;
        const binLayout = LAYOUT[layoutKey];
        const binImg = loadedImages[imgKey];
        
        spawn_timer += dt;
        if (spawn_timer > 700) { // Spawn every 700ms
            trash_items.push(new Trash());
            spawn_timer = 0;
        }
        
        // Integración IA: Sobrescribir cursorX si la IA de visión está activa
        if (window.visionActive) {
            cursorX = window.handCursorX * VW;
        }

        // Movimiento directo con el cursor/dedo/IA
        binLayout.x = cursorX - (binLayout.w / 2);
        binLayout.x = Math.max(0, Math.min(binLayout.x, VW - binLayout.w));
        
        for (let i = trash_items.length - 1; i >= 0; i--) {
            let t = trash_items[i];
            t.update(dt);
            
            if (t.x < binLayout.x + binLayout.w &&
                t.x + t.width > binLayout.x &&
                t.y < binLayout.y + binLayout.h &&
                t.y + t.height > binLayout.y) {
                    
                if (t.type === targetType) {
                    score += 10;
                    correct_in_level += 1;
                } else {
                    score = Math.max(0, score - 2);
                    mistakes += 1;
                }
                trash_items.splice(i, 1);
            } 
            else if (t.y > VH) {
                if (t.type === targetType) {
                    score = Math.max(0, score - 2);
                    mistakes += 1;
                }
                trash_items.splice(i, 1);
            }
        }
        
        if (correct_in_level >= SCORE_TO_PASS) {
            currentState = STATE_LEVEL_COMPLETE;
        } else if (mistakes >= MAX_MISTAKES) {
            currentState = STATE_GAMEOVER;
        }
        
        if (binImg) ctx.drawImage(binImg, binLayout.x, binLayout.y, binLayout.w, binLayout.h);
        for (let t of trash_items) t.draw(ctx);
        
        ctx.fillStyle = '#000';
        ctx.font = '48px Impact';
        ctx.textAlign = 'left';
        ctx.fillText(`PUNTOS: ${score}`, 22, 52);
        ctx.fillStyle = '#FFF';
        ctx.fillText(`PUNTOS: ${score}`, 20, 50);
        
        const txtLevel = `NIVEL ${current_level_idx + 1}: CANECA ${targetType}`;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(txtLevel, VW/2 + 2, 52);
        ctx.fillStyle = '#FFF';
        ctx.fillText(txtLevel, VW/2, 50);
        
        const txtProg = `PROGRESO: ${correct_in_level}/${SCORE_TO_PASS}`;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'right';
        ctx.fillText(txtProg, VW - 348, 52);
        ctx.fillStyle = '#FFF';
        ctx.fillText(txtProg, VW - 350, 50);
        
        const txtErr = `ERRORES: ${mistakes}/${MAX_MISTAKES}`;
        ctx.fillStyle = '#000';
        ctx.fillText(txtErr, VW - 348, 92);
        ctx.fillStyle = '#F00';
        ctx.fillText(txtErr, VW - 350, 90);

    } 
    else if (currentState === STATE_LEVEL_COMPLETE) {
        drawLayout(ctx, 'felicitaciones_bg');
        drawLayout(ctx, 'felicitaciones_txt');
        
        drawLayout(ctx, 'caneca_verde');
        drawLayout(ctx, 'caneca_negra');
        drawLayout(ctx, 'caneca_azul');
        
        if (current_level_idx < LEVELS.length - 1) {
            const isHover = checkBtnClick('btn_inicio_center');
            if (isHover) ctx.filter = 'brightness(1.2)';
            drawLayout(ctx, 'btn_inicio_center');
            ctx.filter = 'none';
            
            ctx.fillStyle = '#FFF';
            ctx.font = '48px Impact';
            ctx.textAlign = 'center';
            const r = LAYOUT.btn_inicio_center;
            ctx.fillText("SIGUIENTE NIVEL", r.x + r.w/2, r.y + r.h/2 + 15);
        } else {
            const hoverLeft = checkBtnClick('btn_inicio_left');
            if (hoverLeft) ctx.filter = 'brightness(1.2)';
            drawBtn(ctx, 'btn_inicio_left', 'btn_inicio_txt');
            ctx.filter = 'none';
            
            const hoverRight = checkBtnClick('btn_volver_right');
            if (hoverRight) ctx.filter = 'brightness(1.2)';
            drawBtn(ctx, 'btn_volver_right', 'btn_replay_txt');
            ctx.filter = 'none';
        }
    } 
    else if (currentState === STATE_GAMEOVER) {
        drawLayout(ctx, 'gameover_bg');
        drawLayout(ctx, 'gameover_txt');
        
        drawLayout(ctx, 'caneca_verde');
        drawLayout(ctx, 'caneca_negra');
        drawLayout(ctx, 'caneca_azul');
        
        const hoverLeft = checkBtnClick('btn_inicio_left');
        if (hoverLeft) ctx.filter = 'brightness(1.2)';
        drawBtn(ctx, 'btn_inicio_left', 'btn_inicio_txt');
        ctx.filter = 'none';
        
        const hoverRight = checkBtnClick('btn_volver_right');
        if (hoverRight) ctx.filter = 'brightness(1.2)';
        drawBtn(ctx, 'btn_volver_right', 'btn_replay_txt');
        ctx.filter = 'none';
    }
    
    ctx.restore();
    animationId = requestAnimationFrame(gameLoop);
}

// Empezar automático
window.startGameEngine = function() {
    console.log("[GAME_ENGINE] Iniciado versión web pura.");
    if (!animationId && currentState !== STATE_LOADING) {
        gameLoop();
    }
};

window.onload = () => {
    // Start engine when ready
};

