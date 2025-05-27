import { useEffect, useState } from "react";
import path from 'path';
import SelectProjectContracts, {
  Contract as ProjectContract,
} from "./selectProjectContracts";
import SelectCorporateContracts, {
  Contract as CorpContract,
} from "./selectCorporateContracts";
//import ManagerViewer from "./ManagerViewer";
import DirectViewer from "./directFileView";
import PopUp from "./pop-up";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { Building, FolderOpenDot, File } from "lucide-react";

// type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

export default function ContractInfoView({ id }: { id: string }) {
  

  const [duration, setDuration] = useState(""); // Duración del contrato en meses
  const [selected, setSelected] = useState("");
  const [isproject, setIsproject] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  let type = "";

  useEffect(() => {
      const fetchUser = async () => {
        try {
          console.log(`contratos/corporativo/${id}`);
          const userRef = ref(database, `contratos/proyectos/${id}`);
          const snapshot = await get(userRef);
          let data = snapshot.val() || {};
          console.log(id);
          console.log(data);
          console.log(type);
          
          //if the contract is not in "proyectos" search in "corporativo"
          if (!Object.keys(data).length) {
            const userRef = ref(database, `contratos/corporativo/${id}`);
            const snapshot = await get(userRef);
            data = snapshot.val() || {};
            type = "pro"
            setIsproject(false);
          }

          else {
            type = "cor";
            setIsproject(true);
          }
  
          console.log(data);
          console.log(type);

          setDuration(data.duration || "");
          setName(data.name || "");
          setUrl(data.url || "");
        } catch (e) {
          console.error(e);
        }
        setSelected(type);
        setLoading(true);
      };
      fetchUser();
    }, [type]);


  //const contract = selectedProject || selectedCorporate;
  let folder = path.dirname(url);
  let fileName = path.basename(url);

  //console.log("url: ", url);
  //console.log("folder: ", folder);
  //console.log("filename: ", fileName);
//
  //// Acción al confirmar el envío
//
  //console.log("selected: ", selected);

  const options = [
    { id: "pro", label: "Proyecto", icon: FolderOpenDot },
    { id: "cor", label: "Corporativo", icon: Building }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Selección de contrato */}
      <div className="flex flex-col gap-4 md:w-1/3 p-6 bg-white rounded-xl shadow-md">
        <div className="border-b pb-6 border-gray-300">
          <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Tipo de contrato</h2>
        </div>
        <div className="flex space-x-2 mr-auto pt-2">
          {options.map((option) => {
            const LinkIcon = option.icon;
            return (
              <button key={option.id}
                onClick={() => {
                }}
                className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium gap-2 cursor-pointer
                ${selected === option.id
                    ? "border-[#2975a0] text-[#2975a0]"
                    : "border-gray-300 text-gray-500 hover:border-[#08b177] hover:text-[#08b177]"}`}
              >
                <LinkIcon/>
                {option.label}
              </button>
            );
          })}
        </div>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Duración del Contrato</h2>
        <p>{duration || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Asignación</h2>
        <p>{"N/A"}</p>
      
      </div>

      {/* Vista previa*/}
      <div className="h-[400px] w-[500px]">
      {loading ? (
          <>
            <DirectViewer
              folder={folder}
              fileName={fileName}
            />
          </>
        ) : (
          <div className="text-gray-500 text-center h-full flex-col space-y-2 border border-gray-300 p-4 rounded-xl justify-center flex items-center">
            <File className="size-18"/>
            <p>Selecciona un contrato para vista previa.</p>
          </div>
        )}
        </div>
      
    </div>
  );
}
