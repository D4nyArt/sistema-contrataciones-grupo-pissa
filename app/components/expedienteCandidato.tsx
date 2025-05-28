import {useEffect, useState} from 'react';
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
];

export default function ExpedienteCandidato({userId}: ExpedienteCandidatoProps) {
  const [documentoId, setDocumentoId] = useState(DOCUMENTOS[0].id);
  useEffect(() => {
    async function initExp() {
      await fetch('/api/expediente', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({expedienteId: userId})
      });
    }
    initExp();
  }, [userId]);
  return (
    <div>
      <label htmlFor="doc-select">Seleccione documento:</label>
      <select
        id="doc-select"
        value={documentoId}
        onChange={e => setDocumentoId(e.target.value)}
      >
        {DOCUMENTOS.map(doc => (
          <option key={doc.id} value={doc.id}>
            {doc.nombre}
          </option>
        ))}
      </select>

      <hr />
      <DownloadBatchFilesButton expedienteId={userId} />

      <DocumentoExpediente
        expedienteId={userId}
        documentoId={documentoId}
        rol="candidato"
      />
    </div>
  );
}

