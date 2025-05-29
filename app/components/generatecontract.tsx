"use client";
import React, { useEffect, useRef, useState } from "react";
import { get, ref, update } from "firebase/database";
import { database } from "../../firebaseConfig";
import Uploader from "./Uploader";


export default function GenerateContract() {
  const [contract_name, setContract_Name] = useState("");
  const [folder, setFolder] = useState("");
  const [proy_disabled, setProy_disabled] = useState(false);
  const [corp_disabled, setCorp_disabled] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [proy_num, setProy_num] = useState(0);
  const [corp_num, setCorp_num] = useState(0);
   
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
}, [])

const clickResolveRef = useRef<(() => void)>(null);

  const waitForClick = () => {
    return new Promise<void>((resolve) => {
      clickResolveRef.current = resolve;
    });
  };

  const handleUpload = async () => {
    console.log("Upload done—waiting for button press…");
    setGenerated(true);
    await waitForClick();
    setGenerated(false);

    try {
        const nc_ref = ref(database, folder==="proyectos"?`contratos/proyectos/conproy${proy_num+2}`:`contratos/corporativo/concorp${corp_num+2}`);
        await update(nc_ref, {
            "duration": "indefinida",
            "name": contract_name,
            "type": folder,
        })
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className=" flex items-center justify-center w-full h-full">
        <div className="w-full max-w-sm flex flex-col p-8 bg-white rounded-xl shadow-md border border-gray-300">
          <h1 className="text-black">Nombre del Contrato</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_name}
            onChange={(event) => setContract_Name(event.target.value)}
          />

          

         

          <div className="text-black mt-4">Tipo del Contrato</div>
          <div className="flex-row flex items-center pb-10 pt-4 justify-between">
            <div className="flex-row flex">
              <p className="text-black pr-2">Proyectos</p>
              <input
                type="checkbox"
                value="proyectos"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setProy_disabled(false);
                  setCorp_disabled(!corp_disabled);
                }}
                disabled={proy_disabled}
              />
            </div>
            <div className="flex-row flex">
              <p className="text-black pl-8 pr-2">Corporativo </p>
              <input
                type="checkbox"
                value="corporativo"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setProy_disabled(!proy_disabled);
                  setCorp_disabled(false);
                }}
                disabled={corp_disabled}
              />
            </div>
            
          </div>
        <div className="text-black mt-4">Archivo del Contrato</div>
        <Uploader filename={contract_name} storageUrl={`pruebaInicial/contratos/${folder}`} onFileUploaded={handleUpload} dbPath={folder==="proyectos"?`contratos/proyectos/conproy${proy_num+2}`:`contratos/corporativo/concorp${corp_num+2}`}/>
          {generated ?
          <div>
            El archivo se subió correctamente Presiona crear credenciales para crear el contrato
          </div>
          :
          <></>}
          <button
            className="bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition px-6 text-center text-lg inline-block m-1"
            onClick={handlePress}>
            Crear Contrato
          </button>
        </div>
      </div>
    </>
  );
}