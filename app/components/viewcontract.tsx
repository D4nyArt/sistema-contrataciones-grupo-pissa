"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { set, ref, get, update } from "firebase/database";
import { database } from "@/firebaseConfig";

/** Possible states for a contract */
type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

interface Contract {
  id: string;
  name: string;
  contractState: ContractState;
}

// Constantes de estados
const CONTRACT_STATES: Record<string, ContractState> = {
  APROBADO: "aprobado",
  REVISANDO: "revisando",
  RECHAZADO: "rechazado",
  NO_FIRMADO: "no_firmado",
};

/** Icons for each state */
const StateIcon: React.FC<{ state: ContractState }> = ({ state }) => {
  switch (state) {
    case "aprobado":
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="text-white" size={18} />
        </div>
      );
    case "revisando":
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
          <Clock className="text-white" size={18} />
        </div>
      );
    case "rechazado":
      return (
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
          <X className="text-white" size={18} />
        </div>
      );
    case "no_firmado":
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <X className="text-gray-500" size={18} />
        </div>
      );
  }
};

export default function ViewContract({ contractId }: { contractId: string }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Load contract from Firebase */
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const snapshot = await get(ref(database, `contracts/${contractId}`));
        if (!snapshot.exists()) {
          setError("Contract not found.");
          return;
        }
        setContract(snapshot.val());
      } catch (err) {
        setError("Error reading contract data.");
      }
    };
    fetchContract();
  }, [contractId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  if (!contract) {
    return <div>No contract info found.</div>;
  }

  // Aprobar/Rechazar archivo
  const handleContractReview = async (aprobado: boolean) => {
    // Actualizar base de datos
    const docRef = ref(
      database,
      `expedientes/${contractId}/documentos/contrato/${contract}`
    );
    update(docRef, {
      estado:
        contract.contractState === CONTRACT_STATES.APROBADO
          ? "aprobado"
          : contract.contractState === CONTRACT_STATES.RECHAZADO
          ? "rechazado"
          : "revisando",
    });

    alert(`Archivo ${aprobado ? "aprobado" : "rechazado"} exitosamente.`);
  };

  return (
    <div className="border border-gray-300 p-4 rounded-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{contract.name}</h1>
        <StateIcon state={contract.contractState} />
      </div>

      <p className="text-gray-600">
        <b>ID del contrato</b> {contract.id}
      </p>
      <p className="text-gray-600">
        <b>Estado:</b> {contract.contractState}
      </p>

      <div className="flex space-x-3">
        <button
          onClick={() => handleContractReview(true)}
          className={`flex items-center px-3 py-2 rounded transition-colors ${
            contract.contractState === CONTRACT_STATES.APROBADO
              ? "bg-green-200 text-green-800"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          <ThumbsUp size={16} className="mr-2" />
          {contract.contractState === CONTRACT_STATES.APROBADO
            ? "Aprobado"
            : "Aprobar"}
        </button>

        <button
          onClick={() => handleContractReview(false)}
          className={`flex items-center px-3 py-2 rounded transition-colors ${
            contract.contractState === CONTRACT_STATES.RECHAZADO
              ? "bg-red-200 text-red-800"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          <ThumbsDown size={16} className="mr-2" />
          {contract.contractState === CONTRACT_STATES.RECHAZADO
            ? "Rechazado"
            : "Rechazar"}
        </button>
      </div>
    </div>
  );
}
