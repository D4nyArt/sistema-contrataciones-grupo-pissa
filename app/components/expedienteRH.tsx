/**
 * expedienteRH.tsx
 *
 * Proporciona una interfaz completa para que el personal de RH revise expedientes de candidatos.
 *
 * Este componente presenta una vista de revisión del expediente de candidatos con navegación
 * lateral de documentos y área principal de evaluación. Permite al personal de RH revisar,
 * aprobar o rechazar todos los documentos del proceso de contratación de un candidato específico.
 * Incluye inicialización automática del expediente y funcionalidad de descarga masiva.
 */

import { useEffect, useState } from "react";
import DocumentoExpediente from "./documentoExpediente";
import DownloadBatchFilesButton from "./downloadBatchFilesButton";

/**
 * Define las propiedades del componente ExpedienteRH.
 */
interface ExpedienteRHProps {
  /** El ID único del usuario candidato cuyo expediente se está revisando. */
  userId: string;
}

/**
 * Lista completa de documentos requeridos en el expediente de un candidato.
 *
 * Define todos los documentos que un candidato debe proporcionar durante
 * su proceso de contratación y que el personal de RH debe revisar y aprobar,
 * incluyendo documentos personales, fiscales, laborales y médicos.
 */
const DOCUMENTOS = [
  { id: "ActaNacimiento", nombre: "Acta de Nacimiento" },
  { id: "CURP", nombre: "CURP" },
  { id: "CV", nombre: "Currículum" },
  { id: "INE", nombre: "INE" },
  { id: "ConstanciaSituacionFiscal", nombre: "Constancia de Situación Fiscal" },
  { id: "ComprobanteDomicilio", nombre: "Comprobante de Domicilio" },
  { id: "NumeroImss", nombre: "Número de IMSS" },
  { id: "ComprobanteEstudios", nombre: "Comprobante de Estudios" },
  { id: "ConstanciaLaboral1", nombre: "Constancia Laboral 1" },
  { id: "ConstanciaLaboral2", nombre: "Constancia Laboral 2" },
  { id: "CartaRecomendacion1", nombre: "Carta de Recomendación 1" },
  { id: "CartaRecomendacion2", nombre: "Carta de Recomendación 2" },
  { id: "RetencionInfonavit", nombre: "Retención Infonavit" },
  { id: "DepositoNomina", nombre: "Desposito Nómina" },
  { id: "CertificadoMedico", nombre: "Certificado Médico" },
  {
    id: "CertificadoAntecedentes",
    nombre: "Certificado de Antecedentes No Penales",
  },
  { id: "EstadoCuenta", nombre: "Estado de Cuenta" },
];

/**
 * Renderiza la interfaz completa de revisión de expediente para personal de RH.
 *
 * Este componente proporciona una experiencia de revisión organizada con navegación
 * lateral para seleccionar documentos y un área principal para evaluar cada documento.
 * Incluye inicialización automática del expediente, navegación responsiva con dropdown
 * en móviles, funcionalidad de descarga masiva y herramientas de aprobación/rechazo
 * específicas para el rol de RH.
 *
 * @param props - Las propiedades del componente.
 * @param props.userId - El ID del candidato cuyo expediente se está revisando.
 * @returns El elemento JSX que renderiza la interfaz completa de revisión del expediente.
 *
 * @example
 * ```tsx
 * // Uso en página de revisión de candidatos
 * <ExpedienteRH userId="candidate123" />
 *
 * // El componente automáticamente:
 * // 1. Inicializa el expediente en el servidor si no existe
 * // 2. Muestra navegación lateral con todos los documentos
 * // 3. Permite revisar y evaluar cada documento
 * // 4. Proporciona herramientas de aprobación/rechazo
 * // 5. Incluye descarga masiva de documentos
 * ```
 *
 * @see {@link DocumentoExpediente} - Componente para revisar documentos individuales con permisos de RH
 * @see {@link DownloadBatchFilesButton} - Componente para descarga masiva de documentos del expediente
 */
export default function ExpedienteRH({ userId }: ExpedienteRHProps) {
  /** Estado que almacena el ID del documento actualmente seleccionado para revisión. */
  const [documentoId, setDocumentoId] = useState(DOCUMENTOS[0].id);

  useEffect(() => {
    /**
     * Inicializa el expediente del candidato en el servidor.
     *
     * Esta función se ejecuta al montar el componente y asegura que
     * exista una estructura de expediente en la base de datos para
     * el candidato especificado. Necesario para casos donde el personal
     * de RH accede a un expediente antes de que el candidato lo haya visitado.
     */
    async function initExp() {
      await fetch("/api/expediente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expedienteId: userId }),
      });
    }
    initExp();
  }, [userId]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-screen mb-6">
      {/* Panel de navegación lateral (desktop) */}
      <div className="lg:w-1/4 w-full bg-white rounded-xl shadow p-4 hidden md:block">
        <div className="flex items-center justify-between mb-4 space-x-3">
          <h2 className="text-lg font-semibold text-gray-800">Documentos</h2>
          <DownloadBatchFilesButton expedienteId={userId} />
        </div>
        <ul className="space-y-2">
          {DOCUMENTOS.map((doc) => (
            <li key={doc.id}>
              <button
                onClick={() => setDocumentoId(doc.id)}
                className={`w-full text-left px-4 py-2 rounded-md transition cursor-pointer
                  ${
                    documentoId === doc.id
                      ? "bg-blue-100 text-[#2d4583] font-semibold"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
              >
                {doc.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Selector dropdown para móviles */}
      <div className="md:hidden">
        <select
          value={documentoId}
          onChange={(e) => setDocumentoId(e.target.value)}
          className="w-full px-3 py-2 bg-white shadow rounded-md"
        >
          {DOCUMENTOS.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Área principal de revisión de documento */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {DOCUMENTOS.find((doc) => doc.id === documentoId)?.nombre}
          </h3>
        </div>

        {documentoId && (
          <DocumentoExpediente
            expedienteId={userId}
            documentoId={documentoId}
            rol="rh"
          />
        )}
      </div>
    </div>
  );
}
