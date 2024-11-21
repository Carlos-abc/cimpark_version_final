import { BackIcon } from "../icons/backIcon";
import { Button, Switch } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import logo from '../styles/logo.png';

function ConsultaEstacionamientoCroquis() {
  const navigate = useNavigate();
  const { idCamara } = useParams();
  const croquisRef = useRef(null);
  const [isWhiteBackground, setIsWhiteBackground] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [previousImageUrl, setPreviousImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCameraUrls = async () => {
      try {
        const { data, error } = await supabase
          .from("camaras")
          .select("url_processed, url_processed_white")
          .eq("idCamara", idCamara)
          .single();

        if (error) throw error;

        const newImageUrl = isWhiteBackground 
          ? data.url_processed_white 
          : data.url_processed;

        if (isMounted) {
          setPreviousImageUrl(imageUrl);
          setImageUrl(newImageUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error al obtener las URLs de la cámara:", error);
        if (isMounted) {
          setError("No se pudo cargar la imagen del estacionamiento");
          navigate("/camaras");
        }
      }
    };
    fetchCameraUrls();
    const intervalId = setInterval(fetchCameraUrls, 500); 
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [idCamara, isWhiteBackground, navigate, imageUrl]);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
        <Button 
          onClick={handleBack} 
          className="mt-4 bg-cyan-900 text-white"
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl mt-4 space-y-4 md:space-y-0 px-4 md:px-8">
        <div className="flex items-center md:justify-start md:flex-1">
          <img
            src={logo}  
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
        <Switch 
          checked={isWhiteBackground} 
          color="primary" 
          onChange={handleSwitchChange} 
        />
      </div>

      <div
        ref={croquisRef}
        className="relative border-2 border-gray-400 w-full max-w-5xl h-[400px] md:h-[500px] lg:h-[600px] mt-8 bg-white mb-10 flex items-center justify-center overflow-hidden"
      >
        {isLoading ? (
          <div className="text-xl text-gray-500">Cargando...</div>
        ) : imageUrl ? (
          <div className="relative w-full h-full">
            {previousImageUrl && (
              <img
                src={`${previousImageUrl}?nocache=${Date.now()}`}
                alt="Vista anterior"
                className="absolute top-0 left-0 w-full h-full object-cover opacity-50 transition-opacity duration-500"
              />
            )}
            <img
              key={imageUrl}
              src={`${imageUrl}?nocache=${Date.now()}`}
              alt="Vista de croquis en tiempo real"
              className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
              onLoad={() => {
                setTimeout(() => setPreviousImageUrl(''), 500);
              }}
            />
            <button
              onClick={toggleFullScreen}
              className="absolute bottom-2 right-2 bg-gray-300 hover:bg-gray-400 text-black p-1 rounded-md z-10"
              title="Pantalla completa"
            >
              ⛶
            </button>
          </div>
        ) : (
          <div className="text-xl text-red-500">No hay imagen disponible</div>
        )}
      </div>
    </div>
  );
}

export default ConsultaEstacionamientoCroquis;