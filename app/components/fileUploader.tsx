/**
 * fileUploader.tsx
 *
 * Proporciona un componente de carga de archivos con funcionalidad de arrastrar y soltar.
 *
 * Este componente permite a los usuarios subir archivos PDF a Firebase Storage mediante
 * una interfaz intuitiva de drag & drop o selección de archivos. Maneja la construcción
 * automática de rutas de almacenamiento, actualización de estados en la base de datos
 * y notificación de éxito de carga. Optimizado para documentos de expedientes y contratos.
 */

"use client";
import { useDropzone } from "react-dropzone";
import { ref as storageRef, uploadBytes } from "firebase/storage";
import { ref as dbRef, update, get } from "firebase/database";
import React, { useState, useCallback } from "react";
import { storage, database } from "../../firebaseConfig";
import { Upload } from "lucide-react";

/**
 * Define las propiedades del componente Uploader.
 */
interface UploaderProps {
  /** El ID del expediente al que pertenece el archivo (opcional). */
  expedienteId?: string;

  /** El ID del documento específico dentro del expediente (opcional). */
  documentoId?: string;

  /** Función callback que se ejecuta cuando un archivo se sube exitosamente. */
  onFileUploaded: (fileName: string, snapshot: unknown) => void;

  /** La carpeta base en Firebase Storage (por defecto "pruebaInicial"). */
  folder?: string;

  /** Indica si el archivo es un contrato (cambia la lógica de ruta). */
  contrato?: boolean;
}

/**
 * Renderiza un componente de carga de archivos con interfaz de arrastrar y soltar.
 *
 * Este componente proporciona una zona de drop intuitiva que permite a los usuarios
 * cargar archivos PDF mediante drag & drop o selección manual. Construye automáticamente
 * las rutas de almacenamiento apropiadas según el contexto (expedientes, documentos,
 * contratos), sube los archivos a Firebase Storage y actualiza los estados correspondientes
 * en la base de datos para reflejar el nuevo contenido.
 *
 * @param props - Las propiedades del componente.
 * @param props.expedienteId - ID del expediente contenedor (opcional).
 * @param props.documentoId - ID del documento específico (opcional).
 * @param props.onFileUploaded - Callback ejecutado tras carga exitosa.
 * @param props.folder - Carpeta base en Storage (por defecto "pruebaInicial").
 * @param props.contrato - Si el archivo es un contrato (por defecto false).
 * @returns El elemento JSX que renderiza la zona de carga de archivos.
 *
 * @example
 * ```tsx
 * // Carga de documento de expediente
 * <Uploader
 *   expedienteId="user123"
 *   documentoId="diploma"
 *   onFileUploaded={(fileName) => console.log(`Subido: ${fileName}`)}
 * />
 *
 * // Carga de contrato
 * <Uploader
 *   expedienteId="user123"
 *   contrato={true}
 *   onFileUploaded={(fileName) => handleContractUploaded(fileName)}
 * />
 *
 * // Carga general
 * <Uploader
 *   folder="documentos"
 *   onFileUploaded={handleFileUploaded}
 * />
 * ```
 */
export default function Uploader({
  expedienteId,
  documentoId,
  onFileUploaded,
  folder = "pruebaInicial",
  contrato = false,
}: UploaderProps) {
  /** Estado que indica si hay una carga de archivo en progreso. */
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Maneja el proceso completo de carga de archivos.
   *
   * Esta función ejecuta la secuencia completa de carga:
   * 1. Construye la ruta de almacenamiento según el contexto
   * 2. Sube el archivo a Firebase Storage
   * 3. Actualiza el estado del documento en la base de datos
   * 4. Notifica el éxito mediante el callback
   *
   * @param file - El archivo seleccionado para subir.
   */
  const handleUpload = useCallback(
    async (file: File) => {
      if (!file) return;
      setIsUploading(true);

      try {
        // Construcción de ruta según contexto
        let filePath =
          expedienteId && documentoId
            ? `${folder}/${expedienteId}/${documentoId}/${file.name}`
            : `${folder}/${file.name}`;

        if (contrato) {
          filePath = `${folder}/${expedienteId}/Contratos/${file.name}`;
        }

        // Subida del archivo a Firebase Storage
        const fileReference = storageRef(storage, filePath);
        const snapshot = await uploadBytes(fileReference, file);

        // Actualización del estado en la base de datos
        if (expedienteId && documentoId) {
          const docRef = dbRef(
            database,
            `expedientes/${expedienteId}/documentos/${documentoId}`
          );
          const docSnapshot = await get(docRef);

          if (docSnapshot.exists()) {
            await update(docRef, {
              url: filePath,
              estadoGeneral: "pendiente_de_revisar",
              estadoArchivo: "pendiente_de_revisar",
            });
          } else {
            await update(docRef, {
              url: filePath,
              estado: "pendiente_de_revisar",
              estadoGeneral: "pendiente_de_revisar",
              estadoArchivo: "pendiente_de_revisar",
              campos: {},
            });
          }
        }

        onFileUploaded(file.name, snapshot);
      } catch (error) {
        console.error("Error al subir el archivo", error);
      } finally {
        setIsUploading(false);
      }
    },
    [expedienteId, documentoId, folder, contrato, onFileUploaded]
  );

  /**
   * Maneja los archivos soltados en la zona de drop.
   *
   * Esta función procesa los archivos cuando el usuario los suelta
   * en la zona de carga, tomando solo el primer archivo válido.
   *
   * @param acceptedFiles - Array de archivos aceptados por el dropzone.
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    [handleUpload]
  );

  /** Configuración del hook useDropzone con restricciones de tipo de archivo. */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer ${
        isUploading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="flex flex-col items-center justify-center">
        <div className="bg-[#2d4583] hover:bg-[#08b177] text-white p-4 rounded-full mb-2">
          <Upload size={32} />
        </div>
        {isDragActive ? (
          <p className="text-sm">Suelta el archivo aquí...</p>
        ) : (
          <p className="text-sm">
            Arrastra un archivo PDF aquí o haz clic para seleccionarlo
          </p>
        )}
        {isUploading && (
          <p className="text-gray-500 mt-2">Subiendo archivo...</p>
        )}
      </div>
    </div>
  );
}
