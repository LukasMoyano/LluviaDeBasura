import json
import pygame
import os

class AssetManager:
    def __init__(self, config_file="config.json"):
        with open(config_file, 'r') as f:
            self.config = json.load(f)
            
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        
        self.images = {}
        self.layout = self.config["layout"]
        self.colors = self.config["colors"]
        
        # Resolución interna pura del juego (1920x1080)
        self.internal_w = self.config["resolution"]["width"]
        self.internal_h = self.config["resolution"]["height"]
        self.internal_resolution = (self.internal_w, self.internal_h)
        self.fps = self.config["resolution"]["fps"]

    def load_all(self):
        """Carga todas las imágenes del config.json y les aplica la escala del Layout"""
        for key, path in self.config["assets"].items():
            full_path = os.path.join(self.base_dir, path)
            try:
                img = pygame.image.load(full_path).convert_alpha()
                
                # Si el asset tiene dimensiones específicas en 'layout', redimensionarlo
                if key in self.layout:
                    w, h = self.layout[key]["w"], self.layout[key]["h"]
                    img = pygame.transform.scale(img, (w, h))
                # Los fondos se estiran a 1920x1080 por defecto, pero árboles y arbustos conservan tamaño
                elif key in ["background", "trees", "bushes"]:
                    img = pygame.transform.scale(img, self.internal_resolution)
                    
                self.images[key] = img
            except Exception as e:
                print(f"Error cargando asset '{key}' desde {full_path}: {e}")
                # Superficie fucsia de error para evitar que crashee
                surf = pygame.Surface((100, 100), pygame.SRCALPHA)
                surf.fill((255, 0, 255))
                self.images[key] = surf

    def get_img(self, key):
        return self.images.get(key)

    def get_color(self, name):
        """Devuelve una tupla RGB. Ej: get_color('white') -> (255, 255, 255)"""
        return tuple(self.colors.get(name, [255, 255, 255]))

    def get_rect(self, name):
        """Retorna un pygame.Rect con la posición y tamaño exacto del layout"""
        data = self.layout.get(name)
        if data:
            return pygame.Rect(data["x"], data["y"], data["w"], data["h"])
        return pygame.Rect(0, 0, 100, 100)


class UIManager:
    """Clase para manejar interacciones de la UI (Hover, Clics) de OpenCV"""
    def __init__(self, asset_manager):
        self.am = asset_manager

    def draw_button(self, surface, rect_key, img_bg_key, img_txt_key=None, hover=False):
        """Dibuja un botón. Puede recibir un estado de hover para hacer efecto visual."""
        rect = self.am.get_rect(rect_key)
        bg = self.am.get_img(img_bg_key)
        
        # Efecto Hover: Si el cursor está encima, agrandamos el botón ligeramente
        if hover:
            inflated_rect = rect.inflate(20, 20)
            scaled_bg = pygame.transform.scale(bg, (inflated_rect.w, inflated_rect.h))
            surface.blit(scaled_bg, inflated_rect.topleft)
            
            if img_txt_key:
                txt = self.am.get_img(img_txt_key)
                scaled_txt = pygame.transform.scale(txt, (inflated_rect.w, inflated_rect.h))
                surface.blit(scaled_txt, inflated_rect.topleft)
        else:
            surface.blit(bg, rect.topleft)
            if img_txt_key:
                txt = self.am.get_img(img_txt_key)
                scaled_txt = pygame.transform.scale(txt, (rect.w, rect.h))
                surface.blit(scaled_txt, rect.topleft)

    def check_interaction(self, cursor_rect, button_rect_key, is_pinching):
        """
        Retorna (is_hovering, is_clicked)
        """
        btn_rect = self.am.get_rect(button_rect_key)
        is_hover = btn_rect.colliderect(cursor_rect)
        is_clicked = is_hover and is_pinching
        return is_hover, is_clicked
