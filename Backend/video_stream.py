from flask import Flask, Response
import cv2
import pickle
import cvzone
import numpy as np
import os
import threading
import time

app = Flask(__name__)

class SharedVideoState:
    def __init__(self):
        self.last_frame = None
        self.last_frame_white = None
        self.last_update_time = 0
        self.lock = threading.Lock()

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

# Diccionario global para mantener el estado de cada video
video_states = {}
shared_states = {}

def load_positions(video_name):
    car_park_file = f"{video_name}_CarParkPos"
    if os.path.exists(car_park_file):
        with open(car_park_file, 'rb') as f:
            posList = pickle.load(f)
    else:
        posList = []
    return posList

def checkParkingSpace(imgPro, img, posList, white_background=False):
    for pos in posList:
        if isinstance(pos[0], tuple) and isinstance(pos[1], tuple):
            x1, y1 = pos[0]
            x2, y2 = pos[1]
            imgCrop = imgPro[y1:y2, x1:x2]
            count = cv2.countNonZero(imgCrop)

            color = (0, 255, 0) if count < 900 else (0, 0, 255)
            thickness = 5 if count < 900 else 2

            cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
            cvzone.putTextRect(img, str(count), (x1, y2 - 3), scale=1, thickness=2, offset=0, colorR=color)

def get_video_stream(video_name):
    if video_name not in video_states:
        video_path = f'C:/Users/SSD/Desktop/cimpark/backend/{video_name}.mp4'
        video_states[video_name] = VideoStream(video_path)
        shared_states[video_name] = SharedVideoState()
    return video_states[video_name], shared_states[video_name]

def process_frame(img, posList, white_background=False):
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)
    imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 16)
    imgMedian = cv2.medianBlur(imgThreshold, 5)
    kernel = np.ones((3, 3), np.uint8)
    imgDilate = cv2.dilate(imgMedian, kernel, iterations=1)

    img_background = np.ones((img.shape[0], img.shape[1], 3), dtype=np.uint8) * 255 if white_background else img.copy()
    checkParkingSpace(imgDilate, img_background, posList, white_background)
    
    return img_background

def generate_frames(video_name, white_background=False):
    video_stream, shared_state = get_video_stream(video_name)
    posList = load_positions(video_name)

    while True:
        current_time = time.time()
        
        with shared_state.lock:
            # Verifica si necesitamos actualizar el frame (cada 5 segundos)
            if current_time - shared_state.last_update_time >= 5:
                ret, img = video_stream.read()
                if not ret:
                    continue

                # Procesa ambos frames (normal y fondo blanco) al mismo tiempo
                processed_frame = process_frame(img, posList, False)
                processed_frame_white = process_frame(img, posList, True)

                # Codifica ambos frames
                ret, buffer = cv2.imencode('.jpg', processed_frame)
                ret_white, buffer_white = cv2.imencode('.jpg', processed_frame_white)

                # Actualiza ambos frames en el estado compartido
                shared_state.last_frame = buffer.tobytes()
                shared_state.last_frame_white = buffer_white.tobytes()
                shared_state.last_update_time = current_time

            # Devuelve el frame correspondiente según el modo seleccionado
            frame_to_yield = shared_state.last_frame_white if white_background else shared_state.last_frame

        if frame_to_yield is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_to_yield + b'\r\n')
        
        time.sleep(0.03)  # Pequeña pausa para no saturar el CPU

@app.route('/video_feed/<video_name>')
def video_feed(video_name):
    return Response(generate_frames(video_name, white_background=False),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_white/<video_name>')
def video_feed_white(video_name):
    return Response(generate_frames(video_name, white_background=True),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000)
    finally:
        for video_name, video_stream in video_states.items():
            video_stream.release()