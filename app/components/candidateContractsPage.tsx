import { useState, useEffect } from "react";
import ManagerViewer from "./ManagerViewer";
import Uploader from "./Uploader";
import { update, ref } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";

export default function CandidateContractsPage({ uid }: { uid: string }) {
  const [contract, setContract] = useState<{
    id: string;
    name: string;
    url: string;
    folder: string;
    state: string;
    duration: number;
  } | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      const res = await fetch(`/api/getContractInformation?uid=${uid}`);
      const data = await res.json();
      setContract(
        data.contract ? { ...data.contract, state: data.state } : null
      );
    }
    fetchInfo();
  }, [uid]);

  const handleFileUpload = async (fileName: string) => {
    if (!contract) {
      return <p className="text-gray-500">No hay contratos disponibles.</p>;
    }

    const now = new Date();
    const signedDate = now.toISOString();

    // 2) Calcular fecha de vencimiento sumando 'duration' meses
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
  };

  return (
    <div>
      <div>
        <h2 className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}>Subir nuevo contrato</h2>
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
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg shadow-md">
        {/*Aquí es donde se ve el archivo*/}
        <h2 className={`${urbanist.className} mt-4 text-2xl font-semibold mb-4`}>Contrato asignado</h2>
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
    </div>
  );
}
