import cv2

# Intenta abrir el flujo RTSP
cap = cv2.VideoCapture("rtsp://10.32.91.192:554/title")  # Reemplaza por el enlace RTSP correcto

if not cap.isOpened():
    print("No se puede acceder al flujo RTSP.")
else:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error al leer el frame.")
            break
        cv2.imshow("RTSP Stream", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
