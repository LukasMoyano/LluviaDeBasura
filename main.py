import pygame
import random
import cv2
import sys
import time
from vision_tracker import HandTracker

# ==========================================
# CONFIGURACIONES BASE Y ARQUITECTURA
# ==========================================
pygame.init()

infoObject = pygame.display.Info()
PHYSICAL_W, PHYSICAL_H = infoObject.current_w, infoObject.current_h
PHYSICAL_W, PHYSICAL_H = 1280, 720 # Se puede usar modo ventana o comentar para fullscreen

screen = pygame.display.set_mode((PHYSICAL_W, PHYSICAL_H))
pygame.display.set_caption("Lluvia de Basura - Fase 4")

from asset_manager import AssetManager, UIManager
am = AssetManager("config.json")
am.load_all()

internal_surface = pygame.Surface(am.internal_resolution)
clock = pygame.time.Clock()
ui = UIManager(am)

font_large = pygame.font.SysFont(am.config["fonts"]["main_font"], am.config["fonts"]["size_large"])
font_medium = pygame.font.SysFont(am.config["fonts"]["main_font"], am.config["fonts"]["size_medium"])

STATE_INTRO = 0
STATE_TUTORIAL_READING = 1
STATE_TUTORIAL = 10
STATE_PLAYING = 2
STATE_LEVEL_COMPLETE = 3
STATE_GAMEOVER = 4
current_state = STATE_INTRO
tutorial_start_time = 0

LEVELS = ["VERDE", "NEGRA", "AZUL"]
current_level_idx = 0
mistakes = 0
MAX_MISTAKES = 5
SCORE_TO_PASS = 5

DEBUG_MODE = False
PRESENTATION_MODE = True  # Pantalla alterna para la presentacion en vivo
FALL_SPEED = 8  # Modifica este valor en caliente para la velocidad
PALM_SENSITIVITY = 1.5  # Multiplicador de movimiento

score = 0
correct_in_level = 0
trash_items = []

# ==========================================
# CLASE BASURA (Usa coordendas 1920x1080)
# ==========================================
class Trash:
    def __init__(self):
        self.type = random.choice(["VERDE", "AZUL", "NEGRA"])
        
        from assets_mapper import BASURA_ASSETS
        paths = BASURA_ASSETS.get(self.type, [])
        if paths:
            raw_img = pygame.image.load(random.choice(paths)).convert_alpha()
            w = am.layout["trash_size"]["w"]
            h = am.layout["trash_size"]["h"]
            self.img = pygame.transform.scale(raw_img, (w, h))
        else:
            self.img = pygame.Surface((100, 100))
            self.img.fill((255, 0, 0))
            
        self.rect = self.img.get_rect()
        self.rect.x = random.randint(100, am.internal_w - 100)
        self.rect.y = -150
        self.speed = FALL_SPEED + random.randint(-2, 3) 

    def update(self):
        self.rect.y += self.speed

    def draw(self, surface):
        surface.blit(self.img, self.rect)

# ==========================================
# INICIALIZAR VISIÓN (CÁMARA)
# ==========================================
cam_index = int(sys.argv[1]) if len(sys.argv) > 1 else 0
print(f"Arrancando cámara {cam_index}...")
cap = cv2.VideoCapture(cam_index, cv2.CAP_V4L2)
tracker = HandTracker()
for _ in range(5): cap.read() # Calentamiento

cursor_pos = (am.internal_w//2, am.internal_h//2)
is_open = False
spawn_timer = 0
cam_error_reported = False
state = {"detected": False, "is_pinching": False, "is_open": False}
mp_latency = 0

# Calculamos coordenadas de árboles y arbustos para que estén centrados y al margen inferior
trees_img = am.get_img("trees")
bushes_img = am.get_img("bushes")

def draw_bottom_centered(surf, img):
    if img:
        w, h = img.get_size()
        x = (am.internal_w - w) // 2
        y = am.internal_h - h
        surf.blit(img, (x, y))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN and event.key == pygame.K_d:
            DEBUG_MODE = not DEBUG_MODE
            
    if cap.isOpened():
        success, img = cap.read()
        if success and img is not None:
            img = cv2.flip(img, 1)
            t_start = time.time()
            state, tracked_img = tracker.get_hand_state(img)
            mp_latency = (time.time() - t_start) * 1000
            
            if PRESENTATION_MODE:
                cv2.putText(tracked_img, f"Latencia MediaPipe: {int(mp_latency)}ms", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                status = "Moviendo cursor"
                if state["is_pinching"]:
                    status = "CLIC (Pinza)"
                    cv2.circle(tracked_img, (state["cursor_x"], state["cursor_y"]), 15, (0, 255, 0), cv2.FILLED)
                elif state["is_open"]:
                    status = "PAUSA (Mano Abierta)"
                    cv2.circle(tracked_img, (state["cursor_x"], state["cursor_y"]), 15, (0, 0, 255), cv2.FILLED)
                else:
                    cv2.circle(tracked_img, (state["cursor_x"], state["cursor_y"]), 10, (255, 0, 0), cv2.FILLED)
                    
                cv2.putText(tracked_img, status, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.imshow("IR Productions - Presentacion Tracking", tracked_img)
                cv2.waitKey(1)
            
            if state["detected"]:
                cam_h, cam_w, _ = img.shape
                raw_x = (state["cursor_x"] / cam_w) * am.internal_w
                # Aplicamos PALM_SENSITIVITY desde el centro
                cx = am.internal_w / 2
                target_x = int(cx + (raw_x - cx) * PALM_SENSITIVITY)
                target_y = int((state["cursor_y"] / cam_h) * am.internal_h)
                
                cursor_pos = (
                    int(cursor_pos[0] + (target_x - cursor_pos[0]) * 0.5),
                    int(cursor_pos[1] + (target_y - cursor_pos[1]) * 0.5)
                )
                is_open = state["is_open"]
                # Pinch is not needed anymore for gameplay, we only track the hand
        else:
            if not cam_error_reported:
                print("Error de cámara.")
                cam_error_reported = True

    cursor_rect = pygame.Rect(cursor_pos[0] - 15, cursor_pos[1] - 15, 30, 30)
    internal_surface.fill((0, 0, 0))

    is_pinching_menu = (cap.isOpened() and state.get("is_pinching", False))
    if current_state == STATE_INTRO:
        internal_surface.blit(am.get_img('background'), (0, 0))
        internal_surface.blit(am.get_img('trees'), (0, 0))
        internal_surface.blit(am.get_img('bushes'), (0, 0))

        # Intro Title
        internal_surface.blit(am.get_img('intro_bg1'), am.get_rect('intro_bg1').topleft)
        internal_surface.blit(am.get_img('intro_bg2'), am.get_rect('intro_bg2').topleft)
        internal_surface.blit(am.get_img('intro_title'), am.get_rect('intro_title').topleft)

        hover, click = ui.check_interaction(cursor_rect, "btn_inicio_center", is_pinching_menu)
        ui.draw_button(internal_surface, "btn_inicio_center", "btn_inicio", "btn_inicio_txt", hover=hover)
        
        if click:
            current_state = STATE_TUTORIAL_READING
            tutorial_start_time = pygame.time.get_ticks()
            time.sleep(0.5)

    elif current_state == STATE_TUTORIAL_READING:
        internal_surface.blit(am.get_img('background'), (0, 0))
        internal_surface.blit(am.get_img('trees'), (0, 0))
        internal_surface.blit(am.get_img('bushes'), (0, 0))

        # Tutorial text (No buttons, no canecas)
        internal_surface.blit(am.get_img('tutorial_bg'), am.get_rect('tutorial_bg').topleft)
        internal_surface.blit(am.get_img('tutorial_txt'), am.get_rect('tutorial_txt').topleft)

        if pygame.time.get_ticks() - tutorial_start_time > 6000:
            current_state = STATE_TUTORIAL
            
    elif current_state == STATE_TUTORIAL:
        internal_surface.blit(am.get_img('background'), (0, 0))
        internal_surface.blit(am.get_img('trees'), (0, 0))
        internal_surface.blit(am.get_img('bushes'), (0, 0))

        # Tutorial text
        internal_surface.blit(am.get_img('tutorial_bg'), am.get_rect('tutorial_bg').topleft)
        internal_surface.blit(am.get_img('tutorial_txt'), am.get_rect('tutorial_txt').topleft)

        # Draw 3 cans at the bottom
        internal_surface.blit(am.get_img('caneca_verde'), am.get_rect('caneca_verde').topleft)
        internal_surface.blit(am.get_img('caneca_negra'), am.get_rect('caneca_negra').topleft)
        internal_surface.blit(am.get_img('caneca_azul'), am.get_rect('caneca_azul').topleft)

        hover, click = ui.check_interaction(cursor_rect, "btn_inicio_center", is_pinching_menu)
        ui.draw_button(internal_surface, "btn_inicio_center", "btn_inicio", "btn_inicio_txt", hover=hover)
        
        if click:
            current_state = STATE_PLAYING
            score = 0
            mistakes = 0
            current_level_idx = 0
            correct_in_level = 0
            trash_items = []
            time.sleep(0.5)

    elif current_state == STATE_PLAYING:
        target_bin_type = LEVELS[current_level_idx]
        bin_key = f"caneca_{target_bin_type.lower()}"
        bin_rect = am.get_rect(bin_key)
        
        if not is_open:
            # Spawning
            spawn_timer += 1
            if spawn_timer > 30:
                trash_items.append(Trash())
                spawn_timer = 0

            # Mover la caneca con la mano (X horizontal)
            # Centramos la caneca en el cursor
            bin_rect.x = cursor_pos[0] - (bin_rect.w // 2)
            # Limitamos la caneca para que no se salga de la pantalla
            bin_rect.x = max(0, min(bin_rect.x, am.internal_w - bin_rect.w))
            am.layout[bin_key]["x"] = bin_rect.x

            # Actualizar y chequear basuras
            for t in trash_items[:]:
                t.update()
                
                # Colisión
                if t.rect.colliderect(bin_rect):
                    if t.type == target_bin_type:
                        score += 10
                        correct_in_level += 1
                    else:
                        score = max(0, score - 2)
                        mistakes += 1
                    trash_items.remove(t)
                elif t.rect.y > am.internal_h:
                    if t.type == target_bin_type:
                        # Dejó caer basura que era para esta caneca
                        score = max(0, score - 2)
                        mistakes += 1
                    trash_items.remove(t)
                    

            if correct_in_level >= SCORE_TO_PASS:
                current_state = STATE_LEVEL_COMPLETE
                time.sleep(0.5)
            elif mistakes >= MAX_MISTAKES:
                current_state = STATE_GAMEOVER
                time.sleep(0.5)

        # Rendering de PLAYING
        internal_surface.blit(am.get_img("background"), (0, 0))
        internal_surface.blit(am.get_img("trees"), (0, 0))
        internal_surface.blit(am.get_img("bushes"), (0, 0))

        # Dibujar Caneca en movimiento
        internal_surface.blit(am.get_img(bin_key), bin_rect.topleft)

        for t in trash_items:
            t.draw(internal_surface)

        # UI Textos
        txt_score = font_medium.render(f"PUNTOS: {score}", True, am.get_color("white"))
        txt_level = font_medium.render(f"NIVEL {current_level_idx + 1}: CANECA {target_bin_type}", True, am.get_color("white"))
        txt_progress = font_medium.render(f"PROGRESO: {correct_in_level}/{SCORE_TO_PASS}", True, am.get_color("white"))
        
        if DEBUG_MODE:
            pygame.draw.rect(internal_surface, (255, 0, 0), bin_rect, 4)
            for t in trash_items:
                pygame.draw.rect(internal_surface, (255, 0, 0), t.rect, 4)
                
            txt_fps = font_medium.render(f"FPS: {int(clock.get_fps())}", True, (255,0,0))
            txt_lat = font_medium.render(f"MP Latencia: {int(mp_latency)}ms", True, (255,0,0))
            internal_surface.blit(txt_fps, (20, 100))
            internal_surface.blit(txt_lat, (20, 140))
            
        internal_surface.blit(font_medium.render(f"PUNTOS: {score}", True, am.get_color("black")), (22, 22))
        internal_surface.blit(txt_score, (20, 20))
        
        internal_surface.blit(font_medium.render(f"NIVEL {current_level_idx + 1}: CANECA {target_bin_type}", True, am.get_color("black")), (am.internal_w//2 - txt_level.get_width()//2 + 2, 22))
        internal_surface.blit(txt_level, (am.internal_w//2 - txt_level.get_width()//2, 20))

        internal_surface.blit(font_medium.render(f"PROGRESO: {correct_in_level}/{SCORE_TO_PASS}", True, am.get_color("black")), (am.internal_w - 350 + 2, 22))
        internal_surface.blit(txt_progress, (am.internal_w - 350, 20))
        
    elif current_state == STATE_LEVEL_COMPLETE:
        internal_surface.blit(am.get_img("background"), (0, 0))
        internal_surface.blit(am.get_img("trees"), (0, 0))
        internal_surface.blit(am.get_img("bushes"), (0, 0))
        
        fel_rect = am.get_rect("felicitaciones_bg")
        internal_surface.blit(am.get_img("felicitaciones_bg"), fel_rect.topleft)
        internal_surface.blit(am.get_img("felicitaciones_txt"), fel_rect.topleft)
        
        # Draw 3 cans at the bottom
        internal_surface.blit(am.get_img('caneca_verde'), am.get_rect('caneca_verde').topleft)
        internal_surface.blit(am.get_img('caneca_negra'), am.get_rect('caneca_negra').topleft)
        internal_surface.blit(am.get_img('caneca_azul'), am.get_rect('caneca_azul').topleft)
        
        is_pinching_menu = (cap.isOpened() and state.get("is_pinching", False))
        
        if current_level_idx < len(LEVELS) - 1:
            hover, click = ui.check_interaction(cursor_rect, "btn_inicio_center", is_pinching_menu)
            ui.draw_button(internal_surface, "btn_inicio_center", "btn_inicio", None, hover=hover)
            txt_next = font_medium.render("Siguiente Nivel", True, am.get_color("white"))
            internal_surface.blit(txt_next, (am.layout["btn_inicio_center"]["x"] + am.layout["btn_inicio_center"]["w"]//2 - txt_next.get_width()//2, am.layout["btn_inicio_center"]["y"] + am.layout["btn_inicio_center"]["h"]//2 - txt_next.get_height()//2))
            if click:
                current_level_idx += 1
                correct_in_level = 0
                mistakes = 0
                trash_items = []
                current_state = STATE_PLAYING
                time.sleep(0.5)
        else:
            hover_left, click_left = ui.check_interaction(cursor_rect, "btn_inicio_left", is_pinching_menu)
            hover_right, click_right = ui.check_interaction(cursor_rect, "btn_volver_right", is_pinching_menu)
            
            ui.draw_button(internal_surface, "btn_inicio_left", "btn_inicio", "btn_inicio_txt", hover=hover_left)
            ui.draw_button(internal_surface, "btn_volver_right", "btn_inicio", "btn_replay_txt", hover=hover_right)
            
            if click_left:
                current_state = STATE_INTRO
                time.sleep(0.5)
            if click_right:
                current_state = STATE_PLAYING
                score = 0
                mistakes = 0
                current_level_idx = 0
                correct_in_level = 0
                trash_items = []
                time.sleep(0.5)


    elif current_state == STATE_GAMEOVER:
        internal_surface.blit(am.get_img("background"), (0, 0))
        internal_surface.blit(am.get_img("trees"), (0, 0))
        internal_surface.blit(am.get_img("bushes"), (0, 0))
        
        # Game Over Banner
        over_rect = am.get_rect("gameover_bg")
        internal_surface.blit(am.get_img("gameover_bg"), over_rect.topleft)
        internal_surface.blit(am.get_img("gameover_txt"), over_rect.topleft)
        
        # Draw 3 cans at the bottom
        internal_surface.blit(am.get_img('caneca_verde'), am.get_rect('caneca_verde').topleft)
        internal_surface.blit(am.get_img('caneca_negra'), am.get_rect('caneca_negra').topleft)
        internal_surface.blit(am.get_img('caneca_azul'), am.get_rect('caneca_azul').topleft)
        
        is_pinching_menu = (cap.isOpened() and state.get("is_pinching", False))
        
        hover_left, click_left = ui.check_interaction(cursor_rect, "btn_inicio_left", is_pinching_menu)
        hover_right, click_right = ui.check_interaction(cursor_rect, "btn_volver_right", is_pinching_menu)
        
        ui.draw_button(internal_surface, "btn_inicio_left", "btn_inicio", "btn_inicio_txt", hover=hover_left)
        ui.draw_button(internal_surface, "btn_volver_right", "btn_inicio", "btn_replay_txt", hover=hover_right)
        
        if click_left:
            current_state = STATE_INTRO
            time.sleep(0.5)
        if click_right:
            current_state = STATE_PLAYING
            score = 0
            mistakes = 0
            correct_in_level = 0
            trash_items = []
            time.sleep(0.5)

    if is_open and current_state == STATE_PLAYING:
        txt_pausa = font_large.render("PAUSA", True, am.get_color("red"))
        internal_surface.blit(txt_pausa, (am.internal_w//2 - txt_pausa.get_width()//2, am.internal_h//2))
        
    # Renderizar Cursor para menús (punto verde)
    if current_state != STATE_PLAYING:
        is_pinching_menu = (cap.isOpened() and state.get("is_pinching", False))
        cursor_color = am.get_color("green") if is_pinching_menu else am.get_color("white")
        pygame.draw.circle(internal_surface, cursor_color, cursor_pos, 25, 6) 
        pygame.draw.circle(internal_surface, cursor_color, cursor_pos, 8) 
    
    if not cap.isOpened():
        txt_err = font_medium.render("CÁMARA NO DETECTADA", True, am.get_color("red"))
        internal_surface.blit(txt_err, (am.internal_w//2 - txt_err.get_width()//2, 20))

    scaled_surface = pygame.transform.scale(internal_surface, (PHYSICAL_W, PHYSICAL_H))
    screen.blit(scaled_surface, (0, 0))

    pygame.display.flip()
    clock.tick(am.fps)

if cap.isOpened():
    cap.release()
pygame.quit()
