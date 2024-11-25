// ErrorModal.tsx
import React from 'react';
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onClose();
    navigate("/"); // Navega a la ruta raíz "/"
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      classNames={{
        body: "py-6",
        backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-red-600 text-white",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        <ModalBody className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
            <span className="text-4xl font-bold">×</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">¡Oh no!</h2>
            <p className="text-xl">Algo salió mal...</p>
          </div>
          <Button
            onClick={handleGoHome}
            className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-6 py-2"
          >
            Ir a la página de inicio
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ErrorModal;