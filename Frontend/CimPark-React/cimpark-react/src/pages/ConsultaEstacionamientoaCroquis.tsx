import { BackIcon } from "../icons/backIcon";
import { Button, Switch } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import logo from '../styles/logo.png';
import ErrorModal from '../components/ErrorModal';

interface CameraData {
  url_processed: string;
  url_processed_white: string;
}

interface RouteParams {
  idCamara: string;
}

const ConsultaEstacionamientoCroquis: React.FC = () => {
  const navigate = useNavigate();
  const { idCamara } = useParams<RouteParams>();
  const croquisRef = useRef<HTMLDivElement>(null);
  const [isWhiteBackground, setIsWhiteBackground] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previousImageUrl, setPreviousImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          if (!newImageUrl) {
            setError("No hay imagen disponible");
            setShowErrorModal(true);
            setIsLoading(false);
            return;
          }

          setPreviousImageUrl(imageUrl);
          setImageUrl(newImageUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error al obtener las URLs de la cámara:", error);
        if (isMounted) {
          setError("No se pudo cargar la imagen del estacionamiento");
          setShowErrorModal(true);
          setIsLoading(false);
        }
      }
    };
    
    fetchCameraUrls();
    const intervalId = setInterval(fetchCameraUrls, 500); 
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [idCamara, isWhiteBackground, imageUrl]);

  const handleBack = (): void => {
    navigate("/camaras");
  };

  const toggleFullScreen = (): void => {
    if (croquisRef.current) {
      if (!document.fullscreenElement) {
        croquisRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSwitchChange = (): void => {
    setIsWhiteBackground((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 w-full overflow-x-hidden pb-10">
      <div className={`
        flex flex-col w-full max-w-7xl px-4
        ${orientation === 'landscape' ? 'lg:flex-row' : ''} 
        justify-between items-center 
        pt-2 sm:pt-4
        space-y-2 lg:space-y-0 
        lg:px-6
      `}>
        {/* Logo Section */}
        <div className={`
          flex items-center justify-center 
          ${orientation === 'landscape' ? 'lg:w-1/4' : 'w-full'}
        `}>
          <img
            src={logo}
            alt="CimPark Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          />
        </div>

        {/* Legend Section */}
        <div className={`
          flex flex-row justify-center items-center 
          space-x-4 sm:space-x-6 
          ${orientation === 'landscape' ? 'lg:w-1/2' : 'w-full'}
        `}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-green-500 rounded-md"></div>
            <span className="text-sm sm:text-base font-semibold">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-red-500 rounded-md"></div>
            <span className="text-sm sm:text-base font-semibold">Ocupado</span>
          </div>
        </div>

        {/* Controls Section */}
        <div className={`
          flex flex-row items-center justify-between w-full
          ${orientation === 'landscape' ? 'lg:w-1/4 lg:justify-end' : 'space-x-4'}
        `}>
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-semibold">Cambiar vista</span>
            <Switch 
              isSelected={isWhiteBackground}
              color="primary" 
              onValueChange={handleSwitchChange} 
              className="scale-75 sm:scale-90"
            />
          </div>
          <Button
            className="bg-cyan-900 text-white rounded-md hover:bg-blue-600 
                     text-sm sm:text-base
                     px-3 sm:px-4"
            startContent={<BackIcon />}
            onClick={handleBack}
          >
            Regresar
          </Button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="w-full max-w-7xl px-4 lg:px-6 flex-grow">
        <div
          ref={croquisRef}
          className={`
            relative border-2 border-gray-400 bg-white rounded-lg overflow-hidden
            ${orientation === 'landscape' 
              ? 'h-[calc(100vh-120px)] mt-2' 
              : 'h-[calc(100vh-200px)] mt-4'}
          `}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-base sm:text-lg text-gray-500">Cargando...</div>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full">
              {previousImageUrl && (
                <img
                  src={`${previousImageUrl}?nocache=${Date.now()}`}
                  alt="Vista anterior"
                  className="absolute inset-0 w-full h-full object-contain opacity-50 transition-opacity duration-500"
                />
              )}
              <img
                key={imageUrl}
                src={`${imageUrl}?nocache=${Date.now()}`}
                alt="Vista de croquis en tiempo real"
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
                onLoad={() => {
                  setTimeout(() => setPreviousImageUrl(''), 500);
                }}
                onError={() => {
                  setError("No se pudo cargar la imagen del estacionamiento");
                  setShowErrorModal(true);
                }}
              />
              <button
                onClick={toggleFullScreen}
                className="absolute bottom-2 right-2 bg-gray-300 hover:bg-gray-400 text-black p-1 rounded-md z-10 
                         text-xs sm:text-sm"
                title="Pantalla completa"
              >
                ⛶
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-base sm:text-lg text-red-500">
                No hay imagen disponible
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorModal 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          navigate("/camaras");
        }}
      />
    </div>
  );
};

export default ConsultaEstacionamientoCroquis;