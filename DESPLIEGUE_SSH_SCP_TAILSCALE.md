# 🛰️ Protocolo de Despliegue Remoto SSH / SCP / Tailscale
**Proyecto:** Lluvia de Basura - Edición Feria de la Ciencia  
**Máquina Remota (Destino):** `masterlinuxlite` (Lenovo ideapad 110-15ACL)  
**Tailscale IP:** `100.76.26.116`  
**Ruta Destino:** `/home/masterlinuxlite/Documents/FeriaDeLaCiencia_ColegioBelen/11_LuviaDeBasura/`

---

## 📌 1. Método Preferente: Copia Quirúrgica Directa (SCP)

Cuando realices cambios en el computador principal y quieras enviarlos de inmediato a la máquina de la feria sin pasar por GitHub:

### A. Enviar solo los archivos de código modificados (`main.py` y `vision_tracker.py`):
Desde la terminal del PC Principal:
```bash
scp main.py vision_tracker.py masterlinuxlite@100.76.26.116:/home/masterlinuxlite/Documents/FeriaDeLaCiencia_ColegioBelen/11_LuviaDeBasura/
```

### B. Enviar con ruta absoluta desde cualquier lugar del sistema:
```bash
scp /mnt/Proyectos4TB/backup_masterlukas/Documents/_-IR_Productions_2025/11_LuviaDeBasura/main.py /mnt/Proyectos4TB/backup_masterlukas/Documents/_-IR_Productions_2025/11_LuviaDeBasura/vision_tracker.py masterlinuxlite@100.76.26.116:/home/masterlinuxlite/Documents/FeriaDeLaCiencia_ColegioBelen/11_LuviaDeBasura/
```

---

## ⚡ 2. Método Alternativo de Alto Rendimiento (Rsync)

Si modificas imágenes, assets o múltiples archivos a la vez, `rsync` sincroniza únicamente las diferencias con compresión y barra de progreso:

```bash
rsync -avzP main.py vision_tracker.py config.json masterlinuxlite@100.76.26.116:/home/masterlinuxlite/Documents/FeriaDeLaCiencia_ColegioBelen/11_LuviaDeBasura/
```

---

## 🌐 3. Método Tailscale Drop (Nativo)

Si ambas máquinas tienen Tailscale activo:
```bash
tailscale file cp main.py vision_tracker.py masterlinuxlite-lenovo-ideapad-110-15acl:
```

---

## 🔄 4. Método Sincronización Git (Desde la máquina destino)

Si los cambios ya fueron subidos al repositorio:
En la terminal de `masterlinuxlite`:
```bash
git fetch origin main && git reset --hard origin/main
```

---

## 🎮 5. Protocolo de Ejecución en `masterlinuxlite`

Una vez recibidos los archivos en el equipo de la feria:
```bash
source venv/bin/activate
python3 main.py
```

### Parámetros de Cámara:
* Por defecto, el juego auto-detecta la cámara Syntek probando índices `0, 1, 2, 3`.
* Para forzar un índice específico manualmente:
  ```bash
  python3 main.py 0   # Cámara 0
  python3 main.py 1   # Cámara 1
  ```

---

## 🚀 6. Arquitectura de Optimización Aplicada (AMD A8 / CPU Modesta)

1. **Visión Ultrarrápida en Hilo Independiente (`VisionWorker`):** 
   - Eliminados hilos dobles redundantes y bloqueos de contención GIL.
   - La cámara corre en captura directa sin búfer retenido.
2. **Inferencia MediaPipe Zero-Copy:**
   - Redimensionamiento del cuadro a 320x240 antes de la IA.
   - Bandera `img_rgb.flags.writeable = False` para ejecución directa en C++ XNNPACK sin copias en memoria.
   - Latencia reducida de 100ms a **10-14ms**.
3. **Cero Retraso en Ventana OpenCV:**
   - Se reemplazó `cv2.waitKey(1)` (que dormía hasta 15ms en X11) por `cv2.pollKey()`.
   - Se dibuja directamente sobre el cuadro procesado sin duplicar memoria.
4. **Respaldo Automático con Mouse:**
   - Si la cámara no detecta la mano o está fuera de foco, el cursor físico del mouse toma el control de inmediato.
