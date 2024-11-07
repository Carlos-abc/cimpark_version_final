import { Route, Routes } from "react-router-dom";
import { Estacionamientos } from "./pages/estacionamientos";
import IndexPage from "./pages/index";
import { Camaras } from "./pages/camaras";
import ConsultaEstacionamientoCroquis from "./pages/ConsultaEstacionamientoaCroquis"; // Asegúrate de que la ruta sea correcta

function App() {
  const buttons = [
    "Botón 1",
    "Botón 2",
    "Botón 3",
    "Botón 4",
    "Botón 5",
    "Botón 6",
    "Botón 7",
    "Botón 8",
    "Botón 9",
    "Botón 10",
    "Botón 11",
    "Botón 12",
    "Botón 13",
    "Botón 14",
    "Botón 15",
    "Botón 16",
    "Botón 17",
    "Botón 18",
    "Botón 19",
    "Botón 20",
    "Botón 21",
    "Botón 22",
  ];

  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route
        element={<Estacionamientos buttonLabels={buttons} />}
        path="/estacionamientos"
      />
      <Route
        element={<Camaras buttonLabels={buttons} />}
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
