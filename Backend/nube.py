import os
import time
from google.cloud import storage
import cv2
import threading

# Configura las credenciales de autenticación de Google Cloud
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'Backend/proyecto-python-img-f0c0f4835da0.json'
storage_client = storage.Client()
bucket_name = 'prueba-img-bucket'

class VideoStream:
    def __init__(self, video_path):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        self.frame = None
        self.ret = False
        self.lock = threading.Lock()
        self.stopped = False
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.start()

    def update(self):
        while not self.stopped:
            with self.lock:
                self.ret, self.frame = self.cap.read()
                if not self.ret:
                    if self.video_path.startswith("rtsp://"):
                        time.sleep(1)
                        self.cap = cv2.VideoCapture(self.video_path)
                    else:
                        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        self.ret, self.frame = self.cap.read()
            time.sleep(0.03)

    def read(self):
        with self.lock:
            return self.ret, self.frame.copy() if self.frame is not None else (False, None)

    def release(self):
        self.stopped = True
        self.thread.join()
        self.cap.release()

# Función para subir el frame a Google Cloud Storage
def upload_frame_to_gcs(blob_name, frame):
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        bucket = storage_client.get_bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.cache_control = 'no-cache, max-age=0'
        blob.upload_from_string(buffer.tobytes(), content_type='image/jpeg')
        blob.make_public()
        
        fresh_url = f"{blob.public_url}?nocache={int(time.time())}"
        print(f"Frame subido exitosamente. URL: {fresh_url}")
        return fresh_url
    except Exception as e:
        print(f"Error al subir el frame a GCS: {e}")
        return None

# Función para capturar y subir frames continuamente
def continuous_capture_and_upload(video_name, interval=5):
    if video_name.startswith("rtsp://"):
        video_path = video_name
    else:
        video_path = f'C:/Users/SSD/Desktop/cimpark/backend/{video_name}.mp4'

    video_stream = VideoStream(video_path)
    blob_name = f"{video_name}_frame.jpg"

    try:
        while True:
            ret, frame = video_stream.read()
            if ret:
                # Subir el frame a GCS
                fresh_url = upload_frame_to_gcs(blob_name, frame)
                print(f"Frame de {video_name} subido a {fresh_url}")
            else:
                print(f"No se pudo capturar el frame de {video_name}")

            # Espera el intervalo antes de capturar y subir el siguiente frame
            time.sleep(interval)

    except KeyboardInterrupt:
        print("Proceso interrumpido manualmente.")
    finally:
        video_stream.release()

# Lista de videos o streams
video_list = [
    'cimpark',
    'cimpark2',
    'carPark',
    'rtsp://10.32.91.192:554/title'
]

# Ejecuta la captura y subida continua para cada video en un hilo separado
threads = []
for video_name in video_list:
    t = threading.Thread(target=continuous_capture_and_upload, args=(video_name, 5))
    t.start()
    threads.append(t)

# Espera a que todos los hilos terminen (nunca termina automáticamente, es continuo)
for t in threads:
    t.join()
