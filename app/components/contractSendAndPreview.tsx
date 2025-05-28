import { useState } from "react";
import SelectProjectContracts, {
  Contract as ProjectContract,
} from "./selectProjectContracts";
import SelectCorporateContracts, {
  Contract as CorpContract,
} from "./selectCorporateContracts";
//import ManagerViewer from "./ManagerViewer";
import DirectViewer from "./directFileView";
import PopUp from "./pop-up";
import { ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { Building, FolderOpenDot, File } from "lucide-react";

export default function ContractSendAndPreview({ uid }: { uid: string }) {
  const [selectedProject, setSelectedProject] =
    useState<ProjectContract | null>(null);
  const [selectedCorporate, setSelectedCorporate] =
    useState<CorpContract | null>(null);
  const [duration, setDuration] = useState<number>(6); // Duración del contrato en meses
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
    if (!contract) return;
    try {
      // Actualiza contrato_activo en usuarios/{uid}
      await update(ref(database, `usuarios/${uid}`), {
        contrato_activo: contract.name,
        rol: "candidato",
      });

      // Actualiza contrato_activo en expedientes/expediente{uid}/contratos
      await update(ref(database, `expedientes/expediente${uid}/contratos`), {
        contrato_activo: contract.name,
        id: contract.id,
        estado: "no_firmado",
        duracion: duration,
      });

      console.log("Contrato enviado:", contract.name);

      // Notificaciones
      const message = `Se te ha enviado un nuevo contrato: "${contract.name}"`;
      const timestamp = Date.now();
      await update(ref(database, `notificaciones/notificaciones${uid}`), {
        [timestamp]: {
          mensaje: message,
          leido: false,
          ruta: `candidato/expediente?tab=contratos`,
          fijado: false,
        },
      });
    } catch (err) {
      console.error("Error enviando contrato:", err);
    }
    setShowConfirm(false);
  };

  const handleClick = () => {
    setShowConfirm(true);
  };

  const [selected, setSelected] = useState("pro");

  const options = [
    { id: "pro", label: "Proyecto", icon: FolderOpenDot },
    { id: "cor", label: "Corporativo", icon: Building },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Selección de contrato */}
      <div className="flex flex-col gap-4 md:w-1/3 p-6 bg-white rounded-xl shadow-md">
        <div className="border-b pb-6 border-gray-300">
          <h2
            className={`${urbanist.className} text-xl font-semibold text-[#212529]`}
          >
            Tipo de contrato
          </h2>
        </div>
        <div className="flex space-x-2 mr-auto pt-2">
          {options.map((option) => {
            const LinkIcon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  setSelected(option.id);
                  setSelectedProject(null);
                  setSelectedCorporate(null);
                }}
                className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium gap-2 cursor-pointer
                ${
                  selected === option.id
                    ? "border-[#2975a0] text-[#2975a0]"
                    : "border-gray-300 text-gray-400 hover:border-[#08b177] hover:text-[#08b177]"
                }`}
              >
                <LinkIcon />
                {option.label}
              </button>
            );
          })}
        </div>

        {selected === "pro" && (
          <SelectProjectContracts
            uid={uid}
            onSelect={handleProjectSelect}
            disabled={!!selectedCorporate}
          />
        )}
        {selected === "cor" && (
          <SelectCorporateContracts
            uid={uid}
            onSelect={handleCorporateSelect}
            disabled={!!selectedProject}
          />
        )}
        {/*Seleccionar duración del contrato*/}
        <h2
          className={`${urbanist.className} text-xl font-semibold text-[#212529]`}
        >
          Duración del contrato
        </h2>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="border p-1 rounded-lg mt-2 border-gray-300"
        >
          <option value="6">6 meses</option>
          <option value="12">1 año</option>
          <option value="24">2 años</option>
          <option value="36">3 años</option>
          <option value="60">5 años</option>
        </select>
        <button
          disabled={!contract}
          onClick={handleClick}
          className="cursor-pointer mt-10 px-4 py-2 bg-[#2d4583] text-white rounded-lg hover:bg-[#08b177] disabled:opacity-50"
        >
          Enviar contrato
        </button>
      </div>

      {/* Vista previa*/}
      <div className="flex-1">
        {contract ? (
          <>
            <DirectViewer
              expedienteId={`expediente${uid}`}
              fileName={contract.name + ".pdf"}
              folder={folder}
              userRole="rh"
              contrato={false}
            />
          </>
        ) : (
          <div className="text-gray-500 text-center h-full flex-col space-y-2 border border-gray-300 p-4 rounded-xl justify-center flex items-center">
            <File className="size-12" />
            <p>Selecciona un contrato para vista previa.</p>
          </div>
        )}
      </div>
      {/* y botón de enviar  */}
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
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
        </div>
      </PopUp>
    </div>
  );
}
