import { useEffect, useState } from "react";
import DocumentoExpediente from "./documentoExpediente";
import DownloadBatchFilesButton from "./downloadBatchFilesButton";

interface ExpedienteCandidatoProps {
  userId: string;
}

const DOCUMENTOS = [
  {id: "ActaNacimiento", nombre: "Acta de Nacimiento"},
  {id: "CURP", nombre: "CURP"},
  {id: "CV", nombre: "Currículum"},
  {id: "INE", nombre: "INE"},
  {id: "ConstanciaSituacionFiscal", nombre: "Constancia de Situación Fiscal"},
  {id: "ComprobanteDomicilio", nombre: "Comprobante de Domicilio"},
  {id: "NumeroImss", nombre: "Número de IMSS"},
  {id: "ComprobanteEstudios", nombre: "Comprobante de Estudios"},
  {id: "ConstanciaLaboral1", nombre: "Constancia Laboral 1"},
  {id: "ConstanciaLaboral2", nombre: "Constancia Laboral 2"},
  {id: "CartaRecomendacion1", nombre: "Carta de Recomendación 1"},
  {id: "CartaRecomendacion2", nombre: "Carta de Recomendación 2"},
  {id: "RetencionInfonavit", nombre: "Retención Infonavit"},
  {id: "DepositoNomina", nombre: "Desposito Nómina"},
  {id: "CertificadoMedico", nombre: "Certificado Médico"},
  {id: "CertificadoAntecedentes", nombre: "Certificado de Antecedentes No Penales"},
  {id: "EstadoCuenta", nombre: "Estado de Cuenta"},
];

export default function ExpedienteCandidato({userId}: ExpedienteCandidatoProps) {
  const [documentoId, setDocumentoId] = useState(DOCUMENTOS[0].id);

  useEffect(() => {
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
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Lado izquierdo */}
      <div className="lg:w-1/4 w-full bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-1 space-x-3 border-b pb-4 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Documentos</h2>
          <DownloadBatchFilesButton expedienteId={userId} />
        </div>
        <div className="overflow-y-scroll h-[calc(100vh-200px)]">
          <ul className="space-y-2">
            {DOCUMENTOS.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => setDocumentoId(doc.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition
                    ${
                      documentoId === doc.id
                        ? "bg-blue-100 text-blue-800 font-semibold"
                        : "hover:bg-gray-200 text-gray-700"
                    }`}
                >
                  {doc.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:hidden">
        <select 
          value={documentoId} 
          onChange={(e) => setDocumentoId(e.target.value)} 
          className="w-full px-3 py-2 bg-white shadow rounded-md">
          {DOCUMENTOS.map((doc) => (
            <option key= {doc.id} value={doc.id}>
              {doc.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lado derecho */}
      <div className="flex-1 bg-white rounded-xl shadow p-4 md:max-h-220 overflow-y-auto">
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