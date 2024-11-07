import { BackIcon } from "../icons/backIcon";
import { Button } from "@nextui-org/button";
import { useNavigate } from "react-router-dom";

interface EstacionamientosProps {
  buttonLabels: string[];
}

export const Estacionamientos: React.FC<EstacionamientosProps> = ({
  buttonLabels,
}) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCamara = () => {
    navigate("/camaras");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-x-hidden">
      <div
        className="flex justify-between mt-8 px-4"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
        <div className="flex flex-1 justify-end items-end">
          <Button
            className="bg-cyan-900 text-white rounded-md hover:bg-blue-600 text-base sm:text-lg lg:text-xl w-auto px-2 sm:px-4 lg:px-6"
            isIconOnly={false}  
            startContent={<BackIcon />}
            onClick={handleLogoClick}
          >
            <span className="hidden sm:inline">Regresar ahora</span>
          </Button>
        </div>
        <div className="flex flex-1 justify-center items-center">
          <img
            alt="Logo"
            className="w-48"
            src="src/styles/logo.png"
          />
        </div>
        <div className="flex flex-1"></div>
      </div>

      <p className="text-xl font-bold text-center mb-9 mt-10">Elige un estacionamiento:</p>

      <div className="flex flex-col w-full flex-grow overflow-y-auto mt-4 px-4">
        <div className="flex justify-center">
          <div className="w-full grid grid-cols-2 gap-4 xl:w-4/6 xl:grid-cols-3 lg:w-4/6 lg:grid-cols-3 md:w-3/4 md:grid-cols-2">
            {buttonLabels.map((label, index) => (
              <div
                key={index}
                className="w-full px-4 py-2 text-lg font-semibold text-white"
              >
                <Button
                  className="w-full bg-cyan-900 text-white rounded-md hover:bg-blue-600 text-large"
                  onClick={handleCamara}
                >
                  {label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
