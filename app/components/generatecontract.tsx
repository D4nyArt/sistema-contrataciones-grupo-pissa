"use client";
import React, { useEffect, useState } from "react";
import { get, ref, update } from "firebase/database";
import { database } from "../../firebaseConfig";
//import Uploader from "./Uploader";


export default function GenerateContract() {
  const [contract_name, setContract_Name] = useState("");
  const [contract_address, setContract_Address] = useState("");
  const [contract_legalrep, setContract_Legalrep] = useState("");
  const [contract_rfc, setContract_Rfc] = useState("");
  const [folder, setFolder] = useState("");
  const [proy_disabled, setProy_disabled] = useState(false);
  const [corp_disabled, setCorp_disabled] = useState(false);
  //const [generated, setGenerated] = useState(false);
  const [proy_num, setProy_num] = useState(0);
  const [corp_num, setCorp_num] = useState(0);
  const [fechaAdendum, setFechaAdendum] = useState("");
  const [fechaContrato, setFechaContrato] = useState("");
  const [fechaVigencia, setFechaVigencia] = useState("");
  const [folioRepse, setFolioRepse] = useState("");
  const [repse, setRepse] = useState("");
  const [numcon, setNumcon] = useState("");
   
useEffect(()=>{

  const getcontractnumber = async () => {

  const project_ref = ref(database, "contratos/clientes");
  const corp_ref = ref(database, "contratos/empresas");


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

  const handleUpload = async () => {
    //setGenerated(true);
    //await waitForClick();
    //setGenerated(false);

    try {
        const nc_ref = ref(database, folder==="clientes"?`contratos/clientes/clientes${proy_num+1}`:`contratos/empresas/empresa${corp_num+1}`);        //const onb_nc_ref = ref(database, folder==="proyectos"?`contratos/proyectos/conproy${proy_num+2}/onbconproy${proy_num+2}`:`contratos/corporativo/concorp${corp_num+2}/concorp${corp_num+2}`);
        
      

        if (folder === "empresas") {
        await update(nc_ref, {
            "direccion": contract_address,
            "nombre": contract_name,
            "representanteLegal": contract_legalrep,
            "rfc": contract_rfc,
            "tipo": folder
        })
      }
      else if (folder === "clientes") {
        await update(nc_ref, {
            "fechaAdendum": fechaAdendum,
            "fechaContrato": fechaContrato,
            "fechaVigencia": fechaVigencia,
            "folioRepse": folioRepse,
            "nombre": contract_name,
            "numeroContrato": numcon,
            "repse": repse,
            "tipo": folder
        })
      }

        //await update(onb_nc_ref, {
        //  "number_of_onboarding": 0,
        //  "accepted_onboarding": 0
        //})
    alert(`La plantilla ${contract_name} fue creada con éxito.`);
    window.location.reload();

    }
    catch (e) {
        console.error(e);
    }
  };

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className=" flex items-center justify-center w-full h-full">
        <div className="w-full max-w-sm flex flex-col p-8 bg-white rounded-xl shadow-md border border-gray-300">
           <div className="text-black mt-4">Tipo de la Plantilla</div>
          <div className="flex-row flex items-center pb-10 pt-4 justify-between">
            <div className="flex-row flex">
              <p className="text-black pr-2">Empresas</p>
              <input
                type="checkbox"
                value="empresas"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setProy_disabled(false);
                  setCorp_disabled(!corp_disabled);
                }}
                disabled={proy_disabled}
              />
            </div>
            
            <div className="flex-row flex">
              <p className="text-black pl-8 pr-2">clientes</p>
              <input
                type="checkbox"
                value="clientes"
                onChange={(event) => {
                  setFolder(event.target.value);
                  setProy_disabled(!proy_disabled);
                  setCorp_disabled(false);
                }}
                disabled={corp_disabled}/>
            </div>
          </div>
          
          {folder === "empresas"?
          <div>
          <h1 className="text-black">Nombre de la Plantilla</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_name}
            onChange={(event) => setContract_Name(event.target.value)}
          />
          <h1 className="text-black">Direccion de la Empresa</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_address}
            onChange={(event) => setContract_Address(event.target.value)}
          />
          <h1 className="text-black">Nombre del Representante Legal</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_legalrep}
            onChange={(event) => setContract_Legalrep(event.target.value)}
          />
          <h1 className="text-black">RFC</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_rfc}
            onChange={(event) => setContract_Rfc(event.target.value)}
          />
          </div>
          : folder === "clientes" ? <div>
          <h1 className="text-black">Nombre de la Plantilla</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={contract_name}
            onChange={(event) => setContract_Name(event.target.value)}
          />
          <h1 className="text-black">Fecha del Contrato</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={fechaContrato}
            onChange={(event) => setFechaContrato(event.target.value)}
          />
          <h1 className="text-black">Numero del Contrato</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={numcon}
            onChange={(event) => setNumcon(event.target.value)}
          />
          <h1 className="text-black">Fecha del Adendum</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={fechaAdendum}
            onChange={(event) => setFechaAdendum(event.target.value)}
          />
          <h1 className="text-black">Fecha de Vigencia</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={fechaVigencia}
            onChange={(event) => setFechaVigencia(event.target.value)}
          />
          <h1 className="text-black">Folio Repse</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={folioRepse}
            onChange={(event) => setFolioRepse(event.target.value)}
          />
          <h1 className="text-black">Repse</h1>
          <input
            type="text"
            className="text-black border border-gray-300 bg-[#fafbfc] rounded-lg p-2 w-full"
            value={repse}
            onChange={(event) => setRepse(event.target.value)}
          />
          </div>
          :
          <></>
          }

         

         
        {/*<div className="text-black mt-4">Archivo de la plantilla</div>
        <Uploader filename={contract_name} storageUrl={`pruebaInicial/contratos/${folder}`} onFileUploaded={handleUpload} dbPath={folder==="proyectos"?`contratos/proyectos/conproy${proy_num+2}`:`contratos/corporativo/concorp${corp_num+2}`}/>
          {generated
          ?
          <div>
            El archivo se subió correctamente Presiona crear credenciales para crear el contrato
          </div>
          :
          <></>}
          */}
          <button
            className="bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition px-6 text-center text-lg inline-block m-1"
            onClick={handleUpload}>
            Crear Contrato
          </button>
        </div>
      </div>
    </>
  );
}