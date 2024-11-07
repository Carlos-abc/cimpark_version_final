import { Button } from "@nextui-org/button";
import { useNavigate } from "react-router-dom";

export default function HomePage() {

  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/estacionamientos");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-10">
        <img alt="Logo" className="w-48 h-48" src="src\styles\logo.png" />
      </div>

      <div className="">
        <Button className="px-12 py-6 text-lg font-semibold bg-cyan-900 text-white rounded-md hover:bg-blue-600" onClick={handleNavigation}>
          !CimParkea ahora!
        </Button>
      </div>

      <p className="mt-4 text-black px-12 text-justify text-small xl:w-1/2 xl:text-lg md:w-3/4 lg:w-1/2 lg:text-lg md:text-lg sm:text-large">
        CimPark es una herramienta que te permite verificar en tiempo real la
        disponibilidad de espacios en un estacionamiento. Al hacer clic en el
        botón !CimParkea ahora!, podrás visualizar instantáneamente si un
        espacio está libre u ocupado.
      </p>
    </div>
  );
}
