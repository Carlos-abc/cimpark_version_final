import { BackIcon } from "../icons/backIcon";
import { Button, Switch } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function ConsultaEstacionamientoCroquis() {
  const navigate = useNavigate();
  const croquisRef = useRef<HTMLDivElement>(null);
  const [isWhiteBackground, setIsWhiteBackground] = useState(false);

  const handleBack = () => {
    navigate("/camaras");
  };

  const toggleFullScreen = () => {
    if (croquisRef.current) {
      if (!document.fullscreenElement) {
        croquisRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSwitchChange = () => {
    setIsWhiteBackground((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mt-4 space-y-4 md:space-y-0 px-4 md:px-8">
        <div className="flex items-center md:justify-start md:flex-1">
          <img
            src="src/styles/logo.png"
            alt="CimPark Logo"
            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
          />
        </div>

        <div className="flex space-x-6 md:space-x-8 items-center md:flex-1 justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-md"></div>
            <span className="text-base md:text-lg lg:text-xl font-semibold">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-md"></div>
            <span className="text-base md:text-lg lg:text-xl font-semibold">Ocupado</span>
          </div>
        </div>

        <div className="flex justify-end md:flex-1 items-center">
          <Button
            className="bg-cyan-900 text-white rounded-md hover:bg-blue-600 text-base sm:text-lg lg:text-xl w-auto px-4 sm:px-6 lg:px-8"
            isIconOnly={false}
            startContent={<BackIcon />}
            onClick={handleBack}
          >
            <span className="hidden sm:inline">Regresar</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center md:justify-end items-center w-full max-w-5xl mt-6 px-4 md:px-8">
        <span className="text-sm md:text-lg font-semibold mr-2">Cambiar vista</span>
        <Switch checked={isWhiteBackground} color="primary" onChange={handleSwitchChange} />
      </div>

      {/* Espacio del Croquis en Tiempo Real */}
      <div ref={croquisRef} className="relative border-2 border-gray-400 w-full max-w-5xl h-[400px] md:h-[500px] lg:h-[600px] mt-8 bg-white mb-10">
        <img
          src={isWhiteBackground ? "http://127.0.0.1:5000/video_feed_white" : "http://127.0.0.1:5000/video_feed"}
          alt="Vista de croquis en tiempo real"
          className="w-full h-full object-cover"
        />
        <button
          onClick={toggleFullScreen}
          className="absolute bottom-2 right-2 bg-gray-300 hover:bg-gray-400 text-black p-1 rounded-md"
          title="Pantalla completa"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}

export default ConsultaEstacionamientoCroquis;
