import { useState } from "react";
import SelectProjectContracts, {
  Contract as ProjectContract,
} from "./selectProjectContracts";
import SelectCorporateContracts, {
  Contract as CorpContract,
} from "./selectCorporateContracts";
import ManagerViewer from "./ManagerViewer";
import PopUp from "./pop-up";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

export default function ContractSendAndPreview({ uid }: { uid: string }) {
  const [selectedProject, setSelectedProject] =
    useState<ProjectContract | null>(null);
  const [selectedCorporate, setSelectedCorporate] =
    useState<CorpContract | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleProjectSelect = (c: ProjectContract | null) => {
    setSelectedProject(c);
    setSelectedCorporate(null);
  };
  const handleCorporateSelect = (c: CorpContract | null) => {
    setSelectedCorporate(c);
    setSelectedProject(null);
  };

  const contract = selectedProject || selectedCorporate;
  const folder = selectedProject
    ? "pruebaInicial/contratos/proyectos"
    : selectedCorporate
    ? "pruebaInicial/contratos/corporativo"
    : "";

  // Acción al confirmar el envío
  const handleSend = async () => {
    // modified
    if (!contract) return;
    try {
      // Actualiza contrato_activo en usuarios/{uid}
      await update(ref(database, `usuarios/${uid}`), {
        contrato_activo: contract.name,
      });
      // Actualiza contrato_activo en expedientes/expediente{uid}/contratos
      await update(ref(database, `expedientes/expediente${uid}/contratos`), {
        contrato_activo: contract.name,
      });
      console.log("Contrato enviado:", contract.name);
    } catch (err) {
      console.error("Error enviando contrato:", err);
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Selección de contrato */}
      <div className="flex flex-col gap-4 md:w-1/3 border border-gray-200 p-4 rounded">
        <h2 className="font-bold">Elegir contrato</h2>
        <SelectProjectContracts
          uid={uid}
          onSelect={handleProjectSelect}
          disabled={!!selectedCorporate}
        />
        <SelectCorporateContracts
          uid={uid}
          onSelect={handleCorporateSelect}
          disabled={!!selectedProject}
        />
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!contract}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Enviar contrato
        </button>
      </div>

      {/* Vista previa y botón de enviar */}
      <div className="flex-1 border border-gray-200 p-4 rounded">
        {contract ? (
          <>
            <ManagerViewer
              expedienteId={`expediente${uid}`}
              fileName={contract.name + ".pdf"}
              folder={folder}
              userRole="rh"
              contrato={false}
            />
          </>
        ) : (
          <p className="text-gray-500">
            Selecciona un contrato para vista previa.
          </p>
        )}
      </div>

      {/* Popup de confirmación */}
      <PopUp show={showConfirm} onClose={() => setShowConfirm(false)}>
        <p className="mb-4">
          ¿Confirmas enviar el contrato “{contract?.name}” al candidato?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Confirmar
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancelar
          </button>
        </div>
      </PopUp>
    </div>
  );
}
