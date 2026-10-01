# 📚 Resumen de Interacción y Desarrollo Técnico
**Conversation ID:** `640ba32f-3503-4928-83ae-a49c089e058e`
**Fecha:** Octubre 1, 2026
**Proyecto:** Lluvia de Basura (-IR- Productions)

## 🎯 Objetivos Logrados

Durante esta sesión hemos abarcado un ciclo de desarrollo completo para llevar "Lluvia de Basura" desde un prototipo local hacia un producto comercial maduro con dos frentes de despliegue: **Offline (BTL/Física)** y **Online (B2B Web)**.

### 1. Frente "Offline" / Exhibición (Kiosco Físico)
*   **Modo Presentación (IA en vivo):** Se implementó una lógica de "Pantalla Dividida" en Python. Pygame maneja la interfaz interactiva gráfica (*Cyberpunk Andino*), mientras que un hilo paralelo usa OpenCV para mostrarle al público la cámara web en crudo, el mapeo de esqueleto de MediaPipe, el Bounding Box y la latencia en milisegundos.
*   **Rescate de Archivos y Manual:** Tras un conflicto de control de versiones (`git`), se rescataron los archivos pesados de Python (`main.py`, `vision_tracker.py`, etc.) asegurándolos en la rama principal. Se creó un archivo `INSTRUCCIONES_OFFLINE.md` con los comandos exactos para correr el juego en el colegio sin internet.
*   **Corrección Gráfica de Proporciones:** Los árboles y arbustos de fondo se veían distorsionados. Mediante un script automatizado en Python (PIL), limpiamos el canal Alfa (espacio vacío) y redimensionamos las imágenes al ancho nativo (1920x1080) colocándolas perfectamente en la base, eliminando cualquier estiramiento.

### 2. Frente "Online" / B2B (Plataforma Web)
*   **Refactorización a Sitio Estático:** Se eliminó la dependencia de Flask (Backend) y se reescribió `game_engine.js` en *Vanilla JS* usando HTML5 Canvas. La jugabilidad web se desvinculó de la cámara para operarse 100% con *Mouse* o *Touch*.
*   **Conexión de CRM Webhook (Google Workspace):** Se configuró la landing page alojada en Netlify para captar *Leads Institucionales*. Validamos correos corporativos y conectamos un script (`fetch`) hacia un *Google Apps Script Web App* que inyecta los datos directamente en un Google Sheets privado del usuario.
*   **Identidad y Ventas B2B/B2G:** Redactamos un nuevo `README.md` trilingüe (ES, EN, FR) enfocado en inversores y clientes gubernamentales. Se destacó el uso de *Edge Computing*, *Zero-Touch Interaction* y la *Soberanía de Datos*.

---

## 🛠️ Notas Adicionales
*   **Inkscape (Resolución de dudas):** Se explicó la técnica de "Máscara de Recorte" (Clip) en Inkscape para ocultar áreas de un mapa de bits que sobresalen del lienzo, manteniendo la edición no destructiva para el diseño del pendón físico 1x2m.

*Este archivo sirve como punto de control. Puedes usar el Conversation ID mencionado arriba para retomar el contexto exacto de esta arquitectura en futuras sesiones con el sistema.*
