import { useEffect, useState } from "react";
import path from 'path';
import DirectViewer from "./directFileView";
import { get, ref } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import { File } from "lucide-react";

// type ContractState = "aprobado" | "revisando" | "rechazado" | "no_firmado";

export default function ContractInfoView({ id }: { id: string }) {
  

  //const [assignation, setAssignation] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [legalRepresentative,setLegalRepresentative] = useState("");
  const [rfc, setRfc] = useState("");
  const [url] = useState("");
  const [loading, setLoading] = useState(false);
  //const [type, setType] = useState("");
  const [fechaAdendum, setFechaAdendum] = useState("");
  const [fechaContrato, setFechaContrato] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("");
  const [folioRepse, setFolioRepse] = useState("");
  const [repse, setRepse] = useState("");
  const [numcon, setNumcon] = useState("");

  useEffect(() => {
      const fetchUser = async () => {
        try {
          
            const type = id.startsWith("empresa") ? "empresas" : "clientes";
            const userRef = ref(database, `contratos/${type}/${id}`);
            const snapshot = await get(userRef);
            const data = snapshot.val() || {};
           
            //setType("cor");

          setName(data.nombre || "");
          setAddress(data.direccion || "");
          setLegalRepresentative(data.representanteLegal || "");
          setRfc(data.rfc || "");
          setFechaAdendum(data.fechaAdendum || "");
          setFechaContrato(data.fechaContrato || "");
          setFechaVigencia(data.fechaVigencia || "");
          setFolioRepse(data.folioRepse || "");
          setNumcon(data.numeroContrato || "");
          setRepse(data.repse || "");

          
          
        } catch (e) {
          console.error(e);
        }
        setLoading(true);
      };
      fetchUser();
    }, [id]);

  const folder = path.dirname(url);
  const fileName = path.basename(url);
//
  //// Acción al confirmar el envío
//


  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Selección de contrato */}
      <div className="flex flex-col gap-4 md:w-1/3 p-6 bg-white rounded-xl shadow-md animate-fade-in-up">
        {id.startsWith("empresa")?
        <>
        <div className="border-b pb-6 border-gray-300">
          <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Tipo de plantilla</h2>
        </div>
        <p>Empresa</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Dirección</h2>
        <p>{address || "N/A"}</p> 
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Nombre de la Empresa</h2>
        <p>{name || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Representante Legal</h2>
        <p>{legalRepresentative || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>RFC</h2>
        <p>{rfc || "N/A"}</p>
        </>
        : 
        <>
        <div className="border-b pb-6 border-gray-300">
          <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Tipo de plantilla</h2>
        </div>
        <p>Clientes</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Fecha Adendum</h2>
        <p>{fechaAdendum || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Fecha Contrato</h2>
        <p>{fechaContrato || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Fecha Vigencia</h2>
        <p>{fechaVigencia || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Folio Repse</h2>
        <p>{folioRepse || "N/A"}</p>
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Repse</h2>
        <p>{repse || "N/A"}</p> 
        <h2 className={`${urbanist.className} text-xl font-semibold text-[#212529]`}>Numero Contrato</h2>
        <p>{numcon || "N/A"}</p> 
        
        </>}
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