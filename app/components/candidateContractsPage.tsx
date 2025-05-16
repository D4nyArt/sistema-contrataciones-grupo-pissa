import { useState, useEffect } from "react";
import ManagerViewer from "./ManagerViewer";
import Uploader from "./Uploader";
import { update, ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { Clock, ThumbsUp, ThumbsDown, X } from "lucide-react";

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

export default function CandidateContractsPage({ uid }: { uid: string }) {
  const [contract, setContract] = useState<{
    id: string;
    name: string;
    url: string;
    folder: string;
    state: ContractState;
    duration: number;
    notes: string;
  } | null>(null);

  const [reviewer, setReviewer] = useState<
    | {
        rID: string;
      }
    | "sin_revisor"
  >("sin_revisor");

  useEffect(() => {
    async function fetchInfo() {
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();
      setContract(
        data.contract
          ? {
              ...data.contract,
              state: data.state,
              notes: data.notes,
              duration: data.duration,
            }
          : null
      );
    }
    async function fetchReviewer() {
      const res = await fetch(`/api/getReviewer?uid=${uid}`);
      const data = await res.json();
      setReviewer(data.revisorUID ? { rID: data.revisorUID } : "sin_revisor");
    }
    fetchInfo();
    fetchReviewer();
  }, [uid]);

  const handleFileUpload = async (fileName: string) => {
    if (!contract) {
      return <p className="text-gray-500">No hay contratos disponibles.</p>;
    }

    // Expiracion
    const now = new Date();
    const signedDate = now.toISOString();
    const expiration = new Date(now);
    expiration.setMonth(expiration.getMonth() + contract.duration);
    const expirationDate = expiration.toISOString();

    await update(ref(database, `usuarios/${uid}`), {
      contrato_activo: fileName,
    });
    await update(ref(database, `expedientes/expediente${uid}/contratos`), {
      contrato_activo: fileName,
      estado: "revisando",
      fecha_firmado: signedDate,
      fecha_vencimiento: expirationDate,
    });

    // Notificaciones
    const message = `El candidato ${uid} subió el contrato "${fileName}"`;
    const timestamp = Date.now();

    if (reviewer === "sin_revisor") {
      // enviar a todos los RH
      const usersSnap = await get(ref(database, "usuarios"));
      if (usersSnap.exists()) {
        const allUsers = usersSnap.val() as Record<string, { rol?: string }>;
        for (const [userId, userData] of Object.entries(allUsers)) {
          if (userData.rol === "rh") {
            await update(
              ref(database, `notificaciones/notificaciones${userId}`),
              { [timestamp]: { mensaje: message, leido: false } }
            );
          }
        }
      }
    } else {
      await update(
        ref(database, `notificaciones/notificaciones${reviewer.rID}`),
        { [timestamp]: { mensaje: message, leido: false } }
      );
    }
  };

  if (!contract) {
    return <p className="text-gray-500">Estado del contrato no disponible</p>;
  }

  const current = contract.state ? stateMap[contract.state] : null;

  return (
    <div>
      {/* Aquí es donde se ve el estado del contrato */}
      {current && (
        <div className={`flex items-center ${current.color} `}>
          <current.Icon size={20} className="mr-2" />
          <span>{current.text}</span>
        </div>
      )}
      {/* Aquí es donde se ven las notas si tiene notas */}
      {contract.notes && (
        <div className="flex items-center text-gray-500 mt-2">
          <p>Notas: </p>
          <span>{contract.notes}</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg shadow-md">
        {/*Aquí es donde se ve el archivo*/}
        <h2
          className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}
        >
          Contrato asignado
        </h2>
        {contract ? (
          <ManagerViewer
            expedienteId={uid}
            fileName={contract.name}
            folder={contract.folder}
            userRole="candidato"
            contrato={true}
          />
        ) : (
          <p className="text-gray-500">No hay contratos disponibles.</p>
        )}
      </div>
      <div></div>
      <div>
        <h2
          className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}
        >
          Subir nuevo contrato
        </h2>
        {/*Aquí es donde se sube un archivo*/}
        <div className="flex flex-col border justify-center items-center p-40 rounded-xl mb-4 border-gray-300">
          <Uploader
            expedienteId={`expediente${uid}`}
            onFileUploaded={handleFileUpload}
            folder="pruebaInicial/expedientes"
            contrato={true}
          />
          <p className="text-gray-500">
            Puedes subir un nuevo contrato si es necesario.
          </p>
        </div>
      </div>
    </div>
  );
}
