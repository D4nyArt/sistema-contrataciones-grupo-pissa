import {useState} from "react";

import {ChangeEvent, FormEvent} from "react";

import {PDFDocument} from 'pdf-lib';

import {getStorage, ref as storageRef, getDownloadURL, uploadBytes} from "firebase/storage";


import SelectCompany from "./selectCompany";
import SelectProjectClient from "./selectProjectClient";

import DirectViewer from "./directFileView";
import BetterDirectFileViewer from "./betterDirectFileViewer";
import PopUp from "./pop-up";
import {ref, update} from "firebase/database";
import {database} from "@/firebaseConfig";
import {urbanist} from "./fonts";
import {Building, FolderOpenDot, File} from "lucide-react";
import sendEmailNotification from "@/app/components/sendEmailNotification";

export default function ContractSendAndPreview({uid}: {uid: string}) {
  const [contractPreview, setContractPreview] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [formValues, setFormValues] = useState({
    duracion_contrato: "", // Se calculará automáticamente
    fecha_inicio: "",
    fecha_fin: "",
    salario: "",
    salario_escrito: "",
    hora_entrada: "",
    hora_salida: "",
    dia_entrada: "",
    dia_salida: "",
    tiempo_comida: ""
  });

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormValues = { ...formValues, [name]: value };

    // Calcular duración si ambas fechas están presentes
    if ((name === "fecha_inicio" || name === "fecha_fin") && newFormValues.fecha_inicio && newFormValues.fecha_fin) {
      const startDate = new Date(newFormValues.fecha_inicio);
      const endDate = new Date(newFormValues.fecha_fin);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate >= startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
        newFormValues.duracion_contrato = diffDays.toString();
      } else {
        newFormValues.duracion_contrato = ""; // Resetear si las fechas no son válidas o fin < inicio
      }
    }

    
    setFormValues(newFormValues);
  };

  const handleGenerateContract = async (e: FormEvent) => {
    e.preventDefault();

    // Determinar la ruta de la plantilla según el tipo de contrato seleccionado
    let templatePath = "";
    if (selected === "pro") {
      templatePath = "/pruebaInicial/contratos/proyectos/clientes/contratoRellenableCliente.pdf";
    } else if (selected === "cor") {
      // Asegúrate de que esta ruta sea la correcta para tu contrato corporativo
      templatePath = "/pruebaInicial/contratos/empresas/contratoRellenableEmpresa.pdf";
    } else {
      // Opcional: manejar un caso donde 'selected' no sea ni 'pro' ni 'cor'
      console.error("Tipo de contrato no reconocido:", selected);
      alert("Error: Tipo de contrato no reconocido.");
      return;
    }

    // 1) Obtener campos del contrato desde la API
    const params = new URLSearchParams({
      uid: uid,
      contractType: selected,
      selectedCompany: selectedCompany || "",
      ...(selected === "pro" && selectedClient && {selectedClient: selectedClient})
    });

    const response = await fetch(`/api/getContractFields?${params}`);
    const data = await response.json();

    if (!data.success) {
      console.error("Error obteniendo campos del contrato:", data.error);
      alert("Error al obtener los datos del contrato");
      return;
    }

    const {contractFields} = data;

    //  Obtener plantilla desde Firebase Storage
    const storage = getStorage();
    const templateRef = storageRef(
      storage,
      templatePath // Usar la ruta dinámica aquí
    );
    const url = await getDownloadURL(templateRef);
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // Cargar y rellenar campos
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const formPdf = pdfDoc.getForm();

    const fields = formPdf.getFields();
    const names = fields.map(field => field.getName());
    console.log("Campos del PDF:", names);

    // Datos de la empresa
    formPdf.getTextField("EMPRESA").setText(contractFields.empresa || "");
    formPdf.getTextField("REPRESENTANTE_LEGAL").setText(contractFields.representante_legal || "");

    // 5) Campos específicos para contratos de proyecto
    if (selected === "pro") {
      formPdf.getTextField("CLIENTE").setText(contractFields.cliente);
      formPdf.getTextField("NUMERO_CONTRATO").setText(contractFields.numero_contrato);
      formPdf.getTextField("FECHA_CONTRATO").setText(contractFields.fecha_contrato);
      formPdf.getTextField("FECHA_ADENDUM").setText(contractFields.fecha_adendum);
      formPdf.getTextField("VIGENCIA_CONTRATO").setText(contractFields.vigencia_contrato);
      formPdf.getTextField("REPSE").setText(contractFields.repse);
      formPdf.getTextField("REPSE_FOLIO").setText(contractFields.repse_folio);
    }

    // Datos del candidato
    formPdf.getTextField("NOMBRE").setText(contractFields.nombre || "");
    formPdf.getTextField("PUESTO").setText(contractFields.puesto || "");
    formPdf.getTextField("ESTADO_CIVIL").setText(contractFields.estado_civil || "");
    formPdf.getTextField("SEXO").setText(contractFields.sexo || "");
    formPdf.getTextField("EDAD").setText(contractFields.edad || "");
    formPdf.getTextField("RFC").setText(contractFields.rfc || "");
    formPdf.getTextField("CURP").setText(contractFields.curp || "");


    // Form rellenable
    formPdf.getTextField("DURACION_CONTRATO").setText(formValues.duracion_contrato); // Usar el valor calculado
    formPdf.getTextField("FECHA_INICIO").setText(formValues.fecha_inicio ? new Date(formValues.fecha_inicio).toLocaleDateString('es-MX') : "");
    formPdf.getTextField("FECHA_FIN").setText(formValues.fecha_fin ? new Date(formValues.fecha_fin).toLocaleDateString('es-MX') : "");

    formPdf.getTextField("SALARIO").setText("$" + formValues.salario + "  " + formValues.salario_escrito);

    formPdf.getTextField("HORA_ENTRADA").setText(formValues.hora_entrada);
    formPdf.getTextField("HORA_SALIDA").setText(formValues.hora_salida);
    formPdf.getTextField("DIA_ENTRADA").setText(formValues.dia_entrada);
    formPdf.getTextField("DIA_SALIDA").setText(formValues.dia_salida);
    formPdf.getTextField("TIEMPO_COMIDA").setText(formValues.tiempo_comida);

    // Calcula el premio de asistencia como el 10% del salario ingresado
    const salario = parseFloat(formValues.salario.replace(/[^0-9.]/g, "")) || 0;
    const premioAsistencia = salario > 0 ? (salario * 0.10).toFixed(2) : "0.00";
    formPdf.getTextField("PREMIO_ASISTENCIA").setText(premioAsistencia);
    formPdf.getTextField("PREMIO_PUNTUALIDAD").setText(premioAsistencia);

    //Obtener la fecha actual y formatearla
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const hoy = new Date();
    const fechaFormateada = `${hoy.getDate()} de ${meses[hoy.getMonth()]} del ${hoy.getFullYear()}`;
    formPdf.getTextField("FECHA").setText(fechaFormateada);

    //formPdf.getTextField("LOGO_EMPRESA").setText(formValues.nombre);

    formPdf.flatten();


    // 3) Generar bytes del nuevo PDF
    const pdfBytes = await pdfDoc.save();

    // 4) Subir el PDF generado a Storage
    const outRef = storageRef(
      storage,
      `pruebaInicial/expedientes/expediente${uid}/contratos/preview/contratoPreview${uid}.pdf`
    );
    await uploadBytes(outRef, pdfBytes, {contentType: "application/pdf"});
    alert("Preview del contrato generado exitosamente");
    // 5) Cerrar el formulario
    setContractPreview(true);
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
  const handleSendContract = async () => {
    if (!contractPreview) return;
    try {
      // Actualiza contrato_activo en usuarios/{uid}
      await update(ref(database, `usuarios/${uid}`), {
        contrato_activo: "contratoPreview" + uid + ".pdf",
        rol: "candidato",
      });

      // Actualiza contrato_activo en expedientes/expediente{uid}/contratos
      await update(ref(database, `expedientes/expediente${uid}/contratos`), {
        contrato_activo: "contratoPreview" + uid + ".pdf",
        id: `con${selected}${uid}`,
        estado: "no_firmado",
        duracion: formValues.duracion_contrato,
      });

      await update(ref(database, `expedientes/expediente${uid}/contratos/preview`), {
        url: `pruebaInicial/expedientes/expediente${uid}/contratos/preview/contratoPreview${uid}.pdf`,
      });


      await update(ref(database, selected == "pro" ? `contratos/proyectos/con${selected}${uid}` : `contratos/corporativo/con${selected}${uid}`), {
        duration: formValues.duracion_contrato,
        assignation: uid
      })


      // Notificaciones
      const message = `Se te ha asignado un nuevo contrato"`;
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
      alert("Contrato enviado exitosamente!");
    } catch (err) {
      console.error("Error enviando contrato:", err);
    }
  };

  const disableButton = () => {
    if (selected === "pro") {
      return !(selectedCompany && selectedClient);
    }
    if (selected === "cor") {
      return !selectedCompany;
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
                  setContractPreview(false);
                }}
                className={`flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium gap-2 cursor-pointer
                ${selected === option.id
                    ? "borderContract-[#2975a0] text-[#2975a0]"
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
          onClick={contractPreview ? handleSendContract : () => setShowForm(true)}
          className="cursor-pointer mt-10 px-4 py-2 bg-[#2d4583] text-white rounded-lg hover:bg-[#08b177] disabled:opacity-50"
        >
          {contractPreview ? "Enviar Contrato" : "Generación de contrato"}
        </button>
      </div>

      {/* Vista previa*/}
      <div className="flex-1">
        {contractPreview ? (
          <>
            <BetterDirectFileViewer
              urlDb={`pruebaInicial/expedientes/expediente${uid}/contratos/preview/contratoPreview${uid}.pdf`}
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
            <label className="block">Fecha de inicio</label>
            <input
              type="date"
              name="fecha_inicio"
              value={formValues.fecha_inicio}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Fecha de fin</label>
            <input
              type="date"
              name="fecha_fin"
              value={formValues.fecha_fin}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Duración del contrato en días</label>
            <input
              type="text"
              name="duracion_contrato"
              value={formValues.duracion_contrato}
              readOnly // Hacer este campo de solo lectura
              className="w-full border p-1 rounded bg-gray-100" // Estilo para indicar que es de solo lectura
            />
          </div>

          <div>
            <label className="block">Salario en Mxn (Número)</label>
            <input
              type="text"
              name="salario"
              value={formValues.salario}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Salario en Mxn (Escrito)</label>
            <input
              type="text"
              name="salario_escrito"
              value={formValues.salario_escrito}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Hora de entrada</label>
            <input
              type="text"
              name="hora_entrada"
              value={formValues.hora_entrada}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Hora de salida</label>
            <input
              type="text"
              name="hora_salida"
              value={formValues.hora_salida}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Dia de entrada</label>
            <input
              type="text"
              name="dia_entrada"
              value={formValues.dia_entrada}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Dia de salida</label>
            <input
              type="text"
              name="dia_salida"
              value={formValues.dia_salida}
              onChange={handleFormChange}
              className="w-full border p-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Tiempo de comida en Hrs</label>
            <input
              type="text"
              name="tiempo_comida"
              value={formValues.tiempo_comida}
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