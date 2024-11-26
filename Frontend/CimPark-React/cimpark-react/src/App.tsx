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
  const { setCamaras } = useCameraContext()!;
  const [estacionamientos, setEstacionamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Comenzando a cargar estacionamientos..."); // Depuración
    fetchEstacionamientos();
  }, []);

  async function fetchEstacionamientos() {
    try {
      setLoading(true);
      const { data: estacionamientosData, error: estacionamientosError } = await supabase
        .from('estacionamiento')
        .select('*');

      if (estacionamientosError) {
        console.error("Error al obtener estacionamientos:", estacionamientosError); // Log de error
        throw estacionamientosError;
      }

      console.log("Estacionamientos obtenidos:", estacionamientosData); // Verifica datos recibidos

      const estacionamientosConCamaras = await Promise.all(
        (estacionamientosData || []).map(async (est: any) => {
          const { data: camarasData, error: camarasError } = await supabase
            .from('camaras')
            .select('*')
            .eq('idEstacionamiento', est.idEstacionamiento);

          if (camarasError) {
            console.error("Error al obtener cámaras:", camarasError); // Log de error
            throw camarasError;
          }

          console.log(`Cámaras para estacionamiento ${est.idEstacionamiento}:`, camarasData); // Verifica datos de cámaras

          return {
            id: est.idEstacionamiento,
            nombre: est.nombre_estacionamiento,
            camaras: (camarasData || []).map((cam: any) => ({
              id: cam.idCamara,
              nombre: cam.nombreCamara,
              url_processed: cam.url_processed,
              url_processed_white: cam.url_processed_white,
            })),
          };
        })
      );

      console.log("Estacionamientos con cámaras procesados:", estacionamientosConCamaras); // Log final
      setEstacionamientos(estacionamientosConCamaras);
    } catch (error) {
      console.error('Error general:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleNavigateToCamaras = (camaras: any) => {
    console.log("Navegando a cámaras con:", camaras); // Depuración
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
        element={
          <Estacionamientos
            estacionamientos={estacionamientos}
            onSelect={handleNavigateToCamaras}
          />
        }
        path="/estacionamientos"
      />
      <Route element={<Camaras />} path="/camaras" />
      <Route
        element={<ConsultaEstacionamientoCroquis />}
        path="/consulta-estacionamiento-croquis/:idCamara"
      />
    </Routes>
  );
}

export default App;
