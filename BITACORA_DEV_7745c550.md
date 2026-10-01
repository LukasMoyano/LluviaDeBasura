# Bitácora de Desarrollo - Lluvia de Basura (Web Adaptation)
**Conversation ID:** `7745c550-6311-4108-a209-3d7f14219974`

## Hitos Alcanzados:
1. **Separación de Ambientes (Live vs Web):** Se identificó que la carpeta `11_LuviaDeBasura/` mantiene el código Python original (OpenCV/MediaPipe) offline, mientras que `11_lluvia_de_basura_web/` es el entorno estricto para Netlify (Vanilla JS).
2. **Restauración del Repositorio Web:** Se ejecutó `git restore .` recuperando `index.html`, hojas de estilo y `game_engine.js`.
3. **Corrección de Bugs en Motor JavaScript:** Se solucionó el error de mayúsculas (`caneca_VERDE` vs `caneca_verde`) que impedía dibujar la caneca.
4. **Implementación de Delta Time:** Se desacopló la física del juego de los FPS del navegador (Chrome a 60Hz vs Firefox a 144Hz) usando `performance.now()` y `dt`, garantizando una caída a 650 píxeles por segundo y un 'spawn' cada 700 ms, sin importar el dispositivo.
5. **Rediseño Copywriting B2B & UX/UI (`index.html`):**
   - Se añadió la sección de **"Nuestro ADN"** resaltando el enfoque STEAM y Edge AI.
   - Se diseñó e implementó un **Panel de Instrucciones** Glassmorphism con animaciones sutiles (`pulse-glow`).
   - Se reorganizó la sección de **Magia Tecnológica** para que aparezca después de probar la Demo.
   - Se ampliaron las **Soluciones Institucionales** (Activaciones E-Waste Arcade, Dashboards Soberanos, Integración Post-Consumo).
   - Se mantuvo la integridad del **Webhook CRM Google Sheets**, ajustando visualmente el botón de WhatsApp al final de la landing page.

## Próximos Pasos (Pendientes para la próxima sesión):
- Hacer `git commit` y `git push` a `origin/main` para desplegar la nueva versión web en Netlify.
- Levantar y documentar el Manual de Supervivencia Offline para la versión en vivo de Python con IA.
