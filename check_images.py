import requests

assets = [
    '/static/images/FondoFondo/BackBackground.png',
    '/static/images/FondoFondo/arboles.png',
    '/static/images/FondoFondo/arbustos.png',
    '/static/images/Canecas/obj_CANECA VERDE.png',
    '/static/images/Canecas/obj_CANECA AZUL.png',
    '/static/images/Canecas/obj_CANECA NEGRA .png',
    '/static/images/TL-INTRO_juega y aprende/bg1.png',
    '/static/images/TL-INTRO_juega y aprende/bg2.png',
    '/static/images/TL-INTRO_juega y aprende/juega y aprende.png',
    '/static/images/TL_instrucciones/TL_instrucciones_bkg.png',
    '/static/images/TL_instrucciones/TL_instrucciones_txt.png',
    '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_bkg.png',
    '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_inicio_txt.png',
    '/static/images/BTN_INICIO-VOLVER A JUGAR/btn_volver a jugar_txt.png',
    '/static/images/TLs_/btn_FELICITACIONES_bkg.png',
    '/static/images/TLs_/btn_FELICITACIONES_txt.png',
    '/static/images/TLs_/btn_intentalo de nuevo_bkg.png',
    '/static/images/TLs_/btn_intentalo de nuevo_txt.png'
]

for i in range(1, 8): assets.append(f'/static/images/BasuraCae/Caneca1Verde_Basura{i}.png')
for i in range(1, 17): assets.append(f'/static/images/BasuraCae/Caneca3Azul_Basura{i}.png')
for i in range(1, 14): assets.append(f'/static/images/BasuraCae/Caneca2Negro_Basura{i}.png')

missing = []
for url_path in assets:
    # URL encode spaces
    encoded_path = url_path.replace(' ', '%20')
    url = f'https://lluvia-de-basurawebdev.netlify.app{encoded_path}'
    res = requests.head(url)
    if res.status_code != 200:
        print(f'MISSING: {url_path} ({res.status_code})')
        missing.append(url_path)

if not missing:
    print("All images found on Netlify!")
