// App.jsx
import { Route, Routes, useNavigate } from "react-router-dom";
import { Estacionamientos } from "./pages/estacionamientos";
import IndexPage from "./pages/index";
import { Camaras } from "./pages/camaras";
import ConsultaEstacionamientoCroquis from "./pages/ConsultaEstacionamientoaCroquis";
import { useCameraContext } from "./CameraContext";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const navigate = useNavigate();
  const { setCamaras } = useCameraContext();
  const [estacionamientos, setEstacionamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstacionamientos();
  }, []);

  async function fetchEstacionamientos() {
    try {
      setLoading(true);
      const { data: estacionamientosData, error: estacionamientosError } = await supabase
        .from('estacionamiento')
        .select('*');

      if (estacionamientosError) throw estacionamientosError;

      const estacionamientosConCamaras = await Promise.all(
        estacionamientosData.map(async (est) => {
          const { data: camarasData, error: camarasError } = await supabase
            .from('camaras')
            .select('*')
            .eq('idEstacionamiento', est.idEstacionamiento);

          if (camarasError) throw camarasError;

          return {
            nombre: est.nombre_estacionamiento,
            camaras: camarasData.map(cam => ({
              id: cam.idCamara,
              nombre: cam.nombreCamara,
              url_processed: cam.url_processed,
              url_processed_white: cam.url_processed_white
            }))
          };
        })
      );

      setEstacionamientos(estacionamientosConCamaras);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNavigateToCamaras = (camaras) => {
    setCamaras(camaras);
    navigate("/camaras");
  };

  if (loading) {
    return <div>Cargando estacionamientos...</div>;
  }

  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route
        element={<Estacionamientos 
          estacionamientos={estacionamientos} 
          onSelect={handleNavigateToCamaras} 
        />}
        path="/estacionamientos"
      />
      <Route
        element={<Camaras />}
        path="/camaras"
      />
      <Route
        element={<ConsultaEstacionamientoCroquis />}
        path="/consulta-estacionamiento-croquis/:idCamara"
      />
    </Routes>
  );
}

export default App;