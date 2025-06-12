/**
 * archivoExpediente.tsx
 *
 * Proporciona un componente para gestionar archivos individuales dentro de expedientes de candidatos.
 *
 * Este módulo permite visualizar, subir, eliminar y revisar archivos de documentos específicos
 * en expedientes. Incluye funcionalidad diferenciada por rol (candidato vs RH), notificaciones
 * automáticas y actualización de estados en tiempo real.
 */

import React, { useEffect, useState } from "react";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import ManagerViewer from "@/app/components/ManagerViewer";
import Uploader from "@/app/components/Uploader";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Define las propiedades del componente ArchivoExpediente.
 */
interface ArchivoExpedienteProps {
  /** El rol del usuario actual (determina los permisos de edición). */
  role: string;

  /** El ID del expediente al que pertenece el documento. */
  expedienteId: string;

  /** El ID del documento específico dentro del expediente. */
  documentoId: string;

  /** Función callback que se ejecuta cuando cambia el estado del archivo. */
  onChangeState: () => void;
}

/**
 * Define la estructura de datos de un archivo.
 */
interface FileData {
  /** El nombre del archivo. */
  nombre: string;

  /** La URL de almacenamiento del archivo. */
  url: string;

  /** El estado actual del archivo (aprobado, pendiente, rechazado, no_subido). */
  estadoArchivo: string;
}

/**
 * Define los posibles estados de un archivo.
 */
type FileState = "aprobado" | "pendiente" | "rechazado" | "no_subido";

/** Mapeo de constantes para los estados de archivo. */
const FILE_STATES: Record<string, FileState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

/**
 * Renderiza un componente para gestionar archivos individuales de expedientes.
 *
 * Este componente proporciona una interfaz completa para manejar archivos de documentos
 * dentro de expedientes de candidatos. Permite diferentes funcionalidades según el rol
 * del usuario: los candidatos pueden subir archivos, mientras que el personal de RH
 * puede revisar, aprobar o rechazar los documentos subidos.
 *
 * @param props - Las propiedades del componente.
 * @param props.role - El rol del usuario actual que determina los permisos.
 * @param props.expedienteId - El ID del expediente contenedor.
 * @param props.documentoId - El ID específico del documento.
 * @param props.onChangeState - Callback ejecutado cuando cambia el estado del archivo.
 * @returns El elemento JSX que renderiza la gestión de archivos.
 *
 * @example
 * ```tsx
 * // Para un candidato subiendo su cédula
 * <ArchivoExpediente
 *   role="candidato"
 *   expedienteId="user123"
 *   documentoId="cedula"
 *   onChangeState={() => refreshExpediente()}
 * />
 *
 * // Para personal de RH revisando documentos
 * <ArchivoExpediente
 *   role="rh"
 *   expedienteId="user123"
 *   documentoId="diploma"
 *   onChangeState={() => updateDocumentList()}
 * />
 * ```
 *
 * @see {@link ManagerViewer} - Componente para visualizar archivos PDF
 * @see {@link Uploader} - Componente para subir archivos al almacenamiento
 */
export default function ArchivoExpediente({
  role,
  expedienteId,
  documentoId,
  onChangeState,
}: ArchivoExpedienteProps) {
  /** Estado que almacena la información del archivo actual. */
  const [fileData, setFileData] = useState<FileData | undefined>();

  /** Determina si el usuario actual puede editar/revisar el archivo. */
  const canEdit = role === "rh";

  /**
   * Obtiene la información actualizada del archivo desde el servidor.
   *
   * Esta función consulta la API para recuperar los datos más recientes
   * del archivo, incluyendo su URL, nombre y estado actual.
   */
  const fetchFile = async () => {
    if (!expedienteId || !documentoId) return;
    try {
      const response = await fetch(
        `/api/fileExpediente?expedienteId=${expedienteId}&documentoId=${documentoId}`
      );

      const data = await response.json();

      if (response.ok) {
        setFileData({
          nombre: data.nombre,
          url: data.url,
          estadoArchivo: data.estadoArchivo,
        });
      } else {
        console.error(
          "Error al obtener la informacion del archivo:",
          data.error
        );
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  useEffect(() => {
    fetchFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId, documentoId]);

  /**
   * Maneja la eliminación de un archivo.
   *
   * Actualiza el estado local y notifica al componente padre sobre el cambio.
   */
  const handleDeleteFile = (): void => {
    // Actualizar el estado local
    fetchFile();
    onChangeState();
  };

  /**
   * Maneja la subida de un nuevo archivo.
   *
   * Actualiza el estado local, notifica al componente padre y envía
   * notificaciones a los revisores correspondientes.
   */
  const handleFileUpload = (): void => {
    // Actualizar el estado local
    fetchFile();
    onChangeState();
    sendNotification();
  };

  /**
   * Maneja la revisión de un archivo por parte del personal de RH.
   *
   * Permite aprobar o rechazar un archivo subido por un candidato,
   * actualizando su estado en la base de datos y mostrando confirmación.
   *
   * @param approved - Indica si el archivo fue aprobado (true) o rechazado (false).
   */
  const handleFileReview = async (approved: boolean) => {
    if (!expedienteId || !documentoId) return;
    const newEstado = approved ? FILE_STATES.APROBADO : FILE_STATES.RECHAZADO;

    // 1) Opcional: optimismo local
    //setFileData(prev => prev && { ...prev, estadoArchivo: newEstado })

    // 2) Persistir por API
    const res = await fetch("/api/fileExpediente", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expedienteId,
        documentoId,
        estadoArchivo: newEstado,
      }),
    });
    if (!res.ok) {
      console.error("Error al revisar documento", await res.json());
      // aquí podrías revertir el estado local si falló
    } else {
      const msg = approved
        ? "El documento ha sido aprobado"
        : "El documento ha sido rechazado";
      alert(msg);
      onChangeState();
    }
  };

  /**
   * Envía notificaciones automáticas cuando se sube un nuevo archivo.
   *
   * Esta función notifica al revisor asignado o a todo el personal de RH
   * cuando un candidato sube un nuevo documento a su expediente.
   */
  const sendNotification = async () => {
    const timestamp = Date.now();
    const revSnap = await get(
      ref(database, `usuarios/${expedienteId}/revisor`)
    );
    const reviewer = revSnap.exists()
      ? (revSnap.val() as string)
      : "sin_revisor";

    let nombre = "";
    let apellido = "";
    let fullName = expedienteId;

    try {
      const userSnap = await get(ref(database, `usuarios/${expedienteId}`));
      if (userSnap.exists()) {
        const userData = userSnap.val() as {
          nombre?: string;
          apellido?: string;
        };
        nombre = userData.nombre ?? "";
        apellido = userData.apellido ?? "";
        fullName = `${nombre} ${apellido}`.trim();
      }
    } catch (error) {
      console.error("Error al obtener el nombre del candidato:", error);
    }

    const message = `El candidato ${fullName} ha subido nuevos archivos en su expediente`;

    if (reviewer === "sin_revisor") {
      // enviar a todos los RH
      const usersSnap = await get(ref(database, "usuarios"));
      if (usersSnap.exists()) {
        const allUsers = usersSnap.val() as Record<string, { rol?: string }>;
        for (const [userId, userData] of Object.entries(allUsers)) {
          if (userData.rol === "rh") {
            await update(
              ref(database, `notificaciones/notificaciones${userId}`),
              {
                [timestamp]: {
                  mensaje: message,
                  leido: false,
                  ruta: `dashboard/${expedienteId}?tab=expediente`,
                  fijado: false,
                },
              }
            );
          }
        }
      }
    } else {
      await update(ref(database, `notificaciones/notificaciones${reviewer}`), {
        [timestamp]: {
          mensaje: message,
          leido: false,
          ruta: `dashboard/${expedienteId}?tab=expedientes`,
          fijado: false,
        },
      });
    }
  };

  if (!fileData) {
    return <div>Cargando documento…</div>;
  }
  return (
    <div>
      {fileData?.url !== "" ? (
        <div>
          <ManagerViewer
            dbPath={`expedientes/expediente${expedienteId}/documentos/${documentoId}`}
            onFileDeleted={handleDeleteFile}
            userRole={role}
          />

          {/* Botones de revisión del archivo solo para admin */}
          {canEdit && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="font-medium mb-2">Revisión del archivo:</h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleFileReview(true)}
                  className={`cursor-pointer flex items-center px-3 py-2 rounded transition-colors ${
                    fileData?.estadoArchivo === FILE_STATES.APPROVED
                      ? "bg-green-200 text-green-800"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <ThumbsUp size={16} className="mr-2" />
                  {fileData?.estadoArchivo === FILE_STATES.APPROVED
                    ? "Aprobado"
                    : "Aprobar"}
                </button>

                <button
                  onClick={() => handleFileReview(false)}
                  className={`cursor-pointer flex items-center px-3 py-2 rounded transition-colors ${
                    fileData?.estadoArchivo === FILE_STATES.REJECTED
                      ? "bg-red-200 text-red-800"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <ThumbsDown size={16} className="mr-2" />
                  {fileData?.estadoArchivo === FILE_STATES.REJECTED
                    ? "Rechazado"
                    : "Rechazar"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          {canEdit ? (
            <>
              <X size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">
                El candidato aún no ha subido este documento
              </p>
            </>
          ) : (
            <>
              <Uploader
                storageUrl={`pruebaInicial/expedientes/expediente${expedienteId}/documentos/${documentoId}`}
                dbPath={`expedientes/expediente${expedienteId}/documentos/${documentoId}`}
                onFileUploaded={async () => {
                  handleFileUpload();
                }}
              />
              <p className="text-gray-500 mt-2">
                Haz clic para subir tu Archivo
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
