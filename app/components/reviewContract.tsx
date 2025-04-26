"use client";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import ManagerViewer from "./ManagerViewer";
import { Clock, ThumbsUp, ThumbsDown, X } from "lucide-react";

// contract states
type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";
const CONTRACT_STATES: Record<string, ContractState> = {
  APROBADO: "aprobado",
  REVISANDO: "revisando",
  RECHAZADO: "rechazado",
  NO_FIRMADO: "no_firmado",
};

interface ReviewContractProps {
  uid: string;
}

export default function ReviewContract({ uid }: ReviewContractProps) {
  // carga nombre de archivo y estado desde la base de datos
  const [contratosInfo, setContratosInfo] = useState<{
    contrato_activo: string;
    estado: ContractState;
  } | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const snap = await get(
        ref(database, `expedientes/expediente${uid}/contratos`)
      );
      if (snap.exists()) {
        setContratosInfo(snap.val());
      }
    };
    fetchInfo();
  }, [uid]);

  const handleContractReview = (approve: boolean) => {
    // lógica de aprobación/rechazo aquí...
  };

  return (
    <div className="space-y-4">
      {/* Icono de reloj si está en revisión */}
      {contratosInfo?.estado === CONTRACT_STATES.REVISANDO && (
        <div className="flex items-center text-blue-600">
          <Clock size={20} className="mr-2" />
          <span>En revisión</span>
        </div>
      )}

      {/* Icono de X si el candidato no ha subido documentos */}
      {contratosInfo?.estado === CONTRACT_STATES.NO_FIRMADO && (
        <div className="flex items-center text-gray-600">
          <X size={20} className="mr-2" />
          <span>Contrato no firmado</span>
        </div>
      )}

      {/* Icono de ThumbsUp si el contrato está aprobado */}
      {contratosInfo?.estado === CONTRACT_STATES.APROBADO && (
        <div className="flex items-center text-green-600">
          <ThumbsUp size={20} className="mr-2" />
          <span>Contrato aprobado</span>
        </div>
      )}

      {/* Icono de ThumbsDown si el contrato está rechazado */}
      {contratosInfo?.estado === CONTRACT_STATES.RECHAZADO && (
        <div className="flex items-center text-red-600">
          <ThumbsDown size={20} className="mr-2" />
          <span>Contrato rechazado</span>
        </div>
      )}

      {/* Título */}

      {/* Vista previa del contrato subido por el candidato */}
      {contratosInfo?.contrato_activo ? (
        <ManagerViewer
          expedienteId={`expediente${uid}`}
          fileName={contratosInfo.contrato_activo}
          folder="pruebaInicial/expedientes"
          userRole="rh"
          contrato={true}
        />
      ) : (
        <p className="text-gray-500">
          Este usuario no ha subido ningún contrato.
        </p>
      )}

      {/* Botones para aprobar o rechazar */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleContractReview(true)}
          className="p-2 bg-green-500 text-white rounded"
        >
          <ThumbsUp size={16} className="inline-block mr-1" />
          Aprobar
        </button>
        <button
          onClick={() => handleContractReview(false)}
          className="p-2 bg-red-500 text-white rounded"
        >
          <ThumbsDown size={16} className="inline-block mr-1" />
          Rechazar
        </button>
      </div>
    </div>
  );
}
