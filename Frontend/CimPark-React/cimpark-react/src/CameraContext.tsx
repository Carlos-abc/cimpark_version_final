import { createContext, useContext, useState, ReactNode } from "react";

interface CameraContextProps {
  camaras: any[];
  setCamaras: React.Dispatch<React.SetStateAction<any[]>>;
  videoUrl: string | null;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

const CameraContext = createContext<CameraContextProps | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [camaras, setCamaras] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <CameraContext.Provider value={{ camaras, setCamaras, videoUrl, setVideoUrl }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext() {
  return useContext(CameraContext);
}
