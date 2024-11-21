import cv2
import pickle
import os
from urllib.parse import urlparse
import math

video_sources = [
    r'https://storage.googleapis.com/cimpark-img/carPark.mp4',
    r'https://storage.googleapis.com/cimpark-img/cimpark.mp4',
    r'https://storage.googleapis.com/cimpark-img/cimpark2.mp4'
]

class ParkingSpacePicker:
    def __init__(self):
        self.temp_points = []
        self.current_video_index = 0
        self.posList = []
        self.modified = False
        self.current_window = None
        self.retry_count = 3  

    def get_source_name(self, source_path):
        """Obtén un identificador único para la fuente de video."""
        return os.path.splitext(os.path.basename(source_path))[0]

    def load_positions(self, source_name):
        """Cargar las posiciones de estacionamiento para una fuente específica."""
        car_park_file = f"{source_name}_CarParkPos"
        if os.path.exists(car_park_file):
            with open(car_park_file, 'rb') as f:
                return pickle.load(f)
        return []

    def save_positions(self, source_name):
        """Guardar las posiciones de estacionamiento para una fuente específica."""
        car_park_file = f"{source_name}_CarParkPos"
        with open(car_park_file, 'wb') as f:
            pickle.dump(self.posList, f)
        self.modified = False

    def calculate_distance(self, p1, p2):
        """Calcula la distancia entre dos puntos."""
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    def is_overlapping(self, rect1, rect2):
        """Verifica si dos rectángulos se solapan."""
        (x1, y1), (x2, y2) = rect1
        (a1, b1), (a2, b2) = rect2
        return not (x2 < a1 or a2 < x1 or y2 < b1 or b2 < y1)

    def mouseClick(self, events, x, y, flags, params):
        if events == cv2.EVENT_LBUTTONDOWN:
            print(f"Clic izquierdo en: ({x}, {y})")
            self.temp_points.append((x, y))
            self.modified = True

            if len(self.temp_points) == 2:
                # Verificar distancia mínima entre puntos
                dist = self.calculate_distance(self.temp_points[0], self.temp_points[1])
                if dist < 10:  # Umbral mínimo para evitar errores
                    print("Cajón descartado: Los puntos están demasiado cerca.")
                    self.temp_points = []  # Resetea los puntos temporales
                    return

                # Verificar si el nuevo cajón ya existe
                new_rect = (self.temp_points[0], self.temp_points[1])
                for rect in self.posList:
                    if self.is_overlapping(new_rect, rect):
                        print("Cajón descartado: Solapa con otro cajón existente.")
                        self.temp_points = []  # Resetea los puntos temporales
                        return

                # Guardar el nuevo cajón
                self.posList.append(new_rect)
                print(f"Nuevo cajón añadido: {new_rect}")
                self.temp_points = []

        if events == cv2.EVENT_RBUTTONDOWN:
            if self.posList:
                removed = self.posList.pop()
                print(f"Cajón eliminado: {removed}")
                self.modified = True

    def draw_parking_spaces(self, img):
        """Dibujar los espacios de estacionamiento en la imagen."""
        for rect in self.posList:
            if isinstance(rect[0], tuple) and isinstance(rect[1], tuple):
                cv2.rectangle(img, rect[0], rect[1], (255, 0, 255), 2)

        for point in self.temp_points:
            cv2.circle(img, point, 5, (0, 255, 0), -1)

    def process_video(self, source_path):
        self.close_current_window()
        
        source_name = self.get_source_name(source_path)
        self.posList = self.load_positions(source_name)
        self.modified = False

        cap = cv2.VideoCapture(source_path)
        ret, frame = cap.read()
        cap.release()

        if not ret:
            print("Error al leer el frame inicial.")
            return False

        window_name = f"Parking Space Picker - {source_name}"
        self.current_window = window_name
        
        cv2.namedWindow(window_name)
        cv2.setMouseCallback(window_name, lambda *args: self.mouseClick(*args))

        while True:
            img = frame.copy()
            self.draw_parking_spaces(img)
            cv2.imshow(window_name, img)

            key = cv2.waitKey(1)
            if key == ord('q'):
                if self.modified:
                    self.save_positions(source_name)
                self.close_current_window()
                break
            elif key == ord('n'):
                if self.modified:
                    self.save_positions(source_name)
                return 'next'
            elif key == ord('p'):
                if self.modified:
                    self.save_positions(source_name)
                return 'previous'
            elif key == ord('s'):
                self.save_positions(source_name)
                print(f"Posiciones guardadas para {source_name}")

        return False

    def close_current_window(self):
        """Cerrar la ventana actual si existe."""
        if self.current_window is not None:
            cv2.destroyWindow(self.current_window)
            cv2.waitKey(1)

    def run(self):
        """Ejecutar el proceso principal."""
        while True:
            current_source = video_sources[self.current_video_index]
            print(f"\nProcesando fuente: {self.get_source_name(current_source)}")
            print("Controles:")
            print("- Click izquierdo: Marcar esquinas del espacio")
            print("- Click derecho: Eliminar último espacio")
            print("- 's': Guardar cambios")
            print("- 'n': Siguiente fuente")
            print("- 'p': Fuente anterior")
            print("- 'q': Salir")

            action = self.process_video(current_source)
            if action == 'next':
                self.current_video_index = (self.current_video_index + 1) % len(video_sources)
            elif action == 'previous':
                self.current_video_index = (self.current_video_index - 1) % len(video_sources)
            else:
                break

        self.close_current_window()


if __name__ == "__main__":
    picker = ParkingSpacePicker()
    picker.run()
