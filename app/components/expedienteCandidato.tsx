/**
 * expedienteCandidato.tsx
 *
 * Proporciona una interfaz completa para que los candidatos gestionen su expediente personal.
 *
 * Este componente presenta una vista organizada del expediente del candidato con navegación
 * lateral de documentos y área principal de gestión. Permite a los candidatos completar,
 * revisar y gestionar todos los documentos requeridos para su proceso de contratación.
 * Incluye inicialización automática del expediente y descarga masiva de documentos.
 */

import { useEffect, useState } from "react";
import DocumentoExpediente from "./documentoExpediente";
import DownloadBatchFilesButton from "./downloadBatchFilesButton";

/**
 * Define las propiedades del componente ExpedienteCandidato.
 */
interface ExpedienteCandidatoProps {
  /** El ID único del usuario candidato propietario del expediente. */
  userId: string;
}

/**
 * Lista completa de documentos requeridos en el expediente de un candidato.
 *
 * Define todos los documentos que un candidato debe proporcionar durante
 * su proceso de contratación, incluyendo documentos personales, fiscales,
 * laborales y médicos necesarios para completar su expediente.
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
 * Renderiza la interfaz completa de gestión de expediente para candidatos.
 *
 * Este componente proporciona una experiencia de usuario organizada con navegación
 * lateral para seleccionar documentos y un área principal para gestionar el documento
 * seleccionado. Incluye inicialización automática del expediente en el servidor,
 * navegación responsiva con dropdown en móviles y funcionalidad de descarga masiva
 * de todos los documentos del expediente.
 *
 * @param props - Las propiedades del componente.
 * @param props.userId - El ID del usuario candidato propietario del expediente.
 * @returns El elemento JSX que renderiza la interfaz completa del expediente.
 *
 * @example
 * ```tsx
 * // Uso en página de candidato
 * <ExpedienteCandidato userId="user123" />
 *
 * // El componente automáticamente:
 * // 1. Inicializa el expediente en el servidor si no existe
 * // 2. Muestra navegación lateral con todos los documentos
 * // 3. Permite gestionar cada documento individualmente
 * // 4. Proporciona descarga masiva de documentos
 * ```
 *
 * @see {@link DocumentoExpediente} - Componente para gestionar documentos individuales
 * @see {@link DownloadBatchFilesButton} - Componente para descarga masiva de documentos
 */
export default function ExpedienteCandidato({
  userId,
}: ExpedienteCandidatoProps) {
  /** Estado que almacena el ID del documento actualmente seleccionado. */
  const [documentoId, setDocumentoId] = useState(DOCUMENTOS[0].id);

  useEffect(() => {
    /**
     * Inicializa el expediente del candidato en el servidor.
     *
     * Esta función se ejecuta al montar el componente y asegura que
     * exista una estructura de expediente en la base de datos para
     * el usuario especificado. Si ya existe, no realiza cambios.
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
    <div className="flex flex-col lg:flex-row gap-4 min-h-screen">
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

      {/* Área principal de gestión de documento */}
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
            rol="candidato"
          />
        )}
      </div>
    </div>
  );
}
