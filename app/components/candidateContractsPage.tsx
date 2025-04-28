import { useState, useEffect } from "react";
import ManagerViewer from "./ManagerViewer";
import Uploader from "./Uploader";
import { update, ref } from "firebase/database";
import { database } from "@/firebaseConfig";

export default function CandidateContractsPage({ uid }: { uid: string }) {
  const [contract, setContract] = useState<{
    id: string;
    name: string;
    url: string;
    folder: string;
    state: string;
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
    // update both user and expediente…
    await update(ref(database, `usuarios/${uid}`), {
      contrato_activo: fileName,
    });
    await update(ref(database, `expedientes/expediente${uid}/contratos`), {
      contrato_activo: fileName,
      estado: "revisando",
      fecha_firmado: new Date().toISOString(),
    });
  };

  if (!contract) {
    return <p className="text-gray-500">No hay contratos disponibles.</p>;
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg shadow-md">
        {/*Aquí es donde se ve el archivo*/}
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
      <div>
        <h2 className="mt-4 text-lg font-semibold">Subir nuevo contrato</h2>
        <p className="text-gray-500">
          Puedes subir un nuevo contrato si es necesario.
        </p>
        {/*Aquí es donde se sube un archivo*/}
        <Uploader
          expedienteId={`expediente${uid}`}
          onFileUploaded={handleFileUpload}
          folder="pruebaInicial/expedientes"
          contrato={true}
        />
      </div>
    </div>
  );
}
