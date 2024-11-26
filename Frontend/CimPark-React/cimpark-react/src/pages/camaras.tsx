import { BackIcon } from "../icons/backIcon";
import { Button } from "@nextui-org/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCameraContext } from "../CameraContext";
import ErrorModal from '../components/ErrorModal';
import logo from '../styles/logo.png';

export const Camaras: React.FC = () => {
  const navigate = useNavigate();
  const { camaras } = useCameraContext()!;
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (!camaras || camaras.length === 0) {
        throw new Error("No se encontraron cámaras disponibles.");
      }
    } catch (error) {
      console.error("Error al cargar las cámaras:", error);
      setShowErrorModal(true);
    }
  }, [camaras]);

  const handleNavigate = (camaraId: string) => {
    try {
      if (!camaraId) {
        throw new Error("La cámara seleccionada no es válida.");
      }
      navigate(`/consulta-estacionamiento-croquis/${camaraId}`);
    } catch (error) {
      console.error("Error al seleccionar una cámara:", error);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="flex justify-between mt-8 px-4" style={{ cursor: "pointer" }}>
        <div className="flex flex-1 justify-end items-end">
          <Button
            className="bg-cyan-900 text-white rounded-md hover:bg-blue-600 text-base sm:text-lg lg:text-xl w-auto px-2 sm:px-4 lg:px-6"
            isIconOnly={false}
            startContent={<BackIcon />}
            onClick={() => navigate("/estacionamientos")}
          >
            <span className="hidden sm:inline">Regresar ahora</span>
          </Button>
        </div>
        <div className="flex flex-1 justify-center items-center">
        <img
            src={logo}
            alt="CimPark Logo"
            className="w-48"
          />
        </div>
        <div className="flex flex-1"></div>
      </div>

      <p className="text-xl font-bold text-center mb-9 mt-10">Elige una cámara:</p>

      <div className="flex flex-col w-full flex-grow overflow-y-auto mt-4 px-4">
        <div className="flex justify-center">
          <div className="w-full grid grid-cols-2 gap-4 xl:w-4/6 xl:grid-cols-3 lg:w-4/6 lg:grid-cols-3 md:w-3/4 md:grid-cols-2">
            {camaras?.map((camara) => (
              <div key={camara.id} className="w-full px-4 py-2 text-lg font-semibold text-white">
                <Button
                  className="w-full bg-cyan-900 text-white rounded-md hover:bg-blue-600 text-large"
                  onClick={() => handleNavigate(camara.id)}
                >
                  {camara.nombre}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ErrorModal 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};
