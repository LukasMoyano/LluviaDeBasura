# Bitácora de Desarrollo - Lluvia de Basura (Web)
**Conversation ID:** `5f25bb5e-56f4-49d1-a620-803e74ac8e65`
**Fecha de corte:** 1 de Octubre de 2026

## 📌 Estado del Proyecto: Versión Congelada (Freeze)
Se ha decidido por instrucción directa que la aplicación web, en su estado y funcionamiento actual, es estable y cumple con todos los requerimientos B2B/B2G planteados. **Se dejará tal cual y no se harán más modificaciones de código hasta nuevo aviso.**

## 🌐 Enlaces Críticos
* **URL de Producción (Netlify):** [https://lluvia-de-basurawebdev.netlify.app](https://lluvia-de-basurawebdev.netlify.app)
* **IP de Desarrollo Local (Tailscale):** `http://100.93.134.33:8080` (Requiere levantar el servidor localmente con `python3 -m http.server 8080 --bind 0.0.0.0`).

## 📋 Resumen de la Sesión y Logros Alcanzados
1. **Despliegue Exitoso en Netlify:** Se solucionaron los errores de *build* en Netlify eliminando el archivo `requirements.txt` de la carpeta web (`11_lluvia_de_basura_web`), evitando que el contenedor de Linux de Netlify intentara (y fallara al) compilar librerías de Python/C++ (como Pygame y OpenCV).
2. **Sincronización Total:** Se resolvieron conflictos del repositorio local, se hizo un rebase con los cambios remotos y se empujó limpiamente el proyecto a la rama `main` en GitHub.
3. **Consolidación de Arquitectura Híbrida:** 
   - El código offline (Kiosco interactivo GPU/Edge AI con MediaPipe) está en su propia ruta.
   - Esta carpeta web es exclusiva para interacción universal vía Vanilla JS y HTML5 Canvas, libre de dependencias pesadas.
4. **UX/UI Orientada a Negocios:** La *landing page* (`index.html`) ha sido perfeccionada y estructurada para presentar la experiencia a instituciones y empresas bajo el sello de *Soberanía Tecnológica* y estética *Cyberpunk Andino*.

## 🚀 Cómo Retomar Más Adelante
Si necesitas continuar desarrollando sobre este proyecto, simplemente inicia un nuevo chat con Gemini / Antigravity y dile:
> *"Por favor revisa la bitácora BITACORA_DEV_5f25bb5e.md o retoma el Conversation ID 5f25bb5e-56f4-49d1-a620-803e74ac8e65 para continuar con el desarrollo de Lluvia de Basura."*
