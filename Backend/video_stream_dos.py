import os
import time
import cv2
import pickle
import numpy as np
import threading
from google.cloud import storage
import cvzone
from urllib.parse import urlparse

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'cimpar_oficial\Backend\cimpark-6b418c69d25f.json'
storage_client = storage.Client()
bucket_name = 'cimpark-img'

class VideoStream:
    def __init__(self, source_path):
        self.source_path = source_path
        self.is_rtsp = source_path.startswith("rtsp://")
        self.cap = None
        self.frame = None
        self.ret = False
        self.lock = threading.Lock()
        self.stopped = False
        self.reconnect_delay = 3  
        self.max_retries = 5 
        
        self.connect()
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.start()

    def connect(self):
        """Intenta conectar o reconectar a la fuente de video."""
        if self.cap is not None:
            self.cap.release()
        
        retries = 0
        while retries < self.max_retries:
            self.cap = cv2.VideoCapture(self.source_path)
            if self.cap.isOpened():
                print(f"Conectado exitosamente a {self.source_path}")
                return True
            
            if not self.is_rtsp:
                break
                
            print(f"Intento {retries + 1} de {self.max_retries} para conectar a {self.source_path}")
            retries += 1
            time.sleep(self.reconnect_delay)
        
        print(f"No se pudo conectar a {self.source_path} después de {retries} intentos")
        return False

    def update(self):
        
        while not self.stopped:
            with self.lock:
                if not self.cap.isOpened() and self.is_rtsp:
                    print(f"Conexión perdida con {self.source_path}. Intentando reconectar...")
                    if self.connect():
                        continue
                    else:
                        time.sleep(self.reconnect_delay)
                        continue

                self.ret, self.frame = self.cap.read()
                if not self.ret:
                    if self.is_rtsp:
                        print(f"Error leyendo stream RTSP: {self.source_path}")
                        if self.connect():
                            continue
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
        if self.cap is not None:
            self.cap.release()

def get_source_name(source_path):
    """Obtiene un identificador único para la fuente de video."""
    if source_path.startswith('rtsp://'):
        parsed = urlparse(source_path)
        return f"rtsp_{parsed.hostname}"
    else:
        return os.path.splitext(os.path.basename(source_path))[0]

def load_positions(source_name):
    """Carga las posiciones de estacionamiento para una fuente específica."""
    car_park_file = f"{source_name}_CarParkPos"
    if os.path.exists(car_park_file):
        with open(car_park_file, 'rb') as f:
            return pickle.load(f)
    return []

def process_frame(img, posList):
    """Procesa el frame para detectar espacios de estacionamiento."""
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)
    imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                       cv2.THRESH_BINARY_INV, 25, 16)
    imgMedian = cv2.medianBlur(imgThreshold, 5)
    kernel = np.ones((3, 3), np.uint8)
    imgDilate = cv2.dilate(imgMedian, kernel, iterations=1)
    
    img_normal = img.copy()
    img_white = np.ones((img.shape[0], img.shape[1], 3), dtype=np.uint8) * 255
    
    check_parking_spaces(imgDilate, img_normal, img_white, posList)
    
    return img_normal, img_white

def check_parking_spaces(imgPro, img_normal, img_white, posList):
    """Verifica espacios de estacionamiento y dibuja en ambas versiones de la imagen."""
    spaces_available = 0
    total_spaces = len(posList)
    
    for pos in posList:
        if isinstance(pos[0], tuple) and isinstance(pos[1], tuple):
            x1, y1 = pos[0]
            x2, y2 = pos[1]
            imgCrop = imgPro[y1:y2, x1:x2]
            count = cv2.countNonZero(imgCrop)
            
            is_available = count < 900
            if is_available:
                spaces_available += 1
                
            color = (0, 255, 0) if is_available else (0, 0, 255)
            thickness = 5 if is_available else 2
            
            for img in [img_normal, img_white]:
                cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
                cvzone.putTextRect(img, str(count), (x1, y2 - 3), 
                                 scale=1, thickness=2, offset=0, colorR=color)
    

def upload_frame_to_gcs(blob_name, frame):
    """Sube el frame a Google Cloud Storage."""
    try:
        _, buffer = cv2.imencode('.jpg', frame)
        bucket = storage_client.get_bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.cache_control = 'no-cache, max-age=0'
        blob.upload_from_string(buffer.tobytes(), content_type='image/jpeg')
        blob.make_public()
        
        fresh_url = f"{blob.public_url}?nocache={int(time.time())}"
        return fresh_url
    except Exception as e:
        print(f"Error subiendo frame a GCS: {e}")
        return None

def process_and_upload_video(source_path, interval=5):
    """Procesa los frames del video y los sube al almacenamiento en la nube."""
    source_name = get_source_name(source_path)
    video_stream = VideoStream(source_path)
    posList = load_positions(source_name)
    
    blob_name_normal = f"{source_name}_processed.jpg"
    blob_name_white = f"{source_name}_processed_white.jpg"
    
    error_count = 0
    max_errors = 10 
    
    try:
        while True:
            ret, frame = video_stream.read()
            if ret:
                try:
                   
                    processed_normal, processed_white = process_frame(frame, posList)
                    
                  
                    url_normal = upload_frame_to_gcs(blob_name_normal, processed_normal)
                    url_white = upload_frame_to_gcs(blob_name_white, processed_white)
                    
                    if url_normal and url_white:
                        print(f"Fuente: {source_name}")
                        print(f"Vista normal: {url_normal}")
                        print(f"Fondo blanco: {url_white}")
                        print("-" * 50)
                        error_count = 0  
                    else:
                        error_count += 1
                except Exception as e:
                    print(f"Error procesando frame de {source_name}: {e}")
                    error_count += 1
                
                
                if error_count >= max_errors:
                    print(f"Demasiados errores en {source_name}, reiniciando stream...")
                    video_stream.release()
                    video_stream = VideoStream(source_path)
                    error_count = 0
            
            time.sleep(3)
    
    except KeyboardInterrupt:
        print(f"Procesamiento interrumpido para {source_name}")
    finally:
        video_stream.release()

def main():
    video_sources = [
        # Videos locales
        r'https://storage.googleapis.com/cimpark-img/carPark.mp4',
        r'https://storage.googleapis.com/cimpark-img/cimpark.mp4',
        r'https://storage.googleapis.com/cimpark-img/cimpark2.mp4'
        #'rtsp://10.32.91.192:554/title'
    ]
    
    
    threads = []
    for source in video_sources:
        t = threading.Thread(
            target=process_and_upload_video, 
            args=(source, 5),
            name=f"Thread-{get_source_name(source)}"
        )
        t.daemon = True  
        t.start()
        threads.append(t)
        time.sleep(1) 
    
    try:
        
        while True:
            for i, thread in enumerate(threads):
                if not thread.is_alive():
                    print(f"Reiniciando hilo muerto: {thread.name}")
                    source = video_sources[i]
                    new_thread = threading.Thread(
                        target=process_and_upload_video,
                        args=(source, 5),
                        name=f"Thread-{get_source_name(source)}"
                    )
                    new_thread.daemon = True
                    new_thread.start()
                    threads[i] = new_thread
            time.sleep(10)  
            
    except KeyboardInterrupt:
        print("\nError: Se ha interrumpido el programa.")
       
        
if __name__ == "__main__":
    main()