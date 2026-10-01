import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ITEMS_DIR = os.path.join(BASE_DIR, 'static/images')

# Fondos y Backgrounds
ASSET_BACKGROUND = os.path.join(ITEMS_DIR, 'FondoFondo', 'BackBackground.png')
ASSET_TREES = os.path.join(ITEMS_DIR, 'FondoFondo', 'arboles.png')
ASSET_BUSHES = os.path.join(ITEMS_DIR, 'FondoFondo', 'arbustos.png')

# Canecas (Reciclaje)
ASSET_CANECA_VERDE = os.path.join(ITEMS_DIR, 'Canecas', 'obj_CANECA VERDE.png')
ASSET_CANECA_AZUL = os.path.join(ITEMS_DIR, 'Canecas', 'obj_CANECA AZUL.png')
ASSET_CANECA_NEGRA = os.path.join(ITEMS_DIR, 'Canecas', 'obj_CANECA NEGRA .png')

# Interfaz (UI)
ASSET_BTN_INICIO_BKG = os.path.join(ITEMS_DIR, 'BTN_INICIO-VOLVER A JUGAR', 'btn_inicio_bkg.png')
ASSET_BTN_INICIO_TXT = os.path.join(ITEMS_DIR, 'BTN_INICIO-VOLVER A JUGAR', 'btn_inicio_txt.png')
ASSET_BTN_REPLAY_TXT = os.path.join(ITEMS_DIR, 'BTN_INICIO-VOLVER A JUGAR', 'btn_volver a jugar_txt.png')

ASSET_INSTRUCCIONES_BKG = os.path.join(ITEMS_DIR, 'TL_instrucciones', 'TL_instrucciones_bkg.png')
ASSET_INSTRUCCIONES_TXT = os.path.join(ITEMS_DIR, 'TL_instrucciones', 'TL_instrucciones_txt.png')

ASSET_FELICITACIONES_BKG = os.path.join(ITEMS_DIR, 'TLs_', 'btn_FELICITACIONES_bkg.png')
ASSET_FELICITACIONES_TXT = os.path.join(ITEMS_DIR, 'TLs_', 'btn_FELICITACIONES_txt.png')
ASSET_TRYAGAIN_BKG = os.path.join(ITEMS_DIR, 'TLs_', 'btn_intentalo de nuevo_bkg.png')
ASSET_TRYAGAIN_TXT = os.path.join(ITEMS_DIR, 'TLs_', 'btn_intentalo de nuevo_txt.png')

ASSET_INTRO_BG1 = os.path.join(ITEMS_DIR, 'TL-INTRO_juega y aprende', 'bg1.png')
ASSET_INTRO_BG2 = os.path.join(ITEMS_DIR, 'TL-INTRO_juega y aprende', 'bg2.png')
ASSET_INTRO_TEXT = os.path.join(ITEMS_DIR, 'TL-INTRO_juega y aprende', 'juega y aprende.png')

# Función helper para obtener todas las basuras de una caneca específica
def get_basura_assets(caneca_prefix):
    """
    Retorna una lista de rutas de imágenes para un tipo de caneca.
    Ej: get_basura_assets('Caneca1Verde')
    """
    basura_dir = os.path.join(ITEMS_DIR, 'BasuraCae')
    if not os.path.exists(basura_dir):
        return []
        
    assets = []
    for f in os.listdir(basura_dir):
        if f.startswith(caneca_prefix) and f.endswith('.png'):
            assets.append(os.path.join(basura_dir, f))
    return assets

# Diccionario listo para cargar en Pygame
BASURA_ASSETS = {
    "VERDE": get_basura_assets('Caneca1Verde'),
    "AZUL": get_basura_assets('Caneca3Azul'),
    "NEGRA": get_basura_assets('Caneca2Negro')
}

if __name__ == "__main__":
    print("Assets mapeados exitosamente:")
    print(f"- {len(BASURA_ASSETS['VERDE'])} items para Caneca Verde")
    print(f"- {len(BASURA_ASSETS['AZUL'])} items para Caneca Azul")
    print(f"- {len(BASURA_ASSETS['NEGRA'])} items para Caneca Negra")
