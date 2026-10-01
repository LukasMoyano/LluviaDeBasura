# 🚀 Manual de Ejecución Offline (Feria de la Ciencia / Colegio)

Este manual contiene los pasos exactos para arrancar la experiencia de **Lluvia de Basura** en modo escritorio (Desktop), utilizando la cámara y la Inteligencia Artificial (MediaPipe) **sin necesidad de conexión a internet**.

---

## 💻 Requisitos Previos (Verificación In-Situ)

Antes de iniciar el evento, asegúrate de que estás en la carpeta del proyecto:
```bash
cd /mnt/Proyectos4TB/backup_masterlukas/Documents/_-IR_Productions_2025/11_LuviaDeBasura
```

Asegúrate de que el entorno virtual de Python está activado:
```bash
source venv/bin/activate
```
*(Si ves un `(venv)` al inicio de tu terminal, estás listo).*

---

## 🎮 Paso 1: Conectar la Cámara
1. Conecta la cámara web al puerto USB del computador.
2. Posiciona la cámara frente a la zona de interacción de los jugadores.

---

## 🚀 Paso 2: Arrancar el Juego (Modo Presentación)

Para arrancar el juego con el "Modo Exposición" activado (pantalla dividida para que el público vea el esqueleto de la IA y el jugador vea el juego), ejecuta el siguiente comando:

```bash
python3 main.py
```

### ¿Qué sucederá al ejecutarlo?
1. **Pantalla Principal (Pygame):** Se abrirá el juego en pantalla completa (o ventana grande) mostrando el *Cyberpunk Andino*.
2. **Pantalla Secundaria (OpenCV):** Se abrirá automáticamente una ventana pequeña paralela. Esta ventana mostrará el video en crudo de la cámara web, dibujará el esqueleto de la mano (MediaPipe), el bounding box, y la latencia en milisegundos (ms). 
3. **Flujo de Juego:** 
   - El usuario leerá las instrucciones.
   - Practicará calibrando su mano ("Pinza" / "Mano Abierta").
   - Jugará hasta cometer 5 errores o ganar.
   - El juego volverá a la pantalla de inicio automáticamente.

---

## 🛑 Paso 3: Apagar / Cerrar el Sistema
* Para cerrar el juego en cualquier momento, haz clic en la **X** de la ventana principal de Pygame o presiona **Esc**.
* Si la terminal se queda trabada, presiona **Ctrl + C** en la terminal.

---

## 🛡️ Solución de Problemas (Troubleshooting)

*   **El juego no arranca o lanza error de `cv2` / `mediapipe`:** Asegúrate de que activaste el entorno virtual (`source venv/bin/activate`) antes de correr `python3 main.py`.
*   **La cámara no da imagen:** Verifica que ninguna otra aplicación (como Zoom o un navegador) esté usando la cámara. El sistema de OpenCV tomará por defecto la cámara en el índice `0`. Si tienes múltiples cámaras conectadas y toma la equivocada, avísame para indicarte cómo cambiar el índice en `vision_tracker.py`.
*   **El ratón se vuelve loco en el menú:** Recuerda que la cámara toma el control absoluto del cursor en la pantalla principal. Mantén las manos fuera del rango visual de la cámara si necesitas hacer clic manualmente con el mouse físico.

---

¡Mucho éxito en la Feria! 🌿🤖
