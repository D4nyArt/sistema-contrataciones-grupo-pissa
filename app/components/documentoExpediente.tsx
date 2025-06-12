/**
 * documentoExpediente.tsx
 *
 * Proporciona un componente completo para gestionar documentos individuales dentro de expedientes.
 *
 * Este módulo orquesta la gestión integral de documentos de expedientes, combinando archivos,
 * campos de datos y notas en una interfaz unificada. Permite a candidatos completar su información
 * y al personal de RH revisar, aprobar o rechazar tanto elementos individuales como el documento
 * completo. Incluye seguimiento de estados en tiempo real y acciones masivas de aprobación/rechazo.
 */

import NotasExpediente from "./notasExpediente";
import CamposExpediente from "./camposExpediente";
import ArchivoExpediente from "./archivoExpediente";
import { useState, useEffect } from "react";

/**
 * Define las propiedades del componente DocumentoExpediente.
 */
interface DocProps {
  /** El ID del expediente al que pertenece el documento. */
  expedienteId: string;

  /** El ID específico del documento dentro del expediente. */
  documentoId: string;

  /** El rol del usuario actual (determina permisos de edición y revisión). */
  rol: string;
}

/**
 * Define la estructura de datos de un documento de expediente.
 */
interface DocData {
  /** El nombre descriptivo del documento. */
  nombre: string;

  /** El estado general del documento (calculado a partir de archivos y campos). */
  estadoGeneral: string;

  /** El estado específico del archivo del documento. */
  estadoArchivo: string;

  /** El estado específico de los campos de datos del documento. */
  estadoCampos: string;
}

/**
 * Define los posibles estados de un documento.
 */
type DocState = "aprobado" | "pendiente" | "rechazado" | "no_subido";

/** Mapeo de constantes para los estados de documento. */
const DOC_STATES: Record<string, DocState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

/**
 * Renderiza un componente completo para gestionar documentos individuales de expedientes.
 *
 * Este componente proporciona una interfaz integral que combina la gestión de archivos,
 * campos de datos y notas para un documento específico. Incluye indicadores visuales
 * de estado, funcionalidad diferenciada por rol y acciones masivas para personal de RH.
 * El estado general se calcula dinámicamente basándose en los estados de sus componentes.
 *
 * @param props - Las propiedades del componente.
 * @param props.expedienteId - El ID del expediente contenedor.
 * @param props.documentoId - El ID específico del documento.
 * @param props.rol - El rol del usuario actual que determina los permisos.
 * @returns El elemento JSX que renderiza la gestión completa del documento.
 *
 * @example
 * ```tsx
 * // Para un candidato completando su cédula
 * <DocumentoExpediente
 *   expedienteId="user123"
 *   documentoId="cedula"
 *   rol="candidato"
 * />
 *
 * // Para personal de RH revisando un diploma
 * <DocumentoExpediente
 *   expedienteId="user123"
 *   documentoId="diploma"
 *   rol="rh"
 * />
 * ```
 *
 * @see {@link ArchivoExpediente} - Componente para gestionar archivos del documento
 * @see {@link CamposExpediente} - Componente para gestionar campos de datos del documento
 * @see {@link NotasExpediente} - Componente para gestionar notas del expediente
 */
export default function DocumentoExpediente({
  expedienteId,
  documentoId,
  rol,
}: DocProps) {
  /** Estado que almacena la información completa del documento. */
  const [docData, setDocData] = useState<DocData | undefined>();

  /** Estado que indica si el documento tiene campos de datos configurados. */
  const [hasFields, setHasFields] = useState<boolean>(false);

  /**
   * Obtiene la información actualizada del documento desde el servidor.
   *
   * Esta función consulta la API para recuperar todos los datos del documento,
   * incluyendo su nombre y los estados de archivo, campos y general.
   */
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

  /**
   * Verifica si el documento tiene campos de datos configurados.
   *
   * Esta función consulta la API para determinar si el documento actual
   * tiene campos de datos que requieren ser completados por el candidato.
   */
  const fetchHasFields = async () => {
    if (!expedienteId || !documentoId) return;
    try {
      const res = await fetch(
        `/api/fields?expedienteId=${expedienteId}&documentoId=${documentoId}`
      );
      const data = await res.json();
      setHasFields(
        res.ok && data.fields && Object.keys(data.fields).length > 0
      );
    } catch {
      setHasFields(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    fetchHasFields();
  }, [expedienteId, documentoId]);

  /**
   * Maneja la aprobación masiva de todo el documento.
   *
   * Esta función aprueba tanto el archivo como todos los campos del documento
   * de una sola vez, útil para el personal de RH cuando todo está correcto.
   */
  const handleApproveAll = async (): Promise<void> => {
    if (!expedienteId || !documentoId) return;
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
      fetchDoc();
      fetchHasFields();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Maneja el rechazo masivo de todo el documento.
   *
   * Esta función rechaza tanto el archivo como todos los campos del documento
   * de una sola vez, útil para el personal de RH cuando hay problemas generales.
   */
  const handleRejectAll = async (): Promise<void> => {
    if (!expedienteId || !documentoId) return;
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
      fetchDoc();
      fetchHasFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Indicador de estado general del documento */}
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

      {/* Sección de gestión de archivos */}
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

      {/* Sección de gestión de campos (solo si existen) */}
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

      {/* Sección de notas del expediente */}
      <NotasExpediente role={rol} expedienteId={expedienteId} />

      {/* Botones de acción masiva (solo para RH y admin) */}
      {(rol === "rh" || rol === "admin") && (
        <div className="flex space-x-2 justify-center mt-5">
          <button
            onClick={handleApproveAll}
            className="cursor-pointer px-3 py-1 bg-green-600 text-white text-md rounded hover:bg-green-700 transition-colors"
            title="Aprueba el documento y todos sus campos"
          >
            Aprobar Todo
          </button>
          <button
            onClick={handleRejectAll}
            className="cursor-pointer px-3 py-1 bg-red-600 text-white text-md rounded hover:bg-red-700 transition-colors"
            title="Rechaza el documento y todos sus campos"
          >
            Rechazar Todo
          </button>
        </div>
      )}
    </div>
  );
}
