import cv2
import pickle
import os

# Lista de rutas de videos para cargar múltiples videos
video_paths = [
    r'C:/Users/SSD/Desktop/cimpark/backend/cimpark.mp4',
    r'C:/Users/SSD/Desktop/cimpark/backend/cimpark2.mp4',
    r'C:/Users/SSD/Desktop/cimpark/backend/carPark.mp4',
     "rtsp://10.32.91.192:554/title",

    # Agrega más rutas de videos según sea necesario
]

# Variables para manejar el flujo de posiciones
temp_points = []
current_video_index = 0
posList = []

def get_video_name(video_path):
    """Obtén solo el nombre del archivo de video sin la ruta completa y sin la extensión."""
    return os.path.splitext(os.path.basename(video_path))[0]

def load_positions(video_name):
    """Cargar las posiciones de estacionamiento para un video específico."""
    car_park_file = f"{video_name}_CarParkPos"
    if os.path.exists(car_park_file):
        with open(car_park_file, 'rb') as f:
            return pickle.load(f)
    return []

def save_positions(video_name, posList):
    """Guardar las posiciones de estacionamiento para un video específico."""
    car_park_file = f"{video_name}_CarParkPos"
    with open(car_park_file, 'wb') as f:
        pickle.dump(posList, f)

def mouseClick(events, x, y, flags, params):
    global temp_points, posList

    if events == cv2.EVENT_LBUTTONDOWN:
        temp_points.append((x, y))

        if len(temp_points) == 2:
            posList.append((temp_points[0], temp_points[1]))
            temp_points = []  

    if events == cv2.EVENT_RBUTTONDOWN:
        if posList:
            posList.pop()  

    save_positions(get_video_name(video_paths[current_video_index]), posList)

def process_video(video_path):
    global posList, temp_points
    video_name = get_video_name(video_path)
    posList = load_positions(video_name)

    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("Error al leer el video.")
        return False

    while True:
        img = frame.copy()

        # Dibujar rectángulos en las posiciones marcadas
        for rect in posList:
            if isinstance(rect[0], tuple) and isinstance(rect[1], tuple):
                cv2.rectangle(img, rect[0], rect[1], (255, 0, 255), 2)

        # Dibujar puntos temporales
        for point in temp_points:
            cv2.circle(img, point, 5, (0, 255, 0), -1)

        cv2.imshow("Frame", img)
        cv2.setMouseCallback("Frame", mouseClick)

        key = cv2.waitKey(1)
        if key == ord('q'):  # Termina el programa con 'q'
            break
        elif key == ord('n'):  # Avanza al siguiente video con 'n'
            return 'next'
        elif key == ord('p'):  # Retrocede al video anterior con 'p'
            return 'previous'

    cv2.destroyAllWindows()
    return False

# Bucle principal para procesar todos los videos
while True:
    current_video_path = video_paths[current_video_index]
    print(f"Procesando video: {get_video_name(current_video_path)}")

    action = process_video(current_video_path)
    if action == 'next':
        current_video_index = (current_video_index + 1) % len(video_paths)
    elif action == 'previous':
        current_video_index = (current_video_index - 1) % len(video_paths)
    else:
        break  # Salir del bucle si se presiona 'q'

cv2.destroyAllWindows()
