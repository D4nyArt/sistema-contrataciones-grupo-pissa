"use client";
import React, { useRef, useState } from "react";
import { ref, remove, update } from "firebase/database";
import { database } from "../../firebaseConfig";
import Uploader from "./Uploader";


export default function GenerateOnboardingCard({id}: {id: string}) { 
  const [onboarding_name, setOnboarding_name] = useState("");
  const [folder, setFolder] = useState("");
  const [link_disabled, setLink_disabled] = useState(false);
  const [file_disabled, setFile_disabled] = useState(false);
  const [generated, setGenerated] = useState(false);
  // const [proy_num, setProy_num] = useState(0);
  // const [corp_num, setCorp_num] = useState(0);
  const [onb_link, setOnb_link] = useState("");
   
/*  
useEffect(()=>{

  const getcontractnumber = async () => {

  const project_ref = ref(database, "contratos/proyectos");
  const corp_ref = ref(database, "contratos/corporativo");

  try {
    const p_snap = await get(project_ref);
    const c_snap = await get(corp_ref);

    setProy_num(p_snap.size);
    setCorp_num(c_snap.size);

  }
  catch (e) {
    console.error(e);
  }

}

getcontractnumber();
}, []) */

const clickResolveRef = useRef<(() => void)>(null);

  const waitForClick = () => {
    return new Promise<void>((resolve) => {
      clickResolveRef.current = resolve;
    });
  };

  const handleUpload = async (isUpload: boolean) => {
    console.log("Upload done—waiting for button press…");
    setGenerated(true);
    if (isUpload) await waitForClick();
    setGenerated(false);

    try {
        const nc_ref = ref(database, id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}`:`contratos/corporativo/${id}/onb${id}`);
        console.log("nc_ref: ", nc_ref);
        await update(nc_ref, {
            [onboarding_name]: {
              "nombre": onboarding_name,
              "type": folder,
              "url": folder=="file"?`pruebaInicial/onboarding/${id}/${onboarding_name}.pdf`:onb_link
            }
        })
        const things_to_del = ["url", "estadoArchivo"];
        const del_ref_1 = ref(database, id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}/${things_to_del[0]}`:`contratos/corporativo/${id}/onb${id}/${things_to_del[0]}`);
        const del_ref_2 = ref(database, id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}/${things_to_del[1]}`:`contratos/corporativo/${id}/onb${id}/${things_to_del[1]}`);
        
        console.log(id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}/${things_to_del[0]}`:`contratos/corporativo/${id}/onb${id}/${things_to_del[0]}`);
        console.log(id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}/${things_to_del[1]}`:`contratos/corporativo/${id}/onb${id}/${things_to_del[1]}`);
        console.log("ref 1: ", del_ref_1);
        console.log("ref 2: ", del_ref_2)

        await remove(del_ref_1);
        await remove(del_ref_2);


    }
    catch (e) {
        console.error(e);
    }
  };

  const handlePress = () => {
    clickResolveRef.current?.();
    clickResolveRef.current = null;
    

  };

  

  return (
    <>
      <div className=" flex items-center justify-center w-full h-full">
        <div className="w-full max-w-sm flex flex-col p-8 bg-white rounded-xl shadow-md border border-gray-300">
          <h1 className="text-black">Nombre del apartado de Onboarding</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={onboarding_name}
            onChange={(event) => setOnboarding_name(event.target.value)}
          />

          <div className="text-black mt-4">Tipo de Apartado de Onboarding</div>
          <div className="flex-row flex items-center pb-10 pt-4 justify-between">
            <div className="flex-row flex">
              <p className="text-black pr-2">Link</p>
              <input
                type="checkbox"
                value="link"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setLink_disabled(false);
                  setFile_disabled(!file_disabled);
                }}
                disabled={link_disabled}
              />
            </div>
            <div className="flex-row flex">
              <p className="text-black pl-8 pr-2">Archivo</p>
              <input
                type="checkbox"
                value="file"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setLink_disabled(!link_disabled);
                  setFile_disabled(false);
                }}
                disabled={file_disabled}
              />
            </div>
          </div>
          
        
        {folder === "file" ? (
        <div>
        <div className="text-black mt-4">Archivo de Onboarding</div>

        <Uploader
          filename={onboarding_name}
          storageUrl={`pruebaInicial/onboarding/${id}`}
          onFileUploaded={async () => handleUpload(true)}
          dbPath={id.startsWith("conproy")?`contratos/proyectos/${id}/onb${id}/${onboarding_name}`:`contratos/corporativo/${id}/onb${id}/${onboarding_name}`}
        />

          {generated && (
            <div>
              El archivo se subió correctamente. Presiona crear apartado de onboarind para continuar.
            </div>
          )}

        <button
          className="bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition px-6 text-center text-lg inline-block m-1 cursor-pointer" 
          onClick={handlePress}
        >
          Crear Apartado de Onboarding
        </button>
        </div>
        ) : folder === "link" ? 
            <>
            <h1 className="text-black">Link del Archivo</h1>
            <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={onb_link}
            onChange={(event) => setOnb_link(event.target.value)}
          />
          <button
          className="bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition px-6 text-center text-lg inline-block m-1"
          onClick={async() => handleUpload(false)}
        >
          Crear Apartado de Onboarding
        </button>
          </>
          : null}
      </div>
      </div>
  </>
  );
}
