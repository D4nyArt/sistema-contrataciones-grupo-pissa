import React, { useEffect, useState } from "react";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";
import ManagerViewer from "@/app/components/ManagerViewer";
import Uploader from "@/app/components/Uploader";
import { get, ref, update } from "firebase/database";
import { database } from "@/firebaseConfig";

interface ArchivoExpedienteProps {
  role: string;
  expedienteId: string;
  documentoId: string;
  onChangeState: () => void;
}

interface FileData {
  nombre: string;
  url: string;
  estadoArchivo: string;
}

type FileState = "aprobado" | "pendiente" | "rechazado" | "no_subido";

const FILE_STATES: Record<string, FileState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

export default function ArchivoExpediente({
  role,
  expedienteId,
  documentoId,
  onChangeState,
}: ArchivoExpedienteProps) {
  const [fileData, setFileData] = useState<FileData | undefined>();
  const canEdit = role === "rh";

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
  }, [expedienteId, documentoId]);

  const handleDeleteFile = (): void => {
    // Actualizar el estado local
    fetchFile();
    onChangeState();
  };

  const handleFileUpload = (): void => {
    // Actualizar el estado local
    fetchFile();
    onChangeState();
    sendNotification();
  };

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

  // Notificaciones
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
        await update(
          ref(database, `notificaciones/notificaciones${reviewer}`),
          {
            [timestamp]: {
              mensaje: message,
              leido: false,
              ruta: `dashboard/${expedienteId}?tab=expedientes`,
              fijado: false,
            },
          }
        );
      
    }
  }

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
                  className={`flex items-center px-3 py-2 rounded transition-colors ${
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
                  className={`flex items-center px-3 py-2 rounded transition-colors ${
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
                onFileUploaded={handleFileUpload}
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
