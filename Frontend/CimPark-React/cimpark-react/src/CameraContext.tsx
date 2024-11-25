import { createContext, useContext, useState } from "react";

const CameraContext = createContext(null);

export function CameraProvider({ children }) {
  const [camaras, setCamaras] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);

  return (
    <CameraContext.Provider value={{ camaras, setCamaras, videoUrl, setVideoUrl }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext() {
  return useContext(CameraContext);
}