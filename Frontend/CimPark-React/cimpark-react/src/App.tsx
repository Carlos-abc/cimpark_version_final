import { Route, Routes, useNavigate } from "react-router-dom";
import { Estacionamientos } from "./pages/estacionamientos";
import IndexPage from "./pages/index";
import { Camaras } from "./pages/camaras";
import ConsultaEstacionamientoCroquis from "./pages/ConsultaEstacionamientoaCroquis";
import { useCameraContext } from "./CameraContext";

const estacionamientos = [
  { 
    nombre: "Estacionamiento 1", 
    camaras: [
      { nombre: "Cámara 1", videoUrl: "carPark" },
      { nombre: "Cámara 2", videoUrl: "cimpark2" }
    ]
  },
  { 
    nombre: "Estacionamiento 2", 
    camaras: [
      { nombre: "Cámara 1", videoUrl: "cimpark" }
    ]
  },
  { 
    nombre: "Estacionamiento 3", 
    camaras: [
      { nombre: "Cámara 1", videoUrl: "cimpark4" },
      { nombre: "Cámara 2", videoUrl: "cimpark5" },
      { nombre: "Cámara 3", videoUrl: "cimpark6" }
    ]
  }
];

function App() {
  const navigate = useNavigate();
  const { setCamaras } = useCameraContext();

  const handleNavigateToCamaras = (camaras) => {
    setCamaras(camaras); // Guarda las cámaras en el contexto
    navigate("/camaras"); // Navega a la pantalla de cámaras
  };

  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route
        element={<Estacionamientos estacionamientos={estacionamientos} onSelect={handleNavigateToCamaras} />}
        path="/estacionamientos"
      />
      <Route
        element={<Camaras />}
        path="/camaras"
      />
      <Route
        element={<ConsultaEstacionamientoCroquis />}
        path="/consulta-estacionamiento-croquis"
      />
    </Routes>
  );
}

export default App;
