import ManagerViewer from "./ManagerViewer";
import { useEffect, useState } from "react";
import { ref, get, update, set } from "firebase/database";
import { database } from "@/firebaseConfig";
import Uploader from "./Uploader";

/** Possible states for a contract */
type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

interface Contract {
  id: string;
  name: string;
  url?: string;
  contractState: ContractState;
}

// Constantes de estados
const CONTRACT_STATES: Record<string, ContractState> = {
  APROBADO: "aprobado",
  REVISANDO: "revisando",
  RECHAZADO: "rechazado",
  NO_FIRMADO: "no_firmado",
};

export default function CandidateContractsPage({ uid }: { uid: string }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [folder, setFolder] = useState<string>("");

  useEffect(() => {
    const fetchActiveContract = async () => {
      try {
        // 1. Get user's active contract from /usuarios/uid/contrato_activo
        const userSnap = await get(
          ref(database, `expedientes/expediente${uid}/contratos/id`)
        );
        const contractId = userSnap.val();

        let path = "";
        if (contractId.startsWith("conproy")) {
          path = `contratos/proyectos/${contractId}`;
          setFolder("pruebaInicial/contratos/proyectos");
        } else if (contractId.startsWith("concorp")) {
          path = `contratos/corporativo/${contractId}`;
          setFolder("pruebaInicial/contratos/corporativo");
        } else {
          return;
        }

        const contractSnap = await get(ref(database, path));
        if (contractSnap.exists()) {
          const data = contractSnap.val();
          const fileName: string = data.name.endsWith(".pdf")
            ? data.name
            : `${data.name}.pdf`;
          setContract({
            id: contractId,
            name: fileName,
            url: data.url,
            contractState: CONTRACT_STATES.NO_FIRMADO,
          });
        }
      } catch (error) {
        console.error("Error obteniendo el contrato activo:", error);
      }
    };
    fetchActiveContract();
  }, [uid]);

  // Manejar carga de archivos y actualizar contrato_activo
  const handleFileUpload = async (fileName: string, snapshot: unknown) => {
    // Actualizar contrato_activo in usuarios/{uid}
    try {
      await update(ref(database, `usuarios/${uid}`), {
        contrato_activo: fileName,
      });
      // Actualizar contrato_activo in expedientes/expediente{uid}/contratos
      await update(ref(database, `expedientes/expediente${uid}/contratos`), {
        contrato_activo: fileName,
        estado: CONTRACT_STATES.REVISANDO,
      });
    } catch (dbError) {
      console.error("Error actualizando contrato_activo:", dbError);
    }

    console.log("Archivo subido:", fileName, snapshot);
  };
  console.log("folder:", folder);
  console.log(`Using path: ${folder}/${contract?.name}`);

  return (
    <div>
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg shadow-md">
        {/*Aquí es donde se ve el archivo*/}
        {contract ? (
          <ManagerViewer
            expedienteId={uid}
            fileName={contract.name}
            folder={folder}
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
