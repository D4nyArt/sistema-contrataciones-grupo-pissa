import {useState} from "react";

import {ChangeEvent, FormEvent} from "react";

import {PDFDocument} from 'pdf-lib';

import {getStorage, ref as storageRef, getDownloadURL, uploadBytes} from "firebase/storage";


import SelectCompany from "./selectCompany";
import SelectProjectClient from "./selectProjectClient";

import DirectViewer from "./directFileView";
import PopUp from "./pop-up";
import {ref, set, update} from "firebase/database";
import {database} from "@/firebaseConfig";
import {urbanist} from "./fonts";
import {Building, FolderOpenDot, File} from "lucide-react";
import sendEmailNotification from "@/app/components/sendEmailNotification";

export default function ContractSendAndPreview({uid}: {uid: string}) {
  const [contract, setContract] = useState(false);
  const [duration, setDuration] = useState<number>(6); // Duración del contrato en meses
  const [showConfirm, setShowConfirm] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [formValues, setFormValues] = useState({
    empresa: "",
    representante_legal: "",
    nombre: ""
  });

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues({...formValues, [e.target.name]: e.target.value});
  };

  const handleGenerateContract = async (e: FormEvent) => {
    e.preventDefault();

    // 1) Obtener plantilla desde Firebase Storage
    const storage = getStorage();
    const templateRef = storageRef(
      storage,
      "/pruebaInicial/contratos/proyectos/clientes/contratoVacioCliente.pdf"
    );
    const url = await getDownloadURL(templateRef);
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // 2) Cargar y rellenar campos
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const formPdf = pdfDoc.getForm();
    formPdf.getTextField("EMPRESA").setText(formValues.empresa);
    formPdf.getTextField("REPRESENTANTE_LEGAL").setText(formValues.representante_legal);
    formPdf.getTextField("NOMBRE").setText(formValues.nombre);
    formPdf.flatten();

    // 3) Generar bytes del nuevo PDF
    const pdfBytes = await pdfDoc.save();

    // 4) Subir el PDF generado a Storage
    const outRef = storageRef(
      storage,
      `pruebaInicial/contratos/proyectos/clientes/contratoLleno.pdf`
    );
    await uploadBytes(outRef, pdfBytes, {contentType: "application/pdf"});
    console.log("Contrato generado y subido exitosamente");
    // 5) Cerrar el formulario
    setContract(true);
    setShowForm(false);
  };


  const handleCompanySelect = (companyId: string | null) => {
    setSelectedCompany(companyId);
    //console.log("Empresa seleccionada:", selectedCompany);
  };

  const handleClientSelect = (clientId: string | null) => {
    setSelectedClient(clientId);
    //console.log("Cliente seleccionado:", selectedClient);
  };


  const [selected, setSelected] = useState("pro");

  const options = [
    {id: "pro", label: "Proyecto", icon: FolderOpenDot},
    {id: "cor", label: "Corporativo", icon: Building},
  ];


  // Acción al confirmar el envío
  {/*const handleSend = async () => {
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


      await update(ref(database, selected == "pro" ? `contratos/proyectos/${contract.id}` : `contratos/corporativo/${contract.id}`), {
        duration: duration,
        assignation: uid
      })


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

      // Notificación por email
      await sendEmailNotification(
        uid,
        `Nuevo contrato asignado`,
        `Hola,\n\n${message}\n\nPuedes revisar tus contratos ingresando a tu cuenta.\n\nSaludos,\nEquipo Grupo Pissa`
      );
    } catch (err) {
      console.error("Error enviando contrato:", err);
    }
    setShowConfirm(false);
  };*/}

  const handleClick = () => {
    setShowConfirm(true);
  };

  const disableButton = () => {
    if (selected === "pro") {
      if (selectedCompany === null || selectedClient === null) {
        return true; // Deshabilita el boton si no se ha seleccionado empresa o  cliente
      } else {
        return false;
      }
    } else if (selected === "cor") {
      if (selectedCompany === null) {
        return true; // Deshabilita el boton si no se ha seleccionado empresa o  cliente
      } else {
        return false;
      }
    }
    return true;
  };


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
                  setSelectedCompany(null);
                  setSelectedClient(null);
                }}
                className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium gap-2 cursor-pointer
                ${selected === option.id
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
          <>
            <SelectCompany uid={uid} onSelect={handleCompanySelect} />
            <SelectProjectClient uid={uid} onSelect={handleClientSelect} />
          </>
        )}
        {selected === "cor" && (
          <SelectCompany uid={uid} onSelect={handleCompanySelect} />
        )}

        <button
          disabled={disableButton()}
          onClick={() => setShowForm(true)}
          className="cursor-pointer mt-10 px-4 py-2 bg-[#2d4583] text-white rounded-lg hover:bg-[#08b177] disabled:opacity-50"
        >
          Aceptar
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
      <PopUp show={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={handleGenerateContract} className="space-y-4">
          <h3 className="text-lg font-semibold">Detalles del contrato</h3>

          <div>
            <label className="block">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={formValues.empresa}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Representante</label>
            <input
              type="text"
              name="representante_legal"
              value={formValues.representante_legal}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formValues.nombre}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>


          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              onClick={handleGenerateContract}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Generar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </PopUp>
    </div>
  );
}
