import cv2
import mediapipe as mp
import math

class HandTracker:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.mp_draw = mp.solutions.drawing_utils

    def get_hand_state(self, image):
        # Convertir a RGB para MediaPipe
        img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(img_rgb)
        
        state = {
            "cursor_x": 0,
            "cursor_y": 0,
            "is_pinching": False,
            "is_open": False,
            "detected": False
        }
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Dibujar las conexiones de la mano para debug
                self.mp_draw.draw_landmarks(image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                
                h, w, _ = image.shape
                
                # Obtener puntos clave
                index_tip = hand_landmarks.landmark[self.mp_hands.HandLandmark.INDEX_FINGER_TIP]
                thumb_tip = hand_landmarks.landmark[self.mp_hands.HandLandmark.THUMB_TIP]
                
                # IDs de las puntas de los 4 dedos (excluyendo pulgar)
                tips_ids = [
                    self.mp_hands.HandLandmark.INDEX_FINGER_TIP,
                    self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
                    self.mp_hands.HandLandmark.RING_FINGER_TIP,
                    self.mp_hands.HandLandmark.PINKY_TIP
                ]
                # IDs de las articulaciones medias (PIP) para comprobar si el dedo está extendido
                pips_ids = [
                    self.mp_hands.HandLandmark.INDEX_FINGER_PIP,
                    self.mp_hands.HandLandmark.MIDDLE_FINGER_PIP,
                    self.mp_hands.HandLandmark.RING_FINGER_PIP,
                    self.mp_hands.HandLandmark.PINKY_PIP
                ]
                
                # Posición del cursor basada en el dedo índice
                state["cursor_x"] = int(index_tip.x * w)
                state["cursor_y"] = int(index_tip.y * h)
                state["detected"] = True
                
                # Detectar PINZA (Pellizco) - Distancia euclidiana entre pulgar e índice
                ix, iy = int(index_tip.x * w), int(index_tip.y * h)
                tx, ty = int(thumb_tip.x * w), int(thumb_tip.y * h)
                distance = math.hypot(tx - ix, ty - iy)
                
                if distance < 40: # Umbral de pinza (ajustable según distancia de cámara)
                    state["is_pinching"] = True
                    
                # Detectar MANO ABIERTA (Pausa)
                fingers_open = 0
                for tip, pip in zip(tips_ids, pips_ids):
                    if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[pip].y:
                        fingers_open += 1
                
                if fingers_open == 4 and distance > 40:
                    state["is_open"] = True

        return state, image

def main():
    import sys
    
    # Si el usuario pasa un número como argumento, usarlo como índice de cámara.
    # Ej: python3 vision_tracker.py 2
    cam_index = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    
    print(f"Iniciando cámara en índice {cam_index} (Backend V4L2)...")
    # Forzar backend V4L2 que es más estable en Linux
    cap = cv2.VideoCapture(cam_index, cv2.CAP_V4L2)
    
    if not cap.isOpened():
        print(f"Error: No se pudo abrir la cámara {cam_index}.")
        print("Intenta pasar otro índice, por ejemplo: python3 vision_tracker.py 2")
        return
        
    tracker = HandTracker()
    
    print("Iniciando Fase 1: Tracker de Visión Computacional...")
    print("Presiona 'q' en la ventana de video para salir.")
    
    # Descartar los primeros 5 frames (a veces las webcams inician en negro)
    for _ in range(5):
        cap.read()
    
    while True:
        success, img = cap.read()
        if not success or img is None:
            print("Se perdió la conexión con la cámara o el frame está vacío.")
            break
            
        # Comprobar si la imagen es totalmente negra
        if img.max() == 0:
            cv2.putText(img, "ESPERANDO IMAGEN DE LA CAMARA...", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(img, f"Prueba: python3 vision_tracker.py 2", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            
        # Efecto espejo para que el control sea natural
        img = cv2.flip(img, 1) 
        state, img = tracker.get_hand_state(img)
        
        if state["detected"]:
            # Dibujar el cursor principal (índice)
            cv2.circle(img, (state["cursor_x"], state["cursor_y"]), 10, (255, 0, 0), cv2.FILLED)
            
            # Texto de estado
            status = "Apuntando (Moviendo Cursor)"
            color = (0, 255, 255) # Amarillo
            
            if state["is_pinching"]:
                status = "Agarrando (PINZA - CLIC)"
                color = (0, 255, 0) # Verde
                # Hacer el cursor más grande y verde al agarrar
                cv2.circle(img, (state["cursor_x"], state["cursor_y"]), 15, color, cv2.FILLED)
            elif state["is_open"]:
                status = "Mano Abierta (PAUSA)"
                color = (0, 0, 255) # Rojo
                
            cv2.putText(img, status, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            
        cv2.imshow("IR Productions - Lluvia de Basura CV (Fase 1)", img)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
