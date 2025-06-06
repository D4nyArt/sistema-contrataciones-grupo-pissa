import NotasExpediente from "./notasExpediente";
import CamposExpediente from "./camposExpediente";
import ArchivoExpediente from "./archivoExpediente";
import { useState, useEffect } from "react";
import { addHistoryEntry } from "../api/history/history";
import { getAuth } from "firebase/auth";

const auth = getAuth();
const rhID = auth.currentUser?.uid;

interface DocProps {
  expedienteId: string;
  documentoId: string;
  rol: string;
}

interface DocData {
  nombre: string;
  estadoGeneral: string;
  estadoArchivo: string;
  estadoCampos: string;
}

type DocState = "aprobado" | "pendiente" | "rechazado" | "no_subido";

const DOC_STATES: Record<string, DocState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

export default function DocumentoExpediente({
  expedienteId,
  documentoId,
  rol,
}: DocProps) {
  const [docData, setDocData] = useState<DocData | undefined>();
  const [hasFields, setHasFields] = useState<boolean>(false);

  const fetchDoc = async () => {
    if (!expedienteId || !documentoId) return;
    try {
      const res = await fetch(
        `/api/docExpediente?expedienteId=${expedienteId}&documentoId=${documentoId}`
      );
      const data = await res.json();
      if (res.ok) {
        setDocData({
          nombre: data.nombre,
          estadoGeneral: data.estadoGeneral,
          estadoArchivo: data.estadoArchivo,
          estadoCampos: data.estadoCampos,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHasFields = async () => {
    if (!expedienteId || !documentoId) return;
    try {
      const res = await fetch(
        `/api/fields?expedienteId=${expedienteId}&documentoId=${documentoId}`
      );
      const data = await res.json();
      setHasFields(res.ok && data.fields && Object.keys(data.fields).length > 0);
    } catch {
      setHasFields(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    fetchHasFields();
  }, [expedienteId, documentoId]);

  const handleApproveAll = async (): Promise<void> => {
    if (!expedienteId || !documentoId || !rhID) return;
    try {
      const res = await fetch("/api/docExpediente", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: rol,
          expedienteId,
          documentoId,
          estadoArchivo: DOC_STATES.APROBADO,
          estadoCampos: DOC_STATES.APROBADO,
        }),
      });
      if (!res.ok) throw await res.json();
      const uidP = expedienteId;
      const uid = uidP.replace("expediente", "");
      await addHistoryEntry(uid, "documentos", new Date().toISOString(), rhID, "Documento aprobado completamente");
      fetchDoc();
      fetchHasFields();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectAll = async (): Promise<void> => {
    if (!expedienteId || !documentoId || !rhID) return;
    try {
      const res = await fetch("/api/docExpediente", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expedienteId,
          documentoId,
          estadoArchivo: DOC_STATES.RECHAZADO,
          estadoCampos: DOC_STATES.RECHAZADO,
        }),
      });
      if (!res.ok) throw await res.json();
      const uidP = expedienteId;
      const uid = uidP.replace("expediente", "");
      await addHistoryEntry(uid, "documentos", new Date().toISOString(), rhID, "Documento rechazado completamente");
      fetchDoc();
      fetchHasFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-4 p-3 rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-bold mb-2">
          Estado del documento: {docData?.nombre}
        </h2>
        <div
          className={`p-2 rounded-md text-center font-medium ${
            docData?.estadoGeneral === DOC_STATES.APROBADO
              ? "bg-green-100 text-green-800"
              : docData?.estadoGeneral === DOC_STATES.PENDIENTE
              ? "bg-yellow-100 text-yellow-800"
              : docData?.estadoGeneral === DOC_STATES.RECHAZADO
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {docData?.estadoGeneral === DOC_STATES.APROBADO
            ? "✓ Apartado aprobado"
            : docData?.estadoGeneral === DOC_STATES.PENDIENTE
            ? "⟳ Pendiente de revisión"
            : docData?.estadoGeneral === DOC_STATES.RECHAZADO
            ? "✗ Apartado rechazado"
            : "✗ Apartado vacío"}
        </div>
      </div>

      <h3 className="font-medium text-lg mb-3">
        <div className="flex items-center justify-between">
          <span>Documento</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              docData?.estadoArchivo === DOC_STATES.APROBADO
                ? "bg-green-100 text-green-800"
                : docData?.estadoArchivo === DOC_STATES.PENDIENTE
                ? "bg-yellow-100 text-yellow-800"
                : docData?.estadoArchivo === DOC_STATES.RECHAZADO
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {docData?.estadoArchivo === DOC_STATES.APROBADO
              ? "Aprobado"
              : docData?.estadoArchivo === DOC_STATES.PENDIENTE
              ? "Pendiente"
              : docData?.estadoArchivo === DOC_STATES.RECHAZADO
              ? "Rechazado"
              : "No subido"}
          </span>
        </div>
      </h3>

      <ArchivoExpediente
        role={rol}
        expedienteId={expedienteId}
        documentoId={documentoId}
        onChangeState={() => {
          fetchDoc();
          fetchHasFields();
        }}
      />

      {hasFields && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Datos del documento</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                docData?.estadoCampos === DOC_STATES.APROBADO
                  ? "bg-green-100 text-green-800"
                  : docData?.estadoCampos === DOC_STATES.PENDIENTE
                  ? "bg-yellow-100 text-yellow-800"
                  : docData?.estadoCampos === DOC_STATES.RECHAZADO
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {docData?.estadoCampos === DOC_STATES.APROBADO
                ? "Campos aprobados"
                : docData?.estadoCampos === DOC_STATES.PENDIENTE
                ? "Campos pendientes"
                : docData?.estadoCampos === DOC_STATES.RECHAZADO
                ? "Campos rechazados"
                : "Sin datos"}
            </span>
          </div>
          <CamposExpediente
            role={rol}
            expedienteId={expedienteId}
            documentoId={documentoId}
            onChangeState={() => {
              fetchDoc();
              fetchHasFields();
            }}
          />
        </>
      )}

      <NotasExpediente role={rol} expedienteId={expedienteId} />

      {(rol === "rh" || rol === "admin") && (
        <div className="flex space-x-2">
          <button
            onClick={handleApproveAll}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            title="Aprueba el documento y todos sus campos"
          >
            Aprobar Todo
          </button>
          <button
            onClick={handleRejectAll}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            title="Rechaza el documento y todos sus campos"
          >
            Rechazar Todo
          </button>
        </div>
      )}
    </div>
  );
}