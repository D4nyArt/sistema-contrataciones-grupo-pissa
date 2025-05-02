"use client";

import { useState, useEffect } from "react";
import { Clock, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { update, ref } from "firebase/database";
import ManagerViewer from "./ManagerViewer";
import { database } from "@/firebaseConfig";

type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

const stateMap: Record<
  ContractState,
  {
    Icon: React.FC<{ size?: number; className?: string }>;
    text: string;
    color: string;
  }
> = {
  revisando: { Icon: Clock, text: "En revisión", color: "text-blue-600" },
  no_firmado: { Icon: X, text: "Contrato no firmado", color: "text-gray-600" },
  aprobado: {
    Icon: ThumbsUp,
    text: "Contrato aprobado",
    color: "text-green-600",
  },
  rechazado: {
    Icon: ThumbsDown,
    text: "Contrato rechazado",
    color: "text-red-600",
  },
};

export default function ReviewContract({ uid }: { uid: string }) {
  const [info, setInfo] = useState<{
    state: ContractState | null;
    contract: { id: string; name: string } | null;
  }>({ state: null, contract: null });

  useEffect(() => {
    async function fetchInfo() {
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();
      setInfo({ state: data.state, contract: data.contract });
    }
    fetchInfo();
  }, [uid]);

  const handleContractReview = async (approve: boolean) => {
    if (!info.contract) return;
    const newState: ContractState = approve ? "aprobado" : "rechazado";
    await update(ref(database, `expedientes/expediente${uid}/contratos`), {
      estado: newState,
    });
    /*
    if (approve) {
      const newRole = info.contract.id.startsWith("conproy")
        ? "enProyecto"
        : "enCorporativo";
      await update(ref(database, `usuarios/${uid}`), { rol: newRole });
    }*/
    setInfo((cur) => ({ ...cur, state: newState }));
  };

  const current = info.state ? stateMap[info.state] : null;

  return (
    <div className="space-y-4 bg-white mt-4 rounded-xl shadow-md p-4">
      {current && (
        <div className={`flex items-center ${current.color} `}>
          <current.Icon size={20} className="mr-2" />
          <span>{current.text}</span>
        </div>
      )}

      {/* Vista previa del contrato subido por el candidato */}
      {info.contract ? (
        <ManagerViewer
          expedienteId={`expediente${uid}`}
          fileName={info.contract.name}
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
      <div className="flex space-x-2 justify-center items-center">
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
