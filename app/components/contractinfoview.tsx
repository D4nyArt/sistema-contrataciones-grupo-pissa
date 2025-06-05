import { useEffect, useState } from "react";
import path from 'path';
import DirectViewer from "./directFileView";
import { get, ref } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { Building, FolderOpenDot, File } from "lucide-react";

// type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

export default function ContractInfoView({ id }: { id: string }) {
  

  const [duration, setDuration] = useState(""); // Duración del contrato en meses
  const [selected, setSelected] = useState("");
  const [assignation, setAssignation] = useState("");
  const [assigname, setAssigname] = useState("");
  //const [isproject, setIsproject] = useState(false);
  //const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");

  const getAssignationName = async (id: string) => {

    let fullname = "";
    const namesnap = await get(ref(database, `usuarios/${id}/nombre`));
    const lastnamesnap = await get(ref(database, `usuarios/${id}/apellidos`));
    if (namesnap.exists()) {
     fullname += namesnap.val();
     fullname += " ";
     fullname += lastnamesnap.val();

     return fullname;
    }
    
    return "N/A";

  }
  
  useEffect(() => {
      const fetchUser = async () => {
        try {
          const userRef = ref(database, `contratos/proyectos/${id}`);
          const snapshot = await get(userRef);
          let data = snapshot.val() || {};
          

          //if the contract is not in "proyectos" search in "corporativo"
          if (!Object.keys(data).length) {
            const userRef = ref(database, `contratos/corporativo/${id}`);
            const snapshot = await get(userRef);
            data = snapshot.val() || {};
           
            setType("cor");
            //setIsproject(false);
          }

          else {
             setType("pro");
            //setIsproject(true);
          }
  
          setDuration(data.duration || "");
          setAssignation(data.assignation || "");
          //setName(data.name || "");
          setUrl(data.url || "");

          setAssigname(await getAssignationName(assignation));
        } catch (e) {
          console.error(e);
        }
        setSelected(type);
        setLoading(true);
      };
      fetchUser();
    }, [type]);


  //const contract = selectedProject || selectedCorporate;
  const folder = path.dirname(url);
  const fileName = path.basename(url);
//
  //// Acción al confirmar el envío
//

  const options = [
    { id: "pro", label: "Proyecto", icon: FolderOpenDot },
    { id: "cor", label: "Corporativo", icon: Building }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Selección de contrato */}
      <div className="flex flex-col gap-4 md:w-1/3 p-6 bg-white rounded-xl shadow-md animate-fade-in-up">
        <div className="border-b pb-6 border-gray-300">
          <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Tipo de contrato</h2>
        </div>
        <div className="flex space-x-2 mr-auto pt-2">
          {options.map((option) => {
            const LinkIcon = option.icon;
            return (
              <div key={option.id}
                className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium gap-2
                ${selected === option.id
                    ? "border-[#2975a0] text-[#2975a0]"
                    : "border-gray-300 text-gray-500"}`}
              >
                <LinkIcon/>
                {option.label}
              </div>
            );
          })}
        </div>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Duración del Contrato</h2>
        <p>{duration?`${duration} meses`:"N/A"}</p> 
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Asignación</h2>
        <p>{assigname || "N/A"}</p>
      
      </div>

      {/* Vista previa*/}
      <div className="h-[500px] w-full animate-fade-in-up">
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